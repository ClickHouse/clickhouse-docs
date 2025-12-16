---
sidebar_label: 'Обзор'
slug: /integrations/dbt
sidebar_position: 1
description: 'Вы можете преобразовывать и моделировать данные в ClickHouse с помощью dbt'
title: 'Интеграция dbt и ClickHouse'
keywords: ['dbt', 'преобразование данных', 'инженерия данных для аналитики', 'SQL-моделирование', 'конвейер ELT']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_integration'
  - website: 'https://github.com/ClickHouse/dbt-clickhouse'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Интеграция dbt с ClickHouse {#integrate-dbt-clickhouse}

<ClickHouseSupportedBadge/>

## Адаптер dbt-clickhouse {#dbt-clickhouse-adapter}

**dbt** (data build tool) позволяет инженерам по аналитике преобразовывать данные в своих хранилищах, просто записывая команды SELECT. dbt отвечает за материализацию этих команд SELECT в объекты базы данных в виде таблиц и представлений, выполняя шаг T в процессе [Extract Load and Transform (ELT) — извлечение, загрузка и преобразование](https://en.wikipedia.org/wiki/Extract,_load,_transform). Вы можете создать модель, определяемую командой SELECT.

В dbt эти модели можно связывать между собой и организовывать послойно, чтобы создавать более высокоуровневые сущности. Шаблонный SQL, необходимый для связывания моделей, генерируется автоматически. Кроме того, dbt определяет зависимости между моделями и обеспечивает их создание в правильном порядке с использованием ориентированного ациклического графа (DAG).

dbt совместим с ClickHouse с помощью [адаптера, поддерживаемого ClickHouse](https://github.com/ClickHouse/dbt-clickhouse).

<TOCInline toc={toc}  maxHeadingLevel={2} />

## Поддерживаемые возможности {#supported-features}

Список поддерживаемых возможностей:

- [x] Материализация таблицы
- [x] Материализация представления
- [x] Инкрементальная материализация
- [x] Микробатчовая инкрементальная материализация
- [x] Материализации materialized view (используют форму `TO` для MATERIALIZED VIEW, экспериментальная функция)
- [x] Seeds
- [x] Sources
- [x] Генерация документации
- [x] Тесты
- [x] Снимки (snapshots)
- [x] Большинство макросов dbt-utils (теперь входят в dbt-core)
- [x] Эфемерная материализация
- [x] Материализация distributed таблицы (экспериментально)
- [x] Инкрементальная материализация distributed таблицы (экспериментально)
- [x] Контракты
- [x] Специфичные для ClickHouse конфигурации столбцов (Codec, TTL...)
- [x] Специфичные для ClickHouse настройки таблиц (индексы, проекции...)

Поддерживаются все возможности вплоть до dbt-core 1.10, включая флаг `--sample`, а также устранены все предупреждения об устаревании для будущих релизов. **Интеграции с каталогами** (например, Iceberg), представленные в dbt 1.10, пока ещё не поддерживаются нативно в адаптере, но доступны обходные решения. Подробности см. в разделе [Catalog Support](/integrations/dbt/features-and-configurations#catalog-support).

Этот адаптер всё ещё недоступен для использования внутри [dbt Cloud](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview), но мы ожидаем, что он скоро станет доступен. Пожалуйста, свяжитесь со службой поддержки, чтобы получить дополнительную информацию.

## Концепции dbt и поддерживаемые материализации {#concepts-and-supported-materializations}

dbt вводит концепцию модели. Она определяется как SQL-выражение, которое потенциально объединяет множество таблиц. Модель может быть «материализована» несколькими способами. Материализация представляет собой стратегию построения `SELECT`-запроса модели. Код, лежащий в основе материализации, — это шаблонный SQL, который оборачивает ваш `SELECT`-запрос в команду для создания нового или обновления существующего объекта (relation).

dbt предоставляет 5 типов материализаций. Все они поддерживаются в `dbt-clickhouse`:

* **view** (по умолчанию): Модель создаётся как view в базе данных. В ClickHouse она создаётся как [view](/sql-reference/statements/create/view).
* **table**: Модель создаётся как таблица в базе данных. В ClickHouse она создаётся как [table](/sql-reference/statements/create/table).
* **ephemeral**: Модель непосредственно не создаётся в базе данных, а вместо этого подставляется в зависимые модели как CTE (Common Table Expressions).
* **incremental**: Модель изначально материализуется как таблица, а в последующих запусках dbt добавляет новые строки и обновляет изменённые строки в этой таблице.
* **materialized view**: Модель создаётся как materialized view в базе данных. В ClickHouse она создаётся как [materialized view](/sql-reference/statements/create/view#materialized-view).

Дополнительный синтаксис и конструкции определяют, как эти модели должны обновляться при изменении их исходных данных. В целом dbt рекомендует начинать с материализации view до тех пор, пока производительность не станет проблемой. Материализация table повышает производительность выполнения запросов за счёт сохранения результатов запроса модели как таблицы, ценой увеличенного потребления дискового пространства. Инкрементальный подход развивает эту идею дальше, позволяя фиксировать последующие обновления исходных данных в целевой таблице.

Текущий [адаптер](https://github.com/silentsokolov/dbt-clickhouse) для ClickHouse также поддерживает материализации **dictionary**, **distributed table** и **distributed incremental**. Адаптер также поддерживает dbt [snapshots](https://docs.getdbt.com/docs/building-a-dbt-project/snapshots#check-strategy) и [seeds](https://docs.getdbt.com/docs/building-a-dbt-project/seeds).

Следующие возможности являются [экспериментальными](https://clickhouse.com/docs/en/beta-and-experimental-features) в `dbt-clickhouse`:

| Тип                                     | Поддерживается?   | Подробности                                                                                                                                                                                                                                     |
|-----------------------------------------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Материализация materialized view        | ДА, эксперимент   | Создаёт [materialized view](https://clickhouse.com/docs/en/materialized-view).                                                                                                                                                                 |
| Материализация distributed table        | ДА, эксперимент   | Создаёт [distributed таблицу](https://clickhouse.com/docs/en/engines/table-engines/special/distributed).                                                                                                                                       |
| Материализация distributed incremental  | ДА, эксперимент   | Инкрементальная модель, основанная на той же идее, что и distributed таблица. Обратите внимание, что поддерживаются не все стратегии; для получения дополнительной информации посетите [эту страницу](https://github.com/ClickHouse/dbt-clickhouse?tab=readme-ov-file#distributed-incremental-materialization). |
| Материализация dictionary               | ДА, эксперимент   | Создаёт [словарь](https://clickhouse.com/docs/en/engines/table-engines/special/dictionary).                                                                                                                                                    |

## Настройка dbt и адаптера ClickHouse {#setup-of-dbt-and-the-clickhouse-adapter}

### Установите dbt-core и dbt-clickhouse {#install-dbt-core-and-dbt-clickhouse}

dbt предоставляет несколько вариантов установки интерфейса командной строки (CLI), которые подробно описаны [здесь](https://docs.getdbt.com/dbt-cli/install/overview). Рекомендуем устанавливать dbt и dbt-clickhouse с помощью `pip`.

```sh
pip install dbt-core dbt-clickhouse
```


### Укажите dbt параметры подключения для нашего экземпляра ClickHouse. {#provide-dbt-with-the-connection-details-for-our-clickhouse-instance}

Настройте профиль `clickhouse-service` в файле `~/.dbt/profiles.yml` и задайте значения параметров schema, host, port, user и password. Полный список параметров конфигурации подключения доступен на странице [Features and configurations](/integrations/dbt/features-and-configurations):

```yaml
clickhouse-service:
  target: dev
  outputs:
    dev:
      type: clickhouse
      schema: [ default ] # ClickHouse database for dbt models

      # Optional
      host: [ localhost ]
      port: [ 8123 ]  # Defaults to 8123, 8443, 9000, 9440 depending on the secure and driver settings 
      user: [ default ] # User for all database operations
      password: [ <empty string> ] # Password for the user
      secure: True  # Use TLS (native protocol) or HTTPS (http protocol)
```


### Создание проекта dbt {#create-a-dbt-project}

Теперь вы можете использовать этот профиль в одном из существующих проектов или создать новый с помощью следующей команды:

```sh
dbt init project_name
```

В каталоге `project_name` обновите файл `dbt_project.yml`, чтобы указать имя профиля подключения к серверу ClickHouse.

```yaml
profile: 'clickhouse-service'
```


### Тестирование подключения {#test-connection}

Выполните `dbt debug` с помощью утилиты CLI, чтобы убедиться, что dbt может подключиться к ClickHouse. Проверьте, что в выводе присутствует строка `Connection test: [OK connection ok]`, подтверждающая успешное подключение.

Перейдите на [страницу с руководствами](/integrations/dbt/guides), чтобы узнать больше о том, как использовать dbt с ClickHouse.

### Тестирование и развертывание моделей (CI/CD) {#testing-and-deploying-your-models-ci-cd}

Существует множество способов протестировать и развернуть ваш проект dbt. В dbt есть рекомендации по [лучшим практикам рабочих процессов](https://docs.getdbt.com/best-practices/best-practice-workflows#pro-tips-for-workflows) и [CI‑задачам](https://docs.getdbt.com/docs/deploy/ci-jobs). Мы рассмотрим несколько стратегий, но имейте в виду, что их, возможно, потребуется существенно адаптировать под ваш конкретный сценарий использования.

#### CI/CD с простыми проверками данных и модульными тестами {#ci-with-simple-data-tests-and-unit-tests}

Один из простых способов запустить CI-конвейер — развернуть кластер ClickHouse внутри job'а и затем прогнать модели на нём. Вы можете загрузить демонстрационные данные в этот кластер перед запуском моделей. Для заполнения staging-окружения подмножеством продукционных данных можно просто использовать [seed](https://docs.getdbt.com/reference/commands/seed).

После загрузки данных вы можете запустить [проверки данных](https://docs.getdbt.com/docs/build/data-tests) и [модульные тесты](https://docs.getdbt.com/docs/build/unit-tests).

Этап CD может быть таким же простым, как выполнение `dbt build` для продукционного кластера ClickHouse.

#### Более полный этап CI/CD: используйте актуальные данные, тестируйте только затронутые модели {#more-complete-ci-stage}

Одна из распространённых стратегий — использовать задания [Slim CI](https://docs.getdbt.com/best-practices/best-practice-workflows#run-only-modified-models-to-test-changes-slim-ci), при которых повторно развёртываются только изменённые модели (и их зависимости, а также зависящие от них объекты). Этот подход использует артефакты из ваших production‑запусков (например, [dbt manifest](https://docs.getdbt.com/reference/artifacts/manifest-json)), чтобы сократить время выполнения проекта и убедиться в отсутствии расхождений схем между окружениями.

Чтобы поддерживать синхронизацию сред разработки и избежать запуска моделей на устаревших развёртываниях, вы можете использовать [clone](https://docs.getdbt.com/reference/commands/clone) или даже [defer](https://docs.getdbt.com/reference/node-selection/defer).

Мы рекомендуем использовать отдельный кластер или сервис ClickHouse для тестовой среды (то есть staging‑окружения), чтобы избежать влияния на работу вашего production‑окружения. Чтобы тестовая среда была репрезентативной, важно использовать подмножество ваших production‑данных, а также запускать dbt таким образом, чтобы предотвратить расхождение схем между окружениями.

- Если вам не нужны самые свежие данные для тестирования, вы можете восстановить резервную копию ваших production‑данных в staging‑окружении.
- Если вам нужны свежие данные для тестирования, вы можете использовать комбинацию табличной функции [`remoteSecure()`](/sql-reference/table-functions/remote) и refreshable materialized views для вставки с нужной частотой. Другой вариант — использовать объектное хранилище как промежуточный слой: периодически выгружать данные из вашего production‑сервиса, а затем импортировать их в staging‑окружение, используя table functions для объектного хранилища или ClickPipes (для непрерывной ингестии).

Использование выделенного окружения для CI‑тестирования также позволяет выполнять ручное тестирование без воздействия на ваше production‑окружение. Например, вы можете направить BI‑инструмент на это окружение для тестирования.

Для развёртывания (то есть шага CD) мы рекомендуем использовать артефакты из ваших production‑развёртываний, чтобы обновлять только те модели, которые изменились. Для этого требуется настроить объектное хранилище (например, S3) как промежуточное хранилище для артефактов dbt. После настройки вы можете выполнить команду `dbt build --select state:modified+ --state path/to/last/deploy/state.json`, чтобы выборочно перестроить минимальное количество моделей, необходимое с учётом изменений после последнего production‑запуска.

## Устранение распространённых неполадок {#troubleshooting-common-issues}

### Подключения {#troubleshooting-connections}

Если у вас возникают проблемы с подключением к ClickHouse из dbt, убедитесь, что выполняются следующие условия:

- Движок должен быть одним из [поддерживаемых движков](/integrations/dbt/features-and-configurations#supported-table-engines).
- У вас должны быть достаточные права доступа к базе данных.
- Если вы не используете табличный движок по умолчанию для этой базы данных, укажите табличный движок в конфигурации модели.

### Понимание долго выполняющихся операций {#understanding-long-running-operations}

Некоторые операции могут выполняться дольше, чем ожидается, из‑за отдельных запросов ClickHouse. Чтобы получить больше информации о том, какие запросы занимают больше времени, увеличьте [уровень логирования](https://docs.getdbt.com/reference/global-configs/logs#log-level) до `debug` — это выведет время, затраченное каждым запросом. Например, это можно сделать, добавив `--log-level debug` к командам dbt.

## Ограничения {#limitations}

Текущий адаптер ClickHouse для dbt имеет несколько ограничений, о которых вам следует знать:

- Плагин использует синтаксис, требующий ClickHouse версии 25.3 или новее. Мы не тестируем более старые версии ClickHouse. В настоящее время мы также не тестируем Replicated таблицы.
- Разные запуски `dbt-adapter` могут конфликтовать, если выполняются одновременно, поскольку внутри они могут использовать одинаковые имена таблиц для одних и тех же операций. Для получения дополнительной информации смотрите задачу [#420](https://github.com/ClickHouse/dbt-clickhouse/issues/420).
- Адаптер в настоящее время материализует модели как таблицы, используя [INSERT INTO SELECT](https://clickhouse.com/docs/sql-reference/statements/insert-into#inserting-the-results-of-select). По сути, это означает дублирование данных, если запуск выполняется повторно. Очень большие наборы данных (PB) могут приводить к крайне длительному времени выполнения, делая некоторые модели непрактичными. Для повышения производительности используйте ClickHouse Materialized Views, реализуя представление как `materialized: materialization_view`. Кроме того, стремитесь минимизировать количество строк, возвращаемых любым запросом, используя `GROUP BY`, когда это возможно. Предпочитайте модели, которые агрегируют данные, а не те, которые просто трансформируют их, сохраняя количество строк источника.
- Чтобы использовать Distributed таблицы для представления модели, необходимо вручную создать базовые Replicated таблицы на каждом узле. Distributed таблица, в свою очередь, может быть создана поверх них. Адаптер не управляет созданием кластера.
- Когда dbt создаёт отношение (table/view) в базе данных, оно обычно создаётся как: `{{ database }}.{{ schema }}.{{ table/view id }}`. В ClickHouse нет понятия схем. Поэтому адаптер использует `{{schema}}.{{ table/view id }}`, где `schema` — это база данных ClickHouse.
- Эфемерные модели/CTE не работают, если они размещены перед `INSERT INTO` в операторе вставки ClickHouse, см. https://github.com/ClickHouse/ClickHouse/issues/30323. Это не должно затрагивать большинство моделей, но следует внимательно относиться к тому, где эфемерная модель размещается в определениях моделей и других SQL-командах. <!-- TODO review this limitation, looks like the issue was already closed and the fix was introduced in 24.10 -->

## Fivetran {#fivetran}

Коннектор `dbt-clickhouse` также доступен для использования в [преобразованиях Fivetran](https://fivetran.com/docs/transformations/dbt), обеспечивая бесшовную интеграцию и возможности трансформации непосредственно в платформе Fivetran с использованием `dbt`.