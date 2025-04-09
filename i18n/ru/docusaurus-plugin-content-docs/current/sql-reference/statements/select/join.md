---
description: 'Документация для оператора JOIN'
sidebar_label: 'Объединение таблиц'
slug: /sql-reference/statements/select/join
title: 'Оператор JOIN'
---


# Оператор JOIN

JOIN создает новую таблицу, комбинируя столбцы из одной или нескольких таблиц, используя значения, общие для каждой. Это обычная операция в базах данных с поддержкой SQL, которая соответствует соединению в [реляционной алгебре](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators). Специальный случай объединения одной таблицы часто называют "self-join".

**Синтаксис**

```sql
SELECT <expr_list>
FROM <left_table>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <right_table>
(ON <expr_list>)|(USING <column_list>) ...
```

Выражения из секции `ON` и столбцы из секции `USING` называются "ключами объединения". Если не указано иное, JOIN создает [декартово произведение](https://en.wikipedia.org/wiki/Cartesian_product) из строк с совпадающими "ключами объединения", что может привести к результатам с значительно большим количеством строк, чем исходные таблицы.

## Связанный контент {#related-content}

- Блог: [ClickHouse: Поражающая скорость БД с полной поддержкой SQL Join - Часть 1](https://clickhouse.com/blog/clickhouse-fully-supports-joins)
- Блог: [ClickHouse: Поражающая скорость БД с полной поддержкой SQL Join - За кулисами - Часть 2](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)
- Блог: [ClickHouse: Поражающая скорость БД с полной поддержкой SQL Join - За кулисами - Часть 3](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)
- Блог: [ClickHouse: Поражающая скорость БД с полной поддержкой SQL Join - За кулисами - Часть 4](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4)

## Поддерживаемые типы JOIN {#supported-types-of-join}

Поддерживаются все стандартные типы [SQL JOIN](https://en.wikipedia.org/wiki/Join_(SQL)):

- `INNER JOIN`, возвращаются только совпадающие строки.
- `LEFT OUTER JOIN`, возвращаются несовпадающие строки из левой таблицы в дополнение к совпадающим строкам.
- `RIGHT OUTER JOIN`, возвращаются несовпадающие строки из правой таблицы в дополнение к совпадающим строкам.
- `FULL OUTER JOIN`, возвращаются несовпадающие строки из обеих таблиц в дополнение к совпадающим строкам.
- `CROSS JOIN`, создает декартово произведение целых таблиц, "ключи объединения" **не** указываются.

`JOIN` без указанного типа подразумевает `INNER`. Ключевое слово `OUTER` можно безопасно опустить. Альтернативный синтаксис для `CROSS JOIN` заключается в указании нескольких таблиц в секции [FROM](../../../sql-reference/statements/select/from.md), разделенных запятыми.

Дополнительные типы объединений, доступные в ClickHouse:

- `LEFT SEMI JOIN` и `RIGHT SEMI JOIN`, работает по белому списку на "ключах объединения", без создания декартового произведения.
- `LEFT ANTI JOIN` и `RIGHT ANTI JOIN`, работает по черному списку на "ключах объединения", без создания декартового произведения.
- `LEFT ANY JOIN`, `RIGHT ANY JOIN` и `INNER ANY JOIN`, частично (для противоположной стороны `LEFT` и `RIGHT`) или полностью (для `INNER` и `FULL`) отключает создание декартового произведения для стандартных типов `JOIN`.
- `ASOF JOIN` и `LEFT ASOF JOIN`, объединяет последовательности с не точным соответствием. Использование `ASOF JOIN` описано ниже.
- `PASTE JOIN`, выполняет горизонтальную конкатенацию двух таблиц.

:::note
Когда [join_algorithm](../../../operations/settings/settings.md#join_algorithm) установлен на `partial_merge`, `RIGHT JOIN` и `FULL JOIN` поддерживаются только с жесткостью `ALL` (`SEMI`, `ANTI`, `ANY` и `ASOF` не поддерживаются).
:::

## Настройки {#settings}

Тип объединения по умолчанию можно переопределить, используя настройку [join_default_strictness](../../../operations/settings/settings.md#join_default_strictness).

Поведение сервера ClickHouse для операций `ANY JOIN` зависит от настройки [any_join_distinct_right_table_keys](../../../operations/settings/settings.md#any_join_distinct_right_table_keys).

**Смотрите также**

- [join_algorithm](../../../operations/settings/settings.md#join_algorithm)
- [join_any_take_last_row](../../../operations/settings/settings.md#join_any_take_last_row)
- [join_use_nulls](../../../operations/settings/settings.md#join_use_nulls)
- [partial_merge_join_rows_in_right_blocks](../../../operations/settings/settings.md#partial_merge_join_rows_in_right_blocks)
- [join_on_disk_max_files_to_merge](../../../operations/settings/settings.md#join_on_disk_max_files_to_merge)
- [any_join_distinct_right_table_keys](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)

Используйте настройку `cross_to_inner_join_rewrite`, чтобы определить поведение, когда ClickHouse не может переписать `CROSS JOIN` как `INNER JOIN`. Значение по умолчанию - `1`, что позволяет объединению продолжаться, но оно будет медленнее. Установите `cross_to_inner_join_rewrite` в `0`, если хотите, чтобы было выброшено сообщение об ошибке, и установите его в `2`, чтобы не выполнять перекрестные объединения, а вместо этого принудительно переписать все запятые/перекрестные объединения. Если переписывание не удается при значении `2`, вы получите сообщение об ошибке с указанием "Пожалуйста, постарайтесь упростить секцию `WHERE`".

## Условия секции ON {#on-section-conditions}

Секция `ON` может содержать несколько условий, объединенных с помощью операторов `AND` и `OR`. Условия, указывающие ключи объединения, должны ссылаться как на левую, так и на правую таблицы и должны использовать оператор равенства. Другие условия могут использовать другие логические операторы, но они должны ссылаться либо на левую, либо на правую таблицу запроса.

Строки объединяются, если выполнено все сложное условие. Если условия не выполнены, строки могут быть включены в результат в зависимости от типа `JOIN`. Обратите внимание, что если те же условия помещены в секцию `WHERE` и они не выполнены, тогда строки всегда отфильтровываются из результата.

Оператор `OR` внутри секции `ON` работает с использованием алгоритма хэширования: для каждого аргумента `OR` с ключами объединения для `JOIN` создается отдельная хеш-таблица, поэтому потребление памяти и время выполнения запроса растут линейно с увеличением количества выражений `OR` в секции `ON`.

:::note
Если условие ссылается на столбцы из разных таблиц, тогда только оператор равенства (`=`) поддерживается на данный момент.
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

Обратите внимание, что результат содержит строку с именем `C` и пустым текстовым столбцом. Она включена в результат, потому что используется тип объединения `OUTER`.

```response
┌─name─┬─text───┐
│ A    │ Text A │
│ B    │ Text B │
│ C    │        │
└──────┴────────┘
```

Запрос с типом объединения `INNER` и несколькими условиями:

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
Запрос с типом объединения `INNER` и условием с `OR`:

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

Запрос с типом объединения `INNER` и условиями с `OR` и `AND`:

:::note

По умолчанию, неравные условия поддерживаются, если они используют столбцы из одной и той же таблицы.
Например, `t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c`, потому что `t1.b > 0` использует столбцы только из `t1`, а `t2.b > t2.c` использует столбцы только из `t2`.
Тем не менее, вы можете попробовать экспериментальную поддержку для условий, таких как `t1.a = t2.key AND t1.b > t2.key`, смотрите раздел ниже для более подробной информации.

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

## Объединение с неравными условиями для столбцов из разных таблиц {#join-with-inequality-conditions-for-columns-from-different-tables}

ClickHouse в настоящее время поддерживает `ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN` с неравными условиями в дополнение к условиям равенства. Неравные условия поддерживаются только для алгоритмов объединения `hash` и `grace_hash`. Неравные условия не поддерживаются с `join_use_nulls`.

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

## NULL значения в ключах объединения {#null-values-in-join-keys}

NULL не равен никакому значению, включая себя. Это означает, что если ключ объединения имеет значение NULL в одной таблице, он не будет соответствовать значению NULL в другой таблице.

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

Обратите внимание, что строка с `Charlie` из таблицы `A` и строка со счетом 88 из таблицы `B` отсутствуют в результате из-за значения NULL в ключе объединения.

Если вы хотите сопоставить значения NULL, используйте функцию `isNotDistinctFrom`, чтобы сравнить ключи объединения.

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

`ASOF JOIN` полезен, когда вам нужно объединять записи, которые не имеют точного соответствия.

Алгоритм требует специального столбца в таблицах. Этот столбец:

- Должен содержать упорядоченную последовательность.
- Может быть одним из следующих типов: [Int, UInt](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md), [Date](../../../sql-reference/data-types/date.md), [DateTime](../../../sql-reference/data-types/datetime.md), [Decimal](../../../sql-reference/data-types/decimal.md).
- Для алгоритма объединения `hash` он не может быть единственным столбцом в секции `JOIN`.

Синтаксис `ASOF JOIN ... ON`:

```sql
SELECT expressions_list
FROM table_1
ASOF LEFT JOIN table_2
ON equi_cond AND closest_match_cond
```

Вы можете использовать любое количество условий равенства и точно одну ближайшую условие совпадения. Например, `SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t`.

Поддерживаемые условия для ближайшего совпадения: `>`, `>=`, `<`, `<=`.

Синтаксис `ASOF JOIN ... USING`:

```sql
SELECT expressions_list
FROM table_1
ASOF JOIN table_2
USING (equi_column1, ... equi_columnN, asof_column)
```

`ASOF JOIN` использует `equi_columnX` для объединения по равенству и `asof_column` для объединения по ближайшему совпадению с условием `table_1.asof_column >= table_2.asof_column`. Столбец `asof_column` всегда будет последним в секции `USING`.

Например, рассмотрим следующие таблицы:

         table_1                           table_2
      event   | ev_time | user_id       event   | ev_time | user_id
    ----------|---------|---------- ----------|---------|----------
                  ...                               ...
    event_1_1 |  12:00  |  42         event_2_1 |  11:59  |   42
                  ...                 event_2_2 |  12:30  |   42
    event_1_2 |  13:00  |  42         event_2_3 |  13:00  |   42
                  ...                               ...

`ASOF JOIN` может взять временную метку события пользователя из `table_1` и найти событие в `table_2`, где временная метка наиболее близка к метке времени события из `table_1`, соответствующей условию ближайшего совпадения. Равные временные значения являются ближайшими, если доступны. Здесь столбец `user_id` может использоваться для объединения по равенству, а столбец `ev_time` может использоваться для объединения по ближайшему совпадению. В нашем примере `event_1_1` может быть объединен с `event_2_1`, и `event_1_2` может быть объединен с `event_2_3`, но `event_2_2` не может быть объединен.

:::note
`ASOF JOIN` поддерживается только алгоритмами объединения `hash` и `full_sorting_merge`.
Он **не** поддерживается в движке таблиц [Join](../../../engines/table-engines/special/join.md).
:::

## Использование PASTE JOIN {#paste-join-usage}

Результат `PASTE JOIN` - это таблица, которая содержит все столбцы из левой подписи, за которыми следуют все столбцы из правой подписи.
Строки сопоставляются на основе их позиций в исходных таблицах (порядок строк должен быть определен).
Если подзапросы возвращают разное количество строк, дополнительные строки будут отсеяны.

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
Примечание: В этом случае результат может быть недетерминированным, если чтение происходит параллельно. Пример:
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

Существует два способа выполнения объединения с участием распределенных таблиц:

- При использовании обычного `JOIN` запрос отправляется на удаленные серверы. Подзапросы выполняются на каждом из них для формирования правой таблицы, и объединение выполняется с этой таблицей. Другими словами, правая таблица формируется на каждом сервере отдельно.
- При использовании `GLOBAL ... JOIN` сначала сервер-запрашивающий выполняет подзапрос для вычисления правой таблицы. Эта временная таблица передается каждому удаленному серверу, и запросы выполняются на них с использованием временных данных, которые были переданы.

Будьте осторожны при использовании `GLOBAL`. Для получения дополнительной информации см. раздел [Распределенные подзапросы](/sql-reference/operators/in#distributed-subqueries).

## Неявное преобразование типов {#implicit-type-conversion}

`INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN` и `FULL JOIN` запросы поддерживают неявное преобразование типов для "ключей объединения". Однако запрос не может быть выполнен, если ключи объединения из левых и правых таблиц не могут быть преобразованы в единый тип (например, нет типа данных, который может вместить все значения как из `UInt64`, так и из `Int64`, или `String` и `Int32`).

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

При объединении таблиц могут появиться пустые ячейки. Настройка [join_use_nulls](../../../operations/settings/settings.md#join_use_nulls) определяет, как ClickHouse заполняет эти ячейки.

Если ключи `JOIN` являются [Nullable](../../../sql-reference/data-types/nullable.md) полями, строки, где хотя бы один из ключей имеет значение [NULL](/sql-reference/syntax#null), не объединяются.

### Синтаксис {#syntax}

Столбцы, указанные в `USING`, должны иметь одинаковые имена в обеих подзапросах, а остальные столбцы должны иметь разные названия. Вы можете использовать псевдонимы, чтобы изменить имена столбцов в подзапросах.

Секция `USING` указывает на один или несколько столбцов для объединения, которые устанавливают равенство этих столбцов. Список столбцов задается без скобок. Более сложные условия объединения не поддерживаются.

### Ограничения синтаксиса {#syntax-limitations}

Для нескольких секций `JOIN` в одном запросе `SELECT`:

- Использование всех столбцов через `*` доступно только в случае, если объединяются таблицы, а не подзапросы.
- Секция `PREWHERE` недоступна.
- Секция `USING` недоступна.

Для секций `ON`, `WHERE` и `GROUP BY`:

- Произвольные выражения не могут быть использованы в секциях `ON`, `WHERE` и `GROUP BY`, но вы можете определить выражение в секции `SELECT`, а затем использовать его в этих секциях через псевдоним.

### Производительность {#performance}

При выполнении `JOIN` нет оптимизации порядка выполнения в отношении других этапов запроса. Объединение (поиск в правой таблице) выполняется до фильтрации в `WHERE` и до агрегации.

Каждый раз, когда запрос выполняется с одним и тем же `JOIN`, подзапрос выполняется снова, поскольку результат не кэшируется. Чтобы избежать этого, используйте специальный движок таблиц [Join](../../../engines/table-engines/special/join.md), который является подготовленным массивом для объединения, который всегда находится в оперативной памяти.

В некоторых случаях более эффективно использовать [IN](../../../sql-reference/operators/in.md) вместо `JOIN`.

Если вам нужен `JOIN` для объединения с таблицами размерности (это относительно небольшие таблицы, которые содержат свойства размерности, такие как названия рекламных кампаний), `JOIN` может быть не очень удобным из-за того, что правая таблица переобрабатывается для каждого запроса. Для таких случаев есть функция "словарей", которую вы должны использовать вместо `JOIN`. Для получения дополнительной информации см. раздел [Словари](../../../sql-reference/dictionaries/index.md).

### Ограничения по памяти {#memory-limitations}

По умолчанию ClickHouse использует алгоритм [hash join](https://en.wikipedia.org/wiki/Hash_join). ClickHouse берет правую таблицу и создает для нее хеш-таблицу в оперативной памяти. Если `join_algorithm = 'auto'` включен, то после достижения определенного порога потребления памяти ClickHouse переходит на алгоритм объединения [merge](https://en.wikipedia.org/wiki/Sort-merge_join). Для описания алгоритмов `JOIN` см. настройку [join_algorithm](../../../operations/settings/settings.md#join_algorithm).

Если вам нужно ограничить потребление памяти операции `JOIN`, используйте следующие настройки:

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
