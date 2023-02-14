import { updateUrlParams, parseURL, getMetadata } from './utils.js';
import createSources from './createSources.js';
import createFallbackImage from './createFallbackImage.js';
import resolutionSwitching from './resolutionSwitching.js';

/**
 * During development, create images, and console.log img/picture element.
 * @param urls string[] of urls.
 * @returns void
 */
export default async function createImages(urls: string | string[] | string[][]): Promise<void> {
  // modify url to path[] format.
  const urlPaths = updateUrlParams(urls);

  // console.log(process.argv.slice(2));

  const sources: string[][] = [];
  // loop all the urls
  for (let [i, urlParams] of urlPaths.entries()) {
    // 1. create/write image for each url, return state to build html img/picture element.
    const sharpDetails = parseURL(urlParams, urlPaths); // details object

    // get original image width, height and metadata format.
    const { width = 0, height = 0, format = '' } = await getMetadata(sharpDetails);
    sharpDetails.orgWidth = width;
    sharpDetails.orgHeight = height;

    // if image metadata format exist use it else use the one from the file name.
    if (format) {
      sharpDetails.ext = format;
    }

    // BUILD IMAGE
    // RESOLUTION SWITCHING.
    if (sharpDetails.formats.length <= 1 && sharpDetails.urls.length === 1) {
      await resolutionSwitching(sharpDetails);
      // end early.
      return;
      // Art Direction or Multiple Formats or Both.
    } else {
      // do this until last url.
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
