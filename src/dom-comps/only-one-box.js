import { DomRegistry as DOM } from '../dom-registry.js';
import { create_sheet } from '../shared/dom-helper.js';

const sheet = create_sheet(
`
:host {
    display: flex;
    flex-direction: row;
    height: 100%;
    background: var(--color-bg);
}
`);
    
    
function ctor(args, call) {
    const roots = new Map(); //
    let  active_root = null;

    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.adoptedStyleSheets.push(sheet);

    const slot = document.createElement('slot');
    slot.name = "content";
    shadow.appendChild(slot);

    return {
        getInstance: () => ({ roots, active_root }),
        getHost: () => host,
    }
}


const IOnlyOneBoxFactory = function({ box, roots, active_root }) {
    const IOnlyOneBox = {
        add(name, elem) {
            roots.set(name, elem);
            return this;
        },
        addMany(elems) {
            if (Array.isArray(elems) && elems.length > 0) {
                for (const elem of elems) {
                    roots.set(elem.name, elem.root);
                }
            }
            return this;
        },
        select(name) {
            if (active_root === name) return;
            
            const root_old = roots.get(active_root);
            DOM.detach(root_old);
            const root = roots.get(name);
            DOM.attach(root, this, { slot: 'content'});
            active_root = name;
        }
    };
    return IOnlyOneBox;
}

const clsid = DOM.register(ctor, function(role, action, reaction) {
    role("Box", self => IOnlyOneBoxFactory(self), true);

    reaction('select', function(payload) {
        console.log(`${payload}`);
        this.select(payload);
    });
}, {
    name: 'OnlyOneBox',
    description: 'Only one of the roots is attached'
});

export default clsid;