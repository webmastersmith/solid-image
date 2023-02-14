"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.createPaths = exports.findWidthAndHeight = exports.getHeight = exports.findAspectRatio = exports.getMetadata = exports.parseURL = exports.updateUrlParams = void 0;
var path_1 = require("path");
var sharp_1 = require("sharp");
function updateUrlParams(urls) {
    var urlPaths = [];
    // make sure single url is an array.
    if (!Array.isArray(urls))
        urls = [urls];
    for (var _i = 0, urls_1 = urls; _i < urls_1.length; _i++) {
        var url = urls_1[_i];
        // if inner array is an array, convert to path.
        if (Array.isArray(url)) {
            // add query
            var one = url[0], two = url[1], rest = url.slice(2);
            urlPaths.push(__spreadArray([one + '?' + two], rest, true).join('&'));
        }
        else {
            urlPaths.push(url);
        }
    }
    // return an array of urlPaths.
    return urlPaths;
}
exports.updateUrlParams = updateUrlParams;
/**
 * Image State.
 * @param rawUrl  string
 * @param urls all urls passed to function
 * @returns sharpDetails object
 */
function parseURL(rawUrl, urls) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    // 'hero.jpg?w=300;600;900&a=9:16&f=avif;jpg;png&sharpen=true&d=700&alt=the dog and the cat'
    var urlPath = new URL(rawUrl, 'file://');
    // parse url into array of tuples.
    var arr = [];
    arr.push(['imgPath', [urlPath.pathname.replace('/', '').trim()]]);
    for (var _i = 0, _t = urlPath.searchParams; _i < _t.length; _i++) {
        var _u = _t[_i], key = _u[0], value = _u[1];
        arr.push([key, value.split(';')]);
    }
    // convert array into object.
    var o = Object.fromEntries(arr);
    var imgName = (_b = (_a = o === null || o === void 0 ? void 0 : o.imgPath) === null || _a === void 0 ? void 0 : _a[0].split('/').pop()) !== null && _b !== void 0 ? _b : '';
    var _v = (_c = imgName.split('/').pop()) === null || _c === void 0 ? void 0 : _c.split('.'), name = _v[0], ext = _v[1];
    // remove accidental semi-colon on end.
    var w = [];
    if ((o === null || o === void 0 ? void 0 : o.w) && ((_d = o === null || o === void 0 ? void 0 : o.w) === null || _d === void 0 ? void 0 : _d.length) !== 0) {
        for (var _w = 0, _x = o.w; _w < _x.length; _w++) {
            var width = _x[_w];
            if (+width) {
                w.push(+width);
            }
        }
    }
    else {
        w = [0];
    }
    // remove accidental semi-colon on end.
    var f = [];
    if ((o === null || o === void 0 ? void 0 : o.f) && (o === null || o === void 0 ? void 0 : o.f.length) !== 0) {
        for (var _y = 0, _z = o.f; _y < _z.length; _y++) {
            var format = _z[_y];
            if (format) {
                f.push(format);
            }
        }
    }
    else {
        f = [''];
    }
    // remove accidental semi-colon on end.
    var flatten = [];
    if ((o === null || o === void 0 ? void 0 : o.flatten) && (o === null || o === void 0 ? void 0 : o.flatten.length) !== 0) {
        for (var _0 = 0, _1 = o.flatten; _0 < _1.length; _0++) {
            var format = _1[_0];
            if (format) {
                flatten.push(format);
            }
        }
    }
    else {
        flatten.push('');
    }
    // set defaults if query does not exist.
    var sharpDetails = {
        alt: ((_e = o === null || o === void 0 ? void 0 : o.alt) === null || _e === void 0 ? void 0 : _e[0]) ? o.alt[0] : 'This is a image',
        animated: ((_f = o === null || o === void 0 ? void 0 : o.animated) === null || _f === void 0 ? void 0 : _f[0]) === 'true' ? true : false,
        className: ((_g = o === null || o === void 0 ? void 0 : o.c) === null || _g === void 0 ? void 0 : _g[0]) ? o.c[0] : 'pic',
        currentFormat: '',
        debug: ((_h = o === null || o === void 0 ? void 0 : o.debug) === null || _h === void 0 ? void 0 : _h[0]) === 'true' ? true : false,
        desiredAspect: ((_j = o === null || o === void 0 ? void 0 : o.a) === null || _j === void 0 ? void 0 : _j[0]) ? o.a[0] : '',
        desiredHeight: 0,
        desiredWidth: 0,
        enlarge: ((_k = o === null || o === void 0 ? void 0 : o.enlarge) === null || _k === void 0 ? void 0 : _k[0]) === 'true' ? true : false,
        ext: ext,
        _fallback: false,
        fallbackFormat: ((_l = o === null || o === void 0 ? void 0 : o.fallbackFormat) === null || _l === void 0 ? void 0 : _l[0]) ? o.fallbackFormat[0] : 'jpg',
        fallbackWidth: ((_m = o === null || o === void 0 ? void 0 : o.fallbackWidth) === null || _m === void 0 ? void 0 : _m[0]) ? +o.fallbackWidth[0] : 700,
        flatten: flatten,
        flattenColor: ((_o = o === null || o === void 0 ? void 0 : o.flattenColor) === null || _o === void 0 ? void 0 : _o[0]) ? o.flattenColor[0] : '000000',
        folderPath: '',
        formats: f,
        imgPath: ((_p = o === null || o === void 0 ? void 0 : o.imgPath) === null || _p === void 0 ? void 0 : _p[0]) ? o.imgPath[0] : '',
        imgName: imgName,
        name: name,
        mediaQuery: ((_q = o === null || o === void 0 ? void 0 : o.media) === null || _q === void 0 ? void 0 : _q[0]) ? o.media[0] : '',
        newFileName: '',
        orgWidth: 0,
        orgHeight: 0,
        quality: 0,
        sharpen: ((_r = o === null || o === void 0 ? void 0 : o.sharpen) === null || _r === void 0 ? void 0 : _r[0]) === 'true' ? true : false,
        sizes: ((_s = o === null || o === void 0 ? void 0 : o.sizes) === null || _s === void 0 ? void 0 : _s[0]) ? o.sizes[0] : '100vw',
        srcPath: '',
        url: rawUrl,
        urls: urls,
        widths: w,
        writePath: ''
    };
    return sharpDetails;
}
exports.parseURL = parseURL;
function getMetadata(sharpDetails) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, width, _c, height, _d, format;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, (0, sharp_1["default"])("".concat(path_1["default"].join(process.cwd(), sharpDetails.imgPath))).metadata()];
                case 1:
                    _a = _e.sent(), _b = _a.width, width = _b === void 0 ? 0 : _b, _c = _a.height, height = _c === void 0 ? 0 : _c, _d = _a.format, format = _d === void 0 ? '' : _d;
                    return [2 /*return*/, { width: width, height: height, format: format }];
            }
        });
    });
}
exports.getMetadata = getMetadata;
/**
 * When given width / height, find closest aspect ratio.
 * @param val width / height
 * @returns  string. ex.. '16:9'
 */
