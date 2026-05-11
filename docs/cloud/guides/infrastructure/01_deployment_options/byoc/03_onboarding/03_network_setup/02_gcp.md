---
title: 'BYOC GCP private networking setup'
slug: /cloud/reference/byoc/onboarding/network-gcp
sidebar_label: 'GCP private networking setup'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'vpc peering', 'gcp', 'private service connect']
description: 'Set up VPC Peering or Private Service Connect for BYOC on GCP'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-gcp-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-gcp-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-gcp-3.png';
import byoc_privatelink_1 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-1.png';
import byoc_privatelink_2 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-2.png';
import byoc_privatelink_3 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-3.png';
import byoc_privatelink_4 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-4.png';
import byoc_privatelink_5 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-5.png';
import byoc_privatelink_6 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-6.png';

ClickHouse BYOC on GCP supports two private connection options including VPC Peering and Private Service Connect. Traffic flows entirely within the GCP network, never traversing the public internet.

## Prerequisites {#common-prerequisites}

Common steps required by both VPC peering and Private Service Connect.

### Enable private load balancer for ClickHouse BYOC {#step-enable-private-load-balancer-for-clickhouse-byoc}
Contact ClickHouse Support to enable Private Load Balancer.

## Set up VPC peering {#gcp-vpc-peering}

