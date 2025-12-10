---
description: 'Руководство по обнаружению кластеров в ClickHouse'
sidebar_label: 'Обнаружение кластеров'
slug: /operations/cluster-discovery
title: 'Обнаружение кластеров'
doc_type: 'guide'
---

# Обнаружение кластера {#cluster-discovery}

## Обзор {#overview}

Функция Cluster Discovery в ClickHouse упрощает конфигурацию кластера, позволяя узлам автоматически обнаруживать и регистрировать себя без необходимости явного задания в конфигурационных файлах. Это особенно полезно в случаях, когда ручное описание каждого узла становится затруднительным.

:::note

Cluster Discovery — экспериментальная функция, и в будущих версиях она может быть изменена или удалена.
Чтобы включить её, добавьте настройку `allow_experimental_cluster_discovery` в конфигурационный файл:

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

Традиционно в ClickHouse каждый шард и каждая реплика в кластере должны были указываться вручную в конфигурации:

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

При использовании Cluster Discovery вместо явного указания каждого узла вы просто задаёте путь в ZooKeeper. Все узлы, которые зарегистрируются по этому пути в ZooKeeper, будут автоматически обнаружены и добавлены в кластер.

```xml
<remote_servers>
    <cluster_name>
        <discovery>
            <path>/clickhouse/discovery/cluster_name</path>

            <!-- # Дополнительные параметры конфигурации: -->

            <!-- ## Учетные данные аутентификации для доступа ко всем остальным узлам кластера: -->
            <!-- <user>user1</user> -->
            <!-- <password>pass123</password> -->
            <!-- ### Вместо пароля можно использовать межсерверный секрет: -->
            <!-- <secret>secret123</secret> -->

            <!-- ## Шард для текущего узла (см. ниже): -->
            <!-- <shard>1</shard> -->

            <!-- ## Режим наблюдателя (см. ниже): -->
            <!-- <observer/> -->
        </discovery>
    </cluster_name>
</remote_servers>
```

Если вы хотите задать номер шарда для конкретного узла, включите тег `<shard>` в раздел `<discovery>`:

для `node1` и `node2`:

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>1</shard>
</discovery>
```

для узлов `node3` и `node4`:

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <shard>2</shard>
</discovery>
```

### Режим наблюдателя {#observer-mode}

Узлы, настроенные в режиме наблюдателя, не будут регистрировать себя как реплики.
Они лишь будут наблюдать за другими активными репликами в кластере и обнаруживать их, не участвуя в работе.
Чтобы включить режим наблюдателя, добавьте тег `<observer/>` в секцию `<discovery>`:

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <observer/>
</discovery>
```

### Обнаружение кластеров {#discovery-of-clusters}

Иногда может понадобиться добавлять и удалять не только хосты в кластерах, но и сами кластеры. Для этого можно использовать узел `<multicluster_root_path>` с корневым путем, общим для нескольких кластеров:

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

В этом случае, когда какой-то другой хост зарегистрируется по пути `/clickhouse/discovery/some_new_cluster`, будет добавлен кластер с именем `some_new_cluster`.

Вы можете использовать обе возможности одновременно: хост может зарегистрироваться в кластере `my_cluster` и при этом обнаруживать любые другие кластеры:

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

* Нельзя одновременно использовать `<path>` и `<multicluster_root_path>` в одном поддереве `remote_servers`.
* `<multicluster_root_path>` может использоваться только совместно с `<observer/>`.
* Последняя часть пути из Keeper используется в качестве имени кластера, в то время как при регистрации имя берётся из XML-тега.

## Сценарии использования и ограничения {#use-cases-and-limitations}

При добавлении или удалении узлов по указанному пути в ZooKeeper они автоматически обнаруживаются или удаляются из кластера без необходимости изменять конфигурацию или перезапускать серверы.

Однако изменения затрагивают только конфигурацию кластера, а не данные и не существующие базы данных и таблицы.

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

Затем мы добавляем в кластер новый узел, запуская его с тем же элементом в разделе `remote_servers` в конфигурационном файле:

```response
┌─cluster─┬─shard_num─┬─shard_weight─┬─replica_num─┬─host_name────┬─host_address─┬─port─┬─is_local─┬─user─┬─is_active─┐
│ default │         1 │            1 │           1 │ 92d3c04025e8 │ 172.26.0.5   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           2 │ a6a68731c21b │ 172.26.0.4   │ 9000 │        1 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           3 │ 8e62b9cb17a1 │ 172.26.0.2   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
│ default │         1 │            1 │           4 │ b0df3669b81f │ 172.26.0.6   │ 9000 │        0 │      │      ᴺᵁᴸᴸ │
└─────────┴───────────┴──────────────┴─────────────┴──────────────┴──────────────┴──────┴──────────┴──────┴───────────┘
```

Четвёртый узел участвует в кластере, но таблица `event_table` по-прежнему присутствует только на первых трёх узлах:

```sql
SELECT hostname(), database, table FROM clusterAllReplicas(default, system.tables) WHERE table = 'event_table' FORMAT PrettyCompactMonoBlock
```

┌─hostname()───┬─database─┬─table───────┐
│ a6a68731c21b │ default  │ event&#95;table │
│ 92d3c04025e8 │ default  │ event&#95;table │
│ 8e62b9cb17a1 │ default  │ event&#95;table │
└──────────────┴──────────┴─────────────┘

```

Если требуется реплицировать таблицы на всех узлах, можно использовать движок базы данных [Replicated](../engines/database-engines/replicated.md) вместо механизма обнаружения кластера.
```
