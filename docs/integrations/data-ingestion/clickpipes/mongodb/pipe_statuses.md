---
sidebar_label: 'Lifecycle of a MongoDB ClickPipe'
description: 'Various pipe statuses and their meanings'
slug: /integrations/clickpipes/mongodb/lifecycle
title: 'Lifecycle of a MongoDB ClickPipe'
---

# Lifecycle of a MongoDB ClickPipe {#lifecycle-clickpipe-mongodb}

This is a document on the various phases of a MongoDB ClickPipe, the different statuses it can have, and what they mean.

## Provisioning {#provisioning-clickpipe-mongodb}

When you click on the Create ClickPipe button, the ClickPipe is created in a `Provisioning` state. The provisioning process is where we spin up the underlying infrastructure to run ClickPipes for the service, along with registering some initial metadata for the pipe. Since compute for ClickPipes within a service is shared, your second ClickPipe will be created much faster than the first one -- as the infrastructure is already in place.

## Setup {#setup-phase-clickpipe-mongodb}

After a pipe is provisioned, it enters the `Setup` state. This state is where we create the destination ClickHouse tables.

## Snapshot {#snapshot-phase-clickpipe-mongodb}

Once setup is complete, we enter the `Snapshot` state. `Snapshot`, `Initial Snapshot` and `Initial Load` (more common) are interchangeable terms. In this state, we take a snapshot of the source MongoDB collections and load them into ClickHouse. The pipe will also enter the `Snapshot` state when a resync is triggered or when new tables are added to an existing pipe.

## Running {#running-phase-clickpipe-mongodb}

Once the initial load is complete, the pipe enters the `Running` state. This is where the pipe begins `Change-Data Capture`. In this state, we start streaming changes from the source MongoDB cluster to ClickHouse. For information on controlling CDC, see [the doc on controlling CDC](./controlling_sync).

## Paused {#paused-phase-clickpipe-mongodb}

Once the pipe is in the `Running` state, you can pause it. This will stop the CDC process and the pipe will enter the `Paused` state. In this state, no new data is pulled from the source MongoDB, but the existing data in ClickHouse remains intact. You can resume the pipe from this state.

## Failed {#failed-phase-clickpipe-mongodb}

If there is an irrecoverable error in the pipe, it will enter the `Failed` state. You can reach out to support or [resync](./resync) your pipe to recover from this state.

## Degraded {#degraded}

:::note
This state is coming soon. If you're using our [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi), consider adding support for it now to ensure your integration continues working when it's released.
:::
