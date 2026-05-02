// src/dom-comps/svg-view.js
import { DomRegistry as DOM } from '../dom-registry.js';
import {
    makeFragment,
    load_sheet,
    create_sheet,
    load_file,
    bindMouse
} from '../shared/dom-helper.js';
import { Property } from "../shared/property.js";
import {
    TYPE_SVG_G,
    TYPE_SVG_USE,
    TYPE_SVG_SVG,
    getLTM, getAnglePosScale,
} from "../shared/svg_property.js";


/*
    emits:
        'selected',
*/


const sheet = create_sheet(`
:host {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    gap: 16px;
    background: #1e1e1e;
    color: #ddd;
}
.svg-view {
    height: 100%;
    width: 100%;
    position: relative;
}
.svg-view svg {
    height: 100%;
    width: 100%;
    cursor: default;
    stroke-width: 0.5 !important;
}

.SSS use {
    fill: none !important;
    stroke: hsl(50, 80%, 40%) !important;
    stroke-width: 0.5 !important;
    stroke-dasharray: 5, 5 !important;
    animation: dash-offset-move 1s linear infinite !important;
}

.info {
    position: absolute;
    bottom: 20px;
    left: 20px;
}

@keyframes dash-offset-move {
  to {
    stroke-dashoffset: 10; /* Move by the total pattern length (5+5) */
  }
}
`);

function screenToSVG(svg, x, y) {
    const pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
}

// log SVGMatrix
function MMM(M) {
    return `s: ${M.a.toFixed(2)} xy: (${M.e.toFixed(2)}, ${M.f.toFixed(2)})`;
}

function findProp(self, elem) {
    let prop = self.elem2prop.get(elem);
    if (prop) return prop;

    // TODO: stop if elem is found
    self.prop.traverse((_prop, info) => {
        if (!isSVG(_prop)) return;
        const _elem = _prop.get();
        self.elem2prop.set(_elem, _prop);
    });

    prop = self.elem2prop.get(elem);
    return prop;
}

function isSVG(prop) {
    const type = prop.getType();
    const arr = type.split('.');
    if (arr.length < 2) return false;
    if (arr[0] !== 'svg') return false;
    if (arr[1] === 'file') return false;
    if (arr[1] === 'svg') return false; // TODO: strange decision

    return true;
}


function ctor({ prop, config = {} }) {
    const self = { SSS: new Set(), svg: null };
    self.host = document.createElement('div');
    const shadow = self.host.attachShadow({ mode: 'closed' });
    shadow.adoptedStyleSheets.push(sheet);
    shadow.innerHTML = `
    <div class="svg-view">
        <span class="info"></span>
    </div>`;
    self.doc = shadow.querySelector('.svg-view');
    self.info = shadow.querySelector('.info');

    // file is loaded once child 'content' is added
    prop.on('child-added', (child) => {
        self.prop = child;
        const svg = child.get(); // value of child 'content'
        self.elem2prop.set(svg, child);
        self.doc.appendChild(svg); // add to root div
        init.bind(this)(self);
        this.emit('ready', {view: this, prop: child });
    });
    this.on('info', (text) => { self.info.textContent = text; });

    // SVG*Element → Property
    self.elem2prop = new WeakMap();

    return {
        getHost: () => self.host,
        getInstance: () => self,
        // postCreate: init
    };
}

// called when child prop 'content' exists
function init(self) {
    const that = this;

    const svg = self.prop.get(); // SVGSVGElement
    self.svg = svg;
    const svgCTM = svg.getCTM();

    // self.$G = new SVGGroupProperty('SSS');
    $$$.SSS = self.SSS = self.prop.add({
        name: 'SSS',
        type: TYPE_SVG_G,
        config: {
            SSS: {
                class: 'SSS'
            }
        }
    });

    const binder = bindMouse(svg)
    binder.on('click', ({ target }) => {
        const selectedProp = findProp(self, target);
        if (!selectedProp) debugger;

        this.emit('selected', selectedProp);
        that.emit('info', selectedProp.getName());
    })
    binder.on('move', ({ target, dx, dy }) => {
        const prop = findProp(self, target); // selected
        if (!prop) debugger;
        this.emit('move-selected', { prop, dx, dy });
    })
    binder.on('wheel', ({ target, delta, x, y }) => {
        const prop = findProp(self, target) // selected
        this.emit('scale-selected', { prop, delta, x, y });
    });

    self.prop.traverse((prop, info) => {
        if(isSVG(prop)) {
            // Property.visitor(prop, info);
            const elem = prop.get();

            const ltm = getLTM(prop.get());
            const {angle, pos, scale} = getAnglePosScale(ltm);

            const frame = prop.add({ name: 'frame', value: {}});

            const a = frame.add({ name: 'angle', value: angle });
            const x = frame.add({ name: 'x', value: ltm.e });
            x.on('value-changed', ({ newValue, oldValue }) => {
                const svgCTM = elem.ownerSVGElement.getCTM();
                // const gg = g.transform.baseVal.getItem(0);
                // gg.setTranslate(ltm.e, newValue/svgCTM.d);
                // ltm.e = newValue;
                ltm.e = newValue/svgCTM.a;
                // ltm.e -= (oldValue-newValue)/svgCTM.a;
                // ltm.e -= (oldValue-newValue);
            });
            const y = frame.add({ name: 'y', value: ltm.f });
            y.on('value-changed', ({ newValue, oldValue }) => {
                const svgCTM = elem.ownerSVGElement.getCTM();
                // const gg = g.transform.baseVal.getItem(0);
                // gg.setTranslate(ltm.e, newValue/svgCTM.d);
                // ltm.f = newValue;
                ltm.f = newValue/svgCTM.d;
                // ltm.f -= (oldValue-newValue)/svgCTM.d;
                // ltm.f -= (oldValue-newValue);
            });
            const s = frame.add({ name: 'scale', value: scale });

        }
    });

}

