---
slug: /sql-reference/statements/create/table
sidebar_position: 36
sidebar_label: ТАБЛИЦА
title: 'СОЗДАТЬ ТАБЛИЦУ'
keywords: ['compression', 'codec', 'schema', 'DDL']
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Создает новую таблицу. Этот запрос может иметь различные синтаксисные формы в зависимости от случая использования.

По умолчанию таблицы создаются только на текущем сервере. Распределенные DDL запросы реализованы в виде `ON CLUSTER`, что [описано отдельно](../../../sql-reference/distributed-ddl.md).
## Синтаксические формы {#syntax-forms}
### С явной схемой {#with-explicit-schema}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr1] [COMMENT 'комментарий к колонке'] [compression_codec] [TTL expr1],
    name2 [type2] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr2] [COMMENT 'комментарий к колонке'] [compression_codec] [TTL expr2],
    ...
) ENGINE = engine
  [COMMENT 'комментарий к таблице']
```

Создает таблицу с именем `table_name` в базе данных `db` или в текущей базе данных, если `db` не заданы, со структурой, указанной в скобках, и движком `engine`.
Структура таблицы – это список описаний колонок, вторичных индексов и ограничений . Если [первичный ключ](#primary-key) поддерживается движком, он будет указан в качестве параметра для движка таблицы.

Описание колонки — это `name type` в самом простом случае. Пример: `RegionID UInt32`.

Также могут быть определены выражения для значений по умолчанию (см. ниже).

При необходимости можно указать первичный ключ, с одним или несколькими выражениями ключа.

Комментарии могут быть добавлены для колонок и для таблицы.
### Со схемой, подобной другой таблице {#with-a-schema-similar-to-other-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine]
```

Создает таблицу с той же структурой, что и у другой таблицы. Можно указать другой движок для таблицы. Если движок не указан, будет использован тот же движок, что и для таблицы `db2.name2`.
### Со схемой и данными, клонированными из другой таблицы {#with-a-schema-and-data-cloned-from-another-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name CLONE AS [db2.]name2 [ENGINE = engine]
```

Создает таблицу с той же структурой, что и у другой таблицы. Можно указать другой движок для таблицы. Если движок не указан, будет использован тот же движок, что и для таблицы `db2.name2`. После создания новой таблицы все партиции из `db2.name2` прикрепляются к ней. Другими словами, данные из `db2.name2` клонируются в `db.table_name` при создании. Этот запрос эквивалентен следующему:

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine];
ALTER TABLE [db.]table_name ATTACH PARTITION ALL FROM [db2].name2;
```
### Из функции таблицы {#from-a-table-function}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

Создает таблицу с тем же результатом, что и указанная [функция таблицы](/sql-reference/table-functions). Созданная таблица также будет работать так же, как соответствующая функция таблицы.
### Из запроса SELECT {#from-select-query}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name[(name1 [type1], name2 [type2], ...)] ENGINE = engine AS SELECT ...
```

Создает таблицу со структурой, подобной результату запроса `SELECT`, с движком `engine` и заполняет ее данными из `SELECT`. Также можно явно указать описание колонок.

Если таблица уже существует и указано `IF NOT EXISTS`, запрос ничего не сделает.

В запросе могут быть другие конструкции после ключевого слова `ENGINE`. См. подробную документацию о том, как создавать таблицы в описаниях [движков таблиц](/engines/table-engines).

:::tip
В ClickHouse Cloud, пожалуйста, разделите это на два шага:
1. Создать структуру таблицы

  ```sql
  CREATE TABLE t1
  ENGINE = MergeTree
  ORDER BY ...
  # highlight-next-line
  EMPTY AS
  SELECT ...
  ```

2. Заполнить таблицу

  ```sql
  INSERT INTO t1
  SELECT ...
  ```

:::

**Пример**

Запрос:

``` sql
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

Модификаторы `NULL` и `NOT NULL` после типа данных в определении колонки позволяют или не позволяют делать ее [Nullable](/sql-reference/data-types/nullable).

Если тип не является `Nullable` и если указан `NULL`, он будет трактоваться как `Nullable`; если указан `NOT NULL`, то нет. Например, `INT NULL` - это то же, что и `Nullable(INT)`. Если тип является `Nullable`, а модификаторы `NULL` или `NOT NULL` указаны, будет выброшено исключение.

