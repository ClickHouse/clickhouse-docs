---
'slug': '/use-cases/observability/clickstack/migration/elastic/migrating-data'
'title': 'Миграция данных в ClickStack из Elastic'
'pagination_prev': null
'pagination_next': null
'sidebar_label': 'Миграция данных'
'sidebar_position': 4
'description': 'Миграция данных в ClickHouse Observability Stack из Elastic'
'show_related_blogs': true
'keywords':
- 'ClickStack'
'doc_type': 'guide'
---

## Стратегия параллельной работы {#parallel-operation-strategy}

При миграции с Elastic на ClickStack для случаев наблюдаемости мы рекомендуем подход **параллельной работы**, а не попытки мигрировать исторические данные. Эта стратегия предлагает несколько преимуществ:

1. **Минимальный риск**: запуская оба системы одновременно, вы сохраняете доступ к существующим данным и панелям мониторинга, одновременно проверяя ClickStack и знакомя своих пользователей с новой системой.
2. **Естественное устаревание данных**: большинство данных наблюдаемости имеют ограниченный период хранения (обычно 30 дней или меньше), что позволяет осуществить естественный переход по мере устаревания данных из Elastic.
3. **Упрощенная миграция**: нет необходимости в сложных инструментах переноса данных или процессах для перемещения исторических данных между системами.
<br/>
:::note Миграция данных
Мы демонстрируем подход к миграции основных данных из Elasticsearch в ClickHouse в разделе ["Миграция данных"](#migrating-data). Это не следует использовать для более крупных наборов данных, так как это редко производительно - ограничено способностью Elasticsearch экспортировать данные эффективно, поддерживается только формат JSON.
:::

### Этапы реализации {#implementation-steps}

1. **Настройка двойного приема данных**
<br/>
Настройте свой конвейер сбора данных для одновременной отправки данных в Elastic и ClickStack.

Как это достигается, зависит от ваших текущих агентов для сбора - смотрите раздел ["Миграция агентов"](/use-cases/observability/clickstack/migration/elastic/migrating-agents).

2. **Корректировка сроков хранения**
<br/>
Настройте параметры TTL в Elastic, чтобы они соответствовали вашему желаемому сроку хранения. Настройте [TTL](/use-cases/observability/clickstack/production#configure-ttl) в ClickStack, чтобы поддерживать данные в течение того же периода.

3. **Проверка и сравнение**:
<br/>
- Запускайте запросы к обеим системам, чтобы обеспечить согласованность данных
- Сравните производительность запросов и результаты
- Мигрируйте панели и оповещения в ClickStack. Это в настоящее время ручной процесс.
- Убедитесь, что все критически важные панели и оповещения работают как ожидалось в ClickStack

4. **Постепенный переход**:
<br/>
- По мере естественного устаревания данных из Elastic пользователи будут все больше полагаться на ClickStack
- После установления уверенности в ClickStack вы можете начать переадресовать запросы и панели

### Долгосрочное хранение {#long-term-retention}

Для организаций, требующих более длительных сроков хранения:

- Продолжайте запуск обоих систем параллельно, пока все данные не устареют из Elastic
- Возможности [многоуровневого хранения](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes) в ClickStack могут помочь эффективно управлять данными в долгосрочной перспективе.
- Рассмотрите возможность использования [материализованных представлений](/materialized-view/incremental-materialized-view) для поддержания агрегированных или отфильтрованных исторических данных, позволяя при этом исходным данным устаревать.

### График миграции {#migration-timeline}

График миграции будет зависеть от ваших требований к срокам хранения данных:

- **Хранение 30 дней**: миграцию можно завершить в течение месяца.
- **Долгосрочное хранение**: продолжайте параллельную работу, пока данные не устареют из Elastic.
- **Исторические данные**: если это абсолютно необходимо, рассмотрите возможность использования [Миграции данных](#migrating-data) для импорта конкретных исторических данных.

## Миграция настроек {#migration-settings}

При миграции с Elastic на ClickStack ваши настройки индексации и хранения должны быть адаптированы к архитектуре ClickHouse. В то время как Elasticsearch полагается на горизонтальное масштабирование и шардирование для обеспечения производительности и отказоустойчивости и поэтому имеет несколько шардов по умолчанию, ClickHouse оптимизирован для вертикального масштабирования и обычно показывает наилучшие результаты с меньшим количеством шардов.

### Рекомендуемые настройки {#recommended-settings}

Мы рекомендуем начать с **одного шара** и масштабироваться вертикально. Эта конфигурация подходит для большинства рабочих нагрузок наблюдаемости и упрощает как управление, так и настройку производительности запросов.

- **[ClickHouse Cloud](https://clickhouse.com/cloud)**: использует архитектуру с одним шаром и несколькими репликами по умолчанию. Хранение и вычисления масштабируются независимо, что делает его идеальным для случаев наблюдаемости с непредсказуемыми паттернами приема данных и рабочими нагрузками с высокой нагрузкой на чтение.
- **ClickHouse OSS**: в развертываниях с самоуправлением мы рекомендуем:
  - Начать с одного шара
  - Масштабироваться вертикально с дополнительным CPU и RAM
  - Использовать [многоуровневое хранение](/observability/managing-data#storage-tiers) для расширения локального диска с помощью объектного хранилища, совместимого с S3
  - Использовать [`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication), если требуется высокая доступность
  - Для отказоустойчивости [1 реплики вашего шара](/engines/table-engines/mergetree-family/replication) обычно достаточно в рабочих нагрузках наблюдаемости.

### Когда шардировать {#when-to-shard}

Шардирование может быть необходимо, если:

- Ваша скорость приема данных превышает возможности одного узла (обычно >500K строк/сек)
- Вам необходимо отделение арендаторов или региональное отделение данных
- Ваш общий объем данных слишком велик для одного сервера, даже с учетом объектного хранения

Если вам необходимо шардировать, обратитесь к разделу [Горизонтальное масштабирование](/architecture/horizontal-scaling) для руководства по ключам шардов и настройке распределенных таблиц.

### Сроки хранения и TTL {#retention-and-ttl}

ClickHouse использует [условия TTL](/use-cases/observability/clickstack/production#configure-ttl) на таблицах MergeTree для управления устареванием данных. Политики TTL могут:

- Автоматически удалять устаревшие данные
- Перемещать старые данные в холодное объектное хранилище
- Хранить только последние, часто запрашиваемые логи на быстром диске

Мы рекомендуем согласовать вашу конфигурацию TTL в ClickHouse с вашими существующими политиками хранения Elastic, чтобы поддерживать последовательный жизненный цикл данных во время миграции. Для примеров смотрите [настройка TTL в ClickStack]( /use-cases/observability/clickstack/production#configure-ttl).

## Миграция данных {#migrating-data}

Хотя мы рекомендуем параллельную работу для большинства данных наблюдаемости, существуют конкретные случаи, когда прямая миграция данных из Elasticsearch в ClickHouse может быть необходима:

- Небольшие справочные таблицы, используемые для обогащения данных (например, сопоставления пользователей, каталоги услуг)
- Данные бизнеса, хранящиеся в Elasticsearch, которые необходимо сопоставить с данными наблюдаемости, причем возможности SQL ClickHouse и интеграции бизнес-аналитики упрощают поддержку и запрос данных по сравнению с более ограниченными вариантами запросов Elasticsearch.
- Конфигурационные данные, которые необходимо сохранить в процессе миграции

Этот подход реализуем только для наборов данных менее 10 миллионов строк, так как возможности экспорта Elasticsearch ограничены форматом JSON по HTTP и плохо масштабируются для более крупных наборов данных.

Следующие шаги позволяют мигрировать один индекс Elasticsearch в ClickHouse.

<VerticalStepper headerLevel="h3">

### Миграция схемы {#migrate-scheme}

Создайте таблицу в ClickHouse для индекса, который мигрирует из Elasticsearch. Пользователи могут сопоставить [типы Elasticsearch с их аналогами ClickHouse](/use-cases/observability/clickstack/migration/elastic/types). В качестве альтернативы пользователи могут просто полагаться на тип данных JSON в ClickHouse, который динамически создаст колонки соответствующего типа по мере вставки данных.

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

Обратите внимание, что:

- Для представления вложенных структур используются кортежи вместо точечной нотации
- Используются соответствующие типы ClickHouse на основе сопоставления:
  - `keyword` → `String`
  - `date` → `DateTime`
  - `boolean` → `UInt8`
  - `long` → `Int64`
  - `ip` → `Array(Variant(IPv4, IPv6))`. Мы здесь используем [`Variant(IPv4, IPv6)`](/sql-reference/data-types/variant), так как поле содержит смесь [`IPv4`](/sql-reference/data-types/ipv4) и [`IPv6`](/sql-reference/data-types/ipv6).
  - `object` → `JSON` для объекта syslog, структура которого непредсказуема.
- Колонки `host.ip` и `host.mac` имеют явный тип `Array`, в отличие от Elasticsearch, где все типы являются массивами.
- Кладется `ORDER BY` в предложение с использованием временной метки и имени хоста для эффективных временных запросов
- Тип двигателя используется `MergeTree`, который оптимален для логовых данных

**Этот подход статической дефиниции схемы и избирательного использования типа JSON в необходимых местах [рекомендуется](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures).**

Эта строгая схема имеет несколько преимуществ:

- **Валидация данных** – строгая схема предотвращает риск расширения колонок, кроме конкретных структур.
- **Предотвращает риск расширения колонок**: хотя тип JSON может масштабироваться до потенциально тысяч колонок, когда подколонки хранятся как отдельные колонки, это может привести к взрыву файлов колонок, когда создается чрезмерное количество файлов колонок, что негативно влияет на производительность. Для смягчения этого, используемый базовый [Динамический тип](/sql-reference/data-types/dynamic) в JSON предлагает параметр [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns), который ограничивает число уникальных путей, хранящихся как отдельные файлы колонок. Когда порог достигается, дополнительные пути хранятся в общем файле колонки с использованием компактного закодированного формата, поддерживая производительность и эффективность хранения при поддержке гибкого приема данных. Тем не менее доступ к этому общему файлу колонки не так производителен. Обратите внимание, что колонка JSON может быть использована с [подсказками типов](/integrations/data-formats/json/schema#using-type-hints-and-skipping-paths). "Подсказанные" колонки будут давать такую же производительность, как и выделенные колонки.
- **Упрощенное исследование путей и типов**: хотя тип JSON поддерживает [функции интроспекции](/sql-reference/data-types/newjson#introspection-functions) для определения типов и путей, которые были выведены, статические структуры могут быть проще для исследования, например, с помощью `DESCRIBE`.
<br/>
Или пользователи могут просто создать таблицу с одной колонкой `JSON`.

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
Мы предоставляем подсказку типа для колонок `host.name` и `timestamp` в определении JSON, так как мы используем их в ключе сортировки/первичном ключе. Это помогает ClickHouse понять, что эта колонка не будет пустой и гарантирует, что он знает, какие подколонки использовать (для каждого типа может быть несколько, поэтому это было бы неясно в противном случае).
:::

Этот последний подход, хотя и проще, лучший для прототипирования и задач по обработке данных. Для производства используйте `JSON` только для динамических подструктур, где это необходимо.

Для получения дополнительной информации о использовании типа JSON в схемах и о том, как эффективно его применять, мы рекомендуем руководство ["Проектирование вашей схемы"](/integrations/data-formats/json/schema).

### Установка `elasticdump` {#install-elasticdump}

Мы рекомендуем [`elasticdump`](https://github.com/elasticsearch-dump/elasticsearch-dump) для экспорта данных из Elasticsearch. Этот инструмент требует `node` и должен быть установлен на машине с сетевой близостью как к Elasticsearch, так и к ClickHouse. Мы рекомендуем выделенный сервер с как минимум 4 ядрами и 16 ГБ RAM для большинства экспортов.

```shell
npm install elasticdump -g
```

`elasticdump` предлагает несколько преимуществ для миграции данных:

- Он взаимодействует напрямую с REST API Elasticsearch, обеспечивая правильный экспорт данных.
- Поддерживает согласованность данных в процессе экспорта с использованием API Point-in-Time (PIT) - это создает согласованный снимок данных в конкретный момент времени.
- Экспортирует данные напрямую в формате JSON, который может быть передан клиенту ClickHouse для вставки.

При возможности мы рекомендуем запускать как ClickHouse, так и Elasticsearch, а также `elasticdump` в одной зоне доступности или дата-центре, чтобы минимизировать сетевой выброс и максимизировать пропускную способность.

### Установка клиента ClickHouse {#install-clickhouse-client}

Убедитесь, что ClickHouse [установлен на сервере](/install), на котором находится `elasticdump`. **Не начинайте сервер ClickHouse** - для этих шагов требуется только клиент.

### Потоковая передача данных {#stream-data}

Чтобы потоково передавать данные между Elasticsearch и ClickHouse, используйте команду `elasticdump`, перенаправляя вывод напрямую в клиент ClickHouse. Следующий пример вставляет данные в нашу хорошо структурированную таблицу `logs_system_syslog`.

```shell

# export url and credentials
export ELASTICSEARCH_INDEX=.ds-logs-system.syslog-default-2025.06.03-000001
export ELASTICSEARCH_URL=
export ELASTICDUMP_INPUT_USERNAME=
export ELASTICDUMP_INPUT_PASSWORD=
export CLICKHOUSE_HOST=
export CLICKHOUSE_PASSWORD=
export CLICKHOUSE_USER=default


# command to run - modify as required
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true | 
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONEachRow"
```

Обратите внимание на использование следующих флагов для `elasticdump`:

- `type=data` -ограничивает ответ только документным содержанием в Elasticsearch.
- `input-index` - наш входной индекс Elasticsearch.
- `output=$` - переадресовывает все результаты в stdout.
- Флаг `sourceOnly`, гарантирующий, что мы опускаем полные метаданные в нашем ответе.
- Флаг `searchAfter`, чтобы использовать [`searchAfter` API](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results#search-after) для эффективной постраничной навигации результатов.
- `pit=true`, чтобы гарантировать согласованные результаты между запросами, используя [API point in time](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-open-point-in-time).
<br/>
Параметры нашего клиента ClickHouse здесь (помимо учетных данных):

- `max_insert_block_size=1000` - клиент ClickHouse отправит данные, как только будет достигнуто это число строк. Увеличение этого значения улучшает пропускную способность за счет времени, необходимого для формирования блока - таким образом, увеличивая время до появления данных в ClickHouse.
- `min_insert_block_size_bytes=0` - отключает сжатие серверного блока по байтам.
- `min_insert_block_size_rows=1000` - сжимает блоки с клиентской стороны на сервере. В этом случае мы устанавливаем это значение на `max_insert_block_size`, чтобы строки появлялись немедленно. Увеличьте, чтобы повысить пропускную способность.
- `query="INSERT INTO logs_system_syslog FORMAT JSONAsRow"` - вставка данных в формате [JSONEachRow](/integrations/data-formats/json/other-formats). Это соответственно, если отправлять в четко определенную схему, такую как `logs_system_syslog`.
<br/>
**Пользователи могут ожидать пропускную способность в порядке тысяч строк в секунду.**

:::note Вставка в одну строку JSON
Если вставка в одну колонку JSON (смотрите схему `syslog_json` выше), можно использовать ту же команду вставки. Однако пользователи должны указать `JSONAsObject` как формат вместо `JSONEachRow`, например:

```shell
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true | 
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONAsObject"
```

Смотрите ["Чтение JSON как объекта"](/integrations/data-formats/json/other-formats#reading-json-as-an-object) для получения дополнительных сведений.
:::

### Преобразование данных (необязательно) {#transform-data}

Вышеуказанные команды предполагают 1:1 сопоставление полей Elasticsearch с колонками ClickHouse. Пользователи часто нуждаются в фильтрации и преобразовании данных Elasticsearch перед вставкой в ClickHouse.

Это можно сделать с помощью функции таблицы [`input`](/sql-reference/table-functions/input), которая позволяет нам выполнять любой `SELECT` запрос на stdout.

Предположим, мы хотим сохранить только поля `timestamp` и `hostname` из наших предыдущих данных. Схема ClickHouse:

```sql
CREATE TABLE logs_system_syslog_v2
(
    `timestamp` DateTime,
    `hostname` String
)
ENGINE = MergeTree
ORDER BY (hostname, timestamp)
```

Для вставки из `elasticdump` в эту таблицу мы можем просто использовать функцию таблицы `input` - используя тип JSON для динамического определения и выбора необходимых колонок. Обратите внимание, что этот запрос `SELECT` мог бы легко содержать фильтр.

```shell
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog_v2 SELECT json.\`@timestamp\` as timestamp, json.host.hostname as hostname FROM input('json JSON') FORMAT JSONAsObject"
```

Обратите внимание на необходимость экранирования имени поля `@timestamp` и использования формата ввода `JSONAsObject`.
