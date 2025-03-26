---
description: '`MergeTree`-движки таблиц предназначены для высокой скорости ввода данных и огромных объемов данных.'
sidebar_label: 'MergeTree'
sidebar_position: 11
slug: /engines/table-engines/mergetree-family/mergetree
title: 'MergeTree'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# MergeTree

Движок `MergeTree` и другие движки семейства `MergeTree` (например, `ReplacingMergeTree`, `AggregatingMergeTree`) являются наиболее распространенными и надежными движками таблиц в ClickHouse.

`MergeTree`-движки таблиц предназначены для высокой скорости ввода данных и огромных объемов данных. Операции вставки создают части таблицы, которые объединяются фоновым процессом с другими частями таблицы.

Основные характеристики `MergeTree`-движков таблиц:

- Первичный ключ таблицы определяет порядок сортировки внутри каждой части таблицы (кластерный индекс). Первичный ключ также не ссылается на отдельные строки, а на блоки по 8192 строки, называемые гранулами. Это делает первичные ключи огромных наборов данных достаточно маленькими, чтобы оставаться загруженными в основной памяти, обеспечивая при этом быстрый доступ к данным на диске.

- Таблицы могут быть разделены с использованием произвольных выражений разделов. Прореживание разделов гарантирует, что разделы не читаются, когда это допускает запрос.

- Данные могут быть реплицированы по нескольким узлам кластера для высокой доступности, резервирования и обновлений без простоя. См. [Репликация данных](/engines/table-engines/mergetree-family/replication.md).

- Движки таблиц `MergeTree` поддерживают различные виды статистики и методы выборки для помощи в оптимизации запросов.

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

Для подробного описания параметров см. оператор [CREATE TABLE](/sql-reference/statements/create/table.md).
### Условия запроса {#mergetree-query-clauses}
#### ENGINE {#engine}

`ENGINE` — Название и параметры движка. `ENGINE = MergeTree()`. Движок `MergeTree` не имеет параметров.
#### ORDER_BY {#order_by}

`ORDER BY` — Ключ сортировки.

Кортеж имен столбцов или произвольных выражений. Пример: `ORDER BY (CounterID + 1, EventDate)`.

Если первичный ключ не определен (т.е. `PRIMARY KEY` не указан), ClickHouse использует ключ сортировки в качестве первичного ключа.

