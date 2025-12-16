---
sidebar_label: '概览'
slug: /integrations/dbt
sidebar_position: 1
description: '用户可以使用 dbt 在 ClickHouse 中对其数据进行转换和建模'
title: '集成 dbt 和 ClickHouse'
keywords: ['dbt', '数据转换', '分析工程', 'SQL 建模', 'ELT 流水线']
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

**dbt**（data build tool）让分析工程师只需编写 `SELECT` 语句即可对数据仓库中的数据进行转换。dbt 负责将这些 `SELECT` 语句物化为数据库中的表和视图对象——执行 [Extract Load and Transform (ELT)](https://en.wikipedia.org/wiki/Extract,_load,_transform) 流程中的 T（Transform）。用户可以通过一个 `SELECT` 语句来定义模型。

在 dbt 中，这些模型可以相互引用并分层，从而构建更高层次的概念。用于连接模型的样板 SQL 会被自动生成。此外，dbt 会识别模型之间的依赖关系，并利用有向无环图（DAG）确保按合适的顺序创建它们。

dbt 通过一个 ClickHouse 官方适配器与 ClickHouse 集成：[dbt-clickhouse](https://github.com/ClickHouse/dbt-clickhouse)。

<TOCInline toc={toc}  maxHeadingLevel={2} />

## 支持的特性 {#supported-features}

支持的特性列表：
- [x] 表物化
- [x] 视图物化
- [x] 增量物化
- [x] 微批增量物化
- [x] 物化视图物化（使用 `TO` 形式的 MATERIALIZED VIEW，实验性）
- [x] 种子（seeds）
- [x] 数据源（sources）
- [x] 文档生成（docs generate）
- [x] 测试（tests）
- [x] 快照（snapshots）
- [x] 大多数 dbt-utils 宏（现已包含在 dbt-core 中）
- [x] 临时物化（ephemeral materialization）
- [x] 分布式表物化（实验性）
- [x] 分布式增量物化（实验性）
- [x] 契约（contracts）
- [x] ClickHouse 特定列配置（Codec、TTL 等）
- [x] ClickHouse 特定表设置（索引、projections 等）

目前已支持截至 dbt-core 1.10 的所有特性，包括 `--sample` 标志，并且已修复所有弃用警告，为未来版本做好准备。dbt 1.10 中引入的 **Catalog 集成**（例如 Iceberg）在该适配器中尚未得到原生支持，但可以通过变通方案使用。详情请参阅 [Catalog 支持部分](/integrations/dbt/features-and-configurations#catalog-support)。

该适配器目前尚不能在 [dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview) 中使用，但我们预计很快会提供支持。若需要更多信息，请联系支持团队。

## dbt 概念与支持的物化方式 {#concepts-and-supported-materializations}

dbt 引入了 model（模型）的概念。它被定义为一条 SQL 语句，可能会关联多张表。一个 model 可以通过多种方式被“物化”（materialized）。物化方式表示该模型的 SELECT 查询的构建策略。物化方式背后的代码是一段样板 SQL，它会将你的 SELECT 查询包装在一个语句中，用于创建一个新的关系或更新已有的关系。

dbt 提供了 5 种物化方式，它们都受 `dbt-clickhouse` 支持：

* **view**（默认）：model 在数据库中以 view 的形式构建。在 ClickHouse 中会构建为一个 [view](/sql-reference/statements/create/view)。
* **table**：model 在数据库中以 table 的形式构建。在 ClickHouse 中会构建为一张 [table](/sql-reference/statements/create/table)。
* **ephemeral**：model 不会直接在数据库中构建，而是作为 CTE（Common Table Expressions，公用表表达式）被内联到依赖它的其他 model 中。
* **incremental**：model 最初会以 table 的形式物化，在后续运行中，dbt 会向该表插入新的行并更新有变更的行。
* **materialized view**：model 在数据库中会以 materialized view 的形式构建。在 ClickHouse 中会构建为一个 [materialized view](/sql-reference/statements/create/view#materialized-view)。

还可以通过额外的语法和子句来定义当底层数据发生变化时，应该如何更新这些 model。dbt 通常建议先使用 view 物化方式，直到性能成为问题为止。table 物化方式通过将模型查询的结果捕获为一张表，提升了查询时的性能，但以增加存储开销为代价。incremental 方式在此基础上更进一步，使后续对底层数据的更新能够被写入目标表中。

适用于 ClickHouse 的当前[适配器](https://github.com/silentsokolov/dbt-clickhouse)还支持 **dictionary**、**distributed table** 和 **distributed incremental** 物化方式。该适配器同样支持 dbt 的 [snapshots](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy) 和 [seeds](https://docs.getdbt.com/docs/building-a-dbt-project/seeds)。

以下内容在 `dbt-clickhouse` 中属于[实验性特性](https://clickhouse.com/docs/en/beta-and-experimental-features)：

| 类型                                     | 是否支持          | 详情                                                                                                                                                                                                                                            |
|------------------------------------------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Materialized View 物化方式               | YES, Experimental | 创建一个 [materialized view（物化视图）](https://clickhouse.com/docs/en/materialized-view)。                                                                                                             |
| Distributed table 物化方式               | YES, Experimental | 创建一张 [distributed table](https://clickhouse.com/docs/en/engines/table-engines/special/distributed)。                                                                                                |
| Distributed incremental 物化方式         | YES, Experimental | 基于与 distributed table 相同思路的增量模型。请注意并非所有策略都受支持，更多信息请访问[此处](https://github.com/ClickHouse/dbt-clickhouse?tab=readme-ov-file#distributed-incremental-materialization)。 |
| Dictionary 物化方式                      | YES, Experimental | 创建一个 [dictionary](https://clickhouse.com/docs/en/engines/table-engines/special/dictionary)。                                                                                                         |

## 配置 dbt 和 ClickHouse 适配器 {#setup-of-dbt-and-the-clickhouse-adapter}

### 安装 dbt-core 和 dbt-clickhouse {#install-dbt-core-and-dbt-clickhouse}

dbt 提供了多种安装命令行界面（CLI）的方法，详细说明见 [此处](https://docs.getdbt.com/dbt-cli/install/overview)。我们建议使用 `pip` 安装 dbt 和 dbt-clickhouse。

```sh
pip install dbt-core dbt-clickhouse
```


### 为 dbt 提供 ClickHouse 实例的连接详细信息。 {#provide-dbt-with-the-connection-details-for-our-clickhouse-instance}

在 `~/.dbt/profiles.yml` 文件中配置名为 `clickhouse-service` 的 profile，并提供 schema、host、port、user 和 password 属性。完整的连接配置选项列表请参见 [功能与配置](/integrations/dbt/features-and-configurations) 页面：

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


### 创建 dbt 项目 {#create-a-dbt-project}

现在你可以在现有项目中使用此 profile，或使用以下命令创建新项目：

```sh
dbt init project_name
```

在 `project_name` 目录中，更新 `dbt_project.yml` 文件，指定用于连接到 ClickHouse 服务器的 profile 名称。

```yaml
profile: 'clickhouse-service'
```


### 测试连接 {#test-connection}

使用 CLI 工具执行 `dbt debug`，以确认 dbt 是否能够连接到 ClickHouse。确认输出中包含 `Connection test: [OK connection ok]`，这表示连接成功。

前往[指南页面](/integrations/dbt/guides)以了解更多关于如何在 ClickHouse 中使用 dbt 的信息。

### 测试和部署你的模型（CI/CD） {#testing-and-deploying-your-models-ci-cd}

有多种方式可以测试和部署你的 dbt 项目。dbt 提供了一些关于[最佳实践工作流](https://docs.getdbt.com/best-practices/best-practice-workflows#pro-tips-for-workflows)和[CI 作业](https://docs.getdbt.com/docs/deploy/ci-jobs)的建议。我们将讨论几种策略，但请记住，这些策略可能需要进行较大幅度的调整以适配你的具体用例。

#### 使用简单数据测试和单元测试的 CI/CD {#ci-with-simple-data-tests-and-unit-tests}

启动 CI 流水线的一种简单方式，是在作业内部运行一个 ClickHouse 集群，然后在其上运行你的模型。在运行模型之前，你可以向该集群插入演示数据。你可以直接使用一个 [seed](https://docs.getdbt.com/reference/commands/seed) 来用生产数据的一个子集填充暂存环境（staging 环境）。

数据插入完成后，你就可以运行你的[数据测试](https://docs.getdbt.com/docs/build/data-tests)和[单元测试](https://docs.getdbt.com/docs/build/unit-tests)。

你的 CD 步骤可以非常简单，只需针对生产 ClickHouse 集群运行 `dbt build` 即可。

#### 更完善的 CI/CD 阶段：使用最新数据，仅测试受影响的模型 {#more-complete-ci-stage}

一种常见策略是使用 [Slim CI](https://docs.getdbt.com/best-practices/best-practice-workflows#run-only-modified-models-to-test-changes-slim-ci) 作业，仅重新部署已修改的模型（以及其上下游依赖）。该方法使用来自生产运行的工件（即 [dbt manifest](https://docs.getdbt.com/reference/artifacts/manifest-json)）来缩短项目的运行时间，并确保各环境之间不会发生 schema 漂移。

为了使各开发环境保持同步，并避免在过时的部署上运行模型，你可以使用 [clone](https://docs.getdbt.com/reference/commands/clone) 或者 [defer](https://docs.getdbt.com/reference/node-selection/defer)。

我们建议在测试环境（即预发布环境）中使用独立的 ClickHouse 集群或服务，以避免影响生产环境的运行。为了确保测试环境具备代表性，重要的是要使用生产数据的一个子集，并以能够避免不同环境之间 schema 漂移的方式运行 dbt。

- 如果你在测试时不需要最新数据，可以将生产数据的备份恢复到预发布环境中。
- 如果你在测试时需要最新数据，可以结合使用 [`remoteSecure()` 表函数](/sql-reference/table-functions/remote) 和可刷新物化视图，以所需频率插入数据。另一种做法是使用对象存储作为中间存储，定期从生产服务写入数据，然后通过对象存储表函数或 ClickPipes（用于持续摄取）将其导入预发布环境。

为 CI 测试使用独立环境还可以让你在不影响生产环境的情况下执行手动测试。例如，你可能希望将某个 BI 工具指向该环境进行测试。

对于部署（即 CD 步骤），我们建议使用生产部署生成的工件，仅更新已发生变更的模型。这需要将对象存储（例如 S3）配置为 dbt 工件的中间存储。一旦完成配置，你就可以运行类似 `dbt build --select state:modified+ --state path/to/last/deploy/state.json` 的命令，根据自上次在生产环境运行以来的变更，有选择地重建数量最少的必要模型。

## 排查常见问题 {#troubleshooting-common-issues}

### 连接问题 {#troubleshooting-connections}

如果你在使用 dbt 连接 ClickHouse 时遇到问题，请确保满足以下条件：

- 引擎必须是[受支持的引擎](/integrations/dbt/features-and-configurations#supported-table-engines)之一。
- 你必须拥有访问该数据库的足够权限。
- 如果未使用该数据库的默认表引擎，则必须在模型配置中显式指定表引擎。

### 了解长时间运行的操作 {#understanding-long-running-operations}

某些操作可能由于特定的 ClickHouse 查询而比预期花费更长时间。要进一步了解哪些查询耗时较长，可以将[日志级别](https://docs.getdbt.com/reference/global-configs/logs#log-level)设置为 `debug`——这会输出每个查询的耗时。例如，可以在 dbt 命令后追加 `--log-level debug` 来实现这一点。

## 限制 {#limitations}

当前用于 dbt 的 ClickHouse 适配器存在若干限制，用户需要注意：

- 该插件使用的语法要求 ClickHouse 版本为 25.3 或更高。我们不对更早版本的 ClickHouse 进行测试，目前也不对 Replicated 表进行测试。
- 如果在同一时间运行多个 `dbt-adapter` 任务，它们可能会发生冲突，因为在内部它们可能会对相同操作使用相同的表名。更多信息请参见 issue [#420](https://github.com/ClickHouse/dbt-clickhouse/issues/420)。
- 该适配器目前通过 [INSERT INTO SELECT](https://clickhouse.com/docs/sql-reference/statements/insert-into#inserting-the-results-of-select) 将模型物化为表。这在实际效果上意味着，如果再次执行同一任务，会导致数据重复。对于极其庞大的数据集（PB 级），可能会导致运行时间非常长，使某些模型不再可行。为了提升性能，请通过将视图实现为 `materialized: materialization_view` 来使用 ClickHouse 物化视图。此外，应尽可能通过使用 `GROUP BY` 来减少任意查询返回的行数。优先选择汇总数据的模型，而不是仅做转换但保持与源数据相同行数的模型。
- 若要使用 Distributed 表来表示模型，用户必须在每个节点上手动创建其底层的 replicated 表。然后可以在这些表之上创建 Distributed 表。适配器不负责管理集群创建。
- 当 dbt 在数据库中创建一个关系（表/视图）时，通常会以 `{{ database }}.{{ schema }}.{{ table/view id }}` 的形式创建。ClickHouse 没有 schema 的概念，因此适配器会使用 `{{schema}}.{{ table/view id }}`，其中 `schema` 对应 ClickHouse 中的数据库。
- 如果在 ClickHouse 的 insert 语句中，将 ephemeral 模型/CTE 放在 `INSERT INTO` 之前，则它们无法工作，参见：https://github.com/ClickHouse/ClickHouse/issues/30323。对于大多数模型，这不应产生影响，但在定义模型以及编写其他 SQL 语句时，应谨慎放置 ephemeral 模型。 <!-- TODO 审查此限制，看起来对应的 issue 已经关闭，并且修复已在 24.10 中引入 -->

## Fivetran {#fivetran}

`dbt-clickhouse` 连接器也可用于 [Fivetran 转换](https://fivetran.com/docs/transformations/dbt)，使你能够在 Fivetran 平台内直接使用 `dbt` 实现无缝集成与转换。