---
title: 'Private Networking Setup'
slug: /cloud/reference/byoc/onboarding/network
sidebar_label: 'Private Networking Setup'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'vpc peering', 'privatelink']
description: 'Deploy ClickHouse on your own cloud infrastructure'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-3.png';
import byoc_vpcpeering4 from '@site/static/images/cloud/reference/byoc-vpcpeering-4.png';
import byoc_privatelink_1 from '@site/static/images/cloud/reference/byoc-privatelink-1.png';
import byoc_privatelink_2 from '@site/static/images/cloud/reference/byoc-privatelink-2.png';

ClickHouse BYOC supports various private networking options to enhance security and enable direct connectivity for your services. This guide walks you through the recommended approaches for securely connecting ClickHouse Cloud deployments in your own AWS or GCP account to other networks or services, such as your internal applications or analytics tools. We cover options such as VPC Peering, AWS PrivateLink, and GCP Private Service Connect, and outline the main steps and considerations for each.

If you require a private network connection to your ClickHouse BYOC deployment, follow the steps in this guide or consult ClickHouse Support for assistance with more advanced scenarios.

## Setup VPC Peering (AWS) {#aws-vpc-peering}

To create or delete VPC peering for ClickHouse BYOC, follow the steps:

<VerticalStepper headerLevel="h3">

### Enable private load balancer for ClickHouse BYOC {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
Contact ClickHouse Support to enable Private Load Balancer.

### Create a peering connection {#step-2-create-a-peering-connection}
1. Navigate to the VPC Dashboard in ClickHouse BYOC account.
2. Select Peering Connections.
3. Click Create Peering Connection
4. Set the VPC Requester to the ClickHouse VPC ID.
5. Set the VPC Accepter to the target VPC ID. (Select another account if applicable)
6. Click Create Peering Connection.

<Image img={byoc_vpcpeering} size="lg" alt="BYOC Create Peering Connection" border />

### Accept the peering connection request {#step-3-accept-the-peering-connection-request}
Go to the peering account, in the (VPC -> Peering connections -> Actions -> Accept request) page customer can approve this VPC peering request.

<Image img={byoc_vpcpeering2} size="lg" alt="BYOC Accept Peering Connection" border />

### Add destination to ClickHouse VPC route tables {#step-4-add-destination-to-clickhouse-vpc-route-tables}
In ClickHouse BYOC account,
1. Select Route Tables in the VPC Dashboard.
2. Search for the ClickHouse VPC ID. Edit each route table attached to the private subnets.
3. Click the Edit button under the Routes tab.
4. Click Add another route.
5. Enter the CIDR range of the target VPC for the Destination.
6. Select “Peering Connection” and the ID of the peering connection for the Target.

<Image img={byoc_vpcpeering3} size="lg" alt="BYOC Add route table" border />

### Add destination to the target VPC route tables {#step-5-add-destination-to-the-target-vpc-route-tables}
In the peering AWS account,
1. Select Route Tables in the VPC Dashboard.
2. Search for the target VPC ID.
3. Click the Edit button under the Routes tab.
4. Click Add another route.
5. Enter the CIDR range of the ClickHouse VPC for the Destination.
6. Select “Peering Connection” and the ID of the peering connection for the Target.

<Image img={byoc_vpcpeering4} size="lg" alt="BYOC Add route table" border />

### Edit security group to allow peered VPC access {#step-6-edit-security-group-to-allow-peered-vpc-access}

In the ClickHouse BYOC account, you need to update the Security Group settings to allow traffic from your peered VPC. Please contact ClickHouse Support to request the addition of inbound rules that include the CIDR ranges of your peered VPC.

---
The ClickHouse service should now be accessible from the peered VPC.
</VerticalStepper>

To access ClickHouse privately, a private load balancer and endpoint are provisioned for secure connectivity from the user's peered VPC. The private endpoint follows the public endpoint format with a `-private` suffix. For example:
- **Public endpoint**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **Private endpoint**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

Optional, after verifying that peering is working, you can request the removal of the public load balancer for ClickHouse BYOC.

## Setup PrivateLink (AWS) {#setup-privatelink}

AWS PrivateLink provides secure, private connectivity to your ClickHouse BYOC services without requiring VPC peering or internet gateways. Traffic flows entirely within the AWS network, never traversing the public internet.

<VerticalStepper headerLevel="h3">

### Request PrivateLink Setup {#step-1-request-privatelink-setup}

