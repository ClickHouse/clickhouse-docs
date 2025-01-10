---
sidebar_label: Services
title: Services
---

## List of organization services

Returns a list of all services in the organization.

| Method | Path |
| :----- | :--- |
| GET | /v1/organizations/{organizationId}/services |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the requested organization. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique service ID. | 
| name | string | Name of the service. Alphanumerical string with whitespaces up to 50 characters. | 
| provider | string | Cloud provider | 
| region | string | Service region. | 
| state | string | Current state of the service. | 
| endpoints | array | List of all service endpoints. | 
| tier | string | Tier of the service: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. Production services scale, Development are fixed size. Azure services don't support Development tier | 
| minTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Minimum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than or equal to 24. | 
| maxTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Maximum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than or equal to 360 for non paid services or 708 for paid services. | 
| minReplicaMemoryGb | number | Minimum total memory of each replica during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 4 and greater than or equal to 8. | 
| maxReplicaMemoryGb | number | Maximum total memory of each replica during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 4 and lower than or equal to 120 for non paid services or 236 for paid services. | 
| numReplicas | number | Number of replicas for the service. Must be between 1 and 20. Contact support to enable this feature. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. True by default. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| createdAt | date-time | Service creation timestamp. ISO-8601. | 
| encryptionKey | string | Optional customer provided disk encryption key | 
| encryptionAssumedRoleIdentifier | string | Optional role to use for disk encryption | 
| iamRole | string | IAM role used for accessing objects in s3 | 
| privateEndpointIds | array | List of private endpoints | 
| dataWarehouseId | string | Data warehouse containing this service | 
| isPrimary | boolean | True if this service is the primary service in the data warehouse | 
| isReadonly | boolean | True if this service is read-only. It can only be read-only if a dataWarehouseId is provided. | 
| releaseChannel | string | Select fast if you want to get new ClickHouse releases as soon as they are available. You'll get new features faster, but with a higher risk of bugs. This feature is only available for production services. | 
| byocId | string | This is the ID returned after setting up a region for Bring Your Own Cloud (BYOC). When the byocId parameter is specified, the minReplicaMemoryGb and the maxReplicaGb parameters are required too, with values included among the following sizes: 28, 60, 124, 188, 252, 380. | 

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
  "minReplicaMemoryGb": 0,
  "maxReplicaMemoryGb": 0,
  "numReplicas": 0,
  "idleScaling": "boolean",
  "idleTimeoutMinutes": 0,
  "ipAccessList": "Array",
  "createdAt": "date-time",
  "encryptionKey": "string",
  "encryptionAssumedRoleIdentifier": "string",
  "iamRole": "string",
  "privateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string"
}
```

## Create new service

Creates a new service in the organization, and returns the current service state and a password to access the service. The service is started asynchronously.

| Method | Path |
| :----- | :--- |
| POST | /v1/organizations/{organizationId}/services |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that will own the service. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| name | string | Name of the service. Alphanumerical string with whitespaces up to 50 characters. | 
| provider | string | Cloud provider | 
| region | string | Service region. | 
| tier | string | Tier of the service: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. Production services scale, Development are fixed size. Azure services don't support Development tier | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| minTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Minimum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than or equal to 24. | 
| maxTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Maximum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than or equal to 360 for non paid services or 708 for paid services. | 
| minReplicaMemoryGb | number | Minimum total memory of each replica during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 4 and greater than or equal to 8. | 
| maxReplicaMemoryGb | number | Maximum total memory of each replica during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 4 and lower than or equal to 120 for non paid services or 236 for paid services. | 
| numReplicas | number | Number of replicas for the service. Must be between 1 and 20. Contact support to enable this feature. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. True by default. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| isReadonly | boolean | True if this service is read-only. It can only be read-only if a dataWarehouseId is provided. | 
| dataWarehouseId | string | Data warehouse containing this service | 
| backupId | string | Optional backup ID used as an initial state for the new service. When used the region and the tier of the new instance must be the same as the values of the original instance. | 
| encryptionKey | string | Optional customer provided disk encryption key | 
| encryptionAssumedRoleIdentifier | string | Optional role to use for disk encryption | 
| privateEndpointIds | array | List of private endpoints | 
| privatePreviewTermsChecked | boolean | Accept the private preview terms and conditions. It is only needed when creating the first service in the organization in case of a private preview | 
| releaseChannel | string | Select fast if you want to get new ClickHouse releases as soon as they are available. You'll get new features faster, but with a higher risk of bugs. This feature is only available for production services. | 
| byocId | string | This is the ID returned after setting up a region for Bring Your Own Cloud (BYOC). When the byocId parameter is specified, the minReplicaMemoryGb and the maxReplicaGb parameters are required too, with values included among the following sizes: 28, 60, 124, 188, 252, 380. | 

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
| GET | /v1/organizations/{organizationId}/services/{serviceId} |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the requested service. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique service ID. | 
| name | string | Name of the service. Alphanumerical string with whitespaces up to 50 characters. | 
| provider | string | Cloud provider | 
| region | string | Service region. | 
| state | string | Current state of the service. | 
| endpoints | array | List of all service endpoints. | 
| tier | string | Tier of the service: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. Production services scale, Development are fixed size. Azure services don't support Development tier | 
| minTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Minimum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than or equal to 24. | 
| maxTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Maximum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than or equal to 360 for non paid services or 708 for paid services. | 
| minReplicaMemoryGb | number | Minimum total memory of each replica during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 4 and greater than or equal to 8. | 
| maxReplicaMemoryGb | number | Maximum total memory of each replica during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 4 and lower than or equal to 120 for non paid services or 236 for paid services. | 
| numReplicas | number | Number of replicas for the service. Must be between 1 and 20. Contact support to enable this feature. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. True by default. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| createdAt | date-time | Service creation timestamp. ISO-8601. | 
| encryptionKey | string | Optional customer provided disk encryption key | 
| encryptionAssumedRoleIdentifier | string | Optional role to use for disk encryption | 
| iamRole | string | IAM role used for accessing objects in s3 | 
| privateEndpointIds | array | List of private endpoints | 
| dataWarehouseId | string | Data warehouse containing this service | 
| isPrimary | boolean | True if this service is the primary service in the data warehouse | 
| isReadonly | boolean | True if this service is read-only. It can only be read-only if a dataWarehouseId is provided. | 
| releaseChannel | string | Select fast if you want to get new ClickHouse releases as soon as they are available. You'll get new features faster, but with a higher risk of bugs. This feature is only available for production services. | 
| byocId | string | This is the ID returned after setting up a region for Bring Your Own Cloud (BYOC). When the byocId parameter is specified, the minReplicaMemoryGb and the maxReplicaGb parameters are required too, with values included among the following sizes: 28, 60, 124, 188, 252, 380. | 

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
  "minReplicaMemoryGb": 0,
  "maxReplicaMemoryGb": 0,
  "numReplicas": 0,
  "idleScaling": "boolean",
  "idleTimeoutMinutes": 0,
  "ipAccessList": "Array",
  "createdAt": "date-time",
  "encryptionKey": "string",
  "encryptionAssumedRoleIdentifier": "string",
  "iamRole": "string",
  "privateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string"
}
```

