---
description: 'Как собрать ClickHouse и запустить бенчмарк с кодеком DEFLATE_QPL'
sidebar_label: 'Сборка и тестирование DEFLATE_QPL'
sidebar_position: 73
slug: /development/building_and_benchmarking_deflate_qpl
title: 'Сборка ClickHouse с DEFLATE_QPL'
---


# Сборка ClickHouse с DEFLATE_QPL

- Убедитесь, что ваша хост-машина соответствует требованиям [пререквизитов](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#prerequisites) для QPL.
- Кодек deflate_qpl включен по умолчанию во время сборки с помощью cmake. Если вы по ошибке изменили это, пожалуйста, дважды проверьте флаг сборки: ENABLE_QPL=1.

- Для общих требований смотрите общие [инструкции по сборке ClickHouse](/development/build.md).


# Запуск бенчмарка с DEFLATE_QPL

## Список файлов {#files-list}

Папки `benchmark_sample` в [qpl-cmake](https://github.com/ClickHouse/ClickHouse/tree/master/contrib/qpl-cmake) содержат примеры запуска бенчмарка с помощью python-скриптов:

`client_scripts` содержит python-скрипты для выполнения типичного бенчмарка, например:
- `client_stressing_test.py`: Python-скрипт для стресстеста запросов с [1~4] экземплярами сервера.
- `queries_ssb.sql`: Файл, в котором перечислены все запросы для [Star Schema Benchmark](/getting-started/example-datasets/star-schema/).
- `allin1_ssb.sh`: Этот shell-скрипт автоматически выполняет процесс бенчмарка всё в одном.

`database_files` означает, что он будет хранить файлы базы данных в соответствии с кодеками lz4/deflate/zstd.

## Автоматический запуск бенчмарка для Star Schema: {#run-benchmark-automatically-for-star-schema}

```bash
$ cd ./benchmark_sample/client_scripts
$ sh run_ssb.sh
```

После завершения проверьте все результаты в этой папке: `./output/`

В случае возникновения ошибки, пожалуйста, запустите бенчмарк вручную, как описано в нижеследующих разделах.

## Определение {#definition}

[CLICKHOUSE_EXE] означает путь к исполняемой программе ClickHouse.

## Среда {#environment}

- CPU: Sapphire Rapid
- Системные требования см. в [Системные требования для QPL](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#system-requirements).
- Настройка IAA смотрите в [Конфигурация акселератора](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration).
- Установите модули python:

```bash
pip3 install clickhouse_driver numpy
```

[Самопроверка для IAA]

```bash
$ accel-config list | grep -P 'iax|state'
```

Ожидаемый вывод должен выглядеть следующим образом:
```bash
    "dev":"iax1",
    "state":"enabled",
            "state":"enabled",
```

Если вы не видите никаких выводов, это означает, что IAA не готов к работе. Пожалуйста, ещё раз проверьте настройки IAA.

## Генерация исходных данных {#generate-raw-data}

```bash
$ cd ./benchmark_sample
$ mkdir rawdata_dir && cd rawdata_dir
```

Используйте [`dbgen`](/getting-started/example-datasets/star-schema), чтобы сгенерировать 100 миллионов строк данных с параметрами:
-s 20

Файлы как `*.tbl` ожидаются на выходе в `./benchmark_sample/rawdata_dir/ssb-dbgen`:

## Настройка базы данных {#database-setup}

Настройте базу данных с кодеком LZ4

```bash
$ cd ./database_dir/lz4
$ [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

Теперь вы должны увидеть сообщение `Connected to ClickHouse server` в консоли, что означает успешное подключение клиента к серверу.

Завершите нижеуказанные три шага, упомянутые в [Star Schema Benchmark](/getting-started/example-datasets/star-schema):
- Создание таблиц в ClickHouse.
- Вставка данных. Здесь используйте `./benchmark_sample/rawdata_dir/ssb-dbgen/*.tbl` в качестве входных данных.
- Преобразование "звёздной схемы" в денормализованную "плоскую схему".

Настройте базу данных с кодеком IAA Deflate

```bash
$ cd ./database_dir/deflate
$ [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
Завершите три шага так же, как для lz4, выше.

Настройте базу данных с кодеком ZSTD

```bash
$ cd ./database_dir/zstd
$ [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
Завершите три шага так же, как для lz4, выше.

[самопроверка]
Для каждого кодека (lz4/zstd/deflate) выполните следующий запрос, чтобы убедиться, что базы данных созданы успешно:
```sql
select count() from lineorder_flat
```
Вы ожидаете увидеть следующий вывод:
```sql
┌───count()─┐
│ 119994608 │
└───────────┘
```
[Самопроверка для кодека IAA Deflate]

При первом выполнении вставки или запроса из клиента, консоль сервера ClickHouse ожидается вывести этот лог:
```text
Hardware-assisted DeflateQpl codec is ready!
```
Если вы не увидели этого, а вместо этого видите другой лог:
```text
Initialization of hardware-assisted DeflateQpl codec failed
```
Это означает, что устройства IAA не готовы, вам нужно повторно проверить настройки IAA.

## Бенчмарк с одним экземпляром {#benchmark-with-single-instance}

- Перед началом бенчмарка отключите C6 и установите режим частоты процессора на `performance`.

```bash
$ cpupower idle-set -d 3
$ cpupower frequency-set -g performance
```

- Чтобы устранить влияние памяти на множество потоков, мы используем `numactl`, чтобы привязать сервер к одному сокету, а клиент к другому сокету.
- Один экземпляр означает одиночный сервер, подключенный к одному клиенту.

Теперь выполните бенчмарк для LZ4/Deflate/ZSTD соответственно:

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

Теперь три лога должны быть выводимы как ожидалось:
```text
lz4.log
deflate.log
zstd.log
```

Как проверить метрики производительности:

Мы сосредоточены на QPS, пожалуйста, ищите ключевое слово: `QPS_Final` и собирайте статистику.

## Бенчмарк с множеством экземпляров {#benchmark-with-multi-instances}

- Чтобы уменьшить влияние памяти на слишком большое количество потоков, мы рекомендуем запускать бенчмарк с несколькими экземплярами.
- Множественный экземпляр означает несколько (2 или 4) серверов, подключенных к соответствующим клиентам.
- Ядра одного сокета необходимо равномерно распределить и назначить серверам соответственно.
- Для многопоточности необходимо создать новую папку для каждого кодека и вставить набор данных, следуя аналогичным шагам, как для одного экземпляра.

Существуют 2 отличия:
- Со стороны клиента вам нужно запускать ClickHouse с назначенным портом во время создания таблицы и вставки данных.
- Со стороны сервера вам нужно запускать ClickHouse с конкретным xml конфигурационным файлом, в котором был назначен порт. Все индивидуальные xml конфигурационные файлы для многопоточности были предоставлены в ./server_config.

Здесь мы предполагаем, что в каждом сокете 60 ядер и возьмем 2 экземпляра в качестве примера. 
Запустите сервер для первого экземпляра:
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

[Запуск сервера для второго экземпляра]

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

- [TBL_FILE_NAME] представляет имя файла, названного по регулярному выражению: *.tbl в `./benchmark_sample/rawdata_dir/ssb-dbgen`.
- `--port=9001` обозначает назначенный порт для экземпляра сервера, который также определен в config_lz4_s2.xml/config_zstd_s2.xml/config_deflate_s2.xml. Для ещё большего числа экземпляров вам нужно заменить его на значение: 9002/9003, которое соответствует s3/s4 экземплярa соответственно. Если вы не назначите его, порт по умолчанию 9000, который уже использовался первым экземпляром.

Бенчмарк с 2 экземплярами

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

IAA deflate:

```bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./database_dir/deflate_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > deflate_2insts.log
```

Последний аргумент: `2` в client_stressing_test.py обозначает количество экземпляров. Для большего числа экземпляров вам нужно заменить его на значение: 3 или 4. Этот скрипт поддерживает до 4 экземпляров.

Теперь три лога должны быть выведены как ожидалось:

```text
lz4_2insts.log
deflate_2insts.log
zstd_2insts.log
```

Как проверить метрики производительности:

Мы сосредоточены на QPS, пожалуйста, ищите ключевое слово: `QPS_Final` и собирайте статистику.

Настройка бенчмарка для 4 экземпляров аналогична вышеописанной для 2 экземпляров.
Мы рекомендуем использовать данные бенчмарка с 2 экземплярами как окончательный отчет для проверки.

## Советы {#tips}

Каждый раз перед запуском нового сервера ClickHouse, пожалуйста, убедитесь, что не работают фоновые процессы ClickHouse, проверьте и завершите старые:

```bash
$ ps -aux| grep clickhouse
$ kill -9 [PID]
```

Сравнивая список запросов в ./client_scripts/queries_ssb.sql с официальным [Star Schema Benchmark](/getting-started/example-datasets/star-schema), вы заметите, что 3 запроса не включены: Q1.2/Q1.3/Q3.4. Это связано с тем, что % использования CPU очень низок < 10% для этих запросов, что означает, что они не могут продемонстрировать различия в производительности.
