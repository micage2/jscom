// src/dom-comps/test-view-2.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { bus } from '../shared/event-bus.js';
import { makeFragment, loadFragment, uid as Uid } from '../shared/dom-helper.js';

/**
 * emits:
 *      "toolbar:add-item"
 *      "toolbar:add-folder"
 *      "toolbar:thrash-bin"
 */


const html_file = "./src/dom-comps/toolbar2.html";
const fragment = await loadFragment(html_file);

const html_string = `
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
    <button class="add-folder-button">+</button>
    <button class="remove-button">x</button>
</div>
`;

function ctor(args = {}) {
    const uid = Uid();
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    
    // alternatively
    // const fragment = makeFragment(html_string);
    
    const clone = fragment.cloneNode(true);
    shadow.appendChild(clone);

    const addBtn = shadow.querySelector(`.add-item-button`);
    const addFolderBtn = shadow.querySelector(`.add-folder-button`);
    const removeBtn = shadow.querySelector(`.tool-btn.delete`);

    return {
        getHost: () => host,
        getInstance: () => ({ status, addBtn, addFolderBtn, removeBtn, uid }),
    };
}

const IToolbar = (self) => {
    const { status, addBtn, addFolderBtn, removeBtn } = self;

    addBtn.onclick = () => bus.emit('toolbar:add-item', { from: self.uid });
    removeBtn.onclick = () => bus.emit('toolbar:thrash-bin', { from: self.uid });
    addFolderBtn.onclick = () => bus.emit('toolbar:add-folder', { from: self.uid });

    return {
        set text(text) {
            status.textContent = text;
        },
        get uid() { return self.uid; }
    };
};

const roleMap = new Map([
    ["Toolbar", IToolbar],
]);

const roleProvider = (role = "Toolbar") => roleMap.get(role) ?? null;

const TEST_VIEW_CLSID = DOM.register(ctor, roleProvider);
export default TEST_VIEW_CLSID;