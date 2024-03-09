// frontend/src/store/rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';
import sessionReducer from './session';

const rootReducer = combineReducers({
  // ADD REDUCERS HERE
  session: sessionReducer,
});

export default rootReducer;
