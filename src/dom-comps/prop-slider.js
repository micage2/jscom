// src/dom-comps/test-view.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { makeFragment } from '../shared/dom-helper.js';

const fragment = makeFragment(`
    <style>
        :host {
            display: flex;
            flex-direction: column;
            width: 100%;    
            background: var(--color-bg);
            color:  var(--color-text);
        }
        .slider {
            display: flex;
            justify-content: space-between;
            padding: 12px 22px;
        }
        .slider label {
            width: 20%;
            text-overflow: ellipsis;
            user-select: none;
        }
        .slider input { width: 65%; }
        .slider input {}
        .slider output {
            width: 15%;
            text-align: end;
        }
    </style>
    <div class="slider">
        <label>val</label>
        <input type="range" min="0" max="1" step="0.01" value="0">
        <output>0</output>
    </div>        
`);
    
/*  slider marks
    const input = document.getElementById('myRange');
    const datalist = document.createElement('datalist');
    // Add options to datalist...

    // Direct assignment without using ID
    input.list = datalist;

    // Append datalist to DOM (still required)
    document.body.appendChild(datalist);   
*/
            
// name, prop
function ctor({ prop, config={} }) {
    const self = {};
    self.prop = prop;
    
    const name = prop.getName();
    const prop_value = prop.get();
    const { min = 0, max = 1, step = .01 } = config;

    self.host = document.createElement('div');
    self.shadow = self.host.attachShadow({ mode: 'closed' });
    self.shadow.appendChild(fragment.cloneNode(true));

    self.slider = self.shadow.querySelector('.slider');
    self.label = self.shadow.querySelector('.slider label');
    self.label.textContent = name || 'value';
    
    self.input = self.shadow.querySelector('.slider input');
    self.input.min = min;
    self.input.max = max;
    self.input.step = step;
    self.input.value = prop_value || 0;
    
    self.output = self.shadow.querySelector('.slider output');
    self.output.value = prop_value;
    
    self.input.oninput = (e) => {
        // the plus converts value to number
        self.output.value = +self.input.value;
        self.prop.set(+self.input.value);
    }

    self.prop.on('value-changed', ({newValue, oldValue}) => {
        self.input.value = newValue;
        self.output.value = newValue;
    });

    return {
        getHost: () => self.host,
        getInstance: () => self,
    };
}

const IPropSlider = (self) => ({
});


// ==================== Registration ======================
//
const info = {
    clsid: 'jscom.dom-comps.prop-slider',
    name: 'PropSlider',
    description: 'Atomic view with a slider to edit a number',
    type: 'number'
};

const res = DOM.register(ctor, function(role) {
    
    role("PropSlider", self => IPropSlider(self), true);
    
}, info);

export default info.clsid;