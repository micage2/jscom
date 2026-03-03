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

function get_viewbox(svg) {
    const viewbox = svg.getAttribute('viewBox');
    const [x, y, w, h] = viewbox.split(' ');
    return { x, y, w, h };
}

function set_viewbox(svg, vb) {
    const str = Object.values(vb).join(' ');
    svg.setAttribute('viewBox', str);
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
    window.MMM = {
        svg,
        viewBox: [0, 0, 72, 36]
    };
    const vb = svg.viewBox.baseVal;
    vb.x -= 96; vb.height *= 4;
    vb.y -= 48; vb.width *= 4;

    this.call('text', svg.getAttribute('name'));

    console.log(svg.getScreenCTM().toString());
    console.log(svg.getCTM());


    svg._onpointerdown = draggable((pos) => {
        this.call('text', screenToSVG(svg, pos.dx, pos.dy).toString());

        let viewbox = get_viewbox(svg);
        viewbox.x -= pos.dx;
        viewbox.y -= pos.dy;
        set_viewbox(svg, viewbox);
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

    let isPanning = false;
    let startX, startY;

    svg.addEventListener("mousedown", (e) => {
        isPanning = true;
        startX = e.clientX;
        startY = e.clientY;
        svg.style.cursor = "grabbing";

        e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
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

    document.addEventListener("mouseup", () => {
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

    if (args.file) {
        load_file(args.file).then((str) => {
            doc.innerHTML = str;
            svg = shadow.querySelector('svg');

            doc.onclick = () => this.call('text', svg.getAttribute('name'));

            ready.call(this, svg);
        });
    }
    else {
        out.textContent = "Please, load an SVG file!";
    }

    // svg.onclick = function(e) { this.classList.toggle('selected'); }

    return {
        getHost: () => host,
        getInstance: () => ({

        }),
    };
}

// creates ISVGView interface objects
const ISVGViewFactory = (self) => {
    return {
    };
};

const clsid = DOM.register(ctor, function (role, action, reaction) {

    role("SVGView", self => ISVGViewFactory(self), true);

});
export default clsid;