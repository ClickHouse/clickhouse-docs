---
sidebar_label: 'Power BI'
slug: '/integrations/powerbi'
keywords:
- 'clickhouse'
- 'Power BI'
- 'connect'
- 'integrate'
- 'ui'
description: 'Microsoft Power BIは、Microsoftによって開発された対話型のデータ可視化ソフトウェア製品で、ビジネスインテリジェンスを主眼に置いています。'
title: 'Power BI'
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

Microsoft Power BIは、[ClickHouse Cloud](https://clickhouse.com/cloud)またはセルフマネージドデプロイメントからデータをクエリしたり、メモリに読み込んだりすることができます。

データを可視化するために使用できるPower BIにはいくつかのバリエーションがあります。

* Power BI Desktop: ダッシュボードやビジュアライゼーションを作成するためのWindowsデスクトップアプリケーション
* Power BI Service: Power BI Desktopで作成したダッシュボードをホストするためのSaaSとしてAzure内で利用可能

Power BIでは、デスクトップ版でダッシュボードを作成し、それをPower BI Serviceに公開する必要があります。

このチュートリアルでは、以下のプロセスについてガイドします。

* [ClickHouse ODBCドライバのインストール](#install-the-odbc-driver)
* [Power BI DesktopへのClickHouse Power BIコネクタのインストール](#power-bi-installation)
* [Power BI Desktopでの可視化のためにClickHouseからデータをクエリする](#query-and-visualise-data)
* [Power BI Serviceのためのオンプレミスデータゲートウェイの設定](#power-bi-service)

## 前提条件 {#prerequisites}

### Power BIのインストール {#power-bi-installation}

このチュートリアルでは、WindowsマシンにMicrosoft Power BI Desktopがインストールされていることを前提としています。Power BI Desktopは[こちら](https://www.microsoft.com/en-us/download/details.aspx?id=58494)からダウンロードしてインストールできます。

Power BIの最新バージョンへの更新をお勧めします。ClickHouseコネクタはバージョン`2.137.751.0`からデフォルトで利用可能です。

### ClickHouse接続情報の収集 {#gather-your-clickhouse-connection-details}

ClickHouseインスタンスに接続するために、以下の情報が必要です。

* ホスト名 - ClickHouse
* ユーザー名 - ユーザーの資格情報
* パスワード - ユーザーのパスワード
* データベース - 接続したいインスタンスのデータベース名

## Power BI Desktop {#power-bi-desktop}

Power BI Desktopでデータをクエリするために、以下のステップを完了する必要があります。

1. ClickHouse ODBCドライバをインストールする
2. ClickHouseコネクタを探す
3. ClickHouseに接続する
4. データをクエリして可視化する

### ODBCドライバのインストール {#install-the-odbc-driver}

最新の[ClickHouse ODBCリリース](https://github.com/ClickHouse/clickhouse-odbc/releases)をダウンロードします。

提供された`.msi`インストーラーを実行し、ウィザードに従ってください。

<Image size="md" img={powerbi_odbc_install} alt="ClickHouse ODBCドライバインストールウィザードのインストールオプションを表示" border />
<br/>

:::note
`デバッグシンボル`はオプションであり、必須ではありません。
:::

#### ODBCドライバの確認 {#verify-odbc-driver}

ドライバのインストールが完了したら、次の手順でインストールが成功したかどうかを確認できます。

スタートメニューでODBCを検索し、「ODBCデータソース **(64ビット)**」を選択します。

<Image size="md" img={powerbi_odbc_search} alt="Windowsの検索結果にODBCデータソース (64ビット)オプションが表示される" border />
<br/>

ClickHouseドライバが一覧に表示されていることを確認します。

<Image size="md" img={powerbi_odbc_verify} alt="ODBCデータソース管理者がDriversタブでClickHouseドライバを表示" border />
<br/>

### ClickHouseコネクタを探す {#find-the-clickhouse-connector}

:::note
Power BI Desktopのバージョン`2.137.751.0`で利用可能
:::
Power BI Desktopのスタート画面で「データを取得」をクリックします。

<Image size="md" img={powerbi_get_data} alt="Power BI Desktopのホーム画面にデータを取得ボタンが表示" border />
<br/>

「ClickHouse」を検索します。

<Image size="md" img={powerbi_search_clickhouse} alt="Power BI データを取得ダイアログの検索バーにClickHouseを検索中" border />
<br/>

### ClickHouseに接続する {#connect-to-clickhouse}

コネクタを選択し、ClickHouseインスタンスの資格情報を入力します：

* ホスト（必須） - インスタンスのドメイン/アドレス。接頭辞/接尾辞なしで追加してください。
* ポート（必須） - インスタンスのポート。
* データベース - データベース名。
* オプション - [ClickHouse ODBC GitHubページ](https://github.com/ClickHouse/clickhouse-odbc#configuration)にリストされている任意のODBCオプション。
* データ接続モード - DirectQuery

<Image size="md" img={powerbi_connect_db} alt="ClickHouse接続ダイアログにホスト、ポート、データベースおよび接続モードフィールドが表示される" border />
<br/>

:::note
ClickHouseに直接クエリを行うためにDirectQueryを選択することをお勧めします。

データの量が少ないユースケースがある場合には、インポートモードを選択すると、すべてのデータがPower BIに読み込まれます。
:::

* ユーザー名とパスワードを指定します。

<Image size="md" img={powerbi_connect_user} alt="ユーザー名とパスワード用のClickHouse接続資格情報ダイアログ" border />
<br/>

### データをクエリして可視化する {#query-and-visualise-data}

最後に、ナビゲータビューにデータベースとテーブルが表示されるはずです。目的のテーブルを選択して「読み込む」をクリックし、ClickHouseからデータをインポートします。

<Image size="md" img={powerbi_table_navigation} alt="Power BIナビゲータビューにClickHouseデータベースのテーブルとサンプルデータが表示される" border />
<br/>

インポートが完了すると、ClickHouseデータは通常通りPower BIでアクセス可能になります。
<br/>

## Power BI Service {#power-bi-service}

Microsoft Power BI Serviceを使用するには、[オンプレミスデータゲートウェイ](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem)を作成する必要があります。

カスタムコネクタを設定する方法の詳細については、Microsoftのドキュメントを参照してください。[オンプレミスデータゲートウェイでカスタムデータコネクタを使用する方法](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors)をご覧ください。

## ODBCドライバ（インポートのみ） {#odbc-driver-import-only}

DirectQueryを使用するClickHouseコネクタの利用をお勧めします。

オンプレミスデータゲートウェイインスタンスに[ODBCドライバ](#install-the-odbc-driver)をインストールし、上記の手順に従って[確認](#verify-odbc-driver)します。

### 新しいユーザーDSNを作成する {#create-a-new-user-dsn}

ドライバのインストールが完了すると、ODBCデータソースを作成できます。スタートメニューでODBCを検索し、「ODBCデータソース (64ビット)」を選択します。

<Image size="md" img={powerbi_odbc_search} alt="Windowsの検索結果にODBCデータソース (64ビット)オプションが表示される" border />
<br/>

ここに新しいユーザーDSNを追加する必要があります。左側の「追加」ボタンをクリックします。

<Image size="md" img={powerbi_add_dsn} alt="新しいDSN作成のために追加ボタンが強調されたODBCデータソース管理者" border />
<br/>

ODBCドライバのUnicode版を選択します。

<Image size="md" img={powerbi_select_unicode} alt="新しいデータソースを作成するダイアログにClickHouse Unicodeドライバの選択肢が表示される" border />
<br/>

接続情報を入力します。

<Image size="sm" img={powerbi_connection_details} alt="接続パラメータのあるClickHouse ODBCドライバ設定ダイアログ" border />
<br/>

:::note
SSLが有効なデプロイ（例：ClickHouse Cloudまたはセルフマネージドインスタンス）を使用している場合は、`SSLMode`フィールドに`require`を指定する必要があります。

- `Host`には常にプロトコル（`http://`または`https://`）を省略する必要があります。
- `Timeout`は秒で表される整数です。デフォルト値：`30秒`。
:::

### Power BIにデータを取得する {#get-data-into-power-bi}

まだPower BIをインストールしていない場合は、[Power BI Desktopをダウンロードしてインストール](https://www.microsoft.com/en-us/download/details.aspx?id=58494)します。

Power BI Desktopのスタート画面で「データを取得」をクリックします。

<Image size="md" img={powerbi_get_data} alt="Power BI Desktopのホーム画面にデータを取得ボタンが表示" border />
<br/>

「その他」->「ODBC」を選択します。

<Image size="md" img={powerbi_select_odbc} alt="Power BIデータを取得ダイアログでその他カテゴリー内のODBCオプションを選択" border />
<br/>

リストから前に作成したデータソースを選択します。

<Image size="md" img={powerbi_select_dsn} alt="構成済みのClickHouse DSNを表示するODBCドライバ選択ダイアログ" border />
<br/>

:::note
データソース作成時に資格情報を指定しなかった場合、ユーザー名とパスワードを指定するように求められます。
:::

<Image size="md" img={powerbi_dsn_credentials} alt="ODBC DSN接続のための資格情報ダイアログ" border />
<br/>

最後に、ナビゲータビューにデータベースとテーブルが表示されるはずです。目的のテーブルを選択して「読み込む」をクリックし、ClickHouseからデータをインポートします。

<Image size="md" img={powerbi_table_navigation} alt="Power BIナビゲータビューにClickHouseデータベースのテーブルとサンプルデータが表示される" border />
<br/>

インポートが完了すると、ClickHouseデータは通常通りPower BIでアクセス可能になります。

## 既知の制限事項 {#known-limitations}

### UInt64 {#uint64}

UInt64やそれ以上の符号なし整数型は、自動的にデータセットに読み込まれないため、Int64がPower BIによってサポートされる最大の整数型です。

:::note
データを正しくインポートするには、ナビゲータで「読み込む」ボタンを押す前に「データを変換」をクリックしてください。
:::

この例では、`pageviews`テーブルにはUInt64カラムがあり、デフォルトでは「バイナリ」として認識されます。
「データの変換」をクリックするとPower Query Editorが開き、カラムの型を再割り当てすることができ、例えば、テキストとして設定できます。

<Image size="md" img={powerbi_16} alt="UInt64カラムのデータ型変換を表示するPower Query Editor" border />
<br/>

完了したら、左上隅の「閉じて適用」をクリックし、データの読み込みを続けます。
