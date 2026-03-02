---
title: '特定テーブルの再同期'
description: 'MySQL ClickPipe で特定テーブルを再同期する'
slug: /integrations/clickpipes/mysql/table_resync
sidebar_label: 'テーブルの再同期'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# 特定のテーブルを再同期する \{#resync-tables\}

特定のパイプ内テーブルを再同期したい状況があるかもしれません。ユースケースの例としては、MySQL 上での大規模なスキーマ変更や、ClickHouse 側でのデータ再モデリングなどが挙げられます。

個々のテーブルをボタン一つで再同期できる機能は現在開発中ですが、このガイドでは、現時点で MySQL ClickPipe においてこれを実現するための手順を説明します。

### 1. パイプからテーブルを削除する \{#removing-table\}

続いて、[テーブル削除ガイド](./removing_tables)に従ってください。

### 2. ClickHouse 上のテーブルを TRUNCATE または DROP する \{#truncate-drop-table\}

このステップは、次のステップでこのテーブルを再度追加する際にデータが重複しないようにするためのものです。これを行うには、ClickHouse Cloud の **SQL Console** タブに移動し、クエリを実行します。
テーブルがすでに ClickHouse に存在し、かつ空でない場合には、そのテーブルを追加できないようにする検証が行われる点に注意してください。

### 3. テーブルを再度 ClickPipe に追加する \{#add-table-again\}

以降の手順は、[テーブル追加ガイド](./add_table) に従って進めてください。