---
slug: /guides/developer/ttl
sidebar_label:  TTL (время жизни)
sidebar_position: 2
keywords: ['ttl', 'время жизни', 'clickhouse', 'старые', 'данные']
description: 'TTL (время жизни) относится к способности перемещать, удалять или агрегировать строки или колонки после определенного интервала времени.'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Управление данными с помощью TTL (время жизни)

## Обзор TTL {#overview-of-ttl}

TTL (время жизни) относится к способности перемещать, удалять или агрегировать строки или колонки после определенного интервала времени. Хотя выражение "время жизни" звучит так, будто оно применяется только к удалению старых данных, TTL имеет несколько случаев использования:

- Удаление старых данных: нет ничего удивительного, что вы можете удалять строки или колонки после указанного временного интервала
- Перемещение данных между дисками: после определенного времени вы можете перемещать данные между хранилищами - полезно для развертывания архитектуры горячего/теплого/холодного хранения
- Агрегация данных: агрегируйте ваши старые данные в различные полезные агрегаты и вычисления перед их удалением

:::note
TTL может быть применен ко всей таблице или конкретным колонкам.
:::

## Синтаксис TTL {#ttl-syntax}

Клаузула `TTL` может появляться после определения колонки и/или в конце определения таблицы. Используйте клаузулу `INTERVAL`, чтобы определить длительность времени (которая должна быть типа данных `Date` или `DateTime`). Например, следующая таблица имеет две колонки с клаузами `TTL`:

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

- Колонка x имеет время жизни 1 месяц от колонки timestamp
- Колонка y имеет время жизни 1 день от колонки timestamp
- Когда интервал истекает, колонка теряет силу. ClickHouse заменяет значение колонки на значение по умолчанию для ее типа данных. Если все значения колонки в части данных теряют силу, ClickHouse удаляет эту колонку из части данных в файловой системе.

:::note
Правила TTL могут быть изменены или удалены. См. страницу [Манипуляции с TTL таблицы](/sql-reference/statements/alter/ttl.md) для получения дополнительной информации.
:::

## Порождение событий TTL {#triggering-ttl-events}

Удаление или агрегирование истекших строк не происходит немедленно - оно происходит только во время слияний таблицы. Если у вас есть таблица, которая не активно сливается (по какой-либо причине), существуют два параметра, которые запускают события TTL:

- `merge_with_ttl_timeout`: минимальная задержка в секундах перед повторным слиянием с удалением TTL. Значение по умолчанию - 14400 секунд (4 часа).
- `merge_with_recompression_ttl_timeout`: минимальная задержка в секундах перед повторным слиянием с рекомпрессией TTL (правила, которые агрегируют данные перед их удалением). Значение по умолчанию: 14400 секунд (4 часа).

Таким образом, по умолчанию ваши правила TTL будут применяться к вашей таблице как минимум раз в 4 часа. Просто измените указанные выше параметры, если вам нужно, чтобы ваши правила TTL применялись чаще.

:::note
Это не самое лучшее решение (или то, которое мы рекомендуем использовать часто), но вы также можете принудительно выполнить слияние, используя `OPTIMIZE`:

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE` инициирует неплановое слияние частей вашей таблицы, а `FINAL` принуждает к переоптимизации, если ваша таблица уже состоит из одной части.
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

Кроме того, возможно определить правило TTL на основе значения записи. Это легко реализуется с указанием условия where. Разрешены несколько условий:

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

## Удаление колонок {#removing-columns}

Вместо того чтобы удалить всю строку, предположим, вы хотите, чтобы истекли только колонки balance и address. Давайте изменим таблицу `customers` и добавим TTL для обеих колонок, равный 2 часам:

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```

## Реализация агрегации {#implementing-a-rollup}
Предположим, мы хотим удалить строки через определенное время, но сохранить некоторые данные для отчетности. Мы не хотим все детали - только несколько агрегированных результатов исторических данных. Это можно реализовать, добавив клаузулу `GROUP BY` к вашему выражению `TTL`, вместе с некоторыми колонками в вашей таблице для хранения агрегированных результатов.

Предположим, в следующей таблице `hits` мы хотим удалить старые строки, но сохранить сумму и максимум колонок `hits` перед удалением строк. Нам потребуется поле для хранения этих значений, и нам нужно будет добавить клаузулу `GROUP BY` к клаузе `TTL`, которая агрегирует сумму и максимум:

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

- Колонки `GROUP BY` в клаузе `TTL` должны быть префиксом `PRIMARY KEY`, и мы хотим сгруппировать наши результаты по началу дня. Поэтому к первичному ключу была добавлена `toStartOfDay(timestamp)`
- Мы добавили два поля для хранения агрегированных результатов: `max_hits` и `sum_hits`
- Установка значения по умолчанию для `max_hits` и `sum_hits` равного `hits` необходима для того, чтобы наша логика работала, исходя из того, как определена клаузула `SET`

## Реализация архитектуры горячего/теплого/холодного хранения {#implementing-a-hotwarmcold-architecture}

<CloudNotSupportedBadge/>

:::note
Если вы используете ClickHouse Cloud, шаги в уроке не применимы. Вам не нужно беспокоиться о перемещении старых данных в ClickHouse Cloud.
:::

Обычной практикой при работе с большими объемами данных является их перемещение по мере старения. Вот шаги для реализации архитектуры горячего/теплого/холодного хранения в ClickHouse с использованием клаузул `TO DISK` и `TO VOLUME` команды `TTL`. (Для справки, это не обязательно должна быть горячая и холодная структура - вы можете использовать TTL для перемещения данных для любого случая использования.)

1. Опции `TO DISK` и `TO VOLUME` ссылаются на имена дисков или томов, определенных в ваших конфигурационных файлах ClickHouse. Создайте новый файл с именем `my_system.xml` (или любое имя файла), который определяет ваши диски, затем определите тома, использующие ваши диски. Поместите XML-файл в `/etc/clickhouse-server/config.d/`, чтобы применить конфигурацию к вашей системе:

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

2. В приведенной выше конфигурации ссылается на три диска, которые указывают на папки, из которых ClickHouse может читать и записывать данные. Том может содержать один или несколько дисков - мы определили том для каждого из трех дисков. Давайте посмотрим на диски:

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

3. И… давайте проверим тома:

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

5. Новое правило `TTL` должно материализоваться, но вы можете принудительно его выполнить, чтобы убедиться:

```sql
ALTER TABLE my_table
    MATERIALIZE TTL
```

6. Проверьте, что ваши данные переместились на ожидаемые диски, используя таблицу `system.parts`:

```sql
Используя таблицу system.parts, посмотрите, на каких дисках находятся части таблицы crypto_prices:

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


## Связанное содержимое {#related-content}

- Блог и вебинар: [Использование TTL для управления жизненными циклами данных в ClickHouse](https://clickhouse.com/blog/using-ttl-to-manage-data-lifecycles-in-clickhouse)
