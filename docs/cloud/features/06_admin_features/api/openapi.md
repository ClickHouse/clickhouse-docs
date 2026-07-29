---
sidebar_label: 'Managing API keys'
slug: /cloud/manage/openapi
title: 'Managing API keys'
description: 'ClickHouse Cloud provides an API utilizing OpenAPI that allows you to programmatically manage your account and aspects of your services.'
doc_type: 'guide'
keywords: ['api', 'openapi', 'rest api', 'documentation', 'cloud management']
---

import image_01 from '@site/static/images/cloud/manage/openapi1.png';
import image_02 from '@site/static/images/cloud/manage/openapi2.png';
import image_03 from '@site/static/images/cloud/manage/openapi3.png';
import image_04 from '@site/static/images/cloud/manage/openapi4.png';
import image_05 from '@site/static/images/cloud/manage/openapi5.png';
import specific_locations from '@site/static/images/cloud/guides/query-endpoints/specific-locations.png';
import Image from '@theme/IdealImage';

ClickHouse Cloud provides an API utilizing OpenAPI that allows you to programmatically manage your account and aspects of your services.

:::note
This document covers the ClickHouse Cloud API. For database API endpoints, please see [Cloud Endpoints API](/cloud/get-started/query-endpoints)
:::

<VerticalStepper headerLevel="h3">

### Open the API Keys page {#open-api-keys-page}

You can use the **API Keys** tab on the left menu to create and manage your API keys.

<Image img={image_01} size="sm" alt="API Keys tab" border/>

### Start creating an API key {#start-creating-api-key}

The **API Keys** page will initially display a prompt to create your first API key as shown below. After your first key is created, you can create new keys using the `New API Key` button that appears in the top right corner.

<Image img={image_02} size="md" alt="API Keys page" border/>

### Configure the API key {#configure-api-key}

Specify the key name, permissions for the key, and expiration time.

:::note
Permissions align with ClickHouse Cloud [predefined roles](/cloud/security/console-roles). The developer role has read-only permissions for assigned services and the admin role has full read and write permissions.
:::

:::tip Query API Endpoints
To use API keys with [Query API Endpoints](/cloud/get-started/query-endpoints), set Organization Role to `Member` (minimum) and grant Service Role access to `Query Endpoints`.
:::

<Image img={image_03} size="md" alt="Create API key form" border/>

### Add allowed IP addresses {#add-allowed-ip-addresses}

To restrict which clients can use the API key, in the **Allow access to this API Key** section, select **Specific locations**. Enter an IP address or CIDR range, such as `203.0.113.1` or `203.0.113.0/24`, and add additional entries as needed.

Query API endpoints respect API key-level IP allowlists. Because requests are proxied from within ClickHouse's infrastructure, service-level IP allowlists do not apply. See [IP Access Control](/cloud/features/query-api-endpoints#ip-access-control) for details.

<Image img={specific_locations} size="md" alt="Allowed IP addresses configured for an API key" border/>

Click **Generate API Key** when you have finished configuring the key.

### Save the API key credentials {#save-api-key-credentials}

The next screen will display your Key ID and Key secret. Copy these values and put them somewhere safe, such as a vault. The values won't be displayed after you leave this screen.

<Image img={image_04} size="md" alt="API key details" border/>

### Authenticate API requests {#authenticate-api-requests}

The ClickHouse Cloud API uses [HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) to verify the validity of your API keys. Here is an example of how to use your API keys to send requests to the ClickHouse Cloud API using `curl`:

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

### Manage existing API keys {#manage-existing-api-keys}

Returning to the **API Keys** page, you will see the key name, last four characters of the Key ID, permissions, status, expiration date, and creator. You're able to edit the key name, permissions, and expiration from this screen. Keys may also be disabled or deleted from this screen.

:::note
Deleting an API key is a permanent action. Any services using the key will immediately lose access to ClickHouse Cloud.
:::

<Image img={image_05} size="md" alt="API Keys management page" border/>

</VerticalStepper>

## Endpoints {#endpoints}

Refer details on endpoints, refer to the [API reference](https://clickhouse.com/docs/cloud/manage/api/swagger). 
Use your API Key and API Secret with the base URL `https://api.clickhouse.cloud/v1`.
