// horizontal-split.js

import { DomRegistry } from '../dom-registry.js';

const IComponentImpl = ({ root }) => ({
    dispose() {
        root.remove();
    }
});

const IContainerImpl = ({ root, data }) => ({
    setTop(child) {
        DomRegistry.attach(this, child, { slot: 'top' });
        return this;
    },
    
    setBottom(child) {
        DomRegistry.attach(this, child, { slot: 'bottom' });
        return this;
    }
});

const roleFactories = new Map([
    ['IComponent', IComponentImpl],
    ['IContainer', IContainerImpl],
]);

const roleProvider = role => roleFactories.get(role) ?? null;

function domFactory(args = {}) {
    const host = document.createElement('div');
    host.style.cssText = 'display:flex; flex-direction:column; height:100%; width:100%; overflow:hidden;';

    const shadow = host.attachShadow({ mode: 'closed' });

    shadow.innerHTML = `
    <style>
        slot[name="top"], slot[name="bottom"] { width:100%; overflow:hidden; }
        .divider { height:6px; background:#444; cursor:row-resize; user-select:none; }
    </style>
    <slot name="top"></slot>
    <div class="divider"></div>
    <slot name="bottom"></slot>
    `;

    const divider = shadow.querySelector('.divider');
    const slot_top = shadow.querySelector('slot[name="top"]');
    const slot_bottom = shadow.querySelector('slot[name="bottom"]');

    let ratio = args.initialRatio ?? 0.5;
    let isDragging = false;

    const update = () => {
        const total = host.offsetHeight;
        const dividerSize = 6;
        const topHeight = Math.max(50, Math.round(total * ratio - dividerSize / 2));
        const bottomHeight = total - topHeight - dividerSize;

        const topChild = slot_top?.assignedElements?.()[0];
        const bottomChild = slot_bottom?.assignedElements?.()[0];

        if (topChild) topChild.style.height = topHeight + 'px';
        if (bottomChild) bottomChild.style.height = bottomHeight + 'px';
    };

    divider.addEventListener('pointerdown', e => {
        e.preventDefault();
        isDragging = true;
        document.addEventListener('pointermove', onMove, { passive: false });
        document.addEventListener('pointerup', onUp);
        document.addEventListener('pointercancel', onUp);
    });

    function onMove(e) {
        if (!isDragging) return;
        e.preventDefault();

        const rect = host.getBoundingClientRect();
        const currentY = e.clientY - rect.top;

        ratio = Math.max(0.1, Math.min(0.9, currentY / rect.height));
        update();
    }

    function onUp() {
        isDragging = false;
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onUp);
    }

    new ResizeObserver(update).observe(host);

    return {
        getRootNode() { return host; },
        getData() { return { ratio, update }; }
    };
}

export const HORIZONTAL_SPLIT_CLSID = DomRegistry.register(domFactory, roleProvider);
