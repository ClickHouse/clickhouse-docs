---
slug: /en/guides/developer/working-with-json/json-semi-structured
sidebar_label: Semi-Structured Approach
sidebar_position: 3
description: Using a semi-structured approach
---

# Semi-Structured Approach

## Overview

To address the challenges of semi-structured data ClickHouse provides a JSON Object type. This feature is only available in versions later than 22.3.1. It represents the future preferred mechanism for handling arbitrary JSON. The alternative approaches described [later](json-other-approaches), which partially rely on imposing a strict schema, still have validity as extracting JSON fields into dedicated columns allows these to be optimized with codecs or utilized primary/sort keys. 

The JSON Object type is advantageous when dealing with complex nested structures, which are subject to change. The type automatically infers the columns from the structure during insertion and merges these into the existing table schema. By storing JSON keys and their values as columns and dynamic subcolumns, ClickHouse can exploit the same optimizations used for structured data and thus provide comparable performance. The user is also provided with an intuitive path syntax for column selection. Furthermore, a table can contain a JSON object column with a flexible schema and more strict conventional columns with predefined types.


It is important to note that the JSON type primarily syntactically enhances JSON handling at insertion and query time, i.e., it still exploits the native existing ClickHouse types for the columns, with JSON objects represented using the [Tuple type](https://clickhouse.com/docs/en/sql-reference/data-types/tuple/). As a result, previously, manual schema handling is handled automatically with querying significantly simpler.


## Relying on Schema Inference

Note that recent versions of ClickHouse (22.4.1+) will infer the schema for JSONEachRow. This inference will also work for JSON objects with nested structures. These will be inferred as JSON object fields. For example, executing a DESCRIBE shows the detected schema for the file, including the actor fields:

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz', 
'JSONEachRow') SETTINGS input_format_max_rows_to_read_for_schema_inference=100;
```

| name | type | 
| :--- | :--- | 
| type | Nullable\(String\) |
| actor | Object\('json'\) |
| repo | Object\('json'\) |
| created\_at | Nullable\(String\) |
| payload | Object\('json'\) |

Note the setting `input_format_max_rows_to_read_for_schema_inference`. This determines the number of rows used to infer a schema. In this case, the schema can be inferred within the default of 100 rows. If the first 100 rows contained columns with null values, this would need to be set higher. This schema inference simplifies SELECT statements. Try executing the following to see how the actor and repo columns are returned as JSON.

```sql
SELECT type, actor, repo FROM 
s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz', 
'JSONEachRow') LIMIT 2;
```

| type | actor | repo |
| :--- | :--- | :--- |
| PushEvent | {"avatar\_url":"https:\\/\\/avatars.githubusercontent.com\\/u\\/93110249?","display\_login":"Lakshmipatil2021","id":93110249,"login":"Lakshmipatil2021","url":"https:\\/\\/api.github.com\\/users\\/Lakshmipatil2021"} | {"id":429298592,"name":"revacprogramming\\/pps-test1-Lakshmipatil2021","url":"https:\\/\\/api.github.com\\/repos\\/revacprogramming\\/pps-test1-Lakshmipatil2021"} |
| MemberEvent | {"avatar\_url":"https:\\/\\/avatars.githubusercontent.com\\/u\\/95751520?","display\_login":"KStevenT","id":95751520,"login":"KStevenT","url":"https:\\/\\/api.github.com\\/users\\/KStevenT"} | {"id":443103546,"name":"KStevenT\\/HTML\_ExternalWorkshop","url":"https:\\/\\/api.github.com\\/repos\\/KStevenT\\/HTML\_ExternalWorkshop"} |

Schema inference and the introduction of the JSON Object Type allow us to handle nested data elegantly and avoid verbose definitions. However, we need to treat the entire row as a JSON object for dynamic properties on the root.  Version 22.4 of ClickHouse introduces the JSONAsObject format to assist with this.

## JSON Object Type

Using the same dataset as above, we explicitly declare that each row is a single object via the `JSONAsObject` format.  This single object is mapped to a field event of the type `Object(JSON)` - in this case, we use the shorthand `JSON.` Note if we don’t explicitly specify `event` as the field name in the s3 function, a field `json` will be used:


```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz', 
'JSONAsObject', 'event JSON') LIMIT 1;
```

| event |
| :--- |
| {"type":"PushEvent","actor.avatar\_url":"https:\\/\\/avatars.githubusercontent.com\\/u\\/93110249?","actor.display\_login":"Lakshmipatil2021","actor.id":93110249,"actor.login":"Lakshmipatil2021","actor.url":"https:\\/\\/api.github.com\\/users\\/Lakshmipatil2021","repo.id":429298592,"repo.name":"revacprogramming\\/pps-test1-Lakshmipatil2021","repo.url":"https:\\/\\/api.github.com\\/repos\\/revacprogramming\\/pps-test1-Lakshmipatil2021","created\_at":"2022-01-04T07:00:00Z","payload.pull\_request.updated\_at":"","payload.pull\_request.user.login":"","payload.pull\_request.number":0,"payload.pull\_request.title":"","payload.pull\_request.state":"","payload.pull\_request.author\_association":"","payload.pull\_request.head.ref":"","payload.pull\_request.head.sha":"","payload.pull\_request.base.ref":"","payload.pull\_request.base.sha":"","payload.action":"","payload.ref":"refs\\/heads\\/main","payload.ref\_type":"","payload.size":1,"payload.distinct\_size":1} |


To query this data effectively, we currently need to store it into a MergeTree. This is subject to change in later versions. We, therefore, create a table and insert the rows using an INSERT INTO SELECT. 

First, create the table before inserting the rows. This can take a few minutes depending on the hardware and network latency to the s3 source bucket:


**Note the use of allow_experimental_object_type as the JSON object type is still an experimental feature.**

```sql
DROP TABLE IF EXISTS github_json;

