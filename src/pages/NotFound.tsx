import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchX } from "lucide-react";

const NotFound = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />

    <main className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-md">
        <SearchX size={52} className="mx-auto text-gray-300 mb-5" />
        <h1 className="text-2xl font-bold mb-2">This aisle doesn't exist</h1>
        <p className="text-gray-500 text-sm mb-7">
          The page you're looking for was moved or never stocked. Everything
          else is right where you left it.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-6 py-2.5 rounded-lg"
          >
            Back to shopping
          </Link>
          <Link
            to="/deals"
            className="border text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-50"
          >
            See today's deals
          </Link>
        </div>
      </div>
    </main>

    <Footer />
  </div>
);

export default NotFound;
