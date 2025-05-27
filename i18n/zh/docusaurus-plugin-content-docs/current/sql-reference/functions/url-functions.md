---
'description': '处理URL的函数的文档'
'sidebar_label': 'URLs'
'sidebar_position': 200
'slug': '/sql-reference/functions/url-functions'
'title': '处理URL的函数'
---


# 处理 URL 的函数

:::note
这一部分提到的函数经过优化以实现最佳性能，并且在大多数情况下不遵循 RFC-3986 标准。实现 RFC-3986 的函数在其函数名称后附加 `RFC`，通常速度较慢。
:::

在处理不包含用户字符串或 `@` 符号的公共注册域时，您可以一般使用非 `RFC` 函数变体。下面的表格详细说明了 URL 中哪些符号可以（`✔`）或不能（`✗`）被相应的 `RFC` 和非 `RFC` 变体解析：

|符号   | 非-`RFC` | `RFC` |
|-------|----------|-------|
| ' '   | ✗        |✗      |
|  \t   | ✗        |✗      |
|  &lt; | ✗        |✗      |
|  >    | ✗        |✗      |
|  %    | ✗        |✔*     |
|  \{   | ✗        |✗      |
|  }    | ✗        |✗      |
|  \|   | ✗        |✗      |
|  \\\  | ✗        |✗      |
|  ^    | ✗        |✗      |
|  ~    | ✗        |✔*     |
|  [    | ✗        |✗      |
|  ]    | ✗        |✔      |
|  ;    | ✗        |✔*     |
|  =    | ✗        |✔*     |
|  &    | ✗        |✔*     |

标记为 `*` 的符号是 RFC 3986 中的子分隔符，并允许在 `@` 符号后用于用户信息。

## 提取 URL 部分的函数 {#functions-that-extract-parts-of-a-url}

如果 URL 中缺少相关部分，则返回空字符串。

### protocol {#protocol}

从 URL 中提取协议。

典型返回值的示例： http, https, ftp, mailto, tel, magnet。

### domain {#domain}

从 URL 中提取主机名。

**语法**

```sql
domain(url)
```

**参数**

- `url` — URL. [字符串](../../sql-reference/data-types/string.md)。

URL 可以带或不带协议。示例：

```text
svn+ssh://some.svn-hosting.com:80/repo/trunk
some.svn-hosting.com:80/repo/trunk
https://clickhouse.com/time/
```

在这些示例中，`domain` 函数返回以下结果：

```text
some.svn-hosting.com
some.svn-hosting.com
clickhouse.com
```

**返回值**

- 如果输入字符串可以解析为 URL，则返回主机名，否则返回空字符串。 [字符串](../data-types/string.md)。

**示例**

```sql
SELECT domain('svn+ssh://some.svn-hosting.com:80/repo/trunk');
```

```text
┌─domain('svn+ssh://some.svn-hosting.com:80/repo/trunk')─┐
│ some.svn-hosting.com                                   │
└────────────────────────────────────────────────────────┘
```

### domainRFC {#domainrfc}

