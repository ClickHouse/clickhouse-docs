---
slug: /engines/table-engines/mergetree-family/mergetree
sidebar_position: 11
sidebar_label: 'MergeTree'
title: 'MergeTree'
description: '`MergeTree`-семейство таблиц предназначено для высокой скорости ввода данных и больших объемов данных.'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# MergeTree

Двигатель `MergeTree` и другие двигатели семейства `MergeTree` (например, `ReplacingMergeTree`, `AggregatingMergeTree`) являются наиболее часто используемыми и надежными движками таблиц в ClickHouse.

`MergeTree`-семейство таблиц предназначено для высокой скорости ввода данных и больших объемов данных. Операции вставки создают части таблицы, которые объединяются фоновым процессом с другими частями таблицы.

Основные характеристики `MergeTree`-семейства таблиц.

- Первичный ключ таблицы определяет порядок сортировки внутри каждой части таблицы (кластерный индекс). Первичный ключ также не ссылается на отдельные строки, а на блоки из 8192 строк, называемые гранулами. Это делает первичные ключи больших наборов данных достаточно маленькими, чтобы оставаться загруженными в основной памяти, при этом обеспечивая быстрый доступ к данным на диске.

- Таблицы могут быть разделены на партиции с использованием произвольного выражения для партиционирования. Отсечение партиций гарантирует, что партиции будут исключены из чтения, когда запрос это позволяет.

- Данные могут быть реплицированы на нескольких узлах кластера для высокой доступности, резервирования и обновления без простоя. См. [Репликация данных](/engines/table-engines/mergetree-family/replication.md).

- Двигатели таблиц `MergeTree` поддерживают различные виды статистики и методов выборки, чтобы помочь в оптимизации запросов.

:::note
Несмотря на схожее название, двигатель [Merge](/engines/table-engines/special/merge) отличается от `*MergeTree` двигателей.
:::
## Создание таблиц {#table_engine-mergetree-creating-a-table}

``` sql
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

Для подробного описания параметров см. [CREATE TABLE](/sql-reference/statements/create/table.md) оператор
### Условия запроса {#mergetree-query-clauses}
#### ENGINE {#engine}

`ENGINE` — Название и параметры движка. `ENGINE = MergeTree()`. У движка `MergeTree` нет параметров.
#### ORDER_BY {#order_by}

`ORDER BY` — Ключ сортировки.

Кортеж имен колонок или произвольные выражения. Пример: `ORDER BY (CounterID + 1, EventDate)`.

Если первичный ключ не определен (т. е. `PRIMARY KEY` не указан), ClickHouse использует ключ сортировки как первичный ключ.

Если сортировка не требуется, можно использовать синтаксис `ORDER BY tuple()`.
Кроме того, если включено свойство `create_table_empty_primary_key_by_default`, `ORDER BY tuple()` неявно добавляется к операторам `CREATE TABLE`. См. [Выбор первичного ключа](#selecting-a-primary-key).
#### PARTITION BY {#partition-by}

`PARTITION BY` — Ключ [партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key.md). Необязательно. В большинстве случаев вам не нужен ключ партиционирования, и если вам нужно разделить на партиции, в общем не нужно более детализированного ключа, чем по месяцам. Партиционирование не ускоряет запросы (в отличие от выражения ORDER BY). Вы никогда не должны использовать слишком детализированное партиционирование. Не разделяйте свои данные по идентификаторам клиентов или именам (вместо этого сделайте идентификатор клиента или имя первой колонкой в выражении ORDER BY).

Для партиционирования по месяцам используйте выражение `toYYYYMM(date_column)`, где `date_column` — это колонка с датой типа [Date](/sql-reference/data-types/date.md). Имена партиций имеют формат `"YYYYMM"`.
#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — Первичный ключ, если он [отличается от ключа сортировки](#choosing-a-primary-key-that-differs-from-the-sorting-key). Необязательно.

Указание ключа сортировки (с использованием условия `ORDER BY`) неявно указывает первичный ключ.
В большинстве случаев нет необходимости указывать первичный ключ дополнительно к ключу сортировки.
#### SAMPLE BY {#sample-by}

`SAMPLE BY` — Выражение для выборки. Необязательно.

Если указано, оно должно содержаться в первичном ключе.
Выражение для выборки должно приводить к беззнаковому целому числу.

Пример: `SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`.
#### TTL {#ttl}

`TTL` — Список правил, которые определяют срок хранения строк и логику автоматического перемещения частей [между дисками и томами](#table_engine-mergetree-multiple-volumes). Необязательно.

Выражение должно приводить к `Date` или `DateTime`, например `TTL date + INTERVAL 1 DAY`.

Тип правила `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY` указывает действие, которое нужно выполнить с частью, если выражение выполнено (достигнуто текущее время): удаление истекших строк, перемещение части (если выражение выполнено для всех строк в части) на указанный диск (`TO DISK 'xxx'`) или на том (`TO VOLUME 'xxx'`), либо агрегация значений в истекших строках. Значение по умолчанию для типа правила — удаление (`DELETE`). Можно указать несколько правил, но не должно быть более одного правила `DELETE`.

Для получения дополнительной информации см. [TTL для колонок и таблиц](#table_engine-mergetree-ttl)
#### SETTINGS {#settings}

См. [Параметры MergeTree](../../../operations/settings/merge-tree-settings.md).

**Пример установки секций**

``` sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

В примере мы устанавливаем партиционирование по месяцам.

Мы также устанавливаем выражение для выборки по хешу идентификатора пользователя. Это позволяет псевдослучайным образом отсортировать данные в таблице для каждого `CounterID` и `EventDate`. Если вы определите условие [SAMPLE](/sql-reference/statements/select/sample) при выборе данных, ClickHouse вернет равномерно псевдослучайную выборку данных для подмножества пользователей.

Свойство `index_granularity` можно опустить, так как 8192 является значением по умолчанию.

<details markdown="1">

<summary>Устаревший метод создания таблицы</summary>

:::note
Не используйте этот метод в новых проектах. Если возможно, переключите старые проекты на метод, описанный выше.
:::

