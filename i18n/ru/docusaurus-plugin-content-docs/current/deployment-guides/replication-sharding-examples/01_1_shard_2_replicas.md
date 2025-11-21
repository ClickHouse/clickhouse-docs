---
slug: /architecture/replication
sidebar_label: 'Репликация'
sidebar_position: 10
title: 'Репликация данных'
description: 'Страница с описанием примера архитектуры с пятью настроенными серверами. Два используются для хранения копий данных, а остальные — для координации репликации данных'
doc_type: 'guide'
keywords: ['репликация', 'высокая доступность', 'настройка кластера', 'избыточность данных', 'отказоустойчивость']
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/docs/_snippets/_replication-sharding-terminology.md';
import ReplicationArchitecture from '@site/static/images/deployment-guides/replication-sharding-examples/replication.png';
import ConfigFileNote from '@site/docs/_snippets/_config-files.md';
import KeeperConfigFileNote from '@site/docs/_snippets/_keeper-config-files.md';
import ConfigExplanation from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_config_explanation.mdx';
import ListenHost from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_listen_host.mdx';
import ServerParameterTable from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_server_parameter_table.mdx';
import KeeperConfig from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_keeper_config.mdx';
import KeeperConfigExplanation from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_keeper_explanation.mdx';
import VerifyKeeperStatus from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_verify_keeper_using_mntr.mdx';
import DedicatedKeeperServers from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_dedicated_keeper_servers.mdx';
import ExampleFiles from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_working_example.mdx';
import CloudTip from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_cloud_tip.mdx';

> В этом примере вы узнаете, как настроить простой кластер ClickHouse
> с репликацией данных. Настроено пять серверов. Два из них используются для хранения
> копий данных, а остальные три — для координации репликации
> данных.

Архитектура кластера, который вы будете настраивать, показана ниже:

<Image img={ReplicationArchitecture} size="md" alt="Схема архитектуры для 1 шарда и 2 реплик с ReplicatedMergeTree" />

<DedicatedKeeperServers />


## Предварительные требования {#pre-requisites}

- Вы ранее настроили [локальный сервер ClickHouse](/install)
- Вы знакомы с базовыми концепциями конфигурации ClickHouse, такими как [файлы конфигурации](/operations/configuration-files)
- У вас установлен Docker

<VerticalStepper level="h2">


## Настройка структуры каталогов и тестовой среды {#set-up}

<ExampleFiles />

