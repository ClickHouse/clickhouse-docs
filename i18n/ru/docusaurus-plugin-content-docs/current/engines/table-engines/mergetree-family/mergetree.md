---
description: 'Движки таблиц семейства `MergeTree` разработаны для высокой скорости загрузки и обработки огромных объемов данных.'
sidebar_label: 'MergeTree'
sidebar_position: 11
slug: /engines/table-engines/mergetree-family/mergetree
title: 'Движок таблицы MergeTree'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Движок таблиц MergeTree

Движок `MergeTree` и другие движки семейства `MergeTree` (например, `ReplacingMergeTree`, `AggregatingMergeTree`) являются наиболее часто используемыми и наиболее надежными движками таблиц в ClickHouse.

Движки таблиц семейства `MergeTree` разработаны для высокой скорости загрузки данных и работы с очень большими объемами данных.
Операции вставки создают части таблицы (table parts), которые фоновым процессом сливаются с другими частями таблицы.

Основные особенности движков таблиц семейства `MergeTree`:

- Первичный ключ таблицы определяет порядок сортировки внутри каждой части таблицы (кластерный индекс). При этом первичный ключ ссылается не на отдельные строки, а на блоки по 8192 строки, называемые гранулами. Это делает первичные ключи огромных наборов данных достаточно компактными, чтобы оставаться загруженными в оперативной памяти, при этом обеспечивая быстрый доступ к данным на диске.

- Таблицы могут быть секционированы (разделены на партиции) с использованием произвольного выражения партиционирования. Отсечение партиций (partition pruning) обеспечивает пропуск чтения партиций, если запрос позволяет это сделать.

- Данные могут реплицироваться между несколькими узлами кластера для обеспечения высокой доступности, отказоустойчивости и обновлений без простоя. См. раздел [Data replication](/engines/table-engines/mergetree-family/replication.md).

- Движки таблиц `MergeTree` поддерживают различные типы статистики и методы семплирования, которые помогают в оптимизации запросов.

:::note
Несмотря на схожее название, движок [Merge](/engines/table-engines/special/merge) отличается от движков `*MergeTree`.
:::



## Создание таблиц {#table_engine-mergetree-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [[NOT] NULL] [DEFAULT|MATERIALIZED|ALIAS|EPHEMERAL expr1] [COMMENT ...] [CODEC(codec1)] [STATISTICS(stat1)] [TTL expr1] [PRIMARY KEY] [SETTINGS (name = value, ...)],
    name2 [type2] [[NOT] NULL] [DEFAULT|MATERIALIZED|ALIAS|EPHEMERAL expr2] [COMMENT ...] [CODEC(codec2)] [STATISTICS(stat2)] [TTL expr2] [PRIMARY KEY] [SETTINGS (name = value, ...)],
    ...
    INDEX index_name1 expr1 TYPE type1(...) [GRANULARITY value1],
    INDEX index_name2 expr2 TYPE type2(...) [GRANULARITY value2],
    ...
    PROJECTION projection_name_1 (SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY]),
    PROJECTION projection_name_2 (SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY])
) ENGINE = MergeTree()
ORDER BY expr
[PARTITION BY expr]
[PRIMARY KEY expr]
[SAMPLE BY expr]
[TTL expr
    [DELETE|TO DISK 'xxx'|TO VOLUME 'xxx' [, ...] ]
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ] ]
[SETTINGS name = value, ...]
```

Подробное описание параметров см. в описании оператора [CREATE TABLE](/sql-reference/statements/create/table.md).

### Секции запроса {#mergetree-query-clauses}

#### ENGINE {#engine}

`ENGINE` — имя и параметры движка. `ENGINE = MergeTree()`. Движок `MergeTree` не имеет параметров.

#### ORDER BY {#order_by}

`ORDER BY` — ключ сортировки.

Кортеж из имен столбцов или произвольных выражений. Пример: `ORDER BY (CounterID + 1, EventDate)`.

Если первичный ключ не определен (т.е. секция `PRIMARY KEY` не указана), ClickHouse использует ключ сортировки в качестве первичного ключа.

Если сортировка не требуется, можно использовать синтаксис `ORDER BY tuple()`.
Альтернативно, если включена настройка `create_table_empty_primary_key_by_default`, секция `ORDER BY ()` неявно добавляется к операторам `CREATE TABLE`. См. [Выбор первичного ключа](#selecting-a-primary-key).

#### PARTITION BY {#partition-by}

`PARTITION BY` — [ключ партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key.md). Необязательный параметр. В большинстве случаев ключ партиционирования не требуется, а если партиционирование необходимо, обычно не нужен ключ более детальный, чем по месяцам. Партиционирование не ускоряет запросы (в отличие от выражения ORDER BY). Не следует использовать слишком детальное партиционирование. Не партиционируйте данные по идентификаторам или именам клиентов (вместо этого сделайте идентификатор или имя клиента первым столбцом в выражении ORDER BY).

Для партиционирования по месяцам используйте выражение `toYYYYMM(date_column)`, где `date_column` — столбец с датой типа [Date](/sql-reference/data-types/date.md). Имена партиций в этом случае имеют формат `"YYYYMM"`.

#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — первичный ключ, если он [отличается от ключа сортировки](#choosing-a-primary-key-that-differs-from-the-sorting-key). Необязательный параметр.

Указание ключа сортировки (с помощью секции `ORDER BY`) неявно задает первичный ключ.
Обычно нет необходимости указывать первичный ключ дополнительно к ключу сортировки.

#### SAMPLE BY {#sample-by}

`SAMPLE BY` — выражение для сэмплирования. Необязательный параметр.

Если указано, оно должно содержаться в первичном ключе.
Выражение для сэмплирования должно возвращать беззнаковое целое число.

Пример: `SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`.

#### TTL {#ttl}

`TTL` — список правил, определяющих длительность хранения строк и логику автоматического перемещения частей [между дисками и томами](#table_engine-mergetree-multiple-volumes). Необязательный параметр.

Выражение должно возвращать `Date` или `DateTime`, например, `TTL date + INTERVAL 1 DAY`.


Тип правила `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY` определяет действие, которое будет выполнено с частью данных при выполнении условия выражения (достижении текущего времени): удаление устаревших строк, перемещение части (если выражение выполнено для всех строк в части) на указанный диск (`TO DISK 'xxx'`) или том (`TO VOLUME 'xxx'`), либо агрегирование значений в устаревших строках. Тип правила по умолчанию — удаление (`DELETE`). Можно указать список из нескольких правил, но должно быть не более одного правила `DELETE`.

Подробнее см. [TTL для столбцов и таблиц](#table_engine-mergetree-ttl)

#### SETTINGS {#settings}

См. [Настройки MergeTree](../../../operations/settings/merge-tree-settings.md).

**Пример настройки секций**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

В примере задано партиционирование по месяцам.

Также задано выражение для сэмплирования в виде хеша по идентификатору пользователя. Это позволяет псевдослучайным образом перемешать данные в таблице для каждого `CounterID` и `EventDate`. Если при выборке данных указать секцию [SAMPLE](/sql-reference/statements/select/sample), ClickHouse вернёт равномерную псевдослучайную выборку данных для подмножества пользователей.

Настройку `index_granularity` можно опустить, так как 8192 является значением по умолчанию.

<details markdown="1">

<summary>Устаревший метод создания таблицы</summary>

:::note
Не используйте этот метод в новых проектах. По возможности переведите старые проекты на метод, описанный выше.
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] MergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

**Параметры MergeTree()**

- `date-column` — Имя столбца типа [Date](/sql-reference/data-types/date.md). ClickHouse автоматически создаёт партиции по месяцам на основе этого столбца. Имена партиций имеют формат `"YYYYMM"`.
- `sampling_expression` — Выражение для сэмплирования.
- `(primary, key)` — Первичный ключ. Тип: [Tuple()](/sql-reference/data-types/tuple.md)
- `index_granularity` — Гранулярность индекса. Количество строк данных между «метками» индекса. Значение 8192 подходит для большинства задач.

**Пример**

```sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

