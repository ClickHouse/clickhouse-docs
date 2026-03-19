---
slug: /sql-reference/statements/create/dictionary/sources/local-file
title: 'ローカルファイル Dictionary ソース'
sidebar_position: 2
sidebar_label: 'ローカルファイル'
description: 'ClickHouse でローカルファイルを Dictionary のソースとして設定します。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ローカルファイルソースは、ローカルファイルシステム上のファイルから Dictionary データを読み込みます。これは、TSV、CSV などの形式、またはその他の[サポートされている形式](/sql-reference/formats)でフラットファイルとして保存できる、小規模で静的なルックアップテーブルに適しています。

設定例:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
    ```
  </TabItem>

  <TabItem value="xml" label="設定ファイル">
    ```xml
    <source>
      <file>
        <path>/opt/dictionaries/os.tsv</path>
        <format>TabSeparated</format>
      </file>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

設定項目:

| Setting  | 説明                                                                |
| -------- | ----------------------------------------------------------------- |
| `path`   | ファイルへの絶対パス。                                                       |
| `format` | ファイル形式。[Formats](/sql-reference/formats) で説明されているすべての形式がサポートされます。 |

ソースに `FILE` を指定した Dictionary を DDL コマンド（`CREATE DICTIONARY ...`）で作成する場合、ClickHouse ノード上の任意のファイルへ DB ユーザーがアクセスすることを防ぐため、ソースファイルは `user_files` ディレクトリ内に配置する必要があります。

**参照**

* [Dictionary 関数](/sql-reference/table-functions/dictionary)
