export function ProjectList({ projects, onCreate }: { projects: { name: string }[]; onCreate: () => void }) {
  return (
    <section>
      <button data-testid="btn-create-project" onClick={onCreate}>Criar</button>
      {projects.map((p) => (
        <article data-testid="project-card" key={p.name}>{p.name}</article>
      ))}
    </section>
  );
}
