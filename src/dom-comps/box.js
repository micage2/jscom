import { DomRegistry as DOM } from '../dom-registry.js';
import { create_sheet, makeFragment } from '../shared/dom-helper.js';

const sheet = create_sheet(`
:host {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 100%;

    background: var(--color-bg);
}

.container {
    position: relative;
    overflow: hidden;
    height: 100%;
    width: 100%;
}
.container:hover .proxy,
.container:focus-within .proxy {
    opacity: 1; /* Show on hover/focus */
}

bkup{
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
    white-space: nowrap;
}
.content {
    display: flex;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    overflow-x: scroll; /* Scrollable, but bar hidden below */
    overflow-y: hidden;
}

/* Hide native scrollbar on content (cross-browser overlay effect) */
.content::-webkit-scrollbar {
    display: none; /* Webkit/Chrome/Safari */
}
.content {
    -ms-overflow-style: none; /* IE/Edge */
    scrollbar-width: none; /* Firefox */
}

.proxy {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 12px; /* Thin overlay; adjust for preference, no need for system sbHeight */
    overflow-x: scroll;
    overflow-y: hidden;
    display: none;
    pointer-events: auto;
    opacity: 0.0; /* Auto-hide */
    transition: opacity 0.2s ease-in-out;
    background: transparent; /* No cover */
}

/* Custom proxy scrollbar style (thin, semi-transparent like VS Code) */
.proxy::-webkit-scrollbar {
    height: 7px;
}
.proxy::-webkit-scrollbar-thumb {
    background: rgba(0, 150, 250, 0.3);
    border-radius: 0px;
}
.proxy::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 150, 250, 0.5);
}
.proxy::-webkit-scrollbar-track {
    background: transparent;
}
.stretcher {
    height: 1px;
}

/* Slotted styles as before */
::slotted([slot="right"]) {
    margin-left: auto;
}
`);

const fragment = makeFragment(`
<div class="container">
    <div class="content">
        <slot name="left"></slot>
        <slot name="right"></slot>
    </div>
    <div class="proxy">
        <div class="stretcher"></div>
    </div>
</div>
`);

const sbHeight = 16;

function ctor(args) {

    const host = document.createElement('div');
    host.style.setProperty('--sb-height', `${sbHeight}px`);
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.adoptedStyleSheets.push(sheet);
    shadow.appendChild(fragment.cloneNode(true));

    const container = shadow.querySelector('.container');
    const content = shadow.querySelector('.content');
    const proxy = shadow.querySelector('.proxy');
    const stretcher = shadow.querySelector('.stretcher');

    let isSyncing = false; // Prevent recursion in bi-sync

    function updateScroll() {
        requestAnimationFrame(() => {
            stretcher.style.width = `${content.scrollWidth}px`;
            updateVisibility();
        });
    }
    
    function updateVisibility() {
        if (content.scrollWidth > container.clientWidth) {
            proxy.style.display = 'block';
        } else {
            proxy.style.display = 'none';
            content.scrollLeft = 0;
            proxy.scrollLeft = 0;
        }
    }
    
    // Bi-directional sync
    content.addEventListener('scroll', () => {
        if (isSyncing) return;
        isSyncing = true;
        proxy.scrollLeft = content.scrollLeft;
        isSyncing = false;
    });

    proxy.addEventListener('scroll', () => {
        if (isSyncing) return;
        isSyncing = true;
        content.scrollLeft = proxy.scrollLeft;
        isSyncing = false;
    });

    // Wheel on container routes to content
    host.addEventListener('wheel', (e) => {
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        content.scrollLeft += delta;
        e.preventDefault();
    }, { passive: false });

    // Slotchange and ResizeObserver
    const slot_left = shadow.querySelector('slot[name="left"]');
    const slot_right = shadow.querySelector('slot[name="right"]');
    slot_left.addEventListener('slotchange', () => updateScroll());
    slot_right.addEventListener('slotchange', () => updateScroll());

    const resizeObserver = new ResizeObserver(() => updateScroll());
    resizeObserver.observe(content);

    updateScroll();

    // for what?
    host.onclick = (e) => {
        this.emit('clicked', this);
    };

    const members = [];
    const selected = null;

    return {
        getInstance: () => ({ slot_left, selected, members }),
        getHost: () => host,
    }
}


const max = (arr) => arr.reduce(function (prev, current) {
    return (prev && prev.y > current.y) ? prev : current;
});

const IBoxFactory = function ({ slot_left, selected, members }) {
    const IBox = {
        add(elem, options = {}) {
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

            if (options.align === 'right') {
                DOM.attach(elem, this, { slot: 'right' });
            }
            else {
                DOM.attach(elem, this, { slot: 'left' });
            }

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
            const assignedNodes = slot_left.assignedNodes({ flatten: true });
            assignedNodes[idx].scrollIntoView({
                behavior: "instant", // "smooth", 
                block: "nearest", //"end", 
                inline: "nearest", //"center", "end", 
                container: "nearest"
            });
        },

        remove(elem_name) {
            let index = -1;
            const elem = members.find((elem, i) => {
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
                const predecessor = members[index - 1];
                if (predecessor) {
                    this.select(predecessor);
                    predecessor.emit('clicked', predecessor);
                }
            }
        },

        removeMany(elems) { },

        has(elem) { return members.includes(elem); },
    };
    return IBox;
}

const clsid = DOM.register(ctor, function (role, action, reaction) {

    role("Box", self => IBoxFactory(self), true);

    action('button-state');

    reaction('button-select', function (btn) {
        this.select(btn);
    });



}, {
    name: 'Box',
    description: 'Container for Buttons and more ...'
});
export default clsid;