---
'slug': '/faq/use-cases/key-value'
'title': '我可以将 ClickHouse 作为键值存储吗？'
'toc_hidden': true
'toc_priority': 101
'description': '回答了关于 ClickHouse 是否可以用作键值存储的常见问题。'
---


# 我可以将 ClickHouse 用作键值存储吗？ {#can-i-use-clickhouse-as-a-key-value-storage}

简短的回答是 **“不可以”**。键值负载在 <span class="text-danger">**不**</span> 使用 ClickHouse 的情况下排名靠前。毕竟它是一个 [OLAP](../../faq/general/olap.md) 系统，而市场上有许多出色的键值存储系统。

然而，在某些情况下，使用 ClickHouse 进行类似键值的查询仍然是有意义的。通常，这是一种低预算产品，其主要工作负载是分析性质并很适合 ClickHouse，但还有一些需要键值模式的辅助过程，其请求吞吐量不高且没有严格的延迟要求。如果您有无限的预算，您会为这个辅助工作负载安装一个次要的键值数据库，但实际上，维护一个额外存储系统（监控、备份等）会带来额外成本，而这些成本可能是希望避免的。

如果您决定不遵循建议，并对 ClickHouse 运行一些类似键值的查询，以下是一些提示：

- ClickHouse 中点查询成本高的主要原因是其 [MergeTree 表引擎系列](../..//engines/table-engines/mergetree-family/mergetree.md) 的稀疏主索引。此索引无法直接指向特定的行数据，而是指向每第 N 行，系统必须从临近的 N 行扫描到所需行，并在此过程中读取多余的数据。在键值场景中，使用 `index_granularity` 设置可能有助于降低 N 的值。
- ClickHouse 将每列保存在一组单独的文件中，因此要组装一整行，它需要遍历这些文件。随着列数的增加，文件的数量呈线性增加，因此在键值场景中，可能值得避免使用许多列，而将所有有效载荷放入一个单一的 `String` 列中，并使用 JSON、Protobuf 或其他合适的序列化格式进行编码。
- 还有一种替代方法，使用 [Join](../../engines/table-engines/special/join.md) 表引擎，而不是普通的 `MergeTree` 表，并使用 [joinGet](../../sql-reference/functions/other-functions.md#joinget) 函数来检索数据。这可以提供更好的查询性能，但可能存在一些可用性和可靠性问题。以下是一个 [使用示例](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00800_versatile_storage_join.sql#L49-L51)。
