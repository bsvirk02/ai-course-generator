function NotFound() {
  return (
    <div className="container mt-5 text-center">
      <h1 className="text-danger">404 - Page Not Found</h1>
      <p className="lead">Sorry, the page you are looking for does not exist.</p>
      <p>
        <a href="/" className="btn btn-danger">
          Go Back to Home
        </a>
      </p>
    </div>
  );
}

export default NotFound;
