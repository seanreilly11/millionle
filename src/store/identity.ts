const UUID_KEY = "millionle.uuid";
const NAME_KEY = "millionle.name";

export function getUuid(): string {
  let id = localStorage.getItem(UUID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(UUID_KEY, id);
  }
  return id;
}

export function getName(): string {
  return localStorage.getItem(NAME_KEY) ?? "";
}

export function setName(name: string): void {
  localStorage.setItem(NAME_KEY, name);
}
