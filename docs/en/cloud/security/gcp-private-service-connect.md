---
slug: /en/manage/security/gcp-private-service-connect
sidebar_label: GCP Private Service Connect
title: Setting up GCP Private Service Connect
---
import GCPRegions from '@site/docs/en/_snippets/_gcp_regions.md';

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
allow list on an instance level by creating a Support request.

The support request will be covered later in this document.
:::

:::note
GCP Private Service Connect can be enabled only on ClickHouse Cloud Production services
:::


## Supported regions

<GCPRegions/>

Cross-region connectivity is not supported. Producer and consumer regions should be the same.
You will be able to connect from other regions within your VPC if you enable Global access
on the PSC level (see below).

## Setting up PSC
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
  # service attachment, please find all values at https://clickhouse.com/docs/en/manage/security/gcp-private-service-connect#supported-regions
  target = "https://www.googleapis.com/compute/v1/projects/dataplane-production/regions/${var.region}/serviceAttachments/production-${var.region}-clickhouse-cloud"
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

## Reach out to ClickHouse Support

Please open a [support case](https://clickhouse.cloud/support) and provide the following
information about Private Service Connect:
- PSC Connection ID(s) from the **Adding PSC Connection** step
- GCP projectID(s)
- ClickHouse Cloud service URL(s) that should be available via Private Service Connect.  To find the URL(s) click on a service that you need the URL for and open **Connect**.  The cluster hostname will be available:

  ![Cluster URL](@site/docs/en/_snippets/images/connection-details-https.png)


Once this request is processed, the PSC connection Status will change to **Accepted**
and you will be able to connect to your instance using your Private DNS hostname.

For example, if the hostname is `abcd.us-central1.gcp.clickhouse.cloud`, to connect via
Private Service connect link, please use `abcd.us-central1.p.gcp.clickhouse.cloud` as the hostname. 

:::tip
Note the `p` added to the private FQDN `abcd.us-central1.p.gcp.clickhouse.cloud`
:::


## Connect to ClickHouse via Private Service Connect link

### Verify connectivity to ClickHouse instance via Private Service Connect:

```bash
curl https://HOSTNAME.us-central1.p.gcp.clickhouse.cloud:8443
```
```response
Ok.
```

```bash
clickhouse-client --host HOSTNAME.us-central1.p.gcp.clickhouse.cloud \
  --secure --port 9440 \
  --password PASSWORD
```
```response
1
```

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

For detailed information please visit
https://cloud.google.com/vpc/docs/configure-private-service-connect-services


