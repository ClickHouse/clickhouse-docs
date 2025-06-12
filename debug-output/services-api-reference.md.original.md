---
sidebar_label: 'Services'
title: 'Services'
slug: /cloud/manage/api/services-api-reference
description: 'Cloud API reference documentation for services'
---

## List of organization services

Returns a list of all services in the organization.

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services` |

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
| tier | string | DEPRECATED for BASIC, SCALE and ENTERPRISE organization tiers. Tier of the service: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. Production services scale, Development are fixed size. Azure services don't support Development tier | 
| minTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Minimum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than or equal to 24. | 
| maxTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Maximum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than or equal to 360 for non paid services or 708 for paid services. | 
| minReplicaMemoryGb | number | Minimum total memory of each replica during auto-scaling in Gb. Must be a multiple of 4 and greater than or equal to 8. | 
| maxReplicaMemoryGb | number | Maximum total memory of each replica during auto-scaling in Gb.  Must be a multiple of 4 and lower than or equal to 120* for non paid services or 236* for paid services.* - maximum replica size subject to cloud provider hardware availability in your selected region.  | 
| numReplicas | number | Number of replicas for the service. The number of replicas must be between 2 and 20 for the first service in a warehouse. Services that are created in an existing warehouse can have a number of replicas as low as 1. Further restrictions may apply based on your organization's tier. It defaults to 1 for the BASIC tier and 3 for the SCALE and ENTERPRISE tiers. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. True by default. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| createdAt | date-time | Service creation timestamp. ISO-8601. | 
| encryptionKey | string | Optional customer provided disk encryption key | 
| encryptionAssumedRoleIdentifier | string | Optional role to use for disk encryption | 
| iamRole | string | IAM role used for accessing objects in s3 | 
| privateEndpointIds | array | List of private endpoints | 
| availablePrivateEndpointIds | array | List of available private endpoints ids that can be attached to the service | 
| dataWarehouseId | string | Data warehouse containing this service | 
| isPrimary | boolean | True if this service is the primary service in the data warehouse | 
| isReadonly | boolean | True if this service is read-only. It can only be read-only if a dataWarehouseId is provided. | 
| releaseChannel | string | Select fast if you want to get new ClickHouse releases as soon as they are available. You'll get new features faster, but with a higher risk of bugs. This feature is only available for production services. | 
| byocId | string | This is the ID returned after setting up a region for Bring Your Own Cloud (BYOC). When the byocId parameter is specified, the minReplicaMemoryGb and the maxReplicaGb parameters are required too, with values included among the following sizes: 28, 60, 124, 188, 252, 380. | 
| hasTransparentDataEncryption | boolean | True if the service should have the Transparent Data Encryption (TDE) enabled. TDE is only available for ENTERPRISE organizations tiers and can only be enabled at service creation. | 
| transparentDataEncryptionKeyId | string | The ID of the Transparent Data Encryption key used for the service. This is only available if hasTransparentDataEncryption is true. | 
| encryptionRoleId | string | The ID of the IAM role used for encryption. This is only available if hasTransparentDataEncryption is true. | 


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
  "availablePrivateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string",
  "hasTransparentDataEncryption": "boolean",
  "transparentDataEncryptionKeyId": "string",
  "encryptionRoleId": "string"
}
```

## Create new service

Creates a new service in the organization, and returns the current service state and a password to access the service. The service is started asynchronously.

