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
    const radio_mode = (args.mode === 'radio');
    const selected = null;

    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.adoptedStyleSheets.push(sheet);

    const slot = document.createElement('slot');
    slot.name = "content";
    shadow.appendChild(slot);

    return {
        getInstance: () => ({shadow, radio_mode, selected}),
        getHost: () => host,
    }
}

const IBoxFactory = function({shadow, radio_mode, selected}) {
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
        select(btn) {
            const _btn = btn.as('Button');
            if (!DOM.equals(selected, _btn)) {
                _btn.select(true);
                if (selected) selected.select(false);

                selected = _btn;
            }
        }
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