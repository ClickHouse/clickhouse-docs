# ClickHouse documentation writing guide

This is a work in progress, and probably will be for a while.  Please open an issue if there is something that you would like to see covered.

## Welcome, and thank you

Writing the docs is important, and we thank you for your help.  In this doc, you will find:

- instructions for building the ClickHouse docs 
- suggestions to save you time, for example, ways to use reusable content
- ways to avoid 404s
- examples of techniques used throughout the ClickHouse docs

## Building the docs

You can build the ClickHouse docs on most machines.  Our build process is a little different because part of our docs are in the [ClickHouse](https://github.com/ClickHouse/ClickHouse/) repo, and the rest are in the ClickHouse/clickhouse-docs repo. Here is the process on macOS:

```bash
brew install npm
brew install yarn

mkdir docs
cd docs

git clone https://github.com/ClickHouse/ClickHouse
git clone https://github.com/ClickHouse/ClickHouse-docs

cp -r ClickHouse/docs/en/development     ClickHouse-docs/docs/en/
cp -r ClickHouse/docs/en/engines         ClickHouse-docs/docs/en/
cp -r ClickHouse/docs/en/getting-started ClickHouse-docs/docs/en/
cp -r ClickHouse/docs/en/interfaces      ClickHouse-docs/docs/en/
cp -r ClickHouse/docs/en/operations      ClickHouse-docs/docs/en/
cp -r ClickHouse/docs/en/sql-reference   ClickHouse-docs/docs/en/
cp -r ClickHouse/docs/ru                 ClickHouse-docs/docs/
cp -r ClickHouse/docs/zh                 ClickHouse-docs/docs/

cd ClickHouse-docs

yarn install

yarn start
```
Note: Node.js 18 is recommended.


## 404s :(

### Relative links without the file extension (`.md` or `.mdx`)
We have seen more and more 404s as the size of the docs grow.
It seems that these are related to the use of `../` in the path to the markdown files.  Please write links to other doc
pages as:

#### link to another doc
```md title="foo"
[async_insert](/docs/en/operations/settings/settings.md)
```

#### link to an anchor within another doc

```md
[async_insert](/docs/en/operations/settings/settings.md/#async-insert)
```

Note the initial `/`, the `.md` and the slash between the `.md` and the `#async-insert` in the second example.

### Avoid absolute URLs when linking within the docs

Absolute URLs, those starting with `http` are not verified
by Docusaurus.  If you are linking within the docs, then use
a relative URL and use the path on disk.  For example:

```
https://clickhouse.com/docs/en/install/
```

should be replaced with

```md
/docs/en/getting-started/install.md
```

If you look closely, the path on disk does not match the URL.  The URLs can be changed by setting the `slug` in the markdown file frontmatter. 

## Save time with reusable content
Many of the pages in the docs have a section toward the top about gathering the connection details for your ClickHouse service.  Sending people off to look at a page to learn about the connection details and then having them forget what they were doing is a poor user experience.  If you can just include the right instructions in the current doc, please do so.  In general there are two interfaces that people will use when integrating some 3rd party software, or even `clickhouse client` to ClickHouse:

- HTTPS
- Native TCP

If you are writing about some language client or visualization tool, or ELT tool and it needs to connect to an HTTPS port then this line imports the content:
```jsx
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.md
x';
```

and this will render it:
```jsx
## 1. Gather your connection details                                               
<ConnectionDetails /> 
```

Note: in the preceding code block, a level two header is used; change it to whatever makes sense in your doc.

There are other snippets in `/docs/en/_snippets` for you to use.  If you need to repeat something, consider adding a new snippet or opening an issue for one to be added.

Here is how the above renders:

![sample connection info](https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/main/snippet-example.png)

## Avoid sending readers in circles

### Links can be overdone
Every time you mention a feature or product you may be tempted to link to it.  Don't do it.  When peole see links
they can be tempted to visit them, and quite often there is no need for them to go to the linked content.  If you mention a technique and you need the reader to learn it right then, add a link.  If they should read about it later then add a link down at the bottom of the doc in a **What's next** section.

### Include content in the current doc instead
If you find yourself wanting to send the reader to another doc to perform a task before they perform the main task that you are writing about, then maybe that prerequisite task should be included in the current doc instead so the reader is not clicking back and forth.  It may be time to create a snippet pull the content from the other doc into a snippet file and include it in the current doc and the other doc that you pulled it from (see [above](#save-time-with-reusable-content)).  

## Tools that you might like

### Static site generation
We process our docs with Docusaurus.  The instrucitons for building our docs are earlier in this doc.  You can learn more at [Docusaurus.io](https://docusaurus.io).

### Doc search
We use [Docsearch](https://docsearch.algolia.com/) from Algolia; there is not much for you to do to have the docs you write added to the search.  Every Monday, the Algolia crawler updates our index.

### *Hand-drawn* drawings

We use [Excalidraw](https://excalidraw.com).  You can use it too.  If you use Excalidraw to create an image for our docs, please submit the `.excalidraw` file along with the PNG or SVG so that it can be updated if necessary.
