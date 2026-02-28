// src/dom-comps/svg-view.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { makeFragment } from '../shared/dom-helper.js';

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
        margin: auto;
    }
    .svg-view svg {
        border: 1px dashed transparent;
    }
    .svg-view svg.selected {
        border: 1px dashed #aaa;
    }
    .output {
        position: absolute;
        bottom: 2px;
    }
    circle { stroke: #2b4; }
    circle.selected { stroke: #48d; fill: red;}
    circle:hover,
    path:hover {
        stroke: #fa0;
        fill: #444;
    }
</style>
<div class="svg-view">
    <svg width="${width}" height="${height}" viewBox="0 0 72 72" 
        xmlns="http://www.w3.org/2000/svg">
        <style>
            .heavy {
                font: 36px sans-serif;
            }
        </style>
        <g stroke-width="1" stroke="#ccc" fill="none"
        stroke-linecap="round" stroke-miterlimit="0.5"
        transform="translate(36 36) scale(1, -1) "
        >
            <path d="
                m   0 -20
                
                c  10  10     35  20     25  40

                c   0   0    -10  20    -25   0
                c   0   0      0   0    -25   0
                s   0   0     25 -40
                " />
            <circle cx="0" cy="-20" r="1" stroke="green"/>
            <circle cx="25" cy="20" r="1" stroke="green"/>
            <circle cx="0" cy="20" r="1" stroke="green"/>
            <circle cx="-25" cy="20" r="1" stroke="green"/>
            <circle cx="0" cy="-20" r="1" stroke="green"/>
        </g>
    </svg>
    <div><span class="output">ddd</span></div>
</div>
`};
const html = makehtml();
const fragment = makeFragment(html);

function getPos(pd, i) {
    const {type, values} = pd[i];
    if (type === 'M') return {x: values[0], y: values[1]};
    else
    if (type === 'S') return {x: values[2], y: values[3]};
    else
    if (type === 'C') return {x: values[4], y: values[5]};
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
    const {type, values} = pd[i];
    if (type === 'M'){ values[0] = x; values[1] = y; }
    else
    if (type === 'S'){ values[2] = x; values[3] = y; }
    else
    if (type === 'C'){ values[4] = x; values[5] = y; }
}

function ctor(args = {}) {
    const that = this; // onclick needs that :)

    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.appendChild(fragment.cloneNode(true));

    const svg = shadow.querySelector('svg');
    svg.onclick = function(e) { this.classList.toggle('selected'); }

    const path = shadow.querySelector('path');
    const path_data_0 = path.getPathData({ normalize: true });
    const path_data = path.getPathData({ normalize: true });
    // console.log(path_data);

    let selected = { v: 0 };

    const svg_circles = shadow.querySelectorAll('circle');
    svg_circles.forEach((c, i, a) => {
        
        c.__index = i;
        let pos = getPos(path_data, i);
        c.cx.baseVal.value = pos.x;
        c.cy.baseVal.value = pos.y;

        c.onclick = function(e) {
            a[selected.v].classList.remove('selected');
            this.classList.add('selected');

            selected.v = c.__index;
            
            const pos = getPos(path_data, selected.v);
            shadow.querySelector('.output').textContent = 
                `selected: [${selected.v}] (${pos.x}, ${pos.y})`;
            
            that.call('point-x', { pos: pos.x, min: -34, max: 34});
            that.call('point-y', { pos: pos.y, min: -34, max: 34});
        }
    });
    setTimeout(() => { // time to establish connection to PropView
        const J = svg_circles.length - 1;
        svg_circles[J].dispatchEvent(new Event('click'));        
    }, 42);

    return {
        getHost: () => host,
        getInstance: () => ({ selected, path, path_data_0, path_data, svg_circles }),
    };
}

// creates ISVGView interface objects
const ISVGViewFactory = ({ selected, path, path_data_0, path_data, svg_circles }) => {
    return {
        setPointX({ min, pos, max }) {            
            const J = selected.v;
            const pos0 = getPos(path_data, J);
            
            setPosX(path_data, J, pos);
            const pos1 = getPos(path_data, J);
            svg_circles[J].cx.baseVal.value = pos1.x;
            
            path.setPathData(path_data);
                    
            // console.log(`[ISVGView:set-point-x <]  ${min} ${pos} ${max}`);
        },
        setPointY({ min, pos, max }) {
            const J = selected.v;
            const pos0 = getPos(path_data, J);

            setPosY(path_data, J, pos);
            const pos1 = getPos(path_data, J);
            svg_circles[J].cy.baseVal.value = pos1.y;

            path.setPathData(path_data);

            // console.log(`[ISVGView.set-point-y <] ${min} ${pos} ${max}`);
        }
    };
};

const clsid = DOM.register(ctor, function(role, action, reaction) {
    
    role("SVGView", self => ISVGViewFactory(self), true);

    action('point-x');
    action('point-y');

    reaction('set-point-x', function(value) {
        this.setPointX(value);
    });
    reaction('set-point-y', function(value) {
        this.setPointY(value);
    });
});
export default clsid;