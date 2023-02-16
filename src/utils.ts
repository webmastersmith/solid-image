import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { SharpDetails, URLS } from './types.js';

/**
 * Input urls can be a string, string[], or string[][]. Returns standardized string[].
 * @param urls input url params.
 * @returns urls in an array.
 */
export function updateUrlParams(urls: URLS): string[] {
  let urlPaths = [];
  // make sure single url is an array.
  if (!Array.isArray(urls)) urls = [urls];

  for (let url of urls) {
    // if inner array is an array, convert to urlPath.
    if (Array.isArray(url)) {
      // add query
      const [one, two, ...rest] = url;
      urlPaths.push([one + '?' + two, ...rest].join('&'));
    } else {
      urlPaths.push(url);
    }
  }

  // return an array of urlPaths.
  return urlPaths;
}

/**
 * Count images that will be created. Use the count to build progress bar.
 * @param urls string[]
 * @returns number of images * 2.
 */
export function progressBar(urls: string[]): number {
  let imgNum = 1;

  // count images
  for (const rawUrl of urls) {
    const urlPath = new URL(rawUrl, 'file://');
    // parse url into array of tuples.
    const arr: Array<[string, string[]]> = [];
    for (const [key, value] of urlPath.searchParams) {
      arr.push([key, value.split(';')]);
    }
    // convert array into object.
    const o = Object.fromEntries(arr) as any;
    // remove accidental semi-colon on end.
    let w: number[] = [];
    if (o?.w && o?.w?.length !== 0) {
      for (const width of o.w) {
        if (+width) {
          w.push(+width);
        }
      }
    } else {
      w = [0];
    }
    // remove accidental semi-colon on end.
    let f: string[] = [];
    if (o?.f && o?.f.length !== 0) {
      for (const format of o.f) {
        if (format) {
          f.push(format);
        }
      }
    } else {
      f = [''];
    }
    imgNum += w.length * f.length;
  }
  // sharp change happens twice per image.
  return imgNum * 2;
}

/**
 * Build Sharp image State.
 * @param rawUrl  string
 * @param urls all urls as an array.
 * @returns sharpDetails state object.
 */
export function parseURL(rawUrl: string, urls: string[]): SharpDetails {
  // 'hero.jpg?w=300;600;900&a=9:16&f=avif;jpg;png&sharpen=true&d=700&alt=the dog and the cat'
  const urlPath = new URL(rawUrl, 'file://');
  // parse url into array of tuples.
  const arr: Array<[string, string[]]> = [];
  arr.push(['imgPath', [urlPath.pathname.replace('/', '').trim()]]);
  for (const [key, value] of urlPath.searchParams) {
    arr.push([key, value.split(';')]);
  }
  // convert array into object.
  const o = Object.fromEntries(arr) as any;
  const imgName = o?.imgPath?.[0].split('/').pop() ?? '';
  const [name, ext] = imgName.split('/').pop()?.split('.') as string[];

  // remove accidental semi-colon on end.
  let w: number[] = [];
  if (o?.w && o?.w?.length !== 0) {
    for (const width of o.w) {
      if (+width) {
        w.push(+width);
      }
    }
    // sort widths lowest to highest number
    w.sort((a, b) => a - b);
  } else {
    w = [0];
  }
  // remove accidental semi-colon on end.
  let f: string[] = [];
  if (o?.f && o?.f.length !== 0) {
    for (const format of o.f) {
      if (format) {
        f.push(format);
      }
    }
  } else {
    f = [''];
  }
  // remove accidental semi-colon on end.
  const flatten: string[] = [];
  if (o?.flatten && o?.flatten.length !== 0) {
    for (const format of o.flatten) {
      if (format) {
        flatten.push(format);
      }
    }
  } else {
    flatten.push('');
  }

  // build initial state.
  const sharpDetails: SharpDetails = {
    alt: o?.alt?.[0] ? o.alt[0] : 'This is a image',
    animated: o?.animated?.[0] === 'true' ? true : false,
    className: o?.c?.[0] ? o.c[0] : 'pic',
    clean: o?.clean?.[0] === 'true' ? true : false,
    currentFormat: '',
    debug: o?.debug?.[0] === 'true' ? true : false,
    desiredAspect: o?.a?.[0] ? o.a[0] : '',
    desiredHeight: 0,
    desiredWidth: 0,
    enlarge: o?.enlarge?.[0] === 'false' ? false : true,
    ext,
    _fallback: false, // internal use.
    fallbackFormat: o?.fallbackFormat?.[0] ? o.fallbackFormat[0] : 'jpg',
    fallbackWidth: o?.fallbackWidth?.[0] ? +o.fallbackWidth[0] : 700,
    flatten,
    flattenColor: o?.flattenColor?.[0] ? o.flattenColor[0] : '000000',
    folderPath: '',
    formats: f,
    imgPath: o?.imgPath?.[0] ? o.imgPath[0] : '',
    imgName,
    loading: o?.loading?.[0] === 'eager' ? 'eager' : 'lazy',
    name,
    mediaQuery: o?.media?.[0] ? o.media[0] : '',
    newFileName: '',
    orgWidth: 0,
    orgHeight: 0,
    quality: 0,
    sharpen: o?.sharpen?.[0] === 'true' ? true : false,
    sizes: o?.sizes?.[0] ? o.sizes[0] : '100vw',
    srcPath: '',
    url: rawUrl,
    urls,
    widths: w,
    writePath: '',
    _writePaths: [], // internal use
  };
  return sharpDetails;
}

/**
 * Get original image size and format.
 * @param sharpDetails image state
 * @returns object: width, height, format
 */
export async function getMetadata(sharpDetails: SharpDetails) {
  const {
    width = 0,
    height = 0,
    format = '',
  } = await sharp(`${path.join(process.cwd(), sharpDetails.imgPath)}`).metadata();
  return { width, height, format };
}

