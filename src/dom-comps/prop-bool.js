// src/dom-comps/prop-bool.js
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
        .bool-edit {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 22px;
        }
        .bool-edit label {
            width: 80px;
            text-overflow: ellipsis;
            overflow: hidden;
            user-select: none;
        }
        .bool-edit input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
    </style>
    <div class="bool-edit">
        <label></label>
        <input type="checkbox">
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
    self.input.checked     = !!value;

    self.input.onchange = (e) => {
        self.prop.set(e.target.checked);
    };

    self.prop.on('value-changed', ({ newValue }) => {
        self.input.checked = !!newValue;
    });

    return {
        getHost:     () => self.host,
        getInstance: () => self,
    };
}

const IBoolEdit = (self) => ({});

const info = {
    clsid: 'jscom.dom-comps.prop-bool',
    name: 'PropBool',
    description: 'Atomic view for a boolean value',
    type: 'boolean'
};

const clsid = DOM.register(ctor, function (role) {
    role('BoolEdit', self => IBoolEdit(self), true);
}, info);

export default info.clsid;
