---
slug: /architecture/replication
sidebar_label: 'Репликация для отказоустойчивости'
sidebar_position: 10
title: 'Репликация для отказоустойчивости'
description: 'Страница, описывающая пример архитектуры с пятью настроенными серверами. Два используются для размещения копий данных, а остальные используются для координации репликации данных'
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/docs/_snippets/_replication-sharding-terminology.md';
import ConfigFileNote from '@site/docs/_snippets/_config-files.md';
import KeeperConfigFileNote from '@site/docs/_snippets/_keeper-config-files.md';
import ReplicationArchitecture from '@site/static/images/deployment-guides/architecture_1s_2r_3_nodes.png';

## Описание {#description}
В этой архитектуре настроено пять серверов. Два из них используются для размещения копий данных. Остальные три сервера используются для координации репликации данных. На этом примере мы создадим базу данных и таблицу, которые будут реплицироваться на обоих узлах данных с использованием движка таблиц ReplicatedMergeTree.

## Уровень: Базовый {#level-basic}

<ReplicationShardingTerminology />

## Среда {#environment}
### Диаграмма архитектуры {#architecture-diagram}

<Image img={ReplicationArchitecture} size="md" alt="Диаграмма архитектуры для 1 шард и 2 реплики с ReplicatedMergeTree" />

|Узел|Описание|
|----|-----------|
|clickhouse-01|Данные|
|clickhouse-02|Данные|
|clickhouse-keeper-01|Распределенная координация|
|clickhouse-keeper-02|Распределенная координация|
|clickhouse-keeper-03|Распределенная координация|

:::note
В продуктивных средах мы настоятельно рекомендуем использовать *выделенные* хосты для ClickHouse Keeper. В тестовой среде приемлемо запускать ClickHouse Server и ClickHouse Keeper на одном сервере. Другой основной пример, [Масштабирование](/deployment-guides/horizontal-scaling.md), использует этот метод. В этом примере мы представляем рекомендуемый метод отделения Keeper от ClickHouse Server. Серверы Keeper могут быть меньше, 4 ГБ RAM обычно достаточно для каждого сервера Keeper до тех пор, пока ваши ClickHouse Server не станут очень большими.
:::

## Установка {#install}

