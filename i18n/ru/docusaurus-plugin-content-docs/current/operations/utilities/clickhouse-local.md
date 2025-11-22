---
description: 'Руководство по использованию clickhouse-local для обработки данных без сервера'
sidebar_label: 'clickhouse-local'
sidebar_position: 60
slug: /operations/utilities/clickhouse-local
title: 'clickhouse-local'
doc_type: 'reference'
---



# clickhouse-local



## Когда использовать clickhouse-local, а когда ClickHouse {#when-to-use-clickhouse-local-vs-clickhouse}

`clickhouse-local` — это простая в использовании версия ClickHouse, которая идеально подходит для разработчиков, которым необходимо выполнять быструю обработку локальных и удалённых файлов с помощью SQL без установки полноценного сервера базы данных. С помощью `clickhouse-local` разработчики могут использовать SQL-команды (используя [диалект SQL ClickHouse](../../sql-reference/index.md)) непосредственно из командной строки, что обеспечивает простой и эффективный способ доступа к возможностям ClickHouse без необходимости полной установки ClickHouse. Одно из главных преимуществ `clickhouse-local` заключается в том, что он уже включён при установке [clickhouse-client](/operations/utilities/clickhouse-local). Это означает, что разработчики могут быстро начать работу с `clickhouse-local` без необходимости сложного процесса установки.

Хотя `clickhouse-local` является отличным инструментом для разработки и тестирования, а также для обработки файлов, он не подходит для обслуживания конечных пользователей или приложений. В таких сценариях рекомендуется использовать open-source [ClickHouse](/install). ClickHouse — это мощная OLAP-база данных, предназначенная для обработки крупномасштабных аналитических нагрузок. Она обеспечивает быструю и эффективную обработку сложных запросов к большим наборам данных, что делает её идеальной для использования в производственных средах, где критически важна высокая производительность. Кроме того, ClickHouse предлагает широкий спектр возможностей, таких как репликация, шардирование и высокая доступность, которые необходимы для масштабирования при работе с большими наборами данных и обслуживании приложений. Если вам необходимо работать с большими наборами данных или обслуживать конечных пользователей или приложения, мы рекомендуем использовать open-source ClickHouse вместо `clickhouse-local`.

