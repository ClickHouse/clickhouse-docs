---
sidebar_label: '概述'
slug: /integrations/dbt
sidebar_position: 1
description: '您可以使用 dbt 在 ClickHouse 中对数据进行转换和建模'
title: '将 dbt 与 ClickHouse 集成'
keywords: ['dbt', '数据转换', '分析工程', 'SQL 建模', 'ELT 管道']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_integration'
  - website: 'https://github.com/ClickHouse/dbt-clickhouse'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 集成 dbt 与 ClickHouse \\{#integrate-dbt-clickhouse\\}

<ClickHouseSupportedBadge/>

## dbt-clickhouse 适配器 \\{#dbt-clickhouse-adapter\\}

**dbt**（data build tool）使分析工程师能够仅通过编写 SELECT 语句来转换其数据仓库中的数据。dbt 负责将这些 SELECT 语句物化为数据库中的对象（以表和视图的形式）——执行 [Extract Load and Transform (ELT)](https://en.wikipedia.org/wiki/Extract,_load,_transform) 中的 T。你可以创建由一个 SELECT 语句定义的模型。

在 dbt 中，这些模型可以相互交叉引用并分层，从而构建更高层级的概念。连接这些模型所需的样板 SQL 代码会被自动生成。此外，dbt 会识别模型之间的依赖关系，并使用有向无环图（DAG）确保它们按合适的顺序被创建。

dbt 可以通过一个由 ClickHouse 官方支持的适配器与 ClickHouse 集成：[dbt-clickhouse](https://github.com/ClickHouse/dbt-clickhouse)。

<TOCInline toc={toc}  maxHeadingLevel={2} />

## 支持的功能 \\{#supported-features\\}

支持的功能列表：

- [x] Table materialization
- [x] View materialization
- [x] Incremental materialization
- [x] Microbatch incremental materialization
- [x] Materialized View materializations（使用 `TO` 形式的 MATERIALIZED VIEW，实验性）
- [x] Seeds
- [x] Sources
- [x] Docs generate
- [x] Tests
- [x] Snapshots
- [x] 大多数 dbt-utils 宏（现已包含在 dbt-core 中）
- [x] Ephemeral materialization
- [x] Distributed table materialization（实验性）
- [x] Distributed incremental materialization（实验性）
- [x] Contracts
- [x] ClickHouse 特有的列配置（Codec、TTL 等）
- [x] ClickHouse 特有的表设置（索引、投影等）

已支持截至 dbt-core 1.10 的所有功能，包括 `--sample` 参数，并且为未来版本准备的所有弃用警告也都已修复。dbt 1.10 中引入的 **Catalog 集成**（例如 Iceberg）在当前适配器中尚未获得原生支持，但可以通过变通方案实现。详情参见 [Catalog 支持章节](/integrations/dbt/features-and-configurations#catalog-support)。

该适配器目前仍无法在 [dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview) 中使用，但我们预计很快会提供支持。请联系支持团队以获取更多相关信息。

## dbt 概念和支持的物化方式 \\{#concepts-and-supported-materializations\\}

dbt 引入了 model 的概念。它被定义为一条 SQL 语句，可能会关联多张表。一个 model 可以通过多种方式进行“物化”。物化表示该 model 的 SELECT 查询的构建策略。物化背后的代码是样板 SQL 代码，它会将你的 SELECT 查询包装在一条语句中，以便创建新的关系对象或更新已有的关系对象。

dbt 提供 5 种物化方式，`dbt-clickhouse` 全部支持：

* **view**（默认）：model 在数据库中以 view 的形式构建。在 ClickHouse 中，它会构建为一个 [view](/sql-reference/statements/create/view)。
* **table**：model 在数据库中以表的形式构建。在 ClickHouse 中，它会构建为一张 [table](/sql-reference/statements/create/table)。
* **ephemeral**：model 不会直接在数据库中构建，而是作为 CTE（Common Table Expressions，公用表表达式）被内联进依赖它的其他 model 中。
* **incremental**：model 起初会以表的形式物化，在后续运行中，dbt 会向该表插入新增行并更新发生变化的行。
* **materialized view**：model 在数据库中构建为 materialized view。在 ClickHouse 中，它会构建为一个 [materialized view](/sql-reference/statements/create/view#materialized-view)。

还可以通过额外的语法和子句来定义当底层数据发生变化时，这些 model 应如何更新。dbt 一般建议先从 view 物化开始使用，直到性能成为瓶颈。table 物化通过将 model 查询的结果保存为一张表，在增加存储开销的前提下，提供了查询时的性能提升。incremental 方式在此基础上进一步扩展，使得对底层数据的后续更新可以被捕获到目标表中。

当前用于 ClickHouse 的[适配器](https://github.com/silentsokolov/dbt-clickhouse)还额外支持 **dictionary**、**distributed table** 和 **distributed incremental** 物化方式。该适配器还支持 dbt 的 [snapshots](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy) 和 [seeds](https://docs.getdbt.com/docs/building-a-dbt-project/seeds)。

以下是在 `dbt-clickhouse` 中的[实验特性](https://clickhouse.com/docs/en/beta-and-experimental-features)：

| 类型                                    | 是否支持              | 详情                                                                                                                                                                                                                                             |
|-----------------------------------------|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Materialized View 物化                  | YES，Experimental     | 创建一个 [materialized view](https://clickhouse.com/docs/en/materialized-view)。                                                                                                                                                                |
| Distributed table 物化                  | YES，Experimental     | 创建一个 [distributed table](https://clickhouse.com/docs/en/engines/table-engines/special/distributed)。                                                                                                                                        |
| Distributed incremental 物化            | YES，Experimental     | 基于与 distributed table 相同理念的 incremental model。请注意，并非所有策略都受支持，更多信息请参见[此处](https://github.com/ClickHouse/dbt-clickhouse?tab=readme-ov-file#distributed-incremental-materialization)。 |
| Dictionary 物化                         | YES，Experimental     | 创建一个 [dictionary](https://clickhouse.com/docs/en/engines/table-engines/special/dictionary)。                                                                                                                                                |

## dbt 和 ClickHouse 适配器的设置 \\{#setup-of-dbt-and-the-clickhouse-adapter\\}

### 安装 dbt-core 和 dbt-clickhouse \{#install-dbt-core-and-dbt-clickhouse\}

dbt 提供了多种安装命令行界面（CLI）的方法，详细说明参见[此处](https://docs.getdbt.com/dbt-cli/install/overview)。我们建议使用 `pip` 同时安装 dbt 和 dbt-clickhouse。

```sh
pip install dbt-core dbt-clickhouse
```


### 为 dbt 提供 ClickHouse 实例的连接信息。 \{#provide-dbt-with-the-connection-details-for-our-clickhouse-instance\}

在 `~/.dbt/profiles.yml` 文件中配置名为 `clickhouse-service` 的 profile，并填写 schema、host、port、user 和 password 属性。完整的连接配置选项列表请参见 [功能和配置](/integrations/dbt/features-and-configurations) 页面：

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


### 创建一个 dbt 项目 \{#create-a-dbt-project\}

你现在可以在现有项目中使用该 profile，或者使用以下命令创建一个新项目：

```sh
dbt init project_name
```

在 `project_name` 目录下，更新你的 `dbt_project.yml` 文件，配置用于连接 ClickHouse 服务器的 profile 名称。

```yaml
profile: 'clickhouse-service'
```


### 测试连接 \\{#test-connection\\}

使用 CLI 工具执行 `dbt debug`，以确认 dbt 是否能够连接到 ClickHouse。请确认响应中包含 `Connection test: [OK connection ok]`，这表示连接成功。

前往 [指南页面](/integrations/dbt/guides) 以了解更多关于如何将 dbt 与 ClickHouse 结合使用的信息。

### 测试和部署你的模型（CI/CD） \\{#testing-and-deploying-your-models-ci-cd\\}

有许多方式可以测试和部署你的 dbt 项目。dbt 提供了一些关于[工作流最佳实践](https://docs.getdbt.com/best-practices/best-practice-workflows#pro-tips-for-workflows)和 [CI 任务](https://docs.getdbt.com/docs/deploy/ci-jobs)的建议。我们将讨论若干策略，但请记住，这些策略可能需要进行较大幅度的调整，以适应你的具体使用场景。

#### 使用简单数据测试和单元测试的 CI/CD \\{#ci-with-simple-data-tests-and-unit-tests\\}

一种快速启动 CI 流水线的简单方式，是在 CI 任务中运行一个 ClickHouse 集群，然后在该集群上运行你的模型。在运行模型之前，你可以先向这个集群插入演示数据。你也可以直接使用一个 [seed](https://docs.getdbt.com/reference/commands/seed)，将生产数据的一个子集填充到预发布（staging）环境中。

数据插入完成后，你就可以运行你的 [data tests](https://docs.getdbt.com/docs/build/data-tests) 和 [unit tests](https://docs.getdbt.com/docs/build/unit-tests)。

你的 CD 步骤可以简单到只需在生产 ClickHouse 集群上运行 `dbt build`。

#### 更完善的 CI/CD 阶段：使用最新数据，仅测试受影响的模型 \\{#more-complete-ci-stage\\}

一种常见策略是使用 [Slim CI](https://docs.getdbt.com/best-practices/best-practice-workflows#run-only-modified-models-to-test-changes-slim-ci) 任务，仅重新部署被修改的模型（以及其上游和下游依赖）。这种方法利用生产运行产生的工件（即 [dbt manifest](https://docs.getdbt.com/reference/artifacts/manifest-json)），以缩短项目的运行时间，并确保各环境之间不存在 schema 漂移。

为了保持开发环境同步，并避免在过期部署上运行模型，你可以使用 [clone](https://docs.getdbt.com/reference/commands/clone) 甚至 [defer](https://docs.getdbt.com/reference/node-selection/defer)。

我们建议为测试环境（即 staging 环境）使用一个独立的 ClickHouse 集群或服务，以避免影响生产环境的运行。为了确保测试环境具有代表性，重要的是要使用生产数据的一个子集，并以能够防止环境间 schema 漂移的方式运行 dbt。

- 如果你不需要针对最新数据进行测试，可以将生产数据的备份恢复到 staging 环境中。
- 如果你需要针对最新数据进行测试，可以组合使用 [`remoteSecure()` table function](/sql-reference/table-functions/remote) 和可刷新materialized view，以按所需频率插入数据。另一种选择是使用对象存储作为中间存储，从生产服务中周期性写入数据，然后使用对象存储 table function 或 ClickPipes（用于持续摄取）将其导入 staging 环境。

为 CI 测试使用专用环境还允许你进行手动测试，而不会影响生产环境。例如，你可能希望将某个 BI 工具指向该环境进行测试。

对于部署（即 CD 步骤），我们建议使用生产部署生成的工件，仅更新已发生变化的模型。这需要将对象存储（例如 S3）配置为 dbt 工件的中间存储。完成配置后，你就可以运行诸如 `dbt build --select state:modified+ --state path/to/last/deploy/state.json` 之类的命令，根据自上次在生产环境运行以来发生的更改，有选择地重建所需的最少模型集合。

## 常见问题排查 \\{#troubleshooting-common-issues\\}

### 连接 \\{#troubleshooting-connections\\}

如果在使用 dbt 连接 ClickHouse 时遇到问题，请确保满足以下条件：

- 引擎必须是[受支持的引擎](/integrations/dbt/features-and-configurations#supported-table-engines)之一。
- 必须具备足够的权限才能访问该数据库。
- 如果未使用数据库的默认表引擎，则必须在模型配置中显式指定表引擎。

### 理解长耗时操作 \\{#understanding-long-running-operations\\}

某些操作可能会因为特定的 ClickHouse 查询而比预期花费更长时间。要更深入了解哪些查询耗时较长，可以将 [log level](https://docs.getdbt.com/reference/global-configs/logs#log-level) 设置为 `debug`——这样会输出每个查询所消耗的时间。比如，可以通过在 dbt 命令中追加 `--log-level debug` 来实现。

## 限制 \\{#limitations\\}

当前用于 dbt 的 ClickHouse 适配器存在若干限制，需要加以注意：

- 该插件使用的语法要求 ClickHouse 版本为 25.3 或更高版本。我们不对更旧版本的 ClickHouse 进行测试，目前也不对 Replicated 表进行测试。
- 如果 `dbt-adapter` 在同一时间被多次运行，这些运行之间可能发生冲突，因为在内部它们可能会在执行相同操作时使用相同的表名。更多信息请参见问题 [#420](https://github.com/ClickHouse/dbt-clickhouse/issues/420)。
- 适配器当前会使用 [INSERT INTO SELECT](https://clickhouse.com/docs/sql-reference/statements/insert-into#inserting-the-results-of-select) 将模型物化为表。这实际上意味着如果再次执行该 run，就会产生数据重复。非常大的数据集（PB 级）可能导致运行时间极长，从而使某些模型不再可行。为提升性能，请通过将视图实现为 `materialized: materialization_view` 来使用 ClickHouse materialized view。此外，应尽量通过在可能的情况下使用 `GROUP BY` 来减少任何查询返回的行数。应优先选择对数据进行汇总的模型，而不是仅在保持源数据行数不变的情况下对数据进行转换的模型。
- 若要使用分布式表来表示模型，必须在每个节点上手动创建底层的 Replicated 表。随后可以在这些表之上创建分布式表。适配器不会管理集群创建。
- 当 dbt 在数据库中创建一个关系（表/视图）时，通常会按如下方式创建：`{{ database }}.{{ schema }}.{{ table/view id }}`。ClickHouse 中没有 schema 的概念。因此适配器使用 `{{schema}}.{{ table/view id }}`，其中 `schema` 为 ClickHouse 数据库。
- 如果在 ClickHouse 的 `INSERT INTO` 语句中，将 ephemeral 模型/CTE 放在 `INSERT INTO` 之前，则它们不会生效，参见 https://github.com/ClickHouse/ClickHouse/issues/30323。该问题对大多数模型不应产生影响，但在模型定义和其他 SQL 语句中放置 ephemeral 模型时需要注意。 <!-- TODO 审查此限制，看起来该 issue 已经关闭且修复已在 24.10 中引入 -->

## Fivetran \\{#fivetran\\}

`dbt-clickhouse` 连接器也可用于 [Fivetran 转换](https://fivetran.com/docs/transformations/dbt)，从而在 Fivetran 平台中直接配合 `dbt` 使用，实现无缝集成与数据转换功能。