| Method | Path |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/services` |

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
| tier | string | DEPRECATED for BASIC, SCALE and ENTERPRISE organization tiers. Tier of the service: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. Production services scale, Development are fixed size. Azure services don't support Development tier | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| minTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Minimum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than or equal to 24. | 
| maxTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Maximum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than or equal to 360 for non paid services or 708 for paid services. | 
| minReplicaMemoryGb | number | Minimum total memory of each replica during auto-scaling in Gb. Must be a multiple of 4 and greater than or equal to 8. | 
| maxReplicaMemoryGb | number | Maximum total memory of each replica during auto-scaling in Gb.  Must be a multiple of 4 and lower than or equal to 120* for non paid services or 236* for paid services.* - maximum replica size subject to cloud provider hardware availability in your selected region.  | 
| numReplicas | number | Number of replicas for the service. The number of replicas must be between 2 and 20 for the first service in a warehouse. Services that are created in an existing warehouse can have a number of replicas as low as 1. Further restrictions may apply based on your organization's tier. It defaults to 1 for the BASIC tier and 3 for the SCALE and ENTERPRISE tiers. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. True by default. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| isReadonly | boolean | True if this service is read-only. It can only be read-only if a dataWarehouseId is provided. | 
| dataWarehouseId | string | Data warehouse containing this service | 
| backupId | string | Optional backup ID used as an initial state for the new service. When used the region and the tier of the new instance must be the same as the values of the original instance. | 
| encryptionKey | string | Optional customer provided disk encryption key | 
| encryptionAssumedRoleIdentifier | string | Optional role to use for disk encryption | 
| privateEndpointIds | array | To associate the service with private endpoints, first create the service, then use the `Update Service Basic Details` endpoint to modify private endpoints. | 
| privatePreviewTermsChecked | boolean | Accept the private preview terms and conditions. It is only needed when creating the first service in the organization in case of a private preview | 
| releaseChannel | string | Select fast if you want to get new ClickHouse releases as soon as they are available. You'll get new features faster, but with a higher risk of bugs. This feature is only available for production services. | 
| byocId | string | This is the ID returned after setting up a region for Bring Your Own Cloud (BYOC). When the byocId parameter is specified, the minReplicaMemoryGb and the maxReplicaGb parameters are required too, with values included among the following sizes: 28, 60, 124, 188, 252, 380. | 
| hasTransparentDataEncryption | boolean | True if the service should have the Transparent Data Encryption (TDE) enabled. TDE is only available for ENTERPRISE organizations tiers and can only be enabled at service creation. | 
| endpoints | array | List of service endpoints to enable or disable | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| service.id | uuid | Unique service ID. | 
| service.name | string | Name of the service. Alphanumerical string with whitespaces up to 50 characters. | 
| service.provider | string | Cloud provider | 
| service.region | string | Service region. | 
| service.state | string | Current state of the service. | 
| service.endpoints | array | List of all service endpoints. | 
| service.tier | string | DEPRECATED for BASIC, SCALE and ENTERPRISE organization tiers. Tier of the service: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. Production services scale, Development are fixed size. Azure services don't support Development tier | 
| service.minTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Minimum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than or equal to 24. | 
| service.maxTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Maximum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than or equal to 360 for non paid services or 708 for paid services. | 
| service.minReplicaMemoryGb | number | Minimum total memory of each replica during auto-scaling in Gb. Must be a multiple of 4 and greater than or equal to 8. | 
| service.maxReplicaMemoryGb | number | Maximum total memory of each replica during auto-scaling in Gb.  Must be a multiple of 4 and lower than or equal to 120* for non paid services or 236* for paid services.* - maximum replica size subject to cloud provider hardware availability in your selected region.  | 
| service.numReplicas | number | Number of replicas for the service. The number of replicas must be between 2 and 20 for the first service in a warehouse. Services that are created in an existing warehouse can have a number of replicas as low as 1. Further restrictions may apply based on your organization's tier. It defaults to 1 for the BASIC tier and 3 for the SCALE and ENTERPRISE tiers. | 
| service.idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. True by default. | 
| service.idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| service.ipAccessList | array | List of IP addresses allowed to access the service | 
| service.createdAt | date-time | Service creation timestamp. ISO-8601. | 
| service.encryptionKey | string | Optional customer provided disk encryption key | 
| service.encryptionAssumedRoleIdentifier | string | Optional role to use for disk encryption | 
| service.iamRole | string | IAM role used for accessing objects in s3 | 
| service.privateEndpointIds | array | List of private endpoints | 
| service.availablePrivateEndpointIds | array | List of available private endpoints ids that can be attached to the service | 
| service.dataWarehouseId | string | Data warehouse containing this service | 
| service.isPrimary | boolean | True if this service is the primary service in the data warehouse | 
| service.isReadonly | boolean | True if this service is read-only. It can only be read-only if a dataWarehouseId is provided. | 
| service.releaseChannel | string | Select fast if you want to get new ClickHouse releases as soon as they are available. You'll get new features faster, but with a higher risk of bugs. This feature is only available for production services. | 
| service.byocId | string | This is the ID returned after setting up a region for Bring Your Own Cloud (BYOC). When the byocId parameter is specified, the minReplicaMemoryGb and the maxReplicaGb parameters are required too, with values included among the following sizes: 28, 60, 124, 188, 252, 380. | 
| service.hasTransparentDataEncryption | boolean | True if the service should have the Transparent Data Encryption (TDE) enabled. TDE is only available for ENTERPRISE organizations tiers and can only be enabled at service creation. | 
| service.transparentDataEncryptionKeyId | string | The ID of the Transparent Data Encryption key used for the service. This is only available if hasTransparentDataEncryption is true. | 
| service.encryptionRoleId | string | The ID of the IAM role used for encryption. This is only available if hasTransparentDataEncryption is true. | 
| password | string | Password for the newly created service. | 


#### Sample response

```
{
  "service": {
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
    "availablePrivateEndpointIds": "Array",
    "dataWarehouseId": "string",
    "isPrimary": "boolean",
    "isReadonly": "boolean",
    "releaseChannel": "string",
    "byocId": "string",
    "hasTransparentDataEncryption": "boolean",
    "transparentDataEncryptionKeyId": "string",
    "encryptionRoleId": "string"
  },
  "password": "string"
}
```

## Get service details

Returns a service that belongs to the organization

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}` |

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
| tier | string | DEPRECATED for BASIC, SCALE and ENTERPRISE organization tiers. Tier of the service: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. Production services scale, Development are fixed size. Azure services don't support Development tier | 
| minTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Minimum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than or equal to 24. | 
| maxTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Maximum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than or equal to 360 for non paid services or 708 for paid services. | 
| minReplicaMemoryGb | number | Minimum total memory of each replica during auto-scaling in Gb. Must be a multiple of 4 and greater than or equal to 8. | 
| maxReplicaMemoryGb | number | Maximum total memory of each replica during auto-scaling in Gb.  Must be a multiple of 4 and lower than or equal to 120* for non paid services or 236* for paid services.* - maximum replica size subject to cloud provider hardware availability in your selected region.  | 
| numReplicas | number | Number of replicas for the service. The number of replicas must be between 2 and 20 for the first service in a warehouse. Services that are created in an existing warehouse can have a number of replicas as low as 1. Further restrictions may apply based on your organization's tier. It defaults to 1 for the BASIC tier and 3 for the SCALE and ENTERPRISE tiers. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. True by default. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| createdAt | date-time | Service creation timestamp. ISO-8601. | 
| encryptionKey | string | Optional customer provided disk encryption key | 
| encryptionAssumedRoleIdentifier | string | Optional role to use for disk encryption | 
| iamRole | string | IAM role used for accessing objects in s3 | 
| privateEndpointIds | array | List of private endpoints | 
| availablePrivateEndpointIds | array | List of available private endpoints ids that can be attached to the service | 
| dataWarehouseId | string | Data warehouse containing this service | 
| isPrimary | boolean | True if this service is the primary service in the data warehouse | 
| isReadonly | boolean | True if this service is read-only. It can only be read-only if a dataWarehouseId is provided. | 
| releaseChannel | string | Select fast if you want to get new ClickHouse releases as soon as they are available. You'll get new features faster, but with a higher risk of bugs. This feature is only available for production services. | 
| byocId | string | This is the ID returned after setting up a region for Bring Your Own Cloud (BYOC). When the byocId parameter is specified, the minReplicaMemoryGb and the maxReplicaGb parameters are required too, with values included among the following sizes: 28, 60, 124, 188, 252, 380. | 
| hasTransparentDataEncryption | boolean | True if the service should have the Transparent Data Encryption (TDE) enabled. TDE is only available for ENTERPRISE organizations tiers and can only be enabled at service creation. | 
| transparentDataEncryptionKeyId | string | The ID of the Transparent Data Encryption key used for the service. This is only available if hasTransparentDataEncryption is true. | 
| encryptionRoleId | string | The ID of the IAM role used for encryption. This is only available if hasTransparentDataEncryption is true. | 


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
  "availablePrivateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string",
  "hasTransparentDataEncryption": "boolean",
  "transparentDataEncryptionKeyId": "string",
  "encryptionRoleId": "string"
}
```

## Update service basic details

Updates basic service details like service name or IP access list.

| Method | Path |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}` |

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
| endpoints | array | List of service endpoints to change | 
| transparentDataEncryptionKeyId | string | The id of the key to rotate | 

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
| tier | string | DEPRECATED for BASIC, SCALE and ENTERPRISE organization tiers. Tier of the service: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. Production services scale, Development are fixed size. Azure services don't support Development tier | 
| minTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Minimum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than or equal to 24. | 
| maxTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Maximum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than or equal to 360 for non paid services or 708 for paid services. | 
| minReplicaMemoryGb | number | Minimum total memory of each replica during auto-scaling in Gb. Must be a multiple of 4 and greater than or equal to 8. | 
| maxReplicaMemoryGb | number | Maximum total memory of each replica during auto-scaling in Gb.  Must be a multiple of 4 and lower than or equal to 120* for non paid services or 236* for paid services.* - maximum replica size subject to cloud provider hardware availability in your selected region.  | 
| numReplicas | number | Number of replicas for the service. The number of replicas must be between 2 and 20 for the first service in a warehouse. Services that are created in an existing warehouse can have a number of replicas as low as 1. Further restrictions may apply based on your organization's tier. It defaults to 1 for the BASIC tier and 3 for the SCALE and ENTERPRISE tiers. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. True by default. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| createdAt | date-time | Service creation timestamp. ISO-8601. | 
| encryptionKey | string | Optional customer provided disk encryption key | 
| encryptionAssumedRoleIdentifier | string | Optional role to use for disk encryption | 
| iamRole | string | IAM role used for accessing objects in s3 | 
| privateEndpointIds | array | List of private endpoints | 
| availablePrivateEndpointIds | array | List of available private endpoints ids that can be attached to the service | 
| dataWarehouseId | string | Data warehouse containing this service | 
| isPrimary | boolean | True if this service is the primary service in the data warehouse | 
| isReadonly | boolean | True if this service is read-only. It can only be read-only if a dataWarehouseId is provided. | 
| releaseChannel | string | Select fast if you want to get new ClickHouse releases as soon as they are available. You'll get new features faster, but with a higher risk of bugs. This feature is only available for production services. | 
| byocId | string | This is the ID returned after setting up a region for Bring Your Own Cloud (BYOC). When the byocId parameter is specified, the minReplicaMemoryGb and the maxReplicaGb parameters are required too, with values included among the following sizes: 28, 60, 124, 188, 252, 380. | 
| hasTransparentDataEncryption | boolean | True if the service should have the Transparent Data Encryption (TDE) enabled. TDE is only available for ENTERPRISE organizations tiers and can only be enabled at service creation. | 
| transparentDataEncryptionKeyId | string | The ID of the Transparent Data Encryption key used for the service. This is only available if hasTransparentDataEncryption is true. | 
| encryptionRoleId | string | The ID of the IAM role used for encryption. This is only available if hasTransparentDataEncryption is true. | 


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
  "availablePrivateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string",
  "hasTransparentDataEncryption": "boolean",
  "transparentDataEncryptionKeyId": "string",
  "encryptionRoleId": "string"
}
```

## Delete service

Deletes the service. The service must be in stopped state and is deleted asynchronously after this method call.

| Method | Path |
| :----- | :--- |
| DELETE | `/v1/organizations/{organizationId}/services/{serviceId}` |

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
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/privateEndpointConfig` |

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

