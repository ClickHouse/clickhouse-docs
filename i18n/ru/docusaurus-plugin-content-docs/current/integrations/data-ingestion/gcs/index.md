---
sidebar_label: 'Google Cloud Storage (GCS)'
sidebar_position: 4
slug: /integrations/gcs
description: 'MergeTree на базе хранилища Google Cloud Storage (GCS)'
title: 'Интеграция Google Cloud Storage с ClickHouse'
doc_type: 'guide'
keywords: ['Google Cloud Storage ClickHouse', 'интеграция GCS с ClickHouse', 'MergeTree на базе GCS', 'хранение данных ClickHouse в GCS', 'Google Cloud ClickHouse']
---

import BucketDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_GCS_authentication_and_bucket.md';
import Image from '@theme/IdealImage';
import GCS_examine_bucket_1 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-1.png';
import GCS_examine_bucket_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-2.png';

# Интеграция Google Cloud Storage с ClickHouse {#integrate-google-cloud-storage-with-clickhouse}

:::note
Если вы используете ClickHouse Cloud в [Google Cloud](https://cloud.google.com), эта страница к вам не относится, так как ваши сервисы уже используют [Google Cloud Storage](https://cloud.google.com/storage). Если вы хотите выполнять `SELECT` или `INSERT` данных из GCS, обратитесь к табличной функции [`gcs`](/sql-reference/table-functions/gcs).
:::

В ClickHouse GCS рассматривается как привлекательное решение для хранения данных для пользователей, стремящихся разделить хранение и вычисления. Для этого реализована поддержка использования GCS в качестве хранилища для движка MergeTree. Это позволит пользователям использовать масштабируемость и экономические преимущества GCS, а также производительность вставки и выполнения запросов движка MergeTree.

## MergeTree с хранилищем в GCS {#gcs-backed-mergetree}

### Создание диска {#creating-a-disk}

Чтобы использовать bucket GCS как диск, сначала необходимо объявить его в конфигурации ClickHouse в файле в каталоге `conf.d`. Ниже приведён пример объявления диска GCS. Эта конфигурация включает несколько секций для настройки GCS‑«диска», кэша и политики, которая указывается в DDL‑запросах при создании таблиц на диске GCS. Каждая из них описана ниже.

#### Storage configuration &gt; disks &gt; gcs {#storage_configuration--disks--gcs}

Эта часть конфигурации показана на выделенном фрагменте и задаёт следующее:

* Пакетные удаления не выполняются. GCS в настоящее время не поддерживает пакетные удаления, поэтому автоопределение отключено, чтобы подавить сообщения об ошибках.
* Тип диска — `s3`, поскольку используется API S3.
* Endpoint, предоставленный GCS
* HMAC‑ключ и секрет сервисного аккаунта
* Путь к метаданным на локальном диске

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
            <!--highlight-start-->
                <support_batch_delete>false</support_batch_delete>
                <type>s3</type>
                <endpoint>https://storage.googleapis.com/BUCKET NAME/FOLDER NAME/</endpoint>
                <access_key_id>SERVICE ACCOUNT HMAC KEY</access_key_id>
                <secret_access_key>SERVICE ACCOUNT HMAC SECRET</secret_access_key>
                <metadata_path>/var/lib/clickhouse/disks/gcs/</metadata_path>
            <!--highlight-end-->
            </gcs>
        </disks>
        <policies>
            <gcs_main>
                <volumes>
                    <main>
                        <disk>gcs</disk>
                    </main>
                </volumes>
            </gcs_main>
        </policies>
    </storage_configuration>
</clickhouse>
```

#### Конфигурация хранилища &gt; disks &gt; cache {#storage_configuration--disks--cache}

Пример конфигурации, показанный ниже, включает кэш в памяти объёмом 10Gi для диска `gcs`.

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
                <support_batch_delete>false</support_batch_delete>
                <type>s3</type>
                <endpoint>https://storage.googleapis.com/BUCKET NAME/FOLDER NAME/</endpoint>
                <access_key_id>SERVICE ACCOUNT HMAC KEY</access_key_id>
                <secret_access_key>SERVICE ACCOUNT HMAC SECRET</secret_access_key>
                <metadata_path>/var/lib/clickhouse/disks/gcs/</metadata_path>
            </gcs>
            <!--highlight-start-->
            <gcs_cache>
                <type>cache</type>
                <disk>gcs</disk>
                <path>/var/lib/clickhouse/disks/gcs_cache/</path>
                <max_size>10Gi</max_size>
            </gcs_cache>
            <!--highlight-end-->
        </disks>
        <policies>
            <gcs_main>
                <volumes>
                    <main>
                        <disk>gcs_cache</disk>
                    </main>
                </volumes>
            </gcs_main>
        </policies>
    </storage_configuration>
</clickhouse>
```

#### Конфигурация хранилища &gt; policies &gt; gcs&#95;main {#storage_configuration--policies--gcs_main}

Политики хранения в конфигурации позволяют выбирать, где размещаются данные. Политика, показанная ниже, позволяет хранить данные на диске `gcs`, указывая политику `gcs_main`. Например, `CREATE TABLE ... SETTINGS storage_policy='gcs_main'`.

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
                <support_batch_delete>false</support_batch_delete>
                <type>s3</type>
                <endpoint>https://storage.googleapis.com/BUCKET NAME/FOLDER NAME/</endpoint>
                <access_key_id>SERVICE ACCOUNT HMAC KEY</access_key_id>
                <secret_access_key>SERVICE ACCOUNT HMAC SECRET</secret_access_key>
                <metadata_path>/var/lib/clickhouse/disks/gcs/</metadata_path>
            </gcs>
        </disks>
        <policies>
            <!--highlight-start-->
            <gcs_main>
                <volumes>
                    <main>
                        <disk>gcs</disk>
                    </main>
                </volumes>
            </gcs_main>
            <!--highlight-end-->
        </policies>
    </storage_configuration>
</clickhouse>
```

Полный список настроек, относящихся к этому описанию диска, можно найти [здесь](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3).

### Создание таблицы {#creating-a-table}

Если вы настроили диск на использование бакета с правом записи, вы сможете создать таблицу, как в примере ниже. Ради краткости мы используем подмножество столбцов набора данных NYC taxi и отправляем данные напрямую в таблицу на базе GCS:

```sql
CREATE TABLE trips_gcs
(
   `trip_id` UInt32,
   `pickup_date` Date,
   `pickup_datetime` DateTime,
   `dropoff_datetime` DateTime,
   `pickup_longitude` Float64,
   `pickup_latitude` Float64,
   `dropoff_longitude` Float64,
   `dropoff_latitude` Float64,
   `passenger_count` UInt8,
   `trip_distance` Float64,
   `tip_amount` Float32,
   `total_amount` Float32,
   `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime
-- highlight-next-line
SETTINGS storage_policy='gcs_main'
```

```sql
INSERT INTO trips_gcs SELECT trip_id, pickup_date, pickup_datetime, dropoff_datetime, pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, passenger_count, trip_distance, tip_amount, total_amount, payment_type FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
```

В зависимости от характеристик оборудования выполнение этой последней вставки 1 млн строк может занять несколько минут. Вы можете отслеживать ход выполнения через таблицу system.processes. При желании увеличьте количество строк до предела в 10 млн и выполните несколько пробных запросов.

```sql
SELECT passenger_count, avg(tip_amount) AS avg_tip, avg(total_amount) AS avg_amount FROM trips_gcs GROUP BY passenger_count;
```

### Работа с репликацией {#handling-replication}

Репликация с использованием дисков GCS может быть реализована с помощью движка таблиц `ReplicatedMergeTree`. Подробности см. в руководстве [репликация одного шарда в двух регионах GCP с использованием GCS](#gcs-multi-region).

### Дополнительные материалы {#learn-more}

[Cloud Storage XML API](https://cloud.google.com/storage/docs/xml-api/overview) совместим с некоторыми инструментами и библиотеками, которые работают с такими сервисами, как Amazon Simple Storage Service (Amazon S3).

Дополнительные сведения о настройке потоков см. в разделе [Оптимизация производительности](../s3/index.md#s3-optimizing-performance).

## Использование Google Cloud Storage (GCS) {#gcs-multi-region}

:::tip
В ClickHouse Cloud по умолчанию используется объектное хранилище, поэтому вам не нужно выполнять эту процедуру, если вы используете ClickHouse Cloud.
:::

### Планирование развертывания {#plan-the-deployment}

В этом руководстве описано реплицированное развертывание ClickHouse в Google Cloud с использованием Google Cloud Storage (GCS) в качестве типа диска для хранилища ClickHouse.

В этом руководстве вы развернете серверные узлы ClickHouse на виртуальных машинах Google Compute Engine, при этом у каждой ВМ будет свой бакет GCS для хранения данных. Репликация координируется набором узлов ClickHouse Keeper, также развернутых как виртуальные машины.

Пример требований для обеспечения высокой доступности:
- Два серверных узла ClickHouse в двух регионах GCP
- Два бакета GCS, развернутые в тех же регионах, что и два серверных узла ClickHouse
- Три узла ClickHouse Keeper, два из которых развернуты в тех же регионах, что и серверные узлы ClickHouse; третий может находиться в том же регионе, что и один из первых двух узлов Keeper, но в другой зоне доступности.

ClickHouse Keeper для работы требует двух узлов, поэтому для высокой доступности используются три узла.

### Подготовка виртуальных машин {#prepare-vms}

Разверните пять виртуальных машин (VMs) в трех регионах:

| Region | ClickHouse Server | Bucket            | ClickHouse Keeper |
|--------|-------------------|-------------------|-------------------|
| 1      | `chnode1`           | `bucket_regionname` | `keepernode1`       |
| 2      | `chnode2`           | `bucket_regionname` | `keepernode2`       |
| 3 `*`  |                   |                   | `keepernode3`       |

`*` Это может быть другая зона доступности в том же регионе, что и 1 или 2.

#### Развертывание ClickHouse {#deploy-clickhouse}

Разверните ClickHouse на двух хостах; в примерах конфигурации они называются `chnode1`, `chnode2`.

Разместите `chnode1` в одном регионе GCP, а `chnode2` — во втором. В этом руководстве для виртуальных машин Compute Engine, а также для бакетов GCS используются регионы `us-east1` и `us-east4`.

:::note
Не запускайте `clickhouse server`, пока он не будет настроен. Просто установите его.
:::

См. [инструкции по установке](/getting-started/install/install.mdx) при выполнении шагов развертывания на серверных узлах ClickHouse.

#### Развертывание ClickHouse Keeper {#deploy-clickhouse-keeper}

Разверните ClickHouse Keeper на трех хостах; в примерах конфигурации они называются `keepernode1`, `keepernode2` и `keepernode3`. `keepernode1` можно развернуть в том же регионе, что и `chnode1`, `keepernode2` — в том же регионе, что и `chnode2`, а `keepernode3` — в любом из этих регионов, но в другой зоне доступности по сравнению с узлом ClickHouse в этом регионе.

См. [инструкции по установке](/getting-started/install/install.mdx) при выполнении шагов развертывания на узлах ClickHouse Keeper.

### Создание двух бакетов {#create-two-buckets}

Два сервера ClickHouse будут находиться в разных регионах для обеспечения высокой доступности. У каждого будет бакет GCS в том же регионе.

В **Cloud Storage > Buckets** выберите **CREATE BUCKET**. Для этого руководства создаются два бакета, по одному в `us-east1` и `us-east4`. Бакеты имеют тип single region, класс хранения Standard и не являются публичными. По запросу включите запрет публичного доступа (public access prevention). Не создавайте папки — они будут созданы, когда ClickHouse начнет записывать данные в хранилище.

Если вам нужны пошаговые инструкции по созданию бакетов и HMAC-ключа, разверните раздел **Create GCS buckets and an HMAC key** и следуйте указаниям:

<BucketDetails />

### Настройка ClickHouse Keeper {#configure-clickhouse-keeper}

Все узлы ClickHouse Keeper используют один и тот же файл конфигурации, за исключением строки `server_id` (первая выделенная строка ниже). Измените файл, указав имена хостов ваших серверов ClickHouse Keeper, и на каждом сервере задайте `server_id` в соответствии с соответствующей записью `server` в `raft_configuration`. Поскольку в этом примере `server_id` установлен в `3`, мы выделили соответствующие строки в `raft_configuration`.

- Отредактируйте файл, указав свои имена хостов, и убедитесь, что они разрешаются по именам как с серверных узлов ClickHouse, так и с узлов Keeper
- Скопируйте файл на место (`/etc/clickhouse-keeper/keeper_config.xml` на каждый из серверов Keeper)
- Отредактируйте `server_id` на каждой машине в соответствии с ее номером записи в `raft_configuration`

```xml title=/etc/clickhouse-keeper/keeper_config.xml
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
<!--highlight-next-line-->
        <server_id>3</server_id>
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
                <hostname>keepernode1.us-east1-b.c.clickhousegcs-374921.internal</hostname>
                <port>9234</port>
            </server>
            <server>
                <id>2</id>
                <hostname>keepernode2.us-east4-c.c.clickhousegcs-374921.internal</hostname>
                <port>9234</port>
            </server>
<!--highlight-start-->
            <server>
                <id>3</id>
                <hostname>keepernode3.us-east5-a.c.clickhousegcs-374921.internal</hostname>
                <port>9234</port>
            </server>
<!--highlight-end-->
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

### Configure ClickHouse server {#configure-clickhouse-server}

:::note best practice
Some of the steps in this guide will ask you to place a configuration file in `/etc/clickhouse-server/config.d/`.  This is the default location on Linux systems for configuration override files.  When you put these files into that directory ClickHouse will merge the content with the default configuration.  By placing these files in the `config.d` directory you will avoid losing your configuration during an upgrade.
:::

#### Networking {#networking}
By default, ClickHouse listens on the loopback interface, in a replicated setup networking between machines is necessary.  Listen on all interfaces:

```xml title=/etc/clickhouse-server/config.d/network.xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

#### Remote ClickHouse Keeper servers {#remote-clickhouse-keeper-servers}

Replication is coordinated by ClickHouse Keeper.  This configuration file identifies the ClickHouse Keeper nodes by hostname and port number.

- Edit the hostnames to match your Keeper hosts

```xml title=/etc/clickhouse-server/config.d/use-keeper.xml
<clickhouse>
    <zookeeper>
        <node index="1">
            <host>keepernode1.us-east1-b.c.clickhousegcs-374921.internal</host>
            <port>9181</port>
        </node>
        <node index="2">
            <host>keepernode2.us-east4-c.c.clickhousegcs-374921.internal</host>
            <port>9181</port>
        </node>
        <node index="3">
            <host>keepernode3.us-east5-a.c.clickhousegcs-374921.internal</host>
            <port>9181</port>
        </node>
    </zookeeper>
</clickhouse>
```

#### Remote ClickHouse servers {#remote-clickhouse-servers}

This file configures the hostname and port of each ClickHouse server in the cluster.  The default configuration file contains sample cluster definitions, in order to show only the clusters that are completely configured the tag `replace="true"` is added to the `remote_servers` entry so that when this configuration is merged with the default it replaces the `remote_servers` section instead of adding to it.

- Edit the file with your hostnames, and make sure that they resolve from the ClickHouse server nodes

```xml title=/etc/clickhouse-server/config.d/remote-servers.xml
<clickhouse>
    <remote_servers replace="true">
        <cluster_1S_2R>
            <shard>
                <replica>
                    <host>chnode1.us-east1-b.c.clickhousegcs-374921.internal</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>chnode2.us-east4-c.c.clickhousegcs-374921.internal</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
</clickhouse>
```

#### Replica identification {#replica-identification}

This file configures settings related to the ClickHouse Keeper path.  Specifically the macros used to identify which replica the data is part of.  On one server the replica should be specified as `replica_1`, and on the other server `replica_2`.  The names can be changed, based on our example of one replica being stored in South Carolina and the other in Northern Virginia the values could be `carolina` and `virginia`; just make sure that they are different on each machine.

```xml title=/etc/clickhouse-server/config.d/macros.xml
<clickhouse>
    <distributed_ddl>
            <path>/clickhouse/task_queue/ddl</path>
    </distributed_ddl>
    <macros>
        <cluster>cluster_1S_2R</cluster>
        <shard>1</shard>
<!--highlight-next-line-->
        <replica>replica_1</replica>
    </macros>
</clickhouse>
```

#### Storage in GCS {#storage-in-gcs}

ClickHouse storage configuration includes `disks` and `policies`. The disk being configured below is named `gcs`, and is of `type` `s3`.  The type is s3 because ClickHouse accesses the GCS bucket as if it was an AWS S3 bucket.  Two copies of this configuration will be needed, one for each of the ClickHouse server nodes.

These substitutions should be made in the configuration below.

These substitutions differ between the two ClickHouse server nodes:
- `REPLICA 1 BUCKET` should be set to the name of the bucket in the same region as the server
- `REPLICA 1 FOLDER` should be changed to `replica_1` on one of the servers, and `replica_2` on the other

These substitutions are common across the two nodes:
- The `access_key_id` should be set to the HMAC Key generated earlier
- The `secret_access_key` should be set to HMAC Secret generated earlier

```xml title=/etc/clickhouse-server/config.d/storage.xml
<clickhouse>
    <storage_configuration>
        <disks>
            <gcs>
                <support_batch_delete>false</support_batch_delete>
                <type>s3</type>
                <endpoint>https://storage.googleapis.com/REPLICA 1 BUCKET/REPLICA 1 FOLDER/</endpoint>
                <access_key_id>SERVICE ACCOUNT HMAC KEY</access_key_id>
                <secret_access_key>SERVICE ACCOUNT HMAC SECRET</secret_access_key>
                <metadata_path>/var/lib/clickhouse/disks/gcs/</metadata_path>
            </gcs>
            <cache>
                <type>cache</type>
                <disk>gcs</disk>
                <path>/var/lib/clickhouse/disks/gcs_cache/</path>
                <max_size>10Gi</max_size>
            </cache>
        </disks>
        <policies>
            <gcs_main>
                <volumes>
                    <main>
                        <disk>gcs</disk>
                    </main>
                </volumes>
            </gcs_main>
        </policies>
    </storage_configuration>
</clickhouse>
```

### Start ClickHouse Keeper {#start-clickhouse-keeper}

Use the commands for your operating system, for example:

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### Check ClickHouse Keeper status {#check-clickhouse-keeper-status}

Send commands to the ClickHouse Keeper with `netcat`.  For example, `mntr` returns the state of the ClickHouse Keeper cluster.  If you run the command on each of the Keeper nodes you will see that one is a leader, and the other two are followers:

```bash
echo mntr | nc localhost 9181
```
```response
zk_version      v22.7.2.15-stable-f843089624e8dd3ff7927b8a125cf3a7a769c069
zk_avg_latency  0
zk_max_latency  11
zk_min_latency  0
zk_packets_received     1783
zk_packets_sent 1783
# highlight-start {#highlight-start}
zk_num_alive_connections        2
zk_outstanding_requests 0
zk_server_state leader
# highlight-end {#highlight-end}
zk_znode_count  135
zk_watch_count  8
zk_ephemerals_count     3
zk_approximate_data_size        42533
zk_key_arena_size       28672
zk_latest_snapshot_size 0
zk_open_file_descriptor_count   182
zk_max_file_descriptor_count    18446744073709551615
# highlight-start {#highlight-start}
zk_followers    2
zk_synced_followers     2
# highlight-end {#highlight-end}
```

### Start ClickHouse server {#start-clickhouse-server}

On `chnode1` and `chnode` run:

```bash
sudo service clickhouse-server start
```
```bash
sudo service clickhouse-server status
```

### Verification {#verification}

#### Verify disk configuration {#verify-disk-configuration}

`system.disks` should contain records for each disk:
- default
- gcs
- cache

```sql
SELECT *
FROM system.disks
FORMAT Vertical
```
```response
Строка 1:
──────
name:             cache
path:             /var/lib/clickhouse/disks/gcs/
free_space:       18446744073709551615
total_space:      18446744073709551615
unreserved_space: 18446744073709551615
keep_free_space:  0
type:             s3
is_encrypted:     0
is_read_only:     0
is_write_once:    0
is_remote:        1
is_broken:        0
cache_path:       /var/lib/clickhouse/disks/gcs_cache/

Строка 2:
──────
name:             default
path:             /var/lib/clickhouse/
free_space:       6555529216
total_space:      10331889664
unreserved_space: 6555529216
keep_free_space:  0
type:             local
is_encrypted:     0
is_read_only:     0
is_write_once:    0
is_remote:        0
is_broken:        0
cache_path:

Строка 3:
──────
name:             gcs
path:             /var/lib/clickhouse/disks/gcs/
free_space:       18446744073709551615
total_space:      18446744073709551615
unreserved_space: 18446744073709551615
keep_free_space:  0
type:             s3
is_encrypted:     0
is_read_only:     0
is_write_once:    0
is_remote:        1
is_broken:        0
cache_path:
```
#### Verify that tables created on the cluster are created on both nodes {#verify-that-tables-created-on-the-cluster-are-created-on-both-nodes}
````
#### Убедитесь, что таблицы, созданные на кластере, создаются на обоих узлах                                                                        {#verify-that-tables-created-on-the-cluster-are-created-on-both-nodes}
```
````

```

#### Verify that data can be inserted {#verify-that-data-can-be-inserted}

```

#### Убедитесь, что данные можно вставить {#verify-that-data-can-be-inserted}

```

#### Verify that the storage policy `gcs_main` is used for the table. {#verify-that-the-storage-policy-gcs_main-is-used-for-the-table}
```

#### Убедитесь, что для таблицы используется политика хранения данных `gcs_main`. {#verify-that-the-storage-policy-gcs_main-is-used-for-the-table}

```
```

```response
Строка 1:
──────
engine:                          ReplicatedMergeTree
data_paths:                      ['/var/lib/clickhouse/disks/gcs/store/631/6315b109-d639-4214-a1e7-afbd98f39727/']
metadata_path:                   /var/lib/clickhouse/store/e0f/e0f3e248-7996-44d4-853e-0384e153b740/trips.sql
storage_policy:                  gcs_main
formatReadableSize(total_bytes): 36.42 MiB

Получена 1 строка. Прошло: 0.002 сек.
```

#### Проверьте в консоли Google Cloud {#verify-in-google-cloud-console}

Если открыть бакеты, вы увидите, что в каждом из них создана папка с именем, указанным в конфигурационном файле `storage.xml`. Разверните папки, и вы увидите множество файлов, соответствующих разделам данных.

#### Бакет для первой реплики {#bucket-for-replica-one}

<Image img={GCS_examine_bucket_1} size="lg" border alt="Бакет первой реплики в Google Cloud Storage с отображением структуры папок с разделами данных" />

#### Бакет для второй реплики {#bucket-for-replica-two}

<Image img={GCS_examine_bucket_2} size="lg" border alt="Бакет второй реплики в Google Cloud Storage с отображением структуры папок с разделами данных" />
