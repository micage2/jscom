import { DomRegistry as DOM } from '../dom-registry.js';
import { create_sheet, load_file } from '../shared/dom-helper.js';
import BUTTON from './button.js';

const sheet = create_sheet(
`
:host {
    display: block;
    outline: none;
    user-select: none;
    height: 100%;
}
.tab {
    display: flex;
    height: 100%;
    box-sizing: border-box;
    align-items: center;
    padding-left: 8px;
    padding-bottom: 2px;
    cursor: default;
    color: #ddd;
    border-right: 1px solid #444;
}
.tab.selected {
    background: hsl(220, 20%, 20%);
}
.tab:hover {
    color: #eee;
}
.tab:hover .tab-button {
    border: transparent;
    cursor: pointer;
    background: transparent;
    color: var(--color-text);
    opacity: 1;
    transition: opacity 0.2s;
}

.tab-icon {
    margin-right: 8px;
}

.tab-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: .75rem;
}

.tab-button {
    display: inline-block;
    height: 100%;
    min-width: 24px;
    margin-left: 4px;
    opacity: 0.01;
}
.tab-button:hover {
    background: #f66;
    border: 1px solid #777;
    border-radius: 4px;
    color: var(--toolbar-btn-hover-color);
}
.tab-button:hover .icon {
    stroke: #0af;
}
.tab-button.activated {
    color: var(--color-active);
}
.tab-button:active {
    transform: scale(0.95);
}
`);

function ctor(args = {}) {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.adoptedStyleSheets.push(sheet);

    const tab = document.createElement('div');
    tab.onclick = () => this.emit('clicked', this);
    tab.className = "tab";

    const icon = document.createElement('span');
    icon.className = "tab-icon";
    icon.innerText = args.icon || '🖵';
    tab.appendChild(icon);
    
    const label = document.createElement('span');
    label.className = "tab-label";
    label.innerText = args.title || this.uid;
    tab.appendChild(label);

    const close = document.createElement('button');
    close.name = "Delete";
    close.className = "tab-button";
    close.innerText = 'x';
    close.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.emit('closed', this);
    };
    tab.appendChild(close);

    shadow.appendChild(tab);

    return {
        getInstance: () => ({ host, tab, icon, label, close }),
        getHost: () => host,
    }
}

const ITabFactory = ({ host, tab, icon, label, close }) => ({
    select(bool) {
        bool ? tab.classList.add('selected')
            : tab.classList.remove('selected');
    },
    get_title() { return label.innerText; },
    get_name() { return label.innerText; },
});


const clsid = DOM.register(ctor, function(role, action, reaction) {
    
    role("Tab", self => ITabFactory(self), true);

}, {
    name: 'Tab',
    description: 'Tab for use in TabViews.\n' +
        'It has an icon, a label and a close button.\n'
});
export default clsid;