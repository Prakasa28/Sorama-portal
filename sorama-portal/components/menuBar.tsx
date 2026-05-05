import Image from "next/image";

export function MenuBar() {
  return (
    <nav className="menu-bar">
      <div className="menu-bar__brand">
        {/* Mobile logo */}
        <Image
          src="/images/icons/sorama-logo.svg"
          alt="Sorama"
          width={24}
          height={24}
          className="menu-bar__logo menu-bar__logo--mobile"
        />

        {/* Desktop logo (with text) */}
        <Image
          src="/images/icons/sorama-logo-text.svg"
          alt="Sorama"
          width={120}
          height={24}
          className="menu-bar__logo menu-bar__logo--desktop"
        />
      </div>
    </nav>
  );
}