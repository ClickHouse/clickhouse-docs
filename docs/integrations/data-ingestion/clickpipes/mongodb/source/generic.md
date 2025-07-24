---
sidebar_label: 'Generic MongoDB'
description: 'Set up any MongoDB instance as a source for ClickPipes'
slug: /integrations/clickpipes/mongodb/source/generic
title: 'Generic MongoDB source setup guide'
---

# Generic MongoDB source setup guide

:::info

If you use one of the supported providers (in the sidebar), please refer to the specific guide for that provider.

:::

## Enable oplog retention {#enable-oplog-retention}

Minimum oplog retention of 24 hours is required for replication. The oplog retention must be longer than the time it takes to complete initial snapshot. 

You can check your current oplog retention by running the following command in the MongoDB shell:

```javascript
db.serverStatus().oplogTruncation.oplogMinRetentionHours
```

To set the oplog retention to 72 hours, run the following command as an admin user:

```javascript
db.adminCommand({
    "replSetResizeOplog" : 1,
    "minRetentionHours": 72
})
```

## Configure a database user {#configure-database-user}

Connect to your MongoDB instance as an admin user and execute the following command to create a user for MongoDB CDC ClickPipes:

```javascript
use admin;
db.createUser({
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
