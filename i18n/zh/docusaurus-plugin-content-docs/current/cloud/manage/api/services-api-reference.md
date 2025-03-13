---
sidebar_label: '服务'
title: '服务'
---
## 组织服务列表

返回组织中所有服务的列表。

| 方法   | 路径                                     |
| :----- | :-------------------------------------- |
| GET    | `/v1/organizations/{organizationId}/services` |

### 请求
#### 路径参数

| 名称            | 类型   | 描述                               |
| :-------------- | :----- | :-------------------------------- |
| organizationId  | uuid   | 请求的组织的ID。                 |

### 响应
#### 响应架构

| 名称                 | 类型   | 描述                               |
| :------------------ | :----- | :-------------------------------- |
| id                   | uuid   | 唯一的服务ID。                   |
| name                 | string | 服务名称。最多50个字符的字母数字字符串，可以包含空格。 |
| provider             | string | 云服务提供商                      |
| region               | string | 服务区域                          |
| state                | string | 当前服务的状态。                  |
| endpoints            | array  | 所有服务端点的列表。              |
| tier                 | string | 针对 BASIC、SCALE 和 ENTERPRISE 组织级别已弃用。服务的级别：'development'，'production'，'dedicated_high_mem'，'dedicated_high_cpu'，'dedicated_standard'，'dedicated_standard_n2d_standard_4'，'dedicated_standard_n2d_standard_8'，'dedicated_standard_n2d_standard_32'，'dedicated_standard_n2d_standard_128'，'dedicated_standard_n2d_standard_32_16SSD'，'dedicated_standard_n2d_standard_64_24SSD'。生产服务可扩展，开发服务为固定大小。Azure服务不支持开发级别。 |
| minTotalMemoryGb    | number | 已弃用 - 对于具有非默认副本数的服务不准确。在自动扩展期间，三个工作节点的最小内存（以GB为单位）。仅适用于'production'服务。必须是12的倍数且大于或等于24。 |
| maxTotalMemoryGb    | number | 已弃用 - 对于具有非默认副本数的服务不准确。在自动扩展期间，三个工作节点的最大内存（以GB为单位）。仅适用于'production'服务。必须是12的倍数，并且对于非付费服务最大值不得超过360，付费服务最大值不得超过708。 |
| minReplicaMemoryGb   | number | 在自动扩展期间，每个副本的最小总内存（以GB为单位）。必须是4的倍数且大于或等于8。 |
| maxReplicaMemoryGb   | number | 在自动扩展期间，每个副本的最大总内存（以GB为单位）。必须是4的倍数，并且对于非付费服务最大值不得超过120*，付费服务最大值不得超过236*。* - 最大副本大小受所选区域云服务提供商硬件可用性限制。 |
| numReplicas          | number | 服务的副本数量。第一个服务的副本数量必须在2到20之间。创建在现有仓库中的服务的副本数量可以低至1。具体限制可能根据组织的级别而有所不同。BASIC级别的默认副本数为1，SCALE和ENTERPRISE级别的副本数为3。 |
| idleScaling          | boolean | 设置为true时，服务允许在空闲时缩减至零。默认值为true。 |
| idleTimeoutMinutes    | number | 设置最小空闲超时（以分钟为单位）。必须大于或等于5分钟。 |
| ipAccessList         | array  | 允许访问该服务的IP地址列表       |
| createdAt            | date-time | 服务创建时间戳。ISO-8601格式。    |
| encryptionKey        | string | 可选的客户提供的磁盘加密密钥        |
| encryptionAssumedRoleIdentifier | string | 可选，用于磁盘加密的角色         |
| iamRole              | string | 用于访问S3中对象的IAM角色        |
| privateEndpointIds    | array  | 私有端点列表                      |
| availablePrivateEndpointIds | array  | 可以附加到服务的可用私有端点ID列表 |
| dataWarehouseId       | string | 包含该服务的数据仓库             |
| isPrimary             | boolean | 如果该服务是数据仓库中的主要服务则为true |
| isReadonly            | boolean | 如果该服务为只读则为true。只有提供了dataWarehouseId时才能为只读。 |
| releaseChannel        | string | 如果希望在发布新ClickHouse版本时尽快收到更新，请选择fast。您将更快获得新功能，但可能会有更高的错误风险。此功能仅适用于生产服务。 |
| byocId               | string | 这是在设置私有云（BYOC）区域后返回的ID。当指定byocId参数时，minReplicaMemoryGb和maxReplicaGb参数也需要，并包含在以下尺寸中：28，60，124，188，252，380。 |

