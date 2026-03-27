"use client";

export function FilterSelect({
  name,
  value,
  options,
  className,
}: {
  name: string;
  value: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={value}
      onChange={(e) => {
        const form = e.target.closest("form");
        if (form) form.requestSubmit();
      }}
      className={
        className ??
        "rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-text-primary focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20 cursor-pointer"
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
