// src/compounds/app-json-editor.js
//
// JSON Editor compound.
// Registered with DomRegistry so the app-switcher can pick it up.
//
// args:
//   json         {string}  Raw JSON string. Defaults to a demo object.
//   layoutConfig {Object}  Optional per-key view overrides.
//                          e.g. { r: { view: CLSID_PropSlider, min: 0, max: 100 } }

import { DomRegistry as DOM } from '../dom-registry.js';
import CLSID_JsonEditor       from '../dom-comps/json-editor.js';
import CLSID_PropSlider       from '../dom-comps/prop-slider.js';

const DEMO_JSON = JSON.stringify({
    meta: {
        title:   "Test Scene",
        version: 1,
        active:  true,
    },
    circle: {
        x:       100.0,
        y:       200.0,
        r:       42.5,
        label:   "my circle",
        visible: true,
        color:   null,
    },
    tags: ["physics", "demo", "v2"],
}, null, 2);

// Layout config: override circle.r to use a slider with explicit range.
// Everything else falls back to TypeRegistry defaults.
const DEMO_LAYOUT = {
    circle: {
        r: {
            view: CLSID_PropSlider,
            min:  0,
            max:  200,
            step: 0.5,
        },
    },
};

const ctor = (args = {}) => {
    const json   = args.json         ?? DEMO_JSON;
    const config = args.layoutConfig ?? DEMO_LAYOUT;

    const root = DOM.create(CLSID_JsonEditor, { json, config });
    if (!root) {
        console.error('[app-json-editor] buildJsonEditor failed');
    }
    return root;
};

const info = {
    clsid: 'jscom.compounds.json-editor',
    name: '11.0',
    title: 'JSON Editor'
}

const res = DOM.registerCompound(ctor, info);
export default info.clsid;
