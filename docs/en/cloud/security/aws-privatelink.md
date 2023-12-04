---
slug: /en/manage/security/aws-privatelink
sidebar_label: AWS PrivateLink
title: Setting up AWS PrivateLink
---

## Private Link Services

You can use [AWS PrivateLink](https://aws.amazon.com/privatelink/) to provide connectivity between VPCs, AWS services, your on-premises systems, and ClickHouse Cloud without having your traffic go across the internet.  This document describes how to connect to ClickHouse Cloud using AWS PrivateLink, and how to disable access to your ClickHouse Cloud services from addresses other than AWS PrivateLink addresses using ClickHouse Cloud IP Access Lists.

![VPC network diagram](@site/docs/en/cloud/security/images/aws-privatelink-flow.png)

If you require two or more AWS Private Links within the same AWS region, then please note: In ClickHouse, we have a VPC Endpoint service at a regional level. When you setup two or more VPC Endpoints in the same VPC - from the AWS VPC perspective - you are utilizing just a single AWS Private Link. In such a situation where you need two or more AWS Private Links configured within the same region, please just create just one VPC Endpoint in your VPC, and request that ClickHouse configure the same VPC Endpoint ID for all of your ClickHouse services in the same AWS region.

:::note
AWS PrivateLink can be enabled only on ClickHouse Cloud Production services
:::

The process is split into four steps:

1. Obtain AWS Service Name for Private Link.
2. Create service endpoint.
3. Add Endpoint ID to ClickHouse Cloud organization.
4. Add Endpoint ID to service(s) allow list.

## Obtain AWS Service Name for Private Link

Before you get started, you'll need an API key. You can [create a new key](https://clickhouse.com/docs/en/cloud/manage/openapi), or use existing one.

### REST API 

Set environment variables before running any commands:

```bash
REGION=<region code, please use AWS format>
PROVIDER=aws
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
```

:::note
You need at least 1 instance deployed in the region to perform this step.
:::

Get an instance ID from your region.

```bash
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services | jq ".result[] | select (.region==\"${REGION}\" and .provider==\"${PROVIDER}\") | .id " -r | head -1 | tee instance_id
```

Create an `INSTANCE_ID` environment variable using the ID you received in the previous step:

```bash
INSTANCE_ID=$(cat instance_id)
```

```bash
curl --silent --user $KEY_ID:$KEY_SECRET https://api.control-plane.clickhouse-dev.com/v1/organizations/$ORG_ID/services/$INSTANCE_ID/privateEndpointConfig | jq  .result 
{
  "endpointServiceId": "com.amazonaws.vpce.yy-xxxx-N.vpce-svc-xxxxxxxxxxxx",
...
}
```

Make a note of the `endpointServiceId`, you'll use it in the next step.

## Create service endpoint

Create a service endpoint, please use `endpointServiceId` from previous step.

:::note
AWS PrivateLink is a regional service (as of today). You can only establish a connection within the same region.
:::

In the AWS console go to **VPC > Endpoints > Create endpoints**. Click on **Other endpoint services** and use one of the VPC Service Names from supported regions. Then click on **Verify service**.

![Endpoint settings](@site/docs/en/cloud/security/images/aws-privatelink-endpoint-settings.png)

## Select VPC and subnets

![Select VPC and subnets](@site/docs/en/cloud/security/images/aws-privatelink-select-vpc-and-subnets.png)

Optional: assign Security groups/Tags

:::note
Make sure that the ClickHouse ports 8443 and 9440 are allowed in the Security group.
:::

After creating the VPC Endpoint, please write down the `Endpoint ID` value, it will be used later.

![VPC endpoint ID](@site/docs/en/cloud/security/images/aws-privatelink-vpc-endpoint-id.png)


### AWS CloudFormation

Please use correct subnet IDs, security groups and VPC ID.

```response
Resources:
  ClickHouseInterfaceEndpoint:
    Type: 'AWS::EC2::VPCEndpoint'
    Properties:
      VpcEndpointType: Interface
      PrivateDnsEnabled: false
      ServiceName: com.amazonaws.vpce.us-west-2.vpce-svc-049bbd33f61271781
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

### Terraform

https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/vpc_endpoint

```json
resource "aws_vpc_endpoint" "this" {
  vpc_id            = var.vpc_id
  service_name      = "com.amazonaws.vpce.us-west-2.vpce-svc-049bbd33f61271781"
  vpc_endpoint_type = "Interface"
  security_group_ids = [
    Var.security_group_id1,var.security_group_id2, var.security_group_id3,
  ]
  subnet_ids          = [var.subnet_id1,var.subnet_id2,var.subnet_id3]
  private_dns_enabled = false
}
```

### Modify Private DNS Name for Endpoint

This step injects private DNS zone `<region code>.vpce.aws.clickhouse.cloud` configuration into AWS VPC.

:::note
If you use own DNS resolver, create a `<region code>.vpce.aws.clickhouse.cloud` DNS zone and point a wildcard record `*.<region code>.vpce.aws.clickhouse.cloud` to the Endpoint ID IP addresses.
:::

#### AWS Console

Go to **VPC Endpoints** and right click the VPC Endpoint, then click to **Modify private DNS name**:

![Endpoints menu](@site/docs/en/cloud/security/images/aws-privatelink-endpoints-menu.png)

On the opened page, please enable the checkbox **Enable private DNS names**

![Modify DNS names](@site/docs/en/cloud/security/images/aws-privatelink-modify-dns-name.png)

#### AWS CloudFormation

- Please update CloudFormation template and set PrivateDnsEnabled to `true`:
```json
  PrivateDnsEnabled: true
```

- Apply the changes.

#### Terraform

- Change the `aws_vpc_endpoint` resource in Terraform code and set `private_dns_enabled` to `true`:
```json
  private_dns_enabled = true
```

- Apply the changes.

## Add Endpoint ID to ClickHouse Cloud organization

### REST API

Set the following environment variables before running any commands:
```bash
PROVIDER=aws
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
ENDPOINT_ID=<Endpoint ID from previous step>
REGION=<region code, please use AWS format>
```

Set the `VPC_ENDPOINT` environment variable using data from the previous step.

To add an endpoint, run:
```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "aws",
        "id": "${ENDPOINT_ID}",
        "description": "An aws private endpoint",
        "region": "${REGION}"
      }
    ]
  }
}
EOF
```

To remove an endpoint, run:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "remove": [
      {
        "cloudProvider": "aws",
        "id": "${ENDPOINT_ID}",
        "region": "${REGION}"
      }
    ]
  }
}
EOF
```

