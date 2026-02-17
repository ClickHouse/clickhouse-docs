---
sidebar_label: '通用 MongoDB'
description: '将任意 MongoDB 实例配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/mongodb/source/generic
title: '通用 MongoDB 源配置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# 通用 MongoDB 源配置指南 \{#generic-mongodb-source-setup-guide\}

:::info

如果您使用 MongoDB Atlas，请参阅[此专用指南](./atlas)。

:::

## 启用 oplog 保留时长 \{#enable-oplog-retention\}

复制要求 oplog 的最小保留时长为 24 小时。我们建议将 oplog 保留时长设置为 72 小时或更长，以确保在完成初始快照之前 oplog 不会被截断。

可以在 MongoDB shell 中运行以下命令来检查当前的 oplog 保留时长（需要具备 `clusterMonitor` 角色才能运行此命令）：

```javascript
db.getSiblingDB("admin").serverStatus().oplogTruncation.oplogMinRetentionHours
```

要将 oplog 保留时间设置为 72 小时，请在副本集中的每个节点上以管理员用户身份运行以下命令：

```javascript
db.adminCommand({
    "replSetResizeOplog" : 1,
    "minRetentionHours": 72
})
```

有关 `replSetResizeOplog` 命令和 oplog 保留的更多信息，请参阅 [MongoDB 文档](https://www.mongodb.com/docs/manual/reference/command/replSetResizeOplog/)。


## 配置数据库用户 \{#configure-database-user\}

以管理员用户身份连接到 MongoDB 实例，并执行以下命令，为 MongoDB CDC ClickPipes 创建一个用户：

```javascript
db.getSiblingDB("admin").createUser({
    user: "clickpipes_user",
    pwd: "some_secure_password",
    roles: ["readAnyDatabase", "clusterMonitor"],
})
```

:::note

请务必将 `clickpipes_user` 和 `some_secure_password` 替换为您期望的用户名和密码。

:::


## 接下来？ \{#whats-next\}

现在，你可以[创建 ClickPipe](../index.md)，并开始将 MongoDB 实例中的数据摄取到 ClickHouse Cloud。
请务必记录下在设置 MongoDB 实例时使用的连接参数，因为在创建 ClickPipe 的过程中将需要这些信息。