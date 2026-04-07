---
sidebar_label: 'Технический справочник'
slug: /integrations/fivetran/reference
sidebar_position: 3
description: 'Соответствия типов, сведения о движке таблицы, столбцы метаданных и отладочные запросы для назначения ClickHouse в Fivetran.'
title: 'Технический справочник'
doc_type: 'guide'
keywords: ['fivetran', 'назначение ClickHouse в Fivetran', 'технический справочник']
---

# Технический справочник \{#technical-reference\}

## Сведения о настройке \{#setup-details\}

### Управление пользователями и ролями \{#user-and-role-management\}

Рекомендуется не использовать пользователя `default`; вместо этого создайте отдельного пользователя, который будет использоваться только для этого назначения Fivetran. Следующие команды, выполненные от имени пользователя `default`, создадут нового пользователя `fivetran_user` с необходимыми привилегиями.

```sql
CREATE USER fivetran_user IDENTIFIED BY '<password>'; -- use a secure password generator

GRANT CURRENT GRANTS ON *.* TO fivetran_user;
```

Кроме того, вы можете отозвать у `fivetran_user` доступ к определённым базам данных.
Например, выполнив следующую команду, мы ограничим доступ к базе данных `default`:

```sql
REVOKE ALL ON default.* FROM fivetran_user;
```

Вы можете выполнить эти команды в SQL-консоли ClickHouse.

### Расширенная конфигурация \{#advanced-configuration\}

Для назначения ClickHouse Cloud поддерживается необязательный JSON-файл конфигурации для расширенных сценариев использования. Этот файл позволяет тонко настроить поведение назначения, переопределив значения по умолчанию, которые управляют размером пакетов, параллелизмом, пулами соединений и тайм-аутами запросов.

:::note
Эта конфигурация полностью необязательна. Если файл не загружен, назначение использует оптимальные значения по умолчанию, которые хорошо подходят для большинства сценариев использования.
:::

Файл должен быть корректным JSON и соответствовать schema, описанной ниже.

Если вам нужно изменить конфигурацию после первоначальной настройки, вы можете отредактировать настройки назначения в дашборде Fivetran и загрузить обновленный файл.

Файл конфигурации содержит раздел верхнего уровня:

```json
{
  "destination_configurations": { ... }
}
```

В нем можно указать следующие настройки, которые управляют внутренним поведением самого целевого коннектора ClickHouse.
Эти настройки влияют на то, как коннектор обрабатывает данные перед отправкой в ClickHouse.

| Настройка                | Тип     | По умолчанию | Допустимый диапазон | Описание                                                                                                                                                                           |
| ------------------------ | ------- | ------------ | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `write_batch_size`       | integer | `100000`     | 5,000 – 100,000     | Количество строк в пакете для операций вставки, обновления и замены.                                                                                                               |
| `select_batch_size`      | integer | `1500`       | 200 – 1,500         | Количество строк в пакете для SELECT-запросов, используемых при обновлениях.                                                                                                       |
| `mutation_batch_size`    | integer | `1500`       | 200 – 1,500         | Количество строк в пакете для мутаций ALTER TABLE UPDATE в режиме истории. Уменьшите это значение, если SQL-команды получаются слишком большими.                                   |
| `hard_delete_batch_size` | integer | `1500`       | 200 – 1,500         | Количество строк в пакете для операций окончательного удаления при обычной синхронизации и в режиме истории. Уменьшите это значение, если SQL-команды получаются слишком большими. |

Все поля необязательны. Если поле не указано, используется значение по умолчанию.
Если значение выходит за пределы допустимого диапазона, целевой коннектор сообщит об ошибке во время синхронизации.
Неизвестные поля игнорируются без ошибок (предупреждение записывается в журнал), что обеспечивает совместимость с будущими версиями при добавлении новых настроек.

Пример:

```json
{
  "destination_configurations": {
    "write_batch_size": 50000,
    "select_batch_size": 200
  }
}
```

## Соответствие типов при преобразовании \{#type-mapping\}

