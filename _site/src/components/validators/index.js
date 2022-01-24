const isEmail = () => {
  const re = /\S+@\S+\.\S+/;
  return input => re.test(input)
    ? null
    : "Must be a valid email address";
}

const minLength = min => {
  return input => input.length < min
    ? `Value must be at least ${min} characters`
    : null;
};

export {
  isEmail,
  minLength
}
