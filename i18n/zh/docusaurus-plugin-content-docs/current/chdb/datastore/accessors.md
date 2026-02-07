---
title: 'DataStore 访问器'
sidebar_label: '访问器'
slug: /chdb/datastore/accessors
description: '字符串、DateTime、数组、JSON、URL、IP 和地理（Geo）访问器，提供 185+ 种方法'
keywords: ['chdb', 'datastore', 'accessor', 'str', 'dt', 'arr', 'json', 'url', 'ip', 'geo']
doc_type: 'reference'
---

# DataStore 访问器 \{#datastore-accessors\}

DataStore 提供 7 个访问器命名空间，包含 185+ 个用于特定领域操作的方法。

| Accessor | Methods | Description |
|----------|---------|-------------|
| `.str` | 56 | 字符串操作 |
| `.dt` | 42+ | 日期时间操作 |
| `.arr` | 37 | 数组操作（ClickHouse 特定） |
| `.json` | 13 | JSON 解析（ClickHouse 特定） |
| `.url` | 15 | URL 解析（ClickHouse 特定） |
| `.ip` | 9 | IP 地址操作（ClickHouse 特定） |
| `.geo` | 14 | 地理/距离操作（ClickHouse 特定） |

---

## 字符串访问器 (`.str`) \{#str\}

支持全部 56 个 pandas `.str` 方法，以及 ClickHouse 字符串函数。

### 大小写转换 \{#str-case\}

| Method         | ClickHouse  | 描述      |
| -------------- | ----------- | ------- |
| `upper()`      | `upper()`   | 转换为大写字母 |
| `lower()`      | `lower()`   | 转换为小写字母 |
| `capitalize()` | `initcap()` | 首字母大写   |
| `title()`      | `initcap()` | 标题大小写   |
| `swapcase()`   | -           | 反转大小写   |
| `casefold()`   | `lower()`   | 大小写折叠   |

```python
ds['name_upper'] = ds['name'].str.upper()
ds['name_title'] = ds['name'].str.title()
```


### 长度和大小 \{#str-length\}

| Method          | ClickHouse      | Description |
| --------------- | --------------- | ----------- |
| `len()`         | `length()`      | 字符串长度（字节）   |
| `char_length()` | `char_length()` | 字符长度        |

```python
ds['name_len'] = ds['name'].str.len()
```


### 子串和切片 \{#str-substring\}

| Method               | ClickHouse    | Description |
| -------------------- | ------------- | ----------- |
| `slice(start, stop)` | `substring()` | 提取子串        |
| `slice_replace()`    | -             | 替换切片        |
| `left(n)`            | `left()`      | 最左侧 n 个字符   |
| `right(n)`           | `right()`     | 最右侧 n 个字符   |
| `get(i)`             | -             | 指定索引位置的字符   |

```python
ds['first_3'] = ds['name'].str.slice(0, 3)
ds['last_4'] = ds['name'].str.right(4)
```


### 去除空白 \{#str-trim\}

| Method     | ClickHouse    | Description |
| ---------- | ------------- | ----------- |
| `strip()`  | `trim()`      | 去除空白字符      |
| `lstrip()` | `trimLeft()`  | 去除左侧空白字符    |
| `rstrip()` | `trimRight()` | 去除右侧空白字符    |

```python
ds['trimmed'] = ds['text'].str.strip()
```


### 搜索与匹配 \{#str-search\}

| Method            | ClickHouse     | Description  |
| ----------------- | -------------- | ------------ |
| `contains(pat)`   | `position()`   | 判断是否包含子字符串   |
| `startswith(pat)` | `startsWith()` | 判断是否以前缀开头    |
| `endswith(pat)`   | `endsWith()`   | 判断是否以后缀结尾    |
| `find(sub)`       | `position()`   | 查找位置         |
| `rfind(sub)`      | -              | 从右侧开始查找      |
| `index(sub)`      | `position()`   | 查找，否则抛出异常    |
| `rindex(sub)`     | -              | 从右侧查找，否则抛出异常 |
| `match(pat)`      | `match()`      | 正则匹配         |
| `fullmatch(pat)`  | -              | 完整正则匹配       |
| `count(pat)`      | -              | 统计出现次数       |