Please familiarize yourself with [GCP VPC peering feature](https://docs.cloud.google.com/vpc/docs/vpc-peering) and note the limitations of VPC peering (for example subnet IP ranges can't overlap across peered VPC networks). ClickHouse BYOC utilizes a private load balancer to allow network connectivity through the peering to ClickHouse services.

To create or delete VPC peering for ClickHouse BYOC, follow the steps:

:::note
The example steps are for a simple scenario, for advanced scenarios such as peering with on-premises connectivity, some adjustments may be required.
:::

<VerticalStepper headerLevel="h3">

### Create a peering connection {#step-1-create-a-peering-connection}

In this example, we are setting up peering between the BYOC VPC network and another existing VPC network.

1. Navigate to the "VPC Network" in ClickHouse BYOC Google Cloud Project.
2. Select "VPC network peering".
3. Click "Create connection".
4. Input the necessary fields as per your requirements. Below is a screenshot for creating a peering within same GCP project.

<Image img={byoc_vpcpeering} size="md" alt="BYOC Create Peering Connection" border />

GCP VPC peering requires 2 connections between the 2 networks to work (i.e. a connection from BYOC network to the existing VPC network and a connection from the existing VPC network to the BYOC network). So you need to similarly create 1 more connection in reverse direction, below is a screenshot for the second peering connection creation:

<Image img={byoc_vpcpeering2} size="md" alt="BYOC Accept Peering Connection" border />

After both connections are created, the status of the 2 connections should become "Active" after refreshing the Google Cloud Console webpage:

<Image img={byoc_vpcpeering3} size="lg" alt="BYOC Accept Peering Connection" border />

The ClickHouse service should now be accessible from the peered VPC.

### Access ClickHouse service via peering connection {#step-2-access-ch-service-via-peering}

To access ClickHouse privately, a private load balancer and endpoint are provisioned for secure connectivity from the user's peered VPC. The private endpoint follows the public endpoint format with a `-private` suffix. For example:
- **Public endpoint**: `h5ju65kv87.mhp0y4dmph.us-east1.gcp.byoc.clickhouse.cloud`
- **Private endpoint**: `h5ju65kv87-private.mhp0y4dmph.us-east1.gcp.byoc.clickhouse.cloud`

</VerticalStepper>

## Set up PSC (Private Service Connect) {#gcp-psc}

GCP PSC (Private Service Connect) provides secure, private connectivity to your ClickHouse BYOC services without requiring VPC peering or internet gateways.

<VerticalStepper headerLevel="h3">

### Request PSC service setup {#step-1-request-psc-setup}

Contact [ClickHouse Support](https://clickhouse.com/cloud/bring-your-own-cloud) to request PSC service setup for your BYOC deployment. No specific information is required at this stage—simply indicate that you want to set up PSC connectivity.

ClickHouse Support will enable the necessary infrastructure components, including **the private load balancer** and **PSC Service**.

### Obtain GCP PSC service name and DNS name {#step-2-obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

ClickHouse Support will provide you with the PSC Service name. You can also obtain it in the ClickHouse Cloud console, under "Organization" -> "Infrastructure", click into the infra name to see the details.

<Image img={byoc_privatelink_1} size="lg" alt="BYOC PSC Endpoint" border />
<Image img={byoc_privatelink_2} size="lg" alt="BYOC PSC Endpoint" border />

You can also find the PSC service name in the GCP Private Service Connect console under "Published services" (filter by service name or look for ClickHouse services)

<Image img={byoc_privatelink_3} size="lg" alt="BYOC PSC Endpoint" border />
<Image img={byoc_privatelink_4} size="lg" alt="BYOC PSC Endpoint" border />

### Create a PSC endpoint in your network {#step-3-create-endpoint}

After ClickHouse Support has enabled PSC service on their side, you need to create a PSC endpoint in your client application network to connect to the ClickHouse PSC service.

1. **Create the PSC Endpoint**:
- Navigate to the GCP Console -> Network Services → Private Service Connect → Connect Endpoint
- Select "Published service" for "Target" and input the PSC service name obtained at last step to "Target details"
- Input a valid endpoint name
- Choose your network and select subnets (This is the network where your client application will be connecting from)
- Choose or create a new IP address for the endpoint, the IP address needs to be used by step [Set private DNS name for endpoint](#step-4-set-private-dns-name-for-endpoint)
- Click "Add Endpoint", wait a moment for the endpoint to be created.
- The endpoint status should become "Accepted", contact ClickHouse support if it's not auto-accepted.

<Image img={byoc_privatelink_5} size="lg" alt="BYOC PSC endpoint creation" border />

2. **Obtain PSC Connection ID**:
- Click into the endpoint detail and obtain the "PSC Connection ID" to be used by step [Add endpoint's PSC Connection ID to service allowlist](#step-5-add-endpoint-id-allowlist)

<Image img={byoc_privatelink_6} size="lg" alt="BYOC PSC endpoint detail" border />

### Set private DNS name for endpoint {#step-4-set-private-dns-name-for-endpoint}

:::note
There are various ways to configure DNS. Please set up DNS according to your specific use case.
:::

You need to point all subdomains (wildcard) of the "DNS name", taken from [Obtain GCP PSC service name and DNS name](#step-2-obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) step, to GCP PSC endpoint IP address. This ensures that services/components within your VPC/Network can resolve it properly.

### Add endpoint's PSC Connection ID to service allowlist {#step-5-add-endpoint-id-allowlist}

Once your PSC endpoint is created and the status is "Accepted", you need to add the Endpoint's PSC Connection ID to the allowlist for **each ClickHouse service** you want to access via PSC.

**Contact ClickHouse Support**:
- Provide the Endpoint's PSC Connection IDs to ClickHouse Support
- Specify which ClickHouse services should allow access from this endpoint
- ClickHouse Support will add the Endpoint Connection IDs to the service allowlist

### Connect to ClickHouse via PSC {#step-6-connect-via-psc-endpoint}

After the Endpoint Connection IDs is added to the allowlist, you can connect to your ClickHouse service using the PSC endpoint.

The PSC endpoint format is similar to the public endpoint, but includes a `p` subdomain. For example:

- **Public endpoint**: `h5ju65kv87.mhp0y4dmph.us-east1.gcp.clickhouse-byoc.com`
- **PSC endpoint**: `h5ju65kv87.p.mhp0y4dmph.us-east1.gcp.clickhouse-byoc.com`

</VerticalStepper>
