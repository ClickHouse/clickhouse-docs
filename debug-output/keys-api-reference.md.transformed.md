---
sidebar_label: 'Keys'
title: 'Keys'
slug: /cloud/manage/api/keys-api-reference
description: 'Cloud API reference documentation for keys'
---

## Get list of all keys

Returns a list of all keys in the organization.

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/keys` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the requested organization. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique API key ID. | 
| name | string | Name of the key | 
| state | string | State of the key: 'enabled', 'disabled'. | 
| roles | array | List of roles assigned to the key. Contains at least 1 element. | 
| keySuffix | string | Last 4 letters of the key. | 
| createdAt | date-time | Timestamp the key was created. ISO-8601. | 
| expireAt | date-time | Timestamp the key expires. If not present or is empty the key never expires. ISO-8601. | 
| usedAt | date-time | Timestamp the key was used last time. If not present the key was never used. ISO-8601. | 
| ipAccessList | array | List of IP addresses allowed to access the API using this key | 


#### Sample response

```
{
  "id": "uuid",
  "name": "string",
  "state": "string",
  "roles": "Array",
  "keySuffix": "string",
  "createdAt": "date-time",
  "expireAt": "date-time",
  "usedAt": "date-time",
  "ipAccessList": "Array"
}
```

## Create key

Creates new API key.

| Method | Path |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/keys` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that will own the key. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| name | string | Name of the key. | 
| expireAt | string | Timestamp the key expires. If not present or is empty the key never expires. ISO-8601. | 
| state | string | Initial state of the key: 'enabled', 'disabled'. If not provided the new key will be 'enabled'. | 
| hashData |  |  | 
| roles | array | List of roles assigned to the key. Contains at least 1 element. | 
| ipAccessList | array | List of IP addresses allowed to access the API using this key | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| key.id | uuid | Unique API key ID. | 
| key.name | string | Name of the key | 
| key.state | string | State of the key: 'enabled', 'disabled'. | 
| key.roles | array | List of roles assigned to the key. Contains at least 1 element. | 
| key.keySuffix | string | Last 4 letters of the key. | 
| key.createdAt | date-time | Timestamp the key was created. ISO-8601. | 
| key.expireAt | date-time | Timestamp the key expires. If not present or is empty the key never expires. ISO-8601. | 
| key.usedAt | date-time | Timestamp the key was used last time. If not present the key was never used. ISO-8601. | 
| key.ipAccessList | array | List of IP addresses allowed to access the API using this key | 
| keyId | string | Generated key ID. Provided only if there was no 'hashData' in the request. | 
| keySecret | string | Generated key secret. Provided only if there was no 'hashData' in the request. | 


#### Sample response

```
{
  "key": {
    "id": "uuid",
    "name": "string",
    "state": "string",
    "roles": "Array",
    "keySuffix": "string",
    "createdAt": "date-time",
    "expireAt": "date-time",
    "usedAt": "date-time",
    "ipAccessList": "Array"
  },
  "keyId": "string",
  "keySecret": "string"
}
```

## Get key details

Returns a single key details.

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/keys/{keyId}` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the requested organization. | 
| keyId | uuid | ID of the requested key. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique API key ID. | 
| name | string | Name of the key | 
| state | string | State of the key: 'enabled', 'disabled'. | 
| roles | array | List of roles assigned to the key. Contains at least 1 element. | 
| keySuffix | string | Last 4 letters of the key. | 
| createdAt | date-time | Timestamp the key was created. ISO-8601. | 
| expireAt | date-time | Timestamp the key expires. If not present or is empty the key never expires. ISO-8601. | 
| usedAt | date-time | Timestamp the key was used last time. If not present the key was never used. ISO-8601. | 
| ipAccessList | array | List of IP addresses allowed to access the API using this key | 


#### Sample response

```
{
  "id": "uuid",
  "name": "string",
  "state": "string",
  "roles": "Array",
  "keySuffix": "string",
  "createdAt": "date-time",
  "expireAt": "date-time",
  "usedAt": "date-time",
  "ipAccessList": "Array"
}
```

## Update key

Updates API key properties.

| Method | Path |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/keys/{keyId}` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the key. | 
| keyId | uuid | ID of the key to update. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| name | string | Name of the key | 
| roles | array | List of roles assigned to the key. Contains at least 1 element. | 
| expireAt | string | Timestamp the key expires. If not present or is empty the key never expires. ISO-8601. | 
| state | string | State of the key: 'enabled', 'disabled'. | 
| ipAccessList | array | List of IP addresses allowed to access the API using this key | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique API key ID. | 
| name | string | Name of the key | 
| state | string | State of the key: 'enabled', 'disabled'. | 
| roles | array | List of roles assigned to the key. Contains at least 1 element. | 
| keySuffix | string | Last 4 letters of the key. | 
| createdAt | date-time | Timestamp the key was created. ISO-8601. | 
| expireAt | date-time | Timestamp the key expires. If not present or is empty the key never expires. ISO-8601. | 
| usedAt | date-time | Timestamp the key was used last time. If not present the key was never used. ISO-8601. | 
| ipAccessList | array | List of IP addresses allowed to access the API using this key | 


#### Sample response

```
{
  "id": "uuid",
  "name": "string",
  "state": "string",
  "roles": "Array",
  "keySuffix": "string",
  "createdAt": "date-time",
  "expireAt": "date-time",
  "usedAt": "date-time",
  "ipAccessList": "Array"
}
```

## Delete key

Deletes API key. Only a key not used to authenticate the active request can be deleted.

| Method | Path |
| :----- | :--- |
| DELETE | `/v1/organizations/{organizationId}/keys/{keyId}` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the key. | 
| keyId | uuid | ID of the key to delete. | 