#### 示例响应

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
  "byocId": "string"
}
```
## 创建新服务

在组织中创建一个新服务，并返回当前服务状态和访问服务的密码。服务会异步启动。

| 方法   | 路径                                     |
| :----- | :-------------------------------------- |
| POST    | `/v1/organizations/{organizationId}/services` |

### 请求
#### 路径参数

| 名称            | 类型   | 描述                               |
| :-------------- | :----- | :-------------------------------- |
| organizationId  | uuid   | 将拥有该服务的组织的ID。          |

### 请求体参数

| 名称                 | 类型   | 描述                               |
| :------------------ | :----- | :-------------------------------- |
| name                 | string | 服务名称。最多50个字符的字母数字字符串，可以包含空格。 |
| provider             | string | 云服务提供商                      |
| region               | string | 服务区域                          |
| tier                 | string | 针对 BASIC、SCALE 和 ENTERPRISE 组织级别已弃用。服务的级别：'development'，'production'，'dedicated_high_mem'，'dedicated_high_cpu'，'dedicated_standard'，'dedicated_standard_n2d_standard_4'，'dedicated_standard_n2d_standard_8'，'dedicated_standard_n2d_standard_32'，'dedicated_standard_n2d_standard_128'，'dedicated_standard_n2d_standard_32_16SSD'，'dedicated_standard_n2d_standard_64_24SSD'。生产服务可扩展，开发服务为固定大小。Azure服务不支持开发级别。 |
| ipAccessList         | array  | 允许访问该服务的IP地址列表       |
| minTotalMemoryGb    | number | 已弃用 - 对于具有非默认副本数的服务不准确。在自动扩展期间，三个工作节点的最小内存（以GB为单位）。仅适用于'production'服务。必须是12的倍数且大于或等于24。 |
| maxTotalMemoryGb    | number | 已弃用 - 对于具有非默认副本数的服务不准确。在自动扩展期间，三个工作节点的最大内存（以GB为单位）。仅适用于'production'服务。必须是12的倍数，并且对于非付费服务最大值不得超过360，付费服务最大值不得超过708。 |
| minReplicaMemoryGb   | number | 在自动扩展期间，每个副本的最小总内存（以GB为单位）。必须是4的倍数且大于或等于8。 |
| maxReplicaMemoryGb   | number | 在自动扩展期间，每个副本的最大总内存（以GB为单位）。必须是4的倍数，并且对于非付费服务最大值不得超过120*，付费服务最大值不得超过236*。* - 最大副本大小受所选区域云服务提供商硬件可用性限制。 |
| numReplicas          | number | 服务的副本数量。第一个服务的副本数量必须在2到20之间。创建在现有仓库中的服务的副本数量可以低至1。具体限制可能根据组织的级别而有所不同。BASIC级别的默认副本数为1，SCALE和ENTERPRISE级别的副本数为3。 |
| idleScaling          | boolean | 设置为true时，服务允许在空闲时缩减至零。默认值为true。 |
| idleTimeoutMinutes    | number | 设置最小空闲超时（以分钟为单位）。必须大于或等于5分钟。 |
| isReadonly            | boolean | 如果该服务为只读则为true。只有提供了dataWarehouseId时才能为只读。 |
| dataWarehouseId       | string | 包含该服务的数据仓库             |
| backupId             | string | 用作新服务初始状态的可选备份ID。当使用时，新实例的区域和级别必须与原始实例的值相同。 |
| encryptionKey        | string | 可选的客户提供的磁盘加密密钥        |
| encryptionAssumedRoleIdentifier | string | 可选角色，用于磁盘加密         |
| privateEndpointIds    | array  | 私有端点列表                      |
| privatePreviewTermsChecked | boolean | 接受私有预览条款和条件。仅在创建组织中第一个私有预览服务时需要。 |
| releaseChannel        | string | 如果希望在发布新ClickHouse版本时尽快收到更新，请选择fast。您将更快获得新功能，但可能会有更高的错误风险。此功能仅适用于生产服务。 |
| byocId               | string | 这是在设置私有云（BYOC）区域后返回的ID。当指定byocId参数时，minReplicaMemoryGb和maxReplicaGb参数也需要，并包含在以下尺寸中：28，60，124，188，252，380。 |
| endpoints            | array  | 列出要启用或禁用的服务端点          |

### 响应
#### 响应架构

| 名称                 | 类型   | 描述                               |
| :------------------ | :----- | :-------------------------------- |
| service.id          | uuid   | 唯一的服务ID。                   |
| service.name        | string | 服务名称。最多50个字符的字母数字字符串，可以包含空格。 |
| service.provider    | string | 云服务提供商                      |
| service.region      | string | 服务区域                          |
| service.state       | string | 当前服务的状态。                  |
| service.endpoints   | array  | 所有服务端点的列表。              |
| service.tier       | string | 针对 BASIC、SCALE 和 ENTERPRISE 组织级别已弃用。服务的级别：'development'，'production'，'dedicated_high_mem'，'dedicated_high_cpu'，'dedicated_standard'，'dedicated_standard_n2d_standard_4'，'dedicated_standard_n2d_standard_8'，'dedicated_standard_n2d_standard_32'，'dedicated_standard_n2d_standard_128'，'dedicated_standard_n2d_standard_32_16SSD'，'dedicated_standard_n2d_standard_64_24SSD'。生产服务可扩展，开发服务为固定大小。Azure服务不支持开发级别。 |
| service.minTotalMemoryGb    | number | 已弃用 - 对于具有非默认副本数的服务不准确。在自动扩展期间，三个工作节点的最小内存（以GB为单位）。仅适用于'production'服务。必须是12的倍数且大于或等于24。 |
| service.maxTotalMemoryGb    | number | 已弃用 - 对于具有非默认副本数的服务不准确。在自动扩展期间，三个工作节点的最大内存（以GB为单位）。仅适用于'production'服务。必须是12的倍数，并且对于非付费服务最大值不得超过360，付费服务最大值不得超过708。 |
| service.minReplicaMemoryGb   | number | 在自动扩展期间，每个副本的最小总内存（以GB为单位）。必须是4的倍数且大于或等于8。 |
| service.maxReplicaMemoryGb   | number | 在自动扩展期间，每个副本的最大总内存（以GB为单位）。必须是4的倍数，并且对于非付费服务最大值不得超过120*，付费服务最大值不得超过236*。* - 最大副本大小受所选区域云服务提供商硬件可用性限制。 |
| service.numReplicas          | number | 服务的副本数量。第一个服务的副本数量必须在2到20之间。创建在现有仓库中的服务的副本数量可以低至1。具体限制可能根据组织的级别而有所不同。BASIC级别的默认副本数为1，SCALE和ENTERPRISE级别的副本数为3。 |
| service.idleScaling          | boolean | 设置为true时，服务允许在空闲时缩减至零。默认值为true。 |
| service.idleTimeoutMinutes    | number | 设置最小空闲超时（以分钟为单位）。必须大于或等于5分钟。 |
| service.ipAccessList         | array  | 允许访问该服务的IP地址列表       |
| service.createdAt            | date-time | 服务创建时间戳。ISO-8601格式。    |
| service.encryptionKey        | string | 可选的客户提供的磁盘加密密钥        |
| service.encryptionAssumedRoleIdentifier | string | 可选角色，用于磁盘加密         |
| service.iamRole              | string | 用于访问S3中对象的IAM角色        |
| service.privateEndpointIds    | array  | 私有端点列表                      |
| service.availablePrivateEndpointIds | array  | 可以附加到服务的可用私有端点ID列表 |
| service.dataWarehouseId       | string | 包含该服务的数据仓库             |
| service.isPrimary             | boolean | 如果该服务是数据仓库中的主要服务则为true |
| service.isReadonly            | boolean | 如果该服务为只读则为true。只有提供了dataWarehouseId时才能为只读。 |
| service.releaseChannel        | string | 如果希望在发布新ClickHouse版本时尽快收到更新，请选择fast。您将更快获得新功能，但可能会有更高的错误风险。此功能仅适用于生产服务。 |
| service.byocId               | string | 这是在设置私有云（BYOC）区域后返回的ID。当指定byocId参数时，minReplicaMemoryGb和maxReplicaGb参数也需要，并包含在以下尺寸中：28，60，124，188，252，380。 |
| password                    | string | 新创建服务的密码。 |

#### 示例响应

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
    "byocId": "string"
  },
  "password": "string"
}
```
## 获取服务详情

返回属于组织的服务

| 方法   | 路径                                     |
| :----- | :-------------------------------------- |
| GET    | `/v1/organizations/{organizationId}/services/{serviceId}` |

### 请求
#### 路径参数

| 名称            | 类型   | 描述                               |
| :-------------- | :----- | :-------------------------------- |
| organizationId  | uuid   | 拥有该服务的组织的ID。            | 
| serviceId       | uuid   | 请求的服务的ID。                 |

### 响应
#### 响应架构

