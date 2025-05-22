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

Rockset 是一个实时分析数据库 [于 2024 年 6 月被 OpenAI 收购](https://rockset.com/blog/openai-acquires-rockset/)。
用户必须在 2024 年 9 月 30 日下午 5 点 PDT 之前 [从该服务迁移](https://docs.rockset.com/documentation/docs/faq)。

我们认为 ClickHouse Cloud 将为 Rockset 用户提供一个优秀的家园，在本指南中，我们将讨论从 Rockset 迁移到 ClickHouse 时需要考虑的一些事项。

让我们开始吧！

## 立即帮助 {#immediate-assistance}

如果您需要立即帮助，请通过填写 [此表单](https://clickhouse.com/company/contact?loc=docs-rockest-migrations) 联系我们，将会有人与您取得联系！ 


## ClickHouse 与 Rockset 的高层比较 {#clickhouse-vs-rockset---high-level-comparison}

我们将从 ClickHouse 的优势以及与 Rockset 的比较中可能带来的某些好处开始进行简要概述。

ClickHouse 通过一种优先考虑模式的方式专注于实时性能和成本效率。
虽然支持半结构化数据，但我们的理念是用户应该决定如何构建他们的数据，以最大化性能和资源效率。
结果，在我们的基准测试中，ClickHouse 在可扩展性、摄取吞吐量、查询性能和成本效率方面超过了 Rockset。

在与其他数据系统的集成方面，ClickHouse 具备 [广泛的能力](/integrations)，超出 Rockset 的范围。

Rockset 和 ClickHouse 都提供基于云的产品及相关支持服务。
与 Rockset 不同，ClickHouse 还拥有一个开源产品和社区。
ClickHouse 的源代码可以在 [github.com/clickhouse/clickhouse](https://github.com/clickhouse/clickhouse) 上找到，撰写本文时，已有超过 1,500 位贡献者。
[ClickHouse 社区 Slack](https://clickhouse.com/slack) 拥有超过 7,000 名成员，他们分享自己的经验/最佳实践，并互相帮助解决遇到的问题。

本迁移指南专注于从 Rockset 迁移到 ClickHouse Cloud，但用户可以参考我们 [的其余文档](/) 了解开源功能。

## Rockset 关键概念 {#rockset-key-concepts}

首先，让我们来看看 [Rockset 的关键概念](https://docs.rockset.com/documentation/docs/key-concepts)，并解释在 ClickHouse Cloud 中（如果有的话）它们的对应关系。

### 数据源 {#data-sources}

Rockset 和 ClickHouse 都支持从多种来源加载数据。 

在 Rockset 中，您创建一个数据源，然后基于该数据源创建一个 _集合_。
对于事件流平台、OLTP 数据库和云存储桶，有完全托管的集成。

在 ClickHouse Cloud 中，完全托管的集成的等价物是 [ClickPipes](/integrations/clickpipes)。
ClickPipes 支持从事件流平台和云存储桶中持续加载数据。
ClickPipes 将数据加载到 _表_ 中。

### 数据摄取转换 {#ingest-transformations}

Rockset 的数据摄取转换允许您在数据存储到集合之前转换进入 Rockset 的原始数据。
ClickHouse Cloud 通过 ClickPipes 执行相同的操作，它使用 ClickHouse 的 [物化视图功能](/guides/developer/cascading-materialized-views) 来转换数据。

### 集合 {#collections}

在 Rockset 中，您查询集合。在 ClickHouse Cloud 中，您查询表。
在这两项服务中，查询都是使用 SQL 来执行的。
ClickHouse 在 SQL 标准的基础上添加了额外的函数，使您可以更强大地操控和转换您的数据。

### 查询 Lambda {#query-lambdas}

Rockset 支持查询 Lambda，这是存储在 Rockset 中的命名参数化查询，可以从专用 REST 端点执行。
ClickHouse Cloud 的 [查询 API 端点](/cloud/get-started/query-endpoints) 提供类似的功能。

### 视图 {#views}

在 Rockset 中，您可以创建视图，这是一种由 SQL 查询定义的虚拟集合。
ClickHouse Cloud 支持几种类型的 [视图](/sql-reference/statements/create/view)：

* _普通视图_ 不存储任何数据。它们在查询时仅从另一个表中读取数据。
* _参数化视图_ 类似于普通视图，但可以使用在查询时解析的参数创建。
* _物化视图_ 存储通过对应的 `SELECT` 查询转换的数据。它们就像一个在新数据添加到其引用的源数据时运行的触发器。

### 别名 {#aliases}

Rockset 别名用于将多个名称与集合关联。
ClickHouse Cloud 不支持相应的功能。

### 工作区 {#workspaces}

Rockset 工作区是容纳资源（即集合、查询 Lambda、视图和别名）及其他工作区的容器。

在 ClickHouse Cloud 中，您可以使用不同的服务来实现完全隔离。
您还可以创建数据库，以简化对不同表/视图的 RBAC 访问。 

## 设计考虑 {#design-considerations}

在本节中，我们将回顾 Rockset 的一些关键特性，并学习在使用 ClickHouse Cloud 时如何解决这些特性。

### JSON 支持 {#json-support}

Rockset 支持扩展版本的 JSON 格式，允许使用 Rockset 特定类型。

在 ClickHouse 中，有多种方法可以处理 JSON：

* JSON 推断
* 查询时提取 JSON
* 插入时提取 JSON

要了解适合您用例的最佳方法，请参见 [我们的 JSON 文档](/integrations/data-formats/json/overview)。

此外，ClickHouse 很快将拥有 [半结构化列数据类型](https://github.com/ClickHouse/ClickHouse/issues/54864)。
这种新类型应为用户提供 Rockset 的 JSON 类型所提供的灵活性。

### 全文搜索 {#full-text-search}

Rockset 通过其 `SEARCH` 函数支持全文搜索。
虽然 ClickHouse 不是搜索引擎，但它确实有 [多种字符串搜索函数](/sql-reference/functions/string-search-functions)。
ClickHouse 还支持 [布隆过滤器](/optimize/skipping-indexes)，在许多场景中可以提供帮助。

### 向量搜索 {#vector-search}

Rockset 有一个相似度索引，可用于索引用于向量搜索应用的嵌入。

ClickHouse 也可以用于向量搜索，使用线性扫描：
- [使用 ClickHouse 进行向量搜索 - 第 1 部分](https://clickhouse.com/blog/vector-search-clickhouse-p1?loc=docs-rockest-migrations)
- [使用 ClickHouse 进行向量搜索 - 第 2 部分](https://clickhouse.com/blog/vector-search-clickhouse-p2?loc=docs-rockest-migrations)

ClickHouse 还有一个 [向量搜索相似度索引](/engines/table-engines/mergetree-family/annindexes)，但此方法目前是实验性的，尚不兼容 [新的查询分析器](/guides/developer/understanding-query-execution-with-the-analyzer)。

### 从 OLTP 数据库摄取数据 {#ingesting-data-from-oltp-databases}

Rockset 的托管集成支持从 OLTP 数据库（如 MongoDB 和 DynamoDB）摄取数据。

如果您正在从 DynamoDB 摄取数据，请按照 [此处的 DynamoDB 集成指南](/integrations/data-ingestion/dbms/dynamodb/index.md)。

### 计算-计算分离 {#compute-compute-separation}

计算-计算分离是一种实时分析系统中的架构设计模式，使处理突发的进来的数据或查询成为可能。
假设一个单一组件同时处理数据摄取和查询。
在这种情况下，如果出现大量查询，则会看到摄取延迟增加；如果有大量数据需要摄取，则查询延迟增加。

计算-计算分离将数据摄取和查询处理代码路径分开，以避免此问题，这是 Rockset 在 2023 年 3 月实现的一个特性。

该功能目前正在 ClickHouse Cloud 中实施，并即将进入私密预览阶段。请联系支持以启用。

## 免费迁移服务 {#free-migration-services}

我们理解，对于 Rockset 用户来说，这段时间非常紧张 - 没有人希望在如此短的时间内迁移生产数据库！

如果 ClickHouse 对您来说是一个合适的选择，我们将 [提供免费的迁移服务](https://clickhouse.com/comparison/rockset?loc=docs-rockest-migrations)，以帮助顺利过渡。
