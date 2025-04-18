---
sidebar_label: 'Google Cloud Storage (GCS)'
sidebar_position: 4
slug: /integrations/gcs
description: 'Google Cloud Storage (GCS) Backed MergeTree'
title: 'Интеграция Google Cloud Storage с ClickHouse'
---

import BucketDetails from '@site/docs/_snippets/_GCS_authentication_and_bucket.md';
import Image from '@theme/IdealImage';
import GCS_examine_bucket_1 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-1.png';
import GCS_examine_bucket_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-2.png';


# Интеграция Google Cloud Storage с ClickHouse

:::note
Если вы используете ClickHouse Cloud на [Google Cloud](https://cloud.google.com), эта страница вам не подходит, так как ваши сервисы уже используют [Google Cloud Storage](https://cloud.google.com/storage). Если вы хотите `SELECT` или `INSERT` данные из GCS, пожалуйста, смотрите [`gcs` таблица функция](/sql-reference/table-functions/gcs).
:::

ClickHouse признает, что GCS представляет собой привлекательное решение для хранения для пользователей, которые стремятся разделить хранение и вычисления. Чтобы помочь в достижении этого, поддерживается использование GCS в качестве хранилища для движка MergeTree. Это позволит пользователям воспользоваться масштабируемостью и экономическими преимуществами GCS, а также производительностью вставок и запросов движка MergeTree.

## GCS Backed MergeTree {#gcs-backed-mergetree}

### Создание диска {#creating-a-disk}

Чтобы использовать бакет GCS в качестве диска, мы сначала должны объявить его в конфигурации ClickHouse в файле под `conf.d`. Пример объявления диска GCS показан ниже. Эта конфигурация включает в себя несколько разделов для настройки "диска" GCS, кэша и политики, которая указывается в DDL запросах, когда таблицы должны быть созданы на диске GCS. Каждый из этих разделов описан ниже.

#### storage_configuration > disks > gcs {#storage_configuration--disks--gcs}

Эта часть конфигурации показана в выделенном разделе и указывает, что:
- Пакетные удаления не должны выполняться. GCS в настоящее время не поддерживает пакетные удаления, поэтому автодетект отключен для подавления сообщений об ошибках.
- Тип диска - `s3`, поскольку используется API S3.
- Конечная точка, предоставленная GCS.
- HMAC ключ и секрет сервисного аккаунта.
- Путь к метаданным на локальном диске.

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
#### storage_configuration > disks > cache {#storage_configuration--disks--cache}

Пример конфигурации, выделенный ниже, включает 10Gi памяти в кэше для диска `gcs`.

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
#### storage_configuration > policies > gcs_main {#storage_configuration--policies--gcs_main}

Политики конфигурации хранения позволяют выбирать, где хранятся данные. Выделенная ниже политика позволяет данным храниться на диске `gcs`, указывая политику `gcs_main`. Например, `CREATE TABLE ... SETTINGS storage_policy='gcs_main'`.

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

Полный список параметров, относящихся к этому объявлению диска, можно найти [здесь](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3).

### Создание таблицы {#creating-a-table}

Предполагая, что вы настроили диск для использования бакета с правами на запись, вы должны иметь возможность создать таблицу, как в приведенном ниже примере. Для краткости мы используем подмножество колонок такси NYC и передаем данные непосредственно в таблицу с поддержкой GCS:

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

В зависимости от аппаратного обеспечения, эта последняя вставка 1 миллиона строк может занять несколько минут для выполнения. Вы можете подтвердить прогресс через таблицу system.processes. Не стесняйтесь увеличивать количество строк до предела в 10 миллионов и исследовать несколько примеров запросов.

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_gcs GROUP BY passenger_count;
```

### Обработка репликации {#handling-replication}

Репликация с дисками GCS может быть выполнена с помощью движка таблиц `ReplicatedMergeTree`. См. [репликацию единого шардирования в двух регионах GCP с использованием GCS](#gcs-multi-region) для получения подробностей.


### Узнать больше {#learn-more}

[Cloud Storage XML API](https://cloud.google.com/storage/docs/xml-api/overview) совместим с некоторыми инструментами и библиотеками, которые работают с такими сервисами, как Amazon Simple Storage Service (Amazon S3).

Для получения дополнительной информации о настройке потоков смотрите [Оптимизация для производительности](../s3/index.md#s3-optimizing-performance).


## Использование Google Cloud Storage (GCS) {#gcs-multi-region}

:::tip
Объектное хранилище используется по умолчанию в ClickHouse Cloud, вам не нужно следовать этой процедуре, если вы работаете в ClickHouse Cloud.
:::

### Планирование развертывания {#plan-the-deployment}

Этот учебник написан для описания реплицированного развертывания ClickHouse, работающего в Google Cloud и использующего Google Cloud Storage (GCS) в качестве типа диска ClickHouse.

В учебнике вы развернете узлы сервера ClickHouse в виртуальных машинах Google Cloud Engine, каждая из которых будет иметь связанный бакет GCS для хранения. Репликация координируется набором узлов ClickHouse Keeper, также развернутых в виде ВМ.

Примерные требования к высокой доступности:
- Два узла сервера ClickHouse в двух регионах GCP
- Два бакета GCS, развернутые в тех же регионах, что и два узла сервера ClickHouse
- Три узла ClickHouse Keeper, два из которых развернуты в тех же регионах, что и узлы сервера ClickHouse. Третий может находиться в том же регионе, что и один из первых двух узлов Keeper, но в другой зоне доступности.

ClickHouse Keeper требует два узла для функционирования, поэтому требуется три узла для высокой доступности.

### Подготовка ВМ {#prepare-vms}

Разверните пять ВМ в трех регионах:

| Регион | Узел ClickHouse Server | Бакет            | Узел ClickHouse Keeper |
|--------|------------------------|-------------------|---------------------|
| 1      | `chnode1`              | `bucket_regionname` | `keepernode1`       |
| 2      | `chnode2`              | `bucket_regionname` | `keepernode2`       |
| 3 `*`  |                        |                   | `keepernode3`       |

`*` Это может быть другая зона доступности в том же регионе, что и 1 или 2.

#### Развертывание ClickHouse {#deploy-clickhouse}

Разверните ClickHouse на двух хостах, в примерных конфигурациях они называются `chnode1`, `chnode2`.

Поместите `chnode1` в один регион GCP, а `chnode2` во второй. В этом руководстве используются `us-east1` и `us-east4` для ВМ compute engine, а также для бакетов GCS.

:::note
Не запускайте `clickhouse server`, пока он не будет настроен. Просто установите его.
:::

Смотрите [инструкции по установке](/getting-started/install.md/#available-installation-options) при выполнении шагов развертывания на узлах сервера ClickHouse.

#### Развертывание ClickHouse Keeper {#deploy-clickhouse-keeper}

Разверните ClickHouse Keeper на трех хостах, в примерных конфигурациях они называются `keepernode1`, `keepernode2` и `keepernode3`. `keepernode1` можно развернуть в том же регионе, что и `chnode1`, `keepernode2` с `chnode2`, а `keepernode3` в любом регионе, но в другой зоне доступности от узла ClickHouse в этом регионе.

Смотрите [инструкции по установке](/getting-started/install.md/#install-standalone-clickhouse-keeper) при выполнении шагов развертывания на узлах ClickHouse Keeper.

### Создание двух бакетов {#create-two-buckets}

Два сервера ClickHouse будут находиться в разных регионах для обеспечения высокой доступности. Каждый из них будет иметь бакет GCS в том же регионе.

В **Cloud Storage > Buckets** выберите **CREATE BUCKET**. В этом учебнике создаются два бакета, один в каждом из `us-east1` и `us-east4`. Бакеты являются однорежимными, стандартного класса хранения и не являются общедоступными. При появлении запроса включите предотвращение публичного доступа. Не создавайте папки, они будут созданы, когда ClickHouse запишет в хранилище.

Если вам нужны пошаговые инструкции для создания бакетов и HMAC ключа, то разверните **Создание бакетов GCS и HMAC ключа** и следуйте за ним:

<BucketDetails />

### Настройка ClickHouse Keeper {#configure-clickhouse-keeper}

Все узлы ClickHouse Keeper имеют один и тот же файл конфигурации, кроме строки `server_id` (первой выделенной строки ниже). Измените файл с именами ваших серверов ClickHouse Keeper, а на каждом из серверов установите `server_id` так, чтобы он соответствовал соответствующей записи `server` в `raft_configuration`. Поскольку в этом примере `server_id` установлен на `3`, мы выделили соответствующие строки в `raft_configuration`.

- Отредактируйте файл с вашими именами хостов и убедитесь, что они разрешаются с узлов сервера ClickHouse и узлов Keeper.
- Скопируйте файл на место (`/etc/clickhouse-keeper/keeper_config.xml` на каждом из узлов Keeper).
- Отредактируйте `server_id` на каждой машине в зависимости от ее номера в `raft_configuration`.

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
Некоторые из шагов в этом руководстве попросят вас разместить файл конфигурации в `/etc/clickhouse-server/config.d/`. Это стандартное местоположение на системах Linux для файлов переопределения конфигурации. Когда вы помещаете эти файлы в этот каталог, ClickHouse объединяет содержимое с конфигурацией по умолчанию. Путем размещения этих файлов в каталоге `config.d` вы избежите потери своей конфигурации во время обновления.
:::

#### Сеть {#networking}
По умолчанию ClickHouse прослушивает интерфейс обратной связи, в реплицированной настройке связь между машинами необходима. Прослушивайте на всех интерфейсах:

```xml title=/etc/clickhouse-server/config.d/network.xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

#### Удаленные узлы ClickHouse Keeper {#remote-clickhouse-keeper-servers}

Репликация координируется ClickHouse Keeper. Этот файл конфигурации идентифицирует узлы ClickHouse Keeper по имени хоста и номеру порта.

- Измените имена хостов так, чтобы они соответствовали вашим узлам Keeper.

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

#### Удаленные узлы ClickHouse {#remote-clickhouse-servers}

Этот файл настраивает имя хоста и порт каждого узла ClickHouse в кластере. Файл конфигурации по умолчанию содержит примерные определения кластеров, для того чтобы показать только кластеры, которые полностью настроены, к записи `remote_servers` добавляется тег `replace="true"`, чтобы, когда эта конфигурация объединяется с конфигурацией по умолчанию, она заменяла раздел `remote_servers` вместо добавления к нему.

- Отредактируйте файл с вашими именами хостов и убедитесь, что они разрешаются с узлов сервера ClickHouse.

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

#### Идентификация реплики {#replica-identification}

Этот файл настраивает параметры, относящиеся к пути ClickHouse Keeper. В частности, макросы, используемые для идентификации, к какой реплике принадлежат данные. На одном сервере реплика должна быть указана как `replica_1`, а на другом сервере - `replica_2`. Имена могут быть изменены, исходя из нашего примера, где одна реплика хранится в Южной Каролине, а другая в Северной Вирджинии, значения могут быть `carolina` и `virginia`; просто убедитесь, что они разные на каждой машине.

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

Конфигурация хранения ClickHouse включает в себя `disks` и `policies`. Диск, который настраивается ниже, называется `gcs` и имеет `type` `s3`. Тип - s3, потому что ClickHouse получает доступ к бакету GCS так, как будто он является бакетом AWS S3. Понадобится две копии этой конфигурации, по одной для каждого узла сервера ClickHouse.

В конфигурации ниже должны быть сделаны следующие замены.

Эти замены различаются между двумя узлами сервера ClickHouse:
- `REPLICA 1 BUCKET` должен быть установлен на имя бакета в том же регионе, что и сервер.
- `REPLICA 1 FOLDER` должен быть изменен на `replica_1` на одном из серверов, а на другом - на `replica_2`.

Эти замены общи для двух узлов:
- Значение `access_key_id` должно быть установлено на HMAC ключ, сгенерированный ранее.
- Значение `secret_access_key` должно быть установлено на HMAC секрет, сгенерированный ранее.

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

Отправляйте команды в ClickHouse Keeper с помощью `netcat`. Например, `mntr` возвращает состояние кластера ClickHouse Keeper. Если вы выполните команду на каждом из узлов Keeper, вы увидите, что один из них является лидером, а два других - последователями:

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

На `chnode1` и `chnode2` выполните:

```bash
sudo service clickhouse-server start
```
```bash
sudo service clickhouse-server status
```

### Проверка {#verification}

#### Проверка конфигурации диска {#verify-disk-configuration}

`system.disks` должен содержать записи для каждого диска:
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

3 rows in set. Elapsed: 0.002 sec.
```
#### Проверка, что таблицы, созданные в кластере, созданы на обоих узлах {#verify-that-tables-created-on-the-cluster-are-created-on-both-nodes}
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
```
```response
┌─host───────────────────────────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.us-east4-c.c.gcsqa-375100.internal │ 9000 │      0 │       │                   1 │                1 │
└────────────────────────────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
┌─host───────────────────────────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1.us-east1-b.c.gcsqa-375100.internal │ 9000 │      0 │       │                   0 │                0 │
└────────────────────────────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

2 rows in set. Elapsed: 0.641 sec.
```

#### Проверка, что данные можно вставить {#verify-that-data-can-be-inserted}

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

#### Проверка, что для таблицы используется политика хранения `gcs_main`. {#verify-that-the-storage-policy-gcs_main-is-used-for-the-table}
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

#### Проверка в Google Cloud Console {#verify-in-google-cloud-console}

Просматривая бакеты, вы увидите, что в каждом бакете была создана папка с именем, используемым в конфигурационном файле `storage.xml`. Раскройте папки, и вы увидите много файлов, представляющих данные разбиения.
#### Бакет для первой реплики {#bucket-for-replica-one}

<Image img={GCS_examine_bucket_1} size="lg" border alt="Бакет первой реплики в Google Cloud Storage, показывающий структуру папок с данными разбиений" />

#### Бакет для второй реплики {#bucket-for-replica-two}

<Image img={GCS_examine_bucket_2} size="lg" border alt="Бакет второй реплики в Google Cloud Storage, показывающий структуру папок с данными разбиений" />

