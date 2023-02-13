# Solid-Images

### What it does?

With url or array syntax, you can quickly make responsive images, and the HTML img|picture element code will be output to the console. Library agnostic.

### Why

Responsive images can be complex and error prone. For instance, if you want resolution switching, `<img srcset="..."` and you accidentally forget the [`sizes` attribute, the browser will ignore `srcset` and use the fallback `src` attribute.](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/srcset) [The `media` attribute should only be used with Art Direction.](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images#art_direction) There are many more small "gotcha's" that can be avoided by automation.

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

### How to use it

This will only create one img/picture element at a time. For art direction you can use multiple urls and the media attribute.

1. Install sharp and sharp types as devDependencies.
   1. `npm i -D sharp @types/sharp`
2. Copy **createImages.ts** to your `public` or `root` directory.
3. Create `url`. See url examples.
4. Run command: `ts-node-esm createImages.ts`
5. The output html code image path will be for the public directory.

## URL Examples

```ts
createImages('public/hero/hero.jpg?w=300;600;900&f=avif;webp;jpg&sharpen=true');
```

## Options

/\*\*

- Create images and picture element or img element with srcset attribute.
- RESOLUTION SWITCHING: only one url and one format. Usually jpg format.
- PICTURE ELEMENT
- Multiple Formats: Do not include media queries. Provide multiple formats. ex.. f=avif,webp,jpg
- Art Direction: provide at least two urls. Must have media queries on urls.
-
- ex...'hero.jpg?w=300;600;900&&f=avif:50;jpg;webp:80;png:50&sharpen=true&d=500&alt=The dog and the Cat'
-
- w = width of images. ex.. w=600;800;1000
-
- a = aspectRatio, string, -ex..'a=16:9'
-
- f = string[] -format:quality ex.. avif:50, webp:80, jpg, png:100. Gif images the quality is 1-256. It represents the number of colors. Leave of number to use the same amount as original image. Currently you can only convert to gif or webp. Avif does not work correctly. Online gif to avif convert to mp4 video.
-
- flatten: semi-colon separated list of formats you want flattened.
- flattenColor: hex color code. You can add the background color for image transparent regions. ex.. flatten=FFFFFF
-
- sharpen = boolean -sharpen image. Increases the image size. ex.. sharpen=true
-
- fallbackWidth: number. Fallback image width for the 'img' element. The fallback img aspect will come from the last url. Image is created in same directory as last url. ex.. fallbackWidth=700
-
- fallbackFormat: string. Format you want fallback image to be.
-
- alt = string. Screen reader message. ex.. alt=Hello World.
-
- media = (min-width: 900px) | you can leave blank.
-
- sizes = string. ex.. 100vw | (max-width: 320px) 100vw, (max-width: 600px) 50vw, 25vw | blank.
-
- c = string. The 'class' name you want to call your img. CSS Modules style. The 'class' name comes from the last url provided.
-
- animated = boolean. default false.
  \*/