## Update service basic details

Updates basic service details like service name or IP access list.

| Method | Path |
| :----- | :--- |
| PATCH | /v1/organizations/{organizationId}/services/{serviceId} |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the service to update. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| name | string | Name of the service. Alphanumerical string with whitespaces up to 50 characters. | 
| ipAccessList |  |  | 
| privateEndpointIds |  |  | 
| releaseChannel | string | Select fast if you want to get new ClickHouse releases as soon as they are available. You'll get new features faster, but with a higher risk of bugs. This feature is only available for production services. | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique service ID. | 
| name | string | Name of the service. Alphanumerical string with whitespaces up to 50 characters. | 
| provider | string | Cloud provider | 
| region | string | Service region. | 
| state | string | Current state of the service. | 
| endpoints | array | List of all service endpoints. | 
| tier | string | Tier of the service: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. Production services scale, Development are fixed size. Azure services don't support Development tier | 
| minTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Minimum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than or equal to 24. | 
| maxTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Maximum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than or equal to 360 for non paid services or 708 for paid services. | 
| minReplicaMemoryGb | number | Minimum total memory of each replica during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 4 and greater than or equal to 8. | 
| maxReplicaMemoryGb | number | Maximum total memory of each replica during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 4 and lower than or equal to 120 for non paid services or 236 for paid services. | 
| numReplicas | number | Number of replicas for the service. Must be between 1 and 20. Contact support to enable this feature. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. True by default. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| createdAt | date-time | Service creation timestamp. ISO-8601. | 
| encryptionKey | string | Optional customer provided disk encryption key | 
| encryptionAssumedRoleIdentifier | string | Optional role to use for disk encryption | 
| iamRole | string | IAM role used for accessing objects in s3 | 
| privateEndpointIds | array | List of private endpoints | 
| dataWarehouseId | string | Data warehouse containing this service | 
| isPrimary | boolean | True if this service is the primary service in the data warehouse | 
| isReadonly | boolean | True if this service is read-only. It can only be read-only if a dataWarehouseId is provided. | 
| releaseChannel | string | Select fast if you want to get new ClickHouse releases as soon as they are available. You'll get new features faster, but with a higher risk of bugs. This feature is only available for production services. | 
| byocId | string | This is the ID returned after setting up a region for Bring Your Own Cloud (BYOC). When the byocId parameter is specified, the minReplicaMemoryGb and the maxReplicaGb parameters are required too, with values included among the following sizes: 28, 60, 124, 188, 252, 380. | 

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
  "minReplicaMemoryGb": 0,
  "maxReplicaMemoryGb": 0,
  "numReplicas": 0,
  "idleScaling": "boolean",
  "idleTimeoutMinutes": 0,
  "ipAccessList": "Array",
  "createdAt": "date-time",
  "encryptionKey": "string",
  "encryptionAssumedRoleIdentifier": "string",
  "iamRole": "string",
  "privateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string"
}
```

## Delete service

Deletes the service. The service must be in stopped state and is deleted asynchronously after this method call.

| Method | Path |
| :----- | :--- |
| DELETE | /v1/organizations/{organizationId}/services/{serviceId} |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the service to delete. | 


## Get private endpoint configuration

Information required to set up a private endpoint

| Method | Path |
| :----- | :--- |
| GET | /v1/organizations/{organizationId}/services/{serviceId}/privateEndpointConfig |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the requested organization. | 
| serviceId | uuid | ID of the requested service. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| endpointServiceId | string | Unique identifier of the interface endpoint you created in your VPC with the AWS(Service Name), GCP(Target Service) or AZURE (Private Link Service) resource | 
| privateDnsHostname | string | Private DNS Hostname of the VPC you created | 

#### Sample response

```
{
  "endpointServiceId": "string",
  "privateDnsHostname": "string"
}
```

## Update service state

Starts or stop service

| Method | Path |
| :----- | :--- |
| PATCH | /v1/organizations/{organizationId}/services/{serviceId}/state |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the service to update state. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| command | string | Command to change the state: 'start', 'stop'. | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique service ID. | 
| name | string | Name of the service. Alphanumerical string with whitespaces up to 50 characters. | 
| provider | string | Cloud provider | 
| region | string | Service region. | 
| state | string | Current state of the service. | 
| endpoints | array | List of all service endpoints. | 
| tier | string | Tier of the service: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. Production services scale, Development are fixed size. Azure services don't support Development tier | 
| minTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Minimum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than or equal to 24. | 
| maxTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Maximum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than or equal to 360 for non paid services or 708 for paid services. | 
| minReplicaMemoryGb | number | Minimum total memory of each replica during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 4 and greater than or equal to 8. | 
| maxReplicaMemoryGb | number | Maximum total memory of each replica during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 4 and lower than or equal to 120 for non paid services or 236 for paid services. | 
| numReplicas | number | Number of replicas for the service. Must be between 1 and 20. Contact support to enable this feature. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. True by default. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| createdAt | date-time | Service creation timestamp. ISO-8601. | 
| encryptionKey | string | Optional customer provided disk encryption key | 
| encryptionAssumedRoleIdentifier | string | Optional role to use for disk encryption | 
| iamRole | string | IAM role used for accessing objects in s3 | 
| privateEndpointIds | array | List of private endpoints | 
| dataWarehouseId | string | Data warehouse containing this service | 
| isPrimary | boolean | True if this service is the primary service in the data warehouse | 
| isReadonly | boolean | True if this service is read-only. It can only be read-only if a dataWarehouseId is provided. | 
| releaseChannel | string | Select fast if you want to get new ClickHouse releases as soon as they are available. You'll get new features faster, but with a higher risk of bugs. This feature is only available for production services. | 
| byocId | string | This is the ID returned after setting up a region for Bring Your Own Cloud (BYOC). When the byocId parameter is specified, the minReplicaMemoryGb and the maxReplicaGb parameters are required too, with values included among the following sizes: 28, 60, 124, 188, 252, 380. | 

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
  "minReplicaMemoryGb": 0,
  "maxReplicaMemoryGb": 0,
  "numReplicas": 0,
  "idleScaling": "boolean",
  "idleTimeoutMinutes": 0,
  "ipAccessList": "Array",
  "createdAt": "date-time",
  "encryptionKey": "string",
  "encryptionAssumedRoleIdentifier": "string",
  "iamRole": "string",
  "privateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string"
}
```

