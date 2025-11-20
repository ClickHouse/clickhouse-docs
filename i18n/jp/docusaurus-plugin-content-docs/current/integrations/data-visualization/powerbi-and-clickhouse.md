---
sidebar_label: 'Power BI'
slug: /integrations/powerbi
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui']
description: 'Microsoft Power BI は、ビジネス インテリジェンスに特化して Microsoft が開発した対話型のデータ可視化ソフトウェア製品です。'
title: 'Power BI'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
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

Microsoft Power BI は、[ClickHouse Cloud](https://clickhouse.com/cloud) またはセルフマネージド環境の ClickHouse からデータをクエリしたり、メモリ内に読み込んだりできます。

データを可視化するために利用できる Power BI には、いくつかの種類があります。

* Power BI Desktop: ダッシュボードとビジュアルを作成するための Windows デスクトップ アプリケーション
* Power BI Service: Power BI Desktop で作成したダッシュボードをホストするための、Azure 上で提供される SaaS サービス

Power BI では、Desktop 版でダッシュボードを作成し、それを Power BI Service に発行する必要があります。

このチュートリアルでは、次の手順について説明します。

* [ClickHouse ODBC Driver のインストール](#install-the-odbc-driver)
* [ClickHouse Power BI Connector を Power BI Desktop にインストール](#power-bi-installation)
* [Power BI Desktop での可視化のために ClickHouse からデータをクエリ](#query-and-visualise-data)
* [Power BI Service 用のオンプレミス データ ゲートウェイの設定](#power-bi-service)



## 前提条件 {#prerequisites}

### Power BI のインストール {#power-bi-installation}

このチュートリアルでは、Windows マシンに Microsoft Power BI Desktop がインストールされていることを前提としています。Power BI Desktop は[こちら](https://www.microsoft.com/en-us/download/details.aspx?id=58494)からダウンロードおよびインストールできます。

Power BI を最新バージョンに更新することを推奨します。ClickHouse Connector はバージョン `2.137.751.0` 以降でデフォルトで利用可能です。

### ClickHouse 接続情報の収集 {#gather-your-clickhouse-connection-details}

ClickHouse インスタンスに接続するには、以下の情報が必要です:

- ホスト名 - ClickHouse のホスト名
- ユーザー名 - ユーザー認証情報
- パスワード - ユーザーのパスワード
- データベース - 接続先インスタンス上のデータベース名


## Power BI Desktop {#power-bi-desktop}

Power BI Desktopでデータのクエリを開始するには、以下の手順を完了する必要があります：

1. ClickHouse ODBCドライバーをインストールする
2. ClickHouseコネクタを見つける
3. ClickHouseに接続する
4. データをクエリして可視化する

### ODBCドライバーのインストール {#install-the-odbc-driver}

最新の[ClickHouse ODBCリリース](https://github.com/ClickHouse/clickhouse-odbc/releases)をダウンロードします。

提供された`.msi`インストーラーを実行し、ウィザードに従います。

<Image
  size='md'
  img={powerbi_odbc_install}
  alt='インストールオプションを表示するClickHouse ODBCドライバーインストールウィザード'
  border
/>
<br />

:::note
`Debug symbols`はオプションであり、必須ではありません
:::

#### ODBCドライバーの確認 {#verify-odbc-driver}

ドライバーのインストールが完了したら、以下の方法でインストールが成功したことを確認できます：

スタートメニューでODBCを検索し、「ODBC データソース **(64ビット)**」を選択します。

<Image
  size='md'
  img={powerbi_odbc_search}
  alt='ODBCデータソース（64ビット）オプションを表示するWindows検索'
  border
/>
<br />

ClickHouseドライバーが一覧に表示されていることを確認します。

<Image
  size='md'
  img={powerbi_odbc_verify}
  alt='ドライバータブにClickHouseドライバーを表示するODBCデータソースアドミニストレーター'
  border
/>
<br />

### ClickHouseコネクタの検索 {#find-the-clickhouse-connector}

:::note
Power BI Desktopのバージョン`2.137.751.0`以降で利用可能
:::
Power BI Desktopのスタート画面で、「データを取得」をクリックします。

<Image
  size='md'
  img={powerbi_get_data}
  alt='データを取得ボタンを表示するPower BI Desktopホーム画面'
  border
/>
<br />

「ClickHouse」を検索します

<Image
  size='md'
  img={powerbi_search_clickhouse}
  alt='検索バーでClickHouseを検索したPower BIデータを取得ダイアログ'
  border
/>
<br />

### ClickHouseへの接続 {#connect-to-clickhouse}

コネクタを選択し、ClickHouseインスタンスの認証情報を入力します：

- Host（必須） - インスタンスのドメイン/アドレス。プレフィックスやサフィックスを付けずに追加してください。
- Port（必須） - インスタンスのポート。
- Database - データベース名。
- Options - [ClickHouse ODBC GitHubページ](https://github.com/ClickHouse/clickhouse-odbc#configuration)に記載されている任意のODBCオプション
- Data Connectivity mode - DirectQuery

<Image
  size='md'
  img={powerbi_connect_db}
  alt='ホスト、ポート、データベース、接続モードフィールドを表示するClickHouse接続ダイアログ'
  border
/>
<br />

:::note
ClickHouseに直接クエリを実行する場合は、DirectQueryを選択することを推奨します。

少量のデータを扱うユースケースの場合は、インポートモードを選択でき、すべてのデータがPower BIに読み込まれます。
:::

- ユーザー名とパスワードを指定します

<Image
  size='md'
  img={powerbi_connect_user}
  alt='ユーザー名とパスワードのためのClickHouse接続認証情報ダイアログ'
  border
/>
<br />

### データのクエリと可視化 {#query-and-visualise-data}

最後に、ナビゲータービューにデータベースとテーブルが表示されます。目的のテーブルを選択し、「読み込み」をクリックしてClickHouseからデータをインポートします。

<Image
  size='md'
  img={powerbi_table_navigation}
  alt='ClickHouseデータベーステーブルとサンプルデータを表示するPower BIナビゲータービュー'
  border
/>
<br />

インポートが完了すると、ClickHouseデータは通常通りPower BIでアクセス可能になります。

<br />


## Power BI service {#power-bi-service}

Microsoft Power BI Serviceを使用するには、[オンプレミス データ ゲートウェイ](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem)を作成する必要があります。

カスタムコネクタの設定方法の詳細については、Microsoftのドキュメント「[オンプレミス データ ゲートウェイでカスタム データ コネクタを使用する](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors)」を参照してください。


## ODBCドライバー(インポートのみ) {#odbc-driver-import-only}

DirectQueryを使用するClickHouse Connectorの利用を推奨します。

オンプレミスデータゲートウェイインスタンスに[ODBCドライバー](#install-the-odbc-driver)をインストールし、上記の手順に従って[検証](#verify-odbc-driver)を行ってください。

### 新しいユーザーDSNを作成する {#create-a-new-user-dsn}

ドライバーのインストールが完了したら、ODBCデータソースを作成できます。スタートメニューでODBCを検索し、「ODBC Data Sources (64-bit)」を選択します。

<Image
  size='md'
  img={powerbi_odbc_search}
  alt='ODBC Data Sources (64-bit)オプションを表示するWindowsの検索画面'
  border
/>
<br />

ここで新しいユーザーDSNを追加します。左側の「追加」ボタンをクリックしてください。

<Image
  size='md'
  img={powerbi_add_dsn}
  alt='新しいDSNを作成するための追加ボタンが強調表示されたODBCデータソースアドミニストレーター'
  border
/>
<br />

ODBCドライバーのUnicodeバージョンを選択します。

<Image
  size='md'
  img={powerbi_select_unicode}
  alt='ClickHouse Unicodeドライバーの選択を表示する新しいデータソースの作成ダイアログ'
  border
/>
<br />

接続の詳細を入力します。

<Image
  size='sm'
  img={powerbi_connection_details}
  alt='接続パラメーターを含むClickHouse ODBCドライバー設定ダイアログ'
  border
/>
<br />

:::note
SSLが有効なデプロイメント(ClickHouse Cloudやセルフマネージドインスタンスなど)を使用している場合、`SSLMode`フィールドには`require`を指定してください。

- `Host`にはプロトコル(`http://`または`https://`)を含めないでください。
- `Timeout`は秒数を表す整数です。デフォルト値: `30 seconds`。
  :::

### Power BIへのデータ取り込み {#get-data-into-power-bi}

Power BIをまだインストールしていない場合は、[Power BI Desktopをダウンロードしてインストール](https://www.microsoft.com/en-us/download/details.aspx?id=58494)してください。

Power BI Desktopのスタート画面で、「データを取得」をクリックします。

<Image
  size='md'
  img={powerbi_get_data}
  alt='データを取得ボタンを表示するPower BI Desktopのホーム画面'
  border
/>
<br />

「その他」→「ODBC」を選択します。

<Image
  size='md'
  img={powerbi_select_odbc}
  alt='その他カテゴリーでODBCオプションが選択されたPower BIのデータを取得ダイアログ'
  border
/>
<br />

リストから以前に作成したデータソースを選択します。

<Image
  size='md'
  img={powerbi_select_dsn}
  alt='設定されたClickHouse DSNを表示するODBCドライバー選択ダイアログ'
  border
/>
<br />

:::note
データソースの作成時に認証情報を指定しなかった場合、ユーザー名とパスワードの入力が求められます。
:::

<Image
  size='md'
  img={powerbi_dsn_credentials}
  alt='ODBC DSN接続の認証情報ダイアログ'
  border
/>
<br />

最後に、ナビゲータービューにデータベースとテーブルが表示されます。目的のテーブルを選択し、「読み込み」をクリックしてClickHouseからデータをインポートします。

<Image
  size='md'
  img={powerbi_table_navigation}
  alt='ClickHouseデータベースのテーブルとサンプルデータを表示するPower BIナビゲータービュー'
  border
/>
<br />

インポートが完了すると、ClickHouseデータは通常通りPower BIでアクセス可能になります。


## 既知の制限事項 {#known-limitations}

### UInt64 {#uint64}

UInt64以上の符号なし整数型は、Power BIがサポートする整数型の最大値がInt64であるため、データセットに自動的に読み込まれません。

:::note
データを適切にインポートするには、ナビゲーターで「読み込み」ボタンをクリックする前に、まず「データの変換」をクリックしてください。
:::

この例では、`pageviews`テーブルにUInt64型の列があり、デフォルトでは「バイナリ」として認識されます。
「データの変換」を選択するとPower Queryエディターが開き、列の型を再割り当てできます。たとえば、テキスト型に設定できます。

<Image
  size='md'
  img={powerbi_16}
  alt='UInt64列のデータ型変換を示すPower Queryエディター'
  border
/>
<br />

完了したら、左上隅の「閉じて適用」をクリックし、データの読み込みを続行します。
