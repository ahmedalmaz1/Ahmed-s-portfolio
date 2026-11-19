"use client";
import { useEffect, useId } from "react";

const cx = (...c) => c.filter(Boolean).join(" ");

export function Button({
  variant = "primary",
  loading,
  className,
  children,
  disabled,
  ...rest
}) {
  const styles = {
    primary: "bg-brand text-bg hover:bg-white",
    ghost: "border border-line text-ink hover:bg-panel2",
    danger:
      "bg-danger/15 text-danger border border-danger/40 hover:bg-danger/25",
  };
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cx(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant],
        className,
      )}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function Spinner({ className }) {
  return (
    <span
      aria-hidden
      className={cx(
        "inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}

/** Label + control + validation message shown right under the field. */
export function Field({ label, hint, error, children, className }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? `${id}-err` : undefined,
      })}
      {hint && !error && <p className="mt-1.5 text-xs text-mute">{hint}</p>}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

const control =
  "w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base text-ink md:text-sm placeholder:text-mute/60 focus:border-[#7aa7ff] focus:outline-none aria-[invalid=true]:border-danger";

export const Input = (props) => <input className={control} {...props} />;
export const Textarea = (props) => (
  <textarea rows={5} className={cx(control, "resize-y")} {...props} />
);
export const Select = (props) => <select className={control} {...props} />;

export function Alert({ kind = "error", children }) {
  if (!children) return null;
  const tone = {
    error: "border-danger/40 bg-danger/10 text-danger",
    success: "border-ok/40 bg-ok/10 text-ok",
    info: "border-line bg-panel2 text-ink",
  }[kind];
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={cx("rounded-lg border px-4 py-3 text-sm", tone)}
    >
      {children}
    </div>
  );
}

export function Card({ title, description, children, className }) {
  return (
    <section
      className={cx(
        "rounded-2xl border border-line bg-panel p-5 sm:p-6",
        className,
      )}
    >
      {title && <h2 className="text-base font-semibold">{title}</h2>}
      {description && <p className="mt-1 text-sm text-mute">{description}</p>}
      <div className={title ? "mt-5" : ""}>{children}</div>
    </section>
  );
}

export function ProgressBar({ value }) {
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-panel2"
      role="progressbar"
      aria-valuenow={Math.round(value * 100)}
    >
      <div
        className="h-full bg-brand transition-[width]"
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 break-words">
        <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-mute">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  loading,
  onConfirm,
  onCancel,
}) {
  // Escape closes the dialog (unless a request is running)
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !loading && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="max-h-full w-full max-w-sm overflow-y-auto break-words rounded-2xl border border-line bg-panel p-5 sm:p-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-mute">{message}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            autoFocus
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            className="w-full sm:w-auto"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
