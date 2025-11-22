---
description: 'ClickHouse におけるリソース使用量クォータの設定および管理に関するガイド'
sidebar_label: 'クォータ'
sidebar_position: 51
slug: /operations/quotas
title: 'クォータ'
doc_type: 'guide'
---

:::note ClickHouse Cloud におけるクォータ
クォータは ClickHouse Cloud でもサポートされていますが、作成には必ず [DDL 構文](/sql-reference/statements/create/quota) を使用する必要があります。以下で説明する XML 設定による方法は**サポートされていません**。
:::

クォータを使用すると、一定期間にわたるリソース使用量を制限したり、リソースの使用状況を追跡したりできます。
クォータはユーザー設定にて構成され、通常は &#39;users.xml&#39; に記述します。

システムには、単一クエリの複雑さを制限する機能もあります。詳細は [クエリの複雑さに関する制約](../operations/settings/query-complexity.md) セクションを参照してください。

クエリの複雑さに対する制約とは対照的に、クォータには次の特徴があります。

* 単一クエリを制限するのではなく、一定期間内に実行できるクエリの集合に対して制限を課します。
* 分散クエリ処理において、すべてのリモートサーバーで消費されたリソースを集計してカウントします。

以下では、クォータを定義している &#39;users.xml&#39; ファイルのセクションを見ていきます。

```xml
<!-- クォータ -->
<quotas>
    <!-- クォータ名 -->
    <default>
        <!-- 期間に対する制限。異なる制限を持つ複数のインターバルを設定できます。 -->
        <interval>
            <!-- インターバルの長さ -->
            <duration>3600</duration>

            <!-- 無制限。指定された時間インターバルのデータを収集するのみ。 -->
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

デフォルトでは、クォータは各時間ごとのリソース消費を追跡しますが、使用量を制限することはありません。
各時間区分で算出されたリソース消費量は、各リクエスト後にサーバーログへ出力されます。

```xml
<statbox>
    <!-- 期間に対する制限。異なる制限を持つ複数の間隔を設定できます。 -->
    <interval>
        <!-- 間隔の長さ。 -->
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

「statbox」クォータでは、1時間ごとおよび24時間ごと（86,400 秒）に制限が設定されます。時間間隔は、実装によって定義された固定時点からカウントされます。言い換えると、24時間の時間間隔は必ずしも真夜中から始まるとは限りません。

間隔が終了すると、収集されたすべての値はクリアされます。次の1時間については、クォータの計算がリセットされます。

制限対象となる項目は以下のとおりです：

`queries` – リクエストの総数。

`query_selects` – SELECT リクエストの総数。

`query_inserts` – INSERT リクエストの総数。

`errors` – 例外をスローしたクエリの数。

`result_rows` – 結果として返された行の総数。

`result_bytes` - 結果として返された行の総バイト数。

`read_rows` – すべてのリモートサーバーでクエリを実行するためにテーブルから読み取られたソース行の総数。

`read_bytes` - すべてのリモートサーバーでクエリを実行するためにテーブルから読み取られたデータの総バイト数。

`written_bytes` - 書き込み操作におけるデータの総バイト数。

`execution_time` – クエリの合計実行時間（秒単位、ウォールクロック時間）。

`failed_sequential_authentications` - 連続して発生した認証失敗の総数。


少なくとも 1 つの時間間隔で制限を超えた場合、どの制限がどの間隔について超過されたのか、さらに新しい間隔がいつ開始されるのか（再びクエリを送信できるタイミング）が記されたメッセージとともに、例外がスローされます。

クォータでは、「quota key」機能を使用して、複数のキーごとにリソースを独立してレポートできます。以下はその例です。

```xml
<!-- グローバルレポートデザイナー用 -->
<web_global>
    <!-- keyed – quota_key「key」がクエリパラメータで渡され、
            クォータは各キー値ごとに個別に追跡されます。
        例えば、キーとしてユーザー名を渡すことで、
            クォータはユーザー名ごとに個別にカウントされます。
        キーの使用は、quota_keyがユーザーではなくプログラムによって送信される場合にのみ有効です。

        <keyed_by_ip />と記述することもでき、その場合IPアドレスがクォータキーとして使用されます。
        (ただし、ユーザーはIPv6アドレスを比較的容易に変更できる点に留意してください。)
    -->
    <keyed />
```

クォータは、設定ファイルの &#39;users&#39; セクションでユーザーに割り当てられます。&quot;Access rights&quot; セクションを参照してください。

分散クエリ処理の場合、累積された値はリクエスト元サーバーに保存されます。そのため、ユーザーが別のサーバーに移動した場合、そのサーバーでのクォータは &quot;最初から&quot; カウントされます。

サーバーが再起動されると、クォータはリセットされます。


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseを使用したシングルページアプリケーションの構築](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)