// creates ISVGView interface objects
const ISVGViewFactory = (self) => {
    return {
        // selection feedback is done by <use> clones added to <g class="SSS">
        toggleSelected(prop) {
            const propType = prop.getType();

            // no full scene selection
            if (propType === TYPE_SVG_SVG) {
                self.SSS.clear(); // de-highlight all
                return true;
            }

            // is element already higlighted? then remove highlight
            const propName = prop.getName();
            const high = self.SSS.getChild(propName);
            if (high) {
                self.SSS.abandon(high);
                return false;
            }

            self.SSS.clear();

            // make sure id of clone and original match
            const id = Property.gen_id();
            const elem = prop.get();
            elem.id = id;

            // add clone to selection group
            const use = self.SSS.add({
                name: propName,
                type: TYPE_SVG_USE,
                config: {
                    href: id,
                }
            });

            // clone is in different hierarchy, handle coord trafo
            const svgElem = self.prop.get();        // <svg>
            const svgCTM = svgElem.getCTM();        // V = M_{svg}, view matrix
            const svgCTMinv = svgCTM.inverse();     // V^{-1}
            const useElem = use.get();
            const useCTM = useElem.getCTM();
            let elemCTM;

            // handle leafs and groups differently
            // elemCTM = prop.getType() === TYPE_SVG_G ? elem.parentNode.getCTM() : elem.getCTM();
            elemCTM = elem.parentNode.getCTM();
            const M = svgCTMinv.multiply(elemCTM); // strip view matrix
            useElem.setAttribute('transform', `matrix(${M.a}, ${M.b}, ${M.c}, ${M.d}, ${M.e}, ${M.f})`);

            return true;
        },

        isSelected(prop) {
            const name = prop.getName();
            const child = self.SSS.getChild(name);
            return !!child;
        },

        pan(dx, dy) {
            const ctm = self.svg.getCTM();
            const vb = self.svg.viewBox.baseVal;
            vb.x -= (dx / ctm.a);
            vb.y -= (dy / ctm.d);
        },

        zoom(delta, center = { x: 0, y: 0 }) {
            const scale = delta > 0 ? 1.1 : 0.9;
            const pt = self.svg.createSVGPoint();
            pt.x = center.x;
            pt.y = center.y;
            const svgCTM_inv = self.svg.getScreenCTM().inverse();
            const svgPt = pt.matrixTransform(svgCTM_inv);

            const vb = self.svg.viewBox.baseVal;
            vb.x = svgPt.x - (svgPt.x - vb.x) * scale;
            vb.y = svgPt.y - (svgPt.y - vb.y) * scale;
            vb.width *= scale;
            vb.height *= scale;
        },

        move(prop, dx, dy) {
            // console.log('move', dx, dy);
            const svgCTM = self.svg.getCTM();
            const elem = prop.get();

            const transforms = elem.transform.baseVal;
            // if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
            if (transforms.length === 0) {
              const translate = self.svg.createSVGTransform();
              translate.setTranslate(0, 0);
              elem.transform.baseVal.appendItem(translate);
            }
            
            // Update the first transform item during drag
            const transform = transforms.getItem(0);
            const M = transform.matrix;
            transform.setTranslate(M.e + dx/svgCTM.a, M.f + dy/svgCTM.d);
        },

        _move(prop, dx, dy) {
            const svgCTM = self.svg.getCTM();
            const frame = prop.getChild('frame');
            const x = frame.getChild('x');
            const y = frame.getChild('y');
            if (!x || !y) return;
            x.set(x.get() + dx);
            y.set(y.get() + dy);
        },

        scale(prop, delta, dx, dy) {
            console.log(prop, delta, dx, dy);
        },

        prop: self.prop,
    };
};

const info = {
    clsid: 'jscom.dom-comps.svg-view-3',
    name: 'SVGView',
    description: 'SVG view with pan and zoon'
};

const clsid = DOM.register(ctor, function (role) {
    role("SVGView", self => ISVGViewFactory(self), true);
}, info);
export default info.clsid;