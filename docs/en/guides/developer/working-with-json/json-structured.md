---
slug: /en/guides/developer/working-with-json/json-structured
sidebar_label: Relying on Structure 
sidebar_position: 2
description: Using a structured approach
---

# Structured Approach

First, we confirm we can read the JSON dataset and highlight the challenges of handling semi-structured data using more traditional types used in other databases. We don’t rely on Schema inference to map the JSON fields to columns in the example below - instead, we specify a format of JSONEachRow and map the fields explicitly to columns in the s3 functions. 

```sql
SELECT type, `actor.display_login`, `repo.name`, created_at
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022-flat.ndjson.gz',
        'JSONEachRow',
        'type String, `actor.avatar_url` String, `actor.display_login` String, ' ||
        '`actor.id` Float64, `actor.login` String, `actor.url` String, `repo.id` Float64, ' ||
        '`repo.name` String, `repo.url` String, created_at String, `payload.pull_request.updated_at` String, ' ||
        '`payload.action` String, `payload.ref` String, `payload.ref_type` String, ' ||
        '`payload.pull_request.user.login` String, `payload.pull_request.number` Float64, ' ||
        '`payload.pull_request.title` String, `payload.pull_request.state` String, ' ||
        '`payload.pull_request.author_association` String, `payload.pull_request.head.ref` String, ' ||
        '`payload.pull_request.head.sha` String, `payload.pull_request.base.ref` String, ' ||
        '`payload.pull_request.base.sha` String, `payload.size` Float64, `payload.distinct_size` Float64')
LIMIT 10;
```

| type | actor.display\_login | repo.name | created\_at |
| :--- | :--- | :--- | :--- |
| PushEvent | Lakshmipatil2021 | revacprogramming/pps-test1-Lakshmipatil2021 | 2022-01-04T07:00:00Z |
| MemberEvent | KStevenT | KStevenT/HTML\_ExternalWorkshop | 2022-01-04T07:00:00Z |
| PushEvent | Soumojit28 | Soumojit28/Oxytocin | 2022-01-04T07:00:00Z |
| PushEvent | github-actions | diogoaraujo017/diogoaraujo017 | 2022-01-04T07:00:00Z |
| PushEvent | Aman-Sonwani | Aman-Sonwani/crwn-clothing | 2022-01-04T07:00:00Z |
| PushEvent | huangshanyoumumingwutong | huangshanyoumumingwutong/picgo | 2022-01-04T07:00:00Z |
| PullRequestEvent | rfprod | rfprod/nx-ng-starter | 2022-01-04T07:00:00Z |
| PushEvent | Helikopter-Bojowy | Helikopter-Bojowy/Exp-na-helikopterze | 2022-01-04T07:00:00Z |
| IssueCommentEvent | PRMerger-test-1 | MicrosoftDocs/CSIDev-Public | 2022-01-04T07:00:00Z |
| PushEvent | github-actions | pioug/yield-data | 2022-01-04T07:00:00Z |


Note this dataset is a subset of the example used later, with no nested objects within the JSON itself - the fields have been flattened using a period separator. Although nested objects can be handled through an explicit mapping, it requires either the use of the new JSON object field or (for older ClickHouse versions) Tuples, Map and Nested structures (see [Other Approaches](./json-other-approaches)) further complicate usage. 

This approach requires mapping all fields and has obvious limitations when the JSON is potentially dynamic or unknown. We could use an INSERT INTO SELECT statement to persist the results into a local Merge Tree table. Defining such a table would require the user to know all fields and express the verbose definition below. 

```sql
CREATE table github_flat
(
   type                                      String,
   `actor.avatar_url`                        String,
   `actor.display_login`                     String,
   `actor.id`                                Float64,
   `actor.login`                             String,
   `actor.url`                               String,
   `repo.id`                                 Float64,
   `repo.name`                               String,
   `repo.url`                                String,
   created_at                                String,
   `payload.pull_request.updated_at`         String,
   `payload.action`                          String,
   `payload.ref`                             String,
   `payload.ref_type`                        String,
   `payload.pull_request.user.login`         String,
   `payload.pull_request.number`             Float64,
   `payload.pull_request.title`              String,
   `payload.pull_request.state`              String,
   `payload.pull_request.author_association` String,
   `payload.pull_request.head.ref`           String,
   `payload.pull_request.head.sha`           String,
   `payload.pull_request.base.ref`           String,
   `payload.pull_request.base.sha`           String,
   `payload.size`                            Float64,
   `payload.distinct_size`                   Float64
) ENGINE = MergeTree ORDER BY (type, `repo.name`, created_at);

INSERT INTO github_flat SELECT * FROM s3 ('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022-flat.ndjson.gz', 'JSONEachRow');

SELECT count() from github_flat;
```

| count\(\) |
| :--- |
| 1000000 |

Furthermore, if new properties are added to the JSON, the table would need to be updated, i.e., via ALTER TABLE. Naturally, this leads us to use ClickHouse’s semi-structured features.
