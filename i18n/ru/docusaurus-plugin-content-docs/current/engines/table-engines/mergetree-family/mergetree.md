---
slug: '/engines/table-engines/mergetree-family/mergetree'
sidebar_label: MergeTree
sidebar_position: 11
description: '`MergeTree`-система движков таблиц предназначена для высокой скорости'
title: MergeTree
doc_type: reference
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MergeTree

Движок `MergeTree` и другие движки семейства `MergeTree` (например, `ReplacingMergeTree`, `AggregatingMergeTree`) являются наиболее часто используемыми и надежными движками таблиц в ClickHouse.

Движки таблиц семейства `MergeTree` предназначены для высоких скоростей загрузки данных и огромных объемов данных. Операции вставки создают части таблицы, которые объединяются фоновым процессом с другими частями таблицы.

Основные функции движков таблиц семейства `MergeTree`:

- Первичный ключ таблицы определяет порядок сортировки в каждой части таблицы (кластерный индекс). Первичный ключ также не ссылается на отдельные строки, а на блоки из 8192 строк, называемые гранулами. Это делает первичные ключи огромных наборов данных достаточно малыми, чтобы оставаться загруженными в основной памяти, при этом обеспечивая быстрый доступ к данным на диске.

- Таблицы могут быть разбиты на партиции с использованием произвольного выражения партиционирования. Устранение партиций гарантирует, что партиции не будут прочитаны, когда это позволяет запрос.

- Данные могут быть реплицированы между несколькими узлами кластера для обеспечения высокой доступности, резервирования и обновлений без простоя. См. [Репликация данных](/engines/table-engines/mergetree-family/replication.md).

- Движки таблиц `MergeTree` поддерживают различные виды статистики и методы выборки, чтобы помочь в оптимизации запросов.

:::note
Хотя название похоже, движок [Merge](/engines/table-engines/special/merge) отличается от движков `*MergeTree`.
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

Для подробного описания параметров см. оператор [CREATE TABLE](/sql-reference/statements/create/table.md)
### Операторы запроса {#mergetree-query-clauses}
#### ENGINE {#engine}

`ENGINE` — Имя и параметры движка. `ENGINE = MergeTree()`. Движок `MergeTree` не имеет параметров.
#### ORDER BY {#order_by}

`ORDER BY` — Ключ сортировки.

Кортеж имен столбцов или произвольные выражения. Пример: `ORDER BY (CounterID + 1, EventDate)`.

Если первичный ключ не определен (т.е. `PRIMARY KEY` не указан), ClickHouse использует ключ сортировки в качестве первичного ключа.

