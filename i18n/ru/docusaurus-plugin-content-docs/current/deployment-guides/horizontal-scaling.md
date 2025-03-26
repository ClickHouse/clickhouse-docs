---
slug: /architecture/horizontal-scaling
sidebar_label: 'Масштабирование'
sidebar_position: 10
title: 'Масштабирование'
description: 'Страница, описывающая пример архитектуры, разработанной для обеспечения масштабируемости'
---
```

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';
import ConfigFileNote from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_config-files.md';
import scalingOut1 from '@site/static/images/deployment-guides/scaling-out-1.png';

## Описание {#description}
Эта примерная архитектура разработана для обеспечения масштабируемости. Она включает три узла: два сервера, объединяющих ClickHouse и координацию (ClickHouse Keeper), и третий сервер только с ClickHouse Keeper для завершения кворума из трех. С помощью этого примера мы создадим базу данных, таблицу и распределённую таблицу, которые смогут запрашивать данные на обоих узлах.

## Уровень: Базовый {#level-basic}

<ReplicationShardingTerminology />

## Среда {#environment}
### Схема архитектуры {#architecture-diagram}

<Image img={scalingOut1} size='md' alt='Схема архитектуры для 2 шардов и 1 реплики' />

|Узел|Описание|
|----|-----------|
|`chnode1`|Данные + ClickHouse Keeper|
|`chnode2`|Данные + ClickHouse Keeper|
|`chnode3`|Используется для кворума ClickHouse Keeper|

:::note
В производственных средах мы настоятельно рекомендуем запускать ClickHouse Keeper на выделенных хостах. Эта базовая конфигурация запускает функциональность Keeper в рамках процесса сервера ClickHouse. Инструкции для развертывания ClickHouse Keeper отдельно можно найти в [документации по установке](/getting-started/install.md/#install-standalone-clickhouse-keeper).
:::

## Установка {#install}

Установите Clickhouse на трех серверах, следуя [инструкциям для вашего типа архива](/getting-started/install.md/#available-installation-options) (.deb, .rpm, .tar.gz и т.д.). Для этого примера вы будете следовать инструкциям по установке для ClickHouse Server и Client на всех трех машинах.

## Редактирование файлов конфигурации {#editing-configuration-files}

<ConfigFileNote />

## Конфигурация chnode1 {#chnode1-configuration}

Для `chnode1` существует пять файлов конфигурации. Вы можете объединить эти файлы в один, но для ясности в документации может быть проще рассмотреть их по отдельности. Перечитывая файлы конфигурации, вы увидите, что большая часть конфигурации одинаковая между `chnode1` и `chnode2`; отличия будут выделены.

### Конфигурация сети и логирования {#network-and-logging-configuration}

Эти значения можно настроить по вашему усмотрению. Эта примерная конфигурация дает вам отладочный лог, который будет обновляться через каждые 1000M три раза. ClickHouse будет слушать на IPv4 сети на портах 8123 и 9000 и использовать порт 9009 для межсерверной связи.

```xml title="network-and-logging.xml на chnode1"
<clickhouse>
        <logger>
                <level>debug</level>
                <log>/var/log/clickhouse-server/clickhouse-server.log</log>
                <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
                <size>1000M</size>
                <count>3</count>
        </logger>
        <display_name>clickhouse</display_name>
        <listen_host>0.0.0.0</listen_host>
        <http_port>8123</http_port>
        <tcp_port>9000</tcp_port>
        <interserver_http_port>9009</interserver_http_port>
