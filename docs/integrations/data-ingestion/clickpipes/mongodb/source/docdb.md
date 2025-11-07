---
sidebar_label: 'Amazon DocumentDB'
description: 'Step-by-step guide on how to set up Amazon DocumentDB as a source for ClickPipes'
slug: /integrations/clickpipes/mongodb/source/docdb
title: 'Amazon DocumentDB source setup guide'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'documentdb', 'cdc', 'data ingestion', 'real-time sync']
---

import docdb_select_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-select-parameter-group.png'
import docdb_modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-modify-parameter-group.png'
import docdb_apply_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-apply-parameter-group.png'
import docdb_parameter_group_status from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-parameter-group-status.png'
import Image from '@theme/IdealImage';

# Amazon DocumentDB source setup guide

## Supported DocumentDB versions {#supported-documentdb-versions}

ClickPipes supports DocumentDB version 5.0.

## Configure change stream log retention {#configure-change-stream-log-retention}

By default, Amazon DocumentDB has a 3-hour change stream log retention period, initial load may take much longer depending on existing data volume in your DocumentDB. We recommend setting the change stream log retention to 72 hours or longer to ensure that it is not truncated before the initial snapshot is completed.

### Update change stream log retention via AWS Console {#update-change-stream-log-retention-via-aws-console}

1. Click `Parameter groups` in the left panel, find the parameter group used by your DocumentDB cluster (if you are using the default parameter group, you will need to create a new parameter group first in order to modify it).
<Image img={docdb_select_parameter_group} alt="Select parameter group" size="lg" border/>

2. Search for `change_stream_log_retention_duration`, select and edit it to `259200` (72 hours)
<Image img={docdb_modify_parameter_group} alt="Modify parameter group" size="lg" border/>

3. Click `Apply Changes` to apply the modified parameter group to your DocumentDB cluster immediately. You should see the status of the parameter group transition to `applying`, and then to `in-sync` when the change is applied.
<Image img={docdb_apply_parameter_group} alt="Apply parameter group" size="lg" border/>

<Image img={docdb_parameter_group_status} alt="Parameter group status" size="lg" border/>

### Update change stream log retention via AWS CLI {#update-change-stream-log-retention-via-aws-cli}

To check the current change stream log retention period via AWS CLI:
```shell
aws docdb describe-db-cluster-parameters --db-cluster-parameter-group-name <PARAMETER_GROUP_NAME> --query "Parameters[?ParameterName=='change_stream_log_retention_duration'].{Name:ParameterName,Value:ParameterValue}"
```

To set the change stream log retention period to 72 hours via AWS CLI:
```shell
aws docdb modify-db-cluster-parameter-group --db-cluster-parameter-group-name <PARAMETER_GROUP_NAME> --parameters "ParameterName=change_stream_log_retention_duration,ParameterValue=259200,ApplyMethod=immediate"
```

## Configure a database user {#configure-database-user}

Connect to your DocumentDB cluster as an admin user and execute the following command to create a database user for MongoDB CDC ClickPipes:

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

You can now [create your ClickPipe](../index.md) and start ingesting data from your DocumentDB instance into ClickHouse Cloud.
Make sure to note down the connection details you used while setting up your DocumentDB cluster as you will need them during the ClickPipe creation process.