В этом руководстве для настройки кластера ClickHouse используется [Docker Compose](https://docs.docker.com/compose/). Данная конфигурация может быть адаптирована для работы на отдельных локальных машинах, виртуальных машинах или облачных инстансах.

Выполните следующие команды для создания структуры каталогов для этого примера:

```bash
mkdir cluster_1S_2R
cd cluster_1S_2R

```


# Создание каталогов clickhouse-keeper

for i in {01..03}; do
mkdir -p fs/volumes/clickhouse-keeper-${i}/etc/clickhouse-keeper
done


# Создайте директории clickhouse-server

for i in {01..02}; do
mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server
done

````

Добавьте следующий файл `docker-compose.yml` в директорию `cluster_1S_2R`:

```yaml title="docker-compose.yml"
version: '3.8'
services:
  clickhouse-01:
    image: "clickhouse/clickhouse-server:latest"
    user: "101:101"
    container_name: clickhouse-01
    hostname: clickhouse-01
    volumes:
      - ${PWD}/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml:/etc/clickhouse-server/config.d/config.xml
      - ${PWD}/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml:/etc/clickhouse-server/users.d/users.xml
    ports:
      - "127.0.0.1:8123:8123"
      - "127.0.0.1:9000:9000"
    depends_on:
      - clickhouse-keeper-01
      - clickhouse-keeper-02
      - clickhouse-keeper-03
  clickhouse-02:
    image: "clickhouse/clickhouse-server:latest"
    user: "101:101"
    container_name: clickhouse-02
    hostname: clickhouse-02
    volumes:
      - ${PWD}/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml:/etc/clickhouse-server/config.d/config.xml
      - ${PWD}/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml:/etc/clickhouse-server/users.d/users.xml
    ports:
      - "127.0.0.1:8124:8123"
      - "127.0.0.1:9001:9000"
    depends_on:
      - clickhouse-keeper-01
      - clickhouse-keeper-02
      - clickhouse-keeper-03
  clickhouse-keeper-01:
    image: "clickhouse/clickhouse-keeper:latest-alpine"
    user: "101:101"
    container_name: clickhouse-keeper-01
    hostname: clickhouse-keeper-01
    volumes:
     - ${PWD}/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml:/etc/clickhouse-keeper/keeper_config.xml
    ports:
        - "127.0.0.1:9181:9181"
  clickhouse-keeper-02:
    image: "clickhouse/clickhouse-keeper:latest-alpine"
    user: "101:101"
    container_name: clickhouse-keeper-02
    hostname: clickhouse-keeper-02
    volumes:
     - ${PWD}/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml:/etc/clickhouse-keeper/keeper_config.xml
    ports:
        - "127.0.0.1:9182:9181"
  clickhouse-keeper-03:
    image: "clickhouse/clickhouse-keeper:latest-alpine"
    user: "101:101"
    container_name: clickhouse-keeper-03
    hostname: clickhouse-keeper-03
    volumes:
     - ${PWD}/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml:/etc/clickhouse-keeper/keeper_config.xml
    ports:
        - "127.0.0.1:9183:9181"
````

Создайте следующие поддиректории и файлы:

```bash
for i in {01..02}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation />


## Настройка узлов ClickHouse {#configure-clickhouse-servers}

### Настройка сервера {#server-setup}

Теперь измените каждый пустой файл конфигурации `config.xml`, расположенный по пути
`fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d`. Строки, выделенные
ниже, необходимо изменить для каждого узла индивидуально:

```xml
<clickhouse replace="true">
    <logger>
        <level>debug</level>
        <log>/var/log/clickhouse-server/clickhouse-server.log</log>
        <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <!--highlight-next-line-->
    <display_name>cluster_1S_2R node 1</display_name>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <user_directories>
        <users_xml>
            <path>users.xml</path>
        </users_xml>
        <local_directory>
            <path>/var/lib/clickhouse/access/</path>
        </local_directory>
    </user_directories>
    <distributed_ddl>
        <path>/clickhouse/task_queue/ddl</path>
    </distributed_ddl>
    <remote_servers>
        <cluster_1S_2R>
            <shard>
                <internal_replication>true</internal_replication>
                <replica>
                    <host>clickhouse-01</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>clickhouse-02</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
    <zookeeper>
        <node>
            <host>clickhouse-keeper-01</host>
            <port>9181</port>
        </node>
        <node>
            <host>clickhouse-keeper-02</host>
            <port>9181</port>
        </node>
        <node>
            <host>clickhouse-keeper-03</host>
            <port>9181</port>
        </node>
    </zookeeper>
    <!--highlight-start-->
    <macros>
        <shard>01</shard>
        <replica>01</replica>
        <cluster>cluster_1S_2R</cluster>
    </macros>
    <!--highlight-end-->
</clickhouse>
```

| Каталог                                                   | Файл                                                                                                                                                                             |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |

Каждый раздел приведенного выше файла конфигурации подробно описан ниже.

#### Сеть и журналирование {#networking}

<ListenHost />

Журналирование определяется в блоке `<logger>`. Данная конфигурация создает
журнал отладки, который будет ротироваться при достижении размера 1000M три раза:

```xml
<logger>
    <level>debug</level>
    <log>/var/log/clickhouse-server/clickhouse-server.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
    <size>1000M</size>
    <count>3</count>
</logger>
```

Для получения дополнительной информации о настройке журналирования см. комментарии в
стандартном [файле конфигурации](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml) ClickHouse.

#### Конфигурация кластера {#cluster-configuration}

Конфигурация кластера задается в блоке `<remote_servers>`.
Здесь определяется имя кластера `cluster_1S_2R`.


Блок `<cluster_1S_2R></cluster_1S_2R>` определяет структуру кластера
с помощью настроек `<shard></shard>` и `<replica></replica>` и служит
шаблоном для распределённых DDL-запросов — запросов, которые выполняются на всём
кластере с использованием конструкции `ON CLUSTER`. По умолчанию распределённые DDL-запросы
разрешены, но их также можно отключить с помощью настройки `allow_distributed_ddl_queries`.

Параметр `internal_replication` установлен в значение true, чтобы данные записывались только на одну из реплик.

```xml
<remote_servers>
    <!-- имя кластера (не должно содержать точек) -->
    <cluster_1S_2R>
        <!-- <allow_distributed_ddl_queries>false</allow_distributed_ddl_queries> -->
        <shard>
            <!-- Необязательный параметр. Определяет, записывать ли данные только на одну из реплик. По умолчанию: false (записывать данные на все реплики). -->
            <internal_replication>true</internal_replication>
            <replica>
                <host>clickhouse-01</host>
                <port>9000</port>
            </replica>
            <replica>
                <host>clickhouse-02</host>
                <port>9000</port>
            </replica>
        </shard>
    </cluster_1S_2R>
</remote_servers>
```

<ServerParameterTable />

#### Конфигурация Keeper {#keeper-config-explanation}

Секция `<ZooKeeper>` указывает ClickHouse, где запущен ClickHouse Keeper (или ZooKeeper).
Поскольку мы используем кластер ClickHouse Keeper, необходимо указать каждый узел `<node>` кластера
вместе с его именем хоста и номером порта с помощью тегов `<host>` и `<port>` соответственно.

Настройка ClickHouse Keeper описана на следующем шаге руководства.

```xml
<zookeeper>
    <node>
        <host>clickhouse-keeper-01</host>
        <port>9181</port>
    </node>
    <node>
        <host>clickhouse-keeper-02</host>
        <port>9181</port>
    </node>
    <node>
        <host>clickhouse-keeper-03</host>
        <port>9181</port>
    </node>
</zookeeper>
```

:::note
Хотя можно запускать ClickHouse Keeper на том же сервере, что и ClickHouse Server,
в производственных средах мы настоятельно рекомендуем запускать ClickHouse Keeper на выделенных хостах.
:::

#### Конфигурация макросов {#macros-config-explanation}

Кроме того, секция `<macros>` используется для определения подстановок параметров для
реплицируемых таблиц. Они перечислены в `system.macros` и позволяют использовать подстановки
вида `{shard}` и `{replica}` в запросах.

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
    <cluster>cluster_1S_2R</cluster>
</macros>
```

:::note
Они будут определены индивидуально в зависимости от структуры кластера.
:::

### Конфигурация пользователей {#user-config}

Теперь измените каждый пустой конфигурационный файл `users.xml`, расположенный в
`fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d`, следующим образом:

```xml title="/users.d/users.xml"
<?xml version="1.0"?>
<clickhouse replace="true">
    <profiles>
        <default>
            <max_memory_usage>10000000000</max_memory_usage>
            <use_uncompressed_cache>0</use_uncompressed_cache>
            <load_balancing>in_order</load_balancing>
            <log_queries>1</log_queries>
        </default>
    </profiles>
    <users>
        <default>
            <access_management>1</access_management>
            <profile>default</profile>
            <networks>
                <ip>::/0</ip>
            </networks>
            <quota>default</quota>
            <access_management>1</access_management>
            <named_collection_control>1</named_collection_control>
            <show_named_collections>1</show_named_collections>
            <show_named_collections_secrets>1</show_named_collections_secrets>
        </default>
    </users>
    <quotas>
        <default>
            <interval>
                <duration>3600</duration>
                <queries>0</queries>
                <errors>0</errors>
                <result_rows>0</result_rows>
                <read_rows>0</read_rows>
                <execution_time>0</execution_time>
            </interval>
        </default>
    </quotas>
</clickhouse>
```


| Directory                                                 | File                                                                                                                                                                             |
|-----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml)    |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml)    |

В этом примере пользователь по умолчанию (`default`) для простоты настроен без пароля.
На практике такой подход не рекомендуется.

:::note
В этом примере каждый файл `users.xml` идентичен на всех узлах кластера.
:::



## Настройка ClickHouse Keeper {#configure-clickhouse-keeper-nodes}

### Настройка Keeper {#configuration-explanation}

<KeeperConfig />

| Каталог                                                 | Файл                                                                                                                                                                                         |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_1S_2R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation />

<CloudTip />


## Проверка настройки {#test-the-setup}

Убедитесь, что Docker запущен на вашем компьютере.
Запустите кластер командой `docker-compose up` из корневого каталога `cluster_1S_2R`:

```bash
docker-compose up -d
```

Вы увидите, как Docker начнёт загружать образы ClickHouse и Keeper,
а затем запустит контейнеры:

```bash
[+] Running 6/6
 ✔ Network cluster_1s_2r_default   Created
 ✔ Container clickhouse-keeper-03  Started
 ✔ Container clickhouse-keeper-02  Started
 ✔ Container clickhouse-keeper-01  Started
 ✔ Container clickhouse-01         Started
 ✔ Container clickhouse-02         Started
```

Чтобы проверить, что кластер работает, подключитесь к `clickhouse-01` или `clickhouse-02` и выполните
следующий запрос. Ниже показана команда для подключения к первому узлу:


```bash
# Подключение к любому узлу
docker exec -it clickhouse-01 clickhouse-client
```

Если всё прошло успешно, вы увидите приглашение клиента ClickHouse:

```response
cluster_1S_2R node 1 :)
```

Выполните следующий запрос, чтобы проверить, какие топологии кластеров определены для каких хостов:

```sql title="Query"
SELECT 
    cluster,
    shard_num,
    replica_num,
    host_name,
    port
