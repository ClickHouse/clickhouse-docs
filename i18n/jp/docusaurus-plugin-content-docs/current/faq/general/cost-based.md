---
title: 'ClickHouse にコストベースオプティマイザーはありますか'
toc_hidden: true
toc_priority: 10
slug: /faq/general/cost-based
description: 'ClickHouse にはいくつかのコストベース最適化メカニズムがあります'
doc_type: 'reference'
keywords: ['CBE', 'optimizer']
---

# ClickHouse にはコストベースオプティマイザはありますか？

ClickHouse には、いくつかの個別のコストベース最適化メカニズムがあります。たとえば、どの順序でカラムを読み出すかは、ディスクから圧縮されたデータ範囲を読み取るコストによって決定されます。

ClickHouse はカラム統計情報に基づいて JOIN の順序を組み替えることもしますが、これは（2025 年時点では）Postgres、Oracle、MS SQL Server における CBO ほど高度ではありません。