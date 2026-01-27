---
slug: /faq/general/mapreduce
title: 'なぜ MapReduce のようなものを使わないのですか？'
toc_hidden: true
toc_priority: 110
description: 'このページでは、MapReduce ではなく ClickHouse を選択する理由を説明します'
keywords: ['MapReduce']
doc_type: 'reference'
---



# なぜ MapReduce のようなものを使わないのか？ \{#why-not-use-something-like-mapreduce\}

MapReduce のようなシステムは、reduce 演算を分散ソートに基づいて行う分散コンピューティングシステムとみなせます。このクラスで最も一般的なオープンソースソリューションは [Apache Hadoop](http://hadoop.apache.org) です。 

これらのシステムはレイテンシが高いため、オンラインクエリには適していません。言い換えると、Web インターフェイスのバックエンドとしては利用できません。この種のシステムはリアルタイムなデータ更新にも向きません。分散ソートは、演算結果およびすべての中間結果（ある場合）が 1 台のサーバーの RAM 内に収まる場合（オンラインクエリでは通常このケースです）には、reduce 演算を行う最適な方法ではありません。このような場合、ハッシュテーブルが reduce 演算を行ううえで最適な手法になります。MapReduce タスクを最適化する一般的なアプローチとしては、RAM 内のハッシュテーブルを用いた事前集約（部分的な reduce）があります。この最適化はユーザーが手動で行います。分散ソートは、単純な MapReduce タスクを実行する際の性能低下の主な要因の 1 つです。

多くの MapReduce 実装では、クラスター上で任意のコードを実行できます。しかし、OLAP で素早く試行錯誤を行うには、宣言的なクエリ言語の方が適しています。たとえば、Hadoop には Hive と Pig があります。また、Spark 向けの Cloudera Impala や Shark（古い）、さらに Spark SQL、Presto、Apache Drill なども挙げられます。このようなタスクを実行した場合の性能は、専用システムと比べると大きく劣り、レイテンシも比較的高いため、これらのシステムを Web インターフェイスのバックエンドとして利用するのは現実的ではありません。