В назначении ClickHouse для Fivetran [типы данных Fivetran](https://fivetran.com/docs/destinations#datatypes) сопоставляются с типами ClickHouse следующим образом:

| Тип Fivetran  | Тип ClickHouse                                                       |
| ------------- | -------------------------------------------------------------------- |
| BOOLEAN       | [Bool](/sql-reference/data-types/boolean)                            |
| SHORT         | [Int16](/sql-reference/data-types/int-uint)                          |
| INT           | [Int32](/sql-reference/data-types/int-uint)                          |
| LONG          | [Int64](/sql-reference/data-types/int-uint)                          |
| BIGDECIMAL    | [Decimal(P, S)](/sql-reference/data-types/decimal)                   |
| FLOAT         | [Float32](/sql-reference/data-types/float)                           |
| DOUBLE        | [Float64](/sql-reference/data-types/float)                           |
| LOCALDATE     | [Date32](/sql-reference/data-types/date32)                           |
| LOCALDATETIME | [DateTime64(0, &#39;UTC&#39;)](/sql-reference/data-types/datetime64) |
| INSTANT       | [DateTime64(9, &#39;UTC&#39;)](/sql-reference/data-types/datetime64) |
| STRING        | [String](/sql-reference/data-types/string)                           |
| LOCALTIME     | [String](/sql-reference/data-types/string) * **                      |
| BINARY        | [String](/sql-reference/data-types/string) *                         |
| XML           | [String](/sql-reference/data-types/string) *                         |
| JSON          | [String](/sql-reference/data-types/string) *                         |

:::note

* BINARY, XML, LOCALTIME и JSON хранятся как [String](/sql-reference/data-types/string), поскольку тип `String` в ClickHouse может представлять произвольный набор байтов. Назначение добавляет комментарий к столбцу, указывающий исходный тип данных. Тип данных ClickHouse [JSON](/sql-reference/data-types/newjson) не используется, поскольку он был помечен как устаревший и никогда не рекомендовался для использования в продакшене.
  ** Внимание: задача для отслеживания поддержки типа LOCALTIME: [clickhouse-fivetran-destination #15](https://github.com/ClickHouse/clickhouse-fivetran-destination/issues/15).
  :::

### Диапазоны значений даты и времени \{#date-and-time-value-ranges\}

Источники Fivetran могут отправлять значения даты и времени в диапазоне [0001-01-01, 9999-12-31](https://fivetran.com/docs/destinations#dateandtimevaluerange).
Типы даты в ClickHouse Cloud имеют более узкий диапазон, поэтому значения вне поддерживаемого диапазона молча приводятся к ближайшей границе:

| Тип Fivetran  | Тип ClickHouse Cloud         | Минимальное значение | Максимальное значение |
| ------------- | ---------------------------- | -------------------- | --------------------- |
| LOCALDATE     | Date32                       | 1900-01-01           | 2299-12-31            |
| LOCALDATETIME | DateTime64(0, &#39;UTC&#39;) | 1900-01-01 00:00:00  | 2262-04-11 23:47:16   |
| INSTANT       | DateTime64(9, &#39;UTC&#39;) | 1900-01-01 00:00:00  | 2262-04-11 23:47:16   |

* Верхняя граница для INSTANT — 2262-04-11 23:47:16, потому что DateTime64(9) хранит наносекунды с эпохи в формате int64, а 2^63 - 1 наносекунд соответствует этой дате.
  Сам ClickHouse поддерживает DateTime64 с точностью &lt;= 9 вплоть до 2299-12-31 23:59:59.
* Верхняя граница для LOCALDATETIME также ограничена значением 2262-04-11 23:47:16 из-за [известной ошибки](https://github.com/ClickHouse/clickhouse-go/issues/1311) в Go-драйвере ClickHouse: `time.Time.UnixNano()` вызывается для всех значений точности DateTime64 до масштабирования, что вызывает переполнение int64 для дат после 2262 года даже при точности 0.

## Целевые таблицы \{#table-structure\}

В ClickHouse Cloud для целевой таблицы используется
движок типа [Replacing](/engines/table-engines/mergetree-family/replacingmergetree) из семейства
[SharedMergeTree](/cloud/reference/shared-merge-tree)
(а именно `SharedReplacingMergeTree`) с версионированием по столбцу `_fivetran_synced`.

Каждый столбец, кроме первичных ключей (ключей сортировки) и столбцов метаданных Fivetran, создаётся
как [Nullable(T)](/sql-reference/data-types/nullable), где `T` —
тип ClickHouse Cloud, определяемый на основе [соответствия типов данных](#type-mapping).

Структура таблицы зависит от режима
[синхронизации](https://fivetran.com/docs/using-fivetran/features#deletedrowhandling),
настроенного для коннектора: **мягкое удаление** (по умолчанию) или **режим истории** (SCD Type 2).

### Режим мягкого удаления \{#soft-delete-mode\}

В режиме мягкого удаления каждая целевая таблица содержит следующие столбцы метаданных:

| Столбец             | Тип                    | Описание                                                                                                                                |
| ------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `_fivetran_synced`  | `DateTime64(9, 'UTC')` | Таймстамп, когда запись была синхронизирована Fivetran. Используется как столбец версии для `SharedReplacingMergeTree`.                 |
| `_fivetran_deleted` | `Bool`                 | Маркер мягкого удаления. Устанавливается в `true`, когда запись в источнике удаляется.                                                  |
| `_fivetran_id`      | `String`               | Автоматически сгенерированный уникальный идентификатор. Присутствует только в том случае, если в исходной таблице нет первичных ключей. |

#### Один первичный ключ в исходной таблице \{#single-pk\}

Например, в исходной таблице `users` есть столбец первичного ключа `id` (`INT`) и обычный столбец `name` (`STRING`).
Целевая таблица будет определена следующим образом:

```sql
CREATE TABLE `users`
(
    `id`                Int32,
    `name`              Nullable(String),
    `_fivetran_synced`  DateTime64(9, 'UTC'),
    `_fivetran_deleted` Bool
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY id
SETTINGS index_granularity = 8192
```

В этом случае столбец `id` выбран в качестве сортировочного ключа таблицы.

#### Несколько первичных ключей в исходной таблице \{#multiple-pks\}

Если в исходной таблице несколько первичных ключей, они используются в том порядке, в котором указаны в определении
исходной таблицы в Fivetran.

Например, есть исходная таблица `items` с первичными ключами `id` (`INT`) и `name` (`STRING`), а также дополнительным
обычным столбцом `description` (`STRING`). Целевая таблица будет определена следующим образом:

```sql
CREATE TABLE `items`
(
    `id`                Int32,
    `name`              String,
    `description`       Nullable(String),
    `_fivetran_synced`  DateTime64(9, 'UTC'),
    `_fivetran_deleted` Bool
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY (id, name)
SETTINGS index_granularity = 8192
```

В этом случае столбцы `id` и `name` выбраны в качестве сортировочных ключей таблицы.

#### В исходной таблице нет первичного ключа \{#no-pks\}

Если в исходной таблице нет первичного ключа, Fivetran добавит уникальный идентификатор в виде столбца `_fivetran_id`.
Рассмотрим таблицу `events`, в которой в источнике есть только столбцы `event` (`STRING`) и `timestamp` (`LOCALDATETIME`).
В этом случае целевая таблица будет выглядеть следующим образом:

```sql
CREATE TABLE events
(
    `event`             Nullable(String),
    `timestamp`         Nullable(DateTime),
    `_fivetran_id`      String,
    `_fivetran_synced`  DateTime64(9, 'UTC'),
    `_fivetran_deleted` Bool
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY _fivetran_id
SETTINGS index_granularity = 8192
```

Поскольку `_fivetran_id` уникален и других вариантов первичного ключа нет, он используется в качестве сортировочного ключа таблицы.

### Режим истории (SCD Type 2) \{#history-mode\}

Когда [режим истории](https://fivetran.com/docs/using-fivetran/features#historymode) включен,
целевая таблица сохраняет все версии каждой записи, а не перезаписывает предыдущие значения.
Тем самым реализуется [Slowly Changing Dimension Type 2](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row) (SCD Type 2),
что позволяет вести полный журнал всех изменений.

В режиме истории каждая целевая таблица включает следующие столбцы метаданных:

| Столбец            | Тип                              | Описание                                                                                                                            |
| ------------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `_fivetran_synced` | `DateTime64(9, 'UTC')`           | Таймстамп, когда запись была синхронизирована Fivetran. Используется как столбец версии для `SharedReplacingMergeTree`.             |
| `_fivetran_start`  | `DateTime64(9, 'UTC')`           | Таймстамп, когда эта версия записи стала активной. Является частью сортировочного ключа таблицы.                                    |
| `_fivetran_end`    | `Nullable(DateTime64(9, 'UTC'))` | Таймстамп, когда эта версия была заменена более новой. Для текущих активных записей устанавливается значение `2262-04-11 23:47:16`. |
| `_fivetran_active` | `Nullable(Bool)`                 | Указывает, является ли эта версия записи текущей активной.                                                                          |
| `_fivetran_id`     | `String`                         | Автоматически сгенерированный уникальный идентификатор. Присутствует только если в исходной таблице нет первичных ключей.           |

Столбец `_fivetran_start` всегда включается в выражение `ORDER BY` как последний элемент составного сортировочного ключа.
Это позволяет нескольким версиям одной и той же записи (с разными временами начала) одновременно существовать в таблице.

Когда запись обновляется:

* Для предыдущей версии значение `_fivetran_end` устанавливается равным значению `_fivetran_start` новой версии минус одна наносекунда, а `_fivetran_active` — `false`.
* Новая версия вставляется со значением `_fivetran_active`, равным `true`, и `_fivetran_end`, установленным в `2262-04-11 23:47:16.000000000` (максимальное значение `DateTime64(9)`).

#### Один первичный ключ в исходной таблице \{#history-single-pk\}

Например, исходная таблица `users` содержит столбец первичного ключа `id` (`INT`) и обычные столбцы `name` (`STRING`) и `status` (`STRING`).
Целевая таблица в режиме истории определяется следующим образом:

```sql
CREATE TABLE `users`
(
    `id`               Int32,
    `name`             Nullable(String),
    `status`           Nullable(String),
    `_fivetran_synced` DateTime64(9, 'UTC'),
    `_fivetran_start`  DateTime64(9, 'UTC'),
    `_fivetran_end`    Nullable(DateTime64(9, 'UTC')),
    `_fivetran_active` Nullable(Bool)
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY (id, _fivetran_start)
SETTINGS index_granularity = 8192
```

В этом случае `id` и `_fivetran_start` образуют составной сортировочный ключ.

После нескольких синхронизаций таблица может содержать следующие данные:

| id | name    | status | &#95;fivetran&#95;start       | &#95;fivetran&#95;end         | &#95;fivetran&#95;active |
| -- | ------- | ------ | ----------------------------- | ----------------------------- | ------------------------ |
| 1  | name 1  | TODO   | 2025-11-10 20:57:00.000000000 | 2025-11-11 20:56:59.999000000 | false                    |
| 1  | name 11 | TODO   | 2025-11-11 20:57:00.000000000 | 2262-04-11 23:47:16.000000000 | true                     |
| 2  | name 2  | TODO   | 2025-11-10 20:57:00.000000000 | 2262-04-11 23:47:16.000000000 | true                     |

Запись `id=1` имеет две версии: исходную (`name 1`, неактивную) и обновлённую (`name 11`, активную).
Запись `id=2` имеет только одну версию, и в настоящее время она активна.

#### Несколько первичных ключей в исходной таблице \{#history-multiple-pks\}

Если у исходной таблицы несколько первичных ключей, все они включаются в `ORDER BY`, а `_fivetran_start` указывается последним элементом.

Например, есть исходная таблица `items` со столбцами первичного ключа `id` (`INT`) и `name` (`STRING`), а также
дополнительным обычным столбцом `description` (`STRING`). Целевая таблица в режиме истории определяется следующим образом:

```sql
CREATE TABLE `items`
(
    `id`               Int32,
    `name`             String,
    `description`      Nullable(String),
    `_fivetran_synced` DateTime64(9, 'UTC'),
    `_fivetran_start`  DateTime64(9, 'UTC'),
    `_fivetran_end`    Nullable(DateTime64(9, 'UTC')),
    `_fivetran_active` Nullable(Bool)
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY (id, name, _fivetran_start)
SETTINGS index_granularity = 8192
```

В этом случае `id`, `name` и `_fivetran_start` образуют составной сортировочный ключ.

#### В исходной таблице нет первичного ключа \{#history-no-pks\}

Если в исходной таблице нет первичного ключа, Fivetran добавит уникальный идентификатор в виде столбца `_fivetran_id`,
а `_fivetran_start` будет включён в сортировочный ключ.
Рассмотрим таблицу `events`, которая в источнике содержит только столбцы `event` (`STRING`) и `timestamp` (`LOCALDATETIME`).
Целевая таблица в режиме истории выглядит следующим образом:

```sql
CREATE TABLE events
(
    `event`            Nullable(String),
    `timestamp`        Nullable(DateTime),
    `_fivetran_id`     String,
    `_fivetran_synced` DateTime64(9, 'UTC'),
    `_fivetran_start`  DateTime64(9, 'UTC'),
    `_fivetran_end`    Nullable(DateTime64(9, 'UTC')),
    `_fivetran_active` Nullable(Bool)
) ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}', _fivetran_synced)
ORDER BY (_fivetran_id, _fivetran_start)
SETTINGS index_granularity = 8192
```

Поскольку `_fivetran_id` и `_fivetran_start` образуют составной сортировочный ключ.

### Выбор последней версии данных без дубликатов \{#selecting-latest-version\}

`SharedReplacingMergeTree` выполняет фоновую дедупликацию данных
[только во время слияний и в непредсказуемый момент времени](/engines/table-engines/mergetree-family/replacingmergetree).
Однако получить последнюю версию данных без дубликатов по запросу можно с помощью ключевого слова `FINAL`:

```sql
SELECT *
FROM example FINAL
LIMIT 1000 
```

Ознакомьтесь с разделом [оптимизация запросов на чтение](/integrations/fivetran/troubleshooting#optimizing-reading-queries)&quot; в руководстве по устранению неполадок, чтобы получить рекомендации по оптимизации запросов.

## Повторные попытки при сбоях сети \{#retries-on-network-failures\}

Назначение ClickHouse Cloud повторяет попытки при временных сетевых ошибках с использованием алгоритма экспоненциального бэкоффа.
Это безопасно, даже если в назначение уже вставлены данные, поскольку возможные дубликаты обрабатываются
движком таблицы `SharedReplacingMergeTree`.