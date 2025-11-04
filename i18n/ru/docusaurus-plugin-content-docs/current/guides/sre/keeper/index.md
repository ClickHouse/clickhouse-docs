---
slug: '/guides/sre/keeper/clickhouse-keeper'
sidebar_label: 'Конфигурация ClickHouse Keeper'
sidebar_position: 10
description: 'ClickHouse Keeper, или clickhouse-keeper, заменяет ZooKeeper и обеспечивает'
title: 'ClickHouse Keeper'
keywords: ['Keeper', 'ZooKeeper', 'clickhouse-keeper']
doc_type: guide
---
import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';


# ClickHouse Keeper (clickhouse-keeper)

<SelfManaged />

ClickHouse Keeper предоставляет систему координации для [репликации](/engines/table-engines/mergetree-family/replication.md) данных и выполнения [распределенных DDL](/sql-reference/distributed-ddl.md) запросов. ClickHouse Keeper совместим с ZooKeeper.
### Подробности реализации {#implementation-details}

ZooKeeper является одной из первых известных открытых систем координации. Она реализована на Java и имеет достаточно простую и мощную модель данных. Алгоритм координации ZooKeeper, ZooKeeper Atomic Broadcast (ZAB), не обеспечивает гарантии линейности для чтений, поскольку каждый узел ZooKeeper обслуживает чтения локально. В отличие от ZooKeeper, ClickHouse Keeper написан на C++ и использует [алгоритм RAFT](https://raft.github.io/) [реализация](https://github.com/eBay/NuRaft). Этот алгоритм обеспечивает линейность как для чтений, так и для записей, и имеет несколько открытых реализаций на различных языках.

По умолчанию ClickHouse Keeper предоставляет те же гарантии, что и ZooKeeper: линейные записи и нелинейные чтения. У него совместимый клиент-серверный протокол, поэтому любой стандартный клиент ZooKeeper может быть использован для взаимодействия с ClickHouse Keeper. Снимки и журналы имеют несовместимый формат с ZooKeeper, но инструмент `clickhouse-keeper-converter` позволяет конвертировать данные ZooKeeper в снимки ClickHouse Keeper. Протокол взаимодействия между серверами в ClickHouse Keeper также несовместим с ZooKeeper, поэтому смешанный кластер ZooKeeper / ClickHouse Keeper невозможен.

ClickHouse Keeper поддерживает списки контроля доступа (ACL) так же, как это делает [ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl). ClickHouse Keeper поддерживает тот же набор разрешений и имеет идентичные встроенные схемы: `world`, `auth` и `digest`. Схема аутентификации digest использует пару `username:password`, пароль кодируется в Base64.

:::note
Внешняя интеграция не поддерживается.
:::
### Конфигурация {#configuration}

ClickHouse Keeper может быть использован как самостоятельная замена ZooKeeper или как внутренняя часть сервера ClickHouse. В обоих случаях конфигурация почти такая же — `.xml` файл.
#### Настройки конфигурации Keeper {#keeper-configuration-settings}

Основной тег конфигурации ClickHouse Keeper — `<keeper_server>`, и он имеет следующие параметры:

| Параметр                             | Описание                                                                                                                                                                                                                                            | По умолчанию                                                                                                  |
|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| `tcp_port`                            | Порт для подключения клиента.                                                                                                                                                                                                                      | `2181`                                                                                                       |
| `tcp_port_secure`                     | Защищенный порт для SSL-соединения между клиентом и сервером Keeper.                                                                                                                                                                             | -                                                                                                            |
| `server_id`                           | Уникальный идентификатор сервера, каждый участник кластера ClickHouse Keeper должен иметь уникальный номер (1, 2, 3 и так далее).                                                                                                                  | -                                                                                                            |
| `log_storage_path`                    | Путь к логам координации, так же как и в ZooKeeper лучше всего хранить логи на не загруженных узлах.                                                                                                                                              | -                                                                                                            |
| `snapshot_storage_path`               | Путь к снимкам координации.                                                                                                                                                                                                                       | -                                                                                                            |
| `enable_reconfiguration`              | Включение динамической переконфигурации кластера через [`reconfig`](#reconfiguration).                                                                                                                                                           | `False`                                                                                                      |
| `max_memory_usage_soft_limit`         | Мягкий предел в байтах для максимального использования памяти Keeper.                                                                                                                                                                             | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount`                                               |
| `max_memory_usage_soft_limit_ratio`   | Если `max_memory_usage_soft_limit` не установлен или установлен в ноль, мы используем это значение для определения стандартного мягкого предела.                                                                                                   | `0.9`                                                                                                        |
| `cgroups_memory_observer_wait_time`   | Если `max_memory_usage_soft_limit` не установлен или установлен в `0`, мы используем этот интервал для наблюдения за количеством физической памяти. После изменения объема памяти мы пересчитаем мягкий предел памяти Keeper по `max_memory_usage_soft_limit_ratio`. | `15`                                                                                                         |
| `http_control`                        | Конфигурация интерфейса [HTTP управления](#http-control).                                                                                                                                                                                        | -                                                                                                            |
| `digest_enabled`                      | Включить проверку согласованности данных в реальном времени                                                                                                                                                                                      | `True`                                                                                                       |
| `create_snapshot_on_exit`             | Создать снимок при завершении работы                                                                                                                                                                                                              | -                                                                                                            |
| `hostname_checks_enabled`             | Включить проверки целостности имен хостов для конфигурации кластера (например, если localhost используется с удаленными конечными точками)                                                                                                       | `True`                                                                                                       |
| `four_letter_word_white_list`         | Белый список команд 4lw.                                                                                                                                                                                                                           | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |
| `enable_ipv6`                         | Включить IPv6                                                                                                                                                                                                                                     | `True`                                                                                                       |

Другие общие параметры наследуются от конфигурации сервера ClickHouse (`listen_host`, `logger` и так далее).
#### Внутренние настройки координации {#internal-coordination-settings}

Внутренние настройки координации расположены в разделе `<keeper_server>.<coordination_settings>` и имеют следующие параметры:

| Параметр                           | Описание                                                                                                                                                                                                                      | По умолчанию                                                                                                  |
|-------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`              | Тайм-аут для одной операции клиента (мс)                                                                                                                                                                                     | `10000`                                                                                                      |
| `min_session_timeout_ms`            | Минимальный тайм-аут для сессии клиента (мс)                                                                                                                                                                                | `10000`                                                                                                      |
| `session_timeout_ms`                | Максимальный тайм-аут для сессии клиента (мс)                                                                                                                                                                               | `100000`                                                                                                     |
| `dead_session_check_period_ms`      | Как часто ClickHouse Keeper проверяет мертвые сессии и удаляет их (мс)                                                                                                                                                       | `500`                                                                                                        |
| `heart_beat_interval_ms`            | Как часто лидер ClickHouse Keeper будет посылать сигналы о работоспособности (heartbeats) подписчикам (мс)                                                                                                                      | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`   | Если подписчик не получает сигнал о работоспособности от лидера в этом интервале, то он может инициировать выборы лидера. Должен быть меньше или равен `election_timeout_upper_bound_ms`. Идеально, если они не равны.   | `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`   | Если подписчик не получает сигнал о работоспособности от лидера в этом интервале, то он должен инициировать выборы лидера.                                                                                                  | `2000`                                                                                                       |
| `rotate_log_storage_interval`       | Сколько записей журнала хранить в одном файле.                                                                                                                                                                              | `100000`                                                                                                     |
| `reserved_log_items`                | Сколько записей журнала координации хранить перед компакцией.                                                                                                                                                               | `100000`                                                                                                     |
| `snapshot_distance`                 | Как часто ClickHouse Keeper будет создавать новые снимки (в количестве записей в журналах).                                                                                                                                 | `100000`                                                                                                     |
| `snapshots_to_keep`                 | Сколько снимков хранить.                                                                                                                                                                                                    | `3`                                                                                                          |
| `stale_log_gap`                     | Порог, когда лидер считает подписчика устаревшим и отправляет ему снимок вместо журналов.                                                                                                                                    | `10000`                                                                                                      |
| `fresh_log_gap`                     | Когда узел становится свежим.                                                                                                                                                                                              | `200`                                                                                                        |
| `max_requests_batch_size`           | Максимальный размер партии в количестве запросов, прежде чем она будет отправлена в RAFT.                                                                                                                                   | `100`                                                                                                        |
| `force_sync`                        | Вызывать `fsync` при каждой записи в ведение журнала координации.                                                                                                                                                           | `true`                                                                                                       |
| `quorum_reads`                      | Выполнять чтения, как записи через весь консенсус RAFT с аналогичной скоростью.                                                                                                                                              | `false`                                                                                                      |
| `raft_logs_level`                   | Уровень текстового логирования о координации (trace, debug и т. д.).                                                                                                                                                        | `system default`                                                                                             |
| `auto_forwarding`                   | Разрешить пересылку запросов на запись от подписчиков к лидеру.                                                                                                                                                             | `true`                                                                                                       |
| `shutdown_timeout`                  | Ждать завершения внутренних соединений и завершения работы (мс).                                                                                                                                                             | `5000`                                                                                                       |
| `startup_timeout`                   | Если сервер не подключается к другим участникам кворума в указанный тайм-аут, он завершит работу (мс).                                                                                                                      | `30000`                                                                                                      |
| `async_replication`                 | Включить асинхронную репликацию. Все гарантии записи и чтения сохраняются, при этом достигается лучшая производительность. Настройка по умолчанию отключена, чтобы не нарушать обратную совместимость.                      | `false`                                                                                                      |
| `latest_logs_cache_size_threshold`  | Максимальный общий размер кэша в памяти для последних записей журнала.                                                                                                                                                      | `1GiB`                                                                                                       |
| `commit_logs_cache_size_threshold`  | Максимальный общий размер кэша в памяти для записей журнала, необходимых для последующего коммита.                                                                                                                            | `500MiB`                                                                                                     |
| `disk_move_retries_wait_ms`         | Как долго ждать между попытками после сбоя, который произошел во время перемещения файла между дисками.                                                                                                                      | `1000`                                                                                                       |
| `disk_move_retries_during_init`     | Количество попыток после сбоя, который произошел во время перемещения файла между дисками во время инициализации.                                                                                                          | `100`                                                                                                        |
| `experimental_use_rocksdb`          | Использовать rocksdb как хранилище.                                                                                                                                                                                        | `0`                                                                                                          |

Конфигурация кворума расположена в разделе `<keeper_server>.<raft_configuration>` и содержит описание серверов.

Единственный параметр для всего кворума — `secure`, который включает зашифрованное соединение для связи между участниками кворума. Параметр может быть установлен в `true`, если для внутренней связи между узлами требуется SSL-соединение, или оставлен неуказанным в противном случае.

Основные параметры для каждого `<server>`:

- `id` — Идентификатор сервера в кворуме.
- `hostname` — Имя хоста, где расположен этот сервер.
- `port` — Порт, на котором этот сервер слушает подключения.
- `can_become_leader` — Установите в `false`, чтобы настроить сервер в качестве `learner`. Если опущено, значение равно `true`.

:::note
В случае изменения топологии вашего кластера ClickHouse Keeper (например, замена сервера), пожалуйста, убедитесь, что отображение `server_id` на `hostname` остается последовательным и избегайте перемешивания или повторного использования существующего `server_id` для различных серверов (например, это может произойти, если вы полагаетесь на автоматизированные скрипты для развертывания ClickHouse Keeper).

Если хост экземпляра Keeper может изменяться, мы рекомендуем определять и использовать имя хоста вместо необработанных IP-адресов. Изменение имени хоста эквивалентно удалению и повторному добавлению сервера, что в некоторых случаях может быть невозможно сделать (например, если недостаточно экземпляров Keeper для кворума).
:::

:::note
`async_replication` отключен по умолчанию, чтобы избежать нарушения обратной совместимости. Если у вас все экземпляры Keeper в кластере работают на версии, поддерживающей `async_replication` (v23.9+), мы рекомендуем его включить, так как это может улучшить производительность без каких-либо недостатков.
:::

Примеры конфигурации для кворума с тремя узлами можно найти в [интеграционных тестах](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration) с префиксом `test_keeper_`. Пример конфигурации для сервера #1:

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

ClickHouse Keeper включен в пакет сервера ClickHouse, просто добавьте конфигурацию `<keeper_server>` в ваш `/etc/your_path_to_config/clickhouse-server/config.xml` и запустите сервер ClickHouse как обычно. Если вы хотите запустить ClickHouse Keeper отдельно, вы можете запустить его аналогично:

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

Если у вас нет символической ссылки (`clickhouse-keeper`), вы можете создать ее или указать `keeper` в качестве аргумента для `clickhouse`:

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```
### Команды четырехбуквенных слов {#four-letter-word-commands}

ClickHouse Keeper также предоставляет команды 4lw, которые почти идентичны командам ZooKeeper. Каждая команда состоит из четырех букв, таких как `mntr`, `stat` и т. д. Есть несколько более интересных команд: `stat` предоставляет общую информацию о сервере и подключенных клиентах, в то время как `srvr` и `cons` дают расширенные данные о сервере и подключениях соответственно.

Команды 4lw имеют конфигурацию белого списка `four_letter_word_white_list`, которая имеет значение по умолчанию `conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld`.

Вы можете отправить команды в ClickHouse Keeper через telnet или nc на клиентском порту.

```bash
echo mntr | nc localhost 9181
```

Ниже приведены подробные команды 4lw:

- `ruok`: Проверяет, работает ли сервер в неошибочном состоянии. Сервер ответит `imok`, если он работает. В противном случае он не ответит вообще. Ответ `imok` не обязательно указывает на то, что сервер вошел в кворум, только что процесс сервера активен и привязан к указанному клиентскому порту. Используйте "stat" для получения подробной информации о состоянии относительно кворума и информации о подключениях клиентов.

```response
imok
```

- `mntr`: Выводит список переменных, которые могут быть использованы для мониторинга состояния кластера.

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

- `srvr`: Перечисляет полные данные о сервере.

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

- `stat`: Перечисляет краткие детали о сервере и подключенных клиентах.

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

- `srst`: Сбросить статистику сервера. Команда повлияет на результат `srvr`, `mntr` и `stat`.

```response
Server stats reset.
```

- `conf`: Печатает детали о конфигурации сервера.

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

- `cons`: Перечисляет полные детали соединения/сессии для всех клиентов, подключенных к этому серверу. Включает информацию о количестве полученных/отправленных пакетов, идентификаторе сессии, задержках операций, последней выполненной операции и т. д.

```response
192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

- `crst`: Сбросить статистику соединения/сессии для всех соединений.

```response
Connection stats reset.
```

- `envi`: Печатает детали о среде сервера.

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

- `dirs`: Показывает общий размер снимков и файлов журналов в байтах.

```response
snapshot_dir_size: 0
log_dir_size: 3875
```

- `isro`: Проверяет, работает ли сервер в режиме только для чтения. Сервер ответит `ro`, если он в режиме только для чтения, или `rw`, если он не в режиме только для чтения.

```response
rw
```

- `wchs`: Перечисляет краткую информацию о наблюдениях для сервера.

```response
1 connections watching 1 paths
Total watches:1
```

- `wchc`: Перечисляет подробную информацию о наблюдениях для сервера по сессиям. Это выводит список сессий (подключений) с ассоциированными наблюдениями (путями). Заметьте, в зависимости от количества наблюдений эта операция может быть дорогостоящей (влиять на производительность сервера), используйте ее осторожно.

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

- `wchp`: Перечисляет подробную информацию о наблюдениях для сервера по путям. Это выводит список путей (узлов) с ассоциированными сессиями. Заметьте, в зависимости от количества наблюдений эта операция может быть дорогостоящей (например, влиять на производительность сервера), используйте ее осторожно.

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

- `dump`: Перечисляет незавершенные сессии и эфемерные узлы. Эта команда работает только на лидере.

```response
Sessions dump (2):
0x0000000000000001
0x0000000000000002
Sessions with Ephemerals (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

- `csnp`: Запланировать задачу создания снимка. Вернет последний зафиксированный индекс журнала запланированного снимка, если успешно, или `Не удалось запланировать задачу создания снимка.` если не удалось. Обратите внимание, что команда `lgif` может помочь вам определить, завершен ли снимок.

```response
100
```

- `lgif`: Информация о журнале Keeper. `first_log_idx` : мой первый индекс журнала в кеше журнала; `first_log_term` : мой первый срок журнала; `last_log_idx` : мой последний индекс журнала в кеше журнала; `last_log_term` : мой последний срок журнала; `last_committed_log_idx` : мой последний зафиксированный индекс журнала в состоянии; `leader_committed_log_idx` : зафиксированный индекс журнала лидера с моей перспективы; `target_committed_log_idx` : целевой индекс журнала, который должен быть зафиксирован; `last_snapshot_idx` : максимальный зафиксированный индекс журнала в последнем снимке.

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

- `rqld`: Запрос на то, чтобы стать новым лидером. Вернет `Отправлен запрос на лидерство лидеру.` если запрос отправлен или `Не удалось отправить запрос на лидерство лидеру.` если запрос не отправлен. Обратите внимание, если узел уже является лидером, результат будет таким же, как если бы запрос был отправлен.

```response
Sent leadership request to leader.
```

- `ftfl`: Перечисляет все флаги функций и указывает, включены ли они для экземпляра Keeper.

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

- `ydld`: Запрос на передачу лидерства и стать подписчиком. Если сервер, получающий запрос, является лидером, он сначала приостановит операции записи, подождет, пока преемник (текущий лидер никогда не может быть преемником) завершит синхронизацию с последним журналом, а затем уйдет в отставку. Преемник будет выбран автоматически. Вернет `Отправлен запрос на передачу лидерства лидеру.` если запрос отправлен или `Не удалось отправить запрос на передачу лидерства лидеру.` если запрос не отправлен. Обратите внимание, если узел уже является подписчиком, результат будет таким же, как если бы запрос был отправлен.

```response
Sent yield leadership request to leader.
```

- `pfev`: Возвращает значения для всех собранных событий. Для каждого события он возвращает имя события, значение события и описание события.

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
### HTTP управление {#http-control}

ClickHouse Keeper предоставляет HTTP-интерфейс для проверки готовности реплики к получению трафика. Он может использоваться в облачных средах, таких как [Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes).

Пример конфигурации, который включает конечную точку `/ready`:

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
### Флаги функций {#feature-flags}

Keeper полностью совместим с ZooKeeper и его клиентами, но также вводит некоторые уникальные функции и типы запросов, которые могут использоваться клиентом ClickHouse. Поскольку эти функции могут привести к несовместимым изменениям, большинство из них отключены по умолчанию и могут быть включены с помощью конфигурации `keeper_server.feature_flags`. Все функции могут быть отключены явно. Если вы хотите включить новую функцию для вашего кластера Keeper, мы рекомендуем сначала обновить все экземпляры Keeper в кластере до версии, которая поддерживает эту функцию, а затем включить саму функцию.

Пример конфигурации флагов функций, который отключает `multi_read` и включает `check_not_exists`:

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

Следующие функции доступны:

| Функция                 | Описание                                                                                                                                              | По умолчанию |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `multi_read`            | Поддержка многократного запроса на чтение                                                                                                           | `1`          |
| `filtered_list`         | Поддержка запроса списка, который фильтрует результаты по типу узла (эфемерный или постоянный)                                                       | `1`          |
| `check_not_exists`      | Поддержка запроса `CheckNotExists`, который утверждает, что узел не существует                                                                        | `1`          |
| `create_if_not_exists`  | Поддержка запроса `CreateIfNotExists`, который попытается создать узел, если он не существует. Если он существует, изменения не применяются, и возвращается `ZOK` | `1`          |
| `remove_recursive`      | Поддержка запроса `RemoveRecursive`, который удаляет узел вместе с его поддеревом                                                                      | `1`          |

:::note
Некоторые из флагов функций включены по умолчанию с версии 25.7.   
Рекомендуемый способ обновления Keeper до 25.7+ — сначала обновить до версии 24.9+.
:::
### Миграция с ZooKeeper {#migration-from-zookeeper}

Бесшовная миграция с ZooKeeper на ClickHouse Keeper невозможна. Вам нужно остановить кластер ZooKeeper, конвертировать данные и запустить ClickHouse Keeper. Инструмент `clickhouse-keeper-converter` позволяет конвертировать логи и снимки ZooKeeper в снимок ClickHouse Keeper. Он работает только с ZooKeeper > 3.4. Шаги для миграции:

1. Остановите все узлы ZooKeeper.

2. Необязательно, но рекомендуется: найдите лидер-узел ZooKeeper, запустите и остановите его снова. Это заставит ZooKeeper создать согласованный снимок.

3. Запустите `clickhouse-keeper-converter` на лидере, например:

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. Скопируйте снимок на узлы сервера ClickHouse с настроенным `keeper` или запустите ClickHouse Keeper вместо ZooKeeper. Снимок должен сохраняться на всех узлах, в противном случае пустые узлы могут оказаться быстрее, и один из них может стать лидером.

:::note
Инструмент `keeper-converter` недоступен из независимого бинарного файла Keeper.
Если у вас установлен ClickHouse, вы можете использовать бинарный файл напрямую:

```bash
clickhouse keeper-converter ...
```

В противном случае вы можете [скачать бинарный файл](/getting-started/quick-start/oss#download-the-binary) и запустить инструмент, как описано выше, без установки ClickHouse.
:::
### Восстановление после потери кворума {#recovering-after-losing-quorum}

Поскольку ClickHouse Keeper использует Raft, он может терпеть определенное количество сбоев узлов в зависимости от размера кластера. \
Например, для 3-узлового кластера он будет продолжать работать правильно, если только 1 узел выйдет из строя.

Конфигурация кластера может быть динамически настроена, но есть некоторые ограничения. Переконфигурация также зависит от Raft, поэтому для добавления/удаления узла из кластера вам нужно иметь кворум. Если вы потеряете слишком много узлов в своем кластере одновременно без возможности их перезапуска, Raft перестанет работать и не позволит вам переконфигурировать ваш кластер обычным способом.

Тем не менее, ClickHouse Keeper имеет режим восстановления, который позволяет вам принудительно переконфигурировать ваш кластер только с 1 узлом.
Это должно быть сделано только в качестве последнего средства, если вы не можете снова запустить свои узлы или запустить новый экземпляр на той же конечной точке.

Важные моменты, которые следует отметить перед продолжением:
- Убедитесь, что неудавшиеся узлы не могут подключиться к кластеру снова.
- Не запускайте ни один из новых узлов, пока это не указано в шагах.

После того как вы убедились, что вышеуказанные вещи верны, вам нужно сделать следующее:
1. Выберите один узел Keeper, который будет вашим новым лидером. Имейте в виду, что данные этого узла будут использоваться для всего кластера, поэтому мы рекомендуем использовать узел с самым актуальным состоянием.
2. Прежде чем делать что-либо еще, создайте резервную копию папок `log_storage_path` и `snapshot_storage_path` выбранного узла.
3. Переконфигурируйте кластер на всех узлах, которые вы хотите использовать.
4. Отправьте команду из четырех букв `rcvr` на выбранный узел, которая переведет узел в режим восстановления ИЛИ остановите экземпляр Keeper на выбранном узле и запустите его снова с аргументом `--force-recovery`.
5. Один за другим, запускайте экземпляры Keeper на новых узлах, убедившись, что команда `mntr` возвращает `follower` для `zk_server_state` перед запуском следующего узла.
6. Находясь в режиме восстановления, узел лидера будет возвращать сообщение об ошибке для команды `mntr`, пока не достигнет кворума с новыми узлами и откажется от любых запросов от клиента и фолловеров.
7. После достижения кворума узел лидера вернется в нормальный режим работы, принимая все запросы с помощью Raft-проверки, при этом `mntr` должен возвращать `leader` для `zk_server_state`.
## Использование дисков с Keeper {#using-disks-with-keeper}

Keeper поддерживает подмножество [внешних дисков](/operations/storing-data.md) для хранения снимков, файлов журналов и файла состояния.

Поддерживаемые типы дисков:
- s3_plain
- s3
- local

Следующий пример определений дисков содержится внутри конфигурации.

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

Чтобы использовать диск для журналов, настройка `keeper_server.log_storage_disk` должна быть установлена в имя диска.
Чтобы использовать диск для снимков, настройка `keeper_server.snapshot_storage_disk` должна быть установлена в имя диска.
Дополнительно разные диски можно использовать для последних журналов или снимков с помощью `keeper_server.latest_log_storage_disk` и `keeper_server.latest_snapshot_storage_disk` соответственно.
В этом случае Keeper автоматически переместит файлы на правильные диски, когда будут созданы новые журналы или снимки.
Чтобы использовать диск для файла состояния, настройка `keeper_server.state_storage_disk` должна быть установлена в имя диска.

Перемещение файлов между дисками безопасно, и нет риска потери данных, если Keeper остановится в середине передачи.
Пока файл полностью не перемещен на новый диск, он не удаляется со старого.

Keeper с установленной настройкой `keeper_server.coordination_settings.force_sync` в `true` (по умолчанию `true`) не может гарантировать некоторые характеристики для всех типов дисков.
На данный момент только диски типа `local` поддерживают постоянную синхронизацию.
Если используется `force_sync`, `log_storage_disk` должен быть локальным диском, если `latest_log_storage_disk` не используется.
Если используется `latest_log_storage_disk`, он всегда должен быть локальным диском.
Если `force_sync` отключен, диски всех типов могут использоваться в любой конфигурации.

Возможная конфигурация хранения для экземпляра Keeper может выглядеть следующим образом:

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

Этот экземпляр будет хранить все, кроме последних журналов на диске `log_s3_plain`, в то время как последний журнал будет находиться на диске `log_local`.
Та же логика применяется для снимков: все, кроме последних снимков, будут храниться на `snapshot_s3_plain`, в то время как последний снимок будет находиться на диске `snapshot_local`.
### Изменение конфигурации дисков {#changing-disk-setup}

:::important
Перед применением новой конфигурации диска вручную создайте резервную копию всех журналов и снимков Keeper.
:::

Если определена конфигурация дисков с уровнями (используя отдельные диски для последних файлов), Keeper попытается автоматически переместить файлы на правильные диски при запуске.
Та же гарантия применяется, как и раньше; пока файл полностью не перемещен на новый диск, он не удаляется со старого, так что несколько перезапусков
могут быть выполнены безопасно.

Если необходимо переместить файлы на совершенно новый диск (или переместить с 2-дисковой конфигурации на однодисковую), можно использовать несколько определений `keeper_server.old_snapshot_storage_disk` и `keeper_server.old_log_storage_disk`.

Следующая конфигурация показывает, как мы можем перейти от прежней 2-дисковой конфигурации к совершенно новой однодисковой конфигурации:

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

При запуске все файлы журналов будут перемещены с `log_local` и `log_s3_plain` на диск `log_local2`.
Кроме того, все файлы снимков будут перемещены с `snapshot_local` и `snapshot_s3_plain` на диск `snapshot_local2`.
## Настройка кэша журналов {#configuring-logs-cache}

Чтобы минимизировать объем данных, считываемых с диска, Keeper кэширует записи журналов в памяти.
Если запросы большие, записи журналов займут слишком много памяти, поэтому объем кэшированных журналов ограничен.
Лимит контролируется этими двумя настройками:
- `latest_logs_cache_size_threshold` - общий размер последних журналов, хранящихся в кэше
- `commit_logs_cache_size_threshold` - общий размер последующих журналов, которые необходимо подтвердить следующими

Если значения по умолчанию слишком велики, вы можете уменьшить использование памяти, уменьшив эти две настройки.

:::note
Вы можете использовать команду `pfev`, чтобы проверить объем журналов, считываемых из каждого кэша и из файла.
Вы также можете использовать метрики с конечной точки Prometheus, чтобы отслеживать текущий размер обоих кэшей.
:::
## Prometheus {#prometheus}

Keeper может предоставлять данные метрик для сбора из [Prometheus](https://prometheus.io).

Настройки:

- `endpoint` – HTTP конечная точка для сбора метрик сервером Prometheus. Начинайте с '/'.
- `port` – Порт для `endpoint`.
- `metrics` – Флаг, который устанавливают для экспонирования метрик из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Флаг, который устанавливают для экспонирования метрик из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Флаг, который устанавливает для экспонирования текущих значений метрик из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

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

Проверьте (заменив `127.0.0.1` на IP-адрес или имя хоста вашего сервера ClickHouse):
```bash
curl 127.0.0.1:9363/metrics
```

Пожалуйста, также посмотрите интеграцию ClickHouse Cloud [Prometheus](/integrations/prometheus).
## Руководство пользователя ClickHouse Keeper {#clickhouse-keeper-user-guide}

Этот документ предоставляет простые и минимальные настройки для конфигурации ClickHouse Keeper с примером того, как тестировать распределенные операции. Этот пример выполняется с использованием 3 узлов на Linux.
### 1. Настройка узлов с настройками Keeper {#1-configure-nodes-with-keeper-settings}

1. Установите 3 экземпляра ClickHouse на 3 хоста (`chnode1`, `chnode2`, `chnode3`). (Смотрите [Быстрый старт](/getting-started/install/install.mdx) для получения подробной информации об установке ClickHouse.)

2. На каждом узле добавьте следующую запись, чтобы разрешить внешнюю связь через сетевой интерфейс.
```xml
<listen_host>0.0.0.0</listen_host>
```

3. Добавьте следующую конфигурацию ClickHouse Keeper на все три сервера, обновив настройку `<server_id>` для каждого сервера; для `chnode1` это будет `1`, для `chnode2` это будет `2` и т.д.
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

    |Параметр |Описание                   |Пример              |
    |----------|------------------------------|---------------------|
    |tcp_port   |порт, используемый клиентами Keeper|9181, эквивалент по умолчанию 2181 как в zookeeper|
    |server_id| идентификатор для каждого сервера ClickHouse Keeper, используемый в конфигурации raft| 1|
    |coordination_settings| раздел параметров, таких как таймауты| таймауты: 10000, уровень логирования: trace|
    |server    |определение сервера, участвующего|список определений каждого сервера|
    |raft_configuration| настройки для каждого сервера в кластере Keeper| сервер и настройки для каждого|
    |id      |числовой id сервера для служб Keeper|1|
    |hostname   |имя хоста, IP или FQDN каждого сервера в кластере Keeper|`chnode1.domain.com`|
    |port|порт для прослушивания соединений между серверами Keeper|9234|

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

    Это основные настройки, использованные выше:

    |Параметр |Описание                   |Пример              |
    |----------|------------------------------|---------------------|
    |node   |список узлов для соединений ClickHouse Keeper|настройка для каждого сервера|
    |host|имя хоста, IP или FQDN каждого узла ClickHouse Keeper| `chnode1.domain.com`|
    |port|порт клиента ClickHouse Keeper| 9181|

5. Перезапустите ClickHouse и проверьте, что каждый экземпляр Keeper работает. Выполните следующую команду на каждом сервере. Команда `ruok` возвращает `imok`, если Keeper работает и находится в исправном состоянии:
```bash

# echo ruok | nc localhost 9181; echo
imok
```

6. База данных `system` имеет таблицу с именем `zookeeper`, которая содержит информацию о ваших экземплярах ClickHouse Keeper. Давайте проследим за таблицей:
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
### 2.  Настройка кластера в ClickHouse {#2--configure-a-cluster-in-clickhouse}

1. Давайте настроим простой кластер с 2 шардированными узлами и только одной репликой на 2 узлах. Третий узел будет использован для достижения кворума для требований ClickHouse Keeper. Обновите конфигурацию на `chnode1` и `chnode2`. Следующий кластер определяет 1 шар на каждом узле, в результате чего получается 2 шардированных узла без репликации. В этом примере некоторые данные будут находиться на одном узле, некоторые - на другом:
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

    |Параметр |Описание                   |Пример              |
    |----------|------------------------------|---------------------|
    |shard   |список реплик в определении кластера|список реплик для каждого шарда|
    |replica|список настроек для каждой реплики|записи настроек для каждой реплики|
    |host|имя хоста, IP или FQDN сервера, который будет хостить реплику|`chnode1.domain.com`|
    |port|порт, используемый для связи с использованием встроенного протокола tcp|9000|
    |user|имя пользователя, которое будет использоваться для аутентификации к экземплярам кластера|по умолчанию|
    |password|пароль для пользователя, определенного для разрешения соединений с экземплярами кластера|`ClickHouse123!`|

2. Перезапустите ClickHouse и проверьте, что кластер был создан:
```bash
SHOW clusters;
```

    Вы должны увидеть ваш кластер:
```response
┌─cluster───────┐
│ cluster_2S_1R │
└───────────────┘
```
### 3. Создание и тестирование распределенной таблицы {#3-create-and-test-distributed-table}

1.  Создайте новую базу данных на новом кластере, используя клиент ClickHouse на `chnode1`. Клаузула `ON CLUSTER` автоматически создает базу данных на обоих узлах.
```sql
CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
```

2. Создайте новую таблицу в базе данных `db1`. Снова `ON CLUSTER` создает таблицу на обоих узлах.
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

5. Обратите внимание, что выполнение оператора `SELECT` на каждом узле показывает только данные на этом узле. Например, на `chnode1`:
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

6. Вы можете создать `Distributed` таблицу, чтобы представить данные на двух шарах. Таблицы с движком `Distributed` не хранят никаких собственных данных, но позволяют выполнять распределенную обработку запросов на нескольких серверах. Чтения охватывают все шары, а записи могут быть распределены между шарами. Выполните следующий запрос на `chnode1`:
```sql
CREATE TABLE db1.dist_table (
    id UInt64,
    column1 String
)
ENGINE = Distributed(cluster_2S_1R,db1,table1)
```

7. Обратите внимание, что запрос к `dist_table` возвращает все четыре строки данных из двух шаров:
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
### Резюме {#summary}

Этот документ продемонстрировал, как настроить кластер с использованием ClickHouse Keeper. С помощью ClickHouse Keeper вы можете настраивать кластеры и определять распределенные таблицы, которые могут быть реплицированы между шарами.
## Настройка ClickHouse Keeper с уникальными путями {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />
### Описание {#description}

В этой статье описывается, как использовать встроенную настройку макроса `{uuid}`
для создания уникальных записей в ClickHouse Keeper или ZooKeeper. Уникальные
пути помогают при частом создании и удалении таблиц, так как
это позволяет избежать ожидания нескольких минут для удаления записей пути сборщиком мусора Keeper,
так как каждый раз, когда создается путь, используется новый `uuid`
в этом пути; пути никогда не переиспользуются.
### Пример среды {#example-environment}
Кластер из трех узлов, который будет сконфигурирован с ClickHouse Keeper
на всех трех узлах, и ClickHouse на двух из узлов. Это предоставляет
ClickHouse Keeper три узла (включая узел для разрыва ничьей), и
один шар ClickHouse, состоящий из двух реплик.

|узел|описание|
|-----|-----|
|`chnode1.marsnet.local`|узел данных - кластер `cluster_1S_2R`|
|`chnode2.marsnet.local`|узел данных - кластер `cluster_1S_2R`|
|`chnode3.marsnet.local`| узел ClickHouse Keeper для разрыва ничьей|

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
### Процедуры по настройке таблиц для использования `{uuid}` {#procedures-to-set-up-tables-to-use-uuid}

1. Настройка макросов на каждом сервере
пример для сервера 1:
```xml
<macros>
    <shard>1</shard>
    <replica>replica_1</replica>
</macros>
```
:::note
Обратите внимание, что мы определяем макросы для `shard` и `replica`, но `{uuid}` здесь не определен, он встроенный и его не нужно определять.
:::

2. Создание базы данных

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

3. Создание таблицы в кластере с использованием макросов и `{uuid}`

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

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode2.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

4.  Создание распределенной таблицы

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

3. Просмотрите записи, используя распределенную таблицу
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
### Альтернативы {#alternatives}
Путь по умолчанию для репликации может быть определен заранее с помощью макросов и также `{uuid}`

1. Установите значение по умолчанию для таблиц на каждом узле
```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```
:::tip
Вы также можете определить макрос `{database}` на каждом узле, если узлы используются для определенных баз данных.
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

Query id: ab68cda9-ae41-4d6d-8d3b-20d8255774ee

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

2 rows in set. Elapsed: 1.175 sec.
```

3. Убедитесь, что он использовал параметры, указанные в конфигурации по умолчанию
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

1 row in set. Elapsed: 0.003 sec.
```
### Поиск и устранение неисправностей {#troubleshooting}

Команда для получения информации о таблице и UUID:
```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

Команда для получения информации о таблице в ZooKeeper с UUID для таблицы выше
```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
База данных должна быть `Atomic`, если вы обновляетесь с предыдущей версии, база данных
`default` скорее всего типа `Ordinary`.
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

1 row in set. Elapsed: 0.004 sec.
```
## Динамическая реконфигурация ClickHouse Keeper {#reconfiguration}

<SelfManaged />
### Описание {#description-1}

ClickHouse Keeper частично поддерживает команду ZooKeeper [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying)
для динамической реконфигурации кластера, если включена настройка `keeper_server.enable_reconfiguration`.

:::note
Если эта настройка отключена, вы можете реконфигурировать кластер, изменив вручную раздел `raft_configuration` реплики.
Убедитесь, что вы редактируете файлы на всех репликах, так как только лидер применит изменения.
В качестве альтернативы вы можете отправить запрос `reconfig` через любой совместимый с ZooKeeper клиент.
:::

Виртуальный узел `/keeper/config` содержит последнюю зарегистрированную конфигурацию кластера в следующем формате:

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

- Каждая запись сервера отделяется новой строкой.
- `server_type` может быть `participant` или `learner` ([learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md) не участвует в выборах лидера).
- `server_priority` - это неотрицательное целое число, которое говорит [каким узлам следует уделить приоритет при выборах лидера](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md).
  Приоритет 0 означает, что сервер никогда не станет лидером.

Пример:

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

Вы можете использовать команду `reconfig`, чтобы добавлять новые серверы, удалять существующие и изменять приоритеты существующих серверов, вот примеры (используя `clickhouse-keeper-client`):

```bash

# Add two new servers
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"

# Remove two other servers
reconfig remove "3,4"

# Change existing server priority to 8
reconfig add "server.5=localhost:5123;participant;8"
```

А вот примеры для `kazoo`:

```python

# Add two new servers, remove two other servers
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")


# Change existing server priority to 8
reconfig(joining="server.5=localhost:5123;participant;8", leaving=None)
```

Серверы в `joining` должны быть в формате сервера, описанном выше. Записи сервера должны разделяться запятыми.
При добавлении новых серверов вы можете опустить `server_priority` (значение по умолчанию - 1) и `server_type` (значение по умолчанию
- `participant`).

Если вы хотите изменить приоритет существующего сервера, добавьте его в `joining` с целевым приоритетом.
Хост, порт и тип сервера должны совпадать с конфигурацией существующего сервера.

Серверы добавляются и удаляются в порядке их появления в `joining` и `leaving`.
Все обновления из `joining` обрабатываются перед обновлениями из `leaving`.

В реализации пере конфигурации Keeper есть некоторые особенности:

- Поддерживается только инкрементальная реконфигурация. Запросы с непустым `new_members` отклоняются.

  Реализация ClickHouse Keeper зависит от NuRaft API для динамического изменения членства. NuRaft имеет способ
  добавить один сервер или удалить один сервер, один за раз. Это означает, что каждое изменение конфигурации
  (каждая часть `joining`, каждая часть `leaving`) должно решаться отдельно. Следовательно, массовая
  реконфигурация недоступна, так как это может ввести в заблуждение конечных пользователей.

  Изменять тип сервера (участник/ученик) тоже невозможно, так как это не поддерживается NuRaft, и
  единственный способ заключается в том, чтобы удалить и добавить сервер, что также будет вводить в заблуждение.

- Вы не можете использовать возвращаемое значение `znodestat`.
- Поле `from_version` не используется. Все запросы с установленным `from_version` отклоняются.
  Это связано с тем, что `/keeper/config` - это виртуальный узел, что означает, что он не хранится в
  постоянном хранилище, а генерируется на лету с указанной конфигурацией узла для каждого запроса.
  Это решение было принято, чтобы не дублировать данные, поскольку NuRaft уже хранит эту конфигурацию.
- В отличие от ZooKeeper, нет возможности ждать реконфигурацию кластера, отправив команду `sync`.
  Новая конфигурация будет _в конечном итоге_ применена, но без временных гарантий.
- Команда `reconfig` может завершиться неудачно по различным причинам. Вы можете проверить состояние кластера и посмотреть, была ли обновление
  применено.
## Преобразование одностороннего keeper в кластер {#converting-a-single-node-keeper-into-a-cluster}

Иногда необходимо расширить экспериментальный узел keeper до кластера. Вот схема того, как это сделать шаг за шагом для кластера из 3 узлов:

- **ВАЖНО**: новые узлы должны добавляться пакетами меньше текущего кворума, иначе они выберут лидера из своего числа. В этом примере по одному.
- Существующий узел keeper должен иметь включенный параметр конфигурации `keeper_server.enable_reconfiguration`.
- Запустите второй узел с полной новой конфигурацией кластера keeper.
- После его запуска добавьте его к узлу 1, используя [`reconfig`](#reconfiguration).
- Теперь запустите третий узел и добавьте его, используя [`reconfig`](#reconfiguration).
- Обновите конфигурацию `clickhouse-server`, добавив новый узел keeper туда и перезапустите его, чтобы применить изменения.
- Обновите конфигурацию raft узла 1 и, при необходимости, перезапустите его.

Чтобы уверенно следовать этому процессу, вот [песочница](https://github.com/ClickHouse/keeper-extend-cluster).
## Неподдерживаемые функции {#unsupported-features}

Хотя ClickHouse Keeper стремится быть полностью совместимым с ZooKeeper, в настоящее время некоторые функции не реализованы (хотя разработка продолжается):

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) не поддерживает возврат объекта `Stat`
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat))  не поддерживает [TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL)
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode)) не работает с [`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT) наблюдениями
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean)) и [`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher.WatcherType,boolean)) не поддерживаются
- `setWatches` не поддерживается
- Создание [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html) типов znodes не поддерживается
- [`SASL аутентификация`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL) не поддерживается