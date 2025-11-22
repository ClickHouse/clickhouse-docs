---
description: 'HTTP に関するドキュメント'
slug: /operations/external-authenticators/http
title: 'HTTP'
doc_type: 'reference'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

HTTP サーバーを使用して ClickHouse ユーザーの認証を行うことができます。HTTP 認証は、`users.xml` またはローカルのアクセス制御パスで定義されている既存ユーザーに対する外部認証手段としてのみ利用できます。現在は、GET メソッドを使用する [Basic](https://datatracker.ietf.org/doc/html/rfc7617) 認証スキームのみがサポートされています。


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

なお、`http_authentication_servers`セクション内では、異なる名前を使用して複数のHTTPサーバーを定義できます。

**パラメータ**

- `uri` - 認証リクエストを行うためのURI

サーバーとの通信に使用されるソケットのタイムアウト(ミリ秒単位):

- `connection_timeout_ms` - デフォルト: 1000ミリ秒
- `receive_timeout_ms` - デフォルト: 1000ミリ秒
- `send_timeout_ms` - デフォルト: 1000ミリ秒

リトライパラメータ:

- `max_tries` - 認証リクエストを試行する最大回数。デフォルト: 3
- `retry_initial_backoff_ms` - リトライ時の初期バックオフ間隔。デフォルト: 50ミリ秒
- `retry_max_backoff_ms` - 最大バックオフ間隔。デフォルト: 1000ミリ秒

転送ヘッダー:

このセクションでは、クライアントリクエストヘッダーから外部HTTP認証サーバーに転送されるヘッダーを定義します。ヘッダーは設定値と大文字小文字を区別せずに照合されますが、転送時は変更されずにそのまま転送されます。

### `users.xml`でのHTTP認証の有効化 {#enabling-http-auth-in-users-xml}

ユーザーに対してHTTP認証を有効にするには、ユーザー定義内で`password`や類似のセクションの代わりに`http_authentication`セクションを指定します。

パラメータ:

- `server` - 前述のようにメインの`config.xml`ファイルで設定されたHTTP認証サーバーの名前
- `scheme` - HTTP認証スキーム。現在は`Basic`のみがサポートされています。デフォルト: Basic

例(`users.xml`に記述):

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
HTTP認証は他の認証メカニズムと併用できません。`http_authentication`と並んで`password`などの他のセクションが存在すると、ClickHouseはシャットダウンします。
:::

### SQLを使用したHTTP認証の有効化 {#enabling-http-auth-using-sql}

ClickHouseで[SQLベースのアクセス制御とアカウント管理](/operations/access-rights#access-control-usage)が有効になっている場合、HTTP認証で識別されるユーザーもSQLステートメントを使用して作成できます。

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server' SCHEME 'Basic'
```

...または、明示的なスキーム定義なしで`Basic`がデフォルトとなります

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server'
```

### セッション設定の受け渡し {#passing-session-settings}

HTTP認証サーバーからのレスポンスボディがJSON形式で`settings`サブオブジェクトを含む場合、ClickHouseはそのキーと値のペアを文字列値として解析し、認証されたユーザーの現在のセッションのセッション設定として設定しようとします。解析に失敗した場合、サーバーからのレスポンスボディは無視されます。
