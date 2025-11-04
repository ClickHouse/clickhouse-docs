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

## headings_have_custom_anchors

This custom rule is used to check that every heading has a custom anchor tag.
This is necessary for our LLM translation system to ensure that linking works.

Examples of valid headings:

```markdown
## An H2 heading {#an-h2-heading}

### An H3 heading {#an-h3-heading}
```

Examples of invalid headings:

```markdown
## An H2 heading

### An H3 heading
```

## no_markdown_image_tags

Our documentation uses an opinionated guideline on images. We disallow pure
markdown image declarations using the `![]()` syntax and prefer to use a
specific image component instead. This rule checks that markdown images are not
used.

Example of a valid usage:

```markdown
import image from '@site/static/images/image.png'

<img src={image} alt="Description"/>
```

Example of an invalid usage:

```markdown
![An image](/path/to/an/image.png)
```