| 名称                 | 类型   | 描述                               |
| :------------------ | :----- | :-------------------------------- |
| id                   | uuid   | 唯一的服务ID。                   |
| name                 | string | 服务名称。最多50个字符的字母数字字符串，可以包含空格。 |
| provider             | string | 云服务提供商                      |
| region               | string | 服务区域                          |
| state                | string | 当前服务的状态。                  |
| endpoints            | array  | 所有服务端点的列表。              |
| tier                 | string | 针对 BASIC、SCALE 和 ENTERPRISE 组织级别已弃用。服务的级别：'development'，'production'，'dedicated_high_mem'，'dedicated_high_cpu'，'dedicated_standard'，'dedicated_standard_n2d_standard_4'，'dedicated_standard_n2d_standard_8'，'dedicated_standard_n2d_standard_32'，'dedicated_standard_n2d_standard_128'，'dedicated_standard_n2d_standard_32_16SSD'，'dedicated_standard_n2d_standard_64_24SSD'。生产服务可扩展，开发服务为固定大小。Azure服务不支持开发级别。 |
| minTotalMemoryGb    | number | 已弃用 - 对于具有非默认副本数的服务不准确。在自动扩展期间，三个工作节点的最小内存（以GB为单位）。仅适用于'production'服务。必须是12的倍数且大于或等于24。 |
| maxTotalMemoryGb    | number | 已弃用 - 对于具有非默认副本数的服务不准确。在自动扩展期间，三个工作节点的最大内存（以GB为单位）。仅适用于'production'服务。必须是12的倍数，并且对于非付费服务最大值不得超过360，付费服务最大值不得超过708。 |
| minReplicaMemoryGb   | number | 在自动扩展期间，每个副本的最小总内存（以GB为单位）。必须是4的倍数且大于或等于8。 |
| maxReplicaMemoryGb   | number | 在自动扩展期间，每个副本的最大总内存（以GB为单位）。必须是4的倍数，并且对于非付费服务最大值不得超过120*，付费服务最大值不得超过236*。* - 最大副本大小受所选区域云服务提供商硬件可用性限制。 |
| numReplicas          | number | 服务的副本数量。第一个服务的副本数量必须在2到20之间。创建在现有仓库中的服务的副本数量可以低至1。具体限制可能根据组织的级别而有所不同。BASIC级别的默认副本数为1，SCALE和ENTERPRISE级别的副本数为3。 |
| idleScaling          | boolean | 设置为true时，服务允许在空闲时缩减至零。默认值为true。 |
| idleTimeoutMinutes    | number | 设置最小空闲超时（以分钟为单位）。必须大于或等于5分钟。 |
| ipAccessList         | array  | 允许访问该服务的IP地址列表       |
| createdAt            | date-time | 服务创建时间戳。ISO-8601格式。    |
| encryptionKey        | string | 可选的客户提供的磁盘加密密钥        |
| encryptionAssumedRoleIdentifier | string | 可选角色，用于磁盘加密         |
| iamRole              | string | 用于访问S3中对象的IAM角色        |
| privateEndpointIds    | array  | 私有端点列表                      |
| availablePrivateEndpointIds | array  | 可以附加到服务的可用私有端点ID列表 |
| dataWarehouseId       | string | 包含该服务的数据仓库             |
| isPrimary             | boolean | 如果该服务是数据仓库中的主要服务则为true |
| isReadonly            | boolean | 如果该服务为只读则为true。只有提供了dataWarehouseId时才能为只读。 |
| releaseChannel        | string | 如果希望在发布新ClickHouse版本时尽快收到更新，请选择fast。您将更快获得新功能，但可能会有更高的错误风险。此功能仅适用于生产服务。 |
| byocId               | string | 这是在设置私有云（BYOC）区域后返回的ID。当指定byocId参数时，minReplicaMemoryGb和maxReplicaGb参数也需要，并包含在以下尺寸中：28，60，124，188，252，380。 |

#### 示例响应

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
  "byocId": "string"
}
```
## 更新服务基本详情

更新基本的服务详情，如服务名称或IP访问列表。

| 方法   | 路径                                     |
| :----- | :-------------------------------------- |
| PATCH  | `/v1/organizations/{organizationId}/services/{serviceId}` |

### 请求
#### 路径参数

| 名称            | 类型   | 描述                               |
| :-------------- | :----- | :-------------------------------- |
| organizationId  | uuid   | 拥有该服务的组织的ID。            | 
| serviceId       | uuid   | 要更新的服务的ID。                |

### 请求体参数

| 名称                  | 类型   | 描述                               |
| :------------------- | :----- | :-------------------------------- |
| name                  | string | 服务名称。最多50个字符的字母数字字符串，可以包含空格。 |
| ipAccessList          |        |                                   |
| privateEndpointIds     |        |                                   |
| releaseChannel         | string | 如果希望在发布新ClickHouse版本时尽快收到更新，请选择fast。您将更快获得新功能，但可能会有更高的错误风险。此功能仅适用于生产服务。 |
| endpoints             | array  | 要更改的服务端点列表              |

### 响应
#### 响应架构

| 名称                 | 类型   | 描述                               |
| :------------------ | :----- | :-------------------------------- |
| id                   | uuid   | 唯一的服务ID。                   |
| name                 | string | 服务名称。最多50个字符的字母数字字符串，可以包含空格。 |
| provider             | string | 云服务提供商                      |
| region               | string | 服务区域                          |
| state                | string | 当前服务的状态。                  |
| endpoints            | array  | 所有服务端点的列表。              |
| tier                 | string | 针对 BASIC、SCALE 和 ENTERPRISE 组织级别已弃用。服务的级别：'development'，'production'，'dedicated_high_mem'，'dedicated_high_cpu'，'dedicated_standard'，'dedicated_standard_n2d_standard_4'，'dedicated_standard_n2d_standard_8'，'dedicated_standard_n2d_standard_32'，'dedicated_standard_n2d_standard_128'，'dedicated_standard_n2d_standard_32_16SSD'，'dedicated_standard_n2d_standard_64_24SSD'。生产服务可扩展，开发服务为固定大小。Azure服务不支持开发级别。 |
| minTotalMemoryGb    | number | 已弃用 - 对于具有非默认副本数的服务不准确。在自动扩展期间，三个工作节点的最小内存（以GB为单位）。仅适用于'production'服务。必须是12的倍数且大于或等于24。 |
| maxTotalMemoryGb    | number | 已弃用 - 对于具有非默认副本数的服务不准确。在自动扩展期间，三个工作节点的最大内存（以GB为单位）。仅适用于'production'服务。必须是12的倍数，并且对于非付费服务最大值不得超过360，付费服务最大值不得超过708。 |
| minReplicaMemoryGb   | number | 在自动扩展期间，每个副本的最小总内存（以GB为单位）。必须是4的倍数且大于或等于8。 |
| maxReplicaMemoryGb   | number | 在自动扩展期间，每个副本的最大总内存（以GB为单位）。必须是4的倍数，并且对于非付费服务最大值不得超过120*，付费服务最大值不得超过236*。* - 最大副本大小受所选区域云服务提供商硬件可用性限制。 |
| numReplicas          | number | 服务的副本数量。第一个服务的副本数量必须在2到20之间。创建在现有仓库中的服务的副本数量可以低至1。具体限制可能根据组织的级别而有所不同。BASIC级别的默认副本数为1，SCALE和ENTERPRISE级别的副本数为3。 |
| idleScaling          | boolean | 设置为true时，服务允许在空闲时缩减至零。默认值为true。 |
| idleTimeoutMinutes    | number | 设置最小空闲超时（以分钟为单位）。必须大于或等于5分钟。 |
| ipAccessList         | array  | 允许访问该服务的IP地址列表       |
| createdAt            | date-time | 服务创建时间戳。ISO-8601格式。    |
| encryptionKey        | string | 可选的客户提供的磁盘加密密钥        |
| encryptionAssumedRoleIdentifier | string | 可选角色，用于磁盘加密         |
| iamRole              | string | 用于访问S3中对象的IAM角色        |
| privateEndpointIds    | array  | 私有端点列表                      |
| availablePrivateEndpointIds | array  | 可以附加到服务的可用私有端点ID列表 |
| dataWarehouseId       | string | 包含该服务的数据仓库             |
| isPrimary             | boolean | 如果该服务是数据仓库中的主要服务则为true |
| isReadonly            | boolean | 如果该服务为只读则为true。只有提供了dataWarehouseId时才能为只读。 |
| releaseChannel        | string | 如果希望在发布新ClickHouse版本时尽快收到更新，请选择fast。您将更快获得新功能，但可能会有更高的错误风险。此功能仅适用于生产服务。 |
| byocId               | string | 这是在设置私有云（BYOC）区域后返回的ID。当指定byocId参数时，minReplicaMemoryGb和maxReplicaGb参数也需要，并包含在以下尺寸中：28，60，124，188，252，380。 |

#### 示例响应

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
  "byocId": "string"
}
```
## 删除服务

