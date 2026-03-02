---
title: 'DataStore アクセサ'
sidebar_label: 'アクセサ'
slug: /chdb/datastore/accessors
description: 'String、DateTime、Array、JSON、URL、IP、Geo 向けアクセサ（185 以上のメソッド）'
keywords: ['chdb', 'datastore', 'accessor', 'str', 'dt', 'arr', 'json', 'url', 'ip', 'geo']
doc_type: 'reference'
---

# DataStore アクセサー \{#datastore-accessors\}

DataStore は、ドメイン固有の操作のために 185 以上のメソッドを備えた 7 つのアクセサー用ネームスペースを提供します。

| Accessor | Methods | Description |
|----------|---------|-------------|
| `.str` | 56 | 文字列操作 |
| `.dt` | 42+ | DateTime 操作 |
| `.arr` | 37 | 配列操作（ClickHouse 固有） |
| `.json` | 13 | JSON 解析（ClickHouse 固有） |
| `.url` | 15 | URL 解析（ClickHouse 固有） |
| `.ip` | 9 | IP アドレス操作（ClickHouse 固有） |
| `.geo` | 14 | 地理/距離に関する操作（ClickHouse 固有） |

---

## 文字列アクセサ (`.str`) \{#str\}

pandas の 56 個すべての `.str` メソッドがサポートされており、さらに ClickHouse の文字列関数も利用できます。

### 大文字・小文字の変換 \{#str-case\}

| Method         | ClickHouse  | Description               |
| -------------- | ----------- | ------------------------- |
| `upper()`      | `upper()`   | 文字列を大文字に変換                |
| `lower()`      | `lower()`   | 文字列を小文字に変換                |
| `capitalize()` | `initcap()` | 先頭文字を大文字に変換               |
| `title()`      | `initcap()` | タイトルケース（各語の先頭を大文字）に変換     |
| `swapcase()`   | -           | 大文字と小文字を入れ替え              |
| `casefold()`   | `lower()`   | 大文字・小文字を正規化（case folding） |

```python
ds['name_upper'] = ds['name'].str.upper()
ds['name_title'] = ds['name'].str.title()
```


### 長さとサイズ \{#str-length\}

| Method          | ClickHouse      | Description   |
| --------------- | --------------- | ------------- |
| `len()`         | `length()`      | 文字列の長さ（バイト単位） |
| `char_length()` | `char_length()` | 文字数           |

```python
ds['name_len'] = ds['name'].str.len()
```


### 部分文字列とスライス \{#str-substring\}

| Method               | ClickHouse    | Description |
| -------------------- | ------------- | ----------- |
| `slice(start, stop)` | `substring()` | 部分文字列を抽出    |
| `slice_replace()`    | -             | スライスを置換     |
| `left(n)`            | `left()`      | 先頭から n 文字   |
| `right(n)`           | `right()`     | 末尾から n 文字   |
| `get(i)`             | -             | インデックス位置の文字 |

```python
ds['first_3'] = ds['name'].str.slice(0, 3)
ds['last_4'] = ds['name'].str.right(4)
```


### トリミング \{#str-trim\}

| Method     | ClickHouse    | Description  |
| ---------- | ------------- | ------------ |
| `strip()`  | `trim()`      | 空白文字を削除する    |
| `lstrip()` | `trimLeft()`  | 先頭の空白文字を削除する |
| `rstrip()` | `trimRight()` | 末尾の空白文字を削除する |

```python
ds['trimmed'] = ds['text'].str.strip()
```


### 検索とマッチング \{#str-search\}

| Method            | ClickHouse     | Description            |
| ----------------- | -------------- | ---------------------- |
| `contains(pat)`   | `position()`   | 部分文字列を含むか判定            |
| `startswith(pat)` | `startsWith()` | 指定した接頭辞で始まるか判定         |
| `endswith(pat)`   | `endsWith()`   | 指定した接尾辞で終わるか判定         |
| `find(sub)`       | `position()`   | 位置を検索                  |
| `rfind(sub)`      | -              | 右側（末尾側）から検索            |
| `index(sub)`      | `position()`   | 検索し、見つからない場合は例外を送出     |
| `rindex(sub)`     | -              | 右側から検索し、見つからない場合は例外を送出 |
| `match(pat)`      | `match()`      | 正規表現マッチ                |
| `fullmatch(pat)`  | -              | 全体が一致する正規表現マッチ         |
| `count(pat)`      | -              | 出現回数を返す                |

