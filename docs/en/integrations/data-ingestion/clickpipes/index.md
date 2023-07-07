---
sidebar_label: ClickPipes (New)
description: Seamlessly connect your external data sources to ClickHouse Cloud. 
slug: /en/integrations/clickpipes
---

import KafkaSVG from "../../images/logos/kafka.svg";
import ConfluentSVG from "../../images/logos/confluent.svg";


# Integrating Kafka with ClickHouse Cloud

## Introduction

[ClickPipes](https://clickhouse.com/cloud/clickpipes) is a managed integration platform that makes ingesting data from a diverse set of sources as simple as clicking a few buttons. Designed for the most demanding workloads, ClickPipes's robust and scalable architecture ensures consistent performance and reliability. 
<br/>

<img src={require('./images/clickpipes_stack.png').default} class="image" alt="ClickPipes Stack Illustration"/>

<br/>

:::note
ClickPipes is a native capability of [ClickHouse Cloud](https://clickhouse.com/cloud) currently under private preview. You can join [our waitlist here](https://clickhouse.com/cloud/clickpipes#joinwaitlist)
:::


## Setup

### 1. Enable ClickPipes for your cloud organization

ClickPipes is currently accessible in private preview. You can join our waitlist by filling [this form](https://clickhouse.com/cloud/clickpipes#joinwaitlist). Please note that during the Private Preview phase, ClickPipes is available only for Amazon Web Services backed services, in the `us-east-2` region.


### 2. Creating your first ClickPipe

1. Access the SQL Console for your ClickHouse Cloud Service running in AWS `us-east-2` region.

<br/>
<img src={require('./images/cp_service.png').default} class="image" alt="ClickPipes Stack Illustration"/>
<br/>

2. Select the `Imports` button on the left-side menu and click on "Ingest Data From Kafka"

<br/>
<img src={require('./images/cp_step0.png').default} class="image" alt="ClickPipes Stack Illustration"/>
<br/>

3. Select your data source between "Confluent Cloud" and "Apache Kafka"

<br/>
<img src={require('./images/cp_step1.png').default} class="image" alt="ClickPipes Illustration"/>
<br/>


4. Fill out the form by providing your ClickPipe with a name, a description (optional), your credentials, a consumer group as well as the Kafka broker URL.
<br/>
<img src={require('./images/cp_step2.png').default} class="image" alt="ClickPipes Illustration"/>
<br/>

:::note
Support for Confluent Cloud Schema Registry is coming soon 
:::
<br/>

5. Select your data format (we currently support `JSON`) and Kafka topic. The UI will display a sample document from the selected Kafka topic.

<br/>
<img src={require('./images/cp_step3.png').default} class="image" alt="ClickPipes Illustration"/>
<br/>

5. In the next step, you can select whether you want to ingest data into a new ClickHouse table or reuse an existing one. Follow the instructions in the screen to modify your table name, schema, and settings. You can see a real-time preview of your changes in the sample table at the top.

<br/>
<img src={require('./images/cp_step4a.png').default} class="image" alt="ClickPipes Illustration"/>
<br/>

You can also customize the advanced settings using the controls provided

<br/>
<img src={require('./images/cp_step4a3.png').default} class="image" alt="ClickPipes Illustration"/>
<br/>

6. Alternatively, you can decide to ingest your data in an existing ClickHouse table. In that case, the UI will allow you to map fields from Kafka with the ClickHouse fields in the selected destination table.

<br/>
<img src={require('./images/cp_step4b.png').default} class="image" alt="ClickPipes Illustration"/>
<br/>

7. Finally, you can decide to enable the error logging table. When enabled, ClickPipes will create a table next to your destination table with the postfix `_clickpipes_error`. This table will contain any errors from the operations of your ClickPipe (network, connectivity, etc.) and also any data that don't conform to the schema specified in the previous screen. The error table has a [TTL](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) of 7 days.

<br/>
<img src={require('./images/cp_step5.png').default} class="image" alt="ClickPipes Illustration"/>
<br/>

8. By clicking on "Complete Setup", the system will register you ClickPipe and you'll be able to see it listed in the summary table.

<br/>
<img src={require('./images/cp_success.png').default} class="image" alt="ClickPipes Illustration"/>
<br/>
<img src={require('./images/cp_remove.png').default} class="image" alt="ClickPipes Illustration"/>
<br/>

The summary table provides controls to display sample data from the Kafka broker or the destination table in ClickHouse

<br/>
<img src={require('./images/cp_source.png').default} class="image" alt="ClickPipes Illustration"/>
<br/>
<img src={require('./images/cp_destination.png').default} class="image" alt="ClickPipes Illustration"/>
<br/>

As well as controls to remove the ClickPipe and display a summary of the ingest job.
<br/>
<img src={require('./images/cp_overview.png').default} class="image" alt="ClickPipes Illustration"/>
<br/>

9. **Congratulations!** you have successfully setup your first ClickPipe. This job will be continuously running, ingesting data in real-time from your remote data source.

## Supported Data Sources

|Name|Logo|Type|Description|
|------|----|----------------|------------------|
|Confluent Cloud|<ConfluentSVG style={{width: '3rem'}} />|Streaming|Unlock the combined power of Confluent and ClickHouse Cloud through our direct integration.|
|Apache Kafka|<KafkaSVG style={{width: '3rem', 'height': '3rem'}} />|Streaming|Configure ClickPipes and start ingesting streaming data from Apache Kafka into ClickHouse Cloud.|

More connectors are will get added to ClickPipes, you can find out more by [contacting us](https://clickhouse.com/company/contact?loc=clickpipes).

## Supported data formats

The supported formats are:

| Format                                                                                    | Support     |
|-------------------------------------------------------------------------------------------|-------------|
| [JSON](../../../interfaces/formats.md#json)                                               | ✔           | 
| [AvroConfluent](../../../interfaces/formats.md#data-format-avro-confluent)                |*Coming Soon*|
| [TabSeparated](../../../interfaces/formats.md#tabseparated)                               |*Coming Soon*| 
| [CSV](../../../interfaces/formats.md#csv)                                                 |*Coming Soon*| 


## Supported data types

The following ClickHouse types are currently supported by the transform package (with standard JSON as the source):

- Base numeric types
  - Int8
  - Int16
  - Int32
  - Int64
  - UInt8
  - UInt16
  - UInt32
  - UInt64
  - Float32
  - Float64
- Boolean
- String
- Date
- DateTime
- DateTime64

Nullable versions of all of the above are also supported.

- Enum8/Enum16 (Nullable Enums not supported)
- LowCardinality(String)  LowCardinality(Nullable(String)) is not supported

- Map with keys and values using any of the above types (including Nullables)
- Array with elements using any of the above types (including Nullables, one level depth only)

## Current Limitations

* During the Private Preview phase, ClickPipes is available only on the services backed by Amazon Web Services, in the `us-east-2` region.
* Private Link support isn't currently available for ClickPipes but will be release in a near future.
* Once ClickPipes is enabled for your cloud organization, you need to start a new ClickHouse service in order to access it via the SQL Console


## F.A.Q

* **What is ClickPipes ?**

ClickPipes is a ClickHouse Cloud feature that makes it easy for users to connect their ClickHouse services to external data sources, specifically Kafka. With ClickPipes for Kafka, users can easily continuously load data into ClickHouse, making it available for real-time analytics.


* **What types of data sources does ClickPipes support ?**

Currently, ClickPipes supports Confluent Cloud and Apache Kafka as data sources. However, we are committed to expand our support for more data sources in the future. Don't hesitate to [contact us](https://clickhouse.com/company/contact?loc=clickpipes) if you want to know more.


* **How does ClickPipes for Kafka work ?**

ClickPipes uses a dedicated architecture running the Kafka Consumer API to read data from a specified topic and then inserts the data into a ClickHouse table on a specific ClickHouse Cloud service.

* **What are the requirements for using ClickPipes for Kafka ?**

In order to use ClickPipes for Kafka, you will need a running Kafka broker and a ClickHouse Cloud service with ClickPipes enabled. You will also need to ensure that ClickHouse Cloud can access your Kafka broker. This can be achieved by allowing remote connection on the Kafka side, whitelisting [ClickHouse Cloud Egress IP addresses](https://clickhouse.com/docs/en/manage/security/cloud-endpoints-api) in your Kafka setup. Support for AWS Private Link is coming soon.


* **Can I use ClickPipes for Kafka to write data to a Kafka topic ?**

No, the ClickPipes for Kafka is designed for reading data from Kafka topics, not writing data to them. To write data to a Kafka topic, you will need to use a dedicated Kafka producer.

* **What data formats are supported by ClickPipes for Kafka ?**

The list of supported data types is [displayed above](./clickpipes#supported-data-types).


* **Does ClickPipes support data transformation ?**

Yes, ClickPipes supports basic data transformation by exposing the DDL creation. You can then apply more advanceD transformations to the data as it is loaded into its destination table in a ClickHouse Cloud service leveraging ClickHouse's [materialized views feature](https://clickhouse.com/docs/en/guides/developer/cascading-materialized-views).


* **What delivery semantics ClickPipes for Kafka supports ?**

ClickPipes for Kafka provides `at-least-once` delivery semantics (as one of the most commonly used approaches). We'd love to hear your feedback on delivery semantics (contact form). If you need exactly-once semantics, we recommend using our official [clickhouse-kafka-connect sink](https://clickhouse.com/blog/real-time-event-streaming-with-kafka-connect-confluent-cloud-clickhouse).


* **Is there a way to handle errors or failures when using ClickPipes for Kafka ?**

Yes, ClickPipes for Kafka will automatically retry case of failures when consuming data from Kafka. ClickPipes also supports enabling a dedicated error table that will hold errors and malformed data for 7 days.