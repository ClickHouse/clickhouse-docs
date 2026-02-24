---
slug: /sql-reference/statements/create/dictionary/sources/executable-file
title: '可执行文件字典源'
sidebar_position: 3
sidebar_label: '可执行文件'
description: '在 ClickHouse 中将可执行文件配置为字典源。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

与可执行文件配合使用的方式取决于[字典在内存中的存储方式](../layouts/)。如果字典使用 `cache` 和 `complex_key_cache` 存储，ClickHouse 会通过向可执行文件的 STDIN 发送请求来请求所需的键。否则，ClickHouse 会启动该可执行文件，并将其输出视为字典数据。

设置示例：

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(EXECUTABLE(
        command 'cat /opt/dictionaries/os.tsv'
        format 'TabSeparated'
        implicit_key false
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <source>
        <executable>
            <command>cat /opt/dictionaries/os.tsv</command>
            <format>TabSeparated</format>
            <implicit_key>false</implicit_key>
        </executable>
    </source>
    ```
  </TabItem>
</Tabs>

设置项说明：

| Setting                       | Description                                                                                                                                                                                                                                                                                  |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `command`                     | 可执行文件的绝对路径，或者文件名（如果该命令所在目录在 `PATH` 中）。                                                                                                                                                                                                                                                       |
| `format`                      | 文件格式。支持 [Formats](/sql-reference/formats) 中描述的所有格式。                                                                                                                                                                                                                                          |
| `command_termination_timeout` | 可执行脚本应包含一个主读写循环。在字典被销毁后，管道会被关闭，此时可执行文件有 `command_termination_timeout` 秒的时间自行关闭，然后 ClickHouse 才会向子进程发送 SIGTERM 信号。以秒为单位指定。默认值为 `10`。可选。                                                                                                                                                       |
| `command_read_timeout`        | 从命令的 stdout 读取数据的超时时间（毫秒）。默认值为 `10000`。可选。                                                                                                                                                                                                                                                   |
| `command_write_timeout`       | 向命令的 stdin 写入数据的超时时间（毫秒）。默认值为 `10000`。可选。                                                                                                                                                                                                                                                    |
| `implicit_key`                | 可执行源文件可以只返回值，与请求键之间的对应关系由结果中行的顺序隐式确定。默认值为 `false`。                                                                                                                                                                                                                                           |
| `execute_direct`              | 如果 `execute_direct` = `1`，则会在由 [user&#95;scripts&#95;path](/operations/server-configuration-parameters/settings#user_scripts_path) 指定的 user&#95;scripts 目录中搜索 `command`。可以使用空格分隔符指定额外的脚本参数。例如：`script_name arg1 arg2`。如果 `execute_direct` = `0`，`command` 会作为 `bin/sh -c` 的参数传入。默认值为 `0`。可选。 |
| `send_chunk_header`           | 控制在发送一个数据块之前，是否先发送其行数。默认值为 `false`。可选。                                                                                                                                                                                                                                                       |

该字典源只能通过 XML 配置进行设置。通过 DDL 创建使用 executable 源的字典已被禁用；否则，数据库用户将能够在 ClickHouse 节点上执行任意二进制文件。
