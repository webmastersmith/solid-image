import createSources from './createSources.js';
import createFallbackImage from './createFallbackImage.js';
import { SharpDetails } from './types.js';

export default async function resolutionSwitching(sharpDetails: SharpDetails) {
  // Track all images created.
  const allWritePaths: string[][] = [];
  // Resolution Switching _sources is an array of 'srcset' strings.
  let { _sources, sharpDetailsFinal } = await createSources(sharpDetails);
  allWritePaths.push(sharpDetailsFinal._writePaths);
  // format gif, no fallback image needed.
  if (sharpDetailsFinal.currentFormat !== 'gif') {
    sharpDetailsFinal = await createFallbackImage(sharpDetails);
    allWritePaths.push(sharpDetailsFinal._writePaths);
  }
  // create the fallback img string and output to console.
  // react = className, solidjs= class
  const classes = sharpDetailsFinal.cssModule
    ? `{Styles.${sharpDetailsFinal.c}}`
    : `"${sharpDetailsFinal.c}"`;
  // style className
  const img = `<img srcset="${_sources.join(', ')}" sizes="${sharpDetailsFinal.sizes}" src="${
    sharpDetailsFinal.srcPath
  }" alt="${sharpDetailsFinal.alt}" ${sharpDetailsFinal.className}=${classes} width="${
    sharpDetailsFinal.desiredWidth
  }" height="${sharpDetailsFinal.desiredHeight}" loading="${sharpDetailsFinal.loading}" />`;

  // output img element to console.
  if (sharpDetailsFinal.print) console.log(`\n${img}\n`);
  return { writePaths: allWritePaths, sharpDetailsFinal, img };
}
