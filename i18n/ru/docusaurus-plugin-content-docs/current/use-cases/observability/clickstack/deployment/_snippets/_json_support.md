import BetaBadge from '@theme/badges/BetaBadge';



## Поддержка типа JSON {#json-type-support}

<BetaBadge />

:::warning Бета-функция — не готова для production
Поддержка типа JSON в **ClickStack** является **бета-функцией**. Хотя сам тип JSON готов для использования в production в ClickHouse 25.3+, его интеграция в ClickStack всё ещё находится в активной разработке и может иметь ограничения, измениться в будущем или содержать ошибки.
:::

ClickStack имеет бета-поддержку [типа JSON](/interfaces/formats/JSON) начиная с версии `2.0.4`.

О преимуществах этого типа см. [Преимущества типа JSON](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type).

Для включения поддержки типа JSON необходимо установить следующие переменные окружения:

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` — включает поддержку в OTel collector, обеспечивая создание схем с использованием типа JSON.
- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` — включает поддержку в приложении HyperDX, позволяя выполнять запросы к данным JSON.
