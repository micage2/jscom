// src/dom-comps/svg-view.js
import { DomRegistry as DOM } from '../dom-registry.js';
import {
    makeFragment,
    load_sheet,
    create_sheet,
    load_file
} from '../shared/dom-helper.js';

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
    const self = {};
    self.host = document.createElement('div');
    const shadow = self.host.attachShadow({ mode: 'closed' });
    shadow.adoptedStyleSheets.push(sheet);
    shadow.innerHTML = '<div class="svg-view"></div>';
    self.doc = shadow.querySelector('.svg-view');

    prop.on('prop-added', (_prop) => {
        self.prop = _prop;
        const svg = _prop.get();
        self.elem2prop.set(svg, _prop);
        self.doc.appendChild(svg);
        init.bind(this)(self);
        this.emit('ready', this);
    });

    // bi-directional look-up
    self.elem2prop = new WeakMap();

    return {
        getHost: () => self.host,
        getInstance: () => self,
        // postCreate: init
    };
}

function init(self) {
    const MOVE_THRESHOLD = 5;
    let hasMoved = false; 
    let isPanning = false;
    let startX, startY;
    let realTarget = null;

    const svg = self.prop.get(); // SVGSVGElement
    
    svg.addEventListener("pointerdown", (e) => {
        isPanning = true;
        hasMoved = false;
        startX = e.clientX;
        startY = e.clientY;
        // svg.style.cursor = "grabbing";
        e.preventDefault();
        e.stopPropagation();

        realTarget = e.target;

        // console.log('pointer down', e.target);
    });

    document.addEventListener("pointermove", (e) => {
        if (!isPanning) return;

        const ctm = svg.getScreenCTM();
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) {
            hasMoved = true;               // ← this was a real pan, not a click
        }

        if (!hasMoved) return; // still waiting to decide if it's a click or pan

        const vb = svg.viewBox.baseVal;
        vb.x -= (dx / ctm.a);
        vb.y -= (dy / ctm.d);

        startX = e.clientX;
        startY = e.clientY;
    });

    document.addEventListener("pointerup", (e) => {
        if (!isPanning) return;
        isPanning = false;

        if (!hasMoved) {
            const selectedProp = findProp(self, realTarget)
            this.emit('selected', selectedProp);
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

}

// creates ISVGView interface objects
const ISVGViewFactory = (self) => {
    return {
        deselect(iface) {
            if (!iface) return;

            const elem = iface2elem.get(iface);

            if (selected === elem) {
                selected.classList.remove('selected');
                selected = null;
            }
        },

        // only sets style of selected element
        toggleHighLight(prop) {
            if (!prop) debugger;
            const elem = prop.get();
            const svg = self.prop.get();

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