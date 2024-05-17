---
sidebar_title: Query API Endpoints
slug: /en/get-started/query-endpoints
description: Easily spin up REST API endpoints from your saved queries.
keywords:
  [
    sql console,
    sql client,
    cloud console,
    console,
    api,
    query api endpoints,
    query endpoints,
    query rest api,
  ]
---

# Automatic Query API Endpoints

Building interactive data-driven applications requires not only a fast database, well-structured data, and optimized queries. Your front-end and microservices also need an easy way to consume the data returned by those queries, preferably via well-structured APIs.

In just a couple of clicks, the Automatic Query Endpoints feature allows you to create an API endpoint directly from any saved SQL query in the ClickHouse Cloud Console.

:::note
This feature is in beta and not yet recommended for use in Production.
:::

## Setup

Configuring an automatic query API endpoint requires two things: a saved query and an API key. If you do not yet have one of these, follow the steps below.

### Creating a Cloud API Key

To begin, we’ll also need a Cloud API key. API keys can be created and managed from the [API keys page](/docs/en/cloud/manage/openapi.md) in the organization-level settings:

![Create an OpenAPI key](@site/docs/en/cloud/images/sqlconsole/endpoints-createkey.png)

:::note
You can also generate a new key directly from the Query API Endpoint configuration pane.
:::

### Creating a query

Now that we have an API key, open a new query tab. For demonstration purposes, we'll use the [youtube dataset](/docs/en/getting-started/example-datasets/youtube-dislikes), which contains approximately 4.5 billion records. As an example query, we'll return the top 10 uploaders by average views per video in a user-inputted `year` parameter:

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

Note that this query contains a parameter (year). The SQL console query editor automatically detects ClickHouse query parameter expressions and provides an input for each parameter. Let’s quickly run this query to make sure that it works:

![Test the example query](@site/docs/en/cloud/images/sqlconsole/endpoints-testquery.png)

Next step, we'll go ahead and save the query:

![Save example query](@site/docs/en/cloud/images/sqlconsole/endpoints-savequery.png)

More documentation around saved queries can be found [here](/docs/en/get-started/sql-console#saving-a-query).

## Configuring the Endpoint

Endpoints can be configured directly from query view by clicking the `Share` button and selecting `API Endpoint`. You'll be prompted to specify which API key(s) should be able to access the endpoint:

![Configure query endpoint](@site/docs/en/cloud/images/sqlconsole/endpoints-configure.png)

After selecting an API key, the endpoint will automatically be provisioned. An example `curl` command demonstrates how we can build requests to the endpoint:

![Endpoint curl command](@site/docs/en/cloud/images/sqlconsole/endpoints-completed.png)

:::note
Any query parameters present in the query will be automatically detected and the example request payload will contain a `queryVariables` object through which you can pass these parameters.
:::

## Testing and Monitoring

Once an endpoint is provisioned, you can test that it works by curling it:
<img src={require('@site/docs/en/cloud/images/sqlconsole/endpoints-curltest.png').default} class="image" alt="endpoint curl test" style={{width: '80%', background:'none'}} />

Now that we’ve verified that the endpoint works, a new button should appear immediately to the right of the ‘share’ button. Clicking it will open a flyout containing monitoring data about the query:

![Endpoint monitoring](@site/docs/en/cloud/images/sqlconsole/endpoints-monitoring.png)
