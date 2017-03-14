import path from 'path';
import fs from 'fs';

const isFile = pathString => {
    return fs.lstatSync(pathString).isFile();
};

const isDirectory = pathString => {
    return fs.lstatSync(pathString).isDirectory();
};

const getFolderName = pathString => {
    return path.join(pathString, '..');
};

const isRoot = (dirname, sourceRoot) => {
    if (!dirname) {
        return true;
    }
    if (sourceRoot && sourceRoot === dirname) {
        return true;
    }
    const parentDir = getFolderName(dirname);
    if (parentDir === dirname) {
        return true;
    }

    return false;
};

const hasOmoduleFileFun = oFilename => dirname => {
    const files = fs.readdirSync(dirname);
    return files.indexOf(oFilename) > -1 && isFile(path.join(dirname, oFilename));
};

const getOmoduleFolderPath = (dirname, sourceRoot, oFilename) => {
    const hasOmoduleFile = hasOmoduleFileFun(oFilename);
    if (hasOmoduleFile(dirname)) {
        return dirname;
    } else {
        const parentDir = getFolderName(dirname);
        if (isRoot(parentDir, sourceRoot)) {
            throw new Error(
                `file: ${path.join(dirname, oFilename)} not be included in any 'omodule'.`
            );
        }
        return getOmoduleFolderPath(parentDir, sourceRoot, oFilename);
    }
};

const getOmoduleName = (dirname, sourceRoot, oFilename) => {
    return path.basename(getOmoduleFolderPath(dirname, sourceRoot, oFilename));
};

const getParentOmoduleFolderPath = (omoduleFolderPath, sourceRoot, oFilename) => {
    const hasOmoduleFile = hasOmoduleFileFun(oFilename);
    const omodulesFloderPath = getFolderName(omoduleFolderPath);
    const parentDir = getFolderName(omodulesFloderPath);

    if (isRoot(parentDir, sourceRoot)) {
        return null;
    } else {
        if (hasOmoduleFile(parentDir)) {
            return parentDir;
        } else {
            return null;
        }
    }
};

const getOmoduleNameSpace = (dirname, sourceRoot, oFilename, separator, subNamespace = '') => {
    const omoduleFolderPath = getOmoduleFolderPath(dirname, sourceRoot, oFilename);
    const omoduleFolderName = path.basename(omoduleFolderPath);
    const parentOmoduleFolderPath = getParentOmoduleFolderPath(
        omoduleFolderPath,
        sourceRoot,
        oFilename
    );
    const namespace = subNamespace
        ? omoduleFolderName + separator + subNamespace
        : omoduleFolderName;
    if (parentOmoduleFolderPath) {
        return getOmoduleNameSpace(
            parentOmoduleFolderPath,
            sourceRoot,
            oFilename,
            separator,
            namespace
        );
    }

    return namespace;
};

const getOmoduleChildNames = (filename, sourceRoot, oFilename, oChildFolderName) => {
    const hasOmoduleFile = hasOmoduleFileFun(oFilename);
    const dirname = getFolderName(filename);
    const omoduleFolderPath = getOmoduleFolderPath(dirname, sourceRoot, oFilename);
    const files = fs.readdirSync(omoduleFolderPath) || [];

    const childOmoduleFolderPath = path.join(omoduleFolderPath, oChildFolderName);
    if (files.indexOf(oChildFolderName) > -1 && isDirectory(childOmoduleFolderPath)) {
        const childOmoduleFolderFiles = fs.readdirSync(childOmoduleFolderPath) || [];
        return childOmoduleFolderFiles.reduce(
            (names, filename) => {
                const filePath = path.join(childOmoduleFolderPath, filename);
                if (isDirectory(filePath) && hasOmoduleFile(filePath)) {
                    return [...names, filename];
                } else {
                    return names;
                }
            },
            []
        );
    } else {
        return [];
    }
};

export default function({ types: t }) {
    return {
        visitor: {
            Identifier(babelPath, state) {
                let { filename, childFolderName, separator } = state.opts;
                const oFilename = filename || 'omodule.js';
                const oChildFolderName = childFolderName || 'omodules';
                separator = separator || '/';
                const dirname = getFolderName(state.file.opts.filename);

                if (babelPath.node.name === '__omodule_name') {
                    babelPath.replaceWith(
                        t.stringLiteral(
                            getOmoduleName(dirname, state.file.opts.sourceRoot, oFilename)
                        )
                    );
                }
                if (babelPath.node.name === '__omodule_namespace') {
                    const dirname = getFolderName(state.file.opts.filename);
                    babelPath.replaceWith(
                        t.stringLiteral(
                            getOmoduleNameSpace(
                                dirname,
                                state.file.opts.sourceRoot,
                                oFilename,
                                separator
                            )
                        )
                    );
                }
                if (babelPath.node.name === '__omodule_filename') {
                    babelPath.replaceWith(t.stringLiteral(path.basename(state.file.opts.filename)));
                }
                if (babelPath.node.name === '__omodule_childnames') {
                    const names = getOmoduleChildNames(
                        state.file.opts.filename,
                        state.file.opts.sourceRoot,
                        oFilename,
                        oChildFolderName
                    );

                    babelPath.replaceWith(
                        t.arrayExpression(
                            names.map(name => {
                                return t.stringLiteral(name);
                            })
                        )
                    );
                }
            }
        }
    };
}
