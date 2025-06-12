---
sidebar_label: 'Members'
title: 'Members'
slug: /cloud/manage/api/members-api-reference
description: 'Cloud API reference documentation for members'
---

## List organization members

Returns a list of all members in the organization.

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/members` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the requested organization. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| userId | string | Unique user ID. If a user is a member in multiple organizations this ID will stay the same. | 
| name | string | Name of the member as set a personal user profile. | 
| email | email | Email of the member as set in personal user profile. | 
| role | string | Role of the member in the organization. | 
| joinedAt | date-time | Timestamp the member joined the organization. ISO-8601. | 


#### Sample response

```
{
  "userId": "string",
  "name": "string",
  "email": "email",
  "role": "string",
  "joinedAt": "date-time"
}
```

## Get member details

Returns a single organization member details.

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/members/{userId}` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization the member is part of. | 
| userId | uuid | ID of the requested user. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| userId | string | Unique user ID. If a user is a member in multiple organizations this ID will stay the same. | 
| name | string | Name of the member as set a personal user profile. | 
| email | email | Email of the member as set in personal user profile. | 
| role | string | Role of the member in the organization. | 
| joinedAt | date-time | Timestamp the member joined the organization. ISO-8601. | 


#### Sample response

```
{
  "userId": "string",
  "name": "string",
  "email": "email",
  "role": "string",
  "joinedAt": "date-time"
}
```

## Update organization member.

Updates organization member role.

| Method | Path |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/members/{userId}` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization the member is part of. | 
| userId | uuid | ID of the user to patch | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| role | string | Role of the member in the organization. | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| userId | string | Unique user ID. If a user is a member in multiple organizations this ID will stay the same. | 
| name | string | Name of the member as set a personal user profile. | 
| email | email | Email of the member as set in personal user profile. | 
| role | string | Role of the member in the organization. | 
| joinedAt | date-time | Timestamp the member joined the organization. ISO-8601. | 


#### Sample response

```
{
  "userId": "string",
  "name": "string",
  "email": "email",
  "role": "string",
  "joinedAt": "date-time"
}
```

## Remove an organization member

Removes a user from the organization

| Method | Path |
| :----- | :--- |
| DELETE | `/v1/organizations/{organizationId}/members/{userId}` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the requested organization. | 
| userId | uuid | ID of the requested user. | 

