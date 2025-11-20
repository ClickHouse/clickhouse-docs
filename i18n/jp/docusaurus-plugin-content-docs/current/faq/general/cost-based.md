---
title: 'ClickHouse にコストベースオプティマイザはありますか'
toc_hidden: true
toc_priority: 10
slug: /faq/general/cost-based
description: 'ClickHouse にはいくつかのコストベース最適化の仕組みがあります'
doc_type: 'reference'
keywords: ['CBE', 'optimizer']
---

# ClickHouse にはコストベース最適化器はありますか？

ClickHouse には、いくつかの限定的なコストベース最適化の仕組みがあります。たとえば、列の読み取り順序は、ディスク上の圧縮されたデータ範囲を読み取るコストによって決定されます。

ClickHouse は列統計に基づいて JOIN の順序を組み替えることもしますが、これは（2025 年時点では）Postgres、Oracle、MS SQL Server におけるコストベース最適化ほど高度ではありません。