---
slug: /architecture/horizontal-scaling
sidebar_label: 'Масштабирование'
sidebar_position: 10
title: 'Масштабирование'
description: 'Страница с описанием примерной архитектуры, обеспечивающей масштабируемость'
doc_type: 'guide'
keywords: ['шардинг', 'горизонтальное масштабирование', 'распределённые данные', 'настройка кластера', 'распределение данных']
---

import Image from '@theme/IdealImage';
import ReplicationShardingTerminology from '@site/docs/_snippets/_replication-sharding-terminology.md';
import ShardingArchitecture from '@site/static/images/deployment-guides/replication-sharding-examples/sharding.png';
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

> В этом примере вы узнаете, как настроить простой масштабируемый кластер ClickHouse.
> В конфигурацию входит пять серверов: два используются для шардинга данных,
> а остальные три — для координации.

Архитектура кластера, который вы будете настраивать, показана ниже:

<Image img={ShardingArchitecture} size="md" alt="Схема архитектуры с 2 шардами и 1 репликой" />

<DedicatedKeeperServers />


## Предварительные требования {#pre-requisites}

- Вы ранее настроили [локальный сервер ClickHouse](/install)
- Вы знакомы с базовыми концепциями конфигурации ClickHouse, такими как [файлы конфигурации](/operations/configuration-files)
- У вас установлен Docker

<VerticalStepper level="h2">


## Настройка структуры каталогов и тестовой среды

<ExampleFiles />

В этом руководстве вы будете использовать [Docker Compose](https://docs.docker.com/compose/)
для развертывания кластера ClickHouse. Эту конфигурацию можно адаптировать
для работы на отдельных локальных машинах, виртуальных машинах или облачных инстансах.

Выполните следующие команды, чтобы настроить структуру каталогов для этого примера:

```bash
mkdir cluster_2S_1R
cd cluster_2S_1R
```


# Создание директорий clickhouse-keeper

for i in {01..03}; do
mkdir -p fs/volumes/clickhouse-keeper-${i}/etc/clickhouse-keeper
done


# Создайте директории clickhouse-server

for i in {01..02}; do
mkdir -p fs/volumes/clickhouse-${i}/etc/clickhouse-server
done

````

Добавьте следующий файл `docker-compose.yml` в директорию `clickhouse-cluster`:

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


## Настройка узлов ClickHouse

### Настройка сервера

Теперь измените каждый пустой конфигурационный файл `config.xml`, расположенный в
`fs/volumes/clickhouse-{}/etc/clickhouse-server/config.d`. Строки, которые
выделены ниже, необходимо изменить так, чтобы они были уникальны для каждого узла:

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
    <display_name>cluster_2S_1R узел 1</display_name>
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

| Каталог                                                   | Файл                                                                                                                                                                             |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fs/volumes/clickhouse-01/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-01/etc/clickhouse-server/config.d/config.xml) |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/config.d` | [`config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-02/etc/clickhouse-server/config.d/config.xml) |

Каждый раздел приведённого выше файла конфигурации подробно описан ниже.

#### Сеть и логирование

<ListenHost />

Логирование задаётся в блоке `<logger>`. В этой примерной конфигурации
включён отладочный лог, который будет ротироваться три раза при достижении размера 1000M:

```xml
<logger>
    <level>debug</level>
    <log>/var/log/clickhouse-server/clickhouse-server.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
    <size>1000M</size>
    <count>3</count>
</logger>
```

Для получения дополнительной информации о конфигурации логирования см. комментарии в
стандартном [конфигурационном файле](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml) ClickHouse.

#### Конфигурация кластера

Конфигурация кластера задается в блоке `<remote_servers>`.
Здесь задается имя кластера `cluster_2S_1R`.


Блок `<cluster_2S_1R></cluster_2S_1R>` определяет структуру кластера,
используя настройки `<shard></shard>` и `<replica></replica>`, и служит
шаблоном для распределённых DDL‑запросов, то есть запросов, выполняющихся по всему
кластеру с использованием предложения `ON CLUSTER`. По умолчанию распределённые
DDL‑запросы разрешены, но их также можно отключить параметром `allow_distributed_ddl_queries`.

Параметр `internal_replication` по умолчанию оставлен со значением `false`, поскольку в каждом шарде только одна реплика.

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

<ServerParameterTable />

#### Конфигурация Keeper

Раздел `<ZooKeeper>` указывает ClickHouse, где запущен ClickHouse Keeper (или ZooKeeper).
Поскольку мы используем кластер ClickHouse Keeper, необходимо указать каждый `<node>` кластера,
а также его имя хоста и номер порта с помощью тегов `<host>` и `<port>` соответственно.

