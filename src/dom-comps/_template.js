// placeholder.js
import { DomRegistry } from "../dom-registry.js";
import { CSSRules } from "../shared/dom-helper.js";

const IComponentImpl = ({ root }) => ({
    dispose() {
        root.remove();
    }
});

const roleFactories = new Map([
    ['IComponent', IComponentImpl],
    // ... add more roles here!
]);

const roleProvider = (role = "IComponent") => roleFactories.get(role) ?? null;


function domFactory(args) {
    const host = document.createElement('div');
    const css_rules = CSSRules({
        "color": "white",
        // ...
    });
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

export const PLACEHOLDER_CLSID = DomRegistry.register(domFactory, roleProvider);