FROM system.clusters;
```

```response title="Response"
   ┌─cluster───────┬─shard_num─┬─replica_num─┬─host_name─────┬─port─┐
1. │ cluster_1S_2R │         1 │           1 │ clickhouse-01 │ 9000 │
2. │ cluster_1S_2R │         1 │           2 │ clickhouse-02 │ 9000 │
3. │ default       │         1 │           1 │ localhost     │ 9000 │
   └───────────────┴───────────┴─────────────┴───────────────┴──────┘
```

Выполните следующий запрос, чтобы проверить состояние кластера ClickHouse Keeper:

```sql title="Query"
SELECT *
FROM system.zookeeper
WHERE path IN ('/', '/clickhouse')
```

```response title="Response"
   ┌─name───────┬─value─┬─path────────┐
1. │ sessions   │       │ /clickhouse │
2. │ task_queue │       │ /clickhouse │
3. │ keeper     │       │ /           │
4. │ clickhouse │       │ /           │
   └────────────┴───────┴─────────────┘
```

<VerifyKeeperStatus />

На этом этапе вы успешно развернули кластер ClickHouse с одним шардом и двумя репликами.
На следующем шаге вы создадите таблицу в кластере.


## Создание базы данных {#creating-a-database}

Теперь, когда вы убедились, что кластер правильно настроен и работает,
вы создадите ту же таблицу, что использовалась в руководстве по примеру набора данных [UK property prices](/getting-started/example-datasets/uk-price-paid).
Набор данных содержит около 30 миллионов строк с ценами на недвижимость
в Англии и Уэльсе с 1995 года.

Подключитесь к клиенту каждого хоста, выполнив следующие команды в отдельных вкладках
или окнах терминала:

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
```

