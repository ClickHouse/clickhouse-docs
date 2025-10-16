---
'sidebar_label': '通用 MongoDB'
'description': '将任何 MongoDB 实例设置为 ClickPipes 的数据源'
'slug': '/integrations/clickpipes/mongodb/source/generic'
'title': '通用 MongoDB 源设置指南'
'doc_type': 'guide'
---


# 通用 MongoDB 源设置指南

:::info

如果您使用的是 MongoDB Atlas，请参阅特定指南 [这里](./atlas)。

:::

## 启用 oplog 保留 {#enable-oplog-retention}

复制需要最少 24 小时的 oplog 保留。我们建议将 oplog 保留设置为 72 小时或更长，以确保在初始快照完成之前不会截断 oplog。

您可以通过在 MongoDB shell 中运行以下命令来检查当前的 oplog 保留（您必须具有 `clusterMonitor` 角色才能运行此命令）：

```javascript
db.getSiblingDB("admin").serverStatus().oplogTruncation.oplogMinRetentionHours
```

要将 oplog 保留设置为 72 小时，请作为管理员用户在副本集的每个节点上运行以下命令：

```javascript
db.adminCommand({
    "replSetResizeOplog" : 1,
    "minRetentionHours": 72
})
```

有关 `replSetResizeOplog` 命令和 oplog 保留的更多详细信息，请参阅 [MongoDB 文档](https://www.mongodb.com/docs/manual/reference/command/replSetResizeOplog/)。

## 配置数据库用户 {#configure-database-user}

作为管理员用户连接到您的 MongoDB 实例，并执行以下命令以创建一个用于 MongoDB CDC ClickPipes 的用户：

```javascript
db.getSiblingDB("admin").createUser({
    user: "clickpipes_user",
    pwd: "some_secure_password",
    roles: ["readAnyDatabase", "clusterMonitor"],
})
```

:::note

请确保将 `clickpipes_user` 和 `some_secure_password` 替换为您所需的用户名和密码。

:::

## 接下来是什么？ {#whats-next}

现在您可以 [创建您的 ClickPipe](../index.md) 并开始将数据从您的 MongoDB 实例摄取到 ClickHouse Cloud。
请确保记录您在设置 MongoDB 实例时使用的连接详细信息，因为在创建 ClickPipe 过程中您将需要它们。