/**
 * When given (width / height), find closest aspect ratio.
 * @param val (width / height)
 * @returns  string. ex.. '16:9'
 */
export function findAspectRatio(val: number) {
  const [w, h] = AspectRatio(val, 21);
  return `${w}:${h}`;
  function AspectRatio(val: number, lim: number) {
    var lower = [0, 1];
    var upper = [1, 0];

    while (true) {
      var mediant = [lower[0] + upper[0], lower[1] + upper[1]];

      if (val * mediant[1] > mediant[0]) {
        if (lim < mediant[1]) {
          return upper;
        }
        lower = mediant;
      } else if (val * mediant[1] == mediant[0]) {
        if (lim >= mediant[1]) {
          return mediant;
        }
        if (lower[1] < upper[1]) {
          return lower;
        }
        return upper;
      } else {
        if (lim < mediant[1]) {
          return lower;
        }
        upper = mediant;
      }
    }
  }
}

/**
 *
 * @param orgWidth original image width
 * @param orgHeight original image height
 * @param desiredWidth the width you would like image to be.
 * @param aspectRatio desired aspect ratio image should be. This takes priority over height.
 * @returns height needed to achieve aspect ratio or original image ratio.
 */
export function getHeight(
  orgWidth: number,
  orgHeight: number,
  desiredWidth: number,
  aspectRatio: string
): number {
  if (aspectRatio) {
    const [w, h] = aspectRatio.split(':');
    return Math.round(desiredWidth * (+h / +w));
  }
  // h = orgHeight/orgWidth*desiredWidth
  // w = orgWidth/orgHeight*desiredHeight
  return Math.round((orgHeight / orgWidth) * desiredWidth);
}

/**
 * Determine final image size from width, height, enlarge, and aspect ratio. Aspect ratio controls the height. If no aspect ratio, original image ratio determines the height.
 * @param sharpDetails Sharp image state
 * @returns final image size: width, height
 */
export function findWidthAndHeight(sharpDetails: SharpDetails) {
  let { orgWidth, orgHeight, desiredWidth, desiredAspect } = sharpDetails;

  if (!sharpDetails.enlarge) {
    // avoiding enlargement. Make sure desiredWidth is <= orgWidth
    while (desiredWidth > orgWidth) {
      desiredWidth--;
    }
  }
  let desiredHeight = getHeight(orgWidth, orgHeight, desiredWidth, desiredAspect);

  if (!sharpDetails.enlarge) {
    // avoid height enlargement. Reduce width till desiredHeight is same as original image height.
    while (desiredHeight > orgHeight!) {
      desiredWidth--;
      desiredHeight = getHeight(orgWidth, orgHeight, desiredWidth, desiredAspect);
    }
  }

  sharpDetails.desiredWidth = desiredWidth;
  sharpDetails.desiredHeight = desiredHeight;
  return;
}

/**
 *
 * @param sharpDetails Sharp image state
 * @returns create path and image name.
 */
export function createPaths(sharpDetails: SharpDetails): void {
  const { desiredAspect, desiredHeight, desiredWidth, currentFormat, imgPath, name } = sharpDetails;
  // get folder structure for path.
  const folderStructure = imgPath.split('/').slice(0, -1).join('/');
  // get new image metadata and find aspectRatio.
  let a: string;
  if (desiredAspect) {
    a = desiredAspect.replace(':', '-');
  } else {
    // get ratio from new image width & height
    a = findAspectRatio(desiredWidth / desiredHeight).replace(':', '-');
  }
  const newFileName = `${name}_${a}_${desiredWidth}x${desiredHeight}.${currentFormat}`;
  sharpDetails.newFileName = newFileName;
  sharpDetails.srcPath = `${folderStructure.replace('public', '').replace('//', '/')}/${name}/${newFileName}`;

  const folderPath = path.join(process.cwd(), folderStructure, name);
  sharpDetails.folderPath = folderPath;
  sharpDetails.writePath = path.join(folderPath, newFileName);
  return;
}

/**
 * @summary Separate desired format and desired quality. Update state.
 * @param sharpDetails Sharp image state
 */
export function separateFormatAndQuality(sharpDetails: SharpDetails) {
  const [format, quality = ''] = sharpDetails.currentFormat.split(':');
  sharpDetails.currentFormat = format;

  if (+quality) {
    sharpDetails.quality = +quality;
  }
}

/**
 * @summary Remove old files not created.
 * @param sharpDetails Sharp State
 * @param newFiles list of all files created.
 */
export function removeOldFiles(allWritePaths: Map<string, string[]>) {
  // loop each folder path, compare newImages with folder files.
  for (const writePath of allWritePaths) {
    // writePath: [ string, string[][] ]
    const folderPath = writePath[0];
    const newImageFiles = writePath[1].flat(Infinity);
    // for each path get files in folder and compare
    const files = fs.readdirSync(folderPath);
    // loop files
    for (const file of files) {
      // name does not exist in new files array. delete.
      if (!newImageFiles.includes(file)) {
        const d = path.join(folderPath, file);
        fs.unlinkSync(d);
        console.log('Deleted: ', d);
      }
    }
  }
}

export function fillWritePaths(sharpDetails: SharpDetails, allWritePaths: Map<string, string[]>) {
  // track all image paths and what's in them.
  if (allWritePaths.has(sharpDetails.folderPath)) {
    // @ts-ignore. Get the array then push into path array.
    allWritePaths.get(sharpDetails.folderPath).push(sharpDetails._writePaths);
    // else, path does not exist.
  } else {
    allWritePaths.set(sharpDetails.folderPath, sharpDetails._writePaths);
  }
}
