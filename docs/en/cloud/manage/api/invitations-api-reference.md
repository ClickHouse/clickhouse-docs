---
sidebar_label: Invitations
---

## List all invitations

Returns list of all organization invitations.

| Method | Path |
| :----- | :--- |
| GET | /v1/organizations/:organizationId/invitations |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | string |  | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| role | string | Role of the member in the organization. | 
| id | string | Unique invitation ID. | 
| email | string | Email of the invited user. Only a user with this email can join using the invitation. The email is stored in a lowercase form. | 
| createdAt | string | Invitation creation timestamp. ISO-8601. | 
| expiresAt | string | Timestamp the invitation expires. ISO-8601. | 

#### Sample response

```
{
  "role": "string",
  "id": "string",
  "email": "string",
  "createdAt": "string",
  "expiresAt": "string"
}
```

## Create an invitation

Creates organization invitation.

| Method | Path |
| :----- | :--- |
| POST | /v1/organizations/:organizationId/invitations |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | string |  | 

#### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| email | string | Email of the invited user. Only a user with this email can join using the invitation. The email is stored in a lowercase form. | 
| role | string | Role of the member in the organization. | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| role | string | Role of the member in the organization. | 
| id | string | Unique invitation ID. | 
| email | string | Email of the invited user. Only a user with this email can join using the invitation. The email is stored in a lowercase form. | 
| createdAt | string | Invitation creation timestamp. ISO-8601. | 
| expiresAt | string | Timestamp the invitation expires. ISO-8601. | 

#### Sample response

```
{
  "role": "string",
  "id": "string",
  "email": "string",
  "createdAt": "string",
  "expiresAt": "string"
}
```

## Get invitation details

Returns details for a single organization invitation.

| Method | Path |
| :----- | :--- |
| GET | /v1/organizations/:organizationId/invitations/:invitationId |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | string |  | 
| Organization invitation ID | string |  | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| role | string | Role of the member in the organization. | 
| id | string | Unique invitation ID. | 
| email | string | Email of the invited user. Only a user with this email can join using the invitation. The email is stored in a lowercase form. | 
| createdAt | string | Invitation creation timestamp. ISO-8601. | 
| expiresAt | string | Timestamp the invitation expires. ISO-8601. | 

#### Sample response

```
{
  "role": "string",
  "id": "string",
  "email": "string",
  "createdAt": "string",
  "expiresAt": "string"
}
```

## Delete organization invitation

Deletes a single organization invitation.

| Method | Path |
| :----- | :--- |
| DELETE | /v1/organizations/:organizationId/invitations/:invitationId |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | string |  | 
| Organization invitation ID | string |  | 

