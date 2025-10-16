---
slug: '/sql-reference/data-types/fixedstring'
sidebar_label: FixedString(N)
sidebar_position: 10
description: 'Документация для типа данных FixedString в ClickHouse'
title: FixedString(N)
doc_type: reference
---
# FixedString(N)

Строка фиксированной длины `N` байт (не символов и не кодовых точек).

Чтобы объявить колонку типа `FixedString`, используйте следующий синтаксис:

```sql
<column_name> FixedString(N)
```

Где `N` - натуральное число.

Тип `FixedString` эффективен, когда данные имеют длину ровно `N` байт. В остальных случаях это может привести к снижению эффективности.

Примеры значений, которые можно эффективно хранить в колонках типа `FixedString`:

- Двоичное представление IP-адресов (`FixedString(16)` для IPv6).
- Коды языков (ru_RU, en_US ... ).
- Коды валют (USD, RUB ... ).
- Двоичное представление хешей (`FixedString(16)` для MD5, `FixedString(32)` для SHA256).

Чтобы хранить значения UUID, используйте тип данных [UUID](../../sql-reference/data-types/uuid.md).

При вставке данных ClickHouse:

- Дополняет строку нулевыми байтами, если строка содержит менее `N` байт.
- Выбрасывает исключение `Too large value for FixedString(N)`, если строка содержит более `N` байт.

Рассмотрим следующую таблицу с единственной колонкой `FixedString(2)`:

```sql


INSERT INTO FixedStringTable VALUES ('a'), ('ab'), ('');
```

```sql
SELECT
    name,
    toTypeName(name),
    length(name),
    empty(name)
FROM FixedStringTable;
```

```text
┌─name─┬─toTypeName(name)─┬─length(name)─┬─empty(name)─┐
│ a    │ FixedString(2)   │            2 │           0 │
│ ab   │ FixedString(2)   │            2 │           0 │
│      │ FixedString(2)   │            2 │           1 │
└──────┴──────────────────┴──────────────┴─────────────┘
```

Обратите внимание, что длина значения `FixedString(N)` постоянна. Функция [length](/sql-reference/functions/array-functions#length) возвращает `N`, даже если значение `FixedString(N)` заполнено только нулевыми байтами, но функция [empty](../../sql-reference/functions/string-functions.md#empty) возвращает `1` в этом случае.

Выбор данных с условием `WHERE` возвращает различные результаты в зависимости от того, как задано условие:

- Если используется оператор равенства `=` или `==` или функция `equals`, ClickHouse _не_ учитывает символ `\0`, т.е. запросы `SELECT * FROM FixedStringTable WHERE name = 'a';` и `SELECT * FROM FixedStringTable WHERE name = 'a\0';` возвращают один и тот же результат.
- Если используется оператор `LIKE`, ClickHouse _учитывает_ символ `\0`, поэтому может потребоваться явно указать символ `\0` в условии фильтра.

```sql
SELECT name
FROM FixedStringTable
WHERE name = 'a'
FORMAT JSONStringsEachRow

{"name":"a\u0000"}


SELECT name
FROM FixedStringTable
WHERE name = 'a\0'
FORMAT JSONStringsEachRow

{"name":"a\u0000"}


SELECT name
FROM FixedStringTable
WHERE name = 'a'
FORMAT JSONStringsEachRow

Query id: c32cec28-bb9e-4650-86ce-d74a1694d79e

{"name":"a\u0000"}


SELECT name
FROM FixedStringTable
WHERE name LIKE 'a'
FORMAT JSONStringsEachRow

0 rows in set.


SELECT name
FROM FixedStringTable
WHERE name LIKE 'a\0'
FORMAT JSONStringsEachRow

{"name":"a\u0000"}
```