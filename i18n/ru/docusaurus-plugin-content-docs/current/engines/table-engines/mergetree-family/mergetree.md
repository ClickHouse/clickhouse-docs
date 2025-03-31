---
description: '`MergeTree`-семейства движки таблиц предназначены для высоких скоростей приема данных и объемов данных.'
sidebar_label: 'MergeTree'
sidebar_position: 11
slug: /engines/table-engines/mergetree-family/mergetree
title: 'MergeTree'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# MergeTree

Движок `MergeTree` и другие движки семейства `MergeTree` (например, `ReplacingMergeTree`, `AggregatingMergeTree`) являются наиболее часто используемыми и наиболее надежными движками таблиц в ClickHouse.

Движки таблиц семейства `MergeTree` предназначены для высоких скоростей приема данных и огромных объемов данных. Операции вставки создают части таблицы, которые объединяются фоновым процессом с другими частями таблицы.

Основные характеристики движков таблиц семейства `MergeTree`:

- Первичный ключ таблицы определяет порядок сортировки в каждой части таблицы (кластерный индекс). Первичный ключ также не ссылается на отдельные строки, а на блоки по 8192 строки, называемые гранулами. Это делает первичные ключи огромных наборов данных достаточно маленькими, чтобы оставаться в загруженной оперативной памяти, при этом обеспечивая быстрый доступ к данным на диске.

- Таблицы могут быть разбиты на партиции с помощью произвольного выражения партиции. Удаление партиций гарантирует, что партиции пропускаются при чтении, когда это позволяет запрос.

- Данные могут реплицироваться между несколькими узлами кластера для высокой доступности, аварийного переключения и обновлений без простоя. См. [Репликация данных](/engines/table-engines/mergetree-family/replication.md).

- Движки таблиц `MergeTree` поддерживают различные виды статистики и методы выборки, чтобы помочь оптимизации запросов.

:::note
Несмотря на схожесть в названии, движок [Merge](/engines/table-engines/special/merge) отличается от движков `*MergeTree`.
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

Для подробного описания параметров см. оператор [CREATE TABLE](/sql-reference/statements/create/table.md).
### Клаузулы запроса {#mergetree-query-clauses}
#### ENGINE {#engine}

`ENGINE` — Имя и параметры движка. `ENGINE = MergeTree()`. Движок `MergeTree` не имеет параметров.
#### ORDER_BY {#order_by}

`ORDER BY` — Ключ сортировки.

Кортеж имен колонок или произвольные выражения. Пример: `ORDER BY (CounterID + 1, EventDate)`.

Если первичный ключ не определен (т.е. `PRIMARY KEY` не указан), ClickHouse использует ключ сортировки в качестве первичного ключа.