```python
# Contains substring
ds['has_john'] = ds['name'].str.contains('John')

# Regex match
ds['valid_email'] = ds['email'].str.match(r'^[\w.-]+@[\w.-]+\.\w+$')
```


### 替换 \{#str-replace\}

| Method                           | ClickHouse           | Description |
| -------------------------------- | -------------------- | ----------- |
| `replace(pat, repl)`             | `replace()`          | 替换所有匹配项     |
| `replace(pat, repl, regex=True)` | `replaceRegexpAll()` | 使用正则表达式替换   |
| `removeprefix(prefix)`           | -                    | 删除前缀        |
| `removesuffix(suffix)`           | -                    | 删除后缀        |
| `translate(table)`               | -                    | 转换字符        |

```python
ds['cleaned'] = ds['text'].str.replace('\n', ' ')
ds['digits_only'] = ds['phone'].str.replace(r'\D', '', regex=True)
```


### 拆分 \{#str-split\}

| Method            | ClickHouse        | Description   |
| ----------------- | ----------------- | ------------- |
| `split(sep)`      | `splitByString()` | 拆分为数组         |
| `rsplit(sep)`     | -                 | 从右侧开始拆分       |
| `partition(sep)`  | -                 | 拆分为 3 部分      |
| `rpartition(sep)` | -                 | 从右侧开始拆分为 3 部分 |

```python
ds['parts'] = ds['path'].str.split('/')
```


### 填充 \{#str-padding\}

| Method          | ClickHouse          | Description |
| --------------- | ------------------- | ----------- |
| `pad(width)`    | `leftPad()`         | 左填充         |
| `ljust(width)`  | `rightPad()`        | 右对齐         |
| `rjust(width)`  | `leftPad()`         | 左对齐         |
| `center(width)` | -                   | 居中          |
| `zfill(width)`  | `leftPad(..., '0')` | 零填充         |

```python
ds['padded_id'] = ds['id'].astype(str).str.zfill(6)
```


### 字符测试 \{#str-tests\}

| Method        | Description |
| ------------- | ----------- |
| `isalpha()`   | 全为字母        |
| `isdigit()`   | 全为数字        |
| `isalnum()`   | 全为字母或数字     |
| `isspace()`   | 全为空白字符      |
| `isupper()`   | 全为大写字母      |
| `islower()`   | 全为小写字母      |
| `istitle()`   | 标题形式（首字母大写） |
| `isnumeric()` | 数值字符        |
| `isdecimal()` | 十进制数字字符     |

```python
ds['is_numeric'] = ds['code'].str.isdigit()
```


### 其他 \{#str-other\}

| Method | Description |
|--------|-------------|
| `repeat(n)` | 重复 n 次 |
| `reverse()` | 反转字符串 |
| `wrap(width)` | 按宽度换行文本 |
| `encode(enc)` | 编码 |
| `decode(enc)` | 解码 |
| `normalize(form)` | Unicode 规范化 |
| `extract(pat)` | 提取正则表达式分组 |
| `extractall(pat)` | 提取所有匹配项 |
| `cat(sep)` | 连接所有元素 |
| `get_dummies(sep)` | 虚拟变量 |

---

## DateTime 访问器 (`.dt`) \{#dt\}

包含全部 42 个以上的 pandas `.dt` 方法以及 ClickHouse 的日期时间函数。

### 日期组件 \{#dt-components\}

