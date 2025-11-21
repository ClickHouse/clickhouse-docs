---
title: '特定テーブルの再同期'
description: 'Postgres ClickPipe で特定のテーブルを再同期する'
slug: /integrations/clickpipes/postgres/table_resync
sidebar_label: 'テーブルを再同期'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---



# 特定のテーブルの再同期 {#resync-tables}

パイプ内の特定のテーブルを再同期することが有用な場合があります。例えば、Postgresでの大規模なスキーマ変更や、ClickHouseでのデータ再モデリングなどが挙げられます。

ボタンクリックによる個別テーブルの再同期機能は現在開発中ですが、本ガイドではPostgres ClickPipeで現時点でこれを実現する手順を説明します。

### 1. パイプからテーブルを削除する {#removing-table}

[テーブル削除ガイド](./removing_tables)に従って実行してください。

### 2. ClickHouse上でテーブルをトランケートまたはドロップする {#truncate-drop-table}

この手順は、次のステップでテーブルを再度追加する際のデータ重複を回避するために必要です。ClickHouse Cloudの**SQLコンソール**タブに移動してクエリを実行することで行えます。
なお、テーブルがClickHouseに既に存在し、かつ空でない場合は、テーブル追加をブロックする検証が実装されています。

### 3. ClickPipeに再度テーブルを追加する {#add-table-again}

[テーブル追加ガイド](./add_table)に従って実行してください。
