---
description: 'Документация для оператора INSERT INTO'
sidebar_label: 'INSERT INTO'
sidebar_position: 33
slug: /sql-reference/statements/insert-into
title: 'Оператор INSERT INTO'
---


# Оператор INSERT INTO

Вставляет данные в таблицу.

**Синтаксис**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] [SETTINGS ...] VALUES (v11, v12, v13), (v21, v22, v23), ...
```

Вы можете указать список колонок для вставки, используя `(c1, c2, c3)`. Также вы можете использовать выражение с колонным [matcher](../../sql-reference/statements/select/index.md#asterisk) таким как `*` и/или [модификаторы](../../sql-reference/statements/select/index.md#select-modifiers) такие как [APPLY](/sql-reference/statements/select#apply), [EXCEPT](/sql-reference/statements/select#except), [REPLACE](/sql-reference/statements/select#replace).

Например, рассмотрим таблицу:

```sql
SHOW CREATE insert_select_testtable;
```

```text
CREATE TABLE insert_select_testtable
(
    `a` Int8,
    `b` String,
    `c` Int8
)
ENGINE = MergeTree()
ORDER BY a
```

```sql
INSERT INTO insert_select_testtable (*) VALUES (1, 'a', 1) ;
```

Если вы хотите вставить данные во все колонки, кроме колонки `b`, вы можете сделать это с помощью ключевого слова `EXCEPT`. Ссылаясь на синтаксис выше, вам нужно будет убедиться, что вы вставляете столько же значений (`VALUES (v11, v13)`), сколько вы указываете колонок (`(c1, c3)`):

```sql
INSERT INTO insert_select_testtable (* EXCEPT(b)) VALUES (2, 2);
```

```sql
SELECT * FROM insert_select_testtable;
```

```text
┌─a─┬─b─┬─c─┐
│ 2 │   │ 2 │
└───┴───┴───┘
┌─a─┬─b─┬─c─┐
│ 1 │ a │ 1 │
└───┴───┴───┘
```

В этом примере мы видим, что вторая вставленная строка имеет заполненные колонки `a` и `c` переданными значениями, и `b` заполнена значением по умолчанию. Также возможно использовать ключевое слово `DEFAULT` для вставки значений по умолчанию:

```sql
INSERT INTO insert_select_testtable VALUES (1, DEFAULT, 1) ;
```

Если список колонок не включает все существующие колонки, оставшиеся колонки заполняются:

- Значениями, вычисленными из выражений `DEFAULT`, указанных в определении таблицы.
- Нулями и пустыми строками, если выражения `DEFAULT` не определены.

Данные можно передавать в INSERT в любом [формате](/sql-reference/formats), поддерживаемом ClickHouse. Формат должен быть явно указан в запросе:

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT format_name data_set
```

Например, следующий запрос имеет тот же формат, что и базовая версия `INSERT ... VALUES`:

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT Values (v11, v12, v13), (v21, v22, v23), ...
```

ClickHouse удаляет все пробелы и один перевод строки (если он есть) перед данными. При формировании запроса мы рекомендуем помещать данные на новую строку после операторов запроса, что важно, если данные начинаются с пробелов.

Пример:

```sql
INSERT INTO t FORMAT TabSeparated
11  Hello, world!
22  Qwerty
```

Вы можете вставить данные отдельно от запроса, используя [командный клиент](/operations/utilities/clickhouse-local) или [HTTP интерфейс](/interfaces/http/).

:::note
Если вы хотите указать `SETTINGS` для запроса `INSERT`, то вам нужно сделать это _перед_ клаузой `FORMAT`, так как всё после `FORMAT format_name` рассматривается как данные. Например:

```sql
INSERT INTO table SETTINGS ... FORMAT format_name data_set
```
:::

## Ограничения {#constraints}

Если у таблицы есть [ограничения](../../sql-reference/statements/create/table.md#constraints), их выражения будут проверяться для каждой строки вставляемых данных. Если любое из этих ограничений не выполнено — сервер выдаст исключение, содержащее имя и выражение ограничения, и запрос будет остановлен.

## Вставка результатов SELECT {#inserting-the-results-of-select}

**Синтаксис**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] SELECT ...
```

