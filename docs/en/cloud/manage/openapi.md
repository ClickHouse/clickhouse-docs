---
sidebar_label: ClickHouse Cloud API
slug: /en/cloud/manage/openapi
title: ClickHouse Cloud API
---

ClickHouse Cloud provides an API utilizing OpenAPI that allows you to programmatically manage your account and aspects of your services.

:::important
This feature is currently experimental and only available by request. Please reach out to [support](https://clickhouse.cloud/support) to enable access to the ClickHouse Cloud API.  You will not see the **API Keys** menu entry in the ClickHouse Cloud console until support enables the feature for you.
:::

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
  
5. Returning to the **API Keys** page, you will see the key name, last four characters of the Key ID, permissions, status, expiration date, and creator. You are able to edit the key name, permissions and expiration from this screen. Keys may also be disabled or deleted form this screen.

:::note
Deleting an API key is a permanent action. Any services using the key will immediately lose access to ClickHouse Cloud.
:::

  ![API Key Management](@site/docs/en/_snippets/images/openapi5.png)

# Endpoints

The [endpoint swagger docs are here](https://clickhouse.com/docs/en/cloud/manage/api).  Use your API Key and API Secret with the base URL `https://api.clickhouse.cloud/v1`.

# Additional Information

- **Authentication mechanisms** Basic authentication via API key and secret is used for this API.
- **Rate limit** The API has a rate limit of ten (10) requests every ten (10) seconds.
- **Postman** Check out the [Postman](/docs/en/cloud/manage/postman.md) page for instructions on importing this API to Postman.