删除服务。服务必须处于停止状态，并在此方法调用后异步删除。

| 方法   | 路径                                     |
| :----- | :-------------------------------------- |
| DELETE | `/v1/organizations/{organizationId}/services/{serviceId}` |

### 请求
#### 路径参数

| 名称            | 类型   | 描述                               |
| :-------------- | :----- | :-------------------------------- |
| organizationId  | uuid   | 拥有该服务的组织的ID。            | 
| serviceId       | uuid   | 要删除的服务的ID。                |

## 获取私有端点配置

设置私有端点所需的信息

| 方法   | 路径                                     |
| :----- | :-------------------------------------- |
| GET    | `/v1/organizations/{organizationId}/services/{serviceId}/privateEndpointConfig` |

### 请求
#### 路径参数

| 名称            | 类型   | 描述                               |
| :-------------- | :----- | :-------------------------------- |
| organizationId  | uuid   | 请求的组织的ID。                  | 
| serviceId       | uuid   | 请求的服务的ID。                  |

### 响应
#### 响应架构

| 名称                    | 类型   | 描述                               |
| :--------------------- | :----- | :-------------------------------- |
| endpointServiceId      | string | 您在VPC中为AWS（服务名称）、GCP（目标服务）或Azure（私有链接服务）创建的接口端点的唯一标识符。 | 
| privateDnsHostname     | string | 您创建的VPC的私有DNS主机名。      |

#### 示例响应

```
{
  "endpointServiceId": "string",
  "privateDnsHostname": "string"
}
```
## 获取给定实例的服务查询端点

这是一个实验性功能。请联系支持以启用它。

| 方法   | 路径                                     |
| :----- | :-------------------------------------- |
| GET    | `/v1/organizations/{organizationId}/services/{serviceId}/serviceQueryEndpoint` |

### 请求
#### 路径参数

| 名称            | 类型   | 描述                               |
| :-------------- | :----- | :-------------------------------- |
| organizationId  | uuid   | 请求的组织的ID。                  | 
| serviceId       | uuid   | 请求的服务的ID。                  |

### 响应
#### 响应架构

| 名称                 | 类型   | 描述                               |
| :------------------ | :----- | :-------------------------------- |
| id                   | string | 服务查询端点的ID                   | 
| openApiKeys          | array  | 可以访问服务查询端点的OpenAPI密钥的列表 |
| roles                | array  | 可以访问服务查询端点的角色列表     | 
| allowedOrigins       | string | 以逗号分隔的允许来源域名列表       |

#### 示例响应

```
{
  "id": "string",
  "openApiKeys": "Array",
  "roles": "Array",
  "allowedOrigins": "string"
}
```
## 删除给定实例的服务查询端点

这是一个实验性功能。请联系支持以启用它。

| 方法   | 路径                                     |
| :----- | :-------------------------------------- |
| DELETE | `/v1/organizations/{organizationId}/services/{serviceId}/serviceQueryEndpoint` |

### 请求
#### 路径参数

| 名称            | 类型   | 描述                               |
| :-------------- | :----- | :-------------------------------- |
| organizationId  | uuid   | 请求的组织的ID。                  | 
| serviceId       | uuid   | 请求的服务的ID。                  |

## 更新给定实例的服务查询端点

这是一个实验性功能。请联系支持以启用它。

| 方法   | 路径                                     |
| :----- | :-------------------------------------- |
| POST   | `/v1/organizations/{organizationId}/services/{serviceId}/serviceQueryEndpoint` |

### 请求
#### 路径参数

| 名称            | 类型   | 描述                               |
| :-------------- | :----- | :-------------------------------- |
| organizationId  | uuid   | 请求的组织的ID。                  | 
| serviceId       | uuid   | 请求的服务的ID。                  |

### 请求体参数

| 名称                 | 类型   | 描述                               |
| :------------------ | :----- | :-------------------------------- |
| roles                | array  | 角色                               | 
| openApiKeys          | array  | 服务查询端点的版本                 | 
| allowedOrigins       | string | 以逗号分隔的允许来源域名列表       |

### 响应
#### 响应架构

| 名称                 | 类型   | 描述                               |
| :------------------ | :----- | :-------------------------------- |
| id                   | string | 服务查询端点的ID                   | 
| openApiKeys          | array  | 可以访问服务查询端点的OpenAPI密钥的列表 |
| roles                | array  | 可以访问服务查询端点的角色列表     | 
| allowedOrigins       | string | 以逗号分隔的允许来源域名列表       |

#### 示例响应

```
{
  "id": "string",
  "openApiKeys": "Array",
  "roles": "Array",
  "allowedOrigins": "string"
}
```
## 更新服务状态

启动或停止服务

| 方法   | 路径                                     |
| :----- | :-------------------------------------- |
| PATCH  | `/v1/organizations/{organizationId}/services/{serviceId}/state` |

### 请求
#### 路径参数

| 名称            | 类型   | 描述                               |
| :-------------- | :----- | :-------------------------------- |
| organizationId  | uuid   | 拥有该服务的组织的ID。            | 
| serviceId       | uuid   | 要更新状态的服务的ID。            |

### 请求体参数

