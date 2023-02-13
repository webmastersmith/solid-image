# Solid-Images

### What it does?

With url or array syntax, you can quickly make responsive images, and the HTML img/picture element code will be output to the console. Library agnostic.

### Why

Responsive images can be complex and error prone. For instance, if you want resolution switching, `<img srcset="..."` and you accidentally forget the [`sizes` attribute, the browser will ignore `srcset` and use the fallback `src` attribute.](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/srcset) The `media` attribute [should only be used with Art Direction.](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images#art_direction) There are many more small "gotcha's" that can be avoided by automation.

### Understanding Resolutions Switching, Multiple Formats, Art Direction

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
3. Create `url paths`. (See URL Examples).
4. Run command: `ts-node-esm createImages.ts`
5. The output html code image path will be for the public directory.

## URL Examples

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

## Options

- **w** = width of images. ex.. `w=600;800;1000`
  - If width is not provided, output image will be same size as input image.
- **a** = aspect ratio. Crop image from center, to create desired aspect ratio.
  - Image will not be enlarged. Image width will be reduced until aspect ratio height is same size or smaller than original image. -ex..`a=16:9`
- **f** = format types. can also include quality to reduce image. ex.. `f=avif:50;webp:80;jpg;png:100`.
  - Gif images the quality represents the number of colors between 1-256.
  - The Sharp library will only convert animated gif's to gif or webp format correctly.
  - Animated gif's to avif format does not work correctly.
- **flatten**: formats you want flatten transparent regions. ex.. `flatten=jpg;webp`.
- **flattenColor**: hex color code format. The background color for transparent regions. ex.. `flattenColor=FFFFFF`.
- **sharpen** = sharpen image. This process does increases the image size. ex.. `sharpen=true`.
- **fallbackWidth**: Width of fallback image.
  - The fallback img aspect will come from the last url.
  - Fallback Image is created in same directory as last url. ex.. `fallbackWidth=700`
- **fallbackFormat**: Format you want fallback image to be. ex.. `fallbackFormat=jpg`
- **alt** = Screen reader message. ex.. `alt=my image`.
- **media** = For Art Direction only. ex.. `(min-width: 900px)`.
- **sizes** = All responsive images need the `sizes` attribute. default is `100vw`
  - ex.. `100vw` | `(max-width: 320px) 100vw`.
- **c** = className to add to img/picture element. CSS Modules style.
- **animated** = default false. Used with gif, webp, avif. Keep the animation when changing formats. Currently Sharp only supports gif and webp.
