// src/dom-comps/test-view.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { makeFragment } from '../shared/dom-helper.js';

const fragment = makeFragment(`
    <style>
        :host {
            display: flex;
            flex-direction: column;
            height: 100%;        
            background: var(--color-bg);
            color:  var(--color-text);
        }
        .prop-view {
            height: 100%;
            overflow: hidden auto;
            scrollbar-gutter: stable;
        }
        .prop-view::-webkit-scrollbar {
            width: 10px;
        }
        .prop-view::-webkit-scrollbar-track {
            opacity: 0;
        }
        .prop-view::-webkit-scrollbar-thumb {
            background: #444;
            opacity: 0 !important;
        }
        .slider {
            display: flex;
            justify-content: space-between;
            padding: 12px 22px;
        }
        .slider label {
            width: 80px;
            text-overflow: ellipsis;
            user-select: none;
        }
        .slider input { width: 60%; }
        .slider input {}
        .slider output {width: 40px;}
    </style>
    <div class="prop-view"></div>
`);
    
const slider_frag = makeFragment(`
<div class="slider">
    <label>val</label>
    <input type="range" min="0" max="1" step="0.01" value="0">
    <output>0</output>
</div>        
`);

function setup_slider(sldr, options) {
    const {
        title = "val", value = 0, min = -1, max = 1,
        ...otherArgs
    } = { ...(options ?? {}) };

    const [label, slider, output] = [...sldr.children];
    label.textContent = title;
    // slider.value = value;
    // slider.min = min;
    // slider.max = max;
    slider.oninput = (e) => {
        output.textContent = +slider.value;
        this.call(options.prop, {pos: +slider.value, min: slider.min , max: slider.max});
    }
    output.textContent = slider.value;
}

/*
    const input = document.getElementById('myRange');
    const datalist = document.createElement('datalist');
    // Add options to datalist...

    // Direct assignment without using ID
    input.list = datalist;

    // Append datalist to DOM (still required)
    document.body.appendChild(datalist);   
*/
            
function ctor(args = {}) {
    // const call = this.call;
    const sliders = new Map();

    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.appendChild(fragment.cloneNode(true));    
    
    const propview = shadow.querySelector('.prop-view');
    propview.appendChild(slider_frag.cloneNode(true));
    propview.appendChild(slider_frag.cloneNode(true));

    const [slider1, slider2] = shadow.querySelectorAll('.slider');
    setup_slider.call(this, slider1, { title: 'pos.x', prop: "value.1" });
    setup_slider.call(this, slider2, { title: 'pos.y', prop: "value.2" });

    return {
        getHost: () => host,
        getInstance: () => [slider1, slider2],
    };
}


const IPropViewFactory = ([slider1, slider2]) => {

    const [l1, s1, o1] = [...slider1.children]
    const [l2, s2, o2] = [...slider2.children]

    return {
        value1({ min, pos, max }) {
            s1.min = min;
            s1.max = max;
            s1.value = pos;
            o1.textContent = pos;
            
            // console.log(`[IPropView:value.1 <] ${min} ${pos} ${max}`);
        },
        value2({ min, pos, max }) {
            s2.min = min;
            s2.max = max;
            s2.value = pos;
            o2.textContent = pos;
            
            // console.log(`[IPropView:value.2 <] ${min} ${pos} ${max}`);            
        }
    };
};

const clsid = DOM.register(ctor, function(role, action, reaction) {
    
    role("TestView", self => IPropViewFactory(self), true);
    
    action('value.1');
    action('value.2');

    reaction('value.1', function(value) {
        this.value1(value);
    });
    reaction('value.2', function(value) {
        this.value2(value);
    });
});

const ACTION_VALUE1 = Symbol.for('PropView:value.1');
const ACTION_VALUE2 = Symbol.for('PropView:value.2');
const REACTION_VALUE1 = Symbol.for('PropView:value.1');
const REACTION_VALUE2 = Symbol.for('PropView:value.2');

export { ACTION_VALUE1 };
export { ACTION_VALUE2 };
export { REACTION_VALUE1 };
export { REACTION_VALUE2 };
export default clsid;