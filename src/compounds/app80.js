import { DomRegistry as DOM } from '../dom-registry.js';
import APP from '../dom-comps/app_with_store.js'
// import SIMPLE from '../dom-comps/simple-view.js'
// import LR from '../dom-comps/left-right.js'
// import TB from '../dom-comps/top-bottom.js'
import TBS from '../dom-comps/top-bottom-static.js'
// import LISTVIEW from '../dom-comps/list-view.js'
// import LISTITEM from '../dom-comps/list-item.js'
import BOX from '../dom-comps/box.js'
// import ONLYONEBOX from '../dom-comps/only-one-box.js'
// import BUTTON from '../dom-comps/button.js'
// import TAB from '../dom-comps/tab.js'
import PROPVIEW from '../dom-comps/prop-view.js'
import SVGVIEW2 from '../dom-comps/svg-view-2.js'

const $$ = DOM.create;

const ctor = (args = {}) => {
    const box = $$(BOX);
    const svgview = $$(SVGVIEW2);
    const propview = $$(PROPVIEW);
    
    box.add(propview);

    return $$(APP).set(
        $$(TBS, { topHeight: 100 })
            .setTop(box)
            .setBottom(svgview)
        )
    ;
};


const clsid = DOM.registerCompound(ctor);
export default clsid;
