---
title: 'Customized Setup'
slug: /cloud/reference/byoc/onboarding/customization
sidebar_label: 'Customized Setup'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'onboarding']
description: 'Deploy ClickHouse on your own cloud infrastructure'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_subnet_1 from '@site/static/images/cloud/reference/byoc-subnet-1.png';
import byoc_subnet_2 from '@site/static/images/cloud/reference/byoc-subnet-2.png';
import byoc_s3_endpoint from '@site/static/images/cloud/reference/byoc-s3-endpoint.png'

## Customer-managed VPC (BYO-VPC) {#customer-managed-vpc}

:::note
This is only supported in **AWS** currently. GCP support is on the roadmap.
:::

If you prefer to use an existing VPC to deploy ClickHouse BYOC instead of having ClickHouse Cloud provision a new VPC, follow the steps below. This approach provides greater control over your network configuration and allows you to integrate ClickHouse BYOC into your existing network infrastructure.

### Configure Your Existing VPC {#configure-existing-vpc}
1. Tag the VPC with `clickhouse-byoc="true"`.
2. Allocate at least 3 private subnets across 3 different availability zones for ClickHouse Cloud to use.
3. Ensure each subnet has a minimum CIDR range of `/23` (e.g., 10.0.0.0/23) to provide sufficient IP addresses for the ClickHouse deployment.
4. Add the tag `kubernetes.io/role/internal-elb=1` and `clickhouse-byoc="true"` to each subnet to enable proper load balancer configuration.

<Image img={byoc_subnet_1} size="lg" alt="BYOC VPC Subnet" background='black'/>

<Image img={byoc_subnet_2} size="lg" alt="BYOC VPC Subnet Tags" background='black'/>

### Configure S3 Gateway Endpoint {#configure-s3-endpoint}
If your VPC doesn't already have an S3 Gateway Endpoint configured, you'll need to create one to enable secure, private communication between your VPC and Amazon S3. This endpoint allows your ClickHouse services to access S3 without going through the public internet. Please refer to the screenshot below for an example configuration.

<Image img={byoc_s3_endpoint} size="lg" alt="BYOC S3 Endpoint" background='black'/>

### Ensure Network Connectivity {#ensure-network-connectivity}

**Outbound Internet Access**  
Your VPC must permit at least outbound internet access so that ClickHouse BYOC components can communicate with the Tailscale control plane. Tailscale is used to provide secure, zero-trust networking for private management operations. Initial registration and setup with Tailscale require public internet connectivity, which can be achieved either directly or via a NAT gateway. This connectivity is required to maintain both the privacy and security of your BYOC deployment.

**DNS Resolution**  
Ensure your VPC has working DNS resolution and does not block, interfere with, or overwrite standard DNS names. ClickHouse BYOC relies on DNS to resolve Tailscale control servers as well as ClickHouse service endpoints. If DNS is unavailable or misconfigured, BYOC services may fail to connect or operate properly.

### Configure your AWS account {#configure-aws-account}

Before deploying ClickHouse BYOC into your existing VPC, you must set up the necessary IAM permissions to allow ClickHouse Cloud to manage resources in your AWS account. This is done by deploying the initial CloudFormation stack or Terraform module, similar to the standard onboarding process.

1. Deploy the [CloudFormation template](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml) or [Terraform module](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz) to create the bootstrap IAM role.
2. This creates the `ClickHouseManagementRole`, which grants ClickHouse Cloud the minimum permissions needed to provision and manage your BYOC deployment.

:::note
Even when using a customer-managed VPC, ClickHouse Cloud still requires IAM permissions to create and manage the Kubernetes cluster, IAM roles for service accounts, S3 buckets, and other supporting resources within your AWS account.
:::

### Contact ClickHouse Support {#contact-clickhouse-support}

After completing the above configuration steps, create a support ticket with the following information:

* Your AWS account ID
* The AWS region where you want to deploy the service
* Your VPC ID
* The Private Subnet IDs you've allocated for ClickHouse
* The availability zones these subnets are in

Our team will review your configuration and guide you through the remaining deployment steps.

## Customer-managed IAM roles {#customer-managed-iam-roles}

:::note
This is only supported in **AWS** currently. GCP support is on the roadmap.
:::

For organizations with advanced security requirements or strict compliance policies, you can provide your own IAM roles instead of having ClickHouse Cloud create them. This approach gives you complete control over IAM permissions and allows you to enforce your organization's security policies.

:::info
Customer-managed IAM roles are currently in development. If you require this capability, please [contact ClickHouse Support](https://clickhouse.com/cloud/bring-your-own-cloud) to discuss your specific requirements and timeline.

When available, this feature will allow you to:
* Provide pre-configured IAM roles for ClickHouse Cloud to use
* Customize IAM policies according to your security requirements
* Maintain full control over role permissions and trust relationships
:::

For information about the IAM roles that ClickHouse Cloud creates by default, see the [BYOC Privilege Reference](/cloud/reference/byoc/reference/priviledge).