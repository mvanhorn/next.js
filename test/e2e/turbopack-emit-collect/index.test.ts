import { nextTestSetup } from 'e2e-utils'
;(process.env.IS_TURBOPACK_TEST ? describe : describe.skip)(
  'turbopack-emit-collect',
  () => {
    const { next } = nextTestSetup({
      files: __dirname,
    })

    it('works for /client/a', async () => {
      let $ = await next.render$('/client/a')
      let response = JSON.parse($('#list').text())
      expect(response).toMatchInlineSnapshot(`
       [
         {
           "data": "data-for-layout",
           "id": "layout-target.js [app-rsc] (ecmascript)",
           "import": "layout",
         },
         {
           "data": "data-for-shared-app",
           "id": "target.js [app-rsc] (ecmascript)",
           "import": "shared-app",
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
      expect(response).toMatchInlineSnapshot(`
       [
         {
           "data": "data-for-layout",
           "id": "layout-target.js [app-rsc] (ecmascript)",
           "import": "layout",
         },
         {
           "data": "data-for-shared-app",
           "id": "target.js [app-rsc] (ecmascript)",
           "import": "shared-app",
         },
         {
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-client] (ecmascript)",
           "import": "app client",
         },
         {
           "data": "data-for-unique-client-b",
           "id": "unique.js [app-client] (ecmascript)",
           "import": "unique /client/b",
         },
         {
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-ssr] (ecmascript)",
           "import": "app client",
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
      expect(response).toMatchInlineSnapshot(`
       [
         {
           "data": "data-for-layout",
           "id": "layout-target.js [app-rsc] (ecmascript)",
           "import": "layout",
         },
         {
           "data": "data-for-unique-rsc-a",
           "id": "unique.js [app-rsc] (ecmascript)",
           "import": "unique /rsc/a",
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
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-client] (ecmascript)",
           "import": "app client",
         },
         {
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-ssr] (ecmascript)",
           "import": "app client",
         },
       ]
      `)
    })

    it('works for /rsc/b', async () => {
      let $ = await next.render$('/rsc/b')
      let response = JSON.parse($('#list').text())
      expect(response).toMatchInlineSnapshot(`
       [
         {
           "data": "data-for-layout",
           "id": "layout-target.js [app-rsc] (ecmascript)",
           "import": "layout",
         },
         {
           "data": "data-for-unique-rsc-b",
           "id": "unique.js [app-rsc] (ecmascript)",
           "import": "unique /rsc/b",
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
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-client] (ecmascript)",
           "import": "app client",
         },
         {
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-ssr] (ecmascript)",
           "import": "app client",
         },
       ]
      `)
    })

    it('works for /rsc/c', async () => {
      let $ = await next.render$('/rsc/c')
      let response = JSON.parse($('#list').text())
      expect(response).toMatchInlineSnapshot(`
       [
         {
           "data": "data-for-layout",
           "id": "layout-target.js [app-rsc] (ecmascript)",
           "import": "layout",
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
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-client] (ecmascript)",
           "import": "app client",
         },
         {
           "data": "data-for-shared-app-client-a",
           "id": "shared-app-client.js [app-ssr] (ecmascript)",
           "import": "app client",
         },
       ]
      `)
    })

    it('works for /api', async () => {
      const response = JSON.parse(await next.render('/api'))
      expect(response).toMatchInlineSnapshot(`
       [
         {
           "data": "data-for-unique-api",
           "id": "unique.js [app-route] (ecmascript)",
           "import": "unique api",
         },
         {
           "data": "data-for-shared-app",
           "id": "target.js [app-rsc] (ecmascript)",
           "import": "shared-app",
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
      expect(response).toMatchInlineSnapshot(``)
    })
  }
)
