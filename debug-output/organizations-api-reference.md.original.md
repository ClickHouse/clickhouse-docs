---
sidebar_label: 'Organizations'
title: 'Organizations'
slug: /cloud/manage/api/organizations-api-reference
description: 'Cloud API reference documentation for organizations'
---

## Get list of available organizations

Returns a list with a single organization associated with the API key in the request.

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations` |

### Request


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique organization ID. | 
| createdAt | date-time | The timestamp the organization was created. ISO-8601. | 
| name | string | Name of the organization. | 
| privateEndpoints | array | List of private endpoints for organization | 
| byocConfig | array | BYOC configuration for the organization | 


#### Sample response

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## Get organization details

Returns details of a single organization. In order to get the details, the auth key must belong to the organization.

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the requested organization. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique organization ID. | 
| createdAt | date-time | The timestamp the organization was created. ISO-8601. | 
| name | string | Name of the organization. | 
| privateEndpoints | array | List of private endpoints for organization | 
| byocConfig | array | BYOC configuration for the organization | 


#### Sample response

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## Update organization details

Updates organization fields. Requires ADMIN auth key role.

| Method | Path |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization to update. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| name | string | Name of the organization. | 
| privateEndpoints |  |  | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique organization ID. | 
| createdAt | date-time | The timestamp the organization was created. ISO-8601. | 
| name | string | Name of the organization. | 
| privateEndpoints | array | List of private endpoints for organization | 
| byocConfig | array | BYOC configuration for the organization | 


#### Sample response

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## List of organization activities

Returns a list of all organization activities.

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/activities` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the requested organization. | 
| from_date | date-time | A starting date for a search | 
| to_date | date-time | An ending date for a search | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | string | Unique activity ID. | 
| createdAt | date-time | Timestamp of the activity. ISO-8601. | 
| type | string | Type of the activity. | 
| actorType | string | Type of the actor: 'user', 'support', 'system', 'api'. | 
| actorId | string | Unique actor ID. | 
| actorDetails | string | Additional information about the actor. | 
| actorIpAddress | string | IP address of the actor. Defined for 'user' and 'api' actor types. | 
| organizationId | string | Scope of the activity: organization ID this activity is related to. | 
| serviceId | string | Scope of the activity: service ID this activity is related to. | 


#### Sample response

```
{
  "id": "string",
  "createdAt": "date-time",
  "type": "string",
  "actorType": "string",
  "actorId": "string",
  "actorDetails": "string",
  "actorIpAddress": "string",
  "organizationId": "string",
  "serviceId": "string"
}
```

## Organization activity

Returns a single organization activity by ID.

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/activities/{activityId}` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the requested organization. | 
| activityId | string | ID of the requested activity. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | string | Unique activity ID. | 
| createdAt | date-time | Timestamp of the activity. ISO-8601. | 
| type | string | Type of the activity. | 
| actorType | string | Type of the actor: 'user', 'support', 'system', 'api'. | 
| actorId | string | Unique actor ID. | 
| actorDetails | string | Additional information about the actor. | 
| actorIpAddress | string | IP address of the actor. Defined for 'user' and 'api' actor types. | 
| organizationId | string | Scope of the activity: organization ID this activity is related to. | 
| serviceId | string | Scope of the activity: service ID this activity is related to. | 


#### Sample response

```
{
  "id": "string",
  "createdAt": "date-time",
  "type": "string",
  "actorType": "string",
  "actorId": "string",
  "actorDetails": "string",
  "actorIpAddress": "string",
  "organizationId": "string",
  "serviceId": "string"
}
```