``` sql
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
- `(primary, key)` — Первичный ключ. Тип: [Tuple()](/sql-reference/data-types/tuple.md)
- `index_granularity` — Чувствительность индекса. Количество строк данных между "метками" индекса. Значение 8192 подходит для большинства задач.

**Пример**

``` sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

Двигатель `MergeTree` настроен таким же образом, как в примере выше для основного метода конфигурации движка.
</details>
## Хранение данных {#mergetree-data-storage}

Таблица состоит из частей данных, отсортированных по первичному ключу.

Когда данные вставляются в таблицу, создаются отдельные части данных, и каждая из них сортируется лексикографически по первичному ключу. Например, если первичный ключ — это `(CounterID, Date)`, данные в части сортируются по `CounterID`, а внутри каждого `CounterID` они упорядочены по `Date`.

Данные, принадлежащие различным партициям, отделяются на разные части. В фоновом режиме ClickHouse объединяет части данных для более эффективного хранения. Части, принадлежащие различным партициям, не объединяются. Механизм объединения не гарантирует, что все строки с одним и тем же первичным ключом будут находиться в одной части данных.

Части данных могут храниться в формате `Wide` или `Compact`. В формате `Wide` каждая колонка хранится в отдельном файле в файловой системе, в формате `Compact` все колонки хранятся в одном файле. Формат `Compact` может использоваться для увеличения производительности небольших и частых вставок.

Формат хранения данных контролируется настройками `min_bytes_for_wide_part` и `min_rows_for_wide_part` движка таблицы. Если количество байт или строк в части данных меньше, чем соответствующее значение настройки, часть хранится в формате `Compact`. В противном случае она хранится в формате `Wide`. Если ни одна из этих настроек не задана, части данных хранятся в формате `Wide`.

Каждая часть данных логически делится на гранулы. Гранула — это наименьший неделимый набор данных, который ClickHouse считывает при выборе данных. ClickHouse не делит строки или значения, поэтому каждая гранула всегда содержит целое число строк. Первая строка гранулы помечается значением первичного ключа для строки. Для каждой части данных ClickHouse создает файл индекса, который хранит метки. Для каждой колонки, независимо от того, находится ли она в первичном ключе или нет, ClickHouse также хранит те же метки. Эти метки позволяют находить данные непосредственно в файловых колонок.

Размер гранулы ограничен настройками `index_granularity` и `index_granularity_bytes` движка таблицы. Количество строк в грануле лежит в диапазоне `[1, index_granularity]`, в зависимости от размера строк. Размер гранулы может превышать `index_granularity_bytes`, если размер одной строки больше значения настройки. В этом случае размер гранулы равен размеру строки.
## Первичные ключи и индексы в запросах {#primary-keys-and-indexes-in-queries}

Рассмотрим в качестве примера первичный ключ `(CounterID, Date)`. В этом случае сортировка и индекс могут быть представлены следующим образом:

```text
Все данные:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
Метки:           |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Номера меток:   0      1      2      3      4      5      6      7      8      9      10
```

Если запрос данных указывает:

- `CounterID IN ('a', 'h')`, сервер читает данные в диапазонах меток `[0, 3)` и `[6, 8)`.
- `CounterID IN ('a', 'h') AND Date = 3`, сервер читает данные в диапазонах меток `[1, 3)` и `[7, 8)`.
- `Date = 3`, сервер читает данные в диапазоне меток `[1, 10]`.

Примеры выше показывают, что всегда эффективнее использовать индекс, чем полное сканирование.

Разреженный индекс позволяет читать дополнительные данные. При чтении одного диапазона первичного ключа можно считывать до `index_granularity * 2` дополнительных строк в каждом блоке данных.

Разреженные индексы позволяют работать с очень большим количеством строк таблицы, потому что в большинстве случаев такие индексы помещаются в ОЗУ компьютера.

ClickHouse не требует уникального первичного ключа. Вы можете вставлять несколько строк с одинаковым первичным ключом.

Вы можете использовать выражения с типом `Nullable` в условиях `PRIMARY KEY` и `ORDER BY`, но это настоятельно не рекомендуется. Чтобы включить эту функцию, включите настройку [allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key). Принцип [NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values) применяется к значениям `NULL` в условии `ORDER BY`.
### Выбор первичного ключа {#selecting-a-primary-key}

Количество колонок в первичном ключе не ограничено. В зависимости от структуры данных вы можете включать больше или меньше колонок в первичный ключ. Это может:

- Улучшить эффективность индекса.

    Если первичный ключ `(a, b)`, то добавление еще одной колонки `c` улучшит эффективность, если выполняются следующие условия:

    - Существуют запросы с условием на колонку `c`.
    - Длинные диапазоны данных (несколько раз длиннее `index_granularity`) с одинаковыми значениями для `(a, b)` распространены. Другими словами, когда добавление другой колонки позволяет пропустить достаточно длинные диапазоны данных.

- Улучшить сжатие данных.

    ClickHouse сортирует данные по первичному ключу, и чем выше согласованность, тем лучше сжатие.

- Обеспечить дополнительную логику при объединении частей данных в [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) и [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) движках.

    В этом случае имеет смысл указать *ключ сортировки*, который отличается от первичного ключа.

Длинный первичный ключ негативно скажется на производительности вставок и расходе памяти, но дополнительные колонки в первичном ключе не влияют на производительность ClickHouse при выполнении запросов `SELECT`.

