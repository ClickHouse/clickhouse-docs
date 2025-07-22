---
sidebar_label: 'ClickPipes for Kafka'
description: 'Seamlessly connect your Kafka data sources to ClickHouse Cloud.'
slug: /integrations/clickpipes/kafka
sidebar_position: 1
title: 'Integrating Kafka with ClickHouse Cloud'
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2.png';
import cp_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import cp_table_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_table_settings.png';
import Image from '@theme/IdealImage';

# Integrating Kafka with ClickHouse Cloud
## Prerequisite {#prerequisite}
You have familiarized yourself with the [ClickPipes intro](./index.md).

## Creating your first Kafka ClickPipe {#creating-your-first-kafka-clickpipe}

<VerticalStepper type="numbered" headerLevel="h3">

### Navigate to data sources {#1-load-sql-console}
Select the `Data Sources` button on the left-side menu and click on "Set up a ClickPipe".
<Image img={cp_step0} alt="Select imports" size="md"/>

### Select a data source {#2-select-data-source}
Select your Kafka data source from the list.
<Image img={cp_step1} alt="Select data source type" size="md"/>

### Configure the data source {#3-configure-data-source}
Fill out the form by providing your ClickPipe with a name, a description (optional), your credentials, and other connection details.
<Image img={cp_step2} alt="Fill out connection details" size="md"/>