```python
# Contains substring
ds['has_john'] = ds['name'].str.contains('John')

# Regex match
ds['valid_email'] = ds['email'].str.match(r'^[\w.-]+@[\w.-]+\.\w+$')
```


### 置換 \{#str-replace\}

| Method                           | ClickHouse           | Description |
| -------------------------------- | -------------------- | ----------- |
| `replace(pat, repl)`             | `replace()`          | 出現箇所を置換     |
| `replace(pat, repl, regex=True)` | `replaceRegexpAll()` | 正規表現で置換     |
| `removeprefix(prefix)`           | -                    | プレフィックスを削除  |
| `removesuffix(suffix)`           | -                    | サフィックスを削除   |
| `translate(table)`               | -                    | 文字を変換       |

```python
ds['cleaned'] = ds['text'].str.replace('\n', ' ')
ds['digits_only'] = ds['phone'].str.replace(r'\D', '', regex=True)
```


### 分割 \{#str-split\}

| Method            | ClickHouse        | 説明              |
| ----------------- | ----------------- | --------------- |
| `split(sep)`      | `splitByString()` | 配列に分割する         |
| `rsplit(sep)`     | -                 | 右側から分割する        |
| `partition(sep)`  | -                 | 3つのパーツに分割する     |
| `rpartition(sep)` | -                 | 右側から3つのパーツに分割する |

```python
ds['parts'] = ds['path'].str.split('/')
```


### パディング \{#str-padding\}

| Method          | ClickHouse          | 説明     |
| --------------- | ------------------- | ------ |
| `pad(width)`    | `leftPad()`         | 左パディング |
| `ljust(width)`  | `rightPad()`        | 右寄せ    |
| `rjust(width)`  | `leftPad()`         | 左寄せ    |
| `center(width)` | -                   | 中央寄せ   |
| `zfill(width)`  | `leftPad(..., '0')` | ゼロ埋め   |

```python
ds['padded_id'] = ds['id'].astype(str).str.zfill(6)
```


### 文字種テスト \{#str-tests\}

| Method        | Description         |
| ------------- | ------------------- |
| `isalpha()`   | すべてアルファベット文字        |
| `isdigit()`   | すべて数字               |
| `isalnum()`   | すべて英数字              |
| `isspace()`   | すべて空白文字             |
| `isupper()`   | すべて大文字              |
| `islower()`   | すべて小文字              |
| `istitle()`   | タイトルケース（各単語の先頭が大文字） |
| `isnumeric()` | 数値文字                |
| `isdecimal()` | 10 進数文字             |

```python
ds['is_numeric'] = ds['code'].str.isdigit()
```


### その他 \{#str-other\}

| メソッド | 説明 |
|--------|-------------|
| `repeat(n)` | n 回繰り返す |
| `reverse()` | 文字列を逆順にする |
| `wrap(width)` | テキストを折り返す |
| `encode(enc)` | エンコード |
| `decode(enc)` | デコード |
| `normalize(form)` | Unicode 正規化 |
| `extract(pat)` | 正規表現のグループを抽出 |
| `extractall(pat)` | すべてのマッチを抽出 |
| `cat(sep)` | すべてを連結 |
| `get_dummies(sep)` | ダミー変数を生成 |

---

## DateTime アクセサー (`.dt`) \{#dt\}

pandas の 42 個以上のすべての `.dt` メソッドに加えて、ClickHouse の datetime 関数も利用できます。

### 日付コンポーネント \{#dt-components\}

