export interface SharpDetails {
  alt: string;
  animated: boolean;
  className: string;
  clean: boolean; // delete old image files.
  currentFormat: string; // f = 'avif:50' -format and quality can be combined.
  debug: boolean;
  desiredAspect: string; // aspect
  desiredHeight: number;
  desiredWidth: number;
  enlarge: boolean;
  ext: string;
  _fallback: boolean; // internal use
  fallbackFormat: string; // Format type of fallback image.
  fallbackWidth: number;
  flatten: string[];
  flattenColor: string;
  folderPath: string;
  formats: string[];
  imgPath: string;
  imgName: string;
  loading: string; // eager | lazy
  mediaQuery: string;
  name: string;
  newFileName: string;
  orgHeight: number;
  orgWidth: number;
  quality: number;
  sharpen: boolean; // boolean
  sizes: string;
  srcPath: string;
  url: string;
  urls: string[];
  widths: number[];
  writePath: string;
  _writePaths: string[]; // internal use
}

export type URLS = string | string[] | string[][];
