// app.js
import { DomRegistry as DOM } from './dom-registry.js';
import APPROOT from './compounds/app-root.js';

// Each import triggers self-registration via DOM.registerCompound(..., { name, title })
// Order here is the only thing that controls switcher order.
import './compounds/app10.js';
import './compounds/app30.js';
import './compounds/app31.js';
import './compounds/app32.js';
import './compounds/app33.js';
import './compounds/app70.js';
import './compounds/app80.js';
import './compounds/app81.js';
import './compounds/app101.js';
import './compounds/app-json-editor.js';

const app = DOM.createCompound(APPROOT, {
    apps:  DOM.getCompounds(),
    start: '11.0',
});

DOM.mount(app);
