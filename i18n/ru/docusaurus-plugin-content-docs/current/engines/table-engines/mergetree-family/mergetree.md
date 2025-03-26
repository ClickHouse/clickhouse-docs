---
description: 'Движки таблиц семейства `MergeTree` разработаны для высокой скорости приема данных и работы с огромными объемами данных.'
sidebar_label: 'MergeTree'
sidebar_position: 11
slug: /engines/table-engines/mergetree-family/mergetree
title: 'MergeTree'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# MergeTree

Движок `MergeTree` и другие движки из семейства `MergeTree` (например, `ReplacingMergeTree`, `AggregatingMergeTree`) являются наиболее часто используемыми и наиболее надежными движками таблиц в ClickHouse.

Движки таблиц семейства `MergeTree` разработаны для высокой скорости приема данных и работы с огромными объемами данных.
Операции вставки создают части таблиц, которые сливаются фоновым процессом с другими частями таблиц.

Основные функции движков таблиц семейства `MergeTree`.

- Первичный ключ таблицы определяет порядок сортировки в каждой части таблицы (кластеризованный индекс). Первичный ключ также не ссылается на отдельные строки, а на блоки по 8192 строки, называемые гранулами. Это делает первичные ключи огромных наборов данных достаточно малыми, чтобы оставаться загруженными в основную память, при этом обеспечивая быстрый доступ к данным на диске.

- Таблицы могут быть разделены на разделы, используя произвольное выражение для разделения. Отсечение разделов гарантирует, что разделы не будут читаться, если запрос это позволяет.

- Данные могут реплицироваться на нескольких узлах кластера для обеспечения высокой доступности, отказоустойчивости и обновлений без простоя. См. [Репликация данных](/engines/table-engines/mergetree-family/replication.md).

- Движки таблиц `MergeTree` поддерживают различные виды статистики и методы выборки, чтобы помочь в оптимизации запросов.

:::note
Несмотря на похожее имя, движок [Merge](/engines/table-engines/special/merge) отличается от движков `*MergeTree`.
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

Для подробного описания параметров см. оператор [CREATE TABLE](/sql-reference/statements/create/table.md)
### Условия запроса {#mergetree-query-clauses}
#### ENGINE {#engine}

`ENGINE` — Название и параметры движка. `ENGINE = MergeTree()`. У движка `MergeTree` нет параметров.
#### ORDER_BY {#order_by}

`ORDER BY` — Ключ сортировки.

Кортеж имен столбцов или произвольных выражений. Пример: `ORDER BY (CounterID + 1, EventDate)`.

Если первичный ключ не определен (т.е. `PRIMARY KEY` не указан), ClickHouse использует ключ сортировки в качестве первичного ключа.

