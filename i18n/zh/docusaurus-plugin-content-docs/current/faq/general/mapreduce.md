---
'slug': '/faq/general/mapreduce'
'title': '为什么不使用类似 MapReduce 的东西？'
'toc_hidden': true
'toc_priority': 110
'description': '本页解释了您为何选择 ClickHouse 而非 MapReduce'
---


# 为什么不使用像 MapReduce 这样的东西？ {#why-not-use-something-like-mapreduce}

我们可以将类似于 MapReduce 的系统称为分布式计算系统，其中 reduce 操作基于分布式排序。这类最常见的开源解决方案是 [Apache Hadoop](http://hadoop.apache.org)。

由于其高延迟，这些系统不适合用于在线查询。换句话说，它们不能作为 web 界面的后端。这类系统对实时数据更新也没有用处。如果操作的结果及所有中间结果（如果有的话）都位于单个服务器的 RAM 中，而这通常适用于在线查询，那么分布式排序就不是执行 reduce 操作的最佳方式。在这种情况下，哈希表是执行 reduce 操作的最佳方法。优化 map-reduce 任务的一种常见方法是在 RAM 中使用哈希表进行预聚合（部分 reduce）。用户需要手动执行这种优化。在运行简单的 map-reduce 任务时，分布式排序是导致性能下降的主要原因之一。

大多数 MapReduce 实现允许您在集群上执行任意代码。但是，声明性查询语言更适合进行联机分析处理（OLAP），以快速运行实验。例如，Hadoop 有 Hive 和 Pig。另外，还可以考虑 Cloudera Impala 或 Shark（已过时）用于 Spark，以及 Spark SQL、Presto 和 Apache Drill。在运行此类任务时，性能与专用系统相比低得多，但相对较高的延迟使得将这些系统用于 web 界面的后端变得不切实际。
