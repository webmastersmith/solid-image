import createSources from './createSources.js';
import createFallbackImage from './createFallbackImage.js';
import resolutionSwitching from './resolutionSwitching.js';
import sharp from 'sharp';
import {
  updateUrlParams,
  parseURL,
  getMetadata,
  progressBar,
  removeOldFiles,
  fillWritePaths,
} from './utils.js';
import { URLS } from './types.js';
//@ts-ignore
import ProgressBar from 'console-progress-bar';

/**
 * @summary During development, create images, and console.log img/picture element.
 * @param urls image input params.
 * @returns void
 */
export default async function createImages(urls: URLS): Promise<void> {
  // modify url to path[] format.
  const urlPaths = updateUrlParams(urls);

  // if progressBar: false, skip this block.
  if (!/progressBar=false/i.test(urlPaths.join(''))) {
    const barNum = progressBar(urlPaths);
    const bar = new ProgressBar({ maxValue: barNum });
    sharp.queue.on('change', function (queueLength) {
      bar.addValue(1);
    });
  }

  // Global State
  const sources: string[][] = [];
  // track the created file names. compare with folder to see if old images need to be deleted.
  // @ts-ignore
  const allWritePaths = new Map();
  let clean = false;

  // loop all the urls
  for (let [i, urlParams] of urlPaths.entries()) {
    // 1. create Sharp State.
    const sharpDetails = parseURL(urlParams, urlPaths); // details object

    // if any url has clean, delete old image files inside the solid-image created folder.
    if (sharpDetails.clean) clean = true;

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
    if (sharpDetails.formats.length === 1 && sharpDetails.urls.length === 1) {
      const { writePaths, sharpDetailsFinal } = await resolutionSwitching(sharpDetails);
      // record the write paths under the current folder path.
      sharpDetailsFinal._writePaths = writePaths.flat(Infinity) as string[];
      fillWritePaths(sharpDetailsFinal, allWritePaths);

      // Art Direction or Multiple Formats or Both.
    } else {
      // do this until last url.
      if (i !== urls.length - 1) {
        const { _sources, sharpDetailsFinal } = await createSources(sharpDetails);
        sources.push(_sources);
        // record the write paths under the current folder path.
        fillWritePaths(sharpDetailsFinal, allWritePaths);
      } else {
        // last url, make default img tag.
        let { _sources, sharpDetailsFinal } = await createSources(sharpDetails);
        sources.push(_sources);
        // record the write paths under the current folder path.
        fillWritePaths(sharpDetailsFinal, allWritePaths);

        // create fallback image.
        sharpDetailsFinal = await createFallbackImage(sharpDetails);
        // record the write paths under the current folder path.
        fillWritePaths(sharpDetailsFinal, allWritePaths);
        const fallbackImg = `<img src="${sharpDetailsFinal.srcPath}" width="${sharpDetailsFinal.desiredWidth}" height="${sharpDetailsFinal.desiredHeight}" alt="${sharpDetailsFinal.alt}" class={styles.${sharpDetailsFinal.className}} loading="${sharpDetailsFinal.loading}" />`;
        sources.push([fallbackImg]);
        // 2. add picture tag and console.log.
        const pic = `\n<picture class={styles.${sharpDetailsFinal.className}}>${sources
          .flat(Infinity)
          .join('')}</picture>\n`;
        console.log(pic);
      }
    } // end Art Direction
  } // end URL loop

  // if deleteOldFiles=true, remove old images.
  if (clean) {
    removeOldFiles(allWritePaths);
  }
}
