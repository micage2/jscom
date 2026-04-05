import { DomRegistry as DOM } from '../dom-registry.js';
import APP from '../dom-comps/app_with_store.js'
import SIMPLE from '../dom-comps/simple-view.js'
import LR from '../dom-comps/left-right.js'
import TB from '../dom-comps/top-bottom.js'
import TBS from '../dom-comps/top-bottom-static.js'
import LISTVIEW from '../dom-comps/list-view.js'
import LISTITEM from '../dom-comps/list-item.js'
import BOX from '../dom-comps/box.js'
import ONLYONEBOX from '../dom-comps/only-one-box.js'
import BUTTON from '../dom-comps/button.js'
import TAB from '../dom-comps/tab.js'
import SVGVIEW2 from '../dom-comps/svg-view-2.js'

/*
SVG editor strategy:
Load SVG file, this is data so it should fill the app tree
Really? That would mean to copy data into the tree that has
already been loaded.

Should we implement a specialized version of IPropertyGroup?
*/



const SVG_PATH = './assets/svg/cities.svg';
const ICON_PATH = './assets/icons/';

const $$ = DOM.create;

const info = ''
;

const ctor = (args = {}) => {
    return $$(APP);
};

const clsid = DOM.registerCompound(ctor);
export default clsid;
