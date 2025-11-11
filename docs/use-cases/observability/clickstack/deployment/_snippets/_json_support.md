import BetaBadge from '@theme/badges/BetaBadge';

## JSON type support {#json-type-support}

<BetaBadge/>

:::warning Beta Feature
JSON type support in **ClickStack** is a **beta feature**. While the JSON type itself is production-ready in ClickHouse 25.3+, its integration within ClickStack is still under active development and may have limitations, change in the future, or contain bugs.
:::

ClickStack has beta support for the [JSON type](/interfaces/formats/JSON) from version `2.0.4`.

For the benefits of this type see [Benefits of the JSON type](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type).

In order to enable support for the JSON type users must set the following environment variables:

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` - enables support in the OTel collector, ensuring schemas are created using the JSON type.
- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` - enables support in the HyperDX application, allowing JSON data to be queried.