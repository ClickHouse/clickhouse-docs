---
title: 'ClickHouse は分散 JOIN をサポートしていますか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/distributed-join
description: 'ClickHouse は分散 JOIN をサポートしています'
doc_type: 'reference'
keywords: ['distributed', 'join']
---

# ClickHouse は分散 JOIN をサポートしていますか？

ClickHouse はクラスタ上での分散 JOIN をサポートしています。

データがクラスタ内でコロケーションされている場合（たとえば、ユーザー識別子で JOIN を行い、その識別子がシャーディングキーにもなっている場合）、ClickHouse はネットワーク上でのデータ移動なしに JOIN を実行する方法を提供します。

データがコロケーションされていない場合、ClickHouse はブロードキャスト JOIN をサポートします。この場合、結合対象データの一部がクラスタ内の各ノードに分散されます。

2025 年時点では、ClickHouse は shuffle-join アルゴリズムを実行しません。これは、JOIN キーに従って、クラスタ全体で結合の両側のデータをネットワーク越しに再分配する処理を行わないことを意味します。