---
description: 'Документация по обнаружению кластера в ClickHouse'
sidebar_label: 'Обнаружение кластера'
slug: /operations/cluster-discovery
title: 'Обнаружение кластера'
---


# Обнаружение кластера

## Обзор {#overview}

Функция обнаружения кластера ClickHouse упрощает конфигурацию кластера, позволяя узлам автоматически обнаруживать и регистрировать себя без необходимости явного определения в файлах конфигурации. Это особенно полезно в случаях, когда ручное определение каждого узла становится трудоемким.

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

Традиционно в ClickHouse каждый шард и реплика в кластере должны были быть вручную указаны в конфигурации:

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

С обнаружением кластера, вместо явного определения каждого узла, вы просто указываете путь в ZooKeeper. Все узлы, которые регистрируются под этим путем в ZooKeeper, будут автоматически обнаружены и добавлены в кластер.

```xml
<remote_servers>
    <cluster_name>
        <discovery>
            <path>/clickhouse/discovery/cluster_name</path>

            <!-- # Опциональные параметры конфигурации: -->

            <!-- ## Учетные данные для аутентификации к доступу ко всем другим узлам в кластере: -->
            <!-- <user>user1</user> -->
            <!-- <password>pass123</password> -->
            <!-- ### В качестве альтернативы паролю, может быть использован секрет для межсерверного доступа: -->
            <!-- <secret>secret123</secret> -->

            <!-- ## Шард для текущего узла (см. ниже): -->
            <!-- <shard>1</shard> -->

            <!-- ## Режим наблюдения (см. ниже): -->
            <!-- <observer/> -->
        </discovery>
    </cluster_name>
</remote_servers>
```

Если вы хотите указать номер шарда для конкретного узла, вы можете включить тег `<shard>` в разделе `<discovery>`:

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

### Режим наблюдения {#observer-mode}

Узлы, настроенные в режиме наблюдения, не будут регистрироваться как реплики. Они будут только наблюдать и обнаруживать другие активные реплики в кластере, не участвуя активно. Чтобы включить режим наблюдения, добавьте тег `<observer/>` в раздел `<discovery>`:

```xml
<discovery>
    <path>/clickhouse/discovery/cluster_name</path>
    <observer/>
</discovery>
```

### Обнаружение кластеров {#discovery-of-clusters}

Иногда вам может потребоваться добавлять и удалять не только хосты в кластерах, но и сами кластеры. Вы можете использовать узел `<multicluster_root_path>` с корневым путем для нескольких кластеров:

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

В этом случае, когда какой-либо другой хост регистрирует себя с путем `/clickhouse/discovery/some_new_cluster`, кластер с именем `some_new_cluster` будет добавлен.

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
- Вы не можете использовать как `<path>`, так и `<multicluster_root_path>` в одном поддереве `remote_servers`.
- `<multicluster_root_path>` может использоваться только с `<observer/>`.
- Последняя часть пути из Keeper используется как имя кластера, в то время как во время регистрации имя берется из XML-тега.

## Применение и ограничения {#use-cases-and-limitations}

Поскольку узлы добавляются или удаляются из указанного пути ZooKeeper, они автоматически обнаруживаются или удаляются из кластера без необходимости в изменениях конфигурации или перезапусках сервера.

Однако изменения касаются только конфигурации кластера, а не данных или существующих баз данных и таблиц.

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

Затем мы добавляем новый узел в кластер, начиная новый узел с такой же записью в разделе `remote_servers` в файле конфигурации:

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

Если вам нужно, чтобы таблицы были реплицированы на всех узлах, можете использовать [Replicated](../engines/database-engines/replicated.md) движок базы данных в альтернативу обнаружению кластера.
