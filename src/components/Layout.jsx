import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
    return (
        <div className="flex flex-row h-screen">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                {children}
                <Outlet />
            </div>
        </div>
    );
}

export default Layout;