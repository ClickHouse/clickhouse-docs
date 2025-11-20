---
slug: /faq/general/mapreduce
title: 'なぜ MapReduce のようなものを使わないのか'
toc_hidden: true
toc_priority: 110
description: 'このページでは、MapReduce ではなく ClickHouse を選択する理由を説明します'
keywords: ['MapReduce']
doc_type: 'reference'
---



# なぜMapReduceのようなものを使わないのか？ {#why-not-use-something-like-mapreduce}

MapReduceのようなシステムは、reduce操作が分散ソートに基づく分散コンピューティングシステムと言えます。このクラスで最も一般的なオープンソースソリューションは[Apache Hadoop](http://hadoop.apache.org)です。

これらのシステムは、レイテンシが高いためオンラインクエリには適していません。言い換えれば、Webインターフェースのバックエンドとして使用することはできません。また、これらのシステムはリアルタイムデータ更新にも適していません。操作結果とすべての中間結果(存在する場合)が単一サーバーのRAMに配置される場合、分散ソートはreduce操作を実行する最適な方法ではありません。これはオンラインクエリでは一般的なケースです。このような場合、ハッシュテーブルがreduce操作を実行する最適な方法となります。map-reduceタスクを最適化する一般的なアプローチは、RAM内のハッシュテーブルを使用した事前集約(部分的なreduce)です。ユーザーはこの最適化を手動で実行する必要があります。分散ソートは、単純なmap-reduceタスクを実行する際のパフォーマンス低下の主な原因の1つです。

ほとんどのMapReduce実装では、クラスタ上で任意のコードを実行できます。しかし、宣言的なクエリ言語の方が、実験を迅速に実行するOLAPに適しています。例えば、HadoopにはHiveとPigがあります。また、Spark向けのCloudera ImpalaやShark(廃止)、Spark SQL、Presto、Apache Drillなども検討に値します。このようなタスクを実行する際のパフォーマンスは、専用システムと比較して非常に劣りますが、比較的高いレイテンシにより、これらのシステムをWebインターフェースのバックエンドとして使用することは現実的ではありません。
