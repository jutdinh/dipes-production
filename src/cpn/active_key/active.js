import React, { useState } from 'react';

function ActivationForm() {
  const [key, setKey] = useState("");

  const handleSubmit = event => {
    event.preventDefault();
    console.log("Submitted key: ", key);
    // Here you can call the function to activate the website with the key.
  };

  return (
    <div className="container">
      <h2>Website Activation</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="activationKey">Activation Key:</label>
          <input
            type="text"
            className="form-control"
            id="activationKey"
            placeholder="Enter Activation Key"
            value={key}
            onChange={e => setKey(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
}

export default ActivationForm;