| Property        | ClickHouse        | Description |
| --------------- | ----------------- | ----------- |
| `year`          | `toYear()`        | 年           |
| `month`         | `toMonth()`       | 月 (1-12)    |
| `day`           | `toDayOfMonth()`  | 日 (1-31)    |
| `hour`          | `toHour()`        | 小时 (0-23)   |
| `minute`        | `toMinute()`      | 分钟 (0-59)   |
| `second`        | `toSecond()`      | 秒 (0-59)    |
| `millisecond`   | `toMillisecond()` | 毫秒          |
| `microsecond`   | `toMicrosecond()` | 微秒          |
| `quarter`       | `toQuarter()`     | 季度 (1-4)    |
| `dayofweek`     | `toDayOfWeek()`   | 星期几 (0=周一)  |
| `dayofyear`     | `toDayOfYear()`   | 一年中的第几天     |
| `week`          | `toWeek()`        | 周数          |
| `days_in_month` | -                 | 当月天数        |

```python
ds['year'] = ds['date'].dt.year
ds['month'] = ds['date'].dt.month
ds['day_of_week'] = ds['date'].dt.dayofweek
```


### 截断 \{#dt-truncation\}

| Method                  | ClickHouse           | Description |
| ----------------------- | -------------------- | ----------- |
| `to_start_of_day()`     | `toStartOfDay()`     | 一天的起始时间     |
| `to_start_of_week()`    | `toStartOfWeek()`    | 一周的起始时间     |
| `to_start_of_month()`   | `toStartOfMonth()`   | 一个月的起始时间    |
| `to_start_of_quarter()` | `toStartOfQuarter()` | 一季度的起始时间    |
| `to_start_of_year()`    | `toStartOfYear()`    | 一年的起始时间     |
| `to_start_of_hour()`    | `toStartOfHour()`    | 一小时的起始时间    |
| `to_start_of_minute()`  | `toStartOfMinute()`  | 一分钟的起始时间    |

```python
ds['month_start'] = ds['date'].dt.to_start_of_month()
```


### 算术运算 \{#dt-arithmetic\}

| Method               | ClickHouse         | Description |
| -------------------- | ------------------ | ----------- |
| `add_years(n)`       | `addYears()`       | 增加年份        |
| `add_months(n)`      | `addMonths()`      | 增加月份        |
| `add_weeks(n)`       | `addWeeks()`       | 增加周数        |
| `add_days(n)`        | `addDays()`        | 增加天数        |
| `add_hours(n)`       | `addHours()`       | 增加小时        |
| `add_minutes(n)`     | `addMinutes()`     | 增加分钟        |
| `add_seconds(n)`     | `addSeconds()`     | 增加秒数        |
| `subtract_years(n)`  | `subtractYears()`  | 减少年份        |
| `subtract_months(n)` | `subtractMonths()` | 减少月份        |
| `subtract_days(n)`   | `subtractDays()`   | 减少天数        |

```python
ds['next_month'] = ds['date'].dt.add_months(1)
ds['last_week'] = ds['date'].dt.subtract_weeks(1)
```


### 布尔检查 \{#dt-checks\}

| Method               | Description |
| -------------------- | ----------- |
| `is_month_start()`   | 月初第一天       |
| `is_month_end()`     | 月末最后一天      |
| `is_quarter_start()` | 季度第一天       |
| `is_quarter_end()`   | 季度最后一天      |
| `is_year_start()`    | 年度第一天       |
| `is_year_end()`      | 年度最后一天      |
| `is_leap_year()`     | 闰年          |

```python
ds['is_eom'] = ds['date'].dt.is_month_end()
```


### 格式化 \{#dt-formatting\}

| 方法              | ClickHouse         | 描述      |
| --------------- | ------------------ | ------- |
| `strftime(fmt)` | `formatDateTime()` | 格式化为字符串 |
| `day_name()`    | -                  | 星期名称    |
| `month_name()`  | -                  | 月份名称    |

```python
ds['date_str'] = ds['date'].dt.strftime('%Y-%m-%d')
ds['day_name'] = ds['date'].dt.day_name()
```


