---
'slug': '/guides/developer/ttl'
'sidebar_label': 'TTL (время жизни)'
'sidebar_position': 2
'keywords':
- 'ttl'
- 'time to live'
- 'clickhouse'
- 'old'
- 'data'
'description': 'TTL (время жизни) относится к способности перемещать, удалять или
  сворачивать строки или колонки после того, как пройдет определенный интервал времени.'
'title': 'Управление данными с помощью TTL (времени жизни)'
'show_related_blogs': true
'doc_type': 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Управление данными с помощью TTL (времени жизни)

## Обзор TTL {#overview-of-ttl}

TTL (время жизни) относится к возможности перемещения, удаления или агрегации строк или столбцов после истечения определенного интервала времени. Хотя выражение "время жизни" звучит так, будто оно применяется только для удаления старых данных, у TTL есть несколько вариантов применения:

- Удаление старых данных: нет ничего удивительного, что вы можете удалить строки или столбцы после указанного временного интервала
- Перемещение данных между дисками: через определенное время вы можете перемещать данные между накопителями - это полезно для развертывания архитектуры "горячий/тёплый/холодный"
- Аграция данных: агрегируйте ваши старые данные в различные полезные агрегаты и вычисления перед удалением их

:::note
TTL можно применять ко всем таблицам или конкретным столбцам.
:::

## Синтаксис TTL {#ttl-syntax}

Клауза `TTL` может появляться после определения столбца и/или в конце определения таблицы. Используйте клаузу `INTERVAL`, чтобы определить длину времени (которая должна быть типа `Date` или `DateTime`). Например, следующая таблица содержит два столбца с клаузами `TTL`:

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
- Когда интервал истечет, столбец истечет. ClickHouse заменяет значение столбца на значение по умолчанию его типа данных. Если все значения столбца в части данных истекают, ClickHouse удаляет этот столбец из части данных в файловой системе.

:::note
Правила TTL могут быть изменены или удалены. Смотрите страницу [Манипуляции с TTL таблицы](/sql-reference/statements/alter/ttl.md) для получения дополнительной информации.
:::

## Генерация событий TTL {#triggering-ttl-events}

Удаление или агрегация истекших строк не происходит немедленно - это происходит только во время слияний таблиц. Если у вас есть таблица, которая активно не сливается (по какой-либо причине), существует два параметра, которые вызывают события TTL:

- `merge_with_ttl_timeout`: минимальная задержка в секундах перед повторным слиянием с удалением TTL. По умолчанию 14400 секунд (4 часа).
- `merge_with_recompression_ttl_timeout`: минимальная задержка в секундах перед повторным слиянием с рекомпрессией TTL (правила, которые агрегируют данные перед удалением). Значение по умолчанию: 14400 секунд (4 часа).

Таким образом, по умолчанию ваши правила TTL будут применяться к вашей таблице как минимум раз в 4 часа. Просто измените указанные выше настройки, если вам нужно, чтобы ваши правила TTL применялись чаще.

:::note
Не лучшее решение (или то, которое мы рекомендуем использовать часто), но вы также можете принудительно вызвать слияние, используя `OPTIMIZE`:

```sql
OPTIMIZE TABLE example1 FINAL
```

`OPTIMIZE` инициализирует несогласованное слияние частей вашей таблицы, а `FINAL` принуждает к реоптимизации, если ваша таблица уже состоит из одной части.
:::

## Удаление строк {#removing-rows}

Чтобы удалять целые строки из таблицы после определенного времени, определите правило TTL на уровне таблицы:

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

Кроме того, возможно определение правила TTL на основе значения записи. Это легко реализовать, указав условие where. Разрешены множественные условия:

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

Вместо удаления всей строки, предположим, вы хотите, чтобы истекли только столбцы "баланс" и "адрес". Давайте изменим таблицу `customers` и добавим TTL для обоих столбцов на 2 часа:

```sql
ALTER TABLE customers
MODIFY COLUMN balance Int32 TTL timestamp + INTERVAL 2 HOUR,
MODIFY COLUMN address String TTL timestamp + INTERVAL 2 HOUR
```

## Реализация агрегации {#implementing-a-rollup}
Предположим, мы хотим удалить строки после определенного времени, но сохранить некоторые данные для целей отчетности. Мы не хотим все детали - только несколько агрегированных результатов исторических данных. Это можно реализовать, добавив клаузу `GROUP BY` в ваше выражение `TTL`, вместе с некоторыми столбцами в вашей таблице для хранения агрегированных результатов.

Предположим, в следующей таблице `hits` мы хотим удалить старые строки, но сохранить сумму и максимум столбца `hits` перед удалением строк. Нам потребуется поле для хранения этих значений, и нам нужно будет добавить клаузу `GROUP BY` к клаузе `TTL`, которая агрегирует сумму и максимум:

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

Некоторые заметки о таблице `hits`:

- Столбцы `GROUP BY` в клаузе `TTL` должны быть префиксом `PRIMARY KEY`, и мы хотим сгруппировать наши результаты по началу дня. Следовательно, `toStartOfDay(timestamp)` было добавлено в первичный ключ
- Мы добавили два поля для хранения агрегированных результатов: `max_hits` и `sum_hits`
- Установка значения по умолчанию для `max_hits` и `sum_hits` на `hits` необходима для работы нашей логики, исходя из того, как определена клауса `SET`

## Реализация архитектуры горячий/тёплый/холодный {#implementing-a-hotwarmcold-architecture}

<CloudNotSupportedBadge/>

:::note
Если вы используете ClickHouse Cloud, шаги в уроке не применимы. Вам не нужно беспокоиться о перемещении старых данных в ClickHouse Cloud.
:::

Распространенной практикой при работе с большими объемами данных является перемещение этих данных по мере их старения. Вот шаги для реализации архитектуры горячий/тёплый/холодный в ClickHouse с использованием клауз `TO DISK` и `TO VOLUME` команды `TTL`. (Кстати, это не обязательно должно касаться горячего и холодного - вы можете использовать TTL для перемещения данных для любого вашего случая использования.)

1. Опции `TO DISK` и `TO VOLUME` относятся к именам дисков или объемов, определенным в ваших файлах конфигурации ClickHouse. Создайте новый файл с именем `my_system.xml` (или любое другое имя файла), который определяет ваши диски, а затем определите объемы, использующие ваши диски. Поместите XML-файл в `/etc/clickhouse-server/config.d/`, чтобы конфигурация применялась к вашей системе:

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

2. В приведенной выше конфигурации упоминаются три диска, которые указывают на папки, из которых ClickHouse может читать и записывать. Объемы могут содержать один или несколько дисков - мы определили объем для каждого из трех дисков. Давайте посмотрим на диски:

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

3. И... давайте проверим объемы:

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

4. Теперь мы добавим правило `TTL`, которое перемещает данные между горячими, тёплыми и холодными объемами:

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

6. Проверьте, что ваши данные переместились на ожидаемые диски с помощью таблицы `system.parts`:

```sql
Using the system.parts table, view which disks the parts are on for the crypto_prices table:

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
