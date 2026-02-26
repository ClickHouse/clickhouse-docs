---
sidebar_label: 'JDBC における日付・時刻値の扱い'
sidebar_position: 4
keywords: ['java', 'jdbc', 'driver', '連携', 'ガイド', 'Date', 'Time']
description: 'JDBC で日付・時刻値を扱うためのガイド'
slug: /integrations/language-clients/java/jdbc_date_time_guide
title: '日付・時刻値のガイド'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

# JDBC における Date、Time、Timestamp の扱い \{#working-with-date-time-and-timestamp-in-jdbc\}

Date、Time、Timestamp 型には、これらに関連する一般的な問題がいくつかあるため注意が必要です。
最もよくある問題は、タイムゾーンをどのように扱うかという点です。もう 1 つの問題は、文字列表現とその利用方法です。
そのほかにも、各データベースやドライバーには、それぞれ固有の仕様や制約があります。

このドキュメントは、タスクを示し、実装の詳細を説明し、問題点を解説することで、意思決定のためのガイドとなることを目的としています。

## タイムゾーン \{#timezones\}

タイムゾーンの扱いが難しいこと（夏時間やオフセットが頻繁に変わることなど）は周知のとおりです。しかし、このセクションで扱うのはタイムゾーンにまつわる別の問題、つまりタイムスタンプ文字列の表現とタイムゾーンの関係です。

### ClickHouse が DateTime 文字列を変換する方法 \{#clickhouse-datetime-string-conversion\}

ClickHouse は、`DateTime` 文字列値を変換する際に次のルールを使用します:

- カラムがタイムゾーン付きで定義されている場合（例: `DateTime64(9, ‘Asia/Tokyo’)`）、文字列値はそのタイムゾーンのタイムスタンプとして扱われます。`2026-01-01 13:00:00` は、`UTC` 時間では `2026-01-01 04:00:00` と解釈されます。
- カラムにタイムゾーンの定義がない場合、サーバーのタイムゾーンのみが使用されます。重要: `session_timezone` 設定には影響がありません。したがって、サーバーのタイムゾーンが `UTC` で、セッションのタイムゾーンが `America/Los_Angeles` の場合、`2026-01-01 13:00:00` は `UTC` 時間として書き込まれます。
- タイムゾーン定義のないカラムから値を読み取るときは、`session_timezone` が使用され、未設定の場合はサーバーのタイムゾーンが使用されます。そのため、タイムスタンプを文字列として読み取ると `session_timezone` の影響を受ける可能性があります。これは仕様上問題はありませんが、念頭に置いておく必要があります。

### タイムゾーンをまたいだタイムスタンプの書き込み \{#writing-timestamps-across-timezones\}

ここでは、ローカルタイムゾーンが `UTC-8` の `us-west` リージョンでアプリケーションが動作しており、ローカルタイムスタンプ `2026-01-01 02:00:00` を書き込む必要があるとします。このとき `UTC` では `2026-01-01 10:00:00` です:

- 文字列として書き込む場合、サーバーのタイムゾーンまたはカラムのタイムゾーンへ変換する必要があります。
- プログラミング言語ネイティブの時刻構造体として書き込む場合、ドライバーがターゲットのタイムゾーンを知っている必要がありますが、次の問題があります:
  - それが常に可能とは限らない
  - そのためのドライバー API の設計が十分ではない
  - 唯一の方法は、どのような変換が行われるかを明示し、アプリケーション側で補正できるようにすることです（もしくは Unix タイムスタンプを数値として書き込む）

### Java と JDBC の timestamp API \{#java-and-jdbc-timestamp-apis\}

Java と JDBC では、timestamp を設定する方法がいくつかあります:

1. `Timestamp` クラスを使用する。このクラスは実際には Unix timestamp です。
    1. `Calendar` オブジェクトと併用すると、そのカレンダーのタイムゾーンで `Timestamp` を再解釈できます。
    2. `Timestamp` には、あまり明らかではない内部カレンダーがあります。
2. `LocalDateTime` クラスを使用する。任意のタイムゾーンへ簡単に変換できますが、対象のタイムゾーンを渡すメソッドがありません。
3. `ZonedDateTime` クラスを使用する。タイムゾーンを持たない `DateTime` への書き込み時に（サーバーのタイムゾーンを使うと分かっているため）タイムゾーン変換に役立ちます。
    1. ただし、定義済みタイムゾーンを持つカラムへ `ZonedDateTime` を書き込む場合、ドライバーによる変換をユーザー側で補正する必要があります。