Вы можете выполнить приведенный ниже запрос из clickhouse-client на каждом хосте, чтобы убедиться,
что пока не создано никаких баз данных, кроме стандартных:

```sql title="Запрос"
SHOW DATABASES;
```

```response title="Ответ"
   ┌─name───────────────┐
1. │ INFORMATION_SCHEMA │
2. │ default            │
3. │ information_schema │
4. │ system             │
   └────────────────────┘
```

Из клиента `clickhouse-01` выполните следующий **распределенный** DDL-запрос с использованием
конструкции `ON CLUSTER` для создания новой базы данных с именем `uk`:

```sql
CREATE DATABASE IF NOT EXISTS uk
-- highlight-next-line
ON CLUSTER cluster_1S_2R;
```

Вы можете снова выполнить тот же запрос из клиента на каждом хосте,
чтобы убедиться, что база данных была создана на всем кластере, несмотря на то, что
запрос был выполнен только на `clickhouse-01`:

```sql
SHOW DATABASES;
```

```response
   ┌─name───────────────┐
1. │ INFORMATION_SCHEMA │
2. │ default            │
3. │ information_schema │
4. │ system             │
#highlight-next-line
5. │ uk                 │
   └────────────────────┘
```


## Создание таблицы в кластере {#creating-a-table}

