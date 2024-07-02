---
sidebar_title: Query API Endpoints
slug: /en/get-started/query-endpoints
description: Easily spin up REST API endpoints from your saved queries
keywords: [api, query api endpoints, query endpoints, query rest api]
---

import BetaBadge from '@theme/badges/BetaBadge';

# Query API Endpoints

<BetaBadge />

The **Query API Endpoints** feature allows you to create an API endpoint directly from any saved SQL query in the ClickHouse Cloud console. You'll be able to access API endpoints via HTTP to execute your saved queries without needing to connect to your ClickHouse Cloud service via a native driver.

Before proceeding, ensure you have an API key and an Admin Console Role. You can follow this guide to [create an API key](/docs/en/cloud/manage/openapi).

## Creating a saved query

If you have a saved query, you can skip this step.

Open a new query tab. For demonstration purposes, we'll use the [youtube dataset](/docs/en/getting-started/example-datasets/youtube-dislikes), which contains approximately 4.5 billion records. As an example query, we'll return the top 10 uploaders by average views per video in a user-inputted `year` parameter:

```sql
with sum(view_count) as view_sum,
    round(view_sum / num_uploads, 2) as per_upload
select
    uploader,
    count() as num_uploads,
    formatReadableQuantity(view_sum) as total_views,
    formatReadableQuantity(per_upload) as views_per_video
from
    youtube
where
    toYear(upload_date) = {year: UInt16}
group by uploader
order by per_upload desc
limit 10
```

Note that this query contains a parameter (`year`). The SQL console query editor automatically detects ClickHouse query parameter expressions and provides an input for each parameter. Let's quickly run this query to make sure that it works:

![Test the example query](@site/docs/en/cloud/images/sqlconsole/endpoints-testquery.png)

Next step, we'll go ahead and save the query:

![Save example query](@site/docs/en/cloud/images/sqlconsole/endpoints-savequery.png)

More documentation around saved queries can be found [here](/docs/en/get-started/sql-console#saving-a-query).

## Configuring the Query API Endpoint

Query API endpoints can be configured directly from query view by clicking the **Share** button and selecting `API Endpoint`. You'll be prompted to specify which API key(s) should be able to access the endpoint:

![Configure query endpoint](@site/docs/en/cloud/images/sqlconsole/endpoints-configure.png)

After selecting an API key, the query API endpoint will automatically be provisioned. An example `curl` command will be displayed so you can send a test request:

![Endpoint curl command](@site/docs/en/cloud/images/sqlconsole/endpoints-completed.png)

## Query API parameters

Query parameters in a query can be specified with the syntax `{parameter_name: type}`. These parameters will be automatically detected and the example request payload will contain a `queryVariables` object through which you can pass these parameters.

## Testing and monitoring

Once a Query API endpoint is created, you can test that it works by using `curl` or any other HTTP client:
<img src={require('@site/docs/en/cloud/images/sqlconsole/endpoints-curltest.png').default} class="image" alt="endpoint curl test" style={{width: '80%', background:'none'}} />

After you've sent your first request, a new button should appear immediately to the right of the **Share** button. Clicking it will open a flyout containing monitoring data about the query:

![Endpoint monitoring](@site/docs/en/cloud/images/sqlconsole/endpoints-monitoring.png)
