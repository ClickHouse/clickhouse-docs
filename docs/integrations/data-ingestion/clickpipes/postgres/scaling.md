---
title: 'Scaling DB ClickPipes via OpenAPI'
description: 'Doc for scaling DB ClickPipes via OpenAPI'
slug: /integrations/clickpipes/postgres/scaling
sidebar_label: 'Scaling'
---

:::caution Most users won't need this API
Default configuration of DB ClickPipes is designed to handle the majority of workloads out of the box. If you think your workload requires scaling, open a [support case](https://clickhouse.com/support/program) and we'll guide you through the optimal settings for the use case.
:::

Scaling API may be useful for:
- Large initial loads (over 4 TB)
- Migrating a moderate amount of data as quickly as possible
- Supporting over 8 CDC ClickPipes under the same service

Before attempting to scale up, consider:
- Ensuring the source DB has sufficient available capacity
- First adjusting [initial load parallelism and partitioning](/integrations/clickpipes/postgres/parallel_initial_load) when creating a ClickPipe
- Checking for [long-running transactions](/integrations/clickpipes/postgres/sync_control#transactions) on the source that could be causing CDC delays

**Increasing the scale will proportionally increase your ClickPipes compute costs.** If you're scaling up just for the initial loads, it's important to scale down after the snapshot is finished to avoid unexpected charges. For more details on pricing, see [Postgres CDC Pricing](/cloud/manage/billing/overview#clickpipes-for-postgres-cdc).

## Prerequisites for this process {#prerequisites}

Before you get started you will need:

1. [ClickHouse API key](/cloud/manage/openapi) with Admin permissions on the target ClickHouse Cloud service.
2. A DB ClickPipe (Postgres, MySQL or MongoDB) provisioned in the service at some point in time. CDC infrastructure gets created along with the first ClickPipe, and the scaling endpoints become available from that point onwards.

## Steps to scale DB ClickPipes {#cdc-scaling-steps}

Set the following environment variables before running any commands:

```bash
ORG_ID=<Your ClickHouse organization ID>
SERVICE_ID=<Your ClickHouse service ID>
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
```

Fetch the current scaling configuration (optional):

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

# example result:
{
  "result": {
    "replicaCpuMillicores": 2000,
    "replicaMemoryGb": 8
  },
  "requestId": "04310d9e-1126-4c03-9b05-2aa884dbecb7",
  "status": 200
}
```

Set the desired scaling. Supported configurations include 1-24 CPU cores with memory (GB) set to 4× the core count:

```bash
cat <<EOF | tee cdc_scaling.json
{
  "replicaCpuMillicores": 24000,
  "replicaMemoryGb": 96
}
EOF

curl --silent --user $KEY_ID:$KEY_SECRET \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
-d @cdc_scaling.json | jq
```

Wait for the configuration to propagate (typically 3-5 minutes). After the scaling is finished, the GET endpoint will reflect the new values:

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

# example result:
{
  "result": {
    "replicaCpuMillicores": 24000,
    "replicaMemoryGb": 96
  },
  "requestId": "5a76d642-d29f-45af-a857-8c4d4b947bf0",
  "status": 200
}
```
