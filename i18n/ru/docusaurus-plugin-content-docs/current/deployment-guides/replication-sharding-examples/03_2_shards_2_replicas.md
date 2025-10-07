---
'slug': '/architecture/cluster-deployment'
'sidebar_label': 'Репликация + Масштабирование'
'sidebar_position': 100
'title': 'Репликация + Масштабирование'
'description': 'Пройдя через этот учебник, вы научитесь настраивать простой кластер
  ClickHouse.'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import SharedReplicatedArchitecture from '@site/static/images/deployment-guides/replication-sharding-examples/both.png';
import ConfigExplanation from '@site/i18n/ru/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_config_explanation.mdx';
import ListenHost from '@site/i18n/ru/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_listen_host.mdx';
import KeeperConfig from '@site/i18n/ru/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_keeper_config.mdx';
import KeeperConfigExplanation from '@site/i18n/ru/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_keeper_explanation.mdx';
import VerifyKeeperStatus from '@site/i18n/ru/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_verify_keeper_using_mntr.mdx';
import DedicatedKeeperServers from '@site/i18n/ru/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_dedicated_keeper_servers.mdx';
import ExampleFiles from '@site/i18n/ru/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_working_example.mdx';
import CloudTip from '@site/i18n/ru/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_cloud_tip.mdx';

> В этом примере вы научитесь настраивать простой кластер ClickHouse, который как реплицирует, так и масштабируется. Он состоит из двух шардов и двух реплик с 3-узловым кластером ClickHouse Keeper для управления координацией и поддержанием кворума в кластере.

Архитектура кластера, который вы будете настраивать, показана ниже:

<Image img={SharedReplicatedArchitecture} size='md' alt='Схема архитектуры для 2 шардов и 1 реплики' />

<DedicatedKeeperServers/>

## Предварительные условия {#prerequisites}

- Вы уже настраивали [локальный сервер ClickHouse](/install)
- Вы знакомы с основными концепциями конфигурации ClickHouse, такими как [файлы конфигурации](/operations/configuration-files)
- У вас на машине установлен docker

<VerticalStepper level="h2">

## Установить структуру каталогов и тестовую среду {#set-up}

<ExampleFiles/>

В этом уроке вы будете использовать [Docker compose](https://docs.docker.com/compose/) для настройки кластера ClickHouse. Эта настройка может быть изменена для работы на отдельных локальных машинах, виртуальных машинах или облачных инстансах.

Выполните следующие команды для настройки структуры каталогов для этого примера:

```bash
mkdir cluster_2S_2R
cd cluster_2S_2R


# Create clickhouse-keeper directories
for i in {01..03}; do
  mkdir -p fs/volumes/clickhouse-keeper-${i}/etc/clickhouse-keeper
done


# Create clickhouse-server directories
for i in {01..04}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server
done
```

Добавьте следующий файл `docker-compose.yml` в директорию `clickhouse-cluster`:

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

Создайте следующие подпапки и файлы:

```bash
for i in {01..04}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation/>

## Настройка узлов ClickHouse {#configure-clickhouse-servers}

### Настройка сервера {#server-setup}

Теперь измените каждый пустой файл конфигурации `config.xml`, расположенный в `fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d`. Строки, выделенные ниже, необходимо изменить, чтобы они были специфичны для каждого узла:

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
    <display_name>cluster_2S_2R node 1</display_name>
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

| Директория                                                 | Файл                                                                                                                                                                              |
|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml)  |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml)  |
| `fs/volumes/clickhouse-03/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-03/etc/clickhouse-server/config.d/config.xml)  |
| `fs/volumes/clickhouse-04/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-04/etc/clickhouse-server/config.d/config.xml)  |

Каждый раздел вышеуказанного файла конфигурации объясняется более подробно ниже.

#### Сетевая конфигурация и логирование {#networking}

<ListenHost/>

Конфигурация логирования определяется в блоке `<logger>`. Эта примерная конфигурация дает вам отладочный журнал, который будет рождаться при достижении 1000M трижды:

```xml
<logger>
   <level>debug</level>
   <log>/var/log/clickhouse-server/clickhouse-server.log</log>
   <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
   <size>1000M</size>
   <count>3</count>
