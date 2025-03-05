---
sidebar_label: Managing API Keys
slug: /cloud/manage/openapi
title: Managing API Keys
---

import image_01 from '@site/static/images/cloud/manage/openapi1.png';
import image_02 from '@site/static/images/cloud/manage/openapi2.png';
import image_03 from '@site/static/images/cloud/manage/openapi3.png';
import image_04 from '@site/static/images/cloud/manage/openapi4.png';
import image_05 from '@site/static/images/cloud/manage/openapi5.png';

# Managing API Keys

ClickHouse Cloud provides an API utilizing OpenAPI that allows you to programmatically manage your account and aspects of your services.

:::note
This document covers the ClickHouse Cloud API. For database API endpoints, please see [Cloud Endpoints API](//cloud/get-started/query-endpoints.md)
:::

1. You can use the **API Keys** tab on the left menu to create and manage your API keys.

  <img src={image_01} width="50%"/>

2. The **API Keys** page will initially display a prompt to create your first API key as shown below. After your first key is created, you can create new keys using the `New API Key` button that appears in the top right corner.

  <img src={image_02} width="100%"/>
  
3. To create an API key, specify the key name, permissions for the key, and expiration time, then click `Generate API Key`.
<br/>
:::note
Permissions align with ClickHouse Cloud [predefined roles](/cloud/security/cloud-access-management/overview#predefined-roles). The developer role has read-only permissions and the admin role has full read and write permissions.
:::

  <img src={image_03} width="100%"/>

4. The next screen will display your Key ID and Key secret. Copy these values and put them somewhere safe, such as a vault. The values will not be displayed after you leave this screen.

  <img src={image_04} width="100%"/>

5. The ClickHouse Cloud API uses [HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) to verify the validity of your API keys. Here is an example of how to use your API keys to send requests to the ClickHouse Cloud API using `curl`:

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

6. Returning to the **API Keys** page, you will see the key name, last four characters of the Key ID, permissions, status, expiration date, and creator. You are able to edit the key name, permissions, and expiration from this screen. Keys may also be disabled or deleted form this screen.
<br/>
:::note
Deleting an API key is a permanent action. Any services using the key will immediately lose access to ClickHouse Cloud.
:::

  <img src={image_05} width="100%"/>

## Endpoints {#endpoints}

The [endpoint docs are here](/cloud/manage/api/invitations-api-reference.md).  Use your API Key and API Secret with the base URL `https://api.clickhouse.cloud/v1`.
