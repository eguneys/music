import { nodeResolve } from '@rollup/plugin-node-resolve'
const htmlTemplate = require('rollup-plugin-generate-html-template')
const typescript = require('@rollup/plugin-typescript')

import copy from 'rollup-plugin-copy'
import css from 'rollup-plugin-import-css'
const image = require('@rollup/plugin-image')

const serve = require('rollup-plugin-serve')
const livereload = require('rollup-plugin-livereload')

const { terser } = require('rollup-plugin-terser')

export default args => {
  let prod = args['config-prod']
  return {
    input: 'src/main.ts',
    output: {
      format: 'iife', 
      name: 'Space',
      dir: 'dist',
      ...(prod ? {
        entryFileNames: '[name].min.js',
        plugins: [terser({mangle: {properties: { keep_quoted: true } }})]
      } : {
        sourcemap: true
      })
    },
    watch: {
      clearScreen: false
    },
    plugins: [
      nodeResolve(),
      typescript(),
      css(),
      htmlTemplate({
        template: 'src/index.html',
        target: 'index.html'
      }),
      image(),
      copy({
        targets: [{ src: 'assets', dest: 'dist' }]
      }),
      ...(prod ? [] : [
        serve({ contentBase: 'dist', port: 3000 }),
        livereload({ watch: 'dist', port: 8080 })
      ])
    ]
  }
}
