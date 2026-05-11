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
    TYPE_SVG_RECT,
    TYPE_SVG_G,
    TYPE_SVG_USE,
    TYPE_SVG_SVG,
    TYPE_SVG_CIRCLE,
    TYPE_SVG_PATH,
    getLTM, getPosAngleScale,
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

.SSS {
    fill: none !important;
    stroke: hsl(50, 80%, 40%);
    stroke-width: 0.5;
    stroke-dashoffset: 30;
    stroke-dasharray: 2, 2;
    animation: dash-offset-move 10s linear infinite;
}

.sel {
    fill: none !important;
    stroke: hsl(50, 60%, 40%);
    stroke-width: 0.5;
    stroke-dasharray: 2, 2;
    stroke-dashoffset: 30;
    animation: dash-offset-move 10s linear infinite;
}

.info {
    position: absolute;
    bottom: 20px;
    left: 20px;
}

@keyframes dash-offset-move {
  to {
    stroke-dashoffset: 0; /* Move by the total pattern length (5+5) */
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

function isSVGLeaf(prop) {
    const type = prop.getType();
    if (type === TYPE_SVG_CIRCLE) return true;
    if (type === TYPE_SVG_RECT) return true;
    if (type === TYPE_SVG_PATH) return true;

    return false;
}

function findInRect(self, rect) {
    const found = [];
    const M = self.svg.getScreenCTM();
    let {x, y, width, height} = rect.get().getBBox({stroke: true});
    // transform rect to screen
    x = x * M.a + M.e; y = y * M.d + M.f; width *= M.a; height *= M.d;

    self.prop.traverse(prop => {
        if (!isSVGLeaf(prop) || prop === rect) return;
        const elemBbox = prop.get().getBoundingClientRect(); // screen box
        if (elemBbox.x > x && elemBbox.x + elemBbox.width < x + width
            && elemBbox.y > y && elemBbox.y + elemBbox.height < y + height
        ) {
            found.push(prop);
        }
    });

    return found;
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
    this.on('info', (text) => {
        self.info.textContent = text;
    });

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
            hidden: true,
            SSS: {
                class: 'SSS'
            }
        }
    });

    let selecting = null, selX, selY;
    const binder = bindMouse(svg);
    binder.on('pointer-down', ({ target, x, y, keys }) => {
        if (keys.alt) {
            console.log('ALT');
            const ctm = svg.getScreenCTM().inverse();
            // const ctm = svg.getCTM().inverse();
            selecting = self.SSS.add({ 
                name: 'sel-rect', 
                type: TYPE_SVG_RECT, 
                config: {
                    'sel-rect': {
                        x: x * ctm.a + ctm.e, 
                        y: y * ctm.d + ctm.f, 
                        witdh: 1, height:1, 
                        class: 'sel'
                    }
                }
            });
        }
    });
    binder.on('click', ({ target }) => {
        const clickedProp = findProp(self, target);
        if (!clickedProp) debugger;

        const propName = clickedProp.getName();
        const clone = self.SSS.getChild(propName);
        if (clone) {
            this.emit('deselected', clickedProp);
            this.emit('selected', self.prop);
        }
        else {
            this.emit('selected', clickedProp);
        }
        that.emit('info', clickedProp.getName());
    })
    binder.on('move', ({ target, dx, dy }) => {
        if (selecting) {
            const svgCTM = svg.getScreenCTM();
            const h = selecting.getChild('h');
            h.set(h.get() + dy/svgCTM.a); // transformed delta y to svg
            const w = selecting.getChild('w');
            w.set(w.get() + dx/svgCTM.d);
        }
        else {
            const prop = findProp(self, target); // selected
            if (!prop) debugger;
            this.emit('move-selected', { prop, dx, dy });
        }
    });
    binder.on('pointer-up', () => {
        if (selecting) {
            const found = findInRect(self, selecting);
            this.emit('rect-selected', found);
        }

        self.SSS.remove('sel-rect');
        selecting = null;
    });
    binder.on('wheel', ({ target, delta, x, y }) => {
        const prop = findProp(self, target) // selected
        this.emit('scale-selected', { prop, delta, x, y });
    });

    // add frame and child props position, angle, scale
    self.prop.traverse((prop, info) => {
        if(isSVG(prop) && prop !== self.SSS) {
            // Property.visitor(prop, info);
            const elem = prop.get();

            const ltm = getLTM(prop.get());
            const {pos, angle, scale} = getPosAngleScale(ltm);

            const frame = prop.add({ name: 'frame', value: {}});

            const a = frame.add({ name: 'angle', value: angle });
            const x = frame.add({ name: 'x', value: ltm.e });
            x.on('value-changed', ({ newValue, oldValue }) => {
                const svgCTM = elem.ownerSVGElement.getCTM();
                // const gg = g.transform.baseVal.getItem(0);
                // gg.setTranslate(ltm.e, newValue/svgCTM.d);
                ltm.e = newValue;
                // ltm.e = newValue/svgCTM.a;
                // ltm.e -= (oldValue-newValue)/svgCTM.a;
                // ltm.e -= (oldValue-newValue);
            });
            const y = frame.add({ name: 'y', value: ltm.f });
            y.on('value-changed', ({ newValue, oldValue }) => {
                const svgCTM = elem.ownerSVGElement.getCTM();
                // const gg = g.transform.baseVal.getItem(0);
                // gg.setTranslate(ltm.e, newValue/svgCTM.d);
                ltm.f = newValue;
                // ltm.f = newValue/svgCTM.d;
                // ltm.f -= (oldValue-newValue)/svgCTM.d;
                // ltm.f -= (oldValue-newValue);
            });
            const s = frame.add({ name: 'scale', value: scale });

        }
    });

    self.binder = binder;
}

// creates ISVGView interface objects
const ISVGViewFactory = (self) => {
    return {
        // selection feedback is done by <use> clones added to <g class="SSS">
        toggleMark(prop, bool = true) {
            const propType = prop.getType();

            // no full scene selection
            if (propType === TYPE_SVG_SVG) {
                return true;
            }

            // make sure id of clone and original match
            const id = Property.gen_id();
            const elem = prop.get();
            elem.id = id;

            // add clone to selection group
            const use = self.SSS.add({
                name: prop.getName(),
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

        deselectAll() {
            self.SSS.clear();
        },

        isSelected(prop) {
            const propname = prop.getName();
            if (!self.SSS.getChild(propname)) {
                let parent = prop.getParent();
                while (parent) {
                    const name = parent.getName();
                    const inSSS = self.SSS.getChild(name);
                    if(inSSS) return true;
                    parent = parent.getParent();
                }
            }
            return false;
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

            const pas = getPosAngleScale(M);
            const frame = prop.getChild('frame');
            frame.getChild('x').set(pas.pos.x);
            frame.getChild('y').set(pas.pos.y);
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

        unbindMouse() {
            self.binder.emit('off');
        },

        prop: self.prop,
    };
};

const info = {
    clsid: 'jscom.dom-comps.svg-view-4',
    name: 'SVGView',
    description: 'SVG view with pan and zoon'
};

const clsid = DOM.register(ctor, function (role) {
    role("SVGView", self => ISVGViewFactory(self), true);
}, info);
export default info.clsid;