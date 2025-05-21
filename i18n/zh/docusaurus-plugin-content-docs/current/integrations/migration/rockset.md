---
'title': '从Rockset迁移'
'slug': '/migrations/rockset'
'description': '从Rockset迁移到ClickHouse'
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

Rockset 是一个实时分析数据库 [于 2024年6月被 OpenAI 收购](https://rockset.com/blog/openai-acquires-rockset/)。 
用户必须在 2024年9月30日下午5点 PDT 之前 [完成服务迁移](https://docs.rockset.com/documentation/docs/faq)。

我们认为 ClickHouse Cloud 将为 Rockset 用户提供一个很好的去处，在本指南中，我们将介绍从 Rockset 迁移到 ClickHouse 时需要考虑的一些事项。

让我们开始吧！

## 立即帮助 {#immediate-assistance}

如果您需要立即帮助，请通过填写 [此表单](https://clickhouse.com/company/contact?loc=docs-rockest-migrations) 与我们联系，我们会有工作人员与您取得联系！

## ClickHouse vs Rockset - 高层对比 {#clickhouse-vs-rockset---high-level-comparison}

我们将首先简要概述 ClickHouse 的优势，以及您可能在何处看到与 Rockset 的一些好处。

ClickHouse 通过以 schema-first 的方式专注于实时性能和成本效率。 
虽然支持半结构化数据，但我们的理念是用户应决定如何结构化其数据以最大化性能和资源效率。 
由于上述 schema-first 方法的结果，在我们的基准测试中，ClickHouse 在可扩展性、摄取吞吐量、查询性能和成本效率方面超过了 Rockset。

关于与其他数据系统的集成，ClickHouse 具有 [广泛的能力](/integrations)，超出了 Rockset 的能力。

Rockset 和 ClickHouse 都提供基于云的产品和相关的支持服务。 
与 Rockset 不同，ClickHouse 还拥有开源产品和社区。 
ClickHouse 的源代码可以在 [github.com/clickhouse/clickhouse](https://github.com/clickhouse/clickhouse) 找到，撰写时已有超过 1,500 名贡献者。 
[ClickHouse 社区 Slack](https://clickhouse.com/slack) 拥有超过 7,000 名成员，他们互相分享经验/最佳实践，并帮助彼此解决遇到的任何问题。

本迁移指南专注于从 Rockset 迁移到 ClickHouse Cloud，但用户可以参考 [我们其余的文档](/) 以了解开源能力。

## Rockset 关键概念 {#rockset-key-concepts}

让我们开始了解 [Rockset 的关键概念](https://docs.rockset.com/documentation/docs/key-concepts)，并解释它们在 ClickHouse Cloud 中的等效项（如果存在）。

### 数据源 {#data-sources}

Rockset 和 ClickHouse 都支持从多种来源加载数据。

在 Rockset 中，您需要创建一个数据源，然后基于该数据源创建一个 _集合_。 
对于事件流平台、OLTP 数据库和云存储桶有完全托管的集成。

在 ClickHouse Cloud，中完全托管的集成等价于 [ClickPipes](/integrations/clickpipes)。 
ClickPipes 支持从事件流平台和云存储桶持续加载数据。 
ClickPipes 会将数据加载到 _表_ 中。

### 摄取转换 {#ingest-transformations}

Rockset 的摄取转换允许您在将原始数据存储到集合之前，对其进行转换。 
ClickHouse Cloud 通过 ClickPipes 实现相同功能，它使用 ClickHouse 的 [物化视图特性](/guides/developer/cascading-materialized-views) 来转换数据。

### 集合 {#collections}

在 Rockset 中，您查询集合。在 ClickHouse Cloud 中，您查询表。 
在这两个服务中，查询都是使用 SQL 进行的。 
ClickHouse 在 SQL 标准的基础上增加了额外的函数，以便您更强大地操作和转换数据。

### 查询 Lambda {#query-lambdas}

Rockset 支持查询 Lambda，它是存储在 Rockset 中的命名参数化查询，可以从专用的 REST 端点执行。 
ClickHouse Cloud 的 [查询 API 端点](/cloud/get-started/query-endpoints) 提供类似的功能。

### 视图 {#views}

在 Rockset 中，您可以创建视图，视图是由 SQL 查询定义的虚拟集合。 
ClickHouse Cloud 支持几种类型的 [视图](/sql-reference/statements/create/view)：

* _普通视图_ 不存储任何数据。它们只是在查询时从另一个表中读取数据。
* _参数化视图_ 类似于普通视图，但可以在查询时解析参数。
* _物化视图_ 存储由相应的 `SELECT` 查询转换的数据。它们就像触发器，当有新数据添加到它们所引用的源数据时会运行。

### 别名 {#aliases}

Rockset 别名用于将多个名称与集合关联。 
ClickHouse Cloud 不支持等效功能。

### 工作空间 {#workspaces}

Rockset 工作空间是包含资源（即集合、查询 Lambda、视图和别名）及其他工作空间的容器。

在 ClickHouse Cloud 中，您可以使用不同的服务进行完全隔离。 
您还可以创建数据库，以简化对不同表/视图的基于角色的访问控制（RBAC）。

## 设计考虑 {#design-considerations}

在本节中，我们将回顾 Rockset 的一些关键特性，并学习如何在使用 ClickHouse Cloud 时处理这些特性。

### JSON 支持 {#json-support}

Rockset 支持扩展版本的 JSON 格式，允许 Rockset 特定的类型。

在 ClickHouse 中，有多种方法可以处理 JSON：

* JSON 推断
* 查询时 JSON 提取
* 插入时 JSON 提取

要了解您用例的最佳方法，请参阅 [我们的 JSON 文档](/integrations/data-formats/json/overview)。

此外，ClickHouse 将很快新增 [半结构化列数据类型](https://github.com/ClickHouse/ClickHouse/issues/54864)。 
这个新类型应该能为用户提供与 Rockset 的 JSON 类型相似的灵活性。

### 全文搜索 {#full-text-search}

Rockset 支持使用其 `SEARCH` 函数进行全文搜索。 
虽然 ClickHouse 不是搜索引擎，但它确实有针对字符串搜索的 [各种函数](/sql-reference/functions/string-search-functions)。 
ClickHouse 还支持 [布隆过滤器](/optimize/skipping-indexes)，在许多场景中可以提供帮助。

### 向量搜索 {#vector-search}

Rockset 拥有一个相似性索引，可用于索引向量搜索应用程序中使用的嵌入。

ClickHouse 也可以用于向量搜索，使用线性扫描：
- [使用 ClickHouse 进行向量搜索 - 第 1 部分](https://clickhouse.com/blog/vector-search-clickhouse-p1?loc=docs-rockest-migrations)
- [使用 ClickHouse 进行向量搜索 - 第 2 部分](https://clickhouse.com/blog/vector-search-clickhouse-p2?loc=docs-rockest-migrations)

ClickHouse 还具有 [向量搜索相似性索引](/engines/table-engines/mergetree-family/annindexes)，但此方法目前是实验性的，尚不兼容 [新的查询分析器](/guides/developer/understanding-query-execution-with-the-analyzer)。

### 从 OLTP 数据库摄取数据 {#ingesting-data-from-oltp-databases}

Rockset 的托管集成支持从 OLTP 数据库（如 MongoDB 和 DynamoDB）摄取数据。

如果您正在从 DynamoDB 获取数据，请按照 [这里的 DynamoDB 集成指南](/integrations/data-ingestion/dbms/dynamodb/index.md) 操作。

### 计算-计算分离 {#compute-compute-separation}

计算-计算分离是一种实时分析系统中的架构设计模式，使处理突发的入境数据或查询成为可能。 
假设单个组件同时处理摄取和查询。 
在这种情况下，如果查询激增，将会看到摄取延迟增加，而如果数据激增，查询延迟也会增加。

计算-计算分离将数据摄取和查询处理代码路径分开，以避免此问题，这是 Rockset 在 2023 年 3 月实施的一个特性。

此功能目前正在 ClickHouse Cloud 中实施，并接近私有预览阶段。请联系支持以启用。

## 免费迁移服务 {#free-migration-services}

我们理解这对 Rockset 用户来说是一个压力较大的时期——没有人希望在如此短的时间内移动生产数据库！

如果 ClickHouse 适合您，我们将 [提供免费迁移服务](https://clickhouse.com/comparison/rockset?loc=docs-rockest-migrations)，以帮助平稳过渡。