function findAspectRatio(val) {
    var _a = AspectRatio(val, 21), w = _a[0], h = _a[1];
    return "".concat(w, ":").concat(h);
    function AspectRatio(val, lim) {
        var lower = [0, 1];
        var upper = [1, 0];
        while (true) {
            var mediant = [lower[0] + upper[0], lower[1] + upper[1]];
            if (val * mediant[1] > mediant[0]) {
                if (lim < mediant[1]) {
                    return upper;
                }
                lower = mediant;
            }
            else if (val * mediant[1] == mediant[0]) {
                if (lim >= mediant[1]) {
                    return mediant;
                }
                if (lower[1] < upper[1]) {
                    return lower;
                }
                return upper;
            }
            else {
                if (lim < mediant[1]) {
                    return lower;
                }
                upper = mediant;
            }
        }
    }
}
exports.findAspectRatio = findAspectRatio;
/**
 * When given width and desired aspectRatio, return height.
 * @param desiredWidth desired width of image
 * @param aspectRatio
 * @returns number height to keep aspectRatio as a number.
 */
function getHeight(orgWidth, orgHeight, desiredWidth, aspectRatio) {
    if (aspectRatio) {
        var _a = aspectRatio.split(':'), w = _a[0], h = _a[1];
        return Math.round(desiredWidth * (+h / +w));
    }
    // h = orgHeight/orgWidth*desiredWidth
    // w = orgWidth/orgHeight*desiredHeight
    return Math.round((orgHeight / orgWidth) * desiredWidth);
}
exports.getHeight = getHeight;
/**
 * If width size and aspect ratio will cause sharp to enlarge image, calculate max width size.
 *       // width and aspect ratio may create height taller than original Image height. Reduce width till height is same size as original image height.
      //get height if height is bigger than orgImage, reduce height by one.
 * @param desiredWidth number. Desired width that you want image to be.
 * @param orgImgWidth number. Original image width.
 * @param orgImgHeight number. Original image height.
 * @param aspect string. AspectRatio as string. ex.. '16:9'
 * @returns object. {resizeWidth, resizeHeight}
 */
