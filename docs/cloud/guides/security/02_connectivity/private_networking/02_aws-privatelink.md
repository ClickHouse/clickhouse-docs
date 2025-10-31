---
title: 'AWS PrivateLink'
description: 'This document describes how to connect to ClickHouse Cloud using AWS PrivateLink.'
slug: /manage/security/aws-privatelink
keywords: ['PrivateLink']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import aws_private_link_pecreate from '@site/static/images/cloud/security/aws-privatelink-pe-create.png';
import aws_private_link_endpoint_settings from '@site/static/images/cloud/security/aws-privatelink-endpoint-settings.png';
import aws_private_link_select_vpc from '@site/static/images/cloud/security/aws-privatelink-select-vpc-and-subnets.png';
import aws_private_link_vpc_endpoint_id from '@site/static/images/cloud/security/aws-privatelink-vpc-endpoint-id.png';
import aws_private_link_endpoints_menu from '@site/static/images/cloud/security/aws-privatelink-endpoints-menu.png';
import aws_private_link_modify_dnsname from '@site/static/images/cloud/security/aws-privatelink-modify-dns-name.png';
import pe_remove_private_endpoint from '@site/static/images/cloud/security/pe-remove-private-endpoint.png';
import aws_private_link_pe_filters from '@site/static/images/cloud/security/aws-privatelink-pe-filters.png';
import aws_private_link_ped_nsname from '@site/static/images/cloud/security/aws-privatelink-pe-dns-name.png';

# AWS PrivateLink

<ScalePlanFeatureBadge feature="AWS PrivateLink"/>

