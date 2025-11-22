---
description: 'Документация по оператору JOIN'
sidebar_label: 'JOIN'
slug: /sql-reference/statements/select/join
title: 'Оператор JOIN'
keywords: ['INNER JOIN', 'LEFT JOIN', 'LEFT OUTER JOIN', 'RIGHT JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN', 'CROSS JOIN', 'LEFT SEMI JOIN', 'RIGHT SEMI JOIN', 'LEFT ANTI JOIN', 'RIGHT ANTI JOIN', 'LEFT ANY JOIN', 'RIGHT ANY JOIN', 'INNER ANY JOIN', 'ASOF JOIN', 'LEFT ASOF JOIN', 'PASTE JOIN']
doc_type: 'reference'
---



# Оператор JOIN

Оператор `JOIN` создаёт новую таблицу, объединяя столбцы из одной или нескольких таблиц на основе общих значений. Это распространённая операция в базах данных с поддержкой SQL, которая соответствует соединению в [реляционной алгебре](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators). Частный случай соединения таблицы самой с собой часто называют «самосоединением».

**Синтаксис**

```sql
SELECT <expr_list>
FROM <left_table>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <right_table>
(ON <expr_list>)|(USING <column_list>) ...
```

Выражения из предложения `ON` и столбцы из предложения `USING` называются «ключами соединения». Если не указано иное, оператор `JOIN` формирует [декартово произведение](https://en.wikipedia.org/wiki/Cartesian_product) из строк, у которых совпадают «ключи соединения», что может приводить к результату с гораздо большим количеством строк, чем в исходных таблицах.


## Поддерживаемые типы JOIN {#supported-types-of-join}

Поддерживаются все стандартные типы [SQL JOIN](<https://en.wikipedia.org/wiki/Join_(SQL)>):

| Тип                | Описание                                                                       |
| ------------------ | ------------------------------------------------------------------------------ |
| `INNER JOIN`       | возвращаются только совпадающие строки.                                        |
| `LEFT OUTER JOIN`  | возвращаются несовпадающие строки из левой таблицы в дополнение к совпадающим. |
| `RIGHT OUTER JOIN` | возвращаются несовпадающие строки из правой таблицы в дополнение к совпадающим.|
| `FULL OUTER JOIN`  | возвращаются несовпадающие строки из обеих таблиц в дополнение к совпадающим.  |
| `CROSS JOIN`       | создаёт декартово произведение целых таблиц, «ключи соединения» **не** указываются. |

- `JOIN` без указания типа подразумевает `INNER`.
- Ключевое слово `OUTER` можно опустить.
- Альтернативный синтаксис для `CROSS JOIN` — указание нескольких таблиц в [секции `FROM`](../../../sql-reference/statements/select/from.md) через запятую.

Дополнительные типы соединений, доступные в ClickHouse:

| Тип                                                 | Описание                                                                                                                                             |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LEFT SEMI JOIN`, `RIGHT SEMI JOIN`                 | Белый список по «ключам соединения» без создания декартова произведения.                                                                             |
| `LEFT ANTI JOIN`, `RIGHT ANTI JOIN`                 | Чёрный список по «ключам соединения» без создания декартова произведения.                                                                            |
| `LEFT ANY JOIN`, `RIGHT ANY JOIN`, `INNER ANY JOIN` | Частично (для противоположной стороны `LEFT` и `RIGHT`) или полностью (для `INNER` и `FULL`) отключает декартово произведение для стандартных типов `JOIN`. |
| `ASOF JOIN`, `LEFT ASOF JOIN`                       | Соединение последовательностей с неточным совпадением. Использование `ASOF JOIN` описано ниже.                                                       |
| `PASTE JOIN`                                        | Выполняет горизонтальную конкатенацию двух таблиц.                                                                                                   |

:::note
Когда параметр [join_algorithm](../../../operations/settings/settings.md#join_algorithm) установлен в `partial_merge`, `RIGHT JOIN` и `FULL JOIN` поддерживаются только со строгостью `ALL` (`SEMI`, `ANTI`, `ANY` и `ASOF` не поддерживаются).
:::


## Настройки {#settings}

Тип соединения по умолчанию можно переопределить с помощью настройки [`join_default_strictness`](../../../operations/settings/settings.md#join_default_strictness).

Поведение сервера ClickHouse для операций `ANY JOIN` зависит от настройки [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys).

**См. также**

- [`join_algorithm`](../../../operations/settings/settings.md#join_algorithm)
- [`join_any_take_last_row`](../../../operations/settings/settings.md#join_any_take_last_row)
- [`join_use_nulls`](../../../operations/settings/settings.md#join_use_nulls)
- [`partial_merge_join_rows_in_right_blocks`](../../../operations/settings/settings.md#partial_merge_join_rows_in_right_blocks)
- [`join_on_disk_max_files_to_merge`](../../../operations/settings/settings.md#join_on_disk_max_files_to_merge)
- [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)

Используйте настройку `cross_to_inner_join_rewrite` для определения поведения в случае, когда ClickHouse не может преобразовать `CROSS JOIN` в `INNER JOIN`. Значение по умолчанию — `1`, что позволяет продолжить выполнение соединения, но оно будет выполняться медленнее. Установите значение `cross_to_inner_join_rewrite` равным `0`, если требуется генерировать ошибку, и установите значение `2`, чтобы не выполнять кросс-соединения, а вместо этого принудительно преобразовывать все соединения через запятую и кросс-соединения. Если при значении `2` преобразование завершится неудачей, вы получите сообщение об ошибке «Please, try to simplify `WHERE` section».


## Условия в секции ON {#on-section-conditions}

Секция `ON` может содержать несколько условий, объединённых операторами `AND` и `OR`. Условия, определяющие ключи соединения, должны:

- ссылаться на обе таблицы — левую и правую
- использовать оператор равенства

Другие условия могут использовать иные логические операторы, но они должны ссылаться либо на левую, либо на правую таблицу запроса.

Строки соединяются, если выполняется всё сложное условие целиком. Если условия не выполняются, строки всё равно могут быть включены в результат в зависимости от типа `JOIN`. Обратите внимание: если те же условия размещены в секции `WHERE` и они не выполняются, то строки всегда исключаются из результата.

Оператор `OR` внутри секции `ON` работает с использованием алгоритма хеш-соединения — для каждого аргумента `OR` с ключами соединения для `JOIN` создаётся отдельная хеш-таблица, поэтому потребление памяти и время выполнения запроса растут линейно с увеличением количества выражений `OR` в секции `ON`.

:::note
Если условие ссылается на столбцы из разных таблиц, то на данный момент поддерживается только оператор равенства (`=`).
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

Запрос с одним условием ключа соединения и дополнительным условием для `table_2`:

```sql
SELECT name, text FROM table_1 LEFT OUTER JOIN table_2
    ON table_1.Id = table_2.Id AND startsWith(table_2.text, 'Text');
```

Обратите внимание, что результат содержит строку с именем `C` и пустым столбцом text. Она включена в результат, потому что используется тип соединения `OUTER`.

```response
┌─name─┬─text───┐
│ A    │ Text A │
│ B    │ Text B │
│ C    │        │
└──────┴────────┘
```

Запрос с типом соединения `INNER` и несколькими условиями:

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

Запрос с типом соединения `INNER` и условием с `OR`:

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

Запрос с типом соединения `INNER` и условиями с `OR` и `AND`:

:::note


По умолчанию условия с неравенствами поддерживаются, если они используют столбцы из одной и той же таблицы.
Например, `t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c`, потому что `t1.b > 0` использует столбцы только из `t1`, а `t2.b > t2.c` использует столбцы только из `t2`.
Однако вы можете попробовать экспериментальную поддержку условий вида `t1.a = t2.key AND t1.b > t2.key`; подробности см. в разделе ниже.

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


## JOIN с условиями неравенства для столбцов из разных таблиц {#join-with-inequality-conditions-for-columns-from-different-tables}

ClickHouse поддерживает `ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN` с условиями неравенства в дополнение к условиям равенства. Условия неравенства поддерживаются только для алгоритмов соединения `hash` и `grace_hash`. Условия неравенства не поддерживаются при использовании `join_use_nulls`.

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

Таблица `t2`

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


## Значения NULL в ключах JOIN {#null-values-in-join-keys}

`NULL` не равен никакому значению, включая самого себя. Это означает, что если ключ `JOIN` имеет значение `NULL` в одной таблице, он не будет совпадать со значением `NULL` в другой таблице.

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

Если необходимо сопоставить значения `NULL`, используйте функцию `isNotDistinctFrom` для сравнения ключей `JOIN`.

```sql
SELECT A.name, B.score FROM A LEFT JOIN B ON isNotDistinctFrom(A.id, B.id)
```

```markdown
┌─name────┬─score─┐
│ Alice │ 90 │
│ Bob │ 0 │
│ Charlie │ 88 │
└─────────┴───────┘
```


## Использование ASOF JOIN {#asof-join-usage}

`ASOF JOIN` полезен, когда необходимо объединить записи, которые не имеют точного совпадения.

Этот алгоритм JOIN требует специального столбца в таблицах. Этот столбец:

- Должен содержать упорядоченную последовательность.
- Может иметь один из следующих типов: [Int, UInt](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md), [Date](../../../sql-reference/data-types/date.md), [DateTime](../../../sql-reference/data-types/datetime.md), [Decimal](../../../sql-reference/data-types/decimal.md).
- Для алгоритма соединения `hash` не может быть единственным столбцом в секции `JOIN`.

Синтаксис `ASOF JOIN ... ON`:

```sql
SELECT expressions_list
FROM table_1
ASOF LEFT JOIN table_2
ON equi_cond AND closest_match_cond
```

Можно использовать любое количество условий равенства и ровно одно условие ближайшего совпадения. Например, `SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t`.

Поддерживаемые условия ближайшего совпадения: `>`, `>=`, `<`, `<=`.

Синтаксис `ASOF JOIN ... USING`:

```sql
SELECT expressions_list
FROM table_1
ASOF JOIN table_2
USING (equi_column1, ... equi_columnN, asof_column)
```

`ASOF JOIN` использует `equi_columnX` для соединения по равенству и `asof_column` для соединения по ближайшему совпадению с условием `table_1.asof_column >= table_2.asof_column`. Столбец `asof_column` всегда указывается последним в секции `USING`.

Например, рассмотрим следующие таблицы:

```text
         table_1                           table_2
      event   | ev_time | user_id       event   | ev_time | user_id
    ----------|---------|----------   ----------|---------|----------
                  ...                               ...
    event_1_1 |  12:00  |  42         event_2_1 |  11:59  |   42
                  ...                 event_2_2 |  12:30  |   42
    event_1_2 |  13:00  |  42         event_2_3 |  13:00  |   42
                  ...                               ...
```

`ASOF JOIN` может взять временную метку события пользователя из `table_1` и найти событие в `table_2`, временная метка которого наиболее близка к временной метке события из `table_1` в соответствии с условием ближайшего совпадения. Равные значения временных меток считаются наиболее близкими, если они доступны. В данном случае столбец `user_id` может использоваться для соединения по равенству, а столбец `ev_time` — для соединения по ближайшему совпадению. В нашем примере `event_1_1` может быть объединено с `event_2_1`, а `event_1_2` — с `event_2_3`, но `event_2_2` не может быть объединено ни с одним событием.

:::note
`ASOF JOIN` поддерживается только алгоритмами соединения `hash` и `full_sorting_merge`.
Он **не** поддерживается движком таблиц [Join](../../../engines/table-engines/special/join.md).
:::


## Использование PASTE JOIN {#paste-join-usage}

Результатом `PASTE JOIN` является таблица, содержащая все столбцы левого подзапроса, за которыми следуют все столбцы правого подзапроса.
Строки сопоставляются на основе их позиций в исходных таблицах (порядок строк должен быть определён).
Если подзапросы возвращают разное количество строк, лишние строки будут отброшены.

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

Примечание: в данном случае результат может быть недетерминированным при параллельном чтении. Например:

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


## Распределённый JOIN {#distributed-join}

Существует два способа выполнения JOIN с распределёнными таблицами:

- При использовании обычного `JOIN` запрос отправляется на удалённые серверы. На каждом из них выполняются подзапросы для формирования правой таблицы, после чего выполняется соединение с этой таблицей. Другими словами, правая таблица формируется на каждом сервере независимо.
- При использовании `GLOBAL ... JOIN` сервер-инициатор сначала выполняет подзапрос для вычисления правой таблицы. Эта временная таблица передаётся на каждый удалённый сервер, где запросы выполняются с использованием переданных временных данных.

Будьте внимательны при использовании `GLOBAL`. Подробнее см. раздел [Распределённые подзапросы](/sql-reference/operators/in#distributed-subqueries).


## Неявное преобразование типов {#implicit-type-conversion}

Запросы `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN` и `FULL JOIN` поддерживают неявное преобразование типов для ключей соединения. Однако запрос не может быть выполнен, если ключи соединения из левой и правой таблиц невозможно преобразовать к единому типу (например, не существует типа данных, который может содержать все значения одновременно из `UInt64` и `Int64`, или из `String` и `Int32`).

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

возвращает результат:

```response
┌──a─┬────b─┬─toTypeName(a)─┬─toTypeName(b)───┐
│  1 │    1 │ Int32         │ Nullable(Int64) │
│  2 │    2 │ Int32         │ Nullable(Int64) │
│ -1 │    1 │ Int32         │ Nullable(Int64) │
│  1 │   -1 │ Int32         │ Nullable(Int64) │
└────┴──────┴───────────────┴─────────────────┘
```


## Рекомендации по использованию {#usage-recommendations}

### Обработка пустых ячеек и NULL {#processing-of-empty-or-null-cells}

При объединении таблиц могут появляться пустые ячейки. Настройка [join_use_nulls](../../../operations/settings/settings.md#join_use_nulls) определяет, как ClickHouse заполняет эти ячейки.

Если ключи `JOIN` являются полями типа [Nullable](../../../sql-reference/data-types/nullable.md), строки, в которых хотя бы один из ключей имеет значение [NULL](/sql-reference/syntax#null), не объединяются.

### Синтаксис {#syntax}

Столбцы, указанные в `USING`, должны иметь одинаковые имена в обоих подзапросах, а остальные столбцы должны иметь разные имена. Для изменения имен столбцов в подзапросах можно использовать псевдонимы.

Секция `USING` указывает один или несколько столбцов для объединения, что устанавливает равенство этих столбцов. Список столбцов задается без скобок. Более сложные условия объединения не поддерживаются.

### Ограничения синтаксиса {#syntax-limitations}

Для нескольких секций `JOIN` в одном запросе `SELECT`:

- Выборка всех столбцов через `*` доступна только при объединении таблиц, но не подзапросов.
- Секция `PREWHERE` недоступна.
- Секция `USING` недоступна.

Для секций `ON`, `WHERE` и `GROUP BY`:

- Произвольные выражения не могут использоваться в секциях `ON`, `WHERE` и `GROUP BY`, но можно определить выражение в секции `SELECT`, а затем использовать его в этих секциях через псевдоним.

### Производительность {#performance}

При выполнении `JOIN` не происходит оптимизации порядка выполнения относительно других этапов запроса. Объединение (поиск в правой таблице) выполняется до фильтрации в `WHERE` и до агрегации.

Каждый раз при выполнении запроса с одним и тем же `JOIN` подзапрос выполняется заново, поскольку результат не кэшируется. Чтобы избежать этого, используйте специальный движок таблиц [Join](../../../engines/table-engines/special/join.md), который представляет собой подготовленный массив для объединения, постоянно находящийся в оперативной памяти.

В некоторых случаях эффективнее использовать [IN](../../../sql-reference/operators/in.md) вместо `JOIN`.

Если требуется `JOIN` для объединения с таблицами измерений (это относительно небольшие таблицы, содержащие свойства измерений, такие как названия рекламных кампаний), `JOIN` может быть неудобным из-за того, что правая таблица повторно обрабатывается для каждого запроса. Для таких случаев существует функциональность словарей, которую следует использовать вместо `JOIN`. Подробнее см. раздел [Словари](../../../sql-reference/dictionaries/index.md).

### Ограничения памяти {#memory-limitations}

По умолчанию ClickHouse использует алгоритм [hash join](https://en.wikipedia.org/wiki/Hash_join). ClickHouse берет right_table и создает для нее хеш-таблицу в оперативной памяти. Если включен параметр `join_algorithm = 'auto'`, то после достижения определенного порога потребления памяти ClickHouse переключается на алгоритм объединения [merge](https://en.wikipedia.org/wiki/Sort-merge_join). Описание алгоритмов `JOIN` см. в настройке [join_algorithm](../../../operations/settings/settings.md#join_algorithm).

Если необходимо ограничить потребление памяти операцией `JOIN`, используйте следующие настройки:

- [max_rows_in_join](/operations/settings/settings#max_rows_in_join) — ограничивает количество строк в хеш-таблице.
- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join) — ограничивает размер хеш-таблицы.

При достижении любого из этих ограничений ClickHouse действует в соответствии с указаниями настройки [join_overflow_mode](/operations/settings/settings#join_overflow_mode).


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

- Блог: [ClickHouse: сверхбыстрая СУБД с полной поддержкой SQL JOIN — часть 1](https://clickhouse.com/blog/clickhouse-fully-supports-joins)
- Блог: [ClickHouse: сверхбыстрая СУБД с полной поддержкой SQL JOIN — внутреннее устройство — часть 2](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)
- Блог: [ClickHouse: сверхбыстрая СУБД с полной поддержкой SQL JOIN — внутреннее устройство — часть 3](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)
- Блог: [ClickHouse: сверхбыстрая СУБД с полной поддержкой SQL JOIN — внутреннее устройство — часть 4](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4)
