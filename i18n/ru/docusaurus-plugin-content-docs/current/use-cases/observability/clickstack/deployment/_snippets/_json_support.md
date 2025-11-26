import BetaBadge from '@theme/badges/BetaBadge';



## Поддержка типа JSON {#json-type-support}

<BetaBadge/>

:::warning Функция в статусе бета-версии — не предназначена для продакшена
Поддержка типа JSON в **ClickStack** является **бета-функцией**. Хотя сам тип JSON готов к использованию в продакшене в ClickHouse 25.3+, его интеграция в ClickStack всё ещё активно дорабатывается и может иметь ограничения, изменяться в будущем или содержать ошибки.
:::

ClickStack поддерживает [тип JSON](/interfaces/formats/JSON) в режиме бета, начиная с версии `2.0.4`.

Информацию о преимуществах этого типа см. в разделе [Преимущества типа JSON](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type).

Чтобы включить поддержку типа JSON, пользователям необходимо задать следующие переменные окружения:

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` — включает поддержку в OTel collector, гарантируя, что схемы создаются с использованием типа JSON.
- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` — включает поддержку в приложении HyperDX, позволяя выполнять запросы к данным JSON.
