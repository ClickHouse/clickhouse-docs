# Glossary Term Wrapper

A Python script that automatically finds and wraps glossary terms in MDX files with the `^^term^^` syntax for use with a glossary tooltip component.

## Usage

### Basic Usage

```bash
python3 wrap_glossary_terms.py
```

### Options

```bash
python3 wrap_glossary_terms.py [OPTIONS]

Options:
  --docs-dir PATH     Documentation directory (default: ./docs)
  --glossary PATH     Glossary JSON file (default: ./src/components/GlossaryTooltip/glossary.json)
  --dry-run          Show changes without writing files
  --force            Process files even if they already have glossary syntax
```

### Examples

```bash
# Dry run to see what would change
python3 wrap-glossary-terms.py --dry-run

# Process all files, even those with existing glossary terms
python3 wrap-glossary-terms.py --force

# Use custom paths
python3 wrap-glossary-terms.py --docs-dir ./my-docs --glossary ./my-glossary.json

# Force process with dry run
python3 wrap-glossary-terms.py --force --dry-run
```

## Glossary JSON Format

The script expects a JSON file with term definitions:

```json
{
  "Cluster": "A collection of nodes (servers) that work together to store and process data.",
  "Replica": "A copy of the data stored in a ClickHouse database.",
  "Shard": "A subset of data. ClickHouse always has at least one shard for your data."
}
```

## Protected Areas

The script will **NOT** wrap glossary terms in these areas:

- **Frontmatter** (`---...---`)
- **Code blocks** (````...````)
- **Inline code** (`` `...` ``)
- **Markdown links** (`[text](url)`)
- **Markdown tables** (`| column | column |`)
- **JSX components** (`<Component>...</Component>`)

## File Filtering

The script automatically skips files in these directories:
- `_snippets`, `snippets`
- `examples`, `example-data`, `sample-data` 
- `changelog`, `changelogs`, `release-notes`, `releases`
- `_partials`, `partials`, `_includes`, `includes`

## Output Examples

```
🚀 Starting Glossary Term Wrapper...

📚 Loaded 7 glossary terms
📁 Found 22 MDX files, processing 15 files
⏭️  Skipped 7 files based on skip patterns

✅ Modified managing-data/core-concepts/academic_overview.mdx (52 terms)
✅ Modified best-practices/partitioning_keys.mdx (11 terms)
➖ No changes needed for about-us/intro.mdx
⏭️  Skipped getting-started/quick-start/oss.mdx (already has glossary syntax)

📊 Summary:
   Files processed: 15
   Files modified: 4
   Files skipped: 3
   Terms wrapped: 111
```

## How It Works

1. **Loads glossary terms** from JSON file and sorts by length (longest first)
2. **Finds MDX files** recursively in the specified directory
3. **Filters out** files matching skip patterns
4. **For each file**:
   - Identifies protected areas (code, links, JSX, etc.)
   - Searches for glossary terms using word boundaries
   - Wraps unprotected terms with `^^term^^` syntax
   - Avoids double-wrapping existing terms

## Integration with Docusaurus

This script is designed to work with a Docusaurus site that has:
- A glossary tooltip component that processes `^^term^^` syntax
- MDX support enabled
- A remark plugin that transforms `^^term^^` to `<GlossaryTooltip term="..." />`

## Troubleshooting

### "No changes needed" for files that should have terms
- Check if terms are in protected areas (code blocks, links, etc.)
- Verify the terms exist in your `glossary.json` file
- Use `--force` if the file already has some glossary syntax

### Terms wrapped in wrong places
- The script protects common areas, but you may need to manually fix edge cases
- Consider updating the protected areas logic if needed

### Script skips too many files
- Check the skip patterns in `should_skip_file()` function
- Adjust patterns if your documentation structure is different

## Contributing

To modify the script:
- **Add new protected areas**: Update `extract_protected_ranges()` function
- **Change skip patterns**: Modify `should_skip_file()` function  
- **Adjust term matching**: Update the regex in `wrap_terms_in_content()`