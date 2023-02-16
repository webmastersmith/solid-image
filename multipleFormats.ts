import createImages from './src/index.js';

// Multiple Formats
createImages([
  [
    'public/commercial.jpg',
    'w=800;500;600',
    'f=avif;webp;jpg',
    'fallbackWidth=700',
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
