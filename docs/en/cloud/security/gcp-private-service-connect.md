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
By default ClickHouse service is not available via Private Service connect even if PSC connection is approved and established, you need explicitly add PSC ID to allow list on instance level by creating Support request.
:::


## Supported regions

<GCPRegions/>

Cross-region connectivity is not supported, produced and consumer regions should be the same, but you will be able to connect from other regions within your VPC if you enable Global access on PSC level.(see below)

## Setting up PSC
### Adding PSC Connection

In the Google Cloud console, navigate to **Network services -> Private Service Connect**

![Open PSC](@site/docs/en/cloud/security/images/gcp-psc-open.png)

Open Private Service Connect creation dialog by clicking on the **Connect Endpoint** button.


- **Target**: please use **Published service**
- **Target service**: Please use the Service Attachment column from **Supported regions**
- **Endpoint name**: please set name for PSC Endpoint.
- **Network/Subnetwork/IP address**: please choose the network you want to use for connection.  You will need to create an IP address or use an existing one for the Private Service Connect endpoint.
- To make the endpoint available from any region, you can enable the **Enable global access** checkbox.

![Enable Global Access](@site/docs/en/cloud/security/images/gcp-psc-enable-global-access.png)


To create PSC Endpoint, use the **ADD ENDPOINT** button.

Status column will change from **Pending** to **Accepted** once connection is approved.

![Accepted](@site/docs/en/cloud/security/images/gcp-psc-copy-connection-id.png)

Please copy **PSC Connection ID** & **IP address**(10.142.0.2 in this example), you will
need this information in next steps.

For detailed information please visit
https://cloud.google.com/vpc/docs/configure-private-service-connect-services

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

## Verify DNS setup

Any record within the us-central1.p.gcp.clickhouse.cloud domain should be pointed
to Private Service Connect Endpoint IP. (10.142.0.2 in this example). 

```bash
ping instance-id.us-central1.p.gcp.clickhouse.cloud.
```
```response
PING instance-id.us-east1.p.gcp.clickhouse.cloud (10.142.0.2) 56(84) bytes of data.
```

## Provide information to ClickHouse support

Please open support case and provide information about Private Service Connect:
- PSC Connection ID(s) from **Adding PSC Connection** step
- GCP projectID(s)
- ClickHouse instance ID(s) that should be available via Private Service Connect

Once this request is processed, PSC connection Status will change to **Accepted**
and you will be able to connect to your instance using Private DNS hostname.

For example, the hostname is abcd.us-central1.gcp.clickhouse.cloud, to connect via
Private Service connect link, please use abcd.us-central1.p.gcp.clickhouse.cloud hostname. 


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




