---
'description': 'Документация по функциям поиска по строками'
'sidebar_label': 'Поиск по строкам'
'slug': '/sql-reference/functions/string-search-functions'
'title': 'Функции поиска по строкам'
'doc_type': 'reference'
---
# Функции для поиска в строках

Все функции в этом разделе по умолчанию осуществляют регистронезависимый поиск. Регистронезависимый поиск обычно предоставляется отдельными вариантами функций.

:::note
Регистронезависимый поиск следует правилам нижнего и верхнего регистра английского языка. Например, верхний регистр `i` в английском языке это `I`, в то время как в турецком языке это `İ` — результаты для языков, отличных от английского, могут быть непредсказуемыми.
:::

Функции в этом разделе также предполагают, что искомая строка (в этом разделе обозначаемая как `haystack`) и строка поиска (в этом разделе обозначаемая как `needle`) являются текстом с кодировкой в один байт. Если это предположение нарушается, исключение не генерируется, а результаты будут неопределёнными. Поиск с использованием строк, закодированных в UTF-8, обычно предоставляется отдельными вариантами функций. Аналогично, если используется вариант функции UTF-8 и входные строки не являются текстом в кодировке UTF-8, исключение не генерируется и результаты также неопределённые. Обратите внимание, что автоматическая нормализация Unicode не выполняется, однако вы можете использовать функции 
[normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) для этого.

[Общие функции строк](string-functions.md) и [функции для замены в строках](string-replace-functions.md) описаны отдельно.
## position {#position}

Возвращает позицию (в байтах, начиная с 1) подстроки `needle` в строке `haystack`.

**Синтаксис**

```sql
position(haystack, needle[, start_pos])
```

Псевдоним:
- `position(needle IN haystack)`

**Аргументы**

- `haystack` — Строка, в которой выполняется поиск. [String](../data-types/string.md) или [Enum](../data-types/string.md).
- `needle` — Искомая подстрока. [String](../data-types/string.md).
- `start_pos` – Позиция (начиная с 1) в `haystack`, с которой начинается поиск. [UInt](../data-types/int-uint.md). Необязательный.

**Возвращаемое значение**

- Начальная позиция в байтах и счёт с 1, если подстрока была найдена. [UInt64](../data-types/int-uint.md).
- 0, если подстрока не найдена. [UInt64](../data-types/int-uint.md).

Если подстрока `needle` пустая, действуют следующие правила:
- если `start_pos` не был указан: вернуть `1`
- если `start_pos = 0`: вернуть `1`
- если `start_pos >= 1` и `start_pos <= length(haystack) + 1`: вернуть `start_pos`
- в противном случае: вернуть `0`

Те же правила также применимы к функциям `locate`, `positionCaseInsensitive`, `positionUTF8` и `positionCaseInsensitiveUTF8`.

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

Пример для синтаксиса `needle IN haystack`:

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

