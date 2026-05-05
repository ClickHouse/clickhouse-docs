---
slug: /sql-reference/statements/create/dictionary/sources/http
title: 'HTTP(S) Dictionary ソース'
sidebar_position: 5
sidebar_label: 'HTTP(S)'
description: 'ClickHouse で HTTP または HTTPS エンドポイントを Dictionary ソースとして構成します。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

HTTP(S) サーバーとの連携方法は、[Dictionary がメモリ上にどのように保存されているか](../layouts/) に依存します。Dictionary が `cache` および `complex_key_cache` を用いて保存されている場合、ClickHouse は `POST` メソッドでリクエストを送信して必要なキーを取得します。

設定例:

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

ClickHouse が HTTPS リソースにアクセスできるようにするには、サーバー構成で [openSSL を設定](/operations/server-configuration-parameters/settings#openssl) する必要があります。

設定項目:

| Setting       | 説明                                                                |
| ------------- | ----------------------------------------------------------------- |
| `url`         | ソースの URL。                                                         |
| `format`      | ファイル形式。[Formats](/sql-reference/formats) で説明されているすべての形式がサポートされます。 |
| `credentials` | Basic HTTP 認証。省略可能。                                               |
| `user`        | 認証に必要なユーザー名。                                                      |
| `password`    | 認証に必要なパスワード。                                                      |
| `headers`     | HTTP リクエストで使用される、すべてのカスタム HTTP ヘッダーエントリ。省略可能。                     |
| `header`      | 単一の HTTP ヘッダーエントリ。                                                |
| `name`        | リクエスト送信時のヘッダーに使用される識別子名。                                          |
| `value`       | 特定の識別子名に対して設定される値。                                                |

DDL コマンド（`CREATE DICTIONARY ...`）を使用して Dictionary を作成する際、HTTP Dictionary 用のリモートホストは、データベースユーザーが任意の HTTP サーバーへアクセスするのを防ぐために、設定ファイルの `remote_url_allow_hosts` セクションの内容と照合されます。
