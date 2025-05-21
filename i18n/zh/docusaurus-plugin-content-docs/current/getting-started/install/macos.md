---
'description': '在MacOS上安装ClickHouse'
'keywords':
- 'ClickHouse'
- 'install'
- 'MacOS'
'sidebar_label': 'MacOS'
'slug': '/install/macOS'
'title': '使用Homebrew安装ClickHouse'
'hide_title': true
---

import MacOSProd from './_snippets/_macos.md'


# ClickHouse on macOS

## Installation

To install ClickHouse on macOS, you can use `brew`, the Homebrew package manager. Here’s a quick way to install it:

```bash
brew tap yandex/tap
brew install clickhouse-server clickhouse-client
```

After installation, you can start the ClickHouse server with the following command:

```bash
clickhouse-server
```

You can then connect to your ClickHouse server using the client:

```bash
clickhouse-client
```

## Configuration

The main configuration file is located at `/usr/local/etc/clickhouse-server/config.xml`. You can customize various settings such as ports, paths, users, etc. 

### Sample Configurations

Here are some basic settings you might want to update:

- **Port**: Change the default port (9000) if necessary.
- **User Management**: Configure users and permissions according to your needs.
  
## Usage

Once ClickHouse is running, you can start executing queries. For example, to create a new table, you can run:

```sql
CREATE TABLE test (date Date, name String) ENGINE = MergeTree() ORDER BY date
```

You can then insert data into the table:

```sql
INSERT INTO test VALUES ('2023-01-01', 'ClickHouse')
```

Finally, to retrieve the data, use:

```sql
SELECT * FROM test
```

## Further Reading

For more details on the configuration options and advanced usage of ClickHouse, refer to the [ClickHouse documentation](https://clickhouse.com/docs/en/).

## Conclusion

ClickHouse is a powerful database for analytics. With the steps outlined above, you should have a working installation on macOS. Enjoy exploring your data!
