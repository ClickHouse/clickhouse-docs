---
description: 'Справочник функций для работы с UUID'
sidebar_label: 'UUID'
slug: /sql-reference/functions/uuid-functions
title: 'Функции для работы с UUID'
doc_type: 'reference'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';

# Функции для работы с UUID {#functions-for-working-with-uuids}

## Генерация UUIDv7 {#uuidv7-generation}

Сгенерированный UUID содержит 48-битный временной штамп в миллисекундах Unix, за которым следуют версия «7» (4 бита), счётчик (42 бита) для различения UUID в пределах одной миллисекунды (включая поле варианта «2», 2 бита) и случайное поле (32 бита).
Для любого заданного временного штампа (`unix_ts_ms`) счётчик начинается со случайного значения и увеличивается на 1 для каждого нового UUID до тех пор, пока временной штамп не изменится. В случае переполнения счётчика поле временного штампа увеличивается на 1, а счётчик сбрасывается на новое случайное начальное значение.
Функции генерации UUID гарантируют, что поле счётчика в рамках одного временного штампа монотонно возрастает во всех вызовах функций в параллельно выполняющихся потоках и запросах.

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

Сгенерированный Snowflake ID содержит текущую метку времени Unix в миллисекундах (41 + 1 старший нулевой бит), затем идентификатор машины (10 бит) и счётчик (12 бит) для различения идентификаторов в пределах одной миллисекунды. Для любой заданной метки времени (`unix_ts_ms`) счётчик начинается с 0 и увеличивается на 1 для каждого нового Snowflake ID до тех пор, пока метка времени не изменится. В случае переполнения счётчика поле метки времени увеличивается на 1, а счётчик обнуляется.

:::note
Сгенерированные Snowflake ID основаны на эпохе Unix 1970-01-01. Хотя не существует стандарта или рекомендаций для эпохи Snowflake ID, реализации в других системах могут использовать другую эпоху, например Twitter/X (2010-11-04) или Mastodon (2015-01-01).
:::

```text
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
|0|                      временная метка                        |
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

* `expr` — Произвольное [выражение](/sql-reference/syntax#expressions), используемое для обхода механизма [устранения общих подвыражений](/sql-reference/functions/overview#common-subexpression-elimination), если функция вызывается несколько раз в запросе. Значение выражения не влияет на возвращаемый UUID. Необязательный параметр.

**Возвращаемое значение**

Значение типа UUIDv4.

**Пример**

Сначала создайте таблицу со столбцом типа UUID, затем вставьте в таблицу сгенерированный UUIDv4.

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

**Пример с несколькими UUID, генерируемыми для каждой строки**

```sql
SELECT generateUUIDv4(1), generateUUIDv4(2);

┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 8abf8c13-7dea-4fdf-af3e-0e18767770e6 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## generateUUIDv7 {#generateUUIDv7}

Генерирует [UUID версии 7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04) [UUID](../data-types/uuid.md).

