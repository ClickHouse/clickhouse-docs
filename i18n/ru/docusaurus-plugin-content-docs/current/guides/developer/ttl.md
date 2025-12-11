---
slug: /guides/developer/ttl
sidebar_label: 'TTL (время жизни)'
sidebar_position: 2
keywords: ['ttl', 'time to live', 'clickhouse', 'устаревшие', 'данные']
description: 'TTL (время жизни) — это возможность перемещать, удалять или агрегировать строки или столбцы по истечении определённого промежутка времени.'
title: 'Управление данными с использованием TTL (времени жизни)'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Управление сроком жизни данных (TTL, time to live) {#manage-data-with-ttl-time-to-live}

## Обзор TTL {#overview-of-ttl}

TTL (time-to-live) — это механизм, позволяющий перемещать, удалять или агрегировать строки или столбцы по истечении определённого интервала времени. Хотя выражение «time-to-live» звучит так, будто оно относится только к удалению старых данных, у TTL есть несколько сценариев использования:

- Удаление старых данных: как и ожидается, вы можете удалять строки или столбцы по истечении заданного временного интервала
- Перемещение данных между дисками: по прошествии определённого времени вы можете перемещать данные между томами хранилища — это полезно для реализации архитектуры горячего/тёплого/холодного хранения
- Свёртка данных (rollup): выполняйте свёртку старых данных в различные полезные агрегаты и вычисления перед их удалением

:::note
TTL может применяться ко всей таблице или к отдельным столбцам.
:::

## Синтаксис TTL {#ttl-syntax}

Предложение `TTL` может располагаться после определения столбца и/или в конце определения таблицы. Используйте предложение `INTERVAL`, чтобы задать продолжительность интервала (значение должно иметь тип данных `Date` или `DateTime`). Например, в следующей таблице есть два столбца
с предложениями `TTL`:

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

* Столбец x имеет время жизни 1 месяц, отсчитываемый от значения в столбце timestamp
* Столбец y имеет время жизни 1 день, отсчитываемый от значения в столбце timestamp
* По истечении этого интервала срок жизни столбца истекает. ClickHouse заменяет значение столбца значением по умолчанию для его типа данных. Если срок жизни всех значений столбца в части данных истёк, ClickHouse удаляет этот столбец из части данных в файловой системе.

:::note
Правила TTL можно изменить или удалить. Дополнительные сведения см. на странице [Manipulations with Table TTL](/sql-reference/statements/alter/ttl.md).
:::

## Запуск событий TTL {#triggering-ttl-events}

Удаление или агрегирование просроченных строк происходит не сразу — оно выполняется только во время слияний таблицы. Если у вас есть таблица, для которой по какой-либо причине не выполняются слияния, существуют два параметра, которые запускают события TTL:

* `merge_with_ttl_timeout`: минимальная задержка в секундах перед повторным выполнением слияния с TTL на удаление. Значение по умолчанию — 14400 секунд (4 часа).
* `merge_with_recompression_ttl_timeout`: минимальная задержка в секундах перед повторным выполнением слияния с TTL на перекомпрессию (правила, которые сворачивают данные перед удалением). Значение по умолчанию — 14400 секунд (4 часа).

Таким образом, по умолчанию ваши правила TTL будут применяться к вашей таблице как минимум раз в 4 часа. Измените параметры выше, если вам нужно, чтобы правила TTL применялись чаще.

:::note
Не самое лучшее решение (и не то, которое мы рекомендуем использовать часто), но вы также можете принудительно запустить слияние с помощью `OPTIMIZE`:

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE` запускает внеплановое слияние частей вашей таблицы, а `FINAL` принудительно выполняет повторную оптимизацию, даже если таблица уже состоит из одной части.`

## Удаление строк {#removing-rows}

Чтобы удалять целые строки из таблицы по истечении определённого времени, задайте правило TTL на уровне таблицы:

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

Кроме того, можно определить правило TTL, основанное на значении записи.
Это легко сделать, указав условие WHERE.
Допускается использование нескольких условий:

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

Вместо удаления всей строки предположим, что вы хотите задать срок действия только для столбцов `balance` и `address`. Давайте изменим таблицу `customers` и добавим для обоих столбцов TTL в 2 часа:

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```

## Реализация rollup-агрегирования {#implementing-a-rollup}

Предположим, мы хотим удалять строки по истечении определённого времени, но при этом сохранять часть данных для отчётности. Нам не нужны все детали — только несколько агрегированных результатов по историческим данным. Это можно реализовать, добавив предложение `GROUP BY` к выражению `TTL`, а также несколько столбцов в таблицу для хранения агрегированных результатов.

Предположим, что в следующей таблице `hits` мы хотим удалять старые строки, но при этом сохранять сумму и максимум по столбцам `hits` перед удалением строк. Нам понадобится поле для хранения этих значений, и нам нужно будет добавить предложение `GROUP BY` в выражение `TTL`, которое будет агрегировать сумму и максимум:

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

Некоторые замечания по таблице `hits`:

* Столбцы `GROUP BY` в предложении `TTL` должны представлять собой префикс `PRIMARY KEY`, а нам нужно группировать результаты по началу дня. Поэтому `toStartOfDay(timestamp)` был добавлен в первичный ключ
* Мы добавили два поля для хранения агрегированных результатов: `max_hits` и `sum_hits`
* Задание значения по умолчанию для `max_hits` и `sum_hits`, равного `hits`, необходимо для корректной работы нашей логики, исходя из того, как определено предложение `SET`

## Реализация архитектуры «hot/warm/cold» {#implementing-a-hotwarmcold-architecture}

<CloudNotSupportedBadge />

:::note
Если вы используете ClickHouse Cloud, шаги из этого урока неприменимы. Вам не нужно беспокоиться о переносе старых данных в ClickHouse Cloud.
:::

Распространённая практика при работе с большими объёмами данных — перемещать эти данные по мере их устаревания. Ниже приведены шаги по реализации архитектуры «hot/warm/cold» в ClickHouse с использованием опций `TO DISK` и `TO VOLUME` команды `TTL`. (Кстати, это не обязательно должна быть схема только hot и cold — вы можете использовать TTL для перемещения данных между любыми уровнями в соответствии с вашим сценарием.)

1. Опции `TO DISK` и `TO VOLUME` ссылаются на имена дисков или томов, определённых в ваших конфигурационных файлах ClickHouse. Создайте новый файл с именем `my_system.xml` (или любым другим именем файла), в котором будут определены ваши диски, затем определите тома, использующие эти диски. Поместите XML-файл в `/etc/clickhouse-server/config.d/`, чтобы конфигурация была применена к вашей системе:

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

2. В приведённой выше конфигурации используются три диска, которые ссылаются на каталоги, из которых ClickHouse может читать и в которые может записывать. Том может содержать один или несколько дисков — мы определили отдельный том для каждого из трёх дисков. Давайте посмотрим на диски:

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

3. Теперь проверим тома:

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

4. Теперь мы добавим правило `TTL`, которое перемещает данные между горячим, тёплым и холодным томами:

```sql
ALTER TABLE my_table
   MODIFY TTL
      trade_date TO VOLUME 'hot_volume',
      trade_date + INTERVAL 2 YEAR TO VOLUME 'warm_volume',
      trade_date + INTERVAL 4 YEAR TO VOLUME 'cold_volume';
```

5. Новое правило `TTL` должно материализоваться автоматически, но при необходимости вы можете принудительно выполнить его материализацию, чтобы убедиться:

```sql
ALTER TABLE my_table
    MATERIALIZE TTL
```

6. Проверьте, что ваши данные переместились на нужные диски, используя таблицу `system.parts`:

```sql
С помощью таблицы system.parts определите, на каких дисках расположены части таблицы crypto_prices:

SELECT
    name,
    disk_name
FROM system.parts
WHERE (table = 'my_table') AND (active = 1)
```

Ответ будет выглядеть следующим образом:

```response
┌─name────────┬─disk_name─┐
│ all_1_3_1_5 │ warm_disk │
│ all_2_2_0   │ hot_disk  │
└─────────────┴───────────┘
```