</clickhouse>
```

### Конфигурация ClickHouse Keeper {#clickhouse-keeper-configuration}

ClickHouse Keeper предоставляет систему координации для репликации данных и выполнения распределённых запросов DDL. ClickHouse Keeper совместим с Apache ZooKeeper. Эта конфигурация включает ClickHouse Keeper на порту 9181. Выделенная строка указывает, что этот экземпляр Keeper имеет `server_id` равный 1. Это единственное отличие в файле `enable-keeper.xml` между тремя серверами. `chnode2` будет иметь `server_id` равный `2`, а `chnode3` будет иметь `server_id` равный `3`. Раздел конфигурации raft одинаков на всех трех серверах, и он выделен ниже, чтобы показать вам соотношение между `server_id` и экземпляром `server` в конфигурации raft.

:::note
Если по какой-либо причине узел Keeper заменяется или восстанавливается, не повторяйте существующий `server_id`. Например, если узел Keeper с `server_id` равным `2` восстанавливается, дайте ему `server_id` равный `4` или выше.
:::

```xml title="enable-keeper.xml на chnode1"
<clickhouse>
  <keeper_server>
    <tcp_port>9181</tcp_port>
 # highlight-next-line
    <server_id>1</server_id>
    <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
    <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

    <coordination_settings>
        <operation_timeout_ms>10000</operation_timeout_ms>
        <session_timeout_ms>30000</session_timeout_ms>
        <raft_logs_level>trace</raft_logs_level>
    </coordination_settings>

    <raft_configuration>
    # highlight-start
        <server>
            <id>1</id>
            <hostname>chnode1</hostname>
            <port>9234</port>
        </server>
    # highlight-end
        <server>
            <id>2</id>
            <hostname>chnode2</hostname>
            <port>9234</port>
        </server>
        <server>
            <id>3</id>
            <hostname>chnode3</hostname>
            <port>9234</port>
        </server>
    </raft_configuration>
  </keeper_server>
</clickhouse>
```

### Конфигурация макросов {#macros-configuration}

Макросы `shard` и `replica` уменьшают сложность распределённых DDL. Сконфигурированные значения автоматически подставляются в ваши запросы DDL, что упрощает ваши DDL. Макросы для этой конфигурации указывают номер шардов и реплики для каждого узла. В этом примере с 2 шардом и 1 репликой макрос реплики — `replica_1` на обоих узлах `chnode1` и `chnode2`, поскольку есть только одна реплика. Макрос шардов равен `1` на `chnode1` и `2` на `chnode2`.

```xml title="macros.xml на chnode1"
<clickhouse>
  <macros>
 # highlight-next-line
    <shard>1</shard>
    <replica>replica_1</replica>
  </macros>
</clickhouse>
```

### Конфигурация репликации и шардирования {#replication-and-sharding-configuration}

Начинаем сверху:
- Раздел `remote_servers` в XML указывает каждый из кластеров в среде. Атрибут `replace=true` заменяет пример `remote_servers` в стандартной конфигурации ClickHouse на конфигурацию `remote_servers`, указанную в этом файле. Без этого атрибута удалённые серверы в этом файле будут добавлены к списку примеров в стандартной конфигурации.
- В этом примере есть один кластер с именем `cluster_2S_1R`.
- Создается секрет для кластера с именем `cluster_2S_1R` со значением `mysecretphrase`. Секрет разделяется на всех удалённых серверах в среде, чтобы обеспечить правильное соединение серверов.
- Кластер `cluster_2S_1R` имеет два шарда, и каждый из этих шардов имеет одну реплику. Посмотрите на схему архитектуры в начале этого документа и сравните её с двумя определениями `shard` в XML ниже. В каждом определении шардов есть одна реплика. Хост и порт для этой реплики указаны. Реплика для первого шарада в конфигурации хранится на `chnode1`, а реплика для второго шарада в конфигурации хранится на `chnode2`.
- Внутренняя репликация для шардов установлена в истинное значение. Каждый шард может иметь параметр `internal_replication`, определяемый в файле конфигурации. Если этот параметр установлен в истинное значение, операция записи выбирает первую здоровую реплику и записывает данные в неё.

```xml title="remote-servers.xml на chnode1"
<clickhouse>
  <remote_servers replace="true">
    <cluster_2S_1R>
    <secret>mysecretphrase</secret>
        <shard>
            <internal_replication>true</internal_replication>
            <replica>
                <host>chnode1</host>
                <port>9000</port>
            </replica>
        </shard>
        <shard>
            <internal_replication>true</internal_replication>
            <replica>
                <host>chnode2</host>
                <port>9000</port>
            </replica>
        </shard>
    </cluster_2S_1R>
  </remote_servers>
