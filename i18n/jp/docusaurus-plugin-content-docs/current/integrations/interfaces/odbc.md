---
description: 'ClickHouse ODBC ドライバーのドキュメント'
sidebar_label: 'ODBC ドライバー'
sidebar_position: 35
slug: /interfaces/odbc
title: 'ODBC ドライバー'
doc_type: 'reference'
---

# ODBC ドライバー {#odbc-driver}

ClickHouse ODBC ドライバーは、ODBC 互換アプリケーションを ClickHouse に接続するための、標準に準拠したインターフェイスを提供します。ODBC API を実装しており、アプリケーション、BI ツール、およびスクリプト実行環境から SQL クエリを実行し、結果を取得し、慣れ親しんだ仕組みで ClickHouse と対話できるようにします。

このドライバーは、[HTTP プロトコル](/interfaces/http) を使用して ClickHouse サーバーと通信します。これは、すべての ClickHouse デプロイメントでサポートされている主要なプロトコルです。これにより、ローカルインストール、クラウドマネージドサービス、HTTP ベースのアクセスのみが利用可能な環境など、多様な環境でドライバーを一貫して動作させることができます。

ドライバーのソースコードは、[ClickHouse-ODBC GitHub Repository](
https://github.com/ClickHouse/clickhouse-odbc) で入手できます。

:::tip
より高い互換性のため、ClickHouse サーバーをバージョン 24.11 以降に更新することを強く推奨します。
:::

:::note
このドライバーは現在も積極的に開発されています。一部の ODBC 機能はまだ完全には実装されていない可能性があります。現行バージョンは、基本的な接続性と中核となる ODBC 機能の提供に重点を置いており、追加機能は今後のリリースで提供される予定です。

皆様からのフィードバックは非常に重要であり、新機能や改善の優先順位付けに役立ちます。制約や不足している機能、予期しない動作に遭遇した場合は、観察内容や機能要望を https://github.com/ClickHouse/clickhouse-odbc/issues の issue tracker から共有してください。
:::

## Windows へのインストール {#installation-on-windows}

最新バージョンのドライバーは https://github.com/ClickHouse/clickhouse-odbc/releases/latest から入手できます。
このページから MSI インストーラーをダウンロードして実行し、表示される簡単なインストール手順に従ってください。

## テスト {#testing}

次の簡単な PowerShell スクリプトを実行して、ドライバーをテストできます。以下のテキストをコピーし、URL、ユーザー名、パスワードを設定してから、
PowerShell のコマンドプロンプトに貼り付けて実行してください。$reader.GetValue(0) を実行すると、ClickHouse
サーバーのバージョンが表示されるはずです。

```powershell
$url = "http://127.0.0.1:8123/"
$user = "default"
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


## 設定パラメータ {#configuration-parameters}

以下のパラメータは、ClickHouse ODBC ドライバーとの接続を確立する際によく使用される代表的な設定です。基本的な認証、接続時の動作、およびデータ処理オプションをカバーします。サポートされているパラメータの全一覧は、プロジェクトの GitHub ページ [https://github.com/ClickHouse/clickhouse-odbc](https://github.com/ClickHouse/clickhouse-odbc) で確認できます。

* `Url`: ClickHouse サーバーの完全な HTTP(S) エンドポイントを指定します。プロトコル、ホスト、ポート、および省略可能なパスを含みます。
* `Username`: ClickHouse サーバーでの認証に使用されるユーザー名です。
* `Password`: 指定されたユーザー名に関連付けられたパスワードです。指定しない場合、ドライバーはパスワード認証なしで接続します。
* `Database`: 接続に使用するデフォルトのデータベースです。
* `Timeout`: ドライバーがリクエストを中止する前に、サーバーからの応答を待機する最大時間（秒）です。
* `ClientName`: クライアントメタデータの一部として ClickHouse サーバーに送信されるカスタム識別子です。トレースや異なるアプリケーションからのトラフィックを識別するのに有用です。このパラメータは、ドライバーが送信する HTTP リクエストの User-Agent ヘッダーの一部になります。
* `Compression`: リクエストおよびレスポンスのペイロードに対する HTTP 圧縮を有効または無効にします。有効にすると、大きな結果セットに対して帯域幅の使用量を削減し、パフォーマンスを向上させることができます。

以下は、接続を設定するためにドライバーに渡す完全な接続文字列の例です。

* WSL インスタンス上にローカルにインストールされた ClickHouse サーバー

```plaintext
Driver={ClickHouse ODBC Driver (Unicode)};Url=http://localhost:8123//;Username=default
```

* ClickHouse Cloud のインスタンス。

```plaintext
Driver={ClickHouse ODBC Driver (Unicode)};Url=https://you-instance-url.gcp.clickhouse.cloud:8443/;Username=default;Password=your-password
```


## Microsoft Power BI との統合 {#powerbi-Integration}

ODBC ドライバーを使用して、Microsoft Power BI を ClickHouse サーバーに接続できます。Power BI では 2 つの接続オプションを提供しており、いずれも標準の Power BI インストールに含まれています。1 つは汎用 ODBC Connector、もう 1 つは ClickHouse Connector です。

どちらのコネクタも内部的には ODBC を使用しますが、対応機能が異なります。

- ClickHouse Connector（推奨）
  内部的に ODBC を使用しますが、DirectQuery モードをサポートします。このモードでは、Power BI が自動的に SQL クエリを生成し、各ビジュアライゼーションやフィルター操作に必要なデータのみを取得します。

- ODBC Connector
  Import モードのみをサポートします。Power BI はユーザーが指定したクエリを実行（またはテーブル全体を選択）し、結果セット全体を Power BI にインポートします。その後の更新では、データセット全体が再インポートされます。

用途に応じてコネクタを選択してください。大規模なデータセットに対してインタラクティブなダッシュボードを構築・利用する場合は DirectQuery を、データの完全なローカルコピーが必要な場合は Import モードを使用します。

Microsoft Power BI と ClickHouse の統合の詳細については、[Power BI 連携に関する ClickHouse ドキュメントページ](http://localhost:3000/docs/integrations/powerbi)を参照してください。