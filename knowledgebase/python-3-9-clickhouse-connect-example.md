---
Date: 2023-05-08
---

# A Python 3.9 working example for connecting to ClickHouse Cloud Service

Using the [clickhouse-connect](https://github.com/ClickHouse/clickhouse-connect) driver and python 3.9.


check Python version:

```
$  python -V
Python 3.9.6
```

in this example we'll assemble the project in a folder called `ch-python`:

```
$ mkdir ch-python
$ cd ch-python
```

create a dependencies file named `requirements.txt` with:

```
clickhouse-connect==0.5.23
urllib3==1.26.15 #this is to workaround dependency hell related to ImportError: urllib3 v2.0 only supports OpenSSL 1.1.1+, currently the 'ssl' module is compiled with LibreSSL 2.8.3. See: https://github.com/urllib3/urllib3/issues/2168
```

create a python source file named `main.py` with the below code:

```py
import clickhouse_connect
import sys
import json

CLICKHOUSE_CLOUD_HOSTNAME = 'HOSTNAME.clickhouse.cloud'
CLICKHOUSE_CLOUD_USER = 'default'
CLICKHOUSE_CLOUD_PASSWORD = 'YOUR_SECRET_PASSWORD'

client = clickhouse_connect.get_client(
    host=CLICKHOUSE_CLOUD_HOSTNAME, port=8443, username=CLICKHOUSE_CLOUD_USER, password=CLICKHOUSE_CLOUD_PASSWORD, secure=True)

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

create the virtual environment by launching:

```
chpython$ python -m venv venv
```

load the virtual environment:

```
chpython$ source venv/bin/activate
```

once loaded, your terminal prompt should be prefixed with (venv), install dependencies:

```
(venv) ➜  chpython$ pip install -r requirements.txt
Collecting clickhouse-connect==0.5.23
  Using cached clickhouse_connect-0.5.23-cp39-cp39-macosx_11_0_arm64.whl (229 kB)
Collecting urllib3==1.26.15
  Using cached urllib3-1.26.15-py2.py3-none-any.whl (140 kB)
Collecting pytz
  Using cached pytz-2023.3-py2.py3-none-any.whl (502 kB)
Collecting lz4
  Using cached lz4-4.3.2-cp39-cp39-macosx_11_0_arm64.whl (212 kB)
Collecting zstandard
  Using cached zstandard-0.21.0-cp39-cp39-macosx_11_0_arm64.whl (364 kB)
Collecting certifi
  Using cached certifi-2023.5.7-py3-none-any.whl (156 kB)
Installing collected packages: zstandard, urllib3, pytz, lz4, certifi, clickhouse-connect
Successfully installed certifi-2023.5.7 clickhouse-connect-0.5.23 lz4-4.3.2 pytz-2023.3 urllib3-1.26.15 zstandard-0.21.0
```

launch the code!

```
(venv) chpython$ python main.py

connected to HOSTNAME.clickhouse.cloud

table new_table created or exists already!

written 2 rows to table new_table

query: [SELECT max(key), avg(metric) FROM new_table] returns:

[(2000, -50.9035)]
```


