---
sidebar_label: Power BI
slug: /integrations/powerbi
keywords: [ clickhouse, Power BI, connect, integrate, ui ]
description: Microsoft Power BIは、Microsoftが開発したインタラクティブなデータ視覚化ソフトウェア製品で、ビジネスインテリジェンスに主に焦点を当てています。
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import powerbi_odbc_install from '@site/static/images/integrations/data-visualization/powerbi_odbc_install.png';
import powerbi_odbc_search from '@site/static/images/integrations/data-visualization/powerbi_odbc_search.png';
import powerbi_odbc_verify from '@site/static/images/integrations/data-visualization/powerbi_odbc_verify.png';
import powerbi_get_data from '@site/static/images/integrations/data-visualization/powerbi_get_data.png';
import powerbi_search_clickhouse from '@site/static/images/integrations/data-visualization/powerbi_search_clickhouse.png';
import powerbi_connect_db from '@site/static/images/integrations/data-visualization/powerbi_connect_db.png';
import powerbi_connect_user from '@site/static/images/integrations/data-visualization/powerbi_connect_user.png';
import powerbi_table_navigation from '@site/static/images/integrations/data-visualization/powerbi_table_navigation.png';
import powerbi_add_dsn from '@site/static/images/integrations/data-visualization/powerbi_add_dsn.png';
import powerbi_select_unicode from '@site/static/images/integrations/data-visualization/powerbi_select_unicode.png';
import powerbi_connection_details from '@site/static/images/integrations/data-visualization/powerbi_connection_details.png';
import powerbi_select_odbc from '@site/static/images/integrations/data-visualization/powerbi_select_odbc.png';
import powerbi_select_dsn from '@site/static/images/integrations/data-visualization/powerbi_select_dsn.png';
import powerbi_dsn_credentials from '@site/static/images/integrations/data-visualization/powerbi_dsn_credentials.png';
import powerbi_16 from '@site/static/images/integrations/data-visualization/powerbi_16.png';


# Power BI

