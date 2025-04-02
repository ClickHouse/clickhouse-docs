---
slug: /guides/sre/keeper/clickhouse-keeper

sidebar_label: Настройка ClickHouse Keeper
sidebar_position: 10
keywords:
  - Keeper
  - ZooKeeper
  - clickhouse-keeper
  - репликация
description: ClickHouse Keeper, или clickhouse-keeper, заменяет ZooKeeper и предоставляет репликацию и координацию.
---

# ClickHouse Keeper (clickhouse-keeper)

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

ClickHouse Keeper предоставляет систему координации для [репликации](/engines/table-engines/mergetree-family/replication.md) данных и выполнения [распределенных DDL](/sql-reference/distributed-ddl.md) запросов. ClickHouse Keeper совместим с ZooKeeper.
### Подробности реализации {#implementation-details}

ZooKeeper является одной из первых известных открытых систем координации. Он реализован на Java и имеет довольно простую и мощную модель данных. Алгоритм координации ZooKeeper, ZooKeeper Atomic Broadcast (ZAB), не предоставляет гарантии линейности для чтений, потому что каждый узел ZooKeeper обслуживает чтения локально. В отличие от ZooKeeper, ClickHouse Keeper написан на C++ и использует [алгоритм RAFT](https://raft.github.io/) [реализации](https://github.com/eBay/NuRaft). Этот алгоритм позволяет добиться линейности для чтений и записей и имеет несколько открытых реализаций на разных языках.

По умолчанию ClickHouse Keeper предоставляет те же гарантии, что и ZooKeeper: линейные записи и нелинейные чтения. Он имеет совместимый клиент-серверный протокол, поэтому любой стандартный клиент ZooKeeper может использоваться для взаимодействия с ClickHouse Keeper. Снимки и логи имеют несовместимый формат с ZooKeeper, но инструмент `clickhouse-keeper-converter` позволяет преобразовывать данные ZooKeeper в снимки ClickHouse Keeper. Межсерверный протокол в ClickHouse Keeper также несовместим с ZooKeeper, поэтому смешанный кластер ZooKeeper / ClickHouse Keeper невозможен.

ClickHouse Keeper поддерживает списки управления доступом (ACL) так же, как и [ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl). ClickHouse Keeper поддерживает тот же набор разрешений и имеет идентичные встроенные схемы: `world`, `auth` и `digest`. Схема аутентификации digest использует пару `имя_пользователя:пароль`, пароль закодирован в Base64.

:::note
Внешние интеграции не поддерживаются.
:::
### Конфигурация {#configuration}

ClickHouse Keeper может использоваться как отдельная замена ZooKeeper или как внутренняя часть сервера ClickHouse. В обоих случаях конфигурация почти одинаковая в файле `.xml`.
#### Настройки конфигурации Keeper {#keeper-configuration-settings}

Основной тег конфигурации ClickHouse Keeper — `<keeper_server>` и он имеет следующие параметры:

| Параметр                            | Описание                                                                                                                                                                                                                                         | Значение по умолчанию                                                                                                      |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `tcp_port`                           | Порт для подключения клиента.                                                                                                                                                                                                                       | `2181`                                                                                                       |
| `tcp_port_secure`                    | Безопасный порт для SSL-соединения между клиентом и keeper-сервером.                                                                                                                                                                                 | -                                                                                                            |
| `server_id`                          | Уникальный идентификатор сервера, каждый участник кластера ClickHouse Keeper должен иметь уникальный номер (1, 2, 3 и так далее).                                                                                                                                 | -                                                                                                            |
| `log_storage_path`                   | Путь к координационным логам, как и в ZooKeeper, лучше всего хранить логи на ненагруженных узлах.                                                                                                                                                          | -                                                                                                            |
| `snapshot_storage_path`              | Путь к координационным снимкам.                                                                                                                                                                                                                     | -                                                                                                            |
| `enable_reconfiguration`             | Включить динамическую реконфигурацию кластера через [`reconfig`](#reconfiguration).                                                                                                                                                                          | `False`                                                                                                      |
| `max_memory_usage_soft_limit`        | Мягкий лимит в байтах для максимального использования памяти keeper.                                                                                                                                                                                                     | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount`                                               |
| `max_memory_usage_soft_limit_ratio`  | Если `max_memory_usage_soft_limit` не установлен или установлен на ноль, мы используем это значение для определения умышленного мягкого предела.                                                                                                                                     | `0.9`                                                                                                        |
| `cgroups_memory_observer_wait_time`  | Если `max_memory_usage_soft_limit` не установлен или установлен на `0`, мы используем этот интервал для наблюдения за объемом физической памяти. Как только объем памяти меняется, мы пересчитаем мягкий лимит памяти Keeper по `max_memory_usage_soft_limit_ratio`. | `15`                                                                                                         |
| `http_control`                       | Конфигурация [HTTP контроля](#http-control) интерфейса.                                                                                                                                                                                           | -                                                                                                            |
| `digest_enabled`                     | Включить проверку консистентности данных в реальном времени                                                                                                                                                                                                             | `True`                                                                                                       |
| `create_snapshot_on_exit`            | Создать снимок во время завершения работы                                                                                                                                                                                                                   | -                                                                                                            |
| `hostname_checks_enabled`            | Включить проверку корректности указанных хостнеймов для конфигурации кластера (например, если локальный хост используется с удалёнными конечными точками)                                                                                                                                           | `True`                                                                                                       |
| `four_letter_word_white_list`        | Белый список команд 4lw.                                                                                                                                                                                                                         | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |


Другие общие параметры наследуются от конфигурации сервера ClickHouse (`listen_host`, `logger` и т. д.).
#### Внутренние настройки координации {#internal-coordination-settings}

Внутренние настройки координации находятся в секции `<keeper_server>.<coordination_settings>` и имеют следующие параметры:

| Параметр                          | Описание                                                                                                                                                                                                              | Значение по умолчанию                                                                                                      |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`             | Таймаут для одной клиентской операции (мс)                                                                                                                                                                               | `10000`                                                                                                      |
| `min_session_timeout_ms`           | Минимальный таймаут для клиентской сессии (мс)                                                                                                                                                                                      | `10000`                                                                                                      |
| `session_timeout_ms`               | Максимальный таймаут для клиентской сессии (мс)                                                                                                                                                                                      | `100000`                                                                                                     |
| `dead_session_check_period_ms`     | С какой периодичностью ClickHouse Keeper проверяет неактивные сессии и удаляет их (мс)                                                                                                                                               | `500`                                                                                                        |
| `heart_beat_interval_ms`           | С какой периодичностью лидер ClickHouse Keeper будет отправлять сигналы о живости последователям (мс)                                                                                                                                              | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`  | Если последователь не получает сигнал о живости от лидера в этом интервале, то он может инициировать выборы лидера. Должен быть меньше или равен `election_timeout_upper_bound_ms`. Идеально они не должны быть равны.  | `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`  | Если последователь не получает сигнал о живости от лидера в этом интервале, то он должен инициировать выборы лидера.                                                                                                    | `2000`                                                                                                       |
| `rotate_log_storage_interval`      | Сколько записей лога хранить в одном файле.                                                                                                                                                                          | `100000`                                                                                                     |
| `reserved_log_items`               | Сколько записей координационного лога хранить перед компактацией.                                                                                                                                                            | `100000`                                                                                                     |
| `snapshot_distance`                | С какой периодичностью ClickHouse Keeper будет создавать новые снимки (в количестве записей в логах).                                                                                                                                | `100000`                                                                                                     |
| `snapshots_to_keep`                | Сколько снимков хранить.                                                                                                                                                                                              | `3`                                                                                                          |
| `stale_log_gap`                    | Порог, при котором лидер считает последователь устаревшей и отправляет ей снимок вместо логов.                                                                                                                          | `10000`                                                                                                      |
| `fresh_log_gap`                    | Когда узел стал актуальным.                                                                                                                                                                                                  | `200`                                                                                                        |
| `max_requests_batch_size`          | Максимальный размер партии по количеству запросов перед их отправкой в RAFT.                                                                                                                                                      | `100`                                                                                                        |
| `force_sync`                       | Вызывать `fsync` при каждой записи в координационный лог.                                                                                                                                                                          | `true`                                                                                                       |
| `quorum_reads`                     | Выполнять запросы на чтение как записи через весь консенсус RAFT с аналогичной скоростью.                                                                                                                                         | `false`                                                                                                      |
| `raft_logs_level`                  | Уровень текстового логирования о координации (trace, debug и т.д.).                                                                                                                                                         | `system default`                                                                                             |
| `auto_forwarding`                  | Разрешить перенаправление запросов на запись от последователей к лидеру.                                                                                                                                                            | `true`                                                                                                       |
| `shutdown_timeout`                 | Дождаться завершения внутренних подключений и выключения (мс).                                                                                                                                                                   | `5000`                                                                                                       |
| `startup_timeout`                  | Если сервер не подключается к другим участникам кворума в заданный таймаут, он будет завершён (мс).                                                                                                              | `30000`                                                                                                      |
| `async_replication`                | Включить асинхронную репликацию. Все гарантии записи и чтения сохраняются, при этом достигается лучшая производительность. Настройка отключена по умолчанию, чтобы не нарушить обратную совместимость                                         | `false`                                                                                                      |
| `latest_logs_cache_size_threshold` | Максимальный общий размер кеша в памяти последних записей лога                                                                                                                                                              | `1GiB`                                                                                                       |
| `commit_logs_cache_size_threshold` | Максимальный общий размер кеша в памяти записей лога, необходимых для коммита                                                                                                                                              | `500MiB`                                                                                                     |
| `disk_move_retries_wait_ms`        | Как долго ждать между повторными попытками после сбоя, произошедшего во время перемещения файла между дисками                                                                                                               | `1000`                                                                                                       |
| `disk_move_retries_during_init`    | Количество повторных попыток после сбоя, произошедшего во время перемещения файла между дисками в процессе инициализации                                                                                                    | `100`                                                                                                        |
| `experimental_use_rocksdb`         | Использовать rocksdb как хранилище.                                                                                                    | `0`                                                                                                        |

Конфигурация кворума находится в секции `<keeper_server>.<raft_configuration>` и содержит описание серверов.

Единственный параметр для всего кворума — это `secure`, который включает зашифрованное соединение для связи между участниками кворума. Параметр может быть установлен в `true`, если требуется SSL-соединение для внутренней связи между узлами, или оставлен неуказанным в противном случае.

Основные параметры для каждого `<server>`:

- `id` — Идентификатор сервера в кворуме.
- `hostname` — Имя хоста, на котором расположен этот сервер.
- `port` — Порт, на котором этот сервер прослушивает подключения.
- `can_become_leader` — Установите в `false`, чтобы настроить сервер как `learner`. Если пропущен, значение - `true`.

:::note
В случае изменения топологии вашего кластера ClickHouse Keeper (например, замены сервера), пожалуйста, убедитесь, что соответствие между `server_id` и `hostname` остается постоянным и избегайте перемешивания или повторного использования существующего `server_id` для разных серверов (например, это может произойти, если вы полагаетесь на автоматизированные скрипты для развертывания ClickHouse Keeper).

Если хост экземпляра Keeper может изменяться, мы рекомендуем определять и использовать имя хоста вместо сырых IP-адресов. Изменение имени хоста эквивалентно удалению и повторному добавлению сервера, что в некоторых случаях может быть невозможно (например, недостаточно экземпляров Keeper для достижения квора).
:::

:::note
`async_replication` отключена по умолчанию, чтобы избежать нарушения обратной совместимости. Если все ваши экземпляры Keeper в кластере работают на версии, поддерживающей `async_replication` (v23.9+), мы рекомендуем включить это, поскольку это может улучшить производительность без каких-либо недостатков.
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

ClickHouse Keeper включен в пакет сервера ClickHouse, просто добавьте конфигурацию `<keeper_server>` в ваш `/etc/your_path_to_config/clickhouse-server/config.xml` и запустите сервер ClickHouse как обычно. Если вы хотите запустить отдельный ClickHouse Keeper, вы можете сделать это аналогичным образом:

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

Если у вас нет символической ссылки (`clickhouse-keeper`), вы можете создать ее или указать `keeper` в качестве аргумента для `clickhouse`:

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```
### Четырехбуквенные команды {#four-letter-word-commands}

ClickHouse Keeper также предоставляет 4lw команды, которые почти идентичны Zookeeper. Каждая команда состоит из четырех букв, таких как `mntr`, `stat` и т.д. Есть и другие интересные команды: `stat` предоставляет общую информацию о сервере и подключенных клиентах, в то время как `srvr` и `cons` дают расширенные сведения о сервере и соединениях соответственно.

Команды 4lw имеют конфигурацию белого списка `four_letter_word_white_list`, значение по умолчанию которой равно `conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld`.

Вы можете использовать команды ClickHouse Keeper через telnet или nc на клиентском порту.

```bash
echo mntr | nc localhost 9181
```

Ниже приведены подробные команды 4lw:

- `ruok`: Проверяет, работает ли сервер в состоянии без ошибок. Сервер ответит `imok`, если он работает. В противном случае он вообще не ответит. Ответ `imok` не обязательно означает, что сервер вошел в кворум, только что серверный процесс активен и подключен к указанному клиентскому порту. Используйте "stat" для получения деталей о состоянии в отношении кворума и информации о подключении клиента.

```response
imok
```

- `mntr`: Выводит список переменных, которые могут быть использованы для мониторинга здоровья кластера.

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

- `srvr`: Перечисляет полные сведения о сервере.

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

- `stat`: Перечисляет краткие сведения о сервере и подключенных клиентах.

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

- `srst`: Сбрасывает статистику сервера. Команда повлияет на результат `srvr`, `mntr` и `stat`.

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

- `cons`: Перечисляет полные сведения о соединении/сессии для всех клиентов, подключенных к этому серверу. Включает информацию о количестве полученных/отправленных пакетов, идентификаторе сессии, латенции операций, последней выполненной операции и т.д.

```response
 192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
 192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

- `crst`: Сбрасывает статистику соединения/сессии для всех соединений.

```response
Connection stats reset.
```

- `envi`: Печатает детали об окружении сервера.

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

- `dirs`: Показывает общий размер файлов снимков и журналов в байтах.

```response
snapshot_dir_size: 0
log_dir_size: 3875
```

- `isro`: Проверяет, работает ли сервер в режиме только для чтения. Сервер ответит `ro`, если он в режиме только для чтения, или `rw`, если это не так.

```response
rw
```

- `wchs`: Перечисляет краткую информацию о наблюдениях для сервера.

```response
1 connections watching 1 paths
Total watches:1
```

- `wchc`: Перечисляет подробную информацию о наблюдениях для сервера, по сессии. Это выводит список сессий (соединений) с соответствующими наблюдениями (путями). Обратите внимание, что в зависимости от количества наблюдений эта операция может быть дорогостоящей (влияет на производительность сервера), используйте ее с осторожностью.

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

- `wchp`: Перечисляет подробную информацию о наблюдениях для сервера, по пути. Это выводит список путей (znodes) с соответствующими сессиями. Обратите внимание, что в зависимости от количества наблюдений эта операция может быть дорогостоящей (т.е. влиять на производительность сервера), используйте ее с осторожностью.

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

- `dump`: Перечисляет активные сессии и эфемерные узлы. Это работает только на лидере.

```response
Sessions dump (2):
0x0000000000000001
0x0000000000000002
Sessions with Ephemerals (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

- `csnp`: Запланировать задачу создания снимка. Возвращает последний зафиксированный индекс журнала запланированного снимка, если успешно, или `Failed to schedule snapshot creation task.` если не удалось. Обратите внимание, что команда `lgif` может помочь вам определить, завершен ли снимок.

```response
100
```

- `lgif`: Информация о журнале Keeper. `first_log_idx` : мой первый индекс журнала в журнале; `first_log_term` : мой первый термин журнала; `last_log_idx` : мой последний индекс журнала в журнале; `last_log_term` : мой последний термин журнала; `last_committed_log_idx` : мой последний подтвержденный индекс журнала в состоянии машины; `leader_committed_log_idx` : индекс журнала, подтвержденный лидером с моей точки зрения; `target_committed_log_idx` : целевой индекс журнала, который должен быть подтвержден; `last_snapshot_idx` : наибольший подтвержденный индекс журнала в последнем снимке.

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

- `rqld`: Запрос на становление новым лидером. Возвращает `Sent leadership request to leader.` если запрос отправлен или `Failed to send leadership request to leader.` если запрос не был отправлен. Обратите внимание, что если узел уже является лидером, результат будет таким же, как если бы запрос был отправлен.

```response
Sent leadership request to leader.
```

- `ftfl`: Перечисляет все флаги функций и указывает, включены ли они для экземпляра Keeper.

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

- `ydld`: Запрос на отказ от лидерства и становление последователем. Если сервер, получающий запрос, является лидером, он сначала приостановит операции записи, дождется завершения преемником (текущий лидер никогда не может быть преемником) последней записи в журнале, а затем откажется от лидерства. Преемник будет выбран автоматически. Возвращает `Sent yield leadership request to leader.` если запрос отправлен или `Failed to send yield leadership request to leader.` если запрос не был отправлен. Обратите внимание, что если узел уже является последователем, результат будет таким же, как если бы запрос был отправлен.

```response
Sent yield leadership request to leader.
```

- `pfev`: Возвращает значения для всех собранных событий. Для каждого события он возвращает имя события, его значение и описание события.

```response
FileOpen	62	Number of files opened.
Seek	4	Number of times the 'lseek' function was called.
ReadBufferFromFileDescriptorRead	126	Number of reads (read/pread) from a file descriptor. Does not include sockets.
ReadBufferFromFileDescriptorReadFailed	0	Number of times the read (read/pread) from a file descriptor have failed.
ReadBufferFromFileDescriptorReadBytes	178846	Number of bytes read from file descriptors. If the file is compressed, this will show the compressed data size.
WriteBufferFromFileDescriptorWrite	7	Number of writes (write/pwrite) to a file descriptor. Does not include sockets.
WriteBufferFromFileDescriptorWriteFailed	0	Number of times the write (write/pwrite) to a file descriptor have failed.
WriteBufferFromFileDescriptorWriteBytes	153	Number of bytes written to file descriptors. If the file is compressed, this will show compressed data size.
FileSync	2	Number of times the F_FULLFSYNC/fsync/fdatasync function was called for files.
DirectorySync	0	Number of times the F_FULLFSYNC/fsync/fdatasync function was called for directories.
FileSyncElapsedMicroseconds	12756	Total time spent waiting for F_FULLFSYNC/fsync/fdatasync syscall for files.
DirectorySyncElapsedMicroseconds	0	Total time spent waiting for F_FULLFSYNC/fsync/fdatasync syscall for directories.
ReadCompressedBytes	0	Number of bytes (the number of bytes before decompression) read from compressed sources (files, network).
CompressedReadBufferBlocks	0	Number of compressed blocks (the blocks of data that are compressed independent of each other) read from compressed sources (files, network).
CompressedReadBufferBytes	0	Number of uncompressed bytes (the number of bytes after decompression) read from compressed sources (files, network).
AIOWrite	0	Number of writes with Linux or FreeBSD AIO interface
AIOWriteBytes	0	Number of bytes written with Linux or FreeBSD AIO interface
...
```
### HTTP Управление {#http-control}

ClickHouse Keeper предоставляет HTTP-интерфейс для проверки готовности реплики к получению трафика. Его можно использовать в облачных средах, таких как [Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes).

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
### Флаги функций {#feature-flags}

Keeper полностью совместим с ZooKeeper и его клиентами, но также вводит некоторые уникальные функции и типы запросов, которые могут быть использованы клиентом ClickHouse. Поскольку эти функции могут привести к несовместимым изменениям, большинство из них по умолчанию отключены и могут быть включены с помощью конфигурации `keeper_server.feature_flags`. Все функции можно явно отключить. Если вы хотите включить новую функцию для вашего кластера Keeper, мы рекомендуем сначала обновить все экземпляры Keeper в кластере до версии, которая поддерживает эту функцию, а затем включить саму функцию.

Пример конфигурации флага функции, который отключает `multi_read` и включает `check_not_exists`:

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

Доступные функции:

`multi_read` - поддержка многочтения. По умолчанию: `1`  
`filtered_list` - поддержка запроса списка, который фильтрует результаты по типу узла (эфемерный или постоянный). По умолчанию: `1`  
`check_not_exists` - поддержка запроса `CheckNotExists`, который подтверждает, что узел не существует. По умолчанию: `0`  
`create_if_not_exists` - поддержка запросов `CreateIfNotExists`, которые пытаются создать узел, если он не существует. Если он существует, изменения не применяются, и возвращается `ZOK`. По умолчанию: `0`
### Миграция с ZooKeeper {#migration-from-zookeeper}

Бесшовная миграция с ZooKeeper на ClickHouse Keeper невозможна. Вы должны остановить ваш кластер ZooKeeper, преобразовать данные и запустить ClickHouse Keeper. Инструмент `clickhouse-keeper-converter` позволяет конвертировать журналы и снимки ZooKeeper в снимок ClickHouse Keeper. Он работает только с ZooKeeper > 3.4. Шаги для миграции:

1. Остановите все узлы ZooKeeper.

2. Необязательно, но рекомендуется: найдите узел лидера ZooKeeper, запустите и остановите его снова. Это заставит ZooKeeper создать консистентный снимок.

3. Запустите `clickhouse-keeper-converter` на лидере, например:

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. Скопируйте снимок на узлы сервера ClickHouse с настроенным `keeper` или запустите ClickHouse Keeper вместо ZooKeeper. Снимок должен сохраняться на всех узлах, иначе пустые узлы могут работать быстрее, и один из них может стать лидером.  

:::note
Инструмент `keeper-converter` недоступен из автономного двоичного файла Keeper.  
Если у вас установлен ClickHouse, вы можете использовать бинарный файл напрямую:

```bash
clickhouse keeper-converter ...
```

В противном случае вы можете [скачать бинарный файл](/getting-started/quick-start#download-the-binary) и запустить инструмент, как описано выше, не устанавливая ClickHouse.
:::
### Восстановление после потери кворума {#recovering-after-losing-quorum}

Поскольку ClickHouse Keeper использует Raft, он может терпеть определенное количество сбоев узлов в зависимости от размера кластера. Например, для кластера из 3 узлов он продолжит корректно работать, если только 1 узел выйдет из строя.

Конфигурацию кластера можно динамически настраивать, но есть некоторые ограничения. Реорганизация также зависит от Raft, поэтому для добавления/удаления узла из кластера вам нужно иметь кворум. Если вы теряете слишком много узлов в вашем кластере одновременно без возможности их повторного запуска, Raft перестанет работать и не позволит вам настроить ваш кластер обычным способом.

Тем не менее, ClickHouse Keeper имеет режим восстановления, который позволяет вам принудительно перенастроить кластер с только 1 узлом. Это следует делать только в качестве крайней меры, если вы не можете снова запустить свои узлы или запустить новый экземпляр на том же конечном пункте.

Важно отметить несколько вещей перед тем, как продолжить:
- Убедитесь, что вышедшие узлы не могут снова подключиться к кластеру.
- Не запускайте новые узлы, пока это не указано в шагах.

После того как вы убедились, что вышеуказанные условия истинны, вам нужно сделать следующее:
1. Выберите один узел Keeper, чтобы стать вашим новым лидером. Имейте в виду, что данные этого узла будут использованы для всего кластера, поэтому мы рекомендуем использовать узел с самой актуальной версией данных.
2. Прежде чем делать что-либо еще, сделайте резервную копию папок `log_storage_path` и `snapshot_storage_path` выбранного узла.
3. Перенастройте кластер на всех узлах, которые вы хотите использовать.
4. Отправьте команду `rcvr` выбранному вами узлу, которая переведет его в режим восстановления ИЛИ остановите экземпляр Keeper на выбранном узле и запустите его снова с аргументом `--force-recovery`.
5. Один за другим запустите экземпляры Keeper на новых узлах, убедитесь, что `mntr` возвращает `follower` для `zk_server_state` прежде чем запускать следующий.
6. Находясь в режиме восстановления, узел лидера будет возвращать сообщение об ошибке для команды `mntr`, пока не достигнет кворума с новыми узлами и отказывает в любых запросах от клиента и последователей.
7. После достижения кворума узел-лидер вернется к нормальному режиму работы, прием всех запросов с проверкой Raft, при этом `mntr` должен возвращать `leader` для `zk_server_state`.
## Использование дисков с Keeper {#using-disks-with-keeper}

Keeper поддерживает подмножество [внешних дисков](/operations/storing-data.md) для хранения снимков, файлов журналов и файла состояния.

Поддерживаемые типы дисков:
- s3_plain
- s3
- local

Вот пример определений дисков, содержащихся в конфигурации.

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

Чтобы использовать диск для журналов, необходимо установить конфигурацию `keeper_server.log_storage_disk` в имя диска.  
Чтобы использовать диск для снимков, необходимо установить конфигурацию `keeper_server.snapshot_storage_disk` в имя диска.  
Дополнительно различные диски могут использоваться для последних журналов или снимков с помощью `keeper_server.latest_log_storage_disk` и `keeper_server.latest_snapshot_storage_disk` соответственно.  
В этом случае Keeper автоматически переместит файлы на правильные диски при создании новых журналов или снимков.  
Чтобы использовать диск для файла состояния, конфигурация `keeper_server.state_storage_disk` должна быть установлена в имя диска.  

Перемещение файлов между дисками безопасно, и нет риска потери данных, если Keeper остановится в процессе передачи.  
Пока файл не будет полностью перемещен на новый диск, он не удаляется с старого.

Keeper с `keeper_server.coordination_settings.force_sync`, установленным в `true` (`true` по умолчанию) не может удовлетворить некоторые гарантии для всех типов дисков.  
На данный момент только диски типа `local` поддерживают персистентный синх.  
Если используется `force_sync`, `log_storage_disk` должен быть диском `local`, если `latest_log_storage_disk` не используется.  
Если используется `latest_log_storage_disk`, он всегда должен быть диском `local`.  
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

Этот экземпляр будет хранить все, кроме последних журналов, на диске `log_s3_plain`, в то время как последний журнал будет храниться на диске `log_local`.  
Та же логика применяется и для снимков, все, кроме последних снимков, будут храниться на `snapshot_s3_plain`, в то время как последний снимок будет храниться на `snapshot_local`.
### Изменение конфигурации диска {#changing-disk-setup}

:::important
Прежде чем применять новую конфигурацию диска, вручную создайте резервную копию всех журналов и снимков Keeper.
:::

Если определена каскадная конфигурация диска (с использованием отдельных дисков для последних файлов), Keeper попытается автоматически переместить файлы на правильные диски при запуске.  
Та же гарантия применяется, как и ранее; пока файл полностью не будет перемещен на новый диск, он не удаляется с старого, поэтому можно безопасно выполнять несколько перезапусков.

Если необходимо переместить файлы на совершенно новый диск (или перейти с двухдисковой конфигурации на однодисковую), можно использовать несколько определений `keeper_server.old_snapshot_storage_disk` и `keeper_server.old_log_storage_disk`.

Следующая конфигурация показывает, как мы можем перейти с предыдущей 2-дисковой конфигурации на совершенно новую однодисковую конфигурацию:

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
Также все файлы снимков будут перемещены с `snapshot_local` и `snapshot_s3_plain` на диск `snapshot_local2`.
## Настройка кэша журналов {#configuring-logs-cache}

Чтобы минимизировать количество данных, читаемых с диска, Keeper кэширует записи журналов в памяти.  
Если запросы велики, записи журналов займут слишком много памяти, поэтому количество кэшированных журналов ограничено.  
Лимит контролируется с помощью этих двух конфигураций:
- `latest_logs_cache_size_threshold` - общий размер последних журналов, которые хранятся в кэше
- `commit_logs_cache_size_threshold` - общий размер последующих журналов, которые нужно подтвердить следующими

Если значения по умолчанию слишком велики, вы можете снизить использование памяти, уменьшив эти две конфигурации.

:::note
Вы можете использовать команду `pfev`, чтобы проверить количество журналов, прочитанных из каждого кэша и из файла.  
Вы также можете использовать метрики из конечной точки Prometheus, чтобы отслеживать текущий размер обоих кэшей.  
:::
## Prometheus {#prometheus}

Keeper может предоставлять метрики для сбора с помощью [Prometheus](https://prometheus.io).

Настройки:

- `endpoint` – HTTP конечная точка для сбора метрик сервером Prometheus. Начинается с '/'.  
- `port` – Порт для `endpoint`.  
- `metrics` – Флаг, который устанавливает, чтобы раскрыть метрики из таблицы [system.metrics](/operations/system-tables/metrics).  
- `events` – Флаг, который устанавливает, чтобы раскрыть метрики из таблицы [system.events](/operations/system-tables/events).  
- `asynchronous_metrics` – Флаг, который устанавливает, чтобы раскрыть текущие значения метрик из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).  

**Пример**

``` xml
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

Проверьте (замените `127.0.0.1` на IP-адрес или имя хоста вашего сервера ClickHouse):
```bash
curl 127.0.0.1:9363/metrics
```

Пожалуйста, также ознакомьтесь с [интеграцией Prometheus в ClickHouse Cloud](/integrations/prometheus).
## Руководство пользователя ClickHouse Keeper {#clickhouse-keeper-user-guide}

Данное руководство предоставляет простые и минимальные настройки для конфигурации ClickHouse Keeper с примером, как протестировать распределенные операции. Этот пример выполняется с использованием 3 узлов в Linux.
### 1. Настройка узлов с параметрами Keeper {#1-configure-nodes-with-keeper-settings}

1. Установите 3 экземпляра ClickHouse на 3 хостах (`chnode1`, `chnode2`, `chnode3`). (Посмотрите [Быстрый старт](/getting-started/install.md) для подробной информации о установке ClickHouse.)

2. На каждом узле добавьте следующую запись, чтобы разрешить внешнюю связь через сетевой интерфейс.
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. Добавьте следующую конфигурацию ClickHouse Keeper на все три сервера, обновив настройку `<server_id>` для каждого сервера; для `chnode1` это будет `1`, для `chnode2` будет `2` и т.д.
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

    Это базовые настройки, используемые выше:

    | Параметр | Описание | Пример |
    |----------|----------|--------|
    | tcp_port | порт, который будет использоваться клиентами keeper | 9181, по умолчанию равно 2181 как в zookeeper |
    | server_id | идентификатор для каждого сервера ClickHouse Keeper, используемого в конфигурации raft | 1 |
    | coordination_settings | секция для параметров, таких как таймауты | таймауты: 10000, уровень логирования: trace |
    | server | определение сервера, участвующего | список определений каждого сервера |
    | raft_configuration | настройки для каждого сервера в кластере keeper | сервер и настройки для каждого |
    | id | числовой идентификатор сервера для услуг keeper | 1 |
    | hostname | имя хоста, IP или FQDN каждого сервера в кластере keeper | `chnode1.domain.com` |
    | port | порт для прослушивания межсерверных соединений keeper | 9234 |

4. Включите компонент Zookeeper. Он будет использовать движок ClickHouse Keeper:
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

    Это базовые настройки, используемые выше:

    | Параметр | Описание | Пример |
    |----------|----------|--------|
    | node | список узлов для соединений ClickHouse Keeper | запись настройки для каждого сервера |
    | host | имя хоста, IP или FQDN каждого узла ClickHouse keeper | `chnode1.domain.com` |
    | port | порт клиента ClickHouse Keeper | 9181 |

5. Перезапустите ClickHouse и убедитесь, что каждый экземпляр Keeper работает. Выполните следующую команду на каждом сервере. Команда `ruok` возвращает `imok`, если Keeper работает и работает исправно:
    ```bash
    # echo ruok | nc localhost 9181; echo
    imok
    ```

6. База данных `system` имеет таблицу под названием `zookeeper`, которая содержит детали ваших экземпляров ClickHouse Keeper. Давайте посмотрим на таблицу:
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
```yaml
title: 'Настройка кластера в ClickHouse'
sidebar_label: 'Настройка кластера'
keywords: ['ClickHouse', 'кластер', 'репликация', 'Shard', 'Replica', 'Distributed Table']
description: 'Эта документация объясняет, как настроить кластер в ClickHouse и создать распределенную таблицу.'
```

### 2. Настройка кластера в ClickHouse {#2--configure-a-cluster-in-clickhouse}

1. Давайте настроим простой кластер с 2 шарами и только одной репликой на 2 узлах. Третий узел будет использоваться для достижения кворума для требований в ClickHouse Keeper. Обновите конфигурацию на `chnode1` и `chnode2`. Следующий кластер определяет 1 шард на каждом узле для общего количества 2 шардов без репликации. В этом примере некоторые данные будут находиться на одном узле, а некоторые — на другом узле:
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

    |Параметр |Описание                     |Пример              |
    |---------|-----------------------------|---------------------|
    |shard   |список реплик в определении кластера|список реплик для каждого шара|
    |replica|список настроек для каждой реплики|записи настроек для каждой реплики|
    |host|имя хоста, IP или FQDN сервера, который будет хостить реплику шара|`chnode1.domain.com`|
    |port|порт, используемый для связи с помощью протокола tcp|9000|
    |user|имя пользователя, которое будет использоваться для аутентификации к экземплярам кластера|default|
    |password|пароль для пользователя, определенного для разрешения подключений к экземплярам кластера|`ClickHouse123!`|


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

1.  Создайте новую базу данных на новом кластере, используя клиента ClickHouse на `chnode1`. Условие `ON CLUSTER` автоматически создает базу данных на обоих узлах.
    ```sql
    CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
    ```

2. Создайте новую таблицу в базе данных `db1`. Снова, `ON CLUSTER` создает таблицу на обоих узлах.
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

5. Обратите внимание, что выполнение запроса `SELECT` на каждом узле показывает только данные на этом узле. Например, на `chnode1`:
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

6. Вы можете создать распределенную таблицу (`Distributed`), чтобы представить данные на двух шарах. Таблицы с движком `Distributed` не хранят собственные данные, но позволяют распределенную обработку запросов на нескольких серверах. Чтения охватывают все шары, и записи могут быть распределены между шарами. Запустите следующий запрос на `chnode1`:
    ```sql
    CREATE TABLE db1.dist_table (
        id UInt64,
        column1 String
    )
    ENGINE = Distributed(cluster_2S_1R,db1,table1)
    ```

7. Обратите внимание, что выборка из `dist_table` возвращает все четыре строки данных из двух шаров:
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

Этот гид продемонстрировал, как настроить кластер с использованием ClickHouse Keeper. С ClickHouse Keeper вы можете настраивать кластеры и определять распределенные таблицы, которые могут быть реплицированы по шартам.
## Настройка ClickHouse Keeper с уникальными путями {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />
### Описание {#description}

В этой статье описывается, как использовать встроенный `{uuid}` макрос для создания уникальных записей в ClickHouse Keeper или ZooKeeper. Уникальные пути помогают при частом создании и удалении таблиц, так как это позволяет избежать ожидания нескольких минут, пока сборщик мусора Keeper удалит записи пути. Каждый раз, когда создается путь, используется новый `uuid`; пути никогда не повторяются.
### Пример окружения {#example-environment}
Трехузловой кластер, который будет настроен для работы с ClickHouse Keeper на всех трех узлах, и ClickHouse на двух из узлов. Это обеспечивает ClickHouse Keeper тремя узлами (включая узел для разрыва связки) и одним шардом ClickHouse, состоящим из двух реплик.

|узел|описание|
|-----|-----|
|`chnode1.marsnet.local`|данные узел - кластер `cluster_1S_2R`|
|`chnode2.marsnet.local`|данные узел - кластер `cluster_1S_2R`|
|`chnode3.marsnet.local`| узел для разрыва связки ClickHouse Keeper|

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
### Процедуры для настройки таблиц с использованием `{uuid}` {#procedures-to-set-up-tables-to-use-uuid}

1. Настройте Макросы на каждом сервере
пример для сервера 1:
```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
```
:::note
Обратите внимание, что мы определяем макросы для `shard` и `replica`, но `{uuid}` здесь не определен, он встроен, и нет необходимости его определять.
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

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode2.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

4.  Создайте распределенную таблицу

```sql
create table db_uuid.dist_uuid_table1 on cluster 'cluster_1S_2R'
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
Путь по умолчанию для репликации может быть задан заранее с помощью макросов и используя также `{uuid}`

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

3. Проверьте, использовались ли настройки по умолчанию
```sql
SHOW CREATE TABLE db_uuid.uuid_table1;
```

```response
SHOW CREATE TABLE db_uuid.uuid_table1

Query id: 5925ecce-a54f-47d8-9c3a-ad3257840c9e

┌─statement────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE db_uuid.uuid_table1
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}')
ORDER BY id
SETTINGS index_granularity = 8192 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```
### Устранение неполадок {#troubleshooting}

Пример команды для получения информации о таблице и UUID:
```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

Пример команды для получения информации о таблице в ZooKeeper с UUID для приведенной выше таблицы
```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
База данных должна быть `Atomic`, если вы обновляете с предыдущей версии, то база данных по умолчанию, вероятно, типа `Ordinary`.
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
## Динамическая перенастройка ClickHouse Keeper {#reconfiguration}

<SelfManaged />
### Описание {#description-1}

ClickHouse Keeper частично поддерживает команду ZooKeeper [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying) для динамической перенастройки кластера, если параметр `keeper_server.enable_reconfiguration` включен.

:::note
Если это значение отключено, вы можете перенастроить кластер, изменяя раздел `raft_configuration` реплики вручную. Убедитесь, что вы редактируете файлы на всех репликах, так как только лидер применит изменения. В противном случае вы можете отправить запрос `reconfig` через любой совместимый с ZooKeeper клиент.
:::

Виртуальный узел `/keeper/config` содержит последнюю зафиксированную конфигурацию кластера в следующем формате:

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

- Каждая запись сервера разделяется переносом строки.
- `server_type` это либо `participant`, либо `learner` ([learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md) не участвует в выборах лидера).
- `server_priority` — это неотрицательное целое число, указывающее [какие узлы должны иметь приоритет на выборах лидера](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md). Приоритет 0 означает, что сервер никогда не будет лидером.

Пример:

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

Вы можете использовать команду `reconfig`, чтобы добавить новые серверы, удалить существующие и изменить приоритеты существующих серверов. Вот примеры (используя `clickhouse-keeper-client`):

```bash

# Добавить два новых сервера
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"

# Удалить два других сервера
reconfig remove "3,4"

# Изменить приоритет существующего сервера на 8
reconfig add "server.5=localhost:5123;participant;8"
```

А вот примеры для `kazoo`:

```python

# Добавить два новых сервера, удалить два других сервера
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")


# Изменить приоритет существующего сервера на 8
reconfig(joining="server.5=localhost:5123;participant;8", leaving=None)
```

Серверы в `joining` должны быть в формате сервера, описанном выше. Записи сервера должны разделяться запятыми. При добавлении новых серверов вы можете опустить `server_priority` (значение по умолчанию — 1) и `server_type` (значение по умолчанию — `participant`).

Если вы хотите изменить приоритет существующего сервера, добавьте его в `joining` с целевым приоритетом. Хост сервера, порт и тип должны совпадать с конфигурацией существующего сервера.

Серверы добавляются и удаляются в порядке их появления в `joining` и `leaving`. Все обновления из `joining` обрабатываются перед обновлениями из `leaving`.

Существует несколько нюансов в реализации перенастройки Keeper:

- Поддерживается только инкрементная перенастройка. Запросы с ненулевым `new_members` отклоняются.

  Реализация ClickHouse Keeper полагается на API NuRaft для динамического изменения состава. NuRaft позволяет добавлять один сервер или удалять один сервер, по одному за раз. Это означает, что каждое изменение в конфигурации (каждая часть `joining`, каждая часть `leaving`) должно обсуждаться отдельно. Таким образом, массовая перенастройка недоступна, так как это могло бы ввести пользователей в заблуждение.

  Изменение типа сервера (participant/learner) также невозможно, так как это не поддерживается NuRaft, и единственный способ — удалить и добавить сервер, что снова могло бы ввести в заблуждение.

- Вы не можете использовать возвращаемое значение `znodestat`.
- Поле `from_version` не используется. Все запросы с установленным `from_version` отклоняются. Это связано с тем, что `/keeper/config` является виртуальным узлом, что означает, что он не хранится в постоянном хранилище, а генерируется на лету с указанной конфигурацией узла для каждого запроса. Это решение было принято, чтобы избежать дублирования данных, так как NuRaft уже хранит эту конфигурацию.
- В отличие от ZooKeeper нет возможности ожидать перенастройку кластера, отправив команду `sync`. Новая конфигурация будет _в конечном итоге_ применена, но без гарантий по времени.
- Команда `reconfig` может не удаваться по разным причинам. Вы можете проверить состояние кластера и посмотреть, были ли применены обновления.
## Преобразование однузлового keeper в кластер {#converting-a-single-node-keeper-into-a-cluster}

Иногда необходимо расширить экспериментальный узел keeper в кластер. Вот схема, как это сделать шаг за шагом для 3-узлового кластера:

- **ВАЖНО**: новые узлы должны добавляться партиями меньше текущего кворума, в противном случае они выберут лидера среди себя. В этом примере по одному.
- Существующий узел keeper должен иметь параметр конфигурации `keeper_server.enable_reconfiguration` включенным.
- Запустите второй узел с полной новой конфигурацией кластера keeper.
- После его запуска добавьте его к узлу 1, используя [`reconfig`](#reconfiguration).
- Теперь запустите третий узел и добавьте его, используя [`reconfig`](#reconfiguration).
- Обновите конфигурацию `clickhouse-server`, добавив там новый узел keeper, и перезапустите его для применения изменений.
- Обновите raft конфигурацию узла 1 и, по желанию, перезапустите его.

Чтобы уверенно работать с этим процессом, вот [песочница репозиторий](https://github.com/ClickHouse/keeper-extend-cluster).
## Неподдерживаемые функции {#unsupported-features}

Хотя ClickHouse Keeper нацелен на полную совместимость с ZooKeeper, существуют некоторые функции, которые в настоящее время не реализованы (хотя разработка продолжается):

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) не поддерживает возвращение объекта `Stat`
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat))  не поддерживает [TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL)
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode)) не работает с [`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT) наблюдениями
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean)) и [`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.WatcherType,boolean)) не поддерживаются
- `setWatches` не поддерживается
- Создание znodes типа [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html) не поддерживается
- [`SASL аутентификация`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL) не поддерживается
