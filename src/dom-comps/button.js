import { DomRegistry as DOM } from '../dom-registry.js';
import { create_sheet, load_file } from '../shared/dom-helper.js';

const sheet = create_sheet(
`
.my-button {
    display: inline-block;
    height: 100%;
    min-width: 24px;
    border: 0;
    cursor: pointer;
    background: transparent;
    color: var(--color-text);
}
.my-button svg {
    align: center;
    vertical-align: middle;
}
.my-button:hover {
    color: var(--toolbar-btn-hover-color);
}
.my-button:hover .icon {
    stroke: #0af;
}
.my-button.activated{
    color: var(--color-active);
}
.my-button:active {
    transform: scale(0.95);
}
.my-button:active svg {
    transform: translate(0, 0) scale(0.95);
}
`);

/**
 * @param {Object} args
 * @prop {string} args.name
 * @prop {string} [args.svg_file]
 * @prop {'default' | '2-state' | 'toggle'} [args.mode]
 */
function ctor(args, call) {
    const svg_file = args.svg_file;

    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.adoptedStyleSheets.push(sheet);

    const button = document.createElement('button');
    button.name = args.name || this.uid;
    button.classList.add('my-button');

    if (svg_file) {
        load_file(svg_file).then((str) => {
            button.innerHTML = str;
        });
    }
    else {
        button.textContent = button.name;
    }
    
    const that = this; // otherwise <button> is 'this'
    button.onclick = function (e) {
        if (args.mode === '2-state') {
            if (!button.classList.contains('activated')) {
                button.classList.add('activated');
                call('activated', that.as('Button'));
                call('activated2', that.as('Button'));
            }
        }
        else if (args.mode === 'toggle') {
            let state = button.classList
                .contains('activated') ? 'state1' : 'state2'
            button.classList.toggle('activated');
            call('toggled', that.as('Button'));
        }
        else {
            // call('clicked', that.as('Button'));
            that.emit('clicked', that);
        }
    };
    shadow.appendChild(button);

    return {
        getInstance: () => ({button, svg_file}),
        getHost: () => host,
    }
}


const IButtonFactory = function({button, svg_file}) {
    const IButton = {
        get_name() { return button.name; },
        get_svg_file() { return svg_file; },
        select(bool) {
            bool ? button.classList.add('activated')
                : button.classList.remove('activated');
        },
        is_active() { return button.classList.contains('activated'); },
        reset() { button.classList.remove('activated'); },
    }
    return IButton;
}


const clsid = DOM.register(ctor, function(role, action, reaction) {

    role('Button', (self) => IButtonFactory(self), true);

    // action('clicked');
    // action('activated');
    // action('activated2');
    // action('toggled');

    // reaction('activate', function({name, state}) {
    //     this.select(state);
    // });
    // reaction('reset', function() {
    //     this.reset();
    // });
}, {
    name: 'Button',
    description: 'button with svg icon, fallback is text'
});

export default clsid;