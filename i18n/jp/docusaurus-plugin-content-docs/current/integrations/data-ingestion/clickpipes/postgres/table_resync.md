---
title: '特定のテーブルの再同期'
description: 'Postgres ClickPipe で特定のテーブルを再同期する'
slug: /integrations/clickpipes/postgres/table_resync
sidebar_label: 'テーブルの再同期'
doc_type: 'guide'
keywords: ['clickpipes', 'PostgreSQL', 'CDC', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# 特定のテーブルを再同期する \{#resync-tables\}

特定のパイプ内のテーブルを再同期したい状況が発生することがあります。たとえば、Postgres 上で大きなスキーマ変更を行った場合や、ClickHouse 上でデータモデリングをやり直した場合などが想定されます。

個々のテーブルをボタン一つで再同期する機能は現在開発中ですが、このガイドでは、現時点で Postgres ClickPipe を使って同様のことを実現する手順を説明します。

### 1. パイプからテーブルを削除する \{#removing-table\}

続いて、[テーブル削除ガイド](./removing_tables) に従って作業を進めてください。

### 2. ClickHouse 上でテーブルを TRUNCATE するか DROP する \{#truncate-drop-table\}

次のステップでこのテーブルを再度追加する際に、データが重複するのを避けるための手順です。ClickHouse Cloud の **SQL Console** タブに移動し、クエリを実行することで実施できます。
すでに ClickHouse に同名のテーブルが存在していて空でない場合は、そのテーブルを追加できないように検証を行っている点に注意してください。

別の方法として、古いテーブルを保持しておく必要がある場合は、単に名前を変更することもできます。これはテーブルが非常に大きく、DROP 処理に時間がかかる可能性がある場合にも有用です。

```sql
RENAME TABLE table_A TO table_A_bak;
```


### 3. テーブルを再度 ClickPipe に追加する \{#add-table-again\}

以降の手順は、[テーブル追加ガイド](./add_table) に従って進めてください。