Колонки сопоставляются в соответствии с их позициями в клаузе `SELECT`. Однако их имена в выражении `SELECT` и таблице для `INSERT` могут отличаться. При необходимости выполняется приведение типов.

Ни один из форматов данных, кроме формата Values, не позволяет устанавливать значения для выражений, таких как `now()`, `1 + 2` и т. д. Формат Values разрешает ограниченное использование выражений, но это не рекомендуется, поскольку в этом случае используется неэффективный код для их выполнения.

Другие запросы для модификации частей данных не поддерживаются: `UPDATE`, `DELETE`, `REPLACE`, `MERGE`, `UPSERT`, `INSERT UPDATE`.
Однако вы можете удалить старые данные, используя `ALTER TABLE ... DROP PARTITION`.

Клауза `FORMAT` должна быть указана в конце запроса, если клаузу `SELECT` содержит табличная функция [input()](../../sql-reference/table-functions/input.md).

Чтобы вставить значение по умолчанию вместо `NULL` в колонку с типом данных, не допускающим NULL, включите настройку [insert_null_as_default](../../operations/settings/settings.md#insert_null_as_default).

`INSERT` также поддерживает CTE (общие табличные выражения). Например, следующие два оператора эквивалентны:

```sql
INSERT INTO x WITH y AS (SELECT * FROM numbers(10)) SELECT * FROM y;
WITH y AS (SELECT * FROM numbers(10)) INSERT INTO x SELECT * FROM y;
```


## Вставка данных из файла {#inserting-data-from-a-file}

**Синтаксис**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] FROM INFILE file_name [COMPRESSION type] [SETTINGS ...] [FORMAT format_name]
```

Используйте приведенный выше синтаксис для вставки данных из файла или файлов, хранящихся на стороне **клиента**. `file_name` и `type` являются строковыми литералами. Формат входного файла [формат](../../interfaces/formats.md) должен быть установлен в клаузе `FORMAT`.

Поддерживаются сжатые файлы. Тип сжатия определяется по расширению имени файла. Либо он может быть явно указан в клаузе `COMPRESSION`. Поддерживаемые типы: `'none'`, `'gzip'`, `'deflate'`, `'br'`, `'xz'`, `'zstd'`, `'lz4'`, `'bz2'`.

Эта функциональность доступна в [командном клиенте](../../interfaces/cli.md) и [clickhouse-local](../../operations/utilities/clickhouse-local.md).

**Примеры**

### Один файл с FROM INFILE {#single-file-with-from-infile}

Выполните следующие запросы, используя [командный клиент](../../interfaces/cli.md):

```bash
echo 1,A > input.csv ; echo 2,B >> input.csv
clickhouse-client --query="CREATE TABLE table_from_file (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO table_from_file FROM INFILE 'input.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM table_from_file FORMAT PrettyCompact;"
```

Результат:

```text
┌─id─┬─text─┐
│  1 │ A    │
│  2 │ B    │
└────┴──────┘
```

### Несколько файлов с FROM INFILE с использованием шаблонов {#multiple-files-with-from-infile-using-globs}

Этот пример очень похож на предыдущий, но вставка выполняется из нескольких файлов с использованием `FROM INFILE 'input_*.csv`.

```bash
echo 1,A > input_1.csv ; echo 2,B > input_2.csv
clickhouse-client --query="CREATE TABLE infile_globs (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM infile_globs FORMAT PrettyCompact;"
```

