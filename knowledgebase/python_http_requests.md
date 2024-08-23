---
title: Python quick example using HTTP requests module
description: "An example using Python and requests module to write and read to ClickHouse"
date: 2022-07-10
---

# Question

Can I just run HTTP requests to ClickHouse server using _requests_ module?


# Answer

Yes, here is the sample code.

```py
import requests
import datetime

create_replace_stmt = 'CREATE OR REPLACE TABLE test_table (name String, age UInt8) Engine=MergeTree ORDER BY tuple();'
select_query = 'SELECT count() FROM test_table'
insert_query = 'INSERT INTO test_table SELECT * FROM  generateRandom(\'name String, age UInt8\',1,1) LIMIT 300000000'

CH_URL = 'https://your_clickhouse_service_fqdn:8443'
CH_USER = 'default'
CH_PASSWORD = 'secret_pwd'

headers = {}
headers["X-ClickHouse-User"] = CH_USER
headers["X-ClickHouse-Key"] = CH_PASSWORD

now = (datetime.datetime.now())
print("{} - starting...".format(now))


# create/replace table
now = (datetime.datetime.now())
print("{} - creating/replacing table...".format(now))
response = requests.post(url=CH_URL,
                         params={"database": "default",
                                 "query": create_replace_stmt,
                                 "session_id": "my-session-id-string"
                                 },
                         headers=headers)

# select count()
response = requests.post(url=CH_URL,
                         params={"database": "default",
                                 "query": select_query,
                                 "session_id": "my-session-id-string"
                                 },
                         headers=headers)

now = (datetime.datetime.now())
print("{} - elements in test_table before insert: {}".format(
    now, response.content.decode('utf-8')))


# insert
now = (datetime.datetime.now())
print("{} - Inserting data...".format(now))
response = requests.post(url=CH_URL,
                         params={"database": "default",
                                 "query": insert_query,
                                 "session_id": "my-session-id-string",
                                 "wait_end_of_query": 1
                                 },
                         headers=headers)

now = (datetime.datetime.now())
print("{} - Done inserting data...".format(now))

response = requests.post(url=CH_URL,
                         params={"database": "default",
                                 "query": select_query,
                                 "session_id": "my-session-id-string",
                                 },
                         headers=headers)

now = (datetime.datetime.now())
print("{} - elements in test_table after insert: {}".format(
    now, response.content.decode('utf-8')))
```

Sample expected output:

```
(venv) ➜  venv/bin/python main.py
2023-07-07 14:54:27.336450 - starting...
2023-07-07 14:54:27.336476 - creating/replacing table...
2023-07-07 14:54:28.125270 - elements in test_table before insert: 0

2023-07-07 14:54:28.125352 - Inserting data...
2023-07-07 14:55:23.788466 - Done inserting data...
2023-07-07 14:55:23.962134 - elements in test_table after insert: 299115357
```

requirements.txt

```
requests==2.31.0
```

See this other [KB](https://clickhouse.com/docs/knowledgebase/python-clickhouse-connect-example#steps) for steps on how setup your python venv.


