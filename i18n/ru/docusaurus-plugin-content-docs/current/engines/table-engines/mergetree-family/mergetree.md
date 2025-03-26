---
description: 'Табличные движки семейства `MergeTree` предназначены для высокой скорости прием данных и обработки огромных объемов данных.'
sidebar_label: 'MergeTree'
sidebar_position: 11
slug: /engines/table-engines/mergetree-family/mergetree
title: 'MergeTree'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# MergeTree

Движок `MergeTree` и другие движки семейства `MergeTree` (например, `ReplacingMergeTree`, `AggregatingMergeTree`) являются самыми часто используемыми и надежными табличными движками в ClickHouse.

Табличные движки семейства `MergeTree` предназначены для высокой скорости прием данных и обработки огромных объемов данных. Операции вставки создают части таблиц, которые сливаются фоновым процессом с другими частями таблиц.

Основные особенности табличных движков семейства `MergeTree`:

- Первичный ключ таблицы определяет порядок сортировки внутри каждой части таблицы (кластерный индекс). Первичный ключ также не ссылается на отдельные строки, но на блоки из 8192 строк, называемые гранулами. Это делает первичные ключи огромных наборов данных достаточно маленькими, чтобы оставаться загруженными в основной памяти, при этом обеспечивая быстрый доступ к данным на диске.

- Таблицы могут быть разделены на разделы, используя произвольное выражение раздела. Оптимизация разделов позволяет исключить их из чтения, если это позволяет запрос.

- Данные могут реплицироваться между несколькими узлами кластера для высокой доступности, отказоустойчивости и безотказных обновлений. Смотрите [Репликация данных](/engines/table-engines/mergetree-family/replication.md).

- Движки таблиц `MergeTree` поддерживают различные виды статистики и методы выборки, чтобы помочь в оптимизации запросов.

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
    PROJECTION projection_name_1 (SELECT &lt;COLUMN LIST EXPR&gt; [GROUP BY] [ORDER BY]),
    PROJECTION projection_name_2 (SELECT &lt;COLUMN LIST EXPR&gt; [GROUP BY] [ORDER BY])
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

Для детального описания параметров смотрите оператор [CREATE TABLE](/sql-reference/statements/create/table.md).
### Части запроса {#mergetree-query-clauses}
#### ENGINE {#engine}

`ENGINE` — Название и параметры движка. `ENGINE = MergeTree()`. Движок `MergeTree` не имеет параметров.
#### ORDER_BY {#order_by}

`ORDER BY` — Ключ сортировки.

Кортеж имен столбцов или произвольных выражений. Пример: `ORDER BY (CounterID + 1, EventDate)`.

Если не определен первичный ключ (`PRIMARY KEY` не указан), ClickHouse использует ключ сортировки в качестве первичного ключа.

