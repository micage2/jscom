// src/dom-comps/prop-string.js
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
        .string-edit {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 22px;
        }
        .string-edit label {
            width: 80px;
            text-overflow: ellipsis;
            overflow: hidden;
            user-select: none;
        }
        .string-edit input {
            flex: 1;
        }
    </style>
    <div class="string-edit">
        <label></label>
        <input type="text">
    </div>
`);

function ctor({ prop, config = {} }) {
    const self = {};
    self.prop = prop;

    const name  = prop.getName();
    const value = prop.getValue();

    self.host   = document.createElement('div');
    self.shadow = self.host.attachShadow({ mode: 'closed' });
    self.shadow.appendChild(fragment.cloneNode(true));

    self.label = self.shadow.querySelector('label');
    self.input = self.shadow.querySelector('input');

    self.label.textContent = name;
    self.input.value       = value ?? '';

    self.input.oninput = (e) => {
        self.prop.setValue(e.target.value);  // string, no coercion
    };

    self.prop.on('value-changed', ({ newValue }) => {
        self.input.value = newValue;
    });

    return {
        getHost:     () => self.host,
        getInstance: () => self,
    };
}

const IStringEdit = (self) => ({});

// ==================== Registration ======================
//
const info = {
    clsid: 'jscom.dom-comps.prop-string',
    name: 'PropString',
    description: 'Atomic view to edit a string',
    type: 'string'
};

const res = DOM.register(ctor, function (role) {
    role('StringEdit', self => IStringEdit(self), true);
}, info);

export default info.clsid;
