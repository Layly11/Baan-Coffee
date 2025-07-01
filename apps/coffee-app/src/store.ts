import { combineReducers } from 'redux'

import userReducer from './reducers/userReducer'

import { configureStore } from '@reduxjs/toolkit'

const reducers = combineReducers({
  user: userReducer
})

export default configureStore({
  reducer: reducers
})
