import Link from "next/link";

export default function Header() {
  return (
    <header>
      <nav className="header-flex-container">
        <h1>
          <Link href="/" className="brand-name">
            TeachTeam
          </Link>
        </h1>
      </nav>
    </header>
  );
}
