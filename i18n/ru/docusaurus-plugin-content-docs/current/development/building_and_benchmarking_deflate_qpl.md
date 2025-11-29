---
description: 'Как собрать ClickHouse и запустить бенчмарк с кодеком DEFLATE_QPL'
sidebar_label: 'Сборка и тестирование DEFLATE_QPL'
sidebar_position: 73
slug: /development/building_and_benchmarking_deflate_qpl
title: 'Сборка ClickHouse с DEFLATE_QPL'
doc_type: 'guide'
---



# Сборка ClickHouse с DEFLATE_QPL {#build-clickhouse-with-deflate_qpl}

- Убедитесь, что ваша хост-система удовлетворяет требуемым для QPL [предварительным требованиям](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#prerequisites)
- deflate_qpl включён по умолчанию при сборке с помощью CMake. Если вы случайно изменили это, пожалуйста, проверьте флаг сборки: ENABLE_QPL=1

- Для общих требований обратитесь к общим [инструкциям по сборке](/development/build.md) ClickHouse



# Запуск бенчмарка с DEFLATE_QPL {#run-benchmark-with-deflate_qpl}



## Список файлов {#files-list}

Папки `benchmark_sample` в составе [qpl-cmake](https://github.com/ClickHouse/ClickHouse/tree/master/contrib/qpl-cmake) содержат примеры запуска бенчмарка с помощью Python-скриптов:

`client_scripts` содержит Python-скрипты для запуска типичного бенчмарка, например:
- `client_stressing_test.py`: Python-скрипт для стресс‑тестирования запросов с 1–4 экземплярами сервера.
- `queries_ssb.sql`: файл, в котором перечислены все запросы для [Star Schema Benchmark](/getting-started/example-datasets/star-schema/).
- `allin1_ssb.sh`: shell-скрипт, который автоматически выполняет весь процесс бенчмарка «all in one».

`database_files` означает, что там будут храниться файлы базы данных в соответствии с кодеками lz4/deflate/zstd.



## Автоматический запуск бенчмарка для схемы «звезда»: {#run-benchmark-automatically-for-star-schema}

```bash
$ cd ./benchmark_sample/client_scripts
$ sh run_ssb.sh
```

После завершения выполнения проверьте все результаты в этой папке: `./output/`

Если возникнет ошибка, запустите бенчмарк вручную, как описано в разделах ниже.


## Определение {#definition}

[CLICKHOUSE_EXE] — это путь к исполняемому файлу ClickHouse.



## Среда {#environment}

* CPU: Sapphire Rapids
* Требования к ОС см. раздел [System Requirements for QPL](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#system-requirements)
* Настройку IAA см. раздел [Accelerator Configuration](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration)
* Установите модули Python:

```bash
pip3 install clickhouse_driver numpy
```

[Самопроверка IAA]

```bash
$ accel-config list | grep -P 'iax|state'
```

Ожидаемый результат будет выглядеть следующим образом:

```bash
    "dev":"iax1",
    "state":"включен",
            "state":"включен",
```

Если вывода нет, это означает, что IAA еще не готов к работе. Пожалуйста, проверьте настройку IAA.


## Генерация необработанных данных {#generate-raw-data}

```bash
$ cd ./benchmark_sample
$ mkdir rawdata_dir && cd rawdata_dir
```

Используйте [`dbgen`](/getting-started/example-datasets/star-schema) для генерации набора данных объемом 100 миллионов строк с параметром:
-s 20

Файлы с расширением `*.tbl` должны быть сгенерированы в каталоге `./benchmark_sample/rawdata_dir/ssb-dbgen`:


## Настройка базы данных {#database-setup}

Настройте базу данных с использованием кодека LZ4

```bash
$ cd ./database_dir/lz4
$ [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

В консоли должно появиться сообщение `Connected to ClickHouse server`, что означает, что клиент успешно установил соединение с сервером.

Выполните три шага, указанные в [Star Schema Benchmark](/getting-started/example-datasets/star-schema):

* Создайте таблицы в ClickHouse
* Вставьте данные. Для этого используйте `./benchmark_sample/rawdata_dir/ssb-dbgen/*.tbl` в качестве входных данных.
* Преобразуйте «звёздную схему» в денормализованную «плоскую схему»

Настройте базу данных с кодеком IAA Deflate

```bash
$ cd ./database_dir/deflate
$ [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

Выполните те же три шага, что и для lz4, описанных выше

Настройте базу данных с кодеком ZSTD

```bash
$ cd ./database_dir/zstd
$ [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

Выполните три шага так же, как для lz4 выше

[self-check]
Для каждого кодека (lz4/zstd/deflate) выполните следующий запрос, чтобы убедиться, что базы данных созданы успешно:

```sql
SELECT count() FROM lineorder_flat
```

Вы должны увидеть следующий результат:

```sql
┌───count()─┐
│ 119994608 │
└───────────┘
```

[Самопроверка кодека IAA Deflate]

При первом выполнении операции вставки или запроса с клиента в консоли сервера ClickHouse должно появиться следующее сообщение в логе:

```text
Аппаратно-ускоренный кодек DeflateQpl готов!
```

Если это сообщение так и не появится, но вы увидите другую запись лога, как показано ниже:

```text
Не удалось инициализировать аппаратно-ускоренный кодек DeflateQpl
```

Это означает, что устройства IAA не готовы; вам нужно заново проверить их настройку.


## Тестирование производительности с одним экземпляром {#benchmark-with-single-instance}

* Перед началом бенчмарка отключите режим C6 и переведите регулятор частоты CPU в режим `performance`

```bash
$ cpupower idle-set -d 3
$ cpupower frequency-set -g performance
```

* Чтобы устранить влияние ограничений пропускной способности памяти между NUMA‑сокетами, мы используем `numactl`, чтобы привязать сервер к одному сокету, а клиент — к другому.
* Под одиночным экземпляром подразумевается один сервер, подключенный к одному клиенту.

Теперь запустите бенчмарк для LZ4/Deflate/ZSTD соответственно:

LZ4:

```bash
$ cd ./database_dir/lz4 
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > lz4.log
```

Сжатие IAA (deflate):

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

Теперь должны выводиться три лога, как и ожидалось:

```text
lz4.log
deflate.log
zstd.log
```

Как проверить метрики производительности:

Нас интересует показатель QPS. Найдите по ключевому слову `QPS_Final` и соберите статистику.


## Тестирование производительности с несколькими инстансами {#benchmark-with-multi-instances}

* Чтобы снизить влияние ограничений по памяти при использовании слишком большого числа потоков, мы рекомендуем запускать тестирование производительности с несколькими инстансами.
* Конфигурация с несколькими инстансами означает использование нескольких (2 или 4) серверов, каждый из которых подключён к своему клиенту.
* Ядра одного сокета должны быть поровну разделены и соответственно закреплены за серверами.
* Для конфигурации с несколькими инстансами необходимо создать отдельную папку для каждого кодека и загрузить в неё набор данных, следуя шагам, аналогичным запуску с одним инстансом.

Есть 2 отличия:

* На стороне клиента вам нужно запускать ClickHouse с назначенным портом при создании таблицы и вставке данных.
* На стороне сервера вам нужно запускать ClickHouse с определённым xml-файлом конфигурации, в котором уже назначен порт. Все пользовательские xml-файлы конфигурации для нескольких инстансов находятся в ./server&#95;config.

Здесь мы предполагаем, что на один сокет приходится 60 ядер и в качестве примера берём 2 инстанса.
Запуск сервера для первого инстанса
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

Сжатие IAA Deflate:

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

Создание таблиц и загрузка данных для второго экземпляра

Создание таблиц:

```bash
$ [CLICKHOUSE_EXE] client -m --port=9001 
```

Вставка данных:

```bash
$ [CLICKHOUSE_EXE] client --query "INSERT INTO [TBL_FILE_NAME] FORMAT CSV" < [TBL_FILE_NAME].tbl  --port=9001
```

* [TBL&#95;FILE&#95;NAME] обозначает имя файла, соответствующее регулярному выражению `*.tbl` в каталоге `./benchmark_sample/rawdata_dir/ssb-dbgen`.
* `--port=9001` — порт, назначенный экземпляру сервера, который также задан в config&#95;lz4&#95;s2.xml/config&#95;zstd&#95;s2.xml/config&#95;deflate&#95;s2.xml. Для дополнительных экземпляров его нужно заменить на значение 9002/9003, которые соответствуют экземплярам s3/s4 соответственно. Если вы его не укажете, по умолчанию будет использоваться порт 9000, который уже занят первым экземпляром.

Тестирование производительности с двумя экземплярами

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

Здесь последний аргумент `2` в client&#95;stressing&#95;test.py обозначает количество экземпляров. Для большего числа экземпляров нужно заменить его на значение 3 или 4. Этот скрипт поддерживает до 4 экземпляров.

Теперь три лога должны быть выведены, как ожидается:

```text
lz4_2insts.log
deflate_2insts.log
zstd_2insts.log
```

Как проверить метрики производительности:

Мы фокусируемся на QPS, найдите ключевое слово `QPS_Final` и соберите статистику.

Конфигурация бенчмарка для 4 инстансов аналогична конфигурации для 2 инстансов выше.
Мы рекомендуем использовать данные бенчмарка для 2 инстансов в качестве итогового отчёта для рассмотрения.


## Советы {#tips}

Каждый раз перед запуском нового сервера ClickHouse убедитесь, что не осталось запущенных фоновых процессов ClickHouse; при необходимости найдите и завершите старые процессы:

```bash
$ ps -aux| grep clickhouse
$ kill -9 [PID]
```

Сравнив список запросов в ./client&#95;scripts/queries&#95;ssb.sql с официальным [Star Schema Benchmark](/getting-started/example-datasets/star-schema), вы увидите, что три запроса отсутствуют: Q1.2/Q1.3/Q3.4. Это связано с тем, что загрузка CPU для этих запросов очень низкая — менее 10 %, поэтому на них нельзя продемонстрировать различия в производительности.
