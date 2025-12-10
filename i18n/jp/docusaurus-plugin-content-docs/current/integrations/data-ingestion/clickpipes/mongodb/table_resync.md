---
title: '特定のテーブルの再同期'
description: 'MongoDB ClickPipe で特定のテーブルを再同期する'
slug: /integrations/clickpipes/mongodb/table_resync
sidebar_label: 'テーブルの再同期'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'データインジェスト', 'リアルタイム同期']
---



# 特定のテーブルの再同期 {#resync-tables}

パイプの特定のテーブルを再同期したいケースがあります。たとえば、MongoDB で大きなスキーマ変更を行った場合や、ClickHouse でデータモデリングをやり直した場合などが挙げられます。

ボタン操作だけで個別のテーブルを再同期する機能は現在開発中ですが、このガイドでは MongoDB ClickPipe を使って現時点でこれを実現する手順を説明します。

### 1. パイプからテーブルを削除する {#removing-table}

この手順については、[テーブル削除ガイド](./removing_tables)に従ってください。

### 2. ClickHouse 上のテーブルを TRUNCATE または DROP する {#truncate-drop-table}

次のステップでこのテーブルを再度追加した際に、データが重複しないようにするための手順です。ClickHouse Cloud の **SQL Console** タブを開き、クエリを実行してください。
テーブルがすでに ClickHouse 上に存在していて、かつ空でない場合には、そのテーブルの追加をブロックするためのバリデーションが入っている点に注意してください。

### 3. テーブルを再度 ClickPipe に追加する {#add-table-again}

この手順については、[テーブル追加ガイド](./add_table)に従ってください。