| 名称    | 类型   | 描述                               |
| :------ | :----- | :-------------------------------- |
| command | string | 改变状态的命令：'start'，'stop'。 |
### 响应
```
```yaml
title: '响应架构'
sidebar_label: '响应架构'
keywords: ['响应架构', 'ClickHouse']
description: '响应架构的详细信息'
```

#### 响应架构

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| id | uuid | 唯一的服务ID。 | 
| name | string | 服务名称。字符和数字的字符串，允许有空格，最多50个字符。 | 
| provider | string | 云提供商 | 
| region | string | 服务区域。 | 
| state | string | 当前服务的状态。 | 
| endpoints | array | 所有服务端点的列表。 | 
| tier | string | 已不推荐使用，针对基础、规模和企业组织级别。服务的级别：'development'，'production'，'dedicated_high_mem'，'dedicated_high_cpu'，'dedicated_standard'，'dedicated_standard_n2d_standard_4'，'dedicated_standard_n2d_standard_8'，'dedicated_standard_n2d_standard_32'，'dedicated_standard_n2d_standard_128'，'dedicated_standard_n2d_standard_32_16SSD'，'dedicated_standard_n2d_standard_64_24SSD'。生产服务可以扩展，开发环境的规模是固定的。Azure服务不支持开发级别。 | 
| minTotalMemoryGb | number | 已不推荐使用 - 对于副本数量不同于默认值的服务不准确。自动扩展期间三个工作节点的最小内存（以Gb为单位）。仅适用于'production'服务。必须是12的倍数且大于或等于24。 | 
| maxTotalMemoryGb | number | 已不推荐使用 - 对于副本数量不同于默认值的服务不准确。自动扩展期间三个工作节点的最大内存（以Gb为单位）。仅适用于'production'服务。必须是12的倍数且不超过360（对未付费服务）或708（对付费服务）。 | 
| minReplicaMemoryGb | number | 自动扩展期间每个副本的最小总内存（以Gb为单位）。必须是4的倍数且大于或等于8。 | 
| maxReplicaMemoryGb | number | 自动扩展期间每个副本的最大总内存（以Gb为单位）。必须是4的倍数且不超过120*（对未付费服务）或236*（对付费服务）。* - 最大副本大小受您选择的区域的云提供商硬件可用性限制。 | 
| numReplicas | number | 服务的副本数量。对于仓库中第一个服务，副本数量必须在2到20之间。在现有仓库中创建的服务可以有最低1个副本。根据您组织的级别可能会有进一步的限制。对于基础级别默认为1，对于规模和企业级别默认为3。 | 
| idleScaling | boolean | 如果设置为true，服务在空闲时允许缩减为零。默认值为true。 | 
| idleTimeoutMinutes | number | 设置最小空闲超时时间（以分钟为单位）。必须大于或等于5分钟。 | 
| ipAccessList | array | 允许访问服务的IP地址列表 | 
| createdAt | date-time | 服务创建时间戳。ISO-8601格式。 | 
| encryptionKey | string | 可选的客户提供的磁盘加密密钥 | 
| encryptionAssumedRoleIdentifier | string | 用于磁盘加密的可选角色 | 
| iamRole | string | 用于访问s3对象的IAM角色 | 
| privateEndpointIds | array | 私有端点的列表 | 
| availablePrivateEndpointIds | array | 可附加到服务的可用私有端点ID列表 | 
| dataWarehouseId | string | 包含此服务的数据仓库 | 
| isPrimary | boolean | 如果此服务是数据仓库的主要服务则为true | 
| isReadonly | boolean | 如果此服务是只读的，则为true。如果提供了dataWarehouseId则可以是只读。 | 
| releaseChannel | string | 选择fast如果需要在可用时尽快获得新的ClickHouse版本。您会更快获得新功能，但可能bug的风险较高。此功能仅适用于生产服务。 | 
| byocId | string | 设置自有云（BYOC）区域后返回的ID。当指定byocId参数时，minReplicaMemoryGb和maxReplicaGb参数也是必需的，值必须包括以下大小中的一个：28，60，124，188，252，380。 |

#### 示例响应

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
  "byocId": "string"
}
```
## 更新服务自动扩展设置

更新服务的最小和最大内存限制以及空闲模式的缩放行为。内存设置仅适用于“production”服务，且必须是12的倍数，且从24GB开始。请联系支持以启用numReplicas的调整。

| 方法 | 路径 |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/scaling` |
### 请求
#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 拥有该服务的组织ID。 | 
| serviceId | uuid | 要更新扩展参数的服务ID。 |
### 请求体参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| minTotalMemoryGb | number | 已不推荐使用 - 对于副本数量不同于默认值的服务不准确。自动扩展期间三个工作节点的最小内存（以Gb为单位）。仅适用于'production'服务。必须是12的倍数且大于或等于24。 | 
| maxTotalMemoryGb | number | 已不推荐使用 - 对于副本数量不同于默认值的服务不准确。自动扩展期间三个工作节点的最大内存（以Gb为单位）。仅适用于'production'服务。必须是12的倍数且不超过360（对未付费服务）或708（对付费服务）。 | 
| numReplicas | number | 服务的副本数量。副本数量必须在2到20之间，为仓库中的第一个服务。 在现有仓库中创建的服务可以有最低1个副本。根据您组织的级别可能会有进一步的限制。基础级别默认为1，规模和企业级别默认为3。 | 
| idleScaling | boolean | 如果设置为true，服务在空闲时允许缩减为零。默认值为true。 | 
| idleTimeoutMinutes | number | 设置最小空闲超时时间（以分钟为单位）。必须大于或等于5分钟。 |
### 响应
#### 响应架构

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| id | uuid | 唯一的服务ID。 | 
| name | string | 服务名称。字符和数字的字符串，允许有空格，最多50个字符。 | 
| provider | string | 云提供商 | 
| region | string | 服务区域。 | 
| state | string | 当前服务的状态。 | 
| endpoints | array | 所有服务端点的列表。 | 
| tier | string | 已不推荐使用，针对基础、规模和企业组织级别。服务的级别：'development'，'production'，'dedicated_high_mem'，'dedicated_high_cpu'，'dedicated_standard'，'dedicated_standard_n2d_standard_4'，'dedicated_standard_n2d_standard_8'，'dedicated_standard_n2d_standard_32'，'dedicated_standard_n2d_standard_128'，'dedicated_standard_n2d_standard_32_16SSD'，'dedicated_standard_n2d_standard_64_24SSD'。生产服务可以扩展，开发环境的规模是固定的。Azure服务不支持开发级别。 | 
| minTotalMemoryGb | number | 已不推荐使用 - 对于副本数量不同于默认值的服务不准确。自动扩展期间三个工作节点的最小内存（以Gb为单位）。仅适用于'production'服务。必须是12的倍数且大于或等于24。 | 
| maxTotalMemoryGb | number | 已不推荐使用 - 对于副本数量不同于默认值的服务不准确。自动扩展期间三个工作节点的最大内存（以Gb为单位）。仅适用于'production'服务。必须是12的倍数且不超过360（对未付费服务）或708（对付费服务）。 | 
| minReplicaMemoryGb | number | 自动扩展期间每个副本的最小总内存（以Gb为单位）。必须是4的倍数且大于或等于8。 | 
| maxReplicaMemoryGb | number | 自动扩展期间每个副本的最大总内存（以Gb为单位）。必须是4的倍数且不超过120*（对未付费服务）或236*（对付费服务）。* - 最大副本大小受您选择的区域的云提供商硬件可用性限制。 | 
| numReplicas | number | 服务的副本数量。副本数量必须在2到20之间，为仓库中的第一个服务。 在现有仓库中创建的服务可以有最低1个副本。根据您组织的级别可能会有进一步的限制。基础级别默认为1，规模和企业级别默认为3。 | 
| idleScaling | boolean | 如果设置为true，服务在空闲时允许缩减为零。默认值为true。 | 
| idleTimeoutMinutes | number | 设置最小空闲超时时间（以分钟为单位）。必须大于或等于5分钟。 | 
| ipAccessList | array | 允许访问服务的IP地址列表 | 
| createdAt | date-time | 服务创建时间戳。ISO-8601格式。 | 
| encryptionKey | string | 可选的客户提供的磁盘加密密钥 | 
| encryptionAssumedRoleIdentifier | string | 用于磁盘加密的可选角色 | 
| iamRole | string | 用于访问s3对象的IAM角色 | 
| privateEndpointIds | array | 私有端点的列表 | 
| availablePrivateEndpointIds | array | 可附加到服务的可用私有端点ID列表 | 
| dataWarehouseId | string | 包含此服务的数据仓库 | 
| isPrimary | boolean | 如果此服务是数据仓库的主要服务则为true | 
| isReadonly | boolean | 如果此服务是只读的，则为true。只有在提供了dataWarehouseId的情况下，才可以是只读。 | 
| releaseChannel | string | 选择fast如果需要在可用时尽快获得新的ClickHouse版本。您会更快获得新功能，但可能bug的风险较高。此功能仅适用于生产服务。 | 
| byocId | string | 设置自有云（BYOC）区域后返回的ID。当指定byocId参数时，minReplicaMemoryGb和maxReplicaGb参数也是必需的，值必须包括以下大小中的一个：28，60，124，188，252，380。 |

#### 示例响应

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
  "byocId": "string"
}
```
## 更新服务密码

