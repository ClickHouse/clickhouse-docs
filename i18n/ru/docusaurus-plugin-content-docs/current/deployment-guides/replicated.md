---
slug: /architecture/replication
sidebar_label: 'Репликация для отказоустойчивости'
sidebar_position: 10
title: 'Репликация для отказоустойчивости'
description: 'Страница, описывающая пример архитектуры с пятью серверами, настроенными для работы. Два из них используются для хранения копий данных, а остальные — для координации репликации данных.'
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/docs/_snippets/_replication-sharding-terminology.md';
import ConfigFileNote from '@site/docs/_snippets/_config-files.md';
import KeeperConfigFileNote from '@site/docs/_snippets/_keeper-config-files.md';
import ReplicationArchitecture from '@site/static/images/deployment-guides/architecture_1s_2r_3_nodes.png';

## Описание {#description}
В этой архитектуре настроены пять серверов. Два из них используются для хранения копий данных. Оставшиеся три сервера используются для координации репликации данных. На этом примере мы создадим базу данных и таблицу, которые будут реплицироваться на обеих узлах данных, используя движок таблиц ReplicatedMergeTree.

## Уровень: Базовый {#level-basic}

<ReplicationShardingTerminology />

## Среда {#environment}
### Диаграмма архитектуры {#architecture-diagram}

<Image img={ReplicationArchitecture} size="md" alt="Диаграмма архитектуры для 1 шард и 2 реплик с ReplicatedMergeTree" />

|Узел|Описание|
|----|-----------|
|clickhouse-01|Данные|
|clickhouse-02|Данные|
|clickhouse-keeper-01|Распределенная координация|
|clickhouse-keeper-02|Распределенная координация|
|clickhouse-keeper-03|Распределенная координация|

:::note
В производственных средах мы настоятельно рекомендуем использовать *выделенные* хосты для ClickHouse Keeper. В тестовой среде приемлемо запускать ClickHouse Server и ClickHouse Keeper на одном и том же сервере. Другой базовый пример, [Горизонтальное масштабирование](/deployment-guides/horizontal-scaling.md), использует этот метод. В этом примере мы представляем рекомендованный метод разделения Keeper и ClickHouse Server. Сервера Keeper могут быть меньшими, 4 ГБ ОЗУ обычно достаточно для каждого сервера Keeper, пока ваши сервера ClickHouse не станут очень большими.
:::

## Установка {#install}

Установите сервер и клиент ClickHouse на два сервера `clickhouse-01` и `clickhouse-02`, следуя [инструкциям для вашего типа архива](/getting-started/install/install.mdx) (.deb, .rpm, .tar.gz и т.д.).

Установите ClickHouse Keeper на три сервера `clickhouse-keeper-01`, `clickhouse-keeper-02` и `clickhouse-keeper-03`, следуя [инструкциям для вашего типа архива](/getting-started/install/install.mdx) (.deb, .rpm, .tar.gz и т.д.).

## Редактирование файлов конфигурации {#editing-configuration-files}

<ConfigFileNote />

## Конфигурация clickhouse-01 {#clickhouse-01-configuration}

Для clickhouse-01 имеется пять файлов конфигурации. Вы можете выбрать, чтобы объединить эти файлы в один, но для ясности в документации может быть проще рассмотреть их отдельно. Когда вы будете просматривать файлы конфигурации, вы увидите, что большая часть конфигурации одинакова для clickhouse-01 и clickhouse-02; различия будут выделены.

### Конфигурация сети и логирования {#network-and-logging-configuration}

Эти значения можно настраивать по своему усмотрению. Этот пример конфигурации дает вам:
- отладочный лог, который будет обновляться после 1000M три раза
- имя, отображаемое при подключении с помощью `clickhouse-client`, - `cluster_1S_2R node 1`
- ClickHouse будет слушать на сетевом интерфейсе IPV4 на портах 8123 и 9000.

