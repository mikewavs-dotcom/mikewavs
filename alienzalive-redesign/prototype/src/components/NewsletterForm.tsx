"use client";

import { useState, type FormEvent } from "react";

/*
 * Community signup. Field set reproduces the live forms:
 * Elementor popup form (home): Name, Email, Phone Number, Birthday.
 * Prototype posts nowhere — the CMS/ESP endpoint is a migration decision
 * (see MIGRATION_NOTES.md). Validation is client-side and accessible.
 */
export default function NewsletterForm({
  heading,
  fields,
  submitLabel,
}: {
  heading: string;
  fields: { name: string; type: string }[];
  submitLabel: string;
}) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      setError("Please fill in the required fields.");
      form.reportValidity();
      return;
    }
    setError(null);
    setDone(true);
  }

  if (done) {
    return (
      <p className="display text-2xl text-accent" role="status">
        You&apos;re in. Welcome to the community.
      </p>
    );
  }

  const typeMap: Record<string, string> = {
    text: "text",
    email: "email",
    number: "tel",
    tel: "tel",
    date: "date",
  };

  return (
    <form onSubmit={onSubmit} noValidate aria-label={heading}>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((f) => {
          const id = `nl-${f.name.replace(/\s+/g, "-").toLowerCase()}`;
          const required = f.type === "email" || f.type === "text";
          return (
            <div key={f.name} className="flex flex-col gap-1">
              <label htmlFor={id} className="meta text-ink-dim">
                {f.name}
                {required && (
                  <span className="text-accent" aria-hidden="true">
                    {" "}
                    *
                  </span>
                )}
              </label>
              <input
                id={id}
                name={id}
                type={typeMap[f.type] ?? "text"}
                required={required}
                autoComplete={
                  f.type === "email"
                    ? "email"
                    : f.type === "date"
                      ? "bday"
                      : f.name.toLowerCase().includes("phone")
                        ? "tel"
                        : "name"
                }
                className="border border-line bg-bg-raised px-4 py-3 text-ink placeholder:text-ink-faint focus:border-accent"
                style={f.type === "date" ? { colorScheme: "dark" } : undefined}
              />
            </div>
          );
        })}
      </div>
      {error && (
        <p className="mt-3 text-sm" style={{ color: "var(--color-danger)" }} role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="display mt-6 bg-accent px-10 py-4 text-lg text-accent-ink transition-transform duration-150 hover:scale-[1.02]"
      >
        {submitLabel}
      </button>
    </form>
  );
}
