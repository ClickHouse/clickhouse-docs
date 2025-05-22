---
'slug': '/faq/general/mapreduce'
'title': '为什么不使用类似于MapReduce的东西？'
'toc_hidden': true
'toc_priority': 110
'description': '本页解释了为什么您会选择ClickHouse而不是MapReduce'
---


# 为什么不使用类似于 MapReduce 的东西？ {#why-not-use-something-like-mapreduce}

我们可以将像 MapReduce 这样的系统称为分布式计算系统，其中 reduce 操作基于分布式排序。在这一类中，最常见的开源解决方案是 [Apache Hadoop](http://hadoop.apache.org)。 

由于高延迟，这些系统不适合在线查询。换句话说，它们不能作为 web 界面的后台使用。这些类型的系统对实时数据更新没有用处。如果操作的结果及所有中间结果（如果有的话）都位于单一服务器的 RAM 中，那么分布式排序就不是执行 reduce 操作的最佳方法，这通常是在线查询的情况。在这种情况下，哈希表是一种优化的 reduce 操作方式。优化 map-reduce 任务的常见方法是在 RAM 中使用哈希表进行预聚合（部分 reduce）。用户手动进行这种优化。在运行简单的 map-reduce 任务时，分布式排序是导致性能降低的主要原因之一。

大多数 MapReduce 实现允许您在集群上执行任意代码。但声明性查询语言更适合 OLAP，以快速运行实验。例如，Hadoop 有 Hive 和 Pig。另外，考虑 Cloudera Impala 或 Shark（过时）用于 Spark，以及 Spark SQL、Presto 和 Apache Drill。与专用系统相比，运行此类任务的性能非常低效，但相对较高的延迟使得使用这些系统作为 web 界面的后端不切实际。
