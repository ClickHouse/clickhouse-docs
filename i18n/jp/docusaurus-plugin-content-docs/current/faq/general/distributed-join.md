---
title: 'ClickHouse は分散 JOIN をサポートしていますか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/distributed-join
description: 'ClickHouse は分散 JOIN をサポートします'
doc_type: 'reference'
keywords: ['distributed', 'join']
---

# ClickHouse は分散 JOIN をサポートしますか？

ClickHouse は、クラスタ上での分散 JOIN をサポートしています。

データがクラスタ内で同じノードに配置されている場合（例: JOIN がユーザー識別子で行われ、その識別子がシャーディングキーでもある場合）、ClickHouse はネットワーク上でデータを移動させることなく JOIN を実行する方法を提供します。

データが同じノードに配置されていない場合、ClickHouse ではブロードキャスト JOIN が可能であり、結合対象データの一部をクラスタ内の各ノードに配布します。

2025 年時点では、ClickHouse はシャッフル JOIN アルゴリズムを実装していません。これは、JOIN キーに基づいて、クラスタ全体にわたって結合する両側のデータをネットワーク経由で再分配する処理を行わないことを意味します。