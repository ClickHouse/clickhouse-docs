---
sidebar_label: '组织'
title: '组织'
---

## 获取可用组织列表

返回与请求中的API密钥关联的单个组织列表。

| 方法  | 路径                      |
| :---  | :-----------------------  |
| GET   | `/v1/organizations`       |

### 请求


### 响应

#### 响应架构

| 名称                | 类型   | 描述                          |
| :----------------- | :----- | :---------------------------  |
| id                 | uuid   | 唯一的组织ID。                | 
| createdAt          | date-time | 组织创建的时间戳。ISO-8601。| 
| name               | string | 组织的名称。                  | 
| privateEndpoints   | array  | 组织的私有端点列表             | 
| byocConfig         | array  | 组织的BYOC配置                | 


#### 示例响应

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## 获取组织详细信息

返回单个组织的详细信息。为了获取详细信息，身份验证密钥必须属于该组织。

| 方法  | 路径                           |
| :---  | :----------------------------  |
| GET   | `/v1/organizations/{organizationId}` |

### 请求

#### 路径参数

| 名称                | 类型   | 描述                          |
| :----------------- | :----- | :---------------------------  |
| organizationId     | uuid   | 请求的组织的ID。              | 


### 响应

#### 响应架构

| 名称                | 类型   | 描述                          |
| :----------------- | :----- | :---------------------------  |
| id                 | uuid   | 唯一的组织ID。                | 
| createdAt          | date-time | 组织创建的时间戳。ISO-8601。| 
| name               | string | 组织的名称。                  | 
| privateEndpoints   | array  | 组织的私有端点列表             | 
| byocConfig         | array  | 组织的BYOC配置                | 


#### 示例响应

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## 更新组织详细信息

更新组织字段。需要ADMIN身份验证密钥角色。

| 方法  | 路径                           |
| :---  | :----------------------------  |
| PATCH | `/v1/organizations/{organizationId}` |

### 请求

#### 路径参数

| 名称                | 类型   | 描述                          |
| :----------------- | :----- | :---------------------------  |
| organizationId     | uuid   | 要更新的组织的ID。            | 

### 请求体参数

| 名称                | 类型   | 描述                          |
| :----------------- | :----- | :---------------------------  |
| name               | string | 组织的名称。                  | 
| privateEndpoints   |        |                               | 

### 响应

#### 响应架构

| 名称                | 类型   | 描述                          |
| :----------------- | :----- | :---------------------------  |
| id                 | uuid   | 唯一的组织ID。                | 
| createdAt          | date-time | 组织创建的时间戳。ISO-8601。| 
| name               | string | 组织的名称。                  | 
| privateEndpoints   | array  | 组织的私有端点列表             | 
| byocConfig         | array  | 组织的BYOC配置                | 


#### 示例响应

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## 组织活动列表

返回所有组织活动的列表。

| 方法  | 路径                                   |
| :---  | :------------------------------------  |
| GET   | `/v1/organizations/{organizationId}/activities` |

### 请求

#### 路径参数

| 名称                | 类型   | 描述                          |
| :----------------- | :----- | :---------------------------  |
| organizationId     | uuid   | 请求的组织的ID。              | 
| from_date          | date-time | 搜索的开始日期               | 
| to_date            | date-time | 搜索的结束日期               | 


### 响应

#### 响应架构

| 名称                | 类型   | 描述                          |
| :----------------- | :----- | :---------------------------  |
| id                 | string | 唯一的活动ID。                | 
| createdAt          | date-time | 活动的时间戳。ISO-8601。   | 
| type               | string | 活动的类型。                  | 
| actorType          | string | 行为者的类型：'user', 'support', 'system', 'api'。| 
| actorId            | string | 唯一的行为者ID。              | 
| actorDetails       | string | 有关行为者的附加信息。        | 
| actorIpAddress     | string | 行为者的IP地址。适用于'user'和'api'类型的行为者。| 
| organizationId     | string | 活动范围：与此活动相关的组织ID。 | 
| serviceId          | string | 活动范围：与此活动相关的服务ID。 | 


#### 示例响应

```
{
  "id": "string",
  "createdAt": "date-time",
  "type": "string",
  "actorType": "string",
  "actorId": "string",
  "actorDetails": "string",
  "actorIpAddress": "string",
  "organizationId": "string",
  "serviceId": "string"
}
```

## 组织活动

通过ID返回单个组织活动。

| 方法  | 路径                                       |
| :---  | :----------------------------------------  |
| GET   | `/v1/organizations/{organizationId}/activities/{activityId}` |

### 请求

#### 路径参数

| 名称                | 类型   | 描述                          |
| :----------------- | :----- | :---------------------------  |
| organizationId     | uuid   | 请求的组织的ID。              | 
| activityId         | string | 请求的活动的ID。              | 


### 响应

#### 响应架构

| 名称                | 类型   | 描述                          |
| :----------------- | :----- | :---------------------------  |
| id                 | string | 唯一的活动ID。                | 
| createdAt          | date-time | 活动的时间戳。ISO-8601。   | 
| type               | string | 活动的类型。                  | 
| actorType          | string | 行为者的类型：'user', 'support', 'system', 'api'。| 
| actorId            | string | 唯一的行为者ID。              | 
| actorDetails       | string | 有关行为者的附加信息。        | 
| actorIpAddress     | string | 行为者的IP地址。适用于'user'和'api'类型的行为者。| 
| organizationId     | string | 活动范围：与此活动相关的组织ID。 | 
| serviceId          | string | 活动范围：与此活动相关的服务ID。 | 


#### 示例响应

```
{
  "id": "string",
  "createdAt": "date-time",
  "type": "string",
  "actorType": "string",
  "actorId": "string",
  "actorDetails": "string",
  "actorIpAddress": "string",
  "organizationId": "string",
  "serviceId": "string"
}
```
