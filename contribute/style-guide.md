# ClickHouse docs style guide

In this document, you will find a number of style guidelines for writing documentation.
The rules in this guide are intended to assist in helping us to create a high
quality documentation offering on par with the quality of ClickHouse itself.

## YAML front matter

Begin every new markdown document with YAML front-matter:

```markdown
---
title: Using a clickhouse-local database
sidebar_label: Using clickhouse-local database
slug: /chdb/guides/clickhouse-local
description: Learn how to use a clickhouse-local database with chDB
keywords: [chdb, clickhouse-local]
---
```

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
```

Use the `<img/>` tag to place your image in the appropriate place:

```markdown
Here is some example text which refers to the image below:

<img src={clickhouse-local-1}
    alt='DESCRIPTION OF THE IMAGE'
    style={{width: '800px'}} // optional
/>

Here is another paragraph...
```

## Codeblocks

Codeblocks are defined using backticks. For example:

```text
\```sql title='Query'
SELECT * FROM system.contributors;
\```
```

Code blocks:
- Should always have a language defined immediately next to the opening 3
  backticks, without any space.
- Have a title (optional) such as 'Query' or 'Response'
- Use language `response` if it is for the result of a query.

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


