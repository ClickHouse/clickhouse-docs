---
slug: /faq/general/mapreduce
title: '为什么不使用类似 MapReduce 的方案？'
toc_hidden: true
toc_priority: 110
description: '本页说明为什么要选择 ClickHouse 而不是 MapReduce'
keywords: ['MapReduce']
doc_type: 'reference'
---



# 为什么不使用类似 MapReduce 的系统? {#why-not-use-something-like-mapreduce}

我们可以将类似 MapReduce 的系统称为分布式计算系统,其中 reduce 操作基于分布式排序。这类系统中最常见的开源解决方案是 [Apache Hadoop](http://hadoop.apache.org)。

这些系统由于延迟较高而不适合在线查询。换句话说,它们无法用作 Web 界面的后端。这类系统也不适用于实时数据更新。如果操作结果和所有中间结果(如果有)都位于单台服务器的 RAM 中(这通常是在线查询的情况),那么分布式排序并不是执行 reduce 操作的最佳方式。在这种情况下,哈希表是执行 reduce 操作的最优方式。优化 map-reduce 任务的常见方法是使用 RAM 中的哈希表进行预聚合(部分 reduce)。用户需要手动执行此优化。分布式排序是运行简单 map-reduce 任务时导致性能下降的主要原因之一。

大多数 MapReduce 实现允许在集群上执行任意代码。但对于 OLAP 而言,声明式查询语言更适合快速运行实验。例如,Hadoop 提供了 Hive 和 Pig。此外还可以考虑用于 Spark 的 Cloudera Impala 或 Shark(已过时),以及 Spark SQL、Presto 和 Apache Drill。与专用系统相比,运行此类任务的性能远非最优,而且相对较高的延迟使得将这些系统用作 Web 界面后端变得不切实际。
