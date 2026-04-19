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
        postCreate: init
    };
}

function init(self) {
    const { props, config = {} } = self;

    const addView = (prop) => {
        // 1. Does config has a view?               → clsid = childConfig.view
        // 1. Does parent config has a view?        → clsid = config.view
        // 2. resolve view from value's datatype    → clsid = typeof prop.value

        const prop_name = prop.getName();
        const childConfig = config[prop_name] ?? {};
        const layoutHint = childConfig.view ?? null;

        // Groups get a props interface, leaves get a prop interface
        let view;
        if (prop.isGroup()) {
            // TODO: group view ?
            // view = DOM.create(clsid, { props: prop, config: childConfig });
            return;
        }
        else {
            const typeId = typeof prop.get();

            const clsid = layoutHint || TypeRegistry.resolve(typeId);
            if (!clsid) {
                console.warn(`[PropsView] No component for typeId '${typeId}' on '${prop.getName()}'`);
                return;
            }
    
            view = DOM.create(clsid, { prop, config: childConfig });
        }

        DOM.attach(view, this, { slot: 'content' });
    };

    // props.getChildren().forEach((v,i,a) => {
    //     addView(v);
    // });

    props.on('prop-added', (prop) => {
        addView(prop);
    });
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


// ==================== Registration ======================
//
const info = {
    clsid: 'jscom.dom-comps.props-view',
    name: 'PropsView',
    description: 'Container for Buttons and more ...'
};

const res = DOM.register(ctor, function (role) {

    role('PropsView', (self) => IPropsView(self), true);

}, info);

export default info.clsid;
