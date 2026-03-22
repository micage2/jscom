let junk = {
    foo: "bar",
    people: [
        { name: "Heinz", age: 42, hobbies: ["diving", "boulder", "cinema"] },
        { name: "Gabi", age: 22, hobbies: ["biking", "soccer"] },
        { name: "Bernd", age: 32, hobbies: ["cooking", "dancing", "barbecue"] }
    ],
    job: {
        type: "IT",
        city: "Bonn",
    },
    math: {
        sqr: x => x * x,
        sin: Math.sin,
        myFun: "x^3-5y^2+1"
    },
    i1: {
        i11: {
            i111: "Vogel",
            i112: {
                i1121: {
                    i11211: "i11211 data"
                },
                x: 0,
                y: null,
                z: undefined,
                w: 400
            },
            i113: "Ente",
        },
        i12: {
            i121: "i121 data"
        }
    },
    i2: "i2 data",
    i3: "i3 data"
};

let jj = {
    citizen: "Michael",
    junk
};


let afterfx = {
    project: {
        compositions: {
            "Joker": {
                layers: {
                    "video1": {
                        desc: "Full HD",
                        width: 1920,
                        height: 1080
                    }
                },
                properties: {
                    blendMode: "normal",
                    opacity: 0.7
                }
            },
            "Casino": {
                "layers": {
                    "video1": {
                        desc: "HD",
                        width: 1280,
                        height: 720
                    }
                },
                properties: {
                    blendMode: "normal",
                    opacity: 0.7
                }
            }
        },
        workspace: {
            width: 1280,
            height: 720,
        }
    }
};

let scene1 = {
    schemes: {
        quad: { rx: 0, ry: 0, width: 20, height: 100 },
        circle: { x: 0, y: 0, r: 10 },        
    }
};

// export default test;
// module.exports = { junk, afterfx, jj };
export { junk, afterfx, jj };

