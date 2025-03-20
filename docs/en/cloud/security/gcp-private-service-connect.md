---
title: "GCP Private Service Connect"
description: "This document describes how to connect to ClickHouse Cloud using Google Cloud Platform (GCP) Private Service Connect (PSC), and how to disable access to your ClickHouse Cloud services from addresses other than GCP PSC addresses using ClickHouse Cloud IP access lists."
sidebar_label: "GCP Private Service Connect"
slug: /en/manage/security/gcp-private-service-connect
---

## Private Service Connect

Private Service Connect (PSC) is a Google Cloud networking feature that allows consumers to access managed services privately inside their virtual private cloud (VPC) network. Similarly, it allows managed service producers to host these services in their own separate VPC networks and offer a private connection to their consumers.

Service producers publish their applications to consumers by creating Private Service Connect services. Service consumers access those Private Service Connect services directly through one of these Private Service Connect types.

![Overview of PSC](@site/docs/en/cloud/security/images/gcp-psc-overview.png)

:::important
By default, a ClickHouse service is not available over a Private Service connection even if the PSC connection is approved and established; you need explicitly add the PSC ID to the allow list on an instance level by completing [step](#add-endpoint-id-to-services-allow-list) below.
:::

:::note
GCP Private Service Connect can be enabled only on ClickHouse Cloud Production services
:::

Cross-region connectivity is not supported. The producer and consumer regions must be the same. However, you can connect from other regions within your VPC by enabling [Global Access](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access) at the Private Service Connect (PSC) level.

:::note
Important considerations for using Private Service Connect Global Access:
1. Regions utilizing Global Access must belong to the same VPC.
2. Global Access must be explicitly enabled at the PSC level (refer to the screenshot below).
3. Ensure that your firewall settings do not block access to PSC from other regions.
4. Be aware that you may incur GCP inter-region data transfer charges.

The process is split into four steps:

1. Obtain GCP service attachment for Private Service Connect.
1. Create a service endpoint.
1. Add Endpoint ID to ClickHouse Cloud organization.
1. Add Endpoint ID to service(s) allow list.

:::note
In our examples below, we will use:
 - GCP region: `us-central1`
 - GCP project (customer GCP project): `my-gcp-project`
 - GCP private IP address in customer GCP project: `10.128.0.2`
 - GCP VPC in customer GCP project: `default`
 
Code examples are provided below to show how to set up Private Service Connect within a ClickHouse Cloud service.
:::

## Before you get started

You’ll need to retrieve information about your ClickHouse Cloud service. You can do this either via the ClickHouse Cloud Console or the ClickHouse API. If you are going to use the ClickHouse API, please set the following environment variables before proceeding:

```bash
export REGION=us-central1
export PROVIDER=gcp
export KEY_ID=<Key ID>
export KEY_SECRET=<Key secret>
export ORG_ID=<ClickHouse organization ID>
export INSTANCE_ID=$(curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\") | .id " -r | head -1)
```
:::note
 - You can retrieve your Organization ID from ClickHouse console(Organization -> Organization Details).
 - You can [create a new key](https://clickhouse.com/docs/en/cloud/manage/openapi) or use an existing one.
:::

## Obtain GCP service attachment and DNS name for Private Service Connect

### Option 1: ClickHouse Cloud console

In the ClickHouse Cloud console, open the service that you would like to connect via Private Service Connect, then open the **Settings** menu. Click on the **Set up private endpoint** button. Make a note of the **Service name** ( `endpointServiceId`) and **DNS name** (`privateDnsHostname`). You'll use them in the next steps.


![Private Endpoints](./images/gcp-privatelink-pe-create.png)

### Option 2: API 

:::note
You need at least one instance deployed in the region to perform this step.
:::

Obtain GCP service attachment and DNS name for Private Service Connect:

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result 
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xb164akwxw.us-central1.p.gcp.clickhouse.cloud"
}
```

Make a note of the `endpointServiceId` and `privateDnsHostname`. You'll use them in the next steps.

## Create service endpoint

In this section, we're going to create a service endpoint.

### Adding a Private Service Connection

First up, we're going to create a Private Service Connection.

#### Option 1: Using Google Cloud console

In the Google Cloud console, navigate to **Network services -> Private Service Connect**.

![Open PSC](@site/docs/en/cloud/security/images/gcp-psc-open.png)

Open the Private Service Connect creation dialog by clicking on the **Connect Endpoint** button.

- **Target**: use **Published service**
- **Target service**: use `endpointServiceId` from [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) step.
- **Endpoint name**: set a name for the PSC **Endpoint name**.
- **Network/Subnetwork/IP address**: Choose the network you want to use for the connection. You will need to create an IP address or use an existing one for the Private Service Connect endpoint. In our example, we pre-created an address with the name **your-ip-address** and assigned IP address `10.128.0.2`
- To make the endpoint available from any region, you can enable the **Enable global access** checkbox.

![Enable Global Access](@site/docs/en/cloud/security/images/gcp-psc-enable-global-access.png)

To create the PSC Endpoint, use the **ADD ENDPOINT** button.

The **Status** column will change from **Pending** to **Accepted** once the connection is approved.

![Accepted](@site/docs/en/cloud/security/images/gcp-psc-copy-connection-id.png)

Copy ***PSC Connection ID***, we are going to use it as ***Endpoint ID*** in the next steps.

#### Option 2: Using Terraform

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
TARGET - Use `endpointServiceId` from [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) step
:::

## Setting up DNS

Two options are presented, using the Google Cloud console and using the `gcloud` CLI.

### Option 1: Using the Google Cloud console

- Create a Private DNS zone from **Supported regions**.
- Open **Network services -> Cloud DNS**.
- Select **Create Zone**:

![Create Zone](@site/docs/en/cloud/security/images/gcp-psc-create-zone.png)

In the Zone Type dialog, set:

- Zone type: **Private**
- Zone name: input an appropriate zone name.
- DNS name: use the **Private DNS domain** column from the **Supported regions** table for your region.
- Networks: attach a DNS zone to networks you are planning to use for connections to ClickHouse Cloud using PSC.

![Zone Type](@site/docs/en/cloud/security/images/gcp-psc-zone-type.png)

#### Create DNS record in private DNS zone

Point it to the IP address created in the [Adding a Private Service Connection](#adding-a-private-service-connection) step

![DNS Record](@site/docs/en/cloud/security/images/gcp-psc-dns-record.png)

### Option 2: Using the `gcloud` CLI

#### Create DNS zone

```bash
gcloud dns \
  --project=my-gcp-project \
  managed-zones create ch-cloud-us-central1 \
  --description="Private DNS zone for PSC" \
  --dns-name="us-central1.p.gcp.clickhouse.cloud." \
  --visibility="private" \
  --networks="https://www.googleapis.com/compute/v1/projects/my-gcp-project/global/networks/default"
```

#### Create DNS Record

```bash
gcloud dns \
  --project=my-gcp-project \
  record-sets create $DNS_RECORD \
  --zone="ch-cloud-us-central1" \
  --type="A" \
  --ttl="300" \
  --rrdatas="10.128.0.2"
```
:::note
DNS_RECORD - use `privateDnsHostname` from [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) step
:::

### Option 3: Using Terraform

```json
variable "ch_dns_record" {
  type    = string
  default = "$DNS_NAME" # See below in notes
}

resource "google_dns_managed_zone" "clickhouse_cloud_private_service_connect" {
  description   = "Private DNS zone for accessing ClickHouse Cloud using Private Service Connect"
  dns_name      = "${var.region}.p.gcp.clickhouse.cloud."
  force_destroy = false
  name          = "clickhouse-cloud-private-service-connect-${var.region}"
  visibility    = "private"
}

resource "google_dns_record_set" "psc_dns_record" {
  managed_zone = google_dns_managed_zone.clickhouse_cloud_private_service_connect.name
  name         = "${var.ch_dns_record}"
  type         = "A"
  rrdatas      = [google_compute_address.psc_endpoint_ip.address]
}
```

:::note
DNS_NAME - Use `privateDnsHostname` from [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) step
:::

## Verify DNS setup

DNS_RECORD - Use `privateDnsHostname` from [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) step

```bash
ping $DNS_RECORD
```

## Add Endpoint ID to ClickHouse Cloud organization

### Option 1: ClickHouse Cloud console

To add an endpoint to your organization, proceed to the [Add Endpoint ID to service(s) allow list](#add-endpoint-id-to-services-allow-list) step. Adding the `PSC Connection ID` using the ClickHouse Cloud console to services allow list automatically adds it to organization.

To remove an endpoint, open **Organization details -> Private Endpoints** and click the delete button to remove the endpoint.

![endpoints](./images/gcp-pe-remove-private-endpoint.png)

### Option 2: API

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
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X PATCH -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?} -d @pl_config_org.json
```

## Add Endpoint ID to service(s) allow list

You need to add an Endpoint ID to the allow-list for each instance that should be available using Private Service Connect.

:::note
This step cannot be done for Development services.
:::

### Option 1: ClickHouse Cloud console

In the ClickHouse Cloud console, open the service that you would like to connect via Private Service Connect, then navigate to **Settings**. Enter the `Endpoint ID` retrieved from the [Adding a Private Service Connection](#adding-a-private-service-connection) step. Click **Create endpoint**.

:::note
If you want to allow access from an existing Private Service Connect connection, use the existing endpoint drop-down menu.
:::

![Private Endpoints](./images/gcp-privatelink-pe-filters.png)


### Option 2: API

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
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X PATCH -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} -d @pl_config.json | jq
```

## Accessing instance using Private Service Connect

Each instance with configured Private Service Connect filters has two endpoints: public and private. In order to connect using Private Service Connect, you need to use a private endpoint, see use `endpointServiceId` from [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) step

:::note
Private DNS hostname is only available from your GCP VPC. Do not try to resolve the DNS host from a machine that resides outside of GCP VPC.
:::

### Getting Private DNS Hostname

#### Option 1: ClickHouse Cloud console

In the ClickHouse Cloud console, navigate to **Settings**. Click on the **Set up private endpoint** button. In the opened flyout, copy the **DNS Name**.

![Private Endpoints](./images/gcp-privatelink-pe-dns.png)


#### Option 2: API

```bash
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$INSTANCE_ID/privateEndpointConfig | jq  .result 
```

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.p.gcp.clickhouse.cloud"
}
```

In this example, connection to the `xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` hostname will be routed to Private Service Connect. Meanwhile, `xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud` will be routed over the internet.

## Troubleshooting

### Test DNS setup

DNS_NAME - Use `privateDnsHostname` from [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) step

```bash
nslookup $DNS_NAME
```

```response
Non-authoritative answer:
...
Address: 10.128.0.2
```

### Connection reset by peer

- Most likely, the Endpoint ID was not added to the service allow-list. Revisit the [_Add endpoint ID to services allow-list_ step](#add-endpoint-id-to-services-allow-list).

### Test connectivity

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

### Checking Endpoint filters

#### REST API

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
[
  "102600141743718403"
]
```

### Connecting to a remote database 

Let's say you are trying to use the [MySQL](../../sql-reference/table-functions/mysql.md) or [PostgreSQL](../../sql-reference/table-functions/postgresql.md) table functions in ClickHouse Cloud and connect to your database hosted in GCP. GCP PSC cannot be used to enable this connection securely. PSC is a one-way, unidirectional connection. It allows your internal network or GCP VPC to connect securely to ClickHouse Cloud, but it does not allow ClickHouse Cloud to connect to your internal network.

According to the [GCP Private Service Connect documentation](https://cloud.google.com/vpc/docs/private-service-connect):

> Service-oriented design: Producer services are published through load balancers that expose a single IP address to the consumer VPC network. Consumer traffic that accesses producer services is unidirectional and can only access the service IP address, rather than having access to an entire peered VPC network.

To do this, configure your GCP VPC firewall rules to allow connections from ClickHouse Cloud to your internal/private database service. Check the [default egress IP addresses for ClickHouse Cloud regions](https://clickhouse.com/docs/en/manage/security/cloud-endpoints-api), along with the [available static IP addresses](https://api.clickhouse.cloud/static-ips.json).

## More information

For more detailed information, visit [cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services).