SET allow_experimental_object_type=1;

CREATE table github_json(event JSON) ENGINE = MergeTree ORDER BY tuple()

INSERT INTO github_json SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz', 
JSONAsObject, 'event JSON');
```

Confirm the table schema and row count as 1m.

```sql
SELECT count() FROM github_json;

DESCRIBE github_json;

Object('json')
```

While the above confirms each row is treated as a JSON object, it provides no information on how the fields in the JSON are mapped columns. To obtain this, we can utilize the setting `describe_extend_object_types`.


```sql
DESCRIBE github_json SETTINGS describe_extend_object_types=1;

Tuple(actor Tuple(avatar_url String, display_login String, id Int32, login String, url String), 
created_at String, payload Tuple(action String, distinct_size Int32, 
pull_request Tuple(author_association String, base Tuple(ref String, sha String), 
head Tuple(ref String, sha String), number Int32, state String, title String, 
updated_at String, user Tuple(login String)), ref String, ref_type String, size Int16), 
repo Tuple(id Int32, name String, url String), type String)
```

The most interesting component of this mapping is the handling of the nested JSON. Note how the JSON structure below is mapped to `repo Tuple(id Int32, name String, url String)`:

```json
  "repo": {
    "id": 429298592,
    "name": "revacprogramming/pps-test1-Lakshmipatil2021",
    "url": "https://api.github.com/repos/revacprogramming/pps-test1-Lakshmipatil2021"
  }
```

This structure could be mapped manually but would require the user to structure data appropriate for insertion and adapt queries to utilize - see [Other Approaches](./json-other-approaches), significantly complicating usage.

At this point, we are ready to exploit these dynamically created columns with queries.

## Selecting Dynamic Subcolumns

Querying the above table highlights some of the [historical challenges](./json-other-approaches) of using Tuples for nested JSON data.


```sql
SELECT event.type, event.repo, event.actor FROM github_json LIMIT 1;
```

| event.type | event.repo | event.actor |
| :--- | :--- | :--- |
| PushEvent | \(429298592,'revacprogramming/pps-test1-Lakshmipatil2021','https://api.github.com/repos/revacprogramming/pps-test1-Lakshmipatil2021'\) | \('https://avatars.githubusercontent.com/u/93110249?','Lakshmipatil2021','',93110249,'Lakshmipatil2021','https://api.github.com/users/Lakshmipatil2021'\) |

To return the original structure we need both JSONEachRow format and the parameter `output_format_json_named_tuples_as_objects`:

```sql
SELECT event.type, event.repo, event.actor FROM github_json LIMIT 1 
FORMAT JSONEachRow SETTINGS output_format_json_named_tuples_as_objects=1;
```

```json
{"event.type":"PushEvent","event.repo":{"id":429298592,
"name":"revacprogramming\/pps-test1-Lakshmipatil2021",
"url":"https:\/\/api.github.com\/repos\/revacprogramming\/pps-test1-Lakshmipatil2021"},
"event.actor":{"avatar_url":"https:\/\/avatars.githubusercontent.com\/u\/93110249?",
"display_login":"Lakshmipatil2021","gravatar_id":"","id":93110249,
"login":"Lakshmipatil2021","url":"https:\/\/api.github.com\/users\/Lakshmipatil2021"}}
```

While the above-simplified example illustrates the mechanics of using JSON Object types, users need to query these JSON-based columns using the same filters and aggregation capabilities as any other type. We can translate some of the examples provided here to JSON queries to illustrate equivalence. Note this is a 1m row sample of data only, so results are meaningless.

Counting the [top repositories by stars](https://ghe.clickhouse.tech/#top-repositories-by-stars) becomes a simple query. Note the use of a period as a path delimiter in nested objects:

```sql
SELECT event.repo.name, count() AS stars FROM github_json WHERE event.type = 'WatchEvent' 
GROUP BY event.repo.name ORDER BY stars DESC LIMIT 5;
```

| event.repo.name | stars |
| :--- | :--- |
| dwmkerr/hacker-laws | 283 |
| tkellogg/dura | 200 |
| aplus-framework/app | 157 |
| seemoo-lab/opendrop | 111 |
| heroku-python/flask-sockets | 92 |

More complex queries [showing the list of top repositories over time](https://ghe.clickhouse.tech/#how-has-the-list-of-top-repositories-changed-over-the-years) are also possible. We adapt the query as it covers a short period (3 days). Also, note the need to parse the `event.created_at field` with the function `parseDateTimeBestEffort` as this has been inferred as a string.

```sql
SELECT
   repo AS name,
   groupArrayInsertAt(toUInt32(c), toUInt64(dateDiff('hour', toDate('2022-01-01'), hour))) AS data
