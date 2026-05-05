---
sidebar_label: 'Introduction'
description: 'Seamlessly connect your external data sources to ClickHouse Cloud.'
slug: /integrations/clickpipes
title: 'Integrating with ClickHouse Cloud'
doc_type: 'guide'
keywords: ['ClickPipes', 'data ingestion platform', 'streaming data', 'integration platform', 'ClickHouse Cloud']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
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
import Mongodbsvg from '@site/static/images/integrations/logos/mongodb.svg';
import redpanda_logo from '@site/static/images/integrations/logos/logo_redpanda.png';
import clickpipes_stack from '@site/static/images/integrations/data-ingestion/clickpipes/clickpipes_stack.png';
import cp_custom_role from '@site/static/images/integrations/data-ingestion/clickpipes/cp_custom_role.png';
import cp_advanced_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_advanced_settings.png';
import Image from '@theme/IdealImage';

# Integrating with ClickHouse Cloud

## Introduction {#introduction}

[ClickPipes](/integrations/clickpipes) is a managed integration platform that makes ingesting data from a diverse set of sources as simple as clicking a few buttons. Designed for the most demanding workloads, ClickPipes's robust and scalable architecture ensures consistent performance and reliability. ClickPipes can be used for long-term streaming needs or one-time data loading job.

ClickPipes can be deployed and managed manually using the ClickPipes UI, as well as programmatically using [OpenAPI](/integrations/clickpipes/programmatic-access/openapi) and [Terraform](/integrations/clickpipes/programmatic-access/terraform).

<Image img={clickpipes_stack} alt="ClickPipes stack" size="lg" border/>

## Supported data sources {#supported-data-sources}

