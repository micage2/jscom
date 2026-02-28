import { DomRegistry as DOM } from '../dom-registry.js';
import { create_sheet, load_file } from '../shared/dom-helper.js';

const sheet = create_sheet(
`
.my-butt {
    display: inline-block;
    height: 100%;
    min-width: 36px;
    border: 0;
    cursor: pointer;
    background: transparent;
    color: var(--color-text);
}
.my-butt img {
    align: center;
}
.my-butt:hover {
    color: var(--color-active);
}
.my-butt:hover .icon {
    stroke: #0af;
}
.my-butt:active {
    color: var(--color-active);
}
.my-butt:active .icon {
    transform: translate(-6px, -8px) scale(1.2);
}
`);
document.adoptedStyleSheets.push(sheet)

function ctor(args, call) {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.adoptedStyleSheets.push(sheet);

    const button = document.createElement('button');
    button.name = args.name || this.uid;
    button.classList.add('my-butt');
    if (args.svg_file) {
        load_file(args.svg_file).then((str) => {
            button.innerHTML = str;
        });
    }
    else {
        button.textContent = button.name;
    }
    button.onclick = function () {
        call('clicked', button.name);
    };
    shadow.appendChild(button);

    return {
        getInstance: () => button,
        getHost: () => host,
    }
}


const clsid = DOM.register(ctor, function(roles, action, reaction) {
    action('clicked');
}, {
    name: 'Button',
    description: 'button with svg icon, fallback is text'
});

export default clsid;