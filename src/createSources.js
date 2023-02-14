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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
exports.__esModule = true;
var utils_1 = require("./utils");
var createSrcset_1 = require("./createSrcset");
/**
 * Creates the 'source' element and calls all formats/sizes provide from url params.
 * @param _img instance of sharp image.
 * @param sharpDetails object containing url params
 * @param media (min-width: 900px)
 * @param sizes 100vw | (max-width: 320px) 100vw, (max-width: 600px) 50vw, 25vw
 * @returns string. Source element w/ different image formats and srcset pre-filled.
 */
function createSources(sharpDetails) {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var sources, sharpDetailsFinal, sharpDetailsDefault, _i, _d, format, srcsets, _e, _f, _g, i, width, _h, desiredWidth, desiredHeight, _j, srcset, sharpDetailsFinished, e_1_1, _source, source;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    sources = [];
                    sharpDetailsFinal = sharpDetails;
                    sharpDetailsDefault = sharpDetails;
                    _i = 0, _d = sharpDetails.formats;
                    _k.label = 1;
                case 1:
                    if (!(_i < _d.length)) return [3 /*break*/, 18];
                    format = _d[_i];
                    // resetting state with each format.
                    sharpDetails = sharpDetailsDefault;
                    // Check for accidental semicolon on end of formats. Make sure formats is not just empty by only skipping format if more than 1 and format has falsey value.
                    if (sharpDetails.formats.length > 1 && !format)
                        return [3 /*break*/, 17];
                    // if only one format provided is falsey, assign original image format.
                    if (sharpDetails.formats.length === 1 && !format) {
                        sharpDetails.currentFormat = sharpDetails.ext;
                    }
                    else {
                        // else assign format from url.
                        sharpDetails.currentFormat = format;
                    }
                    srcsets = [];
                    _k.label = 2;
                case 2:
                    _k.trys.push([2, 10, 11, 16]);
                    _e = true, _f = (e_1 = void 0, __asyncValues(sharpDetails.widths.entries()));
                    _k.label = 3;
                case 3: return [4 /*yield*/, _f.next()];
                case 4:
                    if (!(_g = _k.sent(), _a = _g.done, !_a)) return [3 /*break*/, 9];
                    _c = _g.value;
                    _e = false;
                    _k.label = 5;
                case 5:
                    _k.trys.push([5, , 7, 8]);
                    i = _c[0], width = _c[1];
                    // if width falsey and no aspect provided, give back image same size.
                    if (!width && !sharpDetails.desiredAspect) {
                        sharpDetails.desiredWidth = sharpDetails.orgWidth;
                        sharpDetails.desiredHeight = sharpDetails.orgHeight;
                    }
                    else {
                        sharpDetails.desiredWidth = width;
                        _h = (0, utils_1.findWidthAndHeight)(sharpDetails), desiredWidth = _h.desiredWidth, desiredHeight = _h.desiredHeight;
                        sharpDetails.desiredWidth = desiredWidth;
                        sharpDetails.desiredHeight = desiredHeight;
                    }
                    return [4 /*yield*/, (0, createSrcset_1["default"])(sharpDetails)];
                case 6:
                    _j = _k.sent(), srcset = _j.srcset, sharpDetailsFinished = _j.sharpDetailsFinished;
                    // check if srcset already exist in array.
                    if (!srcsets.includes(srcset))
                        srcsets.push(srcset);
                    // if last width, save sharpDetails,
                    if (i === sharpDetails.widths.length - 1) {
                        // is this a fallback image? Just return new image state.
                        if (sharpDetails._fallback) {
                            return [2 /*return*/, { _sources: [''], sharpDetailsFinal: sharpDetailsFinished }];
                        }
                        // Resolution Switching
                        if (sharpDetailsFinished.formats.length === 1 && sharpDetailsFinished.urls.length === 1) {
                            // no other formats, return early.
                            return [2 /*return*/, { _sources: srcsets, sharpDetailsFinal: sharpDetailsFinished }];
                        }
                        // the last format will be what the sharpDetails state is.
                        sharpDetailsFinal = sharpDetailsFinished;
                    }
                    return [3 /*break*/, 8];
                case 7:
                    _e = true;
                    return [7 /*endfinally*/];
                case 8: return [3 /*break*/, 3];
                case 9: return [3 /*break*/, 16];
                case 10:
                    e_1_1 = _k.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 16];
                case 11:
                    _k.trys.push([11, , 14, 15]);
                    if (!(!_e && !_a && (_b = _f["return"]))) return [3 /*break*/, 13];
                    return [4 /*yield*/, _b.call(_f)];
                case 12:
                    _k.sent();
                    _k.label = 13;
                case 13: return [3 /*break*/, 15];
                case 14:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 15: return [7 /*endfinally*/];
                case 16:
                    _source = [];
                    _source.push("type=\"image/".concat(sharpDetailsFinal.currentFormat, "\" srcset=\"").concat(srcsets.join(', '), "\" sizes=\"").concat(sharpDetailsFinal.sizes, "\""));
                    // media queries only used on Art Direction.
                    if (sharpDetailsFinal.urls.length > 1 && sharpDetailsFinal.mediaQuery) {
                        _source.push("media=\"".concat(sharpDetailsFinal.mediaQuery, "\""));
                    }
                    source = "<source ".concat(_source.join(' '), " />").replace(/\s{2,}/g, ' ');
                    // after each format type, push source element into array.
                    // insertion order: avif, webp, everything else. Because browser takes first format it understands. Newest formats first.
                    if (sharpDetailsFinal.currentFormat === 'avif') {
                        sources.unshift(source);
                    }
                    else if (sharpDetailsFinal.currentFormat === 'webp') {
                        sources.splice(1, 0, source);
                    }
                    else {
                        sources.push(source);
                    }
                    _k.label = 17;
                case 17:
                    _i++;
                    return [3 /*break*/, 1];
                case 18: // end outer loop
                // return sources array
                return [2 /*return*/, { _sources: sources, sharpDetailsFinal: sharpDetailsFinal }];
            }
        });
    });
}
exports["default"] = createSources;
