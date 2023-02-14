import createSources from './createSources.js';
import createFallbackImage from './createFallbackImage.js';
import { SharpDetails } from './types.js';

export default async function resolutionSwitching(sharpDetails: SharpDetails) {
  // Resolution Switching _sources is an array of 'srcset' strings.
  let { _sources, sharpDetailsFinal } = await createSources(sharpDetails);
  // format gif, no jpg backup needed.
  if (sharpDetailsFinal.currentFormat !== 'gif') {
    sharpDetailsFinal = await createFallbackImage(sharpDetails);
  }
  // call again for fallback image.
  const img = `<img srcset="${_sources.join(', ')}" sizes="${sharpDetailsFinal.sizes}" src="${
    sharpDetailsFinal.srcPath
  }" alt="${sharpDetailsFinal.alt}" class={styles.${sharpDetailsFinal.className}} loading="${
    sharpDetailsFinal.lazy
  }"/>`;
  console.log(img);
  return;
}
