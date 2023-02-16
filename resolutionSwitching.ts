import createImages from './src/index.js';

// responsive
createImages([
  [
    'public/commercial.jpg',
    // 'w=600;800;900;1000',
    'w=800;500;600',
    'a=9:16',
    // 'f=avif;webp;jpg',
    'f=avif',
    'fallbackWidth=300',
    'fallbackFormat=jpg',
    'alt=Image of house and pool with custom lighting',
    'sizes=100vw',
    'c=electricalImage',
    'media=(max-width: 600px)',
    'enlarge=true',
    // 'debug=true',
    'clean=true',
  ],
]);
