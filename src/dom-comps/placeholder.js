// placeholder.js
import { DomRegistry as DOM } from "../dom-registry.js";
import { CSSRules } from "../shared/dom-helper.js";

const IComponentImpl = ({ host, instance }) => ({
    dispose() {
        host.remove();
    },
    set text(str) {
        instance.textContent = str;
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


function ctor(args) {
    const host = document.createElement('div');
    const css_rules = CSSRules({
        "color": "white",
        "height": "100%",
        "width": "100%",
        "display": "flex",
        "align-items": "center",
        "justify-content": "center",
        "font-size": "1rem",
        "overflow": "hidden",
    });
    css_rules.add("background", args?.color ?? '#234');
    host.style.cssText = css_rules.toString();

    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
    <style>
        div.${class_id} { padding: 2px; color: #eee; }
        .${class_id} .text { color: tomato; }
    </style>
    <div class="${class_id}">
        <pre class='text'>${args.text || 'Problem'}</pre>
    </div>
    `;
    const text_field = shadow.querySelector('.text');

    return {
        getHost() { return host; },
        getInstance() { return text_field; }
    };
}

const class_id = DOM.register(ctor, roleProvider);
export default class_id;