Если сортировка не требуется, вы можете использовать синтаксис `ORDER BY tuple()`. 
Кроме того, если включен параметр `create_table_empty_primary_key_by_default`, `ORDER BY tuple()` неявно добавляется к операторам `CREATE TABLE`. См. [Выбор первичного ключа](#selecting-a-primary-key).
#### PARTITION BY {#partition-by}

`PARTITION BY` — [Ключ партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key.md). Необязательный. В большинстве случаев вам не нужен ключ партиционирования, и, если вам действительно нужно разбить на партиции, обычно вам не нужен ключ партиционирования более детализированный, чем по месяцам. Партиционирование не ускоряет запросы (в отличие от выражения ORDER BY). Вам никогда не следует использовать слишком детализированное партиционирование. Не разбивайте ваши данные по идентификаторам клиентов или именам (вместо этого сделайте идентификатор клиента или имя первым столбцом в выражении ORDER BY).

Для партиционирования по месяцам используйте выражение `toYYYYMM(date_column)`, где `date_column` — это колонка с датой типа [Date](/sql-reference/data-types/date.md). Имена партиций здесь имеют формат `"YYYYMM"`.
#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — Первичный ключ, если он [отличается от ключа сортировки](#choosing-a-primary-key-that-differs-from-the-sorting-key). Необязательный.

Указание ключа сортировки (с использованием клаузулы `ORDER BY`) неявно указывает первичный ключ.
Обычно нет необходимости указывать первичный ключ в дополнение к ключу сортировки.
#### SAMPLE BY {#sample-by}

`SAMPLE BY` — Выражение выборки. Необязательное.

Если указано, оно должно содержаться в первичном ключе.
Выражение выборки должно давать беззнаковое целое число.

Пример: `SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`.
#### TTL {#ttl}

`TTL` — Список правил, которые определяют срок хранения строк и логику автоматического перемещения частей между дисками и томами. Необязательное.

Выражение должно возвращать `Date` или `DateTime`, например, `TTL date + INTERVAL 1 DAY`.

Тип правила `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY` определяет действие, которое должно быть выполнено с частью, если выражение выполнено (достигнуто текущее время): удаление устаревших строк, перемещение части (если выражение выполнено для всех строк в части) на указанный диск (`TO DISK 'xxx'`) или на том (`TO VOLUME 'xxx'`), или агрегирование значений устаревших строк. Тип правила по умолчанию — удаление (`DELETE`). Можно указать список из нескольких правил, но не должно быть более одного правила `DELETE`.

Для получения дополнительной информации см. [TTL для колонок и таблиц](#table_engine-mergetree-ttl).
#### SETTINGS {#settings}

См. [Настройки MergeTree](../../../operations/settings/merge-tree-settings.md).

**Пример установки секции**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

В этом примере мы устанавливаем партиционирование по месяцам.

Мы также устанавливаем выражение для выборки как хеш по идентификатору пользователя. Это позволяет вам псевдослучайным образом распределять данные в таблице для каждого `CounterID` и `EventDate`. Если вы определяете клаузулу [SAMPLE](/sql-reference/statements/select/sample) при выборе данных, ClickHouse вернет равномерную псевдослучайную выборку данных для подмножества пользователей.

Настройку `index_granularity` можно опустить, потому что 8192 — это значение по умолчанию.

<details markdown="1">

<summary>Устаревший способ создания таблицы</summary>

:::note
Не используйте этот метод в новых проектах. Если возможно, перенесите старые проекты на метод, описанный выше.
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

- `date-column` — Имя колонки типа [Date](/sql-reference/data-types/date.md). ClickHouse автоматически создает партиции по месяцам на основе этой колонки. Имена партиций имеют формат `"YYYYMM"`.
- `sampling_expression` — Выражение для выборки.
- `(primary, key)` — Первичный ключ. Тип: [Tuple()](/sql-reference/data-types/tuple.md).
- `index_granularity` — Гранулярность индекса. Количество строк данных между "метками" индекса. Значение 8192 подходит для большинства задач.

**Пример**

```sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

Движок `MergeTree` настроен так же, как в примере выше для основного метода настройки движка.
</details>
## Хранение данных {#mergetree-data-storage}

Таблица состоит из частей данных, отсортированных по первичному ключу.

Когда данные вставляются в таблицу, создаются отдельные части данных, и каждая из них лексикографически сортируется по первичному ключу. Например, если первичный ключ — это `(CounterID, Date)`, данные в части сортируются по `CounterID`, а в пределах каждого `CounterID` — по `Date`.

Данные, принадлежащие различным партициям, разделяются на разные части. В фоновом режиме ClickHouse объединяет части данных для более эффективного хранения. Части, принадлежащие различным партициям, не объединяются. Механизм слияния не гарантирует, что все строки с одинаковым первичным ключом будут находиться в одной части данных.

Части данных могут храниться в формате `Wide` или `Compact`. В формате `Wide` каждая колонка хранится в отдельном файле в файловой системе, в формате `Compact` все колонки хранятся в одном файле. Формат `Compact` можно использовать для повышения производительности малых и частых вставок.

Формат хранения данных контролируется настройками `min_bytes_for_wide_part` и `min_rows_for_wide_part` движка таблицы. Если количество байт или строк в части данных меньше, чем соответствующее значение настройки, часть хранится в формате `Compact`. В противном случае она хранится в формате `Wide`. Если ни одна из этих настроек не установлена, части данных хранятся в формате `Wide`.

Каждая часть данных логически делится на гранулы. Гранула — это самый маленький неделимый набор данных, который ClickHouse читает при выборе данных. ClickHouse не делит строки или значения, поэтому каждая гранула всегда содержит целое количество строк. Первая строка гранулы помечается значением первичного ключа для этой строки. Для каждой части данных ClickHouse создает файл индекса, который хранит метки. Для каждой колонки, независимо от того, является ли она частью первичного ключа или нет, ClickHouse также хранит те же метки. Эти метки позволяют вам находить данные прямо в файловых колонок.

Размер гранулы ограничивается настройками `index_granularity` и `index_granularity_bytes` движка таблицы. Количество строк в грануле находится в диапазоне `[1, index_granularity]`, в зависимости от размера строк. Размер гранулы может превышать `index_granularity_bytes`, если размер одной строки больше значения настройки. В этом случае размер гранулы равен размеру строки.
## Первичные ключи и индексы в запросах {#primary-keys-and-indexes-in-queries}

Рассмотрим в качестве примера первичный ключ `(CounterID, Date)`. В этом случае сортировка и индекс могут быть иллюстрированы следующим образом:

```text
Все данные:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
Метки:          |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Номера меток:   0      1      2      3      4      5      6      7      8      9      10
```

Если запрос данных указывает:

- `CounterID in ('a', 'h')`, сервер читает данные в диапазонах меток `[0, 3)` и `[6, 8)`.
- `CounterID IN ('a', 'h') AND Date = 3`, сервер читает данные в диапазонах меток `[1, 3)` и `[7, 8)`.
- `Date = 3`, сервер читает данные в диапазоне меток `[1, 10]`.

Примеры выше показывают, что всегда более эффективно использовать индекс, чем полный скан.

Разреженный индекс позволяет читать дополнительные данные. При чтении одного диапазона первичного ключа до `index_granularity * 2` дополнительных строк в каждом блоке данных может быть прочитано.

Разреженные индексы позволяют работать с очень большим количеством строк таблицы, поскольку в большинстве случаев такие индексы помещаются в оперативную память компьютера.

ClickHouse не требует уникального первичного ключа. Вы можете вставлять несколько строк с одинаковым первичным ключом.

Вы можете использовать выражения типа `Nullable` в клаузах `PRIMARY KEY` и `ORDER BY`, но это крайне нежелательно. Чтобы разрешить эту функцию, включите настройку [allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key). Принцип [NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values) применяется к значениям `NULL` в клаузе `ORDER BY`.
### Выбор первичного ключа {#selecting-a-primary-key}

Количество колонок в первичном ключе не ограничено явно. В зависимости от структуры данных вы можете включить больше или меньше колонок в первичный ключ. Это может:

- Улучшить производительность индекса.

    Если первичный ключ — это `(a, b)`, то добавление другой колонки `c` улучшит производительность, если придерживаться следующих условий:

    - Есть запросы с условием по колонке `c`.
    - Длинные диапазоны данных (в несколько раз длиннее, чем `index_granularity`) с одинаковыми значениями для `(a, b)` являются распространенными. То есть, когда добавление другой колонки позволяет пропустить достаточно длинные диапазоны данных.

- Улучшить компрессию данных.

    ClickHouse сортирует данные по первичному ключу, так что чем выше согласованность, тем лучше компрессия.

- Обеспечить дополнительную логику при объединении частей данных в движках [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) и [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md).

    В этом случае имеет смысл указать *ключ сортировки*, который отличается от первичного ключа.

Длинный первичный ключ негативно скажется на производительности вставки и потреблении памяти, но дополнительные колонки в первичном ключе не влияют на производительность ClickHouse во время запросов `SELECT`.

Вы можете создать таблицу без первичного ключа, используя синтаксис `ORDER BY tuple()`. В этом случае ClickHouse хранит данные в порядке вставки. Если вы хотите сохранить порядок данных при вставке данных с помощью запросов `INSERT ... SELECT`, установите [max_insert_threads = 1](/operations/settings/settings#max_insert_threads).

Чтобы выбрать данные в первоначальном порядке, используйте [однопоточные](/operations/settings/settings.md/#max_threads) запросы `SELECT`.
### Выбор первичного ключа, который отличается от ключа сортировки {#choosing-a-primary-key-that-differs-from-the-sorting-key}

Есть возможность указать первичный ключ (выражение со значениями, которые записываются в файл индекса для каждой метки), который отличается от ключа сортировки (выражение для сортировки строк в частях данных). В этом случае выражение первичного ключа должно быть префиксом выражения ключа сортировки.

Эта функция полезна при использовании движков [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) и
[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md). В обычном случае при использовании этих движков таблица имеет два типа колонок: *измерения* и *меры*. Типичные запросы агрегируют значения колонок меры с произвольным `GROUP BY` и фильтрацией по измерениям. Поскольку SummingMergeTree и AggregatingMergeTree агрегируют строки с одинаковым значением ключа сортировки, логично добавить все измерения к нему. В результате выражение ключа состоит из длинного списка колонок, и этот список должен часто обновляться новыми добавленными измерениями.

В этом случае имеет смысл оставить только несколько колонок в первичном ключе, которые будут обеспечивать эффективные диапазонные сканирования, а остальные колонковые измерения добавить в кортеж ключа сортировки.

[ALTER](/sql-reference/statements/alter/index.md) ключа сортировки — это легкая операция, потому что когда новая колонка одновременно добавляется в таблицу и в ключ сортировки, существующим частям данных не нужно изменяться. Поскольку старый ключ сортировки является префиксом нового ключа сортировки, и в только что добавленной колонке нет данных, данные сортируются по обоим ключам сортировки в момент изменения таблицы.
### Использование индексов и партиций в запросах {#use-of-indexes-and-partitions-in-queries}

Для запросов `SELECT` ClickHouse анализирует, может ли быть использован индекс. Индекс может быть использован, если клаузула `WHERE/PREWHERE` содержит выражение (в качестве одного из элементов конъюнкции или полностью), которое представляет собой операцию сравнения на равенство или неравенство, или если в нем есть `IN` или `LIKE` с фиксированным префиксом для колонок или выражений, которые являются частью первичного ключа или ключа партиционирования, или для некоторых частично повторяющихся функций этих колонок, или логических отношений этих выражений.

Таким образом, можно быстро выполнять запросы по одному или нескольким диапазонам первичного ключа. В этом примере запросы будут быстрыми, когда они выполняются для конкретной метки отслеживания, для конкретной метки и диапазона дат, для конкретной метки и даты, для нескольких меток с диапазоном дат и так далее.

Рассмотрим движок, сконфигурированный следующим образом:
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

ClickHouse будет использовать индекс первичного ключа, чтобы обрезать ненужные данные, а ключ партиционирования по месяцам даст возможность обрезать партиции, которые находятся в неподходящих диапазонах дат.

Примеры выше показывают, что индекс используется даже для сложных выражений. Чтение из таблицы организовано так, чтобы использование индекса не могло быть медленнее полного сканирования.

В следующем примере индекс не может быть использован.

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

Чтобы проверить, может ли ClickHouse использовать индекс при выполнении запроса, используйте настройки [force_index_by_date](/operations/settings/settings.md/#force_index_by_date) и [force_primary_key](/operations/settings/settings#force_primary_key).

Ключ партиционирования по месяцам позволяет читать только те блоки данных, которые содержат даты из подходящего диапазона. В этом случае блок данных может содержать данные для многих дат (до целого месяца). В рамках блока данные сортируются по первичному ключу, который может не содержать дату в качестве первого столбца. Из-за этого использование запроса только с условием даты, которое не указывает префикс первичного ключа, приведет к тому, что будет прочитано больше данных, чем для одной даты.
### Использование индекса для частично-монотонных первичных ключей {#use-of-index-for-partially-monotonic-primary-keys}

Рассмотрим, например, дни месяца. Они образуют [монотонную последовательность](https://en.wikipedia.org/wiki/Monotonic_function) в течение одного месяца, но не монотонны для более длительных периодов. Это частично-монотонная последовательность. Если пользователь создает таблицу с частично-монотонным первичным ключом, ClickHouse создает разреженный индекс, как обычно. Когда пользователь выбирает данные из такой таблицы, ClickHouse анализирует условия запроса. Если пользователь хочет получить данные между двумя метками индекса, и обе эти метки попадают в один месяц, ClickHouse может использовать индекс в этом конкретном случае, потому что он может рассчитать расстояние между параметрами запроса и метками индекса.

ClickHouse не может использовать индекс, если значения первичного ключа в диапазоне параметров запроса не представляют собой монотонную последовательность. В этом случае ClickHouse использует метод полного сканирования.

ClickHouse использует эту логику не только для последовательностей дней месяца, но и для любого первичного ключа, который представляет собой частично-монотонную последовательность.
### Индексы для пропуска данных {#table_engine-mergetree-data_skipping-indexes}

Декларация индекса находится в разделе колонок запроса `CREATE`.

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

Для таблиц семейства `*MergeTree` можно указать индексы пропуска данных.

Эти индексы агрегируют некоторую информацию о заданном выражении по блокам, которые состоят из `granularity_value` гранул (размер гранулы задается с помощью настройки `index_granularity` в движке таблицы). Затем эти агрегаты используются в запросах `SELECT`, чтобы сократить объем данных, которые нужно прочитать с диска, пропуская большие блоки данных, где запрос `where` не может быть выполнен.

Клауза `GRANULARITY` может быть опущена, значение по умолчанию для `granularity_value` — 1.

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

Индексы из примера могут быть использованы ClickHouse для сокращения объема данных, которые нужно прочитать с диска, в следующих запросах:

```sql
SELECT count() FROM table WHERE u64 == 10;
SELECT count() FROM table WHERE u64 * i32 >= 1234;
SELECT count() FROM table WHERE u64 * length(s) == 1234;
```

Индексы пропуска данных также могут быть созданы на составных колонках:

```sql
-- на колонках типа Map:
INDEX map_key_index mapKeys(map_column) TYPE bloom_filter
INDEX map_value_index mapValues(map_column) TYPE bloom_filter

-- на колонках типа Tuple:
INDEX tuple_1_index tuple_column.1 TYPE bloom_filter
INDEX tuple_2_index tuple_column.2 TYPE bloom_filter

-- на колонках типа Nested:
INDEX nested_1_index col.nested_col1 TYPE bloom_filter
INDEX nested_2_index col.nested_col2 TYPE bloom_filter
```
### Доступные типы индексов {#available-types-of-indices}
#### MinMax {#minmax}

Хранит крайние значения заданного выражения (если выражение является `tuple`, то оно хранит крайние значения для каждого элемента `tuple`), использует хранимую информацию для пропуска блоков данных, как первичный ключ.

Синтаксис: `minmax`
#### Set {#set}

Хранит уникальные значения заданного выражения (не более `max_rows` строк, `max_rows=0` означает "без ограничений"). Использует значения для проверки, если выражение `WHERE` не может быть выполнено на блоке данных.

Синтаксис: `set(max_rows)`
#### Bloom Filter {#bloom-filter}

Хранит [фильтр Блума](https://en.wikipedia.org/wiki/Bloom_filter) для заданных колонок. Дополнительный параметр `false_positive` с возможными значениями между 0 и 1 определяет вероятность получения ложноположительного ответа от фильтра. Значение по умолчанию: 0.025. Поддерживаемые типы данных: `Int*`, `UInt*`, `Float*`, `Enum`, `Date`, `DateTime`, `String`, `FixedString`, `Array`, `LowCardinality`, `Nullable`, `UUID` и `Map`. Для типа данных `Map` клиент может указать, должен ли индекс быть создан для ключей или значений, используя функцию [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) или [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues).

Синтаксис: `bloom_filter([false_positive])`
#### N-gram Bloom Filter {#n-gram-bloom-filter}

Хранит [фильтр Блума](https://en.wikipedia.org/wiki/Bloom_filter), который содержит все n-граммы из блока данных. Работает только с типами данных: [String](/sql-reference/data-types/string.md), [FixedString](/sql-reference/data-types/fixedstring.md) и [Map](/sql-reference/data-types/map.md). Может быть использован для оптимизации выражений `EQUALS`, `LIKE` и `IN`.

Синтаксис: `ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`

- `n` — размер n-граммы,
- `size_of_bloom_filter_in_bytes` — размер фильтра Блума в байтах (вы можете использовать большие значения, например, 256 или 512, поскольку он хорошо сжимается).
- `number_of_hash_functions` — Количество хеш-функций, используемых в фильтре Блума.
- `random_seed` — Начальное значение для хеш-функций фильтра Блума.

Пользователи могут создать [UDF](/sql-reference/statements/create/function.md) для оценки заданных параметров `ngrambf_v1`. Запросы выглядят следующим образом:

```sql
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
Чтобы использовать эти функции, необходимо указать как минимум два параметра.
Например, если в грануле 4300 n-грамм и мы ожидаем, что ложные срабатывания будут менее 0.0001. Остальные параметры могут быть оценены, выполнив следующие запросы:


```sql
--- оценка количества бит в фильтре
SELECT bfEstimateBmSize(4300, 0.0001) / 8 as size_of_bloom_filter_in_bytes;

┌─size_of_bloom_filter_in_bytes─┐
│                         10304 │
└───────────────────────────────┘

--- оценка количества хеш-функций
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) as number_of_hash_functions

┌─number_of_hash_functions─┐
│                       13 │
└──────────────────────────┘
```
Конечно, вы также можете использовать эти функции для оценки параметров по другим условиям.
Функции ссылаются на содержимое [здесь](https://hur.st/bloomfilter).
#### Token Bloom Filter {#token-bloom-filter}

То же самое, что и `ngrambf_v1`, но хранит токены вместо n-грамм. Токены — это последовательности, разделенные неалфавитными символами.

Синтаксис: `tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`
#### Специальное назначение {#special-purpose}

- Экспериментальный индекс для поддержки поиска по приблизительным ближайшим соседям. См. [здесь](annindexes.md) для подробностей.
- Экспериментальный полнотекстовый индекс для поддержки полнотекстового поиска. См. [здесь](invertedindexes.md) для подробностей.
### Поддержка Функций {#functions-support}

Условия в `WHERE` клаузе содержат вызовы функций, которые работают со столбцами. Если столбец является частью индекса, ClickHouse пытается использовать этот индекс при выполнении функций. ClickHouse поддерживает различные подмножества функций для использования индексов.

Индексы типа `set` могут использоваться всеми функциями. Другие типы индексов поддерживаются следующим образом:

| Функция (оператор) / Индекс                                                                                   | первичный ключ | minmax | ngrambf_v1 | tokenbf_v1 | bloom_filter | full_text |
|--------------------------------------------------------------------------------------------------------------|----------------|--------|------------|------------|--------------|-----------|
| [equals (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                        | ✔              | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notequals)             | ✔              | ✔      | ✔          | ✔          | ✔            | ✔         |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                   | ✔              | ✔      | ✔          | ✔          | ✗            | ✔         |
| [notLike](/sql-reference/functions/string-search-functions.md/#notlike)                             | ✔              | ✔      | ✔          | ✔          | ✗            | ✔         |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                 | ✗              | ✗      | ✔          | ✔          | ✗            | ✔         |
| [startsWith](/sql-reference/functions/string-functions.md/#startswith)                              | ✔              | ✔      | ✔          | ✔          | ✗            | ✔         |
| [endsWith](/sql-reference/functions/string-functions.md/#endswith)                                  | ✗              | ✗      | ✔          | ✔          | ✗            | ✔         |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multisearchany)               | ✗              | ✗      | ✔          | ✗          | ✗            | ✔         |
| [in](/sql-reference/functions/in-functions)                                                         | ✔              | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notIn](/sql-reference/functions/in-functions)                                                      | ✔              | ✔      | ✔          | ✔          | ✔            | ✔         |
| [less (`<`)](/sql-reference/functions/comparison-functions.md/#less)                                  | ✔              | ✔      | ✗          | ✗          | ✗            | ✗         |
| [greater (`>`)](/sql-reference/functions/comparison-functions.md/#greater)                            | ✔              | ✔      | ✗          | ✗          | ✗            | ✗         |
| [lessOrEquals (`<=`)](/sql-reference/functions/comparison-functions.md/#lessoreequals)                | ✔              | ✔      | ✗          | ✗          | ✗            | ✗         |
| [greaterOrEquals (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterorequals)          | ✔              | ✔      | ✗          | ✗          | ✗            | ✗         |
| [empty](/sql-reference/functions/array-functions/#empty)                                           | ✔              | ✔      | ✗          | ✗          | ✗            | ✗         |
| [notEmpty](/sql-reference/functions/array-functions/#notempty)                                     | ✔              | ✔      | ✗          | ✗          | ✗            | ✗         |
| [has](/sql-reference/functions/array-functions#hasarr-elem)                                               | ✗              | ✗      | ✔          | ✔          | ✔            | ✔         |
| [hasAny](/sql-reference/functions/array-functions#hasany)                                         | ✗              | ✗      | ✔          | ✔          | ✔            | ✗         |
| [hasAll](/sql-reference/functions/array-functions#hasall)                                         | ✗              | ✗      | ✔          | ✔          | ✔            | ✗         |
| hasToken                                                                                                   | ✗              | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenOrNull                                                                                             | ✗              | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenCaseInsensitive (*)                                                                                | ✗              | ✗      | ✗          | ✔          | ✗            | ✗         |
| hasTokenCaseInsensitiveOrNull (*)                                                                          | ✗              | ✗      | ✗          | ✔          | ✗            | ✗         |

Функции с постоянным аргументом, который меньше размера ngram, не могут использоваться `ngrambf_v1` для оптимизации запросов.

(*) Для того чтобы `hasTokenCaseInsensitive` и `hasTokenCaseInsensitiveOrNull` были эффективными, необходимо создать индекс `tokenbf_v1` по данным в нижнем регистре, например `INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`.

:::note
Фильтры Блума могут иметь ложные срабатывания, поэтому индексы `ngrambf_v1`, `tokenbf_v1` и `bloom_filter` не могут использоваться для оптимизации запросов, в которых ожидается, что результат функции будет ложным.

Например:

- Можно оптимизировать:
    - `s LIKE '%test%'`
    - `NOT s NOT LIKE '%test%'`
    - `s = 1`
    - `NOT s != 1`
    - `startsWith(s, 'test')`
- Нельзя оптимизировать:
    - `NOT s LIKE '%test%'`
    - `s NOT LIKE '%test%'`
    - `NOT s = 1`
    - `s != 1`
    - `NOT startsWith(s, 'test')`
:::

## Проекции {#projections}
Проекции подобны [материализованным представлениям](/sql-reference/statements/create/view), но определяются на уровне частей. Они обеспечивают гарантии согласованности вместе с автоматическим использованием в запросах.

:::note
При реализации проекций также следует учитывать настройку [force_optimize_projection](/operations/settings/settings#force_optimize_projection).
:::

Проекции не поддерживаются в `SELECT` заявлениях с модификатором [FINAL](/sql-reference/statements/select/from#final-modifier).
### Запрос Проекции {#projection-query}
Запрос проекции — это то, что определяет проекцию. Он неявно выбирает данные из родительской таблицы.
**Синтаксис**

```sql
SELECT <список выражений столбцов> [GROUP BY] <ключи группировки> [ORDER BY] <expr>
```

Проекции могут быть изменены или удалены с помощью оператора [ALTER](/sql-reference/statements/alter/projection.md).
### Хранение Проекции {#projection-storage}
Проекции хранятся внутри директории частей. Это похоже на индекс, но содержит подкаталог, который хранит часть анонимной таблицы `MergeTree`. Таблица создается в результате запроса определения проекции. Если есть клаузула `GROUP BY`, то основной движок хранения становится [AggregatingMergeTree](aggregatingmergetree.md), и все агрегатные функции преобразуются в `AggregateFunction`. Если есть клаузула `ORDER BY`, таблица `MergeTree` использует ее как выражение своего первичного ключа. Во время процесса слияния часть проекции объединяется через рутину слияния своего хранилища. Контрольная сумма части родительской таблицы комбинируется с частью проекции. Другие работы по обслуживанию аналогичны работам индексирования данных.
### Анализ Запросов {#projection-query-analysis}
1. Проверьте, может ли проекция быть использована для ответа на данный запрос, т.е. она генерирует тот же ответ, что и запрос к базовой таблице.
2. Выберите лучшее подходящее соответствие, которое содержит наименьшее количество гранул для чтения.
3. Конвейер запроса, который использует проекции, будет отличаться от того, который использует оригинальные части. Если проекция отсутствует в некоторых частях, мы можем добавить конвейер, чтобы "проектировать" ее на лету.
## Параллельный Доступ к Д данным {#concurrent-data-access}

Для параллельного доступа к таблице мы используем многоверсионность. Другими словами, когда таблица одновременно читается и обновляется, данные читаются из набора частей, которые актуальны на момент выполнения запроса. Нет длительных блокировок. Вставки не мешают операциям чтения.

Чтение из таблицы автоматически параллелизуется.
## TTL для Столбцов и Таблиц {#table_engine-mergetree-ttl}

Определяет срок службы значений.

Клауза `TTL` может быть установлена для всей таблицы и для каждого отдельного столбца. Уровень таблицы `TTL` также может указывать логику автоматического перемещения данных между дисками и томами или повторного сжатия частей, где все данные истекли.

Выражения должны оцениваться в тип [Date](/sql-reference/data-types/date.md) или [DateTime](/sql-reference/data-types/datetime.md).

**Синтаксис**

Установка срока действия для столбца:

```sql
TTL time_column
TTL time_column + интервал
```

Чтобы определить `интервал`, используйте [операторы временных интервалов](/sql-reference/operators#operators-for-working-with-dates-and-times), например:

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```
### TTL Столбца {#mergetree-column-ttl}

Когда значения в столбце истекают, ClickHouse заменяет их значениями по умолчанию для типа данных столбца. Если все значения столбца в части данных истекают, ClickHouse удаляет этот столбец из части данных в файловой системе.

Клауза `TTL` не может использоваться для ключевых столбцов.

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
### TTL Таблицы {#mergetree-table-ttl}

Таблица может иметь выражение для удаления устаревших строк, а также несколько выражений для автоматического перемещения частей между [дисками или томами](#table_engine-mergetree-multiple-volumes). Когда строки в таблице истекают, ClickHouse удаляет все соответствующие строки. Для перемещения или повторного сжатия частей все строки части должны соответствовать критериям выражения `TTL`.

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE условия]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

Тип правила TTL может следовать каждому выражению TTL. Это влияет на действие, которое будет выполнено, как только выражение будет удовлетворено (достигнет текущего времени):

- `DELETE` - удалить истекшие строки (по умолчанию);
- `RECOMPRESS codec_name` - повторно сжать часть данных с `codec_name`;
- `TO DISK 'aaa'` - переместить часть на диск `aaa`;
- `TO VOLUME 'bbb'` - переместить часть на диск `bbb`;
- `GROUP BY` - агрегировать истекшие строки.

Действие `DELETE` может использоваться вместе с клаузой `WHERE`, чтобы удалить только некоторые из истекших строк на основе условия фильтрации:
```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

Выражение `GROUP BY` должно быть префиксом первичного ключа таблицы.

Если столбец не является частью выражения `GROUP BY` и не установлен явно в клаузе `SET`, в результирующей строке он содержит случайное значение из сгруппированных строк (как если бы к нему применена агрегатная функция `any`).

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

Создание таблицы, где строки истекают через месяц. Устаревшие строки, где даты - понедельники, удаляются:

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
#### Создание таблицы, где устаревшие строки повторно сжимаются: {#creating-a-table-where-expired-rows-are-recompressed}

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

Создание таблицы, где устаревшие строки агрегируются. В результирующих строках `x` содержится максимальное значение среди сгруппированных строк, `y` — минимальное значение, а `d` — любое случайное значение из сгруппированных строк.

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
### Удаление Устаревших Данных {#mergetree-removing-expired-data}

Данные с истекшим `TTL` удаляются, когда ClickHouse сливает части данных.

Когда ClickHouse обнаруживает, что данные устарели, он выполняет слияние вне графика. Чтобы контролировать частоту таких слияний, вы можете установить `merge_with_ttl_timeout`. Если значение слишком низкое, будут выполняться множество внеграфиковых слияний, которые могут потреблять много ресурсов.

Если вы выполните запрос `SELECT` между слияниями, вы можете получить устаревшие данные. Чтобы избежать этого, используйте запрос [OPTIMIZE](/sql-reference/statements/optimize.md) перед `SELECT`.

**См. также**

- [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts) настройка
## Типы Дисков {#disk-types}

В дополнение к локальным блочным устройствам, ClickHouse поддерживает следующие типы хранилищ:
- [`s3` для S3 и MinIO](#table_engine-mergetree-s3)
- [`gcs` для GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` для Azure Blob Storage](/operations/storing-data#azure-blob-storage)
- [`hdfs` для HDFS](/engines/table-engines/integrations/hdfs)
- [`web` для только чтения из веба](/operations/storing-data#web-storage)
- [`cache` для локального кэширования](/operations/storing-data#using-local-cache)
- [`s3_plain` для резервных копий в S3](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` для неизменяемых, нереплицированных таблиц в S3](/operations/storing-data.md#s3-plain-rewritable-storage)
## Использование Многих Блочных Устройств для Хранения Данных {#table_engine-mergetree-multiple-volumes}
### Введение {#introduction}

Движки таблиц семейства `MergeTree` могут хранить данные на нескольких блочных устройствах. Это может быть полезно, когда данные определенной таблицы неявно разделены на "горячие" и "холодные". Самые свежие данные запрашиваются регулярно, но требуют лишь небольшого объема места. Напротив, исторические данные с большими хвостами запрашиваются редко. Если доступно несколько дисков, "горячие" данные могут находиться на быстрых дисках (например, NVMe SSD или в памяти), в то время как "холодные" данные - на относительно медленных (например, HDD).

Часть данных является минимальной перемещаемой единицей для таблиц с движком `MergeTree`. Данные, относящиеся к одной части, хранятся на одном диске. Части данных могут перемещаться между дисками в фоновом режиме (в соответствии с настройками пользователя), а также с помощью запросов [ALTER](/sql-reference/statements/alter/partition).
### Термины {#terms}

- Диск — блочное устройство, смонтированное в файловую систему.
- Диск по умолчанию — диск, который хранит путь, указанный в настройке сервера [path](/operations/server-configuration-parameters/settings.md/#path).
- Том — упорядоченный набор равных дисков (аналогично [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)).
- Политика хранения — набор томов и правила перемещения данных между ними.

Названия, присвоенные описанным сущностям, можно найти в системных таблицах, [system.storage_policies](/operations/system-tables/storage_policies) и [system.disks](/operations/system-tables/disks). Чтобы применить одну из сконфигурированных политик хранения для таблицы, используйте настройку `storage_policy` таблиц семейства `MergeTree`.
### Конфигурация {#table_engine-mergetree-multiple-volumes_configure}

Диски, тома и политики хранения должны быть объявлены внутри тега `<storage_configuration>` либо в файле в директории `config.d`.

:::tip
Диски также могут быть объявлены в секции `SETTINGS` запроса. Это полезно
для экспресс-анализа, чтобы временно подключить диск, который, например, размещен по URL.
Смотрите [динамическое хранилище](/operations/storing-data#dynamic-configuration) для более подробной информации.
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

- `<disk_name_N>` — Имя диска. Имена должны быть разными для всех дисков.
- `path` — путь, под которым сервер будет хранить данные (папки `data` и `shadow`), должен заканчиваться `/`.
- `keep_free_space_bytes` — количество свободного места на диске, которое необходимо зарезервировать.

Порядок определения дисков не важен.

Разметка конфигурации политики хранения:

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

- `policy_name_N` — Имя политики. Имена политик должны быть уникальными.
- `volume_name_N` — Имя тома. Имена томов должны быть уникальными.
- `disk` — диск в пределах тома.
- `max_data_part_size_bytes` — максимальный размер части, который может храниться на любом из дисков тома. Если размер объединенной части оценивается как больше `max_data_part_size_bytes`, то эта часть будет записана в следующий том. Эта функция позволяет держать новые/маленькие части на горячем (SSD) томе и перемещать их на холодный (HDD) том, когда они достигают большого размера. Не используйте эту настройку, если ваша политика имеет только один том.
- `move_factor` — когда количество доступного места становится ниже этого коэффициента, данные автоматически начинают перемещаться на следующий том, если таковой имеется (по умолчанию — 0,1). ClickHouse сортирует существующие части по размеру от большего к меньшему (по убыванию) и выбирает части с общим размером, достаточным для удовлетворения условия `move_factor`. Если общий размер всех частей недостаточен, все части будут перемещены.
- `perform_ttl_move_on_insert` — отключает перемещение по TTL при вставке части данных. По умолчанию (если включено) если мы вставляем часть данных, которая уже истекла по правилу перемещения TTL, она немедленно перемещается на диск/том, указанный в правиле перемещения. Это может значительно замедлить вставку, если целевой том/диск медленный (например, S3). Если отключено, уже истекшая часть данных записывается на диск по умолчанию, а затем сразу же перемещается на том по TTL.
- `load_balancing` - Политика балансировки дисков, `round_robin` или `least_used`.
- `least_used_ttl_ms` - Настройка таймоута (в миллисекундах) для обновления доступного пространства на всех дисках (`0` - обновлять всегда, `-1` - никогда не обновлять, по умолчанию `60000`). Учтите, если диск может использоваться только ClickHouse и не подлежит уменьшению размера онлайн файловой системы, вы можете использовать `-1`, в противном случае это не рекомендуется, поскольку в конечном итоге это приведет к неправильному распределению пространства.
- `prefer_not_to_merge` — Вы не должны использовать эту настройку. Отключает объединение частей данных на этом томе (это вредно и приводит к снижению производительности). Когда эта настройка включена (не делайте этого), объединение данных на этом томе не допускается (что плохо). Это позволяет (но вам это не нужно) контролировать (если хотите что-то контролировать, вы делаете ошибку) как ClickHouse работает с медленными дисками (но ClickHouse знает лучше, поэтому пожалуйста, не используйте эту настройку).
- `volume_priority` — Определяет приоритет (порядок), в котором заполняются тома. Меньшее значение означает более высокий приоритет. Значения параметров должны быть натуральными числами и в совокупности охватывать диапазон от 1 до N (наименьший приоритет присваивается) без пропуска любых чисел.
  * Если _все_ тома помечены, они приоритизируются в данном порядке.
  * Если только _некоторые_ тома помечены, те, для которых нет тега, имеют наименьший приоритет, и они приоритизируются в порядке, в котором они определены в конфигурации.
  * Если _нет_ томов помечено, их приоритет устанавливается в соответствии с порядком, в котором они объявлены в конфигурации.
  * Два тома не могут иметь одно и то же значение приоритета.

Примеры конфигурации:

```xml
<storage_configuration>
    ...
    <policies>
        <hdd_in_order> <!-- имя политики -->
            <volumes>
                <single> <!-- имя тома -->
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

В данном примере политика `hdd_in_order` реализует подход [round-robin](https://en.wikipedia.org/wiki/Round-robin_scheduling). Таким образом, эта политика определяет только один том (`single`), части данных хранятся на всех его дисках в круговом порядке. Такая политика может быть весьма полезной, если в систему смонтировано несколько аналогичных дисков, но RAID не настроен. Имейте в виду, что каждый отдельный диск ненадежен, и вам может потребоваться компенсировать это коэффициентом репликации 3 или более.

Если в системе доступны разные виды дисков, можно использовать политику `moving_from_ssd_to_hdd`. Том `hot` состоит из SSD диска (`fast_ssd`), а максимальный размер части, который может храниться на этом томе, составляет 1ГБ. Все части размером более 1ГБ будут храниться непосредственно на `cold` томе, который содержит HDD диск `disk1`.
Кроме того, как только диск `fast_ssd` будет заполнен более чем на 80%, данные будут переданы на `disk1` фоновым процессом.

Порядок перечисления томов внутри политики хранения важен, если по крайней мере один из перечисленных томов не имеет явного параметра `volume_priority`.
Как только один том переполнен, данные перемещаются на следующий. Порядок перечисления дисков также важен, так как данные на них хранятся по очереди.

При создании таблицы можно применить одну из сконфигурированных политик хранения к ней:

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

Политика хранения по умолчанию предполагает использование только одного тома, который состоит из единственного диска, указанного в `<path>`.
Вы можете изменить политику хранения после создания таблицы с помощью запроса [ALTER TABLE ... MODIFY SETTING], новая политика должна включать все старые диски и тома с теми же именами.

Количество потоков, выполняющих фоновое перемещение частей данных, может быть изменено с помощью настройки [background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size).
### Подробности {#details}

В случае таблиц `MergeTree` данные поступают на диск различными способами:

- В результате вставки (`INSERT` запрос).
- Во время фоновых слияний и [мутаций](/sql-reference/statements/alter#mutations).
- При загрузке из другой реплики.
- В результате замораживания партиции [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition).

Во всех этих случаях, кроме мутаций и замораживания партиций, часть хранится на томе и диске в соответствии с заданной политикой хранения:

1. Выбирается первый том (в порядке определения), который имеет достаточно дискового пространства для хранения части (`unreserved_space > current_part_size`) и позволяет хранить части данного размера (`max_data_part_size_bytes > current_part_size`).
2. В этом томе выбирается диск, который идет после того, который использовался для хранения предыдущего куска данных, и который имеет свободное пространство больше, чем размер части (`unreserved_space - keep_free_space_bytes > current_part_size`).

Внутренне мутации и замораживание партиций используют [жесткие ссылки](https://en.wikipedia.org/wiki/Hard_link). Жесткие ссылки между разными дисками не поддерживаются, поэтому в таких случаях результирующие части хранятся на тех же дисках, что и исходные.

В фоновом режиме части перемещаются между томами на основе количества свободного места (`параметр move_factor`) в соответствии с порядком, в котором тома объявлены в файле конфигурации.
Данные никогда не передаются с последнего тома на первый. Пользователь может использовать системные таблицы [system.part_log](/operations/system-tables/part_log) (поле `type = MOVE_PART`) и [system.parts](/operations/system-tables/parts.md) (поля `path` и `disk`) для мониторинга фоновых перемещений. Также подробная информация может быть найдена в журналах сервера.

Пользователь может принудительно переместить часть или партицию с одного тома на другой, используя запрос [ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition), все ограничения для фоновых операций принимаются во внимание. Запрос инициирует перемещение самостоятельно и не ждет завершения фоновых операций. Пользователь получит сообщение об ошибке, если не хватает свободного места или если не выполнены какие-либо условия.

Перемещение данных не мешает репликации данных. Поэтому для одной и той же таблицы на разных репликах могут быть указаны разные политики хранения.

После завершения фоновых слияний и мутаций старые части удаляются только через определенный период времени (`old_parts_lifetime`).
На протяжении этого времени они не перемещаются на другие тома или диски. Следовательно, до окончательного удаления части все еще учитываются для оценки занятого дискового пространства.

Пользователь может равномерно распределять новые большие части на разные диски объема [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) с помощью настройки [min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min_bytes_to_rebalance_partition_over_jbod).
## Использование внешнего хранилища для хранения данных {#table_engine-mergetree-s3}

Семейство [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) таблиц может хранить данные в `S3`, `AzureBlobStorage`, `HDFS`, используя диск с типами `s3`, `azure_blob_storage`, `hdfs` соответственно. Смотрите [настройку параметров внешнего хранилища](/operations/storing-data.md/#configuring-external-storage) для получения дополнительных сведений.

Пример для [S3](https://aws.amazon.com/s3/) в качестве внешнего хранилища с использованием диска типа `s3`.

Конфигурационный разметка:
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

Также смотрите [настройку параметров внешнего хранилища](/operations/storing-data.md/#configuring-external-storage).

:::note конфигурация кэша
Версии ClickHouse с 22.3 по 22.7 используют другую конфигурацию кэша. Смотрите [использование локального кэша](/operations/storing-data.md/#using-local-cache), если вы используете одну из этих версий.
:::
## Виртуальные колонки {#virtual-columns}

- `_part` — Имя части.
- `_part_index` — Последовательный индекс части в результате запроса.
- `_partition_id` — Имя партиции.
- `_part_uuid` — Уникальный идентификатор части (если включена настройка MergeTree `assign_part_uuids`).
- `_partition_value` — Значения (кортеж) выражения `partition by`.
- `_sample_factor` — Фактор выборки (из запроса).
- `_block_number` — Номер блока строки, он сохраняется на слияниях, когда параметр `allow_experimental_block_number_column` установлен в true.
## Статистика по колонкам {#column-statistics}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Декларация статистики находится в разделе колонок запроса `CREATE` для таблиц из семейства `*MergeTree*`, когда мы включаем `set allow_experimental_statistics = 1`.

```sql
CREATE TABLE tab
(
    a Int64 STATISTICS(TDigest, Uniq),
    b Float64
)
ENGINE = MergeTree
ORDER BY a
```

Мы также можем управлять статистикой с помощью операторов `ALTER`.

```sql
ALTER TABLE tab ADD STATISTICS b TYPE TDigest, Uniq;
ALTER TABLE tab DROP STATISTICS a;
```

Эти легковесные статистики агрегации содержат информацию о распределении значений в колонках. Статистика хранится в каждой части и обновляется при каждой вставке.
Она может использоваться для оптимизации prewhere только если мы включаем `set allow_statistics_optimize = 1`.
### Доступные типы статистики колонок {#available-types-of-column-statistics}

- `MinMax`

    Минимальное и максимальное значение колонки, что позволяет оценить селективность диапазонных фильтров по числовым колонкам.

    Синтаксис: `minmax`

- `TDigest`

    [TDigest](https://github.com/tdunning/t-digest) эскизы, которые позволяют вычислять приближенные перцентили (например, 90-й перцентиль) для числовых колонок.

    Синтаксис: `tdigest`

- `Uniq`

    [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) эскизы, которые предоставляют оценку того, сколько различных значений содержит колонка.

    Синтаксис: `uniq`

- `CountMin`

    [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch) эскизы, которые предоставляют приблизительное количество частот каждого значения в колонке.

    Синтаксис: `countmin`
### Поддерживаемые типы данных {#supported-data-types}

|           | (U)Int*, Float*, Decimal(*), Date*, Boolean, Enum* | String or FixedString |
|-----------|----------------------------------------------------|-----------------------|
| CountMin  | ✔                                                  | ✔                     |
| MinMax    | ✔                                                  | ✗                     |
| TDigest   | ✔                                                  | ✗                     |
| Uniq      | ✔                                                  | ✔                     |
### Поддерживаемые операции {#supported-operations}

|           | Фильтры равенства (==) | Диапазонные фильтры (`>, >=, <, <=`) |
|-----------|-----------------------|------------------------------|
| CountMin  | ✔                     | ✗                            |
| MinMax    | ✗                     | ✔                            |
| TDigest   | ✗                     | ✔                            |
| Uniq      | ✔                     | ✗                            |
## Настройки на уровне колонок {#column-level-settings}

Некоторые настройки MergeTree могут быть переопределены на уровне колонок:

- `max_compress_block_size` — Максимальный размер блоков некомпрессированных данных перед сжатием для записи в таблицу.
- `min_compress_block_size` — Минимальный размер блоков некомпрессированных данных, необходимый для сжатия при записи следующей метки.

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

Настройки на уровне колонок могут быть изменены или удалены с помощью [ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md), например:

- Удалить `SETTINGS` из декларации колонки:

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- Изменить настройку:

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- Сбросить одну или несколько настроек, также удаляет декларацию настройки в выражении колонки запроса CREATE таблицы.

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
