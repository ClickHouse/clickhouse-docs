---
description: 'Как собрать ClickHouse и запустить бенчмарк с кодеком DEFLATE_QPL'
sidebar_label: 'Сборка и Бенчмарк DEFLATE_QPL'
sidebar_position: 73
slug: /development/building_and_benchmarking_deflate_qpl
title: 'Собрать ClickHouse с DEFLATE_QPL'
---


# Собрать ClickHouse с DEFLATE_QPL

- Убедитесь, что ваша хост-машина соответствует требованиям QPL [предварительные условия](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#prerequisites)
- deflate_qpl включен по умолчанию во время сборки cmake. В случае если вы случайно изменили это, пожалуйста, дважды проверьте флаг сборки: ENABLE_QPL=1

- Для общих требований, пожалуйста, обратитесь к общим [инструкциям по сборке ClickHouse](/development/build.md)


# Запустить бенчмарк с DEFLATE_QPL

## Список файлов {#files-list}

Папка `benchmark_sample` под [qpl-cmake](https://github.com/ClickHouse/ClickHouse/tree/master/contrib/qpl-cmake) предоставляет пример для запуска бенчмарка с помощью python-скриптов:

`client_scripts` содержит python-скрипты для выполнения типичного бенчмарка, например:
- `client_stressing_test.py`: скрипт на python для стресс-тестирования запросов с [1~4] экземплярами сервера.
- `queries_ssb.sql`: файл, в котором перечислены все запросы для [Star Schema Benchmark](/getting-started/example-datasets/star-schema/)
- `allin1_ssb.sh`: Этот скрипт оболочки автоматически выполняет весь рабочий процесс бенчмарка.

`database_files` означает, что он будет хранить файлы базы данных согласно кодекам lz4/deflate/zstd.

## Запустить бенчмарк автоматически для Star Schema: {#run-benchmark-automatically-for-star-schema}

```bash
$ cd ./benchmark_sample/client_scripts
$ sh run_ssb.sh
```

После завершения, пожалуйста, проверьте все результаты в этой папке:`./output/`

В случае сбоя, пожалуйста, вручную запустите бенчмарк в следующих разделах.

## Определение {#definition}

[CLICKHOUSE_EXE] означает путь к исполняемой программе clickhouse.

## Окружение {#environment}

- CPU: Sapphire Rapid
- Требования к ОС смотрите в [Системные требования для QPL](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#system-requirements)
- Установка IAA смотрите в [Конфигурация ускорителей](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration)
- Установите модули python:

```bash
pip3 install clickhouse_driver numpy
```

[Самопроверка для IAA]

```bash
$ accel-config list | grep -P 'iax|state'
```

Ожидаемый вывод будет таким:
```bash
    "dev":"iax1",
    "state":"enabled",
            "state":"enabled",
```

Если вы не видите никакого вывода, это означает, что IAA не готова к работе. Пожалуйста, проверьте установку IAA снова.

## Генерация сырых данных {#generate-raw-data}

```bash
$ cd ./benchmark_sample
$ mkdir rawdata_dir && cd rawdata_dir
```

Используйте [`dbgen`](/getting-started/example-datasets/star-schema) для генерации данных объемом 100 миллионов строк с параметрами:
-s 20

Ожидается, что файлы, такие как `*.tbl`, будут находиться в `./benchmark_sample/rawdata_dir/ssb-dbgen`:

## Настройка базы данных {#database-setup}

Настройка базы данных с кодеком LZ4

```bash
$ cd ./database_dir/lz4
$ [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

Здесь вы должны увидеть сообщение `Подключено к серверу ClickHouse` в консоли, что означает, что клиент успешно установил соединение с сервером.

Завершите три шага, упомянутые в [Star Schema Benchmark](/getting-started/example-datasets/star-schema)
- Создание таблиц в ClickHouse
- Вставка данных. Здесь следует использовать `./benchmark_sample/rawdata_dir/ssb-dbgen/*.tbl` в качестве входных данных.
- Преобразование "звездной схемы" в денормализованную "плоскую схему"

Настройка базы данных с кодеком IAA Deflate

```bash
$ cd ./database_dir/deflate
$ [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
Завершите три шага так же, как и для lz4 выше.

Настройка базы данных с кодеком ZSTD

```bash
$ cd ./database_dir/zstd
$ [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
Завершите три шага так же, как и для lz4 выше.

[самопроверка]
Для каждого кодека (lz4/zstd/deflate) выполните следующий запрос, чтобы убедиться, что базы данных были успешно созданы:
```sql
select count() from lineorder_flat
```
Ожидаемый вывод будет таким:
```sql
┌───count()─┐
│ 119994608 │
└───────────┘
```
[Самопроверка для кодека IAA Deflate]

При первом выполнении вставки или запроса из клиента ожидается, что консоль сервера clickhouse напечатает этот лог:
```text
Кодек DeflateQpl с аппаратным ускорением готов!
```
Если вы никогда не найдете это, но увидите другой лог, как ниже:
```text
Инициализация кодека DeflateQpl с аппаратным ускорением завершилась неудачно
```
Это означает, что устройства IAA не готовы, вам нужно проверить установку IAA снова.

## Бенчмарк с одним экземпляром {#benchmark-with-single-instance}

- Прежде чем начать бенчмарк, пожалуйста, отключите C6 и установите губернатор частоты CPU на `performance`

```bash
$ cpupower idle-set -d 3
$ cpupower frequency-set -g performance
```

- Чтобы исключить влияние памяти на многопоточность, мы используем `numactl` для привязки сервера к одному сокету, а клиента к другому сокету.
- Один экземпляр означает один сервер, подключенный к одному клиенту.

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

Теперь три лога должны быть выведены как ожидается:
```text
lz4.log
deflate.log
zstd.log
```

Как проверить метрики производительности:

Мы сосредоточимся на QPS, пожалуйста, ищите ключевое слово: `QPS_Final` и собирайте статистику.

## Бенчмарк с несколькими экземплярами {#benchmark-with-multi-instances}

- Чтобы уменьшить влияние малой памяти на слишком большое количество потоков, мы рекомендуем запускать бенчмарк с несколькими экземплярами.
- Множественный экземпляр означает несколько (2 или 4) серверов, подключенных к соответствующему клиенту.
- Ядра одного сокета необходимо разделить поровну и назначить их серверам соответственно.
- Для нескольких экземпляров необходимо создать новую папку для каждого кодека и вставить набор данных, следуя аналогичным шагам, как и для одного экземпляра.

Есть 2 отличия:
- Для клиентской стороны вам нужно запустить clickhouse с назначенным портом во время создания таблицы и вставки данных.
- Для серверной стороны вам нужно запустить clickhouse с конкретным xml конфигурационным файлом, в котором был назначен порт. Все настраиваемые xml конфигурационные файлы для нескольких экземпляров представлены в ./server_config.

Здесь мы предполагаем, что есть 60 ядер на сокет и берем 2 экземпляра в качестве примера.
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

- [TBL_FILE_NAME] представляет имя файла, названного регулярным выражением: *. tbl в папке `./benchmark_sample/rawdata_dir/ssb-dbgen`.
- `--port=9001` означает назначенный порт для экземпляра сервера, который также определен в config_lz4_s2.xml/config_zstd_s2.xml/config_deflate_s2.xml. Для еще большего количества экземпляров вам нужно заменить его значением: 9002/9003, что соответствует экземплярам s3/s4 соответственно. Если вы не назначаете его, порт по умолчанию 9000, который уже используется первым экземпляром.

Бенчмаркинг с 2 экземплярами

LZ4:

```bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./database_dir/lz4_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_lz4_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > lz4_2insts.log
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

Здесь последний аргумент: `2` в client_stressing_test.py обозначает количество экземпляров. Для большего количества экземпляров вам нужно заменить его значением: 3 или 4. Этот скрипт поддерживает до 4 экземпляров.

Теперь три лога должны быть выведены как ожидается:

```text
lz4_2insts.log
deflate_2insts.log
zstd_2insts.log
```
Как проверить метрики производительности:

Мы сосредоточимся на QPS, пожалуйста, ищите ключевое слово: `QPS_Final` и собирайте статистику.

Настройка бенчмарка для 4 экземпляров аналогична настройке для 2 экземпляров выше.
Мы рекомендуем использовать данные бенчмарка для 2 экземпляров в качестве окончательного отчета для обзора.

## Советы {#tips}

Каждый раз перед запуском нового сервера clickhouse, пожалуйста, убедитесь, что нет запущенных процессов clickhouse в фоновом режиме, проверьте и завершите старые:

```bash
$ ps -aux| grep clickhouse
$ kill -9 [PID]
```
Сравнив список запросов в ./client_scripts/queries_ssb.sql с официальным [Star Schema Benchmark](/getting-started/example-datasets/star-schema), вы обнаружите, что 3 запроса не входят: Q1.2/Q1.3/Q3.4. Это связано с тем, что использование ЦПУ% очень низкое < 10% для этих запросов, что означает, что не удается продемонстрировать различия в производительности.
