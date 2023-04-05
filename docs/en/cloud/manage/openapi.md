---
sidebar_label: OpenAPI
slug: /en/manage/openapi
---

# API

The ClickHouse Cloud API uses OpenAPI to allow you to programmatically manage your ClickHouse Cloud account and aspects of your ClickHouse services. 

# Managing API Keys

You can use the **API Keys** tab on the left menu to create and manage your API keys.

# Endpoints

The API is available at https://api.clickhouse.cloud/

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

ClickHouse Cloud accounts have one organization by default. 

## Services

Services refer to ClickHouse instances contained within an account.

## Keys

API keys...

## Members

Members are individuals with access to your ClickHouse Cloud account.

## Invitations

Invitiations reflect individuals that were added by an admin, but have yet to sign into ClickHouse Cloud to accept the invitation and become a member.

## Activities

Activities refer to the [audit log](/docs/en/cloud/security/organization-activity) within your ClickHouse Cloud account. This does not include database activities.
