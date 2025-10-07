---
'title': 'Интеграция ClickHouse с Kafka с использованием именованных коллекций'
'description': 'Как использовать именованные коллекции для подключения ClickHouse
  к Kafka'
'keywords':
- 'named collection'
- 'how to'
- 'kafka'
'slug': '/integrations/data-ingestion/kafka/kafka-table-engine-named-collections'
'doc_type': 'guide'
---


# Интеграция ClickHouse с Kafka с использованием именованных коллекций

## Введение {#introduction}

В этом руководстве мы рассмотрим, как подключить ClickHouse к Kafka с использованием именованных коллекций. Использование файла конфигурации для именованных коллекций предлагает несколько преимуществ:
- Централизованное и более простое управление настройками конфигурации.
- Изменения в настройках могут быть выполнены без изменения определений SQL таблиц.
- Упрощенный обзор и устранение неполадок конфигураций за счет проверки одного файла конфигурации.

Это руководство было протестировано на Apache Kafka 3.4.1 и ClickHouse 24.5.1.

## Предположения {#assumptions}

В этом документе предполагается, что у вас есть:
1. Рабочий кластер Kafka.
2. Настроенный и работающий кластер ClickHouse.
3. Базовые знания SQL и знакомство с конфигурациями ClickHouse и Kafka.

## Предварительные требования {#prerequisites}

Убедитесь, что пользователь, создающий именованную коллекцию, имеет необходимые права доступа:

```xml
<access_management>1</access_management>
<named_collection_control>1</named_collection_control>
<show_named_collections>1</show_named_collections>
<show_named_collections_secrets>1</show_named_collections_secrets>
```

Для получения дополнительных сведений о включении контроля доступа обратитесь к [Руководству по управлению пользователями](./../../../guides/sre/user-management/index.md).

## Конфигурация {#configuration}

Добавьте следующий раздел в файл `config.xml` ClickHouse:

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

### Примечания к конфигурации {#configuration-notes}

1. Настройте адреса Kafka и связанные параметры в соответствии с настройками вашего кластера Kafka.
2. Раздел перед `<kafka>` содержит параметры движка Kafka ClickHouse. Для полного списка параметров обратитесь к [параметрам движка Kafka](/engines/table-engines/integrations/kafka).
3. Раздел внутри `<kafka>` содержит расширенные параметры конфигурации Kafka. Для получения дополнительных параметров обратитесь к [конфигурации librdkafka](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md).
4. В этом примере используется протокол безопасности `SASL_SSL` и механизм `PLAIN`. Настройте эти параметры в зависимости от конфигурации вашего кластера Kafka.

## Создание таблиц и баз данных {#creating-tables-and-databases}

Создайте необходимые базы данных и таблицы на вашем кластере ClickHouse. Если вы запускаете ClickHouse как единичный узел, опустите часть кластера SQL команды и используйте любой другой движок вместо `ReplicatedMergeTree`.

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

### Создание реплицированных таблиц {#create-replicated-tables}

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

Создайте материализованное представление для вставки данных из первой таблицы Kafka в первую реплицированную таблицу:

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_1_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO first_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM first_kafka_table;
```

Создайте материализованное представление для вставки данных из второй таблицы Kafka во вторую реплицированную таблицу:

```sql
CREATE MATERIALIZED VIEW kafka_testing.cluster_2_mv ON CLUSTER STAGE_CLICKHOUSE_CLUSTER TO second_replicated_table AS
SELECT 
    id,
    first_name,
    last_name
FROM second_kafka_table;
```

## Проверка настройки {#verifying-the-setup}

Теперь вы должны увидеть соответствующие группы потребителей на ваших кластерах Kafka:
- `cluster_1_clickhouse_consumer` на `cluster_1`
- `cluster_2_clickhouse_consumer` на `cluster_2`

Запустите следующие запросы на любом из ваших узлов ClickHouse, чтобы увидеть данные в обеих таблицах:

```sql
SELECT * FROM first_replicated_table LIMIT 10;
```

```sql
SELECT * FROM second_replicated_table LIMIT 10;
```

### Примечание {#note}

В этом руководстве данные, поступающие в обе темы Kafka, одинаковы. В вашем случае они могут отличаться. Вы можете добавить столько кластеров Kafka, сколько хотите.

Пример вывода:

```sql
┌─id─┬─first_name─┬─last_name─┐
│  0 │ FirstName0 │ LastName0 │
│  1 │ FirstName1 │ LastName1 │
│  2 │ FirstName2 │ LastName2 │
└────┴────────────┴───────────┘
```

Это завершает настройку интеграции ClickHouse с Kafka с использованием именованных коллекций. Централизуя настройки Kafka в файле `config.xml` ClickHouse, вы можете легче управлять и регулировать настройки, обеспечивая упрощенную и эффективную интеграцию.
