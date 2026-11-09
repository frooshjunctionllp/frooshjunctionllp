/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Execute the real service with isolated browser storage and a controlled API.
function setup(fetchImpl) {
  const values = new Map();
  const events = new EventTarget();
  const calls = [];
  const context = vm.createContext({
    console, Event, AbortSignal, queueMicrotask,
    window: events,
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
    fetch: async (url, options) => {
      calls.push({ url, options });
      return fetchImpl(url, options);
    },
  });
  const modules = new Map();
  function load(file) {
    if (modules.has(file)) return modules.get(file).exports;
    const loadedModule = { exports: {} };
    modules.set(file, loadedModule);
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const fn = vm.runInContext(`(function(require, module, exports) {${source}\n})`, context);
    fn((name) => load(path.resolve(__dirname, '../src', name.slice(2) + '.ts')), loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }
  const { storageService: service } = load(path.resolve(__dirname, '../src/services/storageService.ts'));
  service.init();
  return { service, values, events, calls };
}
const response = (body, ok = true) => ({ ok, json: async () => body });
const product = { id: 'test-product', name: 'Test drink', categoryId: 'cat-juices', variants: [{ id: 'regular', name: 'Regular', price: 75 }], createdAt: '2026-11-09' };

test('cache reads and initialization do not initiate network requests', () => {
  const { service, calls } = setup(() => { throw new Error('Unexpected network request'); });
  for (let i = 0; i < 20; i++) {
    service.init(); service.getProducts(); service.getCategories(); service.getWorkers();
    service.getNextCustomerId(); service.getNextWorkerId();
  }
  assert.equal(calls.length, 0);
});

test('concurrent syncs share one request batch', async () => {
  const { service, calls } = setup(() => response({ success: true, data: [] }));
  await Promise.all([service.syncFromMongo(), service.syncFromMongo(), service.syncFromMongo()]);
  assert.equal(calls.length, 6);
});

test('overlapping order polls share one bounded request', async () => {
  const { service, calls } = setup(() => response({ success: true, data: [] }));
  await Promise.all([service.syncOrdersFromMongo(), service.syncOrdersFromMongo()]);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].options.signal instanceof AbortSignal);
});

test('failed menu saves reject and leave cached products unchanged', async () => {
  const { service } = setup(() => response({ success: false, message: 'Save failed' }, false));
  const before = JSON.stringify(service.getProducts());
  await assert.rejects(service.saveProduct(product), /Save failed/);
  assert.equal(JSON.stringify(service.getProducts()), before);
});

test('successful menu saves notify consumers and persist locally', async () => {
  const { service, events } = setup(() => response({ success: true }));
  await Promise.resolve();
  let changes = 0;
  events.addEventListener('froosh:change', () => changes++);
  await service.saveProduct(product);
  await Promise.resolve();
  assert.equal(service.getProducts()[0].id, product.id);
  assert.equal(changes, 1);
});

test('a stale in-flight sync cannot remove a newly saved product', async () => {
  let finishProducts;
  const { service } = setup((url, options) => {
    if (url === '/api/products' && !options.method) {
      return new Promise((resolve) => { finishProducts = () => resolve(response({ success: true, data: [] })); });
    }
    return response({ success: true, data: [] });
  });
  const syncing = service.syncFromMongo();
  await service.saveProduct(product);
  finishProducts();
  await syncing;
  assert.ok(service.getProducts().some((item) => item.id === product.id));
});

test('fallback data and HTTP errors cannot replace cached menu data', async () => {
  const { service } = setup(() => response({ success: true, fallback: true, data: [] }));
  const before = JSON.stringify(service.getProducts());
  await service.syncFromMongo();
  assert.equal(JSON.stringify(service.getProducts()), before);
});

test('login and logout publish state changes without a page reload', async () => {
  const { service, events } = setup(() => response({ success: true }));
  await Promise.resolve();
  let changes = 0;
  events.addEventListener('froosh:change', () => changes++);
  service.setCurrentUser({ id: 'admin-test', role: 'admin', username: 'test', name: 'Test' });
  await Promise.resolve();
  assert.equal(service.getCurrentUser().id, 'admin-test');
  service.logout();
  await Promise.resolve();
  assert.equal(service.getCurrentUser(), null);
  assert.equal(changes, 2);
});

test('failed deletes preserve the item and successful deletes remove it', async () => {
  let fail = false;
  const { service } = setup(() => response({ success: !fail, message: 'Delete failed' }, !fail));
  await service.saveProduct(product);
  fail = true;
  await assert.rejects(service.deleteProduct(product.id), /Delete failed/);
  assert.ok(service.getProducts().some((item) => item.id === product.id));
  fail = false;
  await service.deleteProduct(product.id);
  assert.ok(!service.getProducts().some((item) => item.id === product.id));
});
