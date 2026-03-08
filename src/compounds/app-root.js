import { DomRegistry as DOM } from '../dom-registry.js';
import BUTTON from '../dom-comps/button.js'
import SIMPLE from '../dom-comps/simple-view.js'
import BOX from '../dom-comps/box.js'
import ONLYONEBOX from '../dom-comps/only-one-box.js'
import TBS from '../dom-comps/top-bottom-static.js'

const $$ = DOM.create;
const Simple = (str) => $$(SIMPLE, { title: str });
const Button = (name, options) => $$(BUTTON, { name, ...options });

// { apps, start }
const ctor = (args = {}) => {

    const btn_app = $$(BUTTON, { name: "1" });
    const btn_file = $$(BUTTON, { name: "2" });
    const btn_add_file = $$(BUTTON, { name: "New File", svg_file: "./assets/add-item.svg"});
    const btn_add_folder = $$(BUTTON, { name: "New Folder", svg_file: "./assets/add-folder.svg"});
    const simple = Simple('');

    const box = $$(BOX, { mode: 'radio' });
    const only_one_box = $$(ONLYONEBOX);

    const button_iter = args.apps.values().map(app => {
        
        const btn = $$(BUTTON, { name: app.name });

        btn.on('clicked', b => {
            only_one_box.select(b.get_name());
            box.select(b);
        });

        return btn;
    });
    const buttons = [...button_iter];
    box.addMany(buttons);
    
    const views = [...args.apps.values().map(app => ({
        name: app.name,
        root: app.root // now with lazy creating of root
    }))];
    only_one_box.addMany([...views]);

    // pre-activate app
    const button2select = args.start || "3.1";
    const btn1 = buttons.find(b => b.get_name() === button2select);
    btn1.emit('clicked', btn1);

    const app_root = $$(TBS)
        .setTop(box)
        .setBottom(only_one_box)
    ;

    return app_root;

}
const clsid = DOM.registerCompound(ctor);
export default clsid;

