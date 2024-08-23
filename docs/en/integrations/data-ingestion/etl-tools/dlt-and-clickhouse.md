---
sidebar_label:  dlt
keywords: [clickhouse, dlt, connect, integrate, etl, data integration]
slug: /en/integrations/dlt 
description: Load data into Clickhouse using dlt integration
---

# Connect dlt to ClickHouse

<a href="https://dlthub.com/docs/intro" target="_blank">dlt</a>  is an open-source library that you can add to your Python scripts to load data from various and often messy data sources into well-structured, live datasets.



## Install dlt with ClickHouse

### To Install the `dlt` library with ClickHouse dependencies:
```bash
pip install "dlt[clickhouse]" 
```

## Setup Guide 

### 1. Initialize the dlt Project

Start by initializing a new `dlt` project as follows:
```bash
dlt init chess clickhouse
```


:::note
This command will initialize your pipeline with chess as the source and ClickHouse as the destination.
:::

The above command generates several files and directories, including `.dlt/secrets.toml` and a requirements file for ClickHouse. You can install the necessary dependencies specified in the requirements file by executing it as follows:
```bash
pip install -r requirements.txt
```

or with `pip install dlt[clickhouse]`, which installs the `dlt` library and the necessary dependencies for working with ClickHouse as a destination.

### 2. Setup ClickHouse Database

To load data into ClickHouse, you need to create a ClickHouse database. Here's a rough outline of what should you do:

1. You can use an existing ClickHouse database or create a new one.

2. To create a new database, connect to your ClickHouse server using the `clickhouse-client` command line tool or a SQL client of your choice.

3. Run the following SQL commands to create a new database, user and grant the necessary permissions:

```bash
CREATE DATABASE IF NOT EXISTS dlt;
CREATE USER dlt IDENTIFIED WITH sha256_password BY 'Dlt*12345789234567';
GRANT CREATE, ALTER, SELECT, DELETE, DROP, TRUNCATE, OPTIMIZE, SHOW, INSERT, dictGet ON dlt.* TO dlt;
GRANT SELECT ON INFORMATION_SCHEMA.COLUMNS TO dlt;
GRANT CREATE TEMPORARY TABLE, S3 ON *.* TO dlt;
```


### 3. Add Credentials

Next, set up the ClickHouse credentials in the `.dlt/secrets.toml` file as shown below:

```bash
[destination.clickhouse.credentials]
database = "dlt"                         # The database name you created
username = "dlt"                         # ClickHouse username, default is usually "default"
password = "Dlt*12345789234567"          # ClickHouse password if any
host = "localhost"                       # ClickHouse server host
port = 9000                              # ClickHouse HTTP port, default is 9000
http_port = 8443                         # HTTP Port to connect to ClickHouse server's HTTP interface. Defaults to 8443.
secure = 1                               # Set to 1 if using HTTPS, else 0.
dataset_table_separator = "___"          # Separator for dataset table names from dataset.
```


:::note
HTTP_PORT
The `http_port` parameter specifies the port number to use when connecting to the ClickHouse server's HTTP interface. This is different from default port 9000, which is used for the native TCP protocol.

