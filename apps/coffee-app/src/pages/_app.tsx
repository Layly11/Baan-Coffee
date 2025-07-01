import React, { JSX } from 'react'

import Head from 'next/head'
import { Provider } from 'react-redux'
import store from '../store'
import title from '../constants/title.json'

const WrappedApp = ({
  Component,
  pageProps
}: {
  Component: any
  pageProps: object
}): JSX.Element => (
  <>
    <Head>
      <title>{title.TITLE}</title>
    </Head>

    <Provider store={store}>
        <Component {...pageProps} />
    </Provider>
  </>
)

export default WrappedApp
