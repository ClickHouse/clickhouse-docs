---
sidebar_label: "Azure Private Link"
slug: /en/manage/security/azure-privatelink
---

## Azure Private Link

Azure Private Link provides private connectivity from a virtual network to Azure platform as a service (PaaS), customer-owned, or Microsoft partner services. It simplifies the network architecture and secures the connection between endpoints in Azure by eliminating data exposure to the public internet.

![Overview of PrivateLink](@site/docs/en/cloud/security/images/azure-pe.png)

:::important
By default, a ClickHouse service is not available over a Private Link connection even if the Private Link connection is approved and established; you need explicitly add the Endpoint GUID to the allow list on an instance level by completing [step](#add-endpoint-id-to-services-allow-list) below.
:::

:::note
Azure Private Link can be enabled only on ClickHouse Cloud Production services
:::

Cross-region connectivity is supported in Azure Cloud. Producer and consumer regions should be the same. You will be able to connect from other regions within your VNET if you enable Global access on the PSC level (see below).

The process is split into four steps:

1. Obtain Azure connection alias for Private Endpoint.
1. Create a service endpoint.
1. Add Endpoint GUID to ClickHouse Cloud organization.
1. Add Endpoint GUID to service(s) allow list.

## Obtain Azure connection alias for Private Link

Before you get started, you'll need an API key. You can [create a new key](https://clickhouse.com/docs/en/cloud/manage/openapi) or use an existing one.

### REST API 

Set environment variables before running any commands:

```bash
REGION=<region code, use Azure format>
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
```

:::note
You need at least one instance deployed in the region to perform this step.
:::

Get an instance ID from your region.

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services | jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\") | .id " -r | head -1 | tee instance_id
```

Create an `INSTANCE_ID` environment variable using the ID you received in the previous step:

```bash
INSTANCE_ID=$(cat instance_id)
```

Obtain Azure connection alias and Private DNS hostname for Private Link:

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig | jq  .result 
{
  "endpointServiceId": "production-westus3-0-0.63c890a9-4d32-48cc-a08c-8cd92dfb1ad3.westus3.azure.privatelinkservice",
  ...
}
```

Make a note of the `endpointServiceId`. You'll use it in the next step.

## Create private endpoint

In this section, we're going to create a service endpoint in Azure Cloud.

### Adding a Private Endpoint

First up, we're going to create a Private Link connection.

#### Using Azure portal

In Azure portal, open **Private Link Center->Private Endpoints**.

![Open Azure Private Center](@site/docs/en/cloud/security/images/azure-private-link-center.png)

Open the Private Endpoint creation dialog by clicking on the **Create** button.

![Create PE](@site/docs/en/cloud/security/images/azure-private-link-center.png)

- **Subscription** / **Resource Group**: please choose azure subscription / resource group for Private Endpoint.
- **Name**: set a name for the **Private Endpoint**.
- **Region**: choose region where deployed VNET that will be connected to ClickHouse Cloud via Private Link

Click **Next: Resource** button.

![Create PE](@site/docs/en/cloud/security/images/azure-pe-create-basic.png)

Use `Connect to an Azure resource by resource ID or alias` option and use alias from from [Obtain Azure connection alias for Private Link](#obtain-Azure-service-attachment-for-private-service-connect) step.

- **Resource ID or alias**: use **endpointServiceId** 

Click **Next: Virtual Network** button.

![PE resource](@site/docs/en/cloud/security/images/azure-pe-resource.png)

- **Virtual network**: choose VNET you want to connect to ClickHouse Cloud using Private Link
- **Subnet**: choose subnet where Private Endpoint will be created

Optional: 

- **Application security group**: you can attach ASG to Private Endpoint and use it in Network Security Groups to filter network traffic to/from Private Endpoint.

Click **Next: DNS** button.

![PE network](@site/docs/en/cloud/security/images/azure-create-pe-vnet.png)

Click **Next: Tags** button.

![PE DNS](@site/docs/en/cloud/security/images/azure-pe-create-dns.png)

You can attach tags to Private Endpoint

Click **Next: Review + create** button.

![PE tags](@site/docs/en/cloud/security/images/azure-pe-create-tags.png)

Click **Create** button.

![PE review](@site/docs/en/cloud/security/images/azure-pe-create-review.png)

The **Connection status** of the created Private Endpoint will be in **Pending** state, it will change to **Approved** state once you add this Private Endpoint to instance allow list.

Open network interface associated with Private Endpoint and copy **Private IPv4 address**(10.0.0.4 in this example), you will need this information in the next steps.

#### Using Terraform

```json
resource "azurerm_private_endpoint" "example_clickhouse_cloud" {
  name                = var.pe_name
  location            = var.pe_location
  resource_group_name = var.pe_resource_group_name
  subnet_id           = var.pe_subnet_id

  private_service_connection {
    name                              = "test-pl"
    private_connection_resource_alias = "<data from 'Obtain Azure connection alias for Private Link' step>"
    is_manual_connection              = true
  }
}
```

### Obtaining Private Endpoint resourceGuid

In order to use Private Link, you need to add Private Endpoint connection GUID to instance allow list.

#### Azure portal

Private Endpoint resource GUID is only exposed in Azure portal. Open Private Endpoint created in previous step and click `JSON View`.

![PE GUID](@site/docs/en/cloud/security/images/azure-pe-view.png)

Under properties find `resourceGuid` field and copy this value:

![PE GUID](@site/docs/en/cloud/security/images/azure-pe-resource-guid.png)

## Setting up DNS for Private Link

You need will need to create Private DNS zone ${location_code}.privatelink.azure.clickhouse.cloud and attach it to VNET to access resources via Private Link.

### Create Private DNS zone

#### Using Azure portal

[Create an Azure private DNS zone using the Azure portal](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal)

#### Using terraform

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### Create a wildcard DNS record

Create a wildcard record and point to Private Endpoint.

#### Using Azure portal

1. Open the MyAzureResourceGroup resource group and select the ${region_code}.privatelink.azure.clickhouse.cloud private zone.
2. Select + Record set.
3. For Name, type `*`.
4. For IP Address, type the IP address you see for Private Endpoint.
5. Select OK.

![PE review](@site/docs/en/cloud/security/images/azure-pl-dns-wildcard.png)

#### Using terraform

```json
resource "azurerm_private_dns_a_record" "example" {
  name                = "*"
  zone_name           = var.zone_name
  resource_group_name = var.resource_group_name
  ttl                 = 300
  records             = ["10.0.0.4"]
}
```

### Create a virtual network link

To link the private DNS zone to a virtual network, you create a virtual network link.

#### Using Azure portal

[Link the virtual network](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network)

#### Using terraform

```json
resource "azurerm_private_dns_zone_virtual_network_link" "example" {
  name                  = "test"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = var.zone_name
  virtual_network_id    = var.virtual_network_id
}
```

### Verify DNS setup

Any record within the westus3.privatelink.azure.clickhouse.cloud domain should be pointed to the Private Endpoint IP. (10.0.0.4 in this example). 

```bash
nslookup instance-id.westus3.privatelink.azure.clickhouse.cloud.
Server:		127.0.0.53
Address:	127.0.0.53#53

Non-authoritative answer:
Name:	instance-id.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```

## Add Endpoint ID to ClickHouse Cloud organization

### REST API

Set the following environment variables before running any commands:

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint resourceGuid>
REGION=<region code, use Azure format>
```

Set the `VPC_ENDPOINT` environment variable using data from the [previous step](#obtaining-private-endpoint-resourceguid).

To add an endpoint, run:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "azure",
        "id": "${ENDPOINT_ID:?}",
        "description": "Azure private endpoint"
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
        "cloudProvider": "azure",
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

You need to add an Endpoint ID to the allow-list for each instance that should be available using Private Link.

:::note
This step cannot be done for Development services.
:::

### REST API

Set these environment variables before running any commands:

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint resourceGuid>
INSTANCE_ID=<Instance ID>
```

Execute it for each service that should be available using Private Link. 

To add:

```bash
cat <<EOF | tee pl_config.json
{
  "privateEndpointIds": {
    "add": [
      "${ENDPOINT_ID:?}"
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
      "${ENDPOINT_ID:?}"
    ]
  }
}
EOF
```

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X PATCH -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID?} -d @pl_config.json | jq
```

## Accessing instance using Private Link

Each instance with configured Private Link filters has two endpoints: public and private. In order to connect using Private Link, you need to use a private endpoint(`privateDnsHostname`).

:::note
private DNS hostname is only available from your Azure VNET. Do not try to resolve the DNS host from a machine that resides outside of Azure VNET.
:::

### Getting Private DNS Hostname

#### REST API

Set the following environment variables before running any commands:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig | jq  .result 
```

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.privatelink.azure.clickhouse.cloud"
}
```

In this example, connection to the `xxxxxxx.region_code.privatelink.azure.clickhouse.cloud` hostname will be routed to Private Link. Meanwhile, `xxxxxxx.region_code.azure.clickhouse.cloud` will be routed over the internet.

## Troubleshooting

### Test DNS setup

All DNS records from the `${region_code}.privatelink.azure.clickhouse.cloud.` zone should be pointed to the internal IP address from **Create private endpoint** step. In this example, the region is westus3.

```bash
nslookup abcd.westus3.privatelink.azure.clickhouse.cloud.
```

```response
Non-authoritative answer:
Name:	abcd.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```

### Connection reset by peer

- Most likely, the Endpoint ID was not added to the service allow-list. Revisit the [_Add endpoint ID to services allow-list_ step](#add-endpoint-id-to-services-allow-list).

### Private Endpoint is in Pending state

- Most likely, the Endpoint ID was not added to the service allow-list. Revisit the [_Add endpoint ID to services allow-list_ step](#add-endpoint-id-to-services-allow-list).

### Test connectivity

If you have problems with connecting using Private Link, check your connectivity using `openssl`. Make sure the Private Link endpoint status is `Accepted`:

OpenSSL should be able to connect (see CONNECTED in the output). `errno=104` is expected.

```bash
openssl s_client -connect abcd.westus3.privatelink.azure.clickhouse.cloud.cloud:9440
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

Set the following environment variables before running any commands:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X GET -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} | jq .result.privateEndpointIds
[]
```

## More information

For more detailed information, visit [azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link).