Если сортировка не требуется, вы можете использовать синтаксис `ORDER BY tuple()`. В противном случае, если настройка `create_table_empty_primary_key_by_default` включена, `ORDER BY tuple()` автоматически добавляется в операторы `CREATE TABLE`. См. [Выбор первичного ключа](#selecting-a-primary-key).
#### PARTITION BY {#partition-by}

`PARTITION BY` — [ключ партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key.md). Необязательно. В большинстве случаев вам не нужен ключ партиционирования, и если он вам нужен, обычно не требуется более детальная партиция, чем по месяцу. Партиционирование не ускоряет запросы (в отличие от выражения ORDER BY). Вы никогда не должны использовать слишком детальное партиционирование. Не партиционируйте данные по идентификаторам клиентов или именам (вместо этого сделайте идентификатор клиента или имя первым столбцом в выражении ORDER BY).

Для партиционирования по месяцу используйте выражение `toYYYYMM(date_column)`, где `date_column` — это столбец с датой типа [Date](/sql-reference/data-types/date.md). Имена партиций имеют формат `"YYYYMM"`.
#### PRIMARY KEY {#primary-key}

`PRIMARY KEY` — первичный ключ, если он [отличается от ключа сортировки](#choosing-a-primary-key-that-differs-from-the-sorting-key). Необязательно.

Указание ключа сортировки (с помощью оператора `ORDER BY`) неявно указывает первичный ключ. Обычно не требуется явно указывать первичный ключ в дополнение к ключу сортировки.
#### SAMPLE BY {#sample-by}

`SAMPLE BY` — Выражение выборки. Необязательно.

Если указано, оно должно входить в первичный ключ. Выражение выборки должно давать беззнаковое целое число.

Пример: `SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID))`.
#### TTL {#ttl}

`TTL` — Список правил, которые указывают срок хранения строк и логику автоматического перемещения частей [между дисками и томами](#table_engine-mergetree-multiple-volumes). Необязательно.

Выражение должно давать `Date` или `DateTime`, например, `TTL date + INTERVAL 1 DAY`.

Тип правила `DELETE|TO DISK 'xxx'|TO VOLUME 'xxx'|GROUP BY` указывает действие, которое должно быть выполнено с частью, если выражение выполнено (достигнуто текущее время): удаление устаревших строк, перемещение части (если выражение выполнено для всех строк в части) на указанный диск (`TO DISK 'xxx'`) или на том (`TO VOLUME 'xxx'`), или агрегация значений в устаревших строках. Тип правила по умолчанию — удаление (`DELETE`). Можно указать список нескольких правил, но не должно быть более одного правила `DELETE`.

Для получения дополнительных сведений см. [TTL для столбцов и таблиц](#table_engine-mergetree-ttl)
#### SETTINGS {#settings}

См. [Настройки MergeTree](../../../operations/settings/merge-tree-settings.md).

**Пример настройки секций**

```sql
ENGINE MergeTree() PARTITION BY toYYYYMM(EventDate) ORDER BY (CounterID, EventDate, intHash32(UserID)) SAMPLE BY intHash32(UserID) SETTINGS index_granularity=8192
```

В примере мы задаем партиционирование по месяцу.

Мы также задаем выражение для выборки в виде хеш-значения по ID пользователя. Это позволяет вам псевдослучайным образом распределить данные в таблице для каждого `CounterID` и `EventDate`. Если вы определяете оператор [SAMPLE](/sql-reference/statements/select/sample) при выборке данных, ClickHouse вернет равномерную псевдослучайную выборку данных для подмножества пользователей.

Настройку `index_granularity` можно опустить, так как 8192 — значение по умолчанию.

<details markdown="1">

<summary>Устаревший метод создания таблицы</summary>

:::note
Не используйте этот метод в новых проектах. Если возможно, переключите старые проекты на описанный выше метод.
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

- `date-column` — Название столбца типа [Date](/sql-reference/data-types/date.md). ClickHouse автоматически создает партиции по месяцу на основе этого столбца. Имена партиций имеют формат `"YYYYMM"`.
- `sampling_expression` — Выражение выборки.
- `(primary, key)` — Первичный ключ. Тип: [Tuple()](/sql-reference/data-types/tuple.md)
- `index_granularity` — Гранулярность индекса. Количество строк данных между "метками" индекса. Значение 8192 подходит для большинства задач.

**Пример**

```sql
MergeTree(EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID)), 8192)
```

Двигатель `MergeTree` настраивается таким же образом, как и в примере выше для метода основной конфигурации движка.
</details>
## Хранение данных {#mergetree-data-storage}

Таблица состоит из частей данных, отсортированных по первичному ключу.

Когда данные вставляются в таблицу, создаются отдельные части данных, и каждая из них сортируется лексикографически по первичному ключу. Например, если первичный ключ — `(CounterID, Date)`, данные в части отсортированы по `CounterID`, а внутри каждого `CounterID` они упорядочены по `Date`.

Данные, принадлежащие к разным партициям, разделяются на разные части. В фоновом режиме ClickHouse объединяет части данных для более эффективного хранения. Части, принадлежащие к разным партициям, не объединяются. Механизм слияния не гарантирует, что все строки с одинаковым первичным ключом будут находиться в одной части данных.

Части данных могут храниться в формате `Wide` или `Compact`. В формате `Wide` каждый столбец хранится в отдельном файле в файловой системе, в формате `Compact` все столбцы хранятся в одном файле. Формат `Compact` можно использовать для повышения производительности небольших и частых вставок.

Формат хранения данных контролируется настройками `min_bytes_for_wide_part` и `min_rows_for_wide_part` движка таблицы. Если количество байт или строк в части данных меньше, чем значение соответствующей настройки, часть хранится в формате `Compact`. В противном случае она хранится в формате `Wide`. Если ни одна из этих настроек не установлена, части данных хранятся в формате `Wide`.

Каждая часть данных логически делится на гранулы. Гранула — это наименьший неделимый набор данных, который ClickHouse читает при выборке данных. ClickHouse не разделяет строки или значения, поэтому каждая гранула всегда содержит целое число строк. Первая строка гранулы помечена значением первичного ключа для строки. Для каждой части данных ClickHouse создает файл индекса, который хранит метки. Для каждого столбца, независимо от того, находится он в первичном ключе или нет, ClickHouse также хранит те же метки. Эти метки позволяют находить данные напрямую в файловых столбцах.

Размер гранулы ограничен настройками `index_granularity` и `index_granularity_bytes` движка таблицы. Количество строк в грануле находится в диапазоне `[1, index_granularity]`, в зависимости от размера строк. Размер гранулы может превышать `index_granularity_bytes`, если размер одной строки больше значения настройки. В этом случае размер гранулы равен размеру строки.
## Первичные ключи и индексы в запросах {#primary-keys-and-indexes-in-queries}

Рассмотрим в качестве примера первичный ключ `(CounterID, Date)`. В этом случае сортировка и индекс могут быть проиллюстрированы следующим образом:

```text
Whole data:     [---------------------------------------------]
CounterID:      [aaaaaaaaaaaaaaaaaabbbbcdeeeeeeeeeeeeefgggggggghhhhhhhhhiiiiiiiiikllllllll]
Date:           [1111111222222233331233211111222222333211111112122222223111112223311122333]
Marks:           |      |      |      |      |      |      |      |      |      |      |
                a,1    a,2    a,3    b,3    e,2    e,3    g,1    h,2    i,1    i,3    l,3
Marks numbers:   0      1      2      3      4      5      6      7      8      9      10
```

Если запрос данных указывает:

- `CounterID in ('a', 'h')`, сервер считывает данные в диапазонах меток `[0, 3)` и `[6, 8)`.
- `CounterID IN ('a', 'h') AND Date = 3`, сервер считывает данные в диапазонах меток `[1, 3)` и `[7, 8)`.
- `Date = 3`, сервер считывает данные в диапазоне меток `[1, 10]`.

Приведенные примеры показывают, что всегда более эффективно использовать индекс, чем полное сканирование.

Разреженный индекс позволяет прочитать дополнительные данные. При чтении одного диапазона первичного ключа можно прочитать до `index_granularity * 2` дополнительных строк в каждом блоке данных.

Разреженные индексы позволяют работать с очень большим количеством строк таблицы, так как в большинстве случаев такие индексы помещаются в оперативную память компьютера.

ClickHouse не требует уникального первичного ключа. Вы можете вставлять несколько строк с одинаковым первичным ключом.

Вы можете использовать выражения типа `Nullable` в операторах `PRIMARY KEY` и `ORDER BY`, но это сильно не рекомендуется. Чтобы разрешить эту функцию, включите настройку [allow_nullable_key](/operations/settings/merge-tree-settings/#allow_nullable_key). Принцип [NULLS_LAST](/sql-reference/statements/select/order-by.md/#sorting-of-special-values) применяется для значений `NULL` в операторе `ORDER BY`.
### Выбор первичного ключа {#selecting-a-primary-key}

Количество столбцов в первичном ключе явно не ограничено. В зависимости от структуры данных вы можете включить в первичный ключ больше или меньше столбцов. Это может:

- Улучшить производительность индекса.

    Если первичный ключ — `(a, b)`, то добавление другого столбца `c` улучшит производительность, если выполнены следующие условия:

  - Существуют запросы с условием для столбца `c`.
  - Долгие диапазоны данных (в несколько раз длиннее, чем `index_granularity`) с одинаковыми значениями для `(a, b)` распространены. Иными словами, когда добавление другого столбца позволяет пропустить довольно длинные диапазоны данных.

- Улучшить сжатие данных.

    ClickHouse сортирует данные по первичному ключу, поэтому чем выше согласованность, тем лучше сжатие.

- Обеспечить дополнительную логику при слиянии частей данных в движках [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) и [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md).

    В этом случае имеет смысл указать *ключ сортировки*, который отличается от первичного ключа.

Длинный первичный ключ негативно скажется на производительности вставки и памяти, но дополнительные столбцы в первичном ключе не влияют на производительность ClickHouse при выполнении запросов `SELECT`.

Вы можете создать таблицу без первичного ключа, используя синтаксис `ORDER BY tuple()`. В этом случае ClickHouse хранит данные в порядке вставки. Если вы хотите сохранить порядок данных при вставке данных с помощью запросов `INSERT ... SELECT`, установите [max_insert_threads = 1](/operations/settings/settings#max_insert_threads).

Чтобы выбрать данные в первоначальном порядке, используйте запросы `SELECT` [в одном потоке](/operations/settings/settings.md/#max_threads).
### Выбор первичного ключа, отличающегося от ключа сортировки {#choosing-a-primary-key-that-differs-from-the-sorting-key}

Можно указать первичный ключ (выражение со значениями, которые записываются в файл индекса для каждой метки), который отличается от ключа сортировки (выражение для сортировки строк в частях данных). В этом случае выражение первичного ключа должно быть префиксом выражения ключа сортировки.

Эта функция полезна при использовании движков [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree.md) и [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree.md). В общем случае, когда используются эти движки, таблица имеет два типа столбцов: *измерения* и *показатели*. Типичные запросы агрегируют значения столбцов показателей с произвольным `GROUP BY` и фильтрацией по измерениям. Поскольку SummingMergeTree и AggregatingMergeTree аггрегируют строки с одинаковыми значениями ключа сортировки, естественно добавлять все измерения к нему. В результате выражение ключа состоит из длинного списка столбцов, и этот список часто должен обновляться с добавлением новых измерений.

В этом случае имеет смысл оставить только несколько столбцов в первичном ключе, которые обеспечат эффективные диапазонные сканирования, и добавить остальные измеренные столбцы в кортеж ключа сортировки.

[ALTER](/sql-reference/statements/alter/index.md) ключа сортировки — это легковесная операция, потому что когда новый столбец одновременно добавляется в таблицу и в ключ сортировки, существующие части данных не требуют изменения. Поскольку старый ключ сортировки является префиксом нового ключа сортировки и в вновь добавленном столбце нет данных, данные сортируются как по старым, так и по новым ключам сортировки в момент изменения таблицы.
### Использование индексов и партиций в запросах {#use-of-indexes-and-partitions-in-queries}

Для запросов `SELECT` ClickHouse анализирует, может ли быть использован индекс. Индекс может быть использован, если оператор `WHERE/PREWHERE` содержит выражение (в качестве одного из соединительных элементов или полностью), представляющее операцию сравнения на равенство или неравенство, или если он содержит `IN` или `LIKE` с фиксированным префиксом по столбцам или выражениям, которые находятся в первичном ключе или ключе партиционирования, или на определенных частично повторяющихся функциях этих столбцов, или логических связях этих выражений.

Таким образом, можно быстро запускать запросы по одному или нескольким диапазонам первичного ключа. В этом примере запросы будут выполняться быстро при выполнении для конкретного метки отслеживания, для конкретного метки и диапазона дат, для конкретного метки и даты, для нескольких меток с диапазоном дат и так далее.

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

ClickHouse будет использовать индекс первичного ключа для отсеивания неподходящих данных и ключ партиционирования по месяцам для отсеивания партиций, которые находятся вне неподходящих диапазонов дат.

Приведенные выше запросы показывают, что индекс используется даже для сложных выражений. Чтение из таблицы организовано так, чтобы использование индекса не могло быть медленнее полного сканирования.

В приведенном ниже примере индекс не может быть использован.

```sql
SELECT count() FROM table WHERE CounterID = 34 OR URL LIKE '%upyachka%'
```

Чтобы проверить, может ли ClickHouse использовать индекс при выполнении запроса, используйте настройки [force_index_by_date](/operations/settings/settings.md/#force_index_by_date) и [force_primary_key](/operations/settings/settings#force_primary_key).

Ключ для партиционирования по месяцам позволяет читать только те блоки данных, которые содержат даты из подходящего диапазона. В этом случае блок данных может содержать данные для нескольких дат (до целого месяца). В пределах блока данные сортируются по первичному ключу, который может не содержать дату как первый столбец. Из-за этого использование запроса с только условием даты, не указывающим префикс первичного ключа, приведет к считыванию большего объема данных, чем для одной даты.
### Использование индекса для частично монотонных первичных ключей {#use-of-index-for-partially-monotonic-primary-keys}

Рассмотрим, например, дни месяца. Они образуют [монотонную последовательность](https://en.wikipedia.org/wiki/Monotonic_function) для одного месяца, но не монотонны для более длительных диапазонов. Это частично монотонная последовательность. Если пользователь создает таблицу с частично монотонным первичным ключом, ClickHouse создает разреженный индекс как обычно. Когда пользователь выбирает данные из такой таблицы, ClickHouse анализирует условия запроса. Если пользователь хочет получить данные между двумя метками индекса, и обе эти метки попадают в один месяц, ClickHouse может использовать индекс в этом конкретном случае, поскольку он может вычислить расстояние между параметрами запроса и метками индекса.

ClickHouse не может использовать индекс, если значения первичного ключа в диапазоне параметров запроса не представляют собой монотонную последовательность. В этом случае ClickHouse использует метод полного сканирования.

ClickHouse использует эту логику не только для последовательностей дней месяца, но и для любого первичного ключа, который представляет собой частично монотонную последовательность.
### Индексы для пропуска данных {#table_engine-mergetree-data_skipping-indexes}

Декларация индекса содержится в разделе столбцов запроса `CREATE`.

```sql
INDEX index_name expr TYPE type(...) [GRANULARITY granularity_value]
```

Для таблиц из семейства `*MergeTree` можно указать индексы пропуска данных.

Эти индексы агрегации некоторой информации о заданном выражении по блокам, которые состоят из `granularity_value` гранул (размер гранулы задается настройкой `index_granularity` в движке таблицы). Затем эти агрегаты используются в запросах `SELECT` для сокращения объема данных для чтения с диска, пропуская большие блоки данных, для которых запрос `where` не может быть удовлетворен.

Клаузу `GRANULARITY` можно опустить, значение по умолчанию для `granularity_value` равно 1.

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
SELECT count() FROM table WHERE u64 * i32 >= 1234
SELECT count() FROM table WHERE u64 * length(s) == 1234
```

Индексы пропуска данных также могут быть созданы для составных столбцов:

```sql
-- on columns of type Map:
INDEX map_key_index mapKeys(map_column) TYPE bloom_filter
INDEX map_value_index mapValues(map_column) TYPE bloom_filter

-- on columns of type Tuple:
INDEX tuple_1_index tuple_column.1 TYPE bloom_filter
INDEX tuple_2_index tuple_column.2 TYPE bloom_filter

-- on columns of type Nested:
INDEX nested_1_index col.nested_col1 TYPE bloom_filter
INDEX nested_2_index col.nested_col2 TYPE bloom_filter
```
### Типы индексов пропуска {#skip-index-types}

Движок таблицы `MergeTree` поддерживает следующие типы индексов пропуска. Для получения дополнительной информации о том, как индексы пропуска могут быть использованы для оптимизации производительности, см. ["Понимание индексов пропуска данных ClickHouse"](/optimize/skipping-indexes).

- [`MinMax`](#minmax) индекс
- [`Set`](#set) индекс
- [`bloom_filter`](#bloom-filter) индекс
- [`ngrambf_v1`](#n-gram-bloom-filter) индекс
- [`tokenbf_v1`](#token-bloom-filter) индекс
#### MinMax индекс пропуска {#minmax}

Для каждого индекса гранулы хранятся минимальные и максимальные значения выражения. (Если выражение имеет тип `tuple`, оно хранит минимальные и максимальные значения для каждого элемента кортежа.)

```text title="Syntax"
minmax
```
#### Set {#set}

Для каждой индекса гранулы хранится не более `max_rows` уникальных значений заданного выражения. `max_rows = 0` означает "хранить все уникальные значения".

```text title="Syntax"
set(max_rows)
```
#### Bloom filter {#bloom-filter}

Для каждой индекса гранулы хранится [фильтр Блума](https://en.wikipedia.org/wiki/Bloom_filter) для заданных столбцов.

```text title="Syntax"
bloom_filter([false_positive_rate])
```

Параметр `false_positive_rate` может принимать значение от 0 до 1 (по умолчанию: `0.025`) и указывает вероятность генерирования положительного значения (что увеличивает объем данных для чтения).

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

:::note Тип данных Map: указание создания индекса с ключами или значениями
Для типа данных `Map` клиент может указать, должен ли индекс создаваться для ключей или для значений с помощью функций [`mapKeys`](/sql-reference/functions/tuple-map-functions.md/#mapkeys) или [`mapValues`](/sql-reference/functions/tuple-map-functions.md/#mapvalues).
:::
#### N-gram фильтр Блума {#n-gram-bloom-filter}

Для каждой индекса гранулы хранится [фильтр Блума](https://en.wikipedia.org/wiki/Bloom_filter) для [n-грамм](https://en.wikipedia.org/wiki/N-gram) заданных столбцов.

```text title="Syntax"
ngrambf_v1(n, size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```

| Параметр                       | Описание |
|---------------------------------|-------------|
| `n`                             | Размер n-граммы  |
| `size_of_bloom_filter_in_bytes` | Размер фильтра Блума в байтах. Здесь можно использовать большое значение, например, `256` или `512`, так как оно может быть хорошо сжато). |
|`number_of_hash_functions`       | Количество функций хеширования, используемых в фильтре Блума. |
|`random_seed` | Сид для функций хеширования фильтра Блума. |

Этот индекс работает только с следующими типами данных:
- [`String`](/sql-reference/data-types/string.md)
- [`FixedString`](/sql-reference/data-types/fixedstring.md)
- [`Map`](/sql-reference/data-types/map.md)

Чтобы оценить параметры `ngrambf_v1`, вы можете использовать следующие [пользовательские функции (UDF)](/sql-reference/statements/create/function.md).

```sql title="UDFs for ngrambf_v1"
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

Чтобы использовать эти функции, вам нужно указать как минимум два параметра:
- `total_number_of_all_grams`
- `probability_of_false_positives`

Например, в грануле имеются `4300` n-грамм, и вы ожидаете, что ложные срабатывания будут менее `0.0001`.
Остальные параметры затем можно оценить, выполнив следующие запросы:

```sql
--- estimate number of bits in the filter
SELECT bfEstimateBmSize(4300, 0.0001) / 8 AS size_of_bloom_filter_in_bytes;

┌─size_of_bloom_filter_in_bytes─┐
│                         10304 │
└───────────────────────────────┘

--- estimate number of hash functions
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) as number_of_hash_functions

┌─number_of_hash_functions─┐
│                       13 │
└──────────────────────────┘
```

Конечно, вы также можете использовать эти функции для оценки параметров для других условий.
Эти функции ссылаются на калькулятор фильтра Блума [здесь](https://hur.st/bloomfilter).
#### Token bloom filter {#token-bloom-filter}

Фильтр токенов Блума такой же, как `ngrambf_v1`, но вместо n-грамм хранит токены (последовательности, разделенные символами, не являющимися алфавитно-цифровыми).

```text title="Syntax"
tokenbf_v1(size_of_bloom_filter_in_bytes, number_of_hash_functions, random_seed)
```
#### Векторное сходство {#vector-similarity}

Поддерживает приближенный поиск ближайших соседей, см. [здесь](annindexes.md) для подробностей.
### Текст (экспериментальный) {#text}

Поддержка полнотекстового поиска, см. [здесь](invertedindexes.md) для подробностей.
### Поддержка функций {#functions-support}

Условия в операторе `WHERE` содержат вызовы функций, которые работают со столбцами. Если столбец является частью индекса, ClickHouse пытается использовать этот индекс при выполнении функций. ClickHouse поддерживает различные подсходные группы функций для использования индексов.

Индексы типа `set` могут использоваться всеми функциями. Другие типы индексов поддерживаются следующим образом:

| Функция (оператор) / Индекс                                                                                                   | первичный ключ | minmax | ngrambf_v1 | tokenbf_v1 | bloom_filter | text |
|-------------------------------------------------------------------------------------------------------------------------------|----------------|--------|------------|------------|--------------|------|
| [equals (=, ==)](/sql-reference/functions/comparison-functions.md/#equals)                                                     | ✔              | ✔      | ✔          | ✔          | ✔            | ✔    |
| [notEquals(!=, &lt;&gt;)](/sql-reference/functions/comparison-functions.md/#notEquals)                                         | ✔              | ✔      | ✔          | ✔          | ✔            | ✔    |
| [like](/sql-reference/functions/string-search-functions.md/#like)                                                              | ✔              | ✔      | ✔          | ✔          | ✗            | ✔    |
| [notLike](/sql-reference/functions/string-search-functions.md/#notlike)                                                        | ✔              | ✔      | ✔          | ✔          | ✗            | ✔    |
| [match](/sql-reference/functions/string-search-functions.md/#match)                                                            | ✗              | ✗      | ✔          | ✔          | ✗            | ✔    |
| [startsWith](/sql-reference/functions/string-functions.md/#startswith)                                                         | ✔              | ✔      | ✔          | ✔          | ✗            | ✔    |
| [endsWith](/sql-reference/functions/string-functions.md/#endswith)                                                             | ✗              | ✗      | ✔          | ✔          | ✗            | ✔    |
| [multiSearchAny](/sql-reference/functions/string-search-functions.md/#multisearchany)                                          | ✗              | ✗      | ✔          | ✗          | ✗            | ✗    |
| [in](/sql-reference/functions/in-functions)                                                                                    | ✔              | ✔      | ✔          | ✔          | ✔            | ✔    |
| [notIn](/sql-reference/functions/in-functions)                                                                                 | ✔              | ✔      | ✔          | ✔          | ✔            | ✔    |
| [less (`<`)](/sql-reference/functions/comparison-functions.md/#less)                                                           | ✔              | ✔      | ✗          | ✗          | ✗            | ✗    |
| [greater (`>`)](/sql-reference/functions/comparison-functions.md/#greater)                                                     | ✔              | ✔      | ✗          | ✗          | ✗            | ✗    |
| [lessOrEquals (`<=`)](/sql-reference/functions/comparison-functions.md/#lessOrEquals)                                          | ✔              | ✔      | ✗          | ✗          | ✗            | ✗    |
| [greaterOrEquals (`>=`)](/sql-reference/functions/comparison-functions.md/#greaterOrEquals)                                    | ✔              | ✔      | ✗          | ✗          | ✗            | ✗    |
| [empty](/sql-reference/functions/array-functions/#empty)                                                                       | ✔              | ✔      | ✗          | ✗          | ✗            | ✗    |
| [notEmpty](/sql-reference/functions/array-functions/#notEmpty)                                                                 | ✔              | ✔      | ✗          | ✗          | ✗            | ✗    |
| [has](/sql-reference/functions/array-functions#has)                                                                            | ✗              | ✗      | ✔          | ✔          | ✔            | ✔    |
| [hasAny](/sql-reference/functions/array-functions#hasAny)                                                                      | ✗              | ✗      | ✔          | ✔          | ✔            | ✗    |
| [hasAll](/sql-reference/functions/array-functions#hasAll)                                                                      | ✗              | ✗      | ✔          | ✔          | ✔            | ✗    |
| [hasToken](/sql-reference/functions/string-search-functions.md/#hastoken)                                                      | ✗              | ✗      | ✗          | ✔          | ✗            | ✔    |
| [hasTokenOrNull](/sql-reference/functions/string-search-functions.md/#hastokenornull)                                          | ✗              | ✗      | ✗          | ✔          | ✗            | ✔    |
| [hasTokenCaseInsensitive (`*`)](/sql-reference/functions/string-search-functions.md/#hastokencaseinsensitive)                  | ✗              | ✗      | ✗          | ✔          | ✗            | ✗    |
| [hasTokenCaseInsensitiveOrNull (`*`)](/sql-reference/functions/string-search-functions.md/#hastokencaseinsensitiveornull)      | ✗              | ✗      | ✗          | ✔          | ✗            | ✗    |
| [hasAnyTokens](/sql-reference/functions/string-search-functions.md/#hasanytokens)                                              | ✗              | ✗      | ✗          | ✗          | ✗            | ✔    |
| [hasAllTokens](/sql-reference/functions/string-search-functions.md/#hasalltokens)                                              | ✗              | ✗      | ✗          | ✗          | ✗            | ✔    |
| [mapContains](/sql-reference/functions/tuple-map-functions#mapcontains)                                                        | ✗              | ✗      | ✗          | ✗          | ✗            | ✔    |

Функции с постоянным аргументом, который меньше размера n-граммы, не могут быть использованы индексов `ngrambf_v1` для оптимизации запроса.

(*) Для того чтобы `hasTokenCaseInsensitive` и `hasTokenCaseInsensitiveOrNull` были эффективными, индекс `tokenbf_v1` должен быть создан на преобразованных в нижний регистр данных, например, `INDEX idx (lower(str_col)) TYPE tokenbf_v1(512, 3, 0)`.

:::note
Фильтры Блума могут иметь ложные положительные срабатывания, поэтому индексы `ngrambf_v1`, `tokenbf_v1` и `bloom_filter` не могут быть использованы для оптимизации запросов, где ожидается, что результат функции будет ложным.

Например:

- Могут быть оптимизированы:
  - `s LIKE '%test%'`
  - `NOT s NOT LIKE '%test%'`
  - `s = 1`
  - `NOT s != 1`
  - `startsWith(s, 'test')`
- Не могут быть оптимизированы:
  - `NOT s LIKE '%test%'`
  - `s NOT LIKE '%test%'`
  - `NOT s = 1`
  - `s != 1`
  - `NOT startsWith(s, 'test')`
:::
## Проекции {#projections}
Проекции похожи на [материализованные представления](/sql-reference/statements/create/view), но определены на уровне части. Они обеспечивают гарантии согласованности вместе с автоматическим использованием в запросах.

:::note
При реализации проекций вы также должны учитывать настройку [force_optimize_projection](/operations/settings/settings#force_optimize_projection).
:::

Проекции не поддерживаются в операторах `SELECT` с модификатором [FINAL](/sql-reference/statements/select/from#final-modifier).
### Запрос проекции {#projection-query}
Запрос проекции — это то, что определяет проекцию. Он неявно выбирает данные из родительской таблицы.
**Синтаксис**

```sql
SELECT <column list expr> [GROUP BY] <group keys expr> [ORDER BY] <expr>
```

Проекции могут быть изменены или удалены с помощью оператора [ALTER](/sql-reference/statements/alter/projection.md).
### Хранение проекций {#projection-storage}
Проекции хранятся внутри каталога части. Это похоже на индекс, но содержит подкаталог, который хранит анонимную часть таблицы `MergeTree`. Таблица вызывается определяющим запросом проекции. Если имеется оператор `GROUP BY`, подлежащий движок хранения становится [AggregatingMergeTree](aggregatingmergetree.md), и все агрегатные функции преобразуются в `AggregateFunction`. Если есть оператор `ORDER BY`, таблица `MergeTree` использует его как выражение первичного ключа. Во время процесса слияния часть проекции объединяется через рутину слияния ее хранилища. Контрольная сумма части родительской таблицы объединяется с частью проекции. Другие операции по обслуживанию аналогичны индексам пропуска.
### Анализ запросов {#projection-query-analysis}
1. Проверьте, может ли проекция быть использована для ответа на данный запрос, то есть генерирует ли она тот же ответ, что и запрос к базовой таблице.
2. Выберите наилучшее подходящее соответствие, которое содержит наименьшее количество гранул для чтения.
3. Конвейер запросов, использующий проекции, будет отличаться от конвейера, использующего оригинальные части. Если проекция отсутствует в некоторых частях, мы можем добавить конвейер для "проектирования" его на лету.

## Конкурентный доступ к данным {#concurrent-data-access}

Для конкурентного доступа к таблице мы используем многоверсионность. Другими словами, когда таблица одновременно читается и обновляется, данные читаются из набора частей, который актуален на момент запроса. Долгие блокировки отсутствуют. Вставки не мешают операциям чтения.

Чтение из таблицы автоматически параллелизуется.

## TTL для колонок и таблиц {#table_engine-mergetree-ttl}

Определяет срок жизни значений.

Клаузу `TTL` можно задать как для всей таблицы, так и для каждой отдельной колонки. `TTL` на уровне таблицы также может указывать логику автоматического перемещения данных между дисками и объемами или рекомпрессии частей, срок действия всех данных в которых истек.

Выражения должны оцениваться как тип данных [Date](/sql-reference/data-types/date.md), [Date32](/sql-reference/data-types/date32.md), [DateTime](/sql-reference/data-types/datetime.md) или [DateTime64](/sql-reference/data-types/datetime64.md).

**Синтаксис**

Установка времени жизни для колонки:

```sql
TTL time_column
TTL time_column + interval
```

Чтобы определить `interval`, используйте операторы [временного интервала](/sql-reference/operators#operators-for-working-with-dates-and-times), например:

```sql
TTL date_time + INTERVAL 1 MONTH
TTL date_time + INTERVAL 15 HOUR
```
### TTL колонок {#mergetree-column-ttl}

Когда значения в колонке истекают, ClickHouse заменяет их значениями по умолчанию для типа данных колонки. Если все значения колонки в части данных истекают, ClickHouse удаляет эту колонку из части данных в файловой системе.

Клаузу `TTL` нельзя использовать для ключевых колонок.

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
#### Добавление TTL в колонку существующей таблицы {#adding-ttl-to-a-column-of-an-existing-table}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 DAY;
```
#### Изменение TTL колонки {#altering-ttl-of-the-column}

```sql
ALTER TABLE tab
    MODIFY COLUMN
    c String TTL d + INTERVAL 1 MONTH;
```
### TTL таблицы {#mergetree-table-ttl}

Таблица может иметь выражение для удаления истекших строк и несколько выражений для автоматического перемещения частей между [дисками или объемами](#table_engine-mergetree-multiple-volumes). Когда строки в таблице истекают, ClickHouse удаляет все соответствующие строки. Для перемещения или рекомпрессии частей все строки части должны удовлетворять критериям выражения `TTL`.

```sql
TTL expr
    [DELETE|RECOMPRESS codec_name1|TO DISK 'xxx'|TO VOLUME 'xxx'][, DELETE|RECOMPRESS codec_name2|TO DISK 'aaa'|TO VOLUME 'bbb'] ...
    [WHERE conditions]
    [GROUP BY key_expr [SET v1 = aggr_func(v1) [, v2 = aggr_func(v2) ...]] ]
```

Тип правила TTL может следовать за каждым выражением TTL. Это влияет на действие, которое будет выполнено, как только выражение будет удовлетворено (достигнет текущего времени):

- `DELETE` - удалить истекшие строки (действие по умолчанию);
- `RECOMPRESS codec_name` - рекомпрессировать часть данных с помощью `codec_name`;
- `TO DISK 'aaa'` - переместить часть на диск `aaa`;
- `TO VOLUME 'bbb'` - переместить часть на диск `bbb`;
- `GROUP BY` - агрегировать истекшие строки.

Действие `DELETE` может использоваться вместе с клаузой `WHERE`, чтобы удалить только некоторые из истекших строк на основе условия фильтрации:
```sql
TTL time_column + INTERVAL 1 MONTH DELETE WHERE column = 'value'
```

Выражение `GROUP BY` должно быть префиксом первичного ключа таблицы.

Если колонка не является частью выражения `GROUP BY` и не задана явно в клаузе `SET`, то в результирующей строке она содержит случайное значение из сгруппированных строк (как если бы к ней применялась агрегатная функция `any`).

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

Создание таблицы, в которой строки истекают через месяц. Истекшие строки, где даты - понедельники, удаляются:

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

Создание таблицы, где истекшие строки агрегируются. В результирующих строках `x` содержится максимальное значение среди сгруппированных строк, `y` — минимальное значение, и `d` — любое случайное значение из сгруппированных строк.

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

Когда ClickHouse обнаруживает, что данные истекли, он выполняет не плановое слияние. Для контроля частоты таких слияний вы можете установить `merge_with_ttl_timeout`. Если значение слишком низкое, будет выполняться много не плановых слияний, которые могут потреблять много ресурсов.

Если вы выполняете запрос `SELECT` между слияниями, вы можете получить истекшие данные. Чтобы избежать этого, используйте запрос [OPTIMIZE](/sql-reference/statements/optimize.md) перед `SELECT`.

**См. также**

- Настройка [ttl_only_drop_parts](/operations/settings/merge-tree-settings#ttl_only_drop_parts)

## Типы дисков {#disk-types}

В дополнение к локальным блочным устройствам, ClickHouse поддерживает следующие типы хранения:
- [`s3` для S3 и MinIO](#table_engine-mergetree-s3)
- [`gcs` для GCS](/integrations/data-ingestion/gcs/index.md/#creating-a-disk)
- [`blob_storage_disk` для Azure Blob Storage](/operations/storing-data#azure-blob-storage)
- [`hdfs` для HDFS](/engines/table-engines/integrations/hdfs)
- [`web` для только чтения через веб](/operations/storing-data#web-storage)
- [`cache` для локального кэширования](/operations/storing-data#using-local-cache)
- [`s3_plain` для резервных копий в S3](/operations/backup#backuprestore-using-an-s3-disk)
- [`s3_plain_rewritable` для неизменяемых, не реплицированных таблиц в S3](/operations/storing-data.md#s3-plain-rewritable-storage)

## Использование нескольких блочных устройств для хранения данных {#table_engine-mergetree-multiple-volumes}
### Введение {#introduction}

Семейство таблиц `MergeTree` может хранить данные на нескольких блочных устройствах. Это может быть полезно, когда данные определенной таблицы неявно разделены на "горячие" и "холодные". Самые последние данные запрашиваются регулярно, но требуют лишь небольшого объема пространства. Напротив, исторические данные с мясистыми хвостами запрашиваются редко. Если доступны несколько дисков, "горячие" данные могут располагаться на быстрых дисках (например, NVMe SSD или в памяти), в то время как "холодные" данные — на относительно медленных (например, HDD).

Часть данных является минимально перемещаемой единицей для таблиц с движком `MergeTree`. Данные, принадлежащие одной части, хранятся на одном диске. Части данных могут перемещаться между дисками в фоновом режиме (в соответствии с настройками пользователя), а также с помощью запросов [ALTER](/sql-reference/statements/alter/partition).

### Термины {#terms}

- Диск — блочное устройство, смонтированное в файловую систему.
- Диск по умолчанию — диск, который хранит путь, указанный в настройке сервера [path](/operations/server-configuration-parameters/settings.md/#path).
- Объем — упорядоченный набор равных дисков (аналогично [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures)).
- Политика хранения — набор объемов и правила перемещения данных между ними.

Имена, присвоенные описанным сущностям, можно найти в системных таблицах, [system.storage_policies](/operations/system-tables/storage_policies) и [system.disks](/operations/system-tables/disks). Чтобы применить одну из сконфигурированных политик хранения для таблицы, используйте настройку `storage_policy` семейства таблиц с движком `MergeTree`.
### Конфигурация {#table_engine-mergetree-multiple-volumes_configure}

Диски, объемы и политики хранения должны быть объявлены внутри тега `<storage_configuration>` либо в файле в директории `config.d`.

:::tip
Диски также могут быть объявлены в секции `SETTINGS` запроса. Это полезно
для анализа ad-hoc, чтобы временно прикрепить диск, который, например, расположен по URL.
Смотрите [динамическое хранилище](/operations/storing-data#dynamic-configuration) для получения дополнительных деталей.
:::

Структура конфигурации:

```xml
<storage_configuration>
    <disks>
        <disk_name_1> <!-- disk name -->
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

- `<disk_name_N>` — имя диска. Имена должны быть различными для всех дисков.
- `path` — путь, по которому сервер будет хранить данные (папки `data` и `shadow`), должен заканчиваться на '/'.
- `keep_free_space_bytes` — количество свободного места на диске, которое нужно зарезервировать.

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
                    <!-- configuration -->
                </volume_name_2>
                <!-- more volumes -->
            </volumes>
            <move_factor>0.2</move_factor>
        </policy_name_1>
        <policy_name_2>
            <!-- configuration -->
        </policy_name_2>

        <!-- more policies -->
    </policies>
    ...
</storage_configuration>
```

Теги:

- `policy_name_N` — имя политики. Имена политик должны быть уникальными.
- `volume_name_N` — имя объема. Имена объемов должны быть уникальными.
- `disk` — диск внутри объема.
- `max_data_part_size_bytes` — максимальный размер части, который может храниться на любом из дисков объема. Если оценочный размер объединенной части превышает `max_data_part_size_bytes`, то эта часть будет записана в следующий объем. Это позволяет хранить новые/малые части на горячем (SSD) объеме и перемещать их на холодный (HDD) объем, когда они достигают большого размера. Не используйте эту настройку, если ваша политика имеет только один объем.
- `move_factor` — когда количество доступного пространства становится ниже этого фактора, данные автоматически начинают перемещаться на следующий объем, если он есть (по умолчанию 0.1). ClickHouse сортирует существующие части по размеру от большего к меньшему (в порядке убывания) и выбирает части с общей размером, достаточным для выполнения условия `move_factor`. Если общего размера всех частей недостаточно, все части будут перемещены.
- `perform_ttl_move_on_insert` — отключает перемещение TTL при вставке части данных. По умолчанию (если включено), если мы вставляем часть данных, которая уже истекла по правилу перемещения TTL, она немедленно попадает в объем/диск, указанный в правиле перемещения. Это может значительно замедлить вставку в случае, если целевой объем/диск медленный (например, S3). Если отключено, то уже истекшая часть данных записывается в объем по умолчанию, а затем сразу же перемещается в объем TTL.
- `load_balancing` - Политика балансировки дисков, `round_robin` или `least_used`.
- `least_used_ttl_ms` - Настройка таймаута (в миллисекундах) для обновления доступного пространства на всех дисках (`0` - всегда обновлять, `-1` - никогда не обновлять, по умолчанию `60000`). Обратите внимание, если диск может использоваться только ClickHouse и не подлежит онлайн-изменению/уменьшению файловой системы, вы можете использовать `-1`, во всех других случаях это не рекомендуется, так как в конечном итоге это приведет к неправильному распределению пространства.
- `prefer_not_to_merge` — Не используйте эту настройку. Отключает слияние частей данных на этом объеме (это вредно и приводит к снижению производительности). Когда эта настройка включена (не делайте этого), слияние данных на этом объеме не разрешается (что плохо). Это позволяет (но вам это не нужно) контролировать (если вы хотите что-то контролировать, вы делаете ошибку) то, как ClickHouse работает с медленными дисками (но ClickHouse знает лучше, так что не используйте эту настройку).
- `volume_priority` — Определяет приоритет (порядок), в котором заполняются объемы. Более низкое значение означает более высокий приоритет. Значения параметра должны быть натуральными числами и совместно охватывать диапазон от 1 до N (наименьший приоритет —  самый низкий) без пропуска каких-либо чисел.
  * Если _все_ объемы имеют метки, они имеют приоритет в том порядке, как указано.
  * Если только _некоторые_ объемы имеют метки, те, у кого нет метки, имеют наименьший приоритет, и они приоритизируются в порядке, в котором они определены в конфигурации.
  * Если _никакие_ объемы не имеют меток, их приоритет устанавливается соответственно в порядке их определения в конфигурации.
  * Два объема не могут иметь одно и то же значение приоритета.

Примеры конфигурации:

```xml
<storage_configuration>
    ...
    <policies>
        <hdd_in_order> <!-- policy name -->
            <volumes>
                <single> <!-- volume name -->
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

В приведенном примере политика `hdd_in_order` реализует [круговую](https://en.wikipedia.org/wiki/Round-robin_scheduling) стратегию. Таким образом, эта политика определяет только один объем (`single`), части данных хранятся на всех его дисках в круговом порядке. Такая политика может быть весьма полезной, если в системе смонтировано несколько аналогичных дисков, но RAID не настроен. Имеет смысл помнить, что каждый отдельный жесткий диск не надежен, и вы можете захотеть компенсировать это с помощью фактора репликации 3 или более.

Если в системе доступны разные виды дисков, вместо этого можно использовать политику `moving_from_ssd_to_hdd`. Объем `hot` состоит из SSD-диска (`fast_ssd`), и максимальный размер части, который может храниться на этом объеме, составляет 1 ГБ. Все части размером более 1 ГБ будут храниться непосредственно на объеме `cold`, который содержит жесткий диск `disk1`. Кроме того, как только диск `fast_ssd` будет заполнен более чем на 80%, данные будут переданы на `disk1` в фоновом режиме.

Порядок перечисления объемов в пределах политики хранения важен, если хотя бы один из перечисленных объемов не имеет явного параметра `volume_priority`. Как только объем переполняется, данные перемещаются на следующий. Порядок перечисления дисков также важен, так как данные хранятся на них по очереди.

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

Политика хранения `default` подразумевает использование только одного объема, который состоит только из одного диска, указанного в `<path>`. Вы можете изменить политику хранения после создания таблицы с помощью запроса [ALTER TABLE ... MODIFY SETTING], новая политика должна включать все старые диски и объемы с теми же именами.

Количество потоков, выполняющих фоновое перемещение частей данных, можно изменить с помощью настройки [background_move_pool_size](/operations/server-configuration-parameters/settings.md/#background_move_pool_size).

### Подробности {#details}

В случае таблиц `MergeTree` данные попадают на диск различными способами:

- В результате вставки (`INSERT` запрос).
- Во время фоновых слияний и [мутаций](/sql-reference/statements/alter#mutations).
- При загрузке с другой реплики.
- В результате замораживания партиции [ALTER TABLE ... FREEZE PARTITION](/sql-reference/statements/alter/partition#freeze-partition).

Во всех этих случаях, кроме мутаций и заморозки партиций, часть хранится на объеме и диске в соответствии с заданной политикой хранения:

1. Выбирается первый объем (в порядке определения), который имеет достаточное дисковое пространство для хранения части (`unreserved_space > current_part_size`) и позволяет хранить части заданного размера (`max_data_part_size_bytes > current_part_size`).
2. Внутри этого объема выбирается диск, следующий за тем, который использовался для хранения предыдущего фрагмента данных, и у которого есть свободное пространство больше, чем размер части (`unreserved_space - keep_free_space_bytes > current_part_size`).

Внутренне, мутации и заморозка партиций используют [жесткие ссылки](https://en.wikipedia.org/wiki/Hard_link). Жесткие ссылки между разными дисками не поддерживаются, поэтому в таких случаях результирующие части хранятся на тех же дисках, что и исходные.

Фоново части перемещаются между объемами на основе количества свободного пространства (параметр `move_factor`) в соответствии с порядком, в котором объемы перечислены в конфигурационном файле. Данные никогда не переносятся с последнего объема на первый. Можно использовать системные таблицы [system.part_log](/operations/system-tables/part_log) (поле `type = MOVE_PART`) и [system.parts](/operations/system-tables/parts.md) (поля `path` и `disk`), чтобы контролировать фоновые перемещения. Также подробная информация может быть найдена в логах сервера.

Пользователь может принудительно переместить часть или партицию с одного объема на другой, используя запрос [ALTER TABLE ... MOVE PART\|PARTITION ... TO VOLUME\|DISK ...](/sql-reference/statements/alter/partition), при этом учитываются все ограничения для фоновых операций. Запрос инициирует перемещение самостоятельно и не ждет завершения фоновых операций. Пользователь получит сообщение об ошибке, если свободного пространства недостаточно или если какие-либо из необходимых условий не выполнены.

Перемещение данных не мешает репликации данных. Поэтому для одной и той же таблицы на различных репликах могут быть указаны разные политики хранения.

После завершения фоновых слияний и мутаций старые части удаляются только через определенное время (`old_parts_lifetime`). В течение этого времени они не перемещаются на другие объемы или диски. Поэтому, пока части не будут окончательно удалены, они все еще учитываются при оценке занятого дискового пространства.

Пользователь может назначить новые большие части на разные диски в объеме [JBOD](https://en.wikipedia.org/wiki/Non-RAID_drive_architectures) сбалансированным образом, используя настройку [min_bytes_to_rebalance_partition_over_jbod](/operations/settings/merge-tree-settings.md/#min_bytes_to_rebalance_partition_over_jbod).

## Использование внешнего хранилища для хранения данных {#table_engine-mergetree-s3}

Семейство таблиц [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) может хранить данные в `S3`, `AzureBlobStorage`, `HDFS`, используя диск с типами `s3`, `azure_blob_storage`, `hdfs` соответственно. См. [конфигурирование параметров внешнего хранилища](/operations/storing-data.md/#configuring-external-storage) для получения дополнительных подробностей.

Пример для [S3](https://aws.amazon.com/s3/) в качестве внешнего хранилища, используя диск с типом `s3`.

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

См. также [конфигурирование параметров внешнего хранилища](/operations/storing-data.md/#configuring-external-storage).

:::note конфигурация кэша
Версии ClickHouse с 22.3 по 22.7 используют другую конфигурацию кэша, смотрите [использование локального кэша](/operations/storing-data.md/#using-local-cache), если вы используете одну из этих версий.
:::

## Виртуальные колонки {#virtual-columns}

- `_part` — Имя части.
- `_part_index` — Последовательный индекс части в результате запроса.
- `_part_starting_offset` — Кумулятивный начальный ряд части в результате запроса.
- `_part_offset` — Номер строки в части.
- `_part_granule_offset` — Номер гранулы в части.
- `_partition_id` — Имя партиции.
- `_part_uuid` — Уникальный идентификатор части (если включена настройка MergeTree `assign_part_uuids`).
- `_part_data_version` — Версия данных части (либо минимальный номер блока, либо номер мутации).
- `_partition_value` — Значения (кортеж) выражения `partition by`.
- `_sample_factor` — Фактор выборки (из запроса).
- `_block_number` — Исходный номер блока для строки, который был назначен при вставке, сохраняется при слияниях, когда включена настройка `enable_block_number_column`.
- `_block_offset` — Исходный номер строки в блоке, который был назначен при вставке, сохраняется при слияниях, когда включена настройка `enable_block_offset_column`.
- `_disk_name` — Имя диска, используемого для хранения.

## Статистика по колонкам {#column-statistics}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Объявление статистики находится в секции колонок запроса `CREATE` для таблиц из семейства `*MergeTree*`, когда мы включаем `set allow_experimental_statistics = 1`.

```sql
CREATE TABLE tab
(
    a Int64 STATISTICS(TDigest, Uniq),
    b Float64
)
ENGINE = MergeTree
ORDER BY a
```

Также мы можем манипулировать статистикой с помощью операторов `ALTER`.

```sql
ALTER TABLE tab ADD STATISTICS b TYPE TDigest, Uniq;
ALTER TABLE tab DROP STATISTICS a;
```

Эта легковесная статистика агрегирует информацию о распределении значений в колонках. Статистика хранится в каждой части и обновляется при каждой вставке.
Она может быть использована для оптимизации `prewhere` только в случае, если мы включаем `set allow_statistics_optimize = 1`.

### Доступные типы статистики по колонкам {#available-types-of-column-statistics}

- `MinMax`

    Минимальное и максимальное значение колонки, которое позволяет оценить селективность диапазонных фильтров по числовым колонкам.

    Синтаксис: `minmax`

- `TDigest`

    [TDigest](https://github.com/tdunning/t-digest) эскизы, которые позволяют вычислять аппроксимированные квартильные значения (например, 90-ый процентиль) для числовых колонок.

    Синтаксис: `tdigest`

- `Uniq`

    [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) эскизы, которые предоставляют оценку того, сколько различных значений содержит колонка.

    Синтаксис: `uniq`

- `CountMin`

    [CountMin](https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch) эскизы, которые позволяют приблизительно подсчитать частоту каждого значения в колонке.

    Синтаксис `countmin`

### Поддерживаемые типы данных {#supported-data-types}

|           | (U)Int*, Float*, Decimal(*), Date*, Boolean, Enum* | String or FixedString |
|-----------|----------------------------------------------------|-----------------------|
| CountMin  | ✔                                                  | ✔                     |
| MinMax    | ✔                                                  | ✗                     |
| TDigest   | ✔                                                  | ✗                     |
| Uniq      | ✔                                                  | ✔                     |

### Поддерживаемые операции {#supported-operations}

|           | Фильтры равенства (==) | Диапазонные фильтры (`>, >=, <, <=`) |
|-----------|-------------------------|---------------------------------------|
| CountMin  | ✔                       | ✗                                     |
| MinMax    | ✗                       | ✔                                     |
| TDigest   | ✗                       | ✔                                     |
| Uniq      | ✔                       | ✗                                     |

## Настройки на уровне колонок {#column-level-settings}

Некоторые настройки MergeTree могут быть переопределены на уровне колонки:

- `max_compress_block_size` — Максимальный размер блоков некомпримированных данных перед их сжатием для записи в таблицу.
- `min_compress_block_size` — Минимальный размер блоков некомпримированных данных, необходимых для сжатия при записи следующей метки.

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

- Удалить `SETTINGS` из объявления колонки:

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