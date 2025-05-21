---
description: 'Httpに関するドキュメント'
slug: /operations/external-authenticators/http
title: 'HTTP'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

HTTPサーバーはClickHouseユーザーを認証するために使用できます。HTTP認証は、`users.xml`またはローカルアクセス制御パスで定義された既存のユーザーに対してのみ外部認証機構として使用できます。現在、GETメソッドを使用した[Basic](https://datatracker.ietf.org/doc/html/rfc7617)認証スキームがサポートされています。

## HTTP認証サーバーの定義 {#http-auth-server-definition}

HTTP認証サーバーを定義するには、`config.xml`に`http_authentication_servers`セクションを追加する必要があります。

**例**
```xml
<clickhouse>
    <!- ... -->
    <http_authentication_servers>
        <basic_auth_server>
          <uri>http://localhost:8000/auth</uri>
          <connection_timeout_ms>1000</connection_timeout_ms>
          <receive_timeout_ms>1000</receive_timeout_ms>
          <send_timeout_ms>1000</send_timeout_ms>
          <max_tries>3</max_tries>
          <retry_initial_backoff_ms>50</retry_initial_backoff_ms>
          <retry_max_backoff_ms>1000</retry_max_backoff_ms>
          <forward_headers>
            <name>Custom-Auth-Header-1</name>
            <name>Custom-Auth-Header-2</name>
          </forward_headers>

        </basic_auth_server>
    </http_authentication_servers>
</clickhouse>

```

`http_authentication_servers`セクション内に異なる名前を持つ複数のHTTPサーバーを定義できることに注意してください。

**パラメータ**
- `uri` - 認証リクエストを行うためのURI

サーバーとの通信に使用されるソケットのミリ秒でのタイムアウト：
- `connection_timeout_ms` - デフォルト: 1000 ms。
- `receive_timeout_ms` - デフォルト: 1000 ms。
- `send_timeout_ms` - デフォルト: 1000 ms。

再試行パラメータ：
- `max_tries` - 認証リクエストを試みる最大回数。デフォルト: 3
- `retry_initial_backoff_ms` - 再試行時の初期バックオフ間隔。デフォルト: 50 ms
- `retry_max_backoff_ms` - 最大バックオフ間隔。デフォルト: 1000 ms

フォワードヘッダー：

この部分は、クライアントのリクエストヘッダーから外部HTTP認証機構に転送されるヘッダーを定義します。

### `users.xml` でのHTTP認証の有効化 {#enabling-http-auth-in-users-xml}

ユーザーに対してHTTP認証を有効にするためには、ユーザー定義の`password`や類似のセクションの代わりに`http_authentication`セクションを指定します。

パラメータ：
- `server` - 前述の主要な`config.xml`ファイルで設定されたHTTP認証サーバーの名前。
- `scheme` - HTTP認証スキーム。現在は`Basic`のみがサポートされています。デフォルト: Basic

例（`users.xml`に入ります）：
```xml
<clickhouse>
    <!- ... -->
    <my_user>
        <!- ... -->
        <http_authentication>
            <server>basic_server</server>
            <scheme>basic</scheme>
        </http_authentication>
    </test_user_2>
</clickhouse>
```

:::note
HTTP認証は他の認証機構と併用することはできません。`http_authentication`の他に`password`のような他のセクションが存在する場合、ClickHouseはシャットダウンします。
:::

### SQLを使用したHTTP認証の有効化 {#enabling-http-auth-using-sql}

ClickHouseで[SQL駆動のアクセス制御とアカウント管理](/operations/access-rights#access-control-usage)が有効になっている場合、HTTP認証によって識別されたユーザーもSQLステートメントを使用して作成できます。

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server' SCHEME 'Basic'
```

...または、`Basic`は明示的なスキーム定義なしでデフォルトです

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server'
```

### セッション設定の渡し方 {#passing-session-settings}

HTTP認証サーバーからのレスポンスボディがJSON形式で、`settings`サブオブジェクトを含む場合、ClickHouseはそのキー: 値ペアを文字列として解析し、認証されたユーザーの現在のセッションのセッション設定として設定しようとします。解析に失敗した場合、サーバーからのレスポンスボディは無視されます。
