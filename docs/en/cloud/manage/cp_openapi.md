---
sidebar_label: OpenAPI
slug: /en/manage/control-plane-openapi
title: ClickHouse Cloud Control Plane API
---

ClickHouse Cloud provides an API utilizing OpenAPI that allows you to programmatically manage your account and aspects of your services.

:::note This document covers the Control Plane API. For database API endpoints, please see [Cloud Endpoints API](/docs/en/cloud/security/ip-egress-traffic-list)

# Managing API Keys

1. You can use the **API Keys** tab on the left menu to create and manage your API keys.

  ![ClickHouse Cloud API Keys Tab](@site/docs/en/_snippets/images/openapi1.png)

2. The **API Keys** page will initially display a prompt to create your first API key as shown below. After your first key is created, you can create new keys using the `New API Key` button that appears in the top right corner.

  ![Initial API Screen](@site/docs/en/_snippets/images/openapi2.png) 
  
3. To create an API key, specify the key name, permissions for the key and expiration time, then click `Generate API Key`.

  ![Create API Key](@site/docs/en/_snippets/images/openapi3.png)
  
4. The next screen will display your Key ID and Key secret. Copy these values and put them somewhere safe, such as a vault. The values will not be displayed after you leave this screen.

  ![API Key ID and Key Secret](@site/docs/en/_snippets/images/openapi4.png)
  
5. Returning to the **API Keys** page, you will see the key name, last four characters of the Key ID, permissions, status, expiration date, and creator. You are able to edit the key name, permissions and expiration from this screen. Keys may also be disabled or deleted form this screen.

:::note Deleting an API key is a permanent action. Any services using the key will immediately lose access to ClickHouse Cloud.

  ![API Key Management](@site/docs/en/_snippets/images/openapi5.png)


# Endpoints

Use your API Key and API Secret with the following base URL https://api.clickhouse.cloud/ and endpoints described in the table below.

| Endpoint | Description |
|----------|-------------|
| /v1/organizations/ | Get list of available organizations | 
| /v1/organizations/`organizationId` | Get and update organization details | 
| /v1/organizations/`organizationId`/services | List organization services and create new services |
| /v1/organizations/`organizationId`/services/`serviceId` | Get and update service details or delete a service |
| /v1/organizations/`organizationId`/services/`serviceId`/state | Change service state |
| /v1/organizations/`organizationId`/services/`serviceId`/scaling | Change service auto-scalaing |
| /v1/organizations/`organizationId`/services/`serviceId`/password | Reset default account password |
| /v1/organizations/`organizationId`/services/`serviceId`/backups | List and create new backups |
| /v1/organizations/`organizationId`/keys | Get list of API keys and create a new key | 
| /v1/organizations/`organizationId`/keys/`keyId` | Get and update API key details or delete an API key |
| /v1/organizations/`organizationId`/members | List organization members | 
| /v1/organizations/`organizationId`/members/`userId` | Get and update organization details or remove an organization member |
| /v1/organizations/`organizationId`/invitations | List and create invitations | 
| /v1/organizations/`organizationId`/invitations/`invitationId` | Get invitation details or delete invitation | 
| /v1/organizations/`organizationId`/activities | List organization activities |
| /v1/organizations/`organizationId`/activities/`activityId` | Get activity details |

## Organizations

ClickHouse Cloud accounts have one organization by default. API endpoints require an organization id parameter, which can be found on the **Admin** tab in the UI or using the /v1/organizations endpoint.

## Services

Services refer to ClickHouse instances contained within an account. API /services/ endpoints require a serviceId, which can be found on the **Services** tab or using the /v1/organizations/`organizationId`/services endpoint.

## Keys

API keys...

## Members

Members are individuals with access to your ClickHouse Cloud account.

## Invitations

Invitiations reflect individuals that were added by an admin, but have yet to sign into ClickHouse Cloud to accept the invitation and become a member.

## Activities

Activities refer to the [audit log](/docs/en/cloud/security/organization-activity) within your ClickHouse Cloud account. This does not include database activities.