从 URL 中提取主机名。类似于 [domain](#domain)，但符合 RFC 3986。

**语法**

```sql
domainRFC(url)
```

**参数**

- `url` — URL. [字符串](../data-types/string.md)。

**返回值**

- 如果输入字符串可以解析为 URL，则返回主机名，否则返回空字符串。 [字符串](../data-types/string.md)。

**示例**

```sql
SELECT
    domain('http://user:password@example.com:8080/path?query=value#fragment'),
    domainRFC('http://user:password@example.com:8080/path?query=value#fragment');
```

```text
┌─domain('http://user:password@example.com:8080/path?query=value#fragment')─┬─domainRFC('http://user:password@example.com:8080/path?query=value#fragment')─┐
│                                                                           │ example.com                                                                  │
└───────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────┘
```

### domainWithoutWWW {#domainwithoutwww}

如果存在，则返回不带前缀 `www.` 的域名。

**语法**

```sql
domainWithoutWWW(url)
```

**参数**

- `url` — URL. [字符串](../data-types/string.md)。

**返回值**

- 如果输入字符串可以解析为 URL（不带前缀 `www.`），则返回域名，否则返回空字符串。 [字符串](../data-types/string.md)。

**示例**

```sql
SELECT domainWithoutWWW('http://paul@www.example.com:80/');
```

```text
┌─domainWithoutWWW('http://paul@www.example.com:80/')─┐
│ example.com                                         │
└─────────────────────────────────────────────────────┘
```

### domainWithoutWWWRFC {#domainwithoutwwwrfc}

如果存在，则返回不带前缀 `www.` 的域名。类似于 [domainWithoutWWW](#domainwithoutwww)，但符合 RFC 3986。

**语法**

```sql
domainWithoutWWWRFC(url)
```

**参数**

- `url` — URL. [字符串](../data-types/string.md)。

**返回值**

- 如果输入字符串可以解析为 URL（不带前缀 `www.`），则返回域名，否则返回空字符串。 [字符串](../data-types/string.md)。

**示例**

查询：

```sql
SELECT
    domainWithoutWWW('http://user:password@www.example.com:8080/path?query=value#fragment'),
    domainWithoutWWWRFC('http://user:password@www.example.com:8080/path?query=value#fragment');
```

结果：

```response
┌─domainWithoutWWW('http://user:password@www.example.com:8080/path?query=value#fragment')─┬─domainWithoutWWWRFC('http://user:password@www.example.com:8080/path?query=value#fragment')─┐
│                                                                                         │ example.com                                                                                │
└─────────────────────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────┘
```

### topLevelDomain {#topleveldomain}

从 URL 中提取顶级域名。

```sql
topLevelDomain(url)
```

**参数**

- `url` — URL. [字符串](../../sql-reference/data-types/string.md)。

:::note
URL 可以带或不带协议。示例：

```text
svn+ssh://some.svn-hosting.com:80/repo/trunk
some.svn-hosting.com:80/repo/trunk
https://clickhouse.com/time/
```
:::

**返回值**

- 如果输入字符串可以解析为 URL，则返回域名。否则，返回空字符串。 [字符串](../../sql-reference/data-types/string.md)。

**示例**

查询：

```sql
SELECT topLevelDomain('svn+ssh://www.some.svn-hosting.com:80/repo/trunk');
```

结果：

```text
┌─topLevelDomain('svn+ssh://www.some.svn-hosting.com:80/repo/trunk')─┐
│ com                                                                │
└────────────────────────────────────────────────────────────────────┘
```

### topLevelDomainRFC {#topleveldomainrfc}

从 URL 中提取顶级域名。
类似于 [topLevelDomain](#topleveldomain)，但符合 RFC 3986。

```sql
topLevelDomainRFC(url)
```

**参数**

- `url` — URL. [字符串](../../sql-reference/data-types/string.md)。

:::note
URL 可以带或不带协议。示例：

```text
svn+ssh://some.svn-hosting.com:80/repo/trunk
some.svn-hosting.com:80/repo/trunk
https://clickhouse.com/time/
```
:::

**返回值**

- 如果输入字符串可以解析为 URL，则返回域名。否则，返回空字符串。 [字符串](../../sql-reference/data-types/string.md)。

**示例**

查询：

```sql
SELECT topLevelDomain('http://foo:foo%41bar@foo.com'), topLevelDomainRFC('http://foo:foo%41bar@foo.com');
```

结果：

```text
┌─topLevelDomain('http://foo:foo%41bar@foo.com')─┬─topLevelDomainRFC('http://foo:foo%41bar@foo.com')─┐
│                                                │ com                                               │
└────────────────────────────────────────────────┴───────────────────────────────────────────────────┘
```

### firstSignificantSubdomain {#firstsignificantsubdomain}

返回 "第一个显著子域"。
第一个显著子域是对于 `com`、`net`、`org` 或 `co` 的二级域名，否则是三级域名。
例如，`firstSignificantSubdomain ('https://news.clickhouse.com/') = 'clickhouse'`，`firstSignificantSubdomain ('https://news.clickhouse.com.tr/') = 'clickhouse'`。
"无显著性" 二级域名的列表和其他实现细节可能会在未来发生变化。

**语法**

```sql
firstSignificantSubdomain(url)
```

**参数**

- `url` — URL. [字符串](../../sql-reference/data-types/string.md)。

**返回值**

- 第一个显著子域。 [字符串](../data-types/string.md)。

**示例**

查询：

```sql
SELECT firstSignificantSubdomain('http://www.example.com/a/b/c?a=b')
```

结果：

```reference
┌─firstSignificantSubdomain('http://www.example.com/a/b/c?a=b')─┐
│ example                                                       │
└───────────────────────────────────────────────────────────────┘
```

### firstSignificantSubdomainRFC {#firstsignificantsubdomainrfc}

返回 "第一个显著子域"。
第一个显著子域是对于 `com`、`net`、`org` 或 `co` 的二级域名，否则是三级域名。
例如，`firstSignificantSubdomain ('https://news.clickhouse.com/') = 'clickhouse'`，`firstSignificantSubdomain ('https://news.clickhouse.com.tr/') = 'clickhouse'`。
"无显著性" 二级域名的列表和其他实现细节可能会在未来发生变化。
类似于 [firstSignficantSubdomain](#firstsignificantsubdomain)，但符合 RFC 1034。

**语法**

```sql
firstSignificantSubdomainRFC(url)
```

**参数**

- `url` — URL. [字符串](../../sql-reference/data-types/string.md)。

**返回值**

- 第一个显著子域。 [字符串](../data-types/string.md)。

**示例**

查询：

```sql
SELECT
    firstSignificantSubdomain('http://user:password@example.com:8080/path?query=value#fragment'),
    firstSignificantSubdomainRFC('http://user:password@example.com:8080/path?query=value#fragment');
```

结果：

```reference
┌─firstSignificantSubdomain('http://user:password@example.com:8080/path?query=value#fragment')─┬─firstSignificantSubdomainRFC('http://user:password@example.com:8080/path?query=value#fragment')─┐
│                                                                                              │ example                                                                                         │
└──────────────────────────────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### cutToFirstSignificantSubdomain {#cuttofirstsignificantsubdomain}

返回包括顶级子域到 "第一个显著子域" 的域名部分。

**语法**

```sql
cutToFirstSignificantSubdomain(url)
```

**参数**

- `url` — URL. [字符串](../../sql-reference/data-types/string.md)。

**返回值**

- 包括顶级子域到第一个显著子域的域名部分（如果可能），否则返回空字符串。 [字符串](../data-types/string.md)。

**示例**

查询：

```sql
SELECT
    cutToFirstSignificantSubdomain('https://news.clickhouse.com.tr/'),
    cutToFirstSignificantSubdomain('www.tr'),
    cutToFirstSignificantSubdomain('tr');
```

结果：

```response
┌─cutToFirstSignificantSubdomain('https://news.clickhouse.com.tr/')─┬─cutToFirstSignificantSubdomain('www.tr')─┬─cutToFirstSignificantSubdomain('tr')─┐
│ clickhouse.com.tr                                                 │ tr                                       │                                      │
└───────────────────────────────────────────────────────────────────┴──────────────────────────────────────────┴──────────────────────────────────────┘
```

### cutToFirstSignificantSubdomainRFC {#cuttofirstsignificantsubdomainrfc}

返回包括顶级子域到 "第一个显著子域" 的域名部分。
类似于 [cutToFirstSignificantSubdomain](#cuttofirstsignificantsubdomain)，但符合 RFC 3986。

**语法**

```sql
cutToFirstSignificantSubdomainRFC(url)
```

**参数**

- `url` — URL. [字符串](../../sql-reference/data-types/string.md)。

**返回值**

- 包括顶级子域到第一个显著子域的域名部分（如果可能），否则返回空字符串。 [字符串](../data-types/string.md)。

**示例**

查询：

```sql
SELECT
    cutToFirstSignificantSubdomain('http://user:password@example.com:8080'),
    cutToFirstSignificantSubdomainRFC('http://user:password@example.com:8080');
```

结果：

```response
┌─cutToFirstSignificantSubdomain('http://user:password@example.com:8080')─┬─cutToFirstSignificantSubdomainRFC('http://user:password@example.com:8080')─┐
│                                                                         │ example.com                                                                │
└─────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────┘
```

### cutToFirstSignificantSubdomainWithWWW {#cuttofirstsignificantsubdomainwithwww}

返回包括顶级子域到 "第一个显著子域" 的域名部分，不去掉 `www`。

**语法**

```sql
cutToFirstSignificantSubdomainWithWWW(url)
```

**参数**

- `url` — URL. [字符串](../../sql-reference/data-types/string.md)。

**返回值**

- 包括顶级子域到第一个显著子域的域名部分（带 `www`），如果可能，否则返回空字符串。 [字符串](../data-types/string.md)。

**示例**

查询：

```sql
SELECT
    cutToFirstSignificantSubdomainWithWWW('https://news.clickhouse.com.tr/'),
    cutToFirstSignificantSubdomainWithWWW('www.tr'),
    cutToFirstSignificantSubdomainWithWWW('tr');
```

结果：

```response
┌─cutToFirstSignificantSubdomainWithWWW('https://news.clickhouse.com.tr/')─┬─cutToFirstSignificantSubdomainWithWWW('www.tr')─┬─cutToFirstSignificantSubdomainWithWWW('tr')─┐
│ clickhouse.com.tr                                                        │ www.tr                                          │                                             │
└──────────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────┴─────────────────────────────────────────────┘
```

### cutToFirstSignificantSubdomainWithWWWRFC {#cuttofirstsignificantsubdomainwithwwwrfc}

返回包括顶级子域到 "第一个显著子域" 的域名部分，不去掉 `www`。
类似于 [cutToFirstSignificantSubdomainWithWWW](#cuttofirstsignificantsubdomaincustomwithwww)，但符合 RFC 3986。

**语法**

```sql
cutToFirstSignificantSubdomainWithWWW(url)
```

**参数**

- `url` — URL. [字符串](../../sql-reference/data-types/string.md)。

**返回值**

- 包括顶级子域到第一个显著子域的域名部分（带 "www"），如果可能，否则返回空字符串。 [字符串](../../sql-reference/data-types/string.md)。

**示例**

查询：

```sql
SELECT
    cutToFirstSignificantSubdomainWithWWW('http:%2F%2Fwwwww.nova@mail.ru/economicheskiy'),
    cutToFirstSignificantSubdomainWithWWWRFC('http:%2F%2Fwwwww.nova@mail.ru/economicheskiy');
```

结果：

```response
┌─cutToFirstSignificantSubdomainWithWWW('http:%2F%2Fwwwww.nova@mail.ru/economicheskiy')─┬─cutToFirstSignificantSubdomainWithWWWRFC('http:%2F%2Fwwwww.nova@mail.ru/economicheskiy')─┐
│                                                                                       │ mail.ru                                                                                  │
└───────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────┘
```

### cutToFirstSignificantSubdomainCustom {#cuttofirstsignificantsubdomaincustom}

返回包括顶级子域到第一个显著子域的域名部分。
接受自定义 [TLD 列表](https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains) 名称。
如果您需要新的 TLD 列表或有自定义列表时，此函数可能会很有用。

**配置示例**

```xml
<!-- <top_level_domains_path>/var/lib/clickhouse/top_level_domains/</top_level_domains_path> -->
<top_level_domains_lists>
    <!-- https://publicsuffix.org/list/public_suffix_list.dat -->
    <public_suffix_list>public_suffix_list.dat</public_suffix_list>
    <!-- NOTE: path is under top_level_domains_path -->
</top_level_domains_lists>
```

**语法**

```sql
cutToFirstSignificantSubdomain(url, tld)
```

**参数**

- `url` — URL. [字符串](../../sql-reference/data-types/string.md)。
- `tld` — 自定义 TLD 列表名称。 [字符串](../../sql-reference/data-types/string.md)。

**返回值**

- 包括顶级子域到第一个显著子域的域名部分。 [字符串](../../sql-reference/data-types/string.md)。

**示例**

查询：

```sql
SELECT cutToFirstSignificantSubdomainCustom('bar.foo.there-is-no-such-domain', 'public_suffix_list');
```

结果：

```text
┌─cutToFirstSignificantSubdomainCustom('bar.foo.there-is-no-such-domain', 'public_suffix_list')─┐
│ foo.there-is-no-such-domain                                                                   │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

**另见**

- [firstSignificantSubdomain](#firstsignificantsubdomain)。

### cutToFirstSignificantSubdomainCustomRFC {#cuttofirstsignificantsubdomaincustomrfc}

返回包括顶级子域到第一个显著子域的域名部分。
接受自定义 [TLD 列表](https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains) 名称。
如果您需要新的 TLD 列表或有自定义列表时，此函数可能会很有用。
类似于 [cutToFirstSignificantSubdomainCustom](#cuttofirstsignificantsubdomaincustom)，但符合 RFC 3986。

**语法**

```sql
cutToFirstSignificantSubdomainRFC(url, tld)
```

**参数**

- `url` — URL. [字符串](../../sql-reference/data-types/string.md)。
- `tld` — 自定义 TLD 列表名称。 [字符串](../../sql-reference/data-types/string.md)。

**返回值**

- 包括顶级子域到第一个显著子域的域名部分。 [字符串](../../sql-reference/data-types/string.md)。

**另见**

- [firstSignificantSubdomain](#firstsignificantsubdomain)。

### cutToFirstSignificantSubdomainCustomWithWWW {#cuttofirstsignificantsubdomaincustomwithwww}

返回包括顶级子域到第一个显著子域的域名部分，不去掉 `www`。
接受自定义 TLD 列表名。
如果您需要新的 TLD 列表或有自定义列表时，此函数可能会很有用。

**配置示例**

```xml
<!-- <top_level_domains_path>/var/lib/clickhouse/top_level_domains/</top_level_domains_path> -->
<top_level_domains_lists>
    <!-- https://publicsuffix.org/list/public_suffix_list.dat -->
    <public_suffix_list>public_suffix_list.dat</public_suffix_list>
    <!-- NOTE: path is under top_level_domains_path -->
</top_level_domains_lists>
```

**语法**

```sql
cutToFirstSignificantSubdomainCustomWithWWW(url, tld)
```

**参数**

- `url` — URL. [字符串](../../sql-reference/data-types/string.md)。
- `tld` — 自定义 TLD 列表名称。 [字符串](../../sql-reference/data-types/string.md)。

**返回值**

- 包括顶级子域到第一个显著子域的域名部分，不去掉 `www`。 [字符串](../data-types/string.md)。

**示例**

查询：

```sql
SELECT cutToFirstSignificantSubdomainCustomWithWWW('www.foo', 'public_suffix_list');
```

结果：

```text
┌─cutToFirstSignificantSubdomainCustomWithWWW('www.foo', 'public_suffix_list')─┐
│ www.foo                                                                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

**另见**

- [firstSignificantSubdomain](#firstsignificantsubdomain)。
- [top_level_domains_list](../../operations/server-configuration-parameters/settings.md/#top_level_domains_list)

### cutToFirstSignificantSubdomainCustomWithWWWRFC {#cuttofirstsignificantsubdomaincustomwithwwwrfc}

返回包括顶级子域到第一个显著子域的域名部分，不去掉 `www`。
接受自定义 TLD 列表名。
如果您需要新的 TLD 列表或有自定义列表时，此函数可能会很有用。
类似于 [cutToFirstSignificantSubdomainCustomWithWWW](#cuttofirstsignificantsubdomaincustomwithwww)，但符合 RFC 3986。

**语法**

```sql
cutToFirstSignificantSubdomainCustomWithWWWRFC(url, tld)
```

**参数**

- `url` — URL. [字符串](../../sql-reference/data-types/string.md)。
- `tld` — 自定义 TLD 列表名称。 [字符串](../../sql-reference/data-types/string.md)。

**返回值**

- 包括顶级子域到第一个显著子域的域名部分，不去掉 `www`。 [字符串](../../sql-reference/data-types/string.md)。

**另见**

- [firstSignificantSubdomain](#firstsignificantsubdomain)。
- [top_level_domains_list](../../operations/server-configuration-parameters/settings.md/#top_level_domains_list)

### firstSignificantSubdomainCustom {#firstsignificantsubdomaincustom}

返回第一个显著子域。
接受自定义 TLD 列表名称。
如果您需要新的 TLD 列表或有自定义列表时，此函数可能会很有用。

配置示例：

```xml
<!-- <top_level_domains_path>/var/lib/clickhouse/top_level_domains/</top_level_domains_path> -->
<top_level_domains_lists>
    <!-- https://publicsuffix.org/list/public_suffix_list.dat -->
    <public_suffix_list>public_suffix_list.dat</public_suffix_list>
    <!-- NOTE: path is under top_level_domains_path -->
</top_level_domains_lists>
```

**语法**

```sql
firstSignificantSubdomainCustom(url, tld)
```

**参数**

- `url` — URL. [字符串](../../sql-reference/data-types/string.md)。
- `tld` — 自定义 TLD 列表名称。 [字符串](../../sql-reference/data-types/string.md)。

**返回值**

- 第一个显著子域。 [字符串](../../sql-reference/data-types/string.md)。

**示例**

查询：

```sql
SELECT firstSignificantSubdomainCustom('bar.foo.there-is-no-such-domain', 'public_suffix_list');
```

结果：

```text
┌─firstSignificantSubdomainCustom('bar.foo.there-is-no-such-domain', 'public_suffix_list')─┐
│ foo                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**另见**

- [firstSignificantSubdomain](#firstsignificantsubdomain)。
- [top_level_domains_list](../../operations/server-configuration-parameters/settings.md/#top_level_domains_list)

### firstSignificantSubdomainCustomRFC {#firstsignificantsubdomaincustomrfc}

返回第一个显著子域。
接受自定义 TLD 列表名称。
如果您需要新的 TLD 列表或有自定义列表时，此函数可能会很有用。
类似于 [firstSignificantSubdomainCustom](#firstsignificantsubdomaincustom)，但符合 RFC 3986。

**语法**

```sql
firstSignificantSubdomainCustomRFC(url, tld)
```

**参数**

- `url` — URL. [字符串](../../sql-reference/data-types/string.md)。
- `tld` — 自定义 TLD 列表名称。 [字符串](../../sql-reference/data-types/string.md)。

**返回值**

- 第一个显著子域。 [字符串](../../sql-reference/data-types/string.md)。

**另见**

- [firstSignificantSubdomain](#firstsignificantsubdomain)。
- [top_level_domains_list](../../operations/server-configuration-parameters/settings.md/#top_level_domains_list)

### port {#port}

返回端口或 `default_port`，如果 URL 中不包含端口或无法解析。

**语法**

```sql
port(url [, default_port = 0])
```

**参数**

- `url` — URL. [字符串](../data-types/string.md)。
- `default_port` — 要返回的默认端口号。 [UInt16](../data-types/int-uint.md)。

**返回值**

- 如果 URL 中没有端口或在验证错误情况下，返回端口或默认端口。 [UInt16](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT port('http://paul@www.example.com:80/');
```

结果：

```response
┌─port('http://paul@www.example.com:80/')─┐
│                                      80 │
└─────────────────────────────────────────┘
```

### portRFC {#portrfc}

返回端口或 `default_port`，如果 URL 中不包含端口或无法解析。
类似于 [port](#port)，但符合 RFC 3986。

**语法**

```sql
portRFC(url [, default_port = 0])
```

**参数**

- `url` — URL. [字符串](../../sql-reference/data-types/string.md)。
- `default_port` — 要返回的默认端口号。 [UInt16](../data-types/int-uint.md)。

**返回值**

- 如果 URL 中没有端口或在验证错误情况下，返回端口或默认端口。 [UInt16](../data-types/int-uint.md)。

**示例**

查询：

```sql
SELECT
    port('http://user:password@example.com:8080'),
    portRFC('http://user:password@example.com:8080');
```

结果：

```resposne
┌─port('http://user:password@example.com:8080')─┬─portRFC('http://user:password@example.com:8080')─┐
│                                             0 │                                             8080 │
└───────────────────────────────────────────────┴──────────────────────────────────────────────────┘
```

### path {#path}

返回没有查询字符串的路径。

示例： `/top/news.html`。

### pathFull {#pathfull}

与上面相同，但包含查询字符串和片段。

示例： `/top/news.html?page=2#comments`。

### protocol {#protocol-1}

从 URL 中提取协议。 

**语法**

```sql
protocol(url)
```

**参数**

- `url` — 要提取协议的 URL。 [字符串](../data-types/string.md)。

**返回值**

- 协议，如果无法确定则返回空字符串。 [字符串](../data-types/string.md)。

**示例**

查询：

```sql
SELECT protocol('https://clickhouse.com/');
```

结果：

```response
┌─protocol('https://clickhouse.com/')─┐
│ https                               │
└─────────────────────────────────────┘
```

### queryString {#querystring}

返回查询字符串，不包括初始问号、`#` 及其后的所有内容。

示例： `page=1&lr=213`。

### fragment {#fragment}

返回片段标识符，不包括初始哈希符号。

### queryStringAndFragment {#querystringandfragment}

返回查询字符串和片段标识符。

示例： `page=1#29390`。

### extractURLParameter(url, name) {#extracturlparameterurl-name}

返回 URL 中 `name` 参数的值（如果存在），否则返回空字符串。
如果存在多个该名称的参数，返回第一个出现的。
该函数假定 `url` 参数中的参数以与 `name` 参数相同的方式编码。

### extractURLParameters(url) {#extracturlparametersurl}

返回对应于 URL 参数的 `name=value` 字符串数组。
值不会解码。

### extractURLParameterNames(url) {#extracturlparameternamesurl}

返回对应于 URL 参数名称的名称字符串数组。
值不会解码。

### URLHierarchy(url) {#urlhierarchyurl}

返回一个数组，其中包含 URL，在路径和查询字符串的末尾由符号 / 和 ? 截断。
连续的分隔符字符被视为一个。
切割发生在所有连续分隔符字符后的位置。

### URLPathHierarchy(url) {#urlpathhierarchyurl}

与上面相同，但结果中不包括协议和主机。根 / 元素不包括在内。

```text
URLPathHierarchy('https://example.com/browse/CONV-6788') =
[
    '/browse/',
    '/browse/CONV-6788'
]
```

### encodeURLComponent(url) {#encodeurlcomponenturl}

返回编码后的 URL。

示例：

```sql
SELECT encodeURLComponent('http://127.0.0.1:8123/?query=SELECT 1;') AS EncodedURL;
```

```text
┌─EncodedURL───────────────────────────────────────────────┐
│ http%3A%2F%2F127.0.0.1%3A8123%2F%3Fquery%3DSELECT%201%3B │
└──────────────────────────────────────────────────────────┘
```

### decodeURLComponent(url) {#decodeurlcomponenturl}

返回解码后的 URL。

示例：

```sql
SELECT decodeURLComponent('http://127.0.0.1:8123/?query=SELECT%201%3B') AS DecodedURL;
```

```text
┌─DecodedURL─────────────────────────────┐
│ http://127.0.0.1:8123/?query=SELECT 1; │
└────────────────────────────────────────┘
```

### encodeURLFormComponent(url) {#encodeurlformcomponenturl}

返回编码后的 URL。遵循 rfc-1866，空格（` `）编码为加号（`+`）。

示例：

```sql
SELECT encodeURLFormComponent('http://127.0.0.1:8123/?query=SELECT 1 2+3') AS EncodedURL;
```

```text
┌─EncodedURL────────────────────────────────────────────────┐
│ http%3A%2F%2F127.0.0.1%3A8123%2F%3Fquery%3DSELECT+1+2%2B3 │
└───────────────────────────────────────────────────────────┘
```

### decodeURLFormComponent(url) {#decodeurlformcomponenturl}

返回解码后的 URL。遵循 rfc-1866，普通加号（`+`）解码为空格（` `）。

示例：

```sql
SELECT decodeURLFormComponent('http://127.0.0.1:8123/?query=SELECT%201+2%2B3') AS DecodedURL;
```

```text
┌─DecodedURL────────────────────────────────┐
│ http://127.0.0.1:8123/?query=SELECT 1 2+3 │
└───────────────────────────────────────────┘
```

### netloc {#netloc}

从 URL 中提取网络定位 (`username:password@host:port`)。

**语法**

```sql
netloc(url)
```

**参数**

- `url` — URL. [字符串](../../sql-reference/data-types/string.md)。

**返回值**

- `username:password@host:port`。 [字符串](../data-types/string.md)。

**示例**

查询：

```sql
SELECT netloc('http://paul@www.example.com:80/');
```

结果：

```text
┌─netloc('http://paul@www.example.com:80/')─┐
│ paul@www.example.com:80                   │
└───────────────────────────────────────────┘
```

## 删除 URL 部分的函数 {#functions-that-remove-part-of-a-url}

如果 URL 中没有类似内容，URL 将保持不变。

### cutWWW {#cutwww}

从 URL 的域中删除前导 `www.`（如果存在）。

### cutQueryString {#cutquerystring}

删除查询字符串，包括问号。

### cutFragment {#cutfragment}

删除片段标识符，包括数字符号。

### cutQueryStringAndFragment {#cutquerystringandfragment}

删除查询字符串和片段标识符，包括问号和数字符号。

### cutURLParameter(url, name) {#cuturlparameterurl-name}

从 URL 中删除 `name` 参数（如果存在）。
此函数不对参数名称中的字符进行编码或解码，例如 `Client ID` 和 `Client%20ID` 被视为不同的参数名称。

**语法**

```sql
cutURLParameter(url, name)
```

**参数**

- `url` — URL. [字符串](../../sql-reference/data-types/string.md)。
- `name` — URL 参数的名称。 [字符串](../../sql-reference/data-types/string.md) 或 [字符串](../../sql-reference/data-types/array.md) 的数组。

**返回值**

- 删除了 `name` URL 参数的 URL。 [字符串](../data-types/string.md)。

**示例**

查询：

```sql
SELECT
    cutURLParameter('http://bigmir.net/?a=b&c=d&e=f#g', 'a') as url_without_a,
    cutURLParameter('http://bigmir.net/?a=b&c=d&e=f#g', ['c', 'e']) as url_without_c_and_e;
```

结果：

```text
┌─url_without_a────────────────┬─url_without_c_and_e──────┐
│ http://bigmir.net/?c=d&e=f#g │ http://bigmir.net/?a=b#g │
└──────────────────────────────┴──────────────────────────┘
```
