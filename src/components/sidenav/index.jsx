import { NavLink } from "react-router-dom";
import { LuBook, LuBot, LuFile, LuUsersRound, LuUserX } from "react-icons/lu";

export function Sidenav() {
  const Modules = [
    {
      name: "Courses",
      icon: <LuBook className="text-xl" />,
      link: "/",
    },
    {
      name: "Users",
      icon: <LuUsersRound className="text-xl" />,
      link: "/users",
    },
    {
      name: "User Offboarding",
      icon: <LuUserX className="text-xl" />,
      link: "/users/offboard",
    },
    {
      name: "Change Logs",
      icon: <LuFile className="text-xl" />,
      link: "/changeLogs/manage",
    },
    {
      name: "Agent",
      icon: <LuBot className="text-xl" />,
      link: "/agent",
    },
  ];

  return (
    <div className="rounded-md px-4 relative h-full flex flex-col overflow-hidden">
      <h1 className="text-left ml-4 font-bold text-zinc-600 text-xl py-4">
        Utter Admin
      </h1>
      <nav className="mt-5 flex-1 overflow-y-auto">
        {Modules.map((item) => (
          <NavLink
            to={item.link}
            key={item.name}
            className={({ isActive }) =>
              `flex items-center gap-4 py-4 px-4 my-1 rounded-md hover:bg-gray-100 ${
                isActive ? "bg-gray-200 dark:bg-zinc-600" : ""
              }`
            }
          >
            <div className="flex items-center justify-center text-gray-500">
              {item.icon}
            </div>
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
