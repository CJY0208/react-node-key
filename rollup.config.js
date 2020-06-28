import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'lib/index.min.js',
      format: 'umd',
      name: 'ReactNodeKey',
      exports: 'named',
    },
    external: (name) =>
      name === 'react' || /core-js/.test(name) || /szfe-tools/.test(name),
    plugins: [
      resolve(),
      babel({
        exclude: 'node_modules/**',
      }),
      commonjs(),
      uglify(),
    ],
  },
  {
    input: 'src/index.js',
    output: {
      file: 'lib/index.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    external: (name) =>
      name === 'react' || /core-js/.test(name) || /szfe-tools/.test(name),
    plugins: [
      resolve(),
      babel({
        exclude: 'node_modules/**',
      }),
      commonjs(),
    ],
  },
  {
    input: 'src/babel/index.js',
    output: {
      file: 'lib/babel/index.js',
      format: 'cjs',
    },
    external: (name) => name === 'jsx-ast-utils' || /szfe-tools/.test(name),
    plugins: [
      resolve(),
      babel({
        babelrc: false,
        presets: [
          [
            '@babel/env',
            {
              targets: {
                node: true,
              },
            },
          ],
        ],
        exclude: 'node_modules/**',
      }),
      commonjs(),
    ],
  },
]
