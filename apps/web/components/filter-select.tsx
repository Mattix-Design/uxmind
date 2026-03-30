"use client";

export function FilterSelect({
  name,
  value,
  options,
  className,
  ariaLabel,
}: {
  name: string;
  value: string;
  options: { value: string; label: string }[];
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={value}
      aria-label={ariaLabel ?? name}
      onChange={(e) => {
        const form = e.target.closest("form");
        if (form) form.requestSubmit();
      }}
      className={
        className ??
        "rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-text-primary focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20 cursor-pointer max-w-[180px]"
      }
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
