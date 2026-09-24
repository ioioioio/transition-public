import MapView from './components/map/MapView';
import Menu from './components/menu/Menu';

function App() {
    return (
        <div className="flex min-h-dvh flex-col bg-background md:h-dvh md:flex-row">
            <Menu />
            <div className="order-first h-[60dvh] md:order-0 md:h-auto md:flex-1">
                <MapView />
            </div>
        </div>
    );
}

export default App;