## Get the service query endpoint for a given instance

This is an experimental feature. Please contact support to enable it.

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/serviceQueryEndpoint` |

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
| id | string | The id of the service query endpoint | 
| openApiKeys | array | List of OpenAPI keys that can access the service query endpoint | 
| roles | array | List of roles that can access the service query endpoint | 
| allowedOrigins | string | The allowed origins as comma separated list of domains | 


#### Sample response

```
{
  "id": "string",
  "openApiKeys": "Array",
  "roles": "Array",
  "allowedOrigins": "string"
}
```

## Delete the service query endpoint for a given instance

This is an experimental feature. Please contact support to enable it.

| Method | Path |
| :----- | :--- |
| DELETE | `/v1/organizations/{organizationId}/services/{serviceId}/serviceQueryEndpoint` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the requested organization. | 
| serviceId | uuid | ID of the requested service. | 


## Upsert the service query endpoint for a given instance

This is an experimental feature. Please contact support to enable it.

| Method | Path |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/services/{serviceId}/serviceQueryEndpoint` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the requested organization. | 
| serviceId | uuid | ID of the requested service. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| roles | array | The roles | 
| openApiKeys | array | The version of the service query endpoint | 
| allowedOrigins | string | The allowed origins as comma separated list of domains | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | string | The id of the service query endpoint | 
| openApiKeys | array | List of OpenAPI keys that can access the service query endpoint | 
| roles | array | List of roles that can access the service query endpoint | 
| allowedOrigins | string | The allowed origins as comma separated list of domains | 


#### Sample response

```
{
  "id": "string",
  "openApiKeys": "Array",
  "roles": "Array",
  "allowedOrigins": "string"
}
```

## Update service state

Starts or stop service

| Method | Path |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/state` |

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
| tier | string | DEPRECATED for BASIC, SCALE and ENTERPRISE organization tiers. Tier of the service: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. Production services scale, Development are fixed size. Azure services don't support Development tier | 
| minTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Minimum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than or equal to 24. | 
| maxTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Maximum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than or equal to 360 for non paid services or 708 for paid services. | 
| minReplicaMemoryGb | number | Minimum total memory of each replica during auto-scaling in Gb. Must be a multiple of 4 and greater than or equal to 8. | 
| maxReplicaMemoryGb | number | Maximum total memory of each replica during auto-scaling in Gb.  Must be a multiple of 4 and lower than or equal to 120* for non paid services or 236* for paid services.* - maximum replica size subject to cloud provider hardware availability in your selected region.  | 
| numReplicas | number | Number of replicas for the service. The number of replicas must be between 2 and 20 for the first service in a warehouse. Services that are created in an existing warehouse can have a number of replicas as low as 1. Further restrictions may apply based on your organization's tier. It defaults to 1 for the BASIC tier and 3 for the SCALE and ENTERPRISE tiers. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. True by default. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| createdAt | date-time | Service creation timestamp. ISO-8601. | 
| encryptionKey | string | Optional customer provided disk encryption key | 
| encryptionAssumedRoleIdentifier | string | Optional role to use for disk encryption | 
| iamRole | string | IAM role used for accessing objects in s3 | 
| privateEndpointIds | array | List of private endpoints | 
| availablePrivateEndpointIds | array | List of available private endpoints ids that can be attached to the service | 
| dataWarehouseId | string | Data warehouse containing this service | 
| isPrimary | boolean | True if this service is the primary service in the data warehouse | 
| isReadonly | boolean | True if this service is read-only. It can only be read-only if a dataWarehouseId is provided. | 
| releaseChannel | string | Select fast if you want to get new ClickHouse releases as soon as they are available. You'll get new features faster, but with a higher risk of bugs. This feature is only available for production services. | 
| byocId | string | This is the ID returned after setting up a region for Bring Your Own Cloud (BYOC). When the byocId parameter is specified, the minReplicaMemoryGb and the maxReplicaGb parameters are required too, with values included among the following sizes: 28, 60, 124, 188, 252, 380. | 
| hasTransparentDataEncryption | boolean | True if the service should have the Transparent Data Encryption (TDE) enabled. TDE is only available for ENTERPRISE organizations tiers and can only be enabled at service creation. | 
| transparentDataEncryptionKeyId | string | The ID of the Transparent Data Encryption key used for the service. This is only available if hasTransparentDataEncryption is true. | 
| encryptionRoleId | string | The ID of the IAM role used for encryption. This is only available if hasTransparentDataEncryption is true. | 


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
  "availablePrivateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string",
  "hasTransparentDataEncryption": "boolean",
  "transparentDataEncryptionKeyId": "string",
  "encryptionRoleId": "string"
}
```

