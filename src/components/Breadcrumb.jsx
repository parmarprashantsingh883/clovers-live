import { Link, useLocation } from "react-router-dom";

export default function Breadcrumb({ product }) {
  const location = useLocation();

  const segments = location.pathname
    .split("/")
    .filter(Boolean)
    .filter(s => s !== "product"); // 👈 remove "product" slug

  const isProductPage = !!product?.name;

  return (
    <div className="container py-3 text-sm text-gray-500">
      <nav className="flex items-center gap-2 flex-wrap">
        <Link to="/" className="hover:text-red-500">Home</Link>

        {isProductPage ? (
          <>
            <span>/</span>
            <Link to="/food" className="hover:text-red-500">Food</Link>

            {product.category_name && (
              <>
                <span>/</span>
                <Link
                  to={`/category/${product.category_name}`}
                  className="hover:text-red-500 capitalize"
                >
                  {product.category_name}
                </Link>
              </>
            )}

            <span>/</span>
            <span className="text-gray-700 font-medium">
              {product.name}
            </span>
          </>
        ) : (
          segments.map((name, i) => {
            const route = "/" + segments.slice(0, i + 1).join("/");
            const last = i === segments.length - 1;

            return (
              <span key={i} className="flex items-center gap-2">
                <span>/</span>
                {last ? (
                  <span className="text-gray-700 font-medium capitalize">
                    {name.replace("-", " ")}
                  </span>
                ) : (
                  <Link to={route} className="hover:text-red-500 capitalize">
                    {name.replace("-", " ")}
                  </Link>
                )}
              </span>
            );
          })
        )}
      </nav>
    </div>
  );
}
