import Link from 'next/link';

const NavComponent = () => {
  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="flex items-center">
        <Link href="/">
            {/* Replace the src with the actual logo path */}
            <img src="/image/logo.png" alt="Logo" className="w-16 h-16" />
        </Link>
      </div>
      <div className="flex space-x-4">
        <Link href="/">Demo</Link>
        <Link href="/product">Product</Link>
        <Link href="/aboutus">About Us</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/login" className="text-white hover:text-gray-300 underline text-orange-500">
          Login
        </Link>
      </div>
    </nav>
  );
};

export default NavComponent;
