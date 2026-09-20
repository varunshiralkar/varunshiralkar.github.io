import Link from "next/link";

export default function NotFound() {
  return (
    <div className="site-main--padded">
      <div className="content">
        <h1 className="page-title">Page not found</h1>
        <p className="page-lead">That page does not exist.</p>
        <Link href="/">Back home</Link>
      </div>
    </div>
  );
}
