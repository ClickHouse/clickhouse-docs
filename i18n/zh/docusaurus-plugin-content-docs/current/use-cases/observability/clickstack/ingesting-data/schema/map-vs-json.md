---
slug: /use-cases/observability/clickstack/ingesting-data/schema/map-vs-json
pagination_prev: null
pagination_next: null
description: '在 ClickStack 中，属性何时使用 Map 类型，何时使用 JSON 类型'
sidebar_label: 'Map 与 JSON 类型'
title: 'ClickStack 中的 Map 与 JSON 类型'
doc_type: 'reference'
keywords: ['clickstack', 'json', 'map', '属性', 'schema', '可观测性']
---

import BetaBadge from '@theme/badges/BetaBadge';

ClickStack 的[默认 schema](/use-cases/observability/clickstack/ingesting-data/schemas)将 resource、scope、log 和 span 属性存储为 `Map(LowCardinality(String), String)` 列。ClickHouse 也支持强类型的 [`JSON 类型`](/interfaces/formats/JSON)，而且 ClickStack 已 Beta 支持用它替代 `Map`。

**对于典型的可观测性工作负载，我们建议保留[默认的基于 `Map` 的 schema](/use-cases/observability/clickstack/ingesting-data/schemas)。** `JSON 类型` 适用于希望在属性键集合较小且稳定的工作负载上进行评估的用户，但它并不是通用场景下推荐的 schema。

## 为什么推荐将 Map 作为默认选项 \{#why-map\}

可观测性数据主要由各类属性构成，例如资源属性、scope 属性，以及 span 属性和日志属性。这些属性集合通常规模很大、基数很高，并且以高吞吐量摄取。对于这类属性，你选择的 schema 是决定摄取成本和存储布局的关键因素。

