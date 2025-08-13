---
title: 'Azure Private Link'
sidebar_label: 'Azure Private Link'
slug: /cloud/security/azure-privatelink
description: 'How to set up Azure Private Link'
keywords: ['azure', 'private link', 'privatelink']
doc_type: 'how-to'
---

import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import azure_pe from '@site/static/images/cloud/security/azure-pe.png';
import azure_privatelink_pe_create from '@site/static/images/cloud/security/azure-privatelink-pe-create.png';
import azure_private_link_center from '@site/static/images/cloud/security/azure-private-link-center.png';
import azure_pe_create_basic from '@site/static/images/cloud/security/azure-pe-create-basic.png';
import azure_pe_resource from '@site/static/images/cloud/security/azure-pe-resource.png';
import azure_pe_create_vnet from '@site/static/images/cloud/security/azure-pe-create-vnet.png';
import azure_pe_create_dns from '@site/static/images/cloud/security/azure-pe-create-dns.png';
import azure_pe_create_tags from '@site/static/images/cloud/security/azure-pe-create-tags.png';
import azure_pe_create_review from '@site/static/images/cloud/security/azure-pe-create-review.png';
import azure_pe_ip from '@site/static/images/cloud/security/azure-pe-ip.png';
import azure_pe_view from '@site/static/images/cloud/security/azure-pe-view.png';
import azure_pe_resource_guid from '@site/static/images/cloud/security/azure-pe-resource-guid.png';
import azure_pl_dns_wildcard from '@site/static/images/cloud/security/azure-pl-dns-wildcard.png';
import azure_pe_remove_private_endpoint from '@site/static/images/cloud/security/azure-pe-remove-private-endpoint.png';
import azure_privatelink_pe_filter from '@site/static/images/cloud/security/azure-privatelink-pe-filter.png';
import azure_privatelink_pe_dns from '@site/static/images/cloud/security/azure-privatelink-pe-dns.png';

# Azure Private Link

<ScalePlanFeatureBadge feature="Azure Private Link"/>

This guide shows how to use Azure Private Link to provide private connectivity via a virtual network between Azure (including customer-owned and Microsoft Partner services) and ClickHouse Cloud. Azure Private Link simplifies the network architecture and secures the connection between endpoints in Azure by eliminating data exposure to the public internet.

<Image img={azure_pe} size="lg" alt="Overview of PrivateLink" background='white' />

Unlike AWS and GCP, Azure supports cross-region connectivity via Private Link. This enables you to establish connections between VNets located in different regions where you have ClickHouse services deployed.

:::note
Additional charges may be applied to inter-region traffic. Please check latest Azure documentation.
:::

**Please complete the following steps to enable Azure Private Link:**

1. Obtain Azure connection alias for Private Link
1. Create a Private Endpoint in Azure
1. Add the Private Endpoint GUID to your ClickHouse Cloud organization
1. Add the Private Endpoint GUID to your service(s) allow list
1. Access your ClickHouse Cloud service using Private Link

