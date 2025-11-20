---
sidebar_label: '通用 MongoDB'
description: '将任意 MongoDB 实例配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/mongodb/source/generic
title: '通用 MongoDB 数据源配置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---



# 通用 MongoDB Source 设置指南

:::info

如果你使用 MongoDB Atlas，请参考[此指南](./atlas)。

:::



## 启用 oplog 保留 {#enable-oplog-retention}

复制功能要求 oplog 至少保留 24 小时。我们建议将 oplog 保留时间设置为 72 小时或更长，以确保在完成初始快照之前 oplog 不会被截断。

您可以在 MongoDB shell 中运行以下命令来检查当前的 oplog 保留时间(您必须具有 `clusterMonitor` 角色才能运行此命令):

```javascript
db.getSiblingDB("admin").serverStatus().oplogTruncation.oplogMinRetentionHours
```

要将 oplog 保留时间设置为 72 小时,请以管理员用户身份在副本集的每个节点上运行以下命令:

```javascript
db.adminCommand({
  replSetResizeOplog: 1,
  minRetentionHours: 72
})
```

有关 `replSetResizeOplog` 命令和 oplog 保留的更多详细信息,请参阅 [MongoDB 文档](https://www.mongodb.com/docs/manual/reference/command/replSetResizeOplog/)。


## 配置数据库用户 {#configure-database-user}

以管理员用户身份连接到 MongoDB 实例,并执行以下命令为 MongoDB CDC ClickPipes 创建用户:

```javascript
db.getSiblingDB("admin").createUser({
  user: "clickpipes_user",
  pwd: "some_secure_password",
  roles: ["readAnyDatabase", "clusterMonitor"]
})
```

:::note

请确保将 `clickpipes_user` 和 `some_secure_password` 替换为您期望的用户名和密码。

:::


## 下一步操作 {#whats-next}

现在您可以[创建 ClickPipe](../index.md),并开始将 MongoDB 实例中的数据导入到 ClickHouse Cloud。
请务必记录您在设置 MongoDB 实例时使用的连接详细信息,因为在创建 ClickPipe 过程中需要用到这些信息。
