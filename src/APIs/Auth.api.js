export const Auth_API = {
  /**
   *  @description This function return true if the token expired else return false
   *
   */
  async isTokenExpired(proxy, _token) {
    const res = await fetch(`${proxy}/auth/token/check`, {
      headers: {
        Authorization: _token,
      },
    });
    const data = await res.json();

    if (!data.success) {
      localStorage.removeItem("_token");
      return true;
    }

    return false;
  },
};
