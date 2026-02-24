---
slug: /sql-reference/statements/create/dictionary/sources/http
title: 'HTTP(S) 字典源'
sidebar_position: 5
sidebar_label: 'HTTP(S)'
description: '将 HTTP 或 HTTPS 端点配置为 ClickHouse 的字典源。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

与 HTTP(S) 服务器交互取决于[字典在内存中的存储方式](../layouts/)。如果字典是使用 `cache` 和 `complex_key_cache` 存储的，ClickHouse 会通过发送 `POST` 方法的请求来获取所需的键。

设置示例：

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(HTTP(
        url 'http://[::1]/os.tsv'
        format 'TabSeparated'
        credentials(user 'user' password 'password')
        headers(header(name 'API-KEY' value 'key'))
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <source>
        <http>
            <url>http://[::1]/os.tsv</url>
            <format>TabSeparated</format>
            <credentials>
                <user>user</user>
                <password>password</password>
            </credentials>
            <headers>
                <header>
                    <name>API-KEY</name>
                    <value>key</value>
                </header>
            </headers>
        </http>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

为了让 ClickHouse 访问 HTTPS 资源，必须在服务器配置中[配置 OpenSSL](/operations/server-configuration-parameters/settings#openssl)。

字段说明：

| Setting       | Description                                         |
| ------------- | --------------------------------------------------- |
| `url`         | 源 URL。                                              |
| `format`      | 文件格式。支持 [Formats](/sql-reference/formats) 中描述的所有格式。 |
| `credentials` | 基本 HTTP 认证。可选。                                      |
| `user`        | 认证所需的用户名。                                           |
| `password`    | 认证所需的密码。                                            |
| `headers`     | HTTP 请求中使用的所有自定义 HTTP 头部条目。可选。                      |
| `header`      | 单个 HTTP 头部条目。                                       |
| `name`        | 在请求中发送的头部所使用的标识符名称。                                 |
| `value`       | 为特定标识符名称设置的值。                                       |

使用 DDL 命令（`CREATE DICTIONARY ...`）创建字典时，会根据配置中 `remote_url_allow_hosts` 部分的内容检查 HTTP 字典的远程主机，以防止数据库用户访问任意 HTTP 服务器。
