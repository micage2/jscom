function uid() {
    // return "" + Math.random().toString(36).slice(2, 11);
    return crypto.randomUUID();
}

function create_sheet(code) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(code);
    return sheet;
}

function fitChildDimensions(parent, child) {
    child.width = parent.offsetWidth;
    child.height = parent.offsetHeight;
}

function logobj(obj, indent = 0) {
    let result = '';
    const spaces = ' '.repeat(indent * 2);
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
            result += `${spaces}${key}: {\n${logobj(value, indent + 1)}${spaces}}\n`;
        } else {
            result += `${spaces}${key}: ${value}\n`;
        }
    }
    return result;
}

export function CSSRules(rules = {}) {
    const map = new Map([...Object.entries(rules)]);
    return {
        toString: () => map.entries().reduce((acc, [k, v]) => (acc + ` ${k}: ${v};`), ""),
        add(prop, value) {
            map.set(prop, value);
            return this;
        },
        visit(fn) {
            if (fn) map.forEach((v, k, m) => fn(k, v));
            return this;
        },
        log() { console.log(`${this.toString()}`); },
    };
};

// not working
function _loadSheet(file) {
    // Create a new CSSStyleSheet
    const sheet = new CSSStyleSheet();

    // Load external CSS (asynchronously, supports @import)
    // sheet.replace('@import url("styles.css")')
    // .then(() => sheet)
    // .catch(err => console.error('Failed to load styles:', err));    
    sheet.replaceSync(`@import url('${file}')`)
    shadow.adoptedStyleSheets = [sheet];
}

export async function loadSheet(file) {
    const sheet = new CSSStyleSheet();

    const response = await fetch(file);
    const cssText = await response.text();

    await sheet.replace(cssText);

    return sheet;
}

export async function load_file(file) {
    const sheet = new CSSStyleSheet();

    const response = await fetch(file);
    const cssText = await response.text();

    return cssText;
}

export async function loadFragment(file) {
    const resp = await fetch(file);
    if (!resp.ok)
        throw new Error(`Failed to load template: ${file}`);
  
    const html = await resp.text();

    return makeFragment(html);
}

export function makeFragment(str) {
    const div = document.createElement('div');
    const fragment = document.createDocumentFragment();
    
    div.innerHTML = str;
    
    while (div.firstChild) {
        fragment.appendChild(div.firstChild);
    }

    return fragment;
}

export {
    create_sheet, fitChildDimensions, logobj, uid,
}