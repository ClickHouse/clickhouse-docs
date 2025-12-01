---
slug: /faq/use-cases/key-value
title: '我可以将 ClickHouse 用作键值存储吗？'
toc_hidden: true
toc_priority: 101
description: '解答有关 ClickHouse 是否可以用作键值存储的常见问题。'
doc_type: 'reference'
keywords: ['key-value', 'data model', 'use case', 'schema design', 'storage pattern']
---



# 我可以把 ClickHouse 用作键值存储吗？ {#can-i-use-clickhouse-as-a-key-value-storage}

简短的回答是：**“不可以”**。键值型负载是在<strong class="text-danger">**不要**</strong>使用 ClickHouse 的场景列表中名列前茅的。毕竟它是一个 [OLAP](../../faq/general/olap.md) 系统，而市面上已经有许多出色的键值存储系统可供选择。

不过，在某些情况下，用 ClickHouse 来处理类键值查询仍然是有意义的。通常，这是在一些预算较低的产品中，主要负载是分析型的，非常适合用 ClickHouse 处理，但还存在一些次要流程需要键值模式，而且请求吞吐量不高，也没有严格的延迟要求。如果预算充足，你可能会为这类次要负载单独部署一个键值数据库，但在现实中，引入一个新的存储系统会带来额外的维护成本（监控、备份等），人们往往希望避免这一点。

如果你决定不按推荐做法，在 ClickHouse 上运行一些类键值查询，可以参考以下建议：

- ClickHouse 中点查询开销高的主要原因，是主流 [MergeTree 表引擎族](../..//engines/table-engines/mergetree-family/mergetree.md)使用的是稀疏主键索引。该索引无法精确定位到每一行数据，而是只能定位到每第 N 行，系统必须从相邻的第 N 行开始扫描到目标行，在此过程中会读取多余的数据。在键值场景中，可以考虑通过 `index_granularity` 设置减小 N 的取值。
- ClickHouse 会将每一列存储为一组独立的文件，因此要拼装出一整行数据，必须访问所有相关文件。文件数量会随列数线性增长，所以在键值场景中，建议避免使用过多列，把所有负载数据放在单个 `String` 列中，并采用 JSON、Protobuf 或任何合适的序列化格式进行编码。
- 还有一种替代方案是使用 [Join](../../engines/table-engines/special/join.md) 表引擎来代替常规的 `MergeTree` 表，并通过 [joinGet](../../sql-reference/functions/other-functions.md#joinGet) 函数来获取数据。这样可以获得更好的查询性能，但在易用性和可靠性方面可能会存在一些问题。这里有一个[使用示例](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00800_versatile_storage_join.sql#L49-L51)。
