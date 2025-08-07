export function updateItemByIdx(items: any[], setItems: any, index: number, itemAttributes: any) {
  if (index !== -1) {
    setItems([...items.slice(0, index), Object.assign({}, items[index], itemAttributes), ...items.slice(index + 1)]);
  }
}
