---
'slug': '/architecture/horizontal-scaling'
'sidebar_label': 'Масштабирование'
'sidebar_position': 10
'title': 'Масштабирование'
'description': 'Страница, описывающая пример архитектуры, разработанной для обеспечения
  масштабируемости'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';
import ShardingArchitecture from '@site/static/images/deployment-guides/replication-sharding-examples/sharding.png';
import ConfigFileNote from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_config-files.md';
import KeeperConfigFileNote from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_keeper-config-files.md';
import ConfigExplanation from '@site/i18n/ru/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_config_explanation.mdx';
import ListenHost from '@site/i18n/ru/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_listen_host.mdx';
import ServerParameterTable from '@site/i18n/ru/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_server_parameter_table.mdx';
import KeeperConfig from '@site/i18n/ru/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_keeper_config.mdx';
import KeeperConfigExplanation from '@site/i18n/ru/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_keeper_explanation.mdx';
import VerifyKeeperStatus from '@site/i18n/ru/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_verify_keeper_using_mntr.mdx';
import DedicatedKeeperServers from '@site/i18n/ru/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_dedicated_keeper_servers.mdx';
import ExampleFiles from '@site/i18n/ru/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_working_example.mdx';
import CloudTip from '@site/i18n/ru/docusaurus-plugin-content-docs/current/deployment-guides/replication-sharding-examples/_snippets/_cloud_tip.mdx';

> В этом примере вы научитесь настраивать простой кластер ClickHouse, который масштабируется. Настроено пять серверов. Два из них используются для шардирования данных. Остальные три сервера используются для координации.

Архитектура кластера, который вы будете настраивать, показана ниже:

<Image img={ShardingArchitecture} size='md' alt='Схема архитектуры для 2 шардов и 1 реплики' />

<DedicatedKeeperServers/>

## Предварительные требования {#pre-requisites}

- Вы ранее настроили [локальный сервер ClickHouse](/install)
- Вы знакомы с основными концепциями конфигурации ClickHouse, такими как [файлы конфигурации](/operations/configuration-files)
- У вас установлен Docker на вашем компьютере

<VerticalStepper level="h2">

## Настройка структуры каталогов и тестовой среды {#set-up}

<ExampleFiles/>

В этом учебнике вы будете использовать [Docker compose](https://docs.docker.com/compose/) для настройки кластера ClickHouse. Эта настройка может быть изменена для работы на отдельных локальных машинах, виртуальных машинах или облачных экземплярах.

Выполните следующие команды для настройки структуры каталогов для этого примера:

```bash
mkdir cluster_2S_1R
cd cluster_2S_1R


# Create clickhouse-keeper directories
for i in {01..03}; do
  mkdir -p fs/volumes/clickhouse-keeper-${i}/etc/clickhouse-keeper
done


# Create clickhouse-server directories
for i in {01..02}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server
done
```

Добавьте следующий файл `docker-compose.yml` в каталог `clickhouse-cluster`:

```yaml title="docker-compose.yml"
version: '3.8'
services:
  clickhouse-01:
    image: "clickhouse/clickhouse-server:latest"
    user: "101:101"
    container_name: clickhouse-01
    hostname: clickhouse-01
    networks:
      cluster_2S_1R:
        ipv4_address: 192.168.7.1
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
    networks:
      cluster_2S_1R:
        ipv4_address: 192.168.7.2
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
    networks:
      cluster_2S_1R:
        ipv4_address: 192.168.7.5
    volumes:
     - ${PWD}/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml:/etc/clickhouse-keeper/keeper_config.xml
    ports:
        - "127.0.0.1:9181:9181"
  clickhouse-keeper-02:
    image: "clickhouse/clickhouse-keeper:latest-alpine"
    user: "101:101"
    container_name: clickhouse-keeper-02
    hostname: clickhouse-keeper-02
    networks:
      cluster_2S_1R:
        ipv4_address: 192.168.7.6
    volumes:
     - ${PWD}/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml:/etc/clickhouse-keeper/keeper_config.xml
    ports:
        - "127.0.0.1:9182:9181"
  clickhouse-keeper-03:
    image: "clickhouse/clickhouse-keeper:latest-alpine"
    user: "101:101"
    container_name: clickhouse-keeper-03
    hostname: clickhouse-keeper-03
    networks:
      cluster_2S_1R:
        ipv4_address: 192.168.7.7
    volumes:
     - ${PWD}/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml:/etc/clickhouse-keeper/keeper_config.xml
    ports:
        - "127.0.0.1:9183:9181"
networks:
  cluster_2S_1R:
    driver: bridge
    ipam:
      config:
        - subnet: 192.168.7.0/24
          gateway: 192.168.7.254
```

Создайте следующие подкаталоги и файлы:

```bash
for i in {01..02}; do
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d
  mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/config.d/config.xml
  touch fs/volumes/clickhouse-${i}/etc/clickhouse-server/users.d/users.xml
done
```

<ConfigExplanation/>

## Настройка узлов ClickHouse {#configure-clickhouse-servers}

### Настройка серверов {#server-setup}

Теперь измените каждый пустой файл конфигурации `config.xml`, расположенный в
`fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d`. Строки, которые
выделены ниже, необходимо изменить, чтобы они соответствовали каждому узлу:

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
    <display_name>cluster_2S_1R node 1</display_name>
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
        <cluster_2S_1R>
            <shard>
                <replica>
                    <host>clickhouse-01</host>
                    <port>9000</port>
                </replica>
            </shard>
            <shard>
                <replica>
                    <host>clickhouse-02</host>
                    <port>9000</port>
                </replica>
            </shard>
        </cluster_2S_1R>
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

| Директория                                                  | Файл                                                                                                                                                                               |
|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml)  |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml)  |