## Update service auto scaling settings

Updates minimum and maximum total memory limits and idle mode scaling behavior for the service. The memory settings are available only for "production" services and must be a multiple of 12 starting from 24GB. Please contact support to enable adjustment of numReplicas.

| Method | Path |
| :----- | :--- |
| PATCH | /v1/organizations/{organizationId}/services/{serviceId}/scaling |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the service to update scaling parameters. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| minTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Minimum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than or equal to 24. | 
| maxTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Maximum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than or equal to 360 for non paid services or 708 for paid services. | 
| numReplicas | number | Number of replicas for the service. Must be between 1 and 20. Contact support to enable this feature. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. True by default. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique service ID. | 
| name | string | Name of the service. Alphanumerical string with whitespaces up to 50 characters. | 
| provider | string | Cloud provider | 
| region | string | Service region. | 
| state | string | Current state of the service. | 
| endpoints | array | List of all service endpoints. | 
| tier | string | Tier of the service: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. Production services scale, Development are fixed size. Azure services don't support Development tier | 
| minTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Minimum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than or equal to 24. | 
| maxTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Maximum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than or equal to 360 for non paid services or 708 for paid services. | 
| minReplicaMemoryGb | number | Minimum total memory of each replica during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 4 and greater than or equal to 8. | 
| maxReplicaMemoryGb | number | Maximum total memory of each replica during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 4 and lower than or equal to 120 for non paid services or 236 for paid services. | 
| numReplicas | number | Number of replicas for the service. Must be between 1 and 20. Contact support to enable this feature. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. True by default. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| createdAt | date-time | Service creation timestamp. ISO-8601. | 
| encryptionKey | string | Optional customer provided disk encryption key | 
| encryptionAssumedRoleIdentifier | string | Optional role to use for disk encryption | 
| iamRole | string | IAM role used for accessing objects in s3 | 
| privateEndpointIds | array | List of private endpoints | 
| dataWarehouseId | string | Data warehouse containing this service | 
| isPrimary | boolean | True if this service is the primary service in the data warehouse | 
| isReadonly | boolean | True if this service is read-only. It can only be read-only if a dataWarehouseId is provided. | 
| releaseChannel | string | Select fast if you want to get new ClickHouse releases as soon as they are available. You'll get new features faster, but with a higher risk of bugs. This feature is only available for production services. | 
| byocId | string | This is the ID returned after setting up a region for Bring Your Own Cloud (BYOC). When the byocId parameter is specified, the minReplicaMemoryGb and the maxReplicaGb parameters are required too, with values included among the following sizes: 28, 60, 124, 188, 252, 380. | 

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
  "minReplicaMemoryGb": 0,
  "maxReplicaMemoryGb": 0,
  "numReplicas": 0,
  "idleScaling": "boolean",
  "idleTimeoutMinutes": 0,
  "ipAccessList": "Array",
  "createdAt": "date-time",
  "encryptionKey": "string",
  "encryptionAssumedRoleIdentifier": "string",
  "iamRole": "string",
  "privateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string"
}
```

## Update service auto scaling settings

Updates minimum and maximum memory limits per replica and idle mode scaling behavior for the service. The memory settings are available only for "production" services and must be a multiple of 4 starting from 8GB. Please contact support to enable adjustment of numReplicas.

| Method | Path |
| :----- | :--- |
| PATCH | /v1/organizations/{organizationId}/services/{serviceId}/replicaScaling |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the service to update scaling parameters. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| minReplicaMemoryGb | number | Minimum auto-scaling memory in Gb for a single replica. Available only for 'production' services. Must be a multiple of 4 and greater than or equal to 8. | 
| maxReplicaMemoryGb | number | Maximum auto-scaling memory in Gb for a single replica . Available only for 'production' services. Must be a multiple of 4 and lower than or equal to 120 for non paid services or 236 for paid services. | 
| numReplicas | number | Number of replicas for the service. Must be between 1 and 20. Contact support to enable this feature. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. True by default. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique service ID. | 
| name | string | Name of the service. Alphanumerical string with whitespaces up to 50 characters. | 
| provider | string | Cloud provider | 
| region | string | Service region. | 
| state | string | Current state of the service. | 
| endpoints | array | List of all service endpoints. | 
| tier | string | Tier of the service: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. Production services scale, Development are fixed size. Azure services don't support Development tier | 
| minTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Minimum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than or equal to 24. | 
| maxTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Maximum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than or equal to 360 for non paid services or 708 for paid services. | 
| minReplicaMemoryGb | number | Minimum auto-scaling memory in Gb for a single replica. Available only for 'production' services. Must be a multiple of 4 and greater than or equal to 8. | 
| maxReplicaMemoryGb | number | Maximum auto-scaling memory in Gb for a single replica . Available only for 'production' services. Must be a multiple of 4 and lower than or equal to 120 for non paid services or 236 for paid services. | 
| numReplicas | number | Number of replicas for the service. Must be between 1 and 20. Contact support to enable this feature. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. True by default. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| createdAt | date-time | Service creation timestamp. ISO-8601. | 
| encryptionKey | string | Optional customer provided disk encryption key | 
| encryptionAssumedRoleIdentifier | string | Optional role to use for disk encryption | 
| iamRole | string | IAM role used for accessing objects in s3 | 
| privateEndpointIds | array | List of private endpoints | 
| dataWarehouseId | string | Data warehouse containing this service | 
| isPrimary | boolean | True if this service is the primary service in the data warehouse | 
| isReadonly | boolean | True if this service is read-only. It can only be read-only if a dataWarehouseId is provided. | 
| releaseChannel | string | Select fast if you want to get new ClickHouse releases as soon as they are available. You'll get new features faster, but with a higher risk of bugs. This feature is only available for production services. | 
| byocId | string | This is the ID returned after setting up a region for Bring Your Own Cloud (BYOC). When the byocId parameter is specified, the minReplicaMemoryGb and the maxReplicaGb parameters are required too, with values included among the following sizes: 28, 60, 124, 188, 252, 380. | 

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
  "minReplicaMemoryGb": 0,
  "maxReplicaMemoryGb": 0,
  "numReplicas": 0,
  "idleScaling": "boolean",
  "idleTimeoutMinutes": 0,
  "ipAccessList": "Array",
  "createdAt": "date-time",
  "encryptionKey": "string",
  "encryptionAssumedRoleIdentifier": "string",
  "iamRole": "string",
  "privateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string"
}
```

