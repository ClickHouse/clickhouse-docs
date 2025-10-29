---
'sidebar_label': 'DbVisualizer'
'slug': '/integrations/dbvisualizer'
'description': 'DbVisualizerはClickHouseを拡張サポートするデータベースツールです。'
'title': 'DbVisualizerをClickHouseに接続する'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# DbVisualizerをClickHouseに接続する

<CommunityMaintainedBadge/>

## 1. DbVisualizerを開始またはダウンロードする {#start-or-download-dbvisualizer}

DbVisualizerは以下から入手できます https://www.dbvis.com/download/

## 2. 接続詳細を収集する {#1-gather-your-connection-details}

<ConnectionDetails />

## 3. 組み込みのJDBCドライバ管理 {#2-built-in-jdbc-driver-management}

DbVisualizerにはClickHouse用の最新のJDBCドライバが含まれています。最新バージョンおよび履歴バージョンに対応した完全なJDBCドライバ管理機能が組み込まれています。

<Image img={dbvisualizer_driver_manager} size="lg" border alt="ClickHouse JDBCドライバの設定を表示するDbVisualizerドライバマネージャインターフェース" />

## 4. ClickHouseに接続する {#3-connect-to-clickhouse}

DbVisualizerを使用してデータベースに接続するには、最初にデータベース接続を作成し設定する必要があります。

1. **Database->Create Database Connection** から新しい接続を作成し、ポップアップメニューからデータベース用のドライバを選択します。

2. 新しい接続のための **Object View** タブが開きます。

3. **Name** フィールドに接続の名前を入力し、オプションで **Notes** フィールドに接続の説明を入力します。

4. **Database Type** は **Auto Detect** のままにします。

5. **Driver Type** に選択したドライバに緑のチェックマークが付いている場合、それは使用可能です。緑のチェックマークが付いていない場合は、**Driver Manager** でドライバを設定する必要があります。

6. 残りのフィールドにデータベースサーバーに関する情報を入力します。

7. **Ping Server** ボタンをクリックして、指定されたアドレスとポートに対してネットワーク接続を確立できるか確認します。

8. Ping Serverの結果がサーバーにアクセスできることを示している場合は、**Connect** をクリックしてデータベースサーバーに接続します。

:::tip
接続に問題がある場合は、[接続問題の修正](https://www.dbvis.com/docs/ug/troubleshooting/fixing-connection-issues/)に関するいくつかのヒントを参照してください。

## さらに学ぶ {#learn-more}

DbVisualizerに関するさらに詳しい情報は、[DbVisualizerドキュメント](https://www.dbvis.com/docs/ug/)を訪れてください。
