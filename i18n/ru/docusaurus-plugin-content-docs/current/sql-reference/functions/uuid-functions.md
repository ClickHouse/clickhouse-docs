---
description: 'Документация по функциям работы с UUID'
sidebar_label: 'UUID'
slug: /sql-reference/functions/uuid-functions
title: 'Функции для работы с UUID'
doc_type: 'reference'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# Функции для работы с UUID



## Генерация UUIDv7 {#uuidv7-generation}

Сгенерированный UUID содержит 48-битную временную метку в миллисекундах Unix, за которой следует версия "7" (4 бита), счётчик (42 бита) для различения UUID в пределах одной миллисекунды (включая поле варианта "2", 2 бита) и случайное поле (32 бита).
Для любой заданной временной метки (`unix_ts_ms`) счётчик начинается со случайного значения и увеличивается на 1 для каждого нового UUID до тех пор, пока временная метка не изменится. В случае переполнения счётчика поле временной метки увеличивается на 1, а счётчик сбрасывается на новое случайное начальное значение.
Функции генерации UUID гарантируют монотонное увеличение поля счётчика в рамках временной метки во всех вызовах функций в параллельно выполняющихся потоках и запросах.

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

Сгенерированный Snowflake ID содержит текущую временную метку Unix в миллисекундах (41 + 1 старший нулевой бит), за которой следует идентификатор машины (10 бит) и счётчик (12 бит) для различения идентификаторов в пределах одной миллисекунды. Для любой заданной временной метки (`unix_ts_ms`) счётчик начинается с 0 и увеличивается на 1 для каждого нового Snowflake ID до изменения временной метки. В случае переполнения счётчика поле временной метки увеличивается на 1, а счётчик сбрасывается на 0.

:::note
Сгенерированные Snowflake ID основаны на эпохе UNIX 1970-01-01. Хотя стандарта или рекомендации относительно эпохи для Snowflake ID не существует, реализации в других системах могут использовать другую эпоху, например Twitter/X (2010-11-04) или Mastodon (2015-01-01).
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

