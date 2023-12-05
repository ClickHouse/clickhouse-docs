---
slug: /en/manage/security/gcp-private-service-connect
sidebar_label: GCP Private Service Connect
title: Setting up GCP Private Service Connect
---

## Private Service Connect

Private Service Connect is a capability of Google Cloud networking that allows consumers
to access managed services privately from inside their VPC network. Similarly, it allows
managed service producers to host these services in their own separate VPC networks and
offer a private connection to their consumers.

Service producers publish their applications to consumers by creating Private Service
Connect services. Service consumers access those Private Service Connect services directly
through one of these Private Service Connect types.

![Overview of PSC](@site/docs/en/cloud/security/images/gcp-psc-overview.png)

:::important
By default a ClickHouse service is not available via Private Service connect even if the
PSC connection is approved and established; you need explicitly add the PSC ID to the 
allow list on an instance level by completing [step](#add-endpoint-id-to-services-allow-list) below.
:::

:::note
GCP Private Service Connect can be enabled only on ClickHouse Cloud Production services
:::

Cross-region connectivity is not supported. Producer and consumer regions should be the same.
You will be able to connect from other regions within your VPC if you enable Global access
on the PSC level (see below).

The process is split into four steps:

1. Obtain GCP service attachment for Private Service Connect.
2. Create service endpoint.
3. Add Endpoint ID to ClickHouse Cloud organization.
4. Add Endpoint ID to service(s) allow list.


## Obtain GCP service attachment for Private Service Connect

Before you get started, you'll need an API key. You can [create a new key](https://clickhouse.com/docs/en/cloud/manage/openapi), or use existing one.

### REST API 

Set environment variables before running any commands:

```bash
REGION=<region code, please use GCP format>
PROVIDER=gcp
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


Obtain GCP service attachment for Private Service Connect:

```bash
curl --silent --user $KEY_ID:$KEY_SECRET https://api.control-plane.clickhouse-dev.com/v1/organizations/$ORG_ID/services/$INSTANCE_ID/privateEndpointConfig | jq  .result 
{
  "endpointServiceId": "projects/.../regions/xxx/serviceAttachments/...-xxx-clickhouse-cloud",
...
}
```

Make a note of the `endpointServiceId`, you'll use it in the next step.

## Create service endpoint
### Adding a PSC Connection
#### Using Google Cloud console

In the Google Cloud console, navigate to **Network services -> Private Service Connect**

![Open PSC](@site/docs/en/cloud/security/images/gcp-psc-open.png)

Open the Private Service Connect creation dialog by clicking on the **Connect Endpoint** button.


- **Target**: Please use **Published service**
- **Target service**: Please use the entry from the **Service Attachment** column from the **Supported regions** table.
- **Endpoint name**: Please set a name for the PSC **Endpoint name**.
- **Network/Subnetwork/IP address**: Please choose the network you want to use for the connection.  You will need to create an IP address or use an existing one for the Private Service Connect endpoint.
- To make the endpoint available from any region, you can enable the **Enable global access** checkbox.

![Enable Global Access](@site/docs/en/cloud/security/images/gcp-psc-enable-global-access.png)


To create the PSC Endpoint, use the **ADD ENDPOINT** button.

The **Status** column will change from **Pending** to **Accepted** once the connection is approved.

![Accepted](@site/docs/en/cloud/security/images/gcp-psc-copy-connection-id.png)

Please copy **PSC Connection ID** & **IP address**(10.142.0.2 in this example), you will
need this information in next steps.

#### Using Terraform

```json
provider "google" {
  # please specify your project
  project = "my-gcp-project"
  region  = "us-central1"
}

variable "region" {
  type    = string
  default = "asia-southeast1"
}

variable "subnetwork" {
  type = string
  # please use correct link to subnetwork
  # example: "https://www.googleapis.com/compute/v1/projects/my-gcp-project/regions/asia-southeast1/subnetworks/default"
}

variable "network" {
  type = string
  # please use correct link to network
  # example: "https://www.googleapis.com/compute/v1/projects/my-gcp-project/global/networks/default"
}

resource "google_compute_address" "psc_endpoint_ip" {
  #  you can specify IP address if needed
  #  address      = "10.148.0.2"
  address_type = "INTERNAL"
  name         = "clickhouse-cloud-psc-${var.region}"
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
  target = "https://www.googleapis.com/compute/v1/<data from 'Obtain GCP service attachment for Private Service Connect' step>"
}

output "psc_connection_id" {
  value       = google_compute_forwarding_rule.clickhouse_cloud_psc.psc_connection_id
  description = "Please add GCP PSC Connection ID to allow list on instance level."
}
```

## Setting up DNS

Two options are presented, using the Google Cloud console, and using the gcloud CLI.

### Using the Google Cloud console

- Please create Private DNS zone from **Supported regions** part:
- Please open **Network services -> Cloud DNS**.
- Click **Create Zone**:

![Create Zone](@site/docs/en/cloud/security/images/gcp-psc-create-zone.png)

In the Zone Type dialog Please set:
- Zone type: **Private**
- Zone name: please set zone name.
- DNS name: please use the **Private DNS domain** column from the **Supported regions** table for your region.
- Networks: please attach a DNS zone to networks you are planning to use for connections to ClickHouse Cloud via PSC

![Zone Type](@site/docs/en/cloud/security/images/gcp-psc-zone-type.png)

#### Create a wildcard record

Please point it to the IP address created in the **Adding PSC Connection** step.

![Wildcard DNS](@site/docs/en/cloud/security/images/gcp-psc-wildcard-dns.png)


### Using the gcloud CLI


#### Create DNS zone

```bash
gcloud dns \
  --project=_PROJECTID_ \
  managed-zones create ch-cloud-us-central1 \
  --description="Private DNS zone for PSC" \
  --dns-name="us-central1.p.gcp.clickhouse.cloud." \
  --visibility="private" \
  --networks="https://www.googleapis.com/compute/v1/projects/_PROJECTID_/global/networks/default"
```

#### Create wildcard DNS record

```bash
gcloud dns \
  --project=_PROJECTID_ \
  record-sets create *.us-central1.p.gcp.clickhouse.cloud. \
  --zone="ch-cloud-us-central1" \
  --type="A" \
  --ttl="300" \
  --rrdatas="10.128.0.2"
```

### Using Terraform

```json
resource "google_dns_managed_zone" "clickhouse_cloud_private_service_connect" {
  description   = "Private DNS zone for accessing ClickHouse Cloud via Private Service Connect"
  dns_name      = "${var.region}.p.gcp.clickhouse.cloud."
  force_destroy = false
  name          = "clickhouse-cloud-private-service-connect-${var.region}"
  visibility    = "private"
}

resource "google_dns_record_set" "psc-wildcard" {
  managed_zone = google_dns_managed_zone.clickhouse_cloud_private_service_connect.name
  name         = "*.${var.region}.p.gcp.clickhouse.cloud."
  type         = "A"
  rrdatas      = [google_compute_address.psc_endpoint_ip.address]
}
```

## Verify DNS setup

Any record within the us-central1.p.gcp.clickhouse.cloud domain should be pointed
to Private Service Connect Endpoint IP. (10.142.0.2 in this example). 

```bash
ping instance-id.us-central1.p.gcp.clickhouse.cloud.
```
```response
PING instance-id.us-east1.p.gcp.clickhouse.cloud (10.142.0.2) 56(84) bytes of data.
```

## Add Endpoint ID to ClickHouse Cloud organization

### REST API

Set the following environment variables before running any commands:
```bash
PROVIDER=gcp
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
ENDPOINT_ID=<PSC Connection ID from previous step>
REGION=<region code, please use GCP format>
```

Set the `VPC_ENDPOINT` environment variable using data from the previous step.

To add an endpoint, run:
```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "gcp",
        "id": "${ENDPOINT_ID}",
        "description": "A GCP private endpoint",
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
        "cloudProvider": "gcp",
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

You need to add Endpoint ID to allow list to each instance that should be available via Private Service Connect.

:::note
this step cannot be done for Development services
:::

### REST API

Please set environment variables before running curl commands:

```bash
PROVIDER=gcp
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
ENDPOINT_ID=<PSC Connection ID from previous step>
INSTANCE_ID=<Instance ID>
```

Execute it for each service that should be available via Private Service Connect. 

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

## Accessing instance via Private Service Connect

Each instance with configured Private Service Connect filters has 2 endpoints: public and private. In order to connect via Private Service Connect you need to use private endpoint(`privateDnsHostname`).

:::note
private DNS hostname is only available from your GCP VPC, please do not try to resolve DNS host from your laptop / PC that resides outside of GCP VPC.
:::

### Getting Private DNS Hostname

#### REST API

Set the following environment variables before running any commands:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

```bash
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$INSTANCE_ID/privateEndpointConfig | jq  .result 
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.p.gcp.clickhouse.cloud"
}
```

In this example connection to `xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` host name will be routed to Private Service Connect, but `xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud` will be routed via internet.

## Troubleshooting

### Test DNS setup

All DNS records from the `${region}.p.gcp.clickhouse.cloud.` zone should be pointed to
the internal IP address from **Adding PSC Connection** step. In this example the region is
us-central1.

```bash
nslookup abcd.us-central1.p.gcp.clickhouse.cloud.
```
```response
Non-authoritative answer:
Name:	abcd.us-central1.p.gcp.clickhouse.cloud
Address: 10.142.0.2
```

### Connection reset by peer

- Most likely Endpoint ID was not added to service allow list, please visit [step](#add-endpoint-id-to-services-allow-list)

### Test connectivity

If you have problems with connecting via PSC link, please check connectivity using
`openssl`. Make sure Private Service Connect endpoint status is Accepted before doing it:

OpenSSL should be able to connect, (see CONNECTED in the output), `errno=104` is expected

```bash
openssl s_client -connect abcd.us-central1.p.gcp.clickhouse.cloud:9440
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

## More information

For more detailed information please visit [cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services).
