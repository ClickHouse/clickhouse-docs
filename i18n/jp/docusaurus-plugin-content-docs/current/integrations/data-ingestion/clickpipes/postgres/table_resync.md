---
title: '特定テーブルの再同期'
description: 'Postgres ClickPipe で特定のテーブルを再同期する'
slug: /integrations/clickpipes/postgres/table_resync
sidebar_label: 'テーブルの再同期'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'インジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# 特定のテーブルの再同期 {#resync-tables}

パイプ内の特定のテーブルを再同期できると便利なケースがあります。例としては、Postgres 上での大規模なスキーマ変更や、ClickHouse 上でのデータ再モデリングなどが挙げられます。

ボタン操作で個々のテーブルを再同期する機能は現在開発中ですが、本ガイドでは、現時点で Postgres ClickPipe を用いて同様のことを行う手順を説明します。

### 1. パイプからテーブルを削除する {#removing-table}

この手順については、[テーブル削除ガイド](./removing_tables)に従ってください。

### 2. ClickHouse 上のテーブルを TRUNCATE または DROP する {#truncate-drop-table}

このステップは、次のステップでこのテーブルを再度追加する際にデータの重複を避けるためのものです。ClickHouse Cloud の **SQL Console** タブを開き、クエリを実行して実施します。
なお、ClickHouse に対象のテーブルがすでに存在していて、かつ空でない場合は、そのテーブルの追加をブロックするバリデーションが行われます。

### 3. ClickPipe にテーブルを再追加する {#add-table-again}

この手順については、[テーブル追加ガイド](./add_table)に従ってください。