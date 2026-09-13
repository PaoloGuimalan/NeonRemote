/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * The app shell: navigation, the organization switcher, and the account menu.
 *
 * TWO THINGS IT GATES ON
 * ----------------------
 * 1. No organization yet → the onboarding screen, not a menu. Every scoped
 *    route answers 403 until one exists, so there is genuinely nothing else
 *    to show.
 * 2. More than one organization → a switcher, because the tenant travels in a
 *    header rather than the URL. Without somewhere visible to see and change
 *    it, a user in two organizations could not tell which one they were
 *    editing - which is the one situation where a wrong guess writes data into
 *    the wrong tenant.
 */
import { useState } from "react";
import { FiBox, FiCpu, FiDatabase, FiHome, FiTool, FiUser, FiUsers } from "react-icons/fi";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { MdOutlinePages, MdOutlinePersonOutline } from "react-icons/md";
import { TbCpu } from "react-icons/tb";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

import SampleIcon from "../../assets/SampleIcon.svg";
import { useOrganization } from "@/app/context/OrganizationContext";
import CreateOrganization from "@/app/onboarding/CreateOrganization";
import Agents from "@/app/subcomponents/Agents";
import Bots from "@/app/subcomponents/Bots";
import Chat from "@/app/subcomponents/Chat";
import Connections from "@/app/subcomponents/Connections";
import Knowledge from "@/app/subcomponents/Knowledge";
import Models from "@/app/subcomponents/Models";
import Organization from "@/app/subcomponents/Organization";
import Roles from "@/app/subcomponents/Roles";
import Tools from "@/app/subcomponents/Tools";
import { ErrorNotice, Loading } from "@/app/widgets/Shell";
import { AuthStateInterface } from "@/hooks/interfaces";
import { authenticationstate } from "@/redux/actions/states";
import { SET_AUTHENTICATION } from "@/redux/types";

import Dashboard from "./Dashboard";

const NAV = [
  { label: "Home", route: "/", icon: FiHome, exact: true },
  { label: "Agents", route: "/agents", icon: FiBox },
  { label: "Roles", route: "/roles", icon: MdOutlinePersonOutline },
  { label: "Tools", route: "/tools", icon: FiTool },
  { label: "Knowledge", route: "/knowledge", icon: FiDatabase },
  { label: "Models", route: "/models", icon: TbCpu },
  { label: "Playground", route: "/playground", icon: IoChatboxEllipsesOutline },
  { label: "Bots", route: "/bots", icon: FiCpu },
  { label: "Connections", route: "/connections", icon: MdOutlinePages },
  { label: "Organization", route: "/organization", icon: FiUsers },
];