```xml title="/etc/clickhouse-server/config.d/network-and-logging.xml на clickhouse-01"
<clickhouse>
    <logger>
        <level>debug</level>
        <log>/var/log/clickhouse-server/clickhouse-server.log</log>
        <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <display_name>cluster_1S_2R node 1</display_name>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
</clickhouse>
```

### Конфигурация макросов {#macros-configuration}

Макросы `shard` и `replica` упрощают сложность распределенного DDL. Значения, настроенные для них, автоматически заменяются в ваших DDL-запросах, что упрощает ваш DDL. Макросы для этой конфигурации указывают номер шард и реплики для каждого узла.
В этом примере с 1 шард и 2 репликами, макрос реплики — `replica_1` на clickhouse-01 и `replica_2` на clickhouse-02. Макрос шард имеет значение `1` как для clickhouse-01, так и для clickhouse-02, поскольку существует только один шард.

```xml title="/etc/clickhouse-server/config.d/macros.xml на clickhouse-01"
<clickhouse>
    <macros>
        <shard>01</shard>
        <!-- highlight-next-line -->
        <replica>01</replica>
        <cluster>cluster_1S_2R</cluster>
    </macros>
</clickhouse>
```

### Конфигурация репликации и шардирования {#replication-and-sharding-configuration}

Начнем с верхней части:
- Раздел remote_servers в XML указывает на каждый из кластеров в среде. Атрибут `replace=true` заменяет пример удаленных серверов в конфигурации ClickHouse по умолчанию на конфигурацию remote_server, указанную в этом файле. Без этого атрибута удаленные серверы в этом файле добавлялись бы к списку примеров в конфигурации по умолчанию.
- В этом примере есть один кластер с именем `cluster_1S_2R`.
- Создается секрет для кластера с именем `cluster_1S_2R` со значением `mysecretphrase`. Секрет делится между всеми удаленными серверами в среде, чтобы гарантировать, что правильные серверы объединены.
- В кластере `cluster_1S_2R` имеется один шард и две реплики. Обратите внимание на диаграмму архитектуры в начале этого документа и сравните ее с определением `shard` в приведенном ниже XML. Определение шард содержит две реплики. Хост и порт для каждой реплики указаны. Одна реплика хранится на `clickhouse-01`, а другая — на `clickhouse-02`.
- Внутренняя репликация для шард установлена на true. Каждый шард может иметь параметр internal_replication, определенный в конфигурационном файле. Если этот параметр установлен на true, операция записи выбирает первую здоровую реплику и записывает данные в нее.

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml на clickhouse-01"
<clickhouse>
    <remote_servers replace="true">
        <cluster_1S_2R>
            <secret>mysecretphrase</secret>
            <shard>
                <internal_replication>true</internal_replication>
                <replica>
                    <host>clickhouse-01</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>clickhouse-02</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
</clickhouse>
```

### Конфигурация использования Keeper {#configuring-the-use-of-keeper}

Этот файл конфигурации `use-keeper.xml` настраивает ClickHouse Server для использования ClickHouse Keeper для координации репликации и распределенного DDL. Этот файл указывает, что ClickHouse Server должен использовать Keeper на узлах clickhouse-keeper-01 - 03 на порту 9181, и файл одинаковый для `clickhouse-01` и `clickhouse-02`.

```xml title="/etc/clickhouse-server/config.d/use-keeper.xml на clickhouse-01"
<clickhouse>
    <zookeeper>
        <!-- где находятся узлы ZK -->
        <node>
            <host>clickhouse-keeper-01</host>
            <port>9181</port>
        </node>
        <node>
            <host>clickhouse-keeper-02</host>
            <port>9181</port>
        </node>
        <node>
            <host>clickhouse-keeper-03</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```

## Конфигурация clickhouse-02 {#clickhouse-02-configuration}

Поскольку конфигурация очень похожа на clickhouse-01 и clickhouse-02, здесь будут указаны только отличия.

### Конфигурация сети и логирования {#network-and-logging-configuration-1}

Этот файл одинаков на clickhouse-01 и clickhouse-02, за исключением `display_name`.

```xml title="/etc/clickhouse-server/config.d/network-and-logging.xml на clickhouse-02"
<clickhouse>
    <logger>
        <level>debug</level>
        <log>/var/log/clickhouse-server/clickhouse-server.log</log>
        <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <!-- highlight-next-line -->
    <display_name>cluster_1S_2R node 2</display_name>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
