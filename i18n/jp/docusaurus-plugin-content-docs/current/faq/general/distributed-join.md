---
title: 'ClickHouse は分散 JOIN をサポートしていますか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/distributed-join
description: 'ClickHouse では分散 JOIN をサポートしています'
doc_type: 'reference'
keywords: ['distributed', 'join']
---

# ClickHouse は分散 JOIN をサポートしていますか？ \{#does-clickhouse-support-distributed-joins\}

はい、ClickHouse はクラスタ上で分散 JOIN をサポートしています。

データがクラスタ上で同じ場所に配置されている場合 (たとえば、JOIN がユーザー識別子で実行され、その識別子がシャーディングキーでもある場合) 、ClickHouse には、ネットワーク上でデータを移動せずに JOIN を実行する方法があります。

データが同じ場所に配置されていない場合、ClickHouse では broadcast join を実行できます。この場合、JOIN 対象データの一部がクラスタ内のノード間に分散されます。

2025 年時点では、ClickHouse は shuffle joins を実行しません。つまり、JOIN のいずれの側も、JOIN キーに基づいてクラスタネットワーク全体に再分散されることはありません。

:::tip
ClickHouse の JOIN に関する一般的な情報については、[&quot;JOIN clause&quot;](/sql-reference/statements/select/join#supported-types-of-join) のページを参照してください。
:::