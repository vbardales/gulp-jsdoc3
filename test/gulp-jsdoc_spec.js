/*eslint-env mocha */

import {jsdoc} from '../src/gulp-jsdoc';
import {expect} from 'chai';
import fs from 'fs'; // Should be chai-fs, but that does not work with our version of chai
import gulp from 'gulp';
import tmp from 'tmp';

describe('gulp-jsdoc', function () {
    let config = {
        tags: {
            allowUnknownTags: true
        },
        source: {
            includePattern: '.+\\.js(doc|x)?$',
            excludePattern: '(^|\\/|\\\\)_'
        },
        opts: {
            destination: undefined
        },
        plugins: ['plugins/markdown'],
        templates: {
            cleverLinks: false,
            monospaceLinks: false,
            'default': {
                outputSourceFiles: true
            },

            path: 'ink-docstrap',
            theme: 'cerulean',
            navType: 'vertical',
            linenums: true,
            dateFormat: 'MMMM Do YYYY, h:mm:ss a'
        }
    };

    let tmpdir;
    beforeEach(function () {
        tmpdir = tmp.dirSync();
        config.opts.destination = tmpdir.name;
    });

    describe('Success cases', function () {
        it('Should call done and document files', function (cb) {
            const done = function (err) {
                expect(err).not.to.exist;
                const stats = fs.statSync(config.opts.destination);
                expect(stats.isDirectory()).to.be.true;
                expect(fs.readFileSync(config.opts.destination + '/modules.list.html', 'utf-8'))
                    .to.contain('JSDocTesting');
                expect(fs.readFileSync(config.opts.destination + '/module-JSDocTesting.html', 'utf-8'))
                    .to.contain('inputDataHere');

                cb();
            };
            gulp.src([__dirname + '/testFile.js']).pipe(jsdoc(config, done));
        });

        it('Should call done only once when documenting multiple files', function (cb) {
            const done = function (err) {
                expect(err).not.to.exist;
                const stats = fs.statSync(config.opts.destination);
                expect(stats.isDirectory()).to.be.true;
                expect(fs.readFileSync(config.opts.destination + '/modules.list.html', 'utf-8'))
                    .to.contain('JSDocTesting');
                expect(fs.readFileSync(config.opts.destination + '/module-JSDocTesting.html', 'utf-8'))
                    .to.contain('inputDataHere');

                cb();
            };
            gulp.src([__dirname + '/testFile*.js']).pipe(jsdoc(config, done));
        });
    });

    describe('When passed no files', function () {
        it('Should call done with error when no files were passed', function (cb) {
            const done = function (err) {
                expect(err).to.exist;
                cb();
            };
            gulp.src(['./unkownFileName']).pipe(jsdoc(config, done));
        });
    });

    describe('When jsdoc does not exist', function () {
        const cmd = require.resolve('jsdoc/jsdoc.js');
        before(function () {
            fs.renameSync(cmd, cmd + '.renamed');
        });
        after(function () {
            fs.renameSync(cmd + '.renamed', cmd);
        });

        it('Should return an error due to error code != 0', function (cb) {
            const done = function (err) {
                expect(err).to.exist;
                cb();
            };
            gulp.src([__dirname + '/testFile.js']).pipe(jsdoc(config, done));
        });
    });
});
