---
slug: /use-cases/observability/clickstack/ingesting-data/schema/map-vs-json
pagination_prev: null
pagination_next: null
description: 'Когда использовать тип Map вместо типа JSON для атрибутов в ClickStack'
sidebar_label: 'Map или тип JSON'
title: 'Map или тип JSON для ClickStack'
doc_type: 'reference'
keywords: ['clickstack', 'json', 'map', 'атрибуты', 'schema', 'обсервабилити']
---

import BetaBadge from '@theme/badges/BetaBadge';

[Schema по умолчанию](/use-cases/observability/clickstack/ingesting-data/schemas) в ClickStack хранит атрибуты resource, scope, log и span в столбцах `Map(LowCardinality(String), String)`. ClickHouse также поддерживает строго типизированный [`JSON` type](/interfaces/formats/JSON), а ClickStack поддерживает его использование вместо `Map` в бета-режиме.

**Для типичных рабочих нагрузок обсервабилити рекомендуем оставить [schema по умолчанию на основе `Map`](/use-cases/observability/clickstack/ingesting-data/schemas).** Тип JSON доступен пользователям, которые хотят оценить его на рабочих нагрузках с небольшим и стабильным набором ключей атрибутов, но для общего использования эта schema не рекомендуется.

## Почему Map — рекомендуемый вариант по умолчанию \{#why-map\}

В данных обсервабилити преобладают атрибуты: атрибуты ресурса, атрибуты scope, а также атрибуты span и логов. Эти наборы обычно велики, имеют высокую кардинальность и поступают с высокой скоростью. Выбранная для этих атрибутов schema — главный фактор, определяющий стоимость приёма и структуру хранения.

