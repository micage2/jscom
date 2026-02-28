// toolbar.js (internal)
import { DomRegistry as DOM } from '../dom-registry.js';
import { makeFragment, loadFragment, uid as Uid } from '../shared/dom-helper.js';

const html_file = "./src/dom-comps/toolbar.html";
const fragment = await loadFragment(html_file);

class Toolbar {
    constructor(options, call) {
        this.call = call;

        this.host = document.createElement('div');
        const shadow = this.host.attachShadow({ mode: 'closed' });

        const clone = fragment.cloneNode(true);
        shadow.appendChild(clone);
    
        const addBtn = shadow.querySelector(`.add-item-button`);
        addBtn.onclick = () => call('add-item');
        
        const addFolderBtn = shadow.querySelector(`.add-folder-button`);
        addFolderBtn.onclick = () => call('add-folder');
        
        const removeBtn = shadow.querySelector(`.tool-btn.delete`);
        removeBtn.onclick = function() {
            call('trash-bin');
        }
    }
}

const ctor = (options, call) => {
    const self = new Toolbar(options, call);
    return {
        getHost: () => self.host,
        getInstance: () => self
    }
};

const clsid = DOM.register(ctor, (role, action, reaction) => {
    action('add-item');
    action('add-folder');
    action('trash-bin');
});
export default clsid;