为服务设置新密码

| 方法 | 路径 |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/password` |
### 请求
#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 拥有该服务的组织ID。 | 
| serviceId | uuid | 要更新密码的服务ID。 |
### 请求体参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| newPasswordHash | string | 可选的密码哈希。用于避免密码通过网络传输。如果未提供，将生成新密码并在响应中给出。否则将使用此哈希。算法：echo -n "yourpassword" | sha256sum | tr -d '-' | xxd -r -p | base64 | 
| newDoubleSha1Hash | string | 可选的双SHA1密码哈希，用于MySQL协议。如果未提供newPasswordHash，则忽略此键，并将使用生成的密码。算法：echo -n "yourpassword" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-' |
### 响应
#### 响应架构

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| password | string | 新服务密码。仅在请求中没有'newPasswordHash'时提供 |

#### 示例响应

```
{
  "password": "string"
}
```
## 创建私有端点。

创建一个新的私有端点。私有端点将与此服务和组织相关联

| 方法 | 路径 |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/services/{serviceId}/privateEndpoint` |
### 请求
#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 所请求组织的ID。 | 
| serviceId | uuid | 所请求服务的ID。 |
### 请求体参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| id | string | 私有端点标识符 | 
| description | string | 私有端点的描述 |
### 响应
#### 响应架构

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| id | string | 私有端点标识符 | 
| description | string | 私有端点的描述 | 
| cloudProvider | string | 私有端点所在的云提供商 | 
| region | string | 私有端点所在的区域 |
#### 示例响应

```
{
  "id": "string",
  "description": "string",
  "cloudProvider": "string",
  "region": "string"
}
```
## 获取Prometheus指标

返回服务的Prometheus指标。

| 方法 | 路径 |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/prometheus` |
### 请求
#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 拥有服务的组织ID。 | 
| serviceId | uuid | 所请求的服务ID。 | 
| filtered_metrics | boolean | 返回过滤后的Prometheus指标列表。 |

## 服务备份列表

返回服务的所有备份列表。最近的备份出现在列表的最前面。

| 方法 | 路径 |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/backups` |
### 请求
#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 拥有备份的组织ID。 | 
| serviceId | uuid | 从中创建备份的服务ID。 |
### 响应
#### 响应架构

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| id | uuid | 唯一备份ID。 | 
| status | string | 备份状态：'done'，'error'，'in_progress'。 | 
| serviceId | string | 名称  | 
| startedAt | date-time | 备份开始时间戳。ISO-8601格式。 | 
| finishedAt | date-time | 备份完成时间戳。ISO-8601格式。仅在完成的备份可用 | 
| sizeInBytes | number | 备份的字节大小。 | 
| durationInSeconds | number | 执行备份所需的时间（以秒为单位）。如果状态仍为in_progress，这是备份开始到现在的秒数。 | 
| type | string | 备份类型（“full”或“incremental”）。 |

#### 示例响应

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
## 获取备份详细信息

返回单个备份信息。

| 方法 | 路径 |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/backups/{backupId}` |
### 请求
#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 拥有备份的组织ID。 | 
| serviceId | uuid | 从中创建备份的服务ID。 | 
| backupId | uuid | 所请求的备份ID。 |
### 响应
#### 响应架构

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| id | uuid | 唯一备份ID。 | 
| status | string | 备份状态：'done'，'error'，'in_progress'。 | 
| serviceId | string | 名称  | 
| startedAt | date-time | 备份开始时间戳。ISO-8601格式。 | 
| finishedAt | date-time | 备份完成时间戳。ISO-8601格式。仅在完成的备份可用 | 
| sizeInBytes | number | 备份的字节大小。 | 
| durationInSeconds | number | 执行备份所需的时间（以秒为单位）。如果状态仍为in_progress，这是备份开始到现在的秒数。 | 
| type | string | 备份类型（“full”或“incremental”）。 |

#### 示例响应

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
## 获取服务备份配置

返回服务的备份配置。

| 方法 | 路径 |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/backupConfiguration` |
### 请求
#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 拥有服务的组织ID。 | 
| serviceId | uuid | 服务ID。 |
### 响应
#### 响应架构

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| backupPeriodInHours | number | 每次备份之间的时间间隔（以小时为单位）。 | 
| backupRetentionPeriodInHours | number | 备份可用的最小持续时间（以小时为单位）。 | 
| backupStartTime | string | 备份执行的时间，格式为HH:MM（根据UTC时区计算）。定义后，备份周期重置为每24小时。 |
#### 示例响应

```
{
  "backupPeriodInHours": 0,
  "backupRetentionPeriodInHours": 0,
  "backupStartTime": "string"
}
```
## 更新服务备份配置

更新服务备份配置。需要ADMIN授权密钥角色。将属性设置为null值将重置属性为其默认值。

