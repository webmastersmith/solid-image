# Solid-Image

### What it does?

With url or array syntax, you can quickly make responsive images, and the HTML img/picture element code will be output to the console. Library agnostic.

### Why

Responsive images can be complex and error prone. For instance, if you want resolution switching, `<img srcset="..."` and you accidentally forget the [`sizes` attribute, the browser will ignore `srcset` and use the fallback `src` attribute.](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/srcset) The `media` attribute [should only be used with Art Direction.](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images#art_direction) There are many more small "gotcha's" that can be avoided by automation.

I built this to use with SolidStart meta framework. Until they can get a native image library established.
Inspired by: [Jonas Kruckenberg: imagetools](https://github.com/JonasKruckenberg/imagetools)

- Unfortunately I could not get his wonderful library to do what I wanted: create static images and raw code at develop time.
- imagetools embedded JS code at build time, (possibly because I don't know what I'm doing 😁).
  - If the img/picture element is not available when the HTMl is loaded, then the browser may download the wrong images. This defeats the purpose of responsive images.

## Using Vite?

- [vite-plugin-solid-image](https://www.npmjs.com/package/vite-plugin-solid-image)

## Install & Run:

This will only create one img/picture element at a time. For art direction you can use multiple urls and the media attribute.

1. **Install**
   1. `npm i -D solid-image`
2. Create a Javascript file in the `root` directory. ex.. `images.js`
   1. This library uses modern import/export syntax. You will need:
      1. `"type": "module"` in your package.json // **or**
      2. `YourFileName.mjs` // name your file with a `mjs` extension.
   2. **Note: Your folder or image file names cannot have spaces.**
   3. The shortest url: `public/yourImage.jpg?` // must have the `?` on the end.
3. Add the following code.

```js
import { createImages } from 'solid-image';
createImages('see url examples below 👇');
```

4. **Run:**
   1. `node YourFileName.js`
5. The images will be created in the same directory the source image is in.
   1. A folder will be created with the same name as the image.
   2. The images will be created inside this new folder.
   3. The HTML img/picture element code will be output to console.

## Understanding Resolutions Switching, Multiple Formats, Art Direction

**Resolution Switching**

- uses the `img` element.
- **Pros**
  - The most performant. The browser downloads the HTML first. With the `sizes` attribute, the browser deicides what image it wants from the `srcset` attribute and starts downloading. This happens before other assets are downloaded.
- **Cons**
  - only one image format can be used.
  - if you forget the `sizes` attribute, `srcset` is ignored.

```html
<img srcset="image-1.jpg w500, image-2.jpg w1000" sizes="100vw" src="image-1.jpg" alt="my image" />
```

**Multiple Formats**

- uses the `picture` element.
- **Pros**
  - Allows the use of new and highly optimized image formats, and fallback formats for browsers that don't support newer formats.
- **Cons**
  - code is complex and easy to get wrong.
  - order matters. Browser takes the first truthy value.

```html
<!-- browser takes first format it understands. Add newest type first.  -->
<picture>
  <source srcset="image-1.avif 500w, image-2.avif 1000w" type="image/avif" sizes="100px" />
  <source srcset="image-1.webp 500w, image-2.webp 1000w" type="image/webp" sizes="100px" />
  <source srcset="image-1.png 500w, image-2.png 1000w" type="image/png" sizes="100px" />
  <img src="image-1.png" alt="Human" loading="lazy" width="500" height="836" />
</picture>
```

**Art Direction**

- uses the `picture` element.
- **Pros**
  - Switch image based on different devices screen size.
  - Can also use multiple formats.
- **Cons**
  - This can be the most complex code.
  - order matters. Browser takes the first truthy value.
  - must use the `media` attribute.

```html
<!-- browser takes first format it understands and first truthy media condition  -->
<picture>
  <!-- aspect ratio 9:16 -->
  <source media="(max-width: 799px)" type="image/avif" srcset="image-1_aspect_9-16.avif w500" />
  <source media="(max-width: 799px)" type="image/jpg" srcset="image-1_aspect_9-16.jpg w500" />
  <!-- aspect ratio 16:9 -->
  <source media="(min-width: 800px)" type="image/avif" srcset="image-1_aspect_16-9.avif w500" />
  <source media="(min-width: 800px)" type="image/jpg" srcset="image-1_aspect_16-9.jpg w500" />
  <img src="image.jpg" alt="my image" />
</picture>
```

## URL Options

- **a** = aspect ratio. Crop image from center, to create desired aspect ratio. ex..`a=16:9`
  - If aspect is not provided, output image will be same aspect as input image.
  - If `enlarge=false`, image width will be reduced to maintain aspect ratio until 'height' is same size or smaller than original image height.
- **alt** = img element `alt` attribute text. ex.. `alt=my image`.
  - default: "This is a image"
  - The last url must have the `alt=...` for the fallback image.
- **animated** = ex.. `animated=true`
  - default: false.
  - Used with gif, webp, avif. Keep the animation when changing formats.
  - Currently the Sharp library will only convert animated gif's to gif or webp format correctly.
  - Animated gif's to avif format does not work correctly.
- **c** = class names to add to img/picture element. ex.. `c=heroImage`
  - default: ''.
  - The **last url** will control the fallbackWidth, fallbackFormat, cssModule, classes, className.
  - If `cssModule=true`, you can only have one class name.
  - **tailwind**
    - `c=bg-green-300 m-4 rounded !font-medium basis-1/4`
- **className** = class or className. Should your class be called className? ex.. `className=false`
  - default true. _the css class will be called 'className'_
  - The **last url** will control the fallbackWidth, fallbackFormat, cssModule, classes, className.
- **clean** = delete old images inside the solid-image folder. ex.. `clean=true`
  - Be careful! All old files inside the solid-image created folder will be deleted.
  - default: false.
- **cssModule** = css module? ex.. `cssModule=true`
  - default: false
  - The **last url** will control the fallbackWidth, fallbackFormat, cssModule, classes, className.
  - `cssModule=true`
    - `className={Styles.class1}` // only one class name for css module.
  - `cssModule=false`
    - `className="class1 class2"` // can have multiple class names.- **debug** = print to console Sharp 'state' after each image creation. `debug=true`
  - default: false
- **enlarge** = allow image size to grow beyond original image size to create desired aspect ratio or desired width. `enlarge=false`
  - default: true.
- **f** = format types. Can also include quality to reduce image. ex.. `f=avif:50;webp:80;jpg;png:100`.
  - Sharp defaults are used if you leave off quality. ex.. `f=avif;webp;jpg`
  - Supported formats: `heif,avif,jpeg,jpg,png,tiff,webp,gif`.
  - Gif images: The quality represents the number of colors between 1-256. ex.. `gif:3`
    - original gif image colors are used if you leave quality off.
    - gif will only have 3 colors. This is a good way to reduce gif image size.
- **fallbackWidth** = width of fallback image. ex.. `fallbackWidth=700`
  - default: 700px wide.
  - The **last url** will control the fallbackWidth, fallbackFormat, cssModule, classes, className.
  - Fallback Image is created in same directory as last url.
- **fallbackFormat** = format you want fallback image to be. ex.. `fallbackFormat=jpg`
  - default: jpg.
  - The **last url** will control the fallbackWidth, fallbackFormat, cssModule, classes, className.
- **flatten** = formats you want flatten transparent regions. ex.. `flatten=jpg;webp`.
  - default: ''. // empty.
- **flattenColor** = hex color code format. The background color for transparent regions. ex.. `flattenColor=FFFFFF`.
  - default: black.
- **loading** = image loading attribute. Two options: 'eager' | 'lazy' ex.. `loading=eager`.
  - default: 'lazy'.
- **media** = Art Direction only. ex.. `media=(min-width: 900px)`.
  - default: ''.
- **print** = print `img | picture` element to console.log. ex.. `print=false`
  - default: true _// vite-plugin-solid-image default: false_.
- **progressBar** = show progress bar while running. ex.. `progressBar=false`
  - default: true _// vite-plugin-solid-image default: false_.
- **sharpen** = sharpen image. This process does increases the image size. ex.. `sharpen=true`.
  - default: false.
- **sizes** = All responsive images need the `sizes` attribute.
  - default: `100vw`
  - ex.. `sizes=((min-width: 50em) and (max-width: 60em)) 50em, 20em`.
- **w** = width of images. ex.. `w=600;800;1000`
  - If width is not provided, output image will be same size as input image.

## Examples

### URL Examples

**YourFileName.js**

```ts
import { createImages } from 'solid-image';

createImages('public/hero/hero.jpg?w=300;600;900&f=avif;webp;jpg&sharpen=true&alt=my image');
// or
createImages([
  'public/hero/hero.jpg?a=9:16w=300;600;900&f=avif;webp;jpg&sharpen=true&alt=my image',
  'public/hero/hero.jpg?a=16:9w=300;600;900&f=avif;webp;jpg&sharpen=true&alt=my image'
])
// or
createImages([
  [
    'public/hero/hero.jpg', // first item must be image path.
    'a=9:16',
    'w=300;600;900',
    'f=avif;webp;jpg',
    'sharpen=true'
    'alt=my image',
  ],
  [
    'public/hero/hero.jpg', // can be same image, different aspectRatio or different image.
    'a=16:9',
    'w=300;600;900',
    'f=avif;webp;jpg',
    'sharpen=true'
    'alt=my image',
  ]
])
```

### Resolution Switching Example

- single url
- single format
- multiple widths

**YourFileName.js**

```js
import { createImages } from 'solid-image';
createImages(
  'public/header/logo/bolt.gif?w=25;55&f=gif:4&animated=true&sizes=62px&c=bolt&alt=lighting bolt image'
);
// or
createImages([
  //must be nested array.
  [
    'public/header/logo/bolt.gif',
    'w=25;55',
    'f=gif:4',
    'animated=true',
    'sizes=62px',
    'c=bolt',
    'alt=lighting bolt image',
  ],
]);
```

**YourComponent.tsx**

```tsx
import Styles from './Logo.module.scss';

export default function Logo(props: any) {
  return (
    <img
      srcset="/header/logo/bolt/bolt_2-3_25x37.gif 25w, /header/logo/bolt/bolt_2-3_55x81.gif 55w"
      sizes="62px"
      src="/header/logo/bolt/bolt_2-3_55x81.gif"
      alt="lighting bolt image"
      class={Styles.bolt}
      width="55"
      height="81"
      loading="lazy"
    />
  );
}
```

### Multiple Formats Example

- single url
- multiple formats
- mutiple widths

**YourFileName.js**

```js
import { createImages } from 'solid-image';
// w=300. Original image is 265w x 253h. Image will be enlarged.
createImages(
  'public/header/texasFlag.png?w=100;200;300&f=png;avif;webp&fallbackWidth=100&alt=Image of Texas Flag&sizes=100px&c=texasImage&sharpen=true'
);
```

**YourComponent.tsx**

```tsx
import Styles from './TexasImage.module.scss';

export default function TexasImage() {
  return (
    <picture class={Styles.texasImage}>
      <source
        type="image/avif"
        srcset="/header/texasFlag/texasFlag_20-19_100x95.avif 100w, /header/texasFlag/texasFlag_22-21_200x191.avif 200w, /header/texasFlag/texasFlag_22-21_265x253.avif 265w"
        sizes="100px"
      />
      <source
        type="image/webp"
        srcset="/header/texasFlag/texasFlag_20-19_100x95.webp 100w, /header/texasFlag/texasFlag_22-21_200x191.webp 200w, /header/texasFlag/texasFlag_22-21_265x253.webp 265w"
        sizes="100px"
      />
      <source
        type="image/png"
        srcset="/header/texasFlag/texasFlag_20-19_100x95.png 100w, /header/texasFlag/texasFlag_22-21_200x191.png 200w, /header/texasFlag/texasFlag_22-21_265x253.png 265w"
        sizes="100px"
      />
      <img
        src="/header/texasFlag/texasFlag_20-19_100x95.png"
        width="100"
        height="95"
        alt="Image of Texas Flag"
        class={Styles.texasImage}
        loading="lazy"
      />
    </picture>
  );
}
```

### Art Direction Example

- multiple urls
- multiple image formats
- multiple widths

**YourFileName.js**

```js
import { createImages } from 'solid-image';
createImages([
  [
    'public/hero/hero-full.jpg',
    'w=600;800;1200;2400',
    'a=9:16',
    'f=avif;webp;jpg',
    'alt=Image of house and pool with custom lighting',
    'sizes=100vw',
    'c=heroImage',
    'media=(max-width: 600px)',
  ],
  // fallback info comes from last url.
  [
    'public/hero/hero.jpg',
    'w=600;800;1200;2400',
    'a=16:9',
    'f=avif;webp;jpg',
    'fallbackWidth=700',
    'fallbackFormat=jpg',
    'alt=Image of house and pool with custom lighting',
    'sizes=100vw',
    'c=heroImage',
    'media=(min-width: 601px)',
    'sharpen=true',
    'loading=eager',
  ],
]);
```

**YourComponent.tsx**

```tsx
import Styles from './HeroImage.module.scss';

export default function HeroImage() {
  return (
    <picture class={Styles.heroImage}>
      <source
        type="image/avif"
        srcset="/hero/hero-full/hero-full_9-16_600x1067.avif 600w, /hero/hero-full/hero-full_9-16_800x1422.avif 800w, /hero/hero-full/hero-full_9-16_900x1600.avif 900w"
        sizes="100vw"
        media="(max-width: 600px)"
      />
      <source
        type="image/webp"
        srcset="/hero/hero-full/hero-full_9-16_600x1067.webp 600w, /hero/hero-full/hero-full_9-16_800x1422.webp 800w, /hero/hero-full/hero-full_9-16_900x1600.webp 900w"
        sizes="100vw"
        media="(max-width: 600px)"
      />
      <source
        type="image/jpg"
        srcset="/hero/hero-full/hero-full_9-16_600x1067.jpg 600w, /hero/hero-full/hero-full_9-16_800x1422.jpg 800w, /hero/hero-full/hero-full_9-16_900x1600.jpg 900w"
        sizes="100vw"
        media="(max-width: 600px)"
      />
      <source
        type="image/avif"
        srcset="/hero/hero/hero_16-9_600x338.avif 600w, /hero/hero/hero_16-9_800x450.avif 800w, /hero/hero/hero_16-9_1200x675.avif 1200w, /hero/hero/hero_16-9_2400x1350.avif 2400w"
        sizes="100vw"
        media="(min-width: 601px)"
      />
      <source
        type="image/webp"
        srcset="/hero/hero/hero_16-9_600x338.webp 600w, /hero/hero/hero_16-9_800x450.webp 800w, /hero/hero/hero_16-9_1200x675.webp 1200w, /hero/hero/hero_16-9_2400x1350.webp 2400w"
        sizes="100vw"
        media="(min-width: 601px)"
      />
      <source
        type="image/jpg"
        srcset="/hero/hero/hero_16-9_600x338.jpg 600w, /hero/hero/hero_16-9_800x450.jpg 800w, /hero/hero/hero_16-9_1200x675.jpg 1200w, /hero/hero/hero_16-9_2400x1350.jpg 2400w"
        sizes="100vw"
        media="(min-width: 601px)"
      />
      <img
        src="/hero/hero/hero_16-9_700x394.jpg"
        width="700"
        height="394"
        alt="Image of house and pool with custom lighting"
        class={Styles.heroImage}
        loading="eager"
      />
    </picture>
  );
}
```

## License

Published under the MIT license. © Bryon Smith 2023.
