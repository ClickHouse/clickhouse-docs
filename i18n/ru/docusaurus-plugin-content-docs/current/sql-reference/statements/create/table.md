---
description: 'Документация для Таблицы'
keywords: ['сжатие', 'кодек', 'схема', 'DDL']
sidebar_label: 'ТАБЛИЦА'
sidebar_position: 36
slug: /sql-reference/statements/create/table
title: 'CREATE TABLE'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Создает новую таблицу. Этот запрос может иметь различные синтаксические формы в зависимости от сценария использования.

По умолчанию таблицы создаются только на текущем сервере. Распределенные DDL запросы реализованы как `ON CLUSTER`, что [описано отдельно](../../../sql-reference/distributed-ddl.md).
## Синтаксические формы {#syntax-forms}
### Явная схема {#with-explicit-schema}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr1] [COMMENT 'comment for column'] [compression_codec] [TTL expr1],
    name2 [type2] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr2] [COMMENT 'comment for column'] [compression_codec] [TTL expr2],
    ...
) ENGINE = engine
  [COMMENT 'comment for table']
```

Создает таблицу с именем `table_name` в базе данных `db` или в текущей базе данных, если `db` не установлен, со структурой, указанной в скобках, и движком `engine`.
Структура таблицы представляет собой список описаний столбцов, вторичных индексов и ограничений. Если [первичный ключ](#primary-key) поддерживается движком, он будет указан как параметр для движка таблицы.

Описание столбца — это `name type` в самом простом случае. Пример: `RegionID UInt32`.

Также можно определить выражения для значений по умолчанию (см. ниже).

При необходимости можно указать первичный ключ с одним или несколькими выражениями ключа.

Комментариев можно добавить как для столбцов, так и для таблицы.
### Со схемой, подобной другой таблице {#with-a-schema-similar-to-other-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine]
```

Создает таблицу с той же структурой, что и другая таблица. Вы можете указать другой движок для таблицы. Если движок не указан, будет использован тот же движок, что и для таблицы `db2.name2`.
### Со схемой и данными, клонированными из другой таблицы {#with-a-schema-and-data-cloned-from-another-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name CLONE AS [db2.]name2 [ENGINE = engine]
```

Создает таблицу с той же структурой, что и другая таблица. Вы можете указать другой движок для таблицы. Если движок не указан, будет использован тот же движок, что и для таблицы `db2.name2`. После создания новой таблицы к ней прикрепляется все разделы из `db2.name2`. Другими словами, данные из `db2.name2` клонируются в `db.table_name` при создании. Этот запрос эквивалентен следующему:

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine];
ALTER TABLE [db.]table_name ATTACH PARTITION ALL FROM [db2].name2;
```
### Из функции таблицы {#from-a-table-function}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

