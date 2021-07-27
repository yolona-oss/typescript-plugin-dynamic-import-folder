# typescript-plugin-dynamic-import-folder

This is a [Typescript Transformer](https://github.com/madou/typescript-transformer-handbook) that converts [dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports) that end with a wildcard `*` symbol (instead of a filename) into an Array of imports for every file in the target directory.

This was an experiment, and is not being used by the creator in production code. PRs are welcome to improve configurability, especially for compatibility with systems like Webpack.

```
// For example, imagine a plugins directory with TestPlugin.ts and TestPlugin2.ts
// source.ts
let x = await import('./plugins/*');

// source.js
let x = await Promise.all([Promise.resolve().then(() => require(".\\plugins\\TestPlugin")), Promise.resolve().then(() => require(".\\plugins\\TestPlugin2"))]);
```

Note: Using Transformers [isn't officially supported](https://github.com/microsoft/TypeScript/issues/14419) in Typescript.

Similar projects:
* [babel-plugin-wildcard](https://github.com/vihanb/babel-plugin-wildcard) - A plugin that imports files as named properties to an object. Not dynamic.
* [require-context](https://www.npmjs.com/package/require-context) - Probably based on [this SO answer](https://stackoverflow.com/a/30652110/4752397), this trick lets you require folders of modules in Webpack.