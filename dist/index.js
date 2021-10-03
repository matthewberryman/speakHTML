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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromURL = exports.fromHTML = void 0;
const jsdom_1 = require("jsdom");
const fs = require("fs");
const handleElem = (s) => {
    if (!s.tagName) {
        if (s.nodeType !== s.COMMENT_NODE) {
            return s.textContent;
        }
        else {
            return '';
        }
    }
    if (['video', 'audio', 'iframe'].includes(s.tagName.toLowerCase())) {
        return '';
    }
    if (Array.from(s.classList).includes('nav-link')) {
        return '';
    }
    if (s.tagName.toLowerCase() === 'img') {
        const alt = s.getAttribute('alt');
        if (alt) {
            return '<emphasis level="reduced">' + alt + '</emphasis>';
        }
        else {
            return '';
        }
    }
    if (!s.textContent) {
        return '';
    }
    const headerTags = {
        'h1': '<emphasis level="strong">',
        'h2': '<emphasis level="strong">',
        'h3': '<emphasis level="strong">',
        'h4': '<emphasis level="strong">',
        'h5': '<emphasis level="strong">',
        'h6': '<emphasis level="strong">'
    };
    if (s.tagName.toLowerCase() in headerTags) {
        return headerTags[s.tagName.toLowerCase()] + (s.hasChildNodes ? Array.from(s.childNodes).reduce((acc, node) => {
            return acc + handleElem(node);
        }, '') : '') + '</emphasis>';
    }
    let ssmlTagName = '';
    switch (s.tagName.toLowerCase()) {
        case 'b':
            ssmlTagName = '<emphasis>';
            break;
        case 'em':
            ssmlTagName = '<emphasis>';
            break;
        case 'p':
            ssmlTagName = '<p>';
            break;
        default: break;
    }
    return ssmlTagName + (s.hasChildNodes ? Array.from(s.childNodes).reduce((acc, node) => {
        return acc + handleElem(node);
    }, '') : '') + (ssmlTagName ? ssmlTagName.replace('<', '</') : '');
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    let dom = yield jsdom_1.JSDOM.fromFile(process.argv[2]);
    if (process.argv.length > 3) {
        fs.writeFileSync(process.argv[3], '<speak>' + handleElem(dom.window.document.body).replace(/\s\s+/g, ' ') + '</speak>');
    }
    else { // output file omitted from args, emit to stdout:
        console.log('<speak>' + handleElem(dom.window.document.body).replace(/\s\s+/g, ' ') + '</speak>');
    }
});
if (require.main === module) {
    // cli mode
    main();
}
const fromHTML = (s, enclosed = true) => {
    return (enclosed ? '<speak>' : '') + handleElem(s).replace(/\s\s+/g, ' ') + (enclosed ? '</speak>' : '');
};
exports.fromHTML = fromHTML;
const fromURL = (u, enclosed = true) => __awaiter(void 0, void 0, void 0, function* () {
    let dom = yield jsdom_1.JSDOM.fromURL(u.toString());
    return (enclosed ? '<speak>' : '') + handleElem(dom.window.document.body).replace(/\s\s+/g, ' ') + (enclosed ? '</speak>' : '');
});
exports.fromURL = fromURL;
//# sourceMappingURL=index.js.map