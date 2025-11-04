---
slug: '/sql-reference/functions/uuid-functions'
sidebar_label: UUID
description: 'Документация по функциям для работы с UUID'
title: 'Функции работы с UUID'
doc_type: reference
---
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# Функции для работы с UUID

## Генерация UUIDv7 {#uuidv7-generation}

Сгенерированный UUID содержит 48-битный временной штамп в миллисекундах Unix, за которым следует версия "7" (4 бита), счетчик (42 бита) для различения UUID в пределах миллисекунды (включая поле варианта "2", 2 бита) и случайное поле (32 бита).
Для данного временного штампа (`unix_ts_ms`) счетчик начинается с случайного значения и увеличивается на 1 для каждого нового UUID до изменения временного штампа. В случае переполнения счетчика поле временного штампа увеличивается на 1, и счетчик сбрасывается на случайное новое начальное значение.
Функции генерации UUID гарантируют, что поле счетчика в пределах временного штампа монотонно увеличивается во всех вызовах функций в параллельно работающих потоках и запросах.

```text
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|                           unix_ts_ms                          |
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|          unix_ts_ms           |  ver  |   counter_high_bits   |
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|var|                   counter_low_bits                        |
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|                            rand_b                             |
└─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘
```

## Генерация Snowflake ID {#snowflake-id-generation}

Сгенерированный Snowflake ID содержит текущий временной штамп Unix в миллисекундах (41 + 1 старший нулевой бит), за которым следует id машины (10 бит) и счетчик (12 бит) для различения ID в пределах миллисекунды. Для данного временного штампа (`unix_ts_ms`) счетчик начинается с 0 и увеличивается на 1 для каждого нового Snowflake ID до изменения временного штампа. В случае переполнения счетчика поле временного штампа увеличивается на 1, и счетчик сбрасывается на 0.

:::note
Сгенерированные Snowflake ID базируются на эпохе UNIX 1970-01-01. Хотя стандарт или рекомендация для эпохи Snowflake ID не существует, реализации в других системах могут использовать другую эпоху, например, Twitter/X (2010-11-04) или Mastodon (2015-01-01).
:::

```text
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|0|                         timestamp                           |
├─┼                 ┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|                   |     machine_id    |    machine_seq_num    |
└─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘
```

## generateUUIDv4 {#generateuuidv4}