</clickhouse>
```

### Конфигурация использования Keeper {#configuring-the-use-of-keeper}

В вышеупомянутых файлах был настроен ClickHouse Keeper. Этот файл конфигурации `use-keeper.xml` настраивает ClickHouse Server на использование ClickHouse Keeper для координации репликации и распределенных DDL. Этот файл указывает, что ClickHouse Server должен использовать Keeper на узлах chnode1 - 3 на порту 9181, и файл одинаков на `chnode1` и `chnode2`.

```xml title="use-keeper.xml на chnode1"
<clickhouse>
    <zookeeper>
        <node index="1">
            <host>chnode1</host>
            <port>9181</port>
        </node>
        <node index="2">
            <host>chnode2</host>
            <port>9181</port>
        </node>
        <node index="3">
            <host>chnode3</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```

## Конфигурация chnode2 {#chnode2-configuration}

Так как конфигурация очень похожа на `chnode1` и `chnode2`, здесь будут указаны только отличия.

### Конфигурация сети и логирования {#network-and-logging-configuration-1}

```xml title="network-and-logging.xml на chnode2"
<clickhouse>
        <logger>
                <level>debug</level>
                <log>/var/log/clickhouse-server/clickhouse-server.log</log>
                <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
                <size>1000M</size>
                <count>3</count>
        </logger>
        <display_name>clickhouse</display_name>
        <listen_host>0.0.0.0</listen_host>
        <http_port>8123</http_port>
        <tcp_port>9000</tcp_port>
        <interserver_http_port>9009</interserver_http_port>
</clickhouse>
```

### Конфигурация ClickHouse Keeper {#clickhouse-keeper-configuration-1}

Этот файл содержит одно из двух отличий между `chnode1` и `chnode2`. В конфигурации Keeper `server_id` установлен в `2`.

```xml title="enable-keeper.xml на chnode2"
<clickhouse>
  <keeper_server>
    <tcp_port>9181</tcp_port>
 # highlight-next-line
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
            <hostname>chnode1</hostname>
            <port>9234</port>
        </server>
        # highlight-start
        <server>
            <id>2</id>
            <hostname>chnode2</hostname>
            <port>9234</port>
        </server>
        # highlight-end
        <server>
            <id>3</id>
            <hostname>chnode3</hostname>
            <port>9234</port>
        </server>
    </raft_configuration>
  </keeper_server>
</clickhouse>
```

### Конфигурация макросов {#macros-configuration-1}

Конфигурация макросов имеет одно из отличий между `chnode1` и `chnode2`. `shard` установлен в `2` на этом узле.

```xml title="macros.xml на chnode2"
<clickhouse>
<macros>
 # highlight-next-line
    <shard>2</shard>
    <replica>replica_1</replica>
</macros>
</clickhouse>
```

### Конфигурация репликации и шардирования {#replication-and-sharding-configuration-1}

```xml title="remote-servers.xml на chnode2"
<clickhouse>
  <remote_servers replace="true">
    <cluster_2S_1R>
    <secret>mysecretphrase</secret>
        <shard>
            <internal_replication>true</internal_replication>
            <replica>
                <host>chnode1</host>
                <port>9000</port>
            </replica>
        </shard>
            <shard>
            <internal_replication>true</internal_replication>
            <replica>
                <host>chnode2</host>
                <port>9000</port>
            </replica>
        </shard>
    </cluster_2S_1R>
  </remote_servers>
</clickhouse>
```

### Конфигурация использования Keeper {#configuring-the-use-of-keeper-1}

```xml title="use-keeper.xml на chnode2"
<clickhouse>
    <zookeeper>
        <node index="1">
            <host>chnode1</host>
            <port>9181</port>
        </node>
        <node index="2">
            <host>chnode2</host>
            <port>9181</port>
        </node>
        <node index="3">
            <host>chnode3</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```

## Конфигурация chnode3 {#chnode3-configuration}

Так как `chnode3` не хранит данные и используется только как ClickHouse Keeper для обеспечения третьего узла в кворуме, `chnode3` имеет только два файла конфигурации: один для настройки сети и логирования, и один для настройки ClickHouse Keeper.

### Конфигурация сети и логирования {#network-and-logging-configuration-2}

```xml title="network-and-logging.xml на chnode3"
<clickhouse>
        <logger>
                <level>debug</level>
                <log>/var/log/clickhouse-server/clickhouse-server.log</log>
                <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
                <size>1000M</size>
                <count>3</count>
        </logger>
        <display_name>clickhouse</display_name>
        <listen_host>0.0.0.0</listen_host>
        <http_port>8123</http_port>
        <tcp_port>9000</tcp_port>
        <interserver_http_port>9009</interserver_http_port>