Если сортировка не требуется, можно использовать синтаксис `ORDER BY tuple()`. Альтернативно, если установлена настройка `create_table_empty_primary_key_by_default`, `ORDER BY tuple()` добавляется неявно в операторы `CREATE TABLE`. Смотрите [Выбор первичного ключа](#selecting-a-primary-key).
#### PARTITION BY {#partition-by}

`PARTITION BY` — [Ключ партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key.md). Необязательно. В большинстве случаев, ключ партиционирования не нужен, и если требуется разбиение на разделы, обычно не нужен ключ партиционирования более подробный, чем по месяцам. Партиционирование не ускоряет запросы (в отличие от выражения ORDER BY). Не используйте слишком детализированное партиционирование. Не следует разбирать данные по идентификаторам или именам клиентов (лучше сделайте идентификатор или имя клиента первым столбцом в выражении ORDER BY).

Для партиционирования по месяцам используйте выражение `toYYYYMM(date_column)`, где `date_column` — столбец с датой типа [Date](/sql-reference/data-types/date.md). Имена секций здесь имеют формат `"YYYYMM"`.
#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — Первичный ключ, если он [отличается от ключа сортировки](#choosing-a-primary-key-that-differs-from-the-sorting-key). Необязательно.

Указание ключа сортировки (используя оператор `ORDER BY`) неявно задаёт первичный ключ. Обычно нет необходимости задавать первичный ключ вдобавок к ключу сортировки.
#### SAMPLE BY {#sample-by}

`SAMPLE BY` — Выражение для выборки. Необязательно.

Если указано, оно должно содержаться в первичном ключе. Выражение выборки должно возвращать беззнаковое целое число.

Пример: `SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`.
####  TTL {#ttl}

`TTL` — Список правил, которые задают срок хранения строк и логику автоматического перемещения частей [между дисками и томами](#table_engine-mergetree-multiple-volumes). Необязательно.

Выражение должно возвращать `Date` или `DateTime`, например `TTL date + INTERVAL 1 DAY`.

Тип правила `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY` указывает действие, которое будет выполнено с частью, если выражение выполнено (достигает текущего времени): удаление устаревших строк, перемещение части (если выражение удовлетворено для всех строк в части) на указанный диск (`TO DISK 'xxx'`) или в том (`TO VOLUME 'xxx'`), или агрегация значений в устаревших строках. Тип правила по умолчанию — удаление (`DELETE`). Возможен список из нескольких правил, но не должно быть более одного правила `DELETE`.

Для получения более подробной информации смотрите [TTL для столбцов и таблиц](#table_engine-mergetree-ttl).
#### SETTINGS {#settings}

Смотрите [Настройки MergeTree](../../../operations/settings/merge-tree-settings.md).

**Пример настройки секций**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

В примере мы устанавливаем партиционирование по месяцу.

Мы также задаем выражение для выборки как хеш по ID пользователя. Это позволяет псевдослучайно распределить данные в таблице для каждого `CounterID` и `EventDate`. Если вы определяете предложение [SAMPLE](/sql-reference/statements/select/sample) при выборе данных, ClickHouse вернет равномерно псевдослучайную выборку данных для подмножества пользователей.

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

Движок `MergeTree` настраивается таким же образом, как в примере выше для основного метода конфигурации движка.
</details>
## Хранение данных {#mergetree-data-storage}

Таблица состоит из частей данных, отсортированных по первичному ключу.

Когда данные вставляются в таблицу, создаются отдельные части данных, и каждая из них лексикографически отсортирована по первичному ключу. Например, если первичный ключ — это `(CounterID, Date)`, данные в части отсортированы по `CounterID`, а внутри каждого `CounterID` они отсортированы по `Date`.

Данные, принадлежащие различным разделам, разделяются на разные части. В фоновом режиме ClickHouse сливает части данных для более эффективного хранения. Части, принадлежащие различным разделам, не сливаются. Механизм слияния не гарантирует, что все строки с одинаковым первичным ключом будут находиться в одной части данных.

Части данных могут храниться в формате `Wide` или `Compact`. В формате `Wide` каждый столбец хранится в отдельном файле в файловой системе, в формате `Compact` все столбцы хранятся в одном файле. Формат `Compact` можно использовать для повышения производительности маленьких и частых вставок.

Формат хранения данных контролируется настройками `min_bytes_for_wide_part` и `min_rows_for_wide_part` движка таблицы. Если количество байтов или строк в части данных меньше значения соответствующей настройки, то часть хранится в формате `Compact`. В противном случае она хранится в формате `Wide`. Если ни одна из этих настроек не установлена, части данных хранятся в формате `Wide`.

Каждая часть данных логически делится на гранулы. Гранула — это наименьший неделимый набор данных, который ClickHouse читает при выборе данных. ClickHouse не делит строки или значения, поэтому каждая гранула всегда содержит целое количество строк. Первая строка гранулы помечена значением первичного ключа для строки. Для каждой части данных ClickHouse создает файл индекса, который хранит метки. Для каждого столбца, вне зависимости от того, находится он в первичном ключе или нет, ClickHouse также хранит те же метки. Эти метки позволяют находить данные напрямую в файлах столбцов.

Размер гранулы ограничен настройками `index_granularity` и `index_granularity_bytes` движка таблицы. Количество строк в грануле лежит в диапазоне `[1, index_granularity]`, в зависимости от размера строк. Размер гранулы может превышать `index_granularity_bytes`, если размер одной строки больше значения настройки. В этом случае размер гранулы равен размеру строки.
## Первичные ключи и индексы в запросах {#primary-keys-and-indexes-in-queries}

Возьмем для примера первичный ключ `(CounterID, Date)`. В этом случае сортировка и индекс могут быть проиллюстрированы следующим образом:

```text
Все данные:    [---------------------------------------------]
CounterID:     [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:          [1111111222222233331233211111222222333211111112122222223111112223311122333]
Метки:          |      |      |      |      |      |      |      |      |      |      |
               a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Номера меток:   0      1      2      3      4      5      6      7      8      9      10
```

Если в запросе к данным указано:

- `CounterID in ('a', 'h')`, сервер читает данные в диапазоне меток `[0, 3)` и `[6, 8)`.
- `CounterID IN ('a', 'h') AND Date = 3`, сервер читает данные в диапазоне меток `[1, 3)` и `[7, 8)`.
- `Date = 3`, сервер читает данные в диапазоне меток `[1, 10]`.

Приведенные выше примеры показывают, что использование индекса всегда более эффективно, чем полный скан.

Разреженный индекс позволяет читать дополнительные данные. При чтении одного диапазона первичного ключа до `index_granularity * 2` дополнительных строк в каждом блоке данных могут быть прочитаны.

Разреженные индексы позволяют работать с очень большим количеством строк таблиц, потому что в большинстве случаев такие индексы помещаются в оперативной памяти компьютера.

ClickHouse не требует уникального первичного ключа. Вы можете вставить несколько строк с одинаковым первичным ключом.

Вы можете использовать выражения типа `Nullable` в предложениях `PRIMARY KEY` и `ORDER BY`, но это крайне не рекомендуется. Чтобы разрешить эту функцию, активируйте настройку [allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key). Для значений `NULL` в предложении `ORDER BY` применяется принцип [NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values).
### Выбор первичного ключа {#selecting-a-primary-key}

Количество столбцов в первичном ключе не ограничено явным образом. В зависимости от структуры данных вы можете включать больше или меньше столбцов в первичный ключ. Это может:

- Улучшить производительность индекса.

    Если первичный ключ — это `(a, b)`, то добавление другого столбца `c` улучшит производительность, если выполнены следующие условия:

    - Есть запросы с условием по столбцу `c`.
    - Длинные участки данных (в несколько раз длиннее `index_granularity`) с идентичными значениями для `(a, b)` являются распространёнными. Другими словами, когда добавление другого столбца позволяет пропустить довольно длинные участки данных.

- Улучшить сжатие данных.

    ClickHouse сортирует данные по первичному ключу, поэтому чем выше согласованность, тем лучше сжатие.

- Обеспечить дополнительную логику при объединении частей данных в движках [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) и [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md).

    В этом случае имеет смысл указать *ключ сортировки*, отличный от первичного ключа.

Длинный первичный ключ негативно влияет на производительность вставки и потребление памяти, но дополнительные столбцы в первичном ключе не влияют на производительность ClickHouse при запросах `SELECT`.

Вы можете создать таблицу без первичного ключа, используя синтаксис `ORDER BY tuple()`. В этом случае ClickHouse хранит данные в порядке вставки. Если вы хотите сохранить порядок данных при вставке данных с помощью запросов `INSERT ... SELECT`, установите [max_insert_threads = 1](/operations/settings/settings#max_insert_threads).

Чтобы выбрать данные в начальном порядке, используйте [одно-поточные](/operations/settings/settings.md/#max_threads) запросы `SELECT`.
### Выбор первичного ключа, отличного от ключа сортировки {#choosing-a-primary-key-that-differs-from-the-sorting-key}

Возможно указать первичный ключ (выражение со значениями, которые записываются в файл индекса для каждой метки), отличный от ключа сортировки (выражение для сортировки строк в частях данных). В этом случае выражение первичного ключа должно быть префиксом выражения ключа сортировки.

Эта функция полезна при использовании движков таблиц [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) и
[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md). В общем случае при использовании этих движков таблица имеет два типа столбцов: *измерения* и *измеряемые величины*. Типичные запросы агрегируют значения измеряемых столбцов с произвольными выражениями `GROUP BY` и фильтрацией по измерениям. Поскольку SummingMergeTree и AggregatingMergeTree агрегируют строки с одинаковым значением ключа сортировки, логично добавить все измерения в него. В результате выражение ключа состоит из длинного списка столбцов, и этот список часто нужно обновлять с добавлением новых измерений.

В этом случае имеет смысл оставить только несколько столбцов в первичном ключе, которые обеспечат эффективные диапазонные сканы, и добавить оставшиеся столбцы измерений в кортеж ключа сортировки.

[ALTER](/sql-reference/statements/alter/index.md) ключа сортировки — это легковесная операция, поскольку при одновременном добавлении нового столбца в таблицу и в ключ сортировки, существующие части данных не требуется изменять. Поскольку старый ключ сортировки является префиксом нового ключа сортировки и в недавно добавленном столбце нет данных, на момент изменения таблицы данные отсортированы как по старому, так и по новому ключам сортировки.
### Использование индексов и разделов в запросах {#use-of-indexes-and-partitions-in-queries}

Для запросов `SELECT` ClickHouse анализирует, может ли быть использован индекс. Индекс может быть использован, если в условии `WHERE/PREWHERE` есть выражение (как один из элементов конъюнкции или полностью), представляющее операцию сравнения на равенство или неравенство, или если оно содержит `IN` или `LIKE` с фиксированным префиксом по столбцам или выражениям, которые находятся в первичном ключе или ключе партиционирования, или по некоторым частично повторяющимся функциям этих столбцов, или логические отношения этих выражений.

Таким образом, возможно быстро выполнять запросы на одном или многих диапазонах первичного ключа. В этом примере запросы будут быстрыми, если они выполняются для определенного трекера тегов, для определенного тега и диапазона дат, для определенного тега и даты, для нескольких тегов с диапазоном дат и так далее.

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

ClickHouse будет использовать первичный ключевой индекс для обрезки неподходящих данных и ключ партиционирования по месяцам для обрезки разделов, которые находятся в неправильных диапазонах дат.

Приведенные выше запросы показывают, что индекс используется даже для сложных выражений. Чтение из таблицы организовано так, что использование индекса не может быть медленнее полного сканирования.

В нижеприведенном примере индекс не может быть использован.

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

Чтобы проверить, может ли ClickHouse использовать индекс при выполнении запроса, используйте настройки [force_index_by_date](/operations/settings/settings.md/#force_index_by_date) и [force_primary_key](/operations/settings/settings#force_primary_key).

Ключ для партиционирования по месяцам позволяет читать только те блоки данных, которые содержат даты из нужного диапазона. В этом случае блок данных может содержать данные за многие даты (до целого месяца). Внутри блока данные отсортированы по первичному ключу, который может не содержать дату в качестве первого столбца. Из-за этого использование запроса только с условием по дате, которое не указывает префикс первичного ключа, приведет к чтению большего объема данных, чем за одну дату.
### Использование индекса для частично-монотонных первичных ключей {#use-of-index-for-partially-monotonic-primary-keys}

Рассмотрим, например, дни месяца. Они образуют [монотонную последовательность](https://en.wikipedia.org/wiki/Monotonic_function) для одного месяца, но не монотонную для более длительных периодов. Это частично-монотонная последовательность. Если пользователь создает таблицу с частично-монотонным первичным ключом, ClickHouse создает разреженный индекс, как обычно. Когда пользователь выбирает данные из такой таблицы, ClickHouse анализирует условия запроса. Если пользователь хочет получить данные между двумя метками индекса и оба эти метки попадают в пределах одного месяца, ClickHouse может использовать индекс в этом конкретном случае, поскольку он может вычислить расстояние между параметрами запроса и метками индекса.

ClickHouse не может использовать индекс, если значения первичного ключа в диапазоне параметров запроса не представляют монотонную последовательность. В этом случае ClickHouse использует метод полного сканирования.

ClickHouse использует эту логику не только для последовательностей дней месяца, но и для любого первичного ключа, который представляет частично-монотонную последовательность.
### Индексы пропуска данных {#table_engine-mergetree-data_skipping-indexes}

Объявление индекса находится в разделе столбцов `CREATE` запроса.

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

Для таблиц из семейства `*MergeTree` могут быть указаны индексы пропуска данных.

Эти индексы агрегируют некоторую информацию о заданном выражении на блоках, которые состоят из `granularity_value` гранул (размер гранулы указан с помощью настройки `index_granularity` в движке таблицы). Затем эти агрегаты используются в `SELECT` запросах для сокращения объема данных, которые нужно прочитать с диска, пропуская большие блоки данных, где запрос `where` не может быть удовлетворен.

Оператор `GRANULARITY` может быть опущен, значение по умолчанию для `granularity_value` равно 1.

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

Индексы из примера могут быть использованы ClickHouse для сокращения объема данных, читаемого с диска, в следующих запросах:

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
### Доступные типы индексов {#available-types-of-indices}
#### MinMax {#minmax}

Хранит экстремумы заданного выражения (если выражение — `tuple`, то хранятся экстремумы для каждого элемента `tuple`), использует сохраненную информацию для пропуска блоков данных, как первичный ключ.

Синтаксис: `minmax`
#### Set {#set}

Хранит уникальные значения заданного выражения (не более `max_rows` строк, `max_rows=0` означает "без ограничений"). Использует значения для проверки невозможности выполнения выражения `WHERE` на блоке данных.

Синтаксис: `set(max_rows)`
#### Фильтр Блума {#bloom-filter}

Хранит [фильтр Блума](https://en.wikipedia.org/wiki/Bloom_filter) для заданных столбцов. Параметр `false_positive` с возможными значениями от 0 до 1 указывает вероятность получения ложноположительного ответа от фильтра. Значение по умолчанию: 0.025. Поддерживаемые типы данных: `Int*`, `UInt*`, `Float*`, `Enum`, `Date`, `DateTime`, `String`, `FixedString`, `Array`, `LowCardinality`, `Nullable`, `UUID` и `Map`. Для типа данных `Map` клиент может указать, следует ли создавать индекс для ключей или значений, используя функции [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) или [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues).

Синтаксис: `bloom_filter([false_positive])`
#### N-граммный фильтр Блума {#n-gram-bloom-filter}

Хранит [фильтр Блума](https://en.wikipedia.org/wiki/Bloom_filter), который содержит все n-граммы из блока данных. Работает только с типами данных: [String](/sql-reference/data-types/string.md), [FixedString](/sql-reference/data-types/fixedstring.md) и [Map](/sql-reference/data-types/map.md). Может быть использован для оптимизации выражений `EQUALS`, `LIKE` и `IN`.

Синтаксис: `ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`

- `n` — размер n-грамы,
- `size_of_bloom_filter_in_bytes` — размер фильтра Блума в байтах (можно использовать большие значения, например, 256 или 512, поскольку они хорошо сжимаются).
- `number_of_hash_functions` — количество хеш-функций, используемых в фильтре Блума.
- `random_seed` — семя для хеш-функций фильтра Блума.

Пользователи могут создавать [UDF](/sql-reference/statements/create/function.md) для оценки параметров набора `ngrambf_v1`. Запросы следующие:

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
Чтобы использовать эти функции, нужно указать как минимум два параметра.
Например, если в грануле 4300 n-грамм, и мы ожидаем ложноположительных результатов меньше, чем 0.0001. Другие параметры могут быть оценены путем выполнения следующих запросов:


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
Функции ссылаются на содержание [здесь](https://hur.st/bloomfilter).
#### Токенный фильтр Блума {#token-bloom-filter}

То же самое, что и `ngrambf_v1`, но хранит токены вместо n-грамм. Токены — это последовательности, разделенные неалфавитно-цифровыми символами.

Синтаксис: `tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`
#### Специальные {#special-purpose}

- Экспериментальный индекс для поддержки аппроксимированного поиска ближайших соседей. Подробности смотрите [здесь](annindexes.md).
- Экспериментальный полнотекстовый индекс для поддержки полнотекстового поиска. Подробности смотрите [здесь](invertedindexes.md).
### Поддержка функций {#functions-support}

Условия в `WHERE` содержат вызовы функций, которые работают со столбцами. Если столбец является частью индекса, ClickHouse пытается использовать этот индекс при выполнении функций. ClickHouse поддерживает различные подмножества функций для использования индексов.

Индексы типа `set` можно использовать во всех функциях. Другие типы индексов поддерживаются следующим образом:

| Функция (оператор) / Индекс                                                                                | первичный ключ | minmax | ngrambf_v1 | tokenbf_v1 | bloom_filter | full_text |
|------------------------------------------------------------------------------------------------------------|----------------|--------|------------|------------|--------------|-----------|
| [equals (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                         | ✔              | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notequals)             | ✔              | ✔      | ✔          | ✔          | ✔            | ✔         |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                  | ✔              | ✔      | ✔          | ✔          | ✗            | ✔         |
| [notLike](/sql-reference/functions/string-search-functions.md/#notlike)                            | ✔              | ✔      | ✔          | ✔          | ✗            | ✔         |
| [matches](/sql-reference/functions/string-search-functions.md/#match)                                | ✗              | ✗      | ✔          | ✔          | ✗            | ✔         |
| [startsWith](/sql-reference/functions/string-functions.md/#startswith)                             | ✔              | ✔      | ✔          | ✔          | ✗            | ✔         |
| [endsWith](/sql-reference/functions/string-functions.md/#endswith)                                 | ✗              | ✗      | ✔          | ✔          | ✗            | ✔         |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multisearchany)              | ✗              | ✗      | ✔          | ✗          | ✗            | ✔         |
| [in](/sql-reference/functions/in-functions)                                                        | ✔              | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notIn](/sql-reference/functions/in-functions)                                                     | ✔              | ✔      | ✔          | ✔          | ✔            | ✔         |
| [less (`<`)](/sql-reference/functions/comparison-functions.md/#less)                                 | ✔              | ✔      | ✗          | ✗          | ✗            | ✗         |
| [greater (`>`)](/sql-reference/functions/comparison-functions.md/#greater)                           | ✔              | ✔      | ✗          | ✗          | ✗            | ✗         |
| [lessOrEquals (`<=`)](/sql-reference/functions/comparison-functions.md/#lessorequals)                | ✔              | ✔      | ✗          | ✗          | ✗            | ✗         |
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

(*) Для эффективной работы `hasTokenCaseInsensitive` и `hasTokenCaseInsensitiveOrNull`, индекс `tokenbf_v1` должен быть создан на нижнем регистре данных, например `INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`.

:::note
Фильтры Блума могут иметь ложные срабатывания, поэтому индексы `ngrambf_v1`, `tokenbf_v1` и `bloom_filter` не могут быть использованы для оптимизации запросов, где ожидается, что результат функции будет ложным.

Пример:

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

Проекции аналогичны [материализованным представлениям](/sql-reference/statements/create/view), но определяются на уровне частей. Они обеспечивают гарантию согласованности наряду с автоматическим использованием в запросах.

:::note
При реализации проекций следует также учитывать настройку [force_optimize_projection](/operations/settings/settings#force_optimize_projection).
:::

Проекции не поддерживаются в `SELECT` с модификатором [FINAL](/sql-reference/statements/select/from#final-modifier).

### Запрос проекции {#projection-query}

Запрос проекции определяет проекцию. Он неявно выбирает данные из родительской таблицы.
**Синтаксис**

```sql
SELECT <column list expr> [GROUP BY] <group keys expr> [ORDER BY] <expr>
```

Проекции можно модифицировать или удалять с помощью оператора [ALTER](/sql-reference/statements/alter/projection.md).

### Хранение проекций {#projection-storage}

Проекции хранятся внутри директории частей. Это похоже на индекс, но содержит поддиректорию, в которой хранится часть анонимной таблицы `MergeTree`. Таблица определяется запросом на определение проекции. Если есть предложение `GROUP BY`, базовый движок хранения становится [AggregatingMergeTree](aggregatingmergetree.md), и все агрегатные функции преобразуются в `AggregateFunction`. Если есть предложение `ORDER BY`, таблица `MergeTree` использует его как выражение первичного ключа. В процессе слияния часть проекции сливается через своё собственное правило слияния в хранилище. Контрольная сумма части родительской таблицы комбинируется с частью проекции. Другие задачи техобслуживания подобны пропускающим индексам.

### Анализ запроса {#projection-query-analysis}

1. Проверка, может ли проекция быть использована для ответа на данный запрос, т. е. генерирует ли она тот же ответ, что и запрос к базовой таблице.
2. Выбор наилучшего подходящего совпадения, которое содержит наименьшее количество гранул для чтения.
3. Конвейер данных запроса, использующий проекции, отличается от того, который использует оригинальные части. Если проекция отсутствует в некоторых частях, мы можем добавить конвейер, чтобы "спроектировать" её на лету.

## Конкурентный доступ к данным {#concurrent-data-access}

Для конкурентного доступа к таблице мы используем многоверсионность. Иными словами, когда таблица одновременно читается и обновляется, данные читаются из набора частей, актуальных на момент запроса. Длительные блокировки отсутствуют. Вставки не мешают операциям чтения.

Чтение из таблицы автоматизировано и параллелизировано.

## TTL для столбцов и таблиц {#table_engine-mergetree-ttl}

Определяет время жизни значений.

Оператор `TTL` может быть установлен для всей таблицы и для каждого отдельного столбца. Уровневый `TTL` таблицы также может определять логику автоматического перемещения данных между дисками и томами или повторного сжатия частей, в которых все данные просрочены.

Выражения должны вычисляться в типм данных [Date](/sql-reference/data-types/date.md) или [DateTime](/sql-reference/data-types/datetime.md).

**Синтаксис**

Установка времени жизни для столбца:

```sql
TTL time_column
TTL time_column + interval
```

Для определения `interval` используйте операторы [временного интервала](/sql-reference/operators#operators-for-working-with-dates-and-times), например:

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```

### TTL столбца {#mergetree-column-ttl}

Когда значения в столбце истекают, ClickHouse заменяет их на значения по умолчанию для типа данных столбца. Если все значения столбца в части данных истекли, ClickHouse удаляет этот столбец из части данных в файловой системе.

Оператор `TTL` не может использоваться для ключевых столбцов.

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
#### Добавление TTL в столбец существующей таблицы {#adding-ttl-to-a-column-of-an-existing-table}

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

Таблица может иметь выражение для удаления просроченных строк и несколько выражений для автоматического перемещения частей между [дисками или томами](#table_engine-mergetree-multiple-volumes). Когда строки в таблице истекают, ClickHouse удаляет все соответствующие строки. Для перемещения или повторного сжатия частей все строки части должны удовлетворять критериям выражения `TTL`.

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

Тип правила TTL может следовать за каждым выражением TTL. Он определяет действие, которое должно быть выполнено после достижения выражения (текущего времени):

- `DELETE` - удалить просроченные строки (действие по умолчанию);
- `RECOMPRESS codec_name` - повторно сжать часть данных с помощью `codec_name`;
- `TO DISK 'aaa'` - переместить часть на диск `aaa`;
- `TO VOLUME 'bbb'` - переместить часть на том `bbb`;
- `GROUP BY` - агрегировать просроченные строки.

Действие `DELETE` можно использовать вместе с предложением `WHERE`, чтобы удалить только некоторые из просроченных строк на основе условия фильтрации:
```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

Выражение `GROUP BY` должно быть префиксом первичного ключа таблицы.

Если столбец не является частью выражения `GROUP BY` и не задан явно в предложении `SET`, в результирующей строке он содержит случайное значение из сгруппированных строк (как если бы к нему применена агрегатная функция `any`).

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

Создание таблицы, где строки истекают через один месяц. Просроченные строки, где даты понедельники, удаляются:

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
#### Создание таблицы, где просроченные строки перепаковываются: {#creating-a-table-where-expired-rows-are-recompressed}

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

Создание таблицы, где просроченные строки агрегируются. В результирующих строках `x` содержит максимальное значение среди сгруппированных строк, `y` — минимальное значение, а `d` — любое случайное значение из сгруппированных строк.

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
### Удаление просроченных данных {#mergetree-removing-expired-data}

Данные с истёкшим `TTL` удаляются, когда ClickHouse объединяет части данных.

Когда ClickHouse обнаруживает, что данные истекли, он выполняет внеочередное объединение. Чтобы контролировать частоту таких объединений, можно установить `merge_with_ttl_timeout`. Если значение слишком низкое, будет выполняться множество внеочередных объединений, что может потребовать много ресурсов.

Если вы выполняете запрос `SELECT` между объединениями, вы можете получить просроченные данные. Чтобы избежать этого, используйте запрос [OPTIMIZE](/sql-reference/statements/optimize.md) перед `SELECT`.

**См. также**

- настройка [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts)

## Типы дисков {#disk-types}

В дополнение к локальным блочным устройствам, ClickHouse поддерживает следующие типы хранилищ:
- [`s3` для S3 и MinIO](#table_engine-mergetree-s3)
- [`gcs` для GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` для Azure Blob Storage](/operations/storing-data#azure-blob-storage)
- [`hdfs` для HDFS](/engines/table-engines/integrations/hdfs)
- [`web` для только чтения из веба](/operations/storing-data#web-storage)
- [`cache` для локального кэширования](/operations/storing-data#using-local-cache)
- [`s3_plain` для резервных копий на S3](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` для неизменяемых, нереплицированных таблиц в S3](/operations/storing-data.md#s3-plain-rewritable-storage)

## Использование нескольких блочных устройств для хранения данных {#table_engine-mergetree-multiple-volumes}
### Введение {#introduction}

Движки таблиц семейства `MergeTree` могут хранить данные на нескольких блочных устройствах. Например, это может быть полезно, когда данные определённой таблицы неявно разделены на "горячие" и "холодные". Наиболее свежие данные часто запрашиваются, но требуют лишь небольшого пространства. Напротив, данные с длинным туловищем исторически запрашиваются редко. Если доступно несколько дисков, "горячие" данные могут быть размещены на быстрых дисках (например, NVMe SSD или в памяти), тогда как "холодные" данные - на относительно медленных (например, HDD).

Часть данных - минимальная перемещаемая единица для таблиц с движком `MergeTree`. Данные, принадлежащие одной части, хранятся на одном диске. Части данных можно перемещать между дисками в фоновом режиме (согласно пользовательским настройкам) а также с помощью запросов [ALTER](/sql-reference/statements/alter/partition).

### Термины {#terms}

- Диск — блочное устройство, примонтированное к файловой системе.
- Диск по умолчанию — диск, который хранит путь, указанный в настройках сервера [path](/operations/server-configuration-parameters/settings.md/#path).
- Том — Упорядоченный набор одинаковых дисков (аналог [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)).
- Политика хранения — Набор томов и правила перемещения данных между ними.

Названия, данные описанным сущностям, можно найти в системных таблицах, [system.storage_policies](/operations/system-tables/storage_policies) и [system.disks](/operations/system-tables/disks). Чтобы применить одну из настроенных политик хранения для таблицы, используйте настройку `storage_policy` таблиц семейства `MergeTree`.

### Конфигурация {#table_engine-mergetree-multiple-volumes_configure}

Диски, тома и политики хранения должны быть объявлены внутри тега `<storage_configuration>` или в файле в директории `config.d`.

:::tip
Диски также можно объявить в разделе `SETTINGS` запроса. Это полезно для временного прикрепления диска, который, например, размещён по URL. Подробности см. в разделе [динамическое хранилище](/operations/storing-data#dynamic-configuration).
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

- `<disk_name_N>` — Имя диска. Имена должны быть различны для всех дисков.
- `path` — путь, под которым сервер будет хранить данные (папки `data` и `shadow`), должен заканчиваться символом '/'.
- `keep_free_space_bytes` — объём дискового пространства, который должен быть зарезервирован.

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

- `policy_name_N` — Название политики. Названия политик должны быть уникальными.
- `volume_name_N` — Название тома. Названия томов должны быть уникальными.
- `disk` — диск в составе тома.
- `max_data_part_size_bytes` — максимальный размер части, которая может быть сохранена на любом из дисков тома. Если размер слияния части оценивается как больший, чем `max_data_part_size_bytes`, то эта часть будет записана в следующий том. В основном эта функция позволяет сохранять новые/маленькие детали на "горячем" (SSD) томе и перемещать их на "холодный" (HDD) том, когда они достигают большого размера. Не используйте эту настройку, если ваша политика включает только один том.
- `move_factor` — когда объём свободного пространства становится меньше этого фактора, данные автоматически начинают перемещаться на следующий том, если таковой имеется (по умолчанию, 0.1). ClickHouse сортирует существующие части по размеру от наибольшего к наименьшему (по убыванию) и выбирает части с общим размером, достаточным для выполнения условия `move_factor`. Если общий размер всех частей недостаточен, все части будут перемещены.
- `perform_ttl_move_on_insert` — Отключает перемещение по TTL при вставке части данных. По умолчанию (если включено) если мы вставляем часть данных, которая уже истекла по правилу перемещения TTL, она немедленно попадает в том/диск, указанный в правиле перемещения. Это может значительно замедлить вставку в случае, если конечный том/диск медленный (например, S3). Если отключено, то уже истекшая часть данных записывается в том по умолчанию, а затем сразу перемещается в том TTL.
- `load_balancing` - Политика балансировки дисков, `round_robin` или `least_used`.
- `least_used_ttl_ms` - Настройка тайм-аута (в миллисекундах) для обновления доступного пространства на всех дисках (`0` - обновлять всегда, `-1` - никогда не обновлять, по умолчанию `60000`). Учтите, если диск может использоваться только ClickHouse и не подвергается онлайн изменению размера/уменьшению файловой системы можно использовать `-1`, в остальных случаях не рекомендуется, поскольку это приведёт к некорректному распределению места.
- `prefer_not_to_merge` — Не следует использовать эту настройку. Отключает слияние частей данных на этом томе (это вредно и ведет к снижению производительности). При включении этой настройки (не делайте этого) слияние данных на этом томе недопустимо (что плохо). Это позволяет (но вам это не нужно) контролировать (если вы хотите что-то контролировать, вы ошибаетесь) работу ClickHouse с медленными дисками (но ClickHouse знает лучше, так что, пожалуйста, не используйте эту настройку).
- `volume_priority` — Определяет приоритет (порядок), в котором заполняются тома. Меньшее значение означает больший приоритет. Знечеия параметра должны быть натуральными числами и охватывать диапазон от 1 до N (нижний приоритет) без пропусков номеров.
  * Если _все_ тома помечены, они приоритезируются в заданном порядке.
  * Если только _некоторые_ тома помечены, те, что без тега, имеют низший приоритет, и они приоритезированы в порядке их определения в конфиге.
  * Если _ни одни_ тома не помечены, их приоритет устанавливается в порядке их объявления в конфигурации.
  * Два тома не могут иметь одинаковое значение приоритета.

Примеры конфигураций:

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

В данном примере политика `hdd_in_order` реализует метод [round-robin](https://en.wikipedia.org/wiki/Round-robin_scheduling). Так как эта политика определяет только один том (`single`), части данных хранятся на всех его дисках по круговому порядку. Такая политика может быть полезной, если в системе монтировано несколько схожих дисков, но RAID не настроен. Имейте в виду, что каждая отдельная дисковая система ненадёжна, и вы возможно захотите компенсировать это с помощью коэффициента репликации 3 или более.

Если в системе доступны разные виды дисков, вместо этого можно использовать политику `moving_from_ssd_to_hdd`. Том `hot` состоит из SSD диска (`fast_ssd`), и максимальный размер части, которая может быть сохранена на этом томе, составляет 1GB. Все части размером больше 1GB будут храниться непосредственно на томе `cold`, который содержит HDD диск `disk1`. Также, как только диск `fast_ssd` будет заполнен более чем на 80%, данные будут перенесены на диск `disk1` фоновым процессом.

Порядок перечисления томов в политике хранения важен, если хотя бы один из перечисленных томов не имеет явного параметра `volume_priority`. Как только том переполняется, данные перемещаются на следующий. Порядок перечисления дисков также важен, потому что данные хранятся на них по очереди.

При создании таблицы можно применить одну из настроенных политик к ней:

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

Политика хранения `default` подразумевает использование только одного тома, который состоит только из одного диска, заданного в `<path>`. 

Вы можете изменить политику хранения после создания таблицы с помощью запроса [ALTER TABLE ... MODIFY SETTING], при этом новая политика должна включать все старые диски и тома с теми же именами.

Количество потоков, выполняющих фоновое перемещение частей данных, можно изменить с помощью параметра [background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size).

### Детали {#details}

В случае таблиц `MergeTree` данные попадают на диск различными способами:

- В результате вставки (`INSERT` запрос).
- В ходе фоновых слияний и [мутаций](/sql-reference/statements/alter#mutations).
- При загрузке с другой реплики.
- В результате замораживания раздела [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition).

Во всех этих случаях, кроме мутаций и замораживания раздела, часть хранится на томе и диске в соответствии с заданной политикой хранения:

1. Выбирается первый том (в порядке определения), который имеет достаточно места для хранения части (`unreserved_space > current_part_size`) и позволяет хранить части заданного размера (`max_data_part_size_bytes > current_part_size`).
2. Внутри этого тома выбирается тот диск, который следует за диском, использованным для хранения предыдущего блока данных, и имеющий свободного места больше размера части (`unreserved_space - keep_free_space_bytes > current_part_size`).

Под капотом мутации и замораживание разделов используют [жёсткие ссылки](https://en.wikipedia.org/wiki/Hard_link). Жёсткие ссылки между разными дисками не поддерживаются, следовательно, в таких случаях итоговые части сохраняются на тех же дисках, что и начальные.

В фоновом режиме части перемещаются между томами на основе объема свободного пространства (параметр `move_factor`) в порядке, в котором тома объявлены в конфигурационном файле. Данные никогда не переносятся из последнего тома и в первый том. Можно использовать системные таблицы [system.part_log](/operations/system-tables/part_log) (поле `type = MOVE_PART`) и [system.parts](/operations/system-tables/parts.md) (поля `path` и `disk`) для мониторинга фоновых перемещений. Также подробную информацию можно найти в журналах сервера.

Пользователь может принудительно переместить часть или раздел из одного тома в другой, используя запрос [ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition), все ограничения для фоновых операций учитываются. Запрос инициирует перемещение самостоятельно и не ждёт завершения фоновых операций. Пользователь получит сообщение об ошибке, если недостаточно доступного свободного пространства или если не выполняются какие-либо обязательные условия.

Перемещение данных не мешает репликации данных. Следовательно, для одной и той же таблицы на разных репликах могут быть указаны разные политики хранения.

После завершения фоновых слияний и мутаций старые части удаляются только через определённый промежуток времени (`old_parts_lifetime`). В течение этого времени они не будут перемещаться на другие тома или диски. Соответственно, пока части не будут окончательно удалены, они по-прежнему учитываются при оценке занятого дискового пространства.

Пользователь может назначить новые большие части на разные диски тома [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) сбалансированным образом, используя настройку [min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min-bytes-to-rebalance-partition-over-jbod).
## Использование внешнего хранилища для хранения данных {#table_engine-mergetree-s3}

Семейство движков таблиц [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) может сохранять данные в `S3`, `AzureBlobStorage`, `HDFS`, используя диск с типами `s3`, `azure_blob_storage`, `hdfs` соответственно. Подробнее см. в разделе [настройка опций внешнего хранения](/operations/storing-data.md/#configuring-external-storage).

Пример для [S3](https://aws.amazon.com/s3/) в качестве внешнего хранилища, используя диск с типом `s3`.

Конфигурация разметки:
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

Также см. [настройка опций внешнего хранения](/operations/storing-data.md/#configuring-external-storage).

:::note конфигурация кэша
Версии ClickHouse 22.3 до 22.7 используют другую конфигурацию кэша, см. [использование локального кэша](/operations/storing-data.md/#using-local-cache), если вы используете одну из этих версий.
:::
## Виртуальные столбцы {#virtual-columns}

- `_part` — Имя части.
- `_part_index` — Последовательный индекс части в результате запроса.
- `_partition_id` — Имя раздела.
- `_part_uuid` — Уникальный идентификатор части (если включена настройка MergeTree `assign_part_uuids`).
- `_partition_value` — Значения (кортеж) выражения `partition by`.
- `_sample_factor` — Коэффициент выборки (из запроса).
- `_block_number` — Номер блока строки, сохраняется при слияниях, если `allow_experimental_block_number_column` установлен в true.
## Статистика по столбцам {#column-statistics}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Объявление статистики находится в разделе столбцов запроса `CREATE` для таблиц из семейства `*MergeTree*` при условии, что установлено `set allow_experimental_statistics = 1`.

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

Эта лёгкая статистика агрегирует информацию о распределении значений в столбцах. Статистика хранится в каждой части и обновляется при каждой вставке.
Статистика может быть использована для оптимизации prewhere только при условии, что включено `set allow_statistics_optimize = 1`.
### Доступные типы статистики по столбцам {#available-types-of-column-statistics}

- `MinMax`

    Минимальное и максимальное значение столбца, что позволяет оценить селективность фильтров диапазона на числовых столбцах.

    Синтаксис: `minmax`

- `TDigest`

    Наброски [TDigest](https://github.com/tdunning/t-digest), которые позволяют вычислять аппроксимированные перцентили (например, 90-й перцентиль) для числовых столбцов.

    Синтаксис: `tdigest`

- `Uniq`

    Наброски [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog), которые предоставляют оценку количества уникальных значений в столбце.

    Синтаксис: `uniq`

- `CountMin`

    Наброски [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch), которые предоставляют приближенный счётчик частоты каждого значения в столбце.

    Синтаксис `countmin`
### Поддерживаемые типы данных {#supported-data-types}

|           | (U)Int*, Float*, Decimal(*), Date*, Boolean, Enum* | String или FixedString |
|-----------|----------------------------------------------------|-----------------------|
| CountMin  | ✔                                                  | ✔                     |
| MinMax    | ✔                                                  | ✗                     |
| TDigest   | ✔                                                  | ✗                     |
| Uniq      | ✔                                                  | ✔                     |
### Поддерживаемые операции {#supported-operations}

|           | Фильтры равенства (==) | Фильтры диапазона (`>, >=, <, <=`) |
|-----------|-----------------------|------------------------------|
| CountMin  | ✔                     | ✗                            |
| MinMax    | ✗                     | ✔                            |
| TDigest   | ✗                     | ✔                            |
| Uniq      | ✔                     | ✗                            |
## Настройки на уровне столбцов {#column-level-settings}

Некоторые настройки MergeTree могут быть переопределены на уровне столбцов:

- `max_compress_block_size` — Максимальный размер блоков несжатых данных перед сжатием для записи в таблицу.
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

Настройки на уровне столбцов можно изменить или удалить, используя [ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md), например:

- Удаление `SETTINGS` из объявления столбца:

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- Изменение настройки:

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- Сброс одной или нескольких настроек, также удаляет объявление настройки в выражении столбца запроса CREATE таблицы.

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
