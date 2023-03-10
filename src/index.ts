import createSources from './createSources.js';
import createFallbackImage from './createFallbackImage.js';
import resolutionSwitching from './resolutionSwitching.js';
import sharp from 'sharp';
import {
  normalizeUrls,
  parseURL,
  getMetadata,
  countImages,
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
export async function createImages(urls: URLS): Promise<string> {
  // modify url to path[] format.
  const urlPaths = normalizeUrls(urls);

  // if progressBar: false, skip this block.
  if (!/progressBar=false/i.test(urlPaths.join(''))) {
    const barNum = countImages(urlPaths);
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
  let finalReturn = '';

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
      const { writePaths, sharpDetailsFinal, img } = await resolutionSwitching(sharpDetails);
      finalReturn = img;
      // record the write paths under the current folder path.
      sharpDetailsFinal._writePaths = writePaths.flat(Infinity) as string[];
      fillWritePaths(sharpDetailsFinal, allWritePaths);

      // Art Direction or Multiple Formats or Both.
    } else {
      // do this until last url.
      if (i !== urlPaths.length - 1) {
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

        // create the fallback img string and output to console.
        // react = className, solidjs= class
        const classes = sharpDetailsFinal.cssModule
          ? `{styles.${sharpDetailsFinal.c}}`
          : `"${sharpDetailsFinal.c}"`;

        const fallbackImg = `<img src="${sharpDetailsFinal.srcPath}" width="${sharpDetailsFinal.desiredWidth}" height="${sharpDetailsFinal.desiredHeight}" alt="${sharpDetailsFinal.alt}" ${sharpDetailsFinal.className}=${classes} loading="${sharpDetailsFinal.loading}" />`;
        sources.push([fallbackImg]);
        // 2. add picture tag and console.log.
        const pic = `<picture ${sharpDetailsFinal.className}=${classes}>${sources
          .flat(Infinity)
          .join('')}</picture>`;

        // turn off print if desired.
        if (sharpDetailsFinal.print) console.log(`\n${pic}\n`);
        finalReturn = pic;
      }
    } // end Art Direction
  } // end URL loop

  // if deleteOldFiles=true, remove old images.
  if (clean) {
    removeOldFiles(allWritePaths);
  }
  return finalReturn;
}
