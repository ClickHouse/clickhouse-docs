---
title: 'GCP private service connect'
description: 'This document describes how to connect to ClickHouse Cloud using Google Cloud Platform (GCP) Private Service Connect (PSC), and how to disable access to your ClickHouse Cloud services from addresses other than GCP PSC addresses using ClickHouse Cloud IP access lists.'
sidebar_label: 'GCP private service connect'
slug: /manage/security/gcp-private-service-connect
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import gcp_psc_overview from '@site/static/images/cloud/security/gcp-psc-overview.png';
import gcp_privatelink_pe_create from '@site/static/images/cloud/security/gcp-privatelink-pe-create.png';
import gcp_psc_open from '@site/static/images/cloud/security/gcp-psc-open.png';
import gcp_psc_enable_global_access from '@site/static/images/cloud/security/gcp-psc-enable-global-access.png';
import gcp_psc_copy_connection_id from '@site/static/images/cloud/security/gcp-psc-copy-connection-id.png';
import gcp_psc_create_zone from '@site/static/images/cloud/security/gcp-psc-create-zone.png';
import gcp_psc_zone_type from '@site/static/images/cloud/security/gcp-psc-zone-type.png';
import gcp_psc_dns_record from '@site/static/images/cloud/security/gcp-psc-dns-record.png';
import gcp_pe_remove_private_endpoint from '@site/static/images/cloud/security/gcp-pe-remove-private-endpoint.png';
import gcp_privatelink_pe_filters from '@site/static/images/cloud/security/gcp-privatelink-pe-filters.png';
import gcp_privatelink_pe_dns from '@site/static/images/cloud/security/gcp-privatelink-pe-dns.png';

# Private Service Connect {#private-service-connect}

<ScalePlanFeatureBadge feature="GCP PSC"/>

Private Service Connect (PSC) is a Google Cloud networking feature that allows consumers to access managed services privately inside their virtual private cloud (VPC) network. Similarly, it allows managed service producers to host these services in their own separate VPC networks and offer a private connection to their consumers.

Service producers publish their applications to consumers by creating Private Service Connect services. Service consumers access those Private Service Connect services directly through one of these Private Service Connect types.

<Image img={gcp_psc_overview} size="lg" alt="Overview of Private Service Connect" border />

