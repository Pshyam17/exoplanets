// src/app/components/Header.tsx
import Link from 'next/link';

export default function Header() {
  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>🌌 Exoplanet Game</h1>
        <nav>
          <ul style={navListStyle}>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/the-science">The Science</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

// Simple inline styles (optional)
const headerStyle: React.CSSProperties = {
  backgroundColor: '#0b3d91',
  color: 'white',
  padding: '10px 0',
};

const containerStyle: React.CSSProperties = {
  width: '90%',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.8rem',
};

const navListStyle: React.CSSProperties = {
  display: 'flex',
  listStyle: 'none',
  gap: '20px',
  margin: 0,
  padding: 0,
};
