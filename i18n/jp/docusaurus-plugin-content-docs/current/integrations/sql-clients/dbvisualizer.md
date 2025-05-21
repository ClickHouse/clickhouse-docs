---
sidebar_label: 'DbVisualizer'
slug: /integrations/dbvisualizer
description: 'DbVisualizerは、ClickHouseに対して拡張サポートを提供するデータベースツールです。'
title: 'DbVisualizerをClickHouseに接続する'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# DbVisualizerをClickHouseに接続する

<CommunityMaintainedBadge/>

## DbVisualizerの起動またはダウンロード {#start-or-download-dbvisualizer}

DbVisualizerはhttps://www.dbvis.com/download/で入手できます。

## 1. 接続情報を取得する {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. 内蔵JDBCドライバ管理 {#2-built-in-jdbc-driver-management}

DbVisualizerには、ClickHouse用の最新のJDBCドライバが含まれています。最新のリリースや過去のバージョンにポイントする完全なJDBCドライバ管理が内蔵されています。

<Image img={dbvisualizer_driver_manager} size="lg" border alt="ClickHouse JDBCドライバ設定を表示するDbVisualizerのドライバマネージャインターフェース" />

## 3. ClickHouseに接続する {#3-connect-to-clickhouse}

DbVisualizerでデータベースに接続するには、まずデータベース接続を作成および設定する必要があります。

1. **Database→Create Database Connection**から新しい接続を作成し、ポップアップメニューからデータベース用のドライバを選択します。

2. 新しい接続のために**Object View**タブが開きます。

3. **Name**フィールドに接続の名前を入力し、オプションで**Notes**フィールドに接続の説明を入力します。

4. **Database Type**は**Auto Detect**のままにします。

5. **Driver Type**で選択されたドライバが緑色のチェックマークでマークされている場合、それは使用する準備が整っています。緑色のチェックマークが付いていない場合は、**Driver Manager**でドライバを設定する必要があります。

6. 残りのフィールドにデータベースサーバーに関する情報を入力します。

7. **Ping Server**ボタンをクリックして、指定されたアドレスおよびポートへのネットワーク接続が確立できることを確認します。

8. Ping Serverの結果がサーバーに到達できることを示す場合は、**Connect**をクリックしてデータベースサーバーに接続します。

:::tip
データベースへの接続に問題がある場合は、[接続問題の修正](https://confluence.dbvis.com/display/UG231/Fixing+Connection+Issues)を参照してください。

## 詳しく学ぶ {#learn-more}

DbVisualizerに関する詳細情報は、[DbVisualizerのドキュメント](https://confluence.dbvis.com/display/UG231/Users+Guide)を訪れてください。