You must set `http_port` if you are not using external staging (i.e. you don't set the staging parameter in your pipeline). This is because dlt's built-in ClickHouse local storage staging uses the <a href="https://github.com/ClickHouse/clickhouse-connect">clickhouse content</a> library, which communicates with ClickHouse over HTTP.

Make sure your ClickHouse server is configured to accept HTTP connections on the port specified by `http_port`. For example, if you set `http_port = 8443`, then ClickHouse should be listening for HTTP requests on port 8443. If you are using external staging, you can omit the `http_port` parameter, since clickhouse-connect will not be used in this case.
:::

You can pass a database connection string similar to the one used by the `clickhouse-driver` library. The credentials above will look like this:

```bash
# keep it at the top of your toml file, before any section starts.
destination.clickhouse.credentials="clickhouse://dlt:Dlt*12345789234567@localhost:9000/dlt?secure=1"
```


## Write Disposition

All [write dispositions](https://dlthub.com/docs/general-usage/incremental-loading#choosing-a-write-disposition)
 are supported.

Write dispositions in the dlt library define how the data should be written to the destination. There are three types of write dispositions:

**Replace**: This disposition replaces the data in the destination with the data from the resource. It deletes all the classes and objects and recreates the schema before loading the data. You can learn more about it <a href="https://dlthub.com/docs/general-usage/full-loading">here</a>. 

**Merge**: This write disposition merges the data from the resource with the data at the destination. For `merge` disposition, you would need to specify a `primary_key` for the resource. You can learn more about it <a href="https://dlthub.com/docs/general-usage/incremental-loading">here</a>.

**Append**: This is the default disposition. It will append the data to the existing data in the destination, ignoring the `primary_key` field.

## Data Loading
Data is loaded into ClickHouse using the most efficient method depending on the data source:

- For local files, the `clickhouse-connect` library is used to directly load files into ClickHouse tables using the `INSERT` command. 
- For files in remote storage like `S3`,` Google Cloud Storage`, or `Azure Blob Storage`, ClickHouse table functions like s3, gcs and azureBlobStorage are used to read the files and insert the data into tables.

## Datasets

`Clickhouse` does not support multiple datasets in one database, whereas `dlt` relies on datasets due to multiple reasons. In order to make `Clickhouse` work with `dlt`, tables generated by `dlt` in your `Clickhouse` database will have their names prefixed with the dataset name, separated by the configurable `dataset_table_separator`. Additionally, a special sentinel table that does not contain any data will be created, allowing `dlt` to recognize which virtual datasets already exist in a `Clickhouse` destination.

## Supported File Formats

- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/jsonl">jsonl</a> is the preferred format for both direct loading and staging.
- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/parquet">parquet</a> is supported for both direct loading and staging.

The `clickhouse` destination has a few specific deviations from the default sql destinations:

1. `Clickhouse` has an experimental `object` datatype, but we have found it to be a bit unpredictable, so the dlt clickhouse destination will load the complex datatype to a text column. If you need this feature, get in touch with our Slack community, and we will consider adding it.
2. `Clickhouse` does not support the `time` datatype. Time will be loaded to a `text` column.
3.  `Clickhouse` does not support the `binary` datatype. Instead, binary data will be loaded into a `text` column. When loading from `jsonl`, the binary data will be a base64 string, and when loading from parquet, the `binary` object will be converted to `text`.
5. `Clickhouse` accepts adding columns to a populated table that are not null.
6. `Clickhouse` can produce rounding errors under certain conditions when using the float or double datatype. If you cannot afford to have rounding errors, make sure to use the decimal datatype. For example, loading the value 12.7001 into a double column with the loader file format set to jsonl will predictably produce a rounding error.

## Supported Column Hints
ClickHouse supports the following <a href="https://dlthub.com/docs/general-usage/schema#tables-and-columns">column hints</a>:

- `primary_key` - marks the column as part of the primary key. Multiple columns can have this hint to create a composite primary key.

## Table Engine
By default, tables are created using the `ReplicatedMergeTree` table engine in ClickHouse. You can specify an alternate table engine using the `table_engine_type` with the clickhouse adapter:

```bash
from dlt.destinations.adapters import clickhouse_adapter


@dlt.resource()
def my_resource():
  ...


clickhouse_adapter(my_resource, table_engine_type="merge_tree")
```

Supported values are:

- `merge_tree` - creates tables using the `MergeTree` engine
- `replicated_merge_tree` (default) - creates tables using the `ReplicatedMergeTree` engine

## Staging Support

ClickHouse supports Amazon S3, Google Cloud Storage and Azure Blob Storage as file staging destinations.

`dlt` will upload Parquet or JSONL files to the staging location and use ClickHouse table functions to load the data directly from the staged files.

Please refer to the filesystem documentation to learn how to configure credentials for the staging destinations:

- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#aws-s3">Amazon S3</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#google-storage">Google Cloud Storage</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#azure-blob-storage">Azure Blob Storage</a>

To run a pipeline with staging enabled:

```bash
pipeline = dlt.pipeline(
  pipeline_name='chess_pipeline',
  destination='clickhouse',
  staging='filesystem',  # add this to activate staging
  dataset_name='chess_data'
)
```

### Using Google Cloud Storage as a Staging Area
dlt supports using Google Cloud Storage (GCS) as a staging area when loading data into ClickHouse. This is handled automatically by ClickHouse's <a href="https://clickhouse.com/docs/en/sql-reference/table-functions/gcs">GCS table function</a> which dlt uses under the hood.

The clickhouse GCS table function only supports authentication using Hash-based Message Authentication Code (HMAC) keys. To enable this, GCS provides an S3 compatibility mode that emulates the Amazon S3 API. ClickHouse takes advantage of this to allow accessing GCS buckets via its S3 integration.

To set up GCS staging with HMAC authentication in dlt:

1. Create HMAC keys for your GCS service account by following the <a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create">Google Cloud guide</a>.

2. Configure the HMAC keys as well as the `client_email`, `project_id` and `private_key` for your service account in your dlt project's ClickHouse destination settings in `config.toml`:

```bash
[destination.filesystem]
bucket_url = "gs://dlt-ci"

[destination.filesystem.credentials]
project_id = "a-cool-project"
client_email = "my-service-account@a-cool-project.iam.gserviceaccount.com"
private_key = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkaslkdjflasjnkdcopauihj...wEiEx7y+mx\nNffxQBqVVej2n/D93xY99pM=\n-----END PRIVATE KEY-----\n"

[destination.clickhouse.credentials]
database = "dlt"
username = "dlt"
password = "Dlt*12345789234567"
host = "localhost"
port = 9440
secure = 1
gcp_access_key_id = "JFJ$$*f2058024835jFffsadf"
gcp_secret_access_key = "DFJdwslf2hf57)%$02jaflsedjfasoi"
```

Note: In addition to the HMAC keys `bashgcp_access_key_id` and `gcp_secret_access_key`), you now need to provide the `client_email`, `project_id` and `private_key` for your service account under `[destination.filesystem.credentials]`. This is because the GCS staging support is now implemented as a temporary workaround and is still unoptimized.

dlt will pass these credentials to ClickHouse which will handle the authentication and GCS access.

There is active work in progress to simplify and improve the GCS staging setup for the ClickHouse dlt destination in the future. Proper GCS staging support is being tracked in these GitHub issues:

- Make filesystem destination <a href="https://github.com/dlt-hub/dlt/issues/1272"> work</a> with gcs in s3 compatibility mode
- Google Cloud Storage staging area<a href="https://github.com/dlt-hub/dlt/issues/1181"> support</a>

### dbt Support
Integration with <a href="https://dlthub.com/docs/dlt-ecosystem/transformations/dbt/">dbt</a> is generally supported via dbt-clickhouse.

### Syncing of `dlt` state
This destination fully supports <a href="https://dlthub.com/docs/general-usage/state#syncing-state-with-destination">dlt</a> state sync.

