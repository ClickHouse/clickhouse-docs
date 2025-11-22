---
description: 'Документация по обнаружению кластеров в ClickHouse'
sidebar_label: 'Обнаружение кластеров'
slug: /operations/cluster-discovery
title: 'Обнаружение кластеров'
doc_type: 'guide'
---



# Обнаружение кластера



## Обзор {#overview}

Функция Cluster Discovery в ClickHouse упрощает конфигурацию кластера, позволяя узлам автоматически обнаруживать и регистрировать себя без необходимости явного определения в конфигурационных файлах. Это особенно полезно в случаях, когда ручное определение каждого узла становится обременительным.

:::note

Cluster Discovery является экспериментальной функцией и может быть изменена или удалена в будущих версиях.
Чтобы включить её, добавьте параметр `allow_experimental_cluster_discovery` в конфигурационный файл:

```xml
<clickhouse>
    <!-- ... -->
    <allow_experimental_cluster_discovery>1</allow_experimental_cluster_discovery>
    <!-- ... -->
</clickhouse>
```

:::


## Конфигурация удалённых серверов {#remote-servers-configuration}

### Традиционная ручная конфигурация {#traditional-manual-configuration}

Традиционно в ClickHouse каждый шард и каждая реплика в кластере должны были указываться в конфигурации вручную:

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

### Использование автоматического обнаружения кластера {#using-cluster-discovery}

При использовании автоматического обнаружения кластера вместо явного определения каждого узла достаточно указать путь в ZooKeeper. Все узлы, которые зарегистрируются по этому пути в ZooKeeper, будут автоматически обнаружены и добавлены в кластер.

```xml
<remote_servers>
    <cluster_name>
        <discovery>
            <path>/clickhouse/discovery/cluster_name</path>

            <!-- # Необязательные параметры конфигурации: -->

            <!-- ## Учётные данные для доступа ко всем остальным узлам кластера: -->
            <!-- <user>user1</user> -->
            <!-- <password>pass123</password> -->
            <!-- ### В качестве альтернативы паролю может использоваться межсерверный секрет: -->
            <!-- <secret>secret123</secret> -->

            <!-- ## Шард для текущего узла (см. ниже): -->
            <!-- <shard>1</shard> -->

            <!-- ## Режим наблюдателя (см. ниже): -->
            <!-- <observer/> -->
        </discovery>
    </cluster_name>
</remote_servers>
```

Если необходимо указать номер шарда для конкретного узла, можно добавить тег `<shard>` в секцию `<discovery>`:

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

Узлы, настроенные в режиме наблюдателя, не регистрируют себя в качестве реплик.
Они только наблюдают и обнаруживают другие активные реплики в кластере, не участвуя в работе кластера активно.
Чтобы включить режим наблюдателя, добавьте тег `<observer/>` в секцию `<discovery>`:

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <observer/>
</discovery>
```

### Обнаружение кластеров {#discovery-of-clusters}

Иногда требуется добавлять и удалять не только хосты в кластерах, но и сами кластеры. Для этого можно использовать узел `<multicluster_root_path>` с корневым путём для нескольких кластеров:

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

В этом случае, когда какой-либо хост зарегистрируется по пути `/clickhouse/discovery/some_new_cluster`, будет добавлен кластер с именем `some_new_cluster`.

Обе возможности можно использовать одновременно: хост может зарегистрировать себя в кластере `my_cluster` и обнаруживать любые другие кластеры:

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

- Нельзя использовать одновременно `<path>` и `<multicluster_root_path>` в одном поддереве `remote_servers`.
- `<multicluster_root_path>` может использоваться только с `<observer/>`.
- Последняя часть пути из Keeper используется в качестве имени кластера, тогда как при регистрации имя берётся из XML-тега.


## Варианты использования и ограничения {#use-cases-and-limitations}

При добавлении или удалении узлов из указанного пути ZooKeeper они автоматически обнаруживаются или удаляются из кластера без необходимости изменения конфигурации или перезапуска сервера.

Однако изменения затрагивают только конфигурацию кластера, но не данные или существующие базы данных и таблицы.

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

Затем добавим новый узел в кластер, запустив новый узел с той же записью в секции `remote_servers` в файле конфигурации:

```response
┌─cluster─┬─shard_num─┬─shard_weight─┬─replica_num─┬─host_name────┬─host_address─┬─port─┬─is_local─┬─user─┬─is_active─┐
│ default │         1 │            1 │           1 │ 92d3c04025e8 │ 172.26.0.5   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           2 │ a6a68731c21b │ 172.26.0.4   │ 9000 │        1 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           3 │ 8e62b9cb17a1 │ 172.26.0.2   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           4 │ b0df3669b81f │ 172.26.0.6   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
└─────────┴───────────┴──────────────┴─────────────┴──────────────┴──────────────┴──────┴──────────┴──────┴───────────┘
```

Четвёртый узел участвует в кластере, но таблица `event_table` по-прежнему существует только на первых трёх узлах:

```sql
SELECT hostname(), database, table FROM clusterAllReplicas(default, system.tables) WHERE table = 'event_table' FORMAT PrettyCompactMonoBlock

```


┌─hostname()───┬─database─┬─table───────┐
│ a6a68731c21b │ default  │ event&#95;table │
│ 92d3c04025e8 │ default  │ event&#95;table │
│ 8e62b9cb17a1 │ default  │ event&#95;table │
└──────────────┴──────────┴─────────────┘

```

Если вам необходимо реплицировать таблицы на всех узлах, вы можете использовать движок базы данных [Replicated](../engines/database-engines/replicated.md) в качестве альтернативы механизму обнаружения кластера.
```