## Update service auto scaling settings

Updates minimum and maximum total memory limits and idle mode scaling behavior for the service. The memory settings are available only for "production" services and must be a multiple of 12 starting from 24GB. Please contact support to enable adjustment of numReplicas.

| Method | Path |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/scaling` |

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
| numReplicas | number | Number of replicas for the service. The number of replicas must be between 2 and 20 for the first service in a warehouse. Services that are created in an existing warehouse can have a number of replicas as low as 1. Further restrictions may apply based on your organization's tier. It defaults to 1 for the BASIC tier and 3 for the SCALE and ENTERPRISE tiers. | 
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
| tier | string | DEPRECATED for BASIC, SCALE and ENTERPRISE organization tiers. Tier of the service: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. Production services scale, Development are fixed size. Azure services don't support Development tier | 
| minTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Minimum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than or equal to 24. | 
| maxTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Maximum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than or equal to 360 for non paid services or 708 for paid services. | 
| minReplicaMemoryGb | number | Minimum total memory of each replica during auto-scaling in Gb. Must be a multiple of 4 and greater than or equal to 8. | 
| maxReplicaMemoryGb | number | Maximum total memory of each replica during auto-scaling in Gb.  Must be a multiple of 4 and lower than or equal to 120* for non paid services or 236* for paid services.* - maximum replica size subject to cloud provider hardware availability in your selected region.  | 
| numReplicas | number | Number of replicas for the service. The number of replicas must be between 2 and 20 for the first service in a warehouse. Services that are created in an existing warehouse can have a number of replicas as low as 1. Further restrictions may apply based on your organization's tier. It defaults to 1 for the BASIC tier and 3 for the SCALE and ENTERPRISE tiers. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. True by default. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| createdAt | date-time | Service creation timestamp. ISO-8601. | 
| encryptionKey | string | Optional customer provided disk encryption key | 
| encryptionAssumedRoleIdentifier | string | Optional role to use for disk encryption | 
| iamRole | string | IAM role used for accessing objects in s3 | 
| privateEndpointIds | array | List of private endpoints | 
| availablePrivateEndpointIds | array | List of available private endpoints ids that can be attached to the service | 
| dataWarehouseId | string | Data warehouse containing this service | 
| isPrimary | boolean | True if this service is the primary service in the data warehouse | 
| isReadonly | boolean | True if this service is read-only. It can only be read-only if a dataWarehouseId is provided. | 
| releaseChannel | string | Select fast if you want to get new ClickHouse releases as soon as they are available. You'll get new features faster, but with a higher risk of bugs. This feature is only available for production services. | 
| byocId | string | This is the ID returned after setting up a region for Bring Your Own Cloud (BYOC). When the byocId parameter is specified, the minReplicaMemoryGb and the maxReplicaGb parameters are required too, with values included among the following sizes: 28, 60, 124, 188, 252, 380. | 
| hasTransparentDataEncryption | boolean | True if the service should have the Transparent Data Encryption (TDE) enabled. TDE is only available for ENTERPRISE organizations tiers and can only be enabled at service creation. | 
| transparentDataEncryptionKeyId | string | The ID of the Transparent Data Encryption key used for the service. This is only available if hasTransparentDataEncryption is true. | 
| encryptionRoleId | string | The ID of the IAM role used for encryption. This is only available if hasTransparentDataEncryption is true. | 


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
  "availablePrivateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string",
  "hasTransparentDataEncryption": "boolean",
  "transparentDataEncryptionKeyId": "string",
  "encryptionRoleId": "string"
}
```

## Update service auto scaling settings

Updates minimum and maximum memory limits per replica and idle mode scaling behavior for the service. The memory settings are available only for "production" services and must be a multiple of 4 starting from 8GB. Please contact support to enable adjustment of numReplicas.

