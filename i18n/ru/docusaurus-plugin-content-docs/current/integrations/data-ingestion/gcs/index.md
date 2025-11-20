---
sidebar_label: 'Google Cloud Storage (GCS)'
sidebar_position: 4
slug: /integrations/gcs
description: 'Хранилище Google Cloud Storage (GCS) как основа для MergeTree'
title: 'Интеграция Google Cloud Storage с ClickHouse'
doc_type: 'guide'
keywords: ['Google Cloud Storage ClickHouse', 'GCS ClickHouse integration', 'GCS backed MergeTree', 'ClickHouse GCS storage', 'Google Cloud ClickHouse']
---

import BucketDetails from '@site/docs/_snippets/_GCS_authentication_and_bucket.md';
import Image from '@theme/IdealImage';
import GCS_examine_bucket_1 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-1.png';
import GCS_examine_bucket_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-2.png';


# Интеграция Google Cloud Storage с ClickHouse

:::note
Если вы используете ClickHouse Cloud в [Google Cloud](https://cloud.google.com), эта страница к вам не относится, так как ваши сервисы уже используют [Google Cloud Storage](https://cloud.google.com/storage). Если вы хотите выполнять `SELECT` или `INSERT` данных из GCS, ознакомьтесь с [табличной функцией `gcs`](/sql-reference/table-functions/gcs).
:::

ClickHouse рассматривает GCS как привлекательное решение для пользователей, которые хотят разделить хранение и вычисления. Для этого предусмотрена поддержка использования GCS в качестве хранилища для движка MergeTree. Это позволит пользователям воспользоваться масштабируемостью и экономичностью GCS, а также скоростью вставки и выполнения запросов движка MergeTree.



## MergeTree с хранилищем GCS {#gcs-backed-mergetree}

### Создание диска {#creating-a-disk}

Чтобы использовать бакет GCS в качестве диска, его необходимо сначала объявить в конфигурации ClickHouse в файле в каталоге `conf.d`. Ниже приведен пример объявления диска GCS. Эта конфигурация включает несколько разделов для настройки «диска» GCS, кеша и политики, которая указывается в DDL-запросах при создании таблиц на диске GCS. Каждый из этих разделов описан ниже.

#### Конфигурация хранилища > disks > gcs {#storage_configuration--disks--gcs}

Эта часть конфигурации показана в выделенном разделе и указывает следующее:

- Пакетные удаления не выполняются. GCS в настоящее время не поддерживает пакетные удаления, поэтому автоопределение отключено для подавления сообщений об ошибках.
- Тип диска — `s3`, поскольку используется S3 API.
- Конечная точка, предоставленная GCS
- HMAC-ключ и секрет сервисного аккаунта
- Путь к метаданным на локальном диске

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

#### Конфигурация хранилища > disks > cache {#storage_configuration--disks--cache}

Приведенная ниже конфигурация включает кеш размером 10 ГиБ для диска `gcs`.

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

#### Конфигурация хранилища > policies > gcs_main {#storage_configuration--policies--gcs_main}

Политики конфигурации хранилища позволяют выбирать место хранения данных. Приведенная ниже политика позволяет хранить данные на диске `gcs` путем указания политики `gcs_main`. Например, `CREATE TABLE ... SETTINGS storage_policy='gcs_main'`.

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

Полный список настроек, относящихся к объявлению этого диска, можно найти [здесь](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3).


### Создание таблицы {#creating-a-table}

Предполагая, что вы настроили диск для использования бакета с правами на запись, вы сможете создать таблицу, как показано в примере ниже. Для краткости мы используем подмножество колонок NYC taxi и загружаем данные напрямую в таблицу с хранением в GCS:

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

В зависимости от оборудования, эта вставка 1 млн строк может занять несколько минут. Вы можете отслеживать прогресс через таблицу system.processes. При желании можете увеличить количество строк до предела в 10 млн и выполнить несколько примеров запросов.

```sql
SELECT passenger_count, avg(tip_amount) AS avg_tip, avg(total_amount) AS avg_amount FROM trips_gcs GROUP BY passenger_count;
```

### Настройка репликации {#handling-replication}

Репликация с дисками GCS может быть реализована с использованием движка таблиц `ReplicatedMergeTree`. Подробности см. в руководстве по [репликации одного шарда между двумя регионами GCP с использованием GCS](#gcs-multi-region).

### Дополнительная информация {#learn-more}

[Cloud Storage XML API](https://cloud.google.com/storage/docs/xml-api/overview) совместим с некоторыми инструментами и библиотеками, которые работают с такими сервисами, как Amazon Simple Storage Service (Amazon S3).

Дополнительную информацию о настройке потоков см. в разделе [Оптимизация производительности](../s3/index.md#s3-optimizing-performance).


## Использование Google Cloud Storage (GCS) {#gcs-multi-region}

:::tip
В ClickHouse Cloud объектное хранилище используется по умолчанию, поэтому при работе в ClickHouse Cloud выполнять эту процедуру не требуется.
:::

### Планирование развертывания {#plan-the-deployment}

Данное руководство описывает реплицированное развертывание ClickHouse в Google Cloud с использованием Google Cloud Storage (GCS) в качестве типа дискового хранилища ClickHouse.

В этом руководстве вы развернете узлы сервера ClickHouse на виртуальных машинах Google Compute Engine, каждая из которых будет иметь связанный бакет GCS для хранения данных. Репликация координируется набором узлов ClickHouse Keeper, также развернутых на виртуальных машинах.

Примерные требования для обеспечения высокой доступности:

- Два узла сервера ClickHouse в двух регионах GCP
- Два бакета GCS, развернутых в тех же регионах, что и узлы сервера ClickHouse
- Три узла ClickHouse Keeper, два из которых развернуты в тех же регионах, что и узлы сервера ClickHouse. Третий может находиться в том же регионе, что и один из первых двух узлов Keeper, но в другой зоне доступности.

Для работы ClickHouse Keeper требуется минимум два узла, поэтому для обеспечения высокой доступности необходимы три узла.

### Подготовка виртуальных машин {#prepare-vms}

Разверните пять виртуальных машин в трех регионах:

| Регион | ClickHouse Server | Бакет               | ClickHouse Keeper |
| ------ | ----------------- | ------------------- | ----------------- |
| 1      | `chnode1`         | `bucket_regionname` | `keepernode1`     |
| 2      | `chnode2`         | `bucket_regionname` | `keepernode2`     |
| 3 `*`  |                   |                     | `keepernode3`     |

`*` Может находиться в другой зоне доступности того же региона, что и регион 1 или 2.

#### Развертывание ClickHouse {#deploy-clickhouse}

Разверните ClickHouse на двух хостах. В примерах конфигураций они называются `chnode1` и `chnode2`.

Разместите `chnode1` в одном регионе GCP, а `chnode2` — во втором. В данном руководстве для виртуальных машин Compute Engine и бакетов GCS используются регионы `us-east1` и `us-east4`.

:::note
Не запускайте `clickhouse server` до завершения его настройки. Просто выполните установку.
:::

При выполнении шагов развертывания на узлах сервера ClickHouse обращайтесь к [инструкциям по установке](/getting-started/install/install.mdx).

#### Развертывание ClickHouse Keeper {#deploy-clickhouse-keeper}

Разверните ClickHouse Keeper на трех хостах. В примерах конфигураций они называются `keepernode1`, `keepernode2` и `keepernode3`. `keepernode1` можно развернуть в том же регионе, что и `chnode1`, `keepernode2` — вместе с `chnode2`, а `keepernode3` — в любом из регионов, но в другой зоне доступности относительно узла ClickHouse в этом регионе.

При выполнении шагов развертывания на узлах ClickHouse Keeper обращайтесь к [инструкциям по установке](/getting-started/install/install.mdx).

### Создание двух бакетов {#create-two-buckets}

Два сервера ClickHouse будут расположены в разных регионах для обеспечения высокой доступности. Каждый из них будет иметь бакет GCS в том же регионе.

В разделе **Cloud Storage > Buckets** выберите **CREATE BUCKET**. Для данного руководства создаются два бакета — по одному в каждом из регионов `us-east1` и `us-east4`. Бакеты являются однорегиональными, класса хранения standard и не публичными. При появлении запроса включите предотвращение публичного доступа. Не создавайте папки — они будут созданы автоматически, когда ClickHouse начнет записывать данные в хранилище.

Если вам нужны пошаговые инструкции по созданию бакетов и ключа HMAC, разверните раздел **Create GCS buckets and an HMAC key** и следуйте указаниям:

<BucketDetails />

### Настройка ClickHouse Keeper {#configure-clickhouse-keeper}

Все узлы ClickHouse Keeper имеют одинаковый файл конфигурации, за исключением строки `server_id` (первая выделенная строка ниже). Измените файл, указав имена хостов для ваших серверов ClickHouse Keeper, и на каждом из серверов установите `server_id` в соответствии с соответствующей записью `server` в `raft_configuration`. Поскольку в данном примере `server_id` установлен в `3`, мы выделили соответствующие строки в `raft_configuration`.

- Отредактируйте файл, указав ваши имена хостов, и убедитесь, что они разрешаются с узлов сервера ClickHouse и узлов Keeper
- Скопируйте файл в нужное расположение (`/etc/clickhouse-keeper/keeper_config.xml`) на каждом из серверов Keeper
- Отредактируйте `server_id` на каждой машине в соответствии с номером её записи в `raft_configuration`


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

### Настройка сервера ClickHouse {#configure-clickhouse-server}

:::note best practice
Некоторые шаги в этом руководстве требуют размещения конфигурационного файла в `/etc/clickhouse-server/config.d/`. Это стандартное расположение файлов переопределения конфигурации в системах Linux. Когда вы помещаете файлы в этот каталог, ClickHouse объединяет их содержимое с конфигурацией по умолчанию. Размещая файлы в каталоге `config.d`, вы предотвратите потерю конфигурации при обновлении.
:::

#### Сетевые настройки {#networking}

По умолчанию ClickHouse прослушивает loopback-интерфейс. В реплицируемой конфигурации необходима сетевая связь между машинами. Настройте прослушивание на всех интерфейсах:

```xml title=/etc/clickhouse-server/config.d/network.xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

#### Удалённые серверы ClickHouse Keeper {#remote-clickhouse-keeper-servers}

Репликация координируется ClickHouse Keeper. Этот конфигурационный файл идентифицирует узлы ClickHouse Keeper по имени хоста и номеру порта.

- Отредактируйте имена хостов в соответствии с вашими хостами Keeper

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

#### Удалённые серверы ClickHouse {#remote-clickhouse-servers}

Этот файл настраивает имя хоста и порт каждого сервера ClickHouse в кластере. Конфигурационный файл по умолчанию содержит примеры определений кластеров. Чтобы отображались только полностью настроенные кластеры, к записи `remote_servers` добавляется атрибут `replace="true"`, чтобы при объединении этой конфигурации с конфигурацией по умолчанию происходила замена секции `remote_servers`, а не добавление к ней.

- Отредактируйте файл, указав ваши имена хостов, и убедитесь, что они разрешаются с узлов сервера ClickHouse


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

#### Идентификация реплик {#replica-identification}

Этот файл настраивает параметры, связанные с путем ClickHouse Keeper. В частности, макросы, используемые для определения того, к какой реплике относятся данные. На одном сервере реплика должна быть указана как `replica_1`, а на другом — как `replica_2`. Имена можно изменить; например, в нашем примере одна реплика хранится в Южной Каролине, а другая — в Северной Виргинии, поэтому значения могут быть `carolina` и `virginia`; главное, чтобы они отличались на каждой машине.

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

#### Хранение в GCS {#storage-in-gcs}

Конфигурация хранилища ClickHouse включает `disks` и `policies`. Настраиваемый ниже диск называется `gcs` и имеет `type` `s3`. Тип s3 используется потому, что ClickHouse обращается к бакету GCS так же, как к бакету AWS S3. Потребуется две копии этой конфигурации — по одной для каждого узла сервера ClickHouse.

В приведенной ниже конфигурации необходимо выполнить следующие подстановки.

Эти подстановки различаются для двух узлов сервера ClickHouse:

- `REPLICA 1 BUCKET` должен быть установлен в имя бакета в том же регионе, что и сервер
- `REPLICA 1 FOLDER` должен быть изменен на `replica_1` на одном из серверов и на `replica_2` на другом

Эти подстановки общие для обоих узлов:

- `access_key_id` должен быть установлен в значение HMAC Key, сгенерированного ранее
- `secret_access_key` должен быть установлен в значение HMAC Secret, сгенерированного ранее

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

### Запуск ClickHouse Keeper {#start-clickhouse-keeper}

Используйте команды для вашей операционной системы, например:

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### Проверка статуса ClickHouse Keeper {#check-clickhouse-keeper-status}

Отправляйте команды в ClickHouse Keeper с помощью `netcat`. Например, `mntr` возвращает состояние кластера ClickHouse Keeper. Если выполнить команду на каждом из узлов Keeper, вы увидите, что один является лидером, а два других — ведомыми:


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
# highlight-start
zk_num_alive_connections        2
zk_outstanding_requests 0
zk_server_state leader
# highlight-end
zk_znode_count  135
zk_watch_count  8
zk_ephemerals_count     3
zk_approximate_data_size        42533
zk_key_arena_size       28672
zk_latest_snapshot_size 0
zk_open_file_descriptor_count   182
zk_max_file_descriptor_count    18446744073709551615
# highlight-start
zk_followers    2
zk_synced_followers     2
# highlight-end
```

### Запуск сервера ClickHouse {#start-clickhouse-server}

На узлах `chnode1` и `chnode` выполните:

```bash
sudo service clickhouse-server start
```

```bash
sudo service clickhouse-server status
```

### Проверка {#verification}

#### Проверка конфигурации дисков {#verify-disk-configuration}

Таблица `system.disks` должна содержать записи для каждого диска:

- default
- gcs
- cache

```sql
SELECT *
FROM system.disks
FORMAT Vertical
```

```response
Row 1:
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

Row 2:
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

Row 3:
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


3 rows in set. Elapsed: 0.002 sec.

````
#### Проверка создания таблиц на кластере на обоих узлах {#verify-that-tables-created-on-the-cluster-are-created-on-both-nodes}
```sql
-- highlight-next-line
create table trips on cluster 'cluster_1S_2R' (
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
 `payment_type` Enum8('UNK' = 0, 'CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4))
ENGINE = ReplicatedMergeTree
PARTITION BY toYYYYMM(pickup_date)
ORDER BY pickup_datetime
-- highlight-next-line
SETTINGS storage_policy='gcs_main'
````

```response
┌─host───────────────────────────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.us-east4-c.c.gcsqa-375100.internal │ 9000 │      0 │       │                   1 │                1 │
└────────────────────────────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
┌─host───────────────────────────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1.us-east1-b.c.gcsqa-375100.internal │ 9000 │      0 │       │                   0 │                0 │
└────────────────────────────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

2 rows in set. Elapsed: 0.641 sec.
```

#### Проверка возможности вставки данных {#verify-that-data-can-be-inserted}

```sql
INSERT INTO trips SELECT
    trip_id,
    pickup_date,
    pickup_datetime,
    dropoff_datetime,
    pickup_longitude,
    pickup_latitude,
    dropoff_longitude,
    dropoff_latitude,
    passenger_count,
    trip_distance,
    tip_amount,
    total_amount,
    payment_type
FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames')
LIMIT 1000000
```

#### Проверка использования политики хранения `gcs_main` для таблицы {#verify-that-the-storage-policy-gcs_main-is-used-for-the-table}

```sql
SELECT
    engine,
    data_paths,
    metadata_path,
    storage_policy,
    formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'trips'
FORMAT Vertical
```

```response
Row 1:
──────
engine:                          ReplicatedMergeTree
data_paths:                      ['/var/lib/clickhouse/disks/gcs/store/631/6315b109-d639-4214-a1e7-afbd98f39727/']
metadata_path:                   /var/lib/clickhouse/store/e0f/e0f3e248-7996-44d4-853e-0384e153b740/trips.sql
storage_policy:                  gcs_main
formatReadableSize(total_bytes): 36.42 MiB

1 row in set. Elapsed: 0.002 sec.
```

#### Проверка в консоли Google Cloud {#verify-in-google-cloud-console}

При просмотре бакетов вы увидите, что в каждом бакете была создана папка с именем, указанным в конфигурационном файле `storage.xml`. Разверните папки — вы увидите множество файлов, представляющих партиции данных.

#### Бакет для первой реплики {#bucket-for-replica-one}

<Image
  img={GCS_examine_bucket_1}
  size='lg'
  border
  alt='Бакет первой реплики в Google Cloud Storage со структурой папок и партициями данных'
/>

#### Бакет для второй реплики {#bucket-for-replica-two}

<Image
  img={GCS_examine_bucket_2}
  size='lg'
  border
  alt='Бакет второй реплики в Google Cloud Storage со структурой папок и партициями данных'
/>
