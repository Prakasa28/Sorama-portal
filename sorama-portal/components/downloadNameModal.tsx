type Props = {
  mode: "zip" | "mergedPdf";
  value: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onDownload: () => void;
};

export function DownloadNameModal({ mode, value, onChange, onCancel, onDownload }: Props) {
  return (
    <div className="zip-modal">
      <div className="zip-modal__panel">
        <h2>{mode === "zip" ? "Name your ZIP file" : "Name your merged PDF"}</h2>

        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter file name"
        />

        <div className="zip-modal__actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" onClick={onDownload}>
            {mode === "zip" ? "Download ZIP" : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
