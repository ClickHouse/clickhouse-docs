---
description: 'Документация по движкам таблиц'
slug: /engines/table-engines/
toc_folder_title: 'Движки таблиц'
toc_priority: 26
toc_title: 'Введение'
title: 'Движки таблиц'
doc_type: 'reference'
---



# Движки таблиц

Движок таблицы (тип таблицы) определяет:

- Как и где хранятся данные, куда они записываются и откуда читаются.
- Какие запросы поддерживаются и каким образом.
- Параллельный доступ к данным.
- Использование индексов, если они присутствуют.
- Возможность многопоточного выполнения запросов.
- Параметры репликации данных.



## Семейства движков {#engine-families}

### MergeTree {#mergetree}

Наиболее универсальные и функциональные движки таблиц для высоконагруженных задач. Общим свойством этих движков является быстрая вставка данных с последующей фоновой обработкой. Движки семейства `MergeTree` поддерживают репликацию данных (с помощью версий движков [Replicated\*](/engines/table-engines/mergetree-family/replication)), партиционирование, вторичные индексы для пропуска данных и другие возможности, не поддерживаемые другими движками.

Движки семейства:

| Движки MergeTree                                                                                     |
| ---------------------------------------------------------------------------------------------------- |
| [MergeTree](/engines/table-engines/mergetree-family/mergetree)                                       |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)                     |
| [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)                         |
| [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)                 |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)                   |
| [VersionedCollapsingMergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) |
| [GraphiteMergeTree](/engines/table-engines/mergetree-family/graphitemergetree)                       |
| [CoalescingMergeTree](/engines/table-engines/mergetree-family/coalescingmergetree)                   |

### Log {#log}

Легковесные [движки](../../engines/table-engines/log-family/index.md) с минимальной функциональностью. Наиболее эффективны в случаях, когда необходимо быстро записать множество небольших таблиц (до примерно 1 миллиона строк) и затем прочитать их целиком.

Движки семейства:

| Движки Log                                               |
| -------------------------------------------------------- |
| [TinyLog](/engines/table-engines/log-family/tinylog)     |
| [StripeLog](/engines/table-engines/log-family/stripelog) |
| [Log](/engines/table-engines/log-family/log)             |

### Движки интеграции {#integration-engines}

Движки для взаимодействия с другими системами хранения и обработки данных.

Движки семейства:

| Движки интеграции                                                               |
| ------------------------------------------------------------------------------- |
| [ODBC](../../engines/table-engines/integrations/odbc.md)                        |
| [JDBC](../../engines/table-engines/integrations/jdbc.md)                        |
| [MySQL](../../engines/table-engines/integrations/mysql.md)                      |
| [MongoDB](../../engines/table-engines/integrations/mongodb.md)                  |
| [Redis](../../engines/table-engines/integrations/redis.md)                      |
| [HDFS](../../engines/table-engines/integrations/hdfs.md)                        |
| [S3](../../engines/table-engines/integrations/s3.md)                            |
| [Kafka](../../engines/table-engines/integrations/kafka.md)                      |
| [EmbeddedRocksDB](../../engines/table-engines/integrations/embedded-rocksdb.md) |
| [RabbitMQ](../../engines/table-engines/integrations/rabbitmq.md)                |
| [PostgreSQL](../../engines/table-engines/integrations/postgresql.md)            |
| [S3Queue](../../engines/table-engines/integrations/s3queue.md)                  |
| [TimeSeries](../../engines/table-engines/integrations/time-series.md)           |

### Специальные движки {#special-engines}

Движки семейства:


| Специальные движки таблиц                                   |
|---------------------------------------------------------------|
| [Distributed](/engines/table-engines/special/distributed)     |
| [Dictionary](/engines/table-engines/special/dictionary)       |
| [Merge](/engines/table-engines/special/merge)                 |
| [Executable](/engines/table-engines/special/executable)       |
| [File](/engines/table-engines/special/file)                   |
| [Null](/engines/table-engines/special/null)                   |
| [Set](/engines/table-engines/special/set)                     |
| [Join](/engines/table-engines/special/join)                   |
| [URL](/engines/table-engines/special/url)                     |
| [View](/engines/table-engines/special/view)                   |
| [Memory](/engines/table-engines/special/memory)               |
| [Buffer](/engines/table-engines/special/buffer)               |
| [External Data](/engines/table-engines/special/external-data) |
| [GenerateRandom](/engines/table-engines/special/generate)     |
| [KeeperMap](/engines/table-engines/special/keeper-map)        |
| [FileLog](/engines/table-engines/special/filelog)             |



## Виртуальные столбцы {#table_engines-virtual_columns}

Виртуальный столбец — это неотъемлемый атрибут движка таблицы, который определён в исходном коде движка.

Виртуальные столбцы не нужно указывать в запросе `CREATE TABLE`, и они не отображаются в результатах запросов `SHOW CREATE TABLE` и `DESCRIBE TABLE`. Виртуальные столбцы также доступны только для чтения, поэтому в них нельзя вставлять данные.

Чтобы получить данные из виртуального столбца, необходимо явно указать его имя в запросе `SELECT`. Запрос `SELECT *` не возвращает значения из виртуальных столбцов.

Если создать таблицу со столбцом, имя которого совпадает с именем одного из виртуальных столбцов таблицы, виртуальный столбец станет недоступным. Мы не рекомендуем так делать. Чтобы избежать конфликтов, имена виртуальных столбцов обычно начинаются с символа подчёркивания.

- `_table` — содержит имя таблицы, из которой были прочитаны данные. Тип: [String](../../sql-reference/data-types/string.md).

  Независимо от используемого движка таблицы, каждая таблица содержит универсальный виртуальный столбец `_table`.

  При запросе к таблице с движком Merge можно задать константные условия для `_table` в секции `WHERE/PREWHERE` (например, `WHERE _table='xyz'`). В этом случае операция чтения выполняется только для тех таблиц, где условие для `_table` выполнено, поэтому столбец `_table` работает как индекс.

  При использовании запросов вида `SELECT ... FROM (... UNION ALL ...)` можно определить, из какой конкретной таблицы происходят возвращаемые строки, указав столбец `_table`.
