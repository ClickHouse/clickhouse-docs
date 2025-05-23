---
'title': '从 Rockset 迁移'
'slug': '/migrations/rockset'
'description': '从 Rockset 迁移到 ClickHouse'
'keywords':
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
- 'etl'
- 'elt'
- 'Rockset'
---


# 从 Rockset 迁移

Rockset 是一个实时分析数据库 [在 2024 年 6 月被 OpenAI 收购](https://rockset.com/blog/openai-acquires-rockset/)。 用户必须在 2024 年 9 月 30 日下午 5 点（PDT）之前 [完成迁移](https://docs.rockset.com/documentation/docs/faq)。

我们相信 ClickHouse Cloud 将为 Rockset 用户提供一个理想的家园，在本指南中，我们将讨论在从 Rockset 迁移到 ClickHouse 时需要考虑的一些事项。

让我们开始吧！

## 紧急支持 {#immediate-assistance}

如果您需要立即帮助，请通过填写 [此表单](https://clickhouse.com/company/contact?loc=docs-rockest-migrations) 联系我们，我们会有专人跟您联系！

## ClickHouse 与 Rockset - 高级比较 {#clickhouse-vs-rockset---high-level-comparison}

首先，我们将简要概述 ClickHouse 的优势，以及与 Rockset 相比可能带来的一些好处。

ClickHouse 通过以模式优先的方法专注于实时性能和成本效率。虽然支持半结构化数据，但我们的理念是用户应该自行决定如何构建数据以最大化性能和资源效率。根据上述的模式优先方法， ClickHouse 在可扩展性、摄取吞吐量、查询性能和成本效率等方面超越了 Rockset。

在与其他数据系统的集成方面， ClickHouse 具备 [广泛的能力](/integrations)，超出 Rockset 的功能。

Rockset 和 ClickHouse 都提供基于云的产品和相关支持服务。与 Rockset 不同， ClickHouse 还拥有一个开源产品和社区。ClickHouse 的源代码可以在 [github.com/clickhouse/clickhouse](https://github.com/clickhouse/clickhouse) 找到，截至撰写本文时，已有超过 1,500 名贡献者。[ClickHouse 社区 Slack](https://clickhouse.com/slack) 拥有超过 7,000 名成员，他们分享经验和最佳实践，并互相帮助解决遇到的问题。

本迁移指南专注于从 Rockset 迁移到 ClickHouse Cloud，但是用户也可以参考我们关于开源能力的 [其余文档](/)。

## Rockset 关键概念 {#rockset-key-concepts}

让我们开始了解 [Rockset 的关键概念](https://docs.rockset.com/documentation/docs/key-concepts)，并解释在 ClickHouse Cloud 中的等效项（如果存在）。

### 数据源 {#data-sources}

Rockset 和 ClickHouse 都支持从多种源加载数据。

在 Rockset 中，您创建一个数据源，然后基于该数据源创建一个 _集合_。 该平台提供了事件流平台、 OLTP 数据库和云存储桶的完全托管集成。

在 ClickHouse Cloud 中，完全托管集成的等效项是 [ClickPipes](/integrations/clickpipes)。ClickPipes 支持从事件流平台和云存储桶中持续加载数据。ClickPipes 将数据加载到 _表_ 中。

### 数据摄取转换 {#ingest-transformations}

Rockset 的数据摄取转换允许您在数据被存储到集合中之前对其进行转换。ClickHouse Cloud 通过 ClickPipes 也做到了这一点，ClickPipes 使用 ClickHouse 的 [物化视图功能](/guides/developer/cascading-materialized-views) 来转换数据。

### 集合 {#collections}

在 Rockset 中，您查询集合。在 ClickHouse Cloud 中，您查询表。在这两项服务中，查询都是使用 SQL 进行的。ClickHouse 在 SQL 标准基础上增加了额外的函数，使您可以更强大地操作和转换数据。

### 查询 Lambda {#query-lambdas}

Rockset 支持查询 Lambda，即存储在 Rockset 中的命名参数化查询，可以从专用的 REST 端点执行。ClickHouse Cloud 的 [查询 API 端点](/cloud/get-started/query-endpoints) 提供了类似的功能。

### 视图 {#views}

在 Rockset 中，您可以创建视图，这些视图通过 SQL 查询定义为虚拟集合。ClickHouse Cloud 支持几种类型的 [视图](/sql-reference/statements/create/view)：

* _普通视图_ 不存储任何数据。它们只是在查询时从另一个表进行读取。
* _参数化视图_ 与普通视图类似，但可以使用在查询时解析的参数进行创建。
* _物化视图_ 存储由相应的 `SELECT` 查询转换的数据。当新的数据添加到它们所引用的源数据时，它们会像触发器一样运行。

### 别名 {#aliases}

Rockset 中的别名用于将多个名称与集合关联。ClickHouse Cloud 不支持等效的功能。

### 工作区 {#workspaces}

Rockset 工作区是容纳资源（即集合、查询 Lambda、视图和别名）和其他工作区的容器。

在 ClickHouse Cloud 中，您可以使用不同的服务实现完全隔离。您还可以创建数据库，以简化对不同表/视图的 RBAC 访问。

## 设计考虑 {#design-considerations}

在本节中，我们将回顾 Rockset 的一些关键特性，并了解在使用 ClickHouse Cloud 时如何解决这些特性。

### JSON 支持 {#json-support}

Rockset 支持扩展版本的 JSON 格式，允许使用 Rockset 特有的类型。

在 ClickHouse 中处理 JSON 有多种方式：

* JSON 推断
* 查询时 JSON 提取
* 插入时 JSON 提取

要了解适合您用户案例的最佳方法，请参见 [我们的 JSON 文档](/integrations/data-formats/json/overview)。

此外， ClickHouse 将很快拥有 [半结构化列数据类型](https://github.com/ClickHouse/ClickHouse/issues/54864)。这种新类型应该能提供 Rockset 的 JSON 类型所提供的灵活性。

### 全文搜索 {#full-text-search}

Rockset 支持使用其 `SEARCH` 函数进行全文搜索。虽然 ClickHouse 不是搜索引擎，但它确实有 [各种字符串搜索函数](/sql-reference/functions/string-search-functions)。
ClickHouse 还支持 [布隆过滤器](/optimize/skipping-indexes)，这在许多场景中都能提供帮助。

### 向量搜索 {#vector-search}

Rockset 有一个相似性索引，可以用于对向量搜索应用中使用的嵌入进行索引。

ClickHouse 也可以用于向量搜索，使用线性扫描：
- [ClickHouse 的向量搜索 - 第 1 部分](https://clickhouse.com/blog/vector-search-clickhouse-p1?loc=docs-rockest-migrations)
- [ClickHouse 的向量搜索 - 第 2 部分](https://clickhouse.com/blog/vector-search-clickhouse-p2?loc=docs-rockest-migrations)

ClickHouse 还有一个 [向量搜索相似性索引](/engines/table-engines/mergetree-family/annindexes)，但该方法目前是实验性的，尚不兼容 [新的查询分析器](/guides/developer/understanding-query-execution-with-the-analyzer)。

### 从 OLTP 数据库摄取数据 {#ingesting-data-from-oltp-databases}

Rockset 的托管集成支持从 MongoDB 和 DynamoDB 等 OLTP 数据库摄取数据。

如果您正在从 DynamoDB 摄取数据，请按照 [此处](https://integrations/data-ingestion/dbms/dynamodb/index.md) 的 DynamoDB 集成指南进行操作。

### 计算-计算分离 {#compute-compute-separation}

计算-计算分离是实时分析系统中的一种架构设计模式，使处理突发的传入数据或查询成为可能。假设单个组件同时处理摄取和查询。在这种情况下，如果有大量查询，摄取延迟将增加；如果有大量数据要摄取，则查询延迟会增加。

计算-计算分离将数据摄取和查询处理的代码路径分开，以避免此问题，这是 Rockset 在 2023 年 3 月实施的一项功能。

该功能目前正在 ClickHouse Cloud 中实现，并接近私有预览阶段。请联系支持以启用该功能。

## 免费迁移服务 {#free-migration-services}

我们理解，对于 Rockset 用户来说，这段时间非常紧张——没有人希望在这么短的时间内迁移生产数据库！

如果 ClickHouse 适合您，我们将提供 [免费迁移服务](https://clickhouse.com/comparison/rockset?loc=docs-rockest-migrations)，以帮助您平稳过渡。
