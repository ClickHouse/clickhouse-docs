---
slug: /architecture/cluster-deployment
sidebar_label: 'Репликация и масштабирование'
sidebar_position: 100
title: 'Репликация и масштабирование'
description: 'Из этого руководства вы узнаете, как развернуть простой кластер ClickHouse.'
doc_type: 'guide'
keywords: ['cluster deployment', 'replication', 'sharding', 'high availability', 'scalability']
---

import Image from '@theme/IdealImage';
import SharedReplicatedArchitecture from '@site/static/images/deployment-guides/replication-sharding-examples/both.png';
import ConfigExplanation from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_config_explanation.mdx';
import ListenHost from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_listen_host.mdx';
import KeeperConfig from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_keeper_config.mdx';
import KeeperConfigExplanation from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_keeper_explanation.mdx';
import VerifyKeeperStatus from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_verify_keeper_using_mntr.mdx';
import DedicatedKeeperServers from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_dedicated_keeper_servers.mdx';
import ExampleFiles from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_working_example.mdx';
import CloudTip from '@site/docs/deployment-guides/replication-sharding-examples/_snippets/_cloud_tip.mdx';

> В этом примере вы узнаете, как настроить простой кластер ClickHouse, который
> одновременно реплицируется и масштабируется. Он состоит из двух шардов и двух
> реплик и использует кластер ClickHouse Keeper из трёх узлов для координации и
> поддержания кворума в кластере.

Архитектура кластера, который вы будете настраивать, показана ниже:

<Image img={SharedReplicatedArchitecture} size="md" alt="Схема архитектуры для 2 шардов и 1 реплики" />

<DedicatedKeeperServers />


## Предварительные требования {#prerequisites}

- Вы ранее настраивали [локальный сервер ClickHouse](/install)
- Вы знакомы с базовыми концепциями конфигурации ClickHouse, такими как [конфигурационные файлы](/operations/configuration-files)
- У вас установлен Docker

<VerticalStepper level="h2">


## Настройка структуры каталогов и тестовой среды {#set-up}

<ExampleFiles />

