---
description: 'Справочная документация по функциям для работы с UUID'
sidebar_label: 'UUID'
slug: /sql-reference/functions/uuid-functions
title: 'Функции для работы с UUID'
doc_type: 'reference'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';

# Функции для работы с UUID {#functions-for-working-with-uuids}

## Генерация UUIDv7 {#uuidv7-generation}

Сгенерированный UUID содержит 48-битный таймстамп в миллисекундах Unix-времени, за которым следуют версия «7» (4 бита), счётчик (42 бита) для различения UUID в пределах одной миллисекунды (включая поле варианта «2» — 2 бита) и случайное поле (32 бита).
Для любого заданного таймстампа (`unix_ts_ms`) счётчик начинается со случайного значения и увеличивается на 1 для каждого нового UUID до тех пор, пока таймстамп не изменится. В случае переполнения счётчика поле таймстампа увеличивается на 1, а счётчик сбрасывается на новое случайное начальное значение.
Функции генерации UUID гарантируют, что поле счётчика в пределах одного таймстампа монотонно возрастает во всех вызовах функции в параллельно выполняющихся потоках и запросах.

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

Сгенерированный Snowflake ID содержит текущую Unix-метку времени в миллисекундах (41 бит + 1 старший нулевой бит), за которой следуют идентификатор машины (10 бит) и счётчик (12 бит) для различения идентификаторов в пределах одной миллисекунды. Для любой заданной метки времени (`unix_ts_ms`) счётчик начинается с 0 и увеличивается на 1 для каждого нового Snowflake ID до изменения метки времени. В случае переполнения счётчика поле метки времени увеличивается на 1, а счётчик сбрасывается в 0.

:::note
Сгенерированные Snowflake ID основаны на эпохе UNIX 1970-01-01. Хотя не существует стандарта или рекомендаций для эпохи Snowflake ID, реализации в других системах могут использовать другую эпоху, например Twitter/X (2010-11-04) или Mastodon (2015-01-01).
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

