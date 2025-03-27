---
description: 'Документация по типу данных FixedString в ClickHouse'
sidebar_label: 'FixedString(N)'
sidebar_position: 10
slug: /sql-reference/data-types/fixedstring
title: 'FixedString(N)'
---


# FixedString(N)

Строка фиксированной длины в `N` байт (ни символов, ни кодовых точек).

Для объявления столбца типа `FixedString`, используйте следующий синтаксис:

```sql
<column_name> FixedString(N)
```

Где `N` — это натуральное число.

Тип `FixedString` эффективен, когда данные имеют длину ровно `N` байт. В остальных случаях это, скорее всего, приведет к снижению эффективности.

Примеры значений, которые могут быть эффективно храниться в столбцах типа `FixedString`:

- Двоичное представление IP-адресов (`FixedString(16)` для IPv6).
- Коды языков (ru_RU, en_US ... ).
- Коды валют (USD, RUB ... ).
- Двоичное представление хешей (`FixedString(16)` для MD5, `FixedString(32)` для SHA256).

Для хранения значений UUID используйте тип данных [UUID](../../sql-reference/data-types/uuid.md).

При вставке данных ClickHouse:

- Дополняет строку нулевыми байтами, если строка содержит менее `N` байт.
- Генерирует исключение `Too large value for FixedString(N)`, если строка содержит более `N` байт.

При выборке данных ClickHouse не удаляет нулевые байты в конце строки. Если вы используете предложение `WHERE`, вам следует вручную добавить нулевые байты, чтобы соответствовать значению `FixedString`. Следующий пример иллюстрирует, как использовать предложение `WHERE` с `FixedString`.

Рассмотрим следующую таблицу с единственным столбцом `FixedString(2)`:

```text
┌─name──┐
│ b     │
└───────┘
```

Запрос `SELECT * FROM FixedStringTable WHERE a = 'b'` не возвращает никаких данных в результате. Мы должны дополнить фильтр нулевыми байтами.

```sql
SELECT * FROM FixedStringTable
WHERE a = 'b\0'
```

```text
┌─a─┐
│ b │
└───┘
```

Это поведение отличается от MySQL для типа `CHAR` (где строки дополняются пробелами, и пробелы удаляются в выводе).

Обратите внимание, что длина значения `FixedString(N)` постоянна. Функция [length](/sql-reference/functions/array-functions#length) возвращает `N`, даже если значение `FixedString(N)` заполнено только нулевыми байтами, но функция [empty](../../sql-reference/functions/string-functions.md#empty) возвращает `1` в этом случае.