</clickhouse>
```

### Конфигурация макросов {#macros-configuration-1}

Конфигурация макросов отличается между clickhouse-01 и clickhouse-02. `replica` установлена в `02` на этом узле.

```xml title="/etc/clickhouse-server/config.d/macros.xml на clickhouse-02"
<clickhouse>
    <macros>
        <shard>01</shard>
        <!-- highlight-next-line -->
        <replica>02</replica>
        <cluster>cluster_1S_2R</cluster>
    </macros>
</clickhouse>
```

### Конфигурация репликации и шардирования {#replication-and-sharding-configuration-1}

Этот файл одинаков на clickhouse-01 и clickhouse-02.

```xml title="/etc/clickhouse-server/config.d/remote-servers.xml на clickhouse-02"
<clickhouse>
    <remote_servers replace="true">
        <cluster_1S_2R>
            <secret>mysecretphrase</secret>
            <shard>
                <internal_replication>true</internal_replication>
                <replica>
                    <host>clickhouse-01</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>clickhouse-02</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
</clickhouse>
```

### Конфигурация использования Keeper {#configuring-the-use-of-keeper-1}

Этот файл одинаков на clickhouse-01 и clickhouse-02.

```xml title="/etc/clickhouse-server/config.d/use-keeper.xml на clickhouse-02"
<clickhouse>
    <zookeeper>
        <!-- где находятся узлы ZK -->
        <node>
            <host>clickhouse-keeper-01</host>
            <port>9181</port>
        </node>
        <node>
            <host>clickhouse-keeper-02</host>
            <port>9181</port>
        </node>
        <node>
            <host>clickhouse-keeper-03</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```

## Конфигурация clickhouse-keeper-01 {#clickhouse-keeper-01-configuration}

<KeeperConfigFileNote />

ClickHouse Keeper предоставляет систему координации для репликации данных и выполнения распределенных DDL-запросов. ClickHouse Keeper совместим с Apache ZooKeeper. Эта конфигурация включает ClickHouse Keeper на порту 9181. Выделенная строка указывает, что этот экземпляр Keeper имеет server_id равным 1. Это единственное различие в файле `enable-keeper.xml` на трех серверах. У `clickhouse-keeper-02` будет `server_id`, установленный в `2`, а у `clickhouse-keeper-03` — в `3`. Раздел конфигурации raft одинаков для всех трех серверов, он выделен ниже, чтобы показать взаимосвязь между `server_id` и экземпляром `server` в конфигурации raft.

:::note
Если по какой-либо причине узел Keeper заменяется или восстанавливается, не используйте существующий `server_id`. Например, если узел Keeper с `server_id` равным `2` восстанавливается, дайте ему `server_id` равный `4` или больше.
:::

```xml title="/etc/clickhouse-keeper/keeper_config.xml на clickhouse-keeper-01"
<clickhouse>
    <logger>
        <level>trace</level>
        <log>/var/log/clickhouse-keeper/clickhouse-keeper.log</log>
        <errorlog>/var/log/clickhouse-keeper/clickhouse-keeper.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
        <!-- highlight-next-line -->
        <server_id>1</server_id>
        <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
        <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>
        <coordination_settings>
            <operation_timeout_ms>10000</operation_timeout_ms>
            <session_timeout_ms>30000</session_timeout_ms>
            <raft_logs_level>trace</raft_logs_level>
        </coordination_settings>
        <raft_configuration>
            <!-- highlight-start -->
            <server>
                <id>1</id>
                <hostname>clickhouse-keeper-01</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-end -->
            <server>
                <id>2</id>
                <hostname>clickhouse-keeper-02</hostname>
                <port>9234</port>
            </server>
            <server>
                <id>3</id>
                <hostname>clickhouse-keeper-03</hostname>
                <port>9234</port>
            </server>
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

