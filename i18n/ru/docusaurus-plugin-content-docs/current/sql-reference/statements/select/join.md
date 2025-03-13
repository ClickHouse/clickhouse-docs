---
slug: /sql-reference/statements/select/join
sidebar_label: Соединение таблиц
---


# JOIN Clause

JOIN создает новую таблицу, комбинируя колонки из одной или нескольких таблиц, используя значения, общие для каждой из них. Это распространенная операция в базах данных с поддержкой SQL, которая соответствует соединению в [реляционной алгебре](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators). Специальный случай соединения одной таблицы часто называется «self-join».

**Синтаксис**

``` sql
SELECT <expr_list>
FROM <left_table>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <right_table>
(ON <expr_list>)|(USING <column_list>) ...
```

Выражения из секции `ON` и колонки из секции `USING` называются «ключами соединения». Если не указано иное, JOIN создает [декартово произведение](https://en.wikipedia.org/wiki/Cartesian_product) из строк с совпадающими «ключами соединения», что может привести к результатам с гораздо большим количеством строк, чем исходные таблицы.

## Связанное содержимое {#related-content}

- Блог: [ClickHouse: Очень быстрый СУБД с полной поддержкой SQL соединений - Часть 1](https://clickhouse.com/blog/clickhouse-fully-supports-joins)
- Блог: [ClickHouse: Очень быстрый СУБД с полной поддержкой SQL соединений - За кулисами - Часть 2](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)
- Блог: [ClickHouse: Очень быстрый СУБД с полной поддержкой SQL соединений - За кулисами - Часть 3](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)
- Блог: [ClickHouse: Очень быстрый СУБД с полной поддержкой SQL соединений - За кулисами - Часть 4](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4)

## Поддерживаемые типы JOIN {#supported-types-of-join}

Поддерживаются все стандартные типы [SQL JOIN](https://en.wikipedia.org/wiki/Join_(SQL)):

- `INNER JOIN`, возвращаются только совпадающие строки.
- `LEFT OUTER JOIN`, возвращаются не совпадающие строки из левой таблицы в дополнение к совпадающим строкам.
- `RIGHT OUTER JOIN`, возвращаются не совпадающие строки из правой таблицы в дополнение к совпадающим строкам.
- `FULL OUTER JOIN`, возвращаются не совпадающие строки из обеих таблиц в дополнение к совпадающим строкам.
- `CROSS JOIN`, производит декартово произведение целых таблиц, «ключи соединения» **не** указываются.

`JOIN` без указанного типа подразумевает `INNER`. Ключевое слово `OUTER` можно безопасно опустить. Альтернативный синтаксис для `CROSS JOIN` — указание нескольких таблиц в секции [FROM](../../../sql-reference/statements/select/from.md), разделенных запятыми.

Дополнительные типы соединений, доступные в ClickHouse:

- `LEFT SEMI JOIN` и `RIGHT SEMI JOIN`, белый список на «ключи соединения», без формирования декартового произведения.
- `LEFT ANTI JOIN` и `RIGHT ANTI JOIN`, черный список на «ключи соединения», без формирования декартового произведения.
- `LEFT ANY JOIN`, `RIGHT ANY JOIN` и `INNER ANY JOIN`, частично (для противоположной стороны `LEFT` и `RIGHT`) или полностью (для `INNER` и `FULL`) отключают декартово произведение для стандартных типов `JOIN`.
- `ASOF JOIN` и `LEFT ASOF JOIN`, объединение последовательностей с неточным совпадением. Использование `ASOF JOIN` описано ниже.
- `PASTE JOIN`, выполняет горизонтальную конкатенацию двух таблиц.

:::note
Когда [join_algorithm](../../../operations/settings/settings.md#join_algorithm) установлен в `partial_merge`, `RIGHT JOIN` и `FULL JOIN` поддерживаются только с `ALL` строгим режимом (`SEMI`, `ANTI`, `ANY` и `ASOF` не поддерживаются).
:::

## Настройки {#settings}

Тип соединения по умолчанию можно изменить с помощью настройки [join_default_strictness](../../../operations/settings/settings.md#join_default_strictness).

Поведение сервера ClickHouse для операций `ANY JOIN` зависит от настройки [any_join_distinct_right_table_keys](../../../operations/settings/settings.md#any_join_distinct_right_table_keys).


**Смотрите также**

- [join_algorithm](../../../operations/settings/settings.md#join_algorithm)
- [join_any_take_last_row](../../../operations/settings/settings.md#join_any_take_last_row)
- [join_use_nulls](../../../operations/settings/settings.md#join_use_nulls)
- [partial_merge_join_rows_in_right_blocks](../../../operations/settings/settings.md#partial_merge_join_rows_in_right_blocks)
- [join_on_disk_max_files_to_merge](../../../operations/settings/settings.md#join_on_disk_max_files_to_merge)
- [any_join_distinct_right_table_keys](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)

Используйте настройку `cross_to_inner_join_rewrite` для определения поведения, когда ClickHouse не может переписать `CROSS JOIN` как `INNER JOIN`. Значение по умолчанию — `1`, что позволяет продолжить соединение, но оно будет медленнее. Установите `cross_to_inner_join_rewrite` в `0`, если вы хотите получить ошибку, и установите его в `2`, чтобы не выполнять кросс-соединения, а вместо этого принудительно переписать все запятые/кросс-соединения. Если переписывание не удается при значении `2`, вы получите сообщение об ошибке, указывающее «Пожалуйста, попробуйте упростить раздел `WHERE`».

## Условия секции ON {#on-section-conditions}

Секция `ON` может содержать несколько условий, объединенных с помощью операторов `AND` и `OR`. Условия, specifying join keys, должны ссылаться как на левую, так и на правую таблицы и должны использовать оператор равенства. Другие условия могут использовать другие логические операторы, но они должны ссылаться либо на левую, либо на правую таблицу запроса.

Строки объединяются, если выполняется все сложное условие. Если условия не выполнены, строки все равно могут быть включены в результат в зависимости от типа `JOIN`. Обратите внимание, что если те же условия разместить в секции `WHERE` и они не будут выполнены, то строки всегда отфильтровываются из результата.

Оператор `OR` внутри секции `ON` работает с использованием алгоритма хеширования соединений — для каждого аргумента `OR` с ключами соединения для `JOIN` создается отдельная хеш-таблица, поэтому потребление памяти и время выполнения запроса растут линейно с увеличением количества выражений `OR` из секции `ON`.

:::note
Если условие ссылается на колонки из разных таблиц, то до сих пор поддерживается только оператор равенства (`=`).
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

``` sql
SELECT name, text FROM table_1 LEFT OUTER JOIN table_2
    ON table_1.Id = table_2.Id AND startsWith(table_2.text, 'Text');
```

Обратите внимание, что результат содержит строку с именем `C` и пустым текстовым столбцом. Она включена в результат, потому что используется тип соединения `OUTER`.

```response
┌─name─┬─text───┐
│ A    │ Text A │
│ B    │ Text B │
│ C    │        │
└──────┴────────┘
```

Запрос с типом `INNER` соединения и несколькими условиями:

``` sql
SELECT name, text, scores FROM table_1 INNER JOIN table_2
    ON table_1.Id = table_2.Id AND table_2.scores > 10 AND startsWith(table_2.text, 'Text');
```

Результат:

```sql
┌─name─┬─text───┬─scores─┐
│ B    │ Text B │     15 │
└──────┴────────┴────────┘
```
Запрос с типом `INNER` соединения и условием с `OR`:

``` sql
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

Запрос с типом `INNER` соединения и условиями с `OR` и `AND`:

:::note

По умолчанию поддерживаются неравные условия, если они используют колонки из одной таблицы. Например, `t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c`, так как `t1.b > 0` использует колонки только из `t1`, а `t2.b > t2.c` использует колонки только из `t2`. Тем не менее, вы можете попробовать экспериментальную поддержку условий типа `t1.a = t2.key AND t1.b > t2.key`, просмотрите раздел ниже для получения дополнительных сведений.

:::

``` sql
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

## Соединение с неравными условиями для колонок из разных таблиц {#join-with-inequality-conditions-for-columns-from-different-tables}

ClickHouse в настоящее время поддерживает `ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN` с неравными условиями в дополнение к равенствам. Неравные условия поддерживаются только для алгоритмов соединения `hash` и `grace_hash`. Неравные условия не поддерживаются с `join_use_nulls`.

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
SELECT t1.*, t2.* from t1 LEFT JOIN t2 ON t1.key = t2.key and (t1.a < t2.a) ORDER BY (t1.key, t1.attr, t2.key, t2.attr);
```

```response
key1	a	1	1	2	key1	B	2	1	2
key1	a	1	1	2	key1	C	3	4	5
key1	a	1	1	2	key1	D	4	1	6
key1	b	2	3	2	key1	C	3	4	5
key1	b	2	3	2	key1	D	4	1	6
key1	c	3	2	1	key1	D	4	1	6
key1	d	4	7	2			0	0	\N
key1	e	5	5	5			0	0	\N
key2	a2	1	1	1			0	0	\N
key4	f	2	3	4			0	0	\N
```


## Значения NULL в ключах JOIN {#null-values-in-join-keys}

NULL не равен никакому значению, включая себя. Это означает, что если ключ JOIN имеет значение NULL в одной таблице, оно не совпадет с NULL значением в другой таблице.

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

Обратите внимание, что строка с `Charlie` из таблицы `A` и строка со счетом 88 из таблицы `B` отсутствуют в результате из-за значения NULL в ключе JOIN.

Если вы хотите сопоставить значения NULL, используйте функцию `isNotDistinctFrom`, чтобы сравнить ключи JOIN.

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

`ASOF JOIN` полезен, когда необходимо соединить записи, у которых нет точного совпадения.

Алгоритм требует специальный столбец в таблицах. Этот столбец:

- Должен содержать упорядоченную последовательность.
- Может быть одного из следующих типов: [Int, UInt](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md), [Date](../../../sql-reference/data-types/date.md), [DateTime](../../../sql-reference/data-types/datetime.md), [Decimal](../../../sql-reference/data-types/decimal.md).
- Для алгоритма соединения `hash` он не может быть единственным столбцом в секции `JOIN`.

Синтаксис `ASOF JOIN ... ON`:

``` sql
SELECT expressions_list
FROM table_1
ASOF LEFT JOIN table_2
ON equi_cond AND closest_match_cond
```

Вы можете использовать любое количество условий равенства и ровно одно условие ближайшего совпадения. Например, `SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t`.

Условия, поддерживаемые для ближайшего совпадения: `>`, `>=`, `<`, `<=`.

Синтаксис `ASOF JOIN ... USING`:

``` sql
SELECT expressions_list
FROM table_1
ASOF JOIN table_2
USING (equi_column1, ... equi_columnN, asof_column)
```

`ASOF JOIN` использует `equi_columnX` для соединения по равенству и `asof_column` для соединения по ближайшему совпадению с условием `table_1.asof_column >= table_2.asof_column`. Столбец `asof_column` всегда является последним в секции `USING`.

Например, рассмотрим следующие таблицы:

         table_1                           table_2
      event   | ev_time | user_id       event   | ev_time | user_id
    ----------|---------|---------- ----------|---------|----------
                  ...                               ...
    event_1_1 |  12:00  |  42         event_2_1 |  11:59  |   42
                  ...                 event_2_2 |  12:30  |   42
    event_1_2 |  13:00  |  42         event_2_3 |  13:00  |   42
                  ...                               ...

`ASOF JOIN` может взять временную метку события пользователя из `table_1` и найти событие в `table_2`, где временная метка ближе всего к временной метке события из `table_1`, соответствующей условию ближайшего совпадения. Равные значения временной метки являются ближайшими, если они доступны. Здесь столбец `user_id` может быть использован для соединения на равенстве, а столбец `ev_time` может быть использован для соединения на ближайшем совпадении. В нашем примере `event_1_1` можно соединить с `event_2_1`, а `event_1_2` можно соединить с `event_2_3`, но `event_2_2` не может быть соединен.

:::note
`ASOF JOIN` поддерживается только алгоритмами соединения `hash` и `full_sorting_merge`.
Он **не** поддерживается в [табличном движке Join](../../../engines/table-engines/special/join.md).
:::

## Использование PASTE JOIN {#paste-join-usage}

Результат `PASTE JOIN` — это таблица, которая содержит все колонки из левой подзапроса, за которыми следуют все колонки из правого подзапроса. Строки сопоставляются на основе их позиций в оригинальных таблицах (порядок строк должен быть определен). Если подзапросы возвращают разное количество строк, лишние строки будут отрезаны.

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
Примечание: В этом случае результат может быть детерминированным, если чтение выполняется параллельно. Пример:
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

## Распределенный JOIN {#distributed-join}

Существует два способа выполнить соединение с распределенными таблицами:

- При использовании обычного `JOIN` запрос отправляется на удаленные серверы. Подзапросы выполняются на каждом из них, чтобы создать правую таблицу, и соединение выполняется с этой таблицей. Иными словами, правая таблица формируется на каждом сервере отдельно.
- При использовании `GLOBAL ... JOIN` сначала сервер-запросчик выполняет подзапрос для вычисления правой таблицы. Эта временная таблица передается на каждый удаленный сервер, и запросы выполняются на них, используя временные данные, которые были переданы.

Будьте осторожны при использовании `GLOBAL`. Для получения дополнительной информации см. раздел [Распределенные подзапросы](/sql-reference/operators/in#distributed-subqueries).

## Неявное преобразование типов {#implicit-type-conversion}

`INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN` и `FULL JOIN` запросы поддерживают неявное преобразование типов для «ключей соединения». Однако запрос не может быть выполнен, если ключи соединения из левой и правой таблиц не могут быть преобразованы в один тип (например, отсутствует тип данных, который может содержать все значения как из `UInt64`, так и из `Int64`, или `String` и `Int32`).

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
возвращает множество:
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

При соединении таблиц могут появляться пустые ячейки. Настройка [join_use_nulls](../../../operations/settings/settings.md#join_use_nulls) определяет, как ClickHouse заполняет эти ячейки.

Если ключи `JOIN` являются [Nullable](../../../sql-reference/data-types/nullable.md) полями, строки, где хотя бы один из ключей имеет значение [NULL](/sql-reference/syntax#null), не объединяются.

### Синтаксис {#syntax}

Столбцы, указанные в `USING`, должны иметь одинаковые имена в обеих подзапросах, а другие столбцы должны иметь разные имена. Вы можете использовать псевдонимы для изменения названий столбцов в подзапросах.

Секция `USING` указывает один или несколько столбцов для соединения, которые устанавливают равенство этих столбцов. Список столбцов задается без скобок. Более сложные условия соединения не поддерживаются.

### Ограничения синтаксиса {#syntax-limitations}

Для нескольких секций `JOIN` в одном запросе `SELECT`:

- Взятие всех столбцов через `*` доступно только в случае, если таблицы объединены, а не подзапросы.
- Секция `PREWHERE` недоступна.
- Секция `USING` недоступна.

Для секций `ON`, `WHERE` и `GROUP BY`:

- Произвольные выражения не могут использоваться в секциях `ON`, `WHERE` и `GROUP BY`, но вы можете определить выражение в секции `SELECT`, а затем использовать его в этих секциях через псевдоним.

### Производительность {#performance}

При выполнении `JOIN` не осуществляется оптимизация порядка выполнения относительно других этапов запроса. Соединение (поиск в правой таблице) выполняется до фильтрации в `WHERE` и до агрегации.

Каждый раз, когда выполняется запрос с тем же `JOIN`, подзапрос выполняется заново, так как результат не кэшируется. Чтобы избежать этого, используйте специальный [табличный движок Join](../../../engines/table-engines/special/join.md), который представляет собой подготовленный массив для объединения, который всегда находится в оперативной памяти.

В некоторых случаях эффективнее использовать [IN](../../../sql-reference/operators/in.md) вместо `JOIN`.

Если вам нужен `JOIN` для объединения с таблицами размеров (это относительно небольшие таблицы, содержащие свойства размеров, такие как названия рекламных кампаний), `JOIN` может быть не очень удобным из-за того, что правая таблица повторно доступается для каждого запроса. Для таких случаев есть функция "словари", которую вы должны использовать вместо `JOIN`. Для получения дополнительной информации см. раздел [Словари](../../../sql-reference/dictionaries/index.md).

### Ограничения памяти {#memory-limitations}

По умолчанию ClickHouse использует алгоритм [хеш-соединений](https://en.wikipedia.org/wiki/Hash_join). ClickHouse берет правую таблицу и создает хеш-таблицу для нее в оперативной памяти. Если включен `join_algorithm = 'auto'`, то после достижения некоторого порога потребления памяти ClickHouse переходит к алгоритму [слияния](https://en.wikipedia.org/wiki/Sort-merge_join). Для описания алгоритмов `JOIN` смотрите настройку [join_algorithm](../../../operations/settings/settings.md#join_algorithm).

Если вам необходимо ограничить потребление памяти операцией `JOIN`, используйте следующие настройки:

- [max_rows_in_join](../../../operations/settings/query-complexity.md#settings-max_rows_in_join) — Ограничивает количество строк в хеш-таблице.
- [max_bytes_in_join](../../../operations/settings/query-complexity.md#settings-max_bytes_in_join) — Ограничивает размер хеш-таблицы.

Когда любое из этих ограничений достигнуто, ClickHouse действует в соответствии с настройкой [join_overflow_mode](../../../operations/settings/query-complexity.md#settings-join_overflow_mode).

## Примеры {#examples}

Пример:

``` sql
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

``` text
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
