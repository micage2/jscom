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
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.adoptedStyleSheets.push(sheet);

    const slot = document.createElement('slot');
    slot.name = "content";
    shadow.appendChild(slot);

    const content = new WeakSet();

    if (Array.isArray(args.content)) {
        for (const elem of args.content) {
            DOM.attach(elem, this, { slot: 'content' });
        }
    }

    return {
        getInstance: () => ({content}),
        getHost: () => host,
    }
}

const IBoxFactory = function({content}) {
    const IBox = {
        add(elem) {
            DOM.attach(elem, this, { slot: 'content' });
            return this;
        },
        addMany(elems) {
            if (Array.isArray(elems)) {
                for (const elem of elems) {
                    DOM.attach(elem, this, { slot: 'content' });
                }
            }
            return this;
        },
    };
    return IBox;
}

const clsid = DOM.register(ctor, function(role, action, reaction) {
    role("Box", self => IBoxFactory(self), true);

    action('clicked');
}, {
    name: 'Box',
    description: 'Container for Buttons and more ...'
});

export default clsid;