function Home() {
  const [toggleusercontrols, settoggleusercontrols] = useState(false);
  const [toggleorgs, settoggleorgs] = useState(false);

  const authentication: AuthStateInterface = useSelector((state: any) => state.authentication);
  const { organizations, active, loading, error, setActive, reload } = useOrganization();

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const logoutProcess = () => {
    localStorage.removeItem("authtoken");
    dispatch({
      type: SET_AUTHENTICATION,
      payload: { authentication: { auth: false, user: authenticationstate.user } },
    });
  };

  const isCurrent = (route: string, exact?: boolean) =>
    exact ? location.pathname === route : location.pathname.startsWith(route);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center font-Inter">
        <Loading label="Loading your workspace" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center font-Inter p-[20px]">
        <div className="w-full max-w-[460px]">
          <ErrorNotice message={error} onRetry={reload} />
        </div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return <CreateOrganization />;
  }

  return (
    <div className="bg-transparent w-full h-full flex flex-col">
      <div className="w-full h-[65px] bg-white flex flex-row items-center pl-[20px] pr-[20px] gap-[12px] border-b-[1px] border-[#e5e6ea] font-Inter">
        <img
          src={SampleIcon}
          onClick={() => navigate("/")}
          className="h-full max-w-[70px] max-h-[30px] cursor-pointer object-cover"
        />

        {/* The active organization. Shown even when there is only one, because
            "which tenant am I in" is not otherwise visible anywhere - the
            answer lives in a request header. */}
        <div className="relative flex">
          <button
            onClick={() => organizations.length > 1 && settoggleorgs(!toggleorgs)}
            className={`flex flex-row items-center gap-[6px] h-[34px] px-[10px] rounded-[7px] border-[1px] border-[#e5e6ea] text-[13px] font-semibold ${
              organizations.length > 1 ? "hover:bg-[#f3f5f9]" : "cursor-default"
            }`}
          >
            <span className="max-w-[180px] truncate">{active?.name}</span>
            {organizations.length > 1 && <span className="text-[10px] text-[#767676]">▾</span>}
          </button>

          {toggleorgs && (
            <div className="absolute left-0 top-[40px] z-20 flex flex-col bg-white rounded-[7px] border-[1px] border-[#e5e6ea] p-[5px] min-w-[220px] shadow-sm">
              {organizations.map((organization) => (
                <button
                  key={organization.id}
                  onClick={() => {
                    setActive(organization);
                    settoggleorgs(false);
                  }}
                  className={`flex flex-col items-start px-[8px] py-[6px] rounded-[5px] text-left hover:bg-[#f3f5f9] ${
                    organization.id === active?.id ? "bg-[#f3f5f9]" : ""
                  }`}
                >
                  <span className="text-[13px] font-semibold truncate max-w-[190px]">
                    {organization.name}
                  </span>
                  <span className="text-[12px] text-[#767676]">
                    {organization.member_count} member{organization.member_count === 1 ? "" : "s"}
                    {organization.is_owner ? " · owner" : ""}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-1" />

        <button
          onClick={() => settoggleusercontrols(!toggleusercontrols)}
          className="bg-[#e3e7f1] flex justify-center items-center w-[40px] h-[40px] rounded-[40px] shrink-0"
        >
          <FiUser style={{ fontSize: "22px", color: "#21242c" }} />
        </button>

        <motion.div
          initial={{
            overflowY: "hidden",
            height: "0px",
            paddingTop: "0px",
            paddingBottom: "0px",
            borderWidth: "0px",
          }}
          animate={{
            height: toggleusercontrols ? "auto" : "0px",
            paddingTop: toggleusercontrols ? "5px" : "0px",
            paddingBottom: toggleusercontrols ? "5px" : "0px",
            borderWidth: toggleusercontrols ? "1px" : "0px",
          }}
          className="flex flex-col pl-[5px] pr-[5px] p-[5px] bg-white absolute right-[20px] top-[55px] w-full max-w-[190px] rounded-[7px] border-[1px] border-[#e5e6ea] z-20"
        >
          {/* Whose Chatterloop account this session belongs to. Worth showing
              now that the identity is not Neon's own - somebody with two
              Chatterloop accounts has no other way to tell which one they are
              signed in as. */}
          <div className="flex flex-col px-[8px] py-[6px] border-b-[1px] border-[#f0f0f0] mb-[4px]">
            <span className="text-[13px] font-semibold truncate">
              {authentication.user.first_name || authentication.user.username}
            </span>
            <span className="text-[12px] text-[#767676] truncate">
              @{authentication.user.username}
            </span>
          </div>
          <motion.button
            onClick={logoutProcess}
            whileHover={{ backgroundColor: "#dd524c", color: "white" }}
            className="h-[30px] text-[14px] rounded-[5px] text-red-500 font-semibold"
          >
            Logout
          </motion.button>
        </motion.div>
      </div>

      <div className="bg-transparent flex flex-1 flex-row font-Inter">
        <div className="bg-transparent flex flex-col w-[calc(100%-40px)] max-w-[240px] items-start p-[16px] pt-[20px] border-r-[1px] border-[#f0f1f4] gap-[2px] overflow-y-auto x-scroll">
          {NAV.map((item) => {
            const Icon = item.icon;
            const current = isCurrent(item.route, item.exact);
            return (
              <motion.button
                key={item.route}
                whileHover={{ backgroundColor: "#f3f5f9" }}
                onClick={() => navigate(item.route)}
                className={`p-[10px] rounded-[7px] w-full flex flex-row justify-start items-center text-[14px] font-semibold gap-2 ${
                  current ? "bg-[#f3f5f9]" : "bg-transparent"
                }`}
              >
                <Icon style={{ fontSize: "19px", color: "#000000" }} />
                <span className="text-[#000000]">{item.label}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="flex flex-col flex-1 h-[calc(100vh-65px)] overflow-y-auto x-scroll">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agents/*" element={<Agents />} />
            <Route path="/roles/*" element={<Roles />} />
            <Route path="/tools/*" element={<Tools />} />
            <Route path="/knowledge/*" element={<Knowledge />} />
            <Route path="/models/*" element={<Models />} />
            <Route path="/playground/*" element={<Chat />} />
            <Route path="/bots/*" element={<Bots />} />
            <Route path="/connections/*" element={<Connections />} />
            <Route path="/organization/*" element={<Organization />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Home;
