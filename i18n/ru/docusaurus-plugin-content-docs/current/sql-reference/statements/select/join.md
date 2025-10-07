---
slug: '/sql-reference/statements/select/join'
sidebar_label: JOIN
description: 'Документация для JOIN Оператора'
title: 'Оператор JOIN'
doc_type: reference
---
# JOIN оператор

`JOIN` оператор создает новую таблицу, комбинируя колонки из одной или нескольких таблиц, используя значения, общие для каждой из них. Это общая операция в базах данных с поддержкой SQL, которая соответствует [реляционной алгебре](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators) для объединений. Специальный случай объединения одной таблицы часто называется "самообъединением".

**Синтаксис**

```sql
SELECT <expr_list>
FROM <left_table>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <right_table>
(ON <expr_list>)|(USING <column_list>) ...
```

Выражения из секции `ON` и колонки из секции `USING` называются "ключами объединения". Если не указано иное, `JOIN` создает [декартово произведение](https://en.wikipedia.org/wiki/Cartesian_product) строк с совпадающими "ключами объединения", что может привести к результату с гораздо большим количеством строк, чем исходные таблицы.

## Поддерживаемые типы JOIN {#supported-types-of-join}

Поддерживаются все стандартные типы [SQL JOIN](https://en.wikipedia.org/wiki/Join_(SQL)):

| Тип                | Описание                                                                    |
|-------------------|----------------------------------------------------------------------------|
| `INNER JOIN`      | возвращаются только совпадающие строки.                                   |
| `LEFT OUTER JOIN` | возвращаются несовпадающие строки из левой таблицы в дополнение к совпадающим строкам.  |
| `RIGHT OUTER JOIN`| возвращаются несовпадающие строки из правой таблицы в дополнение к совпадающим строкам. |
| `FULL OUTER JOIN` | возвращаются несовпадающие строки обеих таблиц в дополнение к совпадающим строкам. |
| `CROSS JOIN`      | создает декартово произведение полных таблиц, "ключи объединения" **не** указываются.|

- `JOIN` без указания типа подразумевает `INNER`.
- Ключевое слово `OUTER` можно безопасно опустить.
- Альтернативный синтаксис для `CROSS JOIN` — указание нескольких таблиц в секции [`FROM`](../../../sql-reference/statements/select/from.md), разделенных запятыми.

Дополнительные типы объединения, доступные в ClickHouse:

| Тип                                             | Описание                                                                                                                               |
|-------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| `LEFT SEMI JOIN`, `RIGHT SEMI JOIN`            | Разрешительный список на "ключи объединения", без создания декартова произведения.                                                      |
| `LEFT ANTI JOIN`, `RIGHT ANTI JOIN`            | Запрещающий список на "ключи объединения", без создания декартова произведения.                                                        |
| `LEFT ANY JOIN`, `RIGHT ANY JOIN`, `INNER ANY JOIN` | Частично (для противоположной стороны `LEFT` и `RIGHT`) или полностью (для `INNER` и `FULL`) отключает декартово произведение для стандартных типов `JOIN`. |
| `ASOF JOIN`, `LEFT ASOF JOIN`                  | Объединение последовательностей с неточным совпадением. Использование `ASOF JOIN` описано ниже.                                         |
| `PASTE JOIN`                                   | Выполняет горизонтальное объединение двух таблиц.                                                                                       |

:::note
Когда [join_algorithm](../../../operations/settings/settings.md#join_algorithm) установлен на `partial_merge`, `RIGHT JOIN` и `FULL JOIN` поддерживаются только с жесткостью `ALL` ( `SEMI`, `ANTI`, `ANY` и `ASOF` не поддерживаются).
:::

## Настройки {#settings}

Тип объединения по умолчанию можно переопределить с помощью настройки [`join_default_strictness`](../../../operations/settings/settings.md#join_default_strictness).

Поведение сервера ClickHouse для операций `ANY JOIN` зависит от настройки [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys).

**Смотрите также**

- [`join_algorithm`](../../../operations/settings/settings.md#join_algorithm)
- [`join_any_take_last_row`](../../../operations/settings/settings.md#join_any_take_last_row)
- [`join_use_nulls`](../../../operations/settings/settings.md#join_use_nulls)
- [`partial_merge_join_rows_in_right_blocks`](../../../operations/settings/settings.md#partial_merge_join_rows_in_right_blocks)
- [`join_on_disk_max_files_to_merge`](../../../operations/settings/settings.md#join_on_disk_max_files_to_merge)
- [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)

Используйте настройку `cross_to_inner_join_rewrite`, чтобы определить поведение, когда ClickHouse не может преобразовать `CROSS JOIN` в `INNER JOIN`. Значение по умолчанию — `1`, что позволяет продолжить объединение, но оно будет медленнее. Установите `cross_to_inner_join_rewrite` на `0`, если хотите, чтобы было выдано сообщение об ошибке, и установите его на `2`, чтобы не выполнять кросс-объединения, а вместо этого заставить переписать все запятые/кросс-объединения. Если переписывание не удастся при значении `2`, вы получите сообщение об ошибке с текстом "Пожалуйста, попробуйте упростить секцию `WHERE`".

## Условия секции ON {#on-section-conditions}

Секция `ON` может содержать несколько условий, комбинированных с помощью операторов `AND` и `OR`. Условия, задающие ключи объединения, должны:
- ссылаться как на левую, так и на правую таблицы
- использовать оператор равенства

Другие условия могут использовать другие логические операторы, но они должны ссылаться либо на левую, либо на правую таблицу запроса.

Строки объединяются, если выполнено все сложное условие. Если условия не выполняются, строки могут быть все равно включены в результат в зависимости от типа `JOIN`. Обратите внимание, что если одни и те же условия помещены в секцию `WHERE` и они не выполнены, то строки всегда исключаются из результата.

Оператор `OR` внутри секции `ON` работает с использованием алгоритма хеширования для объединения — для каждого аргумента `OR` с ключами объединения для `JOIN` создается отдельная хеш-таблица, поэтому потребление памяти и время выполнения запроса растут линейно с увеличением числа выражений `OR` секции `ON`.

:::note
Если условие ссылается на колонки из разных таблиц, то в настоящее время поддерживается только оператор равенства (`=`).
:::

**Пример**

Рассмотрим `table_1` и `table_2`:

```response
┌─Id─┬─name─┐     ┌─Id─┬─text───────────┬─scores─┐
│  1 │ A    │     │  1 │ Text A         │     10 │
│  2 │ B    │     │  1 │ Another text A │     12 │
│  3 │ C    │     │  2 │ Text B         │     15 │
└────┴──────┘     └────┴────────────────┴────────┘
```

Запрос с одним условием ключа объединения и дополнительным условием для `table_2`:

```sql
SELECT name, text FROM table_1 LEFT OUTER JOIN table_2
    ON table_1.Id = table_2.Id AND startsWith(table_2.text, 'Text');
```

Обратите внимание, что результат содержит строку с именем `C` и пустым текстовым полем. Она включена в результат, потому что используется `OUTER` тип объединения.

```response
┌─name─┬─text───┐
│ A    │ Text A │
│ B    │ Text B │
│ C    │        │
└──────┴────────┘
```

Запрос с типом `INNER` объединения и несколькими условиями:

```sql
SELECT name, text, scores FROM table_1 INNER JOIN table_2
    ON table_1.Id = table_2.Id AND table_2.scores > 10 AND startsWith(table_2.text, 'Text');
```

Результат:

```sql
┌─name─┬─text───┬─scores─┐
│ B    │ Text B │     15 │
└──────┴────────┴────────┘
```
Запрос с типом `INNER` объединения и условием с `OR`:

```sql
CREATE TABLE t1 (`a` Int64, `b` Int64) ENGINE = MergeTree() ORDER BY a;

CREATE TABLE t2 (`key` Int32, `val` Int64) ENGINE = MergeTree() ORDER BY key;

INSERT INTO t1 SELECT number as a, -a as b from numbers(5);

INSERT INTO t2 SELECT if(number % 2 == 0, toInt64(number), -number) as key, number as val from numbers(5);

SELECT a, b, val FROM t1 INNER JOIN t2 ON t1.a = t2.key OR t1.b = t2.key;
```

Результат:

```response
┌─a─┬──b─┬─val─┐
│ 0 │  0 │   0 │
│ 1 │ -1 │   1 │
│ 2 │ -2 │   2 │
│ 3 │ -3 │   3 │
│ 4 │ -4 │   4 │
└───┴────┴─────┘
```

Запрос с типом `INNER` объединения и условиями с `OR` и `AND`:

:::note

По умолчанию неравные условия поддерживаются, если они используют колонки из одной и той же таблицы.
Например, `t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c`, поскольку `t1.b > 0` использует колонки только из `t1`, а `t2.b > t2.c` использует колонки только из `t2`.
Однако вы можете попробовать экспериментальную поддержку условий, таких как `t1.a = t2.key AND t1.b > t2.key`, смотрите раздел ниже для получения дополнительной информации.

:::

```sql
SELECT a, b, val FROM t1 INNER JOIN t2 ON t1.a = t2.key OR t1.b = t2.key AND t2.val > 3;
```

Результат:

```response
┌─a─┬──b─┬─val─┐
│ 0 │  0 │   0 │
│ 2 │ -2 │   2 │
│ 4 │ -4 │   4 │
└───┴────┴─────┘
```

## JOIN с неравенством для колонок из разных таблиц {#join-with-inequality-conditions-for-columns-from-different-tables}

ClickHouse в настоящее время поддерживает `ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN` с неравенствами в дополнение к равенствам. Условия неравенства поддерживаются только для алгоритмов объединения `hash` и `grace_hash`. Условия неравенства не поддерживаются при использовании `join_use_nulls`.

**Пример**

Таблица `t1`:

```response
┌─key──┬─attr─┬─a─┬─b─┬─c─┐
│ key1 │ a    │ 1 │ 1 │ 2 │
│ key1 │ b    │ 2 │ 3 │ 2 │
│ key1 │ c    │ 3 │ 2 │ 1 │
│ key1 │ d    │ 4 │ 7 │ 2 │
│ key1 │ e    │ 5 │ 5 │ 5 │
│ key2 │ a2   │ 1 │ 1 │ 1 │
│ key4 │ f    │ 2 │ 3 │ 4 │
└──────┴──────┴───┴───┴───┘
```

Таблица `t2`:

```response
┌─key──┬─attr─┬─a─┬─b─┬─c─┐
│ key1 │ A    │ 1 │ 2 │ 1 │
│ key1 │ B    │ 2 │ 1 │ 2 │
│ key1 │ C    │ 3 │ 4 │ 5 │
│ key1 │ D    │ 4 │ 1 │ 6 │
│ key3 │ a3   │ 1 │ 1 │ 1 │
│ key4 │ F    │ 1 │ 1 │ 1 │
└──────┴──────┴───┴───┴───┘
```

```sql
SELECT t1.*, t2.* FROM t1 LEFT JOIN t2 ON t1.key = t2.key AND (t1.a < t2.a) ORDER BY (t1.key, t1.attr, t2.key, t2.attr);
```

```response
key1    a    1    1    2    key1    B    2    1    2
key1    a    1    1    2    key1    C    3    4    5
key1    a    1    1    2    key1    D    4    1    6
key1    b    2    3    2    key1    C    3    4    5
key1    b    2    3    2    key1    D    4    1    6
key1    c    3    2    1    key1    D    4    1    6
key1    d    4    7    2            0    0    \N
key1    e    5    5    5            0    0    \N
key2    a2    1    1    1            0    0    \N
key4    f    2    3    4            0    0    \N
```

## NULL значения в ключах JOIN {#null-values-in-join-keys}

`NULL` не равен никакому значению, включая само себя. Это означает, что если ключ `JOIN` имеет значение `NULL` в одной таблице, он не будет совпадать с значением `NULL` в другой таблице.

**Пример**

Таблица `A`:

```response
┌───id─┬─name────┐
│    1 │ Alice   │
│    2 │ Bob     │
│ ᴺᵁᴸᴸ │ Charlie │
└──────┴─────────┘
```

Таблица `B`:

```response
┌───id─┬─score─┐
│    1 │    90 │
│    3 │    85 │
│ ᴺᵁᴸᴸ │    88 │
└──────┴───────┘
```

```sql
SELECT A.name, B.score FROM A LEFT JOIN B ON A.id = B.id
```

```response
┌─name────┬─score─┐
│ Alice   │    90 │
│ Bob     │     0 │
│ Charlie │     0 │
└─────────┴───────┘
```

Обратите внимание, что строка с `Charlie` из таблицы `A` и строка с оценкой 88 из таблицы `B` отсутствуют в результате из-за значения `NULL` в ключе `JOIN`.

Если вы хотите сопоставить значения `NULL`, используйте функцию `isNotDistinctFrom`, чтобы сравнить ключи `JOIN`.

```sql
SELECT A.name, B.score FROM A LEFT JOIN B ON isNotDistinctFrom(A.id, B.id)
```

```markdown
┌─name────┬─score─┐
│ Alice   │    90 │
│ Bob     │     0 │
│ Charlie │    88 │
└─────────┴───────┘
```

## Использование ASOF JOIN {#asof-join-usage}

`ASOF JOIN` полезен, когда вам нужно объединить записи, которые не имеют точного совпадения.

Этот алгоритм объединения требует специальной колонки в таблицах. Эта колонка:

- Должна содержать упорядоченную последовательность.
- Может быть одного из следующих типов: [Int, UInt](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md), [Date](../../../sql-reference/data-types/date.md), [DateTime](../../../sql-reference/data-types/datetime.md), [Decimal](../../../sql-reference/data-types/decimal.md).
- Для алгоритма объединения `hash` она не может быть единственной колонкой в секции `JOIN`.

Синтаксис `ASOF JOIN ... ON`:

```sql
SELECT expressions_list
FROM table_1
ASOF LEFT JOIN table_2
ON equi_cond AND closest_match_cond
```

Вы можете использовать любое количество условий равенства и ровно одно условие ближайшего совпадения. Например, `SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t`.

Поддерживаемые условия для ближайшего совпадения: `>`, `>=`, `<`, `<=`.

Синтаксис `ASOF JOIN ... USING`:

```sql
SELECT expressions_list
FROM table_1
ASOF JOIN table_2
USING (equi_column1, ... equi_columnN, asof_column)
```

`ASOF JOIN` использует `equi_columnX` для объединения по равенству и `asof_column` для объединения по ближайшему совпадению с условием `table_1.asof_column >= table_2.asof_column`. Колонка `asof_column` всегда будет последней в секции `USING`.

Например, рассмотрим следующие таблицы:

```text
     table_1                           table_2
  event   | ev_time | user_id       event   | ev_time | user_id
----------|---------|---------- ----------|---------|----------
              ...                               ...
event_1_1 |  12:00  |  42         event_2_1 |  11:59  |   42
              ...                 event_2_2 |  12:30  |   42
event_1_2 |  13:00  |  42         event_2_3 |  13:00  |   42
              ...                               ...
```

`ASOF JOIN` может взять временную метку события пользователя из `table_1` и найти событие в `table_2`, где временная метка максимально близка к временной метке события из `table_1`, соответствующему условию ближайшего совпадения. Равные значения временной метки являются ближайшими, если они доступны. Здесь колонка `user_id` может использоваться для объединения по равенству, а колонка `ev_time` может быть использована для объединения по ближайшему совпадению. В нашем примере `event_1_1` может быть объединен с `event_2_1`, а `event_1_2` может быть объединен с `event_2_3`, но `event_2_2` не может быть объединен.

:::note
`ASOF JOIN` поддерживается только алгоритмами объединения `hash` и `full_sorting_merge`.
Он **не** поддерживается в движке таблиц [Join](../../../engines/table-engines/special/join.md).
:::

## Использование PASTE JOIN {#paste-join-usage}

Результат `PASTE JOIN` — это таблица, которая содержит все колонки из левого подзапроса, за которыми следуют все колонки из правого подзапроса. 
Строки сопоставляются на основе их позиций в исходных таблицах (порядок строк должен быть определен). 
Если подзапросы возвращают разное количество строк, лишние строки будут обрезаны.

Пример:
```sql
SELECT *
FROM
(
    SELECT number AS a
    FROM numbers(2)
) AS t1
PASTE JOIN
(
    SELECT number AS a
    FROM numbers(2)
    ORDER BY a DESC
) AS t2

┌─a─┬─t2.a─┐
│ 0 │    1 │
│ 1 │    0 │
└───┴──────┘
```

Примечание: в этом случае результат может быть недетерминированным, если чтение происходит параллельно. Например:

```sql
SELECT *
FROM
(
    SELECT number AS a
    FROM numbers_mt(5)
) AS t1
PASTE JOIN
(
    SELECT number AS a
    FROM numbers(10)
    ORDER BY a DESC
) AS t2
SETTINGS max_block_size = 2;

┌─a─┬─t2.a─┐
│ 2 │    9 │
│ 3 │    8 │
└───┴──────┘
┌─a─┬─t2.a─┐
│ 0 │    7 │
│ 1 │    6 │
└───┴──────┘
┌─a─┬─t2.a─┐
│ 4 │    5 │
└───┴──────┘
```

## Распределенное JOIN {#distributed-join}

Существует два способа выполнить объединение, связанное с распределенными таблицами:

- При использовании обычного `JOIN` запрос отправляется на удаленные серверы. Подзапросы выполняются на каждом из них, чтобы сформировать правую таблицу, и объединение выполняется с этой таблицей. Другими словами, правая таблица формируется на каждом сервере отдельно.
- При использовании `GLOBAL ... JOIN` сначала сервер-запросчик выполняет подзапрос для расчета правой таблицы. Эта временная таблица передается каждому удаленному серверу, и запросы выполняются на них с использованием временных данных, которые были переданы.

Будьте внимательны при использовании `GLOBAL`. Для получения дополнительной информации смотрите раздел [Распределенные подзапросы](/sql-reference/operators/in#distributed-subqueries).

## Неявное преобразование типов {#implicit-type-conversion}

Запросы `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN` и `FULL JOIN` поддерживают неявное преобразование типов для "ключей объединения". Однако запрос не может быть выполнен, если ключи объединения из левой и правой таблиц не могут быть преобразованы в один тип (например, нет типа данных, который может содержать все значения из `UInt64` и `Int64` или `String` и `Int32`).

**Пример**

Рассмотрим таблицу `t_1`:
```response
┌─a─┬─b─┬─toTypeName(a)─┬─toTypeName(b)─┐
│ 1 │ 1 │ UInt16        │ UInt8         │
│ 2 │ 2 │ UInt16        │ UInt8         │
└───┴───┴───────────────┴───────────────┘
```
и таблицу `t_2`:
```response
┌──a─┬────b─┬─toTypeName(a)─┬─toTypeName(b)───┐
│ -1 │    1 │ Int16         │ Nullable(Int64) │
│  1 │   -1 │ Int16         │ Nullable(Int64) │
│  1 │    1 │ Int16         │ Nullable(Int64) │
└────┴──────┴───────────────┴─────────────────┘
```

Запрос
```sql
SELECT a, b, toTypeName(a), toTypeName(b) FROM t_1 FULL JOIN t_2 USING (a, b);
```
возвращает набор:
```response
┌──a─┬────b─┬─toTypeName(a)─┬─toTypeName(b)───┐
│  1 │    1 │ Int32         │ Nullable(Int64) │
│  2 │    2 │ Int32         │ Nullable(Int64) │
│ -1 │    1 │ Int32         │ Nullable(Int64) │
│  1 │   -1 │ Int32         │ Nullable(Int64) │
└────┴──────┴───────────────┴─────────────────┘
```

## Рекомендации по использованию {#usage-recommendations}

### Обработка пустых или NULL ячеек {#processing-of-empty-or-null-cells}

При объединении таблиц могут появляться пустые ячейки. Настройка [join_use_nulls](../../../operations/settings/settings.md#join_use_nulls) определяет, как ClickHouse заполняет эти ячейки.

Если ключи `JOIN` являются [Nullable](../../../sql-reference/data-types/nullable.md) полями, строки, где хотя бы один из ключей имеет значение [NULL](/sql-reference/syntax#null), не объединяются.

### Синтаксис {#syntax}

Колонки, указанные в `USING`, должны иметь одинаковые имена в обоих подзапросах, а другие колонки должны именоваться по-другому. Вы можете использовать алиасы для изменения имен колонок в подзапросах.

Секция `USING` указывает одну или несколько колонок для объединения, что устанавливает равенство этих колонок. Список колонок задается без скобок. Более сложные условия объединения не поддерживаются.

### Ограничения синтаксиса {#syntax-limitations}

Для нескольких секций `JOIN` в одном запросе `SELECT`:

- Получить все колонки с помощью `*` можно только в случае, если таблицы объединены, а не подзапросы.
- Секция `PREWHERE` не доступна.
- Секция `USING` не доступна.

Для секций `ON`, `WHERE` и `GROUP BY`:

- Произвольные выражения не могут быть использованы в секциях `ON`, `WHERE` и `GROUP BY`, однако вы можете определить выражение в секции `SELECT`, а затем использовать его в этих секциях через алиас.

### Производительность {#performance}

При выполнении `JOIN` нет оптимизации порядка выполнения в отношении других стадий запроса. Объединение (поиск в правой таблице) выполняется перед фильтрацией в `WHERE` и перед агрегацией.

Каждый раз, когда запрос выполняется с тем же `JOIN`, подзапрос выполняется снова, поскольку результат не кэшируется. Чтобы избежать этого, используйте специальный движок таблиц [Join](../../../engines/table-engines/special/join.md), который представляет собой подготовленный массив для объединения, постоянно находящийся в оперативной памяти.

В некоторых случаях эффективнее использовать [IN](../../../sql-reference/operators/in.md) вместо `JOIN`.

Если вам нужно выполнить `JOIN` для объединения с таблицами размеров (это относительно небольшие таблицы, которые содержат свойства размерностей, такие как названия рекламных кампаний), `JOIN` может быть не очень удобен из-за того, что правая таблица повторно обращается для каждого запроса. Для таких случаев есть функция "словарей", которую следует использовать вместо `JOIN`. Для получения дополнительной информации смотрите раздел [Словари](../../../sql-reference/dictionaries/index.md).

### Ограничения памяти {#memory-limitations}

По умолчанию ClickHouse использует алгоритм [hash join](https://en.wikipedia.org/wiki/Hash_join). ClickHouse берет `right_table` и создает хеш-таблицу для него в ОП. Если включена настройка `join_algorithm = 'auto'`, то после достижения определенного порога потребления памяти ClickHouse переключается на алгоритм [merge](https://en.wikipedia.org/wiki/Sort-merge_join) объединения. Для описания алгоритмов объединения смотрите настройку [join_algorithm](../../../operations/settings/settings.md#join_algorithm).

Если вам необходимо ограничить потребление памяти операции `JOIN`, используйте следующие настройки:

- [max_rows_in_join](/operations/settings/settings#max_rows_in_join) — Ограничивает количество строк в хеш-таблице.
- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join) — Ограничивает размер хеш-таблицы.

Когда любое из этих ограничений достигается, ClickHouse действует в соответствии с настройкой [join_overflow_mode](/operations/settings/settings.md#join_overflow_mode). 

## Примеры {#examples}

Пример:

```sql
SELECT
    CounterID,
    hits,
    visits
FROM
(
    SELECT
        CounterID,
        count() AS hits
    FROM test.hits
    GROUP BY CounterID
) ANY LEFT JOIN
(
    SELECT
        CounterID,
        sum(Sign) AS visits
    FROM test.visits
    GROUP BY CounterID
) USING CounterID
ORDER BY hits DESC
LIMIT 10
```

```text
┌─CounterID─┬───hits─┬─visits─┐
│   1143050 │ 523264 │  13665 │
│    731962 │ 475698 │ 102716 │
│    722545 │ 337212 │ 108187 │
│    722889 │ 252197 │  10547 │
│   2237260 │ 196036 │   9522 │
│  23057320 │ 147211 │   7689 │
│    722818 │  90109 │  17847 │
│     48221 │  85379 │   4652 │
│  19762435 │  77807 │   7026 │
│    722884 │  77492 │  11056 │
└───────────┴────────┴────────┘
```

## Связанный контент {#related-content}

- Блог: [ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Part 1](https://clickhouse.com/blog/clickhouse-fully-supports-joins)
- Блог: [ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Under the Hood - Part 2](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)
- Блог: [ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Under the Hood - Part 3](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)
- Блог: [ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Under the Hood - Part 4](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4)