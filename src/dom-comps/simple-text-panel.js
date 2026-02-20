// placeholder.js
import { DomRegistry as DOM } from "../dom-registry.js";
import { loadFragment } from '../shared/dom-helper.js';

const html_file = "./src/dom-comps/simple-text-panel.html";
const fragment = await loadFragment(html_file);


const IComponentImpl = (self) => ({
    dispose() {
        host.remove();
    },
    set text(str) {
        self.textContent = str;
    }
});


// note: not working! probably b/o the closed shadow
const IText = ({ host, instance }) => ({
    set text(str) {
        instance.textContent = str;
    }
});

const roleFactories = new Map([
    ['Component', IComponentImpl],
    ['Text', IText],
]);

const roleProvider = (role = "Component") => roleFactories.get(role) ?? null;


function ctor(args = {}) {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    const clone = fragment.cloneNode(true);
    shadow.appendChild(clone);

    const text_field = shadow.querySelector('.text');
    if(text_field) text_field.textContent = args.text || "";

    return {
        getHost() { return host; },
        getInstance() { return text_field; }
    };
}

const class_id = DOM.register(ctor, roleProvider);
export default class_id;