# Vale rule runner skill

Use this workflow to run Vale checks in `clickhouse-docs`, especially for one rule such as `Wordy.yml`.

## Prerequisites

1. Install Vale.
2. Ensure you run commands from the repository root.

## Run only one rule

Use Vale's filter expression and this repo's config:

```bash
vale --config=.vale.ini --filter='.Name == "gitlab_base.Wordy"' docs contribute
```

Notes:
- Rule file: `styles/ClickHouse/Wordy.yml`
- Rule name used by Vale output: `gitlab_base.Wordy`

## Run on a subset of files

```bash
vale --config=.vale.ini --filter='.Name == "gitlab_base.Wordy"' docs/path/to/file.md
```

## Typical fix loop

1. Run the command above.
2. Edit flagged lines to remove/replace wordy phrases.
3. Re-run the same command until no findings remain for the scope you are targeting.

## Common replacements from this rule

- `as well as` → `and`
- `in order to` → `to`
- `note that` → remove phrase
- `a number of` → remove phrase or use a precise quantity
