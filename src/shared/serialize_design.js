// Render project’s state to a canvas and export it as an image (PNG/JPEG):
const link = document.createElement('a');
link.download = 'project-state.png';
link.href = canvas.toDataURL();
link.click();

// To restore state:
// upload an image via <input type="file">.
// Load the image into a canvas:

const img = new Image();
img.onload = () => {
    canvas.getContext('2d').drawImage(img, 0, 0);
    // Optionally extract embedded data from image (see below)
};
img.src = URL.createObjectURL(file);

//=========================================================
//
//      JSON → Canvas (via ImageData)

// 1. Serialize JSON to binary:
const json = { /* your state */ };
const str = JSON.stringify(json);
const encoder = new TextEncoder();
const uint8array = encoder.encode(str); // UTF-8 Uint8Array

// 2. Determine canvas dimensions:
const totalBytes = uint8array.length;
const pixelsNeeded = Math.ceil(totalBytes / 4); // 4 channels per pixel (RGBA)
const width = Math.ceil(Math.sqrt(pixelsNeeded));
const height = width;

// 3. Create ImageData and fill pixels:
const ctx = new OffscreenCanvas(width, height).getContext('2d');
const imageData = ctx.createImageData(width, height);
const data = imageData.data;

// Write bytes (pad with 0 if needed)
for (let i = 0; i < uint8array.length; i++) {
  data[i] = uint8array[i];
}
// Remaining bytes are auto 0 (padding)

// 4. Put data and export as image:
ctx.putImageData(imageData, 0, 0);
const blob = await ctx.canvas.convertToBlob(); // or toDataURL()


//=========================================================
//
//      Canvas (via ImageData) → JSON

// 1. Load image and draw to canvas:
const img = new Image();
img.onload = () => {
    const canvas = new OffscreenCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data; // Uint8ClampedArray
};
img.src = url;

// 2. Extract and decode JSON:
// Find end of meaningful data (first 0xff 0x00 0x00 0x00 or similar)
let endIndex = data.length;
for (let i = uint8array.length - 1; i >= 0; i--) {
  if (data[i] !== 0) {
    endIndex = i + 1;
    break;
  }
}

const trimmed = data.slice(0, endIndex);
const decoder = new TextDecoder('utf-8');
const jsonStr = decoder.decode(trimmed);
const state = JSON.parse(jsonStr);


//=========================================================
//
//      Image upload

// Q:   How to start an image upload by the user?
// A:   To start an image upload by the user, use an invisible 
//      <input type="file" accept="image/*"> element and trigger 
//      it programmatically.

<!-- Hidden file input -->
<input type="file" id="imageUpload" accept="image/*" style="display: none;" />

<!-- Button to trigger upload -->
<button onclick="document.getElementById('imageUpload').click()">
  Upload Image
</button>

document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      // Process the image (e.g., read as data URL or into canvas)
      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.onload = () => {
          // Now you can draw to canvas or extract ImageData
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          // Use imageData for JSON decoding or processing
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });


//=========================================================================
//
//     Use localStorage or IndexedDB
//
// localStorage: Store small amounts of data (up to ~5MB) as strings. 
// Can save a base64-encoded image (from canvas.toDataURL()) 
// or JSON data directly.

// Save generated image
  localStorage.setItem('projectImage', canvas.toDataURL('image/png'));
  // Save JSON data
  localStorage.setItem('projectData', JSON.stringify(yourData));
  
// IndexedDB: For larger or binary data (e.g., images, blobs), use IndexedDB.
// It supports structured data and binary objects without size constraints 
// like base64 bloat.

// Store image as blob
const blob = await fetch(canvas.toDataURL()).then(res => res.blob());
const db = await openDatabase(); // Setup IndexedDB
const tx = db.transaction('store', 'readwrite');
tx.objectStore('store').put(blob, 'projectImage');
await tx.done;
  
// Retrieve Later
// From localStorage
const img = document.getElementById('img');
img.src = localStorage.getItem('projectImage');
  
// From IndexedDB
const blob = await db.transaction('store').objectStore('store').get('projectImage');
img.src = URL.createObjectURL(blob);
  
    