Каждый раздел приведенного выше файла конфигурации объясняется более подробно ниже.

#### Сеть и логирование {#networking}

<ListenHost/>

Логирование определяется в блоке `<logger>`. Эта примерная конфигурация предоставляет
вам отладочный журнал, который будет перекатываться при достижении 1000M три раза:

```xml
<logger>
    <level>debug</level>
    <log>/var/log/clickhouse-server/clickhouse-server.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
    <size>1000M</size>
    <count>3</count>
</logger>
```

Для получения дополнительной информации о конфигурации логирования см. комментарии, включенные в
стандартный [файл конфигурации ClickHouse](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml).

#### Конфигурация кластера {#cluster-configuration}

Конфигурация для кластера устанавливается в блоке `<remote_servers>`.
Здесь определяется имя кластера `cluster_2S_1R`.

Блок `<cluster_2S_1R></cluster_2S_1R>` определяет компоновку кластера,
используя настройки `<shard></shard>` и `<replica></replica>`, и служит
шаблоном для распределенных DDL-запросов, которые выполняются по всему
кластеру с использованием оператора `ON CLUSTER`. По умолчанию распределенные DDL-запросы
разрешены, но их также можно отключить с помощью настройки `allow_distributed_ddl_queries`.

`internal_replication` установлен в true, чтобы данные записывались только в одну из реплик.

```xml
<remote_servers>
    <cluster_2S_1R>
        <shard>
            <replica>
                <host>clickhouse-01</host>
                <port>9000</port>
            </replica>
        </shard>
        <shard>
            <replica>
                <host>clickhouse-02</host>
                <port>9000</port>
            </replica>
        </shard>
    </cluster_2S_1R>
</remote_servers>
```

<ServerParameterTable/>

#### Конфигурация Keeper {#keeper-config-explanation}

Секция `<ZooKeeper>` указывает ClickHouse, где работает ClickHouse Keeper (или ZooKeeper).
Поскольку мы используем кластер ClickHouse Keeper, каждый `<node>` кластера должен быть указан,
вместе с его именем хоста и номером порта с помощью тегов `<host>` и `<port>` соответственно.

Настройка ClickHouse Keeper объясняется на следующем этапе учебника.

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
Хотя возможно запускать ClickHouse Keeper на том же сервере, что и сервер ClickHouse,
в производственных средах мы настоятельно рекомендуем, чтобы ClickHouse Keeper работал на выделенных хостах.
:::

#### Конфигурация макросов {#macros-config-explanation}

