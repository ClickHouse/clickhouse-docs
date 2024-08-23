---
date: 2023-03-26
---

# How do I find the most expensive queries in my ClickHouse platform?

The `query_log` table in the `system` database keeps track of all your queries, including:

- how much memory the query consumed, and
- how much CPU time was needed

The following query returns the top 10 queries, where "top" means the queries that used the most memory:

```sql
SELECT
    type,
    event_time,
    initial_query_id,
    query_id,
    formatReadableSize(memory_usage) AS memory,
    ProfileEvents.Values[indexOf(ProfileEvents.Names, 'UserTimeMicroseconds')] AS userCPU,
    ProfileEvents.Values[indexOf(ProfileEvents.Names, 'SystemTimeMicroseconds')] AS systemCPU,
    normalizedQueryHash(query) AS normalized_query_hash
FROM clusterAllReplicas(default, system.query_log)
ORDER BY memory_usage DESC
LIMIT 10;
```

The response looks like:

```response
┌─type────────┬──────────event_time─┬─initial_query_id─────────────────────┬─memory─────┬─────userCPU─┬──systemCPU─┬─normalized_query_hash─┐
│ QueryFinish │ 2023-03-26 21:36:07 │ 7fc488a5-838f-410d-88ee-2f492825a26b │ 3.45 GiB   │ 28147128901 │ 8590897697 │    178963678599600243 │
│ QueryFinish │ 2023-03-26 21:36:04 │ 7fc488a5-838f-410d-88ee-2f492825a26b │ 1.18 GiB   │ 10194162387 │ 1183376457 │   4121209451971717712 │
│ QueryFinish │ 2023-03-26 21:36:06 │ 7fc488a5-838f-410d-88ee-2f492825a26b │ 1.16 GiB   │ 10516510952 │ 1484303318 │   4121209451971717712 │
│ QueryFinish │ 2023-03-26 21:35:59 │ 7fc488a5-838f-410d-88ee-2f492825a26b │ 1.14 GiB   │ 11484580963 │ 1464145099 │   4121209451971717712 │
│ QueryFinish │ 2023-03-26 21:47:01 │ 8119e682-a343-4847-96e7-d34ad8a748a1 │ 455.29 MiB │   123340498 │    8234304 │  10687606311941357470 │
│ QueryFinish │ 2023-03-26 22:07:05 │ f2690e48-fe1e-4367-ae9d-435d962003a5 │ 377.94 MiB │  2358130001 │  668098391 │   5988812223780974416 │
│ QueryFinish │ 2023-03-26 20:45:42 │ 04618222-40a1-4299-8c3d-9f050a82d849 │ 18.48 MiB  │       24676 │      16620 │   3205198713665290475 │
│ QueryFinish │ 2023-03-26 22:14:37 │ badf1097-5f8f-4486-88e9-3a5ac2e4734c │ 17.41 MiB  │      186234 │     148739 │   1910846996890686559 │
│ QueryFinish │ 2023-03-26 21:39:42 │ 8d373327-f566-4cd5-9f2c-cec75f534751 │ 16.19 MiB  │       23169 │      12365 │   3205198713665290475 │
│ QueryFinish │ 2023-03-26 21:35:42 │ ea672dba-7c10-4dd4-b819-cad9dccbf5d0 │ 13.97 MiB  │       20696 │       8001 │   3205198713665290475 │
└─────────────┴─────────────────────┴──────────────────────────────────────┴────────────┴─────────────┴────────────┴───────────────────────┘
```

