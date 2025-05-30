---
'title': '从 Rockset 迁移'
'slug': '/migrations/rockset'
'description': '从 Rockset 迁移到 ClickHouse'
'keywords':
- 'Rockset'
'show_related_blogs': true
---


# 从 Rockset 迁移

Rockset 是一个实时分析数据库 [于 2024 年 6 月被 OpenAI 收购](https://rockset.com/blog/openai-acquires-rockset/)。 
用户必须在 2024 年 9 月 30 日下午 5 点 PDT 之前 [从该服务下线](https://docs.rockset.com/documentation/docs/faq)。

我们认为 ClickHouse Cloud 将为 Rockset 用户提供一个出色的家，在本指南中，我们将讨论移植 Rockset 到 ClickHouse 时需要考虑的一些事项。

让我们开始吧！

## 立即协助 {#immediate-assistance}

如果您需要立即协助，请通过填写 [此表单](https://clickhouse.com/company/contact?loc=docs-rockest-migrations) 联系我们，工作人员会与您取得联系！

## ClickHouse 与 Rockset - 高级比较 {#clickhouse-vs-rockset---high-level-comparison}

我们首先来简要概述 ClickHouse 的优势，以及与 Rockset 的一些对比。

ClickHouse 专注于通过以模式优先的方法实现实时性能和成本效率。 
虽然支持半结构化数据，但我们的理念是用户应该决定如何构造他们的数据，以最大限度地提高性能和资源效率。 
基于上述模式优先的方法，ClickHouse 在可扩展性、摄取吞吐量、查询性能和成本效率方面的基准超过了 Rockset。

在与其他数据系统的集成方面，ClickHouse 具有 [广泛的能力](/integrations)，超过了 Rockset。

Rockset 和 ClickHouse 都提供基于云的产品和相关的支持服务。 
与 Rockset 不同，ClickHouse 还有一个开源产品和社区。 
ClickHouse 的源代码可以在 [github.com/clickhouse/clickhouse](https://github.com/clickhouse/clickhouse) 找到，截至撰写时，已拥有超过 1,500 名贡献者。 
[ClickHouse 社区 Slack](https://clickhouse.com/slack) 有超过 7,000 名成员，他们分享各自的经验/最佳实践，并相互帮助解决遇到的问题。

本迁移指南专注于从 Rockset 迁移到 ClickHouse Cloud，但用户可以参考我们开源功能的 [其余文档](/)。

## Rockset 关键概念 {#rockset-key-concepts}

让我们先了解一下 [Rockset 的关键概念](https://docs.rockset.com/documentation/docs/key-concepts) 并解释在 ClickHouse Cloud 中其等效项（如果存在）。

### 数据源 {#data-sources}

Rockset 和 ClickHouse 都支持从多种来源加载数据。

在 Rockset 中，您创建一个数据源，然后基于该数据源创建一个 _集合_。 
为事件流平台、OLTP 数据库和云存储提供了完全托管的集成。

在 ClickHouse Cloud 中，完全托管的集成的等效项是 [ClickPipes](/integrations/clickpipes)。 
ClickPipes 支持从事件流平台和云存储中连续加载数据。 
ClickPipes 将数据加载到 _表_ 中。

### 摄取转换 {#ingest-transformations}

Rockset 的摄取转换允许您在将原始数据存入集合之前对其进行转换。 
ClickHouse Cloud 通过 ClickPipes 实现了相同的功能，ClickPipes 使用 ClickHouse 的 [物化视图功能](/guides/developer/cascading-materialized-views) 来转换数据。

### 集合 {#collections}

在 Rockset 中，您查询集合。在 ClickHouse Cloud 中，您查询表。
在这两项服务中，查询都是使用 SQL 完成的。 
ClickHouse 在 SQL 标准的基础上增加了额外的函数，以便您更有力度地操作和转换数据。

### 查询 Lambda {#query-lambdas}

Rockset 支持查询 Lambda，即存储在 Rockset 中的带参数的查询，可以通过专用的 REST 端点执行。 
ClickHouse Cloud 的 [查询 API 端点](/cloud/get-started/query-endpoints) 提供类似的功能。

### 视图 {#views}

在 Rockset 中，可以创建视图，这是由 SQL 查询定义的虚拟集合。 
ClickHouse Cloud 支持几种类型的 [视图](/sql-reference/statements/create/view)：

* _普通视图_ 不存储任何数据。它们仅在查询时从另一个表中读取。
* _参数化视图_ 类似于普通视图，但可以在查询时解析参数。
* _物化视图_ 存储通过相应的 `SELECT` 查询转换的数据。它们像是在添加新数据时运行的触发器。 

### 别名 {#aliases}

Rockset 别名用于将多个名称与一个集合关联。 
ClickHouse Cloud 不支持等效功能。

### 工作区 {#workspaces}

Rockset 工作区是保存资源（即集合、查询 Lambda、视图和别名）以及其他工作区的容器。

在 ClickHouse Cloud 中，您可以使用不同的服务实现完全隔离。 
您还可以创建数据库来简化对不同表/视图的 RBAC 访问。

## 设计考虑 {#design-considerations}

在本节中，我们将回顾 Rockset 的一些关键特性，并学习在使用 ClickHouse Cloud 时如何应对这些特性。

### JSON 支持 {#json-support}

Rockset 支持扩展版本的 JSON 格式，允许使用 Rockset 特定的类型。

在 ClickHouse 中，有多种方法可以处理 JSON：

* JSON 推断
* 查询时 JSON 提取
* 插入时 JSON 提取

要了解适合您用例的最佳方法，请参见 [我们的 JSON 文档](/integrations/data-formats/json/overview)。

此外，ClickHouse 即将推出 [半结构化列数据类型](https://github.com/ClickHouse/ClickHouse/issues/54864)。 
这种新类型应为用户提供 Rockset 的 JSON 类型所提供的灵活性。

### 全文搜索 {#full-text-search}

Rockset 支持使用 `SEARCH` 函数进行全文搜索。 
虽然 ClickHouse 不是一个搜索引擎，但它确实有 [多种搜索字符串的功能](/sql-reference/functions/string-search-functions)。 
ClickHouse 还支持 [布隆过滤器](/optimize/skipping-indexes)，可帮助处理许多场景。

### 向量搜索 {#vector-search}

Rockset 有一个相似性索引，可用于索引用于向量搜索应用的嵌入。

ClickHouse 也可以用于向量搜索，采用线性扫描：
- [使用 ClickHouse 的向量搜索 - 第 1 部分](https://clickhouse.com/blog/vector-search-clickhouse-p1?loc=docs-rockest-migrations)
- [使用 ClickHouse 的向量搜索 - 第 2 部分](https://clickhouse.com/blog/vector-search-clickhouse-p2?loc=docs-rockest-migrations)

ClickHouse 还具有 [向量搜索相似性索引](/engines/table-engines/mergetree-family/annindexes)，但这种方法目前处于实验阶段，尚不与 [新查询分析器](/guides/developer/understanding-query-execution-with-the-analyzer) 兼容。

### 从 OLTP 数据库摄取数据 {#ingesting-data-from-oltp-databases}

Rockset 的托管集成支持从 MongoDB 和 DynamoDB 等 OLTP 数据库中摄取数据。

如果您从 DynamoDB 中摄取数据，请按照 [此处](https://integrations/data-ingestion/dbms/dynamodb/index.md) 的 DynamoDB 集成指南进行操作。

### 计算-计算分离 {#compute-compute-separation}

计算-计算分离是一种实时分析系统中的架构设计模式，它使处理突发的输入数据或查询成为可能。 
假设单个组件同时处理摄取和查询。 
在这种情况下，如果查询洪水泛滥，摄取延迟会增加；如果有洪水数据需要摄取，查询延迟也会增加。

计算-计算分离将数据摄取和查询处理的代码路径分开，以避免此问题，这是 Rockset 在 2023 年 3 月实现的功能。

该功能目前正在 ClickHouse Cloud 中实施，接近私有预览。请联系支持以启用。

## 免费迁移服务 {#free-migration-services}

我们理解这段时间对 Rockset 用户来说是一个压力大的时期 - 没有人希望在如此短的时间内迁移生产数据库！

如果 ClickHouse 对您而言是一个合适的选择，我们将 [提供免费的迁移服务](https://clickhouse.com/comparison/rockset?loc=docs-rockest-migrations) 来帮助顺利过渡。
