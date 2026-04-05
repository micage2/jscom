# jscom Architecture

## Core Credo
- All data is a tree. File formats are serialized trees.
- Modularize almost everything.
- Information hiding is the key to grow big.

---

## The Three Trees

Every app is composed of three separate, independent trees:

1. **Data tree** — the single source of truth. We may not own it (external formats like SVG, JSON).
2. **View tree** — the DOM/component hierarchy.
3. **Layout config** — the binding declaration between data and views.

The **compositor** is the only place that holds references to all three.
It reads the layout config, resolves data paths, constructs views from the registry,
and injects Property/PropertyGroup interfaces. None of the three trees knows about the others.

---

## Data Tree Interfaces

Direct access to the data tree is provided via exactly two interfaces,
partitioned by node type:

- **`IPropertyGroup`** — for internal (parent) nodes. Observes insertion and deletion of children.
  - `getName()`, `getConfig()`, `getChildren()`, `for_each(cb)`
  - `addChild(name, type, data, config)`, `removeChild(name)`
  - `on('prop-added', cb)`, `on('prop-removed', cb)`

- **`IProperty`** — for leaf nodes. Observes value changes.
  - `getName()`, `getValue()`, `getConfig()`, `getTypeId()`
  - `setValue(v)`
  - `on('value-changed', cb)`

Both extend `Mediator` (pub/sub). Both live in `src/shared/mediator.js`.

Views are injected with one of these interfaces at creation time (constructor injection).
A view never navigates the tree itself — it only sees what it was handed.

---

## Node Addressing

Nodes are addressed by dot-separated path strings:

```
circles.circle1.r
```

---

## Component Registry (`DomRegistry`)

Lives in `src/dom-registry.js`.

Responsibilities:
- `register(ctor, config)` — registers a UI component, returns `clsid`
- `registerCompound(ctor, info)` — registers a compound (composition root), returns `clsid`
- `create(clsid, options)` — instantiates a component, manages private DOM handles via `WeakMap`
- `createCompound(clsid, options)` — instantiates a compound
- `getCompounds()` — returns `Map<name, { name, title, root }>` of all named compounds
- `attach(source, target, options)` — DOM tree management
- `detach(iface)`, `mount(iface)` — lifecycle

Private DOM handles (component roots) are stored in a `WeakMap` — this is the
*only* reason `DomRegistry` exists separately from the abstract registry.

**Fossils to eventually remove:** `connect()`, `action()`, `reaction()` — remnants
of the old DirectShow-style cable-wiring era. Replaced by the Mediator pattern.

---

## Type Registry (`TypeRegistry`)

Lives in `src/shared/type-registry.js`.

Maps data type ids to component clsids. Two-level lookup:

```
layout config override  →  wins unconditionally
TypeRegistry default    →  fallback
```

```js
TypeRegistry.registerDefault('float',   CLSID_FloatEdit);
TypeRegistry.registerDefault('integer', CLSID_FloatEdit);
TypeRegistry.registerDefault('string',  CLSID_StringEdit);
TypeRegistry.registerDefault('boolean', CLSID_BoolEdit);
TypeRegistry.registerDefault('null',    CLSID_NullView);
TypeRegistry.registerDefault('object',  CLSID_PropsView);
TypeRegistry.registerDefault('array',   CLSID_PropsView);
```

This is the **axiomatic fixed-point layer** — the default type→view map that
bootstraps the self-describing layout system. A JSON object can describe itself
using only these defaults, including the layout editor itself.

The type registry is open for extension: register new types without touching
the compositor. External importers (SVG, custom formats) register their own types.

---

## Compositor Flow

```
Data tree node
  → getTypeId()
  → TypeRegistry.resolve(typeId, layoutHint?)  →  clsid
  → DomRegistry.create(clsid, { prop | props, config })
  → DOM node
```

For groups (`IPropertyGroup`): `DOM.create(clsid, { props, config })`
For leaves (`IProperty`):      `DOM.create(clsid, { prop, config })`

The compositor recurses via `props-view.js` — it calls `TypeRegistry` for each
child, so the recursion is driven by the data tree shape.

---

## Layout Config

A plain JS object (or JSON) that declares bindings and optional view overrides:

```js
{
    circle: {
        r: {
            view: CLSID_PropSlider,  // override default FloatEdit
            min: 0,
            max: 200,
            step: 0.5,
        }
    }
}
```

- No layout config entry → TypeRegistry default wins
- `view` field → layout override wins
- All other fields in the entry → passed as `config` to the component ctor

---

## Component Contract

Every component `ctor` receives `{ prop, config }` or `{ props, config }` and returns:

