import { DomRegistry as DOM } from '../dom-registry.js';
import { create_sheet, load_file } from '../shared/dom-helper.js';

const sheet = create_sheet(
`
.my-button {
    display: inline-block;
    height: 100%;
    min-width: 36px;
    border: 0;
    cursor: pointer;
    background: transparent;
    color: var(--color-text);
}
.my-button img {
    align: center;
}
.my-button:hover {
    color: var(--color-active);
}
.my-button:hover .icon {
    stroke: #0af;
}
.my-button.activated,
.my-button:active {
    color: var(--color-active);
    font-size: 16px;
}
.my-button:active .icon {
    transform: translate(-6px, -8px) scale(1.2);
}
`);
document.adoptedStyleSheets.push(sheet)

/**
 * @param {Object} args
 * @prop {string} args.name
 * @prop {string} [args.svg_file]
 * @prop {'default' | '2-state' | 'toggle'} [args.mode]
 */
function ctor(args, call) {

    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.adoptedStyleSheets.push(sheet);

    const button = document.createElement('button');
    button.name = args.name || this.uid;
    button.classList.add('my-button');

    if (args.svg_file) {
        load_file(args.svg_file).then((str) => {
            button.innerHTML = str;
        });
    }
    else {
        button.textContent = button.name;
    }
    
    const that = this;
    button.onclick = function () {
        if (args.mode === '2-state') {
            if (!button.classList.contains('activated')) {
                button.classList.add('activated');
                call('activated', button.name);
                call('activated2', that);
            }
        }
        else if (args.mode === 'toggle') {
            let state = button.classList.contains('activated') ? 'state1' : 'state2'
            button.classList.toggle('activated');
            call('toggled', button, state);
        }
        else {
            call('clicked', button);
        }
    };
    shadow.appendChild(button);

    return {
        getInstance: () => button,
        getHost: () => host,
    }
}


const IButtonFactory = function(button) {
    const IButton = {
        get_name() { return button.textContent; },
        select(bool) {
            bool ? button.classList.add('activated')
                : button.classList.remove('activated');
        },
        is_selected() { return button.classList.contains('activated'); },
        reset() { button.classList.remove('activated'); },
    }
    return IButton;
}


const clsid = DOM.register(ctor, function(role, action, reaction) {

    role('Button', (self) => IButtonFactory(self), true);

    action('clicked');
    action('activated');
    action('activated2');
    action('toggled');

    reaction('activate', function({name, state}) {
        this.select(state);
    });
    reaction('reset', function() {
        this.reset();
    });
}, {
    name: 'Button',
    description: 'button with svg icon, fallback is text'
});

export default clsid;