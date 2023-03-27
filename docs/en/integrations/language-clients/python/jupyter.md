---
sidebar_label: Jupyter Notebooks
sidebar_position: 10
keywords: [clickhouse, python, jupyter, connect, integrate]
slug: /en/integrations/language-clients/python/jupyter
description: Connect to ClickHouse with Jupyter Notebooks
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.mdx';

# Jupyter Notebook Integration with ClickHouse Connect

## Introduction

ClickHouse Connect is a suite of Python packages providing interoperability with ClickHouse, and can be used with Jupyter Notebooks.

## Installation

Install ClickHouse Connect from PyPI via pip:

`pip install clickhouse-connect`

## Basic Usage

### Add `clickhouse-connect` to your environment

```bash
pip install clickhouse-connect
```

Optionally, you may want to use `python-dotenv` to manage your credentials, the examples below use `python-dotenv`.

```bash
pip install python-dotenv
```

### Gather your connection details

<ConnectionDetails />

### Establish a connection

If you are using `dotenv`, add your credentials to a `.env` file:

```bash title='notebooks/.env'
CH_HOST=host.us-east-2.aws.clickhouse.cloud
CH_PORT=8443
CH_USERNAME=default
CH_PASSWORD=abcdefghij
```

### Sample notebook
```python
%load_ext dotenv
%dotenv
import os
```
```python
ch_host = os.getenv("CH_HOST")
ch_port = os.getenv("CH_PORT")
ch_username = os.getenv("CH_USERNAME")
ch_password = os.getenv("CH_PASSWORD")
```
```python
import clickhouse_connect
client = clickhouse_connect.get_client(
    host=ch_host,
    port=ch_port,
    secure='true',
    username=ch_username,
    password=ch_password)
```
```python
result = client.query('SELECT query FROM system.query_log ORDER BY event_date DESC LIMIT 1')
result.result_set
```
```response
[('SELECT count() as numMerges FROM system.merges',)]
 ```