## Конфигурация clickhouse-keeper-02 {#clickhouse-keeper-02-configuration}

Между `clickhouse-keeper-01` и `clickhouse-keeper-02` есть только одно различие. `server_id` установлен на `2` на этом узле.

```xml title="/etc/clickhouse-keeper/keeper_config.xml на clickhouse-keeper-02"
<clickhouse>
    <logger>
        <level>trace</level>
        <log>/var/log/clickhouse-keeper/clickhouse-keeper.log</log>
        <errorlog>/var/log/clickhouse-keeper/clickhouse-keeper.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
        <!-- highlight-next-line -->
        <server_id>2</server_id>
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
                <hostname>clickhouse-keeper-01</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-start -->
            <server>
                <id>2</id>
                <hostname>clickhouse-keeper-02</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-end -->
            <server>
                <id>3</id>
                <hostname>clickhouse-keeper-03</hostname>
                <port>9234</port>
            </server>
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

## Конфигурация clickhouse-keeper-03 {#clickhouse-keeper-03-configuration}

Между `clickhouse-keeper-01` и `clickhouse-keeper-03` есть только одно различие. `server_id` установлен на `3` на этом узле.

```xml title="/etc/clickhouse-keeper/keeper_config.xml на clickhouse-keeper-03"
<clickhouse>
    <logger>
        <level>trace</level>
        <log>/var/log/clickhouse-keeper/clickhouse-keeper.log</log>
        <errorlog>/var/log/clickhouse-keeper/clickhouse-keeper.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <listen_host>0.0.0.0</listen_host>
    <keeper_server>
        <tcp_port>9181</tcp_port>
        <!-- highlight-next-line -->
        <server_id>3</server_id>
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
                <hostname>clickhouse-keeper-01</hostname>
                <port>9234</port>
            </server>
            <server>
                <id>2</id>
                <hostname>clickhouse-keeper-02</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-start -->
            <server>
                <id>3</id>
                <hostname>clickhouse-keeper-03</hostname>
                <port>9234</port>
            </server>
            <!-- highlight-end -->
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

## Тестирование {#testing}

Чтобы получить опыт работы с ReplicatedMergeTree и ClickHouse Keeper, вы можете выполнить следующие команды, которые позволят вам:
- Создать базу данных на сконфигурированном кластере
- Создать таблицу в базе данных, используя движок таблиц ReplicatedMergeTree
- Вставить данные на одном узле и запросить их на другом узле
- Остановить один узел сервера ClickHouse
- Вставить еще данные на работающем узле
- Перезапустить остановленный узел
- Убедиться, что данные доступны при запросе на перезапущенном узле

### Убедитесь, что ClickHouse Keeper работает {#verify-that-clickhouse-keeper-is-running}

Команда `mntr` используется для проверки, что ClickHouse Keeper работает, и для получения информации о состоянии взаимоотношений между тремя узлами Keeper. В конфигурации, используемой в этом примере, три узла работают вместе. Узлы выберут лидера, а остальные узлы станут последователями. Команда `mntr` предоставляет информацию, связанную с производительностью, и о том, является ли конкретный узел последователем или лидером.

