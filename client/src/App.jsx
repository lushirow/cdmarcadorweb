import React from 'react';
import { Route, Switch } from 'wouter';
import ControlPanel from './ControlPanel';
import OBSViewer from './OBSViewer';

function App() {
  return (
    <Switch>
      <Route path="/" component={ControlPanel} />
      <Route path="/obs" component={OBSViewer} />
      <Route>404, Not Found!</Route>
    </Switch>
  );
}

export default App;
