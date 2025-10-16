import BetaBadge from '@theme/badges/BetaBadge';

## JSON 类型支持 {#json-type-support}

<BetaBadge/>

ClickStack 自版本 `2.0.4` 起开始对 [JSON 类型](/interfaces/formats/JSON) 提供测试支持。

有关此类型的好处，请参见 [JSON 类型的好处](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type)。

为了启用对 JSON 类型的支持，用户必须设置以下环境变量：

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` - 在 OTel 收集器中启用支持，确保使用 JSON 类型创建模式。
- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` - 在 HyperDX 应用程序中启用支持，允许查询 JSON 数据。
