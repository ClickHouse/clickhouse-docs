---
slug: /cloud/managed-postgres/openapi
sidebar_label: 'OpenAPI'
title: 'OpenAPI'
description: 'Control your Managed Postgres services with our OpenAPI'
keywords: ['managed postgres', 'openapi', 'api', 'curl', 'tutorial', 'command line']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

# Managed Postgres OpenAPI

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="openapi" />

Use the [ClickHouse OpenAPI](/cloud/manage/cloud-api) to programmatically
control your Managed Postgres services just like ClickHouse services. Already
familiar with [OpenAPI]? Get your [API keys] and jump right to the [Managed
Postgres API reference][pg-openapi]. Otherwise, follow along for a quick
run-through.

## API Keys {#api-keys}

Using the ClickHouse OpenAPI requires authentication; see [API keys] for how
to create them. Then use them via basic auth credentials like so:

```bash
KEY_ID=mykeyid
KEY_SECRET=mykeysecret

curl -s --user "$KEY_ID:$KEY_SECRET" https://api.clickhouse.cloud/v1/organizations | jq
```

## Organization ID {#organization-id}

Next you'll need your organization ID. 

1. Select your organization name in the lower left corner of the console.
2. Select **Organization details**.
3. Hit the copy icon to the right of **Organization ID** to copy it directly
   to your clipboard.

<!--

TODO: Uncomment and insert correct example output when the API ships.

Now can use it in your requests, like so:

```bash
ORG_ID=myorgid

curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres" | jq
```

Now you've made your first Postgres API request: [list API] above lists all of
the Postgres servers in your organization. The output should be something
like:

```json
{
  "result": [
    {
      "id": "c0d0b15d-5e8b-431d-8943-51b6e233e0b1",
      "name": "Customer's Organization",
      "createdAt": "2026-03-24T14:21:31Z",
      "privateEndpoints": [],
      "enableCoreDumps": true
    }
  ],
  "requestId": "c128d830-5769-4c82-8235-f79aa69d1ebf",
  "status": 200
}
```

-->

## CRUD {#crud}

Let's explore the lifecycle of a Postgres service.

### Create {#create}

First, create a new one
using the [create API]. It requires the following properties in the JSON body
of the request:

*   `name`: Name of the new Postgres service
*   `provider`: Name of the cloud provider
*   `region`: Region within the provider's network in which to deploy the
    service
*   `size`: The VM size
*   `storageSize`: The storage size for the VM

See the [create API] docs for the possible values for these properties. In
addition, let's specify Postgres 18 rather than the default, 17:

```bash
create_data='{
  "name": "my postgres",
  "provider": "aws",
  "region": "us-west-2",
  "postgresVersion": "18",
  "size": "r8gd.large",
  "storageSize": 118
}'
```

Now use this data to create a new instance; note that it requires the content
type header:

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" -H 'Content-Type: application/json' \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres" \
    -d "$create_data" | jq
```

On success, it will create a new instance and return information about it,
including connection data:

```json
{
  "result": {
    "id": "pg7myrd1j06p3gx4zrm2ze8qz6",
    "name": "my postgres",
    "provider": "aws",
    "region": "us-west-2",
    "postgresVersion": "18",
    "size": "r8gd.large",
    "storageSize": 118,
    "haType": "none",
    "tags": [],
    "connectionString": "postgres://postgres:vV6cfEr2p_-TzkCDrZOx@my-postgres-6d8d2e3e.pg7myrd1j06p3gx4zrm2ze8qz6.c0.us-west-2.aws.pg.clickhouse-dev.com:5432/postgres?channel_binding=require",
    "username": "postgres",
    "password": "vV6cfEr2p_-TzkCDrZOx",
    "hostname": "my-postgres-6d8d2e3e.pg7myrd1j06p3gx4zrm2ze8qz6.c0.us-west-2.aws.pg.clickhouse-dev.com",
    "isPrimary": true,
    "state": "creating"
  },
  "requestId": "a5957990-dbe5-46fd-b5ce-a7f8f79e50fe",
  "status": 200
}
```

### Read {#read}

Use the `id` from the response to fetch the service again:

```bash
PG_ID=pg7myrd1j06p3gx4zrm2ze8qz6
curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq
```

The output will be similar to the JSON returned for creation, but keep an eye
on the `state`; when it changes to `running`, the server is ready:

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq .result.state
```

