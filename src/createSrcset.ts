import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { SharpDetails } from './types';
import { createPaths } from './utils';

/**
 * create/write images to folder. Return srcset values.
 * @param sizeDetails image state.
 * @returns creates/writes image, returns srcset imgPath and width.
 */
export default async function createSrcset(
  sharpDetails: SharpDetails
): Promise<{ srcset: string; sharpDetailsFinished: SharpDetails }> {
  const [format, quality = ''] = sharpDetails.currentFormat.split(':') as any;
  sharpDetails.currentFormat = format;

  if (+quality) {
    sharpDetails.quality = +quality;
  }

  // instantiate sharp image.
  let _img = sharp(`${path.join(process.cwd(), sharpDetails.imgPath)}`, {
    animated: sharpDetails.animated,
  });

  // remove transparent parts of image.
  if (sharpDetails.flattenColor || sharpDetails.flatten[0]) {
    // only flatten currentFormat if in flatten list.
    if (sharpDetails.flatten.includes(sharpDetails.currentFormat)) {
      _img.flatten({ background: `#${sharpDetails.flattenColor}` }); // create white background when regions are transparent.
    }
  }

  //
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

  // print state to console
  if (sharpDetails.debug) console.log(sharpDetails);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  await _img.toFile(writePath);
  return { srcset: `${srcPath} ${sharpDetails.desiredWidth}w`, sharpDetailsFinished: sharpDetails };
}
