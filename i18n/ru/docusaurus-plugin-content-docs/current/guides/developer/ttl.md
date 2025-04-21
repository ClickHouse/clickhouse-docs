---
slug: /guides/developer/ttl
sidebar_label: 'TTL (Время жизни)'
sidebar_position: 2
keywords: ['ttl', 'время жизни', 'clickhouse', 'старые', 'данные']
description: 'TTL (время жизни) относится к возможности перемещения, удаления или агрегации строк или столбцов после истечения определенного интервала времени.'
title: 'Управление данными с помощью TTL (время жизни)'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Управление данными с помощью TTL (время жизни)

## Обзор TTL {#overview-of-ttl}

TTL (время жизни) относится к возможности перемещения, удаления или агрегации строк или столбцов после истечения определенного интервала времени. Хотя выражение "время жизни" звучит так, будто оно применяется только для удаления старых данных, TTL имеет несколько вариантов использования:

- Удаление старых данных: нет ничего удивительного, вы можете удалить строки или столбцы после заданного временного интервала
- Перемещение данных между дисками: после определенного времени вы можете перемещать данные между хранилищами - это полезно для развертывания архитектуры горячего/теплого/холодного хранения
- Агрегация данных: агрегация ваших старых данных в различные полезные совокупности и вычисления перед их удалением

:::note
TTL может применяться как ко всем таблицам, так и к конкретным столбцам.
:::

## Синтаксис TTL {#ttl-syntax}

Клаузула `TTL` может находиться после определения столбца и/или в конце определения таблицы. Используйте клаузулу `INTERVAL`, чтобы определить длину времени (которая должна быть типом данных `Date` или `DateTime`). Например, следующая таблица имеет два столбца с клаузами `TTL`:

```sql
CREATE TABLE example1 (
   timestamp DateTime,
   x UInt32 TTL timestamp + INTERVAL 1 MONTH,
   y String TTL timestamp + INTERVAL 1 DAY,
   z String
)
ENGINE = MergeTree
ORDER BY tuple()
```

- Столбец x имеет время жизни 1 месяц от столбца timestamp
- Столбец y имеет время жизни 1 день от столбца timestamp
- Когда интервал истекает, столбец истекает. ClickHouse заменяет значение столбца на значение по умолчанию его типа данных. Если все значения столбца в части данных истекают, ClickHouse удаляет этот столбец из части данных в файловой системе.

:::note
Правила TTL можно изменять или удалять. См. страницу [Manipulations with Table TTL](/sql-reference/statements/alter/ttl.md) для получения дополнительных деталей.
:::

## Запуск событий TTL {#triggering-ttl-events}

Удаление или агрегация просроченных строк не происходят мгновенно - это происходит только во время слияния таблиц. Если у вас есть таблица, которая не активно сливается (по какой-либо причине), существуют две настройки, которые запускают события TTL:

- `merge_with_ttl_timeout`: минимальная задержка в секундах перед повторным выполнением слияния с удалением TTL. По умолчанию 14400 секунд (4 часа).
- `merge_with_recompression_ttl_timeout`: минимальная задержка в секундах перед повторным выполнением слияния с рекомпрессией TTL (правила, которые агрегируют данные перед удалением). Значение по умолчанию: 14400 секунд (4 часа).

Таким образом, по умолчанию ваши правила TTL будут применяться к вашей таблице по крайней мере раз в 4 часа. Просто измените указанные настройки, если вам нужно, чтобы ваши правила TTL применялись чаще.

:::note
Это не лучшее решение (или то, которое мы рекомендуем использовать часто), но вы также можете принудительно выполнить слияние, используя `OPTIMIZE`:

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE` инициализирует несогласованное слияние частей вашей таблицы, а `FINAL` принуждает к переоптимизации, если ваша таблица уже является одной частью.
:::

## Удаление строк {#removing-rows}

Чтобы удалить целые строки из таблицы после определенного времени, определите правило TTL на уровне таблицы:

```sql
CREATE TABLE customers (
timestamp DateTime,
name String,
balance Int32,
address String
)
ENGINE = MergeTree
ORDER BY timestamp
TTL timestamp + INTERVAL 12 HOUR
```

Кроме того, возможно, определить правило TTL на основе значения записи. Это легко реализовать, указав условие where. Разрешено несколько условий:

```sql
CREATE TABLE events
(
    `event` String,
    `time` DateTime,
    `value` UInt64
)
ENGINE = MergeTree
ORDER BY (event, time)
TTL time + INTERVAL 1 MONTH DELETE WHERE event != 'error',
    time + INTERVAL 6 MONTH DELETE WHERE event = 'error'
```

## Удаление столбцов {#removing-columns}

Вместо удаления всей строки предположим, что вы хотите, чтобы истекали только столбцы balance и address. Давайте изменим таблицу `customers` и добавим TTL для обоих столбцов на 2 часа:

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```

## Реализация агрегации {#implementing-a-rollup}

Предположим, мы хотим удалить строки через определенное время, но сохранить некоторые данные для отчетности. Мы не хотим всех деталей - лишь несколько агрегированных результатов исторических данных. Это можно реализовать, добавив клаузулу `GROUP BY` к вашему выражению `TTL`, а также некоторые столбцы в вашу таблицу для хранения агрегированных результатов.

Предположим, в следующей таблице `hits` мы хотим удалить старые строки, но сохранить сумму и максимум столбца `hits` перед удалением строк. Нам потребуется поле для хранения этих значений, и нам нужно добавить клаузулу `GROUP BY` к клаузе `TTL`, которая агрегирует сумму и максимум:

