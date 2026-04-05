// src/dom-comps/props-view.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { TypeRegistry } from '../shared/type-registry.js';
import { makeFragment } from '../shared/dom-helper.js';

const fragment = makeFragment(`
<style>
    :host {
        width: 100%;
        background: var(--color-bg);
        color: var(--color-text);
    }
    .props-view {
        overflow: hidden auto;
    }
    fieldset {
        border: 1px solid #777;
        border-radius: 8px;
        max-width: 500px;
        margin: 12px;
    }
    legend {
        padding: 5px 10px;
        border-radius: 4px;
        margin-left: 10px;
        display: flex;
        align-items: center;
    }
    legend button {
        color: var(--color-text);
        cursor: pointer;
        margin-right: 8px;
        background: none;
        border: none;
        font-size: 1.2em;
    }
</style>
<fieldset>
    <legend>
        <button type="button">▽</button>
        <span class="legend-text"></span>
    </legend>
    <div class="props-view">
        <slot name="content"></slot>
    </div>
</fieldset>
`);

function ctor({ props, config = {} }) {
    const self = {};
    self.props  = props;
    self.config = config;

    self.host   = document.createElement('div');
    self.shadow = self.host.attachShadow({ mode: 'closed' });
    self.shadow.appendChild(fragment.cloneNode(true));

    self.propsview    = self.shadow.querySelector('.props-view');
    self.legend       = self.shadow.querySelector('.legend-text');
    self.legend.textContent = props.getName();

    self.legend_toggle = self.shadow.querySelector('legend button');
    self.legend_toggle.onclick = () => {
        const collapsed = self.propsview.style.display === 'none';
        self.propsview.style.display = collapsed ? 'block' : 'none';
        self.legend_toggle.textContent = collapsed ? '▽' : '▷';
        self.legend_toggle.blur();
    };

    return {
        getHost:     () => self.host,
        getInstance: () => self,
    };
}

function init(self) {
    const { props, config } = self;

    const addChild = (prop) => {
        // Resolve typeId → clsid via TypeRegistry.
        // Layout config can carry per-child overrides under the child's name.
        const childConfig  = config[prop.getName()] ?? {};
        const layoutHint   = childConfig.view ?? null;
        const typeId       = prop.getTypeId ? prop.getTypeId() : childConfig.typeId ?? null;
        const clsid        = TypeRegistry.resolve(typeId, layoutHint);

        if (!clsid) {
            console.warn(`[PropsView] No component for typeId '${typeId}' on '${prop.getName()}'`);
            return;
        }

        // Groups get a props interface, leaves get a prop interface
        const isGroup = typeof prop.for_each === 'function';
        const view = isGroup
            ? DOM.create(clsid, { props: prop, config: childConfig })
            : DOM.create(clsid, { prop,         config: childConfig });

        DOM.attach(view, this, { slot: 'content' });
    };

    props.getChildren().forEach(addChild);

    props.on('prop-added',   addChild);
    props.on('prop-removed', ({ name }) => {
        // future: DOM.detach by name if needed
    });

    return self;
}

const IPropsView = (self) => ({
    add(propview) {
        DOM.attach(propview, this, { slot: 'content' });
    },
    addMany(propviews) {
        propviews.forEach(v => DOM.attach(v, this, { slot: 'content' }));
    },
});

const clsid = DOM.register(ctor, function (role) {
    role('PropsView', function (self) {
        self = init.bind(this)(self);
        return IPropsView(self);
    }, true);
});

export default clsid;
