---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-data
title: 'Миграция данных в ClickStack из Elastic'
pagination_prev: null
pagination_next: null
sidebar_label: 'Миграция данных'
sidebar_position: 4
description: 'Миграция данных в ClickHouse Observability Stack из Elastic'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---

## Стратегия параллельной эксплуатации {#parallel-operation-strategy}

При миграции с Elastic на ClickStack для сценариев наблюдаемости мы рекомендуем подход **параллельной эксплуатации**, а не попытку миграции исторических данных. Такая стратегия дает несколько преимуществ:

1. **Минимальный риск**: запуская обе системы параллельно, вы сохраняете доступ к существующим данным и дашбордам, одновременно проверяя работу ClickStack и знакомя пользователей с новой системой.
2. **Естественное «старение» данных**: большинство данных наблюдаемости имеют ограниченный срок хранения (как правило, 30 дней или меньше), что позволяет осуществить естественный переход по мере удаления устаревших данных из Elastic.
3. **Упрощенная миграция**: нет необходимости в сложных инструментах или процессах переноса для перемещения исторических данных между системами.

<br/>

:::note Миграция данных
Мы демонстрируем подход к миграции ключевых данных из Elasticsearch в ClickHouse в разделе ["Миграция данных"](#migrating-data). Его не следует использовать для больших наборов данных, так как он, как правило, не обеспечивает высокой производительности — она ограничена возможностями Elasticsearch по эффективному экспорту, при этом поддерживается только формат JSON.
:::

### Этапы реализации {#implementation-steps}

1. **Настройте двойную ингестию**

<br/>

Настройте конвейер сбора данных так, чтобы он отправлял данные одновременно в Elastic и ClickStack. 

Конкретный способ зависит от используемых в данный момент агентов сбора — см. раздел ["Migrating Agents"](/use-cases/observability/clickstack/migration/elastic/migrating-agents).

2. **Отрегулируйте сроки хранения данных**

<br/>

Настройте параметры TTL в Elastic в соответствии с желаемым сроком хранения. Настройте [TTL](/use-cases/observability/clickstack/production#configure-ttl) в ClickStack, чтобы данные хранились в течение того же периода.

3. **Проверьте и сравните**:

<br/>

- Выполните запросы к обеим системам, чтобы убедиться в согласованности данных
- Сравните производительность запросов и результаты
- Мигрируйте дашборды и оповещения в ClickStack. На данный момент это делается вручную.
- Убедитесь, что все критически важные дашборды и оповещения работают в ClickStack так, как ожидается

4. **Постепенный переход**:

<br/>

- По мере естественного истечения срока хранения данных в Elastic пользователи будут всё больше полагаться на ClickStack
- Когда вы будете уверены в ClickStack, вы можете начать перенаправлять запросы и дашборды

### Долгосрочное хранение {#long-term-retention}

Для организаций, которым требуются более длительные сроки хранения:

- Продолжайте эксплуатировать обе системы параллельно, пока срок хранения всех данных в Elastic не истечёт
- Возможности ClickStack по работе с [многоуровневым хранилищем](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes) помогают эффективно управлять данными при длительном хранении.
- Рассмотрите использование [материализованных представлений](/materialized-view/incremental-materialized-view) для хранения агрегированных или отфильтрованных исторических данных, позволяя исходным «сырым» данным автоматически удаляться по истечении срока хранения.

### Сроки миграции {#migration-timeline}

Сроки миграции будут зависеть от ваших требований к периоду хранения данных:

- **Хранение 30 дней**: миграцию можно завершить в течение одного месяца.
- **Более длительный период хранения**: продолжайте параллельную работу, пока срок хранения данных в Elastic не истечёт.
- **Исторические данные**: если это действительно необходимо, рассмотрите возможность использования раздела [Перенос данных](#migrating-data) для импорта отдельных исторических данных.

## Миграция настроек {#migration-settings}

При переходе с Elastic на ClickStack настройки индексирования и хранения следует адаптировать под архитектуру ClickHouse. В то время как Elasticsearch полагается на горизонтальное масштабирование и шардирование для обеспечения производительности и отказоустойчивости и, соответственно, по умолчанию использует несколько шардов, ClickHouse оптимизирован для вертикального масштабирования и, как правило, показывает наилучшую производительность с меньшим числом шард.

### Рекомендуемые настройки {#recommended-settings}

Мы рекомендуем начать с **одного шарда** и масштабировать систему вертикально. Эта конфигурация подходит для большинства задач наблюдаемости и упрощает как управление, так и тонкую настройку производительности запросов.

- **[ClickHouse Cloud](https://clickhouse.com/cloud)**: По умолчанию использует одношардовую архитектуру с несколькими репликами. Хранилище и вычислительные ресурсы масштабируются независимо, что делает сервис оптимальным для сценариев наблюдаемости с непредсказуемым характером приёма данных и нагрузкой, ориентированной на чтение.
- **ClickHouse OSS**: Для самостоятельного управления мы рекомендуем:
  - Начать с одного шарда
  - Масштабировать вертикально, добавляя CPU и RAM
  - Использовать [многоуровневое хранилище](/observability/managing-data#storage-tiers) для расширения локального диска за счёт S3-совместимого объектного хранилища
  - Использовать [`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication), если требуется высокая доступность
  - Для обеспечения отказоустойчивости [одной реплики вашего шарда](/engines/table-engines/mergetree-family/replication) обычно достаточно для нагрузок в области наблюдаемости.

### Когда следует выполнять шардинг {#when-to-shard}

Шардинг может понадобиться, если:

- Скорость приёма данных превышает возможности одного узла (обычно >500K строк/сек)
- Вам требуется изоляция арендаторов или региональное разделение данных
- Общий объём данных слишком велик для одного сервера, даже с использованием объектного хранилища

Если вам всё же нужен шардинг, обратитесь к разделу [Horizontal scaling](/architecture/horizontal-scaling) за рекомендациями по выбору ключей шардинга и настройке распределённых таблиц.

### Срок хранения и TTL {#retention-and-ttl}

ClickHouse использует [TTL-выражения](/use-cases/observability/clickstack/production#configure-ttl) в таблицах MergeTree для управления сроком хранения данных. Политики TTL позволяют:

- Автоматически удалять устаревшие данные
- Перемещать более старые данные в холодное объектное хранилище
- Хранить только свежие, часто запрашиваемые логи на быстром диске

Рекомендуется согласовать конфигурацию TTL в ClickHouse с существующими политиками хранения данных в Elastic, чтобы обеспечить единый жизненный цикл данных во время миграции. Примеры см. в разделе [настройка TTL в ClickStack для продакшена](/use-cases/observability/clickstack/production#configure-ttl).

## Миграция данных {#migrating-data}

Хотя для большинства данных наблюдаемости мы рекомендуем параллельную работу систем, существуют отдельные случаи, когда может потребоваться прямая миграция данных из Elasticsearch в ClickHouse:

- Небольшие справочные таблицы, используемые для обогащения данных (например, сопоставления пользователей, каталоги сервисов)
- Бизнес-данные, хранящиеся в Elasticsearch, которые необходимо коррелировать с данными наблюдаемости; возможности SQL в ClickHouse и интеграции с системами Business Intelligence упрощают сопровождение и выполнение запросов к этим данным по сравнению с более ограниченными возможностями запросов в Elasticsearch.
- Конфигурационные данные, которые необходимо сохранить при миграции

Этот подход применим только для наборов данных размером менее 10 миллионов строк, поскольку возможности экспорта в Elasticsearch ограничиваются JSON по HTTP и плохо масштабируются для больших объемов данных. 

Следующие шаги позволяют выполнить миграцию одного индекса Elasticsearch в ClickHouse.

<VerticalStepper headerLevel="h3">
  ### Миграция схемы

  Создайте таблицу в ClickHouse для индекса, переносимого из Elasticsearch. Можно сопоставить [типы данных Elasticsearch с их эквивалентами в ClickHouse](/use-cases/observability/clickstack/migration/elastic/types). Альтернативный вариант — использовать тип данных JSON в ClickHouse, который автоматически создаёт столбцы соответствующего типа при вставке данных.

  Рассмотрите следующую схему Elasticsearch для индекса, содержащего данные `syslog`:

  <details>
    <summary>Маппинг Elasticsearch</summary>

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

  Соответствующая схема таблицы ClickHouse:

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

  * Кортежи используются для представления вложенных структур вместо точечной записи
  * Использованы соответствующие типы ClickHouse согласно сопоставлению:
    * `keyword` → `String`
    * `date` → `DateTime`
    * `boolean` → `UInt8`
    * `long` → `Int64`
    * `ip` → `Array(Variant(IPv4, IPv6))`. Здесь мы используем [`Variant(IPv4, IPv6)`](/sql-reference/data-types/variant), поскольку поле может содержать одновременно и [`IPv4`](/sql-reference/data-types/ipv4), и [`IPv6`](/sql-reference/data-types/ipv6).
    * `object` → `JSON` для объекта syslog с непредсказуемой структурой.
  * Столбцы `host.ip` и `host.mac` имеют явный тип `Array`, в отличие от Elasticsearch, где все типы по сути являются массивами.
  * Добавляется предложение `ORDER BY` по временной метке и имени хоста для эффективного выполнения запросов по времени
  * в качестве типа движка используется `MergeTree`, который оптимален для логов

  **Данный подход со статическим определением схемы и выборочным использованием типа JSON там, где это требуется, [рекомендуется](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures).**

  Такая строгая схема имеет ряд преимуществ:

  * **Проверка данных** – применение строгой схемы позволяет избежать риска неконтролируемого роста числа столбцов, за исключением специально предусмотренных структур.
  * **Снижает риск взрывного роста числа столбцов**: хотя тип JSON масштабируется потенциально до тысяч столбцов, где подстолбцы хранятся как отдельные столбцы, это может привести к «взрыву» файлов столбцов, когда создаётся чрезмерное их количество, что негативно влияет на производительность. Чтобы минимизировать это, базовый тип [Dynamic](/sql-reference/data-types/dynamic), используемый для JSON, предоставляет параметр [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns), который ограничивает количество уникальных путей, хранимых как отдельные файлы столбцов. Как только порог достигнут, дополнительные пути сохраняются в общем файле столбца с использованием компактного кодированного формата, что позволяет сохранить производительность и эффективность хранения при гибкой ингестии данных. Однако доступ к этому общему файлу столбца менее эффективен. Обратите внимание, что столбец JSON может использоваться с [type hints](/integrations/data-formats/json/schema#using-type-hints-and-skipping-paths). Столбцы с подсказками типов обеспечат ту же производительность, что и выделенные столбцы.
  * **Упрощённое исследование путей и типов**: хотя тип JSON поддерживает [функции интроспекции](/sql-reference/data-types/newjson#introspection-functions) для определения выведенных типов и путей, статические структуры зачастую проще исследовать, например с помощью `DESCRIBE`.

  <br />

  В качестве альтернативы можно просто создать таблицу с одним столбцом типа `JSON`.

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
  Мы указываем тип для столбцов `host.name` и `timestamp` в определении JSON, так как используем их в ключе сортировки/первичном ключе. Это позволяет ClickHouse определить, что столбец не будет содержать значения null, и гарантирует корректный выбор подстолбцов (для каждого типа может существовать несколько вариантов, что иначе приводит к неоднозначности).
  :::

  Этот подход, хотя и проще, лучше всего подходит для прототипирования и задач по обработке данных. В production-среде используйте `JSON` только для динамических подструктур там, где это необходимо.

  Для получения дополнительной информации об использовании типа JSON в схемах и его эффективном применении рекомендуем руководство [&quot;Проектирование схемы&quot;](/integrations/data-formats/json/schema).

  ### Установите `elasticdump`

  Мы рекомендуем использовать [`elasticdump`](https://github.com/elasticsearch-dump/elasticsearch-dump) для экспорта данных из Elasticsearch. Этот инструмент требует `node` и должен быть установлен на машине с сетевым доступом как к Elasticsearch, так и к ClickHouse. Для большинства экспортов рекомендуется выделенный сервер с минимум 4 ядрами и 16 ГБ оперативной памяти.

  ```shell
  npm install elasticdump -g
  ```

  `elasticdump` предлагает ряд преимуществ для миграции данных:

  * Он взаимодействует непосредственно с REST API Elasticsearch, гарантируя корректный экспорт данных.
  * Поддерживает согласованность данных в процессе экспорта с помощью API Point-in-Time (PIT), который создаёт согласованный снимок данных в определённый момент времени.
  * Экспортирует данные непосредственно в формат JSON, который можно потоково передавать в клиент ClickHouse для вставки.

  По возможности рекомендуется запускать ClickHouse, Elasticsearch и `elastic dump` в одной зоне доступности или центре обработки данных, чтобы минимизировать исходящий сетевой трафик и максимизировать пропускную способность.

  ### Установите клиент ClickHouse

  Убедитесь, что ClickHouse [установлен на сервере](/install), где находится `elasticdump`. **Не запускайте сервер ClickHouse** — эти шаги требуют только клиента.

  ### Потоковая передача данных

  Для потоковой передачи данных между Elasticsearch и ClickHouse используйте команду `elasticdump`, направляя вывод напрямую в клиент ClickHouse. Следующая команда вставляет данные в хорошо структурированную таблицу `logs_system_syslog`.

  ```shell
  # экспорт URL и учетных данных
  export ELASTICSEARCH_INDEX=.ds-logs-system.syslog-default-2025.06.03-000001
  export ELASTICSEARCH_URL=
  export ELASTICDUMP_INPUT_USERNAME=
  export ELASTICDUMP_INPUT_PASSWORD=
  export CLICKHOUSE_HOST=
  export CLICKHOUSE_PASSWORD=
  export CLICKHOUSE_USER=default

  # команда для запуска — при необходимости измените параметры
  elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true | 
  clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
  --min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONEachRow"
  ```

  Обратите внимание на следующие флаги для `elasticdump`:

  * `type=data` — ограничивает ответ, возвращая только содержимое документа в Elasticsearch.
  * `input-index` — наш входной индекс Elasticsearch.
  * `output=$` — перенаправляет все результаты в stdout.
  * Флаг `sourceOnly`, который гарантирует исключение полей метаданных из ответа.
  * Флаг `searchAfter` для использования API [`searchAfter`](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results#search-after) для эффективной постраничной выборки результатов поиска.
  * `pit=true`, чтобы обеспечить единообразные результаты между запросами, выполняемыми с использованием [API point-in-time](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-open-point-in-time).

  <br />

  Параметры клиента ClickHouse (помимо учётных данных):

  * `max_insert_block_size=1000` - клиент ClickHouse отправит данные, когда количество строк достигнет этого значения. Увеличение этого параметра повышает пропускную способность ценой времени, необходимого для формирования блока, — соответственно увеличивается задержка до появления данных в ClickHouse.
  * `min_insert_block_size_bytes=0` - Отключает объединение блоков на сервере по размеру в байтах.
  * `min_insert_block_size_rows=1000` — объединяет полученные от клиентов блоки на стороне сервера. В данном случае мы устанавливаем его равным `max_insert_block_size`, чтобы строки появлялись сразу. Увеличьте значение, чтобы повысить пропускную способность.
  * `query="INSERT INTO logs_system_syslog FORMAT JSONAsRow"` — вставка данных в формате [JSONEachRow](/integrations/data-formats/json/other-formats). Это целесообразно, если данные отправляются в таблицу с чётко определённой схемой, например `logs_system_syslog.`

  <br />

  **Пользователи могут ожидать пропускную способность порядка тысяч строк в секунду.**

  :::note Вставка в одну строку JSON
  При вставке данных в одну колонку JSON (см. схему `syslog_json` выше) можно использовать ту же команду вставки. Однако пользователи должны указать `JSONAsObject` в качестве формата вместо `JSONEachRow`, например:

  ```shell
  elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true | 
  clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
  --min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONAsObject"
  ```

  Подробнее см. [&quot;Чтение JSON как объекта&quot;](/integrations/data-formats/json/other-formats#reading-json-as-an-object).
  :::

  ### Преобразование данных (необязательно)

  Приведенные выше команды предполагают прямое соответствие полей Elasticsearch столбцам ClickHouse (один к одному). Пользователям часто необходимо фильтровать и преобразовывать данные Elasticsearch перед их загрузкой в ClickHouse.

  Это можно реализовать с помощью табличной функции [`input`](/sql-reference/table-functions/input), которая позволяет выполнять любой запрос `SELECT` над данными из stdout.

  Предположим, что нам нужно сохранить только поля `timestamp` и `hostname` из наших данных. Схема ClickHouse:

  ```sql
  CREATE TABLE logs_system_syslog_v2
  (
      `timestamp` DateTime,
      `hostname` String
  )
  ENGINE = MergeTree
  ORDER BY (hostname, timestamp)
  ```

  Для вставки данных из `elasticdump` в эту таблицу достаточно использовать табличную функцию `input` с типом JSON для автоматического определения и выбора необходимых столбцов. Обратите внимание, что в данный запрос `SELECT` при необходимости можно добавить фильтр.

  ```shell
  elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
  clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
  --min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog_v2 SELECT json.\`@timestamp\` as timestamp, json.host.hostname as hostname FROM input('json JSON') FORMAT JSONAsObject"
  ```

  Обратите внимание на необходимость экранирования имени поля `@timestamp` и использования формата ввода `JSONAsObject`.
</VerticalStepper>