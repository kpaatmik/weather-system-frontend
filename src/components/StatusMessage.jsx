export function LoadingMessage({ children = 'Loading...' }) { return <div className="state-message"><span className="spinner" />{children}</div> }
export function EmptyMessage({ children }) { return <div className="state-message state-empty">{children}</div> }
export function ErrorMessage({ children, onRetry }) { return <div className="state-message state-error"><strong>{children}</strong>{onRetry && <button className="text-button" onClick={onRetry}>Try again</button>}</div> }
