---
'slug': '/faq/general/mapreduce'
'title': 'なぜ MapReduce のようなものを使用しないのか？'
'toc_hidden': true
'toc_priority': 110
'description': 'このページでは、なぜ MapReduce よりも ClickHouse を使用するのかを説明します。'
'keywords':
- 'MapReduce'
'doc_type': 'reference'
---


# Why not use something like MapReduce? {#why-not-use-something-like-mapreduce}

私たちは、MapReduceのようなシステムを、分散ソートに基づいたreduce操作を持つ分散コンピューティングシステムとして参照できます。このクラスで最も一般的なオープンソースのソリューションは [Apache Hadoop](http://hadoop.apache.org) です。

これらのシステムは、高いレイテンシのため、オンラインクエリには適していません。言い換えれば、これらはウェブインターフェースのバックエンドとして使用することができません。この種のシステムは、リアルタイムデータ更新にも役立ちません。分散ソートは、操作の結果とすべての中間結果（もしあれば）が通常、オンラインクエリのために単一サーバのRAMに存在する場合にreduce操作を行う最適な方法ではありません。このような場合、ハッシュテーブルがreduce操作を行うための最適な方法です。マップリデュースタスクを最適化する一般的なアプローチは、RAM内でのハッシュテーブルを使用した前集計（部分的なreduce）です。この最適化はユーザーが手動で行います。分散ソートは、単純なマップリデュースタスクを実行する際のパフォーマンス低下の主な原因の一つです。

ほとんどのMapReduce実装では、クラスタ上で任意のコードを実行することができます。しかし、宣言型クエリ言語は、OLAPにおいて実験を迅速に実行するためにより適しています。例えば、HadoopにはHiveやPigがあります。Spark用のCloudera ImpalaやShark（古いもの）も考慮し、Spark SQL、Presto、Apache Drillも比較してください。このようなタスクを実行する際のパフォーマンスは、専門システムと比べて非常に最適ではありませんが、比較的高いレイテンシにより、これらのシステムをウェブインターフェースのバックエンドとして使用することは現実的ではありません。