Генерирует [версии 4](https://tools.ietf.org/html/rfc4122#section-4.4) [UUID](../data-types/uuid.md).

**Синтаксис**

```sql
generateUUIDv4([expr])
```

**Аргументы**

- `expr` — Произвольное [выражение](/sql-reference/syntax#expressions), используемое для обхода [удаления общих подвыражений](/sql-reference/functions/overview#common-subexpression-elimination), если функция вызывается несколько раз в запросе. Значение выражения не влияет на возвращаемый UUID. Необязательно.

**Возвращаемое значение**

Значение типа UUIDv4.

**Пример**

Сначала создайте таблицу с колонкой типа UUID, затем вставьте сгенерированный UUIDv4 в таблицу.

```sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;

INSERT INTO tab SELECT generateUUIDv4();

SELECT * FROM tab;
```

Результат:

```response
┌─────────────────────────────────uuid─┐
│ f4bf890f-f9dc-4332-ad5c-0c18e73f28e9 │
└──────────────────────────────────────┘
```

**Пример с несколькими UUID, сгенерированными на строку**

```sql
SELECT generateUUIDv4(1), generateUUIDv4(2);

┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 8abf8c13-7dea-4fdf-af3e-0e18767770e6 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## generateUUIDv7 {#generateUUIDv7}

Генерирует [версии 7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04) [UUID](../data-types/uuid.md).

Смотрите раздел ["Генерация UUIDv7"](#uuidv7-generation) для получения подробной информации о структуре UUID, управлении счетчиком и гарантиях производительности.
 
:::note
По состоянию на апрель 2024 года UUID версии 7 находятся в статусе черновика, и их структура может измениться в будущем.
:::

**Синтаксис**

```sql
generateUUIDv7([expr])
```

**Аргументы**

- `expr` — Произвольное [выражение](/sql-reference/syntax#expressions), используемое для обхода [удаления общих подвыражений](/sql-reference/functions/overview#common-subexpression-elimination), если функция вызывается несколько раз в запросе. Значение выражения не влияет на возвращаемый UUID. Необязательно.

**Возвращаемое значение**

Значение типа UUIDv7.

**Пример**

Сначала создайте таблицу с колонкой типа UUID, затем вставьте сгенерированный UUIDv7 в таблицу.

```sql
CREATE TABLE tab (uuid UUID) ENGINE = Memory;

INSERT INTO tab SELECT generateUUIDv7();

SELECT * FROM tab;
```

Результат:

```response
┌─────────────────────────────────uuid─┐
│ 018f05af-f4a8-778f-beee-1bedbc95c93b │
└──────────────────────────────────────┘
```

**Пример с несколькими UUID, сгенерированными на строку**

```sql
SELECT generateUUIDv7(1), generateUUIDv7(2);

┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(2)────────────────────┐
│ 018f05c9-4ab8-7b86-b64e-c9f03fbd45d1 │ 018f05c9-4ab8-7b86-b64e-c9f12efb7e16 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## dateTimeToUUIDv7 {#datetimetouuidv7}

Преобразует значение [DateTime](../data-types/datetime.md) в [UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7) в указанное время.

Смотрите раздел ["Генерация UUIDv7"](#uuidv7-generation) для получения подробной информации о структуре UUID, управлении счетчиком и гарантиях производительности.

:::note
По состоянию на апрель 2024 года UUID версии 7 находятся в статусе черновика, и их структура может измениться в будущем.
:::

**Синтаксис**

```sql
dateTimeToUUIDv7(value)
```

**Аргументы**

- `value` — Дата с временем. [DateTime](../data-types/datetime.md).

**Возвращаемое значение**

Значение типа UUIDv7.

**Пример**

```sql
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'));
```

Результат:

```response
┌─dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'))─┐
│ 018f05af-f4a8-778f-beee-1bedbc95c93b                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Пример с несколькими UUID для одного и того же временного штампа**

```sql
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56'));
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56'));
```

**Результат**

```response
   ┌─dateTimeToUUIDv7(t⋯08-15 18:57:56'))─┐
1. │ 017b4b2d-7720-76ed-ae44-bbcc23a8c550 │
   └──────────────────────────────────────┘

   ┌─dateTimeToUUIDv7(t⋯08-15 18:57:56'))─┐
1. │ 017b4b2d-7720-76ed-ae44-bbcf71ed0fd3 │
   └──────────────────────────────────────┘
```

Функция гарантирует, что несколько вызовов с одним и тем же временным штампом генерируют уникальные, монотонно увеличивающиеся UUID.

## empty {#empty}

Проверяет, пуст ли входной UUID.

**Синтаксис**

```sql
empty(UUID)
```

UUID считается пустым, если он содержит все нули (нулевой UUID).

Функция также работает для [Массивов](/sql-reference/functions/array-functions#empty) и [Строк](string-functions.md#empty).

**Аргументы**

- `x` — UUID. [UUID](../data-types/uuid.md).

**Возвращаемое значение**

- Возвращает `1` для пустого UUID или `0` для непустого UUID. [UInt8](../data-types/int-uint.md).

**Пример**

Для генерации значения UUID ClickHouse предоставляет функцию [generateUUIDv4](#generateuuidv4).

Запрос:

```sql
SELECT empty(generateUUIDv4());
```

Результат:

```response
┌─empty(generateUUIDv4())─┐
│                       0 │
└─────────────────────────┘
```

## notEmpty {#notempty}

Проверяет, не пуст ли входной UUID.

**Синтаксис**

```sql
notEmpty(UUID)
```

UUID считается пустым, если он содержит все нули (нулевой UUID).

Функция также работает для [Массивов](/sql-reference/functions/array-functions#notEmpty) или [Строк](string-functions.md#notempty).

**Аргументы**

- `x` — UUID. [UUID](../data-types/uuid.md).

**Возвращаемое значение**

- Возвращает `1` для непустого UUID или `0` для пустого UUID. [UInt8](../data-types/int-uint.md).

**Пример**

Для генерации значения UUID ClickHouse предоставляет функцию [generateUUIDv4](#generateuuidv4).

Запрос:

```sql
SELECT notEmpty(generateUUIDv4());
```

Результат:

```response
┌─notEmpty(generateUUIDv4())─┐
│                          1 │
└────────────────────────────┘
```

## toUUID {#touuid}

Преобразует значение типа String в UUID.

```sql
toUUID(string)
```

**Возвращаемое значение**

Значение типа UUID.

**Пример использования**

```sql
SELECT toUUID('61f0c404-5cb3-11e7-907b-a6006ad3dba0') AS uuid
```

Результат:

```response
┌─────────────────────────────────uuid─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0 │
└──────────────────────────────────────┘
```

## toUUIDOrDefault {#touuidordefault}

**Аргументы**

- `string` — Строка из 36 символов или FixedString(36). [String](../syntax.md#string).
- `default` — UUID, который будет использоваться в качестве значения по умолчанию, если первый аргумент не может быть преобразован в тип UUID. [UUID](../data-types/uuid.md).

**Возвращаемое значение**

UUID

```sql
toUUIDOrDefault(string, default)
```

**Возвращаемое значение**

Значение типа UUID.

**Примеры использования**

В первом примере возвращается аргумент, преобразованный в тип UUID, так как он может быть преобразован:

```sql
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' AS UUID));
```

Результат:

```response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Во втором примере возвращается второй аргумент (предоставленный UUID по умолчанию), так как первый аргумент не может быть преобразован в тип UUID:

```sql
SELECT toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' AS UUID));
```

Результат:

```response
┌─toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 59f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                               │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## toUUIDOrNull {#touuidornull}

Принимает аргумент типа String и пытается разобрать его в UUID. Если это не удалось, возвращает NULL.

```sql
toUUIDOrNull(string)
```

**Возвращаемое значение**

Значение типа Nullable(UUID).

**Пример использования**

```sql
SELECT toUUIDOrNull('61f0c404-5cb3-11e7-907b-a6006ad3dba0T') AS uuid
```

Результат:

```response
┌─uuid─┐
│ ᴺᵁᴸᴸ │
└──────┘
```

## toUUIDOrZero {#touuidorzero}

Принимает аргумент типа String и пытается разобрать его в UUID. Если это не удалось, возвращает нулевой UUID.

```sql
toUUIDOrZero(string)
```

**Возвращаемое значение**

Значение типа UUID.

**Пример использования**

```sql
SELECT toUUIDOrZero('61f0c404-5cb3-11e7-907b-a6006ad3dba0T') AS uuid
```

Результат:

```response
┌─────────────────────────────────uuid─┐
│ 00000000-0000-0000-0000-000000000000 │
└──────────────────────────────────────┘
```

## UUIDStringToNum {#uuidstringtonum}

Принимает `string`, содержащую 36 символов в формате `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, и возвращает [FixedString(16)](../data-types/fixedstring.md) в качестве его бинарного представления, с форматом, опционально указанным через `variant` (по умолчанию `Big-endian`).

**Синтаксис**

```sql
UUIDStringToNum(string[, variant = 1])
```

**Аргументы**

- `string` — [String](/sql-reference/data-types/string) из 36 символов или [FixedString](/sql-reference/data-types/string)
- `variant` — Целое число, представляющее вариант, как указано в [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (по умолчанию), 2 = `Microsoft`.

**Возвращаемое значение**

FixedString(16)

**Примеры использования**

```sql
SELECT
    '612f3c40-5d3b-217e-707b-6a546a3d7b29' AS uuid,
    UUIDStringToNum(uuid) AS bytes
```

Результат:

```response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ a/<@];!~p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

```sql
SELECT
    '612f3c40-5d3b-217e-707b-6a546a3d7b29' AS uuid,
    UUIDStringToNum(uuid, 2) AS bytes
```

Результат:

```response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

## UUIDNumToString {#uuidnumtostring}

Принимает `binary`, содержащий бинарное представление UUID, с форматом, опционально указанным через `variant` (по умолчанию `Big-endian`), и возвращает строку, содержащую 36 символов в текстовом формате.

**Синтаксис**

```sql
UUIDNumToString(binary[, variant = 1])
```

**Аргументы**

- `binary` — [FixedString(16)](../data-types/fixedstring.md) в качестве бинарного представления UUID.
- `variant` — Целое число, представляющее вариант, как указано в [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (по умолчанию), 2 = `Microsoft`.

**Возвращаемое значение**

String.

**Пример использования**

```sql
SELECT
    'a/<@];!~p{jTj={)' AS bytes,
    UUIDNumToString(toFixedString(bytes, 16)) AS uuid
```

Результат:

```response
┌─bytes────────────┬─uuid─────────────────────────────────┐
│ a/<@];!~p{jTj={) │ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │
└──────────────────┴──────────────────────────────────────┘
```

```sql
SELECT
    '@</a;]~!p{jTj={)' AS bytes,
    UUIDNumToString(toFixedString(bytes, 16), 2) AS uuid
```

Результат:

```response
┌─bytes────────────┬─uuid─────────────────────────────────┐
│ @</a;]~!p{jTj={) │ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │
└──────────────────┴──────────────────────────────────────┘
```

## UUIDToNum {#uuidtonum}

Принимает [UUID](../data-types/uuid.md) и возвращает его бинарное представление в виде [FixedString(16)](../data-types/fixedstring.md), с форматом, опционально указанным через `variant` (по умолчанию `Big-endian`). Эта функция заменяет вызовы двух отдельных функций `UUIDStringToNum(toString(uuid))`, так что промежуточное преобразование из UUID в строку не требуется для извлечения байтов из UUID.

**Синтаксис**

```sql
UUIDToNum(uuid[, variant = 1])
```

**Аргументы**

- `uuid` — [UUID](../data-types/uuid.md).
- `variant` — Целое число, представляющее вариант, как указано в [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (по умолчанию), 2 = `Microsoft`.

**Возвращаемое значение**

Бинарное представление UUID.

**Примеры использования**

```sql
SELECT
    toUUID('612f3c40-5d3b-217e-707b-6a546a3d7b29') AS uuid,
    UUIDToNum(uuid) AS bytes
```

Результат:

```response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ a/<@];!~p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

```sql
SELECT
    toUUID('612f3c40-5d3b-217e-707b-6a546a3d7b29') AS uuid,
    UUIDToNum(uuid, 2) AS bytes
```

Результат:

```response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

## UUIDv7ToDateTime {#uuidv7todatetime}

Возвращает компонент временного штампа UUID версии 7.

**Синтаксис**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**Аргументы**

- `uuid` — [UUID](../data-types/uuid.md) версии 7.
- `timezone` — [Имя часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) для возвращаемого значения (необязательно). [String](../data-types/string.md).

**Возвращаемое значение**

- Временной штамп с точностью до миллисекунд. Если UUID не является действительным UUID версии 7, возвращает 1970-01-01 00:00:00.000. [DateTime64(3)](../data-types/datetime64.md).

**Примеры использования**

```sql
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))
```

Результат:

```response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))─┐
│                                          2024-04-22 15:30:29.048 │
└──────────────────────────────────────────────────────────────────┘
```

```sql
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')
```

Результат:

```response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')─┐
│                                                              2024-04-22 08:30:29.048 │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## serverUUID {#serveruuid}

Возвращает случайный UUID, сгенерированный во время первого запуска сервера ClickHouse. UUID хранится в файле `uuid` в директории сервера ClickHouse (например, `/var/lib/clickhouse/`) и сохраняется между перезапусками сервера.

**Синтаксис**

```sql
serverUUID()
```

**Возвращаемое значение**

- UUID сервера. [UUID](../data-types/uuid.md).

## generateSnowflakeID {#generatesnowflakeid}

Генерирует [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID).
Эта функция гарантирует, что поле счетчика в пределах временного штампа монотонно увеличивается во всех вызовах функций в параллельно работающих потоках и запросах.

Смотрите раздел ["Генерация Snowflake ID"](#snowflake-id-generation) для получения подробной информации о реализации.

**Синтаксис**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**Аргументы**

- `expr` — Произвольное [выражение](/sql-reference/syntax#expressions), используемое для обхода [удаления общих подвыражений](/sql-reference/functions/overview#common-subexpression-elimination), если функция вызывается несколько раз в запросе. Значение выражения не влияет на возвращаемый Snowflake ID. Необязательно.
- `machine_id` — ID машины, используются 10 младших битов. [Int64](../data-types/int-uint.md). Необязательно.

**Возвращаемое значение**

Значение типа UInt64.

**Пример**

Сначала создайте таблицу с колонкой типа UInt64, затем вставьте сгенерированный Snowflake ID в таблицу.

```sql
CREATE TABLE tab (id UInt64) ENGINE = Memory;

INSERT INTO tab SELECT generateSnowflakeID();

SELECT * FROM tab;
```

Результат:

```response
┌──────────────────id─┐
│ 7199081390080409600 │
└─────────────────────┘
```

**Пример с несколькими Snowflake ID, сгенерированными на строку**

```sql
SELECT generateSnowflakeID(1), generateSnowflakeID(2);

┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**Пример с выражением и ID машины**

```sql
SELECT generateSnowflakeID('expr', 1);

┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```

## snowflakeToDateTime {#snowflaketodatetime}

<DeprecatedBadge/>

:::warning
Эта функция устарела и может быть использована только в том случае, если настройка [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) включена.
Функция будет удалена в будущем.

Пожалуйста, используйте функцию [snowflakeIDToDateTime](#snowflakeidtodatetime) вместо этого.
:::

Извлекает компонент временного штампа [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в формате [DateTime](../data-types/datetime.md).

**Синтаксис**

```sql
snowflakeToDateTime(value[, time_zone])
```

**Аргументы**

- `value` — Snowflake ID. [Int64](../data-types/int-uint.md).
- `time_zone` — [Часовой пояс](/operations/server-configuration-parameters/settings.md#timezone). Функция разбирает `time_string` в соответствии с часовым поясом. Необязательно. [String](../data-types/string.md).

**Возвращаемое значение**

- Компонент временного штампа `value` как значение [DateTime](../data-types/datetime.md).

**Пример**

Запрос:

```sql
SELECT snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC');
```

Результат:

```response

┌─snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC')─┐
│                                              2021-08-15 10:57:56 │
└──────────────────────────────────────────────────────────────────┘
```

## snowflakeToDateTime64 {#snowflaketodatetime64}

<DeprecatedBadge/>

:::warning
Эта функция устарела и может быть использована только в том случае, если настройка [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) включена.
Функция будет удалена в будущем.

Пожалуйста, используйте функцию [snowflakeIDToDateTime64](#snowflakeidtodatetime64) вместо этого.
:::

Извлекает компонент временного штампа [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в формате [DateTime64](../data-types/datetime64.md).

**Синтаксис**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**Аргументы**

- `value` — Snowflake ID. [Int64](../data-types/int-uint.md).
- `time_zone` — [Часовой пояс](/operations/server-configuration-parameters/settings.md#timezone). Функция разбирает `time_string` в соответствии с часовым поясом. Необязательно. [String](../data-types/string.md).

**Возвращаемое значение**

- Компонент временного штампа `value` как значение [DateTime64](../data-types/datetime64.md) с масштабом = 3, т.е. с точностью до миллисекунд.

**Пример**

Запрос:

```sql
SELECT snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC');
```

Результат:

```response

┌─snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC')─┐
│                                            2021-08-15 10:58:19.841 │
└────────────────────────────────────────────────────────────────────┘
```

## dateTimeToSnowflake {#datetimetosnowflake}

<DeprecatedBadge/>

:::warning
Эта функция устарела и может быть использована только в том случае, если настройка [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) включена.
Функция будет удалена в будущем.

Пожалуйста, используйте функцию [dateTimeToSnowflakeID](#datetimetosnowflakeid) вместо этого.
:::

Преобразует значение [DateTime](../data-types/datetime.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в указанное время.

**Синтаксис**

```sql
dateTimeToSnowflake(value)
```

**Аргументы**

- `value` — Дата с временем. [DateTime](../data-types/datetime.md).

**Возвращаемое значение**

- Входное значение, преобразованное в тип [Int64](../data-types/int-uint.md) как первый Snowflake ID в это время.

**Пример**

Запрос:

```sql
WITH toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt SELECT dateTimeToSnowflake(dt);
```

Результат:

```response
┌─dateTimeToSnowflake(dt)─┐
│     1426860702823350272 │
└─────────────────────────┘
```

## dateTime64ToSnowflake {#datetime64tosnowflake}

<DeprecatedBadge/>

:::warning
Эта функция устарела и может быть использована только в том случае, если настройка [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) включена.
Функция будет удалена в будущем.

Пожалуйста, используйте функцию [dateTime64ToSnowflakeID](#datetime64tosnowflakeid) вместо этого.
:::

Преобразует [DateTime64](../data-types/datetime64.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в указанное время.

**Синтаксис**

```sql
dateTime64ToSnowflake(value)
```

**Аргументы**

- `value` — Дата с временем. [DateTime64](../data-types/datetime64.md).

**Возвращаемое значение**

- Входное значение, преобразованное в тип [Int64](../data-types/int-uint.md) как первый Snowflake ID в это время.

**Пример**

Запрос:

```sql
WITH toDateTime64('2021-08-15 18:57:56.492', 3, 'Asia/Shanghai') AS dt64 SELECT dateTime64ToSnowflake(dt64);
```

Результат:

```response
┌─dateTime64ToSnowflake(dt64)─┐
│         1426860704886947840 │
└─────────────────────────────┘
```

## snowflakeIDToDateTime {#snowflakeidtodatetime}

Возвращает компонент временного штампа [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) как значение типа [DateTime](../data-types/datetime.md).

**Синтаксис**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**Аргументы**

- `value` — Snowflake ID. [UInt64](../data-types/int-uint.md).
- `epoch` - Эпоха Snowflake ID в миллисекундах с 1970-01-01. По умолчанию 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. Необязательно. [UInt*](../data-types/int-uint.md).
- `time_zone` — [Часовой пояс](/operations/server-configuration-parameters/settings.md#timezone). Функция разбирает `time_string` в соответствии с часовым поясом. Необязательно. [String](../data-types/string.md).

**Возвращаемое значение**

- Компонент временного штампа `value` как значение [DateTime](../data-types/datetime.md).

**Пример**

Запрос:

```sql
SELECT snowflakeIDToDateTime(7204436857747984384) AS res
```

Результат:

```response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```

## snowflakeIDToDateTime64 {#snowflakeidtodatetime64}

Возвращает компонент временного штампа [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) как значение типа [DateTime64](../data-types/datetime64.md).

**Синтаксис**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**Аргументы**

- `value` — Snowflake ID. [UInt64](../data-types/int-uint.md).
- `epoch` - Эпоха Snowflake ID в миллисекундах с 1970-01-01. По умолчанию 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. Необязательно. [UInt*](../data-types/int-uint.md).
- `time_zone` — [Часовой пояс](/operations/server-configuration-parameters/settings.md#timezone). Функция разбирает `time_string` в соответствии с часовым поясом. Необязательно. [String](../data-types/string.md).

**Возвращаемое значение**

- Компонент временного штампа `value` как значение [DateTime64](../data-types/datetime64.md) с масштабом = 3, т.е. с точностью до миллисекунд.

**Пример**

Запрос:

```sql
SELECT snowflakeIDToDateTime64(7204436857747984384) AS res
```

Результат:

```response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```

## dateTimeToSnowflakeID {#datetimetosnowflakeid}

Преобразует значение [DateTime](../data-types/datetime.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в указанное время.

**Синтаксис**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**Аргументы**

- `value` — Дата с временем. [DateTime](../data-types/datetime.md).
- `epoch` - Эпоха Snowflake ID в миллисекундах с 1970-01-01. По умолчанию 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. Необязательно. [UInt*](../data-types/int-uint.md).

**Возвращаемое значение**

- Входное значение, преобразованное в [UInt64](../data-types/int-uint.md) как первый Snowflake ID в это время.

**Пример**

Запрос:

```sql
SELECT toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt, dateTimeToSnowflakeID(dt) AS res;
```

Результат:

```response
┌──────────────────dt─┬─────────────────res─┐
│ 2021-08-15 18:57:56 │ 6832626392367104000 │
└─────────────────────┴─────────────────────┘
```

## dateTime64ToSnowflakeID {#datetime64tosnowflakeid}

Преобразует [DateTime64](../data-types/datetime64.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в указанное время.

**Синтаксис**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**Аргументы**

- `value` — Дата с временем. [DateTime64](../data-types/datetime64.md).
- `epoch` - Эпоха Snowflake ID в миллисекундах с 1970-01-01. По умолчанию 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. Необязательно. [UInt*](../data-types/int-uint.md).

**Возвращаемое значение**

- Входное значение, преобразованное в [UInt64](../data-types/int-uint.md) как первый Snowflake ID в это время.

**Пример**

Запрос:

```sql
SELECT toDateTime('2021-08-15 18:57:56.493', 3, 'Asia/Shanghai') AS dt, dateTime64ToSnowflakeID(dt) AS res;
```

Результат:

```yaml
┌──────────────────────dt─┬─────────────────res─┐
│ 2021-08-15 18:57:56.493 │ 6832626394434895872 │
└─────────────────────────┴─────────────────────┘
```

## См. также {#see-also}

- [dictGetUUID](/sql-reference/functions/ext-dict-functions#other-functions)