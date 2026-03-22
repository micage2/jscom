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
        title = "value", value = 0, min = -1, max = 1,
        ...otherArgs
    } = { ...(options ?? {}) };

    const [label, slider, output] = [...sldr.children];
    label.textContent = title;
    // slider.value = value;
    // slider.min = min;
    // slider.max = max;
    slider.oninput = (e) => {
        output.textContent = +slider.value;
    }
    output.textContent = slider.value;
}

function ctor(args = {}) {
    // const call = this.call;
    const sliders = new Map();

    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.appendChild(fragment.cloneNode(true));    
    
    const propview = shadow.querySelector('.prop-view');

    return {
        getHost: () => host,
        getInstance: () => {},
    };
}


const IPropView = ({}) => {
    return {
    };
};

const clsid = DOM.register(ctor, function(role, action, reaction) {
    
    role("PropView", self => IPropView(self), true);
    
});

export default clsid;