Движок `MergeTree` настраивается так же, как в примере выше для основного метода конфигурации движка.

</details>


## Хранение данных {#mergetree-data-storage}

Таблица состоит из кусков данных, отсортированных по первичному ключу.

При вставке данных в таблицу создаются отдельные куски данных, каждый из которых лексикографически сортируется по первичному ключу. Например, если первичный ключ — `(CounterID, Date)`, данные в куске сортируются по `CounterID`, а внутри каждого `CounterID` упорядочиваются по `Date`.

Данные, относящиеся к разным партициям, разделяются на разные куски. В фоновом режиме ClickHouse объединяет куски данных для более эффективного хранения. Куски, принадлежащие разным партициям, не объединяются. Механизм слияния не гарантирует, что все строки с одинаковым первичным ключом окажутся в одном куске данных.

Куски данных могут храниться в формате `Wide` или `Compact`. В формате `Wide` каждый столбец хранится в отдельном файле файловой системы, в формате `Compact` все столбцы хранятся в одном файле. Формат `Compact` может использоваться для повышения производительности при небольших и частых вставках.

Формат хранения данных управляется настройками движка таблицы `min_bytes_for_wide_part` и `min_rows_for_wide_part`. Если количество байтов или строк в куске данных меньше значения соответствующей настройки, кусок хранится в формате `Compact`. В противном случае он хранится в формате `Wide`. Если ни одна из этих настроек не задана, куски данных хранятся в формате `Wide`.

Каждый кусок данных логически разделён на гранулы. Гранула — это наименьший неделимый набор данных, который ClickHouse читает при выборке данных. ClickHouse не разделяет строки или значения, поэтому каждая гранула всегда содержит целое число строк. Первая строка гранулы отмечается значением первичного ключа для этой строки. Для каждого куска данных ClickHouse создаёт индексный файл, в котором хранятся метки. Для каждого столбца, независимо от того, входит ли он в первичный ключ или нет, ClickHouse также сохраняет те же метки. Эти метки позволяют находить данные непосредственно в файлах столбцов.

Размер гранулы ограничивается настройками движка таблицы `index_granularity` и `index_granularity_bytes`. Количество строк в грануле находится в диапазоне `[1, index_granularity]` в зависимости от размера строк. Размер гранулы может превышать `index_granularity_bytes`, если размер одной строки больше значения настройки. В этом случае размер гранулы равен размеру строки.


## Первичные ключи и индексы в запросах {#primary-keys-and-indexes-in-queries}

Рассмотрим первичный ключ `(CounterID, Date)` в качестве примера. В этом случае сортировка и индекс могут быть проиллюстрированы следующим образом:

```text
Все данные:      [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
Метки:           |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Номера меток:    0      1      2      3      4      5      6      7      8      9      10
```

Если в запросе данных указано:

- `CounterID in ('a', 'h')`, сервер читает данные в диапазонах меток `[0, 3)` и `[6, 8)`.
- `CounterID IN ('a', 'h') AND Date = 3`, сервер читает данные в диапазонах меток `[1, 3)` и `[7, 8)`.
- `Date = 3`, сервер читает данные в диапазоне меток `[1, 10]`.

Приведенные выше примеры показывают, что использование индекса всегда эффективнее полного сканирования.

Разреженный индекс допускает чтение дополнительных данных. При чтении одного диапазона первичного ключа может быть прочитано до `index_granularity * 2` дополнительных строк в каждом блоке данных.

Разреженные индексы позволяют работать с очень большим количеством строк таблицы, поскольку в большинстве случаев такие индексы помещаются в оперативной памяти компьютера.

ClickHouse не требует уникальности первичного ключа. Вы можете вставлять несколько строк с одинаковым первичным ключом.

Вы можете использовать выражения типа `Nullable` в секциях `PRIMARY KEY` и `ORDER BY`, но это крайне не рекомендуется. Чтобы разрешить эту возможность, включите настройку [allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key). Для значений `NULL` в секции `ORDER BY` применяется принцип [NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values).

### Выбор первичного ключа {#selecting-a-primary-key}

Количество столбцов в первичном ключе явно не ограничено. В зависимости от структуры данных вы можете включить в первичный ключ больше или меньше столбцов. Это может:

- Улучшить производительность индекса.

  Если первичный ключ — это `(a, b)`, то добавление еще одного столбца `c` улучшит производительность, если выполняются следующие условия:
  - Существуют запросы с условием на столбец `c`.
  - Длинные диапазоны данных (в несколько раз длиннее, чем `index_granularity`) с идентичными значениями для `(a, b)` встречаются часто. Другими словами, когда добавление еще одного столбца позволяет пропускать довольно длинные диапазоны данных.

- Улучшить сжатие данных.

  ClickHouse сортирует данные по первичному ключу, поэтому чем выше согласованность данных, тем лучше сжатие.

- Обеспечить дополнительную логику при слиянии частей данных в движках [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) и [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md).

  В этом случае имеет смысл указать _ключ сортировки_, отличающийся от первичного ключа.

Длинный первичный ключ негативно повлияет на производительность вставки и потребление памяти, но дополнительные столбцы в первичном ключе не влияют на производительность ClickHouse при выполнении запросов `SELECT`.

