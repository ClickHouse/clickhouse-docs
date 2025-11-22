---
description: 'Документация по оператору INSERT INTO'
sidebar_label: 'INSERT INTO'
sidebar_position: 33
slug: /sql-reference/statements/insert-into
title: 'Оператор INSERT INTO'
doc_type: 'reference'
---



# Оператор INSERT INTO

Вставляет данные в таблицу.

**Синтаксис**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] [SETTINGS ...] VALUES (v11, v12, v13), (v21, v22, v23), ...
```

Вы можете указать список столбцов для вставки в виде `(c1, c2, c3)`. Также можно использовать выражение с [сопоставителем столбцов](../../sql-reference/statements/select/index.md#asterisk), например `*`, и/или [модификаторами](../../sql-reference/statements/select/index.md#select-modifiers), такими как [APPLY](/sql-reference/statements/select/apply-modifier), [EXCEPT](/sql-reference/statements/select/except-modifier), [REPLACE](/sql-reference/statements/select/replace-modifier).

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

Если вы хотите вставить данные во все столбцы, кроме столбца `b`, вы можете сделать это с помощью ключевого слова `EXCEPT`. Согласно приведённому выше синтаксису, вам нужно убедиться, что вы вставляете столько значений (`VALUES (v11, v13)`), сколько указываете столбцов (`(c1, c3)`):

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

В этом примере мы видим, что во второй вставленной строке столбцы `a` и `c` заполнены переданными значениями, а `b` — значением по умолчанию. Также можно использовать ключевое слово `DEFAULT` для вставки значений по умолчанию:

```sql
INSERT INTO insert_select_testtable VALUES (1, DEFAULT, 1) ;
```

Если в списке столбцов указаны не все существующие столбцы, остальные столбцы заполняются:

* значениями, вычисляемыми из выражений `DEFAULT`, указанных в определении таблицы;
* нулями и пустыми строками, если выражения `DEFAULT` не определены.

Данные могут передаваться в оператор INSERT в любом [формате](/sql-reference/formats), поддерживаемом ClickHouse. Формат должен быть явно задан в запросе:

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT format_name data_set
```

Например, следующий формат запроса идентичен основному варианту `INSERT ... VALUES`:

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT Values (v11, v12, v13), (v21, v22, v23), ...
```

ClickHouse удаляет все пробелы и один символ перевода строки (если он есть) перед данными. При формировании запроса рекомендуется помещать данные на новую строку после операторов запроса, что особенно важно, если данные начинаются с пробелов.

Пример:

```sql
INSERT INTO t FORMAT TabSeparated
11  Привет, мир!
22  Qwerty
```

Вы можете вставлять данные отдельно от запроса, используя [клиент командной строки](/operations/utilities/clickhouse-local) или [HTTP-интерфейс](/interfaces/http/).

:::note
Если вы хотите указать `SETTINGS` для запроса `INSERT`, то сделать это нужно *до* секции `FORMAT`, так как всё, что находится после `FORMAT format_name`, рассматривается как данные. Например:

```sql
INSERT INTO table SETTINGS ... FORMAT format_name набор_данных
```

:::


## Ограничения {#constraints}

Если в таблице заданы [ограничения](../../sql-reference/statements/create/table.md#constraints), их выражения проверяются для каждой строки вставляемых данных. Если хотя бы одно из ограничений не выполнено, сервер генерирует исключение с указанием имени и выражения ограничения, и выполнение запроса прекращается.


## Вставка результатов SELECT {#inserting-the-results-of-select}

**Синтаксис**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] SELECT ...
```

Столбцы сопоставляются в соответствии с их позицией в секции `SELECT`. Однако их имена в выражении `SELECT` и в таблице для `INSERT` могут отличаться. При необходимости выполняется приведение типов.

Ни один из форматов данных, кроме формата Values, не позволяет задавать значения в виде выражений, таких как `now()`, `1 + 2` и так далее. Формат Values допускает ограниченное использование выражений, но это не рекомендуется, поскольку в этом случае для их выполнения используется неэффективный код.

Другие запросы для изменения частей данных не поддерживаются: `UPDATE`, `DELETE`, `REPLACE`, `MERGE`, `UPSERT`, `INSERT UPDATE`.
Однако можно удалить старые данные с помощью `ALTER TABLE ... DROP PARTITION`.

Секция `FORMAT` должна быть указана в конце запроса, если секция `SELECT` содержит табличную функцию [input()](../../sql-reference/table-functions/input.md).

Чтобы вставить значение по умолчанию вместо `NULL` в столбец с ненулевым типом данных, включите настройку [insert_null_as_default](../../operations/settings/settings.md#insert_null_as_default).

`INSERT` также поддерживает CTE (обобщённые табличные выражения). Например, следующие два оператора эквивалентны:

```sql
INSERT INTO x WITH y AS (SELECT * FROM numbers(10)) SELECT * FROM y;
WITH y AS (SELECT * FROM numbers(10)) INSERT INTO x SELECT * FROM y;
```


## Вставка данных из файла {#inserting-data-from-a-file}

**Синтаксис**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] FROM INFILE file_name [COMPRESSION type] [SETTINGS ...] [FORMAT format_name]
```

Используйте приведенный выше синтаксис для вставки данных из файла или файлов, хранящихся на стороне **клиента**. `file_name` и `type` являются строковыми литералами. [Формат](../../interfaces/formats.md) входного файла должен быть указан в секции `FORMAT`.

Поддерживаются сжатые файлы. Тип сжатия определяется по расширению имени файла или может быть явно указан в секции `COMPRESSION`. Поддерживаемые типы: `'none'`, `'gzip'`, `'deflate'`, `'br'`, `'xz'`, `'zstd'`, `'lz4'`, `'bz2'`.

Эта функциональность доступна в [клиенте командной строки](../../interfaces/cli.md) и [clickhouse-local](../../operations/utilities/clickhouse-local.md).

**Примеры**

### Один файл с FROM INFILE {#single-file-with-from-infile}

Выполните следующие запросы, используя [клиент командной строки](../../interfaces/cli.md):

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

### Несколько файлов с FROM INFILE с использованием масок {#multiple-files-with-from-infile-using-globs}

Этот пример очень похож на предыдущий, но вставка выполняется из нескольких файлов с использованием `FROM INFILE 'input_*.csv`.

