---
description: 'ClickHouse のリソース使用量クォータの設定と管理ガイド'
sidebar_label: 'クォータ'
sidebar_position: 51
slug: '/operations/quotas'
title: 'クォータ'
---



:::note ClickHouse Cloud におけるクォータ
クォータは ClickHouse Cloud でサポートされていますが、[DDL 構文](/sql-reference/statements/create/quota)を使用して作成する必要があります。以下に記載された XML 設定アプローチは **サポートされていません**。
:::

クォータは、一定時間内のリソース使用量を制限したり、リソースの使用状況を追跡したりすることができます。
クォータは通常 'users.xml' というユーザー構成ファイルに設定されます。

システムには、単一のクエリの複雑さを制限する機能もあります。[クエリの複雑さに関する制限](../operations/settings/query-complexity.md)セクションを参照してください。

クエリの複雑さの制限に対して、クォータは次の点が異なります：

- 単一のクエリを制限するのではなく、一定期間内に実行できるクエリのセットに制限を設けます。
- 分散クエリ処理用のすべてのリモートサーバーで消費されたリソースを考慮します。

クォータを定義する 'users.xml' ファイルのセクションを見てみましょう。

```xml
<!-- クォータ -->
<quotas>
    <!-- クォータ名 -->
    <default>
        <!-- 時間帯に対する制限。異なる制限を持つ複数のインターバルを設定できます。 -->
        <interval>
            <!-- インターバルの長さ -->
            <duration>3600</duration>

            <!-- 無制限。指定された時間帯のデータを収集するだけです。 -->
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

デフォルトでは、クォータはリソース消費を各時間ごとに追跡し、使用量を制限しません。
各インターバルに対して計算されたリソース消費は、各リクエストの後にサーバーログに出力されます。

```xml
<statbox>
    <!-- 時間帯に対する制限。異なる制限を持つ複数のインターバルを設定できます。 -->
    <interval>
        <!-- インターバルの長さ -->
        <duration>3600</duration>

        <queries>1000</queries>
        <query_selects>100</query_selects>
        <query_inserts>100</query_inserts>
        <errors>100</errors>
        <result_rows>1000000000</result_rows>
        <read_rows>100000000000</result_rows>
        <execution_time>900</execution_time>
    </interval>

    <interval>
        <duration>86400</duration>

        <queries>10000</queries>
        <query_selects>10000</query_selects>
        <query_inserts>10000</query_inserts>
        <errors>1000</errors>
        <result_rows>5000000000</result_rows>
        <read_rows>500000000000</read_rows>
        <execution_time>7200</execution_time>
    </interval>
</statbox>
```

'statbox' クォータでは、毎時間および毎24時間（86,400秒）の制限が設定されています。時間インターバルは、実装に定義された固定の瞬間からカウントされます。言い換えれば、24時間のインターバルは必ずしも真夜中から始まるわけではありません。

インターバルが終了すると、収集されたすべての値はクリアされます。次の1時間のために、クォータ計算は再開始されます。

制限できる項目は次の通りです：

`queries` – リクエストの総数。

`query_selects` – SELECT リクエストの総数。

`query_inserts` – INSERT リクエストの総数。

`errors` – 例外を投げたクエリの数。

`result_rows` – 結果として返された行の総数。

`read_rows` – すべてのリモートサーバーでクエリを実行するためにテーブルから読み取られたソース行の総数。

`execution_time` – 総クエリ実行時間（秒数、ウォールタイム）。

1つ以上の時間インターバルで制限を超過した場合、どの制限が超過したのか、どのインターバルで、そして新しいインターバルがいつ始まるのか（クエリを再び送信できる時期）についてのテキストを含む例外が発生します。

クォータは "quota key" 機能を使用して、複数のキーのリソースを独立して報告することができます。次はその例です：

```xml
<!-- グローバルレポートデザイナーのために -->
<web_global>
    <!-- keyed – クォータキー "key" がクエリパラメータとして渡され、
            各キーの値ごとにクォータが別々に追跡されます。
        例えば、ユーザー名をキーとして渡すことができ、
            それに対してクォータが個別にカウントされます。
        キーを使用する意味は、プログラムによってクォータキーが送信される場合にのみ、ユーザーによってではありません。

        <keyed_by_ip /> を書くこともできるため、IP アドレスをクォータキーとして使用します。
        （ただし、ユーザーが IPv6 アドレスを非常に簡単に変更できることを考慮してください。）
    -->
    <keyed />
```

クォータは、構成の 'users' セクションでユーザーに割り当てられます。"アクセス権" セクションを参照してください。

分散クエリ処理の場合、蓄積された量はリクエスターサーバーに保存されます。したがって、ユーザーが別のサーバーに移動すると、そのサーバーでのクォータは「再スタート」します。

サーバーが再起動されると、クォータはリセットされます。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse を使ったシングルページアプリケーションの構築](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)
