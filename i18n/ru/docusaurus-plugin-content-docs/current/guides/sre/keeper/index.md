---
slug: /guides/sre/keeper/clickhouse-keeper

sidebar_label: 'Настройка ClickHouse Keeper'
sidebar_position: 10
keywords: ['Keeper', 'ZooKeeper', 'clickhouse-keeper']
description: 'ClickHouse Keeper (clickhouse-keeper) заменяет ZooKeeper и обеспечивает репликацию и координацию.'
title: 'ClickHouse Keeper'
doc_type: 'guide'
---



# ClickHouse Keeper (clickhouse-keeper)

import SelfManaged from "@site/docs/_snippets/_self_managed_only_automated.md"

<SelfManaged />

ClickHouse Keeper предоставляет систему координации для [репликации](/engines/table-engines/mergetree-family/replication.md) данных и выполнения запросов [распределённого DDL](/sql-reference/distributed-ddl.md). ClickHouse Keeper совместим с ZooKeeper.

### Детали реализации {#implementation-details}

ZooKeeper — одна из первых известных систем координации с открытым исходным кодом. Она реализована на Java и имеет довольно простую и мощную модель данных. Алгоритм координации ZooKeeper, ZooKeeper Atomic Broadcast (ZAB), не предоставляет гарантий линеаризуемости для операций чтения, поскольку каждый узел ZooKeeper обрабатывает чтение локально. В отличие от ZooKeeper, ClickHouse Keeper написан на C++ и использует [реализацию](https://github.com/eBay/NuRaft) [алгоритма RAFT](https://raft.github.io/). Этот алгоритм обеспечивает линеаризуемость для операций чтения и записи и имеет несколько реализаций с открытым исходным кодом на разных языках.

По умолчанию ClickHouse Keeper предоставляет те же гарантии, что и ZooKeeper: линеаризуемые операции записи и нелинеаризуемые операции чтения. Он имеет совместимый клиент-серверный протокол, поэтому любой стандартный клиент ZooKeeper может использоваться для взаимодействия с ClickHouse Keeper. Снимки состояния и журналы имеют формат, несовместимый с ZooKeeper, но инструмент `clickhouse-keeper-converter` позволяет конвертировать данные ZooKeeper в снимки ClickHouse Keeper. Межсерверный протокол в ClickHouse Keeper также несовместим с ZooKeeper, поэтому смешанный кластер ZooKeeper / ClickHouse Keeper невозможен.

ClickHouse Keeper поддерживает списки контроля доступа (ACL) так же, как и [ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl). ClickHouse Keeper поддерживает тот же набор разрешений и имеет идентичные встроенные схемы: `world`, `auth` и `digest`. Схема аутентификации digest использует пару `username:password`, где пароль кодируется в Base64.

:::note
Внешние интеграции не поддерживаются.
:::

### Конфигурация {#configuration}

ClickHouse Keeper может использоваться как автономная замена ZooKeeper или как внутренний компонент сервера ClickHouse. В обоих случаях конфигурация представляет собой практически одинаковый файл `.xml`.

#### Настройки конфигурации Keeper {#keeper-configuration-settings}

Основной тег конфигурации ClickHouse Keeper — `<keeper_server>`, который имеет следующие параметры:


| Параметр                            | Описание                                                                                                                                                                                                                                            | Значение по умолчанию                                                                                        |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `tcp_port`                          | Порт для подключения клиента.                                                                                                                                                                                                                       | `2181`                                                                                                       |
| `tcp_port_secure`                   | Защищённый порт для SSL-соединения между клиентом и сервером keeper.                                                                                                                                                                                | -                                                                                                            |
| `server_id`                         | Уникальный идентификатор сервера. Каждый участник кластера ClickHouse Keeper должен иметь уникальный номер (1, 2, 3 и т. д.).                                                                                                                       | -                                                                                                            |
| `log_storage_path`                  | Путь к журналам координации. Как и в ZooKeeper, рекомендуется хранить журналы на незагруженных узлах.                                                                                                                                               | -                                                                                                            |
| `snapshot_storage_path`             | Путь к снимкам координации.                                                                                                                                                                                                                         | -                                                                                                            |
| `enable_reconfiguration`            | Включить динамическую реконфигурацию кластера через [`reconfig`](#reconfiguration).                                                                                                                                                                 | `False`                                                                                                      |
| `max_memory_usage_soft_limit`       | Мягкое ограничение в байтах на максимальное использование памяти keeper.                                                                                                                                                                            | `max_memory_usage_soft_limit_ratio` \* `physical_memory_amount`                                              |
| `max_memory_usage_soft_limit_ratio` | Если `max_memory_usage_soft_limit` не задан или равен нулю, это значение используется для определения мягкого ограничения по умолчанию.                                                                                                             | `0.9`                                                                                                        |
| `cgroups_memory_observer_wait_time` | Если `max_memory_usage_soft_limit` не задан или равен `0`, этот интервал используется для мониторинга объёма физической памяти. При изменении объёма памяти мягкое ограничение памяти Keeper пересчитывается с использованием `max_memory_usage_soft_limit_ratio`. | `15`                                                                                                         |
| `http_control`                      | Конфигурация интерфейса [HTTP control](#http-control).                                                                                                                                                                                              | -                                                                                                            |
| `digest_enabled`                    | Включить проверку согласованности данных в реальном времени                                                                                                                                                                                         | `True`                                                                                                       |
| `create_snapshot_on_exit`           | Создать снимок при завершении работы                                                                                                                                                                                                                | -                                                                                                            |
| `hostname_checks_enabled`           | Включить проверки корректности имён хостов для конфигурации кластера (например, если localhost используется с удалёнными конечными точками)                                                                                                         | `True`                                                                                                       |
| `four_letter_word_white_list`       | Белый список команд 4lw.                                                                                                                                                                                                                            | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |
| `enable_ipv6`                       | Включить IPv6                                                                                                                                                                                                                                       | `True`                                                                                                       |

Другие общие параметры наследуются из конфигурации сервера ClickHouse (`listen_host`, `logger` и т. д.).

#### Внутренние настройки координации {#internal-coordination-settings}

Внутренние настройки координации находятся в секции `<keeper_server>.<coordination_settings>` и имеют следующие параметры:


| Parameter                          | Description                                                                                                                                                                                                              | Default                                                                                                      |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`             | Таймаут для одной операции клиента (мс)                                                                                                                                                                                  | `10000`                                                                                                      |
| `min_session_timeout_ms`           | Минимальный таймаут сессии клиента (мс)                                                                                                                                                                                  | `10000`                                                                                                      |
| `session_timeout_ms`               | Максимальный таймаут сессии клиента (мс)                                                                                                                                                                                 | `100000`                                                                                                     |
| `dead_session_check_period_ms`     | Как часто ClickHouse Keeper проверяет «мертвые» сессии и удаляет их (мс)                                                                                                                                                 | `500`                                                                                                        |
| `heart_beat_interval_ms`           | Как часто лидер ClickHouse Keeper отправляет heartbeat-сообщения ведомым узлам (follower) (мс)                                                                                                                          | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`  | Если ведомый узел не получает heartbeat от лидера в течение этого интервала, он может инициировать выборы лидера. Значение должно быть меньше либо равно `election_timeout_upper_bound_ms`. В идеале они не должны совпадать. | `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`  | Если ведомый узел не получает heartbeat от лидера в течение этого интервала, он обязан инициировать выборы лидера.                                                                                                      | `2000`                                                                                                       |
| `rotate_log_storage_interval`      | Сколько записей лога хранить в одном файле.                                                                                                                                                                             | `100000`                                                                                                     |
| `reserved_log_items`               | Сколько записей журнала координации хранить до выполнения компактирования.                                                                                                                                              | `100000`                                                                                                     |
| `snapshot_distance`                | Как часто ClickHouse Keeper будет создавать новые снапшоты (в зависимости от количества записей в логах).                                                                                                               | `100000`                                                                                                     |
| `snapshots_to_keep`                | Сколько снапшотов сохранять.                                                                                                                                                                                             | `3`                                                                                                          |
| `stale_log_gap`                    | Порог, после которого лидер считает ведомый узел устаревшим и отправляет ему снапшот вместо логов.                                                                                                                      | `10000`                                                                                                      |
| `fresh_log_gap`                    | При каком числе записей узел снова считается «актуальным» (fresh).                                                                                                                                                      | `200`                                                                                                        |
| `max_requests_batch_size`          | Максимальный размер пакета по количеству запросов перед отправкой в RAFT.                                                                                                                                                | `100`                                                                                                        |
| `force_sync`                       | Вызывать `fsync` при каждой записи в журнал координации.                                                                                                                                                                | `true`                                                                                                       |
| `quorum_reads`                     | Выполнять запросы на чтение как операции записи через полный консенсус RAFT с сопоставимой скоростью.                                                                                                                  | `false`                                                                                                      |
| `raft_logs_level`                  | Уровень текстового логирования для координации (trace, debug и т. д.).                                                                                                                                                  | `system default`                                                                                             |
| `auto_forwarding`                  | Разрешить пересылку запросов на запись от ведомых узлов лидеру.                                                                                                                                                         | `true`                                                                                                       |
| `shutdown_timeout`                 | Время ожидания завершения внутренних подключений и остановки (мс).                                                                                                                                                      | `5000`                                                                                                       |
| `startup_timeout`                  | Если сервер не подключится к другим участникам кворума за указанный таймаут, он завершит работу (мс).                                                                                                                   | `30000`                                                                                                      |
| `async_replication`                | Включить асинхронную репликацию. Все гарантии для операций чтения и записи сохраняются, при этом достигается более высокая производительность. Параметр по умолчанию отключен, чтобы не нарушать обратную совместимость. | `false`                                                                                                      |
| `latest_logs_cache_size_threshold` | Максимальный суммарный размер кеша в памяти для последних записей лога                                                                                                                                                  | `1GiB`                                                                                                       |
| `commit_logs_cache_size_threshold` | Максимальный суммарный размер кеша в памяти для записей лога, необходимых для следующего коммита                                                                                                                        | `500MiB`                                                                                                     |
| `disk_move_retries_wait_ms`        | Как долго ждать между повторными попытками после сбоя, произошедшего при перемещении файла между дисками                                                                                                                | `1000`                                                                                                       |
| `disk_move_retries_during_init`    | Количество повторных попыток после сбоя, произошедшего при перемещении файла между дисками во время инициализации                                                                                                      | `100`                                                                                                        |
| `experimental_use_rocksdb`         | Использовать RocksDB как подсистему хранения (backend)                                                                                                                                                                  | `0`                                                                                                          |

Конфигурация кворума находится в секции `<keeper_server>.<raft_configuration>` и содержит описание серверов.

Единственный параметр для всего кворума — `secure`, который включает зашифрованное соединение для обмена данными между участниками кворума. Параметр можно установить в значение `true`, если для внутреннего взаимодействия между узлами требуется SSL‑соединение, либо не указывать его в противном случае.

Основные параметры для каждого `<server>`:



- `id` — Идентификатор сервера в кворуме.
- `hostname` — Имя хоста, на котором размещён сервер.
- `port` — Порт, на котором сервер прослушивает соединения.
- `can_become_leader` — Установите значение `false`, чтобы настроить сервер как `learner`. Если параметр не указан, значение по умолчанию — `true`.

:::note
При изменении топологии кластера ClickHouse Keeper (например, при замене сервера) убедитесь, что соответствие `server_id` и `hostname` остаётся согласованным, и избегайте перемешивания или повторного использования существующего `server_id` для других серверов (например, это может произойти при использовании скриптов автоматизации для развёртывания ClickHouse Keeper).

Если хост экземпляра Keeper может измениться, рекомендуется определить и использовать имя хоста вместо IP-адресов. Изменение имени хоста равносильно удалению и повторному добавлению сервера, что в некоторых случаях может быть невозможно (например, при недостаточном количестве экземпляров Keeper для кворума).
:::

:::note
`async_replication` по умолчанию отключена для сохранения обратной совместимости. Если все экземпляры Keeper в вашем кластере работают на версии, поддерживающей `async_replication` (v23.9+), рекомендуется включить её, так как это может улучшить производительность без каких-либо недостатков.
:::

Примеры конфигурации кворума с тремя узлами можно найти в [интеграционных тестах](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration) с префиксом `test_keeper_`. Пример конфигурации для сервера №1:

```xml
<keeper_server>
    <tcp_port>2181</tcp_port>
    <server_id>1</server_id>
    <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
    <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

    <coordination_settings>
        <operation_timeout_ms>10000</operation_timeout_ms>
        <session_timeout_ms>30000</session_timeout_ms>
        <raft_logs_level>trace</raft_logs_level>
    </coordination_settings>

    <raft_configuration>
        <server>
            <id>1</id>
            <hostname>zoo1</hostname>
            <port>9234</port>
        </server>
        <server>
            <id>2</id>
            <hostname>zoo2</hostname>
            <port>9234</port>
        </server>
        <server>
            <id>3</id>
            <hostname>zoo3</hostname>
            <port>9234</port>
        </server>
    </raft_configuration>
</keeper_server>
```

### Как запустить {#how-to-run}

ClickHouse Keeper входит в состав пакета сервера ClickHouse. Просто добавьте конфигурацию `<keeper_server>` в файл `/etc/your_path_to_config/clickhouse-server/config.xml` и запустите сервер ClickHouse как обычно. Если вы хотите запустить автономный ClickHouse Keeper, вы можете запустить его аналогичным образом:

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

Если у вас нет символической ссылки (`clickhouse-keeper`), вы можете создать её или указать `keeper` в качестве аргумента для `clickhouse`:

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```

### Четырёхбуквенные команды {#four-letter-word-commands}

ClickHouse Keeper также предоставляет 4lw-команды, которые практически идентичны командам Zookeeper. Каждая команда состоит из четырёх букв, таких как `mntr`, `stat` и т. д. Есть несколько особенно полезных команд: `stat` предоставляет общую информацию о сервере и подключённых клиентах, в то время как `srvr` и `cons` предоставляют расширенные сведения о сервере и соединениях соответственно.

Для 4lw-команд существует конфигурация белого списка `four_letter_word_white_list` со значением по умолчанию `conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld`.

Вы можете отправлять команды в ClickHouse Keeper через telnet или nc на клиентский порт.

```bash
echo mntr | nc localhost 9181
```

Ниже приведено подробное описание 4lw-команд:

- `ruok`: Проверяет, работает ли сервер в нормальном состоянии (без ошибок). Сервер ответит `imok`, если он работает. В противном случае ответа не будет. Ответ `imok` не обязательно означает, что сервер присоединился к кворуму, а лишь то, что процесс сервера активен и привязан к указанному клиентскому порту. Используйте команду "stat" для получения подробной информации о состоянии относительно кворума и информации о клиентских соединениях.

```response
imok
```


* `mntr`: Выводит список переменных, которые можно использовать для мониторинга работоспособности кластера.

```response
zk_version      v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
zk_avg_latency  0
zk_max_latency  0
zk_min_latency  0
zk_packets_received     68
zk_packets_sent 68
zk_num_alive_connections        1
zk_outstanding_requests 0
zk_server_state leader
zk_znode_count  4
zk_watch_count  1
zk_ephemerals_count     0
zk_approximate_data_size        723
zk_open_file_descriptor_count   310
zk_max_file_descriptor_count    10240
zk_followers    0
zk_synced_followers     0
```

* `srvr`: Выводит подробную информацию о сервере.

```response
ClickHouse Keeper версия: v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
Задержка мин/сред/макс: 0/0/0
Получено: 2
Отправлено: 2
Подключений: 1
Необработанных: 0
Zxid: 34
Режим: leader
Количество узлов: 4
```

* `stat`: Выводит краткую информацию о сервере и подключённых клиентах.

```response
ClickHouse Keeper version: v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
Клиенты:
 192.168.1.1:52852(recved=0,sent=0)
 192.168.1.1:52042(recved=24,sent=48)
Задержка мин/сред/макс: 0/0/0
Получено: 4
Отправлено: 4
Соединений: 1
Необработанных: 0
Zxid: 36
Режим: leader
Количество узлов: 4
```

* `srst`: Сброс статистики сервера. Команда повлияет на результаты команд `srvr`, `mntr` и `stat`.

```response
Статистика сервера сброшена.
```

* `conf`: Вывести подробную информацию о конфигурации сервиса.

```response
server_id=1
tcp_port=2181
four_letter_word_white_list=*
log_storage_path=./coordination/logs
snapshot_storage_path=./coordination/snapshots
max_requests_batch_size=100
session_timeout_ms=30000
operation_timeout_ms=10000
dead_session_check_period_ms=500
heart_beat_interval_ms=500
election_timeout_lower_bound_ms=1000
election_timeout_upper_bound_ms=2000
reserved_log_items=1000000000000000
snapshot_distance=10000
auto_forwarding=true
shutdown_timeout=5000
startup_timeout=240000
raft_logs_level=information
snapshots_to_keep=3
rotate_log_storage_interval=100000
stale_log_gap=10000
fresh_log_gap=200
max_requests_batch_size=100
quorum_reads=false
force_sync=false
compress_logs=true
compress_snapshots_with_zstd_format=true
configuration_change_tries_count=20
```

* `cons`: Вывести полные сведения о подключениях/сеансах для всех клиентов, подключённых к этому серверу. Включает информацию о количестве полученных/отправленных пакетов, идентификаторе сеанса, задержках операций, последней выполненной операции и т.д.

```response
 192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
 192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

* `crst`: Сброс статистики соединений/сеансов для всех подключений.

```response
Статистика подключений сброшена.
```

* `envi`: Вывести сведения о среде выполнения


```response
Environment:
clickhouse.keeper.version=v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
host.name=ZBMAC-C02D4054M.local
os.name=Darwin
os.arch=x86_64
os.version=19.6.0
cpu.count=12
user.name=root
user.home=/Users/JackyWoo/
user.dir=/Users/JackyWoo/project/jd/clickhouse/cmake-build-debug/programs/
user.tmp=/var/folders/b4/smbq5mfj7578f2jzwn602tt40000gn/T/
```

* `dirs`: Показывает общий размер файлов снапшотов и логов в байтах

```response
snapshot_dir_size: 0
log_dir_size: 3875
```

* `isro`: Проверяет, запущен ли сервер в режиме только для чтения. Сервер ответит `ro`, если он работает в режиме только для чтения, или `rw`, если нет.

```response
rw
```

* `wchs`: Выводит краткую информацию о вотчах сервера.

```response
1 соединение отслеживает 1 путь
Всего отслеживаний: 1
```

* `wchc`: Выводит подробную информацию о наблюдениях (`watches`) для сервера по сессиям. Результатом является список сессий (подключений) с соответствующими наблюдениями (путями). Обратите внимание: в зависимости от количества наблюдений эта операция может быть ресурсоёмкой и влиять на производительность сервера, поэтому используйте её осторожно.

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

* `wchp`: Выводит подробную информацию о наблюдениях (watches) для сервера по путям. Результатом является список путей (`znodes`) с соответствующими сессиями. Обратите внимание, что в зависимости от количества наблюдений эта операция может быть ресурсоёмкой (то есть влиять на производительность сервера), поэтому используйте её с осторожностью.

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

* `dump`: Выводит активные сеансы и эфемерные узлы. Работает только на лидере.

```response
Дамп сессий (2):
0x0000000000000001
0x0000000000000002
Сессии с эфемерными узлами (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

* `csnp`: Планирует задачу создания snapshot. Возвращает индекс последнего зафиксированного лога запланированного snapshot в случае успешного выполнения или `Failed to schedule snapshot creation task.` в случае ошибки. Обратите внимание, что команда `lgif` может помочь определить, завершено ли создание snapshot.

```response
100
```

* `lgif`: Информация журнала Keeper. `first_log_idx` : мой первый индекс записи в хранилище лога; `first_log_term` : мой первый термин лога; `last_log_idx` : мой последний индекс записи в хранилище лога; `last_log_term` : мой последний термин лога; `last_committed_log_idx` : мой последний зафиксированный индекс записи в машине состояний; `leader_committed_log_idx` : зафиксированный индекс записи лидера с моей точки зрения; `target_committed_log_idx` : целевой индекс записи, который должен быть зафиксирован; `last_snapshot_idx` : наибольший зафиксированный индекс записи в последнем снимке.

```response
first_log_idx   1
first_log_term  1
last_log_idx    101
last_log_term   1
last_committed_log_idx  100
leader_committed_log_idx    101
target_committed_log_idx    101
last_snapshot_idx   50
```

* `rqld`: Запрос на назначение нового лидера. Возвращает `Sent leadership request to leader.`, если запрос отправлен, или `Failed to send leadership request to leader.`, если запрос не отправлен. Обратите внимание, что если узел уже является лидером, результат будет таким же, как и в случае, когда запрос отправлен.

```response
Запрос на лидерство отправлен ведущему узлу.
```

* `ftfl`: Выводит список всех feature-флагов и показывает, включены ли они для экземпляра Keeper.

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

* `ydld`: Запрос на отказ от лидерства и переход в состояние `follower`. Если сервер, получающий запрос, является лидером, он сначала приостановит операции записи, дождётся, пока преемник (текущий лидер никогда не может быть преемником) завершит догон по последнему логу, а затем откажется от лидерства. Преемник будет выбран автоматически. Возвращает `Sent yield leadership request to leader.` если запрос отправлен, или `Failed to send yield leadership request to leader.` если запрос не отправлен. Обратите внимание, что если узел уже является `follower`, результат будет таким же, как если бы запрос был отправлен.

```response
Отправлен запрос на передачу лидерства лидеру.
```

* `pfev`: Возвращает значения для всех собранных событий. Для каждого события возвращает его имя, значение и описание.


```response
FileOpen        62      Количество открытых файлов.
Seek    4       Количество вызовов функции 'lseek'.
ReadBufferFromFileDescriptorRead        126     Количество операций чтения (read/pread) из файлового дескриптора. Не включает сокеты.
ReadBufferFromFileDescriptorReadFailed  0       Количество неудачных операций чтения (read/pread) из файлового дескриптора.
ReadBufferFromFileDescriptorReadBytes   178846  Количество байтов, прочитанных из файловых дескрипторов. Если файл сжат, отображается размер сжатых данных.
WriteBufferFromFileDescriptorWrite      7       Количество операций записи (write/pwrite) в файловый дескриптор. Не включает сокеты.
WriteBufferFromFileDescriptorWriteFailed        0       Количество неудачных операций записи (write/pwrite) в файловый дескриптор.
WriteBufferFromFileDescriptorWriteBytes 153     Количество байтов, записанных в файловые дескрипторы. Если файл сжат, отображается размер сжатых данных.
FileSync        2       Количество вызовов функции F_FULLFSYNC/fsync/fdatasync для файлов.
DirectorySync   0       Количество вызовов функции F_FULLFSYNC/fsync/fdatasync для каталогов.
FileSyncElapsedMicroseconds     12756   Общее время ожидания системного вызова F_FULLFSYNC/fsync/fdatasync для файлов.
DirectorySyncElapsedMicroseconds        0       Общее время ожидания системного вызова F_FULLFSYNC/fsync/fdatasync для каталогов.
ReadCompressedBytes     0       Количество байтов (до декомпрессии), прочитанных из сжатых источников (файлы, сеть).
CompressedReadBufferBlocks      0       Количество сжатых блоков (блоков данных, сжимаемых независимо друг от друга), прочитанных из сжатых источников (файлы, сеть).
CompressedReadBufferBytes       0       Количество несжатых байтов (после декомпрессии), прочитанных из сжатых источников (файлы, сеть).
AIOWrite        0       Количество операций записи через интерфейс AIO в Linux или FreeBSD
AIOWriteBytes   0       Количество байтов, записанных через интерфейс AIO в Linux или FreeBSD
...
```

### HTTP-управление {#http-control}

ClickHouse Keeper предоставляет HTTP-интерфейс для проверки готовности реплики принимать трафик. Может использоваться в облачных средах, таких как [Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes).

Пример конфигурации, включающей эндпоинт `/ready`:

```xml
<clickhouse>
    <keeper_server>
        <http_control>
            <port>9182</port>
            <readiness>
                <endpoint>/ready</endpoint>
            </readiness>
        </http_control>
    </keeper_server>
</clickhouse>
```

### Флаги функциональности {#feature-flags}

Keeper полностью совместим с ZooKeeper и его клиентами, но также предоставляет уникальные функции и типы запросов, которые могут использоваться клиентом ClickHouse.
Поскольку эти функции могут вносить обратно несовместимые изменения, большинство из них по умолчанию отключены и могут быть включены через конфигурацию `keeper_server.feature_flags`.
Все функции можно явно отключить.
Если вы хотите включить новую функцию для кластера Keeper, рекомендуется сначала обновить все экземпляры Keeper в кластере до версии, поддерживающей эту функцию, а затем включить саму функцию.

Пример конфигурации флагов функциональности, отключающей `multi_read` и включающей `check_not_exists`:

```xml
<clickhouse>
    <keeper_server>
        <feature_flags>
            <multi_read>0</multi_read>
            <check_not_exists>1</check_not_exists>
        </feature_flags>
    </keeper_server>
</clickhouse>
```

Доступны следующие функции:

| Функция                | Описание                                                                                                                                              | По умолчанию |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `multi_read`           | Поддержка множественных запросов на чтение                                                                                                            | `1`          |
| `filtered_list`        | Поддержка запроса списка с фильтрацией результатов по типу узла (эфемерный или постоянный)                                                           | `1`          |
| `check_not_exists`     | Поддержка запроса `CheckNotExists`, который проверяет отсутствие узла                                                                                 | `1`          |
| `create_if_not_exists` | Поддержка запроса `CreateIfNotExists`, который попытается создать узел, если он не существует. Если узел существует, изменения не применяются и возвращается `ZOK` | `1`          |
| `remove_recursive`     | Поддержка запроса `RemoveRecursive`, который удаляет узел вместе с его поддеревом                                                                     | `1`          |

:::note
Некоторые флаги функциональности включены по умолчанию начиная с версии 25.7.  
Рекомендуемый способ обновления Keeper до версии 25.7+ — сначала обновиться до версии 24.9+.
:::


### Миграция с ZooKeeper {#migration-from-zookeeper}

Бесшовная миграция с ZooKeeper на ClickHouse Keeper невозможна. Необходимо остановить кластер ZooKeeper, преобразовать данные и запустить ClickHouse Keeper. Утилита `clickhouse-keeper-converter` позволяет преобразовать журналы и снимки ZooKeeper в снимок ClickHouse Keeper. Она работает только с ZooKeeper версии выше 3.4. Шаги миграции:

1. Остановите все узлы ZooKeeper.

2. Необязательно, но рекомендуется: найдите узел-лидер ZooKeeper, запустите и снова остановите его. Это заставит ZooKeeper создать согласованный снимок.

3. Запустите `clickhouse-keeper-converter` на лидере, например:

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. Скопируйте снимок на узлы сервера ClickHouse с настроенным `keeper` или запустите ClickHouse Keeper вместо ZooKeeper. Снимок должен присутствовать на всех узлах, иначе пустые узлы могут оказаться быстрее, и один из них может стать лидером.

:::note
Утилита `keeper-converter` недоступна в автономном бинарном файле Keeper.
Если у вас установлен ClickHouse, вы можете использовать бинарный файл напрямую:

```bash
clickhouse keeper-converter ...
```

В противном случае вы можете [загрузить бинарный файл](/getting-started/quick-start/oss#download-the-binary) и запустить утилиту, как описано выше, без установки ClickHouse.
:::

### Восстановление после потери кворума {#recovering-after-losing-quorum}

Поскольку ClickHouse Keeper использует Raft, он может выдерживать определенное количество сбоев узлов в зависимости от размера кластера. \
Например, для кластера из 3 узлов он будет продолжать корректно работать при отказе только 1 узла.

Конфигурация кластера может быть настроена динамически, но существуют некоторые ограничения. Реконфигурация также опирается на Raft,
поэтому для добавления или удаления узла из кластера необходим кворум. Если вы одновременно потеряете слишком много узлов в кластере без возможности
их повторного запуска, Raft прекратит работу и не позволит реконфигурировать кластер обычным способом.

Тем не менее, ClickHouse Keeper имеет режим восстановления, который позволяет принудительно реконфигурировать кластер с использованием только 1 узла.
Это следует делать только в крайнем случае, если вы не можете снова запустить свои узлы или запустить новый экземпляр на той же конечной точке.

Важные моменты, которые следует учесть перед продолжением:

- Убедитесь, что отказавшие узлы не могут снова подключиться к кластеру.
- Не запускайте ни один из новых узлов, пока это не будет указано в шагах.

После того как вы убедитесь, что вышеуказанные условия выполнены, необходимо выполнить следующее:

1. Выберите один узел Keeper в качестве нового лидера. Имейте в виду, что данные этого узла будут использоваться для всего кластера, поэтому мы рекомендуем использовать узел с наиболее актуальным состоянием.
2. Прежде чем что-либо делать, создайте резервную копию папок `log_storage_path` и `snapshot_storage_path` выбранного узла.
3. Реконфигурируйте кластер на всех узлах, которые вы хотите использовать.
4. Отправьте четырехбуквенную команду `rcvr` выбранному узлу, что переведет узел в режим восстановления, ИЛИ остановите экземпляр Keeper на выбранном узле и запустите его снова с аргументом `--force-recovery`.
5. Поочередно запускайте экземпляры Keeper на новых узлах, убеждаясь, что `mntr` возвращает `follower` для `zk_server_state` перед запуском следующего.
6. Находясь в режиме восстановления, узел-лидер будет возвращать сообщение об ошибке для команды `mntr` до тех пор, пока не достигнет кворума с новыми узлами, и будет отклонять любые запросы от клиентов и последователей.
7. После достижения кворума узел-лидер вернется к нормальному режиму работы, принимая все запросы с использованием Raft — проверьте с помощью `mntr`, которая должна возвращать `leader` для `zk_server_state`.


## Использование дисков с Keeper {#using-disks-with-keeper}

Keeper поддерживает подмножество [внешних дисков](/operations/storing-data.md) для хранения снимков состояния, файлов журналов и файла состояния.

Поддерживаемые типы дисков:

- s3_plain
- s3
- local

Ниже приведен пример определения дисков в конфигурационном файле.

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <log_local>
                <type>local</type>
                <path>/var/lib/clickhouse/coordination/logs/</path>
            </log_local>
            <log_s3_plain>
                <type>s3_plain</type>
                <endpoint>https://some_s3_endpoint/logs/</endpoint>
                <access_key_id>ACCESS_KEY</access_key_id>
                <secret_access_key>SECRET_KEY</secret_access_key>
            </log_s3_plain>
            <snapshot_local>
                <type>local</type>
                <path>/var/lib/clickhouse/coordination/snapshots/</path>
            </snapshot_local>
            <snapshot_s3_plain>
                <type>s3_plain</type>
                <endpoint>https://some_s3_endpoint/snapshots/</endpoint>
                <access_key_id>ACCESS_KEY</access_key_id>
                <secret_access_key>SECRET_KEY</secret_access_key>
            </snapshot_s3_plain>
            <state_s3_plain>
                <type>s3_plain</type>
                <endpoint>https://some_s3_endpoint/state/</endpoint>
                <access_key_id>ACCESS_KEY</access_key_id>
                <secret_access_key>SECRET_KEY</secret_access_key>
            </state_s3_plain>
        </disks>
    </storage_configuration>
</clickhouse>
```

Для использования диска для журналов необходимо задать параметр конфигурации `keeper_server.log_storage_disk` равным имени диска.
Для использования диска для снимков состояния необходимо задать параметр конфигурации `keeper_server.snapshot_storage_disk` равным имени диска.
Кроме того, для последних журналов или снимков состояния можно использовать отдельные диски, указав параметры `keeper_server.latest_log_storage_disk` и `keeper_server.latest_snapshot_storage_disk` соответственно.
В этом случае Keeper автоматически переместит файлы на соответствующие диски при создании новых журналов или снимков состояния.
Для использования диска для файла состояния необходимо задать параметр конфигурации `keeper_server.state_storage_disk` равным имени диска.

Перемещение файлов между дисками безопасно, и нет риска потери данных, если Keeper остановится в процессе передачи.
Пока файл полностью не перемещен на новый диск, он не удаляется со старого.

Keeper с параметром `keeper_server.coordination_settings.force_sync`, установленным в `true` (по умолчанию `true`), не может обеспечить некоторые гарантии для всех типов дисков.
В настоящее время только диски типа `local` поддерживают постоянную синхронизацию.
Если используется `force_sync`, параметр `log_storage_disk` должен указывать на диск типа `local`, если не используется `latest_log_storage_disk`.
Если используется `latest_log_storage_disk`, он всегда должен быть диском типа `local`.
Если `force_sync` отключен, диски всех типов могут использоваться в любой конфигурации.

Возможная конфигурация хранилища для экземпляра Keeper может выглядеть следующим образом:

```xml
<clickhouse>
    <keeper_server>
        <log_storage_disk>log_s3_plain</log_storage_disk>
        <latest_log_storage_disk>log_local</latest_log_storage_disk>

        <snapshot_storage_disk>snapshot_s3_plain</snapshot_storage_disk>
        <latest_snapshot_storage_disk>snapshot_local</latest_snapshot_storage_disk>
    </keeper_server>
</clickhouse>
```

Этот экземпляр будет хранить все журналы, кроме последнего, на диске `log_s3_plain`, в то время как последний журнал будет находиться на диске `log_local`.
Та же логика применяется к снимкам состояния: все снимки, кроме последнего, будут храниться на `snapshot_s3_plain`, в то время как последний снимок будет находиться на диске `snapshot_local`.

### Изменение конфигурации дисков {#changing-disk-setup}

:::important
Перед применением новой конфигурации дисков вручную создайте резервные копии всех журналов и снимков состояния Keeper.
:::

Если определена многоуровневая конфигурация дисков (с использованием отдельных дисков для последних файлов), Keeper попытается автоматически переместить файлы на соответствующие диски при запуске.
Применяется та же гарантия, что и ранее: пока файл полностью не перемещен на новый диск, он не удаляется со старого, поэтому можно безопасно выполнять множественные перезапуски.

Если необходимо переместить файлы на совершенно новый диск (или перейти от конфигурации с двумя дисками к конфигурации с одним диском), можно использовать несколько определений `keeper_server.old_snapshot_storage_disk` и `keeper_server.old_log_storage_disk`.

Следующая конфигурация показывает, как можно перейти от предыдущей конфигурации с двумя дисками к совершенно новой конфигурации с одним диском:


```xml
<clickhouse>
    <keeper_server>
        <old_log_storage_disk>log_local</old_log_storage_disk>
        <old_log_storage_disk>log_s3_plain</old_log_storage_disk>
        <log_storage_disk>log_local2</log_storage_disk>

        <old_snapshot_storage_disk>snapshot_s3_plain</old_snapshot_storage_disk>
        <old_snapshot_storage_disk>snapshot_local</old_snapshot_storage_disk>
        <snapshot_storage_disk>snapshot_local2</snapshot_storage_disk>
    </keeper_server>
</clickhouse>
```

При запуске все файлы журналов будут перемещены с дисков `log_local` и `log_s3_plain` на диск `log_local2`.
Также все файлы снимков будут перемещены с дисков `snapshot_local` и `snapshot_s3_plain` на диск `snapshot_local2`.


## Настройка кэша логов {#configuring-logs-cache}

Для минимизации объема данных, считываемых с диска, Keeper кэширует записи логов в памяти.
Если запросы большие, записи логов будут занимать слишком много памяти, поэтому объем кэшируемых логов ограничен.
Ограничение контролируется двумя параметрами конфигурации:

- `latest_logs_cache_size_threshold` — общий размер последних логов, хранящихся в кэше
- `commit_logs_cache_size_threshold` — общий размер последующих логов, которые необходимо зафиксировать

Если значения по умолчанию слишком велики, можно уменьшить потребление памяти, снизив эти два параметра.

:::note
Для проверки количества логов, прочитанных из каждого кэша и из файла, можно использовать команду `pfev`.
Также можно использовать метрики из эндпоинта Prometheus для отслеживания текущего размера обоих кэшей.
:::


## Prometheus {#prometheus}

Keeper может предоставлять данные метрик для сбора сервером [Prometheus](https://prometheus.io).

Настройки:

- `endpoint` – HTTP-эндпоинт для сбора метрик сервером Prometheus. Должен начинаться с '/'.
- `port` – Порт для `endpoint`.
- `metrics` – Флаг, включающий предоставление метрик из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Флаг, включающий предоставление метрик из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Флаг, включающий предоставление текущих значений метрик из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

**Пример**

```xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <!-- highlight-start -->
    <prometheus>
        <endpoint>/metrics</endpoint>
        <port>9363</port>
        <metrics>true</metrics>
        <events>true</events>
        <asynchronous_metrics>true</asynchronous_metrics>
    </prometheus>
    <!-- highlight-end -->
</clickhouse>
```

Проверка (замените `127.0.0.1` на IP-адрес или имя хоста вашего сервера ClickHouse):

```bash
curl 127.0.0.1:9363/metrics
```

См. также интеграцию [Prometheus с ClickHouse Cloud](/integrations/prometheus).


## Руководство пользователя ClickHouse Keeper {#clickhouse-keeper-user-guide}

Это руководство описывает простые минимальные настройки для конфигурации ClickHouse Keeper и приводит пример тестирования распределённых операций. Пример выполняется на трёх узлах под управлением Linux.

### 1. Настройка узлов с настройками Keeper {#1-configure-nodes-with-keeper-settings}

1. Установите 3 экземпляра ClickHouse на 3 узла (`chnode1`, `chnode2`, `chnode3`). (См. [Быстрый старт](/getting-started/install/install.mdx) для получения подробностей об установке ClickHouse.)

2. На каждом узле добавьте следующую настройку, чтобы разрешить внешние соединения через сетевой интерфейс.

   ```xml
   <listen_host>0.0.0.0</listen_host>
   ```

3. Добавьте следующую конфигурацию ClickHouse Keeper на все три сервера, обновив настройку `<server_id>` для каждого сервера; для `chnode1` это будет `1`, для `chnode2` — `2` и т. д.

   ```xml
   <keeper_server>
       <tcp_port>9181</tcp_port>
       <server_id>1</server_id>
       <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
       <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

       <coordination_settings>
           <operation_timeout_ms>10000</operation_timeout_ms>
           <session_timeout_ms>30000</session_timeout_ms>
           <raft_logs_level>warning</raft_logs_level>
       </coordination_settings>

       <raft_configuration>
           <server>
               <id>1</id>
               <hostname>chnode1.domain.com</hostname>
               <port>9234</port>
           </server>
           <server>
               <id>2</id>
               <hostname>chnode2.domain.com</hostname>
               <port>9234</port>
           </server>
           <server>
               <id>3</id>
               <hostname>chnode3.domain.com</hostname>
               <port>9234</port>
           </server>
       </raft_configuration>
   </keeper_server>
   ```

   Это основные настройки, использованные выше:

   | Параметр             | Описание                                                                | Пример                                          |
   | --------------------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
   | tcp_port              | порт, используемый клиентами ClickHouse Keeper                          | 9181 — значение по умолчанию, эквивалентное 2181 в ZooKeeper |
   | server_id             | идентификатор для каждого сервера ClickHouse Keeper в конфигурации Raft | 1                                               |
   | coordination_settings | раздел с параметрами, такими как таймауты                               | таймауты: 10000, уровень лога: trace            |
   | server                | определение сервера-участника                                           | список определений каждого сервера              |
   | raft_configuration    | конфигурация Raft для серверов в кластере Keeper                        | сервер и настройки для каждого                  |
   | id                    | числовой идентификатор сервера для сервисов Keeper                      | 1                                               |
   | hostname              | имя хоста, IP или FQDN каждого сервера в кластере Keeper                | `chnode1.domain.com`                            |
   | port                  | порт для прослушивания межсерверных соединений Keeper                   | 9234                                            |

4. Включите компонент ZooKeeper. Он будет использовать движок ClickHouse Keeper:

   ```xml
       <zookeeper>
           <node>
               <host>chnode1.domain.com</host>
               <port>9181</port>
           </node>
           <node>
               <host>chnode2.domain.com</host>
               <port>9181</port>
           </node>
           <node>
               <host>chnode3.domain.com</host>
               <port>9181</port>
           </node>
       </zookeeper>
   ```

   Это основные настройки, использованные выше:

   | Параметр | Описание                                            | Пример                         |
   | --------- | --------------------------------------------------- | ------------------------------ |
   | node      | список узлов для подключений к ClickHouse Keeper    | запись настроек для каждого сервера |
   | host      | имя хоста, IP или FQDN каждого узла ClickHouse Keeper | `chnode1.domain.com`           |
   | port      | порт клиента ClickHouse Keeper                      | 9181                           |

5. Перезапустите ClickHouse и проверьте, что каждый экземпляр Keeper запущен. Выполните следующую команду на каждом сервере. Команда `ruok` возвращает `imok`, если Keeper запущен и здоров:

   ```bash
   # echo ruok | nc localhost 9181; echo
   imok
   ```

6. База данных `system` содержит таблицу с именем `zookeeper`, которая хранит детали ваших экземпляров ClickHouse Keeper. Посмотрим на таблицу:
   ```sql
   SELECT *
   FROM system.zookeeper
   WHERE path IN ('/', '/clickhouse')
   ```


    Таблица выглядит следующим образом:
    ```response
    ┌─name───────┬─value─┬─czxid─┬─mzxid─┬───────────────ctime─┬───────────────mtime─┬─version─┬─cversion─┬─aversion─┬─ephemeralOwner─┬─dataLength─┬─numChildren─┬─pzxid─┬─path────────┐
    │ clickhouse │       │   124 │   124 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        2 │        0 │              0 │          0 │           2 │  5693 │ /           │
    │ task_queue │       │   125 │   125 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        1 │        0 │              0 │          0 │           1 │   126 │ /clickhouse │
    │ tables     │       │  5693 │  5693 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        3 │        0 │              0 │          0 │           3 │  6461 │ /clickhouse │
    └────────────┴───────┴───────┴───────┴─────────────────────┴─────────────────────┴─────────┴──────────┴──────────┴────────────────┴────────────┴─────────────┴───────┴─────────────┘
    ```

### 2. Настройка кластера в ClickHouse {#2--configure-a-cluster-in-clickhouse}

1. Настроим простой кластер с 2 шардами и только одной репликой на 2 узлах. Третий узел будет использоваться для достижения кворума, необходимого для ClickHouse Keeper. Обновите конфигурацию на `chnode1` и `chnode2`. Следующая конфигурация кластера определяет по 1 шарду на каждом узле, всего 2 шарда без репликации. В этом примере часть данных будет храниться на одном узле, а часть — на другом:

   ```xml
       <remote_servers>
           <cluster_2S_1R>
               <shard>
                   <replica>
                       <host>chnode1.domain.com</host>
                       <port>9000</port>
                       <user>default</user>
                       <password>ClickHouse123!</password>
                   </replica>
               </shard>
               <shard>
                   <replica>
                       <host>chnode2.domain.com</host>
                       <port>9000</port>
                       <user>default</user>
                       <password>ClickHouse123!</password>
                   </replica>
               </shard>
           </cluster_2S_1R>
       </remote_servers>
   ```

   | Параметр  | Описание                                                                        | Пример                            |
   | --------- | ------------------------------------------------------------------------------- | --------------------------------- |
   | shard     | список реплик в определении кластера                                            | список реплик для каждого шарда   |
   | replica   | список настроек для каждой реплики                                              | записи настроек для каждой реплики |
   | host      | имя хоста, IP-адрес или FQDN сервера, на котором будет размещена реплика шарда | `chnode1.domain.com`              |
   | port      | порт для связи по нативному протоколу TCP                                       | 9000                              |
   | user      | имя пользователя для аутентификации в экземплярах кластера                      | default                           |
   | password  | пароль пользователя для подключения к экземплярам кластера                      | `ClickHouse123!`                  |

2. Перезапустите ClickHouse и убедитесь, что кластер создан:

   ```bash
   SHOW clusters;
   ```

   Вы должны увидеть свой кластер:

   ```response
   ┌─cluster───────┐
   │ cluster_2S_1R │
   └───────────────┘
   ```

### 3. Создание и тестирование распределенной таблицы {#3-create-and-test-distributed-table}

1.  Создайте новую базу данных в новом кластере с помощью клиента ClickHouse на `chnode1`. Конструкция `ON CLUSTER` автоматически создает базу данных на обоих узлах.
    ```sql
    CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
    ```


2. Создайте новую таблицу в базе данных `db1`. Как и ранее, `ON CLUSTER` создаёт таблицу на обоих узлах.

   ```sql
   CREATE TABLE db1.table1 on cluster 'cluster_2S_1R'
   (
       `id` UInt64,
       `column1` String
   )
   ENGINE = MergeTree
   ORDER BY column1
   ```

3. На узле `chnode1` добавьте несколько строк:

   ```sql
   INSERT INTO db1.table1
       (id, column1)
   VALUES
       (1, 'abc'),
       (2, 'def')
   ```

4. Добавьте несколько строк на узле `chnode2`:

   ```sql
   INSERT INTO db1.table1
       (id, column1)
   VALUES
       (3, 'ghi'),
       (4, 'jkl')
   ```

5. Обратите внимание, что выполнение запроса `SELECT` на каждом узле показывает только данные этого узла. Например, на `chnode1`:

   ```sql
   SELECT *
   FROM db1.table1
   ```

   ```response
   Query id: 7ef1edbc-df25-462b-a9d4-3fe6f9cb0b6d

   ┌─id─┬─column1─┐
   │  1 │ abc     │
   │  2 │ def     │
   └────┴─────────┘

   Получено 2 строки. Затрачено: 0.006 сек.
   ```

   На `chnode2`:

6. ```sql
   SELECT *
   FROM db1.table1
   ```

   ```response
   Query id: c43763cc-c69c-4bcc-afbe-50e764adfcbf

   ┌─id─┬─column1─┐
   │  3 │ ghi     │
   │  4 │ jkl     │
   └────┴─────────┘
   ```

7. Вы можете создать таблицу с движком `Distributed` для представления данных на двух шардах. Таблицы с движком `Distributed` не хранят собственных данных, но позволяют выполнять распределённую обработку запросов на нескольких серверах. Операции чтения обращаются ко всем шардам, а операции записи могут распределяться между шардами. Выполните следующий запрос на `chnode1`:

   ```sql
   CREATE TABLE db1.dist_table (
       id UInt64,
       column1 String
   )
   ENGINE = Distributed(cluster_2S_1R,db1,table1)
   ```

8. Обратите внимание, что запрос к `dist_table` возвращает все четыре строки данных с двух шардов:

   ```sql
   SELECT *
   FROM db1.dist_table
   ```

   ```response
   Query id: 495bffa0-f849-4a0c-aeea-d7115a54747a

   ┌─id─┬─column1─┐
   │  1 │ abc     │
   │  2 │ def     │
   └────┴─────────┘
   ┌─id─┬─column1─┐
   │  3 │ ghi     │
   │  4 │ jkl     │
   └────┴─────────┘

   Получено 4 строки. Затрачено: 0.018 сек.
   ```

### Резюме {#summary}

Это руководство продемонстрировало, как настроить кластер с использованием ClickHouse Keeper. С помощью ClickHouse Keeper вы можете настраивать кластеры и определять распределённые таблицы, которые могут реплицироваться между шардами.


## Настройка ClickHouse Keeper с уникальными путями {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />

### Описание {#description}

В этой статье описывается использование встроенного макроса `{uuid}`
для создания уникальных записей в ClickHouse Keeper или ZooKeeper. Уникальные
пути полезны при частом создании и удалении таблиц, поскольку
позволяют избежать ожидания в несколько минут, необходимого для того, чтобы сборщик мусора Keeper
удалил записи путей. При каждом создании пути используется новый `uuid`,
поэтому пути никогда не используются повторно.

### Пример окружения {#example-environment}

Кластер из трёх узлов, который будет настроен с ClickHouse Keeper
на всех трёх узлах и ClickHouse на двух узлах. Это обеспечивает
ClickHouse Keeper тремя узлами (включая арбитражный узел) и
одним шардом ClickHouse, состоящим из двух реплик.

| node                    | description                                  |
| ----------------------- | -------------------------------------------- |
| `chnode1.marsnet.local` | узел данных - кластер `cluster_1S_2R`        |
| `chnode2.marsnet.local` | узел данных - кластер `cluster_1S_2R`        |
| `chnode3.marsnet.local` | арбитражный узел ClickHouse Keeper           |

Пример конфигурации кластера:

```xml
    <remote_servers>
        <cluster_1S_2R>
            <shard>
                <replica>
                    <host>chnode1.marsnet.local</host>
                    <port>9440</port>
                    <user>default</user>
                    <password>ClickHouse123!</password>
                    <secure>1</secure>
                </replica>
                <replica>
                    <host>chnode2.marsnet.local</host>
                    <port>9440</port>
                    <user>default</user>
                    <password>ClickHouse123!</password>
                    <secure>1</secure>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
```

### Процедуры настройки таблиц для использования `{uuid}` {#procedures-to-set-up-tables-to-use-uuid}

1. Настройте макросы на каждом сервере
   пример для сервера 1:

```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
```

:::note
Обратите внимание, что мы определяем макросы для `shard` и `replica`, но `{uuid}` здесь не определяется — он встроенный, и его не нужно определять.
:::

2. Создайте базу данных

```sql
CREATE DATABASE db_uuid
      ON CLUSTER 'cluster_1S_2R'
      ENGINE Atomic;
```

```response
CREATE DATABASE db_uuid ON CLUSTER cluster_1S_2R
ENGINE = Atomic

Query id: 07fb7e65-beb4-4c30-b3ef-bd303e5c42b5

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

3. Создайте таблицу в кластере, используя макросы и `{uuid}`

```sql
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}' )
   ORDER BY (id);
```

```response
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}')
ORDER BY id

Query id: 8f542664-4548-4a02-bd2a-6f2c973d0dc4

```


┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1.marsnet.local │ 9440 │ 0 │ │ 1 │ 0 │
│ chnode2.marsnet.local │ 9440 │ 0 │ │ 0 │ 0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

````

4.  Создайте распределённую таблицу

```sql
CREATE TABLE db_uuid.dist_uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = Distributed('cluster_1S_2R', 'db_uuid', 'uuid_table1' );
````

```response
CREATE TABLE db_uuid.dist_uuid_table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = Distributed('cluster_1S_2R', 'db_uuid', 'uuid_table1')

Query id: 3bc7f339-ab74-4c7d-a752-1ffe54219c0e

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

### Тестирование {#testing}

1.  Вставьте данные в первый узел (например, `chnode1`)

```sql
INSERT INTO db_uuid.uuid_table1
   ( id, column1)
   VALUES
   ( 1, 'abc');
```

```response
INSERT INTO db_uuid.uuid_table1 (id, column1) FORMAT Values

Query id: 0f178db7-50a6-48e2-9a1b-52ed14e6e0f9

Ok.

1 row in set. Elapsed: 0.033 sec.
```

2. Вставьте данные во второй узел (например, `chnode2`)

```sql
INSERT INTO db_uuid.uuid_table1
   ( id, column1)
   VALUES
   ( 2, 'def');
```

```response
INSERT INTO db_uuid.uuid_table1 (id, column1) FORMAT Values

Query id: edc6f999-3e7d-40a0-8a29-3137e97e3607

Ok.

1 row in set. Elapsed: 0.529 sec.
```

3. Просмотрите записи, используя распределённую таблицу

```sql
SELECT * FROM db_uuid.dist_uuid_table1;
```

```response
SELECT *
FROM db_uuid.dist_uuid_table1

Query id: 6cbab449-9e7f-40fe-b8c2-62d46ba9f5c8

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘

2 rows in set. Elapsed: 0.007 sec.
```

### Альтернативные варианты {#alternatives}

Путь репликации по умолчанию можно заранее определить с помощью макросов, также используя `{uuid}`

1. Задайте значения по умолчанию для таблиц на каждом узле

```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

:::tip
Вы также можете определить макрос `{database}` на каждом узле, если узлы используются для конкретных баз данных.
:::

2. Создайте таблицу без явного указания параметров:

```sql
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = ReplicatedMergeTree
   ORDER BY (id);
```

```response
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree
ORDER BY id

```


Идентификатор запроса: ab68cda9-ae41-4d6d-8d3b-20d8255774ee

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │ 0 │ │ 1 │ 0 │
│ chnode1.marsnet.local │ 9440 │ 0 │ │ 0 │ 0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

Получено 2 строки. Затрачено: 1.175 сек.

````

3. Убедитесь, что используются настройки из конфигурации по умолчанию
```sql
SHOW CREATE TABLE db_uuid.uuid_table1;
````

```response
SHOW CREATE TABLE db_uuid.uuid_table1

CREATE TABLE db_uuid.uuid_table1
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}')
ORDER BY id

Получена 1 строка. Затрачено: 0.003 сек.
```

### Устранение неполадок {#troubleshooting}

Пример команды для получения информации о таблице и её UUID:

```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

Пример команды для получения информации о таблице в ZooKeeper с UUID для указанной выше таблицы

```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
База данных должна иметь тип `Atomic`. При обновлении с предыдущей версии база данных `default`, скорее всего, имеет тип `Ordinary`.
:::

Для проверки:

Например,

```sql
SELECT name, engine FROM system.databases WHERE name = 'db_uuid';
```

```response
SELECT
    name,
    engine
FROM system.databases
WHERE name = 'db_uuid'

Query id: b047d459-a1d2-4016-bcf9-3e97e30e49c2

┌─name────┬─engine─┐
│ db_uuid │ Atomic │
└─────────┴────────┘

Получена 1 строка. Затрачено: 0.004 сек.
```


## Динамическая реконфигурация ClickHouse Keeper {#reconfiguration}

<SelfManaged />

### Описание {#description-1}

ClickHouse Keeper частично поддерживает команду ZooKeeper [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying)
для динамической реконфигурации кластера, если включен параметр `keeper_server.enable_reconfiguration`.

:::note
Если этот параметр отключен, вы можете реконфигурировать кластер, вручную изменив секцию `raft_configuration`
реплики. Убедитесь, что вы редактируете файлы на всех репликах, так как только лидер применяет изменения.
Также вы можете отправить запрос `reconfig` через любой ZooKeeper-совместимый клиент.
:::

Виртуальный узел `/keeper/config` содержит последнюю зафиксированную конфигурацию кластера в следующем формате:

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

- Каждая запись сервера отделяется символом новой строки.
- `server_type` может быть либо `participant`, либо `learner` ([learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md) не участвует в выборах лидера).
- `server_priority` — неотрицательное целое число, определяющее [какие узлы должны иметь приоритет при выборах лидера](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md).
  Приоритет 0 означает, что сервер никогда не станет лидером.

Пример:

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

Вы можете использовать команду `reconfig` для добавления новых серверов, удаления существующих и изменения
приоритетов существующих серверов. Ниже приведены примеры (с использованием `clickhouse-keeper-client`):


```bash
# Добавление двух новых серверов
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"
# Удаление двух других серверов
reconfig remove "3,4"
# Изменение приоритета существующего сервера на 8
reconfig add "server.5=localhost:5123;participant;8"
```

И вот примеры для `kazoo`:


```python
# Добавление двух новых серверов и удаление двух других серверов
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")
```


# Измените приоритет существующего сервера на 8

reconfig(joining=&quot;server.5=localhost:5123;participant;8&quot;, leaving=None)

```

Серверы в `joining` должны быть указаны в формате сервера, описанном выше. Записи серверов должны разделяться запятыми.
При добавлении новых серверов можно опустить `server_priority` (значение по умолчанию — 1) и `server_type` (значение по умолчанию — `participant`).

Если требуется изменить приоритет существующего сервера, добавьте его в `joining` с целевым приоритетом.
Хост, порт и тип сервера должны совпадать с существующей конфигурацией сервера.

Серверы добавляются и удаляются в порядке их появления в `joining` и `leaving`.
Все обновления из `joining` обрабатываются перед обновлениями из `leaving`.

В реализации переконфигурации Keeper есть некоторые ограничения:

- Поддерживается только инкрементальная переконфигурация. Запросы с непустым `new_members` отклоняются.

  Реализация ClickHouse Keeper использует API NuRaft для динамического изменения состава участников. NuRaft позволяет
  добавлять или удалять только один сервер за раз. Это означает, что каждое изменение конфигурации
  (каждая часть `joining`, каждая часть `leaving`) должно обрабатываться отдельно. Таким образом, массовая
  переконфигурация недоступна, так как это могло бы ввести пользователей в заблуждение.

  Изменение типа сервера (participant/learner) также невозможно, так как это не поддерживается NuRaft, и
  единственным способом было бы удаление и добавление сервера, что опять же могло бы ввести в заблуждение.

- Невозможно использовать возвращаемое значение `znodestat`.
- Поле `from_version` не используется. Все запросы с установленным `from_version` отклоняются.
  Это связано с тем, что `/keeper/config` является виртуальным узлом, то есть он не хранится в
  постоянном хранилище, а генерируется на лету с указанной конфигурацией узла для каждого запроса.
  Это решение было принято, чтобы не дублировать данные, так как NuRaft уже хранит эту конфигурацию.
- В отличие от ZooKeeper, отсутствует способ ожидать переконфигурации кластера путем отправки команды `sync`.
  Новая конфигурация будет _в конечном итоге_ применена, но без гарантий по времени.
- Команда `reconfig` может завершиться неудачей по различным причинам. Вы можете проверить состояние кластера и убедиться, было ли
  применено обновление.
```


## Преобразование одноузлового keeper в кластер {#converting-a-single-node-keeper-into-a-cluster}

Иногда необходимо развернуть экспериментальный узел keeper в полноценный кластер. Ниже приведена пошаговая инструкция для кластера из 3 узлов:

- **ВАЖНО**: новые узлы необходимо добавлять партиями меньше текущего кворума, иначе они выберут лидера среди себя. В данном примере узлы добавляются по одному.
- На существующем узле keeper должен быть включен параметр конфигурации `keeper_server.enable_reconfiguration`.
- Запустите второй узел с полной новой конфигурацией кластера keeper.
- После запуска добавьте его к узлу 1 с помощью [`reconfig`](#reconfiguration).
- Теперь запустите третий узел и добавьте его с помощью [`reconfig`](#reconfiguration).
- Обновите конфигурацию `clickhouse-server`, добавив в неё новый узел keeper, и перезапустите сервер для применения изменений.
- Обновите конфигурацию raft узла 1 и, при необходимости, перезапустите его.

Для практического освоения процесса используйте [тестовый репозиторий](https://github.com/ClickHouse/keeper-extend-cluster).


## Неподдерживаемые возможности {#unsupported-features}

Хотя ClickHouse Keeper стремится к полной совместимости с ZooKeeper, некоторые возможности в настоящее время не реализованы (разработка ведется):

- [`create`](<https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)>) не поддерживает возврат объекта `Stat`
- [`create`](<https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)>) не поддерживает [TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL)
- [`addWatch`](<https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode)>) не работает с [`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT) наблюдателями
- [`removeWatch`](<https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean)>) и [`removeAllWatches`](<https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher.WatcherType,boolean)>) не поддерживаются
- `setWatches` не поддерживается
- Создание узлов типа [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html) не поддерживается
- [`Аутентификация SASL`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL) не поддерживается