| Property        | ClickHouse        | Description |
| --------------- | ----------------- | ----------- |
| `year`          | `toYear()`        | 年           |
| `month`         | `toMonth()`       | 月 (1-12)    |
| `day`           | `toDayOfMonth()`  | 日 (1-31)    |
| `hour`          | `toHour()`        | 時 (0-23)    |
| `minute`        | `toMinute()`      | 分 (0-59)    |
| `second`        | `toSecond()`      | 秒 (0-59)    |
| `millisecond`   | `toMillisecond()` | ミリ秒         |
| `microsecond`   | `toMicrosecond()` | マイクロ秒       |
| `quarter`       | `toQuarter()`     | 四半期 (1-4)   |
| `dayofweek`     | `toDayOfWeek()`   | 曜日 (0=月曜日)  |
| `dayofyear`     | `toDayOfYear()`   | 年内通算日       |
| `week`          | `toWeek()`        | 週番号         |
| `days_in_month` | -                 | 月内の日数       |

```python
ds['year'] = ds['date'].dt.year
ds['month'] = ds['date'].dt.month
ds['day_of_week'] = ds['date'].dt.dayofweek
```


### 切り捨て \{#dt-truncation\}

| Method                  | ClickHouse           | Description |
| ----------------------- | -------------------- | ----------- |
| `to_start_of_day()`     | `toStartOfDay()`     | 日の開始        |
| `to_start_of_week()`    | `toStartOfWeek()`    | 週の開始        |
| `to_start_of_month()`   | `toStartOfMonth()`   | 月の開始        |
| `to_start_of_quarter()` | `toStartOfQuarter()` | 四半期の開始      |
| `to_start_of_year()`    | `toStartOfYear()`    | 年の開始        |
| `to_start_of_hour()`    | `toStartOfHour()`    | 時の開始        |
| `to_start_of_minute()`  | `toStartOfMinute()`  | 分の開始        |

```python
ds['month_start'] = ds['date'].dt.to_start_of_month()
```


### 算術演算 \{#dt-arithmetic\}

| Method               | ClickHouse         | Description |
| -------------------- | ------------------ | ----------- |
| `add_years(n)`       | `addYears()`       | 年数を加算       |
| `add_months(n)`      | `addMonths()`      | 月数を加算       |
| `add_weeks(n)`       | `addWeeks()`       | 週数を加算       |
| `add_days(n)`        | `addDays()`        | 日数を加算       |
| `add_hours(n)`       | `addHours()`       | 時間を加算       |
| `add_minutes(n)`     | `addMinutes()`     | 分を加算        |
| `add_seconds(n)`     | `addSeconds()`     | 秒を加算        |
| `subtract_years(n)`  | `subtractYears()`  | 年数を減算       |
| `subtract_months(n)` | `subtractMonths()` | 月数を減算       |
| `subtract_days(n)`   | `subtractDays()`   | 日数を減算       |

```python
ds['next_month'] = ds['date'].dt.add_months(1)
ds['last_week'] = ds['date'].dt.subtract_weeks(1)
```


### 真偽値チェック \{#dt-checks\}

| Method               | Description |
| -------------------- | ----------- |
| `is_month_start()`   | 月初日         |
| `is_month_end()`     | 月末日         |
| `is_quarter_start()` | 四半期の初日      |
| `is_quarter_end()`   | 四半期の最終日     |
| `is_year_start()`    | 年初日         |
| `is_year_end()`      | 年末日         |
| `is_leap_year()`     | うるう年        |

```python
ds['is_eom'] = ds['date'].dt.is_month_end()
```


### 書式設定 \{#dt-formatting\}

| Method          | ClickHouse         | 説明       |
| --------------- | ------------------ | -------- |
| `strftime(fmt)` | `formatDateTime()` | 文字列として整形 |
| `day_name()`    | -                  | 曜日名      |
| `month_name()`  | -                  | 月名       |

```python
ds['date_str'] = ds['date'].dt.strftime('%Y-%m-%d')
ds['day_name'] = ds['date'].dt.day_name()
```


### タイムゾーン \{#dt-timezone\}

| Method            | ClickHouse     | 説明            |
| ----------------- | -------------- | ------------- |
| `tz_convert(tz)`  | `toTimezone()` | タイムゾーンを変換     |
| `tz_localize(tz)` | -              | タイムゾーンをローカライズ |

