export default function Footer({ profile }) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p className="mono">© {year} {profile.name} · crafted with React + Node.js</p>
        <div className="footer-links">
          <a href="#home">Back to top ↑</a>
          <a href="#/admin" className="admin-link">
            Admin
          </a>
        </div>
      </div>
    </footer>
  );
}
