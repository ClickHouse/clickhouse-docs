---
description: 'Руководство по использованию clickhouse-local для обработки данных без сервера'
sidebar_label: 'clickhouse-local'
sidebar_position: 60
slug: /operations/utilities/clickhouse-local
title: 'clickhouse-local'
doc_type: 'reference'
---

# clickhouse-local {#clickhouse-local}

## Когда использовать clickhouse-local и когда ClickHouse {#when-to-use-clickhouse-local-vs-clickhouse}

`clickhouse-local` — это простая в использовании версия ClickHouse, которая идеально подходит разработчикам, которым нужно быстро обрабатывать локальные и удалённые файлы с помощью SQL без установки полноценного сервера баз данных. С `clickhouse-local` разработчики могут выполнять SQL-команды (используя [SQL-диалект ClickHouse](../../sql-reference/index.md)) прямо из командной строки, что обеспечивает простой и эффективный способ доступа к возможностям ClickHouse без необходимости полной установки ClickHouse. Одно из основных преимуществ `clickhouse-local` заключается в том, что он уже включён при установке [clickhouse-client](/operations/utilities/clickhouse-local). Это означает, что разработчики могут быстро начать работу с `clickhouse-local` без сложного процесса установки.

Хотя `clickhouse-local` — отличный инструмент для разработки и тестирования, а также для обработки файлов, он не подходит для обслуживания конечных пользователей или приложений. В таких сценариях рекомендуется использовать open‑source [ClickHouse](/install). ClickHouse — это мощная OLAP-база данных, предназначенная для работы с крупномасштабными аналитическими нагрузками. Она обеспечивает быстрое и эффективное выполнение сложных запросов по большим наборам данных, что делает её идеальной для производственных сред, где критична высокая производительность. Кроме того, ClickHouse предлагает широкий набор функций, таких как репликация, шардинг и высокая доступность, которые необходимы для масштабирования при работе с большими объёмами данных и обслуживания приложений. Если вам нужно обрабатывать большие наборы данных или обслуживать конечных пользователей либо приложения, мы рекомендуем использовать open‑source ClickHouse вместо `clickhouse-local`.

