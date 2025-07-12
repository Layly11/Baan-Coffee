import React, { JSX, useEffect } from 'react'

import Head from 'next/head'
import { Provider, useDispatch } from 'react-redux'
import store from '../store'
import title from '../constants/title.json'

import 'rc-tooltip/assets/bootstrap.css'
import 'react-datepicker/dist/react-datepicker.css'

import '../styles/sweetalert.css'
import '../styles/globals.css'
import '../styles/datePicker.css'
import { setStoreDispatch } from '@/helpers/axios'

const SetupAxiosDispatch = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    setStoreDispatch(dispatch)
  }, [dispatch])

  return null
}

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
          <SetupAxiosDispatch />
        <Component {...pageProps} />
    </Provider>
  </>
)

export default WrappedApp