Кроме того, секция `<macros>` используется для определения замен параметров для
реплицированных таблиц. Они перечислены в `system.macros` и позволяют использовать замены
такие как `{shard}` и `{replica}` в запросах.

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
</macros>
```

:::note
Эти значения будут определены уникально в зависимости от компоновки кластера.
:::

### Настройка пользователей {#user-config}

Теперь измените каждый пустой файл конфигурации `users.xml`, расположенный по адресу
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

| Директория                                                  | Файл                                                                                                                                                                               |
|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-01/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml)    |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml)    |

В этом примере пользователь по умолчанию настроен без пароля для простоты.
На практике это не рекомендуется.

:::note
В этом примере каждый файл `users.xml` идентичен для всех узлов в кластере.
:::

## Настройка ClickHouse Keeper {#configure-clickhouse-keeper-nodes}

### Настройка Keeper {#configuration-explanation}

<KeeperConfig/>

| Директория                                                       | Файл                                                                                                                                                                                           |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-server/config.d` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation/>

<CloudTip/>

## Протестируйте настройку {#test-the-setup}

Убедитесь, что Docker работает на вашем компьютере.
Запустите кластер, используя команду `docker-compose up` из корневого каталога `cluster_2S_1R`:

```bash
docker-compose up -d
```

Вы должны увидеть, как Docker начинает загружать образы ClickHouse и Keeper,
а затем запускать контейнеры:

```bash
[+] Running 6/6
 ✔ Network cluster_2s_1r_default   Created
 ✔ Container clickhouse-keeper-03  Started
 ✔ Container clickhouse-keeper-02  Started
 ✔ Container clickhouse-keeper-01  Started
 ✔ Container clickhouse-01         Started
 ✔ Container clickhouse-02         Started
```

Чтобы проверить, что кластер запущен, подключитесь к `clickhouse-01` или `clickhouse-02` и выполните
следующий запрос. Команда для подключения к первому узлу показана:

```bash

# Connect to any node
docker exec -it clickhouse-01 clickhouse-client
```

Если успешно, вы увидите приглашение клиента ClickHouse:

```response
cluster_2S_1R node 1 :)
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
1. │ cluster_2S_1R │         1 │           1 │ clickhouse-01 │ 9000 │
2. │ cluster_2S_1R │         2 │           1 │ clickhouse-02 │ 9000 │
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
1. │ task_queue │       │ /clickhouse │
2. │ sessions   │       │ /clickhouse │
3. │ clickhouse │       │ /           │
4. │ keeper     │       │ /           │
   └────────────┴───────┴─────────────┘
```

<VerifyKeeperStatus/>

Таким образом, вы успешно настроили кластер ClickHouse с одним шардом и двумя репликами.
На следующем шаге вы создадите таблицу в кластере.

## Создание базы данных {#creating-a-database}

Теперь, когда вы подтвердили, что кластер настроен и работает правильно, вы
воссоздадите ту же таблицу, что и в учебнике примера [Цены на недвижимость в Великобритании](/getting-started/example-datasets/uk-price-paid).
Она состоит примерно из 30 миллионов строк цен, уплаченных
за недвижимость в Англии и Уэльсе с 1995 года.

Подключитесь к клиенту каждого хоста, запустив каждую из следующих команд в отдельных вкладках или окнах терминала:

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
```

Вы можете выполнить запрос ниже из clickhouse-client каждого хоста, чтобы подтвердить, что
баз данных еще не создано, кроме стандартных:

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

Запустите следующий **распределенный** DDL-запрос из клиента `clickhouse-01`, чтобы создать новую базу данных под названием `uk`:

```sql
CREATE DATABASE IF NOT EXISTS uk 
-- highlight-next-line
ON CLUSTER cluster_2S_1R;
```

Вы можете снова выполнить тот же запрос, что и раньше, из клиента каждого хоста,
чтобы подтвердить, что база данных была создана по всему кластеру, несмотря на то, что запрос был выполнен только на `clickhouse-01`:

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

Теперь, когда база данных создана, вы создадите распределенную таблицу.
Распределенные таблицы - это таблицы, которые имеют доступ к шардированным хранилищам, расположенным на разных
хостах, и определяются с использованием движка таблиц `Distributed`. Распределенная таблица
служит интерфейсом для всех шардов в кластере.

Запустите следующий запрос из любого клиента хоста:

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_local
--highlight-next-line
ON CLUSTER cluster_2S_1R
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
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2);
```

