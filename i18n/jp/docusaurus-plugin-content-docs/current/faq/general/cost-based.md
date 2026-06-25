---
title: 'ClickHouse はコストベースオプティマイザを持っていますか'
toc_hidden: true
toc_priority: 10
slug: /faq/general/cost-based
description: 'ClickHouse には一定のコストベース最適化の仕組みがあります'
doc_type: 'reference'
keywords: ['CBE', 'optimizer']
---

ClickHouse には、いくつかの限定的な形でコストベース最適化の仕組みがあります。たとえば、カラムの読み取り順序は、ディスクから圧縮されたデータ範囲を読み取るコストによって決定されます。

ClickHouse はカラム統計に基づいた JOIN の順序変更も行いますが、これは (2025 年時点では) Postgres、Oracle、MS SQL Server の CBE ほど高度ではありません。