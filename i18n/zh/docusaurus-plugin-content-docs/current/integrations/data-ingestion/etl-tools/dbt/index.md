---
sidebar_label: '概览'
slug: /integrations/dbt
sidebar_position: 1
description: '您可以使用 dbt 在 ClickHouse 中进行数据转换和建模'
title: '将 dbt 与 ClickHouse 集成'
keywords: ['dbt', '数据转换', '分析工程', 'SQL 建模', 'ELT 管道']
doc_type: '指南'
integration:
  - support_level: 'core'
  - category: 'data_integration'
  - website: 'https://github.com/ClickHouse/dbt-clickhouse'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 将 dbt 与 ClickHouse 集成 {#integrate-dbt-clickhouse}

<ClickHouseSupportedBadge/>

## dbt-clickhouse 适配器 {#dbt-clickhouse-adapter}

**dbt**（data build tool）使数据分析工程师仅需编写 SELECT 语句即可在数据仓库中完成数据转换。dbt 会将这些 SELECT 语句实体化为数据库中的对象（表和视图），从而执行 [Extract Load and Transform (ELT)](https://en.wikipedia.org/wiki/Extract,_load,_transform) 中的 T。你可以创建由一个 SELECT 语句定义的模型。

在 dbt 中，这些模型可以相互交叉引用和分层，以便构建更高层次的概念。用于连接模型的样板 SQL 会自动生成。此外，dbt 会识别模型之间的依赖关系，并使用有向无环图（DAG）确保按合适的顺序创建它们。

dbt 可以通过一个由 ClickHouse 提供支持的适配器与 ClickHouse 集成： [ClickHouse-supported adapter](https://github.com/ClickHouse/dbt-clickhouse)。

<TOCInline toc={toc}  maxHeadingLevel={2} />

## 支持的功能 {#supported-features}

支持的功能列表：

- [x] 表物化
- [x] 视图物化
- [x] 增量物化
- [x] 微批增量物化
- [x] materialized view 物化（使用 MATERIALIZED VIEW 的 `TO` 形式，实验性）
- [x] Seeds
- [x] Sources
- [x] 文档生成
- [x] 测试
- [x] 快照
- [x] 大多数 dbt-utils 宏（现已包含在 dbt-core 中）
- [x] Ephemeral 物化
- [x] 分布式表物化（实验性）
- [x] 分布式增量物化（实验性）
- [x] Contracts
- [x] ClickHouse 特定列配置（Codec、生存时间 (TTL) 等）
- [x] ClickHouse 特定表设置（索引、投影等）

已支持截至 dbt-core 1.10 的全部功能，包括 `--sample` 标志，并已修复所有面向未来版本的弃用警告。dbt 1.10 中引入的 **Catalog 集成**（例如 Iceberg）尚未在此 adapter 中获得原生支持，但可以通过变通方案实现。详情请参见 [Catalog Support 部分](/integrations/dbt/features-and-configurations#catalog-support)。

此 adapter 目前仍无法在 [dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview) 中使用，但我们预计很快会提供支持。若需更多信息，请联系支持团队。

## dbt 概念和支持的物化方式 {#concepts-and-supported-materializations}

dbt 引入了 model 的概念。它被定义为一条 SQL 语句，可能会连接多张表。一个 model 可以通过多种方式进行“物化”。物化表示针对该 model 的 SELECT 查询的一种构建策略。物化背后的代码是一段样板 SQL，它会将你的 SELECT 查询包裹在一个语句中，用于创建新的或更新已有的关系对象（relation）。

dbt 提供了 5 种物化类型。它们在 `dbt-clickhouse` 中均受支持：

* **view**（默认）：model 会在数据库中构建为一个视图。在 ClickHouse 中，对应创建一个 [view](/sql-reference/statements/create/view)。
* **table**：model 会在数据库中构建为一张表。在 ClickHouse 中，对应创建一张 [table](/sql-reference/statements/create/table)。
* **ephemeral**：model 不会直接在数据库中构建，而是作为 CTE（Common Table Expressions，公用表表达式）被内联到依赖它的其他 model 中。
* **incremental**：model 初始会被物化为一张表，在后续运行中，dbt 会向表中插入新增行并更新发生变化的行。
* **materialized view**：model 会在数据库中构建为一个 materialized view。在 ClickHouse 中，对应创建一个 [materialized view](/sql-reference/statements/create/view#materialized-view)。

还可以通过额外的语法和子句来定义当底层数据变化时应如何更新这些 model。dbt 通常建议先从 view 物化开始，直到性能成为关注点为止。table 物化通过将 model 查询的结果保存为一张表，在增加存储空间开销的前提下，提供了查询时间上的性能提升。incremental 方式在此基础上进一步扩展，使后续对底层数据的更新可以被增量写入目标表。

当前用于 ClickHouse 的[适配器](https://github.com/silentsokolov/dbt-clickhouse)还支持 **dictionary**、**distributed table** 和 **distributed incremental** 物化。该适配器还支持 dbt 的 [snapshots](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy)（快照）和 [seeds](https://docs.getdbt.com/docs/building-a-dbt-project/seeds)（种子数据）。

以下是在 `dbt-clickhouse` 中的[实验性特性](https://clickhouse.com/docs/en/beta-and-experimental-features)：

| Type                                    | Supported?        | Details                                                                                                                                                                                                                                         |
|-----------------------------------------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Materialized View materialization       | YES, Experimental | 创建一个 [materialized view](https://clickhouse.com/docs/en/materialized-view)。                                                                                                                                                                |
| Distributed table materialization       | YES, Experimental | 创建一个 [distributed table](https://clickhouse.com/docs/en/engines/table-engines/special/distributed)。                                                                                                                                        |
| Distributed incremental materialization | YES, Experimental | 基于与 distributed table 相同思想的增量 model。请注意，并非所有策略都受支持，更多信息请参见[此处](https://github.com/ClickHouse/dbt-clickhouse?tab=readme-ov-file#distributed-incremental-materialization)。 |
| Dictionary materialization              | YES, Experimental | 创建一个 [dictionary](https://clickhouse.com/docs/en/engines/table-engines/special/dictionary)。                                                                                                                                                |

## 配置 dbt 和 ClickHouse 适配器 {#setup-of-dbt-and-the-clickhouse-adapter}

### 安装 dbt-core 和 dbt-clickhouse {#install-dbt-core-and-dbt-clickhouse}

dbt 提供了多种安装命令行界面（CLI）的方法，详细说明请参阅[此处](https://docs.getdbt.com/dbt-cli/install/overview)。我们建议使用 `pip` 同时安装 dbt 和 dbt-clickhouse。

```sh
pip install dbt-core dbt-clickhouse
```


### 为 dbt 提供我们 ClickHouse 实例的连接信息。 {#provide-dbt-with-the-connection-details-for-our-clickhouse-instance}

在 `~/.dbt/profiles.yml` 文件中配置 `clickhouse-service` profile，并提供 schema、host、port、user 和 password 属性。完整的连接配置选项列表请参阅 [功能和配置](/integrations/dbt/features-and-configurations) 页面：

```yaml
clickhouse-service:
  target: dev
  outputs:
    dev:
      type: clickhouse
      schema: [ default ] # ClickHouse database for dbt models

      # Optional
      host: [ localhost ]
      port: [ 8123 ]  # Defaults to 8123, 8443, 9000, 9440 depending on the secure and driver settings 
      user: [ default ] # User for all database operations
      password: [ <empty string> ] # Password for the user
      secure: True  # Use TLS (native protocol) or HTTPS (http protocol)
```


### 创建一个 dbt 项目 {#create-a-dbt-project}

现在可以在你现有的项目中使用该 profile，或者使用以下命令创建一个新项目：

```sh
dbt init project_name
```

在 `project_name` 目录下，更新 `dbt_project.yml` 文件，为连接 ClickHouse 服务器指定要使用的 profile 名称。

```yaml
profile: 'clickhouse-service'
```


### 测试连接 {#test-connection}

使用 CLI 工具运行 `dbt debug`，以确认 dbt 是否能够连接到 ClickHouse。检查返回结果中是否包含 `Connection test: [OK connection ok]`，这表示连接成功。

前往[指南页面](/integrations/dbt/guides)以进一步了解如何在 ClickHouse 中使用 dbt。

### 测试和部署你的模型（CI/CD） {#testing-and-deploying-your-models-ci-cd}

有许多方法可以测试和部署你的 dbt 项目。dbt 提供了一些关于[最佳实践工作流](https://docs.getdbt.com/best-practices/best-practice-workflows#pro-tips-for-workflows)和 [CI 任务](https://docs.getdbt.com/docs/deploy/ci-jobs)的建议。我们将讨论几种策略，但请记住，这些策略可能需要根据你的具体使用场景进行较大程度的调整。

#### 使用简单数据测试和单元测试的 CI/CD {#ci-with-simple-data-tests-and-unit-tests}

启动 CI 流水线的一种简单方式，是在 CI 作业中运行一个 ClickHouse 集群，然后在该集群上运行你的模型。你可以在运行模型之前，将示例数据插入这个集群。你也可以只使用一个 [seed](https://docs.getdbt.com/reference/commands/seed) 来用生产数据的一个子集填充 staging 环境。

数据插入完成后，你就可以运行你的 [data tests](https://docs.getdbt.com/docs/build/data-tests) 和 [unit tests](https://docs.getdbt.com/docs/build/unit-tests)。

你的 CD 步骤可以非常简单，只需要在生产 ClickHouse 集群上运行 `dbt build` 即可。

#### 更完善的 CI/CD 阶段：使用最新数据，只测试受影响的模型 {#more-complete-ci-stage}

一种常见策略是使用 [Slim CI](https://docs.getdbt.com/best-practices/best-practice-workflows#run-only-modified-models-to-test-changes-slim-ci) 任务，只重新部署已修改的模型（及其上下游依赖）。此方法使用生产环境运行生成的工件（即 [dbt manifest](https://docs.getdbt.com/reference/artifacts/manifest-json)）来缩短项目运行时间，并确保各环境之间不会出现 schema 漂移。

为了保持开发环境同步，并避免在过时的部署上运行模型，你可以使用 [clone](https://docs.getdbt.com/reference/commands/clone)，甚至是 [defer](https://docs.getdbt.com/reference/node-selection/defer)。

我们建议为测试环境（即 staging 环境）使用单独的 ClickHouse 集群或服务，以避免影响生产环境的运行。为确保测试环境具有代表性，重要的是要在其中使用生产数据的一个子集，并以一种能防止环境之间 schema 漂移的方式运行 dbt。

- 如果你不需要最新数据进行测试，可以将生产数据的备份恢复到 staging 环境中。
- 如果你需要最新数据进行测试，可以结合使用 [`remoteSecure()` 表函数](/sql-reference/table-functions/remote) 和可刷新materialized view，按所需频率写入数据。另一种选择是使用对象存储作为中间存储介质，周期性地从生产服务写出数据，然后使用对象存储表函数或 ClickPipes（用于持续摄取）将其导入 staging 环境。

为 CI 测试使用独立环境还能让你进行手动测试而不影响生产环境。例如，你可能希望将某个 BI 工具指向该环境进行测试。

在部署阶段（即 CD 步骤），我们建议使用生产部署生成的工件，只更新已发生变更的模型。这需要将对象存储（例如 S3）配置为 dbt 工件的中间存储。一旦完成配置，你可以运行类似 `dbt build --select state:modified+ --state path/to/last/deploy/state.json` 的命令，根据自上次生产运行以来的变更，有选择地重建所需的最少模型集。

## 常见问题排查 {#troubleshooting-common-issues}

### 连接 {#troubleshooting-connections}

如果在使用 dbt 连接 ClickHouse 时遇到问题，请确保满足以下条件：

- 引擎必须是[受支持的引擎](/integrations/dbt/features-and-configurations#supported-table-engines)之一。
- 必须拥有访问该数据库的足够权限。
- 如果未使用该数据库的默认表引擎，则必须在模型配置中显式指定一个表引擎。

### 了解长时间运行的操作 {#understanding-long-running-operations}

由于特定的 ClickHouse 查询，一些操作可能会比预期花费更长时间。要进一步了解哪些查询耗时较长，可以将[日志级别（log level）](https://docs.getdbt.com/reference/global-configs/logs#log-level)设置为 `debug`——这会输出每个查询所用的时间。例如，可以通过在 dbt 命令后追加 `--log-level debug` 来实现。

## 限制 {#limitations}

当前用于 dbt 的 ClickHouse 适配器存在若干限制，需要注意：

- 该插件使用的语法要求 ClickHouse 版本为 25.3 或更新版本。我们不会对更早版本的 ClickHouse 进行测试，目前也不会对 Replicated 表进行测试。
- 如果在同一时间运行，不同的 `dbt-adapter` 任务可能会发生冲突，因为在内部它们可能会为相同的操作使用相同的表名。更多信息请查看 issue [#420](https://github.com/ClickHouse/dbt-clickhouse/issues/420)。
- 适配器当前通过使用 [INSERT INTO SELECT](https://clickhouse.com/docs/sql-reference/statements/insert-into#inserting-the-results-of-select) 将模型物化为表。这实际上意味着如果再次执行该运行，就会产生数据重复。超大数据集（PB 级）会导致运行时间极长，使某些模型不可行。要提高性能，请通过将视图实现为 `materialized: materialization_view` 来使用 ClickHouse materialized view。此外，应尽量通过在可能的情况下使用 `GROUP BY` 来减少任何查询返回的行数。优先选择汇总数据的模型，而不是仅在保持源行数不变的情况下对数据进行转换的模型。
- 若要使用 Distributed 表来表示模型，必须在每个节点上手动创建底层的 Replicated 表。然后可以在这些表之上创建 Distributed 表。适配器不会管理集群的创建。
- 当 dbt 在数据库中创建一个关系（表/VIEW）时，通常会将其创建为：`{{ database }}.{{ schema }}.{{ table/view id }}`。ClickHouse 中不存在 schema 的概念。因此适配器使用 `{{schema}}.{{ table/view id }}`，其中 `schema` 即 ClickHouse 数据库。
- 如果在 ClickHouse INSERT 语句中的 `INSERT INTO` 之前放置，ephemeral 模型/CTE 将无法工作，参见 https://github.com/ClickHouse/ClickHouse/issues/30323。这对大多数模型不应产生影响，但在模型定义和其他 SQL 语句中放置 ephemeral 模型时需要加以注意。 <!-- TODO review this limitation, looks like the issue was already closed and the fix was introduced in 24.10 -->

## Fivetran {#fivetran}

`dbt-clickhouse` 连接器也可用于 [Fivetran 转换](https://fivetran.com/docs/transformations/dbt)，从而在 Fivetran 平台内直接通过 `dbt` 实现无缝的数据集成和转换。