| Method | Path |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/replicaScaling` |

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
| numReplicas | number | Number of replicas for the service. The number of replicas must be between 2 and 20 for the first service in a warehouse. Services that are created in an existing warehouse can have a number of replicas as low as 1. Further restrictions may apply based on your organization's tier. It defaults to 1 for the BASIC tier and 3 for the SCALE and ENTERPRISE tiers. | 
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
| tier | string | DEPRECATED for BASIC, SCALE and ENTERPRISE organization tiers. Tier of the service: 'development', 'production', 'dedicated_high_mem', 'dedicated_high_cpu', 'dedicated_standard', 'dedicated_standard_n2d_standard_4', 'dedicated_standard_n2d_standard_8', 'dedicated_standard_n2d_standard_32', 'dedicated_standard_n2d_standard_128', 'dedicated_standard_n2d_standard_32_16SSD', 'dedicated_standard_n2d_standard_64_24SSD'. Production services scale, Development are fixed size. Azure services don't support Development tier | 
| minTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Minimum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and greater than or equal to 24. | 
| maxTotalMemoryGb | number | DEPRECATED - inaccurate for services with non-default numbers of replicas. Maximum memory of three workers during auto-scaling in Gb. Available only for 'production' services. Must be a multiple of 12 and lower than or equal to 360 for non paid services or 708 for paid services. | 
| minReplicaMemoryGb | number | Minimum auto-scaling memory in Gb for a single replica. Available only for 'production' services. Must be a multiple of 4 and greater than or equal to 8. | 
| maxReplicaMemoryGb | number | Maximum auto-scaling memory in Gb for a single replica . Available only for 'production' services. Must be a multiple of 4 and lower than or equal to 120 for non paid services or 236 for paid services. | 
| numReplicas | number | Number of replicas for the service. The number of replicas must be between 2 and 20 for the first service in a warehouse. Services that are created in an existing warehouse can have a number of replicas as low as 1. Further restrictions may apply based on your organization's tier. It defaults to 1 for the BASIC tier and 3 for the SCALE and ENTERPRISE tiers. | 
| idleScaling | boolean | When set to true the service is allowed to scale down to zero when idle. True by default. | 
| idleTimeoutMinutes | number | Set minimum idling timeout (in minutes). Must be >= 5 minutes. | 
| ipAccessList | array | List of IP addresses allowed to access the service | 
| createdAt | date-time | Service creation timestamp. ISO-8601. | 
| encryptionKey | string | Optional customer provided disk encryption key | 
| encryptionAssumedRoleIdentifier | string | Optional role to use for disk encryption | 
| iamRole | string | IAM role used for accessing objects in s3 | 
| privateEndpointIds | array | List of private endpoints | 
| availablePrivateEndpointIds | array | List of available private endpoints ids that can be attached to the service | 
| dataWarehouseId | string | Data warehouse containing this service | 
| isPrimary | boolean | True if this service is the primary service in the data warehouse | 
| isReadonly | boolean | True if this service is read-only. It can only be read-only if a dataWarehouseId is provided. | 
| releaseChannel | string | Select fast if you want to get new ClickHouse releases as soon as they are available. You'll get new features faster, but with a higher risk of bugs. This feature is only available for production services. | 
| byocId | string | This is the ID returned after setting up a region for Bring Your Own Cloud (BYOC). When the byocId parameter is specified, the minReplicaMemoryGb and the maxReplicaGb parameters are required too, with values included among the following sizes: 28, 60, 124, 188, 252, 380. | 
| hasTransparentDataEncryption | boolean | True if the service should have the Transparent Data Encryption (TDE) enabled. TDE is only available for ENTERPRISE organizations tiers and can only be enabled at service creation. | 
| transparentDataEncryptionKeyId | string | The ID of the Transparent Data Encryption key used for the service. This is only available if hasTransparentDataEncryption is true. | 
| encryptionRoleId | string | The ID of the IAM role used for encryption. This is only available if hasTransparentDataEncryption is true. | 


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
  "availablePrivateEndpointIds": "Array",
  "dataWarehouseId": "string",
  "isPrimary": "boolean",
  "isReadonly": "boolean",
  "releaseChannel": "string",
  "byocId": "string",
  "hasTransparentDataEncryption": "boolean",
  "transparentDataEncryptionKeyId": "string",
  "encryptionRoleId": "string"
}
```

## Update service password

Sets a new password for the service

| Method | Path |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/password` |

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

## Create a private endpoint.

Create a new private endpoint. The private endpoint will be associated with this service and organization

| Method | Path |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/services/{serviceId}/privateEndpoint` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the requested organization. | 
| serviceId | uuid | ID of the requested service. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | string | Private endpoint identifier | 
| description | string | Description of private endpoint | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | string | Private endpoint identifier | 
| description | string | Description of private endpoint | 
| cloudProvider | string | Cloud provider in which the private endpoint is lcoated | 
| region | string | Region in which the private endpoint is located | 


#### Sample response

```
{
  "id": "string",
  "description": "string",
  "cloudProvider": "string",
  "region": "string"
}
```

## Get prometheus metrics

Returns prometheus metrics for a service.

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/prometheus` |

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
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/backups` |

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
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/backups/{backupId}` |

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
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/backupConfiguration` |

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
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/backupConfiguration` |

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

## List reverse private endpoints

**This endpoint is in beta.** API contract is stable, and no breaking changes are expected in the future. <br /><br /> Returns a list of reverse private endpoints for the specified service.

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipesReversePrivateEndpoints` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the service that owns the Reverse Private Endpoint. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| description | string | Reverse private endpoint description. Maximum length is 255 characters. | 
| type | string | Reverse private endpoint type. | 
| vpcEndpointServiceName | string | VPC endpoint service name. | 
| vpcResourceConfigurationId | string | VPC resource configuration ID. Required for VPC_RESOURCE type. | 
| vpcResourceShareArn | string | VPC resource share ARN. Required for VPC_RESOURCE type. | 
| mskClusterArn | string | MSK cluster ARN. Required for MSK_MULTI_VPC type. | 
| mskAuthentication | string | MSK cluster authentication type. Required for MSK_MULTI_VPC type. | 
| id | uuid | Reverse private endpoint ID. | 
| serviceId | uuid | ClickHouse service ID reverse private endpoint is associated with. | 
| endpointId | string | Reverse private endpoint endpoint ID. | 
| dnsNames | array | Reverse private endpoint internal DNS names. | 
| privateDnsNames | array | Reverse private endpoint private DNS names. | 
| status | string | Reverse private endpoint status. | 


#### Sample response

```
{
  "description": "string",
  "type": "string",
  "vpcEndpointServiceName": "string",
  "vpcResourceConfigurationId": "string",
  "vpcResourceShareArn": "string",
  "mskClusterArn": "string",
  "mskAuthentication": "string",
  "id": "uuid",
  "serviceId": "uuid",
  "endpointId": "string",
  "dnsNames": "Array",
  "privateDnsNames": "Array",
  "status": "string"
}
```

## Create reverse private endpoint

**This endpoint is in beta.** API contract is stable, and no breaking changes are expected in the future. <br /><br /> Create a new reverse private endpoint.

