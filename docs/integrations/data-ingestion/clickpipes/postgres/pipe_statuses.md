---
sidebar_label: 'Lifecycle of a Database ClickPipe'
description: 'Various pipe statuses and their meanings'
slug: /integrations/clickpipes/postgres/lifecycle
title: 'Lifecycle of a Database ClickPipe'
---

# Lifecycle of a Database ClickPipe

This is a document on the various phases of a Postgres ClickPipe, the different statuses it can have, and what they mean.

## Provisioning

When you click on the Create ClickPipe button, the ClickPipe is created in a `Provisioning` state. The provisioning process is where we spin up the underlying infrastructure to run ClickPipes for the service, along with registering some initial metadata for the pipe. Since compute for ClickPipes within a service is shared, your second ClickPipe will be created much faster than the first one -- as the infrastructure is already in place.

## Setup

After a pipe is provisioned, it enters the `Setup` state. This state is where we create the destination ClickHouse tables. We also obtain and record the table definitions of your source tables here.

## Snapshot

Once setup is complete, we enter the `Snapshot` state. `Snapshot`, `Initial Snapshot` and `Initial Load` (more common) are interchangeable terms. In this state, we take a snapshot of the source database tables and load them into ClickHouse. This **does not use logical replication**. For more information on initial load, see the [parallel initial load documentation](./parallel_initial_load).

## Running

Once the initial load is complete, the pipe enters the `Running` state. This is where the pipe begins `Change-Data Capture`. In this state, we start logical replication from the source database to ClickHouse. For information on controlling CDC, see [the doc on controlling CDC](./controlling_sync).

## Paused

Once the pipe is in the `Running` state, you can pause it. This will stop the CDC process and the pipe will enter the `Paused` state. In this state, no new data is pulled from the source database, but the existing data in ClickHouse remains intact. You can resume the pipe from this state.

## Failed

If there is an irrecoverable error in the pipe, it will enter the `Failed` state. You can reach out to support or [resync](./resync) your pipe to recover from this state.
