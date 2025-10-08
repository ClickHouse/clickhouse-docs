---
slug: '/engines/table-engines/'
description: 'Документация для table engines'
title: 'Движки Таблиц'
doc_type: reference
toc_folder_title: 'Table Engines'
toc_priority: 26
toc_title: Introduction
---
# Движки таблиц

Движок таблицы (тип таблицы) определяет:

- Как и где хранятся данные, куда их записывать и откуда их читать.
- Какие запросы поддерживаются и как.
- Параллельный доступ к данным.
- Использование индексов, если они имеются.
- Возможно ли многопоточное выполнение запросов.
- Параметры репликации данных.

## Семейства движков {#engine-families}

### MergeTree {#mergetree}

Наиболее универсальные и функциональные движки таблиц для высоконагруженных задач. Общим свойством этих движков является быстрая вставка данных с последующей обработкой данных в фоновом режиме. Движки семейства `MergeTree` поддерживают репликацию данных (в версиях с [Replicated\*](/engines/table-engines/mergetree-family/replication)), партиционирование, вторичные индексы пропуска данных и другие функции, которые не поддерживаются в других движках.

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

Легковесные [движки](../../engines/table-engines/log-family/index.md) с минимальной функциональностью. Они наиболее эффективны, когда нужно быстро записывать много мелких таблиц (до примерно 1 миллиона строк) и читать их позже целиком.

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

| Специальные движки                                               |
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
| [FileLog](/engines/table-engines/special/filelog)                                                   |

## Виртуальные колонки {#table_engines-virtual_columns}

Виртуальная колонка — это неотъемлемый атрибут движка таблицы, который определяется в исходном коде движка.

Вы не должны указывать виртуальные колонки в запросе `CREATE TABLE`, и вы не можете их увидеть в результатах запросов `SHOW CREATE TABLE` и `DESCRIBE TABLE`. Виртуальные колонки также являются только для чтения, поэтому вы не можете вставить данные в виртуальные колонки.

Чтобы выбрать данные из виртуальной колонки, вы должны указать ее имя в запросе `SELECT`. `SELECT *` не возвращает значения из виртуальных колонок.

Если вы создаете таблицу с колонкой, имеющей то же имя, что и одна из виртуальных колонок таблицы, виртуальная колонка становится недоступной. Мы не рекомендуем делать это. Чтобы помочь избежать конфликтов, имена виртуальных колонок обычно начинаются с символа подчеркивания.

- `_table` — Содержит имя таблицы, из которой были прочитаны данные. Тип: [String](../../sql-reference/data-types/string.md).

    Независимо от используемого движка таблицы, каждая таблица включает универсальную виртуальную колонку с именем `_table`.

    При запросе таблицы с движком merge таблицы вы можете установить постоянные условия на `_table` в предложении `WHERE/PREWHERE` (например, `WHERE _table='xyz'`). В этом случае операция чтения выполняется только для тех таблиц, где условие на `_table` удовлетворено, так что колонка `_table` действует как индекс.

    При использовании запросов, отформатированных как `SELECT ... FROM (... UNION ALL ...)`, мы можем определить, из какой фактической таблицы происходят возвращаемые строки, указав колонку `_table`.