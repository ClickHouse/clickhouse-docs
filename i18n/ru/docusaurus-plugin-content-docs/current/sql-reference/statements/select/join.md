---
description: 'Документация по оператору JOIN'
sidebar_label: 'JOIN'
slug: /sql-reference/statements/select/join
title: 'Оператор JOIN'
keywords: ['INNER JOIN', 'LEFT JOIN', 'LEFT OUTER JOIN', 'RIGHT JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN', 'CROSS JOIN', 'LEFT SEMI JOIN', 'RIGHT SEMI JOIN', 'LEFT ANTI JOIN', 'RIGHT ANTI JOIN', 'LEFT ANY JOIN', 'RIGHT ANY JOIN', 'INNER ANY JOIN', 'ASOF JOIN', 'LEFT ASOF JOIN', 'PASTE JOIN']
doc_type: 'справочник'
---

# Оператор JOIN {#join-clause}

Оператор `JOIN` формирует новую таблицу, объединяя столбцы из одной или нескольких таблиц по общим для них значениям. Это распространённая операция в базах данных с поддержкой SQL, которая соответствует операции соединения в [реляционной алгебре](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators). Особый случай соединения таблицы с самой собой часто называют «self-join».

**Синтаксис**

```sql
SELECT <expr_list>
FROM <left_table>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <right_table>
(ON <expr_list>)|(USING <column_list>) ...
```

