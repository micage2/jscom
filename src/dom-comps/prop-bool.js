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
            width: 80px;
            text-overflow: ellipsis;
            user-select: none;
        }
        .slider input { width: 60%; }
        .slider input {}
        .slider output {width: 40px;}
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
        // the plus converts value to number
        this.emit('changed', +slider.value);
    }
    output.textContent = slider.value;
}

// name, prop
function ctor(prop) {
    const self = {};
    self.prop = prop;
    const name = prop.getName();
    const config = prop.getConfig();
    const prop_value = prop.getValue();
    const { min, max } = config;

    self.host = document.createElement('div');
    self.shadow = self.host.attachShadow({ mode: 'closed' });
    self.shadow.appendChild(fragment.cloneNode(true));

    self.slider = self.shadow.querySelector('.slider');
    self.label = self.shadow.querySelector('.slider label');
    self.label.textContent = name || 'value';
    
    self.input = self.shadow.querySelector('.slider input');
    self.input.min = min || 0;
    self.input.max = max || 1;
    self.input.value = prop_value || 0;
    
    self.output = self.shadow.querySelector('.slider output');
    self.output.value = prop_value;
    
    self.input.oninput = (e) => {
        // the plus converts value to number
        // self.output.value = +self.input.value;
        // self.prop.setValue(+self.input.value);
        self.output.value = +e.target.value;
        self.prop.setValue(+e.target.value);
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

const clsid = DOM.register(ctor, function(role, action, reaction) {
    
    role("PropSlider", self => IPropSlider(self), true);
    
});

export default clsid;