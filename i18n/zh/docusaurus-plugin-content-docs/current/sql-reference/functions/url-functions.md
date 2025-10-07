---
'description': '处理 URL 的函数的文档'
'sidebar_label': 'URLs'
'slug': '/sql-reference/functions/url-functions'
'title': '处理 URL 的函数'
'doc_type': 'reference'
---


# 处理 URL 的函数

:::note
本节中提到的函数经过优化以实现最大性能，并且在大多数情况下不遵循 RFC-3986 标准。实现 RFC-3986 的函数名称后会附加 `RFC`，通常速度较慢。
:::

在处理不包含用户字符串或 `@` 符号的公共注册域时，通常可以使用非 `RFC` 函数变体。下表详细列出了在 URL 中各个符号可以 (`✔`) 或不能 (`✗`) 被相应的 `RFC` 和非 `RFC` 变体解析的情况：

|符号  | 非`RFC`| `RFC` |
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

标记为 `*` 的符号是 RFC 3986 中的子分隔符，允许在 `@` 符号后进行用户信息。

## 提取 URL 部分的函数 {#functions-that-extract-parts-of-a-url}

如果 URL 中不存在相关部分，将返回空字符串。

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

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

URL 可指定带有或不带协议。示例：

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

- 如果输入字符串可以解析为 URL，则返回主机名，否则返回空字符串。 [String](../data-types/string.md)。

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

