import logoImg from "../assets/logo.svg";

interface SidebarBrandProps {
  label: string;
  onActivate: () => void;
}

export default function SidebarBrand({ label, onActivate }: SidebarBrandProps) {
  return (
    <div
      className="logo-container"
      onClick={onActivate}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onActivate();
      }}
      role="button"
      tabIndex={0}
      style={{
        color: "#fff",
        textAlign: "center",
        padding: "24px 0",
        fontSize: 22,
        fontWeight: 700,
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        letterSpacing: '1px'
      }}
    >
      <img src={logoImg} alt="Logo" style={{ width: 28, height: 28, marginRight: 10, backgroundColor: 'white', borderRadius: '6px', padding: '3px' }} />
      {label}
    </div>
  );
}
