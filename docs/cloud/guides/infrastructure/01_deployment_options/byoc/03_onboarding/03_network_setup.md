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


ClickHouse BYOC supports various private networking options to enhance security and enable direct connectivity for your services. This guide walks you through the recommended approaches for securely connecting ClickHouse Cloud deployments in your own AWS or GCP account to other networks or services, such as your internal applications or analytics tools. We cover options such as VPC Peering, AWS PrivateLink, and GCP Private Service Connect, and outline the main steps and considerations for each.

If you require a private network connection to your ClickHouse BYOC deployment, follow the steps in this guide or consult ClickHouse Support for assistance with more advanced scenarios.

## Setup VPC Peering {#optional-setup-vpc-peering}

To create or delete VPC peering for ClickHouse BYOC, follow the steps:

### Step 1: Enable private load balancer for ClickHouse BYOC {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
Contact ClickHouse Support to enable Private Load Balancer.

### Step 2 Create a peering connection {#step-2-create-a-peering-connection}
1. Navigate to the VPC Dashboard in ClickHouse BYOC account.
2. Select Peering Connections.
3. Click Create Peering Connection
4. Set the VPC Requester to the ClickHouse VPC ID.
5. Set the VPC Accepter to the target VPC ID. (Select another account if applicable)
6. Click Create Peering Connection.

<Image img={byoc_vpcpeering} size="lg" alt="BYOC Create Peering Connection" border />

### Step 3 Accept the peering connection request {#step-3-accept-the-peering-connection-request}
Go to the peering account, in the (VPC -> Peering connections -> Actions -> Accept request) page customer can approve this VPC peering request.

<Image img={byoc_vpcpeering2} size="lg" alt="BYOC Accept Peering Connection" border />

### Step 4 Add destination to ClickHouse VPC route tables {#step-4-add-destination-to-clickhouse-vpc-route-tables}
In ClickHouse BYOC account,
1. Select Route Tables in the VPC Dashboard.
2. Search for the ClickHouse VPC ID. Edit each route table attached to the private subnets.
3. Click the Edit button under the Routes tab.
4. Click Add another route.
5. Enter the CIDR range of the target VPC for the Destination.
6. Select “Peering Connection” and the ID of the peering connection for the Target.

<Image img={byoc_vpcpeering3} size="lg" alt="BYOC Add route table" border />

### Step 5 Add destination to the target VPC route tables {#step-5-add-destination-to-the-target-vpc-route-tables}
In the peering AWS account,
1. Select Route Tables in the VPC Dashboard.
2. Search for the target VPC ID.
3. Click the Edit button under the Routes tab.
4. Click Add another route.
5. Enter the CIDR range of the ClickHouse VPC for the Destination.
6. Select “Peering Connection” and the ID of the peering connection for the Target.

<Image img={byoc_vpcpeering4} size="lg" alt="BYOC Add route table" border />

### Step 6: Edit security group to allow peered VPC access {#step-6-edit-security-group-to-allow-peered-vpc-access}
In the ClickHouse BYOC account, you need to update the Security Group settings to allow traffic from your peered VPC. Please contact ClickHouse Support to request the addition of inbound rules that include the CIDR ranges of your peered VPC.

---
The ClickHouse service should now be accessible from the peered VPC.

To access ClickHouse privately, a private load balancer and endpoint are provisioned for secure connectivity from the user's peered VPC. The private endpoint follows the public endpoint format with a `-private` suffix. For example:
- **Public endpoint**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **Private endpoint**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

Optional, after verifying that peering is working, you can request the removal of the public load balancer for ClickHouse BYOC.

## Setup PrivateLink(AWS)


## Setup Private Service Connect(GCP)