</logger>
```

Для получения дополнительной информации о конфигурации логирования смотрите комментарии, включенные в
стандартный файл конфигурации ClickHouse [configuration file](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml).

#### Конфигурация кластера {#cluster-config}

Конфигурация кластера устанавливается в блоке `<remote_servers>`. 
Здесь задается имя кластера `cluster_2S_2R`.

Блок `<cluster_2S_2R></cluster_2S_2R>` определяет структуру кластера,
используя настройки `<shard></shard>` и `<replica></replica>`, и выступает в качестве 
темплейта для распределенных DDL запросов, которые выполняются по всему 
кластеру с использованием оператора `ON CLUSTER`. По умолчанию распределенные DDL запросы
разрешены, но также могут быть отключены с помощью настройки `allow_distributed_ddl_queries`.

`internal_replication` установлен в true, чтобы данные записывались только в одну из реплик.

```xml
<remote_servers>
   <!-- cluster name (should not contain dots) -->
  <cluster_2S_2R>
      <!-- <allow_distributed_ddl_queries>false</allow_distributed_ddl_queries> -->
      <shard>
          <!-- Optional. Whether to write data to just one of the replicas. Default: false (write data to all replicas). -->
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

Раздел `<cluster_2S_2R></cluster_2S_2R>` определяет структуру кластера
и выступает в качестве шаблона для распределенных DDL запросов, которые выполняются
по всему кластеру с использованием оператора `ON CLUSTER`. 

#### Конфигурация Keeper {#keeper-config-explanation}

Секция `<ZooKeeper>` указывает ClickHouse, где работает ClickHouse Keeper (или ZooKeeper).
Поскольку мы используем кластер ClickHouse Keeper, каждый `<node>` кластера должен быть указан, 
вместе с его именем хоста и номером порта, используя теги `<host>` и `<port>` соответственно.

Настройка ClickHouse Keeper объясняется на следующем шаге урока.

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
Хотя возможно запустить ClickHouse Keeper на том же сервере, что и сервер ClickHouse,
в производственных средах мы настоятельно рекомендуем, чтобы ClickHouse Keeper работал на выделенных хостах.
:::

#### Конфигурация макросов {#macros-config-explanation}

Кроме того, секция `<macros>` используется для определения параметров замещения для
реплицируемых таблиц. Они перечислены в `system.macros` и позволяют использовать замещения
такие как `{shard}` и `{replica}` в запросах.

```xml
<macros>
   <shard>01</shard>
   <replica>01</replica>
</macros>
```

### Конфигурация пользователей {#cluster-configuration}

Теперь измените каждый пустой файл конфигурации `users.xml`, расположенный в
`fs/volumes/clickhouse-{}/etc/clickhouse-server/users.d` следующим образом:

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

В этом примере пользователь по умолчанию настраивается без пароля для простоты.
На практике это не рекомендуется.

:::note
В этом примере каждый файл `users.xml` идентичен для всех узлов в кластере.
:::

## Настройка ClickHouse Keeper {#configure-clickhouse-keeper-nodes}

Далее вы настроите ClickHouse Keeper, который используется для координации.

### Настройка Keeper {#configuration-explanation}

<KeeperConfig/>

| Директория                                                        | Файл                                                                                                                                                                                         |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_2R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation/>

<CloudTip/>

## Протестируйте настройку {#test-the-setup}

Убедитесь, что docker работает на вашем компьютере.
Запустите кластер, используя команду `docker-compose up` из корневого каталога директории `cluster_2S_2R`:

```bash
docker-compose up -d
```

Вы должны увидеть, как docker начинает загружать образы ClickHouse и Keeper, 
а затем запускать контейнеры:

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

Чтобы убедиться, что кластер работает, подключитесь к любому из узлов и выполните 
следующий запрос. Команда для подключения к первому узлу показана:

```bash

# Connect to any node
docker exec -it clickhouse-01 clickhouse-client
```

Если все прошло успешно, вы увидите подсказку клиента ClickHouse:

```response
cluster_2S_2R node 1 :)
```

Выполните следующий запрос, чтобы проверить, какие топологии кластера определены для каких
хостов:

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

<VerifyKeeperStatus/>

Таким образом, вы успешно настроили кластер ClickHouse с двумя шардми и двумя репликами.
На следующем шаге вы создадите таблицу в кластере.

## Создать базу данных {#creating-a-database}

Теперь, когда вы убедились, что кластер правильно настроен и работает, 
вы воссоздадите ту же таблицу, что использовалась в учебнике по примеру набора данных [Цены на недвижимость в Великобритании](/getting-started/example-datasets/uk-price-paid).
Она состоит примерно из 30 миллионов строк цен, уплаченных за недвижимость в Англии и Уэльсе с 1995 года.

