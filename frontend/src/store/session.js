// frontend/src/store/session.js

import { csrfFetch } from './csrf';

const SET_USER = 'session/setUser';
const REMOVE_USER = 'session/removeUser';

const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

const removeUser = () => ({
  type: REMOVE_USER,
});
const initialState = { user: null };

// export const login = (user) => async (dispatch) => {
//   const { credential, password } = user;
//   const response = await csrfFetch('/api/session', {
//     method: 'POST',
//     body: JSON.stringify({
//       credential,
//       password,
//     }),
//   });
//   const data = await response.json();
//   dispatch(setUser(data.user));
//   return response;
// };

// export const login = (user) => async (dispatch) => {
//     try {
//       const response = await csrfFetch('/api/session', {
//         method: 'POST',
//         body: JSON.stringify(user),
//       });
//       const data = await response.json();
//       dispatch(setUser(data.user));
//       return data;
//     } catch (errorResponse) {
//       if (errorResponse.status === 401) {
//         const errorData = await errorResponse.json(); // 
//         const errors = errorData.message || "Invalid credentials"; 
//         throw new Error(errors);
//       } else {
//         throw new Error('Something went wrong. Please try again.');
//       }
//     }
//   };

// In your thunk action
export const login = (user) => async (dispatch) => {
    const response = await csrfFetch('/api/session', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  
    if (!response.ok) {
      // Assuming the server responds with a JSON payload on errors
      const error = await response.json();
      throw error; // Propagate the error as an object
    }
  
    const data = await response.json();
    dispatch(setUser(data.user));
    return data;
  };
  

export const signup = (user) => async (dispatch) => {
  const { username, firstName, lastName, email, password } = user;
  const response = await csrfFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({
      username,
      firstName,
      lastName,
      email,
      password,
    }),
  });
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};

export const logout = () => async (dispatch) => {
    const response = await csrfFetch('/api/session', {
      method: 'DELETE',
    });
    if (response.ok) {
      dispatch(removeUser());
    }
  };
  
const sessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case REMOVE_USER:
      return { ...state, user: null };
    default:
      return state;
  }
};

// Add the restoreUser action
export const restoreUser = () => async (dispatch) => {
  const response = await csrfFetch('/api/session');
  const data = await response.json();
  if (data.user) dispatch(setUser(data.user));
  return response;
};

export default sessionReducer;