См. также настройку [data_type_default_nullable](../../../operations/settings/settings.md#data_type_default_nullable).
## Значения по умолчанию {#default_values}

Описание колонки может указывать выражение значения по умолчанию в форме `DEFAULT expr`, `MATERIALIZED expr` или `ALIAS expr`. Пример: `URLDomain String DEFAULT domain(URL)`.

Выражение `expr` является необязательным. Если он опущен, тип колонки должен быть явно указан, и значение по умолчанию будет `0` для числовых колонок, `''` (пустая строка) для строковых колонок, `[]` (пустой массив) для массивных колонок, `1970-01-01` для дат и `NULL` для колонок с возможностью хранения NULL.

Тип колонки для колонки со значением по умолчанию можно опустить, в этом случае он выводится из типа `expr`. Например, тип колонки `EventDate DEFAULT toDate(EventTime)` будет `date`.

Если одновременно указаны и тип данных, и выражение значения по умолчанию, будет выполнена неявная функция преобразования типов, которая преобразует выражение в указанный тип. Пример: `Hits UInt32 DEFAULT 0` внутренне представлен как `Hits UInt32 DEFAULT toUInt32(0)`.

Выражение значения по умолчанию `expr` может ссылаться на произвольные колонки таблицы и константы. ClickHouse проверяет, что изменения структуры таблицы не вводят циклы в расчет выражений. Для INSERT он проверяет, что выражения разрешимы - что все колонки, на которых они могут быть вычислены, были переданы.
### DEFAULT {#default}

`DEFAULT expr`

Обычное значение по умолчанию. Если значение такой колонки не указано в запросе INSERT, оно вычисляется из `expr`.

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

Материализованное выражение. Значения таких колонок автоматически вычисляются в соответствии с указанным материализованным выражением при вставке строк. Значения нельзя явно указывать во время вставок.

Кроме того, колонки значений по умолчанию этого типа не включаются в результат `SELECT *`. Это сделано для сохранения свойства того, что результат `SELECT *` всегда может быть снова вставлен в таблицу с помощью `INSERT`. Это поведение можно отключить с помощью настройки `asterisk_include_materialized_columns`.

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

Эфемерная колонка. Колонки этого типа не хранятся в таблице и нельзя извлекать значения из них. Единственная цель эфемерных колонок - строить выражения значений по умолчанию для других колонок.

Вставка без явного указания колонок пропустит колонки этого типа. Это сделано для сохранения свойства того, что результат `SELECT *` всегда может быть снова вставлен в таблицу с помощью `INSERT`.

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

Вычисляемые колонки (синоним). Колонка этого типа не хранится в таблице, и нельзя вставлять значения в нее.

При явной ссылке на такие колонки в запросах SELECT значение вычисляется во время выполнения запроса из `expr`. По умолчанию `SELECT *` исключает колонки ALIAS. Это поведение можно отключить с помощью настройки `asterisk_include_alias_columns`.

При использовании запроса ALTER для добавления новых колонок старые данные для этих колонок не записываются. Вместо этого при чтении старых данных, для которых отсутствуют значения для новых колонок, выражения по умолчанию вычисляются на лету. Однако если выполнение выражений требует других колонок, которые не указаны в запросе, эти колонки будут дополнительно прочитаны, но только для блоков данных, которым это необходимо.

Если вы добавляете новую колонку в таблицу, но позже изменяете ее выражение по умолчанию, значения, использованные для старых данных, изменятся (для данных, где значения не были сохранены на диске). Обратите внимание, что при выполнении фоновых слияний данные для колонок, отсутствующих в одной из сливаемых частей, записываются в объединенную часть.

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

- Внутри списка колонок

``` sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...,
    PRIMARY KEY(expr1[, expr2,...])
)
ENGINE = engine;
```

- Снаружи списка колонок

``` sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
PRIMARY KEY(expr1[, expr2,...]);
```

:::tip
Вы не можете сочетать оба способа в одном запросе.
:::
## Ограничения {#constraints}

Вместе с описаниями колонок можно определить ограничения:
### CONSTRAINT {#constraint}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [compression_codec] [TTL expr1],
    ...
    CONSTRAINT constraint_name_1 CHECK boolean_expr_1,
    ...
) ENGINE = engine
```

`boolean_expr_1` может быть любым логическим выражением. Если для таблицы определены ограничения, каждое из них будет проверено для каждой строки в запросе INSERT. Если какое-либо ограничение не выполнено — сервер выдаст исключение с именем ограничения и проверяющим выражением.

Добавление большого количества ограничений может негативно сказаться на производительности больших запросов INSERT.
### ASSUME {#assume}

Клаусула `ASSUME` используется для определения `CONSTRAINT` на таблице, который предполагается истинным. Это ограничение можно затем использовать оптимизатором для повышения производительности SQL-запросов.

Возьмем этот пример, где `ASSUME CONSTRAINT` используется при создании таблицы `users_a`:

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

Здесь `ASSUME CONSTRAINT` используется для утверждения, что функция `length(name)` всегда равна значению колонки `name_len`. Это означает, что всякий раз, когда `length(name)` вызывается в запросе, ClickHouse может заменить его на `name_len`, что должно быть быстрее, так как устраняет вызов функции `length()`.

Затем, при выполнении запроса `SELECT name FROM users_a WHERE length(name) < 5;`, ClickHouse может оптимизировать его до `SELECT name FROM users_a WHERE name_len < 5`; из-за `ASSUME CONSTRAINT`. Это может ускорить выполнение запроса, потому что избегает вычисления длины `name` для каждой строки.

`ASSUME CONSTRAINT` **не накладывает ограничение**, он лишь информирует оптимизатор о том, что ограничение выполняется. Если ограничение на самом деле неверно, результаты запросов могут быть некорректными. Поэтому вы должны использовать `ASSUME CONSTRAINT` только если уверены, что ограничение действительно.
## Выражение TTL {#ttl-expression}

Определяет время хранения значений. Может быть указано только для таблиц семейства MergeTree. Для подробного описания см. [TTL для колонок и таблиц](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl).
## Кодеки сжатия колонок {#column_compression_codec}

По умолчанию ClickHouse применяет сжатие `lz4` в версии self-managed и `zstd` в ClickHouse Cloud. 

Для семейства движков `MergeTree` вы можете изменить метод сжатия по умолчанию в разделе [compression](/operations/server-configuration-parameters/settings#compression) конфигурации сервера.

Вы также можете определить метод сжатия для каждой отдельной колонки в запросе `CREATE TABLE`.

``` sql
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