Contact [ClickHouse Support](https://clickhouse.com/cloud/bring-your-own-cloud) to request PrivateLink setup for your BYOC deployment. No specific information is required at this stage—simply indicate that you want to set up PrivateLink connectivity.

ClickHouse Support will enable the necessary infrastructure components, including **the private load balancer** and **PrivateLink service endpoint**.

### Create an Endpoint in Your VPC {#step-2-create-endpoint}

After ClickHouse Support has enabled PrivateLink on their side, you need to create a VPC endpoint in your client application VPC to connect to the ClickHouse PrivateLink service.

1. **Obtain the Endpoint Service Name**:
   - ClickHouse Support will provide you with the Endpoint Service name
   - You can also find it in the AWS VPC console under "Endpoint Services" (filter by service name or look for ClickHouse services)

<Image img={byoc_privatelink_1} size="lg" alt="BYOC PrivateLink Service Endpoint" border />

2. **Create the VPC Endpoint**:
   - Navigate to the AWS VPC Console → Endpoints → Create Endpoint
   - Select "Find service by name" and enter the Endpoint Service name provided by ClickHouse Support
   - Choose your VPC and select subnets (one per availability zone is recommended)
   - **Important**: Enable "Private DNS names" for the endpoint—this is required for DNS resolution to work correctly
   - Select or create a security group for the endpoint
   - Click "Create Endpoint"

:::important
**DNS Requirements**: 
- Enable "Private DNS names" when creating the VPC endpoint
- Ensure your VPC has "DNS Hostnames" enabled (VPC Settings → DNS resolution and DNS hostnames)

These settings are required for the PrivateLink DNS to function correctly.
:::

3. **Approve the Endpoint Connection**:
   - After creating the endpoint, you need to approve the connection request
   - In the VPC Console, go to "Endpoint Connections" 
   - Find the connection request from ClickHouse and click "Accept" to approve it

<Image img={byoc_privatelink_2} size="lg" alt="BYOC PrivateLink Approve" border />

### Add Endpoint ID to Service Allowlist {#step-3-add-endpoint-id-allowlist}

Once your VPC endpoint is created and the connection is approved, you need to add the Endpoint ID to the allowlist for each ClickHouse service you want to access via PrivateLink.

1. **Obtain your Endpoint ID**:
   - In the AWS VPC Console, go to Endpoints
   - Select your newly created endpoint
   - Copy the Endpoint ID (it will look like `vpce-xxxxxxxxxxxxxxxxx`)

2. **Contact ClickHouse Support**:
   - Provide the Endpoint ID(s) to ClickHouse Support
   - Specify which ClickHouse service(s) should allow access from this endpoint
   - ClickHouse Support will add the Endpoint ID to the service allowlist

### Connect to ClickHouse via PrivateLink {#step-4-connect-via-privatelink}

After the Endpoint ID is added to the allowlist, you can connect to your ClickHouse service using the PrivateLink endpoint.

The PrivateLink endpoint format is similar to the public endpoint, but includes a `vpce` subdomain. For example:

- **Public endpoint**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`
- **PrivateLink endpoint**: `h5ju65kv87.vpce.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`

DNS resolution in your VPC will automatically route traffic through the PrivateLink endpoint when you use the `vpce` subdomain format.

</VerticalStepper>

### PrivateLink Access Control {#privatelink-access-control}

Access to ClickHouse services via PrivateLink is controlled at two levels:

1. **Istio Authorization Policy**: ClickHouse Cloud's service-level authorization policies
2. **VPC Endpoint Security Group**: The security group attached to your VPC endpoint controls which resources in your VPC can use the endpoint

:::note
The private load balancer's "Enforce inbound rules on PrivateLink traffic" feature is disabled, so access is controlled by Istio authorization policies and your VPC endpoint's security group only.
:::

### PrivateLink DNS {#privatelink-dns}

PrivateLink DNS for BYOC endpoints (using the `*.vpce.{subdomain}` format) leverages AWS PrivateLink's built-in "Private DNS names" feature. No Route53 records are required—DNS resolution happens automatically when:

- "Private DNS names" is enabled on your VPC endpoint
- Your VPC has "DNS Hostnames" enabled

This ensures that connections using the `vpce` subdomain automatically route through the PrivateLink endpoint without additional DNS configuration.

## VPC Peering (GCP) and Private Service Connect (GCP) {#setup-gcp}

GCP VPC Peering and Private Service Connect provides similar private connectivity for GCP-based BYOC deployments. This feature is currently in development. If you need VPC Peering or Private Service Connect for your GCP BYOC deployment, please [contact ClickHouse Support](https://clickhouse.com/cloud/bring-your-own-cloud) to discuss availability and setup requirements.