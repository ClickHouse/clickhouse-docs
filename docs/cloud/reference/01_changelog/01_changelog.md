---
slug: /whats-new/cloud
sidebar_label: 'Cloud changelog'
title: 'Cloud changelog'
description: 'ClickHouse Cloud changelog providing descriptions of what is new in each ClickHouse Cloud release'
doc_type: 'changelog'
keywords: ['changelog', 'release notes', 'updates', 'new features', 'cloud changes']
---

import Image from '@theme/IdealImage';
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
import prometheus from '@site/static/images/cloud/reference/june-28-prometheus.png';
import kafka_config from '@site/static/images/cloud/reference/june-13-kafka-config.png';
import fast_releases from '@site/static/images/cloud/reference/june-13-fast-releases.png';
import share_queries from '@site/static/images/cloud/reference/may-30-share-queries.png';
import query_endpoints from '@site/static/images/cloud/reference/may-17-query-endpoints.png';
import dashboards from '@site/static/images/cloud/reference/may-30-dashboards.png';
import crash_reports_collection from '@site/static/images/cloud/reference/crash-reports-collection.png';

In addition to this ClickHouse Cloud changelog, please see the [Cloud Compatibility](/whats-new/cloud-compatibility) page.

:::tip[Automatically keep up to date!]
  <a href="/docs/cloud/changelog-rss.xml">
    Subscribe to Cloud Changelog via RSS
  </a>
:::

## April 10, 2026 {#april-10-2026}

### Centralized Marketplace Billing {#centralized-marketplace-billing}

Cloud Marketplace billing now supports subscription sharing, subscription updates, and backup payment methods across AWS, Azure, and GCP:

* **Subscription Sharing:** Switch an organization from credit card billing to an existing marketplace subscription from another org — consolidating billing through one cloud marketplace subscription.
* **Update Marketplace Subscriptions:** Swap an org's marketplace subscription to one used by a different org for added flexibility.
* **Backup Payment Method:** Orgs on marketplace billing can now add a credit card as a fallback if the primary marketplace subscription is cancelled or expires.

Note: Only PAYG usage is consolidated — prepaid credits are not shared across linked orgs.

See the [billing docs](/manage/manage/billing/managing-payment-methods) for more details.

### ClickHouse Assistant RAG API {#clickhouse-assistant-rag}

The ClickHouse Assistant in the SQL Console is now powered by a new self-managed RAG (Retrieval-Augmented Generation) pipeline, delivering grounded, context-aware responses backed by the full ClickHouse documentation. Every assistant conversation in the SQL Console now benefits from improved correctness and completeness.

### clickhousectl CLI (Public Beta) {#clickhousectl-cli}

