---
slug: /operations/external-authenticators/http
title: "HTTP"
---
import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

HTTPサーバーはClickHouseユーザーの認証に使用されます。HTTP認証は、`users.xml`またはローカルアクセス制御パスに定義されている既存のユーザーの外部認証機構としてのみ使用できます。現在、GETメソッドを使用した[Basic](https://datatracker.ietf.org/doc/html/rfc7617)認証スキームがサポートされています。

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

`http_authentication_servers`セクション内に異なる名前を使用して複数のHTTPサーバーを定義できることに注意してください。

**パラメータ**
- `uri` - 認証リクエストを行うためのURI

サーバーとの通信に使用されるソケットのタイムアウト（ミリ秒）:
- `connection_timeout_ms` - デフォルト: 1000 ms.
- `receive_timeout_ms` - デフォルト: 1000 ms.
- `send_timeout_ms` - デフォルト: 1000 ms.

リトライパラメータ:
- `max_tries` - 認証リクエストを行う最大試行回数。デフォルト: 3
- `retry_initial_backoff_ms` - 再試行時の初期バックオフ間隔。デフォルト: 50 ms
- `retry_max_backoff_ms` - 最大バックオフ間隔。デフォルト: 1000 ms

### `users.xml`でのHTTP認証の有効化 {#enabling-http-auth-in-users-xml}

ユーザーに対してHTTP認証を有効にするには、ユーザー定義内の`password`または類似のセクションの代わりに`http_authentication`セクションを指定します。

パラメータ:
- `server` - 前述のように、メインの`config.xml`ファイルに設定されたHTTP認証サーバーの名前。
- `scheme` - HTTP認証スキーム。現在は`Basic`のみがサポートされています。デフォルト: Basic

例（`users.xml`に記述）:
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
HTTP認証は、他の認証メカニズムと同時に使用することはできません。`http_authentication`と共に`password`のような他のセクションが存在すると、ClickHouseはシャットダウンします。
:::

### SQLを使用したHTTP認証の有効化 {#enabling-http-auth-using-sql}

ClickHouseで[SQL駆動のアクセス制御とアカウント管理](/operations/access-rights#access-control-usage)が有効にされている場合、HTTP認証で識別されたユーザーはSQL文を使用して作成することもできます。

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server' SCHEME 'Basic'
```

...または、`Basic`は明示的なスキーム定義なしでデフォルトになります。

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server'
```

### セッション設定の渡し方 {#passing-session-settings}

HTTP認証サーバーからのレスポンスボディがJSON形式であり、`settings`サブオブジェクトを含んでいる場合、ClickHouseはそのキー:バリューペアを文字列値として解析し、認証されたユーザーの現在のセッションのセッション設定として設定しようとします。解析に失敗すると、サーバーからのレスポンスボディは無視されます。
