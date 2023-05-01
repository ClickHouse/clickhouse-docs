---
sidebar_label: Members
title: Members
---

## List organization members

Returns a list of all members in the organization.

| Method | Path |
| :----- | :--- |
| GET | /v1/organizations/:organizationId/members |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | string |  | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| userId | string | Unique user ID. If a user is a member in multiple organizations this ID will stay the same. | 
| name | string | Name of the member as set a personal user profile. | 
| email | string | Email of the member as set in personal user profile. | 
| role | string | Role of the member in the organization. | 
| joinedAt | string | Timestamp the member joined the organization. ISO-8601. | 

#### Sample response

```
{
  "userId": "string",
  "name": "string",
  "email": "string",
  "role": "string",
  "joinedAt": "string"
}
```

## Get member details

Returns a single organization member details.

| Method | Path |
| :----- | :--- |
| GET | /v1/organizations/:organizationId/members/:userId |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | string |  | 
| User ID | string |  | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| userId | string | Unique user ID. If a user is a member in multiple organizations this ID will stay the same. | 
| name | string | Name of the member as set a personal user profile. | 
| email | string | Email of the member as set in personal user profile. | 
| role | string | Role of the member in the organization. | 
| joinedAt | string | Timestamp the member joined the organization. ISO-8601. | 

#### Sample response

```
{
  "userId": "string",
  "name": "string",
  "email": "string",
  "role": "string",
  "joinedAt": "string"
}
```

## Update organization member.

Updates organization member role.

| Method | Path |
| :----- | :--- |
| PATCH | /v1/organizations/:organizationId/members/:userId |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | string |  | 
| User ID | string |  | 

#### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| role | string | Role of the member in the organization. | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| userId | string | Unique user ID. If a user is a member in multiple organizations this ID will stay the same. | 
| name | string | Name of the member as set a personal user profile. | 
| email | string | Email of the member as set in personal user profile. | 
| role | string | Role of the member in the organization. | 
| joinedAt | string | Timestamp the member joined the organization. ISO-8601. | 

#### Sample response

```
{
  "userId": "string",
  "name": "string",
  "email": "string",
  "role": "string",
  "joinedAt": "string"
}
```

## Remove an organization member

Removes a user from the organization

| Method | Path |
| :----- | :--- |
| DELETE | /v1/organizations/:organizationId/members/:userId |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | string |  | 
| User ID | string |  | 