| 方法 | 路径 |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/backupConfiguration` |
### 请求
#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 拥有服务的组织ID。 | 
| serviceId | uuid | 服务ID。 |
### 请求体参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| backupPeriodInHours | number | 每次备份之间的时间间隔（以小时为单位）。 | 
| backupRetentionPeriodInHours | number | 备份可用的最小持续时间（以小时为单位）。 | 
| backupStartTime | string | 备份执行的时间，格式为HH:MM（根据UTC时区计算）。定义后，备份周期重置为每24小时。 |
### 响应
#### 响应架构

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| backupPeriodInHours | number | 每次备份之间的时间间隔（以小时为单位）。 | 
| backupRetentionPeriodInHours | number | 备份可用的最小持续时间（以小时为单位）。 | 
| backupStartTime | string | 备份执行的时间，格式为HH:MM（根据UTC时区计算）。定义后，备份周期重置为每24小时。 |
#### 示例响应

```
{
  "backupPeriodInHours": 0,
  "backupRetentionPeriodInHours": 0,
  "backupStartTime": "string"
}
```
## 列出ClickPipes

**此端点处于测试阶段，可能会有所更改。** 请联系ClickHouse支持以获取更多信息。<br /><br /> 返回ClickPipes的列表。

| 方法 | 路径 |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes` |
### 请求
#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 拥有服务的组织ID。 | 
| serviceId | uuid | 拥有ClickPipe的服务ID。 |
### 响应
#### 响应架构

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| id | uuid | 唯一的ClickPipe ID。 | 
| serviceId | uuid | 此ClickPipe所属于的服务ID。 | 
| name | string | ClickPipe的名称。 | 
| description | string | ClickPipe的描述。 | 
| state | string | 当前ClickPipe的状态。 | 
| scaling.replicas | integer | 所需的副本数量。仅适用于可扩展的管道。 | 
| scaling.concurrency | integer | 所需的并发数量。仅适用于S3管道。如果设置为0，则并发会根据集群内存自动扩展。 | 
| source.kafka |  |  | 
| source.objectStorage |  |  | 
| source.kinesis |  |  | 
| source.postgres |  |  | 
| destination.database | string | 目标数据库。 | 
| destination.table | string | 目标表。所有管道类型（除Postgres外）都必需的字段。 | 
| destination.managedTable | boolean | 表是否由ClickPipes管理？所有管道类型（除Postgres外）都必需的字段。 | 
| destination.tableDefinition.engine.type | string | 目标表的引擎类型。目前，只有MergeTree是支持的引擎。 | 
| destination.tableDefinition.sortingKey | array | 目标表的排序键。列的列表。 | 
| destination.tableDefinition.partitionBy | string | 分区键SQL表达式。 | 
| destination.tableDefinition.primaryKey | string | 主键的SQL表达式。 | 
| destination.columns | array | 目标表的列。所有管道类型（除Postgres外）都必需的字段。 | 
| fieldMappings | array | ClickPipe的字段映射。 | 
| createdAt | string | ClickPipe的创建日期。 | 
| updatedAt | string | ClickPipe的最后更新日期。 |

#### 示例响应

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
## 创建ClickPipe

**此端点处于测试阶段，可能会有所更改。** 请联系ClickHouse支持以获取更多信息。<br /><br /> 创建一个新的ClickPipe。

| 方法 | 路径 |
| :----- | :--- |
| POST | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes` |
### 请求
#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 拥有服务的组织ID。 | 
| serviceId | uuid | 要为其创建ClickPipe的服务ID。 |
### 请求体参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| name | string | ClickPipe的名称。 | 
| description | string | ClickPipe的描述。 | 
| source |  |  | 
| destination |  |  | 
| fieldMappings | array | ClickPipe的字段映射。 |
### 响应
```
#### 响应模式

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| id | uuid | 唯一的 ClickPipe ID. | 
| serviceId | uuid | 此 ClickPipe 属于的服务的 ID. | 
| name | string | ClickPipe 的名称. | 
| description | string | ClickPipe 的描述. | 
| state | string | ClickPipe 的当前状态. | 
| scaling.replicas | integer | 所需的副本数量. 仅适用于可扩展的管道. | 
| scaling.concurrency | integer | 所需的并发数量. 仅适用于 S3 管道. 如果设置为 0，则并发根据集群内存自动扩展. | 
| source.kafka |  |  | 
| source.objectStorage |  |  | 
| source.kinesis |  |  | 
| source.postgres |  |  | 
| destination.database | string | 目标数据库. | 
| destination.table | string | 目标表. 除 Postgres 外，所有管道类型的必填字段. | 
| destination.managedTable | boolean | 表是否由 ClickPipes 管理？除 Postgres 外，所有管道类型的必填字段. | 
| destination.tableDefinition.engine.type | string | 目标表的引擎类型. 当前仅支持 MergeTree. | 
| destination.tableDefinition.sortingKey | array | 目标表的排序键. 列的列表. | 
| destination.tableDefinition.partitionBy | string | 分区键 SQL 表达式. | 
| destination.tableDefinition.primaryKey | string | SQL 表达式的主键. | 
| destination.columns | array | 目标表的列. 除 Postgres 外，所有管道类型的必填字段. | 
| fieldMappings | array | ClickPipe 的字段映射. | 
| createdAt | string | ClickPipe 的创建日期. | 
| updatedAt | string | ClickPipe 的最后更新日期. |
#### 示例响应

```json
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
## 获取 ClickPipe

**此端点处于 alpha 阶段，可能会有所更改。** 如需更多信息，请联系 ClickHouse 支持。<br /><br /> 返回指定的 ClickPipe.

| 方法 | 路径 |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}` |
### 请求
#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 拥有该服务的组织 ID. | 
| serviceId | uuid | 拥有该 ClickPipe 的服务的 ID. | 
| clickPipeId | uuid | 请求的 ClickPipe 的 ID. |
### 响应
#### 响应模式

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| id | uuid | 唯一的 ClickPipe ID. | 
| serviceId | uuid | 此 ClickPipe 属于的服务的 ID. | 
| name | string | ClickPipe 的名称. | 
| description | string | ClickPipe 的描述. | 
| state | string | ClickPipe 的当前状态. | 
| scaling.replicas | integer | 所需的副本数量. 仅适用于可扩展的管道. | 
| scaling.concurrency | integer | 所需的并发数量. 仅适用于 S3 管道. 如果设置为 0，则并发根据集群内存自动扩展. | 
| source.kafka |  |  | 
| source.objectStorage |  |  | 
| source.kinesis |  |  | 
| source.postgres |  |  | 
| destination.database | string | 目标数据库. | 
| destination.table | string | 目标表. 除 Postgres 外，所有管道类型的必填字段. | 
| destination.managedTable | boolean | 表是否由 ClickPipes 管理？除 Postgres 外，所有管道类型的必填字段. | 
| destination.tableDefinition.engine.type | string | 目标表的引擎类型. 当前仅支持 MergeTree. | 
| destination.tableDefinition.sortingKey | array | 目标表的排序键. 列的列表. | 
| destination.tableDefinition.partitionBy | string | 分区键 SQL 表达式. | 
| destination.tableDefinition.primaryKey | string | SQL 表达式的主键. | 
| destination.columns | array | 目标表的列. 除 Postgres 外，所有管道类型的必填字段. | 
| fieldMappings | array | ClickPipe 的字段映射. | 
| createdAt | string | ClickPipe 的创建日期. | 
| updatedAt | string | ClickPipe 的最后更新日期. |
#### 示例响应

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
## 更新 ClickPipe

**此端点处于 alpha 阶段，可能会有所更改。** 如需更多信息，请联系 ClickHouse 支持。<br /><br /> 更新指定的 ClickPipe.

