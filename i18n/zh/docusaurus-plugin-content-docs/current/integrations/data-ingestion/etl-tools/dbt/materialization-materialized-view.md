---
sidebar_label: '物化: materialized_view'
slug: /integrations/dbt/materialization-materialized-view
sidebar_position: 4
description: '关于 materialized_view 物化方式的专用文档'
keywords: ['ClickHouse', 'dbt', 'materialized_view', '可刷新', 'Materialized Views', '补齐']
title: '物化: materialized_view'
doc_type: 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Materialized Views \{#materialized-views\}

<ClickHouseSupportedBadge/>

`materialized_view` 物化类型应当是对已有（源）表执行的 `SELECT` 查询。与 PostgreSQL 不同，ClickHouse 中的 materialized view 不是“静态”的（也没有对应的 REFRESH 操作）。相反，它充当一个**插入触发器**，对插入到源表中的行应用已定义的 `SELECT` 转换，并将得到的新行插入到目标表中。有关 ClickHouse 中 materialized view 工作方式的更多细节，请参阅 [ClickHouse materialized view 文档](/materialized-view)。

:::note
关于通用的物化概念和共享配置（engine、order_by、partition_by 等），请参阅 [Materializations](/integrations/dbt/materializations) 页面。
:::

## 如何管理目标表 \{#target-table-management\}

当你使用 `materialized_view` 物化方式时，dbt-clickhouse 需要同时创建一个 **materialized view** 和一个用于插入转换后数据行的 **目标表**。管理目标表有两种方式：

| Approach | Description | Status   |
|----------|-------------|----------|
| **Implicit target** | dbt-clickhouse 会在同一个模型中自动创建并管理目标表。目标表的 schema 会根据该 materialized view 的 SQL 自动推断。 | Stable   |
| **Explicit target** | 你将目标表定义为单独的 `table` 物化，并在 materialized view 模型中通过 `materialization_target_table()` 宏引用该表。该 materialized view 会带有指向该表的 `TO` 子句进行创建。此功能从 **dbt-clickhouse 版本 1.10** 开始提供。**注意**：该功能处于 beta 阶段，API 可能会根据社区反馈而调整。 | **Beta** |

你选择的方式会影响到 schema 变更、全量刷新以及多 materialized view 场景的处理方式。下文将详细介绍每种方式。

## 隐式目标的物化 \{#implicit-target\}

这是默认行为。当你定义一个 `materialized_view` 模型时，适配器将会：

1. 使用模型名称创建一个**目标表**
2. 创建一个名为 `<model_name>_mv` 的 ClickHouse **materialized view**

目标表的表结构会根据该 materialized view 的 `SELECT` 语句中的列自动推断。所有资源（目标表和 materialized view）共享同一套模型配置。

```sql
-- models/events_mv.sql
{{
    config(
        materialized='materialized_view',
        engine='SummingMergeTree()',
        order_by='(event_date, event_type)'
    )
}}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'events') }}
GROUP BY event_date, event_type
```

有关更多示例，请参见[测试文件](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py)。


### 多个 materialized view \{#multiple-materialized-views\}

ClickHouse 允许多个 materialized view 向同一个目标表写入记录。为了在 dbt-clickhouse 中通过隐式目标方式支持这一点，你可以在模型文件中构造一个 `UNION` 查询，并使用形如 `--my_mv_name:begin` 和 `--my_mv_name:end` 的注释，将每个 materialized view 的 SQL 包裹起来。

例如，下面的配置将创建两个 materialized view，它们都会向该模型的同一个目标表写入数据。这两个 materialized view 的名称将采用 `<model_name>_mv1` 和 `<model_name>_mv2` 的形式：

```sql
--mv1:begin
select a,b,c from {{ source('raw', 'table_1') }}
--mv1:end
union all
--mv2:begin
select a,b,c from {{ source('raw', 'table_2') }}
--mv2:end
```

> 重要！
>
> 当更新包含多个 materialized view（MV）的模型时，尤其是在重命名某个 MV 时，
> dbt-clickhouse 不会自动删除旧的 MV。相反，
> 您会看到如下警告：
> `Warning - Table <previous table name> was detected with the same pattern as model name <your model name> but was not found in this run. In case it is a renamed mv that was previously part of this model, drop it manually (!!!) `


### 如何迭代目标表的 schema \{#how-to-iterate-the-target-table-schema\}

从 **dbt-clickhouse 1.9.8 版本** 开始，当 `dbt run` 在物化视图的 SQL 中遇到不同的列时，可以控制目标表 schema 的迭代方式。

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    on_schema_change='fail'  # this setting
)}}
```

默认情况下，dbt 不会对目标表应用任何更改（设置为 `ignore`），但你可以更改此设置，使其表现出与[incremental models](https://docs.getdbt.com/docs/build/incremental-models#what-if-the-columns-of-my-incremental-model-change)中的 `on_schema_change` 配置相同的行为。

此外，你可以将此设置用作一种安全机制。如果将其设置为 `fail`，当物化视图（MV）的 SQL 中的列与第一次执行 `dbt run` 所创建的目标表中的列不一致时，构建将会失败。


### 数据补齐 \{#data-catch-up\}

默认情况下，在创建或重新创建 materialized view (MV) 时，会先将目标表用历史数据填充，然后才创建 MV 本身（`catchup=True`）。可以通过将 `catchup` 配置设置为 `False` 来禁用该行为。

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    catchup=False  # this setting
)}}
```

