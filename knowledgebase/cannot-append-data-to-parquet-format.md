---
date: 2023-03-25
---

# DB::Exception: Cannot append data in format Parquet to file, because this format doesn't support appends. (CANNOT_APPEND_TO_FILE)

Suppose you create a table that uses the `File` table engine with the Parquet format:

```sql
CREATE TABLE parquet_test
(
    `x` UInt32,
    `y` String
)
ENGINE = File(Parquet)
```

You can write to the table once:

```sql
INSERT INTO parquet_test VALUES
   (1, 'Hello'),
   (2, 'Hi')
```

This creates a file named `data.Parquet` in the `data/default/parquet_test` folder. If you try to insert another batch:

```sql
INSERT INTO parquet_test VALUES
   (3, 'World'),
   (4, 'Bye')
```

...you get the following error:

```response
Code: 641. DB::Exception: Received from localhost:9000. DB::Exception: Cannot append data in format Parquet to file, because this format doesn't support appends. You can allow to create a new file on each insert by enabling setting engine_file_allow_create_multiple_files. (CANNOT_APPEND_TO_FILE)
```

You can not append to Parquet files in ClickHouse. But you can tell ClickHouse to create a new file for every `INSERT` by enabling the [`engine_file_allow_create_multiple_files` setting](https://clickhouse.com/docs/en/operations/settings/settings#engine_file_allow_create_multiple_files). If enabled, on each insert a new file will be created with a name following this pattern:

    `data.Parquet` -> `data.1.Parquet` -> `data.2.Parquet`, etc.:

Let's give it a try. We will put our two commands into a single file named `parquet.sql`:

```sql
SET engine_file_allow_create_multiple_files = 1;

INSERT INTO default.parquet_test VALUES  (3, 'World'), (4, 'Bye');
```

Run it using `clickhouse-client`:

```bash
./clickhouse client --queries-file parquet.sql
```

And now you will see two files in `data/default/parquet_test` (and a new file for each subsequent insert).

:::note
The `engine_file_allow_create_multiple_files` setting applies to other data formats that are not appendable, like JSON and ORC.
:::