| 方法 | 路径 |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}` |
### 请求
#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 拥有该服务的组织 ID. | 
| serviceId | uuid | 创建 ClickPipe 的服务的 ID. | 
| clickPipeId | uuid | 请求的 ClickPipe 的 ID. |
### 请求体参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| name | string | ClickPipe 的名称. | 
| description | string | ClickPipe 的描述. | 
| source |  |  | 
| destination |  |  | 
| fieldMappings | array | ClickPipe 的字段映射. 这不会更新表架构，仅更新 ClickPipe 配置. |
### 响应
#### 响应模式

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| id | uuid | 唯一的 ClickPipe ID. | 
| serviceId | uuid | 此 ClickPipe 属于的服务的 ID. | 
| name | string | ClickPipe 的名称. | 
| description | string | ClickPipe 的描述. | 
| state | string | ClickPipe 的当前状态. | 
| scaling.replicas | integer | 所需的副本数量. 仅适用于可扩展的管道. | 
| scaling.concurrency | integer | 所需的并发数量. 仅适用于 S3 管道. 如果设置为 0，则并发根据集群内存自动扩展. | 
| source.kafka |  |  | 
| source.objectStorage |  |  | 
| source.kinesis |  |  | 
| source.postgres |  |  | 
| destination.database | string | 目标数据库. | 
| destination.table | string | 目标表. 除 Postgres 外，所有管道类型的必填字段. | 
| destination.managedTable | boolean | 表是否由 ClickPipes 管理？除 Postgres 外，所有管道类型的必填字段. | 
| destination.tableDefinition.engine.type | string | 目标表的引擎类型. 当前仅支持 MergeTree. | 
| destination.tableDefinition.sortingKey | array | 目标表的排序键. 列的列表. | 
| destination.tableDefinition.partitionBy | string | 分区键 SQL 表达式. | 
| destination.tableDefinition.primaryKey | string | SQL 表达式的主键. | 
| destination.columns | array | 目标表的列. 除 Postgres 外，所有管道类型的必填字段. | 
| fieldMappings | array | ClickPipe 的字段映射. | 
| createdAt | string | ClickPipe 的创建日期. | 
| updatedAt | string | ClickPipe 的最后更新日期. |
#### 示例响应

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
## 删除 ClickPipe

**此端点处于 alpha 阶段，可能会有所更改。** 如需更多信息，请联系 ClickHouse 支持。<br /><br /> 删除指定的 ClickPipe.

| 方法 | 路径 |
| :----- | :--- |
| DELETE | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}` |
### 请求
#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 拥有该服务的组织 ID. | 
| serviceId | uuid | 拥有该 ClickPipe 的服务的 ID. | 
| clickPipeId | uuid | 要删除的 ClickPipe 的 ID. |
## 扩展 ClickPipe

**此端点处于 alpha 阶段，可能会有所更改。** 如需更多信息，请联系 ClickHouse 支持。<br /><br /> 更改指定 ClickPipe 的扩展设置.

| 方法 | 路径 |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}/scaling` |
### 请求
#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 拥有该服务的组织 ID. | 
| serviceId | uuid | 拥有该 ClickPipe 的服务的 ID. | 
| clickPipeId | uuid | 要更新扩展设置的 ClickPipe 的 ID. |
### 请求体参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| replicas | integer | 要扩展到的副本数量. 用于扩展 Kafka 管道. |
### 响应
#### 响应模式

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| id | uuid | 唯一的 ClickPipe ID. | 
| serviceId | uuid | 此 ClickPipe 属于的服务的 ID. | 
| name | string | ClickPipe 的名称. | 
| description | string | ClickPipe 的描述. | 
| state | string | ClickPipe 的当前状态. | 
| scaling.replicas | integer | 所需的副本数量. 仅适用于可扩展的管道. | 
| scaling.concurrency | integer | 所需的并发数量. 仅适用于 S3 管道. 如果设置为 0，则并发根据集群内存自动扩展. | 
| source.kafka |  |  | 
| source.objectStorage |  |  | 
| source.kinesis |  |  | 
| source.postgres |  |  | 
| destination.database | string | 目标数据库. | 
| destination.table | string | 目标表. 除 Postgres 外，所有管道类型的必填字段. | 
| destination.managedTable | boolean | 表是否由 ClickPipes 管理？除 Postgres 外，所有管道类型的必填字段. | 
| destination.tableDefinition.engine.type | string | 目标表的引擎类型. 当前仅支持 MergeTree. | 
| destination.tableDefinition.sortingKey | array | 目标表的排序键. 列的列表. | 
| destination.tableDefinition.partitionBy | string | 分区键 SQL 表达式. | 
| destination.tableDefinition.primaryKey | string | SQL 表达式的主键. | 
| destination.columns | array | 目标表的列. 除 Postgres 外，所有管道类型的必填字段. | 
| fieldMappings | array | ClickPipe 的字段映射. | 
| createdAt | string | ClickPipe 的创建日期. | 
| updatedAt | string | ClickPipe 的最后更新日期. |
#### 示例响应

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
## 更新 ClickPipe 状态

**此端点处于 alpha 阶段，可能会有所更改。** 如需更多信息，请联系 ClickHouse 支持。<br /><br /> 启动或停止 ClickPipe. 停止 ClickPipe 将停止任何状态下的摄取过程. 启动仅允许在 "已停止" 状态或 "失败" 状态的 ClickPipe. 

| 方法 | 路径 |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/services/{serviceId}/clickpipes/{clickPipeId}/state` |
### 请求
#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 拥有该服务的组织 ID. | 
| serviceId | uuid | 拥有该 ClickPipe 的服务的 ID. | 
| clickPipeId | uuid | 要更新状态的 ClickPipe 的 ID. |
### 请求体参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| command | string | 更改状态的命令：'start', 'stop'. |
### 响应
#### 响应模式

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| id | uuid | 唯一的 ClickPipe ID. | 
| serviceId | uuid | 此 ClickPipe 属于的服务的 ID. | 
| name | string | ClickPipe 的名称. | 
| description | string | ClickPipe 的描述. | 
| state | string | ClickPipe 的当前状态. | 
| scaling.replicas | integer | 所需的副本数量. 仅适用于可扩展的管道. | 
| scaling.concurrency | integer | 所需的并发数量. 仅适用于 S3 管道. 如果设置为 0，则并发根据集群内存自动扩展. | 
| source.kafka |  |  | 
| source.objectStorage |  |  | 
| source.kinesis |  |  | 
| source.postgres |  |  | 
| destination.database | string | 目标数据库. | 
| destination.table | string | 目标表. 除 Postgres 外，所有管道类型的必填字段. | 
| destination.managedTable | boolean | 表是否由 ClickPipes 管理？除 Postgres 外，所有管道类型的必填字段. | 
| destination.tableDefinition.engine.type | string | 目标表的引擎类型. 当前仅支持 MergeTree. | 
| destination.tableDefinition.sortingKey | array | 目标表的排序键. 列的列表. | 
| destination.tableDefinition.partitionBy | string | 分区键 SQL 表达式. | 
| destination.tableDefinition.primaryKey | string | SQL 表达式的主键. | 
| destination.columns | array | 目标表的列. 除 Postgres 外，所有管道类型的必填字段. | 
| fieldMappings | array | ClickPipe 的字段映射. | 
| createdAt | string | ClickPipe 的创建日期. | 
| updatedAt | string | ClickPipe 的最后更新日期. |
#### 示例响应

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
