---
title: 'BYOC AWS private networking setup'
slug: /cloud/reference/byoc/onboarding/network-aws
sidebar_label: 'AWS private networking setup'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'vpc peering', 'aws', 'privatelink']
description: 'Set up VPC Peering or PrivateLink for BYOC on AWS'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_private_load_balancer from '@site/static/images/cloud/reference/byoc-private-load-balancer.png';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-3.png';
import byoc_vpcpeering4 from '@site/static/images/cloud/reference/byoc-vpcpeering-4.png';
import byoc_privatelink from '@site/static/images/cloud/reference/byoc-privatelink.png';
import byoc_privatelink_aws_cross_region from '@site/static/images/cloud/reference/byoc-privatelink-aws-cross-region.png';
import aws_private_link_pecreate from '@site/static/images/cloud/security/aws-privatelink-pe-create.png';
import aws_private_link_endpoint_settings from '@site/static/images/cloud/security/aws-privatelink-endpoint-settings.png';
import aws_private_link_select_vpc from '@site/static/images/cloud/security/aws-privatelink-select-vpc-and-subnets.png';
import aws_private_link_vpc_endpoint_id from '@site/static/images/cloud/security/aws-privatelink-vpc-endpoint-id.png';
import byoc_privatelink_2 from '@site/static/images/cloud/reference/byoc-privatelink-2.png';
import aws_private_link_pe_filters from '@site/static/images/cloud/security/aws-privatelink-pe-filters.png';
import aws_private_link_ped_nsname from '@site/static/images/cloud/security/aws-privatelink-pe-dns-name.png';

ClickHouse BYOC on AWS supports two private connection options including VPC Peering and AWS PrivateLink.

## Prerequisites {#common-prerequisites}

Common steps required by both VPC peering and PrivateLink.

### Enable private load balancer for ClickHouse BYOC {#step-enable-private-load-balancer-for-clickhouse-byoc}

In the ClickHouse Cloud console, enable the **Private load balancer** for your BYOC infrastructure.

<Image img={byoc_private_load_balancer} size="md" alt="BYOC Enable Private Load Balancer" border />

## Set up VPC peering {#aws-vpc-peering}

To create or delete VPC peering for ClickHouse BYOC, follow the steps:

<VerticalStepper headerLevel="h3">

### Create a peering connection {#step-1-create-a-peering-connection}

1. Navigate to the VPC Dashboard in ClickHouse BYOC account.
2. Select Peering Connections.
3. Click Create Peering Connection
4. Set the VPC Requester to the ClickHouse VPC ID.
5. Set the VPC Accepter to the target VPC ID. (Select another account if applicable)
6. Click Create Peering Connection.

<Image img={byoc_vpcpeering} size="lg" alt="BYOC Create Peering Connection" border />

### Accept the peering connection request {#step-2-accept-the-peering-connection-request}

Go to the peering account, in the (VPC -> Peering connections -> Actions -> Accept request) page customer can approve this VPC peering request.

<Image img={byoc_vpcpeering2} size="lg" alt="BYOC Accept Peering Connection" border />

### Add destination to ClickHouse VPC route tables {#step-3-add-destination-to-clickhouse-vpc-route-tables}

In ClickHouse BYOC account,

1. Select Route Tables in the VPC Dashboard.
2. Search for the ClickHouse VPC ID. Edit each route table attached to the private subnets.
3. Click the Edit button under the Routes tab.
4. Click Add another route.
5. Enter the CIDR range of the target VPC for the Destination.
6. Select “Peering Connection” and the ID of the peering connection for the Target.

<Image img={byoc_vpcpeering3} size="lg" alt="BYOC Add route table" border />

### Add destination to the target VPC route tables {#step-4-add-destination-to-the-target-vpc-route-tables}

In the peering AWS account,

1. Select Route Tables in the VPC Dashboard.
2. Search for the target VPC ID.
3. Click the Edit button under the Routes tab.
4. Click Add another route.
5. Enter the CIDR range of the ClickHouse VPC for the Destination.
6. Select “Peering Connection” and the ID of the peering connection for the Target.

<Image img={byoc_vpcpeering4} size="lg" alt="BYOC Add route table" border />

### Edit security group to allow peered VPC access {#step-5-edit-security-group-to-allow-peered-vpc-access}

In the ClickHouse BYOC account, you need to update the Security Group settings to allow traffic from your peered VPC. Please contact ClickHouse Support to request the addition of inbound rules that include the CIDR ranges of your peered VPC.

---

The ClickHouse service should now be accessible from the peered VPC.
</VerticalStepper>

To access ClickHouse privately, a private load balancer and endpoint are provisioned for secure connectivity from the user's peered VPC. The private endpoint follows the public endpoint format with a `-private` suffix. For example:

- **Public endpoint**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **Private endpoint**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

Optional, after verifying that peering is working, you can request the removal of the public load balancer for ClickHouse BYOC.

## Set up PrivateLink {#setup-privatelink}

