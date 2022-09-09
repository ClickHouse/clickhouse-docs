---
slug: /en/docs/manage/security/aws-privatelink
sidebar_label: Setting up AWS PrivateLink
title: Setting up AWS PrivateLink
---


## Private Link Services

https://aws.amazon.com/privatelink/

// taken from aws website, not sure how it works from copyrights perspective

AWS PrivateLink provides private connectivity between VPCs, AWS services, and your on-premises networks, without exposing your traffic to the public internet. AWS PrivateLink makes it easy to connect services across different accounts and VPCs to significantly simplify your network architecture.

![VPC network diagram](@site/docs/en/manage/security/images/aws-privatelink-network-diagram.png)

Network traffic that uses AWS PrivateLink doesn't traverse the public internet, reducing exposure to brute force and distributed denial-of-service attacks, along with other threats. You can use private IP connectivity so that your services function as though they were hosted directly on your private network. You can also associate security groups and attach an endpoint policy to interface endpoints, which allow you to control precisely who has access to a specified service. AWS connections powered by PrivateLink, such as interface VPC endpoints and Gateway Load Balancer endpoints, deliver the same benefits of security, scalability, and performance.

TABLE OF SUPPORTED REGIONS

Supported regions
Region
VPC Service Name
AZ IDs
ap-southeast-1
com.amazonaws.vpce.ap-southeast-1.vpce-svc-0a8b096ec9d2acb01
apse1-az1 apse1-az2 apse1-az3
eu-central-1
com.amazonaws.vpce.eu-central-1.vpce-svc-0536fc4b80a82b8ed
euc1-az2 euc1-az3 euc1-az1
eu-west-1
com.amazonaws.vpce.eu-west-1.vpce-svc-066b03c9b5f61c6fc
euw1-az2 euw1-az3 euw1-az1
us-east-1
com.amazonaws.vpce.us-east-1.vpce-svc-0a0218fa75c646d81
use1-az6 use1-az1 use1-az2
us-east-2
com.amazonaws.vpce.us-east-2.vpce-svc-0b99748bf269a86b4
use2-az1 use2-az2 use2-az3
us-west-2
com.amazonaws.vpce.us-west-2.vpce-svc-049bbd33f61271781
usw2-az2 usw2-az1 usw2-az3


## Create Endpoint Service
### AWS Console

Create a service endpoint, please use the region from the table above.

:::note
AWS PrivateLink is a regional service.(as of today) You can only establish a connection within the same region.
:::


In the AWS console go to VPC->Endpoints->Create endpoints. Click on “Other endpoint services” and use one of the VPC Service Names from supported regions. Then click on “Verify service”.

![Endpoint settings](@site/docs/en/manage/security/images/aws-privatelink-endpoint-settings.png)

## Select VPC and subnets

![Select VPC and subnets](@site/docs/en/manage/security/images/aws-privatelink-select-vpc-and-subnets.png)

Optional: assign Security groups/Tags

:::note
Make sure that the ClickHouse ports are allowed in the Security group.
:::


After creating the VPC Endpoint, please put down the VPC Endpoint ID.

![VPC endpoint ID](@site/docs/en/manage/security/images/aws-privatelink-vpc-endpoint-id.png)


## AWS CloudFormation

Please use correct subnet IDs, security groups and VPC ID.

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
## Terraform
https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/vpc_endpoint

```
resource "aws_vpc_endpoint" "this" {
  vpc_id            = var.vpc_id
  service_name      = “com.amazonaws.vpce.us-west-2.vpce-svc-049bbd33f61271781"
  vpc_endpoint_type = "Interface"
  security_group_ids = [
    Var.security_group_id1,var.security_group_id2, var.security_group_id3,
  ]
  subnet_ids          = [var.subnet_id1,var.subnet_id2,var.subnet_id3]
  private_dns_enabled = false
}
```

## Reach out to ClickHouse customer support

Please provide VPC Endpoint ID and ClickHouse service hostnames. 

```
VPC Endpoint IDs: vpce-\d{17}
ClickHouse instance URLs:
clickhouse1._region_.aws.clickhouse.cloud,clickhouse2._region_.aws.clickhouse.cloud
```

Once the request is processed, the VPC Endpoint service status will change from “pendingAcceptance” to “Available”.

## Test connectivity

:::note
This step validates TCP connectivity between your VPC and ClickHouse cloud infrastructure over PrivateLink.
:::

Please get “DNS Names” from VPC Endpoint configuration:

