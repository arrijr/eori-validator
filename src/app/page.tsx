export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 720 }}>
      <h1>EORI Validator Pro</h1>
      <p>Validate EU &amp; GB EORI numbers. Available on RapidAPI.</p>
      <ul>
        <li><code>POST /api/v1/validate</code></li>
        <li><code>POST /api/v1/validate/batch</code></li>
        <li><code>GET /api/health</code></li>
      </ul>
    </main>
  );
}
