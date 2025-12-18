---
description: 'ClickHouse におけるリソース使用クォータの設定と管理ガイド'
sidebar_label: 'クォータ'
sidebar_position: 51
slug: /operations/quotas
title: 'クォータ'
doc_type: 'guide'
---

:::note ClickHouse Cloud におけるクォータ
クォータは ClickHouse Cloud でサポートされていますが、[DDL 構文](/sql-reference/statements/create/quota) を使用して作成する必要があります。以下で説明する XML 設定方式は **サポートされていません**。
:::

クォータを使用すると、一定期間におけるリソース使用量を制限したり、リソースの使用状況を追跡したりできます。
クォータはユーザー設定ファイルで行い、通常は「users.xml」に記述します。

システムには、単一クエリの複雑さを制限するための機能もあります。詳しくは、[クエリの複雑さに関する制限](../operations/settings/query-complexity.md)のセクションを参照してください。

クエリ複雑性の制限とは対照的に、クォータには次のような特徴があります。

* 単一クエリを制限するのではなく、一定期間に実行できるクエリの集合に制限をかけます。
* 分散クエリ処理のために、すべてのリモートサーバーで消費されたリソースを計上します。

クォータを定義している「users.xml」ファイルの該当セクションを見てみましょう。

```xml
<!-- Quotas -->
<quotas>
    <!-- Quota name. -->
    <default>
        <!-- Restrictions for a time period. You can set many intervals with different restrictions. -->
        <interval>
            <!-- Length of the interval. -->
            <duration>3600</duration>

            <!-- Unlimited. Just collect data for the specified time interval. -->
            <queries>0</queries>
            <query_selects>0</query_selects>
            <query_inserts>0</query_inserts>
            <errors>0</errors>
            <result_rows>0</result_rows>
            <read_rows>0</read_rows>
            <execution_time>0</execution_time>
        </interval>
    </default>
```

デフォルトでは、クォータは各時間ごとのリソース消費量を追跡しますが、使用量を制限はしません。
各時間間隔で計算されたリソース消費量は、各リクエスト後にサーバーログへ出力されます。

```xml
<statbox>
    <!-- Restrictions for a time period. You can set many intervals with different restrictions. -->
    <interval>
        <!-- Length of the interval. -->
        <duration>3600</duration>

        <queries>1000</queries>
        <query_selects>100</query_selects>
        <query_inserts>100</query_inserts>
        <written_bytes>5000000</written_bytes>
        <errors>100</errors>
        <result_rows>1000000000</result_rows>
        <read_rows>100000000000</read_rows>
        <execution_time>900</execution_time>
        <failed_sequential_authentications>5</failed_sequential_authentications>
    </interval>

    <interval>
        <duration>86400</duration>

        <queries>10000</queries>
        <query_selects>10000</query_selects>
        <query_inserts>10000</query_inserts>
        <errors>1000</errors>
        <result_rows>5000000000</result_rows>
        <result_bytes>160000000000</result_bytes>
        <read_rows>500000000000</read_rows>
        <result_bytes>16000000000000</result_bytes>
        <execution_time>7200</execution_time>
    </interval>
</statbox>
```

&#39;statbox&#39; クォータでは、1時間ごとと 24時間ごと（86,400 秒）に制限が設定されます。時間間隔は、実装依存の固定された時点からの経過時間でカウントされます。つまり、24時間の間隔は必ずしも真夜中から始まるとは限りません。

間隔が終了すると、収集されたすべての値はクリアされます。次の1時間に対しては、クォータの計算が再びゼロから始まります。

制限を設定できる項目は次のとおりです。

`queries` – クエリの合計数。

`query_selects` – `select` クエリの合計数。

`query_inserts` – `insert` クエリの合計数。

`errors` – 例外をスローしたクエリの数。

`result_rows` – 結果として返された行数の合計。

`result_bytes` - 結果として返された行の合計サイズ。

`read_rows` – すべてのリモートサーバーでクエリを実行するためにテーブルから読み取られた元データ行数の合計。

`read_bytes` - すべてのリモートサーバーでクエリを実行するためにテーブルから読み取られたデータ量の合計。

`written_bytes` - 書き込み処理で出力されたデータ量の合計。

`execution_time` – クエリ実行時間の合計（秒、ウォールクロックタイム）。

`failed_sequential_authentications` - 連続して発生した認証エラーの合計回数。

少なくとも 1 つの時間間隔で制限を超過した場合、どの制限がどの間隔で超過されたか、さらに新しい時間間隔（再びクエリを送信できるようになるタイミング）がいつ開始するかについてのメッセージを含む例外がスローされます。

クォータは「quota key」機能を使用して、複数のキーごとにリソースを独立して集計・報告できます。以下はその例です。

```xml
<!-- For the global reports designer. -->
<web_global>
    <!-- keyed – The quota_key "key" is passed in the query parameter,
            and the quota is tracked separately for each key value.
        For example, you can pass a username as the key,
            so the quota will be counted separately for each username.
        Using keys makes sense only if quota_key is transmitted by the program, not by a user.

        You can also write <keyed_by_ip />, so the IP address is used as the quota key.
        (But keep in mind that users can change the IPv6 address fairly easily.)
    -->
    <keyed />
```

クォータは設定ファイルの&#39;users&#39;セクションでユーザーに割り当てられます。&quot;Access rights&quot; のセクションを参照してください。

分散クエリ処理では、累積値はリクエスト元サーバーに保存されます。そのため、ユーザーが別のサーバーへ移動した場合、そのサーバーでのクォータはゼロからカウントし直しになります。

サーバーを再起動すると、クォータはリセットされます。

## 関連コンテンツ {#related-content}

- ブログ記事: [ClickHouse でシングルページアプリケーションを構築する](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)