</clickhouse>
```

### Конфигурация ClickHouse Keeper {#clickhouse-keeper-configuration-2}

```xml title="enable-keeper.xml на chnode3"
<clickhouse>
  <keeper_server>
    <tcp_port>9181</tcp_port>
 # highlight-next-line
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
            <hostname>chnode1</hostname>
            <port>9234</port>
        </server>
        <server>
            <id>2</id>
            <hostname>chnode2</hostname>
            <port>9234</port>
        </server>
        # highlight-start
        <server>
            <id>3</id>
            <hostname>chnode3</hostname>
            <port>9234</port>
        </server>
        # highlight-end
    </raft_configuration>
  </keeper_server>
</clickhouse>
```

## Тестирование {#testing}

1. Подключитесь к `chnode1` и проверьте, что кластер `cluster_2S_1R`, настроенный выше, существует

```sql title="Запрос"
SHOW CLUSTERS
```

```response title="Ответ"
┌─cluster───────┐
│ cluster_2S_1R │
└───────────────┘
```

2. Создайте базу данных в кластере

```sql title="Запрос"
CREATE DATABASE db1 ON CLUSTER cluster_2S_1R
```

```response title="Ответ"
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2 │ 9000 │      0 │       │                   1 │                0 │
│ chnode1 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

3. Создайте таблицу с движком таблицы MergeTree в кластере.
:::note
Не нужно указывать параметры в движке таблицы, так как они будут автоматически определены в зависимости от наших макросов.
:::

```sql title="Запрос"
CREATE TABLE db1.table1 ON CLUSTER cluster_2S_1R
(
    `id` UInt64,
    `column1` String
)
ENGINE = MergeTree
ORDER BY id
```
```response title="Ответ"
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1 │ 9000 │      0 │       │                   1 │                0 │
│ chnode2 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

4. Подключитесь к `chnode1` и вставьте строку

```sql title="Запрос"
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');
```

5. Подключитесь к `chnode2` и вставьте строку

```sql title="Запрос"
INSERT INTO db1.table1 (id, column1) VALUES (2, 'def');
```

6. Подключитесь к любому узлу, `chnode1` или `chnode2`, и вы увидите только строку, которая была вставлена в эту таблицу на этом узле.
например, на `chnode2`

```sql title="Запрос"
SELECT * FROM db1.table1;
```

```response title="Ответ"
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

7. Создайте распределенную таблицу для запроса обоих шардов на обоих узлах.
(В этом примере функция `rand()` установлена как ключ шардирования, чтобы она случайным образом распределяла каждую вставку)

```sql title="Запрос"
CREATE TABLE db1.table1_dist ON CLUSTER cluster_2S_1R
(
    `id` UInt64,
    `column1` String
)
ENGINE = Distributed('cluster_2S_1R', 'db1', 'table1', rand())
```

```response title="Ответ"
┌─host────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2 │ 9000 │      0 │       │                   1 │                0 │
│ chnode1 │ 9000 │      0 │       │                   0 │                0 │
└─────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

8. Подключитесь к любому из узлов `chnode1` или `chnode2` и выполните запрос к распределённой таблице, чтобы увидеть обе строки.

```sql title="Запрос"
SELECT * FROM db1.table1_dist;
```

```reponse title="Ответ"
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
```

## Дополнительная информация о: {#more-information-about}

- [Движок распределенных таблиц](/engines/table-engines/special/distributed.md)
- [ClickHouse Keeper](/guides/sre/keeper/index.md)