Конфигурация ClickHouse Keeper описана на следующем шаге этого руководства.

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

#### Конфигурация макросов

Кроме того, раздел `<macros>` используется для определения подстановок параметров для
реплицируемых таблиц. Они перечислены в `system.macros` и позволяют использовать подстановки
вида `{shard}` и `{replica}` в запросах.

```xml
<macros>
    <shard>01</shard>
    <replica>01</replica>
</macros>
```

:::note
Эти параметры будут определяться индивидуально в зависимости от топологии кластера.
:::

### Конфигурация пользователей

Теперь измените каждый пустой файл конфигурации `users.xml`, расположенный в каталоге
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
| `fs/volumes/clickhouse-01/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-01/etc/clickhouse-server/users.d/users.xml)    |
| `fs/volumes/clickhouse-02/etc/clickhouse-server/users.d`  | [`users.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-02/etc/clickhouse-server/users.d/users.xml)    |

В этом примере для простоты пользователь по умолчанию настроен без пароля.
На практике такой подход не рекомендуется.

:::note
В этом примере каждый файл `users.xml` одинаков на всех узлах кластера.
:::



## Настройка ClickHouse Keeper {#configure-clickhouse-keeper-nodes}

### Настройка Keeper {#configuration-explanation}

<KeeperConfig/>