Подключитесь к клиенту каждого хоста, выполнив каждую из следующих команд из отдельных терминалов
вкладок или окон:

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
docker exec -it clickhouse-03 clickhouse-client
docker exec -it clickhouse-04 clickhouse-client
```

Вы можете выполнить запрос ниже из клиента clickhouse каждого хоста, чтобы подтвердить, что базы данных еще не созданы,
кроме стандартных:

```sql title="Query"
SHOW DATABASES;
```

```response title="Response"
   ┌─name───────────────┐
1. │ INFORMATION_SCHEMA │
2. │ default            │
3. │ information_schema │
4. │ system             │
   └────────────────────┘
```

Из клиента `clickhouse-01` выполните следующий **распределенный** DDL запрос с использованием
оператора `ON CLUSTER`, чтобы создать новую базу данных под названием `uk`:

```sql
CREATE DATABASE IF NOT EXISTS uk 
-- highlight-next-line
ON CLUSTER cluster_2S_2R;
```

Вы снова можете выполнить тот же запрос из клиента каждого хоста 
чтобы подтвердить, что база данных была создана по всему кластеру, несмотря на выполнение
запроса только из `clickhouse-01`:

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

## Создать распределенную таблицу в кластере {#creating-a-table}

Теперь, когда база данных была создана, следующим шагом будет создание распределенной таблицы.
Распределенные таблицы - это таблицы, которые имеют доступ к шардам, расположенным на различных
узлах и определяются с помощью движка таблицы `Distributed`. Распределенная таблица
служит интерфейсом через все шард в кластере.

Выполните следующий запрос из любого клиента хоста:

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

Обратите внимание, что он идентичен запросу, использованному в первоначальном операторе `CREATE` учебника по 
примеру набора данных [Цены на недвижимость в Великобритании](/getting-started/example-datasets/uk-price-paid),
за исключением оператора `ON CLUSTER` и использования движка `ReplicatedMergeTree`.

Оператор `ON CLUSTER` предназначен для распределенного выполнения DDL (язык определения данных)
запросов, таких как `CREATE`, `DROP`, `ALTER` и `RENAME`, гарантируя, что эти 
изменения схемы будут применены на всех узлах в кластере.

Движок [`ReplicatedMergeTree`](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replication#converting-from-mergetree-to-replicatedmergetree)
работает так же, как и обычный движок таблицы `MergeTree`, но также будет реплицировать данные. 
Он требует указания двух параметров:

- `zoo_path`: Путь Keeper/ZooKeeper к метаданным таблицы.
- `replica_name`: Имя реплики таблицы.

<br/>

Параметр `zoo_path` может быть установлен на любое значение, которое вы выберете, хотя рекомендуется следовать 
конвенции использования префикса

```text
/clickhouse/tables/{shard}/{database}/{table}
```

где:
- `{database}` и `{table}` будут автоматически заменены. 
- `{shard}` и `{replica}` - это макросы, которые были [определены](#macros-config-explanation) 
   ранее в файле `config.xml` каждого узла ClickHouse.

Вы можете выполнить запрос ниже из клиента каждого хоста, чтобы подтвердить, что таблица была создана по всему кластеру:

```sql title="Query"
SHOW TABLES IN uk;
```

```response title="Response"
   ┌─name────────────────┐
1. │ uk_price_paid_local │
   └─────────────────────┘
```

## Вставка данных в распределенную таблицу {#inserting-data-using-distributed}

Чтобы вставить данные в распределированную таблицу, оператор `ON CLUSTER` не может быть использован, так как он не применяется к DML (язык манипуляции данными) запросам, таким как `INSERT`, `UPDATE`,
и `DELETE`. Для вставки данных необходимо использовать 
[`Distributed`](/engines/table-engines/special/distributed) движок таблицы.

Из любого клиента хоста выполните следующий запрос, чтобы создать распределенную таблицу
с использованием существующей таблицы, которую мы создали ранее с `ON CLUSTER` и использованием
`ReplicatedMergeTree`:

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

Данные могут быть вставлены в таблицу `uk_price_paid_distributed` из любого клиента хоста с использованием следующего запроса:

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

Выполните следующий запрос, чтобы подтвердить, что вставленные данные были равномерно распределены
по узлам нашего кластера:

```sql
SELECT count(*)
FROM uk.uk_price_paid_distributed;

SELECT count(*) FROM uk.uk_price_paid_local;
```

```response
   ┌──count()─┐
1. │ 30212555 │ -- 30.21 million
   └──────────┘

   ┌──count()─┐
1. │ 15105983 │ -- 15.11 million
   └──────────┘
```

</VerticalStepper>
