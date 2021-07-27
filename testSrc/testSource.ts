(async () => {
    //@ts-expect-error - our transformer accepts this syntax.
    const x = await import('./testPlugins/*');
    console.log(x);
})();