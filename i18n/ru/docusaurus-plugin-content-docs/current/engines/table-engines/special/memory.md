---
slug: '/engines/table-engines/special/memory'
sidebar_label: Memory
sidebar_position: 110
description: 'Движок Memory хранит данные в RAM в неконфессионной форме. Данные'
title: 'Движок таблиц памяти'
doc_type: reference
---
# Движок таблицы Memory

:::note
При использовании движка таблицы Memory в ClickHouse Cloud данные не реплицируются по всем узлам (по дизайну). Чтобы гарантировать, что все запросы направляются на один и тот же узел и что движок таблицы Memory работает как ожидается, вы можете сделать одно из следующего:
- Выполнять все операции в одной сессии
- Использовать клиент, который использует TCP или нативный интерфейс (что позволяет поддерживать липкие соединения), например [clickhouse-client](/interfaces/cli)
:::

Движок Memory хранит данные в ОЗУ в несжатом виде. Данные хранятся в точно такой же форме, в какой они принимаются при чтении. Иными словами, чтение из этой таблицы абсолютно бесплатно. 
Одновременный доступ к данным синхронизирован. Блокировки короткие: операции чтения и записи не блокируют друг друга. 
Индексы не поддерживаются. Чтение параллелизовано.

Максимальная производительность (более 10 ГБ/с) достигается на простых запросах, так как нет чтения с диска, распаковки или десериализации данных. (Следует отметить, что в многих случаях производительность движка MergeTree почти так же высока.) 
При перезагрузке сервера данные исчезают из таблицы, и таблица становится пустой. 
Обычно использование этого движка таблицы не оправдано. Тем не менее, его можно использовать для тестов и для задач, где требуется максимальная скорость на относительно небольшом количестве строк (до примерно 100000000).

Движок Memory используется системой для временных таблиц с данными внешнего запроса (см. раздел "Внешние данные для обработки запроса") и для реализации `GLOBAL IN` (см. раздел "Операторы IN").

Верхние и нижние пределы могут быть заданы для ограничения размера таблицы движка Memory, эффективно позволяя ему действовать как кольцевой буфер (см. [Параметры движка](#engine-parameters)).

## Параметры движка {#engine-parameters}

- `min_bytes_to_keep` — Минимальное количество байт для сохранения, когда таблица в памяти имеет ограничение по размеру.
  - Значение по умолчанию: `0`
  - Требует `max_bytes_to_keep`
- `max_bytes_to_keep` — Максимальное количество байт для сохранения в таблице в памяти, где старейшие строки удаляются при каждой вставке (т.е. кольцевой буфер). Максимальное количество байт может превышать указанное ограничение, если старейшая партия строк для удаления попадает под предел `min_bytes_to_keep` при добавлении большого блока.
  - Значение по умолчанию: `0`
- `min_rows_to_keep` — Минимальное количество строк для сохранения, когда таблица в памяти имеет ограничение по размеру.
  - Значение по умолчанию: `0`
  - Требует `max_rows_to_keep`
- `max_rows_to_keep` — Максимальное количество строк для сохранения в таблице памяти, где старейшие строки удаляются при каждой вставке (т.е. кольцевой буфер). Максимальное количество строк может превышать указанное ограничение, если старейшая партия строк для удаления попадает под предел `min_rows_to_keep` при добавлении большого блока.
  - Значение по умолчанию: `0`
- `compress` - Нужно ли сжимать данные в памяти.
  - Значение по умолчанию: `false`

## Использование {#usage}

**Инициализация настроек**
```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**Изменение настроек**
```sql
ALTER TABLE memory MODIFY SETTING min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**Примечание:** Параметры ограничения как в `bytes`, так и в `rows` могут быть установлены одновременно, однако будут соблюдены нижние пределы `max` и `min`.

## Примеры {#examples}
```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_bytes_to_keep = 4096, max_bytes_to_keep = 16384;

/* 1. testing oldest block doesn't get deleted due to min-threshold - 3000 rows */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 8'192 bytes

/* 2. adding block that doesn't get deleted */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 1'024 bytes

/* 3. testing oldest block gets deleted - 9216 bytes - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 8'192 bytes

/* 4. checking a very large block overrides all */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 65'536 bytes

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' AND database = currentDatabase();
```

```text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```

также, для строк:

```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 4000, max_rows_to_keep = 10000;

/* 1. testing oldest block doesn't get deleted due to min-threshold - 3000 rows */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 1'600 rows

/* 2. adding block that doesn't get deleted */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 100 rows

/* 3. testing oldest block gets deleted - 9216 bytes - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 1'000 rows

/* 4. checking a very large block overrides all */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 10'000 rows

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' AND database = currentDatabase();
```

```text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```