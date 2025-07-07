---
'slug': '/faq/general/mapreduce'
'title': '为什么不使用像 MapReduce 这样的东西？'
'toc_hidden': true
'toc_priority': 110
'description': '本页面解释了为什么您会选择 ClickHouse 而不是 MapReduce'
'keywords':
- 'MapReduce'
---


# 为什么不使用类似MapReduce的东西？ {#why-not-use-something-like-mapreduce}

我们可以将像MapReduce这样的系统称为分布式计算系统，其中reduce操作基于分布式排序。这类系统中最常见的开源解决方案是 [Apache Hadoop](http://hadoop.apache.org)。

由于延迟较高，这些系统不适合用于在线查询。换句话说，它们不能用作Web界面的后端。这类系统对于实时数据更新并不实用。如果操作的结果及所有中间结果（如果有的话）都位于单个服务器的RAM中，那么分布式排序并不是执行reduce操作的最佳方式，这通常是在线查询的情况。在这种情况下，哈希表是执行reduce操作的最佳方法。优化map-reduce任务的常见方法是使用RAM中的哈希表进行预聚合（部分reduce）。用户手动执行此优化。在运行简单的map-reduce任务时，分布式排序是导致性能降低的主要原因之一。

大多数MapReduce实现允许您在集群上执行任意代码。但是，声明性查询语言更适合OLAP，以便快速运行实验。例如，Hadoop具有Hive和Pig。还可以考虑Cloudera Impala或Spark的Shark（已过时），以及Spark SQL、Presto和Apache Drill。在运行此类任务时，性能相对于专用系统来说极其不理想，但相对较高的延迟使得这些系统作为Web界面的后端变得不切实际。
