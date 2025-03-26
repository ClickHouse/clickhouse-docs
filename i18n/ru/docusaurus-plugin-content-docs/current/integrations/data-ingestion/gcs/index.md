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
Если вы используете ClickHouse Cloud на [Google Cloud](https://cloud.google.com), эта страница не применима, так как ваши сервисы уже будут использовать [Google Cloud Storage](https://cloud.google.com/storage). Если вы хотите `SELECT` или `INSERT` данные из GCS, пожалуйста, посмотрите на [`gcs` табличную функцию](/sql-reference/table-functions/gcs).
:::

ClickHouse понимает, что GCS является привлекательным решением для хранения для пользователей, которые стремятся разделить хранение и обработку. Для достижения этой цели предоставляется поддержка использования GCS в качестве хранилища для движка MergeTree. Это позволит пользователям извлечь выгоды от масштабируемости и экономических преимуществ GCS, а также от производительности вставки и запросов движка MergeTree.

## MergeTree с поддержкой GCS {#gcs-backed-mergetree}

### Создание диска {#creating-a-disk}

Чтобы использовать корзину GCS в качестве диска, необходимо сначала объявить её в конфигурации ClickHouse в файле в папке `conf.d`. Пример объявления диска GCS показан ниже. Эта конфигурация включает несколько секций для настройки "диска" GCS, кэша и политики, которая указывается в DDL запросах, когда таблицы создаются на диске GCS. Каждая из них описана ниже.

#### storage_configuration > disks > gcs {#storage_configuration--disks--gcs}

Эта часть конфигурации показана в выделенной секции и указывает, что:
- Пакетные удаления не будут выполнены. В настоящее время GCS не поддерживает пакетные удаления, поэтому автопоиск отключен, чтобы подавить сообщения об ошибках.
- Тип диска `s3`, так как используется API S3.
- Конечная точка, предоставленная GCS.
- HMAC ключ и секрет сервисного аккаунта.
- Путь метаданных на локальном диске.

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

Пример конфигурации, выделенный ниже, включает кэш памяти 10Gi для диска `gcs`.

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

Политики конфигурации хранения позволяют выбирать, где хранятся данные. Выделенная ниже политика позволяет хранить данные на диске `gcs`, указывая политику `gcs_main`. Например, `CREATE TABLE ... SETTINGS storage_policy='gcs_main'`.

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

Полный список настроек, относящихся к этому объявлению диска, можно найти [здесь](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3).

### Создание таблицы {#creating-a-table}

Предполагая, что вы настроили свой диск так, чтобы использовать корзину с правами на запись, вы сможете создать таблицу, как в примере ниже. Для краткости мы используем подмножество столбцов такси NYC и передаем данные непосредственно в таблицу с поддержкой GCS:

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

В зависимости от аппаратного обеспечения, эта последняя вставка 1 миллиона строк может занять несколько минут для выполнения. Вы можете подтвердить процесс с помощью таблицы system.processes. Не стесняйтесь увеличить количество строк до предела 10 миллионов и просмотреть несколько образцов запросов.

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_gcs GROUP BY passenger_count;
```

### Работа с репликацией {#handling-replication}

Репликация с дисками GCS может быть выполнена с помощью движка таблиц `ReplicatedMergeTree`. Смотрите [репликацию одного шарда через два региона GCP с использованием GCS](#gcs-multi-region) для подробностей.


### Узнать больше {#learn-more}

[Cloud Storage XML API](https://cloud.google.com/storage/docs/xml-api/overview) совместим с некоторыми инструментами и библиотеками, которые работают с такими сервисами, как Amazon Simple Storage Service (Amazon S3).

Для получения дополнительной информации о настройке потоков смотрите [Оптимизация производительности](../s3/index.md#s3-optimizing-performance).


## Использование Google Cloud Storage (GCS) {#gcs-multi-region}

:::tip
Объектное хранилище используется по умолчанию в ClickHouse Cloud, вам не нужно следовать этой процедуре, если вы работаете в ClickHouse Cloud.
:::

### Планирование развертывания {#plan-the-deployment}

Этот учебник написан для описания развертывания реплицированного ClickHouse, работающего в Google Cloud и использующего Google Cloud Storage (GCS) в качестве типа диска хранилища ClickHouse.

В учебнике вы развернете узлы сервера ClickHouse в виртуальных машинах Google Cloud Engine, каждая из которых будет иметь связанную корзину GCS для хранения. Репликация координируется набором узлов ClickHouse Keeper, также развернутых как ВМ.

Пример требований для высокой доступности:
- Два узла сервера ClickHouse, в двух регионах GCP
- Две корзины GCS, развернутые в тех же регионах, что и два узла сервера ClickHouse
- Три узла ClickHouse Keeper, два из которых развернуты в тех же регионах, что и узлы сервера ClickHouse. Третий может находиться в том же регионе, что один из первых двух узлов Keeper, но в другой зоне доступности.

ClickHouse Keeper требует два узла для работы, поэтому необходимость в трех узлах для высокой доступности.

### Подготовка ВМ {#prepare-vms}

Разверните пять ВМ в трех регионах:

| Регион | Сервер ClickHouse | Корзина           | ClickHouse Keeper   |
|--------|-------------------|-------------------|---------------------|
| 1      | `chnode1`           | `bucket_regionname` | `keepernode1`       |
| 2      | `chnode2`           | `bucket_regionname` | `keepernode2`       |
| 3 `*`  |                   |                   | `keepernode3`       |

`*` Это может быть другая зона доступности в том же регионе, что 1 или 2.

#### Развертывание ClickHouse {#deploy-clickhouse}

Разверните ClickHouse на двух хостах, в примерных конфигурациях они называются `chnode1`, `chnode2`.

Разместите `chnode1` в одном регионе GCP, а `chnode2` во втором. В этой инструкции используются `us-east1` и `us-east4` для ВМ вычислительного двигателя, а также для корзин GCS.

:::note
Не запускайте `clickhouse server`, пока он не будет настроен. Просто установите его.
:::

Смотрите [инструкции по установке](/getting-started/install.md/#available-installation-options) при выполнении шагов развертывания на узлах сервера ClickHouse.

#### Развертывание ClickHouse Keeper {#deploy-clickhouse-keeper}

Разверните ClickHouse Keeper на трех хостах, в примерных конфигурациях они называются `keepernode1`, `keepernode2` и `keepernode3`. `keepernode1` можно развернуть в том же регионе, что и `chnode1`, `keepernode2` с `chnode2`, и `keepernode3` в любом регионе, но в другой зоне доступности от узла ClickHouse в этом регионе.

Смотрите [инструкции по установке](/getting-started/install.md/#install-standalone-clickhouse-keeper) при выполнении шагов развертывания на узлах ClickHouse Keeper.

### Создание двух корзин {#create-two-buckets}

Два сервера ClickHouse будут находиться в разных регионах для высокой доступности. Каждый из них будет иметь корзину GCS в том же регионе.

В **Cloud Storage > Buckets** выберите **CREATE BUCKET**. Для этого учебника создаются две корзины, одна в каждом из `us-east1` и `us-east4`. Корзины являются стандартными и однорегионными, и не являются публичными. Когда вас попросят, включите предотвращение доступа в общедоступную сеть. Не создавайте папки, они будут созданы, когда ClickHouse будет записывать в хранилище.

Если вам нужны пошаговые инструкции по созданию корзин и HMAC ключа, разверните **Создание корзин GCS и HMAC ключа** и следуйте инструкции:

<BucketDetails />

### Настройка ClickHouse Keeper {#configure-clickhouse-keeper}

Все узлы ClickHouse Keeper имеют один и тот же файл конфигурации за исключением строки `server_id` (первой выделенной строки ниже). Измените файл с именами хостов ваших серверов ClickHouse Keeper, и на каждом из серверов установите `server_id`, чтобы соответствовать соответствующей записи `server` в `raft_configuration`. Поскольку в этом примере `server_id` установлен в `3`, мы выделили соответствующие строки в `raft_configuration`.

- Редактируйте файл с вашими именами хостов и убедитесь, что они разрешаются с узлов сервера ClickHouse и узлов Keeper.
- Скопируйте файл на место (`/etc/clickhouse-keeper/keeper_config.xml` на каждом из серверов Keeper).
- Отредактируйте `server_id` на каждом компьютере, основываясь на его номерной записи в `raft_configuration`.

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
Некоторые шаги в этом руководстве попросят вас поместить файл конфигурации в `/etc/clickhouse-server/config.d/`. Это местоположение по умолчанию для файлов переопределения конфигурации в Linux системах. Когда вы помещаете эти файлы в этот каталог, ClickHouse объединит содержимое с конфигурацией по умолчанию. Помещая эти файлы в каталог `config.d`, вы избежите потерь конфигурации при обновлении.
:::

#### Сеть {#networking}
По умолчанию ClickHouse слушает на интерфейсе обратной связи; в реплицированной конфигурации необходима сетевая связь между машинами. Слушайте на всех интерфейсах:

```xml title=/etc/clickhouse-server/config.d/network.xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

#### Удаленные серверы ClickHouse Keeper {#remote-clickhouse-keeper-servers}

Репликация координируется ClickHouse Keeper. Этот файл конфигурации идентифицирует узлы ClickHouse Keeper по имени хоста и номеру порта.

- Измените имена хостов, чтобы они соответствовали вашим узлам Keeper.


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


#### Удаленные серверы ClickHouse {#remote-clickhouse-servers}

Этот файл настраивает имя хоста и порт каждого сервера ClickHouse в кластере. Файл конфигурации по умолчанию содержит примерные определения кластера; чтобы показать только полностью сконфигурированные кластеры, в элемент `remote_servers` добавляется тег `replace="true"`, чтобы, когда эта конфигурация объединяется с конфигурацией по умолчанию, она заменила секцию `remote_servers`, а не добавила к ней.

- Редактируйте файл с вашими именами хостов и убедитесь, что они разрешаются с узлов сервера ClickHouse.

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

Этот файл настраивает параметры, связанные с путем ClickHouse Keeper. В частности, макросы, используемые для идентификации, к какой реплике принадлежат данные. На одном сервере реплика должна быть указана как `replica_1`, а на другом сервере `replica_2`. Имена могут быть изменены, в зависимости от нашего примера, одна реплика может храниться в Южной Каролине, а другая - в Северной Вирджинии, значения могут быть `carolina` и `virginia`; просто убедитесь, что они разные на каждой машине.

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

Конфигурация хранения ClickHouse включает `disks` и `policies`. Диск, который настраивается ниже, называется `gcs`, и имеет `type` `s3`. Тип задан как s3, поскольку ClickHouse обращается к корзине GCS так, как если бы это была корзина AWS S3. Потребуются две копии этой конфигурации, по одной для каждого узла сервера ClickHouse.

Эти замены должны быть выполнены в конфигурации ниже.

Эти замены различаются между двумя узлами сервера ClickHouse:
- `REPLICA 1 BUCKET` должен быть установлен на имя корзины в том же регионе, что и сервер.
- `REPLICA 1 FOLDER` должен быть изменен на `replica_1` на одном из серверов и на `replica_2` на другом.

Эти замены являются общими для обоих узлов:
- `access_key_id` должен быть установлен на HMAC ключ, сгенерированный ранее.
- `secret_access_key` должен быть установлен на HMAC секрет, сгенерированный ранее.

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

Отправляйте команды ClickHouse Keeper с помощью `netcat`. Например, `mntr` возвращает состояние кластера ClickHouse Keeper. Если вы выполните команду на каждом из узлов Keeper, вы увидите, что один является лидером, а другие два - подписчиками:

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

На `chnode1` и `chnode` выполните:

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
#### Проверка того, что таблицы, созданные в кластере, созданы на обоих узлах {#verify-that-tables-created-on-the-cluster-are-created-on-both-nodes}
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

#### Проверка, что данные могут быть вставлены {#verify-that-data-can-be-inserted}

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

#### Проверка, что политика хранения `gcs_main` используется для таблицы. {#verify-that-the-storage-policy-gcs_main-is-used-for-the-table}
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

Просматривая корзины, вы увидите, что в каждой корзине была создана папка с именем, использованном в конфигурационном файле `storage.xml`. Раскройте папки, и вы увидите много файлов, представляющих партиции данных.
#### Корзина для реплики один {#bucket-for-replica-one}

<Image img={GCS_examine_bucket_1} size="lg" border alt="Корзина для реплики один в Google Cloud Storage, показывающая структуру папок с партициями данных" />

#### Корзина для реплики два {#bucket-for-replica-two}

<Image img={GCS_examine_bucket_2} size="lg" border alt="Корзина для реплики два в Google Cloud Storage, показывающая структуру папок с партициями данных" />

