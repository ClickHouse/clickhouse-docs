---
title: 'BYOC FAQ'
slug: /cloud/reference/byoc/reference/faq
sidebar_label: 'FAQ'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'FAQ']
description: 'Deploy ClickHouse on your own cloud infrastructure'
doc_type: 'reference'
---

## FAQ {#faq}

### Compute {#compute}

<details>
<summary>Can I create multiple services in this single EKS cluster?</summary>

Yes. The infrastructure only needs to be provisioned once for every AWS account and region combination.

</details>

<details>
<summary>Which regions do you support for BYOC?</summary>

All **public regions** listed in our [supported regions](https://clickhouse.com/docs/cloud/reference/supported-regions) documentation are available for BYOC deployments. Private regions are not currently supported.

</details>

<details>
<summary>Will there be some resource overhead? What are the resources needed to run services other than ClickHouse instances?</summary>

Besides the ClickHouse instances themselves (ClickHouse servers and ClickHouse Keeper), we also run supporting services such as `clickhouse-operator`, `aws-cluster-autoscaler`, Istio, and the monitoring stack.

The resource consumption of these shared components is relatively stable and does not grow linearly with the number or size of your ClickHouse services. As a rough guideline, in AWS we typically use a dedicated node group of about four `4xlarge` EC2 instances to run these workloads.

</details>

### Network and security {#network-and-security}

<details>
<summary>Can we revoke permissions set up during installation after setup is complete?</summary>

This is currently not possible.

</details>

<details>
<summary>Have you considered some future security controls for ClickHouse engineers to access customer infra for troubleshooting?</summary>

Yes. Implementing a customer controlled mechanism where customers can approve engineers' access to the cluster is on our roadmap. At the moment, engineers must go through our internal escalation process to gain just-in-time access to the cluster. This is logged and audited by our security team.

</details>

<details>
<summary>What is the size of the VPC IP range created?</summary>

By default, we use `10.0.0.0/16` for BYOC VPC. We recommend reserving at least /22 for potential future scaling,
but if you prefer to limit the size, it is possible to use /23 if it is likely that you will be limited
to 30 server pods.

</details>

<details>
<summary>Can I decide maintenance frequency?</summary>

Contact support to schedule maintenance windows. Please expect a minimum of a weekly update schedule.

</details>

<details>
<summary>How does storage communication work between BYOC VPC and S3?</summary>

Traffic between your Customer BYOC VPC and S3 uses HTTPS (port 443) via the AWS S3 API for table data, backups, and logs. When using S3 VPC endpoints, this traffic remains within the AWS network and does not traverse the public internet.

</details>

<details>
<summary>What ports are used for internal ClickHouse cluster communication?</summary>

Internal ClickHouse cluster communication within the Customer BYOC VPC uses:
- Native ClickHouse protocol on port 9000
- HTTP/HTTPS on ports 8123/8443
- Interserver communication on port 9009 for replication and distributed queries

</details>

### Uptime SLAs {#uptime-sla}

<details>
<summary>Does ClickHouse offer an uptime SLA for BYOC?</summary>

No, since the data plane is hosted in the customer's cloud environment, service availability depends on resources not in ClickHouse's control. Therefore, ClickHouse does not offer a formal uptime SLA for BYOC deployments. If you have additional questions, please contact support@clickhouse.com.

</details>
