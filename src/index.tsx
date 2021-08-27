import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import { persistAndRenderApp } from '@common/persistence';

function renderApp() {
  ReactDOM.render(<App />, document.getElementById('actions-root'));
}

void persistAndRenderApp(renderApp);
