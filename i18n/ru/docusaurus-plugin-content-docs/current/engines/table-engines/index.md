---
description: 'Справочная документация по движкам таблиц'
slug: /engines/table-engines/
toc_folder_title: 'Движки таблиц'
toc_priority: 26
toc_title: 'Введение'
title: 'Движки таблиц'
doc_type: 'reference'
---

# Движки таблиц {#table-engines}

Движок таблицы (тип таблицы) определяет:

- Как и где хранятся данные, куда они записываются и откуда читаются.
- Какие запросы поддерживаются и как.
- Возможность конкурентного доступа к данным.
- Использование индексов, если они есть.
- Возможно ли многопоточное выполнение запросов.
- Параметры репликации данных.

## Семейства движков {#engine-families}

### MergeTree {#mergetree}

Наиболее универсальные и функциональные движки таблиц для задач с высокой нагрузкой. Общим свойством этих движков является быстрая вставка данных с последующей фоновой обработкой. Движки семейства `MergeTree` поддерживают репликацию данных (через версии движков [Replicated\*](/engines/table-engines/mergetree-family/replication)), партиционирование, вторичные пропускающие индексы и другие возможности, которые недоступны в других движках.

Движки в семействе:

| Движки MergeTree                                                                                                                         |
|-------------------------------------------------------------------------------------------------------------------------------------------|
| [MergeTree](/engines/table-engines/mergetree-family/mergetree)                                                          |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)                               |
| [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)                                     |
| [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)                         |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)               |
| [VersionedCollapsingMergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) |
| [GraphiteMergeTree](/engines/table-engines/mergetree-family/graphitemergetree)                                  |
| [CoalescingMergeTree](/engines/table-engines/mergetree-family/coalescingmergetree)                                     |

### Log {#log}

Облегчённые [движки](../../engines/table-engines/log-family/index.md) с минимальной функциональностью. Они наиболее эффективны, когда нужно быстро записать множество небольших таблиц (примерно до 1 миллиона строк) и затем читать их целиком.

Движки в семействе:

| Движки Log                                                                |
|----------------------------------------------------------------------------|
| [TinyLog](/engines/table-engines/log-family/tinylog)       |
| [StripeLog](/engines/table-engines/log-family/stripelog) |
| [Log](/engines/table-engines/log-family/log)                   |

### Интеграционные движки {#integration-engines}

Движки для взаимодействия с другими системами хранения и обработки данных.

Движки в семействе:

| Интеграционные движки                                                             |
|---------------------------------------------------------------------------------|
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

Движки в семействе:

| Специальные движки                                            |
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
| [Внешние данные](/engines/table-engines/special/external-data) |
| [GenerateRandom](/engines/table-engines/special/generate)     |
| [KeeperMap](/engines/table-engines/special/keeper-map)        |
| [FileLog](/engines/table-engines/special/filelog)             |

## Виртуальные столбцы {#table_engines-virtual_columns}

Виртуальный столбец — это неотъемлемый атрибут движка таблицы, определённый в исходном коде движка.

Не следует указывать виртуальные столбцы в запросе `CREATE TABLE`, и их нельзя увидеть в результатах запросов `SHOW CREATE TABLE` и `DESCRIBE TABLE`. Виртуальные столбцы также доступны только для чтения, поэтому в них нельзя вставлять данные.

Чтобы выбрать данные из виртуального столбца, необходимо указать его имя в запросе `SELECT`. `SELECT *` не возвращает значения из виртуальных столбцов.

Если вы создаёте таблицу со столбцом, имя которого совпадает с именем одного из виртуальных столбцов таблицы, этот виртуальный столбец становится недоступным. Мы не рекомендуем так делать. Чтобы избежать конфликтов, имена виртуальных столбцов обычно имеют префикс в виде подчёркивания.

- `_table` — содержит имя таблицы, из которой были прочитаны данные. Тип: [String](../../sql-reference/data-types/string.md).

    Независимо от используемого движка таблицы, каждая таблица включает универсальный виртуальный столбец с именем `_table`.

    При выполнении запроса к таблице с движком Merge вы можете задать константные условия по `_table` в предложении `WHERE/PREWHERE` (например, `WHERE _table='xyz'`). В этом случае операция чтения выполняется только для тех таблиц, для которых условие по `_table` выполняется, так что столбец `_table` фактически выступает в роли индекса.

    При использовании запросов вида `SELECT ... FROM (... UNION ALL ...)` можно определить, из какой фактической таблицы получены возвращаемые строки, указав столбец `_table`.