| Method | Path |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipesReversePrivateEndpoints` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the service that owns the Reverse Private Endpoint. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| description | string | Reverse private endpoint description. Maximum length is 255 characters. | 
| type | string | Reverse private endpoint type. | 
| vpcEndpointServiceName | string | VPC endpoint service name. | 
| vpcResourceConfigurationId | string | VPC resource configuration ID. Required for VPC_RESOURCE type. | 
| vpcResourceShareArn | string | VPC resource share ARN. Required for VPC_RESOURCE type. | 
| mskClusterArn | string | MSK cluster ARN. Required for MSK_MULTI_VPC type. | 
| mskAuthentication | string | MSK cluster authentication type. Required for MSK_MULTI_VPC type. | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| description | string | Reverse private endpoint description. Maximum length is 255 characters. | 
| type | string | Reverse private endpoint type. | 
| vpcEndpointServiceName | string | VPC endpoint service name. | 
| vpcResourceConfigurationId | string | VPC resource configuration ID. Required for VPC_RESOURCE type. | 
| vpcResourceShareArn | string | VPC resource share ARN. Required for VPC_RESOURCE type. | 
| mskClusterArn | string | MSK cluster ARN. Required for MSK_MULTI_VPC type. | 
| mskAuthentication | string | MSK cluster authentication type. Required for MSK_MULTI_VPC type. | 
| id | uuid | Reverse private endpoint ID. | 
| serviceId | uuid | ClickHouse service ID reverse private endpoint is associated with. | 
| endpointId | string | Reverse private endpoint endpoint ID. | 
| dnsNames | array | Reverse private endpoint internal DNS names. | 
| privateDnsNames | array | Reverse private endpoint private DNS names. | 
| status | string | Reverse private endpoint status. | 


#### Sample response

```
{
  "description": "string",
  "type": "string",
  "vpcEndpointServiceName": "string",
  "vpcResourceConfigurationId": "string",
  "vpcResourceShareArn": "string",
  "mskClusterArn": "string",
  "mskAuthentication": "string",
  "id": "uuid",
  "serviceId": "uuid",
  "endpointId": "string",
  "dnsNames": "Array",
  "privateDnsNames": "Array",
  "status": "string"
}
```

## Get reverse private endpoint

**This endpoint is in beta.** API contract is stable, and no breaking changes are expected in the future. <br /><br /> Returns the reverse private endpoint with the specified ID.

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipesReversePrivateEndpoints/{reversePrivateEndpointId}` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the service that owns the Reverse Private Endpoint. | 
| reversePrivateEndpointId | uuid | ID of the reverse private endpoint to get. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| description | string | Reverse private endpoint description. Maximum length is 255 characters. | 
| type | string | Reverse private endpoint type. | 
| vpcEndpointServiceName | string | VPC endpoint service name. | 
| vpcResourceConfigurationId | string | VPC resource configuration ID. Required for VPC_RESOURCE type. | 
| vpcResourceShareArn | string | VPC resource share ARN. Required for VPC_RESOURCE type. | 
| mskClusterArn | string | MSK cluster ARN. Required for MSK_MULTI_VPC type. | 
| mskAuthentication | string | MSK cluster authentication type. Required for MSK_MULTI_VPC type. | 
| id | uuid | Reverse private endpoint ID. | 
| serviceId | uuid | ClickHouse service ID reverse private endpoint is associated with. | 
| endpointId | string | Reverse private endpoint endpoint ID. | 
| dnsNames | array | Reverse private endpoint internal DNS names. | 
| privateDnsNames | array | Reverse private endpoint private DNS names. | 
| status | string | Reverse private endpoint status. | 


#### Sample response

```
{
  "description": "string",
  "type": "string",
  "vpcEndpointServiceName": "string",
  "vpcResourceConfigurationId": "string",
  "vpcResourceShareArn": "string",
  "mskClusterArn": "string",
  "mskAuthentication": "string",
  "id": "uuid",
  "serviceId": "uuid",
  "endpointId": "string",
  "dnsNames": "Array",
  "privateDnsNames": "Array",
  "status": "string"
}
```

## Delete reverse private endpoint

**This endpoint is in beta.** API contract is stable, and no breaking changes are expected in the future. <br /><br /> Delete the reverse private endpoint with the specified ID.

