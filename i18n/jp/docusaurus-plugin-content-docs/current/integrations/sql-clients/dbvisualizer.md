---
sidebar_label: 'DbVisualizer'
slug: /integrations/dbvisualizer
description: 'DbVisualizer は ClickHouse を高度にサポートするデータベースツールです。'
title: 'DbVisualizer を ClickHouse に接続する'
keywords: ['DbVisualizer', 'database visualization', 'SQL client', 'JDBC driver', 'database tool']
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'sql_client'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# DbVisualizer から ClickHouse へ接続する

<CommunityMaintainedBadge/>



## DbVisualizerの起動またはダウンロード {#start-or-download-dbvisualizer}

DbVisualizerは https://www.dbvis.com/download/ から入手できます。


## 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. 組み込みJDBCドライバー管理 {#2-built-in-jdbc-driver-management}

DbVisualizerには、ClickHouse用の最新JDBCドライバーが含まれています。最新リリースだけでなく過去のバージョンも参照できる、完全なJDBCドライバー管理機能が組み込まれています。

<Image
  img={dbvisualizer_driver_manager}
  size='lg'
  border
  alt='ClickHouse JDBCドライバー設定を表示するDbVisualizerドライバーマネージャーのインターフェース'
/>


## 3. ClickHouse に接続する {#3-connect-to-clickhouse}

DbVisualizer でデータベースに接続するには、まずデータベース接続を作成して設定する必要があります。

1. **Database -> Create Database Connection** から新しい接続を作成し、ポップアップメニューからデータベース用のドライバーを選択します。

2. 新しい接続用の **Object View** タブが開きます。

3. **Name** フィールドに接続名を入力し、必要に応じて **Notes** フィールドに接続の説明を入力します。

4. **Database Type** は **Auto Detect** のままにしておきます。

5. **Driver Type** で選択したドライバーに緑色のチェックマークが付いていれば、そのまま使用できます。緑色のチェックマークが付いていない場合は、**Driver Manager** でドライバーを設定する必要がある場合があります。

6. 残りのフィールドに、データベースサーバーに関する情報を入力します。

7. **Ping Server** ボタンをクリックして、指定したアドレスおよびポートにネットワーク接続を確立できることを確認します。

8. Ping Server の結果でサーバーに到達できることが確認できたら、**Connect** をクリックしてデータベースサーバーに接続します。

:::tip
データベースへの接続で問題が発生した場合の対処方法については、[Fixing Connection Issues](https://www.dbvis.com/docs/ug/troubleshooting/fixing-connection-issues/) を参照してください。


## 詳細情報 {#learn-more}

DbVisualizerの詳細については、[DbVisualizerドキュメント](https://www.dbvis.com/docs/ug/)をご覧ください。
