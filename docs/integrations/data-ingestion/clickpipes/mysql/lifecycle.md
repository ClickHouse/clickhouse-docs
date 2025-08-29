---
sidebar_label: 'Lifecycle of a MySQL ClickPipe'
description: 'Various pipe statuses and their meanings'
slug: /integrations/clickpipes/mysql/lifecycle
title: 'Lifecycle of a MySQL ClickPipe'
---

# Lifecycle of a MySQL ClickPipe {#lifecycle}

This is a document on the various phases of a MySQL ClickPipe, the different statuses it can have, and what they mean. Note that this applies to MariaDB as well.

## Provisioning {#provisioning}

When you click on the Create ClickPipe button, the ClickPipe is created in a `Provisioning` state. The provisioning process is where we spin up the underlying infrastructure to run ClickPipes for the service, along with registering some initial metadata for the pipe. Since compute for ClickPipes within a service is shared, your second ClickPipe will be created much faster than the first one -- as the infrastructure is already in place.

## Setup {#setup}

After a pipe is provisioned, it enters the `Setup` state. This state is where we create the destination ClickHouse tables. We also obtain and record the table definitions of your source tables here.

## Snapshot {#snapshot}

Once setup is complete, we enter the `Snapshot` state (unless it's a CDC-only pipe, which would transition to `Running`). `Snapshot`, `Initial Snapshot` and `Initial Load` (more common) are interchangeable terms. In this state, we take a snapshot of the source MySQL tables and load them into ClickHouse. Retention setting for binary logs should account for initial load time. For more information on initial load, see the [parallel initial load documentation](./parallel_initial_load). The pipe will also enter the `Snapshot` state when a resync is triggered or when new tables are added to an existing pipe.

## Running {#running}

Once the initial load is complete, the pipe enters the `Running` state (unless it's a snapshot-only pipe, which would transition to `Completed`). This is where the pipe begins `Change-Data Capture`. In this state, we start reading binary logs from the source database and sync the data to ClickHouse in batches. For information on controlling CDC, see [the doc on controlling CDC](./sync_control).

## Paused {#paused}

Once the pipe is in the `Running` state, you can pause it. This will stop the CDC process and the pipe will enter the `Paused` state. In this state, no new data is pulled from the source database, but the existing data in ClickHouse remains intact. You can resume the pipe from this state.

## Pausing {#pausing}

:::note
This state is coming soon. If you're using our [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi), consider adding support for it now to ensure your integration continues working when it's released.
:::
When you click on the Pause button, the pipe enters the `Pausing` state. This is a transient state where we are in the process of stopping the CDC process. Once the CDC process is fully stopped, the pipe will enter the `Paused` state.

## Modifying {#modifying}
:::note
This state is coming soon. If you're using our [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi), consider adding support for it now to ensure your integration continues working when it's released.
:::
Currently, this indicates the pipe is in the process of removing tables.

## Resync {#resync}
:::note
This state is coming soon. If you're using our [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi), consider adding support for it now to ensure your integration continues working when it's released.
:::
This state indicates the pipe is in the phase of resync where it is performing an atomic swap of the _resync tables with the original tables. More information on resync can be found in the [resync documentation](./resync).

## Completed {#completed}

This state applies to snapshot-only pipes and indicates that the snapshot has been completed and there's no more work to do.

## Failed {#failed}

If there is an irrecoverable error in the pipe, it will enter the `Failed` state. You can reach out to support or [resync](./resync) your pipe to recover from this state.

## Degraded {#degraded}

:::note
This state is coming soon. If you're using our [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi), consider adding support for it now to ensure your integration continues working when it's released.
:::
