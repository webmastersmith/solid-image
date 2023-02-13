import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

(async function () {
  await createImages('your image url here');
})();

/**
 * During development, create images, and console.log img/picture element.
 * @param urls string[] of urls.
 * @returns void
 */
async function createImages(urls: string | string[] | string[][]): Promise<void> {
  // make sure url is an array.
  if (!Array.isArray(urls)) urls = [urls];
  for (let [i, urlParams] of urls.entries()) {
    // if inner array is an array, convert to path.
    if (Array.isArray(urlParams)) {
      // add query
      const [one, two, ...rest] = urlParams;
      urlParams = [one + '?' + two, ...rest].join('&');
    }

    // 1. create/write image for each url, return state to build html img/picture element.
    const sources: string[][] = [];
    const sharpDetails = parseURL(urlParams, urls); // details object
    // get original image width, height and metadata format.
    const {
      width = 0,
      height = 0,
      format = '',
    } = await sharp(`${path.join(process.cwd(), sharpDetails.imgPath)}`).metadata();
    sharpDetails.orgWidth = width;
    sharpDetails.orgHeight = height;
    // if image metadata format exist use it else use the one from the file name.
    if (format) {
      sharpDetails.ext = format;
    }

    // BUILD IMAGE
    // RESOLUTION SWITCHING.
    if (sharpDetails.formats.length === 1 && sharpDetails.urls.length === 1) {
      // Resolution Switching _sources is an array of 'srcset' strings.
      let { _sources, sharpDetailsFinal } = await createSources(sharpDetails);
      // format gif, no jpg backup needed.
      if (sharpDetailsFinal.currentFormat !== 'gif') {
        sharpDetailsFinal = await createFallbackImage(sharpDetails);
      }
      // call again for fallback image.
      const img = `<img srcset="${_sources.join(', ')}" sizes="${sharpDetailsFinal.sizes}" src="${
        sharpDetailsFinal.srcPath
      }" alt="${sharpDetailsFinal.alt}" class={styles.${sharpDetailsFinal.className}}/>`;
      console.log(img);
      return;

      // Art Direction or Multiple Formats or Both.
    } else {
      if (i !== urls.length - 1) {
        const { _sources } = await createSources(sharpDetails);
        sources.push(_sources);
      } else {
        // last url, make default img tag.
        const { _sources } = await createSources(sharpDetails);
        sources.push(_sources);
        // create jpg fallback image.
        const sharpDetailsFinal = await createFallbackImage(sharpDetails);
        // create fallback image.
        const fallbackImg = `<img src="${sharpDetailsFinal.srcPath}" width="${sharpDetailsFinal.desiredWidth}" height="${sharpDetailsFinal.desiredHeight}" alt="${sharpDetailsFinal.alt}" class={styles.${sharpDetailsFinal.className}} />`;
        sources.push([fallbackImg]);
        // 2. add picture tag and console.log.
        const pic = `<picture class={styles.${sharpDetailsFinal.className}}>${sources
          .flat(Infinity)
          .join('')}</picture>`;
        console.log(pic);
        return;
      }
    }
  }
}

// UTILS
export interface SharpDetails {
  alt: string;
  animated: boolean;
  className: string;
  currentFormat: string; // f = 'avif:50' -format and quality can be combined.
  desiredAspect: string; // aspect
  desiredHeight: number;
  desiredWidth: number;
  ext: string;
  _fallback: boolean; // internal use
  fallbackFormat: string; // Format type of fallback image.
  fallbackWidth: number; // boolean as string -default -size of default image.
  flatten: string[];
  flattenColor: string;
  folderPath: string;
  formats: string[];
  imgPath: string;
  imgName: string;
  mediaQuery: string;
  name: string;
  newFileName: string;
  orgHeight: number;
  orgWidth: number;
  quality: number;
  sharpen: boolean; // boolean as string
  sizes: string;
  srcPath: string;
  url: string;
  urls: string[];
  widths: number[];
  writePath: string;
}

/**
 * Image State.
 * @param rawUrl  string
 * @param urls all urls passed to function
 * @returns sharpDetails object
 */
