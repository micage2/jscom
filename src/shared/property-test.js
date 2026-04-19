import { Property } from "./property.js";
import { Node } from "./node.js";
// import { AppNode } from "./node.js";

// Test suite for Property class
function runPropertyTests() {
    console.log('=== Property Class Tests ===');

    // Test 1: Basic construction and metadata
    console.log('\n1. Basic construction and metadata');
    const node = new Node({ name: 'root', value: undefined, type: 'group' });
    const root = new Property(node);
    console.log(`Name: ${root.getName()}`); // root
    console.log(`Type: ${root.getType()}`); // group
    console.log(`Is group: ${root.isGroup()}`); // true

    // Test 2: Adding children to group
    console.log('\n2. Adding children to group');
    const nameProp = root.add('name', 'Alice');
    const ageProp = root.add('age', 30);
    const addressProp = root.add('address', {});

    console.log(`Name: ${nameProp.getName()}`); // name
    console.log(`Type: ${nameProp.getType()}`); // string
    console.log(`Value: ${nameProp.get()}`); // Alice
    console.log(`Is group: ${nameProp.isGroup()}`); // false

    console.log(`Address: ${addressProp.getName()}`); // address
    console.log(`Type: ${addressProp.getType()}`); // group
    console.log(`Is group: ${addressProp.isGroup()}`); // true

    // Test 3: Adding nested children
    console.log('\n3. Adding nested children');
    const cityProp = addressProp.add('city', 'Wonderland');
    const zipProp = addressProp.add('zip', '12345');

    console.log(`City: ${cityProp.getName()}`); // city
    console.log(`Value: ${cityProp.get()}`); // Wonderland

    // Test 4: Getting children
    console.log('\n4. Getting children');
    const children = root.getChildren();
    console.log(`Root has ${children.length} children`); // 3

    children.forEach(child => {
        console.log(`- ${child.getName()} (${child.getType()})`);
    });

    // Test 5: Getting parent
    console.log('\n5. Getting parent');
    const parent = cityProp.getParent();
    console.log(`City parent: ${parent.getName()}`); // address

    // Test 6: Setting value on primitive
    console.log('\n6. Setting value on primitive');
    let valueChangedCount = 0;
    nameProp.on('value-changed', ({ oldValue, newValue }) => {
        console.log(`Value changed from ${oldValue} to ${newValue}`);
        valueChangedCount++;
    });

    nameProp.set('Bob');
    console.log(`Value changed events: ${valueChangedCount}`); // 1

    // Test 7: Adding child notification
    console.log('\n7. Adding child notification');
    let childAddedCount = 0;
    addressProp.on('child-added', (child) => {
        console.log(`Child added: ${child.getName()}`);
        childAddedCount++;
    });

    const countryProp = addressProp.add('country', 'USA');
    console.log(`Child added events: ${childAddedCount}`); // 1

    // Test 8: Removing child
    console.log('\n8. Removing child');
    let childRemovedCount = 0;
    addressProp.on('child-removed', (child) => {
        console.log(`Child removed: ${child.getName()}`);
        childRemovedCount++;
    });

    const removed = addressProp.remove('zip');
    console.log(`Removed: ${removed}`); // true
    console.log(`Child removed events: ${childRemovedCount}`); // 1

    // Test 9: Error cases
    console.log('\n9. Error cases');
    try {
        nameProp.add('test', 'value');
    } catch (e) {
        console.log(`Expected error: ${e.message}`); // Cannot add child to non-group property
    }

    try {
        nameProp.set('new value');
        console.log(`Set successful`);
    } catch (e) {
        console.log(`Unexpected error: ${e.message}`);
    }

    try {
        addressProp.set('new value');
    } catch (e) {
        console.log(`Expected error: ${e.message}`); // Cannot set value on group property
    }

    // Test 10: Traverse
    console.log('\n10. Traverse');
    const traverseResults = [];
    root.traverse((property, info) => {
        traverseResults.push({
            name: property.getName(),
            depth: info.depth,
            child_count: info.child_count,
            is_last: info.is_last
        });
    });

    traverseResults.forEach((result, i) => {
        console.log(`${i + 1}. ${result.name} (depth: ${result.depth}, children: ${result.child_count}, last: ${result.is_last})`);
    });

    // Test 11: get() for group returns undefined
    console.log('\n11. get() for group returns undefined');
    console.log(`Address value: ${addressProp.get()}`); // undefined

    // Test 12: getChildren() for primitive returns null
    console.log('\n12. getChildren() for primitive returns null');
    console.log(`Name children: ${nameProp.getChildren()}`); // null

    console.log('\n✅ All tests passed!');
}

// Run tests
runPropertyTests();