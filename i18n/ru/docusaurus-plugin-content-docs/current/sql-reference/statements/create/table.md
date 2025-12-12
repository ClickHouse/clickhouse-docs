---
description: 'Документация по таблице'
keywords: ['compression', 'codec', 'schema', 'DDL']
sidebar_label: 'TABLE'
sidebar_position: 36
slug: /sql-reference/statements/create/table
title: 'CREATE TABLE'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Создает новую таблицу. Синтаксис этого запроса может различаться в зависимости от сценария использования.

По умолчанию таблицы создаются только на текущем сервере. Распределенные DDL-запросы реализованы с помощью предложения `ON CLUSTER`, которое [описано отдельно](../../../sql-reference/distributed-ddl.md).

## Синтаксические формы {#syntax-forms}

### С явной схемой {#with-explicit-schema}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr1] [COMMENT 'комментарий к столбцу'] [compression_codec] [TTL expr1],
    name2 [type2] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr2] [COMMENT 'комментарий к столбцу'] [compression_codec] [TTL expr2],
    ...
) ENGINE = engine
  [COMMENT 'комментарий к таблице']
```

Создаёт таблицу с именем `table_name` в базе данных `db` или в текущей базе данных, если `db` не задана, со структурой, указанной в скобках, и движком `engine`.
Структура таблицы — это список описаний столбцов, вторичных индексов и ограничений. Если движок поддерживает [primary key](#primary-key), он указывается как параметр движка таблицы.

В простейшем случае описание столбца — это `name type`. Пример: `RegionID UInt32`.

Для значений по умолчанию также можно задать выражения (см. ниже).

При необходимости может быть указан первичный ключ с одним или несколькими выражениями ключа.

Комментарии могут быть добавлены как для столбцов, так и для таблицы.

### Со схемой, аналогичной другой таблице {#with-a-schema-similar-to-other-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine]
```

Создает таблицу с такой же структурой, как у другой таблицы. Вы можете указать для таблицы другой движок. Если движок не указан, используется тот же движок, что и для таблицы `db2.name2`.

### Со схемой и данными, клонированными из другой таблицы {#with-a-schema-and-data-cloned-from-another-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name CLONE AS [db2.]name2 [ENGINE = engine]
```

Создаёт таблицу с той же структурой, что и другая таблица. Можно указать для неё другой движок. Если движок не указан, будет использован тот же, что и у таблицы `db2.name2`. После создания новой таблицы к ней присоединяются все партиции из `db2.name2`. Другими словами, данные из `db2.name2` клонируются в `db.table_name` при создании. Этот запрос эквивалентен следующему:

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine];
ALTER TABLE [db.]table_name ATTACH PARTITION ALL FROM [db2].name2;
```

### Из табличной функции {#from-a-table-function}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

Создаёт таблицу с тем же результатом, что и указанная [табличная функция](/sql-reference/table-functions). Созданная таблица также будет работать так же, как соответствующая табличная функция.

### Из запроса SELECT {#from-select-query}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name[(name1 [type1], name2 [type2], ...)] ENGINE = engine AS SELECT ...
```

Создаёт таблицу со структурой, соответствующей результату запроса `SELECT`, с движком `engine` и заполняет её данными из `SELECT`. Также вы можете явно задать описание столбцов.

Если таблица уже существует и указано `IF NOT EXISTS`, запрос ничего не выполнит.

После секции `ENGINE` в запросе могут следовать и другие секции. Подробную документацию по созданию таблиц см. в описаниях [движков таблиц](/engines/table-engines).

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

## Модификаторы NULL и NOT NULL {#null-or-not-null-modifiers}

Модификаторы `NULL` и `NOT NULL` после типа данных в определении столбца соответственно разрешают или запрещают делать его [Nullable](/sql-reference/data-types/nullable).

Если тип не является `Nullable` и указано `NULL`, он будет интерпретироваться как `Nullable`; если указано `NOT NULL`, то нет. Например, `INT NULL` — то же самое, что `Nullable(INT)`. Если тип уже является `Nullable` и заданы модификаторы `NULL` или `NOT NULL`, будет сгенерировано исключение.

См. также настройку [data_type_default_nullable](../../../operations/settings/settings.md#data_type_default_nullable).

## Значения по умолчанию {#default_values}

Описание столбца может задавать выражение значения по умолчанию в виде `DEFAULT expr`, `MATERIALIZED expr` или `ALIAS expr`. Пример: `URLDomain String DEFAULT domain(URL)`.

Выражение `expr` является необязательным. Если оно опущено, тип столбца должен быть явно указан, а значение по умолчанию будет `0` для числовых столбцов, `''` (пустая строка) для строковых столбцов, `[]` (пустой массив) для столбцов‑массивов, `1970-01-01` для столбцов с типом дата или `NULL` для столбцов типа `Nullable`.

Тип столбца со значением по умолчанию можно не указывать, в этом случае он определяется из типа `expr`. Например, тип столбца `EventDate DEFAULT toDate(EventTime)` будет `Date`.

Если указаны и тип данных, и выражение значения по умолчанию, вставляется неявная функция приведения типа, которая преобразует выражение к указанному типу. Пример: `Hits UInt32 DEFAULT 0` внутренне представляется как `Hits UInt32 DEFAULT toUInt32(0)`.

Выражение значения по умолчанию `expr` может ссылаться на произвольные столбцы таблицы и константы. ClickHouse проверяет, что изменения структуры таблицы не приводят к появлению циклов в вычислении выражения. При выполнении INSERT проверяется, что выражения можно вычислить — что все столбцы, на основе которых они считаются, были переданы.

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

INSERT INTO test (id) VALUES (1);

SELECT * FROM test;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:06:46 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘
```

