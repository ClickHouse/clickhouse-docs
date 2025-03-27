---
description: 'Документация по функциям поиска в строках'
sidebar_label: 'Поиск в строках'
sidebar_position: 160
slug: /sql-reference/functions/string-search-functions
title: 'Функции для поиска в строках'
---

# Функции для поиска в строках

Все функции в этом разделе по умолчанию ищут с учетом регистра. Поиск без учета регистра обычно обеспечивается отдельными вариантами функций.

:::note
Поиск без учета регистра следует правилам нижнего и верхнего регистра английского языка. Например, заглавная буква `i` в английском языке это `I`, в то время как в турецком языке это `İ` - результаты для языков, отличных от английского, могут быть неожиданными.
:::

Функции в этом разделе также предполагают, что искомая строка (в этом разделе обозначаемая как `haystack`) и поисковая строка (в этом разделе обозначаемая как `needle`) закодированы в однобайтовом формате. Если это предположение нарушается, исключение не выбрасывается, и результаты неопределены. Поиск с использованием строк, закодированных в UTF-8, обычно обеспечивается отдельными вариантами функций. Таким образом, если используется вариант функции UTF-8, а входные строки не закодированы в формате UTF-8, исключение не будет выброшено, и результаты будут неопределены. Обратите внимание, что автоматическая нормализация Unicode не выполняется, однако вы можете использовать функции
[normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) для этого.

[Общие функции для строк](string-functions.md) и [функции для замены в строках](string-replace-functions.md) описаны отдельно.
## position {#position}

Возвращает позицию (в байтах, начиная с 1) подстроки `needle` в строке `haystack`.

**Синтаксис**

```sql
position(haystack, needle[, start_pos])
```

Псевдоним:
- `position(needle IN haystack)`

**Аргументы**

- `haystack` — Строка, в которой выполняется поиск. [Строка](../data-types/string.md) или [Enum](../data-types/string.md).
- `needle` — Подстрока, которую нужно найти. [Строка](../data-types/string.md).
- `start_pos` – Позиция (с единичным началом) в `haystack`, с которой начинается поиск. [UInt](../data-types/int-uint.md). Необязательный.

**Возвращаемое значение**

- Начальная позиция в байтах, считая с 1, если подстрока найдена. [UInt64](../data-types/int-uint.md).
- 0, если подстрока не найдена. [UInt64](../data-types/int-uint.md).

Если подстрока `needle` пуста, применяются следующие правила:
- если `start_pos` не указан: вернуть `1`
- если `start_pos = 0`: вернуть `1`
- если `start_pos >= 1` и `start_pos <= length(haystack) + 1`: вернуть `start_pos`
- в противном случае: вернуть `0`

Тем же правилам подчиняются функции `locate`, `positionCaseInsensitive`, `positionUTF8` и `positionCaseInsensitiveUTF8`.

**Примеры**

Запрос:

```sql
SELECT position('Hello, world!', '!');
```

Результат:

```text
┌─position('Hello, world!', '!')─┐
│                             13 │
└────────────────────────────────┘
```

Пример с аргументом `start_pos`:

Запрос:

```sql
SELECT
    position('Hello, world!', 'o', 1),
    position('Hello, world!', 'o', 7)
```

Результат:

```text
┌─position('Hello, world!', 'o', 1)─┬─position('Hello, world!', 'o', 7)─┐
│                                 5 │                                 9 │
└───────────────────────────────────┴───────────────────────────────────┘
```

Пример синтаксиса `needle IN haystack`:

Запрос:

```sql
SELECT 6 = position('/' IN s) FROM (SELECT 'Hello/World' AS s);
```

Результат:

```text
┌─equals(6, position(s, '/'))─┐
│                           1 │
└─────────────────────────────┘
```

Примеры с пустой подстрокой `needle`:

Запрос:

```sql
SELECT
    position('abc', ''),
    position('abc', '', 0),
    position('abc', '', 1),
    position('abc', '', 2),
    position('abc', '', 3),
    position('abc', '', 4),
    position('abc', '', 5)
```

Результат:

```text
┌─position('abc', '')─┬─position('abc', '', 0)─┬─position('abc', '', 1)─┬─position('abc', '', 2)─┬─position('abc', '', 3)─┬─position('abc', '', 4)─┬─position('abc', '', 5)─┐
│                   1 │                      1 │                      1 │                      2 │                      3 │                      4 │                      0 │
└─────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┘
```
## locate {#locate}