Теперь, когда база данных создана, создайте таблицу в кластере.
Выполните следующий запрос из любого клиента узла:

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_local
--highlight-next-line
ON CLUSTER cluster_1S_2R
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4, 'other' = 0),
    is_new UInt8,
    duration Enum8('freehold' = 1, 'leasehold' = 2, 'unknown' = 0),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
--highlight-next-line
ENGINE = ReplicatedMergeTree
ORDER BY (postcode1, postcode2, addr1, addr2);
```

Обратите внимание, что запрос идентичен запросу, использованному в исходной инструкции `CREATE` из
руководства по примеру набора данных [цен на недвижимость в Великобритании](/getting-started/example-datasets/uk-price-paid),
за исключением конструкции `ON CLUSTER` и использования движка `ReplicatedMergeTree`.

Конструкция `ON CLUSTER` предназначена для распределённого выполнения DDL-запросов (Data Definition Language),
таких как `CREATE`, `DROP`, `ALTER` и `RENAME`, обеспечивая применение этих
изменений схемы на всех узлах кластера.

Движок [`ReplicatedMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication#converting-from-mergetree-to-replicatedmergetree)
работает так же, как обычный движок таблиц `MergeTree`, но также реплицирует данные.

Вы можете выполнить приведённый ниже запрос из клиента `clickhouse-01` или `clickhouse-02`,
чтобы убедиться, что таблица была создана во всём кластере:

```sql title="Запрос"
SHOW TABLES IN uk;
```

```response title="Ответ"
   ┌─name────────────────┐
1. │ uk_price_paid.      │
   └─────────────────────┘
```


## Вставка данных {#inserting-data}

Поскольку набор данных большой и его полная загрузка занимает несколько минут,
для начала мы вставим только небольшое подмножество данных.

Вставьте меньшее подмножество данных с помощью следующего запроса из `clickhouse-01`:

```sql
INSERT INTO uk.uk_price_paid_local
SELECT
    toUInt32(price_string) AS price,
    parseDateTimeBestEffortUS(time) AS date,
    splitByChar(' ', postcode)[1] AS postcode1,
    splitByChar(' ', postcode)[2] AS postcode2,
    transform(a, ['T', 'S', 'D', 'F', 'O'], ['terraced', 'semi-detached', 'detached', 'flat', 'other']) AS type,
    b = 'Y' AS is_new,
    transform(c, ['F', 'L', 'U'], ['freehold', 'leasehold', 'unknown']) AS duration,
    addr1,
    addr2,
    street,
    locality,
    town,
    district,
    county
FROM url(
    'http://prod1.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv',
    'CSV',
    'uuid_string String,
    price_string String,
    time String,
    postcode String,
    a String,
    b String,
    c String,
    addr1 String,
    addr2 String,
    street String,
    locality String,
    town String,
    district String,
    county String,
    d String,
    e String'
) LIMIT 10000
SETTINGS max_http_get_redirects=10;
```

Обратите внимание, что данные полностью реплицируются на каждом хосте:

```sql
-- clickhouse-01
SELECT count(*)
FROM uk.uk_price_paid_local

--   ┌─count()─┐
-- 1.│   10000 │
--   └─────────┘

-- clickhouse-02
SELECT count(*)
FROM uk.uk_price_paid_local

--   ┌─count()─┐
-- 1.│   10000 │
--   └─────────┘
```

Чтобы продемонстрировать, что происходит при отказе одного из хостов, создайте простую тестовую базу данных
и тестовую таблицу с любого из хостов:

```sql
CREATE DATABASE IF NOT EXISTS test ON CLUSTER cluster_1S_2R;
CREATE TABLE test.test_table ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `name` String
)
ENGINE = ReplicatedMergeTree
ORDER BY id;
```

Как и в случае с таблицей `uk_price_paid`, данные можно вставлять с любого хоста:

```sql
INSERT INTO test.test_table (id, name) VALUES (1, 'Clicky McClickface');
```

Но что произойдёт, если один из хостов будет недоступен? Чтобы смоделировать эту ситуацию, остановите
`clickhouse-01`, выполнив команду:

```bash
docker stop clickhouse-01
```

Убедитесь, что хост остановлен, выполнив команду:

```bash
docker-compose ps
```

