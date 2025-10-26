---
'sidebar_label': 'Power BI'
'slug': '/integrations/powerbi'
'keywords':
- 'clickhouse'
- 'Power BI'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Microsoft Power BI は、ビジネスインテリジェンスに主に焦点を当てて開発された、Microsoft によるインタラクティブなデータ視覚化ソフトウェア製品です。'
'title': 'Power BI'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
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
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Power BI

<ClickHouseSupportedBadge/>

Microsoft Power BIは、[ClickHouse Cloud](https://clickhouse.com/cloud)またはセルフマネージドデプロイメントからデータをクエリするか、メモリにロードすることができます。

データを視覚化するために使用できるPower BIのいくつかのバージョンがあります：

* Power BI Desktop: ダッシュボードと視覚化を作成するためのWindowsデスクトップアプリケーション
* Power BI Service: Power BI Desktopで作成されたダッシュボードをホストするためのAzure内で利用可能なSaaS

Power BIでは、デスクトップ版でダッシュボードを作成し、Power BI Serviceに公開する必要があります。

このチュートリアルでは、以下のプロセスについて説明します：

* [ClickHouse ODBCドライバーのインストール](#install-the-odbc-driver)
* [Power BI DesktopへのClickHouse Power BIコネクタのインストール](#power-bi-installation)
* [Power BI Desktopでの視覚化のためのClickHouseからのデータのクエリ](#query-and-visualise-data)
* [Power BI Serviceのためのオンプレミスデータゲートウェイの設定](#power-bi-service)

## Prerequisites {#prerequisites}

### Power BI Installation {#power-bi-installation}

このチュートリアルでは、Microsoft Power BI DesktopがWindowsマシンにインストールされていることを前提としています。Power BI Desktopは[こちら](https://www.microsoft.com/en-us/download/details.aspx?id=58494)からダウンロードしてインストールできます。

Power BIの最新バージョンへのアップデートをお勧めします。ClickHouseコネクタはバージョン `2.137.751.0` から既定で利用可能です。

### Gather your ClickHouse connection details {#gather-your-clickhouse-connection-details}

ClickHouseインスタンスに接続するために、以下の詳細が必要です：

* ホスト名 - ClickHouse
* ユーザー名 - ユーザー資格情報
* パスワード - ユーザーのパスワード
* データベース - 接続したいインスタンスのデータベース名

## Power BI desktop {#power-bi-desktop}

Power BI Desktopでデータのクエリを開始するには、以下の手順を完了する必要があります：

1. ClickHouse ODBCドライバーをインストールする
2. ClickHouseコネクタを見つける
3. ClickHouseに接続する
4. データをクエリして視覚化する

### Install the ODBC Driver {#install-the-odbc-driver}

最新の[ClickHouse ODBCリリース](https://github.com/ClickHouse/clickhouse-odbc/releases)をダウンロードしてください。

提供された `.msi` インストーラーを実行し、ウィザードに従ってください。

<Image size="md" img={powerbi_odbc_install} alt="ClickHouse ODBCドライバーのインストールウィザードがインストールオプションを表示" border />
<br/>

:::note
`Debug symbols` はオプションであり、必須ではありません
:::

#### Verify ODBC driver {#verify-odbc-driver}

ドライバーのインストールが完了したら、以下の方法でインストールが成功したことを確認できます：

スタートメニューでODBCを検索し、「ODBCデータソース **(64-bit)**」を選択します。

<Image size="md" img={powerbi_odbc_search} alt="Windowsの検索で表示されているODBCデータソース (64-bit) オプション" border />
<br/>

ClickHouseドライバーがリストに表示されていることを確認します。

<Image size="md" img={powerbi_odbc_verify} alt="ODBCデータソース管理者がドライバータブでClickHouseドライバーを表示" border />
<br/>

### Find the ClickHouse Connector {#find-the-clickhouse-connector}

:::note
Power BI Desktopのバージョン `2.137.751.0` で利用可能
:::
Power BI Desktopのスタート画面で、「データの取得」をクリックします。

<Image size="md" img={powerbi_get_data} alt="データの取得ボタンが表示されたPower BI Desktopのホーム画面" border />
<br/>

「ClickHouse」で検索します。

<Image size="md" img={powerbi_search_clickhouse} alt="検索バーにClickHouseが検索されているPower BIのデータの取得ダイアログ" border />
<br/>

### Connect to ClickHouse {#connect-to-clickhouse}

コネクタを選択し、ClickHouseインスタンスの資格情報を入力します：

* ホスト (必須) - あなたのインスタンスのドメイン/アドレス。プレフィックス/サフィックスなしで追加してください。
* ポート (必須) - あなたのインスタンスのポート。
* データベース - あなたのデータベース名。
* オプション - [ClickHouse ODBC GitHubページ](https://github.com/ClickHouse/clickhouse-odbc#configuration)に記載されている任意のODBCオプション。
* データ接続モード - DirectQuery

<Image size="md" img={powerbi_connect_db} alt="ホスト、ポート、データベース、接続モードフィールドを表示したClickHouse接続ダイアログ" border />
<br/>

:::note
ClickHouseに直接クエリするためにDirectQueryを選択することをお勧めします。

データが少量のユースケースがある場合、インポートモードを選択し、すべてのデータがPower BIにロードされます。
:::

* ユーザー名とパスワードを指定します。

<Image size="md" img={powerbi_connect_user} alt="ユーザー名とパスワードのためのClickHouse接続資格情報ダイアログ" border />
<br/>

### Query and Visualise Data {#query-and-visualise-data}

最後に、ナビゲータービューにデータベースとテーブルが表示されるはずです。希望のテーブルを選択し、「ロード」をクリックしてClickHouseからデータをインポートします。

<Image size="md" img={powerbi_table_navigation} alt="ClickHouseデータベースのテーブルとサンプルデータを表示するPower BIナビゲータービュー" border />
<br/>

インポートが完了すると、あなたのClickHouseデータは通常通りPower BIでアクセス可能になります。
<br/>

## Power BI service {#power-bi-service}

Microsoft Power BI Serviceを使用するには、[オンプレミスデータゲートウェイ](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem)を作成する必要があります。

カスタムコネクタの設定方法の詳細については、Microsoftのドキュメントを参照して、オンプレミスデータゲートウェイでカスタムデータコネクタを[使用する方法](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors)を確認してください。

## ODBC driver (import only) {#odbc-driver-import-only}

DirectQueryを使用するClickHouseコネクタの使用をお勧めします。

[ODBCドライバー](#install-the-odbc-driver)をオンプレミスデータゲートウェイインスタンスにインストールし、上記の手順に従って[検証](#verify-odbc-driver)してください。

### Create a new User DSN {#create-a-new-user-dsn}

ドライバーのインストールが完了すると、ODBCデータソースを作成できます。スタートメニューでODBCを検索し、「ODBCデータソース (64-bit)」を選択します。

<Image size="md" img={powerbi_odbc_search} alt="新しいDSNを作成するための追加ボタンが強調表示されたODBCデータソース管理者" border />
<br/>

ここで新しいユーザーDSNを追加する必要があります。左側の「追加」ボタンをクリックします。

<Image size="md" img={powerbi_add_dsn} alt="新しいDSNを作成するための追加ボタンが強調表示されたODBCデータソース管理者" border />
<br/>

ODBCドライバーのUnicodeバージョンを選択します。

<Image size="md" img={powerbi_select_unicode} alt="ClickHouse Unicode Driver選択を表示する新しいデータソースの作成ダイアログ" border />
<br/>

接続詳細を入力します。

<Image size="sm" img={powerbi_connection_details} alt="接続パラメータを持つClickHouse ODBCドライバー設定ダイアログ" border />
<br/>

:::note
SSLが有効になっているデプロイメントを使用している場合（例：ClickHouse Cloudまたはセルフマネージドインスタンス）、`SSLMode`フィールドに `require`を指定する必要があります。

- `Host` には常にプロトコル（i.e. `http://` または `https://`）を省略する必要があります。
- `Timeout`は秒を表す整数です。デフォルト値: `30秒`。
:::

### Get data into Power BI {#get-data-into-power-bi}

Power BIがまだインストールされていない場合は、[Power BI Desktopをダウンロードしてインストール](https://www.microsoft.com/en-us/download/details.aspx?id=58494)してください。

Power BI Desktopのスタート画面で、「データの取得」をクリックします。

<Image size="md" img={powerbi_get_data} alt="データの取得ボタンが表示されたPower BI Desktopのホーム画面" border />
<br/>

「その他」->「ODBC」を選択します。

<Image size="md" img={powerbi_select_odbc} alt="その他のカテゴリの下でODBCオプションが選択されているPower BIのデータの取得ダイアログ" border />
<br/>

リストから以前作成したデータソースを選択します。

<Image size="md" img={powerbi_select_dsn} alt="構成されたClickHouse DSNを表示するODBCドライバー選択ダイアログ" border />
<br/>

:::note
データソース作成時に資格情報を指定しなかった場合、ユーザー名とパスワードを指定するように求められます。
:::

<Image size="md" img={powerbi_dsn_credentials} alt="ODBC DSN接続のための資格情報ダイアログ" border />
<br/>

最後に、ナビゲータービューにデータベースとテーブルが表示されるはずです。希望のテーブルを選択し、「ロード」をクリックしてClickHouseからデータをインポートします。

<Image size="md" img={powerbi_table_navigation} alt="ClickHouseデータベースのテーブルとサンプルデータを表示するPower BIナビゲータービュー" border />
<br/>

インポートが完了すると、あなたのClickHouseデータは通常通りPower BIでアクセス可能になります。

## Known limitations {#known-limitations}

### UInt64 {#uint64}

UInt64またはそれ以上の符号なし整数型は、Power BIでサポートされている最大の整数型であるInt64として自動的にデータセットにロードされないため、注意が必要です。

:::note
データを正しくインポートするには、ナビゲータで「ロード」ボタンを押す前に、「データの変換」をクリックしてください。
:::

この例では、`pageviews`テーブルにはUInt64カラムがあり、デフォルトでは「バイナリ」として認識されます。
「データの変換」をクリックするとPower Query Editorが開き、カラムのデータ型を再割り当てすることができます。例えば、テキスト型に変更します。

<Image size="md" img={powerbi_16} alt="UInt64カラムのデータ型変換を表示するPower Query Editor" border />
<br/>

完了したら、左上の「閉じる＆適用」をクリックし、データのロードを続行します。