`Map(LowCardinality(String), String)` хранит ключи и значения в единой структуре. Исторически недостаток `Map` состоял в том, что для чтения одного ключа приходилось читать весь столбец map целиком. Теперь это уже не так: ClickHouse поддерживает [сериализация Map по бакетам](/sql-reference/data-types/map#bucketed-map-serialization), которая разбивает map на бакеты, поэтому запросы читают только нужные им бакеты. В сочетании с [текстовыми индексами](/engines/table-engines/mergetree-family/textindexes) по ключам и значениям map — именно так настроена [schema ClickStack по умолчанию](/use-cases/observability/clickstack/ingesting-data/schemas) — это делает `Map` быстрым для выборочного чтения без каких-либо дополнительных затрат на приём при появлении новых ключей.

На практике это означает:

* **Стабильная стоимость приёма по мере роста числа ключей.** Добавление нового ключа атрибута не меняет структуру столбцов на диске и не создаёт новые файлы столбцов. Стоимость приёма ограничена объёмом данных, а не кардинальностью ключей.
* **Без взрывного роста метаданных.** Количество файлов столбцов на диске не зависит от числа уникальных ключей атрибутов.
* **Выборочный поиск через индексы.** Текстовые индексы по ключам и значениям map позволяют выполнять точечный поиск без сканирования каждой строки.
* **Предсказуемое поведение при высокой нагрузке.** Map справляется со всплесками и бесcхемными наборами атрибутов, типичными для трассировки и логов, без накладных расходов на каждый ключ.

## Почему не JSON по умолчанию \{#why-not-json\}

Тип `JSON` использует другой подход: при вставке ClickHouse динамически создаёт отдельный строго типизированный подстолбец для каждого обнаруженного пути. При чтении это выглядит привлекательно, поскольку читаются только запрошенные подстолбцы, типы сохраняются и приведение типов во время выполнения запроса не требуется.

Цена этого подхода проявляется на этапе приёма. Создание и сопровождение множества динамических подстолбцов увеличивает накладные расходы при записи и усложняет метаданные. Для рабочих нагрузок обсервабилити, где обычно встречаются очень большие или сильно меняющиеся наборы атрибутов и высокий объём приёма данных, эти накладные расходы оказываются существенными. Ограничение [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) позволяет сдержать ущерб, перенося лишние пути в общий столбец, но доступ к общему столбцу медленнее, чем к выделенным подстолбцам, а значит, снижается преимущество при чтении, ради которого JSON и выбирают.

Поскольку сериализация `Map` по бакетам устраняет большую часть исторических накладных расходов `Map` при чтении, преимущество `JSON` на этапе чтения больше не перевешивает его стоимость на этапе приёма для типичных рабочих нагрузок обсервабилити.

## Когда JSON всё ещё может быть уместен \{#when-to-consider-json\}

Тип JSON может быть разумным выбором, если *все* следующие условия выполняются одновременно:

* Набор ключей атрибутов **небольшой и стабильный**, то есть у вас не появляются тысячи уникальных ключей, а новые ключи возникают редко.
* Пропускная способность приёма **умеренная** по сравнению с кардинальностью атрибутов.
* Вам нужен **строго типизированный доступ** к атрибутам без CAST во время выполнения запроса (числа остаются числами, логические значения — логическими значениями).
* Вы готовы использовать **бета-функцию** в ClickStack и принимаете, что интеграция может измениться.

Если хотя бы одно из этих условий не выполняется, используйте [schema на основе `Map` по умолчанию](/use-cases/observability/clickstack/ingesting-data/schemas).

## Бета-статус \{#beta-status\}

<BetaBadge />

:::warning Бета-функция, не готова для продакшена
Поддержка типа JSON в **ClickStack** — это **бета-функция**. Хотя сам тип JSON готов для продакшена в ClickHouse 25.3+, его интеграция с ClickStack всё ещё активно развивается и может иметь ограничения, в будущем измениться или содержать ошибки.
:::

В ClickStack поддержка типа JSON в статусе бета доступна начиная с версии `2.0.4`.

## Включение поддержки JSON \{#enabling-json-support\}

Чтобы использовать schema с типом JSON вместо [schema по умолчанию на основе `Map`](/use-cases/observability/clickstack/ingesting-data/schemas), задайте следующие переменные окружения.

| Переменная                                                      | Где задаётся                   | Назначение                                                                                                 |
| --------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` | OTel collector                 | Создаёт schema в ClickHouse с использованием типа JSON.                                                    |
| `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`                         | HyperDX (интерфейс ClickStack) | Включает поддержку запросов к schema с типом JSON на уровне приложения. Только для ClickStack Open Source. |

### Управляемый ClickStack \{#managed-clickstack\}

Чтобы включить поддержку JSON в Управляемом ClickStack, до настройки коллектора обратитесь в службу поддержки по адресу support@clickhouse.com. Эту функцию также нужно включить в интерфейсе ClickStack (HyperDX) в ClickHouse Cloud.

Задайте `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` для коллектора. Например:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
```

### ClickStack с открытым исходным кодом \{#oss-clickstack\}

Установите `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` во всех развертываниях, включающих коллектор, а также `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` на уровне приложения HyperDX, чтобы можно было выполнять запросы к schema типа JSON.

Например:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
```

## Миграция с schema на основе Map на JSON \{#migrating-from-map-to-json\}

:::important Обратная совместимость
[тип JSON](/interfaces/formats/JSON) **не обеспечивает обратную совместимость** с существующими schema на основе Map. При включении этой функции создаются новые таблицы с типом `JSON`, и требуется ручная миграция данных.
:::

Чтобы выполнить миграцию со [schemas на основе Map, используемых по умолчанию](/use-cases/observability/clickstack/ingesting-data/schemas), выполните следующие шаги:

<VerticalStepper headerLevel="h3">
  ### Остановите OTel коллектор \{#stop-the-collector\}

  ### Переименуйте существующие таблицы и обновите источники данных \{#rename-existing-tables-sources\}

  Переименуйте существующие таблицы и обновите источники данных в HyperDX.

  Например:

  ```sql
  RENAME TABLE otel_logs TO otel_logs_map;
  RENAME TABLE otel_metrics TO otel_metrics_map;
  ```

  ### Разверните коллектор \{#deploy-the-collector\}

  Разверните коллектор, задав `OTEL_AGENT_FEATURE_GATE_ARG`.

  ### Перезапустите контейнер HyperDX с поддержкой JSON schema \{#restart-the-hyperdx-container\}

  ```shell
  export BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true
  ```

  ### Создайте новые источники данных \{#create-new-data-sources\}

  Создайте в HyperDX новые источники данных, указывающие на JSON-таблицы.
</VerticalStepper>

### Перенос существующих данных (необязательно) \{#migrating-existing-data\}

Чтобы перенести старые данные в новые JSON-таблицы:

```sql
INSERT INTO otel_logs SELECT * FROM otel_logs_map;
INSERT INTO otel_metrics SELECT * FROM otel_metrics_map;
```

:::warning
Рекомендуется только для наборов данных размером менее ~10 миллиардов строк. Данные, ранее хранившиеся в типе Map, не сохраняли точность типов (все значения были строками). В результате эти старые данные будут отображаться в новой schema как строки, пока не устареют, поэтому на фронтенде потребуется приведение типов. Для новых данных типы будут сохраняться при использовании типа JSON.
:::