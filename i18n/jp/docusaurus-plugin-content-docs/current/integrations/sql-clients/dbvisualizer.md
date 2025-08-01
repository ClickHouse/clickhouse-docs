---
sidebar_label: 'DbVisualizer'
slug: '/integrations/dbvisualizer'
description: 'DbVisualizerはClickHouseに対する拡張サポートを備えたデータベースツールです。'
title: 'Connecting DbVisualizer to ClickHouse'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Connecting DbVisualizer to ClickHouse

<CommunityMaintainedBadge/>

## Start or download DbVisualizer {#start-or-download-dbvisualizer}

DbVisualizerはここから入手可能です: https://www.dbvis.com/download/

## 1. Gather your connection details {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Built-in JDBC driver management {#2-built-in-jdbc-driver-management}

DbVisualizerにはClickHouse用の最新のJDBCドライバが含まれています。最新のリリースや過去のバージョンにポイントする完全なJDBCドライバ管理機能が組み込まれています。

<Image img={dbvisualizer_driver_manager} size="lg" border alt="DbVisualizerのドライバマネージャインターフェイスがClickHouse JDBCドライバの設定を表示している" />

## 3. Connect to ClickHouse {#3-connect-to-clickhouse}

DbVisualizerでデータベースに接続するには、まずデータベース接続を作成して設定する必要があります。

1. **Database->Create Database Connection** から新しい接続を作成し、ポップアップメニューからデータベース用のドライバを選択します。

2. 新しい接続のために **Object View** タブが開かれます。

3. **Name** フィールドに接続の名前を入力し、オプションで **Notes** フィールドに接続の説明を入力します。

4. **Database Type** は **Auto Detect** のままにします。

5. **Driver Type** で選択したドライバに緑のチェックマークが付いていれば、使用可能です。チェックマークが付いていない場合は、**Driver Manager** でドライバを設定する必要があります。

6. 残りのフィールドにデータベースサーバに関する情報を入力します。

7. **Ping Server** ボタンをクリックして指定されたアドレスとポートにネットワーク接続が確立できるか確認します。

8. Ping Serverの結果がサーバに到達できることを示している場合は、**Connect** をクリックしてデータベースサーバに接続します。

:::tip
データベースへの接続に問題がある場合は、[Fixing Connection Issues](https://confluence.dbvis.com/display/UG231/Fixing+Connection+Issues)を参照してください。

## Learn more {#learn-more}

DbVisualizerに関する詳細情報は、[DbVisualizer documentation](https://confluence.dbvis.com/display/UG231/Users+Guide)をご覧ください。
