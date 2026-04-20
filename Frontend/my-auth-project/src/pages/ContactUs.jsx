function ContactUs() {
  return (
    <div className="container mt-4">
      <h1 className="text-center text-danger">Contact Us</h1>
      <p className="lead text-center">
        You can reach us by filling out the form below or via our email address: contact@group34.com.
      </p>
      <form>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input type="text" className="form-control" id="name" placeholder="Enter your full name" />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input type="email" className="form-control" id="email" placeholder="Enter your email" />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea className="form-control" id="message" rows="4" placeholder="Enter your message"></textarea>
        </div>
        <button type="submit" className="btn btn-danger mt-3">Send Message</button>
      </form>
    </div>
  );
}

export default ContactUs;
