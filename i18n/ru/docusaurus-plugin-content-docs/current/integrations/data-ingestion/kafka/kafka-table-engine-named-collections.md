---
title: 'Интеграция ClickHouse с Kafka с использованием именованных коллекций'
description: 'Как использовать именованные коллекции для подключения ClickHouse к Kafka'
keywords: ['именованные коллекции', 'пошаговая инструкция', 'Kafka']
slug: /integrations/data-ingestion/kafka/kafka-table-engine-named-collections
doc_type: 'guide'
---

# Интеграция ClickHouse с Kafka с использованием именованных коллекций {#integrating-clickhouse-with-kafka-using-named-collections}

## Введение {#introduction}

В этом руководстве мы рассмотрим, как подключить ClickHouse к Kafka с использованием именованных коллекций. Использование файла конфигурации для именованных коллекций дает несколько преимуществ:
- Централизованное и более простое управление настройками.
- Изменения настроек можно вносить без изменения SQL-определений таблиц.
- Более удобный просмотр и отладка конфигурации за счет анализа одного файла конфигурации.

Это руководство было проверено на Apache Kafka 3.4.1 и ClickHouse 24.5.1.

## Предварительные условия {#assumptions}

В этом документе предполагается, что у вас уже есть:
1. Работоспособный кластер Kafka.
2. Развернутый и запущенный кластер ClickHouse.
3. Базовые знания SQL и опыт работы с конфигурациями ClickHouse и Kafka.

## Предварительные требования {#prerequisites}

Убедитесь, что пользователь, создающий именованную коллекцию, обладает необходимыми правами доступа:

```xml
<access_management>1</access_management>
<named_collection_control>1</named_collection_control>
<show_named_collections>1</show_named_collections>
<show_named_collections_secrets>1</show_named_collections_secrets>
```

См. руководство [User Management Guide](./../../../guides/sre/user-management/index.md) для получения подробной информации о включении управления доступом.

## Конфигурация {#configuration}

Добавьте следующий раздел в файл конфигурации ClickHouse `config.xml`:

```xml
<!-- Named collections for Kafka integration -->
<named_collections>
    <cluster_1>
        <!-- ClickHouse Kafka engine parameters -->
        <kafka_broker_list>c1-kafka-1:9094,c1-kafka-2:9094,c1-kafka-3:9094</kafka_broker_list>
        <kafka_topic_list>cluster_1_clickhouse_topic</kafka_topic_list>
        <kafka_group_name>cluster_1_clickhouse_consumer</kafka_group_name>
        <kafka_format>JSONEachRow</kafka_format>
        <kafka_commit_every_batch>0</kafka_commit_every_batch>
        <kafka_num_consumers>1</kafka_num_consumers>
        <kafka_thread_per_consumer>1</kafka_thread_per_consumer>

        <!-- Kafka extended configuration -->
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
        <!-- ClickHouse Kafka engine parameters -->
        <kafka_broker_list>c2-kafka-1:29094,c2-kafka-2:29094,c2-kafka-3:29094</kafka_broker_list>
        <kafka_topic_list>cluster_2_clickhouse_topic</kafka_topic_list>
        <kafka_group_name>cluster_2_clickhouse_consumer</kafka_group_name>
        <kafka_format>JSONEachRow</kafka_format>
        <kafka_commit_every_batch>0</kafka_commit_every_batch>
        <kafka_num_consumers>1</kafka_num_consumers>
        <kafka_thread_per_consumer>1</kafka_thread_per_consumer>

        <!-- Kafka extended configuration -->
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

### Примечания по конфигурации {#configuration-notes}

1. Настройте адреса Kafka и связанные параметры в соответствии с конфигурацией вашего кластера Kafka.
2. Раздел перед `<kafka>` содержит параметры движка Kafka в ClickHouse. Полный список параметров смотрите в разделе [параметры движка Kafka](/engines/table-engines/integrations/kafka).
3. Раздел внутри `<kafka>` содержит расширенные параметры конфигурации Kafka. Дополнительные параметры смотрите в [документации по конфигурации librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md).
4. В этом примере используется протокол безопасности `SASL_SSL` и механизм `PLAIN`. При необходимости скорректируйте эти параметры в соответствии с конфигурацией вашего кластера Kafka.

## Создание таблиц и баз данных {#creating-tables-and-databases}

Создайте необходимые базы данных и таблицы в вашем кластере ClickHouse. Если вы запускаете ClickHouse на отдельном узле, опустите часть SQL-команды, относящуюся к кластеру, и используйте любой другой движок вместо `ReplicatedMergeTree`.

### Создание базы данных {#create-the-database}

```sql
CREATE DATABASE kafka_testing ON CLUSTER LAB_CLICKHOUSE_CLUSTER;
```

### Создайте таблицы Kafka {#create-kafka-tables}

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

Создайте первую таблицу Kafka:

```sql
CREATE TABLE kafka_testing.first_replicated_table ON CLUSTER STAGE_CLICKHOUSE_CLUSTER
(
    `id` UInt32,
    `first_name` String,
    `last_name` String
) ENGINE = ReplicatedMergeTree()
ORDER BY id;
```

Создайте вторую таблицу Kafka:

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

Создайте материализованное представление, которое будет вставлять данные из первой таблицы Kafka в первую реплицируемую таблицу:

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_1_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO first_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM first_kafka_table;
```

Создайте материализованное представление, которое будет вставлять данные из второй таблицы Kafka во вторую реплицированную таблицу:

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_2_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO second_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM second_kafka_table;
```

## Проверка настройки {#verifying-the-setup}

Теперь в ваших кластерах Kafka должны появиться соответствующие группы потребителей:

* `cluster_1_clickhouse_consumer` в `cluster_1`
* `cluster_2_clickhouse_consumer` в `cluster_2`

Выполните следующие запросы на любом из узлов ClickHouse, чтобы увидеть данные в обеих таблицах:

```sql
SELECT * FROM first_replicated_table LIMIT 10;
```

```sql
SELECT * FROM second_replicated_table LIMIT 10;
```

### Примечание {#note}

В этом руководстве данные, поступающие в оба топика Kafka, одинаковы. В вашем случае они будут различаться. Вы можете добавить столько кластеров Kafka, сколько потребуется.

Пример вывода:

```sql
┌─id─┬─first_name─┬─last_name─┐
│  0 │ FirstName0 │ LastName0 │
│  1 │ FirstName1 │ LastName1 │
│  2 │ FirstName2 │ LastName2 │
└────┴────────────┴───────────┘
```

На этом настройка интеграции ClickHouse с Kafka с использованием именованных коллекций завершена. Вынеся конфигурацию Kafka в файл `config.xml` ClickHouse, вы сможете проще управлять настройками и корректировать их по мере необходимости, обеспечивая более удобную и эффективную интеграцию.
