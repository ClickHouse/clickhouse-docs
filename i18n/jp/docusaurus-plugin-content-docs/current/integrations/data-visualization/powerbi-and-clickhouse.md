---
sidebar_label: 'Power BI'
slug: /integrations/powerbi
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui']
description: 'Microsoft Power BI は、主にビジネス インテリジェンスを目的として Microsoft によって開発された対話型データ可視化ソフトウェア製品です。'
title: 'Power BI'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
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

# Power BI {#power-bi}

<ClickHouseSupportedBadge/>

Microsoft Power BI は、[ClickHouse Cloud](https://clickhouse.com/cloud) または自己管理型のデプロイメント環境からデータをクエリしたり、メモリ内にロードしたりできます。

データを可視化するために使用できる Power BI には、いくつかの形態があります。

* Power BI Desktop: ダッシュボードや可視化を作成するための Windows デスクトップアプリケーション
* Power BI Service: Power BI Desktop で作成したダッシュボードをホストするための SaaS として Azure 上で提供されるサービス

Power BI では、Desktop 版でダッシュボードを作成し、それを Power BI Service に公開する必要があります。

このチュートリアルでは、次の手順について説明します。

* [ClickHouse ODBC ドライバーをインストールする](#install-the-odbc-driver)
* [ClickHouse Power BI Connector を Power BI Desktop にインストールする](#power-bi-installation)
* [Power BI Desktop での可視化のために ClickHouse からデータをクエリする](#query-and-visualise-data)
* [Power BI Service 用のオンプレミス データ ゲートウェイをセットアップする](#power-bi-service)

## 前提条件 {#prerequisites}

### Power BI のインストール {#power-bi-installation}

このチュートリアルでは、Windows 環境に Microsoft Power BI Desktop がインストールされていることを前提とします。Power BI Desktop は[こちら](https://www.microsoft.com/en-us/download/details.aspx?id=58494)からダウンロードおよびインストールできます。

Power BI Desktop は最新バージョンに更新しておくことを推奨します。ClickHouse Connector は、バージョン `2.137.751.0` 以降でデフォルトで利用可能です。

### ClickHouse 接続情報の取得 {#gather-your-clickhouse-connection-details}

ClickHouse インスタンスに接続するには、次の情報が必要です。

* Hostname - ClickHouse
* Username - ユーザー名
* Password - ユーザーのパスワード
* Database - 接続対象インスタンス上のデータベース名

## Power BI desktop {#power-bi-desktop}

Power BI Desktop でデータのクエリを開始するには、次の手順を実行します。

1. ClickHouse ODBC ドライバをインストールする
2. ClickHouse コネクタを探す
3. ClickHouse に接続する
4. データをクエリおよび可視化する

### ODBC ドライバのインストール {#install-the-odbc-driver}

最新の [ClickHouse ODBC リリース](https://github.com/ClickHouse/clickhouse-odbc/releases)をダウンロードします。

提供されている `.msi` インストーラを実行し、ウィザードに従います。

<Image size="md" img={powerbi_odbc_install} alt="インストールオプションを表示している ClickHouse ODBC ドライバのインストールウィザード" border />
<br/>

:::note
`Debug symbols` は任意であり、必須ではありません。
:::

#### ODBC ドライバの確認 {#verify-odbc-driver}

ドライバのインストールが完了したら、次の手順でインストールが正常に完了したことを確認できます。

スタートメニューで ODBC を検索し、「ODBC Data Sources **(64-bit)**」を選択します。

<Image size="md" img={powerbi_odbc_search} alt="ODBC Data Sources (64-bit) オプションを表示している Windows の検索画面" border />
<br/>

ClickHouse ドライバが一覧に表示されていることを確認します。

<Image size="md" img={powerbi_odbc_verify} alt="Drivers タブで ClickHouse ドライバを表示している ODBC Data Source Administrator" border />
<br/>

### ClickHouse コネクタの検索 {#find-the-clickhouse-connector}

:::note
Power BI Desktop バージョン `2.137.751.0` で利用可能です。
:::
Power BI Desktop のスタート画面で、「Get Data」をクリックします。

<Image size="md" img={powerbi_get_data} alt="Get Data ボタンを表示している Power BI Desktop のホーム画面" border />
<br/>

「ClickHouse」を検索します。

<Image size="md" img={powerbi_search_clickhouse} alt="検索バーで ClickHouse を検索している Power BI の Get Data ダイアログ" border />
<br/>

### ClickHouse への接続 {#connect-to-clickhouse}

コネクタを選択し、ClickHouse インスタンスの認証情報を入力します。

* Host (必須) - インスタンスのドメイン/アドレス。プレフィックスやサフィックスを付けずに指定してください。
* Port (必須) - インスタンスのポート。
* Database - データベース名。
* Options - [ClickHouse ODBC GitHub ページ](https://github.com/ClickHouse/clickhouse-odbc#configuration)に記載されている任意の ODBC オプション。
* Data Connectivity mode - DirectQuery

<Image size="md" img={powerbi_connect_db} alt="ホスト、ポート、データベースおよび接続モードのフィールドを表示している ClickHouse 接続ダイアログ" border />
<br/>

:::note
ClickHouse に直接クエリする場合は、DirectQuery を選択することを推奨します。

データ量が少ないユースケースの場合は、インポート モードを選択することもでき、その場合はすべてのデータが Power BI に読み込まれます。
:::

* ユーザー名とパスワードを指定します。

<Image size="md" img={powerbi_connect_user} alt="ユーザー名とパスワードを入力する ClickHouse 接続認証情報ダイアログ" border />
<br/>

### データのクエリおよび可視化 {#query-and-visualise-data}

最後に、Navigator ビューにデータベースとテーブルが表示されます。目的のテーブルを選択し、「Load」をクリックして
ClickHouse からデータをインポートします。

<Image size="md" img={powerbi_table_navigation} alt="ClickHouse のデータベーステーブルとサンプルデータを表示している Power BI Navigator ビュー" border />
<br/>

インポートが完了すると、ClickHouse のデータは他のデータと同様に Power BI から利用できるようになります。
<br/>

## Power BI サービス {#power-bi-service}

Microsoft Power BI サービスを使用するには、[オンプレミス データ ゲートウェイ](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem) を作成する必要があります。

カスタム コネクタの設定方法の詳細については、Microsoft のドキュメント「[オンプレミス データ ゲートウェイでカスタム データ コネクタを使用する](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors)」を参照してください。

## ODBC ドライバー（インポート専用） {#odbc-driver-import-only}

DirectQuery を使用する ClickHouse Connector の使用を推奨します。

上記の手順に従って、オンプレミス データ ゲートウェイ インスタンスに [ODBC ドライバー](#install-the-odbc-driver) をインストールし、[検証](#verify-odbc-driver) してください。

### 新しいユーザー DSN を作成する {#create-a-new-user-dsn}

ドライバーのインストールが完了すると、ODBC データ ソースを作成できるようになります。スタート メニューで ODBC を検索し、「ODBC データ ソース (64 ビット)」を選択します。

<Image size="md" img={powerbi_odbc_search} alt="Windows 検索で「ODBC データ ソース (64 ビット)」オプションが表示されている画面" border />
<br/>

ここで新しいユーザー DSN を追加する必要があります。左側の「追加」ボタンをクリックします。

<Image size="md" img={powerbi_add_dsn} alt="新しい DSN 作成のために「追加」ボタンが強調表示されている ODBC データ ソース アドミニストレーター画面" border />
<br/>

ODBC ドライバーの Unicode バージョンを選択します。

<Image size="md" img={powerbi_select_unicode} alt="新しいデータ ソース作成ダイアログで ClickHouse Unicode Driver が選択されている画面" border />
<br/>

接続情報を入力します。

<Image size="sm" img={powerbi_connection_details} alt="接続パラメータが表示されている ClickHouse ODBC Driver 設定ダイアログ" border />
<br/>

:::note
SSL が有効なデプロイメント（例: ClickHouse Cloud やセルフマネージド インスタンス）を使用している場合は、`SSLMode` フィールドに `require` を指定する必要があります。

- `Host` には、常にプロトコル（`http://` や `https://`）を含めないでください。
- `Timeout` は秒数を表す整数です。既定値: `30 seconds`。
:::

### Power BI にデータを取り込む {#get-data-into-power-bi}

まだ Power BI をインストールしていない場合は、[Power BI Desktop をダウンロードしてインストール](https://www.microsoft.com/en-us/download/details.aspx?id=58494)してください。

Power BI Desktop の開始画面で「データの取得」をクリックします。

<Image size="md" img={powerbi_get_data} alt="Power BI Desktop ホーム画面で「データの取得」ボタンが表示されている画面" border />
<br/>

「その他」 -> 「ODBC」を選択します。

<Image size="md" img={powerbi_select_odbc} alt="Power BI の「データの取得」ダイアログで、［その他］カテゴリ内の ODBC オプションが選択されている画面" border />
<br/>

先ほど作成したデータ ソースを一覧から選択します。

<Image size="md" img={powerbi_select_dsn} alt="設定済みの ClickHouse DSN が表示されている ODBC ドライバー選択ダイアログ" border />
<br/>

:::note
データ ソース作成時に認証情報を指定していない場合は、ユーザー名とパスワードの入力を求められます。
:::

<Image size="md" img={powerbi_dsn_credentials} alt="ODBC DSN 接続用の認証情報ダイアログ" border />
<br/>

最終的に、ナビゲーター ビューにデータベースとテーブルが表示されます。目的のテーブルを選択し、「読み込み」をクリックして ClickHouse からデータをインポートします。

<Image size="md" img={powerbi_table_navigation} alt="ClickHouse のデータベース テーブルとサンプル データが表示されている Power BI ナビゲーター ビュー" border />
<br/>

インポートが完了すると、通常どおり Power BI から ClickHouse のデータにアクセスできるようになります。

## 既知の制限事項 {#known-limitations}

### UInt64 {#uint64}

UInt64 やそれより大きい符号なし整数型は、Power BI がサポートする最大の整数型が Int64 までであるため、自動的にはデータセットに読み込まれません。

:::note
データを正しくインポートするには、Navigator で「読み込み」ボタンを押す前に、「データの変換」を先にクリックしてください。
:::

この例では、`pageviews` テーブルに UInt64 列があり、既定では「バイナリ」として認識されています。
「データの変換」をクリックすると Power Query Editor が開き、そこで列の型を再設定し、たとえば
テキストとして設定できます。

<Image size="md" img={powerbi_16} alt="UInt64 列のデータ型変換を表示している Power Query Editor" border />
<br/>

変更が完了したら、左上隅の「閉じて適用」をクリックし、データの読み込みに進みます。
