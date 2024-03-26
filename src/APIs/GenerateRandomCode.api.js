export const GenerateRandomCode = {
  async create(
    {
      foreign_table,
      foreign_value,
      table,
      onField,
      indexField,
      amount,
      pattern,
      onOption,
      prefix,
    },
    proxy,
    _token
  ) {
    const res = await fetch(`${proxy}/apis/generate/randomcode`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `${_token}`,
      },
      body: JSON.stringify({
        foreign_table,
        foreign_value,
        table,
        onField,
        indexField,
        amount,
        pattern,
        onOption,
        prefix,
      }),
    });
    return res.json();
  },
};
