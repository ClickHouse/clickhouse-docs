---
sidebar_label: Managing API Keys
slug: /en/cloud/manage/openapi
title: Managing API Keys
---

ClickHouse Cloud provides an API utilizing OpenAPI that allows you to programmatically manage your account and aspects of your services.

# Managing API Keys

:::note
This document covers the ClickHouse Cloud API. For database API endpoints, please see [Cloud Endpoints API](/docs/en/cloud/security/cloud-endpoints-api.md)
:::

1. You can use the **API Keys** tab on the left menu to create and manage your API keys.

  ![ClickHouse Cloud API Keys Tab](@site/docs/en/_snippets/images/openapi1.png)

2. The **API Keys** page will initially display a prompt to create your first API key as shown below. After your first key is created, you can create new keys using the `New API Key` button that appears in the top right corner.

  ![Initial API Screen](@site/docs/en/_snippets/images/openapi2.png) 
  
3. To create an API key, specify the key name, permissions for the key, and expiration time, then click `Generate API Key`.

  ![Create API Key](@site/docs/en/_snippets/images/openapi3.png)
  
4. The next screen will display your Key ID and Key secret. Copy these values and put them somewhere safe, such as a vault. The values will not be displayed after you leave this screen.

  ![API Key ID and Key Secret](@site/docs/en/_snippets/images/openapi4.png)

5. The ClickHouse Cloud API uses [HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) to verify the validity of your API keys. Here is an example of how to use your API keys to send requests to the ClickHouse Cloud API using `curl`:

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

6. Returning to the **API Keys** page, you will see the key name, last four characters of the Key ID, permissions, status, expiration date, and creator. You are able to edit the key name, permissions, and expiration from this screen. Keys may also be disabled or deleted form this screen.

:::note
Deleting an API key is a permanent action. Any services using the key will immediately lose access to ClickHouse Cloud.
:::

  ![API Key Management](@site/docs/en/_snippets/images/openapi5.png)

## Endpoints

The [endpoint docs are here](/docs/en/cloud/manage/api/invitations-api-reference.md).  Use your API Key and API Secret with the base URL `https://api.clickhouse.cloud/v1`.