- `expr` — Произвольное [выражение](/sql-reference/syntax#expressions), используемое для обхода [устранения общих подвыражений](/sql-reference/functions/overview#common-subexpression-elimination) при многократном вызове функции в запросе. Значение выражения не влияет на возвращаемый UUID. Необязательный параметр.

**Возвращаемое значение**

Значение типа UUIDv4.

**Пример**

Сначала создадим таблицу со столбцом типа UUID, затем вставим в неё сгенерированный UUIDv4.

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

**Пример с генерацией нескольких UUID для одной строки**

```sql
SELECT generateUUIDv4(1), generateUUIDv4(2);

┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 8abf8c13-7dea-4fdf-af3e-0e18767770e6 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```


## generateUUIDv7 {#generateUUIDv7}

Генерирует [UUID](../data-types/uuid.md) [версии 7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04).

Подробнее о структуре UUID, управлении счётчиком и гарантиях параллелизма см. в разделе ["Генерация UUIDv7"](#uuidv7-generation).

:::note
По состоянию на апрель 2024 года UUID версии 7 имеют статус черновика, и их структура может измениться в будущем.
:::

**Синтаксис**

```sql
generateUUIDv7([expr])
```

**Аргументы**

- `expr` — Произвольное [выражение](/sql-reference/syntax#expressions), используемое для обхода [устранения общих подвыражений](/sql-reference/functions/overview#common-subexpression-elimination), если функция вызывается несколько раз в запросе. Значение выражения не влияет на возвращаемый UUID. Необязательный параметр.

**Возвращаемое значение**

Значение типа UUIDv7.

**Пример**

Сначала создайте таблицу со столбцом типа UUID, затем вставьте в таблицу сгенерированный UUIDv7.

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

**Пример с генерацией нескольких UUID в одной строке**

```sql
SELECT generateUUIDv7(1), generateUUIDv7(2);

┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(2)────────────────────┐
│ 018f05c9-4ab8-7b86-b64e-c9f03fbd45d1 │ 018f05c9-4ab8-7b86-b64e-c9f12efb7e16 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```


## dateTimeToUUIDv7 {#datetimetouuidv7}

Преобразует значение [DateTime](../data-types/datetime.md) в [UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7) для указанного момента времени.

Подробности о структуре UUID, управлении счётчиком и гарантиях при параллельном выполнении см. в разделе ["Генерация UUIDv7"](#uuidv7-generation).

:::note
По состоянию на апрель 2024 года UUID версии 7 имеют статус черновика, и их структура может измениться в будущем.
:::

**Синтаксис**

```sql
dateTimeToUUIDv7(value)
```

**Аргументы**

- `value` — дата и время. [DateTime](../data-types/datetime.md).

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

**Пример с несколькими UUID для одной временной метки**

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

Функция гарантирует, что при многократных вызовах с одной и той же временной меткой генерируются уникальные, монотонно возрастающие UUID.


## empty {#empty}

Проверяет, является ли входной UUID пустым.

**Синтаксис**

```sql
empty(UUID)
```

UUID считается пустым, если он содержит только нули (нулевой UUID).

Функция также работает для массивов и строк.

**Аргументы**

- `x` — UUID. [UUID](../data-types/uuid.md).

**Возвращаемое значение**

- Возвращает `1` для пустого UUID или `0` для непустого UUID. [UInt8](../data-types/int-uint.md).

**Пример**

Для генерации значения UUID в ClickHouse предусмотрена функция [generateUUIDv4](#generateuuidv4).

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

Проверяет, является ли входной UUID непустым.

**Синтаксис**

```sql
notEmpty(UUID)
```

UUID считается пустым, если он содержит только нули (нулевой UUID).

Функция также работает для массивов и строк.

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

- `string` — строка из 36 символов или FixedString(36). [String](../syntax.md#string).
- `default` — UUID, используемый по умолчанию, если первый аргумент невозможно преобразовать в тип UUID. [UUID](../data-types/uuid.md).

**Возвращаемое значение**

UUID

```sql
toUUIDOrDefault(string, default)
```

**Возвращаемое значение**

Значение типа UUID.

**Примеры использования**

Первый пример возвращает первый аргумент, преобразованный в тип UUID, так как преобразование возможно:

```sql
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', cast('59f0c404-5cb3-11e7-907b-a6006ad3dba0' AS UUID));
```

Результат:

```response
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', CAST('59f0c404-5cb3-11e7-907b-a6006ad3dba0', 'UUID'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Второй пример возвращает второй аргумент (переданный UUID по умолчанию), так как первый аргумент невозможно преобразовать в тип UUID:

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

Принимает аргумент типа String и пытается преобразовать его в UUID. В случае ошибки возвращает NULL.

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

Принимает аргумент типа String и пытается разобрать его как UUID. В случае неудачи возвращает нулевой UUID.

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

Принимает строку `string`, содержащую 36 символов в формате `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, и возвращает [FixedString(16)](../data-types/fixedstring.md) в виде двоичного представления, формат которого может быть задан параметром `variant` (по умолчанию `Big-endian`).

**Синтаксис**

```sql
UUIDStringToNum(string[, variant = 1])
```

**Аргументы**

- `string` — [String](/sql-reference/data-types/string) из 36 символов или [FixedString](/sql-reference/data-types/string)
- `variant` — целое число, представляющее вариант согласно [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (по умолчанию), 2 = `Microsoft`.

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

Принимает `binary`, содержащий двоичное представление UUID, формат которого может быть опционально задан параметром `variant` (по умолчанию `Big-endian`), и возвращает строку из 36 символов в текстовом формате.

**Синтаксис**

```sql
UUIDNumToString(binary[, variant = 1])
```

**Аргументы**

- `binary` — [FixedString(16)](../data-types/fixedstring.md), представляющий двоичное представление UUID.
- `variant` — целое число, определяющее вариант согласно [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (по умолчанию), 2 = `Microsoft`.

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

Принимает [UUID](../data-types/uuid.md) и возвращает его двоичное представление в виде [FixedString(16)](../data-types/fixedstring.md), формат которого можно задать параметром `variant` (по умолчанию `Big-endian`). Эта функция заменяет вызов двух отдельных функций `UUIDStringToNum(toString(uuid))`, поэтому промежуточное преобразование UUID в строку для извлечения байтов не требуется.

**Синтаксис**

```sql
UUIDToNum(uuid[, variant = 1])
```

**Аргументы**

- `uuid` — [UUID](../data-types/uuid.md).
- `variant` — целое число, представляющее вариант согласно [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (по умолчанию), 2 = `Microsoft`.

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

Возвращает компонент временной метки из UUID версии 7.

**Синтаксис**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**Аргументы**

- `uuid` — [UUID](../data-types/uuid.md) версии 7.
- `timezone` — [Название часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) для возвращаемого значения (необязательно). [String](../data-types/string.md).

**Возвращаемое значение**

- Временная метка с точностью до миллисекунд. Если UUID не является корректным UUID версии 7, возвращается 1970-01-01 00:00:00.000. [DateTime64(3)](../data-types/datetime64.md).

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

Возвращает случайный UUID, сгенерированный при первом запуске сервера ClickHouse. UUID сохраняется в файле `uuid` в директории сервера ClickHouse (например, `/var/lib/clickhouse/`) и сохраняется при перезапусках сервера.

**Синтаксис**

```sql
serverUUID()
```

**Возвращаемое значение**

- UUID сервера. [UUID](../data-types/uuid.md).


## generateSnowflakeID {#generatesnowflakeid}

Генерирует [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID).
Функция гарантирует монотонное увеличение поля счётчика в пределах временной метки при всех вызовах функции в параллельно выполняющихся потоках и запросах.

Подробности реализации см. в разделе [«Генерация Snowflake ID»](#snowflake-id-generation).

**Синтаксис**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**Аргументы**

- `expr` — Произвольное [выражение](/sql-reference/syntax#expressions), используемое для обхода [устранения общих подвыражений](/sql-reference/functions/overview#common-subexpression-elimination) при многократном вызове функции в запросе. Значение выражения не влияет на возвращаемый Snowflake ID. Необязательный параметр.
- `machine_id` — Идентификатор машины, используются младшие 10 бит. [Int64](../data-types/int-uint.md). Необязательный параметр.

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

**Пример с генерацией нескольких Snowflake ID для одной строки**

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
Эта функция устарела и может использоваться только при включённой настройке [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions).
Функция будет удалена в одной из будущих версий.

Пожалуйста, используйте вместо неё функцию [snowflakeIDToDateTime](#snowflakeidtodatetime).
:::

Извлекает компонент временной метки из [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в формате [DateTime](../data-types/datetime.md).

**Синтаксис**

```sql
snowflakeToDateTime(value[, time_zone])
```

**Аргументы**

- `value` — Snowflake ID. [Int64](../data-types/int-uint.md).
- `time_zone` — [Часовой пояс](/operations/server-configuration-parameters/settings.md#timezone). Функция интерпретирует `time_string` в соответствии с часовым поясом. Необязательный параметр. [String](../data-types/string.md).

**Возвращаемое значение**

- Компонент временной метки из `value` в виде значения типа [DateTime](../data-types/datetime.md).

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
Эта функция устарела и может использоваться только при включённой настройке [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions).
Функция будет удалена в будущем.

Пожалуйста, используйте вместо неё функцию [snowflakeIDToDateTime64](#snowflakeidtodatetime64).
:::

Извлекает компонент временной метки из [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в формате [DateTime64](../data-types/datetime64.md).

**Синтаксис**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**Аргументы**

- `value` — Snowflake ID. [Int64](../data-types/int-uint.md).
- `time_zone` — [Часовой пояс](/operations/server-configuration-parameters/settings.md#timezone). Функция обрабатывает `time_string` в соответствии с часовым поясом. Необязательный параметр. [String](../data-types/string.md).

**Возвращаемое значение**

- Компонент временной метки из `value` в виде [DateTime64](../data-types/datetime64.md) с масштабом = 3, то есть с точностью до миллисекунд.

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
Эта функция устарела и может использоваться только при включённой настройке [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions).
Функция будет удалена в одной из будущих версий.

Вместо неё используйте функцию [dateTimeToSnowflakeID](#datetimetosnowflakeid).
:::

Преобразует значение [DateTime](../data-types/datetime.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) для указанного момента времени.

**Синтаксис**

```sql
dateTimeToSnowflake(value)
```

**Аргументы**

- `value` — дата и время. [DateTime](../data-types/datetime.md).

**Возвращаемое значение**

- Входное значение, преобразованное в тип данных [Int64](../data-types/int-uint.md), представляющее первый Snowflake ID для указанного момента времени.

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
Эта функция устарела и может использоваться только при включённой настройке [allow_deprecated_snowflake_conversion_functions](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions).
Функция будет удалена в одной из будущих версий.

Вместо неё используйте функцию [dateTime64ToSnowflakeID](#datetime64tosnowflakeid).
:::

Преобразует значение типа [DateTime64](../data-types/datetime64.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) для указанного момента времени.

**Синтаксис**

```sql
dateTime64ToSnowflake(value)
```

**Аргументы**

- `value` — дата и время. [DateTime64](../data-types/datetime64.md).

**Возвращаемое значение**

- Входное значение, преобразованное в тип данных [Int64](../data-types/int-uint.md), представляющее первый Snowflake ID для указанного момента времени.

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

Возвращает компонент временной метки [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в виде значения типа [DateTime](../data-types/datetime.md).

**Синтаксис**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**Аргументы**

- `value` — Snowflake ID. [UInt64](../data-types/int-uint.md).
- `epoch` — Эпоха Snowflake ID в миллисекундах с 1970-01-01. По умолчанию 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. Необязательный параметр. [UInt\*](../data-types/int-uint.md).
- `time_zone` — [Часовой пояс](/operations/server-configuration-parameters/settings.md#timezone). Функция интерпретирует `time_string` в соответствии с часовым поясом. Необязательный параметр. [String](../data-types/string.md).

**Возвращаемое значение**

- Компонент временной метки `value` в виде значения [DateTime](../data-types/datetime.md).

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

Возвращает компонент временной метки из [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в виде значения типа [DateTime64](../data-types/datetime64.md).

**Синтаксис**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**Аргументы**

- `value` — Snowflake ID. [UInt64](../data-types/int-uint.md).
- `epoch` — Эпоха Snowflake ID в миллисекундах с 1970-01-01. По умолчанию 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. Необязательный параметр. [UInt\*](../data-types/int-uint.md).
- `time_zone` — [Часовой пояс](/operations/server-configuration-parameters/settings.md#timezone). Функция интерпретирует `time_string` в соответствии с часовым поясом. Необязательный параметр. [String](../data-types/string.md).

**Возвращаемое значение**

- Компонент временной метки из `value` в виде [DateTime64](../data-types/datetime64.md) с масштабом = 3, т.е. с точностью до миллисекунд.

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

Преобразует значение [DateTime](../data-types/datetime.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) для указанного момента времени.

**Синтаксис**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**Аргументы**

- `value` — дата и время. [DateTime](../data-types/datetime.md).
- `epoch` — эпоха Snowflake ID в миллисекундах с 1970-01-01. По умолчанию 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) используйте значение 1288834974657. Необязательный параметр. [UInt\*](../data-types/int-uint.md).

**Возвращаемое значение**

- Входное значение, преобразованное в тип [UInt64](../data-types/int-uint.md) и представляющее первый Snowflake ID для указанного момента времени.

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

Преобразует [DateTime64](../data-types/datetime64.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) для указанного момента времени.

**Синтаксис**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**Аргументы**

- `value` — дата и время. [DateTime64](../data-types/datetime64.md).
- `epoch` — эпоха Snowflake ID в миллисекундах с 1970-01-01. По умолчанию 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) используйте значение 1288834974657. Необязательный параметр. [UInt\*](../data-types/int-uint.md).

**Возвращаемое значение**

- Входное значение, преобразованное в [UInt64](../data-types/int-uint.md) и представляющее первый Snowflake ID для указанного момента времени.

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

<!--
Внутреннее содержимое тегов ниже заменяется во время сборки фреймворка документации
документацией, сгенерированной из system.functions. Пожалуйста, не изменяйте и не удаляйте теги.
См.: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->


<!--AUTOGENERATED_START-->

## UUIDNumToString {#UUIDNumToString}

Введена в версии: v1.1

Принимает двоичное представление UUID, формат которого может быть опционально задан параметром `variant` (по умолчанию `Big-endian`), и возвращает строку из 36 символов в текстовом формате.

**Синтаксис**

```sql
UUIDNumToString(binary[, variant])
```

**Аргументы**

- `binary` — Двоичное представление UUID. [`FixedString(16)`](/sql-reference/data-types/fixedstring)
- `variant` — Вариант, как указано в [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (по умолчанию), 2 = `Microsoft`. [`(U)Int*`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает UUID в виде строки. [`String`](/sql-reference/data-types/string)

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT
    'a/<@];!~p{jTj={)' AS bytes,
    UUIDNumToString(toFixedString(bytes, 16)) AS uuid
```

```response title=Результат
┌─bytes────────────┬─uuid─────────────────────────────────┐
│ a/<@];!~p{jTj={) │ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │
└──────────────────┴──────────────────────────────────────┘
```

**Вариант Microsoft**

```sql title=Запрос
SELECT
    '@</a;]~!p{jTj={)' AS bytes,
    UUIDNumToString(toFixedString(bytes, 16), 2) AS uuid
```

```response title=Результат
┌─bytes────────────┬─uuid─────────────────────────────────┐
│ @</a;]~!p{jTj={) │ 612f3c40-5d3b-217e-707b-6a546a3d7b29 │
└──────────────────┴──────────────────────────────────────┘
```


## UUIDStringToNum {#UUIDStringToNum}

Введена в версии: v1.1

Принимает строку из 36 символов в формате `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` и возвращает [FixedString(16)](../data-types/fixedstring.md) в виде её двоичного представления, формат которого может быть задан параметром `variant` (по умолчанию `Big-endian`).

**Синтаксис**

```sql
UUIDStringToNum(string[, variant = 1])
```

**Аргументы**

- `string` — Строка или строка фиксированной длины из 36 символов. [`String`](/sql-reference/data-types/string) или [`FixedString(36)`](/sql-reference/data-types/fixedstring)
- `variant` — Вариант, как указано в [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (по умолчанию), 2 = `Microsoft`. [`(U)Int*`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает двоичное представление строки `string`. [`FixedString(16)`](/sql-reference/data-types/fixedstring)

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

Принимает [UUID](../data-types/uuid.md) и возвращает его двоичное представление в виде [FixedString(16)](../data-types/fixedstring.md), формат которого может быть опционально задан параметром `variant` (по умолчанию `Big-endian`).
Эта функция заменяет вызов двух отдельных функций `UUIDStringToNum(toString(uuid))`, поэтому промежуточное преобразование UUID в строку для извлечения байтов не требуется.

**Синтаксис**

```sql
UUIDToNum(uuid[, variant = 1])
```

**Аргументы**

- `uuid` — UUID. [`String`](/sql-reference/data-types/string) или [`FixedString`](/sql-reference/data-types/fixedstring)
- `variant` — Вариант, как указано в [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122#section-4.1.1). 1 = `Big-endian` (по умолчанию), 2 = `Microsoft`. [`(U)Int*`](/sql-reference/data-types/int-uint)

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

Введена в версии: v24.5

Возвращает компонент временной метки UUID версии 7.

**Синтаксис**

```sql
UUIDv7ToDateTime(uuid[, timezone])
```

**Аргументы**

- `uuid` — UUID версии 7. [`String`](/sql-reference/data-types/string)
- `timezone` — Необязательный параметр. [Название часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) для возвращаемого значения. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает временную метку с точностью до миллисекунд. Если UUID не является корректным UUID версии 7, возвращается `1970-01-01 00:00:00.000`. [`DateTime64(3)`](/sql-reference/data-types/datetime64)

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))
```

```response title=Результат
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'))─┐
│                                          2024-04-22 15:30:29.048 │
└──────────────────────────────────────────────────────────────────┘
```

**С часовым поясом**

```sql title=Запрос
SELECT UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')
```

```response title=Результат
┌─UUIDv7ToDateTime(toUUID('018f05c9-4ab8-7b86-b64e-c9f03fbd45d1'), 'America/New_York')─┐
│                                                             2024-04-22 11:30:29.048 │
└─────────────────────────────────────────────────────────────────────────────────────┘
```


## dateTime64ToSnowflake {#dateTime64ToSnowflake}

Введена в версии: v21.10

<DeprecatedBadge />

:::warning
Эта функция устарела и может использоваться только при включённой настройке [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions).
Функция будет удалена в одной из будущих версий.

Вместо неё используйте функцию [dateTime64ToSnowflakeID](#dateTime64ToSnowflakeID).
:::

Преобразует значение типа [DateTime64](../data-types/datetime64.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) для указанного момента времени.

**Синтаксис**

```sql
dateTime64ToSnowflake(value)
```

**Аргументы**

- `value` — дата и время. [`DateTime64`](/sql-reference/data-types/datetime64)

**Возвращаемое значение**

Возвращает входное значение, преобразованное в первый Snowflake ID для данного момента времени. [`Int64`](/sql-reference/data-types/int-uint)

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

Introduced in: v24.6

Преобразует [`DateTime64`](../data-types/datetime64.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) для заданного времени.

Подробности реализации см. в разделе [«Генерация Snowflake ID»](#snowflake-id-generation).

**Синтаксис**

```sql
dateTime64ToSnowflakeID(value[, epoch])
```

**Аргументы**

- `value` — дата и время. [`DateTime`](/sql-reference/data-types/datetime) или [`DateTime64`](/sql-reference/data-types/datetime64)
- `epoch` — эпоха Snowflake ID в миллисекундах с 1970-01-01. По умолчанию 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. [`UInt*`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает первый Snowflake ID для указанного времени. [`UInt64`](/sql-reference/data-types/int-uint)

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

Введено в версии: v21.10

<DeprecatedBadge />

:::warning
Эта функция устарела и может использоваться только при включённой настройке [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions).
Функция будет удалена в одной из будущих версий.

Используйте вместо неё функцию [dateTimeToSnowflakeID](#dateTimeToSnowflakeID).
:::

Преобразует значение [DateTime](../data-types/datetime.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) для указанного времени.

**Синтаксис**

```sql
dateTimeToSnowflake(value)
```

**Аргументы**

- `value` — дата и время. [`DateTime`](/sql-reference/data-types/datetime)

**Возвращаемое значение**

Возвращает входное значение в виде первого Snowflake ID для указанного времени. [`Int64`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Запрос
WITH toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai') AS dt SELECT dateTimeToSnowflake(dt);
```

```response title=Результат
┌─dateTimeToSnowflake(dt)─┐
│     1426860702823350272 │
└─────────────────────────┘
```


## dateTimeToSnowflakeID {#dateTimeToSnowflakeID}

Introduced in: v24.6

Преобразует значение [DateTime](../data-types/datetime.md) в первый [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) для заданного времени.

**Синтаксис**

```sql
dateTimeToSnowflakeID(value[, epoch])
```

**Аргументы**

- `value` — дата и время. [`DateTime`](/sql-reference/data-types/datetime) или [`DateTime64`](/sql-reference/data-types/datetime64)
- `epoch` — необязательный параметр. Эпоха Snowflake ID в миллисекундах с 1970-01-01. По умолчанию 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. [`UInt*`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает входное значение в виде первого Snowflake ID для заданного времени. [`UInt64`](/sql-reference/data-types/int-uint)

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

Введено в версии: v25.9

Преобразует значение [DateTime](../data-types/datetime.md) в [UUIDv7](https://en.wikipedia.org/wiki/UUID#Version_7) для указанного времени.

Подробности о структуре UUID, управлении счётчиками и гарантиях параллелизма см. в разделе [«Генерация UUIDv7»](#uuidv7-generation).

:::note
По состоянию на сентябрь 2025 года UUID версии 7 имеют статус черновика, и их структура может измениться в будущем.
:::

**Синтаксис**

```sql
dateTimeToUUIDv7(value)
```

**Аргументы**

- `value` — дата и время. [`DateTime`](/sql-reference/data-types/datetime)

**Возвращаемое значение**

Возвращает UUIDv7. [`UUID`](/sql-reference/data-types/uuid)

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'));
```

```response title=Результат
┌─dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56', 'Asia/Shanghai'))─┐
│ 018f05af-f4a8-778f-beee-1bedbc95c93b                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Несколько UUID для одной временной метки**

```sql title=Запрос
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56'));
SELECT dateTimeToUUIDv7(toDateTime('2021-08-15 18:57:56'));
```

```response title=Результат
┌─dateTimeToUUIDv7(t⋯08-15 18:57:56'))─┐
│ 017b4b2d-7720-76ed-ae44-bbcc23a8c550 │
└──────────────────────────────────────┘
┌─dateTimeToUUIDv7(t⋯08-15 18:57:56'))─┐
│ 017b4b2d-7720-76ed-ae44-bbcf71ed0fd3 │
└──────────────────────────────────────┘
```


## generateSnowflakeID {#generateSnowflakeID}

Введено в версии: v24.6

Генерирует [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID).

Функция `generateSnowflakeID` гарантирует монотонное увеличение поля счётчика в пределах временной метки при всех вызовах функции в параллельно выполняющихся потоках и запросах.

Подробности реализации см. в разделе [«Генерация Snowflake ID»](#snowflake-id-generation).

**Синтаксис**

```sql
generateSnowflakeID([expr, [machine_id]])
```

**Аргументы**

- `expr` — Произвольное [выражение](/sql-reference/syntax#expressions), используемое для обхода [устранения общих подвыражений](/sql-reference/functions/overview#common-subexpression-elimination) при многократном вызове функции в запросе. Значение выражения не влияет на возвращаемый Snowflake ID. Необязательный параметр.
- `machine_id` — Идентификатор машины, используются младшие 10 бит. [Int64](../data-types/int-uint.md). Необязательный параметр.

**Возвращаемое значение**

Возвращает Snowflake ID. [`UInt64`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Запрос
CREATE TABLE tab (id UInt64)
ENGINE = MergeTree()
ORDER BY tuple();

INSERT INTO tab SELECT generateSnowflakeID();

SELECT * FROM tab;
```

```response title=Ответ
┌──────────────────id─┐
│ 7199081390080409600 │
└─────────────────────┘
```

**Генерация нескольких Snowflake ID в одной строке**

```sql title=Запрос
SELECT generateSnowflakeID(1), generateSnowflakeID(2);
```

```response title=Ответ
┌─generateSnowflakeID(1)─┬─generateSnowflakeID(2)─┐
│    7199081609652224000 │    7199081609652224001 │
└────────────────────────┴────────────────────────┘
```

**С выражением и идентификатором машины**

```sql title=Запрос
SELECT generateSnowflakeID('expr', 1);
```

```response title=Ответ
┌─generateSnowflakeID('expr', 1)─┐
│            7201148511606784002 │
└────────────────────────────────┘
```


## generateUUIDv4 {#generateUUIDv4}

Введена в версии: v1.1

Генерирует [UUID](../data-types/uuid.md) [версии 4](https://tools.ietf.org/html/rfc4122#section-4.4).

**Синтаксис**

```sql
generateUUIDv4([expr])
```

**Аргументы**

- `expr` — Необязательный аргумент. Произвольное выражение, используемое для обхода [устранения общих подвыражений](/sql-reference/functions/overview#common-subexpression-elimination) при многократном вызове функции в запросе. Значение выражения не влияет на возвращаемый UUID.

**Возвращаемое значение**

Возвращает UUIDv4 типа [`UUID`](/sql-reference/data-types/uuid).

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT generateUUIDv4(number) FROM numbers(3);
```

```response title=Результат
┌─generateUUIDv4(number)───────────────┐
│ fcf19b77-a610-42c5-b3f5-a13c122f65b6 │
│ 07700d36-cb6b-4189-af1d-0972f23dc3bc │
│ 68838947-1583-48b0-b9b7-cf8268dd343d │
└──────────────────────────────────────┘
```

**Устранение общих подвыражений**

```sql title=Запрос
SELECT generateUUIDv4(1), generateUUIDv4(1);
```

```response title=Результат
┌─generateUUIDv4(1)────────────────────┬─generateUUIDv4(2)────────────────────┐
│ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │ 2d49dc6e-ddce-4cd0-afb8-790956df54c1 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```


## generateUUIDv7 {#generateUUIDv7}

Введена в версии: v24.5

Генерирует [UUID](../data-types/uuid.md) [версии 7](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-04).

Подробнее о структуре UUID, управлении счётчиком и гарантиях параллелизма см. в разделе ["Генерация UUIDv7"](#uuidv7-generation).

:::note
По состоянию на сентябрь 2025 года UUID версии 7 находятся в статусе черновика, и их структура может измениться в будущем.
:::

**Синтаксис**

```sql
generateUUIDv7([expr])
```

**Аргументы**

- `expr` — Необязательный аргумент. Произвольное выражение, используемое для обхода [устранения общих подвыражений](/sql-reference/functions/overview#common-subexpression-elimination) при многократном вызове функции в запросе. Значение выражения не влияет на возвращаемый UUID. [`Any`](/sql-reference/data-types)

**Возвращаемое значение**

Возвращает UUIDv7. [`UUID`](/sql-reference/data-types/uuid)

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT generateUUIDv7(number) FROM numbers(3);
```

```response title=Результат
┌─generateUUIDv7(number)───────────────┐
│ 019947fb-5766-7ed0-b021-d906f8f7cebb │
│ 019947fb-5766-7ed0-b021-d9072d0d1e07 │
│ 019947fb-5766-7ed0-b021-d908dca2cf63 │
└──────────────────────────────────────┘
```

**Устранение общих подвыражений**

```sql title=Запрос
SELECT generateUUIDv7(1), generateUUIDv7(1);
```

```response title=Результат
┌─generateUUIDv7(1)────────────────────┬─generateUUIDv7(1)────────────────────┐
│ 019947ff-0f87-7d88-ace0-8b5b3a66e0c1 │ 019947ff-0f87-7d88-ace0-8b5b3a66e0c1 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```


## readWKTLineString {#readWKTLineString}

Добавлено в версии: v

Разбирает представление геометрии LineString в формате Well-Known Text (WKT) и возвращает её во внутреннем формате ClickHouse.

**Синтаксис**

```sql
readWKTLineString(wkt_string)
```

**Аргументы**

- `wkt_string` — входная строка WKT, представляющая геометрию LineString. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Функция возвращает внутреннее представление ClickHouse геометрии linestring.

**Примеры**

**Первый вызов**

```sql title=Запрос
SELECT readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)');
```

```response title=Результат
┌─readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)')─┐
│ [(1,1),(2,2),(3,3),(1,1)]                            │
└──────────────────────────────────────────────────────┘
```

**Второй вызов**

```sql title=Запрос
SELECT toTypeName(readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)'));
```

```response title=Результат
┌─toTypeName(readWKTLineString('LINESTRING (1 1, 2 2, 3 3, 1 1)'))─┐
│ LineString                                                       │
└──────────────────────────────────────────────────────────────────┘
```


## snowflakeIDToDateTime {#snowflakeIDToDateTime}

Introduced in: v24.6

Возвращает компонент временной метки [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в виде значения типа [DateTime](../data-types/datetime.md).

**Синтаксис**

```sql
snowflakeIDToDateTime(value[, epoch[, time_zone]])
```

**Аргументы**

- `value` — Snowflake ID. [`UInt64`](/sql-reference/data-types/int-uint)
- `epoch` — Необязательный параметр. Эпоха Snowflake ID в миллисекундах с 1970-01-01. По умолчанию 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. [`UInt*`](/sql-reference/data-types/int-uint)
- `time_zone` — Необязательный параметр. [Часовой пояс](/operations/server-configuration-parameters/settings.md#timezone). Функция обрабатывает `time_string` в соответствии с часовым поясом. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает компонент временной метки значения `value`. [`DateTime`](/sql-reference/data-types/datetime)

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

Введено в версии: v24.6

Возвращает компонент временной метки [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в виде значения типа [DateTime64](../data-types/datetime64.md).

**Синтаксис**

```sql
snowflakeIDToDateTime64(value[, epoch[, time_zone]])
```

**Аргументы**

- `value` — Snowflake ID. [`UInt64`](/sql-reference/data-types/int-uint)
- `epoch` — Необязательный параметр. Эпоха Snowflake ID в миллисекундах с 1970-01-01. По умолчанию 0 (1970-01-01). Для эпохи Twitter/X (2015-01-01) укажите 1288834974657. [`UInt*`](/sql-reference/data-types/int-uint)
- `time_zone` — Необязательный параметр. [Часовой пояс](/operations/server-configuration-parameters/settings.md#timezone). Функция разбирает `time_string` в соответствии с часовым поясом. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает компонент временной метки `value` в виде `DateTime64` с масштабом = 3, то есть с точностью до миллисекунд. [`DateTime64`](/sql-reference/data-types/datetime64)

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

Введена в версии: v21.10

<DeprecatedBadge />

:::warning
Эта функция устарела и может использоваться только при включённой настройке [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions).
Функция будет удалена в одной из будущих версий.

Используйте вместо неё функцию [`snowflakeIDToDateTime`](#snowflakeIDToDateTime).
:::

Извлекает временную метку из [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в формате [DateTime](../data-types/datetime.md).

**Синтаксис**

```sql
snowflakeToDateTime(value[, time_zone])
```

**Аргументы**

- `value` — Snowflake ID. [`Int64`](/sql-reference/data-types/int-uint)
- `time_zone` — Необязательный параметр. [Часовой пояс](/operations/server-configuration-parameters/settings.md#timezone). Функция интерпретирует `time_string` в соответствии с часовым поясом. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает временную метку из `value`. [`DateTime`](/sql-reference/data-types/datetime)

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

Введена в версии: v21.10

<DeprecatedBadge />

:::warning
Эта функция устарела и может использоваться только при включённой настройке [`allow_deprecated_snowflake_conversion_functions`](../../operations/settings/settings.md#allow_deprecated_snowflake_conversion_functions).
Функция будет удалена в одной из будущих версий.

Используйте вместо неё функцию [`snowflakeIDToDateTime64`](#snowflakeIDToDateTime64).
:::

Извлекает компонент временной метки из [Snowflake ID](https://en.wikipedia.org/wiki/Snowflake_ID) в формате [DateTime64](../data-types/datetime64.md).

**Синтаксис**

```sql
snowflakeToDateTime64(value[, time_zone])
```

**Аргументы**

- `value` — Snowflake ID. [`Int64`](/sql-reference/data-types/int-uint)
- `time_zone` — Необязательный параметр. [Часовой пояс](/operations/server-configuration-parameters/settings.md#timezone). Функция интерпретирует `time_string` в соответствии с часовым поясом. [`String`](/sql-reference/data-types/string)

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

Введена в версии: v21.1

Преобразует значение типа String в тип UUID. Если преобразование завершается неудачей, возвращает значение UUID по умолчанию вместо генерации ошибки.

Функция пытается распарсить строку из 36 символов в стандартном формате UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).
Если строку невозможно преобразовать в корректный UUID, функция возвращает переданное значение UUID по умолчанию.

**Синтаксис**

```sql
toUUIDOrDefault(string, default)
```

**Аргументы**

- `string` — строка из 36 символов или FixedString(36) для преобразования в UUID. - `default` — значение UUID, которое будет возвращено, если первый аргумент невозможно преобразовать в тип UUID.

**Возвращаемое значение**

Возвращает преобразованный UUID в случае успеха или UUID по умолчанию в случае неудачи преобразования. [`UUID`](/sql-reference/data-types/uuid)

**Примеры**

**Успешное преобразование возвращает распарсенный UUID**

```sql title=Запрос
SELECT toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'));
```

```response title=Результат
┌─toUUIDOrDefault('61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'))─┐
│ 61f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                     │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Неудачное преобразование возвращает UUID по умолчанию**

```sql title=Запрос
SELECT toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'));
```

```response title=Результат
┌─toUUIDOrDefault('-----61f0c404-5cb3-11e7-907b-a6006ad3dba0', toUUID('59f0c404-5cb3-11e7-907b-a6006ad3dba0'))─┐
│ 59f0c404-5cb3-11e7-907b-a6006ad3dba0                                                                          │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```


## toUUIDOrNull {#toUUIDOrNull}

Введена в версии: v20.12

Преобразует входное значение в тип `UUID`, но возвращает `NULL` в случае ошибки.
Работает как [`toUUID`](#touuid), но возвращает `NULL` вместо генерации исключения при ошибках преобразования.

Поддерживаемые аргументы:

- Строковые представления UUID в стандартном формате (8-4-4-4-12 шестнадцатеричных цифр).
- Строковые представления UUID без дефисов (32 шестнадцатеричных цифры).

Неподдерживаемые аргументы (возвращают `NULL`):

- Недопустимые строковые форматы.
- Нестроковые типы.
- Некорректные UUID.

**Синтаксис**

```sql
toUUIDOrNull(x)
```

**Аргументы**

- `x` — Строковое представление UUID. [`String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает значение UUID в случае успеха, иначе `NULL`. [`UUID`](/sql-reference/data-types/uuid) или [`NULL`](/sql-reference/syntax#null)

**Примеры**

**Примеры использования**

```sql title=Запрос
SELECT
    toUUIDOrNull('550e8400-e29b-41d4-a716-446655440000') AS valid_uuid,
    toUUIDOrNull('invalid-uuid') AS invalid_uuid
```

```response title=Результат
┌─valid_uuid───────────────────────────┬─invalid_uuid─┐
│ 550e8400-e29b-41d4-a716-446655440000 │         ᴺᵁᴸᴸ │
└──────────────────────────────────────┴──────────────┘
```

<!--AUTOGENERATED_END-->
