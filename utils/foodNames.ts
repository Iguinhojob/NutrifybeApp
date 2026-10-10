import names from './tacoNomes.json';

const catalog: Record<string, string> = names;
const originalNames = Object.keys(catalog).filter(name => name !== catalog[name]).sort((a, b) => b.length - a.length);
const pattern = new RegExp(originalNames.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');

export function formatFoodName(name: string) {
  return catalog[name.trim()] ?? name;
}

export function formatFoodText(text: string) {
  return text.replace(pattern, name => catalog[name]);
}