4. `Long` を使用して Unix timestamp のミリ秒を書き込む。
5. `String` を使用して、すべての変換をアプリケーション側で行う（あまり移植性が高くありません）。

:::warning
ID からタイムゾーンを検索するときは、`java.time.ZoneId#of(java.lang.String)` を使用することを推奨します。
このメソッドは、タイムゾーンが見つからない場合に例外をスローします（`java.util.TimeZone#getTimeZone(java.lang.String)` は黙って `GMT` にフォールバックします）。

`Tokyo` タイムゾーンを取得する正しい方法は次のとおりです:

`TimeZone.getTimeZone(ZoneId.of("Asia/Tokyo"))`
:::

## Date \{#date\}

日付は本質的にタイムゾーンに依存しません。日付を保存するための型として `Date` と `Date32` があります。どちらの型も、エポック（1970-01-01）からの経過日数を使用します。`Date` は正の経過日数のみを使用するため、その範囲は `2149-06-06` までです。`Date32` は負の経過日数も扱えるため `1970-01-01` より前の日付もカバーできますが、その範囲はより狭く（`1900-01-01` から `2100-01-01` までで、0 が `1970-01-01` を表します）、ClickHouse はどのタイムゾーンにおいても `2026-01-01` を `2026-01-01` として扱い、カラム定義にはタイムゾーンのパラメータはありません。

### `java.time.LocalDate` の使用 \{#using-localdate\}

Java では、日付値を表現するのに最も適したクラスは `java.time.LocalDate` です。クライアントは、このクラスを使用して `Date` および `Date32` カラムの値を格納します（`LocalDate.ofEpochDay((long)readUnsignedShortLE())` を用いて読み込みます）。

`java.time.LocalDate` はタイムゾーン変換の影響を受けず、新しい日時 API の一部であるため、これを使用することを推奨します。

### `java.sql.Date` の使用 \{#using-java-sql-date\}

`LocalDate` は Java 8 で導入されました。それ以前は、日付の書き込みや読み取りには `java.sql.Date` が使用されていました。内部的にはこのクラスはインスタント（絶対的な時点を表す時刻値）のラッパーです。このため、`toString()` は JVM に設定されているタイムゾーンに応じて異なる日付を返します。ドライバー側で値を慎重に構築する必要があり、利用者もこの点を理解しておく必要があります。

### カレンダーに基づく再解釈 \{#calendar-based-reinterpretation\}

`java.sql.ResultSet` には、`Calendar` を受け取って日付値を取得するメソッドがあり、`java.sql.PreparedStatement` にも同様のメソッドがあります。これは、指定されたタイムゾーンで JDBC ドライバーに日付値を再解釈させるために設計されています。たとえば、DB には値 `2026-01-01` が保存されているが、アプリケーション側ではこの日付を `Tokyo` の真夜中（午前 0 時）として扱いたいとします。これは、返される `java.sql.Date` オブジェクトが特定の時点を指すことになり、そのオブジェクトをローカルタイムゾーンに変換したとき、時差の影響で別の日付になる可能性があることを意味します。`LocalDate` を使用する場合は、`java.time.LocalDate#atStartOfDay(java.time.ZoneId)` を使うことで同じことを実現できます。

ClickHouse JDBC ドライバーは常に、**ローカル** の日付の真夜中を指す `java.sql.Date` オブジェクトを返します。言い換えると、日付が `2026-01-01` の場合、JVM タイムゾーンにおける `2026-01-01 12:00 AM` を意味します（PostgreSQL と MariaDB の JDBC ドライバーと同じ挙動です）。

## 時刻 \{#time\}

時刻の値は、日付の値と同様に、基本的にタイムゾーン非依存です。ClickHouse は時刻リテラル値をどのタイムゾーンにも変換せず、`’6:30’` はどこで読み取られても同じ値として扱われます。

### ClickHouse の Time 型 \{#clickhouse-time-types\}

`Time` と `Time64` は `25.6` で導入されました。それ以前は、代わりにタイムスタンプ型である `DateTime` と `DateTime64` が使用されていました（本ガイドの後半で説明します）。`Time` は 32 ビット整数の秒数として保存され、その範囲は `[-999:59:59, 999:59:59]` です。`Time64` は符号なしの Decimal64 としてエンコードされ、精度に応じて異なる時間単位を格納します。一般的な精度の指定値は 3（ミリ秒）、6（マイクロ秒）、9（ナノ秒）です。指定できる精度の範囲は `[0, 9]` です。

### Java の型マッピング \{#java-type-mapping\}

