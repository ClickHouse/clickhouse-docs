---
slug: /operations/external-authenticators/http
title: "HTTP"
---
import SelfManaged from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

HTTPサーバーはClickHouseユーザーの認証に使用できます。HTTP認証は、`users.xml`またはローカルアクセスコントロールパスで定義された既存のユーザーのための外部認証機構としてのみ使用できます。現在、[Basic](https://datatracker.ietf.org/doc/html/rfc7617)認証スキームがGETメソッドを使用してサポートされています。

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
        </basic_auth_server>
    </http_authentication_servers>
</clickhouse>

```

HTTPサーバーを`http_authentication_servers`セクション内で異なる名前を使用して複数定義できることに注意してください。

**パラメータ**
- `uri` - 認証リクエストを行うためのURI

サーバーとの通信に使用されるソケットのミリ秒単位のタイムアウト：
- `connection_timeout_ms` - デフォルト：1000 ms。
- `receive_timeout_ms` - デフォルト：1000 ms。
- `send_timeout_ms` - デフォルト：1000 ms。

再試行パラメータ：
- `max_tries` - 認証リクエストを行う最大試行回数。デフォルト：3
- `retry_initial_backoff_ms` - 再試行の初期バックオフ間隔。デフォルト：50 ms
- `retry_max_backoff_ms` - 最大バックオフ間隔。デフォルト：1000 ms

### `users.xml`でのHTTP認証の有効化 {#enabling-http-auth-in-users-xml}

ユーザーのためにHTTP認証を有効にするには、ユーザー定義において`password`または類似のセクションの代わりに`http_authentication`セクションを指定します。

パラメータ：
- `server` - 前述の主要な`config.xml`ファイルに設定されたHTTP認証サーバーの名前。
- `scheme` - HTTP認証スキーム。現在は`Basic`のみサポートされています。デフォルト：Basic

例（`users.xml`に記入）：
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
HTTP認証は他の認証メカニズムと共に使用できないことに注意してください。`http_authentication`の横に`password`などの他のセクションが存在する場合、ClickHouseはシャットダウンします。
:::

### SQLを使用したHTTP認証の有効化 {#enabling-http-auth-using-sql}

ClickHouseで[SQL駆動のアクセス制御とアカウント管理](/guides/sre/user-management/index.md#access-control)が有効になっている場合、HTTP認証によって識別されたユーザーもSQL文を使用して作成できます。

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server' SCHEME 'Basic'
```

...また、`Basic`は明示的なスキーム定義なしでのデフォルトです。

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server'
```

### セッション設定の引き渡し {#passing-session-settings}

HTTP認証サーバーからの応答ボディがJSON形式で、`settings`サブオブジェクトを含む場合、ClickHouseはそのキー：値ペアを文字列値として解析し、認証されたユーザーの現在のセッションのセッション設定として設定しようとします。解析に失敗した場合、サーバーからの応答ボディは無視されます。
