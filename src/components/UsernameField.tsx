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
      <button className="username-field__go markdown-link markdown-link--arrow" disabled={!valid} type="submit">
        <span className="markdown-link__label">See yours</span>
        <svg aria-hidden="true" className="markdown-link__icon" fill="none" height="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="12">
          <path d="M7 7h10v10" />
          <path d="M7 17 17 7" />
        </svg>
      </button>
    </form>
  );
}