```js
{
    getHost:     () => HTMLElement,
    getInstance: () => internalState,
}
```

Every component registers itself:

```js
const clsid = DOM.register(ctor, function(role) {
    role('RoleName', self => IRole(self), true);  // true = default role
});
export default clsid;
```

---

## Compound Contract

Compounds are pure composition roots. They receive `args`, wire up components,
and return the root view iface directly (not `{ getHost, getInstance }`).

```js
const ctor = (args = {}) => {
    // build and wire components
    return rootViewIface;
};

const clsid = DOM.registerCompound(ctor, { name: '11.0', title: 'JSON Editor' });
export default clsid;
```

Self-registration via `info.name` means `app.js` only needs an import — no manual
map entry required.

---

## App Entry Point (`app.js`)

Pure composition root. No component knowledge.

```js
import { DomRegistry as DOM } from './dom-registry.js';
import APPROOT from './compounds/app-root.js';

// Each import self-registers via DOM.registerCompound(..., { name, title })
import './compounds/app10.js';
import './compounds/app-json-editor.js';
// ... one line per compound

const app = DOM.createCompound(APPROOT, {
    apps:  DOM.getCompounds(),
    start: '11.0',
});
DOM.mount(app);
```

---

## File Structure

```
src/
├── app.js                          ← composition root, imports only
├── dom-registry.js                 ← component/compound registry, DOM lifecycle
├── registry.js                     ← abstract registry (future: backend-agnostic)
├── shared/
│   ├── mediator.js                 ← Mediator, Node, IProperty, IPropertyGroup
│   ├── type-registry.js            ← typeId → clsid map
│   ├── dom-helper.js               ← makeFragment etc.
│   └── ...
├── dom-comps/                      ← registered UI components (DOM.register)
│   ├── prop-float.js               ← FloatEdit
│   ├── prop-string.js              ← StringEdit
│   ├── prop-bool.js                ← BoolEdit (checkbox)
│   ├── prop-null.js                ← NullView (read-only)
│   ├── prop-slider.js              ← PropSlider (opt-in via layout config)
│   ├── props-view.js               ← PropsView (group container, compositor recursion point)
│   ├── json-editor.js              ← JSON→Node tree builder, TypeRegistry setup, clsid export
│   └── ...
└── compounds/                      ← self-registering composition roots (DOM.registerCompound)
    ├── app-root.js                 ← app switcher + container manager
    ├── app-json-editor.js          ← JSON Editor compound
    └── ...
```

---

## What Remains To Do

1. **`dom-comps/json-editor.js`** — wrap in `DOM.register(ctor, config)`, export `clsid`
   (currently exports `buildJsonEditor` function — needs to become a proper component)

2. **`app-json-editor.js`** — update to use `DOM.create(CLSID_JSONEDITOR, ...)` 
   instead of calling `buildJsonEditor` directly

3. **Existing compounds** — add `{ name, title }` to each `DOM.registerCompound()` call
   so `getCompounds()` picks them up (9 files, one line each)

4. **`mediator.js` bug fix** — `IPropertyGroup.for_each` calls `this.#node.forChildren()`
   which doesn't exist. Fix:
   ```js
   for_each(cb) {
       this.#node.getChildren().forEach(child =>
           cb(this.getChild(child.P.name))
       );
   }
   ```

5. **`registry.js`** — revive as the backend-agnostic abstract registry.
   `DomRegistry` becomes one registered backend. Future: CanvasRegistry, etc.

6. **Dead code removal** — `connect()`, `action()`, `reaction()` in `dom-registry.js`
   and their remnants in existing compounds.

---

## Key Design Decisions (with reasoning)

**Why one source of truth?**
Eliminates sync bugs. All views observe the same tree via interfaces — no copies.

**Why constructor injection of prop interfaces?**
Views never navigate the tree. Strict capability boundary. Testable in isolation.

**Why TypeRegistry + layout config override?**
Solves the "open with" problem: one default per type, overridable per binding.
`FloatEdit` is the generic default for floats. `PropSlider` is opt-in with explicit params.

**Why self-registering compounds?**
Adding a compound = one import line in `app.js`. No manual map maintenance.
Closest to the 3dsmax/After Effects plugin model achievable without a bundler.

**Why no bundler/framework?**
Web platform specs change slowly. Frameworks create dependency treadmills.
Pure ES modules + Shadow DOM + Custom Elements are sufficient and stable.

**Why the axiomatic fixed-point layout?**
The layout system is self-describing: the layout editor uses the same type→view
defaults to render itself. One hardcoded level (the type→view map) is the ground
floor — a necessary axiom, not a design failure.