```json
"running"
```

Now you can use the `connectionString` property to connect, for example via
[psql]:

```bash
$ psql "$(
    curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq -r .result.connectionString
)"

psql (18.3)
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off, ALPN: postgresql)
Type "help" for help.

postgres=# 
```

Type `\q` to exit [psql].

### Update {#update}

The [patch API] supports updating a subset of the properties of a Managed
Postgres service via [RFC 7396] JSON Merge Patch. Tags may be of particular
interest for complex deployments; simply send them alone in the request:

```bash
curl -sX PATCH --user "$KEY_ID:$KEY_SECRET" -H 'Content-Type: application/json' \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    -d '{"tags": [{"key": "Environment", "value": "production"}]}' \
    | jq .result
```

The returned data should include the new tags:

```json
{
  "id": "$PG_ID",
  "name": "my postgres",
  "provider": "aws",
  "region": "us-west-2",
  "postgresVersion": "18",
  "size": "r8gd.large",
  "storageSize": 118,
  "haType": "none",
  "tags": [
    {
      "key": "Environment",
      "value": "production"
    }
  ],
  "connectionString": "postgres://postgres:vV6cfEr2p_-TzkCDrZOx@my-postgres-6d8d2e3e.$PG_ID.c0.us-west-2.aws.pg.clickhouse-dev.com:5432/postgres?channel_binding=require",
  "username": "postgres",
  "password": "vV6cfEr2p_-TzkCDrZOx",
  "hostname": "my-postgres-6d8d2e3e.$PG_ID.c0.us-west-2.aws.pg.clickhouse-dev.com",
  "isPrimary": true,
  "state": "running"
}
```

<!--

TODO: Expand once implemented.

The OpenAPI provides additional endpoints to update properties not supported
by the [patch API]. For example, to update the [Postgres configuration],
use the [config API]:

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" -H 'Content-Type: application/json' \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID/config" \
    -d '{"max_connections": "42"}'
```

The output will show the updated configuration:

```json
{"max_connections": "42"}
```

Additional update APIs include:

* Reset superuser password
* Rename a Postgres service (changes host name)
* Upgrade to the next major Postgres version

-->

### Delete {#delete}

Use the [delete API] to delete a Postgres service.

:::warning
Deleting a Postgres service completely removes the service and all of its
data. Be sure you have a backup or have promoted a replica to primary before
deleting a service.
:::

```bash
curl -sX DELETE --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq
```

On success, the response will report status code 200, e.g.:

```json
{
  "requestId": "ac9bbffa-e370-410c-8bdd-bd24bf3d7f82",
  "status": 200
}
```

[ClickHouse OpenAPI]: /cloud/manage/cloud-api "Cloud API"
[OpenAPI]: https://www.openapis.org "OpenAPI Initiative"
[API keys]: /cloud/manage/openapi "Managing API Keys"
[pg-openapi]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres
  "OpenAPI spec for ClickHouse Cloud: Postgres"
[list API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceGetList
  "Fetch a list of an organization's Postgres services"
[create API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceCreate
  "Create new Postgres service"
[psql]: https://www.postgresql.org/docs/current/app-psql.html
  "PostgreSQL Docs: psql — PostgreSQL interactive terminal"
[patch API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServicePatch
  "Update a PostgreSQL service"
[RFC 7396]: https://www.rfc-editor.org/rfc/rfc7396 "RFC 7396: JSON Merge Patch"
[Postgres configuration]: https://www.postgresql.org/docs/18/runtime-config.html
  "PostgreSQL Docs: Server Configuration"
[config API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceSetConfig
  "Update a Postgres Service configuration"
[delete API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceDelete
  "Delete a PostgreSQL service"
