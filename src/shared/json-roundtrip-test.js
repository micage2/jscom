import { Property } from "./property.js";
import { Node } from "./node.js";

function testJsonRoundTrip() {
    console.log('=== JSON Round-Trip Test ===\n');

    const testData = {
        name: 'root',
        age: 30,
        active: true,
        address: {
            street: '123 Main St',
            city: 'Wonderland',
            coordinates: {
                lat: 51.5074,
                lng: -0.1278
            }
        },
        tags: null,
        hobbies: {
            reading: true,
            gaming: false
        }
    };

    console.log('Original JSON:');
    console.log(JSON.stringify(testData, null, 2));

    // Build tree from JSON using Node.from()
    console.log('\n--- Building tree from JSON ---');
    const rootNode = Node.from(testData);

    // Serialize back to JSON
    console.log('\n--- Serializing tree to JSON ---');
    const reconstructed = rootNode.toJson();

    console.log('\nReconstructed JSON:');
    console.log(JSON.stringify(reconstructed, null, 2));

    // Compare
    console.log('\n--- Comparison ---');
    const match = JSON.stringify(testData) === JSON.stringify(reconstructed);
    console.log(`Match: ${match ? '✅ YES' : '❌ NO'}`);

    return match;
}

const success = testJsonRoundTrip();
console.log(`\n${success ? '✅ Round-trip test PASSED' : '❌ Round-trip test FAILED'}`);
