---
slug: '/operations/cluster-discovery'
sidebar_label: 'Обнаружение кластера'
description: 'Документация для cluster discovery в ClickHouse'
title: 'Обнаружение кластера'
doc_type: guide
---
# Обнаружение кластера

## Обзор {#overview}

Функция обнаружения кластера в ClickHouse упрощает конфигурацию кластера, позволяя узлам автоматически обнаруживать и регистрировать себя без необходимости явного определения в файлах конфигурации. Это особенно полезно в случаях, когда ручное определение каждого узла становится громоздким.

:::note

Обнаружение кластера является экспериментальной функцией и может быть изменено или удалено в будущих версиях. Чтобы включить его, добавьте настройку `allow_experimental_cluster_discovery` в ваш файл конфигурации:

```xml
<clickhouse>
    <!-- ... -->
    <allow_experimental_cluster_discovery>1</allow_experimental_cluster_discovery>
    <!-- ... -->
</clickhouse>
```
:::

## Конфигурация удаленных серверов {#remote-servers-configuration}

### Традиционная ручная конфигурация {#traditional-manual-configuration}

Traditionally, in ClickHouse, each shard and replica in the cluster needed to be manually specified in the configuration:

```xml
<remote_servers>
    <cluster_name>
        <shard>
            <replica>
                <host>node1</host>
                <port>9000</port>
            </replica>
            <replica>
                <host>node2</host>
                <port>9000</port>
            </replica>
        </shard>
        <shard>
            <replica>
                <host>node3</host>
                <port>9000</port>
            </replica>
            <replica>
                <host>node4</host>
                <port>9000</port>
            </replica>
        </shard>
    </cluster_name>
</remote_servers>

```

### Использование обнаружения кластера {#using-cluster-discovery}

С помощью обнаружения кластера, вместо того чтобы явно определять каждый узел, вы просто указываете путь в ZooKeeper. Все узлы, которые регистрируются под этим путем в ZooKeeper, будут автоматически обнаружены и добавлены в кластер.

```xml
<remote_servers>
    <cluster_name>
        <discovery>
            <path>/clickhouse/discovery/cluster_name</path>

            <!-- # Optional configuration parameters: -->

            <!-- ## Authentication credentials to access all other nodes in cluster: -->
            <!-- <user>user1</user> -->
            <!-- <password>pass123</password> -->
            <!-- ### Alternatively to password, interserver secret may be used: -->
            <!-- <secret>secret123</secret> -->

            <!-- ## Shard for current node (see below): -->
            <!-- <shard>1</shard> -->

            <!-- ## Observer mode (see below): -->
            <!-- <observer/> -->
        </discovery>
    </cluster_name>
</remote_servers>
```

Если вы хотите указать номер шарда для конкретного узла, вы можете включить тег `<shard>` в секцию `<discovery>`:

для `node1` и `node2`:

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>1</shard>
</discovery>
```

для `node3` и `node4`:

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>2</shard>
</discovery>
```

### Режим наблюдателя {#observer-mode}

Узлы, настроенные в режиме наблюдателя, не будут регистрировать себя как реплики. Они будут лишь наблюдать и обнаруживать другие активные реплики в кластере, не участвуя активно. Чтобы включить режим наблюдателя, добавьте тег `<observer/>` в секцию `<discovery>`:

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <observer/>
</discovery>
```

### Обнаружение кластеров {#discovery-of-clusters}

Иногда вам может понадобиться добавлять и удалять не только хосты в кластерах, но и сами кластеры. Вы можете использовать узел `<multicluster_root_path>`, который служит корнем для нескольких кластеров:

```xml
<remote_servers>
    <some_unused_name>
        <discovery>
            <multicluster_root_path>/clickhouse/discovery</multicluster_root_path>
            <observer/>
        </discovery>
    </some_unused_name>