```python
ds['utc_time'] = ds['timestamp'].dt.tz_convert('UTC')
```

***


## Array Accessor (`.arr`) \{#arr\}

ClickHouse 固有の配列操作用メソッド（全 37 種類）。

### プロパティ \{#arr-properties\}

| プロパティ       | ClickHouse   | 説明              |
| ----------- | ------------ | --------------- |
| `length`    | `length()`   | 配列の長さ           |
| `size`      | `length()`   | `length` のエイリアス |
| `empty`     | `empty()`    | 空かどうか           |
| `not_empty` | `notEmpty()` | 空でないかどうか        |

```python
ds['tag_count'] = ds['tags'].arr.length
ds['has_tags'] = ds['tags'].arr.not_empty
```


### 要素アクセス \{#arr-access\}

| Method                  | ClickHouse              | Description |
| ----------------------- | ----------------------- | ----------- |
| `array_first()`         | `arrayElement(..., 1)`  | 先頭の要素       |
| `array_last()`          | `arrayElement(..., -1)` | 末尾の要素       |
| `array_element(n)`      | `arrayElement()`        | N 番目の要素     |
| `array_slice(off, len)` | `arraySlice()`          | 配列のスライス     |

```python
ds['first_tag'] = ds['tags'].arr.array_first()
ds['last_tag'] = ds['tags'].arr.array_last()
```


### 集約 \{#arr-aggregations\}

| Method            | ClickHouse       | 説明     |
| ----------------- | ---------------- | ------ |
| `array_sum()`     | `arraySum()`     | 要素の合計  |
| `array_avg()`     | `arrayAvg()`     | 平均値    |
| `array_min()`     | `arrayMin()`     | 最小値    |
| `array_max()`     | `arrayMax()`     | 最大値    |
| `array_product()` | `arrayProduct()` | 積      |
| `array_uniq()`    | `arrayUniq()`    | 一意な要素数 |

```python
ds['total'] = ds['values'].arr.array_sum()
ds['average'] = ds['values'].arr.array_avg()
```


### 変換 \{#arr-transformations\}

| Method                 | ClickHouse           | Description |
| ---------------------- | -------------------- | ----------- |
| `array_sort()`         | `arraySort()`        | 昇順にソート      |
| `array_reverse_sort()` | `arrayReverseSort()` | 降順にソート      |
| `array_reverse()`      | `arrayReverse()`     | 並び順を反転      |
| `array_distinct()`     | `arrayDistinct()`    | 要素の重複を削除    |
| `array_compact()`      | `arrayCompact()`     | 連続した重複要素を削除 |
| `array_flatten()`      | `arrayFlatten()`     | ネストをフラット化   |

```python
ds['sorted_tags'] = ds['tags'].arr.array_sort()
ds['unique_tags'] = ds['tags'].arr.array_distinct()
```


### 変更 \{#arr-modifications\}

| Method | ClickHouse | 説明 |
|--------|------------|-------------|
| `array_push_back(elem)` | `arrayPushBack()` | 末尾に追加 |
| `array_push_front(elem)` | `arrayPushFront()` | 先頭に追加 |
| `array_pop_back()` | `arrayPopBack()` | 最後の要素を削除 |
| `array_pop_front()` | `arrayPopFront()` | 最初の要素を削除 |
| `array_concat(other)` | `arrayConcat()` | 連結 |

### 検索 \{#arr-search\}

| Method              | ClickHouse     | Description   |
| ------------------- | -------------- | ------------- |
| `has(elem)`         | `has()`        | 要素を含む         |
| `index_of(elem)`    | `indexOf()`    | インデックス（位置）を取得 |
| `count_equal(elem)` | `countEqual()` | 出現回数をカウント     |

```python
ds['has_python'] = ds['skills'].arr.has('Python')
```


### 文字列操作 \{#arr-string\}

| Method                     | ClickHouse            | Description   |
| -------------------------- | --------------------- | ------------- |
| `array_string_concat(sep)` | `arrayStringConcat()` | 要素を結合して文字列にする |

```python
ds['tags_str'] = ds['tags'].arr.array_string_concat(', ')
```

***


