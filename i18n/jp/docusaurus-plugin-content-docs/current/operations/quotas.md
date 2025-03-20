---
slug: /operations/quotas
sidebar_position: 51
sidebar_label: クォータ
title: クォータ
---

クォータを使用すると、一定期間のリソース使用を制限したり、リソースの使用状況を追跡したりすることができます。  
クォータは通常、'users.xml'ファイルのユーザー設定で設定されます。

システムには、単一のクエリの複雑さを制限する機能もあります。[クエリの複雑さの制限](../operations/settings/query-complexity.md)のセクションを参照してください。

クエリの複雑さの制限とは対照的に、クォータは：

- 一定期間に実行できるクエリのセットに制限を設け、単一のクエリを制限するのではありません。
- 分散クエリ処理のために、すべてのリモートサーバーで消費されたリソースを考慮します。

ここでは、クォータを定義する 'users.xml' ファイルのセクションを見てみましょう。

``` xml
<!-- クォータ -->
<quotas>
    <!-- クォータ名。 -->
    <default>
        <!-- 時間の制限。異なる制限を持つ多くの間隔を設定できます。 -->
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

デフォルトでは、クォータはリソース消費を毎時追跡し、使用を制限しません。各間隔で計算されたリソース消費は、各リクエストの後にサーバーログに出力されます。

``` xml
<statbox>
    <!-- 時間の制限。異なる制限を持つ多くの間隔を設定できます。 -->
    <interval>
        <!-- 間隔の長さ。 -->
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
        <read_rows>500000000000</result_rows>
        <execution_time>7200</execution_time>
    </interval>
</statbox>
```

'statbox' クォータでは、毎時および毎24時間（86,400秒）の制限が設定されています。時間の間隔は、実装によって定義された固定の瞬間からカウントされます。言い換えれば、24時間の間隔は必ずしも真夜中から始まるわけではありません。

間隔が終了すると、収集されたすべての値はクリアされます。次の1時間の間、クォータ計算はゼロから始まります。

制限できる項目は以下の通りです：

`queries` – リクエストの総数。

`query_selects` – selectリクエストの総数。

`query_inserts` – insertリクエストの総数。

`errors` – 例外を投げたクエリの数。

`result_rows` – 結果として与えられた行の総数。

`read_rows` – すべてのリモートサーバーでクエリを実行するためにテーブルから読み取ったソース行の総数。

`execution_time` – クエリの総実行時間（秒単位）。

少なくとも1つの時間間隔で制限を超えた場合、どの制限が超過したか、どの間隔で、次の間隔がいつ始まるのか（再度クエリを送信できる時期）についてのテキストを伴って例外が発生します。

クォータは "quota key" 機能を使用して、複数のキーに対するリソースを独立して報告することができます。以下はその例です：

``` xml
<!-- グローバルレポートデザイナー用。 -->
<web_global>
    <!-- keyed – クォータキー "key" がクエリパラメータで渡され、
            各キーの値ごとにクォータが別々に追跡されます。
        例えば、ユーザー名をキーとして渡すことができ、
            これによりクォータは各ユーザー名ごとに計算されます。
        キーを使用するのは、プログラムによってクォータキーが伝えられる場合のみ意味があります。
        
        また、<keyed_by_ip /> と記述することもでき、IPアドレスがクォータキーとして使用されます。
        （ただし、ユーザーは比較的容易にIPv6アドレスを変更できることに注意してください。）
    -->
    <keyed />
```

クォータは、構成の 'users' セクションでユーザーに割り当てられます。「アクセス権」セクションを参照してください。

分散クエリ処理のために、蓄積された金額はリクエスターサーバーに保存されます。そのため、ユーザーが別のサーバーに移動すると、そこではクォータが「リセット」されます。

サーバーが再起動されると、クォータはリセットされます。
