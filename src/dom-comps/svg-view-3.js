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
}

.svg-view svg {
    height: 100%;
    width: 100%;
    cursor: default;
}

/* 1. Base "isolate mode" - everything dimmed */
svg.isolate-mode * {
    opacity: 0.5;                  /* Soft fade (recommended for preview) */
}

svg.isolate-mode .isolate-selected {
    opacity: 1;
}

/* 2. Selected node + all its descendants = fully visible */
svg.isolate-mode .selected,
svg.isolate-mode .selected * {
    opacity: 1;
}

/* Optional extras for polish */
svg.isolate-mode .selected {
    stroke: #00ffcc;
}

/* If we prefer strict "only this node" without seeing context at all */
svg.isolate-mode.strict * {
    visibility: hidden;
}

svg.isolate-mode.strict .selected,
svg.isolate-mode.strict .selected * {
    visibility: visible;
}

.SSS use {
    fill: none !important;
    stroke: green !important;
    stroke-width: 1.2 !important;
    stroke-dasharray: 5, 5 !important;
    animation: dash-offset-move 1s linear infinite !important;
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

function selectElement(self, elem) {
    console.assert(!!0, 'not impl.');
}

function findProp(self, elem) {
    let prop = self.elem2prop.get(elem);
    if (prop) return prop;

    self.prop.traverse((_prop, info) => {
        if (!_prop.isGroup()) return;
        const _elem = _prop.get();
        self.elem2prop.set(_elem, _prop);

        // if (elem.id === _prop.getName() || elem.name === _prop.getName()) {
        //     self.elem2prop.set(elem, _prop);
        //     prop = _prop;
        //     return 'stop'; // should stop traversal
        // }
    });

    prop = self.elem2prop.get(elem);
    return prop;
}


function ctor({ prop, config = {} }) {
    const self = { SSS: new Set() };
    self.host = document.createElement('div');
    const shadow = self.host.attachShadow({ mode: 'closed' });
    shadow.adoptedStyleSheets.push(sheet);
    shadow.innerHTML = '<div class="svg-view"></div>';
    self.doc = shadow.querySelector('.svg-view');

    prop.on('child-added', (_prop) => {
        self.prop = _prop;
        const svg = _prop.get();
        self.elem2prop.set(svg, _prop);
        self.doc.appendChild(svg);
        init.bind(this)(self);
        this.emit('ready', this);
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
    $$$.svg = svg;

    // self.$G = new SVGGroupProperty('SSS');
    self.SSS = self.prop.add({
        name: 'SSS',
        type: TYPE_SVG_G,
        config: {
            SSS: {
                class: 'SSS'
            }
        }
    });

    svg.onwheel = (e) => {
        const delta = e.deltaY > 0 ? 1.1 : 0.9;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());

        // Scale around cursor
        const vb = svg.viewBox.baseVal;
        vb.x = svgPt.x - (svgPt.x - vb.x) * delta;
        vb.y = svgPt.y - (svgPt.y - vb.y) * delta;
        vb.width *= delta;
        vb.height *= delta;

        e.preventDefault();
    };

    bindMouse(svg, {
        onClick: (realTarget) => {
            const selectedProp = findProp(self, realTarget)
            this.emit('selected', selectedProp);
        },
        onMove: (dx, dy, keys) => {
            const ctm = svg.getScreenCTM();
            const vb = svg.viewBox.baseVal;
            vb.x -= (dx / ctm.a);
            vb.y -= (dy / ctm.d);
        },
        onScale: (s) => {
        },

    });

}

// Idea 1: props create a <use> element and href to their id
// 

function MMM(M) {
    return `s: ${M.a.toFixed(2)} xy: (${M.e.toFixed(2)}, ${M.f.toFixed(2)})`;
}

// creates ISVGView interface objects
const ISVGViewFactory = (self) => {
    return {
        toggleSelect(prop) {

            if (prop.getType() === TYPE_SVG_SVG) {
                self.SSS.clear();
                return;
            }

            const child = self.SSS.getChild(prop.getName())
            if (child) {
                self.SSS.remove(child.getName());
            }
            else {
                const id = Property.gen_id();
                const elem = prop.get();
                elem.id = id;
                const use = self.SSS.add({
                    name: prop.getName(),
                    type: TYPE_SVG_USE,
                    config: {
                        href: id,
                        class: 'ref'
                    }
                });
                console.log(prop.getType());

                const svgElem = self.prop.get();
                const svgCTM = svgElem.getCTM();
                const useElem = use.get();
                if (prop.getType() !== TYPE_SVG_G) {
                    const elemCTM = elem.getCTM();
                    const useCTM = useElem.getCTM();
                    const svgCTMinv = svgCTM.inverse();
                    const M = svgCTMinv.multiply(elemCTM);
                    useElem.setAttribute('transform', `matrix(${M.a}, ${M.b}, ${M.c}, ${M.d}, ${M.e}, ${M.f})`);
                }
                else if (1) {
                    let parent = elem.parentNode;
                    let accumulated = svgElem.createSVGMatrix();

                    while (parent && parent.tagName !== 'svg') {
                        const res = parent.transform.baseVal.consolidate();
                        const localMatrix = res ? res.matrix : svgElem.createSVGMatrix();
                        console.log(parent.getAttribute('name'), MMM(localMatrix));
                        
                        // accumulated = accumulated.multiply(localMatrix);
                        accumulated = localMatrix.multiply(accumulated);
                        parent = parent.parentNode;
                    }
                    const M = accumulated;
                    console.log('result', MMM(M));

                    useElem.setAttribute('transform', `matrix(${M.a}, ${M.b}, ${M.c}, ${M.d}, ${M.e}, ${M.f})`);
                }

            }
        },

        deselect(prop) {
        },

        // only sets style of selected element
        toggleHighLight(prop) {
            if (!prop) {
                console.warn('[ISVGViewFactory.toggleHighLight]', 'No prop.');
                return;
            };
            if (!prop.isGroup()) return;

            const elem = prop.get();
            const svg = self.prop.get();



            {
                // Remove old highlight from anywhere
                svg.querySelectorAll('.selected').forEach(el => {
                    el.classList.remove('selected');
                    el.classList.remove('isolate-selected');
                });

                svg.classList.add('isolate-mode');
                if (elem === svg) {
                    elem.classList.toggle('isolate-mode', false);
                    return;
                }

                if (!elem) return;

                elem.classList.add('selected');  // only this node + children lights up
                let parent = elem.parentElement;
                while (parent && parent !== svg) {
                    parent.classList.add('isolate-selected');
                    parent = parent.parentElement;
                }
            }
        },
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