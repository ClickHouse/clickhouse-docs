---
'slug': '/faq/general/mapreduce'
'title': '为什么不使用类似 MapReduce 的东西？'
'toc_hidden': true
'toc_priority': 110
'description': '本页面解释了为什么要使用 ClickHouse 而不是 MapReduce'
---




# 为什么不使用像 MapReduce 这样的系统？ {#why-not-use-something-like-mapreduce}

我们可以将像 MapReduce 这样的系统称为分布式计算系统，其中 reduce 操作基于分布式排序。在这一类中，最常见的开源解决方案是 [Apache Hadoop](http://hadoop.apache.org)。

由于这些系统的高延迟，它们不适合在线查询。换句话说，它们不能用作 Web 界面的后端。这类系统对于实时数据更新并不实用。如果操作的结果和所有中间结果（如果有的话）都位于单个服务器的 RAM 中，在这种情况下分布式排序并不是执行 reduce 操作的最佳选择。哈希表是一种执行 reduce 操作的最佳方法。优化 map-reduce 任务的一种常见方法是使用 RAM 中的哈希表进行预聚合（部分 reduce）。用户手动执行此优化。分布式排序是运行简单 map-reduce 任务时性能下降的主要原因之一。

大多数 MapReduce 实现允许您在集群上执行任意代码。但声明式查询语言更适合 OLAP，以便快速进行实验。例如，Hadoop 提供了 Hive 和 Pig。还可以考虑 Cloudera Impala 或 Shark（已过时）与 Spark 结合使用，以及 Spark SQL、Presto 和 Apache Drill。在运行此类任务时，相比于专业系统，性能远未达到最佳状态，但相对较高的延迟使得将这些系统用作 Web 界面的后端不切实际。