## JSON アクセサ (`.json`) \{#json\}

ClickHouse 固有の JSON パース機能（13 個のメソッド）。

| Method             | ClickHouse            | Description  |
| ------------------ | --------------------- | ------------ |
| `get_string(path)` | `JSONExtractString()` | 文字列を抽出       |
| `get_int(path)`    | `JSONExtractInt()`    | 整数を抽出        |
| `get_float(path)`  | `JSONExtractFloat()`  | 浮動小数点数を抽出    |
| `get_bool(path)`   | `JSONExtractBool()`   | 真偽値を抽出       |
| `get_raw(path)`    | `JSONExtractRaw()`    | 生の JSON を抽出  |
| `get_keys()`       | `JSONExtractKeys()`   | キーを取得        |
| `get_type(path)`   | `JSONType()`          | 型を取得         |
| `get_length(path)` | `JSONLength()`        | 長さを取得        |
| `has_key(key)`     | `JSONHas()`           | キーの存在を確認     |
| `is_valid()`       | `isValidJSON()`       | JSON の妥当性を検証 |
| `to_json_string()` | `toJSONString()`      | JSON 文字列へ変換  |

```python
# Parse JSON columns
ds['user_name'] = ds['json_data'].json.get_string('user.name')
ds['user_age'] = ds['json_data'].json.get_int('user.age')
ds['is_active'] = ds['json_data'].json.get_bool('user.active')
ds['has_email'] = ds['json_data'].json.has_key('user.email')
```

***


## URL アクセサ (`.url`) \{#url\}

ClickHouse 固有の URL 解析メソッド（15 個）。

| Method                        | ClickHouse               | Description       |
| ----------------------------- | ------------------------ | ----------------- |
| `domain()`                    | `domain()`               | ドメインを抽出           |
| `domain_without_www()`        | `domainWithoutWWW()`     | www を除いたドメイン      |
| `top_level_domain()`          | `topLevelDomain()`       | TLD               |
| `protocol()`                  | `protocol()`             | プロトコル（http/https） |
| `path()`                      | `path()`                 | URL パス            |
| `path_full()`                 | `pathFull()`             | クエリ付きパス           |
| `query_string()`              | `queryString()`          | クエリ文字列            |
| `fragment()`                  | `fragment()`             | フラグメント（#...）      |
| `port()`                      | `port()`                 | ポート番号             |
| `extract_url_parameter(name)` | `extractURLParameter()`  | クエリパラメータを取得       |
| `extract_url_parameters()`    | `extractURLParameters()` | すべてのパラメータ         |
| `cut_url_parameter(name)`     | `cutURLParameter()`      | パラメータを削除          |
| `decode_url_component()`      | `decodeURLComponent()`   | URL デコード          |
| `encode_url_component()`      | `encodeURLComponent()`   | URL エンコード         |

```python
# Parse URLs
ds['domain'] = ds['url'].url.domain()
ds['path'] = ds['url'].url.path()
ds['utm_source'] = ds['url'].url.extract_url_parameter('utm_source')
```

***


## IP アクセサ (`.ip`) \{#ip\}

ClickHouse 固有の IP アドレス操作（9 種類のメソッド）。

| Method                     | ClickHouse          | Description    |
| -------------------------- | ------------------- | -------------- |
| `to_ipv4()`                | `toIPv4()`          | IPv4 に変換       |
| `to_ipv6()`                | `toIPv6()`          | IPv6 に変換       |
| `ipv4_num_to_string()`     | `IPv4NumToString()` | 数値を文字列に変換      |
| `ipv4_string_to_num()`     | `IPv4StringToNum()` | 文字列を数値に変換      |
| `ipv6_num_to_string()`     | `IPv6NumToString()` | IPv6 数値を文字列に変換 |
| `ipv4_to_ipv6()`           | `IPv4ToIPv6()`      | IPv6 に変換       |
| `is_ipv4_string()`         | `isIPv4String()`    | IPv4 文字列を検証    |
| `is_ipv6_string()`         | `isIPv6String()`    | IPv6 文字列を検証    |
| `ipv4_cidr_to_range(cidr)` | `IPv4CIDRToRange()` | CIDR を範囲に変換    |

