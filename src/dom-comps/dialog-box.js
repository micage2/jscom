import { DomRegistry as DOM } from '../dom-registry.js';
import { create_sheet, makeFragment } from '../shared/dom-helper.js';

const fragment = makeFragment(`
<style>
:host {
    height: 100%;
    width: 100%;
    background: var(--color-bg);
    display: block;
    position: relative;
}
:host(:hover) .proxy,
:host(:focus-within) .proxy {
    opacity: 1;
}
:host .proxy {
    opacity: 0;
}

.dialog-box {
    position: relative;
    height: 100%;
    width: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
    -ms-overflow-style: none; /* IE/Edge */
    scrollbar-width: none; /* Firefox */
}
.dialog-box:hover .proxy,
.dialog-box:focus-within .proxy {
    opacity: 1;
}

.dialog-box::-webkit-scrollbar {
    display: none; /* Webkit/Chrome/Safari */
}

.content {
    box-sizing: border-box;
}

.proxy {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: var(--sb-width);
    overflow-x: hidden;
    overflow-y: scroll;
    display: none;
    pointer-events: auto;
    opacity: 0; /* Auto-hide */
    transition: opacity 0.2s ease-in-out;
    background: transparent; /* No cover */
}

/* Custom proxy scrollbar style (thin, semi-transparent) */
.proxy::-webkit-scrollbar {
    width: 16px;
}
.proxy::-webkit-scrollbar-thumb {
    background: rgba(0, 150, 250, 0.2);
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
</style>

<div class="dialog-box">
    <div class="content">
        <slot name="content"></slot>
    </div>
</div>
<div class="proxy">
    <div class="stretcher"></div>
</div>
`);

const sb_width = 17;

function ctor(args) {

    const host = document.createElement('div');
    host.style.setProperty('--sb-width', `${sb_width}px`);
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.appendChild(fragment.cloneNode(true));

    const dialog_box = shadow.querySelector('.dialog-box');
    const content = shadow.querySelector('.content');
    const proxy = shadow.querySelector('.proxy');
    const stretcher = shadow.querySelector('.stretcher');

    let isSyncing = false; // Prevent recursion in bi-sync

    function updateScroll() {
        updateVisibility();
        stretcher.style.height = `${dialog_box.scrollHeight}px`;
        void stretcher.offsetHeight;
    }
    
    function updateVisibility() {
        if (dialog_box.scrollHeight > dialog_box.clientHeight) {
            proxy.style.display = 'block';
        } else {
            proxy.style.display = 'none';
            dialog_box.scrollTop = 0;
            proxy.scrollTop = 0;
        }
    }
    
    // Bi-directional sync
    dialog_box.addEventListener('scroll', () => {
        if (isSyncing)
            return;
        isSyncing = true;
        proxy.scrollTop = dialog_box.scrollTop;
        isSyncing = false;
    });

    proxy.addEventListener('scroll', (e) => {
        if (isSyncing)
            return;
        isSyncing = true;
        dialog_box.scrollTop = proxy.scrollTop;
        isSyncing = false;
    });

    // Wheel on container routes to content
    host.addEventListener('wheel', (e) => {
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        dialog_box.scrollTop += delta;
        e.preventDefault();
    }, { passive: false });

    // Slotchange and ResizeObserver
    const slot = shadow.querySelector('slot[name="content"]');
    slot.addEventListener('slotchange', () => updateScroll());

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
        getInstance: () => ({ slot, selected, members, updateScroll }),
        getHost: () => host,
    }
}


const max = (arr) => arr.reduce(function (prev, current) {
    return (prev && prev.y > current.y) ? prev : current;
});

const IDialogBoxCtor = function ({ slot_left, selected, members, updateScroll }) {
    const IDialogBox = {
        add(elem, options = {}) {
            if (!elem) {
                console.warn('[Box.add] element is null.');
                return this
            };

            if (members.includes(elem)) {
                console.warn(`[Box.add] already has comp #${elem.uid}.`);
                return this;
            }

            // if (typeof elem.select !== 'function') {
            //     console.warn(`[Box.add] select function required on #${elem.uid}.`);
            //     return this;
            // }

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
            const assignedNodes = slot_left.assignedNodes({ flatten: true });
            if (idx < assignedNodes.length) {
                assignedNodes[idx].scrollIntoView({
                    behavior: "instant", // "smooth", 
                    block: "nearest", //"end", 
                    inline: "nearest", //"center", "end", 
                    container: "nearest"
                });
            }
            else { // its in the right slot
                console.warn('[IBox.select] trying to scroll slot[right] into view.');
                
            }
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
            }
        },

        removeMany(elems) { },

        has(elem) { return members.includes(elem); },
    };
    return IDialogBox;
}

const clsid = DOM.register(ctor, function (role) {

    role("DialogBox", self => IDialogBoxCtor(self), true);

}, {
    name: 'DialogBox',
    description: 'Container for Buttons and more ...'
});
export default clsid;