Вы можете создать таблицу без первичного ключа, используя синтаксис `ORDER BY tuple()`. В этом случае ClickHouse хранит данные в порядке вставки. Если вы хотите сохранить порядок данных при их вставке с помощью запросов `INSERT ... SELECT`, установите [max_insert_threads = 1](/operations/settings/settings#max_insert_threads).

Чтобы выбрать данные в исходном порядке, используйте [однонитевые](/operations/settings/settings.md/#max_threads) запросы `SELECT`.
### Выбор первичного ключа, который отличается от ключа сортировки {#choosing-a-primary-key-that-differs-from-the-sorting-key}

Можно указать первичный ключ (выражение с значениями, которые записываются в файл индекса для каждой метки), который отличается от ключа сортировки (выражение для сортировки строк в частях данных). В этом случае кортеж выражения первичного ключа должен быть префиксом кортежа выражения сортировки.

Эта функция полезна при использовании движков [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) и
[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md). В типичном случае при использовании этих движков таблица имеет два типа колонок: *измерения* и *меры*. Типичные запросы агрегируют значения колонок с мерами с произвольным `GROUP BY` и фильтрацией по измерениям. Поскольку SummingMergeTree и AggregatingMergeTree агрегируют строки с одинаковыми значениями ключа сортировки, это естественно добавить все измерения в него. В результате выражение ключа состоит из длинного списка колонок, и этот список должен часто обновляться новыми добавленными измерениями.

В этом случае имеет смысл оставить только несколько колонок в первичном ключе, которые обеспечат эффективные диапазонные сканирования, и добавить оставшиеся колонки измерений в кортеж ключа сортировки.

[ALTER](/sql-reference/statements/alter/index.md) ключа сортировки является легкой операцией, потому что при одновременном добавлении новой колонки в таблицу и в ключ сортировки существующие части данных не нужно менять. Поскольку старый ключ сортировки является префиксом нового ключа сортировки и в вновь добавленной колонке нет данных, данные сортируются как по старым, так и по новым ключам сортировки в момент изменения таблицы.
### Использование индексов и партиций в запросах {#use-of-indexes-and-partitions-in-queries}

Для запросов `SELECT` ClickHouse анализирует, возможно ли использование индекса. Индекс может быть использован, если условие `WHERE/PREWHERE` содержит выражение (в качестве одного из элементов соединения или полностью), которое представляет собой операцию сравнений равенства или неравенства, или если оно содержит `IN` или `LIKE` с фиксированным префиксом по колонкам или выражениям, находящимся в первичном ключе или ключе партиционирования, или по определенным частично повторяющимся функциям этих колонок, или логическим связям этих выражений.

Таким образом, возможно быстро выполнять запросы по одному или нескольким диапазонам первичного ключа. В этом примере запросы будут быстрыми при выполнении для конкретного отслеживаемого тега, для конкретного тега и диапазона дат, для конкретного тега и даты, для нескольких тегов с диапазоном дат и так далее.

Рассмотрим движок, настроенный следующим образом:
```sql
ENGINE MergeTree()
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate)
SETTINGS index_granularity=8192
```

В этом случае в запросах:

``` sql
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

ClickHouse будет использовать индекс первичного ключа для обрезки ненадлежащих данных, а ключ партиционирования по месяцам для обрезки партиций, которые находятся в ненадлежащих диапазонах дат.

Вышеуказанные запросы показывают, что индекс используется даже для сложных выражений. Чтение из таблицы организовано таким образом, что использование индекса не может быть медленнее полного сканирования.

В следующем примере индекс не может быть использован.

``` sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

Чтобы проверить, может ли ClickHouse использовать индекс при выполнении запроса, используйте настройки [force_index_by_date](/operations/settings/settings.md/#force_index_by_date) и [force_primary_key](/operations/settings/settings#force_primary_key).

Ключ для партиционирования по месяцам позволяет читать только те блоки данных, которые содержат даты из соответствующего диапазона. В этом случае блок данных может содержать данные для многих дат (вплоть до целого месяца). Внутри блока данные сортируются по первичному ключу, который может не содержать дату как первую колонку. Из-за этого использование запроса только с условием даты, не указывающим префикс первичного ключа, приведет к тому, что будет прочитано больше данных, чем для одной даты.
### Использование индекса для частично-моногенных первичных ключей {#use-of-index-for-partially-monotonic-primary-keys}

Рассмотрим, например, дни месяца. Они образуют [монотонную последовательность](https://en.wikipedia.org/wiki/Monotonic_function) для одного месяца, но не монотонны для более длительных периодов. Это частично монотонная последовательность. Если пользователь создает таблицу с частично-монотонным первичным ключом, ClickHouse создает разреженный индекс, как обычно. Когда пользователь выбирает данные из такой таблицы, ClickHouse анализирует условия запроса. Если пользователь хочет получить данные между двумя метками индекса, и обе метки попадают в один месяц, ClickHouse может использовать индекс в этом конкретном случае, потому что он может рассчитать расстояние между параметрами запроса и метками индекса.

ClickHouse не может использовать индекс, если значения первичного ключа в диапазоне параметров запроса не представляют монотонную последовательность. В этом случае ClickHouse использует метод полного сканирования.

ClickHouse использует эту логику не только для последовательностей дней месяца, но и для любого первичного ключа, который представляет частично-монотонную последовательность.
### Индексы, пропускающие данные {#table_engine-mergetree-data_skipping-indexes}

Объявление индекса находится в секции колонок запроса `CREATE`.

``` sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

Для таблиц из `*MergeTree` семейства можно указывать индексы, пропускающие данные.

Эти индексы агрегируют некоторую информацию о заданном выражении по блокам, которые состоят из гранул (размер гранулы задается с помощью настройки `index_granularity` в движке таблицы). Затем эти агрегаты используются в запросах `SELECT` для уменьшения объема данных, читаемых с диска, путем пропуска больших блоков данных, где запрос `WHERE` не может быть удовлетворен.

Клаусула `GRANULARITY` может быть опущена, значение по умолчанию для `granularity_value` равно 1.

**Пример**

``` sql
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

Индексы из примера могут быть использованы ClickHouse для уменьшения объема данных, считываемых с диска, в следующих запросах:

``` sql
SELECT count() FROM table WHERE u64 == 10;
SELECT count() FROM table WHERE u64 * i32 >= 1234
SELECT count() FROM table WHERE u64 * length(s) == 1234
```

Индексы, пропускающие данные, также могут быть созданы на составных колонках:

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

Хранит крайние значения заданного выражения (если выражение является `tuple`, то оно хранит крайние значения для каждого элемента `tuple`), использует храненную информацию для пропуска блоков данных, как первичный ключ.

Синтаксис: `minmax`
#### Set {#set}

Хранит уникальные значения заданного выражения (не более чем `max_rows` строк, `max_rows=0` означает "без ограничений"). Использует значения для проверки того, что выражение `WHERE` не может быть удовлетворено в блоке данных.

Синтаксис: `set(max_rows)`
#### Bloom Filter {#bloom-filter}

Хранит [Bloom фильтр](https://en.wikipedia.org/wiki/Bloom_filter) для заданных колонок. Дополнительный параметр `false_positive` с возможными значениями от 0 до 1 указывает вероятность получения ложного положительного ответа от фильтра. Значение по умолчанию: 0.025. Поддерживаемые типы данных: `Int*`, `UInt*`, `Float*`, `Enum`, `Date`, `DateTime`, `String`, `FixedString`, `Array`, `LowCardinality`, `Nullable`, `UUID` и `Map`. Для типа данных `Map` клиент может указать, следует ли создавать индекс для ключей или значений с использованием функции [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) или [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues).

Синтаксис: `bloom_filter([false_positive])`
#### N-gram Bloom Filter {#n-gram-bloom-filter}

Хранит [Bloom фильтр](https://en.wikipedia.org/wiki/Bloom_filter), который содержит все n-граммы из блока данных. Работает только с типами данных: [String](/sql-reference/data-types/string.md), [FixedString](/sql-reference/data-types/fixedstring.md) и [Map](/sql-reference/data-types/map.md). Может использоваться для оптимизации выражений `EQUALS`, `LIKE` и `IN`.

Синтаксис: `ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`

- `n` — размер n-граммы,
- `size_of_bloom_filter_in_bytes` — размер Bloom фильтра в байтах (здесь вы можете использовать большие значения, например, 256 или 512, так как они хорошо сжимаются).
- `number_of_hash_functions` — Количество хеш-функций, использованных в Bloom фильтре.
- `random_seed` — Начальное значение для хеш-функций Bloom фильтра.

Пользователи могут создавать [UDF](/sql-reference/statements/create/function.md) для оценки установок параметров `ngrambf_v1`. Запросы следующие:

```sql
CREATE FUNCTION bfEstimateFunctions [ON CLUSTER cluster]
AS
(total_number_of_all_grams, size_of_bloom_filter_in_bits) -> round((size_of_bloom_filter_in_bits / total_number_of_all_grams) * log(2));

CREATE FUNCTION bfEstimateBmSize [ON CLUSTER cluster]
AS
(total_number_of_all_grams, probability_of_false_positives) -> ceil((total_number_of_all_grams * log(probability_of_false_positives)) / log(1 / pow(2, log(2))));

CREATE FUNCTION bfEstimateFalsePositive [ON CLUSTER cluster]
AS
(total_number_of_all_grams, number_of_hash_functions, size_of_bloom_filter_in_bytes) -> pow(1 - exp(-number_of_hash_functions/ (size_of_bloom_filter_in_bytes / total_number_of_all_grams)), number_of_hash_functions);

CREATE FUNCTION bfEstimateGramNumber [ON CLUSTER cluster]
AS
(number_of_hash_functions, probability_of_false_positives, size_of_bloom_filter_in_bytes) -> ceil(size_of_bloom_filter_in_bytes / (-number_of_hash_functions / log(1 - exp(log(probability_of_false_positives) / number_of_hash_functions))))
```
Чтобы использовать эти функции, необходимо указать как минимум два параметра.
Например, если в грануле 4300 n-грамм, и мы ожидаем ложные положительные значения менее 0.0001. Остальные параметры могут быть оценены, выполнив следующие запросы:

```sql
--- оценить количество битов в фильтре
SELECT bfEstimateBmSize(4300, 0.0001) / 8 as size_of_bloom_filter_in_bytes;

┌─size_of_bloom_filter_in_bytes─┐
│                         10304 │
└───────────────────────────────┘

--- оценить количество хеш-функций
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) as number_of_hash_functions

┌─number_of_hash_functions─┐
│                       13 │
└──────────────────────────┘
```
Конечно, вы также можете использовать эти функции для оценки параметров по другим условиям.
Функции ссылаются на содержание [здесь](https://hur.st/bloomfilter).
#### Token Bloom Filter {#token-bloom-filter}

Такой же, как `ngrambf_v1`, но хранит токены вместо n-грамм. Токены — это последовательности, разделенные неалфавитными символами.

Синтаксис: `tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`
#### Специальные назначения {#special-purpose}

- Экспериментальный индекс для поддержки поиска приблизительных ближайших соседей. См. [здесь](annindexes.md) для получения подробной информации.
- Экспериментальный полнотекстовый индекс для поддержки полнотекстового поиска. См. [здесь](invertedindexes.md) для получения подробной информации.
### Поддержка функций {#functions-support}

Условия в `WHERE` клаузе содержат вызовы функций, которые работают с колонками. Если колонка является частью индекса, ClickHouse пытается использовать этот индекс при выполнении функций. ClickHouse поддерживает различные подмножества функций для использования индексов.

Индексы типа `set` могут использоваться всеми функциями. Другие типы индексов поддерживаются следующим образом:

| Функция (оператор) / Индекс                                                                               | первичный ключ | minmax | ngrambf_v1 | tokenbf_v1 | bloom_filter | full_text |
|-----------------------------------------------------------------------------------------------------------|-----------------|--------|------------|------------|--------------|-----------|
| [equals (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                              | ✔              | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notequals)                  | ✔              | ✔      | ✔          | ✔          | ✔            | ✔         |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                       | ✔              | ✔      | ✔          | ✔          | ✗            | ✔         |
| [notLike](/sql-reference/functions/string-search-functions.md/#notlike)                                 | ✔              | ✔      | ✔          | ✔          | ✗            | ✔         |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                     | ✗              | ✗      | ✔          | ✔          | ✗            | ✔         |
| [startsWith](/sql-reference/functions/string-functions.md/#startswith)                                  | ✔              | ✔      | ✔          | ✔          | ✗            | ✔         |
| [endsWith](/sql-reference/functions/string-functions.md/#endswith)                                      | ✗              | ✗      | ✔          | ✔          | ✗            | ✔         |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multisearchany)                   | ✗              | ✗      | ✔          | ✗          | ✗            | ✔         |
| [in](/sql-reference/functions/in-functions)                                                          | ✔              | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notIn](/sql-reference/functions/in-functions)                                                       | ✔              | ✔      | ✔          | ✔          | ✔            | ✔         |
| [less (`<`)](/sql-reference/functions/comparison-functions.md/#less)                                    | ✔              | ✔      | ✗          | ✗          | ✗            | ✗         |
| [greater (`>`)](/sql-reference/functions/comparison-functions.md/#greater)                              | ✔              | ✔      | ✗          | ✗          | ✗            | ✗         |
| [lessOrEquals (`<=`)](/sql-reference/functions/comparison-functions.md/#lessorequals)                  | ✔              | ✔      | ✗          | ✗          | ✗            | ✗         |
| [greaterOrEquals (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterorequals)            | ✔              | ✔      | ✗          | ✗          | ✗            | ✗         |
| [empty](/sql-reference/functions/array-functions/#empty)                                             | ✔              | ✔      | ✗          | ✗          | ✗            | ✗         |
| [notEmpty](/sql-reference/functions/array-functions/#notempty)                                       | ✔              | ✔      | ✗          | ✗          | ✗            | ✗         |
| [has](/sql-reference/functions/array-functions#hasarr-elem)                                            | ✗              | ✗      | ✔          | ✔          | ✔            | ✔         |
| [hasAny](/sql-reference/functions/array-functions#hasany)                                           | ✗              | ✗      | ✔          | ✔          | ✔            | ✗         |
| [hasAll](/sql-reference/functions/array-functions#hasall)                                           | ✗              | ✗      | ✗          | ✗          | ✔            | ✗         |
| hasToken                                                                                                | ✗              | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenOrNull                                                                                          | ✗              | ✗      | ✗          | ✔          | ✗            | ✔         |
| hasTokenCaseInsensitive (*)                                                                               | ✗              | ✗      | ✗          | ✔          | ✗            | ✗         |
| hasTokenCaseInsensitiveOrNull (*)                                                                         | ✗              | ✗      | ✗          | ✔          | ✗            | ✗         |

Функции с константным аргументом, которые меньше размера ngram, не могут быть использованы `ngrambf_v1` для оптимизации запросов.

(*) Для того чтобы `hasTokenCaseInsensitive` и `hasTokenCaseInsensitiveOrNull` были эффективными, индекс `tokenbf_v1` должен быть создан на приведенных к нижнему регистру данных, например `INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`.

:::note
Bloom-фильтры могут давать ложные положительные результаты, поэтому индексы `ngrambf_v1`, `tokenbf_v1` и `bloom_filter` не могут быть использованы для оптимизации запросов, где ожидается, что результат функции будет ложным.

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
Проекции похожи на [материализованные представления](/sql-reference/statements/create/view), но определяются на уровне частей. Это обеспечивает гарантии консистентности вместе с автоматическим использованием в запросах.

:::note
При реализации проекций также стоит учитывать настройку [force_optimize_projection](/operations/settings/settings#force_optimize_projection).
:::

Проекции не поддерживаются в операторах `SELECT` с модификатором [FINAL](/sql-reference/statements/select/from#final-modifier).
### Запрос проекции {#projection-query}
Запрос проекции определяет проекцию. Он неявно выбирает данные из родительской таблицы.
**Синтаксис**

```sql
SELECT <список колонок> [GROUP BY] <ключи группы> [ORDER BY] <выражение>
```

Проекции могут быть изменены или удалены с помощью оператора [ALTER](/sql-reference/statements/alter/projection.md).
### Хранение проекции {#projection-storage}
Проекции хранятся внутри директории части. Это похоже на индекс, но содержит подс direкцию, которая хранит анонимную часть таблицы `MergeTree`. Таблица определяется запросом на создание проекции. Если присутствует клаузула `GROUP BY`, базовый движок хранения становится [AggregatingMergeTree](aggregatingmergetree.md), и все агрегирующие функции преобразуются в `AggregateFunction`. Если есть клаузула `ORDER BY`, таблица `MergeTree` использует ее как выражение первичного ключа. В процессе слияния часть проекции объединяется через рутинное слияние своего хранилища. Контрольная сумма части родительской таблицы совмещается с частью проекции. Другие задачи обслуживания аналогичны пропускаемым индексам.
### Анализ запроса {#projection-query-analysis}
1. Проверьте, можно ли использовать проекцию для ответа на заданный запрос, то есть, генерирует ли она тот же ответ, что и запрос базовой таблицы.
2. Выберите лучшее подходящее совпадение, которое содержит наименьшее количество гранул для чтения.
3. Конвейер запроса, который использует проекции, будет отличаться от того, который использует оригинальные части. Если проекция отсутствует в некоторых частях, мы можем добавить конвейер, чтобы «проектировать» его на лету.
## Одновременный доступ к данным {#concurrent-data-access}

Для одновременного доступа к таблице мы используем многоверсионность. Иными словами, когда таблица одновременно читается и обновляется, данные читаются из набора частей, актуального на момент запроса. Нет долгих блокировок. Вставки не мешают операциям чтения.

Чтение из таблицы автоматические параллелизируется.
## Время жизни (TTL) для колонок и таблиц {#table_engine-mergetree-ttl}

Определяет срок жизни значений.

Клаузу `TTL` можно установить как для всей таблицы, так и для каждой отдельной колонки. `TTL` на уровне таблицы может также указывать логику автоматического перемещения данных между дисками и томами или рекомпрессии частей, где все данные истекли.

Выражения должны быть оценены как [Дата](/sql-reference/data-types/date.md) или [Дата/время](/sql-reference/data-types/datetime.md).

**Синтаксис**

Установка времени жизни для колонки:

``` sql
TTL time_column
TTL time_column + интервал
```

Чтобы задать `интервал`, используйте операторы [временного интервала](/sql-reference/operators#operators-for-working-with-dates-and-times), например:

``` sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```
### TTL колонки {#mergetree-column-ttl}

Когда значения в колонке истекают, ClickHouse заменяет их значениями по умолчанию для типа данных колонки. Если все значения в колонке в части данных истекают, ClickHouse удаляет эту колонку из части данных в файловой системе.

Клаузу `TTL` нельзя использовать для ключевых колонок.

**Примеры**
#### Создание таблицы с `TTL`: {#creating-a-table-with-ttl}

``` sql
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
#### Добавление TTL к колонке существующей таблицы {#adding-ttl-to-a-column-of-an-existing-table}

``` sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 DAY;
```
#### Изменение TTL колонки {#altering-ttl-of-the-column}

``` sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 MONTH;
```
### TTL таблицы {#mergetree-table-ttl}

Таблица может иметь выражение для удаления истекших строк и несколько выражений для автоматического перемещения частей между [дисками или томами](#table_engine-mergetree-multiple-volumes). Когда строки в таблице истекают, ClickHouse удаляет все соответствующие строки. Для перемещения или рекомпрессии частей все строки части должны удовлетворять критериям выражения `TTL`.

``` sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE условия]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

Тип правила TTL может следовать каждому выражению TTL. Оно влияет на действие, которое будет выполнено, когда выражение будет выполнено (достигнет текущего времени):

- `DELETE` - удалить истекшие строки (действие по умолчанию);
- `RECOMPRESS codec_name` - рекомпрессировать часть данных с `codec_name`;
- `TO DISK 'aaa'` - переместить часть на диск `aaa`;
- `TO VOLUME 'bbb'` - переместить часть на том `bbb`;
- `GROUP BY` - агрегировать истекшие строки.

Действие `DELETE` можно использовать вместе с клаузой `WHERE`, чтобы удалить только некоторые из истекших строк на основе условия фильтрации:
``` sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

Выражение `GROUP BY` должно быть префиксом первичного ключа таблицы.

Если колонка не является частью выражения `GROUP BY` и не установлена явно в клаузе `SET`, в результирующей строке она будет содержать случайное значение из сгруппированных строк (как если бы к ней была применена агрегирующая функция `any`).

**Примеры**
#### Создание таблицы с `TTL`: {#creating-a-table-with-ttl-1}

``` sql
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

``` sql
ALTER TABLE tab
    MODIFY TTL d + INTERVAL 1 DAY;
```

Создание таблицы, где строки истекают через месяц. Истекшие строки, где даты понедельники, удаляются:

``` sql
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
#### Создание таблицы, где истекшие строки рекомпрессируются: {#creating-a-table-where-expired-rows-are-recompressed}

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

Создание таблицы, где истекшие строки агрегируются. В результирующих строках `x` содержится максимальное значение среди сгруппированных строк, `y` — минимальное значение, а `d` — любое случайное значение из сгруппированных строк.

``` sql
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

Данные с истекшим `TTL` удаляются, когда ClickHouse объединяет части данных.

Когда ClickHouse обнаруживает, что данные истекли, происходит несогласованное слияние. Чтобы контролировать частоту таких слияний, вы можете установить `merge_with_ttl_timeout`. Если значение слишком низкое, будет происходить много несогласованных слияний, которые могут потреблять много ресурсов.

Если вы выполните запрос `SELECT` между слияниями, вы можете получить истекшие данные. Чтобы избежать этого, используйте запрос [OPTIMIZE](/sql-reference/statements/optimize.md) перед `SELECT`.

**См. также**

- [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts) настройка
## Типы дисков {#disk-types}

В дополнение к локальным блочным устройствам, ClickHouse поддерживает следующие типы хранения:
- [`s3` для S3 и MinIO](#table_engine-mergetree-s3)
- [`gcs` для GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` для Azure Blob Storage](/operations/storing-data#azure-blob-storage)
- [`hdfs` для HDFS](/engines/table-engines/integrations/hdfs)
- [`web` для только для чтения из веба](/operations/storing-data#web-storage)
- [`cache` для локального кэширования](/operations/storing-data#using-local-cache)
- [`s3_plain` для резервных копий в S3](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` для неизменяемых, нереплицированных таблиц в S3](/operations/storing-data.md#s3-plain-rewritable-storage)
## Использование нескольких блочных устройств для хранения данных {#table_engine-mergetree-multiple-volumes}
### Введение {#introduction}

Таблицы семейства `MergeTree` могут хранить данные на нескольких блочных устройствах. Например, это может быть полезно, когда данные определенной таблицы неявно разделены на «горячие» и «холодные». Самые последние данные запрашиваются регулярно, но требуют лишь небольшого объема пространства. Напротив, исторические данные с тяжелым хвостом запрашиваются редко. Если доступно несколько дисков, «горячие» данные могут находиться на быстрых дисках (например, NVMe SSD или в памяти), в то время как «холодные» данные - на относительно медленных (например, HDD).

Часть данных является минимально перемещаемой единицей для таблиц движка `MergeTree`. Данные, принадлежащие одной части, хранятся на одном диске. Части данных могут перемещаться между дисками в фоновом режиме (в соответствии с настройками пользователя), а также с помощью запросов [ALTER](/sql-reference/statements/alter/partition).
### Термины {#terms}

- Диск — блочное устройство, подключенное к файловой системе.
- Диск по умолчанию — Диск, который хранит путь, указанный в настройке сервера [path](/operations/server-configuration-parameters/settings.md/#path).
- Том — Упорядоченное множество равных дисков (похоже на [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)).
- Политика хранения — Набор томов и правила перемещения данных между ними.

Названия данных сущностей можно найти в системных таблицах, [system.storage_policies](/operations/system-tables/storage_policies) и [system.disks](/operations/system-tables/disks). Чтобы применить одну из настроенных политик хранения для таблицы, используйте настройку `storage_policy` для таблиц семейства движков `MergeTree`.
### Настройка {#table_engine-mergetree-multiple-volumes_configure}

Диски, тома и политики хранения должны быть объявлены внутри тега `<storage_configuration>` либо в файле в директории `config.d`.

:::tip
Диски также могут быть объявлены в разделе `SETTINGS` запроса. Это полезно
для ад-хок анализа, чтобы временно прикрепить диск, который, например, размещен по URL.
Смотрите [динамическое хранилище](/operations/storing-data#dynamic-configuration) для получения дополнительных сведений.
:::

Структура конфигурации:

``` xml
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

- `<disk_name_N>` — Имя диска. Имена должны отличаться для всех дисков.
- `path` — путь, под которым сервер будет хранить данные (папки `data` и `shadow`), должен заканчиваться на `/`.
- `keep_free_space_bytes` — количество свободного дискового пространства, которое должно быть зарезервировано.

Порядок определения дисков не важен.

Разметка конфигурации политики хранения:

``` xml
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
                <!-- больше томов -->
            </volumes>
            <move_factor>0.2</move_factor>
        </policy_name_1>
        <policy_name_2>
            <!-- конфигурация -->
        </policy_name_2>

        <!-- больше политик -->
    </policies>
    ...
</storage_configuration>
```

Теги:

- `policy_name_N` — Имя политики. Имена политик должны быть уникальными.
- `volume_name_N` — Имя тома. Имена томов должны быть уникальными.
- `disk` — диск в рамках тома.
- `max_data_part_size_bytes` — максимальный размер части, которая может быть сохранена на любом из дисков тома. Если размер объединенной части оказывается больше, чем `max_data_part_size_bytes`, то эта часть будет записана на следующий том. В основном, эта функция позволяет держать новые/малые части на горячем (SSD) томе и перемещать их на холодный (HDD) том, когда они достигают большого размера. Не используйте эту настройку, если ваша политика имеет только один том.
- `move_factor` — когда количество доступного пространства становится ниже этого фактора, данные автоматически начинают перемещаться на следующий том, если он доступен (по умолчанию 0.1). ClickHouse сортирует существующие части по размеру от крупнейших к наименьшим (в порядке убывания) и выбирает части с общим размером, достаточным для выполнения условия `move_factor`. Если общего размера всех частей недостаточно, все части будут перемещены.
- `perform_ttl_move_on_insert` — Отключает перемещение по TTL при ВСТАВКЕ части данных. По умолчанию (если включено) если мы вставляем часть данных, которая уже истекла по правилу перемещения TTL, она немедленно идет на том/диск, объявленный в правиле перемещения. Это может значительно замедлить вставку в случае, если целевой том/диск медленный (например, S3). Если отключено, то уже истекшая часть данных записывается на стандартный том, а затем сразу же перемещается на том по TTL.
- `load_balancing` - Политика балансировки дисков, `round_robin` или `least_used`.
- `least_used_ttl_ms` - Настройка тайм-аута (в миллисекундах) для обновления доступного пространства на всех дисках (`0` - обновлять всегда, `-1` - никогда не обновлять, по умолчанию `60000`). Обратите внимание, если диск может использоваться только ClickHouse и не подлежит онлайн-изменению размера/уменьшению, вы можете использовать `-1`, в остальных случаях это не рекомендуется, так как в конечном итоге это приведет к неправильному распределению пространства.
- `prefer_not_to_merge` — Не используйте эту настройку. Отключает объединение частей данных на этом томе (это вредно и приводит к ухудшению производительности). Когда эта настройка включена (не делайте этого), объединение данных на этом томе не разрешено (что плохо). Это позволяет (но вам это не нужно) контролировать (если вы хотите что-то контролировать, вы делаете ошибку) как ClickHouse работает с медленными дисками (но ClickHouse знает лучше, так что, пожалуйста, не используйте эту настройку).
- `volume_priority` — Определяет приоритет (порядок), в котором заполняются тома. Меньшее значение означает более высокий приоритет. Значения параметров должны быть положительными целыми числами и совместно охватывать диапазон от 1 до N (наименьший приоритет задан) без пропуска любых чисел.
  * Если _все_ тома помечены, они приоритизируются в указанном порядке.
  * Если только _некоторые_ тома помечены, то те, которые не помечены, имеют наименьший приоритет и они упорядочены в порядке определения в конфигурации.
  * Если _никакие_ тома не помечены, то их приоритет устанавливается соответственно их порядку в конфигурации.
  * Два тома не могут иметь одинаковое значение приоритета.

Примеры конфигурации:

``` xml
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

В данном примере политика `hdd_in_order` реализует подход [round-robin](https://en.wikipedia.org/wiki/Round-robin_scheduling). Таким образом, эта политика определяет только один том (`single`), части данных хранятся на всех его дисках в круговом порядке. Такая политика может быть довольно полезна, если несколько аналогичных дисков подключены к системе, но RAID не настроен. Имейте в виду, что каждый отдельный диск не является надежным, и вы можете захотеть компенсировать это с помощью фактора репликации 3 или более.

Если в системе доступны разные виды дисков, можно использовать политику `moving_from_ssd_to_hdd`. Том `hot` состоит из SSD-диска (`fast_ssd`), а максимальный размер части, который может быть хранен на этом томе, составляет 1 ГБ. Все части размером более 1 ГБ будут храниться непосредственно на `cold` томе, который содержит HDD-диск `disk1`. Кроме того, как только диск `fast_ssd` заполнится более чем на 80%, данные будут перенесены на `disk1` фоновым процессом.

Порядок перечисления томов внутри политики хранения важен, если хотя бы один из перечисленных томов не имеет явного параметра `volume_priority`.
Как только один из томов переполнен, данные перемещаются на следующий. Порядок перечисления дисков также важен, поскольку данные хранятся на них поочередно.

При создании таблицы можно применить одну из настроенных политик хранения:

``` sql
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

Политика `default` подразумевает использование только одного тома, который состоит только из одного диска, указанного в `<path>`.
Вы можете изменить политику хранения после создания таблицы с помощью запроса [ALTER TABLE ... MODIFY SETTING], новая политика должна включать все старые диски и тома с одинаковыми именами.

Количество потоков, выполняющих фоновое перемещение частей данных, можно изменить с помощью настройки [background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size).
### Подробности {#details}

В случае таблиц `MergeTree` данные попадают на диск различными способами:

- В результате вставки (`INSERT` запроса).
- Во время фоновых слияний и [мутаций](/sql-reference/statements/alter#mutations).
- При загрузке из другой реплики.
- В результате замораживания партиции [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition).

Во всех этих случаях, кроме мутаций и замораживания партиции, часть хранится на томе и диске в соответствии с заданной политикой хранения:

1. Первый том (в порядке определения), который имеет достаточно дискового пространства для хранения части (`unreserved_space > current_part_size`) и позволяет хранить части заданного размера (`max_data_part_size_bytes > current_part_size`), выбирается.
2. Внутри этого тома выбирается диск, следующий за тем, который использовался для хранения предыдущей порции данных, и у которого есть свободное пространство больше, чем размер части (`unreserved_space - keep_free_space_bytes > current_part_size`).

В фоновом режиме мутации и замораживание партиции используют [жесткие ссылки](https://en.wikipedia.org/wiki/Hard_link). Жесткие ссылки между различными дисками не поддерживаются, поэтому в таких случаях результирующие части хранятся на тех же дисках, что и начальные.

В фоновом режиме части перемещаются между томами на основе количества свободного пространства (`move_factor` параметра) в соответствии с порядком, в котором тома объявлены в конфигурационном файле.
Данные никогда не перемещаются с последнего тома на первый. Можно использовать системные таблицы [system.part_log](/operations/system-tables/part_log) (поле `type = MOVE_PART`) и [system.parts](/operations/system-tables/parts.md) (поля `path` и `disk`), чтобы следить за фоновыми перемещениями. Также подробная информация может быть найдена в логах сервера.

Пользователь может инициировать перемещение части или партиции с одного тома на другой, используя запрос [ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition), все ограничения для фоновых операций учитываются. Запрос инициирует перемещение самостоятельно и не ждет завершения фоновых операций. Пользователь получит сообщение об ошибке, если недостаточно свободного пространства или если не выполнены какие-либо из необходимых условий.

Перемещение данных не мешает репликации данных. Поэтому для одной и той же таблицы на разных репликах могут быть указаны разные политики хранения.

После завершения фоновых слияний и мутаций старые части удаляются только через определенное время (`old_parts_lifetime`).
В течение этого времени они не перемещаются на другие тома или диски. Поэтому, пока части не будут окончательно удалены, они все еще учитываются для оценки занимаемого дискового пространства.

Пользователь может присваивать новые большие части различным дискам тома [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) сбалансированным образом, используя настройку [min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min-bytes-to-rebalance-partition-over-jbod).
## Использование внешнего хранилища для хранения данных {#table_engine-mergetree-s3}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) и другие движки таблиц семейства могут хранить данные в `S3`, `AzureBlobStorage`, `HDFS`, используя диск с типами `s3`, `azure_blob_storage`, `hdfs` соответственно. Смотрите [настройка параметров внешнего хранилища](/operations/storing-data.md/#configuring-external-storage) для получения дополнительных сведений.

Пример для [S3](https://aws.amazon.com/s3/) в качестве внешнего хранилища с использованием диска типа `s3`.

Конфигурационный разметка:
``` xml
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

Также смотрите [настройка параметров внешнего хранилища](/operations/storing-data.md/#configuring-external-storage).

:::note конфигурация кэша
Версии ClickHouse 22.3 по 22.7 используют другую конфигурацию кэша, смотрите [использование локального кэша](/operations/storing-data.md/#using-local-cache), если вы используете одну из этих версий.
:::
## Виртуальные колонки {#virtual-columns}

- `_part` — Название части.
- `_part_index` — Последовательный индекс части в результате запроса.
- `_partition_id` — Название партиции.
- `_part_uuid` — Уникальный идентификатор части (если активирована настройка MergeTree `assign_part_uuids`).
- `_partition_value` — Значения (кортеж) выражения `partition by`.
- `_sample_factor` — Фактор выборки (из запроса).
- `_block_number` — Номер блока строки, он сохраняется при слияниях, когда `allow_experimental_block_number_column` установлен в true.
## Статистика по колонкам {#column-statistics}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Объявление статистики находится в секции колонок запроса `CREATE` для таблиц из семейства `*MergeTree*`, когда мы включаем `set allow_experimental_statistics = 1`.

``` sql
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

Эти легковесные статистики агрегируют информацию о распределении значений в колонках. Статистика хранится в каждой части и обновляется при каждой вставке.
Они могут использоваться только для оптимизации `prewhere`, если мы включили `set allow_statistics_optimize = 1`.
### Доступные типы статистики по колонкам {#available-types-of-column-statistics}

- `MinMax`

    Минимальное и максимальное значение колонки, что позволяет оценить селективность диапазонных фильтров для числовых колонок.

    Синтаксис: `minmax`

- `TDigest`

    [TDigest](https://github.com/tdunning/t-digest) эскизы, которые позволяют вычислять приближенные процентили (например, 90-й процентиль) для числовых колонок.

    Синтаксис: `tdigest`

- `Uniq`

    [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) эскизы, которые дают оценку количества различных значений в колонке.

    Синтаксис: `uniq`

- `CountMin`

    [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch) эскизы, которые предоставляют приближенное количество частоты каждого значения в колонке.

    Синтаксис: `countmin`
### Поддерживаемые типы данных {#supported-data-types}

|           | (U)Int*, Float*, Decimal(*), Date*, Boolean, Enum* | String или FixedString |
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
## Настройки на уровне колонки {#column-level-settings}

Определенные настройки MergeTree могут быть переопределены на уровне колонки:

- `max_compress_block_size` — Максимальный размер блоков с несжатыми данными перед сжатием для записи в таблицу.
- `min_compress_block_size` — Минимальный размер блоков с несжатыми данными, необходимый для сжатия при записи следующей метки.

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

Настройки на уровне колонки могут быть модифицированы или удалены с использованием [ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md), например:

- Удалить `SETTINGS` из объявления колонки:

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- Изменить настройку:

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- Сбросить одну или несколько настроек, также удаляет декларацию настройки в выражении колонки в запросе CREATE таблицы.

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
