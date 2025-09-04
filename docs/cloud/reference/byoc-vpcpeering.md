import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';
import byoc4 from '@site/static/images/cloud/reference/byoc-4.png';
import byoc3 from '@site/static/images/cloud/reference/byoc-3.png';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-3.png';
import byoc_vpcpeering4 from '@site/static/images/cloud/reference/byoc-vpcpeering-4.png';
import byoc_plb from '@site/static/images/cloud/reference/byoc-plb.png';
import byoc_security from '@site/static/images/cloud/reference/byoc-securitygroup.png';
import byoc_inbound from '@site/static/images/cloud/reference/byoc-inbound-rule.png';

## Optional: Setup VPC Peering {#optional-setup-vpc-peering}

To create or delete VPC peering for ClickHouse BYOC, follow the steps:

### Step 1 Enable Private Load Balancer for ClickHouse BYOC {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
Contact ClickHouse Support to enable Private Load Balancer.

### Step 2 Create a peering connection {#step-2-create-a-peering-connection}
1. Navigate to the VPC Dashboard in ClickHouse BYOC account.
2. Select Peering Connections.
3. Click Create Peering Connection
4. Set the VPC Requester to the ClickHouse VPC ID.
5. Set the VPC Acceptor to the target VPC ID. (Select another account if applicable)
6. Click Create Peering Connection.

<br />

<Image img={byoc_vpcpeering} size="lg" alt="BYOC Create Peering Connection" border />

<br />

### Step 3 Accept the peering connection request {#step-3-accept-the-peering-connection-request}
Go to the peering account, in the (VPC -> Peering connections -> Actions -> Accept request) page customer can approve this VPC peering request.

<br />

<Image img={byoc_vpcpeering2} size="lg" alt="BYOC Accept Peering Connection" border />

<br />

### Step 4 Add destination to ClickHouse VPC route tables {#step-4-add-destination-to-clickhouse-vpc-route-tables}
In ClickHouse BYOC account,
1. Select Route Tables in the VPC Dashboard.
2. Search for the ClickHouse VPC ID. Edit each route table attached to the private subnets.
3. Click the Edit button under the Routes tab.
4. Click Add another route.
5. Enter the CIDR range of the target VPC for the Destination.
6. Select “Peering Connection” and the ID of the peering connection for the Target.

<br />

<Image img={byoc_vpcpeering3} size="lg" alt="BYOC Add route table" border />

<br />

### Step 5 Add destination to the target VPC route tables {#step-5-add-destination-to-the-target-vpc-route-tables}
In the peering AWS account,
1. Select Route Tables in the VPC Dashboard.
2. Search for the target VPC ID.
3. Click the Edit button under the Routes tab.
4. Click Add another route.
5. Enter the CIDR range of the ClickHouse VPC for the Destination.
6. Select “Peering Connection” and the ID of the peering connection for the Target.

<br />

<Image img={byoc_vpcpeering4} size="lg" alt="BYOC Add route table" border />

<br />

### Step 6 Edit Security Group to allow Peered VPC access {#step-6-edit-security-group-to-allow-peered-vpc-access}
In ClickHouse BYOC account,
1. In the ClickHouse BYOC account, navigate to EC2 and locate the Private Load Balancer named like infra-xx-xxx-ingress-private.

<br />

<Image img={byoc_plb} size="lg" alt="BYOC Private Load Balancer" border />

<br />

2. Under the Security tab on the Details page, find the associated Security Group, which follows a naming pattern like `k8s-istioing-istioing-xxxxxxxxx`.

<br />

<Image img={byoc_security} size="lg" alt="BYOC Private Load Balancer Security Group" border />

<br />

3. Edit the Inbound Rules of this Security Group and add the Peered VPC CIDR range (or specify the required CIDR range as needed).

<br />

<Image img={byoc_inbound} size="lg" alt="BYOC Security Group Inbound Rule" border />

<br />

---
The ClickHouse service should now be accessible from the peered VPC.

To access ClickHouse privately, a private load balancer and endpoint are provisioned for secure connectivity from the user's peered VPC. The private endpoint follows the public endpoint format with a `-private` suffix. For example:
- **Public endpoint**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **Private endpoint**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

Optional, after verifying that peering is working, you can request the removal of the public load balancer for ClickHouse BYOC.