[clickhousectl](https://github.com/ClickHouse/clickhousectl) is the new official ClickHouse CLI for managing local ClickHouse installations, running local servers, and operating ClickHouse Cloud — all through one predictable interface. Install it now:

```
curl https://clickhouse.com/cli | sh
```

## April 3, 2026 {#april-3-2026}
- **Smarter auto-scaling with two-window recommender:** ClickHouse Cloud now uses a dual-lookback-window approach to vertical auto-scaling, replacing the previous single 30-hour window with a combined 3-hour "small window" and 30-hour "large window." This reduces scale-down latency from up to 30 hours to as little as 3 hours, lowering infrastructure costs for variable workloads without sacrificing scale-up responsiveness. Read the [blog post](https://clickhouse.com/blog/smarter-auto-scaling) for more details.
- **Monitoring in the Cloud console:** New overview and infrastructure dashboards provide better visibility into the behavior of ClickHouse servers. Admin users now receive email notifications for common issues when using ClickHouse Cloud. Read the [blog post](https://clickhouse.com/blog/clickhouse-cloud-new-monitoring-capabilities) for more details.
- **Compute-compute separation (warehouses):** Support for auto-idling on primary services (also referred to as parent services) is now rolling to public preview. If the feature has not been enabled for your organization, [contact support](https://clickhouse.com/support/program) for access. Once the feature moves to general access, the default behavior will be that existing primary services will have the option to turn on auto-idling and new primary services will have it enabled by default.
- **Data Catalog integration:** ClickHouse Cloud now supports Iceberg REST Catalog and Microsoft OneLake as data lake catalog integrations in the data sources UI. Once connected, the catalog appears as a database, allowing you to read Iceberg tables directly, without duplicating data.
- **Bring Your Own Cloud (BYOC) on GCP is now generally available:** ClickHouse BYOC is now GA on Google Cloud, allowing you to deploy ClickHouse services in your own GCP project, and comply with strict data residency requirements. Read the [documentation](/cloud/reference/byoc/overview) and the [blog post](https://clickhouse.com/blog/byoc-gcp-ga) for more details. You can [contact us](https://clickhouse.com/cloud/bring-your-own-cloud) to request access.
- **Billing notifications for prepaid credits and payment method changes:** ClickHouse Cloud now sends notifications when prepaid credits are added to your organization following a committed contract, or when a payment method is updated (credit card or marketplace subscription). Notifications are enabled by default for UI and email, and can be configured to also send to Slack.

## March 20, 2026 {#march-20-2026}
- **Custom date range for Usage Breakdown:** You can now view your usage costs across all billing dimensions on the usage breakdown screen using a custom date range.
  Select a start and end date (inclusive) to filter costs by a specific period and download the results as a CSV.
  The date range is limited to a maximum of 31 days.

## February 20, 2026 {#february-20-2026}
- **ClickPipes:** Reverse private endpoints in an inactive state will now be automatically removed after a defined grace period. This ensures unused or misconfigured endpoints are not persisted indefinitely in the backend. See the automatic clean up [documentation](/integrations/clickpipes/aws-privatelink#automatic-cleanup) for more details.

## February 13, 2026 {#february-13-2026}
- [BigQuery Connector](/integrations/clickpipes/bigquery/overview) is now in Private Preview. Read this [blogpost](https://clickhouse.com/blog/bigquery-clickpipe-private-preview) for more details and join the [waitlist](https://clickhouse.com/cloud/clickpipes/bigquery-connector) for access.
- We are pleased to announce support for PCI deployments for Google Cloud. Regions supported: 
  - GCP europe-west4 (Netherlands)
  - GCP us-central1 (Iowa)
  - GCP us-east1 (South Carolina)
- Crash report collection preferences can now be configured at the organization level. This setting was previously available only at the service level. When disabled at the organization level, all existing and future services will be opted out automatically.

<Image img={crash_reports_collection} size="md" alt="Crash reports collection" />

## January 23, 2026 {#january-23-2026}
- ClickPipes is now available in AWS `eu-west-1`. For new ClickHouse Cloud services created from January 20 in that region, the matching region will be used for ClickPipes. For older services, ClickPipes defaults to `eu-central-1`. See the [documentation](/integrations/clickpipes#list-of-static-ips) for more details.

## January 16, 2026 {#january-16-2026}
- **Service-level usage cost filtering via API:** Our API now supports filtering your organization's usage costs by specific service tags, making it easier to analyze spend at a more granular level.
- **Data Catalog integration:** You can now connect an external data catalog as a data source. ClickHouse Cloud supports AWS Glue and Unity Catalog (with more coming soon). Once connected, the catalog appears as a database, allowing you to read Iceberg tables directly—without duplicating data. For access, contact support to request access.
- **ClickPipes:**
  - The MongoDB connector has been promoted to Public Beta, and is now available to new and existing ClickHouse Cloud customers, in all service tiers. Read the [blogpost](https://clickhouse.com/blog/mongodb-cdc-connector-clickpipes-beta) for an overview of new features and head to the [documentation](/integrations/clickpipes/mongodb) to get started.
  - The [S3 ClickPipe](/integrations/clickpipes/object-storage/s3/overview) is now compatible with OVH Object Storage, the S3 API-compatible object storage service in OVHcloud.

## December 19, 2025 {#december-19-2025}

- AWS ap-south-1 now supports launching PCI compliant services.
- **Unified user identity private preview**
  Customers interested in managing database users from the console may enable a new authentication method for SQL console.
  This allows customers to try out the new authentication method while we continue work to bring database user management to the console.
- **Unordered mode now available in S3 ClickPipes**:
  Customers can now ingest data from Amazon S3 into ClickHouse Cloud in any order for even-driven analytics.
  Files are no longer required to be in lexicographical order for consumption. More details available in the announcement [blog](https://clickhouse.com/blog/clickpipes-s3-unordered-mode).
- The Fivetran connector has recently moved to beta. If you're using Fivetran and want to set up ClickHouse as a destination, check out these [docs](https://fivetran.com/docs/destinations/clickhouse/setup-guide).

## December 12, 2025 {#december-12-2025}

- **SAML SSO self-serve setup**

  Enterprise customers may now complete SAML setup in the console without a support ticket.
  Additionally, SAML customers may set a default role that will be assigned to new users added via their identity provider and set custom session timeout settings.
  For more information, please review our [docs](/cloud/security/saml-setup).
- **Maximum replica size and scaling limits in Azure**  

  Customers can now set the maximum replica size as 356 GiB in all Azure regions, except `eastus2` where the available maximum replica size is 120 GiB.

## November 21, 2025 {#november-21-2025}

- ClickHouse Cloud is now available in **AWS Israel (Tel Aviv) — il-central-1**
- Improved the marketplace onboarding experience for setting up ClickHouse organizations to bill to marketplace pay-as-you-go subscriptions or private offers.

## November 14, 2025 {#november-14-2025}
- We're excited to announce that **ClickHouse Cloud** is now available in **two additional public regions**:
  - **GCP Japan (asia-northeast1)**
  - **AWS Seoul (Asia Pacific, ap-northeast-2)** — now also supported in **ClickPipes**

  These regions were previously available as **private regions** and are now **open to all users**.
- Terraform and API now support adding tags to services and filtering services by tags.

## November 7, 2025 {#november-7-2025}

- ClickHouse Cloud console now supports configuring replica sizes in increments of 1 vCPU, 4 GiB from the cloud console.
  These options are available both when setting up a new service as well as when setting minimum and maximum replica sizes on the settings page.
- Custom hardware profiles (available on the Enterprise tier) now support idling.
- ClickHouse Cloud now offers a simplified purchasing experience through AWS Marketplace, with separate options for [pay-as-you-go](https://aws.amazon.com/marketplace/pp/prodview-p4gwofrqpkltu?sr=0-2&ref_=beagle&applicationId=AWSMPContessa) and [committed spend contracts](https://aws.amazon.com/marketplace/pp/prodview-4qyeihstyym2s?sr=0-3&ref_=beagle&applicationId=AWSMPContessa).
- Alerting is now available for ClickStack users in ClickHouse Cloud.
  You can now create and manage alerts directly in the HyperDX UI, across logs, metrics, and traces with no extra setup, no extra infra or service, and no config. Alerts integrate with Slack, PagerDuty, and more.
  For more information see the [alerting documentation](/use-cases/observability/clickstack/alerts).

## October 17, 2025 {#october-17-2025}

- **Service Monitoring - Resource Utilization Dashboard**  
  The CPU utilization and memory utilization metrics display will change to show the maximum utilization metric during a particular time period to better surface instances of underprovisionment, from average.
  In addition, the CPU utilization metric will show a kubernetes-level CPU utilization metric which more closely resembles the metric used by ClickHouse Cloud's autoscaler. 
- **External Buckets**  
  ClickHouse Cloud now lets you export backups directly to your own cloud service provider account.
  Connect your external storage bucket - AWS S3, Google Cloud Storage, or Azure Blob Storage - and take control of your backup management.

## August 29, 2025 {#august-29-2025}

- [ClickHouse Cloud Azure Private Link](/cloud/security/azure-privatelink) has switched from using Resource GUID to Resource ID filters for resource identification. You can still use the legacy Resource GUID, which is backward compatible, but we recommend switching to Resource ID filters. For migration details see the [docs](/cloud/security/azure-privatelink#obtaining-private-endpoint-resourceid) for Azure Private Link.

## August 22, 2025 {#august-22-2025}

- **ClickHouse Connector for AWS Glue**  
  You can now use the official [ClickHouse Connector for AWS Glue](/integrations/glue) that is available from the [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-eqvmuopqzdg7s). Utilizes AWS Glue's Apache
  Spark-based serverless engine for extracting, transforming and loading data integration between ClickHouse and other data sources. Get
  started by following along with the announcement [blogpost](http://clickhouse.com/blog/clickhouse-connector-aws-glue) for how to create tables, write and read data between ClickHouse and Spark.
- **Change to the minimum number of replicas in a service**  
  Services which have been scaled up can now be [scaled back down](/manage/scaling) to use a single replica (previously the minimum was 2 replicas). Note: single replica services have reduced availability and are not recommended for production usage.
- ClickHouse Cloud will begin to send notifications related to service scaling and service version upgrades, by default for administrator roles. You can adjust their notification preferences in their notification settings.

## August 13, 2025 {#august-13-2025}

- **ClickPipes for MongoDB CDC now in Private Preview**
  You can now use ClickPipes to replicate data from MongoDB into ClickHouse Cloud in a few clicks, enabling
  real-time analytics without the need for external ETL tools. The connector supports continuous
  replication as well as one-time migrations, and is compatible with MongoDB Atlas and self-hosted MongoDB
  deployments. Read the [blogpost](https://clickhouse.com/blog/mongodb-cdc-clickhouse-preview) for an overview of the MongoDB CDC connector and [sign up for early access here](https://clickhouse.com/cloud/clickpipes/mongodb-cdc-connector)! 
 
## August 8, 2025 {#august-08-2025}

- **Notifications**: You will now receive a UI notification when their service starts upgrading to a new ClickHouse version. Additional Email and Slack notifications can be added via the notification center. 
- **ClickPipes**: Azure Blob Storage (ABS) ClickPipes support was added to the ClickHouse Terraform provider. See the provider documentation for an example of how to programmatically create an ABS ClickPipe.
  - [Bug fix] Object storage ClickPipes writing to a destination table using the Null engine now report "Total records" and "Data ingested" metrics in the UI.
  - [Bug fix] The "Time period" selector for metrics in the UI defaulted to "24 hours" regardless of the selected time period. This has now been fixed, and the UI correctly updates the charts for the selected time period.
- **Cross-region private link (AWS)** is now Generally Available. Please refer to the [documentation](/manage/security/aws-privatelink) for the list of supported regions.

## July 31, 2025 {#july-31-2025}

**Vertical scaling for ClickPipes now available**

[Vertical scaling is now available for streaming ClickPipes](https://clickhouse.com/blog/clickpipes-flexible-scaling-monitoring). 
This feature allows you to control the size of each replica, in addition to the 
number of replicas (horizontal scaling). The details page for each ClickPipe now
also includes per-replica CPU and memory utilization, which helps you better 
understand your workloads and plan re-sizing operations with confidence.

## July 24, 2025 {#july-24-2025}

**ClickPipes for MySQL CDC now in public beta**

The MySQL CDC connector in ClickPipes is now widely available in public beta. With just a few clicks, 
you can start replicating your MySQL (or MariaDB) data directly into ClickHouse Cloud in real-time,
with no external dependencies. Read the [blogpost](https://clickhouse.com/blog/mysql-cdc-connector-clickpipes-beta)
for an overview of the connector and follow the [quickstart](https://clickhouse.com/docs/integrations/clickpipes/mysql)
to get up and running.

## July 11, 2025 {#june-11-2025}

- New services now store database and table metadata in a central **SharedCatalog**,
  a new model for coordination and object lifecycles which enables:
  - **Cloud-scale DDL**, even under high concurrency
  - **Resilient deletion and new DDL operations**
  - **Fast spin-up and wake-ups** as stateless nodes now launch with no disk dependencies
  - **Stateless compute across both native and open formats**, including Iceberg and Delta Lake
  
  Read more about SharedCatalog in our [blog](https://clickhouse.com/blog/clickhouse-cloud-stateless-compute)

- We now support the ability to launch HIPAA compliant services in GCP `europe-west4`

## June 27, 2025 {#june-27-2025}

- We now officially support a Terraform provider for managing database privileges
  which is also compatible with self-managed deployments. Please refer to the
  [blog](https://clickhouse.com/blog/new-terraform-provider-manage-clickhouse-database-users-roles-and-privileges-with-code)
  and our [docs](https://registry.terraform.io/providers/ClickHouse/clickhousedbops/latest/docs)
  for more information.
- Enterprise tier services can now enlist in the [slow release channel](/manage/updates/#slow-release-channel-deferred-upgrades) to defer 
  upgrades by two weeks after the regular release to permit additional time for 
  testing.

## June 13, 2025 {#june-13-2025}

- We're excited to announce that ClickHouse Cloud Dashboards are now generally available. Dashboards allow you to visualize queries on dashboards, interact with data via filters and query parameters, and manage sharing.
- API key IP filters: we are introducing an additional layer of protection for your interactions with ClickHouse Cloud. When generating an API key, you may setup an IP allow list to limit where the API key may be used.  Please refer to the [documentation](https://clickhouse.com/docs/cloud/security/setting-ip-filters) for details. 

## May 30, 2025 {#may-30-2025}

- We're excited to announce general availability of **ClickPipes for Postgres CDC**
  in ClickHouse Cloud. With just a few clicks, you can now replicate your Postgres
  databases and unlock blazing-fast, real-time analytics. The connector delivers 
  faster data synchronization, latency as low as a few seconds, automatic schema changes,
  fully secure connectivity, and more. Refer to the 
  [blog](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-ga) for 
  more information. To get started, refer to the instructions [here](https://clickhouse.com/docs/integrations/clickpipes/postgres).

- Introduced new improvements to the SQL console dashboards:
  - Sharing: You can share your dashboard with your team members. Four levels of access are supported, that can be adjusted both globally and on a per-user basis:
    - _Write access_: Add/edit visualizations, refresh settings, interact with dashboards via filters.
    - _Owner_: Share a dashboard, delete a dashboard, and all other permissions of a user with "write access".
    - _Read-only access_: View and interact with dashboard via filters
    - _No access_: Cannot view a dashboard
  - For existing dashboards that have already been created, Organization Administrators can assign existing dashboards to themselves as owners.
  - You can now add a table or chart from the SQL console to a dashboard from the query view.

<Image img={dashboards} size="md" alt="Dashboards improvements" border />

- We are enlisting preview participants for [Distributed cache](https://clickhouse.com/cloud/distributed-cache-waitlist) 
  for AWS and GCP. Read more in the [blog](https://clickhouse.com/blog/building-a-distributed-cache-for-s3).

## May 16, 2025 {#may-16-2025}

- Introduced the Resource Utilization Dashboard which provides a view of 
  resources being used by a service in ClickHouse Cloud. The following metrics 
  are scraped from system tables, and displayed on this dashboard:
  * Memory & CPU: Graphs for `CGroupMemoryTotal` (Allocated Memory), `CGroupMaxCPU` (allocated CPU),
    `MemoryResident` (memory used), and `ProfileEvent_OSCPUVirtualTimeMicroseconds` (CPU used)
  * Data Transfer: Graphs showing data ingress and egress from ClickHouse Cloud. Learn more [here](/cloud/manage/network-data-transfer).
- We're excited to announce the launch of our new ClickHouse Cloud Prometheus/Grafana mix-in, 
  built to simplify monitoring for your ClickHouse Cloud services.
  This mix-in uses our Prometheus-compatible API endpoint to seamlessly integrate
  ClickHouse metrics into your existing Prometheus and Grafana setup. It includes
  a pre-configured dashboard that gives you real-time visibility into the health 
  and performance of your services. Refer to the launch [blog](https://clickhouse.com/blog/monitor-with-new-prometheus-grafana-mix-in) to read more.

## April 18, 2025 {#april-18-2025}

- Introduced a new **Member** organization level role and two new service level 
  roles: **Service Admin** and **Service Read Only**.
  **Member** is an organization level role that is assigned to SAML SSO users by 
  default and provides only sign-in and profile update capabilities. **Service Admin** 
  and **Service Read Only** roles for one or more services can be assigned to users 
  with **Member**, **Developer**, or **Billing Admin** roles. For more information 
  see ["Access control in ClickHouse Cloud"](https://clickhouse.com/docs/cloud/security/cloud-access-management/overview)
- ClickHouse Cloud now offers **HIPAA** and **PCI** services in the following regions
  for **Enterprise** customers: AWS eu-central-1, AWS eu-west-2, AWS us-east-2.
- Introduced **user facing notifications for ClickPipes**. This feature sends 
  automatic alerts for ClickPipes failures via email, ClickHouse Cloud UI, and 
  Slack. Notifications via email and UI are enabled by default and can be 
  configured per pipe. For **Postgres CDC ClickPipes**, alerts also cover 
  replication slot threshold (configurable in the **Settings** tab), specific error
  types, and self-serve steps to resolve failures.
- **MySQL CDC private preview** is now open. This lets customers replicate MySQL 
  databases to ClickHouse Cloud in a few clicks, enabling fast analytics and 
  removing the need for external ETL tools. The connector supports both continuous
  replication and one-time migrations, whether MySQL is on the cloud (RDS, 
  Aurora, Cloud SQL, Azure, etc.) or on-premises. You can sign up to the private
  preview by [following this link](https://clickhouse.com/cloud/clickpipes/mysql-cdc-connector).
- Introduced **AWS PrivateLink for ClickPipes**. You can use AWS PrivateLink to 
  establish secure connectivity between VPCs, AWS services, your on-premises 
  systems, and ClickHouse Cloud. This can be done without exposing traffic to 
  the public internet while moving data from sources like Postgres, MySQL, and 
  MSK on AWS. It also supports cross-region access through VPC service endpoints.
  PrivateLink connectivity set-up is now [fully self-serve](https://clickhouse.com/docs/integrations/clickpipes/aws-privatelink)
  through ClickPipes.

## April 4, 2025 {#april-4-2025}

- Slack notifications for ClickHouse Cloud: ClickHouse Cloud now supports Slack notifications for billing, scaling, and ClickPipes events, in addition to in-console and email notifications. These notifications are sent via the ClickHouse Cloud Slack application. Organization admins can configure these notifications via the notification center by specifying slack channels to which notifications should be sent.
- Users running Production and Development services will now see ClickPipes and data transfer usage price on their bills.
  
## March 21, 2025 {#march-21-2025}

- Cross-region Private Link connectivity on AWS is now in Beta. Please refer to
  ClickHouse Cloud private link [docs](/manage/security/aws-privatelink) for 
  details of how to set up and list of supported regions.
- The maximum replica size available for services on AWS is now set to 236 GiB RAM. 
  This allows for efficient utilization, while ensuring we have resources 
  allocated to background processes.

## March 7, 2025 {#march-7-2025}

- New `UsageCost` API endpoint: The API specification now supports a new endpoint
  for retrieving usage information. This is an organization endpoint and usage 
  costs can be queried for a maximum of 31 days. The metrics that can be 
  retrieved include Storage, Compute, Data Transfer and ClickPipes. Please refer
  to the [documentation](https://clickhouse.com/docs/cloud/manage/api/usageCost-api-reference) for details.
- Terraform provider [v2.1.0](https://registry.terraform.io/providers/ClickHouse/clickhouse/2.1.0/docs/resources/service#nestedatt--endpoints_configuration) release supports enabling the MySQL endpoint.

## February 21, 2025 {#february-21-2025}

### ClickHouse Bring Your Own Cloud (BYOC) for AWS is now generally available {#clickhouse-byoc-for-aws-ga}

In this deployment model, data plane components (compute, storage, backups, logs, metrics)
run in the Customer VPC, while the control plane (web access, APIs, and billing)
remains within the ClickHouse VPC. This setup is ideal for large workloads that
need to comply with strict data residency requirements by ensuring all data stays
within a secure customer environment.

- For more details, you can refer to the [documentation](/cloud/reference/byoc/overview) for BYOC
  or read our [announcement blog post](https://clickhouse.com/blog/announcing-general-availability-of-clickhouse-bring-your-own-cloud-on-aws).
- [Contact us](https://clickhouse.com/cloud/bring-your-own-cloud) to request access.

### Postgres CDC connector for ClickPipes {#postgres-cdc-connector-for-clickpipes}

Postgres CDC connector for ClickPipes allows you to seamlessly replicate your Postgres databases to ClickHouse Cloud.

- To get started, refer to the [documentation](https://clickhouse.com/docs/integrations/clickpipes/postgres) for ClickPipes Postgres CDC connector.
- For more information on customer use cases and features, please refer to the [landing page](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector) and the [launch blog](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-public-beta).

### PCI compliance for ClickHouse Cloud on AWS {#pci-compliance-for-clickhouse-cloud-on-aws}

ClickHouse Cloud now supports **PCI-compliant services** for **Enterprise tier**
customers in **us-east-1** and **us-west-2** regions. Users who wish to launch
a service in a PCI-compliant environment can contact [support](https://clickhouse.com/support/program)
for assistance.

### Transparent Data Encryption and Customer Managed Encryption Keys on Google Cloud Platform {#tde-and-cmek-on-gcp}

Support for **Transparent Data Encryption (TDE)** and **Customer Managed
Encryption Keys (CMEK)** is now available for ClickHouse Cloud on **Google Cloud Platform (GCP)**.

- Please refer to the [documentation](https://clickhouse.com/docs/cloud/security/cmek#transparent-data-encryption-tde) of these features for more information.

### AWS Middle East (UAE) availability {#aws-middle-east-uae-availability}

New region support is added for ClickHouse Cloud, which is now available in the
**AWS Middle East (UAE) me-central-1** region.

### ClickHouse Cloud guardrails {#clickhouse-cloud-guardrails}

To promote best practices and ensure stable use of ClickHouse Cloud, we are
introducing guardrails for the number of tables, databases, partitions and parts
in use.

- Refer to the [usage limits](https://clickhouse.com/docs/cloud/bestpractices/usage-limits)
  section of the documentation for details.
- If your service is already above these limits, we will permit a 10% increase.
  Please contact [support](https://clickhouse.com/support/program) if you have any questions.

## January 27, 2025 {#january-27-2025}

### Changes to ClickHouse Cloud tiers {#changes-to-clickhouse-cloud-tiers}

We are dedicated to adapting our products to meet the ever-changing requirements of our customers. Since its introduction in GA over the past two years, ClickHouse Cloud has evolved substantially, and we've gained invaluable insights into how our customers leverage our cloud offerings.

We are introducing new features to optimize the sizing and cost-efficiency of ClickHouse Cloud services for your workloads. These include **compute-compute separation**, high-performance machine types, and **single-replica services**. We are also evolving automatic scaling and managed upgrades to execute in a more seamless and reactive fashion.

We are adding a **new Enterprise tier** to serve the needs of the most demanding customers and workloads, with focus on industry-specific security and compliance features, even more controls over underlying hardware and upgrades, and advanced disaster recovery features.

To support these changes, we are restructuring our current **Development** and **Production** tiers to more closely match how our evolving customer base is using our offerings. We are introducing the **Basic** tier, oriented toward users that are testing out new ideas and projects, and the **Scale** tier, matching users working with production workloads and data at scale.

You can read about these and other functional changes in this [blog](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings). Existing customers will need to take action to select a [new plan](https://clickhouse.com/pricing). Customer-facing communication was sent via email to organization administrators.

### Warehouses: Compute-compute separation (GA) {#warehouses-compute-compute-separation-ga}

Compute-compute separation (also known as "Warehouses") is Generally Available; please refer to [blog](https://clickhouse.com/blog/introducing-warehouses-compute-compute-separation-in-clickhouse-cloud) for more details and the [documentation](/cloud/reference/warehouses).

### Single-replica services {#single-replica-services}

We are introducing the concept of a "single-replica service", both as a standalone offering and within warehouses. As a standalone offering, single-replica services are size limited and intended to be used for small test workloads. Within warehouses, single-replica services can be deployed at larger sizes, and utilized for workloads not requiring high availability at scale, such as restartable ETL jobs.

### Vertical auto-scaling improvements {#vertical-auto-scaling-improvements}

We are introducing a new vertical scaling mechanism for compute replicas, which we call "Make Before Break" (MBB). This approach adds one or more replicas of the new size before removing the old replicas, preventing any loss of capacity during scaling operations. By eliminating the gap between removing existing replicas and adding new ones, MBB creates a more seamless and less disruptive scaling process. It is especially beneficial in scale-up scenarios, where high resource utilization triggers the need for additional capacity, since removing replicas prematurely would only exacerbate the resource constraints.

### Horizontal scaling (GA) {#horizontal-scaling-ga}

Horizontal scaling is now Generally Available. You can add additional replicas to scale out their service through the APIs and the cloud console. Please refer to the [documentation](/cloud/features/autoscaling/horizontal#manual-horizontal-scaling) for information.

### Configurable backups {#configurable-backups}

We now support the ability for customers to export backups to their own cloud account; please refer to the [documentation](/cloud/manage/backups/configurable-backups) for additional information.

### Managed upgrade improvements {#managed-upgrade-improvements}

Safe managed upgrades deliver significant value to our users by allowing them to stay current with the database as it moves forward to add features. With this rollout, we applied the "make before break" (or MBB) approach to upgrades, further reducing impact to running workloads.

### HIPAA support {#hipaa-support}

We now support HIPAA in compliant regions, including AWS `us-east-1`, `us-west-2` and GCP `us-central1`, `us-east1`. Customers wishing to onboard must sign a Business Associate Agreement (BAA) and deploy to the compliant version of the region. For more information on HIPAA, please refer to the [documentation](/cloud/security/compliance-overview).

### Scheduled upgrades {#scheduled-upgrades}

You can schedule upgrades for your services. This feature is supported for Enterprise tier services only. For more information on Scheduled upgrades, please refer to the [documentation](/manage/updates).

### Language client support for complex types {#language-client-support-for-complex-types}

[Golang](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.30.1), [Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.11), and [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.1) clients added support for Dynamic, Variant, and JSON types.

### DBT support for refreshable materialized views {#dbt-support-for-refreshable-materialized-views}

DBT now [supports Refreshable Materialized Views](https://github.com/ClickHouse/dbt-clickhouse/releases/tag/v1.8.7) in the `1.8.7` release.

### JWT token support {#jwt-token-support}

Support has been added for JWT-based authentication in the JDBC driver v2, clickhouse-java, [Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.12), and[ NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.0) clients.

JDBC / Java will be in[ 0.8.0](https://github.com/ClickHouse/clickhouse-java/releases/tag/v0.8.0) when it's released - ETA pending.

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

<Image img={add_marketplace} size="md" alt="ClickHouse Cloud interface showing how to add a marketplace subscription to an existing organization" border />

### Force OpenAPI key expiration {#force-openapi-key-expiration}

It is now possible to restrict the expiry options of API keys so you don't create unexpired OpenAPI keys. Please contact the ClickHouse Cloud Support team to enable these restrictions for your organization.

### Custom emails for notifications {#custom-emails-for-notifications}

Org Admins can now add more email addresses to a specific notification as additional recipients. This is useful in case you want to send notifications to an alias or to other users within your organization who might not be users of ClickHouse Cloud. To configure this, go to the Notification Settings from the cloud console and edit the email addresses that you want to receive the email notifications. 

## December 6, 2024 {#december-6-2024}

### BYOC (beta) {#byoc-beta}

Bring Your Own Cloud for AWS is now available in Beta. This deployment model allows you to deploy and run ClickHouse Cloud in your own AWS account. We support deployments in 11+ AWS regions, with more coming soon. Please [contact support](https://clickhouse.com/support/program) for access. Note that this deployment is reserved for large-scale deployments.

### Postgres Change Data Capture (CDC) connector in ClickPipes {#postgres-change-data-capture-cdc-connector-in-clickpipes}

This turnkey integration enables customers to replicate their Postgres databases to ClickHouse Cloud in just a few clicks and leverage ClickHouse for blazing-fast analytics. You can use this connector for both continuous replication and one-time migrations from Postgres.

### Dashboards (beta) {#dashboards-beta}

This week, we're excited to announce the Beta launch of Dashboards in ClickHouse Cloud. With Dashboards, you can turn saved queries into visualizations, organize visualizations onto dashboards, and interact with dashboards using query parameters. To get started, follow the [dashboards documentation](/cloud/manage/dashboards).

<Image img={beta_dashboards} size="lg" alt="ClickHouse Cloud interface showing the new Dashboards Beta feature with visualizations" border />

### Query API endpoints (GA) {#query-api-endpoints-ga}

We are excited to announce the GA release of Query API Endpoints in ClickHouse Cloud. Query API Endpoints allow you to spin up RESTful API endpoints for saved queries in just a couple of clicks and begin consuming data in your application without wrangling language clients or authentication complexity. Since the initial launch, we have shipped a number of improvements, including:

* Reducing endpoint latency, especially for cold-starts
* Increased endpoint RBAC controls
* Configurable CORS-allowed domains
* Result streaming
* Support for all ClickHouse-compatible output formats

In addition to these improvements, we are excited to announce generic query API endpoints that, leveraging our existing framework, allow you to execute arbitrary SQL queries against your ClickHouse Cloud services. Generic endpoints can be enabled and configured from the service settings page.

To get started, follow the [Query API Endpoints documentation](/cloud/get-started/query-endpoints).

<Image img={api_endpoints} size="lg" alt="ClickHouse Cloud interface showing the API Endpoints configuration with various settings" border />

### Native JSON support (Beta) {#native-json-support-beta}

We are launching Beta for our native JSON support in ClickHouse Cloud. To get started, please get in touch with support[ to enable your cloud service](/cloud/support).

### Vector search using vector similarity indexes (early access) {#vector-search-using-vector-similarity-indexes-early-access}

We are announcing vector similarity indexes for approximate vector search in early access.

ClickHouse already offers robust support for vector-based use cases, with a wide range of [distance functions](https://clickhouse.com/blog/reinvent-2024-product-announcements#vector-search-using-vector-similarity-indexes-early-access) and the ability to perform linear scans. In addition, more recently, we added an experimental[ approximate vector search](/engines/table-engines/mergetree-family/annindexes) approach powered by the [usearch](https://github.com/unum-cloud/usearch) library and the Hierarchical Navigable Small Worlds (HNSW) approximate nearest neighbor search algorithm.

To get started, [please sign up for the early access waitlist](https://clickhouse.com/cloud/vector-search-index-waitlist).

### ClickHouse-connect (Python) and ClickHouse Kafka Connect users {#clickhouse-connect-python-and-clickhouse-kafka-connect-users}

Notification emails went out to customers who had experienced issues where the clients could encounter a `MEMORY_LIMIT_EXCEEDED` exception.

Please upgrade to:
- Kafka-Connect: > 1.2.5
- ClickHouse-Connect (Java): > 0.8.6

### ClickPipes now supports cross-VPC resource access on AWS {#clickpipes-now-supports-cross-vpc-resource-access-on-aws}

You can now grant uni-directional access to a specific data source like AWS MSK. With Cross-VPC resource access with AWS PrivateLink and VPC Lattice, you can share individual resources across VPC and account boundaries, or even from on-premise networks without compromising on privacy and security when going over a public network. To get started and set up a resource share, you can read the [announcement post](https://clickhouse.com/blog/clickpipes-crossvpc-resource-endpoints?utm_medium=web&utm_source=changelog).

<Image img={cross_vpc} size="lg" alt="Diagram showing the Cross-VPC resource access architecture for ClickPipes connecting to AWS MSK" border />

### ClickPipes now supports IAM for AWS MSK {#clickpipes-now-supports-iam-for-aws-msk}

You can now use IAM authentication to connect to an MSK broker with AWS MSK ClickPipes. To get started, review our [documentation](/integrations/clickpipes/kafka/best-practices/#iam).

### Maximum replica size for new services on AWS {#maximum-replica-size-for-new-services-on-aws}

From now on, any new services created on AWS will allow a maximum available replica size of 236 GiB.

## November 22, 2024 {#november-22-2024}

### Built-in advanced observability dashboard for ClickHouse Cloud {#built-in-advanced-observability-dashboard-for-clickhouse-cloud}

Previously, the advanced observability dashboard that allows you to monitor ClickHouse server metrics and hardware resource utilization was only available in open-source ClickHouse. We are happy to announce that this feature is now available in the ClickHouse Cloud console.

This dashboard allows you to view queries based on the [system.dashboards](/operations/system-tables/dashboards) table in an all-in-one UI. Visit **Monitoring > Service Health** page to start using the advanced observability dashboard today.

<Image img={nov_22} size="lg" alt="ClickHouse Cloud advanced observability dashboard showing server metrics and resource utilization" border />

### AI-powered SQL autocomplete {#ai-powered-sql-autocomplete}

We've improved autocomplete significantly, allowing you to get in-line SQL completions as you write your queries with the new AI Copilot.  This feature can be enabled by toggling the **"Enable Inline Code Completion"** setting for any ClickHouse Cloud service.

<Image img={copilot} size="lg" alt="Animation showing the AI Copilot providing SQL autocompletion suggestions as a user types" border />

### New "billing" role {#new-billing-role}

You can now assign users in your organization to a new **Billing** role that allows them to view and manage billing information without giving them the ability to configure or manage services. Simply invite a new user or edit an existing user's role to assign the **Billing** role.

## November 8, 2024 {#november-8-2024}

### Customer Notifications in ClickHouse Cloud {#customer-notifications-in-clickhouse-cloud}

ClickHouse Cloud now provides in-console and email notifications for several billing and scaling events. Customers can configure these notifications via the cloud console notification center to only appear on the UI, receive emails, or both. You can configure the category and severity of the notifications you receive at the service level.

In future, we will add notifications for other events, as well as additional ways to receive the notifications.

Please see the [ClickHouse docs](/cloud/notifications) to learn more about how to enable notifications for your service.

<Image img={notifications} size="lg" alt="ClickHouse Cloud notification center interface showing configuration options for different notification types" border />

<br />

## October 4, 2024 {#october-4-2024}

### ClickHouse Cloud now offers HIPAA-ready services in Beta for GCP {#clickhouse-cloud-now-offers-hipaa-ready-services-in-beta-for-gcp}

Customers looking for increased security for protected health information (PHI) can now onboard to ClickHouse Cloud in [Google Cloud Platform (GCP)](https://cloud.google.com/). ClickHouse has implemented administrative, physical and technical safeguards prescribed by the [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html) and now has configurable security settings that can be implemented, depending on your specific use case and workload. For more information on available security settings, please review our [Security features page](/cloud/security).

Services are available in GCP `us-central-1` to customers with the **Dedicated** service type and require a Business Associate Agreement (BAA). Contact [sales](mailto:sales@clickhouse.com) or [support](https://clickhouse.com/support/program) to request access to this feature or join the wait list for additional GCP, AWS, and Azure regions.

### Compute-compute separation is now in private preview for GCP and Azure {#compute-compute-separation-is-now-in-private-preview-for-gcp-and-azure}

We recently announced the Private Preview for Compute-Compute Separation for AWS. We're happy to announce that it is now available for GCP and Azure.

Compute-compute separation allows you to designate specific services as read-write or read-only services, allowing you to design the optimal compute configuration for your application to optimize cost and performance. Please [read the docs](/cloud/reference/warehouses) for more details.

### Self-service MFA recovery codes {#self-service-mfa-recovery-codes}

Customers using multi-factor authentication can now obtain recovery codes that can be used in the event of a lost phone or accidentally deleted token. Customers enrolling in MFA for the first time will be provided the code on set up. Customers with existing MFA can obtain a recovery code by removing their existing MFA token and adding a new one.

### ClickPipes update: custom certificates, latency insights, and more. {#clickpipes-update-custom-certificates-latency-insights-and-more}

We're excited to share the latest updates for ClickPipes, the easiest way to ingest data into your ClickHouse service. These new features are designed to enhance your control over data ingestion and provide greater visibility into performance metrics.

*Custom Authentication Certificates for Kafka*

ClickPipes for Kafka now supports custom authentication certificates for Kafka brokers using SASL & public SSL/TLS. You can easily upload your own certificate in the SSL Certificate section during ClickPipe setup, ensuring a more secure connection to Kafka.

*Introducing Latency Metrics for Kafka and Kinesis*

Performance visibility is crucial. ClickPipes now features a latency graph, giving you insight into the time between message production (whether from a Kafka Topic or a Kinesis Stream) to ingestion in ClickHouse Cloud. With this new metric, you can keep a closer eye on the performance of your data pipelines and optimize accordingly.

<Image img={latency_insights} size="lg" alt="ClickPipes interface showing latency metrics graph for data ingestion performance" border />

<br />

*Scaling Controls for Kafka and Kinesis (Private Beta)*

High throughput can demand extra resources to meet your data volume and latency needs. We're introducing horizontal scaling for ClickPipes, available directly through our cloud console. This feature is currently in private beta, allowing you to scale resources more effectively based on your requirements. Please contact [support](https://clickhouse.com/support/program) to join the beta.

*Raw Message Ingestion for Kafka and Kinesis*

It is now possible to  ingest an entire Kafka or Kinesis message without parsing it. ClickPipes now offers support for a `_raw_message` [virtual column](/integrations/clickpipes/kafka/reference/#kafka-virtual-columns), allowing users to map the full message into a single String column. This gives you the flexibility to work with raw data as needed.

## August 29, 2024 {#august-29-2024}

### New Terraform provider version - v1.0.0 {#new-terraform-provider-version---v100}

Terraform allows you to control your ClickHouse Cloud services programmatically, then store your configuration as code. Our Terraform provider has almost 200,000 downloads and is now officially v1.0.0. This new version includes improvements such as better retry logic and a new resource to attach private endpoints to your ClickHouse Cloud service. You can download the [Terraform provider here](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest) and view the [full changelog here](https://github.com/ClickHouse/terraform-provider-clickhouse/releases/tag/v1.0.0).

### 2024 SOC 2 Type II report and updated ISO 27001 certificate {#2024-soc-2-type-ii-report-and-updated-iso-27001-certificate}

We are proud to announce the availability of our 2024 SOC 2 Type II report and updated ISO 27001 certificate, both of which include our recently launched services on Azure as well as continued coverage of services in AWS and GCP.

Our SOC 2 Type II demonstrates our ongoing commitment to achieving security, availability, processing integrity and confidentiality of the services we provide to ClickHouse users. For more information, check out [SOC 2 - SOC for Service Organizations: Trust Services Criteria](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services) issued by the American Institute of Certified Public Accountants (AICPA) and [What is ISO/IEC 27001](https://www.iso.org/standard/27001) from the International Standards Organization (ISO).

Please also check out our [Trust Center](https://trust.clickhouse.com/) for security and compliance documents and reports.

## August 15, 2024 {#august-15-2024}

### Compute-compute separation is now in Private Preview for AWS {#compute-compute-separation-is-now-in-private-preview-for-aws}

For existing ClickHouse Cloud services, replicas handle both reads and writes, and there is no way to configure a certain replica to handle only one kind of operation. We have an upcoming new feature called Compute-compute separation that allows you to designate specific services as read-write or read-only services, allowing you to design the optimal compute configuration for your application to optimize cost and performance.

Our new compute-compute separation feature enables you to create multiple compute node groups, each with its own endpoint, that are using the same object storage folder, and thus, with the same tables, views, etc. Read more about [Compute-compute separation here](/cloud/reference/warehouses). Please [contact support](https://clickhouse.com/support/program) if you would like access to this feature in Private Preview.

<Image img={cloud_console_2} size="lg" alt="Diagram showing example architecture for compute-compute separation with read-write and read-only service groups" border />

### ClickPipes for S3 and GCS now in GA, Continuous mode support {#clickpipes-for-s3-and-gcs-now-in-ga-continuous-mode-support}

ClickPipes is the easiest way to ingest data into ClickHouse Cloud. We're happy to announce that [ClickPipes](https://clickhouse.com/cloud/clickpipes) for S3 and GCS is now **Generally Available**. ClickPipes supports both one-time batch ingest and "continuous mode". An ingest task will load all the files matched by a pattern from a specific remote bucket into the ClickHouse destination table. In "continuous mode", the ClickPipes job will run constantly, ingesting matching files that get added into the remote object storage bucket as they arrive. This will allow you to turn any object storage bucket into a fully fledged staging area for ingesting data into ClickHouse Cloud. Read more about ClickPipes in [our documentation](/integrations/clickpipes).

## July 18, 2024 {#july-18-2024}

### Prometheus endpoint for metrics is now generally available {#prometheus-endpoint-for-metrics-is-now-generally-available}

In our last cloud changelog, we announced the Private Preview for exporting [Prometheus](https://prometheus.io/) metrics from ClickHouse Cloud. This feature allows you to use the [ClickHouse Cloud API](/cloud/manage/api/api-overview) to get your metrics into tools like [Grafana](https://grafana.com/) and [Datadog](https://www.datadoghq.com/) for visualization. We're happy to announce that this feature is now **Generally Available**. Please see [our docs](/integrations/prometheus) to learn more about this feature.

### Table inspector in Cloud console {#table-inspector-in-cloud-console}

ClickHouse has commands like [`DESCRIBE`](/sql-reference/statements/describe-table) that allow you to introspect your table to examine schema. These commands output to the console, but they are often not convenient to use as you need to combine several queries to retrieve all pertinent data about your tables and columns.

We recently launched a **Table Inspector** in the cloud console which allows you to retrieve important table and column information in the UI, without having to write SQL. You can try out the Table Inspector for your services by checking out the cloud console. It provides information about your schema, storage, compression, and more in one unified interface.

<Image img={compute_compute} size="lg" alt="ClickHouse Cloud Table Inspector interface showing detailed schema and storage information" border />

### New Java Client API {#new-java-client-api}

Our [Java Client](https://github.com/ClickHouse/clickhouse-java) is one of the most popular clients that users use to connect to ClickHouse. We wanted to make it even easier and more intuitive to use, including a re-designed API and various performance optimizations. These changes will make it much easier to connect to ClickHouse from your Java applications. You can read more about how to use the updated Java Client in this [blog post](https://clickhouse.com/blog/java-client-sequel).

### New Analyzer is enabled by default {#new-analyzer-is-enabled-by-default}

For the last couple of years, we've been working on a new analyzer for query analysis and optimization. This analyzer improves query performance and will allow us to make further optimizations, including faster and more efficient `JOIN`s. Previously, it was required that new users enable this feature using the setting `allow_experimental_analyzer`. This improved analyzer is now available on new ClickHouse Cloud services by default.

Stay tuned for more improvements to the analyzer as we have many more optimizations planned.

## June 28, 2024 {#june-28-2024}

### ClickHouse Cloud for Microsoft Azure is now generally available {#clickhouse-cloud-for-microsoft-azure-is-now-generally-available}

We first announced Microsoft Azure support in Beta [this past May](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta). In this latest cloud release, we're happy to announce that our Azure support is transitioning from Beta to Generally Available. ClickHouse Cloud is now available on all the three major cloud platforms: AWS, Google Cloud Platform, and now Microsoft Azure.

This release also includes support for subscriptions via the [Microsoft Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/clickhouse.clickhouse_cloud). The service will initially be supported in the following regions:
- United States: West US 3 (Arizona)
- United States: East US 2 (Virginia)
- Europe: Germany West Central (Frankfurt)

If you'd like any specific region to be supported, please [contact us](https://clickhouse.com/support/program).

### Query log insights {#query-log-insights}

Our new Query Insights UI in the Cloud console makes ClickHouse's built-in query log a lot easier to use. ClickHouse's `system.query_log` table is a key source of information for query optimization, debugging, and monitoring overall cluster health and performance.  There's just one caveat: with 70+ fields and multiple records per query, interpreting the query log represents a steep learning curve. This initial version of query insights provides a blueprint for future work to simplify query debugging and optimization patterns. We'd love to hear your feedback as we continue to iterate on this feature, so please reach out—your input will be greatly appreciated.

<Image img={query_insights} size="lg" alt="ClickHouse Cloud Query Insights UI showing query performance metrics and analysis" border />

### Prometheus endpoint for metrics (private preview) {#prometheus-endpoint-for-metrics-private-preview}

Perhaps one of our most requested features: you can now export [Prometheus](https://prometheus.io/) metrics from ClickHouse Cloud to [Grafana](https://grafana.com/) and [Datadog](https://www.datadoghq.com/) for visualization. Prometheus provides an open-source solution to monitor ClickHouse and set up custom alerts. Access to Prometheus metrics for your ClickHouse Cloud service is available via the [ClickHouse Cloud API](/integrations/prometheus). This feature is currently in Private Preview. Please reach out to the [support team](https://clickhouse.com/support/program) to enable this feature for your organization.

<Image img={prometheus} size="lg" alt="Grafana dashboard showing Prometheus metrics from ClickHouse Cloud" border />

### Other features {#other-features}
- [Configurable backups](/cloud/manage/backups/configurable-backups) to configure custom backup policies like frequency, retention, and schedule are now Generally Available.

## June 13, 2024 {#june-13-2024}

### Configurable offsets for Kafka ClickPipes Connector (Beta) {#configurable-offsets-for-kafka-clickpipes-connector-beta}

Until recently, whenever you set up a new [Kafka Connector for ClickPipes](/integrations/clickpipes/kafka), it always consumed data from the beginning of the Kafka topic. In this situation, it may not be flexible enough to fit specific use cases when you need to reprocess historical data, monitor new incoming data, or resume from a precise point.

ClickPipes for Kafka has added a new feature that enhances the flexibility and control over data consumption from Kafka topics. You can now configure the offset from which data is consumed.

The following options are available:
- From the beginning: Start consuming data from the very beginning of the Kafka topic. This option is ideal if you need to reprocess all historical data.
- From latest: Begin consuming data from the most recent offset. This is useful if you are only interested in new messages.
- From a timestamp: Start consuming data from messages that were produced at or after a specific timestamp. This feature allows for more precise control, enabling you to resume processing from an exact point in time.

<Image img={kafka_config} size="lg" alt="ClickPipes Kafka connector configuration interface showing offset selection options" border />

### Enroll services to the Fast release channel {#enroll-services-to-the-fast-release-channel}

The Fast release channel allows your services to receive updates ahead of the release schedule. Previously, this feature required assistance from the support team to enable. Now, you can use the ClickHouse Cloud console to enable this feature for your services directly. Simply navigate to **Settings**, and click **Enroll in fast releases**. Your service will now receive updates as soon as they are available.

<Image img={fast_releases} size="lg" alt="ClickHouse Cloud settings page showing the option to enroll in fast releases" border />

### Terraform support for horizontal scaling {#terraform-support-for-horizontal-scaling}

ClickHouse Cloud supports [horizontal scaling](/manage/scaling#how-scaling-works-in-clickhouse-cloud), or the ability to add additional replicas of the same size to your services. Horizontal scaling improves performance and parallelization to support concurrent queries. Previously, adding more replicas required either using the ClickHouse Cloud console or the API. You can now use Terraform to add or remove replicas from your service, allowing you to programmatically scale your ClickHouse services as needed.

Please see the [ClickHouse Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) for more information.

## May 30, 2024 {#may-30-2024}

### Share queries with your teammates {#share-queries-with-your-teammates}

When you write a SQL query, there's a good chance that other people on your team would also find that query useful. Previously, you'd have to send a query over Slack or email and there would be no way for a teammate to automatically receive updates for that query if you edit it.

We're happy to announce that you can now easily share queries via the ClickHouse Cloud console. From the query editor, you can share a query directly with your entire team or a specific team member. You can also specify whether they have read or write only access. Click on the **Share** button in the query editor to try out the new shared queries feature.

<Image img={share_queries} size="lg" alt="ClickHouse Cloud query editor showing the share functionality with permission options" border />

### ClickHouse Cloud for Microsoft Azure is now in beta {#clickhouse-cloud-for-microsoft-azure-is-now-in-beta}

We've finally launched the ability to create ClickHouse Cloud services on Microsoft Azure. We already have many customers using ClickHouse Cloud on Azure in production as part of our Private Preview program. Now, anyone can create their own service on Azure. All of your favorite ClickHouse features that are supported on AWS and GCP will also work on Azure.

We expect to have ClickHouse Cloud for Azure ready for General Availability in the next few weeks. [Read this blog post](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta) to learn more, or create your new service using Azure via the ClickHouse Cloud console.

Note: **Development** services for Azure are not supported at this time.

### Set up Private Link via the Cloud console {#set-up-private-link-via-the-cloud-console}

Our Private Link feature allows you to connect your ClickHouse Cloud services with internal services in your cloud provider account without having to direct traffic to the public internet, saving costs and enhancing security. Previously, this was difficult to set up and required using the ClickHouse Cloud API.

You can now configure private endpoints in just a few clicks directly from the ClickHouse Cloud console. Simply go to your service's **Settings**, go to the **Security** section and click **Set up private endpoint**.

<Image img={private_endpoint} size="lg" alt="ClickHouse Cloud console showing private endpoint setup interface in the security settings" border />

## May 17, 2024 {#may-17-2024}

### Ingest data from Amazon Kinesis using ClickPipes (beta) {#ingest-data-from-amazon-kinesis-using-clickpipes-beta}

ClickPipes is an exclusive service provided by ClickHouse Cloud to ingest data without code. Amazon Kinesis is AWS's fully managed streaming service to ingest and store data streams for processing. We are thrilled to launch the ClickPipes beta for Amazon Kinesis, one of our most requested integrations. We're looking to add more integrations to ClickPipes, so please let us know which data source you'd like us to support. Read more about this feature [here](https://clickhouse.com/blog/clickpipes-amazon-kinesis).

You can try the new Amazon Kinesis integration for ClickPipes in the cloud console:

<Image img={kenesis} size="lg" alt="ClickPipes interface showing Amazon Kinesis integration configuration options" border />

### Configurable backups (private preview) {#configurable-backups-private-preview}

Backups are important for every database (no matter how reliable), and we've taken backups very seriously since day 1 of ClickHouse Cloud. This week, we launched Configurable Backups, which allows for much more flexibility for your service's backups. You can now control start time, retention, and frequency. This feature is available for **Production** and **Dedicated** services and is not available for **Development** services. As this feature is in private preview, please contact support@clickhouse.com to enable this for your service. Read more about configurable backups [here](https://clickhouse.com/blog/configurable-backups-in-clickhouse-cloud).

### Create APIs from your SQL queries (Beta) {#create-apis-from-your-sql-queries-beta}

When you write a SQL query for ClickHouse, you still need to connect to ClickHouse via a driver to expose your query to your application. Now with our now **Query Endpoints** feature, you can execute SQL queries directly from an API without any configuration. You can specify the query endpoints to return JSON, CSV, or TSVs. Click the "Share" button in the cloud console to try this new feature with your queries. Read more about Query Endpoints [here](https://clickhouse.com/blog/automatic-query-endpoints).

<Image img={query_endpoints} size="lg" alt="ClickHouse Cloud interface showing Query Endpoints configuration with output format options" border />

### Official ClickHouse Certification is now available {#official-clickhouse-certification-is-now-available}

There are 12 free training modules in ClickHouse Develop training course. Prior to this week, there was no official way to prove your mastery in ClickHouse. We recently launched an official exam to become a **ClickHouse Certified Developer**. Completing this exam allows you to share with current and prospective employers your mastery in ClickHouse on topics including data ingestion, modeling, analysis, performance optimization, and more. You can take the exam [here](https://clickhouse.com/learn/certification) or read more about ClickHouse certification in this [blog post](https://clickhouse.com/blog/first-official-clickhouse-certification).

## April 25, 2024 {#april-25-2024}

### Load data from S3 and GCS using ClickPipes {#load-data-from-s3-and-gcs-using-clickpipes}

You may have noticed in our newly released cloud console that there's a new section called "Data sources". The "Data sources" page is powered by ClickPipes, a native ClickHouse Cloud feature which lets you easily insert data from a variety of sources into ClickHouse Cloud.

Our most recent ClickPipes update features the ability to directly upload data directly from Amazon S3 and Google Cloud Storage. While you can still use our built-in table functions, ClickPipes is a fully-managed service via our UI that will let you ingest data from S3 and GCS in just a few clicks. This feature is still in Private Preview, but you can try it out today via the cloud console.

<Image img={s3_gcs} size="lg" alt="ClickPipes interface showing configuration options for loading data from S3 and GCS buckets" border />

### Use Fivetran to load data from 500+ sources into ClickHouse Cloud {#use-fivetran-to-load-data-from-500-sources-into-clickhouse-cloud}

ClickHouse can quickly query all of your large datasets, but of course, your data must first be inserted into ClickHouse. Thanks to Fivetran's comprehensive range of connectors, you can now quickly load data from over 500 sources. Whether you need to load data from Zendesk, Slack, or any of your favorite applications, the new ClickHouse destination for Fivetran now lets you use ClickHouse as the target database for your application data.

This is an open-source integration built over many months of hard work by our Integrations team. You can check out our [release blog post](https://clickhouse.com/blog/fivetran-destination-clickhouse-cloud) here and the [GitHub repository](https://github.com/ClickHouse/clickhouse-fivetran-destination).

### Other changes {#other-changes}

**Console changes**
- Output formats support in the SQL console

**Integrations changes**
- ClickPipes Kafka connector supports multi-broker setup
- PowerBI connector supports providing ODBC driver configuration options.

## April 18, 2024 {#april-18-2024}

### AWS Tokyo region is now available for ClickHouse Cloud {#aws-tokyo-region-is-now-available-for-clickhouse-cloud}

This release introduces the new AWS Tokyo region (`ap-northeast-1`) for ClickHouse Cloud. Because we want ClickHouse to be the fastest database, we are continuously adding more regions for every cloud to reduce latency as much as possible. You can create your new service in Tokyo in the updated cloud console.

<Image img={tokyo} size="lg" alt="ClickHouse Cloud service creation interface showing Tokyo region selection" border />

Other changes:

### Console changes {#console-changes}
- Avro format support for ClickPipes for Kafka is now Generally Available
- Implement full support for importing resources (services and private endpoints) for the Terraform provider

### Integrations changes {#integrations-changes}
- NodeJS client major stable release: Advanced TypeScript support for query + ResultSet, URL configuration
- Kafka Connector: Fixed a bug with ignoring exceptions when writing into DLQ, added support for Avro Enum type, published guides for using the connector on [MSK](https://www.youtube.com/watch?v=6lKI_WlQ3-s) and [Confluent Cloud](https://www.youtube.com/watch?v=SQAiPVbd3gg)
- Grafana: Fixed support Nullable type support in UI, fixed support for dynamic OTEL tracing table name
- DBT: Fixed model settings for custom materialization.
- Java client: Fixed bug with incorrect error code parsing
- Python client: Fixed parameters binding for numeric types, fixed bugs with number list in query binding, added SQLAlchemy Point support.

## April 4, 2024 {#april-4-2024}

### Introducing the new ClickHouse Cloud console {#introducing-the-new-clickhouse-cloud-console}

This release introduces a private preview for the new cloud console.

At ClickHouse, we are constantly thinking about how to improve the developer experience. We recognize that it is not enough to provide the fastest real-time data warehouse, it also needs to be easy to use and manage.

Thousands of ClickHouse Cloud users execute billions of queries on our SQL console every month, which is why we've decided to invest more in a world-class console to make it easier than ever to interact with your ClickHouse Cloud services. Our new cloud console experience combines our standalone SQL editor with our management console in one intuitive UI.

Select customers will receive a preview of our new cloud console experience –  a unified and immersive way to explore and manage your data in ClickHouse. Please reach out to us at support@clickhouse.com if you'd like priority access.

<Image img={cloud_console} size="lg" alt="Animation showing the new ClickHouse Cloud console interface with integrated SQL editor and management features" border />

## March 28, 2024 {#march-28-2024}

This release introduces support for Microsoft Azure, Horizontal Scaling via API, and Release Channels in Private Preview.

### General updates {#general-updates}
- Introduced support for Microsoft Azure in Private Preview. To gain access, please reach out to account management or support, or join the [waitlist](https://clickhouse.com/cloud/azure-waitlist).
- Introduced Release Channels – the ability to specify the timing of upgrades based on environment type. In this release, we added the "fast" release channel, which enables you to upgrade your non-production environments ahead of production (please contact support to enable).

### Administration changes {#administration-changes}
- Added support for horizontal scaling configuration via API (private preview, please contact support to enable)
- Improved autoscaling to scale up services encountering out of memory errors on startup
- Added support for CMEK for AWS via the Terraform provider

### Console changes {#console-changes-1}
- Added support for Microsoft social login
- Added parameterized query sharing capabilities in SQL console
- Improved query editor performance significantly (from 5 secs to 1.5 sec latency in some EU regions)

### Integrations changes {#integrations-changes-1}
- ClickHouse OpenTelemetry exporter: [Added support](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31920) for ClickHouse replication table engine and [added integration tests](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31896)
- ClickHouse DBT adapter: Added support for [materialization macro for dictionaries](https://github.com/ClickHouse/dbt-clickhouse/pull/255), [tests for TTL expression support](https://github.com/ClickHouse/dbt-clickhouse/pull/254)
- ClickHouse Kafka Connect Sink: [Added compatibility](https://github.com/ClickHouse/clickhouse-kafka-connect/issues/350) with Kafka plugin discovery (community contribution)
- ClickHouse Java Client: Introduced [a new package](https://github.com/ClickHouse/clickhouse-java/pull/1574) for new client API and [added test coverage](https://github.com/ClickHouse/clickhouse-java/pull/1575) for Cloud tests
- ClickHouse NodeJS Client: Extended tests and documentation for new HTTP keep-alive behavior. Available since v0.3.0 release
- ClickHouse Golang Client: [Fixed a bug](https://github.com/ClickHouse/clickhouse-go/pull/1236) for Enum as a key in Map; [fixed a bug](https://github.com/ClickHouse/clickhouse-go/pull/1237) when an errored connection is left in the connection pool (community contribution)
- ClickHouse Python Client: [Added support](https://github.com/ClickHouse/clickhouse-connect/issues/155) for query streaming via PyArrow (community contribution)

### Security updates {#security-updates}
- Updated ClickHouse Cloud to prevent ["Role-based Access Control is bypassed when query caching is enabled"](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r) (CVE-2024-22412)

## March 14, 2024 {#march-14-2024}

This release makes available in early access the new Cloud console experience, ClickPipes for bulk loading from S3 and GCS, and support for Avro format in ClickPipes for Kafka. It also upgrades the ClickHouse database version to 24.1, bringing support for new functions as well as performance and resource usage optimizations.

### Console changes {#console-changes-2}
- New Cloud console experience is available in early access (please contact support if you're interested in participating).
- ClickPipes for bulk loading from S3 and GCS are available in early access (please contact support if you're interested in participating).
- Support for Avro format in ClickPipes for Kafka is available in early access (please contact support if you're interested in participating).

### ClickHouse version upgrade {#clickhouse-version-upgrade}
- Optimizations for FINAL, vectorization improvements, faster aggregations - see [23.12 release blog](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final) for details.
- New functions for processing punycode, string similarity, detecting outliers, as well as memory optimizations for merges and Keeper - see [24.1 release blog](https://clickhouse.com/blog/clickhouse-release-24-01) and [presentation](https://presentations.clickhouse.com/release_24.1/) for details.
- This ClickHouse cloud version is based on 24.1, you can see dozens of new features, performance improvements, and bug fixes. See core database [changelogs](/whats-new/changelog/2023#2312) for details.

### Integrations changes {#integrations-changes-2}
- Grafana: Fixed dashboard migration for v4, ad-hoc filtering logic
- Tableau Connector: Fixed DATENAME function and rounding for "real" arguments
- Kafka Connector: Fixed NPE in connection initialization, added ability to specify JDBC driver options
- Golang client: Reduced the memory footprint for handling responses, fixed Date32 extreme values, fixed error reporting when compression is enabled
- Python client: Improved timezone support in datetime parameters, improved performance for Pandas DataFrame
