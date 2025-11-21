---
title: 'Интеграция ClickHouse с Kafka с использованием именованных коллекций'
description: 'Как использовать именованные коллекции для подключения ClickHouse к Kafka'
keywords: ['именованная коллекция', 'руководство', 'kafka']
slug: /integrations/data-ingestion/kafka/kafka-table-engine-named-collections
doc_type: 'guide'
---



# Интеграция ClickHouse с Kafka с использованием именованных коллекций



## Введение {#introduction}

В этом руководстве мы рассмотрим, как подключить ClickHouse к Kafka с использованием именованных коллекций. Использование конфигурационного файла для именованных коллекций предоставляет несколько преимуществ:

- Централизованное и более простое управление параметрами конфигурации.
- Изменения параметров можно вносить без изменения определений SQL-таблиц.
- Упрощенный просмотр и устранение неполадок конфигураций путем проверки единого конфигурационного файла.

Данное руководство протестировано на Apache Kafka 3.4.1 и ClickHouse 24.5.1.


## Предварительные требования {#assumptions}

В этом документе предполагается, что у вас есть:

1. Работающий кластер Kafka.
2. Настроенный и работающий кластер ClickHouse.
3. Базовые знания SQL и знакомство с конфигурацией ClickHouse и Kafka.


## Предварительные требования {#prerequisites}

Убедитесь, что пользователь, создающий именованную коллекцию, имеет необходимые права доступа:

```xml
<access_management>1</access_management>
<named_collection_control>1</named_collection_control>
<show_named_collections>1</show_named_collections>
<show_named_collections_secrets>1</show_named_collections_secrets>
```

Подробнее о настройке контроля доступа см. в [Руководстве по управлению пользователями](./../../../guides/sre/user-management/index.md).


## Конфигурация {#configuration}

Добавьте следующий раздел в файл `config.xml` ClickHouse:

```xml
<!-- Именованные коллекции для интеграции с Kafka -->
<named_collections>
    <cluster_1>
        <!-- Параметры движка Kafka ClickHouse -->
        <kafka_broker_list>c1-kafka-1:9094,c1-kafka-2:9094,c1-kafka-3:9094</kafka_broker_list>
        <kafka_topic_list>cluster_1_clickhouse_topic</kafka_topic_list>
        <kafka_group_name>cluster_1_clickhouse_consumer</kafka_group_name>
        <kafka_format>JSONEachRow</kafka_format>
        <kafka_commit_every_batch>0</kafka_commit_every_batch>
        <kafka_num_consumers>1</kafka_num_consumers>
        <kafka_thread_per_consumer>1</kafka_thread_per_consumer>

        <!-- Расширенная конфигурация Kafka -->
        <kafka>
            <security_protocol>SASL_SSL</security_protocol>
            <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
            <sasl_mechanism>PLAIN</sasl_mechanism>
            <sasl_username>kafka-client</sasl_username>
            <sasl_password>kafkapassword1</sasl_password>
            <debug>all</debug>
            <auto_offset_reset>latest</auto_offset_reset>
        </kafka>
    </cluster_1>

    <cluster_2>
        <!-- Параметры движка Kafka ClickHouse -->
        <kafka_broker_list>c2-kafka-1:29094,c2-kafka-2:29094,c2-kafka-3:29094</kafka_broker_list>
        <kafka_topic_list>cluster_2_clickhouse_topic</kafka_topic_list>
        <kafka_group_name>cluster_2_clickhouse_consumer</kafka_group_name>
        <kafka_format>JSONEachRow</kafka_format>
        <kafka_commit_every_batch>0</kafka_commit_every_batch>
        <kafka_num_consumers>1</kafka_num_consumers>
        <kafka_thread_per_consumer>1</kafka_thread_per_consumer>

        <!-- Расширенная конфигурация Kafka -->
        <kafka>
            <security_protocol>SASL_SSL</security_protocol>
            <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
            <sasl_mechanism>PLAIN</sasl_mechanism>
            <sasl_username>kafka-client</sasl_username>
            <sasl_password>kafkapassword2</sasl_password>
            <debug>all</debug>
            <auto_offset_reset>latest</auto_offset_reset>
        </kafka>
    </cluster_2>
</named_collections>
```

