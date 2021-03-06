import {JSDOM} from 'jsdom';
import * as fs from 'fs';

const handleElem = (s: HTMLElement, filter?: Function): string => {
  if (!s.tagName) {
    if (s.nodeType !== s.COMMENT_NODE) {
      return s.textContent;
    } else {
      return '';
    }
  }

  if (filter && filter(s)) {
    return '';
  }

  if (['video', 'audio', 'iframe'].includes(s.tagName.toLowerCase())) {
    return '';
  }
  if (Array.from(s.classList).includes('nav-link')) {
    return '';
  }
  if (s.tagName.toLowerCase()==='img') {
    const alt = s.getAttribute('alt');
    if (alt) {
      return '<emphasis level="reduced">'+alt+'</emphasis>'
    } else {
      return ''
    }
  }
  if (!s.textContent) {
    return '';
  }
  const headerTags: any = {
    'h1': '<emphasis level="strong">',
    'h2': '<emphasis level="strong">',
    'h3': '<emphasis level="strong">',
    'h4': '<emphasis level="strong">',
    'h5': '<emphasis level="strong">',
    'h6': '<emphasis level="strong">'
  };
  if (s.tagName.toLowerCase() in headerTags) {
    return headerTags[s.tagName.toLowerCase()] + (s.hasChildNodes ? Array.from(s.childNodes).reduce<string>((acc: string, node: ChildNode) => {
      return acc + handleElem(node as HTMLElement, filter);
    },'') : '' ) + '</emphasis>';
  }
  let ssmlTagName: string = '';
  switch (s.tagName.toLowerCase()) {
    case 'b': ssmlTagName = '<emphasis>'; break;
    case 'em': ssmlTagName = '<emphasis>'; break;
    case 'p': ssmlTagName = '<p>'; break;
    default: break;
  }

  return ssmlTagName + (s.hasChildNodes ? Array.from(s.childNodes).reduce<string>((acc: string, node: ChildNode) => {
    return acc + handleElem(node as HTMLElement, filter);
  },'') : '' ) + (ssmlTagName ? ssmlTagName.replace('<','</'): '');
}


const main = async() => {
  let dom = await JSDOM.fromFile(process.argv[2]);
  if (process.argv.length > 3) {
    fs.writeFileSync(process.argv[3],'<speak>'+handleElem(dom.window.document.body).replace(/\s\s+/g, ' ')+'</speak>');
  } else { // output file omitted from args, emit to stdout:
    console.log('<speak>'+handleElem(dom.window.document.body).replace(/\s\s+/g, ' ')+'</speak>');
  }
}

if (require.main === module) {
  // cli mode
  main();
}

const fromHTML = (s: string, enclosed: boolean = true, filter?: Function) => {
  return (enclosed ? '<speak>' : '') + handleElem((new JSDOM(s)).window.document.body, filter).replace(/\s\s+/g, ' ') + (enclosed ? '</speak>' : '');
}

const fromURL = async(u: URL, enclosed: boolean = true, filter?: Function) => {
  let dom = await JSDOM.fromURL(u.toString());
  return (enclosed ? '<speak>' : '') + handleElem(dom.window.document.body, filter).replace(/\s\s+/g, ' ') + (enclosed ? '</speak>' : '');
}

module.exports = {
  fromHTML: fromHTML,
  fromURL: fromURL
}