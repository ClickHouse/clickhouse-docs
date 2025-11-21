---
sidebar_label: '概览'
slug: /integrations/dbt
sidebar_position: 1
description: '用户可以使用 dbt 在 ClickHouse 中进行数据转换和建模'
title: '将 dbt 与 ClickHouse 集成'
keywords: ['dbt', '数据转换', '分析工程', 'SQL 建模', 'ELT 流水线']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_integration'
  - website: 'https://github.com/ClickHouse/dbt-clickhouse'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 集成 dbt 与 ClickHouse {#integrate-dbt-clickhouse}

<ClickHouseSupportedBadge />


## dbt-clickhouse 适配器 {#dbt-clickhouse-adapter}

**dbt**（数据构建工具）使分析工程师能够通过编写 select 语句来转换数据仓库中的数据。dbt 负责将这些 select 语句物化为数据库中的对象，以表和视图的形式呈现——执行[提取、加载和转换（ELT）](https://en.wikipedia.org/wiki/Extract,_load,_transform)中的 T（转换）部分。用户可以创建由 SELECT 语句定义的模型。

在 dbt 中，这些模型可以相互引用和分层，从而构建更高层次的概念。连接模型所需的样板 SQL 代码会自动生成。此外，dbt 会识别模型之间的依赖关系，并使用有向无环图（DAG）确保它们按正确的顺序创建。

dbt 通过 [ClickHouse 官方支持的适配器](https://github.com/ClickHouse/dbt-clickhouse)与 ClickHouse 兼容。

<TOCInline toc={toc} maxHeadingLevel={2} />


## 支持的功能 {#supported-features}

支持的功能列表:

- [x] 表物化
- [x] 视图物化
- [x] 增量物化
- [x] 微批次增量物化
- [x] 物化视图物化(使用 MATERIALIZED VIEW 的 `TO` 形式,实验性功能)
- [x] 种子数据
- [x] 数据源
- [x] 文档生成
- [x] 测试
- [x] 快照
- [x] 大多数 dbt-utils 宏(现已包含在 dbt-core 中)
- [x] 临时物化
- [x] 分布式表物化(实验性功能)
- [x] 分布式增量物化(实验性功能)
- [x] 契约
- [x] ClickHouse 特定的列配置(编解码器、TTL 等)
- [x] ClickHouse 特定的表设置(索引、投影等)

支持 dbt-core 1.9 及之前版本的所有功能。我们将很快添加 dbt-core 1.10 中新增的功能。

此适配器目前尚不支持在 [dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview) 中使用,但我们预计将很快提供支持。如需了解更多信息,请联系技术支持。


## 概念 {#concepts}

dbt 引入了模型(model)的概念。模型定义为一个 SQL 语句,可能连接多个表。模型可以通过多种方式进行"物化"(materialized)。物化代表模型 select 查询的构建策略。物化背后的代码是样板 SQL,它将您的 SELECT 查询包装在一个语句中,以创建新的关系或更新现有关系。

dbt 提供 4 种物化类型:

- **view**(视图,默认):模型在数据库中构建为视图。
- **table**(表):模型在数据库中构建为表。
- **ephemeral**(临时):模型不直接在数据库中构建,而是作为公共表表达式(CTE)拉入依赖模型中。
- **incremental**(增量):模型最初物化为表,在后续运行中,dbt 向表中插入新行并更新已更改的行。

附加的语法和子句定义了当底层数据发生变化时如何更新这些模型。dbt 通常建议从视图物化开始,直到性能成为关注点。表物化通过将模型查询的结果捕获为表来提供查询时间性能改进,代价是增加存储空间。增量方法在此基础上进一步构建,允许将底层数据的后续更新捕获到目标表中。

ClickHouse 的[当前适配器](https://github.com/silentsokolov/dbt-clickhouse)还支持**物化视图**、**字典**、**分布式表**和**分布式增量**物化。该适配器还支持 dbt [快照](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy)和[种子](https://docs.getdbt.com/docs/building-a-dbt-project/seeds)。

### 支持的物化详情 {#details-about-supported-materializations}

| 类型                        | 是否支持 | 详情                                                                                                                          |
| --------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| view materialization        | 是        | 创建一个[视图](https://clickhouse.com/docs/en/sql-reference/table-functions/view/)。                                            |
| table materialization       | 是        | 创建一个[表](https://clickhouse.com/docs/en/operations/system-tables/tables/)。支持的引擎列表见下文。 |
| incremental materialization | 是        | 如果表不存在则创建表,然后仅向其写入更新。                                                         |
| ephemeral materialized      | 是        | 创建临时/CTE 物化。此模型是 dbt 内部的,不会创建任何数据库对象。             |

以下是 ClickHouse 中的[实验性功能](https://clickhouse.com/docs/en/beta-and-experimental-features):

| 类型                                    | 是否支持        | 详情                                                                                                                                                                                                                                         |
| --------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Materialized View materialization       | 是,实验性 | 创建一个[物化视图](https://clickhouse.com/docs/en/materialized-view)。                                                                                                                                                                |
| Distributed table materialization       | 是,实验性 | 创建一个[分布式表](https://clickhouse.com/docs/en/engines/table-engines/special/distributed)。                                                                                                                                        |
| Distributed incremental materialization | 是,实验性 | 基于与分布式表相同思想的增量模型。请注意,并非所有策略都受支持,访问[此处](https://github.com/ClickHouse/dbt-clickhouse?tab=readme-ov-file#distributed-incremental-materialization)了解更多信息。 |
| Dictionary materialization              | 是,实验性 | 创建一个[字典](https://clickhouse.com/docs/en/engines/table-engines/special/dictionary)。                                                                                                                                                |


## 设置 dbt 和 ClickHouse 适配器 {#setup-of-dbt-and-the-clickhouse-adapter}

### 安装 dbt-core 和 dbt-clickhouse {#install-dbt-core-and-dbt-clickhouse}

dbt 提供了多种安装命令行界面 (CLI) 的选项,详细信息请参见[此处](https://docs.getdbt.com/dbt-cli/install/overview)。我们建议使用 `pip` 同时安装 dbt 和 dbt-clickhouse。

```sh
pip install dbt-core dbt-clickhouse
```

### 为 dbt 提供 ClickHouse 实例的连接详细信息 {#provide-dbt-with-the-connection-details-for-our-clickhouse-instance}

在 `~/.dbt/profiles.yml` 文件中配置 `clickhouse-service` 配置文件,并提供 schema、host、port、user 和 password 属性。完整的连接配置选项列表可在[功能和配置](/integrations/dbt/features-and-configurations)页面中查看:

```yaml
clickhouse-service:
  target: dev
  outputs:
    dev:
      type: clickhouse
      schema: [default] # dbt 模型使用的 ClickHouse 数据库

      # 可选
      host: [localhost]
      port: [8123] # 默认值为 8123、8443、9000、9440,具体取决于 secure 和 driver 设置
      user: [default] # 用于所有数据库操作的用户
      password: [<empty string>] # 用户密码
      secure: True # 使用 TLS(原生协议)或 HTTPS(http 协议)
```

### 创建 dbt 项目 {#create-a-dbt-project}

现在您可以在现有项目中使用此配置文件,或使用以下命令创建新项目:

```sh
dbt init project_name
```

在 `project_name` 目录中,更新 `dbt_project.yml` 文件以指定用于连接 ClickHouse 服务器的配置文件名称。

```yaml
profile: "clickhouse-service"
```

### 测试连接 {#test-connection}

使用 CLI 工具执行 `dbt debug` 以确认 dbt 是否能够连接到 ClickHouse。确认响应中包含 `Connection test: [OK connection ok]`,表示连接成功。

访问[指南页面](/integrations/dbt/guides)了解更多关于如何将 dbt 与 ClickHouse 配合使用的信息。

### 测试和部署您的模型 (CI/CD) {#testing-and-deploying-your-models-ci-cd}

测试和部署 dbt 项目有多种方法。dbt 提供了一些关于[最佳实践工作流](https://docs.getdbt.com/best-practices/best-practice-workflows#pro-tips-for-workflows)和 [CI 作业](https://docs.getdbt.com/docs/deploy/ci-jobs)的建议。我们将讨论几种策略,但请注意,这些策略可能需要根据您的具体使用场景进行深度调整。

#### 使用简单数据测试和单元测试的 CI/CD {#ci-with-simple-data-tests-and-unit-tests}

启动 CI 流水线的一种简单方法是在作业中运行 ClickHouse 集群,然后针对该集群运行您的模型。您可以在运行模型之前向该集群插入演示数据。您可以使用 [seed](https://docs.getdbt.com/reference/commands/seed) 将生产数据的子集填充到预发布环境中。

数据插入后,您可以运行[数据测试](https://docs.getdbt.com/docs/build/data-tests)和[单元测试](https://docs.getdbt.com/docs/build/unit-tests)。

您的 CD 步骤可以简单到针对生产 ClickHouse 集群运行 `dbt build`。

#### 更完整的 CI/CD 阶段:使用最新数据,仅测试受影响的模型 {#more-complete-ci-stage}

一种常见的策略是使用 [Slim CI](https://docs.getdbt.com/best-practices/best-practice-workflows#run-only-modified-models-to-test-changes-slim-ci) 作业,其中仅重新部署修改过的模型(及其上游和下游依赖项)。这种方法使用生产运行的构件(即 [dbt manifest](https://docs.getdbt.com/reference/artifacts/manifest-json))来减少项目的运行时间,并确保跨环境不会出现 schema 漂移。

为了保持开发环境同步并避免针对过时的部署运行模型,您可以使用 [clone](https://docs.getdbt.com/reference/commands/clone) 甚至 [defer](https://docs.getdbt.com/reference/node-selection/defer)。


我们建议为测试环境（即预生产环境）使用专用的 ClickHouse 集群或服务，以避免影响生产环境的运行。为了确保测试环境具有代表性，重要的是要使用生产数据的一个子集，并以避免不同环境之间出现 schema 漂移的方式运行 dbt。

- 如果你不需要使用最新数据进行测试，可以将生产数据的备份恢复到预生产环境中。
- 如果你需要使用最新数据进行测试，可以结合使用 [`remoteSecure()` 表函数](/sql-reference/table-functions/remote) 和可刷新物化视图，以所需的频率进行插入。另一种选择是使用对象存储作为中间存储，定期从生产服务写入数据，然后使用对象存储表函数或 ClickPipes（用于持续摄取）将其导入预生产环境。

为 CI 测试使用专用环境还允许你在不影响生产环境的情况下执行手动测试。例如，你可能希望将某个 BI 工具指向该环境进行测试。

对于部署（即 CD 步骤），我们建议使用生产部署生成的 artifacts，只更新已发生变更的模型。这需要将对象存储（例如 S3）配置为 dbt artifacts 的中间存储。一旦完成配置，你就可以运行类似 `dbt build --select state:modified+ --state path/to/last/deploy/state.json` 的命令，根据自上次在生产环境运行以来的变更，有选择地重建所需的最少数量的模型。



## 常见问题排查 {#troubleshooting-common-issues}

### 连接问题 {#troubleshooting-connections}

如果您在从 dbt 连接到 ClickHouse 时遇到问题,请确保满足以下条件:

- 引擎必须是[支持的引擎](/integrations/dbt/features-and-configurations#supported-table-engines)之一。
- 您必须具有访问数据库的相应权限。
- 如果您未使用数据库的默认表引擎,则必须在模型配置中指定表引擎。

### 了解长时间运行的操作 {#understanding-long-running-operations}

由于特定的 ClickHouse 查询,某些操作可能需要比预期更长的时间。要深入了解哪些查询耗时较长,请将[日志级别](https://docs.getdbt.com/reference/global-configs/logs#log-level)提高到 `debug` — 这将打印每个查询所用的时间。例如,可以通过在 dbt 命令后附加 `--log-level debug` 来实现。


## 限制 {#limitations}

当前的 ClickHouse dbt 适配器存在以下几个用户需要注意的限制:

- 该插件使用的语法需要 ClickHouse 25.3 或更高版本。我们不测试旧版本的 ClickHouse,目前也不测试 Replicated 表。
- 如果同时运行 `dbt-adapter` 的不同实例,可能会发生冲突,因为它们在内部可能对相同的操作使用相同的表名。有关更多信息,请查看问题 [#420](https://github.com/ClickHouse/dbt-clickhouse/issues/420)。
- 该适配器目前使用 [INSERT INTO SELECT](https://clickhouse.com/docs/sql-reference/statements/insert-into#inserting-the-results-of-select) 将模型物化为表。这实际上意味着如果再次执行运行,会导致数据重复。非常大的数据集(PB 级)可能导致极长的运行时间,使某些模型不可行。为了提高性能,可以通过将视图实现为 `materialized: materialization_view` 来使用 ClickHouse 物化视图。此外,应尽可能利用 `GROUP BY` 来最小化任何查询返回的行数。优先选择汇总数据的模型,而不是仅进行转换但保持源数据行数不变的模型。
- 要使用 Distributed 表来表示模型,用户必须在每个节点上手动创建底层的 Replicated 表。然后可以在这些表之上创建 Distributed 表。该适配器不管理集群创建。
- 当 dbt 在数据库中创建关系(表/视图)时,通常会创建为:`{{ database }}.{{ schema }}.{{ table/view id }}`。ClickHouse 没有 schema 的概念。因此,该适配器使用 `{{schema}}.{{ table/view id }}`,其中 `schema` 是 ClickHouse 数据库。
- 如果在 ClickHouse 插入语句中将临时模型/CTE 放置在 `INSERT INTO` 之前,它们将无法工作,请参见 https://github.com/ClickHouse/ClickHouse/issues/30323。这不应影响大多数模型,但在模型定义和其他 SQL 语句中放置临时模型时应谨慎。<!-- TODO review this limitation, looks like the issue was already closed and the fix was introduced in 24.10 -->


## Fivetran {#fivetran}

`dbt-clickhouse` 连接器也可用于 [Fivetran 转换](https://fivetran.com/docs/transformations/dbt),支持在 Fivetran 平台内直接使用 `dbt` 进行无缝集成和数据转换。