:::note
The `initial_query_id` represents the ID of the initial query for distributed query execution launched from the node receiving the request. The `query_id` contains the ID of the child query executed on a different node. See [this article](https://clickhouse.com/docs/knowledgebase/find-expensive-queries#initial_query_id-vs-query_id) for more details.
:::

You can use the query ID to extract more details about the query. Let's research our longest running query above (the first one):

```sql
SELECT query
FROM clusterAllReplicas(default, system.query_log)
WHERE initial_query_id = '7fc488a5-838f-410d-88ee-2f492825a26b'
```

It turns out to be the query we used to insert a few billion rows of data into a table named `youtube` (see the [YouTube dislikes dataset](https://clickhouse.com/docs/en/getting-started/example-datasets/youtube-dislikes)):

```sql
INSERT INTO youtube
SETTINGS input_format_null_as_default = 1
SELECT
    id,
    parseDateTimeBestEffortUS(toString(fetch_date)) AS fetch_date,
    upload_date,
    ifNull(title, '') AS title,
    uploader_id,
    ifNull(uploader, '') AS uploader,
    uploader_sub_count,
    is_age_limit,
    view_count,
    like_count,
    dislike_count,
    is_crawlable,
    has_subtitles,
    is_ads_enabled,
    is_comments_enabled,
    ifNull(description, '') AS description,
    rich_metadata,
    super_titles,
    ifNull(uploader_badges, '') AS uploader_badges,
    ifNull(video_badges, '') AS video_badges
FROM s3Cluster('default','https://clickhouse-public-datasets.s3.amazonaws.com/youtube/original/files/*.zst', 'JSONLines')
```

## initial_query_id VS query_id

Note that in a clustered ClickHouse environment (like ClickHouse Cloud) `initial_query_id` represents the ID of the initial query for distributed query execution launched from the node receiving the request;
then `query_id` field will contain the ID of the child query executed on a different node.

If we add `query_id` to the above query we pin our search around `initial_query_id` = `a7262fa2-bd8b-4b51-a359-621ccf282417` and `hostname()`:

```sql
SELECT
    hostname(),
    type,
    event_time,
    initial_query_id,
    query_id,
    formatReadableSize(memory_usage) AS memory,
    ProfileEvents.Values[indexOf(ProfileEvents.Names, 'UserTimeMicroseconds')] AS userCPU,
    ProfileEvents.Values[indexOf(ProfileEvents.Names, 'SystemTimeMicroseconds')] AS systemCPU,
    normalizedQueryHash(query) AS normalized_query_hash
FROM clusterAllReplicas(default, system.query_log)
WHERE initial_query_id = 'a7262fa2-bd8b-4b51-a359-621ccf282417'
ORDER BY memory_usage DESC
LIMIT 10 FORMAT Pretty;
```


we will get:
```
┏━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━┳━━━━━━━━━┳━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━┓
┃ hostname()             ┃ type        ┃          event_time ┃ initial_query_id                     ┃ query_id                             ┃ memory     ┃ userCPU ┃ systemCPU ┃ normalized_query_hash ┃
┡━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━╇━━━━━━━━━╇━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━┩
│ server-0 │ QueryFinish │ 2023-04-26 06:25:53 │ a7262fa2-bd8b-4b51-a359-621ccf282417 │ 1f810b3c-b3cb-4a7b-bc6c-8c8cc1e52515 │ 125.13 MiB │ 1754290 │    133344 │  17604798521132779336 │
├────────────────────────┼─────────────┼─────────────────────┼──────────────────────────────────────┼──────────────────────────────────────┼────────────┼─────────┼───────────┼───────────────────────┤
│ server-2 │ QueryFinish │ 2023-04-26 06:25:53 │ a7262fa2-bd8b-4b51-a359-621ccf282417 │ a7262fa2-bd8b-4b51-a359-621ccf282417 │ 123.08 MiB │ 1849115 │    123412 │   4258439895846105173 │
└────────────────────────┴─────────────┴─────────────────────┴──────────────────────────────────────┴──────────────────────────────────────┴────────────┴─────────┴───────────┴───────────────────────┘
┏━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━┳━━━━━━━━━┳━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━┓
┃ hostname()             ┃ type        ┃          event_time ┃ initial_query_id                     ┃ query_id                             ┃ memory    ┃ userCPU ┃ systemCPU ┃ normalized_query_hash ┃
┡━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━╇━━━━━━━━━╇━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━┩
│ server-1 │ QueryFinish │ 2023-04-26 06:25:53 │ a7262fa2-bd8b-4b51-a359-621ccf282417 │ 7dfd9297-5173-4be7-a866-d7cbe1e1abab │ 93.77 MiB │ 1890981 │    101724 │  17604798521132779336 │
├────────────────────────┼─────────────┼─────────────────────┼──────────────────────────────────────┼──────────────────────────────────────┼───────────┼─────────┼───────────┼───────────────────────┤
│ server-1 │ QueryStart  │ 2023-04-26 06:25:52 │ a7262fa2-bd8b-4b51-a359-621ccf282417 │ 7dfd9297-5173-4be7-a866-d7cbe1e1abab │ 0.00 B    │       0 │         0 │  17604798521132779336 │
└────────────────────────┴─────────────┴─────────────────────┴──────────────────────────────────────┴──────────────────────────────────────┴───────────┴─────────┴───────────┴───────────────────────┘
┏━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━┳━━━━━━━━━┳━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━┓
┃ hostname()             ┃ type       ┃          event_time ┃ initial_query_id                     ┃ query_id                             ┃ memory ┃ userCPU ┃ systemCPU ┃ normalized_query_hash ┃
┡━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━╇━━━━━━━━━╇━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━┩
│ server-0 │ QueryStart │ 2023-04-26 06:25:52 │ a7262fa2-bd8b-4b51-a359-621ccf282417 │ 1f810b3c-b3cb-4a7b-bc6c-8c8cc1e52515 │ 0.00 B │       0 │         0 │  17604798521132779336 │
├────────────────────────┼────────────┼─────────────────────┼──────────────────────────────────────┼──────────────────────────────────────┼────────┼─────────┼───────────┼───────────────────────┤
│ server-2 │ QueryStart │ 2023-04-26 06:25:52 │ a7262fa2-bd8b-4b51-a359-621ccf282417 │ a7262fa2-bd8b-4b51-a359-621ccf282417 │ 0.00 B │       0 │         0 │   4258439895846105173 │
└────────────────────────┴────────────┴─────────────────────┴──────────────────────────────────────┴──────────────────────────────────────┴────────┴─────────┴───────────┴───────────────────────┘
```

Note we have several results from several hosts (the different cluster nodes).

To refine further and get only the child queries we could also add the `query_id != initial_query_id` condition to the WHERE clause:

```sql
SELECT
    hostname(),
    type,
    event_time,
    initial_query_id,
    query_id,
    formatReadableSize(memory_usage) AS memory,
    ProfileEvents.Values[indexOf(ProfileEvents.Names, 'UserTimeMicroseconds')] AS userCPU,
    ProfileEvents.Values[indexOf(ProfileEvents.Names, 'SystemTimeMicroseconds')] AS systemCPU,
    normalizedQueryHash(query) AS normalized_query_hash
FROM clusterAllReplicas(default, system.query_log)
WHERE (query_id = initial_query_id) AND (initial_query_id = 'a7262fa2-bd8b-4b51-a359-621ccf282417')
ORDER BY memory_usage DESC
LIMIT 10 FORMAT Pretty;
```

returns all the child queries executed on the remote nodes (remote to the node where the query was first thrown at):

```
┏━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━┳━━━━━━━━━┳━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━┓
┃ hostname()             ┃ type        ┃          event_time ┃ initial_query_id                     ┃ query_id                             ┃ memory     ┃ userCPU ┃ systemCPU ┃ normalized_query_hash ┃
┡━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━╇━━━━━━━━━╇━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━┩
│ server-1 │ QueryFinish │ 2023-04-26 06:25:53 │ a7262fa2-bd8b-4b51-a359-621ccf282417 │ 7dfd9297-5173-4be7-a866-d7cbe1e1abab │ 93.77 MiB  │ 1890981 │    101724 │  17604798521132779336 │
├────────────────────────┼─────────────┼─────────────────────┼──────────────────────────────────────┼──────────────────────────────────────┼────────────┼─────────┼───────────┼───────────────────────┤
│ server-0 │ QueryFinish │ 2023-04-26 06:25:53 │ a7262fa2-bd8b-4b51-a359-621ccf282417 │ 1f810b3c-b3cb-4a7b-bc6c-8c8cc1e52515 │ 125.13 MiB │ 1754290 │    133344 │  17604798521132779336 │
├────────────────────────┼─────────────┼─────────────────────┼──────────────────────────────────────┼──────────────────────────────────────┼────────────┼─────────┼───────────┼───────────────────────┤
│ server-1 │ QueryStart  │ 2023-04-26 06:25:52 │ a7262fa2-bd8b-4b51-a359-621ccf282417 │ 7dfd9297-5173-4be7-a866-d7cbe1e1abab │ 0.00 B     │       0 │         0 │  17604798521132779336 │
├────────────────────────┼─────────────┼─────────────────────┼──────────────────────────────────────┼──────────────────────────────────────┼────────────┼─────────┼───────────┼───────────────────────┤
│ server-0 │ QueryStart  │ 2023-04-26 06:25:52 │ a7262fa2-bd8b-4b51-a359-621ccf282417 │ 1f810b3c-b3cb-4a7b-bc6c-8c8cc1e52515 │ 0.00 B     │       0 │         0 │  17604798521132779336 │
└────────────────────────┴─────────────┴─────────────────────┴──────────────────────────────────────┴──────────────────────────────────────┴────────────┴─────────┴───────────┴───────────────────────┘
└────────────────────────┴─────────────┴─────────────────────┴──────────────────────────────────────┴──────────────────────────────────────┴────────────┴─────────┴───────────┴───────────────────────┘
```


conversely, `query_id = initial_query_id` will return only the queries executed on the local node where the distributed query was first thrown at:

```sql
SELECT
    hostname(),
    type,
    event_time,
    initial_query_id,
    query_id,
    formatReadableSize(memory_usage) AS memory,
    ProfileEvents.Values[indexOf(ProfileEvents.Names, 'UserTimeMicroseconds')] AS userCPU,
    ProfileEvents.Values[indexOf(ProfileEvents.Names, 'SystemTimeMicroseconds')] AS systemCPU,
    normalizedQueryHash(query) AS normalized_query_hash
FROM clusterAllReplicas(default, system.query_log)
WHERE (query_id = initial_query_id) AND (initial_query_id = 'a7262fa2-bd8b-4b51-a359-621ccf282417')
ORDER BY memory_usage DESC
LIMIT 10 FORMAT Pretty;
```

giving:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━┳━━━━━━━━━┳━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━┓
┃ hostname()             ┃ type        ┃          event_time ┃ initial_query_id                     ┃ query_id                             ┃ memory     ┃ userCPU ┃ systemCPU ┃ normalized_query_hash ┃
┡━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━╇━━━━━━━━━╇━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━┩
│ server-2 │ QueryFinish │ 2023-04-26 06:25:53 │ a7262fa2-bd8b-4b51-a359-621ccf282417 │ a7262fa2-bd8b-4b51-a359-621ccf282417 │ 123.08 MiB │ 1849115 │    123412 │   4258439895846105173 │
├────────────────────────┼─────────────┼─────────────────────┼──────────────────────────────────────┼──────────────────────────────────────┼────────────┼─────────┼───────────┼───────────────────────┤
│ server-2 │ QueryStart  │ 2023-04-26 06:25:52 │ a7262fa2-bd8b-4b51-a359-621ccf282417 │ a7262fa2-bd8b-4b51-a359-621ccf282417 │ 0.00 B     │       0 │         0 │   4258439895846105173 │
└────────────────────────┴─────────────┴─────────────────────┴──────────────────────────────────────┴──────────────────────────────────────┴────────────┴─────────┴───────────┴───────────────────────┘
```

As for other System Tables, you can find more details about the meaning of each field in our [docs](https://clickhouse.com/docs/en/operations/system-tables/query_log).
