---
slug: /whats-new/cloud
sidebar_label: Cloud Changelog
title: Cloud Changelog
---

import add_marketplace from '@site/static/images/cloud/reference/add_marketplace.png';
import beta_dashboards from '@site/static/images/cloud/reference/beta_dashboards.png';
import api_endpoints from '@site/static/images/cloud/reference/api_endpoints.png';
import cross_vpc from '@site/static/images/cloud/reference/cross-vpc-clickpipes.png';
import nov_22 from '@site/static/images/cloud/reference/nov-22-dashboard.png';
import private_endpoint from '@site/static/images/cloud/reference/may-30-private-endpoints.png';
import notifications from '@site/static/images/cloud/reference/nov-8-notifications.png';
import kenesis from '@site/static/images/cloud/reference/may-17-kinesis.png';
import s3_gcs from '@site/static/images/cloud/reference/clickpipes-s3-gcs.png';
import tokyo from '@site/static/images/cloud/reference/create-tokyo-service.png';
import cloud_console from '@site/static/images/cloud/reference/new-cloud-console.gif';
import copilot from '@site/static/images/cloud/reference/nov-22-copilot.gif';
import latency_insights from '@site/static/images/cloud/reference/oct-4-latency-insights.png';
import cloud_console_2 from '@site/static/images/cloud/reference/aug-15-compute-compute.png';
import compute_compute from '@site/static/images/cloud/reference/july-18-table-inspector.png';
import query_insights from '@site/static/images/cloud/reference/june-28-query-insights.png';
import prometheous from '@site/static/images/cloud/reference/june-28-prometheus.png';
import kafka_config from '@site/static/images/cloud/reference/june-13-kafka-config.png';
import fast_releases from '@site/static/images/cloud/reference/june-13-fast-releases.png';
import share_queries from '@site/static/images/cloud/reference/may-30-share-queries.png';
import query_endpoints from '@site/static/images/cloud/reference/may-17-query-endpoints.png';


In addition to this ClickHouse Cloud changelog, please see the [Cloud Compatibility](/cloud/reference/cloud-compatibility.md) page.
## February 21, 2025 {#february-21-2025}
### ClickHouse Bring Your Own Cloud (BYOC) for AWS is now generally available! {#clickhouse-byoc-for-aws-ga}

In this deployment model, data plane components (compute, storage, backups, logs, metrics) run in the Customer VPC, while the control plane (web access, APIs, and billing) remains within the ClickHouse VPC. This setup is ideal for large workloads that need to comply with strict data residency requirements by ensuring all data stays within a secure customer environment.