### MATERIALIZED {#materialized}

`MATERIALIZED expr`

Материализованное выражение. Значения таких столбцов автоматически вычисляются в соответствии с заданным материализованным выражением при вставке строк. Значения не могут быть явно заданы при выполнении `INSERT`.

Кроме того, столбцы этого типа со значением по умолчанию не включаются в результат `SELECT *`. Это нужно для сохранения инварианта, согласно которому результат `SELECT *` всегда можно вставить обратно в таблицу с помощью `INSERT`. Это поведение можно отключить с помощью настройки `asterisk_include_materialized_columns`.

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

INSERT INTO test VALUES (1);

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

Эфемерный столбец. Столбцы этого типа не хранятся в таблице, и по ним нельзя выполнять SELECT. Единственное назначение эфемерных столбцов — использовать их при построении выражений значений по умолчанию для других столбцов.

При вставке без явного указания столбцов столбцы этого типа будут пропущены. Это сделано для сохранения инварианта, согласно которому результат `SELECT *` всегда может быть вставлен обратно в таблицу с помощью `INSERT`.

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

INSERT INTO test (id, unhexed) VALUES (1, '5a90b714');

SELECT
    id,
    hexed,
    hex(hexed)
FROM test
FORMAT Vertical;
```

Строка 1:
──────
id:         1
hexed:      Z��
hex(hexed): 5A90B714

````

### ALIAS {#alias}

`ALIAS expr`

Вычисляемые столбцы (синоним). Столбцы этого типа не хранятся в таблице, и в них невозможно вставлять значения с помощью INSERT.

Когда запросы SELECT явно обращаются к столбцам этого типа, значение вычисляется во время выполнения запроса из `expr`. По умолчанию `SELECT *` исключает столбцы ALIAS. Это поведение можно отключить с помощью настройки `asterisk_include_alias_columns`.

При использовании запроса ALTER для добавления новых столбцов старые данные для этих столбцов не записываются. Вместо этого при чтении старых данных, не содержащих значений для новых столбцов, выражения по умолчанию вычисляются на лету. Однако если для выполнения выражений требуются другие столбцы, не указанные в запросе, эти столбцы будут дополнительно прочитаны, но только для тех блоков данных, которым это необходимо.

Если вы добавите новый столбец в таблицу, а затем измените его выражение по умолчанию, значения для старых данных изменятся (для данных, значения которых не были сохранены на диске). Обратите внимание, что при выполнении фоновых слияний данные для столбцов, отсутствующих в одной из сливаемых частей, записываются в объединённую часть.

Невозможно установить значения по умолчанию для элементов вложенных структур данных.

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
````

## Первичный ключ {#primary-key}

Вы можете задать [первичный ключ](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries) при создании таблицы. Первичный ключ можно указать двумя способами:

* Внутри списка столбцов

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...,
    PRIMARY KEY(expr1[, expr2,...])
)
ENGINE = engine;
```

