---
'slug': '/faq/general/mapreduce'
'title': 'Why not use something like MapReduce?'
'toc_hidden': true
'toc_priority': 110
'description': 'This page explains why you would use ClickHouse over MapReduce'
---




# なぜ MapReduce のようなものを使用しないのか？ {#why-not-use-something-like-mapreduce}

MapReduce のようなシステムは、分散ソートに基づいている reduce 操作を持つ分散コンピューティングシステムと見なすことができます。このクラスで最も一般的なオープンソースソリューションは [Apache Hadoop](http://hadoop.apache.org) です。 

これらのシステムは、高いレイテンシのためオンラインクエリには適していません。言い換えれば、これらはウェブインターフェースのバックエンドとしては使用できません。このタイプのシステムは、リアルタイムデータの更新には役立ちません。分散ソートは、操作の結果とすべての中間結果（もしあるなら）が通常は単一のサーバーのRAMにあるオンラインクエリに対して、reduce 操作を行う最良の方法ではありません。このような場合、ハッシュテーブルが reduce 操作を行う最適な方法です。map-reduce タスクを最適化する一般的なアプローチは、RAM内のハッシュテーブルを使用した事前集約（部分的な reduce）です。この最適化はユーザーが手動で行います。分散ソートは、シンプルな map-reduce タスクを実行する際のパフォーマンスが低下する主な原因の一つです。

多くの MapReduce 実装は、クラスタ上で任意のコードを実行することを許可しています。しかし、宣言型クエリ言語は OLAP により適しており、実験を迅速に実行するのに有利です。たとえば、Hadoop には Hive と Pig があります。また、Spark 用の Cloudera Impala や（時代遅れの）Shark、Spark SQL、Presto、Apache Drill も考慮に入れるべきです。このようなタスクを実行する際のパフォーマンスは、専門のシステムと比較して非常にサブ最適ですが、比較的高いレイテンシにより、これらのシステムをウェブインターフェースのバックエンドとして使用することは現実的ではありません。
