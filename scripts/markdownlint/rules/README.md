# Custom Rules

Add custom rules to this directory and call them in `scripts/.markdownlint-cli2.yaml` here:

```yaml
customRules:
 # add custom rules here
```

## links_url_type

This custom rule is used to check that we have consistent types of linking.
We want to use URL type links (by slug) as relative links don't work with
translations.

Examples of valid links: 

```markdown
[valid link](/docs/interfaces/formats)
```

Examples of invalid links:

```markdown
[invalid link](../../docs/interfaces/formats.md)
```

```markdown
[invalid link](../../docs/interfaces)
```