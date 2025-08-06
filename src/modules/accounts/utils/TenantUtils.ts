function prefix(item: { name: string }) {
  const words = item.name.split(" ");
  if (words.length > 1) {
    return (words[0].substring(0, 1) + words[1].substring(0, 1)).toUpperCase();
  }
  if (item.name.length > 1) {
    return item.name.substring(0, 2).toUpperCase();
  }
  return item.name.substring(0, 1).toUpperCase();
}

export default {
  prefix,
};
