---
Date: 2023-05-08
---

# A Python client working example for connecting to ClickHouse Cloud Service

This is a step by step example on how to start using Python with ClickHouse Cloud service. 

:::note
Keep in mind that Python versions and libraries dependencies are constantly evolving. Make also sure to use the latest supported versions of both the driver and Python environment when trying this.

At the time of writing this article, we're using the [clickhouse-connect](https://github.com/ClickHouse/clickhouse-connect) driver version `0.5.23` and python `3.11.2` respectively.
:::


## Steps

1. Check the Python version:

```
$  python -V
Python 3.11.2
```

2. We'll assemble the project in a folder called `ch-python`:

```
$ mkdir ch-python
$ cd ch-python
```

3. Create a dependencies file named `requirements.txt` with:

```
clickhouse-connect==0.5.23
```

4. Create a python source file named `main.py`:

```py
import clickhouse_connect
import sys
import json

CLICKHOUSE_CLOUD_HOSTNAME = 'HOSTNAME.clickhouse.cloud'
CLICKHOUSE_CLOUD_USER = 'default'
CLICKHOUSE_CLOUD_PASSWORD = 'YOUR_SECRET_PASSWORD'

client = clickhouse_connect.get_client(
    host=CLICKHOUSE_CLOUD_HOSTNAME, port=8443, username=CLICKHOUSE_CLOUD_USER, password=CLICKHOUSE_CLOUD_PASSWORD)

print("connected to " + CLICKHOUSE_CLOUD_HOSTNAME + "\n")
client.command(
    'CREATE TABLE IF NOT EXISTS new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')

print("table new_table created or exists already!\n")

row1 = [1000, 'String Value 1000', 5.233]
row2 = [2000, 'String Value 2000', -107.04]
data = [row1, row2]
client.insert('new_table', data, column_names=['key', 'value', 'metric'])

print("written 2 rows to table new_table\n")

QUERY = "SELECT max(key), avg(metric) FROM new_table"

result = client.query(QUERY)

sys.stdout.write("query: ["+QUERY + "] returns:\n\n")
print(result.result_rows)
```

5. Create the virtual environment:

```
chpython$ python -m venv venv
```

6. Load the virtual environment:

```
chpython$ source venv/bin/activate
```

Once loaded, your terminal prompt should be prefixed with (venv), install dependencies:

```
(venv) ➜  chpython$ pip install -r requirements.txt
Collecting certifi
  Using cached certifi-2023.5.7-py3-none-any.whl (156 kB)
Collecting urllib3>=1.26
  Using cached urllib3-2.0.2-py3-none-any.whl (123 kB)
Collecting pytz
  Using cached pytz-2023.3-py2.py3-none-any.whl (502 kB)
Collecting zstandard
  Using cached zstandard-0.21.0-cp311-cp311-macosx_11_0_arm64.whl (364 kB)
Collecting lz4
  Using cached lz4-4.3.2-cp311-cp311-macosx_11_0_arm64.whl (212 kB)
Installing collected packages: pytz, zstandard, urllib3, lz4, certifi, clickhouse-connect
Successfully installed certifi-2023.5.7 clickhouse-connect-0.5.23 lz4-4.3.2 pytz-2023.3 urllib3-2.0.2 zstandard-0.21.0
```

7. Launch the code!

```
(venv) chpython$ venv/bin/python main.py

connected to HOSTNAME.clickhouse.cloud

table new_table created or exists already!

written 2 rows to table new_table

query: [SELECT max(key), avg(metric) FROM new_table] returns:

[(2000, -50.9035)]
```

:::tip
If using an older Python version (e.g. `3.9.6`) you might be getting an `ImportError` related to `urllib3` library.
In that case either upgrade your Python environment to a newer version or pin the `urllib3` version to `1.26.15` in your requirements.txt file.
:::
