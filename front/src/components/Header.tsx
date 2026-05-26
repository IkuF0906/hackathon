import { Link } from "react-router";
import "./Header.css";

export type HeaderAction = {
  text: string;
  to: string;
  variant?: "normal" | "primary";
};

type HeaderProps = {
  title?: string;
  actions?: HeaderAction[];
};

function Header({ title = "朝とも（Asa-Tomo）", actions = [] }: HeaderProps) {
  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <div className="brand-mark"></div>
        <span>{title}</span>
      </Link>

      {actions.length > 0 && (
        <div className="header-actions">
          {actions.map((action) => (
            <Link
              key={`${action.text}-${action.to}`}
              className={`header-link ${
                action.variant === "primary" ? "header-link-primary" : ""
              }`}
              to={action.to}
            >
              {action.text}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

export default Header;