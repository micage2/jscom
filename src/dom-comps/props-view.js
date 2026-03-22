// src/dom-comps/test-view.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { makeFragment } from '../shared/dom-helper.js';

const fragment = makeFragment(`
<style>
    :host {
        display: flex;
        flex-direction: column;
        height: 100%;    
        width: 100%;    
        background: var(--color-bg);
        color:  var(--color-text);
    }
    .props-view {
        height: 100%;
        overflow: hidden auto;
        scrollbar-gutter: stable;
    }
    .props-view::-webkit-scrollbar {
        width: 10px;
    }
    .props-view::-webkit-scrollbar-track {
        opacity: 0;
    }
    .props-view::-webkit-scrollbar-thumb {
        background: #444;
        opacity: 0 !important;
    }
</style>
<div class="props-view">
    <slot name="content"></slot>
</div>
`);
    
function ctor(props) {
    const self = {};
    self.props = props;
    const x = self.props.get('x');


    props.on('child-added', (name) => {
        console.log('[PropsView.ctor] child-added', name);
        
        this.add($$(SLIDERVIEW, {}));
            
    });
    

    self.host = document.createElement('div');
    self.shadow = self.host.attachShadow({ mode: 'closed' });
    self.shadow.appendChild(fragment.cloneNode(true));    
    self.propview = self.shadow.querySelector('.props-view');

    return {
        getHost: () => self.host,
        getInstance: () => self,
    };
}


const IPropsView = (self) => ({
    add(prop) {
        DOM.attach(prop, this, { slot: 'content' });
    },
    addMany(props) {
        props.forEach((prop) => {
            DOM.attach(prop, this, { slot: 'content' });
        })
    },
});

const clsid = DOM.register(ctor, function(role, action, reaction) {
    
    role("PropsView", self => IPropsView(self), true);
    
});

export default clsid;