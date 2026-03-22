// src/dom-comps/svg-view.js
import { DomRegistry as DOM } from '../dom-registry.js';
import {
    makeFragment,
    load_sheet,
    create_sheet,
    load_file
} from '../shared/dom-helper.js';
import {
    ISVGBase,
    ISVGGroup,
    ISVGDocument,
    ISVGPath
} from '../shared/svg.js'


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

function getPos(pd, i) {
    const { type, values } = pd[i];
    if (type === 'M') return { x: values[0], y: values[1] };
    else
        if (type === 'S') return { x: values[2], y: values[3] };
        else
            if (type === 'C') return { x: values[4], y: values[5] };
}
function setPosX(pd, i, x) {
    if (pd[i].type === 'M') pd[i].values[0] = x;
    else
        if (pd[i].type === 'S') pd[i].values[2] = x;
        else
            if (pd[i].type === 'C') pd[i].values[4] = x;
}
function setPosY(pd, i, y) {
    if (pd[i].type === 'M') pd[i].values[1] = y;
    else
        if (pd[i].type === 'S') pd[i].values[3] = y;
        else
            if (pd[i].type === 'C') pd[i].values[5] = y;
}
function setPos(pd, i, x, y) {
    const { type, values } = pd[i];
    if (type === 'M') { values[0] = x; values[1] = y; }
    else
        if (type === 'S') { values[2] = x; values[3] = y; }
        else
            if (type === 'C') { values[4] = x; values[5] = y; }
}

function draggable(ondrag) {
    let x, y;
    return (e) => {
        // e.target
        document.onpointermove = (e) => {
            ondrag({
                dx: e.movementX || 0,
                dy: e.movementY || 0,
                sx: e.screenX,
                sy: e.screenY,
            });
        };
        document.onpointerup = (e) => {
            document.onpointermove = null;
            document.onpointerup = null;
        }
    }
}

function screenToSVG(svg, x, y) {
    const pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
}
screenToSVG;

SVGMatrix.prototype.toString = function () {
    return `a: ${this.a.toFixed(2)} b: ${this.b} c: ${this.c} d: ${this.d.toFixed(2)} e: ${this.e} f: ${this.f}`;
}

SVGPoint.prototype.toString = function () {
    return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
}

function createInterface(elem) {
    let iface;
    switch (elem.nodeName) {
        case 'svg': iface = ISVGDocument(elem); break;
        case 'g': iface = ISVGGroup(elem); break;
        case 'path': iface = ISVGPath(elem); break;
        default: iface = ISVGBase(elem); break;
    }

    return iface;
}

function ready({ svg, iface2elem, elem2iface, selected, options }) {
    if (!svg) return;

    if (options.mode === 'isolate') {
        svg.classList.add('isolate-mode');
    }

    const MOVE_THRESHOLD = 5;
    let hasMoved = false; 

    // adjust viewBox
    const vb = svg.viewBox.baseVal;
    const bb = svg.getBBox();
    vb.x = bb.x - (bb.width-vb.x) * .05;
    vb.y = bb.y - (bb.height-vb.y) * .05;
    vb.height = bb.height + (bb.height-vb.y) * .1;
    vb.width = bb.width + (bb.width-vb.x) * .2;

    let isPanning = false;
    let startX, startY;
    let realTarget = null;

    svg.addEventListener("pointerdown", (e) => {
        isPanning = true;
        hasMoved = false;
        startX = e.clientX;
        startY = e.clientY;
        // svg.style.cursor = "grabbing";
        e.preventDefault();
        e.stopPropagation();

        realTarget = e.target;

        console.log('pointer down', e.target);
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
        // svg.style.cursor = "grab";

        if (!hasMoved) {
            let target = e.target;

            const composedPath = e.composedPath();

            const iface = elem2iface.get(realTarget);
            console.log('pointerup', e.target, realTarget);
            if (iface)
                this.emit('selected', iface);
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

    const stack = [{
        elem: svg,
        depth: 0,
        num_children: svg.children.length,
        is_last: true,
    }];

    while (stack.length) {
        const node = stack.pop();

        const iface = createInterface(node.elem);

        iface2elem.set(iface, node.elem);
        elem2iface.set(node.elem, iface);

        // pre-order visitor
        this.emit('svg-node', {
            type: node.elem.nodeName,
            name: node.elem.getAttribute('name'),
            depth: node.depth,
            num_children: node.num_children,
            is_last: node.is_last,
            iface,
        });

        const children = [...node.elem.children];
        const index = children.findIndex(c => c.nodeName === 'script');
        if (index !== -1) {
            children.splice(index, 1);
        }
        for (let i = children.length - 1; i >= 0; i--) {
            const child = children[i];
            stack.push({
                elem: child,
                depth: node.depth + 1,
                num_children: child.children.length,
                is_last: i === children.length - 1
            });
        }
    }
}

function ctor(args = {}) {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.adoptedStyleSheets.push(sheet);

    shadow.innerHTML = '<div class="svg-view"></div>';
    const doc = shadow.querySelector('.svg-view');

    const svg = null;

    const selected = null;

    // bi-directional look-up
    const iface2elem = new WeakMap();
    const elem2iface = new WeakMap();

    return {
        getHost: () => host,
        getInstance: () => ({
            shadow, doc, svg, iface2elem, elem2iface, selected
        }),
    };
}

// creates ISVGView interface objects
const ISVGViewFactory = ({ shadow, doc, svg, iface2elem, elem2iface, selected }) => {
    return {
        load(myfile, options = { mode: 'default' }) {
            if (typeof myfile === 'string') {
                load_file(myfile).then((str) => {
                    doc.innerHTML = str;
                    svg = shadow.querySelector('svg');

                    ready.call(this, { svg, iface2elem, elem2iface, selected, options });
                    this.emit('svg-loaded');
                });
            }
            else {
                doc.innerHTML = `<svg viewBox="0 0 64 64">
                <path d="m -4 6 h-10 v10 h10 z" stroke="red" fill="none" />
                <text y="16" fill="#ddd">no svg file</Text>
                </svg>`;
                const svg = shadow.querySelector('svg');
                ready.call(this, { svg, iface2elem, elem2iface, selected, options });
            }

            return this;
        },

        deselect(iface) {
            if (!iface) return;

            const elem = iface2elem.get(iface);

            if (selected === elem) {
                selected.classList.remove('selected');
                selected = null;
            }
        },

        isolateSelect2(iface) {
            if (!iface) return;
            if (!svg) return;

            const elem = iface2elem.get(iface);
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

const clsid = DOM.register(ctor, function (role, action, reaction) {
    role("SVGView", self => ISVGViewFactory(self), true);
});
export default clsid;