## Update service password

Sets a new password for the service

| Method | Path |
| :----- | :--- |
| PATCH | /v1/organizations/{organizationId}/services/{serviceId}/password |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the service to update password. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| newPasswordHash | string | Optional password hash. Used to avoid password transmission over network. If not provided a new password is generated and is provided in the response. Otherwise this hash is used. Algorithm: echo -n "yourpassword" | sha256sum | tr -d '-' | xxd -r -p | base64 | 
| newDoubleSha1Hash | string | Optional double SHA1 password hash for MySQL protocol. If newPasswordHash is not provided this key will be ignored and the generated password will be used. Algorithm: echo -n "yourpassword" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-' | 

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

## Get prometheus metrics

Returns prometheus metrics for a service.

| Method | Path |
| :----- | :--- |
| GET | /v1/organizations/{organizationId}/services/{serviceId}/prometheus |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the requested service. | 
| filtered_metrics | boolean | Return a filtered list of Prometheus metrics. | 


## List of service backups

Returns a list of all backups for the service. The most recent backups comes first in the list.

| Method | Path |
| :----- | :--- |
| GET | /v1/organizations/{organizationId}/services/{serviceId}/backups |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the backup. | 
| serviceId | uuid | ID of the service the backup was created from. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique backup ID. | 
| status | string | Status of the backup: 'done', 'error', 'in_progress'. | 
| serviceId | string | Name  | 
| startedAt | date-time | Backup start timestamp. ISO-8601. | 
| finishedAt | date-time | Backup finish timestamp. ISO-8601. Available only for finished backups | 
| sizeInBytes | number | Size of the backup in bytes. | 
| durationInSeconds | number | Time in seconds it took to perform the backup. If the status still in_progress, this is the time in seconds since the backup started until now. | 
| type | string | Backup type ("full" or "incremental"). | 

