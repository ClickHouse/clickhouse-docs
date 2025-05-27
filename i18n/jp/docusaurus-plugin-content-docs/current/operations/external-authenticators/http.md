---
'description': 'Documentation for Http'
'slug': '/operations/external-authenticators/http'
'title': 'HTTP'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

HTTPサーバーは、ClickHouseユーザーを認証するために使用できます。HTTP認証は、`users.xml`で定義されている既存のユーザーに対する外部認証機構としてのみ使用できます。また、ローカルアクセス制御パスでも定義できます。現在、GETメソッドを使用した[Basic](https://datatracker.ietf.org/doc/html/rfc7617)認証スキームがサポートされています。

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

注意点として、`http_authentication_servers`セクション内に異なる名前を使って複数のHTTPサーバーを定義することができます。

**パラメーター**
- `uri` - 認証リクエストを行うためのURI

サーバーとの通信に使用されるソケットのタイムアウト（ミリ秒）：
- `connection_timeout_ms` - デフォルト: 1000 ms。
- `receive_timeout_ms` - デフォルト: 1000 ms。
- `send_timeout_ms` - デフォルト: 1000 ms。

リトライパラメーター：
- `max_tries` - 認証リクエストを行う最大試行回数。デフォルト: 3
- `retry_initial_backoff_ms` - リトライ時の初期バックオフ間隔。デフォルト: 50 ms
- `retry_max_backoff_ms` - 最大バックオフ間隔。デフォルト: 1000 ms

フォワードヘッダー：

この部分は、クライアントリクエストヘッダーから外部HTTP認証機構に転送されるヘッダーを定義します。

### `users.xml`でのHTTP認証の有効化 {#enabling-http-auth-in-users-xml}

ユーザーのHTTP認証を有効にするには、ユーザー定義の`password`や同様のセクションの代わりに`http_authentication`セクションを指定します。

パラメーター：
- `server` - 前述のようにメインの`config.xml`ファイルに設定されたHTTP認証サーバーの名前。
- `scheme` - HTTP認証スキーム。現時点では`Basic`のみがサポートされています。デフォルト: Basic

例（`users.xml`に入れる）：
```xml
<clickhouse>
    <!- ... -->
    <my_user>
        <!- ... -->
        <http_authentication>
            <server>basic_server</server>
            <scheme>basic</scheme>
        </http_authentication>
    </my_user>
</clickhouse>
```

:::note
HTTP認証は、他のいかなる認証メカニズムと併用することはできません。`http_authentication`と共に`password`などの他のセクションが存在すると、ClickHouseはシャットダウンします。
:::

### SQLを使用したHTTP認証の有効化 {#enabling-http-auth-using-sql}

ClickHouseで[SQL駆動のアクセス制御とアカウント管理](/operations/access-rights#access-control-usage)が有効になっている場合、HTTP認証によって識別されたユーザーはSQLステートメントを使用して作成することもできます。

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server' SCHEME 'Basic'
```

...または、`Basic`は明示的なスキーム定義なしでデフォルトとして使用されます。

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server'
```

### セッション設定の渡し方 {#passing-session-settings}

HTTP認証サーバーからのレスポンスボディがJSON形式で、`settings`サブオブジェクトを含む場合、ClickHouseはそのキー:バリューペアを文字列値として解析し、認証されたユーザーの現在のセッションのセッション設定として設定しようとします。解析に失敗した場合、サーバーからのレスポンスボディは無視されます。
