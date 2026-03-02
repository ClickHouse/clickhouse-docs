---
description: '自動更新のための Dictionary LIFETIME 設定'
sidebar_label: 'LIFETIME'
sidebar_position: 5
slug: /sql-reference/statements/create/dictionary/lifetime
title: 'LIFETIME を使用した Dictionary データの更新'
doc_type: 'reference'
---

import CloudDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/sql-reference/statements/create/dictionary/_snippet_dictionary_in_cloud.md';

ClickHouse は `LIFETIME` タグ（秒単位で定義）に基づいて定期的に Dictionary を更新します。
`LIFETIME` は、フルダウンロード型 Dictionary に対する更新間隔であり、キャッシュ型 Dictionary に対する無効化間隔でもあります。

更新中でも、古いバージョンの Dictionary には引き続きクエリできます。
Dictionary の更新は、初回ロード時を除き、クエリをブロックしません。
更新中にエラーが発生した場合、そのエラーはサーバーログに書き込まれ、クエリは古いバージョンの Dictionary を使って継続できます。
Dictionary の更新が成功すると、古いバージョンの Dictionary は[アトミックに](/concepts/glossary#atomicity)置き換えられます。

設定例:

<CloudDetails />

```xml
<dictionary>
    ...
    <lifetime>300</lifetime>
    ...
</dictionary>
```

または

```sql
CREATE DICTIONARY (...)
...
LIFETIME(300)
...
```

`<lifetime>0</lifetime>` (`LIFETIME(0)`) を設定すると、Dictionary は更新されなくなります。

更新間隔を設定すると、ClickHouse はその範囲内から一様ランダムに時刻を選択します。これは、多数のサーバーで更新を行う際に、Dictionary のソースへの負荷を分散するために必要です。

設定例:

```xml
<dictionary>
    ...
    <lifetime>
        <min>300</min>
        <max>360</max>
    </lifetime>
    ...
</dictionary>
```

または

```sql
LIFETIME(MIN 300 MAX 360)
```

`<min>0</min>` と `<max>0</max>` の場合、ClickHouse はタイムアウトによる Dictionary の再読み込みを行いません。
この場合でも、Dictionary 設定ファイルが変更されたか、`SYSTEM RELOAD DICTIONARY` コマンドが実行された場合には、ClickHouse はそれより早く Dictionary を再読み込みできます。

Dictionary を更新する際、ClickHouse サーバーは [source](./sources/) の種類に応じて異なるロジックを適用します。

* テキストファイルの場合は、最終更新時刻をチェックします。時刻が以前に記録された時刻と異なる場合、Dictionary が更新されます。
* その他のソースからの Dictionary は、デフォルトでは毎回更新されます。

その他のソース (ODBC、PostgreSQL、ClickHouse など) では、毎回ではなく、実際に変更があった場合にのみ Dictionary を更新するクエリを設定できます。これを行うには、以下の手順に従います。

* Dictionary 用テーブルには、ソースデータが更新されるたびに必ず変化するフィールドが必要です。
* source の設定では、その変化するフィールドを取得するクエリを指定する必要があります。ClickHouse サーバーはクエリ結果を 1 行として解釈し、この行が以前の状態と比べて変化している場合に Dictionary を更新します。[source](./sources/) の設定内の `<invalidate_query>` フィールドにクエリを指定します。

設定例:

```xml
<dictionary>
    ...
    <odbc>
      ...
      <invalidate_query>SELECT update_time FROM dictionary_source where id = 1</invalidate_query>
    </odbc>
    ...
</dictionary>
```

または

```sql
...
SOURCE(ODBC(... invalidate_query 'SELECT update_time FROM dictionary_source where id = 1'))
...
```

`Cache`、`ComplexKeyCache`、`SSDCache`、および `SSDComplexKeyCache` の各 Dictionary では、同期更新と非同期更新の両方がサポートされています。

また、`Flat`、`Hashed`、`HashedArray`、`ComplexKeyHashed` の各 Dictionary では、前回の更新以降に変更されたデータのみを要求することも可能です。`update_field` が Dictionary のソース設定の一部として指定されている場合、前回の更新時刻（秒単位）の値がデータリクエストに追加されます。ソース種別（Executable、HTTP、MySQL、PostgreSQL、ClickHouse、または ODBC）に応じて、外部ソースからデータをリクエストする前に `update_field` に対して異なるロジックが適用されます。


* ソースが HTTP の場合、`update_field` はクエリパラメータとして追加され、その値には前回の更新時刻が設定されます。
* ソースが Executable の場合、`update_field` は実行スクリプトの引数として追加され、その値には前回の更新時刻が設定されます。
* ソースが ClickHouse、MySQL、PostgreSQL、ODBC の場合、`update_field` が前回の更新時刻以上であることを比較するための `WHERE` 句の追加部分が挿入されます。
  * 既定では、この `WHERE` 条件は SQL クエリの最上位レベルでチェックされます。代わりに、`{condition}` キーワードを使用することで、クエリ内の任意の他の `WHERE` 句でこの条件をチェックできます。例:
    ```sql
    ...
    SOURCE(CLICKHOUSE(...
        update_field 'added_time'
        QUERY '
            SELECT my_arr.1 AS x, my_arr.2 AS y, creation_time
            FROM (
                SELECT arrayZip(x_arr, y_arr) AS my_arr, creation_time
                FROM dictionary_source
                WHERE {condition}
            )'
    ))
    ...
    ```

`update_field` オプションが設定されている場合、追加オプションとして `update_lag` を設定できます。`update_lag` オプションの値は、更新されたデータをリクエストする前に、前回の更新時刻から減算されます。

設定例:

```xml
<dictionary>
    ...
        <clickhouse>
            ...
            <update_field>added_time</update_field>
            <update_lag>15</update_lag>
        </clickhouse>
    ...
</dictionary>
```

または

```sql
...
SOURCE(CLICKHOUSE(... update_field 'added_time' update_lag 15))
...
```
