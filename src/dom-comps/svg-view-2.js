// src/dom-comps/svg-view.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { makeFragment, load_sheet, create_sheet, load_file } from '../shared/dom-helper.js';

// f({...args,  height: 200, width: 300}
// { height = 200, width = 300, ...(args ?? {}) }

const makehtml = (args) => {
    const {
        width = 300,
        height = 300,
        ...otherArgs
    } = { ...(args ?? {}) };
    return `
<style>
    :host {
        display: flex;
        flex-direction: column;
        height: 100%;        
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
    }
    .svg-view svg.selected {
        border: 1px dashed #aaa;
    }
    path:hover {
        stroke: #fa0;
    }
</style>
<div class="svg-view"></div>
`};
const html = makehtml();
const fragment = makeFragment(html);

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

function ready(svg) {
    const vb = svg.viewBox.baseVal;
    vb.x -= 96; vb.height *= 4;
    vb.y -= 48; vb.width *= 4;

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

    let isPanning = false;
    let startX, startY;

    svg.addEventListener("pointerdown", (e) => {
        isPanning = true;
        startX = e.clientX;
        startY = e.clientY;
        svg.style.cursor = "grabbing";

        e.preventDefault();
    });

    document.addEventListener("pointermove", (e) => {
        if (!isPanning) return;
        const ctm = svg.getScreenCTM();
        const dx = (e.clientX - startX) / ctm.a;
        const dy = (e.clientY - startY) / ctm.d;

        const vb = svg.viewBox.baseVal;
        vb.x -= dx;
        vb.y -= dy;

        startX = e.clientX;
        startY = e.clientY;
    });

    document.addEventListener("pointerup", () => {
        isPanning = false;
        svg.style.cursor = "grab";
    });
}

function ctor(args = {}, call) {
    const that = this; // maybe needed

    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.appendChild(fragment.cloneNode(true));

    const doc = shadow.querySelector('.svg-view');
    let svg = null;

    return {
        getHost: () => host,
        getInstance: () => ({
            doc, svg, shadow
        }),
    };
}

// creates ISVGView interface objects
const ISVGViewFactory = ({ doc, svg, shadow }) => {
    return {
        load(myfile) {
            if (typeof myfile === 'string') {
                load_file(myfile).then((str) => {
                    doc.innerHTML = str;
                    svg = shadow.querySelector('svg');

                    ready.call(this, svg);
                });
            }
            else {
                doc.innerHTML = `<svg viewBox="0 0 64 32">
                <path d="m -4 6 h-10 v10 h10 z" stroke="red" fill="none" />
                <text y="16" fill="#ddd">no svg file</Text>
                </svg>`;
                svg = shadow.querySelector('svg');
                ready.call(this, svg);
        }
            return this;
        }
    };
};

const clsid = DOM.register(ctor, function (role, action, reaction) {

    role("SVGView", self => ISVGViewFactory(self), true);

    reaction('file', function(myfile) { this.load(myfile); });

});
export default clsid;