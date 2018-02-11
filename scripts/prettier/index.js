/**
 * Copyright (c) 2017-present, Christopher Dowell
 *
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

console.log('scripts:prettier: loading...')

const chalk = require('chalk')
const glob = require('glob')
const prettier = require('prettier')
const fs = require('fs')
const listChangedFiles = require('../shared/listChangedFiles')
const prettierConfigPath = require.resolve('../../.prettierrc')

const mode = process.argv[2] || 'check'

console.log('scripts:prettier: mode: ', mode)

const shouldWrite = mode === 'write' || mode === 'write-changed'
const onlyChanged = mode === 'check-changed' || mode === 'write-changed'

const changedFiles = null /* onlyChanged ? listChangedFiles() : null; */

let didWarn = false
let didError = false

const files = glob
    .sync('**/*.js', {
        ignore: '**/node_modules/**'
    })
    .filter((f) => !onlyChanged || changedFiles.has(f))

if (!files.length) {
    return
}

console.log('scripts:prettier: files: ', files)

files.forEach((file) => {
    console.log('scripts:prettier: file: ', file)

    const options = prettier.resolveConfig.sync(file, {
        config: prettierConfigPath
    })

    console.log('scripts:prettier: options: ', options)

    try {
        const input = fs.readFileSync(file, 'utf8')
        if (shouldWrite) {
            const output = prettier.format(input, options)
            if (output !== input) {
                fs.writeFileSync(file, output, 'utf8')
            }
        } else {
            if (!prettier.check(input, options)) {
                if (!didWarn) {
                    console.log(
                        '\n' +
                            chalk.red(
                                `  This project uses prettier to format all JavaScript code.\n`
                            ) +
                            chalk.dim(`    Please run `) +
                            chalk.reset('yarn prettier-all') +
                            chalk.dim(
                                ` and add changes to files listed below to your commit:`
                            ) +
                            `\n\n`
                    )
                    didWarn = true
                }
                console.log(file)
            }
        }
    } catch (error) {
        didError = true
        console.log('\n\n' + error.message)
        console.log(file)
    }
})

if (didWarn || didError) {
    process.exit(1)
}

console.log('scripts:prettier: loading...done!')
