import { Link, useNavigate } from "react-router-dom";
import { logout, getUser } from "../utils/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser(); // from localStorage

  if (!user) return null;

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold text-blue-600">📊 Pollify</div>

      <div className="flex items-center space-x-4">
        <span className="text-gray-600 capitalize font-medium">
          {user.role} ({user.name})
        </span>

        {user.role === "teacher" && (
          <>
            <Link to="/teacher/dashboard" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
            <Link to="/teacher/panel" className="text-blue-600 hover:underline">
              Poll Panel
            </Link>
          </>
        )}

        {user.role === "student" && (
          <Link to="/student/dashboard" className="text-blue-600 hover:underline">
            Dashboard
          </Link>
        )}

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