```python
# IP operations
ds['is_valid_ip'] = ds['ip'].ip.is_ipv4_string()
ds['ip_num'] = ds['ip'].ip.ipv4_string_to_num()
```

***


## Geo アクセサー (`.geo`) \{#geo\}

ClickHouse 固有の geo/距離演算を提供します（14 個のメソッド）。

### 距離関数 \{#geo-distance\}

| Method | ClickHouse | 説明 |
|--------|------------|------|
| `great_circle_distance(...)` | `greatCircleDistance()` | 大円距離 |
| `geo_distance(...)` | `geoDistance()` | WGS-84 上の距離 |
| `l1_distance(v1, v2)` | `L1Distance()` | マンハッタン距離 |
| `l2_distance(v1, v2)` | `L2Distance()` | ユークリッド距離 |
| `l2_squared_distance(v1, v2)` | `L2SquaredDistance()` | ユークリッド距離の二乗 |
| `linf_distance(v1, v2)` | `LinfDistance()` | チェビシェフ距離 |
| `cosine_distance(v1, v2)` | `cosineDistance()` | コサイン距離 |

### ベクトル演算 \{#geo-vector\}

| メソッド | ClickHouse | 説明 |
|--------|------------|-------------|
| `dot_product(v1, v2)` | `dotProduct()` | ドット積 |
| `l2_norm(vec)` | `L2Norm()` | ベクトルノルム |
| `l2_normalize(vec)` | `L2Normalize()` | 正規化 |

### H3 関数 \{#geo-h3\}

| Method | ClickHouse | 説明 |
|--------|------------|-------------|
| `geo_to_h3(lon, lat, res)` | `geoToH3()` | Geo 座標から H3 INDEX への変換 |
| `h3_to_geo(h3)` | `h3ToGeo()` | H3 から Geo 座標への変換 |

### ポイント操作 \{#geo-point\}

| Method                       | ClickHouse          | 説明             |
| ---------------------------- | ------------------- | -------------- |
| `point_in_polygon(pt, poly)` | `pointInPolygon()`  | 点がポリゴン内にあるかを判定 |
| `point_in_ellipses(...)`     | `pointInEllipses()` | 点が楕円内にあるかを判定   |

```python
from chdb.datastore import F

# Calculate distances
ds['distance'] = F.great_circle_distance(
    ds['lon1'], ds['lat1'],
    ds['lon2'], ds['lat2']
)

# Vector similarity
ds['similarity'] = F.cosine_distance(ds['embedding1'], ds['embedding2'])
```

***


## アクセサの使用 \{#using-accessors\}

### 遅延評価 \{#lazy\}

ほとんどのアクセサーメソッドは遅延的に評価され、後で評価される式を返します。

```python
# All these are lazy
ds['name_upper'] = ds['name'].str.upper()  # Not executed yet
ds['year'] = ds['date'].dt.year            # Not executed yet
ds['domain'] = ds['url'].url.domain()      # Not executed yet

# Execution happens when you access results
df = ds.to_df()  # Now everything executes
```


### 即時に実行されるメソッド \{#execute-immediately\}

一部の `.str` メソッドは構造を変更するため、呼び出し時に即座に実行されます:

| Method | Returns | Why |
|--------|---------|-----|
| `partition(sep)` | DataStore (3 カラム) | 複数のカラムを作成するため |
| `rpartition(sep)` | DataStore (3 カラム) | 複数のカラムを作成するため |
| `get_dummies(sep)` | DataStore (N カラム) | カラム数が動的に変化するため |
| `extractall(pat)` | DataStore | MultiIndex の結果を返すため |
| `cat(sep)` | str | 集約 (N 行 → 1 行) |

### アクセサのチェイニング \{#chaining\}

アクセサメソッドはチェーンして呼び出せます。

```python
ds['clean_name'] = (ds['name']
    .str.strip()
    .str.lower()
    .str.replace(' ', '_')
)

ds['next_month_start'] = (ds['date']
    .dt.add_months(1)
    .dt.to_start_of_month()
)
```
