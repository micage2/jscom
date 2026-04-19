// app.js
// entry point - loaded by index.html
import { DomRegistry as DOM } from './dom-registry.js';
import APPSWITCH from './compounds/app-switch.js';

// Each import triggers self-registration via DOM.registerCompound(..., { name, title })
// Order here is the only thing that controls switcher order.
// import './compounds/app10.js';
import './compounds/app30.js';
import './compounds/app31.js';
import './compounds/app32.js';
import './compounds/app33.js';
import './compounds/app34.js';
// import './compounds/app70.js';
// import './compounds/app80.js';
import './compounds/app81.js';
import APP101 from './compounds/app101.js';
// import './compounds/app-json-editor.js';

const compounds = DOM.getCompounds();
const mapAsc = new Map([...compounds.entries()].sort((a, b) => {
    return parseFloat(a[0]) - parseFloat(b[0]);
}));

const app = DOM.createCompound(APPSWITCH, {
    apps:  mapAsc,
    start: '3.4',
});

DOM.mount(app);
