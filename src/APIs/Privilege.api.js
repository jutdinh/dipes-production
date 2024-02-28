export const Privilege_API = {
  async getAllPrivilegeGroup(proxy, _token) {
    const res = await fetch(`${proxy}/privileges/groups`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: `${_token}`,
      },
    });
    return res.json();
  },
  updatePrivilegeGroupByUsername(
    { username, privilegegroup_id },
    proxy,
    _token
  ) {
    return fetch(`${proxy}/privileges/modify`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        Authorization: `${_token}`,
      },
      body: JSON.stringify({
        privilege: { username, privilegegroup_id: Number(privilegegroup_id) },
      }),
    });
  },
};
