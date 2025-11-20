import BetaBadge from '@theme/badges/BetaBadge';



## JSON 类型支持 {#json-type-support}

<BetaBadge />

:::warning Beta 功能 - 尚未达到生产就绪状态
**ClickStack** 中的 JSON 类型支持是一个 **beta 功能**。虽然 JSON 类型本身在 ClickHouse 25.3+ 中已达到生产就绪状态,但其在 ClickStack 中的集成仍在积极开发中,可能存在限制、未来可能发生变化或包含缺陷。
:::

ClickStack 从版本 `2.0.4` 开始提供对 [JSON 类型](/interfaces/formats/JSON) 的 beta 支持。

有关此类型的优势,请参阅 [JSON 类型的优势](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type)。

要启用 JSON 类型支持,用户必须设置以下环境变量:

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` - 在 OTel collector 中启用支持,确保使用 JSON 类型创建 schema。
- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` - 在 HyperDX 应用程序中启用支持,允许查询 JSON 数据。
