---
slug: /en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-multiple
sidebar_label: Using multiple primary indexes
sidebar_position: 3
description: Using multiple primary indxes
---
# Using multiple primary indexes

<a name="filtering-on-key-columns-after-the-first"></a>

## Secondary key columns can (not) be inefficient


When a query is filtering on a column that is part of a compound key and is the first key column, [then ClickHouse is running the binary search algorithm over the key column's index marks](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#the-primary-index-is-used-for-selecting-granules).

But what happens when a query is filtering on a column that is part of a compound key, but is not the first key column?

:::note
We discuss a scenario when a query is explicitly not filtering on the first key colum, but on a secondary key column.

When a query is filtering on both the first key column and on any key column(s) after the first then ClickHouse is running binary search over the first key column's index marks.
:::

<br/>
<br/>

<a name="query-on-url"></a>
We use a query that calculates the top 10 users that have most frequently clicked on the URL "http://public_search":

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

The response is: <a name="query-on-url-slow"></a>
```response
┌─────UserID─┬─Count─┐
│ 2459550954 │  3741 │
│ 1084649151 │  2484 │
│  723361875 │   729 │
│ 3087145896 │   695 │
│ 2754931092 │   672 │
│ 1509037307 │   582 │
│ 3085460200 │   573 │
│ 2454360090 │   556 │
│ 3884990840 │   539 │
│  765730816 │   536 │
└────────────┴───────┘

10 rows in set. Elapsed: 0.086 sec.
// highlight-next-line
Processed 8.81 million rows,
799.69 MB (102.11 million rows/s., 9.27 GB/s.)
```

The client output indicates that ClickHouse almost executed a full table scan despite the [URL column being part of the compound primary key](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#a-table-with-a-primary-key)! ClickHouse reads 8.81 million rows from the 8.87 million rows of the table.

If [trace_logging](/docs/en/operations/server-configuration-parameters/settings.md/#server_configuration_parameters-logger) is enabled then the ClickHouse server log file shows that ClickHouse used a <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">generic exclusion search</a> over the 1083 URL index marks in order to identify those granules that possibly can contain rows with a URL column value of "http://public_search":
```response
...Executor): Key condition: (column 1 in ['http://public_search',
                                           'http://public_search'])
// highlight-next-line
...Executor): Used generic exclusion search over index for part all_1_9_2
              with 1537 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
// highlight-next-line
              1076/1083 marks by primary key, 1076 marks to read from 5 ranges
...Executor): Reading approx. 8814592 rows with 10 streams
```
We can see in the sample trace log above, that 1076 (via the marks) out of 1083 granules were selected as possibly containing rows with a matching URL value.

This results in 8.81 million rows being streamed into the ClickHouse engine (in parallel by using 10 streams), in order to identify the rows that are actually contain the URL value "http://public_search".

However, [as we will see later](#query-on-url-fast) only 39 granules out of that selected 1076 granules actually contain matching rows.

Whilst the primary index based on the compound primary key (UserID, URL) was very useful for speeding up queries filtering for rows with a specific UserID value, the index is not providing significant help with speeding up the query that filters for rows with a specific URL value.

The reason for this is that the URL column is not the first key column and therefore ClickHouse is using a generic exclusion search algorithm (instead of binary search) over the URL column's index marks, and **the effectiveness of that algorithm is dependant on the cardinality difference** between the URL column and it's predecessor key column UserID.

In order to illustrate that, we give some details about how the generic exclusion search works.


<a name="generic-exclusion-search-algorithm"></a>

## Generic exclusion search algorithm







The following is illustrating how the <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank" >ClickHouse generic exclusion search algorithm</a> works when granules are selected via a secondary column where the predecessor key column has a low(er) or high(er) cardinality.

As an example for both cases we will assume:
- a query that is searching for rows with URL value = "W3".
- an abstract version of our hits table with simplified values for UserID and URL.
- the same compound primary key (UserID, URL) for the index. This means rows are first ordered by UserID values. Rows with the same UserID value are then ordered by URL.
- a granule size of two i.e. each granule contains two rows.

We have marked the key column values for the first table rows for each granule in orange in the diagrams below..

**Predecessor key column has low(er) cardinality**<a name="generic-exclusion-search-fast"></a>

Suppose UserID had low cardinality. In this case it would be likely that the same UserID value is spread over multiple table rows and granules and therefore index marks. For index marks with the same UserID, the URL values for the index marks are sorted in ascending order (because the table rows are ordered first by UserID and then by URL). This allows efficient filtering as described below:
<img src={require('./images/sparse-primary-indexes-07.png').default} class="image"/>

There are three different scenarios for the granule selection process for our abstract sample data in the diagram above:


1.  Index mark 0 for which the **URL value is smaller than W3 and for which the URL value of the directly succeeding index mark is also smaller than W3** can be excluded because mark 0, and 1 have the same UserID value. Note that this exclusion-precondition ensures that granule 0 is completely composed of U1 UserID values so that ClickHouse can assume that also the maximum URL value in granule 0 is smaller than W3 and exclude the granule.

2. Index mark 1 for which the **URL value is smaller (or equal) than W3 and for which the URL value of the directly succeeding index mark is greater (or equal) than W3** is selected because it means that granule 1 can possibly contain rows with URL W3.

3. Index marks 2 and 3 for which the **URL value is greater than W3** can be excluded, since index marks of a primary index store the key column values for the first table row for each granule and the table rows are sorted on disk by the key column values, therefore granule 2 and 3 can't possibly contain URL value W3.



**Predecessor key column has high(er) cardinality**<a name="generic-exclusion-search-slow"></a>

When the UserID has high cardinality then it is unlikely that the same UserID value is spread over multiple table rows and granules. This means the URL values for the index marks are not monotonically increasing:

<img src={require('./images/sparse-primary-indexes-08.png').default} class="image"/>


As we can see in the diagram above, all shown marks whose URL values are smaller than W3 are getting selected for streaming its associated granule's rows into the ClickHouse engine.

This is because whilst all index marks in the diagram fall into scenario 1 described above, they do not satisfy the mentioned exclusion-precondition that *the directly succeeding index mark has the same UserID value as the current mark* and thus can’t be excluded.

For example, consider index mark 0 for which the **URL value is smaller than W3 and for which the URL value of the directly succeeding index mark is also smaller than W3**. This can *not* be excluded because the directly succeeding index mark 1 does *not* have the same UserID value as the current mark 0.

This ultimately prevents ClickHouse from making assumptions about the maximum URL value in granule 0. Instead it has to assume that granule 0 potentially contains rows with URL value W3 and is forced to select mark 0.


The same scenario is true for mark 1, 2, and 3.




:::note Conclusion
The <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">generic exclusion search algorithm</a> that ClickHouse is using instead of the <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">binary search algorithm</a> when a query is filtering on a column that is part of a compound key, but is not the first key column is most effective when the predecessor key column has low(er) cardinality.
:::

In our sample data set both key columns (UserID, URL) have similar high cardinality, and, as explained, the generic exclusion search algorithm is not very effective when the predecessor key column of the URL column has a high(er) or similar cardinality.


## Note about data skipping index


Because of the similarly high cardinality of UserID and URL, our [<font >query filtering on URL</font>](#query-on-url) also wouldn't benefit much from creating a [<font >secondary data skipping index</font>](../skipping-indexes.md) on the URL column
of our [<font >table with compound primary key (UserID, URL)</font>](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#a-table-with-a-primary-key).

For example this two statements create and populate a [minmax](/docs/en/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) data skipping index on the URL column of our table:
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouse now created an additional index that is storing - per group of 4 consecutive [<font >granules</font>](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#data-is-organized-into-granules-for-parallel-data-processing) (note the <font face = "monospace">GRANULARITY 4</font> clause in the <font face = "monospace">ALTER TABLE</font> statement above) - the minimum and maximum URL value:

<img src={require('./images/sparse-primary-indexes-13a.png').default} class="image"/>

The first index entry (‘mark 0’ in the diagram above) is storing the minimum and maximum URL values for the [<font >rows belonging to the first 4 granules of our table</font>](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#data-is-organized-into-granules-for-parallel-data-processing).

The second index entry (‘mark 1’) is storing the minimum and maximum URL values for the rows belonging to the next 4 granules of our table, and so on.

(ClickHouse also created a special [<font >mark file</font>](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#mark-files-are-used-for-locating-granules) for to the data skipping index for [<font >locating</font>](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#mark-files-are-used-for-locating-granules) the groups of granules associated with the index marks.)


Because of the similarly high cardinality of UserID and URL, this secondary data skipping index can't help with excluding granules from being selected when our [<font >query filtering on URL</font>](#query-on-url) is executed.

The specific URL value that the query is looking for (i.e. 'http://public_search') very likely is between the minimum and maximum value stored by the index for each group of granules resulting in ClickHouse being forced to select the group of granules (because they might contain row(s) matching the query).


## A need to use multiple primary indexes


As a consequence, if we want to significantly speed up our sample query that filters for rows with a specific URL then we need to use a primary index optimized to that query.

If in addition we want to keep the good performance of our sample query that filters for rows with a specific UserID then we need to use multiple primary indexes.

The following is showing ways for achieving that.

<a name="multiple-primary-indexes"></a>

## Options for creating additional primary indexes


If we want to significantly speed up both of our sample queries - the one that  filters for rows with a specific UserID and the one that filters for rows with a specific URL - then we need to use multiple primary indexes by using one of these three options:

- Creating a **second table** with a different primary key.
- Creating a **materialized view** on our existing table.
- Adding a **projection** to our existing table.

All three options will effectively duplicate our sample data into a additional table in order to reorganize the table primary index and row sort order.

However, the three options differ in how transparent that additional table is to the user with respect to the routing of queries and insert statements.

When creating a **second table** with a different primary key then queries must be explicitly send to the table version best suited for the query, and new data must be inserted explicitly into both tables in order to keep the tables in sync:
<img src={require('./images/sparse-primary-indexes-09a.png').default} class="image"/>


With a **materialized view** the additional table is implicitly created and data is automatically kept in sync between both tables:
<img src={require('./images/sparse-primary-indexes-09b.png').default} class="image"/>


And the **projection** is the most transparent option because next to automatically keeping the implicitly created (and hidden) additional table in sync with data changes, ClickHouse will automatically choose the most effective table version for queries:
<img src={require('./images/sparse-primary-indexes-09c.png').default} class="image"/>

In the following we discuss this three options for creating and using multiple primary indexes in more detail and with real examples.

<a name="multiple-primary-indexes-via-secondary-tables"></a>

## Option 1: Secondary Tables

<a name="secondary-table"></a>
We are creating a new additional table where we switch the order of the key columns (compared to our original table) in the primary key:

```sql
CREATE TABLE hits_URL_UserID
(
    `UserID` UInt32,
    `URL` String,
    `EventTime` DateTime
)
ENGINE = MergeTree
// highlight-next-line
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
SETTINGS index_granularity = 8192, index_granularity_bytes = 0;
```

Insert all 8.87 million rows from our [original table](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#a-table-with-a-primary-key) into the additional table:

```sql
INSERT INTO hits_URL_UserID
SELECT * from hits_UserID_URL;
```

The response looks like:

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

And finally optimize the table:
```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

Because we switched the order of the columns in the primary key, the inserted rows are now stored on disk in a different lexicographical order (compared to our [original table](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#a-table-with-a-primary-key)) and therefore also the 1083 granules of that table are containing different values than before:
<img src={require('./images/sparse-primary-indexes-10.png').default} class="image"/>

This is the resulting primary key:
<img src={require('./images/sparse-primary-indexes-11.png').default} class="image"/>

That can now be used to significantly speed up the execution of our example query filtering on the URL column in order to calculate the top 10 users that most frequently clicked on the URL "http://public_search":
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

The response is:
<a name="query-on-url-fast"></a>

```response
┌─────UserID─┬─Count─┐
│ 2459550954 │  3741 │
│ 1084649151 │  2484 │
│  723361875 │   729 │
│ 3087145896 │   695 │
│ 2754931092 │   672 │
│ 1509037307 │   582 │
│ 3085460200 │   573 │
│ 2454360090 │   556 │
│ 3884990840 │   539 │
│  765730816 │   536 │
└────────────┴───────┘

10 rows in set. Elapsed: 0.017 sec.
// highlight-next-line
Processed 319.49 thousand rows,
11.38 MB (18.41 million rows/s., 655.75 MB/s.)
```

Now, instead of [almost doing a full table scan](#filtering-on-key-columns-after-the-first), ClickHouse executed that query much more effectively.

With the primary index from the [original table](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#a-table-with-a-primary-key) where UserID was the first, and URL the second key column, ClickHouse used a [generic exclusion search](#generic-exclusion-search-algorithm) over the index marks for executing that query and that was not very effective because of the similarly high cardinality of UserID and URL.

With URL as the first column in the primary index, ClickHouse is now running <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">binary search</a> over the index marks.
The corresponding trace log in the ClickHouse server log file confirms that:
```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
// highlight-next-line
...Executor): Running binary search on index range for part all_1_9_2 (1083 marks)
...Executor): Found (LEFT) boundary mark: 644
...Executor): Found (RIGHT) boundary mark: 683
...Executor): Found continuous range in 19 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
// highlight-next-line
              39/1083 marks by primary key, 39 marks to read from 1 ranges
...Executor): Reading approx. 319488 rows with 2 streams
```
ClickHouse selected only 39 index marks, instead of 1076 when generic exclusion search was used.


Note that the additional table is optimized for speeding up the execution of our example query filtering on URLs.


Similar to the [bad performance](#query-on-url-slow) of that query with our [original table](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#a-table-with-a-primary-key), our [example query filtering on UserIDs](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#the-primary-index-is-used-for-selecting-granules) will not run very effectively with the new additional table, because UserID is now the second key column in the primary index of that table and therefore ClickHouse will use generic exclusion search for granule selection, which is [not very effective for similarly high cardinality](#generic-exclusion-search-slow) of UserID and URL.
Open the details box for specifics.
<details>
    <summary><font color="black">
    Query filtering on UserIDs now has bad performance<a name="query-on-userid-slow"></a>
    </font></summary>
    <p><font color="black">

```sql
SELECT URL, count(URL) AS Count
FROM hits_URL_UserID
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

The response is:

```response
┌─URL────────────────────────────┬─Count─┐
│ http://auto.ru/chatay-barana.. │   170 │
│ http://auto.ru/chatay-id=371...│    52 │
│ http://public_search           │    45 │
│ http://kovrik-medvedevushku-...│    36 │
│ http://forumal                 │    33 │
│ http://korablitz.ru/L_1OFFER...│    14 │
│ http://auto.ru/chatay-id=371...│    14 │
│ http://auto.ru/chatay-john-D...│    13 │
│ http://auto.ru/chatay-john-D...│    10 │
│ http://wot/html?page/23600_m...│     9 │
└────────────────────────────────┴───────┘

10 rows in set. Elapsed: 0.024 sec.
// highlight-next-line
Processed 8.02 million rows,
73.04 MB (340.26 million rows/s., 3.10 GB/s.)
```

Server Log:
```response
...Executor): Key condition: (column 1 in [749927693, 749927693])
// highlight-next-line
...Executor): Used generic exclusion search over index for part all_1_9_2
              with 1453 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
// highlight-next-line
              980/1083 marks by primary key, 980 marks to read from 23 ranges
...Executor): Reading approx. 8028160 rows with 10 streams
```
</font></p>
</details>




We now have two tables. Optimized for speeding up queries filtering on UserIDs, and speeding up queries filtering on URLs, respectively:
<img src={require('./images/sparse-primary-indexes-12a.png').default} class="image"/>









## Option 2: Materialized Views

Create a [materialized view](/docs/en/sql-reference/statements/create/view.md) on our existing table.
```sql
CREATE MATERIALIZED VIEW mv_hits_URL_UserID
ENGINE = MergeTree()
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
POPULATE
AS SELECT * FROM hits_UserID_URL;
```

The response looks like:

```response
Ok.

0 rows in set. Elapsed: 2.935 sec. Processed 8.87 million rows, 838.84 MB (3.02 million rows/s., 285.84 MB/s.)
```

:::note
- we switch the order of the key columns (compared to our [original table](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#a-table-with-a-primary-key) ) in the view's primary key
- the materialized view is backed by a **implicitly created table** whose row order and primary index is based on the given primary key definition
- the implicitly created table is listed by the <font face = "monospace">SHOW TABLES</font> query and has a name starting with <font face = "monospace">.inner</font>
- it is also possible to first explicitly create the backing table for a materialized view and then the view can target that table via the <font face = "monospace">TO [db].[table]</font> [clause](/docs/en/sql-reference/statements/create/view.md)
- we use the <font face = "monospace">POPULATE</font> keyword in order to immediately populate the implicitly created table with all 8.87 million rows from the source table [hits_UserID_URL](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#a-table-with-a-primary-key)
- if new rows are inserted into the source table hits_UserID_URL, then that rows are automatically also inserted into the implicitly created table
- Effectively the implicitly created table has the same row order and primary index as the [secondary table that we created explicitly](#multiple-primary-indexes-via-secondary-tables):




<img src={require('./images/sparse-primary-indexes-12b-1.png').default} class="image"/>


ClickHouse is storing the [column data files](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), the [mark files](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#mark-files-are-used-for-locating-granules) (*.mrk2) and the [primary index](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#the-primary-index-has-one-entry-per-granule) (primary.idx) of the implicitly created table in a special folder withing the ClickHouse server's data directory:


<img src={require('./images/sparse-primary-indexes-12b-2.png').default} class="image"/>

:::


The implicitly created table (and it's primary index) backing the materialized view can now be used to significantly speed up the execution of our example query filtering on the URL column:
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
FROM mv_hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

The response is:

```response
┌─────UserID─┬─Count─┐
│ 2459550954 │  3741 │
│ 1084649151 │  2484 │
│  723361875 │   729 │
│ 3087145896 │   695 │
│ 2754931092 │   672 │
│ 1509037307 │   582 │
│ 3085460200 │   573 │
│ 2454360090 │   556 │
│ 3884990840 │   539 │
│  765730816 │   536 │
└────────────┴───────┘

10 rows in set. Elapsed: 0.026 sec.
// highlight-next-line
Processed 335.87 thousand rows,
13.54 MB (12.91 million rows/s., 520.38 MB/s.)
```

Because effectively the implicitly created table (and it's primary index) backing the materialized view is identical to the [secondary table that we created explicitly](#multiple-primary-indexes-via-secondary-tables), the query is executed in the same effective way as with the explicitly created table.

The corresponding trace log in the ClickHouse server log file confirms that ClickHouse is running binary search over the index marks:

```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
// highlight-next-line
...Executor): Running binary search on index range ...
...
...Executor): Selected 4/4 parts by partition key, 4 parts by primary key,
// highlight-next-line
              41/1083 marks by primary key, 41 marks to read from 4 ranges
...Executor): Reading approx. 335872 rows with 4 streams
```



## Option 3: Projections

Create a projection on our existing table:
```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

And materialize the projection:
```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note
- the projection is creating a **hidden table** whose row order and primary index is based on the given <font face = "monospace">ORDER BY</font> clause of the projection
- the hidden table is not listed by the <font face = "monospace">SHOW TABLES</font> query
- we use the <font face = "monospace">MATERIALIZE</font> keyword in order to immediately populate the hidden table with all 8.87 million rows from the source table [hits_UserID_URL](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#a-table-with-a-primary-key)
- if new rows are inserted into the source table hits_UserID_URL, then that rows are automatically also inserted into the hidden table
- a query is always (syntactically) targeting the source table hits_UserID_URL, but if the row order and primary index of the hidden table allows a more effective query execution, then that hidden table will be used instead
- Effectively the implicitly created hidden table has the same row order and primary index as the [secondary table that we created explicitly](#multiple-primary-indexes-via-secondary-tables):

<img src={require('./images/sparse-primary-indexes-12c-1.png').default} class="image"/>

ClickHouse is storing the [column data files](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), the [mark files](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#mark-files-are-used-for-locating-granules) (*.mrk2) and the [primary index](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#the-primary-index-has-one-entry-per-granule) (primary.idx) of the hidden table in a special folder (marked in orange in the screenshot below) next to the source table's data files, mark files, and primary index files:

<img src={require('./images/sparse-primary-indexes-12c-2.png').default} class="image"/>
:::


The hidden table (and it's primary index) created by the projection can now be (implicitly) used to significantly speed up the execution of our example query filtering on the URL column. Note that the query is syntactically targeting the source table of the projection.
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

The response is:

```response
┌─────UserID─┬─Count─┐
│ 2459550954 │  3741 │
│ 1084649151 │  2484 │
│  723361875 │   729 │
│ 3087145896 │   695 │
│ 2754931092 │   672 │
│ 1509037307 │   582 │
│ 3085460200 │   573 │
│ 2454360090 │   556 │
│ 3884990840 │   539 │
│  765730816 │   536 │
└────────────┴───────┘

10 rows in set. Elapsed: 0.029 sec.
// highlight-next-line
Processed 319.49 thousand rows, 1
1.38 MB (11.05 million rows/s., 393.58 MB/s.)
```

Because effectively the hidden table (and it's primary index) created by the projection is identical to the [secondary table that we created explicitly](#multiple-primary-indexes-via-secondary-tables), the query is executed in the same effective way as with the explicitly created table.

The corresponding trace log in the ClickHouse server log file confirms that ClickHouse is running binary search over the index marks:


```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
// highlight-next-line
...Executor): Running binary search on index range for part prj_url_userid (1083 marks)
...Executor): ...
// highlight-next-line
...Executor): Choose complete Normal projection prj_url_userid
...Executor): projection required columns: URL, UserID
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
// highlight-next-line
              39/1083 marks by primary key, 39 marks to read from 1 ranges
...Executor): Reading approx. 319488 rows with 2 streams
```


## Summary


The primary index of our [table with compound primary key (UserID, URL)](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#a-table-with-a-primary-key) was very useful for speeding up a [query filtering on UserID](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#the-primary-index-is-used-for-selecting-granules). But that index is not providing significant help with speeding up a [query filtering on URL](#query-on-url), despite the URL column being part of the compound primary key.

And vice versa:
The primary index of our [table with compound primary key (URL, UserID)](#secondary-table) was speeding up a [query filtering on URL](#query-on-url), but didn't provide much support for a [query filtering on UserID](/docs/en/guides/improving-query-performance/sparse-primary-indexes/sparse-primary-indexes-design.md/#the-primary-index-is-used-for-selecting-granules).

Because of the similarly high cardinality of the primary key columns UserID and URL, a query that filters on the second key column [doesn’t benefit much from the second key column being in the index](#generic-exclusion-search-slow).

Therefore it makes sense to remove the second key column from the primary index (resulting in less memory consumption of the index) and to [use multiple primary indexes](#multiple-primary-indexes) instead.


However if the key columns in a compound primary key have big differences in cardinality, then it is [beneficial for queries](#generic-exclusion-search-fast) to order the primary key columns by cardinality in ascending order.

The higher the cardinality difference between the key columns is, the more the order of those columns in the key matters. We will demonstrate that in the next section.

