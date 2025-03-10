---
sidebar_label: '成员'
title: '成员'
---

## 列出组织成员

返回组织中的所有成员列表。

| 方法 | 路径 |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/members` |

### 请求

#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 请求的组织的 ID。 | 


### 响应

#### 响应架构

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| userId | string | 唯一用户 ID。如果用户是多个组织的成员，该 ID 将保持不变。 | 
| name | string | 成员在个人用户个人资料中设置的名称。 | 
| email | email | 成员在个人用户个人资料中设置的电子邮件。 | 
| role | string | 成员在组织中的角色。 | 
| joinedAt | date-time | 成员加入组织的时间戳。 ISO-8601 格式。 | 


#### 示例响应

```
{
  "userId": "string",
  "name": "string",
  "email": "email",
  "role": "string",
  "joinedAt": "date-time"
}
```

## 获取成员详细信息

返回单个组织成员的详细信息。

| 方法 | 路径 |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/members/{userId}` |

### 请求

#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 成员所属组织的 ID。 | 
| userId | uuid | 请求用户的 ID。 | 


### 响应

#### 响应架构

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| userId | string | 唯一用户 ID。如果用户是多个组织的成员，该 ID 将保持不变。 | 
| name | string | 成员在个人用户个人资料中设置的名称。 | 
| email | email | 成员在个人用户个人资料中设置的电子邮件。 | 
| role | string | 成员在组织中的角色。 | 
| joinedAt | date-time | 成员加入组织的时间戳。 ISO-8601 格式。 | 


#### 示例响应

```
{
  "userId": "string",
  "name": "string",
  "email": "email",
  "role": "string",
  "joinedAt": "date-time"
}
```

## 更新组织成员

更新组织成员的角色。

| 方法 | 路径 |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}/members/{userId}` |

### 请求

#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 成员所属组织的 ID。 | 
| userId | uuid | 要修补的用户的 ID。 | 

### 请求体参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| role | string | 成员在组织中的角色。 | 

### 响应

#### 响应架构

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| userId | string | 唯一用户 ID。如果用户是多个组织的成员，该 ID 将保持不变。 | 
| name | string | 成员在个人用户个人资料中设置的名称。 | 
| email | email | 成员在个人用户个人资料中设置的电子邮件。 | 
| role | string | 成员在组织中的角色。 | 
| joinedAt | date-time | 成员加入组织的时间戳。 ISO-8601 格式。 | 


#### 示例响应

```
{
  "userId": "string",
  "name": "string",
  "email": "email",
  "role": "string",
  "joinedAt": "date-time"
}
```

## 移除组织成员

从组织中移除用户。

| 方法 | 路径 |
| :----- | :--- |
| DELETE | `/v1/organizations/{organizationId}/members/{userId}` |

### 请求

#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 请求的组织 ID。 | 
| userId | uuid | 请求用户的 ID。 | 
