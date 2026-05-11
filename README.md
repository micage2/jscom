# jscom

What is it? Short answer: A Component Framework in pure Javascript.

An approach to proof that it's still possible to write complex UI's without any
dependencies to external frontend frameworks and their bloated dependency graphs
and complex build systems. Extendibility and modularization is built into the core 
from the start. Heavily inspired by the Component Object Model (COM).

Encapsulation is crucial for software projects to grow, although hard to achieve
in the Javascript, CSS and HTML domain where everything is open by design.
The goal is to make interfaces that the component exposes the only way to interact with 
a component. This must also be true for CSS styles. So all styles are attached to a 
Shadow DOM. This way they are not influenced by external CSS. 
If one wanted to break encapsulation (bad!) I see no way to prevent this completely. 
But I do my best to make this as hard/awkward as possible. Since core components
have full access to the DOM there has to be taken extreme precautions to not leak any
internal DOM stuff to the outside (e.g. message handler). Users that just use these 
components then don't have worry about it anymore.

Web framework design is hard because of the complexity of the underlying specs.
This complexity has to be massively reduced. As a mental model components are black 
boxes and interfaces are sitting at the boundary controlling what goes in and what
goes out. This way a component designer has full control over the functionality and not 
having to worry about side effects coming from outside the DOM/CSS. This requires
wrapping the DOM completely and making its vast functionality accessible piece by piece.
Or component by component if you will.

Since my view on data is that everything is tree-like the central data structure is a
state tree of properties. These can handle two-way databinding. For external data
which is in general also tree-like (JSON, XML, ...) custom property classes can be 
registered and integrate seamlessly into the built-in property tree. An example of 
this integration can be seen in shared/svg-property.js.

The flexibility of the recursive definition of properties together with an extendible 
type registry can go as far as self-modifying editors, creating file formats "on the fly" 
or attaching to already instantiated (live) external tree structures like the DOM.

I focus on resizable, editor-oriented UI components for Single Page Applications (SPA's) 
similar to Visual Studio Code that needs to be extended permanantly as the project at 
hand grows.

My endeavor in this project is a work in progress. To see how far I can come with it.
If I can build a full-fledged extendible vector graphics editor with reusable components
the proof is done.

[Early Preview of an SVG editor](https://micage2.github.io/jscom/)

![screenshot](assets/images/app-preview.png)
