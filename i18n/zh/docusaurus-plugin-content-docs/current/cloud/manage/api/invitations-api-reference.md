---
sidebar_label: '邀请'
title: '邀请'
---

## 列出所有邀请

返回所有组织邀请的列表。

| 方法 | 路径 |
| :--- | :--- |
| GET | `/v1/organizations/{organizationId}/invitations` |

### 请求

#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 请求组织的 ID。 | 

### 响应

#### 响应结构

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| role | string | 成员在组织中的角色。 | 
| id | uuid | 唯一邀请 ID。 | 
| email | email | 被邀请用户的邮箱。只有该邮箱的用户才能使用邀请加入。邮箱以小写形式存储。 | 
| createdAt | date-time | 邀请创建时间戳。ISO-8601。 | 
| expireAt | date-time | 邀请过期时间戳。ISO-8601。 | 

#### 示例响应

```
{
  "role": "string",
  "id": "uuid",
  "email": "email",
  "createdAt": "date-time",
  "expireAt": "date-time"
}
```

## 创建邀请

创建组织邀请。

| 方法 | 路径 |
| :--- | :--- |
| POST | `/v1/organizations/{organizationId}/invitations` |

### 请求

#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 要邀请用户的组织 ID。 | 

### 请求体参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| email | string | 被邀请用户的邮箱。只有该邮箱的用户才能使用邀请加入。邮箱以小写形式存储。 | 
| role | string | 成员在组织中的角色。 | 

### 响应

#### 响应结构

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| role | string | 成员在组织中的角色。 | 
| id | uuid | 唯一邀请 ID。 | 
| email | email | 被邀请用户的邮箱。只有该邮箱的用户才能使用邀请加入。邮箱以小写形式存储。 | 
| createdAt | date-time | 邀请创建时间戳。ISO-8601。 | 
| expireAt | date-time | 邀请过期时间戳。ISO-8601。 | 

#### 示例响应

```
{
  "role": "string",
  "id": "uuid",
  "email": "email",
  "createdAt": "date-time",
  "expireAt": "date-time"
}
```

## 获取邀请详情

返回单个组织邀请的详细信息。

| 方法 | 路径 |
| :--- | :--- |
| GET | `/v1/organizations/{organizationId}/invitations/{invitationId}` |

### 请求

#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 请求组织的 ID。 | 
| invitationId | uuid | 请求的邀请 ID。 | 

### 响应

#### 响应结构

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| role | string | 成员在组织中的角色。 | 
| id | uuid | 唯一邀请 ID。 | 
| email | email | 被邀请用户的邮箱。只有该邮箱的用户才能使用邀请加入。邮箱以小写形式存储。 | 
| createdAt | date-time | 邀请创建时间戳。ISO-8601。 | 
| expireAt | date-time | 邀请过期时间戳。ISO-8601。 | 

#### 示例响应

```
{
  "role": "string",
  "id": "uuid",
  "email": "email",
  "createdAt": "date-time",
  "expireAt": "date-time"
}
```

## 删除组织邀请

删除单个组织邀请。

| 方法 | 路径 |
| :--- | :--- |
| DELETE | `/v1/organizations/{organizationId}/invitations/{invitationId}` |

### 请求

#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 拥有邀请的组织 ID。 | 
| invitationId | uuid | 请求的邀请 ID。 | 
