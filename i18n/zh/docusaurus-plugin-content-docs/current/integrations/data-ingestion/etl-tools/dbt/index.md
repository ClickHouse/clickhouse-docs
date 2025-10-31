---
'sidebar_label': '概述'
'slug': '/integrations/dbt'
'sidebar_position': 1
'description': '用户可以使用 dbt 在 ClickHouse 中转换和建模他们的数据'
'title': '将 dbt 与 ClickHouse 集成'
'doc_type': 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 集成 dbt 和 ClickHouse {#integrate-dbt-clickhouse}

<ClickHouseSupportedBadge/>

## dbt-clickhouse 适配器 {#dbt-clickhouse-adapter}
**dbt** (数据构建工具) 使分析工程师能够通过简单地编写 SELECT 语句来转换他们的数据仓库中的数据。 dbt 处理将这些 SELECT 语句物化为数据库中的对象，形成表和视图 - 执行 [提取、加载和转换 (ELT)](https://en.wikipedia.org/wiki/Extract,_load,_transform) 中的转换部分。用户可以创建一个由 SELECT 语句定义的模型。

在 dbt 中，这些模型可以相互引用和分层，以允许构建更高级的概念。连接模型所需的样板 SQL 会自动生成。此外，dbt 识别模型之间的依赖关系，并利用有向无环图 (DAG) 确保它们按适当的顺序创建。

dbt 通过一个 [ClickHouse 支持的适配器](https://github.com/ClickHouse/dbt-clickhouse) 与 ClickHouse 兼容。我们将通过基于公开可用的 IMDB 数据集的简单示例描述将 ClickHouse 连接的过程。我们还强调当前连接器的一些限制。

<TOCInline toc={toc}  maxHeadingLevel={2} />

## 支持的特性 {#supported-features}

**支持的特性**
- [x] 表物化
- [x] 视图物化
- [x] 增量物化
- [x] 微批增量物化
- [x] 物化视图物化 (使用 `TO` 形式的 MATERIALIZED VIEW，实验性)
- [x] 种子
- [x] 源
- [x] 文档生成
- [x] 测试
- [x] 快照
- [x] 大多数 dbt-utils 宏 (现已包含在 dbt-core 中)
- [x] 瞬态物化
- [x] 分布式表物化 (实验性)
- [x] 分布式增量物化 (实验性)
- [x] 合同

## 概念 {#concepts}

dbt 引入了模型的概念。这被定义为一个 SQL 语句，可能会连接多个表。模型可以通过多种方式“物化”。物化代表了模型选择查询的构建策略。物化背后的代码是样板 SQL，它将你的 SELECT 查询封装在一个语句中，以创建或更新现有关系。

dbt 提供 4 种类型的物化：

* **视图** (默认)：模型在数据库中作为视图构建。
* **表**：模型在数据库中作为表构建。
* **瞬态**：模型不会直接在数据库中构建，而是作为公共表表达式拉入依赖模型中。
* **增量**：模型最初作为表物化，在后续运行中，dbt 将新行插入并更新表中更改的行。

附加的语法和子句定义了如果其基础数据发生变化，这些模型应该如何更新。dbt 通常建议从视图物化开始，直到性能成为问题。表物化通过将模型查询的结果捕获为表，从而提供查询时间的性能提升，但以增加存储为代价。增量方法进一步建立在此基础上，以允许后续更新基础数据捕获在目标表中。

当前的适配器支持 **物化视图**、**字典**、**分布式表** 和 **分布式增量** 物化。适配器还支持 dbt[快照](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy) 和 [种子](https://docs.getdbt.com/docs/building-a-dbt-project/seeds)。

### 关于支持的物化的详细信息 {#details-about-supported-materializations}

| 类型                         | 支持?   | 详细信息                                                                                                                          |
|------------------------------|----------|----------------------------------------------------------------------------------------------------------------------------------|
| 视图物化                    | 是      | 创建一个 [视图](https://clickhouse.com/docs/en/sql-reference/table-functions/view/)。                                            |
| 表物化                      | 是      | 创建一个 [表](https://clickhouse.com/docs/en/operations/system-tables/tables/)。请参阅下面支持的引擎列表。                     |
| 增量物化                    | 是      | 创建一个表（如果它不存在），然后仅向其中写入更新。                                                                               |
| 瞬态物化                    | 是      | 创建一个瞬态/CTE 物化。该模型在 dbt 内部，不会创建任何数据库对象。                                                             |

以下是 ClickHouse 中的 [实验性特性](https://clickhouse.com/docs/en/beta-and-experimental-features) :

| 类型                                   | 支持?         | 详细信息                                                                                                                                                                                                                                       |
|----------------------------------------|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 物化视图物化                          | 是，实验性    | 创建一个 [物化视图](https://clickhouse.com/docs/en/materialized-view)。                                                                                                                                                                       |
| 分布式表物化                          | 是，实验性    | 创建一个 [分布式表](https://clickhouse.com/docs/en/engines/table-engines/special/distributed)。                                                                                                                                             |
| 分布式增量物化                        | 是，实验性    | 基于与分布式表相同思想的增量模型。请注意，并不是所有策略都受支持，访问 [此处](https://github.com/ClickHouse/dbt-clickhouse?tab=readme-ov-file#distributed-incremental-materialization) 以获取更多信息。                                 |
| 字典物化                              | 是，实验性    | 创建一个 [字典](https://clickhouse.com/docs/en/engines/table-engines/special/dictionary)。                                                                                                                                                   |

## dbt 和 ClickHouse 适配器的设置 {#setup-of-dbt-and-the-clickhouse-adapter}

### 安装 dbt-core 和 dbt-clickhouse {#install-dbt-core-and-dbt-clickhouse}

```sh
pip install dbt-clickhouse
```

### 提供 dbt 与我们的 ClickHouse 实例的连接详细信息。 {#provide-dbt-with-the-connection-details-for-our-clickhouse-instance}
在 `~/.dbt/profiles.yml` 文件中配置 `clickhouse` 配置文件，并提供用户、密码、模式主机属性。连接配置选项的完整列表可在 [功能和配置](/integrations/dbt/features-and-configurations) 页面中查找：
```yaml
clickhouse:
  target: dev
  outputs:
    dev:
      type: clickhouse
      schema: <target_schema>
      host: <host>
      port: 8443 # use 9440 for native
      user: default
      password: <password>
      secure: True
```

### 创建 dbt 项目 {#create-a-dbt-project}

```sh
dbt init project_name
```

在 `project_name` 目录中，更新你的 `dbt_project.yml` 文件以指定一个配置文件名称，以连接到 ClickHouse 服务器。

```yaml
profile: 'clickhouse'
```

### 测试连接 {#test-connection}
使用 CLI 工具执行 `dbt debug` 以确认 dbt 是否能够连接到 ClickHouse。确认响应包括 `Connection test: [OK connection ok]`，表示连接成功。

我们假设以下示例使用 dbt CLI。此适配器仍然不可用于 [dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview) 内部使用，但我们预计很快就会提供。请联系支持以获取更多信息。

dbt 提供了许多 CLI 安装选项。按照 [这里](https://docs.getdbt.com/dbt-cli/install/overview) 的说明进行操作。此时仅安装 dbt-core。我们建议使用 `pip` 安装 dbt 和 dbt-clickhouse。

```bash
pip install dbt-clickhouse
```

访问 [指南页面](/integrations/dbt/guides)，了解有关如何将 dbt 与 ClickHouse 一起使用的更多信息。

## 连接故障排除 {#troubleshooting-connections}

如果您在从 dbt 连接到 ClickHouse 时遇到问题，请确保满足以下标准：

- 引擎必须是 [支持的引擎](/integrations/dbt/features-and-configurations#supported-table-engines) 之一。
- 您必须具有足够的权限访问数据库。
- 如果您没有使用数据库的默认表引擎，则必须在模型配置中指定一个表引擎。

## 限制 {#limitations}

当前的 ClickHouse 适配器对 dbt 有几个限制，用户应注意：

1. 适配器目前使用 `INSERT TO SELECT` 将模型物化为表。这实际上意味着数据重复。非常大的数据集 (PB) 可能导致运行时间极长，使某些模型不可行。尽量减少任何查询返回的行数，尽可能利用 GROUP BY。倾向于总结数据的模型，而不是简单执行转换，同时保持源的数据行数。
2. 要使用分布式表表示模型，用户必须手动在每个节点上创建基础的复制表。分布式表可以在这些基础上创建。适配器不管理集群创建。
3. 当 dbt 在数据库中创建关系（表/视图）时，它通常创建为：`{{ database }}.{{ schema }}.{{ table/view id }}`。ClickHouse 没有模式的概念。因此，适配器使用 `{{schema}}.{{ table/view id }}`，其中 `schema` 是 ClickHouse 数据库。
4. 瞬态模型/CTE 在 ClickHouse 插入语句中的 `INSERT INTO` 之前放置时不起作用，详见 https://github.com/ClickHouse/ClickHouse/issues/30323。这不应影响大多数模型，但在模型定义和其他 SQL 语句中放置瞬态模型时应谨慎。

进一步信息

之前的指南仅触及了 dbt 功能的表面。建议用户阅读优秀的 [dbt 文档](https://docs.getdbt.com/docs/introduction)。

有关适配器的其他配置，请参见 [这里](https://github.com/silentsokolov/dbt-clickhouse#model-configuration)。

## Fivetran {#fivetran}

`dbt-clickhouse` 连接器也可用于 [Fivetran 转换](https://fivetran.com/docs/transformations/dbt)，允许在 Fivetran 平台中直接使用 `dbt` 进行无缝集成和转换功能。
