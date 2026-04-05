// src/compounds/json-editor.js
//
// JSON Editor — proof of concept for the type-driven compositor.
//
// Flow:
//   JSON string
//     → parse
//     → Node tree  (via Node.from_json)
//     → IPropertyGroup root
//     → PropsView  (compositor walks tree, TypeRegistry resolves views)
//     → DOM.mount
//
// This file owns:
//   - TypeRegistry default registrations  (the axiomatic type→view map)
//   - Node.from_json  (JSON-aware tree builder, handles arrays)
//   - createJsonEditor(jsonString, layoutConfig?)  (entry point)

import { DomRegistry as DOM } from '../dom-registry.js';
import { TypeRegistry } from '../shared/type-registry.js';
import { Node, IPropertyGroup, IProperty } from '../shared/mediator.js';

import CLSID_FloatEdit  from '../dom-comps/prop-float.js';
import CLSID_StringEdit from '../dom-comps/prop-string.js';
import CLSID_BoolEdit   from '../dom-comps/prop-bool.js';
import CLSID_NullView   from '../dom-comps/prop-null.js';
import CLSID_PropsView  from '../dom-comps/props-view.js';

// ─── Type registry defaults ───────────────────────────────────────────────────
// This is the axiomatic fixed-point layer: the default type→view map.
// All JSON primitives covered. 'object' and 'array' both map to PropsView
// since both are PropertyGroups — array just has numeric-string keys.

TypeRegistry.registerDefault('float',   CLSID_FloatEdit);
TypeRegistry.registerDefault('integer', CLSID_FloatEdit);   // integers use FloatEdit for now
TypeRegistry.registerDefault('string',  CLSID_StringEdit);
TypeRegistry.registerDefault('boolean', CLSID_BoolEdit);
TypeRegistry.registerDefault('null',    CLSID_NullView);
TypeRegistry.registerDefault('object',  CLSID_PropsView);
TypeRegistry.registerDefault('array',   CLSID_PropsView);   // arrays render as collapsible groups


// ─── JSON → Node tree ─────────────────────────────────────────────────────────
// Builds a typed Node tree from a parsed JSON value.
// Arrays become 'array' groups with children keyed "0", "1", "2" ...
// Objects become 'object' groups.
// Primitives become typed leaf nodes.

function inferTypeId(value) {
    if (value === null)             return 'null';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'string')  return 'string';
    if (typeof value === 'number')  return Number.isInteger(value) ? 'integer' : 'float';
    if (Array.isArray(value))       return 'array';
    if (typeof value === 'object')  return 'object';
    return 'string'; // fallback
}

function buildNode(name, value, config = {}) {
    const typeId = inferTypeId(value);
    const isGroup = typeId === 'object' || typeId === 'array';

    const node = new Node({
        name,
        typeId,
        type:   isGroup ? 'group' : 'property',
        value:  isGroup ? undefined : value,
        config,
    });

    if (isGroup) {
        const entries = Array.isArray(value)
            ? value.map((v, i) => [String(i), v])
            : Object.entries(value);

        entries.forEach(([k, v]) => {
            const childConfig = config[k] ?? {};
            node.add(buildNode(k, v, childConfig));
        });
    }

    return node;
}

// Patch IProperty to expose typeId — compositor needs it
// (IPropertyGroup already delegates to node, same pattern here)
function makeTypedProperty(node) {
    const prop = new IProperty(node);
    prop.getTypeId = () => node.P.typeId;
    return prop;
}

function makeTypedGroup(node) {
    const group = new IPropertyGroup(node);
    group.getTypeId  = () => node.P.typeId;
    // Override getChildren to return typed interfaces
    group.getChildren = () =>
        node.getChildren().map(child =>
            child.P.type === 'group'
                ? makeTypedGroup(child)
                : makeTypedProperty(child)
        );
    return group;
}


// ─── Entry point ──────────────────────────────────────────────────────────────

/**
 * Creates and mounts a JSON editor.
 *
 * @param {string} jsonString   - Raw JSON string to edit
 * @param {Object} layoutConfig - Optional per-path view overrides
 *                                e.g. { radius: { view: CLSID_PropSlider, min: 0, max: 100 } }
 */
function ctor(jsonString, layoutConfig = {}) {
    let parsed;
    try {
        parsed = JSON.parse(jsonString);
    } catch (e) {
        console.error('[JsonEditor] Invalid JSON:', e.message);
        return null;
    }

    if (typeof parsed !== 'object' || parsed === null) {
        console.error('[JsonEditor] Root must be an object or array');
        return null;
    }

    // Build the Node tree
    const rootNode = buildNode('root', parsed, layoutConfig);

    // Wrap in a typed IPropertyGroup interface
    const rootGroup = makeTypedGroup(rootNode);

    // Create the root PropsView — from here the compositor recurses
    // via props-view.js init() which calls TypeRegistry for each child
    const rootView = DOM.create(CLSID_PropsView, {
        props:  rootGroup,
        config: layoutConfig,
    });

    // TODO: redesign
    return {
        // Returns current state of the tree as a plain JS object
        getData() {
            return rootNode.to_obj_using_traverse();
        },
        // Returns the root IPropertyGroup for external observation
        getRoot() {
            return rootGroup;
        },
    };

    // TODO: return this instead of the above
    return {
        getHost:     () => self.host,
        getInstance: () => self,
    };
}

const IJsonEditor = function(self) {
    return {
        // interface methods
    }
}

const clsid = DOM.register(ctor, function (role) {

    role("JsonEditor", self => IJsonEditor(self), true);

}, {
    name: 'JSON-Editor',
    description: 'A visual JSON editor'
});
export default 'jscom.jsonedit.JsonEditor';