Кодек `Default` может быть указан для обращения к сжатию по умолчанию, которое может зависеть от различных настроек (и свойств данных) во время выполнения.
Пример: `value UInt64 CODEC(Default)` — то же самое, что отсутствие спецификации кодека.

Также вы можете удалить текущий CODEC из колонки и использовать сжатие по умолчанию из config.xml:

``` sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```

Кодеки могут быть комбинированы в цепочку, например, `CODEC(Delta, Default)`.

:::tip
Вы не можете разжать файлы базы данных ClickHouse с помощью сторонних утилит, таких как `lz4`. Вместо этого используйте специальную утилиту [clickhouse-compressor](https://github.com/ClickHouse/ClickHouse/tree/master/programs/compressor).
:::

Сжатие поддерживается для следующих движков таблиц:

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) семейства. Поддерживает кодеки сжатия колонок и выбор метода сжатия по умолчанию через настройки [compression](/operations/server-configuration-parameters/settings#compression).
- [Log](../../../engines/table-engines/log-family/index.md) семейства. По умолчанию использует метод сжатия `lz4` и поддерживает кодеки сжатия колонок.
- [Set](../../../engines/table-engines/special/set.md). Поддерживает только сжатие по умолчанию.
- [Join](../../../engines/table-engines/special/join.md). Поддерживает только сжатие по умолчанию.

ClickHouse поддерживает универсальные кодеки и специализированные кодеки.
### Универсальные кодеки {#general-purpose-codecs}
#### NONE {#none}

`NONE` — Без сжатия.
#### LZ4 {#lz4}

`LZ4` — Безопасный [алгоритм сжатия данных](https://github.com/lz4/lz4), используемый по умолчанию. Применяет быстрый алгоритм сжатия LZ4.
#### LZ4HC {#lz4hc}

`LZ4HC[(level)]` — алгоритм LZ4 HC (высокое сжатие) с настраиваемым уровнем. Уровень по умолчанию: 9. Установка `level <= 0` применяет уровень по умолчанию. Возможные уровни: \[1, 12\]. Рекомендуемый диапазон уровней: \[4, 9\].
#### ZSTD {#zstd}

`ZSTD[(level)]` — [алгоритм сжатия ZSTD](https://en.wikipedia.org/wiki/Zstandard) с настройкой `level`. Возможные уровни: \[1, 22\]. Уровень по умолчанию: 1.

Высокие уровни сжатия полезны для асимметричных сценариев, таких как одно сжатие, многократное распаковка. Более высокие уровни означают лучшее сжатие и большее использование CPU.
#### ZSTD_QAT {#zstd_qat}

<CloudNotSupportedBadge/>

`ZSTD_QAT[(level)]` — [алгоритм сжатия ZSTD](https://en.wikipedia.org/wiki/Zstandard) с настраиваемым уровнем, реализованный с помощью [Intel® QATlib](https://github.com/intel/qatlib) и [Intel® QAT ZSTD Plugin](https://github.com/intel/QAT-ZSTD-Plugin). Возможные уровни: \[1, 12\]. Уровень по умолчанию: 1. Рекомендуемый диапазон уровней: \[6, 12\]. Применяются некоторые ограничения:

- ZSTD_QAT по умолчанию отключен и может быть использован только после включения настройки конфигурации [enable_zstd_qat_codec](../../../operations/settings/settings.md#enable_zstd_qat_codec).
- Для сжатия ZSTD_QAT пытается использовать устройство разгрузки Intel® QAT ([QuickAssist Technology](https://www.intel.com/content/www/us/en/developer/topic-technology/open/quick-assist-technology/overview.html)). Если такое устройство не найдено, оно вернется к сжатию ZSTD в программном обеспечении.
- Распаковка всегда выполняется в программном обеспечении.
#### DEFLATE_QPL {#deflate_qpl}

<CloudNotSupportedBadge/>

`DEFLATE_QPL` — [алгоритм сжатия Deflate](https://github.com/intel/qpl), реализованный библиотекой Intel® Query Processing Library. Применяются некоторые ограничения:

- DEFLATE_QPL по умолчанию отключен и может быть использован только после включения настройки конфигурации [enable_deflate_qpl_codec](../../../operations/settings/settings.md#enable_deflate_qpl_codec).
- DEFLATE_QPL требует, чтобы ClickHouse был собран с использованием инструкций SSE 4.2 (по умолчанию это так). Обратитесь к [Сборке Clickhouse с DEFLATE_QPL](/development/building_and_benchmarking_deflate_qpl) для получения дополнительной информации.
- DEFLATE_QPL работает лучше, если система имеет устройство разгрузки Intel® IAA (In-Memory Analytics Accelerator). Обратитесь к [Конфигурации ускорителя](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration) и [Бенчмарку с DEFLATE_QPL](/development/building_and_benchmarking_deflate_qpl) для получения дополнительной информации.
- Данные, сжатые с помощью DEFLATE_QPL, могут быть переданы только между узлами ClickHouse, собранными с включенным SSE 4.2.
### Специализированные кодеки {#specialized-codecs}

Эти кодеки предназначены для повышения эффективности сжатия за счет использования специфических особенностей данных. Некоторые из этих кодеков не сжимают данные самостоятельно, они просто подготавливают данные так, чтобы второй этап сжатия с помощью универсального кодека мог достичь более высокой степени сжатия.
#### Delta {#delta}

`Delta(delta_bytes)` — Метод сжатия, при котором сырые значения заменяются на разницу между двумя соседними значениями, за исключением первого значения, которое остается неизменным. До `delta_bytes` используются для хранения значений дельты, поэтому `delta_bytes` — максимальный размер сырых значений. Возможные значения `delta_bytes`: 1, 2, 4, 8. Значение по умолчанию для `delta_bytes` равно `sizeof(type)`, если оно равно 1, 2, 4 или 8. Во всех других случаях это 1. Delta является кодеком подготовки данных, т.е. его нельзя использовать отдельно.
#### DoubleDelta {#doubledelta}

`DoubleDelta(bytes_size)` — Вычисляет дельту дельт и записывает ее в компактной двоичной форме. Возможные значения `bytes_size`: 1, 2, 4, 8, значение по умолчанию равно `sizeof(type)`, если оно равно 1, 2, 4 или 8. Во всех других случаях это 1. Оптимальные уровни сжатия достигаются для монотонных последовательностей с постоянным шагом, таких как временные ряды. Может использоваться с любым типом фиксированной ширины. Реализует алгоритм, используемый в Gorilla TSDB, расширяя его для поддержки типов 64-бит. Использует 1 дополнительный бит для 32-битных дельт: 5-битные префиксы вместо 4-битных префиксов. Для получения дополнительной информации см. "Сжатие временных меток" в [Gorilla: Быстрая, масштабируемая in-memory база данных временных рядов](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf). DoubleDelta является кодеком подготовки данных, т.е. его нельзя использовать отдельно.
#### GCD {#gcd}

`GCD()` - Вычисляет наибольший общий делитель (НОД) значений в колонке, затем делит каждое значение на НОД. Может использоваться с целыми, десятичными и временными столбцами. Кодек хорошо подходит для колонок со значениями, которые меняются (увеличиваются или уменьшаются) кратно НОД, например, 24, 28, 16, 24, 8, 24 (НОД = 4). GCD является кодеком подготовки данных, т.е. его нельзя использовать отдельно.
#### Gorilla {#gorilla}

`Gorilla(bytes_size)` — Вычисляет XOR между текущим и предыдущим значением с плавающей запятой и записывает его в компактной двоичной форме. Чем меньше разница между последовательными значениями, т.е. чем медленнее меняются значения ряда, тем лучше коэффициент сжатия. Реализует алгоритм, используемый в Gorilla TSDB, расширяя его для поддержки 64-битных типов. Возможные значения `bytes_size`: 1, 2, 4, 8, значение по умолчанию равно `sizeof(type)`, если оно равно 1, 2, 4 или 8. Во всех других случаях это 1. Для получения дополнительной информации см. раздел 4.1 в [Gorilla: Быстрая, масштабируемая in-memory база данных временных рядов](https://doi.org/10.14778/2824032.2824078).
#### FPC {#fpc}

`FPC(level, float_size)` - Многократно прогнозирует следующее значение с плавающей запятой в последовательности с использованием лучшего из двух предсказателей, затем выполняет XOR между реальным и предсказанным значением и сжимает результат с помощью сжатия ведущими нулями. Похоже на Gorilla, это эффективно при хранении серии значений с плавающей запятой, которые медленно меняются. Для значений 64-битных (double) FPC быстрее, чем Gorilla, для значений 32-бит эффективность может варьироваться. Возможные значения `level`: 1-28, значение по умолчанию — 12. Возможные значения `float_size`: 4, 8, значение по умолчанию равно `sizeof(type)`, если тип Float. Во всех остальных случаях это 4. Для детального описания алгоритма см. [Сжатие с высокой пропускной способностью данных с плавающей запятой двойной точности](https://userweb.cs.txstate.edu/~burtscher/papers/dcc07a.pdf).
#### T64 {#t64}

`T64` — Метод сжатия, который обрезает неиспользуемые старшие биты значений в целых числовых типах данных (включая `Enum`, `Date` и `DateTime`). На каждом шаге своего алгоритма кодек берет блок из 64 значений, помещает их в 64x64 битную матрицу, транспонирует, обрезает неиспользуемые биты значений и возвращает оставшиеся в виде последовательности. Неиспользуемые биты — это биты, которые не различаются между максимальным и минимальным значениям в целом части данных, для которой используется сжатие.

Кодеки `DoubleDelta` и `Gorilla` используются в Gorilla TSDB как компоненты его алгоритма сжатия. Подход Gorilla эффективен в сценариях, когда имеется последовательность медленно меняющихся значений с их временными метками. Временные метки эффективно сжимаются кодеком `DoubleDelta`, а значения эффективно сжимаются кодеком `Gorilla`. Например, чтобы получить эффективно сохраненную таблицу, вы можете создать ее в следующей конфигурации:

``` sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```
### Кодеки шифрования {#encryption-codecs}

Эти кодеки на самом деле не сжимают данные, а вместо этого шифруют данные на диске. Эти кодеки доступны только когда ключ шифрования указан в настройках [encryption](/operations/server-configuration-parameters/settings#encryption). Обратите внимание, что шифрование имеет смысл только в конце цепочек кодеков, потому что зашифрованные данные обычно не могут быть сжаты каким-либо значимым образом.

Кодеки шифрования:
#### AES_128_GCM_SIV {#aes_128_gcm_siv}

`CODEC('AES-128-GCM-SIV')` — Шифрует данные с помощью AES-128 в режиме [RFC 8452](https://tools.ietf.org/html/rfc8452) GCM-SIV.
#### AES-256-GCM-SIV {#aes-256-gcm-siv}

`CODEC('AES-256-GCM-SIV')` — Шифрует данные с помощью AES-256 в режиме GCM-SIV.

Эти кодеки используют фиксированный nonce, и шифрование, следовательно, детерминировано. Это делает его совместимым с движками дедупликации, такими как [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) но имеет слабость: когда один и тот же блок данных зашифровывается дважды, полученный шифртекст будет точно таким же, так что злоумышленник, который может читать диск, может увидеть это совпадение (хотя только совпадение, не зная его содержимого).

:::note
Большинство движков, включая семейство "\*MergeTree", создают файлы индексов на диске без применения кодеков. Это означает, что открытый текст будет появляться на диске, если зашифрованная колонка индексируется.
:::

:::note
Если вы выполняете запрос SELECT, указывая конкретное значение в зашифрованной колонке (например, в его условии WHERE), значение может появиться в [system.query_log](../../../operations/system-tables/query_log.md). Вы можете захотеть отключить логирование.
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
Если необходимо применить сжатие, это должно быть явно указано. В противном случае только шифрование будет применено к данным.
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
Обратите внимание, что временные таблицы не реплицируются. Таким образом, нет гарантии, что данные, вставленные во временную таблицу, будут доступны в других репликах. Основной случай, когда временные таблицы могут быть полезны, — это запрос или соединение небольших внешних наборов данных в течение одной сессии.
:::

ClickHouse поддерживает временные таблицы, которые имеют следующие характеристики:

- Временные таблицы исчезают, когда сессия заканчивается, включая, если соединение потеряно.
- Временная таблица использует движок таблицы Memory, когда движок не указан, и может использовать любой движок таблицы, кроме Replicated и `KeeperMap`.
- БД не может быть указана для временной таблицы. Она создается вне баз данных.
- Невозможно создать временную таблицу с использованием распределенного DDL запроса на всех серверах кластера (с помощью `ON CLUSTER`): эта таблица существует только в текущей сессии.
- Если временная таблица имеет то же имя, что и другая, и запрос указывает имя таблицы без указания БД, будет использоваться временная таблица.
- Для распределенной обработки запросов временные таблицы с движком Memory, используемые в запросе, передаются удаленным серверам.

Чтобы создать временную таблицу, используйте следующий синтаксис:

``` sql
CREATE TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```

В большинстве случаев временные таблицы не создаются вручную, а создаются при использовании внешних данных для запроса или для распределенного `(GLOBAL) IN`. Для получения дополнительной информации см. соответствующие разделы.

Существуют таблицы с [ENGINE = Memory](../../../engines/table-engines/special/memory.md), которые могут использоваться вместо временных таблиц.
## ЗАМЕНИТЬ ТАБЛИЦУ {#replace-table}

Команда `REPLACE` позволяет обновить таблицу [атомарно](/concepts/glossary#atomicity).

:::note
Эта команда поддерживается для движков баз данных [`Atomic`](../../../engines/database-engines/atomic.md) и [`Replicated`](../../../engines/database-engines/replicated.md), 
которые являются движками баз данных по умолчанию для ClickHouse и ClickHouse Cloud соответственно.
:::

Обычно, если вам нужно удалить некоторые данные из таблицы, 
вы можете создать новую таблицу и заполнить ее оператором `SELECT`, который не выбирает ненужные данные, 
затем удалить старую таблицу и переименовать новую. 
Этот подход иллюстрируется в приведенном ниже примере:

```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable 
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```

Вместо вышеуказанного подхода, также можно использовать `REPLACE` (при условии, что вы используете стандартные движки баз данных), чтобы достичь того же результата:

```sql
REPLACE TABLE myOldTable
ENGINE = MergeTree()
ORDER BY CounterID 
AS
SELECT * FROM myOldTable
WHERE CounterID <12345;
```
### Синтаксис {#syntax}

``` sql
{CREATE [OR REPLACE] | REPLACE} TABLE [db.]table_name
```

:::note
Все синтаксические формы для оператора `CREATE` также работают для этой команды. Вызов `REPLACE` для несуществующей таблицы вызовет ошибку.
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

Мы можем использовать оператор `REPLACE`, чтобы очистить все данные:

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

Или мы можем использовать оператор `REPLACE`, чтобы изменить структуру таблицы:

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

1	test
```

Мы можем использовать оператор `REPLACE`, чтобы очистить все данные:

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

Или мы можем использовать оператор `REPLACE`, чтобы изменить структуру таблицы:

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
## Клаузула COMMENT {#comment-clause}

Вы можете добавить комментарий к таблице при ее создании.

**Синтаксис**

``` sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
COMMENT 'Комментарий'
```

**Пример**

Запрос:

``` sql
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
- Блог: [Работа с временными рядами в ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
