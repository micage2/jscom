// src/dom-comps/test-view-2.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { bus } from '../shared/event-bus.js';
import { makeFragment, loadFragment } from '../shared/dom-helper.js';

const html_file = "./src/dom-comps/test-view-2.html";
const fragment = await loadFragment(html_file);

const html = `
<style>
    :host{
        background-color: #151410;
    }
    div {
        display: flex;
        height: 100%;
        /* gap: 10px; */
        /* flex-wrap: wrap; */
        justify-content: space-between;
        padding: 2px;
        background-color: #151410;
    }
    button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border: none;
        color: #ddd;
        background-color: transparent;
        font-size: 1rem;
    }
    button:hover {
        background-color: hsl(40, 10%, 20%);
    }
</style>
<div class="button-bar">
    <button class="add-button">+</button>
    <button class="remove-button">x</button>
</div>
`;

function ctor(args = {}) {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    
    // const fragment = makeFragment(html);

    const clone = fragment.cloneNode(true);
    shadow.appendChild(clone);


    const addBtn = shadow.querySelector(`.add-button`);
    addBtn.onclick = () => bus.emit('test:add-item');

    const removeBtn = shadow.querySelector(`.remove-button`);
    removeBtn.onclick = () => bus.emit('test:remove-item');

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