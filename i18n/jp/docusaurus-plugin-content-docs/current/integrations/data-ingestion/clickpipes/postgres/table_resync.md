---
title: '特定のテーブルの再同期'
description: 'Postgres ClickPipeにおける特定のテーブルの再同期'
slug: /integrations/clickpipes/postgres/table_resync
sidebar_label: 'テーブルの再同期'
---


# 特定のテーブルの再同期 {#resync-tables}

パイプの特定のテーブルを再同期することが有益なシナリオがあります。いくつかのサンプルユースケースとしては、Postgresでの大規模なスキーマ変更や、ClickHouseでのデータ再モデル化が考えられます。

ボタンをクリックして個々のテーブルを再同期する機能は開発中ですが、このガイドではPostgres ClickPipeで今日実現するための手順を共有します。

### 1. パイプからテーブルを削除する {#removing-table}

この手順は、[テーブル削除ガイド](./removing_tables)に従って行うことができます。

### 2. ClickHouseでテーブルをトランケートまたはドロップする {#truncate-drop-table}

このステップは、次のステップで再度このテーブルを追加する際のデータ重複を避けるためのものです。これを行うには、ClickHouse Cloudの**SQL Console**タブに移動し、クエリを実行してください。PeerDBがデフォルトでReplacingMergeTreeテーブルを作成するため、もしあなたのテーブルが小さく一時的な重複が問題ない場合は、このステップをスキップしても構いません。

### 3. 再度テーブルをClickPipeに追加する {#add-table-again}

この手順は、[テーブル追加ガイド](./add_table)に従って行うことができます。
