---
slug: /faq/use-cases/key-value
title: 我可以将 ClickHouse 用作键值存储吗？
toc_hidden: true
toc_priority: 101
---


# 我可以将 ClickHouse 用作键值存储吗？ {#can-i-use-clickhouse-as-a-key-value-storage}

简短的回答是 **"不"**。键值工作负载在 <span class="text-danger">**不**</span> 使用 ClickHouse 的情况列表中名列前茅。毕竟，它是一个 [OLAP](../../faq/general/olap.md) 系统，而外面有许多优秀的键值存储系统。

但是，在某些情况下，使用 ClickHouse 进行类似键值的查询仍然是有意义的。通常，这是一些低预算产品，其主要工作负载是分析性质，适合 ClickHouse，但也有一些次要的过程需要键值模式，且请求吞吐量不是很高，没有严格的延迟要求。如果你有无限的预算，你会为这个次要工作负载安装一个次要的键值数据库，但实际上，还有维护另一个存储系统（监控、备份等）的额外成本，这可能是希望避免的。

如果你决定不遵循建议并对 ClickHouse 执行一些类似键值的查询，以下是一些提示：

- ClickHouse 中点查询成本高的主要原因是其稀疏主索引来源于主要的 [MergeTree 表引擎系列](../..//engines/table-engines/mergetree-family/mergetree.md)。该索引无法指向每一特定行数据，而是指向每第 N 行，系统必须从相邻的第 N 行扫描到所需行，在此过程中读取过多数据。在键值场景中，使用 `index_granularity` 设置来减少 N 的值可能是有用的。
- ClickHouse 将每列保存在一组单独的文件中，因此要组装完整的一行数据，它需要遍历每个文件。文件的数量随列数线性增加，因此在键值场景中，可能值得避免使用过多的列，而将所有有效负载放在单个 `String` 列中，并采用诸如 JSON、Protobuf 或其他适合的序列化格式进行编码。
- 还有一种替代方法是使用 [Join](../../engines/table-engines/special/join.md) 表引擎，而不是普通的 `MergeTree` 表，并使用 [joinGet](../../sql-reference/functions/other-functions.md#joinget) 函数来检索数据。这可以提供更好的查询性能，但可能存在一些可用性和可靠性问题。这里有一个 [使用示例](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00800_versatile_storage_join.sql#L49-L51)。