### Примечания к конфигурации {#configuration-notes}

1. Укажите адреса Kafka и соответствующие параметры конфигурации в соответствии с настройками вашего кластера Kafka.
2. Раздел перед `<kafka>` содержит параметры движка Kafka ClickHouse. Полный список параметров см. в разделе [Параметры движка Kafka](/engines/table-engines/integrations/kafka).
3. Раздел внутри `<kafka>` содержит расширенные параметры конфигурации Kafka. Дополнительные параметры см. в документации [librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md).
4. В данном примере используется протокол безопасности `SASL_SSL` и механизм `PLAIN`. Настройте эти параметры в соответствии с конфигурацией вашего кластера Kafka.


## Создание таблиц и баз данных {#creating-tables-and-databases}

Создайте необходимые базы данных и таблицы в кластере ClickHouse. Если ClickHouse работает в режиме одного узла, опустите часть SQL-команды, относящуюся к кластеру, и используйте любой другой движок вместо `ReplicatedMergeTree`.

### Создание базы данных {#create-the-database}

```sql
CREATE DATABASE kafka_testing ON CLUSTER LAB_CLICKHOUSE_CLUSTER;
```

### Создание таблиц Kafka {#create-kafka-tables}

Создайте первую таблицу Kafka для первого кластера Kafka:

```sql
CREATE TABLE kafka_testing.first_kafka_table ON CLUSTER LAB_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_1);
```

Создайте вторую таблицу Kafka для второго кластера Kafka:

```sql
CREATE TABLE kafka_testing.second_kafka_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
)
ENGINE = Kafka(cluster_2);
```

### Создание реплицируемых таблиц {#create-replicated-tables}

Создайте таблицу для первой таблицы Kafka:

```sql
CREATE TABLE kafka_testing.first_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

Создайте таблицу для второй таблицы Kafka:

```sql
CREATE TABLE kafka_testing.second_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

### Создание материализованных представлений {#create-materialized-views}

Создайте материализованное представление для вставки данных из первой таблицы Kafka в первую реплицируемую таблицу:

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_1_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO first_replicated_table AS
SELECT
    id,
    first_name,
    last_name
FROM first_kafka_table;
```

Создайте материализованное представление для вставки данных из второй таблицы Kafka во вторую реплицируемую таблицу:

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_2_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO second_replicated_table AS
SELECT
    id,
    first_name,
    last_name
FROM second_kafka_table;
```


## Проверка настройки {#verifying-the-setup}

Теперь вы должны увидеть соответствующие группы потребителей в ваших кластерах Kafka:

- `cluster_1_clickhouse_consumer` в `cluster_1`
- `cluster_2_clickhouse_consumer` в `cluster_2`

Выполните следующие запросы на любом из узлов ClickHouse, чтобы просмотреть данные в обеих таблицах:

```sql
SELECT * FROM first_replicated_table LIMIT 10;
```

```sql
SELECT * FROM second_replicated_table LIMIT 10;
```

### Примечание {#note}

В данном руководстве данные, поступающие в оба топика Kafka, одинаковы. В вашем случае они будут различаться. Вы можете добавить любое количество кластеров Kafka.

Пример вывода:

```sql
┌─id─┬─first_name─┬─last_name─┐
│  0 │ FirstName0 │ LastName0 │
│  1 │ FirstName1 │ LastName1 │
│  2 │ FirstName2 │ LastName2 │
└────┴────────────┴───────────┘
```

На этом завершается настройка интеграции ClickHouse с Kafka с использованием именованных коллекций. Централизуя конфигурации Kafka в файле `config.xml` ClickHouse, вы можете более удобно управлять настройками и вносить в них изменения, обеспечивая упрощённую и эффективную интеграцию.
