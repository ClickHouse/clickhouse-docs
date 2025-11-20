---
slug: /faq/use-cases/key-value
title: '我可以把 ClickHouse 用作键值存储吗？'
toc_hidden: true
toc_priority: 101
description: '解答关于 ClickHouse 是否可以用作键值存储的常见问题。'
doc_type: 'reference'
keywords: ['key-value', 'data model', 'use case', 'schema design', 'storage pattern']
---



# 我可以将 ClickHouse 用作键值存储吗? {#can-i-use-clickhouse-as-a-key-value-storage}

简短的答案是**"不可以"**。键值工作负载位于<span class="text-danger">**不应**</span>使用 ClickHouse 的场景列表的前列。毕竟它是一个 [OLAP](../../faq/general/olap.md) 系统,而市面上有许多优秀的键值存储系统。

然而,在某些情况下使用 ClickHouse 进行类键值查询仍然是合理的。通常是一些预算有限的产品,其主要工作负载本质上是分析性的,非常适合 ClickHouse,但同时也有一些次要流程需要键值模式,且请求吞吐量不高,也没有严格的延迟要求。如果预算充足,您会为这个次要工作负载部署一个单独的键值数据库,但实际上,维护另一个存储系统(监控、备份等)会产生额外成本,而这可能是您希望避免的。

如果您决定不采纳建议,仍要在 ClickHouse 上运行一些类键值查询,以下是一些提示:

- 点查询在 ClickHouse 中开销较大的关键原因是主要 [MergeTree 表引擎家族](../..//engines/table-engines/mergetree-family/mergetree.md)的稀疏主索引。该索引无法指向每一行具体数据,而是指向每第 N 行,系统必须从相邻的第 N 行扫描到目标行,在此过程中读取大量额外数据。在键值场景中,通过 `index_granularity` 设置减小 N 的值可能会有所帮助。
- ClickHouse 将每个列保存在单独的文件集中,因此要组装一个完整的行,需要遍历所有这些文件。文件数量随列数线性增长,因此在键值场景中,应避免使用过多列,而是将所有数据负载放入单个 `String` 列中,并使用某种序列化格式(如 JSON、Protobuf 或其他合适的格式)进行编码。
- 还有一种替代方法,使用 [Join](../../engines/table-engines/special/join.md) 表引擎代替普通的 `MergeTree` 表,并使用 [joinGet](../../sql-reference/functions/other-functions.md#joinGet) 函数检索数据。这可以提供更好的查询性能,但可能存在一些可用性和可靠性问题。这里有一个[使用示例](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00800_versatile_storage_join.sql#L49-L51)。
