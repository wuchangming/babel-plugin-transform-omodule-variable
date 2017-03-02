import { transformFileSync } from 'babel-core';

import path from 'path';

const pluginPath = __dirname;

const babelOptions = {
    plugins: [[pluginPath, {
        // separator: '/'
    }]]
};

const emptyOptions = {};

test('__dirname', () => {
    // const filePath = path.join(__dirname, '../omodule-test-cases/root/route/route.js');
    const filePath = path.join(
        __dirname,
        // '../omodule-test-cases/outside.js'
        '../omodule-test-cases/root/route/route.js'
        // '../omodule-test-cases/root/omodules/secondOmodule/omodule.js'
        // '../omodule-test-cases/root/omodules/firstOmodule/omodules/deepOmodule1/omodule.js'

    );

    const pluginRes = transformFileSync(filePath, babelOptions).code;
    const originRes = transformFileSync(filePath, emptyOptions).code;

    console.log(pluginRes);
});
//
// test('__filename', () => {
//
//     const filename_path = path.join(__dirname, '../test_folder/filename.js')
//
//     const pluginRes = transformFileSync(filename_path, babelOptions).code
//     const originRes = transformFileSync(filename_path, emptyOptions).code
//
//     const expectRes = originRes.replace('__filename', `"${filename_path}"`)
//     expect(pluginRes).toBe(expectRes)
//
// })
//
// test('__filename_string', () => {
//
//     const filename_path = path.join(__dirname, '../test_folder/filename_string.js')
//
//     const pluginRes = transformFileSync(filename_path, babelOptions).code
//     const originRes = transformFileSync(filename_path, emptyOptions).code
//
//     const expectRes = originRes
//     expect(pluginRes).toBe(expectRes)
//
// })
