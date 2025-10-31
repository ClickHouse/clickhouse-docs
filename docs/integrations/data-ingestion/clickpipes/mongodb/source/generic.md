---
sidebar_label: 'Generic MongoDB'
description: 'Set up any MongoDB instance as a source for ClickPipes'
slug: /integrations/clickpipes/mongodb/source/generic
title: 'Generic MongoDB source setup guide'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# Generic MongoDB source setup guide

:::info

If you use MongoDB Atlas, please refer to the specific guide [here](./atlas).

:::

## Enable oplog retention {#enable-oplog-retention}

Minimum oplog retention of 24 hours is required for replication. We recommend setting the oplog retention to 72 hours or longer to ensure that the oplog is not truncated before the initial snapshot is completed.

You can check your current oplog retention by running the following command in the MongoDB shell (you must have `clusterMonitor` role to run this command):

```javascript
db.getSiblingDB("admin").serverStatus().oplogTruncation.oplogMinRetentionHours
```

To set the oplog retention to 72 hours, run the following command on each node in the replica set as an admin user:

```javascript
db.adminCommand({
    "replSetResizeOplog" : 1,
    "minRetentionHours": 72
})
```

For more details on the `replSetResizeOplog` command and oplog retention, see [MongoDB documentation](https://www.mongodb.com/docs/manual/reference/command/replSetResizeOplog/).

## Configure a database user {#configure-database-user}

Connect to your MongoDB instance as an admin user and execute the following command to create a user for MongoDB CDC ClickPipes:

```javascript
db.getSiblingDB("admin").createUser({
    user: "clickpipes_user",
    pwd: "some_secure_password",
    roles: ["readAnyDatabase", "clusterMonitor"],
})
```

:::note

Make sure to replace `clickpipes_user` and `some_secure_password` with your desired username and password.

:::

## What's next? {#whats-next}

You can now [create your ClickPipe](../index.md) and start ingesting data from your MongoDB instance into ClickHouse Cloud.
Make sure to note down the connection details you used while setting up your MongoDB instance as you will need them during the ClickPipe creation process.
