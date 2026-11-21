export function filterProjects(projects, query) {
  const q = query.trim();
  if (!q) return projects;
  return projects.filter((p) => p.name.includes(q));
}
