Embeddable is a developer toolkit for building fast, interactive, fully-custom analytics experiences directly into your app.

In [Embeddable](Embeddable) you define [Data Models](https://trevorio.notion.site/Data-modeling-35637bbbc01046a1bc47715456bfa1d8) and [Components](https://trevorio.notion.site/Using-components-761f52ac2d0743b488371088a1024e49) in code (stored in your own code repository) and use our **SDK** to make these available for your team in the powerful Embeddable **no-code builder.**

The end result is the ability to deliver fast, interactive **customer-facing analytics** directly in your product; designed by your product team; built by your engineering team; maintained by your customer-facing and data teams. Exactly the way it should be.

Built-in **row-level security** means that every user only ever sees **exactly** the data they’re allowed to see. And two levels of fully-configurable **caching** mean you can deliver fast, realtime analytics at scale.

## Prerequisites

- A running ClickHouse service (See [Getting Started](https://clickhouse.com/docs/en/getting-started/quick-start))

## Getting started

You add a database connection using Embeddable API. This connection is used to connect to your ClickHouse instance. You can add a connection using the following API call:

```javascript
// for security reasons, this must *never* be called from your client-side
fetch('https://api.embeddable.com/api/v1/connections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}` /* keep your API Key secure */,
  },
  body: JSON.stringify({
    name: 'my-clickhouse-db',
    type: 'clickhouse',
    credentials: {
      host: 'my.clickhouse.host',
      user: 'clickhouse_user',
      port: 8443,
      password: '*****',
    },
  }),
});


Response:
Status 201 { errorMessage: null }
```

The above represents a `CREATE` action, but all `CRUD` operations are available.

The `apiKey` can be found by clicking “**Publish**” on one of your Embeddable dashboards.

The `name` is a unique name to identify this **connection**.

- By default your **data models** will look for a **connection** called “default”, but you can supply your models with different [**data_source**](https://cube.dev/docs/reference/data-model/cube#data_source) names to support connecting different **data models** to different **connections** (simply specify the **[data_source](https://cube.dev/docs/reference/data-model/cube#data_source)** name in the model)

The `type` tells us which driver to use (postgres, bigquery, mongodb, etc.)

- We currently support all of [these](https://cube.dev/docs/product/configuration/data-sources) databases (but please let us know if your database isn’t in the list).  There are “Example requests” for different database types below.

The `credentials` is a javascript object containing the necessary credentials expected by the driver

- These are securely encrypted and only used to retrieve exactly the data you have described in your data models.
- We strongly encourage you to create a **read-only** database user for each connection (Embeddable will only ever read from your database, not write).

In order to support connecting to different databases for prod, qa, test, etc (or to support different databases for different customers) you can assign each **connection** to an **environment** (see [Environments API](https://www.notion.so/Environments-API-497169036b5148b38f7936aa75e62949?pvs=21))**.**](https://clickhouse.com/docs/en/getting-started/quick-start)
