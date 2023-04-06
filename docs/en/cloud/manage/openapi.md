---
sidebar_label: Control Plane Open API
slug: /en/cloud/manage/openapi
title: Control Plane Open API
---

ClickHouse Cloud provides an API utilizing OpenAPI that allows you to programmatically manage your account and aspects of your services.

:::note
This document covers the Control Plane API. For database API endpoints, please see [Cloud Endpoints API](/docs/en/cloud/security/cloud-endpoints-api.md)
:::

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

Use your API Key and API Secret with the following base URL https://api.clickhouse.cloud/ and endpoints described below.

## Organizations

ClickHouse Cloud accounts have one organization by default. API endpoints require an organization id parameter, which can be found on the **Admin** tab in the UI or using the /v1/organizations endpoint.


| Method | Endpoint                                                                    | Description                                         |
| ------ | --------------------------------------------------------------------------- | --------------------------------------------------- |
| GET    | /v1/organizations/                                                          | Get list of available organizations                 | 
| GET    | /v1/organizations/`organizationId`                                          | Get organization details                            | 
| GET    | /v1/organizations/`organizationId`                                          | Update organization details                         | 


## Services

Services refer to ClickHouse instances contained within an account. 


| Method | Endpoint                                                                    | Description                                         |
| ------ | --------------------------------------------------------------------------- | --------------------------------------------------- |
| GET    | /v1/organizations/`organizationId`/services                                 | List organization services                          |
| POST   | /v1/organizations/`organizationId`/services                                 | Create new services                                 |
| GET    | /v1/organizations/`organizationId`/services/`serviceId`                     | Get service details                                 |
| PATCH  | /v1/organizations/`organizationId`/services/`serviceId`                     | Update service details                              |
| DELETE | /v1/organizations/`organizationId`/services/`serviceId`                     | Delete a service                                    |
| PATCH  | /v1/organizations/`organizationId`/services/`serviceId`/state               | Change service state                                |
| PATCH  | /v1/organizations/`organizationId`/services/`serviceId`/scaling             | Change service auto-scalaing                        |
| PATCH  | /v1/organizations/`organizationId`/services/`serviceId`/password            | Reset default account password                      |
| GET    | /v1/organizations/`organizationId`/services/`serviceId`/backups             | List backups                                        |
| POST   | /v1/organizations/`organizationId`/services/`serviceId`/backups             | Create new backup                                   |
| GET    | /v1/organizations/`organizationId`/services/`serviceId`/backups/`backupId'  | Get backup details                                  |
| DELETE | /v1/organizations/`organizationId`/services/`serviceId`/backups/`backupId'  | Delete a backup.                                    |

## Keys

The following endpoints allow you to manage your API keys. Actions closely follow the manual procedure above.


| Method | Endpoint                                                                    | Description                                         |
| ------ | --------------------------------------------------------------------------- | --------------------------------------------------- |
| GET    | /v1/organizations/`organizationId`/keys                                     | Get list of API keys                                | 
| POST   | /v1/organizations/`organizationId`/keys                                     | Create a new key                                    |  
| GET    | /v1/organizations/`organizationId`/keys/`keyId`                             | Get API key details                                 |
| PATCH  | /v1/organizations/`organizationId`/keys/`keyId`                             | Update API key details                              |
| DELETE | /v1/organizations/`organizationId`/keys/`keyId`                             | Delete an API key                                   |

## Members and Invitations

Members are individuals with access to your ClickHouse Cloud account. Invitiations reflect individuals that were added by an admin, but have yet to sign into ClickHouse Cloud to accept the invitation and become a member.


| Method | Endpoint                                                                    | Description                                         |
| ------ | --------------------------------------------------------------------------- | --------------------------------------------------- |
| GET    | /v1/organizations/`organizationId`/members                                  | List organization members                           | 
| GET    | /v1/organizations/`organizationId`/members/`userId`                         | Get an organization member's  details               |
| PATCH  | /v1/organizations/`organizationId`/members/`userId`                         | Update an organization member's details             |
| DELETE | /v1/organizations/`organizationId`/members/`userId`                         | Remove an organization member                       |
| GET    | /v1/organizations/`organizationId`/invitations                              | List invitations                                    | 
| POST   | /v1/organizations/`organizationId`/invitations                              | Create invitations                                  |
| GET    | /v1/organizations/`organizationId`/invitations/`invitationId`               | Get invitation details                              | 
| DELETE | /v1/organizations/`organizationId`/invitations/`invitationId`               | Delete invitation                                   | 

## Activities

Activities refer to the [audit log](/docs/en/cloud/security/organization-activity) within your ClickHouse Cloud account. This does not include database activities.


| Method | Endpoint                                                                    | Description                                         |
| ------ | --------------------------------------------------------------------------- | --------------------------------------------------- |
| GET    | /v1/organizations/`organizationId`/activities                               | List organization activities                        |
| GET    | /v1/organizations/`organizationId`/activities/`activityId`                  | Get activity details                                |
