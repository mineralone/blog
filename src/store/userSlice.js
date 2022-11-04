import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { userRegister, userLogin, editProfile } from '../API'

export const loginRegUser = createAsyncThunk('user/registerUser', async (objUser, { dispatch }) => {
  let response
  if (objUser.status === 'register') response = await userRegister(objUser)
  if (objUser.status === 'login') response = await userLogin(objUser)
  if (objUser.status === 'edit') response = await editProfile(objUser)
  dispatch(setUser(response))
})

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: {},
    error: {},
    load: false,
    authorization: false,
    redirect: false,
  },
  reducers: {
    setUser: (state, { payload }) => {
      if ('errors' in payload) {
        state.error = payload.errors
      } else {
        state.user = payload.user
        state.authorization = true
        state.redirect = true
        localStorage.setItem('user', JSON.stringify(payload.user))
      }
    },
    setUserLocal: (state) => {
      if (localStorage.getItem('user')) {
        state.user = JSON.parse(localStorage.getItem('user'))
        state.authorization = true
        state.redirect = true
      }
    },
    falseRedirect: (state) => {
      state.redirect = false
    },
    delError: (state, { payload }) => {
      if (payload === 'all') {
        state.error = {}
      } else {
        delete state.error[payload]
      }
    },
    logOut: (state) => {
      state.user = {}
      state.authorization = false
      localStorage.removeItem('user')
    },
  },
  extraReducers: {
    [loginRegUser.pending]: (state) => {
      state.load = true
    },
    [loginRegUser.rejected]: (state) => {
      state.load = false
    },
    [loginRegUser.fulfilled]: (state) => {
      state.load = false
    },
  },
})

export const { delError, setUser, logOut, falseRedirect, setUserLocal } = userSlice.actions

export default userSlice.reducer
