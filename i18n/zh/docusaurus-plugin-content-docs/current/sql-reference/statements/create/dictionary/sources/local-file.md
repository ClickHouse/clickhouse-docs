---
slug: /sql-reference/statements/create/dictionary/sources/local-file
title: '本地文件字典源'
sidebar_position: 2
sidebar_label: '本地文件'
description: '在 ClickHouse 中将本地文件配置为字典源。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

本地文件源从本地文件系统中的文件加载字典数据。对于体量较小且静态的查找表，如果可以以平面文件形式存储，例如 TSV、CSV 或任何其他[受支持的格式](/sql-reference/formats)，这非常适用。

设置示例：

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <source>
      <file>
        <path>/opt/dictionaries/os.tsv</path>
        <format>TabSeparated</format>
      </file>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

配置项说明：

| Setting  | Description                                    |
| -------- | ---------------------------------------------- |
| `path`   | 文件的绝对路径。                                       |
| `format` | 文件格式。支持[格式](/sql-reference/formats)文档中描述的所有格式。 |

当通过 DDL 命令（`CREATE DICTIONARY ...`）创建源为 `FILE` 的字典时，源文件必须位于 `user_files` 目录中，以防止数据库用户访问 ClickHouse 节点上的任意文件。

**另请参阅**

* [字典函数](/sql-reference/table-functions/dictionary)