| Operation                      | `catchup: True` (default)  | `catchup: False`           |
| ------------------------------ | -------------------------- | -------------------------- |
| 初始部署（`dbt run`）                | 目标表回填历史数据                  | 目标表创建为空                    |
| 全量刷新（`dbt run --full-refresh`） | 目标表重建并回填                   | 目标表被重新创建为空，**现有数据将丢失**     |
| 正常运行                           | materialized view 捕获新的插入数据 | materialized view 捕获新的插入数据 |

:::warning 使用 Full Refresh 存在数据丢失风险
在使用 `catchup: False` 并执行 `dbt run --full-refresh` 时，将会**丢弃目标表中的所有现有数据**。该表会被重新创建为空，并且之后只会捕获新的数据。若后续可能需要历史数据，请确保事先做好备份。
:::


## 使用显式目标进行物化 (Beta) \{#explicit-target\}

:::warning Beta
此功能处于 beta 阶段，并从 **dbt-clickhouse 1.10 版本** 开始可用。API 可能会根据社区反馈而变更。
:::

默认情况下，dbt-clickhouse 会在单个模型中创建并管理目标表和 materialized view（即上文所述的[隐式目标](#implicit-target)方法）。这种方式存在一些限制：

- 所有资源（目标表 + MV）共享同一套配置。如果多个 MV 指向同一个目标表，必须使用 `UNION ALL` 语法在同一处定义。
- 这些资源无法单独迭代处理，必须通过同一个模型文件统一管理。
- 无法方便地单独控制每个 MV 的名称。
- 目标表与 MV 之间共享所有配置，难以分别为每个资源单独配置，也不容易判断每项配置分别属于哪个资源。

**显式目标** 功能允许你将目标表单独定义为常规的 `table` 物化方式，然后在 materialized view 模型中引用该目标表。

### 优点 \{#explicit-target-benefits\}

- **资源完全隔离**：现在可以单独定义每个资源，从而提升可读性。
- **dbt 与 CH 之间 1:1 的资源对应关系**：现在可以使用 dbt 工具分别管理和迭代这些资源。
- **可为不同资源使用不同配置**：现在可以为每个资源应用不同的配置。
- **不再需要遵守命名约定**：现在所有资源都使用用户指定的名称创建，而不是使用为物化视图添加 `_mv` 后缀的自定义名称。

### 限制 \{#explicit-target-limitations\}

- 目标表定义对 dbt 来说并不自然：它并不是一个从源表读取数据的 SQL，因此在这里我们无法利用 dbt 对该目标表的校验功能。MV 的 SQL 仍会通过 dbt 工具进行校验，而其与目标表列之间的兼容性则会在 CH 层面进行校验。
- **我们发现了一些与 `ref()` 函数自身限制相关的问题**：我们需要用它在模型之间建立引用，但它只能用于引用上游模型，而不能引用下游模型。这给本方案的实现带来了一些问题。我们已经在 dbt-core 仓库中创建了一个 issue，目前正与他们沟通[以寻找可能的解决方案 (dbt-labs/dbt-core#12319)](https://github.com/dbt-labs/dbt-core/issues/12319)：
  - 当在 config 块中调用 `ref()` 时，它返回的是当前模型，而不是那个被共享（被引用）的模型。这使我们无法在 config() 段中定义它，被迫通过注释来声明此依赖。我们遵循 dbt 文档中定义的相同模式，采用 [“--depends_on:” 方法](https://docs.getdbt.com/reference/dbt-jinja-functions/ref#forcing-dependencies)。
  - `ref()` 对我们来说可以满足需求，因为它会强制先创建目标表，但在生成文档的依赖关系图中，目标表会被绘制成另一个上游依赖，而不是下游依赖，从而使依赖关系略显难以理解。
  - `unit-test` 也会强制我们为目标表定义一些数据，即使设计上并不打算从中读取数据。变通方案只是将该表的数据留空。

### 用法 \{#explicit-target-usage\}

**步骤 1：将目标表定义为常规表模型**

模型 `events_daily.sql`：

```sql
{{
    config(
        materialized='table',
        engine='SummingMergeTree()',
        order_by='(event_date, event_type)',
        partition_by='toYYYYMM(event_date)'
    )
}}

SELECT
    toDate(now()) AS event_date,
    '' AS event_type,
    toUInt64(0) AS total
WHERE 0  -- Creates empty table with correct schema
```

这是我们在限制部分中提到的变通方案。你可能会因此丢失部分 dbt 校验，但在 ClickHouse 端仍然会对 schema 进行检查。

**步骤 2：定义指向目标表的 materialized view**

例如，你可以在不同的模型中按如下所示定义不同的 MV，即使它们指向同一个目标表。注意新的 `{{ materialization_target_table(ref('events_daily')) }}` 宏调用，它用于为该 MV 配置目标表。

模型 `page_events_aggregator.sql`：

```sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'page_events') }}
GROUP BY event_date, event_type
```

模型 `mobile_events_aggregator.sql`：

```sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'mobile_events') }}
GROUP BY event_date, event_type
```


### 配置选项 \{#explicit-target-configuration\}

在使用显式目标表时，适用以下配置：

**在目标表上（`materialized='table'`）：**

| Option | Description | Default |
|--------|-------------|---------|
| `mv_on_schema_change` | 当该表被 dbt 管理的 MVs 使用时，如何处理 schema 变更。其行为与 [增量模型](https://docs.getdbt.com/docs/build/incremental-models#what-if-the-columns-of-my-incremental-model-change)中的 `on_schema_change` 配置相同。| **注意**：如果一个 `materialized='table'` 模型没有任何 MV 指向它，它会像往常一样工作，因此即使配置了此设置，也会被忽略。如果该表是 MVs 的目标表，为保护这些表中的数据，此配置的默认值将为 `mv_on_schema_change='fail'`。 |
| `repopulate_from_mvs_on_full_refresh` | 在执行 `--full-refresh` 时，不运行该表自身的 SQL，而是通过基于所有指向该表的 MVs 的 SQL 执行 INSERT-SELECT 来重建该表。 | `False` |

**在 materialized view 上（`materialized='materialized_view'`）：**

| Option | Description | Default |
|--------|-------------|---------|
| `catchup` | 在创建 MV 时，是否回填历史数据。 | `True` |

:::note
通常只需要在 MVs 中将 `catchup` 设置为 `True`，或在其目标表中将 `repopulate_from_mvs_on_full_refresh` 设置为 `True`。如果两者都设置为 `True`，可能会导致数据重复。
:::

### 常用操作 \{#explicit-target-common-operations\}

#### 使用显式目标进行完全刷新 \{#explicit-target-full-refresh\}

当使用 `--full-refresh` 时，显式目标表将被重新创建（因此如果在此过程中正在进行数据摄取，你可能会丢失数据）。具体行为会根据你的配置有所不同：

**选项 1：`--full-refresh` 的默认行为。所有对象都会被重新创建，但在重新创建物化视图（MV）的期间，目标表将为空或仅部分加载。**

所有对象都会被删除并重新创建。如果你希望使用物化视图的 SQL 重新插入数据，请保持设置 `catchup=True`：

```sql
-- models/page_events_aggregator.sql
{{ config(
    materialized='materialized_view',
    catchup=True  -- this is the default value so you don't need to actully set it.
) }}
{{ materialization_target_table(ref('events_daily')) }}
...
```

**选项 2：我想重新创建目标表，并且不希望在重建 MV 期间读到空数据。**

如果你需要先更新 MV 的 SQL，可以在其中设置 `catchup=False`，然后对这些 MV 执行 `dbt run` 或 `dbt run --full-refresh`。请确保在对目标表执行 `--full-refresh` 之前已经创建好这些 MV，因为该操作会使用 ClickHouse 中的 MV 定义。

在目标表模型上设置 `repopulate_from_mvs_on_full_refresh=True`。在执行 `dbt run --full-refresh` 时，这将：

1. 创建一个新的临时表
2. 使用每个 MV 的 SQL 执行 INSERT-SELECT
3. 以原子方式交换这些表

因此，在 MV 被重建的过程中，这张表的使用者不会看到空数据。

```sql
-- models/events_daily.sql
{{
    config(
        materialized='table',
        engine='SummingMergeTree()',
        order_by='(event_date, event_type)',
        repopulate_from_mvs_on_full_refresh=True
    )
}}
...
```


#### 更改目标表 \{#explicit-target-changing\}

在不执行 `--full-refresh` 的情况下，无法更改物化视图（MV）的目标表。如果在修改 `materialization_target_table()` 引用后尝试运行普通的 `dbt run`，构建会失败，并出现一条错误信息，提示目标表已发生更改。

要更改目标表：

1. 更新 `materialization_target_table()` 调用
2. 运行 `dbt run --full-refresh -s your_mv_model`

### 常见问题排查 \{#explicit-target-troubleshooting\}

#### 在执行 `run` 期间或之后目标表为空 \{#target-table-empty\}

出现这种情况可能有以下几种原因：

- materialized view 可能被配置为 `catchup=False`，或者目标表被配置为 `repopulate_from_mvs_on_full_refresh=False`，因此在创建 materialized view 或重建目标表时不会执行回填。这是预期行为，因此如果希望使用 materialized view 的 SQL 重新插入数据，请确保在 materialized view 中设置 `catchup=True`（默认值），或者在目标表中设置 `repopulate_from_mvs_on_full_refresh=True`。注意不要同时启用这两个设置，以避免产生重复数据。更多详情请查看[配置部分](#explicit-target-configuration)。
- 当执行 `dbt run --full-refresh` 时，如果 materialized view 使用默认的 `catchup=True`，目标表会被重建，这些 materialized view 会依次重新插入数据。为避免这种情况，请查看[对显式目标执行 Full refresh](#explicit-target-full-refresh)。

#### 在目标表中执行 `dbt run --full-refresh` 且设置 `repopulate_from_mvs_on_full_refresh=True` 时，会使用旧版本 materialized view 的逻辑，而不是项目中当前的 SQL 定义 \{#full-refresh-with-repopulate-from-mvs-on-full-refresh\}

`repopulate_from_mvs_on_full_refresh=True` 会使用 ClickHouse 中已存在的 materialized view SQL 定义。要确保使用新的 materialized view 定义，请先对每个 materialized view 执行一次 `dbt run`，然后再对目标表执行 `dbt run --full-refresh`。

#### 在执行一次 run 之后出现重复数据 \{#duplicate-data\}

可能原因：

- materialized view 上设置了 `catchup=True`，并且目标表上设置了 `repopulate_from_mvs_on_full_refresh=True`：根据你希望执行的操作，仅保留其中一个。有关更多细节，请查看[配置章节](#explicit-target-configuration)。
- 目标表未使用 `WHERE 0` 定义：目标表应在创建时为空，但如果未包含 `WHERE 0`，内部查询可能会插入数据。请确保包含该子句。

#### 在执行 `dbt run --full-refresh` 后进行活跃摄取时的数据丢失 \{#data-loss-active-ingestion\}

在执行 `dbt run --full-refresh` 之后，源表中的部分行在目标表中缺失。
ClickHouse materialized view 的作用类似于 insert 触发器——它们只会在自身存在期间捕获数据。在完整刷新过程中，会有一个短暂的时间窗口，MV 会被删除并重新创建（“盲窗口”）。在此窗口期间插入到源表中的任何行都不会被捕获。有关更多详情，请参见[活跃摄取期间的行为](#behavior-during-active-ingestion)一节。

### 调试方法 \{#debugging-techniques\}

#### 检查 ClickHouse 中当前 MV 的写入目标 \{#check-mv-target\}

查询 `system.tables`，以查看 materialized view 当前写入到哪里：

```sql
SELECT
    name as mv_name,
    replaceRegexpOne(
        create_table_query,
        '.*TO\\s+`?([^`\\s(]+)`?\\.`?([^`\\s(]+)`?.*',
        '\\1.\\2'
    ) AS target_table
FROM system.tables
WHERE database = 'your_schema'
  AND engine = 'MaterializedView'
```


#### 检查 dbt 是否将某个表识别为 materialized view 目标 \{#check-dbt-recognition\}

在执行 dbt run 时，留意如下日志条目：

>Table `<table_name>` is used as a target by a dbt-managed materialized view. Defaulting mv_on_schema_change to "fail" to prevent data loss.

如果出现这条消息，说明 dbt 已检测到该表被至少一个由 dbt 管理的 materialized view 作为目标使用。如果你预期会看到这条消息但实际没有，请确认以下事项：

- materialized view 模型是否正确地定义了 `{{ materialization_target_table(ref('your_target')) }}` 
- materialized view 模型在其配置中是否包含 `materialized='materialized_view'`
- materialized view 和其目标表是否都已经至少运行过一次

### 从隐式目标迁移到显式目标 \{#migration-implicit-to-explicit\}

如果你已经有使用隐式目标方式的 materialized view 模型，并希望迁移到显式目标方式，请按照以下步骤操作：

**1. 创建目标表模型**

创建一个新的模型文件，使用 `materialized='table'`，并定义与当前 MV 目标表相同的 schema。使用 `WHERE 0` 子句来创建一个空表，并使用与当前隐式 materialized view 模型相同的名称。现在你就可以使用该模型对目标表进行迭代更新了。

```sql
-- models/events_daily.sql
{{
    config(
        materialized='table',
        engine='MergeTree()',
        order_by='(event_date, event_type)'
    )
}}

SELECT
    toDate(now()) AS event_date,
    '' AS event_type,
    toUInt64(0) AS total
WHERE 0
```

**2. 更新 MV 模型**

创建新的模型，其中应分别包含对应的 MV SQL，以及指向新目标表的 `materialization_target_table()` 宏调用。如果之前使用了 `UNION ALL`，请移除该部分以及相关注释。

对于模型名称，你需要遵循以下命名约定：

* 如果只定义了一个 MV，它的名称将是：`<old_model_name>_mv`
* 如果定义了多个 MV，每个名称将是：`<old_model_name>_mv_<name_in_comments>`

之前在 `my_model.sql` 中的写法为（隐式目标，单个包含 UNION ALL 的模型）：

```sql
--mv1:begin
select a, b, c from {{ source('raw', 'table_1') }}
--mv1:end
union all
--mv2:begin
select a, b, c from {{ source('raw', 'table_2') }}
--mv2:end
```

之后（显式目标，独立的模型文件）：

```sql
-- models/my_model_mv_mv1.sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

select a, b, c from {{ source('raw', 'table_1') }}
```

```sql
-- models/my_model_mv_mv2.sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

select a, b, c from {{ source('raw', 'table_2') }}
```

**3. 按需根据[显式目标](#explicit-target)部分中的说明进行迭代。**


## 隐式目标与显式目标方法的行为对比\{#behavior-comparison\}

### 它们的一般行为方式 \{#general-behavior\}

| Operation | 隐式 target | 显式 target |
| --- | --- | --- |
| First dbt run | 创建所有资源 | 创建所有资源 |
| Next dbt run |  **资源无法单独管理，所有变更一次性执行：**<br /><br />**target table**：<br /> 使用 `on_schema_change` 设置来管理变更。默认值为 `ignore`，因此新列不会被处理。<br /><br />**Materialized views**：全部通过 `alter table modify query` 操作进行更新 | **变更可以单独应用：<br /><br />target table**：<br />自动检测其是否为由 dbt 定义的 materialized views 的 target table。如果是，则列演进默认通过 `mv_on_schema_change` 设置为 `fail` 来管理，因此在列发生变更时会报错。我们将此默认值作为一层保护机制。<br /><br />**Materialized views**：其 SQL 会通过 `alter table modify query` 操作进行更新。 |
| dbt run --full-refresh | **资源无法单独管理，所有变更一次性执行：<br /><br />target table**：<br />target table 会被重新创建为空表。可以通过 `catchup` 配置，使用所有 materialized views 的 SQL 一次性进行回填。`catchup` 的默认值为 `True`。<br /><br />**Materialized views**：全部会被重新创建。 | **变更将被单独应用：<br /><br />target table：** 将按常规方式被重新创建。<br /><br />**Materialized views**：先 drop 再重新创建。`catchup` 可用于初始回填。`catchup` 的默认值为 `True`。<br /><br />**注意：在此过程中，在 materialized views 重新创建完成之前，target table 将为空或仅部分加载。为避免这种情况，请查看下一节关于如何迭代 target table 的内容。**|

### 活跃摄取期间的行为 \{#behavior-during-active-ingestion\}

在迭代你的模型时，需要了解不同操作如何与正在插入的数据交互：

- 由于 ClickHouse 的 materialized view 充当**插入触发器（insert trigger）**，它们只会在自身存在期间捕获数据。如果在某个时间窗口内（例如在执行 `--full-refresh` 期间）一个 materialized view 被删除并重新创建，那么在该窗口中插入到源表的任何行都**不会**被该 materialized view 处理。这种情况被称为该 materialized view 处于“盲区”（blind）状态。
- 各种不同的 `catchup` 过程都基于使用 materialized view 的 SQL 执行的 `INSERT INTO ... SELECT` 操作，并且独立于 materialized view 的工作方式。一旦 `INSERT` 开始执行，新的数据将不会被该 `INSERT` 捕获，但会被已附加的 materialized view 捕获。

下表总结了在源表上存在持续插入时，各类操作的安全性。

#### 隐式目标操作 \{#ingestion-implicit-target\}

| Operation | Internal process | Safety while inserts are happening |
|-----------|------------------|------------------------------------|
| First `dbt run` | 1. 创建目标表<br/>2. 插入数据（如果 `catchup=True`）<br/>3. 创建 materialized view | ⚠️ **在步骤 1 到 3 之间，materialized view 处于“盲区”。** 在此时间窗口内插入到源表的任何行都不会被捕获。 |
| Subsequent `dbt run` | `ALTER TABLE ... MODIFY QUERY` | ✅ 安全。materialized view 会以原子方式更新。 |
| `dbt run --full-refresh` | 1. 创建备份表<br/>2. 插入数据（如果 `catchup=True`）<br/>3. 删除 materialized view<br/>4. 交换表<br/>5. 重新创建 materialized view | ⚠️ **在重新创建期间，materialized view 处于“盲区”。** 在步骤 3 到 5 之间插入到源表的数据不会出现在新的目标表中。 |

#### 显式目标操作 \{#ingestion-explicit-target\}

**materialized view 模型：**

| Operation | Internal process | Safety while inserts are happening |
|-----------|------------------|------------------------------------|
| 第一次执行 `dbt run` | 1. 创建 MV（带有 `TO` 子句）<br/>2. 运行追赶补齐（如果 `catchup=True`） | ✅ 会先创建 MV，因此新的插入会被立即捕获。<br/>⚠️ **追赶补齐可能导致数据重复** —— 回填查询可能与 MV 已在处理的行产生重叠。如果使用去重引擎（例如 `ReplacingMergeTree`）则是安全的。 |
| 后续执行的 `dbt run` | `ALTER TABLE ... MODIFY QUERY` | ✅ 安全。MV 会以原子方式更新。 |
| 针对 MVs 运行 `dbt run --full-refresh` | 1. 删除并重新创建 MV<br/>2. 运行追赶补齐（如果 `catchup=True`） | ⚠️ **MV 在重建期间处于“盲区”**（在 drop 和 create 之间）。<br/>⚠️ 如果插入操作同时在进行，**追赶补齐可能导致数据重复**。 |

**目标表模型：**

| Operation | Internal process | Safety while inserts are happening |
|-----------|------------------|------------------------------------|
| `dbt run` | 按照 `mv_on_schema_change` 设置应用 schema 变更 | ✅ 安全。没有数据移动。 |
| `dbt run --full-refresh`（默认） | 重新创建表（使其为空） | ⚠️ **目标表会一直为空**，直到 MVs 将其回填。一旦新表存在，MVs 会继续向其插入数据。 |
| 使用 `repopulate_from_mvs_on_full_refresh=True` 运行 `dbt run --full-refresh` | 1. 创建备份表<br/>2. 使用每个 MV 的 SQL 插入数据<br/>3. 原子性交换表 | ⚠️ **MV 在重建期间处于“盲区”。** 在步骤 1 和 3 之间插入的数据不会出现在新表中。**这一行为在后续版本中可能会改变** |

:::tip 适用于存在活跃摄取的生产环境的建议

- **如有可能，在 dbt 操作期间暂停摄取**：这将使所有操作都是安全的，并且不会丢失数据。
- **如有可能，在目标表上使用去重引擎**（例如 `ReplacingMergeTree`），以处理追赶补齐重叠可能带来的重复数据。
- **在可能的情况下优先选择 `ALTER TABLE ... MODIFY QUERY`**（不带 `--full-refresh` 的常规 `dbt run`）—— 这始终是安全的。
- **在 dbt 操作期间留意存在风险的时间窗口**。
:::

## 可刷新materialized view \{#refreshable-materialized-views\}

[Refreshable Materialized Views](/materialized-view/refreshable-materialized-view) 是 ClickHouse 中的一种特殊类型的 materialized view，会定期重新执行查询并存储结果，类似于其他数据库中 materialized view 的工作方式。适用于需要周期性快照或聚合结果，而不是实时插入触发器的场景。

:::tip
可刷新materialized view **既可以**与[隐式目标](#implicit-target)方式配合使用，也可以与[显式目标](#explicit-target)方式配合使用。`refreshable` 配置与目标表的管理方式相互独立。
:::

要使用可刷新materialized view，请在 MV 模型中添加一个 `refreshable` 配置对象，并包含以下选项：

| Option                | Description                                                                                                                                                              | Required | Default Value |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|---------------|
| refresh_interval      | interval 子句（必填）                                                                                                                                                    | Yes      |               |
| randomize             | 随机化子句，该子句将出现在 `RANDOMIZE FOR` 之后                                                                                                                          |          |               |
| append                | 如果设置为 `True`，每次刷新都会向表中插入行而不删除已存在的行。该插入操作不是原子的，与普通的 INSERT SELECT 一样。                                                        |          | False         |
| depends_on            | 可刷新materialized view 的依赖列表。请按如下格式提供依赖：`{schema}.{view_name}`                                                                                        |          |               |
| depends_on_validation | 是否验证 `depends_on` 中提供的依赖是否存在。如果某个依赖未包含 schema，则会在 `default` schema 上进行验证                                                                |          | False         |

### 隐式目标示例 \{#refreshable-implicit-example\}

```python
{{
    config(
        materialized='materialized_view',
        engine='MergeTree()',
        order_by='(event_date)',
        refreshable={
            "interval": "EVERY 5 MINUTE",
            "randomize": "1 MINUTE",
            "append": True,
            "depends_on": ['schema.depend_on_model'],
            "depends_on_validation": True
        }
    )
}}

SELECT
    toStartOfDay(event_time) AS event_date,
    count() AS total
FROM {{ source('raw', 'events') }}
GROUP BY event_date
```


### 显式指定目标的示例 \{#refreshable-explicit-example\}

```python
{{
    config(
        materialized='materialized_view',
        refreshable={
            "interval": "EVERY 1 HOUR",
            "append": False
        }
    )
}}
{{ materialization_target_table(ref('events_daily')) }}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'events') }}
GROUP BY event_date, event_type
```


### 限制 \{#refreshable-limitations\}

* 在 ClickHouse 中创建带有依赖项的可刷新 materialized view（MV）时，如果在创建时指定的依赖项不存在，ClickHouse 不会抛出错误。相反，该可刷新 MV 会保持在非活动状态，等待依赖项被满足后才开始处理更新或执行刷新。此行为是按设计实现的，但如果未及时创建或配置所需依赖项，可能会导致数据可用性延迟。建议用户在创建可刷新 materialized view 之前，确保所有依赖项都已正确定义并已存在。
* 截至目前，MV 与其依赖项之间不存在实际的 “dbt linkage”，因此无法保证创建顺序。
* 可刷新功能尚未在多个 MV 指向同一目标模型的场景下进行测试。