---
description: 'Документация по оператору CREATE TABLE'
keywords: ['compression', 'codec', 'schema', 'DDL']
sidebar_label: 'ТАБЛИЦА'
sidebar_position: 36
slug: /sql-reference/statements/create/table
title: 'CREATE TABLE'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Создает новую таблицу. В зависимости от сценария использования этот запрос может иметь различный синтаксис.

По умолчанию таблицы создаются только на текущем сервере. Распределенные DDL-запросы реализованы с помощью конструкции `ON CLUSTER`, которая [описана отдельно](../../../sql-reference/distributed-ddl.md).


## Формы синтаксиса {#syntax-forms}

### С явной схемой {#with-explicit-schema}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr1] [COMMENT 'comment for column'] [compression_codec] [TTL expr1],
    name2 [type2] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr2] [COMMENT 'comment for column'] [compression_codec] [TTL expr2],
    ...
) ENGINE = engine
  [COMMENT 'comment for table']
```

Создаёт таблицу с именем `table_name` в базе данных `db` или в текущей базе данных, если `db` не указана, со структурой, заданной в скобках, и движком `engine`.
Структура таблицы представляет собой список описаний столбцов, вторичных индексов и ограничений. Если движок поддерживает [первичный ключ](#primary-key), он будет указан в качестве параметра движка таблицы.

Описание столбца в простейшем случае имеет вид `name type`. Пример: `RegionID UInt32`.

Также можно определить выражения для значений по умолчанию (см. ниже).

При необходимости можно указать первичный ключ с одним или несколькими ключевыми выражениями.

Можно добавить комментарии как для столбцов, так и для таблицы.

### Со схемой, аналогичной другой таблице {#with-a-schema-similar-to-other-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine]
```

Создаёт таблицу с той же структурой, что и другая таблица. Можно указать другой движок для таблицы. Если движок не указан, будет использован тот же движок, что и для таблицы `db2.name2`.

### Со схемой и данными, клонированными из другой таблицы {#with-a-schema-and-data-cloned-from-another-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name CLONE AS [db2.]name2 [ENGINE = engine]
```

Создаёт таблицу с той же структурой, что и другая таблица. Можно указать другой движок для таблицы. Если движок не указан, будет использован тот же движок, что и для таблицы `db2.name2`. После создания новой таблицы к ней присоединяются все партиции из `db2.name2`. Другими словами, данные из `db2.name2` клонируются в `db.table_name` при создании. Этот запрос эквивалентен следующему:

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine];
ALTER TABLE [db.]table_name ATTACH PARTITION ALL FROM [db2].name2;
```

### Из табличной функции {#from-a-table-function}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

Создаёт таблицу с тем же результатом, что и указанная [табличная функция](/sql-reference/table-functions). Созданная таблица будет работать так же, как соответствующая табличная функция.

