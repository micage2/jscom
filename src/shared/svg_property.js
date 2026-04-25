import { TypeRegistry } from './type-registry.js';
import { GroupProperty } from './property.js'
import { load_file } from '../shared/dom-helper.js';

const SVGNS = 'http://www.w3.org/2000/svg';

// TODO: what if type is not allowed?
function initChildren(svg_or_g, prop) {
    const children = [...svg_or_g.children]
        .filter((elem) => allowedTags[elem.nodeName])
        .map((elem, i) => {
            const name = elem.getAttribute('name') || elem.id || elem.nodeName + i;
            const type = allowedTags[elem.nodeName];
            return prop.add({ name, value: elem, type, config: prop.config });
        });
}

function Load(file, prop) {
    const dummy = document.createElement('div');

    // TODO: should also add child props for status and error
    load_file(file).then((str) => {
        dummy.innerHTML = str;
        const svg = dummy.querySelector('svg');

        prop.add({ name: 'content', value: svg, type: TYPE_SVG_SVG });
    });
}

function processConfig(elem, cfg = {}) {
    if (cfg.class) {
        cfg.class.split(' ').forEach(rule => elem.classList.add(rule));
    }
}

function elementCost(elem) {
    if (!elem) return 0;

    let cost = 1; // Base overhead

    switch (elem.tagName) {
        case 'path':
            cost += elem.getPathData().length;
            break;
        case 'polyline':
        case 'polygon':
            cost += elem.points.numberOfItems;
            break;
        case 'image':
            cost += 50;
            break;
        case 'filter':
        case 'mask':
            cost += 100;
            break;
        // Add other expensive tags as needed
    }

    return cost;
}

// Note: don't set value when calling super(params), otherwise 
// the ctor of GroupProperty will, if it's an Object (Array too),
// try to generate child properties from it.

class SVGFileProperty extends GroupProperty {
    #filename;

    constructor(params) {
        super(params);
        console.assert(params && params.name, '[SVGFileProperty.create]', 'No name field.');
        this.#filename = params.value;
        Load(this.#filename, this); // adds child prop 'content'
    }
}
export const TYPE_SVG_FILE = TypeRegistry.register('svg.file', SVGFileProperty);

class SVGSVGProperty extends GroupProperty {
    #svg;

