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
exports.__esModule = true;
var sharp_1 = require("sharp");
var fs_1 = require("fs");
var path_1 = require("path");
var utils_1 = require("./utils");
/**
 * create/write images to folder. Return srcset values.
 * @param sizeDetails image state.
 * @returns creates/writes image, returns srcset imgPath and width.
 */
function createSrcset(sharpDetails) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, format, _b, quality, _img, _c, newFileName, srcPath, folderPath, writePath;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = sharpDetails.currentFormat.split(':'), format = _a[0], _b = _a[1], quality = _b === void 0 ? '' : _b;
                    sharpDetails.currentFormat = format;
                    if (+quality) {
                        sharpDetails.quality = +quality;
                    }
                    _img = (0, sharp_1["default"])("".concat(path_1["default"].join(process.cwd(), sharpDetails.imgPath)), {
                        animated: sharpDetails.animated
                    });
                    // remove transparent parts of image.
                    if (sharpDetails.flattenColor || sharpDetails.flatten[0]) {
                        // only flatten currentFormat if in flatten list.
                        if (sharpDetails.flatten.includes(sharpDetails.currentFormat)) {
                            _img.flatten({ background: "#".concat(sharpDetails.flattenColor) }); // create white background when regions are transparent.
                        }
                    }
                    //
                    if (sharpDetails.currentFormat === 'jpeg' || sharpDetails.currentFormat === 'jpg') {
                        if (sharpDetails.quality) {
                            _img.toFormat(sharpDetails.currentFormat, { mozjpeg: true, quality: sharpDetails.quality });
                        }
                        else {
                            _img.toFormat(sharpDetails.currentFormat, { mozjpeg: true });
                        }
                    }
                    else if (sharpDetails.currentFormat === 'gif') {
                        if (sharpDetails.quality) {
                            _img.toFormat(sharpDetails.currentFormat, { reoptimise: true, colors: sharpDetails.quality });
                        }
                        else {
                            _img.toFormat(sharpDetails.currentFormat, { reoptimise: true });
                        }
                    }
                    else if (sharpDetails.currentFormat === 'png' ||
                        sharpDetails.currentFormat === 'webp' ||
                        sharpDetails.currentFormat === 'avif' ||
                        sharpDetails.currentFormat === 'svg' ||
                        sharpDetails.currentFormat === 'tiff') {
                        if (sharpDetails.quality) {
                            _img.toFormat(sharpDetails.currentFormat, { quality: sharpDetails.quality });
                        }
                        else {
                            _img.toFormat(sharpDetails.currentFormat);
                        }
                    }
                    // check for width or height change.
                    if (sharpDetails.desiredWidth !== sharpDetails.orgWidth ||
                        sharpDetails.desiredHeight !== sharpDetails.orgHeight) {
                        _img.resize(sharpDetails.desiredWidth, sharpDetails.desiredHeight);
                    }
                    if (sharpDetails.sharpen) {
                        _img.sharpen({
                            sigma: 2,
                            m1: 0,
                            m2: 3,
                            x1: 3,
                            y2: 15,
                            y3: 15
                        });
                    }
                    _c = (0, utils_1.createPaths)(sharpDetails), newFileName = _c.newFileName, srcPath = _c.srcPath, folderPath = _c.folderPath, writePath = _c.writePath;
                    sharpDetails.srcPath = srcPath;
                    sharpDetails.newFileName = newFileName;
                    sharpDetails.folderPath = folderPath;
                    sharpDetails.writePath = writePath;
                    // print state to console
                    if (sharpDetails.debug)
                        console.log(sharpDetails);
                    if (!fs_1["default"].existsSync(folderPath)) {
                        fs_1["default"].mkdirSync(folderPath, { recursive: true });
                    }
                    return [4 /*yield*/, _img.toFile(writePath)];
                case 1:
                    _d.sent();
                    return [2 /*return*/, { srcset: "".concat(srcPath, " ").concat(sharpDetails.desiredWidth, "w"), sharpDetailsFinished: sharpDetails }];
            }
        });
    });
}
exports["default"] = createSrcset;
