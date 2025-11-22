---
description: 'Как собрать ClickHouse и запустить тест производительности с кодеком DEFLATE_QPL'
sidebar_label: 'Сборка и тестирование DEFLATE_QPL'
sidebar_position: 73
slug: /development/building_and_benchmarking_deflate_qpl
title: 'Сборка ClickHouse с DEFLATE_QPL'
doc_type: 'guide'
---



# Сборка ClickHouse с DEFLATE_QPL

- Убедитесь, что ваша хост‑машина соответствует [предварительным требованиям](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#prerequisites), необходимым для QPL.
- deflate_qpl включён по умолчанию при сборке с помощью CMake. Если вы случайно изменили этот параметр, перепроверьте флаг сборки: ENABLE_QPL=1.

- Общие требования описаны в стандартных [инструкциях по сборке](/development/build.md) ClickHouse.



# Запуск бенчмарка с использованием DEFLATE_QPL



## Список файлов {#files-list}

Папки `benchmark_sample` в [qpl-cmake](https://github.com/ClickHouse/ClickHouse/tree/master/contrib/qpl-cmake) содержат примеры запуска бенчмарков с помощью Python-скриптов:

`client_scripts` содержит Python-скрипты для запуска типовых бенчмарков, например:

- `client_stressing_test.py`: Python-скрипт для нагрузочного тестирования запросов с использованием [1~4] экземпляров сервера.
- `queries_ssb.sql`: Файл со всеми запросами для [Star Schema Benchmark](/getting-started/example-datasets/star-schema/)
- `allin1_ssb.sh`: Shell-скрипт для автоматического выполнения всего процесса бенчмарка.

`database_files` — папка для хранения файлов базы данных в соответствии с кодеками lz4/deflate/zstd.


## Автоматический запуск бенчмарка для схемы «звезда»: {#run-benchmark-automatically-for-star-schema}

```bash
$ cd ./benchmark_sample/client_scripts
$ sh run_ssb.sh
```

После завершения проверьте все результаты в папке: `./output/`

В случае ошибки запустите бенчмарк вручную, как описано в разделах ниже.


## Определение {#definition}

[CLICKHOUSE_EXE] означает путь к исполняемому файлу ClickHouse.


## Окружение {#environment}

- CPU: Sapphire Rapid
- Требования к ОС см. в разделе [Системные требования для QPL](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#system-requirements)
- Настройка IAA см. в разделе [Конфигурация акселератора](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration)
- Установите модули Python:

```bash
pip3 install clickhouse_driver numpy
```

[Самопроверка IAA]

```bash
$ accel-config list | grep -P 'iax|state'
```

Ожидаемый вывод:

```bash
    "dev":"iax1",
    "state":"enabled",
            "state":"enabled",
```

Если вывод отсутствует, это означает, что IAA не готов к работе. Проверьте настройку IAA еще раз.


## Генерация исходных данных {#generate-raw-data}

```bash
$ cd ./benchmark_sample
$ mkdir rawdata_dir && cd rawdata_dir
```

Используйте [`dbgen`](/getting-started/example-datasets/star-schema) для генерации данных из 100 миллионов строк с параметром:
-s 20

Файлы с расширением `*.tbl` должны быть созданы в директории `./benchmark_sample/rawdata_dir/ssb-dbgen`:


## Настройка базы данных {#database-setup}

Настройте базу данных с кодеком LZ4

```bash
$ cd ./database_dir/lz4
$ [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

В консоли должно появиться сообщение `Connected to ClickHouse server`, что означает успешное установление соединения клиента с сервером.

Выполните три шага, описанные в разделе [Star Schema Benchmark](/getting-started/example-datasets/star-schema)

- Создание таблиц в ClickHouse
- Вставка данных. В качестве входных данных используйте `./benchmark_sample/rawdata_dir/ssb-dbgen/*.tbl`.
- Преобразование схемы «звезда» в денормализованную «плоскую схему»

Настройте базу данных с кодеком IAA Deflate

```bash
$ cd ./database_dir/deflate
$ [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

Выполните те же три шага, что и для lz4 выше

Настройте базу данных с кодеком ZSTD

```bash
$ cd ./database_dir/zstd
$ [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

Выполните те же три шага, что и для lz4 выше

[самопроверка]
Для каждого кодека (lz4/zstd/deflate) выполните следующий запрос, чтобы убедиться в успешном создании баз данных:

```sql
SELECT count() FROM lineorder_flat
```

Ожидаемый результат:

```sql
┌───count()─┐
│ 119994608 │
└───────────┘
```

[Самопроверка для кодека IAA Deflate]

При первом выполнении вставки или запроса из клиента в консоли сервера ClickHouse должна появиться следующая запись в логе:

```text
Hardware-assisted DeflateQpl codec is ready!
```

Если эта запись не появляется, но вместо неё отображается следующее сообщение:

```text
Initialization of hardware-assisted DeflateQpl codec failed
```

Это означает, что устройства IAA не готовы, необходимо повторно проверить настройку IAA.


## Тестирование производительности с одним экземпляром {#benchmark-with-single-instance}

- Перед началом тестирования отключите C6 и установите регулятор частоты процессора в режим `performance`

```bash
$ cpupower idle-set -d 3
$ cpupower frequency-set -g performance
```

- Чтобы исключить влияние ограничений памяти при работе между сокетами, используйте `numactl` для привязки сервера к одному сокету, а клиента — к другому.
- Одиночный экземпляр означает один сервер, подключенный к одному клиенту

Теперь запустите тестирование производительности для LZ4/Deflate/ZSTD соответственно:

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

Теперь должны быть созданы три файла журналов:

```text
lz4.log
deflate.log
zstd.log
```

Как проверить метрики производительности:

Основное внимание уделяется QPS, найдите ключевое слово `QPS_Final` и соберите статистику


## Тестирование производительности с несколькими экземплярами {#benchmark-with-multi-instances}

- Для снижения влияния ограничений памяти при использовании большого количества потоков рекомендуется запускать тестирование производительности с несколькими экземплярами.
- Несколько экземпляров означает использование нескольких (2 или 4) серверов, подключенных к соответствующим клиентам.
- Ядра одного сокета необходимо разделить поровну и распределить между серверами.
- При использовании нескольких экземпляров необходимо создать отдельную папку для каждого кодека и загрузить набор данных, следуя тем же шагам, что и для одного экземпляра.

Существует 2 отличия:

- На стороне клиента необходимо запускать ClickHouse с указанием назначенного порта при создании таблиц и загрузке данных.
- На стороне сервера необходимо запускать ClickHouse с указанием конкретного XML-файла конфигурации, в котором задан порт. Все настроенные XML-файлы конфигурации для нескольких экземпляров находятся в каталоге ./server_config.

Здесь предполагается, что на один сокет приходится 60 ядер, и в качестве примера рассматриваются 2 экземпляра.
Запуск сервера для первого экземпляра
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

Создание таблиц и загрузка данных для второго экземпляра

Создание таблиц:

```bash
$ [CLICKHOUSE_EXE] client -m --port=9001
```

Загрузка данных:

```bash
$ [CLICKHOUSE_EXE] client --query "INSERT INTO [TBL_FILE_NAME] FORMAT CSV" < [TBL_FILE_NAME].tbl  --port=9001
```

- [TBL_FILE_NAME] представляет имя файла, соответствующего регулярному выражению: \*.tbl в каталоге `./benchmark_sample/rawdata_dir/ssb-dbgen`.
- `--port=9001` указывает назначенный порт для экземпляра сервера, который также определен в config_lz4_s2.xml/config_zstd_s2.xml/config_deflate_s2.xml. Для большего количества экземпляров необходимо заменить его значением 9002/9003, которые соответствуют экземплярам s3/s4. Если порт не указан, по умолчанию используется порт 9000, который уже занят первым экземпляром.

Тестирование производительности с 2 экземплярами

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

DEFLATE на IAA

```bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./database_dir/deflate_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > deflate_2insts.log
```

Здесь последний аргумент `2` в client&#95;stressing&#95;test.py обозначает количество экземпляров. Для большего количества экземпляров нужно заменить его на значение 3 или 4. Этот скрипт поддерживает до 4 экземпляров.

Теперь должны выводиться три лога, как и ожидалось:

```text
lz4_2insts.log
deflate_2insts.log
zstd_2insts.log
```

Как проверить метрики производительности:

Мы сосредотачиваемся на QPS: найдите ключевое слово `QPS_Final` и соберите статистику.

Конфигурация бенчмарка для 4 экземпляров аналогична конфигурации для 2 экземпляров, описанной выше.
Мы рекомендуем использовать данные бенчмарка для 2 экземпляров в качестве итогового отчёта для рассмотрения.


## Советы {#tips}

Перед каждым запуском нового сервера ClickHouse убедитесь, что фоновые процессы ClickHouse не запущены. Проверьте и завершите старые процессы:

```bash
$ ps -aux| grep clickhouse
$ kill -9 [PID]
```

При сравнении списка запросов в ./client_scripts/queries_ssb.sql с официальным [Star Schema Benchmark](/getting-started/example-datasets/star-schema) вы обнаружите, что 3 запроса не включены: Q1.2/Q1.3/Q3.4. Это связано с тем, что загрузка процессора для этих запросов очень низкая (< 10%), что не позволяет продемонстрировать различия в производительности.
