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
    external: (name) => name === 'react' || /szfe-tools/.test(name),
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
    external: (name) => name === 'react' || /szfe-tools/.test(name),
    plugins: [
      resolve(),
      babel({
        exclude: 'node_modules/**',
      }),
      commonjs(),
    ],
  },
]