:::tip
Вам может потребоваться установить `netcat`, чтобы отправить команду `mntr` в Keeper. Пожалуйста, смотрите страницу [nmap.org](https://nmap.org/ncat/) для информации о загрузке.
:::

```bash title="запускать из оболочки на clickhouse-keeper-01, clickhouse-keeper-02 и clickhouse-keeper-03"
echo mntr | nc localhost 9181
```
```response title="ответ от последователя"
zk_version      v23.3.1.2823-testing-46e85357ce2da2a99f56ee83a079e892d7ec3726
zk_avg_latency  0
zk_max_latency  0
zk_min_latency  0
zk_packets_received     0
zk_packets_sent 0
zk_num_alive_connections        0
zk_outstanding_requests 0

# highlight-next-line
zk_server_state follower
zk_znode_count  6
zk_watch_count  0
zk_ephemerals_count     0
zk_approximate_data_size        1271
zk_key_arena_size       4096
zk_latest_snapshot_size 0
zk_open_file_descriptor_count   46
zk_max_file_descriptor_count    18446744073709551615
```

```response title="ответ от лидера"
zk_version      v23.3.1.2823-testing-46e85357ce2da2a99f56ee83a079e892d7ec3726
zk_avg_latency  0
zk_max_latency  0
zk_min_latency  0
zk_packets_received     0
zk_packets_sent 0
zk_num_alive_connections        0
zk_outstanding_requests 0

# highlight-next-line
zk_server_state leader
zk_znode_count  6
zk_watch_count  0
zk_ephemerals_count     0
zk_approximate_data_size        1271
zk_key_arena_size       4096
zk_latest_snapshot_size 0
zk_open_file_descriptor_count   48
zk_max_file_descriptor_count    18446744073709551615

# highlight-start
zk_followers    2
zk_synced_followers     2

# highlight-end
```

### Проверьте функциональность кластера ClickHouse {#verify-clickhouse-cluster-functionality}

Подключитесь к узлу `clickhouse-01` с помощью `clickhouse client` в одной оболочке, и подключитесь к узлу `clickhouse-02` с помощью `clickhouse client` в другой оболочке.

1. Создайте базу данных на сконфигурированном кластере

```sql title="запуск на любом узле clickhouse-01 или clickhouse-02"
CREATE DATABASE db1 ON CLUSTER cluster_1S_2R
```
```response
┌─host──────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ clickhouse-02 │ 9000 │      0 │       │                   1 │                0 │
│ clickhouse-01 │ 9000 │      0 │       │                   0 │                0 │
└───────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

2. Создайте таблицу в базе данных, используя движок таблиц ReplicatedMergeTree
```sql title="запуск на любом узле clickhouse-01 или clickhouse-02"
CREATE TABLE db1.table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree
ORDER BY id
```
```response
┌─host──────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ clickhouse-02 │ 9000 │      0 │       │                   1 │                0 │
│ clickhouse-01 │ 9000 │      0 │       │                   0 │                0 │
└───────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```
3. Вставьте данные на одном узле и запросите их на другом узле
```sql title="запуск на узле clickhouse-01"
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');
```

4. Запросите таблицу на узле `clickhouse-02`
```sql title="запуск на узле clickhouse-02"
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
```

5. Вставьте данные на другом узле и запросите их на узле `clickhouse-01`
```sql title="запуск на узле clickhouse-02"
INSERT INTO db1.table1 (id, column1) VALUES (2, 'def');
```

```sql title="запуск на узле clickhouse-01"
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

6. Остановите один узел сервера ClickHouse
Остановите один из узлов сервера ClickHouse, выполнив команду операционной системы, аналогичную команде, использованной для запуска узла. Если вы использовали `systemctl start` для запуска узла, используйте `systemctl stop` для его остановки.

7. Вставьте еще данные на работающем узле
```sql title="запуск на работающем узле"
INSERT INTO db1.table1 (id, column1) VALUES (3, 'ghi');
```

Выберите данные:
```sql title="запуск на работающем узле"
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
┌─id─┬─column1─┐
│  3 │ ghi     │
└────┴─────────┘
```

8. Перезапустите остановленный узел и выберите данные также оттуда

```sql title="запуск на перезапущенном узле"
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
┌─id─┬─column1─┐
│  3 │ ghi     │
└────┴─────────┘
```
