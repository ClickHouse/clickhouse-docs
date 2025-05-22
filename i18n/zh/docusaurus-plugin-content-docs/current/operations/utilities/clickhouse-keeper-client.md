---
'description': 'ClickHouse Keeper 客户端工具的文档'
'sidebar_label': 'clickhouse-keeper-client'
'slug': '/operations/utilities/clickhouse-keeper-client'
'title': 'clickhouse-keeper-client 工具'
---


# clickhouse-keeper-client 工具

与 clickhouse-keeper 通过其原生协议交互的客户端应用程序。

## 关键参数 {#clickhouse-keeper-client}

-   `-q QUERY`, `--query=QUERY` — 要执行的查询。如果未传递此参数，`clickhouse-keeper-client` 将以交互模式启动。
-   `-h HOST`, `--host=HOST` — 服务器主机。默认值：`localhost`。
-   `-p N`, `--port=N` — 服务器端口。默认值：9181
-   `-c FILE_PATH`, `--config-file=FILE_PATH` — 设置配置文件的路径以获取连接字符串。默认值：`config.xml`。
-   `--connection-timeout=TIMEOUT` — 设置连接超时（秒）。默认值：10s。
-   `--session-timeout=TIMEOUT` — 设置会话超时（秒）。默认值：10s。
-   `--operation-timeout=TIMEOUT` — 设置操作超时（秒）。默认值：10s。
-   `--history-file=FILE_PATH` — 设置历史文件的路径。默认值：`~/.keeper-client-history`。
-   `--log-level=LEVEL` — 设置日志级别。默认值：`information`。
-   `--no-confirmation` — 如果设置，将不要求对多个命令进行确认。交互时的默认值为 `false`，查询时为 `true`
-   `--help` — 显示帮助信息。

## 示例 {#clickhouse-keeper-client-example}

```bash
./clickhouse-keeper-client -h localhost -p 9181 --connection-timeout 30 --session-timeout 30 --operation-timeout 30
Connected to ZooKeeper at [::1]:9181 with session_id 137
/ :) ls
keeper foo bar
/ :) cd 'keeper'
/keeper :) ls
api_version
/keeper :) cd 'api_version'
/keeper/api_version :) ls

/keeper/api_version :) cd 'xyz'
Path /keeper/api_version/xyz does not exist
/keeper/api_version :) cd ../../
/ :) ls
keeper foo bar
/ :) get 'keeper/api_version'
2
```

## 命令 {#clickhouse-keeper-client-commands}

-   `ls '[path]'` -- 列出给定路径下的节点（默认：当前工作目录）
-   `cd '[path]'` -- 更改工作路径（默认 `.`）
-   `cp '<src>' '<dest>'`  -- 复制 'src' 节点到 'dest' 路径
-   `mv '<src>' '<dest>'`  -- 移动 'src' 节点到 'dest' 路径
-   `exists '<path>'` -- 如果节点存在，则返回 `1`，否则返回 `0`
-   `set '<path>' <value> [version]` -- 更新节点的值。仅在版本匹配时更新（默认：-1）
-   `create '<path>' <value> [mode]` -- 创建新节点并设置值
-   `touch '<path>'` -- 创建新节点，并将值设置为空字符串。如果节点已存在，则不会抛出异常
-   `get '<path>'` -- 返回节点的值
-   `rm '<path>' [version]` -- 仅在版本匹配时删除节点（默认：-1）
-   `rmr '<path>' [limit]` -- 递归删除路径，如果子树大小小于限制。需要确认（默认限制 = 100）
-   `flwc <command>` -- 执行四字母命令
-   `help` -- 打印此消息
-   `get_direct_children_number '[path]'` -- 获取特定路径下直接子节点的数量
-   `get_all_children_number '[path]'` -- 获取特定路径下所有子节点的数量
-   `get_stat '[path]'` -- 返回节点的状态（默认 `.`）
-   `find_super_nodes <threshold> '[path]'` -- 查找在给定路径下子节点数量大于某个阈值的节点（默认 `.`）
-   `delete_stale_backups` -- 删除用于备份的 ClickHouse 节点，这些节点现在处于非活动状态
-   `find_big_family [path] [n]` -- 返回子树中最大的前 n 个节点（默认路径 = `.` 和 n = 10）
-   `sync '<path>'` -- 在进程和领导者之间同步节点
-   `reconfig <add|remove|set> "<arg>" [version]` -- 重新配置 Keeper 集群。请参见 /docs/en/guides/sre/keeper/clickhouse-keeper#reconfiguration
