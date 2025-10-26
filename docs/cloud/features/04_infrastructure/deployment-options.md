---
title: 'Deployment Options'
slug: /infrastructure/deployment-options
description: 'Deployment options available for ClickHouse customers'
keywords: ['bring yor own cloud', 'byoc', 'private', 'government', 'self-deployed']
doc_type: 'reference'
---

# ClickHouse Deployment Options

ClickHouse provides a range of deployment options to cater to diverse customer requirements, offering varying degrees of control, compliance, and operational overhead.
This document outlines the distinct deployment types available, enabling users to select the optimal solution that aligns with their specific architectural preferences, regulatory obligations, and resource management strategies.

## ClickHouse Cloud {#clickhouse-cloud}

ClickHouse Cloud is a fully managed, cloud-native service that delivers the power and speed of ClickHouse without the operational complexities of self-management.
This option is ideal for users who prioritize rapid deployment, scalability, and minimal administrative overhead.
ClickHouse Cloud handles all aspects of infrastructure provisioning, scaling, maintenance, and updates, allowing users to focus entirely on data analysis and application development.
It offers consumption-based pricing, and automatic scaling, ensuring reliable and cost-effective performance for analytical workloads. It is available across AWS, GCP and Azure, with direct marketplace billing options.

Learn more about [ClickHouse Cloud](/getting-started/quick-start/cloud).

## Bring Your Own Cloud {#byoc}

ClickHouse Bring Your Own Cloud (BYOC) allows organizations to deploy and manage ClickHouse within their own cloud environment while leveraging a managed service layer. This option bridges the gap between the fully managed experience of ClickHouse Cloud and the complete control of self-managed deployments. With ClickHouse BYOC, users retain control over their data, infrastructure, and security policies, meeting specific compliance and regulatory requirements, while offloading operational tasks like patching, monitoring, and scaling to the ClickHouse. This model offers the flexibility of a private cloud deployment with the benefits of a managed service, making it suitable for large-scale deployments at enterprises with stringent security, governance, and data residency needs.

Learn more about [Bring Your Own Cloud](/cloud/reference/byoc/overview).

## ClickHouse Private {#clickhouse-private}

ClickHouse Private is a self-deployed version of ClickHouse, leveraging the same proprietary technology that powers ClickHouse Cloud. This option delivers the highest degree of control, making it ideal for organizations with stringent compliance, networking, and security requirements, as well as for teams that possess the operational expertise to manage their own infrastructure. It benefits from regular updates and upgrades that are thoroughly tested in the ClickHouse Cloud environment, a feature-rich roadmap, and is backed by our expert support team.

Learn more about [ClickHouse Private](/cloud/infrastructure/clickhouse-private).

## ClickHouse Government {#clickhouse-government}

ClickHouse Government is a self-deployed version of ClickHouse designed to meet the unique and rigorous demands of government agencies and public sector organizations that need isolated and accredited environments. This deployment option provides a highly secure, compliant, and isolated environment, focusing on FIPS 140-3 compliance utilizing OpenSSL, additional system hardening, and vulnerability management. It leverages the robust capabilities of ClickHouse Cloud while integrating specialized features and configurations to address the specific operational and security requirements of governmental entities. With ClickHouse Government, agencies can achieve high-performance analytics on sensitive data within a controlled and accredited infrastructure, backed by expert support tailored to public sector needs.

Learn more about [ClickHouse Government](/cloud/infrastructure/clickhouse-government).