```bash
echo 1,A > input_1.csv ; echo 2,B > input_2.csv
clickhouse-client --query="CREATE TABLE infile_globs (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM infile_globs FORMAT PrettyCompact;"
```

:::tip
Помимо выбора нескольких файлов с помощью `*`, вы можете использовать диапазоны (`{1,2}` или `{1..9}`) и другие [подстановки масок](/sql-reference/table-functions/file.md/#globs-in-path). Все три варианта будут работать с приведенным выше примером:

```sql
INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_{1,2}.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_?.csv' FORMAT CSV;
```

:::


## Вставка данных с использованием табличной функции {#inserting-using-a-table-function}

Данные можно вставлять в таблицы, на которые ссылаются [табличные функции](../../sql-reference/table-functions/index.md).

**Синтаксис**

```sql
INSERT INTO [TABLE] FUNCTION table_func ...
```

**Пример**

В следующих запросах используется табличная функция [remote](/sql-reference/table-functions/remote):

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


## Вставка данных в ClickHouse Cloud {#inserting-into-clickhouse-cloud}

По умолчанию сервисы ClickHouse Cloud предоставляют несколько реплик для обеспечения высокой доступности. При подключении к сервису соединение устанавливается с одной из этих реплик.

После успешного выполнения `INSERT` данные записываются в базовое хранилище. Однако репликам может потребоваться некоторое время для получения этих обновлений. Поэтому при использовании другого соединения, которое выполняет запрос `SELECT` на одной из других реплик, обновлённые данные могут ещё не отобразиться.

Можно использовать настройку `select_sequential_consistency`, чтобы принудительно получить последние обновления на реплике. Вот пример запроса `SELECT` с использованием этой настройки:

```sql
SELECT .... SETTINGS select_sequential_consistency = 1;
```

Обратите внимание, что использование `select_sequential_consistency` увеличит нагрузку на ClickHouse Keeper (используется внутри ClickHouse Cloud) и может привести к снижению производительности в зависимости от нагрузки на сервис. Мы не рекомендуем включать эту настройку без необходимости. Рекомендуемый подход — выполнять операции чтения и записи в рамках одной сессии или использовать клиентский драйвер с поддержкой нативного протокола (и, следовательно, постоянных соединений).


## Вставка данных в реплицированную конфигурацию {#inserting-into-a-replicated-setup}

В реплицированной конфигурации данные становятся видимыми на других репликах после завершения репликации. Репликация данных (их загрузка на другие реплики) начинается сразу после выполнения `INSERT`. Это отличается от ClickHouse Cloud, где данные сразу записываются в общее хранилище, а реплики подписываются на изменения метаданных.

Обратите внимание, что в реплицированных конфигурациях операции `INSERT` иногда могут занимать значительное время (порядка одной секунды), так как требуется фиксация в ClickHouse Keeper для достижения распределённого консенсуса. Использование S3 для хранения также увеличивает задержку.


## Вопросы производительности {#performance-considerations}

`INSERT` сортирует входные данные по первичному ключу и разбивает их на партиции по ключу партиционирования. Если вы вставляете данные одновременно в несколько партиций, это может существенно снизить производительность запроса `INSERT`. Чтобы этого избежать:

- Добавляйте данные достаточно большими пакетами, например, по 100 000 строк за раз.
- Группируйте данные по ключу партиционирования перед загрузкой в ClickHouse.

Производительность не снизится, если:

- Данные добавляются в режиме реального времени.
- Вы загружаете данные, которые обычно отсортированы по времени.

### Асинхронные вставки {#asynchronous-inserts}

Возможна асинхронная вставка данных небольшими, но частыми порциями. Данные из таких вставок объединяются в пакеты и затем безопасно вставляются в таблицу. Чтобы использовать асинхронные вставки, включите настройку [`async_insert`](/operations/settings/settings#async_insert).

Использование `async_insert` или [движка таблиц `Buffer`](/engines/table-engines/special/buffer) приводит к дополнительной буферизации.

### Большие или длительные вставки {#large-or-long-running-inserts}

При вставке больших объемов данных ClickHouse оптимизирует производительность записи с помощью процесса, называемого «склеиванием» (squashing). Небольшие блоки вставляемых данных в памяти объединяются и склеиваются в более крупные блоки перед записью на диск. Склеивание снижает накладные расходы, связанные с каждой операцией записи. В этом процессе вставленные данные становятся доступными для запросов после того, как ClickHouse завершит запись каждых [`max_insert_block_size`](/operations/settings/settings#max_insert_block_size) строк.

**См. также**

- [async_insert](/operations/settings/settings#async_insert)
- [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)
- [wait_for_async_insert_timeout](/operations/settings/settings#wait_for_async_insert_timeout)
- [async_insert_max_data_size](/operations/settings/settings#async_insert_max_data_size)
- [async_insert_busy_timeout_ms](/operations/settings/settings#async_insert_busy_timeout_max_ms)
- [async_insert_stale_timeout_ms](/operations/settings/settings#async_insert_max_data_size)
