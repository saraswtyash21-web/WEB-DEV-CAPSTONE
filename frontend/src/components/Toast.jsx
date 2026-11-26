export function ErrorMessage({ children }) { return children ? <div className="alert alert-error" role="alert">{children}</div> : null; }
export function Notice({ children }) { return children ? <div className="alert alert-success" role="status">{children}</div> : null; }
export function Loading({ label = 'Loading…' }) { return <div className="empty-state">{label}</div>; }
