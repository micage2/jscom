// import { Mediator } from './mediator.js'
import { GroupProperty, TypeRegistry } from './property.js'
import { load_file } from '../shared/dom-helper.js';

class SVGFileProperty extends GroupProperty {
    #filename;
    #config;

    constructor(name, filename, config = {}) {
        super(name);
        this.#filename = filename;
        this.#config = config;
        SVGFileProperty.load(filename, this);
    }

    static load(file, prop) {
        const dummy = document.createElement('div');

        load_file(file).then((str) => {
            dummy.innerHTML = str;
            const svg = dummy.querySelector('svg');

            prop.add('content', svg, TYPE_SVG_SVG);
        });
    }

}
export const TYPE_SVG_FILE = TypeRegistry.register('svg.file', SVGFileProperty);

function initChildren(svg_or_g, prop) {
    const children = [...svg_or_g.children]
    .filter((elem) => allowedTags[elem.nodeName])
    .map((elem, i) => {
        const name = elem.name || elem.id || elem.nodeName + i;
        const type = allowedTags[elem.nodeName];
        return prop.add(name, elem, type, prop.config);
    });
}

class SVGSVGProperty extends GroupProperty {
    #svg;
    #config;

    constructor(name, svg, config = { icon: { unicode: '🖼️'} }) {
        super(name);
        this.#svg = svg;
        this.#config = config;
        initChildren(svg, this);
    }

    get() { return this.#svg; } // TODO: unsafe!
}
export const TYPE_SVG_SVG = TypeRegistry.register('svg.svg', SVGSVGProperty);

class SVGGroupProperty extends GroupProperty {
    #g;
    #config;

    constructor(name, g, config = { icon: { unicode: '📦' } }) {
        super(name);
        this.#g = g;
        this.#config = config;
        initChildren(g, this);
    }
    get() { return this.#g; } // TODO: unsafe!
    getName() { return this.#g.name || this.#g.id || 'g'; }
    getType() { return TYPE_SVG_G; }
}
export const TYPE_SVG_G = TypeRegistry.register('svg.group', SVGGroupProperty);

class SVGCircleProperty extends GroupProperty {
    #circle;
    #config;

    constructor(name, circle, config = { icon: { unicode: '⭕' } }) {
        super(name);
        this.#circle = circle;
        this.#config = config;
    }
    get() { return this.#circle; } // TODO: unsafe!
}
export const TYPE_SVG_CIRCLE = TypeRegistry.register('svg.circle', SVGCircleProperty);

class SVGRectProperty extends GroupProperty {
    #rect;
    #config;

    constructor(name, rect, config = { icon: { unicode: '▭' } }) {
        super(name);
        this.#rect = rect;
        this.#config = config;
    }
    get() { return this.#rect; } // TODO: unsafe!
}
export const TYPE_SVG_RECT = TypeRegistry.register('svg.rect', SVGRectProperty);

class SVGPathProperty extends GroupProperty {
    #path;
    #config;

    constructor(name, path, config = {}) {
        super(name);
        this.#path = path;
        this.#config = config;
    }
    get() { return this.#path; } // TODO: unsafe!
    getName() { return this.#path.getAttribute('name') || this.#path.id; }
    getType() { return TYPE_SVG_PATH; }
}
export const TYPE_SVG_PATH = TypeRegistry.register('svg.path', SVGPathProperty);

class SVGTextProperty extends GroupProperty {
    #text;
    #config;

    constructor(name, text, config = {}) {
        super(name);
        this.#text = text;
        this.#config = config;
    }
    get() { return this.#text; } // TODO: unsafe!
}
export const TYPE_SVG_TEXT = TypeRegistry.register('svg.text', SVGTextProperty);

const allowedTags = {
    'svg' : TYPE_SVG_SVG,
    'g': TYPE_SVG_G,
    'circle': TYPE_SVG_CIRCLE, 
    'rect': TYPE_SVG_RECT, 
    'path': TYPE_SVG_PATH, 
    'text': TYPE_SVG_TEXT,
};