Как [position](#position), но аргументы `haystack` и `locate` поменяны местами.

Поведение этой функции зависит от версии ClickHouse:
- в версиях < v24.3, `locate` был псевдонимом функции `position` и принимал аргументы `(haystack, needle[, start_pos])`.
- в версиях >= 24.3, `locate` является отдельной функцией (для лучшей совместимости с MySQL) и принимает аргументы `(needle, haystack[, start_pos])`. Предыдущее поведение можно восстановить с помощью настройки [function_locate_has_mysql_compatible_argument_order = false](/operations/settings/settings#function_locate_has_mysql_compatible_argument_order);

**Синтаксис**

```sql
locate(needle, haystack[, start_pos])
```
## positionCaseInsensitive {#positioncaseinsensitive}

Регистронезависимый вариант [position](#position).

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

Как [position](#position), но предполагает, что `haystack` и `needle` являются строками с кодировкой UTF-8.

**Примеры**

Функция `positionUTF8` правильно считает символ `ö` (представленный двумя точками) как единую кодовую точку Unicode:

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

Как [positionUTF8](#positionutf8), но осуществляет регистронезависимый поиск.
## multiSearchAllPositions {#multisearchallpositions}

Как [position](#position), но возвращает массив позиций (в байтах, начиная с 1) для нескольких подстрок `needle` в строке `haystack`.

:::note
Все функции `multiSearch*()` поддерживают не более 2<sup>8</sup> needles.
:::

**Синтаксис**

```sql
multiSearchAllPositions(haystack, [needle1, needle2, ..., needleN])
```

**Аргументы**

- `haystack` — Строка, в которой выполняется поиск. [String](../data-types/string.md).
- `needle` — Искомые подстроки. [Array](../data-types/array.md).

**Возвращаемое значение**

- Массив начальной позиции в байтах и счёт с 1, если подстрока была найдена.
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

- `haystack` — Строка, в которой выполняется поиск. [String](../data-types/string.md).
- `needle` — Искомые подстроки. [Array](../data-types/array.md).

**Возвращаемое значение**

- Массив начальной позиции в байтах и счёт с 1 (если подстрока была найдена).
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

Как [multiSearchAllPositions](#multisearchallpositions), но предполагает, что `haystack` и подстроки `needle` имеют кодировку UTF-8.

**Синтаксис**

```sql
multiSearchAllPositionsUTF8(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — Строка с кодировкой UTF-8, в которой выполняется поиск. [String](../data-types/string.md).
- `needle` — Подстроки с кодировкой UTF-8 для поиска. [Array](../data-types/array.md).

**Возвращаемое значение**

- Массив начальной позиции в байтах и счёт с 1 (если подстрока была найдена).
- 0, если подстрока не найдена.

**Пример**

При задании `ClickHouse` как строки в кодировке UTF-8, найдите позиции `C` (`\x43`) и `H` (`\x48`).

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

- `haystack` — Строка с кодировкой UTF-8, в которой выполняется поиск. [String](../data-types/string.md).
- `needle` — Подстроки с кодировкой UTF-8 для поиска. [Array](../data-types/array.md).

**Возвращаемое значение**

- Массив начальной позиции в байтах и счёт с 1 (если подстрока была найдена).
- 0, если подстрока не найдена.

**Пример**

При задании `ClickHouse` как строки в кодировке UTF-8, найдите позиции `c` (`\x63`) и `h` (`\x68`).

Запрос:

```sql
SELECT multiSearchAllPositionsCaseInsensitiveUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x63','\x68']);
```

Результат:

```response
["1","6"]
```
## multiSearchFirstPosition {#multisearchfirstposition}

Как [`position`](#position), но возвращает левый смещение в строке `haystack`, которое соответствует любой из нескольких строк `needle`.

Функции [`multiSearchFirstPositionCaseInsensitive`](#multisearchfirstpositioncaseinsensitive), [`multiSearchFirstPositionUTF8`](#multisearchfirstpositionutf8) и [`multiSearchFirstPositionCaseInsensitiveUTF8`](#multisearchfirstpositioncaseinsensitiveutf8) предоставляют регистронезависимые и/или UTF-8 варианты этой функции.

**Синтаксис**

```sql
multiSearchFirstPosition(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — Строка, в которой выполняется поиск. [String](../data-types/string.md).
- `needle` — Искомые подстроки. [Array](../data-types/array.md).

**Возвращаемое значение**

- Левый смещение в строке `haystack`, которое соответствует любой из нескольких строк `needle`.
- 0, если совпадений нет.

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

- `haystack` — Строка, в которой выполняется поиск. [String](../data-types/string.md).
- `needle` — Массив подстрок для поиска. [Array](../data-types/array.md).

**Возвращаемое значение**

- Левый смещение в строке `haystack`, которое соответствует любой из нескольких строк `needle`.
- 0, если совпадений нет.

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

Как [`multiSearchFirstPosition`](#multisearchfirstposition), но предполагает, что строки `haystack` и `needle` являются строками в кодировке UTF-8.

**Синтаксис**

```sql
multiSearchFirstPositionUTF8(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — Строка в кодировке UTF-8, в которой выполняется поиск. [String](../data-types/string.md).
- `needle` — Массив подстрок в кодировке UTF-8 для поиска. [Array](../data-types/array.md).

**Возвращаемое значение**

- Левый смещение в строке `haystack`, которое соответствует любой из нескольких строк `needle`.
- 0, если совпадений нет.

**Пример**

Найдите левый смещение в строке UTF-8 `hello world`, которое соответствует любой из данных подстрок.

Запрос:

```sql
SELECT multiSearchFirstPositionUTF8('\x68\x65\x6c\x6c\x6f\x20\x77\x6f\x72\x6c\x64',['wor', 'ld', 'ello']);
```

Результат:

```response
2
```
## multiSearchFirstPositionCaseInsensitiveUTF8 {#multisearchfirstpositioncaseinsensitiveutf8}

Как [`multiSearchFirstPosition`](#multisearchfirstposition), но предполагает, что строки `haystack` и `needle` являются строками в кодировке UTF-8 и игнорирует регистр.

**Синтаксис**

```sql
multiSearchFirstPositionCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — Строка в кодировке UTF-8, в которой выполняется поиск. [String](../data-types/string.md).
- `needle` — Массив подстрок в кодировке UTF-8 для поиска. [Array](../data-types/array.md).

**Возвращаемое значение**

- Левый смещение в строке `haystack`, которое соответствует любой из нескольких строк `needle`, игнорируя регистр.
- 0, если совпадений нет.

**Пример**

Найдите левый смещение в строке UTF-8 `HELLO WORLD`, которое соответствует любой из данных подстрок.

Запрос:

```sql
SELECT multiSearchFirstPositionCaseInsensitiveUTF8('\x48\x45\x4c\x4c\x4f\x20\x57\x4f\x52\x4c\x44',['wor', 'ld', 'ello']);
```

Результат:

```response
2
```
## multiSearchFirstIndex {#multisearchfirstindex}

Возвращает индекс `i` (начиная с 1) самой левой найденной подстроки `needle<sub>i</sub>` в строке `haystack` и 0 в противном случае.

Функции [`multiSearchFirstIndexCaseInsensitive`](#multisearchfirstindexcaseinsensitive), [`multiSearchFirstIndexUTF8`](#multisearchfirstindexutf8) и [`multiSearchFirstIndexCaseInsensitiveUTF8`](#multisearchfirstindexcaseinsensitiveutf8) предоставляют регистронезависимые и/или UTF-8 варианты этой функции.

**Синтаксис**

```sql
multiSearchFirstIndex(haystack, [needle1, needle2, ..., needleN])
```
**Параметры**

- `haystack` — Строка, в которой выполняется поиск. [String](../data-types/string.md).
- `needle` — Искомые подстроки. [Array](../data-types/array.md).

**Возвращаемое значение**

- индекс (начиная с 1) самой левой найденной подстроки. В противном случае 0, если совпадений нет. [UInt8](../data-types/int-uint.md).

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

Возвращает индекс `i` (начиная с 1) самой левой найденной подстроки `needle<sub>i</sub>` в строке `haystack` и 0 в противном случае. Игнорирует регистр.

**Синтаксис**

```sql
multiSearchFirstIndexCaseInsensitive(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — Строка, в которой выполняется поиск. [String](../data-types/string.md).
- `needle` — Искомые подстроки. [Array](../data-types/array.md).

**Возвращаемое значение**

- индекс (начиная с 1) самой левой найденной подстроки. В противном случае 0, если совпадений нет. [UInt8](../data-types/int-uint.md).

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

Возвращает индекс `i` (начиная с 1) самой левой найденной подстроки `needle<sub>i</sub>` в строке `haystack` и 0 в противном случае. Предполагает, что строки `haystack` и `needle` являются строками в кодировке UTF-8.

**Синтаксис**

```sql
multiSearchFirstIndexUTF8(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — Строка в кодировке UTF-8, в которой выполняется поиск. [String](../data-types/string.md).
- `needle` — Массив подстрок в кодировке UTF-8 для поиска. [Array](../data-types/array.md).

**Возвращаемое значение**

- индекс (начиная с 1) самой левой найденной подстроки. В противном случае 0, если совпадений нет. [UInt8](../data-types/int-uint.md).

**Пример**

При задании `Hello World` как строки в кодировке UTF-8, найдите первый индекс строк UTF-8 `Hello` и `World`.

Запрос:

```sql
SELECT multiSearchFirstIndexUTF8('\x48\x65\x6c\x6c\x6f\x20\x57\x6f\x72\x6c\x64',['\x57\x6f\x72\x6c\x64','\x48\x65\x6c\x6c\x6f']);
```

Результат:

```response
1
```
## multiSearchFirstIndexCaseInsensitiveUTF8 {#multisearchfirstindexcaseinsensitiveutf8}

Возвращает индекс `i` (начиная с 1) самой левой найденной подстроки `needle<sub>i</sub>` в строке `haystack` и 0 в противном случае. Предполагает, что строки `haystack` и `needle` являются строками в кодировке UTF-8. Игнорирует регистр.

**Синтаксис**

```sql
multiSearchFirstIndexCaseInsensitiveUTF8(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — Строка в кодировке UTF-8, в которой выполняется поиск. [String](../data-types/string.md).
- `needle` — Массив подстрок в кодировке UTF-8 для поиска. [Array](../data-types/array.md).

**Возвращаемое значение**

- индекс (начиная с 1) самой левой найденной подстроки. В противном случае 0, если совпадений нет. [UInt8](../data-types/int-uint.md).

**Пример**

При задании `HELLO WORLD` как строки в кодировке UTF-8, найдите первый индекс строк UTF-8 `hello` и `world`.

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

Функции [`multiSearchAnyCaseInsensitive`](#multisearchanycaseinsensitive), [`multiSearchAnyUTF8`](#multisearchanyutf8) и [`multiSearchAnyCaseInsensitiveUTF8`](#multisearchanycaseinsensitiveutf8) предоставляют регистронезависимые и/или UTF-8 варианты этой функции.

**Синтаксис**

```sql
multiSearchAny(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — Строка, в которой выполняется поиск. [String](../data-types/string.md).
- `needle` — Искомые подстроки. [Array](../data-types/array.md).

**Возвращаемое значение**

- 1, если было хотя бы одно совпадение.
- 0, если совпадений не было.

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

- `haystack` — Строка, в которой выполняется поиск. [String](../data-types/string.md).
- `needle` — Искомые подстроки. [Array](../data-types/array.md)

**Возвращаемое значение**

- 1, если было хотя бы одно совпадение, игнорируя регистр.
- 0, если совпадений не было.

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

Как [multiSearchAny](#multisearchany), но предполагает, что строки `haystack` и подстроки `needle` находятся в кодировке UTF-8.

**Синтаксис**

```sql
multiSearchAnyUTF8(haystack, [needle1, needle2, ..., needleN])
```

**Параметры**

- `haystack` — Строка в кодировке UTF-8, в которой выполняется поиск. [String](../data-types/string.md).
- `needle` — Подстроки в кодировке UTF-8 для поиска. [Array](../data-types/array.md).

**Возвращаемое значение**

- 1, если было хотя бы одно совпадение.
- 0, если совпадений не было.

**Пример**

При задании `ClickHouse` как строки в кодировке UTF-8, проверьте, присутствуют ли буквы `C` (`\x43`) или `H` (`\x48`) в слове.

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

- `haystack` — Строка в кодировке UTF-8, в которой выполняется поиск. [String](../data-types/string.md).
- `needle` — Подстроки в кодировке UTF-8 для поиска. [Array](../data-types/array.md).

**Возвращаемое значение**

- 1, если было хотя бы одно совпадение, игнорируя регистр.
- 0, если совпадений не было.

**Пример**

При задании `ClickHouse` как строки в кодировке UTF-8, проверьте, присутствует ли буква `h` (`\x68`) в слове, игнорируя регистр.

Запрос:

```sql
SELECT multiSearchAnyCaseInsensitiveUTF8('\x43\x6c\x69\x63\x6b\x48\x6f\x75\x73\x65',['\x68']);
```

Результат:

```response
1
```
## hasAnyTokens {#hasanytokens}

:::note
Эту функцию можно использовать только при включенной настройке [allow_experimental_full_text_index](/operations/settings/settings#allow_experimental_full_text_index).
:::

Возвращает 1, если хотя бы одна строка `needle<sub>i</sub>` соответствует колонке `input`, и 0 в противном случае.

**Синтаксис**

```sql
hasAnyTokens(input, ['needle1', 'needle2', ..., 'needleN'])
```

**Параметры**

- `input` — Входная колонка. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `needles` — Токены для поиска. Поддерживает не более 64 токенов. [Array](../data-types/array.md)([String](../data-types/string.md)).

:::note
Колонка `input` должна иметь [текстовый индекс][../../engines/table-engines/mergetree-family/invertedindexes.md].
:::

Строка `input` токенизируется с помощью токенизатора из определения индекса.

Каждый элемент массива `needle` токен<sub>i</sub> считается единичным токеном, т.е. не подлежит дальнейшей токенизации.
Например, если вы хотите выполнить поиск `ClickHouse` с индексом `tokenizer = ngrams(5)`, при этом предоставив токены: `['Click', 'lickH', 'ickHo', 'ckHou', 'kHous', 'House']`.
Чтобы сгенерировать токены, вы можете использовать функцию [tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens).
Дубликаты токенов игнорируются, например, `['ClickHouse', 'ClickHouse']` — это то же самое, что и `['ClickHouse']`.

**Возвращаемое значение**

- 1, если было хотя бы одно совпадение.
- 0 в противном случае.

**Пример**

Запрос:

```sql
CREATE TABLE table (
    id UInt32,
    msg String,
    INDEX idx(msg) TYPE text(tokenizer = splitByString(['()', '\\'])
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO table VALUES (1, '()a,\\bc()d'), (2, '()\\a()bc\\d'), (3, ',()a\\,bc,(),d,');

SELECT count() FROM table WHERE hasAnyTokens(msg, ['a', 'd']);
```

Результат:

```response
3
```

**Сгенерировать токены с помощью функции `tokens`**

Запрос:

```sql
SELECT count() FROM table WHERE hasAnyTokens(msg, tokens('a()d', 'splitByString', ['()', '\\']));
```

Результат:

```response
3
```
## hasAllTokens {#hasalltokens}

:::note
Эту функцию можно использовать только при включенной настройке [allow_experimental_full_text_index](/operations/settings/settings#allow_experimental_full_text_index).
:::

Как [hasAnyTokens](#hasanytokens), но возвращает 1 только если все строки `needle<sub>i</sub>` соответствуют колонке `input`, и 0 в противном случае.

**Синтаксис**

```sql
hasAllTokens(input, ['needle1', 'needle2', ..., 'needleN'])
```

**Параметры**

- `input` — Входная колонка. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `needles` — Токены для поиска. Поддерживает не более 64 токенов. [Array](../data-types/array.md)([String](../data-types/string.md)).

:::note
Колонка `input` должна иметь [текстовый индекс][../../engines/table-engines/mergetree-family/invertedindexes.md].
:::

Строка `input` токенизируется с помощью токенизатора из определения индекса.

Каждый элемент массива `needle` токен<sub>i</sub> считается единичным токеном, т.е. не подлежит дальнейшей токенизации.
Например, если вы хотите выполнить поиск `ClickHouse` с индексом `tokenizer = ngrams(5)`, при этом предоставив токены: `['Click', 'lickH', 'ickHo', 'ckHou', 'kHous', 'House']`.
Чтобы сгенерировать токены, вы можете использовать функцию [tokens](/sql-reference/functions/splitting-merging-functions.md/#tokens).
Дубликаты токенов игнорируются, например, `['ClickHouse', 'ClickHouse']` — это то же самое, что и `['ClickHouse']`.

**Возвращаемое значение**

- 1, если все токены совпадают.
- 0 в противном случае.

**Пример**

Запрос:

```sql
CREATE TABLE table (
    id UInt32,
    msg String,
    INDEX idx(msg) TYPE text(tokenizer = splitByString(['()', '\\'])
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO table VALUES (1, '()a,\\bc()d'), (2, '()\\a()bc\\d'), (3, ',()a\\,bc,(),d,');

SELECT count() FROM table WHERE hasAllTokens(msg, ['a', 'd']);
```

Результат:

```response
1
```

**Сгенерировать токены с помощью функции `tokens`**

Запрос:

```sql
SELECT count() FROM table WHERE hasAllTokens(msg, tokens('a()d', 'splitByString', ['()', '\\']));
```

Результат:

```response
1
```
## match {#match}

Возвращает, соответствует ли строка `haystack` регулярному выражению `pattern` в [синтаксисе регулярного выражения re2](https://github.com/google/re2/wiki/Syntax).

Совпадение основывается на UTF-8, например, `.` соответствует кодовой точке Unicode `¥`, которая в UTF-8 представляется с помощью двух байт. Регулярное
выражение не должно содержать нулевых байтов. Если строка haystack или шаблон не являются допустимым UTF-8, поведение будет неопределенным.

В отличие от стандартного поведения re2, `.` соответствует разрывам строк. Чтобы отключить это, предварите шаблон с помощью `(?-s)`.

Если вы хотите просто искать подстроки в строке, вы можете использовать функции [like](#like) или [position](#position) вместо этого — они работают гораздо быстрее, чем эта функция.

**Синтаксис**

```sql
match(haystack, pattern)
```

Псевдоним: `haystack REGEXP pattern operator`
## multiMatchAny {#multimatchany}

Как `match`, но возвращает 1, если хотя бы один из шаблонов совпадает, и 0 в противном случае.

:::note
Функции из семейства `multi[Fuzzy]Match*()` используют библиотеку (Vectorscan)[https://github.com/VectorCamp/vectorscan]. Таким образом, они включены только если ClickHouse скомпилирован с поддержкой vectorscan.

Чтобы отключить все функции, использующие hyperscan, используйте настройку `SET allow_hyperscan = 0;`.

Из-за ограничений vectorscan длина строки `haystack` должна быть меньше 2<sup>32</sup> байт.

Hyperscan в целом уязвим для атак отказа в обслуживании с использованием регулярных выражений (ReDoS) (например, см. 
(здесь)[https://www.usenix.org/conference/usenixsecurity22/presentation/turonova], (здесь)[https://doi.org/10.1007/s10664-021-10033-1] и
(здесь)[https://doi.org/10.1145/3236024.3236027]. Пользователи должны тщательно проверять предоставленные шаблоны.
:::

Если вы хотите просто искать несколько подстрок в строке, вы можете использовать функцию [multiSearchAny](#multisearchany) вместо этого — она работает гораздо быстрее, чем эта функция.

**Синтаксис**

```sql
multiMatchAny(haystack, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiMatchAnyIndex {#multimatchanyindex}

Как `multiMatchAny`, но возвращает любой индекс, который соответствует haystack.

**Синтаксис**

```sql
multiMatchAnyIndex(haystack, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiMatchAllIndices {#multimatchallindices}

Как `multiMatchAny`, но возвращает массив всех индексов, которые соответствуют haystack в любом порядке.

**Синтаксис**

```sql
multiMatchAllIndices(haystack, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiFuzzyMatchAny {#multifuzzymatchany}

Как `multiMatchAny`, но возвращает 1, если любой шаблон соответствует haystack в пределах постоянной [редакционной дистанции](https://en.wikipedia.org/wiki/Edit_distance). Эта функция полагается на экспериментальную функцию библиотеки [hyperscan](https://intel.github.io/hyperscan/dev-reference/compilation.html#approximate-matching) и может быть медленной для некоторых крайних случаев. Производительность зависит от значения расстояния редактирования и используемых шаблонов, но она всегда более затратна по сравнению с не-нечеткими вариантами.

:::note
Функции `multiFuzzyMatch*()` не поддерживают регулярные выражения UTF-8 (они обрабатываются как последовательность байтов) из-за ограничений hyperscan.
:::

**Синтаксис**

```sql
multiFuzzyMatchAny(haystack, distance, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiFuzzyMatchAnyIndex {#multifuzzymatchanyindex}

Как `multiFuzzyMatchAny`, но возвращает любой индекс, который соответствует haystack в пределах постоянной редакционной дистанции.

**Синтаксис**

```sql
multiFuzzyMatchAnyIndex(haystack, distance, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## multiFuzzyMatchAllIndices {#multifuzzymatchallindices}

Как `multiFuzzyMatchAny`, но возвращает массив всех индексов в любом порядке, которые соответствуют haystack в пределах постоянной редакционной дистанции.

**Синтаксис**

```sql
multiFuzzyMatchAllIndices(haystack, distance, \[pattern<sub>1</sub>, pattern<sub>2</sub>, ..., pattern<sub>n</sub>\])
```
## extract {#extract}

Возвращает первое совпадение регулярного выражения в строке.
Если `haystack` не соответствует `pattern`, возвращается пустая строка. 

Если регулярное выражение имеет захватывающие группы, функция сопоставляет входную строку с первой захватывающей группой.

**Синтаксис**

```sql
extract(haystack, pattern)
```

*Аргументы**

- `haystack` — Входная строка. [String](../data-types/string.md).
- `pattern` — Регулярное выражение с [синтаксисом регулярного выражения re2](https://github.com/google/re2/wiki/Syntax).

**Возвращаемое значение**

- Первое совпадение регулярного выражения в строке haystack. [String](../data-types/string.md).

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

Возвращает массив всех совпадений регулярного выражения в строке. Если `haystack` не соответствует `pattern`, возвращается пустая строка.

Поведение по отношению к подшаблонам такое же, как и в функции [`extract`](#extract).

**Синтаксис**

```sql
extractAll(haystack, pattern)
```

*Аргументы**

- `haystack` — Входная строка. [String](../data-types/string.md).
- `pattern` — Регулярное выражение с [синтаксисом регулярного выражения re2](https://github.com/google/re2/wiki/Syntax).

**Возвращаемое значение**

- Массив совпадений регулярного выражения в строке haystack. [Array](../data-types/array.md)([String](../data-types/string.md)).

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

Сопоставляет все группы строки `haystack` с помощью регулярного выражения `pattern`. Возвращает массив массивов, где первый массив включает все фрагменты, соответствующие первой группе, второй массив — соответствующие второй группе и т.д.

Эта функция медленнее, чем [extractAllGroupsVertical](#extractallgroupsvertical).

**Синтаксис**

```sql
extractAllGroupsHorizontal(haystack, pattern)
```

**Аргументы**

- `haystack` — Входная строка. [String](../data-types/string.md).
- `pattern` — Регулярное выражение с [синтаксисом регулярного выражения re2](https://github.com/google/re2/wiki/Syntax). Должно содержать группы, каждая группа заключена в скобки. Если `pattern` не содержит групп, будет выброшено исключение. [String](../data-types/string.md).

**Возвращаемое значение**

- Массив массивов совпадений. [Array](../data-types/array.md).

:::note
Если `haystack` не соответствует `pattern`, возвращается массив пустых массивов.
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

Сопоставляет все группы заданной входной строки с заданным регулярным выражением, возвращает массив массивов совпадений.

**Синтаксис**

```sql
extractGroups(haystack, pattern)
```

**Аргументы**

- `haystack` — Входная строка. [String](../data-types/string.md).
- `pattern` — Регулярное выражение с [синтаксисом регулярного выражения re2](https://github.com/google/re2/wiki/Syntax). Должно содержать группы, каждая группа заключена в скобки. Если `pattern` не содержит групп, будет выброшено исключение. [String](../data-types/string.md).

**Возвращаемое значение**

- Массив массивов совпадений. [Array](../data-types/array.md).

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

Сопоставляет все группы строки `haystack` с помощью регулярного выражения `pattern`. Возвращает массив массивов, где каждый массив включает соответствующие фрагменты из каждой группы. Фрагменты сгруппированы в порядке появления в `haystack`.

**Синтаксис**

```sql
extractAllGroupsVertical(haystack, pattern)
```

**Аргументы**

- `haystack` — Входная строка. [String](../data-types/string.md).
- `pattern` — Регулярное выражение с [синтаксисом регулярного выражения re2](https://github.com/google/re2/wiki/Syntax). Должно содержать группы, каждая группа заключена в скобки. Если `pattern` не содержит групп, будет выброшено исключение. [String](../data-types/string.md).

**Возвращаемое значение**

- Массив массивов совпадений. [Array](../data-types/array.md).

:::note
Если `haystack` не соответствует `pattern`, возвращается пустой массив.
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

Возвращает, соответствует ли строка `haystack` выражению LIKE `pattern`.

Выражение LIKE может содержать обычные символы и следующие метасимволы:

- `%` указывает на произвольное количество произвольных символов (включая ноль символов).
- `_` указывает на один произвольный символ.
- `\` предназначен для экранирования литералов `%`, `_` и `\`.

Совпадение основывается на UTF-8, например, `_` соответствует кодовой точке Unicode `¥`, которая в UTF-8 представляется с помощью двух байт.

Если строка haystack или выражение LIKE не являются допустимым UTF-8, поведение будет неопределённым.

Автоматическая нормализация Unicode не выполняется, вы можете использовать функции [normalizeUTF8*()](https://clickhouse.com../functions/string-functions/) для этого.

Чтобы сопоставить с литератом `%`, `_` и `\` (которые являются мета-символами LIKE), предваряйте их обратной косой чертой: `\%`, `\_` и `\\`.
Обратная косая черта теряет своё специальное значение (т.е. интерпретируется буквально), если она предшествует символу, отличному от `%`, `_` или `\`.
Обратите внимание, что ClickHouse требует, чтобы обратные косые черты в строках также [были экранированы](../syntax.md#string), поэтому на самом деле вам нужно записывать `\\%`, `\\_` и `\\\\`.

Для выражений LIKE вида `%needle%` функция работает так же быстро, как функция `position`.
Все остальные выражения LIKE внутренне конвертируются в регулярное выражение и выполняются с производительностью, аналогичной функции `match`.

**Синтаксис**

```sql
like(haystack, pattern)
```

Псевдоним: `haystack LIKE pattern` (оператор)
## notLike {#notlike}

Как `like`, но отрицает результат.

Псевдоним: `haystack NOT LIKE pattern` (оператор)
## ilike {#ilike}

Как `like`, но осуществляет регистронезависимый поиск.

Псевдоним: `haystack ILIKE pattern` (оператор)
## notILike {#notilike}

Как `ilike`, но отрицает результат.

Псевдоним: `haystack NOT ILIKE pattern` (оператор)
## ngramDistance {#ngramdistance}

Вычисляет расстояние 4-грамм между строкой `haystack` и строкой `needle`. Для этого он подсчитывает симметричную разницу между двумя многоместами 4-грамм и нормализует её по сумму их кардинальностей. Возвращает значение [Float32](/sql-reference/data-types/float) от 0 до 1. Чем меньше результат, тем более похожи строки друг на друга.

Функции [`ngramDistanceCaseInsensitive`](#ngramdistancecaseinsensitive), [`ngramDistanceUTF8`](#ngramdistanceutf8), [`ngramDistanceCaseInsensitiveUTF8`](#ngramdistancecaseinsensitiveutf8) предоставляют регистронезависимый и/или UTF-8 варианты этой функции.

**Синтаксис**

```sql
ngramDistance(haystack, needle)
```

**Параметры**

- `haystack`: Первая сравниваемая строка. [String literal](/sql-reference/syntax#string)
- `needle`: Вторая сравниваемая строка. [String literal](/sql-reference/syntax#string)

**Возвращаемое значение**

- Значение от 0 до 1, представляющее степень схожести между двумя строками. [Float32](/sql-reference/data-types/float)

**Технические детали реализации**

Эта функция выбросит исключение, если постоянные аргументы `needle` или `haystack` превышают 32 Кб по размеру. Если любые непостоянные аргументы `haystack` или `needle` превышают 32 Кб по размеру, то расстояние всегда будет равным 1.

**Примеры**

Чем более похожи две строки друг на друга, тем ближе результат будет к 0 (идентичны).

Запрос:

```sql
SELECT ngramDistance('ClickHouse','ClickHouse!');
```

Результат:

```response
0.06666667
```

Чем менее похожи две строки, тем больше результат.
Запрос:

```sql
SELECT ngramDistance('ClickHouse','House');
```

Результат:

```response
0.5555556
```
## ngramDistanceCaseInsensitive {#ngramdistancecaseinsensitive}

Предоставляет регистронезависимый вариант [ngramDistance](#ngramdistance).

**Синтаксис**

```sql
ngramDistanceCaseInsensitive(haystack, needle)
```

**Параметры**

- `haystack`: Первая сравниваемая строка. [String literal](/sql-reference/syntax#string)
- `needle`: Вторая сравниваемая строка. [String literal](/sql-reference/syntax#string)

**Возвращаемое значение**

- Значение от 0 до 1, представляющее степень схожести между двумя строками. [Float32](/sql-reference/data-types/float)

**Примеры**

С помощью [ngramDistance](#ngramdistance) различия в регистре повлияют на значение схожести:

Запрос:

```sql
SELECT ngramDistance('ClickHouse','clickhouse');
```

Результат:

```response
0.71428573
```

С помощью [ngramDistanceCaseInsensitive](#ngramdistancecaseinsensitive) регистр игнорируется, поэтому две идентичные строки, различающиеся только регистром, теперь будут возвращать низкое значение схожести:

Запрос:

```sql
SELECT ngramDistanceCaseInsensitive('ClickHouse','clickhouse');
```

Результат:

```response
0
```
## ngramDistanceUTF8 {#ngramdistanceutf8}

Предоставляет вариант на UTF-8 для [ngramDistance](#ngramdistance). Предполагает, что строки `needle` и `haystack` закодированы в UTF-8.

**Синтаксис**

```sql
ngramDistanceUTF8(haystack, needle)
```

**Параметры**

- `haystack`: Первая строка для сравнения, закодированная в UTF-8. [Строковый литерал](/sql-reference/syntax#string)
- `needle`: Вторая строка для сравнения, закодированная в UTF-8. [Строковый литерал](/sql-reference/syntax#string)

**Возвращаемое значение**

- Значение от 0 до 1, представляющее схожесть между двумя строками. [Float32](/sql-reference/data-types/float)

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

- `haystack`: Первая строка для сравнения, закодированная в UTF-8. [Строковый литерал](/sql-reference/syntax#string)
- `needle`: Вторая строка для сравнения, закодированная в UTF-8. [Строковый литерал](/sql-reference/syntax#string)

**Возвращаемое значение**

- Значение от 0 до 1, представляющее схожесть между двумя строками. [Float32](/sql-reference/data-types/float)

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

Как `ngramDistance`, но вычисляет нессимметричную разницу между строкой `needle` и строкой `haystack`, т.е. количество n-грамм из needle минус общее количество n-грамм, нормализованное по количеству n-грамм `needle`. Возвращает [Float32](/sql-reference/data-types/float) от 0 до 1. Чем больше результат, тем вероятнее, что `needle` содержится в `haystack`. Эта функция полезна для нечеткого поиска строк. Также смотрите функцию [`soundex`](../../sql-reference/functions/string-functions#soundex).

Функции [`ngramSearchCaseInsensitive`](#ngramsearchcaseinsensitive), [`ngramSearchUTF8`](#ngramsearchutf8), [`ngramSearchCaseInsensitiveUTF8`](#ngramsearchcaseinsensitiveutf8) предоставляют варианты без учета регистра и/или UTF-8 этой функции.

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
UTF-8 варианты используют 3-граммное расстояние. Эти расстояния n-грамм не идеально справедливы. Мы используем 2-байтовые хэши для хэширования n-грамм, а затем вычисляем (не-)симметрическую разницу между этими хэш-таблицами — возможны совпадения. В формате UTF-8 без учета регистра мы не используем справедливую функцию `tolower` — мы обнуляем 5-й бит (с начала) каждого байта кода и первый бит нулевого байта, если байтов больше одного — это работает для латиницы и в основном для всех кириллических букв.
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

Чем больше результат, тем вероятнее, что `needle` содержится в `haystack`.

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

Предоставляет вариант на UTF-8 для [ngramSearch](#ngramsearch), в котором предполагается, что `needle` и `haystack` закодированы в UTF-8.

**Синтаксис**

```sql
ngramSearchUTF8(haystack, needle)
```

**Параметры**

- `haystack`: Первая строка для сравнения, закодированная в UTF-8. [Строковый литерал](/sql-reference/syntax#string)
- `needle`: Вторая строка для сравнения, закодированная в UTF-8. [Строковый литерал](/sql-reference/syntax#string)

**Возвращаемое значение**

- Значение от 0 до 1, представляющее вероятность того, что `needle` находится в `haystack`. [Float32](/sql-reference/data-types/float)

Чем больше результат, тем вероятнее, что `needle` содержится в `haystack`.

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

Предоставляет вариант без учета регистра для [ngramSearchUTF8](#ngramsearchutf8), в котором `needle` и `haystack`.

**Синтаксис**

```sql
ngramSearchCaseInsensitiveUTF8(haystack, needle)
```

**Параметры**

- `haystack`: Первая строка для сравнения, закодированная в UTF-8. [Строковый литерал](/sql-reference/syntax#string)
- `needle`: Вторая строка для сравнения, закодированная в UTF-8. [Строковый литерал](/sql-reference/syntax#string)

**Возвращаемое значение**

- Значение от 0 до 1, представляющее вероятность того, что `needle` находится в `haystack`. [Float32](/sql-reference/data-types/float)

Чем больше результат, тем вероятнее, что `needle` содержится в `haystack`.

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

Возвращает, как часто подстрока `needle` встречается в строке `haystack`.

Функции [`countSubstringsCaseInsensitive`](#countsubstringscaseinsensitive) и [`countSubstringsCaseInsensitiveUTF8`](#countsubstringscaseinsensitiveutf8) предоставляют варианты без учета регистра и без учета регистра + UTF-8 этой функции соответственно.

**Синтаксис**

```sql
countSubstrings(haystack, needle[, start_pos])
```

**Аргументы**

- `haystack` — Строка, в которой выполняется поиск. [Строка](../data-types/string.md) или [Enum](../data-types/enum.md).
- `needle` — Подстрока для поиска. [Строка](../data-types/string.md).
- `start_pos` – Позиция (1-индексированная) в `haystack`, с которой начинается поиск. [UInt](../data-types/int-uint.md). Необязательный.

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

Возвращает, как часто подстрока `needle` встречается в строке `haystack`. Игнорирует регистр.

**Синтаксис**

```sql
countSubstringsCaseInsensitive(haystack, needle[, start_pos])
```

**Аргументы**

- `haystack` — Строка, в которой выполняется поиск. [Строка](../data-types/string.md) или [Enum](../data-types/enum.md).
- `needle` — Подстрока для поиска. [Строка](../data-types/string.md).
- `start_pos` – Позиция (1-индексированная) в `haystack`, с которой начинается поиск. [UInt](../data-types/int-uint.md). Необязательный.

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

Возвращает, как часто подстрока `needle` встречается в строке `haystack`. Игнорирует регистр и предполагает, что `haystack` является строкой UTF-8.

**Синтаксис**

```sql
countSubstringsCaseInsensitiveUTF8(haystack, needle[, start_pos])
```

**Аргументы**

- `haystack` — Строка UTF-8, в которой выполняется поиск. [Строка](../data-types/string.md) или [Enum](../data-types/enum.md).
- `needle` — Подстрока для поиска. [Строка](../data-types/string.md).
- `start_pos` – Позиция (1-индексированная) в `haystack`, с которой начинается поиск. [UInt](../data-types/int-uint.md). Необязательный.

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

Поведение этой функции зависит от версии ClickHouse:
- в версиях < v25.6 `countMatches` прекратит подсчет при первом пустом совпадении, даже если шаблон принимает.
- в версиях >= 25.6 `countMatches` продолжит выполнение при возникновении пустого совпадения.
  Унаследованное поведение можно восстановить, используя настройку [count_matches_stop_at_empty_match = true](/operations/settings/settings#count_matches_stop_at_empty_match);

**Синтаксис**

```sql
countMatches(haystack, pattern)
```

**Аргументы**

- `haystack` — Строка, в которой ведется поиск. [Строка](../data-types/string.md).
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

Возвращает количество совпадений регулярного выражения для шаблона в haystack, похожий на [`countMatches`](#countmatches), но с игнорированием регистра.

**Синтаксис**

```sql
countMatchesCaseInsensitive(haystack, pattern)
```

**Аргументы**

- `haystack` — Строка, в которой ведется поиск. [Строка](../data-types/string.md).
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

- `haystack` — Строка, в которой будет соответствовать регулярному выражению. [Строка](../data-types/string.md).
- `pattern` — Строка, регулярное выражение, должно быть константой. [Строка](../data-types/string.md).
- `index` – Целое число больше или равное 0, по умолчанию 1. Оно представляет, какую группу регулярного выражения нужно извлечь. [UInt или Int](../data-types/int-uint.md). Необязательный.

**Возвращаемое значение**

`pattern` может содержать несколько групп регулярных выражений, `index` указывает, какую группу регулярного выражения нужно извлечь. Индекс 0 означает совпадение с целым регулярным выражением. [Строка](../data-types/string.md).

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
Подпоследовательность строки - это последовательность, которая может быть получена из данной строки, удаляя ноль или более элементов, не меняя порядок оставшихся элементов.
**Синтаксис**

```sql
hasSubsequence(haystack, needle)
```

**Аргументы**

- `haystack` — Строка, в которой ведется поиск. [Строка](../data-types/string.md).
- `needle` — Подпоследовательность для поиска. [Строка](../data-types/string.md).

**Возвращаемое значение**

- 1, если needle является подпоследовательностью haystack, и 0 в противном случае. [UInt8](../data-types/int-uint.md).

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

Как [hasSubsequence](#hassubsequence), но выполняет поиск без учета регистра.

**Синтаксис**

```sql
hasSubsequenceCaseInsensitive(haystack, needle)
```

**Аргументы**

- `haystack` — Строка, в которой ведется поиск. [Строка](../data-types/string.md).
- `needle` — Подпоследовательность для поиска. [Строка](../data-types/string.md).

**Возвращаемое значение**

- 1, если needle является подпоследовательностью haystack, и 0 в противном случае. [UInt8](../data-types/int-uint.md).

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

Как [hasSubsequence](#hassubsequence), но предполагает, что `haystack` и `needle` являются строками, закодированными в UTF-8.

**Синтаксис**

```sql
hasSubsequenceUTF8(haystack, needle)
```

**Аргументы**

- `haystack` — Строка, в которой ведется поиск. Закодированная в UTF-8 [Строка](../data-types/string.md).
- `needle` — Подпоследовательность для поиска. Закодированная в UTF-8 [Строка](../data-types/string.md).

**Возвращаемое значение**

- 1, если needle является подпоследовательностью haystack, и 0 в противном случае. [UInt8](../data-types/int-uint.md).

Запрос:

**Примеры**

```sql
SELECT hasSubsequenceUTF8('ClickHouse - столбцовая система управления базами данных', 'система');
```

Результат:

```text
┌─hasSubsequenceUTF8('ClickHouse - столбцовая система управления базами данных', 'система')─┐
│                                                                                         1 │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

## hasSubsequenceCaseInsensitiveUTF8 {#hassubsequencecaseinsensitiveutf8}

Как [hasSubsequenceUTF8](#hassubsequenceutf8), но выполняет поиск без учета регистра.

**Синтаксис**

```sql
hasSubsequenceCaseInsensitiveUTF8(haystack, needle)
```

**Аргументы**

- `haystack` — Строка, в которой ведется поиск. Закодированная в UTF-8 [Строка](../data-types/string.md).
- `needle` — Подпоследовательность для поиска. Закодированная в UTF-8 [Строка](../data-types/string.md).

**Возвращаемое значение**

- 1, если needle является подпоследовательностью haystack, и 0 в противном случае. [UInt8](../data-types/int-uint.md).

**Примеры**

Запрос:

```sql
SELECT hasSubsequenceCaseInsensitiveUTF8('ClickHouse - столбцовая система управления базами данных', 'СИСТЕМА');
```

Результат:

```text
┌─hasSubsequenceCaseInsensitiveUTF8('ClickHouse - столбцовая система управления базами данных', 'СИСТЕМА')─┐
│                                                                                                        1 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## hasToken {#hastoken}

Возвращает 1, если данный токен присутствует в haystack, или 0 в противном случае.

**Синтаксис**

```sql
hasToken(haystack, token)
```

**Параметры**

- `haystack`: Строка, в которой ведется поиск. [Строка](../data-types/string.md) или [Enum](../data-types/enum.md).
- `token`: Подстрока максимальной длины между двумя не алфавитными ASCII-символами (или границами haystack).

**Возвращаемое значение**

- 1, если токен присутствует в haystack, и 0 в противном случае. [UInt8](../data-types/int-uint.md).

**Детали реализации**

Токен должен быть константной строкой. Поддерживается специализированным индексом tokenbf_v1.

**Пример**

Запрос:

```sql
SELECT hasToken('Hello World','Hello');
```

```response
1
```

## hasTokenOrNull {#hastokenornull}

Возвращает 1, если данный токен присутствует, 0 если отсутствует и null, если токен некорректный.

**Синтаксис**

```sql
hasTokenOrNull(haystack, token)
```

**Параметры**

- `haystack`: Строка, в которой ведется поиск. [Строка](../data-types/string.md) или [Enum](../data-types/enum.md).
- `token`: Подстрока максимальной длины между двумя не алфавитными ASCII-символами (или границами haystack).

**Возвращаемое значение**

- 1, если токен присутствует в haystack, 0 если он отсутствует и null, если токен некорректный.

**Детали реализации**

Токен должен быть константной строкой. Поддерживается специализированным индексом tokenbf_v1.

**Пример**

Где `hasToken` вызовет ошибку для некорректного токена, `hasTokenOrNull` вернет `null` для некорректного токена.

Запрос:

```sql
SELECT hasTokenOrNull('Hello World','Hello,World');
```

```response
null
```

## hasTokenCaseInsensitive {#hastokencaseinsensitive}

Возвращает 1, если данный токен присутствует в haystack, 0 в противном случае. Игнорирует регистр.

**Синтаксис**

```sql
hasTokenCaseInsensitive(haystack, token)
```

**Параметры**

- `haystack`: Строка, в которой ведется поиск. [Строка](../data-types/string.md) или [Enum](../data-types/enum.md).
- `token`: Подстрока максимальной длины между двумя не алфавитными ASCII-символами (или границами haystack).

**Возвращаемое значение**

- 1, если токен присутствует в haystack, 0 в противном случае. [UInt8](../data-types/int-uint.md).

**Детали реализации**

Токен должен быть константной строкой. Поддерживается специализированным индексом tokenbf_v1.

**Пример**

Запрос:

```sql
SELECT hasTokenCaseInsensitive('Hello World','hello');
```

```response
1
```

## hasTokenCaseInsensitiveOrNull {#hastokencaseinsensitiveornull}

Возвращает 1, если данный токен присутствует в haystack, 0 в противном случае. Игнорирует регистр и возвращает null, если токен некорректный.

**Синтаксис**

```sql
hasTokenCaseInsensitiveOrNull(haystack, token)
```

**Параметры**

- `haystack`: Строка, в которой ведется поиск. [Строка](../data-types/string.md) или [Enum](../data-types/enum.md).
- `token`: Подстрока максимальной длины между двумя не алфавитными ASCII-символами (или границами haystack).

**Возвращаемое значение**

- 1, если токен присутствует в haystack, 0 если токен отсутствует, иначе [`null`](../data-types/nullable.md), если токен некорректный. [UInt8](../data-types/int-uint.md).

**Детали реализации**

Токен должен быть константной строкой. Поддерживается специализированным индексом tokenbf_v1.

**Пример**
Где `hasTokenCaseInsensitive` вызовет ошибку для некорректного токена, `hasTokenCaseInsensitiveOrNull` вернет `null` для некорректного токена.

Запрос:

```sql
SELECT hasTokenCaseInsensitiveOrNull('Hello World','hello,world');
```

```response
null
```

<!-- 
Содержимое тегов ниже заменяется при сборке документации 
документами, сгенерированными из system.functions. Пожалуйста, не изменяйте и не удаляйте эти теги.
См.: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->