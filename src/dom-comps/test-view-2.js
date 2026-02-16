// src/dom-comps/test-view-2.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { bus } from '../shared/event-bus.js';

function ctor(args = {}) {
    const host = document.createElement('div');
    host.innerHTML = `
    <div class="${class_id}">
        <pre class='text'>Problem</pre>
    </div>
    `;
    const status = host.querySelector(`.${class_id} .text`);

    return {
        getHost: () => host,
        getInstance: () => status,
    };
}

const ITestView = ({ host, instance: status }) => {
    return {
        set text(text) {
            status.textContent = text;
        }
    };
};

const roleMap = new Map([
    ["TestView", ITestView],
]);

const roleProvider = (role = "TestView") => roleMap.get(role) ?? null;

const TEST_VIEW_CLSID = DOM.register(ctor, roleProvider);
export default TEST_VIEW_CLSID;