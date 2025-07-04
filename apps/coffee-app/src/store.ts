import { combineReducers } from 'redux'

import userReducer from './reducers/userReducer'
import accessTokenReducer from './reducers/accessTokenReducer'

import { configureStore } from '@reduxjs/toolkit'

const reducers = combineReducers({
  user: userReducer,
  token: accessTokenReducer
})

export default configureStore({
  reducer: reducers
})
