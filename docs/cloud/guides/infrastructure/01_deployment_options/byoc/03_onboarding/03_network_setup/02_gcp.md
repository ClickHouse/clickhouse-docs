---
title: 'BYOC GCP private networking setup'
slug: /cloud/reference/byoc/onboarding/network-gcp
sidebar_label: 'GCP private networking setup'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'vpc peering', 'gcp', 'private service connect']
description: 'Set up VPC Peering or Private Service Connect for BYOC on GCP'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_private_load_balancer from '@site/static/images/cloud/reference/byoc-private-load-balancer.png';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-gcp-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-gcp-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-gcp-3.png';
import byoc_privatelink from '@site/static/images/cloud/reference/byoc-privatelink.png';
import byoc_privatelink_1 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-1.png';
import byoc_privatelink_2 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-2.png';
import byoc_privatelink_3 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-3.png';
import byoc_privatelink_4 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-4.png';
import gcp_psc_open from '@site/static/images/cloud/security/gcp-psc-open.png';
import gcp_psc_enable_global_access from '@site/static/images/cloud/security/gcp-psc-enable-global-access.png';
import gcp_psc_copy_connection_id from '@site/static/images/cloud/security/gcp-psc-copy-connection-id.png';
import byoc_privatelink_5 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-5.png';
import byoc_privatelink_6 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-6.png';
import gcp_privatelink_pe_filters from '@site/static/images/cloud/security/gcp-privatelink-pe-filters.png';
import gcp_privatelink_pe_dns from '@site/static/images/cloud/security/gcp-privatelink-pe-dns.png';

ClickHouse BYOC on GCP supports two private connection options including VPC Peering and PSC (Private Service Connect).

## Prerequisites {#common-prerequisites}

Common steps required by both VPC peering and PSC.

### Enable private load balancer for ClickHouse BYOC {#step-enable-private-load-balancer-for-clickhouse-byoc}

<Image img={byoc_private_load_balancer} size="md" alt="BYOC Enable Private Load Balancer" border />

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

## Set up PSC (Private Service Connect) {#setup-psc}

GCP PSC (Private Service Connect) provides a secure and private connection to your ClickHouse BYOC services without the need for VPC peering or internet gateways. All traffic flows within the GCP network, ensuring that it never traverses the public internet.

<VerticalStepper headerLevel="h3">

### Enable private link in ClickHouse console {#step-1-enable-private-link}

:::note
Make sure the **private load balancer** is turned on as a prerequisite.
:::

<Image img={byoc_privatelink} size="md" alt="BYOC PrivateLink Enable" />

### Obtain endpoint "Service name" {#step-2-obtain-endpoint-service-name}

1. Open your **BYOC GCP console** (i.e. the GCP account where BYOC infrastructure is created) → Network Services → Private Service Connect → Published services
2. Find the service starting with `clickhouse-cloud-infra` and navigate to its details page.
   <Image img={byoc_privatelink_3} size="md" alt="BYOC PSC Endpoint" border />
   <Image img={byoc_privatelink_4} size="md" alt="BYOC PSC Endpoint" border />

### Create endpoint in your network {#step-3-create-endpoint}

1. Open your **own GCP console** (i.e. the GCP account where your client application is) → Network Services → Private Service Connect → Connected Endpoints.
2. Open the Private Service Connect creation dialog by clicking the "Connect Endpoint" button.
   <Image img={gcp_psc_open} size="md" alt="Open Private Service Connect in Google Cloud console" border />
3. Input the following fields:
   - **Target**: use `Published service`
   - **Target service**: use `Service name` obtained from the last step
   - **Endpoint name**: input a valid endpoint name
   - **Network/Subnetwork**: choose the network you want to use for the connection; this is the network where your client application will be connecting from
   - **IP address**: choose or create a new IP address for the endpoint; the IP address needs to be used by step [Set private DNS name for endpoint](#step-5-set-private-dns-name-for-endpoint)
   - (optional) **Enable global access**: enable it if you want to make the endpoint available from any region
     <Image img={gcp_psc_enable_global_access} size="md" alt="Enable Global Access for Private Service Connect" border />
   - Click "ADD ENDPOINT" button to create the endpoint.

4. The Status column will change from Pending to Accepted once the connection is approved.
5. After creating the endpoint, take a note of the `PSC Connection ID` value. You'll need it for the upcoming step.
   <Image img={gcp_psc_copy_connection_id} size="md" alt="Copy PSC Connection ID" border />

### Add "Endpoint ID" to ClickHouse service allow list {#step-4-add-endpoint-id-to-services-allow-list}

1. In the ClickHouse Cloud console, navigate to the service's Settings page that you would like to connect to via PSC.
2. Click "Set up private endpoint".
3. In the opened flyout, enter the `Endpoint ID` obtained from the last step with an optional description.
4. Click "Create endpoint".

:::note
If you want to allow access from an existing PSC connection, use the existing endpoint dropdown menu.
The dropdown will show the existing PSC connections to the services within the same infrastructure.
:::
<Image img={gcp_privatelink_pe_filters} size="md" alt="Private Endpoints Filter" border />

### Set private DNS name for endpoint {#step-5-set-private-dns-name-for-endpoint}

:::note
There are various ways to configure DNS. Please set up DNS according to your specific use case.
:::

You need to point all subdomains (wildcard) of the "DNS name" to GCP PSC endpoint IP address. This ensures that services/components within your VPC/Network can resolve it properly.

### Access an instance using PSC {#step-6-connect-via-psc}

1. In the ClickHouse Cloud console, navigate to service's Settings page.
2. Click "Set up private endpoint".
3. In the opened flyout, copy the `DNS name`.
   <Image img={gcp_privatelink_pe_dns} size="md" alt="Private Endpoint DNS Name" border />
   Access to ClickHouse services via PSC is controlled at two levels:
   1. **Istio Authorization Policy**: ClickHouse Cloud's service-level authorization policies
   2. **VPC Endpoint Security Group**: The security group attached to your VPC endpoint controls which resources in your VPC can use the endpoint

</VerticalStepper>