### Configure a schema registry (optional) {#4-configure-your-schema-registry}
A valid schema is required for Avro streams. See [Schema registries](#schema-registries) for more details on how to configure a schema registry.

### Configure a reverse private endpoint (optional) {#5-configure-reverse-private-endpoint}
Configure a Reverse Private Endpoint to allow ClickPipes to connect to your Kafka cluster using AWS PrivateLink.
See our [AWS PrivateLink documentation](./aws-privatelink.md) for more information.

### Select your topic {#6-select-your-topic}
Select your topic and the UI will display a sample document from the topic.
<Image img={cp_step3} alt="Set your topic" size="md"/>

### Configure your destination table {#7-configure-your-destination-table}

In the next step, you can select whether you want to ingest data into a new ClickHouse table or reuse an existing one. Follow the instructions in the screen to modify your table name, schema, and settings. You can see a real-time preview of your changes in the sample table at the top.

<Image img={cp_step4a} alt="Set table, schema, and settings" size="md"/>

You can also customize the advanced settings using the controls provided

<Image img={cp_table_settings} alt="Set advanced controls" size="md"/>

### Configure permissions {#8-configure-permissions}
ClickPipes will create a dedicated user for writing data into a destination table. You can select a role for this internal user using a custom role or one of the predefined role:
    - `Full access`: with the full access to the cluster. It might be useful if you use Materialized View or Dictionary with the destination table.
    - `Only destination table`: with the `INSERT` permissions to the destination table only.

<Image img={cp_step5} alt="Permissions" size="md"/>

### Complete setup {#9-complete-setup}
Clicking on "Create ClickPipe" will create and run your ClickPipe. It will now be listed in the Data Sources section.

<Image img={cp_overview} alt="View overview" size="md"/>

</VerticalStepper>

## Schema registries {#schema-registries}
ClickPipes supports schema registries for Avro data streams.

### Supported registries {#supported-schema-registries}
Schema registries that use the Confluent Schema Registry API are supported. This includes:
- Confluent Kafka and Cloud
- Redpanda
- AWS MSK
- Upstash

ClickPipes is not currently compatible with the AWS Glue Schema registry or the Azure Schema Registry.

### Configuration {#schema-registry-configuration}

ClickPipes with Avro data require a schema registry. This can be configured in one of three ways:
 
1. Providing a complete path to the schema subject (e.g. `https://registry.example.com/subjects/events`)
    - Optionally, a specific version can be referenced by appending `/versions/[version]` to the url (otherwise ClickPipes will retrieve the latest version).
2. Providing a complete path to the schema id (e.g. `https://registry.example.com/schemas/ids/1000`)
3. Providing the root schema registry URL (e.g. `https://registry.example.com`) 

### How it works {#how-schema-registries-work}
ClickPipes dynamically retrieves and applies the Avro schema from the configured Schema Registry.
- If there's a schema id embedded in the message, it will use that to retrieve the schema.
- If there's no schema id embedded in the message, it will use the schema id or subject name specified in the ClickPipe configuration to retrieve the schema.
- If the message is written without an embedded schema id, and no schema id or subject name is specified in the ClickPipe configuration, then the schema will not be retrieved and the message will be skipped with a `SOURCE_SCHEMA_ERROR` logged in the ClickPipes errors table.
- If the message does not conform to the schema, then the message will be skipped with a `DATA_PARSING_ERROR` logged in the ClickPipes errors table.

### Schema mapping {#schema-mapping}
The following rules are applied to the mapping between the retrieved Avro schema and the ClickHouse destination table:

- If the Avro schema contains a field that is not included in the ClickHouse destination mapping, that field is ignored.
- If the Avro schema is missing a field defined in the ClickHouse destination mapping, the ClickHouse column will be populated with a "zero" value, such as 0 or an empty string. Note that DEFAULT expressions are not currently evaluated for ClickPipes inserts (this is temporary limitation pending updates to the ClickHouse server default processing).
- If the Avro schema field and the ClickHouse column are incompatible, inserts of that row/message will fail, and the failure will be recorded in the ClickPipes errors table. Note that several implicit conversions are supported (like between numeric types), but not all (for example, an Avro record field can not be inserted into an Int32 ClickHouse column).

## Supported data sources {#supported-data-sources}

| Name                 |Logo|Type| Status          | Description                                                                                          |
|----------------------|----|----|-----------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka         |<Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>|Streaming| Stable          | Configure ClickPipes and start ingesting streaming data from Apache Kafka into ClickHouse Cloud.     |
| Confluent Cloud      |<Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>|Streaming| Stable          | Unlock the combined power of Confluent and ClickHouse Cloud through our direct integration.          |
| Redpanda             |<Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>|Streaming| Stable          | Configure ClickPipes and start ingesting streaming data from Redpanda into ClickHouse Cloud.         |
| AWS MSK              |<Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>|Streaming| Stable          | Configure ClickPipes and start ingesting streaming data from AWS MSK into ClickHouse Cloud.          |
| Azure Event Hubs     |<Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>|Streaming| Stable          | Configure ClickPipes and start ingesting streaming data from Azure Event Hubs into ClickHouse Cloud. |
| WarpStream           |<Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>|Streaming| Stable          | Configure ClickPipes and start ingesting streaming data from WarpStream into ClickHouse Cloud.       |

More connectors will get added to ClickPipes in the future. You can find out more by [contacting us](https://clickhouse.com/company/contact?loc=clickpipes).

## Supported data formats {#supported-data-formats}

The supported formats are:
- [JSON](../../../interfaces/formats.md/#json)
- [AvroConfluent](../../../interfaces/formats.md/#data-format-avro-confluent)

### Supported data types {#supported-data-types}

#### Standard types support {#standard-types-support}
The following standard ClickHouse data types are currently supported in ClickPipes:

- Base numeric types - \[U\]Int8/16/32/64 and Float32/64
- Large integer types - \[U\]Int128/256
- Decimal Types
- Boolean
- String
- FixedString
- Date, Date32
- DateTime, DateTime64 (UTC timezones only)
- Enum8/Enum16
- UUID
- IPv4
- IPv6
- all ClickHouse LowCardinality types
- Map with keys and values using any of the above types (including Nullables)
- Tuple and Array with elements using any of the above types (including Nullables, one level depth only)

#### Variant type support (experimental) {#variant-type-support}
Variant type support is automatic if your Cloud service is running ClickHouse 25.3 or later.  Otherwise, you will
have to submit a support ticket to enable it on your service.

ClickPipes supports the Variant type in the following circumstances:
- Avro Unions.  If your Avro schema contains a union with multiple non-null types, ClickPipes will infer the
appropriate variant type.  Variant types are not otherwise supported for Avro data.
- JSON fields.  You can manually specify a Variant type (such as `Variant(String, Int64, DateTime)`) for any JSON field
in the source data stream.  Because of the way ClickPipes determines the correct variant subtype to use, only one integer or datetime
type can be used in the Variant definition - for example, `Variant(Int64, UInt32)` is not supported.

#### JSON type support (experimental) {#json-type-support}
JSON type support is automatic if your Cloud service is running ClickHouse 25.3 or later.  Otherwise, you will
have to submit a support ticket to enable it on your service.

ClickPipes support the JSON type in the following circumstances:
- Avro Record types can always be assigned to a JSON column.
- Avro String and Bytes types can be assigned to a JSON column if the column actually holds JSON String objects.
- JSON fields that are always a JSON object can be assigned to a JSON destination column.

Note that you will have to manually change the destination column to the desired JSON type, including any fixed or skipped paths.

### Avro {#avro}
#### Supported Avro Data Types {#supported-avro-data-types}

ClickPipes supports all Avro Primitive and Complex types, and all Avro Logical types except `time-millis`, `time-micros`, `local-timestamp-millis`, `local_timestamp-micros`, and `duration`.  Avro `record` types are converted to Tuple, `array` types to Array, and `map` to Map (string keys only).  In general the conversions listed [here](/interfaces/formats/Avro#data-types-matching) are available.  We recommend using exact type matching for Avro numeric types, as ClickPipes does not check for overflow or precision loss on type conversion.

#### Nullable types and Avro unions {#nullable-types-and-avro-unions}

Nullable types in Avro are defined by using a Union schema of `(T, null)` or `(null, T)` where T is the base Avro type.  During schema inference, such unions will be mapped to a ClickHouse "Nullable" column.  Note that ClickHouse does not support
`Nullable(Array)`, `Nullable(Map)`, or `Nullable(Tuple)` types.  Avro null unions for these types will be mapped to non-nullable versions (Avro Record types are mapped to a ClickHouse named Tuple).  Avro "nulls" for these types will be inserted as:
- An empty Array for a null Avro array
- An empty Map for a null Avro Map
- A named Tuple with all default/zero values for a null Avro Record

## Kafka virtual columns {#kafka-virtual-columns}

The following virtual columns are supported for Kafka compatible streaming data sources.  When creating a new destination table virtual columns can be added by using the `Add Column` button.

| Name           | Description                                     | Recommended Data Type |
|----------------|-------------------------------------------------|-----------------------|
| _key           | Kafka Message Key                               | String                |
| _timestamp     | Kafka Timestamp (Millisecond precision)         | DateTime64(3)         |
| _partition     | Kafka Partition                                 | Int32                 |
| _offset        | Kafka Offset                                    | Int64                 |
| _topic         | Kafka Topic                                     | String                |
| _header_keys   | Parallel array of keys in the record Headers    | Array(String)         |
| _header_values | Parallel array of headers in the record Headers | Array(String)         |
| _raw_message   | Full Kafka Message                              | String                |

Note that the _raw_message column is only recommended for JSON data.  For use cases where only the JSON string is required (such as using ClickHouse [`JsonExtract*`](/sql-reference/functions/json-functions#jsonextract-functions) functions to populate a downstream materialized
view), it may improve ClickPipes performance to delete all the "non-virtual" columns.

## Best practices {#best-practices}

### Message Compression {#compression}
We strongly recommend using compression for your Kafka topics. Compression can result in a significant saving in data transfer costs with virtually no performance hit.
To learn more about message compression in Kafka, we recommend starting with this [guide](https://www.confluent.io/blog/apache-kafka-message-compression/).

## Limitations {#limitations}

- [DEFAULT](/sql-reference/statements/create/table#default) is not supported.

## Delivery semantics {#delivery-semantics}
ClickPipes for Kafka provides `at-least-once` delivery semantics (as one of the most commonly used approaches). We'd love to hear your feedback on delivery semantics [contact form](https://clickhouse.com/company/contact?loc=clickpipes). If you need exactly-once semantics, we recommend using our official [`clickhouse-kafka-connect`](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse) sink.

## Authentication {#authentication}
For Apache Kafka protocol data sources, ClickPipes supports [SASL/PLAIN](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_plain.html) authentication with TLS encryption, as well as `SASL/SCRAM-SHA-256` and `SASL/SCRAM-SHA-512`. Depending on the streaming source (Redpanda, MSK, etc) will enable all or a subset of these auth mechanisms based on compatibility. If you auth needs differ please [give us feedback](https://clickhouse.com/company/contact?loc=clickpipes).

### IAM {#iam}

:::info
IAM Authentication for the MSK ClickPipe is a beta feature.
:::

ClickPipes supports the following AWS MSK authentication

- [SASL/SCRAM-SHA-512](https://docs.aws.amazon.com/msk/latest/developerguide/msk-password.html) authentication
- [IAM Credentials or Role-based access](https://docs.aws.amazon.com/msk/latest/developerguide/how-to-use-iam-access-control.html) authentication

When using IAM authentication to connect to an MSK broker, the IAM role must have the necessary permissions.
Below is an example of the required IAM policy for Apache Kafka APIs for MSK:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:Connect"
            ],
            "Resource": [
                "arn:aws:kafka:us-west-2:12345678912:cluster/clickpipes-testing-brokers/b194d5ae-5013-4b5b-ad27-3ca9f56299c9-10"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:DescribeTopic",
                "kafka-cluster:ReadData"
            ],
            "Resource": [
                "arn:aws:kafka:us-west-2:12345678912:topic/clickpipes-testing-brokers/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:AlterGroup",
                "kafka-cluster:DescribeGroup"
            ],
            "Resource": [
                "arn:aws:kafka:us-east-1:12345678912:group/clickpipes-testing-brokers/*"
            ]
        }
    ]
}
```

#### Configuring a trusted relationship {#configuring-a-trusted-relationship}

If you are authenticating to MSK with a IAM role ARN, you will need to add a trusted relationship between your ClickHouse Cloud instance so the role can be assumed.

:::note
Role-based access only works for ClickHouse Cloud instances deployed to AWS.
:::

```json
{
    "Version": "2012-10-17",
    "Statement": [
        ...
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::12345678912:role/CH-S3-your-clickhouse-cloud-role"
            },
            "Action": "sts:AssumeRole"
        },
    ]
}
```

### Custom Certificates {#custom-certificates}
ClickPipes for Kafka supports the upload of custom certificates for Kafka brokers with SASL & public SSL/TLS certificate. You can upload your certificate in the SSL Certificate section of the ClickPipe setup.
:::note
Please note that while we support uploading a single SSL certificate along with SASL for Kafka, SSL with Mutual TLS (mTLS) is not supported at this time.
:::

## Performance {#performance}

### Batching {#batching}
ClickPipes inserts data into ClickHouse in batches. This is to avoid creating too many parts in the database which can lead to performance issues in the cluster.

Batches are inserted when one of the following criteria has been met:
- The batch size has reached the maximum size (100,000 rows or 20MB)
- The batch has been open for a maximum amount of time (5 seconds)

### Latency {#latency}

Latency (defined as the time between the Kafka message being produced and the message being available in ClickHouse) will be dependent on a number of factors (i.e. broker latency, network latency, message size/format). The [batching](#batching) described in the section above will also impact latency. We always recommend testing your specific use case with typical loads to determine the expected latency.

ClickPipes does not provide any guarantees concerning latency. If you have specific low-latency requirements, please [contact us](https://clickhouse.com/company/contact?loc=clickpipes).

### Scaling {#scaling}

ClickPipes for Kafka is designed to scale horizontally. By default, we create a consumer group with one consumer.
This can be changed with the scaling controls in the ClickPipe details view.

ClickPipes provides a high-availability with an availability zone distributed architecture.
This requires scaling to at least two consumers.

Regardless number of running consumers, fault tolerance is available by design.
If a consumer or its underlying infrastructure fails,
the ClickPipe will automatically restart the consumer and continue processing messages.

## F.A.Q {#faq}

### General {#general}

- **How does ClickPipes for Kafka work?**

  ClickPipes uses a dedicated architecture running the Kafka Consumer API to read data from a specified topic and then inserts the data into a ClickHouse table on a specific ClickHouse Cloud service.

- **What's the difference between ClickPipes and the ClickHouse Kafka Table Engine?**

  The Kafka Table engine is a ClickHouse core capability that implements a "pull model" where the ClickHouse server itself connects to Kafka, pulls events then writes them locally.

  ClickPipes is a separate cloud service that runs independently of the ClickHouse Service, it connects to Kafka (or other data sources) and pushes events to an associated ClickHouse Cloud service. This decoupled architecture allows for superior operational flexibility, clear separation of concerns, scalable ingestion, graceful failure management, extensibility and more.

- **What are the requirements for using ClickPipes for Kafka?**

  In order to use ClickPipes for Kafka, you will need a running Kafka broker and a ClickHouse Cloud service with ClickPipes enabled. You will also need to ensure that ClickHouse Cloud can access your Kafka broker. This can be achieved by allowing remote connection on the Kafka side, whitelisting [ClickHouse Cloud Egress IP addresses](/manage/security/cloud-endpoints-api) in your Kafka setup. Alternatively, you can use [AWS PrivateLink](/integrations/clickpipes/aws-privatelink) to connect ClickPipes for Kafka to your Kafka brokers.

- **Does ClickPipes for Kafka support AWS PrivateLink?**

  AWS PrivateLink is supported. See [the documentation](/integrations/clickpipes/aws-privatelink) for more information on how to set it up.

- **Can I use ClickPipes for Kafka to write data to a Kafka topic?**

  No, the ClickPipes for Kafka is designed for reading data from Kafka topics, not writing data to them. To write data to a Kafka topic, you will need to use a dedicated Kafka producer.

- **Does ClickPipes support multiple brokers?**

  Yes, if the brokers are part of the same quorum they can be configured together delimited with `,`.

### Upstash {#upstash}

- **Does ClickPipes support Upstash?**

  Yes. The Upstash Kafka product entered into a deprecation period on 11th September 2024 for 6 months. Existing customers can continue to use ClickPipes with their existing Upstash Kafka brokers using the generic Kafka tile on the ClickPipes user interface. Existing Upstash Kafka ClickPipes are unaffected before the deprecation notice. When the the deprecation period is up the ClickPipe will stop functioning.

- **Does ClickPipes support Upstash schema registry?**

  No. ClickPipes is not Upstash Kafka schema registry compatible.

- **Does ClickPipes support the Upstash QStash Workflow?**

  No. Unless a Kafka compatible surface is introduced in QStash Workflow it will not work with Kafka ClickPipes.

### Azure EventHubs {#azure-eventhubs}

- **Does the Azure Event Hubs ClickPipe work without the Kafka surface?**

  No. ClickPipes requires the Azure Event Hubs to have the Kafka surface enabled. The Kafka protocol is supported for their Standard, Premium and Dedicated SKU only pricing tiers.

- **Does Azure schema registry work with ClickPipes**

  No. ClickPipes is not currently Event Hubs Schema Registry compatible.

- **What permissions does my policy need to consume from Azure Event Hubs?**

  To list topics and consume event, the shared access policy that is given to ClickPipes will at minimum require a 'Listen' claim.

- **Why is my Event Hubs not returning any data?**

 If your ClickHouse instance is in a different region or continent from your Event Hubs deployment, you may experience timeouts when onboarding your ClickPipes, and higher-latency when consuming data from the Event Hub. It is considered a best practice to locate your ClickHouse Cloud deployment and Azure Event Hubs deployment in cloud regions located close to each other to avoid adverse performance.

- **Should I include the port number for Azure Event Hubs?**

  Yes. ClickPipes expects you to include your port number for the Kafka surface, which should be `:9093`.

- **Are the ClickPipes IPs still relevant for Azure Event Hubs?**

  Yes. If you restrict traffic to your Event Hubs instance please add the [documented static NAT IPs](./index.md#list-of-static-ips).

- **Is the connection string for the Event Hub, or is it for the Event Hub namespace?**

  Both will work, however, we recommend using a shared access policy at the namespace level to retrieve samples from multiple Event Hubs.
