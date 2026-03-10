// ensure that args contains width and height
function foo(args) {
    const {
        width = 300,
        height = 300,
        ...otherArgs
    } = { ...(args ?? {}) };

    // now we can access height and width
    const dimensions = { width, height };
    console.log(`dimensions: (${width}, ${height})`);    
}