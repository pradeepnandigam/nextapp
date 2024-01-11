import Link from 'next/link';
import Image from 'next/image'

const NavComponent = () => {
  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="flex items-center">
      <Image src="/image/logo.png" alt="My Image" width={500} height={300} />
      </div>
      <div className="flex space-x-4">
        <NavLink href="/">Demo</NavLink>
        <NavLink href="/product">Product</NavLink>
        <NavLink href="/aboutus">About Us</NavLink>
        <NavLink href="/pricing">Pricing</NavLink>
        <NavLink href="/login" highlighted>
          Login
        </NavLink>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  highlighted?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, highlighted }) => {
  const linkStyle = `text-white hover:text-gray-300 ${highlighted ? 'underline' : ''} ${
    highlighted ? 'text-orange-500' : ''
  }`;

  return (
    <Link href={href}>{children}
    </Link>
  );
};

export default NavComponent;
