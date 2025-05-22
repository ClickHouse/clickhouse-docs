---
'slug': '/faq/use-cases/key-value'
'title': '我可以将 ClickHouse 用作键值存储吗？'
'toc_hidden': true
'toc_priority': 101
'description': '回答了一个常见问题，即 ClickHouse 是否可以用作键值存储？'
---


# 我可以将 ClickHouse 用作键值存储吗？ {#can-i-use-clickhouse-as-a-key-value-storage}

简短的回答是 **"不可以"**。键值工作负载在 <span class="text-danger">**不建议**</span> 使用 ClickHouse 的案例列表中排名靠前。毕竟这是一个 [OLAP](../../faq/general/olap.md) 系统，而市面上有许多出色的键值存储系统。

然而，可能会出现某些情况，使用 ClickHouse 进行类似键值的查询仍然是有意义的。通常是一些低预算的产品，其主要工作负载是分析性质，适合 ClickHouse，但还有一些辅助过程需要一种键值模式，并且请求吞吐量不高且没有严格的延迟要求。如果您有无限的预算，您会为这个辅助工作负载安装一个二级键值数据库，但实际上，维护一个额外存储系统（监控、备份等）的成本是额外的，可能希望避免。

如果您决定违反建议，并对 ClickHouse 运行一些类似键值的查询，以下是一些提示：

- 在 ClickHouse 中，点查询昂贵的主要原因是其稀疏的主 [MergeTree 表引擎系列](../..//engines/table-engines/mergetree-family/mergetree.md) 的索引。此索引无法指向每一特定的行数据，而是指向每 N 行，系统必须从邻近的 N 行扫描到所需行，同时读取过多的数据。在键值场景中，使用 `index_granularity` 设置减少 N 的值可能会有用。
- ClickHouse 将每一列保存在一组独立的文件中，因此要组装一行完整的数据，必须遍历每个文件。文件的数量会随着列数的增加而线性增长，因此在键值场景中，避免使用多个列并将所有有效负载放入一个编码为某种序列化格式（如 JSON、Protobuf 或其他合适的格式）的单一 `String` 列中，可能会更有价值。
- 还有一种替代方法，使用 [Join](../../engines/table-engines/special/join.md) 表引擎而不是普通的 `MergeTree` 表，并使用 [joinGet](../../sql-reference/functions/other-functions.md#joinget) 函数来检索数据。这可以提供更好的查询性能，但可能存在一些可用性和可靠性问题。这里有一个 [使用示例](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00800_versatile_storage_join.sql#L49-L51)。
