---
sidebar_label: Services
title: Services
---

## List of organization services

Returns a list of all services in the organization.

| Method | Path |
| :----- | :--- |
| GET | /v1/organizations/:organizationId/services |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | uuid | ID of the requested organization. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique service ID. | 
| name | string | Name of the service. | 
| provider | string | Cloud provider | 
| region | string | Service region. | 
| state | string | Current state of the service. | 
| endpoints | array | List of all service endpoints. | 
| tier | string | Tier of the service: 'development', 'production'. Production services scale, Development are fixed size. | 
| minTotalMemoryGb | number | Minimum total memory of all workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than 24. | 
| maxTotalMemoryGb | number | Maximum total memory of all workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than 360 for non paid services or 720 for paid services. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. Always true for development services. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| createdAt | date-time | Service creation timestamp. ISO-8601. | 

#### Sample response

```
{
  "id": "uuid",
  "name": "string",
  "provider": "string",
  "region": "string",
  "state": "string",
  "endpoints": "Array",
  "tier": "string",
  "minTotalMemoryGb": 0,
  "maxTotalMemoryGb": 0,
  "idleScaling": "boolean",
  "idleTimeoutMinutes": 0,
  "ipAccessList": "Array",
  "createdAt": "date-time"
}
```

## Create new service

Creates a new service in the organization, and returns the current service state and a password to access the service. The service is started asynchronously.

| Method | Path |
| :----- | :--- |
| POST | /v1/organizations/:organizationId/services |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | uuid | ID of the organization that will own the service. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| name | string | Name of the service. | 
| provider | string | Cloud provider | 
| region | string | Service region. | 
| tier | string | Tier of the service: 'development', 'production'. Production services scale, Development are fixed size. | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| minTotalMemoryGb | number | Minimum total memory of all workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than 24. | 
| maxTotalMemoryGb | number | Maximum total memory of all workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than 360 for non paid services or 720 for paid services. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. Always true for development services. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| backupId | string | Optional backup ID used as an initial state for the new service. When used the region and the tier of the new instance must be the same as the values of the original instance. | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| service |  |  | 
| password | string | Password for the newly created service. | 

#### Sample response

```
{
  "password": "string"
}
```

## Get service details

Returns a service that belongs to the organization

| Method | Path |
| :----- | :--- |
| GET | /v1/organizations/:organizationId/services/:serviceId |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | uuid | ID of the organization that owns the service. | 
| Service ID | uuid | ID of the requested service. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique service ID. | 
| name | string | Name of the service. | 
| provider | string | Cloud provider | 
| region | string | Service region. | 
| state | string | Current state of the service. | 
| endpoints | array | List of all service endpoints. | 
| tier | string | Tier of the service: 'development', 'production'. Production services scale, Development are fixed size. | 
| minTotalMemoryGb | number | Minimum total memory of all workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than 24. | 
| maxTotalMemoryGb | number | Maximum total memory of all workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than 360 for non paid services or 720 for paid services. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. Always true for development services. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| createdAt | date-time | Service creation timestamp. ISO-8601. | 

#### Sample response

```
{
  "id": "uuid",
  "name": "string",
  "provider": "string",
  "region": "string",
  "state": "string",
  "endpoints": "Array",
  "tier": "string",
  "minTotalMemoryGb": 0,
  "maxTotalMemoryGb": 0,
  "idleScaling": "boolean",
  "idleTimeoutMinutes": 0,
  "ipAccessList": "Array",
  "createdAt": "date-time"
}
```

## Update service basic details.

Updates basic service details like service name or IP access list.

| Method | Path |
| :----- | :--- |
| PATCH | /v1/organizations/:organizationId/services/:serviceId |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | uuid | ID of the organization that owns the service. | 
| Service ID | uuid | ID of the service to update. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| name | string | Name of the service. | 
| ipAccessList |  |  | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique service ID. | 
| name | string | Name of the service. | 
| provider | string | Cloud provider | 
| region | string | Service region. | 
| state | string | Current state of the service. | 
| endpoints | array | List of all service endpoints. | 
| tier | string | Tier of the service: 'development', 'production'. Production services scale, Development are fixed size. | 
| minTotalMemoryGb | number | Minimum total memory of all workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than 24. | 
| maxTotalMemoryGb | number | Maximum total memory of all workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than 360 for non paid services or 720 for paid services. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. Always true for development services. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| createdAt | date-time | Service creation timestamp. ISO-8601. | 

#### Sample response

```
{
  "id": "uuid",
  "name": "string",
  "provider": "string",
  "region": "string",
  "state": "string",
  "endpoints": "Array",
  "tier": "string",
  "minTotalMemoryGb": 0,
  "maxTotalMemoryGb": 0,
  "idleScaling": "boolean",
  "idleTimeoutMinutes": 0,
  "ipAccessList": "Array",
  "createdAt": "date-time"
}
```

## Delete service.

Deletes the service. The service must be in stopped state and is deleted asynchronously after this method call.

| Method | Path |
| :----- | :--- |
| DELETE | /v1/organizations/:organizationId/services/:serviceId |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | uuid | ID of the organization that owns the service. | 
| Service ID | uuid | ID of the service to delete. | 


## Update service state.

Starts or stop service

