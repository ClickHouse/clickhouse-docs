---
sidebar_label: 'MongoDB Atlas'
description: 'Step-by-step guide on how to set up MongoDB Atlas as a source for ClickPipes'
slug: /integrations/clickpipes/mongodb/source/atlas
title: 'MongoDB Atlas source setup guide'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import mongo_atlas_configuration from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-cluster-overview-configuration.png'
import mngo_atlas_additional_settings from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-expand-additional-settings.png'
import mongo_atlas_retention_hours from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-set-retention-hours.png'
import mongo_atlas_add_user from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-add-new-database-user.png'
import mongo_atlas_add_roles from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-database-user-privilege.png'
import mongo_atlas_restrict_access from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-restrict-access.png'
import Image from '@theme/IdealImage';

# MongoDB Atlas source setup guide

## Configure oplog retention {#enable-oplog-retention}

Minimum oplog retention of 24 hours is required for replication. We recommend setting the oplog retention to 72 hours or longer to ensure that the oplog is not truncated before the initial snapshot is completed. To set the oplog retention via UI:

1. Navigate to your cluster's `Overview` tab in the MongoDB Atlas console and click on the `Configuration` tab.
<Image img={mongo_atlas_configuration} alt="Navigate to cluster configuration" size="lg" border/>

2. Click `Additional Settings` and scroll down to `More Configuration Options`.
<Image img={mngo_atlas_additional_settings} alt="Expand additional settings" size="lg" border/>

3. Click `More Configuration Options` and set the minimum oplog window to `72 hours` or longer.
<Image img={mongo_atlas_retention_hours} alt="Set oplog retention hours" size="lg" border/>

4. Click `Review Changes` to review, and then `Apply Changes` to deploy the changes.

## Configure a database user {#configure-database-user}

Once you are logged in to your MongoDB Atlas console, click `Database Access` under the Security tab in the left navigation bar. Click on "Add New Database User".

ClickPipes requires password authentication:

<Image img={mongo_atlas_add_user} alt="Add database user" size="lg" border/>

ClickPipes requires a user with the following roles:

- `readAnyDatabase`
- `clusterMonitor`

You can find them in the `Specific Privileges` section:

<Image img={mongo_atlas_add_roles} alt="Configure user roles" size="lg" border/>

You can further specify the cluster(s)/instance(s) you wish to grant access to ClickPipes user:

<Image img={mongo_atlas_restrict_access} alt="Restrict cluster/instance acces" size="lg" border/>

## What's next? {#whats-next}

You can now [create your ClickPipe](../index.md) and start ingesting data from your MongoDB instance into ClickHouse Cloud.
Make sure to note down the connection details you used while setting up your MongoDB instance as you will need them during the ClickPipe creation process.