</remote_servers>
```

В этом случае, когда другой хост регистрирует себя под путем `/clickhouse/discovery/some_new_cluster`, будет добавлен кластер с именем `some_new_cluster`.

Вы можете одновременно использовать обе функции, хост может зарегистрировать себя в кластере `my_cluster` и обнаруживать любые другие кластеры:

```xml
<remote_servers>
    <my_cluster>
        <discovery>
            <path>/clickhouse/discovery/my_cluster</path>
        </discovery>
    </my_cluster>
    <some_unused_name>
        <discovery>
            <multicluster_root_path>/clickhouse/discovery</multicluster_root_path>
            <observer/>
        </discovery>
    </some_unused_name>
</remote_servers>
```

Ограничения:
- Нельзя использовать и `<path>`, и `<multicluster_root_path>` в одном и том же поддереве `remote_servers`.
- `<multicluster_root_path>` может быть только с `<observer/>`.
- Последняя часть пути из Keeper используется как имя кластера, в то время как при регистрации имя берется из XML-тега.

## Сценарии использования и ограничения {#use-cases-and-limitations}

Когда узлы добавляются или удаляются из указанного пути ZooKeeper, они автоматически обнаруживаются или удаляются из кластера без необходимости изменения конфигурации или перезапуска сервера.

Однако изменения затрагивают только конфигурацию кластера, а не данные или существующие базы данных и таблицы.

Рассмотрим следующий пример с кластером из 3 узлов:

```xml
<remote_servers>
    <default>
        <discovery>
            <path>/clickhouse/discovery/default_cluster</path>
        </discovery>
    </default>
</remote_servers>
```

```sql
SELECT * EXCEPT (default_database, errors_count, slowdowns_count, estimated_recovery_time, database_shard_name, database_replica_name)
FROM system.clusters WHERE cluster = 'default';

┌─cluster─┬─shard_num─┬─shard_weight─┬─replica_num─┬─host_name────┬─host_address─┬─port─┬─is_local─┬─user─┬─is_active─┐
│ default │         1 │            1 │           1 │ 92d3c04025e8 │ 172.26.0.5   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           2 │ a6a68731c21b │ 172.26.0.4   │ 9000 │        1 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           3 │ 8e62b9cb17a1 │ 172.26.0.2   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
└─────────┴───────────┴──────────────┴─────────────┴──────────────┴──────────────┴──────┴──────────┴──────┴───────────┘
```

```sql
CREATE TABLE event_table ON CLUSTER default (event_time DateTime, value String)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/event_table', '{replica}')
ORDER BY event_time PARTITION BY toYYYYMM(event_time);

INSERT INTO event_table ...
```

Затем мы добавляем новый узел в кластер, запуская новый узел с той же записью в секции `remote_servers` в файле конфигурации:

```response
┌─cluster─┬─shard_num─┬─shard_weight─┬─replica_num─┬─host_name────┬─host_address─┬─port─┬─is_local─┬─user─┬─is_active─┐
│ default │         1 │            1 │           1 │ 92d3c04025e8 │ 172.26.0.5   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           2 │ a6a68731c21b │ 172.26.0.4   │ 9000 │        1 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           3 │ 8e62b9cb17a1 │ 172.26.0.2   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           4 │ b0df3669b81f │ 172.26.0.6   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
└─────────┴───────────┴──────────────┴─────────────┴──────────────┴──────────────┴──────┴──────────┴──────┴───────────┘
```

Четвертый узел участвует в кластере, но таблица `event_table` все еще существует только на первых трех узлах:

```sql
SELECT hostname(), database, table FROM clusterAllReplicas(default, system.tables) WHERE table = 'event_table' FORMAT PrettyCompactMonoBlock

┌─hostname()───┬─database─┬─table───────┐
│ a6a68731c21b │ default  │ event_table │
│ 92d3c04025e8 │ default  │ event_table │
│ 8e62b9cb17a1 │ default  │ event_table │
└──────────────┴──────────┴─────────────┘
```

Если вам нужно, чтобы таблицы реплицировались на всех узлах, вы можете использовать [Replicated](../engines/database-engines/replicated.md) движок базы данных в качестве альтернативы обнаружению кластера.