import { useState } from 'react';
import { filterProjects } from './filterProjects.mjs';

export function ProjectList({ projects }: { projects: { name: string }[] }) {
  const [query, setQuery] = useState('');
  const visible = filterProjects(projects, query);
  return (
    <section>
      <input data-testid="project-search" value={query} onChange={(e) => setQuery(e.target.value)} />
      {visible.map((p) => (
        <article data-testid="project-card" key={p.name}>{p.name}</article>
      ))}
    </section>
  );
}
