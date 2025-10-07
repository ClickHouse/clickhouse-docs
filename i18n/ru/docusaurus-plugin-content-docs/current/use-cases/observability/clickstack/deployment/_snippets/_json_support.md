import BetaBadge from '@theme/badges/BetaBadge';

## Поддержка типа JSON {#json-type-support}

<BetaBadge/>

ClickStack имеет бета-поддержку [типа JSON](/interfaces/formats/JSON) с версии `2.0.4`.

Для получения преимуществ этого типа смотрите [Преимущества типа JSON](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type).

Чтобы включить поддержку типа JSON, пользователи должны установить следующие переменные окружения:

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` - включает поддержку в OTel collector, гарантируя, что схемы создаются с использованием типа JSON.
- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` - включает поддержку в приложении HyperDX, позволяя запрашивать данные в формате JSON.