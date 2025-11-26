import { CameraPreview } from "./components/content/CameraPreview";
import { SettingsPanel } from "./components/content/SettingsPanel";
import { Footer } from "./components/popup/footer";
import { Header } from "./components/popup/header";
import { Popup } from "./components/popup/popup";
import { Wrapper } from "./components/wrapper";

function App() {
  const handleClose = () => {};
  return (
    <Wrapper>
      <div className="min-w-[320px] max-w-md bg-background text-foreground p-4 space-y-4 rounded-xl">
        <Header />
        <Popup />
        <Footer />
      </div>
      <SettingsPanel open onClose={handleClose} onApply={() => {}} />
      <CameraPreview open />
    </Wrapper>
  );
}

export default App;
