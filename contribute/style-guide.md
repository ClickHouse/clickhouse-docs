# ClickHouse docs style guide

In this document, you will find a number of style guidelines for writing ClickHouse
documentation. As documentation is a collective effort, these guidelines are 
intended to help all of us ensure we maintain quality and consistency across our
documentation.

## YAML front matter

Begin every new Markdown document with YAML front-matter:

```markdown
---
title: 'Using a clickhouse-local database'
sidebar_label: 'Using clickhouse-local database'
slug: /chdb/guides/clickhouse-local
description: 'Learn how to use a clickhouse-local database with chDB'
keywords: ['chdb', 'clickhouse-local']
---
```

### Associated markdown rule or CI check

#### front-matter validation 

There is a custom Docusaurus plugin which runs on build that makes the following
checks on front-matter:

- title, description and slug are specified.
- keywords use flow style arrays with single quoted items e.g. 
  `keywords: ['integrations']`
- single quotes are used for title, description, slug, sidebar_label
- there is an empty line after the YAML frontmatter block

For implementation details see [plugins/frontmatter-validation](https://github.com/ClickHouse/clickhouse-docs/tree/main/plugins/frontmatter-validation)

## Explicit header tags

Due to the way our translation system works, it is necessary to add an explicit
anchor tag next to every header, such as `{#explicit-anchor-tag}`.

For example:

```markdown
## My header {#my-header}
```

### Associated markdown rule or CI check
- [`custom-anchor-headings`](/scripts/.markdownlint-cli2.yaml)

## Images

In all cases images get added to the `static/images` directory of the repository.
Under the images directory you should place the images according to the folder
structure of the docs.

For example, if you wanted to add images to `clickhouse-local.md` which is 
located at `/docs/chdb/guides/clickhouse-local.md`. You should add the 
images at `/static/images/chdb/guides/`.

Try to use descriptive names in lower case. For example:
- `clickhouse-local-1.png`
- `clickhouse-local-2.png`
- `clickhouse-local-3.png` etc.

In the markdown document import the images under the YAML frontmatter:

```markdown
---
title: Using a clickhouse-local database
sidebar_label: Using clickhouse-local database
slug: /chdb/guides/clickhouse-local
description: Learn how to use a clickhouse-local database with chDB
keywords: [chdb, clickhouse-local]
---

import clickhouse-local-1 from '@site/static/images/chdb/guides/clickhouse-local-1.png'
import clickhouse-local-2 from '@site/static/images/chdb/guides/clickhouse-local-2.png'
import clickhouse-local-3 from '@site/static/images/chdb/guides/clickhouse-local-3.png'
import Image from '@theme/IdealImage';
```

To render images we use a fork of the IdealImage plugin. This generates multiple variants of an image, [asynchronously loading them as well as selecting the most appropriate based on the network connection](https://github.com/stereobooster/react-ideal-image/blob/master/introduction.md).

Ensure you import the `Image` component as shown above.

Use the `<Image/>` tag to place your image in the appropriate place:

```markdown
Here is some example text which refers to the image below:

<Image img={clickhouse-local-1} alt='DESCRIPTION OF THE IMAGE' size="md" border background="black"/>

Here is another paragraph...
```

This component takes a number of props:

1. `img` - the imported image
2. `alt` - mandatory alternate text specified
3. `size` - either `lg` (width 1024px), `md` (width 600px), `sm` (width 300px) or `logo` (48x). This sets the maximum image size. Lower resolutions maybe used on smaller screens or slower connections.
4. `border` - Applies a border. **Use for screenshots only.**
5. `background` - either `white` or `black`. Applicable if your image is transparent. All new images must use `black`.

## Codeblocks

Codeblocks are defined using backticks. For example:

```text
\```sql title='Query'
SELECT * FROM system.contributors;
\```
```

Note: in the snippet above `\` is used only for formatting purposes in this guide.
You should not include it when you write markdown.

Code blocks:
- Should always have a language defined immediately next to the opening 3
  backticks, without any space.
- Have a title (optional) such as 'Query' or 'Response'
- Use language `response` if it is for the result of a query.

#### Importing code from files or URLs

There are a few additional parameters you can include on a code block if you want
to import code.

To import from a file use `file=`:

```text
\```python file=code_snippets/integrations/example.py
Code will be inserted here
\```
```

When `yarn build` is run, the code from the file will be inserted as text into
the code block.

To import from a url use `url=`:

```text
\```python url=https://raw.githubusercontent.com/ClickHouse/clickhouse-connect/refs/heads/main/examples/pandas_examples.py
Code will be inserted here
\```
```

You should commit the code inserted to the snippet as we want people (or LLMs) 
reading the markdown to be able to see the code. The advantage of importing code
to snippets this way is that you can test your snippets externally or store them
wherever you want.

If you want to only import a section from a file, surround the section with `docs-start`
and `docs-end` comments, for example:

```python
a = 200
b = 33
#docs-start
if b > a:
  print("b is greater than a")
elif a == b:
  print("a and b are equal")
else:
  print("a is greater than b")
#docs-end
```

Only the code between those comments will be pulled.

If you want to make multiple code snippets from one file then you can use the `snippet` parameter:

```markdown

\```python url=https://raw.githubusercontent.com/ClickHouse/clickhouse-connect/refs/heads/main/examples/pandas_examples.py snippet=1
Code will be inserted here
\```
```

You will then use `docs-start-1`, `docs-end-1` comments for the first snippet, `docs-start-2`, `docs-end-2` for the second snippet and so on.

### Highlighting

You can highlight lines in a code block using the following keywords:

- `highlight-next-line` 
- `highlight-start`
- `highlight-end`

These keywords should be added as comments in the codeblock with the appropriate
escape symbol for the codeblock language. 

For example, if the codeblock is SQL:

```text
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM mv_hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

If the codeblock is a response: 

```text
10 rows in set. Elapsed: 0.026 sec.
# highlight-next-line
Processed 335.87 thousand rows,
13.54 MB (12.91 million rows/s., 520.38 MB/s.)
```

### Associated markdown rule or CI check

- [`MD040` enforces that codeblocks have a language specified](/scripts/.markdownlint-cli2.yaml)

## Broken links

Making a change to a page slug or moving a file can result in broken links in
numerous places across the docs. To mitigate this we use the built in link checker
provided by Docusaurus. If broken links are found then docs check will fail with
an error message something like this:

```text
Exhaustive list of all broken links found:

- Broken link on source page path = /docs/observability/integrating-opentelemetry:
   -> linking to /docs/observability/schema-design#using-maps
- Broken link on source page path = /docs/operations/server-configuration-parameters/settings:
   -> linking to ../../../engines/table-engines/mergetree-family/mergetree#mergetree-table-ttl (resolved as: /engines/table-engines/mergetree-family/mergetree#mergetree-table-ttl)
- Broken link on source page path = /docs/partitions:
   -> linking to /docs/optimize/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing
```

To fix the links, find the source page, given after `source page path =` and search within it for the
link given after `linking to`. As slugs are resolved relative to `/docs` you can exclude this from your
search. E.g don't search `/docs/observability/schema-design#using-maps` but `/observability/schema-design#using-maps`

**note** if you can't find the link on the page but you're sure that you are looking in the file 
reported by the failing broken link checker, the link is most likely found in a snippet which is
imported by that page. Find the snippet location from the import statement at the top of the page.

## Broken anchors

Docusaurus also has a built-in broken anchor checker. Unfortunately it sometimes
can give false positives.

### linking to spans

Sometimes you want to link to something other than a header. It is logical to 
use a span for this purpose. For instance if you want to link to an image.

```
<span id="page-2-0"></span><img src={image_02}/>

As shown by [Figure 2,](#page-2-0)...
```

Unfortunately, docusaurus' anchor checker will throw an error on this link:

```response
- Broken anchor on source page path = /docs/academic_overview:
   -> linking to #page-1-0 (resolved as: /docs/academic_overview#page-1-0)
```

Follow the steps below for the workaround:

- change the file from `.md` to `.mdx`
- import `useBrokenLinks` hook with `import useBrokenLinks from "@docusaurus/useBrokenLinks";`
- add the following component to the page:

```
export function Anchor(props) {
    useBrokenLinks().collectAnchor(props.id);
    return <span style={{scrollMarginTop: "var(--ifm-navbar-height)"}} {...props}/>;
}
```
- Replace `<span id="some-id"></span>` with `Anchor id="some-id"/>`

### Floating pages

In order to prevent pages from becoming 'floating' or 'orphaned' it is
necessary that you add a newly created page to `sidebars.js`. We have a [custom
docusaurus plugin](plugins/checkFloatingPages.js) to catch dangling pages.

If there is some specific reason that you need to bypass this check, you can
add an exception to `floating-pages-exceptions.txt` in the plugins directory.

When adding a new page from the ClickHouse/ClickHouse repo this check will fail
unless the file is in a folder which [`sidebars.js`](https://github.com/ClickHouse/clickhouse-docs/blob/main/sidebars.js)
uses with `type: autogenerated` to generate the navigation items from the markdown
files in the folder.

If you've added a new page on ClickHouse/ClickHouse and this check is failing.

For example:

```text
âœ… All markdown files passed frontmatter validation.
Loaded 3 exceptions from /opt/clickhouse-docs/plugins/floating-pages-exceptions.txt
Skipping excepted page: index
Skipping excepted page: integrations/language-clients/java/client-v1
Skipping excepted page: integrations/language-clients/java/jdbc-v1
�[31m1 floating pages found:�[0m
  - /opt/clickhouse-docs/docs/operations/query-condition-cache.md
```

You will need to open a PR on docs repo to add this page to [`floating-pages-exceptions.txt`](https://github.com/ClickHouse/clickhouse-docs/blob/main/plugins/floating-pages-exceptions.txt). Once it is merged
you can then rerun the docs check on the ClickHouse/ClickHouse repo which 
should pass. Finally open another PR on the docs repo again to remove the 
file from the exception list and add it to `sidebars.js` in the appropriate
sidebar.

## Client versioning

### Background

Docusaurus supports versioning documentation, however it is opinionated and 
aimed more at use cases where you have a single product with set releases, or
multiple products with their own releases.

Due to the fact that we have many different integrations in ClickHouse, each of 
which may need versioned documentation, we use the following custom 
`ClientVersionDropdown` component for versioning of client documentation:

```markdown
<ClientVersionDropdown versions={}/>
```

### How to use it 

Versioned folders are structured as follows:

```text
.
├── client
│         ├── _snippets
│         │         ├── _v0_7.mdx
│         │         └── _v0_8.mdx
│         └── client.mdx
├── index.md
├── jdbc
│         ├── _snippets
│         │         ├── _v0_7.mdx
│         │         └── _v0_8.mdx
│         └── jdbc.mdx
└── r2dbc.md
```

* The content for each version is placed in a snippet. For example `_v0_7.mdx`
  * Snippets begin with `_` 
  * Snippets do not contain front-matter
  * These snippets import any components they may need (See `_v0_7.mdx` for example)
  * They should be .mdx files
* There is a single page for all versions. For example `client.mdx`
  * This page contains frontmatter
  * It imports the `<ClientVersionDropdown>` component
  * It should be a .mdx file

To use this component, import it into the single page:

```js
import ClientVersionDropdown from '@theme/ClientVersionDropdown/ClientVersionDropdown'
```

Also import the two snippets:

```js
import v07 from './_v0_7.mdx'
import v08 from './_v0_8.mdx'
```

Pass it an array of objects representing versions and their respective snippets:

```markdown
<ClientVersionDropdown versions={[
{
'version': 'v0.8+',
'snippet': v08
},
{
'version': 'v0.7.x',
'snippet': v07
}
]}/>
```

**Note**: The component will display the first item as the 'selected' version, so
it is important to make sure the order of the objects is correct.

### URL parameters

If you need to share a link to the page you can do it through URL params:

```response
/docs/integrations/language-clients/java/client?v=v08
```

When using URL parameters to control which version of documentation is displayed, 
there are conventions to follow for reliable functionality. 
Here's how the `?v=v08` parameter relates to the snippet selection:

#### How it works

The URL parameter acts as a selector that matches against the `version` property 
in your component configuration. For example:

- URL: `docs/api?v=v08`
- Matches: `version: 'v0.8+'` in your dropdown configuration

#### Conventions That Work

- **Simple Version Strings**: Parameters like `?v=v08`, `?v=v07` work by 
- matching against stripped versions of your configured version names.

- **Flexible Matching**: The implementation supports:
  - Removing dots: `v0.8` matches `?v=v08`
  - Ignoring plus signs: `v0.8+` matches `?v=v08`
  - Case-insensitive matching: `v0.8` matches `?v=V08`

- **Preserving Other Parameters**: Other URL parameters are preserved when 
switching versions.

#### What Won't Work

- **Partial Matches**: `?v=8` won't match `v0.8` with the default implementation.

- **Complex Version Strings**: Very complex versions like `?v=v1.2.3-beta.4` 
require more sophisticated matching logic. (Reach out to the docs team if required)

- **Non-Standard Formats**: Version formats not accounted for in the matching 
logic might fail.

#### Best Practices

1. Keep version strings in consistent formats for predictable results.

2. Use simplified version parameters in URLs (e.g., `v08` instead of `v0.8.x`).

## Related blog component

Pages can show a "Related blogs" component which displays recent blogs which are
related to the keywords or title of the document.

If you would like to show it on a page, add the following property to the 
front matter:

```yaml
---
show_related_blogs: true
---
```

This will show it on the page, assuming there is a matching blog. If there is no
match then it remains hidden.

## Vale

Vale is a command-line tool that brings code-like linting to prose.
We have a number of rules set up to ensure that our documentation is
consistent in style.

The style rules are located at `/styles/ClickHouse`, and largely based
off of the Google styleset, with some ClickHouse specific adaptions.
If you want to check only a specific rule locally, you
can run:

```bash
vale --filter='.Name == "ClickHouse.Headings"' docs/integrations
```

This will run only the rule named `Headings` on
the `docs/integrations` directory. Specifying a specific markdown
file is also possible.

## Vertical numbered stepper

It is possible to render numbered steppers, as seen [here](https://clickhouse.com/docs/getting-started/quick-start/cloud)
for example, using the following syntax:

`<VerticalStepper headerLevel="hN"></VerticalStepper>`

For example:

```markdown
<VerticalStepper headerLevel="h2">
## Header 1 {#explicit-anchor-1}

Some content...

## Header 2 {#explicit-anchor-2}

Some more content...

</VerticalStepper>
```

You should specify `N` as the header level you want the vertical stepper to render
for. In the example above, it is `h2` as we are using `##`. Use `h3` for `###`,
`h4` for `####` etc.

The component also works with numbered lists using `headerLevel="list"`. For example:

```markdown
<VerticalStepper headerLevel="h2">

1. First list item

Some content...

2. Second list item

Some more content...

</VerticalStepper>
```

In this case, the first paragraph will be taken to be the label (the text next
to the numbered circles of the vertical stepper) of the stepper.
