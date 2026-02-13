// vertical-split.js

import { DomRegistry } from '../dom-registry.js';

const IComponentImpl = ({ root }) => ({
    dispose() {
        root.remove();
    }
});

const IContainerImpl = ({ root, data }) => ({
    setLeft(child) {
        DomRegistry.attach(this, child, { slot: 'left' });
    },

    setRight(child) {
        DomRegistry.attach(this, child, { slot: 'right' });
    }
});

const roleFactories = new Map([
    ['IComponent', IComponentImpl],
    ['IContainer', IContainerImpl],
]);

const roleProvider = role => roleFactories.get(role) ?? null;


function domFactory(args = {}) {
    const host = document.createElement('div');
    host.style.cssText = 'display:flex; flex-direction:row; height:100%; width:100%; overflow:hidden;';

    const shadow = host.attachShadow({ mode: 'closed' });

    shadow.innerHTML = `
    <style>
        :host { display:flex; flex-direction:row; height:100%; width:100%; }
        slot[name="left"], slot[name="right"] { flex: 1; overflow:hidden; }
        .divider { width:6px; background:#444; cursor:col-resize; user-select:none; }
    </style>
    <slot name="left"></slot>
    <div class="divider"></div>
    <slot name="right"></slot>
  `;

    const divider = shadow.querySelector('.divider');
    const leftSlot = shadow.querySelector('slot[name="left"]');
    const rightSlot = shadow.querySelector('slot[name="right"]');

    let ratio = args.initialRatio ?? 0.5;
    let isDragging = false;

    const update = () => {
        const total = host.offsetWidth;
        const dividerSize = 6;
        const leftWidth = Math.max(50, Math.round(total * ratio - dividerSize / 2));
        const rightWidth = total - leftWidth - dividerSize;

        const leftChild = leftSlot?.assignedElements?.()[0];
        const rightChild = rightSlot?.assignedElements?.()[0];

        if (leftChild) leftChild.style.width = leftWidth + 'px';
        if (rightChild) rightChild.style.width = rightWidth + 'px';
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
        const currentX = e.clientX - rect.left;

        ratio = Math.max(0.1, Math.min(0.9, currentX / rect.width));
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

export const VERTICAL_SPLIT_CLSID = DomRegistry.register(domFactory, roleProvider);