### Из запроса SELECT {#from-select-query}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name[(name1 [type1], name2 [type2], ...)] ENGINE = engine AS SELECT ...
```

Создаёт таблицу со структурой, соответствующей результату запроса `SELECT`, с движком `engine`, и заполняет её данными из `SELECT`. Также можно явно указать описание столбцов.

Если таблица уже существует и указано `IF NOT EXISTS`, запрос ничего не выполнит.

После секции `ENGINE` в запросе могут быть другие секции. Подробную документацию о создании таблиц см. в описаниях [движков таблиц](/engines/table-engines).

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

Модификаторы `NULL` и `NOT NULL`, указанные после типа данных в определении столбца, разрешают или запрещают использование типа [Nullable](/sql-reference/data-types/nullable).

Если тип не является `Nullable` и указан модификатор `NULL`, он будет интерпретирован как `Nullable`; если указан `NOT NULL` — то нет. Например, `INT NULL` эквивалентен `Nullable(INT)`. Если тип уже является `Nullable` и при этом указаны модификаторы `NULL` или `NOT NULL`, будет выброшено исключение.

См. также настройку [data_type_default_nullable](../../../operations/settings/settings.md#data_type_default_nullable).


## Значения по умолчанию {#default_values}

В описании столбца можно указать выражение значения по умолчанию в форме `DEFAULT expr`, `MATERIALIZED expr` или `ALIAS expr`. Пример: `URLDomain String DEFAULT domain(URL)`.

Выражение `expr` является необязательным. Если оно опущено, тип столбца должен быть указан явно, и значением по умолчанию будет `0` для числовых столбцов, `''` (пустая строка) для строковых столбцов, `[]` (пустой массив) для столбцов-массивов, `1970-01-01` для столбцов с датами или `NULL` для nullable-столбцов.

Тип столбца со значением по умолчанию может быть опущен, в этом случае он выводится из типа `expr`. Например, тип столбца `EventDate DEFAULT toDate(EventTime)` будет date.

Если указаны и тип данных, и выражение значения по умолчанию, автоматически вставляется неявная функция приведения типа, которая преобразует выражение к указанному типу. Пример: `Hits UInt32 DEFAULT 0` внутренне представляется как `Hits UInt32 DEFAULT toUInt32(0)`.

Выражение значения по умолчанию `expr` может ссылаться на любые столбцы таблицы и константы. ClickHouse проверяет, что изменения структуры таблицы не приводят к циклам в вычислении выражения. Для INSERT проверяется разрешимость выражений — что все столбцы, из которых они могут быть вычислены, были переданы.

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

Материализованное выражение. Значения таких столбцов автоматически вычисляются в соответствии с указанным материализованным выражением при вставке строк. Значения не могут быть явно указаны при выполнении `INSERT`.

Кроме того, столбцы со значениями по умолчанию этого типа не включаются в результат `SELECT *`. Это сделано для сохранения инварианта, согласно которому результат `SELECT *` всегда может быть вставлен обратно в таблицу с помощью `INSERT`. Это поведение можно отключить с помощью настройки `asterisk_include_materialized_columns`.

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

Эфемерный столбец. Столбцы этого типа не хранятся в таблице, и из них невозможно выполнить SELECT. Единственная цель эфемерных столбцов — построение выражений значений по умолчанию других столбцов на их основе.

Вставка без явно указанных столбцов пропустит столбцы этого типа. Это сделано для сохранения инварианта, согласно которому результат `SELECT *` всегда может быть вставлен обратно в таблицу с помощью `INSERT`.

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

Если вы добавляете новый столбец в таблицу, но позже изменяете его выражение по умолчанию, значения для старых данных изменятся (для данных, значения которых не были сохранены на диске). Обратите внимание, что при выполнении фоновых слияний данные для столбцов, отсутствующих в одной из объединяемых частей, записываются в объединённую часть.

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

При создании таблицы можно определить [первичный ключ](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries). Первичный ключ можно указать двумя способами:

- Внутри списка столбцов

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...,
    PRIMARY KEY(expr1[, expr2,...])
)
ENGINE = engine;
```