## Attention {#attention}
ClickHouse attempts to group your services to reuse the same published [Private Link service](https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview) within the Azure region. However, this grouping is not guaranteed, especially if you spread your services across multiple ClickHouse organizations.
If you already have Private Link configured for other services in your ClickHouse organization, you can often skip most of the steps because of that grouping and proceed directly to the final step: [Add the Private Endpoint GUID to your service(s) allow list](#add-private-endpoint-guid-to-services-allow-list).

Find Terraform examples at the ClickHouse [Terraform Provider repository](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/).

## Obtain Azure connection alias for Private Link {#obtain-azure-connection-alias-for-private-link}

### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console}

In the ClickHouse Cloud console, open the service that you would like to connect via PrivateLink, then open the **Settings** menu. Click on the **Set up private endpoint** button. Make a note of the `Service name` and `DNS name`  which will be used for setting up Private Link.

<Image img={azure_privatelink_pe_create} size="lg" alt="Private Endpoints" border />

Make a note of the `Service name` and `DNS name`, it will be needed in the next steps.

### Option 2: API {#option-2-api}

Before you get started, you'll need a ClickHouse Cloud API key. You can [create a new key](/cloud/manage/openapi) or use an existing one.

Once you have your API key, set the following environment variables before running any commands:

```bash
REGION=<region code, use Azure format, for example: westus3>
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

Get your ClickHouse `INSTANCE_ID` by filtering by region, provider and service name:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

Obtain your Azure connection alias and Private DNS hostname for Private Link:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "production-westus3-0-0.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.westus3.azure.privatelinkservice",
  "privateDnsHostname": "xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud"
}
```

Make a note of the `endpointServiceId`. You'll use it in the next step.

## Create a private endpoint in Azure {#create-private-endpoint-in-azure}

:::important
This section covers ClickHouse-specific details for configuring ClickHouse via Azure Private Link. Azure-specific steps are provided as a reference to guide you on where to look, but they may change over time without notice from the Azure cloud provider. Please consider Azure configuration based on your specific use case.  

Please note that ClickHouse is not responsible for configuring the required Azure private endpoints, DNS records.  

For any issues related to Azure configuration tasks, contact Azure Support directly.
:::

In this section, we're going to create a Private Endpoint in Azure. You can use either the Azure Portal or Terraform.

### Option 1: Using Azure Portal to create a private endpoint in Azure {#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure}

In the Azure Portal, open **Private Link Center → Private Endpoints**.

<Image img={azure_private_link_center} size="lg" alt="Open Azure Private Center" border />

Open the Private Endpoint creation dialog by clicking on the **Create** button.

<Image img={azure_private_link_center} size="lg" alt="Open Azure Private Center" border />

---

In the following screen, specify the following options:

- **Subscription** / **Resource Group**: Please choose the Azure subscription and resource group for the Private Endpoint.
- **Name**: Set a name for the **Private Endpoint**.
- **Region**: Choose region where the deployed VNet that will be connected to ClickHouse Cloud via Private Link.

After you have completed the above steps, click the **Next: Resource** button.

<Image img={azure_pe_create_basic} size="md" alt="Create Private Endpoint Basic" border />

---

Select the option **Connect to an Azure resource by resource ID or alias**.

For the **Resource ID or alias**, use the `endpointServiceId` you have obtained from the [Obtain Azure connection alias for Private Link](#obtain-azure-connection-alias-for-private-link) step.

Click **Next: Virtual Network** button.

<Image img={azure_pe_resource} size="md" alt="Private Endpoint Resource Selection" border />

---

- **Virtual network**: Choose the VNet you want to connect to ClickHouse Cloud using Private Link
- **Subnet**: Choose the subnet where Private Endpoint will be created

Optional:

- **Application security group**: You can attach ASG to Private Endpoint and use it in Network Security Groups to filter network traffic to/from Private Endpoint.

Click **Next: DNS** button.

<Image img={azure_pe_create_vnet} size="md" alt="Private Endpoint Virtual Network Selection" border />

Click the **Next: Tags** button.

---

<Image img={azure_pe_create_dns} size="md" alt="Private Endpoint DNS Configuration" border />

Optionally, you can attach tags to your Private Endpoint.

Click the **Next: Review + create** button.

---

<Image img={azure_pe_create_tags} size="md" alt="Private Endpoint Tags" border />

Finally, click the **Create** button.

<Image img={azure_pe_create_review} size="md" alt="Private Endpoint Review" border />

The **Connection status** of the created Private Endpoint will be in **Pending** state. It will change to **Approved** state once you add this Private Endpoint to the service allow list.

Open the network interface associated with Private Endpoint and copy the **Private IPv4 address**(10.0.0.4 in this example), you will need this information in the next steps.

<Image img={azure_pe_ip} size="lg" alt="Private Endpoint IP Address" border />

### Option 2: Using Terraform to create a private endpoint in Azure {#option-2-using-terraform-to-create-a-private-endpoint-in-azure}

Use the template below to use Terraform to create a Private Endpoint:

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

### Obtaining the private endpoint `resourceGuid` {#obtaining-private-endpoint-resourceguid}

In order to use Private Link, you need to add the Private Endpoint connection GUID to your service allow list.

The Private Endpoint resource GUID is only exposed in the Azure Portal. Open the Private Endpoint created in previous step and click **JSON View**:

<Image img={azure_pe_view} size="lg" alt="Private Endpoint View" border />

Under properties, find `resourceGuid` field and copy this value:

<Image img={azure_pe_resource_guid} size="lg" alt="Private Endpoint Resource GUID" border />

## Setting up DNS for Private Link {#setting-up-dns-for-private-link}

You need will need to create a Private DNS zone (`${location_code}.privatelink.azure.clickhouse.cloud`) and attach it to your VNet to access resources via Private Link.

### Create Private DNS zone {#create-private-dns-zone}

**Option 1: Using Azure portal**

Please follow the following guide to [create an Azure private DNS zone using the Azure Portal](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal).

**Option 2: Using Terraform**

Use the following Terraform template to create a Private DNS zone:

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### Create a wildcard DNS record {#create-a-wildcard-dns-record}

Create a wildcard record and point to your Private Endpoint:

**Option 1: Using Azure Portal**

1. Open the `MyAzureResourceGroup` resource group and select the `${region_code}.privatelink.azure.clickhouse.cloud` private zone.
2. Select + Record set.
3. For Name, type `*`.
4. For IP Address, type the IP address you see for Private Endpoint.
5. Select **OK**.

<Image img={azure_pl_dns_wildcard} size="lg" alt="Private Link DNS Wildcard Setup" border />

**Option 2: Using Terraform**

Use the following Terraform template to create a wildcard DNS record:

```json
resource "azurerm_private_dns_a_record" "example" {
  name                = "*"
  zone_name           = var.zone_name
  resource_group_name = var.resource_group_name
  ttl                 = 300
  records             = ["10.0.0.4"]
}
```

### Create a virtual network link {#create-a-virtual-network-link}

To link the private DNS zone to a virtual network, you'll need create a virtual network link.

**Option 1: Using Azure Portal**

Please follow the following guide to [link the virtual network to your private DNS zone](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network).

**Option 2: Using Terraform**

:::note
There are various ways to configure DNS. Please set up DNS according to your specific use case.
:::

You need to point "DNS name", taken from [Obtain Azure connection alias for Private Link](#obtain-azure-connection-alias-for-private-link) step, to Private Endpoint IP address. This ensures that services/components within your VPC/Network can resolve it properly.

### Verify DNS setup {#verify-dns-setup}

`xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud` domain should be pointed to the Private Endpoint IP. (10.0.0.4 in this example).

```bash
nslookup xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud.
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
Name: xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```

## Add the Private Endpoint GUID to your ClickHouse Cloud organization {#add-the-private-endpoint-guid-to-your-clickhouse-cloud-organization}

### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console-1}

To add an endpoint to organization, proceed to the [Add the Private Endpoint GUID to your service(s) allow list](#add-private-endpoint-guid-to-services-allow-list) step. Adding the `Private Endpoint GUID` using the ClickHouse Cloud console to the services allow list automatically adds it to organization.

To remove an endpoint, open **Organization details -> Private Endpoints** and click the delete button to remove the endpoint.

<Image img={azure_pe_remove_private_endpoint} size="lg" alt="Remove Private Endpoint" border />

### Option 2: API {#option-2-api-1}

Set the following environment variables before running any commands:

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint resourceGuid>
REGION=<region code, use Azure format>
```

Set the `ENDPOINT_ID` environment variable using data from the [Obtaining the Private Endpoint `resourceGuid`](#obtaining-private-endpoint-resourceguid) step.

Run the following command to add the Private Endpoint:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "azure",
        "id": "${ENDPOINT_ID:?}",
        "description": "Azure private endpoint",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

You can also run the following command to remove a Private Endpoint:

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

After adding or removing a Private Endpoint, run the following command to apply it to your organization:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## Add the Private Endpoint GUID to your service(s) allow list {#add-private-endpoint-guid-to-services-allow-list}

By default, a ClickHouse Cloud service is not available over a Private Link connection even if the Private Link connection is approved and established. You need to explicitly add the Private Endpoint GUID for each service that should be available using Private Link.

### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console-2}

In the ClickHouse Cloud console, open the service that you would like to connect via PrivateLink then navigate to **Settings**. Enter the `Endpoint ID` obtained from the [previous](#obtaining-private-endpoint-resourceguid) step.

:::note
If you want to allow access from an existing PrivateLink connection, use the existing endpoint drop-down menu.
:::

<Image img={azure_privatelink_pe_filter} size="lg" alt="Private Endpoints Filter" border />

### Option 2: API {#option-2-api-2}

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

Run the following command to add the Private Endpoint to the services allow list:

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

You can also run the following command to remove a Private Endpoint from the services allow list:

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

After adding or removing a Private Endpoint to the services allow list, run the following command to apply it to your organization:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```

## Access your ClickHouse Cloud service using Private Link {#access-your-clickhouse-cloud-service-using-private-link}

Each service with Private Link enabled has a public and private endpoint. In order to connect using Private Link, you need to use a private endpoint which will be `privateDnsHostname`<sup>API</sup> or `DNS name`<sup>console</sup> taken from [Obtain Azure connection alias for Private Link](#obtain-azure-connection-alias-for-private-link).

### Obtaining the private DNS hostname {#obtaining-the-private-dns-hostname}

#### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console-3}

In the ClickHouse Cloud console, navigate to **Settings**. Click on the **Set up private endpoint** button. In the opened flyout, copy the **DNS Name**.

<Image img={azure_privatelink_pe_dns} size="lg" alt="Private Endpoint DNS Name" border />

#### Option 2: API {#option-2-api-3}

Set the following environment variables before running any commands:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

Run the following command:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

You should receive a response similar to the following:

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.privatelink.azure.clickhouse.cloud"
}
```

In this example, connection to the `xxxxxxx.region_code.privatelink.azure.clickhouse.cloud` hostname will be routed to Private Link. Meanwhile, `xxxxxxx.region_code.azure.clickhouse.cloud` will be routed over the internet.

Use the `privateDnsHostname` to connect to your ClickHouse Cloud service using Private Link.

## Troubleshooting {#troubleshooting}

### Test DNS setup {#test-dns-setup}

Run the following command:

```bash
nslookup <dns name>
```
where "dns name" `privateDnsHostname`<sup>API</sup> or `DNS name`<sup>console</sup> from [Obtain Azure connection alias for Private Link](#obtain-azure-connection-alias-for-private-link)

You should receive the following response:

```response
Non-authoritative answer:
Name: <dns name>
Address: 10.0.0.4
```

### Connection reset by peer {#connection-reset-by-peer}

Most likely, the Private Endpoint GUID was not added to the service allow-list. Revisit the [_Add Private Endpoint GUID to your services allow-list_ step](#add-private-endpoint-guid-to-services-allow-list).

### Private Endpoint is in pending state {#private-endpoint-is-in-pending-state}

Most likely, the Private Endpoint GUID was not added to the service allow-list. Revisit the [_Add Private Endpoint GUID to your services allow-list_ step](#add-private-endpoint-guid-to-services-allow-list).

### Test connectivity {#test-connectivity}

If you have problems with connecting using Private Link, check your connectivity using `openssl`. Make sure the Private Link endpoint status is `Accepted`.

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

### Checking private endpoint filters {#checking-private-endpoint-filters}

Set the following environment variables before running any commands:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

Run the following command to check Private Endpoint filters:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
```

## More information {#more-information}

For more information about Azure Private Link, please visit [azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link).