#### Sample response

```
{
  "id": "uuid",
  "status": "string",
  "serviceId": "string",
  "startedAt": "date-time",
  "finishedAt": "date-time",
  "sizeInBytes": 0,
  "durationInSeconds": 0,
  "type": "string"
}
```

## Get backup details

Returns a single backup info.

| Method | Path |
| :----- | :--- |
| GET | /v1/organizations/{organizationId}/services/{serviceId}/backups/{backupId} |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the backup. | 
| serviceId | uuid | ID of the service the backup was created from. | 
| backupId | uuid | ID of the requested backup. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique backup ID. | 
| status | string | Status of the backup: 'done', 'error', 'in_progress'. | 
| serviceId | string | Name  | 
| startedAt | date-time | Backup start timestamp. ISO-8601. | 
| finishedAt | date-time | Backup finish timestamp. ISO-8601. Available only for finished backups | 
| sizeInBytes | number | Size of the backup in bytes. | 
| durationInSeconds | number | Time in seconds it took to perform the backup. If the status still in_progress, this is the time in seconds since the backup started until now. | 
| type | string | Backup type ("full" or "incremental"). | 

#### Sample response

```
{
  "id": "uuid",
  "status": "string",
  "serviceId": "string",
  "startedAt": "date-time",
  "finishedAt": "date-time",
  "sizeInBytes": 0,
  "durationInSeconds": 0,
  "type": "string"
}
```

