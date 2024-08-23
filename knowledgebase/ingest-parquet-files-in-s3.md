---
date: 2023-03-22
---

# How to ingest Parquet files from an S3 bucket

Below are some basics of using the S3 table engine to read parquet files.

- create access and secret keys for an IAM service user.
normal login users usually don't work since they may have been configured with an MFA policy.

- set the permissions on the policy to allow the service user to access the bucket and folders.

The following is a very simple example that you can use to test the mechanics of accessing your parquet files successfully prior to applying to your actual data.

If you need an example of creating a user and bucket, you can follow the first two sections (create user and create bucket):
https://clickhouse.com/docs/en/guides/sre/configuring-s3-for-clickhouse-use/

I used this sample file: https://github.com/Teradata/kylo/tree/master/samples/sample-data/parquet
and uploaded it to my test bucket

You can set the policy something like this on the bucket:
(adjust as needed, this one is fairly open for privileges but will help in testing. you can narrow your permissions as necessary)
```
{
    "Version": "2012-10-17",
    "Id": "Policy123456",
    "Statement": [
        {
            "Sid": "abc123",
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "arn:aws:iam::1234567890:user/mars-s3-user"
                ]
            },
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::mars-doc-test",
                "arn:aws:s3:::mars-doc-test/*"
            ]
        }
    ]
}
```

You can run queries with this type of syntax using the S3 table engine:
https://clickhouse.com/docs/en/sql-reference/table-functions/s3/

```
clickhouse-cloud :)  select count(*) from s3('https://mars-doc-test.s3.amazonaws.com/s3-parquet-test/userdata1.parquet','ABC123', 'abc+123', 'Parquet', 'first_name String');

SELECT count(*)
FROM s3('https://mars-doc-test.s3.amazonaws.com/s3-parquet-test/userdata1.parquet', 'ABC123', 'abc+123', 'Parquet', 'first_name String')

Query id: fd4f1193-d604-4ac0-9a46-bdd2d5e14727

┌─count()─┐
│    1000 │
└─────────┘

1 row in set. Elapsed: 1.274 sec. Processed 1.00 thousand rows, 14.64 KB (784.81 rows/s., 11.49 KB/s.)
```

The data types reference for parquet format are here:
https://clickhouse.com/docs/en/interfaces/formats/#data-format-parquet

To bring in the data into a native ClickHouse table:

create the table, something like this (just chose a couple of the columns in the parquet file):
```
clickhouse-cloud :) CREATE TABLE my_parquet_table (id UInt64, first_name String) ENGINE = MergeTree ORDER BY id;

CREATE TABLE my_parquet_table
(
    `id` UInt64,
    `first_name` String
)
ENGINE = MergeTree
ORDER BY id

Query id: 412e3994-bf8e-444e-ac43-a7c82642b7da

Ok.

0 rows in set. Elapsed: 0.600 sec.
```

Select the data from the S3 bucket to insert into the new table:

```
clickhouse-cloud :) INSERT INTO my_parquet_table (id, first_name) SELECT id, first_name FROM s3('https://mars-doc-test.s3.amazonaws.com/s3-parquet-test/userdata1.parquet', 'ABC123','abc+123', 'Parquet', 'id UInt64, first_name String') FORMAT Parquet

INSERT INTO my_parquet_table (id, first_name) SELECT
    id,
    first_name
FROM s3('https://mars-doc-test.s3.amazonaws.com/s3-parquet-test/userdata1.parquet', 'ABC123', 'abc+123', 'Parquet', 'id UInt64, first_name String')

Query id: c3cdc871-f338-462d-8797-6751b45a0b58

Ok.

0 rows in set. Elapsed: 1.220 sec. Processed 1.00 thousand rows, 22.64 KB (819.61 rows/s., 18.56 KB/s.)
```

Verify the import:

```
clickhouse-cloud :) SELECT * FROM my_parquet_table LIMIT 10;

SELECT *
FROM my_parquet_table
LIMIT 10

Query id: 1ccf59dd-d804-46a9-aadd-ed5c57b9e1a0

┌─id─┬─first_name─┐
│  1 │ Amanda     │
│  2 │ Albert     │
│  3 │ Evelyn     │
│  4 │ Denise     │
│  5 │ Carlos     │
│  6 │ Kathryn    │
│  7 │ Samuel     │
│  8 │ Harry      │
│  9 │ Jose       │
│ 10 │ Emily      │
└────┴────────────┘
```

When you are ready to import your real data, you can use some special syntax like wildcards and ranges to specify your folders, subfolders and files in your bucket.
I'd recommend to filter a few directories and files to test the import, maybe a certain year, a couple months and some date range to test first.

besides the path options here, newly released is syntax `**` which specifies all subdirectories recursively.
https://clickhouse.com/docs/en/sql-reference/table-functions/s3/

For example, assuming the paths and bucket structure is something like this:
`https://your_s3_bucket.s3.amazonaws.com/<your_folder>/<year>/<month>/<day>/<filename>.parquet`
`https://mars-doc-test.s3.amazonaws.com/system_logs/2022/11/01/my-app-logs-0001.parquet`

This would get all files for 1st day of every month in 2021-2022
`https://mars-doc-test.s3.amazonaws.com/system_logs/{2021-2022}/**/01/*.parquet`
