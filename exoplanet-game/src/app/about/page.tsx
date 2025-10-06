// app/about/page.tsx

export default function AboutPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>

      <h1 className="text-3xl font-bold">About Exoplanet Game</h1>
      <br />
      <p>
        Welcome to the Exoplanet Game! This interactive platform lets you explore
        and classify exoplanets based on their properties. You can observe
        orbital patterns, analyze planetary data, and test your knowledge of
        planetary science.
      </p>
      <br />
      <h2 className="text-2xl font-bold">About the Developers</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><a href="https://github.com/Pshyam17" target="_blank" rel="noopener noreferrer">https://github.com/Pshyam17</a></li>
        <li><a href="https://github.com/persinammon4" target="_blank" rel="noopener noreferrer">https://github.com/persinammon4</a></li>
        <li><a href="https://github.com/BrutalCaeser" target="_blank" rel="noopener noreferrer">https://github.com/BrutalCaeser</a></li>
      </ul>

    </div>
  );
}
