I have a single source of truth data lets say:

```
Staff { measures: [Measure { notes: [A, B, C] }, Measure { notes: [G, F] }] }
```

To present this data, I apply some transformation to it to get a `View Model` that is easily rendered.

```
FreeNotes { A { x: 0, y: 0 }, B { x: 1, y: 1 } ... }
```

As the user interacts with the app, I apply changes to single source of truth data, and reapply transformations on View Model, and render.

Problem is, since the `View Model` gets rebuilt everytime, it View Model goes to garbage, even though most of the previous version is the same and single source of truth only changed slightly. How can I detect and reuse the View Model parts that hasn't changed, and only update the parts that has changed. 

