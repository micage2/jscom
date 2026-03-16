import { DomRegistry as DOM } from '../dom-registry.js';
import APP from '../dom-comps/app_with_store.js'
import TBS from '../dom-comps/top-bottom-static.js'
import SIMPLE from '../dom-comps/simple-view.js'
import BOX from '../dom-comps/box.js'
import BUTTON from '../dom-comps/button.js'

const $$ = DOM.create;


const ctor = (args = {}) => {
    const app = $$(APP);
    const out = $$(SIMPLE, { title: 'app state: ' + JSON.stringify(app.get_data()) });
    const box = $$(BOX);
    const button_load = $$(BUTTON, { name: "load" });
    button_load.on('clicked', (btn) => {
        app.load();     
    });
    const button_save = $$(BUTTON, { name: "save" });
    button_save.on('clicked', (btn) => {
        app.save();
        out.set_timed('app saved.');
    });
    box.addMany([button_load, button_save]);

    app.on('file-loaded', (data) => {
        console.log(data);
        out.set_title('loaded: ' + JSON.stringify(data));     
    });

    return app.set($$(TBS)
        .setTop(box)
        .setBottom(out)
    );
};


const clsid = DOM.registerCompound(ctor);
export default clsid;
