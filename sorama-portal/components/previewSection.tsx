type PreviewRow = [string, string | number];

type Props = {
  title: string;
  rows: PreviewRow[];
};

export function PreviewSection({ title, rows }: Props) {
  return (
    <section className="preview-section">
      <h2>{title}</h2>

      {rows.map(([label, value]) => (
        <div className="preview-section__row" key={label}>
          <strong>{label}</strong>
          <span>{value}</span>
        </div>
      ))}
    </section>
  );
}
