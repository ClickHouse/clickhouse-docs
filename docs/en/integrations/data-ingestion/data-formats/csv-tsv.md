---
sidebar_label: CSV and TSV
slug: /en/integrations/data-formats/csv-tsv
---

# Working with CSV and TSV data in ClickHouse

ClickHouse supports importing data from and exporting to CSV. Since CSV files can come with different format specifics, including header rows, custom delimiters, and escape symbols, ClickHouse provides formats and settings to address each case efficiently.


## Importing data from a CSV file

Before importing data, let’s create a table with a relevant structure:

```sql
CREATE TABLE sometable
(
    `path` String,
    `month` Date,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY tuple(month, path)
```


To import data from the [CSV file](assets/data_small.csv) to the `sometable` table, we can pipe our file directly to the clickhouse-client:


```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSV" < data_small.csv
```

Note that we use [FORMAT CSV](/docs/en/interfaces/formats.md/#csv) to let ClickHouse know we’re ingesting CSV formatted data. Alternatively, we can load data from a local file using the [FROM INFILE](/docs/en/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) clause:


```sql
INSERT INTO sometable
FROM INFILE 'data_small.csv'
FORMAT CSV
```

Here, we use the `FORMAT CSV` clause so ClickHouse understands the file format. We can also load data directly from URLs using [url()](/docs/en/sql-reference/table-functions/url.md/) function or from S3 files using [s3()](/docs/en/sql-reference/table-functions/s3.md/) function.

:::tip
We can skip explicit format setting for `file()` and `INFILE`/`OUTFILE`.
In that case, ClickHouse will automatically detect format based on file extension.
:::

### CSV files with headers

Suppose our [CSV file has headers](assets/data_small_headers.csv) in it:

```bash
head data-small-headers.csv
```
```response
"path","month","hits"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
```

To import data from this file, we can use [CSVWithNames](/docs/en/interfaces/formats.md/#csvwithnames) format:

```bash
clickhouse-client -q "INSERT INTO sometable FORMAT CSVWithNames" < data_small_headers.csv
```

In this case, ClickHouse skips the first row while importing data from the file.

:::tip
Starting from 23.1 [version](https://github.com/ClickHouse/ClickHouse/releases) ClickHouse will automatically detect headers in CSV files when `CSV` type is used, so no need to use `CSVWithNames` or `CSVWithNamesAndTypes`.
:::


### CSV files with custom delimiters

In case the CSV file uses other than comma delimiter, we can use the [format_csv_delimiter](/docs/en/operations/settings/settings-formats.md/#format_csv_delimiter) option to set the relevant symbol:


```sql
SET format_csv_delimiter = ';'
```

Now, when we import from a CSV file, `;` symbol is going to be used as a delimiter instead of a comma.


### Skipping lines in a CSV file

Sometimes, we might skip a certain number of lines while importing data from a CSV file. This can be done using [input_format_csv_skip_first_lines](/docs/en/operations/settings/settings-formats.md/#input_format_csv_skip_first_lines) option:


```sql
SET input_format_csv_skip_first_lines = 10
```

In this case, we’re going to skip the first ten lines from the CSV file:

```sql
SELECT count(*) FROM file('data-small.csv', CSV)
```
```response
┌─count()─┐
│     990 │
└─────────┘
```

The [file](assets/data_small.csv) has 1k rows, but ClickHouse loaded only 990 since we’ve asked to skip the first 10.

:::tip
When using the `file()` function, with ClickHouse Cloud you will need to run the commands in `clickhouse client` on the machine where the file resides. Another option is to use [`clickhouse-local`](/docs/en/operations/utilities/clickhouse-local.md) to explore files locally.
:::


### Treating NULL values in CSV files

Null values can be encoded differently depending on the application that generated the file. By default, ClickHouse uses `\N` as a Null value in CSV. But we can change that using the [format_csv_null_representation](/docs/en/operations/settings/settings-formats.md/#format_tsv_null_representation) option.

Suppose we have the following CSV file:

```bash
> cat nulls.csv
Donald,90
Joe,Nothing
Nothing,70
```

If we load data from this file, ClickHouse will treat `Nothing` as a String (which is correct):

```sql
SELECT * FROM file('nulls.csv')
```
```response
┌─c1──────┬─c2──────┐
│ Donald  │ 90      │
│ Joe     │ Nothing │
│ Nothing │ 70      │
└─────────┴─────────┘
```

If we want ClickHouse to treat `Nothing` as `NULL`, we can define that using the following option:

```sql
SET format_csv_null_representation = 'Nothing'
```

Now we have `NULL` where we expect it to be:

```sql
SELECT * FROM file('nulls.csv')
```
```response
┌─c1─────┬─c2───┐
│ Donald │ 90   │
│ Joe    │ ᴺᵁᴸᴸ │
│ ᴺᵁᴸᴸ   │ 70   │
└────────┴──────┘
```


## TSV (Tab-separated) files

Tab-separated data format is widely used as a data interchange format. To load data from a [TSV file](assets/data_small.tsv) to ClickHouse, the [TabSeparated](/docs/en/interfaces/formats.md/#tabseparated) format is used:


```bash
clickhouse-client -q "INSERT INTO sometable FORMAT TabSeparated" < data_small.tsv
```


There’s also a [TabSeparatedWithNames](/docs/en/interfaces/formats.md/#tabseparatedwithnames) format to allow working with TSV files that have headers. And, like for CSV, we can skip the first X lines using the [input_format_tsv_skip_first_lines](/docs/en/operations/settings/settings-formats.md/#input_format_tsv_skip_first_lines) option.


### Raw TSV

Sometimes, TSV files are saved without escaping tabs and line breaks. We should use [TabSeparatedRaw](/docs/en/interfaces/formats.md/#tabseparatedraw) to handle such files.


## Exporting to CSV

Any format in our previous examples can also be used to export data. To export data from a table (or a query) to a CSV format, we use the same `FORMAT` clause:


```sql
SELECT *
FROM sometable
LIMIT 5
FORMAT CSV
```
```response
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
"1971-72_Utah_Stars_season","2016-10-01",1
"2015_UEFA_European_Under-21_Championship_qualification_Group_8","2015-12-01",73
"2016_Greater_Western_Sydney_Giants_season","2017-05-01",86
```

To add a header to the CSV file, we use the [CSVWithNames](/docs/en/interfaces/formats.md/#csvwithnames) format:

```sql
SELECT *
FROM sometable
LIMIT 5
FORMAT CSVWithNames
```
```response
"path","month","hits"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
"1971-72_Utah_Stars_season","2016-10-01",1
"2015_UEFA_European_Under-21_Championship_qualification_Group_8","2015-12-01",73
"2016_Greater_Western_Sydney_Giants_season","2017-05-01",86
```


### Saving exported data to a CSV file

To save exported data to a file, we can use the [INTO…OUTFILE](/docs/en/sql-reference/statements/select/into-outfile.md) clause:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.csv'
FORMAT CSVWithNames
```
```response
36838935 rows in set. Elapsed: 1.304 sec. Processed 36.84 million rows, 1.42 GB (28.24 million rows/s., 1.09 GB/s.)
```

Note how it took ClickHouse **~1** second to save 36m rows to a CSV file.


### Exporting CSV with custom delimiters

If we want to have other than comma delimiters, we can use the [format_csv_delimiter](/docs/en/operations/settings/settings-formats.md/#format_csv_delimiter) settings option for that:

```sql
SET format_csv_delimiter = '|'
```

Now ClickHouse will use `|` as a delimiter for CSV format:

```sql
SELECT *
FROM sometable
LIMIT 5
FORMAT CSV
```
```response
"Akiba_Hebrew_Academy"|"2017-08-01"|241
"Aegithina_tiphia"|"2018-02-01"|34
"1971-72_Utah_Stars_season"|"2016-10-01"|1
"2015_UEFA_European_Under-21_Championship_qualification_Group_8"|"2015-12-01"|73
"2016_Greater_Western_Sydney_Giants_season"|"2017-05-01"|86
```


### Exporting CSV for Windows

If we want a CSV file to work fine in a Windows environment, we should consider enabling [output_format_csv_crlf_end_of_line](/docs/en/operations/settings/settings-formats.md/#output_format_csv_crlf_end_of_line) option. This will use `\r\n` as a line breaks instead of `\n`:

```sql
SET output_format_csv_crlf_end_of_line = 1;
```

## Schema inference for CSV files

We might work with unknown CSV files in many cases, so we have to explore which types to use for columns. Clickhouse, by default, will try to guess data formats based on its analysis of a given CSV file.  This is known as "Schema Inference". Detected data types can be explored using the `DESCRIBE` statement in pair with the [file()](/docs/en/sql-reference/table-functions/file.md) function:


```sql
DESCRIBE file('data-small.csv', CSV)
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(Date)   │              │                    │         │                  │                │
│ c3   │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```


Here, ClickHouse could guess column types for our CSV file efficiently. If we don’t want ClickHouse to guess, we can disable this with the following option:


```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
```

All column types will be treated as a `String` in this case.

### Exporting and importing CSV with explicit column types {#exporting-and-importing-csv-with-explicit-column-types}

ClickHouse also allows explicitly setting column types when exporting data using [CSVWithNamesAndTypes](/docs/en/interfaces/formats.md/#csvwithnamesandtypes) (and other *WithNames formats family):

```sql
SELECT *
FROM sometable
LIMIT 5
FORMAT CSVWithNamesAndTypes
```
```response
"path","month","hits"
"String","Date","UInt32"
"Akiba_Hebrew_Academy","2017-08-01",241
"Aegithina_tiphia","2018-02-01",34
"1971-72_Utah_Stars_season","2016-10-01",1
"2015_UEFA_European_Under-21_Championship_qualification_Group_8","2015-12-01",73
"2016_Greater_Western_Sydney_Giants_season","2017-05-01",86
```


This format will include two header rows - one with column names and the other with column types. This will allow ClickHouse (and other apps) to identify column types when loading data from [such files](assets/data_csv_types.csv):


```sql
DESCRIBE file('data_csv_types.csv', CSVWithNamesAndTypes)
```
```response
┌─name──┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path  │ String │              │                    │         │                  │                │
│ month │ Date   │              │                    │         │                  │                │
│ hits  │ UInt32 │              │                    │         │                  │                │
└───────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Now ClickHouse identifies column types based on a (second) header row instead of guessing.

## Custom delimiters, separators, and escaping rules

In sophisticated cases, text data can be formatted in a highly custom manner but still have a structure. ClickHouse has a special [CustomSeparated](/docs/en/interfaces/formats.md/#format-customseparated) format for such cases, which allows setting custom escaping rules, delimiters, line separators, and starting/ending symbols.

Suppose we have the following data in the file:

```
row('Akiba_Hebrew_Academy';'2017-08-01';241),row('Aegithina_tiphia';'2018-02-01';34),...
```

We can see that individual rows are wrapped in `row()`, lines are separated with `,` and individual values are delimited with `;`. In this case, we can use the following settings to read data from this file:

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

Now we can load data from our custom formatted [file](assets/data_small_custom.txt):

```sql
SELECT *
FROM file('data_small_custom.txt', CustomSeparated)
LIMIT 3
```
```response
┌─c1────────────────────────┬─────────c2─┬──c3─┐
│ Akiba_Hebrew_Academy      │ 2017-08-01 │ 241 │
│ Aegithina_tiphia          │ 2018-02-01 │  34 │
│ 1971-72_Utah_Stars_season │ 2016-10-01 │   1 │
└───────────────────────────┴────────────┴─────┘
```

We can also use [CustomSeparatedWithNames](/docs/en/interfaces/formats.md/#customseparatedwithnames) to get headers exported and imported correctly. Explore [regex and template](templates-regex.md) formats to deal with even more complex cases.


## Working with large CSV files

CSV files can be large, and ClickHouse works efficiently with files of any size. Large files usually come compressed, and ClickHouse covers this with no need for decompression before processing. We can use a `COMPRESSION` clause during an insert:


```sql
INSERT INTO sometable
FROM INFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

If a `COMPRESSION` clause is omitted, ClickHouse will still try to guess file compression based on its extension. The same approach can be used to export files directly to compressed formats:

```sql
SELECT *
FROM for_csv
INTO OUTFILE 'data_csv.csv.gz'
COMPRESSION 'gzip' FORMAT CSV
```

This will create a compressed `data_csv.csv.gz` file.

## Other formats

ClickHouse introduces support for many formats, both text, and binary, to cover various scenarios and platforms. Explore more formats and ways to work with them in the following articles:

- **CSV and TSV formats**
- [Parquet](parquet.md)
- [JSON formats](json.md)
- [Regex and templates](templates-regex.md)
- [Native and binary formats](binary.md)
- [SQL formats](sql.md)

And also check [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) - a portable full-featured tool to work on local/remote files without the need for Clickhouse server.