Обратите внимание, что он идентичен запросу, использованному в исходном операторе `CREATE`
учебника примера [Цены на недвижимость в Великобритании](/getting-started/example-datasets/uk-price-paid),
за исключением оператора `ON CLUSTER`.

Оператор `ON CLUSTER` предназначен для распределенного выполнения DDL (языка определения данных)
запросов, таких как `CREATE`, `DROP`, `ALTER` и `RENAME`, обеспечивая применение этих
изменений схемы ко всем узлам в кластере.

Вы можете выполнить запрос ниже из клиента каждого хоста, чтобы подтвердить, что таблица была создана по всему кластеру:

```sql title="Query"
SHOW TABLES IN uk;
```

```response title="Response"
   ┌─name────────────────┐
1. │ uk_price_paid_local │
   └─────────────────────┘
```

## Вставка данных в распределенную таблицу {#inserting-data}

Перед тем как вставить данные о ценах на недвижимость в Великобритании, давайте проведем небольшой эксперимент, чтобы увидеть,
что произойдет, когда мы вставляем данные в обычную таблицу с любого хоста.

Создайте тестовую базу данных и таблицу с помощью следующего запроса с любого хоста:

```sql
CREATE DATABASE IF NOT EXISTS test ON CLUSTER cluster_2S_1R;
CREATE TABLE test.test_table ON CLUSTER cluster_2S_1R
(
    `id` UInt64,
    `name` String
)
ENGINE = ReplicatedMergeTree
ORDER BY id;
```

Теперь на `clickhouse-01` выполните следующий запрос `INSERT`:

```sql
INSERT INTO test.test_table (id, name) VALUES (1, 'Clicky McClickface');
```

Переключитесь на `clickhouse-02` и выполните следующий запрос `INSERT`:

```sql title="Query"
INSERT INTO test.test_table (id, name) VALUES (1, 'Alexey Milovidov');
```

Теперь с `clickhouse-01` или `clickhouse-02` выполните следующий запрос:

```sql
-- from clickhouse-01
SELECT * FROM test.test_table;
--   ┌─id─┬─name───────────────┐
-- 1.│  1 │ Clicky McClickface │
--   └────┴────────────────────┘

--from clickhouse-02
SELECT * FROM test.test_table;
--   ┌─id─┬─name───────────────┐
-- 1.│  1 │ Alexey Milovidov   │
--   └────┴────────────────────┘
```

Вы заметите, что возвращается только та строка, которая была вставлена в таблицу на этом
конкретном хосте, а не обе строки.

Чтобы читать данные из двух шардов, нам нужен интерфейс, который может обрабатывать запросы
по всем шарам, объединяя данные из обоих шардов, когда мы выполняем выборочные запросы
к ним, и обрабатывая вставку данных в отдельные шары, когда мы выполняем запросы на вставку.

В ClickHouse этот интерфейс называется распределенной таблицей, которую мы создаем с помощью
движка таблиц [`Distributed`](/engines/table-engines/special/distributed). Давайте посмотрим, как это работает.

Создайте распределенную таблицу с помощью следующего запроса:

```sql
CREATE TABLE test.test_table_dist ON CLUSTER cluster_2S_1R AS test.test_table
ENGINE = Distributed('cluster_2S_1R', 'test', 'test_table', rand())
```

В этом примере функция `rand()` выбрана в качестве ключа шардирования, чтобы
вставки случайным образом распределялись по шартам.

Теперь выполните запрос к распределенной таблице с любого хоста, и вы получите обратно
обе строки, которые были вставлены на двух хостах:

```sql
   ┌─id─┬─name───────────────┐
1. │  1 │ Alexey Milovidov   │
2. │  1 │ Clicky McClickface │
   └────┴────────────────────┘
```

