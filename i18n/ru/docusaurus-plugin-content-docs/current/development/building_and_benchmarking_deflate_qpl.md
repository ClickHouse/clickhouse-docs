---
slug: '/development/building_and_benchmarking_deflate_qpl'
sidebar_label: 'Сборка и Бенчмарк DEFLATE_QPL'
sidebar_position: 73
description: 'Как собрать Clickhouse и запустить тестирование с кодеком DEFLATE_QPL'
title: 'Собрать ClickHouse с DEFLATE_QPL'
doc_type: guide
---
# Сборка ClickHouse с DEFLATE_QPL

- Убедитесь, что ваша хост-машина соответствует необходимым для QPL [требованиям](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#prerequisites)
- deflate_qpl включен по умолчанию во время сборки cmake. В случае, если вы случайно изменили это, пожалуйста, проверьте флаг сборки: ENABLE_QPL=1

- Для общих требований, пожалуйста, обратитесь к общим [инструкциям по сборке ClickHouse](/development/build.md)


# Запуск бенчмарка с DEFLATE_QPL

## Список файлов {#files-list}

Папка `benchmark_sample` в [qpl-cmake](https://github.com/ClickHouse/ClickHouse/tree/master/contrib/qpl-cmake) содержит примеры запуска бенчмарка с помощью python-скриптов:

`client_scripts` содержит python-скрипты для выполнения типичного бенчмарка, например:
- `client_stressing_test.py`: Python-скрипт для стресс-теста запросов с [1~4] серверами.
- `queries_ssb.sql`: Файл, в котором перечислены все запросы для [Star Schema Benchmark](/getting-started/example-datasets/star-schema/)
- `allin1_ssb.sh`: Этот shell-скрипт выполняет весь процесс бенчмарка автоматически.

`database_files` означает, что он будет хранить файлы базы данных в соответствии с кодеками lz4/deflate/zstd.

## Запуск бенчмарка автоматически для Star Schema: {#run-benchmark-automatically-for-star-schema}

```bash
$ cd ./benchmark_sample/client_scripts
$ sh run_ssb.sh
```

После завершения проверьте все результаты в этой папке: `./output/`

В случае ошибки, пожалуйста, выполните бенчмарк вручную, как указано в следующих разделах.

## Определение {#definition}

[CLICKHOUSE_EXE] обозначает путь к исполняемой программе clickhouse.

## Окружение {#environment}

- CPU: Sapphire Rapid
- Требования к ОС см. в [Системных требованиях для QPL](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#system-requirements)
- Установка IAA см. в [Конфигурации ускорителя](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration)
- Установите модули python:

```bash
pip3 install clickhouse_driver numpy
```

[Самопроверка для IAA]

```bash
$ accel-config list | grep -P 'iax|state'
```

Ожидаемый вывод, как показано ниже:
```bash
"dev":"iax1",
"state":"enabled",
        "state":"enabled",
```

Если вы не видите вывода, это означает, что IAA не готов к работе. Пожалуйста, повторно проверьте установку IAA.

## Генерация исходных данных {#generate-raw-data}

```bash
$ cd ./benchmark_sample
$ mkdir rawdata_dir && cd rawdata_dir
```

Используйте [`dbgen`](/getting-started/example-datasets/star-schema) для генерации данных объемом 100 миллионов строк с параметрами:
-s 20

Файлы вида `*.tbl` ожидаются в папке `./benchmark_sample/rawdata_dir/ssb-dbgen`:

## Настройка базы данных {#database-setup}

Настройте базу данных с кодеком LZ4

```bash
$ cd ./database_dir/lz4
$ [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

Здесь вы должны увидеть сообщение `Connected to ClickHouse server` в консоли, что означает, что клиент успешно установил соединение с сервером.

Завершите три шага, указанные в [Star Schema Benchmark](/getting-started/example-datasets/star-schema):
- Создание таблиц в ClickHouse
- Вставка данных. Здесь должны использоваться `./benchmark_sample/rawdata_dir/ssb-dbgen/*.tbl` как входные данные.
- Преобразование "звездной схемы" в денормализованную "плоскую схему"

Настройте базу данных с кодеком IAA Deflate

```bash
$ cd ./database_dir/deflate
$ [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
Завершите три шага так же, как для lz4 выше.

Настройте базу данных с кодеком ZSTD

```bash
$ cd ./database_dir/zstd
$ [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
Завершите три шага так же, как для lz4 выше.

[самопроверка]
Для каждого кодека (lz4/zstd/deflate), пожалуйста, выполните запрос ниже, чтобы убедиться, что базы данных созданы успешно:
```sql
SELECT count() FROM lineorder_flat
```
Вы ожидаете увидеть следующий вывод:
```sql
┌───count()─┐
│ 119994608 │
└───────────┘
```
[Самопроверка для IAA Deflate codec]

При первом выполнении вставки или запроса от клиента ожидается, что консоль сервера Clickhouse напечатает этот лог:
```text
Hardware-assisted DeflateQpl codec is ready!
```
Если вы никогда не находили этот вывод, но видите другой лог, как указано ниже:
```text
Initialization of hardware-assisted DeflateQpl codec failed
```
Это означает, что устройства IAA не готовы, вам следует проверить установку IAA еще раз.

## Бенчмарк с одним экземпляром {#benchmark-with-single-instance}

- Перед началом бенчмарка отключите C6 и установите частоту CPU на `performance`

```bash
$ cpupower idle-set -d 3
$ cpupower frequency-set -g performance
```

- Чтобы устранить влияние памяти на перекрестные сокеты, мы используем `numactl`, чтобы привязать сервер к одному сокету, а клиента к другому сокету.
- Один экземпляр означает одиночный сервер, соединенный с одиночным клиентом.

Теперь запустите бенчмарк для LZ4/Deflate/ZSTD соответственно:

LZ4:

```bash
$ cd ./database_dir/lz4 
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > lz4.log
```

IAA deflate:

```bash
$ cd ./database_dir/deflate
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > deflate.log
```

ZSTD:

```bash
$ cd ./database_dir/zstd
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > zstd.log
```

Теперь три лога должны быть выведены, как ожидалось:
```text
lz4.log
deflate.log
zstd.log
```

Как проверить метрики производительности:

Мы сосредоточимся на QPS, пожалуйста, поищите ключевое слово: `QPS_Final` и соберите статистику.

## Бенчмарк с несколькими экземплярами {#benchmark-with-multi-instances}

- Чтобы уменьшить влияние памяти на слишком много потоков, мы рекомендуем запустить бенчмарк с несколькими экземплярами.
- Мультии экземпляр означает несколько (2 или 4) серверов, соединенных с соответствующим клиентом.
- Ядра одного сокета должны быть распределены поровну и назначены серверам соответственно.
- Для мультии экземпляров обязательно создайте новую папку для каждого кодека и вставьте набор данных, следуя аналогичным шагам, как для одиночного экземпляра.

Существует 2 отличия:
- На стороне клиента вам нужно запускать clickhouse с назначенным портом во время создания таблицы и вставки данных.
- На стороне сервера вам нужно запускать clickhouse с конкретным XML-файлом конфигурации, в котором был назначен порт. Все настраиваемые XML-файлы для мультии экземпляров были предоставлены в ./server_config.

Предположим, что в каждом сокете 60 ядер и возьмем 2 экземпляра в качестве примера.
Запустите сервер для первого экземпляра
LZ4:

```bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
```

ZSTD:

```bash
$ cd ./database_dir/zstd
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
```

IAA Deflate:

```bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
```

[Запустите сервер для второго экземпляра]

LZ4:

```bash
$ cd ./database_dir && mkdir lz4_s2 && cd lz4_s2
$ cp ../../server_config/config_lz4_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_lz4_s2.xml >&/dev/null&
```

ZSTD:

```bash
$ cd ./database_dir && mkdir zstd_s2 && cd zstd_s2
$ cp ../../server_config/config_zstd_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_zstd_s2.xml >&/dev/null&
```

IAA Deflate:

```bash
$ cd ./database_dir && mkdir deflate_s2 && cd deflate_s2
$ cp ../../server_config/config_deflate_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
```

Создание таблиц и вставка данных для второго экземпляра

Создание таблиц:

```bash
$ [CLICKHOUSE_EXE] client -m --port=9001 
```

Вставка данных:

```bash
$ [CLICKHOUSE_EXE] client --query "INSERT INTO [TBL_FILE_NAME] FORMAT CSV" < [TBL_FILE_NAME].tbl  --port=9001
```

- [TBL_FILE_NAME] представляет название файла, соответствующего регулярному выражению: *.tbl в папке `./benchmark_sample/rawdata_dir/ssb-dbgen`.
- `--port=9001` обозначает назначенный порт для экземпляра сервера, который также определен в config_lz4_s2.xml/config_zstd_s2.xml/config_deflate_s2.xml. Для еще большего количества экземпляров вам нужно будет заменить его на значение: 9002/9003, которые означают s3/s4 экземпляр соответственно. Если вы не назначите его, порт по умолчанию будет 9000, который уже использует первый экземпляр.

Бенчмарк с 2 экземплярами

LZ4:

```bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./database_dir/lz4_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_lz4_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2  > lz4_2insts.log
```

ZSTD:

```bash
$ cd ./database_dir/zstd
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ cd ./database_dir/zstd_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_zstd_s2.xml >&/dev/null& 
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > zstd_2insts.log
```

IAA deflate

```bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./database_dir/deflate_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > deflate_2insts.log
```

Здесь последний аргумент: `2` в client_stressing_test.py обозначает количество экземпляров. Для большего количества экземпляров вам нужно заменить его на: 3 или 4. Этот скрипт поддерживает до 4 экземпляров.

Теперь три лога должны быть выведены, как ожидалось:

```text
lz4_2insts.log
deflate_2insts.log
zstd_2insts.log
```
Как проверить метрики производительности:

Мы сосредоточимся на QPS, пожалуйста, поищите ключевое слово: `QPS_Final` и соберите статистику.

Настройка бенчмарка для 4 экземпляров аналогична настройке для 2 экземпляров выше.
Мы рекомендуем использовать данные бенчмарка для 2 экземпляров в качестве окончательного отчета для обзора.

## Советы {#tips}

Каждый раз перед запуском нового сервера ClickHouse, пожалуйста, убедитесь, что нет работающих фоновых процессов ClickHouse, проверьте и завершите старые:

```bash
$ ps -aux| grep clickhouse
$ kill -9 [PID]
```
Сравнив список запросов в ./client_scripts/queries_ssb.sql с официальным [Star Schema Benchmark](/getting-started/example-datasets/star-schema), вы найдете, что 3 запроса не включены: Q1.2/Q1.3/Q3.4. Это связано с тем, что использование ЦП % для этих запросов очень низкое < 10%, что означает, что они не могут продемонстрировать различия в производительности.