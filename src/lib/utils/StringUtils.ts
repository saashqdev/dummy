const toCamelCase = (value: string) => {
  return value
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/gi, "");
};

export default {
  toCamelCase,
};