### 时区 \{#dt-timezone\}

| Method            | ClickHouse     | Description |
| ----------------- | -------------- | ----------- |
| `tz_convert(tz)`  | `toTimezone()` | 转换时区        |
| `tz_localize(tz)` | -              | 本地化时区       |

```python
ds['utc_time'] = ds['timestamp'].dt.tz_convert('UTC')
```

***


## 数组访问器 (`.arr`) \{#arr\}

ClickHouse 特有的数组操作（37 个方法）。

### 属性 \{#arr-properties\}

| 属性          | ClickHouse   | 说明           |
| ----------- | ------------ | ------------ |
| `length`    | `length()`   | 数组长度         |
| `size`      | `length()`   | `length` 的别名 |
| `empty`     | `empty()`    | 是否为空         |
| `not_empty` | `notEmpty()` | 是否非空         |

```python
ds['tag_count'] = ds['tags'].arr.length
ds['has_tags'] = ds['tags'].arr.not_empty
```


### 元素访问 \{#arr-access\}

| Method                  | ClickHouse              | Description |
| ----------------------- | ----------------------- | ----------- |
| `array_first()`         | `arrayElement(..., 1)`  | 第一个元素       |
| `array_last()`          | `arrayElement(..., -1)` | 最后一个元素      |
| `array_element(n)`      | `arrayElement()`        | 第 N 个元素     |
| `array_slice(off, len)` | `arraySlice()`          | 数组切片        |

```python
ds['first_tag'] = ds['tags'].arr.array_first()
ds['last_tag'] = ds['tags'].arr.array_last()
```


### 聚合 \{#arr-aggregations\}

| Method            | ClickHouse       | Description |
| ----------------- | ---------------- | ----------- |
| `array_sum()`     | `arraySum()`     | 元素求和        |
| `array_avg()`     | `arrayAvg()`     | 平均值         |
| `array_min()`     | `arrayMin()`     | 最小值         |
| `array_max()`     | `arrayMax()`     | 最大值         |
| `array_product()` | `arrayProduct()` | 乘积          |
| `array_uniq()`    | `arrayUniq()`    | 唯一值计数       |

```python
ds['total'] = ds['values'].arr.array_sum()
ds['average'] = ds['values'].arr.array_avg()
```


### 转换 \{#arr-transformations\}

| Method                 | ClickHouse           | Description |
| ---------------------- | -------------------- | ----------- |
| `array_sort()`         | `arraySort()`        | 升序排序        |
| `array_reverse_sort()` | `arrayReverseSort()` | 降序排序        |
| `array_reverse()`      | `arrayReverse()`     | 反转顺序        |
| `array_distinct()`     | `arrayDistinct()`    | 去重元素        |
| `array_compact()`      | `arrayCompact()`     | 移除连续重复元素    |
| `array_flatten()`      | `arrayFlatten()`     | 展开嵌套数组      |

```python
ds['sorted_tags'] = ds['tags'].arr.array_sort()
ds['unique_tags'] = ds['tags'].arr.array_distinct()
```


### 修改 \{#arr-modifications\}

| Method | ClickHouse | Description |
|--------|------------|-------------|
| `array_push_back(elem)` | `arrayPushBack()` | 追加到末尾 |
| `array_push_front(elem)` | `arrayPushFront()` | 追加到开头 |
| `array_pop_back()` | `arrayPopBack()` | 删除最后一个元素 |
| `array_pop_front()` | `arrayPopFront()` | 删除第一个元素 |
| `array_concat(other)` | `arrayConcat()` | 拼接 |

### 搜索 \{#arr-search\}

| 方法                  | ClickHouse     | 说明     |
| ------------------- | -------------- | ------ |
| `has(elem)`         | `has()`        | 是否包含元素 |
| `index_of(elem)`    | `indexOf()`    | 查找索引   |
| `count_equal(elem)` | `countEqual()` | 统计出现次数 |