You can use [AWS PrivateLink](https://aws.amazon.com/privatelink/) to establish secure connectivity between VPCs, AWS services, your on-premises systems, and ClickHouse Cloud without exposing traffic to the public Internet. This document outlines the steps to connect to ClickHouse Cloud using AWS PrivateLink.

To restrict access to your ClickHouse Cloud services exclusively through AWS PrivateLink addresses, follow the instructions provided by ClickHouse Cloud [IP Access Lists](/cloud/security/setting-ip-filters).

:::note
ClickHouse Cloud supports [cross-region PrivateLink](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-privatelink-across-region-connectivity/) from the following regions:
- sa-east-1
- il-central-1
- me-central-1
- me-south-1
- eu-central-2
- eu-north-1
- eu-south-2
- eu-west-3
- eu-south-1
- eu-west-2
- eu-west-1
- eu-central-1
- ca-west-1
- ca-central-1
- ap-northeast-1
- ap-southeast-2
- ap-southeast-1
- ap-northeast-2
- ap-northeast-3
- ap-south-1
- ap-southeast-4
- ap-southeast-3
- ap-south-2
- ap-east-1
- af-south-1
- us-west-2
- us-west-1
- us-east-2
- us-east-1
Pricing considerations: AWS will charge users for cross region data transfer, see pricing [here](https://aws.amazon.com/privatelink/pricing/).
:::

**Please complete the following to enable AWS PrivateLink**:
1. Obtain Endpoint "Service name".
1. Create AWS Endpoint.
1. Add "Endpoint ID" to ClickHouse Cloud organization.
1. Add "Endpoint ID" to ClickHouse service allow list.

Find Terraform examples [here](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).

## Important considerations {#considerations}
ClickHouse attempts to group your services to reuse the same published [service endpoint](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-overview) within the AWS region. However, this grouping is not guaranteed, especially if you spread your services across multiple ClickHouse organizations.
If you already have PrivateLink configured for other services in your ClickHouse organization, you can often skip most of the steps because of that grouping and proceed directly to the final step: Add ClickHouse "Endpoint ID" to ClickHouse service allow list.

## Prerequisites for this process {#prerequisites}

Before you get started you will need:

1. Your AWS account.
1. [ClickHouse API key](/cloud/manage/openapi) with the necessary permissions to create and manage private endpoints on ClickHouse side.

## Steps {#steps}

Follow these steps to connect your ClickHouse Cloud services via AWS PrivateLink.

### Obtain endpoint "Service name"  {#obtain-endpoint-service-info}

#### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console}

In the ClickHouse Cloud console, open the service you want to connect via PrivateLink, then navigate to the **Settings** menu.

<Image img={aws_private_link_pecreate} size="md" alt="Private Endpoints" border />

Make a note of the `Service name` and `DNS name`, then [move onto next step](#create-aws-endpoint).

#### Option 2: API {#option-2-api}

First, set the following environment variables before running any commands:

```shell
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

Get your ClickHouse `INSTANCE_ID` by filtering by region, provider and service name:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

Obtain `endpointServiceId` and `privateDnsHostname` for your PrivateLink configuration:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

This command should return something like:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

Make a note of the `endpointServiceId` and `privateDnsHostname` [move onto next step](#create-aws-endpoint).

### Create AWS endpoint {#create-aws-endpoint}

:::important
This section covers ClickHouse-specific details for configuring ClickHouse via AWS PrivateLink. AWS-specific steps are provided as a reference to guide you on where to look, but they may change over time without notice from the AWS cloud provider. Please consider AWS configuration based on your specific use case.  

Please note that ClickHouse is not responsible for configuring the required AWS VPC endpoints, security group rules or DNS records.  

If you previously enabled "private DNS names" while setting up PrivateLink and are experiencing difficulties configuring new services via PrivateLink, please contact ClickHouse support. For any other issues related to AWS configuration tasks, contact AWS Support directly.
:::

#### Option 1: AWS console {#option-1-aws-console}

Open the AWS console and Go to **VPC** → **Endpoints** → **Create endpoints**.

Select **Endpoint services that use NLBs and GWLBs** and use `Service name`<sup>console</sup> or `endpointServiceId`<sup>API</sup> you got from [Obtain Endpoint "Service name" ](#obtain-endpoint-service-info) step in **Service Name** field. Click **Verify service**:

<Image img={aws_private_link_endpoint_settings} size="md" alt="AWS PrivateLink Endpoint Settings" border/>

If you want to establish a cross-regional connection via PrivateLink, enable the "Cross region endpoint" checkbox and specify the service region. The service region is where the ClickHouse instance is running.

If you get a "Service name could not be verified." error, please contact Customer Support to request adding new regions to the supported regions list.

Next, select your VPC and subnets:

<Image img={aws_private_link_select_vpc} size="md" alt="Select VPC and subnets" border />

As an optional step, assign Security groups/Tags:

:::note
Make sure that ports `443`, `8443`, `9440`, `3306` are allowed in the security group.
:::

After creating the VPC Endpoint, make a note of the `Endpoint ID` value; you'll need it for an upcoming step.

<Image img={aws_private_link_vpc_endpoint_id} size="md" alt="VPC Endpoint ID" border/>

#### Option 2: AWS CloudFormation {#option-2-aws-cloudformation}

Next, you need to create a VPC Endpoint using `Service name`<sup>console</sup> or `endpointServiceId`<sup>API</sup> you got from [Obtain Endpoint "Service name" ](#obtain-endpoint-service-info) step.
Make sure to use correct subnet IDs, security groups, and VPC ID.

```response
Resources:
  ClickHouseInterfaceEndpoint:
    Type: 'AWS::EC2::VPCEndpoint'
    Properties:
      VpcEndpointType: Interface
      PrivateDnsEnabled: false
      ServiceName: <Service name(endpointServiceId), pls see above>
      VpcId: vpc-vpc_id
      SubnetIds:
        - subnet-subnet_id1
        - subnet-subnet_id2
        - subnet-subnet_id3
      SecurityGroupIds:
        - sg-security_group_id1
        - sg-security_group_id2
        - sg-security_group_id3
```

After creating the VPC Endpoint, make a note of the `Endpoint ID` value; you'll need it for an upcoming step.

#### Option 3: Terraform {#option-3-terraform}

`service_name` below is `Service name`<sup>console</sup> or `endpointServiceId`<sup>API</sup> you got from [Obtain Endpoint "Service name" ](#obtain-endpoint-service-info) step

```json
resource "aws_vpc_endpoint" "this" {
  vpc_id            = var.vpc_id
  service_name      = "<pls see comment above>"
  vpc_endpoint_type = "Interface"
  security_group_ids = [
    Var.security_group_id1,var.security_group_id2, var.security_group_id3,
  ]
  subnet_ids          = [var.subnet_id1,var.subnet_id2,var.subnet_id3]
  private_dns_enabled = false
  service_region      = "(Optional) If specified, the VPC endpoint will connect to the service in the provided region. Define it for multi-regional PrivateLink connections."
}
```

After creating the VPC Endpoint, make a note of the `Endpoint ID` value; you'll need it for an upcoming step.

#### Set private DNS name for endpoint {#set-private-dns-name-for-endpoint}

:::note
There are various ways to configure DNS. Please set up DNS according to your specific use case.
:::

You need to point "DNS name", taken from [Obtain Endpoint "Service name" ](#obtain-endpoint-service-info) step, to AWS Endpoint network interfaces. This ensures that services/components within your VPC/Network can resolve it properly.

### Add "Endpoint ID" to ClickHouse service allow list {#add-endpoint-id-to-services-allow-list}

#### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console-2}

To add, please navigate to the ClickHouse Cloud console, open the service that you would like to connect via PrivateLink then navigate to **Settings**. Click **Set up private endpoint** to open private endpoints settings. Enter the `Endpoint ID` obtained from the [Create AWS Endpoint](#create-aws-endpoint) step. Click "Create endpoint".

:::note
If you want to allow access from an existing PrivateLink connection, use the existing endpoint drop-down menu.
:::

<Image img={aws_private_link_pe_filters} size="md" alt="Private Endpoints Filter" border/>

To remove please navigate to the ClickHouse Cloud console, find the service, then navigate to **Settings** of the service, find endpoint you would like to remove.Remove it from the list of endpoints. 

#### Option 2: API {#option-2-api-2}

You need to add an Endpoint ID to the allow-list for each instance that should be available using PrivateLink.

Set the `ENDPOINT_ID` environment variable using data from [Create AWS Endpoint](#create-aws-endpoint) step.

Set the following environment variables before running any commands:

```bash
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

To add an endpoint ID to an allow-list:

```bash
cat <<EOF | tee pl_config.json
{
  "privateEndpointIds": {
    "add": [
      "${ENDPOINT_ID:?}"
    ]
  }
}
EOF

curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X PATCH -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" \
-d @pl_config.json | jq
```

To remove an endpoint ID from an allow-list:

```bash
cat <<EOF | tee pl_config.json
{
  "privateEndpointIds": {
    "remove": [
      "${ENDPOINT_ID:?}"
    ]
  }
}
EOF

curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X PATCH -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" \
-d @pl_config.json | jq
```

### Accessing an instance using PrivateLink {#accessing-an-instance-using-privatelink}

Each service with Private Link enabled has a public and private endpoint. In order to connect using Private Link, you need to use a private endpoint which will be `privateDnsHostname`<sup>API</sup> or `DNS Name`<sup>console</sup> taken from [Obtain Endpoint "Service name"](#obtain-endpoint-service-info).

#### Getting private DNS hostname {#getting-private-dns-hostname}

##### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console-3}

In the ClickHouse Cloud console, navigate to **Settings**. Click on the **Set up private endpoint** button. In the opened flyout, copy the **DNS Name**.

<Image img={aws_private_link_ped_nsname} size="md" alt="Private Endpoint DNS Name" border />

##### Option 2: API {#option-2-api-3}

Set the following environment variables before running any commands:

```bash
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
INSTANCE_ID=<Your ClickHouse service name>
```

You can retrieve `INSTANCE_ID` from [step](#option-2-api).

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

This should output something like:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

In this example connection via value of `privateDnsHostname` host name will be routed to PrivateLink, but connection via `endpointServiceId` hostname will be routed over the Internet.

## Troubleshooting {#troubleshooting}

### Multiple PrivateLinks in one region {#multiple-privatelinks-in-one-region}

In most cases, you only need to create a single endpoint service for each VPC. This endpoint can route requests from the VPC to multiple ClickHouse Cloud services.
Please refer [here](#considerations)

### Connection to private endpoint timed out {#connection-to-private-endpoint-timed-out}

- Please attach security group to VPC Endpoint.
- Please verify `inbound` rules on security group attached to Endpoint and allow ClickHouse ports.
- Please verify `outbound` rules on security group attached to VM which is used to connectivity test and allow connections to ClickHouse ports.

### Private Hostname: Not found address of host {#private-hostname-not-found-address-of-host}

- Please check your DNS configuration

### Connection reset by peer {#connection-reset-by-peer}

- Most likely Endpoint ID was not added to service allow list, please visit [step](#add-endpoint-id-to-services-allow-list)

### Checking endpoint filters {#checking-endpoint-filters}

Set the following environment variables before running any commands:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

You can retrieve `INSTANCE_ID` from [step](#option-2-api).

```shell
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X GET -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | \
jq .result.privateEndpointIds
```

### Connecting to a remote database {#connecting-to-a-remote-database}

Let's say you are trying to use [MySQL](/sql-reference/table-functions/mysql) or [PostgreSQL](/sql-reference/table-functions/postgresql) table functions in ClickHouse Cloud and connect to your database hosted in an Amazon Web Services (AWS) VPC. AWS PrivateLink cannot be used to enable this connection securely. PrivateLink is a one-way, unidirectional connection. It allows your internal network or Amazon VPC to connect securely to ClickHouse Cloud, but it does not allow ClickHouse Cloud to connect to your internal network.

According to the [AWS PrivateLink documentation](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html):

> Use AWS PrivateLink when you have a client/server set up where you want to allow one or more consumer VPCs unidirectional access to a specific service or set of instances in the service provider VPC. Only the clients in the consumer VPC can initiate a connection to the service in the service provider VPC.

To do this, configure your AWS Security Groups to allow connections from ClickHouse Cloud to your internal/private database service. Check the [default egress IP addresses for ClickHouse Cloud regions](/manage/data-sources/cloud-endpoints-api), along with the [available static IP addresses](https://api.clickhouse.cloud/static-ips.json).