| Каталог                                                        | Файл                                                                                                                                                                                         |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-01/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-02/etc/clickhouse-keeper/keeper_config.xml) |
| `fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper` | [`keeper_config.xml`](https://github.com/ClickHouse/examples/blob/main/docker-compose-recipes/recipes/cluster_2S_1R/fs/volumes/clickhouse-keeper-03/etc/clickhouse-keeper/keeper_config.xml) |

<KeeperConfigExplanation/>

<CloudTip/>



## Проверьте установку

Убедитесь, что Docker запущен на вашем компьютере.
Запустите кластер с помощью команды `docker-compose up` из корневого каталога `cluster_2S_1R`:

```bash
docker-compose up -d
```

Вы должны увидеть, что Docker начинает загружать образы ClickHouse и Keeper, а затем запускать контейнеры:

```bash
[+] Запущено 6/6
 ✔ Network cluster_2s_1r_default   Создана
 ✔ Container clickhouse-keeper-03  Запущен
 ✔ Container clickhouse-keeper-02  Запущен
 ✔ Container clickhouse-keeper-01  Запущен
 ✔ Container clickhouse-01         Запущен
 ✔ Container clickhouse-02         Запущен
```

Чтобы убедиться, что кластер работает, подключитесь к `clickhouse-01` или `clickhouse-02` и выполните
следующий запрос. Ниже приведена команда для подключения к первому узлу:


```bash
# Подключитесь к любому узлу
docker exec -it clickhouse-01 clickhouse-client
```

Если всё прошло успешно, вы увидите приглашение командной строки клиента ClickHouse:

```response
cluster_2S_1R node 1 :)
```

Выполните следующий запрос, чтобы проверить, какие топологии кластеров заданы для каких хостов:

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

<VerifyKeeperStatus />

На этом этапе вы успешно развернули кластер ClickHouse с одним шардом и двумя репликами.
На следующем шаге вы создадите таблицу в этом кластере.


## Создание базы данных

Теперь, когда вы убедились, что кластер корректно настроен и запущен,
вы будете воссоздавать ту же таблицу, которая используется в учебном примере набора данных [UK property prices](/getting-started/example-datasets/uk-price-paid).
Она содержит около 30 миллионов строк с ценами сделок по объектам недвижимости
в Англии и Уэльсе, начиная с 1995 года.

Подключитесь к клиенту на каждом хосте, выполнив каждую из следующих команд в отдельных вкладках или окнах терминала:

```bash
docker exec -it clickhouse-01 clickhouse-client
docker exec -it clickhouse-02 clickhouse-client
```

Вы можете выполнить приведённый ниже запрос через `clickhouse-client` на каждом хосте, чтобы убедиться, что
ещё не создано ни одной базы данных, за исключением стандартных:

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

С клиента `clickhouse-01` выполните следующий **распределённый** DDL-запрос с использованием конструкции `ON CLUSTER`, чтобы создать новую базу данных с именем `uk`:

```sql
CREATE DATABASE IF NOT EXISTS uk 
-- highlight-next-line
ON CLUSTER cluster_2S_1R;
```

Вы можете снова выполнить тот же запрос, что и раньше, из клиента на каждом хосте,
чтобы убедиться, что база данных была создана во всём кластере, хотя запрос выполнялся
только на `clickhouse-01`:

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


## Создайте таблицу в кластере

Теперь, когда база данных создана, создайте таблицу.
Выполните следующий запрос с любого из клиентских хостов:

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

Обратите внимание, что он идентичен запросу, использованному в исходном операторе `CREATE` в учебнике по демонстрационному набору данных
[UK property prices](/getting-started/example-datasets/uk-price-paid),
за исключением предложения `ON CLUSTER`.

Предложение `ON CLUSTER` предназначено для распределённого выполнения DDL (Data Definition Language, язык описания данных)
запросов, таких как `CREATE`, `DROP`, `ALTER` и `RENAME`, гарантируя, что такие
изменения схемы применяются на всех узлах кластера.

Вы можете выполнить приведённый ниже запрос из клиента на каждом хосте, чтобы убедиться, что таблица создана на всех узлах кластера:

```sql title="Query"
SHOW TABLES IN uk;
```

```response title="Response"
   ┌─name────────────────┐
1. │ uk_price_paid_local │
   └─────────────────────┘
```

Прежде чем вставлять данные о стоимости недвижимости в Великобритании, проведём небольшой эксперимент, чтобы увидеть,
что происходит при вставке данных в обычную таблицу с любого узла.

Создайте тестовую базу данных и таблицу следующим запросом на любом из узлов:

```sql
CREATE DATABASE IF NOT EXISTS test ON CLUSTER cluster_2S_1R;
CREATE TABLE test.test_table ON CLUSTER cluster_2S_1R
(
    `id` UInt64,
    `name` String
)
ENGINE = MergeTree()
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

Теперь на `clickhouse-01` или `clickhouse-02` выполните следующий запрос:

```sql
-- на clickhouse-01
SELECT * FROM test.test_table;
--   ┌─id─┬─name───────────────┐
-- 1.│  1 │ Clicky McClickface │
--   └────┴────────────────────┘

-- на clickhouse-02
SELECT * FROM test.test_table;
--   ┌─id─┬─name───────────────┐
-- 1.│  1 │ Alexey Milovidov   │
--   └────┴────────────────────┘
```

Обратите внимание, что в отличие от таблицы `ReplicatedMergeTree` будет возвращена только та строка, которая была вставлена в таблицу на данном
конкретном хосте, а не обе строки.

Чтобы прочитать данные с двух шардов, нам нужен интерфейс, который может обрабатывать запросы
сразу по всем шардам, объединяя данные с обоих шардов при выполнении запросов SELECT
или вставляя данные в оба шарда при выполнении запросов INSERT.

В ClickHouse этот интерфейс называется **распределённой таблицей**, которую мы создаём с помощью
движка таблицы [`Distributed`](/engines/table-engines/special/distributed). Давайте посмотрим, как это работает.


## Создание распределённой таблицы

Создайте распределённую таблицу с помощью следующего запроса:

```sql
CREATE TABLE test.test_table_dist ON CLUSTER cluster_2S_1R AS test.test_table
ENGINE = Distributed('cluster_2S_1R', 'test', 'test_table', rand())
```

В этом примере в качестве ключа шардинга выбрана функция `rand()`, чтобы
операции вставки случайным образом распределялись по шардам.

Теперь выполните запрос к распределённой таблице с любого хоста, и вы получите
обе строки, которые были вставлены на двух хостах, в отличие от нашего предыдущего примера:

```sql
SELECT * FROM test.test_table_dist;
```

```sql
   ┌─id─┬─name───────────────┐
1. │  1 │ Alexey Milovidov   │
2. │  1 │ Clicky McClickface │
   └────┴────────────────────┘
```

Давайте проделаем то же самое с нашими данными о ценах на недвижимость в Великобритании. С любого из хостов-клиентов
выполните следующий запрос, чтобы создать распределённую таблицу, используя уже существующую таблицу,
которую мы ранее создали с помощью `ON CLUSTER`:

```sql
CREATE TABLE IF NOT EXISTS uk.uk_price_paid_distributed
ON CLUSTER cluster_2S_1R
ENGINE = Distributed('cluster_2S_1R', 'uk', 'uk_price_paid_local', rand());
```


## Вставка данных в распределённую таблицу

Теперь подключитесь к одному из хостов и вставьте данные:

```sql
INSERT INTO uk.uk_price_paid_distributed
SELECT
    toUInt32(price_string) AS price,
    parseDateTimeBestEffortUS(time) AS date,
    splitByChar(' ', postcode)[1] AS postcode1,
    splitByChar(' ', postcode)[2] AS postcode2,
    transform(a, ['T', 'S', 'D', 'F', 'O'], ['таунхаус', 'двухквартирный', 'отдельностоящий', 'квартира', 'другое']) AS type,
    b = 'Y' AS is_new,
    transform(c, ['F', 'L', 'U'], ['полная собственность', 'долгосрочная аренда', 'неизвестно']) AS duration,
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

После вставки данных вы можете проверить количество строк в распределённой таблице:

```sql title="Query"
SELECT count(*)
FROM uk.uk_price_paid_distributed
```

```response title="Response"
   ┌──count()─┐
1. │ 30212555 │ -- 30,21 миллиона
   └──────────┘
```

Если вы выполните следующий запрос на любом из хостов, вы увидите, что данные были
более или менее равномерно распределены по шардам (с учётом того, что выбор шарда, в который выполняется вставка,
задавался с помощью `rand()`, поэтому результаты у вас могут отличаться):

```sql
-- из clickhouse-01
SELECT count(*)
FROM uk.uk_price_paid_local
--    ┌──count()─┐
-- 1. │ 15107353 │ -- 15,11 млн
--    └──────────┘

--из clickhouse-02
SELECT count(*)
FROM uk.uk_price_paid_local
--    ┌──count()─┐
-- 1. │ 15105202 │ -- 15,11 млн
--    └──────────┘
```

Что произойдёт, если один из хостов откажет? Давайте смоделируем это, выключив
`clickhouse-01`:

```bash
docker stop clickhouse-01
```

Убедитесь, что хост недоступен, выполнив:

```bash
docker-compose ps
```

```response title="Response"
ИМЯ                    ОБРАЗ                                        КОМАНДА            СЕРВИС                 СОЗДАНО         СТАТУС          ПОРТЫ
clickhouse-02          clickhouse/clickhouse-server:latest          "/entrypoint.sh"   clickhouse-02          X минут назад    Работает X минут 127.0.0.1:8124->8123/tcp, 127.0.0.1:9001->9000/tcp
clickhouse-keeper-01   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-01   X минут назад    Работает X минут 127.0.0.1:9181->9181/tcp
clickhouse-keeper-02   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-02   X минут назад    Работает X минут 127.0.0.1:9182->9181/tcp
clickhouse-keeper-03   clickhouse/clickhouse-keeper:latest-alpine   "/entrypoint.sh"   clickhouse-keeper-03   X минут назад    Работает X минут 127.0.0.1:9183->9181/tcp
```

Теперь с узла `clickhouse-02` выполните тот же запрос SELECT, который мы ранее выполняли на распределённой таблице:

```sql
SELECT count(*)
FROM uk.uk_price_paid_distributed
```

```response title="Response"
Получено исключение от сервера (версия 25.5.2):
Код: 279. DB::Exception: Получено от localhost:9000. DB::Exception: Все попытки соединения не удались. Лог:
```


Code: 32. DB::Exception: Попытка чтения после конца файла. (ATTEMPT&#95;TO&#95;READ&#95;AFTER&#95;EOF) (version 25.5.2.47 (official build))
Code: 209. DB::NetException: Тайм-аут: истекло время ожидания подключения: 192.168.7.1:9000 (clickhouse-01:9000, 192.168.7.1, local address: 192.168.7.2:37484, connection timeout 1000 ms). (SOCKET&#95;TIMEOUT) (version 25.5.2.47 (official build))
#highlight-next-line
Code: 198. DB::NetException: Не удалось найти адрес хоста: clickhouse-01: (clickhouse-01:9000, 192.168.7.1, local address: 192.168.7.2:37484). (DNS&#95;ERROR) (version 25.5.2.47 (official build))

: При выполнении Remote. (ALL&#95;CONNECTION&#95;TRIES&#95;FAILED)

```

К сожалению, наш кластер не является отказоустойчивым. Если один из хостов выходит из строя,
кластер считается неработоспособным и запрос завершается неудачей, в отличие от реплицированной
таблицы, которую мы рассмотрели в [предыдущем примере](/architecture/replication), где
мы могли вставлять данные даже при отказе одного из хостов.

</VerticalStepper>
```


## Заключение {#conclusion}

Преимущество такой топологии кластера заключается в том, что данные распределяются
по отдельным хостам и используют вдвое меньше дискового пространства на узел. Что ещё важнее, запросы
обрабатываются на обоих шардах, что эффективнее с точки зрения использования памяти
и снижает объём операций ввода-вывода на каждый хост.

Основной недостаток такой топологии кластера, разумеется, в том, что потеря одного из 
хостов не позволяет обслуживать запросы.

В [следующем примере](/architecture/cluster-deployment) мы рассмотрим, как 
настроить кластер с двумя шардами и двумя репликами, обеспечивающий как масштабируемость,
так и отказоустойчивость.