クライアントは `Time` および `Time64` を読み取り、それらを `LocalDateTime` として扱います。これは負の時間範囲をサポートするためです（`LocalTime` はこれをサポートしません）。この場合、日付部分はエポック日付である `1970-01-01` となるため、負の値はこの日付より前を表します。

時刻型の基本的なサポートは、`LocalTime`（値が 1 日の範囲内に収まる場合）と、値の全範囲を扱うための `Duration` を用いて実装されています。`LocalDateTime` は読み取り時にのみ使用されます。

### `java.sql.Time` の使用 \{#using-java-sql-time\}

`java.sql.Time` の使用は、`LocalTime` で表現できる範囲に限定されます。内部的には、`java.sql.Time` は文字列リテラルに変換されます。`PreparedStatement#setTime()` で Calendar 型のパラメータを使用することで、この値を変更できます。

### `toTime` 関数 \{#totime-function\}

:::note

- `toTime` には常に `Date`、`DateTime`、またはそれに類する型が必要で、文字列は受け付けません。関連する issue: https://github.com/ClickHouse/ClickHouse/issues/89896
- [`toTimeWithFixedDate`](/sql-reference/functions/date-time-functions#toTimeWithFixedDate) のエイリアスです。
- タイムゾーン関連の問題があります: https://github.com/ClickHouse/ClickHouse/pull/90310
:::

## Timestamp \{#timestamp\}

タイムスタンプとは、時間上の特定の時点を指します。たとえば Unix タイムスタンプは、任意の時点を `1970-01-01 00:00:00` `UTC` からの経過秒数として表します（負の秒数は Unix 時刻より前のタイムスタンプを、正の秒数はそれ以降を表します）。この表現は、利用者が `UTC` タイムゾーンにいる場合、またはローカルタイムゾーンではなく `UTC` を使用する場合に、計算や扱いが容易です。

### ClickHouse の Timestamp 型 \{#clickhouse-timestamp-types\}

ClickHouse には、`DateTime`（32 ビット整数で、解像度は常に秒）と `DateTime64`（64 ビット整数で、解像度は定義に依存）の 2 種類の Timestamp 型があります。値は常に UTC タイムスタンプとして保存されます。これは、数値として表現される場合、タイムゾーン変換が一切適用されないことを意味します。

### 文字列表現とタイムゾーンの動作 \{#string-representation-and-timezone-behavior\}

文字列表現にはいくつかの複雑な点があります。

- カラム定義でタイムゾーンが指定されておらず、書き込み時に文字列が渡された場合、その文字列はサーバーのタイムゾーンから UTC のタイムスタンプ（数値）に変換されます。そのようなカラムから値を読み取るときには、UTC のタイムスタンプからサーバーまたはセッションのタイムゾーンを用いてタイムスタンプリテラルに変換されます（タイムゾーンが明示的に定義されていない式中のタイムスタンプリテラルにも、同様のアプローチが適用されます）。
- カラム定義でタイムゾーンが指定されている場合は、すべての文字列変換でそのタイムゾーンのみが使用されます。これはタイムゾーンが指定されていない場合のロジックと矛盾するため、クエリ内の各カラムに対してデータがどのように書き込まれているかを十分に理解しておく必要があります。
- タイムゾーンを含む形式で日付が文字列として渡される場合は、変換関数が必要です。通常は [`parseDateTimeBestEffort`](/sql-reference/functions/type-conversion-functions#parseDateTimeBestEffort) が使用されます。

### JDBC ドライバーがタイムスタンプを処理する方法 \{#how-jdbc-driver-handles-timestamps\}

JDBC ドライバーでは、タイムスタンプを数値表現（数値型）に変換します。

```java
"fromUnixTimestamp64Nano(" + epochSeconds * 1_000_000_000L + nanos + ")"
```

この表現方法により、サーバーへデータを統一されたフォーマットで送信できるため、タイムスタンプ値に関する変換の問題のほとんどは解消されます。ただし、このアプローチでは SQL 文にわずかな調整が必要になりますが、どのカラムに対してもタイムスタンプを書き込むための、最も簡単かつ分かりやすい方法を提供します。

`DateTime` と `DateTime64` は、クライアント側では `java.time.ZonedDateTime` として読み取りおよび保存されます。これにより、その値を任意の別のタイムゾーンに変換でき、タイムゾーン情報も保持されます。


### `toDateTime64` に関するよくある落とし穴 \{#common-pitfall-todatetime64\}

次のコード例は見た目は正しそうですが、アサーションで失敗します。

```java
String sql = "SELECT toDateTime64(?, 3)";
try (PreparedStatement stmt = conn.prepareStatement(sql)) {
    LocalDateTime localTs = LocalDateTime.parse("2021-01-01T01:34:56");
    stmt.setObject(1, localTs);
    try (ResultSet rs = stmt.executeQuery()) {
        rs.next();
        assertEquals(rs.getObject(1, LocalDateTime.class), localTs);
    }
}
```

これは、`toDateTime64` がサーバーのタイムゾーンを使用し、ソースのタイムゾーン情報を考慮しないために発生します。


## 変換テーブル \{#conversion-tables\}

以下のテーブルに変換ペアが記載されていない場合、その変換はサポートされていません。例えば、`Date` カラムは時間部分を持たないため、`java.sql.Timestamp` として読み取ることはできません。

### `PreparedStatement#setObject` を使用した値の書き込み \{#writing-values-setobject\}

次の表は、`PreparedStatement#setObject(column, value)` を使用して値を設定した場合の変換方法を示しています。

| `value` のクラス | 変換 |
| --- | --- |
| `java.time.LocalDate`  | `YYYY-MM-DD` 形式にフォーマットされます。 |
| `java.sql.Date`  | デフォルトのカレンダーで変換され、`LocalDate`（`YYYY-MM-DD`）としてフォーマットされます。 |
| `java.time.LocalTime`  | `HH:mm:ss` 形式にフォーマットされます。 |
| `java.time.Duration` | `HHH:mm:ss` 形式にフォーマットされます。値は負の値を取ることもできます。 |
| `java.sql.Time` | デフォルトのカレンダーで変換され、`LocalTime`（`HH:mm`）としてフォーマットされます。 |
| `java.time.LocalDateTime`  | ナノ秒精度の Unix タイムスタンプに変換され、`fromUnixTimestamp64Nano` でラップされます。 |
| `java.time.ZonedDateTime`  | ナノ秒精度の Unix タイムスタンプに変換され、`fromUnixTimestamp64Nano` でラップされます。 |
| `java.sql.Timestamp`  | ナノ秒精度の Unix タイムスタンプに変換され、`fromUnixTimestamp64Nano` でラップされます。 |

:::note
カラムの型は未知であるとみなされます。PreparedStatement にどのような値を渡すかはアプリケーション側で決定してください。
:::

### `ResultSet#getObject` で値を読み取る \{#reading-values-getobject\}

次の表は、`ResultSet#getObject(column, class)` を使用して値を読み取る際の変換方法を示しています。

| `column` の ClickHouse データ型  | `class` の値  | 変換 |
| --- | --- | --- |
| `Date` または `Date32`  | `java.time.LocalDate`  | DB の値（日数）を `LocalDate` に変換します。  |
| `Date` または `Date32`  | `java.sql.Date`  | DB の値（日数）を `LocalDate` に変換し、その後ローカルタイムゾーンの午前 0 時を時刻部分として `java.sql.Date` に変換します。Calendar を使用する場合、そのタイムゾーンがローカルタイムゾーンの代わりに使用されます。例: DB の値 `1970-01-10` → `LocalDate` は `1970-01-10`。  |
| `Time` または `Time64`  | `java.time.LocalTime`  | DB の値を `LocalDateTime` に変換し、その後 `LocalTime` に変換します。これは 1 日以内の時刻に対してのみ動作します。  |
| `Time` または `Time64`  | `java.time.LocalDateTime`  | DB の値を `LocalDateTime` に変換します。  |
| `Time` または `Time64`  | `java.sql.Time`  | DB の値を `LocalDateTime` に変換し、その後デフォルトの Calendar を用いて `java.sql.Time` に変換します。これは 1 日以内の時刻に対してのみ動作します。  |
| `Time` または `Time64`  | `java.time.Duration`  | DB の値を `LocalDateTime` に変換し、その後 `Duration` に変換します。 |
| `DateTime` または `DateTime64`  | `java.time.LocalDateTime` | DB の値を `ZonedDateTime` に変換し、その後 `LocalDateTime` に変換します。 |
| `DateTime` または `DateTime64`  | `java.time.ZonedDateTime` | DB の値を `ZonedDateTime` に変換します。  |
| `DateTime` または `DateTime64`  | `java.sql.Timestamp` | DB の値を `ZonedDateTime` に変換し、その後デフォルトタイムゾーンを用いて `java.sql.Timestamp` に変換します。  |

### Calendar ベースのメソッドを使用する \{#using-calendar-based-methods\}

値が `PreparedStatement#setTime(param, value, calendar)` および `PreparedStatement#setDate(param, value, calendar)` を使用して格納されている場合は、それに対応して `ResultSet#getTime(column, calendar)` と `ResultSet#getDate(column, calendar)` を使用します。