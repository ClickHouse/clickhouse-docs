---
slug: /faq/general/mapreduce
title: 为什么不使用像 MapReduce 这样的东西？
toc_hidden: true
toc_priority: 110
---


# 为什么不使用像 MapReduce 这样的东西？ {#why-not-use-something-like-mapreduce}

我们可以将像 MapReduce 这样的系统称为分布式计算系统，其中的 reduce 操作基于分布式排序。这个类别中最常见的开源解决方案是 [Apache Hadoop](http://hadoop.apache.org)。

由于高延迟，这些系统不适合在线查询。换句话说，它们不能用作网页界面的后端。这类系统对于实时数据更新并没有用处。当减少操作的结果及所有中间结果（如果有的话）都位于单个服务器的 RAM 中时，分布式排序并不是执行 reduce 操作的最佳方式，这通常是在线查询的情况。在这种情况下，哈希表是执行 reduce 操作的最佳方式。优化 map-reduce 任务的一个常见方法是在 RAM 中使用哈希表进行预聚合（部分减少）。用户需要手动执行此优化。在运行简单的 map-reduce 任务时，分布式排序是导致性能降低的主要原因之一。

大多数 MapReduce 实现允许您在集群上执行任意代码。但声明性查询语言更适合 OLAP，以快速运行实验。例如，Hadoop 具有 Hive 和 Pig。还可以考虑 Cloudera Impala 或 Shark（已过时）用于 Spark，以及 Spark SQL、Presto 和 Apache Drill。运行此类任务的性能与专用系统相比是高度次优的，但相对较高的延迟使得这些系统作为网页界面的后端是不现实的。