FROM
(
   SELECT
       lower(event.repo.name) AS repo,
       toStartOfHour(parseDateTimeBestEffort(event.created_at)) AS hour,
       count() AS c
   FROM github_json
   WHERE (event.type = 'WatchEvent') AND (toYear(parseDateTimeBestEffort(event.created_at)) >= 2022) AND (repo IN
   (
       SELECT lower(event.repo.name) AS repo
       FROM github_json
       WHERE (event.type = 'WatchEvent') AND (toYear(parseDateTimeBestEffort(event.created_at)) >= 2022)
       GROUP BY event.repo.name
       ORDER BY count() DESC
       LIMIT 10
   ))
   GROUP BY
       repo,
       hour
)
GROUP BY repo
ORDER BY repo ASC;
```

## Adding Primary Keys

The above example is not realistic in that it has no primary or sort key i.e., it uses `tuple()`. This negates the benefit of the index features in ClickHouse. To add a primary key, and still exploit the JSON object capabilities, we recommended using a dedicated subkey for the JSON. This requires inserting the data using the JSONEachRow format instead of JSONAsObject. For example, consider the JSON below and the corresponding table definition and insert statement.

```sql
SET allow_experimental_object_type=1;

DROP TABLE IF EXISTS github_json;

CREATE table github_json
(
   event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3,
   'ForkEvent' = 4, 'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 
   'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 
   'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19,
   'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
    repo_name LowCardinality(String),
    event      JSON
) ENGINE = MergeTree ORDER BY (event_type, repo_name);
```

Inserting data requires us to use the JSONEachRow format. Note how the `event` sub field now holds our dynamic JSON, whilst the root keys are explicitly defined.

```sql
INSERT INTO github_json FORMAT JSONEachRow
{"event":{"type":"PushEvent","actor":{"avatar_url":"https://avatars.githubusercontent.com/u/41898282?",
"display_login":"github-actions","gravatar_id":"","id":41898282,"login":"github-actions[bot]",
"url":"https://api.github.com/users/github-actions[bot]"},"repo":{"id":410071248,
"name":"pioug/yield-data","url":"https://api.github.com/repos/pioug/yield-data"}},
"event_type":"PushEvent","repo_name":"pioug/yield-data"}
```

This requires a restructuring of our JSON, which is inconvenient at best. Ideally, we need a more flexible approach that allows us to modify the fields we wish to extract as root keys over time without needing to change our data pipelines. Inserting our row as a `String` inside an EPHEMERAL column `message_raw`, we can extract specific fields of interest using DEFAULT expressions for the root fields. The `String` EPHEMERAL column is also mapped to a JSON object column `message` that provides the usual flexibility. This [EPHEMERAL](https://clickhouse.com/docs/en/sql-reference/statements/create/table/#ephemeral) column will not be persisted and will be discarded at INSERT time. Our primary key fields are as a result duplicated i.e. they occur at the root of the document, as well as in the `message` JSON.


```sql
DROP TABLE IF EXISTS github_json;

