import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Traces from './components/Traces'
import Annotation from './components/Annotation'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Traces />} />
        <Route path="/annotation" element={<Annotation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App