import BetaBadge from '@theme/badges/BetaBadge';

## Поддержка типа JSON \\{#json-type-support\\}

<BetaBadge/>

:::warning Beta Feature - not production ready
Поддержка типа JSON в **ClickStack** находится в статусе **бета-версии**. Хотя сам тип JSON готов к промышленной эксплуатации в ClickHouse 25.3+, его интеграция в ClickStack всё ещё активно разрабатывается и может иметь ограничения, изменяться в будущем или содержать ошибки.
:::

Поддержка [типа JSON](/interfaces/formats/JSON) в ClickStack доступна в статусе бета-версии, начиная с версии `2.0.4`.

О преимуществах этого типа см. раздел [Преимущества типа JSON](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type).

Чтобы включить поддержку типа JSON, вам необходимо задать следующие переменные окружения:

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` — включает поддержку в OTel collector, гарантируя, что схемы создаются с использованием типа JSON.
- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` — включает поддержку в приложении HyperDX, позволяя выполнять запросы к данным JSON.