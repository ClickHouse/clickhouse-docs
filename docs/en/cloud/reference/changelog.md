---
slug: /en/whats-new/cloud
sidebar_label: Cloud Changelog
title: Cloud Changelog
---

In addition to this ClickHouse Cloud changelog, please see the [Cloud Compatibility](/docs/en/cloud/reference/cloud-compatibility.md) page.

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
- Added a self-service workflow to secure [access to Amazon S3 via IAM roles](/docs/en/cloud/manage/security/secure-s3)
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
- [Grafana](/docs/en/integrations/data-visualization/grafana-and-clickhouse.md) plugin: Better handling of connection errors
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
