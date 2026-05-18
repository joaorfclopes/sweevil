import { Link } from 'react-router-dom';

export default function NotFoundScreen(props) {
  return (
    <section className="not-found-screen">
      <div className="row center not-found-screen-container">
        <div className="not-found">
          <img src="/404.avif" alt="Page not found" className="not-found-image" />
          <h1 className="title">Oops, page not found...</h1>
          <Link to="/">
            <button className="secondary">Take Me Home</button>
          </Link>
        </div>
      </div>
    </section>
  );
}
