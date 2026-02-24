---
description: 'ClickHouse ODBC ドライバーのドキュメント'
sidebar_label: 'ODBC ドライバー'
sidebar_position: 35
slug: /interfaces/odbc
title: 'ODBC ドライバー'
doc_type: 'reference'
---

# ODBC ドライバー \{#odbc-driver\}

ClickHouse ODBC ドライバーは、ODBC 互換アプリケーションを ClickHouse に接続するための、標準に準拠したインターフェイスを提供します。ODBC API を実装しており、アプリケーション、BI ツール、およびスクリプト実行環境から SQL クエリを実行し、結果を取得し、慣れ親しんだ仕組みで ClickHouse と対話できるようにします。

このドライバーは、[HTTP プロトコル](/interfaces/http) を使用して ClickHouse サーバーと通信します。これは、すべての ClickHouse デプロイメントでサポートされている主要なプロトコルです。これにより、ローカルインストール、クラウドマネージドサービス、HTTP ベースのアクセスのみが利用可能な環境など、多様な環境でドライバーを一貫して動作させることができます。

ドライバーのソースコードは、[ClickHouse-ODBC GitHub Repository](https://github.com/ClickHouse/clickhouse-odbc) で入手できます。

:::tip
より高い互換性のため、ClickHouse サーバーをバージョン 24.11 以降に更新することを強く推奨します。
:::

:::note
このドライバーは現在も積極的に開発されています。一部の ODBC 機能はまだ完全には実装されていない可能性があります。現行バージョンは、基本的な接続性と中核となる ODBC 機能の提供に重点を置いており、追加機能は今後のリリースで提供される予定です。

皆様からのフィードバックは非常に重要であり、新機能や改善の優先順位付けに役立ちます。制約や不足している機能、予期しない動作に遭遇した場合は、観察内容や機能要望を [https://github.com/ClickHouse/clickhouse-odbc/issues](https://github.com/ClickHouse/clickhouse-odbc/issues) の issue tracker から共有してください。
:::

## Windows へのインストール \{#installation-on-windows\}

最新バージョンのドライバーは
[https://github.com/ClickHouse/clickhouse-odbc/releases/latest](https://github.com/ClickHouse/clickhouse-odbc/releases/latest)
から入手できます。
このページから MSI インストーラーをダウンロードして実行し、表示される簡単なインストール手順に従ってください。

## テスト \{#testing\}

次の簡単な PowerShell スクリプトを実行して、ドライバーをテストできます。以下のテキストをコピーし、URL、ユーザー名、パスワードを設定してから、
PowerShell のコマンドプロンプトに貼り付けて実行してください。`$reader.GetValue(0)` を実行すると、ClickHouse
サーバーのバージョンが表示されるはずです。

```powershell
$url = "http://127.0.0.1:8123/"
$username = "default"
$password = ""
$conn = New-Object System.Data.Odbc.OdbcConnection("`
    Driver={ClickHouse ODBC Driver (Unicode)};`
    Url=$url;`
    Username=$username;`
    Password=$password")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "select version()"
$reader = $cmd.ExecuteReader()
$reader.Read()
$reader.GetValue(0)
$reader.Close()
$conn.Close()
```


## 設定パラメータ \{#configuration-parameters\}

以下のパラメータは、ClickHouse ODBC ドライバーとの接続を確立する際によく使用される代表的な設定です。基本的な認証、接続時の動作、およびデータ処理オプションをカバーします。サポートされているパラメータの全一覧は、プロジェクトの GitHub ページ [https://github.com/ClickHouse/clickhouse-odbc](https://github.com/ClickHouse/clickhouse-odbc) で確認できます。

* `Url`: ClickHouse サーバーの完全な HTTP(S) エンドポイントを指定します。プロトコル、ホスト、ポート、および省略可能なパスを含みます。
* `Username`: ClickHouse サーバーでの認証に使用されるユーザー名です。
* `Password`: 指定されたユーザー名に関連付けられたパスワードです。指定しない場合、ドライバーはパスワード認証なしで接続します。
* `Database`: 接続に使用するデフォルトのデータベースです。
* `Timeout`: ドライバーがリクエストを中止する前に、サーバーからの応答を待機する最大時間（秒）です。
* `ClientName`: クライアントメタデータの一部として ClickHouse サーバーに送信されるカスタム識別子です。トレースや異なるアプリケーションからのトラフィックを識別するのに有用です。このパラメータは、ドライバーが送信する HTTP リクエストの User-Agent ヘッダーの一部になります。
* `Compression`: リクエストおよびレスポンスのペイロードに対する HTTP 圧縮を有効または無効にします。有効にすると、大きな結果セットに対して帯域幅の使用量を削減し、パフォーマンスを向上させることができます。
* `SqlCompatibilitySettings`: ClickHouse の動作を、より伝統的なリレーショナルデータベースに近づけるためのクエリ設定を有効にします。これは、たとえば Power BI のようなサードパーティツールによってクエリが自動生成される場合に有用です。これらのツールは通常、ClickHouse 固有の挙動の一部を認識しておらず、その結果、エラーや予期しない結果を引き起こすクエリを生成することがあります。詳細については、[SqlCompatibilitySettings 設定パラメータで使用される ClickHouse の設定](#sql-compatibility-settings) を参照してください。

以下は、接続を設定するためにドライバーに渡す完全な接続文字列の例です。

* WSL インスタンス上にローカルにインストールされた ClickHouse サーバー

```plaintext
Driver={ClickHouse ODBC Driver (Unicode)};Url=http://localhost:8123/;Username=default
```

* ClickHouse Cloud のインスタンス。

```plaintext
Driver={ClickHouse ODBC Driver (Unicode)};Url=https://you-instance-url.gcp.clickhouse.cloud:8443/;Username=default;Password=your-password
```


## Microsoft Power BI との統合 \{#powerbi-integration\}

ODBC ドライバーを使用して、Microsoft Power BI を ClickHouse サーバーに接続できます。Power BI では 2 つの接続オプションを提供しており、いずれも標準の Power BI インストールに含まれています。1 つは汎用 ODBC Connector、もう 1 つは ClickHouse Connector です。

どちらのコネクタも内部的には ODBC を使用しますが、対応機能が異なります。

- ClickHouse Connector（推奨）
  内部的に ODBC を使用しますが、DirectQuery モードをサポートします。このモードでは、Power BI が自動的に SQL クエリを生成し、各ビジュアライゼーションやフィルター操作に必要なデータのみを取得します。

- ODBC Connector
  Import モードのみをサポートします。Power BI はユーザーが指定したクエリを実行（またはテーブル全体を選択）し、結果セット全体を Power BI にインポートします。その後の更新では、データセット全体が再インポートされます。

ユースケースに応じてコネクタを選択してください。DirectQuery は、大規模なデータセットに対してインタラクティブなダッシュボードを構築する場合に最適です。データの完全なローカルコピーが必要な場合は Import モードを選択してください。

Microsoft Power BI と ClickHouse の統合の詳細については、[Power BI 連携に関する ClickHouse ドキュメントページ](/integrations/powerbi)を参照してください。

## SQL 互換性設定 \{#sql-compatibility-settings\}

ClickHouse には独自の SQL 方言があり、場合によっては MS SQL Server、MySQL、PostgreSQL などの他のデータベースとは
異なる挙動をします。多くの場合、これらの違いは利点となり、ClickHouse の機能を使いやすくする改良された構文を導入しています。

一方で、ODBC ドライバはしばしば Power BI のようなサードパーティ製ツールによってクエリが生成される環境で利用され、
ユーザーが自分でクエリを書くとは限りません。これらのクエリは通常、SQL 標準の最小限のサブセットに依存しています。
このような場合、ClickHouse の SQL 標準と異なる挙動は期待どおりに動作せず、予期しない結果やエラーを引き起こすことがあります。
ODBC ドライバは追加の設定パラメータ `SqlCompatibilitySettings` を提供しており、特定のクエリ関連の設定を有効にすることで、
ClickHouse の動作を標準 SQL により近づけることができます。

### SqlCompatibilitySettings 構成パラメータによって有効になる ClickHouse の設定 \{#sql-compatibility-settings-list\}

このセクションでは、ODBC ドライバーがどの設定をどのような理由で変更するかを説明します。

**[cast&#95;keep&#95;nullable](https://clickhouse.com/docs/operations/settings/settings#cast_keep_nullable)**

デフォルトでは、ClickHouse は Nullable 型から non-nullable 型への変換を許可しません。しかし、多くの BI ツールは、型変換を行う際に Nullable 型と non-nullable 型を区別しません。その結果、BI ツールによって次のようなクエリが生成されることは珍しくありません。

```sql
SELECT sum(CAST(value, 'Int32'))
FROM values
```

デフォルトでは、`value` カラムが Nullable 型の場合、このクエリは次のメッセージとともに失敗します。

```plaintext
DB::Exception: Cannot convert NULL value to non-Nullable type: while executing 'FUNCTION CAST(__table1.value :: 2,
'Int32'_String :: 1) -> CAST(__table1.value, 'Int32'_String) Int32 : 0'. (CANNOT_INSERT_NULL_IN_ORDINARY_COLUMN)
```

`cast_keep_nullable` を有効にすると、`CAST` の動作が変更され、引数の NULL 許容性が保持されるようになります。これにより、
この種の変換における ClickHouse の動作は、他のデータベースや SQL 標準規格により近いものとなります。

**[prefer&#95;column&#95;name&#95;to&#95;alias](https://clickhouse.com/docs/operations/settings/settings#prefer_column_name_to_alias)**

ClickHouse では、同じ `SELECT` リスト内の式を、そのエイリアス名で参照することができます。たとえば、次のクエリでは
繰り返しを避けられ、より簡潔に記述できます。

```sql
SELECT
    sum(value) AS S,
    count() AS C,
    S / C
FROM test
```

この機能は広く使われていますが、他のデータベースでは通常、同じ `SELECT` リスト内でこのようにはエイリアスを解決しないため、
そのようなクエリはエラーになります。もっとも問題になりやすいのは、エイリアス名がカラム名と同一である場合です。例:

```sql
SELECT
    sum(value) AS value,
    avg(value)
FROM test
```

`avg(value)` はどの `value` を対象に集計すべきでしょうか？デフォルトでは、ClickHouse はエイリアスを優先し、事実上これを
ネストされた集約に変えてしまいますが、これは多くのツールが想定している動作ではありません。

これ単体で問題になることは稀ですが、一部の BI ツールはカラムエイリアスを再利用するサブクエリを含むクエリを生成します。
たとえば、Power BI はしばしば次のようなクエリを生成します。

```sql
SELECT
    sum(C1) AS C1,
    count(C1) AS C2
FROM
(
    SELECT sum(value) AS C1
    FROM test
    GROUP BY group_index
) AS TBL
```

`C1` への参照によって、次のエラーが発生することがあります:`

```plaintext
Code: 184. DB::Exception: Received from localhost:9000. DB::Exception: Aggregate function sum(C1) AS C1 is found
inside another aggregate function in query. (ILLEGAL_AGGREGATION)
```

他のデータベースは通常、このように同じレベルでエイリアスを解決せず、代わりに `C1` をサブクエリのカラムとして扱います。ClickHouse で同様の動作を再現し、このようなクエリをエラーなく実行できるようにするために、ODBC ドライバーは `prefer_column_name_to_alias` を有効にします。

ほとんどの場合、これらの設定を有効にしても問題はありません。しかし、`readonly` 設定が `1` に設定されているユーザーは、`SELECT` クエリであっても一切の設定を変更できません。そのようなユーザーに対して `SqlCompatibilitySettings` を有効にするとエラーが発生します。次のセクションでは、この設定パラメータを読み取り専用ユーザーでも利用できるようにする方法を説明します。


## 読み取り専用ユーザーで SQL 互換性設定を有効にする \{#readonly-users\}

`SqlCompatibilitySettings` パラメーターを有効にして ODBC ドライバー経由で ClickHouse に接続する場合、`readonly` 設定が `1` に設定されたユーザーは、ドライバーがクエリ設定を変更しようとするため、エラーが発生します。

```plaintext
Code: 164. DB::Exception: Cannot modify 'cast_keep_nullable' setting in readonly mode. (READONLY)
Code: 164. DB::Exception: Cannot modify 'prefer_column_name_to_alias' setting in readonly mode. (READONLY)
```

これは、読み取り専用モードのユーザーは、個々の `SELECT` クエリであっても設定を変更することが許可されていないために発生します。
これを解決する方法はいくつかあります。

**オプション 1. `readonly` を `2` に設定する**

これは最も簡単なオプションです。`readonly` を `2` に設定すると、ユーザーを読み取り専用モードのままに保ったまま、設定を変更できるようになります。

```sql
ALTER USER your_odbc_user MODIFY SETTING
    readonly = 2
```

ほとんどの場合、この問題を解決する最も簡単で推奨される方法は、`readonly` を 2 に設定することです。それで問題が解決しない場合は、2 つ目のオプションを使用してください。

**オプション 2. ユーザー設定を、ODBC ドライバーによって設定される内容に合わせて変更する。**

これも同様に簡単です。ODBC ドライバーが設定しようとする内容とあらかじめ一致するように、ユーザー設定を更新します。

```sql
ALTER USER your_odbc_user MODIFY SETTING
    cast_keep_nullable = 1,
    prefer_column_name_to_alias = 1
```

この変更により、ODBC ドライバーは引き続き `settings` を適用しようとしますが、値がすでに一致しているため、
実質的な変更は行われず、エラーを回避できます。

このオプションもシンプルですが、メンテナンスが必要になります。新しいドライバーのバージョンでは、互換性のために
`settings` の一覧が変更されたり、新しいものが追加されたりする可能性があります。これらの `settings` を ODBC 用のユーザーに
ハードコードしている場合、ODBC ドライバーが追加の `settings` を適用し始めるたびに、それらを更新する必要が生じます。
