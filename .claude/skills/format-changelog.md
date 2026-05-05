---
name: format-changelog
description: Format raw ClickHouse changelog entries into user-facing Cloud changelog entries with categorisation
user_invocable: true
---

# Format Cloud Changelog

You are formatting raw ClickHouse changelog entries into polished, user-facing Cloud changelog entries.

## Input

The user will provide either:
- A file reference to a raw changelog file (e.g. `26_2_raw.md`) with a line range
- A section heading to process (e.g. "Backward Incompatible Change", "New Feature", "Performance Improvement", "Improvement")
- The target changelog file to write to (e.g. `26_2.md`)

If not specified, look for the raw file and target file in `docs/cloud/reference/01_changelog/02_release_notes/` or ask the user to provide these
Ask the user to please manually remove any NOT FOR CHANGELOG / INSIGNIFICANT, NO CL ENTRY, CI Fix or improvement or Build/Testing/Packaging Improvement from the raw changelog as they are not to be included.

## Formatting rules

Apply these transformations to each entry:

1. **Make user-facing**: Rewrite in clear, direct language. Lead with what changed, not internal details.
2. **Remove issue close references**: Strip "This closes #NNN", "Closes #NNN", "Resolves #NNN", "Fixes #NNN" phrases (but keep the PR link).
3. **Remove "This PR" / "In this PR" phrasing**: Rewrite to describe the change directly.
4. **Fix grammar**: Ensure consistent tense (past tense preferred: "Added", "Fixed", "Improved"), proper punctuation.
5. **Keep contributor attributions**: Always preserve the `([Name](https://github.com/user))` at the end.
6. **Keep PR links**: Always preserve the `[#NNNNN](https://github.com/ClickHouse/ClickHouse/pull/NNNNN)` link.
7. **Skip purely internal entries**: Omit entries that are only about CI, build infrastructure, test flakiness, or internal refactoring with no user-visible effect.
8. **Skip placeholder entries**: Omit entries that have no proper description, such as `* ... [#NNNNN](...) ([author](...)).` or entries that only contain an issue/PR reference with no explanation of the change. Also omit entries linking to `clickhouse-private` repos as these are not public.

## Categorisation

Group entries into subcategories using `### Heading {#anchor}` format. Use the existing changelog files (e.g. `25_12.md`) as reference for category naming conventions.

Common categories by section:

**Backward Incompatible Changes:**
- Query and syntax changes
- Data type changes
- Storage and index changes
- Removed features
- Settings and configuration changes
- Security and access control changes
- Insert and deduplication changes
- System table changes
- Other breaking changes

**New Features:**
- Authentication
- Functions
- System tables
- Table engines and storage
- Insert and deduplication
- SQL and query features
- Settings and configuration
- ClickHouse Keeper
- Monitoring

**Performance Improvements:**
- JOIN performance
- Query optimization
- Function and aggregation performance
- Storage and I/O performance
- Memory optimization
- Internal optimizations

**Improvements:**
- Query and SQL
- Table engines and storage
- Data lakes
- S3Queue
- S3 and object storage
- Functions
- Settings and configuration
- System tables and monitoring
- ClickHouse Keeper
- Memory management
- Data formats
- Backup and restore
- Named collections and dictionaries
- Deduplication
- Other improvements

**Bug Fixes:**
- JOIN fixes
- Query and analyzer fixes
- MergeTree and storage fixes
- Data type and serialization fixes
- Text index and skip index fixes
- Data lake fixes
- S3/Azure/object storage fixes
- S3Queue fixes
- Security and access control fixes
- Backup and restore fixes
- ClickHouse Keeper fixes
- Crash and stability fixes
- Other bug fixes

Only create subcategories that have entries. Merge small categories (1-2 entries) into related ones or "Other" when appropriate.

## Output format

Write entries into the target changelog file under the appropriate `## Section {#anchor}` heading. Each subcategory uses `### Heading {#anchor}` format.

**Bug fixes use a collapsible details block** because there are typically hundreds of them. Wrap the entire bug fixes section content in:

```html
<details>
<summary>All bug fixes (click to expand)</summary>

### Category {#anchor}
* ...

</details>
```

Example:

```markdown
## Backward Incompatible Changes {#backward-incompatible-changes}

### Query and syntax changes {#query-and-syntax-changes}

* Fixed inconsistent query formatting caused by incorrect alias substitution. [#82838](https://github.com/ClickHouse/ClickHouse/pull/82838) ([Alexey Milovidov](https://github.com/alexey-milovidov)).

### Data type changes {#data-type-changes}

* Added support for `Nullable(Tuple)`. To enable it, set `allow_experimental_nullable_tuple_type = 1`. [#89643](https://github.com/ClickHouse/ClickHouse/pull/89643) ([Nihal Z. Miaji](https://github.com/nihalzp)).
```

## Process

1. Read the raw file and the target file
2. Read a recent completed changelog (e.g. `25_12.md`) for style reference
3. Categorise entries by similarity
4. Rewrite each entry following the formatting rules
5. Insert into the target file under the correct section heading
6. Give the user a list of potential entries which shouldn't be in a Cloud changelog entry. These may include:
- Web UI fixes
- CLI fixes
- Build or packing improvements
- Entries which focus on internal implementation details like C++ code