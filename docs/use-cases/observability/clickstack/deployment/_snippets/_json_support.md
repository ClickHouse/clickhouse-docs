import BetaBadge from '@theme/badges/BetaBadge';

## JSON type support {#json-type-support}

<BetaBadge/>

:::warning Beta Feature
JSON type support in ClickStack is a **beta feature**. While it is under active development and supported by the ClickHouse team, it may have limitations, change in the future, or contain bugs. 

**For production use**, ensure you are running **ClickHouse version 25.3 or later**, where the JSON type is production-ready. For earlier versions of ClickHouse, the JSON type is not recommended for production use.
:::

ClickStack has beta support for the [JSON type](/interfaces/formats/JSON) from version `2.0.4`.

For the benefits of this type see [Benefits of the JSON type](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type).

In order to enable support for the JSON type users must set the following environment variables:

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` - enables support in the OTel collector, ensuring schemas are created using the JSON type.
- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` - enables support in the HyperDX application, allowing JSON data to be queried.