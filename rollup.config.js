import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

function bundleHandler(name) {
    return {
        input: `src/${name}.ts`,
        output: {
            file: `build/${name}.js`,
            sourcemap: true
        },
        plugins: [
            typescript({
                compilerOptions: {
                    target: 'ES2020',
                    module: 'esnext',
                    moduleResolution: 'node'
                }
            }),
            resolve(),
            commonjs(),
            terser(),
            json()
        ],
    };
}

export default [
    bundleHandler('blog-content-handler'),
    bundleHandler('content-creator-handler')
];