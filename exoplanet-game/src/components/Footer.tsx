// src/app/components/Footer.tsx
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <p>© {currentYear} Exoplanet Game. All rights reserved.</p>
        <p>
          <a href="https://github.com/Pshyam17/exoplanets" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}

// Inline styles
const footerStyle: React.CSSProperties = {
  backgroundColor: '#0b3d91',
  color: 'white',
  padding: '10px 0',
  marginTop: 'auto',
};

const containerStyle: React.CSSProperties = {
  width: '90%',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};