:::tip
В дополнение к выбору нескольких файлов с помощью `*`, вы можете использовать диапазоны (`{1,2}` или `{1..9}`) и другие [замены шаблонов](/sql-reference/table-functions/file.md/#globs-in-path). Все три из них будут работать с приведенным выше примером:

```sql
INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_{1,2}.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_?.csv' FORMAT CSV;
```
:::

## Вставка с использованием табличной функции {#inserting-using-a-table-function}

Данные могут быть вставлены в таблицы, ссылаясь на [табличные функции](../../sql-reference/table-functions/index.md).

**Синтаксис**

```sql
INSERT INTO [TABLE] FUNCTION table_func ...
```

**Пример**

Табличная функция [remote](/sql-reference/table-functions/remote) используется в следующих запросах:

```sql
CREATE TABLE simple_table (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;
INSERT INTO TABLE FUNCTION remote('localhost', default.simple_table)
    VALUES (100, 'inserted via remote()');
SELECT * FROM simple_table;
```

Результат:

```text
┌──id─┬─text──────────────────┐
│ 100 │ inserted via remote() │
└─────┴───────────────────────┘
```

## Вставка в ClickHouse Cloud {#inserting-into-clickhouse-cloud}

По умолчанию службы в ClickHouse Cloud предоставляют несколько реплик для высокой доступности. Когда вы подключаетесь к службе, устанавливается соединение с одной из этих реплик.

После успешного выполнения `INSERT` данные записываются в основное хранилище. Однако может потребоваться некоторое время, чтобы реплики получили эти обновления. Поэтому, если вы используете другое соединение, которое выполняет запрос `SELECT` на одной из этих других реплик, обновленные данные могут еще не отражаться.

Возможно использование `select_sequential_consistency` для принуждения реплики получать последние обновления. Вот пример запроса `SELECT` с использованием этой настройки:

```sql
SELECT .... SETTINGS select_sequential_consistency = 1;
```

Обратите внимание, что использование `select_sequential_consistency` увеличит нагрузку на ClickHouse Keeper (используется внутренне ClickHouse Cloud) и может привести к снижению производительности в зависимости от нагрузки на службу. Мы не рекомендуем включать эту настройку, если это не необходимо. Рекомендуемый подход — выполнять чтение/запись в одной сессии или использовать клиентский драйвер, который использует внешний протокол (и, следовательно, поддерживает постоянные соединения).

## Вставка в реплицированную настройку {#inserting-into-a-replicated-setup}

В реплицированной настройке данные будут видны на других репликах после их репликации. Данные начинают реплицироваться (загружаться на другие реплики) немедленно после `INSERT`. Это отличается от ClickHouse Cloud, где данные немедленно записываются в общее хранилище, а реплики подписываются на изменения метаданных.

Обратите внимание, что для реплицированных настроек `INSERT` может занять значительное количество времени (порядка одной секунды), так как требуется подтверждение в ClickHouse Keeper для распределенного консенсуса. Использование S3 для хранения также добавляет дополнительную задержку.

## Соображения по производительности {#performance-considerations}

`INSERT` сортирует входные данные по первичному ключу и разбивает их на партиции по ключу партиционирования. Если вы вставляете данные сразу в несколько партиций, это может значительно снизить производительность запроса `INSERT`. Чтобы избежать этого:

- Добавляйте данные достаточно большими пакетами, например, по 100 000 строк за раз.
- Группируйте данные по ключу партиционирования перед загрузкой в ClickHouse.

Производительность не снизится, если:

- Данные добавляются в реальном времени.
- Вы загружаете данные, которые обычно отсортированы по времени.

### Асинхронные вставки {#asynchronous-inserts}

Возможно асинхронно вставлять данные небольшими, но частыми вставками. Данные от таких вставок объединяются в пакеты и затем безопасно вставляются в таблицу. Для использования асинхронных вставок включите настройку [`async_insert`](/operations/settings/settings#async_insert).

Использование `async_insert` или движка таблиц [`Buffer`](/engines/table-engines/special/buffer) приводит к дополнительному буферизации.

### Большие или длительные вставки {#large-or-long-running-inserts}

Когда вы вставляете большие объемы данных, ClickHouse оптимизирует производительность записи через процесс под названием "сжатие". Малые блоки вставленных данных в памяти объединяются и сжимаются в более крупные блоки перед записью на диск. Сжатие снижает накладные расходы, связанные с каждой операцией записи. В этом процессе вставленные данные будут доступны для запроса после того, как ClickHouse завершит запись каждых [`max_insert_block_size`](/operations/settings/settings#max_insert_block_size) строк.

**Смотрите также**

- [async_insert](/operations/settings/settings#async_insert)
- [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)
- [wait_for_async_insert_timeout](/operations/settings/settings#wait_for_async_insert_timeout)
- [async_insert_max_data_size](/operations/settings/settings#async_insert_max_data_size)
- [async_insert_busy_timeout_ms](/operations/settings/settings#async_insert_busy_timeout_max_ms)
- [async_insert_stale_timeout_ms](/operations/settings/settings#async_insert_max_data_size)
