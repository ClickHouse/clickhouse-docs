---
title: 'ClickHouse にコストベースのオプティマイザはありますか'
toc_hidden: true
toc_priority: 10
slug: /faq/general/cost-based
description: 'ClickHouse には、いくつかのコストベースの最適化メカニズムがあります'
doc_type: 'reference'
keywords: ['CBE', 'optimizer']
---

# ClickHouse にはコストベースのオプティマイザはありますか？

ClickHouse には、いくつかの限定的なコストベース最適化の仕組みがあります。たとえば、列を読み出す順序は、ディスクから圧縮されたデータ範囲を読み込むコストによって決定されます。

ClickHouse は列の統計情報に基づいて JOIN の並べ替えも行いますが、これは（2025 年時点では）Postgres、Oracle、MS SQL Server におけるコストベースオプティマイザほど高度なものではありません。