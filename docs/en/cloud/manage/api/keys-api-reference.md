---
sidebar_label: Keys
title: Keys
---

## Get list of all keys

Returns a list of all keys in the organization.

| Method | Path |
| :----- | :--- |
| GET | /v1/organizations/:organizationId/keys |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | string |  | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | string | Unique API key ID. | 
| name | string | Name of the key | 
| state | string | State of the key: 'enabled', 'disabled'. | 
| roles | array | List of roles assigned to the key. Contains at least 1 element. | 
| keySuffix | string | Last 4 letters of the key. | 
| createdAt | string | Timestamp the key was created. ISO-8601. | 
| expiresAt | string | Timestamp the key expires. If not present or is empty the key never expires. ISO-8601. | 
| usedAt | string | Timestamp the key was used last time. If not present the key was never used. ISO-8601. | 

#### Sample response

```
{
  "id": "string",
  "name": "string",
  "state": "string",
  "roles": "Array",
  "keySuffix": "string",
  "createdAt": "string",
  "expiresAt": "string",
  "usedAt": "string"
}
```

## Create key

Creates new API key.

| Method | Path |
| :----- | :--- |
| POST | /v1/organizations/:organizationId/keys |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | string |  | 

#### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| name | string | Name of the key. | 
| expiresAt | string | Timestamp the key expires. If not present or is empty the key never expires. ISO-8601. | 
| state | string | Initial state of the key: 'enabled', 'disabled'. If not provided the new key will be 'enabled'. | 
| hashData | undefined |  | 
| roles | array | List of roles assigned to the key. Contains at least 1 element. | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| key | undefined |  | 
| keyId | string | Generated key id. Provided only if there was no 'hashData' in the request. | 
| keySecret | string | Generated key secret. Provided only if there was no 'hashData' in the request. | 

#### Sample response

```
{
  "keyId": "string",
  "keySecret": "string"
}
```

## Get key details

Returns a single key details.

| Method | Path |
| :----- | :--- |
| GET | /v1/organizations/:organizationId/keys/:keyId |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | string |  | 
| API key ID | string |  | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | string | Unique API key ID. | 
| name | string | Name of the key | 
| state | string | State of the key: 'enabled', 'disabled'. | 
| roles | array | List of roles assigned to the key. Contains at least 1 element. | 
| keySuffix | string | Last 4 letters of the key. | 
| createdAt | string | Timestamp the key was created. ISO-8601. | 
| expiresAt | string | Timestamp the key expires. If not present or is empty the key never expires. ISO-8601. | 
| usedAt | string | Timestamp the key was used last time. If not present the key was never used. ISO-8601. | 

#### Sample response

```
{
  "id": "string",
  "name": "string",
  "state": "string",
  "roles": "Array",
  "keySuffix": "string",
  "createdAt": "string",
  "expiresAt": "string",
  "usedAt": "string"
}
```

## Update key

Updates API key properties.

| Method | Path |
| :----- | :--- |
| PATCH | /v1/organizations/:organizationId/keys/:keyId |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | string |  | 
| API key ID | string |  | 

#### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| name | string | Name of the key | 
| roles | array | List of roles assigned to the key. Contains at least 1 element. | 
| expiresAt | string | Timestamp the key expires. If not present or is empty the key never expires. ISO-8601. | 
| state | string | State of the key: 'enabled', 'disabled'. | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | string | Unique API key ID. | 
| name | string | Name of the key | 
| state | string | State of the key: 'enabled', 'disabled'. | 
| roles | array | List of roles assigned to the key. Contains at least 1 element. | 
| keySuffix | string | Last 4 letters of the key. | 
| createdAt | string | Timestamp the key was created. ISO-8601. | 
| expiresAt | string | Timestamp the key expires. If not present or is empty the key never expires. ISO-8601. | 
| usedAt | string | Timestamp the key was used last time. If not present the key was never used. ISO-8601. | 

#### Sample response

```
{
  "id": "string",
  "name": "string",
  "state": "string",
  "roles": "Array",
  "keySuffix": "string",
  "createdAt": "string",
  "expiresAt": "string",
  "usedAt": "string"
}
```

## Delete key

Deletes API key. Only a key not used to authenticate the active request can be deleted.

| Method | Path |
| :----- | :--- |
| DELETE | /v1/organizations/:organizationId/keys/:keyId |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | string |  | 
| API key ID | string |  | 

