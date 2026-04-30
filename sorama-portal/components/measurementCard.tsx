import type { FolderEntry } from "../types/measurements";

type Props = {
  folder: FolderEntry;
};

export function MeasurementCard({ folder }: Props) {
  return (
    <article className="measurement-card">
      <p className="measurement-card__title">{folder.name}</p>

      <div className="measurement-card__preview">
        <div className="measurement-card__folder-icon">
          <div className="measurement-card__folder-tab" />
        </div>
      </div>
    </article>
  );
}