```python
ds['has_python'] = ds['skills'].arr.has('Python')
```


### 字符串操作 \{#arr-string\}

| Method                     | ClickHouse            | Description |
| -------------------------- | --------------------- | ----------- |
| `array_string_concat(sep)` | `arrayStringConcat()` | 合并为字符串      |

```python
ds['tags_str'] = ds['tags'].arr.array_string_concat(', ')
```

***


## JSON 访问器 (`.json`) \{#json\}

ClickHouse 特有的 JSON 解析（13 个方法）。

| 方法                 | ClickHouse            | 说明           |
| ------------------ | --------------------- | ------------ |
| `get_string(path)` | `JSONExtractString()` | 提取字符串        |
| `get_int(path)`    | `JSONExtractInt()`    | 提取整数         |
| `get_float(path)`  | `JSONExtractFloat()`  | 提取浮点数        |
| `get_bool(path)`   | `JSONExtractBool()`   | 提取布尔值        |
| `get_raw(path)`    | `JSONExtractRaw()`    | 提取原始 JSON    |
| `get_keys()`       | `JSONExtractKeys()`   | 获取键          |
| `get_type(path)`   | `JSONType()`          | 获取类型         |
| `get_length(path)` | `JSONLength()`        | 获取长度         |
| `has_key(key)`     | `JSONHas()`           | 检查键是否存在      |
| `is_valid()`       | `isValidJSON()`       | 校验 JSON 是否有效 |
| `to_json_string()` | `toJSONString()`      | 转换为 JSON     |

```python
# Parse JSON columns
ds['user_name'] = ds['json_data'].json.get_string('user.name')
ds['user_age'] = ds['json_data'].json.get_int('user.age')
ds['is_active'] = ds['json_data'].json.get_bool('user.active')
ds['has_email'] = ds['json_data'].json.has_key('user.email')
```

***


## URL 访问器 (`.url`) \{#url\}

ClickHouse 专用的 URL 解析（共 15 个方法）。

| Method                        | ClickHouse               | Description    |
| ----------------------------- | ------------------------ | -------------- |
| `domain()`                    | `domain()`               | 提取域名           |
| `domain_without_www()`        | `domainWithoutWWW()`     | 去除 www 的域名     |
| `top_level_domain()`          | `topLevelDomain()`       | 顶级域名（TLD）      |
| `protocol()`                  | `protocol()`             | 协议（http/https） |
| `path()`                      | `path()`                 | URL 路径         |
| `path_full()`                 | `pathFull()`             | 带查询的路径         |
| `query_string()`              | `queryString()`          | 查询字符串          |
| `fragment()`                  | `fragment()`             | URL 片段（#...）   |
| `port()`                      | `port()`                 | 端口号            |
| `extract_url_parameter(name)` | `extractURLParameter()`  | 获取查询参数         |
| `extract_url_parameters()`    | `extractURLParameters()` | 所有参数           |
| `cut_url_parameter(name)`     | `cutURLParameter()`      | 移除参数           |
| `decode_url_component()`      | `decodeURLComponent()`   | URL 解码         |
| `encode_url_component()`      | `encodeURLComponent()`   | URL 编码         |

```python
# Parse URLs
ds['domain'] = ds['url'].url.domain()
ds['path'] = ds['url'].url.path()
ds['utm_source'] = ds['url'].url.extract_url_parameter('utm_source')
```

***


## IP 访问器 (`.ip`) \{#ip\}

ClickHouse 特有的 IP 地址操作（9 个方法）。

