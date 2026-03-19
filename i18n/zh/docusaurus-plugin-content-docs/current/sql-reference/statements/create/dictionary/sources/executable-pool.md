---
slug: /sql-reference/statements/create/dictionary/sources/executable-pool
title: 'Executable Pool 字典源'
sidebar_position: 4
sidebar_label: 'Executable Pool'
description: '在 ClickHouse 中将 Executable Pool 配置为字典源。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Executable pool 允许从一组进程中加载数据。
该字典源不适用于需要从源一次性加载全部数据的字典布局。

当字典[存储](../layouts/#storing-dictionaries-in-memory)为以下任一布局时，Executable pool 可以工作：

* `cache`
* `complex_key_cache`
* `ssd_cache`
* `complex_key_ssd_cache`
* `direct`
* `complex_key_direct`

Executable pool 会使用指定的命令启动一组进程，并保持它们运行直到退出。程序应在 STDIN 有数据时从中读取，并将结果输出到 STDOUT。它可以在 STDIN 上等待下一批数据。ClickHouse 在处理完一批数据后不会关闭 STDIN，而是在需要时通过管道传输下一块数据。可执行脚本应适应这种数据处理方式 —— 它应轮询 STDIN，并尽早将数据刷新到 STDOUT。

设置示例：

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(EXECUTABLE_POOL(
        command 'while read key; do printf "$key\tData for key $key\n"; done'
        format 'TabSeparated'
        pool_size 10
        max_command_execution_time 10
        implicit_key false
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <source>
        <executable_pool>
            <command><command>while read key; do printf "$key\tData for key $key\n"; done</command</command>
            <format>TabSeparated</format>
            <pool_size>10</pool_size>
            <max_command_execution_time>10<max_command_execution_time>
            <implicit_key>false</implicit_key>
        </executable_pool>
    </source>
    ```
  </TabItem>
</Tabs>

设置字段：

| Setting                       | Description                                                                                                                                                                                                                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `command`                     | 可执行文件的绝对路径，或文件名（如果程序目录已加入 `PATH`）。                                                                                                                                                                                                                                                            |
| `format`                      | 文件格式。支持 [Formats](/sql-reference/formats) 中描述的所有格式。                                                                                                                                                                                                                                           |
| `pool_size`                   | 进程池大小。如果将 `pool_size` 指定为 0，则不限制进程池大小。默认值为 `16`。                                                                                                                                                                                                                                              |
| `command_termination_timeout` | 可执行脚本应包含主读写循环。在字典被销毁后，管道会被关闭，此时可执行程序有 `command_termination_timeout` 秒时间正常退出，然后 ClickHouse 才会向子进程发送 SIGTERM 信号。以秒为单位。默认值为 `10`。可选。                                                                                                                                                             |
| `max_command_execution_time`  | 处理一块数据时，可执行脚本命令的最大执行时间。以秒为单位。默认值为 `10`。可选。                                                                                                                                                                                                                                                    |
| `command_read_timeout`        | 从命令 stdout 读取数据的超时时间（毫秒）。默认值为 `10000`。可选。                                                                                                                                                                                                                                                     |
| `command_write_timeout`       | 向命令 stdin 写入数据的超时时间（毫秒）。默认值为 `10000`。可选。                                                                                                                                                                                                                                                      |
| `implicit_key`                | 可执行源文件可以只返回值，对请求键的对应关系由结果中行的顺序隐式确定。默认值为 `false`。可选。                                                                                                                                                                                                                                           |
| `execute_direct`              | 如果 `execute_direct` = `1`，则会在 [user&#95;scripts&#95;path](/operations/server-configuration-parameters/settings#user_scripts_path) 指定的 user&#95;scripts 目录中查找 `command`。可以使用空格分隔符指定额外的脚本参数。例如：`script_name arg1 arg2`。如果 `execute_direct` = `0`，则将 `command` 作为 `bin/sh -c` 的参数传递。默认值为 `1`。可选。 |
| `send_chunk_header`           | 控制在向进程发送一块数据之前是否先发送行数。默认值为 `false`。可选。                                                                                                                                                                                                                                                        |

该字典源只能通过 XML 配置进行配置。通过 DDL 创建带有 Executable 源的字典已被禁用，否则数据库用户将能够在 ClickHouse 节点上执行任意二进制文件。
