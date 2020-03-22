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
      exports: 'named'
    },
    external: ['react'],
    plugins: [
      resolve(),
      babel({
        exclude: 'node_modules/**'
      }),
      uglify()
    ]
  },
  {
    input: 'src/index.js',
    output: {
      file: 'lib/index.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    external: ['react'],
    plugins: [
      resolve(),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  },
  {
    input: 'src/babel/index.js',
    output: {
      file: 'lib/babel/index.js',
      format: 'cjs'
    },
    external: ['jsx-ast-utils'],
    plugins: [
      resolve(),
      commonjs(),
      babel({
        babelrc: false,
        presets: [
          [
            '@babel/env',
            {
              targets: {
                node: true
              }
            }
          ]
        ],
        exclude: 'node_modules/**'
      })
    ]
  }
]
