import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DemoPage from './pages/DemoPage';
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';
import ContactPage from './pages/ContactPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Oauthsuc from './pages/Oauthsuc';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import Profile from './components/Profile';
import TableUploader from './pages/TableUploader';
import TableJoinPage from './pages/TableJoin';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/oauthsuccess" element={<Oauthsuc />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/table-uploader" element={<TableUploader />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/table-join" element={<TableJoinPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;