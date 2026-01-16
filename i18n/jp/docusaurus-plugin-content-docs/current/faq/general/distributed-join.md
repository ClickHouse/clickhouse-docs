---
title: 'ClickHouse は分散 JOIN をサポートしていますか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/distributed-join
description: 'ClickHouse では分散 JOIN をサポートしています'
doc_type: 'reference'
keywords: ['distributed', 'join']
---

# ClickHouse は分散 JOIN をサポートしていますか？ \\{#does-clickhouse-support-distributed-join\\}

ClickHouse はクラスタ上での分散 JOIN をサポートしています。

データがクラスタ内で同じノードに配置されている場合（例: JOIN をユーザー識別子で実行し、その識別子がシャーディングキーでもある場合）、ClickHouse はネットワーク上でデータを移動させることなく JOIN を実行する方法を提供します。

データが同一ノードに配置されていない場合、ClickHouse はブロードキャスト JOIN をサポートしており、結合対象データの一部をクラスタ内の各ノードに分散して配置できます。

2025 年時点では、ClickHouse はシャッフル JOIN アルゴリズムを実行しません。これは、JOIN キーに従ってクラスタ全体で結合する両側のデータをネットワーク経由で再分配する処理を行わないことを意味します。