| Method | Path |
| :----- | :--- |
| DELETE | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipesReversePrivateEndpoints/{reversePrivateEndpointId}` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the service that owns the Reverse Private Endpoint. | 
| reversePrivateEndpointId | uuid | ID of the reverse private endpoint to delete. | 


## List ClickPipes

**This endpoint is in beta.** API contract is stable, and no breaking changes are expected in the future. <br /><br /> Returns a list of ClickPipes.

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the service that owns the ClickPipe. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique ClickPipe ID. | 
| serviceId | uuid | ID of the service this ClickPipe belongs to. | 
| name | string | Name of the ClickPipe. | 
| description | string | Description of the ClickPipe. | 
| state | string | Current state of the ClickPipe. | 
| scaling.replicas | integer | Desired number of replicas. Only for scalable pipes. | 
| scaling.concurrency | integer | Desired number of concurrency. Only for S3 pipes. If set to 0, concurrency is auto-scaled based on the cluster memory. | 
| source.kafka |  |  | 
| source.objectStorage |  |  | 
| source.kinesis |  |  | 
| source.postgres |  |  | 
| destination.database | string | Destination database. | 
| destination.table | string | Destination table. Required field for all pipe types except Postgres. | 
| destination.managedTable | boolean | Is the table managed by ClickPipes? Required field for all pipe types except Postgres. | 
| destination.tableDefinition.engine.type | string | Engine type of the destination table. Currently MergeTree is the only supported engine. | 
| destination.tableDefinition.sortingKey | array | Sorting key of the destination table. List of columns. | 
| destination.tableDefinition.partitionBy | string | Partition key SQL expression. | 
| destination.tableDefinition.primaryKey | string | Primary key of SQL expression. | 
| destination.columns | array | Columns of the destination table. Required field for all pipe types except Postgres. | 
| fieldMappings | array | Field mappings of the ClickPipe. | 
| createdAt | string | Creation date of the ClickPipe. | 
| updatedAt | string | Last update date of the ClickPipe. | 


#### Sample response

```
{
  "id": "uuid",
  "serviceId": "uuid",
  "name": "string",
  "description": "string",
  "state": "string",
  "scaling": {},
  "source": {},
  "destination": {
    "database": "string",
    "table": "string",
    "managedTable": "boolean",
    "tableDefinition": {
      "engine": {
        "type": "string"
      },
      "sortingKey": "Array",
      "partitionBy": "string",
      "primaryKey": "string"
    },
    "columns": "Array"
  },
  "fieldMappings": "Array",
  "createdAt": "string",
  "updatedAt": "string"
}
```

## Create ClickPipe

**This endpoint is in beta.** API contract is stable, and no breaking changes are expected in the future. <br /><br /> Create a new ClickPipe.

| Method | Path |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the service to create the ClickPipe for. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| name | string | Name of the ClickPipe. | 
| description | string | Description of the ClickPipe. | 
| source |  |  | 
| destination |  |  | 
| fieldMappings | array | Field mappings of the ClickPipe. | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique ClickPipe ID. | 
| serviceId | uuid | ID of the service this ClickPipe belongs to. | 
| name | string | Name of the ClickPipe. | 
| description | string | Description of the ClickPipe. | 
| state | string | Current state of the ClickPipe. | 
| scaling.replicas | integer | Desired number of replicas. Only for scalable pipes. | 
| scaling.concurrency | integer | Desired number of concurrency. Only for S3 pipes. If set to 0, concurrency is auto-scaled based on the cluster memory. | 
| source.kafka |  |  | 
| source.objectStorage |  |  | 
| source.kinesis |  |  | 
| source.postgres |  |  | 
| destination.database | string | Destination database. | 
| destination.table | string | Destination table. Required field for all pipe types except Postgres. | 
| destination.managedTable | boolean | Is the table managed by ClickPipes? Required field for all pipe types except Postgres. | 
| destination.tableDefinition.engine.type | string | Engine type of the destination table. Currently MergeTree is the only supported engine. | 
| destination.tableDefinition.sortingKey | array | Sorting key of the destination table. List of columns. | 
| destination.tableDefinition.partitionBy | string | Partition key SQL expression. | 
| destination.tableDefinition.primaryKey | string | Primary key of SQL expression. | 
| destination.columns | array | Columns of the destination table. Required field for all pipe types except Postgres. | 
| fieldMappings | array | Field mappings of the ClickPipe. | 
| createdAt | string | Creation date of the ClickPipe. | 
| updatedAt | string | Last update date of the ClickPipe. | 


#### Sample response

```
{
  "id": "uuid",
  "serviceId": "uuid",
  "name": "string",
  "description": "string",
  "state": "string",
  "scaling": {},
  "source": {},
  "destination": {
    "database": "string",
    "table": "string",
    "managedTable": "boolean",
    "tableDefinition": {
      "engine": {
        "type": "string"
      },
      "sortingKey": "Array",
      "partitionBy": "string",
      "primaryKey": "string"
    },
    "columns": "Array"
  },
  "fieldMappings": "Array",
  "createdAt": "string",
  "updatedAt": "string"
}
```

## Get ClickPipe

**This endpoint is in beta.** API contract is stable, and no breaking changes are expected in the future. <br /><br /> Returns the specified ClickPipe.

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the service that owns the ClickPipe. | 
| clickPipeId | uuid | ID of the requested ClickPipe. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique ClickPipe ID. | 
| serviceId | uuid | ID of the service this ClickPipe belongs to. | 
| name | string | Name of the ClickPipe. | 
| description | string | Description of the ClickPipe. | 
| state | string | Current state of the ClickPipe. | 
| scaling.replicas | integer | Desired number of replicas. Only for scalable pipes. | 
| scaling.concurrency | integer | Desired number of concurrency. Only for S3 pipes. If set to 0, concurrency is auto-scaled based on the cluster memory. | 
| source.kafka |  |  | 
| source.objectStorage |  |  | 
| source.kinesis |  |  | 
| source.postgres |  |  | 
| destination.database | string | Destination database. | 
| destination.table | string | Destination table. Required field for all pipe types except Postgres. | 
| destination.managedTable | boolean | Is the table managed by ClickPipes? Required field for all pipe types except Postgres. | 
| destination.tableDefinition.engine.type | string | Engine type of the destination table. Currently MergeTree is the only supported engine. | 
| destination.tableDefinition.sortingKey | array | Sorting key of the destination table. List of columns. | 
| destination.tableDefinition.partitionBy | string | Partition key SQL expression. | 
| destination.tableDefinition.primaryKey | string | Primary key of SQL expression. | 
| destination.columns | array | Columns of the destination table. Required field for all pipe types except Postgres. | 
| fieldMappings | array | Field mappings of the ClickPipe. | 
| createdAt | string | Creation date of the ClickPipe. | 
| updatedAt | string | Last update date of the ClickPipe. | 


#### Sample response

```
{
  "id": "uuid",
  "serviceId": "uuid",
  "name": "string",
  "description": "string",
  "state": "string",
  "scaling": {},
  "source": {},
  "destination": {
    "database": "string",
    "table": "string",
    "managedTable": "boolean",
    "tableDefinition": {
      "engine": {
        "type": "string"
      },
      "sortingKey": "Array",
      "partitionBy": "string",
      "primaryKey": "string"
    },
    "columns": "Array"
  },
  "fieldMappings": "Array",
  "createdAt": "string",
  "updatedAt": "string"
}
```

## Update ClickPipe

**This endpoint is in beta.** API contract is stable, and no breaking changes are expected in the future. <br /><br /> Update the specified ClickPipe.

| Method | Path |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the service to create the ClickPipe for. | 
| clickPipeId | uuid | ID of the requested ClickPipe. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| name | string | Name of the ClickPipe. | 
| description | string | Description of the ClickPipe. | 
| source |  |  | 
| destination |  |  | 
| fieldMappings | array | Field mappings of the ClickPipe. This will not update the table schema, only the ClickPipe configuration. | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique ClickPipe ID. | 
| serviceId | uuid | ID of the service this ClickPipe belongs to. | 
| name | string | Name of the ClickPipe. | 
| description | string | Description of the ClickPipe. | 
| state | string | Current state of the ClickPipe. | 
| scaling.replicas | integer | Desired number of replicas. Only for scalable pipes. | 
| scaling.concurrency | integer | Desired number of concurrency. Only for S3 pipes. If set to 0, concurrency is auto-scaled based on the cluster memory. | 
| source.kafka |  |  | 
| source.objectStorage |  |  | 
| source.kinesis |  |  | 
| source.postgres |  |  | 
| destination.database | string | Destination database. | 
| destination.table | string | Destination table. Required field for all pipe types except Postgres. | 
| destination.managedTable | boolean | Is the table managed by ClickPipes? Required field for all pipe types except Postgres. | 
| destination.tableDefinition.engine.type | string | Engine type of the destination table. Currently MergeTree is the only supported engine. | 
| destination.tableDefinition.sortingKey | array | Sorting key of the destination table. List of columns. | 
| destination.tableDefinition.partitionBy | string | Partition key SQL expression. | 
| destination.tableDefinition.primaryKey | string | Primary key of SQL expression. | 
| destination.columns | array | Columns of the destination table. Required field for all pipe types except Postgres. | 
| fieldMappings | array | Field mappings of the ClickPipe. | 
| createdAt | string | Creation date of the ClickPipe. | 
| updatedAt | string | Last update date of the ClickPipe. | 


#### Sample response

```
{
  "id": "uuid",
  "serviceId": "uuid",
  "name": "string",
  "description": "string",
  "state": "string",
  "scaling": {},
  "source": {},
  "destination": {
    "database": "string",
    "table": "string",
    "managedTable": "boolean",
    "tableDefinition": {
      "engine": {
        "type": "string"
      },
      "sortingKey": "Array",
      "partitionBy": "string",
      "primaryKey": "string"
    },
    "columns": "Array"
  },
  "fieldMappings": "Array",
  "createdAt": "string",
  "updatedAt": "string"
}
```

## Delete ClickPipe

**This endpoint is in beta.** API contract is stable, and no breaking changes are expected in the future. <br /><br /> Delete the specified ClickPipe.

| Method | Path |
| :----- | :--- |
| DELETE | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the service that owns the ClickPipe. | 
| clickPipeId | uuid | ID of the ClickPipe to delete. | 


## Scaling ClickPipe

**This endpoint is in beta.** API contract is stable, and no breaking changes are expected in the future. <br /><br /> Change scaling settings for the specified ClickPipe.

| Method | Path |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}/scaling` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the service that owns the ClickPipe. | 
| clickPipeId | uuid | ID of the ClickPipe to update scaling settings. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| replicas | integer | Number of replicas to scale to. Use to scale Kafka pipes. | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique ClickPipe ID. | 
| serviceId | uuid | ID of the service this ClickPipe belongs to. | 
| name | string | Name of the ClickPipe. | 
| description | string | Description of the ClickPipe. | 
| state | string | Current state of the ClickPipe. | 
| scaling.replicas | integer | Desired number of replicas. Only for scalable pipes. | 
| scaling.concurrency | integer | Desired number of concurrency. Only for S3 pipes. If set to 0, concurrency is auto-scaled based on the cluster memory. | 
| source.kafka |  |  | 
| source.objectStorage |  |  | 
| source.kinesis |  |  | 
| source.postgres |  |  | 
| destination.database | string | Destination database. | 
| destination.table | string | Destination table. Required field for all pipe types except Postgres. | 
| destination.managedTable | boolean | Is the table managed by ClickPipes? Required field for all pipe types except Postgres. | 
| destination.tableDefinition.engine.type | string | Engine type of the destination table. Currently MergeTree is the only supported engine. | 
| destination.tableDefinition.sortingKey | array | Sorting key of the destination table. List of columns. | 
| destination.tableDefinition.partitionBy | string | Partition key SQL expression. | 
| destination.tableDefinition.primaryKey | string | Primary key of SQL expression. | 
| destination.columns | array | Columns of the destination table. Required field for all pipe types except Postgres. | 
| fieldMappings | array | Field mappings of the ClickPipe. | 
| createdAt | string | Creation date of the ClickPipe. | 
| updatedAt | string | Last update date of the ClickPipe. | 


