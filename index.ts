import ts from 'typescript';
import fs from 'fs';
import path from 'path';

const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
    console.log('Working');
    return sourceFile => {
        const visitor = (node: ts.Node): ts.Node | ts.Node[] => {
            // console.log(node);
                    
            if (ts.isCallExpression(node)) {
                let isImportExpression = false;
                let modifiedNode: ts.CallExpression[] | undefined;

                node.forEachChild((child) => {
                    if (isImportExpression) {
                        console.log('This child node is an import descriptor.');
                        if (ts.isStringLiteral(child)) {
                            console.log('Confirmed string literal.');

                            // child.text, as opposed to getText() or getFullText(), omits quotation marks around the edges of the string.
                            const dir = child.text;
                            if (dir.endsWith('*')) {
                                const absDir = path.join(path.dirname(sourceFile.fileName), dir.slice(0, dir.length - 2));
                                console.log('Found a dynamic import with a wildcard. Attempting expansion.', absDir);
                                let nodeArr = [];
                                modifiedNode = fs.readdirSync(absDir).filter(filename => filename.endsWith('ts') || filename.endsWith('tsx')).map(filename => {
                                    const importKeyword = ts.factory.createToken(ts.SyntaxKind.ImportKeyword);
                                    const importId = ts.factory.createIdentifier("import");
                                    const relPath = path.join(dir.slice(0, dir.length - 2), path.parse(filename).name);
                                    const literalFilenameArg = [ts.factory.createStringLiteral('.' + path.delimiter + relPath)];

                                    return ts.factory.createCallExpression(
                                        // The typing on this argument is ts.Expression, but the following AST Viewer actually emits this code as valid for TS 4.3.2
                                        // @ts-ignore - https://ts-ast-viewer.com/#code/JYWwDg9gTgLgFAchgUwM4wHQ1QglAbiA
                                        importKeyword,
                                        undefined, 
                                        literalFilenameArg
                                    );
                                });
                            }
                        }
                    }
                    
                    // Check last, so the next sibling gets processed.
                    if (child.kind === ts.SyntaxKind.ImportKeyword) {
                        console.log('Is import keyword.');
                        isImportExpression = true;
                    }
                });

                // If we've replaced the node, exit early instead of continuing recursion.
                if (modifiedNode) {
                    return ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier("Promise"),
                            ts.factory.createIdentifier("all")
                        ),
                        undefined,
                        [ts.factory.createArrayLiteralExpression(
                            modifiedNode
                        )]
                    );
                }
            }

            return ts.visitEachChild(node, visitor, context);
        }

        return ts.visitNode(sourceFile, visitor);
    }
}

export default transformer;
