# Solid-Images

### What it does?

With url or array syntax, you can quickly make responsive images, and the HTML img/picture element code will be output to the console. Library agnostic.

### Why

Responsive images can be complex and error prone. For instance, if you want resolution switching, `<img srcset="..."` and you accidentally forget the [`sizes` attribute, the browser will ignore `srcset` and use the fallback `src` attribute.](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/srcset) The `media` attribute [should only be used with Art Direction.](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images#art_direction) There are many more small "gotcha's" that can be avoided by automation.

I built this to use with SolidJS library. Until they can get a native image library established.
Inspired by: [Jonas Kruckenberg: imagetools](https://github.com/JonasKruckenberg/imagetools)

- Unfortunately I could not get his wonderful library to do what I wanted: create static images and code at build time.
- imagetools embedded JS code at build time, (possibly because I don't know what I'm doing 😁) I wanted the img/picture element without JS.

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
  - Allows the use of new and highly optimized image formats, and fallback formats for browsers that don't support the format.
- **Cons**
  - code is complex and easy to get wrong.
  - order matters. Browser takes the first truthy value.

```html
<!-- browser takes first format it understands. Add newest type first.  -->
<picture>
  <source srcset="image-1.avif 500w, image-2.avif 1000w" type="image/avif" sizes="100px" />
  <source srcset="image-1.webp 500w, image-2.webp 1000w" type="image/webp" sizes="100px" />
  <source srcset="image-1.png 500w, image-2.png 1000w" type="image/png" sizes="100px" />
  <img src="image-1.png" alt="Human" loading="lazy" width="1000" height="836" />
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

### How to use it

This will only create one img/picture element at a time. For art direction you can use multiple urls and the media attribute.

1. Install sharp and sharp types as devDependencies.
   1. `npm i -D sharp @types/sharp`
2. Copy **createImages.ts** to your `public` or `root` directory.
3. Create `url paths`. (See URL Examples 👇).
4. Run command: `ts-node-esm createImages.ts`
5. The images will be created in the same directory the source image is in.
   1. A folder will be created with the same name as the image.
   2. The images will be created inside this new folder.
   3. The HTML img/picture element code will be output to console.

## URL Options

- **a** = aspect ratio. Crop image from center, to create desired aspect ratio. ex..`a=16:9`
  - If aspect is not provided, output image will be same aspect as input image.
  - Image will not be enlarged. Image width will be reduced until aspect ratio 'height' is same size or smaller than original image height.
- **alt** = img element `alt` attribute text. ex.. `alt=my image`.
  - default: "This is a image"
- **animated** = ex.. `animated=true`
  - default: false.
  - Used with gif, webp, avif. Keep the animation when changing formats.
  - Currently the Sharp library will only convert animated gif's to gif or webp format correctly.
  - Animated gif's to avif format does not work correctly.
- **c** = className to add to img/picture element. CSS Modules style. ex.. `c=heroImage`
  - default: pic
- **f** = format types. Can also include quality to reduce image. ex.. `f=avif:50;webp:80;jpg;png:100`.
  - Sharp defaults are used if you leave off quality.
  - Gif images: The quality represents the number of colors between 1-256. ex.. `gif:3`
    - original gif image colors are used if you leave quality off.
    - gif will only have 3 colors. This is a good way to reduce gif image size.
- **fallbackWidth**: width of fallback image. ex.. `fallbackWidth=700`
  - default: 700px wide.
  - The fallback img aspect will come from the last url.
  - Fallback Image is created in same directory as last url.
- **fallbackFormat**: format you want fallback image to be. ex.. `fallbackFormat=jpg`
  - default: jpg.
- **flatten**: formats you want flatten transparent regions. ex.. `flatten=jpg;webp`.
  - default: false.
- **flattenColor**: hex color code format. The background color for transparent regions. ex.. `flattenColor=FFFFFF`.
  - default: black.
- **media** = Art Direction only. ex.. `media=(min-width: 900px)`.
- **sharpen** = sharpen image. This process does increases the image size. ex.. `sharpen=true`.
  - default: false.
- **sizes** = All responsive images need the `sizes` attribute.
  - default is `100vw`
  - ex.. `sizes=((min-width: 50em) and (max-width: 60em)) 50em, 20em`.
- **w** = width of images. ex.. `w=600;800;1000`
  - If width is not provided, output image will be same size as input image.

## Examples

### URL Examples

```ts
createImages('public/hero/hero.jpg?w=300;600;900&f=avif;webp;jpg&sharpen=true&alt=my image');
// or
createImages([
  'public/hero/hero.jpg?w=300;600;900&f=avif;webp;jpg&sharpen=true&alt=my image'
  'public/hero/hero.jpg?w=300;600;900&f=avif;webp;jpg&sharpen=true&alt=my image'
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

**createImages.ts**

```ts
await createImages([
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
import styles from './Logo.module.scss';

export default function Logo(props: any) {
  return (
    <img
      srcset="/header/logo/bolt/bolt_2-3_25x37.gif 25w, /header/logo/bolt/bolt_2-3_55x81.gif 55w"
      sizes="62px"
      src="/header/logo/bolt/bolt_2-3_55x81.gif"
      alt="lighting bolt image"
      class={styles.bolt}
    />
  );
}
```

### Multiple Formats Example

- single url
- multiple formats
- mutiple widths

**createImages.ts**

```ts
// w=300. Original image is 265w x 253h. Image will not be enlarged. Output will be same size as image.
await createImages(
  'public/header/texasFlag.png?w=100;200;300&f=png;avif;webp&fallbackWidth=100&alt=Image of Texas Flag&sizes=100px&c=texasImage&sharpen=true'
);
```

**YourComponent.tsx**

```tsx
import styles from './TexasImage.module.scss';

export default function TexasImage() {
  return (
    <picture class={styles.texasImage}>
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
        class={styles.texasImage}
      />
    </picture>
  );
}
```

### Art Direction Example

- multiple urls
- multiple image formats
- multiple widths

**createImages.ts**

```ts
await createImages([
  [
    'public/hero/hero-full.jpg',
    'w=600;800;1200;2400',
    'a=9:16',
    'f=avif;webp;jpg',
    'fallbackWidth=700',
    'fallbackFormat=jpg',
    'alt=Image of house and pool with custom lighting',
    'sizes=100vw',
    'c=heroImage',
    'media=(max-width: 600px)',
  ],

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
  ],
]);
```

**YourComponent.tsx**

```tsx
import styles from './HeroImage.module.scss';

export default function HeroImage() {
  return (
    <picture class={styles.heroImage}>
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
        class={styles.heroImage}
      />
    </picture>
  );
}
```