Вы можете создать таблицу без первичного ключа, используя синтаксис `ORDER BY tuple()`. В этом случае ClickHouse хранит данные в порядке вставки. Если вы хотите сохранить порядок данных при вставке данных запросами `INSERT ... SELECT`, установите [max_insert_threads = 1](/operations/settings/settings#max_insert_threads).

Для выборки данных в исходном порядке используйте [однопоточные](/operations/settings/settings.md/#max_threads) запросы `SELECT`.

### Выбор первичного ключа, отличающегося от ключа сортировки {#choosing-a-primary-key-that-differs-from-the-sorting-key}


Возможно указать первичный ключ (выражение, значения которого записываются в индексный файл для каждой отметки), отличающийся от ключа сортировки (выражения для сортировки строк в частях данных). В этом случае кортеж выражения первичного ключа должен быть префиксом кортежа выражения ключа сортировки.

Эта возможность полезна при использовании движков таблиц [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) и
[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md). В типичном случае при использовании этих движков таблица имеет два типа столбцов: _измерения_ и _метрики_. Типичные запросы агрегируют значения столбцов метрик с произвольным `GROUP BY` и фильтрацией по измерениям. Поскольку SummingMergeTree и AggregatingMergeTree агрегируют строки с одинаковым значением ключа сортировки, естественно добавить в него все измерения. В результате выражение ключа состоит из длинного списка столбцов, и этот список необходимо часто обновлять при добавлении новых измерений.

В этом случае имеет смысл оставить в первичном ключе только несколько столбцов, которые обеспечат эффективное сканирование диапазонов, и добавить остальные столбцы измерений в кортеж ключа сортировки.

[ALTER](/sql-reference/statements/alter/index.md) ключа сортировки является лёгкой операцией, поскольку при одновременном добавлении нового столбца в таблицу и в ключ сортировки существующие части данных не требуют изменения. Так как старый ключ сортировки является префиксом нового ключа сортировки, а во вновь добавленном столбце нет данных, данные отсортированы как по старому, так и по новому ключу сортировки в момент модификации таблицы.

### Использование индексов и партиций в запросах {#use-of-indexes-and-partitions-in-queries}

Для запросов `SELECT` ClickHouse анализирует, может ли быть использован индекс. Индекс может быть использован, если в секции `WHERE/PREWHERE` присутствует выражение (как один из элементов конъюнкции или полностью), представляющее операцию сравнения на равенство или неравенство, или если оно содержит `IN` или `LIKE` с фиксированным префиксом для столбцов или выражений, которые входят в первичный ключ или ключ партиционирования, или для определённых частично повторяющихся функций этих столбцов, или логических отношений этих выражений.

Таким образом, возможно быстро выполнять запросы по одному или нескольким диапазонам первичного ключа. В этом примере запросы будут выполняться быстро для конкретного тега отслеживания, для конкретного тега и диапазона дат, для конкретного тега и даты, для нескольких тегов с диапазоном дат и так далее.

Рассмотрим движок, настроенный следующим образом:

```sql
ENGINE MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate)
SETTINGS index_granularity=8192
```

В этом случае в запросах:

```sql
SELECT count() FROM table
WHERE EventDate = toDate(now())
AND CounterID = 34

SELECT count() FROM table
WHERE EventDate = toDate(now())
AND (CounterID = 34 OR CounterID = 42)

SELECT count() FROM table
WHERE ((EventDate >= toDate('2014-01-01')
AND EventDate <= toDate('2014-01-31')) OR EventDate = toDate('2014-05-01'))
AND CounterID IN (101500, 731962, 160656)
AND (CounterID = 101500 OR EventDate != toDate('2014-05-01'))
```

ClickHouse будет использовать индекс первичного ключа для отсечения неподходящих данных и ключ месячного партиционирования для отсечения партиций, находящихся в неподходящих диапазонах дат.

Приведённые выше запросы показывают, что индекс используется даже для сложных выражений. Чтение из таблицы организовано таким образом, что использование индекса не может быть медленнее полного сканирования.

В примере ниже индекс не может быть использован.

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

Чтобы проверить, может ли ClickHouse использовать индекс при выполнении запроса, используйте настройки [force_index_by_date](/operations/settings/settings.md/#force_index_by_date) и [force_primary_key](/operations/settings/settings#force_primary_key).

Ключ партиционирования по месяцам позволяет читать только те блоки данных, которые содержат даты из соответствующего диапазона. В этом случае блок данных может содержать данные для многих дат (до целого месяца). Внутри блока данные отсортированы по первичному ключу, который может не содержать дату в качестве первого столбца. Из-за этого использование запроса только с условием по дате, не указывающим префикс первичного ключа, приведёт к чтению большего объёма данных, чем для одной даты.

### Использование индекса для частично монотонных первичных ключей {#use-of-index-for-partially-monotonic-primary-keys}


Рассмотрим, например, дни месяца. Они образуют [монотонную последовательность](https://en.wikipedia.org/wiki/Monotonic_function) в пределах одного месяца, но не являются монотонными для более длительных периодов. Это частично монотонная последовательность. Если пользователь создает таблицу с частично монотонным первичным ключом, ClickHouse создает разреженный индекс как обычно. Когда пользователь выбирает данные из такой таблицы, ClickHouse анализирует условия запроса. Если пользователь хочет получить данные между двумя отметками индекса и обе эти отметки попадают в пределы одного месяца, ClickHouse может использовать индекс в этом конкретном случае, поскольку он может вычислить расстояние между параметрами запроса и отметками индекса.

ClickHouse не может использовать индекс, если значения первичного ключа в диапазоне параметров запроса не представляют собой монотонную последовательность. В этом случае ClickHouse использует метод полного сканирования.

ClickHouse использует эту логику не только для последовательностей дней месяца, но и для любого первичного ключа, который представляет собой частично монотонную последовательность.

### Индексы пропуска данных {#table_engine-mergetree-data_skipping-indexes}

Объявление индекса находится в секции столбцов запроса `CREATE`.

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

Для таблиц семейства `*MergeTree` можно указывать индексы пропуска данных.

Эти индексы агрегируют некоторую информацию о заданном выражении на блоках, которые состоят из `granularity_value` гранул (размер гранулы задается с помощью настройки `index_granularity` в движке таблицы). Затем эти агрегаты используются в запросах `SELECT` для уменьшения объема данных, считываемых с диска, путем пропуска больших блоков данных, где условие `where` не может быть выполнено.

Предложение `GRANULARITY` может быть опущено, значение `granularity_value` по умолчанию равно 1.

**Пример**

```sql
CREATE TABLE table_name
(
    u64 UInt64,
    i32 Int32,
    s String,
    ...
    INDEX idx1 u64 TYPE bloom_filter GRANULARITY 3,
    INDEX idx2 u64 * i32 TYPE minmax GRANULARITY 3,
    INDEX idx3 u64 * length(s) TYPE set(1000) GRANULARITY 4
) ENGINE = MergeTree()
...
```

Индексы из примера могут использоваться ClickHouse для уменьшения объема данных, считываемых с диска, в следующих запросах:

```sql
SELECT count() FROM table WHERE u64 == 10;
SELECT count() FROM table WHERE u64 * i32 >= 1234
SELECT count() FROM table WHERE u64 * length(s) == 1234
```

Индексы пропуска данных также могут быть созданы на составных столбцах:

```sql
-- на столбцах типа Map:
INDEX map_key_index mapKeys(map_column) TYPE bloom_filter
INDEX map_value_index mapValues(map_column) TYPE bloom_filter

-- на столбцах типа Tuple:
INDEX tuple_1_index tuple_column.1 TYPE bloom_filter
INDEX tuple_2_index tuple_column.2 TYPE bloom_filter

-- на столбцах типа Nested:
INDEX nested_1_index col.nested_col1 TYPE bloom_filter
INDEX nested_2_index col.nested_col2 TYPE bloom_filter
```

### Типы индексов пропуска {#skip-index-types}

Движок таблиц `MergeTree` поддерживает следующие типы индексов пропуска.
Для получения дополнительной информации о том, как индексы пропуска могут использоваться для оптимизации производительности,
см. [«Понимание индексов пропуска данных ClickHouse»](/optimize/skipping-indexes).

- Индекс [`MinMax`](#minmax)
- Индекс [`Set`](#set)
- Индекс [`bloom_filter`](#bloom-filter)
- Индекс [`ngrambf_v1`](#n-gram-bloom-filter)
- Индекс [`tokenbf_v1`](#token-bloom-filter)

#### Индекс пропуска MinMax {#minmax}

Для каждой гранулы индекса сохраняются минимальное и максимальное значения выражения.
(Если выражение имеет тип `tuple`, сохраняются минимум и максимум для каждого элемента кортежа.)

```text title="Синтаксис"
minmax
```

#### Set {#set}

Для каждой гранулы индекса сохраняется не более `max_rows` уникальных значений указанного выражения.
`max_rows = 0` означает «сохранять все уникальные значения».

```text title="Синтаксис"
set(max_rows)
```

#### Bloom filter {#bloom-filter}

Для каждой гранулы индекса сохраняется [фильтр Блума](https://en.wikipedia.org/wiki/Bloom_filter) для указанных столбцов.

```text title="Синтаксис"
bloom_filter([false_positive_rate])
```

Параметр `false_positive_rate` может принимать значение от 0 до 1 (по умолчанию: `0.025`) и задает вероятность ложноположительного срабатывания (что увеличивает объем считываемых данных).


Поддерживаются следующие типы данных:

- `(U)Int*`
- `Float*`
- `Enum`
- `Date`
- `DateTime`
- `String`
- `FixedString`
- `Array`
- `LowCardinality`
- `Nullable`
- `UUID`
- `Map`

:::note Тип данных Map: указание создания индекса по ключам или значениям
Для типа данных `Map` можно указать, должен ли индекс создаваться по ключам или по значениям, используя функции [`mapKeys`](/sql-reference/functions/tuple-map-functions.md/#mapkeys) или [`mapValues`](/sql-reference/functions/tuple-map-functions.md/#mapvalues).
:::

#### N-граммный фильтр Блума {#n-gram-bloom-filter}

Для каждой гранулы индекса сохраняется [фильтр Блума](https://en.wikipedia.org/wiki/Bloom_filter) для [n-грамм](https://en.wikipedia.org/wiki/N-gram) указанных столбцов.

```text title="Синтаксис"
ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```

| Параметр                        | Описание                                                                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `n`                             | Размер n-граммы                                                                                                              |
| `size_of_bloom_filter_in_bytes` | Размер фильтра Блума в байтах. Здесь можно использовать большое значение, например `256` или `512`, так как оно хорошо сжимается. |
| `number_of_hash_functions`      | Количество хеш-функций, используемых в фильтре Блума.                                                                        |
| `random_seed`                   | Начальное значение для хеш-функций фильтра Блума.                                                                            |

Этот индекс работает только со следующими типами данных:

- [`String`](/sql-reference/data-types/string.md)
- [`FixedString`](/sql-reference/data-types/fixedstring.md)
- [`Map`](/sql-reference/data-types/map.md)

Для оценки параметров `ngrambf_v1` можно использовать следующие [пользовательские функции (UDF)](/sql-reference/statements/create/function.md).

```sql title="UDF для ngrambf_v1"
CREATE FUNCTION bfEstimateFunctions [ON CLUSTER cluster]
AS
(total_number_of_all_grams, size_of_bloom_filter_in_bits) -> round((size_of_bloom_filter_in_bits / total_number_of_all_grams) * log(2));

CREATE FUNCTION bfEstimateBmSize [ON CLUSTER cluster]
AS
(total_number_of_all_grams,  probability_of_false_positives) -> ceil((total_number_of_all_grams * log(probability_of_false_positives)) / log(1 / pow(2, log(2))));

CREATE FUNCTION bfEstimateFalsePositive [ON CLUSTER cluster]
AS
(total_number_of_all_grams, number_of_hash_functions, size_of_bloom_filter_in_bytes) -> pow(1 - exp(-number_of_hash_functions/ (size_of_bloom_filter_in_bytes / total_number_of_all_grams)), number_of_hash_functions);

CREATE FUNCTION bfEstimateGramNumber [ON CLUSTER cluster]
AS
(number_of_hash_functions, probability_of_false_positives, size_of_bloom_filter_in_bytes) -> ceil(size_of_bloom_filter_in_bytes / (-number_of_hash_functions / log(1 - exp(log(probability_of_false_positives) / number_of_hash_functions))))
```

Для использования этих функций необходимо указать как минимум два параметра:

- `total_number_of_all_grams`
- `probability_of_false_positives`

Например, в грануле содержится `4300` n-грамм, и вы ожидаете, что вероятность ложных срабатываний будет меньше `0.0001`.
Остальные параметры можно оценить, выполнив следующие запросы:

```sql
--- оценка количества битов в фильтре
SELECT bfEstimateBmSize(4300, 0.0001) / 8 AS size_of_bloom_filter_in_bytes;

┌─size_of_bloom_filter_in_bytes─┐
│                         10304 │
└───────────────────────────────┘

--- оценка количества хеш-функций
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) as number_of_hash_functions

┌─number_of_hash_functions─┐
│                       13 │
└──────────────────────────┘
```

Разумеется, эти функции также можно использовать для оценки параметров при других условиях.
Приведенные выше функции основаны на калькуляторе фильтра Блума, доступном [здесь](https://hur.st/bloomfilter).

#### Токенный фильтр Блума {#token-bloom-filter}

Токенный фильтр Блума аналогичен `ngrambf_v1`, но сохраняет токены (последовательности, разделенные неалфавитно-цифровыми символами) вместо n-грамм.

```text title="Синтаксис"
tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```


#### Фильтр Блума на основе разреженных грамм {#sparse-grams-bloom-filter}

Фильтр Блума на основе разреженных грамм аналогичен `ngrambf_v1`, но использует [токены разреженных грамм](/sql-reference/functions/string-functions.md/#sparseGrams) вместо n-грамм.

```text title="Синтаксис"
sparse_grams(min_ngram_length, max_ngram_length, min_cutoff_length, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```

### Текстовый индекс {#text}

Поддерживает полнотекстовый поиск, подробности см. [здесь](invertedindexes.md).

#### Векторное сходство {#vector-similarity}

Поддерживает приближённый поиск ближайших соседей, подробности см. [здесь](annindexes.md).

### Поддержка функций {#functions-support}

Условия в секции `WHERE` содержат вызовы функций, работающих со столбцами. Если столбец является частью индекса, ClickHouse пытается использовать этот индекс при выполнении функций. ClickHouse поддерживает различные подмножества функций для использования индексов.

Индексы типа `set` могут использоваться всеми функциями. Другие типы индексов поддерживаются следующим образом:


| Функция (оператор) / индекс                                                                                               | первичный ключ | minmax | ngrambf&#95;v1 | tokenbf&#95;v1 | bloom&#95;filter | text | sparse&#95;grams |
| ------------------------------------------------------------------------------------------------------------------------- | -------------- | ------ | -------------- | -------------- | ---------------- | ---- | ---------------- |
| [equals (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                                                | ✔              | ✔      | ✔              | ✔              | ✔                | ✔    | ✔                |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notEquals)                                    | ✔              | ✔      | ✔              | ✔              | ✔                | ✔    | ✔                |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                                         | ✔              | ✔      | ✔              | ✔              | ✗                | ✔    | ✔                |
| [notLike](/sql-reference/functions/string-search-functions.md/#notLike)                                                   | ✔              | ✔      | ✔              | ✔              | ✗                | ✔    | ✔                |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                                       | ✗              | ✗      | ✔              | ✔              | ✗                | ✔    | ✔                |
| [startsWith](/sql-reference/functions/string-functions.md/#startsWith)                                                    | ✔              | ✔      | ✔              | ✔              | ✗                | ✔    | ✔                |
| [endsWith](/sql-reference/functions/string-functions.md/#endsWith)                                                        | ✗              | ✗      | ✔              | ✔              | ✗                | ✔    | ✔                |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multiSearchAny)                                     | ✗              | ✗      | ✔              | ✗              | ✗                | ✗    | ✗                |
| [in](/sql-reference/functions/in-functions)                                                                               | ✔              | ✔      | ✔              | ✔              | ✔                | ✔    | ✔                |
| [notIn](/sql-reference/functions/in-functions)                                                                            | ✔              | ✔      | ✔              | ✔              | ✔                | ✔    | ✔                |
| [меньше (`<`)](/sql-reference/functions/comparison-functions.md/#less)                                                    | ✔              | ✔      | ✗              | ✗              | ✗                | ✗    | ✗                |
| [больше (`>`)](/sql-reference/functions/comparison-functions.md/#greater)                                                 | ✔              | ✔      | ✗              | ✗              | ✗                | ✗    | ✗                |
| [lessOrEquals (`<=`)](/sql-reference/functions/comparison-functions.md/#lessOrEquals)                                     | ✔              | ✔      | ✗              | ✗              | ✗                | ✗    | ✗                |
| [greaterOrEquals (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterOrEquals)                               | ✔              | ✔      | ✗              | ✗              | ✗                | ✗    | ✗                |
| [empty](/sql-reference/functions/array-functions/#empty)                                                                  | ✔              | ✔      | ✗              | ✗              | ✗                | ✗    | ✗                |
| [notEmpty](/sql-reference/functions/array-functions/#notEmpty)                                                            | ✗              | ✔      | ✗              | ✗              | ✗                | ✗    | ✔                |
| [has](/sql-reference/functions/array-functions#has)                                                                       | ✗              | ✗      | ✔              | ✔              | ✔                | ✔    | ✔                |
| [hasAny](/sql-reference/functions/array-functions#hasAny)                                                                 | ✗              | ✗      | ✔              | ✔              | ✔                | ✗    | ✔                |
| [hasAll](/sql-reference/functions/array-functions#hasAll)                                                                 | ✗              | ✗      | ✔              | ✔              | ✔                | ✗    | ✔                |
| [hasToken](/sql-reference/functions/string-search-functions.md/#hasToken)                                                 | ✗              | ✗      | ✗              | ✔              | ✗                | ✔    | ✗                |
| [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hasTokenOrNull)                                     | ✗              | ✗      | ✗              | ✔              | ✗                | ✔    | ✗                |
| [hasTokenCaseInsensitive (`*`)](/sql-reference/functions/string-search-functions.md/#hasTokenCaseInsensitive)             | ✗              | ✗      | ✗              | ✔              | ✗                | ✗    | ✗                |
| [hasTokenCaseInsensitiveOrNull (`*`)](/sql-reference/functions/string-search-functions.md/#hasTokenCaseInsensitiveOrNull) | ✗              | ✗      | ✗              | ✔              | ✗                | ✗    | ✗                |
| [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasAnyTokens)                                         | ✗              | ✗      | ✗              | ✗              | ✗                | ✔    | ✗                |
| [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasAllTokens)                                         | ✗              | ✗      | ✗              | ✗              | ✗                | ✔    | ✗                |
| [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains)                                                   | ✗              | ✗      | ✗              | ✗              | ✗                | ✔    | ✗                |



Функции с константным аргументом, который меньше размера n-граммы, не могут использоваться индексом `ngrambf_v1` для оптимизации запросов.

(*) Чтобы `hasTokenCaseInsensitive` и `hasTokenCaseInsensitiveOrNull` были эффективны, индекс `tokenbf_v1` должен быть создан по данным в нижнем регистре, например `INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`.

:::note
Фильтры Блума могут давать ложноположительные совпадения, поэтому индексы `ngrambf_v1`, `tokenbf_v1`, `sparse_grams` и `bloom_filter` не могут использоваться для оптимизации запросов, в которых ожидается, что результат функции будет ложным.

Например:

- Может быть оптимизировано:
  - `s LIKE '%test%'`
  - `NOT s NOT LIKE '%test%'`
  - `s = 1`
  - `NOT s != 1`
  - `startsWith(s, 'test')`
- Не может быть оптимизировано:
  - `NOT s LIKE '%test%'`
  - `s NOT LIKE '%test%'`
  - `NOT s = 1`
  - `s != 1`
  - `NOT startsWith(s, 'test')`
:::



## Проекции {#projections}

Проекции похожи на [материализованные представления](/sql-reference/statements/create/view), но определяются на уровне части таблицы. Они обеспечивают гарантии согласованности и автоматически используются в запросах.

:::note
При использовании проекций следует также учитывать настройку [force_optimize_projection](/operations/settings/settings#force_optimize_projection).
:::

Проекции не поддерживаются в операторах `SELECT` с модификатором [FINAL](/sql-reference/statements/select/from#final-modifier).

### Запрос проекции {#projection-query}

Запрос проекции определяет проекцию. Он неявно выбирает данные из родительской таблицы.
**Синтаксис**

```sql
SELECT <column list expr> [GROUP BY] <group keys expr> [ORDER BY] <expr>
```

Проекции можно изменять или удалять с помощью оператора [ALTER](/sql-reference/statements/alter/projection.md).

### Хранение проекций {#projection-storage}

Проекции хранятся внутри директории части таблицы. Это похоже на индекс, но содержит поддиректорию, в которой хранится часть анонимной таблицы `MergeTree`. Таблица создается на основе определяющего запроса проекции. Если присутствует секция `GROUP BY`, базовым движком хранения становится [AggregatingMergeTree](aggregatingmergetree.md), и все агрегатные функции преобразуются в `AggregateFunction`. Если присутствует секция `ORDER BY`, таблица `MergeTree` использует её в качестве выражения первичного ключа. В процессе слияния часть проекции объединяется через процедуру слияния её хранилища. Контрольная сумма части родительской таблицы объединяется с контрольной суммой части проекции. Другие операции обслуживания аналогичны индексам с пропуском данных.

### Анализ запросов {#projection-query-analysis}

1. Проверяется, может ли проекция использоваться для ответа на данный запрос, то есть генерирует ли она тот же результат, что и запрос к базовой таблице.
2. Выбирается наилучшее подходящее совпадение, которое содержит наименьшее количество гранул для чтения.
3. Конвейер запроса, использующий проекции, будет отличаться от того, который использует исходные части. Если проекция отсутствует в некоторых частях, можно добавить конвейер для её создания «на лету».


## Параллельный доступ к данным {#concurrent-data-access}

Для параллельного доступа к таблице используется многоверсионность. Иными словами, когда таблица одновременно читается и обновляется, данные читаются из набора кусков, актуального на момент выполнения запроса. Длительные блокировки отсутствуют. Операции вставки не мешают операциям чтения.

Чтение из таблицы автоматически распараллеливается.


## TTL для столбцов и таблиц {#table_engine-mergetree-ttl}

Определяет время жизни значений.

Секция `TTL` может быть задана как для всей таблицы, так и для каждого отдельного столбца. `TTL` на уровне таблицы также может определять логику автоматического перемещения данных между дисками и томами или повторного сжатия кусков, в которых все данные устарели.

Выражения должны возвращать тип данных [Date](/sql-reference/data-types/date.md), [Date32](/sql-reference/data-types/date32.md), [DateTime](/sql-reference/data-types/datetime.md) или [DateTime64](/sql-reference/data-types/datetime64.md).

**Синтаксис**

Установка времени жизни для столбца:

```sql
TTL time_column
TTL time_column + interval
```

Для определения `interval` используйте операторы [временных интервалов](/sql-reference/operators#operators-for-working-with-dates-and-times), например:

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```

### TTL столбца {#mergetree-column-ttl}

Когда значения в столбце устаревают, ClickHouse заменяет их значениями по умолчанию для типа данных столбца. Если все значения столбца в куске данных устаревают, ClickHouse удаляет этот столбец из куска данных в файловой системе.

Секция `TTL` не может использоваться для ключевых столбцов.

**Примеры**

#### Создание таблицы с `TTL`: {#creating-a-table-with-ttl}

```sql
CREATE TABLE tab
(
    d DateTime,
    a Int TTL d + INTERVAL 1 MONTH,
    b Int TTL d + INTERVAL 1 MONTH,
    c String
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(d)
ORDER BY d;
```

#### Добавление TTL к столбцу существующей таблицы {#adding-ttl-to-a-column-of-an-existing-table}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 DAY;
```

#### Изменение TTL столбца {#altering-ttl-of-the-column}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 MONTH;
```

### TTL таблицы {#mergetree-table-ttl}

Таблица может иметь выражение для удаления устаревших строк и несколько выражений для автоматического перемещения кусков между [дисками или томами](#table_engine-mergetree-multiple-volumes). Когда строки в таблице устаревают, ClickHouse удаляет все соответствующие строки. Для перемещения или повторного сжатия кусков все строки куска должны удовлетворять критериям выражения `TTL`.

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

Тип правила TTL может следовать за каждым выражением TTL. Он определяет действие, которое должно быть выполнено после того, как выражение будет удовлетворено (достигнет текущего времени):

- `DELETE` — удалить устаревшие строки (действие по умолчанию);
- `RECOMPRESS codec_name` — повторно сжать кусок данных с помощью `codec_name`;
- `TO DISK 'aaa'` — переместить кусок на диск `aaa`;
- `TO VOLUME 'bbb'` — переместить кусок на том `bbb`;
- `GROUP BY` — агрегировать устаревшие строки.

Действие `DELETE` может использоваться вместе с секцией `WHERE` для удаления только некоторых устаревших строк на основе условия фильтрации:

```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

Выражение `GROUP BY` должно быть префиксом первичного ключа таблицы.

Если столбец не является частью выражения `GROUP BY` и не задан явно в секции `SET`, в результирующей строке он содержит произвольное значение из сгруппированных строк (как если бы к нему была применена агрегатная функция `any`).

**Примеры**

#### Создание таблицы с `TTL`: {#creating-a-table-with-ttl-1}

```sql
CREATE TABLE tab
(
    d DateTime,
    a Int
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(d)
ORDER BY d
TTL d + INTERVAL 1 MONTH DELETE,
    d + INTERVAL 1 WEEK TO VOLUME 'aaa',
    d + INTERVAL 2 WEEK TO DISK 'bbb';
```

#### Изменение `TTL` таблицы: {#altering-ttl-of-the-table}

```sql
ALTER TABLE tab
    MODIFY TTL d + INTERVAL 1 DAY;
```


Создание таблицы, в которой строки истекают через месяц. Истекшие строки, даты которых приходятся на понедельники, удаляются:

```sql
CREATE TABLE table_with_where
(
    d DateTime,
    a Int
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(d)
ORDER BY d
TTL d + INTERVAL 1 MONTH DELETE WHERE toDayOfWeek(d) = 1;
```

#### Создание таблицы, в которой истекшие строки перекомпрессируются: {#creating-a-table-where-expired-rows-are-recompressed}

```sql
CREATE TABLE table_for_recompression
(
    d DateTime,
    key UInt64,
    value String
) ENGINE MergeTree()
ORDER BY tuple()
PARTITION BY key
TTL d + INTERVAL 1 MONTH RECOMPRESS CODEC(ZSTD(17)), d + INTERVAL 1 YEAR RECOMPRESS CODEC(LZ4HC(10))
SETTINGS min_rows_for_wide_part = 0, min_bytes_for_wide_part = 0;
```

Создание таблицы, в которой истекшие строки агрегируются. В результирующих строках `x` содержит максимальное значение среди сгруппированных строк, `y` — минимальное значение, а `d` — любое случайное значение из сгруппированных строк.

```sql
CREATE TABLE table_for_aggregation
(
    d DateTime,
    k1 Int,
    k2 Int,
    x Int,
    y Int
)
ENGINE = MergeTree
ORDER BY (k1, k2)
TTL d + INTERVAL 1 MONTH GROUP BY k1, k2 SET x = max(x), y = min(y);
```

### Удаление истекших данных {#mergetree-removing-expired-data}

Данные с истекшим `TTL` удаляются при слиянии частей данных в ClickHouse.

Когда ClickHouse обнаруживает истекшие данные, он выполняет внеплановое слияние. Для управления частотой таких слияний можно задать параметр `merge_with_ttl_timeout`. Если значение слишком низкое, будет выполняться много внеплановых слияний, что может потреблять значительные ресурсы.

Если вы выполняете запрос `SELECT` между слияниями, вы можете получить истекшие данные. Чтобы этого избежать, используйте запрос [OPTIMIZE](/sql-reference/statements/optimize.md) перед `SELECT`.

**См. также**

- настройка [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts)


## Типы дисков {#disk-types}

Помимо локальных блочных устройств, ClickHouse поддерживает следующие типы хранилищ:

- [`s3` для S3 и MinIO](#table_engine-mergetree-s3)
- [`gcs` для GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` для Azure Blob Storage](/operations/storing-data#azure-blob-storage)
- [`hdfs` для HDFS](/engines/table-engines/integrations/hdfs)
- [`web` для чтения данных из веб-источников в режиме только для чтения](/operations/storing-data#web-storage)
- [`cache` для локального кэширования](/operations/storing-data#using-local-cache)
- [`s3_plain` для резервного копирования в S3](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` для неизменяемых нереплицируемых таблиц в S3](/operations/storing-data.md#s3-plain-rewritable-storage)


## Использование нескольких блочных устройств для хранения данных {#table_engine-mergetree-multiple-volumes}

### Введение {#introduction}

Семейство движков таблиц `MergeTree` может хранить данные на нескольких блочных устройствах. Например, это полезно, когда данные определённой таблицы неявно делятся на «горячие» и «холодные». К наиболее свежим данным регулярно обращаются, но они занимают небольшой объём. Напротив, исторические данные с «длинным хвостом» запрашиваются редко. Если доступно несколько дисков, «горячие» данные можно размещать на быстрых дисках (например, NVMe SSD или в памяти), а «холодные» данные — на относительно медленных (например, HDD).

Часть данных является минимальной перемещаемой единицей для таблиц на движке `MergeTree`. Данные, относящиеся к одной части, хранятся на одном диске. Части данных могут перемещаться между дисками в фоновом режиме (в соответствии с пользовательскими настройками), а также с помощью запросов [ALTER](/sql-reference/statements/alter/partition).

### Термины {#terms}

- Диск — блочное устройство, подключённое к файловой системе.
- Диск по умолчанию — диск, на котором расположен путь, указанный в настройке сервера [path](/operations/server-configuration-parameters/settings.md/#path).
- Том — упорядоченный набор однотипных дисков (аналогично [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)).
- Политика хранения — набор томов и правила перемещения данных между ними.

Названия указанных сущностей можно найти в системных таблицах [system.storage_policies](/operations/system-tables/storage_policies) и [system.disks](/operations/system-tables/disks). Чтобы применить одну из настроенных политик хранения к таблице, используйте настройку `storage_policy` для таблиц семейства движков `MergeTree`.

### Конфигурация {#table_engine-mergetree-multiple-volumes_configure}

Диски, тома и политики хранения должны быть объявлены внутри тега `<storage_configuration>` в файле в каталоге `config.d`.

:::tip
Диски также могут быть объявлены в секции `SETTINGS` запроса. Это полезно
для разового анализа, когда необходимо временно подключить диск, который, например, доступен по URL.
Подробнее см. в разделе [динамическое хранилище](/operations/storing-data#dynamic-configuration).
:::

Структура конфигурации:

```xml
<storage_configuration>
    <disks>
        <disk_name_1> <!-- имя диска -->
            <path>/mnt/fast_ssd/clickhouse/</path>
        </disk_name_1>
        <disk_name_2>
            <path>/mnt/hdd1/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_2>
        <disk_name_3>
            <path>/mnt/hdd2/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_3>

        ...
    </disks>

    ...
</storage_configuration>
```

Теги:

- `<disk_name_N>` — имя диска. Имена должны отличаться для всех дисков.
- `path` — путь, по которому сервер будет хранить данные (каталоги `data` и `shadow`); должен заканчиваться на «/».
- `keep_free_space_bytes` — объём свободного дискового пространства, который необходимо зарезервировать.

Порядок определения дисков не имеет значения.

Разметка конфигурации политик хранения:

```xml
<storage_configuration>
    ...
    <policies>
        <policy_name_1>
            <volumes>
                <volume_name_1>
                    <disk>disk_name_from_disks_configuration</disk>
                    <max_data_part_size_bytes>1073741824</max_data_part_size_bytes>
                    <load_balancing>round_robin</load_balancing>
                </volume_name_1>
                <volume_name_2>
                    <!-- конфигурация -->
                </volume_name_2>
                <!-- дополнительные тома -->
            </volumes>
            <move_factor>0.2</move_factor>
        </policy_name_1>
        <policy_name_2>
            <!-- конфигурация -->
        </policy_name_2>

        <!-- дополнительные политики -->
    </policies>
    ...
</storage_configuration>
```

Теги:


* `policy_name_N` — имя политики. Имена политик должны быть уникальными.
* `volume_name_N` — имя тома. Имена томов должны быть уникальными.
* `disk` — диск внутри тома.
* `max_data_part_size_bytes` — максимальный размер части данных, которая может быть сохранена на любом из дисков тома. Если оцениваемый размер слитой части данных больше, чем `max_data_part_size_bytes`, то эта часть будет записана на следующий том. По сути, эта возможность позволяет хранить новые/маленькие части данных на «горячем» томе (SSD) и перемещать их на «холодный» том (HDD), когда они становятся достаточно крупными. Не используйте этот параметр, если ваша политика содержит только один том.
* `move_factor` — когда количество доступного места становится меньше этого коэффициента, данные автоматически начинают перемещаться на следующий том, если он есть (по умолчанию 0.1). ClickHouse сортирует существующие части данных по размеру от наибольшей к наименьшей (в порядке убывания) и выбирает части с суммарным размером, достаточным для выполнения условия `move_factor`. Если суммарного размера всех частей недостаточно, будут перемещены все части.
* `perform_ttl_move_on_insert` — отключает перемещение по TTL при INSERT части данных. По умолчанию (если параметр включен), если вставляется часть данных, которая уже просрочена по правилу перемещения TTL, она сразу записывается на том/диск, указанный в правиле перемещения. Это может значительно замедлить вставку, если целевой том/диск медленный (например, S3). Если параметр отключен, уже просроченная часть данных сначала записывается на том по умолчанию, а затем сразу же переносится на том, указанный правилом TTL.
* `load_balancing` — политика балансировки по дискам: `round_robin` или `least_used`.
* `least_used_ttl_ms` — настройка тайм-аута (в миллисекундах) для обновления информации о доступном пространстве на всех дисках (`0` — обновлять всегда, `-1` — никогда не обновлять, значение по умолчанию — `60000`). Обратите внимание: если диск может использоваться только ClickHouse и не подвержен онлайн-изменению размера/сжатию файловой системы, можно использовать `-1`; во всех остальных случаях это не рекомендуется, так как в итоге это приведёт к некорректному распределению пространства.
* `prefer_not_to_merge` — не следует использовать этот параметр. Отключает слияние частей данных на этом томе (это вредно и приводит к деградации производительности). Когда этот параметр включён (не делайте этого), слияние данных на этом томе не допускается (что плохо). Это позволяет (но вам это не нужно) управлять (если вы хотите чем-то управлять, вы совершаете ошибку) тем, как ClickHouse работает с медленными дисками (но ClickHouse знает лучше, поэтому, пожалуйста, не используйте этот параметр).
* `volume_priority` — определяет приоритет (порядок), в котором заполняются тома. Чем меньше значение, тем выше приоритет. Значения параметра должны быть натуральными числами и совместно покрывать диапазон от 1 до N (где N — наименьший приоритет) без пропуска каких-либо чисел.
  * Если *у всех* томов задан приоритет, они используются в указанном порядке.
  * Если только *у некоторых* томов задан приоритет, тома без приоритета имеют наименьший приоритет и используются в том порядке, в котором они определены в конфигурации.
  * Если *ни у одного* тома приоритет не задан, их приоритет устанавливается в соответствии с порядком их объявления в конфигурации.
  * Два тома не могут иметь одинаковое значение приоритета.

Примеры конфигурации:

```xml
<storage_configuration>
    ...
    <policies>
        <hdd_in_order> <!-- название политики -->
            <volumes>
                <single> <!-- название тома -->
                    <disk>disk1</disk>
                    <disk>disk2</disk>
                </single>
            </volumes>
        </hdd_in_order>

        <moving_from_ssd_to_hdd>
            <volumes>
                <hot>
                    <disk>fast_ssd</disk>
                    <max_data_part_size_bytes>1073741824</max_data_part_size_bytes>
                </hot>
                <cold>
                    <disk>disk1</disk>
                </cold>
            </volumes>
            <move_factor>0.2</move_factor>
        </moving_from_ssd_to_hdd>

        <small_jbod_with_external_no_merges>
            <volumes>
                <main>
                    <disk>jbod1</disk>
                </main>
                <external>
                    <disk>external</disk>
                </external>
            </volumes>
        </small_jbod_with_external_no_merges>
    </policies>
    ...
</storage_configuration>
```


В данном примере политика `hdd_in_order` реализует подход [циклического перебора](https://en.wikipedia.org/wiki/Round-robin_scheduling). Эта политика определяет только один том (`single`), куски данных хранятся на всех его дисках в циклическом порядке. Такая политика может быть весьма полезна, если к системе подключено несколько однотипных дисков, но RAID не настроен. Имейте в виду, что каждый отдельный дисковый накопитель не является надёжным, и вы можете компенсировать это коэффициентом репликации 3 или более.

Если в системе доступны различные типы дисков, можно использовать политику `moving_from_ssd_to_hdd`. Том `hot` состоит из SSD-диска (`fast_ssd`), максимальный размер куска, который может храниться на этом томе, составляет 1 ГБ. Все куски размером более 1 ГБ будут храниться непосредственно на томе `cold`, который содержит HDD-диск `disk1`.
Кроме того, как только диск `fast_ssd` заполнится более чем на 80%, данные будут перенесены на `disk1` фоновым процессом.

Порядок перечисления томов в политике хранения важен в случае, если хотя бы один из перечисленных томов не имеет явного параметра `volume_priority`.
Как только том переполняется, данные перемещаются на следующий. Порядок перечисления дисков также важен, поскольку данные хранятся на них по очереди.

При создании таблицы к ней можно применить одну из настроенных политик хранения:

```sql
CREATE TABLE table_with_non_default_policy (
    EventDate Date,
    OrderID UInt64,
    BannerID UInt64,
    SearchPhrase String
) ENGINE = MergeTree
ORDER BY (OrderID, BannerID)
PARTITION BY toYYYYMM(EventDate)
SETTINGS storage_policy = 'moving_from_ssd_to_hdd'
```

Политика хранения `default` подразумевает использование только одного тома, который состоит из одного диска, указанного в `<path>`.
Политику хранения можно изменить после создания таблицы с помощью запроса [ALTER TABLE ... MODIFY SETTING], новая политика должна включать все старые диски и тома с теми же именами.

Количество потоков, выполняющих фоновое перемещение кусков данных, можно изменить с помощью настройки [background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size).

### Подробности {#details}

В случае таблиц `MergeTree` данные попадают на диск различными способами:

- В результате вставки (запрос `INSERT`).
- Во время фоновых слияний и [мутаций](/sql-reference/statements/alter#mutations).
- При загрузке с другой реплики.
- В результате заморозки партиции [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition).

Во всех этих случаях, за исключением мутаций и заморозки партиций, кусок хранится на томе и диске в соответствии с заданной политикой хранения:

1.  Выбирается первый том (в порядке определения), который имеет достаточно дискового пространства для хранения куска (`unreserved_space > current_part_size`) и позволяет хранить куски заданного размера (`max_data_part_size_bytes > current_part_size`).
2.  В пределах этого тома выбирается диск, который следует за тем, который использовался для хранения предыдущего фрагмента данных, и который имеет свободное пространство больше размера куска (`unreserved_space - keep_free_space_bytes > current_part_size`).

Внутри мутации и заморозка партиций используют [жёсткие ссылки](https://en.wikipedia.org/wiki/Hard_link). Жёсткие ссылки между различными дисками не поддерживаются, поэтому в таких случаях результирующие куски хранятся на тех же дисках, что и исходные.

В фоновом режиме куски перемещаются между томами на основе объёма свободного пространства (параметр `move_factor`) в соответствии с порядком, в котором тома объявлены в конфигурационном файле.
Данные никогда не переносятся с последнего тома на первый. Для мониторинга фоновых перемещений можно использовать системные таблицы [system.part_log](/operations/system-tables/part_log) (поле `type = MOVE_PART`) и [system.parts](/operations/system-tables/parts.md) (поля `path` и `disk`). Также подробная информация доступна в логах сервера.

Пользователь может принудительно переместить кусок или партицию с одного тома на другой с помощью запроса [ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition), при этом учитываются все ограничения для фоновых операций. Запрос инициирует перемещение самостоятельно и не ожидает завершения фоновых операций. Пользователь получит сообщение об ошибке, если недостаточно свободного пространства или если какое-либо из требуемых условий не выполнено.

Перемещение данных не влияет на репликацию данных. Поэтому для одной и той же таблицы на разных репликах могут быть указаны различные политики хранения.


После завершения фоновых слияний и мутаций старые части удаляются только по истечении заданного времени (`old_parts_lifetime`).
В течение этого времени они не перемещаются на другие тома или диски. Поэтому, пока части окончательно не удалены, они продолжают учитываться при расчёте занятого дискового пространства.

Пользователь может равномерно распределять новые крупные части по разным дискам тома [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) с помощью настройки [min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min_bytes_to_rebalance_partition_over_jbod).



## Использование внешнего хранилища для хранения данных {#table_engine-mergetree-s3}

Движки таблиц семейства [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) могут хранить данные в `S3`, `AzureBlobStorage`, `HDFS`, используя диски с типами `s3`, `azure_blob_storage`, `hdfs` соответственно. Подробнее см. в разделе [настройка параметров внешнего хранилища](/operations/storing-data.md/#configuring-external-storage).

Пример использования [S3](https://aws.amazon.com/s3/) в качестве внешнего хранилища с диском типа `s3`.

Разметка конфигурации:

```xml
<storage_configuration>
    ...
    <disks>
        <s3>
            <type>s3</type>
            <support_batch_delete>true</support_batch_delete>
            <endpoint>https://clickhouse-public-datasets.s3.amazonaws.com/my-bucket/root-path/</endpoint>
            <access_key_id>your_access_key_id</access_key_id>
            <secret_access_key>your_secret_access_key</secret_access_key>
            <region></region>
            <header>Authorization: Bearer SOME-TOKEN</header>
            <server_side_encryption_customer_key_base64>your_base64_encoded_customer_key</server_side_encryption_customer_key_base64>
            <server_side_encryption_kms_key_id>your_kms_key_id</server_side_encryption_kms_key_id>
            <server_side_encryption_kms_encryption_context>your_kms_encryption_context</server_side_encryption_kms_encryption_context>
            <server_side_encryption_kms_bucket_key_enabled>true</server_side_encryption_kms_bucket_key_enabled>
            <proxy>
                <uri>http://proxy1</uri>
                <uri>http://proxy2</uri>
            </proxy>
            <connect_timeout_ms>10000</connect_timeout_ms>
            <request_timeout_ms>5000</request_timeout_ms>
            <retry_attempts>10</retry_attempts>
            <single_read_retries>4</single_read_retries>
            <min_bytes_for_seek>1000</min_bytes_for_seek>
            <metadata_path>/var/lib/clickhouse/disks/s3/</metadata_path>
            <skip_access_check>false</skip_access_check>
        </s3>
        <s3_cache>
            <type>cache</type>
            <disk>s3</disk>
            <path>/var/lib/clickhouse/disks/s3_cache/</path>
            <max_size>10Gi</max_size>
        </s3_cache>
    </disks>
    ...
</storage_configuration>
```

См. также [настройка параметров внешнего хранилища](/operations/storing-data.md/#configuring-external-storage).

:::note конфигурация кеша
В версиях ClickHouse с 22.3 по 22.7 используется другая конфигурация кеша. См. раздел [использование локального кеша](/operations/storing-data.md/#using-local-cache), если вы используете одну из этих версий.
:::


## Виртуальные столбцы {#virtual-columns}

- `_part` — Имя части.
- `_part_index` — Порядковый индекс части в результате запроса.
- `_part_starting_offset` — Накопительное смещение начальной строки части в результате запроса.
- `_part_offset` — Номер строки в части.
- `_part_granule_offset` — Номер гранулы в части.
- `_partition_id` — Имя партиции.
- `_part_uuid` — Уникальный идентификатор части (если включена настройка MergeTree `assign_part_uuids`).
- `_part_data_version` — Версия данных части (минимальный номер блока или версия мутации).
- `_partition_value` — Значения (кортеж) выражения `partition by`.
- `_sample_factor` — Коэффициент выборки (из запроса).
- `_block_number` — Исходный номер блока для строки, назначенный при вставке; сохраняется при слияниях, если включена настройка `enable_block_number_column`.
- `_block_offset` — Исходный номер строки в блоке, назначенный при вставке; сохраняется при слияниях, если включена настройка `enable_block_offset_column`.
- `_disk_name` — Имя диска, используемого для хранения данных.


## Статистика столбцов {#column-statistics}

<ExperimentalBadge />
<CloudNotSupportedBadge />

Объявление статистики находится в секции столбцов запроса `CREATE` для таблиц семейства `*MergeTree*` при включении `set allow_experimental_statistics = 1`.

```sql
CREATE TABLE tab
(
    a Int64 STATISTICS(TDigest, Uniq),
    b Float64
)
ENGINE = MergeTree
ORDER BY a
```

Статистикой также можно управлять с помощью операторов `ALTER`.

```sql
ALTER TABLE tab ADD STATISTICS b TYPE TDigest, Uniq;
ALTER TABLE tab DROP STATISTICS a;
```

Эта легковесная статистика агрегирует информацию о распределении значений в столбцах. Статистика хранится в каждом куске и обновляется при каждой вставке данных.
Она может использоваться для оптимизации prewhere только при включении `set allow_statistics_optimize = 1`.

### Доступные типы статистики столбцов {#available-types-of-column-statistics}

- `MinMax`

  Минимальное и максимальное значения столбца, что позволяет оценить селективность диапазонных фильтров для числовых столбцов.

  Синтаксис: `minmax`

- `TDigest`

  Скетчи [TDigest](https://github.com/tdunning/t-digest), которые позволяют вычислять приблизительные процентили (например, 90-й процентиль) для числовых столбцов.

  Синтаксис: `tdigest`

- `Uniq`

  Скетчи [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog), которые предоставляют оценку количества уникальных значений в столбце.

  Синтаксис: `uniq`

- `CountMin`

  Скетчи [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch), которые предоставляют приблизительный подсчет частоты каждого значения в столбце.

  Синтаксис: `countmin`

### Поддерживаемые типы данных {#supported-data-types}

|          | (U)Int*, Float*, Decimal(_), Date_, Boolean, Enum\* | String или FixedString |
| -------- | --------------------------------------------------- | --------------------- |
| CountMin | ✔                                                  | ✔                    |
| MinMax   | ✔                                                  | ✗                     |
| TDigest  | ✔                                                  | ✗                     |
| Uniq     | ✔                                                  | ✔                    |

### Поддерживаемые операции {#supported-operations}

|          | Фильтры равенства (==) | Диапазонные фильтры (`>, >=, <, <=`) |
| -------- | --------------------- | ------------------------------ |
| CountMin | ✔                    | ✗                              |
| MinMax   | ✗                     | ✔                             |
| TDigest  | ✗                     | ✔                             |
| Uniq     | ✔                    | ✗                              |


## Настройки на уровне столбцов {#column-level-settings}

Некоторые настройки MergeTree можно переопределить на уровне столбцов:

- `max_compress_block_size` — Максимальный размер блоков несжатых данных перед сжатием при записи в таблицу.
- `min_compress_block_size` — Минимальный размер блоков несжатых данных, требуемый для сжатия при записи следующей метки.

Пример:

```sql
CREATE TABLE tab
(
    id Int64,
    document String SETTINGS (min_compress_block_size = 16777216, max_compress_block_size = 16777216)
)
ENGINE = MergeTree
ORDER BY id
```

Настройки на уровне столбцов можно изменить или удалить с помощью [ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md), например:

- Удаление `SETTINGS` из объявления столбца:

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- Изменение настройки:

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- Сброс одной или нескольких настроек также удаляет объявление настройки в выражении столбца запроса CREATE таблицы.

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