```sql
CREATE TABLE hits (
   timestamp DateTime,
   id String,
   hits Int32,
   max_hits Int32 DEFAULT hits,
   sum_hits Int64 DEFAULT hits
)
ENGINE = MergeTree
PRIMARY KEY (id, toStartOfDay(timestamp), timestamp)
TTL timestamp + INTERVAL 1 DAY
    GROUP BY id, toStartOfDay(timestamp)
    SET
        max_hits = max(max_hits),
        sum_hits = sum(sum_hits);
```

Некоторые примечания к таблице `hits`:

- Столбцы `GROUP BY` в клаузе `TTL` должны быть префиксом `PRIMARY KEY`, и мы хотим группировать наши результаты по началу дня. Поэтому `toStartOfDay(timestamp)` был добавлен к первичному ключу
- Мы добавили два поля для хранения агрегированных результатов: `max_hits` и `sum_hits`
- Установка значения по умолчанию для `max_hits` и `sum_hits` на `hits` необходима для корректной работы нашей логики, исходя из того, как определена клаузула `SET`

## Реализация архитектуры горячего/теплого/холодного хранения {#implementing-a-hotwarmcold-architecture}

<CloudNotSupportedBadge/>

:::note
Если вы используете ClickHouse Cloud, шаги в этом уроке не применимы. Вам не нужно беспокоиться о перемещении старых данных в ClickHouse Cloud.
:::

Распространенной практикой при работе с большими объемами данных является перемещение этих данных по мере их старения. Вот шаги по реализации архитектуры горячего/теплого/холодного хранения в ClickHouse с использованием клаузул `TO DISK` и `TO VOLUME` команды `TTL`. (Кстати, это не обязательно должно быть чем-то горячим и холодным - вы можете использовать TTL для перемещения данных для любой вашей задачи.)

1. Опции `TO DISK` и `TO VOLUME` относятся к именам дисков или томов, определенным в ваших файлах конфигурации ClickHouse. Создайте новый файл с именем `my_system.xml` (или любым другим именем файла), который определяет ваши диски, а затем определите тома, использующие ваши диски. Поместите XML-файл в `/etc/clickhouse-server/config.d/`, чтобы применить конфигурацию к вашей системе:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <default>
            </default>
           <hot_disk>
              <path>./hot/</path>
           </hot_disk>
           <warm_disk>
              <path>./warm/</path>
           </warm_disk>
           <cold_disk>
              <path>./cold/</path>
           </cold_disk>
        </disks>
        <policies>
            <default>
                <volumes>
                    <default>
                        <disk>default</disk>
                    </default>
                    <hot_volume>
                        <disk>hot_disk</disk>
                    </hot_volume>
                    <warm_volume>
                        <disk>warm_disk</disk>
                    </warm_volume>
                    <cold_volume>
                        <disk>cold_disk</disk>
                    </cold_volume>
                </volumes>
            </default>
        </policies>
    </storage_configuration>
</clickhouse>
```

2. Указанная выше конфигурация ссылается на три диска, которые указывают на папки, из которых ClickHouse может читать и записывать данные. Тома могут содержать один или несколько дисков - мы определили том для каждого из трех дисков. Давайте посмотрим на диски:

```sql
SELECT name, path, free_space, total_space
FROM system.disks
```

```response
┌─name────────┬─path───────────┬───free_space─┬──total_space─┐
│ cold_disk   │ ./data/cold/   │ 179143311360 │ 494384795648 │
│ default     │ ./             │ 179143311360 │ 494384795648 │
│ hot_disk    │ ./data/hot/    │ 179143311360 │ 494384795648 │
│ warm_disk   │ ./data/warm/   │ 179143311360 │ 494384795648 │
└─────────────┴────────────────┴──────────────┴──────────────┘
```

3. И... давайте проверим тома:

```sql
SELECT
    volume_name,
    disks
FROM system.storage_policies
```

```response
┌─volume_name─┬─disks─────────┐
│ default     │ ['default']   │
│ hot_volume  │ ['hot_disk']  │
│ warm_volume │ ['warm_disk'] │
│ cold_volume │ ['cold_disk'] │
└─────────────┴───────────────┘
```

4. Теперь мы добавим правило `TTL`, которое перемещает данные между горячими, теплыми и холодными томами:

```sql
ALTER TABLE my_table
   MODIFY TTL
      trade_date TO VOLUME 'hot_volume',
      trade_date + INTERVAL 2 YEAR TO VOLUME 'warm_volume',
      trade_date + INTERVAL 4 YEAR TO VOLUME 'cold_volume';
```

5. Новое правило `TTL` должно материализоваться, но вы можете принудить его, чтобы убедиться:

```sql
ALTER TABLE my_table
    MATERIALIZE TTL
```

6. Убедитесь, что ваши данные переместились на ожидаемые диски, используя таблицу `system.parts`:

```sql
С помощью таблицы system.parts, посмотрите, на каких дисках находятся части для таблицы crypto_prices:

SELECT
    name,
    disk_name
FROM system.parts
WHERE (table = 'my_table') AND (active = 1)
```

Ответ будет выглядеть так:

```response
┌─name────────┬─disk_name─┐
│ all_1_3_1_5 │ warm_disk │
│ all_2_2_0   │ hot_disk  │
└─────────────┴───────────┘
```


## Связанный контент {#related-content}

- Блог и вебинар: [Использование TTL для управления жизненным циклом данных в ClickHouse](https://clickhouse.com/blog/using-ttl-to-manage-data-lifecycles-in-clickhouse)