从 URL 中提取主机名。与 [domain](#domain) 类似，但符合 RFC 3986。

**语法**

```sql
domainRFC(url)
```

**参数**

- `url` — URL。 [String](../data-types/string.md)。

**返回值**

- 如果输入字符串可以解析为 URL，则返回主机名，否则返回空字符串。 [String](../data-types/string.md)。

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

如果存在，则返回没有前缀 `www.` 的域名。

**语法**

```sql
domainWithoutWWW(url)
```

**参数**

- `url` — URL。 [String](../data-types/string.md)。

**返回值**

- 如果输入字符串可以解析为 URL（不带前缀 `www.`），则返回域名，否则返回空字符串。 [String](../data-types/string.md)。

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

如果存在，则返回没有前缀 `www.` 的域名。与 [domainWithoutWWW](#domainwithoutwww) 类似，但符合 RFC 3986。

**语法**

```sql
domainWithoutWWWRFC(url)
```

**参数**

- `url` — URL。 [String](../data-types/string.md)。

**返回值**

- 如果输入字符串可以解析为 URL（不带前缀 `www.`），则返回域名，否则返回空字符串。 [String](../data-types/string.md)。

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

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

:::note
URL 可指定带有或不带协议。示例：

```text
svn+ssh://some.svn-hosting.com:80/repo/trunk
some.svn-hosting.com:80/repo/trunk
https://clickhouse.com/time/
```
:::

**返回值**

- 如果输入字符串可以解析为 URL，则返回域名。否则，返回空字符串。 [String](../../sql-reference/data-types/string.md)。

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
与 [topLevelDomain](#topleveldomain) 类似，但符合 RFC 3986。

```sql
topLevelDomainRFC(url)
```

**参数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

:::note
URL 可指定带有或不带协议。示例：

```text
svn+ssh://some.svn-hosting.com:80/repo/trunk
some.svn-hosting.com:80/repo/trunk
https://clickhouse.com/time/
```
:::

**返回值**

- 如果输入字符串可以解析为 URL，则返回域名。否则，返回空字符串。 [String](../../sql-reference/data-types/string.md)。

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

返回“第一个显著子域”。
第一个显著子域是 `com`、`net`、`org` 或 `co` 的二级域名，否则是三级域名。
例如，`firstSignificantSubdomain ('https://news.clickhouse.com/') = 'clickhouse'`, `firstSignificantSubdomain ('https://news.clickhouse.com.tr/') = 'clickhouse'`。
“非显著”二级域名的列表和其他实现细节可能在未来更改。

**语法**

```sql
firstSignificantSubdomain(url)
```

**参数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

**返回值**

- 第一个显著子域。 [String](../data-types/string.md)。

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

返回“第一个显著子域”。
第一个显著子域是 `com`、`net`、`org` 或 `co` 的二级域名，否则是三级域名。
例如，`firstSignificantSubdomain ('https://news.clickhouse.com/') = 'clickhouse'`, `firstSignificantSubdomain ('https://news.clickhouse.com.tr/') = 'clickhouse'`。
“非显著”二级域名的列表和其他实现细节可能在未来更改。
与 [firstSignficantSubdomain](#firstsignificantsubdomain) 类似，但符合 RFC 1034。

**语法**

```sql
firstSignificantSubdomainRFC(url)
```

**参数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

**返回值**

- 第一个显著子域。 [String](../data-types/string.md)。

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

返回包括顶级子域到“第一个显著子域”的域的部分。

**语法**

```sql
cutToFirstSignificantSubdomain(url)
```

**参数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

**返回值**

- 包括顶级子域到第一个显著子域的域的部分（如果可能），否则返回空字符串。 [String](../data-types/string.md)。

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

返回包括顶级子域到“第一个显著子域”的域的部分。
与 [cutToFirstSignificantSubdomain](#cuttofirstsignificantsubdomain) 类似，但符合 RFC 3986。

**语法**

```sql
cutToFirstSignificantSubdomainRFC(url)
```

**参数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

**返回值**

- 包括顶级子域到第一个显著子域的域的部分（如果可能），否则返回空字符串。 [String](../data-types/string.md)。

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

返回包括顶级子域到“第一个显著子域”的域的部分，保留 `www`。

**语法**

```sql
cutToFirstSignificantSubdomainWithWWW(url)
```

**参数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

**返回值**

- 包括顶级子域到第一个显著子域的域的部分（带 `www`，如果可能），否则返回空字符串。 [String](../data-types/string.md)。

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

返回包括顶级子域到“第一个显著子域”的域的部分，保留 `www`。
与 [cutToFirstSignificantSubdomainWithWWW](#cuttofirstsignificantsubdomaincustomwithwww) 类似，但符合 RFC 3986。

**语法**

```sql
cutToFirstSignificantSubdomainWithWWW(url)
```

**参数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

**返回值**

- 包括顶级子域到第一个显著子域的域的部分（带“www”，如果可能），否则返回空字符串。 [String](../data-types/string.md)。

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

返回包括顶级子域到第一个显著子域的域的部分。
接受自定义 [TLD 列表](https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains) 名称。
如果需要新的 TLD 列表或具有自定义列表，此函数可能会很有用。

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

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。
- `tld` — 自定义 TLD 列表名称。 [String](../../sql-reference/data-types/string.md)。

**返回值**

- 返回包括顶级子域到第一个显著子域的域的部分。 [String](../../sql-reference/data-types/string.md)。

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

**参见**

- [firstSignificantSubdomain](#firstsignificantsubdomain)。

### cutToFirstSignificantSubdomainCustomRFC {#cuttofirstsignificantsubdomaincustomrfc}

返回包括顶级子域到第一个显著子域的域的部分。
接受自定义 [TLD 列表](https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains) 名称。
如果需要新的 TLD 列表或具有自定义列表，此函数可能会很有用。
与 [cutToFirstSignificantSubdomainCustom](#cuttofirstsignificantsubdomaincustom) 类似，但符合 RFC 3986。

**语法**

```sql
cutToFirstSignificantSubdomainRFC(url, tld)
```

**参数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。
- `tld` — 自定义 TLD 列表名称。 [String](../../sql-reference/data-types/string.md)。

**返回值**

- 返回包括顶级子域到第一个显著子域的域的部分。 [String](../../sql-reference/data-types/string.md)。

**参见**

- [firstSignificantSubdomain](#firstsignificantsubdomain)。

### cutToFirstSignificantSubdomainCustomWithWWW {#cuttofirstsignificantsubdomaincustomwithwww}

返回包括顶级子域到第一个显著子域的域的部分而不去掉 `www`。
接受自定义 TLD 列表名称。
如果需要新的 TLD 列表或具有自定义列表，此函数可能会很有用。

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

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。
- `tld` — 自定义 TLD 列表名称。 [String](../../sql-reference/data-types/string.md)。

**返回值**

- 返回包括顶级子域到第一个显著子域的域的部分而不去掉 `www`。 [String](../data-types/string.md)。

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

**参见**

- [firstSignificantSubdomain](#firstsignificantsubdomain)。
- [top_level_domains_list](../../operations/server-configuration-parameters/settings.md/#top_level_domains_list)

### cutToFirstSignificantSubdomainCustomWithWWWRFC {#cuttofirstsignificantsubdomaincustomwithwwwrfc}

返回包括顶级子域到第一个显著子域的域的部分而不去掉 `www`。
接受自定义 TLD 列表名称。
如果需要新的 TLD 列表或具有自定义列表，此函数可能会很有用。
与 [cutToFirstSignificantSubdomainCustomWithWWW](#cuttofirstsignificantsubdomaincustomwithwww) 类似，但符合 RFC 3986。

**语法**

```sql
cutToFirstSignificantSubdomainCustomWithWWWRFC(url, tld)
```

**参数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。
- `tld` — 自定义 TLD 列表名称。 [String](../../sql-reference/data-types/string.md)。

**返回值**

- 返回包括顶级子域到第一个显著子域的域的部分而不去掉 `www`。 [String](../../sql-reference/data-types/string.md)。

**参见**

- [firstSignificantSubdomain](#firstsignificantsubdomain)。
- [top_level_domains_list](../../operations/server-configuration-parameters/settings.md/#top_level_domains_list)

### firstSignificantSubdomainCustom {#firstsignificantsubdomaincustom}

返回第一个显著子域。
接受自定义 TLD 列表名称。
如果需要新 TLD 列表或具有自定义列表，此功能可能会很有用。

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

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。
- `tld` — 自定义 TLD 列表名称。 [String](../../sql-reference/data-types/string.md)。

**返回值**

- 第一个显著子域。 [String](../../sql-reference/data-types/string.md)。

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

**参见**

- [firstSignificantSubdomain](#firstsignificantsubdomain)。
- [top_level_domains_list](../../operations/server-configuration-parameters/settings.md/#top_level_domains_list)

### firstSignificantSubdomainCustomRFC {#firstsignificantsubdomaincustomrfc}

返回第一个显著子域。
接受自定义 TLD 列表名称。
如果需要新 TLD 列表或具有自定义列表，此功能可能会很有用。
与 [firstSignificantSubdomainCustom](#firstsignificantsubdomaincustom) 类似，但符合 RFC 3986。

**语法**

```sql
firstSignificantSubdomainCustomRFC(url, tld)
```

**参数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。
- `tld` — 自定义 TLD 列表名称。 [String](../../sql-reference/data-types/string.md)。

**返回值**

- 第一个显著子域。 [String](../../sql-reference/data-types/string.md)。

**参见**

- [firstSignificantSubdomain](#firstsignificantsubdomain)。
- [top_level_domains_list](../../operations/server-configuration-parameters/settings.md/#top_level_domains_list)

### port {#port}

返回端口或者 `default_port`，如果 URL 不包含端口或无法解析。

**语法**

```sql
port(url [, default_port = 0])
```

**参数**

- `url` — URL。 [String](../data-types/string.md)。
- `default_port` — 要返回的默认端口号。 [UInt16](../data-types/int-uint.md)。

**返回值**

- 端口或默认端口，如果 URL 中没有端口或发生验证错误。 [UInt16](../data-types/int-uint.md)。

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

返回端口或 `default_port`，如果 URL 不包含端口或无法解析。
与 [port](#port) 类似，但符合 RFC 3986。

**语法**

```sql
portRFC(url [, default_port = 0])
```

**参数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。
- `default_port` — 要返回的默认端口号。 [UInt16](../data-types/int-uint.md)。

**返回值**

- 端口或默认端口，如果 URL 中没有端口或发生验证错误。 [UInt16](../data-types/int-uint.md)。

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

与上面相同，但包括查询字符串和片段。

示例： `/top/news.html?page=2#comments`。

### protocol {#protocol-1}

从 URL 中提取协议。 

**语法**

```sql
protocol(url)
```

**参数**

- `url` — 要提取协议的 URL。 [String](../data-types/string.md)。

**返回值**

- 协议，如果无法确定则返回空字符串。 [String](../data-types/string.md)。

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

返回查询字符串，不包括开头的问号，`#` 和 `#` 后的所有内容。

示例： `page=1&lr=213`。

### fragment {#fragment}

返回不带开头井号的片段标识符。

### queryStringAndFragment {#querystringandfragment}

返回查询字符串和片段标识符。

示例： `page=1#29390`。

### extractURLParameter(url, name) {#extracturlparameterurl-name}

返回 URL 中 `name` 参数的值（如果存在），否则返回空字符串。
如果该名称存在多个参数，则返回第一个出现的值。
该函数假设 `url` 参数中的参数以与 `name` 参数中的相同方式编码。

### extractURLParameters(url) {#extracturlparametersurl}

返回与 URL 参数对应的 `name=value` 字符串数组。
值未解码。

### extractURLParameterNames(url) {#extracturlparameternamesurl}

返回与 URL 参数名称对应的名称字符串数组。
值未解码。

### URLHierarchy(url) {#urlhierarchyurl}

返回一个数组，包含 URL，路径和查询字符串末尾截断的符号 / 和 ?。
连续的分隔符字符计为一个。
切割是在所有连续分隔符字符后进行的。

### URLPathHierarchy(url) {#urlpathhierarchyurl}

与上面相同，但结果中不包含协议和主机。根元素 `/` 不包括在内。

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

返回解码后的 URL。遵循 rfc-1866，普通的加号（`+`）解码为空格（` `）。

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

从 URL 中提取网络位置（`username:password@host:port`）。

**语法**

```sql
netloc(url)
```

**参数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

**返回值**

- `username:password@host:port`。 [String](../data-types/string.md)。

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

如果 URL 不具有任何相似的内容，则 URL 保持不变。

### cutWWW {#cutwww}

从 URL 的域中删除前缀 `www.`（如果存在）。

### cutQueryString {#cutquerystring}

删除查询字符串，包括问号。

### cutFragment {#cutfragment}

删除片段标识符，包括数字符号。

### cutQueryStringAndFragment {#cutquerystringandfragment}

删除查询字符串和片段标识符，包括问号和数字符号。

### cutURLParameter(url, name) {#cuturlparameterurl-name}

从 URL 中删除 `name` 参数（如果存在）。
该函数不对参数名称中的字符进行编码或解码，例如 `Client ID` 和 `Client%20ID` 被视为不同的参数名称。

**语法**

```sql
cutURLParameter(url, name)
```

**参数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。
- `name` — URL 参数名称。 [String](../../sql-reference/data-types/string.md) 或 [Array](../../sql-reference/data-types/array.md) 的字符串。

**返回值**

- 删除了 `name` URL 参数的 URL。 [String](../data-types/string.md)。

**示例**

查询：

```sql
SELECT
    cutURLParameter('http://bigmir.net/?a=b&c=d&e=f#g', 'a') AS url_without_a,
    cutURLParameter('http://bigmir.net/?a=b&c=d&e=f#g', ['c', 'e']) AS url_without_c_and_e;
```

结果：

```text
┌─url_without_a────────────────┬─url_without_c_and_e──────┐
│ http://bigmir.net/?c=d&e=f#g │ http://bigmir.net/?a=b#g │
└──────────────────────────────┴──────────────────────────┘
```

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