Установите сервер и клиент ClickHouse на двух серверах `clickhouse-01` и `clickhouse-02`, следуя [инструкциям для вашего типа архива](/getting-started/install.md/#available-installation-options) (.deb, .rpm, .tar.gz и т.д.).

Установите ClickHouse Keeper на трех серверах `clickhouse-keeper-01`, `clickhouse-keeper-02` и `clickhouse-keeper-03`, следуя [инструкциям для вашего типа архива](/getting-started/install.md/#install-standalone-clickhouse-keeper) (.deb, .rpm, .tar.gz и т.д.).

## Редактирование файлов конфигурации {#editing-configuration-files}

<ConfigFileNote />

## Конфигурация clickhouse-01 {#clickhouse-01-configuration}

Для clickhouse-01 существует пять файлов конфигурации. Вы можете выбрать, чтобы объединить эти файлы в один, но для ясности в документации может быть проще рассмотреть их по отдельности. Читая файлы конфигурации, вы увидите, что большая часть конфигурации одинакова между clickhouse-01 и clickhouse-02; различия будут выделены.

### Конфигурация сети и логирования {#network-and-logging-configuration}

Эти значения могут быть настроены по вашему усмотрению. Эта примерная конфигурация предоставляет вам:
- отладочный журнал, который будет сворачиваться при достижении 1000M три раза
- название, отображаемое при подключении с помощью `clickhouse-client`, - `cluster_1S_2R node 1`
- ClickHouse будет слушать на IPV4 сети на портах 8123 и 9000.

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

Макросы `shard` и `replica` снижают сложность распределенного DDL. Настроенные значения автоматически подставляются в ваши DDL-запросы, что упрощает ваш DDL. Макросы для этой конфигурации задают номер шарда и реплики для каждого узла. В этом примере с 1 шардом и 2 репликами макрос реплики - `replica_1` на clickhouse-01 и `replica_2` на clickhouse-02. Макрос шарда - `1` на обоих clickhouse-01 и clickhouse-02, поскольку имеется только один шард.

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
- Секция `remote_servers` в XML определяет каждый из кластеров в среде. Атрибут `replace=true` заменяет образцы `remote_servers` в конфигурации по умолчанию ClickHouse на конфигурацию `remote_server`, указанную в этом файле. Без этого атрибута удаленные серверы в этом файле были бы добавлены в список образцов в конфигурации по умолчанию.
- В этом примере есть один кластер с именем `cluster_1S_2R`.
- Создается секрет для кластера с именем `cluster_1S_2R` со значением `mysecretphrase`. Секрет делится между всеми удаленными серверами в среде, чтобы гарантировать, что правильные серверы соединяются друг с другом.
- Кластер `cluster_1S_2R` имеет один шард и две реплики. Взгляните на диаграмму архитектуры в начале этого документа и сравните ее с определением `shard` в приведенном ниже XML. Определение шарда содержит две реплики. Хост и порт для каждой реплики указаны. Одна реплика хранится на `clickhouse-01`, а другая реплика хранится на `clickhouse-02`.
- Внутренняя репликация для шарда установлена как true. Каждый шард может иметь параметр `internal_replication`, определенный в файле конфигурации. Если этот параметр установлен на true, операция записи выбирает первую здоровую реплику и записывает данные в нее.

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

Этот файл конфигурации `use-keeper.xml` настраивает ClickHouse Server для использования ClickHouse Keeper для координации репликации и распределенного DDL. Этот файл указывает, что ClickHouse Server должен использовать Keeper на узлах clickhouse-keeper-01 - 03 на порту 9181, и файл одинаковый на `clickhouse-01` и `clickhouse-02`.

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

Поскольку конфигурация очень похожа на clickhouse-01 и clickhouse-02, здесь будут указаны только различия.

### Конфигурация сети и логирования {#network-and-logging-configuration-1}

Этот файл одинаков на обоих узлах clickhouse-01 и clickhouse-02, за исключением `display_name`.

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

Конфигурация макросов различается между clickhouse-01 и clickhouse-02. `replica` установлен на `02` на этом узле.

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

Этот файл одинаков на обоих узлах clickhouse-01 и clickhouse-02.

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

Этот файл одинаков на обоих узлах clickhouse-01 и clickhouse-02.

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

ClickHouse Keeper обеспечивает систему координации для репликации данных и выполнения распределенных запросов DDL. ClickHouse Keeper совместим с Apache ZooKeeper. Эта конфигурация включает ClickHouse Keeper на порту 9181. Выделенная строка указывает, что у этого экземпляра Keeper идентификатор сервера равен 1. Это единственное различие в файле `enable-keeper.xml` на трех серверах. `clickhouse-keeper-02` будет иметь `server_id`, установленный на `2`, а `clickhouse-keeper-03` будет иметь `server_id`, установленный на `3`. Секция конфигурации raft одинакова на всех трех серверах; она выделена ниже, чтобы показать вам взаимосвязь между `server_id` и экземпляром `server` в конфигурации raft.

:::note
Если по какой-либо причине узел Keeper заменяется или пересобирается, не повторно используйте существующий `server_id`. Например, если узел Keeper с `server_id` 2 пересобирается, задайте ему `server_id` равный 4 или больше.
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

Существует только одна строка различий между `clickhouse-keeper-01` и `clickhouse-keeper-02`. `server_id` установлен на `2` на этом узле.

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

Существует только одна строка различий между `clickhouse-keeper-01` и `clickhouse-keeper-03`. `server_id` установлен на `3` на этом узле.

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
- Создать базу данных на кластер, настроенном выше
- Создать таблицу в базе данных, используя движок таблиц ReplicatedMergeTree
- Вставить данные на одном узле и запросить их на другом узле
- Остановить один узел сервера ClickHouse
- Вставить больше данных на работающем узле
- Перезапустить остановленный узел
- Убедиться, что данные доступны при выполнении запроса к перезапущенному узлу

### Убедитесь, что ClickHouse Keeper работает {#verify-that-clickhouse-keeper-is-running}

Команда `mntr` используется для проверки того, что ClickHouse Keeper работает, и получения информации о состоянии отношений между тремя узлами Keeper. В конфигурации, использованной в этом примере, есть три узла, работающие вместе. Узлы выберут лидера, а остальные узлы будут последователями. Команда `mntr` предоставляет информацию, связанную с производительностью, и о том, является ли конкретный узел последователем или лидером.

:::tip
Вам может понадобиться установить `netcat`, чтобы отправить команду `mntr` на Keeper. Пожалуйста, смотрите страницу [nmap.org](https://nmap.org/ncat/) для получения информации о загрузке.
:::

```bash title="выполнить из оболочки на clickhouse-keeper-01, clickhouse-keeper-02 и clickhouse-keeper-03"
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

### Проверьте работоспособность кластера ClickHouse {#verify-clickhouse-cluster-functionality}

Подключитесь к узлу `clickhouse-01` с помощью `clickhouse client` в одной оболочке и подключитесь к узлу `clickhouse-02` с помощью `clickhouse client` в другой оболочке.

1. Создайте базу данных на кластере, настроенном выше

```sql title="выполнить на любом узле clickhouse-01 или clickhouse-02"
CREATE DATABASE db1 ON CLUSTER cluster_1S_2R
```
```response
┌─host──────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ clickhouse-02 │ 9000 │      0 │       │                   1 │                0 │
│ clickhouse-01 │ 9000 │      0 │       │                   0 │                0 │
└───────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

2. Создайте таблицу в базе данных, используя движок таблиц ReplicatedMergeTree
```sql title="выполнить на любом узле clickhouse-01 или clickhouse-02"
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
```sql title="выполнить на узле clickhouse-01"
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');
```

4. Запросите таблицу на узле `clickhouse-02`
```sql title="выполнить на узле clickhouse-02"
SELECT *
FROM db1.table1
```
```response
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
```

5. Вставьте данные на другом узле и запросите их на узле `clickhouse-01`
```sql title="выполнить на узле clickhouse-02"
INSERT INTO db1.table1 (id, column1) VALUES (2, 'def');
```

```sql title="выполнить на узле clickhouse-01"
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
Остановите один из узлов сервера ClickHouse, выполнив команду операционной системы, аналогичную команде, использованной для запуска узла. Если вы использовали `systemctl start` для запуска узла, то используйте `systemctl stop` для его остановки.

7. Вставьте больше данных на работающем узле
```sql title="выполнить на работающем узле"
INSERT INTO db1.table1 (id, column1) VALUES (3, 'ghi');
```

Выберите данные:
```sql title="выполнить на работающем узле"
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

8. Перезапустите остановленный узел и выберите данные оттуда также

```sql title="выполнить на перезапущенном узле"
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