- Вне списка столбцов

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
PRIMARY KEY(expr1[, expr2,...]);
```

:::tip
Нельзя использовать оба способа одновременно в одном запросе.
:::


## Ограничения {#constraints}

Наряду с описаниями столбцов можно определить ограничения:

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

`boolean_expr_1` может быть любым логическим выражением. Если для таблицы определены ограничения, каждое из них будет проверяться для каждой строки в запросе `INSERT`. Если какое-либо ограничение не выполнено, сервер выдаст исключение с именем ограничения и проверяемым выражением.

Добавление большого количества ограничений может негативно повлиять на производительность больших запросов `INSERT`.

### ASSUME {#assume}

Предложение `ASSUME` используется для определения ограничения `CONSTRAINT` для таблицы, которое предполагается истинным. Это ограничение может затем использоваться оптимизатором для повышения производительности SQL-запросов.

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

Здесь `ASSUME CONSTRAINT` используется для указания того, что функция `length(name)` всегда равна значению столбца `name_len`. Это означает, что всякий раз, когда в запросе вызывается `length(name)`, ClickHouse может заменить его на `name_len`, что должно работать быстрее, поскольку это позволяет избежать вызова функции `length()`.

Затем при выполнении запроса `SELECT name FROM users_a WHERE length(name) < 5;` ClickHouse может оптимизировать его до `SELECT name FROM users_a WHERE name_len < 5;` благодаря `ASSUME CONSTRAINT`. Это может ускорить выполнение запроса, поскольку избавляет от необходимости вычислять длину `name` для каждой строки.

`ASSUME CONSTRAINT` **не обеспечивает выполнение ограничения**, он лишь информирует оптимизатор о том, что ограничение выполняется. Если ограничение фактически не выполняется, результаты запросов могут быть неверными. Поэтому следует использовать `ASSUME CONSTRAINT` только в том случае, если вы уверены, что ограничение выполняется.


## Выражение TTL {#ttl-expression}

Определяет время хранения значений. Может быть указано только для таблиц семейства MergeTree. Подробное описание см. в разделе [TTL для столбцов и таблиц](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl).


## Кодеки сжатия столбцов {#column_compression_codec}

По умолчанию ClickHouse применяет сжатие `lz4` в самостоятельно развёртываемой версии и `zstd` в ClickHouse Cloud.

Для семейства движков `MergeTree` можно изменить метод сжатия по умолчанию в разделе [compression](/operations/server-configuration-parameters/settings#compression) конфигурации сервера.

Также можно задать метод сжатия для каждого отдельного столбца в запросе `CREATE TABLE`.

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

Кодек `Default` можно указать для использования сжатия по умолчанию, которое может зависеть от различных настроек (и свойств данных) во время выполнения.
Пример: `value UInt64 CODEC(Default)` — то же самое, что и отсутствие указания кодека.

Также можно удалить текущий CODEC из столбца и использовать сжатие по умолчанию из config.xml:

```sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```

Кодеки можно объединять в конвейер, например, `CODEC(Delta, Default)`.

:::tip
Невозможно распаковать файлы базы данных ClickHouse с помощью внешних утилит, таких как `lz4`. Вместо этого используйте специальную утилиту [clickhouse-compressor](https://github.com/ClickHouse/ClickHouse/tree/master/programs/compressor).
:::

Сжатие поддерживается для следующих движков таблиц:

- Семейство [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md). Поддерживает кодеки сжатия столбцов и выбор метода сжатия по умолчанию через настройки [compression](/operations/server-configuration-parameters/settings#compression).
- Семейство [Log](../../../engines/table-engines/log-family/index.md). Использует метод сжатия `lz4` по умолчанию и поддерживает кодеки сжатия столбцов.
- [Set](../../../engines/table-engines/special/set.md). Поддерживается только сжатие по умолчанию.
- [Join](../../../engines/table-engines/special/join.md). Поддерживается только сжатие по умолчанию.

ClickHouse поддерживает кодеки общего назначения и специализированные кодеки.

### Кодеки общего назначения {#general-purpose-codecs}

#### NONE {#none}

`NONE` — без сжатия.

#### LZ4 {#lz4}

`LZ4` — [алгоритм сжатия данных](https://github.com/lz4/lz4) без потерь, используемый по умолчанию. Применяет быстрое сжатие LZ4.

#### LZ4HC {#lz4hc}

`LZ4HC[(level)]` — алгоритм LZ4 HC (высокое сжатие) с настраиваемым уровнем. Уровень по умолчанию: 9. Установка `level <= 0` применяет уровень по умолчанию. Возможные уровни: \[1, 12\]. Рекомендуемый диапазон уровней: \[4, 9\].

#### ZSTD {#zstd}

`ZSTD[(level)]` — [алгоритм сжатия ZSTD](https://en.wikipedia.org/wiki/Zstandard) с настраиваемым параметром `level`. Возможные уровни: \[1, 22\]. Уровень по умолчанию: 1.

Высокие уровни сжатия полезны для асимметричных сценариев, таких как однократное сжатие и многократная распаковка. Более высокие уровни обеспечивают лучшее сжатие, но требуют больше ресурсов процессора.

#### ZSTD_QAT {#zstd_qat}

<CloudNotSupportedBadge />

`ZSTD_QAT[(level)]` — [алгоритм сжатия ZSTD](https://en.wikipedia.org/wiki/Zstandard) с настраиваемым уровнем, реализованный с помощью [Intel® QATlib](https://github.com/intel/qatlib) и [Intel® QAT ZSTD Plugin](https://github.com/intel/QAT-ZSTD-Plugin). Возможные уровни: \[1, 12\]. Уровень по умолчанию: 1. Рекомендуемый диапазон уровней: \[6, 12\]. Применяются следующие ограничения:

- ZSTD_QAT отключён по умолчанию и может использоваться только после включения настройки конфигурации [enable_zstd_qat_codec](../../../operations/settings/settings.md#enable_zstd_qat_codec).
- Для сжатия ZSTD_QAT пытается использовать устройство аппаратного ускорения Intel® QAT ([QuickAssist Technology](https://www.intel.com/content/www/us/en/developer/topic-technology/open/quick-assist-technology/overview.html)). Если такое устройство не найдено, происходит переключение на программное сжатие ZSTD.
- Распаковка всегда выполняется программно.

#### DEFLATE_QPL {#deflate_qpl}

<CloudNotSupportedBadge />

`DEFLATE_QPL` — [алгоритм сжатия Deflate](https://github.com/intel/qpl), реализованный с помощью Intel® Query Processing Library. Применяются следующие ограничения:


- DEFLATE_QPL по умолчанию отключен и может использоваться только после включения параметра конфигурации [enable_deflate_qpl_codec](../../../operations/settings/settings.md#enable_deflate_qpl_codec).
- DEFLATE_QPL требует сборки ClickHouse, скомпилированной с инструкциями SSE 4.2 (по умолчанию это выполняется). Подробнее см. в разделе [Сборка ClickHouse с DEFLATE_QPL](/development/building_and_benchmarking_deflate_qpl).
- DEFLATE_QPL работает наиболее эффективно при наличии в системе устройства разгрузки Intel® IAA (In-Memory Analytics Accelerator). Подробнее см. в разделах [Accelerator Configuration](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration) и [Benchmark with DEFLATE_QPL](/development/building_and_benchmarking_deflate_qpl).
- Данные, сжатые с помощью DEFLATE_QPL, могут передаваться только между узлами ClickHouse, скомпилированными с включенной поддержкой SSE 4.2.

### Специализированные кодеки {#specialized-codecs}

Эти кодеки предназначены для повышения эффективности сжатия за счет использования специфических особенностей данных. Некоторые из этих кодеков не сжимают данные самостоятельно, а предварительно обрабатывают их таким образом, чтобы на втором этапе сжатия с использованием универсального кодека можно было достичь более высокой степени сжатия.

#### Delta {#delta}

`Delta(delta_bytes)` — Подход к сжатию, при котором исходные значения заменяются разностью двух соседних значений, за исключением первого значения, которое остается неизменным. `delta_bytes` — максимальный размер исходных значений, значение по умолчанию — `sizeof(type)`. Указание `delta_bytes` в качестве аргумента устарело, и поддержка будет удалена в будущем выпуске. Delta — это кодек предварительной обработки данных, т. е. он не может использоваться самостоятельно.

#### DoubleDelta {#doubledelta}

`DoubleDelta(bytes_size)` — Вычисляет разность разностей и записывает её в компактной двоичной форме. Параметр `bytes_size` имеет аналогичное значение, что и `delta_bytes` в кодеке [Delta](#delta). Указание `bytes_size` в качестве аргумента устарело, и поддержка будет удалена в будущем выпуске. Оптимальная степень сжатия достигается для монотонных последовательностей с постоянным шагом, таких как данные временных рядов. Может использоваться с любым числовым типом. Реализует алгоритм, используемый в Gorilla TSDB, расширяя его для поддержки 64-битных типов. Использует 1 дополнительный бит для 32-битных дельт: 5-битные префиксы вместо 4-битных. Для получения дополнительной информации см. раздел Compressing Time Stamps в [Gorilla: A Fast, Scalable, In-Memory Time Series Database](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf). DoubleDelta — это кодек предварительной обработки данных, т. е. он не может использоваться самостоятельно.

#### GCD {#gcd}

`GCD()` — Вычисляет наибольший общий делитель (НОД) значений в столбце, затем делит каждое значение на НОД. Может использоваться со столбцами целочисленного, десятичного типа и типа дата/время. Кодек хорошо подходит для столбцов со значениями, которые изменяются (увеличиваются или уменьшаются) кратно НОД, например: 24, 28, 16, 24, 8, 24 (НОД = 4). GCD — это кодек предварительной обработки данных, т. е. он не может использоваться самостоятельно.

#### Gorilla {#gorilla}

`Gorilla(bytes_size)` — Вычисляет XOR между текущим и предыдущим значением с плавающей точкой и записывает результат в компактной двоичной форме. Чем меньше разница между последовательными значениями, т. е. чем медленнее изменяются значения ряда, тем выше степень сжатия. Реализует алгоритм, используемый в Gorilla TSDB, расширяя его для поддержки 64-битных типов. Возможные значения `bytes_size`: 1, 2, 4, 8; значение по умолчанию — `sizeof(type)`, если оно равно 1, 2, 4 или 8. Во всех остальных случаях — 1. Для получения дополнительной информации см. раздел 4.1 в [Gorilla: A Fast, Scalable, In-Memory Time Series Database](https://doi.org/10.14778/2824032.2824078).

#### FPC {#fpc}


`FPC(level, float_size)` — Многократно предсказывает следующее значение с плавающей точкой в последовательности, используя лучший из двух предикторов, затем выполняет операцию XOR между фактическим и предсказанным значением и сжимает результат методом сжатия ведущих нулей. Подобно Gorilla, этот метод эффективен при хранении последовательностей значений с плавающей точкой, которые изменяются медленно. Для 64-битных значений (double) FPC работает быстрее, чем Gorilla; для 32-битных значений результаты могут различаться. Возможные значения `level`: 1-28, значение по умолчанию — 12. Возможные значения `float_size`: 4, 8, значение по умолчанию — `sizeof(type)`, если тип является Float. Во всех остальных случаях — 4. Подробное описание алгоритма см. в статье [High Throughput Compression of Double-Precision Floating-Point Data](https://userweb.cs.txstate.edu/~burtscher/papers/dcc07a.pdf).

#### T64 {#t64}

`T64` — Метод сжатия, который обрезает неиспользуемые старшие биты значений в целочисленных типах данных (включая `Enum`, `Date` и `DateTime`). На каждом шаге алгоритма кодек берет блок из 64 значений, помещает их в матрицу размером 64x64 бита, транспонирует её, обрезает неиспользуемые биты значений и возвращает остаток в виде последовательности. Неиспользуемые биты — это биты, которые не различаются между максимальным и минимальным значениями во всей части данных, для которой применяется сжатие.

Кодеки `DoubleDelta` и `Gorilla` используются в Gorilla TSDB в качестве компонентов алгоритма сжатия. Подход Gorilla эффективен в сценариях, когда имеется последовательность медленно изменяющихся значений с их временными метками. Временные метки эффективно сжимаются кодеком `DoubleDelta`, а значения эффективно сжимаются кодеком `Gorilla`. Например, чтобы создать эффективно хранимую таблицу, можно использовать следующую конфигурацию:

```sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```

### Кодеки шифрования {#encryption-codecs}

Эти кодеки фактически не сжимают данные, а шифруют данные на диске. Они доступны только при указании ключа шифрования в настройках [encryption](/operations/server-configuration-parameters/settings#encryption). Обратите внимание, что шифрование имеет смысл только в конце конвейера кодеков, поскольку зашифрованные данные обычно невозможно эффективно сжать.

Кодеки шифрования:

#### AES_128_GCM_SIV {#aes_128_gcm_siv}

`CODEC('AES-128-GCM-SIV')` — Шифрует данные с помощью AES-128 в режиме GCM-SIV согласно [RFC 8452](https://tools.ietf.org/html/rfc8452).

#### AES-256-GCM-SIV {#aes-256-gcm-siv}

`CODEC('AES-256-GCM-SIV')` — Шифрует данные с помощью AES-256 в режиме GCM-SIV.

Эти кодеки используют фиксированный nonce, поэтому шифрование является детерминированным. Это делает их совместимыми с движками дедупликации, такими как [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md), но имеет недостаток: при двукратном шифровании одного и того же блока данных результирующий шифротекст будет абсолютно идентичным, поэтому злоумышленник, имеющий доступ к диску, может увидеть это совпадение (хотя только совпадение, без получения содержимого).

:::note
Большинство движков, включая семейство "\*MergeTree", создают индексные файлы на диске без применения кодеков. Это означает, что открытый текст будет присутствовать на диске, если зашифрованный столбец индексируется.
:::

:::note
Если вы выполняете запрос SELECT с указанием конкретного значения в зашифрованном столбце (например, в условии WHERE), это значение может появиться в [system.query_log](../../../operations/system-tables/query_log.md). Возможно, вы захотите отключить логирование.
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
Если необходимо применить сжатие, его нужно указать явно. В противном случае к данным будет применено только шифрование.
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
Обратите внимание, что временные таблицы не реплицируются. Поэтому нет гарантии, что данные, вставленные во временную таблицу, будут доступны на других репликах. Основной сценарий использования временных таблиц — это запросы или объединения небольших внешних наборов данных в рамках одной сессии.
:::

ClickHouse поддерживает временные таблицы со следующими характеристиками:

- Временные таблицы удаляются при завершении сессии, в том числе при потере соединения.
- Временная таблица использует движок таблиц Memory, если движок не указан явно, и может использовать любой движок таблиц, кроме Replicated и `KeeperMap`.
- Для временной таблицы нельзя указать базу данных. Она создается вне баз данных.
- Невозможно создать временную таблицу с помощью распределенного DDL-запроса на всех серверах кластера (с использованием `ON CLUSTER`): такая таблица существует только в текущей сессии.
- Если временная таблица имеет то же имя, что и другая таблица, и в запросе указано имя таблицы без указания базы данных, будет использована временная таблица.
- При обработке распределенных запросов временные таблицы с движком Memory, используемые в запросе, передаются на удаленные серверы.

Для создания временной таблицы используйте следующий синтаксис:

```sql
CREATE [OR REPLACE] TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```

В большинстве случаев временные таблицы не создаются вручную, а используются при работе с внешними данными для запроса или для распределенного `(GLOBAL) IN`. Для получения дополнительной информации см. соответствующие разделы.

Вместо временных таблиц можно использовать таблицы с [ENGINE = Memory](../../../engines/table-engines/special/memory.md).


## REPLACE TABLE {#replace-table}

Оператор `REPLACE` позволяет обновлять таблицу [атомарно](/concepts/glossary#atomicity).

:::note
Этот оператор поддерживается движками баз данных [`Atomic`](../../../engines/database-engines/atomic.md) и [`Replicated`](../../../engines/database-engines/replicated.md),
которые являются движками баз данных по умолчанию для ClickHouse и ClickHouse Cloud соответственно.
:::

Обычно, если необходимо удалить некоторые данные из таблицы,
можно создать новую таблицу и заполнить её с помощью оператора `SELECT`, который не извлекает нежелательные данные,
затем удалить старую таблицу и переименовать новую.
Этот подход продемонстрирован в примере ниже:

```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```

Вместо описанного выше подхода также можно использовать `REPLACE` (при условии использования движков баз данных по умолчанию) для достижения того же результата:

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
Все синтаксические формы оператора `CREATE` также работают для этого оператора. Вызов `REPLACE` для несуществующей таблицы приведёт к ошибке.
:::

### Примеры {#examples}

<Tabs>
<TabItem value="clickhouse_replace_example" label="Локальный" default>

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

Можно использовать оператор `REPLACE` для очистки всех данных:

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

Или можно использовать оператор `REPLACE` для изменения структуры таблицы:

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

Можно использовать оператор `REPLACE` для очистки всех данных:

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

Или можно использовать оператор `REPLACE` для изменения структуры таблицы:

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


## Секция COMMENT {#comment-clause}

При создании таблицы к ней можно добавить комментарий.

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
CREATE TABLE t1 (x String) ENGINE = Memory COMMENT 'The temporary table';
SELECT name, comment FROM system.tables WHERE name = 't1';
```

Результат:

```text
┌─name─┬─comment─────────────┐
│ t1   │ The temporary table │
└──────┴─────────────────────┘
```


## Связанный контент {#related-content}

- Блог: [Оптимизация ClickHouse с помощью схем и кодеков](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- Блог: [Работа с данными временных рядов в ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
