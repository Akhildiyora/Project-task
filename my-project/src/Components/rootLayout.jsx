import ScrollToTop from "./scrooltoTop";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <>
      <ScrollToTop /> 
      <Outlet />
    </>
  );
};

export default RootLayout;