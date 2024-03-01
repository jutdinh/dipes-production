export const Statistics_API = {
  async post(url, proxy, statisBody) {
    const _token = localStorage.getItem("_token");
    const res = await fetch(`${proxy}${url.url}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: _token,
      },
      body: JSON.stringify(statisBody),
    });
    return res.json();
  }, // i dunno
};
