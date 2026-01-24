import { Link, useLocation } from "react-router-dom";

export default function Breadcrumb() {
  const { pathname } = useLocation();
  const paths = pathname.split("/").filter(Boolean);

  return (
    <div className="container py-3 text-sm text-gray-500">
      <div className="flex items-center gap-2">
        <Link to="/" className="hover:text-red-500">Home</Link>

        {paths.map((item, i) => {
          const url = "/" + paths.slice(0, i + 1).join("/");
          const last = i === paths.length - 1;

          return (
            <span key={i} className="flex items-center gap-2">
              <span>/</span>
              {last ? (
                <span className="capitalize text-gray-700 font-medium">
                  {item.replace("-", " ")}
                </span>
              ) : (
                <Link to={url} className="hover:text-red-500 capitalize">
                  {item.replace("-", " ")}
                </Link>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
