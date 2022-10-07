import './App.css'
import { useEffect, Fragment, useRef } from 'react'
import axios from 'axios'
import { useInView } from 'react-intersection-observer'
import {
  useInfiniteQuery,
} from "@tanstack/react-query"

function App() {
const referencePageCount = useRef(1)
  const { ref, inView } = useInView()

  const {
    status,
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    ['comments'],
    async ({ pageParam = 1 }) => {
      const res = await axios.get(`http://localhost:3000/comments?page=${pageParam}&size=5`)
      return res.data
    }
  )

  useEffect(() => {
    if (inView) {
      fetchNextPage({
        pageParam: referencePageCount.current++
      })
    }
  }, [inView])

  return (
    <div className="App">
      <h1 className="mb-8">Infinite Scrolling</h1>
      {status === 'loading' ? (
        <p>Loading...</p>
      ) : status === 'error' ? (
        <span>Error!</span>
      ) : (
        <>
          {data.pages.map((page, i) => (
            <Fragment key={`key-${i}`}>
              {page.data.map((comment: any) => (
                <div className="mb-8 p-10 border-solid border-2 rounded-md flex">
                  <div className="username mr-8  decoration-sky-900">
                    {comment.username}:
                  </div>
                  <div className="comment">
                      {comment.comment_text}
                  </div>
                </div>
              ))}
            </Fragment>
          ))}
          <div>
            <button
              ref={ref}
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
            >
              {isFetchingNextPage
                ? 'Loading more...'
                : hasNextPage
                ? 'Load Newer'
                : 'Nothing more to load'}
            </button>
          </div>
          <div>
            {isFetching && !isFetchingNextPage
              ? 'Background Updating...'
              : null}
          </div>
        </>
      )}
      <hr />
    </div>
  )
}

export default App
