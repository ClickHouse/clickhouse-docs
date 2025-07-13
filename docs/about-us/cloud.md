---
slug: /about-us/cloud
sidebar_label: 'Cloud Service'
sidebar_position: 10
description: 'ClickHouse Cloud'
title: 'ClickHouse Cloud'
---

# ClickHouse Cloud

ClickHouse Cloud is the cloud offering created by the original creators of the popular open-source OLAP database ClickHouse. 
You can experience ClickHouse Cloud by [starting a free trial](https://console.clickhouse.cloud/signUp).

### ClickHouse Cloud benefits {#clickhouse-cloud-benefits}

Some of the benefits of using ClickHouse Cloud are described below:

- **Fast time to value**: Start building instantly without having to size and scale your cluster.
- **Seamless scaling**: Automatic scaling adjusts to variable workloads so you don't have to over-provision for peak usage.
- **Serverless operations**: Sit back while we take care of sizing, scaling, security, reliability, and upgrades.
- **Transparent pricing**: Pay only for what you use, with resource reservations and scaling controls.
- **Total cost of ownership**: Best price / performance ratio and low administrative overhead.
- **Broad ecosystem**: Bring your favorite data connectors, visualization tools, SQL and language clients with you.

<!--
## OSS vs ClickHouse Cloud comparison {#oss-vs-clickhouse-cloud}

| Feature                        | Benefits                                                                                                                                                                                                                                                                                                   | OSS ClickHouse  | ClickHouse Cloud  |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|-------------------|
| **Deployment modes**           | ClickHouse provides flexibility to self-manage with open-source or deploy in the cloud. Use ClickHouse Local for local files without a server or chDB to embed ClickHouse directly into your application.                                                                                                  | ✅               | ✅                 |
| **Storage**                    | As an open-source and cloud-hosted product, ClickHouse can be deployed in both shared-disk and shared-nothing architectures.                                                                                                                                                                               | ✅               | ✅                 |
| **Monitoring and alerting**    | Monitoring and alerting about the status of your services is critical to ensuring optimal performance and a proactive approach to detect and triage potential issues.                                                                                                                                      | ✅               | ✅                 |
| **ClickPipes**                 | ClickPipes is ClickHouse's managed ingestion pipeline that allows you to seamlessly connect your external data sources like databases, APIs, and streaming services into ClickHouse Cloud, eliminating the need for managing pipelines, custom jobs, or ETL processes. It supports workloads of all sizes. | ❌               | ✅                 |
| **Pre-built integrations**     | ClickHouse provides pre-built integrations that connect ClickHouse to popular tools and services such as data lakes, SQL and language clients, visualization libraries, and more.                                                                                                                          | ❌               | ✅                 |
| **SQL console**                | The SQL console offers a fast, intuitive way to connect, explore, and query ClickHouse databases, featuring a slick caption, query interface, data import tools, visualizations, collaboration features, and GenAI-powered SQL assistance.                                                                 | ❌               | ✅                 |
| **Compliance**                 | ClickHouse Cloud compliance includes CCPA, EU-US DPF, GDPR, HIPAA, ISO 27001, ISO 27001 SoA, PCI DSS, SOC2. ClickHouse Cloud's security, availability, processing integrity, and confidentiality processes are all independently audited. Details: trust.clickhouse.com.                                   | ❌               | ✅                 |
| **Enterprise-grade security**  | Support for advanced security features such as SSO, multi-factor authentication, role-based access control (RBAC), private and secure connections with support for Private Link and Private Service Connect, IP filtering, customer-managed encryption keys (CMEK), and more.                              | ❌               | ✅                 |
| **Scaling and optimization**   | Seamlessly scales up or down based on workload, supporting both horizontal and vertical scaling. With automated backups, replication, and high availability, ClickHouse, it provides users with optimal resource allocation.                                                                               | ❌               | ✅                 |
| **Support services**           | Our best-in-class support services and open-source community resources provide coverage for whichever deployment model you choose.                                                                                                                                                                         | ❌               | ✅                 |
| **Database upgrades**          | Regular database upgrades are essential to establish a strong security posture and access the latest features and performance improvements.                                                                                                                                                                | ❌               | ✅                 |
| **Backups**                    | Backups and restore functionality ensures data durability and supports graceful recovery in the event of outages or other disruptions.                                                                                                                                                                     | ❌               | ✅                 |
| **Compute-compute separation** | Users can scale compute resources independently of storage, so teams and workloads can share the same storage and maintain dedicated compute resources. This ensures that the performance of one workload doesn't interfere with another, enhancing flexibility, performance, and cost-efficiency.         | ❌               | ✅                 |
| **Managed services**           | With a cloud-managed service, teams can focus on business outcomes and accelerate time-to-market without having to worry about the operational overhead of sizing, setup, and maintenance of ClickHouse.                                                                                                   | ❌               | ✅                 |
-->

## What version of ClickHouse does ClickHouse Cloud use? {#what-version-of-clickhouse-does-clickhouse-cloud-use}

Clickhouse Cloud continuously upgrades your service to a newer version. After publishing a core database version in the open source, we do additional validation in our cloud staging environment, which typically takes 6-8 weeks before rolling out to production. The rollout is phased out by cloud service provider, service type, and region.

We offer a "Fast" Release Channel for subscribing to updates ahead of the regular release schedule. For more details, see ["Fast Release Channel"](/manage/updates#fast-release-channel-early-upgrades).

If you rely on functionality in the earlier version, you can, in some cases, revert to the previous behavior using your service's compatibility setting.
