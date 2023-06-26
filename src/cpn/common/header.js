import { useLocation, Link } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <header>
      {/* Các thành phần khác của header */}
     
        {pathnames.length > 1 ? (
          <>
            <Link to="/">Home</Link>
            {pathnames.map((value, index) => {
              const to = `/${pathnames.slice(0, index + 1).join("/")}`;

              return (
                <span key={index}>
                  &nbsp;&gt;&nbsp;
                  <Link to={to}>{value}</Link>
                </span>
              );
            })}
          </>
        ) : null}
      
    </header>
  );
};


export default Header;