:::important
By default, a ClickHouse service is not available over a Private Service connection even if the PSC connection is approved and established; you need explicitly add the PSC ID to the allow list on an instance level by completing [step](#add-endpoint-id-to-services-allow-list) below.
:::

**Important considerations for using Private Service Connect Global Access**:
1. Regions utilizing Global Access must belong to the same VPC.
1. Global Access must be explicitly enabled at the PSC level (refer to the screenshot below).
1. Ensure that your firewall settings do not block access to PSC from other regions.
1. Be aware that you may incur GCP inter-region data transfer charges.

Cross-region connectivity is not supported. The producer and consumer regions must be the same. However, you can connect from other regions within your VPC by enabling [Global Access](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access) at the Private Service Connect (PSC) level.

**Please complete the following to enable GCP PSC**:
1. Obtain GCP service attachment for Private Service Connect.
1. Create a service endpoint.
1. Add "Endpoint ID" to ClickHouse Cloud service.
1. Add "Endpoint ID" to ClickHouse service allow list.

## Attention {#attention}
ClickHouse attempts to group your services to reuse the same published [PSC endpoint](https://cloud.google.com/vpc/docs/private-service-connect) within the GCP region. However, this grouping is not guaranteed, especially if you spread your services across multiple ClickHouse organizations.
If you already have PSC configured for other services in your ClickHouse organization, you can often skip most of the steps because of that grouping and proceed directly to the final step: [Add "Endpoint ID" to ClickHouse service allow list](#add-endpoint-id-to-services-allow-list).

Find Terraform examples [here](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).

## Before you get started {#before-you-get-started}

:::note
Code examples are provided below to show how to set up Private Service Connect within a ClickHouse Cloud service. In our examples below, we will use:
- GCP region: `us-central1`
- GCP project (customer GCP project): `my-gcp-project`
- GCP private IP address in customer GCP project: `10.128.0.2`
- GCP VPC in customer GCP project: `default`
:::

You'll need to retrieve information about your ClickHouse Cloud service. You can do this either via the ClickHouse Cloud console or the ClickHouse API. If you are going to use the ClickHouse API, please set the following environment variables before proceeding:

```shell
REGION=<Your region code using the GCP format, for example: us-central1>
PROVIDER=gcp
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

You can [create a new key ClickHouse Cloud API key](/cloud/manage/openapi) or use an existing one.

Get your ClickHouse `INSTANCE_ID` by filtering by region, provider and service name:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

:::note
- You can retrieve your Organization ID from ClickHouse console(Organization -> Organization Details).
- You can [create a new key](/cloud/manage/openapi) or use an existing one.
:::

## Obtain GCP service attachment and DNS name for Private Service Connect {#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console}

In the ClickHouse Cloud console, open the service that you would like to connect via Private Service Connect, then open the **Settings** menu. Click on the **Set up private endpoint** button. Make a note of the **Service name** ( `endpointServiceId`) and **DNS name** (`privateDnsHostname`). You'll use them in the next steps.

<Image img={gcp_privatelink_pe_create} size="lg" alt="Private Endpoints" border />

### Option 2: API {#option-2-api}

:::note
You need at least one instance deployed in the region to perform this step.
:::

Obtain GCP service attachment and DNS name for Private Service Connect:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xxxxxxxxxx.us-central1.p.gcp.clickhouse.cloud"
}
```

Make a note of the `endpointServiceId` and `privateDnsHostname`. You'll use them in the next steps.

## Create service endpoint {#create-service-endpoint}

:::important
This section covers ClickHouse-specific details for configuring ClickHouse via GCP PSC(Private Service Connect). GCP-specific steps are provided as a reference to guide you on where to look, but they may change over time without notice from the GCP cloud provider. Please consider GCP configuration based on your specific use case.  

Please note that ClickHouse is not responsible for configuring the required GCP PSC endpoints, DNS records.  

For any issues related to GCP configuration tasks, contact GCP Support directly.
:::

In this section, we're going to create a service endpoint.

### Adding a private service connection {#adding-a-private-service-connection}

First up, we're going to create a Private Service Connection.

#### Option 1: Using Google Cloud console {#option-1-using-google-cloud-console}

In the Google Cloud console, navigate to **Network services -> Private Service Connect**.

<Image img={gcp_psc_open} size="lg" alt="Open Private Service Connect in Google Cloud console" border />

Open the Private Service Connect creation dialog by clicking on the **Connect Endpoint** button.

- **Target**: use **Published service**
- **Target service**: use `endpointServiceId`<sup>API</sup> or `Service name`<sup>console</sup> from [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) step.
- **Endpoint name**: set a name for the PSC **Endpoint name**.
- **Network/Subnetwork/IP address**: Choose the network you want to use for the connection. You will need to create an IP address or use an existing one for the Private Service Connect endpoint. In our example, we pre-created an address with the name **your-ip-address** and assigned IP address `10.128.0.2`
- To make the endpoint available from any region, you can enable the **Enable global access** checkbox.

<Image img={gcp_psc_enable_global_access} size="md" alt="Enable Global Access for Private Service Connect" border />

To create the PSC Endpoint, use the **ADD ENDPOINT** button.

The **Status** column will change from **Pending** to **Accepted** once the connection is approved.

<Image img={gcp_psc_copy_connection_id} size="lg" alt="Copy PSC Connection ID" border />

Copy ***PSC Connection ID***, we are going to use it as ***Endpoint ID*** in the next steps.

#### Option 2: Using Terraform {#option-2-using-terraform}

```json
provider "google" {
  project = "my-gcp-project"
  region  = "us-central1"
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "subnetwork" {
  type = string
  default = "https://www.googleapis.com/compute/v1/projects/my-gcp-project/regions/us-central1/subnetworks/default"
}

variable "network" {
  type = string
  default = "https://www.googleapis.com/compute/v1/projects/my-gcp-project/global/networks/default"
}

resource "google_compute_address" "psc_endpoint_ip" {
  address      = "10.128.0.2"
  address_type = "INTERNAL"
  name         = "your-ip-address"
  purpose      = "GCE_ENDPOINT"
  region       = var.region
  subnetwork   = var.subnetwork
}

resource "google_compute_forwarding_rule" "clickhouse_cloud_psc" {
  ip_address            = google_compute_address.psc_endpoint_ip.self_link
  name                  = "ch-cloud-${var.region}"
  network               = var.network
  region                = var.region
  load_balancing_scheme = ""
  # service attachment
  target = "https://www.googleapis.com/compute/v1/$TARGET" # See below in notes
}

output "psc_connection_id" {
  value       = google_compute_forwarding_rule.clickhouse_cloud_psc.psc_connection_id
  description = "Add GCP PSC Connection ID to allow list on instance level."
}
```

:::note
use `endpointServiceId`<sup>API</sup> or `Service name`<sup>console</sup> from [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) step
:::

## Set private DNS name for endpoint {#set-private-dns-name-for-endpoint}

:::note
There are various ways to configure DNS. Please set up DNS according to your specific use case.
:::

You need to point "DNS name", taken from [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) step, to GCP Private Service Connect endpoint IP address. This ensures that services/components within your VPC/Network can resolve it properly.

## Add Endpoint ID to ClickHouse Cloud organization {#add-endpoint-id-to-clickhouse-cloud-organization}

### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console-1}

To add an endpoint to your organization, proceed to the [Add "Endpoint ID" to ClickHouse service allow list](#add-endpoint-id-to-services-allow-list) step. Adding the `PSC Connection ID` using the ClickHouse Cloud console to services allow list automatically adds it to organization.

To remove an endpoint, open **Organization details -> Private Endpoints** and click the delete button to remove the endpoint.

<Image img={gcp_pe_remove_private_endpoint} size="lg" alt="Remove Private Endpoint from ClickHouse Cloud" border />

### Option 2: API {#option-2-api-1}

Set these environment variables before running any commands:

Replace `ENDPOINT_ID` below by value from **Endpoint ID** from [Adding a Private Service Connection](#adding-a-private-service-connection) step

To add an endpoint, run:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "gcp",
        "id": "${ENDPOINT_ID:?}",
        "description": "A GCP private endpoint",
        "region": "${REGION:?}"
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
        "cloudProvider": "gcp",
        "id": "${ENDPOINT_ID:?}",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

Add/remove Private Endpoint to an organization:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## Add "Endpoint ID" to ClickHouse service allow list {#add-endpoint-id-to-services-allow-list}

You need to add an Endpoint ID to the allow-list for each instance that should be available using Private Service Connect.

### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console-2}

In the ClickHouse Cloud console, open the service that you would like to connect via Private Service Connect, then navigate to **Settings**. Enter the `Endpoint ID` retrieved from the [Adding a Private Service Connection](#adding-a-private-service-connection) step. Click **Create endpoint**.

:::note
If you want to allow access from an existing Private Service Connect connection, use the existing endpoint drop-down menu.
:::

<Image img={gcp_privatelink_pe_filters} size="lg" alt="Private Endpoints Filter" border />

### Option 2: API {#option-2-api-2}

Set these environment variables before running any commands:

Replace **ENDPOINT_ID** below by value from **Endpoint ID** from [Adding a Private Service Connection](#adding-a-private-service-connection) step

Execute it for each service that should be available using Private Service Connect.

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
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```

## Accessing instance using Private Service Connect {#accessing-instance-using-private-service-connect}

Each service with Private Link enabled has a public and private endpoint. In order to connect using Private Link, you need to use a private endpoint which will be `privateDnsHostname` taken from [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect).

### Getting private DNS hostname {#getting-private-dns-hostname}

#### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console-3}

In the ClickHouse Cloud console, navigate to **Settings**. Click on the **Set up private endpoint** button. In the opened flyout, copy the **DNS Name**.

<Image img={gcp_privatelink_pe_dns} size="lg" alt="Private Endpoint DNS Name" border />

#### Option 2: API {#option-2-api-3}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.p.gcp.clickhouse.cloud"
}
```

In this example, connection to the `xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` hostname will be routed to Private Service Connect. Meanwhile, `xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud` will be routed over the internet.

## Troubleshooting {#troubleshooting}

### Test DNS setup {#test-dns-setup}

DNS_NAME - Use `privateDnsHostname` from [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) step

```bash
nslookup $DNS_NAME
```

```response
Non-authoritative answer:
...
Address: 10.128.0.2
```

### Connection reset by peer {#connection-reset-by-peer}

- Most likely, the Endpoint ID was not added to the service allow-list. Revisit the [_Add endpoint ID to services allow-list_ step](#add-endpoint-id-to-services-allow-list).

### Test connectivity {#test-connectivity}

If you have problems with connecting using PSC link, check your connectivity using `openssl`. Make sure the Private Service Connect endpoint status is `Accepted`:

OpenSSL should be able to connect (see CONNECTED in the output). `errno=104` is expected.

DNS_NAME - Use `privateDnsHostname` from [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) step

```bash
openssl s_client -connect ${DNS_NAME}:9440
```

```response
# highlight-next-line
CONNECTED(00000003)
write:errno=104
---
no peer certificate available
---
No client certificate CA names sent
---
SSL handshake has read 0 bytes and written 335 bytes
Verification: OK
---
New, (NONE), Cipher is (NONE)
Secure Renegotiation IS NOT supported
Compression: NONE
Expansion: NONE
No ALPN negotiated
Early data was not sent
Verify return code: 0 (ok)
```

### Checking endpoint filters {#checking-endpoint-filters}

#### REST API {#rest-api}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
[
  "102600141743718403"
]
```

### Connecting to a remote database {#connecting-to-a-remote-database}

Let's say you are trying to use the [MySQL](/sql-reference/table-functions/mysql) or [PostgreSQL](/sql-reference/table-functions/postgresql) table functions in ClickHouse Cloud and connect to your database hosted in GCP. GCP PSC cannot be used to enable this connection securely. PSC is a one-way, unidirectional connection. It allows your internal network or GCP VPC to connect securely to ClickHouse Cloud, but it does not allow ClickHouse Cloud to connect to your internal network.

According to the [GCP Private Service Connect documentation](https://cloud.google.com/vpc/docs/private-service-connect):

> Service-oriented design: Producer services are published through load balancers that expose a single IP address to the consumer VPC network. Consumer traffic that accesses producer services is unidirectional and can only access the service IP address, rather than having access to an entire peered VPC network.

To do this, configure your GCP VPC firewall rules to allow connections from ClickHouse Cloud to your internal/private database service. Check the [default egress IP addresses for ClickHouse Cloud regions](/manage/data-sources/cloud-endpoints-api), along with the [available static IP addresses](https://api.clickhouse.cloud/static-ips.json).

## More information {#more-information}

For more detailed information, visit [cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services).
