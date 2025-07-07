---
description: 'Документация по другим функциям'
sidebar_label: 'Другие'
sidebar_position: 140
slug: /sql-reference/functions/other-functions
title: 'Другие функции'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


# Другие функции
## hostName {#hostname}

Возвращает имя хоста, на котором была выполнена эта функция. Если функция выполняется на удалённом сервере (распределённая обработка), возвращается имя удалённого сервера. Если функция выполняется в контексте распределённой таблицы, она генерирует обычную колонку с значениями, относящимися к каждому шарду. В противном случае она производит постоянное значение.

**Синтаксис**

```sql
hostName()
```

**Возвращаемое значение**

- Имя хоста. [String](../data-types/string.md).

## getMacro {#getMacro}

Возвращает именованное значение из секции [macros](../../operations/server-configuration-parameters/settings.md#macros) конфигурации сервера.

**Синтаксис**

```sql
getMacro(name);
```

**Аргументы**

- `name` — Имя макроса, которое нужно получить из секции `<macros>`. [String](/sql-reference/data-types/string).

**Возвращаемое значение**

- Значение указанного макроса. [String](../data-types/string.md).

**Пример**

Пример секции `<macros>` в файле конфигурации сервера:

```xml
<macros>
    <test>Value</test>
</macros>
```

Запрос:

```sql
SELECT getMacro('test');
```

Результат:

```text
┌─getMacro('test')─┐
│ Value            │
└──────────────────┘
```

То же самое значение можно получить следующим образом:

```sql
SELECT * FROM system.macros
WHERE macro = 'test';
```

```text
┌─macro─┬─substitution─┐
│ test  │ Value        │
└───────┴──────────────┘
```

## fqdn {#fqdn}

Возвращает полностью квалифицированное доменное имя сервера ClickHouse.

**Синтаксис**

```sql
fqdn();
```

Псевдонимы: `fullHostName`, `FQDN`.

**Возвращаемое значение**

- Строка с полностью квалифицированным доменным именем. [String](../data-types/string.md).

**Пример**

```sql
SELECT FQDN();
```

Результат:

```text
┌─FQDN()──────────────────────────┐
│ clickhouse.ru-central1.internal │
└─────────────────────────────────┘
```

## basename {#basename}

Извлекает часть строки после последнего слэша или обратного слэша. Эта функция часто используется для извлечения имени файла из пути.

```sql
basename(expr)
```

**Аргументы**

- `expr` — Значение типа [String](../data-types/string.md). Обратные слэши должны быть экранированы.

**Возвращаемое значение**

Строка, содержащая:

- Конец входной строки после последнего слэша или обратного слэша. Если входная строка заканчивается слэшем или обратным слэшем (например, `/` или `c:\`), функция возвращает пустую строку.
- Исходная строка, если слэшей или обратных слэшей нет.

**Пример**

Запрос:

```sql
SELECT 'some/long/path/to/file' AS a, basename(a)
```

Результат:

```text
┌─a──────────────────────┬─basename('some\\long\\path\\to\\file')─┐
│ some\long\path\to\file │ file                                   │
└────────────────────────┴────────────────────────────────────────┘
```

Запрос:

```sql
SELECT 'some\\long\\path\\to\\file' AS a, basename(a)
```

Результат:

```text
┌─a──────────────────────┬─basename('some\\long\\path\\to\\file')─┐
│ some\long\path\to\file │ file                                   │
└────────────────────────┴────────────────────────────────────────┘
```

Запрос:

```sql
SELECT 'some-file-name' AS a, basename(a)
```

Результат:

```text
┌─a──────────────┬─basename('some-file-name')─┐
│ some-file-name │ some-file-name             │
└────────────────┴────────────────────────────┘
```

## visibleWidth {#visiblewidth}

Вычисляет приблизительную ширину при выводе значений на консоль в текстовом формате (разделённом табуляцией). Эта функция используется системой для реализации [Pretty форматов](../../interfaces/formats.md).

`NULL` представлен как строка, соответствующая `NULL` в `Pretty` форматах.

**Синтаксис**

```sql
visibleWidth(x)
```

**Пример**

Запрос:

```sql
SELECT visibleWidth(NULL)
```

Результат:

```text
┌─visibleWidth(NULL)─┐
│                  4 │
└────────────────────┘
```

## toTypeName {#totypename}

Возвращает имя типа переданного аргумента.

Если передан `NULL`, функция возвращает тип `Nullable(Nothing)`, который соответствует внутреннему представлению `NULL` в ClickHouse.

**Синтаксис**

```sql
toTypeName(value)
```

**Аргументы**

- `value` — Значение произвольного типа.

**Возвращаемое значение**

- Имя типа данных входного значения. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT toTypeName(123);
```

Результат:

```response
┌─toTypeName(123)─┐
│ UInt8           │
└─────────────────┘
```

## blockSize {#blockSize}

В ClickHouse запросы обрабатываются в [блоках](/development/architecture#block) (чанках). Эта функция возвращает размер (количество строк) блока, на котором была вызвана функция.

**Синтаксис**

```sql
blockSize()
```

**Пример**

Запрос:

```sql
DROP TABLE IF EXISTS test;
CREATE TABLE test (n UInt8) ENGINE = Memory;

INSERT INTO test
SELECT * FROM system.numbers LIMIT 5;

SELECT blockSize()
FROM test;
```

Результат:

```response
   ┌─blockSize()─┐
1. │           5 │
2. │           5 │
3. │           5 │
4. │           5 │
5. │           5 │
   └─────────────┘
```

## byteSize {#bytesize}

Возвращает оценку не сжатого объёма памяти своих аргументов.

**Синтаксис**

```sql
byteSize(argument [, ...])
```

**Аргументы**

- `argument` — Значение.

**Возвращаемое значение**

- Оценка объёма памяти аргументов. [UInt64](../data-types/int-uint.md).

**Примеры**

Для [String](../data-types/string.md) аргументов функция возвращает длину строки + 9 (терминальный ноль + длина).

Запрос:

```sql
SELECT byteSize('string');
```

Результат:

```text
┌─byteSize('string')─┐
│                 15 │
└────────────────────┘
```

Запрос:

```sql
CREATE TABLE test
(
    `key` Int32,
    `u8` UInt8,
    `u16` UInt16,
    `u32` UInt32,
    `u64` UInt64,
    `i8` Int8,
    `i16` Int16,
    `i32` Int32,
    `i64` Int64,
    `f32` Float32,
    `f64` Float64
)
ENGINE = MergeTree
ORDER BY key;

INSERT INTO test VALUES(1, 8, 16, 32, 64,  -8, -16, -32, -64, 32.32, 64.64);

SELECT key, byteSize(u8) AS `byteSize(UInt8)`, byteSize(u16) AS `byteSize(UInt16)`, byteSize(u32) AS `byteSize(UInt32)`, byteSize(u64) AS `byteSize(UInt64)`, byteSize(i8) AS `byteSize(Int8)`, byteSize(i16) AS `byteSize(Int16)`, byteSize(i32) AS `byteSize(Int32)`, byteSize(i64) AS `byteSize(Int64)`, byteSize(f32) AS `byteSize(Float32)`, byteSize(f64) AS `byteSize(Float64)` FROM test ORDER BY key ASC FORMAT Vertical;
```

Результат:

```text
Row 1:
──────
key:               1
byteSize(UInt8):   1
byteSize(UInt16):  2
byteSize(UInt32):  4
byteSize(UInt64):  8
byteSize(Int8):    1
byteSize(Int16):   2
byteSize(Int32):   4
byteSize(Int64):   8
byteSize(Float32): 4
byteSize(Float64): 8
```

Если у функции несколько аргументов, она накапливает их объёмы.

Запрос:

```sql
SELECT byteSize(NULL, 1, 0.3, '');
```

Результат:

```text
┌─byteSize(NULL, 1, 0.3, '')─┐
│                         19 │
└────────────────────────────┘
```

## materialize {#materialize}

Превращает константу в полноценную колонку, содержащую одно значение. Полные колонки и константы представлены по-разному в памяти. Функции обычно выполняют разный код для нормальных и постоянных аргументов, хотя результат обычно должен быть одинаковым. Эта функция может использоваться для отладки этого поведения.

**Синтаксис**

```sql
materialize(x)
```

**Параметры**

- `x` — Константа. [Constant](overview.md/#constants).

**Возвращаемое значение**

- Колонка, содержащая единственное значение `x`.

**Пример**

В приведённом ниже примере функция `countMatches` ожидает постоянный второй аргумент. Это поведение можно отладить, используя функцию `materialize`, чтобы превратить константу в полноценную колонку, проверяя, что функция вызывает ошибку для непостоянного аргумента.

Запрос:

```sql
SELECT countMatches('foobarfoo', 'foo');
SELECT countMatches('foobarfoo', materialize('foo'));
```

Результат:

```response
2
Code: 44. DB::Exception: Received from localhost:9000. DB::Exception: Illegal type of argument #2 'pattern' of function countMatches, expected constant String, got String
```

## ignore {#ignore}

Принимает произвольные аргументы и безусловно возвращает `0`. Аргумент всё ещё оценивается внутренне, что делает его полезным, например, для бенчмаркинга.

**Синтаксис**

```sql
ignore([arg1[, arg2[, ...]])
```

**Аргументы**

- Принимает произвольное количество аргументов произвольного типа, включая `NULL`.

**Возвращаемое значение**

- Возвращает `0`.

**Пример**

Запрос:

```sql
SELECT ignore(0, 'ClickHouse', NULL);
```

Результат:

```response
┌─ignore(0, 'ClickHouse', NULL)─┐
│                             0 │
└───────────────────────────────┘
```

## sleep {#sleep}

Используется для вступления задержки или паузы в выполнение запроса. Основное назначение — тестирование и отладка.

**Синтаксис**

```sql
sleep(seconds)
```

**Аргументы**

- `seconds`: [UInt*](../data-types/int-uint.md) или [Float](../data-types/float.md) Количество секунд, на которое нужно приостановить выполнение запроса, максимум 3 секунды. Это может быть дробное значение для указания долей секунды.

**Возвращаемое значение**

Эта функция ничего не возвращает.

**Пример**

```sql
SELECT sleep(2);
```

Эта функция ничего не возвращает. Однако, если вы выполните функцию с помощью `clickhouse client`, вы увидите что-то похожее на:

```response
SELECT sleep(2)

Query id: 8aa9943e-a686-45e1-8317-6e8e3a5596ac

┌─sleep(2)─┐
│        0 │
└──────────┘

1 row in set. Elapsed: 2.012 sec.
```

Этот запрос приостановит выполнение на 2 секунды перед завершением. В течение этого времени никакие результаты не будут возвращены, и запрос будет казаться зависшим или неотзывчивым.

**Детали реализации**

Функция `sleep()` обычно не используется в производственных средах, так как она может негативно повлиять на производительность запросов и отзывчивость системы. Однако она может быть полезна в следующих сценариях:

1. **Тестирование**: При тестировании или бенчмаркинге ClickHouse может возникнуть необходимость симулировать задержки или вводить паузы, чтобы наблюдать за поведением системы при определённых условиях.
2. **Отладка**: Если нужно проверить состояние системы или выполнение запроса в определённый момент времени, вы можете использовать `sleep()` для введения паузы, позволяющей вам собирать или наблюдать за соответствующей информацией.
3. **Симуляция**: В некоторых случаях вы можете захотеть смоделировать сценарии из реальной жизни, где возникают задержки или паузы, такие как сетевые задержки или внешние зависимости систем.

Важно использовать функцию `sleep()` разумно и только в случае необходимости, так как она может негативно повлиять на общую производительность и отзывчивость вашей системы ClickHouse.

## sleepEachRow {#sleepeachrow}

Приостанавливает выполнение запроса на определённое количество секунд для каждой строки в результирующем наборе.

**Синтаксис**

```sql
sleepEachRow(seconds)
```

**Аргументы**

- `seconds`: [UInt*](../data-types/int-uint.md) или [Float*](../data-types/float.md) Количество секунд, на которое нужно приостановить выполнение запроса для каждой строки в результирующем наборе, максимум 3 секунды. Это может быть дробное значение для указания долей секунды.

**Возвращаемое значение**

Эта функция возвращает те же входные значения, что и получает, не изменяя их.

**Пример**

```sql
SELECT number, sleepEachRow(0.5) FROM system.numbers LIMIT 5;
```

```response
┌─number─┬─sleepEachRow(0.5)─┐
│      0 │                 0 │
│      1 │                 0 │
│      2 │                 0 │
│      3 │                 0 │
│      4 │                 0 │
└────────┴───────────────────┘
```

Однако вывод будет отсрочен, с паузой в 0.5 секунды между каждой строкой.

Функция `sleepEachRow()` используется в основном для тестирования и отладки, как и функция `sleep()`. Она позволяет вам смоделировать задержки или вводить паузы в обработку каждой строки, что может быть полезным в таких сценариях, как:

1. **Тестирование**: При тестировании или бенчмаркинге производительности ClickHouse при определённых условиях вы можете использовать `sleepEachRow()` для моделирования задержек или ввода пауз для каждой обрабатываемой строки.
2. **Отладка**: Если вам нужно изучить состояние системы или выполнение запроса для каждой обрабатываемой строки, вы можете использовать `sleepEachRow()`, чтобы ввести паузы, позволяя вам собирать или проверять соответствующую информацию.
3. **Симуляция**: В некоторых случаях вы можете захотеть смоделировать сценарии из реальной жизни, где задержки или паузы происходят для каждой обрабатываемой строки, например, при взаимодействии с внешними системами или сетевыми задержками.

Как и [функция `sleep()`](#sleep), важно использовать `sleepEachRow()` разумно и только в случае необходимости, так как это может значительно повлиять на общую производительность и отзывчивость вашей системы ClickHouse, особенно при работе с большими наборами результатов.

## currentDatabase {#currentdatabase}

Возвращает имя текущей базы данных. Полезно в параметрах движков таблиц запросов `CREATE TABLE`, где необходимо указать базу данных.

**Синтаксис**

```sql
currentDatabase()
```

**Возвращаемое значение**

- Возвращает имя текущей базы данных. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT currentDatabase()
```

Результат:

```response
┌─currentDatabase()─┐
│ default           │
└───────────────────┘
```

## currentUser {#currentUser}

Возвращает имя текущего пользователя. В случае распределённого запроса возвращается имя пользователя, инициировавшего запрос.

**Синтаксис**

```sql
currentUser()
```

Псевдонимы: `user()`, `USER()`, `current_user()`. Псевдонимы нечувствительны к регистру.

**Возвращаемые значения**

- Имя текущего пользователя. [String](../data-types/string.md).
- В распределённых запросах — логин пользователя, инициировавшего запрос. [String](../data-types/string.md).

**Пример**

```sql
SELECT currentUser();
```

Результат:

```text
┌─currentUser()─┐
│ default       │
└───────────────┘
```

## currentSchemas {#currentschemas}

Возвращает массив с единственным элементом с именем текущей схемы базы данных.

**Синтаксис**

```sql
currentSchemas(bool)
```

Псевдоним: `current_schemas`.

**Аргументы**

- `bool`: логическое значение. [Bool](../data-types/boolean.md).

:::note
Логический аргумент игнорируется. Он существует только для совместимости с [реализацией](https://www.postgresql.org/docs/7.3/functions-misc.html) этой функции в PostgreSQL.
:::

**Возвращаемые значения**

- Возвращает массив с единственным элементом — именем текущей базы данных.

**Пример**

```sql
SELECT currentSchemas(true);
```

Результат:

```response
['default']
```

## isConstant {#isconstant}

Возвращает, является ли аргумент константным выражением.

Константное выражение — это выражение, результат которого известен во время анализа запроса, то есть до выполнения. Например, выражения по [литералам](../../sql-reference/syntax.md#literals) являются константными выражениями.

Эта функция в основном предназначена для разработки, отладки и демонстрации.

**Синтаксис**

```sql
isConstant(x)
```

**Аргументы**

- `x` — Выражение для проверки.

**Возвращаемые значения**

- `1`, если `x` является константой. [UInt8](../data-types/int-uint.md).
- `0`, если `x` является неконстантным. [UInt8](../data-types/int-uint.md).

**Примеры**

Запрос:

```sql
SELECT isConstant(x + 1) FROM (SELECT 43 AS x)
```

Результат:

```text
┌─isConstant(plus(x, 1))─┐
│                      1 │
└────────────────────────┘
```

Запрос:

```sql
WITH 3.14 AS pi SELECT isConstant(cos(pi))
```

Результат:

```text
┌─isConstant(cos(pi))─┐
│                   1 │
└─────────────────────┘
```

Запрос:

```sql
SELECT isConstant(number) FROM numbers(1)
```

Результат:

```text
┌─isConstant(number)─┐
│                  0 │
└────────────────────┘
```

## hasColumnInTable {#hascolumnintable}

Учитывая имя базы данных, имя таблицы и имя колонки как константные строки, возвращает 1, если данная колонка существует, иначе 0.

**Синтаксис**

```sql
hasColumnInTable(\['hostname'\[, 'username'\[, 'password'\]\],\] 'database', 'table', 'column')
```

**Параметры**

- `database` : имя базы данных. [String literal](/sql-reference/syntax#string)
- `table` : имя таблицы. [String literal](/sql-reference/syntax#string)
- `column` : имя колонки. [String literal](/sql-reference/syntax#string)
- `hostname` : имя удалённого сервера для проверки. [String literal](/sql-reference/syntax#string)
- `username` : имя пользователя для удалённого сервера. [String literal](/sql-reference/syntax#string)
- `password` : пароль для удалённого сервера. [String literal](/sql-reference/syntax#string)

**Возвращаемое значение**

- `1`, если данная колонка существует.
- `0`, в противном случае.

**Детали реализации**

Для элементов в вложенной структуре данных функция проверяет существование колонки. Для самой вложенной структуры данных функция возвращает 0.

**Пример**

Запрос:

```sql
SELECT hasColumnInTable('system','metrics','metric')
```

```response
1
```

```sql
SELECT hasColumnInTable('system','metrics','non-existing_column')
```

```response
0
```

## hasThreadFuzzer {#hasthreadfuzzer}

Возвращает, эффективно ли работает Thread Fuzzer. Может использоваться в тестах, чтобы предотвратить длительное выполнение.

**Синтаксис**

```sql
hasThreadFuzzer();
```

## bar {#bar}

Строит гистограмму.

`bar(x, min, max, width)` рисует полосу с шириной, пропорциональной `(x - min)` и равной `width` символов, когда `x = max`.

**Аргументы**

- `x` — Размер для отображения.
- `min, max` — Целые константы. Значение должно помещаться в `Int64`.
- `width` — Константа, положительное целое число, может быть дробным.

Полоса рисуется с точностью до одной восьмой символа.

Пример:

```sql
SELECT
    toHour(EventTime) AS h,
    count() AS c,
    bar(c, 0, 600000, 20) AS bar
FROM test.hits
GROUP BY h
ORDER BY h ASC
```

```text
┌──h─┬──────c─┬─bar────────────────┐
│  0 │ 292907 │ █████████▋         │
│  1 │ 180563 │ ██████             │
│  2 │ 114861 │ ███▋               │
│  3 │  85069 │ ██▋                │
│  4 │  68543 │ ██▎                │
│  5 │  78116 │ ██▌                │
│  6 │ 113474 │ ███▋               │
│  7 │ 170678 │ █████▋             │
│  8 │ 278380 │ █████████▎         │
│  9 │ 391053 │ █████████████      │
│ 10 │ 457681 │ ███████████████▎   │
│ 11 │ 493667 │ ████████████████▍  │
│ 12 │ 509641 │ ████████████████▊  │
│ 13 │ 522947 │ █████████████████▍ │
│ 14 │ 539954 │ █████████████████▊ │
│ 15 │ 528460 │ █████████████████▌ │
│ 16 │ 539201 │ █████████████████▊ │
│ 17 │ 523539 │ █████████████████▍ │
│ 18 │ 506467 │ ████████████████▊  │
│ 19 │ 520915 │ █████████████████▎ │
│ 20 │ 521665 │ █████████████████▍ │
│ 21 │ 542078 │ ██████████████████ │
│ 22 │ 493642 │ ████████████████▍  │
│ 23 │ 400397 │ █████████████▎     │
└────┴────────┴────────────────────┘
```

## transform {#transform}

Преобразует значение в соответствии с явно определённым сопоставлением некоторых элементов с другими. 
Существует два варианта этой функции:
### transform(x, array_from, array_to, default) {#transformx-array_from-array_to-default}

`x` – Что трансформировать.

`array_from` – Константный массив значений для преобразования.

`array_to` – Константный массив значений для преобразования значений из `from`.

`default` – Какое значение использовать, если `x` не равно никакому из значений в `from`.

`array_from` и `array_to` должны содержать одинаковое количество элементов.

Подпись:

Для `x`, равного одному из элементов в `array_from`, функция возвращает соответствующий элемент в `array_to`, то есть тот, который находится на том же индексе массива. В противном случае возвращается `default`. Если в `array_from` существует несколько совпадающих элементов, возвращается элемент, соответствующий первому из них.

`transform(T, Array(T), Array(U), U) -> U`

`T` и `U` могут быть числовыми, строковыми, или типов Date или DateTime. 
Та же буква (T или U) означает, что типы должны быть совместимыми, но не обязательно одинаковыми. Например, первым аргументом может быть тип `Int64`, в то время как вторым аргументом может быть тип `Array(UInt16)`.

Пример:

```sql
SELECT
    transform(SearchEngineID, [2, 3], ['Yandex', 'Google'], 'Other') AS title,
    count() AS c
FROM test.hits
WHERE SearchEngineID != 0
GROUP BY title
ORDER BY c DESC
```

```text
┌─title─────┬──────c─┐
│ Yandex    │ 498635 │
│ Google    │ 229872 │
│ Other     │ 104472 │
└───────────┴────────┘
```

### transform(x, array_from, array_to) {#transformx-array_from-array_to}

Аналогично другому варианту, но не имеет аргумента `default`. Если сопоставление не может быть найдено, возвращается `x`.

Пример:

```sql
SELECT
    transform(domain(Referer), ['yandex.ru', 'google.ru', 'vkontakte.ru'], ['www.yandex', 'example.com', 'vk.com']) AS s,
    count() AS c
FROM test.hits
GROUP BY domain(Referer)
ORDER BY count() DESC
LIMIT 10
```

```text
┌─s──────────────┬───────c─┐
│                │ 2906259 │
│ www.yandex     │  867767 │
│ ███████.ru     │  313599 │
│ mail.yandex.ru │  107147 │
│ ██████.ru      │  100355 │
│ █████████.ru   │   65040 │
│ news.yandex.ru │   64515 │
│ ██████.net     │   59141 │
│ example.com    │   57316 │
└────────────────┴─────────┘
```

## formatReadableDecimalSize {#formatreadabledecimalsize}

Учитывая размер (количество байт), эта функция возвращает читаемый, округленный размер с суффиксом (КБ, МБ и т.д.) в виде строки.

Обратные операции для этой функции — [parseReadableSize](#parsereadablesize), [parseReadableSizeOrZero](#parsereadablesizeorzero) и [parseReadableSizeOrNull](#parsereadablesizeornull).

**Синтаксис**

```sql
formatReadableDecimalSize(x)
```

**Пример**

Запрос:

```sql
SELECT
    arrayJoin([1, 1024, 1024*1024, 192851925]) AS filesize_bytes,
    formatReadableDecimalSize(filesize_bytes) AS filesize
```

Результат:

```text
┌─filesize_bytes─┬─filesize───┐
│              1 │ 1.00 B     │
│           1024 │ 1.02 KB   │
│        1048576 │ 1.05 MB   │
│      192851925 │ 192.85 MB │
└────────────────┴────────────┘
```

## formatReadableSize {#formatreadablesize}

Учитывая размер (количество байт), эта функция возвращает читаемый, округленный размер с суффиксом (КиБ, МиБ и т.д.) в виде строки.

Обратные операции для этой функции — [parseReadableSize](#parsereadablesize), [parseReadableSizeOrZero](#parsereadablesizeorzero) и [parseReadableSizeOrNull](#parsereadablesizeornull).

**Синтаксис**

```sql
formatReadableSize(x)
```
Псевдоним: `FORMAT_BYTES`.

:::note
Эта функция принимает любой числовой тип в качестве входа, но внутренне они преобразуются в Float64. Результаты могут быть не оптимальными для больших значений.
:::

**Пример**

Запрос:

```sql
SELECT
    arrayJoin([1, 1024, 1024*1024, 192851925]) AS filesize_bytes,
    formatReadableSize(filesize_bytes) AS filesize
```

Результат:

```text
┌─filesize_bytes─┬─filesize───┐
│              1 │ 1.00 B     │
│           1024 │ 1.00 KiB   │
│        1048576 │ 1.00 MiB   │
│      192851925 │ 183.92 MiB │
└────────────────┴────────────┘
```

## formatReadableQuantity {#formatreadablequantity}

Учитывая число, эта функция возвращает округлённое число с суффиксом (тысяча, миллион, миллиард и т.д.) в виде строки.

**Синтаксис**

```sql
formatReadableQuantity(x)
```

:::note
Эта функция принимает любой числовой тип в качестве входа, но внутренне они преобразуются в Float64. Результаты могут быть не оптимальными для больших значений.
:::

**Пример**

Запрос:

```sql
SELECT
    arrayJoin([1024, 1234 * 1000, (4567 * 1000) * 1000, 98765432101234]) AS number,
    formatReadableQuantity(number) AS number_for_humans
```

Результат:

```text
┌─────────number─┬─number_for_humans─┐
│           1024 │ 1.02 thousand     │
│        1234000 │ 1.23 million      │
│     4567000000 │ 4.57 billion      │
│ 98765432101234 │ 98.77 trillion    │
└────────────────┴───────────────────┘
```

## formatReadableTimeDelta {#formatreadabletimedelta}

Учитывая временной интервал (дельту) в секундах, эта функция возвращает временную дельту с годом/месяцем/днем/часом/минутой/секундой/миллисекундой/микросекундой/наносекундой в виде строки.

**Синтаксис**

```sql
formatReadableTimeDelta(column[, maximum_unit, minimum_unit])
```

:::note
Эта функция принимает любой числовой тип в качестве входа, но внутренне они преобразуются в Float64. Результаты могут быть не оптимальными для больших значений.
:::

**Аргументы**

- `column` — Колонка с числовой временной дельтой.
- `maximum_unit` — Необязательно. Максимальная единица для отображения.
  - Допустимые значения: `наносекунды`, `микросекунды`, `миллисекунды`, `секунды`, `минуты`, `часы`, `дни`, `месяцы`, `годы`.
  - Значение по умолчанию: `годы`.
- `minimum_unit` — Необязательно. Минимальная единица для отображения. Все меньшие единицы обрезаются.
  - Допустимые значения: `наносекунды`, `микросекунды`, `миллисекунды`, `секунды`, `минуты`, `часы`, `дни`, `месяцы`, `годы`.
  - Если явно указываемое значение больше, чем `maximum_unit`, выдается исключение.
  - Значение по умолчанию: `секунды`, если `maximum_unit` — `секунды` или больше, `наносекунды` в противном случае.

**Пример**

```sql
SELECT
    arrayJoin([100, 12345, 432546534]) AS elapsed,
    formatReadableTimeDelta(elapsed) AS time_delta
```

```text
┌────elapsed─┬─time_delta ─────────────────────────────────────────────────────┐
│        100 │ 1 minute and 40 seconds                                         │
│      12345 │ 3 hours, 25 minutes and 45 seconds                              │
│  432546534 │ 13 years, 8 months, 17 days, 7 hours, 48 minutes and 54 seconds │
└────────────┴─────────────────────────────────────────────────────────────────┘
```

```sql
SELECT
    arrayJoin([100, 12345, 432546534]) AS elapsed,
    formatReadableTimeDelta(elapsed, 'minutes') AS time_delta
```

```text
┌────elapsed─┬─time_delta ─────────────────────────────────────────────────────┐
│        100 │ 1 minute and 40 seconds                                         │
│      12345 │ 205 minutes and 45 seconds                                      │
│  432546534 │ 7209108 minutes and 54 seconds                                  │
└────────────┴─────────────────────────────────────────────────────────────────┘
```

```sql
SELECT
    arrayJoin([100, 12345, 432546534.00000006]) AS elapsed,
    formatReadableTimeDelta(elapsed, 'minutes', 'nanoseconds') AS time_delta
```

```text
┌────────────elapsed─┬─time_delta─────────────────────────────────────┐
│                100 │ 1 minute and 40 seconds                        │
│              12345 │ 205 minutes and 45 seconds                     │
│ 432546534.00000006 │ 7209108 minutes, 54 seconds and 60 nanoseconds │
└────────────────────┴────────────────────────────────────────────────┘
```

## parseReadableSize {#parsereadablesize}

Учитывая строку, содержащую размер байтов и `B`, `KiB`, `KB`, `MiB`, `MB` и т.д. в качестве единицы (т.е. [ISO/IEC 80000-13](https://en.wikipedia.org/wiki/ISO/IEC_80000) или десятичная единица байта), эта функция возвращает соответствующее количество байтов.  
Если функция не может разобрать входное значение, она выдаёт исключение.

Обратные операции для этой функции — [formatReadableSize](#formatreadablesize) и [formatReadableDecimalSize](#formatreadabledecimalsize).

**Синтаксис**

```sql
parseReadableSize(x)
```

**Аргументы**

- `x` : Читаемый размер с единицей байта по ISO/IEC 80000-13 или десятичной единицы байта ([String](../../sql-reference/data-types/string.md)).

**Возвращаемое значение**

- Количество байт, округлённое до ближайшего целого числа ([UInt64](../../sql-reference/data-types/int-uint.md)).

**Пример**

```sql
SELECT
    arrayJoin(['1 B', '1 KiB', '3 MB', '5.314 KiB']) AS readable_sizes,  
    parseReadableSize(readable_sizes) AS sizes;
```

```text
┌─readable_sizes─┬───sizes─┐
│ 1 B            │       1 │
│ 1 KiB          │    1024 │
│ 3 MB           │ 3000000 │
│ 5.314 KiB      │    5442 │
└────────────────┴─────────┘
```

## parseReadableSizeOrNull {#parsereadablesizeornull}

Учитывая строку, содержащую размер байтов и `B`, `KiB`, `KB`, `MiB`, `MB` и т.д. в качестве единицы (т.е. [ISO/IEC 80000-13](https://en.wikipedia.org/wiki/ISO/IEC_80000) или десятичная единица байта), эта функция возвращает соответствующее количество байтов.  
Если функция не может разобрать входное значение, она возвращает `NULL`.

Обратные операции для этой функции — [formatReadableSize](#formatreadablesize) и [formatReadableDecimalSize](#formatreadabledecimalsize).

**Синтаксис**

```sql
parseReadableSizeOrNull(x)
```

**Аргументы**

- `x` : Читаемый размер с единицей байта по ISO/IEC 80000-13 или десятичной единицы байта ([String](../../sql-reference/data-types/string.md)).

**Возвращаемое значение**

- Количество байтов, округленное до ближайшего целого числа, или NULL, если разбор входного значения не удался (Nullable([UInt64](../../sql-reference/data-types/int-uint.md))).

**Пример**

```sql
SELECT
    arrayJoin(['1 B', '1 KiB', '3 MB', '5.314 KiB', 'invalid']) AS readable_sizes,  
    parseReadableSizeOrNull(readable_sizes) AS sizes;
```

```text
┌─readable_sizes─┬───sizes─┐
│ 1 B            │       1 │
│ 1 KiB          │    1024 │
│ 3 MB           │ 3000000 │
│ 5.314 KiB      │    5442 │
│ invalid        │    ᴺᵁᴸᴸ │
└────────────────┴─────────┘
```

## parseReadableSizeOrZero {#parsereadablesizeorzero}

Учитывая строку, содержащую размер байтов и `B`, `KiB`, `KB`, `MiB`, `MB` и т.д. в качестве единицы (т.е. [ISO/IEC 80000-13](https://en.wikipedia.org/wiki/ISO/IEC_80000) или десятичная единица байта), эта функция возвращает соответствующее количество байтов. Если функция не может разобрать входное значение, она возвращает `0`.

Обратные операции для этой функции — [formatReadableSize](#formatreadablesize) и [formatReadableDecimalSize](#formatreadabledecimalsize).

**Синтаксис**

```sql
parseReadableSizeOrZero(x)
```

**Аргументы**

- `x` : Читаемый размер с единицей байта по ISO/IEC 80000-13 или десятичной единицы байта ([String](../../sql-reference/data-types/string.md)).

**Возвращаемое значение**

- Количество байт, округленное до ближайшего целого числа, или 0, если разбор входного значения не удался ([UInt64](../../sql-reference/data-types/int-uint.md)).

**Пример**

```sql
SELECT
    arrayJoin(['1 B', '1 KiB', '3 MB', '5.314 KiB', 'invalid']) AS readable_sizes,  
    parseReadableSizeOrZero(readable_sizes) AS sizes;
```

```text
┌─readable_sizes─┬───sizes─┐
│ 1 B            │       1 │
│ 1 KiB          │    1024 │
│ 3 MB           │ 3000000 │
│ 5.314 KiB      │    5442 │
│ invalid        │       0 │
└────────────────┴─────────┘
```
```yaml
title: 'Функции ClickHouse'
sidebar_label: 'Функции ClickHouse'
keywords: ['функции', 'ClickHouse', 'база данных']
description: 'Описание различных функций в ClickHouse для работы с данными и агрегациями.'
```

## parseTimeDelta {#parsetimedelta}

Разбирает последовательность чисел, за которой следует что-то, напоминающее единицу времени.

**Синтаксис**

```sql
parseTimeDelta(timestr)
```

**Аргументы**

- `timestr` — Последовательность чисел, за которой следует что-то, напоминающее единицу времени.

**Возвращаемое значение**

- Число с плавающей запятой, представляющее количество секунд.

**Пример**

```sql
SELECT parseTimeDelta('11s+22min')
```

```text
┌─parseTimeDelta('11s+22min')─┐
│                        1331 │
└─────────────────────────────┘
```

```sql
SELECT parseTimeDelta('1yr2mo')
```

```text
┌─parseTimeDelta('1yr2mo')─┐
│                 36806400 │
└──────────────────────────┘
```
## least {#least}

Возвращает наименьшее значение из одного или нескольких входных аргументов. Аргументы `NULL` игнорируются.

**Синтаксис**

```sql
least(a, b)
```

:::note
Версия [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) ввела изменения, несовместимые с предыдущими версиями, так что значения `NULL` игнорируются, в то время как раньше возвращалось `NULL`, если один из аргументов был `NULL`. Чтобы сохранить предыдущее поведение, установите настройку `least_greatest_legacy_null_behavior` (по умолчанию: `false`) в `true`. 
:::
## greatest {#greatest}

Возвращает наибольшее значение из одного или нескольких входных аргументов. Аргументы `NULL` игнорируются.

**Синтаксис**

```sql
greatest(a, b)
```

:::note
Версия [24.12](/whats-new/changelog/2024#a-id2412a-clickhouse-release-2412-2024-12-19) ввела изменения, несовместимые с предыдущими версиями, так что значения `NULL` игнорируются, в то время как раньше возвращалось `NULL`, если один из аргументов был `NULL`. Чтобы сохранить предыдущее поведение, установите настройку `least_greatest_legacy_null_behavior` (по умолчанию: `false`) в `true`. 
:::
## uptime {#uptime}

Возвращает время работы сервера в секундах. Если выполняется в контексте распределенной таблицы, эта функция генерирует нормальную колонку со значениями, относящимися к каждой шардовой части. В противном случае она производит постоянное значение.

**Синтаксис**

```sql
uptime()
```

**Возвращаемое значение**

- Значение времени в секундах. [UInt32](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT uptime() as Uptime;
```

Результат:

```response
┌─Uptime─┐
│  55867 │
└────────┘
```
## version {#version}

Возвращает текущую версию ClickHouse в виде строки в формате:

- Основная версия
- Минимальная версия
- Версия исправлений
- Количество коммитов с момента последнего стабильного релиза.

```text
major_version.minor_version.patch_version.number_of_commits_since_the_previous_stable_release
```

Если выполняется в контексте распределенной таблицы, эта функция генерирует нормальную колонку со значениями, относящимися к каждой шардовой части. В противном случае она производит постоянное значение.

**Синтаксис**

```sql
version()
```

**Аргументы**

Нет.

**Возвращаемое значение**

- Текущая версия ClickHouse. [String](../data-types/string).

**Детали реализации**

Нет.

**Пример**

Запрос:

```sql
SELECT version()
```

**Результат**:

```response
┌─version()─┐
│ 24.2.1.1  │
└───────────┘
```
## buildId {#buildid}

Возвращает идентификатор сборки, сгенерированный компилятором для выполняемого двоичного файла сервера ClickHouse. Если выполняется в контексте распределенной таблицы, эта функция генерирует нормальную колонку с значениями, относящимися к каждой шардовой части. В противном случае она производит постоянное значение.

**Синтаксис**

```sql
buildId()
```
## blockNumber {#blocknumber}

Возвращает монотонно возрастающий последовательный номер [блока](../../development/architecture.md#block), содержащего строку. Возвращаемый номер блока обновляется в порядке наилучших усилий, т.е. он может быть не полностью точным.

**Синтаксис**

```sql
blockNumber()
```

**Возвращаемое значение**

- Последовательный номер блока данных, в котором находится строка. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT blockNumber()
FROM
(
    SELECT *
    FROM system.numbers
    LIMIT 10
) SETTINGS max_block_size = 2
```

Результат:

```response
┌─blockNumber()─┐
│             7 │
│             7 │
└───────────────┘
┌─blockNumber()─┐
│             8 │
│             8 │
└───────────────┘
┌─blockNumber()─┐
│             9 │
│             9 │
└───────────────┘
┌─blockNumber()─┐
│            10 │
│            10 │
└───────────────┘
┌─blockNumber()─┐
│            11 │
│            11 │
└───────────────┘
```
## rowNumberInBlock {#rowNumberInBlock}

Возвращает для каждого [блока](../../development/architecture.md#block), обрабатываемого `rowNumberInBlock`, номер текущей строки. Возвращаемый номер начинается с 0 для каждого блока.

**Синтаксис**

```sql
rowNumberInBlock()
```

**Возвращаемое значение**

- Порядковый номер строки в блоке данных, начиная с 0. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT rowNumberInBlock()
FROM
(
    SELECT *
    FROM system.numbers_mt
    LIMIT 10
) SETTINGS max_block_size = 2
```

Результат:

```response
┌─rowNumberInBlock()─┐
│                  0 │
│                  1 │
└────────────────────┘
┌─rowNumberInBlock()─┐
│                  0 │
│                  1 │
└────────────────────┘
┌─rowNumberInBlock()─┐
│                  0 │
│                  1 │
└────────────────────┘
┌─rowNumberInBlock()─┐
│                  0 │
│                  1 │
└────────────────────┘
┌─rowNumberInBlock()─┐
│                  0 │
│                  1 │
└────────────────────┘
```
## rowNumberInAllBlocks {#rownumberinallblocks}

Возвращает уникальный номер строки для каждой строки, обработанной `rowNumberInAllBlocks`. Возвращаемые номера начинаются с 0.

**Синтаксис**

```sql
rowNumberInAllBlocks()
```

**Возвращаемое значение**

- Порядковый номер строки в блоке данных, начиная с 0. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT rowNumberInAllBlocks()
FROM
(
    SELECT *
    FROM system.numbers_mt
    LIMIT 10
)
SETTINGS max_block_size = 2
```

Результат:

```response
┌─rowNumberInAllBlocks()─┐
│                      0 │
│                      1 │
└────────────────────────┘
┌─rowNumberInAllBlocks()─┐
│                      4 │
│                      5 │
└────────────────────────┘
┌─rowNumberInAllBlocks()─┐
│                      2 │
│                      3 │
└────────────────────────┘
┌─rowNumberInAllBlocks()─┐
│                      6 │
│                      7 │
└────────────────────────┘
┌─rowNumberInAllBlocks()─┐
│                      8 │
│                      9 │
└────────────────────────┘
```
## normalizeQuery {#normalizequery}

Заменяет литералы, последовательности литералов и сложные алиасы (содержащие пробелы, более двух цифр или длиной не менее 36 байт, такие как UUID) на плейсхолдер `?`.

**Синтаксис**

```sql
normalizeQuery(x)
```

**Аргументы**

- `x` — Последовательность символов. [String](../data-types/string.md).

**Возвращаемое значение**

- Последовательность символов с плейсхолдерами. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT normalizeQuery('[1, 2, 3, x]') AS query;
```

Результат:

```result
┌─query────┐
│ [?.., x] │
└──────────┘
```
## normalizeQueryKeepNames {#normalizequerykeepnames}

Заменяет литералы, последовательности литералов на плейсхолдер `?`, но не заменяет сложные алиасы (содержащие пробелы, более двух цифр или длиной не менее 36 байт, такие как UUID). Это помогает лучше анализировать сложные журналы запросов.

**Синтаксис**

```sql
normalizeQueryKeepNames(x)
```

**Аргументы**

- `x` — Последовательность символов. [String](../data-types/string.md).

**Возвращаемое значение**

- Последовательность символов с плейсхолдерами. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT normalizeQuery('SELECT 1 AS aComplexName123'), normalizeQueryKeepNames('SELECT 1 AS aComplexName123');
```

Результат:

```result
┌─normalizeQuery('SELECT 1 AS aComplexName123')─┬─normalizeQueryKeepNames('SELECT 1 AS aComplexName123')─┐
│ SELECT ? AS `?`                               │ SELECT ? AS aComplexName123                            │
└───────────────────────────────────────────────┴────────────────────────────────────────────────────────┘
```
## normalizedQueryHash {#normalizedqueryhash}

Возвращает идентичные 64-разрядные хэш-значения без значений литералов для схожих запросов. Может быть полезным для анализа журналов запросов.

**Синтаксис**

```sql
normalizedQueryHash(x)
```

**Аргументы**

- `x` — Последовательность символов. [String](../data-types/string.md).

**Возвращаемое значение**

- Хэш-значение. [UInt64](/sql-reference/data-types/int-uint#integer-ranges).

**Пример**

Запрос:

```sql
SELECT normalizedQueryHash('SELECT 1 AS `xyz`') != normalizedQueryHash('SELECT 1 AS `abc`') AS res;
```

Результат:

```result
┌─res─┐
│   1 │
└─────┘
```
## normalizedQueryHashKeepNames {#normalizedqueryhashkeepnames}

Как [normalizedQueryHash](#normalizedqueryhash), возвращает идентичные 64-разрядные хэш-значения без значений литералов для схожих запросов, но не заменяет сложные алиасы (содержащие пробелы, более двух цифр или длиной не менее 36 байт, такие как UUID) на плейсхолдер перед хешированием. Может быть полезным для анализа журналов запросов.

**Синтаксис**

```sql
normalizedQueryHashKeepNames(x)
```

**Аргументы**

- `x` — Последовательность символов. [String](../data-types/string.md).

**Возвращаемое значение**

- Хэш-значение. [UInt64](/sql-reference/data-types/int-uint#integer-ranges).

**Пример**

```sql
SELECT normalizedQueryHash('SELECT 1 AS `xyz123`') != normalizedQueryHash('SELECT 1 AS `abc123`') AS normalizedQueryHash;
SELECT normalizedQueryHashKeepNames('SELECT 1 AS `xyz123`') != normalizedQueryHashKeepNames('SELECT 1 AS `abc123`') AS normalizedQueryHashKeepNames;
```

Результат:

```result
┌─normalizedQueryHash─┐
│                   0 │
└─────────────────────┘
┌─normalizedQueryHashKeepNames─┐
│                            1 │
└──────────────────────────────┘
```
## neighbor {#neighbor}

<DeprecatedBadge/>

Оконная функция, которая предоставляет доступ к строке с указанным смещением перед или после текущей строки данного столбца.

**Синтаксис**

```sql
neighbor(column, offset[, default_value])
```

Результат функции зависит от затронутых блоков данных и порядка данных в блоке.

:::note
Возвращает соседей только внутри обрабатываемого блока данных. Из-за этого ошибочного поведения функция считается УСТАРЕВШЕЙ; пожалуйста, используйте правильные оконные функции вместо этого.
:::

Порядок строк во время вычисления `neighbor()` может отличаться от порядка строк, возвращенных пользователю. Чтобы избежать этого, вы можете создать подзапрос с [ORDER BY](../../sql-reference/statements/select/order-by.md) и вызвать функцию из вне подзапроса.

**Аргументы**

- `column` — Имя колонки или скалярное выражение.
- `offset` — Количество строк для просмотра перед или после текущей строки в `column`. [Int64](../data-types/int-uint.md).
- `default_value` — Необязательный. Возвращаемое значение, если смещение превышает границы блока. Тип данных аффектируемых блоков данных.

**Возвращаемые значения**

- Значение `column` на расстоянии `offset` от текущей строки, если `offset` не выходит за границы блока.
- Значение по умолчанию из `column` или `default_value` (если указано), если `offset` находится за пределами границ блока.

:::note
Тип возвращаемого значения будет соответствовать типу данных аффектируемых блоков или типу значения по умолчанию.
:::

**Пример**

Запрос:

```sql
SELECT number, neighbor(number, 2) FROM system.numbers LIMIT 10;
```

Результат:

```text
┌─number─┬─neighbor(number, 2)─┐
│      0 │                   2 │
│      1 │                   3 │
│      2 │                   4 │
│      3 │                   5 │
│      4 │                   6 │
│      5 │                   7 │
│      6 │                   8 │
│      7 │                   9 │
│      8 │                   0 │
│      9 │                   0 │
└────────┴─────────────────────┘
```

Запрос:

```sql
SELECT number, neighbor(number, 2, 999) FROM system.numbers LIMIT 10;
```

Результат:

```text
┌─number─┬─neighbor(number, 2, 999)─┐
│      0 │                        2 │
│      1 │                        3 │
│      2 │                        4 │
│      3 │                        5 │
│      4 │                        6 │
│      5 │                        7 │
│      6 │                        8 │
│      7 │                        9 │
│      8 │                      999 │
│      9 │                      999 │
└────────┴──────────────────────────┘
```

Эту функцию можно использовать для вычисления показателя за год:

Запрос:

```sql
WITH toDate('2018-01-01') AS start_date
SELECT
    toStartOfMonth(start_date + (number * 32)) AS month,
    toInt32(month) % 100 AS money,
    neighbor(money, -12) AS prev_year,
    round(prev_year / money, 2) AS year_over_year
FROM numbers(16)
```

Результат:

```text
┌──────month─┬─money─┬─prev_year─┬─year_over_year─┐
│ 2018-01-01 │    32 │         0 │              0 │
│ 2018-02-01 │    63 │         0 │              0 │
│ 2018-03-01 │    91 │         0 │              0 │
│ 2018-04-01 │    22 │         0 │              0 │
│ 2018-05-01 │    52 │         0 │              0 │
│ 2018-06-01 │    83 │         0 │              0 │
│ 2018-07-01 │    13 │         0 │              0 │
│ 2018-08-01 │    44 │         0 │              0 │
│ 2018-09-01 │    75 │         0 │              0 │
│ 2018-10-01 │     5 │         0 │              0 │
│ 2018-11-01 │    36 │         0 │              0 │
│ 2018-12-01 │    66 │         0 │              0 │
│ 2019-01-01 │    97 │        32 │           0.33 │
│ 2019-02-01 │    28 │        63 │           2.25 │
│ 2019-03-01 │    56 │        91 │           1.62 │
│ 2019-04-01 │    87 │        22 │           0.25 │
└────────────┴───────┴───────────┴────────────────┘
```
## runningDifference {#runningDifference}

Вычисляет разницу между двумя последовательными значениями строк в блоке данных. Возвращает 0 для первой строки, а для последующих строк — разницу с предыдущей строкой.

:::note
Возвращает различия только внутри обрабатываемого блока данных. Из-за этого ошибочного поведения функция считается УСТАРЕВШЕЙ; пожалуйста, используйте правильные оконные функции вместо этого.
:::

Результат функции зависит от затронутых блоков данных и порядка данных в блоке.

Порядок строк во время вычисления `runningDifference()` может отличаться от порядка строк, возвращенных пользователю. Чтобы избежать этого, вы можете создать подзапрос с [ORDER BY](../../sql-reference/statements/select/order-by.md) и вызвать функцию из вне подзапроса.

**Синтаксис**

```sql
runningDifference(x)
```

**Пример**

Запрос:

```sql
SELECT
    EventID,
    EventTime,
    runningDifference(EventTime) AS delta
FROM
(
    SELECT
        EventID,
        EventTime
    FROM events
    WHERE EventDate = '2016-11-24'
    ORDER BY EventTime ASC
    LIMIT 5
)
```

Результат:

```text
┌─EventID─┬───────────EventTime─┬─delta─┐
│    1106 │ 2016-11-24 00:00:04 │     0 │
│    1107 │ 2016-11-24 00:00:05 │     1 │
│    1108 │ 2016-11-24 00:00:05 │     0 │
│    1109 │ 2016-11-24 00:00:09 │     4 │
│    1110 │ 2016-11-24 00:00:10 │     1 │
└─────────┴─────────────────────┴───────┘
```

Обратите внимание, что размер блока влияет на результат. Внутреннее состояние `runningDifference` сбрасывается для каждого нового блока.

Запрос:

```sql
SELECT
    number,
    runningDifference(number + 1) AS diff
FROM numbers(100000)
WHERE diff != 1
```

Результат:

```text
┌─number─┬─diff─┐
│      0 │    0 │
└────────┴──────┘
┌─number─┬─diff─┐
│  65536 │    0 │
└────────┴──────┘
```

Запрос:

```sql
set max_block_size=100000 -- default value is 65536!

SELECT
    number,
    runningDifference(number + 1) AS diff
FROM numbers(100000)
WHERE diff != 1
```

Результат:

```text
┌─number─┬─diff─┐
│      0 │    0 │
└────────┴──────┘
```
## runningDifferenceStartingWithFirstValue {#runningdifferencestartingwithfirstvalue}

:::note
Эта функция УСТАРЕЛА (см. примечание к `runningDifference`).
:::

То же самое, что и [runningDifference](/sql-reference/functions/other-functions#runningDifference), но возвращает значение первой строки как значение первой строки.
## runningConcurrency {#runningconcurrency}

Вычисляет количество одновременных событий. Каждое событие имеет время начала и время окончания. Время начала включается в событие, тогда как время окончания исключается. Столбцы с временем начала и временем окончания должны быть одного и того же типа данных. Функция вычисляет общее количество активных (одновременных) событий для каждого времени начала события.

:::tip
События должны быть упорядочены по времени начала в порядке возрастания. Если это требование нарушено, функция вызывает исключение. Каждый блок данных обрабатывается отдельно. Если события из разных блоков данных перекрываются, то их нельзя обработать правильно.
:::

**Синтаксис**

```sql
runningConcurrency(start, end)
```

**Аргументы**

- `start` — Столбец с временем начала событий. [Date](../data-types/date.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).
- `end` — Столбец с временем окончания событий. [Date](../data-types/date.md), [DateTime](../data-types/datetime.md) или [DateTime64](../data-types/datetime64.md).

**Возвращаемые значения**

- Количество одновременных событий на каждое время начала события. [UInt32](../data-types/int-uint.md)

**Пример**

Рассмотрим таблицу:

```text
┌──────start─┬────────end─┐
│ 2021-03-03 │ 2021-03-11 │
│ 2021-03-06 │ 2021-03-12 │
│ 2021-03-07 │ 2021-03-08 │
│ 2021-03-11 │ 2021-03-12 │
└────────────┴────────────┘
```

Запрос:

```sql
SELECT start, runningConcurrency(start, end) FROM example_table;
```

Результат:

```text
┌──────start─┬─runningConcurrency(start, end)─┐
│ 2021-03-03 │                              1 │
│ 2021-03-06 │                              2 │
│ 2021-03-07 │                              3 │
│ 2021-03-11 │                              2 │
└────────────┴────────────────────────────────┘
```
## MACNumToString {#macnumtostring}

Интерпретирует число UInt64 как MAC-адрес в формате big endian. Возвращает соответствующий MAC-адрес в формате AA:BB:CC:DD:EE:FF (числа в шестнадцатеричном формате, разделенные двоеточиями) в виде строки.

**Синтаксис**

```sql
MACNumToString(num)
```
## MACStringToNum {#macstringtonum}

Обратная функция MACNumToString. Если MAC-адрес имеет недопустимый формат, возвращает 0.

**Синтаксис**

```sql
MACStringToNum(s)
```
## MACStringToOUI {#macstringtooui}

Учитывая MAC-адрес в формате AA:BB:CC:DD:EE:FF (числа в шестнадцатеричном формате, разделенные двоеточиями), возвращает первые три октета как число UInt64. Если у MAC-адреса недопустимый формат, возвращает 0.

**Синтаксис**

```sql
MACStringToOUI(s)
```
## getSizeOfEnumType {#getsizeofenumtype}

Возвращает количество полей в [Enum](../data-types/enum.md). Исключение выбрасывается, если тип не `Enum`.

**Синтаксис**

```sql
getSizeOfEnumType(value)
```

**Аргументы:**

- `value` — Значение типа `Enum`.

**Возвращаемые значения**

- Количество полей с входными значениями `Enum`.

**Пример**

```sql
SELECT getSizeOfEnumType( CAST('a' AS Enum8('a' = 1, 'b' = 2) ) ) AS x
```

```text
┌─x─┐
│ 2 │
└───┘
```
## blockSerializedSize {#blockserializedsize}

Возвращает размер на диске без учета сжатия.

```sql
blockSerializedSize(value[, value[, ...]])
```

**Аргументы**

- `value` — Любое значение.

**Возвращаемые значения**

- Количество байтов, которые будут записаны на диск для блока значений без сжатия.

**Пример**

Запрос:

```sql
SELECT blockSerializedSize(maxState(1)) as x
```

Результат:

```text
┌─x─┐
│ 2 │
└───┘
```
## toColumnTypeName {#tocolumntypename}

Возвращает внутреннее имя типа данных, представляющего значение.

**Синтаксис**

```sql
toColumnTypeName(value)
```

**Аргументы:**

- `value` — Значение любого типа.

**Возвращаемые значения**

- Внутреннее имя типа данных, используемое для представления `value`.

**Пример**

Разница между `toTypeName` и `toColumnTypeName`:

```sql
SELECT toTypeName(CAST('2018-01-01 01:02:03' AS DateTime))
```

Результат:

```text
┌─toTypeName(CAST('2018-01-01 01:02:03', 'DateTime'))─┐
│ DateTime                                            │
└─────────────────────────────────────────────────────┘
```

Запрос:

```sql
SELECT toColumnTypeName(CAST('2018-01-01 01:02:03' AS DateTime))
```

Результат:

```text
┌─toColumnTypeName(CAST('2018-01-01 01:02:03', 'DateTime'))─┐
│ Const(UInt32)                                             │
└───────────────────────────────────────────────────────────┘
```

Пример показывает, что тип данных `DateTime` внутренне хранится как `Const(UInt32)`.
## dumpColumnStructure {#dumpcolumnstructure}

Выводит подробное описание структур данных в оперативной памяти.

```sql
dumpColumnStructure(value)
```

**Аргументы:**

- `value` — Значение любого типа.

**Возвращаемые значения**

- Описание структуры столбца, используемой для представления `value`.

**Пример**

```sql
SELECT dumpColumnStructure(CAST('2018-01-01 01:02:03', 'DateTime'))
```

```text
┌─dumpColumnStructure(CAST('2018-01-01 01:02:03', 'DateTime'))─┐
│ DateTime, Const(size = 1, UInt32(size = 1))                  │
└──────────────────────────────────────────────────────────────┘
```
## defaultValueOfArgumentType {#defaultvalueofargumenttype}

Возвращает значение по умолчанию для данного типа данных.

Не включает значения по умолчанию для пользовательских колонок, установленных пользователем.

**Синтаксис**

```sql
defaultValueOfArgumentType(expression)
```

**Аргументы:**

- `expression` — Произвольный тип значения или выражение, которое возвращает значение произвольного типа.

**Возвращаемые значения**

- `0` для чисел.
- Пустая строка для строк.
- `ᴺᵁᴸᴸ` для [Nullable](../data-types/nullable.md).

**Пример**

Запрос:

```sql
SELECT defaultValueOfArgumentType( CAST(1 AS Int8) )
```

Результат:

```text
┌─defaultValueOfArgumentType(CAST(1, 'Int8'))─┐
│                                           0 │
└─────────────────────────────────────────────┘
```

Запрос:

```sql
SELECT defaultValueOfArgumentType( CAST(1 AS Nullable(Int8) ) )
```

Результат:

```text
┌─defaultValueOfArgumentType(CAST(1, 'Nullable(Int8)'))─┐
│                                                  ᴺᵁᴸᴸ │
└───────────────────────────────────────────────────────┘
```
## defaultValueOfTypeName {#defaultvalueoftypename}

Возвращает значение по умолчанию для данного имени типа.

Не включает значения по умолчанию для пользовательских колонок, установленных пользователем.

```sql
defaultValueOfTypeName(type)
```

**Аргументы:**

- `type` — Строка, представляющая имя типа.

**Возвращаемые значения**

- `0` для чисел.
- Пустая строка для строк.
- `ᴺᵁᴸᴸ` для [Nullable](../data-types/nullable.md).

**Пример**

Запрос:

```sql
SELECT defaultValueOfTypeName('Int8')
```

Результат:

```text
┌─defaultValueOfTypeName('Int8')─┐
│                              0 │
└────────────────────────────────┘
```

Запрос:

```sql
SELECT defaultValueOfTypeName('Nullable(Int8)')
```

Результат:

```text
┌─defaultValueOfTypeName('Nullable(Int8)')─┐
│                                     ᴺᵁᴸᴸ │
└──────────────────────────────────────────┘
```
## indexHint {#indexhint}

Эта функция предназначена для отладки и инспекции. Она игнорирует свой аргумент и всегда возвращает 1. Аргументы не оцениваются.

Однако во время анализа индекса считается, что аргумент этой функции не обернут в `indexHint`. Это позволяет выбирать данные в диапазонах индекса по соответствующему условию, но без дальнейшей фильтрации по этому условию. Индекс в ClickHouse разреженный, и использование `indexHint` приведет к получению большего объема данных, чем указание того же условия напрямую.

**Синтаксис**

```sql
SELECT * FROM table WHERE indexHint(<expression>)
```

**Возвращаемое значение**

- `1`. [Uint8](../data-types/int-uint.md).

**Пример**

Вот пример тестовых данных из таблицы [ontime](../../getting-started/example-datasets/ontime.md).

Таблица:

```sql
SELECT count() FROM ontime
```

```text
┌─count()─┐
│ 4276457 │
└─────────┘
```

В таблице есть индексы по полям `(FlightDate, (Year, FlightDate))`.

Создайте запрос, который не использует индекс:

```sql
SELECT FlightDate AS k, count() FROM ontime GROUP BY k ORDER BY k
```

ClickHouse обработал всю таблицу (`Обработано 4.28 миллиона строк`).

Результат:

```text
┌──────────k─┬─count()─┐
│ 2017-01-01 │   13970 │
│ 2017-01-02 │   15882 │
........................
│ 2017-09-28 │   16411 │
│ 2017-09-29 │   16384 │
│ 2017-09-30 │   12520 │
└────────────┴─────────┘
```

Чтобы применить индекс, выберите конкретную дату:

```sql
SELECT FlightDate AS k, count() FROM ontime WHERE k = '2017-09-15' GROUP BY k ORDER BY k
```

Теперь ClickHouse использует индекс для обработки значительно меньшего количества строк (`Обработано 32.74 тысячи строк`).

Результат:

```text
┌──────────k─┬─count()─┐
│ 2017-09-15 │   16428 │
└────────────┴─────────┘
```

Теперь оберните выражение `k = '2017-09-15'` в функцию `indexHint`:

Запрос:

```sql
SELECT
    FlightDate AS k,
    count()
FROM ontime
WHERE indexHint(k = '2017-09-15')
GROUP BY k
ORDER BY k ASC
```

ClickHouse использовал индекс так же, как и ранее (`Обработано 32.74 тысячи строк`).
Выражение `k = '2017-09-15'` не использовалось при генерации результата.
В примере функция `indexHint` позволяет увидеть соседние даты.

Результат:

```text
┌──────────k─┬─count()─┐
│ 2017-09-14 │    7071 │
│ 2017-09-15 │   16428 │
│ 2017-09-16 │    1077 │
│ 2017-09-30 │    8167 │
└────────────┴─────────┘
```
## replicate {#replicate}

Создает массив с единственным значением.

:::note
Эта функция используется для внутренней реализации [arrayJoin](/sql-reference/functions/array-join).
:::

**Синтаксис**

```sql
replicate(x, arr)
```

**Аргументы**

- `x` — Значение, которым заполнит результирующий массив.
- `arr` — Массив. [Array](../data-types/array.md).

**Возвращаемое значение**

Массив такой же длины, как `arr`, заполненный значением `x`. [Array](../data-types/array.md).

**Пример**

Запрос:

```sql
SELECT replicate(1, ['a', 'b', 'c']);
```

Результат:

```text
┌─replicate(1, ['a', 'b', 'c'])─┐
│ [1,1,1]                       │
└───────────────────────────────┘
```
## revision {#revision}

Возвращает текущую [ревизию сервера ClickHouse](../../operations/system-tables/metrics#revision).

**Синтаксис**

```sql
revision()
```

**Возвращаемое значение**

- Текущая ревизия сервера ClickHouse. [UInt32](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT revision();
```

Результат:

```response
┌─revision()─┐
│      54485 │
└────────────┘
```
## filesystemAvailable {#filesystemavailable}

Возвращает количество свободного места в файловой системе, хранящей данные базы данных. Возвращаемое значение всегда меньше общего свободного места ([filesystemUnreserved](#filesystemunreserved)), так как часть места зарезервирована для операционной системы.

**Синтаксис**

```sql
filesystemAvailable()
```

**Возвращаемое значение**

- Количество оставшегося пространства в байтах. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT formatReadableSize(filesystemAvailable()) AS "Available space";
```

Результат:

```text
┌─Available space─┐
│ 30.75 GiB       │
└─────────────────┘
```
## filesystemUnreserved {#filesystemunreserved}

Возвращает общий объем свободного пространства на файловой системе, хранящей данные базы данных. (ранее `filesystemFree`). См. также [`filesystemAvailable`](#filesystemavailable).

**Синтаксис**

```sql
filesystemUnreserved()
```

**Возвращаемое значение**

- Количество свободного пространства в байтах. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT formatReadableSize(filesystemUnreserved()) AS "Free space";
```

Результат:

```text
┌─Free space─┐
│ 32.39 GiB  │
└────────────┘
```
## filesystemCapacity {#filesystemcapacity}

Возвращает емкость файловой системы в байтах. Необходимо настроить [path](../../operations/server-configuration-parameters/settings.md#path) к каталогу данных.

**Синтаксис**

```sql
filesystemCapacity()
```

**Возвращаемое значение**

- Емкость файловой системы в байтах. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT formatReadableSize(filesystemCapacity()) AS "Capacity";
```

Результат:

```text
┌─Capacity──┐
│ 39.32 GiB │
└───────────┘
```
## initializeAggregation {#initializeaggregation}

Вычисляет результат агрегатной функции на основе единственного значения. Эта функция может быть использована для инициализации агрегатных функций с комбинатором [-State](/sql-reference/aggregate-functions/combinators#-state). Вы можете создавать состояния агрегатных функций и вставлять их в колонки типа [AggregateFunction](/sql-reference/data-types/aggregatefunction) или использовать инициализированные агрегаты в качестве значений по умолчанию.

**Синтаксис**

```sql
initializeAggregation (aggregate_function, arg1, arg2, ..., argN)
```

**Аргументы**

- `aggregate_function` — Имя агрегатной функции для инициализации. [String](../data-types/string.md).
- `arg` — Аргументы агрегатной функции.

**Возвращаемое значение(я)**

- Результат агрегирования для каждой строки, переданной функции.

Тип возвращаемого значения остается таким же, как тип возвращаемого значения функции, то есть `initializeAggregation` берет в качестве первого аргумента.

**Пример**

Запрос:

```sql
SELECT uniqMerge(state) FROM (SELECT initializeAggregation('uniqState', number % 3) AS state FROM numbers(10000));
```

Результат:

```text
┌─uniqMerge(state)─┐
│                3 │
└──────────────────┘
```

Запрос:

```sql
SELECT finalizeAggregation(state), toTypeName(state) FROM (SELECT initializeAggregation('sumState', number % 3) AS state FROM numbers(5));
```

Результат:

```text
┌─finalizeAggregation(state)─┬─toTypeName(state)─────────────┐
│                          0 │ AggregateFunction(sum, UInt8) │
│                          1 │ AggregateFunction(sum, UInt8) │
│                          2 │ AggregateFunction(sum, UInt8) │
│                          0 │ AggregateFunction(sum, UInt8) │
│                          1 │ AggregateFunction(sum, UInt8) │
└────────────────────────────┴───────────────────────────────┘
```

Пример с использованием движка таблицы `AggregatingMergeTree` и колонки `AggregateFunction`:

```sql
CREATE TABLE metrics
(
    key UInt64,
    value AggregateFunction(sum, UInt64) DEFAULT initializeAggregation('sumState', toUInt64(0))
)
ENGINE = AggregatingMergeTree
ORDER BY key
```

```sql
INSERT INTO metrics VALUES (0, initializeAggregation('sumState', toUInt64(42)))
```

**См. также**

- [arrayReduce](../../sql-reference/functions/array-functions.md#arrayreduce)
```yaml
title: 'Функции агрегирования'
sidebar_label: 'Функции агрегирования'
keywords: ['finalizeAggregation', 'runningAccumulate', 'joinGet', 'joinGetOrNull', 'catboostEvaluate', 'throwIf', 'identity', 'getSetting', 'getSettingOrDefault', 'isDecimalOverflow', 'countDigits', 'errorCodeToName', 'tcpPort', 'currentProfiles', 'enabledProfiles', 'defaultProfiles', 'currentRoles', 'enabledRoles', 'defaultRoles', 'getServerPort', 'queryID', 'initialQueryID', 'initialQueryStartTime', 'partitionID', 'shardNum', 'shardCount', 'getOSKernelVersion', 'zookeeperSessionUptime']
description: 'Документация по функциям агрегирования ClickHouse'
```

## finalizeAggregation {#finalizeaggregation}

Учитывая состояние агрегатной функции, эта функция возвращает результат агрегации (или финализированное состояние при использовании комбинирования [-State](/sql-reference/aggregate-functions/combinators#-state)).

**Синтаксис**

```sql
finalizeAggregation(state)
```

**Аргументы**

- `state` — Состояние агрегации. [AggregateFunction](/sql-reference/data-types/aggregatefunction).

**Возвращаемое значение(я)**

- Значение/значения, которые были агрегированы.

:::note
Тип возвращаемого значения равен типам, которые были агрегированы.
:::

**Примеры**

Запрос:

```sql
SELECT finalizeAggregation(( SELECT countState(number) FROM numbers(10)));
```

Результат:

```text
┌─finalizeAggregation(_subquery16)─┐
│                               10 │
└──────────────────────────────────┘
```

Запрос:

```sql
SELECT finalizeAggregation(( SELECT sumState(number) FROM numbers(10)));
```

Результат:

```text
┌─finalizeAggregation(_subquery20)─┐
│                               45 │
└──────────────────────────────────┘
```

Обратите внимание, что значения `NULL` игнорируются.

Запрос:

```sql
SELECT finalizeAggregation(arrayReduce('anyState', [NULL, 2, 3]));
```

Результат:

```text
┌─finalizeAggregation(arrayReduce('anyState', [NULL, 2, 3]))─┐
│                                                          2 │
└────────────────────────────────────────────────────────────┘
```

Скомбинированный пример:

Запрос:

```sql
WITH initializeAggregation('sumState', number) AS one_row_sum_state
SELECT
    number,
    finalizeAggregation(one_row_sum_state) AS one_row_sum,
    runningAccumulate(one_row_sum_state) AS cumulative_sum
FROM numbers(10);
```

Результат:

```text
┌─number─┬─one_row_sum─┬─cumulative_sum─┐
│      0 │           0 │              0 │
│      1 │           1 │              1 │
│      2 │           2 │              3 │
│      3 │           3 │              6 │
│      4 │           4 │             10 │
│      5 │           5 │             15 │
│      6 │           6 │             21 │
│      7 │           7 │             28 │
│      8 │           8 │             36 │
│      9 │           9 │             45 │
└────────┴─────────────┴────────────────┘
```

**См. также**

- [arrayReduce](../../sql-reference/functions/array-functions.md#arrayreduce)
- [initializeAggregation](#initializeaggregation)

## runningAccumulate {#runningaccumulate}

Аккумулирует состояния агрегатной функции для каждой строки блока данных.

:::note
Состояние сбрасывается для каждого нового блока данных.
Из-за этой ошибочной работы функция DEPRECATED, пожалуйста, используйте правильные оконные функции вместо этого.
:::

**Синтаксис**

```sql
runningAccumulate(agg_state[, grouping]);
```

**Аргументы**

- `agg_state` — Состояние агрегатной функции. [AggregateFunction](/sql-reference/data-types/aggregatefunction).
- `grouping` — Ключ группировки. Опционально. Состояние функции сбрасывается, если значение `grouping` меняется. Это может быть любым из [поддерживаемых типов данных](../data-types/index.md), для которых определен оператор равенства.

**Возвращаемое значение**

- Каждая результирующая строка содержит результат агрегатной функции, накопленный для всех входных строк от 0 до текущей позиции. `runningAccumulate` сбрасывает состояния для каждого нового блока данных или при изменении значения `grouping`.

Тип зависит от используемой агрегатной функции.

**Примеры**

Рассмотрите, как вы можете использовать `runningAccumulate`, чтобы найти кумулятивную сумму чисел без группировки и с группировкой.

Запрос:

```sql
SELECT k, runningAccumulate(sum_k) AS res FROM (SELECT number as k, sumState(k) AS sum_k FROM numbers(10) GROUP BY k ORDER BY k);
```

Результат:

```text
┌─k─┬─res─┐
│ 0 │   0 │
│ 1 │   1 │
│ 2 │   3 │
│ 3 │   6 │
│ 4 │  10 │
│ 5 │  15 │
│ 6 │  21 │
│ 7 │  28 │
│ 8 │  36 │
│ 9 │  45 │
└───┴─────┘
```

Подзапрос генерирует `sumState` для каждого числа от `0` до `9`. `sumState` возвращает состояние функции [sum](../../sql-reference/aggregate-functions/reference/sum.md), которое содержит сумму одного числа.

Весь запрос выполняет следующее:

1. Для первой строки `runningAccumulate` берет `sumState(0)` и возвращает `0`.
2. Для второй строки функция объединяет `sumState(0)` и `sumState(1)`, что приводит к `sumState(0 + 1)`, и возвращает `1` как результат.
3. Для третьей строки функция объединяет `sumState(0 + 1)` и `sumState(2)`, что приводит к `sumState(0 + 1 + 2)`, и возвращает `3` как результат.
4. Действия повторяются до окончания блока.

Следующий пример показывает использование параметра `grouping`:

Запрос:

```sql
SELECT
    grouping,
    item,
    runningAccumulate(state, grouping) AS res
FROM
(
    SELECT
        toInt8(number / 4) AS grouping,
        number AS item,
        sumState(number) AS state
    FROM numbers(15)
    GROUP BY item
    ORDER BY item ASC
);
```

Результат:

```text
┌─grouping─┬─item─┬─res─┐
│        0 │    0 │   0 │
│        0 │    1 │   1 │
│        0 │    2 │   3 │
│        0 │    3 │   6 │
│        1 │    4 │   4 │
│        1 │    5 │   9 │
│        1 │    6 │  15 │
│        1 │    7 │  22 │
│        2 │    8 │   8 │
│        2 │    9 │  17 │
│        2 │   10 │  27 │
│        2 │   11 │  38 │
│        3 │   12 │  12 │
│        3 │   13 │  25 │
│        3 │   14 │  39 │
└──────────┴──────┴─────┘
```

Как вы видите, `runningAccumulate` объединяет состояния для каждой группы строк отдельно.

## joinGet {#joinget}

Эта функция позволяет извлекать данные из таблицы так же, как из [словаря](../../sql-reference/dictionaries/index.md). Получает данные из [Join](../../engines/table-engines/special/join.md#creating-a-table) таблиц, используя указанный ключ соединения.

:::note
Поддерживает только таблицы, созданные с помощью оператора `ENGINE = Join(ANY, LEFT, <join_keys>)`.
:::

**Синтаксис**

```sql
joinGet(join_storage_table_name, `value_column`, join_keys)
```

**Аргументы**

- `join_storage_table_name` — идентификатор, указывающий, где производится поиск.
- `value_column` — имя колонки таблицы, содержащей необходимые данные.
- `join_keys` — список ключей.

:::note
Идентификатор ищется в базе данных по умолчанию (см. настройку `default_database` в файле конфигурации). Чтобы переопределить базу данных по умолчанию, используйте `USE db_name` или укажите базу данных и таблицу через разделитель `db_name.db_table`, как в примере.
:::

**Возвращаемое значение**

- Возвращает список значений, соответствующих списку ключей.

:::note
Если определенный ключ не существует в исходной таблице, то будет возвращено `0` или `null` в зависимости от настройки [join_use_nulls](../../operations/settings/settings.md#join_use_nulls) при создании таблицы.
Более подробная информация о `join_use_nulls` в [операции Join](../../engines/table-engines/special/join.md).
:::

**Пример**

Входная таблица:

```sql
CREATE DATABASE db_test;
CREATE TABLE db_test.id_val(`id` UInt32, `val` UInt32) ENGINE = Join(ANY, LEFT, id);
INSERT INTO db_test.id_val VALUES (1, 11)(2, 12)(4, 13);
SELECT * FROM db_test.id_val;
```

```text
┌─id─┬─val─┐
│  4 │  13 │
│  2 │  12 │
│  1 │  11 │
└────┴─────┘
```

Запрос:

```sql
SELECT number, joinGet(db_test.id_val, 'val', toUInt32(number)) from numbers(4);
```

Результат:

```text
┌─number─┬─joinGet('db_test.id_val', 'val', toUInt32(number))─┐
1. │      0 │                                                  0 │
2. │      1 │                                                 11 │
3. │      2 │                                                 12 │
4. │      3 │                                                  0 │
└────────┴────────────────────────────────────────────────────┘
```

Настройка `join_use_nulls` может быть использована при создании таблицы, чтобы изменить поведение с точки зрения того, что возвращается, если ключ не существует в исходной таблице.

```sql
CREATE DATABASE db_test;
CREATE TABLE db_test.id_val_nulls(`id` UInt32, `val` UInt32) ENGINE = Join(ANY, LEFT, id) SETTINGS join_use_nulls=1;
INSERT INTO db_test.id_val_nulls VALUES (1, 11)(2, 12)(4, 13);
SELECT * FROM db_test.id_val_nulls;
```

```text
┌─id─┬─val─┐
│  4 │  13 │
│  2 │  12 │
│  1 │  11 │
└────┴─────┘
```

Запрос:

```sql
SELECT number, joinGet(db_test.id_val_nulls, 'val', toUInt32(number)) from numbers(4);
```

Результат:

```text
┌─number─┬─joinGet('db_test.id_val_nulls', 'val', toUInt32(number))─┐
1. │      0 │                                                     ᴺᵁᴸᴸ │
2. │      1 │                                                       11 │
3. │      2 │                                                       12 │
4. │      3 │                                                     ᴺᵁᴸᴸ │
└────────┴──────────────────────────────────────────────────────────┘
```

## joinGetOrNull {#joingetornull}

Как и [joinGet](#joinget), но возвращает `NULL`, когда ключ отсутствует вместо возврата значения по умолчанию.

**Синтаксис**

```sql
joinGetOrNull(join_storage_table_name, `value_column`, join_keys)
```

**Аргументы**

- `join_storage_table_name` — идентификатор, указывающий, где производится поиск.
- `value_column` — имя колонки таблицы, содержащей необходимые данные.
- `join_keys` — список ключей.

:::note
Идентификатор ищется в базе данных по умолчанию (см. настройку `default_database` в файле конфигурации). Чтобы переопределить базу данных по умолчанию, используйте `USE db_name` или укажите базу данных и таблицу через разделитель `db_name.db_table`, как в примере.
:::

**Возвращаемое значение**

- Возвращает список значений, соответствующих списку ключей.

:::note
Если определенный ключ не существует в исходной таблице, для этого ключа будет возвращен `NULL`.
:::

**Пример**

Входная таблица:

```sql
CREATE DATABASE db_test;
CREATE TABLE db_test.id_val(`id` UInt32, `val` UInt32) ENGINE = Join(ANY, LEFT, id);
INSERT INTO db_test.id_val VALUES (1, 11)(2, 12)(4, 13);
SELECT * FROM db_test.id_val;
```

```text
┌─id─┬─val─┐
│  4 │  13 │
│  2 │  12 │
│  1 │  11 │
└────┴─────┘
```

Запрос:

```sql
SELECT number, joinGetOrNull(db_test.id_val, 'val', toUInt32(number)) from numbers(4);
```

Результат:

```text
┌─number─┬─joinGetOrNull('db_test.id_val', 'val', toUInt32(number))─┐
1. │      0 │                                                     ᴺᵁᴸᴸ │
2. │      1 │                                                       11 │
3. │      2 │                                                       12 │
4. │      3 │                                                     ᴺᵁᴸᴸ │
└────────┴──────────────────────────────────────────────────────────┘
```

## catboostEvaluate {#catboostevaluate}

<CloudNotSupportedBadge/>

:::note
Эта функция недоступна в ClickHouse Cloud.
:::

Оцените внешнюю модель catboost. [CatBoost](https://catboost.ai) — это библиотека градиентного бустинга с открытым исходным кодом, разработанная Яндексом для машинного обучения. 
Принимает путь к модели catboost и аргументы модели (признаки). Возвращает Float64.

**Синтаксис**

```sql
catboostEvaluate(path_to_model, feature_1, feature_2, ..., feature_n)
```

**Пример**

```sql
SELECT feat1, ..., feat_n, catboostEvaluate('/path/to/model.bin', feat_1, ..., feat_n) AS prediction
FROM data_table
```

**Предварительные условия**

1. Построить библиотеку оценки catboost

Перед оценкой моделей catboost библиотека `libcatboostmodel.<so|dylib>` должна быть доступна. Смотрите [документацию CatBoost](https://catboost.ai/docs/concepts/c-plus-plus-api_dynamic-c-pluplus-wrapper.html), чтобы узнать, как скомпилировать её.

Затем укажите путь к `libcatboostmodel.<so|dylib>` в конфигурации ClickHouse:

```xml
<clickhouse>
...
    <catboost_lib_path>/path/to/libcatboostmodel.so</catboost_lib_path>
...
</clickhouse>
```

По соображениям безопасности и изоляции оценка модели не выполняется в процессе сервера, а в процессе clickhouse-library-bridge.
При первом выполнении `catboostEvaluate()`, сервер запускает процесс библиотечного моста, если он еще не запущен. Оба процесса общаются через HTTP интерфейс. По умолчанию используется порт `9012`. Можно указать другой порт следующим образом — это полезно, если порт `9012` уже занят другим сервисом.

```xml
<library_bridge>
    <port>9019</port>
</library_bridge>
```

2. Обучить модель catboost с использованием libcatboost

Смотрите [Обучение и применение моделей](https://catboost.ai/docs/features/training.html#training), чтобы узнать, как обучать модели catboost на основе обучающего набора данных.

## throwIf {#throwif}

Вызывает исключение, если аргумент `x` истинный.

**Синтаксис**

```sql
throwIf(x[, message[, error_code]])
```

**Аргументы**

- `x` - условие для проверки.
- `message` - константная строка, предоставляющая собственное сообщение об ошибке. Необязательно.
- `error_code` - Константное целое число, предоставляющее собственный код ошибки. Необязательно.

Чтобы использовать аргумент `error_code`, необходимо включить параметр конфигурации `allow_custom_error_code_in_throwif`.

**Пример**

```sql
SELECT throwIf(number = 3, 'Слишком много') FROM numbers(10);
```

Результат:

```text
↙ Progress: 0.00 rows, 0.00 B (0.00 rows/s., 0.00 B/s.) Получено исключение от сервера (версия 19.14.1):
Код: 395. DB::Exception: Получено от localhost:9000. DB::Exception: Слишком много.
```

## identity {#identity}

Возвращает свой аргумент. Предназначен для отладки и тестирования. Позволяет отменить использование индекса и получить производительность запроса полного сканирования. Когда запрос анализируется для возможного использования индекса, анализатор игнорирует все функции `identity`. Также отключает сведение постоянных значений.

**Синтаксис**

```sql
identity(x)
```

**Пример**

Запрос:

```sql
SELECT identity(42);
```

Результат:

```text
┌─identity(42)─┐
│           42 │
└──────────────┘
```

## getSetting {#getsetting}

Возвращает текущее значение [пользовательской настройки](/operations/settings/query-level#custom_settings).

**Синтаксис**

```sql
getSetting('custom_setting');
```

**Параметр**

- `custom_setting` — Название настройки. [Строка](../data-types/string.md).

**Возвращаемое значение**

- Текущее значение настройки.

**Пример**

```sql
SET custom_a = 123;
SELECT getSetting('custom_a');
```

Результат:

```text
123
```

**См. также**

- [Пользовательские настройки](/operations/settings/query-level#custom_settings)

## getSettingOrDefault {#getsettingordefault}

Возвращает текущее значение [пользовательской настройки](/operations/settings/query-level#custom_settings) или возвращает значение по умолчанию, указанное во втором аргументе, если пользовательская настройка не установлена в текущем профиле.

**Синтаксис**

```sql
getSettingOrDefault('custom_setting', default_value);
```

**Параметр**

- `custom_setting` — Название настройки. [Строка](../data-types/string.md).
- `default_value` — Значение, которое нужно вернуть, если custom_setting не установлена. Значение может быть любого типа данных или Null.

**Возвращаемое значение**

- Текущее значение настройки или default_value, если настройка не установлена.

**Пример**

```sql
SELECT getSettingOrDefault('custom_undef1', 'my_value');
SELECT getSettingOrDefault('custom_undef2', 100);
SELECT getSettingOrDefault('custom_undef3', NULL);
```

Результат:

```text
my_value
100
NULL
```

**См. также**

- [Пользовательские настройки](/operations/settings/query-level#custom_settings)

## isDecimalOverflow {#isdecimaloverflow}

Проверяет, находится ли значение [Decimal](../data-types/decimal.md) вне его точности или вне заданной точности.

**Синтаксис**

```sql
isDecimalOverflow(d, [p])
```

**Аргументы**

- `d` — значение. [Decimal](../data-types/decimal.md).
- `p` — точность. Необязательно. Если опущен, используется начальная точность первого аргумента. Этот параметр может быть полезен для миграции данных из/в другую базу данных или файл. [UInt8](/sql-reference/data-types/int-uint#integer-ranges).

**Возвращаемые значения**

- `1` — Значение Decimal имеет больше цифр, чем разрешено его точностью,
- `0` — Значение Decimal соответствует заданной точности.

**Пример**

Запрос:

```sql
SELECT isDecimalOverflow(toDecimal32(1000000000, 0), 9),
       isDecimalOverflow(toDecimal32(1000000000, 0)),
       isDecimalOverflow(toDecimal32(-1000000000, 0), 9),
       isDecimalOverflow(toDecimal32(-1000000000, 0));
```

Результат:

```text
1    1    1    1
```

## countDigits {#countdigits}

Возвращает количество десятичных цифр, необходимых для представления значения.

**Синтаксис**

```sql
countDigits(x)
```

**Аргументы**

- `x` — значение [Int](../data-types/int-uint.md) или [Decimal](../data-types/decimal.md).

**Возвращаемое значение**

- Количество цифр. [UInt8](/sql-reference/data-types/int-uint#integer-ranges).

:::note
Для значений `Decimal` учитывает их масштабы: рассчитывает результат для базового целочисленного типа `(значение * масштаб)`. Например: `countDigits(42) = 2`, `countDigits(42.000) = 5`, `countDigits(0.04200) = 4`. То есть, вы можете проверить переполнение десятичных значений для `Decimal64`, используя `countDecimal(x) > 18`. Это медленный вариант [isDecimalOverflow](#isdecimaloverflow).
:::

**Пример**

Запрос:

```sql
SELECT countDigits(toDecimal32(1, 9)), countDigits(toDecimal32(-1, 9)),
       countDigits(toDecimal64(1, 18)), countDigits(toDecimal64(-1, 18)),
       countDigits(toDecimal128(1, 38)), countDigits(toDecimal128(-1, 38));
```

Результат:

```text
10    10    19    19    39    39
```

## errorCodeToName {#errorcodetoname}

- Текстовое название кода ошибки. [LowCardinality(String)](../data-types/lowcardinality.md).

**Синтаксис**

```sql
errorCodeToName(1)
```

Результат:

```text
UNSUPPORTED_METHOD
```

## tcpPort {#tcpport}

Возвращает номер порта TCP, прослушиваемого этим сервером для [нативного интерфейса](../../interfaces/tcp.md).
Если выполнено в контексте распределенной таблицы, эта функция генерирует нормальную колонку со значениями, относящимися к каждой шард. В противном случае возвращает постоянное значение.

**Синтаксис**

```sql
tcpPort()
```

**Аргументы**

- Нет.

**Возвращаемое значение**

- Номер порта TCP. [UInt16](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT tcpPort();
```

Результат:

```text
┌─tcpPort()─┐
│      9000 │
└───────────┘
```

**См. также**

- [tcp_port](../../operations/server-configuration-parameters/settings.md#tcp_port)

## currentProfiles {#currentprofiles}

Возвращает список текущих [профилей настроек](../../guides/sre/user-management/index.md#settings-profiles-management) для текущего пользователя.

Команда [SET PROFILE](/sql-reference/functions/other-functions#currentprofiles) может быть использована для изменения текущего профиля настроек. Если команда `SET PROFILE` не использовалась, функция возвращает профили, указанные в определении текущего пользователя (см. [CREATE USER](/sql-reference/statements/create/user)).

**Синтаксис**

```sql
currentProfiles()
```

**Возвращаемое значение**

- Список текущих пользовательских профилей настроек. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).

## enabledProfiles {#enabledprofiles}

Возвращает профили настроек, назначенные текущему пользователю как явно, так и неявно. Явно назначенные профили такие же, как возвращенные функцией [currentProfiles](#currentprofiles). Неявно назначенные профили включают родительские профили других назначенных профилей, профили, назначенные через предоставленные роли, профили, назначенные через собственные настройки и основной профиль по умолчанию (см. раздел `default_profile` в основном файле конфигурации сервера).

**Синтаксис**

```sql
enabledProfiles()
```

**Возвращаемое значение**

- Список включенных профилей настроек. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).

## defaultProfiles {#defaultprofiles}

Возвращает все профили, указанные в определении текущего пользователя (см. оператор [CREATE USER](/sql-reference/statements/create/user)).

**Синтаксис**

```sql
defaultProfiles()
```

**Возвращаемое значение**

- Список профилей настроек по умолчанию. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).

## currentRoles {#currentroles}

Возвращает роли, назначенные текущему пользователю. Роли можно изменить с оператором [SET ROLE](/sql-reference/statements/set-role). Если оператора `SET ROLE` не было, функция `currentRoles` возвращает то же самое, что и `defaultRoles`.

**Синтаксис**

```sql
currentRoles()
```

**Возвращаемое значение**

- Список текущих ролей для текущего пользователя. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).

## enabledRoles {#enabledroles}

Возвращает имена текущих ролей и ролей, предоставленных некоторым текущим ролям.

**Синтаксис**

```sql
enabledRoles()
```

**Возвращаемое значение**

- Список включенных ролей для текущего пользователя. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).

## defaultRoles {#defaultroles}

Возвращает роли, которые включены по умолчанию для текущего пользователя при входе. Изначально это все роли, предоставленные текущему пользователю (см. [GRANT](../../sql-reference/statements/grant.md#select)), но это можно изменить с помощью оператора [SET DEFAULT ROLE](/sql-reference/statements/set-role#set-default-role).

**Синтаксис**

```sql
defaultRoles()
```

**Возвращаемое значение**

- Список ролей по умолчанию для текущего пользователя. [Массив](../data-types/array.md)([Строка](../data-types/string.md)).

## getServerPort {#getserverport}

Возвращает номер порта сервера. Когда порт не используется сервером, выбрасывает исключение.

**Синтаксис**

```sql
getServerPort(port_name)
```

**Аргументы**

- `port_name` — Название порта сервера. [Строка](/sql-reference/data-types/string). Возможные значения:

  - 'tcp_port'
  - 'tcp_port_secure'
  - 'http_port'
  - 'https_port'
  - 'interserver_http_port'
  - 'interserver_https_port'
  - 'mysql_port'
  - 'postgresql_port'
  - 'grpc_port'
  - 'prometheus.port'

**Возвращаемое значение**

- Номер порта сервера. [UInt16](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT getServerPort('tcp_port');
```

Результат:

```text
┌─getServerPort('tcp_port')─┐
│ 9000                      │
└───────────────────────────┘
```

## queryID {#queryid}

Возвращает ID текущего запроса. Другие параметры запроса можно извлечь из таблицы [system.query_log](../../operations/system-tables/query_log.md) через `query_id`.

В отличие от функции [initialQueryID](#initialqueryid), `queryID` может возвращать разные результаты на разных шардах (см. пример).

**Синтаксис**

```sql
queryID()
```

**Возвращаемое значение**

- ID текущего запроса. [Строка](../data-types/string.md)

**Пример**

Запрос:

```sql
CREATE TABLE tmp (str String) ENGINE = Log;
INSERT INTO tmp (*) VALUES ('a');
SELECT count(DISTINCT t) FROM (SELECT queryID() AS t FROM remote('127.0.0.{1..3}', currentDatabase(), 'tmp') GROUP BY queryID());
```

Результат:

```text
┌─count()─┐
│ 3       │
└─────────┘
```

## initialQueryID {#initialqueryid}

Возвращает ID начального текущего запроса. Другие параметры запроса можно извлечь из таблицы [system.query_log](../../operations/system-tables/query_log.md) через `initial_query_id`.

В отличие от функции [queryID](/sql-reference/functions/other-functions#queryid), `initialQueryID` возвращает одни и те же результаты на разных шардах (см. пример).

**Синтаксис**

```sql
initialQueryID()
```

**Возвращаемое значение**

- ID начального текущего запроса. [Строка](../data-types/string.md)

**Пример**

Запрос:

```sql
CREATE TABLE tmp (str String) ENGINE = Log;
INSERT INTO tmp (*) VALUES ('a');
SELECT count(DISTINCT t) FROM (SELECT initialQueryID() AS t FROM remote('127.0.0.{1..3}', currentDatabase(), 'tmp') GROUP BY queryID());
```

Результат:

```text
┌─count()─┐
│ 1       │
└─────────┘
```

## initialQueryStartTime {#initialquerystarttime}

Возвращает время начала начального текущего запроса.

`initialQueryStartTime` возвращает одни и те же результаты на разных шардах (см. пример).

**Синтаксис**

```sql
initialQueryStartTime()
```

**Возвращаемое значение**

- Время начала начального текущего запроса. [DateTime](../data-types/datetime.md)

**Пример**

Запрос:

```sql
CREATE TABLE tmp (str String) ENGINE = Log;
INSERT INTO tmp (*) VALUES ('a');
SELECT count(DISTINCT t) FROM (SELECT initialQueryStartTime() AS t FROM remote('127.0.0.{1..3}', currentDatabase(), 'tmp') GROUP BY queryID());
```

Результат:

```text
┌─count()─┐
│ 1       │
└─────────┘
```

## partitionID {#partitionid}

Вычисляет [ID партиции](../../engines/table-engines/mergetree-family/custom-partitioning-key.md).

:::note
Эта функция медленная и не должна вызываться для большого объема строк.
:::

**Синтаксис**

```sql
partitionID(x[, y, ...]);
```

**Аргументы**

- `x` — Колонка, для которой нужно вернуть ID партиции.
- `y, ...` — Оставшиеся N колонок, для которых нужно вернуть ID партиции (опционально).

**Возвращаемое значение**

- ID партиции, к которой будет принадлежать строка. [Строка](../data-types/string.md).

**Пример**

Запрос:

```sql
DROP TABLE IF EXISTS tab;

CREATE TABLE tab
(
  i int,
  j int
)
ENGINE = MergeTree
PARTITION BY i
ORDER BY tuple();

INSERT INTO tab VALUES (1, 1), (1, 2), (1, 3), (2, 4), (2, 5), (2, 6);

SELECT i, j, partitionID(i), _partition_id FROM tab ORDER BY i, j;
```

Результат:

```response
┌─i─┬─j─┬─partitionID(i)─┬─_partition_id─┐
│ 1 │ 1 │ 1              │ 1             │
│ 1 │ 2 │ 1              │ 1             │
│ 1 │ 3 │ 1              │ 1             │
└───┴───┴────────────────┴───────────────┘
┌─i─┬─j─┬─partitionID(i)─┬─_partition_id─┐
│ 2 │ 4 │ 2              │ 2             │
│ 2 │ 5 │ 2              │ 2             │
│ 2 │ 6 │ 2              │ 2             │
└───┴───┴────────────────┴───────────────┘
```

## shardNum {#shardnum}

Возвращает индекс шара, который обрабатывает часть данных в распределенном запросе. Индексы начинаются с `1`.
Если запрос не распределен, то возвращается постоянное значение `0`.

**Синтаксис**

```sql
shardNum()
```

**Возвращаемое значение**

- Индекс шара или постоянное значение `0`. [UInt32](../data-types/int-uint.md).

**Пример**

В следующем примере используется конфигурация с двумя шарами. Запрос выполняется на таблице [system.one](../../operations/system-tables/one.md) на каждом шаре.

Запрос:

```sql
CREATE TABLE shard_num_example (dummy UInt8)
    ENGINE=Distributed(test_cluster_two_shards_localhost, system, one, dummy);
SELECT dummy, shardNum(), shardCount() FROM shard_num_example;
```

Результат:

```text
┌─dummy─┬─shardNum()─┬─shardCount()─┐
│     0 │          2 │            2 │
│     0 │          1 │            2 │
└───────┴────────────┴──────────────┘
```

**См. также**

- [Движок распределенной таблицы](../../engines/table-engines/special/distributed.md)

## shardCount {#shardcount}

Возвращает общее количество шаров для распределенного запроса.
Если запрос не распределен, то возвращается постоянное значение `0`.

**Синтаксис**

```sql
shardCount()
```

**Возвращаемое значение**

- Общее количество шаров или `0`. [UInt32](../data-types/int-uint.md).

**См. также**

- Пример функции [shardNum()](#shardnum) также содержит вызов функции `shardCount()`.

## getOSKernelVersion {#getoskernelversion}

Возвращает строку с текущей версией ядра ОС.

**Синтаксис**

```sql
getOSKernelVersion()
```

**Аргументы**

- Нет.

**Возвращаемое значение**

- Текущая версия ядра ОС. [Строка](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT getOSKernelVersion();
```

Результат:

```text
┌─getOSKernelVersion()────┐
│ Linux 4.15.0-55-generic │
└─────────────────────────┘
```

## zookeeperSessionUptime {#zookeepersessionuptime}

Возвращает время работы текущей сессии ZooKeeper в секундах.

**Синтаксис**

```sql
zookeeperSessionUptime()
```

**Аргументы**

- Нет.

**Возвращаемое значение**

- Время работы текущей сессии ZooKeeper в секундах. [UInt32](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT zookeeperSessionUptime();
```

Результат:

```text
┌─zookeeperSessionUptime()─┐
│                      286 │
└──────────────────────────┘
```
```yaml
title: 'Генерация случайных структур таблиц'
sidebar_label: 'generateRandomStructure'
keywords: ['генерация', 'случайная структура', 'таблицы']
description: 'Генерация случайной структуры таблицы в формате `column1_name column1_type, column2_name column2_type, ...`.'
```

## generateRandomStructure {#generaterandomstructure}

Генерирует случайную структуру таблицы в формате `column1_name column1_type, column2_name column2_type, ...`.

**Синтаксис**

```sql
generateRandomStructure([number_of_columns, seed])
```

**Аргументы**

- `number_of_columns` — Желаемое количество колонок в структуре таблицы результата. Если установлено в 0 или `Null`, количество колонок будет случайным от 1 до 128. Значение по умолчанию: `Null`.
- `seed` - Случайное семя для получения стабильных результатов. Если семя не указано или установлено в `Null`, оно генерируется случайным образом.

Все аргументы должны быть константами.

**Возвращаемое значение**

- Случайно сгенерированная структура таблицы. [String](../data-types/string.md).

**Примеры**

Запрос:

```sql
SELECT generateRandomStructure()
```

Результат:

```text
┌─generateRandomStructure()─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ c1 Decimal32(5), c2 Date, c3 Tuple(LowCardinality(String), Int128, UInt64, UInt16, UInt8, IPv6), c4 Array(UInt128), c5 UInt32, c6 IPv4, c7 Decimal256(64), c8 Decimal128(3), c9 UInt256, c10 UInt64, c11 DateTime │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Запрос:

```sql
SELECT generateRandomStructure(1)
```

Результат:

```text
┌─generateRandomStructure(1)─┐
│ c1 Map(UInt256, UInt16)    │
└────────────────────────────┘
```

Запрос:

```sql
SELECT generateRandomStructure(NULL, 33)
```

Результат:

```text
┌─generateRandomStructure(NULL, 33)─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ c1 DateTime, c2 Enum8('c2V0' = 0, 'c2V1' = 1, 'c2V2' = 2, 'c2V3' = 3), c3 LowCardinality(Nullable(FixedString(30))), c4 Int16, c5 Enum8('c5V0' = 0, 'c5V1' = 1, 'c5V2' = 2, 'c5V3' = 3), c6 Nullable(UInt8), c7 String, c8 Nested(e1 IPv4, e2 UInt8, e3 UInt16, e4 UInt16, e5 Int32, e6 Map(Date, Decimal256(70))) │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Примечание**: максимальная глубина вложенности сложных типов (Array, Tuple, Map, Nested) ограничена 16.

Эта функция может использоваться вместе с [generateRandom](../../sql-reference/table-functions/generate.md) для генерации совершенно случайных таблиц.

## structureToCapnProtoSchema {#structure_to_capn_proto_schema}

Преобразует структуру таблицы ClickHouse в схему CapnProto.

**Синтаксис**

```sql
structureToCapnProtoSchema(structure)
```

**Аргументы**

- `structure` — Структура таблицы в формате `column1_name column1_type, column2_name column2_type, ...`.
- `root_struct_name` — Имя корневой структуры в схеме CapnProto. Значение по умолчанию - `Message`;

**Возвращаемое значение**

- Схема CapnProto. [String](../data-types/string.md).

**Примеры**

Запрос:

```sql
SELECT structureToCapnProtoSchema('column1 String, column2 UInt32, column3 Array(String)') FORMAT RawBLOB
```

Результат:

```text
@0xf96402dd754d0eb7;

struct Message
{
    column1 @0 : Data;
    column2 @1 : UInt32;
    column3 @2 : List(Data);
}
```

Запрос:

```sql
SELECT structureToCapnProtoSchema('column1 Nullable(String), column2 Tuple(element1 UInt32, element2 Array(String)), column3 Map(String, String)') FORMAT RawBLOB
```

Результат:

```text
@0xd1c8320fecad2b7f;

struct Message
{
    struct Column1
    {
        union
        {
            value @0 : Data;
            null @1 : Void;
        }
    }
    column1 @0 : Column1;
    struct Column2
    {
        element1 @0 : UInt32;
        element2 @1 : List(Data);
    }
    column2 @1 : Column2;
    struct Column3
    {
        struct Entry
        {
            key @0 : Data;
            value @1 : Data;
        }
        entries @0 : List(Entry);
    }
    column3 @2 : Column3;
}
```

Запрос:

```sql
SELECT structureToCapnProtoSchema('column1 String, column2 UInt32', 'Root') FORMAT RawBLOB
```

Результат:

```text
@0x96ab2d4ab133c6e1;

struct Root
{
    column1 @0 : Data;
    column2 @1 : UInt32;
}
```

## structureToProtobufSchema {#structure_to_protobuf_schema}

Преобразует структуру таблицы ClickHouse в схему Protobuf.

**Синтаксис**

```sql
structureToProtobufSchema(structure)
```

**Аргументы**

- `structure` — Структура таблицы в формате `column1_name column1_type, column2_name column2_type, ...`.
- `root_message_name` — Имя корневого сообщения в схеме Protobuf. Значение по умолчанию - `Message`;

**Возвращаемое значение**

- Схема Protobuf. [String](../data-types/string.md).

**Примеры**

Запрос:

```sql
SELECT structureToProtobufSchema('column1 String, column2 UInt32, column3 Array(String)') FORMAT RawBLOB
```

Результат:

```text
syntax = "proto3";

message Message
{
    bytes column1 = 1;
    uint32 column2 = 2;
    repeated bytes column3 = 3;
}
```

Запрос:

```sql
SELECT structureToProtobufSchema('column1 Nullable(String), column2 Tuple(element1 UInt32, element2 Array(String)), column3 Map(String, String)') FORMAT RawBLOB
```

Результат:

```text
syntax = "proto3";

message Message
{
    bytes column1 = 1;
    message Column2
    {
        uint32 element1 = 1;
        repeated bytes element2 = 2;
    }
    Column2 column2 = 2;
    map<string, bytes> column3 = 3;
}
```

Запрос:

```sql
SELECT structureToProtobufSchema('column1 String, column2 UInt32', 'Root') FORMAT RawBLOB
```

Результат:

```text
syntax = "proto3";

message Root
{
    bytes column1 = 1;
    uint32 column2 = 2;
}
```

## formatQuery {#formatquery}

Возвращает отформатированную, возможно многострочную, версию данного SQL-запроса.

Вызывает исключение, если запрос не является хорошо сформированным. Для возвращения `NULL` вместо этого может использоваться функция `formatQueryOrNull()`.

**Синтаксис**

```sql
formatQuery(query)
formatQueryOrNull(query)
```

**Аргументы**

- `query` - SQL-запрос, который необходимо отформатировать. [String](../data-types/string.md)

**Возвращаемое значение**

- Отформатированный запрос. [String](../data-types/string.md).

**Пример**

```sql
SELECT formatQuery('select a,    b FRom tab WHERE a > 3 and  b < 3');
```

Результат:

```result
┌─formatQuery('select a,    b FRom tab WHERE a > 3 and  b < 3')─┐
│ SELECT
    a,
    b
FROM tab
WHERE (a > 3) AND (b < 3)            │
└───────────────────────────────────────────────────────────────┘
```

## formatQuerySingleLine {#formatquerysingleline}

Как formatQuery(), но возвращаемая отформатированная строка не содержит переносов строк.

Вызывает исключение, если запрос не является хорошо сформированным. Для возвращения `NULL` вместо этого может использоваться функция `formatQuerySingleLineOrNull()`.

**Синтаксис**

```sql
formatQuerySingleLine(query)
formatQuerySingleLineOrNull(query)
```

**Аргументы**

- `query` - SQL-запрос, который необходимо отформатировать. [String](../data-types/string.md)

**Возвращаемое значение**

- Отформатированный запрос. [String](../data-types/string.md).

**Пример**

```sql
SELECT formatQuerySingleLine('select a,    b FRom tab WHERE a > 3 and  b < 3');
```

Результат:

```result
┌─formatQuerySingleLine('select a,    b FRom tab WHERE a > 3 and  b < 3')─┐
│ SELECT a, b FROM tab WHERE (a > 3) AND (b < 3)                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## variantElement {#variantelement}

Извлекает колонку с указанным типом из колонки `Variant`.

**Синтаксис**

```sql
variantElement(variant, type_name, [, default_value])
```

**Аргументы**

- `variant` — колонка Variant. [Variant](../data-types/variant.md).
- `type_name` — Имя типа варианта, который необходимо извлечь. [String](../data-types/string.md).
- `default_value` - Значение по умолчанию, которое будет использоваться, если вариант не имеет варианта с указанным типом. Может быть любого типа. Необязательный.

**Возвращаемое значение**

- Подколонка колонки `Variant` с указанным типом.

**Пример**

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT v, variantElement(v, 'String'), variantElement(v, 'UInt64'), variantElement(v, 'Array(UInt64)') FROM test;
```

```text
┌─v─────────────┬─variantElement(v, 'String')─┬─variantElement(v, 'UInt64')─┬─variantElement(v, 'Array(UInt64)')─┐
│ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ                        │                        ᴺᵁᴸᴸ │ []                                 │
│ 42            │ ᴺᵁᴸᴸ                        │                          42 │ []                                 │
│ Hello, World! │ Hello, World!               │                        ᴺᵁᴸᴸ │ []                                 │
│ [1,2,3]       │ ᴺᵁᴸᴸ                        │                        ᴺᵁᴸᴸ │ [1,2,3]                            │
└───────────────┴─────────────────────────────┴─────────────────────────────┴────────────────────────────────────┘
```

## variantType {#varianttype}

Возвращает имя типа варианта для каждой строки колонки `Variant`. Если строка содержит NULL, для нее возвращается `'None'`.

**Синтаксис**

```sql
variantType(variant)
```

**Аргументы**

- `variant` — колонка Variant. [Variant](../data-types/variant.md).

**Возвращаемое значение**

- Enum8 колонка с именем типа варианта для каждой строки.

**Пример**

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT variantType(v) FROM test;
```

```text
┌─variantType(v)─┐
│ None           │
│ UInt64         │
│ String         │
│ Array(UInt64)  │
└────────────────┘
```

```sql
SELECT toTypeName(variantType(v)) FROM test LIMIT 1;
```

```text
┌─toTypeName(variantType(v))──────────────────────────────────────────┐
│ Enum8('None' = -1, 'Array(UInt64)' = 0, 'String' = 1, 'UInt64' = 2) │
└─────────────────────────────────────────────────────────────────────┘
```

## minSampleSizeConversion {#minsamplesizeconversion}

Вычисляет минимально необходимый размер выборки для A/B-теста, сравнивающего конверсии (доли) в двух выборках.

**Синтаксис**

```sql
minSampleSizeConversion(baseline, mde, power, alpha)
```

Использует формулу, описанную в [этой статье](https://towardsdatascience.com/required-sample-size-for-a-b-testing-6f6608dd330a). Предполагает равные размеры групп лечения и контроля. Возвращает размер выборки, необходимый для одной группы (т.е. размер выборки, необходимый для всего эксперимента, составляет удвоенное возвращаемое значение).

**Аргументы**

- `baseline` — Базовая конверсия. [Float](../data-types/float.md).
- `mde` — Минимально обнаружимый эффект (MDE) в процентных пунктах (например, для базовой конверсии 0.25, MDE 0.03 означает ожидаемое изменение до 0.25 ± 0.03). [Float](../data-types/float.md).
- `power` — Необходимая статистическая мощность теста (1 - вероятность ошибки второго рода). [Float](../data-types/float.md).
- `alpha` — Необходимый уровень значимости теста (вероятность ошибки первого рода). [Float](../data-types/float.md).

**Возвращаемое значение**

Именованный [Tuple](../data-types/tuple.md) с 3 элементами:

- `"minimum_sample_size"` — Необходимый размер выборки. [Float64](../data-types/float.md).
- `"detect_range_lower"` — Нижняя граница диапазона значений, которые не могут быть обнаружены при возвращаемом необходимом размере выборки (т.е. все значения меньше или равные `"detect_range_lower"` могут быть обнаружены с предоставленными `alpha` и `power`). Вычисляется как `baseline - mde`. [Float64](../data-types/float.md).
- `"detect_range_upper"` — Верхняя граница диапазона значений, которые не могут быть обнаружены при возвращаемом необходимом размере выборки (т.е. все значения больше или равные `"detect_range_upper"` могут быть обнаружены с предоставленными `alpha` и `power`). Вычисляется как `baseline + mde`. [Float64](../data-types/float.md).

**Пример**

Следующий запрос вычисляет необходимый размер выборки для A/B-теста с базовой конверсией 25%, MDE 3%, уровнем значимости 5% и желаемой статистической мощностью 80%:

```sql
SELECT minSampleSizeConversion(0.25, 0.03, 0.80, 0.05) AS sample_size;
```

Результат:

```text
┌─sample_size───────────────────┐
│ (3396.077603219163,0.22,0.28) │
└───────────────────────────────┘
```

## minSampleSizeContinuous {#minsamplesizecontinuous}

Вычисляет минимально необходимый размер выборки для A/B-теста, сравнивающего средние значения непрерывного показателя в двух выборках.

**Синтаксис**

```sql
minSampleSizeContinous(baseline, sigma, mde, power, alpha)
```

Псевдоним: `minSampleSizeContinous`

Использует формулу, описанную в [этой статье](https://towardsdatascience.com/required-sample-size-for-a-b-testing-6f6608dd330a). Предполагает равные размеры групп лечения и контроля. Возвращает необходимый размер выборки для одной группы (т.е. размер выборки, необходимый для всего эксперимента, составляет удвоенное возвращаемое значение). Также предполагает равную дисперсию тестируемого показателя в группах лечения и контроля.

**Аргументы**

- `baseline` — Базовое значение показателя. [Integer](../data-types/int-uint.md) или [Float](../data-types/float.md).
- `sigma` — Базовое стандартное отклонение показателя. [Integer](../data-types/int-uint.md) или [Float](../data-types/float.md).
- `mde` — Минимально обнаружимый эффект (MDE) в процентах от базового значения (например, для базового значения 112.25, MDE 0.03 означает ожидаемое изменение до 112.25 ± 112.25\*0.03). [Integer](../data-types/int-uint.md) или [Float](../data-types/float.md).
- `power` — Необходимая статистическая мощность теста (1 - вероятность ошибки второго рода). [Integer](../data-types/int-uint.md) или [Float](../data-types/float.md).
- `alpha` — Необходимый уровень значимости теста (вероятность ошибки первого рода). [Integer](../data-types/int-uint.md) или [Float](../data-types/float.md).

**Возвращаемое значение**

Именованный [Tuple](../data-types/tuple.md) с 3 элементами:

- `"minimum_sample_size"` — Необходимый размер выборки. [Float64](../data-types/float.md).
- `"detect_range_lower"` — Нижняя граница диапазона значений, которые не могут быть обнаружены при возвращаемом необходимом размере выборки (т.е. все значения меньше или равные `"detect_range_lower"` могут быть обнаружены с предоставленными `alpha` и `power`). Вычисляется как `baseline * (1 - mde)`. [Float64](../data-types/float.md).
- `"detect_range_upper"` — Верхняя граница диапазона значений, которые не могут быть обнаружены при возвращаемом необходимом размере выборки (т.е. все значения больше или равные `"detect_range_upper"` могут быть обнаружены с предоставленными `alpha` и `power`). Вычисляется как `baseline * (1 + mde)`. [Float64](../data-types/float.md).

**Пример**

Следующий запрос вычисляет необходимый размер выборки для A/B-теста на показателе с базовым значением 112.25, стандартным отклонением 21.1, MDE 3%, уровнем значимости 5% и желаемой статистической мощностью 80%:

```sql
SELECT minSampleSizeContinous(112.25, 21.1, 0.03, 0.80, 0.05) AS sample_size;
```

Результат:

```text
┌─sample_size───────────────────────────┐
│ (616.2931945826209,108.8825,115.6175) │
└───────────────────────────────────────┘
```

## connectionId {#connectionid}

Извлекает ID подключения клиента, который отправил текущий запрос, и возвращает его в качестве целого числа UInt64.

**Синтаксис**

```sql
connectionId()
```

Псевдоним: `connection_id`.

**Параметры**

Нет.

**Возвращаемое значение**

Текущий ID подключения. [UInt64](../data-types/int-uint.md).

**Подробности реализации**

Эта функция наиболее полезна в сценариях отладки или для внутренних целей в обработчике MySQL. Она была создана для совместимости с [функцией MySQL `CONNECTION_ID`](https://dev.mysql.com/doc/refman/8.0/en/information-functions.html#function_connection-id). Обычно не используется в производственных запросах.

**Пример**

Запрос:

```sql
SELECT connectionId();
```

```response
0
```

## getClientHTTPHeader {#getclienthttpheader}

Получает значение HTTP-заголовка.

Если такого заголовка не существует или текущий запрос не выполняется через HTTP-интерфейс, функция возвращает пустую строку. Некоторые HTTP-заголовки (например, `Authentication` и `X-ClickHouse-*`) являются ограниченными.

Функция требует, чтобы настройка `allow_get_client_http_header` была включена. Настройка по умолчанию не включена по причинам безопасности, потому что некоторые заголовки, такие как `Cookie`, могут содержать конфиденциальную информацию.

HTTP-заголовки чувствительны к регистру для этой функции.

Если функция используется в контексте распределенного запроса, она возвращает ненулевой результат только на узле-инициаторе.

## showCertificate {#showcertificate}

Показывает информацию о текущем сертификате Secure Sockets Layer (SSL) сервера, если он был настроен. См. [Настройка SSL-TLS](/guides/sre/configuring-ssl) для получения дополнительной информации о том, как настроить ClickHouse для использования сертификатов OpenSSL для проверки соединений.

**Синтаксис**

```sql
showCertificate()
```

**Возвращаемое значение**

- Словарь пар ключ-значение, относящихся к настроенному SSL-сертификату. [Map](../data-types/map.md)([String](../data-types/string.md), [String](../data-types/string.md)).

**Пример**

Запрос:

```sql
SELECT showCertificate() FORMAT LineAsString;
```

Результат:

```response
{'version':'1','serial_number':'2D9071D64530052D48308473922C7ADAFA85D6C5','signature_algo':'sha256WithRSAEncryption','issuer':'/CN=marsnet.local CA','not_before':'May  7 17:01:21 2024 GMT','not_after':'May  7 17:01:21 2025 GMT','subject':'/CN=chnode1','pkey_algo':'rsaEncryption'}
```

## lowCardinalityIndices {#lowcardinalityindices}

Возвращает позицию значения в словаре колонки [LowCardinality](../data-types/lowcardinality.md). Позиции начинаются с 1. Поскольку LowCardinality имеет словари на уровне частей, эта функция может возвращать разные позиции для одного и того же значения в разных частях.

**Синтаксис**

```sql
lowCardinalityIndices(col)
```

**Аргументы**

- `col` — колонка низкой кардинальности. [LowCardinality](../data-types/lowcardinality.md).

**Возвращаемое значение**

- Позиция значения в словаре текущей части. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
DROP TABLE IF EXISTS test;
CREATE TABLE test (s LowCardinality(String)) ENGINE = Memory;

-- создаем две части:

INSERT INTO test VALUES ('ab'), ('cd'), ('ab'), ('ab'), ('df');
INSERT INTO test VALUES ('ef'), ('cd'), ('ab'), ('cd'), ('ef');

SELECT s, lowCardinalityIndices(s) FROM test;
```

Результат:

```response
   ┌─s──┬─lowCardinalityIndices(s)─┐
1. │ ab │                        1 │
2. │ cd │                        2 │
3. │ ab │                        1 │
4. │ ab │                        1 │
5. │ df │                        3 │
   └────┴──────────────────────────┘
    ┌─s──┬─lowCardinalityIndices(s)─┐
 6. │ ef │                        1 │
 7. │ cd │                        2 │
 8. │ ab │                        3 │
 9. │ cd │                        2 │
10. │ ef │                        1 │
    └────┴──────────────────────────┘
```

## lowCardinalityKeys {#lowcardinalitykeys}

Возвращает словарные значения колонки [LowCardinality](../data-types/lowcardinality.md). Если блок меньше или больше размера словаря, результат будет усечен или расширен с помощью значений по умолчанию. Поскольку LowCardinality имеет словари на уровне частей, эта функция может возвращать разные словарные значения в разных частях.

**Синтаксис**

```sql
lowCardinalityIndices(col)
```

**Аргументы**

- `col` — колонка низкой кардинальности. [LowCardinality](../data-types/lowcardinality.md).

**Возвращаемое значение**

- Ключи словаря. [UInt64](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
DROP TABLE IF EXISTS test;
CREATE TABLE test (s LowCardinality(String)) ENGINE = Memory;

-- создаем две части:

INSERT INTO test VALUES ('ab'), ('cd'), ('ab'), ('ab'), ('df');
INSERT INTO test VALUES ('ef'), ('cd'), ('ab'), ('cd'), ('ef');

SELECT s, lowCardinalityKeys(s) FROM test;
```

Результат:

```response
   ┌─s──┬─lowCardinalityKeys(s)─┐
1. │ ef │                       │
2. │ cd │ ef                    │
3. │ ab │ cd                    │
4. │ cd │ ab                    │
5. │ ef │                       │
   └────┴───────────────────────┘
    ┌─s──┬─lowCardinalityKeys(s)─┐
 6. │ ab │                       │
 7. │ cd │ ab                    │
 8. │ ab │ cd                    │
 9. │ ab │ df                    │
10. │ df │                       │
    └────┴───────────────────────┘
```

## displayName {#displayname}

Возвращает значение `display_name` из [конфигурации](/operations/configuration-files) или полное доменное имя сервера (FQDN), если не установлено.

**Синтаксис**

```sql
displayName()
```

**Возвращаемое значение**

- Значение `display_name` из конфигурации или FQDN сервера, если не установлено. [String](../data-types/string.md).

**Пример**

`display_name` может быть установлен в `config.xml`. Рассмотрим, например, сервер с `display_name`, настроенным на 'production':

```xml
<!-- Это имя, которое будет показано в clickhouse-client.
     По умолчанию все, что содержит "production", будет выделено красным в запросе.
-->
<display_name>production</display_name>
```

Запрос:

```sql
SELECT displayName();
```

Результат:

```response
┌─displayName()─┐
│ production    │
└───────────────┘
```

## transactionID {#transactionid}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Возвращает ID [транзакции](/guides/developer/transactional#transactions-commit-and-rollback).

:::note
Эта функция является частью набора экспериментальных функций. Включите поддержку экспериментальных транзакций, добавив эту настройку в вашу конфигурацию:
```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

Для получения дополнительной информации см. на странице [Поддержка транзакций (ACID)](/guides/developer/transactional#transactions-commit-and-rollback).
:::

**Синтаксис**

```sql
transactionID()
```

**Возвращаемое значение**

- Возвращает кортеж, состоящий из `start_csn`, `local_tid` и `host_id`. [Tuple](../data-types/tuple.md).

- `start_csn`: Глобальный последовательный номер, самая новая временная метка коммита, которую видел этот транзакция во время её начала. [UInt64](../data-types/int-uint.md).
- `local_tid`: Локальный последовательный номер, уникальный для каждой транзакции, начатой этим хостом в рамках определенного start_csn. [UInt64](../data-types/int-uint.md).
- `host_id`: UUID хоста, который запустил эту транзакцию. [UUID](../data-types/uuid.md).

**Пример**

Запрос:

```sql
BEGIN TRANSACTION;
SELECT transactionID();
ROLLBACK;
```

Результат:

```response
┌─transactionID()────────────────────────────────┐
│ (32,34,'0ee8b069-f2bb-4748-9eae-069c85b5252b') │
└────────────────────────────────────────────────┘
```

## transactionLatestSnapshot {#transactionlatestsnapshot}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Возвращает новейший снимок (номер последовательности коммита) [транзакции](/guides/developer/transactional#transactions-commit-and-rollback), который доступен для чтения.

:::note
Эта функция является частью набора экспериментальных функций. Включите поддержку экспериментальных транзакций, добавив эту настройку в вашу конфигурацию:

```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

Для получения дополнительной информации см. на странице [Поддержка транзакций (ACID)](/guides/developer/transactional#transactions-commit-and-rollback).
:::

**Синтаксис**

```sql
transactionLatestSnapshot()
```

**Возвращаемое значение**

- Возвращает последний снимок (CSN) транзакции. [UInt64](../data-types/int-uint.md)

**Пример**

Запрос:

```sql
BEGIN TRANSACTION;
SELECT transactionLatestSnapshot();
ROLLBACK;
```

Результат:

```response
┌─transactionLatestSnapshot()─┐
│                          32 │
└─────────────────────────────┘
```

## transactionOldestSnapshot {#transactionoldestsnapshot}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Возвращает самый старый снимок (номер последовательности коммита), который виден для некоторой выполняющейся [транзакции](/guides/developer/transactional#transactions-commit-and-rollback).

:::note
Эта функция является частью набора экспериментальных функций. Включите поддержку экспериментальных транзакций, добавив эту настройку в вашу конфигурацию:

```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

Для получения дополнительной информации см. на странице [Поддержка транзакций (ACID)](/guides/developer/transactional#transactions-commit-and-rollback).
:::

**Синтаксис**

```sql
transactionOldestSnapshot()
```

**Возвращаемое значение**

- Возвращает самый старый снимок (CSN) транзакции. [UInt64](../data-types/int-uint.md)

**Пример**

Запрос:

```sql
BEGIN TRANSACTION;
SELECT transactionLatestSnapshot();
ROLLBACK;
```

Результат:

```response
┌─transactionOldestSnapshot()─┐
│                          32 │
└─────────────────────────────┘
```

## getSubcolumn {#getsubcolumn}

Берет выражение таблицы или идентификатор и постоянную строку с именем подполя, и возвращает запрашиваемое подполе, извлеченное из выражения.

**Синтаксис**

```sql
getSubcolumn(col_name, subcol_name)
```

**Аргументы**

- `col_name` — Выражение таблицы или идентификатор. [Expression](../syntax.md/#expressions), [Identifier](../syntax.md/#identifiers).
- `subcol_name` — Имя подполя. [String](../data-types/string.md).

**Возвращаемое значение**

- Возвращает извлеченное подполе.

**Пример**

Запрос:

```sql
CREATE TABLE t_arr (arr Array(Tuple(subcolumn1 UInt32, subcolumn2 String))) ENGINE = MergeTree ORDER BY tuple();
INSERT INTO t_arr VALUES ([(1, 'Hello'), (2, 'World')]), ([(3, 'This'), (4, 'is'), (5, 'subcolumn')]);
SELECT getSubcolumn(arr, 'subcolumn1'), getSubcolumn(arr, 'subcolumn2') FROM t_arr;
```

Результат:

```response
   ┌─getSubcolumn(arr, 'subcolumn1')─┬─getSubcolumn(arr, 'subcolumn2')─┐
1. │ [1,2]                           │ ['Hello','World']               │
2. │ [3,4,5]                         │ ['This','is','subcolumn']       │
   └─────────────────────────────────┴─────────────────────────────────┘
```

## getTypeSerializationStreams {#gettypeserializationstreams}

Перечисляет пути потоков сериализации типа данных.

:::note
Эта функция предназначена для использования разработчиками.
:::

**Синтаксис**

```sql
getTypeSerializationStreams(col)
```

**Аргументы**

- `col` — Колонка или строковое представление типа данных, из которого будет определен тип данных.

**Возвращаемое значение**

- Возвращает массив со всеми под-путями сериализации. [Array](../data-types/array.md)([String](../data-types/string.md)).

**Примеры**

Запрос:

```sql
SELECT getTypeSerializationStreams(tuple('a', 1, 'b', 2));
```

Результат:

```response
   ┌─getTypeSerializationStreams(('a', 1, 'b', 2))─────────────────────────────────────────────────────────────────────────┐
1. │ ['{TupleElement(1), Regular}','{TupleElement(2), Regular}','{TupleElement(3), Regular}','{TupleElement(4), Regular}'] │
   └───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Запрос:

```sql
SELECT getTypeSerializationStreams('Map(String, Int64)');
```

Результат:

```response
   ┌─getTypeSerializationStreams('Map(String, Int64)')────────────────────────────────────────────────────────────────┐
1. │ ['{ArraySizes}','{ArrayElements, TupleElement(keys), Regular}','{ArrayElements, TupleElement(values), Regular}'] │
   └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## globalVariable {#globalvariable}

Принимает постоянный строковый аргумент и возвращает значение глобальной переменной с таким именем. Эта функция предназначена для совместимости с MySQL и не нужна или не полезна для нормальной работы ClickHouse. Определены только несколько фиктивных глобальных переменных.

**Синтаксис**

```sql
globalVariable(name)
```

**Аргументы**

- `name` — Имя глобальной переменной. [String](../data-types/string.md).

**Возвращаемое значение**

- Возвращает значение переменной `name`.

**Пример**

Запрос:

```sql
SELECT globalVariable('max_allowed_packet');
```

Результат:

```response
┌─globalVariable('max_allowed_packet')─┐
│                             67108864 │
└──────────────────────────────────────┘
```

## getMaxTableNameLengthForDatabase {#getmaxtablenamelengthfordatabase}

Возвращает максимальную длину имени таблицы в указанной базе данных.

**Синтаксис**

```sql
getMaxTableNameLengthForDatabase(database_name)
```

**Аргументы**

- `database_name` — Имя указанной базы данных. [String](../data-types/string.md).

**Возвращаемое значение**

- Возвращает длину максимального имени таблицы.

**Пример**

Запрос:

```sql
SELECT getMaxTableNameLengthForDatabase('default');
```

Результат:

```response
┌─getMaxTableNameLengthForDatabase('default')─┐
│                                         206 │
└─────────────────────────────────────────────┘
```

## getServerSetting {#getserversetting}

Возвращает текущее значение одной из настроек сервера

**Синтаксис**

```sql
getServerSetting('server_setting');
```

**Параметр**

- `server_setting` — Имя настройки. [String](../data-types/string.md).

**Возвращаемое значение**

- Текущее значение настройки сервера.

**Пример**

```sql
SELECT getServerSetting('allow_use_jemalloc_memory');
```

Результат:

```text
┌─getServerSetting('allow_use_jemalloc_memory')─┐
│ true                                          │
└───────────────────────────────────────────────┘
```

## getMergeTreeSetting {#getmergetreesetting}

Возвращает текущее значение одной из настроек дерева слияния

**Синтаксис**

```sql
getMergeTreeSetting('merge_tree_setting');
```

**Параметр**

- `merge_tree_setting` — Имя настройки. [String](../data-types/string.md).

**Возвращаемое значение**

- Текущее значение настройки дерева слияния.

**Пример**

```sql
SELECT getMergeTreeSetting('index_granularity');
```

Результат:

```text
┌─getMergeTree(index_granularity')─┐
│                     8192         │
└──────────────────────────────────┘
```