#### Sample response

```
{
  "id": "uuid",
  "serviceId": "uuid",
  "name": "string",
  "description": "string",
  "state": "string",
  "scaling": {},
  "source": {},
  "destination": {
    "database": "string",
    "table": "string",
    "managedTable": "boolean",
    "tableDefinition": {
      "engine": {
        "type": "string"
      },
      "sortingKey": "Array",
      "partitionBy": "string",
      "primaryKey": "string"
    },
    "columns": "Array"
  },
  "fieldMappings": "Array",
  "createdAt": "string",
  "updatedAt": "string"
}
```

## Update ClickPipe state

**This endpoint is in beta.** API contract is stable, and no breaking changes are expected in the future. <br /><br /> Start, stop or resync ClickPipe. Stopping a ClickPipe will stop the ingestion process from any state. Starting is allowed for ClickPipes in the "Stopped" state or with a "Failed" state. Resyncing is only for Postgres pipes and can be done from any state.

| Method | Path |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}/state` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the organization that owns the service. | 
| serviceId | uuid | ID of the service that owns the ClickPipe. | 
| clickPipeId | uuid | ID of the ClickPipe to update state.. | 

### Body Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| command | string | Command to change the state: 'start', 'stop', 'resync'. | 

### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| id | uuid | Unique ClickPipe ID. | 
| serviceId | uuid | ID of the service this ClickPipe belongs to. | 
| name | string | Name of the ClickPipe. | 
| description | string | Description of the ClickPipe. | 
| state | string | Current state of the ClickPipe. | 
| scaling.replicas | integer | Desired number of replicas. Only for scalable pipes. | 
| scaling.concurrency | integer | Desired number of concurrency. Only for S3 pipes. If set to 0, concurrency is auto-scaled based on the cluster memory. | 
| source.kafka |  |  | 
| source.objectStorage |  |  | 
| source.kinesis |  |  | 
| source.postgres |  |  | 
| destination.database | string | Destination database. | 
| destination.table | string | Destination table. Required field for all pipe types except Postgres. | 
| destination.managedTable | boolean | Is the table managed by ClickPipes? Required field for all pipe types except Postgres. | 
| destination.tableDefinition.engine.type | string | Engine type of the destination table. Currently MergeTree is the only supported engine. | 
| destination.tableDefinition.sortingKey | array | Sorting key of the destination table. List of columns. | 
| destination.tableDefinition.partitionBy | string | Partition key SQL expression. | 
| destination.tableDefinition.primaryKey | string | Primary key of SQL expression. | 
| destination.columns | array | Columns of the destination table. Required field for all pipe types except Postgres. | 
| fieldMappings | array | Field mappings of the ClickPipe. | 
| createdAt | string | Creation date of the ClickPipe. | 
| updatedAt | string | Last update date of the ClickPipe. | 


#### Sample response

```
{
  "id": "uuid",
  "serviceId": "uuid",
  "name": "string",
  "description": "string",
  "state": "string",
  "scaling": {},
  "source": {},
  "destination": {
    "database": "string",
    "table": "string",
    "managedTable": "boolean",
    "tableDefinition": {
      "engine": {
        "type": "string"
      },
      "sortingKey": "Array",
      "partitionBy": "string",
      "primaryKey": "string"
    },
    "columns": "Array"
  },
  "fieldMappings": "Array",
  "createdAt": "string",
  "updatedAt": "string"
}
```
