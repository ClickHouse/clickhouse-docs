---
'description': 'ClickHouseでのリソース使用量のクォータの設定と管理に関するガイド'
'sidebar_label': 'Quotas'
'sidebar_position': 51
'slug': '/operations/quotas'
'title': 'クォータ'
'doc_type': 'guide'
---

:::note ClickHouse Cloudにおけるクォータ
クォータはClickHouse Cloudでサポートされていますが、[DDL構文](/sql-reference/statements/create/quota)を使用して作成する必要があります。以下に記載されているXML設定アプローチは**サポートされていません**。
:::

クォータは、一定の期間にわたるリソース使用量を制限したり、リソースの使用状況を追跡したりすることを可能にします。
クォータは、通常'users.xml'というユーザー設定内に設定されます。

システムには、単一のクエリの複雑性を制限する機能も備わっています。[クエリの複雑性に関する制限](../operations/settings/query-complexity.md)のセクションを参照してください。

クエリの複雑性制限とは対照的に、クォータは以下の点で異なります：

- 単一のクエリを制限するのではなく、一定の期間内に実行できるクエリのセットに制限を設けます。
- 分散クエリ処理のために、すべてのリモートサーバーで消費されたリソースを考慮します。

クォータを定義する'users.xml'ファイルのセクションを見てみましょう。

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

デフォルトでは、クォータはリソース消費を每時追跡し、使用量に制限を設けません。
各インターバルで計算されたリソース消費は、各リクエスト後にサーバーログに出力されます。

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

'statbox'クォータでは、毎時および毎24時間（86,400秒）に制限が設定されています。時間のインターバルは、実装に定義された固定の時点から数えられます。言い換えれば、24時間のインターバルは必ずしも真夜中から始まるわけではありません。

インターバルが終了すると、収集されたすべての値はクリアされます。次の時間に対して、クォータの計算は最初から始まります。

制限可能な量は以下の通りです：

`queries` – リクエストの総数。

`query_selects` – selectリクエストの総数。

`query_inserts` – insertリクエストの総数。

`errors` – 例外をスローしたクエリの数。

`result_rows` – 結果として与えられる行の総数。

`result_bytes` - 結果として与えられる行の総サイズ。

`read_rows` – すべてのリモートサーバーでクエリを実行するためにテーブルから読み込まれたソース行の総数。

`read_bytes` - すべてのリモートサーバーでクエリを実行するためにテーブルから読み込まれたデータの総サイズ。

`written_bytes` - 書き込み操作の総サイズ。

`execution_time` – クエリの総実行時間（秒、壁時間）。

`failed_sequential_authentications` - 連続した認証エラーの総数。

いずれかの時間インターバルの制限が超えられると、その制限が超えられたこと、そのインターバル、そして新しいインターバルがいつ始まり（クエリを再送信できる時間）、というテキストを持つ例外がスローされます。

クォータは「クォータキー」機能を使用して、複数のキーのリソースを独立して報告することができます。以下はその例です：

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

クォータは、設定の'users'セクションでユーザーに割り当てられます。「アクセス権」のセクションを参照してください。

分散クエリ処理のために、蓄積された量はリクエスターサーバーに保存されます。したがって、ユーザーが別のサーバーに移動した場合、そこのクォータは「最初からやり直し」になります。

サーバーが再起動すると、クォータがリセットされます。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseを使用したシングルページアプリケーションの構築](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)
