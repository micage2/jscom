// src/dom-comps/tab-bar.js
import { DomRegistry as DOM } from '../dom-registry.js';
import { loadFragment } from '../shared/dom-helper.js';
import TBS from './top-bottom.js';
// import SIMPLE from './simple-view.js'; // fallback
import TAB from './list-item.js'; // fallback
 

const html_file = "./src/dom-comps/tab-bar.html";
const fragment = await loadFragment(html_file);

/** @implements IDomNode */
class TabBar {
    constructor(args) {
        this.host = document.createElement('div');
        const shadow = this.host.attachShadow({ mode: 'closed' });
        shadow.appendChild(fragment.cloneNode(true));

        this.tabbar = shadow.querySelector('.tab-bar');
        this.view = shadow.querySelector('.view');

        this.tabs = new Map() // tab.uid -> view
        this.tab_positions = []; // tab.uid
        this.tab_clsid = args.tab_clsid || TAB;
        this.seltab = -1;
    }

    getHost() { return this.host; }
    getInstance() { return this; }
}

const ctor = (args = {}) => new TabBar(args);

const TabBarFactory = (self) => {
    return {
        addTab(title, view, activate = false) {
            // get view of seltab and detach it
            if (self.seltab > -1) {
                const tab_uid = self.tab_positions[self.seltab];
                const entry = self.tabs.get(tab_uid);
                DOM.detach(entry.view);
                entry.tab.set_selected(false);
            }

            const tab = DOM.create(self.tab_clsid, { title: title || 'empty' });
            DOM.attach(tab, this, { slot: 'tabs', mode: 'parent' });
            DOM.attach(view, this);
            tab.set_selected(true);

            self.tabs.set(tab.uid, {tab, view});
            self.tab_positions.push(tab.uid);
            self.seltab = self.tab_positions.length - 1;
        },

        activateTab(tab) {
        },

        swap(tab1_title, tab2_title) {

        },

        removeTab(title) {

        },
    };
};

const clsid = DOM.register(ctor, function(role, action, reaction) {
    
    role("TabBar", self => TabBarFactory(self), true);

    action('select');

    // payload contains:
    // 1. tab title, 2. view
    reaction('add-tab', function(payload) {
        console.log(`[TabBar DOM.register] 'add-tab', ${name}`);        
        this.addTab(payload.title, payload.view);
    });
}, {
    name: 'TabBar',
    description: ''
});
export default clsid;