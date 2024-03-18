export const BarcodeActivation_API = {
  async post(proxy, _token, data) {
    const response = await fetch(`${proxy}/barcode_activation`, {
      method: "PUT",
      headers: {
        Authorization: _token,
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
