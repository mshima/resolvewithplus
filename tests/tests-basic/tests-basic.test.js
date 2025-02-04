// Filename: resolvewithplus.spec.js  
// Timestamp: 2017.04.23-23:31:33 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import url from 'url'
import path from 'path'
import test from 'node:test'
import assert from 'node:assert/strict'
import resolvewithplus from '../../resolvewithplus.js'

const tofileurl = p => url.pathToFileURL(p).href
const toresolvefileurl = p => tofileurl(path.resolve(p))

test('should return matched export paths', () => {
  const exports = {
    '.': './lib/index.test.js',
    './lib': './lib/index.test.js',
    './lib/*': './lib/*.js',
    './lib/*.js': './lib/*.js',
    './submodule.js': './src/submodule.js',
    './package.json': './package.json'
  }

  const getmatch = (o, key, path) => resolvewithplus
    .getesmkeyvalmatch(key, o[key], path)

  assert.strictEqual(
    getmatch(exports, '.', './lib/index.test.js'),
    './lib/index.test.js')

  assert.strictEqual(
    getmatch(exports, './lib', './lib/index.test.js'),
    './lib/index.test.js')

  assert.strictEqual(
    getmatch(exports, './lib/*', './lib/index.test.js'),
    './lib/index.test.js')

  assert.strictEqual(
    getmatch(exports, './submodule.js', './submodule.js'),
    './src/submodule.js')
})

test('should convert win32 path to node-friendly posix path', () => {
  const win32Path = 'D:\\a\\resolvewithplus\\pathto\\testfiles\\testscript.js'
  const posixPath = 'D:/a/resolvewithplus/pathto/testfiles/testscript.js'
  const returnPath = resolvewithplus.pathToPosix(win32Path)

  assert.strictEqual(returnPath, posixPath)
})

test('should return a core module reference as require.resolve id', () => {
  assert.strictEqual(resolvewithplus('path'), 'node:path')
})

test('should return "node:" prefixed core module id', () => {
  assert.strictEqual(resolvewithplus('node:path'), 'node:path')
})

test('should return fileurl paths, as import.meta.resolve', async () => {
  const fullpath = path.resolve('../testfiles') + '/'
  const fullpathfileurl = tofileurl(fullpath)
  const relpathtoindex = '../testfiles/path/to/indexfile/index.js'
  const relpathspace = '../testfiles/path/to/indexfile/file name with spaces.js'
  const metaresolve = import.meta.resolve

  assert.strictEqual(
    await metaresolve('path', fullpathfileurl),
    resolvewithplus('path', fullpath))

  assert.strictEqual(
    await metaresolve('node:path', fullpathfileurl),
    resolvewithplus('node:path', fullpath))

  assert.strictEqual(
    await metaresolve('yargs', fullpathfileurl),
    resolvewithplus('yargs', fullpath))

  assert.strictEqual(
    await metaresolve('got', fullpathfileurl),
    resolvewithplus('got', fullpath))

  assert.strictEqual(
    await metaresolve('pg', fullpathfileurl),
    resolvewithplus('pg', fullpath))
  
  assert.strictEqual(
    await metaresolve('koa', fullpathfileurl),
    resolvewithplus('koa', fullpath))
  
  assert.strictEqual( // module id
    await metaresolve('optfn', fullpathfileurl),
    resolvewithplus('optfn', fullpath))

  assert.strictEqual( // relpath
    await metaresolve(relpathtoindex, fullpathfileurl),
    resolvewithplus(relpathtoindex, fullpath))

  assert.strictEqual(
    await metaresolve(relpathtoindex, import.meta.url),
    resolvewithplus(relpathtoindex, import.meta.url))

  assert.strictEqual(
    await metaresolve(relpathspace, import.meta.url),
    resolvewithplus(relpathspace, import.meta.url))
})

test('should return a full path when given relative path to index file', () => {
  const fullpath = path.resolve('../testfiles/')
  const indexPath = toresolvefileurl('../testfiles/path/to/indexfile/index.js')

  assert.strictEqual(
    resolvewithplus('./path/to/indexfile', fullpath),
    indexPath)

  assert.strictEqual(
    resolvewithplus('../testfiles/path/to/indexfile', fullpath),
    indexPath)

  assert.strictEqual(
    resolvewithplus('./path/to/indexfile/index', fullpath),
    indexPath)

  assert.strictEqual(
    resolvewithplus('./path/to/indexfile/index.js', fullpath),
    indexPath)
})

test('should use process path as a default "with" path, second param', () => {
  assert.strictEqual(resolvewithplus('./path/to/indexfile'), null)
  assert.strictEqual(
    resolvewithplus('../testfiles/path/to/indexfile'),
    toresolvefileurl('../testfiles/path/to/indexfile/index.js'))
})

test('should return null if a path does not exist', () => {
  assert.strictEqual(resolvewithplus('./path/does/not/exist'), null)
})

test('should return a full path when given the id to a module', () => {
  const fullpath = path.resolve('../testfiles') + '/'

  assert.strictEqual(
    resolvewithplus('optfn', fullpath),
    toresolvefileurl('../node_modules/optfn/optfn.js'))
})

test('should return null when given id to withpath inaccessible module', () => {
  const fullpath = path.resolve('../testfiles/')
  const fullpathindexfile = path.join(fullpath + '/path/to/indexfile')

  assert.strictEqual(
    resolvewithplus('notamodulename', fullpathindexfile), null)
})