| Name                                               | Logo                                                                                             |Type| Status           | Description                                                                                          |
|----------------------------------------------------|--------------------------------------------------------------------------------------------------|----|------------------|------------------------------------------------------------------------------------------------------|
| [Apache Kafka](/integrations/clickpipes/kafka)     | <Kafkasvg class="image" alt="Apache Kafka logo" style={{width: '3rem', 'height': '3rem'}}/>      |Streaming| Stable           | Configure ClickPipes and start ingesting streaming data from Apache Kafka into ClickHouse Cloud.     |
| Confluent Cloud                                    | <Confluentsvg class="image" alt="Confluent Cloud logo" style={{width: '3rem'}}/>                 |Streaming| Stable           | Unlock the combined power of Confluent and ClickHouse Cloud through our direct integration.          |
| Redpanda                                           | <Image img={redpanda_logo} size="logo" alt="Redpanda logo"/>                                     |Streaming| Stable           | Configure ClickPipes and start ingesting streaming data from Redpanda into ClickHouse Cloud.         |
| AWS MSK                                            | <Msksvg class="image" alt="AWS MSK logo" style={{width: '3rem', 'height': '3rem'}}/>             |Streaming| Stable           | Configure ClickPipes and start ingesting streaming data from AWS MSK into ClickHouse Cloud.          |
| Azure Event Hubs                                   | <Azureeventhubssvg class="image" alt="Azure Event Hubs logo" style={{width: '3rem'}}/>           |Streaming| Stable           | Configure ClickPipes and start ingesting streaming data from Azure Event Hubs into ClickHouse Cloud. See the [Azure Event Hubs FAQ](/integrations/clickpipes/kafka/faq/#azure-eventhubs) for guidance. |
| WarpStream                                         | <Warpstreamsvg class="image" alt="WarpStream logo" style={{width: '3rem'}}/>                     |Streaming| Stable           | Configure ClickPipes and start ingesting streaming data from WarpStream into ClickHouse Cloud.       |
| Amazon S3                                          | <S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>              |Object Storage| Stable           | Configure ClickPipes to ingest large volumes of data from object storage.                            |
| Google Cloud Storage                               | <Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/>  |Object Storage| Stable           | Configure ClickPipes to ingest large volumes of data from object storage.                            |
| DigitalOcean Spaces                                | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/> | Object Storage | Stable | Configure ClickPipes to ingest large volumes of data from object storage.
| Azure Blob Storage                                 | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/> | Object Storage | Stable | Configure ClickPipes to ingest large volumes of data from object storage.
| [Amazon Kinesis](/integrations/clickpipes/kinesis) | <Amazonkinesis class="image" alt="Amazon Kenesis logo" style={{width: '3rem', height: 'auto'}}/> |Streaming| Stable           | Configure ClickPipes and start ingesting streaming data from Amazon Kinesis into ClickHouse cloud.   |
| [Postgres](/integrations/clickpipes/postgres)      | <Postgressvg class="image" alt="Postgres logo" style={{width: '3rem', height: 'auto'}}/>         |DBMS| Stable      | Configure ClickPipes and start ingesting data from Postgres into ClickHouse Cloud.                   |
| [MySQL](/integrations/clickpipes/mysql)            | <Mysqlsvg class="image" alt="MySQL logo" style={{width: '3rem', height: '3rem'}}/>               |DBMS| Public Beta | Configure ClickPipes and start ingesting data from MySQL into ClickHouse Cloud.                      |
| [MongoDB](/integrations/clickpipes/mongodb)        | <Mongodbsvg class="image" alt="MongoDB logo" style={{width: '3rem', height: '3rem'}}/>           |DBMS| Private Preview | Configure ClickPipes and start ingesting data from MongoDB into ClickHouse Cloud.                   |

More connectors will get added to ClickPipes, you can find out more by [contacting us](https://clickhouse.com/company/contact?loc=clickpipes).

## List of Static IPs {#list-of-static-ips}

The following are the static NAT IPs (separated by region) that ClickPipes uses to connect to your external services. Add your related instance region IPs to your IP allow list to allow traffic. In the case of object storage pipes you should also add the [ClickHouse cluster IPs](/manage/data-sources/cloud-endpoints-api) to your IP allow list.

For all services, ClickPipes traffic will originate from a default region based on your service's location:
- **eu-central-1**: For all EU regions not explicitly listed (including GCP and Azure EU regions).
- **eu-west-1**: For all services in AWS `eu-west-1` created on or after 20 Jan 2026 (services created before this date use `eu-central-1` IPs).
- **us-east-1**: For all services in AWS `us-east-1`.
- **ap-south-1**: For services in AWS `ap-south-1` created on or after 25 Jun 2025 (services created before this date use `us-east-2` IPs).
- **ap-northeast-2**: For services in AWS `ap-northeast-2` created on or after 14 Nov 2025 (services created before this date use `us-east-2` IPs).
- **af-south-1**: For services in AWS `af-south-1` created on or after 15 Apr 2026 (services created before this date use `us-east-2` IPs).
- **ap-east-1**: For services in AWS `ap-east-1` created on or after 15 Apr 2026 (services created before this date use `us-east-2` IPs).
- **ap-northeast-1**: For services in AWS `ap-northeast-1` created on or after 15 Apr 2026 (services created before this date use `us-east-2` IPs).
- **ap-southeast-1**: For services in AWS `ap-southeast-1` created on or after 18 Mar 2026 (services created before this date use `us-east-2` IPs).
- **ap-southeast-2**: For services in AWS `ap-southeast-2` created on or after 25 Jun 2025 (services created before this date use `us-east-2` IPs).
- **ap-southeast-3**: For services in AWS `ap-southeast-3` created on or after 6 Mar 2026 (services created before this date use `us-east-2` IPs).
- **ca-central-1**: For services in AWS `ca-central-1` created on or after 15 Apr 2026 (services created before this date use `us-east-2` IPs).
- **eu-north-1**: For services in AWS `eu-north-1` created on or after 15 Apr 2026 (services created before this date use `eu-central-1` IPs).
- **eu-west-2**: For services in AWS `eu-west-2` created on or after 15 Apr 2026 (services created before this date use `eu-central-1` IPs).
- **il-central-1**: For services in AWS `il-central-1` created on or after 15 Apr 2026 (services created before this date use `us-east-2` IPs).
- **sa-east-1**: For services in AWS `sa-east-1` created on or after 15 Apr 2026 (services created before this date use `us-east-2` IPs).
- **us-west-2**: For services in AWS `us-west-2` created on or after 24 Jun 2025 (services created before this date use `us-east-2` IPs).
- **us-east-2**: For all other regions not explicitly listed (including GCP and Azure regions).

| AWS region                                              | IP Addresses                                                                                                                                     |
|---------------------------------------------------------| ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **eu-central-1** - Frankfurt                            | `18.195.233.217`, `3.127.86.90`, `35.157.23.2`, `18.197.167.47`, `3.122.25.29`, `52.28.148.40`                                                       |
| **eu-west-1** - Ireland (from 20 Jan 2026)              | `54.228.1.92` , `54.72.101.254`, `54.228.16.208`, `54.76.200.104`, `52.211.2.177`, `54.77.10.134`                                                      |
| **us-east-1** - N. Virginia                             | `54.82.38.199`, `3.90.133.29`, `52.5.177.8`, `3.227.227.145`, `3.216.6.184`, `54.84.202.92`, `3.131.130.196`, `3.23.172.68`, `3.20.208.150`      |
| **us-east-2** - Ohio                                    | `3.131.130.196`, `3.23.172.68`, `3.20.208.150`, `3.132.20.192`, `18.119.76.110`, `3.134.185.180`                                                     |
| **ap-south-1** - Mumbai (from 25 Jun 2025)              | `13.203.140.189`, `13.232.213.12`, `13.235.145.208`, `35.154.167.40`, `65.0.39.245`, `65.1.225.89`                                                   |
| **ap-northeast-2** - Seoul (from 14 Nov 2025)           | `3.38.68.69`, `52.78.68.128`, `13.209.152.13`, `3.38.24.84`, `3.37.159.31`, `3.34.25.104`                                                            |
| **ap-southeast-1** - Singapore (from 18 Mar 2026)       | `13.215.65.134`, `18.139.118.108`, `47.130.197.47`, `54.251.134.219`, `54.254.98.29`, `54.255.153.106`                                                |
| **ap-southeast-2** - Sydney (from 25 Jun 2025)          | `3.106.48.103`, `52.62.168.142`, `13.55.113.162`, `3.24.61.148`, `54.206.77.184`, `54.79.253.17`                                                     |
| **af-south-1** - Cape Town (from 15 Apr 2026)           | `13.245.187.24`, `15.240.60.178`, `15.240.81.191`, `13.245.25.101`, `13.245.91.225`, `15.240.54.195`                                                 |
| **ap-east-1** - Hong Kong (from 15 Apr 2026)            | `18.166.168.168`, `43.199.224.85`, `95.40.0.242`, `16.162.107.229`, `43.199.125.240`, `54.46.86.27`                                                  |
| **ap-northeast-1** - Tokyo (from 15 Apr 2026)           | `54.168.88.92`, `35.76.97.79`, `54.64.100.89`, `54.178.40.17`, `52.195.101.208`, `13.193.109.245`                                                    |
| **ap-southeast-1** - Singapore (from 18 Mar 2026)       | `47.130.197.47`, `54.251.134.219`, `18.139.118.108`, `54.255.153.106`, `54.254.98.29`, `13.215.65.134`                                               |
| **ap-southeast-3** - Jakarta (from 6 Mar 2026)          | `16.78.195.195`, `43.218.184.235`, `16.79.88.54`, `16.78.153.162`, `16.79.6.125`, `108.137.52.155`                                                   |
| **ca-central-1** - Canada (from 15 Apr 2026)            | `52.60.123.235`, `3.97.222.98`, `3.99.62.248`, `15.223.61.186`, `3.96.255.101`, `3.97.29.96`                                                         |
| **eu-north-1** - Stockholm (from 15 Apr 2026)           | `13.63.1.65`, `16.171.127.30`, `56.228.76.44`, `13.63.101.248`, `16.170.124.188`, `13.60.109.201`                                                    |
| **eu-west-2** - London (from 15 Apr 2026)               | `13.134.82.158`, `16.60.209.167`, `18.134.221.203`, `16.60.139.176`, `13.43.66.75`, `3.11.78.183`                                                    |
| **il-central-1** - Tel Aviv (from 15 Apr 2026)          | `16.164.25.13`, `51.84.162.29`, `51.85.90.183`, `51.84.36.146`, `51.84.72.29`, `51.85.28.184`                                                        |
| **sa-east-1** - São Paulo (from 15 Apr 2026)            | `18.230.164.131`, `56.126.1.234`, `18.230.39.24`, `15.229.102.116`, `18.230.174.204`, `18.229.237.116`                                               |
| **us-west-2** - Oregon (from 24 Jun 2025)               | `52.42.100.5`, `44.242.47.162`, `52.40.44.52`, `44.227.206.163`, `44.246.241.23`, `35.83.230.19`                                                     |

## Adjusting ClickHouse settings {#adjusting-clickhouse-settings}
ClickHouse Cloud provides sensible defaults for most of the use cases. However, if you need to adjust some ClickHouse settings for the ClickPipes destination tables, a dedicated role for ClickPipes is the most flexible solution.
Steps:
1. create a custom role `CREATE ROLE my_clickpipes_role SETTINGS ...`. See [CREATE ROLE](/sql-reference/statements/create/role.md) syntax for details.
2. add the custom role to ClickPipes user on step `Details and Settings` during the ClickPipes creation.

<Image img={cp_custom_role} alt="Assign a custom role" size="lg" border/>

## Adjusting ClickPipes advanced settings {#clickpipes-advanced-settings}
ClickPipes provides sensible defaults that cover the requirements of most use cases. If your use case requires additional fine-tuning, you can adjust the following settings:

### Object storage ClickPipes {#clickpipes-advanced-settings-object-storage}

| Setting                            | Default value |  Description                     |
|------------------------------------|---------------|---------------------------------------------------------------------------------------|
| `Max insert bytes`                 | 10 GB         | Number of bytes to process in a single insert batch.                                  |
| `Max file count`                   | 100           | Maximum number of files to process in a single insert batch.                          |
| `Max threads`                      | auto(3)       | [Maximum number of concurrent threads](/operations/settings/settings#max_threads) for file processing. |
| `Max insert threads`               | 1             | [Maximum number of concurrent insert threads](/operations/settings/settings#max_insert_threads) for file processing. |
| `Min insert block size bytes`      | 1 GB          | [Minimum size of bytes in the block](/operations/settings/settings#min_insert_block_size_bytes) which can be inserted into a table. |
| `Max download threads`             | 4             | [Maximum number of concurrent download threads](/operations/settings/settings#max_download_threads). |
| `Object storage polling interval`  | 30 s          | Configures the maximum wait period before inserting data into the ClickHouse cluster. |
| `Parallel distributed insert select` | 2           | [Parallel distributed insert select setting](/operations/settings/settings#parallel_distributed_insert_select). |
| `Parallel view processing`         | false         | Whether to enable pushing to attached views [concurrently instead of sequentially](/operations/settings/settings#parallel_view_processing). |
| `Use cluster function`             | true          | Whether to process files in parallel across multiple nodes. |

<Image img={cp_advanced_settings} alt="Advanced settings for ClickPipes" size="lg" border/>

### Streaming ClickPipes {#clickpipes-advanced-settings-streaming}

| Setting                            | Default value |  Description                     |
|------------------------------------|---------------|---------------------------------------------------------------------------------------|
| `Streaming max insert wait time`   | 5 s           | Configures the maximum wait period before inserting data into the ClickHouse cluster. |

## Error reporting {#error-reporting}
ClickPipes will store errors in two separate tables depending on the type of error encountered during the ingestion process.
### Record errors {#record-errors}
ClickPipes will create a table next to your destination table with the postfix `<destination_table_name>_clickpipes_error`. This table will contain any errors from malformed data or mismatched schema and will include the entirety of the invalid message. This table has a [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) of 7 days.
### System errors {#system-errors}
Errors related to the operation of the ClickPipe will be stored in the `system.clickpipes_log` table. This will store all other errors related to the operation of your ClickPipe (network, connectivity, etc.). This table has a [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) of 7 days.

If ClickPipes can't connect to a data source after 15 min or to a destination after 1 hr, the ClickPipes instance stops and stores an appropriate message in the system error table (provided the ClickHouse instance is available).

## FAQ {#faq}
- **What is ClickPipes?**

  ClickPipes is a ClickHouse Cloud feature that makes it easy for you to connect your ClickHouse services to external data sources, specifically Kafka. With ClickPipes for Kafka, you can easily continuously load data into ClickHouse, making it available for real-time analytics.

- **Does ClickPipes support data transformation?**

  Yes, ClickPipes supports basic data transformation by exposing the DDL creation. You can then apply more advanced transformations to the data as it is loaded into its destination table in a ClickHouse Cloud service leveraging ClickHouse's [materialized views feature](/guides/developer/cascading-materialized-views).

- **Does using ClickPipes incur an additional cost?**

  ClickPipes is billed on two dimensions: Ingested Data and Compute. The full details of the pricing are available on [this page](/cloud/reference/billing/clickpipes). Running ClickPipes might also generate an indirect compute and storage cost on the destination ClickHouse Cloud service similar to any ingest workload.

- **Is there a way to handle errors or failures when using ClickPipes for Kafka?**

  Yes, ClickPipes for Kafka will automatically retry in the event of failures when consuming data from Kafka for any operational issue including network issues, connectivity issues, etc. In the event of malformed data or invalid schema, ClickPipes will store the record in the record_error table and continue processing.
