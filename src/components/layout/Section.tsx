import type { PropsWithChildren } from 'react';

export function Section({ id, title, children }: PropsWithChildren<{ id?: string; title?: string }>) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-16">
      {title && <h2 className="text-3xl mb-6">{title}</h2>}
      {children}
    </section>
  );
}
