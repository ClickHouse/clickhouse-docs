---
sidebar_label: '密钥'
title: '密钥'
---

## 获取所有密钥列表

返回组织内所有密钥的列表。

| 方法   | 路径                               |
| :----- | :--------------------------------- |
| GET    | `/v1/organizations/{organizationId}/keys` |

### 请求

#### 路径参数

| 名称            | 类型  | 描述                             |
| :-------------- | :---  | :------------------------------- |
| organizationId  | uuid  | 请求组织的 ID。                   | 

### 响应

#### 响应结构

| 名称         | 类型  | 描述                              |
| :----------- | :---  | :-------------------------------- |
| id           | uuid  | 唯一的 API 密钥 ID。               |
| name         | string| 密钥名称                          |
| state        | string| 密钥状态：'enabled', 'disabled'。 |
| roles        | array | 分配给密钥的角色列表。包含至少 1 个元素。 |
| keySuffix    | string| 密钥的最后 4 个字母。              |
| createdAt    | date-time | 密钥创建的时间戳。ISO-8601。     |
| expireAt     | date-time | 密钥过期的时间戳。如果不存在或为空，则密钥永不过期。ISO-8601。 |
| usedAt       | date-time | 密钥最后使用的时间戳。如果不存在，则密钥从未使用。ISO-8601。 |

#### 示例响应

```
{
  "id": "uuid",
  "name": "string",
  "state": "string",
  "roles": "Array",
  "keySuffix": "string",
  "createdAt": "date-time",
  "expireAt": "date-time",
  "usedAt": "date-time"
}
```

## 创建密钥

创建新的 API 密钥。

| 方法   | 路径                               |
| :----- | :--------------------------------- |
| POST   | `/v1/organizations/{organizationId}/keys` |

### 请求

#### 路径参数

| 名称            | 类型  | 描述                             |
| :-------------- | :---  | :------------------------------- |
| organizationId  | uuid  | 将拥有该密钥的组织 ID。           |

### 请求体参数

| 名称         | 类型  | 描述                              |
| :----------- | :---  | :-------------------------------- |
| name         | string| 密钥名称                          |
| expireAt     | string| 密钥过期的时间戳。如果不存在或为空，则密钥永不过期。ISO-8601。 |
| state        | string| 密钥的初始状态：'enabled', 'disabled'。如果未提供，新的密钥将为 'enabled'。 |
| hashData     |       |                                  |
| roles        | array | 分配给密钥的角色列表。包含至少 1 个元素。 |

### 响应

#### 响应结构

| 名称         | 类型  | 描述                              |
| :----------- | :---  | :-------------------------------- |
| key.id       | uuid  | 唯一的 API 密钥 ID。               |
| key.name     | string| 密钥名称                          |
| key.state    | string| 密钥状态：'enabled', 'disabled'。 |
| key.roles    | array | 分配给密钥的角色列表。包含至少 1 个元素。 |
| key.keySuffix| string| 密钥的最后 4 个字母。              |
| key.createdAt| date-time | 密钥创建的时间戳。ISO-8601。     |
| key.expireAt | date-time | 密钥过期的时间戳。如果不存在或为空，则密钥永不过期。ISO-8601。 |
| key.usedAt   | date-time | 密钥最后使用的时间戳。如果不存在，则密钥从未使用。ISO-8601。 |
| keyId       | string| 生成的密钥 ID。如果请求中没有 'hashData'，则提供该字段。 |
| keySecret   | string| 生成的密钥秘密。如果请求中没有 'hashData'，则提供该字段。 |

#### 示例响应

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
    "usedAt": "date-time"
  },
  "keyId": "string",
  "keySecret": "string"
}
```

## 获取密钥详情

返回单个密钥的详情。

| 方法   | 路径                               |
| :----- | :--------------------------------- |
| GET    | `/v1/organizations/{organizationId}/keys/{keyId}` |

### 请求

#### 路径参数

| 名称            | 类型  | 描述                             |
| :-------------- | :---  | :------------------------------- |
| organizationId  | uuid  | 请求组织的 ID。                   |
| keyId           | uuid  | 请求的密钥 ID。                   |

### 响应

#### 响应结构

| 名称         | 类型  | 描述                              |
| :----------- | :---  | :-------------------------------- |
| id           | uuid  | 唯一的 API 密钥 ID。               |
| name         | string| 密钥名称                          |
| state        | string| 密钥状态：'enabled', 'disabled'。 |
| roles        | array | 分配给密钥的角色列表。包含至少 1 个元素。 |
| keySuffix    | string| 密钥的最后 4 个字母。              |
| createdAt    | date-time | 密钥创建的时间戳。ISO-8601。     |
| expireAt     | date-time | 密钥过期的时间戳。如果不存在或为空，则密钥永不过期。ISO-8601。 |
| usedAt       | date-time | 密钥最后使用的时间戳。如果不存在，则密钥从未使用。ISO-8601。 |

#### 示例响应

```
{
  "id": "uuid",
  "name": "string",
  "state": "string",
  "roles": "Array",
  "keySuffix": "string",
  "createdAt": "date-time",
  "expireAt": "date-time",
  "usedAt": "date-time"
}
```

## 更新密钥

更新 API 密钥属性。

| 方法   | 路径                               |
| :----- | :--------------------------------- |
| PATCH  | `/v1/organizations/{organizationId}/keys/{keyId}` |

### 请求

#### 路径参数

| 名称            | 类型  | 描述                             |
| :-------------- | :---  | :------------------------------- |
| organizationId  | uuid  | 拥有该密钥的组织 ID。             |
| keyId           | uuid  | 要更新的密钥 ID。                 |

### 请求体参数

| 名称         | 类型  | 描述                              |
| :----------- | :---  | :-------------------------------- |
| name         | string| 密钥名称                          |
| roles        | array | 分配给密钥的角色列表。包含至少 1 个元素。 |
| expireAt     | string| 密钥过期的时间戳。如果不存在或为空，则密钥永不过期。ISO-8601。 |
| state        | string| 密钥状态：'enabled', 'disabled'。 |

### 响应

#### 响应结构

| 名称         | 类型  | 描述                              |
| :----------- | :---  | :-------------------------------- |
| id           | uuid  | 唯一的 API 密钥 ID。               |
| name         | string| 密钥名称                          |
| state        | string| 密钥状态：'enabled', 'disabled'。 |
| roles        | array | 分配给密钥的角色列表。包含至少 1 个元素。 |
| keySuffix    | string| 密钥的最后 4 个字母。              |
| createdAt    | date-time | 密钥创建的时间戳。ISO-8601。     |
| expireAt     | date-time | 密钥过期的时间戳。如果不存在或为空，则密钥永不过期。ISO-8601。 |
| usedAt       | date-time | 密钥最后使用的时间戳。如果不存在，则密钥从未使用。ISO-8601。 |

#### 示例响应

```
{
  "id": "uuid",
  "name": "string",
  "state": "string",
  "roles": "Array",
  "keySuffix": "string",
  "createdAt": "date-time",
  "expireAt": "date-time",
  "usedAt": "date-time"
}
```

## 删除密钥

删除 API 密钥。只有未用于验证活动请求的密钥才能被删除。

| 方法   | 路径                               |
| :----- | :--------------------------------- |
| DELETE | `/v1/organizations/{organizationId}/keys/{keyId}` |

### 请求

#### 路径参数

| 名称            | 类型  | 描述                             |
| :-------------- | :---  | :------------------------------- |
| organizationId  | uuid  | 拥有该密钥的组织 ID。             |
| keyId           | uuid  | 要删除的密钥 ID。                 | 
