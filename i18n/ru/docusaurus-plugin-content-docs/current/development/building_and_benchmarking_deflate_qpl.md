---
slug: /development/building_and_benchmarking_deflate_qpl
sidebar_position: 73
sidebar_label: Создание и тестирование DEFLATE_QPL
description: Как собрать ClickHouse и запустить тестирование с кодеком DEFLATE_QPL
---


# Соберите ClickHouse с помощью DEFLATE_QPL

- Убедитесь, что ваша хост-машина соответствует требованиям [предварительным условиям](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#prerequisites) QPL.
- deflate_qpl включен по умолчанию во время сборки cmake. В случае, если вы случайно измените это, пожалуйста, дважды проверьте флаг сборки: ENABLE_QPL=1.

- Для общих требований, пожалуйста, обратитесь к общим [инструкциям по сборке ClickHouse](/development/build.md).


# Запустите тестирование с DEFLATE_QPL

## Список файлов {#files-list}

Папки `benchmark_sample` в [qpl-cmake](https://github.com/ClickHouse/ClickHouse/tree/master/contrib/qpl-cmake) предоставляют пример запуска тестирования с помощью python-скриптов:

`client_scripts` содержит python-скрипты для выполнения типичного тестирования, например:
- `client_stressing_test.py`: скрипт на python для стресстестирования запросов с [1~4] серверами.
- `queries_ssb.sql`: файл со списком всех запросов для [Star Schema Benchmark](/getting-started/example-datasets/star-schema/).
- `allin1_ssb.sh`: Этот shell-скрипт автоматически выполняет весь процесс тестирования в одном.

`database_files` означает, что он будет хранить файлы базы данных в соответствии с кодеками lz4/deflate/zstd.

## Автоматический запуск тестирования для Star Schema: {#run-benchmark-automatically-for-star-schema}

``` bash
$ cd ./benchmark_sample/client_scripts
$ sh run_ssb.sh
```

После завершения проверьте все результаты в этой папке: `./output/`.

Если вы столкнулись с неудачей, пожалуйста, выполните тестирование вручную, как указано в следующих разделах.

## Определение {#definition}

[CLICKHOUSE_EXE] означает путь к исполняемой программе clickhouse.

## Окружение {#environment}

- CPU: Sapphire Rapid
- Требования к ОС обратитесь к [Системным требованиям для QPL](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#system-requirements)
- Настройка IAA смотрите [Конфигурацию ускорителя](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration)
- Установите модули python:

``` bash
pip3 install clickhouse_driver numpy
```

[Самопроверка для IAA]

``` bash
$ accel-config list | grep -P 'iax|state'
```

Ожидаемый вывод будет таким:
``` bash
    "dev":"iax1",
    "state":"enabled",
            "state":"enabled",
```

Если вы ничего не видите в выводе, это означает, что IAA не готов к работе. Пожалуйста, проверьте настройку IAA еще раз.

## Генерация сырых данных {#generate-raw-data}

``` bash
$ cd ./benchmark_sample
$ mkdir rawdata_dir && cd rawdata_dir
```

Используйте [`dbgen`](/getting-started/example-datasets/star-schema), чтобы сгенерировать 100 миллионов строк данных с параметрами:
-s 20

Ожидается, что файлы типа `*.tbl` будут выводиться в `./benchmark_sample/rawdata_dir/ssb-dbgen`:

## Настройка базы данных {#database-setup}

Настройте базу данных с кодеком LZ4

``` bash
$ cd ./database_dir/lz4
$ [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

Здесь вы должны увидеть сообщение `Connected to ClickHouse server` в консоли, что означает, что клиент успешно установил соединение с сервером.

Завершите три шага, упомянутые в [Star Schema Benchmark](/getting-started/example-datasets/star-schema):
- Создание таблиц в ClickHouse
- Вставка данных. Здесь следует использовать `./benchmark_sample/rawdata_dir/ssb-dbgen/*.tbl` в качестве входных данных.
- Преобразование "звездной схемы" в денормализованную "плоскую схему".

Настройте базу данных с кодеком IAA Deflate

``` bash
$ cd ./database_dir/deflate
$ [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
Завершите три шага так же, как и с lz4 выше.

Настройте базу данных с кодеком ZSTD

``` bash
$ cd ./database_dir/zstd
$ [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
Завершите три шага так же, как и с lz4 выше.

[Самопроверка]
Для каждого кодека (lz4/zstd/deflate) выполните следующий запрос, чтобы убедиться, что базы данных созданы успешно:
```sql
select count() from lineorder_flat
```
Ожидается следующий вывод:
```sql
┌───count()─┐
│ 119994608 │
└───────────┘
```
[Самопроверка для кодека IAA Deflate]

Первый раз, когда вы выполняете вставку или запрос от клиента, консоль сервера clickhouse ожидаемо выпустит этот лог:
```text
Аппаратный кодек DeflateQpl готов к работе!
```
Если вы этого никогда не находили, но видите другой лог ниже:
```text
Инициализация аппаратного кодека DeflateQpl не удалась
```
Это означает, что устройства IAA не готовы, вам нужно снова проверить настройку IAA.

## Тестирование с одним экземпляром {#benchmark-with-single-instance}

- Перед началом тестирования отключите C6 и установите частотный губернатор CPU на `performance`.

``` bash
$ cpupower idle-set -d 3
$ cpupower frequency-set -g performance
```

- Чтобы устранить влияние памяти на перекрестные сокеты, мы используем `numactl`, чтобы связать сервер с одним сокетом и клиента с другим сокетом.
- Один экземпляр означает один сервер, подключенный к одному клиенту.

Теперь запустите тестирование для LZ4/Deflate/ZSTD соответственно:

LZ4:

``` bash
$ cd ./database_dir/lz4 
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > lz4.log
```

IAA deflate:

``` bash
$ cd ./database_dir/deflate
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > deflate.log
```

ZSTD:

``` bash
$ cd ./database_dir/zstd
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > zstd.log
```

Теперь три лога должны быть выданы, как ожидалось:
```text
lz4.log
deflate.log
zstd.log
```

Как проверить метрики производительности:

Мы фокусируемся на QPS, пожалуйста, ищите ключевое слово: `QPS_Final` и собирайте статистику.

## Тестирование с несколькими экземплярами {#benchmark-with-multi-instances}

- Чтобы уменьшить влияние памяти на слишком много потоков, мы рекомендуем запускать тестирование с несколькими экземплярами.
- Мульти-инстанс означает несколько (2 или 4) серверов, подключенных к соответствующему клиенту.
- Ядра одного сокета нужно делить поровну и назначать серверам соответственно.
- Для многопоточности необходимо создать новую папку для каждого кодека и вставить набор данных, следуя аналогичным шагам, как и для одного экземпляра.

Есть 2 отличия:
- Со стороны клиента необходимо запустить clickhouse с назначенным портом во время создания таблицы и вставки данных.
- Со стороны сервера необходимо запустить clickhouse с конкретным файлом конфигурации xml, в котором был назначен порт. Все пользовательские файлы xml для множественных инстансов предоставлены в ./server_config.

Предположим, что на каждом сокете 60 ядер и возьмем 2 экземпляра в качестве примера.
Запустите сервер для первого экземпляра
LZ4:

``` bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
```

ZSTD:

``` bash
$ cd ./database_dir/zstd
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
```

IAA Deflate:

``` bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
```

[Запускаем сервер для второго экземпляра]

LZ4:

``` bash
$ cd ./database_dir && mkdir lz4_s2 && cd lz4_s2
$ cp ../../server_config/config_lz4_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_lz4_s2.xml >&/dev/null&
```

ZSTD:

``` bash
$ cd ./database_dir && mkdir zstd_s2 && cd zstd_s2
$ cp ../../server_config/config_zstd_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_zstd_s2.xml >&/dev/null&
```

IAA Deflate:

``` bash
$ cd ./database_dir && mkdir deflate_s2 && cd deflate_s2
$ cp ../../server_config/config_deflate_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
```

Создание таблиц и вставка данных для второго экземпляра

Создание таблиц:

``` bash
$ [CLICKHOUSE_EXE] client -m --port=9001 
```

Вставка данных:

``` bash
$ [CLICKHOUSE_EXE] client --query "INSERT INTO [TBL_FILE_NAME] FORMAT CSV" < [TBL_FILE_NAME].tbl  --port=9001
```

- [TBL_FILE_NAME] представляет имя файла, названного по регулярному выражению: *. tbl в `./benchmark_sample/rawdata_dir/ssb-dbgen`.
- `--port=9001` обозначает назначенный порт для экземпляра сервера, который также определяется в config_lz4_s2.xml/config_zstd_s2.xml/config_deflate_s2.xml. Для еще большего количества экземпляров вам нужно заменить его значением: 9002/9003, которые обозначают s3/s4 экземпляр соответственно. Если вы не назначите его, порт по умолчанию будет 9000, который уже используется первым экземпляром.

Тестирование с 2 экземплярами

LZ4:

``` bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./database_dir/lz4_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_lz4_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2  > lz4_2insts.log
```

ZSTD:

``` bash
$ cd ./database_dir/zstd
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ cd ./database_dir/zstd_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_zstd_s2.xml >&/dev/null& 
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > zstd_2insts.log
```

IAA deflate

``` bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./database_dir/deflate_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > deflate_2insts.log
```

Последний аргумент: `2` в client_stressing_test.py обозначает количество экземпляров. Для большего количества экземпляров вам нужно заменить его значением: 3 или 4. Этот скрипт поддерживает до 4 экземпляров.

Теперь три лога должны быть выданы, как ожидалось:

``` text
lz4_2insts.log
deflate_2insts.log
zstd_2insts.log
```
Как проверить метрики производительности:

Мы фокусируемся на QPS, пожалуйста, ищите ключевое слово: `QPS_Final` и собирайте статистику.

Настройка тестирования для 4 экземпляров аналогична 2 экземплярам выше.
Мы рекомендуем использовать данные тестирования для 2 экземпляров в качестве окончательного отчета для обзора.

## Советы {#tips}

Каждый раз перед запуском нового сервера clickhouse убедитесь, что не работает фоновой процесс clickhouse, проверьте и убейте старый:

``` bash
$ ps -aux| grep clickhouse
$ kill -9 [PID]
```
Сравнив список запросов в ./client_scripts/queries_ssb.sql с официальным [Star Schema Benchmark](/getting-started/example-datasets/star-schema), вы найдете, что 3 запроса не включены: Q1.2/Q1.3/Q3.4. Это связано с тем, что использование CPU% для этих запросов очень низкое < 10%, что означает, что они не могут продемонстрировать различия в производительности.
