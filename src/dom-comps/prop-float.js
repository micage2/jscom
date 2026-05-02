// src/dom-comps/prop-float.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { makeFragment } from '../shared/dom-helper.js';

const fragment = makeFragment(`
    <style>
        :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            background: var(--color-bg);
            color: var(--color-text);
        }
        .float-edit {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 22px;
        }
        .float-edit label {
            width: 80px;
            text-overflow: ellipsis;
            overflow: hidden;
            user-select: none;
        }
        .float-edit input {
            width: 60%;
        }
        .float-edit output {
            width: 40px;
            text-align: end;
        }
    </style>
    <div class="float-edit">
        <label></label>
        <input type="number">
    </div>
`);

function ctor({ prop, config = {} }) {
    const self = {};
    self.prop = prop;

    const name      = prop.getName();
    const value     = prop.get();
    const { step = 0.1 } = config;

    self.host   = document.createElement('div');
    self.shadow = self.host.attachShadow({ mode: 'closed' });
    self.shadow.appendChild(fragment.cloneNode(true));

    self.label  = self.shadow.querySelector('label');
    self.input  = self.shadow.querySelector('input');
    // self.output = self.shadow.querySelector('output');

    self.label.textContent  = name;
    self.input.value        = value ?? 0;
    self.input.step         = step;
    // self.output.value       = value ?? 0;

    self.input.onchange = (e) => {
        const v = parseFloat(e.target.value);
        self.output.value = v;
        self.prop.set(v);
    };

    self.prop.on('value-changed', ({ newValue }) => {
        self.input.value  = newValue.toFixed(2);
        // self.output.value = newValue.toFixed(2);
    });

    return {
        getHost:     () => self.host,
        getInstance: () => self,
    };
}

const IFloatEdit = (self) => ({});

// ==================== Registration ======================
//
const info = {
    clsid: 'jscom.dom-comps.prop-float',
    name: 'PropFloat',
    description: 'Atomic view to edit a floating-point number',
    type: 'number'
};

const clsid = DOM.register(ctor, function (role) {
    role('FloatEdit', self => IFloatEdit(self), true);
}, info);

export default info.clsid;