| Method                     | ClickHouse          | Description |
| -------------------------- | ------------------- | ----------- |
| `to_ipv4()`                | `toIPv4()`          | 转换为 IPv4    |
| `to_ipv6()`                | `toIPv6()`          | 转换为 IPv6    |
| `ipv4_num_to_string()`     | `IPv4NumToString()` | 数值转字符串      |
| `ipv4_string_to_num()`     | `IPv4StringToNum()` | 字符串转数值      |
| `ipv6_num_to_string()`     | `IPv6NumToString()` | IPv6 数值转字符串 |
| `ipv4_to_ipv6()`           | `IPv4ToIPv6()`      | 转换为 IPv6    |
| `is_ipv4_string()`         | `isIPv4String()`    | 校验 IPv4     |
| `is_ipv6_string()`         | `isIPv6String()`    | 校验 IPv6     |
| `ipv4_cidr_to_range(cidr)` | `IPv4CIDRToRange()` | CIDR 转范围    |

```python
# IP operations
ds['is_valid_ip'] = ds['ip'].ip.is_ipv4_string()
ds['ip_num'] = ds['ip'].ip.ipv4_string_to_num()
```

***


## Geo 访问器 (`.geo`) \{#geo\}

ClickHouse 专用的地理/距离操作（共 14 种方法）。

### 距离函数 \{#geo-distance\}

| Method | ClickHouse | Description |
|--------|------------|-------------|
| `great_circle_distance(...)` | `greatCircleDistance()` | 大圆距离 |
| `geo_distance(...)` | `geoDistance()` | WGS-84 距离 |
| `l1_distance(v1, v2)` | `L1Distance()` | 曼哈顿距离 |
| `l2_distance(v1, v2)` | `L2Distance()` | 欧几里得距离 |
| `l2_squared_distance(v1, v2)` | `L2SquaredDistance()` | 欧几里得距离的平方 |
| `linf_distance(v1, v2)` | `LinfDistance()` | 切比雪夫距离 |
| `cosine_distance(v1, v2)` | `cosineDistance()` | 余弦距离 |

### 向量运算 \{#geo-vector\}

| 方法 | ClickHouse | 说明 |
|--------|------------|-------------|
| `dot_product(v1, v2)` | `dotProduct()` | 点积 |
| `l2_norm(vec)` | `L2Norm()` | 向量范数 |
| `l2_normalize(vec)` | `L2Normalize()` | 归一化 |

### H3 函数 \{#geo-h3\}

| 方法 | ClickHouse | 描述 |
|--------|------------|------|
| `geo_to_h3(lon, lat, res)` | `geoToH3()` | 将地理坐标转换为 H3 索引 |
| `h3_to_geo(h3)` | `h3ToGeo()` | 将 H3 索引转换为地理坐标 |

### 点操作 \{#geo-point\}

| Method                       | ClickHouse          | Description |
| ---------------------------- | ------------------- | ----------- |
| `point_in_polygon(pt, poly)` | `pointInPolygon()`  | 判断点是否在多边形内  |
| `point_in_ellipses(...)`     | `pointInEllipses()` | 判断点是否在椭圆内   |

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


## 使用访问器 \{#using-accessors\}

### 惰性求值 \{#lazy\}

大多数访问器方法都是惰性的——它们返回的表达式会在稍后才被计算：

```python
# All these are lazy
ds['name_upper'] = ds['name'].str.upper()  # Not executed yet
ds['year'] = ds['date'].dt.year            # Not executed yet
ds['domain'] = ds['url'].url.domain()      # Not executed yet

# Execution happens when you access results
df = ds.to_df()  # Now everything executes
```


### 立即执行的方法 \{#execute-immediately\}

某些 `.str` 方法必须立即执行，因为它们会改变数据结构：

| Method | Returns | Why |
|--------|---------|-----|
| `partition(sep)` | DataStore (3 列) | 创建多个列 |
| `rpartition(sep)` | DataStore (3 列) | 创建多个列 |
| `get_dummies(sep)` | DataStore (N 列) | 列数量动态变化 |
| `extractall(pat)` | DataStore | 结果为 MultiIndex |
| `cat(sep)` | str | 聚合（N 行 → 1） |

### 链式使用访问器 \{#chaining\}

访问器方法可以链式调用：

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
