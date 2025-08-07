---
title: 'Scaling CDC ClickPipes via OpenAPI'
description: 'Doc for scaling CDC ClickPipes via OpenAPI'
slug: /integrations/clickpipes/postgres/scaling
sidebar_label: 'Scaling'
---

Default configuration of CDC ClickPipes was designed to handle most use-cases as-is. If your workload exceeds 1 TB for the initial load or 5,000 row changes a second, or the data needs to be moved as quickly as possible regardless of cost, this API might be what you need.

Other signs that scaling may be necessary:
- Initial load is taking longer than 24 hours while the load on the source DB is low
  - Consider tweaking the [initial load parallelism and partitioning](/integrations/data-ingestion/clickpipes/postgres/parallel_initial_load) first
- The new rows taking more than 2× the sync interval to appear on the destination table
  - As long as there are no [long-running transactions](/integrations/clickpipes/postgres/sync_control#transactions-pg-sync) on the source

For more information about the underlying infrastructure and costs, see [Postgres CDC Pricing](/cloud/manage/billing/overview#clickpipes-for-postgres-cdc).

## Prerequisites for this process {#prerequisites}

Before you get started you will need:

1. [ClickHouse API key](/cloud/manage/openapi) with Admin permissions on the target ClickHouse Cloud service.
2. A CDC ClickPipe (Postgres, MySQL or MongoDB) provisioned in the service at some point in time. CDC infrastructure gets created along with the first ClickPipe, and the scaling endpoints become available from that point onwards.

## Steps to scale CDC ClickPipes {#cdc-scaling-steps}

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

Set the desired scaling. Supported configurations include 1..16 CPU cores and memory GB that is 4× the core count:

```bash
cat <<EOF | tee cdc_scaling.json
{
  "replicaCpuMillicores": 16000,
  "replicaMemoryGb": 64
}
EOF

curl --silent --user $KEY_ID:$KEY_SECRET \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
-d @cdc_scaling.json | jq
```

Wait for the command to propagate - this usually takes 3-5 minutes. After the scaling is finished, the GET endpoint will reflect the new values:

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

# example result:
{
  "result": {
    "replicaCpuMillicores": 16000,
    "replicaMemoryGb": 64
  },
  "requestId": "5a76d642-d29f-45af-a857-8c4d4b947bf0",
  "status": 200
}
```
