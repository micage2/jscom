// src/dom-comps/test-view.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { bus } from '../shared/event-bus.js';

function ctor(args = {}) {
    const host = document.createElement('div');
    host.style.height = '100%';
    // Note: DANGER!!! this breaks splitters
    host.style.padding = '16px';
    host.style.background = '#1e1e1e';
    host.style.color = '#ddd';
    host.style.display = 'flex';
    host.style.flexDirection = 'column';
    host.style.gap = '16px';

    const status = document.createElement('pre');
    status.style.flex = '1';
    status.style.margin = '0';
    // status.style.overflow = 'auto';
    status.textContent = '(no selection)';
    host.appendChild(status);

    const btnBar = document.createElement('div');
    btnBar.style.display = 'flex';
    // btnBar.style.height = '32px';
    btnBar.style.gap = '8px';
    btnBar.style.padding = '6px';
    btnBar.style.margin = '6px';
    btnBar.style.flexWrap = 'wrap';

    const addBtn = document.createElement('button');
    addBtn.textContent = '+';
    addBtn.onclick = () => bus.emit('test:add-item');
    btnBar.appendChild(addBtn);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'x';
    removeBtn.onclick = () => bus.emit('test:remove-selected');
    btnBar.appendChild(removeBtn);

    host.appendChild(btnBar);

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