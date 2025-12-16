---
description: 'Документация по оператору INSERT INTO'
sidebar_label: 'INSERT INTO'
sidebar_position: 33
slug: /sql-reference/statements/insert-into
title: 'Оператор INSERT INTO'
doc_type: 'reference'
---

# Оператор INSERT INTO {#insert-into-statement}

Вставляет данные в таблицу.

**Синтаксис**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] [SETTINGS ...] VALUES (v11, v12, v13), (v21, v22, v23), ...
```

Вы можете указать список столбцов для вставки, используя `(c1, c2, c3)`. Вы также можете использовать выражение с [шаблоном соответствия столбцов](../../sql-reference/statements/select/index.md#asterisk), таким как `*`, и/или [модификаторы](../../sql-reference/statements/select/index.md#select-modifiers), такие как [APPLY](/sql-reference/statements/select/apply-modifier), [EXCEPT](/sql-reference/statements/select/except-modifier), [REPLACE](/sql-reference/statements/select/replace-modifier).

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

Если вы хотите вставить данные во все столбцы, кроме столбца `b`, вы можете сделать это с помощью ключевого слова `EXCEPT`. В соответствии с приведённым выше синтаксисом, вам необходимо убедиться, что вы вставляете столько значений (`VALUES (v11, v13)`), сколько указываете столбцов (`(c1, c3)`):

```sql
INSERT INTO insert_select_testtable (* EXCEPT(b)) Values (2, 2);
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

В этом примере мы видим, что во второй вставленной строке столбцы `a` и `c` заполнены переданными значениями, а столбец `b` — значением по умолчанию. Также можно использовать ключевое слово `DEFAULT` для вставки значений по умолчанию:

```sql
INSERT INTO insert_select_testtable VALUES (1, DEFAULT, 1) ;
```

Если список столбцов не содержит всех существующих столбцов, остальные заполняются:

* Значениями, вычисленными из выражений `DEFAULT`, указанных в определении таблицы.
* Нулями и пустыми строками, если выражения `DEFAULT` не определены.

Данные могут передаваться в INSERT в любом [формате](/sql-reference/formats), поддерживаемом ClickHouse. Формат должен быть явно указан в запросе:

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT format_name data_set
```

Например, следующий формат запроса идентичен основному варианту `INSERT ... VALUES`:

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT Values (v11, v12, v13), (v21, v22, v23), ...
```

ClickHouse удаляет все пробелы и один перевод строки (если он есть) перед данными. При формировании запроса рекомендуется переносить данные на новую строку после операторов запроса, что особенно важно, если данные начинаются с пробелов.

Пример:

```sql
INSERT INTO t FORMAT TabSeparated
11  Hello, world!
22  Qwerty
```

Вы можете загружать данные отдельно от запроса, используя [клиент командной строки](/operations/utilities/clickhouse-local) или [HTTP-интерфейс](/interfaces/http/).

:::note
Если вы хотите указать `SETTINGS` для запроса `INSERT`, это необходимо сделать *перед* секцией `FORMAT`, так как всё, что идёт после `FORMAT format_name`, интерпретируется как данные. Например:

```sql
INSERT INTO table SETTINGS ... FORMAT format_name data_set
```

:::

## Ограничения {#constraints}

Если у таблицы есть [ограничения](../../sql-reference/statements/create/table.md#constraints), их выражения проверяются для каждой строки вставляемых данных. Если какое-либо из этих ограничений не удовлетворено, сервер выбросит исключение с именем ограничения и его выражением, а выполнение запроса будет прекращено.

## Вставка результатов запроса SELECT {#inserting-the-results-of-select}

**Синтаксис**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] SELECT ...
```

Столбцы сопоставляются в соответствии с их позицией в операторе `SELECT`. Однако их имена в выражении `SELECT` и в таблице для `INSERT` могут отличаться. При необходимости выполняется приведение типов.

Ни один из форматов данных, кроме формата `Values`, не позволяет задавать значения как выражения, такие как `now()`, `1 + 2` и т. д. Формат `Values` допускает ограниченное использование выражений, но это не рекомендуется, так как в этом случае для их выполнения используется неэффективный код.

Другие запросы для модификации частей данных не поддерживаются: `UPDATE`, `DELETE`, `REPLACE`, `MERGE`, `UPSERT`, `INSERT UPDATE`.
Однако вы можете удалять старые данные с помощью `ALTER TABLE ... DROP PARTITION`.

Ключевое слово `FORMAT` необходимо указывать в конце запроса, если оператор `SELECT` содержит табличную функцию [input()](../../sql-reference/table-functions/input.md).

Чтобы вставлять значение по умолчанию вместо `NULL` в столбец с типом данных, не допускающим `NULL`, включите настройку [insert&#95;null&#95;as&#95;default](../../operations/settings/settings.md#insert_null_as_default).

`INSERT` также поддерживает CTE (common table expression, общее табличное выражение). Например, следующие два запроса эквивалентны:

```sql
INSERT INTO x WITH y AS (SELECT * FROM numbers(10)) SELECT * FROM y;
WITH y AS (SELECT * FROM numbers(10)) INSERT INTO x SELECT * FROM y;
```

## Вставка данных из файла {#inserting-data-from-a-file}

**Синтаксис**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] FROM INFILE file_name [COMPRESSION type] [SETTINGS ...] [FORMAT format_name]
```

Используйте приведённый выше синтаксис, чтобы вставлять данные из файла или файлов, находящихся на стороне **клиента**. `file_name` и `type` — строковые литералы. Формат входного файла (см. [форматы](../../interfaces/formats.md)) должен быть указан в предложении `FORMAT`.

