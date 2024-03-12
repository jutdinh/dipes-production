export const IsNumber = (input, negative = false) => {
  const positive_regex = /^\d+$/;
  const negative_regex = /^-?\d*\.?\d+$/;

  if (negative) {
    return negative_regex.test(input);
  }
  return positive_regex.test(input);
};