AWS PrivateLink provides a secure and private connection to your ClickHouse BYOC services without the need for VPC peering or internet gateways. All traffic flows within the AWS network, ensuring that it never traverses the public internet.

<VerticalStepper headerLevel="h3">

### Enable private link in ClickHouse console {#step-1-enable-private-link}

:::note
Make sure the **private load balancer** is turned on as a prerequisite.
:::

<Image img={byoc_privatelink} size="md" alt="BYOC PrivateLink Enable" border />

### Obtain endpoint "Service name" {#step-2-obtain-endpoint-service-name}

1. In the ClickHouse Cloud console, navigate to the service's Settings page that you would like to connect to via PrivateLink.
2. Click "Set up private endpoint".
3. In the opened flyout, copy the `Service name` value — you'll use it in the next step. (It may take a while for the value to be generated after enabling PrivateLink.)
   <Image img={aws_private_link_pecreate} size="md" alt="Private Endpoints" border />

### Create endpoint in your network {#step-3-create-endpoint}

1. Open your **own AWS console** (i.e. the AWS account where your client application is) → VPC → Endpoints → Create endpoints.
2. Select "Endpoint services that use NLBs and GWLBs" and use `Service name` obtained from the last step.
3. Click "Verify service".
   <Image img={aws_private_link_endpoint_settings} size="md" alt="AWS PrivateLink Endpoint Settings" border/>
4. (Optional) If you want to establish a cross-regional connection via PrivateLink, enable the "Cross region endpoint" checkbox and specify the service region. The service region is where the ClickHouse instance is running. Meanwhile, add your endpoint region in your **BYOC AWS console** (i.e. the AWS account where your BYOC infrastructure is created) as well.
   <Image img={byoc_privatelink_aws_cross_region} size="md" alt="AWS PrivateLink Cross Region Endpoint Settings" border/>
5. Select your VPC and subnets (one per availability zone is recommended).
   <Image img={aws_private_link_select_vpc} size="md" alt="Select VPC and subnets" border />
6. **Important**: Enable "Private DNS names" for the endpoint — this is required for Private DNS to function correctly.
   Private DNS for BYOC endpoints (using the `*.vpce.{subdomain}` format) leverages AWS PrivateLink's built-in "Private DNS names" feature. No Route53 records are required — DNS resolution happens automatically when:
   - "Private DNS names" is enabled and
   - "DNS Hostnames" is enabled

     via VPC Settings → DNS resolution and DNS hostnames.

     This ensures that connections using the `vpce` subdomain automatically route through the PrivateLink endpoint without additional DNS configuration.

7. (Optional) Assign Security groups/Tags.
   :::note
   Make sure that ports `443`, `8443`, `9440`, `3306` are allowed in the security group.
   :::
8. Click "Create endpoint", wait a moment for the endpoint to be created.
9. After creating the endpoint, copy the `Endpoint ID` value — you'll use it in the next step.
   <Image img={aws_private_link_vpc_endpoint_id} size="md" alt="VPC Endpoint ID" border />

### Approve the endpoint connection {#step-4-approve-endpoint-connection}

1. Open your **BYOC VPC console** again → Endpoint services → `clickhouse-cloud-infra-xxx` → Endpoint connections.
2. Find the connection request created from your own VPC and click "Accept endpoint connection request" to approve it.
   <Image img={byoc_privatelink_2} size="md" alt="BYOC PrivateLink Approve" border />

### Add "Endpoint ID" to ClickHouse service allow list {#step-5-add-endpoint-id-to-services-allow-list}

1. In the ClickHouse Cloud console, navigate to the service's Settings page that you would like to connect to via PrivateLink.
2. Click "Set up private endpoint".
3. In the opened flyout, enter the `Endpoint ID` obtained from the last step with an optional description.
4. Click "Create endpoint".

:::note
If you want to allow access from an existing PrivateLink connection, use the existing endpoint dropdown menu.
The dropdown will show the existing PrivateLink connections to the services within the same infrastructure.
:::
<Image img={aws_private_link_pe_filters} size="md" alt="Private Endpoints Filter" border/>

### Access an instance using PrivateLink {#step-6-connect-via-privatelink}

1. In the ClickHouse Cloud console, navigate to service's Settings page.
2. Click "Set up private endpoint".
3. In the opened flyout, copy the `DNS name`.
   <Image img={aws_private_link_ped_nsname} size="md" alt="Private Endpoint DNS Name" border />

   Access to ClickHouse services via PrivateLink is controlled at two levels:
   1. **Istio Authorization Policy**: ClickHouse Cloud's service-level authorization policies
   2. **VPC Endpoint Security Group**: The security group attached to your VPC endpoint controls which resources in your VPC can use the endpoint

   :::note
   The private load balancer's "Enforce inbound rules on PrivateLink traffic" feature is disabled, so access is controlled by Istio authorization policies and your VPC endpoint's security group only.
   :::

</VerticalStepper>