Создает таблицу с тем же результатом, что и указанная [функция таблицы](/sql-reference/table-functions). Созданная таблица также будет работать так же, как соответствующая функция таблицы, которая была указана.
### Из запроса SELECT {#from-select-query}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name[(name1 [type1], name2 [type2], ...)] ENGINE = engine AS SELECT ...
```

Создает таблицу со структурой, аналогичной результату запроса `SELECT`, с движком `engine`, и заполняет ее данными из `SELECT`. Вы также можете явно указать описание столбцов.

Если таблица уже существует и указан `IF NOT EXISTS`, запрос ничего не сделает.

В запросе могут быть другие клаузулы после клаузулы `ENGINE`. См. подробную документацию о том, как создавать таблицы в описаниях [движков таблиц](/engines/table-engines).

:::tip
В ClickHouse Cloud, пожалуйста, разделите это на два шага:
1. Создайте структуру таблицы

  ```sql
  CREATE TABLE t1
  ENGINE = MergeTree
  ORDER BY ...
  -- highlight-next-line
  EMPTY AS
  SELECT ...
  ```

2. Заполните таблицу

  ```sql
  INSERT INTO t1
  SELECT ...
  ```

:::

**Пример**

Запрос:

```sql
CREATE TABLE t1 (x String) ENGINE = Memory AS SELECT 1;
SELECT x, toTypeName(x) FROM t1;
```

Результат:

```text
┌─x─┬─toTypeName(x)─┐
│ 1 │ String        │
└───┴───────────────┘
```
## Модификаторы NULL или NOT NULL {#null-or-not-null-modifiers}

Модификаторы `NULL` и `NOT NULL`, следующие за типом данных в определении столбца, разрешают или не разрешают его [Nullable](/sql-reference/data-types/nullable).

Если тип не `Nullable` и если указан `NULL`, он будет рассматриваться как `Nullable`; если указан `NOT NULL`, то нет. Например, `INT NULL` эквивалентен `Nullable(INT)`. Если тип является `Nullable` и указаны модификаторы `NULL` или `NOT NULL`, будет выброшено исключение.

См. также настройку [data_type_default_nullable](../../../operations/settings/settings.md#data_type_default_nullable).
## Значения по умолчанию {#default_values}

Описание столбца может задать выражение для значения по умолчанию в форме `DEFAULT expr`, `MATERIALIZED expr` или `ALIAS expr`. Пример: `URLDomain String DEFAULT domain(URL)`.

Выражение `expr` является необязательным. Если оно опущено, тип столбца должен быть указан явно, и значение по умолчанию будет `0` для числовых столбцов, `''` (пустая строка) для строковых столбцов, `[]` (пустой массив) для массивных столбцов, `1970-01-01` для столбцов даты или `NULL` для nullable столбцов.

Тип столбца для столбца со значением по умолчанию может быть опущен, в этом случае он выводится на основе типа `expr`. Например, тип столбца `EventDate DEFAULT toDate(EventTime)` будет date.

Если одновременно указаны и тип данных, и выражение значения по умолчанию, будет вставлена неявная функция приведения типов, которая преобразует выражение в указанный тип. Пример: `Hits UInt32 DEFAULT 0` внутренне представляется как `Hits UInt32 DEFAULT toUInt32(0)`.

Выражение значения по умолчанию `expr` может ссылаться на произвольные столбцы таблицы и константы. ClickHouse проверяет, чтобы изменения структуры таблицы не вводили циклы в вычислении выражения. Для INSERT он проверяет, что выражения являются разрешимыми — что все столбцы, от которых они могут быть вычислены, были переданы.
### DEFAULT {#default}

`DEFAULT expr`

Обычное значение по умолчанию. Если значение такого столбца не указано в запросе INSERT, оно вычисляется из `expr`.

Пример:

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    updated_at DateTime DEFAULT now(),
    updated_at_date Date DEFAULT toDate(updated_at)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test (id) Values (1);

SELECT * FROM test;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:06:46 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘
```
### MATERIALIZED {#materialized}

`MATERIALIZED expr`

Материализованное выражение. Значения таких столбцов автоматически вычисляются в соответствии с указанным материализованным выражением при вставке строк. Значения не могут быть явно указаны во время `INSERT`.

Кроме того, столбцы значений по умолчанию этого типа не включаются в результат `SELECT *`. Это необходимо для сохранения инварианта, согласно которому результат `SELECT *` всегда может быть снова вставлен в таблицу с использованием `INSERT`. Это поведение можно отключить с помощью настройки `asterisk_include_materialized_columns`.

Пример:

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    updated_at DateTime MATERIALIZED now(),
    updated_at_date Date MATERIALIZED toDate(updated_at)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test Values (1);

SELECT * FROM test;
┌─id─┐
│  1 │
└────┘

SELECT id, updated_at, updated_at_date FROM test;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:08:08 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘

