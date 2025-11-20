---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-data
title: 'Миграция данных из Elastic в ClickStack'
pagination_prev: null
pagination_next: null
sidebar_label: 'Миграция данных'
sidebar_position: 4
description: 'Миграция данных из Elastic в ClickHouse Observability Stack'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---



## Стратегия параллельной работы {#parallel-operation-strategy}

При миграции с Elastic на ClickStack для задач observability мы рекомендуем подход **параллельной работы** вместо попытки миграции исторических данных. Эта стратегия имеет несколько преимуществ:

1. **Минимальный риск**: запуская обе системы одновременно, вы сохраняете доступ к существующим данным и дашбордам, одновременно проверяя ClickStack и знакомя пользователей с новой системой.
2. **Естественное истечение данных**: большинство данных observability имеют ограниченный период хранения (обычно 30 дней или менее), что позволяет осуществить естественный переход по мере истечения данных в Elastic.
3. **Упрощенная миграция**: нет необходимости в сложных инструментах передачи данных или процессах для перемещения исторических данных между системами.
   <br />
   :::note Миграция данных Мы демонстрируем подход к миграции важных
   данных из Elasticsearch в ClickHouse в разделе ["Миграция
   данных"](#migrating-data). Его не следует использовать для больших наборов данных, так как он
   редко производителен — ограничен возможностью Elasticsearch эффективно экспортировать
   данные, при этом поддерживается только формат JSON. :::

### Шаги реализации {#implementation-steps}

1. **Настройка двойного приема данных**
   <br />
   Настройте конвейер сбора данных для одновременной отправки данных в Elastic и
   ClickStack.

Способ достижения этого зависит от ваших текущих агентов сбора — см. ["Миграция агентов"](/use-cases/observability/clickstack/migration/elastic/migrating-agents).

2. **Настройка периодов хранения**

   <br />
   Настройте параметры TTL в Elastic в соответствии с желаемым периодом хранения. Настройте
   [TTL](/use-cases/observability/clickstack/production#configure-ttl) в ClickStack для
   хранения данных в течение того же периода.

3. **Проверка и сравнение**:
   <br />

- Выполните запросы к обеим системам для обеспечения согласованности данных
- Сравните производительность запросов и результаты
- Перенесите дашборды и оповещения в ClickStack. В настоящее время это ручной процесс.
- Убедитесь, что все критически важные дашборды и оповещения работают в ClickStack как ожидается

4. **Постепенный переход**:
   <br />

- По мере естественного истечения данных в Elastic пользователи будут все больше полагаться на ClickStack
- После того как уверенность в ClickStack будет установлена, вы можете начать перенаправлять запросы и дашборды

### Долгосрочное хранение {#long-term-retention}

Для организаций, требующих более длительных периодов хранения:

- Продолжайте параллельную работу обеих систем до тех пор, пока все данные не истекут в Elastic
- Возможности [многоуровневого хранения](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes) ClickStack могут помочь эффективно управлять долгосрочными данными.
- Рассмотрите использование [материализованных представлений](/materialized-view/incremental-materialized-view) для поддержания агрегированных или отфильтрованных исторических данных, позволяя при этом необработанным данным истекать.

### График миграции {#migration-timeline}

График миграции будет зависеть от ваших требований к хранению данных:

- **Хранение 30 дней**: миграция может быть завершена в течение месяца.
- **Более длительное хранение**: продолжайте параллельную работу до истечения данных в Elastic.
- **Исторические данные**: если это абсолютно необходимо, рассмотрите использование [Миграции данных](#migrating-data) для импорта конкретных исторических данных.


## Миграция настроек {#migration-settings}

При миграции с Elastic на ClickStack настройки индексирования и хранения необходимо адаптировать под архитектуру ClickHouse. В то время как Elasticsearch полагается на горизонтальное масштабирование и шардирование для обеспечения производительности и отказоустойчивости и по умолчанию использует несколько шардов, ClickHouse оптимизирован для вертикального масштабирования и обычно показывает наилучшую производительность с меньшим количеством шардов.

### Рекомендуемые настройки {#recommended-settings}

Рекомендуется начинать с **одного шарда** и масштабироваться вертикально. Такая конфигурация подходит для большинства задач мониторинга и упрощает как управление, так и настройку производительности запросов.

- **[ClickHouse Cloud](https://clickhouse.com/cloud)**: По умолчанию использует архитектуру с одним шардом и несколькими репликами. Хранилище и вычислительные ресурсы масштабируются независимо, что делает его идеальным решением для задач мониторинга с непредсказуемыми паттернами поступления данных и преобладанием операций чтения.
- **ClickHouse OSS**: Для самостоятельно управляемых развертываний рекомендуется:
  - Начинать с одного шарда
  - Масштабироваться вертикально, добавляя CPU и RAM
  - Использовать [многоуровневое хранилище](/observability/managing-data#storage-tiers) для расширения локального диска объектным хранилищем, совместимым с S3
  - Использовать [`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication), если требуется высокая доступность
  - Для отказоустойчивости в задачах мониторинга обычно достаточно [1 реплики шарда](/engines/table-engines/mergetree-family/replication).

### Когда использовать шардирование {#when-to-shard}

Шардирование может потребоваться, если:

- Скорость поступления данных превышает возможности одного узла (обычно >500 тыс. строк/сек)
- Требуется изоляция арендаторов или региональное разделение данных
- Общий объем данных слишком велик для одного сервера, даже при использовании объектного хранилища

Если шардирование все же необходимо, обратитесь к разделу [Горизонтальное масштабирование](/architecture/horizontal-scaling) за рекомендациями по ключам шардирования и настройке распределенных таблиц.

### Хранение данных и TTL {#retention-and-ttl}

ClickHouse использует [TTL-выражения](/use-cases/observability/clickstack/production#configure-ttl) в таблицах MergeTree для управления сроком хранения данных. Политики TTL позволяют:

- Автоматически удалять устаревшие данные
- Перемещать старые данные в холодное объектное хранилище
- Сохранять только недавние, часто запрашиваемые логи на быстром диске

Рекомендуется согласовать конфигурацию TTL в ClickHouse с существующими политиками хранения в Elastic для поддержания единого жизненного цикла данных во время миграции. Примеры см. в разделе [Настройка TTL для продакшена ClickStack](/use-cases/observability/clickstack/production#configure-ttl).


## Миграция данных {#migrating-data}

Хотя для большинства данных наблюдаемости мы рекомендуем параллельную работу систем, существуют конкретные случаи, когда может потребоваться прямая миграция данных из Elasticsearch в ClickHouse:

- Небольшие справочные таблицы для обогащения данных (например, сопоставления пользователей, каталоги сервисов)
- Бизнес-данные, хранящиеся в Elasticsearch, которые необходимо коррелировать с данными наблюдаемости — возможности SQL в ClickHouse и интеграции с Business Intelligence упрощают обслуживание и выполнение запросов к данным по сравнению с более ограниченными возможностями запросов Elasticsearch.
- Конфигурационные данные, которые необходимо сохранить при миграции

Этот подход применим только для наборов данных объемом менее 10 миллионов строк, поскольку возможности экспорта Elasticsearch ограничены JSON через HTTP и плохо масштабируются для больших объемов данных.

Следующие шаги позволяют выполнить миграцию одного индекса Elasticsearch в ClickHouse.

<VerticalStepper headerLevel="h3">

### Миграция схемы {#migrate-scheme}

Создайте таблицу в ClickHouse для индекса, мигрируемого из Elasticsearch. Можно сопоставить [типы Elasticsearch с их эквивалентами в ClickHouse](/use-cases/observability/clickstack/migration/elastic/types). Альтернативно, можно использовать тип данных JSON в ClickHouse, который будет динамически создавать столбцы соответствующего типа при вставке данных.

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

* Для представления вложенных структур используются `Tuple` вместо точечной нотации.
* Используются соответствующие типы ClickHouse на основе сопоставления:
  * `keyword` → `String`
  * `date` → `DateTime`
  * `boolean` → `UInt8`
  * `long` → `Int64`
  * `ip` → `Array(Variant(IPv4, IPv6))`. Здесь используется [`Variant(IPv4, IPv6)`](/sql-reference/data-types/variant), так как поле содержит смесь [`IPv4`](/sql-reference/data-types/ipv4) и [`IPv6`](/sql-reference/data-types/ipv6).
  * `object` → `JSON` для объекта syslog с непредсказуемой структурой.
* Столбцы `host.ip` и `host.mac` имеют явный тип `Array`, в отличие от Elasticsearch, где все типы являются массивами.
* Добавлено выражение `ORDER BY`, использующее временную метку и имя хоста для эффективных запросов по времени.
* В качестве движка используется `MergeTree`, оптимальный для логов.

**Этот подход — статическое определение схемы с выборочным использованием типа JSON там, где это требуется, — [рекомендуется](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures).**

Такая строгая схема имеет ряд преимуществ:

* **Валидация данных** – применение строгой схемы позволяет избежать риска «взрыва столбцов» за пределами отдельных структур.
* **Снижение риска взрыва столбцов**: хотя тип JSON масштабируется потенциально до тысяч столбцов, где подколнки хранятся как отдельные столбцы, это может привести к «взрыву файлов столбцов», когда создается чрезмерное количество файлов столбцов, что влияет на производительность. Для смягчения этого базовый [тип Dynamic](/sql-reference/data-types/dynamic), используемый JSON, предоставляет параметр [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns), который ограничивает количество уникальных путей, хранимых как отдельные файлы столбцов. После достижения порога дополнительные пути хранятся в общем файле столбца с использованием компактного закодированного формата, поддерживая производительность и эффективность хранения при сохранении гибкости загрузки данных. Однако доступ к этому общему файлу столбца менее эффективен. Обратите внимание, что столбец JSON может использоваться с [подсказками типов](/integrations/data-formats/json/schema#using-type-hints-and-skipping-paths). «Подсказанные» столбцы обеспечивают ту же производительность, что и выделенные столбцы.
* **Упрощенная интроспекция путей и типов**: хотя тип JSON поддерживает [функции интроспекции](/sql-reference/data-types/newjson#introspection-functions) для определения выведенных типов и путей, статические структуры могут быть проще для исследования, например с помощью `DESCRIBE`.

<br />

В качестве альтернативы пользователи могут просто создать таблицу с одним столбцом типа `JSON`.

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
Мы указываем тип для столбцов `host.name` и `timestamp` в определении JSON, так как используем их в ключе сортировки/первичном ключе. Это позволяет ClickHouse понять, что эти столбцы не будут содержать null, и определить, какие подстолбцы использовать (для каждого типа их может быть несколько, что иначе создаёт неоднозначность).
:::

Этот подход, хотя и проще, лучше всего подходит для прототипирования и задач инженерии данных. В продакшене используйте `JSON` только для динамических подструктур там, где это действительно необходимо.

Подробнее об использовании типа JSON в схемах и его эффективном применении см. в руководстве [«Проектирование схемы»](/integrations/data-formats/json/schema).

### Установка `elasticdump` {#install-elasticdump}

Для экспорта данных из Elasticsearch мы рекомендуем использовать [`elasticdump`](https://github.com/elasticsearch-dump/elasticsearch-dump). Этот инструмент требует `node` и должен быть установлен на машине с хорошей сетевой связностью как с Elasticsearch, так и с ClickHouse. Для большинства экспортов рекомендуется выделенный сервер с минимум 4 ядрами и 16 ГБ оперативной памяти.

```shell
npm install elasticdump -g
```

`elasticdump` предоставляет несколько преимуществ для миграции данных:

- Напрямую взаимодействует с REST API Elasticsearch, обеспечивая корректный экспорт данных.
- Поддерживает согласованность данных в процессе экспорта с помощью API Point-in-Time (PIT) — создаёт согласованный снимок данных на определённый момент времени.
- Экспортирует данные напрямую в формат JSON, который можно передавать потоком в клиент ClickHouse для вставки.

По возможности рекомендуется запускать ClickHouse, Elasticsearch и `elasticdump` в одной зоне доступности или дата-центре, чтобы минимизировать исходящий сетевой трафик и максимизировать пропускную способность.

### Установка клиента ClickHouse {#install-clickhouse-client}

Убедитесь, что ClickHouse [установлен на сервере](/install), на котором находится `elasticdump`. **Не запускайте сервер ClickHouse** — для выполнения этих шагов требуется только клиент.

### Потоковая передача данных {#stream-data}

Для потоковой передачи данных между Elasticsearch и ClickHouse используйте команду `elasticdump`, передавая вывод напрямую в клиент ClickHouse. Следующая команда вставляет данные в нашу структурированную таблицу `logs_system_syslog`.


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


# команда для запуска — измените при необходимости

elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONEachRow"

````

Обратите внимание на использование следующих флагов для `elasticdump`:

- `type=data` — ограничивает ответ только содержимым документов в Elasticsearch.
- `input-index` — входной индекс Elasticsearch.
- `output=$` — перенаправляет все результаты в stdout.
- флаг `sourceOnly`, обеспечивающий исключение полей метаданных из ответа.
- флаг `searchAfter` для использования [`searchAfter` API](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results#search-after) для эффективной пагинации результатов.
- `pit=true` для обеспечения согласованности результатов между запросами с использованием [point in time API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-open-point-in-time).
<br/>
Параметры клиента ClickHouse (помимо учетных данных):

- `max_insert_block_size=1000` — клиент ClickHouse отправляет данные после достижения этого количества строк. Увеличение значения повышает пропускную способность за счет времени на формирование блока, что увеличивает время до появления данных в ClickHouse.
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

### Преобразование данных (опционально) {#transform-data}

Приведенные выше команды предполагают соответствие полей Elasticsearch столбцам ClickHouse один к одному. Пользователям часто требуется фильтровать и преобразовывать данные Elasticsearch перед вставкой в ClickHouse.

Это можно реализовать с помощью табличной функции [`input`](/sql-reference/table-functions/input), которая позволяет выполнять любой запрос `SELECT` на данных из stdout.

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