Microsoft Power BIは、[ClickHouse Cloud](https://clickhouse.com/cloud)またはセルフマネージドのデプロイメントからデータをクエリまたはメモリにロードできます。

データを視覚化するために使用できるPower BIのバリエーションはいくつかあります：

* Power BI Desktop: ダッシュボードと視覚化を作成するためのWindowsデスクトップアプリケーション
* Power BI Service: Power BI Desktopで作成したダッシュボードをホストするためにAzure内で利用可能なSaaS

Power BIでは、Desktopバージョンでダッシュボードを作成し、それをPower BI Serviceに公開する必要があります。

このチュートリアルでは、次のプロセスを案内します：

* [ClickHouse ODBCドライバーのインストール](#install-the-odbc-driver)
* [Power BI DesktopにClickHouse Power BIコネクタをインストール](#power-bi-installation)
* [Power BI DesktopでのClickHouseからのデータクエリと視覚化](#query-and-visualise-data)
* [Power BI Serviceのためのオンプレミスデータゲートウェイの設定](#power-bi-service)

## 前提条件 {#prerequisites}

### Power BIのインストール {#power-bi-installation}

このチュートリアルでは、WindowsマシンにMicrosoft Power BI Desktopがインストールされていると仮定しています。Power BI Desktopは[こちら](https://www.microsoft.com/en-us/download/details.aspx?id=58494)からダウンロードしてインストールできます。

Power BIの最新バージョンへの更新をお勧めします。ClickHouseコネクタはバージョン `2.137.751.0` からデフォルトで利用可能です。

### ClickHouse接続情報の収集 {#gather-your-clickhouse-connection-details}

ClickHouseインスタンスに接続するためには、以下の情報が必要です：

* ホスト名 - ClickHouse
* ユーザー名 - ユーザーの資格情報
* パスワード - ユーザーのパスワード
* データベース - 接続したいインスタンスのデータベース名

## Power BI Desktop {#power-bi-desktop}

Power BI Desktopでデータのクエリを始めるには、次のステップを完了する必要があります：

1. ClickHouse ODBCドライバーをインストール
2. ClickHouseコネクタを見つける
3. ClickHouseに接続
4. データをクエリし、視覚化する

### ODBCドライバーのインストール {#install-the-odbc-driver}

最新の[ClickHouse ODBCリリース](https://github.com/ClickHouse/clickhouse-odbc/releases)をダウンロードします。

提供された`.msi`インストーラーを実行し、ウィザードに従います。

<img src={powerbi_odbc_install} class="image" alt="ODBCドライバーのインストール" style={{width:
'50%', 'background-color': 'transparent'}}/>
<br/>

:::note
`デバッグシンボル`はオプションで、必須ではありません。
:::

#### ODBCドライバーの確認 {#verify-odbc-driver}

ドライバーのインストールが完了したら、以下の方法でインストールが成功したかを確認できます：

スタートメニューでODBCを検索し、「ODBCデータソース **(64-bit)**」を選択します。

<img src={powerbi_odbc_search} class="image" alt="新しいODBCデータソースの作成"
style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

ClickHouseドライバーがリストに表示されているか確認します。

<img src={powerbi_odbc_verify} class="image" alt="ODBCの存在確認" style={{width: '50%',
'background-color': 'transparent'}}/>
<br/>

### ClickHouseコネクタを見つける {#find-the-clickhouse-connector}

:::note
Power BI Desktopのバージョン `2.137.751.0` で利用可能
:::
Power BI Desktopのスタート画面で、「データを取得」をクリックします。

<img src={powerbi_get_data} class="image" alt="Power BI Desktopの開始"
style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

「ClickHouse」を検索します。

<img src={powerbi_search_clickhouse} class="image" alt="データソースの選択" style={{width:
'50%', 'background-color': 'transparent'}}/>
<br/>

### ClickHouseに接続 {#connect-to-clickhouse}

コネクタを選択し、ClickHouseインスタンスの資格情報を入力します：

* ホスト (必須) - あなたのインスタンスのドメイン/アドレス。接頭辞や接尾辞を付けずに追加してください。
* ポート (必須) - あなたのインスタンスのポート。
* データベース - あなたのデータベース名。
* オプション - [ClickHouse ODBC GitHubページ](https://github.com/ClickHouse/clickhouse-odbc#configuration)に記載されている任意のODBCオプション
* データ接続モード - DirectQuery

<img src={powerbi_connect_db} class="image" alt="ClickHouseインスタンス情報の入力"
style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

:::note
ClickHouseに直接クエリを実行するにはDirectQueryを選択することをお勧めします。

データが少量の場合は、インポートモードを選択できます。そうすると、すべてのデータがPower BIにロードされます。
:::

* ユーザー名とパスワードを指定します。

<img src={powerbi_connect_user} class="image" alt="ユーザー名とパスワードの入力プロンプト" style={{width:
'50%', 'background-color': 'transparent'}}/>
<br/>

### データをクエリし、視覚化する {#query-and-visualise-data}

最後に、ナビゲータービューにデータベースとテーブルが表示されるはずです。希望するテーブルを選択し、「ロード」をクリックしてClickHouseからデータをインポートします。

<img src={powerbi_table_navigation} class="image" alt="ナビゲータービュー" style={{width: '50%',
'background-color': 'transparent'}}/>
<br/>

インポートが完了すると、ClickHouseデータは通常通りPower BIでアクセスできるようになります。
<br/>

## Power BI Service {#power-bi-service}

Microsoft Power BI Serviceを使用するには、[オンプレミスデータゲートウェイ](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem)を作成する必要があります。

カスタムコネクタの設定方法の詳細については、Microsoftのドキュメントを参照してください。[オンプレミスデータゲートウェイでのカスタムデータコネクタの使用方法](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors)を確認してください。

## ODBCドライバー (インポートのみ) {#odbc-driver-import-only}

DirectQueryを使用するClickHouseコネクタを使用することをお勧めします。

オンプレミスデータゲートウェイインスタンスに[ODBCドライバー](#install-the-odbc-driver)をインストールし、上記に記載されているように[確認](#verify-odbc-driver)します。

### 新しいユーザーDSNの作成 {#create-a-new-user-dsn}

ドライバーのインストールが完了すると、ODBCデータソースが作成できます。スタートメニューでODBCを検索し、「ODBCデータソース (64-bit)」を選択します。

<img src={powerbi_odbc_search} class="image" alt="新しいODBCデータソースの作成"
style={{width: '40%', 'background-color': 'transparent'}}/>
<br/>

ここで新しいユーザーDSNを追加する必要があります。左側の「追加」ボタンをクリックします。

<img src={powerbi_add_dsn} class="image" alt="新しいユーザーDSNの追加" style={{width: '40%',
'background-color': 'transparent'}}/>
<br/>

ODBCドライバーのUnicodeバージョンを選択します。

<img src={powerbi_select_unicode} class="image" alt="Unicodeバージョンの選択" style={{width:
'40%', 'background-color': 'transparent'}}/>
<br/>

接続情報を入力します。

<img src={powerbi_connection_details} class="image" alt="接続情報" style={{width: '30%',
'background-color': 'transparent'}}/>
<br/>

:::note
SSLが有効なデプロイメント (例: ClickHouse Cloudまたはセルフマネージドインスタンス) を使用している場合は、`SSLMode`フィールドに`require`を指定してください。

- `Host`には、必ずプロトコル（つまり、`http://`または`https://`）を省略してください。
- `Timeout`は整数で、秒数を表します。デフォルト値: `30秒`。
:::

### Power BIにデータを取り込む {#get-data-into-power-bi}

まだPower BIがインストールされていない場合は、[Power BI Desktopをダウンロードしてインストールします](https://www.microsoft.com/en-us/download/details.aspx?id=58494)。

Power BI Desktopのスタート画面で、「データを取得」をクリックします。

<img src={powerbi_get_data} class="image" alt="Power BI Desktopの開始"
style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

「その他」->「ODBC」を選択します。

<img src={powerbi_select_odbc} class="image" alt="データソースメニュー" style={{width: '50%',
'background-color': 'transparent'}}/>
<br/>

リストから以前に作成したデータソースを選択します。

<img src={powerbi_select_dsn} class="image" alt="ODBCデータソースの選択" style={{width:
'50%', 'background-color': 'transparent'}}/>
<br/>

:::note
データソースを作成する際に資格情報を指定しなかった場合、ユーザー名とパスワードを指定するように求められます。
:::

<img src={powerbi_dsn_credentials} class="image" alt="ナビゲータービュー" style={{width: '50%',
'background-color': 'transparent'}}/>
<br/>

最後に、ナビゲータービューにデータベースとテーブルが表示されるはずです。希望するテーブルを選択し、「ロード」をクリックしてClickHouseからデータをインポートします。

<img src={powerbi_table_navigation} class="image" alt="ナビゲータービュー" style={{width: '50%',
'background-color': 'transparent'}}/>
<br/>

インポートが完了すると、ClickHouseデータは通常通りPower BIでアクセスできるようになります。

## 既知の制限事項 {#known-limitations}

### UInt64 {#uint64}

UInt64などの符号なし整数型やそれ以上のサイズのものは、Power BIがサポートする最大の整数型であるInt64に自動的にロードされません。

:::note
データを正しくインポートするには、ナビゲーターボタンで「ロード」ボタンを押す前に、「データの変換」をクリックしてください。
:::

この例では、`pageviews`テーブルにはUInt64カラムがあり、デフォルトで「バイナリ」として認識されます。
「データの変換」をクリックすると、Power Queryエディタが開き、列の型を再割り当てすることができるため、例えば、テキストとして設定します。

<img src={powerbi_16} class="image" alt="ナビゲータービュー" style={{width: '50%',
'background-color': 'transparent'}}/>
<br/>

完了したら、左上隅の「閉じる & 適用」をクリックし、データのロードを続行します。
