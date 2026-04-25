import { DomRegistry as DOM } from '../dom-registry.js';
import { create_sheet } from '../shared/dom-helper.js';

const sheet = create_sheet(`
:host {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 100%;

    position: relative;
    overflow: hidden;

    background: var(--color-bg);
}

:host::-webkit-scrollbar {
    height: 6px;
}
:host::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    opacity: 0;
}
:host::-webkit-scrollbar-thumb {
    background: #444;
    opacity: 0 !important;
}

::slotted([slot="right"]) {
  margin-left: auto;
}

.bkup{
    display: flex;
    display: inline-block;
    flex-direction: row;
    flex-wrap: nowrap;
    white-space: nowrap;
    align-items: center;
    justify-content: flex-start; /* Or space-between if 'right' should be right-aligned */
}

.content {
    display: flex;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    position: relative;
}
.proxy {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: var(--sb-height, 0px);
    overflow-x: scroll;
    overflow-y: hidden;
    display: none;
    pointer-events: auto; /* Ensure draggable */
}
.proxy::-webkit-scrollbar {
    height: var(--sb-height, 0px);
}.proxy::-webkit-scrollbar-thumb {
    background: rgba(100, 0, 0, 0.5); /* Semi-transparent */
    border-radius: 4px;
}.proxy::-webkit-scrollbar-track {
    background: transparent;
}


.stretcher {
  height: 1px;
}
`);

const sbHeight = 16;

function ctor(args) {

    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.adoptedStyleSheets.push(sheet);
    host.style.setProperty('--sb-height', `${ sbHeight }px`);

    const content = document.createElement('div');
    content.className = "content";

    const slot_left = document.createElement('slot');
    slot_left.name = "left";
    content.appendChild(slot_left);

    const slot_right = document.createElement('slot');
    slot_right.name = "right";
    content.appendChild(slot_right);

    const proxy = document.createElement('div');
    proxy.className = "proxy";
    const stretcher = document.createElement('div');
    stretcher.className = "stretcher";
    proxy.appendChild(stretcher);

    shadow.appendChild(content);
    shadow.appendChild(proxy);

    function updateScroll() {
        requestAnimationFrame(() => {
            stretcher.style.width = `${content.scrollWidth}px`;
            updateVisibility();
        });
    }

    function updateVisibility() {
        if (content.scrollWidth > host.clientWidth) {
            proxy.style.display = 'block';
        } else {
            proxy.style.display = 'none';
            proxy.scrollLeft = 0;
        }
    }
        
    slot_left.addEventListener('slotchange', () => updateScroll());
    slot_right.addEventListener('slotchange', () =>updateScroll());

    // ResizeObserver for content changes (e.g., tab width changes)
    const resizeObserver = new ResizeObserver(() => updateScroll());
    resizeObserver.observe(content);

    // Sync proxy scroll to content position
    proxy.addEventListener('scroll', () => {
        content.style.transform = `translateX(-${proxy.scrollLeft}px)`;
    });

    // Handle wheel events on container (horizontal or vertical delta)
    shadow.addEventListener('wheel', (e) => {
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        proxy.scrollLeft += delta;
        e.preventDefault();
    }, { passive: false });


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