`Map(LowCardinality(String), String)` 会将键和值存储在同一结构中。`Map` 过去的主要缺点是，读取单个键时必须读取整个 map 列。现在这一点已经不再成立：ClickHouse 现已支持[分桶 map 序列化](/sql-reference/data-types/map#bucketed-map-serialization)，可将 map 拆分为多个 bucket，使查询只需读取所需的 bucket。再结合 map 键和值上的[文本索引](/engines/table-engines/mergetree-family/textindexes)——这也是 [ClickStack 默认 schema](/use-cases/observability/clickstack/ingesting-data/schemas) 的配置方式——`Map` 就能在读取时兼顾选择性和速度，同时不会因为新增键而带来任何额外的摄取成本。

在实践中，这意味着：

* **随着键数量增长，摄取成本依然稳定。** 添加新的属性键不会改变磁盘上的列布局，也不会创建新的列文件。摄取成本受数据量限制，而不是受键基数限制。
* **不会发生元数据膨胀。** 磁盘上的列文件数量不会随着唯一属性键的数量增加而增长。
* **可通过索引进行选择性查找。** map 键和值上的文本索引可支持点查找，无需扫描每一行。
* **在高吞吐量下表现可预测。** `Map` 可以处理突发式、无 schema 的属性集合——这在 tracing 和日志中很常见——而不会产生按键计算的额外开销。

## 为什么默认不使用 JSON \{#why-not-json\}

`JSON` 类型采用了不同的方式：在写入时，ClickHouse 会为它看到的每个路径动态创建一个专用的强类型子列。在读取时，这种方式很有吸引力，因为只会读取所请求的子列，类型会得到保留，而且无需在查询时进行类型转换。

代价则出现在摄取时。创建和管理大量动态子列会带来写入时开销和元数据复杂性。对于可观测性工作负载来说，其属性集通常非常庞大或高度动态，且摄取处理量很高，因此这种开销相当显著。[`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) 限制可以通过将额外路径溢写到共享列中来控制影响，但访问共享列比访问专用子列更慢，这会削弱当初使用 JSON 所看重的读取时优势。

随着 `Map` 的分桶序列化消除了其在读取时历史上的大部分开销，对于典型的可观测性工作负载而言，`JSON` 在读取时的优势已经不足以抵消其在摄取时的成本。

## 何时仍可考虑 JSON \{#when-to-consider-json\}

仅当以下条件**全部**成立时，JSON 类型才比较适合：

* 你的属性键集合**较小且稳定**，也就是说，不会出现数千个唯一键，并且很少新增键。
* 相对于属性基数，摄取**处理量**较低。
* 你希望以**强类型方式访问**属性，而无需在查询时进行类型转换 (数字保持为数字，布尔值保持为布尔值) 。
* 你愿意在 ClickStack 中使用一项 **Beta 功能**，并接受相关集成后续可能发生变化。

如果这些条件不能全部满足，请继续使用[默认的基于 `Map` 的 schema](/use-cases/observability/clickstack/ingesting-data/schemas)。

## Beta 状态 \{#beta-status\}

<BetaBadge />

:::warning Beta 功能，尚未达到生产就绪状态
**ClickStack** 对 JSON 类型 的支持属于 **Beta 功能**。虽然 JSON 类型 本身在 ClickHouse 25.3+ 中已可用于生产环境，但它在 ClickStack 中的集成仍在积极开发中，可能存在局限性、后续发生变化或包含缺陷。
:::

从 `2.0.4` 版本开始，ClickStack 提供对 JSON 类型 的 Beta 支持。

## 启用 JSON 支持 \{#enabling-json-support\}

如需使用 JSON 类型的 schema，而不是[默认的基于 `Map` 的 schema](/use-cases/observability/clickstack/ingesting-data/schemas)，请设置以下环境变量。

| 变量                                                              | 设置位置                     | 用途                                            |
| --------------------------------------------------------------- | ------------------------ | --------------------------------------------- |
| `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` | OTel collector           | 在 ClickHouse 中使用 JSON 类型创建 schema。            |
| `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`                         | HyperDX (ClickStack UI)  | 使应用层能够查询 JSON 类型的 schema。仅适用于 ClickStack 开源版。 |

### 托管 ClickStack \{#managed-clickstack\}

要在托管 ClickStack 中启用 JSON 支持，请先联系 support@clickhouse.com，再配置 collector。还必须在 ClickHouse Cloud 中的 ClickStack UI (HyperDX) 内启用此功能。

在 collector 上设置 `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'`。例如：

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
```

### 开源 ClickStack \{#oss-clickstack\}

在任何包含 collector 的部署中设置 `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'`，并在 HyperDX 应用层设置 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`，以便查询 JSON 类型的 schema。

例如：

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
```

## 从基于 Map 的 schema 迁移到 JSON \{#migrating-from-map-to-json\}

:::important 向后兼容性
[JSON 类型](/interfaces/formats/JSON) **与现有基于 Map 的 schema 不向后兼容**。启用此功能后会使用 `JSON` 类型创建新表，并且需要手动迁移数据。
:::

要从[默认的基于 Map 的 schema](/use-cases/observability/clickstack/ingesting-data/schemas)迁移，请按以下步骤操作：

<VerticalStepper headerLevel="h3">
  ### 停止 OTel collector \{#stop-the-collector\}

  ### 重命名现有表并更新数据源 \{#rename-existing-tables-sources\}

  重命名现有表，并更新 HyperDX 中的数据源。

  例如：

  ```sql
  RENAME TABLE otel_logs TO otel_logs_map;
  RENAME TABLE otel_metrics TO otel_metrics_map;
  ```

  ### 部署 OTel collector \{#deploy-the-collector\}

  部署 OTel collector，并设置 `OTEL_AGENT_FEATURE_GATE_ARG`。

  ### 启用 JSON schema 支持并重启 HyperDX 容器 \{#restart-the-hyperdx-container\}

  ```shell
  export BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true
  ```

  ### 创建新的数据源 \{#create-new-data-sources\}

  在 HyperDX 中创建指向 JSON 表的新数据源。
</VerticalStepper>

### 迁移现有数据 (可选) \{#migrating-existing-data\}

要将旧数据迁移到新的 JSON 表中，请执行以下操作：

```sql
INSERT INTO otel_logs SELECT * FROM otel_logs_map;
INSERT INTO otel_metrics SELECT * FROM otel_metrics_map;
```

:::warning
仅建议用于小于约 100 亿行的数据集。此前以 Map 类型存储的数据无法保留类型精度 (所有值都是字符串) 。因此，在这些旧数据过期淘汰之前，它们在新的 schema 中都会显示为字符串，因此前端需要进行一些类型转换。新数据使用 JSON 类型后将保留类型精度。
:::