---
description: 'ClickHouse Keeper 客户端工具文档'
sidebar_label: 'clickhouse-keeper-client'
slug: /operations/utilities/clickhouse-keeper-client
title: 'clickhouse-keeper-client 工具'
doc_type: 'reference'
---



# clickhouse-keeper-client 工具

一个通过原生协议与 clickhouse-keeper 交互的客户端应用程序。



## 参数 {#clickhouse-keeper-client}

- `-q QUERY`, `--query=QUERY` — 要执行的查询。如果未传递此参数,`clickhouse-keeper-client` 将以交互模式启动。
- `-h HOST`, `--host=HOST` — 服务器主机地址。默认值:`localhost`。
- `-p N`, `--port=N` — 服务器端口。默认值:9181
- `-c FILE_PATH`, `--config-file=FILE_PATH` — 设置配置文件路径以获取连接字符串。默认值:`config.xml`。
- `--connection-timeout=TIMEOUT` — 设置连接超时时间(秒)。默认值:10秒。
- `--session-timeout=TIMEOUT` — 设置会话超时时间(秒)。默认值:10秒。
- `--operation-timeout=TIMEOUT` — 设置操作超时时间(秒)。默认值:10秒。
- `--history-file=FILE_PATH` — 设置历史记录文件路径。默认值:`~/.keeper-client-history`。
- `--log-level=LEVEL` — 设置日志级别。默认值:`information`。
- `--no-confirmation` — 如果设置此选项,将不需要对某些命令进行确认。交互模式下默认值为 `false`,查询模式下默认值为 `true`
- `--help` — 显示帮助信息。


## 示例 {#clickhouse-keeper-client-example}

```bash
./clickhouse-keeper-client -h localhost -p 9181 --connection-timeout 30 --session-timeout 30 --operation-timeout 30
已连接到 ZooKeeper，地址为 [::1]:9181，会话 ID 为 137
/ :) ls
keeper foo bar
/ :) cd 'keeper'
/keeper :) ls
api_version
/keeper :) cd 'api_version'
/keeper/api_version :) ls

/keeper/api_version :) cd 'xyz'
路径 /keeper/api_version/xyz 不存在
/keeper/api_version :) cd ../../
/ :) ls
keeper foo bar
/ :) get 'keeper/api_version'
2
```


## 命令 {#clickhouse-keeper-client-commands}

- `ls '[path]'` -- 列出指定路径下的节点(默认:当前工作目录)
- `cd '[path]'` -- 切换工作路径(默认 `.`)
- `cp '<src>' '<dest>'` -- 将 'src' 节点复制到 'dest' 路径
- `cpr '<src>' '<dest>'` -- 将 'src' 节点子树复制到 'dest' 路径
- `mv '<src>' '<dest>'` -- 将 'src' 节点移动到 'dest' 路径
- `mvr '<src>' '<dest>'` -- 将 'src' 节点子树移动到 'dest' 路径
- `exists '<path>'` -- 如果节点存在则返回 `1`,否则返回 `0`
- `set '<path>' <value> [version]` -- 更新节点的值。仅在版本匹配时更新(默认:-1)
- `create '<path>' <value> [mode]` -- 使用指定值创建新节点
- `touch '<path>'` -- 创建值为空字符串的新节点。如果节点已存在则不抛出异常
- `get '<path>'` -- 返回节点的值
- `rm '<path>' [version]` -- 仅在版本匹配时删除节点(默认:-1)
- `rmr '<path>' [limit]` -- 如果子树大小小于限制值,则递归删除路径。需要确认(默认限制 = 100)
- `flwc <command>` -- 执行四字母命令
- `help` -- 打印此帮助信息
- `get_direct_children_number '[path]'` -- 获取指定路径下直接子节点的数量
- `get_all_children_number '[path]'` -- 获取指定路径下所有子节点的数量
- `get_stat '[path]'` -- 返回节点的统计信息(默认 `.`)
- `find_super_nodes <threshold> '[path]'` -- 查找指定路径下子节点数量大于指定阈值的节点(默认 `.`)
- `delete_stale_backups` -- 删除用于备份但现已失效的 ClickHouse 节点
- `find_big_family [path] [n]` -- 返回子树中子节点数量最多的前 n 个节点(默认路径 = `.` 且 n = 10)
- `sync '<path>'` -- 在进程与 leader 之间同步节点
- `reconfig <add|remove|set> "<arg>" [version]` -- 重新配置 Keeper 集群。请参阅 /docs/en/guides/sre/keeper/clickhouse-keeper#reconfiguration