SELECT * FROM test SETTINGS asterisk_include_materialized_columns=1;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:08:08 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘
```
### EPHEMERAL {#ephemeral}

`EPHEMERAL [expr]`

Эфемерный столбец. Столбцы данного типа не хранятся в таблице и невозможно выполнять SELECT из них. Единственная цель эфемерных столбцов — это создание выражений значений по умолчанию для других столбцов.

Вставка без явно указанных столбцов пропустит столбцы данного типа. Это необходимо для сохранения инварианта, согласно которому результат `SELECT *` всегда может быть снова вставлен в таблицу с использованием `INSERT`.

Пример:

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    unhexed String EPHEMERAL,
    hexed FixedString(4) DEFAULT unhex(unhexed)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test (id, unhexed) Values (1, '5a90b714');

SELECT
    id,
    hexed,
    hex(hexed)
FROM test
FORMAT Vertical;

Row 1:
──────
id:         1
hexed:      Z��
hex(hexed): 5A90B714
```
### ALIAS {#alias}

`ALIAS expr`

Вычисляемые столбцы (синоним). Столбец данного типа не хранится в таблице, и невозможно вставить в него значения.

Когда запросы SELECT прямо ссылаются на столбцы данного типа, значение вычисляется во время выполнения запроса из `expr`. По умолчанию `SELECT *` исключает столбцы ALIAS. Это поведение можно отключить с помощью настройки `asterisk_include_alias_columns`.

При использовании запроса ALTER для добавления новых столбцов старые данные для этих столбцов не записываются. Вместо этого, при чтении старых данных, в которых отсутствуют значения для новых столбцов, выражения вычисляются на лету по умолчанию. Однако, если выполнение выражений требует чтения других столбцов, которые не указаны в запросе, эти столбцы будут дополнительно прочитаны, но только для блоков данных, которые в этом нуждаются.

Если вы добавите новый столбец в таблицу, но позже измените его выражение по умолчанию, значения, используемые для старых данных, изменятся (для данных, где значения не были сохранены на диске). Обратите внимание, что при выполнении фоновых слияний данные для столбцов, отсутствующих в одной из сливающихся частей, записываются в объединенную часть.

Невозможно установить значения по умолчанию для элементов в вложенных структурах данных.

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    size_bytes Int64,
    size String ALIAS formatReadableSize(size_bytes)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test VALUES (1, 4678899);

SELECT id, size_bytes, size FROM test;
┌─id─┬─size_bytes─┬─size─────┐
│  1 │    4678899 │ 4.46 MiB │
└────┴────────────┴──────────┘

SELECT * FROM test SETTINGS asterisk_include_alias_columns=1;
┌─id─┬─size_bytes─┬─size─────┐
│  1 │    4678899 │ 4.46 MiB │
└────┴────────────┴──────────┘
```
## Первичный ключ {#primary-key}

Вы можете определить [первичный ключ](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries) при создании таблицы. Первичный ключ можно указать двумя способами:

- Внутри списка столбцов

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...,
    PRIMARY KEY(expr1[, expr2,...])
)
ENGINE = engine;
```

- Снаружи списка столбцов

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
PRIMARY KEY(expr1[, expr2,...]);
```

:::tip
Вы не можете комбинировать оба способа в одном запросе.
:::
## Ограничения {#constraints}

Вместе с описаниями столбцов могут быть определены ограничения:
### CONSTRAINT {#constraint}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [compression_codec] [TTL expr1],
    ...
    CONSTRAINT constraint_name_1 CHECK boolean_expr_1,
    ...
) ENGINE = engine
```

`boolean_expr_1` может быть любой логической выражением. Если для таблицы определены ограничения, каждое из них будет проверяться для каждой строки в запросе `INSERT`. Если любое ограничение не выполнено — сервер выдаст исключение с именем ограничения и проверяемым выражением.

Добавление большого количества ограничений может негативно сказаться на производительности больших запросов `INSERT`.
### ASSUME {#assume}

Клауза `ASSUME` используется для определения `CONSTRAINT` на таблице, который предполагается истинным. Это ограничение может быть использовано оптимизатором для повышения производительности SQL-запросов.

Рассмотрим следующий пример, в котором используется `ASSUME CONSTRAINT` при создании таблицы `users_a`:

```sql
CREATE TABLE users_a (
    uid Int16, 
    name String, 
    age Int16, 
    name_len UInt8 MATERIALIZED length(name), 
    CONSTRAINT c1 ASSUME length(name) = name_len
) 
ENGINE=MergeTree 
ORDER BY (name_len, name);
```