Поддерживаются сжатые файлы. Тип сжатия определяется по расширению имени файла, либо он может быть явно указан в предложении `COMPRESSION`. Поддерживаемые типы: `'none'`, `'gzip'`, `'deflate'`, `'br'`, `'xz'`, `'zstd'`, `'lz4'`, `'bz2'`.

Эта функциональность доступна в [клиенте командной строки](../../interfaces/cli.md) и в [clickhouse-local](../../operations/utilities/clickhouse-local.md).

**Примеры**

### Один файл с FROM INFILE {#single-file-with-from-infile}

Выполните следующие запросы с помощью [клиента командной строки](../../interfaces/cli.md):

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

### Несколько файлов с FROM INFILE, использующим glob-шаблоны {#multiple-files-with-from-infile-using-globs}

Этот пример очень похож на предыдущий, но вставка выполняется из нескольких файлов с использованием `FROM INFILE 'input_*.csv'`.

```bash
echo 1,A > input_1.csv ; echo 2,B > input_2.csv
clickhouse-client --query="CREATE TABLE infile_globs (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM infile_globs FORMAT PrettyCompact;"
```

:::tip
Помимо выбора нескольких файлов с помощью символа `*`, вы можете использовать диапазоны (`{1,2}` или `{1..9}`) и другие [шаблоны glob](/sql-reference/table-functions/file.md/#globs-in-path). Следующие три варианта будут работать с приведённым выше примером:

```sql
INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_{1,2}.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_?.csv' FORMAT CSV;
```

:::

## Вставка с использованием табличной функции {#inserting-using-a-table-function}

Данные можно вставлять в таблицы, на которые ссылаются [табличные функции](../../sql-reference/table-functions/index.md).

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

По умолчанию сервисы ClickHouse Cloud предоставляют несколько реплик для обеспечения высокой доступности. При подключении к сервису устанавливается соединение с одной из этих реплик.

После успешного выполнения `INSERT` данные записываются в базовое хранилище. Однако репликам может потребоваться некоторое время, чтобы получить эти обновления. Поэтому, если вы используете другое соединение, которое выполняет запрос `SELECT` на одной из оставшихся реплик, обновлённые данные могут ещё не отображаться.

Можно использовать настройку `select_sequential_consistency`, чтобы принудительно обеспечить получение репликой последних обновлений. Ниже приведён пример запроса `SELECT` с использованием этого параметра:

```sql
SELECT .... SETTINGS select_sequential_consistency = 1;
```

Обратите внимание, что использование `select_sequential_consistency` увеличит нагрузку на ClickHouse Keeper (который используется в ClickHouse Cloud) и может привести к снижению производительности в зависимости от нагрузки на сервис. Мы не рекомендуем включать эту настройку без необходимости. Рекомендуемый подход — выполнять операции чтения и записи в рамках одного сеанса или использовать клиентский драйвер, который работает по нативному протоколу (и, соответственно, поддерживает «липкие» подключения).

## Вставка в реплицируемую конфигурацию {#inserting-into-a-replicated-setup}

В реплицируемой конфигурации данные становятся видимыми на других репликах после того, как они были реплицированы. Репликация данных (загрузка на другие реплики) начинается сразу после выполнения `INSERT`. Это отличается от ClickHouse Cloud, где данные немедленно записываются в общее хранилище, а реплики подписываются на изменения метаданных.

Обратите внимание, что в реплицируемых конфигурациях операции `INSERT` иногда могут занимать заметное время (порядка одной секунды), так как требуется фиксация в ClickHouse Keeper для достижения распределённого консенсуса. Использование S3 в качестве хранилища также добавляет дополнительную задержку.

## Особенности производительности {#performance-considerations}

`INSERT` сортирует входные данные по первичному ключу и разбивает их на партиции по ключу партиционирования. Если вы вставляете данные сразу в несколько партиций, это может значительно снизить производительность запроса `INSERT`. Чтобы этого избежать:

- Добавляйте данные достаточно крупными пакетами, например по 100 000 строк за раз.
- Группируйте данные по ключу партиционирования перед загрузкой в ClickHouse.

Производительность не снизится, если:

- Данные добавляются в режиме реального времени.
- Вы загружаете данные, которые обычно уже отсортированы по времени.

### Асинхронные вставки {#asynchronous-inserts}

Можно асинхронно вставлять данные небольшими, но частыми порциями. Данные из таких вставок объединяются в пакеты, а затем безопасно записываются в таблицу. Чтобы использовать асинхронные вставки, включите настройку [`async_insert`](/operations/settings/settings#async_insert).

Использование `async_insert` или [движка таблицы `Buffer`](/engines/table-engines/special/buffer) приводит к дополнительной буферизации.

### Крупные или долгие вставки {#large-or-long-running-inserts}

При вставке больших объемов данных ClickHouse оптимизирует производительность записи с помощью процесса, называемого «укрупнением блоков» (squashing). Небольшие блоки вставленных данных в памяти объединяются и укрупняются в более крупные блоки перед записью на диск. Такое укрупнение уменьшает накладные расходы, связанные с каждой операцией записи. В этом процессе вставленные данные становятся доступны для запросов после того, как ClickHouse завершит запись каждых [`max_insert_block_size`](/operations/settings/settings#max_insert_block_size) строк.

**См. также**

- [async_insert](/operations/settings/settings#async_insert)
- [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)
- [wait_for_async_insert_timeout](/operations/settings/settings#wait_for_async_insert_timeout)
- [async_insert_max_data_size](/operations/settings/settings#async_insert_max_data_size)
- [async_insert_busy_timeout_ms](/operations/settings/settings#async_insert_busy_timeout_max_ms)
- [async_insert_stale_timeout_ms](/operations/settings/settings#async_insert_max_data_size)
