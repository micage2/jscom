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
            if(typeof elem === 'function') {
                roots.set(name, { root: null, ctor: elem });
            }
            else {
                roots.set(name, { root: elem, ctor: null });
            }
            return this;
        },
        addMany(elems) {
            if (Array.isArray(elems) && elems.length > 0) {
                for (const elem of elems) {
                    // roots.set(elem.name, elem.root);
                    this.add(elem.name, elem.root);
                }
            }
            return this;
        },
        select(name) {
            if (active_root === name) return;
            
            const entry_old = roots.get(active_root);
            if (entry_old) DOM.detach(entry_old.root);

            const entry = roots.get(name);
            entry.root = typeof entry.ctor === 'function' ? entry.ctor() : entry.root;
            DOM.attach(entry.root, this, { slot: 'content'});
            
            active_root = name;
        }
    };
    return IOnlyOneBox;
}

const clsid = DOM.register(ctor, function(role, action, reaction) {
    role("Box", self => IOnlyOneBoxFactory(self), true);

    reaction('select', function(payload) {
        // console.log(`${payload}`);
        this.select(payload);
    });
}, {
    name: 'OnlyOneBox',
    description: 'Only one of the roots is attached'
});

export default clsid;