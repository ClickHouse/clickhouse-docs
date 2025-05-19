---
sidebar_label: 'Introduction'
description: 'Seamlessly connect your external data sources to ClickHouse Cloud.'
slug: /integrations/clickpipes
title: 'Integrating with ClickHouse Cloud'
---

import Kafkasvg from '@site/static/images/integrations/logos/kafka.svg';
import Confluentsvg from '@site/static/images/integrations/logos/confluent.svg';
import Msksvg from '@site/static/images/integrations/logos/msk.svg';
import Azureeventhubssvg from '@site/static/images/integrations/logos/azure_event_hubs.svg';
import Warpstreamsvg from '@site/static/images/integrations/logos/warpstream.svg';
import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Amazonkinesis from '@site/static/images/integrations/logos/amazon_kinesis_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import ABSsvg from '@site/static/images/integrations/logos/azureblobstorage.svg';
import Postgressvg from '@site/static/images/integrations/logos/postgresql.svg';
import Mysqlsvg from '@site/static/images/integrations/logos/mysql.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import clickpipes_stack from '@site/static/images/integrations/data-ingestion/clickpipes/clickpipes_stack.png';
import cp_custom_role from '@site/static/images/integrations/data-ingestion/clickpipes/cp_custom_role.png';
import Image from '@theme/IdealImage';

# Integrating with ClickHouse Cloud

## Introduction {#introduction}

[ClickPipes](/integrations/clickpipes) is a managed integration platform that makes ingesting data from a diverse set of sources as simple as clicking a few buttons. Designed for the most demanding workloads, ClickPipes's robust and scalable architecture ensures consistent performance and reliability. ClickPipes can be used for long-term streaming needs or one-time data loading job.

<Image img={clickpipes_stack} alt="ClickPipes stack" size="lg" border/>

## Supported Data Sources {#supported-data-sources}

| Name                 | Logo                                                                                             |Type| Status           | Description                                                                                          |
|----------------------|--------------------------------------------------------------------------------------------------|----|------------------|------------------------------------------------------------------------------------------------------|
| Apache Kafka         | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>      |Streaming| Stable           | Configure ClickPipes and start ingesting streaming data from Apache Kafka into ClickHouse Cloud.     |
| Confluent Cloud      | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>                 |Streaming| Stable           | Unlock the combined power of Confluent and ClickHouse Cloud through our direct integration.          |
| Redpanda             | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>                                     |Streaming| Stable           | Configure ClickPipes and start ingesting streaming data from Redpanda into ClickHouse Cloud.         |
| AWS MSK              | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>             |Streaming| Stable           | Configure ClickPipes and start ingesting streaming data from AWS MSK into ClickHouse Cloud.          |
| Azure Event Hubs     | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>           |Streaming| Stable           | Configure ClickPipes and start ingesting streaming data from Azure Event Hubs into ClickHouse Cloud. |
| WarpStream           | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>                     |Streaming| Stable           | Configure ClickPipes and start ingesting streaming data from WarpStream into ClickHouse Cloud.       |
| Amazon S3            | <S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>              |Object Storage| Stable           | Configure ClickPipes to ingest large volumes of data from object storage.                            |
| Google Cloud Storage | <Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/>  |Object Storage| Stable           | Configure ClickPipes to ingest large volumes of data from object storage.                            |
| DigitalOcean Spaces | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/> | Object Storage | Stable | Configure ClickPipes to ingest large volumes of data from object storage.
| Azure Blob Storage | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/> | Object Storage | Private Beta | Configure ClickPipes to ingest large volumes of data from object storage.
| Amazon Kinesis       | <Amazonkinesis class="image" alt="Amazon Kenesis logo" style={{width: '3rem', height: 'auto'}}/> |Streaming| Stable           | Configure ClickPipes and start ingesting streaming data from Amazon Kinesis into ClickHouse cloud.   |
| Postgres             | <Postgressvg class="image" alt="Postgres logo" style={{width: '3rem', height: 'auto'}}/>         |DBMS| Public Beta      | Configure ClickPipes and start ingesting data from Postgres into ClickHouse Cloud.                   |
| MySQL                | <Mysqlsvg class="image" alt="MySQL logo" style={{width: '3rem', height: 'auto'}}/>               |DBMS| Private Beta | Configure ClickPipes and start ingesting data from MySQL into ClickHouse Cloud.                      |


More connectors will get added to ClickPipes, you can find out more by [contacting us](https://clickhouse.com/company/contact?loc=clickpipes).


## List of Static IPs {#list-of-static-ips}

The following are the static NAT IPs (separated by region) that ClickPipes uses to connect to your external services.
Add your related instance region IPs to your IP allow list to allow traffic.
If your instance region is not listed here, it will fall to the default region:

- **eu-central-1** for EU regions
- **us-east-1** for instances in `us-east-1`
- **us-east-2** for other all regions

| ClickHouse Cloud region | IP Addresses |
|-------------------------|--------------|
| **eu-central-1**        | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40` |
| **us-east-2**           | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180` |
| **us-east-1**           | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150` |

## Adjusting ClickHouse settings {#adjusting-clickhouse-settings}
ClickHouse Cloud provides sensible defaults for most of the use cases. However, if you need to adjust some ClickHouse settings for the ClickPipes destination tables, a dedicated role for ClickPipes is the most flexible solution.
Steps:
1. create a custom role `CREATE ROLE my_clickpipes_role SETTINGS ...`. See [CREATE ROLE](/sql-reference/statements/create/role.md) syntax for details.
2. add the custom role to ClickPipes user on step `Details and Settings` during the ClickPipes creation.

<Image img={cp_custom_role} alt="Assign a custom role" size="lg" border/>

## Error reporting {#error-reporting}
ClickPipes will create a table next to your destination table with the postfix `<destination_table_name>_clickpipes_error`. This table will contain any errors from the operations of your ClickPipe (network, connectivity, etc.) and also any data that don't conform to the schema. The error table has a [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) of 7 days.
If ClickPipes cannot connect to a data source or destination after 15min., ClickPipes instance stops and  stores an appropriate message in the error table (providing the ClickHouse instance is available).

## F.A.Q {#faq}
- **What is ClickPipes?**

  ClickPipes is a ClickHouse Cloud feature that makes it easy for users to connect their ClickHouse services to external data sources, specifically Kafka. With ClickPipes for Kafka, users can easily continuously load data into ClickHouse, making it available for real-time analytics.

- **Does ClickPipes support data transformation?**

  Yes, ClickPipes supports basic data transformation by exposing the DDL creation. You can then apply more advanced transformations to the data as it is loaded into its destination table in a ClickHouse Cloud service leveraging ClickHouse's [materialized views feature](/guides/developer/cascading-materialized-views).

- **Does using ClickPipes incur an additional cost?**

  ClickPipes is billed on two dimensions: Ingested Data and Compute. The full details of the pricing are available on [this page](/cloud/manage/jan-2025-faq/pricing-dimensions#clickpipes-pricing-faq). Running ClickPipes might also generate an indirect compute and storage cost on the destination ClickHouse Cloud service similar to any ingest workload.

- **Is there a way to handle errors or failures when using ClickPipes for Kafka?**

  Yes, ClickPipes for Kafka will automatically retry case of failures when consuming data from Kafka. ClickPipes also supports enabling a dedicated error table that will hold errors and malformed data for 7 days.
