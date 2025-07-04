
const initialState = { accessToken: null }
const accessTokenReducer = (state = initialState, action: any) => {
    if(action.type === 'SET_USER_TOKEN'){
        return {...state, accessToken: action.payload }
    }
    return state
}

export default accessTokenReducer