---
sidebar_label: Google Cloud Storage (GCS)
sidebar_position: 4
slug: /integrations/gcs
description: "Google Cloud Storage (GCS) с поддержкой MergeTree"
---
import BucketDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_GCS_authentication_and_bucket.md';
import GCS_examine_bucket_1 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-1.png';
import GCS_examine_bucket_2 from '@site/static/images/integrations/data-ingestion/s3/GCS-examine-bucket-2.png';


# Интеграция Google Cloud Storage с ClickHouse

:::note
Если вы используете ClickHouse Cloud на [Google Cloud](https://cloud.google.com), эта страница не имеет значения, так как ваши сервисы уже используют [Google Cloud Storage](https://cloud.google.com/storage). Если вы хотите `SELECT` или `INSERT` данные из GCS, пожалуйста, смотрите [`gcs` функцию таблицы](/sql-reference/table-functions/gcs).
:::

ClickHouse признает, что GCS представляет собой привлекательное решение для хранения для пользователей, ищущих разделение хранения и вычислений. Чтобы достичь этого, поддержка предоставляется для использования GCS в качестве хранилища для движка MergeTree. Это позволит пользователям воспользоваться масштабируемостью и выгодой от использования GCS, а также производительностью вставки и запросов движка MergeTree.

## MergeTree с поддержкой GCS {#gcs-backed-mergetree}

### Создание диска {#creating-a-disk}

Чтобы использовать корзину GCS в качестве диска, мы сначала должны объявить ее в конфигурации ClickHouse в файле под `conf.d`. Ниже приведен пример объявления диска GCS. Эта конфигурация включает несколько секций для настройки "диска" GCS, кэша и политики, которая указывается в DDL-запросах при создании таблиц на диске GCS. Каждое из них описано ниже.

#### storage_configuration > disks > gcs {#storage_configuration--disks--gcs}

Эта часть конфигурации показана в выделенной секции и указывает следующее:
- Пакетные удаления не будут выполняться. В настоящее время GCS не поддерживает пакетные удаления, поэтому автопредставление отключено для подавления сообщений об ошибках.
- Тип диска - `s3`, потому что используется API S3.
- Точка доступа, предоставленная GCS
- Ключ и секрет HMAC сервисного аккаунта
- Путь метаданных на локальном диске

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

Пример конфигурации, выделенный ниже, включает 10Gi памяти кэша для диска `gcs`.

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

Полный список параметров, относящихся к этому объявлению диска, можно найти [здесь](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3).

### Создание таблицы {#creating-a-table}

При условии, что вы настроили свой диск для использования корзины с правами на запись, вы должны иметь возможность создать таблицу, как в приведенном ниже примере. В целях краткости мы используем подмножество колонок такси NYC и передаем данные непосредственно в таблицу с поддержкой GCS:

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

# highlight-next-line
SETTINGS storage_policy='gcs_main'
```

```sql
INSERT INTO trips_gcs SELECT trip_id, pickup_date, pickup_datetime, dropoff_datetime, pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, passenger_count, trip_distance, tip_amount, total_amount, payment_type FROM s3('https://ch-nyc-taxi.s3.eu-west-3.amazonaws.com/tsv/trips_{0..9}.tsv.gz', 'TabSeparatedWithNames') LIMIT 1000000;
```

В зависимости от оборудования, эта последняя вставка 1 миллиона строк может занять несколько минут для выполнения. Вы можете подтвердить прогресс через таблицу system.processes. Не стесняйтесь увеличивать количество строк до предела в 10 миллионов и изучить некоторые примеры запросов.

```sql
SELECT passenger_count, avg(tip_amount) as avg_tip, avg(total_amount) as avg_amount FROM trips_gcs GROUP BY passenger_count;
```

### Обработка репликации {#handling-replication}

Репликация с дисками GCS может быть выполнена с использованием движка таблицы `ReplicatedMergeTree`. См. [репликация одного шарда через два региона GCP с использованием GCS](#gcs-multi-region) для получения подробной информации.


### Узнать больше {#learn-more}

[Cloud Storage XML API](https://cloud.google.com/storage/docs/xml-api/overview) совместим с некоторыми инструментами и библиотеками, которые работают с такими сервисами, как Amazon Simple Storage Service (Amazon S3).

Для получения дополнительной информации о настройке потоков, см. [Оптимизация производительности](../s3/index.md#s3-optimizing-performance).


## Использование Google Cloud Storage (GCS) {#gcs-multi-region}

:::tip
Объектное хранилище используется по умолчанию в ClickHouse Cloud, вам не нужно следовать этой процедуре, если вы работаете в ClickHouse Cloud.
:::

### Планирование развертывания {#plan-the-deployment}

Этот учебник написан, чтобы описать развертывание реплицированного ClickHouse, работающего в Google Cloud и использующего Google Cloud Storage (GCS) в качестве диска "типа" ClickHouse.

В учебнике вы развернете узлы сервера ClickHouse на виртуальных машинах Google Cloud Engine, каждая из которых будет иметь связанную с ней корзину GCS для хранения. Репликация координируется набором узлов ClickHouse Keeper, также развернутых как виртуальные машины.

Примеры требований к высокой доступности:
- Два узла сервера ClickHouse в двух регионах GCP
- Две корзины GCS, развернутые в тех же регионах, что и два узла сервера ClickHouse
- Три узла ClickHouse Keeper, два из которых развернуты в тех же регионах, что и узлы сервера ClickHouse. Третий может находиться в том же регионе, что один из первых двух узлов Keeper, но в другой зоне доступности.

ClickHouse Keeper требует два узла для функционирования, поэтому необходимо три узла для высокой доступности.

### Подготовка ВМ {#prepare-vms}

Разверните пять виртуальных машин в трех регионах:

| Регион | Сервер ClickHouse | Корзина            | ClickHouse Keeper |
|--------|-------------------|---------------------|-------------------|
| 1      | `chnode1`           | `bucket_regionname` | `keepernode1`       |
| 2      | `chnode2`           | `bucket_regionname` | `keepernode2`       |
| 3 `*`  |                   |                     | `keepernode3`       |

`*` Это может быть другая зона доступности в том же регионе, что и 1 или 2.

#### Развертывание ClickHouse {#deploy-clickhouse}

Разверните ClickHouse на двух хостах, в примерах конфигураций они называются `chnode1`, `chnode2`.

Поместите `chnode1` в один регион GCP, а `chnode2` в другой. В этом руководстве используются `us-east1` и `us-east4` для виртуальных машин вычислительного движка, а также для корзин GCS.

:::note
Не запускайте `clickhouse server`, пока он не будет настроен. Просто установите его.
:::

Смотрите [инструкции по установке](/getting-started/install.md/#available-installation-options), когда выполняете шаги развертывания на узлах сервера ClickHouse.

#### Развертывание ClickHouse Keeper {#deploy-clickhouse-keeper}

Разверните ClickHouse Keeper на трех хостах, в примерах конфигураций они называются `keepernode1`, `keepernode2` и `keepernode3`. `keepernode1` можно развернуть в том же регионе, что и `chnode1`, `keepernode2` с `chnode2`, а `keepernode3` в любом регионе, но в другой зоне доступности от узла ClickHouse в данном регионе.

Смотрите [инструкции по установке](/getting-started/install.md/#install-standalone-clickhouse-keeper), когда выполняете шаги развертывания на узлах ClickHouse Keeper.

### Создание двух корзин {#create-two-buckets}

Два сервера ClickHouse будут находиться в разных регионах для высокой доступности. Каждый будет иметь корзину GCS в том же регионе.

В **Cloud Storage > Buckets** выберите **CREATE BUCKET**. Для этого учебника создаются две корзины, одна в каждом из `us-east1` и `us-east4`. Корзины являются одиночным регионом, стандартным классом хранения и не являются публичными. Когда будет предложено, включите предотвращение публичного доступа. Не создавайте папки, они будут созданы, когда ClickHouse будет записывать данные в хранилище.

Если вам нужны пошаговые инструкции по созданию корзин и ключа HMAC, тогда разверните **Создать корзины GCS и ключ HMAC** и выполните шаги:

<BucketDetails />

### Настройка ClickHouse Keeper {#configure-clickhouse-keeper}

Все узлы ClickHouse Keeper имеют один и тот же файл конфигурации, за исключением строки `server_id` (первой выделенной строки ниже). Измените файл, указав имена ваших серверов ClickHouse Keeper, а на каждом из серверов установите `server_id`, чтобы соответствовать соответствующей записи `server` в `raft_configuration`. Поскольку в этом примере `server_id` установлено на `3`, мы выделили совпадающие строки в `raft_configuration`.

- Измените файл, указав ваши имена хостов и убедитесь, что они разрешаются с узлов сервера ClickHouse и узлов Keeper
- Скопируйте файл в нужное место (`/etc/clickhouse-keeper/keeper_config.xml` на каждом из серверов Keeper)
- Измените `server_id` на каждой машине в зависимости от ее номера в `raft_configuration`

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
Некоторые шаги в этом руководстве будут просить вас поместить файл конфигурации в `/etc/clickhouse-server/config.d/`. Это место по умолчанию для файлов переопределения конфигурации на системах Linux. Когда вы помещаете эти файлы в этот каталог, ClickHouse объединяет содержимое с конфигурацией по умолчанию. Помещая эти файлы в директорию `config.d`, вы избежите потери своей конфигурации во время обновления.
:::

#### Сетевые настройки {#networking}
По умолчанию ClickHouse слушает на интерфейсе обратной связи, в реплицированной настройке необходимо сетевое взаимодействие между машин. Слушать на всех интерфейсах:

```xml title=/etc/clickhouse-server/config.d/network.xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
</clickhouse>
```

#### Удаленные сервера ClickHouse Keeper {#remote-clickhouse-keeper-servers}

Репликация координируется ClickHouse Keeper. Этот файл конфигурации определяет узлы ClickHouse Keeper по имени хоста и номеру порта.

- Измените имена хостов, чтобы они соответствовали вашим узлам Keeper


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

Этот файл конфигурирует имя хоста и порт каждого сервера ClickHouse в кластере. Файл конфигурации по умолчанию содержит примеры определений кластера, чтобы показать только полностью настроенные кластеры, тег `replace="true"` добавляется к записи `remote_servers`, чтобы при объединении этой конфигурации с конфигурацией по умолчанию заменялся раздел `remote_servers`, а не добавлялся к нему.

- Измените файл, указав ваши имена хостов и убедитесь, что они разрешаются с узлов сервера ClickHouse

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

Этот файл настраивает параметры, связанные с путем ClickHouse Keeper. Конкретно макросы, используемые для идентификации, к какой реплике принадлежат данные. На одном сервере реплика должна быть указана как `replica_1`, а на другом сервере как `replica_2`. Имена можно изменять, в зависимости от нашего примера, одна реплика может храниться в Южной Каролине, а другая в Северной Виргинии, значения могут быть `carolina` и `virginia`; просто убедитесь, что они разные на каждой машине.

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

Конфигурация хранения ClickHouse включает `disks` и `policies`. Диск, который настраивается ниже, называется `gcs`, и его `type` - `s3`. Тип - s3, потому что ClickHouse получает доступ к корзине GCS так, как если бы это был AWS S3. Потребуются две копии этой конфигурации, одна для каждого из узлов сервера ClickHouse.

Эти замены должны быть внесены в конфигурацию ниже.

Эти замены различаются между двумя узлами ClickHouse:
- `REPLICA 1 BUCKET` должен быть установлен в имя корзины в том же регионе, что и сервер
- `REPLICA 1 FOLDER` должен быть изменен на `replica_1` на одном из серверов и `replica_2` на другом

Эти замены являются общими для двух узлов:
- `access_key_id` должен быть установлен на ранее созданный ключ HMAC
- `secret_access_key` должен быть установлен на ранее созданный секрет HMAC

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

#### Проверка состояния ClickHouse Keeper {#check-clickhouse-keeper-status}

Отправьте команды ClickHouse Keeper с помощью `netcat`. Например, `mntr` возвращает состояние кластера ClickHouse Keeper. Если вы выполните эту команду на каждом из узлов Keeper, вы увидите, что один из них является лидером, а другие два - последователями:

```bash
echo mntr | nc localhost 9181
```
```response
zk_version	v22.7.2.15-stable-f843089624e8dd3ff7927b8a125cf3a7a769c069
zk_avg_latency	0
zk_max_latency	11
zk_min_latency	0
zk_packets_received	1783
zk_packets_sent	1783

# highlight-start
zk_num_alive_connections	2
zk_outstanding_requests	0
zk_server_state	leader

# highlight-end
zk_znode_count	135
zk_watch_count	8
zk_ephemerals_count	3
zk_approximate_data_size	42533
zk_key_arena_size	28672
zk_latest_snapshot_size	0
zk_open_file_descriptor_count	182
zk_max_file_descriptor_count	18446744073709551615

# highlight-start
zk_followers	2
zk_synced_followers	2

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

#### Проверьте конфигурацию диска {#verify-disk-configuration}

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
#### Убедитесь, что таблицы, созданные в кластере, созданы на обоих узлах {#verify-that-tables-created-on-the-cluster-are-created-on-both-nodes}
```sql

# highlight-next-line
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

# highlight-next-line
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

#### Убедитесь, что данные могут быть вставлены {#verify-that-data-can-be-inserted}

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

#### Убедитесь, что политика хранения `gcs_main` используется для таблицы. {#verify-that-the-storage-policy-gcs_main-is-used-for-the-table}
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

#### Проверьте в Google Cloud Console {#verify-in-google-cloud-console}

Смотрев на корзины, вы увидите, что в каждой корзине была создана папка с именем, которое использовалось в конфигурационном файле `storage.xml`. Разверните папки и вы увидите множество файлов, представляющих разделы данных.
#### Корзина для реплики одного {#bucket-for-replica-one}

<img src={GCS_examine_bucket_1} alt="Корзина для реплики один в Google Cloud Storage" />

#### Корзина для реплики два {#bucket-for-replica-two}

<img src={GCS_examine_bucket_2} alt="Корзина для реплики два в Google Cloud Storage" />

