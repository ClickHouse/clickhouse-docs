
Install the [ClickHouse Python client](https://pypi.org/project/clickhouse-connect/) version 0.1.6 or higher 

```bash
pip install clickhouse-connect
pip show clickhouse-connect
```
```response
Name: clickhouse-connect
# highlight-next-line
Version: 0.1.6
Summary: ClickHouse core driver, SqlAlchemy, and Superset libraries
Home-page: https://github.com/ClickHouse/clickhouse-connect
Author: ClickHouse Inc.
Author-email: clients@clickhouse.com
License: Apache License 2.0
Location: /home/droscign/.local/lib/python3.10/site-packages
Requires: pytz, requests
Required-by: dbt-clickhouse
```

```python
import clickhouse_connect
client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='PASSWORD')
query_result = client.query('SELECT * FROM system.tables')
print (query_result.result_set)
client.command ('CREATE TABLE test_table (key UInt16, value String) ENGINE Memory')
data = [[100, 'value1'], [200, 'value2']]
client.insert('test_table', data)
print(client.query('SELECT * FROM test_table').result_set)
print(client.query('SELECT * FROM test_table').result_set)
client.command ('show tables')
data = [[100, 'value1'], [200, 'value2']]
client.insert('test_table', data)
print(client.query('SELECT * FROM test_table').result_set)
```