Если сортировка не требуется, вы можете использовать синтаксис `ORDER BY tuple()`.
Кроме того, если параметр `create_table_empty_primary_key_by_default` включен, `ORDER BY tuple()` будет неявно добавлен в операторы `CREATE TABLE`. См. [Выбор первичного ключа](#selecting-a-primary-key).
#### PARTITION BY {#partition-by}

`PARTITION BY` — [Ключ разделения](/engines/table-engines/mergetree-family/custom-partitioning-key.md). Необязательный параметр. В большинстве случаев, вам не нужен ключ разделения, и если вам действительно нужно разделение, то, как правило, не требуется более детализированного ключа разделения, чем по месяцам. Разделение не ускоряет запросы (в отличие от выражения `ORDER BY`). Никогда не следует использовать слишком подробное разделение. Не разделяйте ваши данные по идентификаторам клиентов или именам (вместо этого, делайте идентификатор клиента или имя первым столбцом в выражении `ORDER BY`).

Для разделения по месяцам используйте выражение `toYYYYMM(date_column)`, где `date_column` — это столбец с датой типа [Date](/sql-reference/data-types/date.md). Имена разделов здесь имеют формат `"YYYYMM"`.
#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — Первичный ключ, если он [отличается от ключа сортировки](#choosing-a-primary-key-that-differs-from-the-sorting-key). Необязательный.

Указание ключа сортировки (с использованием оператора `ORDER BY`) неявно указывает первичный ключ.
Обычно не требуется указывать первичный ключ в дополнение к ключу сортировки.
#### SAMPLE BY {#sample-by}

`SAMPLE BY` — Выражение для выборки. Необязательный.

Если указано, оно должно содержаться в первичном ключе.
Выражение для выборки должно возвращать беззнаковое целое число.

Пример: `SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`.
#### TTL {#ttl}

`TTL` — Список правил, определяющих срок хранения строк и логику автоматического перемещения частей [между дисками и томами](#table_engine-mergetree-multiple-volumes). Необязательный.

Выражение должно возвращать `Date` или `DateTime`, например `TTL date + INTERVAL 1 DAY`.

Тип правила `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY` определяет действие, которое следует выполнить с частью, если выражение выполнено (достигает текущего времени): удаление устаревших строк, перемещение части (если выражение выполнено для всех строк в части) на указанный диск (`TO DISK 'xxx'`) или том (`TO VOLUME 'xxx'`) или агрегация значений в устаревших строках. Тип правила по умолчанию — удаление (`DELETE`). Можно указать несколько правил, но не более одного правила `DELETE`.


Для получения более подробной информации, см. [TTL для столбцов и таблиц](#table_engine-mergetree-ttl)
#### SETTINGS {#settings}

См. [Настройки MergeTree](../../../operations/settings/merge-tree-settings.md).

**Пример настройки секций**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

В примере, мы задаем разделение по месяцам.

Мы также задаем выражение для выборки в виде хеша по идентификатору пользователя. Это позволяет псевдослучайно распределять данные в таблице для каждого `CounterID` и `EventDate`. Если вы определите условие [SAMPLE](/sql-reference/statements/select/sample) при выборе данных, ClickHouse вернет равномерно псевдослучайную выборку данных для подмножества пользователей.

Параметр `index_granularity` можно опустить, поскольку 8192 является значением по умолчанию.

<details markdown="1">

<summary>Устаревший способ создания таблицы</summary>

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

Движок `MergeTree` настроен так же, как и в примере выше для основного метода настройки движка.
</details>
## Хранение данных {#mergetree-data-storage}

Таблица состоит из частей данных, отсортированных по первичному ключу.

Когда данные вставляются в таблицу, создаются отдельные части данных, каждая из которых лексикографически отсортирована по первичному ключу. Например, если первичный ключ — это `(CounterID, Date)`, данные в части сортируются по `CounterID`, а внутри каждого `CounterID` они упорядочиваются по `Date`.

Данные, относящиеся к разным разделам, хранятся в разных частях. В фоновом режиме ClickHouse сливает части данных для более эффективного хранения. Части, относящиеся к разным разделам, не сливаются. Механизм слияния не гарантирует, что все строки с одинаковым первичным ключом окажутся в одной и той же части данных.

Части данных могут храниться в формате `Wide` или `Compact`. В формате `Wide` каждый столбец хранится в отдельном файле в файловой системе, в формате `Compact` все столбцы хранятся в одном файле. Формат `Compact` можно использовать для увеличения производительности небольших и частых вставок.

Формат хранения данных контролируется настройками движка таблиц `min_bytes_for_wide_part` и `min_rows_for_wide_part`. Если количество байтов или строк в части данных меньше значения соответствующей настройки, часть хранится в формате `Compact`. В противном случае она хранится в формате `Wide`. Если ни одна из этих настроек не задана, части данных хранятся в формате `Wide`.

Каждая часть данных логически делится на гранулы. Гранула — это наименьший неделимый набор данных, который ClickHouse читает при выборе данных. ClickHouse не разделяет строки или значения, поэтому каждая гранула всегда содержит целое число строк. Первая строка гранулы помечается значением первичного ключа для этой строки. Для каждой части данных, ClickHouse создает файл индекса, который хранит метки. Для каждого столбца, будь он в первичном ключе или нет, ClickHouse также хранит те же метки. Эти метки позволяют находить данные непосредственно в файлах столбцов.

Размер гранулы ограничивается настройками движка таблиц `index_granularity` и `index_granularity_bytes`. Число строк в грануле находится в диапазоне `[1, index_granularity]`, в зависимости от размера строк. Размер гранулы может превышать `index_granularity_bytes`, если размер одной строки больше значения настройки. В этом случае размер гранулы равен размеру строки.
## Первичные ключи и индексы в запросах {#primary-keys-and-indexes-in-queries}

Возьмем, к примеру, первичный ключ `(CounterID, Date)`. В данном случае сортировка и индекс могут быть проиллюстрированы следующим образом:

```text
Все данные:     [---------------------------------------------]
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

Примеры выше показывают, что всегда эффективнее использовать индекс, чем полное сканирование.

Разреженный индекс позволяет прочитать лишние данные. При чтении одного диапазона первичного ключа может быть прочитано до `index_granularity * 2` лишних строк в каждом блоке данных.

Разреженные индексы позволяют работать с очень большим числом строк таблиц, поскольку в большинстве случаев такие индексы помещаются в оперативную память компьютера.

ClickHouse не требует уникального первичного ключа. Вы можете вставить несколько строк с одинаковым первичным ключом.

Вы можете использовать выражения типа `Nullable` в операторах `PRIMARY KEY` и `ORDER BY`, но это сильно не рекомендуется. Чтобы разрешить эту возможность, включите настройку [allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key). Для значений `NULL` в операторе `ORDER BY` применяется принцип [NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values).
### Выбор первичного ключа {#selecting-a-primary-key}

Количество столбцов в первичном ключе не ограничено явно. В зависимости от структуры данных, вы можете включить больше или меньше столбцов в первичный ключ. Это может:

- Улучшить производительность индекса.

    Если первичный ключ — это `(a, b)`, добавление еще одного столбца `c` улучшит производительность, если выполнены следующие условия:

    - Существуют запросы с условием по столбцу `c`.
    - Часто встречаются длинные диапазоны данных (в несколько раз длиннее, чем `index_granularity`) с одинаковыми значениями `(a, b)`. Другими словами, когда добавление еще одного столбца позволяет пропустить довольно длинные диапазоны данных.

- Улучшить сжатие данных.

    ClickHouse сортирует данные по первичному ключу, поэтому чем выше согласованность, тем лучше сжатие.

- Обеспечить дополнительную логику при слиянии частей данных в движках [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) и [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md).

    В этом случае имеет смысл указать *ключ сортировки*, отличающийся от первичного ключа.

Длинный первичный ключ отрицательно повлияет на производительность вставок и использование памяти, но дополнительные столбцы в первичном ключе не влияют на производительность ClickHouse при `SELECT` запросах.

Вы можете создать таблицу без первичного ключа, используя синтаксис `ORDER BY tuple()`. В этом случае ClickHouse сохраняет данные в порядке вставки. Если вы хотите сохранить порядок данных при вставке данных через запросы `INSERT ... SELECT`, установите [max_insert_threads = 1](/operations/settings/settings#max_insert_threads).

Для выбора данных в исходном порядке используйте [однопоточные](/operations/settings/settings.md/#max_threads) `SELECT` запросы.
### Выбор первичного ключа, отличающегося от ключа сортировки {#choosing-a-primary-key-that-differs-from-the-sorting-key}

Возможно указать первичный ключ (выражение со значениями, которые записываются в файл индекса для каждой метки), который отличается от ключа сортировки (выражения для сортировки строк в частях данных). В этом случае кортеж выражений первичного ключа должен быть префиксом кортежа выражений ключа сортировки.

Эта функция полезна при использовании движков таблиц [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) и
[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md). В обычном случае при использовании этих движков таблица имеет два типа столбцов: *размерности* и *меры*. Типичные запросы агрегируют значения столбцов мер с произвольным `GROUP BY` и фильтрацией по размерностям. Поскольку SummingMergeTree и AggregatingMergeTree агрегируют строки с одинаковым значением ключа сортировки, логично добавить все размерности в него. В результате выражение ключа состоит из длинного списка столбцов, и этот список необходимо часто обновлять с новыми размерностями.

В этом случае имеет смысл оставить только несколько столбцов в первичном ключе, которые обеспечат эффективные диапазонные сканирования, а остальные столбцы размерностей добавить в кортеж ключа сортировки.

[ALTER](/sql-reference/statements/alter/index.md) ключа сортировки — это легковесная операция, так как при одновременном добавлении нового столбца в таблицу и в ключ сортировки, существующие части данных не нужно изменять. Поскольку старый ключ сортировки является префиксом нового ключа сортировки и в новом столбце нет данных, данные сортируются как по старому ключу сортировки, так и по новому в момент изменения таблицы.
### Использование индексов и разделов в запросах {#use-of-indexes-and-partitions-in-queries}

Для `SELECT` запросов ClickHouse анализирует, может ли использоваться индекс. Индекс может использоваться, если в условии `WHERE/PREWHERE` есть выражение (как один из элементов конъюнкции, или полностью), которое представляет собой операцию сравнения равенства или неравенства, или если оно содержит `IN` или `LIKE` с фиксированным префиксом на столбцах или выражениях, которые находятся в первичном ключе или ключе разделения, или на некоторых частично повторяющихся функциях этих столбцов, или логических отношениях этих выражений.

Таким образом, можно быстро выполнять запросы на один или несколько диапазонов первичного ключа. В этом примере запросы будут быстрыми при выполнении для определенного тегирования, для определенного тега и диапазона дат, для определенного тега и даты, для нескольких тегов с диапазоном дат и так далее.

Давайте рассмотрим движок, настроенный следующим образом:
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

ClickHouse будет использовать индекс первичного ключа для отсечения недопустимых данных и ключ разделения на месячные части для отсечения разделов, которые находятся в недопустимых диапазонах дат.

Приведенные выше запросы показывают, что индекс используется даже для сложных выражений. Чтение из таблицы организовано так, что использование индекса не может быть медленнее полного сканирования.

В примере ниже индекс не может быть использован.

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

Чтобы проверить, может ли ClickHouse использовать индекс при выполнении запроса, используйте параметры [force_index_by_date](/operations/settings/settings.md/#force_index_by_date) и [force_primary_key](/operations/settings/settings#force_primary_key).

Ключ для разделения по месяцам позволяет читать только те блоки данных, которые содержат даты из нужного диапазона. В этом случае блок данных может содержать данные для многих дат (до целого месяца). В пределах блока данные сортируются по первичному ключу, который может не содержать дату в качестве первого столбца. Из-за этого использование запроса с условием только по дате, не указывающим префикс первичного ключа, приведет к большему количеству прочитанных данных, чем для одной даты.
### Использование индекса для частично-монотонных первичных ключей {#use-of-index-for-partially-monotonic-primary-keys}

Рассмотрим, например, дни месяца. Они образуют [монотонную последовательность](https://en.wikipedia.org/wiki/Monotonic_function) для одного месяца, но не монотонные для более длительных периодов. Это частично-монотонная последовательность. Если пользователь создает таблицу с частично-монотонным первичным ключом, ClickHouse создает разреженный индекс, как обычно. Когда пользователь выбирает данные из такой таблицы, ClickHouse анализирует условия запроса. Если пользователь хочет получить данные между двумя метками индекса, и обе эти метки попадают в один месяц, ClickHouse может использовать индекс в этом конкретном случае, поскольку он может вычислить расстояние между параметрами запроса и метками индекса.

ClickHouse не может использовать индекс, если значения первичного ключа в диапазоне параметров запроса не представляют монотонную последовательность. В этом случае ClickHouse использует метод полного сканирования.

ClickHouse использует эту логику не только для последовательностей дней месяца, но и для любого первичного ключа, представляющего частично-монотонную последовательность.
### Индексы пропуска данных {#table_engine-mergetree-data_skipping-indexes}

Объявление индекса находится в секции столбцов запроса `CREATE`.

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

Для таблиц из семейства `*MergeTree` могут быть заданы индексы пропуска данных.

Эти индексы агрегируют некоторую информацию о заданном выражении на блоках, которые состоят из `granularity_value` гранул (размер гранулы задается с помощью настройки `index_granularity` в движке таблиц). Затем эти агрегаты используются в `SELECT` запросах для уменьшения объема данных, которые нужно читать с диска, пропуская большие блоки данных, где не может быть выполнен `where` запрос.

Оператор `GRANULARITY` может быть опущен, значение по умолчанию `granularity_value` составляет 1.

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

Индексы из примера могут быть использованы ClickHouse для уменьшения объема данных, читаемых с диска, в следующих запросах:

```sql
SELECT count() FROM table WHERE u64 == 10;
SELECT count() FROM table WHERE u64 * i32 >= 1234
SELECT count() FROM table WHERE u64 * length(s) == 1234
```

Индексы пропуска данных могут также быть созданы для составных столбцов:

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

Хранит экстремальные значения заданного выражения (если выражение `tuple`, то хранит экстремальные значения для каждого элемента `tuple`), использует сохраненную информацию для пропуска блоков данных, как основной ключ.

Синтаксис: `minmax`
#### Set {#set}

Хранит уникальные значения заданного выражения (не более чем `max_rows` строк, `max_rows=0` означает "без ограничений"). Использует значения для проверки, не может ли выражение `WHERE` быть выполненным на блоке данных.

Синтаксис: `set(max_rows)`
#### Фильтр Блума {#bloom-filter}

Хранит [фильтр Блума](https://en.wikipedia.org/wiki/Bloom_filter) для заданных столбцов. Необязательный параметр `false_positive` с возможными значениями от 0 до 1 указывает вероятность получения ложного положительного ответа от фильтра. Значение по умолчанию: 0.025. Поддерживаемые типы данных: `Int*`, `UInt*`, `Float*`, `Enum`, `Date`, `DateTime`, `String`, `FixedString`, `Array`, `LowCardinality`, `Nullable`, `UUID` и `Map`. Для типа данных `Map` клиент может указать, должен ли индекс быть создан для ключей или значений с использованием функции [mapKeys](/sql-reference/functions/tuple-map-functions.md/#mapkeys) или [mapValues](/sql-reference/functions/tuple-map-functions.md/#mapvalues).

Синтаксис: `bloom_filter([false_positive])`
#### N-грамм-фильтр Блума {#n-gram-bloom-filter}

Хранит [фильтр Блума](https://en.wikipedia.org/wiki/Bloom_filter), который содержит все n-граммы из блока данных. Работает только с типами данных: [String](/sql-reference/data-types/string.md), [FixedString](/sql-reference/data-types/fixedstring.md) и [Map](/sql-reference/data-types/map.md). Может быть использован для оптимизации выражений `EQUALS`, `LIKE` и `IN`.

Синтаксис: `ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`

- `n` — размер n-граммы,
- `size_of_bloom_filter_in_bytes` — размер фильтра Блума в байтах (здесь можно использовать большие значения, например, 256 или 512, так как они хорошо сжимаются).
- `number_of_hash_functions` — количество хеш-функций, используемых в фильтре Блума.
- `random_seed` — начальное значение для хеш-функций фильтра Блума.

Пользователи могут создавать [UDF](/sql-reference/statements/create/function.md) для оценки набора параметров `ngrambf_v1`. Запросы следующие:

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
Например, если в грануле 4300 n-грамм, и мы ожидаем, что количество ложных срабатываний будет меньше 0.0001. Остальные параметры могут быть оценены путем выполнения следующих запросов:


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
Конечно, вы можете также использовать эти функции для оценки параметров по другим условиям.
Функции ссылаются на содержимое [здесь](https://hur.st/bloomfilter).
#### Токен-фильтр Блума {#token-bloom-filter}

То же, что и `ngrambf_v1`, но хранит токены вместо n-грамм. Токены — это последовательности, разделенные не алфавитно-цифровыми символами.

Синтаксис: `tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)`
#### Специального назначения {#special-purpose}

- Экспериментальный индекс для поддержки аппроксимационного поиска ближайших соседей. Подробнее [здесь](annindexes.md).
- Экспериментальный индекс для полнотекстового поиска. Подробнее [здесь](invertedindexes.md).
### Поддержка функций {#functions-support}

Условия в `WHERE` содержат вызовы функций, которые работают со столбцами. Если столбец является частью индекса, ClickHouse пытается использовать этот индекс при выполнении функций. ClickHouse поддерживает различные подмножества функций для использования индексов.

Индексы типа `set` могут применяться ко всем функциям. Остальные типы индексов поддерживаются следующим образом:

| Функция (оператор) / Индекс                                                                                | первичный ключ | minmax | ngrambf_v1 | tokenbf_v1 | bloom_filter | full_text |
|------------------------------------------------------------------------------------------------------------|----------------|--------|------------|------------|--------------|-----------|
| [equals (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                         | ✔              | ✔      | ✔          | ✔          | ✔            | ✔         |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notequals)             | ✔              | ✔      | ✔          | ✔          | ✔            | ✔         |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                  | ✔              | ✔      | ✔          | ✔          | ✗            | ✔         |
| [notLike](/sql-reference/functions/string-search-functions.md/#notlike)                            | ✔              | ✔      | ✔          | ✔          | ✗            | ✔         |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                | ✗              | ✗      | ✔          | ✔          | ✗            | ✔         |
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

Функции с константным аргументом, который меньше размера ngram, не могут быть использованы `ngrambf_v1` для оптимизации запросов.

(*) Чтобы `hasTokenCaseInsensitive` и `hasTokenCaseInsensitiveOrNull` были эффективны, индекс `tokenbf_v1` должен быть создан на данных в нижнем регистре, например, `INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`.

:::note
Фильтры Блума могут давать ложноположительные совпадения, поэтому индексы `ngrambf_v1`, `tokenbf_v1` и `bloom_filter` не могут быть использованы для оптимизации запросов, где ожидается, что результат функции будет ложным.

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
Проекции аналогичны [материализованным представлениям](/sql-reference/statements/create/view), но определены на уровне частей. Они обеспечивают гарантии согласованности вместе с автоматическим использованием в запросах.

:::note
При внедрении проекций необходимо также учитывать настройку [force_optimize_projection](/operations/settings/settings#force_optimize_projection).
:::

Проекции не поддерживаются в `SELECT` с модификатором [FINAL](/sql-reference/statements/select/from#final-modifier).
### Запрос проекции {#projection-query}
Запрос проекции определяет проекцию. Он неявно выбирает данные из родительской таблицы.
**Синтаксис**

```sql
SELECT <column list expr> [GROUP BY] <group keys expr> [ORDER BY] <expr>
```

Проекции могут быть изменены или удалены с помощью оператора [ALTER](/sql-reference/statements/alter/projection.md).
### Хранение проекций {#projection-storage}
Проекции хранятся внутри директории части. Это похоже на индекс, но содержит поддиректорию, которая хранит часть анонимной таблицы `MergeTree`. Таблица выводится из определения запроса проекции. Если есть предложение `GROUP BY`, то подлежащий движoк хранения становится [AggregatingMergeTree](aggregatingmergetree.md), и все агрегатные функции преобразуются в `AggregateFunction`. Если есть предложение `ORDER BY`, таблица `MergeTree` использует его как выражение первичного ключа. Во время процесса слияния часть проекции сливается через рутину слияния её хранилища. Контрольная сумма части родительской таблицы комбинируется с частью проекции. Остальные работы по обслуживанию аналогичны индексам пропуска.
### Анализ запроса {#projection-query-analysis}
1. Проверить, можно ли использовать проекцию для ответа на заданный запрос, то есть, она генерирует тот же ответ, что и запрос к базовой таблице.
2. Выбрать наилучшее возможное соответствие, содержащее наименьшее количество гранул для чтения.
3. Конвейер запросов, использующий проекции, будет отличаться от того, который использует исходные части. Если проекция отсутствует в некоторых частях, мы можем добавить конвейер для её реализации на лету.
## Одновременный доступ к данным {#concurrent-data-access}

Для одновременного доступа к таблице мы используем многоверсионность. Иными словами, когда таблица одновременно читается и обновляется, данные читаются из набора частей, который актуален на момент выполнения запроса. Долгих блокировок нет. Вставки не мешают операциям чтения.

Чтение из таблицы автоматически параллелизируется.
## TTL для столбцов и таблиц {#table_engine-mergetree-ttl}

Определяет срок жизни значений.

Оператор `TTL` может быть установлен для всей таблицы и для каждого отдельного столбца. Уровень `TTL` таблицы также может задавать логику автоматического перемещения данных между дисками и томами или перекомпрессии частей, где все данные истекли.

Выражения должны иметь тип данных [Date](/sql-reference/data-types/date.md) или [DateTime](/sql-reference/data-types/datetime.md).

**Синтаксис**

Установка времени жизни для столбца:

```sql
TTL time_column
TTL time_column + interval
```

Чтобы определить `interval`, используйте операторы [временных интервалов](/sql-reference/operators#operators-for-working-with-dates-and-times), например:

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```
### TTL столбца {#mergetree-column-ttl}

Когда значения в столбце истекают, ClickHouse заменяет их значениями по умолчанию для типа данных столбца. Если все значения столбца в части данных истекают, ClickHouse удаляет этот столбец из части данных в файловой системе.

Оператор `TTL` не может быть использован для ключевых столбцов.

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

Таблица может иметь выражение для удаления истёкших строк и несколько выражений для автоматического перемещения частей между [дисками или томами](#table_engine-mergetree-multiple-volumes). Когда строки в таблице истекают, ClickHouse удаляет все соответствующие строки. Для перемещения или перекомпрессии частей все строки части должны соответствовать критериям выражения `TTL`.

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

Тип правила TTL может следовать за каждым выражением TTL. Оно определяет действие, которое должно быть выполнено после удовлетворения выражения (достижения текущего времени):

- `DELETE` - удаление истёкших строк (действие по умолчанию);
- `RECOMPRESS codec_name` - перекомпрессия части данных с помощью `codec_name`;
- `TO DISK 'aaa'` - перемещение части на диск `aaa`;
- `TO VOLUME 'bbb'` - перемещение части на диск `bbb`;
- `GROUP BY` - агрегация истёкших строк.

Действие `DELETE` может использоваться вместе с оператором `WHERE` для удаления только некоторых истёкших строк на основе условия фильтрации:
```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

Выражение `GROUP BY` должно быть префиксом первичного ключа таблицы.

Если столбец не является частью выражения `GROUP BY` и не установлен явно в предложении `SET`, в результирующей строке он содержит случайное значение из сгруппированных строк (как если бы к нему была применена агрегатная функция `any`).

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

Создание таблицы, в которой строки истекают через один месяц. Истёкшие строки, где даты являются понедельниками, удаляются:

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
#### Создание таблицы, в которой истёкшие строки перекомпрессируются: {#creating-a-table-where-expired-rows-are-recompressed}

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

Создание таблицы, в которой истёкшие строки агрегируются. В результирующих строках `x` содержит максимальное значение среди сгруппированных строк, `y` — минимальное значение, а `d` — любое случайное значение из сгруппированных строк.

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
### Удаление истёкших данных {#mergetree-removing-expired-data}

Данные с истёкшим `TTL` удаляются, когда ClickHouse объединяет части данных.

Когда ClickHouse обнаруживает, что данные истекли, он выполняет не запланированное слияние. Чтобы контролировать частоту таких слияний, можно задать `merge_with_ttl_timeout`. Если значение слишком низкое, будет выполняться много несвоевременных слияний, которые могут потреблять много ресурсов.

Если вы выполняете запрос `SELECT` между слияниями, вы можете получить истёкшие данные. Чтобы этого избежать, используйте запрос [OPTIMIZE](/sql-reference/statements/optimize.md) перед `SELECT`.

**См. также**

- Настройка [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts)
## Типы дисков {#disk-types}

Кроме локальных блочных устройств, ClickHouse поддерживает следующие типы хранилищ:
- [`s3` для S3 и MinIO](#table_engine-mergetree-s3)
- [`gcs` для GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` для Azure Blob Storage](/operations/storing-data#azure-blob-storage)
- [`hdfs` для HDFS](/engines/table-engines/integrations/hdfs)
- [`web` для чтения только с веба](/operations/storing-data#web-storage)
- [`cache` для локального кэширования](/operations/storing-data#using-local-cache)
- [`s3_plain` для резервного копирования на S3](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` для неизменяемых, нереплицируемых таблиц в S3](/operations/storing-data.md#s3-plain-rewritable-storage)
## Использование нескольких блочных устройств для хранения данных {#table_engine-mergetree-multiple-volumes}
### Введение {#introduction}

Движки таблиц семейства `MergeTree` могут хранить данные на нескольких блочных устройствах. Например, это может быть полезно, когда данные определённой таблицы могут быть неявно разделены на "горячие" и "холодные". Недавние данные регулярно запрашиваются, но требуют лишь небольшого объёма пространства. Напротив, данные с большим хвостом запрашиваются редко. Если доступно несколько дисков, "горячие" данные могут быть размещены на быстрых дисках (например, NVMe SSD или в памяти), тогда как "холодные" данные - на относительно медленных дисках (например, HDD).

Часть данных является минимальной перемещаемой единицей для таблиц движка `MergeTree`. Данные, принадлежащие одной части, хранятся на одном диске. Части данных могут перемещаться между дисками в фоне (согласно пользовательским настройкам), а также с помощью [ALTER](/sql-reference/statements/alter/partition) запросов.
### Термины {#terms}

- Диск — Блочное устройство, смонтированное в файловую систему.
- Диск по умолчанию — Диск, который хранит путь, указанный в настройке сервера [path](/operations/server-configuration-parameters/settings.md/#path).
- Том — Упорядоченный набор равнозначных дисков (аналогично [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)).
- Политика хранения — Набор томов и правила перемещения данных между ними.

Названия, присвоенные описанным сущностям, можно найти в системных таблицах [system.storage_policies](/operations/system-tables/storage_policies) и [system.disks](/operations/system-tables/disks). Чтобы применить одну из настроенных политик хранения к таблице, используйте настройку `storage_policy` для таблиц семейства `MergeTree`.
### Конфигурация {#table_engine-mergetree-multiple-volumes_configure}

Диски, тома и политики хранения должны быть объявлены внутри тега `<storage_configuration>`, либо в файле в каталоге `config.d`.

:::tip
Диски также могут быть объявлены в разделе `SETTINGS` запроса. Это полезно для временного подключения диска, который, например, размещён по URL.
См. [динамическое хранилище](/operations/storing-data#dynamic-configuration) для получения более подробной информации.
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
- `path` — путь, под которым сервер будет хранить данные (`data` и `shadow` папки), должен заканчиваться на '/'.
- `keep_free_space_bytes` — количество зарезервированного свободного места на диске.

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

- `policy_name_N` — Имя политики. Имена политик должны быть уникальными.
- `volume_name_N` — Имя тома. Имена томов должны быть уникальными.
- `disk` — диск в томе.
- `max_data_part_size_bytes` — максимальный размер части, которая может быть сохранена на любом из дисков тома. Если размер объединенной части оценивается больше, чем `max_data_part_size_bytes`, то эта часть будет записана в следующий том. В основном эта функция позволяет сохранять новые/маленькие части на горячем (SSD) томе и перемещать их на холодный (HDD) том, когда они достигают большого размера. Не используйте эту настройку, если ваша политика имеет только один том.
- `move_factor` — когда количество доступного пространства становится меньше этого коэффициента, данные начинают автоматически перемещаться на следующий том, если есть (по умолчанию, 0.1). ClickHouse сортирует существующие части по размеру от большей к меньшей (в порядке убывания) и выбирает части с общей суммой, достаточной для выполнения условия `move_factor`. Если общая сумма всех частей недостаточна, все части будут перемещены.
- `perform_ttl_move_on_insert` — Отключает перемещение по TTL при вставке части данных. По умолчанию (если включено), если мы вставляем часть данных, которая уже истекла по правилу перемещения TTL, она сразу же перемещается в том/диск, указанный в правиле перемещения. Это может значительно замедлить вставку, если целевой том/диск медленный (например, S3). Если отключено, то уже истёкшая часть данных записывается в том по умолчанию, а затем перемещается в том TTL.
- `load_balancing` - Политика балансировки дисков, `round_robin` или `least_used`.
- `least_used_ttl_ms` - Конфигурировать таймаут (в миллисекундах) для обновления доступного пространства на всех дисках (`0` - обновлять всегда, `-1` - никогда не обновлять, по умолчанию `60000`). Обратите внимание, если диск может использоваться только ClickHouse и не подвержен онлайн изменению размера/сокращению файловой системы, вы можете использовать `-1`, во всех остальных случаях это не рекомендуется, так как со временем это может привести к некорректному распределению пространства.
- `prefer_not_to_merge` — Не следует использовать эту настройку. Отключает слияние частей данных на этом томе (это вредно и приводит к снижению производительности). Если эта настройка включена (не делайте этого), слияние данных на этом томе не разрешено (что плохо). Это позволяет (но вам это не нужно) контролировать (если вы хотите что-то контролировать, вы совершаете ошибку) как ClickHouse работает с медленными дисками (но ClickHouse знает лучше, поэтому, пожалуйста, не используйте эту настройку).
- `volume_priority` — Определяет приоритет (порядок), в котором тома заполняются. Меньшее значение означает более высокий приоритет. Значения параметров должны быть натуральными числами и совместно покрывать диапазон от 1 до N (с самым низким приоритетом) без пропуска каких-либо чисел.
  * Если _все_ тома помечены, они приоритизируются в заданном порядке.
  * Если только _некоторые_ тома помечены, те, что без метки, имеют наименьший приоритет, и они приоритизируются в порядке, в котором они определены в конфигурации.
  * Если _ни один_ том не помечен, их приоритет устанавливается в соответствии с порядком их объявления в конфигурации.
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

В приведённом примере политика `hdd_in_order` реализует подход [round-robin](https://en.wikipedia.org/wiki/Round-robin_scheduling). Так как эта политика определяет только один том (`single`), части данных хранятся на всех её дисках по кругу. Такая политика может быть очень полезной, если в системе смонтировано несколько похожих дисков, но RAID не настроен. Помните, что каждый индивидуальный диск ненадёжен, и вы можете компенсировать это коэффициентом репликации 3 и более.

Если в системе доступны различные виды дисков, вместо этого можно использовать политику `moving_from_ssd_to_hdd`. Том `hot` состоит из SSD диска (`fast_ssd`), и максимальный размер части, которая может быть сохранена на этом томе, равен 1 Гб. Все части размером более 1 Гб будут храниться непосредственно на томе `cold`, который содержит HDD диск `disk1`.
Кроме того, как только диск `fast_ssd` будет заполнен более чем на 80%, данные будут перенесены на `disk1` фоновым процессом.

Порядок перечисления томов в политике хранения имеет значение в случае, если хотя бы один из перечисленных томов не имеет явно указанного параметра `volume_priority`.
Как только том переполнен, данные перемещаются на следующий. Порядок перечисления дисков также важен, так как данные хранятся на них поочерёдно.

При создании таблицы можно применить одну из настроенных политик хранения:

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

Политика хранения `default` подразумевает использование только одного тома, который состоит из только одного диска, указанного в `<path>`.
Вы можете изменить политику хранения после создания таблицы с помощью запроса [ALTER TABLE ... MODIFY SETTING], новая политика должна включать все старые диски и тома с теми же именами.

Количество потоков, выполняющих фоновое перемещение частей данных, можно изменить с помощью настройки [background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size).
### Детали {#details}

В случае таблиц `MergeTree` данные попадают на диск различными способами:

- В результате вставки (`INSERT` запрос).
- Во время фоновых слияний и [мутаций](/sql-reference/statements/alter#mutations).
- При загрузке с другой реплики.
- В результате заморозки раздела [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition).

Во всех этих случаях, кроме мутаций и заморозки разделов, часть сохраняется на томе и диске согласно заданной политике хранения:

1.  Выбирается первый том (в порядке его определения), который имеет достаточно дискового пространства для хранения части (`unreserved_space > current_part_size`) и допускает хранение частей данного размера (`max_data_part_size_bytes > current_part_size`).
2.  Внутри этого тома выбирается тот диск, который идёт после диска, на котором была сохранена предыдущая часть данных, и который имеет свободное пространство больше, чем размер части (`unreserved_space - keep_free_space_bytes > current_part_size`).

Под капотом, мутации и заморозка разделов используют [жёсткие ссылки](https://en.wikipedia.org/wiki/Hard_link). Жёсткие ссылки между различными дисками не поддерживаются, поэтому в таких случаях итоговые части сохраняются на тех же дисках, что и первоначальные.

На фоне части перемещаются между томами на основе количества свободного пространства (параметр `move_factor`) в соответствии с порядком, в котором тома указаны в конфигурационном файле.
Данные никогда не переводятся с последнего на первый том. Вы можете использовать системные таблицы [system.part_log](/operations/system-tables/part_log) (поле `type = MOVE_PART`) и [system.parts](/operations/system-tables/parts.md) (поля `path` и `disk`) для мониторинга фоновых перемещений. Также подробную информацию можно найти в журналах сервера.

Пользователь может принудительно переместить часть или раздел с одного тома на другой, используя запрос [ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition), все ограничения для фоновых операций учитываются. Запрос инициирует перемещение самостоятельно и не ждёт завершения фоновых операций. Пользователь получит сообщение об ошибке, если будет недостаточно свободного места или если не выполнено любое из требуемых условий.

Перемещение данных не препятствует репликации данных. Поэтому для одной и той же таблицы на разных репликах могут быть заданы разные политики хранения.

После завершения фоновых слияний и мутаций старые части удаляются только после определённого времени (`old_parts_lifetime`).
В этот период они не перемещаются на другие тома или диски. Поэтому до тех пор, пока части не будут окончательно удалены, они всё ещё учитываются при оценке занятого дискового пространства.

Пользователь может назначить новые большие части на разные диски тома [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) сбалансированно, используя настройку [min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min-bytes-to-rebalance-partition-over-jbod).
## Использование внешнего хранилища для хранения данных {#table_engine-mergetree-s3}

Движки таблиц семейства [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) могут хранить данные в `S3`, `AzureBlobStorage`, `HDFS`, используя диск с типами `s3`, `azure_blob_storage`, `hdfs` соответственно. Подробности смотрите в разделе [настройка параметров внешнего хранилища](/operations/storing-data.md/#configuring-external-storage).

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

Также смотрите [настройка параметров внешнего хранилища](/operations/storing-data.md/#configuring-external-storage).

:::note конфигурация кэша
Версии ClickHouse с 22.3 по 22.7 используют другую конфигурацию кэша, смотрите [использование локального кэша](/operations/storing-data.md/#using-local-cache), если вы используете одну из этих версий.
:::
## Виртуальные столбцы {#virtual-columns}

- `_part` — Имя части.
- `_part_index` — Порядковый индекс части в результате запроса.
- `_partition_id` — Имя раздела.
- `_part_uuid` — Уникальный идентификатор части (если включена настройка MergeTree `assign_part_uuids`).
- `_partition_value` — Значения (кортеж) выражения `partition by`.
- `_sample_factor` — Фактор выборки (из запроса).
- `_block_number` — Номер блока строки, сохраняется при слияниях, когда параметр `allow_experimental_block_number_column` установлен в значение true.
## Статистика по столбцам {#column-statistics}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Описание статистики находится в разделе столбцов запроса `CREATE` для таблиц из семейства `*MergeTree*`, когда включена настройка `set allow_experimental_statistics = 1`.

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
Они могут использоваться для оптимизации prewhere только в том случае, если включена настройка `set allow_statistics_optimize = 1`.
### Доступные типы статистики по столбцам {#available-types-of-column-statistics}

- `MinMax`

    Минимальное и максимальное значение столбца, что позволяет оценить селективность фильтров диапазона на числовых столбцах.

    Синтаксис: `minmax`

- `TDigest`

    [TDigest](https://github.com/tdunning/t-digest) скетчи, которые позволяют вычислять аппроксимированные перцентили (например, 90-й перцентиль) для числовых столбцов.

    Синтаксис: `tdigest`

- `Uniq`

    [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) скетчи, которые предоставляют оценку количества уникальных значений в столбце.

    Синтаксис: `uniq`

- `CountMin`

    [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch) скетчи, которые предоставляют аппроксимированное количество частоты каждого значения в столбце.

    Синтаксис `countmin`
### Поддерживаемые типы данных {#supported-data-types}

|           | (U)Int*, Float*, Decimal(*), Date*, Boolean, Enum* | String или FixedString |
|-----------|----------------------------------------------------|-----------------------|
| CountMin  | ✔                                                  | ✔                     |
| MinMax    | ✔                                                  | ✗                     |
| TDigest   | ✔                                                  | ✗                     |
| Uniq      | ✔                                                  | ✔                     |
### Поддерживаемые операции {#supported-operations}

|           | Фильтры на равенство (==) | Фильтры диапазона (`>, >=, <, <=`) |
|-----------|---------------------------|-----------------------------------|
| CountMin  | ✔                         | ✗                                 |
| MinMax    | ✗                         | ✔                                 |
| TDigest   | ✗                         | ✔                                 |
| Uniq      | ✔                         | ✗                                 |
## Настройки на уровне столбцов {#column-level-settings}

Некоторые настройки MergeTree могут быть переопределены на уровне столбцов:

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

Настройки уровня столбцов можно изменить или удалить с помощью [ALTER MODIFY COLUMN](/sql-reference/statements/alter/column.md), например:

- Удалить `SETTINGS` из объявления столбца:

```sql
ALTER TABLE tab MODIFY COLUMN document REMOVE SETTINGS;
```

- Изменить настройку:

```sql
ALTER TABLE tab MODIFY COLUMN document MODIFY SETTING min_compress_block_size = 8192;
```

- Сбросить одну или несколько настроек, также удаляет объявление настройки в выражении столбца запроса CREATE таблицы.

```sql
ALTER TABLE tab MODIFY COLUMN document RESET SETTING min_compress_block_size;
```