SET allow_experimental_object_type = 1;
CREATE table github_json
(
   event_type LowCardinality(String) DEFAULT JSONExtractString(message_raw, 'type'),
   repo_name LowCardinality(String) DEFAULT JSONExtractString(message_raw, 'repo.name'),
   message JSON DEFAULT message_raw,
   message_raw String EPHEMERAL
) ENGINE = MergeTree ORDER BY (event_type, repo_name);
```

Insertion thus requires a modified structure - note how the JSON is parsed as a string inside message_raw.


```sql
INSERT INTO github_json (message_raw) FORMAT JSONEachRow {"message_raw": "{\"type\":\"PushEvent\", 
\"created_at\": \"2022-01-04 07:00:00\", \"actor\":{\"avatar_url\":\"https://avatars.githubusercontent.com/u/41898282?\",
\"display_login\":\"github-actions\",\"gravatar_id\":\"\",\"id\":41898282,\"login\":\"github-actions[bot]\",
\"url\":\"https://api.github.com/users/github-actions[bot]\"},\"repo\":{\"id\":410071248,\"name\":\"pioug/yield-data\",
\"url\":\"https://api.github.com/repos/pioug/yield-data\"}}"}
```

To add fields to the root, we in turn just need to ALTER the table definition adding fields as required. For details on how to retrospectively add columns, see the technique used in [Other Approaches](./json-other-approaches#hybrid-approach-with-materialized-columns).


## Limitations and Best Practices

Dynamic columns in JSON objects are as fast predefined types. The flexible schema is an extremely powerful feature at every little syntax overhead and a natural fit for handling data such as logs - where keys are frequently added through dynamic properties such as container labels in Kubernetes.

Parsing of JSON, and inference of the schema does incur a cost at insertion time. Because of this, we recommend keeping column counts below 10k. Should you need to exceed this, consult[ ClickHouse support](https://github.com/ClickHouse/ClickHouse/issues/new?assignees=&labels=question&template=10_question.md&title=). 


There are also limitations as to how dynamic columns can be used. As noted earlier, they cannot be used as primary or sort keys. Furthermore, they cannot be configured to use specific codecs. For optimal performance, we recommend the JSON object type be used for a specific subkey of the JSON and the root keys be declared explicitly. This allows them to be configured with specific codecs or used for sort/primary keys. As shown in [Adding Primary Keys](#adding-primary-keys), this requires the use of the JSONEachRow format vs. inserting the entire row as JSON with the JSONAsObject format.

## Handling Data Changes

### Adding Columns

Handling semi-structured data requires ClickHouse to adapt new columns as they are added or their type changes. We explore some of these behaviors below.

Consider the simple example below:

```json
{
  "type": "PushEvent",
  "actor": {
    "id": 93110249
  },
  "repo": {
    "id": 429298592,
    "name": "revacprogramming/pps-test1-Lakshmipatil2021",
    "url": "https://api.github.com/repos/revacprogramming/pps-test1-Lakshmipatil2021"
  }
}
```

Creating a table to accept this data and performing the insert is trivial.

```sql
SET allow_experimental_object_type=1;
CREATE table github_tmp (event JSON) ENGINE = MergeTree ORDER BY tuple();

INSERT INTO github_tmp FORMAT JSONAsObject
{"type":"PushEvent","actor":{"id":93110249},"repo":{"id":429298592,
"name":"revacprogramming/pps-test1-Lakshmipatil2021",
"url":"https://api.github.com/repos/revacprogramming/pps-test1-Lakshmipatil2021"}}
```

Inspecting the types we can see the columns created:

```sql
SET describe_extend_object_types=1;
DESCRIBE github_tmp;

Tuple(actor Tuple(id Int32), repo Tuple(id Int32, name String, url String), type String)
```

Suppose now we insert the following object. This adds additional fields to the actor object:

```json
{
    "type": "PushEvent",
    "actor": {
      "avatar_url": "https://avatars.githubusercontent.com/u/81258380?",
      "display_login": "Helikopter-Bojowy",
      "gravatar_id": "",
      "id": 81258380,
      "login": "Helikopter-Bojowy",
      "url": "https://api.github.com/users/Helikopter-Bojowy"
    },
    "repo": {
      "id": 352069365,
      "name": "Helikopter-Bojowy/Exp-na-helikopterze",
      "url": "https://api.github.com/repos/Helikopter-Bojowy/Exp-na-helikopterze"
    }
}
```

```sql
INSERT INTO github_tmp FORMAT JSONAsObject
{"type":"PushEvent","actor":{"avatar_url":"https://avatars.githubusercontent.com/u/81258380?",
"display_login":"Helikopter-Bojowy","gravatar_id":"","id":81258380,"login":"Helikopter-Bojowy",
"url":"https://api.github.com/users/Helikopter-Bojowy"},"repo":{"id":352069365,
"name":"Helikopter-Bojowy/Exp-na-helikopterze",
"url":"https://api.github.com/repos/Helikopter-Bojowy/Exp-na-helikopterze"}}
```

If we inspect the schema, we can see the columns have automatically been inferred and added:

```sql
SET describe_extend_object_types=1;
DESCRIBE github_tmp;

