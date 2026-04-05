import { DomRegistry as DOM } from '../dom-registry.js';
import APP from '../dom-comps/app_with_store.js'
import TB from '../dom-comps/top-bottom.js'
import TBS from '../dom-comps/top-bottom-static.js'
// import SIMPLE from '../dom-comps/simple-view.js'
import BOX from '../dom-comps/dialog-box.js'
// import BUTTON from '../dom-comps/button.js'
import PROPSVIEW from '../dom-comps/props-view.js'
import SLIDERVIEW from '../dom-comps/prop-slider.js'
import BOOLVIEW from '../dom-comps/prop-bool.js'

const $$ = DOM.create;

const { ceil, random, floor, round } = Math;
const RR = (max = 100, min = 0, step = 1) => {
    const range = max - min;
    const val = min + random() * range;
    return step * floor(val/step);
};

// test data, normally this would come from outside
const data = {
    circles: {
        // shared config for all circles
        __config: {
            title: 'Circle',
            view: SLIDERVIEW,
            cx: { min: -500, max: 500, step: 10 },
            cy: { min: -500, max: 500, step: 10 },
            r: { min: 2, max: 200, step: 1 },
            flag: { view: BOOLVIEW },
        },
        'circle1': {
            cx: RR(300, -300, 10),
            cy: RR(300, -300, 10),
            r: RR(100)
        },
        'circle2': {
            cx: RR(300, -300, 10),
            cy: RR(300, -300, 10),
            r: RR(100)
        },
        'circle3': {
            cx: RR(300, -300, 10),
            cy: RR(300, -300, 10),
            r: RR(100)
        },
        'circle4': {
            __config: { type: 'circle', view: 'CirclePropsView' },
            cx: 20, cy: 50, r: 25, fill: 'red'
        },
    },
    rect: {
        __config: {
            title: 'User',
            view: 'USERVIEW',
            age: {}
        },
        'Heinz': { age: 42, email: 'heinz@gmail.com' },

    }

}

const ctor = (args = {}) => {
    const app = $$(APP, { name: 'app101' });
    const app_props = app.from_obj(data); // build tree from data

    const circles = app_props.getChild('circles'); // root props group
    const config = circles.getConfig(); // shared config

    const circle1 = circles.getChild('circle1');
    const circle2 = app_props.getByPath('circles.circle2');
    const circle3 = circles.getChild('circle3');

    const box = $$(BOX);
    circles.for_each((props) => {
        const config1 = props.isConfigEmpty() 
            ? config : props.getConfig();
        const view = $$(PROPSVIEW, { props, config: config1 });
        box.add(view);
    });
    
    app.set(box);

    return app;
};


const clsid = DOM.registerCompound(ctor);
export default clsid;
