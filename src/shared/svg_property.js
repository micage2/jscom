import { TypeRegistry } from './type-registry.js';
import { GroupProperty } from './property.js'
import { load_file } from '../shared/dom-helper.js';

const SVGNS = 'http://www.w3.org/2000/svg';

function initChildren(svg_or_g, prop) {
    const children = [...svg_or_g.children]
        .filter((elem) => allowedTags[elem.nodeName])
        .map((elem, i) => {
            const name = elem.getAttribute('name') || elem.id || elem.nodeName + i;
            const type = allowedTags[elem.nodeName];

            logM(name, elem);

            const child = prop.add({ name, value: elem, type, config: prop.config });
            return child;
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

class SVGGroupProperty extends GroupProperty {
    #value;
    #ltm;

    constructor(params) {
        super(params);
        let g = params.value;
        if (!(g instanceof SVGGElement || g instanceof SVGSVGElement)) {
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
            if (elem && Object.keys(allowedTags).includes(elem.nodeName) ) {
                g.appendChild(elem);
                logM(this.getName(), elem);
            }
        });
        this.on('child-removed', (child) => {
            const elem = child.get();
            if (elem && Object.keys(allowedTags).includes(elem.nodeName) ) {
                child.get().remove();
            }
        });

        this.#value = g;
    }

    get() { return this.#value; } // TODO: unsafe!
    getType() { return TYPE_SVG_G; }
}
export const TYPE_SVG_G = TypeRegistry.register('svg.group', SVGGroupProperty);


class SVGSVGProperty extends SVGGroupProperty {
    getType() { return TYPE_SVG_SVG; }
}
export const TYPE_SVG_SVG = TypeRegistry.register('svg.svg', SVGSVGProperty);


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

class SVGMatrixProperty extends GroupProperty {
    #value;

    constructor(params) {
        super(params);
        this.#value = params.value;
        if (!(this.#value instanceof SVGMatrix)) {
            if (this.#value) console.warn('[SVGMatrixProperty].ctor', 'Invalid argument: ', this.#value);
            this.#value = new DOMMatrix();
        }
    }
    get() { return undefined; } // TODO: unsafe!
    getType() { return TYPE_SVG_MATRIX; }
}
export const TYPE_SVG_MATRIX = TypeRegistry.register('svg.matrix', SVGMatrixProperty);

const allowedTags = {
    'svg': TYPE_SVG_SVG,
    'g': TYPE_SVG_G,
    'circle': TYPE_SVG_CIRCLE,
    'rect': TYPE_SVG_RECT,
    'path': TYPE_SVG_PATH,
    'text': TYPE_SVG_TEXT,
    'use': TYPE_SVG_USE,
};

const logM = function (str, elem) {
    const M = getLTM(elem);
    if (!M) return;
    // console.log(`"${str}":`, 'R•S:', M.a, M.b, M.c, M.d +',', 'T:', M.e, M.f);
}

export function getLTM(elem) {
    const transformList = elem.transform.baseVal;
    if (transformList.numberOfItems === 0) {
        const svg = elem.ownerSVGElement || elem;
        const identityTransform = svg.createSVGTransformFromMatrix(svg.createSVGMatrix());
        transformList.appendItem(identityTransform);
        return identityTransform.matrix; // This is live
    }
    else {
        const consolidated = transformList.consolidate();
        return consolidated.matrix;
    }
};

export function getAnglePosScale(M) {
    const scale = M.a * M.d - M.b * M.c;

    return { angle: Math.acos(M.a/scale), pos: { x: M.e, y: M.f }, scale }
};