Генерирует [UUID](../data-types/uuid.md) [версии 4](https://tools.ietf.org/html/rfc4122#section-4.4).

**Синтаксис**

```sql
generateUUIDv4([expr])
```

**Аргументы**

* `expr` — Произвольное [выражение](/sql-reference/syntax#expressions), используемое для обхода [устранения общих подвыражений](/sql-reference/functions/overview#common-subexpression-elimination) при многократном вызове функции в одном запросе. Значение выражения не влияет на возвращаемый UUID. Необязательный параметр.

**Возвращаемое значение**

Значение типа UUIDv4.

**Пример**

Сначала создайте таблицу со столбцом типа UUID, затем вставьте сгенерированный UUIDv4 в эту таблицу.

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

**Пример, в котором для каждой строки генерируется несколько UUID**

```sql
SELECT generateUUIDv4(1), generateUUIDv4(2);

┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 8abf8c13-7dea-4fdf-af3e-0e18767770e6 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## generateUUIDv7 {#generateUUIDv7}

Генерирует [UUID версии 7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04) [(UUID)](../data-types/uuid.md).

См. раздел [&quot;Генерация UUIDv7&quot;](#uuidv7-generation) для подробностей о структуре UUID, управлении счётчиком и гарантиях при конкурентном доступе.

:::note
По состоянию на апрель 2024 года UUID версии 7 имеют статус черновика, и их структура в будущем может измениться.
:::

**Синтаксис**

```sql
generateUUIDv7([expr])
```

**Аргументы**

* `expr` — Произвольное [выражение](/sql-reference/syntax#expressions), позволяющее обойти [устранение общих подвыражений](/sql-reference/functions/overview#common-subexpression-elimination), если функция вызывается несколько раз в запросе. Значение выражения не влияет на возвращаемый UUID. Необязательный параметр.

**Возвращаемое значение**

Значение типа UUIDv7.

**Пример**

Сначала создайте таблицу со столбцом типа UUID, затем вставьте сгенерированный UUIDv7 в таблицу.

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

**Пример с несколькими UUID, генерируемыми для каждой строки**

```sql
SELECT generateUUIDv7(1), generateUUIDv7(2);

┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(2)────────────────────┐
│ 018f05c9-4ab8-7b86-b64e-c9f03fbd45d1 │ 018f05c9-4ab8-7b86-b64e-c9f12efb7e16 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## dateTimeToUUIDv7 {#datetimetouuidv7}

Преобразует значение [DateTime](../data-types/datetime.md) в [UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7) на заданный момент времени.

См. раздел «[UUIDv7 generation](#uuidv7-generation)» для подробностей о структуре UUID, управлении счётчиком и гарантиях корректной работы при конкурентном доступе.

:::note
По состоянию на апрель 2024 года UUID версии 7 имеют статус черновика, и их структура может измениться в будущем.
:::

**Синтаксис**

```sql
dateTimeToUUIDv7(value)
```

**Аргументы**

* `value` — Дата и время. [DateTime](../data-types/datetime.md).

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

**Пример с несколькими UUID для одной и той же временной метки**

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

Функция гарантирует, что несколько вызовов с одинаковым значением временной метки генерируют уникальные, монотонно возрастающие UUID.

## empty {#empty}

Проверяет, является ли переданный UUID пустым.

**Синтаксис**

```sql
empty(UUID)
```

UUID считается пустым, если он состоит полностью из нулей (нулевой UUID).

Функция также работает для массивов и строк.

**Аргументы**

* `x` — UUID. [UUID](../data-types/uuid.md).

**Возвращаемое значение**

* Возвращает `1` для пустого UUID или `0` для непустого UUID. [UInt8](../data-types/int-uint.md).

**Пример**

Чтобы сгенерировать значение UUID, ClickHouse предоставляет функцию [generateUUIDv4](#generateuuidv4).

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

Проверяет, что переданный UUID не пустой.

**Синтаксис**

```sql
notEmpty(UUID)
```

UUID считается пустым, если он состоит полностью из нулей (нулевой UUID).

Функция также работает для массивов и строк.

**Аргументы**

* `x` — UUID. [UUID](../data-types/uuid.md).

**Возвращаемое значение**

* Возвращает `1` для непустого UUID или `0` для пустого UUID. [UInt8](../data-types/int-uint.md).

**Пример**

Для генерации значения UUID в ClickHouse предусмотрена функция [generateUUIDv4](#generateuuidv4).

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

Преобразует значение типа String в значение типа UUID.

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

* `string` — строка длиной 36 символов или FixedString(36). [String](../syntax.md#string).
* `default` — UUID, используемый по умолчанию, если первый аргумент не может быть преобразован в тип UUID. [UUID](../data-types/uuid.md).

**Возвращаемое значение**

UUID

```sql
toUUIDOrDefault(string, default)
```

**Возвращаемое значение**

Значение типа UUID.

**Примеры использования**

В этом первом примере возвращается первый аргумент, преобразованный к типу UUID, так как его можно привести к этому типу:

```sql
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' AS UUID));
```

Результат:

```response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Этот второй пример возвращает второй аргумент (указанный UUID по умолчанию), поскольку первый аргумент нельзя привести к типу UUID:

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

Принимает аргумент типа String и пытается преобразовать его в UUID. Если преобразование не удалось, возвращает NULL.

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

Принимает аргумент типа String и пытается преобразовать его в UUID. Если преобразование не удаётся, возвращает нулевой UUID.

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

Принимает строку типа `string`, содержащую 36 символов в формате `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, и возвращает [FixedString(16)](../data-types/fixedstring.md) в виде её двоичного представления, формат которого может быть дополнительно задан параметром `variant` (по умолчанию `Big-endian`).

**Синтаксис**

```sql
UUIDStringToNum(string[, variant = 1])
```

**Аргументы**

* `string` — [String](/sql-reference/data-types/string) из 36 символов или [FixedString](/sql-reference/data-types/string)
* `variant` — целое число, задающее вариант в соответствии с [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (по умолчанию), 2 = `Microsoft`.

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

Принимает значение типа `binary`, содержащее двоичное представление UUID (его формат можно дополнительно указать параметром `variant`, по умолчанию используется `Big-endian`), и возвращает строку из 36 символов в текстовом формате.

**Синтаксис**

```sql
UUIDNumToString(binary[, variant = 1])
```

**Аргументы**

* `binary` — [FixedString(16)](../data-types/fixedstring.md) как двоичное представление UUID.
* `variant` — целое число, представляющее вариант, как указано в [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (по умолчанию), 2 = `Microsoft`.

**Возвращаемое значение**

Строка.

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

Принимает [UUID](../data-types/uuid.md) и возвращает его двоичное представление в виде [FixedString(16)](../data-types/fixedstring.md); формат двоичного представления может быть дополнительно указан параметром `variant` (по умолчанию `Big-endian`). Эта функция заменяет вызовы двух отдельных функций вида `UUIDStringToNum(toString(uuid))`, поэтому для извлечения байтов из UUID не требуется промежуточное преобразование UUID в строку.

**Синтаксис**

```sql
UUIDToNum(uuid[, variant = 1])
```

**Аргументы**

* `uuid` — [UUID](../data-types/uuid.md).
* `variant` — целое число, представляющее вариант, как указано в [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (по умолчанию), 2 = `Microsoft`.

**Возвращаемое значение**

Двоичное представление UUID.

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

Возвращает компонент отметки времени из UUID версии 7.

**Синтаксис**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**Аргументы**

* `uuid` — [UUID](../data-types/uuid.md) версии 7.
* `timezone` — [название часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) для возвращаемого значения (необязательный параметр). [String](../data-types/string.md).

**Возвращаемое значение**

* Временная метка с точностью до миллисекунд. Если UUID не является корректным UUID версии 7, возвращается 1970-01-01 00:00:00.000. [DateTime64(3)](../data-types/datetime64.md).

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

Возвращает случайный UUID, сгенерированный при первом запуске сервера ClickHouse. UUID хранится в файле `uuid` в каталоге сервера ClickHouse (например, `/var/lib/clickhouse/`) и сохраняется между перезапусками сервера.

**Синтаксис**

```sql
serverUUID()
```

**Возвращаемое значение**

* UUID сервера. [UUID](../data-types/uuid.md).

## generateSnowflakeID {#generatesnowflakeid}

Генерирует [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID).
Эта функция гарантирует, что поле счётчика внутри метки времени монотонно увеличивается при всех вызовах функции в одновременно выполняющихся потоках и запросах.

См. раздел [&quot;Генерация Snowflake ID&quot;](#snowflake-id-generation) для подробных сведений о реализации.

**Синтаксис**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**Аргументы**

* `expr` — Произвольное [выражение](/sql-reference/syntax#expressions), используемое для обхода механизма [устранения общих подвыражений](/sql-reference/functions/overview#common-subexpression-elimination), если функция вызывается несколько раз в одном запросе. Значение выражения не влияет на возвращаемый Snowflake ID. Необязательный параметр.
* `machine_id` — Идентификатор машины, используются младшие 10 бит. [Int64](../data-types/int-uint.md). Необязательный параметр.

**Возвращаемое значение**

Значение типа UInt64.

**Пример**

Сначала создайте таблицу со столбцом типа UInt64, затем вставьте в неё сгенерированный Snowflake ID.

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

**Пример с несколькими Snowflake ID, создаваемыми для каждой строки**

```sql
SELECT generateSnowflakeID(1), generateSnowflakeID(2);

┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**Пример с выражением и идентификатором хоста**

```sql
SELECT generateSnowflakeID('expr', 1);

┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```

## snowflakeToDateTime {#snowflaketodatetime}

<DeprecatedBadge />

:::warning
Эта функция устарела и может использоваться только в том случае, если включена настройка [allow&#95;deprecated&#95;snowflake&#95;conversion&#95;functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions).
Функция будет удалена в будущем.

Вместо неё используйте функцию [snowflakeIDToDateTime](#snowflakeidtodatetime).
:::

Извлекает компонент временной метки из [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в формате [DateTime](../data-types/datetime.md).

**Синтаксис**

```sql
snowflakeToDateTime(value[, time_zone])
```

**Аргументы**

* `value` — идентификатор Snowflake. [Int64](../data-types/int-uint.md).
* `time_zone` — [часовой пояс](/operations/server-configuration-parameters/settings.md#timezone). Функция разбирает `time_string` в соответствии с часовым поясом. Необязательный параметр. [String](../data-types/string.md).

**Возвращаемое значение**

* Компонент метки времени значения `value` в виде значения [DateTime](../data-types/datetime.md).

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

<DeprecatedBadge />

:::warning
Эта функция устарела и может использоваться только в том случае, если включена настройка [allow&#95;deprecated&#95;snowflake&#95;conversion&#95;functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions).
Функция будет удалена в будущем.

Используйте вместо неё функцию [snowflakeIDToDateTime64](#snowflakeidtodatetime64).
:::

Извлекает компонент метки времени из [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в формате [DateTime64](../data-types/datetime64.md).

**Синтаксис**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**Аргументы**

* `value` — Snowflake ID. [Int64](../data-types/int-uint.md).
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone). Функция разбирает `time_string` в соответствии с часовым поясом. Необязательный параметр. [String](../data-types/string.md).

**Возвращаемое значение**

* Компонента временной метки `value` в формате [DateTime64](../data-types/datetime64.md) с масштабом = 3, то есть с точностью до миллисекунды.

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

<DeprecatedBadge />

:::warning
Эта функция устарела и может использоваться только в том случае, если включён параметр [allow&#95;deprecated&#95;snowflake&#95;conversion&#95;functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions).
Функция будет удалена в какой‑то момент в будущем.

Пожалуйста, используйте вместо неё функцию [dateTimeToSnowflakeID](#datetimetosnowflakeid).
:::

Преобразует значение [DateTime](../data-types/datetime.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в заданный момент времени.

**Синтаксис**

```sql
dateTimeToSnowflake(value)
```

**Аргументы**

* `value` — дата и время. [DateTime](../data-types/datetime.md).

**Возвращаемое значение**

* Входное значение, преобразованное в тип данных [Int64](../data-types/int-uint.md) как первый идентификатор Snowflake в этот момент времени.

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

<DeprecatedBadge />

:::warning
Эта функция устарела и может использоваться только если включена настройка [allow&#95;deprecated&#95;snowflake&#95;conversion&#95;functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions).
Функция будет удалена в будущем.

Используйте вместо неё функцию [dateTime64ToSnowflakeID](#datetime64tosnowflakeid).
:::

Преобразует [DateTime64](../data-types/datetime64.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в указанный момент времени.

**Синтаксис**

```sql
dateTime64ToSnowflake(value)
```

**Аргументы**

* `value` — дата и время. [DateTime64](../data-types/datetime64.md).

**Возвращаемое значение**

* Входное значение, преобразованное к типу данных [Int64](../data-types/int-uint.md) как первый идентификатор Snowflake для этого момента времени.

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

Возвращает компонент отметки времени [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в виде значения типа [DateTime](../data-types/datetime.md).

**Синтаксис**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**Аргументы**

* `value` — Snowflake ID. [UInt64](../data-types/int-uint.md).
* `epoch` — эпоха Snowflake ID в миллисекундах, отсчитанных с 1970-01-01. По умолчанию — 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. Необязательный параметр. [UInt*](../data-types/int-uint.md).
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone). Функция интерпретирует `time_string` в соответствии с часовым поясом. Необязательный параметр. [String](../data-types/string.md).

**Возвращаемое значение**

* Компонент временной метки значения `value` в виде значения [DateTime](../data-types/datetime.md).

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

Возвращает компонент временной метки [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в виде значения типа [DateTime64](../data-types/datetime64.md).

**Синтаксис**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**Аргументы**

* `value` — идентификатор Snowflake. [UInt64](../data-types/int-uint.md).
* `epoch` — эпоха идентификаторов Snowflake в миллисекундах, прошедших с 1970-01-01. По умолчанию — 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. Необязательный параметр. [UInt*](../data-types/int-uint.md).
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone). Функция разбирает `time_string` в соответствии с указанным часовым поясом. Необязательный параметр. [String](../data-types/string.md).

**Возвращаемое значение**

* Компонент метки времени из `value` в виде [DateTime64](../data-types/datetime64.md) с scale = 3, то есть с точностью до миллисекунд.

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

Преобразует значение [DateTime](../data-types/datetime.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) для заданного момента времени.

**Синтаксис**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**Аргументы**

* `value` — дата и время. [DateTime](../data-types/datetime.md).
* `epoch` — эпоха для Snowflake ID в миллисекундах, прошедших с 1970-01-01. По умолчанию 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) используйте 1288834974657. Необязательный параметр. [UInt*](../data-types/int-uint.md).

**Возвращаемое значение**

* Входное значение, преобразованное в [UInt64](../data-types/int-uint.md) как первый Snowflake ID для этого момента времени.

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

Преобразует [DateTime64](../data-types/datetime64.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в заданный момент времени.

**Синтаксис**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**Аргументы**

* `value` — дата и время. [DateTime64](../data-types/datetime64.md).
* `epoch` — эпоха Snowflake ID в миллисекундах, отсчитываемая от 1970-01-01. По умолчанию — 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. Необязательный параметр. [UInt*](../data-types/int-uint.md).

**Возвращаемое значение**

* Входное значение, преобразованное в [UInt64](../data-types/int-uint.md) как значение первого Snowflake ID для этого момента времени.

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

* [dictGetUUID](/sql-reference/functions/ext-dict-functions#dictGetUUID)

{/*
  Содержимое приведённых ниже тегов заменяется при сборке фреймворка документации
  документами, сгенерированными из system.functions. Пожалуйста, не изменяйте и не удаляйте эти теги.
  См.: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

## UUIDNumToString {#UUIDNumToString}

Впервые представлена в версии v1.1

Принимает двоичное представление UUID, формат которого может быть дополнительно указан через параметр `variant` (по умолчанию `Big-endian`), и возвращает строку из 36 символов в текстовом представлении.

**Синтаксис**

```sql
UUIDNumToString(binary[, variant])
```

**Аргументы**

* `binary` — Двоичное представление UUID. [`FixedString(16)`](/sql-reference/data-types/fixedstring)
* `variant` — Вариант, как указано в [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (по умолчанию), 2 = `Microsoft`. [`(U)Int*`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает UUID в виде строки. [`String`](/sql-reference/data-types/string)

**Примеры**

**Пример использования**

```sql title=Query
SELECT
    'a/<@];!~p{jTj={)' AS bytes,
    UUIDNumToString(toFixedString(bytes, 16)) AS uuid
```

```response title=Response
┌─bytes────────────┬─uuid─────────────────────────────────┐
│ a/<@];!~p{jTj={) │ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │
└──────────────────┴──────────────────────────────────────┘
```

**Microsoft variant**

```sql title=Query
SELECT
    '@</a;]~!p{jTj={)' AS bytes,
    UUIDNumToString(toFixedString(bytes, 16), 2) AS uuid
```

```response title=Response
┌─bytes────────────┬─uuid─────────────────────────────────┐
│ @</a;]~!p{jTj={) │ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │
└──────────────────┴──────────────────────────────────────┘
```



## UUIDStringToNum {#UUIDStringToNum}

Introduced in: v1.1


Accepts a string containing 36 characters in the format `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, and returns a [FixedString(16)](../data-types/fixedstring.md) as its binary representation, with its format optionally specified by `variant` (`Big-endian` by default).
    

**Syntax**

```sql
UUIDStringToNum(string[, variant = 1])
```

**Arguments**

- `string` — A string or fixed-string of 36 characters) [`String`](/sql-reference/data-types/string) or [`FixedString(36)`](/sql-reference/data-types/fixedstring)
- `variant` — Variant as specified by [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (default), 2 = `Microsoft`. [`(U)Int*`](/sql-reference/data-types/int-uint)


**Returned value**

Returns the binary representation of `string`. [`FixedString(16)`](/sql-reference/data-types/fixedstring)

**Examples**

**Usage example**

```sql title=Query
SELECT
    '612f3c40-5d3b-217e-707b-6a546a3d7b29' AS uuid,
    UUIDStringToNum(uuid) AS bytes
```

```response title=Response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ a/<@];!~p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

**Microsoft variant**

```sql title=Query
SELECT
    '612f3c40-5d3b-217e-707b-6a546a3d7b29' AS uuid,
    UUIDStringToNum(uuid, 2) AS bytes
```

```response title=Response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```



## UUIDToNum {#UUIDToNum}

Introduced in: v24.5


Accepts a [UUID](../data-types/uuid.md) and returns its binary representation as a [FixedString(16)](../data-types/fixedstring.md), with its format optionally specified by `variant` (`Big-endian` by default).
This function replaces calls to two separate functions `UUIDStringToNum(toString(uuid))` so no intermediate conversion from UUID to string is required to extract bytes from a UUID.
    

**Syntax**

```sql
UUIDToNum(uuid[, variant = 1])
```

**Arguments**

- `uuid` — UUID. [`String`](/sql-reference/data-types/string) or [`FixedString`](/sql-reference/data-types/fixedstring)
- `variant` — Variant as specified by [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (default), 2 = `Microsoft`. [`(U)Int*`](/sql-reference/data-types/int-uint)


**Returned value**

Returns a binary representation of the UUID. [`FixedString(16)`](/sql-reference/data-types/fixedstring)

**Examples**

**Usage example**

```sql title=Query
SELECT
    toUUID('612f3c40-5d3b-217e-707b-6a546a3d7b29') AS uuid,
    UUIDToNum(uuid) AS bytes
```

```response title=Response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ a/<@];!~p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```

**Microsoft variant**

```sql title=Query
SELECT
    toUUID('612f3c40-5d3b-217e-707b-6a546a3d7b29') AS uuid,
    UUIDToNum(uuid, 2) AS bytes
```

```response title=Response
┌─uuid─────────────────────────────────┬─bytes────────────┐
│ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │ @</a;]~!p{jTj={) │
└──────────────────────────────────────┴──────────────────┘
```



## UUIDv7ToDateTime {#UUIDv7ToDateTime}

Introduced in: v24.5


Returns the timestamp component of a UUID version 7.
    

**Syntax**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**Arguments**

- `uuid` — A UUID version 7. [`String`](/sql-reference/data-types/string)
- `timezone` — Optional. [Timezone name](../../operations/server-configuration-parameters/settings.md#timezone) for the returned value. [`String`](/sql-reference/data-types/string)


**Returned value**

Returns a timestamp with milliseconds precision. If the UUID is not a valid version 7 UUID, it returns `1970-01-01 00:00:00.000`. [`DateTime64(3)`](/sql-reference/data-types/datetime64)

**Examples**

**Usage example**

```sql title=Query
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))
```

```response title=Response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))─┐
│                                          2024-04-22 15:30:29.048 │
└──────────────────────────────────────────────────────────────────┘
```

**With timezone**

```sql title=Query
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')
```

```response title=Response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')─┐
│                                                             2024-04-22 11:30:29.048 │
└─────────────────────────────────────────────────────────────────────────────────────┘
```



## dateTime64ToSnowflake {#dateTime64ToSnowflake}

Introduced in: v21.10


<DeprecatedBadge/>

:::warning
This function is deprecated and can only be used if setting [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) is enabled.
The function will be removed at some point in future.

Please use function [dateTime64ToSnowflakeID](#dateTime64ToSnowflakeID) instead.
:::

Converts a [DateTime64](../data-types/datetime64.md) to the first [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) at the giving time.
    

**Syntax**

```sql
dateTime64ToSnowflake(value)
```

**Arguments**

- `value` — Date with time. [`DateTime64`](/sql-reference/data-types/datetime64)


**Returned value**

Returns the input value converted as the first Snowflake ID at that time. [`Int64`](/sql-reference/data-types/int-uint)

**Examples**

**Usage example**

```sql title=Query
WITH toDateTime64('2021-08-15 18:57:56.492', 3, 'Asia/Shanghai') AS dt64 SELECT dateTime64ToSnowflake(dt64);
```

```response title=Response
┌─dateTime64ToSnowflake(dt64)─┐
│         1426860704886947840 │
└─────────────────────────────┘
```



## dateTime64ToSnowflakeID {#dateTime64ToSnowflakeID}

Introduced in: v24.6


Converts a [`DateTime64`](../data-types/datetime64.md) to the first [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) at the giving time.

See section ["Snowflake ID generation"](#snowflake-id-generation) for implementation details.
    

**Syntax**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**Arguments**

- `value` — Date with time. [`DateTime`](/sql-reference/data-types/datetime) or [`DateTime64`](/sql-reference/data-types/datetime64)
- `epoch` — Epoch of the Snowflake ID in milliseconds since 1970-01-01. Defaults to 0 (1970-01-01). For the Twitter/X epoch (2015-01-01), provide 1288834974657. [`UInt*`](/sql-reference/data-types/int-uint)


**Returned value**

Returns the input value as the first Snowflake ID at that time. [`UInt64`](/sql-reference/data-types/int-uint)

**Examples**

**Usage example**

```sql title=Query
SELECT toDateTime64('2025-08-15 18:57:56.493', 3, 'Asia/Shanghai') AS dt, dateTime64ToSnowflakeID(dt) AS res;
```

```response title=Response
┌──────────────────────dt─┬─────────────────res─┐
│ 2025-08-15 18:57:56.493 │ 7362075066076495872 │
└─────────────────────────┴─────────────────────┘
```



## dateTimeToSnowflake {#dateTimeToSnowflake}

Introduced in: v21.10



<DeprecatedBadge/>

:::warning
This function is deprecated and can only be used if setting [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) is enabled.
The function will be removed at some point in future.

Please use function [dateTimeToSnowflakeID](#dateTimeToSnowflakeID) instead.
:::

Converts a [DateTime](../data-types/datetime.md) value to the first [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) at the giving time.
    

**Syntax**

```sql
dateTimeToSnowflake(value)
```

**Arguments**

- `value` — Date with time. [`DateTime`](/sql-reference/data-types/datetime)


**Returned value**

Returns the input value as the first Snowflake ID at that time. [`Int64`](/sql-reference/data-types/int-uint)

**Examples**

**Usage example**

```sql title=Query
WITH toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt SELECT dateTimeToSnowflake(dt);
```

```response title=Response
┌─dateTimeToSnowflake(dt)─┐
│     1426860702823350272 │
└─────────────────────────┘
```



## dateTimeToSnowflakeID {#dateTimeToSnowflakeID}

Introduced in: v24.6


Converts a [DateTime](../data-types/datetime.md) value to the first [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) at the giving time.
    

**Syntax**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**Arguments**

- `value` — Date with time. [`DateTime`](/sql-reference/data-types/datetime) or [`DateTime64`](/sql-reference/data-types/datetime64)
- `epoch` — Optional. Epoch of the Snowflake ID in milliseconds since 1970-01-01. Defaults to 0 (1970-01-01). For the Twitter/X epoch (2015-01-01), provide 1288834974657. [`UInt*`](/sql-reference/data-types/int-uint)


**Returned value**

Returns the input value as the first Snowflake ID at that time. [`UInt64`](/sql-reference/data-types/int-uint)

**Examples**

**Usage example**

```sql title=Query
SELECT toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt, dateTimeToSnowflakeID(dt) AS res;
```

```response title=Response
┌──────────────────dt─┬─────────────────res─┐
│ 2021-08-15 18:57:56 │ 6832626392367104000 │
└─────────────────────┴─────────────────────┘
```



## dateTimeToUUIDv7 {#dateTimeToUUIDv7}

Introduced in: v25.9


Converts a [DateTime](../data-types/datetime.md) value to a [UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7) at the given time.

See section ["UUIDv7 generation"](#uuidv7-generation) for details on UUID structure, counter management, and concurrency guarantees.

:::note
As of September 2025, version 7 UUIDs are in draft status and their layout may change in future.
:::
    

**Syntax**

```sql
dateTimeToUUIDv7(value)
```

**Arguments**

- `value` — Date with time. [`DateTime`](/sql-reference/data-types/datetime)


**Returned value**

Returns a UUIDv7. [`UUID`](/sql-reference/data-types/uuid)

**Examples**

**Usage example**

```sql title=Query
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'));
```

```response title=Response
┌─dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'))─┐
│ 018f05af-f4a8-778f-beee-1bedbc95c93b                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**multiple UUIDs for the same timestamp**

```sql title=Query
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56'));
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56'));
```

```response title=Response
┌─dateTimeToUUIDv7(t⋯08-15 18:57:56'))─┐
│ 017b4b2d-7720-76ed-ae44-bbcc23a8c550 │
└──────────────────────────────────────┘
┌─dateTimeToUUIDv7(t⋯08-15 18:57:56'))─┐
│ 017b4b2d-7720-76ed-ae44-bbcf71ed0fd3 │
└──────────────────────────────────────┘
```



## generateSnowflakeID {#generateSnowflakeID}

Introduced in: v24.6


Generates a [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID).

Function `generateSnowflakeID` guarantees that the counter field within a timestamp increments monotonically across all function invocations in concurrently running threads and queries.

See section ["Snowflake ID generation"](#snowflake-id-generation) for implementation details.
    

**Syntax**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**Arguments**

- `expr` — An arbitrary [expression](/sql-reference/syntax#expressions) used to bypass [common subexpression elimination](/sql-reference/functions/overview#common-subexpression-elimination) if the function is called multiple times in a query. The value of the expression has no effect on the returned Snowflake ID. Optional. - `machine_id` — A machine ID, the lowest 10 bits are used. [Int64](../data-types/int-uint.md). Optional. 

**Returned value**

Returns the Snowflake ID. [`UInt64`](/sql-reference/data-types/int-uint)

**Examples**

**Usage example**

```sql title=Query
CREATE TABLE tab (id UInt64)
ENGINE = MergeTree()
ORDER BY tuple();

INSERT INTO tab SELECT generateSnowflakeID();

SELECT * FROM tab;
```

```response title=Response
┌──────────────────id─┐
│ 7199081390080409600 │
└─────────────────────┘
```

**Multiple Snowflake IDs generated per row**

```sql title=Query
SELECT generateSnowflakeID(1), generateSnowflakeID(2);
```

```response title=Response
┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**With expression and a machine ID**

```sql title=Query
SELECT generateSnowflakeID('expr', 1);
```

```response title=Response
┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```



## generateUUIDv4 {#generateUUIDv4}

Introduced in: v1.1

Generates a [version 4](https://tools.ietf.org/html/rfc4122#section-4.4) [UUID](../data-types/uuid.md).

**Syntax**

```sql
generateUUIDv4([expr])
```

**Arguments**

- `expr` — Optional. An arbitrary expression used to bypass [common subexpression elimination](/sql-reference/functions/overview#common-subexpression-elimination) if the function is called multiple times in a query. The value of the expression has no effect on the returned UUID. 

**Returned value**

Returns a UUIDv4. [`UUID`](/sql-reference/data-types/uuid)

**Examples**

**Usage example**

```sql title=Query
SELECT generateUUIDv4(number) FROM numbers(3);
```

```response title=Response
┌─generateUUIDv4(number)───────────────┐
│ fcf19b77-a610-42c5-b3f5-a13c122f65b6 │
│ 07700d36-cb6b-4189-af1d-0972f23dc3bc │
│ 68838947-1583-48b0-b9b7-cf8268dd343d │
└──────────────────────────────────────┘
```

**Common subexpression elimination**

```sql title=Query
SELECT generateUUIDv4(1), generateUUIDv4(1);
```

```response title=Response
┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```



## generateUUIDv7 {#generateUUIDv7}

Introduced in: v24.5


Generates a [version 7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04) [UUID](../data-types/uuid.md).

See section ["UUIDv7 generation"](#uuidv7-generation) for details on UUID structure, counter management, and concurrency guarantees.

:::note
As of September 2025, version 7 UUIDs are in draft status and their layout may change in future.
:::
    

**Syntax**

```sql
generateUUIDv7([expr])
```

**Arguments**

- `expr` — Optional. An arbitrary expression used to bypass [common subexpression elimination](/sql-reference/functions/overview#common-subexpression-elimination) if the function is called multiple times in a query. The value of the expression has no effect on the returned UUID. [`Any`](/sql-reference/data-types)


**Returned value**

Returns a UUIDv7. [`UUID`](/sql-reference/data-types/uuid)

**Examples**

**Usage example**

```sql title=Query
SELECT generateUUIDv7(number) FROM numbers(3);
```

```response title=Response
┌─generateUUIDv7(number)───────────────┐
│ 019947fb-5766-7ed0-b021-d906f8f7cebb │
│ 019947fb-5766-7ed0-b021-d9072d0d1e07 │
│ 019947fb-5766-7ed0-b021-d908dca2cf63 │
└──────────────────────────────────────┘
```

**Common subexpression elimination**

```sql title=Query
SELECT generateUUIDv7(1), generateUUIDv7(1);
```

```response title=Response
┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(1)────────────────────┐
│ 019947ff-0f87-7d88-ace0-8b5b3a66e0c1 │ 019947ff-0f87-7d88-ace0-8b5b3a66e0c1 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```



## readWKTLineString {#readWKTLineString}

Introduced in: v


Parses a Well-Known Text (WKT) representation of a LineString geometry and returns it in the internal ClickHouse format.


**Syntax**

```sql
readWKTLineString(wkt_string)
```

**Arguments**

- `wkt_string` — The input WKT string representing a LineString geometry. [`String`](/sql-reference/data-types/string)


**Returned value**

The function returns a ClickHouse internal representation of the linestring geometry.

**Examples**

**first call**

```sql title=Query
SELECT readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)');
```

```response title=Response
┌─readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)')─┐
│ [(1,1),(2,2),(3,3),(1,1)]                            │
└──────────────────────────────────────────────────────┘
```

**second call**

```sql title=Query
SELECT toTypeName(readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)'));
```

```response title=Response
┌─toTypeName(readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)'))─┐
│ LineString                                                       │
└──────────────────────────────────────────────────────────────────┘
```



## snowflakeIDToDateTime {#snowflakeIDToDateTime}

Introduced in: v24.6


Returns the timestamp component of a [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) as a value of type [DateTime](../data-types/datetime.md).
    

**Syntax**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**Arguments**

- `value` — Snowflake ID. [`UInt64`](/sql-reference/data-types/int-uint)
- `epoch` — Optional. Epoch of the Snowflake ID in milliseconds since 1970-01-01. Defaults to 0 (1970-01-01). For the Twitter/X epoch (2015-01-01), provide 1288834974657. [`UInt*`](/sql-reference/data-types/int-uint)
- `time_zone` — Optional. [Timezone](/operations/server-configuration-parameters/settings.md#timezone). The function parses `time_string` according to the timezone. [`String`](/sql-reference/data-types/string)


**Returned value**

Returns the timestamp component of `value`. [`DateTime`](/sql-reference/data-types/datetime)

**Examples**

**Usage example**

```sql title=Query
SELECT snowflakeIDToDateTime(7204436857747984384) AS res
```

```response title=Response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```



## snowflakeIDToDateTime64 {#snowflakeIDToDateTime64}

Introduced in: v24.6


Returns the timestamp component of a [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) as a value of type [DateTime64](../data-types/datetime64.md).
    

**Syntax**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**Arguments**

- `value` — Snowflake ID. [`UInt64`](/sql-reference/data-types/int-uint)
- `epoch` — Optional. Epoch of the Snowflake ID in milliseconds since 1970-01-01. Defaults to 0 (1970-01-01). For the Twitter/X epoch (2015-01-01), provide 1288834974657. [`UInt*`](/sql-reference/data-types/int-uint)
- `time_zone` — Optional. [Timezone](/operations/server-configuration-parameters/settings.md#timezone). The function parses `time_string` according to the timezone. [`String`](/sql-reference/data-types/string)


**Returned value**

Returns the timestamp component of `value` as a `DateTime64` with scale = 3, i.e. millisecond precision. [`DateTime64`](/sql-reference/data-types/datetime64)

**Examples**

**Usage example**

```sql title=Query
SELECT snowflakeIDToDateTime64(7204436857747984384) AS res
```

```response title=Response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```



## snowflakeToDateTime {#snowflakeToDateTime}

Introduced in: v21.10


<DeprecatedBadge/>

:::warning
This function is deprecated and can only be used if setting [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) is enabled.
The function will be removed at some point in future.

Please use function [`snowflakeIDToDateTime`](#snowflakeIDToDateTime) instead.
:::

Extracts the timestamp component of a [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) in [DateTime](../data-types/datetime.md) format.
    

**Syntax**

```sql
snowflakeToDateTime(value[, time_zone])
```

**Arguments**

- `value` — Snowflake ID. [`Int64`](/sql-reference/data-types/int-uint)
- `time_zone` — Optional. [Timezone](/operations/server-configuration-parameters/settings.md#timezone). The function parses `time_string` according to the timezone. [`String`](/sql-reference/data-types/string)


**Returned value**

Returns the timestamp component of `value`. [`DateTime`](/sql-reference/data-types/datetime)

**Examples**

**Usage example**

```sql title=Query
SELECT snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC');
```

```response title=Response
┌─snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC')─┐
│                                              2021-08-15 10:57:56 │
└──────────────────────────────────────────────────────────────────┘
```



## snowflakeToDateTime64 {#snowflakeToDateTime64}

Introduced in: v21.10


<DeprecatedBadge/>

:::warning
This function is deprecated and can only be used if setting [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions) is enabled.
The function will be removed at some point in future.

Please use function [`snowflakeIDToDateTime64`](#snowflakeIDToDateTime64) instead.
:::

Extracts the timestamp component of a [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) in [DateTime64](../data-types/datetime64.md) format.

    

**Syntax**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**Arguments**

- `value` — Snowflake ID. [`Int64`](/sql-reference/data-types/int-uint)
- `time_zone` — Optional. [Timezone](/operations/server-configuration-parameters/settings.md#timezone). The function parses `time_string` according to the timezone. [`String`](/sql-reference/data-types/string)


**Returned value**

Returns the timestamp component of `value`. [`DateTime64(3)`](/sql-reference/data-types/datetime64)

**Examples**

**Usage example**

```sql title=Query
SELECT snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC');
```

```response title=Response
┌─snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC')─┐
│                                            2021-08-15 10:58:19.841 │
└────────────────────────────────────────────────────────────────────┘
```



## toUUIDOrDefault {#toUUIDOrDefault}

Introduced in: v21.1


Converts a String value to UUID type. If the conversion fails, returns a default UUID value instead of throwing an error.

This function attempts to parse a string of 36 characters in the standard UUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).
If the string cannot be converted to a valid UUID, the function returns the provided default UUID value.
    

**Syntax**

```sql
toUUIDOrDefault(string, default)
```

**Arguments**

- `string` — String of 36 characters or FixedString(36) to be converted to UUID. - `default` — UUID value to be returned if the first argument cannot be converted to UUID type. 

**Returned value**

Returns the converted UUID if successful, or the default UUID if conversion fails. [`UUID`](/sql-reference/data-types/uuid)

**Examples**

**Successful conversion returns the parsed UUID**

```sql title=Query
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'));
```

```response title=Response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                     │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Failed conversion returns the default UUID**

```sql title=Query
SELECT toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'));
```

```response title=Response
┌─toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'))─┐
│ 59f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```



## toUUIDOrNull {#toUUIDOrNull}

Introduced in: v20.12


Converts an input value to a value of type `UUID` but returns `NULL` in case of an error.
Like [`toUUID`](#touuid) but returns `NULL` instead of throwing an exception on conversion errors.

Supported arguments:
- String representations of UUID in standard format (8-4-4-4-12 hexadecimal digits).
- String representations of UUID without hyphens (32 hexadecimal digits).

Unsupported arguments (return `NULL`):
- Invalid string formats.
- Non-string types.
- Malformed UUIDs.
    

**Syntax**

```sql
toUUIDOrNull(x)
```

**Arguments**

- `x` — A string representation of a UUID. [`String`](/sql-reference/data-types/string)


**Returned value**

Returns a UUID value if successful, otherwise `NULL`. [`UUID`](/sql-reference/data-types/uuid) or [`NULL`](/sql-reference/syntax#null)

**Examples**

**Usage examples**

```sql title=Query
SELECT
    toUUIDOrNull('550e8400-e29b-41d4-a716-446655440000') AS valid_uuid,
    toUUIDOrNull('invalid-uuid') AS invalid_uuid
```

```response title=Response
┌─valid_uuid───────────────────────────┬─invalid_uuid─┐
│ 550e8400-e29b-41d4-a716-446655440000 │         ᴺᵁᴸᴸ │
└──────────────────────────────────────┴──────────────┘
```

{/*AUTOGENERATED_END*/ }
