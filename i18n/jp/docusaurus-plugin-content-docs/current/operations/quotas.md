---
description: 'ClickHouseにおけるリソース使用制限の設定と管理に関するガイド'
sidebar_label: 'クォータ'
sidebar_position: 51
slug: /operations/quotas
title: 'クォータ'
---

:::note ClickHouse Cloudのクォータ
クォータはClickHouse Cloudでサポートされていますが、[DDL構文](/sql-reference/statements/create/quota)を使用して作成する必要があります。以下に文書化されているXML設定アプローチは**サポートされていません**。
:::

クォータは、特定の期間内のリソース使用を制限したり、リソースの使用状況を追跡したりすることを可能にします。クォータは通常、'users.xml'というユーザー構成ファイルに設定されます。

このシステムには、単一のクエリの複雑さを制限する機能もあります。[クエリの複雑さに関する制限](../operations/settings/query-complexity.md)のセクションを参照してください。

クエリの複雑さに関する制限と対照的に、クォータは次のようになります：

- 単一のクエリを制限するのではなく、特定の期間に実行できるクエリのセットに制限を設けます。
- 分散クエリ処理のために、すべてのリモートサーバーで消費されたリソースを考慮します。

クォータを定義する'users.xml'ファイルのセクションを見てみましょう。

```xml
<!-- クォータ -->
<quotas>
    <!-- クォタ名。 -->
    <default>
        <!-- 時間の期間に対する制限。異なる制限を持つ多数の間隔を設定できます。 -->
        <interval>
            <!-- 間隔の長さ。 -->
            <duration>3600</duration>

            <!-- 制限なし。指定された時間間隔のデータを収集するだけです。 -->
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

デフォルトでは、クォータはリソース消費を毎時追跡し、使用を制限しません。各間隔で計算されたリソース消費は、各リクエスト後にサーバーログに出力されます。

```xml
<statbox>
    <!-- 時間の期間に対する制限。異なる制限を持つ多数の間隔を設定できます。 -->
    <interval>
        <!-- 間隔の長さ。 -->
        <duration>3600</duration>

        <queries>1000</queries>
        <query_selects>100</query_selects>
        <query_inserts>100</query_inserts>
        <errors>100</errors>
        <result_rows>1000000000</result_rows>
        <read_rows>100000000000</read_rows>
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

'statbox'クォータでは、毎時間および毎24時間（86,400秒）の制限が設定されています。時間間隔は、実装によって定義された固定の時点からカウントされます。言い換えれば、24時間の間隔は必ずしも真夜中から始まるわけではありません。

間隔が終了すると、収集されたすべての値はクリアされます。次の1時間のために、クォータの計算は再スタートします。

制限可能な額は以下の通りです：

`queries` – リクエストの総数。

`query_selects` – SELECTリクエストの総数。

`query_inserts` – INSERTリクエストの総数。

`errors` – 例外を投げたクエリの数。

`result_rows` – 結果として与えられる行の総数。

`read_rows` – すべてのリモートサーバーでクエリを実行するためにテーブルから読み取ったソース行の総数。

`execution_time` – クエリの総実行時間（秒単位、ウォールタイム）。

いずれかの時間間隔で制限を超えると、どの制限が超えたか、どの間隔で、次の間隔がいつ始まるか（再びクエリを送信できる時期）に関するテキストが含まれる例外がスローされます。

クォータは「クォタキー」機能を使用して、複数のキーについて独立してリソースを報告することができます。以下はその例です：

```xml
<!-- グローバルレポートデザイナー用。 -->
<web_global>
    <!-- keyed – クォタキー "key" がクエリパラメータで渡され、
            各キー値ごとにクォータが個別に追跡されます。
        たとえば、ユーザー名をキーとして渡すことができ、
            それによりクォータは各ユーザー名ごとにカウントされます。
        キーを使用するのは、プログラムがクォタキーを伝達する場合にのみ意味があります。
        ユーザーによってではありません。

        <keyed_by_ip /> と書くこともでき、IPアドレスがクォタキーとして使用されます。
        （ただし、ユーザーはIPv6アドレスを非常に簡単に変更できることに注意してください。）
    -->
    <keyed />
```

クォータは構成の'users'セクションでユーザーに割り当てられます。「アクセス権」セクションを参照してください。

分散クエリ処理の場合、蓄積された額はリクエスタサーバーに保存されます。したがって、ユーザーが別のサーバーに移動すると、そこではクォータが「再スタート」します。

サーバーが再起動されると、クォータはリセットされます。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseを使用したシングルページアプリケーションの構築](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)
