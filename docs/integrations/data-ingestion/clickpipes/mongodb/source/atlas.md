---
sidebar_label: 'Mongo Atlas'
description: 'Step-by-step guide on how to set up Mongo Atlas as a source for ClickPipes'
slug: /integrations/clickpipes/mongodb/source/atlas
title: 'Mongo Atlas source setup guide'
---

import mongo_atlas_add_user from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-add-new-database-user.png'
import mongo_atlas_add_roles from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-database-user-privilege.png'
import mongo_atlas_restrict_access from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-restrict-access.png'

# Mongo Atlas source setup guide

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

Once you are logged in to your Atlas console, click `Database Access` under the Security tab in the left navigation bar. Click on "Add New Database User". 

ClickPipes requires password authentication:

<Image img={mongo_atlas_add_user} alt="Add database user" size="lg" border/>

ClickPipes requires a user with the following roles:

- `readAnyDatabase`
- `clusterMonitor`

<Image img={mongo_atlas_add_roles} alt="Configure user roles" size="lg" border/>

You can specify the cluster(s)/instance(s) you wish to grant access to ClickPipes user:

<Image img={mongo_atlas_restrict_access} alt="Restrict cluster/instance acces" size="lg" border/>

## What's next? {#whats-next}

You can now [create your ClickPipe](../index.md) and start ingesting data from your MongoDB instance into ClickHouse Cloud.
Make sure to note down the connection details you used while setting up your MongoDB instance as you will need them during the ClickPipe creation process.