Tuple(actor Tuple(avatar_url String, display_login String, gravatar_id String, 
id Int32, login String, url String), repo Tuple(id Int32, name String, url String), 
type String)
```

### Changing Columns

Despite best efforts, JSON is often inconsistent in types. Whilst some data stores, such as Kafka, can enforce a schema on JSON this is often not enforced. As a result, ClickHouse can receive the same field in multiple types. This often requires unifying types. Consider the following example:

```json
{
  "type": "PushEvent",
  "actor": {
    "id": 10
  }
}
```

Here `actor.id` is an integer. If inserted to a table, it will be mapped to an Int8 as shown below:

```sql
SET allow_experimental_object_type=1;
CREATE table github_types ( event JSON ) ENGINE = MergeTree ORDER BY tuple();

INSERT INTO github_types FORMAT JSONAsObject
{"type":"PushEvent","actor":{"id":10}}

SET describe_extend_object_types=1;
DESCRIBE github_types;

Tuple(actor Tuple(id Int8), type String)
```

Now Github has alot more users than can be represented by an Int8. A typical user id is much larger. Consider the more realistic example below:

```sql
INSERT INTO github_types FORMAT JSONAsObject
{"type":"PushEvent","actor":{"id":93110249}}
```

As shown the id field is now represented as an Int32.

```sql
SET describe_extend_object_types=1;
DESCRIBE github_types;

Tuple(actor Tuple(id Int32), type String)
```

Suppose that Github decides that ids can be alphanumeric, or more realistic a value is inserted as a string e.g.

```json
{
    "type": "PushEvent",
    "actor": {
      "id": "81258380"
    }
}
```

```sql
INSERT INTO github_types FORMAT JSONAsObject
{"type":"PushEvent","actor":{"id":"81258380"}}

SET describe_extend_object_types=1;
DESCRIBE github_types;

Tuple(actor Tuple(id String), type String)
```

As shown, ClickHouse is now forced to represent the `actor.id` column as a string.

This sort of coercion is supported for most types that have variable representation e.g. Int, Float. If necessary, ClickHouse will unify to the higher bit type that allows all current values to be represented. If necessary, converting to a `String` represents the least precise definition.


**Warning: This changing in types can break queries if you rely on type specific functions e.g. sum for numerics. We recommend you ensure your data is consistent where possible and rely on this feature as a backup vs best practice.**

Note that not all types can be unified. Attempting the following, after inserting any of the previous data will result in an error:

```sql
INSERT INTO github_types FORMAT JSONAsObject
{"type":"PushEvent","actor":{"id":["92258380"]}}
```

The inverse of this would also fail i.e. if for the first row id was an `Array(String)` and subsequent rows were only a `String`. Likewise objects (represented as Tuples) cannot be unified with scalar types such as `String`. The contents of these can, however, be coerced. For example, consider the following where actor.id is first an `Array(Int8)` and then an `Array(String)`. 


```sql
DROP TABLE github_types;
SET allow_experimental_object_type=1;
CREATE table github_types ( event JSON ) ENGINE = MergeTree ORDER BY tuple();

INSERT INTO github_types FORMAT JSONAsObject
{"type":"PushEvent","actor":{"id":[10]}}

SET describe_extend_object_types=1;
DESCRIBE github_types;

Tuple(actor Tuple(id Array(Int8)), type String)

INSERT INTO github_types FORMAT JSONAsObject
{"type":"PushEvent","actor":{"id":["92258380"]}}

SET describe_extend_object_types=1;
DESCRIBE github_types;

Tuple(actor Tuple(id Array(String)), type String)
```

## Handling JSON Formats

ClickHouse can handle JSON in a number of formats, other than JSONEachRow and JSONAsObject. These are useful on both input and output and are described [here](https://clickhouse.com/docs/en/interfaces/formats/#json).

## Related Content

- [Getting Data Into ClickHouse - Part 2 - A JSON detour](https://clickhouse.com/blog/getting-data-into-clickhouse-part-2-json)
