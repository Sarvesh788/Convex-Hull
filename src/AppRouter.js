// AppRouter.js

import React from 'react';
import { Router, Route, hashHistory } from 'react-router-dom';
import App from './App';
import Account from './Account';

const AppRouter = () => (
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <Route path="account" component={Account}/>
      {/* Other routes */}
    </Route>
  </Router>
);

export default AppRouter;
