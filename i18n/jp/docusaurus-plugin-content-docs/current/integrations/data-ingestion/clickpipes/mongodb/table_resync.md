---
title: '特定のテーブルの再同期'
description: 'MongoDB ClickPipe で特定のテーブルを再同期する'
slug: /integrations/clickpipes/mongodb/table_resync
sidebar_label: 'テーブルの再同期'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'CDC', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# 特定のテーブルの再同期 \{#resync-tables\}

特定のテーブルだけをパイプラインで再同期したいケースがあります。たとえば、MongoDB 上で大きなスキーマ変更を行った場合や、ClickHouse 上でデータモデリングを再設計した場合などが典型例です。

ボタン操作で個々のテーブルを再同期する機能は現在開発中ですが、このガイドでは、MongoDB ClickPipe で現時点から実施できる手順を説明します。

### 1. パイプからテーブルを削除する \{#removing-table\}

詳細な手順については、[テーブル削除ガイド](./removing_tables)に従ってください。

### 2. ClickHouse 上のテーブルを `TRUNCATE` または `DROP` する \{#truncate-drop-table\}

このステップは、次のステップでこのテーブルを再度追加する際にデータが重複しないようにするためのものです。ClickHouse Cloud の **SQL Console** タブを開き、クエリを実行することで実施できます。
テーブルがすでに ClickHouse に存在していて、かつ空でない場合は、そのテーブルを追加できないようにする検証処理がある点に注意してください。

### 3. テーブルを再度 ClickPipe に追加する \{#add-table-again\}

続いて、[テーブル追加ガイド](./add_table)に従ってください。