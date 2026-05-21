import { Search } from "lucide-react";

type Props = {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, placeholder = "Search...", onChange }: Props) {
  return (
    <div className="search-bar">
      <Search className="search-bar__icon" />

      <input
        className="search-bar__input"
        name="search-bar"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
