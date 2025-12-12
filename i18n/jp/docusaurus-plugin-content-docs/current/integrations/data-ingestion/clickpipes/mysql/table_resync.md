---
title: '特定テーブルの再同期'
description: 'MySQL ClickPipe で特定のテーブルを再同期する'
slug: /integrations/clickpipes/mysql/table_resync
sidebar_label: 'テーブルの再同期'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'データインジェスト', 'リアルタイム同期']
---



# 特定テーブルの再同期 {#resync-tables}

パイプ内の特定のテーブルだけを再同期したいケースがあります。たとえば、MySQL 側での大規模なスキーマ変更や、ClickHouse 側でのデータ再モデリングなどです。

ボタン操作で個別テーブルを再同期する機能は現在開発中ですが、このガイドでは、現時点で MySQL ClickPipe を使ってテーブルを再同期する手順を説明します。

### 1. パイプからテーブルを削除する {#removing-table}

[テーブル削除ガイド](./removing_tables) に従って実施してください。

### 2. ClickHouse 上のテーブルを TRUNCATE または DROP する {#truncate-drop-table}

このステップは、次のステップでテーブルを再度追加した際にデータが重複するのを防ぐためのものです。ClickHouse Cloud の **SQL Console** タブを開き、クエリを実行してください。
すでに ClickHouse 上にテーブルが存在し、かつ空でない場合はテーブル追加をブロックする検証が入っている点に注意してください。

### 3. テーブルを再度 ClickPipe に追加する {#add-table-again}

[テーブル追加ガイド](./add_table) に従ってテーブルを再追加してください。