```response title="Ответ"
NAME                   IMAGE                                        COMMAND            SERVICE                CREATED          STATUS          PORTS
clickhouse-02          clickhouse/clickhouse-server:latest          "/entrypoint.sh"   clickhouse-02          X minutes ago    Up X minutes    127.0.0.1:8124->8123/tcp, 127.0.0.1:9001->9000/tcp
clickhouse-keeper-01   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-01   X minutes ago    Up X minutes    127.0.0.1:9181->9181/tcp
clickhouse-keeper-02   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-02   X minutes ago    Up X minutes    127.0.0.1:9182->9181/tcp
clickhouse-keeper-03   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-03   X minutes ago    Up X minutes    127.0.0.1:9183->9181/tcp
```

Теперь, когда `clickhouse-01` остановлен, вставьте ещё одну строку данных в тестовую таблицу
и выполните запрос к ней:

```sql
INSERT INTO test.test_table (id, name) VALUES (2, 'Alexey Milovidov');
SELECT * FROM test.test_table;
```


```response title="Ответ"
   ┌─id─┬─name───────────────┐
1. │  1 │ Clicky McClickface │
2. │  2 │ Alexey Milovidov   │
   └────┴────────────────────┘
```

Теперь перезапустите `clickhouse-01` следующей командой (для проверки можно снова выполнить `docker-compose ps`):

```sql
docker start clickhouse-01
```

Выполните запрос к тестовой таблице снова из `clickhouse-01` после запуска `docker exec -it clickhouse-01 clickhouse-client`:

```sql title="Запрос"
SELECT * FROM test.test_table
```

```response title="Ответ"
   ┌─id─┬─name───────────────┐
1. │  1 │ Clicky McClickface │
2. │  2 │ Alexey Milovidov   │
   └────┴────────────────────┘
```

Если на данном этапе вы хотите загрузить полный набор данных о ценах на недвижимость в Великобритании для экспериментов, выполните следующие запросы:

```sql
TRUNCATE TABLE uk.uk_price_paid_local ON CLUSTER cluster_1S_2R;
INSERT INTO uk.uk_price_paid_local
SELECT
    toUInt32(price_string) AS price,
    parseDateTimeBestEffortUS(time) AS date,
    splitByChar(' ', postcode)[1] AS postcode1,
    splitByChar(' ', postcode)[2] AS postcode2,
    transform(a, ['T', 'S', 'D', 'F', 'O'], ['terraced', 'semi-detached', 'detached', 'flat', 'other']) AS type,
    b = 'Y' AS is_new,
    transform(c, ['F', 'L', 'U'], ['freehold', 'leasehold', 'unknown']) AS duration,
    addr1,
    addr2,
    street,
    locality,
    town,
    district,
    county
FROM url(
    'http://prod1.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv',
    'CSV',
    'uuid_string String,
    price_string String,
    time String,
    postcode String,
    a String,
    b String,
    c String,
    addr1 String,
    addr2 String,
    street String,
    locality String,
    town String,
    district String,
    county String,
    d String,
    e String'
    ) SETTINGS max_http_get_redirects=10;
```

Выполните запрос к таблице из `clickhouse-02` или `clickhouse-01`:

```sql title="Запрос"
SELECT count(*) FROM uk.uk_price_paid_local;
```

```response title="Ответ"
   ┌──count()─┐
1. │ 30212555 │ -- 30,21 млн
   └──────────┘
```

</VerticalStepper>


## Заключение {#conclusion}

Преимущество данной топологии кластера заключается в том, что при наличии двух реплик
ваши данные хранятся на двух отдельных хостах. Если один хост выходит из строя, другая реплика
продолжает обслуживать данные без потерь. Это устраняет единые точки
отказа на уровне хранилища.

Когда один хост выходит из строя, оставшаяся реплика по-прежнему способна:

- Обрабатывать запросы на чтение без прерываний
- Принимать новые записи (в зависимости от настроек согласованности)
- Поддерживать доступность сервиса для приложений

Когда вышедший из строя хост возвращается в работу, он способен:

- Автоматически синхронизировать недостающие данные с работающей реплики
- Возобновить нормальную работу без ручного вмешательства
- Быстро восстановить полную избыточность

В следующем примере мы рассмотрим, как настроить кластер с двумя шардами, но
только с одной репликой.