![Get DNS names](@site/docs/en/manage/security/images/aws-privatelink-get-dns-names.png)

:::note
Please use this FQDN only for connectivity testing
:::

```response
telnet vpce-08c316c04b3a5623f-bi21tevr.vpce-svc-049bbd33f61271781.us-west-2.vpce.amazonaws.com 9440
Trying 172.31.27.78...
# highlight-next-line
Connected to vpce-08c316c04b3a5623f-bi21tevr.vpce-svc-049bbd33f61271781.us-west-2.vpce.amazonaws.com
Escape character is '^]'.
^]
telnet> Connection closed.
```

```response
telnet vpce-08c316c04b3a5623f-bi21tevr.vpce-svc-049bbd33f61271781.us-west-2.vpce.amazonaws.com 8443
Trying 172.31.27.78...
# highlight-next-line
Connected to vpce-08c316c04b3a5623f-bi21tevr.vpce-svc-049bbd33f61271781.us-west-2.vpce.amazonaws.com.
Escape character is '^]'.
^]
telnet> Connection closed.
```

The error below indicates a problem with connectivity.
```response
telnet vpce-08c316c04b3a5623f-bi21tevr.vpce-svc-049bbd33f61271781.us-west-2.vpce.amazonaws.com 9440
Trying 172.31.25.195...
# highlight-next-line
telnet: connect to address 172.31.25.195: No route to host
Trying 172.31.3.200...
```

## Shift network traffic to VPC Endpoint
:::note
this step switches network traffic direction from Internet to VPC Endpoint.
:::

Before this step:
```response
[ec2-user@ip-172-31-29-231 ~]$ nslookup HOSTNAME.clickhouse.cloud
Server:         172.31.0.2
Address:        172.31.0.2#53

Non-authoritative answer:
Name:   HOSTNAME.clickhouse.cloud
Address: 44.226.232.172
Name:   HOSTNAME.clickhouse.cloud
Address: 35.82.252.60
Name:   HOSTNAME.clickhouse.cloud
Address: 35.85.205.122
```

```response
After completion of this step:
[ec2-user@ip-172-31-29-231 ~]$ nslookup HOSTNAME.clickhouse.cloud
Server:         172.31.0.2
Address:        172.31.0.2#53

Non-authoritative answer:
Name:   HOSTNAME.clickhouse.cloud
Address: 172.31.27.78
Name:   HOSTNAME.clickhouse.cloud
Address: 172.31.33.234
Name:   HOSTNAME.clickhouse.cloud
Address: 172.31.8.117
```

## AWS Console

Go to VPC Endpoints and do right click to VPC Endpoint, click to **Modify private DNS name**:

![Endpoints menu](@site/docs/en/manage/security/images/aws-privatelink-endpoints-menu.png)

On the opened page, please enable the checkbox **Enable private DNS names**

![Modify DNS names](@site/docs/en/manage/security/images/aws-privatelink-modify-dns-name.png)

### AWS CloudFormation

1. Please update CloudFormation template and set PrivateDnsEnabled to `true`:
```
  PrivateDnsEnabled: true
```

1. Apply it

### Terraform
1. Change the `aws_vpc_endpoint` resource in Terraform code and set `private_dns_enabled` to `true`:
```
  private_dns_enabled = true
```

1. Apply it


## Verification

:::note
IP address ranges may vary.
:::

:::important
Please make sure ClickHouse instance FQDN is pointed to the internal IP address of your VPC, otherwise connectivity will be established using the Internet. Please find these IP addresses on “Subnets” tab of VPC Endpoint configuration.
:::

![Subnets tab](@site/docs/en/manage/security/images/aws-privatelink-subnets-tab.png)

Verify that instance FQDN is pointed to VPC Endpoint ID IP addresses.

```bash
nslookup HOSTNAME.clickhouse.cloud
```
```response
Server:         172.31.0.2
Address:        172.31.0.2#53

Non-authoritative answer:
Name:   HOSTNAME.clickhouse.cloud
Address: 172.31.25.195
Name:   HOSTNAME.clickhouse.cloud
Address: 172.31.40.109
Name:   HOSTNAME.clickhouse.cloud
Address: 172.31.3.200
```

### Verify connectivity to ClickHouse Cloud service

```bash
curl https://HOSTNAME.clickhouse.cloud:8443
```
```response
Ok.
```

```bash
clickhouse-client --host HOSTNAME.clickhouse.cloud \
  --secure --port 9440 \
  --password PASSWORD
```
```response
1
```