Давайте сделаем то же самое для данных о ценах на недвижимость в Великобритании. С любого клиента хоста
выполните следующий запрос для создания распределенной таблицы, используя существующую таблицу,
созданную ранее с `ON CLUSTER`:

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
ON CLUSTER cluster_2S_1R
ENGINE = Distributed('cluster_2S_1R', 'uk', 'uk_price_paid_local', rand());
```

Теперь подключитесь к любому из хостов и вставьте данные:

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

После вставки данных вы можете проверить количество строк с помощью распределенной
таблицы:

```sql title="Query"
SELECT count(*)
FROM uk.uk_price_paid_distributed
```

```response title="Response"
   ┌──count()─┐
1. │ 30212555 │ -- 30.21 million
   └──────────┘
```

Если вы выполните следующий запрос на любом хосте, вы увидите, что данные были
более или менее равномерно распределены по шартам (имейте в виду, что выбор шардов для вставки
был установлен с помощью `rand()`, так что результаты могут отличаться):

```sql
-- from clickhouse-01
SELECT count(*)
FROM uk.uk_price_paid_local
--    ┌──count()─┐
-- 1. │ 15107353 │ -- 15.11 million
--    └──────────┘

--from clickhouse-02
SELECT count(*)
FROM uk.uk_price_paid_local
--    ┌──count()─┐
-- 1. │ 15105202 │ -- 15.11 million
--    └──────────┘
```

Что произойдет, если один из хостов выйдет из строя? Давайте смоделируем это, выключив
`clickhouse-01`:

```bash
docker stop clickhouse-01
```

Проверьте, что хост отключен, запустив:

```bash
docker-compose ps
```

```response title="Response"
NAME                   IMAGE                                        COMMAND            SERVICE                CREATED          STATUS          PORTS
clickhouse-02          clickhouse/clickhouse-server:latest          "/entrypoint.sh"   clickhouse-02          X minutes ago    Up X minutes    127.0.0.1:8124->8123/tcp, 127.0.0.1:9001->9000/tcp
clickhouse-keeper-01   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-01   X minutes ago    Up X minutes    127.0.0.1:9181->9181/tcp
clickhouse-keeper-02   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-02   X minutes ago    Up X minutes    127.0.0.1:9182->9181/tcp
clickhouse-keeper-03   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-03   X minutes ago    Up X minutes    127.0.0.1:9183->9181/tcp
```

Теперь с `clickhouse-02` выполните тот же выборочный запрос, который мы выполняли ранее на распределенной
таблице:

```sql
SELECT count(*)
FROM uk.uk_price_paid_distributed
```

```response title="Response"
Received exception from server (version 25.5.2):
Code: 279. DB::Exception: Received from localhost:9000. DB::Exception: All connection tries failed. Log:

Code: 32. DB::Exception: Attempt to read after eof. (ATTEMPT_TO_READ_AFTER_EOF) (version 25.5.2.47 (official build))
Code: 209. DB::NetException: Timeout: connect timed out: 192.168.7.1:9000 (clickhouse-01:9000, 192.168.7.1, local address: 192.168.7.2:37484, connection timeout 1000 ms). (SOCKET_TIMEOUT) (version 25.5.2.47 (official build))
#highlight-next-line
Code: 198. DB::NetException: Not found address of host: clickhouse-01: (clickhouse-01:9000, 192.168.7.1, local address: 192.168.7.2:37484). (DNS_ERROR) (version 25.5.2.47 (official build))

: While executing Remote. (ALL_CONNECTION_TRIES_FAILED)
```

К сожалению, наш кластер не является отказоустойчивым. Если один из хостов выйдет из строя, кластер
считается поврежденным, и запрос завершится неудачей, в отличие от реплицированной
таблицы, которую мы видели в [предыдущем примере](/architecture/replication), где
мы смогли вставить данные даже когда один из хостов вышел из строя.

</VerticalStepper>

## Заключение {#conclusion}

Преимущество этой топологии кластера заключается в том, что данные распределяются по
отдельным хостам и используются половина памяти на узел. Более того, запросы
обрабатываются по обоим шартам, что более эффективно с точки зрения использования памяти
и снижает ввод-вывод на хост.

Основным недостатком этой топологии кластера является то, что потеря одного из 
хостов делает нас неспособными обрабатывать запросы.

В [следующем примере](/architecture/cluster-deployment) мы рассмотрим, как
настроить кластер с двумя шардерами и двумя репликами, обеспечивающий масштабируемость и
отказоустойчивость.