Здесь `ASSUME CONSTRAINT` используется для утверждения, что функция `length(name)` всегда равна значению столбца `name_len`. Это означает, что всякий раз, когда в запросе вызывается `length(name)`, ClickHouse может заменить ее на `name_len`, что должно быть быстрее, так как это избегает вызова функции `length()`.

Затем, когда выполняется запрос `SELECT name FROM users_a WHERE length(name) < 5;`, ClickHouse может оптимизировать его до `SELECT name FROM users_a WHERE name_len < 5`; благодаря `ASSUME CONSTRAINT`. Это может ускорить выполнение запроса, так как исключает необходимость вычисления длины `name` для каждой строки.

`ASSUME CONSTRAINT` **не накладывает ограничение**, он всего лишь информирует оптимизатор о том, что ограничение истинно. Если ограничение на самом деле не истинно, результаты запросов могут быть неверными. Поэтому следует использовать `ASSUME CONSTRAINT` только в том случае, если вы уверены, что ограничение истинно.
## Выражение TTL {#ttl-expression}

Определяет время хранения значений. Может быть указано только для таблиц семейства MergeTree. Для подробного описания см. [TTL для столбцов и таблиц](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl).
## Кодеки сжатия столбцов {#column_compression_codec}

По умолчанию ClickHouse применяет сжатие `lz4` в самоуправляемой версии и `zstd` в ClickHouse Cloud. 

