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
        .text_edit {
            display: flex;
            justify-content: space-between;
            padding: 12px 22px;
        }
        .text_edit label {
            width: 80px;
            text-overflow: ellipsis;
            user-select: none;
        }
    </style>
    <div class="text_edit">
        <label></label>
        <input type="text">
    </div>        
`);

// name, prop
function ctor({ prop, config={} }) {
    const self = {};
    self.prop = prop;
    const name = prop.getName();
    // const config = prop.getConfig();
    const prop_value = prop.getValue();
    // const { min, max } = config;

    self.host = document.createElement('div');
    self.shadow = self.host.attachShadow({ mode: 'closed' });
    self.shadow.appendChild(fragment.cloneNode(true));

    self.text_edit = self.shadow.querySelector('.text_edit');
    self.label = self.shadow.querySelector('.text_edit label');
    self.label.textContent = name || 'value';
    
    self.input = self.shadow.querySelector('.text_edit input');
    self.input.value = prop_value;
 
    self.input.onchange = (e) => {
        self.prop.setValue(+e.target.value);
    }

    self.input.oninput = (e) => {
        self.prop.setValue(+e.target.value);
    }

    self.prop.on('value-changed', ({newValue, oldValue}) => {
        self.input.value = newValue;
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