import { SharpDetails } from './types.js';
import { findWidthAndHeight } from './utils.js';
import createSrcset from './createSrcset.js';
/**
 * Creates the 'source' element and calls all formats/sizes provide from url params.
 * @param _img instance of sharp image.
 * @param sharpDetails object containing url params
 * @param media (min-width: 900px)
 * @param sizes 100vw | (max-width: 320px) 100vw, (max-width: 600px) 50vw, 25vw
 * @returns string. Source element w/ different image formats and srcset pre-filled.
 */
export default async function createSources(
  sharpDetails: SharpDetails
): Promise<{ _sources: string[]; sharpDetailsFinal: SharpDetails }> {
  const sources: string[] = [];
  const writePaths: string[] = [];
  let sharpDetailsFinal = sharpDetails;
  // record state. Reset to this state value for each format.
  const sharpDetailsDefault = sharpDetails;

  // loop through formats.
  for (const format of sharpDetails.formats) {
    // resetting state with each format.
    sharpDetails = sharpDetailsDefault;
    // Check for accidental semicolon on end of formats. If no format is provided, don't skip. Only skip format if more than one format and the format is falsey.
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
        // assign image width and height based on original image or aspect
        findWidthAndHeight(sharpDetails);
      }
      // create & write image. Return image metadata.
      const { srcset, sharpDetailsFinished } = await createSrcset(sharpDetails);

      // check if srcset already exist in array.
      if (!srcsets.includes(srcset)) {
        srcsets.push(srcset);
        // track images created to delete old images in same folder.
        writePaths.push(sharpDetailsFinished.newFileName);
      }

      // if last width, save sharpDetails,
      if (i === sharpDetails.widths.length - 1) {
        // last width, record the write paths.
        sharpDetailsFinished._writePaths = writePaths;
        // is this a fallback image? Only one width and format. No return of sources. Just return new image state.
        if (sharpDetails._fallback) {
          // record the image path.
          return { _sources: [''], sharpDetailsFinal: sharpDetailsFinished };
        }
        // Resolution Switching
        if (sharpDetailsFinished.formats.length === 1 && sharpDetailsFinished.urls.length === 1) {
          // img element. No other formats, return early.
          return { _sources: srcsets, sharpDetailsFinal: sharpDetailsFinished };
        }
        // the last format will be what the sharpDetails state is.
        sharpDetailsFinal = sharpDetailsFinished;
      }
    } // end width loop

    // ART DIRECTION
    let _source: string[] = [];
    _source.push(
      `type="image/${sharpDetailsFinal.currentFormat}" srcset="${srcsets.join(', ')}" sizes="${
        sharpDetailsFinal.sizes
      }"`
    );

    // media queries only used on Art Direction.
    if (sharpDetailsFinal.urls.length > 1 && sharpDetailsFinal.mediaQuery) {
      _source.push(`media="${sharpDetailsFinal.mediaQuery}"`);
    }
    // replace double or more spaces w/ single space.
    const source = `<source ${_source.join(' ')} />`.replace(/\s{2,}/g, ' ');
    // after each format type, push source element into array.
    // insertion order: avif, webp, everything else. Because browser takes first format it understands. Newest formats first.
    if (sharpDetailsFinal.currentFormat === 'avif') {
      sources.unshift(source);
    } else if (sharpDetailsFinal.currentFormat === 'webp') {
      sources.splice(1, 0, source);
    } else {
      sources.push(source);
    }
  } // end outer loop
  // return sources array
  sharpDetailsFinal._writePaths = writePaths;
  return { _sources: sources, sharpDetailsFinal };
}
