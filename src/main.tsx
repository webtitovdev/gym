import { render } from 'preact';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import './styles.css';

registerSW({ immediate: true });

const root = document.getElementById('app');
if (!root) throw new Error('#app not found');
render(<App />, root);