В этом руководстве для настройки кластера ClickHouse используется [Docker Compose](https://docs.docker.com/compose/). Эту конфигурацию можно адаптировать для работы на отдельных локальных машинах, виртуальных машинах или облачных инстансах.

Выполните следующие команды для создания структуры каталогов для этого примера:

```bash
mkdir cluster_2S_2R
cd cluster_2S_2R

```


# Создание каталогов clickhouse-keeper

for i in {01..03}; do
mkdir -p fs/volumes/clickhouse-keeper-${i}/etc/clickhouse-keeper
done


# Создайте директории clickhouse-server

for i in {01..04}; do
mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server
done

```

Добавьте следующий файл `docker-compose.yml` в директорию `clickhouse-cluster`:

```


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
  clickhouse-03:
    image: "clickhouse/clickhouse-server:latest"
    user: "101:101"
    container_name: clickhouse-03
    hostname: clickhouse-03
    volumes:
      - ${PWD}/fs/volumes/clickhouse-03/etc/clickhouse-server/config.d/config.xml:/etc/clickhouse-server/config.d/config.xml
      - ${PWD}/fs/volumes/clickhouse-03/etc/clickhouse-server/users.d/users.xml:/etc/clickhouse-server/users.d/users.xml
    ports:
      - "127.0.0.1:8125:8123"
      - "127.0.0.1:9002:9000"
    depends_on:
      - clickhouse-keeper-01
      - clickhouse-keeper-02
      - clickhouse-keeper-03
  clickhouse-04:
    image: "clickhouse/clickhouse-server:latest"
    user: "101:101"
    container_name: clickhouse-04
    hostname: clickhouse-04
    volumes:
      - ${PWD}/fs/volumes/clickhouse-04/etc/clickhouse-server/config.d/config.xml:/etc/clickhouse-server/config.d/config.xml
      - ${PWD}/fs/volumes/clickhouse-04/etc/clickhouse-server/users.d/users.xml:/etc/clickhouse-server/users.d/users.xml
    ports:
      - "127.0.0.1:8126:8123"
      - "127.0.0.1:9003:9000"
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
```

Создайте следующие подкаталоги и файлы:

```bash
for i in {01..04}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation />


## Настройка узлов ClickHouse {#configure-clickhouse-servers}

### Настройка сервера {#server-setup}

Теперь измените каждый пустой конфигурационный файл `config.xml`, расположенный в
`fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d`. Выделенные
ниже строки необходимо изменить для каждого узла:

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
    <display_name>cluster_2S_2R узел 1</display_name>
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
        <cluster_2S_2R>
            <shard>
                <internal_replication>true</internal_replication>
                <replica>
                    <host>clickhouse-01</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>clickhouse-03</host>
                    <port>9000</port>
                </replica>
            </shard>
            <shard>
                <internal_replication>true</internal_replication>
                <replica>
                    <host>clickhouse-02</host>
                    <port>9000</port>
                </replica>
                <replica>
                    <host>clickhouse-04</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_2S_2R>
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
    </macros>
    <!--highlight-end-->
</clickhouse>
```

| Директория                                                | Файл                                                                                                                                                                             |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-03/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-03/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-04/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-04/etc/clickhouse-server/config.d/config.xml) |

Каждый раздел приведенного выше конфигурационного файла подробно описан ниже.

#### Сеть и логирование {#networking}

<ListenHost />

Конфигурация логирования определяется в блоке `<logger>`. Данная конфигурация создает
отладочный лог, который будет ротироваться при достижении размера 1000M три раза:


```xml
<logger>
   <level>debug</level>
   <log>/var/log/clickhouse-server/clickhouse-server.log</log>
   <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
   <size>1000M</size>
   <count>3</count>
</logger>
```

Дополнительную информацию о настройке логирования см. в комментариях в
стандартном [файле конфигурации](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml) ClickHouse.

#### Конфигурация кластера {#cluster-config}

Конфигурация кластера задается в блоке `<remote_servers>`.
Здесь определено имя кластера `cluster_2S_2R`.

Блок `<cluster_2S_2R></cluster_2S_2R>` определяет структуру кластера
с помощью настроек `<shard></shard>` и `<replica></replica>` и служит
шаблоном для распределенных DDL-запросов — запросов, которые выполняются по всему
кластеру с использованием конструкции `ON CLUSTER`. По умолчанию распределенные DDL-запросы
разрешены, но их также можно отключить с помощью настройки `allow_distributed_ddl_queries`.

Параметр `internal_replication` установлен в true, чтобы данные записывались только на одну из реплик.

```xml
<remote_servers>
   <!-- имя кластера (не должно содержать точек) -->
  <cluster_2S_2R>
      <!-- <allow_distributed_ddl_queries>false</allow_distributed_ddl_queries> -->
      <shard>
          <!-- Необязательно. Записывать ли данные только на одну из реплик. По умолчанию: false (записывать данные на все реплики). -->
          <internal_replication>true</internal_replication>
          <replica>
              <host>clickhouse-01</host>
              <port>9000</port>
          </replica>
          <replica>
              <host>clickhouse-03</host>
              <port>9000</port>
          </replica>
      </shard>
      <shard>
          <internal_replication>true</internal_replication>
          <replica>
              <host>clickhouse-02</host>
              <port>9000</port>
          </replica>
          <replica>
              <host>clickhouse-04</host>
              <port>9000</port>
          </replica>
      </shard>
  </cluster_2S_2R>
</remote_servers>
```

Секция `<cluster_2S_2R></cluster_2S_2R>` определяет структуру кластера
и служит шаблоном для распределенных DDL-запросов — запросов, которые выполняются
по всему кластеру с использованием конструкции `ON CLUSTER`.

#### Конфигурация Keeper {#keeper-config-explanation}

Секция `<ZooKeeper>` указывает ClickHouse, где запущен ClickHouse Keeper (или ZooKeeper).
Поскольку мы используем кластер ClickHouse Keeper, необходимо указать каждый узел `<node>` кластера
вместе с его именем хоста и номером порта, используя теги `<host>` и `<port>` соответственно.

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
</macros>
```

### Конфигурация пользователей {#cluster-configuration}

Теперь измените каждый пустой файл конфигурации `users.xml`, расположенный в
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

В этом примере для простоты пользователь по умолчанию настроен без пароля.
На практике такой подход не рекомендуется.

:::note
В этом примере каждый файл `users.xml` одинаков для всех узлов кластера.
:::


## Настройка ClickHouse Keeper {#configure-clickhouse-keeper-nodes}

Далее необходимо настроить ClickHouse Keeper, который используется для координации.

### Настройка Keeper {#configuration-explanation}

<KeeperConfig />

| Директория                                              | Файл                                                                                                                                                                                         |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation />

<CloudTip />


## Проверка установки {#test-the-setup}

Убедитесь, что Docker запущен на вашем компьютере.
Запустите кластер командой `docker-compose up` из корневого каталога `cluster_2S_2R`:

```bash
docker-compose up -d
```

Вы увидите, как Docker начнёт загружать образы ClickHouse и Keeper,
а затем запустит контейнеры:

```bash
[+] Running 8/8
 ✔ Network   cluster_2s_2r_default     Created
 ✔ Container clickhouse-keeper-03      Started
 ✔ Container clickhouse-keeper-02      Started
 ✔ Container clickhouse-keeper-01      Started
 ✔ Container clickhouse-01             Started
 ✔ Container clickhouse-02             Started
 ✔ Container clickhouse-04             Started
 ✔ Container clickhouse-03             Started
```

Чтобы проверить, что кластер работает, подключитесь к любому узлу и выполните
следующий запрос. Ниже показана команда для подключения к первому узлу:


```bash
# Подключение к любому узлу
docker exec -it clickhouse-01 clickhouse-client
```

Если подключение прошло успешно, вы увидите приглашение командной строки клиента ClickHouse:

```response
cluster_2S_2R node 1 :)
```

Выполните следующий запрос, чтобы узнать, какие топологии кластера определены для каких хостов:

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
1. │ cluster_2S_2R │         1 │           1 │ clickhouse-01 │ 9000 │
2. │ cluster_2S_2R │         1 │           2 │ clickhouse-03 │ 9000 │
3. │ cluster_2S_2R │         2 │           1 │ clickhouse-02 │ 9000 │
4. │ cluster_2S_2R │         2 │           2 │ clickhouse-04 │ 9000 │
5. │ default       │         1 │           1 │ localhost     │ 9000 │
   └───────────────┴───────────┴─────────────┴───────────────┴──────┘
```

Выполните следующий запрос, чтобы проверить статус кластера ClickHouse Keeper:

```sql title="Query"
SELECT *
FROM system.zookeeper
WHERE path IN ('/', '/clickhouse')
```

```response title="Response"
   ┌─name───────┬─value─┬─path────────┐
1. │ task_queue │       │ /clickhouse │
2. │ sessions   │       │ /clickhouse │
3. │ keeper     │       │ /           │
4. │ clickhouse │       │ /           │
   └────────────┴───────┴─────────────┘
```

<VerifyKeeperStatus />

На этом этапе вы успешно развернули кластер ClickHouse с двумя шардами и двумя репликами.
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
docker exec -it clickhouse-03 clickhouse-client
docker exec -it clickhouse-04 clickhouse-client
```

Вы можете выполнить приведенный ниже запрос из clickhouse-client на каждом хосте, чтобы убедиться, что пока не создано никаких баз данных,
кроме стандартных:

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
конструкции `ON CLUSTER` для создания новой базы данных `uk`:

```sql
CREATE DATABASE IF NOT EXISTS uk
-- highlight-next-line
ON CLUSTER cluster_2S_2R;
```

Вы можете снова выполнить тот же запрос из клиента на каждом хосте,
чтобы убедиться, что база данных была создана на всем кластере, несмотря на то, что
запрос выполнялся только из `clickhouse-01`:

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

Теперь, когда база данных создана, следующим шагом будет создание реплицируемой таблицы.

Выполните следующий запрос из клиента любого из хостов:

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_local
--highlight-next-line
ON CLUSTER cluster_2S_2R
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
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{database}/{table}/{shard}', '{replica}')
ORDER BY (postcode1, postcode2, addr1, addr2);
```

Обратите внимание, что этот запрос идентичен запросу, использованному в исходной инструкции `CREATE` из руководства по примеру набора данных
[UK property prices](/getting-started/example-datasets/uk-price-paid),
за исключением конструкции `ON CLUSTER` и использования движка `ReplicatedMergeTree`.

Конструкция `ON CLUSTER` предназначена для распределённого выполнения DDL-запросов (Data Definition Language),
таких как `CREATE`, `DROP`, `ALTER` и `RENAME`, обеспечивая применение этих
изменений схемы на всех узлах кластера.

Движок [`ReplicatedMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication#converting-from-mergetree-to-replicatedmergetree)
работает так же, как обычный движок таблиц `MergeTree`, но также реплицирует данные.
Он требует указания двух параметров:

- `zoo_path`: путь Keeper/ZooKeeper к метаданным таблицы.
- `replica_name`: имя реплики таблицы.

<br />

Параметр `zoo_path` может быть установлен в любое выбранное вами значение, однако рекомендуется следовать
соглашению об использовании префикса

```text
/clickhouse/tables/{shard}/{database}/{table}
```

где:

- `{database}` и `{table}` будут заменены автоматически.
- `{shard}` и `{replica}` — это макросы, которые были [определены](#macros-config-explanation)
  ранее в файле `config.xml` каждого узла ClickHouse.

Вы можете выполнить приведённый ниже запрос из клиента каждого хоста, чтобы убедиться, что таблица была создана во всём кластере:

```sql title="Запрос"
SHOW TABLES IN uk;
```

```response title="Ответ"
   ┌─name────────────────┐
1. │ uk_price_paid_local │
   └─────────────────────┘
```


## Вставка данных в распределённую таблицу {#inserting-data-using-distributed}

Для вставки данных в таблицу нельзя использовать `ON CLUSTER`, так как эта конструкция
не применяется к DML-запросам (Data Manipulation Language — язык манипулирования данными), таким как `INSERT`, `UPDATE`
и `DELETE`. Для вставки данных необходимо использовать
движок таблиц [`Distributed`](/engines/table-engines/special/distributed).
Как вы узнали из [руководства](/architecture/horizontal-scaling) по настройке кластера с 2 шардами и 1 репликой, распределённые таблицы — это таблицы, которые имеют доступ к шардам, расположенным на разных
хостах, и определяются с помощью движка таблиц `Distributed`.
Распределённая таблица выступает в качестве интерфейса ко всем шардам в кластере.

С любого из клиентов хостов выполните следующий запрос для создания распределённой таблицы
на основе существующей реплицируемой таблицы, которую мы создали на предыдущем шаге:

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
ON CLUSTER cluster_2S_2R
ENGINE = Distributed('cluster_2S_2R', 'uk', 'uk_price_paid_local', rand());
```

На каждом хосте вы теперь увидите следующие таблицы в базе данных `uk`:

```sql
   ┌─name──────────────────────┐
1. │ uk_price_paid_distributed │
2. │ uk_price_paid_local       │
   └───────────────────────────┘
```

Данные можно вставить в таблицу `uk_price_paid_distributed` с любого из
клиентов хостов, используя следующий запрос:

```sql
INSERT INTO uk.uk_price_paid_distributed
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

Выполните следующий запрос, чтобы убедиться, что вставленные данные были равномерно распределены
по узлам нашего кластера:

```sql
SELECT count(*)
FROM uk.uk_price_paid_distributed;

SELECT count(*) FROM uk.uk_price_paid_local;
```

```response
   ┌──count()─┐
1. │ 30212555 │ -- 30,21 миллиона
   └──────────┘

   ┌──count()─┐
1. │ 15105983 │ -- 15,11 миллиона
   └──────────┘
```

</VerticalStepper>


## Заключение {#conclusion}

Преимущество данной топологии кластера с 2 шардами и 2 репликами заключается в том, что она обеспечивает как масштабируемость, так и отказоустойчивость.
Данные распределяются по отдельным хостам, что снижает требования к хранилищу и операциям ввода-вывода на узел, при этом запросы обрабатываются параллельно на обоих шардах для повышения производительности и эффективности использования памяти.
Важно отметить, что кластер может выдержать потерю одного узла и продолжить обслуживание запросов без прерывания, поскольку каждый шард имеет резервную реплику на другом узле.

Основным недостатком данной топологии кластера является увеличенная нагрузка на хранилище — она требует вдвое больше дискового пространства по сравнению с конфигурацией без реплик, поскольку каждый шард дублируется.
Кроме того, хотя кластер может пережить отказ одного узла, одновременная потеря двух узлов может сделать кластер неработоспособным в зависимости от того, какие узлы откажут и как распределены шарды.
Данная топология обеспечивает баланс между доступностью и стоимостью, что делает её подходящей для производственных сред, где требуется определённый уровень отказоустойчивости без затрат на более высокие коэффициенты репликации.

Чтобы узнать, как ClickHouse Cloud обрабатывает запросы, обеспечивая масштабируемость и отказоустойчивость, см. раздел [«Параллельные реплики»](/deployment-guides/parallel-replicas).
