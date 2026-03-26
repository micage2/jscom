import { DomRegistry as DOM } from '../dom-registry.js';
import { makeFragment } from '../shared/dom-helper.js';
import SLIDERVIEW from '../dom-comps/prop-slider.js';
import TEXTEDITVIEW from '../dom-comps/prop-string.js';
const $$ = DOM.create;

const fragment = makeFragment(`
<style>
    :host {
        // display: flex;
        // flex-direction: column;
        // height: 100%;    
        width: 100%;    
        background: var(--color-bg);
        color:  var(--color-text);
    }
    .props-view {
        // height: 100%;
        overflow: hidden auto;
    }
    fieldset {
        border: 1px solid #777;
        border-radius: 8px;
        // padding: 16px;
        // background-color: #f9f9f9;
        max-width: 500px;
        margin: 12px;
    }
    legend {
        padding: 5px 10px;
        border-radius: 4px;
        margin-left: 10px;
    }

    legend {
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
        <span class="legend-text">Section Title</span>
    </legend>
    <div class="props-view">
        <slot name="content"></slot>
    </div>
</fieldset>
`);


function ctor({props, config}) {
    const self = {};
    self.props = props;
    self.config = config;

    // console.log(props.getName(), props.getConfig());

    self.host = document.createElement('div');
    self.shadow = self.host.attachShadow({ mode: 'closed' });
    self.shadow.appendChild(fragment.cloneNode(true));
    self.propsview = self.shadow.querySelector('.props-view');
    self.legend = self.shadow.querySelector('.legend-text');
    self.legend.textContent = "Circle: " + props.getName();
    self.legend_toggle = self.shadow.querySelector('legend button');
    self.legend_toggle.onclick = function toggleContent(e) {
        self.propsview.style.display = self.propsview.style.display === 'none' ? 'block' : 'none';
        self.legend_toggle.textContent = self.propsview.style.display === 'none' ? '▷' : '▽';
        self.legend_toggle.blur();
    }

    return {
        getHost: () => self.host,
        getInstance: () => self,
    };
}

// we can't attach() child comps in ctor, because the instance 
// is only registered after ctor is finished. Instead we do it
// when the default interface is created. -> role('PropsView').
// Alternatively we could provide a post create callback. -> TODO

function init(self) {
    const { props } = self;

    const add = (prop) => {
        // console.log('[PropsView.ctor] prop-added', prop.getName());

        // route config to child properties
        const prop_config = self.config[prop.getName()];
        const slider_view = $$(SLIDERVIEW, {prop, config: prop_config });
        DOM.attach(slider_view, this, { slot: 'content' });
    };

    props.for_each((prop) => {
        add(prop);
    });

    props.on('prop-added', (prop) => {
        add(prop);
    });



    return self;
}

// const aaa = (self) => IPropsView(init(self));

const IPropsView = (self) => ({
    add(propview) {
        DOM.attach(propview, this, { slot: 'content' });
    },
    addMany(props) {
        props.forEach((propview) => {
            DOM.attach(propview, this, { slot: 'content' });
        })
    },
});

const clsid = DOM.register(ctor, function (role, action, reaction) {

    // role("PropsView", (self) => IPropsView(self), true);
    role("PropsView", function (self) {
        self = init.bind(this)(self);
        return IPropsView(self);
    }, true);

});

export default clsid;