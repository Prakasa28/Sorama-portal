import type { FolderEntry } from "../types/measurements";
import Image from "next/image";

type Props = {
  folder: FolderEntry;
  onClick?: () => void;
};

export function MeasurementCard({ folder, onClick }: Props) {
  return (
    <article className="measurement-card" onClick={onClick}>
        <Image 
          src="/images/icons/more.svg" 
          alt="more options" 
          className="measurement-card__more-icon" 
          width={24} 
          height={24} 
          />
      <p className="measurement-card__title">{folder.name}</p>
      <div className="measurement-card__preview">
        <Image
          src="/images/icons/folder.svg"
          alt="folder"
          className="measurement-card__icon"
          width={44}
          height={44}
        />
      </div>
    </article>
  );
}