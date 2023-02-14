import createSources from './createSources';
import { SharpDetails } from './types';
/**
 * Create default image w/ provided default value and aspectRatio.
 * @param _img instantiated Sharp image.
 * @param sharpDetails url params
 * @returns string. img tag pre-filled with image details.
 */
export default async function createFallbackImage(sharpDetails: SharpDetails): Promise<SharpDetails> {
  // call again for fallback image.
  sharpDetails._fallback = true;
  sharpDetails.widths = [sharpDetails.fallbackWidth];
  sharpDetails.formats = [sharpDetails.fallbackFormat];
  const { sharpDetailsFinal } = await createSources(sharpDetails);
  return sharpDetailsFinal;
}
