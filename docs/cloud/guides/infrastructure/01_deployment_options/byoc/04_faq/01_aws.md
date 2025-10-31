---
title: 'BYOC on AWS FAQ'
slug: /cloud/reference/byoc/faq/aws
sidebar_label: 'AWS'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'AWS']
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

BYOC supports the same set of [regions](/cloud/reference/supported-regions#aws-regions ) as ClickHouse Cloud.

</details>

<details>
<summary>Will there be some resource overhead? What are the resources needed to run services other than ClickHouse instances?</summary>

Besides Clickhouse instances (ClickHouse servers and ClickHouse Keeper), we run services such as `clickhouse-operator`, `aws-cluster-autoscaler`, Istio etc. and our monitoring stack.

Currently, we have three m5.xlarge nodes (one for each AZ) in a dedicated node group to run those workloads.

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

### Uptime SLAs {#uptime-sla}

<details>
<summary>Does ClickHouse offer an uptime SLA for BYOC?</summary>

No, since the data plane is hosted in the customer's cloud environment, service availability depends on resources not in ClickHouse's control. Therefore, ClickHouse does not offer a formal uptime SLA for BYOC deployments. If you have additional questions, please contact support@clickhouse.com.

</details>