## Get service backup configuration

Returns the service backup configuration.

| Method | Path |
| :----- | :--- |
| GET | /v1/organizations/{organizationId}/services/{serviceId}/backupConfiguration |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the service. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| backupPeriodInHours | number | The interval in hours between each backup. | 
| backupRetentionPeriodInHours | number | The minimum duration in hours for which the backups are available. | 
| backupStartTime | string | The time in HH:MM format for the backups to be performed (evaluated in UTC timezone). When defined the backup period resets to every 24 hours. | 

#### Sample response

```
{
  "backupPeriodInHours": 0,
  "backupRetentionPeriodInHours": 0,
  "backupStartTime": "string"
}
```

## Update service backup configuration

Updates service backup configuration. Requires ADMIN auth key role. Setting the properties with null value, will reset the properties to theirs default values.

| Method | Path |
| :----- | :--- |
| PATCH | /v1/organizations/{organizationId}/services/{serviceId}/backupConfiguration |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the service. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| backupPeriodInHours | number | The interval in hours between each backup. | 
| backupRetentionPeriodInHours | number | The minimum duration in hours for which the backups are available. | 
| backupStartTime | string | The time in HH:MM format for the backups to be performed (evaluated in UTC timezone). When defined the backup period resets to every 24 hours. | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| backupPeriodInHours | number | The interval in hours between each backup. | 
| backupRetentionPeriodInHours | number | The minimum duration in hours for which the backups are available. | 
| backupStartTime | string | The time in HH:MM format for the backups to be performed (evaluated in UTC timezone). When defined the backup period resets to every 24 hours. | 

#### Sample response

```
{
  "backupPeriodInHours": 0,
  "backupRetentionPeriodInHours": 0,
  "backupStartTime": "string"
}
```