Ознакомьтесь с документацией ниже, где приведены примеры сценариев использования `clickhouse-local`, таких как [запрос к локальному файлу](#query_data_in_file) или [чтение parquet-файла в S3](#query-data-in-a-parquet-file-in-aws-s3).

## Скачайте clickhouse-local {#download-clickhouse-local}

`clickhouse-local` использует тот же бинарный файл `clickhouse`, который запускает сервер ClickHouse и `clickhouse-client`. Проще всего скачать последнюю версию с помощью следующей команды:

```bash
curl https://clickhouse.com/ | sh
```

:::note
Скачанный вами бинарный файл может запускать самые разные инструменты и утилиты ClickHouse. Если вы хотите запустить ClickHouse как сервер базы данных, ознакомьтесь с разделом [Quick Start](/get-started/quick-start).
:::

## Запрос данных из файла с помощью SQL {#query_data_in_file}

Типичный способ использования `clickhouse-local` — выполнение разовых произвольных запросов к файлам, когда вам не нужно предварительно загружать данные в таблицу. `clickhouse-local` может потоково считывать данные из файла во временную таблицу и выполнять ваши SQL-запросы.

Если файл находится на той же машине, что и `clickhouse-local`, вы можете просто указать его для загрузки. Следующий файл `reviews.tsv` содержит выборку отзывов о товарах с Amazon:

```bash
./clickhouse local -q "SELECT * FROM 'reviews.tsv'"
```

Эта команда является сокращённой формой следующей команды:

```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv')"
```

ClickHouse определяет, что файл имеет табличный формат с разделителем табуляцией, по его расширению. Если вам нужно явно задать формат, просто укажите один из [многочисленных форматов ввода ClickHouse](../../interfaces/formats.md):

```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv', 'TabSeparated')"
```

Табличная функция `file` создаёт таблицу; вы можете использовать `DESCRIBE`, чтобы увидеть автоматически определённую схему:

```bash
./clickhouse local -q "DESCRIBE file('reviews.tsv')"
```

:::tip
Можно использовать глоб-шаблоны в именах файлов (см. [glob substitutions](/sql-reference/table-functions/file.md/#globs-in-path)).

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

Давайте найдём товар с самым высоким рейтингом:

```bash
./clickhouse local -q "SELECT
    argMax(product_title,star_rating),
    max(star_rating)
FROM file('reviews.tsv')"
```

```response
Monopoly Junior Board Game    5
```

## Выполнение запросов к данным в файле Parquet в AWS S3 {#query-data-in-a-parquet-file-in-aws-s3}

Если у вас есть файл в S3, используйте `clickhouse-local` и табличную функцию `s3`, чтобы выполнять запросы к файлу непосредственно (без вставки данных в таблицу ClickHouse). У нас есть файл `house_0.parquet` в публичном бакете, который содержит цены на объекты недвижимости, проданные в Соединённом Королевстве. Давайте посмотрим, сколько строк он содержит:

```bash
./clickhouse local -q "
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')"
```

Файл содержит 2,7 млн строк:

```response
2772030
```

Всегда полезно посмотреть, какую схему данных ClickHouse определяет на основании файла:

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

Давайте посмотрим, какие самые дорогие районы:

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
Когда будете готовы загружать свои файлы в ClickHouse, запустите сервер ClickHouse и вставьте результаты выполнения табличных функций `file` и `s3` в таблицу на движке `MergeTree`. Для получения дополнительной информации см. раздел [Быстрый старт](/get-started/quick-start).
:::

## Преобразование форматов {#format-conversions}

Вы можете использовать `clickhouse-local` для преобразования данных между различными форматами. Пример:

```bash
$ clickhouse-local --input-format JSONLines --output-format CSV --query "SELECT * FROM table" < data.json > data.csv
```

Форматы автоматически определяются на основании расширений файлов:

```bash
$ clickhouse-local --query "SELECT * FROM table" < data.json > data.csv
```

Для краткости можно записать это с использованием аргумента `--copy`:

```bash
$ clickhouse-local --copy < data.json > data.csv
```

## Использование {#usage}

По умолчанию `clickhouse-local` имеет доступ к данным сервера ClickHouse на том же хосте и не зависит от конфигурации сервера. Также поддерживается загрузка конфигурации сервера с помощью аргумента `--config-file`. Для временных данных по умолчанию создаётся отдельный уникальный каталог.

Основное использование (Linux):

```bash
$ clickhouse-local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

Базовое использование на Mac:

```bash
$ ./clickhouse local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

:::note
`clickhouse-local` также поддерживается на Windows через WSL2.
:::

Аргументы:

* `-S`, `--structure` — структура таблицы для входных данных.
* `--input-format` — входной формат, по умолчанию `TSV`.
* `-F`, `--file` — путь к данным, по умолчанию `stdin`.
* `-q`, `--query` — запросы для выполнения с `;` в качестве разделителя. `--query` может быть указан несколько раз, например, `--query "SELECT 1" --query "SELECT 2"`. Не может использоваться одновременно с `--queries-file`.
* `--queries-file` — путь к файлу с запросами для выполнения. `--queries-file` может быть указан несколько раз, например, `--queries-file queries1.sql --queries-file queries2.sql`. Не может использоваться одновременно с `--query`.
* `--multiquery, -n` – если указана, после опции `--query` можно перечислить несколько запросов, разделённых точкой с запятой. Для удобства также можно опустить `--query` и передать запросы непосредственно после `--multiquery`.
* `-N`, `--table` — имя таблицы, в которую помещаются выходные данные, по умолчанию `table`.
* `-f`, `--format`, `--output-format` — выходной формат, по умолчанию `TSV`.
* `-d`, `--database` — база данных по умолчанию `_local`.
* `--stacktrace` — выводить отладочную информацию в случае исключения.
* `--echo` — печатать запрос перед выполнением.
* `--verbose` — более подробная информация о выполнении запроса.
* `--logger.console` — вывод логов в консоль.
* `--logger.log` — имя файла лога.
* `--logger.level` — уровень логирования.
* `--ignore-error` — не останавливать обработку, если запрос завершился ошибкой.
* `-c`, `--config-file` — путь к конфигурационному файлу в том же формате, что и для сервера ClickHouse; по умолчанию конфигурация пустая.
* `--no-system-tables` — не подключать системные таблицы.
* `--help` — справка по аргументам для `clickhouse-local`.
* `-V`, `--version` — вывести информацию о версии и завершить работу.

Также существуют аргументы для каждой конфигурационной переменной ClickHouse, которые чаще используются вместо `--config-file`.

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

Необязательно использовать `stdin` или аргумент `--file`, вы можете открывать любое количество файлов с помощью [табличной функции `file`](../../sql-reference/table-functions/file.md):

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

Теперь выведем объём памяти, потребляемый каждым пользователем Unix:

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

## Дополнительные материалы {#related-content-1}

- [Извлечение, преобразование и выполнение запросов к данным в локальных файлах с использованием clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)
- [Загрузка данных в ClickHouse — часть 1](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)
- [Анализ крупных реальных наборов данных: более 100 лет метеонаблюдений в ClickHouse](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
- Блог: [Извлечение, преобразование и выполнение запросов к данным в локальных файлах с использованием clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)
