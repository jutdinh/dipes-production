export const BarcodeActivation_API = {
  /**
   * @field data: {
                "table": number,
                "criteria": number,
                "master": number,
                "from": number,
                "to": number,
                "value": string,
                "select": [{
                    "key":string,
                    "value": string
                }]
            }
   */
  async post(proxy, data) {
    const _token = localStorage.getItem("_token");
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
