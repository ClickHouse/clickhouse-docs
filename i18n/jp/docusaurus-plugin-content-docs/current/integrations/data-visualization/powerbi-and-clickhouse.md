---
sidebar_label: 'Power BI'
slug: /integrations/powerbi
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui']
description: 'Microsoft Power BIは、Microsoftが開発したインタラクティブなデータ視覚化ソフトウェア製品で、ビジネスインテリジェンスに主に焦点を当てています。'
title: 'Power BI'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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

Microsoft Power BIは、[ClickHouse Cloud](https://clickhouse.com/cloud)またはセルフマネージドデプロイメントからデータをクエリまたはメモリに読み込むことができます。

データを視覚化するために使用できるPower BIのいくつかのバリエーションがあります：

* Power BI Desktop: ダッシュボードや視覚化を作成するためのWindowsデスクトップアプリケーション
* Power BI Service: Power BI Desktopで作成したダッシュボードをホストするためのAzure内のSaaS

Power BIでは、デスクトップ版内でダッシュボードを作成し、それをPower BI Serviceに公開する必要があります。

このチュートリアルでは、次のプロセスを案内します：

* [ClickHouse ODBCドライバーのインストール](#install-the-odbc-driver)
* [Power BI DesktopにClickHouse Power BIコネクタをインストール](#power-bi-installation)
* [Power BI Desktopでの視覚化のためのClickHouseからのデータのクエリ](#query-and-visualise-data)
* [Power BI Serviceのためのオンプレミスデータゲートウェイの設定](#power-bi-service)

## Prerequisites {#prerequisites}

### Power BI Installation {#power-bi-installation}

このチュートリアルでは、WindowsマシンにMicrosoft Power BI Desktopがインストールされていることを前提としています。Power BI Desktopは[こちら](https://www.microsoft.com/en-us/download/details.aspx?id=58494)からダウンロードしてインストールできます。

最新バージョンのPower BIへのアップデートをお勧めします。ClickHouseコネクタはバージョン`2.137.751.0`からデフォルトで利用可能です。

### Gather your ClickHouse connection details {#gather-your-clickhouse-connection-details}

ClickHouseインスタンスに接続するために、次の詳細が必要です：

* ホスト名 - ClickHouse
* ユーザー名 - ユーザー認証情報
* パスワード - ユーザーのパスワード
* データベース - 接続したいインスタンス上のデータベース名

## Power BI Desktop {#power-bi-desktop}

Power BI Desktopでデータをクエリするために、次の手順を完了する必要があります：

1. ClickHouse ODBCドライバーをインストールする
2. ClickHouseコネクタを見つける
3. ClickHouseに接続する
4. データをクエリし、視覚化する

### Install the ODBC Driver {#install-the-odbc-driver}

最新の[ClickHouse ODBCリリース](https://github.com/ClickHouse/clickhouse-odbc/releases)をダウンロードします。

提供された`.msi`インストーラーを実行し、ウィザードに従ってください。

<Image size="md" img={powerbi_odbc_install} alt="ClickHouse ODBCドライバーインストールウィザードのインストールオプション" border />
<br/>

:::note
`デバッグシンボル`はオプションであり、必要ありません
:::

#### Verify ODBC Driver {#verify-odbc-driver}

ドライバーのインストールが完了したら、次の方法でインストールが成功したかを確認できます：

スタートメニューでODBCを検索し、「ODBCデータソース **(64-bit)**」を選択します。

<Image size="md" img={powerbi_odbc_search} alt="ODBC Data Sources (64-bit)オプションを表示するWindowsの検索" border />
<br/>

ClickHouseドライバーがリストに表示されていることを確認します。

<Image size="md" img={powerbi_odbc_verify} alt="ODBCデータソース管理者がドライバータブにClickHouseドライバーを表示" border />
<br/>

### Find the ClickHouse Connector {#find-the-clickhouse-connector}

:::note
Power BI Desktopのバージョン`2.137.751.0`で利用可能
:::
Power BI Desktopのスタート画面で、「データの取得」をクリックします。

<Image size="md" img={powerbi_get_data} alt="データの取得ボタンを表示するPower BI Desktopのホーム画面" border />
<br/>

「ClickHouse」と検索します。

<Image size="md" img={powerbi_search_clickhouse} alt="検索バーにClickHouseが検索されているPower BIのデータの取得ダイアログ" border />
<br/>

### Connect to ClickHouse {#connect-to-clickhouse}

コネクタを選択し、ClickHouseインスタンスの認証情報を入力します：

* ホスト（必須） - インスタンスのドメイン/アドレス。プレフィックス/サフィックスなしで追加してください。
* ポート（必須） - インスタンスのポート。
* データベース - データベース名。
* オプション - [ClickHouse ODBC GitHubページ](https://github.com/ClickHouse/clickhouse-odbc#configuration)に記載されている任意のODBCオプション
* データ接続モード - DirectQuery

<Image size="md" img={powerbi_connect_db} alt="ClickHouse接続ダイアログにホスト、ポート、データベース、接続モードフィールドが表示" border />
<br/>

:::note
ClickHouseに直接クエリを実行する場合は、DirectQueryを選択することをお勧めします。

データ量が少ないユースケースがある場合はインポートモードを選択すると、すべてのデータがPower BIに読み込まれます。
:::

* ユーザー名とパスワードを指定します。

<Image size="md" img={powerbi_connect_user} alt="ユーザー名とパスワード用のClickHouse接続資格情報ダイアログ" border />
<br/>

### Query and Visualise Data {#query-and-visualise-data}

最後に、ナビゲータービューにデータベースとテーブルが表示されるはずです。希望のテーブルを選択し、「読み込み」をクリックしてClickHouseからデータをインポートします。

<Image size="md" img={powerbi_table_navigation} alt="ClickHouseのデータベーステーブルとサンプルデータを表示するPower BIナビゲータービュー" border />
<br/>

インポートが完了すると、ClickHouseのデータは通常通りPower BIでアクセスできるようになります。
<br/>

## Power BI Service {#power-bi-service}

Microsoft Power BI Serviceを使用するには、[オンプレミスデータゲートウェイ](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem)を作成する必要があります。

カスタムコネクタのセットアップ方法については、Microsoftのドキュメントをご覧ください。 [オンプレミスデータゲートウェイでカスタムデータコネクタを使用する方法](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors)。

## ODBC Driver (Import Only) {#odbc-driver-import-only}

ClickHouse Connectorを使用してDirectQueryを利用することをお勧めします。

オンプレミスデータゲートウェイインスタンスに[ODBCドライバー](#install-the-odbc-driver)をインストールし、上記のように[確認](#verify-odbc-driver)してください。

### Create a new User DSN {#create-a-new-user-dsn}

ドライバーのインストールが完了したら、ODBCデータソースを作成できます。スタートメニューでODBCを検索し、「ODBCデータソース (64-bit)」を選択します。

<Image size="md" img={powerbi_odbc_search} alt="ODBC Data Sources (64-bit)オプションを表示するWindowsの検索" border />
<br/>

ここで新しいユーザーDSNを追加する必要があります。左側の「追加」ボタンをクリックします。

<Image size="md" img={powerbi_add_dsn} alt="新しいDSNを作成するために追加ボタンが強調表示されたODBCデータソース管理者" border />
<br/>

ODBCドライバーのUnicodeバージョンを選択します。

<Image size="md" img={powerbi_select_unicode} alt="ClickHouse Unicode Driverの選択を表示する新しいデータソースの作成ダイアログ" border />
<br/>

接続の詳細を入力してください。

<Image size="sm" img={powerbi_connection_details} alt="接続パラメータを表示するClickHouse ODBCドライバーの設定ダイアログ" border />
<br/>

:::note
SSLが有効なデプロイメント（例：ClickHouse Cloudまたはセルフマネージドインスタンス）を使用している場合は、`SSLMode`フィールドに`require`を指定する必要があります。

- `Host`には常にプロトコル（つまり、`http://`または`https://`）を省略してください。
- `Timeout`は秒数を表す整数です。デフォルト値：`30秒`。
:::

### Get Data Into Power BI {#get-data-into-power-bi}

まだPower BIをインストールしていない場合は、[Power BI Desktopをダウンロードしてインストール](https://www.microsoft.com/en-us/download/details.aspx?id=58494)してください。

Power BI Desktopのスタート画面で、「データの取得」をクリックします。

<Image size="md" img={powerbi_get_data} alt="データの取得ボタンを表示するPower BI Desktopのホーム画面" border />
<br/>

「その他」->「ODBC」を選択します。

<Image size="md" img={powerbi_select_odbc} alt="その他のカテゴリの下でODBCオプションが選択されているPower BIのデータの取得ダイアログ" border />
<br/>

リストから以前に作成したデータソースを選択します。

<Image size="md" img={powerbi_select_dsn} alt="構成されたClickHouse DSNを表示するODBCドライバー選択ダイアログ" border />
<br/>

:::note
データソース作成時に資格情報を指定しなかった場合、ユーザー名とパスワードを指定するように求められます。
:::

<Image size="md" img={powerbi_dsn_credentials} alt="ODBC DSN接続用の資格情報ダイアログ" border />
<br/>

最後に、ナビゲータービューにデータベースとテーブルが表示されるはずです。希望のテーブルを選択し、「読み込み」をクリックしてClickHouseからデータをインポートします。

<Image size="md" img={powerbi_table_navigation} alt="ClickHouseのデータベーステーブルとサンプルデータを表示するPower BIナビゲータービュー" border />
<br/>

インポートが完了すると、ClickHouseのデータは通常通りPower BIでアクセスできるようになります。

## Known Limitations {#known-limitations}

### UInt64 {#uint64}

UInt64などの符号なし整数型やそれ以上の型は、自動的にデータセットに読み込まれません。Power BIがサポートする最大の整数型はInt64です。

:::note
データを正しくインポートするためには、ナビゲーターで「読み込み」ボタンを押す前に、「データを変換」をクリックしてください。
:::

この例では、`pageviews`テーブルにUInt64カラムがあり、デフォルトで「バイナリ」として認識されます。
「データを変換」はPower Queryエディタを開き、カラムの型を再割り当てできます。例えば、テキストとして設定できます。

<Image size="md" img={powerbi_16} alt="UInt64カラムのデータ型変換を表示するPower Queryエディタ" border />
<br/>

完了したら、左上隅の「閉じる＆適用」をクリックし、データの読み込みを続行してください。
