// src/dom-comps/prop-null.js
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
        .null-view {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 22px;
            opacity: 0.5;
        }
        .null-view label {
            width: 80px;
            text-overflow: ellipsis;
            overflow: hidden;
            user-select: none;
        }
        .null-view span {
            font-style: italic;
        }
    </style>
    <div class="null-view">
        <label></label>
        <span>null</span>
    </div>
`);

function ctor({ prop, config = {} }) {
    const self = {};
    self.prop = prop;

    const name = prop.getName();

    self.host   = document.createElement('div');
    self.shadow = self.host.attachShadow({ mode: 'closed' });
    self.shadow.appendChild(fragment.cloneNode(true));

    self.label = self.shadow.querySelector('label');
    self.label.textContent = name;

    // null is read-only — no input, no listeners needed

    return {
        getHost:     () => self.host,
        getInstance: () => self,
    };
}

const INullView = (self) => ({});

const clsid = DOM.register(ctor, function (role) {
    role('NullView', self => INullView(self), true);
});

export default clsid;
