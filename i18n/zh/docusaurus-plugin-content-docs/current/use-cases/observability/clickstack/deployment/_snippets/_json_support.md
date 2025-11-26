import BetaBadge from '@theme/badges/BetaBadge';



## JSON 类型支持 {#json-type-support}

<BetaBadge/>

:::warning 测试功能 - 尚未准备好用于生产环境
**ClickStack** 中对 JSON 类型的支持目前是一个**测试功能（beta）**。虽然在 ClickHouse 25.3+ 中 JSON 类型本身已经可以用于生产环境，但其在 ClickStack 中的集成仍在积极开发中，可能存在功能限制、将来会发生变更或包含缺陷。
:::

从 `2.0.4` 版本起，ClickStack 对 [JSON type](/interfaces/formats/JSON) 提供测试版支持。

有关此类型的优势，请参阅 [Benefits of the JSON type](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type)。

要启用 JSON 类型支持，必须设置以下环境变量：

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` - 在 OTel collector 中启用支持，以确保使用 JSON 类型创建 schema。
- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` - 在 HyperDX 应用中启用支持，以允许查询 JSON 数据。