    constructor(params) {
        console.assert(params && params.value, '[SVGSVGProperty.create]', 'No value field.');
        super(params);
        this.#svg = params.value;
        initChildren(this.#svg, this);
        this.on('child-added', (child) => {
            // console.log('[SVGSVGProperty.ctor]', 'child: ', child);
            const elem = child.get();
            this.#svg.appendChild(elem);
        });
    }

    get() { return this.#svg; } // TODO: unsafe!
    getType() { return TYPE_SVG_SVG; }
}
export const TYPE_SVG_SVG = TypeRegistry.register('svg.svg', SVGSVGProperty);


class SVGGroupProperty extends GroupProperty {
    #g;

    constructor(params) {
        super(params);
        let g = params.value;
        if (!(g instanceof SVGGElement)) {
            if (g) console.warn('[SVGGroupProperty].ctor', 'Invalid argument: ', g);
            g = document.createElementNS(SVGNS, 'g');
            const cfg = params.config[params.name];
            if (cfg) {
                processConfig(g, cfg);
            }
        }
        initChildren(g, this);
        this.on('child-added', (child) => {
            // console.log('[SVGGroupProperty.ctor]', 'child: ', child);
            const elem = child.get();
            g.appendChild(elem);
        });
        this.on('child-removed', (child) => {
            child.get().remove();
        });

        this.#g = g;
    }

    get() { return this.#g; } // TODO: unsafe!
    getType() { return TYPE_SVG_G; }
}
export const TYPE_SVG_G = TypeRegistry.register('svg.group', SVGGroupProperty);

class SVGCircleProperty extends GroupProperty {
    #circle;

    constructor(params) {
        super(params);
        let circle = params.value;
        if (!circle instanceof SVGCircleElement) {
            if (circle) console.warn('[SVGCircleProperty].ctor', 'Invalid argument: ', circle);
            circle = document.createElementNS(SVGNS, 'circle');
        }
        this.#circle = circle;

        const cxprop = this.add({ name: 'cx', value: circle.cx.baseVal.value });
        const cyprop = this.add({ name: 'cy', value: circle.cy.baseVal.value });
        const rprop = this.add({ name: 'r', value: circle.r.baseVal.value });
        cxprop.on('value-changed', ({ newValue }) => { circle.cx.baseVal.value = newValue; });
        cyprop.on('value-changed', ({ newValue }) => { circle.cy.baseVal.value = newValue; });
        rprop.on('value-changed', ({ newValue }) => { circle.r.baseVal.value = newValue; });
    }
    get() { return this.#circle; } // TODO: unsafe!
    getType() { return TYPE_SVG_CIRCLE; }
}
export const TYPE_SVG_CIRCLE = TypeRegistry.register('svg.circle', SVGCircleProperty);


class SVGRectProperty extends GroupProperty {
    #rect;

    constructor(params) {
        super(params);
        let rect = params.value;

        if (!(rect instanceof SVGRectElement)) {
            if (rect) console.warn('[SVGRectProperty].ctor', 'Invalid argument: ', rect);
            rect = document.createElementNS(SVGNS, 'rect');
        }

        const x = this.add({ name: 'x', value: rect.x.baseVal.value });
        const y = this.add({ name: 'y', value: rect.y.baseVal.value });
        const w = this.add({ name: 'width', value: rect.width.baseVal.value });
        const h = this.add({ name: 'height', value: rect.height.baseVal.value });
        x.on('value-changed', ({ newValue }) => { rect.x.baseVal.value = newValue; });
        y.on('value-changed', ({ newValue }) => { rect.y.baseVal.value = newValue; });
        w.on('value-changed', ({ newValue }) => { rect.width.baseVal.value = newValue; });
        h.on('value-changed', ({ newValue }) => { rect.height.baseVal.value = newValue; });
        this.#rect = rect;
    }

    get() { return this.#rect; } // TODO: unsafe!
    getType() { return TYPE_SVG_RECT; }
}
export const TYPE_SVG_RECT = TypeRegistry.register('svg.rect', SVGRectProperty);


class SVGPathProperty extends GroupProperty {
    #path;

    constructor(params) {
        super(params);
        this.#path = params.value;
        if (!(this.#path instanceof SVGPathElement)) {
            if (this.#path) console.warn('[SVGPathProperty].ctor', 'Invalid argument: ', this.#path);
            this.#path = document.createElementNS(SVGNS, 'path');
        }
    }

    get() { return this.#path; } // TODO: unsafe!
    getType() { return TYPE_SVG_PATH; }
}
export const TYPE_SVG_PATH = TypeRegistry.register('svg.path', SVGPathProperty);


class SVGTextProperty extends GroupProperty {
    #value;

    constructor(params) {
        super(params);
        this.#value = params.value;
        if (!(this.#value instanceof SVGRectElement)) {
            if (this.#value) console.warn('[SVGRectProperty].ctor', 'Invalid argument: ', this.#value);
            this.#value = document.createElementNS(SVGNS, 'text');
        }
    }
    get() { return this.#value; } // TODO: unsafe!
    getType() { return TYPE_SVG_TEXT; }
}
export const TYPE_SVG_TEXT = TypeRegistry.register('svg.text', SVGTextProperty);

class SVGUseProperty extends GroupProperty {
    #value;

    constructor(params) {
        super(params);
        this.#value = params.value;
        if (!(this.#value instanceof SVGUseElement)) {
            if (this.#value) console.warn('[SVGUseProperty].ctor', 'Invalid argument: ', this.#value);
            this.#value = document.createElementNS(SVGNS, 'use');
            this.#value.setAttribute('href', '#' + params.config.href);
            this.#value.setAttribute("vector-effect", "non-scaling-stroke");
        }
    }
    get() { return this.#value; } // TODO: unsafe!
    getType() { return TYPE_SVG_USE; }
}
export const TYPE_SVG_USE = TypeRegistry.register('svg.use', SVGUseProperty);

const allowedTags = {
    'svg': TYPE_SVG_SVG,
    'g': TYPE_SVG_G,
    'circle': TYPE_SVG_CIRCLE,
    'rect': TYPE_SVG_RECT,
    'path': TYPE_SVG_PATH,
    'text': TYPE_SVG_TEXT,
    'use': TYPE_SVG_USE,
};

