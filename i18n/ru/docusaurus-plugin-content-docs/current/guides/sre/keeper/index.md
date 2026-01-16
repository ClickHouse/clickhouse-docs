---
slug: /guides/sre/keeper/clickhouse-keeper

sidebar_label: 'Настройка ClickHouse Keeper'
sidebar_position: 10
keywords: ['Keeper', 'ZooKeeper', 'clickhouse-keeper']
description: 'ClickHouse Keeper или clickhouse-keeper заменяет ZooKeeper и обеспечивает функции репликации и координации.'
title: 'ClickHouse Keeper'
doc_type: 'guide'
---

# ClickHouse Keeper (clickhouse-keeper) \\{#clickhouse-keeper-clickhouse-keeper\\}

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

ClickHouse Keeper предоставляет систему координации для [репликации](/engines/table-engines/mergetree-family/replication.md) данных и выполнения запросов [распределённого DDL](/sql-reference/distributed-ddl.md). ClickHouse Keeper совместим с ZooKeeper.

### Детали реализации \\{#implementation-details\\}

ZooKeeper — одна из первых хорошо известных систем координации с открытым исходным кодом. Она реализована на Java и имеет довольно простую и мощную модель данных. Алгоритм координации ZooKeeper, ZooKeeper Atomic Broadcast (ZAB), не предоставляет гарантий линеаризуемости чтения, так как каждый узел ZooKeeper обрабатывает операции чтения локально. В отличие от ZooKeeper, ClickHouse Keeper написан на C++ и использует [алгоритм RAFT](https://raft.github.io/) в [реализации](https://github.com/eBay/NuRaft). Этот алгоритм обеспечивает линеаризуемость для операций чтения и записи и имеет несколько реализаций с открытым исходным кодом на разных языках.

По умолчанию ClickHouse Keeper предоставляет те же гарантии, что и ZooKeeper: линеаризуемые записи и нелинеаризуемые чтения. Он использует совместимый клиент-серверный протокол, поэтому любой стандартный клиент ZooKeeper можно использовать для взаимодействия с ClickHouse Keeper. Снимки и журналы имеют формат, несовместимый с ZooKeeper, но инструмент `clickhouse-keeper-converter` позволяет преобразовать данные ZooKeeper в снимки ClickHouse Keeper. Межсерверный протокол в ClickHouse Keeper также несовместим с ZooKeeper, поэтому смешанный кластер ZooKeeper / ClickHouse Keeper невозможен.

ClickHouse Keeper поддерживает списки контроля доступа (ACL) так же, как и [ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl). ClickHouse Keeper поддерживает тот же набор прав и имеет идентичные встроенные схемы: `world`, `auth` и `digest`. Схема аутентификации digest использует пару `username:password`, при этом пароль кодируется в Base64.

:::note
Внешние интеграции не поддерживаются.
:::

### Конфигурация \\{#configuration\\}

ClickHouse Keeper может использоваться как самостоятельная замена ZooKeeper или как внутренняя часть сервера ClickHouse. В обоих случаях конфигурация задаётся практически одинаковым `.xml`-файлом.

#### Параметры конфигурации Keeper \\{#keeper-configuration-settings\\}

Основной конфигурационный тег ClickHouse Keeper — `<keeper_server>` и имеет следующие параметры:

| Parameter                            | Description                                                                                                                                                                                                                                         | Default                                                                                                      |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `tcp_port`                           | Порт для подключения клиента.                                                                                                                                                                                                                       | `2181`                                                                                                       |
| `tcp_port_secure`                    | Защищённый порт для SSL-подключения между клиентом и keeper-server.                                                                                                                                                                                 | -                                                                                                            |
| `server_id`                          | Уникальный идентификатор сервера, каждый участник кластера ClickHouse Keeper должен иметь уникальный номер (1, 2, 3 и так далее).                                                                                                                   | -                                                                                                            |
| `log_storage_path`                   | Путь к журналам координации; как и в ZooKeeper, журналы лучше хранить на незагруженных узлах.                                                                                                                                                       | -                                                                                                            |
| `snapshot_storage_path`              | Путь к снимкам состояния координации.                                                                                                                                                                                                               | -                                                                                                            |
| `enable_reconfiguration`             | Включить динамическую переконфигурацию кластера с помощью [`reconfig`](#reconfiguration).                                                                                                                                                           | `False`                                                                                                      |
| `max_memory_usage_soft_limit`        | Мягкое ограничение в байтах на максимальное потребление памяти Keeper.                                                                                                                                                                              | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount`                                               |
| `max_memory_usage_soft_limit_ratio`  | Если `max_memory_usage_soft_limit` не задан или установлен в ноль, используется это значение для определения значения мягкого ограничения по умолчанию.                                                                                            | `0.9`                                                                                                        |
| `cgroups_memory_observer_wait_time`  | Если `max_memory_usage_soft_limit` не задан или установлен в `0`, используется этот интервал для наблюдения за объёмом физической памяти. Как только объём памяти изменится, мягкое ограничение памяти Keeper будет пересчитано по `max_memory_usage_soft_limit_ratio`. | `15`                                                                                                         |
| `http_control`                       | Конфигурация интерфейса [HTTP control](#http-control).                                                                                                                                                                                              | -                                                                                                            |
| `digest_enabled`                     | Включить проверку согласованности данных в режиме реального времени.                                                                                                                                                                                | `True`                                                                                                       |
| `create_snapshot_on_exit`            | Создавать снимок состояния при завершении работы.                                                                                                                                                                                                   | -                                                                                                            |
| `hostname_checks_enabled`            | Включить базовые проверки имён хостов для конфигурации кластера (например, если `localhost` используется с удалёнными конечными точками).                                                                                                          | `True`                                                                                                       |
| `four_letter_word_white_list`        | Белый список команд 4lw.                                                                                                                                                                                                                            | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |
|`enable_ipv6`| Включить поддержку IPv6 | `True`|

Другие общие параметры наследуются из конфигурации сервера ClickHouse (`listen_host`, `logger` и так далее).

#### Internal coordination settings \\{#internal-coordination-settings\\}

Внутренние настройки координации находятся в секции `<keeper_server>.<coordination_settings>` и включают следующие параметры:

| Параметр                          | Описание                                                                                                                                                                                                                 | Значение по умолчанию                                                                                      |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`            | Таймаут для одной клиентской операции (мс)                                                                                                                                                                               | `10000`                                                                                                     |
| `min_session_timeout_ms`          | Минимальный таймаут для клиентской сессии (мс)                                                                                                                                                                           | `10000`                                                                                                     |
| `session_timeout_ms`              | Максимальный таймаут для клиентской сессии (мс)                                                                                                                                                                          | `100000`                                                                                                    |
| `dead_session_check_period_ms`    | Как часто ClickHouse Keeper проверяет «мертвые» сессии и удаляет их (мс)                                                                                                                                                 | `500`                                                                                                       |
| `heart_beat_interval_ms`          | Как часто лидер ClickHouse Keeper отправляет heartbeat-сообщения последователям (мс)                                                                                                                                     | `500`                                                                                                       |
| `election_timeout_lower_bound_ms` | Если в течение этого интервала последователь не получает heartbeat от лидера, он может инициировать выборы лидера. Значение должно быть меньше или равно `election_timeout_upper_bound_ms`. В идеале они не должны быть равны. | `1000`                                                                                                      |
| `election_timeout_upper_bound_ms` | Если в течение этого интервала последователь не получает heartbeat от лидера, он обязан инициировать выборы лидера.                                                                                                     | `2000`                                                                                                      |
| `rotate_log_storage_interval`     | Сколько записей лога хранить в одном файле.                                                                                                                                                                              | `100000`                                                                                                    |
| `reserved_log_items`              | Сколько записей журнала координации хранить до выполнения компакции.                                                                                                                                                     | `100000`                                                                                                    |
| `snapshot_distance`               | Как часто ClickHouse Keeper будет создавать новые снапшоты (в количестве записей в логах).                                                                                                                              | `100000`                                                                                                    |
| `snapshots_to_keep`               | Сколько снапшотов хранить.                                                                                                                                                                                               | `3`                                                                                                         |
| `stale_log_gap`                   | Порог, при котором лидер считает последователя устаревшим и отправляет ему снапшот вместо логов.                                                                                                                        | `10000`                                                                                                     |
| `fresh_log_gap`                   | Условие, при котором узел считается «свежим».                                                                                                                                                                            | `200`                                                                                                       |
| `max_requests_batch_size`         | Максимальный размер батча по количеству запросов перед отправкой в RAFT.                                                                                                                                                 | `100`                                                                                                       |
| `force_sync`                      | Вызывать `fsync` при каждой записи в журнал координации.                                                                                                                                                                 | `true`                                                                                                      |
| `quorum_reads`                    | Выполнять запросы на чтение как операции записи, проходящие через весь консенсус RAFT, с сопоставимой скоростью.                                                                                                        | `false`                                                                                                     |
| `raft_logs_level`                 | Уровень текстового логирования о координации (trace, debug и т. д.).                                                                                                                                                     | `system default`                                                                                            |
| `auto_forwarding`                 | Разрешить перенаправление запросов на запись от последователей к лидеру.                                                                                                                                                 | `true`                                                                                                      |
| `shutdown_timeout`                | Ожидание завершения внутренних соединений и остановки (мс).                                                                                                                                                              | `5000`                                                                                                      |
| `startup_timeout`                 | Если сервер не подключается к другим участникам кворума в заданный таймаут, он завершает работу (мс).                                                                                                                    | `30000`                                                                                                     |
| `async_replication`               | Включить асинхронную репликацию. Все гарантии записи и чтения сохраняются при повышенной производительности. Настройка отключена по умолчанию, чтобы не нарушать обратную совместимость.                               | `false`                                                                                                     |
| `latest_logs_cache_size_threshold`| Максимальный общий размер кэша в памяти для последних записей лога                                                                                                                                                      | `1GiB`                                                                                                      |
| `commit_logs_cache_size_threshold`| Максимальный общий размер кэша в памяти для записей лога, необходимых для следующего подтверждения                                                                                                                      | `500MiB`                                                                                                    |
| `disk_move_retries_wait_ms`       | Время ожидания между повторами после сбоя, произошедшего при перемещении файла между дисками                                                                                                                            | `1000`                                                                                                      |
| `disk_move_retries_during_init`   | Количество повторных попыток после сбоя, произошедшего при перемещении файла между дисками во время инициализации                                                                                                       | `100`                                                                                                       |
| `experimental_use_rocksdb`        | Использовать RocksDB как бэкенд-хранилище                                                                                                                                                                               | `0`                                                                                                         |

Конфигурация кворума находится в секции `<keeper_server>.<raft_configuration>` и содержит описание серверов.

Единственный параметр для всего кворума — `secure`, который включает зашифрованное соединение для взаимодействия между участниками кворума. Параметр может быть установлен в `true`, если для внутреннего обмена между узлами требуется SSL-соединение, или оставлен не заданным в противном случае.

Основные параметры для каждого `<server>`:

* `id` — Идентификатор сервера в кворуме.
* `hostname` — Имя хоста, на котором размещён этот сервер.
* `port` — Порт, на котором этот сервер принимает подключения.
* `can_become_leader` — Установите в `false`, чтобы настроить сервер как `learner`. Если параметр не указан, по умолчанию используется значение `true`.

:::note
В случае изменения топологии вашего кластера ClickHouse Keeper (например, при замене сервера) обязательно сохраняйте соответствие между `server_id` и `hostname` и избегайте перестановок или повторного использования уже существующего `server_id` для других серверов (например, это может произойти, если вы полагаетесь на скрипты автоматизации для развертывания ClickHouse Keeper).

Если хост экземпляра Keeper может меняться, мы рекомендуем использовать `hostname` вместо «сырых» IP-адресов. Изменение `hostname` эквивалентно удалению сервера и повторному добавлению его в кластер, что в некоторых случаях может быть невозможно (например, недостаточно экземпляров Keeper для кворума).
:::

:::note
`async_replication` по умолчанию отключена, чтобы не нарушать обратную совместимость. Если все ваши экземпляры Keeper в кластере работают на версии, которая поддерживает `async_replication` (v23.9+), мы рекомендуем включить её, так как это может улучшить производительность без каких-либо недостатков.
:::

Примеры конфигураций кворума с тремя узлами можно найти в [интеграционных тестах](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration) с префиксом `test_keeper_`. Пример конфигурации для сервера № 1:

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

### Как запустить \\{#how-to-run\\}

ClickHouse Keeper входит в пакет сервера ClickHouse: просто добавьте конфигурацию `<keeper_server>` в `/etc/your_path_to_config/clickhouse-server/config.xml` и запустите сервер ClickHouse как обычно. Если вы хотите запустить ClickHouse Keeper как отдельный компонент, вы можете запустить его аналогичным образом:

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

Если у вас нет символической ссылки (`clickhouse-keeper`), вы можете создать её или указать `keeper` в качестве аргумента для `clickhouse`:

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```

### Команды из четырёх букв \\{#four-letter-word-commands\\}

ClickHouse Keeper также предоставляет команды 4lw, которые почти идентичны командам в ZooKeeper. Каждая команда состоит из четырёх букв, таких как `mntr`, `stat` и т. д. Есть несколько более интересных команд: `stat` предоставляет общую информацию о сервере и подключённых клиентах, тогда как `srvr` и `cons` выдают расширенные сведения о сервере и соединениях соответственно.

Для 4lw-команд существует конфигурационный параметр белого списка `four_letter_word_white_list`, который по умолчанию имеет значение `conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld`.

Вы можете отправлять команды ClickHouse Keeper через telnet или nc, подключаясь к клиентскому порту.

```bash
echo mntr | nc localhost 9181
```

Ниже подробно описаны команды 4lw:

* `ruok`: Проверяет, работает ли сервер без ошибок. Сервер ответит `imok`, если он запущен. В противном случае он не ответит вовсе. Ответ `imok` не обязательно означает, что сервер вошёл в кворум, а лишь то, что серверный процесс активен и привязан к указанному клиентскому порту. Для получения подробной информации о состоянии в контексте кворума и сведений о клиентских подключениях используйте команду «stat».

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

* `srvr`: Отображает полную информацию о сервере.

```response
ClickHouse Keeper version: v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
Latency min/avg/max: 0/0/0
Received: 2
Sent : 2
Connections: 1
Outstanding: 0
Zxid: 34
Mode: leader
Node count: 4
```

* `stat`: Выводит краткую информацию о сервере и подключенных клиентах.

```response
ClickHouse Keeper version: v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
Clients:
 192.168.1.1:52852(recved=0,sent=0)
 192.168.1.1:52042(recved=24,sent=48)
Latency min/avg/max: 0/0/0
Received: 4
Sent : 4
Connections: 1
Outstanding: 0
Zxid: 36
Mode: leader
Node count: 4
```

* `srst`: Сбрасывает статистику сервера. Команда повлияет на результаты `srvr`, `mntr` и `stat`.

```response
Server stats reset.
```

* `conf`: Вывести подробные сведения о конфигурации сервиса.

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

* `cons`: Выводит полные сведения о соединениях/сеансах для всех клиентов, подключённых к этому серверу. Включает информацию о количестве полученных/отправленных пакетов, идентификаторе сеанса, задержках выполнения операций, последней выполненной операции и т. д.

```response
 192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
 192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

* `crst`: Сбросить статистику соединений/сеансов для всех подключений.

```response
Connection stats reset.
```

* `envi`: Вывести сведения о рабочем окружении сервиса

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

* `isro`: Проверяет, работает ли сервер в режиме только для чтения. Сервер ответит `ro`, если он в режиме только для чтения, или `rw`, если режим только для чтения не включён.

```response
rw
```

* `wchs`: Выводит краткую сводную информацию о наблюдениях на сервере.

```response
1 connections watching 1 paths
Total watches:1
```

* `wchc`: Выводит подробную информацию о наблюдениях (watches) на сервере, сгруппированную по сессиям. Возвращает список сессий (подключений) с соответствующими наблюдениями (путями). Обратите внимание: в зависимости от количества наблюдений эта операция может быть ресурсоёмкой (влиять на производительность сервера), поэтому используйте её с осторожностью.

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

* `wchp`: Выводит подробную информацию о наблюдениях (watches) для сервера по путям. Результатом является список путей (znode-узлов) с соответствующими сессиями. Обратите внимание: в зависимости от количества наблюдений эта операция может быть ресурсоёмкой (то есть влиять на производительность сервера), используйте её с осторожностью.

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

* `dump`: Выводит список незавершённых сессий и эфемерных узлов. Работает только на лидере.

```response
Sessions dump (2):
0x0000000000000001
0x0000000000000002
Sessions with Ephemerals (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

* `csnp`: Планирует задачу создания снапшота. Возвращает индекс последнего зафиксированного журнала запланированного снапшота в случае успеха или `Failed to schedule snapshot creation task.` в случае ошибки. Обратите внимание, что команда `lgif` может помочь определить, завершено ли создание снапшота.

```response
100
```

* `lgif`: Информация о логе Keeper. `first_log_idx` : мой первый индекс лога в хранилище логов; `first_log_term` : мой первый терм лога; `last_log_idx` : мой последний индекс лога в хранилище логов; `last_log_term` : мой последний терм лога; `last_committed_log_idx` : мой последний зафиксированный индекс лога в машине состояний; `leader_committed_log_idx` : зафиксированный индекс лога лидера в моём представлении; `target_committed_log_idx` : целевой индекс лога, который должен быть зафиксирован; `last_snapshot_idx` : максимальный зафиксированный индекс лога в последнем снапшоте.

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

* `rqld`: Запрос на избрание новым лидером. Возвращает `Sent leadership request to leader.` если запрос отправлен, или `Failed to send leadership request to leader.` если запрос не отправлен. Обратите внимание, что если узел уже является лидером, результат будет таким же, как и при успешной отправке запроса.

```response
Sent leadership request to leader.
```

* `ftfl`: Отображает список всех feature-флагов и показывает, включены ли они для экземпляра Keeper.

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

* `ydld`: Запрос на передачу лидерства и переход в состояние последователя. Если сервер, получающий запрос, является лидером, он сначала приостановит операции записи, затем дождётся, пока преемник (текущий лидер никогда не может быть преемником) не завершит догон по последним записям журнала, и после этого откажется от лидерства. Преемник будет выбран автоматически. Будет возвращено `Sent yield leadership request to leader.` если запрос отправлен, или `Failed to send yield leadership request to leader.` если запрос не был отправлен. Обратите внимание, что если узел уже является последователем, результат будет таким же, как если бы запрос был отправлен.

```response
Sent yield leadership request to leader.
```

* `pfev`: Возвращает значения для всех собранных событий. Для каждого события возвращает его имя, значение и описание.

```response
FileOpen        62      Number of files opened.
Seek    4       Number of times the 'lseek' function was called.
ReadBufferFromFileDescriptorRead        126     Number of reads (read/pread) from a file descriptor. Does not include sockets.
ReadBufferFromFileDescriptorReadFailed  0       Number of times the read (read/pread) from a file descriptor have failed.
ReadBufferFromFileDescriptorReadBytes   178846  Number of bytes read from file descriptors. If the file is compressed, this will show the compressed data size.
WriteBufferFromFileDescriptorWrite      7       Number of writes (write/pwrite) to a file descriptor. Does not include sockets.
WriteBufferFromFileDescriptorWriteFailed        0       Number of times the write (write/pwrite) to a file descriptor have failed.
WriteBufferFromFileDescriptorWriteBytes 153     Number of bytes written to file descriptors. If the file is compressed, this will show compressed data size.
FileSync        2       Number of times the F_FULLFSYNC/fsync/fdatasync function was called for files.
DirectorySync   0       Number of times the F_FULLFSYNC/fsync/fdatasync function was called for directories.
FileSyncElapsedMicroseconds     12756   Total time spent waiting for F_FULLFSYNC/fsync/fdatasync syscall for files.
DirectorySyncElapsedMicroseconds        0       Total time spent waiting for F_FULLFSYNC/fsync/fdatasync syscall for directories.
ReadCompressedBytes     0       Number of bytes (the number of bytes before decompression) read from compressed sources (files, network).
CompressedReadBufferBlocks      0       Number of compressed blocks (the blocks of data that are compressed independent of each other) read from compressed sources (files, network).
CompressedReadBufferBytes       0       Number of uncompressed bytes (the number of bytes after decompression) read from compressed sources (files, network).
AIOWrite        0       Number of writes with Linux or FreeBSD AIO interface
AIOWriteBytes   0       Number of bytes written with Linux or FreeBSD AIO interface
...
```

### HTTP-контроль \\{#http-control\\}

ClickHouse Keeper предоставляет HTTP-интерфейс для проверки готовности реплики к приему трафика. Он может использоваться в облачных средах, таких как [Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes).

Пример конфигурации, которая включает конечную точку `/ready`:

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

### Флаги возможностей \\{#feature-flags\\}

Keeper полностью совместим с ZooKeeper и его клиентами, но также добавляет несколько уникальных возможностей и типов запросов, которые могут использоваться клиентом ClickHouse.
Поскольку эти возможности могут вносить изменения, несовместимые с предыдущими версиями, большинство из них по умолчанию отключено и может быть включено с помощью параметра конфигурации `keeper_server.feature_flags`.
Все возможности могут быть явно отключены.
Если вы хотите включить новую возможность для кластера Keeper, мы рекомендуем сначала обновить все экземпляры Keeper в кластере до версии, которая поддерживает эту возможность, а затем включить саму возможность.

Пример конфигурации флагов возможностей, которая отключает `multi_read` и включает `check_not_exists`:

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

Доступны следующие возможности:

| Feature                | Description                                                                                                                                                        | Default |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| `multi_read`           | Поддержка запроса множественного чтения (`read multi`)                                                                                                             | `1`     |
| `filtered_list`        | Поддержка запроса `list`, который фильтрует результаты по типу узла (эфемерный или постоянный)                                                                     | `1`     |
| `check_not_exists`     | Поддержка запроса `CheckNotExists`, который проверяет, что узел не существует                                                                                      | `1`     |
| `create_if_not_exists` | Поддержка запроса `CreateIfNotExists`, который пытается создать узел, если он не существует. Если он уже существует, изменения не применяются и возвращается `ZOK` | `1`     |
| `remove_recursive`     | Поддержка запроса `RemoveRecursive`, который удаляет узел вместе с его поддеревом                                                                                  | `1`     |

:::note
Начиная с версии 25.7 некоторые флаги функций включены по умолчанию.\
Рекомендуемый способ обновления Keeper до версии 25.7+ — сначала обновиться до версии 24.9+.
:::

### Миграция с ZooKeeper \\{#migration-from-zookeeper\\}

Бесшовная миграция с ZooKeeper на ClickHouse Keeper невозможна. Необходимо остановить кластер ZooKeeper, преобразовать данные и запустить ClickHouse Keeper. Утилита `clickhouse-keeper-converter` позволяет преобразовать журналы и снимки состояния ZooKeeper в снимок состояния ClickHouse Keeper. Она работает только с ZooKeeper &gt; 3.4. Шаги миграции:

1. Остановите все узлы ZooKeeper.

2. Необязательно, но рекомендуется: найдите ведущий (leader) узел ZooKeeper, запустите и снова остановите его. Это заставит ZooKeeper создать согласованный снимок состояния.

3. Запустите `clickhouse-keeper-converter` на ведущем узле, например:

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. Скопируйте снимок (snapshot) на серверные узлы ClickHouse с настроенным `keeper` или запустите ClickHouse Keeper вместо ZooKeeper. Снимок должен храниться на всех узлах, иначе пустые узлы могут работать быстрее, и один из них может стать лидером.

:::note
Инструмент `keeper-converter` недоступен в отдельном бинарнике Keeper.
Если у вас установлен ClickHouse, вы можете использовать этот бинарник напрямую:

```bash
clickhouse keeper-converter ...
```

В противном случае вы можете [скачать исполняемый файл](/getting-started/quick-start/oss#download-the-binary) и запустить инструмент, как описано выше, без установки ClickHouse.
:::

### Восстановление после потери кворума \\{#recovering-after-losing-quorum\\}

Поскольку ClickHouse Keeper использует Raft, он может выдерживать определённое количество сбоев узлов в зависимости от размера кластера. \
Например, в кластере из 3 узлов он будет продолжать корректную работу, если выйдет из строя только 1 узел.

Конфигурацию кластера можно динамически изменять, но есть некоторые ограничения. Переконфигурация также опирается на Raft,
поэтому для добавления или удаления узла из кластера необходим кворум. Если вы потеряете слишком много узлов кластера одновременно и не сможете
запустить их снова, Raft перестанет работать и не позволит вам переконфигурировать кластер обычным способом.

Тем не менее, в ClickHouse Keeper есть режим восстановления, который позволяет принудительно переконфигурировать кластер, используя только один узел.
К этому следует прибегать только в самом крайнем случае, если вы не можете заново запустить узлы или развернуть новый экземпляр на том же endpoint.

Важные замечания перед продолжением:

* Убедитесь, что вышедшие из строя узлы не смогут снова подключиться к кластеру.
* Не запускайте ни один из новых узлов, пока это не будет явно указано в шагах.

После того как вы убедились, что вышеперечисленные условия соблюдены, выполните следующие действия:

1. Выберите один узел Keeper в качестве нового лидера. Имейте в виду, что данные этого узла будут использоваться для всего кластера, поэтому рекомендуется выбирать узел с наиболее актуальным состоянием.
2. Прежде чем что-либо делать, создайте резервную копию каталогов `log_storage_path` и `snapshot_storage_path` выбранного узла.
3. Переконфигурируйте кластер на всех узлах, которые вы планируете использовать.
4. Отправьте четырёхбуквенную команду `rcvr` на выбранный узел, что переведёт его в режим восстановления, ИЛИ остановите экземпляр Keeper на выбранном узле и запустите его снова с аргументом `--force-recovery`.
5. По одному запускайте экземпляры Keeper на новых узлах, убеждаясь, что `mntr` возвращает `follower` в поле `zk_server_state` перед запуском следующего.
6. В режиме восстановления ведущий (лидирующий) узел будет возвращать сообщение об ошибке на команду `mntr` до тех пор, пока не достигнет кворума с новыми узлами, и будет отклонять любые запросы от клиента и ведомых узлов.
7. После достижения кворума ведущий узел вернётся в нормальный режим работы и начнёт принимать все запросы через Raft — проверьте это с помощью `mntr`, который должен вернуть `leader` в поле `zk_server_state`.

## Использование дисков с Keeper \\{#using-disks-with-keeper\\}

Keeper поддерживает ограниченный набор [внешних дисков](/operations/storing-data.md) для хранения снимков, файлов журнала и файла состояния.

Поддерживаемые типы дисков:

* s3&#95;plain
* s3
* local

Ниже приведён пример описаний дисков в файле конфигурации.

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

Чтобы использовать диск для логов, параметр конфигурации `keeper_server.log_storage_disk` должен содержать имя диска.
Чтобы использовать диск для снимков (snapshots), параметр конфигурации `keeper_server.snapshot_storage_disk` должен содержать имя диска.
Дополнительно для последних логов и снимков могут использоваться разные диски с помощью параметров `keeper_server.latest_log_storage_disk` и `keeper_server.latest_snapshot_storage_disk` соответственно.
В этом случае Keeper будет автоматически перемещать файлы на соответствующие диски при создании новых логов или снимков.
Чтобы использовать диск для файла состояния, параметр конфигурации `keeper_server.state_storage_disk` должен содержать имя диска.

Перемещение файлов между дисками безопасно, и нет риска потери данных, даже если Keeper остановится посреди передачи.
Пока файл не будет полностью перенесён на новый диск, он не удаляется со старого.

Keeper с параметром `keeper_server.coordination_settings.force_sync`, установленным в `true` (`true` по умолчанию), не может обеспечить некоторые гарантии для всех типов дисков.
В данный момент только диски типа `local` поддерживают надёжный sync на диск.
Если используется `force_sync`, `log_storage_disk` должен быть диском типа `local`, если `latest_log_storage_disk` не используется.
Если используется `latest_log_storage_disk`, он всегда должен быть диском типа `local`.
Если `force_sync` отключён, диски любых типов могут использоваться в любой конфигурации.

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

Этот экземпляр будет хранить все логи, кроме последних, на диске `log_s3_plain`, а последние логи — на диске `log_local`.
Такая же логика применяется к снапшотам: все, кроме последних снапшотов, будут храниться на `snapshot_s3_plain`, а последний снапшот — на диске `snapshot_local`.

### Изменение конфигурации дисков \\{#changing-disk-setup\\}

:::important
Перед применением новой конфигурации дисков вручную создайте резервную копию всех логов и снапшотов Keeper.
:::

Если настроена многоуровневая конфигурация дисков (используются отдельные диски для последних файлов), Keeper попытается автоматически переместить файлы на нужные диски при запуске.
Гарантии остаются такими же, как и раньше: пока файл полностью не перенесён на новый диск, он не удаляется со старого, поэтому можно безопасно выполнять несколько перезапусков.

Если необходимо перенести файлы на полностью новый диск (или перейти с конфигурации с двумя дисками на конфигурацию с одним диском), можно использовать несколько определений параметров `keeper_server.old_snapshot_storage_disk` и `keeper_server.old_log_storage_disk`.

Следующая конфигурация показывает, как можно перейти с предыдущей конфигурации с двумя дисками на полностью новую конфигурацию с одним диском:

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
Кроме того, все файлы снимков состояния будут перемещены с дисков `snapshot_local` и `snapshot_s3_plain` на диск `snapshot_local2`.

## Настройка кэша логов \\{#configuring-logs-cache\\}

Чтобы минимизировать объём данных, читаемых с диска, Keeper кэширует записи журнала в памяти.
Если запросы большие, журнальные записи будут занимать слишком много памяти, поэтому объём кэшируемых логов ограничен.
Этот предел настраивается с помощью следующих двух конфигурационных параметров:
- `latest_logs_cache_size_threshold` — общий размер последних логов, хранящихся в кэше
- `commit_logs_cache_size_threshold` — общий размер следующих по порядку логов, которые предстоит закоммитить

Если значения по умолчанию слишком велики, вы можете сократить потребление памяти, уменьшив значения этих двух параметров.

:::note
Вы можете использовать команду `pfev`, чтобы проверить объём логов, прочитанных из каждого кэша и из файла.
Также вы можете использовать метрики с эндпоинта Prometheus для отслеживания текущего размера обоих кэшей.
:::

## Prometheus \\{#prometheus\\}

Keeper может предоставлять метрики для сбора с помощью [Prometheus](https://prometheus.io).

Настройки:

* `endpoint` – HTTP-эндпоинт для сбора метрик сервером Prometheus. Должен начинаться с &#39;/&#39;.
* `port` – Порт для `endpoint`.
* `metrics` – Флаг, включающий экспорт метрик из таблицы [system.metrics](/operations/system-tables/metrics).
* `events` – Флаг, включающий экспорт метрик из таблицы [system.events](/operations/system-tables/events).
* `asynchronous_metrics` – Флаг, включающий экспорт текущих значений метрик из таблицы [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics).

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

Проверьте (замените `127.0.0.1` на IP-адрес или имя хоста сервера ClickHouse):

```bash
curl 127.0.0.1:9363/metrics
```

См. также раздел ClickHouse Cloud [Интеграция с Prometheus](/integrations/prometheus).

## Руководство пользователя ClickHouse Keeper \\{#clickhouse-keeper-user-guide\\}

В этом руководстве приведены простые и минимальные настройки для конфигурации ClickHouse Keeper с примером проверки распределённых операций. Пример выполняется с использованием 3 узлов под управлением Linux.

### 1. Настройка узлов с параметрами Keeper \\{#1-configure-nodes-with-keeper-settings\\}

1. Установите 3 экземпляра ClickHouse на 3 хоста (`chnode1`, `chnode2`, `chnode3`). (См. раздел [Быстрый старт](/getting-started/install/install.mdx) для получения подробной информации по установке ClickHouse.)

2. На каждом узле добавьте следующую запись, чтобы разрешить внешние подключения через сетевой интерфейс.
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. Добавьте следующую конфигурацию ClickHouse Keeper на все три сервера, обновив параметр `<server_id>` для каждого сервера; для `chnode1` он будет `1`, для `chnode2` — `2` и т. д.
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

    Ниже приведены базовые настройки, использованные выше:

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |tcp_port   |порт, используемый клиентами Keeper|9181 — значение по умолчанию, аналогичное 2181 в ZooKeeper|
    |server_id| идентификатор для каждого сервера ClickHouse Keeper, используемый в конфигурации Raft| 1|
    |coordination_settings| секция с параметрами, такими как тайм-ауты| тайм-ауты: 10000, уровень логирования: trace|
    |server    |определение сервера-участника|список определений каждого сервера|
    |raft_configuration| настройки для каждого сервера в кластере Keeper| сервер и настройки для каждого|
    |id      |числовой идентификатор сервера для сервисов Keeper|1|
    |hostname   |имя хоста (hostname), IP-адрес или FQDN каждого сервера в кластере Keeper|`chnode1.domain.com`|
    |port|порт для прослушивания межсерверных подключений Keeper|9234|

4.  Включите компонент Zookeeper. Он будет использовать движок ClickHouse Keeper:
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

    Ниже приведены базовые настройки, использованные выше:

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |node   |список узлов для подключений ClickHouse Keeper|запись настроек для каждого сервера|
    |host|имя хоста (hostname), IP-адрес или FQDN каждого узла ClickHouse Keeper| `chnode1.domain.com`|
    |port|клиентский порт ClickHouse Keeper| 9181|

5. Перезапустите ClickHouse и убедитесь, что каждый экземпляр Keeper запущен. Выполните следующую команду на каждом сервере. Команда `ruok` возвращает `imok`, если Keeper запущен и находится в исправном состоянии:
    ```bash
    # echo ruok | nc localhost 9181; echo
    imok
    ```

6. В базе данных `system` есть таблица с именем `zookeeper`, которая содержит сведения о ваших экземплярах ClickHouse Keeper. Посмотрим содержимое таблицы:
    ```sql
    SELECT *
    FROM system.zookeeper
    WHERE path IN ('/', '/clickhouse')
    ```

Таблица выглядит так:

```response
┌─name───────┬─value─┬─czxid─┬─mzxid─┬───────────────ctime─┬───────────────mtime─┬─version─┬─cversion─┬─aversion─┬─ephemeralOwner─┬─dataLength─┬─numChildren─┬─pzxid─┬─path────────┐
│ clickhouse │       │   124 │   124 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        2 │        0 │              0 │          0 │           2 │  5693 │ /           │
│ task_queue │       │   125 │   125 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        1 │        0 │              0 │          0 │           1 │   126 │ /clickhouse │
│ tables     │       │  5693 │  5693 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        3 │        0 │              0 │          0 │           3 │  6461 │ /clickhouse │
└────────────┴───────┴───────┴───────┴─────────────────────┴─────────────────────┴─────────┴──────────┴──────────┴────────────────┴────────────┴─────────────┴───────┴─────────────┘
```

### 2.  Настройте кластер в ClickHouse \\{#2--configure-a-cluster-in-clickhouse\\}

1. Настроим простой кластер с 2 шардами и только одной репликой на 2 из узлов. Третий узел будет использоваться для достижения кворума, требуемого в ClickHouse Keeper. Обновите конфигурацию на `chnode1` и `chnode2`. Следующий кластер определяет по 1 шарду на каждом узле, всего 2 шарда без репликации. В этом примере часть данных будет находиться на одном узле, а часть — на другом:

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

   | Parameter | Description                                                                              | Example                            |
   | --------- | ---------------------------------------------------------------------------------------- | ---------------------------------- |
   | shard     | список реплик в определении кластера                                                     | список реплик для каждого шарда    |
   | replica   | список настроек для каждой реплики                                                       | записи настроек для каждой реплики |
   | host      | hostname, IP или FQDN сервера, на котором будет размещаться реплика шарда                | `chnode1.domain.com`               |
   | port      | порт, используемый для связи через нативный tcp‑протокол                                 | 9000                               |
   | user      | имя пользователя, которое будет использоваться для аутентификации в экземплярах кластера | default                            |
   | password  | пароль для пользователя, определённого для разрешения подключений к экземплярам кластера | `ClickHouse123!`                   |

2. Перезапустите ClickHouse и убедитесь, что кластер был создан:

   ```bash
   SHOW clusters;
   ```

   Вы должны увидеть свой кластер:

   ```response
   ┌─cluster───────┐
   │ cluster_2S_1R │
   └───────────────┘
   ```

### 3. Создайте и протестируйте распределённую таблицу \\{#3-create-and-test-distributed-table\\}

1. Создайте новую базу данных на новом кластере, используя ClickHouse client на `chnode1`. Оператор `ON CLUSTER` автоматически создаёт базу данных на обоих узлах.
   ```sql
   CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
   ```

2. Создайте новую таблицу в базе данных `db1`. Как и раньше, `ON CLUSTER` создаёт таблицу на обоих узлах.
    ```sql
    CREATE TABLE db1.table1 on cluster 'cluster_2S_1R'
    (
        `id` UInt64,
        `column1` String
    )
    ENGINE = MergeTree
    ORDER BY column1
    ```

3. На узле `chnode1` добавьте пару строк:
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (1, 'abc'),
        (2, 'def')
    ```

4. Добавьте пару строк на узле `chnode2`:
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (3, 'ghi'),
        (4, 'jkl')
    ```

5. Обратите внимание, что выполнение запроса `SELECT` на каждом узле показывает только данные, находящиеся на этом узле. Например, на `chnode1`:
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

    2 rows in set. Elapsed: 0.006 sec.
    ```

    На `chnode2`:
6.
    ```sql
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

6. Вы можете создать таблицу `Distributed`, которая будет представлять данные на двух шардах. Таблицы с движком `Distributed` не хранят собственные данные, но обеспечивают распределённую обработку запросов по нескольким серверам. Чтения выполняются по всем шардам, а записи могут распределяться между шардами. Выполните следующий запрос на `chnode1`:
    ```sql
    CREATE TABLE db1.dist_table (
        id UInt64,
        column1 String
    )
    ENGINE = Distributed(cluster_2S_1R,db1,table1)
    ```

7. Обратите внимание, что запрос к `dist_table` возвращает все четыре строки данных с двух шардов:
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

    4 rows in set. Elapsed: 0.018 sec.
    ```

### Итоги \\{#summary\\}

В этом руководстве показано, как настроить кластер с использованием ClickHouse Keeper. С ClickHouse Keeper вы можете настраивать кластеры и создавать распределённые таблицы, которые могут реплицироваться по шардам.

## Настройка ClickHouse Keeper с уникальными путями \\{#configuring-clickhouse-keeper-with-unique-paths\\}

<SelfManaged />

### Описание \\{#description\\}

В этой статье описывается, как использовать встроенную настройку макроса `{uuid}`
для создания уникальных записей в ClickHouse Keeper или ZooKeeper. Уникальные
пути полезны при частом создании и удалении таблиц, поскольку это позволяет
избежать ожидания в течение нескольких минут, пока сборщик мусора Keeper
удалит записи путей: каждый раз при создании пути в нём используется новый `uuid`,
пути никогда не переиспользуются.

### Пример окружения \\{#example-environment\\}

Кластер из трёх узлов, который будет настроен таким образом, что ClickHouse Keeper
будет работать на всех трёх узлах, а ClickHouse — на двух из этих узлов. Это
обеспечивает три узла для ClickHouse Keeper (включая узел-арбитр) и один шард
ClickHouse, состоящий из двух реплик.

| node                    | description                           |
| ----------------------- | ------------------------------------- |
| `chnode1.marsnet.local` | узел данных — кластер `cluster_1S_2R` |
| `chnode2.marsnet.local` | узел данных — кластер `cluster_1S_2R` |
| `chnode3.marsnet.local` | узел-арбитр ClickHouse Keeper         |

Пример конфигурации для кластера:

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

### Процедуры по настройке таблиц для использования `{uuid}` \\{#procedures-to-set-up-tables-to-use-uuid\\}

1. Настройте макросы на каждом сервере\
   пример для сервера 1:

```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
```

:::note
Обратите внимание, что мы определяем макросы для `shard` и `replica`, но `{uuid}` здесь не определён — это встроенный параметр, и его не нужно задавать вручную.
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

ID запроса: 07fb7e65-beb4-4c30-b3ef-bd303e5c42b5

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

3. Создайте таблицу на кластере, используя макросы и `{uuid}`

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

┌─host──────────────────┬─port─┬─status─┬─error─┬─num&#95;hosts&#95;remaining─┬─num&#95;hosts&#95;active─┐
│ chnode1.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode2.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

```

4.  Создайте распределённую таблицу

```sql
CREATE TABLE db_uuid.dist_uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = Distributed('cluster_1S_2R', 'db_uuid', 'uuid_table1' );
```

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

1. Добавьте данные на первый узел (например, `chnode1`)

```sql
INSERT INTO db_uuid.uuid_table1
   ( id, column1)
   VALUES
   ( 1, 'abc');
```

```response
INSERT INTO db_uuid.uuid_table1 (id, column1) FORMAT Values

Идентификатор запроса: 0f178db7-50a6-48e2-9a1b-52ed14e6e0f9

ОК.

Обработана 1 строка. Время выполнения: 0.033 сек.
```

2. Запишите данные на второй узел (например, `chnode2`)

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

Обработана 1 строка. Затрачено: 0.529 сек.
```

3. Просмотр записей через распределённую таблицу

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

2 строки в наборе. Затрачено: 0.007 сек.
```

### Альтернативы {#alternatives}

Путь репликации по умолчанию можно заранее задать с помощью макросов, включая `{uuid}`.

1. Задать значение по умолчанию для таблиц на каждом узле

```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

:::tip
Вы также можете задать макрос `{database}` на каждом узле, если отдельные узлы используются для конкретных баз данных.
:::

2. Создайте таблицу без явных параметров:

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

ID запроса: ab68cda9-ae41-4d6d-8d3b-20d8255774ee

┌─хост──────────────────┬─порт─┬─статус─┬─ошибка─┬─число&#95;оставшихся&#95;хостов─┬─число&#95;активных&#95;хостов─┐
│ chnode2.marsnet.local │ 9440 │      0 │        │                             1 │                            0 │
│ chnode1.marsnet.local │ 9440 │      0 │        │                             0 │                            0 │
└───────────────────────┴──────┴────────┴────────┴───────────────────────────────┴──────────────────────────────┘

2 строки в наборе. Время выполнения: 1.175 сек.

```

3. Убедитесь, что использованы настройки из конфигурации по умолчанию
```sql
SHOW CREATE TABLE db_uuid.uuid_table1;
```

```response
SHOW CREATE TABLE db_uuid.uuid_table1

CREATE TABLE db_uuid.uuid_table1
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}')
ORDER BY id

Получена 1 строка. Прошло: 0.003 сек.
```

### Устранение неполадок \\{#troubleshooting\\}

Пример команды для получения информации о таблице и UUID:

```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

Пример команды для получения информации о таблице в ZooKeeper, содержащей UUID таблицы, указанной выше

```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
База данных должна быть типа `Atomic`. Если вы выполняете обновление с предыдущей версии, то
база данных `default`, скорее всего, имеет тип `Ordinary`.
:::

Чтобы проверить:

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

Результат: 1 строка. Затрачено: 0.004 сек.
```

## Динамическая переконфигурация ClickHouse Keeper {#reconfiguration}

<SelfManaged />

### Описание \\{#description-1\\}

ClickHouse Keeper частично поддерживает команду ZooKeeper [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying)
для динамической переконфигурации кластера, если параметр `keeper_server.enable_reconfiguration` включён.

:::note
Если этот параметр выключен, вы можете переконфигурировать кластер, вручную изменив секцию `raft_configuration`
реплики. Убедитесь, что вы редактируете файлы на всех репликах, так как только лидер применит изменения.
В качестве альтернативы вы можете отправить запрос `reconfig` через любой клиент, совместимый с ZooKeeper.
:::

Виртуальный узел `/keeper/config` содержит последнюю зафиксированную конфигурацию кластера в следующем формате:

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

* Каждая запись о сервере располагается на отдельной строке.
* `server_type` может иметь значение `participant` или `learner` ([learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md) не участвует в выборах лидера).
* `server_priority` — неотрицательное целое число, определяющее, [какие узлы должны иметь приоритет на выборах лидера](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md).
  Приоритет 0 означает, что сервер никогда не станет лидером.

Пример:

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

Вы можете использовать команду `reconfig`, чтобы добавлять новые серверы, удалять существующие и изменять их приоритеты. Ниже приведены примеры (с использованием `clickhouse-keeper-client`):

```bash
# Добавление двух новых серверов {#add-two-new-servers}
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"
# Удаление двух других серверов {#remove-two-other-servers}
reconfig remove "3,4"
# Изменение приоритета существующего сервера на 8 {#change-existing-server-priority-to-8}
reconfig add "server.5=localhost:5123;participant;8"
```

Вот несколько примеров для `kazoo`:

```python
# Добавление двух новых серверов и удаление двух других серверов {#add-two-new-servers-remove-two-other-servers}
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")
```

# Изменить приоритет существующего сервера на 8 {#change-existing-server-priority-to-8}

reconfig(joining=&quot;server.5=localhost:5123;participant;8&quot;, leaving=None)

```

Серверы в `joining` должны быть указаны в формате сервера, описанном выше. Записи серверов должны разделяться запятыми.
При добавлении новых серверов можно опустить `server_priority` (значение по умолчанию — 1) и `server_type` (значение по умолчанию — `participant`).

Если требуется изменить приоритет существующего сервера, добавьте его в `joining` с целевым приоритетом.
Хост, порт и тип сервера должны совпадать с существующей конфигурацией сервера.

Серверы добавляются и удаляются в порядке их появления в `joining` и `leaving`.
Все обновления из `joining` обрабатываются перед обновлениями из `leaving`.

В реализации переконфигурации Keeper существуют некоторые ограничения:

- Поддерживается только инкрементальная переконфигурация. Запросы с непустым `new_members` отклоняются.

  Реализация ClickHouse Keeper использует API NuRaft для динамического изменения состава участников. NuRaft позволяет
  добавлять или удалять только один сервер за раз. Это означает, что каждое изменение конфигурации
  (каждая часть `joining`, каждая часть `leaving`) должно обрабатываться отдельно. Таким образом, массовая
  переконфигурация недоступна, так как это могло бы ввести конечных пользователей в заблуждение.

  Изменение типа сервера (participant/learner) также невозможно, поскольку это не поддерживается NuRaft, и
  единственным способом было бы удаление и добавление сервера, что опять же могло бы ввести в заблуждение.

- Невозможно использовать возвращаемое значение `znodestat`.
- Поле `from_version` не используется. Все запросы с установленным `from_version` отклоняются.
  Это связано с тем, что `/keeper/config` является виртуальным узлом, то есть он не хранится в
  постоянном хранилище, а генерируется на лету с указанной конфигурацией узла для каждого запроса.
  Это решение было принято, чтобы не дублировать данные, поскольку NuRaft уже хранит эту конфигурацию.
- В отличие от ZooKeeper, отсутствует возможность ожидания переконфигурации кластера путем отправки команды `sync`.
  Новая конфигурация будет _в конечном итоге_ применена, но без гарантий по времени.
- Команда `reconfig` может завершиться неудачей по различным причинам. Можно проверить состояние кластера и убедиться, что обновление
  было применено.
```

## Преобразование одиночного узла Keeper в кластер {#converting-a-single-node-keeper-into-a-cluster}

Иногда требуется расширить экспериментальный узел Keeper до полноценного кластера. Ниже приведена пошаговая схема, как это сделать для кластера из 3 узлов:

- **ВАЖНО**: новые узлы необходимо добавлять партиями, меньшими, чем текущий кворум, иначе они смогут выбрать лидера среди себя. В этом примере узлы добавляются по одному.
- Для существующего узла Keeper должен быть включён конфигурационный параметр `keeper_server.enable_reconfiguration`.
- Запустите второй узел с полной новой конфигурацией кластера Keeper.
- После его запуска добавьте его к узлу 1 с помощью [`reconfig`](#reconfiguration).
- Теперь запустите третий узел и добавьте его с помощью [`reconfig`](#reconfiguration).
- Обновите конфигурацию `clickhouse-server`, добавив туда новый узел Keeper, и перезапустите сервер для применения изменений.
- Обновите конфигурацию Raft на узле 1 и, при необходимости, перезапустите его.

Чтобы лучше освоить этот процесс, можно воспользоваться [репозиторием-песочницей](https://github.com/ClickHouse/keeper-extend-cluster).

## Неподдерживаемые функции \\{#unsupported-features\\}

Хотя ClickHouse Keeper стремится быть полностью совместимым с ZooKeeper, есть несколько функций, которые в настоящее время не реализованы (разработка продолжается):

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) не поддерживает возврат объекта `Stat`
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) не поддерживает [TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL)
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode)) не работает с постоянными наблюдениями [`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT)
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean)) и [`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher.WatcherType,boolean)) не поддерживаются
- `setWatches` не поддерживается
- Создание узлов znode типа [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html) не поддерживается
- Аутентификация по [`SASL`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL) не поддерживается
