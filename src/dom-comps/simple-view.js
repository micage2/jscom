// src/dom-comps/simple-view.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { makeFragment } from '../shared/dom-helper.js';

const fragment = makeFragment(`
<style>
    :host {
        display: flex;
        flex-direction: column;
        height: 100%;        
        gap: 16px;
        background: #1e1e1e;
        color: #ddd;
    }
    .simple-view {
        height: 100%;
    }
    .simple-view.selected {
        color: #dd3;
    }
    .status {
        padding: 8px; /* Note: DANGER!!! this could break splitters */
        flex: 1;
        margin: 0;
    }
</style>
<div class="simple-view"><pre class="status">(no text)</pre></div>
`);

function ctor(args = {}) {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.appendChild(fragment.cloneNode(true));

    const simple = shadow.querySelector('.simple-view');
    // this action call is for testing this comp as a ListItem
    const that = this;
    simple.onclick = function(e) {
        that.call('selected', that.uid);
    }

    const status = shadow.querySelector('.status');
    const initial_text = args.title || '';
    status.textContent = initial_text;

    return {
        getHost: () => host,
        getInstance: () => ({simple, status, initial_text}),
    };
}

// creates ISimpleView interface objects
const ISimpleViewFactory = ({simple, status, initial_text}) => {
    return {
        set_title(text) { status.textContent = text; },
        get_title() { return status.textContent; },
        restore() { status.textContent = initial_text; },

        // for testing it as a ListItem, also needs a selected action()!
        set_selected(val) {
            val ? simple.classList.add('selected') 
                : simple.classList.remove('selected');
        },
        get_selected(val) { return simple.classList.contains('selected'); },
    };
};

const clsid = DOM.register(ctor, function(role, action, reaction) {
    
    role("SimpleView", self => ISimpleViewFactory(self), true);

    action('selected'); // for test as a ListItem

    reaction('title', function(text) {
        this.set_title(text);
    });
    reaction('timed', function(text) {
        this.set_title(text);
        setTimeout(() => { this.restore(); }, 1000);
    });
    reaction('set-text-3', function(text) {
        this.set_title(text);
    });
}, {
    name: 'SimpleView'
});
export default clsid;