export function parseURL(rawUrl: string, urls: any[]) {
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
    animated: o?.animated?.[0] ? !!o.animated[0] : false,
    className: o?.c?.[0] ? o.c[0] : 'pic',
    currentFormat: '',
    desiredAspect: o?.a?.[0] ? o.a[0] : '',
    desiredHeight: 0,
    desiredWidth: 0,
    ext,
    _fallback: false,
    fallbackFormat: o?.fallbackFormat?.[0] ? o.fallbackFormat[0] : 'jpg',
    fallbackWidth: o?.fallbackFormat?.[0] ? +o.fallbackFormat[0] : 700,
    flatten,
    flattenColor: o?.flattenColor?.[0] ? o.flattenColor[0] : '',
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
 * Creates the 'source' element and calls all formats/sizes provide from url params.
 * @param _img instance of sharp image.
 * @param sharpDetails object containing url params
 * @param media (min-width: 900px)
 * @param sizes 100vw | (max-width: 320px) 100vw, (max-width: 600px) 50vw, 25vw
 * @returns string. Source element w/ different image formats and srcset pre-filled.
 */
export async function createSources(
  sharpDetails: SharpDetails
): Promise<{ _sources: string[]; sharpDetailsFinal: SharpDetails }> {
  const sources: string[] = [];
  let sharpDetailsFinal = sharpDetails;

  for (const format of sharpDetails.formats) {
    // skip format if more than 1 and format has falsey value.
    if (sharpDetails.formats.length > 1 && !format) continue;
    // if only one format provided is falsey, assign original image format.
    if (sharpDetails.formats.length === 1 && !format) {
      sharpDetails.currentFormat = sharpDetails.ext;
    } else {
      // else assign format from url.
      sharpDetails.currentFormat = format;
    }

    const srcsets: string[] = [];

    // create all widths for each format.
    for await (const [i, width] of sharpDetails.widths.entries()) {
      // if width falsey and no aspect provided, give back image same size.
      if (!width && !sharpDetails.desiredAspect) {
        sharpDetails.desiredWidth = sharpDetails.orgWidth;
        sharpDetails.desiredHeight = sharpDetails.orgHeight;
      } else {
        sharpDetails.desiredWidth = width;
        const { desiredWidth, desiredHeight } = findWidthAndHeight(sharpDetails);
        sharpDetails.desiredWidth = desiredWidth;
        sharpDetails.desiredHeight = desiredHeight;
      }
      // create & write image. Return image metadata.
      const { srcset, sharpDetailsFinished } = await createSrcset(sharpDetails);

      // check if srcset already exist in array.
      if (srcsets.includes(srcset)) continue;
      srcsets.push(srcset);

      // on last loop
      if (i === sharpDetails.widths.length - 1) {
        // the last loop will be what the sharpDetails info is.
        sharpDetailsFinal = sharpDetailsFinished;
        // is this a fallback image?
        if (sharpDetails._fallback) {
          return { _sources: [''], sharpDetailsFinal: sharpDetailsFinished };
        }

        // Resolution Switching
        if (sharpDetailsFinished.formats.length === 1 && sharpDetailsFinished.urls.length === 1) {
          console.log('Resolution Switching');
          // can use Resolution Switching
          return { _sources: srcsets, sharpDetailsFinal: sharpDetailsFinished };
        }
      }
    } // end width loop

    // ART DIRECTION
    let _source: string[] = [];
    _source.push(
      `type="image/${sharpDetailsFinal?.currentFormat}" srcset="${srcsets.join(', ')}" sizes="${
        sharpDetailsFinal?.sizes
      }"`
    );

    // media queries only used on Art Direction.
    if (sharpDetailsFinal?.urls?.length > 1 && sharpDetailsFinal?.mediaQuery) {
      _source.push(`media="${sharpDetailsFinal?.mediaQuery}"`);
    }
    // replace double or more spaces w/ single space.
    const source = `<source ${_source.join(' ')} />`.replace(/\s{2,}/g, ' ');
    // after each format type, push source element into array.
    // insertion order: avif, webp, everything else. Because browser takes first thing it understands. Newest formats first.
    if (sharpDetailsFinal.currentFormat === 'avif') {
      sources.unshift(source);
    } else if (sharpDetailsFinal.currentFormat === 'webp') {
      sources.splice(1, 0, source);
    } else {
      sources.push(source);
    }
  } // end outer loop
  // return sources array
  return { _sources: sources, sharpDetailsFinal };
}

/**
 * create/write images to folder. Return srcset values.
 * @param _img sharp image instance
 * @param sizeDetails url params
 * @returns creates/writes image, returns srcset imgPath and width.
 */
export async function createSrcset(
  sharpDetails: SharpDetails
): Promise<{ srcset: string; sharpDetailsFinished: SharpDetails }> {
  const [format, quality = ''] = sharpDetails.currentFormat.split(':') as any;
  sharpDetails.currentFormat = format;

  if (+quality) {
    const q = +quality;
    sharpDetails.quality = q;
  }

  // instantiate sharp image.
  let _img = sharp(`${path.join(process.cwd(), sharpDetails.imgPath)}`, {
    animated: sharpDetails.animated,
  });

  // remove transparent parts of image.
  if (sharpDetails.flattenColor) {
    if (sharpDetails.flatten.includes(sharpDetails.currentFormat)) {
      _img.flatten({ background: `#${sharpDetails.flattenColor}` }); // create white background when regions are transparent.
    }
  }

  // if jpeg use mozjpeg.
  if (sharpDetails.currentFormat === 'jpeg' || sharpDetails.currentFormat === 'jpg') {
    if (sharpDetails.quality) {
      _img.toFormat(sharpDetails.currentFormat, { mozjpeg: true, quality: sharpDetails.quality });
    } else {
      _img.toFormat(sharpDetails.currentFormat, { mozjpeg: true });
    }
  } else if (sharpDetails.currentFormat === 'gif') {
    if (sharpDetails.quality) {
      _img.toFormat(sharpDetails.currentFormat, { reoptimise: true, colors: sharpDetails.quality });
    } else {
      _img.toFormat(sharpDetails.currentFormat, { reoptimise: true });
    }
  } else if (
    sharpDetails.currentFormat === 'png' ||
    sharpDetails.currentFormat === 'webp' ||
    sharpDetails.currentFormat === 'avif' ||
    sharpDetails.currentFormat === 'svg' ||
    sharpDetails.currentFormat === 'tiff'
  ) {
    if (sharpDetails.quality) {
      _img.toFormat(sharpDetails.currentFormat, { quality: sharpDetails.quality });
    } else {
      _img.toFormat(sharpDetails.currentFormat);
    }
  }

  // check for width or height change.
  if (
    sharpDetails.desiredWidth !== sharpDetails.orgWidth ||
    sharpDetails.desiredHeight !== sharpDetails.orgHeight
  ) {
    _img.resize(sharpDetails.desiredWidth, sharpDetails.desiredHeight);
  }

  if (sharpDetails.sharpen) {
    _img.sharpen({
      sigma: 2,
      m1: 0,
      m2: 3,
      x1: 3,
      y2: 15,
      y3: 15,
    });
  }

  // find path to write image.
  const { newFileName, srcPath, folderPath, writePath } = createPaths(sharpDetails);
  sharpDetails.srcPath = srcPath;
  sharpDetails.newFileName = newFileName;
  sharpDetails.folderPath = folderPath;
  sharpDetails.writePath = writePath;

  console.log(sharpDetails);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  await _img.toFile(writePath);
  return { srcset: `${srcPath} ${sharpDetails.desiredWidth}w`, sharpDetailsFinished: sharpDetails };
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
function findWidthAndHeight(sharpDetails: SharpDetails) {
  let { orgWidth, orgHeight, desiredWidth, desiredAspect } = sharpDetails;
  // avoiding enlargement. Make sure desiredWidth is <= orgWidth
  while (desiredWidth > orgWidth) {
    desiredWidth--;
  }
  let desiredHeight = getHeight(orgWidth, orgHeight, desiredWidth, desiredAspect);
  // avoid height enlargement. Reduce width till desiredHeight is same as original image height.
  while (desiredHeight > orgHeight!) {
    desiredWidth--;
    desiredHeight = getHeight(orgWidth, orgHeight, desiredWidth, desiredAspect);
  }
  return { desiredWidth, desiredHeight };
}

/**
 * Create default image w/ provided default value and aspectRatio.
 * @param _img instantiated Sharp image.
 * @param sharpDetails url params
 * @returns string. img tag pre-filled with image details.
 */
export async function createFallbackImage(sharpDetails: SharpDetails): Promise<SharpDetails> {
  // call again for fallback image.
  sharpDetails._fallback = true;
  sharpDetails.widths = [sharpDetails.fallbackWidth];
  sharpDetails.formats = [sharpDetails.fallbackFormat];
  const { sharpDetailsFinal } = await createSources(sharpDetails);
  return sharpDetailsFinal;
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
