export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ")
}

export function getMonsterUrl(monsterName: string): string {
  const kebabCased = monsterName.toLowerCase().replace(/\s+/g, "-")
  return `https://www.aidedd.org/dnd/monstres.php?vo=${kebabCased}`
}