* Вне списка столбцов

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
PRIMARY KEY(expr1[, expr2,...]);
```

:::tip
Нельзя совмещать оба подхода в одном запросе.
:::

## Ограничения {#constraints}

Наряду с описаниями столбцов можно задать ограничения:

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

`boolean_expr_1` может представлять собой любое логическое выражение. Если для таблицы определены ограничения, каждое из них будет проверяться для каждой строки в запросе `INSERT`. Если какое-либо ограничение не выполняется, сервер сгенерирует исключение с именем ограничения и выражением проверки.

Добавление большого количества ограничений может негативно повлиять на производительность больших запросов `INSERT`.

### ASSUME {#assume}

Предложение `ASSUME` используется для определения `CONSTRAINT` в таблице, который считается истинным. Это ограничение затем может быть использовано оптимизатором для повышения производительности SQL-запросов.

Рассмотрим пример, где `ASSUME CONSTRAINT` используется при создании таблицы `users_a`:

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

Здесь `ASSUME CONSTRAINT` используется как утверждение, что результат функции `length(name)` всегда равен значению столбца `name_len`. Это означает, что всякий раз, когда `length(name)` вызывается в запросе, ClickHouse может заменить её на `name_len`, что должно быть быстрее, поскольку позволяет избежать вызова функции `length()`.

Затем при выполнении запроса `SELECT name FROM users_a WHERE length(name) < 5;` ClickHouse может оптимизировать его до `SELECT name FROM users_a WHERE name_len < 5`; благодаря `ASSUME CONSTRAINT`. Это может ускорить выполнение запроса, потому что не требуется вычислять длину `name` для каждой строки.

`ASSUME CONSTRAINT` **не обеспечивает выполнение ограничения**, он лишь информирует оптимизатор, что ограничение соблюдается. Если ограничение на самом деле не выполняется, результаты запросов могут быть некорректными. Поэтому следует использовать `ASSUME CONSTRAINT` только в том случае, если вы уверены, что ограничение действительно выполняется.

## Выражение TTL {#ttl-expression}

Определяет срок хранения значений. Может быть задано только для таблиц семейства MergeTree. Для подробного описания см. раздел [TTL для столбцов и таблиц](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl).

## Кодеки сжатия столбцов {#column_compression_codec}

По умолчанию ClickHouse использует сжатие `lz4` в самостоятельной (self-managed) установке и `zstd` в ClickHouse Cloud.

Для семейства движков `MergeTree` вы можете изменить метод сжатия по умолчанию в разделе [compression](/operations/server-configuration-parameters/settings#compression) конфигурации сервера.

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

Кодек `Default` можно указать для использования сжатия по умолчанию, которое во время выполнения может зависеть от различных настроек (и свойств данных).
Пример: `value UInt64 CODEC(Default)` — то же самое, что и отсутствие указания кодека.

Также вы можете удалить текущий CODEC из столбца и использовать сжатие по умолчанию из config.xml:

```sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```

Кодеки можно комбинировать в конвейер, например, `CODEC(Delta, Default)`.

:::tip
Нельзя декомпрессировать файлы базы данных ClickHouse с помощью внешних утилит, таких как `lz4`. Вместо этого используйте специальную утилиту [clickhouse-compressor](https://github.com/ClickHouse/ClickHouse/tree/master/programs/compressor).
:::

Сжатие поддерживается для следующих движков таблиц:

* Семейство [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md). Поддерживает кодеки сжатия столбцов и выбор метода сжатия по умолчанию с помощью настроек [compression](/operations/server-configuration-parameters/settings#compression).
* Семейство [Log](../../../engines/table-engines/log-family/index.md). По умолчанию использует метод сжатия `lz4` и поддерживает кодеки сжатия столбцов.
* [Set](../../../engines/table-engines/special/set.md). Поддерживается только сжатие по умолчанию.
* [Join](../../../engines/table-engines/special/join.md). Поддерживается только сжатие по умолчанию.

ClickHouse поддерживает кодеки как общего, так и специализированного назначения.

### Кодеки общего назначения {#general-purpose-codecs}

#### NONE {#none}

`NONE` — без сжатия.

#### LZ4 {#lz4}

`LZ4` — используемый по умолчанию алгоритм [сжатия данных](https://github.com/lz4/lz4) без потерь. Применяет быстрое сжатие LZ4.

#### LZ4HC {#lz4hc}

`LZ4HC[(level)]` — алгоритм LZ4 HC (high compression, высокое сжатие) с настраиваемым уровнем. Уровень по умолчанию: 9. Значение `level <= 0` приводит к использованию уровня по умолчанию. Возможные уровни: [1, 12]. Рекомендуемый диапазон уровней: [4, 9].

#### ZSTD {#zstd}

`ZSTD[(level)]` — [алгоритм сжатия ZSTD](https://en.wikipedia.org/wiki/Zstandard) с настраиваемым `level`. Возможные уровни: [1, 22]. Уровень по умолчанию: 1.

Высокие уровни сжатия полезны для асимметричных сценариев, например, когда данные один раз сжимаются и многократно распаковываются. Более высокие уровни обеспечивают лучшее сжатие и более высокую нагрузку на CPU.

#### ZSTD&#95;QAT {#zstd_qat}

<CloudNotSupportedBadge />

`ZSTD_QAT[(level)]` — [алгоритм сжатия ZSTD](https://en.wikipedia.org/wiki/Zstandard) с настраиваемым уровнем, реализованный с помощью [Intel® QATlib](https://github.com/intel/qatlib) и [Intel® QAT ZSTD Plugin](https://github.com/intel/QAT-ZSTD-Plugin). Возможные уровни: [1, 12]. Уровень по умолчанию: 1. Рекомендуемый диапазон уровней: [6, 12]. Применяются некоторые ограничения:

* ZSTD&#95;QAT по умолчанию отключён и может использоваться только после включения настройки конфигурации [enable&#95;zstd&#95;qat&#95;codec](../../../operations/settings/settings.md#enable_zstd_qat_codec).
* Для сжатия ZSTD&#95;QAT пытается использовать аппаратное устройство Intel® QAT для разгрузки ([QuickAssist Technology](https://www.intel.com/content/www/us/en/developer/topic-technology/open/quick-assist-technology/overview.html)). Если такое устройство не найдено, выполняется переход к программному сжатию ZSTD.
* Распаковка всегда выполняется программно.

#### DEFLATE&#95;QPL {#deflate_qpl}

<CloudNotSupportedBadge />

`DEFLATE_QPL` — [алгоритм сжатия Deflate](https://github.com/intel/qpl), реализованный с помощью Intel® Query Processing Library. Применяются некоторые ограничения:

- DEFLATE_QPL отключен по умолчанию и может использоваться только после включения параметра конфигурации [enable_deflate_qpl_codec](../../../operations/settings/settings.md#enable_deflate_qpl_codec).
- DEFLATE_QPL требует сборку ClickHouse, скомпилированную с использованием инструкций SSE 4.2 (по умолчанию это так). Подробнее см. в разделе [Сборка ClickHouse с DEFLATE_QPL](/development/building_and_benchmarking_deflate_qpl).
- DEFLATE_QPL работает наилучшим образом, если в системе есть устройство разгрузки Intel® IAA (In-Memory Analytics Accelerator). Подробнее см. [Accelerator Configuration](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration) и [Benchmark with DEFLATE_QPL](/development/building_and_benchmarking_deflate_qpl).
- Данные, сжатые с помощью DEFLATE_QPL, могут передаваться только между узлами ClickHouse, скомпилированными с включённой SSE 4.2.

### Специализированные кодеки {#specialized-codecs}

Эти кодеки предназначены для повышения эффективности сжатия за счёт использования специфических особенностей данных. Некоторые из этих кодеков не сжимают данные сами по себе, а предварительно обрабатывают их таким образом, чтобы второй этап сжатия с использованием универсального кодека мог достичь более высокой степени сжатия.

#### Delta {#delta}

`Delta(delta_bytes)` — подход к сжатию, при котором исходные значения заменяются разностью двух соседних значений, за исключением первого значения, которое остаётся неизменным. `delta_bytes` — максимальный размер исходных значений, значение по умолчанию — `sizeof(type)`. Указание `delta_bytes` в качестве аргумента устарело, и поддержка будет удалена в одной из будущих версий. Delta является кодеком подготовки данных, то есть не может использоваться самостоятельно.

#### DoubleDelta {#doubledelta}

`DoubleDelta(bytes_size)` — вычисляет разности разностей и записывает их в компактном двоичном формате. `bytes_size` имеет схожий смысл с `delta_bytes` в кодеке [Delta](#delta). Указание `bytes_size` в качестве аргумента устарело, и поддержка будет удалена в одной из будущих версий. Оптимальные коэффициенты сжатия достигаются для монотонных последовательностей с постоянным шагом, например для данных временных рядов. Может использоваться с любым числовым типом. Реализует алгоритм, используемый в Gorilla TSDB, расширяя его для поддержки 64-битных типов. Использует 1 дополнительный бит для 32-битных дельт: 5-битные префиксы вместо 4-битных. Дополнительные сведения см. в разделе Compressing Time Stamps в статье [Gorilla: A Fast, Scalable, In-Memory Time Series Database](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf). DoubleDelta является кодеком подготовки данных, то есть не может использоваться самостоятельно.

#### GCD {#gcd}

`GCD()` — вычисляет наибольший общий делитель (GCD) значений в столбце, затем делит каждое значение на этот GCD. Может использоваться с целочисленными, десятичными и столбцами типов дата/время. Кодек хорошо подходит для столбцов со значениями, которые изменяются (увеличиваются или уменьшаются) кратно GCD, например 24, 28, 16, 24, 8, 24 (GCD = 4). GCD является кодеком подготовки данных, то есть не может использоваться самостоятельно.

#### Gorilla {#gorilla}

`Gorilla(bytes_size)` — вычисляет XOR между текущим и предыдущим значением с плавающей точкой и записывает его в компактном двоичном формате. Чем меньше разница между последовательными значениями, то есть чем медленнее изменяется ряд значений, тем лучше коэффициент сжатия. Реализует алгоритм, используемый в Gorilla TSDB, расширяя его для поддержки 64-битных типов. Возможные значения `bytes_size`: 1, 2, 4, 8, значение по умолчанию — `sizeof(type)`, если оно равно 1, 2, 4 или 8. Во всех остальных случаях — 1. Дополнительные сведения см. в разделе 4.1 статьи [Gorilla: A Fast, Scalable, In-Memory Time Series Database](https://doi.org/10.14778/2824032.2824078).

#### FPC {#fpc}

`FPC(level, float_size)` — последовательно предсказывает следующее значение с плавающей запятой в последовательности, выбирая лучший из двух предикторов, затем выполняет XOR фактического значения с предсказанным и сжимает результат, обрезая ведущие нули. Аналогично алгоритму Gorilla, это эффективно при хранении последовательности значений с плавающей запятой, которые изменяются медленно. Для 64-битных значений (`double`) FPC работает быстрее, чем Gorilla, для 32-битных значений производительность может отличаться. Возможные значения `level`: 1–28, значение по умолчанию — 12. Возможные значения `float_size`: 4, 8, значение по умолчанию — `sizeof(type)`, если тип — `Float`. Во всех остальных случаях — 4. Подробное описание алгоритма см. в статье [High Throughput Compression of Double-Precision Floating-Point Data](https://userweb.cs.txstate.edu/~burtscher/papers/dcc07a.pdf).

#### T64 {#t64}

`T64` — метод сжатия, который обрезает неиспользуемые старшие биты значений целочисленных типов данных (включая `Enum`, `Date` и `DateTime`). На каждом шаге алгоритма кодек берёт блок из 64 значений, помещает их в матрицу 64×64 бит, транспонирует её, обрезает неиспользуемые биты значений и возвращает остальное в виде последовательности. Неиспользуемые биты — это биты, которые не отличаются между максимальным и минимальным значениями во всей части данных, для которой используется сжатие.

Кодеки `DoubleDelta` и `Gorilla` используются в Gorilla TSDB как компоненты её алгоритма сжатия. Подход Gorilla эффективен в сценариях, когда есть последовательность медленно изменяющихся значений с их временными метками. Временные метки эффективно сжимаются кодеком `DoubleDelta`, а значения — кодеком `Gorilla`. Например, чтобы таблица эффективно хранилась, вы можете создать её в следующей конфигурации:

```sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```

### Кодеки шифрования {#encryption-codecs}

Эти кодеки на самом деле не сжимают данные, а вместо этого шифруют данные на диске. Они доступны только в том случае, если ключ шифрования задан в настройках [encryption](/operations/server-configuration-parameters/settings#encryption). Обратите внимание, что шифрование имеет смысл только в конце цепочек кодеков, потому что зашифрованные данные обычно нельзя сжать сколь‑нибудь эффективным образом.

Кодеки шифрования:

#### AES&#95;128&#95;GCM&#95;SIV {#aes_128_gcm_siv}

`CODEC('AES-128-GCM-SIV')` — Шифрует данные с помощью AES-128 в режиме GCM-SIV согласно [RFC 8452](https://tools.ietf.org/html/rfc8452).

#### AES-256-GCM-SIV {#aes-256-gcm-siv}

`CODEC('AES-256-GCM-SIV')` — Шифрует данные с помощью AES-256 в режиме GCM-SIV.

Эти кодеки используют фиксированный nonce, и, следовательно, шифрование является детерминированным. Это делает их совместимыми с движками с дедупликацией, такими как [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md), но имеет слабое место: когда один и тот же блок данных шифруется дважды, результирующий зашифрованный текст будет в точности одинаковым, поэтому противник, который может читать диск, увидит это соответствие (хотя только соответствие, не получая его содержимое).

:::note
Большинство движков, включая семейство &quot;*MergeTree&quot;, создают файлы индексов на диске без применения кодеков. Это означает, что незашифрованные данные будут присутствовать на диске, если зашифрованный столбец индексируется.
:::

:::note
Если вы выполняете запрос SELECT, в котором упоминается конкретное значение в зашифрованном столбце (например, в предложении WHERE), это значение может появиться в [system.query&#95;log](../../../operations/system-tables/query_log.md). Возможно, вы захотите отключить такое логирование.
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
Если требуется сжатие, его необходимо явно указать. В противном случае к данным будет применено только шифрование.
:::

**Пример**

```sql
CREATE TABLE mytable
(
    x String CODEC(Delta, LZ4, AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```

## Временные таблицы {#temporary-tables}

:::note
Обратите внимание, что временные таблицы не реплицируются. В результате нет гарантии, что данные, вставленные во временную таблицу, будут доступны на других репликах. Основной сценарий использования временных таблиц — выполнение запросов или `JOIN` с небольшими внешними наборами данных в рамках одной сессии.
:::

ClickHouse поддерживает временные таблицы, которые обладают следующими характеристиками:

* Временные таблицы исчезают при завершении сессии, в том числе в случае потери соединения.
* Временная таблица использует движок таблицы Memory, если движок не указан, и может использовать любой движок таблиц, кроме движков Replicated и `KeeperMap`.
* Для временной таблицы нельзя указать БД. Она создаётся вне баз данных.
* Невозможно создать временную таблицу с распределённым DDL-запросом на всех серверах кластера (с использованием `ON CLUSTER`): такая таблица существует только в текущей сессии.
* Если временная таблица имеет то же имя, что и другая таблица, и в запросе указано только имя таблицы без указания БД, будет использоваться временная таблица.
* Для распределённой обработки запросов временные таблицы с движком Memory, используемые в запросе, передаются на удалённые серверы.

Для создания временной таблицы используйте следующий синтаксис:

```sql
CREATE [OR REPLACE] TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```

В большинстве случаев временные таблицы не создаются вручную, а автоматически создаются при использовании внешних данных в запросе или для распределённого оператора `(GLOBAL) IN`. Для получения дополнительной информации см. соответствующие разделы.

Вместо временных таблиц можно использовать таблицы с движком [ENGINE = Memory](../../../engines/table-engines/special/memory.md).

## REPLACE TABLE {#replace-table}

Оператор `REPLACE` позволяет [атомарно](/concepts/glossary#atomicity) обновлять таблицу.

:::note
Этот оператор поддерживается для движков баз данных [`Atomic`](../../../engines/database-engines/atomic.md) и [`Replicated`](../../../engines/database-engines/replicated.md),
используемых по умолчанию в ClickHouse и ClickHouse Cloud соответственно.
:::

Обычно, если вам нужно удалить часть данных из таблицы,
вы можете создать новую таблицу и заполнить её запросом `SELECT`, который не извлекает ненужные данные,
затем удалить старую таблицу и переименовать новую.
Этот подход демонстрируется в примере ниже:

```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable 
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```

Вместо описанного выше подхода вы также можете использовать `REPLACE` (при использовании движков баз данных по умолчанию), чтобы получить тот же результат:

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
Все варианты синтаксиса оператора `CREATE` также применимы к данному оператору. Вызов `REPLACE` для несуществующей таблицы приведёт к ошибке.
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

    1    test
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

## Предложение COMMENT {#comment-clause}

При создании таблицы вы можете добавить к ней комментарий.

**Синтаксис**

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
COMMENT 'Comment'
```

**Пример**

Запрос:

```sql
CREATE TABLE t1 (x String) ENGINE = Memory COMMENT 'Временная таблица';
SELECT name, comment FROM system.tables WHERE name = 't1';
```

Результат:

```text
┌─name─┬─comment──────────────┐
│ t1   │ Временная таблица    │
└──────┴──────────────────────┘
```

## Похожие материалы {#related-content}

- Блог: [Оптимизация ClickHouse с помощью схем и кодеков](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- Блог: [Работа с данными временных рядов в ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
