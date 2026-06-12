/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const test = require("node:test");
const ts = require("typescript");

require.extensions[".ts"] = function loadTypeScript(module, filename) {
  const source = require("node:fs").readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText;

  module._compile(output, filename);
};

const {
  buildCatalogItemScope,
} = require("../src/lib/reseller/catalog-scope.ts");
const {
  replaceCatalogItemById,
} = require("../src/lib/reseller/catalog-state.ts");
const {
  applyCatalogOverrides,
} = require("../src/lib/reseller/public-overrides-utils.ts");

test("buildCatalogItemScope keeps id and resellerId in the update filter", () => {
  assert.deepEqual(buildCatalogItemScope("catalog-1", "reseller-9"), {
    id: "catalog-1",
    resellerId: "reseller-9",
  });
});

test("replaceCatalogItemById updates only the matching item", () => {
  const first = { id: "a", name: "Hotel A", price: 100 };
  const second = { id: "b", name: "Hotel B", price: 200 };
  const updatedSecond = { id: "b", name: "Hotel B Editado", price: 350 };

  const next = replaceCatalogItemById([first, second], updatedSecond);

  assert.equal(next[0], first);
  assert.notEqual(next[1], second);
  assert.deepEqual(next, [first, updatedSecond]);
});

test("applyCatalogOverrides applies public hotel overrides without mutating the source item", () => {
  const hotel = {
    id: "hotel-1",
    name: "Hotel Base",
    description: "Descripcion base",
    priceFrom: 250000,
  };

  const result = applyCatalogOverrides("hotel", hotel, {
    sourceId: "hotel-1",
    customName: "Hotel Personalizado",
    customDescription: "Descripcion personalizada",
    customPrice: 300000,
  });

  assert.deepEqual(result, {
    id: "hotel-1",
    name: "Hotel Personalizado",
    description: "Descripcion personalizada",
    priceFrom: 300000,
  });
  assert.deepEqual(hotel, {
    id: "hotel-1",
    name: "Hotel Base",
    description: "Descripcion base",
    priceFrom: 250000,
  });
});

test("applyCatalogOverrides maps package and transport custom fields to the public shape", () => {
  const pkg = {
    id: "pkg-1",
    title: "Paquete Base",
    description: "Base",
    price: 1000,
  };
  const transport = {
    id: "tr-1",
    name: "Transfer Base",
    notes: "Notas base",
    basePrice: 50,
  };

  const pkgResult = applyCatalogOverrides("package", pkg, {
    sourceId: "pkg-1",
    customName: "Paquete VIP",
    customDescription: "Incluye extras",
    customPrice: 1500,
  });
  const transportResult = applyCatalogOverrides("transport", transport, {
    sourceId: "tr-1",
    customName: "Transfer Privado",
    customDescription: "Chofer bilingue",
    customPrice: 80,
  });

  assert.deepEqual(pkgResult, {
    id: "pkg-1",
    title: "Paquete VIP",
    description: "Incluye extras",
    price: 1500,
  });
  assert.deepEqual(transportResult, {
    id: "tr-1",
    name: "Transfer Privado",
    notes: "Chofer bilingue",
    basePrice: 80,
  });
});