function findWidthAndHeight(sharpDetails) {
    var orgWidth = sharpDetails.orgWidth, orgHeight = sharpDetails.orgHeight, desiredWidth = sharpDetails.desiredWidth, desiredAspect = sharpDetails.desiredAspect;
    if (!sharpDetails.enlarge) {
        // avoiding enlargement. Make sure desiredWidth is <= orgWidth
        while (desiredWidth > orgWidth) {
            desiredWidth--;
        }
    }
    var desiredHeight = getHeight(orgWidth, orgHeight, desiredWidth, desiredAspect);
    if (!sharpDetails.enlarge) {
        // avoid height enlargement. Reduce width till desiredHeight is same as original image height.
        while (desiredHeight > orgHeight) {
            desiredWidth--;
            desiredHeight = getHeight(orgWidth, orgHeight, desiredWidth, desiredAspect);
        }
    }
    return { desiredWidth: desiredWidth, desiredHeight: desiredHeight };
}
exports.findWidthAndHeight = findWidthAndHeight;
/**
 * Create the paths needed to write images and img src attribute.
 * @param sharpDetails url params
 * @param newImgMeta metadata from newly created image.
 * @returns paths to image.
 */
function createPaths(sharpDetails) {
    var desiredAspect = sharpDetails.desiredAspect, desiredHeight = sharpDetails.desiredHeight, desiredWidth = sharpDetails.desiredWidth, currentFormat = sharpDetails.currentFormat, imgPath = sharpDetails.imgPath, name = sharpDetails.name;
    // get folder structure for path.
    var folderStructure = imgPath.split('/').slice(0, -1).join('/');
    // get new image metadata and find aspectRatio.
    var a;
    if (desiredAspect) {
        a = desiredAspect.replace(':', '-');
    }
    else {
        // get ratio from new image width & height
        a = findAspectRatio(desiredWidth / desiredHeight).replace(':', '-');
    }
    var newFileName = "".concat(name, "_").concat(a, "_").concat(desiredWidth, "x").concat(desiredHeight, ".").concat(currentFormat);
    var srcPath = "".concat(folderStructure.replace('public', '').replace('//', '/'), "/").concat(name, "/").concat(newFileName);
    var folderPath = path_1["default"].join(process.cwd(), folderStructure, name);
    var writePath = path_1["default"].join(folderPath, newFileName);
    return { newFileName: newFileName, srcPath: srcPath, folderPath: folderPath, writePath: writePath };
}
exports.createPaths = createPaths;
