---
description: 'Справочная документация по типу данных FixedString в ClickHouse'
sidebar_label: 'FixedString(N)'
sidebar_position: 10
slug: /sql-reference/data-types/fixedstring
title: 'FixedString(N)'
doc_type: 'reference'
---

# FixedString(N)

Строка фиксированной длины в `N` байт (а не в символах или кодовых точках).

Чтобы объявить столбец типа `FixedString`, используйте следующий синтаксис:

```sql
<column_name> FixedString(N)
```

Где `N` — натуральное число.

Тип `FixedString` эффективен, когда данные имеют длину ровно `N` байт. Во всех остальных случаях он, скорее всего, снизит эффективность.

Примеры значений, которые могут эффективно храниться в столбцах типа `FixedString`:

* Двоичное представление IP-адресов (`FixedString(16)` для IPv6).
* Коды языков (ru&#95;RU, en&#95;US…).
* Коды валют (USD, RUB…).
* Двоичное представление хэшей (`FixedString(16)` для MD5, `FixedString(32)` для SHA256).

Для хранения значений UUID используйте тип данных [UUID](../../sql-reference/data-types/uuid.md).

При вставке данных ClickHouse:

* Дополняет строку нулевыми байтами, если строка содержит меньше `N` байт.
* Выбрасывает исключение `Too large value for FixedString(N)`, если строка содержит больше `N` байт.

Рассмотрим следующую таблицу с единственным столбцом типа `FixedString(2)`:

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

Обратите внимание, что длина значения `FixedString(N)` является постоянной. Функция [length](/sql-reference/functions/array-functions#length) возвращает `N` даже в том случае, если значение `FixedString(N)` заполнено только нулевыми байтами, а функция [empty](/sql-reference/functions/array-functions#empty) в этом случае возвращает `1`.

Выборка данных с предложением `WHERE` возвращает разные результаты в зависимости от того, как задано условие:

* Если используется оператор равенства `=` или `==` либо функция `equals`, ClickHouse *не* учитывает символ `\0`, т.е. запросы `SELECT * FROM FixedStringTable WHERE name = 'a';` и `SELECT * FROM FixedStringTable WHERE name = 'a\0';` возвращают один и тот же результат.
* Если используется предложение `LIKE`, ClickHouse *учитывает* символ `\0`, поэтому может потребоваться явно указать символ `\0` в условии фильтрации.

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

0 строк в результате.


SELECT name
FROM FixedStringTable
WHERE name LIKE 'a\0'
FORMAT JSONStringsEachRow

{"name":"a\u0000"}
```
