import './lib'
import '../shared'

// eslint-disable-next-line no-undef
const getList = __turbopack_collect__({
  namespace: 'my-test',
})

export default function page() {
  console.log('first', getList())
  Promise.all(getList().map((item) => item.import())).then((v) =>
    console.log('first', v)
  )
  return <div>hello</div>
}