test('should follow the behaviour of require.resolve', () => {
  const dirname = path.dirname(url.fileURLToPath(import.meta.url))
  const dirnameroot = path.resolve(dirname + '/../../')
  
  // needed in case, resolvewith is cloned to a different directory name
  const resolvewithrootdirname = path.basename(dirnameroot)
  const resolvewithresolved = path
    .resolve(`../../../${resolvewithrootdirname}`) + '/'
  
  assert.strictEqual(
    toresolvefileurl('../../resolvewithplus.js'),
    resolvewithplus(`../${resolvewithrootdirname}`, resolvewithresolved))

  const resolvewithedpath = resolvewithplus(
    './tests/testfiles/testscript.js',
    path.resolve(resolvewithresolved))

  assert.strictEqual(
    toresolvefileurl('../testfiles/testscript.js'),
    resolvewithedpath)

  assert.strictEqual(
    'node:path',
    resolvewithplus('path', path.resolve('../../../resolvewithplus/')))
})

test('should handle package.json "exports" field', () => {
  const fullpath = path.resolve('../testfiles/')
  
  assert.strictEqual(
    resolvewithplus('koa', fullpath),
    toresolvefileurl('../node_modules/koa/dist/koa.mjs'))
})

test('should handle package.json "exports" field, $.[0].import', () => {
  const fullpath = path.resolve('../testfiles/')
  
  assert.strictEqual(
    resolvewithplus('yargs', fullpath),
    toresolvefileurl('../node_modules/yargs/index.mjs'))
})

test('should handle package.json stringy "exports" field (got)', () => {
  const fullpath = path.resolve('../testfiles/')
  
  assert.strictEqual(
    resolvewithplus('got', fullpath),
    toresolvefileurl('../node_modules/got/dist/source/index.js'))
})

test('should handle package.json "main": "./lib" field (pg)', () => {
  const fullpath = path.resolve('../testfiles/')
  
  assert.strictEqual(
    resolvewithplus('pg', fullpath),
    toresolvefileurl('../node_modules/pg/lib/index.js'))
})

test('should return values from cache', () => {
  resolvewithplus.cache['filepathkey'] = 'filepathvalue'

  assert.strictEqual(resolvewithplus('filepath', 'key'), 'filepathvalue')
})

test('getasfilesync, should return path with extension, if found', () => {
  const fullpath = path.resolve('../node_modules/optfn/optfn')

  assert.strictEqual(resolvewithplus.getasfilesync(fullpath), `${fullpath}.js`)
})

test('getasdirsync, should return path with index, if found', () => {
  const fullpath = path.resolve('../testfiles/path/to/indexfile')
  const fullpathindexjs = path.join(fullpath, 'index.js')

  assert.strictEqual(
    resolvewithplus.getasdirsync(fullpath), fullpathindexjs)
})

test('getasnode_module_paths, should return list of paths (posix)', () => {
  const fullpath = path.resolve('../testfiles/path/to/indexfile')
  const { sep } = path
  const paths = fullpath.split(sep).slice(1).reduce((prev, p, i) => {
    if (p === 'node_modules' && !/[\\/]resolvewithplus[\\/]/.test(fullpath))
      return prev

    p = path.resolve(path.join(i ? prev[0][i-1] : sep, p))
    
    prev[0].push(p)
    prev[1].push(path.join(p, 'node_modules'))

    return prev
  }, [ [], [] ])[1].reverse()

  // [
  //   '/home/bumble/resolvewithplus/testfiles/path/to/indexfile/node_modules',
  //   '/home/bumble/resolvewithplus/testfiles/path/to/node_modules',
  //   '/home/bumble/resolvewithplus/testfiles/path/node_modules',
  //   '/home/bumble/resolvewithplus/testfiles/node_modules',
  //   '/home/bumble/resolvewithplus/node_modules',
  //   '/home/bumble/node_modules',
  //   '/home/node_modules'
  // ]
  //
  // [
  //   'D:\\a\\resolvewithplus\\testfiles\\path\\to\\indexfile\\node_modules',
  //   'D:\\a\\resolvewithplus\\testfiles\\path\\to\\node_modules',
  //   'D:\\a\\resolvewithplus\\testfiles\\path\\node_modules',
  //   'D:\\a\\resolvewithplus\\testfiles\\node_modules',
  //   'D:\\a\\resolvewithplus\\node_modules',
  //   'D:\\a\\node_modules'
  // ]
  assert.deepEqual(
    resolvewithplus.getasnode_module_paths(fullpath), paths)
})

test('should handle exports.import path definition', () => {
  assert.strictEqual(resolvewithplus.gettargetindex({
    name: 'test',
    exports: {
      types: './index.d.ts',
      require: './index.js',
      import: './index.mjs'
    }
  }), './index.mjs')
})

test('should handle exports["."].import path definition', () => {
  // used by 'koa@2.13.4'
  assert.strictEqual(resolvewithplus.gettargetindex({
    name: 'test',
    exports: {
      '.': {
        require: './index.js',
        import: './index.mjs'
      }
    }
  }), './index.mjs')
})

test('should handle exports stringy path definition', () => {
  // used by 'got'
  assert.strictEqual(resolvewithplus.gettargetindex({
    name: 'test',
    exports: './index.mjs'
  }), './index.mjs')
})

test('should handle mixed exports', () => {
  // used by 'yargs@17.5.1'
  assert.strictEqual(resolvewithplus.gettargetindex({
    name: 'test',
    exports: {
      './package.json': './package.json',
      '.': [ {
        import: './index.mjs',
        require: './index.cjs'
      }, './index.cjs' ],
      './helpers': {
        import: './helpers/helpers.mjs',
        require: './helpers/index.js'
      },
      './browser': {
        import: './browser.mjs',
        types: './browser.d.ts'
      },
      './yargs': [ {
        import: './yargs.mjs',
        require: './yargs'
      }, './yargs' ]
    }
  }), './index.mjs')
})
