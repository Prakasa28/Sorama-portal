type Props = {
  allSelected: boolean;
  selectedCount: number;
  isDownloadMenuOpen: boolean;
  onToggleSelectAll: () => void;
  onToggleDownloadMenu: () => void;
  onDownloadZip: () => void;
  onMergePdf: () => void;
};

export function RecordingSelectionBar({
  allSelected,
  selectedCount,
  isDownloadMenuOpen,
  onToggleSelectAll,
  onToggleDownloadMenu,
  onDownloadZip,
  onMergePdf,
}: Props) {
  return (
    <div className="recording-selection-bar">
      <label>
        <input type="checkbox" checked={allSelected} onChange={onToggleSelectAll} />
        Select all
      </label>

      <div className="recording-download-menu">
        <button type="button" disabled={selectedCount === 0} onClick={onToggleDownloadMenu}>
          Download selected
          {selectedCount > 0 && ` (${selectedCount})`}
        </button>

        {isDownloadMenuOpen && selectedCount > 0 && (
          <div className="recording-download-dropdown">
            <button
              type="button"
              className="recording-download-dropdown__item"
              onClick={onDownloadZip}
            >
              Download as ZIP
            </button>

            <button
              type="button"
              className="recording-download-dropdown__item"
              onClick={onMergePdf}
            >
              Merge reports into PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
