import fs from 'fs';
import path from 'path';
import sharp, { Sharp } from 'sharp';
import { SharpDetails } from './types';

export function updateUrlParams(urls: string | string[] | string[][]): string[] {
  let urlPaths = [];
  // make sure single url is an array.
  if (!Array.isArray(urls)) urls = [urls];

  for (let url of urls) {
    // if inner array is an array, convert to path.
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
 * Image State.
 * @param rawUrl  string
 * @param urls all urls passed to function
 * @returns sharpDetails object
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

  // set defaults if query does not exist.
  const sharpDetails: SharpDetails = {
    alt: o?.alt?.[0] ? o.alt[0] : 'This is a image',
    animated: o?.animated?.[0] === 'true' ? true : false,
    className: o?.c?.[0] ? o.c[0] : 'pic',
    currentFormat: '',
    debug: o?.debug?.[0] === 'true' ? true : false,
    desiredAspect: o?.a?.[0] ? o.a[0] : '',
    desiredHeight: 0,
    desiredWidth: 0,
    enlarge: o?.enlarge?.[0] === 'true' ? true : false,
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
  };
  return sharpDetails;
}

export async function getMetadata(sharpDetails: SharpDetails) {
  const {
    width = 0,
    height = 0,
    format = '',
  } = await sharp(`${path.join(process.cwd(), sharpDetails.imgPath)}`).metadata();
  return { width, height, format };
}

/**
 * When given width / height, find closest aspect ratio.
 * @param val width / height
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
 * When given width and desired aspectRatio, return height.
 * @param desiredWidth desired width of image
 * @param aspectRatio
 * @returns number height to keep aspectRatio as a number.
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
 * If width size and aspect ratio will cause sharp to enlarge image, calculate max width size.
 *       // width and aspect ratio may create height taller than original Image height. Reduce width till height is same size as original image height.
      //get height if height is bigger than orgImage, reduce height by one.
 * @param desiredWidth number. Desired width that you want image to be.
 * @param orgImgWidth number. Original image width.
 * @param orgImgHeight number. Original image height.
 * @param aspect string. AspectRatio as string. ex.. '16:9'
 * @returns object. {resizeWidth, resizeHeight}
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
  return { desiredWidth, desiredHeight };
}

/**
 * Create the paths needed to write images and img src attribute.
 * @param sharpDetails url params
 * @param newImgMeta metadata from newly created image.
 * @returns paths to image.
 */
export function createPaths(sharpDetails: SharpDetails) {
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
  const srcPath = `${folderStructure.replace('public', '').replace('//', '/')}/${name}/${newFileName}`;
  const folderPath = path.join(process.cwd(), folderStructure, name);
  const writePath = path.join(folderPath, newFileName);
  return { newFileName, srcPath, folderPath, writePath };
}
