export const ForeignData_API = {
  async get(proxy, _token, data) {
    const response = await fetch(`${proxy}/api/foreign/data`, {
      method: "POST",
      headers: {
        Authorization: _token,
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
