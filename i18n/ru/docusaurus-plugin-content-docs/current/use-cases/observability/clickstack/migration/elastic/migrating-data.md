---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-data
title: 'Перенос данных в ClickStack из Elastic'
pagination_prev: null
pagination_next: null
sidebar_label: 'Перенос данных'
sidebar_position: 4
description: 'Перенос данных в стек наблюдаемости ClickHouse из Elastic'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---



## Стратегия параллельной эксплуатации {#parallel-operation-strategy}

При миграции с Elastic на ClickStack для задач наблюдаемости мы рекомендуем подход **параллельной эксплуатации**, а не попытку переноса исторических данных. Такая стратегия даёт несколько преимуществ:

1. **Минимальный риск**: запуская обе системы одновременно, вы сохраняете доступ к существующим данным и дашбордам, одновременно проверяя работу ClickStack и знакомя пользователей с новой системой.
2. **Естественное устаревание данных**: большинство данных наблюдаемости имеют ограниченный срок хранения (обычно 30 дней или меньше), что обеспечивает естественный переход по мере удаления устаревших данных в Elastic.
3. **Упрощённая миграция**: нет необходимости в сложных инструментах или процессах для переноса исторических данных между системами.
<br/>
:::note Перенос данных
Мы демонстрируем подход к переносу ключевых данных из Elasticsearch в ClickHouse в разделе ["Перенос данных"](#migrating-data). Его не следует использовать для больших наборов данных, поскольку он редко бывает производительным — ограничением является способность Elasticsearch эффективно экспортировать данные, при этом поддерживается только формат JSON.
:::

### Шаги реализации {#implementation-steps}

1. **Настройте двойной приём данных**
<br/>
Настройте конвейер сбора данных так, чтобы отправлять данные одновременно и в Elastic, и в ClickStack. 

Конкретный способ зависит от используемых сейчас агентов сбора — см. ["Перенос агентов"](/use-cases/observability/clickstack/migration/elastic/migrating-agents).

2. **Отрегулируйте сроки хранения**
<br/>
Настройте параметры TTL в Elastic в соответствии с желаемым сроком хранения. Настройте [TTL](/use-cases/observability/clickstack/production#configure-ttl) в ClickStack для поддержания данных в течение того же периода.

3. **Проверка и сравнение**:
<br/>
- Запускайте запросы в обе системы, чтобы убедиться в согласованности данных
- Сравнивайте производительность запросов и результаты
- Мигрируйте дашборды и алерты в ClickStack. В настоящее время это выполняется вручную.
- Убедитесь, что все критичные дашборды и алерты корректно работают в ClickStack

4. **Постепенный переход**:
<br/>
- По мере естественного истечения срока хранения данных в Elastic пользователи будут всё больше полагаться на ClickStack
- После того как вы убедитесь в ClickStack, можете начинать перенаправлять запросы и дашборды

### Долгосрочное хранение {#long-term-retention}

Для организаций с более длительными сроками хранения:

- Продолжайте параллельную эксплуатацию обеих систем до полного истечения срока хранения данных в Elastic
- Возможности ClickStack по [многоуровневому хранению](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes) помогают эффективно управлять долговременными данными.
- Рассмотрите использование [материализованных представлений](/materialized-view/incremental-materialized-view) для поддержания агрегированных или отфильтрованных исторических данных, позволяя при этом «сырым» данным устаревать и удаляться.

### Сроки миграции {#migration-timeline}

Сроки миграции зависят от ваших требований к хранению данных:

- **Хранение 30 дней**: миграцию можно завершить в течение одного месяца.
- **Более длительное хранение**: продолжайте параллельную эксплуатацию до истечения срока хранения данных в Elastic.
- **Исторические данные**: если это абсолютно необходимо, рассмотрите использование подхода, описанного в разделе [«Перенос данных»](#migrating-data), для импорта отдельных исторических наборов данных.



## Миграция настроек {#migration-settings}

При миграции с Elastic на ClickStack ваши настройки индексирования и хранения необходимо адаптировать под архитектуру ClickHouse. В то время как Elasticsearch полагается на горизонтальное масштабирование и шардинг для производительности и отказоустойчивости и по умолчанию использует несколько шардов, ClickHouse оптимизирован для вертикального масштабирования и обычно показывает наилучшие результаты с меньшим числом шардов.

### Рекомендуемые настройки {#recommended-settings}

Мы рекомендуем начинать с **одного шарда** и масштабировать вертикально. Такая конфигурация подходит для большинства сценариев наблюдаемости и упрощает как управление, так и тонкую настройку производительности запросов.

- **[ClickHouse Cloud](https://clickhouse.com/cloud)**: По умолчанию использует архитектуру с одним шардом и несколькими репликами. Хранилище и вычислительные ресурсы масштабируются независимо, что делает его идеальным для сценариев наблюдаемости с непредсказуемыми паттернами приёма данных и нагрузками, ориентированными на чтение.
- **ClickHouse OSS**: В самоуправляемых развертываниях мы рекомендуем:
  - Начинать с одного шарда
  - Масштабировать вертикально, добавляя CPU и RAM
  - Использовать [многоуровневое хранилище](/observability/managing-data#storage-tiers) для расширения локального диска с помощью S3-совместимого объектного хранилища
  - Использовать [`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication), если требуется высокая доступность
  - Для отказоустойчивости [одной реплики вашего шарда](/engines/table-engines/mergetree-family/replication) обычно достаточно для сценариев наблюдаемости.

### Когда использовать шардинг {#when-to-shard}

Шардинг может потребоваться, если:

- Скорость приёма данных превышает возможности одного узла (обычно >500K строк/с)
- Вам нужна изоляция арендаторов или региональное разделение данных
- Общий объём данных слишком велик для одного сервера, даже с объектным хранилищем

Если вам всё же нужен шардинг, обратитесь к разделу [Горизонтальное масштабирование](/architecture/horizontal-scaling) для рекомендаций по выбору ключей шардинга и настройке распределённых таблиц.

### Срок хранения и TTL {#retention-and-ttl}

ClickHouse использует [TTL-условия](/use-cases/observability/clickstack/production#configure-ttl) в таблицах MergeTree для управления временем жизни данных. Политики TTL могут:

- Автоматически удалять данные с истёкшим сроком хранения
- Перемещать более старые данные в холодное объектное хранилище
- Хранить только свежие, часто запрашиваемые логи на быстром диске

Мы рекомендуем согласовать конфигурацию TTL в ClickHouse с существующими политиками хранения в Elastic, чтобы сохранить единый жизненный цикл данных в процессе миграции. Примеры см. в разделе [TTL-конфигурация ClickStack в продакшене](/use-cases/observability/clickstack/production#configure-ttl).



## Миграция данных {#migrating-data}

Хотя для большинства данных наблюдаемости мы рекомендуем параллельную работу, существуют конкретные случаи, когда может потребоваться прямая миграция данных из Elasticsearch в ClickHouse:

- Небольшие справочные таблицы для обогащения данных (например, сопоставления пользователей, каталоги сервисов)
- Бизнес-данные, хранящиеся в Elasticsearch, которые необходимо коррелировать с данными наблюдаемости — возможности SQL в ClickHouse и интеграции с Business Intelligence упрощают поддержку и выполнение запросов к данным по сравнению с более ограниченными возможностями запросов в Elasticsearch.
- Конфигурационные данные, которые необходимо сохранить при миграции

Этот подход применим только для наборов данных объемом менее 10 миллионов строк, поскольку возможности экспорта Elasticsearch ограничены форматом JSON через HTTP и плохо масштабируются для больших наборов данных.

Следующие шаги позволяют выполнить миграцию одного индекса Elasticsearch в ClickHouse.

<VerticalStepper headerLevel="h3">

### Миграция схемы {#migrate-scheme}

Создайте таблицу в ClickHouse для индекса, мигрируемого из Elasticsearch. Можно сопоставить [типы Elasticsearch с их эквивалентами в ClickHouse](/use-cases/observability/clickstack/migration/elastic/types). В качестве альтернативы можно использовать тип данных JSON в ClickHouse, который будет динамически создавать столбцы соответствующего типа при вставке данных.

Рассмотрим следующее сопоставление Elasticsearch для индекса, содержащего данные `syslog`:

<details>
<summary>Сопоставление Elasticsearch</summary>


```javascripton
GET .ds-logs-system.syslog-default-2025.06.03-000001/_mapping
{
  ".ds-logs-system.syslog-default-2025.06.03-000001": {
    "mappings": {
      "_meta": {
        "managed_by": "fleet",
        "managed": true,
        "package": {
          "name": "system"
        }
      },
      "_data_stream_timestamp": {
        "enabled": true
      },
      "dynamic_templates": [],
      "date_detection": false,
      "properties": {
        "@timestamp": {
          "type": "date",
          "ignore_malformed": false
        },
        "agent": {
          "properties": {
            "ephemeral_id": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "id": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "name": {
              "type": "keyword",
              "fields": {
                "text": {
                  "type": "match_only_text"
                }
              }
            },
            "type": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "version": {
              "type": "keyword",
              "ignore_above": 1024
            }
          }
        },
        "cloud": {
          "properties": {
            "account": {
              "properties": {
                "id": {
                  "type": "keyword",
                  "ignore_above": 1024
                }
              }
            },
            "availability_zone": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "image": {
              "properties": {
                "id": {
                  "type": "keyword",
                  "ignore_above": 1024
                }
              }
            },
            "instance": {
              "properties": {
                "id": {
                  "type": "keyword",
                  "ignore_above": 1024
                }
              }
            },
            "machine": {
              "properties": {
                "type": {
                  "type": "keyword",
                  "ignore_above": 1024
                }
              }
            },
            "provider": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "region": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "service": {
              "properties": {
                "name": {
                  "type": "keyword",
                  "fields": {
                    "text": {
                      "type": "match_only_text"
                    }
                  }
                }
              }
            }
          }
        },
        "data_stream": {
          "properties": {
            "dataset": {
              "type": "constant_keyword",
              "value": "system.syslog"
            },
            "namespace": {
              "type": "constant_keyword",
              "value": "default"
            },
            "type": {
              "type": "constant_keyword",
              "value": "logs"
            }
          }
        },
        "ecs": {
          "properties": {
            "version": {
              "type": "keyword",
              "ignore_above": 1024
            }
          }
        },
        "elastic_agent": {
          "properties": {
            "id": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "snapshot": {
              "type": "boolean"
            },
            "version": {
              "type": "keyword",
              "ignore_above": 1024
            }
          }
        },
        "event": {
          "properties": {
            "agent_id_status": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "dataset": {
              "type": "constant_keyword",
              "value": "system.syslog"
            },
            "ingested": {
              "type": "date",
              "format": "strict_date_time_no_millis||strict_date_optional_time||epoch_millis",
              "ignore_malformed": false
            },
            "module": {
              "type": "constant_keyword",
              "value": "system"
            },
            "timezone": {
              "type": "keyword",
              "ignore_above": 1024
            }
          }
        },
        "host": {
          "properties": {
            "architecture": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "containerized": {
              "type": "boolean"
            },
            "hostname": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "id": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "ip": {
              "type": "ip"
            },
            "mac": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "name": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "os": {
              "properties": {
                "build": {
                  "type": "keyword",
                  "ignore_above": 1024
                },
                "codename": {
                  "type": "keyword",
                  "ignore_above": 1024
                },
                "family": {
                  "type": "keyword",
                  "ignore_above": 1024
                },
                "kernel": {
                  "type": "keyword",
                  "ignore_above": 1024
                },
                "name": {
                  "type": "keyword",
                  "fields": {
                    "text": {
                      "type": "match_only_text"
                    }
                  }
                },
                "platform": {
                  "type": "keyword",
                  "ignore_above": 1024
                },
                "type": {
                  "type": "keyword",
                  "ignore_above": 1024
                },
                "version": {
                  "type": "keyword",
                  "ignore_above": 1024
                }
              }
            }
          }
        },
        "input": {
          "properties": {
            "type": {
              "type": "keyword",
              "ignore_above": 1024
            }
          }
        },
        "log": {
          "properties": {
            "file": {
              "properties": {
                "path": {
                  "type": "keyword",
                  "fields": {
                    "text": {
                      "type": "match_only_text"
                    }
                  }
                }
              }
            },
            "offset": {
              "type": "long"
            }
          }
        },
        "message": {
          "type": "match_only_text"
        },
        "process": {
          "properties": {
            "name": {
              "type": "keyword",
              "fields": {
                "text": {
                  "type": "match_only_text"
                }
              }
            },
            "pid": {
              "type": "long"
            }
          }
        },
        "system": {
          "properties": {
            "syslog": {
              "type": "object"
            }
          }
        }
      }
    }
  }
}
```

</details>

Эквивалентная схема таблицы ClickHouse:

<details>
  <summary>Схема ClickHouse</summary>

  ```sql
  SET enable_json_type = 1;

  CREATE TABLE logs_system_syslog
  (
      `@timestamp` DateTime,
      `agent` Tuple(
          ephemeral_id String,
          id String,
          name String,
          type String,
          version String),
      `cloud` Tuple(
          account Tuple(
              id String),
          availability_zone String,
          image Tuple(
              id String),
          instance Tuple(
              id String),
          machine Tuple(
              type String),
          provider String,
          region String,
          service Tuple(
              name String)),
      `data_stream` Tuple(
          dataset String,
          namespace String,
          type String),
      `ecs` Tuple(
          version String),
      `elastic_agent` Tuple(
          id String,
          snapshot UInt8,
          version String),
      `event` Tuple(
          agent_id_status String,
          dataset String,
          ingested DateTime,
          module String,
          timezone String),
      `host` Tuple(
          architecture String,
          containerized UInt8,
          hostname String,
          id String,
          ip Array(Variant(IPv4, IPv6)),
          mac Array(String),
          name String,
          os Tuple(
              build String,
              codename String,
              family String,
              kernel String,
              name String,
              platform String,
              type String,
              version String)),
      `input` Tuple(
          type String),
      `log` Tuple(
          file Tuple(
              path String),
          offset Int64),
      `message` String,
      `process` Tuple(
          name String,
          pid Int64),
      `system` Tuple(
          syslog JSON)
  )
  ENGINE = MergeTree
  ORDER BY (`host.name`, `@timestamp`)
  ```
</details>

Обратите внимание:

* Для представления вложенных структур вместо точечной нотации используются кортежи (`Tuple`).
* Используются подходящие типы ClickHouse на основе сопоставления:
  * `keyword` → `String`
  * `date` → `DateTime`
  * `boolean` → `UInt8`
  * `long` → `Int64`
  * `ip` → `Array(Variant(IPv4, IPv6))`. Здесь мы используем [`Variant(IPv4, IPv6)`](/sql-reference/data-types/variant), так как поле содержит смешанные значения [`IPv4`](/sql-reference/data-types/ipv4) и [`IPv6`](/sql-reference/data-types/ipv6).
  * `object` → `JSON` для объекта syslog с непредсказуемой структурой.
* Столбцы `host.ip` и `host.mac` имеют явный тип `Array`, в отличие от Elasticsearch, где все типы являются массивами.
* Добавлено выражение `ORDER BY`, использующее метку времени и имя хоста для эффективных запросов, основанных на времени.
* В качестве типа движка используется `MergeTree`, который оптимален для логов.

**Такой подход — статическое определение схемы и выборочное использование типа JSON там, где это необходимо, — [рекомендуется](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures).**

Эта строгая схема даёт ряд преимуществ:

* **Валидация данных** – жёсткое соблюдение схемы позволяет избежать риска взрывного роста числа столбцов за пределами конкретных структур.
* **Избежание риска взрывного роста числа столбцов**: хотя тип JSON масштабируется до потенциально тысяч столбцов, при этом подстолбцы хранятся как отдельные столбцы, это может привести к «взрыву файлов столбцов», когда создаётся чрезмерное количество файлов столбцов, что ухудшает производительность. Для смягчения этого тип [Dynamic](/sql-reference/data-types/dynamic), лежащий в основе JSON, предлагает параметр [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns), который ограничивает количество уникальных путей, сохраняемых в виде отдельных файлов столбцов. После достижения порога дополнительные пути сохраняются в общем файловом столбце с использованием компактного кодированного формата, что сохраняет производительность и эффективность хранения при поддержке гибкого приёма данных. Однако доступ к этому общему файловому столбцу менее эффективен. Отметим, что столбец JSON может использоваться с [подсказками типов](/integrations/data-formats/json/schema#using-type-hints-and-skipping-paths). «Подсказанные» столбцы будут обеспечивать ту же производительность, что и выделенные столбцы.
* **Упрощённая интроспекция путей и типов**: хотя тип JSON поддерживает [функции интроспекции](/sql-reference/data-types/newjson#introspection-functions) для определения типов и путей, которые были выведены, статические структуры могут быть проще для изучения, например, с помощью `DESCRIBE`.

<br />

В качестве альтернативы пользователи могут просто создать таблицу с одним столбцом `JSON`.

```sql
SET enable_json_type = 1;

CREATE TABLE syslog_json
(
 `json` JSON(`host.name` String, `@timestamp` DateTime)
)
ENGINE = MergeTree
ORDER BY (`json.host.name`, `json.@timestamp`)
```


:::note
Мы задаём подсказку типа (type hint) для столбцов `host.name` и `timestamp` в определении JSON, так как используем их в сортировке/первичном ключе. Это помогает ClickHouse понять, что этот столбец не может быть `null`, и гарантирует, что он знает, какие подстолбцы использовать (для каждого типа может быть несколько подстолбцов, поэтому без этого возникает неоднозначность).
:::

Последний подход, хотя и проще, лучше всего подходит для прототипирования и задач инженерии данных. В продакшене используйте тип `JSON` только для динамических подструктур, когда это действительно необходимо.

Для получения более подробной информации об использовании типа JSON в схемах и о том, как эффективно его применять, мы рекомендуем руководство [&quot;Проектирование схемы&quot;](/integrations/data-formats/json/schema).

### Установка `elasticdump`

Мы рекомендуем использовать [`elasticdump`](https://github.com/elasticsearch-dump/elasticsearch-dump) для экспорта данных из Elasticsearch. Этот инструмент требует `node` и должен быть установлен на машине с хорошей сетевой доступностью как к Elasticsearch, так и к ClickHouse. Мы рекомендуем выделенный сервер минимум с 4 ядрами и 16 ГБ оперативной памяти для большинства экспортов.

```shell
npm install elasticdump -g
```

`elasticdump` предлагает несколько преимуществ для миграции данных:

* Он взаимодействует напрямую с REST API Elasticsearch, что обеспечивает корректный экспорт данных.
* Поддерживает согласованность данных во время экспорта, используя API Point-in-Time (PIT) — это создаёт согласованный снимок данных в конкретный момент времени.
* Экспортирует данные напрямую в формат JSON, который можно передавать потоком в клиент ClickHouse для вставки.

По возможности мы рекомендуем размещать ClickHouse, Elasticsearch и `elasticdump` в одной и той же зоне доступности или одном дата‑центре, чтобы минимизировать исходящий сетевой трафик и максимизировать пропускную способность.

### Установите клиент ClickHouse

Убедитесь, что ClickHouse [установлен на сервере](/install), на котором установлен `elasticdump`. **Не запускайте сервер ClickHouse** — для этих шагов требуется только клиент.

### Потоковая передача данных

Чтобы организовать потоковую передачу данных между Elasticsearch и ClickHouse, используйте команду `elasticdump`, перенаправляя вывод напрямую в клиент ClickHouse. Следующая команда вставляет данные в нашу хорошо структурированную таблицу `logs_system_syslog`.


```shell
# экспорт URL и учётных данных
export ELASTICSEARCH_INDEX=.ds-logs-system.syslog-default-2025.06.03-000001
export ELASTICSEARCH_URL=
export ELASTICDUMP_INPUT_USERNAME=
export ELASTICDUMP_INPUT_PASSWORD=
export CLICKHOUSE_HOST=
export CLICKHOUSE_PASSWORD=
export CLICKHOUSE_USER=default
```


# команда для выполнения — измените при необходимости

elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONEachRow"

````

Обратите внимание на использование следующих флагов для `elasticdump`:

- `type=data` — ограничивает ответ только содержимым документа в Elasticsearch.
- `input-index` — входной индекс Elasticsearch.
- `output=$` — перенаправляет все результаты в stdout.
- флаг `sourceOnly`, обеспечивающий исключение полей метаданных из ответа.
- флаг `searchAfter` для использования [`searchAfter` API](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results#search-after) для эффективной пагинации результатов.
- `pit=true` для обеспечения согласованности результатов между запросами с использованием [point in time API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-open-point-in-time).
<br/>
Параметры клиента ClickHouse (помимо учетных данных):

- `max_insert_block_size=1000` — клиент ClickHouse отправляет данные после достижения этого количества строк. Увеличение значения повышает пропускную способность за счет времени формирования блока, что увеличивает время до появления данных в ClickHouse.
- `min_insert_block_size_bytes=0` — отключает сжатие блоков на сервере по байтам.
- `min_insert_block_size_rows=1000` — сжимает блоки от клиентов на стороне сервера. В данном случае значение установлено равным `max_insert_block_size`, чтобы строки появлялись немедленно. Увеличьте для повышения пропускной способности.
- `query="INSERT INTO logs_system_syslog FORMAT JSONAsRow"` — вставка данных в формате [JSONEachRow](/integrations/data-formats/json/other-formats). Это подходит при отправке в четко определенную схему, такую как `logs_system_syslog`.
<br/>
**Пользователи могут ожидать пропускную способность порядка тысяч строк в секунду.**

:::note Вставка в один столбец JSON
При вставке в один столбец JSON (см. схему `syslog_json` выше) можно использовать ту же команду вставки. Однако пользователи должны указать `JSONAsObject` в качестве формата вместо `JSONEachRow`, например:

```shell
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONAsObject"
````

Подробнее см. в разделе [«Чтение JSON как объекта»](/integrations/data-formats/json/other-formats#reading-json-as-an-object).
:::

### Преобразование данных (необязательно) {#transform-data}

Приведенные выше команды предполагают соответствие полей Elasticsearch столбцам ClickHouse один к одному. Пользователям часто требуется фильтровать и преобразовывать данные Elasticsearch перед вставкой в ClickHouse.

Это можно реализовать с помощью табличной функции [`input`](/sql-reference/table-functions/input), которая позволяет выполнить любой запрос `SELECT` на stdout.

Предположим, мы хотим сохранить только поля `timestamp` и `hostname` из наших данных. Схема ClickHouse:

```sql
CREATE TABLE logs_system_syslog_v2
(
    `timestamp` DateTime,
    `hostname` String
)
ENGINE = MergeTree
ORDER BY (hostname, timestamp)
```

Для вставки из `elasticdump` в эту таблицу можно просто использовать табличную функцию `input`, применяя тип JSON для динамического обнаружения и выбора необходимых столбцов. Обратите внимание, что этот запрос `SELECT` может легко содержать фильтр.

```shell
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog_v2 SELECT json.\`@timestamp\` as timestamp, json.host.hostname as hostname FROM input('json JSON') FORMAT JSONAsObject"
```

Обратите внимание на необходимость экранирования имени поля `@timestamp` и использования входного формата `JSONAsObject`.

</VerticalStepper>
