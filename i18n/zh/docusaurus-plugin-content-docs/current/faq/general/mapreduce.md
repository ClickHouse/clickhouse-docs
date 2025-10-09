---
'slug': '/faq/general/mapreduce'
'title': '为什么不使用像 MapReduce 这样的东西？'
'toc_hidden': true
'toc_priority': 110
'description': '本页解释了您为什么会选择 ClickHouse 而不是 MapReduce'
'keywords':
- 'MapReduce'
'doc_type': 'reference'
---


# 为什么不使用类似 MapReduce 的东西？ {#why-not-use-something-like-mapreduce}

我们可以将类似 MapReduce 的系统称为分布式计算系统，其中 reduce 操作基于分布式排序。在这个类别中，最常见的开源解决方案是 [Apache Hadoop](http://hadoop.apache.org)。

由于其高延迟，这些系统不适合在线查询。换句话说，它们不能作为 Web 界面的后端。这些类型的系统对实时数据更新没有用处。如果操作的结果和所有中间结果（如果有的话）位于单个服务器的 RAM 中，那么分布式排序并不是执行 reduce 操作的最佳方式，而这通常是在线查询的情况。在这种情况下，哈希表是执行 reduce 操作的最佳方法。优化 map-reduce 任务的一种常见方法是在 RAM 中使用哈希表进行预聚合（部分 reduce）。用户手动执行此优化。在运行简单的 map-reduce 任务时，分布式排序是导致性能降低的主要原因之一。

多数 MapReduce 实现允许你在集群上执行任意代码。但声明性查询语言更适合于 OLAP，以便快速运行实验。例如，Hadoop 有 Hive 和 Pig。还可以考虑 Cloudera Impala 或 Shark（过时）用于 Spark，以及 Spark SQL、Presto 和 Apache Drill。在运行这些任务时，性能相较于专门的系统非常不理想，但相对较高的延迟使得使用这些系统作为 Web 界面的后端不切实际。
