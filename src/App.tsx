import { Footer } from "./components/popup/footer";
import { Header } from "./components/popup/header";
import { Popup } from "./components/popup/popup";

function App() {
  return (
    <div className="min-w-[320px] max-w-md bg-slate-950 text-slate-50 p-4 space-y-4">
      <Header />
      <Popup />
      <Footer />
    </div>
  );
}

export default App;