Пожалуйста, ознакомьтесь с приведённой ниже документацией, которая демонстрирует примеры использования `clickhouse-local`, такие как [запросы к локальному файлу](#query_data_in_file) или [чтение parquet-файла в S3](#query-data-in-a-parquet-file-in-aws-s3).


## Загрузка clickhouse-local {#download-clickhouse-local}

`clickhouse-local` выполняется с помощью того же исполняемого файла `clickhouse`, который используется для запуска сервера ClickHouse и `clickhouse-client`. Самый простой способ загрузить последнюю версию — выполнить следующую команду:

```bash
curl https://clickhouse.com/ | sh
```

:::note
Загруженный исполняемый файл позволяет запускать различные инструменты и утилиты ClickHouse. Если вы хотите запустить ClickHouse в качестве сервера базы данных, обратитесь к разделу [Быстрый старт](/get-started/quick-start).
:::


## Запрос данных из файла с помощью SQL {#query_data_in_file}

Распространённый вариант использования `clickhouse-local` — выполнение ad-hoc запросов к файлам, когда не требуется загружать данные в таблицу. `clickhouse-local` может передавать данные из файла во временную таблицу и выполнять SQL-запросы.

Если файл находится на том же компьютере, что и `clickhouse-local`, можно просто указать файл для загрузки. Следующий файл `reviews.tsv` содержит выборку отзывов о товарах Amazon:

```bash
./clickhouse local -q "SELECT * FROM 'reviews.tsv'"
```

Эта команда является сокращённой формой:

```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv')"
```

ClickHouse определяет, что файл использует формат с разделителями-табуляциями, по расширению имени файла. Если необходимо явно указать формат, просто добавьте один из [многочисленных входных форматов ClickHouse](../../interfaces/formats.md):

```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv', 'TabSeparated')"
```

Табличная функция `file` создаёт таблицу, и вы можете использовать `DESCRIBE` для просмотра автоматически определённой схемы:

```bash
./clickhouse local -q "DESCRIBE file('reviews.tsv')"
```

:::tip
Вы можете использовать шаблоны подстановки в имени файла (см. [подстановки glob](/sql-reference/table-functions/file.md/#globs-in-path)).

Примеры:

```bash
./clickhouse local -q "SELECT * FROM 'reviews*.jsonl'"
./clickhouse local -q "SELECT * FROM 'review_?.csv'"
./clickhouse local -q "SELECT * FROM 'review_{1..3}.csv'"
```

:::

```response
marketplace    Nullable(String)
customer_id    Nullable(Int64)
review_id    Nullable(String)
product_id    Nullable(String)
product_parent    Nullable(Int64)
product_title    Nullable(String)
product_category    Nullable(String)
star_rating    Nullable(Int64)
helpful_votes    Nullable(Int64)
total_votes    Nullable(Int64)
vine    Nullable(String)
verified_purchase    Nullable(String)
review_headline    Nullable(String)
review_body    Nullable(String)
review_date    Nullable(Date)
```

Найдём товар с наивысшим рейтингом:

```bash
./clickhouse local -q "SELECT
    argMax(product_title,star_rating),
    max(star_rating)
FROM file('reviews.tsv')"
```

```response
Monopoly Junior Board Game    5
```


## Запрос данных из файла Parquet в AWS S3 {#query-data-in-a-parquet-file-in-aws-s3}

Если у вас есть файл в S3, используйте `clickhouse-local` и табличную функцию `s3` для выполнения запросов непосредственно к файлу (без загрузки данных в таблицу ClickHouse). У нас есть файл `house_0.parquet` в публичном бакете, который содержит цены на недвижимость, проданную в Великобритании. Посмотрим, сколько в нём строк:

```bash
./clickhouse local -q "
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')"
```

Файл содержит 2,7 млн строк:

```response
2772030
```

Всегда полезно посмотреть, какую схему ClickHouse определил из файла:

```bash
./clickhouse local -q "DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')"
```

```response
price    Nullable(Int64)
date    Nullable(UInt16)
postcode1    Nullable(String)
postcode2    Nullable(String)
type    Nullable(String)
is_new    Nullable(UInt8)
duration    Nullable(String)
addr1    Nullable(String)
addr2    Nullable(String)
street    Nullable(String)
locality    Nullable(String)
town    Nullable(String)
district    Nullable(String)
county    Nullable(String)
```

Посмотрим, какие районы самые дорогие:

```bash
./clickhouse local -q "
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 10"
```

```response
LONDON    CITY OF LONDON    886    2271305    █████████████████████████████████████████████▍
LEATHERHEAD    ELMBRIDGE    206    1176680    ███████████████████████▌
LONDON    CITY OF WESTMINSTER    12577    1108221    ██████████████████████▏
LONDON    KENSINGTON AND CHELSEA    8728    1094496    █████████████████████▉
HYTHE    FOLKESTONE AND HYTHE    130    1023980    ████████████████████▍
CHALFONT ST GILES    CHILTERN    113    835754    ████████████████▋
AMERSHAM    BUCKINGHAMSHIRE    113    799596    ███████████████▉
VIRGINIA WATER    RUNNYMEDE    356    789301    ███████████████▊
BARNET    ENFIELD    282    740514    ██████████████▊
NORTHWOOD    THREE RIVERS    184    731609    ██████████████▋
```

:::tip
Когда вы будете готовы загрузить файлы в ClickHouse, запустите сервер ClickHouse и вставьте результаты табличных функций `file` и `s3` в таблицу `MergeTree`. Подробнее см. в разделе [Быстрый старт](/get-started/quick-start).
:::


## Преобразование форматов {#format-conversions}

Утилита `clickhouse-local` позволяет преобразовывать данные между различными форматами. Пример:

```bash
$ clickhouse-local --input-format JSONLines --output-format CSV --query "SELECT * FROM table" < data.json > data.csv
```

Форматы автоматически определяются по расширениям файлов:

```bash
$ clickhouse-local --query "SELECT * FROM table" < data.json > data.csv
```

Для упрощения можно использовать аргумент `--copy`:

```bash
$ clickhouse-local --copy < data.json > data.csv
```


## Использование {#usage}

По умолчанию `clickhouse-local` имеет доступ к данным сервера ClickHouse на том же хосте и не зависит от конфигурации сервера. Также поддерживается загрузка конфигурации сервера с помощью аргумента `--config-file`. Для временных данных по умолчанию создается уникальный временный каталог.

Базовое использование (Linux):

```bash
$ clickhouse-local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

Базовое использование (Mac):

```bash
$ ./clickhouse local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

:::note
`clickhouse-local` также поддерживается в Windows через WSL2.
:::

Аргументы:

- `-S`, `--structure` — структура таблицы для входных данных.
- `--input-format` — формат входных данных, по умолчанию `TSV`.
- `-F`, `--file` — путь к данным, по умолчанию `stdin`.
- `-q`, `--query` — запросы для выполнения с разделителем `;`. Аргумент `--query` может быть указан несколько раз, например `--query "SELECT 1" --query "SELECT 2"`. Не может использоваться одновременно с `--queries-file`.
- `--queries-file` — путь к файлу с запросами для выполнения. Аргумент `--queries-file` может быть указан несколько раз, например `--query queries1.sql --query queries2.sql`. Не может использоваться одновременно с `--query`.
- `--multiquery, -n` — если указан, после опции `--query` можно перечислить несколько запросов, разделенных точкой с запятой. Для удобства также можно опустить `--query` и передать запросы непосредственно после `--multiquery`.
- `-N`, `--table` — имя таблицы для размещения выходных данных, по умолчанию `table`.
- `-f`, `--format`, `--output-format` — формат выходных данных, по умолчанию `TSV`.
- `-d`, `--database` — база данных по умолчанию, по умолчанию `_local`.
- `--stacktrace` — выводить ли отладочную информацию в случае исключения.
- `--echo` — выводить запрос перед выполнением.
- `--verbose` — больше подробностей о выполнении запроса.
- `--logger.console` — вывод логов в консоль.
- `--logger.log` — имя файла логов.
- `--logger.level` — уровень логирования.
- `--ignore-error` — не останавливать обработку при ошибке выполнения запроса.
- `-c`, `--config-file` — путь к файлу конфигурации в том же формате, что и для сервера ClickHouse, по умолчанию конфигурация пустая.
- `--no-system-tables` — не подключать системные таблицы.
- `--help` — справка по аргументам для `clickhouse-local`.
- `-V`, `--version` — вывести информацию о версии и завершить работу.

Также существуют аргументы для каждой конфигурационной переменной ClickHouse, которые используются чаще, чем `--config-file`.


## Примеры {#examples}

```bash
$ echo -e "1,2\n3,4" | clickhouse-local --structure "a Int64, b Int64" \
    --input-format "CSV" --query "SELECT * FROM table"
Read 2 rows, 32.00 B in 0.000 sec., 5182 rows/sec., 80.97 KiB/sec.
1   2
3   4
```

Предыдущий пример эквивалентен следующему:

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -n --query "
    CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin);
    SELECT a, b FROM table;
    DROP TABLE table;"
Read 2 rows, 32.00 B in 0.000 sec., 4987 rows/sec., 77.93 KiB/sec.
1   2
3   4
```

Необязательно использовать `stdin` или аргумент `--file` — можно открыть любое количество файлов с помощью [табличной функции `file`](../../sql-reference/table-functions/file.md):

```bash
$ echo 1 | tee 1.tsv
1

$ echo 2 | tee 2.tsv
2

$ clickhouse-local --query "
    select * from file('1.tsv', TSV, 'a int') t1
    cross join file('2.tsv', TSV, 'b int') t2"
1    2
```

Теперь выведем использование памяти каждым пользователем Unix:

Запрос:

```bash
$ ps aux | tail -n +2 | awk '{ printf("%s\t%s\n", $1, $4) }' \
    | clickhouse-local --structure "user String, mem Float64" \
        --query "SELECT user, round(sum(mem), 2) as memTotal
            FROM table GROUP BY user ORDER BY memTotal DESC FORMAT Pretty"
```

Результат:

```text
Read 186 rows, 4.15 KiB in 0.035 sec., 5302 rows/sec., 118.34 KiB/sec.
┏━━━━━━━━━━┳━━━━━━━━━━┓
┃ user     ┃ memTotal ┃
┡━━━━━━━━━━╇━━━━━━━━━━┩
│ bayonet  │    113.5 │
├──────────┼──────────┤
│ root     │      8.8 │
├──────────┼──────────┤
...
```


## Связанный контент {#related-content-1}

- [Извлечение, преобразование и выполнение запросов к данным в локальных файлах с использованием clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)
- [Загрузка данных в ClickHouse — Часть 1](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)
- [Исследование масштабных реальных наборов данных: более 100 лет метеорологических записей в ClickHouse](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
- Блог: [Извлечение, преобразование и выполнение запросов к данным в локальных файлах с использованием clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)
