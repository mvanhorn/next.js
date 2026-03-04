__turbopack_emit__('./a.js', {
  namespace: 'my-test',
  data: 'data-for-a',
})

console.log('this is lib.js')
export default function () {
  import('./async')
}
