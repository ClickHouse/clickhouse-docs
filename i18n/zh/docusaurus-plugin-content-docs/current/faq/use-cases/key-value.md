---
'slug': '/faq/use-cases/key-value'
'title': 'ClickHouse能用作键值存储吗？'
'toc_hidden': true
'toc_priority': 101
'description': '回答了关于ClickHouse是否可以用作键值存储的常见问题。'
---




# 我可以将 ClickHouse 用作键值存储吗？ {#can-i-use-clickhouse-as-a-key-value-storage}

简短的答案是 **"不可以"**。键值工作负载在定量分析系统中不适用的情况下位列前几位，它本质上是一个 [OLAP](../../faq/general/olap.md) 系统，而有许多优秀的键值存储系统可供选择。

然而，在某些情况下，使用 ClickHouse 进行类似键值的查询仍然是有意义的。通常，这是一些低预算的产品，其主要工作负载是分析性质，与 ClickHouse 非常契合，但还有一些次要过程需要一个键值模式，且请求吞吐量不是很高，没有严格的延迟要求。如果你的预算无限，你会为这项次要工作负载安装一个额外的键值数据库，但实际上，维护一个额外存储系统（监控、备份等）会带来额外的成本，这可能是不希望的。

如果你决定违反建议，在 ClickHouse 上运行一些类似键值的查询，这里有一些建议：

- ClickHouse 中点查询开销大的关键原因在于其稀疏主索引，这是主要的 [MergeTree 表引擎家族](../..//engines/table-engines/mergetree-family/mergetree.md)。这个索引无法指向每一特定的数据行，而是指向每 N-th 行，系统必须从相邻的 N-th 行扫描到目标行，这一路上读取了过多的数据。在键值场景中，可能有助于使用 `index_granularity` 设置减小 N 的值。
- ClickHouse 将每一列保存在一组单独的文件中，因此要组装完整的一行数据，它需要遍历这些文件。文件的数量是与列数线性增长的，因此在键值场景中，避免使用过多的列，把所有负载放在一个单一的 `String` 列中，并以一些序列化格式（如 JSON、Protobuf，或其他合理的格式）编码，可能是值得的。
- 还有一种替代方法使用 [Join](../../engines/table-engines/special/join.md) 表引擎而不是普通的 `MergeTree` 表，并使用 [joinGet](../../sql-reference/functions/other-functions.md#joinget) 函数来检索数据。这可以提供更好的查询性能，但可能会有一些可用性和可靠性问题。这里有一个 [使用示例](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00800_versatile_storage_join.sql#L49-L51)。
