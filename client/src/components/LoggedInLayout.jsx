import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const LoggedInLayout = () => {
  return (
    <div>
      <Navbar />
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default LoggedInLayout;
