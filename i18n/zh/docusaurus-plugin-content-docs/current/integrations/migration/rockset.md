---
title: 从 Rockset 迁移
slug: /migrations/rockset
description: 从 Rockset 迁移到 ClickHouse
keywords: [migrate, migration, migrating, data, etl, elt, Rockset]
---


# 从 Rockset 迁移

Rockset 是一个实时分析数据库 [在 2024 年 6 月被 OpenAI 收购](https://rockset.com/blog/openai-acquires-rockset/)。
用户必须在 2024 年 9 月 30 日下午 5 点 PDT 之前 [退出该服务](https://docs.rockset.com/documentation/docs/faq)。

我们认为 ClickHouse Cloud 会为 Rockset 用户提供一个极好的居所，在本指南中，我们将讨论一些在从 Rockset 迁移到 ClickHouse 时需要考虑的事项。

让我们开始吧！

## 紧急帮助 {#immediate-assistance}

如果您需要紧急帮助，请通过填写 [此表格](https://clickhouse.com/company/contact?loc=docs-rockest-migrations) 联系我们，我们会有专人与您取得联系！ 

## ClickHouse 与 Rockset - 高层次比较 {#clickhouse-vs-rockset---high-level-comparison}

我们将首先简要概述 ClickHouse 的优势，以及与 Rockset 相比您可能看到的某些好处。

ClickHouse 侧重于实时性能和成本效率，通过 schema-first 的方法实现。
虽然支持半结构化数据，但我们的理念是用户应该决定如何构建他们的数据，以最大化性能和资源效率。
正因如此，基于上述 schema-first 方法，在我们的基准测试中，ClickHouse 在可扩展性、数据摄取吞吐量、查询性能和成本效率上超越了 Rockset。

在与其他数据系统的集成方面，ClickHouse 具有超过 Rockset 的 [广泛能力](/integrations)。

Rockset 和 ClickHouse 都提供基于云的产品和相关支持服务。
与 Rockset 不同，ClickHouse 还具备开源产品和社区。
ClickHouse 的源代码可以在 [github.com/clickhouse/clickhouse](https://github.com/clickhouse/clickhouse) 找到，截至撰写时，已有超过 1,500 名贡献者。
[ClickHouse Community Slack](https://clickhouse.com/slack) 拥有超过 7,000 名成员，他们分享经验/最佳实践，并互相帮助解决遇到的问题。

本迁移指南专注于从 Rockset 迁移到 ClickHouse Cloud，但用户可以参考我们关于开源能力的 [其余文档](/)。

## Rockset 关键概念 {#rockset-key-concepts}

让我们开始了解 [Rockset 的关键概念](https://docs.rockset.com/documentation/docs/key-concepts) 并解释在 ClickHouse Cloud 中的对应项（如果存在）。

### 数据源 {#data-sources}

Rockset 和 ClickHouse 都支持从多种来源加载数据。

在 Rockset 中，您创建一个数据源，然后基于该数据源创建一个 _collection_。
有针对事件流平台、OLTP 数据库和云存储桶的完全托管集成。

在 ClickHouse Cloud 中，完全托管集成的等价物是 [ClickPipes](/integrations/clickpipes)。
ClickPipes 支持持续从事件流平台和云存储桶加载数据。
ClickPipes 将数据加载到 _tables_ 中。

### 数据摄取转换 {#ingest-transformations}

Rockset 的数据摄取转换允许您在将原始数据存储在集合中之前对其进行转换。
ClickHouse Cloud 通过 ClickPipes 以相同的方式执行此操作，ClickPipes 使用 ClickHouse 的 [物化视图特性](/guides/developer/cascading-materialized-views) 来转换数据。

### 集合 {#collections}

在 Rockset 中，您查询集合。在 ClickHouse Cloud 中，您查询表格。
在这两项服务中，查询是使用 SQL 执行的。
ClickHouse 在 SQL 标准的基础上添加了额外的功能，使您能够更强大地操作和转换您的数据。

### 查询 Lambda {#query-lambdas}

Rockset 支持查询 Lambda，即存储在 Rockset 中的命名参数化查询，可以从专门的 REST 端点执行。
ClickHouse Cloud 的 [Query API Endpoints](/cloud/get-started/query-endpoints) 提供类似的功能。

### 视图 {#views}

在 Rockset 中，您可以创建视图，这是由 SQL 查询定义的虚拟集合。
ClickHouse Cloud 支持多种类型的 [视图](/sql-reference/statements/create/view):

* _正常视图_ 不存储任何数据。它们只是从另一个表在查询时执行读取。
* _参数化视图_ 类似于正常视图，但可以创建时解析参数，参数在查询时进行解析。
* _物化视图_ 存储通过相应的 `SELECT` 查询转换的数据。它们就像是一个在向其引用的源数据添加新数据时运行的触发器。

### 别名 {#aliases}

Rockset 别名用于将多个名称与一个集合关联。
ClickHouse Cloud 不支持等效的功能。

### 工作区 {#workspaces}

Rockset 工作区是容纳资源（即集合、查询 Lambda、视图和别名）和其他工作区的容器。

在 ClickHouse Cloud 中，您可以使用不同的服务实现完整的隔离。
您还可以创建数据库，以简化对不同表/视图的 RBAC 访问。

## 设计考虑 {#design-considerations}

在本节中，我们将审查 Rockset 的一些关键特性，并学习如何在使用 ClickHouse Cloud 时解决它们。

### JSON 支持 {#json-support}

Rockset 支持扩展版本的 JSON 格式，允许使用 Rockset 特有的类型。

在 ClickHouse 中有多种方式处理 JSON：

* JSON 推断
* 查询时间 JSON 提取
* 插入时间 JSON 提取

要了解您用户案例的最佳方法，请参阅 [我们的 JSON 文档](/integrations/data-formats/json/overview)。

此外，ClickHouse 很快将拥有 [一种半结构化列数据类型](https://github.com/ClickHouse/ClickHouse/issues/54864)。
这种新类型应该能够为用户提供 Rockset 的 JSON 类型所提供的灵活性。

### 全文搜索 {#full-text-search}

Rockset 支持使用其 `SEARCH` 函数的全文搜索。
虽然 ClickHouse 不是搜索引擎，但它确实具有多种 [用于字符串搜索的函数](/sql-reference/functions/string-search-functions)。
ClickHouse 还支持 [布隆过滤器](/optimize/skipping-indexes)，这在许多场景中可以提供帮助。

### 向量搜索 {#vector-search}

Rockset 拥有相似性索引，可用于索引在向量搜索应用中使用的嵌入。

ClickHouse 也可以用于向量搜索，使用线性扫描：
- [ClickHouse 的向量搜索 - 第 1 部分](https://clickhouse.com/blog/vector-search-clickhouse-p1?loc=docs-rockest-migrations)
- [ClickHouse 的向量搜索 - 第 2 部分](https://clickhouse.com/blog/vector-search-clickhouse-p2?loc=docs-rockest-migrations)

ClickHouse 还有一个 [向量搜索相似性索引](/engines/table-engines/mergetree-family/annindexes)，但这种方法目前是实验性的，尚不兼容 [新的查询分析器](/guides/developer/understanding-query-execution-with-the-analyzer)。

### 从 OLTP 数据库导入数据 {#ingesting-data-from-oltp-databases}

Rockset 的托管集成支持从 MongoDB 和 DynamoDB 等 OLTP 数据库导入数据。

如果您正在从 DynamoDB 导入数据，请按照 [此处的 DynamoDB 集成指南](/integrations/data-ingestion/dbms/dynamodb/index.md) 操作。

### 计算-计算分离 {#compute-compute-separation}

计算-计算分离是实时分析系统中的一种架构设计模式，它使得应对突发的传入数据或查询成为可能。
假设单个组件同时处理数据摄取和查询。
在这种情况下，如果有大量查询，则会出现数据摄取延迟增加的现象，而如果有大量数据需要摄取，则查询延迟会增加。

计算-计算分离将数据摄取和查询处理的代码路径分离，以避免这种问题，这是 Rockset 于 2023 年 3 月实施的一项功能。

此功能目前正在 ClickHouse Cloud 中实施，并即将进入私人预览。请联系支持以启用该功能。

## 免费迁移服务 {#free-migration-services}

我们理解这对 Rockset 用户来说是一个压力大的时刻——没有人想在如此短的时间内搬迁生产数据库！

如果 ClickHouse 可能对您合适，我们将提供 [免费的迁移服务](https://clickhouse.com/comparison/rockset?loc=docs-rockest-migrations)，以帮助顺利过渡。
