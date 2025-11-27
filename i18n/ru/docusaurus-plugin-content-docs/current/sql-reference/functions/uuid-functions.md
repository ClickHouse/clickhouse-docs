---
description: 'Справочная документация по функциям для работы с UUID'
sidebar_label: 'UUID'
slug: /sql-reference/functions/uuid-functions
title: 'Функции для работы с UUID'
doc_type: 'reference'
---

import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# Функции для работы с UUID

## Генерация UUIDv7

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


## Генерация Snowflake ID

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


## generateUUIDv4

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


## generateUUIDv7

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


## dateTimeToUUIDv7

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


## empty

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


## notEmpty

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


## toUUID

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


## toUUIDOrDefault

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


## toUUIDOrNull

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


## toUUIDOrZero

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


## UUIDStringToNum

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


## UUIDNumToString

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


## UUIDToNum

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


## UUIDv7ToDateTime

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


## serverUUID

Возвращает случайный UUID, сгенерированный при первом запуске сервера ClickHouse. UUID хранится в файле `uuid` в каталоге сервера ClickHouse (например, `/var/lib/clickhouse/`) и сохраняется между перезапусками сервера.

**Синтаксис**

```sql
serverUUID()
```

**Возвращаемое значение**

* UUID сервера. [UUID](../data-types/uuid.md).


## generateSnowflakeID

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


## snowflakeToDateTime

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


## snowflakeToDateTime64

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


## dateTimeToSnowflake

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


## dateTime64ToSnowflake

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


## snowflakeIDToDateTime

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


## snowflakeIDToDateTime64

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


## dateTimeToSnowflakeID

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


## dateTime64ToSnowflakeID

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


## См. также

* [dictGetUUID](/sql-reference/functions/ext-dict-functions#other-functions)

{/*
  Содержимое тегов ниже во время сборки фреймворка документации
  заменяется документацией, сгенерированной на основе system.functions. Пожалуйста, не изменяйте и не удаляйте эти теги.
  См.: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
