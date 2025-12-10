---
description: 'HTTP に関するドキュメント'
slug: /operations/external-authenticators/http
title: 'HTTP'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

HTTP サーバーを使用して ClickHouse ユーザーを認証できます。HTTP 認証は、`users.xml` またはローカルのアクセス制御パスで定義された既存ユーザーに対する外部認証方式としてのみ使用できます。現在は、GET メソッドを使用する [Basic](https://datatracker.ietf.org/doc/html/rfc7617) 認証スキームがサポートされています。

## HTTP 認証サーバーの定義 {#http-auth-server-definition}

HTTP認証サーバーを定義するには、`config.xml` ファイルに `http_authentication_servers` セクションを追加する必要があります。

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

`http_authentication_servers` セクション内には、異なる名前を用いることで複数の HTTP サーバーを定義できます。

**パラメータ**

* `uri` - 認証リクエストを送信するための URI

サーバーとの通信に使用されるソケットのタイムアウト（ミリ秒）:

* `connection_timeout_ms` - デフォルト: 1000 ms
* `receive_timeout_ms` - デフォルト: 1000 ms
* `send_timeout_ms` - デフォルト: 1000 ms

再試行用パラメータ:

* `max_tries` - 認証リクエストを試行する最大回数。デフォルト: 3
* `retry_initial_backoff_ms` - 再試行時のバックオフ初期間隔。デフォルト: 50 ms
* `retry_max_backoff_ms` - バックオフの最大間隔。デフォルト: 1000 ms

転送するヘッダー:

ここでは、クライアントリクエストのヘッダーから外部 HTTP 認証サーバーへ転送されるヘッダーを定義します。ヘッダーは設定済みのものと大文字小文字を区別せずに照合されますが、転送時は元の形、すなわち変更されずに送信されます。

### `users.xml` での HTTP 認証の有効化 {#enabling-http-auth-in-users-xml}

ユーザーに対して HTTP 認証を有効にするには、ユーザー定義内で `password` などのセクションの代わりに `http_authentication` セクションを指定します。

パラメータ:

* `server` - 前述のとおり、メインの `config.xml` ファイル内で設定されている HTTP 認証サーバーの名前。
* `scheme` - HTTP 認証スキーム。現在サポートされているのは `Basic` のみです。デフォルト: Basic

例（`users.xml` に記述）:

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
HTTP 認証は、他の認証メカニズムと併用できない点に注意してください。`http_authentication` と一緒に `password` など他のセクションが存在する場合、ClickHouse は強制終了されます。
:::

### SQL を使用した HTTP 認証の有効化 {#enabling-http-auth-using-sql}

ClickHouse で [SQL ベースのアクセス制御とアカウント管理](/operations/access-rights#access-control-usage) が有効になっている場合、HTTP 認証で認証されるユーザーは、SQL 文を使用して作成することもできます。

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server' SCHEME 'Basic'
```

…または、スキームを明示的に指定しない場合は `Basic` がデフォルトとして使用されます

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server'
```

### セッション設定の受け渡し {#passing-session-settings}

HTTP 認証サーバーからのレスポンスボディが JSON 形式で、`settings` サブオブジェクトを含んでいる場合、ClickHouse はそのキーと値のペアを文字列値として解析しようとし、認証済みユーザーの現在のセッションのセッション設定としてそれらを設定します。解析に失敗した場合、サーバーからのレスポンスボディは無視されます。
