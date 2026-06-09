---
slug: /use-cases/observability/clickstack/tuning-clickstack-schema
title: '调优托管 ClickStack - 优化 schema'
description: '优化 ClickStack schema，在托管 ClickStack 中提升查询性能和存储效率'
doc_type: 'guide'
keywords: ['clickstack', '调优', 'schema', '托管', '可观测性', '性能', '优化', '存储']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

如果你已经运行 ClickStack 有一段时间，可能已经发现，默认 schema 无需改动就能满足大多数可观测性工作负载的需求。本页适用于这种情况：默认配置已经不够用了，查询延迟开始升高，或者你的访问模式已经偏离了默认设计。

以下四种优化基本覆盖了实践中最常见、也最有效的改进方式。它们大致按实施成本排序。前两种是局部的 `ALTER TABLE` 更改，可以逐步上线。第三种在同一个聚合反复出现在仪表盘上时效果明显。第四种需要进行表迁移，因此实施起来最复杂。

下面的总结特意保持简短。若想了解每项更改背后的原因、基准测试，以及如何将这些更改逐步应用到现有数据，请参阅 [性能调优](/use-cases/observability/clickstack/performance_tuning)。

<VerticalStepper headerLevel="h2">
  ## 将经常查询的属性物化 \{#materialize-attributes\}

  按 `LogAttributes['service.version']` 过滤时，ClickHouse 需要为它检查的每一行加载并解码整个 `LogAttributes` Map。将该属性提升为 `MATERIALIZED` 列后，同样的过滤就会变成列读取，通常能快一个数量级。一旦该列存在，ClickStack 会自动重写过滤条件，因此保存的搜索和仪表盘都无需修改即可继续使用。

  只选择那些你确实经常查询的属性。每个物化列都会带来存储和写入时开销，因此这更像是“提升你会用到的内容”，而不是“全部都提升”。

  ```sql
  ALTER TABLE otel_logs
    ADD COLUMN ServiceVersion LowCardinality(String)
    MATERIALIZED LogAttributes['service.version'];
  ```

  现有行在新列中会保持为空，直到你另外执行 `ALTER TABLE otel_logs MATERIALIZE COLUMN ServiceVersion`。

  阅读更多：[将经常查询的属性物化](/use-cases/observability/clickstack/performance_tuning#materialize-frequently-queried-attributes)。

  ## 添加跳过索引 \{#add-skip-indexes\}

  跳过索引可以让 ClickHouse 排除不可能匹配过滤条件的数据粒度，把全表扫描变成小范围的定向读取。以下三种类型值得了解：

  * **文本索引** (`text(tokenizer = ...)`) ，用于字符串列以及 `mapKeys`/`*AttributeItems` 数组。默认的日志 schema 已经内置了这些索引。
  * **最小-最大索引**，用于按范围过滤的数值列。链路追踪中的 `Duration` 是典型场景。
  * **布隆过滤器**，用于在尚未支持文本索引的 ClickHouse 版本中处理高基数的等值查找。

  ```sql
  ALTER TABLE otel_traces ADD INDEX idx_duration Duration TYPE minmax GRANULARITY 1;
  ALTER TABLE otel_traces MATERIALIZE INDEX idx_duration;
  ```

  只有在跳过索引确实能裁掉数据粒度时，它的评估成本才值得付出。在认定它有帮助之前，先对有代表性的查询执行 `EXPLAIN indexes = 1` 进行确认。

  阅读更多：[添加跳过索引](/use-cases/observability/clickstack/performance_tuning#adding-skip-indexes)。

  ## 预计算重复聚合 \{#materialized-views\}

  当同一个聚合在仪表盘中反复运行时 (例如按错误率排序的热门服务、每个端点的 p99 延迟、每分钟请求数) ，materialized view 会在写入时计算结果，并将其写入一张较小的 rollup 表。这样，仪表盘查询的就是 rollup，而不是原始日志或链路追踪数据，成本会低得多。

  当仪表盘访问频繁且底层表很大时，这种方式很划算。代价是会增加一些写入时 CPU 开销，并且需要维护第二张表。

  阅读更多：[利用 materialized view](/use-cases/observability/clickstack/performance_tuning#exploiting-materialized-views)。

  ## 根据你的访问模式选择主键 \{#choose-primary-key\}

  主键决定了行在磁盘上的排序方式。如果过滤条件使用了该键的前导列，ClickHouse 就能直接寻道到相关区域；如果没有用到这些前导列，则会扫描整个分区。

  默认的日志键 `(toStartOfFiveMinutes(Timestamp), ServiceName, Timestamp)` 偏向于“查看过去 N 分钟内服务 X 发生了什么”。如果你的大多数查询都以其他列开头 (例如租户 id、客户 id、区域) ，那么将主键调整为以该列开头，会是你能做出的影响最大的一项变更。

  ```sql
  CREATE TABLE otel_logs_v2
  (
    -- 与 otel_logs 相同的列
  )
  ENGINE = MergeTree
  ORDER BY (TenantId, ServiceName, Timestamp);
  ```

  ClickHouse 不允许原地修改主键，因此这属于表迁移，而不是简单的 `ALTER`。性能调优指南介绍了如何创建新表、重定向摄取，以及使用 `Merge` 表让现有仪表盘在旧数据和新数据之间继续正常工作。

  阅读更多：[修改主键](/use-cases/observability/clickstack/performance_tuning#modifying-the-primary-key)。
</VerticalStepper>

## 延伸阅读 \{#further-reading\}

* [性能调优](/use-cases/observability/clickstack/performance_tuning)：完整指南，涵盖 projection 和行查找加速。
* [ClickStack 使用的表和 schema](/use-cases/observability/clickstack/ingesting-data/schemas)：这些优化所依赖的权威 DDL。
* [投入生产](/use-cases/observability/clickstack/production)：更全面的生产环境建议。