| Method | Path |
| :----- | :--- |
| PATCH | /v1/organizations/:organizationId/services/:serviceId/state |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | uuid | ID of the organization that owns the service. | 
| Service ID | uuid | ID of the service to update state. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| command | string | Command to change the state: 'start', 'stop'. | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique service ID. | 
| name | string | Name of the service. | 
| provider | string | Cloud provider | 
| region | string | Service region. | 
| state | string | Current state of the service. | 
| endpoints | array | List of all service endpoints. | 
| tier | string | Tier of the service: 'development', 'production'. Production services scale, Development are fixed size. | 
| minTotalMemoryGb | number | Minimum total memory of all workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than 24. | 
| maxTotalMemoryGb | number | Maximum total memory of all workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than 360 for non paid services or 720 for paid services. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. Always true for development services. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| createdAt | date-time | Service creation timestamp. ISO-8601. | 

#### Sample response

```
{
  "id": "uuid",
  "name": "string",
  "provider": "string",
  "region": "string",
  "state": "string",
  "endpoints": "Array",
  "tier": "string",
  "minTotalMemoryGb": 0,
  "maxTotalMemoryGb": 0,
  "idleScaling": "boolean",
  "idleTimeoutMinutes": 0,
  "ipAccessList": "Array",
  "createdAt": "date-time"
}
```

## Update service auto scaling settings.

Updates minimum and maximum total memory limits and idle mode scaling behavior for the service. The memory settings are available only for "production" services and must be a multiple of 12 starting from 24GB.

| Method | Path |
| :----- | :--- |
| PATCH | /v1/organizations/:organizationId/services/:serviceId/scaling |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | uuid | ID of the organization that owns the service. | 
| Service ID | uuid | ID of the service to update scaling parameters. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| minTotalMemoryGb | number | Minimum total memory of all workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than 24. | 
| maxTotalMemoryGb | number | Maximum total memory of all workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than 360 for non paid services or 720 for paid services. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. Always true for development services. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique service ID. | 
| name | string | Name of the service. | 
| provider | string | Cloud provider | 
| region | string | Service region. | 
| state | string | Current state of the service. | 
| endpoints | array | List of all service endpoints. | 
| tier | string | Tier of the service: 'development', 'production'. Production services scale, Development are fixed size. | 
| minTotalMemoryGb | number | Minimum total memory of all workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than 24. | 
| maxTotalMemoryGb | number | Maximum total memory of all workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than 360 for non paid services or 720 for paid services. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. Always true for development services. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| createdAt | date-time | Service creation timestamp. ISO-8601. | 

#### Sample response

```
{
  "id": "uuid",
  "name": "string",
  "provider": "string",
  "region": "string",
  "state": "string",
  "endpoints": "Array",
  "tier": "string",
  "minTotalMemoryGb": 0,
  "maxTotalMemoryGb": 0,
  "idleScaling": "boolean",
  "idleTimeoutMinutes": 0,
  "ipAccessList": "Array",
  "createdAt": "date-time"
}
```

## Update service password.

Sets a new password for the service

| Method | Path |
| :----- | :--- |
| PATCH | /v1/organizations/:organizationId/services/:serviceId/password |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | uuid | ID of the organization that owns the service. | 
| Service ID | uuid | ID of the service to update password. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| newPasswordHash | string | Optional password hash. Used to avoid password transmission over network. If not provided a new password is generated and is provided in the response. Otherwise this hash is used. Algorithm: sha256sum | tr -d '-' | xxd -r -p | base64 | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| password | string | New service password. Provided only if there was no 'newPasswordHash' in the request | 

#### Sample response

```
{
  "password": "string"
}
```

## List of service backups

Returns a list of all backups for the service.

| Method | Path |
| :----- | :--- |
| GET | /v1/organizations/:organizationId/services/:serviceId/backups |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | uuid | ID of the organization that owns the backup. | 
| Service ID | uuid | ID of the service the backup was created from. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique backup ID. | 
| status | string | Status of the backup: 'done', 'error', 'in_progress'. | 
| serviceId | string | Name  | 
| startedAt | date-time | Backup start timestamp. ISO-8601. | 
| finishedAt | date-time | Backup finish timestamp. ISO-8601. Available only for finished backups | 

#### Sample response

```
{
  "id": "uuid",
  "status": "string",
  "serviceId": "string",
  "startedAt": "date-time",
  "finishedAt": "date-time"
}
```

## Get backup details

Returns a single backup info.

| Method | Path |
| :----- | :--- |
| GET | /v1/organizations/:organizationId/services/:serviceId/backups/:backupId |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| Organization ID | uuid | ID of the organization that owns the backup. | 
| Service ID | uuid | ID of the service the backup was created from. | 
| Service backup ID | uuid | ID of the requested backup. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique backup ID. | 
| status | string | Status of the backup: 'done', 'error', 'in_progress'. | 
| serviceId | string | Name  | 
| startedAt | date-time | Backup start timestamp. ISO-8601. | 
| finishedAt | date-time | Backup finish timestamp. ISO-8601. Available only for finished backups | 

#### Sample response

```
{
  "id": "uuid",
  "status": "string",
  "serviceId": "string",
  "startedAt": "date-time",
  "finishedAt": "date-time"
}
```
