---
slug: /faq/general/mapreduce
title: '为什么不使用 MapReduce 一类的方案？'
toc_hidden: true
toc_priority: 110
description: '本页解释为何选择 ClickHouse 而不是 MapReduce'
keywords: ['MapReduce']
doc_type: 'reference'
---



# 为什么不使用类似 MapReduce 的系统？ \{#why-not-use-something-like-mapreduce\}

我们可以把类似 MapReduce 的系统称为分布式计算系统，其中的 reduce 操作是基于分布式排序实现的。这一类中最常见的开源解决方案是 [Apache Hadoop](http://hadoop.apache.org)。 

由于延迟很高，这些系统并不适合用于在线查询。换句话说，它们不能作为 Web 界面的后端。这类系统也不适用于实时数据更新。如果运算结果以及所有中间结果（如果有的话）都位于单个服务器的 RAM 中（这在在线查询场景中通常如此），那么分布式排序并不是执行 reduce 操作的最佳方式。在这种情况下，使用哈希表是执行 reduce 操作的最优方法。优化 map-reduce 任务的通用办法是使用驻留在 RAM 中的哈希表进行预聚合（部分 reduce）。这一优化通常由用户手动完成。在运行简单的 map-reduce 任务时，分布式排序是导致性能下降的主要原因之一。

大多数 MapReduce 实现允许你在集群上执行任意代码。但对于 OLAP 来说，声明式查询语言更适合用于快速开展实验。例如，Hadoop 提供了 Hive 和 Pig。还可以考虑 Cloudera Impala，或 Spark 生态中的 Shark（已过时），以及 Spark SQL、Presto 和 Apache Drill。与专用系统相比，在这类系统上运行此类任务的性能远非理想，而且相对较高的延迟也使得将这些系统用作 Web 界面的后端不切实际。