Для семейства движков `MergeTree` вы можете изменить метод сжатия по умолчанию в разделе [compression](/operations/server-configuration-parameters/settings#compression) файла конфигурации сервера.

Вы также можете задать метод сжатия для каждого отдельного столбца в запросе `CREATE TABLE`.

```sql
CREATE TABLE codec_example
(
    dt Date CODEC(ZSTD),
    ts DateTime CODEC(LZ4HC),
    float_value Float32 CODEC(NONE),
    double_value Float64 CODEC(LZ4HC(9)),
    value Float32 CODEC(Delta, ZSTD)
)
ENGINE = <Engine>
...
```

Кодек `Default` может быть указан для ссылки на стандартное сжатие, которое может зависеть от различных настроек (и свойств данных) во время выполнения.
Пример: `value UInt64 CODEC(Default)` — то же самое, что и отсутствие спецификации кодека.

Также вы можете удалить текущий CODEC из столбца и использовать стандартное сжатие из config.xml:

```sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```

Кодеки могут комбинироваться в конвейере, например, `CODEC(Delta, Default)`.

:::tip
Вы не можете декомпрессировать файлы базы данных ClickHouse с помощью внешних утилит, таких как `lz4`. Вместо этого используйте специальную утилиту [clickhouse-compressor](https://github.com/ClickHouse/ClickHouse/tree/master/programs/compressor).
:::

Сжатие поддерживается для следующих движков таблиц:

- Семейство [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md). Поддерживает кодеки сжатия столбцов и выбор стандартного метода сжатия по настройкам [compression](/operations/server-configuration-parameters/settings#compression).
- Семейство [Log](../../../engines/table-engines/log-family/index.md). По умолчанию использует метод сжатия `lz4` и поддерживает кодеки сжатия столбцов.
- [Set](../../../engines/table-engines/special/set.md). Поддерживает только стандартное сжатие.
- [Join](../../../engines/table-engines/special/join.md). Поддерживает только стандартное сжатие.

ClickHouse поддерживает кодеки общего назначения и специализированные кодеки.
### Кодеки общего назначения {#general-purpose-codecs}
#### NONE {#none}

`NONE` — Без сжатия.
#### LZ4 {#lz4}

`LZ4` — Безопасный алгоритм [сжатия данных](https://github.com/lz4/lz4), используемый по умолчанию. Применяет быстрое сжатие LZ4.
#### LZ4HC {#lz4hc}

`LZ4HC[(level)]` — Алгоритм LZ4 HC (высокий уровень сжатия) с настраиваемым уровнем. Уровень по умолчанию: 9. Установка `level <= 0` применяет уровень по умолчанию. Возможные уровни: \[1, 12\]. Рекомендуемый диапазон уровней: \[4, 9\].
#### ZSTD {#zstd}

`ZSTD[(level)]` — [Алгоритм сжатия ZSTD](https://en.wikipedia.org/wiki/Zstandard) с настраиваемым `level`. Возможные уровни: \[1, 22\]. Уровень по умолчанию: 1.

Высокие уровни сжатия полезны для асимметричных сценариев, таких как сжатие один раз, многократное декомпрессирование. Более высокие уровни означают лучшее сжатие и большее использование CPU.
#### ZSTD_QAT {#zstd_qat}

<CloudNotSupportedBadge/>

`ZSTD_QAT[(level)]` — [Алгоритм сжатия ZSTD](https://en.wikipedia.org/wiki/Zstandard) с настраиваемым уровнем, реализованный с помощью [Intel® QATlib](https://github.com/intel/qatlib) и [Intel® QAT ZSTD Plugin](https://github.com/intel/QAT-ZSTD-Plugin). Возможные уровни: \[1, 12\]. Уровень по умолчанию: 1. Рекомендуемый диапазон уровней: \[6, 12\]. Имеются некоторые ограничения:

- ZSTD_QAT отключен по умолчанию и может быть использован только после включения настройки конфигурации [enable_zstd_qat_codec](../../../operations/settings/settings.md#enable_zstd_qat_codec).
- Для сжатия ZSTD_QAT пытается использовать устройство разгрузки Intel® QAT ([Технология QuickAssist](https://www.intel.com/content/www/us/en/developer/topic-technology/open/quick-assist-technology/overview.html)). Если такое устройство не найдено, оно будет переключено на сжатие ZSTD в программном обеспечении.
- Декомпрессия всегда выполняется в программном обеспечении.
#### DEFLATE_QPL {#deflate_qpl}

<CloudNotSupportedBadge/>

`DEFLATE_QPL` — [Алгоритм сжатия Deflate](https://github.com/intel/qpl), реализованный библиотекой Intel® Query Processing Library. Некоторые ограничения применимы:

- DEFLATE_QPL отключен по умолчанию и может быть использован только после включения настройки конфигурации [enable_deflate_qpl_codec](../../../operations/settings/settings.md#enable_deflate_qpl_codec).
- DEFLATE_QPL требует сборку ClickHouse, скомпилированную с использованием инструкций SSE 4.2 (по умолчанию это так). Смотрите [Сборка Clickhouse с DEFLATE_QPL](/development/building_and_benchmarking_deflate_qpl) для получения дополнительных деталей.
- DEFLATE_QPL работает лучше всего, если система имеет устройство разгрузки Intel® IAA (In-Memory Analytics Accelerator). Смотрите [Конфигурация ускорителя](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration) и [Бenchmark с DEFLATE_QPL](/development/building_and_benchmarking_deflate_qpl) для получения дополнительных деталей.
- Данные, сжимаемые DEFLATE_QPL, могут передаваться только между узлами ClickHouse, скомпилированными с включенной поддержкой SSE 4.2.
### Специализированные кодеки {#specialized-codecs}

Эти кодеки предназначены для повышения эффективности сжатия за счет использования специфических особенностей данных. Некоторые из этих кодеков не сжимают данные сами по себе, они предварительно обрабатывают данные, так что второй этап сжатия с использованием кодека общего назначения может достичь более высокого уровня сжатия данных.
#### Delta {#delta}

`Delta(delta_bytes)` — Подход к сжатию, при котором сырые значения заменяются разностью двух соседних значений, за исключением первого значения, которое остается неизменным. Максимум `delta_bytes` используется для хранения дельта-значений, поэтому `delta_bytes` — максимальный размер сырых значений. Возможные значения `delta_bytes`: 1, 2, 4, 8. Значение по умолчанию для `delta_bytes` равно `sizeof(type)`, если равно 1, 2, 4 или 8. Во всех остальных случаях оно равно 1. Delta является кодеком подготовки данных, т.е. он не может использоваться автономно.
#### DoubleDelta {#doubledelta}

`DoubleDelta(bytes_size)` — Вычисляет дельту дельт и записывает ее в компактной двоичной форме. Возможные значения `bytes_size`: 1, 2, 4, 8, значение по умолчанию равно `sizeof(type)`, если равно 1, 2, 4 или 8. Во всех остальных случаях оно равно 1. Оптимальные коэффициенты сжатия достигаются для монотонных последовательностей с постоянным шагом, таких как данные временных рядов. Может быть использован с любым типом фиксированной ширины. Реализует алгоритм, используемый в Gorilla TSDB, расширяя его для поддержки 64-битных типов. Использует 1 дополнительный бит для 32-битных дельт: 5-битные префиксы вместо 4-битных префиксов. Для получения дополнительной информации см. "Сжатие временных меток" в [Gorilla: Быстрая, масштабируемая, в памяти база данных временных рядов](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf). DoubleDelta является кодеком подготовки данных, т.е. он не может использоваться автономно.
#### GCD {#gcd}

`GCD()` - Вычисляет наибольший общий делитель (НОД) значений в столбце, а затем делит каждое значение на НОД. Может быть использован с целочисленными, десятичными и временными столбцами. Кодек хорошо подходит для столбцов со значениями, которые изменяются (увеличиваются или уменьшаются) кратно НОД, например, 24, 28, 16, 24, 8, 24 (Н од = 4). GCD является кодеком подготовки данных, т.е. он не может использоваться автономно.
#### Gorilla {#gorilla}

`Gorilla(bytes_size)` — Вычисляет XOR между текущим и предыдущим значением с плавающей точкой и записывает его в компактной двоичной форме. Чем меньше разница между последовательными значениями, т.е. чем медленнее меняются значения последовательности, тем лучше коэффициент сжатия. Реализует алгоритм, используемый в Gorilla TSDB, расширяя его для поддержки 64-битных типов. Возможные значения `bytes_size`: 1, 2, 4, 8, значение по умолчанию равно `sizeof(type)`, если равно 1, 2, 4 или 8. Во всех остальных случаях оно равно 1. Для получения дополнительной информации см. раздел 4.1 в [Gorilla: Быстрая, масштабируемая, в памяти база данных временных рядов](https://doi.org/10.14778/2824032.2824078).
#### FPC {#fpc}

`FPC(level, float_size)` - Многократно предсказывает следующее значение с плавающей точкой в последовательности, используя лучший из двух предсказателей, затем вычисляет XOR между фактическим и предсказанным значением и выполняет сжатие ведущих нулей над результатом. Похоже на Gorilla, это эффективно при хранении серии значений с плавающей точкой, которые медленно меняются. Для 64-битных значений (double) FPC быстрее, чем Gorilla, для 32-битных значений возможно, что результаты будут различными. Возможные значения `level`: 1-28, значение по умолчанию — 12. Возможные значения `float_size`: 4, 8, значение по умолчанию равно `sizeof(type)`, если тип является Float. Во всех остальных случаях оно равно 4. Для детального описания алгоритма см. [High Throughput Compression of Double-Precision Floating-Point Data](https://userweb.cs.txstate.edu/~burtscher/papers/dcc07a.pdf).
#### T64 {#t64}

`T64` — Подход к сжатию, который обрезает неиспользуемые старшие биты значений в целочисленных типах данных (включая `Enum`, `Date` и `DateTime`). На каждом этапе своего алгоритма кодек берет блок из 64 значений, помещает их в матрицу 64x64 бита, транспонирует её, обрезает неиспользуемые биты значений и возвращает оставшуюся последовательность. Неиспользуемые биты — это биты, которые не различаются между максимальными и минимальными значениями в целой части данных, для которых используется сжатие.

Кодеки `DoubleDelta` и `Gorilla` используются в Gorilla TSDB в качестве компонентов его алгоритма сжатия. Подход Gorilla оказывается эффективным в сценариях, когда имеется последовательность медленно меняющихся значений с их временными метками. Временные метки эффективно сжимаются кодеком `DoubleDelta`, а значения эффективно сжимаются кодеком `Gorilla`. Например, чтобы получить эффективно хранимую таблицу, вы можете создать её в следующей конфигурации:

```sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```
### Кодеки шифрования {#encryption-codecs}

Эти кодеки фактически не сжимают данные, а вместо этого шифруют данные на диске. Они доступны только при наличии ключа шифрования, указанного в настройках [encryption](/operations/server-configuration-parameters/settings#encryption). Обратите внимание, что шифрование имеет смысл только в конце конвейера кодеков, так как зашифрованные данные обычно не могут быть сжаты каким-либо значимым образом.

Кодеки шифрования:
#### AES_128_GCM_SIV {#aes_128_gcm_siv}

`CODEC('AES-128-GCM-SIV')` — Шифрует данные с помощью AES-128 в режиме [RFC 8452](https://tools.ietf.org/html/rfc8452) GCM-SIV.
#### AES-256-GCM-SIV {#aes-256-gcm-siv}

`CODEC('AES-256-GCM-SIV')` — Шифрует данные с помощью AES-256 в режиме GCM-SIV.

Эти кодеки используют фиксированный nonce и поэтому шифрование является детерминированным. Это делает его совместимым с движками дедупликации, такими как [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md), но имеет слабость: когда один и тот же блок данных шифруется дважды, полученный шифротекст будет точно таким же, поэтому злоумышленник, имеющий доступ к диску, может видеть это равенство (хотя только само равенство, не получая его содержимого).

:::note
Большинство движков, включая семью "\*MergeTree", создают индексные файлы на диске без применения кодеков. Это означает, что открытый текст появится на диске, если зашифрованный столбец индексируется.
:::

:::note
Если вы выполняете запрос SELECT, упоминающий конкретное значение в зашифрованном столбце (например, в его клаузуле WHERE), значение может появиться в [system.query_log](../../../operations/system-tables/query_log.md). Вы можете захотеть отключить логирование.
:::

**Пример**

```sql
CREATE TABLE mytable
(
    x String CODEC(AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```

:::note
Если требуется применить сжатие, его необходимо явно указать. В противном случае к данным будет применено только шифрование.
:::

**Пример**

```sql
CREATE TABLE mytable
(
    x String Codec(Delta, LZ4, AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```
## Временные таблицы {#temporary-tables}

:::note
Пожалуйста, обратите внимание, что временные таблицы не реплицируются. В результате нет гарантии, что данные, вставленные во временную таблицу, будут доступны в других репликах. Основной случай, когда временные таблицы могут быть полезными, — это запросы или объединение небольших внешних наборов данных в течение одной сессии.
:::

ClickHouse поддерживает временные таблицы, которые имеют следующие характеристики:

- Временные таблицы исчезают при завершении сессии, в том числе если соединение потеряно.
- Временная таблица использует движок таблиц Memory, когда движок не указан, и может использовать любой движок таблиц, кроме реплицированных и `KeeperMap`.
- База данных не может быть указана для временной таблицы. Она создается вне баз данных.
- Невозможно создать временную таблицу с запросом распределенного DDL на всех серверах кластера (используя `ON CLUSTER`): эта таблица существует только в текущей сессии.
- Если временная таблица имеет то же имя, что и другая, и запрос указывает имя таблицы без указания базы данных, будет использоваться временная таблица.
- Для распределенной обработки запросов временные таблицы с движком Memory, использованным в запросе, передаются удаленным серверам.

Чтобы создать временную таблицу, используйте следующий синтаксис:

```sql
CREATE TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```

В большинстве случаев временные таблицы не создаются вручную, а используются при работе с внешними данными для запроса или для распределенного `(GLOBAL) IN`. Для получения дополнительной информации смотрите соответствующие разделы.

Вместо временных таблиц можно использовать таблицы с [ENGINE = Memory](../../../engines/table-engines/special/memory.md).
## REPLACE TABLE {#replace-table}

Оператор `REPLACE` позволяет вам обновить таблицу [атомарно](/concepts/glossary#atomicity).

:::note
Этот оператор поддерживается для движков баз данных [`Atomic`](../../../engines/database-engines/atomic.md) и [`Replicated`](../../../engines/database-engines/replicated.md), 
которые являются движками баз данных по умолчанию для ClickHouse и ClickHouse Cloud соответственно.
:::

Как правило, если вам нужно удалить некоторые данные из таблицы, 
вы можете создать новую таблицу и заполнить ее с помощью оператора `SELECT`, который не извлекает нежелательные данные, 
затем удалить старую таблицу и переименовать новую. 
Этот подход демонстрируется в следующем примере:

```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable 
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```

Вместо вышеуказанного подхода также можно использовать `REPLACE` (при условии, что вы используете движки баз данных по умолчанию), чтобы достичь того же результата:

```sql
REPLACE TABLE myOldTable
ENGINE = MergeTree()
ORDER BY CounterID 
AS
SELECT * FROM myOldTable
WHERE CounterID <12345;
```
### Синтаксис {#syntax}

```sql
{CREATE [OR REPLACE] | REPLACE} TABLE [db.]table_name
```

:::note
Все синтаксические формы для оператора `CREATE` также работают для этого оператора. Вызов `REPLACE` для несуществующей таблицы вызовет ошибку.
:::
### Примеры: {#examples}

<Tabs>
<TabItem value="clickhouse_replace_example" label="Локально" default>

Рассмотрим следующую таблицу:

```sql
CREATE DATABASE base 
ENGINE = Atomic;

CREATE OR REPLACE TABLE base.t1
(
    n UInt64,
    s String
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (1, 'test');

SELECT * FROM base.t1;

┌─n─┬─s────┐
│ 1 │ test │
└───┴──────┘
```

Мы можем использовать оператор `REPLACE` для очистки всех данных:

```sql
CREATE OR REPLACE TABLE base.t1 
(
    n UInt64,
    s Nullable(String)
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (2, null);

SELECT * FROM base.t1;

┌─n─┬─s──┐
│ 2 │ \N │
└───┴────┘
```

Или мы можем использовать оператор `REPLACE` для изменения структуры таблицы:

```sql
REPLACE TABLE base.t1 (n UInt64) 
ENGINE = MergeTree 
ORDER BY n;

INSERT INTO base.t1 VALUES (3);

SELECT * FROM base.t1;

┌─n─┐
│ 3 │
└───┘
```  
</TabItem>
<TabItem value="cloud_replace_example" label="Облако">

Рассмотрим следующую таблицу в ClickHouse Cloud: 

```sql
CREATE DATABASE base;

CREATE OR REPLACE TABLE base.t1 
(
    n UInt64,
    s String
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (1, 'test');

SELECT * FROM base.t1;

1    test
```

Мы можем использовать оператор `REPLACE` для очистки всех данных:

```sql
CREATE OR REPLACE TABLE base.t1 
(
    n UInt64, 
    s Nullable(String)
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (2, null);

SELECT * FROM base.t1;

2    
```

Или мы можем использовать оператор `REPLACE` для изменения структуры таблицы:

```sql
REPLACE TABLE base.t1 (n UInt64) 
ENGINE = MergeTree 
ORDER BY n;

INSERT INTO base.t1 VALUES (3);

SELECT * FROM base.t1;

3
```    
</TabItem>
</Tabs>
## Условие COMMENT {#comment-clause}

Вы можете добавить комментарий к таблице при ее создании.

**Синтаксис**

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
COMMENT 'Комментарий'
```

**Пример**

Запрос:

```sql
CREATE TABLE t1 (x String) ENGINE = Memory COMMENT 'Временная таблица';
SELECT name, comment FROM system.tables WHERE name = 't1';
```

Результат:

```text
┌─name─┬─comment─────────────┐
│ t1   │ Временная таблица   │
└──────┴─────────────────────┘
```
## Связанный контент {#related-content}

- Блог: [Оптимизация ClickHouse с помощью схем и кодеков](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- Блог: [Работа с данными временных рядов в ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
