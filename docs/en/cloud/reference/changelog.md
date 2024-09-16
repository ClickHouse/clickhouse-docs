---
slug: /en/whats-new/cloud
sidebar_label: Cloud Changelog
title: Cloud Changelog
---

In addition to this ClickHouse Cloud changelog, please see the [Cloud Compatibility](/docs/en/cloud/reference/cloud-compatibility.md) page.

## August 29, 2024

### New Terraform provider version - v1.0.0

Terrafrom allows you to control your ClickHouse Cloud services programmatically, then store your configuration as code. Our Terraform provider has almost 200,000 downloads and is now officially v1.0.0! This new version includes improvements such as better retry logic and a new resource to attach private endpoints to your ClickHouse Cloud service. You can download the [Terraform provider here](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest) and view the [full changelog here](https://github.com/ClickHouse/terraform-provider-clickhouse/releases/tag/v1.0.0).

### 2024 SOC 2 Type II report and updated ISO 27001 certificate

We are proud to announce the availability of our 2024 SOC 2 Type II report and updated ISO 27001 certificate, both of which include our recently launched services on Azure as well as continued coverage of services in AWS and GCP.

Our SOC 2 Type II demonstrates our ongoing commitment to achieving security, availability, processing integrity and confidentiality of the services we provide to ClickHouse users. For more information, check out [SOC 2 - SOC for Service Organizations: Trust Services Criteria](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services) issued by the American Institute of Certified Public Accountants (AICPA) and [What is ISO/IEC 27001](https://www.iso.org/standard/27001) from the International Standards Organization (ISO).

Please also check out our [Trust Center](https://trust.clickhouse.com/) for security and compliance documents and reports.

## August 15, 2024

### Compute-compute separation is now in Private Preview for AWS

For existing ClickHouse Cloud services, replicas handle both reads and writes, and there is no way to configure a certain replica to handle only one kind of operation. We have an upcoming new feature called Compute-compute separation that allows you to designate specific services as read-write or read-only services, allowing you to design the optimal compute configuration for your application to optimize cost and performance.

Our new compute-compute separation feature enables you to create multiple compute node groups, each with its own endpoint, that are using the same object storage folder, and thus, with the same tables, views, etc. Read more about [Compute-compute separation here](/en/cloud/reference/compute-compute-separation). Please [contact support](https://clickhouse.com/support/program) if you would like access to this feature in Private Preview.

<img alt="Example architecture for compute-compute separation"
  style={{width: '600px'}}
  src={require('./images/aug-15-compute-compute.png').default} />

### ClickPipes for S3 and GCS now in GA, Continuous mode support

ClickPipes is the easiest way to ingest data into ClickHouse Cloud. We're happy to announce that [ClickPipes](https://clickhouse.com/cloud/clickpipes) for S3 and GCS is now **Generally Available**. ClickPipes supports both one-time batch ingest and "continuous mode". An ingest task will load all the files matched by a pattern from a specific remote bucket into the ClickHouse destination table. In "continuous mode", the ClickPipes job will run constantly, ingesting matching files that get added into the remote object storage bucket as they arrive. This will allow users to turn any object storage bucket into a fully fledged staging area for ingesting data into ClickHouse Cloud. Read more about ClickPipes in [our documentation](/en/integrations/clickpipes).

## July 18, 2024

### Prometheus Endpoint for Metrics is now Generally Available

In our last cloud changelog, we announced the Private Preview for exporting [Prometheus](https://prometheus.io/) metrics from ClickHouse Cloud. This feature allows you to use the [ClickHouse Cloud API](/en/cloud/manage/api/api-overview) to get your metrics into tools like [Grafana](https://grafana.com/) and [Datadog](https://www.datadoghq.com/) for visualization. We're happy to announce that this feature is now **Generally Available**. Please see [our docs](/en/integrations/prometheus) to learn more about this feature.

### Table Inspector in Cloud Console

ClickHouse has commands like [`DESCRIBE`](/en/sql-reference/statements/describe-table) that allow you to introspect your table to examine schema. These commands output to the console, but they are often not convenient to use as you need to combine several queries to retrieve all pertinent data about your tables and columns.

We recently launched a **Table Inspector** in the cloud console which allows you to retrieve important table and column information in the UI, without having to write SQL. You can try out the Table Inspector for your services by checking out the cloud console. It provides information about your schema, storage, compression, and more in one unified interface.

<img alt="Table Inspector UI"
  style={{width: '800px', marginLeft: 0}}
  src={require('./images/july-18-table-inspector.png').default} />

### New Java Client API

Our [Java Client](https://github.com/ClickHouse/clickhouse-java) is one of the most popular clients that users use to connect to ClickHouse. We wanted to make it even easier and more intuitive to use, including a re-designed API and various performance optimizations. These changes will make it much easier to connect to ClickHouse from your Java applications. You can read more about how to use the updated Java Client in this [blog post](https://clickhouse.com/blog/java-client-sequel).

### New Analyzer is enabled by default

For the last couple of years, we've been working on a new analyzer for query analysis and optimization. This analyzer improves query performance and will allow us to make further optimizations, including faster and more efficient `JOIN`s. Previously, it was required that new users enable this feature using the setting `allow_experimental_analyzer`. This improved analyzer is now available on new ClickHouse Cloud services by default.

Stay tuned for more improvements to the analyzer as we have many more optimizations planned!

## June 28, 2024

### ClickHouse Cloud for Microsoft Azure is now Generally Available!

We first announced Microsoft Azure support in Beta [this past May](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta). In this latest cloud release, we're happy to announce that our Azure support is transitioning from Beta to Generally Available. ClickHouse Cloud is now available on all the three major cloud platforms: AWS, Google Cloud Platform, and now Microsoft Azure.

This release also includes support for subscriptions via the [Microsoft Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/clickhouse.clickhouse_cloud). The service will initially be supported in the following regions:
- United States: West US 3 (Arizona)
- United States: East US 2 (Virginia)
- Europe: Germany West Central (Frankfurt)

If you'd like any specific region to be supported, please [contact us](https://clickhouse.com/support/program).

### Query Log Insights

Our new Query Insights UI in the Cloud Console makes ClickHouse's built-in query log a lot easier to use. ClickHouse's `system.query_log` table is a key source of information for query optimization, debugging, and monitoring overall cluster health and performance.  There's just one caveat: with 70+ fields and multiple records per query, interpreting the query log represents a steep learning curve. This initial version of query insights provides a blueprint for future work to simplify query debugging and optimization patterns. We'd love to hear your feedback as we continue to iterate on this feature, so please reach out—your input will be greatly appreciated!

<img alt="Query Insights UI"
  style={{width: '600px', marginLeft: 0}}
  src={require('./images/june-28-query-insights.png').default} />

### Prometheus Endpoint for Metrics (Private Preview)

Perhaps one of our most requested features: you can now export [Prometheus](https://prometheus.io/) metrics from ClickHouse Cloud to [Grafana](https://grafana.com/) and [Datadog](https://www.datadoghq.com/) for visualization. Prometheus provides an open-source solution to monitor ClickHouse and set up custom alerts. Access to Prometheus metrics for your ClickHouse Cloud service is available via the [ClickHouse Cloud API](https://clickhouse.com/docs/en/integrations/prometheus). This feature is currently in Private Preview. Please reach out to the [support team](https://clickhouse.com/support/program) to enable this feature for your organization.

<img alt="Prometheus Metrics with Grafana"
  style={{width: '600px', marginLeft: 0}}
  src={require('./images/june-28-prometheus.png').default} />

### Other features:
- [Configurable backups](/en/cloud/manage/backups#configurable-backups) to configure custom backup policies like frequency, retention, and schedule are now Generally Available.

## June 13, 2024

### Configurable offsets for Kafka ClickPipes Connector (Beta)

Until recently, whenever you set up a new [Kafka Connector for ClickPipes](/docs/en/integrations/clickpipes/kafka), it always consumed data from the beginning of the Kafka topic. In this situation, it may not be flexible enough to fit specific use cases when you need to reprocess historical data, monitor new incoming data, or resume from a precise point.

ClickPipes for Kafka has added a new feature that enhances the flexibility and control over data consumption from Kafka topics. You can now configure the offset from which data is consumed. 

The following options are available:
- From the beginning: Start consuming data from the very beginning of the Kafka topic. This option is ideal for users who need to reprocess all historical data.
- From latest: Begin consuming data from the most recent offset. This is useful for users who are only interested in new messages.
- From a timestamp: Start consuming data from messages that were produced at or after a specific timestamp. This feature allows for more precise control, enabling users to resume processing from an exact point in time.

<img alt="Configure offsets for Kafka connector"
  style={{width: '600px', marginLeft: 0}}
  src={require('./images/june-13-kafka-config.png').default} />

### Enroll services to the Fast release channel

The Fast release channel allows your services to receive updates ahead of the release schedule. Previously, this feature required assistance from the support team to enable. Now, you can use the ClickHouse Cloud console to enable this feature for your services directly. Simply navigate to **Settings**, and click **Enroll in fast releases**. Your service will now receive updates as soon as they are available! 

<img alt="Enroll in Fast releases"
  style={{width: '500px', marginLeft: 0}}
  src={require('./images/june-13-fast-releases.png').default} />

### Terraform support for horizontal scaling

ClickHouse Cloud supports [horizontal scaling](/docs/en/manage/scaling#vertical-and-horizontal-scaling), or the ability to add additional replicas of the same size to your services. Horizontal scaling improves performance and parallelization to support concurrent queries. Previously, adding more replicas required either using the ClickHouse Cloud console or the API. You can now use Terraform to add or remove replicas from your service, allowing you to programmatically scale your ClickHouse services as needed.

Please see the [ClickHouse Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) for more information.

## May 30, 2024

### Share queries with your teammates

When you write a SQL query, there's a good chance that other people on your team would also find that query useful. Previously, you'd have to send a query over Slack or email and there'd be no way for a teammate to automatically receive updates for that query if you edit it.

We're happy to announce that you can now easily share queries via the ClickHouse Cloud console. From the query editor, you can share a query directly with your entire team or a specific team member. You can also specify whether they have read or write only access. Click on the **Share** button in the query editor to try out the new shared queries feature.

<img alt="Share queries" style={{width: '500px', marginLeft: 0}} src={require('./images/may-30-share-queries.png').default} />

### ClickHouse Cloud for Microsoft Azure is now in beta

We've finally launched the ability to create ClickHouse Cloud services on Microsoft Azure! We already have many customers using ClickHouse Cloud on Azure in production as part of our Private Preview program. Now, anyone can create their own service on Azure. All of your favorite ClickHouse features that are supported on AWS and GCP will also work on Azure.

We expect to have ClickHouse Cloud for Azure ready for General Availability in the next few weeks. [Read this blog post](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta) to learn more, or create your new service using Azure via the ClickHouse Cloud console.

Note: **Development** services for Azure are not supported at this time.

### Set up Private Link via the Cloud Console

Our Private Link feature allows you to connect your ClickHouse Cloud services with internal services in your cloud provider account without having to direct traffic to the public internet, saving costs and enhancing security. Previously, this was difficult to set up and required using the ClickHouse Cloud API.

You can now configure private endpoints in just a few clicks directly from the ClickHouse Cloud console. Simply go to your service's **Settings**, go to the **Security** section and click **Set up private endpoint**.

![Set up private endpoint](./images/may-30-private-endpoints.png)

## May 17, 2024

### Ingest data from Amazon Kinesis using ClickPipes (Beta)

ClickPipes is an exclusive service provided by ClickHouse Cloud to ingest data without code. Amazon Kinesis is AWS's fully managed streaming service to ingest and store data streams for processing. We are thrilled to launch the ClickPipes beta for Amazon Kinesis, one of our most requested integrations. We're looking to add more integrations to ClickPipes, so please let us know which data source you'd like us to support! Read more about this feature [here](https://clickhouse.com/blog/clickpipes-amazon-kinesis).

You can try the new Amazon Kinesis integration for ClickPipes in the cloud console:

![Amazon Kinesis on ClickPipes](./images/may-17-kinesis.png)

### Configurable Backups (Private Preview)

Backups are important for every database (no matter how reliable), and we've taken backups very seriously since day 1 of ClickHouse Cloud. This week, we launched Configurable Backups, which allows for much more flexibility for your service's backups. You can now control start time, retention, and frequency. This feature is available for **Production** and **Dedicated** services and is not available for **Development** services. As this feature is in private preview, please contact support@clickhouse.com to enable this for your service. Read more about configurable backups [here](https://clickhouse.com/blog/configurable-backups-in-clickhouse-cloud).

### Create APIs from your SQL queries (Beta)

When you write a SQL query for ClickHouse, you still need to connect to ClickHouse via a driver to expose your query to your application. Now with our now **Query Endpoints** feature, you can execute SQL queries directly from an API without any configuration. You can specify the query endpoints to return JSON, CSV, or TSVs. Click the “Share” button in the cloud console to try this new feature with your queries. Read more about Query Endpoints [here](https://clickhouse.com/blog/automatic-query-endpoints).

<img alt="Configure query endpoints" style={{width: '450px', marginLeft: 0}} src={require('./images/may-17-query-endpoints.png').default} />

### Official ClickHouse Certification is now available

There are 12 free training modules in ClickHouse Develop training course. Prior to this week, there was no official way to prove your mastery in ClickHouse. We recently launched an official exam to become a **ClickHouse Certified Developer**. Completing this exam allows you to share with current and prospective employers your mastery in ClickHouse on topics including data ingestion, modeling, analysis, performance optimization, and more. You can take the exam [here](https://clickhouse.com/learn/certification) or read more about ClickHouse certification in this [blog post](https://clickhouse.com/blog/first-official-clickhouse-certification).

## April 25, 2024

### Load data from S3 and GCS using ClickPipes

You may have noticed in our newly released cloud console that there’s a new section called “Data sources”. The “Data sources” page is powered by ClickPipes, a native ClickHouse Cloud feature which lets you easily insert data from a variety of sources into ClickHouse Cloud.

Our most recent ClickPipes update features the ability to directly upload data directly from Amazon S3 and Google Cloud Storage. While you can still use our built-in table functions, ClickPipes is a fully-managed service via our UI that will let you ingest data from S3 and GCS in just a few clicks. This feature is still in Private Preview, but you can try it out today via the cloud console.

![ClickPipes S3 and GCS](./images/clickpipes-s3-gcs.png)

### Use Fivetran to load data from 500+ sources into ClickHouse Cloud

ClickHouse can quickly query all of your large datasets, but of course, your data must first be inserted into ClickHouse. Thanks to Fivetran's comprehensive range of connectors, users can now quickly load data from over 500 sources. Whether you need to load data from Zendesk, Slack, or any of your favorite applications, the new ClickHouse destination for Fivetran now lets you use ClickHouse as the target database for your application data.

This is an open-source integration built over many months of hard work by our Integrations team. You can check out our [release blog post](https://clickhouse.com/blog/fivetran-destination-clickhouse-cloud) here and the [GitHub repository](https://github.com/ClickHouse/clickhouse-fivetran-destination).

### Other changes

**Console changes**
- Output formats support in the SQL console

**Integrations changes**
- ClickPipes Kafka connector supports multi-broker setup
- PowerBI connector supports providing ODBC driver configuration options.

## April 18, 2024

### AWS Tokyo region is now available for ClickHouse Cloud

This release introduces the new AWS Tokyo region (`ap-northeast-1`) for ClickHouse Cloud. Because we want ClickHouse to be the fastest database, we are continuously adding more regions for every cloud to reduce latency as much as possible. You can create your new service in Tokyo in the updated cloud console.

![Create Tokyo Service](./images/create-tokyo-service.png)

Other changes:

### Console changes
- Avro format support for ClickPipes for Kafka is now Generally Available
- Implement full support for importing resources (services and private endpoints) for the Terraform provider

### Integrations changes
- NodeJS client major stable release: Advanced TypeScript support for query + ResultSet, URL configuration
- Kafka Connector: Fixed a bug with ignoring exceptions when writing into DLQ, added support for Avro Enum type, published guides for using the connector on [MSK](https://www.youtube.com/watch?v=6lKI_WlQ3-s) and [Confluent Cloud](https://www.youtube.com/watch?v=SQAiPVbd3gg)
- Grafana: Fixed support Nullable type support in UI, fixed support for dynamic OTEL tracing table name
- DBT: Fixed model settings for custom materialization. 
- Java client: Fixed bug with incorrect error code parsing
- Python client: Fixed parameters binding for numeric types, fixed bugs with number list in query binding, added SQLAlchemy Point support.


## April 4, 2024

### Introducing the new ClickHouse Cloud Console

This release introduces a private preview for the new cloud console.

At ClickHouse, we are constantly thinking about how to improve the developer experience. We recognize that it is not enough to provide the fastest real-time data warehouse, it also needs to be easy to use and manage.

Thousands of ClickHouse Cloud users execute billions of queries on our SQL console every month, which is why we've decided to invest more in a world-class console to make it easier than ever to interact with your ClickHouse Cloud services. Our new cloud console experience combines our standalone SQL editor with our management console in one intuitive UI.

Select customers will receive a preview of our new cloud console experience –  a unified and immersive way to explore and manage your data in ClickHouse. Please reach out to us at support@clickhouse.com if you'd like priority access.

![New Cloud Console](./images/new-cloud-console.gif)

## March 28, 2024

This release introduces support for Microsoft Azure, Horizontal Scaling via API, and Release Channels in Private Preview. 

### General updates
- Introduced support for Microsoft Azure in Private Preview. To gain access, please reach out to account management or support, or join the [waitlist](https://clickhouse.com/cloud/azure-waitlist).
- Introduced Release Channels – the ability to specify the timing of upgrades based on environment type. In this release, we added the “fast” release channel, which enables you to upgrade your non-production environments ahead of production (please contact support to enable).

### Administration changes
- Added support for horizontal scaling configuration via API (private preview, please contact support to enable)
- Improved autoscaling to scale up services encountering out of memory errors on startup
- Added support for CMEK for AWS via the Terraform provider

### Console changes
- Added support for Microsoft social login
- Added parameterized query sharing capabilities in SQL console
- Improved query editor performance significantly (from 5 secs to 1.5 sec latency in some EU regions)

### Integrations changes
- ClickHouse OpenTelemetry exporter: [Added support](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31920) for ClickHouse replication table engine and [added integration tests](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31896)
- ClickHouse DBT adapter: Added support for [materialization macro for dictionaries](https://github.com/ClickHouse/dbt-clickhouse/pull/255), [tests for TTL expression support](https://github.com/ClickHouse/dbt-clickhouse/pull/254)
- ClickHouse Kafka Connect Sink: [Added compatibility](https://github.com/ClickHouse/clickhouse-kafka-connect/issues/350) with Kafka plugin discovery (community contribution)
- ClickHouse Java Client: Introduced [a new package](https://github.com/ClickHouse/clickhouse-java/pull/1574) for new client API and [added test coverage](https://github.com/ClickHouse/clickhouse-java/pull/1575) for Cloud tests
- ClickHouse NodeJS Client: Extended tests and documentation for new HTTP keep-alive behavior. Available since v0.3.0 release
- ClickHouse Golang Client: [Fixed a bug](https://github.com/ClickHouse/clickhouse-go/pull/1236) for Enum as a key in Map; [fixed a bug](https://github.com/ClickHouse/clickhouse-go/pull/1237) when an errored connection is left in the connection pool (community contribution)
- ClickHouse Python Client: [Added support](https://github.com/ClickHouse/clickhouse-connect/issues/155) for query streaming via PyArrow (community contribution)

### Security updates
- Updated ClickHouse Cloud to prevent [“Role-based Access Control is bypassed when query caching is enabled”](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r) (CVE-2024-22412)

## March 14, 2024

This release makes available in early access the new Cloud Console experience, ClickPipes for bulk loading from S3 and GCS, and support for Avro format in ClickPipes for Kafka. It also upgrades the ClickHouse database version to 24.1, bringing support for new functions as well as performance and resource usage optimizations.

### Console changes 
- New Cloud Console experience is available in early access (please contact support if you’re interested in participating).
- ClickPipes for bulk loading from S3 and GCS are available in early access (please contact support if you’re interested in participating).
- Support for Avro format in ClickPipes for Kafka is available in early access (please contact support if you’re interested in participating).

### ClickHouse version upgrade
- Optimizations for FINAL, vectorization improvements, faster aggregations - see [23.12 release blog](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final) for details.
- New functions for processing punycode, string similarity, detecting outliers, as well as memory optimizations for merges and Keeper - see [24.1 release blog](https://clickhouse.com/blog/clickhouse-release-24-01) and [presentation](https://presentations.clickhouse.com/release_24.1/) for details.
- This ClickHouse cloud version is based on 24.1, you can see dozens of new features, performance improvements, and bug fixes. See core database [changelogs](/docs/en/whats-new/changelog/2023#2312) for details.

### Integrations changes
- Grafana: Fixed dashboard migration for v4, ad-hoc filtering logic
- Tableau Connector: Fixed DATENAME function and rounding for “real” arguments
- Kafka Connector: Fixed NPE in connection initialization, added ability to specify JDBC driver options
- Golang client: Reduced the memory footprint for handling responses, fixed Date32 extreme values, fixed error reporting when compression is enabled
- Python client: Improved timezone support in datetime parameters, improved performance for Pandas DataFrame

## February 29, 2024

This release improves SQL console application load time, adds support for SCRAM-SHA-256 authentication in ClickPipes, and extends nested structure support to Kafka Connect.

### Console changes
- Optimized SQL console application initial load time
- Fixed SQL console race condition resulting in ‘authentication failed’ error
- Fixed behavior on the monitoring page where most recent memory allocation value was sometimes incorrect
- Fixed behavior where SQL console sometimes issue duplicate KILL QUERY commands
- Added support in ClickPipes for SCRAM-SHA-256 authentication method for Kafka-based data sources 

### Integrations changes
- Kafka Connector: Extended support for complex nested structures (Array, Map); added support for FixedString type; added support for ingestion into multiple databases
- Metabase: Fixed incompatibility with ClickHouse lower than version 23.8
- DBT: Added the ability to pass settings to model creation
- Node.js client: Added support for long-running queries (>1hr) and handling of empty values gracefully

## February 15, 2024

This release upgrades the core database version, adds ability to set up private links via Terraform, and adds support for exactly once semantics for asynchronous inserts through Kafka Connect.

### ClickHouse version upgrade
- S3Queue table engine for continuous, scheduled data loading from S3 is production-ready - [see 23.11 release blog](https://clickhouse.com/blog/clickhouse-release-23-11) for details.
- Significant performance improvements for FINAL and vectorization improvements for SIMD instructions resulting in faster queries - [see 23.12 release blog](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final) for details.
- This ClickHouse cloud version is based on 23.12, you can see dozens of new features, performance improvements, and bug fixes. See [core database changelogs](https://clickhouse.com/docs/en/whats-new/changelog/2023#2312) for details.

### Console changes
- Added ability to set up AWS Private Link and GCP Private Service Connect through Terraform provider
- Improved resiliency for remote file data imports
- Added import status details flyout to all data imports
- Added key/secret key credential support to s3 data imports  

### Integrations changes
* Kafka Connect
    * Support async_insert for exactly once (disabled by default)
* Golang client
    * Fixed DateTime binding 
    * Improved batch insert performance
* Java client
    * Fixed request compression problem
 
### Settings changes
* `use_mysql_types_in_show_columns` is no longer required. It will be automatically enabled when you connect through the MySQL interface.
* `async_insert_max_data_size` now has the default value of `10 MiB`

## February 2, 2024

This release brings availability of ClickPipes for Azure Event Hub, dramatically improves workflow for logs and traces navigation using v4 ClickHouse Grafana connector, and debuts support for Flyway and Atlas database schema management tools. 

### Console changes
* Added ClickPipes support for Azure Event Hub
* New services are launched with default idling time of 15 mins

### Integrations changes
* [ClickHouse data source for Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) v4 release
  * Completely rebuilt query builder to have specialized editors for Table, Logs, Time Series, and Traces
  * Completely rebuilt SQL generator to support more complicated and dynamic queries
  * Added first-class support for OpenTelemetry in Log and Trace views
  * Extended Configuration to allow to specify default tables and columns for Logs and Traces
  * Added ability to specify custom HTTP headers
  * And many more improvements - check the full [changelog](https://github.com/grafana/clickhouse-datasource/blob/main/CHANGELOG.md#400)
* Database schema management tools
  * [Flyway added ClickHouse support](https://github.com/flyway/flyway-community-db-support/packages/2037428)
  * [Ariga Atlas added ClickHouse support](https://atlasgo.io/blog/2023/12/19/atlas-v-0-16#clickhouse-beta-program) 
* Kafka Connector Sink
  * Optimized ingestion into a table with default values
  * Added support for string-based dates in DateTime64
* Metabase
  * Added support for a connection to multiple databases


## January 18, 2024

This release brings a new region in AWS (London / eu-west-2), adds ClickPipes support for RedPanda, Upstash, and Warpstream, and improves reliability of the [is_deleted](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) core database capability. 

### General changes
- New AWS Region: London (eu-west-2)

### Console changes
- Added ClickPipes support for RedPanda, Upstash, and Warpstream
- Made the ClickPipes authentication mechanism configurable in the UI

### Integrations changes 
- Java client:
  - Breaking changes: Removed the ability to specify random URL handles in the call. This functionality has been removed from ClickHouse
  - Deprecations: Java CLI client and GRPC packages
  - Added support for RowBinaryWithDefaults format to reduce the batch size and workload on ClickHouse instance (request by Exabeam)
  - Made Date32 and DateTime64 range boundaries compatible with ClickHouse, compatibility with Spark Array string type,  node selection mechanism
- Kafka Connector: Added a JMX monitoring dashboard for Grafana
- PowerBI: Made ODBC driver settings configurable in the UI
- JavaScript client: Exposed query summary information, allow to provide a subset of specific columns for insertion, make keep_alive configurable for web client 
- Python client: Added Nothing type support for SQLAlchemy

### Reliability changes
- User-facing backward incompatible change: Previously, two features ([is_deleted](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) and ``OPTIMIZE CLEANUP``) under certain conditions could lead to corruption of the data in ClickHouse. To protect the integrity of the data of our users, while keeping the core of the functionality, we adjusted how this feature works. Specifically, the MergeTree setting ``clean_deleted_rows`` is now deprecated and has no effect anymore. The ``CLEANUP`` keyword is not allowed by default (to use it you will need to enable ``allow_experimental_replacing_merge_with_cleanup``). If you decide to use ``CLEANUP``, you need to make sure that it is always used together with ``FINAL``, and you must guarantee that no rows with older versions will be inserted after you run ``OPTIMIZE FINAL CLEANUP``. 


## December 18, 2023

This release brings a new region in GCP (us-east1), ability to self-service secure endpoint connections, support for additional integrations including DBT 1.7, and numerous bug fixes and security enhancements. 

### General changes
- ClickHouse Cloud is now available in GCP us-east1 (South Carolina) region
- Enabled ability to set up AWS Private Link and GCP Private Service Connect via OpenAPI 

### Console changes 
- Enabled seamless login to SQL console for users with the Developer role
- Streamlined workflow for setting idling controls during onboarding

### Integrations changes
- DBT connector: Added support for DBT up to v1.7 
- Metabase: Added support for Metabase v0.48
- PowerBI Connector: Added ability to run on PowerBI Cloud
- Make permissions for ClickPipes internal user configurable
- Kafka Connect
  - Improved deduplication logic and ingestion of Nullable types.
  - Add support text-based formats (CSV, TSV)
- Apache Beam: add support for Boolean and LowCardinality types
- Nodejs client: add support for Parquet format

### Security announcements 
- Patched 3 security vulnerabilities - see [security changelog](https://clickhouse.com/docs/en/whats-new/security-changelog) for details:
  - CVE 2023-47118 (CVSS 7.0) - a heap buffer overflow vulnerability affecting the native interface running by default on port 9000/tcp
  - CVE-2023-48704 (CVSS 7.0) - a heap buffer overflow vulnerability affecting the native interface running by default on port 9000/tcp
  - CVE 2023-48298 (CVSS 5.9) - an integer underflow vulnerability in the FPC compressions codec


## November 22, 2023

This release upgrades the core database version, improves login and authentication flow, and adds proxy support to Kafka Connect Sink.

### ClickHouse version upgrade

- Dramatically improved performance for reading Parquet files. See [23.8 release blog](https://clickhouse.com/blog/clickhouse-release-23-08) for details. 
- Added type inference support for JSON. See [23.9 release blog](https://clickhouse.com/blog/clickhouse-release-23-09) for details. 
- Introduced powerful analyst-facing functions like `ArrayFold`. See [23.10 release blog](https://clickhouse.com/blog/clickhouse-release-23-10) for details.
- **User-facing backward-incompatible change**: Disabled setting `input_format_json_try_infer_numbers_from_strings` by default to avoid inferring numbers from strings in JSON format. Doing so can create possible parsing errors when sample data contains strings similar to numbers.
- Dozens of new features, performance improvements, and bug fixes. See [core database changelogs](https://clickhouse.com/docs/en/whats-new/changelog) for details.

### Console changes

- Improved login and authentication flow.
- Improved AI-based query suggestions to better support large schemas.

### Integrations changes

- Kafka Connect Sink: Added proxy support, `topic-tablename` mapping, and configurability for Keeper _exactly-once_ delivery properties.
- Node.js client: Added support for Parquet format.
- Metabase: Added `datetimeDiff` function support.
- Python client: Added support for special characters in column names. Fixed timezone parameter binding.

## November 2, 2023

This release adds more regional support for development services in Asia, introduces key rotation functionality to customer-managed encryption keys, improved granularity of tax settings in the billing console and a number of bug fixes across supported language clients.

### General updates
- Development services are now available in AWS for `ap-south-1` (Mumbai) and `ap-southeast-1` (Singapore)
- Added support for key rotation in customer-managed encryption keys (CMEK) 

### Console changes
- Added ability to configure granular tax settings when adding a credit card

### Integrations changes
- MySQL 
  - Improved Tableau Online and QuickSight support via MySQL 
- Kafka Connector
  - Introduced a new StringConverter to support text-based formats (CSV, TSV)
  - Added support for Bytes and Decimal data types
  - Adjusted Retryable Exceptions to now always be retried (even when errors.tolerance=all)
- Node.js client
  - Fixed an issue with streamed large datasets providing corrupted results
- Python client
  - Fixed timeouts on large inserts
  - Fixed Numpy/Pandas Date32 issue
​​- Golang client 
  - Fixed insertion of an empty map into JSON column, compression buffer cleanup, query escaping, panic on zero/nil for IPv4 and IPv6
  - Added watchdog on canceled inserts
- DBT
  - Improved distributed table support with tests

## October 19, 2023

This release brings usability and performance improvements in the SQL console, better IP data type handling in the Metabase connector, and new functionality in the Java and Node.js clients.

### Console changes
- Improved usability of the SQL console (e.g. preserve column width between query executions)
- Improved performance of the SQL console
  
### Integrations changes 
- Java client:
  - Switched the default network library to improve performance and reuse open connections
  - Added proxy support
  - Added support for secure connections with using Trust Store
- Node.js client: Fixed keep-alive behavior for insert queries
- Metabase: Fixed IPv4/IPv6 column serialization

## September 28, 2023

This release brings general availability of ClickPipes for Kafka, Confluent Cloud, and Amazon MSK and the Kafka Connect ClickHouse Sink, self-service workflow to secure access to Amazon S3 via IAM roles, and AI-assisted query suggestions ( private preview).

### Console changes
- Added a self-service workflow to secure [access to Amazon S3 via IAM roles](/docs/en/cloud/security/secure-s3)
- Introduced AI-assisted query suggestions in private preview (please [contact ClickHouse Cloud support](https://clickhouse.cloud/support) to try it out!)

### Integrations changes 
- Announced general availability of ClickPipes - a turnkey data ingestion service - for Kafka, Confluent Cloud, and Amazon MSK (see the [release blog](https://clickhouse.com/blog/clickpipes-is-generally-available))
- Reached general availability of Kafka Connect ClickHouse Sink
  - Extended support for customized ClickHouse settings using `clickhouse.settings` property
  - Improved deduplication behavior to account for dynamic fields
  - Added support for `tableRefreshInterval` to re-fetch table changes from ClickHouse
- Fixed an SSL connection issue and type mappings between [PowerBI](/docs/en/integrations/powerbi) and ClickHouse data types

## September 7, 2023

This release brings the beta release of the PowerBI Desktop official connector, improved credit card payment handling for India, and multiple improvements across supported language clients. 

### Console changes
- Added remaining credits and payment retries to support charges from India

### Integrations changes 
- Kafka Connector: added support for configuring ClickHouse settings, added error.tolerance configuration option
- PowerBI Desktop: released the beta version of the official connector
- Grafana: added support for Point geo type, fixed Panels in Data Analyst dashboard, fixed timeInterval macro
- Python client: Compatible with Pandas 2.1.0, dropped Python 3.7 support, added support for nullable JSON type
- Node.js client: added default_format setting support
- Golang client: fixed bool type handling, removed string limits

## Aug 24, 2023

This release adds support for the MySQL interface to the ClickHouse database, introduces a new official PowerBI connector, adds a new “Running Queries” view in the cloud console, and updates the ClickHouse version to 23.7.

### General updates
- Added support for the [MySQL wire protocol](https://clickhouse.com/docs/en/interfaces/mysql), which (among other use cases) enables compatibility with many existing BI tools. Please reach out to support to enable this feature for your organization.
- Introduced a new official PowerBI connector 

### Console changes
- Added support for “Running Queries” view in SQL Console

### ClickHouse 23.7 version upgrade 
- Added support for Azure Table function, promoted geo datatypes to production-ready, and improved join performance - see 23.5 release [blog](https://clickhouse.com/blog/clickhouse-release-23-05) for details
- Extended MongoDB integration support to version 6.0 - see 23.6 release [blog](https://clickhouse.com/blog/clickhouse-release-23-06) for details
- Improved performance of writing to Parquet format by 6x, added support for PRQL query language, and improved SQL compatibility - see 23.7 release [deck](https://presentations.clickhouse.com/release_23.7/) for details
- Dozens of new features, performance improvements, and bug fixes - see detailed [changelogs](https://clickhouse.com/docs/en/whats-new/changelog) for 23.5, 23.6, 23.7

### Integrations changes
- Kafka Connector: Added support for Avro Date and Time types
- JavaScript client: Released a stable version for web-based environment
- Grafana: Improved filter logic, database name handling, and added support for TimeInteval with sub-second precision
- Golang Client: Fixed several batch and async data loading issues
- Metabase: Support v0.47, added connection impersonation, fixed data types mappings

## July 27, 2023

This release brings the private preview of ClickPipes for Kafka, a new data loading experience, and the ability to load a file from a URL using the cloud console.

### Integrations changes
- Introduced the private preview of [ClickPipes](https://clickhouse.com/cloud/clickpipes) for Kafka, a cloud-native integration engine that makes ingesting massive volumes of data from Kafka and Confluent Cloud as simple as clicking a few buttons. Please sign up for the waitlist [here](https://clickhouse.com/cloud/clickpipes#joinwaitlist).
- JavaScript client: released support for web-based environment (browser, Cloudflare workers). The code is refactored to allow community creating connectors for custom environments.
- Kafka Connector: Added support for inline schema with Timestamp and Time Kafka types
- Python client: Fixed insert compression and LowCardinality reading issues

### Console changes
- Added a new data loading experience with more table creation configuration options
- Introduced ability to load a file from a URL using the cloud console
- Improved invitation flow with additional options to join a different organization and see all your outstanding invitations

## July 14, 2023

This release brings the ability to spin up Dedicated Services, a new AWS region in Australia, and the ability to bring your own key for encrypting data on disk.

### General updates
- New AWS Australia region: Sydney (ap-southeast-2)
- Dedicated tier services for demanding latency-sensitive workloads (please contact [support](https://clickhouse.cloud/support) to set it up)
- Bring your own key (BYOK) for encrypting data on disk (please contact [support](https://clickhouse.cloud/support) to set it up)

### Console changes
- Improvements to observability metrics dashboard for asynchronous inserts
- Improved chatbot behavior for integration with support 

### Integrations changes 
- NodeJS client: fixed a bug with a connection failure due to socket timeout
- Python client: added QuerySummary to insert queries, support special characters in the database name
- Metabase: updated JDBC driver version, added DateTime64 support, performance improvements.

### Core database changes
- [Query cache](https://clickhouse.com/docs/en/operations/query-cache) can be enabled in ClickHouse Cloud. When it is enabled, successful queries are cached for a minute by default and subsequent queries will use the cached result.

## June 20, 2023

This release makes ClickHouse Cloud on GCP generally available, brings a Terraform provider for the Cloud API, and updates the ClickHouse version to 23.4.

### General updates
- ClickHouse Cloud on GCP is now GA, bringing GCP Marketplace integration, support for Private Service Connect, and automatic backups (see [blog](https://clickhouse.com/blog/clickhouse-cloud-on-google-cloud-platform-gcp-is-generally-available) and [press release](https://clickhouse.com/blog/clickhouse-cloud-expands-choice-with-launch-on-google-cloud-platform) for details)
- [Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) for Cloud API is now available

### Console changes
- Added a new consolidated settings page for services
- Adjusted metering accuracy for storage and compute

### Integrations changes 
- Python client: improved insert performance, refactored internal dependencies to support multiprocessing
- Kafka Connector: It can be uploaded and installed on Confluent Cloud, added retry for interim connection problems, reset the incorrect connector state automatically

### ClickHouse 23.4 version upgrade 
- Added JOIN support for parallel replicas (please contact [support](https://clickhouse.cloud/support) to set it up)
- Improved performance of lightweight deletes
- Improved caching while processing large inserts

### Administration changes
- Expanded local dictionary creation for non “default” users

## May 30, 2023

This release brings the public release of the ClickHouse Cloud Programmatic API for Control Plane operations (see [blog](https://clickhouse.com/blog/using-the-new-clickhouse-cloud-api-to-automate-deployments) for details), S3 access using IAM roles, and additional scaling options.

### General changes
- API Support for ClickHouse Cloud. With the new Cloud API, you can seamlessly integrate managing services in your existing CI/CD pipeline and manage your services programmatically 
- S3 access using IAM roles. You can now leverage IAM roles to securely access your private Amazon Simple Storage Service (S3) buckets (please contact support to set it up)

### Scaling changes
- [Horizontal scaling](/docs/en/manage/scaling#adding-more-nodes-horizontal-scaling). Workloads that require more parallelization can now be configured with up to 10 replicas (please contact support to set it up)
- [CPU based autoscaling](/docs/en/manage/scaling). CPU-bound workloads can now benefit from additional triggers for autoscaling policies

### Console changes
- Migrate Dev service to Production service (please contact support to enable)
- Added scaling configuration controls during instance creation flows
- Fix connection string when default password is not present in memory

### Integrations changes
- Golang client: fixed a problem leading to unbalanced connections in native protocol, added support for the custom settings in the native protocol
- Nodejs client: dropped support for nodejs v14, added support for v20
- Kafka Connector: added support for LowCardinality type
- Metabase: fixed grouping by a time range, fixed support for integers in built-in Metabase questions

### Performance and reliability
- Improved efficiency and performance of write heavy workloads
- Deployed incremental backup strategy to increase speed and efficiency of backups

## May 11, 2023

This release brings the ~~public beta~~ (now GA, see June 20th entry above) of ClickHouse Cloud on GCP (see [blog](https://clickhouse.com/blog/clickhouse-cloud-on-gcp-available-in-public-beta) for details), extends administrators rights to grant terminate query permissions, and adds more visibility into the status of MFA users in the Cloud console.

### ClickHouse Cloud on GCP ~~(Public Beta)~~ (now GA, see June 20th entry above)
- Launches a fully-managed separated storage and compute ClickHouse offering, running on top of Google Compute and Google Cloud Storage
- Available in Iowa (us-central1), Netherlands (europe-west4), and Singapore (asia-southeast1) regions
- Supports both Development and Production services in all three initial regions
- Provides strong security by default: End-to-end encryption in transit, data-at-rest encryption, IP Allow Lists

### Integrations changes
- Golang client: Added proxy environment variables support 
- Grafana: Added the ability to specify ClickHouse custom settings and proxy environment variables in Grafana datasource setup
- Kafka Connector: Improved handling of empty records 

### Console changes
- Added an indicator for multifactor authentication (MFA) use in the user list

### Performance and reliability
- Added more granular control over terminate query permission for administrators

## May 4, 2023

This release brings a new heatmap chart type, improves billing usage page, and improves service startup time.

### Console changes
- Added heatmap chart type to SQL console
- Improved billing usage page to show credits consumed within each billing dimension

### Integrations changes
- Kafka connector: Added retry mechanism for transient connection errors
- Python client: Added max_connection_age setting to ensure that HTTP connections are not reused forever. This can help with certain load-balancing issues
- Node.js client: Added support for Node.js v20
- Java client: Improved client certificate authentication support, and added support for nested Tuple/Map/Nested types

### Performance and reliability
- Improved service startup time in presence of a large number of parts
- Optimized long-running query cancellation logic in SQL console

### Bug fixes
- Fixed a bug causing ‘Cell Towers’ sample dataset import to fail

## April 20, 2023

This release updates the ClickHouse version to 23.3, significantly improves the speed of cold reads, and brings real-time chat with support. 

### Console changes
- Added an option for real-time chat with support

### Integrations changes
- Kafka connector: Added support for Nullable types
- Golang client: Added support for external tables, support boolean and pointer type parameter bindings

### Configuration changes
- Adds ability to drop large tables–by overriding `max_table_size_to_drop` and `max_partition_size_to_drop` settings

### Performance and reliability
- Improve speed of cold reads by the means of S3 prefetching via `allow_prefetched_read_pool_for_remote_filesystem` setting 

### ClickHouse 23.3 version upgrade 
- Lightweight deletes are production-ready–see 23.3 release [blog](https://clickhouse.com/blog/clickhouse-release-23-03) for details
- Added support for multi-stage PREWHERE-see 23.2 release [blog](https://clickhouse.com/blog/clickhouse-release-23-03) for details
- Dozens of new features, performance improvements, and bug fixes–see detailed [changelogs](/docs/en/whats-new/changelog/index.md) for 23.3 and 23.2

## April 6, 2023

This release brings an API for retrieving cloud endpoints, an advanced scaling control for minimum idle timeout, and support for external data in Python client query methods.

### API changes
* Added ability to programmatically query ClickHouse Cloud endpoints via [Cloud Endpoints API](/docs/en/cloud/security/cloud-endpoints-api.md) 

### Console changes
- Added ‘minimum idle timeout’ setting to advanced scaling settings
- Added best-effort datetime detection to schema inference in data loading modal

### Integrations changes
- [Metabase](/docs/en/integrations/data-visualization/metabase-and-clickhouse.md): Added support for multiple schemas
- [Go client](/docs/en/integrations/language-clients/go/index.md): Fixed idle connection liveness check for TLS connections
- [Python client](/docs/en/integrations/language-clients/python/index.md)
  - Added support for external data in query methods
  - Added timezone support for query results
  - Added support for `no_proxy`/`NO_PROXY` environment variable
  - Fixed server-side parameter binding of the NULL value for Nullable types

### Bug fixes
* Fixed behavior where running `INSERT INTO … SELECT …` from the SQL console incorrectly applied the same row limit as select queries


## March 23, 2023

This release brings database password complexity rules, significant speedup in restoring large backups, and support for displaying traces in Grafana Trace View.

### Security and reliability
- Core database endpoints now enforce password complexity rules
- Improved time to restore large backups

### Console changes
- Streamlined onboarding workflow, introducing new defaults and more compact views
- Reduced sign-up and sign-in latencies

### Integrations changes
- Grafana: 
  - Added support for displaying trace data stored in ClickHouse in Trace View  
  - Improved time range filters and added support for special characters in table names
- Superset: Added native ClickHouse support
- Kafka Connect Sink: Added automatic date conversion and Null column handling
- Metabase: Implemented compatibility with v0.46
- Python client: Fixed inserts in temporary tables and added support for Pandas Null
- Golang client: Normalized Date types with timezone
- Java client
  - Added to SQL parser support for compression, infile, and outfile keywords
  - Added credentials overload
  - Fixed batch support with `ON CLUSTER`
- Node.js client
  - Added support for JSONStrings, JSONCompact, JSONCompactStrings, JSONColumnsWithMetadata formats
  - `query_id` can now be provided for all main client methods

### Bug fixes
- Fixed a bug resulting in slow initial provisioning and startup times for new services
- Fixed a bug that resulted in slower query performance due to cache misconfiguration


## March 9, 2023

This release improves observability dashboards, optimizes time to create large backups, and adds the configuration necessary to drop large tables and partitions.

### Console changes
- Added advanced observability dashboards (preview)
- Introduced a memory allocation chart to the observability dashboards
- Improved spacing and newline handling in SQL Console spreadsheet view

### Reliability and performance
- Optimized backup schedule to run backups only if data was modified
- Improved time to complete large backups

### Configuration changes
- Added the ability to increase the limit to drop tables and partitions by overriding the settings `max_table_size_to_drop` and `max_partition_size_to_drop` on the query or connection level
- Added source IP to query log, to enable quota and access control enforcement based on source IP

### Integrations
- [Python client](/docs/en/integrations/language-clients/python/index.md): Improved Pandas support and fixed timezone-related issues
- [Metabase](/docs/en/integrations/data-visualization/metabase-and-clickhouse.md): Metabase 0.46.x compatibility and support for SimpleAggregateFunction
- [Kafka-Connect](/docs/en/integrations/data-ingestion/kafka/index.md): Implicit date conversion and better handling for null columns
- [Java Client](https://github.com/ClickHouse/clickhouse-java): Nested conversion to Java maps

##  February 23, 2023

This release enables a subset of the features in the ClickHouse 23.1 core release, brings interoperability with Amazon Managed Streaming for Apache Kafka (MSK), and exposes advanced scaling and idling adjustments in the activity log.

### ClickHouse 23.1 version upgrade

Adds support for a subset of features in ClickHouse 23.1, for example:
- ARRAY JOIN with Map type
- SQL standard hex and binary literals
- New functions, including `age()`, `quantileInterpolatedWeighted()`, `quantilesInterpolatedWeighted()`
- Ability to use structure from insertion table in `generateRandom` without arguments
- Improved database creation and rename logic that allows the reuse of previous names
- See the 23.1 release [webinar slides](https://presentations.clickhouse.com/release_23.1/#cover) and [23.1 release changelog](/docs/en/whats-new/changelog/index.md/#clickhouse-release-231) for more details

### Integrations changes
- [Kafka-Connect](/docs/en/integrations/data-ingestion/kafka/index.md): Added support for Amazon MSK
- [Metabase](/docs/en/integrations/data-visualization/metabase-and-clickhouse.md): First stable release 1.0.0
  - Made the connector is available on [Metabase Cloud](https://www.metabase.com/start/)
  - Added a feature to explore all available databases
  - Fixed synchronization of database with AggregationFunction type
- [DBT-clickhouse](/docs/en/integrations/data-ingestion/etl-tools/dbt/index.md): Added support for the latest DBT version v1.4.1
- [Python client](/docs/en/integrations/language-clients/python/index.md): Improved proxy and ssh tunneling support; added a number of fixes and performance optimizations for Pandas dataframes
- [Nodejs client](/docs/en/integrations/language-clients/js.md): Released ability to attach `query_id` to query result, which can be used to retrieve query metrics from the `system.query_log`
- [Golang client](/docs/en/integrations/language-clients/go/index.md): Optimized network connection with ClickHouse Cloud

### Console changes
- Added advanced scaling and idling settings adjustments to the activity log
- Added user agent and IP information to reset password emails
- Improved signup flow mechanics for Google OAuth

### Reliability and performance
- Speed up the resume time from idle for large services
- Improved reading latency for services with a large number of tables and partitions

### Bug fixes
- Fixed behavior where resetting service password did not adhere to the password policy
- Made organization invite email validation case-insensitive

## February 2, 2023

This release brings an officially supported Metabase integration, a major Java client / JDBC driver release, and support for views and materialized views in the SQL console.

### Integrations changes
- [Metabase](/docs/en/integrations/data-visualization/metabase-and-clickhouse.md) plugin: Became an official solution maintained by ClickHouse
- [dbt](/docs/en/integrations/data-ingestion/etl-tools/dbt/index.md) plugin: Added support for [multiple threads](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md)
- [Grafana](/docs/en/integrations/data-visualization/grafana/index.md) plugin: Better handling of connection errors
- [Python](/docs/en/integrations/language-clients/python/index.md) client: [Streaming support](/docs/en/integrations/language-clients/python/index.md#streaming-queries) for insert operation
- [Go](/docs/en/integrations/language-clients/go/index.md) client: [Bug fixes](https://github.com/ClickHouse/clickhouse-go/blob/main/CHANGELOG.md): close canceled connections, better handling of connection errors
- [JS](/docs/en/integrations/language-clients/js.md) client: [Breaking changes in exec/insert](https://github.com/ClickHouse/clickhouse-js/releases/tag/0.0.12); exposed query_id in the return types
- [Java](https://github.com/ClickHouse/clickhouse-java#readme) client / JDBC driver major release
  - [Breaking changes](https://github.com/ClickHouse/clickhouse-java/releases): deprecated methods, classes and packages were removed
  - Added R2DBC driver and file insert support

### Console changes
- Added support for views and materialized views in SQL console

### Performance and reliability
- Faster password reset for stopped/idling instances
- Improved the scale-down behavior via more accurate activity tracking
- Fixed a bug where SQL console CSV export was truncated
- Fixed a bug resulting in intermittent sample data upload failures


## January 12, 2023

This release updates the ClickHouse version to 22.12, enables dictionaries for many new sources, and improves query performance.

### General changes
- Enabled dictionaries for additional sources, including external ClickHouse, Cassandra, MongoDB, MySQL, PostgreSQL, and Redis

### ClickHouse 22.12 version upgrade
- Extended JOIN support to include Grace Hash Join
- Added Binary JSON (BSON) support for reading files
- Added support for GROUP BY ALL standard SQL syntax
- New mathematical functions for decimal operations with fixed precision
- See the [22.12 release blog](https://clickhouse.com/blog/clickhouse-release-22-12) and [detailed 22.12 changelog](/docs/en/whats-new/changelog/2022.md/#-clickhouse-release-2212-2022-12-15) for the complete list of changes

### Console changes
- Improved auto-complete capabilities in SQL Console
- Default region now takes into account continent locality
- Improved Billing Usage page to display both billing and website units

### Integrations changes
- DBT release [v1.3.2](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md#release-132-2022-12-23)
  - Added experimental support for the delete+insert incremental strategy
  - New s3source macro
- Python client [v0.4.8](https://github.com/ClickHouse/clickhouse-connect/blob/main/CHANGELOG.md#048-2023-01-02)
  - File insert support
  - Server-side query [parameters binding](/docs/en/interfaces/cli.md/#cli-queries-with-parameters)
- Go client [v2.5.0](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.5.0)
  - Reduced memory usage for compression
  - Server-side query [parameters binding](/docs/en/interfaces/cli.md/#cli-queries-with-parameters)

### Reliability and performance
- Improved read performance for queries that fetch a large number of small files on object store
- Set the [compatibility](/docs/en/cloud/manage/upgrades.md/#use-the-default-settings-of-a-clickhouse-release) setting to the version with which the service is initially launched, for newly launched services

### Bug fixes
Using the Advanced Scaling slider to reserve resources now takes effect right away.

## December 20, 2022

This release introduces seamless logins for administrators to SQL console, improved read performance for cold reads, and an improved Metabase connector for ClickHouse Cloud.

### Console changes
- Enabled seamless access to SQL console for admin users
- Changed default role for new invitees to "Administrator"
- Added onboarding survey

### Reliability and performance
- Added retry logic for longer running insert queries to recover in the event of network failures
- Improved read performance of cold reads

### Integrations changes
- The [Metabase plugin](/docs/en/integrations/data-visualization/metabase-and-clickhouse.md) got a long-awaited v0.9.1 major update. Now it is compatible with the latest Metabase version and has been thoroughly tested against ClickHouse Cloud.

## December 6, 2022 - General Availability

ClickHouse Cloud is now production-ready with SOC2 Type II compliance, uptime SLAs for production workloads, and public status page. This release includes major new capabilities like AWS Marketplace integration, SQL console - a data exploration workbench for ClickHouse users, and ClickHouse Academy - self-paced learning in ClickHouse Cloud. Learn more in this [blog](https://clickhouse.com/blog/clickhouse-cloud-generally-available).

### Production-ready
- SOC2 Type II compliance (details in [blog](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) and [Trust Center](https://trust.clickhouse.com/))
- Public [Status Page](https://status.clickhouse.com/) for ClickHouse Cloud
- Uptime SLA available for production use cases
- Availability on [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc)

### Major new capabilities
- Introduced SQL console, the data exploration workbench for ClickHouse users
- Launched [ClickHouse Academy](https://learn.clickhouse.com/visitor_class_catalog), self-paced learning in ClickHouse Cloud

### Pricing and metering changes
- Extended trial to 30 days
- Introduced fixed-capacity, low-monthly-spend Development Services, well-suited for starter projects and development/staging environments
- Introduced new reduced pricing on Production Services, as we continue to improve how ClickHouse Cloud operates and scales
- Improved granularity and fidelity when metering compute

### Integrations changes
- Enabled support for ClickHouse Postgres / MySQL integration engines
- Added support for SQL user-defined functions (UDFs)
- Advanced Kafka Connect sink to Beta status
- Improved Integrations UI by introducing rich meta-data about versions, update status, and more

### Console changes

- Multi-factor authentication support in the cloud console
- Improved cloud console navigation for mobile devices

### Documentation changes

- Introduced a dedicated [documentation](https://clickhouse.com/docs/en/cloud/overview) section for ClickHouse Cloud

### Bug fixes
- Addressed known issue where restore from backup did not always work due to dependency resolution

## November 29, 2022

This release brings SOC2 Type II compliance, updates the ClickHouse version to 22.11, and improves a number of ClickHouse clients and integrations.

### General changes

- Reached SOC2 Type II compliance (details in [blog](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) and [Trust Center](https://trust.clickhouse.com))

### Console changes

- Added an "Idle" status indicator to show that a service has been automatically paused

### ClickHouse 22.11 version upgrade

- Added support for Hudi and DeltaLake table engines and table functions
- Improved recursive directory traversal for S3
- Added support for composite time interval syntax
- Improved insert reliability with retries on insert
- See the [detailed 22.11 changelog](/docs/en/whats-new/changelog/2022.md/#-clickhouse-release-2211-2022-11-17) for the complete list of changes

### Integrations

- Python client: v3.11 support, improved insert performance
- Go client: fix DateTime and Int64 support
- JS client: support for mutual SSL authentication
- dbt-clickhouse: support for DBT v1.3

### Bug fixes

- Fixed a bug that showed an outdated ClickHouse version after an upgrade
- Changing grants for the "default" account no longer interrupts sessions
- Newly created non-admin accounts no longer have system table access by default

### Known issues in this release

- Restore from backup may not work due to dependency resolution

## November 17, 2022

This release enables dictionaries from local ClickHouse table and HTTP sources, introduces support for the Mumbai region, and improves the cloud console user experience.

### General changes

- Added support for [dictionaries](/docs/en/sql-reference/dictionaries/index.md) from local ClickHouse table and HTTP sources
- Introduced support for the Mumbai [region](/docs/en/cloud/reference/supported-regions.md)

### Console changes

- Improved billing invoice formatting
- Streamlined user interface for payment method capture
- Added more granular activity logging for backups
- Improved error handling during file upload

### Bug fixes
- Fixed a bug that could lead to failing backups if there were single large files in some parts
- Fixed a bug where restores from backup did not succeed if access list changes were applied at the same time

### Known issues
- Restore from backup may not work due to dependency resolution

## November 3, 2022

This release removes read & write units from pricing (see the [pricing page](https://clickhouse.com/pricing) for details), updates the ClickHouse version to 22.10, adds support for higher vertical scaling for self-service customers, and improves reliability through better defaults.

### General changes

- Removed read/write units from the pricing model

### Configuration changes

- The settings `allow_suspicious_low_cardinality_types`, `allow_suspicious_fixed_string_types` and `allow_suspicious_codecs` (default is false) cannot be changed by users anymore for stability reasons.

### Console changes

- Increased the self-service maximum for vertical scaling to 720GB memory for paying customers
- Improved the restore from backup workflow to set IP Access List rules and password
- Introduced waitlists for GCP and Azure in the service creation dialog
- Improved error handling during file upload
- Improved workflows for billing administration

### ClickHouse 22.10 version upgrade

- Improved merges on top of object stores by relaxing the "too many parts" threshold in the presence of many large parts (at least 10 GiB). This enables up to petabytes of data in a single partition of a single table.
- Improved control over merging with the `min_age_to_force_merge_seconds` setting, to merge after a certain time threshold.
- Added MySQL-compatible syntax to reset settings `SET setting_name = DEFAULT`.
- Added functions for Morton curve encoding, Java integer hashing, and random number generation.
- See the [detailed 22.10 changelog](/docs/en/whats-new/changelog/2022.md/#-clickhouse-release-2210-2022-10-25) for the complete list of changes.


## October 25, 2022

This release significantly lowers compute consumption for small workloads, lowers compute pricing (see [pricing](https://clickhouse.com/pricing) page for details), improves stability through better defaults, and enhances the Billing and Usage views in the ClickHouse Cloud console.

### General changes

- Reduced minimum service memory allocation to 24G
- Reduced service idle timeout from 30 minutes to 5 minutes

### Configuration changes

- Reduced max_parts_in_total from 100k to 10k. The default value of the `max_parts_in_total` setting for MergeTree tables has been lowered from 100,000 to 10,000. The reason for this change is that we observed that a large number of data parts is likely to cause a slow startup time of services in the cloud. A large number of parts usually indicates a choice of too granular partition key, which is typically done accidentally and should be avoided. The change of default will allow the detection of these cases earlier.

### Console changes

- Enhanced credit usage details in the Billing view for trial users
- Improved tooltips and help text, and added a link to the pricing page in the Usage view
- Improved workflow when switching options for IP filtering
- Added resend email confirmation button to the cloud console

## October 4, 2022 - Beta

ClickHouse Cloud began its public Beta on October 4th, 2022. Learn more in this [blog](https://clickhouse.com/blog/clickhouse-cloud-public-beta).

The ClickHouse Cloud version is based on ClickHouse core v22.10. For a list of compatible features, refer to the [Cloud Compatibility](/docs/en/cloud/reference/cloud-compatibility.md) guide.