Выражения из предложения `ON` и столбцы из предложения `USING` называются «ключами соединения». Если не указано иное, оператор `JOIN` формирует [декартово произведение](https://en.wikipedia.org/wiki/Cartesian_product) строк с совпадающими «ключами соединения», что может приводить к получению результата с гораздо большим количеством строк, чем в исходных таблицах.

## Поддерживаемые типы JOIN {#supported-types-of-join}

Поддерживаются все стандартные типы [SQL JOIN](https://en.wikipedia.org/wiki/Join_(SQL)):

| Тип               | Описание                                                                      |
|-------------------|-------------------------------------------------------------------------------|
| `INNER JOIN`      | возвращаются только совпадающие строки.                                      |
| `LEFT OUTER JOIN` | помимо совпадающих строк возвращаются несовпадающие строки из левой таблицы. |
| `RIGHT OUTER JOIN`| помимо совпадающих строк возвращаются несовпадающие строки из правой таблицы.|
| `FULL OUTER JOIN` | помимо совпадающих строк возвращаются несовпадающие строки из обеих таблиц.  |
| `CROSS JOIN`      | создаёт декартово произведение всех строк таблиц, «ключи соединения» **не** указываются. |

- `JOIN` без явно указанного типа подразумевает `INNER`.
- Ключевое слово `OUTER` можно безопасно опускать.
- Альтернативный синтаксис для `CROSS JOIN` — указание нескольких таблиц в [предложении `FROM`](../../../sql-reference/statements/select/from.md), разделённых запятыми.

Дополнительные типы соединений, доступные в ClickHouse:

| Тип                                         | Описание                                                                                                                                |
|---------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| `LEFT SEMI JOIN`, `RIGHT SEMI JOIN`         | Формируют список разрешённых значений по «ключам соединения» (allowlist) без построения декартового произведения.                     |
| `LEFT ANTI JOIN`, `RIGHT ANTI JOIN`         | Формируют список запрещённых значений по «ключам соединения» (denylist) без построения декартового произведения.                      |
| `LEFT ANY JOIN`, `RIGHT ANY JOIN`, `INNER ANY JOIN` | Частично (для противоположной стороны `LEFT` и `RIGHT`) или полностью (для `INNER` и `FULL`) отключают декартово произведение для стандартных типов `JOIN`. |
| `ASOF JOIN`, `LEFT ASOF JOIN`               | Соединение последовательностей при неточном совпадении. Использование `ASOF JOIN` описано ниже.                                       |
| `PASTE JOIN`                                | Выполняет горизонтальное объединение (конкатенацию) двух таблиц.                                                                      |

:::note
Когда [join_algorithm](../../../operations/settings/settings.md#join_algorithm) установлен в значение `partial_merge`, `RIGHT JOIN` и `FULL JOIN` поддерживаются только со строгостью `ALL` (`SEMI`, `ANTI`, `ANY` и `ASOF` не поддерживаются).
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

Используйте настройку `cross_to_inner_join_rewrite`, чтобы задать поведение на случай, если ClickHouse не может переписать `CROSS JOIN` в `INNER JOIN`. Значение по умолчанию — `1`, при котором соединение продолжает выполняться, но будет работать медленнее. Установите `cross_to_inner_join_rewrite` в `0`, если вы хотите, чтобы генерировалась ошибка, и в `2` — чтобы не выполнять операции `CROSS JOIN`, а вместо этого принудительно переписывать все соединения через запятую/`CROSS JOIN`. Если при значении `2` переписать не удаётся, вы получите сообщение об ошибке: «Please, try to simplify `WHERE` section».

## Условия в секции ON {#on-section-conditions}

Секция `ON` может содержать несколько условий, объединённых операторами `AND` и `OR`. Условия, определяющие ключи соединения, должны:

* ссылаться и на левую, и на правую таблицу
* использовать оператор равенства

Другие условия могут использовать иные логические операторы, но при этом они должны ссылаться либо на левую, либо на правую таблицу запроса.

Строки соединяются, если выполнено всё составное условие целиком. Если условия не выполняются, строки всё равно могут быть включены в результат в зависимости от типа `JOIN`. Обратите внимание, что если те же условия размещены в секции `WHERE` и они не выполняются, то строки всегда отфильтровываются из результата.

Оператор `OR` внутри секции `ON` работает с использованием алгоритма хеш-соединения: для каждого аргумента `OR` с ключами соединения для `JOIN` создаётся отдельная хеш-таблица, поэтому потребление памяти и время выполнения запроса растут линейно с увеличением количества выражений `OR` секции `ON`.

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

Запрос с одним условием соединения по ключу и дополнительным условием для `table_2`:

```sql
SELECT name, text FROM table_1 LEFT OUTER JOIN table_2
    ON table_1.Id = table_2.Id AND startsWith(table_2.text, 'Text');
```

Обратите внимание, что результат содержит строку с именем `C` и пустым текстовым столбцом. Она включена в результат, так как используется внешнее соединение (`OUTER JOIN`).

```response
┌─name─┬─text───┐
│ A    │ Text A │
│ B    │ Text B │
│ C    │        │
└──────┴────────┘
```

Запрос с соединением типа `INNER` и несколькими условиями:

```sql
SELECT name, text, scores FROM table_1 INNER JOIN table_2
    ON table_1.Id = table_2.Id AND table_2.scores > 10 AND startsWith(table_2.text, 'Text');
```

Результат:

```sql
┌─name─┬─text───┬─scores─┐
│ B    │ Текст B │     15 │
└──────┴────────┴────────┘
```

Запрос с соединением типа `INNER` и условием с оператором `OR`:

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

Запрос с соединением типа `INNER` и условиями, использующими `OR` и `AND`:

:::note

По умолчанию условия с операторами неравенства поддерживаются, если в них используются столбцы из одной и той же таблицы.
Например, `t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c`, поскольку `t1.b > 0` использует столбцы только из `t1`, а `t2.b > t2.c` использует столбцы только из `t2`.
Однако вы можете включить экспериментальную поддержку условий вида `t1.a = t2.key AND t1.b > t2.key`; подробности см. в разделе ниже.

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

ClickHouse в настоящее время поддерживает `ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN` с условиями неравенства в дополнение к условиям равенства. Условия неравенства поддерживаются только для алгоритмов соединения `hash` и `grace_hash`. Условия неравенства не поддерживаются при `join_use_nulls`.

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

`NULL` не равно ни одному значению, включая само себя. Это означает, что если ключ `JOIN` содержит значение `NULL` в одной таблице, оно не будет соответствовать значению `NULL` в другой таблице.

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

Если нужно сопоставлять значения `NULL`, используйте функцию `isNotDistinctFrom` для сравнения ключей `JOIN`.

```sql
SELECT A.name, B.score FROM A LEFT JOIN B ON isNotDistinctFrom(A.id, B.id)
```

```markdown
┌─name────┬─score─┐
│ Алиса   │    90 │
│ Боб     │     0 │
│ Чарли │    88 │
└─────────┴───────┘
```

## Использование ASOF JOIN {#asof-join-usage}

`ASOF JOIN` полезен, когда нужно соединить записи, для которых нет точного совпадения.

Этот алгоритм JOIN требует специального столбца в таблицах. Этот столбец:

* Должен содержать упорядоченную последовательность.
* Может иметь один из следующих типов: [Int, UInt](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md), [Date](../../../sql-reference/data-types/date.md), [DateTime](../../../sql-reference/data-types/datetime.md), [Decimal](../../../sql-reference/data-types/decimal.md).
* Для алгоритма `hash` он не может быть единственным столбцом в предложении `JOIN`.

Синтаксис `ASOF JOIN ... ON`:

```sql
SELECT список_выражений
FROM таблица_1
ASOF LEFT JOIN таблица_2
ON условие_равенства AND условие_ближайшего_соответствия
```

Вы можете использовать любое количество условий равенства и ровно одно условие ближайшего соответствия. Например, `SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t`.

Поддерживаемые условия для ближайшего соответствия: `>`, `>=`, `<`, `<=`.

Синтаксис `ASOF JOIN ... USING`:

```sql
SELECT список_выражений
FROM таблица_1
ASOF JOIN таблица_2
USING (столбец_равенства1, ... столбец_равенстваN, столбец_asof)
```

`ASOF JOIN` использует `equi_columnX` для соединения по условию равенства и `asof_column` для соединения по ближайшему совпадению с условием `table_1.asof_column >= table_2.asof_column`. Столбец `asof_column` всегда должен быть последним в предложении `USING`.

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

`ASOF JOIN` может взять временную метку пользовательского события из `table_1` и найти событие в `table_2` с временной меткой, максимально близкой к временной метке события из `table_1`, удовлетворяющего условию ближайшего совпадения. При равенстве значений временных меток они считаются наиболее близкими, если такие имеются. Здесь столбец `user_id` можно использовать для соединения по равенству, а столбец `ev_time` — для соединения по принципу ближайшего совпадения. В нашем примере `event_1_1` может быть сопоставлено с `event_2_1`, а `event_1_2` — с `event_2_3`, но `event_2_2` не может быть сопоставлено.

:::note
`ASOF JOIN` поддерживается только алгоритмами соединения `hash` и `full_sorting_merge`.
Он **не** поддерживается в табличном движке [Join](../../../engines/table-engines/special/join.md).
:::

## Использование PASTE JOIN {#paste-join-usage}

Результат `PASTE JOIN` — таблица, содержащая все столбцы из левого подзапроса, за которыми следуют все столбцы из правого подзапроса.
Строки сопоставляются по их позициям в исходных таблицах (должен быть определён порядок строк).
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

Примечание: в этом случае результат может быть недетерминированным, если чтение выполняется параллельно. Например:

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

Существует два способа выполнить JOIN с участием распределённых таблиц:

- При использовании обычного `JOIN` запрос отправляется на удалённые серверы. На каждом из них выполняются подзапросы для формирования правой таблицы, и затем выполняется соединение с этой таблицей. Иными словами, правая таблица формируется на каждом сервере отдельно.
- При использовании `GLOBAL ... JOIN` сначала сервер, инициировавший запрос, выполняет подзапрос для вычисления правой таблицы. Эта временная таблица передаётся на каждый удалённый сервер, и на них выполняются запросы с использованием переданных временных данных.

Будьте осторожны при использовании `GLOBAL`. Дополнительную информацию см. в разделе [Распределённые подзапросы](/sql-reference/operators/in#distributed-subqueries).

## Неявное преобразование типов {#implicit-type-conversion}

Запросы `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN` и `FULL JOIN` поддерживают неявное преобразование типов для «ключей соединения». Однако запрос не может быть выполнен, если ключи соединения из левой и правой таблиц не могут быть приведены к одному типу (например, не существует типа данных, который может содержать все значения как из `UInt64`, так и из `Int64`, или из `String` и `Int32`).

**Пример**

Рассмотрим таблицу `t_1`:

```response
┌─a─┬─b─┬─toTypeName(a)─┬─toTypeName(b)─┐
│ 1 │ 1 │ UInt16        │ UInt8         │
│ 2 │ 2 │ UInt16        │ UInt8         │
└───┴───┴───────────────┴───────────────┘
```

и таблица `t_2`:

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

### Обработка пустых или NULL-ячеек {#processing-of-empty-or-null-cells}

При соединении таблиц могут появляться пустые ячейки. Настройка [join_use_nulls](../../../operations/settings/settings.md#join_use_nulls) определяет, как ClickHouse заполняет эти ячейки.

Если ключи `JOIN` являются полями типа [Nullable](../../../sql-reference/data-types/nullable.md), то строки, в которых хотя бы один из ключей имеет значение [NULL](/sql-reference/syntax#null), не соединяются.

### Синтаксис {#syntax}

Столбцы, указанные в `USING`, должны иметь одинаковые имена в обоих подзапросах, а остальные столбцы должны иметь разные имена. Вы можете использовать псевдонимы, чтобы изменить имена столбцов в подзапросах.

Предложение `USING` задаёт один или несколько столбцов для соединения, задавая равенство этих столбцов. Список столбцов указывается без скобок. Более сложные условия соединения не поддерживаются.

### Ограничения синтаксиса {#syntax-limitations}

Для нескольких предложений `JOIN` в одном запросе `SELECT`:

- Выбор всех столбцов через `*` доступен только если соединяются таблицы, а не подзапросы.
- Предложение `PREWHERE` недоступно.
- Предложение `USING` недоступно.

Для предложений `ON`, `WHERE` и `GROUP BY`:

- Произвольные выражения не могут использоваться в предложениях `ON`, `WHERE` и `GROUP BY`, но вы можете определить выражение в предложении `SELECT`, а затем использовать его в этих предложениях через псевдоним.

### Производительность {#performance}

При выполнении `JOIN` не производится оптимизация порядка выполнения относительно других стадий запроса. Соединение (поиск в правой таблице) выполняется до фильтрации в `WHERE` и до агрегации.

Каждый раз при выполнении запроса с одним и тем же `JOIN` подзапрос выполняется заново, поскольку результат не кэшируется. Чтобы избежать этого, используйте специальный движок таблиц [Join](../../../engines/table-engines/special/join.md), который представляет собой подготовленный массив для соединения, всегда находящийся в оперативной памяти.

В некоторых случаях эффективнее использовать [IN](../../../sql-reference/operators/in.md) вместо `JOIN`.

Если вам нужен `JOIN` для соединения с таблицами измерений (это относительно небольшие таблицы, содержащие свойства измерений, такие как имена рекламных кампаний), `JOIN` может быть не очень удобен из-за того, что правая таблица повторно читается для каждого запроса. Для таких случаев существует функциональность «словарей» (dictionaries), которую следует использовать вместо `JOIN`. Подробности см. в разделе [Dictionaries](../../../sql-reference/dictionaries/index.md).

### Ограничения по памяти {#memory-limitations}

По умолчанию ClickHouse использует алгоритм [hash join](https://en.wikipedia.org/wiki/Hash_join). ClickHouse берёт `right_table` и создаёт для неё хеш-таблицу в оперативной памяти. Если включён режим `join_algorithm = 'auto'`, то после достижения некоторого порога потребления памяти ClickHouse переключается на алгоритм [merge](https://en.wikipedia.org/wiki/Sort-merge_join) join. Описание алгоритмов `JOIN` см. в настройке [join_algorithm](../../../operations/settings/settings.md#join_algorithm).

Если вам необходимо ограничить потребление памяти операцией `JOIN`, используйте следующие настройки:

- [max_rows_in_join](/operations/settings/settings#max_rows_in_join) — ограничивает количество строк в хеш-таблице.
- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join) — ограничивает размер хеш-таблицы.

Когда достигается любой из этих лимитов, ClickHouse действует в соответствии с настройкой [join_overflow_mode](/operations/settings/settings#join_overflow_mode).

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

## Связанные материалы {#related-content}

- Блог: [ClickHouse: молниеносно быстрая СУБД с полной поддержкой операторов SQL JOIN — часть 1](https://clickhouse.com/blog/clickhouse-fully-supports-joins)
- Блог: [ClickHouse: молниеносно быстрая СУБД с полной поддержкой операторов SQL JOIN — внутренняя архитектура — часть 2](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)
- Блог: [ClickHouse: молниеносно быстрая СУБД с полной поддержкой операторов SQL JOIN — внутренняя архитектура — часть 3](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)
- Блог: [ClickHouse: молниеносно быстрая СУБД с полной поддержкой операторов SQL JOIN — внутренняя архитектура — часть 4](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4)
