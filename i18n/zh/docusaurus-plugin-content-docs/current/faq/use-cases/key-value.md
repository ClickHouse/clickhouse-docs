---
'slug': '/faq/use-cases/key-value'
'title': '我可以将 ClickHouse 用作键值存储吗？'
'toc_hidden': true
'toc_priority': 101
'description': '解答了关于是否可以将 ClickHouse 用作键值存储的常见问题。'
'doc_type': 'reference'
---


# 我可以将 ClickHouse 用作键值存储吗？ {#can-i-use-clickhouse-as-a-key-value-storage}

简短的回答是 **"否"**。键值工作负载在 <span class="text-danger">**不**</span> 使用 ClickHouse 的情况列表中名列前茅。毕竟，它是一个 [OLAP](../../faq/general/olap.md) 系统，而市面上有许多优秀的键值存储系统。

但是，在某些情况下，使用 ClickHouse 进行类似键值的查询仍然是有意义的。通常，这是一些低预算产品，其中主要工作负载是分析性质并且适合 ClickHouse，但还有一些次要过程需要键值模式，且请求吞吐量不是很高，并且没有严格的延迟要求。如果你有无限的预算，你会为这个次要工作负载安装一个额外的键值数据库，但实际上，维护一个额外存储系统（监控、备份等）的额外成本可能是希望避免的。

如果你决定不遵循建议，并对 ClickHouse 执行一些类似键值的查询，以下是一些提示：

- 在 ClickHouse 中，点查询费用高的主要原因是它稀疏的主 [MergeTree 表引擎系列](../..//engines/table-engines/mergetree-family/mergetree.md) 的索引。该索引无法指向每一行数据，相反，它指向每 N 行，系统必须从相邻的 N 行扫描到所需行，沿途读取过多的数据。在键值场景中，使用 `index_granularity` 设置可以减少 N 的值可能是有用的。
- ClickHouse 将每列保存在一组独立的文件中，因此要组装一整行数据，它需要遍历每个文件。随着列数的增加，文件的数量线性增加，因此在键值场景中，可能需要避免使用过多的列，将所有负载放在单个 `String` 列中，并以某种序列化格式（如 JSON、Protobuf 或其他合理的格式）进行编码。
- 还有一种替代方法，使用 [Join](../../engines/table-engines/special/join.md) 表引擎而不是普通的 `MergeTree` 表，并使用 [joinGet](../../sql-reference/functions/other-functions.md#joinget) 函数来检索数据。这可能提供更好的查询性能，但可能存在一些可用性和可靠性问题。这里有一个 [用例示例](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00800_versatile_storage_join.sql#L49-L51)。
