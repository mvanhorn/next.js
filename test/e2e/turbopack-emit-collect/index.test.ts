import { nextTestSetup } from 'e2e-utils'

// The data should be in a deterministic order, but the order in dev is not guaranteed to be the
// same as in prod, so we sort it before matching the snapshot.
function sortData(data: { id: string; data: string }[]) {
  return [...data].sort(
    (a, b) =>
      a.id.localeCompare(b.id) ||
      JSON.stringify(a.data).localeCompare(JSON.stringify(b.data))
  )
}

;(process.env.IS_TURBOPACK_TEST ? describe : describe.skip)(
  'turbopack-emit-collect',
  () => {
    const { next } = nextTestSetup({
      files: __dirname,
    })

    it('works for /client/a', async () => {
      let $ = await next.render$('/client/a')
      let response = JSON.parse($('#list').text())
      expect(sortData(response)).toMatchInlineSnapshot(`
       [
         {
           "data": "data-for-layout",
           "id": "layout-target.js [app-rsc] (ecmascript)",
           "import": "layout",
         },
         {
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-client] (ecmascript)",
           "import": "app client",
         },
         {
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-ssr] (ecmascript)",
           "import": "app client",
         },
         {
           "data": "data-for-shared-app",
           "id": "target.js [app-rsc] (ecmascript)",
           "import": "shared-app",
         },
         {
           "data": "data-for-unique-client-a",
           "id": "unique.js [app-client] (ecmascript)",
           "import": "unique /client/a",
         },
         {
           "data": "data-for-unique-client-a",
           "id": "unique.js [app-ssr] (ecmascript)",
           "import": "unique /client/a",
         },
       ]
      `)
    })

    it('works for /client/b', async () => {
      let $ = await next.render$('/client/b')
      let response = JSON.parse($('#list').text())
      expect(sortData(response)).toMatchInlineSnapshot(`
       [
         {
           "data": "data-for-layout",
           "id": "layout-target.js [app-rsc] (ecmascript)",
           "import": "layout",
         },
         {
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-client] (ecmascript)",
           "import": "app client",
         },
         {
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-ssr] (ecmascript)",
           "import": "app client",
         },
         {
           "data": "data-for-shared-app",
           "id": "target.js [app-rsc] (ecmascript)",
           "import": "shared-app",
         },
         {
           "data": "data-for-unique-client-b",
           "id": "unique.js [app-client] (ecmascript)",
           "import": "unique /client/b",
         },
         {
           "data": "data-for-unique-client-b",
           "id": "unique.js [app-ssr] (ecmascript)",
           "import": "unique /client/b",
         },
       ]
      `)
    })

    it('works for /rsc/a', async () => {
      let $ = await next.render$('/rsc/a')
      let response = JSON.parse($('#list').text())
      expect(sortData(response)).toMatchInlineSnapshot(`
       [
         {
           "data": "data-for-layout",
           "id": "layout-target.js [app-rsc] (ecmascript)",
           "import": "layout",
         },
         {
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-client] (ecmascript)",
           "import": "app client",
         },
         {
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-ssr] (ecmascript)",
           "import": "app client",
         },
         {
           "data": "data-for-shared-app",
           "id": "target.js [app-rsc] (ecmascript)",
           "import": "shared-app",
         },
         {
           "data": "data-for-shared-page",
           "id": "target.js [app-rsc] (ecmascript)",
           "import": "shared-page",
         },
         {
           "data": "data-for-unique-rsc-a",
           "id": "unique.js [app-rsc] (ecmascript)",
           "import": "unique /rsc/a",
         },
       ]
      `)
    })

    it('works for /rsc/b', async () => {
      let $ = await next.render$('/rsc/b')
      let response = JSON.parse($('#list').text())
      expect(sortData(response)).toMatchInlineSnapshot(`
       [
         {
           "data": "data-for-layout",
           "id": "layout-target.js [app-rsc] (ecmascript)",
           "import": "layout",
         },
         {
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-client] (ecmascript)",
           "import": "app client",
         },
         {
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-ssr] (ecmascript)",
           "import": "app client",
         },
         {
           "data": "data-for-shared-app",
           "id": "target.js [app-rsc] (ecmascript)",
           "import": "shared-app",
         },
         {
           "data": "data-for-shared-page",
           "id": "target.js [app-rsc] (ecmascript)",
           "import": "shared-page",
         },
         {
           "data": "data-for-unique-rsc-b",
           "id": "unique.js [app-rsc] (ecmascript)",
           "import": "unique /rsc/b",
         },
       ]
      `)
    })

    it('works for /rsc/c', async () => {
      let $ = await next.render$('/rsc/c')
      let response = JSON.parse($('#list').text())
      expect(sortData(response)).toMatchInlineSnapshot(`
       [
         {
           "data": "data-for-layout",
           "id": "layout-target.js [app-rsc] (ecmascript)",
           "import": "layout",
         },
         {
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-client] (ecmascript)",
           "import": "app client",
         },
         {
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-ssr] (ecmascript)",
           "import": "app client",
         },
         {
           "data": "data-for-shared-app",
           "id": "target.js [app-rsc] (ecmascript)",
           "import": "shared-app",
         },
         {
           "data": "data-for-shared-page",
           "id": "target.js [app-rsc] (ecmascript)",
           "import": "shared-page",
         },
       ]
      `)
    })

    it('works for /api', async () => {
      const response = JSON.parse(await next.render('/api'))
      expect(sortData(response)).toMatchInlineSnapshot(`
       [
         {
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-client] (ecmascript)",
           "import": "app client",
         },
         {
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-ssr] (ecmascript)",
           "import": "app client",
         },
         {
           "data": "data-for-shared-app",
           "id": "target.js [app-rsc] (ecmascript)",
           "import": "shared-app",
         },
         {
           "data": "data-for-unique-api",
           "id": "unique.js [app-route] (ecmascript)",
           "import": "unique api",
         },
       ]
      `)
    })

    // TODO
    // workstore says
    //      isStaticGeneration: false,
    //      page: '/',
    //      route: '/',
    it.skip('works for /proxy', async () => {
      const response = JSON.parse(await next.render('/proxy'))
      expect(sortData(response)).toMatchInlineSnapshot(``)
    })
  }
)
