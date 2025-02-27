---
sidebar_label: Power BI
slug: /integrations/powerbi
keywords: [ clickhouse, Power BI, connect, integrate, ui ]
description: Microsoft Power BI は、主にビジネスインテリジェンスに焦点を当てた Microsoft が開発したインタラクティブなデータビジュアライゼーションソフトウェア製品です。
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# Power BI

Microsoft Power BI は、[ClickHouse Cloud](https://clickhouse.com/cloud) またはセルフマネージド展開からデータをクエリまたはメモリにロードできます。

データを可視化するために使用できる Power BI のいくつかのバージョンがあります：

* Power BI Desktop: ダッシュボードとビジュアライゼーションを作成するための Windows デスクトップアプリケーション
* Power BI Service: Azure 内で利用可能な SaaS として、Power BI Desktop で作成したダッシュボードをホストします。

Power BI では、デスクトップ版でダッシュボードを作成し、それを Power BI Service に公開する必要があります。

このチュートリアルでは、以下のプロセスを案内します：

* [ClickHouse ODBC ドライバーのインストール](#install-the-odbc-driver)
* [Power BI Desktop に ClickHouse Power BI コネクタをインストール](#power-bi-installation)
* [Power BI Desktop での可視化のための ClickHouse からのデータクエリ](#query-and-visualise-data)
* [Power BI Service のためのオンプレミスデータゲートウェイの設定](#power-bi-service)

## 前提条件 {#prerequisites}

### Power BI インストール {#power-bi-installation}

このチュートリアルでは、Windows マシンに Microsoft Power BI Desktop がインストールされていることを前提としています。Power BI Desktop は [こちら](https://www.microsoft.com/en-us/download/details.aspx?id=58494) からダウンロードしてインストールできます。

Power BI の最新バージョンへの更新をお勧めします。ClickHouse コネクタは、バージョン `2.137.751.0` からデフォルトで利用可能です。

### ClickHouse 接続詳細の収集 {#gather-your-clickhouse-connection-details}

ClickHouse インスタンスに接続するために、以下の詳細が必要です：

* ホスト名 - ClickHouse 
* ユーザー名 - ユーザー認証情報
* パスワード - ユーザーのパスワード
* データベース - 接続したいインスタンスのデータベース名

## Power BI Desktop {#power-bi-desktop}

Power BI Desktop でデータをクエリする準備をするために、以下のステップを完了する必要があります：

1. ClickHouse ODBC ドライバーをインストールする
2. ClickHouse コネクタを探す
3. ClickHouse に接続する
4. データをクエリし、可視化する

### ODBC ドライバーのインストール {#install-the-odbc-driver}

最新の [ClickHouse ODBC リリース](https://github.com/ClickHouse/clickhouse-odbc/releases) をダウンロードします。

提供された `.msi` インストーラーを実行し、ウィザードに従います。

<img src={require('./images/powerbi_odbc_install.png').default} class="image" alt="ODBC ドライバーのインストール" style={{width: 
'50%', 'background-color': 'transparent'}}/>
<br/>

:::note
`デバッグシンボル` はオプションであり、必須ではありません。
:::

#### ODBC ドライバーの確認 {#verify-odbc-driver}

ドライバーのインストールが完了したら、次の手順でインストールが成功したかどうかを確認できます：

スタートメニューで ODBC を検索し、「ODBC データ ソース **(64-bit)**」を選択します。

<img src={require('./images/powerbi_odbc_search.png').default} class="image" alt="新しい ODBC データ ソースの作成"
style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

ClickHouse ドライバーがリストに表示されていることを確認します。

<img src={require('./images/powerbi_odbc_verify.png').default} class="image" alt="ODBC の存在を確認" style={{width: '50%', 
'background-color': 'transparent'}}/>
<br/>

### ClickHouse コネクタを探す {#find-the-clickhouse-connector}

:::note
Power BI Desktop のバージョン `2.137.751.0` で利用可能です。
:::
Power BI Desktop のスタート画面で、「データの取得」をクリックします。

<img src={require('./images/powerbi_get_data.png').default} class="image" alt="Power BI Desktop の開始"
style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

「ClickHouse」を検索します。

<img src={require('./images/powerbi_search_clickhouse.png').default} class="image" alt="データソースの選択" style={{width: 
'50%', 'background-color': 'transparent'}}/>
<br/>

### ClickHouse に接続する {#connect-to-clickhouse}

コネクタを選択し、ClickHouse インスタンスの認証情報を入力します：

* ホスト (必須) - あなたのインスタンス ドメイン/アドレス。プレフィックスやサフィックスなしで追加してください。
* ポート (必須) - あなたのインスタンスポート。
* データベース - あなたのデータベース名。
* オプション - [ClickHouse ODBC GitHub ページ](https://github.com/ClickHouse/clickhouse-odbc#configuration)にリストされている任意の ODBC オプション
* データ接続モード - DirectQuery

<img src={require('./images/powerbi_connect_db.png').default} class="image" alt="ClickHouse インスタンス情報の入力"
style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

:::note
ClickHouse を直接クエリする場合は、DirectQuery を選択することをお勧めします。

データが少量のユースケースがある場合は、インポートモードを選択でき、全データが Power BI にロードされます。
:::

* ユーザー名とパスワードを指定します。

<img src={require('./images/powerbi_connect_user.png').default} class="image" alt="ユーザー名とパスワードのプロンプト" style={{width:
'50%', 'background-color': 'transparent'}}/>
<br/>

### データをクエリし、可視化する {#query-and-visualise-data}

最後に、ナビゲータービューにデータベースとテーブルが表示されるはずです。目的のテーブルを選択し、「ロード」をクリックして ClickHouse からデータをインポートします。

<img src={require('./images/powerbi_table_navigation.png').default} class="image" alt="ナビゲータービュー" style={{width: '50%',
'background-color': 'transparent'}}/>
<br/>

インポートが完了すると、ClickHouse データは Power BI で通常通りアクセスできるようになります。
<br/>

## Power BI Service {#power-bi-service}

Microsoft Power BI Service を使用するには、[オンプレミスデータゲートウェイ](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem)を作成する必要があります。

カスタムコネクタの設定方法の詳細については、Microsoft のドキュメントを参照し、[オンプレミスデータゲートウェイでカスタムデータコネクタを使用する方法](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors)をご覧ください。

## ODBC ドライバー (インポート専用) {#odbc-driver-import-only}

ClickHouse コネクタを使用して DirectQuery を利用することをお勧めします。

オンプレミスデータゲートウェイインスタンスに [ODBC ドライバー](#install-the-odbc-driver)をインストールし、上記の手順に従って[確認](#verify-odbc-driver)してください。

### 新しいユーザー DSN を作成する {#create-a-new-user-dsn}

ドライバーのインストールが完了すると、ODBC データソースを作成できます。スタートメニューで ODBC を検索し、「ODBC データソース (64-bit)」を選択します。

<img src={require('./images/powerbi_odbc_search.png').default} class="image" alt="新しい ODBC データ ソースの作成"
style={{width: '40%', 'background-color': 'transparent'}}/>
<br/>

ここに新しいユーザー DSN を追加する必要があります。左側の「追加」ボタンをクリックします。

<img src={require('./images/powerbi_add_dsn.png').default} class="image" alt="新しいユーザー DSN の追加" style={{width: '40%', 
'background-color': 'transparent'}}/>
<br/>

ODBC ドライバーの Unicode バージョンを選択します。

<img src={require('./images/powerbi_select_unicode.png').default} class="image" alt="Unicode バージョンの選択" style={{width: 
'40%', 'background-color': 'transparent'}}/>
<br/>

接続詳細を入力します。 

<img src={require('./images/powerbi_connection_details.png').default} class="image" alt="接続詳細" style={{width: '30%', 
'background-color': 'transparent'}}/>
<br/>

:::note
SSL が有効な展開を使用している場合（例：ClickHouse Cloud またはセルフマネージドインスタンス）、`SSLMode` フィールドには `require` を指定する必要があります。

- `Host` には常にプロトコル（すなわち `http://` または `https://`）を省略してください。
- `Timeout` は秒を表す整数です。デフォルト値：`30 秒`。
:::note

### Power BI にデータを取り込む {#get-data-into-power-bi}

まだ Power BI をインストールしていない場合は、[Power BI Desktop をダウンロードしてインストール](https://www.microsoft.com/en-us/download/details.aspx?id=58494)してください。

Power BI Desktop のスタート画面で、「データの取得」をクリックします。

<img src={require('./images/powerbi_get_data.png').default} class="image" alt="Power BI Desktop の開始"
style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

「その他」->「ODBC」を選択します。

<img src={require('./images/powerbi_select_odbc.png').default} class="image" alt="データソース メニュー" style={{width: '50%', 
'background-color': 'transparent'}}/>
<br/>

リストから以前に作成したデータソースを選択します。

<img src={require('./images/powerbi_select_dsn.png').default} class="image" alt="ODBC データソースの選択" style={{width: 
'50%', 'background-color': 'transparent'}}/>
<br/>

:::note
データソースの作成時に認証情報を指定しなかった場合、ユーザー名とパスワードを指定するように求められます。
:::

<img src={require('./images/powerbi_dsn_credentials.png').default} class="image" alt="ナビゲータービュー" style={{width: '50%', 
'background-color': 'transparent'}}/>
<br/>

最後に、ナビゲータービューにデータベースとテーブルが表示されるはずです。目的のテーブルを選択し、「ロード」をクリックして ClickHouse からデータをインポートします。

<img src={require('./images/powerbi_table_navigation.png').default} class="image" alt="ナビゲータービュー" style={{width: '50%', 
'background-color': 'transparent'}}/>
<br/>

インポートが完了すると、ClickHouse データは Power BI で通常通りアクセスできるようになります。

## 知られている制限事項 {#known-limitations}

### UInt64 {#uint64}

UInt64 などの符号なし整数型は、Power BI がサポートする最大の整数型が Int64 であるため、データセットに自動的に読み込まれません。

:::note
データを正しくインポートするには、ナビゲータで「ロード」ボタンを押す前に、「データの変換」を先にクリックしてください。
:::

この例では、`pageviews` テーブルに UInt64 カラムがあり、デフォルトでは「バイナリ」として認識されます。
「データの変換」をクリックすると、Power Query エディターが開き、カラムの型を、例えばテキストとして再割り当てできます。

<img src={require('./images/powerbi_16.png').default} class="image" alt="ナビゲータービュー" style={{width: '50%', 
'background-color': 'transparent'}}/>
<br/>

完了したら、左上隅の「閉じる ＆ 適用」をクリックし、データのロードを進めます。
