---
title: 'Customized onboarding'
slug: /cloud/reference/byoc/onboarding/customization
sidebar_label: 'Customization'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'onboarding']
description: 'Deploy ClickHouse on your own cloud infrastructure'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_subnet_1 from '@site/static/images/cloud/reference/byoc-subnet-1.png';
import byoc_subnet_2 from '@site/static/images/cloud/reference/byoc-subnet-2.png';
import byoc_s3_endpoint from '@site/static/images/cloud/reference/byoc-s3-endpoint.png'

## Customer-managed VPC {#customer-managed-vpc}

:::note
This is currently only supported in **AWS**
:::

In case, you prefer to use an exisiting VPC to deploy ClickHouse BYOC.

### Configure Your Existing VPC
1. Tag the VPC with `clickhouse-byoc="true"`.
2. Allocate at least 3 private subnets across 3 different availability zones for ClickHouse Cloud to use.
3. Ensure each subnet has a minimum CIDR range of `/23` (e.g., 10.0.0.0/23) to provide sufficient IP addresses for the ClickHouse deployment.
4. Add the tag `kubernetes.io/role/internal-elb=1` and `clickhouse-byoc="true"` to each subnet to enable proper load balancer configuration.

<Image img={byoc_subnet_1} size="lg" alt="BYOC VPC Subnet" background='black'/>

<Image img={byoc_subnet_2} size="lg" alt="BYOC VPC Subnet Tags" background='black'/>

### Configure S3 Gateway Endpoint
If your VPC doesn't already have an S3 Gateway Endpoint configured, you'll need to create one to enable secure, private communication between your VPC and Amazon S3. This endpoint allows your ClickHouse services to access S3 without going through the public internet. Please refer to the screenshot below for an example configuration.

<Image img={byoc_s3_endpoint} size="lg" alt="BYOC S3 Endpint" background='black'/>

### Ensure Network Connectivity

**Outbound Internet Access**  
Your VPC must permit at least outbound internet access so that ClickHouse BYOC components can communicate with the Tailscale control plane. Tailscale is used to provide secure, zero-trust networking for private management operations. Initial registration and setup with Tailscale require public internet connectivity, which can be achieved either directly or via a NAT gateway. This connectivity is required to maintain both the privacy and security of your BYOC deployment.

**DNS Resolution**  
Ensure your VPC has working DNS resolution and does not block, interfere with, or overwrite standard DNS names. ClickHouse BYOC relies on DNS to resolve Tailscale control servers as well as ClickHouse service endpoints. If DNS is unavailable or misconfigured, BYOC services may fail to connect or operate properly.

### Configure your AWS account

The initial BYOC setup can be performed using either a [CloudFormation template(AWS)](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml) or a Terraform module(GCP). It creates a high priviledged IAM role, enabling BYOC controllers from ClickHouse Cloud to manage your infrastructure.

### Contact ClickHouse Support
After the above steps are done, create a support ticket with the following information:
* Your AWS account ID
* The AWS region where you want to deploy the service
* Your VPC ID
* The Private Subnet IDs you've allocated for ClickHouse
* The availability zones these subnets are in

## Customer-managed IAM roles
