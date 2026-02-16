// app.js
import { DomRegistry as DOM } from './dom-registry.js';
import SPLIT_LR from './dom-comps/vertical-split-mmm.js';
import SPLIT_TB from './dom-comps/horizontal-split-mmm.js';
import DUMMY from './dom-comps/placeholder.js';

const left_right = DOM.create(SPLIT_LR, { ratio: 0.2 });
const lr2 = DOM.create(SPLIT_LR, { ratio: 0.6 });
const top_bottom = DOM.create(SPLIT_TB, { ratio: 0.1 });
const tb2 = DOM.create(SPLIT_TB, { ratio: 0.7 });
const tb3 = DOM.create(SPLIT_TB, { ratio: 0.5 });

const p1 = DOM.create(DUMMY, { color: '#1a1916', text: 'P1' });
const p2 = DOM.create(DUMMY, { color: '#2a1a16', text: 'P2' });
const p3 = DOM.create(DUMMY, { color: '#1a1916', text: 'P3' });
const p4 = DOM.create(DUMMY, { color: '#1a1916', text: 'P4' });
const p5 = DOM.create(DUMMY, { color: '#1a1916', text: 'P5' });
const p6 = DOM.create(DUMMY, { color: '#1a1916', text: 'P5' });

top_bottom.setTop(p2);
top_bottom.setBottom(lr2.setLeft(tb3).setRight(p5));

tb3.setTop(p4).setBottom(p6);
left_right.setLeft(tb2.setTop(p1).setBottom(p3));
left_right.setRight(top_bottom);

DOM.mount(left_right);


