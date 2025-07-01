const userReducer = (state = null, action: any): any => {
  if (action.type === 'SET_USER') {
    return action.payload
  }
  return state
}

export default userReducer
