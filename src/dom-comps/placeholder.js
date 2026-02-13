// placeholder.js
import { DomRegistry as DOM } from "../dom-registry.js";
import { CSSRules } from "../shared/dom-helper.js";

const IComponentImpl = ({ root }) => ({
    dispose() {
        root.remove();
    }
});

const roleFactories = new Map([
    ['Component', IComponentImpl],
]);

const roleProvider = (role = "Component") => roleFactories.get(role) ?? null;


function domFactory(args) {
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
    css_rules.add("background", args?.color ?? '#555');
    host.style.cssText = css_rules.toString();

    const shadow = host.attachShadow({ mode: 'closed' });

    shadow.innerHTML = `
      <style>
        div { padding: 2px; color: #eee; }
      </style>
      <div>${args?.text ?? 'Placeholder'}</div>
    `;

    return {
        getRootNode() { return host; },
        getData() { return {}; }
    };
}

const class_id = DOM.register(domFactory, roleProvider);
export default class_id;