import { DomRegistry as DOM } from '../dom-registry.js';
import BUTTON from '../dom-comps/button.js'
import BOX from '../dom-comps/box.js'
import ONLYONEBOX from '../dom-comps/only-one-box.js'
import TBS from '../dom-comps/top-bottom-static.js'

const $$ = DOM.create;
const Button = (name, options) => $$(BUTTON, { name, ...options });

// { apps, start }
const ctor = (args = {}) => {

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

const clsid = 'jscom.comp.app-switch';
DOM.registerCompound(ctor, {
    clsid,
    // name: 'AppSwitch', // anonymous
    description: 'Compound to select certain sub-compounds'
});
export default clsid;