Если сортировка не требуется, вы можете использовать синтаксис `ORDER BY tuple()`. В противном случае, если включена настройка `create_table_empty_primary_key_by_default`, `ORDER BY tuple()` автоматически добавляется к операторам `CREATE TABLE`. См. [Выбор первичного ключа](#selecting-a-primary-key).
#### PARTITION BY {#partition-by}

`PARTITION BY` — Ключ [разделения](/engines/table-engines/mergetree-family/custom-partitioning-key.md). Необязательный. В большинстве случаев вам не нужен ключ раздела, и если вам нужно разделение, в общем, вам не нужен ключ раздела более детализированный, чем по месяцам. Разделение не ускоряет запросы (в отличие от выражения ORDER BY). Вам никогда не следует использовать слишком детализированное разделение. Не разделяйте данные по идентификаторам клиентов или именам (вместо этого сделайте идентификатор клиента или имя первым столбцом в выражении ORDER BY).

Для разделения по месяцам используйте выражение `toYYYYMM(date_column)`, где `date_column` — это столбец с датой типа [Date](/sql-reference/data-types/date.md). Имена разделов здесь имеют формат `"YYYYMM"`.
#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — Первичный ключ, если он [отличается от ключа сортировки](#choosing-a-primary-key-that-differs-from-the-sorting-key). Необязательный.

Указание ключа сортировки (с использованием условия `ORDER BY`) подразумевает указание первичного ключа. Обычно не требуется дополнительно указывать первичный ключ наряду с ключом сортировки.
#### SAMPLE BY {#sample-by}

`SAMPLE BY` — Выражение выборки. Необязательное.

Если указано, оно должно содержаться в первичном ключе. Выражение выборки должно давать беззнаковое целое число.

Пример: `SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`.
####  TTL {#ttl}

`TTL` — Список правил, которые определяют срок хранения строк и логику автоматического перемещения частей [между дисками и томами](#table_engine-mergetree-multiple-volumes). Необязательный.

Выражение должно давать тип `Date` или `DateTime`, например, `TTL date + INTERVAL 1 DAY`.

Тип правила `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY` определяет действие, которое должно быть выполнено с частью, если выражение выполнено (достигнуто текущее время): удаление устаревших строк, перемещение части (если выражение выполняется для всех строк в части) на указанный диск (`TO DISK 'xxx'`) или на том (`TO VOLUME 'xxx'`), или агрегация значений в устаревших строках. Тип правила по умолчанию — удаление (`DELETE`). Можно указать список из нескольких правил, но не должно быть более одного правила `DELETE`.

Более подробную информацию смотрите в [TTL для столбцов и таблиц](#table_engine-mergetree-ttl).
#### SETTINGS {#settings}

См. [Настройки MergeTree](../../../operations/settings/merge-tree-settings.md).

**Пример настройки секций**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

В этом примере мы устанавливаем разделение по месяцам.

Мы также устанавливаем выражение для выборки в качестве хеш-функции по идентификатору пользователя. Это позволяет псевдослучайно распределять данные в таблице для каждого `CounterID` и `EventDate`. Если вы определите условия [SAMPLE](/sql-reference/statements/select/sample) при выборе данных, ClickHouse вернет равномерную псевдослучайную выборку данных для подмножества пользователей.

Настройку `index_granularity` можно опустить, так как 8192 является значением по умолчанию.

<details markdown="1">

<summary>Устаревший метод создания таблицы</summary>

:::note
Не используйте этот метод в новых проектах. Если возможно, переключите старые проекты на метод, описанный выше.
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

- `date-column` — Имя столбца типа [Date](/sql-reference/data-types/date.md). ClickHouse автоматически создает разделы по месяцам на основе этого столбца. Имена разделов имеют формат `"YYYYMM"`.
- `sampling_expression` — Выражение для выборки.
- `(primary, key)` — Первичный ключ. Тип: [Tuple()](/sql-reference/data-types/tuple.md)
- `index_granularity` — Гранулярность индекса. Количество строк данных между "метками" индекса. Значение 8192 подходит для большинства задач.

**Пример**

```sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

Движок `MergeTree` настраивается так же, как в вышеупомянутом примере для основного метода конфигурации движка.
</details>
## Хранение данных {#mergetree-data-storage}

Таблица состоит из частей данных, отсортированных по первичному ключу.

Когда данные вставляются в таблицу, создаются отдельные части данных, каждая из которых лексикографически отсортирована по первичному ключу. Например, если первичный ключ равен `(CounterID, Date)`, данные в части отсортированы по `CounterID`, а внутри каждого `CounterID` они упорядочены по `Date`.

Данные, принадлежащие различным разделам, разделяются на разные части. В фоновом режиме ClickHouse объединяет части данных для более эффективного хранения. Части, принадлежащие различным разделам, не объединяются. Механизм объединения не гарантирует, что все строки с одинаковым первичным ключом будут находиться в одной части данных.

Части данных могут храниться в формате `Wide` или `Compact`. В формате `Wide` каждый столбец хранится в отдельном файле в файловой системе, в формате `Compact` все столбцы хранятся в одном файле. Формат `Compact` можно использовать для повышения производительности небольших и частых вставок.

Формат хранения данных контролируется настройками `min_bytes_for_wide_part` и `min_rows_for_wide_part` движка таблицы. Если количество байтов или строк в части данных меньше, чем значение соответствующей настройки, часть хранится в формате `Compact`. В противном случае она хранится в формате `Wide`. Если ни одна из этих настроек не установлена, части данных хранятся в формате `Wide`.

Каждая часть данных логически делится на гранулы. Гранула — это наименьший неделимый набор данных, который ClickHouse считывает при выборе данных. ClickHouse не разделяет строки или значения, поэтому каждая гранула всегда содержит целое число строк. Первая строка гранулы помечена значением первичного ключа для строки. Для каждой части данных ClickHouse создает файл индекса, который хранит метки. Для каждого столбца, будь то в первичном ключе или нет, ClickHouse также хранит те же метки. Эти метки позволяют вам находить данные непосредственно в файлах столбцов.

Размер гранулы ограничен настройками `index_granularity` и `index_granularity_bytes` движка таблицы. Количество строк в грануле находится в диапазоне `[1, index_granularity]`, в зависимости от размера строк. Размер гранулы может превышать `index_granularity_bytes`, если размер единственной строки больше значения настройки. В этом случае размер гранулы соответствует размеру строки.
## Первичные ключи и индексы в запросах {#primary-keys-and-indexes-in-queries}

Возьмем для примера первичный ключ `(CounterID, Date)`. В этом случае сортировка и индекс могут быть проиллюстрированы следующим образом:

```text
Все данные:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
Метки:          |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Номера меток:   0      1      2      3      4      5      6      7      8      9      10
```

Если запрос данных указывает:

- `CounterID in ('a', 'h')`, сервер считывает данные в диапазонах меток `[0, 3)` и `[6, 8)`.
- `CounterID IN ('a', 'h') AND Date = 3`, сервер считывает данные в диапазонах меток `[1, 3)` и `[7, 8)`.
- `Date = 3`, сервер считывает данные в диапазоне меток `[1, 10]`.

Примеры выше показывают, что всегда эффективнее использовать индекс, чем проводить полное сканирование.

Разреженный индекс позволяет считывать дополнительные данные. При считывании одного диапазона первичного ключа до `index_granularity * 2` дополнительных строк в каждом блоке данных можно считать.

Разреженные индексы позволяют работать с очень большим количеством строк таблицы, так как в большинстве случаев такие индексы помещаются в оперативную память компьютера.

ClickHouse не требует уникального первичного ключа. Вы можете вставлять несколько строк с одинаковым первичным ключом.

Вы можете использовать выражения типа `Nullable` в условиях `PRIMARY KEY` и `ORDER BY`, но это настоятельно не рекомендуется. Чтобы разрешить эту функцию, включите настройку [allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key). Принцип [NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values) применяется к значениям `NULL` в условии `ORDER BY`.
### Выбор первичного ключа {#selecting-a-primary-key}

Количество столбцов в первичном ключе не ограничено. В зависимости от структуры данных вы можете включать больше или меньше столбцов в первичный ключ. Это может:

- Улучшить производительность индекса.

    Если первичный ключ равен `(a, b)`, то добавление еще одного столбца `c` улучшит производительность, если выполнены следующие условия:

    - Существуют запросы с условием на столбец `c`.
    - Длинные диапазоны данных (во много раз длиннее, чем `index_granularity`) с одинаковыми значениями для `(a, b)` являются обычными. Другими словами, когда добавление еще одного столбца позволяет пропустить довольно длинные диапазоны данных.

- Улучшить сжатие данных.

    ClickHouse сортирует данные по первичному ключу, поэтому чем выше согласованность, тем лучше сжатие.

- Обеспечить дополнительную логику при объединении частей данных в движках [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) и [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md).

    В этом случае имеет смысл указать *ключ сортировки*, который отличается от первичного ключа.

Длинный первичный ключ негативно скажется на производительности вставки и использовании памяти, но дополнительные столбцы в первичном ключе не влияют на производительность ClickHouse во время запросов `SELECT`.

Вы можете создать таблицу без первичного ключа, используя синтаксис `ORDER BY tuple()`. В этом случае ClickHouse хранит данные в порядке вставки. Если вы хотите сохранить порядок данных при вставке данных с помощью запросов `INSERT ... SELECT`, установите [max_insert_threads = 1](/operations/settings/settings#max_insert_threads).

Чтобы выбрать данные в первоначальном порядке, используйте [однопоточные](/operations/settings/settings.md/#max_threads) запросы `SELECT`.
### Выбор первичного ключа, который отличается от ключа сортировки {#choosing-a-primary-key-that-differs-from-the-sorting-key}

Возможно указать первичный ключ (выражение со значениями, которые записываются в файл индекса для каждой метки), который отличается от ключа сортировки (выражение для сортировки строк в частях данных). В этом случае выражение первичного ключа должно быть префиксом выражения ключа сортировки.

Эта функция полезна при использовании движков [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) и
[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md). В общем случае, когда используются эти движки, таблица имеет два типа столбцов: *измерения* и *меры*. Типичные запросы агрегируют значения столбцов мер с произвольным `GROUP BY` и фильтрацией по измерениям. Поскольку SummingMergeTree и AggregatingMergeTree агрегируют строки с одинаковым значением ключа сортировки, естественно добавить все измерения к нему. В результате ключевое выражение состоит из длинного списка столбцов, и этот список нужно часто обновлять новыми добавленными измерениями.

В этом случае имеет смысл оставить только несколько столбцов в первичном ключе, которые обеспечат эффективное выполнение диапазонных сканирований, а остальные измеренные столбцы добавить к кортеже ключа сортировки.

[ALTER](/sql-reference/statements/alter/index.md) ключа сортировки — это легкая операция, так как при одновременном добавлении нового столбца в таблицу и в ключ сортировки существующие части данных не нуждаются в изменении. Поскольку старый ключ сортировки является префиксом нового ключа сортировки и в новом добавленном столбце нет данных, данные сортируются как по старым, так и по новым ключам сортировки в момент изменения таблицы.
### Использование индексов и разделов в запросах {#use-of-indexes-and-partitions-in-queries}

Для запросов `SELECT` ClickHouse анализирует, может ли быть использован индекс. Индекс может быть использован, если условие `WHERE/PREWHERE` содержит выражение (в качестве одного из элементов конъюнкции или полностью), которое представляет операцию сравнения на равенство или неравенство, или если оно содержит `IN` или `LIKE` с фиксированным префиксом по столбцам или выражениям, которые входят в первичный ключ или ключ разделения, или по определенным частично повторяющимся функциям этих столбцов, или логическим соотношениям этих выражений.

Таким образом, можно быстро выполнять запросы по одному или нескольким диапазонам первичного ключа. В этом примере запросы будут быстрыми при выполнении для определенной метки отслеживания, для определенной метки и диапазона дат, для определенной метки и даты, для нескольких меток с диапазоном дат и т.д.

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

ClickHouse будет использовать индексы первичного ключа для удаления лишних данных и ключа разделения по месяцам, чтобы удалить разделы, которые находятся в неподходящих диапазонах дат.

Приведенные выше запросы показывают, что индекс используется даже для сложных выражений. Чтение из таблицы организовано так, что использование индекса не может быть медленнее, чем полное сканирование.

В следующем примере индекс не может быть использован.

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

Чтобы проверить, может ли ClickHouse использовать индекс при выполнении запроса, используйте настройки [force_index_by_date](/operations/settings.md/#force_index_by_date) и [force_primary_key](/operations/settings.md/#force_primary_key).

Ключ для разделения по месяцам позволяет считывать только те блоки данных, которые содержат даты из правильного диапазона. В этом случае блок данных может содержать данные для многих дат (чуть ли не на целый месяц). В пределах блока данные отсортированы по первичному ключу, который может не содержать дату как первый столбец. Из-за этого использование запроса только с условием даты, который не указывает префикс первичного ключа, приведет к считыванию большего объема данных, чем для одной даты.
### Использование индекса для частично монотонных первичных ключей {#use-of-index-for-partially-monotonic-primary-keys}

Рассмотрим, например, дни месяца. Они формируют [монотонную последовательность](https://en.wikipedia.org/wiki/Monotonic_function) для одного месяца, но не монотонны для более длительных периодов. Это частично монотонная последовательность. Если пользователь создает таблицу с частично монотонным первичным ключом, ClickHouse создает разреженный индекс как обычно. Когда пользователь выбирает данные из такой таблицы, ClickHouse анализирует условия запроса. Если пользователь хочет получить данные между двумя метками индекса и обе эти метки попадают в один месяц, ClickHouse может использовать индекс в данном случае, так как может рассчитать расстояние между параметрами запроса и метками индекса.

ClickHouse не может использовать индекс, если значения первичного ключа в диапазоне параметров запроса не представляют собой монотонную последовательность. В этом случае ClickHouse использует метод полного сканирования.

ClickHouse использует эту логику не только для последовательностей дней месяца, но и для любого первичного ключа, который представляет собой частично монотонную последовательность.
### Индексы пропуска данных {#table_engine-mergetree-data_skipping-indexes}

Объявление индекса находится в разделе столбцов запроса `CREATE`.

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

Для таблиц из семейства `*MergeTree` могут быть указаны индексы пропуска данных.

Эти индексы агрегируют некоторую информацию о заданном выражении по блокам, состоящим из `granularity_value` гранул (размер гранулы задается настройкой `index_granularity` в движке таблицы). Затем эти агрегаты используются в запросах `SELECT` для уменьшения объема данных, считываемых с диска, путем пропуска больших блоков данных, где условие `where` не может быть выполнено.

Клаузу `GRANULARITY` можно опустить, значение по умолчанию для `granularity_value` — 1.

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

Индексы из примера могут быть использованы ClickHouse для уменьшения объёма данных, считываемых с диска в следующих запросах:

```sql
SELECT count() FROM table WHERE u64 == 10;
SELECT count() FROM table WHERE u64 * i32 >= 1234
SELECT count() FROM table WHERE u64 * length(s) == 1234
```

Индексы пропуска данных также могут быть созданы по составным столбцам:

```sql
-- для столбцов типа Map:
INDEX map_key_index mapKeys(map_column) TYPE bloom_filter
INDEX map_value_index mapValues(map_column) TYPE bloom_filter

-- для столбцов типа Tuple:
INDEX tuple_1_index tuple_column.1 TYPE bloom_filter
INDEX tuple_2_index tuple_column.2 TYPE bloom_filter

-- для столбцов типа Nested:
INDEX nested_1_index col.nested_col1 TYPE bloom_filter
INDEX nested_2_index col.nested_col2 TYPE bloom_filter
```
### Доступные типы индексов {#available-types-of-indices}
#### MinMax {#minmax}

Сохраняет экстремумы заданного выражения (если выражение является `tuple`, то оно сохраняет экстримумы для каждого элемента `tuple`), использует сохраненную информацию для пропуска блоков данных, как первичный ключ.

Синтаксис: `minmax`
#### Set {#set}

Сохраняет уникальные значения заданного выражения (не более `max_rows` строк, `max_rows=0` означает "без ограничений"). Использует значения, чтобы проверить, что выражение `WHERE` не может быть выполнено в блоке данных.

Синтаксис: `set(max_rows)`
#### Bloom Filter {#bloom-filter}

Сохраняет [фильтр Блума](https://en.wikipedia.org/wiki/Bloom_filter) для заданных столбцов. Необязательный параметр `false_positive` с возможными значениями от 0 до 1 указывает вероятность получения ложного положительного ответа от фильтра. Значение по умолчанию: 0.025. Поддерживаемые типы данных: `Int*`, `UInt*`, `Float*`, `Enum`, `Date`, `DateTime`, `String`, `FixedString`, `Array`, `LowCardinality`, `Nullable`, `UUID` и `Map`. Для типа данных `Map` клиент может указать, должен ли индекс быть создан для ключей или значений с помощью функций [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) или [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues).

Синтаксис: `bloom_filter([false_positive])`
#### N-gram Bloom Filter {#n-gram-bloom-filter}

Сохраняет [фильтр Блума](https://en.wikipedia.org/wiki/Bloom_filter), который содержит все n-граммы из блока данных. Работает только с типами данных: [String](/sql-reference/data-types/string.md), [FixedString](/sql-reference/data-types/fixedstring.md) и [Map](/sql-reference/data-types/map.md). Может использоваться для оптимизации выражений `EQUALS`, `LIKE` и `IN`.

Синтаксис: `ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`

- `n` — размер n-граммы,
- `size_of_bloom_filter_in_bytes` — размер фильтра Блума в байтах (вы можете использовать большие значения, например, 256 или 512, так как он хорошо сжимается).
- `number_of_hash_functions` — количество хеш-функций, используемых в фильтре Блума.
- `random_seed` — семя для хеш-функций фильтра Блума.

Пользователи могут создать [UDF](/sql-reference/statements/create/function.md) для оценки наборов параметров `ngrambf_v1`. Запросы выглядят следующим образом:

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
Например, если в грануле 4300 n-грамм и мы ожидаем ложные срабатывания менее 0.0001. Остальные параметры можно оценить, выполнив следующие запросы:

```sql
--- оценить количество бит в фильтре
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
Конечно, вы также можете использовать эти функции для оценки параметров при других условиях.
Функции ссылаются на содержание [здесь](https://hur.st/bloomfilter).
#### Token Bloom Filter {#token-bloom-filter}

То же, что и `ngrambf_v1`, но сохраняет токены вместо n-грамм. Токены — это последовательности, разделенные неалфавитными символами.

Синтаксис: `tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`
#### Специальный {#special-purpose}

- Экспериментальный индекс для поддержки приближенного поиска ближайших соседей. Подробности см. [здесь](annindexes.md).
- Экспериментальный полнотекстовый индекс для поддержки полнотекстового поиска. Подробности см. [здесь](invertedindexes.md).

### Поддержка функций {#functions-support}

Условия в операторе `WHERE` содержат вызовы функций, которые работают со столбцами. Если столбец является частью индекса, ClickHouse старается использовать этот индекс при выполнении функций. ClickHouse поддерживает разные подмножества функций для использования индексов.

Индексы типа `set` могут использоваться всеми функциями. Другие типы индексов поддерживаются следующим образом:

| Функция (оператор) / Индекс                                                                                | первичный ключ | minmax | ngrambf_v1 | tokenbf_v1 | bloom_filter | полный текст |
|------------------------------------------------------------------------------------------------------------|----------------|--------|------------|------------|--------------|--------------|
| [equals (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                         | ✔              | ✔      | ✔          | ✔          | ✔            | ✔            |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notequals)             | ✔              | ✔      | ✔          | ✔          | ✔            | ✔            |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                  | ✔              | ✔      | ✔          | ✔          | ✗            | ✔            |
| [notLike](/sql-reference/functions/string-search-functions.md/#notlike)                            | ✔              | ✔      | ✔          | ✔          | ✗            | ✔            |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                | ✗              | ✗      | ✔          | ✔          | ✗            | ✔            |
| [startsWith](/sql-reference/functions/string-functions.md/#startswith)                             | ✔              | ✔      | ✔          | ✔          | ✗            | ✔            |
| [endsWith](/sql-reference/functions/string-functions.md/#endswith)                                 | ✗              | ✗      | ✔          | ✔          | ✗            | ✔            |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multisearchany)              | ✗              | ✗      | ✔          | ✗          | ✗            | ✔            |
| [in](/sql-reference/functions/in-functions)                                                        | ✔              | ✔      | ✔          | ✔          | ✔            | ✔            |
| [notIn](/sql-reference/functions/in-functions)                                                     | ✔              | ✔      | ✔          | ✔          | ✔            | ✔            |
| [less (`<`)](/sql-reference/functions/comparison-functions.md/#less)                                 | ✔              | ✔      | ✗          | ✗          | ✗            | ✗            |
| [greater (`>`)](/sql-reference/functions/comparison-functions.md/#greater)                           | ✔              | ✔      | ✗          | ✗          | ✗            | ✗            |
| [lessOrEquals (`<=`)](/sql-reference/functions/comparison-functions.md/#lessorequals)                | ✔              | ✔      | ✗          | ✗          | ✗            | ✗            |
| [greaterOrEquals (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterorequals)          | ✔              | ✔      | ✗          | ✗          | ✗            | ✗            |
| [empty](/sql-reference/functions/array-functions/#empty)                                           | ✔              | ✔      | ✗          | ✗          | ✗            | ✗            |
| [notEmpty](/sql-reference/functions/array-functions/#notempty)                                     | ✔              | ✔      | ✗          | ✗          | ✗            | ✗            |
| [has](/sql-reference/functions/array-functions#hasarr-elem)                                               | ✗              | ✗      | ✔          | ✔          | ✔            | ✔            |
| [hasAny](/sql-reference/functions/array-functions#hasany)                                         | ✗              | ✗      | ✔          | ✔          | ✔            | ✗            |
| [hasAll](/sql-reference/functions/array-functions#hasall)                                         | ✗              | ✗      | ✔          | ✔          | ✔            | ✗            |
| hasToken                                                                                                   | ✗              | ✗      | ✗          | ✔          | ✗            | ✔            |
| hasTokenOrNull                                                                                             | ✗              | ✗      | ✗          | ✔          | ✗            | ✔            |
| hasTokenCaseInsensitive (*)                                                                                | ✗              | ✗      | ✗          | ✔          | ✗            | ✗            |
| hasTokenCaseInsensitiveOrNull (*)                                                                          | ✗              | ✗      | ✗          | ✔          | ✗            | ✗            |

Функции с константным аргументом, который меньше размера ngram, не могут быть использованы `ngrambf_v1` для оптимизации запросов.

(*) Для того чтобы `hasTokenCaseInsensitive` и `hasTokenCaseInsensitiveOrNull` были эффективными, индекс `tokenbf_v1` должен быть создан на преобразованных в нижний регистр данных, например `INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`.

:::note
Фильтры Блума могут иметь ложные срабатывания, поэтому индексы `ngrambf_v1`, `tokenbf_v1` и `bloom_filter` не могут быть использованы для оптимизации запросов, в которых ожидается, что результат функции будет ложным.

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
Проекции похожи на [материализованные представления](/sql-reference/statements/create/view), но определяются на уровне частей. Они предоставляют гарантии консистентности вместе с автоматическим использованием в запросах.

:::note
При реализации проекций также следует учитывать настройку [force_optimize_projection](/operations/settings/settings#force_optimize_projection).
:::

Проекции не поддерживаются в операторе `SELECT` с модификатором [FINAL](/sql-reference/statements/select/from#final-modifier).
### Запрос на проекцию {#projection-query}
Запрос на проекцию — это то, что определяет проекцию. Он неявно выбирает данные из родительской таблицы.
**Синтаксис**

```sql
SELECT <выражение списка столбцов> [GROUP BY] <выражение ключей группы> [ORDER BY] <expr>
```

Проекции могут быть изменены или удалены с помощью оператора [ALTER](/sql-reference/statements/alter/projection.md).
### Хранение проекций {#projection-storage}
Проекции хранятся внутри каталога частей. Это похоже на индекс, но содержит подкаталог, который хранит анонимную часть таблицы `MergeTree`. Таблица создается по запросу определения проекции. Если есть оператор `GROUP BY`, движок хранения становится [AggregatingMergeTree](aggregatingmergetree.md), и все агрегатные функции преобразуются в `AggregateFunction`. Если есть оператор `ORDER BY`, таблица `MergeTree` использует его как выражение первичного ключа. В процессе слияния часть проекции сливается через рутину слияния своего хранилища. Контрольная сумма части родительской таблицы комбинируется с частью проекции. Остальные работы по обслуживанию аналогичны индексам пропуска.
### Анализ запроса {#projection-query-analysis}
1. Проверьте, может ли проекция быть использована для ответа на данный запрос, то есть она генерирует тот же ответ, что и запрос базовой таблицы.
2. Выберите лучший подходящий вариант, который содержит наименьшее количество гранул для чтения.
3. Конвейер запроса, использующий проекции, будет отличаться от того, который использует исходные части. Если проекция отсутствует в некоторых частях, мы можем добавить конвейер для "проекции" ее на лету.
## Параллельный доступ к данным {#concurrent-data-access}

Для одновременного доступа к таблице мы используем многоверсионность. Другими словами, когда таблица одновременно читается и обновляется, данные читаются из набора частей, которые актуальны на момент выполнения запроса. Нет длительных блокировок. Вставки не мешают операциям чтения.

Чтение из таблицы автоматически параллелизуется.
## TTL для столбцов и таблиц {#table_engine-mergetree-ttl}

Определяет срок службы значений.

Клаузу `TTL` можно установить для всей таблицы и для каждого отдельного столбца. `TTL` на уровне таблицы также может указывать логику автоматического перемещения данных между дисками и томами, или перезаписи частей, когда все данные истекли.

Выражения должны быть оценены до типа данных [Date](/sql-reference/data-types/date.md) или [DateTime](/sql-reference/data-types/datetime.md).

**Синтаксис**

Установка срока действия для столбца:

```sql
TTL time_column
TTL time_column + interval
```

Чтобы определить `interval`, используйте [операторы временных интервалов](/sql-reference/operators#operators-for-working-with-dates-and-times), например:

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```
### TTL для столбца {#mergetree-column-ttl}

Когда значения в столбце истекают, ClickHouse заменяет их значениями по умолчанию для типа данных столбца. Если все значения столбца в части данных истекают, ClickHouse удаляет этот столбец из части данных в файловой системе.

Клаузу `TTL` нельзя использовать для ключевых столбцов.

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
### TTL для таблицы {#mergetree-table-ttl}

Таблица может иметь выражение для удаления истекших строк и несколько выражений для автоматического перемещения частей между [дисками или томами](#table_engine-mergetree-multiple-volumes). Когда строки в таблице истекают, ClickHouse удаляет все соответствующие строки. Для перемещения или перезаписи частей все строки части должны соответствовать критериям выражения `TTL`.

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

Тип правила TTL может следовать за каждым выражением TTL. Это влияет на действие, которое должно быть выполнено, когда выражение будет выполнено (достигнет текущего времени):

- `DELETE` - удаление истекших строк (действие по умолчанию);
- `RECOMPRESS codec_name` - перезапись части данных с `codec_name`;
- `TO DISK 'aaa'` - перемещение части на диск `aaa`;
- `TO VOLUME 'bbb'` - перемещение части на том `bbb`;
- `GROUP BY` - агрегирование истекших строк.

Действие `DELETE` может использоваться вместе с клаузой `WHERE`, чтобы удалить только некоторые из истекших строк на основе условия фильтрации:
```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

Выражение `GROUP BY` должно быть префиксом первичного ключа таблицы.

Если столбец не является частью выражения `GROUP BY` и не задан явно в клаузе `SET`, в результирующей строке он содержит случайное значение из сгруппированных строк (словно к нему применяется агрегатная функция `any`).

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

Создание таблицы, где строки истекают через месяц. Истекшие строки, где даты являются понедельниками, удаляются:

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
#### Создание таблицы, где истекшие строки перезаписываются: {#creating-a-table-where-expired-rows-are-recompressed}

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

Данные с истекшим `TTL` удаляются, когда ClickHouse сливает части данных.

Когда ClickHouse обнаруживает, что данные истекли, он выполняет несогласованное слияние. Чтобы контролировать частоту таких слияний, вы можете установить `merge_with_ttl_timeout`. Если значение слишком низкое, будет выполняться много несогласованных слияний, которые могут потреблять много ресурсов.

Если вы выполняете запрос `SELECT` между слиянием, вы можете получить истекшие данные. Чтобы избежать этого, используйте запрос [OPTIMIZE](/sql-reference/statements/optimize.md) перед `SELECT`.

**Смотрите также**

- [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts) настройка
## Типы дисков {#disk-types}

В дополнение к локальным блочным устройствам ClickHouse поддерживает следующие типы хранения:
- [`s3` для S3 и MinIO](#table_engine-mergetree-s3)
- [`gcs` для GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` для Azure Blob Storage](/operations/storing-data#azure-blob-storage)
- [`hdfs` для HDFS](/engines/table-engines/integrations/hdfs)
- [`web` для только чтения из сети](/operations/storing-data#web-storage)
- [`cache` для локального кэширования](/operations/storing-data#using-local-cache)
- [`s3_plain` для резервных копий в S3](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` для неизменяемых, неповторяемых таблиц в S3](/operations/storing-data.md#s3-plain-rewritable-storage)
## Использование нескольких блочных устройств для хранения данных {#table_engine-mergetree-multiple-volumes}
### Введение {#introduction}

Движки таблиц семейства `MergeTree` могут хранить данные на нескольких блочных устройствах. Например, это может быть полезно, когда данные определенной таблицы неявно разделены на "горячие" и "холодные". Самые последние данные запрашиваются регулярно, но требуют лишь небольшого объема пространства. Напротив, исторические данные с большими хвостами запрашиваются редко. Если доступно несколько дисков, "горячие" данные могут находиться на быстрых дисках (например, NVMe SSD или в памяти), в то время как "холодные" данные - на относительно медленных (например, HDD).

Часть данных является минимальной перемещаемой единицей для таблиц движка `MergeTree`. Данные, принадлежащие одной части, хранятся на одном диске. Части данных могут перемещаться между дисками в фоновом режиме (в соответствии с настройками пользователя), а также с помощью запросов [ALTER](/sql-reference/statements/alter/partition).
### Термины {#terms}

- Диск — блочное устройство, смонтированное в файловую систему.
- Диск по умолчанию — диск, который хранит путь, указанный в настройке сервера [path](/operations/server-configuration-parameters/settings.md/#path).
- Объем — упорядоченное множество одинаковых дисков (аналогично [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)).
- Политика хранения — набор объемов и правила перемещения данных между ними.

Названия, присвоенные описанным сущностям, можно найти в системных таблицах [system.storage_policies](/operations/system-tables/storage_policies) и [system.disks](/operations/system-tables/disks). Чтобы применить одну из сконфигурированных политик хранения к таблице, используйте настройку `storage_policy` для таблиц семейства движков `MergeTree`.
### Конфигурация {#table_engine-mergetree-multiple-volumes_configure}

Диски, объемы и политики хранения должны быть объявлены внутри тега `<storage_configuration>` в файле директории `config.d`.

:::tip
Диски также могут быть объявлены в разделе `SETTINGS` запроса. Это полезно
для разовых аналитических задач, чтобы временно прикрепить диск, который, например, размещен по URL.
Смотрите [динамическое хранилище](/operations/storing-data#dynamic-configuration) для получения дополнительных деталей.
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
- `path` — путь, по которому сервер будет хранить данные (папки `data` и `shadow`), должен оканчиваться на '/'.
- `keep_free_space_bytes` — количество свободного пространства на диске, которое необходимо зарезервировать.

Порядок определения дисков не важен.

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
                <!-- больше объемов -->
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
- `volume_name_N` — Имя объема. Имена объемов должны быть уникальными.
- `disk` — диск внутри объема.
- `max_data_part_size_bytes` — максимальный размер части, который может храниться на любом из дисков объема. Если ожидается, что размер объединенной части больше `max_data_part_size_bytes`, то эта часть будет записана в следующий объем. В основном, эта функция позволяет удерживать новые/маленькие части на горячем (SSD) объеме и перемещать их на холодный (HDD) объем, когда они достигают большого размера. Не используйте эту настройку, если ваша политика имеет только один объем.
- `move_factor` — когда количество доступного пространства становится ниже этого коэффициента, данные автоматически начинают перемещаться на следующий объем, если он есть (по умолчанию 0.1). ClickHouse сортирует существующие части по размеру от наибольшего к наименьшему (в порядке убывания) и выбирает части с общим размером, достаточным для удовлетворения условия `move_factor`. Если общий размер всех частей недостаточен, все части будут перемещены.
- `perform_ttl_move_on_insert` — отключает перемещение TTL при ВСТАВКЕ части данных. По умолчанию (если включено), если мы вставляем часть данных, которая уже истекла по правилу перемещения TTL, она мгновенно идет на объем/диск, указанный в правиле перемещения. Это может значительно замедлить вставку в случае, если целевой объем/диск медленный (например, S3). Если отключено, то истекшая часть данных записывается в объем по умолчанию, а затем сразу перемещается в объем TTL.
- `load_balancing` - Политика балансировки дисков, `round_robin` или `least_used`.
- `least_used_ttl_ms` - Настройка времени ожидания (в миллисекундах) для обновления доступного пространства на всех дисках (`0` - обновление всегда, `-1` - никогда не обновлять, по умолчанию 60000). Обратите внимание, если диск может быть использован только ClickHouse и не подлежит онлайн-изменению размера/уменьшению, вы можете использовать `-1`, в противном случае это не рекомендуется, так как в конечном итоге приведет к неправильному распределению пространства.
- `prefer_not_to_merge` — Вы не должны использовать эту настройку. Отключает слияние частей данных на этом объеме (это вредно и приводит к снижению производительности). Когда эта настройка включена (не делайте этого), слияние данных на этом объеме не допускается (что плохо). Это позволяет (но вам это не нужно) контролировать (если вы хотите контролировать что-то, вы делаете ошибку) то, как ClickHouse работает с медленными дисками (но ClickHouse знает лучше, поэтому, пожалуйста, не используйте эту настройку).
- `volume_priority` — Определяет приоритет (порядок), в котором заполняются объемы. Меньшее значение означает более высокий приоритет. Значения параметров должны быть натуральными числами и в совокупности покрывать диапазон от 1 до N (наименьший приоритет задан) без пропускания значений.
  * Если _все_ объемы помечены, они приоритизируются в заданном порядке.
  * Если помечены только _некоторые_ объемы, те, что без метки, имеют наименьший приоритет, и они приоритизируются в порядке их определения в конфигурации.
  * Если _ни один_ объем не помечен, их приоритет устанавливается соответственно их порядку, в котором они объявлены в конфигурации.
  * Два объема не могут иметь одно и то же значение приоритета.

Примеры конфигурации:

```xml
<storage_configuration>
    ...
    <policies>
        <hdd_in_order> <!-- имя политики -->
            <volumes>
                <single> <!-- имя объема -->
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

В данном примере политика `hdd_in_order` реализует подход [round-robin](https://en.wikipedia.org/wiki/Round-robin_scheduling). Таким образом, эта политика определяет только один объем (`single`), части данных хранятся на всех его дисках круговым образом. Такая политика может быть весьма полезна, если в системе смонтированы несколько аналогичных дисков, но RAID не настроен. Имейте в виду, что каждый отдельный накопитель не надежен, и вы можете захотеть компенсировать это фактором репликации 3 или более.

Если в системе доступны разные виды дисков, можно использовать политику `moving_from_ssd_to_hdd`. Объем `hot` состоит из SSD диска (`fast_ssd`), и максимальный размер части, который может храниться на этом объеме, составляет 1 ГБ. Все части размером более 1 ГБ будут храниться непосредственно на холодном объеме, который содержит HDD диск `disk1`.
Кроме того, как только диск `fast_ssd` заполнится более чем на 80%, данные будут переданы на диск `disk1` фоновым процессом.

Порядок перечисления объемов внутри политики хранения важен в том случае, если хотя бы один из перечисленных объемов не имеет явного параметра `volume_priority`.
Как только объем переполняется, данные перемещаются к следующему. Порядок перечисления дисков также важен, так как данные хранятся на них по очереди.

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

Политика хранения по умолчанию подразумевает использование только одного объема, который состоит только из одного диска, указанного в `<path>`.
Вы можете изменить политику хранения после создания таблицы с помощью запроса [ALTER TABLE ... MODIFY SETTING], новая политика должна включать все старые диски и объемы с теми же именами.

Количество потоков, выполняющих фоновые перемещения частей данных, может быть изменено с помощью настройки [background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size).
### Подробности {#details}

В случае таблиц `MergeTree` данные попадают на диск различными способами:

- В результате вставки (`INSERT` запрос).
- Во время фоновых слияний и [мутаций](/sql-reference/statements/alter#mutations).
- При загрузке из другой реплики.
- В результате заморозки раздела [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition).

Во всех этих случаях, кроме мутаций и заморозки раздела, часть хранится на объеме и диске в соответствии с заданной политикой хранения:

1. Выбирается первый объем (в порядке определения), который имеет достаточное место на диске для хранения части (`unreserved_space > current_part_size`) и позволяет хранить части данного размера (`max_data_part_size_bytes > current_part_size`).
2. Внутри этого объема выбирается диск, который следует за тем диском, который использовался для хранения предыдущей порции данных, и на котором есть свободное пространство больше размера части (`unreserved_space - keep_free_space_bytes > current_part_size`).

В фоновом режиме мутации и заморозка раздела используют [жесткие ссылки](https://en.wikipedia.org/wiki/Hard_link). Жесткие ссылки между различными дисками не поддерживаются, поэтому в таких случаях итоговые части хранятся на тех же дисках, что и начальные.

В фоновом режиме части перемещаются между объемами на основе объема свободного места (`параметр move_factor`) в соответствии с порядком, в котором объемы объявлены в конфигурационном файле.
Данные никогда не передаются с последнего на первый. Можно использовать системные таблицы [system.part_log](/operations/system-tables/part_log) (поле `type = MOVE_PART`) и [system.parts](/operations/system-tables/parts.md) (поля `path` и `disk`), чтобы контролировать фоновые перемещения. Кроме того, подробную информацию можно найти в логах сервера.

Пользователь может принудительно переместить часть или раздел с одного объема на другой, используя запрос [ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition), при этом все ограничения фоновых операций учитываются. Запрос инициирует перемещение и не ожидает завершения фоновых операций. Пользователь получит сообщение об ошибке, если не хватает свободного места или если не выполнены какие-либо из необходимых условий.

Перемещение данных не мешает репликации данных. Поэтому для одной и той же таблицы на разных репликах можно указать разные политики хранения.

После завершения фоновых слияний и мутаций старые части удаляются только по истечении определенного времени (`old_parts_lifetime`).
В течение этого времени они не перемещаются на другие объемы или диски. Поэтому до окончательного удаления части они по-прежнему учитываются при оценке занятого дискового пространства.

Пользователь может назначить новые большие части для различных дисков объема [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) сбалансированным образом с помощью настройки [min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min-bytes-to-rebalance-partition-over-jbod).
```
## Использование внешнего хранилища для хранения данных {#table_engine-mergetree-s3}

[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) семейство движков таблиц может хранить данные в `S3`, `AzureBlobStorage`, `HDFS` с использованием диска с типами `s3`, `azure_blob_storage`, `hdfs` соответственно. Смотрите [настройка параметров внешнего хранилища](/operations/storing-data.md/#configuring-external-storage) для получения дополнительных сведений.

Пример для [S3](https://aws.amazon.com/s3/) в качестве внешнего хранилища с использованием диска с типом `s3`.

Разметка конфигурации:
```xml
<storage_configuration>
    ...
    <disks>
        <s3>
            <type>s3</type>
            <support_batch_delete>true</support_batch_delete>
            <endpoint>https://clickhouse-public-datasets.s3.amazonaws.com/my-bucket/root-path/</endpoint>
            <access_key_id>ваш_access_key_id</access_key_id>
            <secret_access_key>ваш_secret_access_key</secret_access_key>
            <region></region>
            <header>Authorization: Bearer SOME-TOKEN</header>
            <server_side_encryption_customer_key_base64>ваш_base64_кодированный_ключ_клиента</server_side_encryption_customer_key_base64>
            <server_side_encryption_kms_key_id>ваш_kms_key_id</server_side_encryption_kms_key_id>
            <server_side_encryption_kms_encryption_context>ваш_kms_encryption_context</server_side_encryption_kms_encryption_context>
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

Смотрите также [настройка параметров внешнего хранилища](/operations/storing-data.md/#configuring-external-storage).

:::note конфигурация кэша
Версии ClickHouse 22.3 по 22.7 используют другую конфигурацию кэша, смотрите [использование локального кэша](/operations/storing-data.md/#using-local-cache), если вы используете одну из этих версий.
:::
## Виртуальные столбцы {#virtual-columns}

- `_part` — Название части.
- `_part_index` — Последовательный индекс части в результате запроса.
- `_partition_id` — Название раздела.
- `_part_uuid` — Уникальный идентификатор части (если включена настройка MergeTree `assign_part_uuids`).
- `_partition_value` — Значения (кортеж) выражения `partition by`.
- `_sample_factor` — Фактор выборки (из запроса).
- `_block_number` — Номер блока строки, он сохраняется при слияниях, когда `allow_experimental_block_number_column` установлено в true.
## Статистика столбцов {#column-statistics}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Объявление статистики находится в разделе столбцов запроса `CREATE` для таблиц из семейства `*MergeTree*`, когда мы включаем `set allow_experimental_statistics = 1`.

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

Эти легковесные статистики агрегируют информацию о распределении значений в столбцах. Статистика хранится в каждой части и обновляется при каждой вставке.
Они могут использоваться для оптимизации prewhere только если мы включаем `set allow_statistics_optimize = 1`.
### Доступные типы статистики столбцов {#available-types-of-column-statistics}

- `MinMax`

    Минимальное и максимальное значение столбца, что позволяет оценить селективность диапазонных фильтров для числовых столбцов.

    Синтаксис: `minmax`

- `TDigest`

    [TDigest](https://github.com/tdunning/t-digest) схемы, которые позволяют вычислять приблизительные перцентили (например, 90-й перцентиль) для числовых столбцов.

    Синтаксис: `tdigest`

- `Uniq`

    [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) схемы, которые предоставляют оценку количества различных значений в столбце.

    Синтаксис: `uniq`

- `CountMin`

    [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch) схемы, которые предоставляют приблизительное количество частоты каждого значения в столбце.

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
|-----------|-------------------------|------------------------------------|
| CountMin  | ✔                       | ✗                                  |
| MinMax    | ✗                       | ✔                                  |
| TDigest   | ✗                       | ✔                                  |
| Uniq      | ✔                       | ✗                                  |
## Настройки на уровне столбцов {#column-level-settings}

Некоторые настройки MergeTree могут быть переопределены на уровне столбца:

- `max_compress_block_size` — Максимальный размер блоков несжатых данных перед сжатием для записи в таблицу.
- `min_compress_block_size` — Минимальный размер блоков несжатых данных, необходимых для сжатия при записи следующей метки.

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

Настройки на уровне столбцов можно изменять или удалять с помощью [ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md), например:

- Удалить `SETTINGS` из декларации столбца:

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- Изменить настройку:

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- Сбросить одну или несколько настроек, также удаляет декларацию настройки в выражении столбца запроса CREATE таблицы.

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
