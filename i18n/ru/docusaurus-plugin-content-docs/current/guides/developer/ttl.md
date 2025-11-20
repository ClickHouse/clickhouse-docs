---
slug: /guides/developer/ttl
sidebar_label: 'TTL (Time To Live)'
sidebar_position: 2
keywords: ['ttl', 'time to live', 'clickhouse', 'old', 'data']
description: 'TTL (time-to-live) — это механизм, позволяющий переносить, удалять или агрегировать строки или столбцы по истечении определённого интервала времени.'
title: 'Управление данными с помощью TTL (time-to-live)'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Управление данными с помощью TTL (time to live)



## Обзор TTL {#overview-of-ttl}

TTL (time-to-live, время жизни) — это механизм, позволяющий перемещать, удалять или агрегировать строки или столбцы по истечении определённого интервала времени. Хотя термин «время жизни» может показаться применимым только к удалению старых данных, TTL имеет несколько сценариев использования:

- Удаление старых данных: как и следовало ожидать, можно удалять строки или столбцы по истечении заданного интервала времени
- Перемещение данных между дисками: по истечении определённого времени можно перемещать данные между томами хранения — это полезно для развёртывания архитектуры hot/warm/cold
- Агрегация данных: агрегируйте старые данные в различные полезные агрегаты и вычисления перед их удалением

:::note
TTL может применяться как к целым таблицам, так и к отдельным столбцам.
:::


## Синтаксис TTL {#ttl-syntax}

Конструкция `TTL` может указываться после определения столбца и/или в конце определения таблицы. Используйте конструкцию `INTERVAL` для задания временного интервала (требуется тип данных `Date` или `DateTime`). Например, следующая таблица содержит два столбца
с конструкциями `TTL`:

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

- Столбец x имеет время жизни 1 месяц от значения столбца timestamp
- Столбец y имеет время жизни 1 день от значения столбца timestamp
- Когда интервал истекает, столбец устаревает. ClickHouse заменяет значение столбца на значение по умолчанию для его типа данных. Если все значения столбца в куске данных устаревают, ClickHouse удаляет этот столбец из куска данных в файловой системе.

:::note
Правила TTL могут быть изменены или удалены. Подробнее см. страницу [Манипуляции с TTL таблицы](/sql-reference/statements/alter/ttl.md).
:::


## Запуск событий TTL {#triggering-ttl-events}

Удаление или агрегация устаревших строк происходит не мгновенно — это выполняется только во время слияния таблиц. Если таблица не участвует в активном слиянии (по какой-либо причине), существуют две настройки, которые инициируют события TTL:

- `merge_with_ttl_timeout`: минимальная задержка в секундах перед повторным слиянием с удалением по TTL. Значение по умолчанию — 14400 секунд (4 часа).
- `merge_with_recompression_ttl_timeout`: минимальная задержка в секундах перед повторным слиянием с перекомпрессией по TTL (правила, которые агрегируют данные перед удалением). Значение по умолчанию: 14400 секунд (4 часа).

Таким образом, по умолчанию правила TTL применяются к таблице как минимум один раз каждые 4 часа. Измените указанные выше настройки, если требуется более частое применение правил TTL.

:::note
Это не самое лучшее решение (и мы не рекомендуем использовать его часто), но вы также можете принудительно запустить слияние с помощью `OPTIMIZE`:

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE` инициирует внеплановое слияние частей таблицы, а `FINAL` принудительно выполняет реоптимизацию, если таблица уже состоит из одной части.
:::


## Удаление строк {#removing-rows}

Чтобы удалять строки из таблицы по истечении определённого времени, задайте правило TTL на уровне таблицы:

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

Кроме того, можно задать правило TTL на основе значения записи.
Это легко реализуется с помощью условия WHERE.
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

Вместо удаления всей строки предположим, что вы хотите, чтобы срок действия истекал только для столбцов balance и address. Давайте изменим таблицу `customers` и добавим TTL для обоих столбцов равный 2 часам:

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```


## Реализация свёртки данных {#implementing-a-rollup}

Предположим, мы хотим удалять строки по истечении определённого времени, но сохранить часть данных для целей отчётности. Нам не нужны все детали — только несколько агрегированных результатов по историческим данным. Это можно реализовать, добавив секцию `GROUP BY` в выражение `TTL`, а также несколько столбцов в таблицу для хранения агрегированных результатов.

Предположим, в следующей таблице `hits` мы хотим удалить старые строки, но сохранить сумму и максимум столбца `hits` перед удалением строк. Нам потребуется поле для хранения этих значений, и нам нужно будет добавить секцию `GROUP BY` в секцию `TTL`, которая выполняет свёртку суммы и максимума:

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

Некоторые замечания о таблице `hits`:

- Столбцы `GROUP BY` в секции `TTL` должны быть префиксом `PRIMARY KEY`, и мы хотим группировать результаты по началу дня. Поэтому `toStartOfDay(timestamp)` был добавлен в первичный ключ
- Мы добавили два поля для хранения агрегированных результатов: `max_hits` и `sum_hits`
- Установка значения по умолчанию для `max_hits` и `sum_hits` равным `hits` необходима для работы нашей логики, исходя из того, как определена секция `SET`


## Реализация архитектуры hot/warm/cold {#implementing-a-hotwarmcold-architecture}

<CloudNotSupportedBadge />

:::note
Если вы используете ClickHouse Cloud, шаги из этого урока неприменимы. Вам не нужно беспокоиться о перемещении старых данных в ClickHouse Cloud.
:::

Распространённой практикой при работе с большими объёмами данных является перемещение данных по мере их устаревания. Ниже приведены шаги по реализации архитектуры hot/warm/cold в ClickHouse с использованием конструкций `TO DISK` и `TO VOLUME` команды `TTL`. (Кстати, это не обязательно должна быть именно схема hot и cold — вы можете использовать TTL для перемещения данных в любом сценарии.)

1. Параметры `TO DISK` и `TO VOLUME` ссылаются на имена дисков или томов, определённых в конфигурационных файлах ClickHouse. Создайте новый файл с именем `my_system.xml` (или с любым другим именем), в котором определите ваши диски, затем определите тома, использующие эти диски. Поместите XML-файл в `/etc/clickhouse-server/config.d/`, чтобы конфигурация была применена к вашей системе:

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

2. Приведённая выше конфигурация ссылается на три диска, которые указывают на каталоги, из которых ClickHouse может читать и в которые может записывать данные. Тома могут содержать один или несколько дисков — мы определили том для каждого из трёх дисков. Давайте просмотрим диски:

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

4. Теперь добавим правило `TTL`, которое перемещает данные между томами hot, warm и cold:

```sql
ALTER TABLE my_table
   MODIFY TTL
      trade_date TO VOLUME 'hot_volume',
      trade_date + INTERVAL 2 YEAR TO VOLUME 'warm_volume',
      trade_date + INTERVAL 4 YEAR TO VOLUME 'cold_volume';
```

5. Новое правило `TTL` должно материализоваться автоматически, но вы можете принудительно запустить этот процесс:

```sql
ALTER TABLE my_table
    MATERIALIZE TTL
```

6. Проверьте, что ваши данные переместились на ожидаемые диски, используя таблицу `system.parts`:

```sql
Используя таблицу system.parts, просмотрите, на каких дисках находятся части таблицы crypto_prices:

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
