import BetaBadge from '@theme/badges/BetaBadge';

## JSON 类型支持 {#json-type-support}

<BetaBadge/>

:::warning Beta 功能 - 尚未准备好用于生产环境
**ClickStack** 中的 JSON 类型支持目前为 **Beta 功能**。虽然 JSON 类型本身在 ClickHouse 25.3+ 中已经可以用于生产环境，但其在 ClickStack 中的集成仍在积极开发中，可能存在功能限制、未来变更或缺陷。
:::

从 `2.0.4` 版本开始，ClickStack 对 [JSON 类型](/interfaces/formats/JSON) 提供 Beta 支持。

关于此类型的优势，请参见 [JSON 类型的优势](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type)。

要启用对 JSON 类型的支持，你必须设置以下环境变量：

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` - 在 OTel collector 中启用支持，确保使用 JSON 类型创建模式（schema）。
- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` - 在 HyperDX 应用中启用支持，允许查询 JSON 数据。