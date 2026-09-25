"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

const USERNAME = /^(?!-)(?!.*--)[a-z\d-]{1,39}(?<!-)$/i;

export function UsernameField() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const name = value.trim().replace(/^@/, "");
  const valid = USERNAME.test(name);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (valid) router.push(`/${name}`);
  };

  return (
    <form className="username-field" onSubmit={submit} role="search">
      <label className="username-field__label">
        <span className="username-field__prefix">nomo.md/</span>
        <input
          aria-label="GitHub username"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          className="username-field__input"
          name="username"
          onChange={(event) => setValue(event.target.value)}
          placeholder="your-github-username"
          spellCheck={false}
          value={value}
        />
      </label>
      <button aria-label="See the page" className="username-field__go" data-visible={valid} disabled={!valid} type="submit">
        <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14">
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      </button>
    </form>
  );
}