Как и [position](#position), но аргументы `haystack` и `locate` поменяны местами.

Поведение этой функции зависит от версии ClickHouse:
- в версиях < v24.3, `locate` был псевдонимом функции `position` и принимал аргументы `(haystack, needle[, start_pos])`.
- в версиях >= 24.3, `locate` - это отдельная функция (для лучшей совместимости с MySQL) и принимает аргументы `(needle, haystack[, start_pos])`. Предыдущее поведение можно восстановить, используя настройку [function_locate_has_mysql_compatible_argument_order = false](/operations/settings/settings#function_locate_has_mysql_compatible_argument_order);

**Синтаксис**

```sql
locate(needle, haystack[, start_pos])
```
## positionCaseInsensitive {#positioncaseinsensitive}

Не чувствительный к регистру вариант [position](#position).

**Пример**

Запрос:

```sql
SELECT positionCaseInsensitive('Hello, world!', 'hello');
```

Результат:

```text
┌─positionCaseInsensitive('Hello, world!', 'hello')─┐
│                                                 1 │
└───────────────────────────────────────────────────┘
```
## positionUTF8 {#positionutf8}

Как и [position](#position), но предполагает, что `haystack` и `needle` закодированы в UTF-8.

**Примеры**

Функция `positionUTF8` правильно считает символ `ö` (представляемый двумя точками) как один кодовой момент Unicode:

Запрос:

```sql
SELECT positionUTF8('Motörhead', 'r');
```

Результат:

```text
┌─position('Motörhead', 'r')─┐
│                          5 │
└────────────────────────────┘
```
## positionCaseInsensitiveUTF8 {#positioncaseinsensitiveutf8}

Как и [positionUTF8](#positionutf8), но ищет без учета регистра.
## multiSearchAllPositions {#multisearchallpositions}

Как и [position](#position), но возвращает массив позиций (в байтах, начиная с 1) для нескольких подстрок `needle` в строке `haystack`.

:::note
Все функции `multiSearch*()` поддерживают до 2<sup>8</sup> needles.
:::

**Синтаксис**

```sql
multiSearchAllPositions(haystack, [needle1, needle2, ..., needleN])
```

**Аргументы**

- `haystack` — Строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `needle` — Подстроки, которые нужно найти. [Массив](../data-types/array.md).

**Возвращаемое значение**

- Массив начальной позиции в байтах, считая с 1, если подстрока найдена.
- 0, если подстрока не найдена.

**Пример**

Запрос:

```sql
SELECT multiSearchAllPositions('Hello, World!', ['hello', '!', 'world']);
```

Результат:

```text
┌─multiSearchAllPositions('Hello, World!', ['hello', '!', 'world'])─┐
│ [0,13,0]                                                          │
└───────────────────────────────────────────────────────────────────┘
```
## multiSearchAllPositionsCaseInsensitive {#multisearchallpositionscaseinsensitive}

Как [multiSearchAllPositions](#multisearchallpositions), но игнорирует регистр.

**Синтаксис**

```sql
multiSearchAllPositionsCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — Строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `needle` — Подстроки, которые нужно найти. [Массив](../data-types/array.md).

**Возвращаемое значение**

- Массив начальной позиции в байтах, считая с 1 (если подстрока найдена).
- 0, если подстрока не найдена.

**Пример**

Запрос:

```sql
SELECT multiSearchAllPositionsCaseInsensitive('ClickHouse',['c','h']);
```

Результат:

```response
["1","6"]
```
## multiSearchAllPositionsUTF8 {#multisearchallpositionsutf8}

Как [multiSearchAllPositions](#multisearchallpositions), но предполагает, что строки `haystack` и `needle` закодированы в UTF-8.

**Синтаксис**

```sql
multiSearchAllPositionsUTF8(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — UTF-8 строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `needle` — UTF-8 подстроки, которые нужно найти. [Массив](../data-types/array.md).

**Возвращаемое значение**

- Массив начальной позиции в байтах, считая с 1 (если подстрока найдена).
- 0, если подстрока не найдена.

**Пример**

Зgiven `ClickHouse` как строка UTF-8, найдите позиции `C` (`\x43`) и `H` (`\x48`).

Запрос:

```sql
SELECT multiSearchAllPositionsUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x43','\x48']);
```

Результат:

```response
["1","6"]
```
## multiSearchAllPositionsCaseInsensitiveUTF8 {#multisearchallpositionscaseinsensitiveutf8}

Как [multiSearchAllPositionsUTF8](#multisearchallpositionsutf8), но игнорирует регистр.

**Синтаксис**

```sql
multiSearchAllPositionsCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — UTF-8 строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `needle` — UTF-8 подстроки, которые нужно найти. [Массив](../data-types/array.md).

**Возвращаемое значение**

- Массив начальной позиции в байтах, считая с 1 (если подстрока найдена).
- 0, если подстрока не найдена.

**Пример**

Зgiven `ClickHouse` как строка UTF-8, найдите позиции `c` (`\x63`) и `h` (`\x68`).

Запрос:

```sql
SELECT multiSearchAllPositionsCaseInsensitiveUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x63','\x68']);
```

Результат:

```response
["1","6"]
```
## multiSearchFirstPosition {#multisearchfirstposition}

Как [`position`](#position), но возвращает левосторонний смещение в строке `haystack`, которое соответствует любому из множества строк `needle`.

Функции [`multiSearchFirstPositionCaseInsensitive`](#multisearchfirstpositioncaseinsensitive), [`multiSearchFirstPositionUTF8`](#multisearchfirstpositionutf8) и [`multiSearchFirstPositionCaseInsensitiveUTF8`](#multisearchfirstpositioncaseinsensitiveutf8) предоставляют варианты этой функции, которые игнорируют регистр и/илиUTF-8.

**Синтаксис**

```sql
multiSearchFirstPosition(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — Строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `needle` — Подстроки, которые нужно найти. [Массив](../data-types/array.md).

**Возвращаемое значение**

- Левосторонний смещение в строке `haystack`, которое соответствует любой из множества строк `needle`.
- 0, если не было найдено совпадений.

**Пример**

Запрос:

```sql
SELECT multiSearchFirstPosition('Hello World',['llo', 'Wor', 'ld']);
```

Результат:

```response
3
```
## multiSearchFirstPositionCaseInsensitive {#multisearchfirstpositioncaseinsensitive}

Как [`multiSearchFirstPosition`](#multisearchfirstposition), но игнорирует регистр.

**Синтаксис**

```sql
multiSearchFirstPositionCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — Строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `needle` — Массив подстрок, которые нужно найти. [Массив](../data-types/array.md).

**Возвращаемое значение**

- Левосторонний смещение в строке `haystack`, которое соответствует любой из множества строк `needle`.
- 0, если не было найдено совпадений.

**Пример**

Запрос:

```sql
SELECT multiSearchFirstPositionCaseInsensitive('HELLO WORLD',['wor', 'ld', 'ello']);
```

Результат:

```response
2
```
## multiSearchFirstPositionUTF8 {#multisearchfirstpositionutf8}

Как [`multiSearchFirstPosition`](#multisearchfirstposition), но предполагает, что `haystack` и `needle` - это строки UTF-8.

**Синтаксис**

```sql
multiSearchFirstPositionUTF8(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — UTF-8 строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `needle` — Массив UTF-8 подстрок, которые нужно найти. [Массив](../data-types/array.md).

**Возвращаемое значение**

- Левосторонний смещение в строке `haystack`, которое соответствует любой из множества строк `needle`.
- 0, если не было найдено совпадений.

**Пример**

Найдите левостороннее смещение в UTF-8 строке `hello world`, которое соответствует любой из заданных подстрок.

Запрос:

```sql
SELECT multiSearchFirstPositionUTF8('\x68\x65\x6c\x6c\x6f\x20\x77\x6f\x72\x6c\x64',['wor', 'ld', 'ello']);
```

Результат:

```response
2
```
## multiSearchFirstPositionCaseInsensitiveUTF8 {#multisearchfirstpositioncaseinsensitiveutf8}

Как [`multiSearchFirstPosition`](#multisearchfirstposition), но предполагает, что `haystack` и `needle` - это UTF-8 строки и игнорирует регистр.

**Синтаксис**

```sql
multiSearchFirstPositionCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — UTF-8 строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `needle` — Массив UTF-8 подстрок, которые нужно найти. [Массив](../data-types/array.md).

**Возвращаемое значение**

- Левосторонний смещение в строке `haystack`, которое соответствует любой из множества строк `needle`, игнорируя регистр.
- 0, если не было найдено совпадений.

**Пример**

Найдите левостороннее смещение в UTF-8 строке `HELLO WORLD`, которое соответствует любой из заданных подстрок.

Запрос:

```sql
SELECT multiSearchFirstPositionCaseInsensitiveUTF8('\x48\x45\x4c\x4c\x4f\x20\x57\x4f\x52\x4c\x44',['wor', 'ld', 'ello']);
```

Результат:

```response
2
```
## multiSearchFirstIndex {#multisearchfirstindex}

Возвращает индекс `i` (начиная с 1) первой найденной подстроки `needle<sub>i</sub>` в строке `haystack` и 0 в противном случае.

Функции [`multiSearchFirstIndexCaseInsensitive`](#multisearchfirstindexcaseinsensitive), [`multiSearchFirstIndexUTF8`](#multisearchfirstindexutf8) и [`multiSearchFirstIndexCaseInsensitiveUTF8`](#multisearchfirstindexcaseinsensitiveutf8) предоставляют варианты, игнорирующие регистр и/или UTF-8.

**Синтаксис**

```sql
multiSearchFirstIndex(haystack, [needle1, needle2, ..., needleN])
```
**Параметры**

- `haystack` — Строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `needle` — Подстроки, которые нужно найти. [Массив](../data-types/array.md).

**Возвращаемое значение**

- индекс (начиная с 1) первой найденной подстроки. В противном случае 0, если не было найдено совпадений. [UInt8](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT multiSearchFirstIndex('Hello World',['World','Hello']);
```

Результат:

```response
1
```
## multiSearchFirstIndexCaseInsensitive {#multisearchfirstindexcaseinsensitive}

Возвращает индекс `i` (начиная с 1) первой найденной подстроки `needle<sub>i</sub>` в строке `haystack` и 0 в противном случае. Игнорирует регистр.

**Синтаксис**

```sql
multiSearchFirstIndexCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — Строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `needle` — Подстроки, которые нужно найти. [Массив](../data-types/array.md).

**Возвращаемое значение**

- индекс (начиная с 1) первой найденной подстроки. В противном случае 0, если не было найдено совпадений. [UInt8](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT multiSearchFirstIndexCaseInsensitive('hElLo WoRlD',['World','Hello']);
```

Результат:

```response
1
```
## multiSearchFirstIndexUTF8 {#multisearchfirstindexutf8}

Возвращает индекс `i` (начиная с 1) первой найденной подстроки `needle<sub>i</sub>` в строке `haystack` и 0 в противном случае. Предполагает, что `haystack` и `needle` - это строки, закодированные в UTF-8.

**Синтаксис**

```sql
multiSearchFirstIndexUTF8(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — UTF-8 строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `needle` — Массив UTF-8 подстрок, которые нужно найти. [Массив](../data-types/array.md).

**Возвращаемое значение**

- индекс (начиная с 1) первой найденной подстроки. В противном случае 0, если не было найдено совпадений. [UInt8](../data-types/int-uint.md).

**Пример**

Учитывая `Hello World` как UTF-8 строку, найдите первый индекс строк UTF-8 `Hello` и `World`.

Запрос:

```sql
SELECT multiSearchFirstIndexUTF8('\x48\x65\x6c\x6c\x6f\x20\x57\x6f\x72\x6c\x64',['\x57\x6f\x72\x6c\x64','\x48\x65\x6c\x6c\x6f']);
```

Результат:

```response
1
```
## multiSearchFirstIndexCaseInsensitiveUTF8 {#multisearchfirstindexcaseinsensitiveutf8}

Возвращает индекс `i` (начиная с 1) первой найденной подстроки `needle<sub>i</sub>` в строке `haystack` и 0 в противном случае. Предполагает, что `haystack` и `needle` - это строки, закодированные в UTF-8. Игнорирует регистр.

**Синтаксис**

```sql
multiSearchFirstIndexCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — UTF-8 строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `needle` — Массив UTF-8 подстрок, которые нужно найти. [Массив](../data-types/array.md).

**Возвращаемое значение**

- индекс (начиная с 1) первой найденной подстроки. В противном случае 0, если не было найдено совпадений. [UInt8](../data-types/int-uint.md).

**Пример**

Учитывая `HELLO WORLD` как UTF-8 строку, найдите первый индекс строк UTF-8 `hello` и `world`.

Запрос:

```sql
SELECT multiSearchFirstIndexCaseInsensitiveUTF8('\x48\x45\x4c\x4c\x4f\x20\x57\x4f\x52\x4c\x44',['\x68\x65\x6c\x6c\x6f','\x77\x6f\x72\x6c\x64']);
```

Результат:

```response
1
```
## multiSearchAny {#multisearchany}

Возвращает 1, если хотя бы одна строка `needle<sub>i</sub>` соответствует строке `haystack`, и 0 в противном случае.

Функции [`multiSearchAnyCaseInsensitive`](#multisearchanycaseinsensitive), [`multiSearchAnyUTF8`](#multisearchanyutf8) и [`multiSearchAnyCaseInsensitiveUTF8`](#multisearchanycaseinsensitiveutf8) предоставляют варианты, игнорирующие регистр и/или UTF-8.

**Синтаксис**

```sql
multiSearchAny(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — Строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `needle` — Подстроки, которые нужно найти. [Массив](../data-types/array.md).

**Возвращаемое значение**

- 1, если есть хотя бы одно совпадение.
- 0, если нет ни одного совпадения.

**Пример**

Запрос:

```sql
SELECT multiSearchAny('ClickHouse',['C','H']);
```

Результат:

```response
1
```
## multiSearchAnyCaseInsensitive {#multisearchanycaseinsensitive}

Как [multiSearchAny](#multisearchany), но игнорирует регистр.

**Синтаксис**

```sql
multiSearchAnyCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — Строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `needle` — Подстроки, которые нужно найти. [Массив](../data-types/array.md)

**Возвращаемое значение**

- 1, если есть хотя бы одно совпадение без учета регистра.
- 0, если нет ни одного совпадения без учета регистра.

**Пример**

Запрос:

```sql
SELECT multiSearchAnyCaseInsensitive('ClickHouse',['c','h']);
```

Результат:

```response
1
```
## multiSearchAnyUTF8 {#multisearchanyutf8}

Как [multiSearchAny](#multisearchany), но предполагает, что `haystack` и подстроки `needle` закодированы в UTF-8.

**Синтаксис**

```sql
multiSearchAnyUTF8(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — UTF-8 строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `needle` — UTF-8 подстроки, которые нужно найти. [Массив](../data-types/array.md).

**Возвращаемое значение**

- 1, если есть хотя бы одно совпадение.
- 0, если нет ни одного совпадения.

**Пример**

Учитывая `ClickHouse` как строку UTF-8, проверьте, есть ли буквы `C` ('\x43') или `H` ('\x48') в слове.

Запрос:

```sql
SELECT multiSearchAnyUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x43','\x48']);
```

Результат:

```response
1
```
## multiSearchAnyCaseInsensitiveUTF8 {#multisearchanycaseinsensitiveutf8}

Как [multiSearchAnyUTF8](#multisearchanyutf8), но игнорирует регистр.

**Синтаксис**

```sql
multiSearchAnyCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — UTF-8 строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `needle` — UTF-8 подстроки, которые нужно найти. [Массив](../data-types/array.md)

**Возвращаемое значение**

- 1, если есть хотя бы одно совпадение без учета регистра.
- 0, если нет ни одного совпадения без учета регистра.

**Пример**

Учитывая `ClickHouse` как строку UTF-8, проверьте, есть ли буква `h`(`\x68`) в слове, игнорируя регистр.

Запрос:

```sql
SELECT multiSearchAnyCaseInsensitiveUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x68']);
```

Результат:

```response
1
```
## match {#match}

Возвращает, соответствует ли строка `haystack` регулярному выражению `pattern` в [синтаксисе регулярных выражений re2](https://github.com/google/re2/wiki/Syntax).

Совпадение основывается на UTF-8, например, `.` соответствует кодовой точке Unicode `¥`, которая представлена в UTF-8 с использованием двух байтов. Регулярное выражение не должно содержать нулевых байтов. Если строка или шаблон не являются допустимыми UTF-8, поведение неопределено.

В отличие от поведения по умолчанию re2, `.` соответствует разрывам строк. Чтобы отключить это, добавьте к шаблону `(?-s)`.

Если вы хотите искать только подстроки в строке, вы можете использовать функции [like](#like) или [position](#position) - они работают гораздо быстрее, чем эта функция.

**Синтаксис**

```sql
match(haystack, pattern)
```

Псевдоним: `haystack REGEXP pattern operator`
## multiMatchAny {#multimatchany}

Как `match`, но возвращает 1, если хотя бы один из шаблонов совпадает, и 0 в противном случае.

:::note
Функции в семействе `multi[Fuzzy]Match*()` используют библиотеку (Vectorscan)[https://github.com/VectorCamp/vectorscan]. Таким образом, они активированы только если ClickHouse скомпилирован с поддержкой vectorscan.

Чтобы отключить все функции, использующие hyperscan, используйте установку `SET allow_hyperscan = 0;`.

Из-за ограничений vectorscan длина строки `haystack` должна быть менее 2<sup>32</sup> байтов.

Hyperscan, как правило, уязвим для атак отказа в обслуживании регулярными выражениями (ReDoS) (например, смотрите
(здесь)[https://www.usenix.org/conference/usenixsecurity22/presentation/turonova], (здесь)[https://doi.org/10.1007/s10664-021-10033-1] и
(здесь)[https://doi.org/10.1145/3236024.3236027]. Пользователям советуют тщательно проверять предоставленные шаблоны.
:::

Если вы хотите искать несколько подстрок в строке, вы можете использовать функцию [multiSearchAny](#multisearchany) вместо этого - она работает гораздо быстрее, чем эта функция.

**Синтаксис**

```sql
multiMatchAny(haystack, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```
## multiMatchAnyIndex {#multimatchanyindex}

Как `multiMatchAny`, но возвращает любой индекс, который соответствует `haystack`.

**Синтаксис**

```sql
multiMatchAnyIndex(haystack, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```
## multiMatchAllIndices {#multimatchallindices}

Как `multiMatchAny`, но возвращает массив всех индексов, которые соответствуют `haystack` в любом порядке.

**Синтаксис**

```sql
multiMatchAllIndices(haystack, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```
## multiFuzzyMatchAny {#multifuzzymatchany}

Как `multiMatchAny`, но возвращает 1, если какой-либо шаблон совпадает с `haystack` в пределах фиксированного [редакционного расстояния](https://en.wikipedia.org/wiki/Edit_distance). Эта функция зависит от экспериментальной функции библиотеки [hyperscan](https://intel.github.io/hyperscan/dev-reference/compilation.html#approximate-matching) и может быть медленной для некоторых крайних случаев. Производительность зависит от значения редакционного расстояния и использованных шаблонов, но она всегда дороже по сравнению с неразмытыми вариантами.

:::note
Функции `multiFuzzyMatch*()` не поддерживают регулярные выражения UTF-8 (они рассматривают их как последовательность байтов) из-за ограничений hyperscan.
:::

**Синтаксис**

```sql
multiFuzzyMatchAny(haystack, distance, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```
## multiFuzzyMatchAnyIndex {#multifuzzymatchanyindex}

Как `multiFuzzyMatchAny`, но возвращает любой индекс, который соответствует `haystack` в пределах фиксированного редакционного расстояния.

**Синтаксис**

```sql
multiFuzzyMatchAnyIndex(haystack, distance, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```
## multiFuzzyMatchAllIndices {#multifuzzymatchallindices}

Как `multiFuzzyMatchAny`, но возвращает массив всех индексов в любом порядке, которые соответствуют `haystack` в пределах фиксированного редакционного расстояния.

**Синтаксис**

```sql
multiFuzzyMatchAllIndices(haystack, distance, [pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>])
```
## extract {#extract}

Возвращает первое совпадение регулярного выражения в строке.
Если `haystack` не совпадает с регулярным выражением `pattern`, возвращается пустая строка. 

Если регулярное выражение имеет группы захвата, функция сопоставляет входную строку с первой группой захвата.

**Синтаксис**

```sql
extract(haystack, pattern)
```

**Аргументы**

- `haystack` — Входная строка. [Строка](../data-types/string.md).
- `pattern` — Регулярное выражение с [синтаксисом регулярных выражений re2](https://github.com/google/re2/wiki/Syntax).

**Возвращаемое значение**

- Первое совпадение регулярного выражения в строке `haystack`. [Строка](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT extract('number: 1, number: 2, number: 3', '\\d+') AS result;
```

Результат:

```response
┌─result─┐
│ 1      │
└────────┘
```
## extractAll {#extractall}

Возвращает массив всех совпадений регулярного выражения в строке. Если `haystack` не совпадает с регулярным выражением `pattern`, возвращается пустая строка.

Поведение по отношению к подшаблонам такое же, как в функции [`extract`](#extract).

**Синтаксис**

```sql
extractAll(haystack, pattern)
```

**Аргументы**

- `haystack` — Входная строка. [Строка](../data-types/string.md).
- `pattern` — Регулярное выражение с [синтаксисом регулярных выражений re2](https://github.com/google/re2/wiki/Syntax).

**Возвращаемое значение**

- Массив совпадений регулярного выражения в строке `haystack`. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).

**Пример**

Запрос:

```sql
SELECT extractAll('number: 1, number: 2, number: 3', '\\d+') AS result;
```

Результат:

```response
┌─result────────┐
│ ['1','2','3'] │
└───────────────┘
```
## extractAllGroupsHorizontal {#extractallgroupshorizontal}

Соответствует всем группам строки `haystack`, используя регулярное выражение `pattern`. Возвращает массив массивов, где первый массив включает все фрагменты, соответствующие первой группе, второй массив - соответствующие второй группе и т.д.

Эта функция медленнее, чем [extractAllGroupsVertical](#extractallgroupsvertical).

**Синтаксис**

```sql
extractAllGroupsHorizontal(haystack, pattern)
```

**Аргументы**

- `haystack` — Входная строка. [Строка](../data-types/string.md).
- `pattern` — Регулярное выражение с [синтаксисом регулярных выражений re2](https://github.com/google/re2/wiki/Syntax). Должно содержать группы, каждая группа заключена в скобки. Если `pattern` не содержит групп, выбрасывается исключение. [Строка](../data-types/string.md).

**Возвращаемое значение**

- Массив массивов совпадений. [Массив](../data-types/array.md).

:::note
Если `haystack` не соответствует регулярному выражению `pattern`, возвращается массив пустых массивов.
:::

**Пример**

```sql
SELECT extractAllGroupsHorizontal('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

Результат:

```text
┌─extractAllGroupsHorizontal('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','def','ghi'],['111','222','333']]                                                │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```
## extractGroups {#extractgroups}

Сопоставляет все группы заданной входной строки с данным регулярным выражением и возвращает массив массивов совпадений.

**Синтаксис**

```sql
extractGroups(haystack, pattern)
```

**Аргументы**

- `haystack` — Входная строка. [Строка](../data-types/string.md).
- `pattern` — Регулярное выражение с [синтаксисом регулярных выражений re2](https://github.com/google/re2/wiki/Syntax). Должно содержать группы, каждая группа заключена в скобки. Если `pattern` не содержит групп, выбрасывается исключение. [Строка](../data-types/string.md).

**Возвращаемое значение**

- Массив массивов совпадений. [Массив](../data-types/array.md).

**Пример**

```sql
SELECT extractGroups('hello abc=111 world', '("[^"]+"|\\w+)=("[^"]+"|\\w+)') AS result;
```

Результат:

```text
┌─result────────┐
│ ['abc','111'] │
└───────────────┘
```
## extractAllGroupsVertical {#extractallgroupsvertical}

Соответствует всем группам строки `haystack`, используя регулярное выражение `pattern`. Возвращает массив массивов, где каждый массив включает совпадающие фрагменты из каждой группы. Фрагменты сгруппированы в порядке их появления в `haystack`.

**Синтаксис**

```sql
extractAllGroupsVertical(haystack, pattern)
```

**Аргументы**

- `haystack` — Входная строка. [Строка](../data-types/string.md).
- `pattern` — Регулярное выражение с [синтаксисом регулярных выражений re2](https://github.com/google/re2/wiki/Syntax). Должно содержать группы, каждая группа заключена в скобки. Если `pattern` не содержит групп, выбрасывается исключение. [Строка](../data-types/string.md).

**Возвращаемое значение**

- Массив массивов совпадений. [Массив](../data-types/array.md).

:::note
Если `haystack` не соответствует регулярному выражению `pattern`, возвращается пустой массив.
:::

**Пример**

```sql
SELECT extractAllGroupsVertical('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)');
```

Результат:

```text
┌─extractAllGroupsVertical('abc=111, def=222, ghi=333', '("[^"]+"|\\w+)=("[^"]+"|\\w+)')─┐
│ [['abc','111'],['def','222'],['ghi','333']]                                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

## like {#like}

Возвращает истинное значение, если строка `haystack` соответствует выражению LIKE `pattern`.

Выражение LIKE может содержать обычные символы и следующие метасимволы:

- `%` указывает на произвольное количество произвольных символов (включая ноль символов).
- `_` указывает на один произвольный символ.
- `\` используется для экранирования литералов `%`, `_` и `\`.

Сопоставление основано на UTF-8, например, `_` соответствует кодовой точки Unicode `¥`, которая представлена в UTF-8 с использованием двух байтов.

Если haystack или выражение LIKE не являются допустимыми UTF-8, поведение не определено.

Автоматическая нормализация Unicode не выполняется, вы можете использовать функции [normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) для этого.

Чтобы сопоставить с литералом `%`, `_` и `\` (которые являются метасимволами LIKE), предшествуйте им обратной косой чертой: `\%`, `\_` и `\\`.
Обратная косая черта теряет свое специальное значение (т. е. интерпретируется литерално), если она предшествует символу, отличному от `%`, `_` или `\`.
Обратите внимание, что ClickHouse требует, чтобы обратные косые черты в строках [также были экранированы](../syntax.md#string), поэтому вам на самом деле нужно писать `\\%`, `\\_` и `\\\\`.

Для выражений LIKE вида `%needle%` функция работает так же быстро, как функция `position`.
Все остальные выражения LIKE внутренне преобразуются в регулярное выражение и выполняются с производительностью, аналогичной функции `match`.

**Синтаксис**

```sql
like(haystack, pattern)
```

Псевдоним: `haystack LIKE pattern` (оператор)
## notLike {#notlike}

Как `like`, но отрицает результат.

Псевдоним: `haystack NOT LIKE pattern` (оператор)
## ilike {#ilike}

Как `like`, но выполняет поиск без учета регистра.

Псевдоним: `haystack ILIKE pattern` (оператор)
## notILike {#notilike}

Как `ilike`, но отрицает результат.

Псевдоним: `haystack NOT ILIKE pattern` (оператор)
## ngramDistance {#ngramdistance}

Вычисляет расстояние 4-граммы между строкой `haystack` и строкой `needle`. Для этого он считает симметричную разность между двумя мультимножества 4-грамм и нормализует ее по сумме их кардинальностей. Возвращает [Float32](/sql-reference/data-types/float) в диапазоне от 0 до 1. Чем меньше результат, тем больше похожи строки друг на друга.

Функции [`ngramDistanceCaseInsensitive`](#ngramdistancecaseinsensitive), [`ngramDistanceUTF8`](#ngramdistanceutf8), [`ngramDistanceCaseInsensitiveUTF8`](#ngramdistancecaseinsensitiveutf8) предоставляют варианты этой функции без учета регистра и/или для UTF-8.

**Синтаксис**

```sql
ngramDistance(haystack, needle)
```

**Параметры**

- `haystack`: Первая сравниваемая строка. [Строковый литерал](/sql-reference/syntax#string)
- `needle`: Вторая сравниваемая строка. [Строковый литерал](/sql-reference/syntax#string)

**Возвращаемое значение**

- Значение от 0 до 1, представляющееSimilarity между двумя строками. [Float32](/sql-reference/data-types/float)

**Детали реализации**

Эта функция выбросит исключение, если постоянные аргументы `needle` или `haystack` превышают 32 Кб в размере. Если любые непостоянные аргументы `haystack` или `needle` превышают 32 Кб в размере, то расстояние всегда будет равно 1.

**Примеры**

Чем более похожи две строки друг на друга, тем ближе результат будет к 0 (идентично).

Запрос:

```sql
SELECT ngramDistance('ClickHouse','ClickHouse!');
```

Результат:

```response
0.06666667
```

Чем менее похожи две строки, тем больше будет результат.

Запрос:

```sql
SELECT ngramDistance('ClickHouse','House');
```

Результат:

```response
0.5555556
```
## ngramDistanceCaseInsensitive {#ngramdistancecaseinsensitive}

Предоставляет вариант [ngramDistance](#ngramdistance) без учета регистра.

**Синтаксис**

```sql
ngramDistanceCaseInsensitive(haystack, needle)
```

**Параметры**

- `haystack`: Первая сравниваемая строка. [Строковый литерал](/sql-reference/syntax#string)
- `needle`: Вторая сравниваемая строка. [Строковый литерал](/sql-reference/syntax#string)

**Возвращаемое значение**

- Значение от 0 до 1, представляющееSimilarity между двумя строками. [Float32](/sql-reference/data-types/float)

**Примеры**

С [ngramDistance](#ngramdistance) различия в регистре влияют на значение схожести:

Запрос:

```sql
SELECT ngramDistance('ClickHouse','clickhouse');
```

Результат:

```response
0.71428573
```

С [ngramDistanceCaseInsensitive](#ngramdistancecaseinsensitive) регистр игнорируется, так что две идентичные строки, отличающиеся только регистром, теперь вернут низкое значение схожести:

Запрос:

```sql
SELECT ngramDistanceCaseInsensitive('ClickHouse','clickhouse');
```

Результат:

```response
0
```
## ngramDistanceUTF8 {#ngramdistanceutf8}

Предоставляет вариант [ngramDistance](#ngramdistance) для строк, закодированных в UTF-8.

**Синтаксис**

```sql
ngramDistanceUTF8(haystack, needle)
```

**Параметры**

- `haystack`: Первая строка, закодированная в UTF-8. [Строковый литерал](/sql-reference/syntax#string)
- `needle`: Вторая строка, закодированная в UTF-8. [Строковый литерал](/sql-reference/syntax#string)

**Возвращаемое значение**

- Значение от 0 до 1, представляющееSimilarity между двумя строками. [Float32](/sql-reference/data-types/float)

**Пример**

Запрос:

```sql
SELECT ngramDistanceUTF8('abcde','cde');
```

Результат:

```response
0.5
```
## ngramDistanceCaseInsensitiveUTF8 {#ngramdistancecaseinsensitiveutf8}

Предоставляет вариант без учета регистра для [ngramDistanceUTF8](#ngramdistanceutf8).

**Синтаксис**

```sql
ngramDistanceCaseInsensitiveUTF8(haystack, needle)
```

**Параметры**

- `haystack`: Первая строка, закодированная в UTF-8. [Строковый литерал](/sql-reference/syntax#string)
- `needle`: Вторая строка, закодированная в UTF-8. [Строковый литерал](/sql-reference/syntax#string)

**Возвращаемое значение**

- Значение от 0 до 1, представляющееSimilarity между двумя строками. [Float32](/sql-reference/data-types/float)

**Пример**

Запрос:

```sql
SELECT ngramDistanceCaseInsensitiveUTF8('abcde','CDE');
```

Результат:

```response
0.5
```
## ngramSearch {#ngramsearch}

Как `ngramDistance`, но вычисляет несимметричную разность между строкой `needle` и строкой `haystack`, т. е. количество n-граммов из `needle` минус общее количество n-граммов, нормализованное по количеству n-граммов `needle`. Возвращает [Float32](/sql-reference/data-types/float) в диапазоне от 0 до 1. Чем больше результат, тем более вероятно, что `needle` находится в `haystack`. Эта функция полезна для нечеткого поиска строк. Также смотрите функцию [`soundex`](../../sql-reference/functions/string-functions#soundex).

Функции [`ngramSearchCaseInsensitive`](#ngramsearchcaseinsensitive), [`ngramSearchUTF8`](#ngramsearchutf8), [`ngramSearchCaseInsensitiveUTF8`](#ngramsearchcaseinsensitiveutf8) предоставляют варианты этой функции без учета регистра и/или для UTF-8.

**Синтаксис**

```sql
ngramSearch(haystack, needle)
```

**Параметры**

- `haystack`: Первая строка для сравнения. [Строковый литерал](/sql-reference/syntax#string)
- `needle`: Вторая строка для сравнения. [Строковый литерал](/sql-reference/syntax#string)

**Возвращаемое значение**

- Значение от 0 до 1, представляющее вероятность того, что `needle` находится в `haystack`. [Float32](/sql-reference/data-types/float)

**Детали реализации**

:::note
Варианты UTF-8 используют расстояние 3-граммы. Эти расстояния не являются абсолютно справедливыми n-граммами. Мы используем 2-байтовые хеши для хеширования n-грамм, а затем рассчитываем (не-)симметричную разность между этими таблицами хешей - коллизии могут происходить. В формате UTF-8 без учета регистра мы не используем честную функцию `tolower` - мы обнуляем 5-й бит (начиная с нуля) каждого байта кодовой точки и первый бит нулевого байта, если байтов больше одного - это работает для латиницы и в основном для всех кириллических букв.
:::

**Пример**

Запрос:

```sql
SELECT ngramSearch('Hello World','World Hello');
```

Результат:

```response
0.5
```
## ngramSearchCaseInsensitive {#ngramsearchcaseinsensitive}

Предоставляет вариант без учета регистра для [ngramSearch](#ngramsearch).

**Синтаксис**

```sql
ngramSearchCaseInsensitive(haystack, needle)
```

**Параметры**

- `haystack`: Первая строка для сравнения. [Строковый литерал](/sql-reference/syntax#string)
- `needle`: Вторая строка для сравнения. [Строковый литерал](/sql-reference/syntax#string)

**Возвращаемое значение**

- Значение от 0 до 1, представляющее вероятность того, что `needle` находится в `haystack`. [Float32](/sql-reference/data-types/float)

Чем больше результат, тем более вероятно, что `needle` находится в `haystack`.

**Пример**

Запрос:

```sql
SELECT ngramSearchCaseInsensitive('Hello World','hello');
```

Результат:

```response
1
```
## ngramSearchUTF8 {#ngramsearchutf8}

Предоставляет вариант [ngramSearch](#ngramsearch), где `needle` и `haystack` предполагается закодированными в UTF-8.

**Синтаксис**

```sql
ngramSearchUTF8(haystack, needle)
```

**Параметры**

- `haystack`: Первая строка, закодированная в UTF-8. [Строковый литерал](/sql-reference/syntax#string)
- `needle`: Вторая строка, закодированная в UTF-8. [Строковый литерал](/sql-reference/syntax#string)

**Возвращаемое значение**

- Значение от 0 до 1, представляющее вероятность того, что `needle` находится в `haystack`. [Float32](/sql-reference/data-types/float)

Чем больше результат, тем более вероятно, что `needle` находится в `haystack`.

**Пример**

Запрос:

```sql
SELECT ngramSearchUTF8('абвгдеёжз', 'гдеёзд');
```

Результат:

```response
0.5
```
## ngramSearchCaseInsensitiveUTF8 {#ngramsearchcaseinsensitiveutf8}

Предоставляет вариант без учета регистра для [ngramSearchUTF8](#ngramsearchutf8), в котором предполагается, что `needle` и `haystack`.

**Синтаксис**

```sql
ngramSearchCaseInsensitiveUTF8(haystack, needle)
```

**Параметры**

- `haystack`: Первая строка, закодированная в UTF-8. [Строковый литерал](/sql-reference/syntax#string)
- `needle`: Вторая строка, закодированная в UTF-8. [Строковый литерал](/sql-reference/syntax#string)

**Возвращаемое значение**

- Значение от 0 до 1, представляющее вероятность того, что `needle` находится в `haystack`. [Float32](/sql-reference/data-types/float)

Чем больше результат, тем более вероятно, что `needle` находится в `haystack`.

**Пример**

Запрос:

```sql
SELECT ngramSearchCaseInsensitiveUTF8('абвГДЕёжз', 'АбвгдЕЁжз');
```

Результат:

```response
0.57142854
```
## countSubstrings {#countsubstrings}

Возвращает, сколько раз подстрока `needle` встречается в строке `haystack`.

Функции [`countSubstringsCaseInsensitive`](#countsubstringscaseinsensitive) и [`countSubstringsCaseInsensitiveUTF8`](#countsubstringscaseinsensitiveutf8) предоставляют незамедлительные и незамедлительные + UTF-8 варианты этой функции соответственно.

**Синтаксис**

```sql
countSubstrings(haystack, needle[, start_pos])
```

**Аргументы**

- `haystack` — Строка, в которой выполняется поиск. [Строка](../data-types/string.md) или [Enum](../data-types/enum.md).
- `needle` — Подстрока, которую нужно ищет. [Строка](../data-types/string.md).
- `start_pos` – Позиция (с 1) в `haystack`, с которой начинается поиск. [UInt](../data-types/int-uint.md). Необязательный.

**Возвращаемое значение**

- Количество вхождений. [UInt64](../data-types/int-uint.md).

**Примеры**

```sql
SELECT countSubstrings('aaaa', 'aa');
```

Результат:

```text
┌─countSubstrings('aaaa', 'aa')─┐
│                             2 │
└───────────────────────────────┘
```

Пример с аргументом `start_pos`:

```sql
SELECT countSubstrings('abc___abc', 'abc', 4);
```

Результат:

```text
┌─countSubstrings('abc___abc', 'abc', 4)─┐
│                                      1 │
└────────────────────────────────────────┘
```
## countSubstringsCaseInsensitive {#countsubstringscaseinsensitive}

Возвращает, сколько раз подстрока `needle` встречается в строке `haystack`. Игнорирует регистр.

**Синтаксис**

```sql
countSubstringsCaseInsensitive(haystack, needle[, start_pos])
```

**Аргументы**

- `haystack` — Строка, в которой выполняется поиск. [Строка](../data-types/string.md) или [Enum](../data-types/enum.md).
- `needle` — Подстрока, которую нужно ищет. [Строка](../data-types/string.md).
- `start_pos` – Позиция (с 1) в `haystack`, с которой начинается поиск. [UInt](../data-types/int-uint.md). Необязательный.

**Возвращаемое значение**

- Количество вхождений. [UInt64](../data-types/int-uint.md).

**Примеры**

Запрос:

```sql
SELECT countSubstringsCaseInsensitive('AAAA', 'aa');
```

Результат:

```text
┌─countSubstringsCaseInsensitive('AAAA', 'aa')─┐
│                                            2 │
└──────────────────────────────────────────────┘
```

Пример с аргументом `start_pos`:

Запрос:

```sql
SELECT countSubstringsCaseInsensitive('abc___ABC___abc', 'abc', 4);
```

Результат:

```text
┌─countSubstringsCaseInsensitive('abc___ABC___abc', 'abc', 4)─┐
│                                                           2 │
└─────────────────────────────────────────────────────────────┘
```
## countSubstringsCaseInsensitiveUTF8 {#countsubstringscaseinsensitiveutf8}

Возвращает, сколько раз подстрока `needle` встречается в строке `haystack`. Игнорирует регистр и предполагает, что `haystack` является строкой UTF-8.

**Синтаксис**

```sql
countSubstringsCaseInsensitiveUTF8(haystack, needle[, start_pos])
```

**Аргументы**

- `haystack` — Строка UTF-8, в которой выполняется поиск. [Строка](../data-types/string.md) или [Enum](../data-types/enum.md).
- `needle` — Подстрока, которую нужно ищет. [Строка](../data-types/string.md).
- `start_pos` – Позиция (с 1) в `haystack`, с которой начинается поиск. [UInt](../data-types/int-uint.md). Необязательный.

**Возвращаемое значение**

- Количество вхождений. [UInt64](../data-types/int-uint.md).

**Примеры**

Запрос:

```sql
SELECT countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА');
```

Результат:

```text
┌─countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА')─┐
│                                                                  4 │
└────────────────────────────────────────────────────────────────────┘
```

Пример с аргументом `start_pos`:

Запрос:

```sql
SELECT countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА', 13);
```

Результат:

```text
┌─countSubstringsCaseInsensitiveUTF8('ложка, кошка, картошка', 'КА', 13)─┐
│                                                                      2 │
└────────────────────────────────────────────────────────────────────────┘
```
## countMatches {#countmatches}

Возвращает количество совпадений регулярного выражения для `pattern` в `haystack`.

**Синтаксис**

```sql
countMatches(haystack, pattern)
```

**Аргументы**

- `haystack` — Строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `pattern` — Регулярное выражение с [синтаксисом регулярных выражений re2](https://github.com/google/re2/wiki/Syntax). [Строка](../data-types/string.md).

**Возвращаемое значение**

- Количество совпадений. [UInt64](../data-types/int-uint.md).

**Примеры**

```sql
SELECT countMatches('foobar.com', 'o+');
```

Результат:

```text
┌─countMatches('foobar.com', 'o+')─┐
│                                2 │
└──────────────────────────────────┘
```

```sql
SELECT countMatches('aaaa', 'aa');
```

Результат:

```text
┌─countMatches('aaaa', 'aa')────┐
│                             2 │
└───────────────────────────────┘
```
## countMatchesCaseInsensitive {#countmatchescaseinsensitive}

Возвращает количество совпадений регулярного выражения для шаблона в строке `haystack`, как и [`countMatches`](#countmatches), но сопоставление игнорирует регистр.

**Синтаксис**

```sql
countMatchesCaseInsensitive(haystack, pattern)
```

**Аргументы**

- `haystack` — Строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `pattern` — Регулярное выражение с [синтаксисом регулярных выражений re2](https://github.com/google/re2/wiki/Syntax). [Строка](../data-types/string.md).

**Возвращаемое значение**

- Количество совпадений. [UInt64](../data-types/int-uint.md).

**Примеры**

Запрос:

```sql
SELECT countMatchesCaseInsensitive('AAAA', 'aa');
```

Результат:

```text
┌─countMatchesCaseInsensitive('AAAA', 'aa')────┐
│                                            2 │
└──────────────────────────────────────────────┘
```
## regexpExtract {#regexpextract}

Извлекает первую строку в `haystack`, которая соответствует шаблону регулярного выражения и соответствует индексу группы регулярного выражения.

**Синтаксис**

```sql
regexpExtract(haystack, pattern[, index])
```

Псевдоним: `REGEXP_EXTRACT(haystack, pattern[, index])`.

**Аргументы**

- `haystack` — Строка, в которой будет совпадать шаблон регулярного выражения. [Строка](../data-types/string.md).
- `pattern` — Строка, регулярное выражение, должно быть постоянным. [Строка](../data-types/string.md).
- `index` – Целое число, большее или равное 0 с умолчанием 1. Это представляет, какую группу regex извлечь. [UInt или Int](../data-types/int-uint.md). Необязательный.

**Возвращаемое значение**

`pattern` может содержать несколько групп регулярных выражений, индекс указывает, какую группу регулярного выражения извлечь. Индекс 0 означает совпадение с полным регулярным выражением. [Строка](../data-types/string.md).

**Примеры**

```sql
SELECT
    regexpExtract('100-200', '(\\d+)-(\\d+)', 1),
    regexpExtract('100-200', '(\\d+)-(\\d+)', 2),
    regexpExtract('100-200', '(\\d+)-(\\d+)', 0),
    regexpExtract('100-200', '(\\d+)-(\\d+)');
```

Результат:

```text
┌─regexpExtract('100-200', '(\\d+)-(\\d+)', 1)─┬─regexpExtract('100-200', '(\\d+)-(\\d+)', 2)─┬─regexpExtract('100-200', '(\\d+)-(\\d+)', 0)─┬─regexpExtract('100-200', '(\\d+)-(\\d+)')─┐
│ 100                                          │ 200                                          │ 100-200                                      │ 100                                       │
└──────────────────────────────────────────────┴──────────────────────────────────────────────┴──────────────────────────────────────────────┴───────────────────────────────────────────┘
```
## hasSubsequence {#hassubsequence}

Возвращает 1, если `needle` является подпоследовательностью `haystack`, или 0 в противном случае.
Подпоследовательность строки - это последовательность, которую можно получить из данной строки, удалив ноль или более элементов, не меняя порядок оставшихся элементов.

**Синтаксис**

```sql
hasSubsequence(haystack, needle)
```

**Аргументы**

- `haystack` — Строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `needle` — Подпоследовательность, которую нужно искать. [Строка](../data-types/string.md).

**Возвращаемое значение**

- 1, если `needle` является подпоследовательностью `haystack`, 0 в противном случае. [UInt8](../data-types/int-uint.md).

**Примеры**

Запрос:

```sql
SELECT hasSubsequence('garbage', 'arg');
```

Результат:

```text
┌─hasSubsequence('garbage', 'arg')─┐
│                                1 │
└──────────────────────────────────┘
```
## hasSubsequenceCaseInsensitive {#hassubsequencecaseinsensitive}

Как [hasSubsequence](#hassubsequence), но ищет без учета регистра.

**Синтаксис**

```sql
hasSubsequenceCaseInsensitive(haystack, needle)
```

**Аргументы**

- `haystack` — Строка, в которой выполняется поиск. [Строка](../data-types/string.md).
- `needle` — Подпоследовательность, которую нужно искать. [Строка](../data-types/string.md).

**Возвращаемое значение**

- 1, если `needle` является подпоследовательностью `haystack`, 0 в противном случае. [UInt8](../data-types/int-uint.md).

**Примеры**

Запрос:

```sql
SELECT hasSubsequenceCaseInsensitive('garbage', 'ARG');
```

Результат:

```text
┌─hasSubsequenceCaseInsensitive('garbage', 'ARG')─┐
│                                               1 │
└─────────────────────────────────────────────────┘
```
## hasSubsequenceUTF8 {#hassubsequenceutf8}

Как [hasSubsequence](#hassubsequence), но предполагает, что `haystack` и `needle` являются строками в кодировке UTF-8.

**Синтаксис**

```sql
hasSubsequenceUTF8(haystack, needle)
```

**Аргументы**

- `haystack` — Строка, в которой выполняется поиск. Закодированная в UTF-8 [Строка](../data-types/string.md).
- `needle` — Подпоследовательность, которую нужно искать. Закодированная в UTF-8 [Строка](../data-types/string.md).

**Возвращаемое значение**

- 1, если `needle` является подпоследовательностью `haystack`, 0 в противном случае. [UInt8](../data-types/int-uint.md).

Запрос:

**Примеры**

```sql
select hasSubsequenceUTF8('ClickHouse - столбцовая система управления базами данных', 'система');
```

Результат:

```text
┌─hasSubsequenceUTF8('ClickHouse - столбцовая система управления базами данных', 'система')─┐
│                                                                                         1 │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```
## hasSubsequenceCaseInsensitiveUTF8 {#hassubsequencecaseinsensitiveutf8}

Как [hasSubsequenceUTF8](#hassubsequenceutf8), но ищет без учета регистра.

**Синтаксис**

```sql
hasSubsequenceCaseInsensitiveUTF8(haystack, needle)
```

**Аргументы**

- `haystack` — Строка, в которой выполняется поиск. Закодированная в UTF-8 [Строка](../data-types/string.md).
- `needle` — Подпоследовательность, которую нужно искать. Закодированная в UTF-8 [Строка](../data-types/string.md).

**Возвращаемое значение**

- 1, если `needle` является подпоследовательностью `haystack`, 0 в противном случае. [UInt8](../data-types/int-uint.md).

**Примеры**

Запрос:

```sql
select hasSubsequenceCaseInsensitiveUTF8('ClickHouse - столбцовая система управления базами данных', 'СИСТЕМА');
```

Результат:

```text
┌─hasSubsequenceCaseInsensitiveUTF8('ClickHouse - столбцовая система управления базами данных', 'СИСТЕМА')─┐
│                                                                                                        1 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
## hasToken {#hastoken}

Возвращает 1, если данный токен присутствует в `haystack`, или 0 в противном случае.

**Синтаксис**

```sql
hasToken(haystack, token)
```

**Параметры**

- `haystack`: Строка, в которой выполняется поиск. [Строка](../data-types/string.md) или [Enum](../data-types/enum.md).
- `token`: Подстрока максимальной длины между двумя неалфавитными символами ASCII (или границами `haystack`).

**Возвращаемое значение**

- 1, если токен присутствует в `haystack`, 0 в противном случае. [UInt8](../data-types/int-uint.md).

**Детали реализации**

Токен должен быть постоянной строкой. Поддерживается специализацией индекса tokenbf_v1.

**Пример**

Запрос:

```sql
SELECT hasToken('Hello World','Hello');
```

```response
1
```
## hasTokenOrNull {#hastokenornull}

Возвращает 1, если данный токен присутствует, 0, если не присутствует, и null, если токен имеет некорректный формат.

**Синтаксис**

```sql
hasTokenOrNull(haystack, token)
```

**Параметры**

- `haystack`: Строка, в которой выполняется поиск. [Строка](../data-types/string.md) или [Enum](../data-types/enum.md).
- `token`: Подстрока максимальной длины между двумя неалфавитными символами ASCII (или границами `haystack`).

**Возвращаемое значение**

- 1, если токен присутствует в `haystack`, 0, если он отсутствует, и null, если токен имеет некорректный формат.

**Детали реализации**

Токен должен быть постоянной строкой. Поддерживается специализацией индекса tokenbf_v1.

**Пример**

Где `hasToken` выбросит ошибку для некорректного токена, `hasTokenOrNull` вернет `null` для некорректного токена.

Запрос:

```sql
SELECT hasTokenOrNull('Hello World','Hello,World');
```

```response
null
```
## hasTokenCaseInsensitive {#hastokencaseinsensitive}

Возвращает 1, если данный токен присутствует в `haystack`, 0 в противном случае. Игнорирует регистр.

**Синтаксис**

```sql
hasTokenCaseInsensitive(haystack, token)
```

**Параметры**

- `haystack`: Строка, в которой выполняется поиск. [Строка](../data-types/string.md) или [Enum](../data-types/enum.md).
- `token`: Подстрока максимальной длины между двумя неалфавитными символами ASCII (или границами `haystack`).

**Возвращаемое значение**

- 1, если токен присутствует в `haystack`, 0 в противном случае. [UInt8](../data-types/int-uint.md).

**Детали реализации**

Токен должен быть постоянной строкой. Поддерживается специализацией индекса tokenbf_v1.

**Пример**

Запрос:

```sql
SELECT hasTokenCaseInsensitive('Hello World','hello');
```

```response
1
```
## hasTokenCaseInsensitiveOrNull {#hastokencaseinsensitiveornull}

Возвращает 1, если данный токен присутствует в `haystack`, 0 в противном случае. Игнорирует регистр и возвращает null, если токен имеет некорректный формат.

**Синтаксис**

```sql
hasTokenCaseInsensitiveOrNull(haystack, token)
```

**Параметры**

- `haystack`: Строка, в которой выполняется поиск. [Строка](../data-types/string.md) или [Enum](../data-types/enum.md).
- `token`: Подстрока максимальной длины между двумя неалфавитными символами ASCII (или границами `haystack`).

**Возвращаемое значение**

- 1, если токен присутствует в `haystack`, 0, если токен отсутствует, иначе [`null`](../data-types/nullable.md) если токен имеет некорректный формат. [UInt8](../data-types/int-uint.md).

**Детали реализации**

Токен должен быть постоянной строкой. Поддерживается специализацией индекса tokenbf_v1.

**Пример**

Где `hasTokenCaseInsensitive` выбросит ошибку для некорректного токена, `hasTokenCaseInsensitiveOrNull` вернет `null` для некорректного токена.

Запрос:

```sql
SELECT hasTokenCaseInsensitiveOrNull('Hello World','hello,world');
```

```response
null
```