См. раздел [&quot;Генерация UUIDv7&quot;](#uuidv7-generation) для подробностей о структуре UUID, управлении счётчиком и гарантиях при конкурентном доступе.

:::note
По состоянию на апрель 2024 года UUID версии 7 находятся в статусе черновика, и их формат может измениться в будущем.
:::

**Синтаксис**

```sql
generateUUIDv7([expr])
```

**Аргументы**

* `expr` — Произвольное [выражение](/sql-reference/syntax#expressions), используемое для отключения [устранения общих подвыражений](/sql-reference/functions/overview#common-subexpression-elimination), если функция вызывается несколько раз в запросе. Значение выражения не влияет на возвращаемый UUID. Необязательный параметр.

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

**Пример с несколькими UUID, создаваемыми для каждой строки**

```sql
SELECT generateUUIDv7(1), generateUUIDv7(2);

┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(2)────────────────────┐
│ 018f05c9-4ab8-7b86-b64e-c9f03fbd45d1 │ 018f05c9-4ab8-7b86-b64e-c9f12efb7e16 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## dateTimeToUUIDv7 {#datetimetouuidv7}

Преобразует значение [DateTime](../data-types/datetime.md) в [UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7) для заданного момента времени.

См. раздел [&quot;Генерация UUIDv7&quot;](#uuidv7-generation) для подробностей о структуре UUID, управлении счетчиком и гарантиях при конкурентном доступе.

:::note
По состоянию на апрель 2024 года UUID версии 7 находятся в статусе черновика, и их структура может измениться в будущем.
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

**Пример с несколькими UUID для одного и того же значения метки времени**

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

Функция гарантирует, что при нескольких вызовах с одной и той же отметкой времени генерируются уникальные, монотонно возрастающие идентификаторы UUID.

## empty {#empty}

Проверяет, является ли переданный UUID пустым.

**Синтаксис**

```sql
empty(UUID)
```

UUID считается пустым, если он состоит из одних нулей (нулевой UUID).

Функция также работает с `Array` и `String`.

**Аргументы**

* `x` — UUID. [UUID](../data-types/uuid.md).

**Возвращаемое значение**

* Возвращает `1` для пустого UUID или `0` для непустого UUID. [UInt8](../data-types/int-uint.md).

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

Проверяет, что входной UUID не является пустым.

**Синтаксис**

```sql
notEmpty(UUID)
```

UUID считается пустым, если он содержит все нули (нулевой UUID).

Функция также работает для значений типов `Array` и `String`.

**Аргументы**

* `x` — UUID. [UUID](../data-types/uuid.md).

**Возвращаемое значение**

* Возвращает `1` для непустого UUID или `0` для пустого UUID. [UInt8](../data-types/int-uint.md).

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

Преобразует значение типа `String` в UUID.

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
* `default` — UUID, который используется по умолчанию, если первый аргумент не может быть преобразован в тип UUID. [UUID](../data-types/uuid.md).

**Возвращаемое значение**

UUID

```sql
toUUIDOrDefault(string, default)
```

**Возвращаемое значение**

Значение типа UUID.

**Примеры использования**

В этом первом примере возвращается первый аргумент, преобразованный к типу UUID, поскольку его можно преобразовать:

```sql
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' AS UUID));
```

Результат:

```response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Во втором примере возвращается второй аргумент (указанный UUID по умолчанию), так как первый аргумент не может быть преобразован в тип UUID:

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

Принимает аргумент типа String и пытается преобразовать его в UUID. Если преобразование не удалось, возвращает нулевой UUID.

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

Принимает строку типа `string`, содержащую 36 символов в формате `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, и возвращает [FixedString(16)](../data-types/fixedstring.md) в виде двоичного представления, формат которого может быть дополнительно указан параметром `variant` (по умолчанию `Big-endian`).

**Синтаксис**

```sql
UUIDStringToNum(string[, variant = 1])
```

**Аргументы**

* `string` — [String](/sql-reference/data-types/string) длиной 36 символов или [FixedString](/sql-reference/data-types/string)
* `variant` — целое число, задающее вариант, определённый в [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (по умолчанию), 2 = `Microsoft`.

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

Принимает значение типа `binary`, содержащее двоичное представление UUID, с форматом, при необходимости задаваемым параметром `variant` (по умолчанию `Big-endian`), и возвращает строку длиной 36 символов в текстовом формате.

**Синтаксис**

```sql
UUIDNumToString(binary[, variant = 1])
```

**Аргументы**

* `binary` — [FixedString(16)](../data-types/fixedstring.md) в двоичном представлении UUID.
* `variant` — целое число, обозначающее вариант, как указано в [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (по умолчанию), 2 = `Microsoft`.

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

Принимает [UUID](../data-types/uuid.md) и возвращает его двоичное представление в виде значения типа [FixedString(16)](../data-types/fixedstring.md); формат можно задать параметром `variant` (по умолчанию `Big-endian`). Эта функция заменяет конструкцию `UUIDStringToNum(toString(uuid))`, поэтому для извлечения байтов из UUID не требуется промежуточное преобразование UUID в строку.

**Синтаксис**

```sql
UUIDToNum(uuid[, variant = 1])
```

**Аргументы**

* `uuid` — [UUID](../data-types/uuid.md).
* `variant` — целое число, определяющее вариант в соответствии с [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (по умолчанию), 2 = `Microsoft`.

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

Возвращает компонент временной метки UUID версии 7.

**Синтаксис**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**Аргументы**

* `uuid` — [UUID](../data-types/uuid.md) версии 7.
* `timezone` — [название часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) для возвращаемого значения (необязательный параметр). [String](../data-types/string.md).

**Возвращаемое значение**

* Метка времени с точностью до миллисекунд. Если UUID не является корректным UUID версии 7, возвращается 1970-01-01 00:00:00.000. [DateTime64(3)](../data-types/datetime64.md).

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
Эта функция гарантирует, что поле счётчика внутри метки времени монотонно возрастает во всех вызовах функции в параллельно выполняющихся потоках и запросах.

См. раздел [&quot;Snowflake ID generation&quot;](#snowflake-id-generation) для деталей реализации.

**Синтаксис**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**Аргументы**

* `expr` — Произвольное [выражение](/sql-reference/syntax#expressions), используемое для предотвращения [устранения общих подвыражений](/sql-reference/functions/overview#common-subexpression-elimination), если функция вызывается несколько раз в запросе. Значение выражения не влияет на возвращаемый Snowflake ID. Необязательный параметр.
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

**Пример с несколькими идентификаторами Snowflake, генерируемыми для каждой строки**

```sql
SELECT generateSnowflakeID(1), generateSnowflakeID(2);

┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**Пример с выражением и идентификатором машины**

```sql
SELECT generateSnowflakeID('expr', 1);

┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```

## snowflakeToDateTime {#snowflaketodatetime}

<DeprecatedBadge />

:::warning
Эта функция устарела и может использоваться только при включенной настройке [allow&#95;deprecated&#95;snowflake&#95;conversion&#95;functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions).
Функция будет удалена в какой-то момент в будущем.

Пожалуйста, используйте вместо нее функцию [snowflakeIDToDateTime](#snowflakeidtodatetime).
:::

Извлекает временную метку из [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в формате [DateTime](../data-types/datetime.md).

**Синтаксис**

```sql
snowflakeToDateTime(value[, time_zone])
```

**Аргументы**

* `value` — идентификатор Snowflake. [Int64](../data-types/int-uint.md).
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone). Функция интерпретирует `time_string` в указанном часовом поясе. Необязательный аргумент. [String](../data-types/string.md).

**Возвращаемое значение**

* Компонента метки времени из `value` в виде значения типа [DateTime](../data-types/datetime.md).

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

Извлекает компонент временной метки из [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в формате [DateTime64](../data-types/datetime64.md).

**Синтаксис**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**Аргументы**

* `value` — Snowflake ID. [Int64](../data-types/int-uint.md).
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone). Функция разбирает `time_string` в соответствии с часовым поясом. Необязательный параметр. [String](../data-types/string.md).

**Возвращаемое значение**

* Компонент временной метки из `value` в виде [DateTime64](../data-types/datetime64.md) с масштабом 3, то есть с точностью до миллисекунд.

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
Эта функция устарела и может использоваться только при включённой настройке [allow&#95;deprecated&#95;snowflake&#95;conversion&#95;functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions).
Функция будет удалена в будущем.

Используйте вместо неё функцию [dateTimeToSnowflakeID](#datetimetosnowflakeid).
:::

Преобразует значение [DateTime](../data-types/datetime.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в указанный момент времени.

**Синтаксис**

```sql
dateTimeToSnowflake(value)
```

**Аргументы**

* `value` — дата со временем. [DateTime](../data-types/datetime.md).

**Возвращаемое значение**

* Входное значение, приведённое к типу данных [Int64](../data-types/int-uint.md) как первый Snowflake ID для этого момента времени.

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
Эта функция устаревшая и может использоваться только если включена настройка [allow&#95;deprecated&#95;snowflake&#95;conversion&#95;functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions).
Функция будет удалена в будущем.

Используйте вместо неё функцию [dateTime64ToSnowflakeID](#datetime64tosnowflakeid).
:::

Преобразует [DateTime64](../data-types/datetime64.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в заданный момент времени.

**Синтаксис**

```sql
dateTime64ToSnowflake(value)
```

**Аргументы**

* `value` — дата и время. [DateTime64](../data-types/datetime64.md).

**Возвращаемое значение**

* Входное значение, преобразованное к типу данных [Int64](../data-types/int-uint.md) в виде первого Snowflake ID для этого момента времени.

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

Возвращает компонент метки времени идентификатора [Snowflake](https://en.wikipedia.org/wiki/Snowflake_ID) в виде значения типа [DateTime](../data-types/datetime.md).

**Синтаксис**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**Аргументы**

* `value` — Snowflake ID. [UInt64](../data-types/int-uint.md).
* `epoch` — эпоха Snowflake ID в миллисекундах, отсчитываемых с 1970-01-01. По умолчанию — 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. Необязательный параметр. [UInt*](../data-types/int-uint.md).
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

* `value` — Snowflake ID. [UInt64](../data-types/int-uint.md).
* `epoch` — эпоха Snowflake ID в миллисекундах, отсчитываемых с 1970-01-01. По умолчанию — 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. Необязательный параметр. [UInt*](../data-types/int-uint.md).
* `time_zone` — [Timezone](/operations/server-configuration-parameters/settings.md#timezone). Функция разбирает `time_string` в соответствии с часовым поясом. Необязательный параметр. [String](../data-types/string.md).

**Возвращаемое значение**

* Компонент метки времени из `value` как [DateTime64](../data-types/datetime64.md) с масштабом 3, то есть с миллисекундной точностью.

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
* `epoch` — эпоха идентификаторов Snowflake в миллисекундах, отсчитываемых с 1970-01-01. По умолчанию 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. Необязательный параметр. [UInt*](../data-types/int-uint.md).

**Возвращаемое значение**

* Входное значение, преобразованное в [UInt64](../data-types/int-uint.md) — первый Snowflake ID для данного момента времени.

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

Преобразует [DateTime64](../data-types/datetime64.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) для заданного момента времени.

**Синтаксис**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**Аргументы**

* `value` — дата со временем. [DateTime64](../data-types/datetime64.md).
* `epoch` — эпоха Snowflake ID в миллисекундах, прошедших с 1970-01-01. По умолчанию — 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. Необязательный параметр. [UInt*](../data-types/int-uint.md).

**Возвращаемое значение**

* Входное значение, преобразованное в [UInt64](../data-types/int-uint.md) в виде первого Snowflake ID в этот момент времени.

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

* [dictGetUUID](/sql-reference/functions/ext-dict-functions#other-functions)

{/*
  Содержимое следующих тегов заменяется при сборке фреймворка документации
  документацией, сгенерированной из system.functions. Пожалуйста, не изменяйте и не удаляйте эти теги.
  См.: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

## UUIDNumToString {#UUIDNumToString}

Добавлена в: v1.1

Принимает двоичное представление UUID, формат которого можно задать параметром `variant` (по умолчанию — `Big-endian`), и возвращает строку из 36 символов в текстовом формате.

**Синтаксис**

```sql
UUIDNumToString(binary[, variant])
```

**Аргументы**

* `binary` — Двоичное представление UUID. [`FixedString(16)`](/sql-reference/data-types/fixedstring)
* `variant` — Вариант, определённый в [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (по умолчанию), 2 = `Microsoft`. [`(U)Int*`](/sql-reference/data-types/int-uint)

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

**Вариант для Microsoft**

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

Впервые появилась в: v1.1

Принимает строку длиной 36 символов в формате `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` и возвращает [FixedString(16)](../data-types/fixedstring.md) в виде её двоичного представления; формат представления может быть дополнительно указан с помощью параметра `variant` (по умолчанию `Big-endian`).

**Синтаксис**

```sql
UUIDStringToNum(string[, variant = 1])
```

**Аргументы**

* `string` — Строка или фиксированная строка длиной 36 символов [`String`](/sql-reference/data-types/string) или [`FixedString(36)`](/sql-reference/data-types/fixedstring)
* `variant` — Вариант в формате, определённом в [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (по умолчанию), 2 = `Microsoft`. [`(U)Int*`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает двоичное представление `string`. [`FixedString(16)`](/sql-reference/data-types/fixedstring)

**Примеры**

**Пример использования**

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

**Вариант Microsoft**

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

Добавлена в версии: v24.5

Принимает [UUID](../data-types/uuid.md) и возвращает его двоичное представление в виде [FixedString(16)](../data-types/fixedstring.md), при этом формат может быть указан параметром `variant` (по умолчанию `Big-endian`).
Эта функция заменяет вызов цепочки функций `UUIDStringToNum(toString(uuid))`, поэтому для извлечения байтов из UUID не требуется промежуточное преобразование UUID в строку.

**Синтаксис**

```sql
UUIDToNum(uuid[, variant = 1])
```

**Аргументы**

* `uuid` — UUID. [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)
* `variant` — вариант, определенный в [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1): 1 = `Big-endian` (по умолчанию), 2 = `Microsoft`. [`(U)Int*`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает двоичное представление UUID. [`FixedString(16)`](/sql-reference/data-types/fixedstring)

**Примеры**

**Пример использования**

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

**Вариант Microsoft**

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

Добавлена в: v24.5

Возвращает компонент временной метки UUID версии 7.

**Синтаксис**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**Аргументы**

* `uuid` — UUID версии 7. [`String`](/sql-reference/data-types/string)
* `timezone` — Необязательный параметр. [Название временной зоны](../../operations/server-configuration-parameters/settings.md#timezone) для возвращаемого значения. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает метку времени с точностью до миллисекунд. Если UUID не является допустимым UUID версии 7, возвращается `1970-01-01 00:00:00.000`. [`DateTime64(3)`](/sql-reference/data-types/datetime64)

**Примеры**

**Пример использования**

```sql title=Query
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))
```

```response title=Response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))─┐
│                                          2024-04-22 15:30:29.048 │
└──────────────────────────────────────────────────────────────────┘
```

**С указанием часового пояса**

```sql title=Query
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')
```

```response title=Response
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')─┐
│                                                             2024-04-22 11:30:29.048 │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## dateTime64ToSnowflake {#dateTime64ToSnowflake}

Впервые представлена в: v21.10

<DeprecatedBadge />

:::warning
Эта функция устарела и может использоваться только в том случае, если включена настройка [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions).
Функция будет удалена в одной из будущих версий.

Используйте функцию [dateTime64ToSnowflakeID](#dateTime64ToSnowflakeID) вместо неё.
:::

Преобразует [DateTime64](../data-types/datetime64.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в заданный момент времени.

**Синтаксис**

```sql
dateTime64ToSnowflake(value)
```

**Аргументы**

* `value` — дата и время. [`DateTime64`](/sql-reference/data-types/datetime64)

**Возвращаемое значение**

Возвращает переданное значение, преобразованное в первый Snowflake ID для этого момента времени. [`Int64`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
WITH toDateTime64('2021-08-15 18:57:56.492', 3, 'Asia/Shanghai') AS dt64 SELECT dateTime64ToSnowflake(dt64);
```

```response title=Response
┌─dateTime64ToSnowflake(dt64)─┐
│         1426860704886947840 │
└─────────────────────────────┘
```

## dateTime64ToSnowflakeID {#dateTime64ToSnowflakeID}

Введено в версии: v24.6

Преобразует [`DateTime64`](../data-types/datetime64.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) для заданного времени.

Подробности реализации см. в разделе [&quot;Генерация Snowflake ID&quot;](#snowflake-id-generation).

**Синтаксис**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**Аргументы**

* `value` — дата и время. [`DateTime`](/sql-reference/data-types/datetime) или [`DateTime64`](/sql-reference/data-types/datetime64)
* `epoch` — эпоха для Snowflake ID в миллисекундах с 1970-01-01. По умолчанию — 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. [`UInt*`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает первый Snowflake ID, соответствующий этому моменту времени. [`UInt64`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toDateTime64('2025-08-15 18:57:56.493', 3, 'Asia/Shanghai') AS dt, dateTime64ToSnowflakeID(dt) AS res;
```

```response title=Response
┌──────────────────────dt─┬─────────────────res─┐
│ 2025-08-15 18:57:56.493 │ 7362075066076495872 │
└─────────────────────────┴─────────────────────┘
```

## dateTimeToSnowflake {#dateTimeToSnowflake}

Появилась в версии: v21.10

<DeprecatedBadge />

:::warning
Эта функция устарела и может использоваться только в том случае, если включена настройка [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions).
Функция будет удалена в одной из будущих версий.

Используйте вместо неё функцию [dateTimeToSnowflakeID](#dateTimeToSnowflakeID).
:::

Преобразует значение [DateTime](../data-types/datetime.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) для указанного момента времени.

**Синтаксис**

```sql
dateTimeToSnowflake(value)
```

**Аргументы**

* `value` — дата и время. [`DateTime`](/sql-reference/data-types/datetime)

**Возвращаемое значение**

Возвращает переданное значение в виде первого идентификатора Snowflake в этот момент времени. [`Int64`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
WITH toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt SELECT dateTimeToSnowflake(dt);
```

```response title=Response
┌─dateTimeToSnowflake(dt)─┐
│     1426860702823350272 │
└─────────────────────────┘
```

## dateTimeToSnowflakeID {#dateTimeToSnowflakeID}

Добавлено в версии v24.6

Преобразует значение [DateTime](../data-types/datetime.md) в первый идентификатор [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) для заданного момента времени.

**Синтаксис**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**Аргументы**

* `value` — Дата и время. [`DateTime`](/sql-reference/data-types/datetime) или [`DateTime64`](/sql-reference/data-types/datetime64)
* `epoch` — Необязательный параметр. Эпоха Snowflake ID в миллисекундах, отсчитываемых с 1970-01-01. По умолчанию — 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. [`UInt*`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает входное значение в виде первого возможного Snowflake ID для этого момента времени. [`UInt64`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt, dateTimeToSnowflakeID(dt) AS res;
```

```response title=Response
┌──────────────────dt─┬─────────────────res─┐
│ 2021-08-15 18:57:56 │ 6832626392367104000 │
└─────────────────────┴─────────────────────┘
```

## dateTimeToUUIDv7 {#dateTimeToUUIDv7}

Добавлено в: v25.9

Преобразует значение [DateTime](../data-types/datetime.md) в [UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7) для заданного момента времени.

См. раздел [&quot;Генерация UUIDv7&quot;](#uuidv7-generation) для подробной информации о структуре UUID, управлении счётчиком и гарантиях при параллельной работе.

:::note
По состоянию на сентябрь 2025 года UUID версии 7 находятся в статусе черновика, и их формат может измениться в будущем.
:::

**Синтаксис**

```sql
dateTimeToUUIDv7(value)
```

**Аргументы**

* `value` — Дата и время. [`DateTime`](/sql-reference/data-types/datetime)

**Возвращаемое значение**

Возвращает UUIDv7. [`UUID`](/sql-reference/data-types/uuid)

**Примеры**

**Пример использования**

```sql title=Query
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'));
```

```response title=Response
┌─dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'))─┐
│ 018f05af-f4a8-778f-beee-1bedbc95c93b                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**несколько UUID для одной и той же метки времени**

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

Добавлена в версии: v24.6

Генерирует [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID).

Функция `generateSnowflakeID` гарантирует, что счётчик внутри метки времени монотонно увеличивается при всех вызовах функции в параллельно выполняющихся потоках и запросах.

См. раздел «[Генерация Snowflake ID](#snowflake-id-generation)» для подробностей реализации.

**Синтаксис**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**Аргументы**

* `expr` — Произвольное [выражение](/sql-reference/syntax#expressions), используемое для обхода [устранения общих подвыражений](/sql-reference/functions/overview#common-subexpression-elimination), если функция вызывается несколько раз в запросе. Значение выражения не влияет на возвращаемый идентификатор Snowflake. Необязательный.
* `machine_id` — Идентификатор машины, используются младшие 10 бит. [Int64](../data-types/int-uint.md). Необязательный.

**Возвращаемое значение**

Возвращает идентификатор Snowflake. [`UInt64`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

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

**Несколько идентификаторов Snowflake, сгенерированных для одной строки**

```sql title=Query
SELECT generateSnowflakeID(1), generateSnowflakeID(2);
```

```response title=Response
┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**С выражением и идентификатором машины**

```sql title=Query
SELECT generateSnowflakeID('expr', 1);
```

```response title=Response
┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```

## generateUUIDv4 {#generateUUIDv4}

Добавлена в версии: v1.1

Генерирует [UUID](../data-types/uuid.md) [версии 4](https://tools.ietf.org/html/rfc4122#section-4.4).

**Синтаксис**

```sql
generateUUIDv4([expr])
```

**Аргументы**

* `expr` — Необязательный параметр. Произвольное выражение, используемое для обхода оптимизации [устранения общих подвыражений](/sql-reference/functions/overview#common-subexpression-elimination), если функция вызывается несколько раз в запросе. Значение выражения не влияет на возвращаемый UUID.

**Возвращаемое значение**

Возвращает UUIDv4. [`UUID`](/sql-reference/data-types/uuid)

**Примеры**

**Пример использования**

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

**Устранение общих подвыражений**

```sql title=Query
SELECT generateUUIDv4(1), generateUUIDv4(1);
```

```response title=Response
┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## generateUUIDv7 {#generateUUIDv7}

Добавлена в версии v24.5

Генерирует [UUID](../data-types/uuid.md) [версии 7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04).

См. раздел [&quot;Генерация UUIDv7&quot;](#uuidv7-generation) для получения подробной информации о структуре UUID, управлении счётчиком и гарантиях при параллельном доступе.

:::note
По состоянию на сентябрь 2025 года UUID версии 7 находятся в статусе черновика, и их формат может измениться в будущем.
:::

**Синтаксис**

```sql
generateUUIDv7([expr])
```

**Аргументы**

* `expr` — необязательное произвольное выражение, используемое для обхода [устранения общих подвыражений](/sql-reference/functions/overview#common-subexpression-elimination), если функция вызывается несколько раз в запросе. Значение выражения не влияет на возвращаемый UUID. [`Any`](/sql-reference/data-types)

**Возвращаемое значение**

Возвращает UUIDv7. [`UUID`](/sql-reference/data-types/uuid)

**Примеры**

**Пример использования**

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

**Устранение общих подвыражений**

```sql title=Query
SELECT generateUUIDv7(1), generateUUIDv7(1);
```

```response title=Response
┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(1)────────────────────┐
│ 019947ff-0f87-7d88-ace0-8b5b3a66e0c1 │ 019947ff-0f87-7d88-ace0-8b5b3a66e0c1 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

## readWKTLineString {#readWKTLineString}

Добавлена в: v

Разбирает представление геометрии типа LineString в формате Well-Known Text (WKT) и возвращает результат во внутреннем формате ClickHouse.

**Синтаксис**

```sql
readWKTLineString(wkt_string)
```

**Аргументы**

* `wkt_string` — входная строка WKT, представляющая геометрию типа LineString. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Функция возвращает внутреннее представление геометрии LineString в ClickHouse.

**Примеры**

**первый вызов**

```sql title=Query
SELECT readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)');
```

```response title=Response
┌─readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)')─┐
│ [(1,1),(2,2),(3,3),(1,1)]                            │
└──────────────────────────────────────────────────────┘
```

**второй вызов**

```sql title=Query
SELECT toTypeName(readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)'));
```

```response title=Response
┌─toTypeName(readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)'))─┐
│ LineString                                                       │
└──────────────────────────────────────────────────────────────────┘
```

## snowflakeIDToDateTime {#snowflakeIDToDateTime}

Введена в: v24.6

Возвращает компонент временной метки [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в виде значения типа [DateTime](../data-types/datetime.md).

**Синтаксис**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**Аргументы**

* `value` — Snowflake ID. [`UInt64`](/sql-reference/data-types/int-uint)
* `epoch` — Необязательный параметр. Эпоха Snowflake ID в миллисекундах, отсчитываемых с 1970-01-01. По умолчанию — 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. [`UInt*`](/sql-reference/data-types/int-uint)
* `time_zone` — Необязательный параметр. [Часовой пояс](/operations/server-configuration-parameters/settings.md#timezone). Функция интерпретирует `time_string` в соответствии с часовым поясом. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает временную компоненту значения `value`. [`DateTime`](/sql-reference/data-types/datetime)

**Примеры**

**Пример использования**

```sql title=Query
SELECT snowflakeIDToDateTime(7204436857747984384) AS res
```

```response title=Response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```

## snowflakeIDToDateTime64 {#snowflakeIDToDateTime64}

Добавлена в версии: v24.6

Возвращает компонент метки времени [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в виде значения типа [DateTime64](../data-types/datetime64.md).

**Синтаксис**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**Аргументы**

* `value` — идентификатор Snowflake. [`UInt64`](/sql-reference/data-types/int-uint)
* `epoch` — необязательный параметр. Эпоха идентификатора Snowflake в миллисекундах, отсчитываемых с 1970-01-01. По умолчанию — 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. [`UInt*`](/sql-reference/data-types/int-uint)
* `time_zone` — необязательный параметр. [Часовой пояс](/operations/server-configuration-parameters/settings.md#timezone). Функция интерпретирует `time_string` в соответствии с указанным часовым поясом. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает компонент метки времени из `value` в виде `DateTime64` с масштабом = 3, то есть с миллисекундной точностью. [`DateTime64`](/sql-reference/data-types/datetime64)

**Примеры**

**Пример использования**

```sql title=Query
SELECT snowflakeIDToDateTime64(7204436857747984384) AS res
```

```response title=Response
┌─────────────────res─┐
│ 2024-06-06 10:59:58 │
└─────────────────────┘
```

## snowflakeToDateTime {#snowflakeToDateTime}

Введена в: v21.10

<DeprecatedBadge />

:::warning
Эта функция устарела и может использоваться только в том случае, если включена настройка [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions).
Функция будет удалена в одной из будущих версий.

Используйте вместо неё функцию [`snowflakeIDToDateTime`](#snowflakeIDToDateTime).
:::

Извлекает компонент временной метки из [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в формате [DateTime](../data-types/datetime.md).

**Синтаксис**

```sql
snowflakeToDateTime(value[, time_zone])
```

**Аргументы**

* `value` — Snowflake ID. [`Int64`](/sql-reference/data-types/int-uint)
* `time_zone` — необязательный параметр. [Часовой пояс](/operations/server-configuration-parameters/settings.md#timezone). Функция интерпретирует `time_string` в соответствии с часовым поясом. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает компонент метки времени значения `value`. [`DateTime`](/sql-reference/data-types/datetime)

**Примеры**

**Пример использования**

```sql title=Query
SELECT snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC');
```

```response title=Response
┌─snowflakeToDateTime(CAST('1426860702823350272', 'Int64'), 'UTC')─┐
│                                              2021-08-15 10:57:56 │
└──────────────────────────────────────────────────────────────────┘
```

## snowflakeToDateTime64 {#snowflakeToDateTime64}

Впервые появилась в версии v21.10

<DeprecatedBadge />

:::warning
Эта функция устарела и может использоваться только в случае, если включена настройка [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions).
Функция будет удалена в одной из будущих версий.

Используйте вместо неё функцию [`snowflakeIDToDateTime64`](#snowflakeIDToDateTime64).
:::

Извлекает компонент метки времени из [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в формате [DateTime64](../data-types/datetime64.md).

**Синтаксис**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**Аргументы**

* `value` — Snowflake ID. [`Int64`](/sql-reference/data-types/int-uint)
* `time_zone` — необязательный аргумент. [Timezone](/operations/server-configuration-parameters/settings.md#timezone). Функция разбирает `time_string` в соответствии с часовым поясом. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает компонент временной метки из `value`. [`DateTime64(3)`](/sql-reference/data-types/datetime64)

**Примеры**

**Пример использования**

```sql title=Query
SELECT snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC');
```

```response title=Response
┌─snowflakeToDateTime64(CAST('1426860802823350272', 'Int64'), 'UTC')─┐
│                                            2021-08-15 10:58:19.841 │
└────────────────────────────────────────────────────────────────────┘
```

## toUUIDOrDefault {#toUUIDOrDefault}

Появилась в версии: v21.1

Преобразует значение типа String в тип UUID. Если преобразование не удалось, возвращает значение UUID по умолчанию вместо генерации ошибки.

Эта функция пытается разобрать строку длиной 36 символов в стандартном формате UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).
Если строку нельзя преобразовать в корректный UUID, функция возвращает переданное значение UUID по умолчанию.

**Синтаксис**

```sql
toUUIDOrDefault(string, default)
```

**Аргументы**

* `string` — строка из 36 символов или FixedString(36), которая будет преобразована в UUID.
* `default` — значение UUID, которое будет возвращено, если первый аргумент нельзя преобразовать к типу UUID.

**Возвращаемое значение**

Возвращает преобразованный UUID при успешном выполнении или значение UUID по умолчанию, если преобразование не удалось. [`UUID`](/sql-reference/data-types/uuid)

**Примеры**

**При успешном преобразовании возвращается распарсенный UUID**

```sql title=Query
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'));
```

```response title=Response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                     │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**При неудачном преобразовании возвращается UUID по умолчанию**

```sql title=Query
SELECT toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'));
```

```response title=Response
┌─toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'))─┐
│ 59f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## toUUIDOrNull {#toUUIDOrNull}

Появилась в версии: v20.12

Преобразует входное значение к типу `UUID`, но в случае ошибки возвращает `NULL`.
Аналог функции [`toUUID`](#touuid), но возвращает `NULL` вместо генерации исключения при ошибках преобразования.

Поддерживаемые аргументы:

* Строковые представления UUID в стандартном формате (8-4-4-4-12 шестнадцатеричных цифр).
* Строковые представления UUID без дефисов (32 шестнадцатеричные цифры).

Неподдерживаемые аргументы (возвращается `NULL`):

* Неверные строковые форматы.
* Типы, отличные от строковых.
* Некорректные UUID.

**Синтаксис**

```sql
toUUIDOrNull(x)
```

**Аргументы**

* `x` — строковое представление UUID. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение UUID при успешном преобразовании, иначе `NULL`. [`UUID`](/sql-reference/data-types/uuid) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Примеры использования**

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
