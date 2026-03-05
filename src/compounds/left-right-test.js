import { DomRegistry as DOM } from '../dom-registry.js';
import SIMPLE from '../dom-comps/simple-view.js'
import LR from '../dom-comps/left-right.js'
import TB from '../dom-comps/top-bottom.js'

const $$ = DOM.create;
const Simple = (str) => $$(SIMPLE, { title: str });

const info = 'Dynamic left-right split.\n\n' 
    + 'The layout always consumes the entire screen.'
;

const ctor = (args = {}) => {    
    const main = $$(LR)
        .setLeft(Simple("Left"))
        .setRight(Simple("Right")
    );

    return $$(TB, { ratio: 0.12 })
        .setTop(Simple(info))
        .setBottom(main)
};

const clsid = DOM.registerCompound(ctor);
export default clsid;
