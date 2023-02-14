import { SharpDetails } from './types';
import { findWidthAndHeight } from './utils';
import createSrcset from './createSrcset';
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
  let sharpDetailsFinal = sharpDetails;
  // record state. Reset to this state value for each format.
  const sharpDetailsDefault = sharpDetails;

  // loop through formats.
  for (const format of sharpDetails.formats) {
    // resetting state with each format.
    sharpDetails = sharpDetailsDefault;
    // Check for accidental semicolon on end of formats. Make sure formats is not just empty by only skipping format if more than 1 and format has falsey value.
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
      if (!srcsets.includes(srcset)) srcsets.push(srcset);

      // if last width, save sharpDetails,
      if (i === sharpDetails.widths.length - 1) {
        // is this a fallback image? Just return new image state.
        if (sharpDetails._fallback) {
          return { _sources: [''], sharpDetailsFinal: sharpDetailsFinished };
        }
        // Resolution Switching
        if (sharpDetailsFinished.formats.length === 1 && sharpDetailsFinished.urls.length === 1) {
          // no other formats, return early.
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
  return { _sources: sources, sharpDetailsFinal };
}
