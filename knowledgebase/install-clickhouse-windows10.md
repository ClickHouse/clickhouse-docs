---
date: 2023-04-24
---

# How to Install ClickHouse on Windows 10

How to install and test ClickHouse on Microsoft Windows

When ClickHouse installing on Windows 10 you may receive errors when inserting data, for example:
```
DB::Exception: std::__1::__fs::filesystem::filesystem_error: filesystem error: in rename: Permission denied ["./store/711/71144174-d098-4056-8976-6ad1204205ec/tmp_insert_all_1_1_0/"] ["./store/711/71144174-d098-4056-8976-6ad1204205ec/all_1_1_0/"]. Stack trace:
```

On Windows 10, WSL needs to be upgraded to WSL 2.
- Open Powershell by right-clicking on the PowerShell icon and selecting "run as administrator".

- Follow the instructions from Microsoft to upgrade to WSL 2, here:
https://learn.microsoft.com/en-us/windows/wsl/install

- Once it is upgraded, open WSL from PowerShell.
```
wsl
```
- For testing follow these instructions, you should have similar output:
Since this is for testing, I logged in as root to avoid permissions issues:
```
sudo -i
```
- Create a ClickHouse directory:
```
root@marspc2:~# mkdir /clickhouse
```

- From the new directory, download clickhouse:
```
root@marspc2:/# cd clickhouse

root@marspc2:/clickhouse# curl https://clickhouse.com | sh
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  2739    0  2739    0     0   5515      0 --:--:-- --:--:-- --:--:--  5511

Will download https://builds.clickhouse.com/master/amd64/clickhouse into clickhouse

  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  530M  100  530M    0     0  8859k      0  0:01:01  0:01:01 --:--:-- 8549k

Successfully downloaded the ClickHouse binary, you can run it as:
    ./clickhouse

You can also install it:
    sudo ./clickhouse install
```

- Start the clickhouse server:
```
root@marspc2:/clickhouse# ./clickhouse server
Processing configuration file 'config.xml'.
There is no file 'config.xml', will use embedded config.
Cannot set max size of core file to 1073741824
2023.04.17 19:19:23.155323 [ 500 ] {} <Information> SentryWriter: Sending crash reports is disabled
2023.04.17 19:19:23.165447 [ 500 ] {} <Trace> Pipe: Pipe capacity is 1.00 MiB
2023.04.17 19:19:23.271147 [ 500 ] {} <Information> Application: Starting ClickHouse 23.4.1.1222 (revision: 54473, git hash: 3993aef8e281815ac4269d44e27bb1dcdcff21cb, build id: AF16AA59B689841860F39ACDBED30AC8F9AB70FA), PID 500
2023.04.17 19:19:23.271208 [ 500 ] {} <Information> Application: starting up
2023.04.17 19:19:23.271237 [ 500 ] {} <Information> Application: OS name: Linux, version: 5.15.90.1-microsoft-standard-WSL2, architecture: x86_64
...
```
- In another WSL window, start the client:
```
root@marspc2:/clickhouse# ./clickhouse client
ClickHouse client version 23.4.1.1222 (official build).
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 23.4.1 revision 54462.

Warnings:
 * Linux transparent hugepages are set to "always". Check /sys/kernel/mm/transparent_hugepage/enabled

marspc2. :)
```

- Create the database and table:
```
marspc2. :) create database db1;

CREATE DATABASE db1

Query id: 688f79e2-8132-44ed-98d6-0581abe9903a

Ok.

0 rows in set. Elapsed: 0.007 sec.

marspc2. :) create table db1.table1 (id Int64, string_column String) engine = MergeTree() order by id;

CREATE TABLE db1.table1
(
    `id` Int64,
    `string_column` String
)
ENGINE = MergeTree
ORDER BY id

Query id: d91a93b4-e13f-4e17-8201-f329223287d0

Ok.

0 rows in set. Elapsed: 0.010 sec.
```

- Insert sample rows:
```
marspc2. :) insert into db1.table1 (id, string_column) values (1, 'a'), (2,'b');

INSERT INTO db1.table1 (id, string_column) FORMAT Values

Query id: 2b274eef-09af-434b-88e0-c25799649910

Ok.

2 rows in set. Elapsed: 0.003 sec.
```

- View the rows:
```
marspc2. :) select * from db1.table1;

SELECT *
FROM db1.table1

Query id: 74c76bf1-d944-4b21-a384-cc0b5e6aa579

┌─id─┬─string_column─┐
│  1 │ a             │
│  2 │ b             │
└────┴───────────────┘

2 rows in set. Elapsed: 0.002 sec.
```