- For more details, you can refer to the [documentation](/cloud/reference/byoc) for BYOC or read our [announcement blog post](https://clickhouse.com/blog/announcing-general-availability-of-clickhouse-bring-your-own-cloud-on-aws).
- [Contact us](https://clickhouse.com/cloud/bring-your-own-cloud) to request access.
### Postgres CDC connector for ClickPipes {#postgres-cdc-connector-for-clickpipes}

Postgres CDC connector for ClickPipes is now in public beta. This feature allows users to seamlessly replicate their Postgres databases to ClickHouse Cloud.

- To get started, refer to the [documentation](https://clickhouse.com/docs/integrations/clickpipes/postgres) for ClickPipes Postgres CDC connector.
- For more information on customer use cases and features, please refer to the [landing page](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector) and the [launch blog](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-public-beta).
### PCI compliance for ClickHouse Cloud on AWS {#pci-compliance-for-clickhouse-cloud-on-aws}

ClickHouse Cloud now supports **PCI-compliant services** for **Enterprise tier** customers in **us-east-1** and **us-west-2** regions. Users who wish to launch a service in a PCI-compliant environment can contact [support](https://clickhouse.com/support/program) for assistance.
### Transparent Data Encryption and Customer Managed Encryption Keys on Google Cloud Platform {#tde-and-cmek-on-gcp}

Support for **Transparent Data Encryption (TDE)** and **Customer Managed Encryption Keys (CMEK)** is now available for ClickHouse Cloud on **Google Cloud Platform (GCP)**.

- Please refer to the [documentation](https://clickhouse.com/docs/cloud/security/cmek#transparent-data-encryption-tde) of these features for more information.
### AWS Middle East (UAE) availability {#aws-middle-east-uae-availability}

New region support is added for ClickHouse Cloud, which is now available in the **AWS Middle East (UAE) me-central-1** region.
### ClickHouse Cloud guardrails {#clickhouse-cloud-guardrails}

To promote best practices and ensure stable use of ClickHouse Cloud, we are introducing guardrails for the number of tables, databases, partitions and parts in use.

- Refer to the [usage limits](https://clickhouse.com/docs/cloud/bestpractices/usage-limits) section of the documentation for details.
- If your service is already above these limits, we will permit a 10% increase. Please contact [support](https://clickhouse.com/support/program) if you have any questions.
## January 27, 2025 {#january-27-2025}
### Changes to ClickHouse Cloud tiers {#changes-to-clickhouse-cloud-tiers}

We are dedicated to adapting our products to meet the ever-changing requirements of our customers. Since its introduction in GA over the past two years, ClickHouse Cloud has evolved substantially, and we've gained invaluable insights into how our customers leverage our cloud offerings.

We are introducing new features to optimize the sizing and cost-efficiency of ClickHouse Cloud services for your workloads. These include **compute-compute separation**, high-performance machine types, and **single-replica services**. We are also evolving automatic scaling and managed upgrades to execute in a more seamless and reactive fashion.

We are adding a **new Enterprise tier** to serve the needs of the most demanding customers and workloads, with focus on industry-specific security and compliance features, even more controls over underlying hardware and upgrades, and advanced disaster recovery features.

To support these changes, we are restructuring our current **Development** and **Production** tiers to more closely match how our evolving customer base is using our offerings. We are introducing the **Basic** tier, oriented toward users that are testing out new ideas and projects, and the **Scale** tier, matching users working with production workloads and data at scale.

You can read about these and other functional changes in this [blog](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings). Existing customers will need to take action to select a [new plan](https://clickhouse.com/pricing). Customer-facing communication was sent via email to organization administrators, and the following [FAQ](/cloud/manage/jan-2025-faq/summary) covers the key changes and timelines.
### Warehouses: Compute-compute separation (GA) {#warehouses-compute-compute-separation-ga}

Compute-compute separation (also known as "Warehouses") is Generally Available; please refer to [blog](https://clickhouse.com/blog/introducing-warehouses-compute-compute-separation-in-clickhouse-cloud) for more details and the [documentation](/cloud/reference/warehouses).
### Single-replica services {#single-replica-services}

We are introducing the concept of a "single-replica service", both as a standalone offering and within warehouses. As a standalone offering, single-replica services are size limited and intended to be used for small test workloads. Within warehouses, single-replica services can be deployed at larger sizes, and utilized for workloads not requiring high availability at scale, such as restartable ETL jobs.
### Vertical auto-scaling improvements {#vertical-auto-scaling-improvements}

We are introducing a new vertical scaling mechanism for compute replicas, which we call "Make Before Break" (MBB). This approach adds one or more replicas of the new size before removing the old replicas, preventing any loss of capacity during scaling operations. By eliminating the gap between removing existing replicas and adding new ones, MBB creates a more seamless and less disruptive scaling process. It is especially beneficial in scale-up scenarios, where high resource utilization triggers the need for additional capacity, since removing replicas prematurely would only exacerbate the resource constraints.
### Horizontal scaling (GA) {#horizontal-scaling-ga}

Horizontal scaling is now Generally Available. Users can add additional replicas to scale out their service through the APIs and the cloud console. Please refer to the [documentation](/manage/scaling#manual-horizontal-scaling) for information.
### Configurable backups {#configurable-backups}

We now support the ability for customers to export backups to their own cloud account; please refer to the [documentation](/cloud/manage/backups/configurable-backups) for additional information.
### Managed upgrade improvements {#managed-upgrade-improvements}

Safe managed upgrades deliver significant value to our users by allowing them to stay current with the database as it moves forward to add features. With this rollout, we applied the "make before break" (or MBB) approach to upgrades, further reducing impact to running workloads.
### HIPAA support {#hipaa-support}

We now support HIPAA in compliant regions, including AWS `us-east-1`, `us-west-2` and GCP `us-central1`, `us-east1`. Customers wishing to onboard must sign a Business Associate Agreement (BAA) and deploy to the compliant version of the region. For more information on HIPAA, please refer to the [documentation](/cloud/security/security-and-compliance).
### Scheduled upgrades {#scheduled-upgrades}

Users can schedule upgrades for their services. This feature is supported for Enterprise tier services only. For more information on Scheduled upgrades, please refer to the [documentation](/manage/updates).
### Language client support for complex types {#language-client-support-for-complex-types}

[Golang](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.30.1), [Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.11), and [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.1) clients added support for Dynamic, Variant, and JSON types.
### DBT support for Refreshable Materialized Views {#dbt-support-for-refreshable-materialized-views}

DBT now [supports Refreshable Materialized Views](https://github.com/ClickHouse/dbt-clickhouse/releases/tag/v1.8.7) in the `1.8.7` release.
### JWT token support {#jwt-token-support}

Support has been added for JWT-based authentication in the JDBC driver v2, clickhouse-java, [Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.12), and [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.0) clients.

JDBC / Java will be in [0.8.0](https://github.com/ClickHouse/clickhouse-java/releases/tag/v0.8.0) when it's released - ETA pending.
### Prometheus integration improvements {#prometheus-integration-improvements}

We've added several enhancements for the Prometheus integration:

- **Organization-level endpoint**. We've introduced an enhancement to our Prometheus integration for ClickHouse Cloud. In addition to service-level metrics, the API now includes an endpoint for **organization-level metrics**. This new endpoint automatically collects metrics for all services within your organization, streamlining the process of exporting metrics into your Prometheus collector. These metrics can be integrated with visualization tools like Grafana and Datadog for a more comprehensive view of your organization's performance.

  This feature is available now for all users. You can find more details [here](/integrations/prometheus).

- **Filtered metrics**. We've added support for returning a filtered list of metrics in our Prometheus integration for ClickHouse Cloud. This feature helps reduce response payload size by enabling you to focus on metrics that are critical for monitoring the health of your service.

  This functionality is available via an optional query parameter in the API, making it easier to optimize your data collection and streamline integrations with tools like Grafana and Datadog.

  The filtered metrics feature is now available for all users. You can find more details [here](/integrations/prometheus).
## December 20, 2024 {#december-20-2024}
### Marketplace subscription organization attachment {#marketplace-subscription-organization-attachment}

You can now attach your new marketplace subscription to an existing ClickHouse Cloud organization. Once you finish subscribing to the marketplace and redirect to ClickHouse Cloud, you can connect an existing organization created in the past to the new marketplace subscription. From this point, your resources in the organization will be billed via the marketplace. 

<img alt="Add marketplace subscription"
  style={{width: '600px'}}
  src={add_marketplace} />
### Force OpenAPI key expiration {#force-openapi-key-expiration}

It is now possible to restrict the expiry options of API keys so you don’t create unexpired OpenAPI keys. Please contact the ClickHouse Cloud Support team to enable these restrictions for your organization.
### Custom emails for notifications {#custom-emails-for-notifications}

Org Admins can now add more email addresses to a specific notification as additional recipients. This is useful in case you want to send notifications to an alias or to other users within your organization who might not be users of ClickHouse Cloud. To configure this, go to the Notification Settings from the cloud console and edit the email addresses that you want to receive the email notifications.
## December 6, 2024 {#december-6-2024}
### BYOC (Beta) {#byoc-beta}

Bring Your Own Cloud for AWS is now available in Beta. This deployment model allows you to deploy and run ClickHouse Cloud in your own AWS account. We support deployments in 11+ AWS regions, with more coming soon. Please [contact support](https://clickhouse.com/support/program) for access. Note that this deployment is reserved for large-scale deployments.
### Postgres Change-Data-Capture (CDC) Connector in ClickPipes (Public Beta) {#postgres-change-data-capture-cdc-connector-in-clickpipes-public-beta}

This turnkey integration enables customers to replicate their Postgres databases to ClickHouse Cloud in just a few clicks and leverage ClickHouse for blazing-fast analytics. You can use this connector for both continuous replication and one-time migrations from Postgres.
### Dashboards (Beta) {#dashboards-beta}

This week, we’re excited to announce the Beta launch of Dashboards in ClickHouse Cloud. With Dashboards, users can turn saved queries into visualizations, organize visualizations onto dashboards, and interact with dashboards using query parameters. To get started, follow the [dashboards documentation](/cloud/manage/dashboards).

<img alt="Dashboards Beta"
  style={{width: '600px'}}
  src={beta_dashboards} />
### Query API endpoints (GA) {#query-api-endpoints-ga}

We are excited to announce the GA release of Query API Endpoints in ClickHouse Cloud. Query API Endpoints allow you to spin up RESTful API endpoints for saved queries in just a couple of clicks and begin consuming data in your application without wrangling language clients or authentication complexity. Since the initial launch, we have shipped a number of improvements, including:

* Reducing endpoint latency, especially for cold-starts
* Increased endpoint RBAC controls
* Configurable CORS-allowed domains
* Result streaming
* Support for all ClickHouse-compatible output formats

In addition to these improvements, we are excited to announce generic query API endpoints that, leveraging our existing framework, allow you to execute arbitrary SQL queries against your ClickHouse Cloud service(s). Generic endpoints can be enabled and configured from the service settings page.

To get started, follow the [Query API Endpoints documentation](/cloud/get-started/query-endpoints).

<img alt="API Endpoints"
  style={{width: '600px'}}
  src={api_endpoints} />
### Native JSON support (Beta) {#native-json-support-beta}

We are launching Beta for our native JSON support in ClickHouse Cloud. To get started, please get in touch with support [to enable your cloud service](/cloud/support).
### Vector search using vector similarity indexes (Early Access) {#vector-search-using-vector-similarity-indexes-early-access}

We are announcing vector similarity indexes for approximate vector search in early access!

ClickHouse already offers robust support for vector-based use cases, with a wide range of [distance functions](https://clickhouse.com/blog/reinvent-2024-product-announcements#vector-search-using-vector-similarity-indexes-early-access) and the ability to perform linear scans. In addition, more recently, we added an experimental [approximate vector search](/engines/table-engines/mergetree-family/annindexes) approach powered by the [usearch](https://github.com/unum-cloud/usearch) library and the Hierarchical Navigable Small Worlds (HNSW) approximate nearest neighbor search algorithm.

To get started, [please sign up for the early access waitlist](https://clickhouse.com/cloud/vector-search-index-waitlist).
### ClickHouse-Connect (Python) and ClickHouse-Kafka-Connect Users {#clickhouse-connect-python-and-clickhouse-kafka-connect-users}

Notification emails went out to customers who had experienced issues where the clients could encounter a `MEMORY_LIMIT_EXCEEDED` exception.

Please upgrade to:
- Kafka-Connect: > 1.2.5
- ClickHouse-Connect (Java): > 0.8.6
### ClickPipes now supports cross-VPC resource access on AWS {#clickpipes-now-supports-cross-vpc-resource-access-on-aws}

You can now grant uni-directional access to a specific data source like AWS MSK. With Cross-VPC resource access with AWS PrivateLink and VPC Lattice, you can share individual resources across VPC and account boundaries, or even from on-premise networks without compromising on privacy and security when going over a public network. To get started and set up a resource share, you can read the [announcement post](https://clickhouse.com/blog/clickpipes-crossvpc-resource-endpoints?utm_medium=web&utm_source=changelog).

<img alt="VPC ClickPipes"
  style={{width: '600px'}}
  src={cross_vpc} />
### ClickPipes now supports IAM for AWS MSK {#clickpipes-now-supports-iam-for-aws-msk}

You can now use IAM authentication to connect to an MSK broker with AWS MSK ClickPipes. To get started, review our [documentation](/integrations/clickpipes/kafka#iam).
### Maximum replica size for new services on AWS {#maximum-replica-size-for-new-services-on-aws}

From now on, any new services created on AWS will allow a maximum available replica size of 236 GiB.
## November 22, 2024 {#november-22-2024}
### Built-in advanced observability dashboard for ClickHouse Cloud {#built-in-advanced-observability-dashboard-for-clickhouse-cloud}

Previously, the advanced observability dashboard that allows you to monitor ClickHouse server metrics and hardware resource utilization was only available in open-source ClickHouse. We are happy to announce that this feature is now available in the ClickHouse Cloud console!

This dashboard allows you to view queries based on the [system.dashboards](/operations/system-tables/dashboards) table in an all-in-one UI. Visit **Monitoring > Service Health** page to start using the advanced observability dashboard today.

<img alt="Advanced Observability Dashboard"
  style={{width: '600px'}}
  src={nov_22} />
### AI-powered SQL autocomplete {#ai-powered-sql-autocomplete}

We’ve improved autocomplete significantly, allowing you to get in-line SQL completions as you write your queries with the new AI Copilot! This feature can be enabled by toggling the **"Enable Inline Code Completion"** setting for any ClickHouse Cloud service.

<img alt="AI Copilot SQL autocomplete"
  style={{width: '600px'}}
  src={copilot} />
### New "Billing" role {#new-billing-role}

You can now assign users in your organization to a new **Billing** role that allows them to view and manage billing information without giving them the ability to configure or manage services. Simply invite a new user or edit an existing user's role to assign the **Billing** role.
## November 8, 2024 {#november-8-2024}
### Customer Notifications in ClickHouse Cloud {#customer-notifications-in-clickhouse-cloud}

ClickHouse Cloud now provides in-console and email notifications for several billing and scaling events. Customers can configure these notifications via the cloud console notification center to only appear on the UI, receive emails, or both. You can configure the category and severity of the notifications you receive at the service level.

In future, we will add notifications for other events, as well as additional ways to receive the notifications.

Please see the [ClickHouse docs](/cloud/notifications) to learn more about how to enable notifications for your service.

<img alt="Customer notifications UI"
  style={{width: '600px'}}
  src={notifications} />

<br />
## October 4, 2024 {#october-4-2024}
### ClickHouse Cloud now offers HIPAA-ready services in Beta for GCP {#clickhouse-cloud-now-offers-hipaa-ready-services-in-beta-for-gcp}

Customers looking for increased security for protected health information (PHI) can now onboard to ClickHouse Cloud in [Google Cloud Platform (GCP)](https://cloud.google.com/). ClickHouse has implemented administrative, physical and technical safeguards prescribed by the [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html) and now has configurable security settings that can be implemented, depending on your specific use case and workload. For more information on available security settings, please review our [Security Shared Responsibility Model](/cloud/security/shared-responsibility-model).

Services are available in GCP `us-central-1` to customers with the **Dedicated** service type and require a Business Associate Agreement (BAA). Contact [sales](mailto:sales@clickhouse.com) or [support](https://clickhouse.com/support/program) to request access to this feature or join the wait list for additional GCP, AWS, and Azure regions.
### Compute-Compute separation is now in Private Preview for GCP and Azure {#compute-compute-separation-is-now-in-private-preview-for-gcp-and-azure}

We recently announced the Private Preview for Compute-Compute Separation for AWS. We're happy to announce that it is now available for GCP and Azure.

Compute-compute separation allows you to designate specific services as read-write or read-only services, allowing you to design the optimal compute configuration for your application to optimize cost and performance. Please [read the docs](/cloud/reference/compute-compute-separation) for more details.
### Self-service MFA recovery codes {#self-service-mfa-recovery-codes}

Customers using multi-factor authentication can now obtain recovery codes that can be used in the event of a lost phone or accidentally deleted token. Customers enrolling in MFA for the first time will be provided the code on set up. Customers with existing MFA can obtain a recovery code by removing their existing MFA token and adding a new one.
### ClickPipes Update: Custom Certificates, Latency Insights, and More! {#clickpipes-update-custom-certificates-latency-insights-and-more}

We're excited to share the latest updates for ClickPipes, the easiest way to ingest data into your ClickHouse service! These new features are designed to enhance your control over data ingestion and provide greater visibility into performance metrics.

*Custom Authentication Certificates for Kafka*

ClickPipes for Kafka now supports custom authentication certificates for Kafka brokers using SASL & public SSL/TLS. You can easily upload your own certificate in the SSL Certificate section during ClickPipe setup, ensuring a more secure connection to Kafka.

*Introducing Latency Metrics for Kafka and Kinesis*

Performance visibility is crucial. ClickPipes now features a latency graph, giving you insight into the time between message production (whether from a Kafka Topic or a Kinesis Stream) to ingestion in ClickHouse Cloud. With this new metric, you can keep a closer eye on the performance of your data pipelines and optimize accordingly.

<img alt="Latency Metrics graph"
  style={{width: '600px'}}
  src={latency_insights} />

<br />

*Scaling Controls for Kafka and Kinesis (Private Beta)*

High throughput can demand extra resources to meet your data volume and latency needs. We're introducing horizontal scaling for ClickPipes, available directly through our cloud console. This feature is currently in private beta, allowing you to scale resources more effectively based on your requirements. Please contact [support](https://clickhouse.com/support/program) to join the beta.

*Raw Message Ingestion for Kafka and Kinesis*

It is now possible to  ingest an entire Kafka or Kinesis message without parsing it. ClickPipes now offers support for a `_raw_message` [virtual column](/integrations/clickpipes/kafka#kafka-virtual-columns), allowing users to map the full message into a single String column. This gives you the flexibility to work with raw data as needed.
## August 29, 2024 {#august-29-2024}
### New Terraform provider version - v1.0.0 {#new-terraform-provider-version---v100}

Terraform allows you to control your ClickHouse Cloud services programmatically, then store your configuration as code. Our Terraform provider has almost 200,000 downloads and is now officially v1.0.0! This new version includes improvements such as better retry logic and a new resource to attach private endpoints to your ClickHouse Cloud service. You can download the [Terraform provider here](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest) and view the [full changelog here](https://github.com/ClickHouse/terraform-provider-clickhouse/releases/tag/v1.0.0).
### 2024 SOC 2 Type II report and updated ISO 27001 certificate {#2024-soc-2-type-ii-report-and-updated-iso-27001-certificate}

We are proud to announce the availability of our 2024 SOC 2 Type II report and updated ISO 27001 certificate, both of which include our recently launched services on Azure as well as continued coverage of services in AWS and GCP.

Our SOC 2 Type II demonstrates our ongoing commitment to achieving security, availability, processing integrity and confidentiality of the services we provide to ClickHouse users. For more information, check out [SOC 2 - SOC for Service Organizations: Trust Services Criteria](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services) issued by the American Institute of Certified Public Accountants (AICPA) and [What is ISO/IEC 27001](https://www.iso.org/standard/27001) from the International Standards Organization (ISO).

Please also check out our [Trust Center](https://trust.clickhouse.com/) for security and compliance documents and reports.
## August 15, 2024 {#august-15-2024}
### Compute-compute separation is now in Private Preview for AWS {#compute-compute-separation-is-now-in-private-preview-for-aws}

For existing ClickHouse Cloud services, replicas handle both reads and writes, and there is no way to configure a certain replica to handle only one kind of operation. We have an upcoming new feature called Compute-compute separation that allows you to designate specific services as read-write or read-only services, allowing you to design the optimal compute configuration for your application to optimize cost and performance.

Our new compute-compute separation feature enables you to create multiple compute node groups, each with its own endpoint, that are using the same object storage folder, and thus, with the same tables, views, etc. Read more about [Compute-compute separation here](/cloud/reference/compute-compute-separation). Please [contact support](https://clickhouse.com/support/program) if you would like access to this feature in Private Preview.

<img alt="Example architecture for compute-compute separation"
  style={{width: '600px'}}
  src={cloud_console_2} />
### ClickPipes for S3 and GCS now in GA, Continuous mode support {#clickpipes-for-s3-and-gcs-now-in-ga-continuous-mode-support}

ClickPipes is the easiest way to ingest data into ClickHouse Cloud. We're happy to announce that [ClickPipes](https://clickhouse.com/cloud/clickpipes) for S3 and GCS is now **Generally Available**. ClickPipes supports both one-time batch ingest and "continuous mode". An ingest task will load all the files matched by a pattern from a specific remote bucket into the ClickHouse destination table. In "continuous mode", the ClickPipes job will run constantly, ingesting matching files that get added into the remote object storage bucket as they arrive. This will allow users to turn any object storage bucket into a fully fledged staging area for ingesting data into ClickHouse Cloud. Read more about ClickPipes in [our documentation](/integrations/clickpipes).
## July 18, 2024 {#july-18-2024}
### Prometheus Endpoint for Metrics is now Generally Available {#prometheus-endpoint-for-metrics-is-now-generally-available}

In our last cloud changelog, we announced the Private Preview for exporting [Prometheus](https://prometheus.io/) metrics from ClickHouse Cloud. This feature allows you to use the [ClickHouse Cloud API](/cloud/manage/api/api-overview) to get your metrics into tools like [Grafana](https://grafana.com/) and [Datadog](https://www.datadoghq.com/) for visualization. We're happy to announce that this feature is now **Generally Available**. Please see [our docs](/integrations/prometheus) to learn more about this feature.
### Table Inspector in Cloud Console {#table-inspector-in-cloud-console}

ClickHouse には、スキーマを確認するためにテーブルを調査することを可能にする [`DESCRIBE`](/sql-reference/statements/describe-table) のようなコマンドがあります。これらのコマンドはコンソールに出力されますが、テーブルやカラムに関するすべての関連データを取得するために複数のクエリを組み合わせる必要があるため、便利ではないことがよくあります。

最近、私たちはクラウドコンソールに **テーブルインスペクター** を導入しました。これにより、SQL を記述することなく、UI で重要なテーブルおよびカラム情報を取得できるようになります。サービスのためにテーブルインスペクターを試すには、クラウドコンソールをチェックしてください。これにより、スキーマ、ストレージ、圧縮などに関する情報を一元的に提供します。

<img alt="Table Inspector UI"
  style={{width: '800px', marginLeft: 0}}
  src={compute_compute} />
### New Java Client API {#new-java-client-api}

私たちの [Java Client](https://github.com/ClickHouse/clickhouse-java) は、ユーザーが ClickHouse に接続するために使用する最も人気のあるクライアントの1つです。私たちは、再設計された API とさまざまなパフォーマンスの最適化を含め、さらに使いやすく直感的にすることを目指しました。これらの変更により、Java アプリケーションから ClickHouse に接続することがずっと簡単になります。更新された Java Client の使用方法については、[このブログ投稿](https://clickhouse.com/blog/java-client-sequel)を読んでみてください。
### New Analyzer is enabled by default {#new-analyzer-is-enabled-by-default}

過去数年間、私たちはクエリ分析と最適化のための新しいアナライザーに取り組んできました。このアナライザーはクエリのパフォーマンスを向上させ、より早くて効率的な `JOIN` の実行を含むさらなる最適化を可能にします。以前は、新しいユーザーが `allow_experimental_analyzer` の設定を使用してこの機能を有効にする必要がありましたが、この改善されたアナライザーは新しい ClickHouse Cloud サービスでデフォルトで利用可能になりました。

アナライザーのさらなる改善を楽しみにしてください。私たちは多くの最適化を計画しています！
## June 28, 2024 {#june-28-2024}
### ClickHouse Cloud for Microsoft Azure is now Generally Available! {#clickhouse-cloud-for-microsoft-azure-is-now-generally-available}

私たちは、先月の [この5月](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta) に Microsoft Azure のサポートをベータ版で発表しました。この最新のクラウドリリースにおいて、Azure のサポートがベータ版から一般提供へと移行したことをお知らせできることを嬉しく思います。ClickHouse Cloud は、AWS、Google Cloud Platform、そして新たに Microsoft Azure のすべての主要なクラウドプラットフォームで利用可能です。

このリリースには、[Microsoft Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/clickhouse.clickhouse_cloud) を通じたサブスクリプションのサポートも含まれています。このサービスは初めて以下の地域でサポートされます：
- アメリカ合衆国：ウエスト US 3 (アリゾナ)
- アメリカ合衆国：イースト US 2 (バージニア)
- ヨーロッパ：ドイツ西部 (フランクフルト)

特定の地域でのサポートをご希望の場合は、[お問い合わせください](https://clickhouse.com/support/program)。
### Query Log Insights {#query-log-insights}

私たちの新しいクエリインサイト UI は、ClickHouse の組み込みクエリログをより使いやすくします。ClickHouse の `system.query_log` テーブルは、クエリの最適化、デバッグ、全体のクラスタの健康とパフォーマンスを監視するための重要な情報源です。ただし、70 以上のフィールドがあり、クエリごとに複数のレコードがあるため、クエリログを解釈するのは非常に難しい学習曲線を伴います。このクエリインサイトの初期バージョンは、クエリデバッグと最適化パターンを簡素化するための今後の作業の青写真を提供します。この機能を継続的に迭代していく中で、ご意見をお聞かせいただけると幸いです。ご意見をお待ちしております！

<img alt="Query Insights UI"
  style={{width: '600px', marginLeft: 0}}
  src={query_insights} />
### Prometheus Endpoint for Metrics (Private Preview) {#prometheus-endpoint-for-metrics-private-preview}

おそらく、私たちの最もリクエストの多かった機能の一つです：ClickHouse Cloud から [Prometheus](https://prometheus.io/) メトリクスを [Grafana](https://grafana.com/) や [Datadog](https://www.datadoghq.com/) にエクスポートして可視化できるようになりました。Prometheus は ClickHouse を監視し、カスタムアラートを設定するためのオープンソースソリューションを提供します。ClickHouse Cloud サービスの Prometheus メトリクスへのアクセスは、[ClickHouse Cloud API](/integrations/prometheus) 経由で利用可能です。この機能は現在プライベートプレビュー中です。この機能を組織内で有効にするには、[サポートチーム](https://clickhouse.com/support/program) にご連絡ください。

<img alt="Prometheus Metrics with Grafana"
  style={{width: '600px', marginLeft: 0}}
  src={prometheous} />
### Other features: {#other-features}
- [Configurable backups](/cloud/manage/backups/configurable-backups) により、頻度、保持、スケジュールなどのカスタムバックアップポリシーを設定できる機能が一般提供されます。
## June 13, 2024 {#june-13-2024}
### Configurable offsets for Kafka ClickPipes Connector (Beta) {#configurable-offsets-for-kafka-clickpipes-connector-beta}

最近まで、新しい [Kafka Connector for ClickPipes](/integrations/clickpipes/kafka) を設定する際、常に Kafka トピックの最初からデータを消費していました。この状況では、過去のデータを再処理したり、新しいデータの監視を行ったり、正確なポイントから再開する必要がある特定のユースケースに対して柔軟ではありませんでした。

Kafka 用の ClickPipes では、Kafka トピックからデータを消費する柔軟性とコントロールを強化する新しい機能が追加されました。これにより、データを消費するオフセットを設定できるようになりました。

以下のオプションが使用可能です：
- 最初から：Kafka トピックの最初からデータを消費し始めます。このオプションは、すべての過去データを再処理する必要があるユーザーに最適です。
- 最新から：最も最近のオフセットからデータの消費を開始します。これは、新しいメッセージにのみ興味があるユーザーにとって便利です。
- タイムスタンプから：特定のタイムスタンプ以降に生成されたメッセージからデータを消費し始めます。この機能により、より正確な制御が可能になり、ユーザーは特定の時点から処理を再開できます。

<img alt="Configure offsets for Kafka connector"
  style={{width: '600px', marginLeft: 0}}
  src={kafka_config} />
### Enroll services to the Fast release channel {#enroll-services-to-the-fast-release-channel}

ファストリリースチャネルを利用すると、サービスがリリーススケジュールの前に更新を受け取ることができます。以前は、この機能を有効にするためにはサポートチームの支援が必要でした。現在、ClickHouse Cloud コンソールを使用して、サービスのためにこの機能を直接有効にできます。**設定** に移動し、**ファストリリースに登録** をクリックするだけです。これで、サービスは利用可能になるとすぐに更新を受け取るようになります！

<img alt="Enroll in Fast releases"
  style={{width: '500px', marginLeft: 0}}
  src={fast_releases} />
### Terraform support for horizontal scaling {#terraform-support-for-horizontal-scaling}

ClickHouse Cloud では、[水平スケーリング](/manage/scaling#how-scaling-works-in-clickhouse-cloud)、すなわち同一サイズの追加レプリカをサービスに追加する機能がサポートされています。水平スケーリングは、パフォーマンスと並列処理を向上させて同時クエリをサポートします。以前は、レプリカを追加するには ClickHouse Cloud コンソールまたは API を使用する必要がありました。これからは、Terraform を使用して、サービスからレプリカを追加または削除できるようになり、必要に応じて ClickHouse サービスをプログラムでスケールさせることが可能です。

詳細は、[ClickHouse Terraform プロバイダー](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)をご覧ください。
## May 30, 2024 {#may-30-2024}
### Share queries with your teammates {#share-queries-with-your-teammates}

SQL クエリを書くと、チームの他の人がそのクエリを有用だと感じる可能性が高いです。以前は、クエリを Slack やメールで送信し、そのクエリを編集してもチームメイトが自動的に更新を受け取る方法はありませんでした。

私たちは、ClickHouse Cloud コンソールを介して簡単にクエリを共有できるようになったことを嬉しく思います。クエリエディターから、チーム全体または特定のチームメンバーと直接クエリを共有できます。また、彼らが読み取り専用または書き込み専用でアクセスできるかを指定することもできます。クエリエディターで **共有** ボタンをクリックして、新しい共有クエリ機能を試してみてください。

<img alt="Share queries" style={{width: '500px', marginLeft: 0}} src={share_queries} />
### ClickHouse Cloud for Microsoft Azure is now in beta {#clickhouse-cloud-for-microsoft-azure-is-now-in-beta}

私たちはついに、Microsoft Azure で ClickHouse Cloud サービスを作成する機能を導入しました！私たちのプライベートプレビュー プログラムの一環として、すでに多くの顧客が Azure 上で ClickHouse Cloud を本番使用しています。これで、誰でも自分のサービスを Azure 上に作成できるようになりました。AWS や GCP でサポートされているすべての ClickHouse のお気に入りの機能も Azure で利用できます。

今後数週間以内に、ClickHouse Cloud for Azure を一般提供できることを期待しています。詳細については、[このブログ投稿](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta)をお読みいただくか、ClickHouse Cloud コンソールを使用して Azure で新しいサービスを作成してください。

注意：現在のところ、Azure の **開発** サービスはサポートされていません。
### Set up Private Link via the Cloud Console {#set-up-private-link-via-the-cloud-console}

私たちのプライベートリンク機能により、公共インターネットにトラフィックを向けることなく、クラウドプロバイダーアカウント内の内部サービスと ClickHouse Cloud サービスを接続できます。これにより、コストを削減し、セキュリティを強化できます。以前は、この設定は難しく、ClickHouse Cloud API を使用する必要がありました。

今、ClickHouse Cloud コンソールからわずか数回のクリックでプライベートエンドポイントを構成できるようになりました。サービスの **設定** に移動し、**セキュリティ** セクションに行き **プライベートエンドポイントを設定** をクリックします。

<img alt="Set up private endpoint" src={private_endpoint} />
## May 17, 2024 {#may-17-2024}
### Ingest data from Amazon Kinesis using ClickPipes (Beta) {#ingest-data-from-amazon-kinesis-using-clickpipes-beta}

ClickPipesは、コードを使用せずにデータを取り込むために ClickHouse Cloud が提供する独占的なサービスです。Amazon Kinesis は、データストリームを取り込んで保存するための AWS の完全管理型ストリーミングサービスです。私たちは、最もリクエストの多かった統合の一つである Amazon Kinesis 向けの ClickPipes ベータ版を発表できることを非常に嬉しく思います。ClickPipes に対する他の統合も追加する予定ですので、どのデータソースをサポートしてほしいかお知らせください！この機能についての詳細は [こちら](https://clickhouse.com/blog/clickpipes-amazon-kinesis) をご覧ください。

Cloud コンソールで新しい Amazon Kinesis 統合を試すことができます：

<img alt="Amazon Kinesis on ClickPipes"
  src={kenesis} />
### Configurable Backups (Private Preview) {#configurable-backups-private-preview}

バックアップは、すべてのデータベースにとって重要です（どれほど信頼できるものであっても）。ClickHouse Cloud の開始以来、私たちはバックアップを非常に重要視してきました。今週、私たちは Configurable Backups を導入しました。これにより、サービスのバックアップに対する柔軟性が大幅に向上しました。開始時間、保持期間、および頻度を管理できます。この機能は **本番** および **専用** サービスに対して利用でき、**開発** サービスには利用できません。この機能はプライベートプレビュー中ですので、support@clickhouse.com にお問い合わせいただき、この機能をサービスに有効にしてください。Configurable Backups についての詳細は [こちら](https://clickhouse.com/blog/configurable-backups-in-clickhouse-cloud) をご覧ください。
### Create APIs from your SQL queries (Beta) {#create-apis-from-your-sql-queries-beta}

ClickHouse 用に SQL クエリを書くと、アプリケーションにそのクエリを公開するためにドライバーを介して ClickHouse に接続する必要があります。新しい **クエリエンドポイント** 機能を使用すると、構成なしで API から直接 SQL クエリを実行できるようになりました。クエリエンドポイントを指定して、JSON、CSV、または TSV を返すことができます。Cloud コンソールで “共有” ボタンをクリックして、この新しい機能をクエリで試してみてください。クエリエンドポイントについての詳細は [こちら](https://clickhouse.com/blog/automatic-query-endpoints) をご覧ください。

<img alt="Configure query endpoints" style={{width: '450px', marginLeft: 0}} src={query_endpoints} />
### Official ClickHouse Certification is now available {#official-clickhouse-certification-is-now-available}

ClickHouse 開発トレーニングコースには 12 の無料トレーニングモジュールがあります。この週の前までは、ClickHouse の習熟度を証明する公式な方法がありませんでした。私たちは最近、**ClickHouse Certified Developer** になるための公式な試験を開始しました。この試験を完了することで、データの取り込み、モデリング、分析、パフォーマンス最適化などのトピックに関する ClickHouse の習熟度を現在や将来の雇用主と共有できます。試験を [こちら](https://clickhouse.com/learn/certification) で受けるか、ClickHouse 認定についての詳細は [このブログ投稿](https://clickhouse.com/blog/first-official-clickhouse-certification)をご覧ください。
## April 25, 2024 {#april-25-2024}
### Load data from S3 and GCS using ClickPipes {#load-data-from-s3-and-gcs-using-clickpipes}

最近リリースされたクラウドコンソールには、「データソース」と呼ばれる新しいセクションがあることに気づいたかもしれません。「データソース」ページは、ClickHouse Cloud にデータを容易に挿入する機能を提供する、ネイティブの ClickHouse Cloud 機能である ClickPipes によって強化されています。

最近の ClickPipes のアップデートでは、Amazon S3 および Google Cloud Storage から直接データをアップロードできる機能が追加されました。組み込みのテーブル関数を引き続き使用できますが、ClickPipes は UI を通じてデータを S3 および GCS にわずか数回のクリックで取り込むことができる完全管理型サービスです。この機能はまだプライベートプレビュー中ですが、今すぐクラウドコンソールで試すことができます。

<img alt="ClickPipes S3 and GCS" src={s3_gcs} />
### Use Fivetran to load data from 500+ sources into ClickHouse Cloud {#use-fivetran-to-load-data-from-500-sources-into-clickhouse-cloud}

ClickHouse はすべての大規模データセットを迅速にクエリできますが、もちろん、データはまず ClickHouse に挿入されなければなりません。Fivetran の包括的なコネクタの範囲のおかげで、ユーザーは500以上のソースからデータを迅速に読み込むことができるようになりました。Zendesk、Slack、またはお気に入りのアプリケーションからデータを読み込む必要がある場合は、新しい ClickHouse の Fivetran 用の宛先を使用することで、アプリケーションデータのターゲットデータベースとして ClickHouse を利用できます。

これは、統合チームによる数ヶ月間の努力によって構築されたオープンソースの統合です。[リリースブログ投稿](https://clickhouse.com/blog/fivetran-destination-clickhouse-cloud) や [GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-fivetran-destination) で詳細を確認できます。
### Other changes {#other-changes}

**コンソールの変更**
- SQL コンソールでの出力形式のサポート

**統合の変更**
- ClickPipes Kafka コネクタがマルチブローカー設定をサポート
- PowerBI コネクタが ODBC ドライバ設定オプションの提供をサポート
## April 18, 2024 {#april-18-2024}
### AWS Tokyo region is now available for ClickHouse Cloud {#aws-tokyo-region-is-now-available-for-clickhouse-cloud}

このリリースでは、ClickHouse Cloud 用の新しい AWS 東京リージョン（`ap-northeast-1`）が導入されました。私たちは ClickHouse を最速のデータベースにしたいと考えているため、レイテンシをできる限り減らすためにすべてのクラウドに必要なリージョンを継続的に追加しています。更新されたクラウドコンソールで東京に新しいサービスを作成できます。

<img alt="Create Tokyo Service" src={tokyo} />

他の変更：
### コンソールの変更 {#console-changes}
- Kafka 用の ClickPipes に対する Avro 形式のサポートが一般提供されました
- Terraform プロバイダーのリソース（サービスとプライベートエンドポイント）のインポートの完全サポートを実装
### 統合の変更 {#integrations-changes}
- NodeJS クライアントのメジャー安定リリース：クエリ + ResultSet、URL 構成に対する高度な TypeScript サポート
- Kafka コネクタ：DLQ に書き込む際の例外を無視するバグを修正、Avro Enum タイプのサポートを追加、[MSK](https://www.youtube.com/watch?v=6lKI_WlQ3-s) と [Confluent Cloud](https://www.youtube.com/watch?v=SQAiPVbd3gg) でのコネクタの使用ガイドを公開
- Grafana：UI における Nullable タイプのサポートを修正、動的 OTEL トレーステーブル名のサポートを修正
- DBT：カスタムマテリアライゼーションのモデル設定を修正
- Java クライアント：不正なエラーコード解析に関するバグを修正
- Python クライアント：数値タイプに対するパラメータバインディングを修正、クエリバインディングにおける数値リストのバグを修正、SQLAlchemy Point サポートを追加
## April 4, 2024 {#april-4-2024}
### Introducing the new ClickHouse Cloud Console {#introducing-the-new-clickhouse-cloud-console}

このリリースでは、新しいクラウドコンソールのプライベートプレビューが導入されます。

ClickHouse では、開発者体験を向上させる方法を常に考えています。最速のリアルタイムデータウェアハウスを提供するだけでは不十分で、使用と管理が簡単である必要もあります。

何千人もの ClickHouse Cloud ユーザーが毎月数十億のクエリを SQL コンソールで実行しているため、ClickHouse Cloud サービスとの対話をより簡単にするために、世界クラスのコンソールにもっと投資することを決定しました。新しいクラウドコンソール体験は、スタンドアロン SQL エディタと管理コンソールを1つの直感的な UI に統合します。

選ばれた顧客は、新しいクラウドコンソール体験を先行プレビューとして受け取ります。ClickHouse でのデータを探索し、管理するための統一された没入型の方法です。優先アクセスを希望される方は、support@clickhouse.com までご連絡ください。

<img alt="New Cloud Console" src={cloud_console} />
## March 28, 2024 {#march-28-2024}

このリリースでは、Microsoft Azure のサポート、API 経由での水平スケーリング、プライベートプレビューのリリースチャネルが導入されます。
### General updates {#general-updates}
- Microsoft Azure のプライベートプレビューサポートを導入しました。アクセスを得るには、アカウント管理またはサポートにご連絡するか、[ウェイトリスト](https://clickhouse.com/cloud/azure-waitlist) に参加してください。
- リリースチャネルの導入 – 環境タイプに基づいてアップグレードのタイミングを指定できる機能。このリリースでは、非生産環境を生産環境の前にアップグレードすることを可能にする「ファスト」リリースチャネルを追加しました（有効にするにはサポートに連絡してください）。
### Administration changes {#administration-changes}
- API 経由での水平スケーリング構成のサポートを追加（プライベートプレビューで、有効にするにはサポートに連絡してください）
- 起動時にメモリエラーが発生したサービスをスケールアップするためのオートスケーリングを改良
- Terraform プロバイダーを介して AWS の CMEK サポートを追加
### Console changes {#console-changes-1}
- Microsoft ソーシャルログインのサポートを追加
- SQL コンソールにおけるパラメータ化されたクエリ共有機能を追加
- クエリエディタのパフォーマンスを大幅に改善（EU の一部の地域で 5 秒から 1.5 秒の待機時間に短縮）
### Integrations changes {#integrations-changes-1}
- ClickHouse OpenTelemetry エクスポータ：ClickHouse レプリケーショントーブルエンジンの [サポート追加](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31920) と [統合テスト追加](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31896)
- ClickHouse DBT アダプタ： [ディクショナリのマテリアライゼーションマクロのサポート追加](https://github.com/ClickHouse/dbt-clickhouse/pull/255)、[TTL 式のサポートに関するテスト追加](https://github.com/ClickHouse/dbt-clickhouse/pull/254)
- ClickHouse Kafka Connect Sink：Kafka プラグインの発見と [互換性を追加](https://github.com/ClickHouse/clickhouse-kafka-connect/issues/350)（コミュニティによる貢献）
- ClickHouse Java Client：新しいクライアント API 用の [新しいパッケージ](https://github.com/ClickHouse/clickhouse-java/pull/1574) を導入し、「クラウドテスト」の [テストカバレッジを追加](https://github.com/ClickHouse/clickhouse-java/pull/1575)
- ClickHouse NodeJS Client：新しい HTTP キープアライブ動作に対するテストとドキュメントを拡張。v0.3.0 リリース以来利用可能
- ClickHouse Golang Client：Map 内の Enum をキーとするバグを [修正](https://github.com/ClickHouse/clickhouse-go/pull/1236)；接続プールにエラーが発生した接続が残るバグを [修正](https://github.com/ClickHouse/clickhouse-go/pull/1237)（コミュニティによる貢献）
- ClickHouse Python Client： [クエリ ストリーミング用に PyArrow のサポートを追加](https://github.com/ClickHouse/clickhouse-connect/issues/155)（コミュニティによる貢献）
### Security updates {#security-updates}
- ClickHouse Cloud を更新し、["ロールベースのアクセス制御が有効になっているときに、クエリキャッシュをバイパスされる"](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r)（CVE-2024-22412）を防止
## March 14, 2024 {#march-14-2024}

このリリースでは、新しい Cloud Console 体験、S3 および GCS からのバルクリードのための ClickPipes、Kafka 向けの ClickPipes における Avro 形式のサポートが早期アクセス可能になり、ClickHouse データベースバージョンが 24.1 にアップグレードされ、新しい機能やパフォーマンスおよびリソース使用の最適化が行われます。
### Console changes {#console-changes-2}
- 新しい Cloud Console 体験が早期アクセス可能（参加に興味がある方はサポートにご連絡ください）。
- S3 および GCS からのバルクリードのための ClickPipes が早期アクセス可能（参加に興味がある方はサポートにご連絡ください）。
- Kafka 向けの ClickPipes における Avro 形式のサポートが早期アクセス可能（参加に興味がある方はサポートにご連絡ください）。
### ClickHouse version upgrade {#clickhouse-version-upgrade}
- FINAL に対する最適化、ベクトル化の改善、より高速な集計 - 詳細は [23.12 リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final) をご覧ください。
- Punycode の処理、新しい関数、外れ値の検出、マージおよび Keeper のメモリ最適化 - 詳細は [24.1 リリースブログ](https://clickhouse.com/blog/clickhouse-release-24-01) および [プレゼンテーション](https://presentations.clickhouse.com/release_24.1/) をご覧ください。
- この ClickHouse クラウドバージョンは 24.1 を基盤としており、新機能、パフォーマンス改善、バグ修正が多数追加されています。コアデータベースの [変更ログ](/whats-new/changelog/2023#2312) で詳細をご覧ください。
### Integrations changes {#integrations-changes-2}
- Grafana：v4 のダッシュボードマイグレーションの修正、アドホックフィルタリングのロジック
- Tableau コネクタ：DATENAME 関数および「real」引数に対するラウンドを修正
- Kafka コネクタ：接続初期化時の NPE を修正、JDBC ドライバーオプションの指定機能を追加
- Golang クライアント：レスポンス処理時のメモリフットプリントを削減、Date32 の極端な値を修正、圧縮有効時のエラーレポートを改善
- Python クライアント：日時パラメーターのタイムゾーンサポートを改善、Pandas DataFrame に対するパフォーマンスを改善
## February 29, 2024 {#february-29-2024}

このリリースでは、SQL コンソールアプリケーションの読み込み時間が改善され、ClickPipes における SCRAM-SHA-256 認証のサポートが追加され、Kafka Connect に入れ子構造サポートが拡張されました。
### Console changes {#console-changes-3}
- SQL コンソールアプリケーションの初期読み込み時間を最適化
- SQL コンソールで認証に失敗する「認証失敗」エラーが発生する競合状態を修正
- 最近のメモリ割り当て値が時々不正確であった監視ページの動作を修正
- SQL コンソールが時々重複した KILL QUERY コマンドを発行する行動を修正
- Kafka ベースのデータソースに対して ClickPipes で SCRAM-SHA-256 認証方式のサポートを追加
### Integrations changes {#integrations-changes-3}
- Kafka コネクタ：複雑な入れ子構造（Array、Map）のサポートを拡張、FixedString タイプのサポートを追加、複数のデータベースへのデータ取り込みをサポート
- Metabase：ClickHouse バージョン 23.8 未満との互換性に関する修正
- DBT：モデル作成への設定の渡し能力を追加
- Node.js クライアント：長時間実行されるクエリ（>1時間）および空の値を優雅に処理するサポートを追加
## February 15, 2024 {#february-15-2024}

このリリースでは、コアデータベースバージョンのアップグレード、Terraform を介してプライベートリンクを設定する機能の追加、Kafka Connect を介した非同期挿入に対する正確に一度セマンティクスのサポートが追加されました。
### ClickHouse version upgrade {#clickhouse-version-upgrade-1}
- S3 からの継続的かつスケジュールされたデータ読み込みのための S3Queue テーブルエンジンが本番準備完了 - 詳細は [23.11 リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-11) をご覧ください。
- FINAL および SIMD 命令の最適化に対する重要なパフォーマンス向上 - 詳細は [23.12 リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final) をご覧ください。
- この ClickHouse クラウドバージョンは 23.12 を基盤としており、新機能、パフォーマンス改善、バグ修正が多数追加されています。コアデータベースの [変更ログ](/whats-new/changelog/2023#2312) で詳細をご覧ください。
### Console changes {#console-changes-4}
- Terraform プロバイダーを介して AWS プライベートリンクおよび GCP プライベートサービス接続を設定する機能を追加
- リモートファイルデータのインポートのレジリエンシーを改善
- すべてのデータインポートにインポートステータス詳細フライアウトを追加
- s3 データインポートにおいて key/secret key 認証のサポートを追加
### Integrations changes {#integrations-changes-4}
* Kafka Connect
    * 厳密に一度 (デフォルトでは無効) に対する async_insert をサポート
* Golang クライアント
    * DateTime バインディングを修正
    * バッチ挿入のパフォーマンスを改善
* Java クライアント
    * リクエスト圧縮の問題を修正
### Settings changes {#settings-changes}
* `use_mysql_types_in_show_columns` はもはや必要ありません。MySQL インターフェイスを介して接続すると自動的に有効になります。
* `async_insert_max_data_size` のデフォルト値が `10 MiB` になりました
## February 2, 2024 {#february-2-2024}

このリリースでは、Azure Event Hub 向けの ClickPipes の提供、v4 ClickHouse Grafana コネクタを使用したログおよびトレースのナビゲーションのワークフローが大幅に改善され、Flyway および Atlas データベーススキーマ管理ツールのサポートが開始されます。
### Console changes {#console-changes-5}
* Azure Event Hub 向けの ClickPipes サポートを追加
* 新しいサービスはデフォルトで 15 分のアイドル時間で起動されます
### Integrations changes {#integrations-changes-5}
* [ClickHouse データソース for Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) v4 リリース
  * テーブル、ログ、タイムシリーズ、トレース用の専門的なエディタを持つ完全に再構築されたクエリビルダー
  * より複雑で動的なクエリをサポートする完全に再構築された SQL ジェネレーター
  * ログおよびトレースビューで OpenTelemetry に対するファーストクラスのサポートを追加
  * ログとトレース用のデフォルトテーブルとカラムを指定できるように設定を拡張
  * カスタム HTTP ヘッダーを指定できる機能を追加
  * その他多くの改善 - 完全な [変更ログ](https://github.com/grafana/clickhouse-datasource/blob/main/CHANGELOG.md#400) をチェックしてください
* データベーススキーマ管理ツール
  * [Flyway が ClickHouse をサポート](https://github.com/flyway/flyway-community-db-support/packages/2037428)
  * [Ariga Atlas が ClickHouse をサポート](https://atlasgo.io/blog/2023/12/19/atlas-v-0-16#clickhouse-beta-program)
* Kafka Connector Sink
  * デフォルト値のあるテーブルへの取り込みを最適化
  * DateTime64 における文字列に基づく日付のサポートを追加
* Metabase
  * 複数のデータベースへの接続のサポートを追加
## January 18, 2024 {#january-18-2024}

このリリースでは、新しいリージョンの AWS (ロンドン / eu-west-2)、Redpanda、Upstash、Warpstream 向けの ClickPipes サポートが追加され、[is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) コアデータベース機能の信頼性が向上しました。
### General changes {#general-changes}
- 新しい AWS リージョン：ロンドン (eu-west-2)
### Console changes {#console-changes-6}
- Redpanda、Upstash、Warpstream 向けの ClickPipes サポートを追加
- ClickPipes 認証メカニズムを UI で設定可能に
### Integrations changes {#integrations-changes-6}
- Java クライアント：
  - 破壊的変更：呼び出し時にランダム URL ハンドルを指定する機能を削除。この機能は ClickHouse から削除されました
  - 非推奨：Java CLI クライアントおよび GRPC パッケージ
  - ClickHouse インスタンスのバッチサイズと作業負荷を軽減するため、RowBinaryWithDefaults 形式のサポートを追加（Exabeam のリクエストによる）
  - Date32 と DateTime64 の範囲の境界を ClickHouse と互換性を持たせ、Spark Array 文字列タイプとの互換性、ノード選択メカニズムを設定
- Kafka コネクタ：Grafana の JMX 監視ダッシュボードを追加
- PowerBI：UI で ODBC ドライバー設定を設定可能に
- JavaScript クライアント：クエリ概要情報を公開し、挿入用に特定のカラムのサブセットを提供できるようにし、Web クライアントのキープアライブを設定可能に
- Python クライアント：SQLAlchemy に対する Nothing タイプサポートを追加
### Reliability changes {#reliability-changes}
- ユーザー向けの互換性がない変更：以前は、特定の条件下で二つの機能（[is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) と ``OPTIMIZE CLEANUP``）が ClickHouse 内のデータ破損を引き起こす可能性がありました。データの整合性を保護しつつ機能のコアを維持するために、これらの機能の動作を調整しました。具体的には、MergeTree の設定 ``clean_deleted_rows`` が現在非推奨となり、もはや効果がなくなりました。``CLEANUP`` キーワードはデフォルトでは許可されておらず（使用するには ``allow_experimental_replacing_merge_with_cleanup`` を有効にする必要があります）、``CLEANUP`` を使用する場合、必ず ``FINAL`` と共に使用する必要があり、``OPTIMIZE FINAL CLEANUP`` を実行後に古いバージョンの行が挿入されないことを保証する必要があります。
## December 18, 2023 {#december-18-2023}

このリリースでは、新しい GCP リージョン（us-east1）、自己サービスの安全なエンドポイント接続の機能、DBT 1.7 を含む追加の統合のサポート、数々のバグ修正とセキュリティ強化が追加されます。
### 一般的な変更 {#general-changes-1}
- ClickHouse CloudがGCPのus-east1（サウスカロライナ）リージョンで利用可能になりました
- OpenAPI経由でAWS Private LinkおよびGCP Private Service Connectの設定機能を有効化しました
### コンソールの変更 {#console-changes-7}
- 開発者ロールを持つユーザーのためにSQLコンソールへのシームレスなログインを有効化しました
- オンボーディング中にアイドリング制御を設定するワークフローを streamlined しました
### 統合の変更 {#integrations-changes-7}
- DBTコネクタ: DBT v1.7までのサポートを追加しました
- Metabase: Metabase v0.48のサポートを追加しました
- PowerBIコネクタ: PowerBI Cloudでの実行機能を追加しました
- ClickPipes内部ユーザーの権限を設定可能にしました
- Kafka Connect
  - Nullableタイプの重複排除ロジックと取り込みを改善しました
  - テキストベースのフォーマット（CSV、TSV）をサポートしました
- Apache Beam: BooleanおよびLowCardinalityタイプのサポートを追加しました
- Node.jsクライアント: Parquetフォーマットのサポートを追加しました
### セキュリティの発表 {#security-announcements}
- 3つのセキュリティ脆弱性をパッチしました - 詳細は[セキュリティ変更ログ](/whats-new/security-changelog)を参照してください：
  - CVE 2023-47118 (CVSS 7.0) - デフォルトでポート9000/tcpで実行されるネイティブインターフェースに影響するヒープバッファオーバーフローの脆弱性
  - CVE-2023-48704 (CVSS 7.0) - デフォルトでポート9000/tcpで実行されるネイティブインターフェースに影響するヒープバッファオーバーフローの脆弱性
  - CVE 2023-48298 (CVSS 5.9) - FPC圧縮コーデックにおける整数アンダーフローの脆弱性
## 2023年11月22日 {#november-22-2023}

このリリースでは、コアデータベースバージョンがアップグレードされ、ログインと認証フローが改善され、Kafka Connect Sinkにプロキシサポートが追加されました。
### ClickHouseバージョンのアップグレード {#clickhouse-version-upgrade-2}

- Parquetファイルの読み取り性能が劇的に改善されました。詳細は[23.8リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-08)を参照してください。
- JSONに対する型推論サポートが追加されました。詳細は[23.9リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-09)を参照してください。
- `ArrayFold`のような強力な分析者向け関数が導入されました。詳細は[23.10リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-10)を参照してください。
- **ユーザー向けの後方互換性のない変更**: JSONフォーマットの文字列から数値を推論しないように、`input_format_json_try_infer_numbers_from_strings`設定がデフォルトで無効になりました。この操作は、サンプルデータに数値に似た文字列が含まれる場合に解析エラーを引き起こす可能性があります。
- 多数の新機能、パフォーマンスの改善、バグ修正が含まれています。詳細は[コアデータベースの変更ログ](/whats-new/changelog)を参照してください。
### コンソールの変更 {#console-changes-8}

- ログインと認証フローが改善されました。
- 大規模スキーマをよりよくサポートするためにAIベースのクエリ提案が改善されました。
### 統合の変更 {#integrations-changes-8}

- Kafka Connect Sink: プロキシサポート、`topic-tablename`マッピング、Keeper _exactly-once_ 配信プロパティの設定性を追加しました。
- Node.jsクライアント: Parquetフォーマットのサポートを追加しました。
- Metabase: `datetimeDiff`関数のサポートを追加しました。
- Pythonクライアント: カラム名の特殊文字のサポートを追加。タイムゾーンパラメータのバインディングを修正しました。
## 2023年11月2日 {#november-2-2023}

このリリースでは、アジアにおける開発サービスの地域的サポートが追加され、顧客管理の暗号化キーに対するキー回転機能、多数の修正が行われました。
### 一般的な更新 {#general-updates-1}
- AWSの`ap-south-1`（ムンバイ）および`ap-southeast-1`（シンガポール）に開発サービスが利用可能になりました。
- 顧客管理の暗号化キー（CMEK）に対するキー回転のサポートが追加されました。
### コンソールの変更 {#console-changes-9}
- クレジットカード追加時に細かな税設定を構成する機能が追加されました。
### 統合の変更 {#integrations-changes-9}
- MySQL
  - MySQL経由でのTableau OnlineおよびQuickSightのサポートを改善しました。
- Kafkaコネクタ
  - テキストベースのフォーマット（CSV、TSV）をサポートする新しいStringConverterを導入しました。
  - バイトおよび小数データ型のサポートを追加しました。
  - 元のRetryable Exceptionsを現在常に再試行されるように調整しました（`errors.tolerance=all`の場合も同様）。
- Node.jsクライアント
  - ストリーミングされた大規模データセットによる破損した結果の問題を修正しました。
- Pythonクライアント
  - 大規模挿入におけるタイムアウトを修正しました。
  - NumPy/Pandas Date32の問題を修正しました。
- Golangクライアント
  - JSONカラムに空のマップを挿入する、圧縮バッファクリーンアップ、クエリエスケープ、IPv4およびIPv6のゼロ/ヌル時のパニックを修正しました。
  - キャンセルされた挿入に対してウォッチドッグを追加しました。
- DBT
  - テストを伴う分散テーブルサポートを改善しました。
## 2023年10月19日 {#october-19-2023}

このリリースでは、SQLコンソールにおける使いやすさとパフォーマンスの改善、MetabaseコネクタにおけるIPデータタイプの処理が改善され、JavaおよびNode.jsクライアントに新機能が追加されました。
### コンソールの変更 {#console-changes-10}
- SQLコンソールの使いやすさが改善されました（例: クエリ実行間でカラム幅を保持）。
- SQLコンソールのパフォーマンスが改善されました。
### 統合の変更 {#integrations-changes-10}
- Javaクライアント:
  - パフォーマンスを改善し、オープンな接続を再利用するためにデフォルトのネットワークライブラリを切り替えました。
  - プロキシサポートを追加しました。
  - 信頼できるストアを用いた安全な接続のサポートを追加しました。
- Node.jsクライアント: 挿入クエリのためのキープアライブ動作を修正しました。
- Metabase: IPv4/IPv6カラムのシリアライズを修正しました。
## 2023年9月28日 {#september-28-2023}

このリリースでは、Kafka、Confluent Cloud、およびAmazon MSK向けのClickPipesの一般提供を行い、Kafka Connect ClickHouse Sink、IAMロールを介したAmazon S3への安全なアクセスを提供するセルフサービスワークフロー、AI支援のクエリ提案（プライベートプレビュー）が追加されました。
### コンソールの変更 {#console-changes-11}
- IAMロールを介した[Amazon S3へのアクセスを確保するためのセルフサービスワークフローを追加しました](/cloud/security/secure-s3)。
- プライベートプレビューとしてAI支援のクエリ提案を導入しました（ぜひ[ClickHouse Cloudサポートに連絡](https://console.clickhouse.cloud/support)して試してみてください！）。
### 統合の変更 {#integrations-changes-11}
- ClickPipesの一般提供を発表しました - Kafka、Confluent Cloud、およびAmazon MSK用のターンキー データ取り込みサービス（詳細は[リリースブログ](https://clickhouse.com/blog/clickpipes-is-generally-available)を参照）。
- Kafka Connect ClickHouse Sinkの一般提供に達しました。
  - `clickhouse.settings`プロパティを使用してカスタマイズされたClickHouse設定のサポートを拡張しました。
  - ダイナミックフィールドを考慮したデデュプリケーション動作を改善しました。
  - ClickHouseからのテーブル変更を再取得するための`tableRefreshInterval`のサポートを追加しました。
- SSL接続の問題や[PowerBI](/integrations/powerbi)とClickHouseデータ型間の型マッピングを修正しました。
## 2023年9月7日 {#september-7-2023}

このリリースでは、PowerBI Desktop公式コネクタのベータリリース、インド向けのクレジットカード決済処理の改善、およびサポートされている言語クライアントにおける多数の改善が行われました。
### コンソールの変更 {#console-changes-12}
- インドからの請求をサポートするための残高クレジットと支払いの再試行を追加しました。
### 統合の変更 {#integrations-changes-12}
- Kafkaコネクタ: ClickHouse設定を構成するサポートを追加し、error.tolerance構成オプションを追加しました。
- PowerBI Desktop: 公式コネクタのベータバージョンをリリースしました。
- Grafana: Point geo typeのサポートを追加し、Data Analystダッシュボードのパネルを修正し、timeIntervalマクロを修正しました。
- Pythonクライアント: Pandas 2.1.0と互換性があり、Python 3.7のサポートを削除し、Nullable JSONタイプのサポートを追加しました。
- Node.jsクライアント: default_format設定サポートを追加しました。
- Golangクライアント: bool型の処理を修正し、文字列制限を削除しました。
## 2023年8月24日 {#aug-24-2023}

このリリースでは、ClickHouseデータベースへのMySQLインターフェースのサポート、新しい公式PowerBIコネクタの導入、クラウドコンソールに新しい「実行中のクエリ」ビューを追加し、ClickHouseのバージョンが23.7に更新されました。
### 一般的な更新 {#general-updates-2}
- [MySQLワイヤプロトコル](/interfaces/mysql)のサポートが追加され、（他の使用例の中で）多くの既存のBIツールとの互換性を可能にします。この機能を自組織に有効にするためにサポートに連絡してください。
- 新しい公式PowerBIコネクタを導入しました。
### コンソールの変更 {#console-changes-13}
- SQLコンソールに「実行中のクエリ」ビューを追加しました。
### ClickHouse 23.7バージョンアップグレード {#clickhouse-237-version-upgrade}
- Azure Table機能のサポートを追加し、地理データ型を製品向けに安定化させ、結合パフォーマンスを改善しました - 詳細は23.5リリース[ブログ](https://clickhouse.com/blog/clickhouse-release-23-05)を参照してください。
- MongoDB統合のサポートをバージョン6.0に拡張しました - 詳細は23.6リリース[ブログ](https://clickhouse.com/blog/clickhouse-release-23-06)を参照してください。
- Parquetフォーマットへの書き込み性能が6倍向上し、PRQLクエリ言語のサポートが追加され、SQL互換性が向上しました - 詳細は23.7リリース[デッキ](https://presentations.clickhouse.com/release_23.7/)を参照してください。
- 多数の新機能、パフォーマンスの改善、バグ修正が含まれています - 詳細な[changelogs](/whats-new/changelog)を参照してください23.5、23.6、23.7のための。
### 統合の変更 {#integrations-changes-13}
- Kafkaコネクタ: Avro DateおよびTimeタイプのサポートを追加しました。
- JavaScriptクライアント: ウェブ環境向けの安定バージョンをリリースしました。
- Grafana: フィルターロジックとデータベース名の処理を改善し、サブ秒精度のTimeIntervalをサポートしました。
- Golangクライアント: 複数のバッチおよび非同期データ読み込みの問題を修正しました。
- Metabase: v0.47をサポートし、接続のインパーソネーションを追加し、データ型のマッピングを修正しました。
## 2023年7月27日 {#july-27-2023}

このリリースでは、Kafka向けのClickPipesのプライベートプレビュー、データ読み込みエクスペリエンスの新機能、およびクラウドコンソールを使用してURLからファイルを読み込む機能が追加されました。
### 統合の変更 {#integrations-changes-14}
- Kafka向けの[ClickPipes](https://clickhouse.com/cloud/clickpipes)のプライベートプレビューを導入しました。これは、KafkaとConfluent Cloudから大量のデータを簡単に取り込むことを可能にするクラウドネイティブの統合エンジンです。ウェイトリストにサインアップしてください[こちら](https://clickhouse.com/cloud/clickpipes#joinwaitlist).
- JavaScriptクライアント: ウェブ環境（ブラウザ、Cloudflareワーカー）向けのサポートをリリースしました。コミュニティがカスタム環境向けのコネクタを作成できるようにコードがリファクタリングされました。
- Kafkaコネクタ: TimestampおよびTime Kafkaタイプを持つインラインスキーマのサポートを追加しました。
- Pythonクライアント: 挿入の圧縮およびLowCardinality読み取りの問題を修正しました。
### コンソールの変更 {#console-changes-14}
- テーブル作成設定オプションを増やして新しいデータ読み込みエクスペリエンスを追加しました。
- クラウドコンソールを使用してURLからファイルを読み込む機能を導入しました。
- 別の組織に参加するオプションや未解決の招待状をすべて確認できる追加オプションを含めることで、招待フローが改善されました。
## 2023年7月14日 {#july-14-2023}

このリリースでは、Dedicated Servicesを立ち上げる機能、新しいオーストラリアのAWSリージョン、ディスク上のデータを暗号化するための自分のキーを持ち込む機能が追加されました。
### 一般的な更新 {#general-updates-3}
- 新しいオーストラリアのAWSリージョン: シドニー (ap-southeast-2)
- 高いレイテンシが求められるワークロード向けにDedicated tierサービスを提供しています（設定のために[サポートに連絡](https://console.clickhouse.cloud/support)してください）。
- ディスク上のデータを暗号化するためのキーを持ち込む (BYOK) 機能（設定のために[サポートに連絡](https://console.clickhouse.cloud/support)してください）。
### コンソールの変更 {#console-changes-15}
- 非同期挿入のための可観測性メトリクスダッシュボードが改善されました。
- サポートとの統合のためのチャットボットの動作が改善されました。
### 統合の変更 {#integrations-changes-15}
- NodeJSクライアント: ソケットタイムアウトによる接続失敗のバグを修正しました。
- Pythonクライアント: 挿入クエリにQuerySummaryを追加し、データベース名の特殊文字のサポートを追加しました。
- Metabase: JDBCドライババージョンを更新し、DateTime64のサポートを追加し、パフォーマンスが向上しました。
### コアデータベースの変更 {#core-database-changes}
- [クエリキャッシュ](/operations/query-cache)がClickHouse Cloudで有効にできます。有効にされると、成功したクエリはデフォルトで1分間キャッシュされ、その後のクエリはキャッシュされた結果を使用します。
## 2023年6月20日 {#june-20-2023}

このリリースでは、GCP上のClickHouse Cloudが一般提供に移行し、Cloud API向けにTerraformプロバイダが提供され、ClickHouseのバージョンが23.4に更新されました。
### 一般的な更新 {#general-updates-4}
- GCP上のClickHouse CloudがGAとなり、GCPマーケットプレイスとの統合、プライベートサービスコネクトのサポート、および自動バックアップが新たに提供されます（詳細は[ブログ](https://clickhouse.com/blog/clickhouse-cloud-on-google-cloud-platform-gcp-is-generally-available)と[プレスリリース](https://clickhouse.com/blog/clickhouse-cloud-expands-choice-with-launch-on-google-cloud-platform)を参照）。
- Cloud API向けの[Terraformプロバイダ](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)が利用可能になりました。
### コンソールの変更 {#console-changes-16}
- サービスの新しい統合設定ページを追加しました。
- ストレージとコンピュートのメーター精度を調整しました。
### 統合の変更 {#integrations-changes-16}
- Pythonクライアント: 挿入性能を改善し、内部依存関係をリファクタリングしてマルチプロセスをサポートしました。
- Kafkaコネクタ: Confluent Cloudにアップロードおよびインストールできるようになり、接続問題の再試行を追加し、誤ったコネクタ状態を自動的にリセットしました。
### ClickHouse 23.4バージョンアップグレード {#clickhouse-234-version-upgrade}
- パラレルレプリカに対応するJOINサポートが追加されました（設定のために[サポートに連絡](https://console.clickhouse.cloud/support)してください）。
- 軽量削除のパフォーマンスが改善されました。
- 大規模な挿入を処理する際のキャッシングが改善されました。
### 管理の変更 {#administration-changes-1}
- "default"ではないユーザー向けのローカル辞書作成が拡張されました。
## 2023年5月30日 {#may-30-2023}

このリリースでは、ClickHouse Cloudのプログラムmatic APIによる制御プレーン操作の公開リリースが行われます（詳細は[ブログ](https://clickhouse.com/blog/using-the-new-clickhouse-cloud-api-to-automate-deployments)を参照）、S3アクセスがIAMロールを介して行えるようになり、追加のスケーリングオプションが提供されます。
### 一般的な変更 {#general-changes-2}
- ClickHouse CloudのAPIサポート。新しいCloud APIを使用することで、既存のCI/CDパイプラインにサービス管理をシームレスに統合し、プログラムによってサービスを管理できます。
- IAMロールを使用したS3アクセス。プライベートなAmazon Simple Storage Service (S3) バケットへの安全なアクセスのためにIAMロールを活用できるようになりました（設定のためにサポートに連絡してください）。
### スケーリングの変更 {#scaling-changes}
- [水平スケーリング](/manage/scaling#manual-horizontal-scaling)。より多くの並列実行が要求されるワークロードは、最大10のレプリカで設定できるようになりました（設定のためにサポートに連絡してください）。
- [CPUベースのオートスケーリング](/manage/scaling)。CPUバウンドワークロードは、オートスケーリングポリシーのための追加トリガーからの利益を得ることができます。
### コンソールの変更 {#console-changes-17}
- 開発サービスをプロダクションサービスに移行する機能を追加しました（有効化のためにサポートに連絡してください）。
- インスタンス作成フロー中のスケーリング設定コントロールを追加しました。
- デフォルトパスワードがメモリに存在しない場合の接続文字列を修正しました。
### 統合の変更 {#integrations-changes-17}
- Golangクライアント: ネイティブプロトコルにおける不均衡な接続に関する問題を修正しました。ネイティブプロトコルのカスタム設定サポートが追加されました。
- Node.jsクライアント: Node.js v14のサポートを削除し、v20のサポートを追加しました。
- Kafkaコネクタ: LowCardinalityタイプのサポートが追加されました。
- Metabase: 時間範囲によるグループ化を修正し、Metabase内蔵質問における整数サポートの修正が行われました。
### パフォーマンスと信頼性 {#performance-and-reliability}
- 書き込みが多いワークロードの効率とパフォーマンスが向上しました。
- バックアップの速度と効率を向上させるために、インクリメンタルバックアップ戦略が展開されました。
## 2023年5月11日 {#may-11-2023}

このリリースでは、ClickHouse CloudのGCPにおける~~公開ベータ~~（現在はGA、上記の6月20日のエントリを参照）を提供し、クエリの終了権限を授与するために管理者の権限を拡張し、Cloudコンソール内でMFAユーザーの状態をより可視化しました。
### ClickHouse Cloud on GCP ~~（公開ベータ）~~（現在はGA、上記の6月20日のエントリを参照） {#clickhouse-cloud-on-gcp-public-beta-now-ga-see-june-20th-entry-above}
- Google ComputeおよびGoogle Cloud Storageの上に構築された、完全管理型の分離ストレージとコンピュートのClickHouse提供を開始します。
- アイオワ（us-central1）、オランダ（europe-west4）、シンガポール（asia-southeast1）の各リージョンで利用可能です。
- 初期の3つのリージョンで開発サービスとプロダクションサービスの両方をサポートします。
- デフォルトで強力なセキュリティを提供します：トランジット内のエンドツーエンド暗号化、静止データの暗号化、IP許可リスト。
### 統合の変更 {#integrations-changes-18}
- Golangクライアント: プロキシ環境変数のサポートを追加しました。
- Grafana: Grafanaデータソースの設定でClickHouseのカスタム設定とプロキシ環境変数を指定する機能を追加しました。
- Kafkaコネクタ: 空のレコードの処理を改善しました。
### コンソールの変更 {#console-changes-18}
- ユーザーリスト内で多要素認証（MFA）の使用のインジケータを追加しました。
### パフォーマンスと信頼性 {#performance-and-reliability-1}
- 管理者によるクエリ終了権限に関してより細かな制御を追加しました。
## 2023年5月4日 {#may-4-2023}

このリリースでは、新しいヒートマップチャートタイプを追加し、請求使用ページの改善を行い、サービスの起動時間を短縮しました。
### コンソールの変更 {#console-changes-19}
- SQLコンソールにヒートマップチャートタイプを追加しました。
- 各請求次元内の消費クレジットを表示するために請求使用ページを改善しました。
### 統合の変更 {#integrations-changes-19}
- Kafkaコネクタ: 一時的接続エラーの再試行メカニズムを追加しました。
- Pythonクライアント: HTTP接続が永遠に再利用されないことを保証するためにmax_connection_age設定を追加しました。これにより、特定の負荷分散の問題を解決できます。
- Node.jsクライアント: Node.js v20のサポートを追加しました。
- Javaクライアント: クライアント証明書認証サポートを改善し、ネストされたタプル/マップ/ネストされたタイプのサポートを追加しました。
### パフォーマンスと信頼性 {#performance-and-reliability-2}
- 大量のパーツが存在する場合のサービス起動時間を改善しました。
- SQLコンソールにおける長時間実行クエリのキャンセルロジックを最適化しました。
### バグ修正 {#bug-fixes}
- `Cell Towers`サンプルデータセットのインポートが失敗するバグを修正しました。
## 2023年4月20日 {#april-20-2023}

このリリースでは、ClickHouseのバージョンが23.3に更新され、コールドリードの速度が大幅に向上し、サポートとのリアルタイムチャットが可能になりました。
### コンソールの変更 {#console-changes-20}
- サポートとのリアルタイムチャットのオプションを追加しました。
### 統合の変更 {#integrations-changes-20}
- Kafkaコネクタ: Nullableタイプのサポートを追加しました。
- Golangクライアント: 外部テーブルへのサポートを追加し、ブールおよびポインタ型のパラメータバインディングをサポートしました。
### 設定の変更 {#configuration-changes}
- 大きなテーブルを削除する能力を追加しました–`max_table_size_to_drop`および`max_partition_size_to_drop`設定をオーバーライドします。
### パフォーマンスと信頼性 {#performance-and-reliability-3}
- `allow_prefetched_read_pool_for_remote_filesystem`設定を介したS3のプリフェッチを使用することによって、コールドリードの速度を改善します。
### ClickHouse 23.3バージョンアップグレード {#clickhouse-233-version-upgrade}
- 軽量削除が本番環境で使用可能になりました–詳細は23.3リリース[ブログ](https://clickhouse.com/blog/clickhouse-release-23-03)を参照してください。
- マルチステージPREWHEREのサポートが追加されました–詳細は23.2リリース[ブログ](https://clickhouse.com/blog/clickhouse-release-23-03)を参照してください。
- 多数の新機能、パフォーマンス改善、バグ修正が含まれています–詳細な[changelogs](/whats-new/changelog/index.md)を参照してください23.3および23.2。
## 2023年4月6日 {#april-6-2023}

このリリースでは、クラウドエンドポイントの取得に関するAPI、最小アイドルタイムアウトのための高度なスケーリング制御、およびPythonクライアントクエリメソッドでの外部データサポートが追加されました。
### APIの変更 {#api-changes}
* [Cloud Endpoints API](//cloud/get-started/query-endpoints.md)を介してClickHouse Cloudエンドポイントをプログラムで照会できる機能を追加しました。
### コンソールの変更 {#console-changes-21}
- 高度なスケーリング設定に「最小アイドルタイムアウト」設定が追加されました。
- データ読み込みモーダル内のスキーマ推論に最善の努力による日時検出が追加されました。
### 統合の変更 {#integrations-changes-21}
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 複数のスキーマのサポートを追加しました。
- [Goクライアント](/integrations/language-clients/go/index.md): TLS接続のアイドル接続の生存確認を修正しました。
- [Pythonクライアント](/integrations/language-clients/python/index.md)
  - クエリメソッドでの外部データのサポートを追加しました。
  - クエリ結果に対するタイムゾーンサポートを追加しました。
  - `no_proxy`/`NO_PROXY`環境変数のサポートを追加しました。
  - NullableタイプのNULL値のサーバーサイドパラメータバインディングを修正しました。
### バグ修正 {#bug-fixes-1}
* SQLコンソールからの`INSERT INTO … SELECT …`の実行時に同じ行制限が選択クエリと誤って適用される動作を修正しました。
## 2023年3月23日 {#march-23-2023}

このリリースでは、データベースパスワードの複雑さルール、大きなバックアップを復元する速度の大幅な改善、およびGrafana Trace Viewでトレースを表示するサポートが追加されます。
### セキュリティと信頼性 {#security-and-reliability}
- コアデータベースエンドポイントは、今後パスワードの複雑さルールを強制します。
- 大きなバックアップを復元する時間が改善されました。
### コンソールの変更 {#console-changes-22}
- オンボーディングワークフローを合理化し、新しいデフォルトとよりコンパクトなビューを導入します。
- サインアップおよびサインインのレイテンシを低減しました。
### 統合の変更 {#integrations-changes-22}
- Grafana:
  - ClickHouseに保存されたトレースデータをTrace Viewで表示するサポートを追加しました。
  - 時間範囲フィルタを改善し、テーブル名の特殊文字のサポートを追加しました。
- Superset: ネイティブClickHouseサポートを追加しました。
- Kafka Connect Sink: 自動的な日付変換とNullカラムの処理を追加しました。
- Metabase: v0.46との互換性を実装しました。
- Pythonクライアント: 一時テーブルへの挿入を修正し、Pandas Nullのサポートを追加しました。
- Golangクライアント: タイムゾーンのあるDateタイプを正規化しました。
- Javaクライアント
  - SQLパーサーに圧縮、infile、およびoutfileキーワードのサポートを追加しました。
  - 認証情報のオーバーロードを追加しました。
  - `ON CLUSTER`でのバッチサポートを修正しました。
- Node.jsクライアント
  - JSONStrings、JSONCompact、JSONCompactStrings、JSONColumnsWithMetadataフォーマットのサポートを追加しました。
  - `query_id`をすべての主要なクライアントメソッドに提供できるようになりました。
### バグ修正 {#bug-fixes-2}
- 新サービスの初期プロビジョニングおよび起動時間が遅くなるバグを修正しました。
- キャッシュの誤設定が原因でクエリパフォーマンスが低下したバグを修正しました。
## 2023年3月9日 {#march-9-2023}

このリリースでは、可観測性ダッシュボードが改善され、大きなバックアップを作成する時間が最適化され、大きなテーブルとパーティションを削除するための構成が追加されます。
### コンソールの変更 {#console-changes-23}
- 高度な可観測性ダッシュボード（プレビュー）が追加されました。
- 可観測性ダッシュボードにメモリ割り当てチャートを導入しました。
- SQLコンソールのスプレッドシートビューにおける間隔および改行処理が改善されました。
### 信頼性とパフォーマンス {#reliability-and-performance}
- データが変更された場合にのみバックアップを実行するようにバックアップスケジュールを最適化しました。
- 大きなバックアップを完了する時間が改善されました。
### 設定の変更 {#configuration-changes-1}
- テーブルとパーティションを削除する制限を増やすための機能が追加され、クエリまたは接続レベルで`max_table_size_to_drop`および`max_partition_size_to_drop`設定をオーバーライドできます。
- クエリログに送信元IPを追加し、送信元IPに基づくクォータおよびアクセス制御の強制を可能にしました。
### 統合 {#integrations}
- [Pythonクライアント](/integrations/language-clients/python/index.md): Pandasのサポートが改善され、タイムゾーン関連の問題が修正されました。
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): Metabase 0.46.xの互換性とSimpleAggregateFunctionのサポートを追加しました。
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): 暗黙の日付変換とnullカラムの処理を改善しました。
- [Javaクライアント](https://github.com/ClickHouse/clickhouse-java): Javaのマップへのネスト変換を追加しました。
## 2023年2月23日 {#february-23-2023}

このリリースでは、ClickHouse 23.1コアリリースの一部機能を有効にし、Amazon Managed Streaming for Apache Kafka（MSK）との相互運用性を提供し、アクティビティログで高度なスケーリングおよびアイドリング調整を公開します。
### ClickHouse 23.1バージョンアップグレード {#clickhouse-231-version-upgrade}

ClickHouse 23.1の一部機能をサポートします。例えば：
- Mapタイプを持つARRAY JOIN
- SQL標準の16進数およびバイナリリテラル
- `age()`、`quantileInterpolatedWeighted()`、`quantilesInterpolatedWeighted()`を含む新機能
- 引数なしで`generateRandom`に挿入テーブルからの構造体を使用する能力
- 前の名前を再利用可能にするデータベース作成およびリネームロジックの改善
- 詳細については、23.1リリース[ウェビナー資料](https://presentations.clickhouse.com/release_23.1/#cover)および[23.1リリース変更ログ](/whats-new/cloud#clickhouse-231-version-upgrade)を参照してください。
### 統合の変更 {#integrations-changes-23}
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): Amazon MSKのサポートを追加しました。
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 最初の安定リリース1.0.0
  - コネクタが[Metabase Cloud](https://www.metabase.com/start/)で利用可能になりました。
  - 利用可能なすべてのデータベースを探索する機能を追加しました。
  - AggregationFunctionタイプでのデータベースの同期が修正されました。
- [DBT-clickhouse](/integrations/data-ingestion/etl-tools/dbt/index.md): 最新のDBTバージョンv1.4.1に対するサポートを追加しました。
- [Pythonクライアント](/integrations/language-clients/python/index.md): プロキシおよびSSHトンネリングのサポートが改善され、Pandasのデータフレームに対する多くの修正とパフォーマンス最適化が追加されました。
- [Nodejsクライアント](/integrations/language-clients/js.md): クエリ結果に`query_id`を添付する機能がリリースされました。これを使用して`system.query_log`からクエリメトリクスを取得できます。
- [Golangクライアント](/integrations/language-clients/go/index.md): ClickHouse Cloudとのネットワーク接続が最適化されました。
### コンソールの変更 {#console-changes-24}
- アクティビティログに高度なスケーリングおよびアイドリング設定の調整が追加されました。
- パスワードリセットメールにユーザーエージェントとIP情報を追加しました。
- Google OAuthのサインアップフローメカニズムが改善されました。
### 信頼性とパフォーマンス {#reliability-and-performance-1}
- 大規模サービスのアイドルからの復帰時間を短縮しました。
- テーブルおよびパーティション数が多いサービスの読み取り遅延を改善しました。
### バグ修正 {#bug-fixes-3}
- サービスパスワードをリセットする際に、パスワードポリシーに従わない動作を修正しました。
- 組織招待メールの検証を大文字小文字を区別しないようにしました。
## 2023年2月2日 {#february-2-2023}

このリリースでは、正式にサポートされたMetabase統合、主要なJavaクライアント/JDBCドライバリリース、およびSQLコンソールにおけるビューおよびマテリアライズドビューのサポートを追加しました。
### 統合の変更 {#integrations-changes-24}
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md)プラグイン: ClickHouseによって維持される公式ソリューションになりました。
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)プラグイン: [複数スレッド](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md)のサポートが追加されました。
- [Grafana](/integrations/data-visualization/grafana/index.md)プラグイン: 接続エラーの処理が改善されました。
- [Python](/integrations/language-clients/python/index.md)クライアント: 挿入操作の[ストリーミングサポート](/integrations/language-clients/python/index.md#streaming-queries)が追加されました。
- [Go](/integrations/language-clients/go/index.md)クライアント: [バグ修正](https://github.com/ClickHouse/clickhouse-go/blob/main/CHANGELOG.md): キャンセルされた接続のクローズ、接続エラーのより良い処理。
- [JS](/integrations/language-clients/js.md)クライアント: [exec/insertの重大な変更](https://github.com/ClickHouse/clickhouse-js/releases/tag/0.0.12); 戻り値の型に`query_id`を公開。
- [Java](https://github.com/ClickHouse/clickhouse-java#readme)クライアント / JDBCドライバの主要リリース
  - [重大な変更](https://github.com/ClickHouse/clickhouse-java/releases): 非推奨となったメソッド、クラス、パッケージが削除されました。
  - R2DBCドライバとファイル挿入サポートが追加されました。
### コンソールの変更 {#console-changes-25}
- SQLコンソールにビューとマテリアライズドビューのサポートを追加しました。
### パフォーマンスと信頼性 {#performance-and-reliability-4}
- 停止中/アイドル状態のインスタンスのパスワードリセットが迅速になります。
- より正確なアクティビティトラッキングを介してスケールダウンの動作が改善されました。
- SQLコンソールのCSVエクスポートがトランケートされるバグを修正しました。
- サンプルデータのアップロード失敗が断続的に発生するバグを修正しました。
## 2023年1月12日 {#january-12-2023}

このリリースでは、ClickHouseのバージョンが22.12に更新され、多くの新しいソースに対して辞書が有効化され、クエリパフォーマンスが改善されました。
### 一般的な変更 {#general-changes-3}
- 外部ClickHouse、Cassandra、MongoDB、MySQL、PostgreSQL、およびRedisを含む追加のソースに対して辞書が有効になりました。
### ClickHouse 22.12バージョンアップグレード {#clickhouse-2212-version-upgrade}
- JOINサポートがGrace Hash Joinを含むように拡張されました。
- ファイルを読むためのBinary JSON（BSON）サポートが追加されました。
- GROUP BY ALL標準SQL構文のサポートが追加されました。
- 固定精度の小数演算用の新しい数学関数が追加されました。
- 完全な変更リストについては、[22.12リリースブログ](https://clickhouse.com/blog/clickhouse-release-22-12)および[詳細な22.12変更ログ](/whats-new/cloud#clickhouse-2212-version-upgrade)を参照してください。
### コンソールの変更 {#console-changes-26}
- SQLコンソールのオートコンプリート機能が改善されました。
- デフォルトのリージョンが大陸の地域性を考慮するようになりました。
- 請求使用ページが請求およびウェブサイト単位を表示するように改善されました。
### Integrations changes {#integrations-changes-25}
- DBTリリース [v1.3.2](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md#release-132-2022-12-23)
  - delete+insertのインクリメンタル戦略に対する実験的サポートを追加
  - 新しいs3sourceマクロ
- Pythonクライアント [v0.4.8](https://github.com/ClickHouse/clickhouse-connect/blob/main/CHANGELOG.md#048-2023-01-02)
  - ファイル挿入のサポート
  - サーバーサイドクエリ [パラメータバインディング](/interfaces/cli.md/#cli-queries-with-parameters)
- Goクライアント [v2.5.0](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.5.0)
  - 圧縮のためのメモリ使用量を削減
  - サーバーサイドクエリ [パラメータバインディング](/interfaces/cli.md/#cli-queries-with-parameters)
### Reliability and performance {#reliability-and-performance-2}
- オブジェクトストア上の多数の小さなファイルを取得するクエリの読み取りパフォーマンスを改善
- 新しく立ち上げたサービスに対して、サービスが最初に起動されるバージョンに [互換性](/operations/settings/settings#compatibility) 設定を設定
### Bug fixes {#bug-fixes-4}
Advanced Scalingスライダーを使用してリソースを予約すると、すぐに効果が現れるようになりました。
## December 20, 2022 {#december-20-2022}

このリリースは、管理者のSQLコンソールへのシームレスなログイン、コールドリードの読み取りパフォーマンスの改善、ClickHouse Cloud用のMetabaseコネクタの改善を導入します。
### Console changes {#console-changes-27}
- 管理者ユーザーのためにSQLコンソールへのシームレスアクセスを有効化
- 新しい招待者のデフォルトロールを「管理者」に変更
- オンボーディング調査を追加
### Reliability and performance {#reliability-and-performance-3}
- ネットワーク障害が発生した場合に回復するために、長時間実行される挿入クエリ向けにリトライロジックを追加
- コールドリードの読み取りパフォーマンスを改善
### Integrations changes {#integrations-changes-26}
- [Metabaseプラグイン](/integrations/data-visualization/metabase-and-clickhouse.md) に待望のv0.9.1の大規模な更新がありました。これにより、最新のMetabaseバージョンと互換性があり、ClickHouse Cloudに対して徹底的なテストが行われています。
## December 6, 2022 - General Availability {#december-6-2022---general-availability}

ClickHouse Cloudは、SOC2 Type II準拠、商用ワークロードの稼働時間SLA、公開ステータスページを備えて、本番対応に準備が整いました。このリリースには、AWS Marketplace統合、ClickHouseユーザーのためのデータ探索作業台であるSQLコンソール、ClickHouse Cloudでの自己学習のためのClickHouse Academyなどの主要な新機能が含まれています。詳細についてはこの [ブログ](https://clickhouse.com/blog/clickhouse-cloud-generally-available) をご覧ください。
### Production-ready {#production-ready}
- SOC2 Type II準拠（詳細は [ブログ](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) および [Trust Center](https://trust.clickhouse.com/) にて）
- ClickHouse Cloudのための公開 [ステータスページ](https://status.clickhouse.com/)
- 商用ユースケース用の稼働時間SLA
- [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc) での利用可能性
### Major new capabilities {#major-new-capabilities}
- ClickHouseユーザーのためのデータ探索作業台であるSQLコンソールを導入
- ClickHouse Cloudでの自己学習のために [ClickHouse Academy](https://learn.clickhouse.com/visitor_class_catalog) を開始
### Pricing and metering changes {#pricing-and-metering-changes}
- 試用期間を30日間に延長
- スタータープロジェクトや開発/ステージング環境に適した固定容量の低月額キングデベロップメントサービスを導入
- ClickHouse Cloudの運用とスケーリングを改善し続ける中で、プロダクションサービスの新しい割引料金を導入
- コンピュートのメータリング時に、粒度と正確性を向上
### Integrations changes {#integrations-changes-27}
- ClickHouseのPostgres / MySQL統合エンジンのサポートを有効化
- SQLユーザー定義関数（UDF）のサポートを追加
- Kafka Connectのsinkをベータステータスに昇格
- バージョン、更新状況などの豊富なメタデータを導入して、統合UIを改善
### Console changes {#console-changes-28}

- クラウドコンソールでの多要素認証サポート
- モバイルデバイス用のクラウドコンソールナビゲーションを改善
### Documentation changes {#documentation-changes}

- ClickHouse Cloud用の専用の [ドキュメント](/cloud/overview) セクションを導入
### Bug fixes {#bug-fixes-5}
- バックアップからの復元が依存関係の解決により常に機能しなかった既知の問題に対処
## November 29, 2022 {#november-29-2022}

このリリースは、SOC2 Type II準拠を実現し、ClickHouseのバージョンを22.11に更新し、多くのClickHouseクライアントと統合を改善しています。
### General changes {#general-changes-4}

- SOC2 Type II準拠に達しました（詳細は [ブログ](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) および [Trust Center](https://trust.clickhouse.com) にて）
### Console changes {#console-changes-29}

- サービスが自動的に一時停止されたことを示す「アイドル」ステータスインジケーターを追加
### ClickHouse 22.11 version upgrade {#clickhouse-2211-version-upgrade}

- HudiおよびDeltaLakeテーブルエンジンとテーブル関数のサポートを追加
- S3に対する再帰的ディレクトリトラバーサルを改善
- 複合時間間隔構文のサポートを追加
- 挿入時の信頼性をリトライによって改善
- 変更の完全なリストについては、[詳細な22.11の変更ログ](/whats-new/cloud#clickhouse-2211-version-upgrade)を参照
### Integrations {#integrations-1}

- Pythonクライアント: v3.11サポート、挿入パフォーマンスの改善
- Goクライアント: DateTimeおよびInt64サポートの修正
- JSクライアント: 相互SSL認証のサポート
- dbt-clickhouse: DBT v1.3のサポート
### Bug fixes {#bug-fixes-6}

- アップグレード後に古いClickHouseバージョンを表示するバグを修正
- 「default」アカウントの権限変更がセッションを中断しなくなった
- 新しく作成された非管理者アカウントはデフォルトでシステムテーブルへのアクセスができなくなった
### Known issues in this release {#known-issues-in-this-release}

- バックアップからの復元が依存関係の解決により機能しない可能性があります
## November 17, 2022 {#november-17-2022}

このリリースでは、ローカルClickHouseテーブルおよびHTTPソースからの辞書のサポート、有名な地域であるムンバイ地域のサポートが導入され、クラウドコンソールのユーザーエクスペリエンスが改善されました。
### General changes {#general-changes-5}

- ローカルClickHouseテーブルおよびHTTPソースからの [辞書](/sql-reference/dictionaries/index.md) のサポートを追加
- ムンバイ [地域](/cloud/reference/supported-regions.md) のサポートを紹介
### Console changes {#console-changes-30}

- 請求書のフォーマッティングを改善
- 支払い方法を記録するためのユーザーインターフェースをスリム化
- バックアップのためのより詳細なアクティビティログを追加
- ファイルアップロード中のエラーハンドリングを改善
### Bug fixes {#bug-fixes-7}
- 一部のパーツに大きなシングルファイルが存在する場合にバックアップが失敗する可能性があるバグを修正
- アクセスリストの変更が同時に適用された場合にバックアップからの復元が成功しないバグを修正
### Known issues {#known-issues}
- バックアップからの復元が依存関係の解決により機能しない可能性があります
## November 3, 2022 {#november-3-2022}

このリリースでは、価格から読み取りおよび書き込みユニットを削除し（詳細は [価格ページ](https://clickhouse.com/pricing) を参照）、ClickHouseのバージョンを22.10に更新し、セルフサービス顧客向けの高い垂直スケーリングをサポートし、より良いデフォルトを通じて安定性を改善します。
### General changes {#general-changes-6}

- 価格モデルから読み取り/書き込みユニットを削除
### Configuration changes {#configuration-changes-2}

- `allow_suspicious_low_cardinality_types`、`allow_suspicious_fixed_string_types` および `allow_suspicious_codecs` という設定（デフォルトはfalse）は、安定性の理由によりユーザーが変更できなくなりました。
### Console changes {#console-changes-31}

- 有料の顧客に対して垂直スケーリングのセルフサービス最大を720GBメモリに増加
- バックアップからの復元ワークフローを改善して、IPアクセスリストのルールとパスワードを設定
- サービス作成ダイアログでGCPおよびAzureの待機リストを導入
- ファイルアップロード中のエラーハンドリングを改善
- 請求管理のワークフローを改善
### ClickHouse 22.10 version upgrade {#clickhouse-2210-version-upgrade}

- 多くの大きなパーツ（少なくとも10GiB）が存在する場合の「パーツが多すぎる」というしきい値を緩和することで、オブジェクトストア上のマージを改善。この結果、単一テーブルの単一パーティションでペタバイトのデータを扱うことが可能になります。
- 特定の時間しきい値を過ぎてマージできるように、`min_age_to_force_merge_seconds`設定を使ってマージの制御を改善。
- 設定をリセットするためのMySQL互換シンタックス `SET setting_name = DEFAULT` を追加。
- モートン曲線エンコード、Java整数ハッシュ、乱数生成のための関数を追加。
- 変更の完全なリストについては、[詳細な22.10の変更ログ](/whats-new/cloud#clickhouse-2210-version-upgrade)を参照。
## October 25, 2022 {#october-25-2022}

このリリースは、小さなワークロードの計算消費を大幅に削減し、計算コストを低下させ（詳細は [価格](https://clickhouse.com/pricing) ページを参照）、より良いデフォルトを通じて安定性を改善し、ClickHouse Cloudコンソールの請求および使用ビューを強化します。
### General changes {#general-changes-7}

- 最小サービスメモリアロケーションを24Gに削減
- サービスのアイドルタイムアウトを30分から5分に削減
### Configuration changes {#configuration-changes-3}

- `max_parts_in_total`を100kから10kに削減。MergeTreeテーブルの `max_parts_in_total`設定のデフォルト値は100,000から10,000に引き下げられました。この変更の理由は、多くのデータパーツが存在すると、クラウド内でのサービス起動時間が遅くなる可能性があることが観察されたためです。多くのパーツは通常、あまり意図せずに行われる非常に細かいパーティションキーの選択を示しており、避けるべきです。このデフォルトの変更は、これらのケースを早期に検出可能にします。
### Console changes {#console-changes-32}

- 試用ユーザー向け請求ビューでのクレジット使用詳細を強化
- ツールチップとヘルプテキストを改善し、使用ビューに価格ページへのリンクを追加
- IPフィルタリングのオプション切り替え時のワークフローを改善
- クラウドコンソールに再送信メール確認ボタンを追加
## October 4, 2022 - Beta {#october-4-2022---beta}

ClickHouse Cloudは2022年10月4日にパブリックベータを開始しました。詳細はこの [ブログ](https://clickhouse.com/blog/clickhouse-cloud-public-beta) をご覧ください。

ClickHouse CloudのバージョンはClickHouseコアv22.10に基づいています。互換性のある機能のリストについては、[Cloud Compatibility](/cloud/reference/cloud-compatibility.md)ガイドを参照してください。
