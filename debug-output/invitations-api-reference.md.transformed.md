---
sidebar_label: 'Invitations'
title: 'Invitations'
slug: /cloud/manage/api/invitations-api-reference
description: 'Cloud API reference documentation for invitations'
---

## List all invitations

Returns list of all organization invitations.

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/invitations` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the requested organization. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| role | string | Role of the member in the organization. | 
| id | uuid | Unique invitation ID. | 
| email | email | Email of the invited user. Only a user with this email can join using the invitation. The email is stored in a lowercase form. | 
| createdAt | date-time | Invitation creation timestamp. ISO-8601. | 
| expireAt | date-time | Timestamp the invitation expires. ISO-8601. | 


#### Sample response

```
{
  "role": "string",
  "id": "uuid",
  "email": "email",
  "createdAt": "date-time",
  "expireAt": "date-time"
}
```

## Create an invitation

Creates organization invitation.

| Method | Path |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/invitations` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization to invite a user to. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| email | string | Email of the invited user. Only a user with this email can join using the invitation. The email is stored in a lowercase form. | 
| role | string | Role of the member in the organization. | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| role | string | Role of the member in the organization. | 
| id | uuid | Unique invitation ID. | 
| email | email | Email of the invited user. Only a user with this email can join using the invitation. The email is stored in a lowercase form. | 
| createdAt | date-time | Invitation creation timestamp. ISO-8601. | 
| expireAt | date-time | Timestamp the invitation expires. ISO-8601. | 


#### Sample response

```
{
  "role": "string",
  "id": "uuid",
  "email": "email",
  "createdAt": "date-time",
  "expireAt": "date-time"
}
```

## Get invitation details

Returns details for a single organization invitation.

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/invitations/{invitationId}` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the requested organization. | 
| invitationId | uuid | ID of the requested organization. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| role | string | Role of the member in the organization. | 
| id | uuid | Unique invitation ID. | 
| email | email | Email of the invited user. Only a user with this email can join using the invitation. The email is stored in a lowercase form. | 
| createdAt | date-time | Invitation creation timestamp. ISO-8601. | 
| expireAt | date-time | Timestamp the invitation expires. ISO-8601. | 


#### Sample response

```
{
  "role": "string",
  "id": "uuid",
  "email": "email",
  "createdAt": "date-time",
  "expireAt": "date-time"
}
```

## Delete organization invitation

Deletes a single organization invitation.

| Method | Path |
| :----- | :--- |
| DELETE | `/v1/organizations/{organizationId}/invitations/{invitationId}` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that has the invitation. | 
| invitationId | uuid | ID of the requested organization. | 

