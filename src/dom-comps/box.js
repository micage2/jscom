import { DomRegistry as DOM } from '../dom-registry.js';
import { create_sheet } from '../shared/dom-helper.js';

const sheet = create_sheet(
`
:host {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 100%;
    background: var(--color-bg);

    scrollbar-height: thin;
    overflow-x: auto;
    overflow-y: hidden;
}
:host::-webkit-scrollbar {
    height: 5px;
}
:host::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    opacity: 0;
}
:host::-webkit-scrollbar-thumb {
    background: #444;
    opacity: 0 !important;
}
`);

function ctor(args, call) {
    const radio_mode = (args.mode === 'radio');

    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.adoptedStyleSheets.push(sheet);

    const slot = document.createElement('slot');
    slot.name = "content";
    shadow.appendChild(slot);

    host.onclick = (e) => {
        this.emit('clicked', this);
    };

    const members = [];
    const selected = null;

    return {
        getInstance: () => ({slot, radio_mode, selected, members}),
        getHost: () => host,
    }
}

const max = (arr) => arr.reduce(function(prev, current) {
    return (prev && prev.y > current.y) ? prev : current;
});

const IBoxFactory = function({slot, radio_mode, selected, members}) {
    const IBox = {
        add(elem) {
            if (!elem) {
                console.warn('[Box.add] element is null.');                
                return this
            };
            if (members.includes(elem)) {
                console.warn(`[Box.add] already has comp #${elem.uid}.`);                
                return this;
            }
            if (typeof elem.select !== 'function') {
                console.warn(`[Box.add] select function required on #${elem.uid}.`);
                return this;
            }

            DOM.attach(elem, this, { slot: 'content' });
            members.push(elem);

            return this;
        },
        
        addMany(elems) {
            if (Array.isArray(elems)) {
                for (const elem of elems) {
                    this.add(elem);
                }
            }
            return this;
        },

        select(elem) {
            if (!members.includes(elem)) {
                console.warn(`[Box.add] not a member: #${elem.uid}.`);
                return;
            }
            if (selected) selected.select(false);
            selected = elem;
            selected.select(true);

            const idx = members.indexOf(elem);
            const assignedNodes = slot.assignedNodes({ flatten: true });
            assignedNodes[idx].scrollIntoView({
                behavior: "smooth", block: "end", container: "nearest"
            });
        },
        
        remove(elem_name) {
            let index = -1;
            const elem =  members.find((elem, i) => {
                if (elem.get_name() === elem_name) {
                    index = i;
                    return true;
                }
                return false;                
            });
            
            if (elem) {
                DOM.detach(elem);
                members.splice(index, 1);
                this.emit('removed', elem);
                const predecessor = members[index-1];
                if (predecessor) {
                    this.select(predecessor);
                    predecessor.emit('clicked', predecessor);
                }
            }
        },
        
        removeMany(elems) {},

        has(elem) { return members.includes(elem); },
    };
    return IBox;
}

const clsid = DOM.register(ctor, function(role, action, reaction) {

    role("Box", self => IBoxFactory(self), true);

    action('button-state');

    reaction('button-select', function(btn) {
        this.select(btn);
    });

    

}, {
    name: 'Box',
    description: 'Container for Buttons and more ...'
});
export default clsid;