Add / remove Private Endpoint to organization

```bash
curl --silent --user $KEY_ID:$KEY_SECRET -X PATCH -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/$ORG_ID -d @pl_config_org.json
```

## Add Endpoint ID to service(s) allow list

You need to add Endpoint ID to allow list to each instance that should be available via PrivateLink.

:::note
this step cannot be done for Development services
:::

### REST API

Please set environment variables before running curl commands:

```bash
PROVIDER=aws
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
ENDPOINT_ID=<Endpoint ID from previous step>
INSTANCE_ID=<Instance ID>
```

Execute it for each service that should be available via Private Link. 

To add:
```bash
cat <<EOF | tee pl_config.json
{
  "privateEndpointIds": {
    "add": [
      "${ENDPOINT_ID}"
    ]
  }
}
EOF
```

To remove:
```bash
cat <<EOF | tee pl_config.json
{
  "privateEndpointIds": {
    "remove": [
      "${ENDPOINT_ID}"
    ]
  }
}
EOF
```

```bash
curl --silent --user $KEY_ID:$KEY_SECRET -X PATCH -H "Content-Type: application/json" https://api.control-plane.clickhouse-dev.com/v1/organizations/$ORG_ID/services/$INSTANCE_ID -d @pl_config.json | jq
```

## Accessing instance via PrivateLink

Each instance with configured Private Link filter has 2 endpoints: public and private. In order to connect via PrivateLink you need to use private endpoint(`privateDnsHostname`).

:::note
private DNS hostname is only available from your AWS VPC, please do not try to resolve DNS host from your laptop / PC that resides outside of AWS VPC.
:::

### Getting Private DNS Hostname

#### REST API

Please set environment variables before running curl commands:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

```bash
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$INSTANCE_ID/privateEndpointConfig | jq  .result 
{
  "endpointServiceId": "com.amazonaws.vpce.yy-xxxx-N.vpce-svc-xxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxx.yy-xxxx-N.vpce.aws.clickhouse.cloud"
}
```

In this example connection to `xxxxxxx.yy-xxxx-N.vpce.aws.clickhouse.cloud` host name will be routed to PrivateLink, but `xxxxxxx.yy-xxxx-N.aws.clickhouse.cloud` will be routed via internet.

## Troubleshooting

### Connection to private endpoint timed out
- Please attach security group to VPC Endpoint.
- Please verify `inbound` rules on security group attached to Endpoint and allow ClickHouse ports.
- Please verify `outbound` rules on security group attached to VM which is used to connectivity test and allow connections to ClickHouse ports.

### Private Hostname: Not found address of host 
- Please check "Private DNS names" option is enabled, visit [step](#modify-private-dns-name-for-endpoint) for details

### Connection reset by peer
- Most likely Endpoint ID was not added to service allow list, please visit [step](#add-endpoint-id-to-services-allow-list)