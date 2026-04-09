import { MantineProvider } from '@mantine/core';
import './App.css';
import Home from './Home/Home';
import '@mantine/core/styles.css';
// import Temp from './Home/Temp';

function App() {
  return (
    <>
      <MantineProvider>
        <Home />
        {/* <Temp/> */}
      </MantineProvider>

    </>
  );
}

export default App;
