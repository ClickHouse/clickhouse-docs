---
description: 'Documentation for Functions for Working with URLs'
sidebar_label: 'URLs'
sidebar_position: 200
slug: '/sql-reference/functions/url-functions'
title: 'Functions for Working with URLs'
---




# URLを操作する関数

:::note
このセクションで説明する関数は最大限のパフォーマンスのために最適化されており、ほとんどはRFC-3986標準に従っていません。RFC-3986を実装する関数には、関数名の末尾に`RFC`が付けられており、一般的に遅くなります。
:::

一般的に、ユーザー文字列や`@`シンボルを含まない公に登録されたドメインを扱う場合は、非`RFC`関数バリアントを使用できます。下の表は、URL内のどのシンボルがそれぞれの`RFC`および非`RFC`バリアントによって解析可能（`✔`）または不可能（`✗`）であるかを示しています：

|シンボル | 非`RFC`| `RFC` |
|-------|----------|-------|
| ' '   | ✗        | ✗     |
|  \t   | ✗        | ✗     |
|  &lt; | ✗        | ✗     |
|  >    | ✗        | ✗     |
|  %    | ✗        | ✔*    |
|  \{   | ✗        | ✗     |
|  }    | ✗        | ✗     |
|  \|   | ✗        | ✗     |
|  \\\  | ✗        | ✗     |
|  ^    | ✗        | ✗     |
|  ~    | ✗        | ✔*    |
|  [    | ✗        | ✗     |
|  ]    | ✗        | ✔     |
|  ;    | ✗        | ✔*    |
|  =    | ✗        | ✔*    |
|  &    | ✗        | ✔*    |

`*`でマークされたシンボルはRFC 3986のサブデリミターであり、`@`シンボルに続くユーザー情報に対して許可されています。

## URLのパーツを抽出する関数 {#functions-that-extract-parts-of-a-url}

関連する部分がURLに存在しない場合は、空の文字列が返されます。

### protocol {#protocol}

URLからプロトコルを抽出します。

典型的に返される値の例：http, https, ftp, mailto, tel, magnet。

### domain {#domain}

URLからホスト名を抽出します。

**構文**

```sql
domain(url)
```

**引数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

URLはプロトコルありまたはなしで指定できます。例：

```text
svn+ssh://some.svn-hosting.com:80/repo/trunk
some.svn-hosting.com:80/repo/trunk
https://clickhouse.com/time/
```

これらの例に対して、`domain`関数は次の結果を返します：

```text
some.svn-hosting.com
some.svn-hosting.com
clickhouse.com
```

**返される値**

- 入力文字列がURLとして解析可能であればホスト名、それ以外の場合は空の文字列。 [String](../data-types/string.md)。

**例**

```sql
SELECT domain('svn+ssh://some.svn-hosting.com:80/repo/trunk');
```

```text
┌─domain('svn+ssh://some.svn-hosting.com:80/repo/trunk')─┐
│ some.svn-hosting.com                                   │
└────────────────────────────────────────────────────────┘
```

### domainRFC {#domainrfc}

URLからホスト名を抽出します。[domain](#domain)に似ていますが、RFC 3986に準拠しています。

**構文**

```sql
domainRFC(url)
```

**引数**

- `url` — URL。 [String](../data-types/string.md)。

**返される値**

- 入力文字列がURLとして解析可能であればホスト名、それ以外の場合は空の文字列。 [String](../data-types/string.md)。

**例**

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

先頭の`www.`が存在する場合、それを取り除いたドメインを返します。

**構文**

```sql
domainWithoutWWW(url)
```

**引数**

- `url` — URL。 [String](../data-types/string.md)。

**返される値**

- 入力文字列がURLとして解析可能であれば（先頭の`www.`なしの）ドメイン名、それ以外の場合は空の文字列。 [String](../data-types/string.md)。

**例**

```sql
SELECT domainWithoutWWW('http://paul@www.example.com:80/');
```

```text
┌─domainWithoutWWW('http://paul@www.example.com:80/')─┐
│ example.com                                         │
└─────────────────────────────────────────────────────┘
```

### domainWithoutWWWRFC {#domainwithoutwwwrfc}

先頭の`www.`が存在する場合、それを取り除いたドメインを返します。[domainWithoutWWW](#domainwithoutwww)に似ていますが、RFC 3986に準拠しています。

**構文**

```sql
domainWithoutWWWRFC(url)
```

**引数**

- `url` — URL。 [String](../data-types/string.md)。

**返される値**

- 入力文字列がURLとして解析可能であれば（先頭の`www.`なしの）ドメイン名、それ以外の場合は空の文字列。 [String](../data-types/string.md)。

**例**

クエリ：

```sql
SELECT
    domainWithoutWWW('http://user:password@www.example.com:8080/path?query=value#fragment'),
    domainWithoutWWWRFC('http://user:password@www.example.com:8080/path?query=value#fragment');
```

結果：

```response
┌─domainWithoutWWW('http://user:password@www.example.com:8080/path?query=value#fragment')─┬─domainWithoutWWWRFC('http://user:password@www.example.com:8080/path?query=value#fragment')─┐
│                                                                                         │ example.com                                                                                │
└─────────────────────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────┘
```

### topLevelDomain {#topleveldomain}

URLからトップレベルドメインを抽出します。

```sql
topLevelDomain(url)
```

**引数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

:::note
URLはプロトコルありまたはなしで指定できます。例：

```text
svn+ssh://some.svn-hosting.com:80/repo/trunk
some.svn-hosting.com:80/repo/trunk
https://clickhouse.com/time/
```
:::

**返される値**

- 入力文字列がURLとして解析可能であればドメイン名。それ以外の場合は空の文字列。 [String](../../sql-reference/data-types/string.md)。

**例**

クエリ：

```sql
SELECT topLevelDomain('svn+ssh://www.some.svn-hosting.com:80/repo/trunk');
```

結果：

```text
┌─topLevelDomain('svn+ssh://www.some.svn-hosting.com:80/repo/trunk')─┐
│ com                                                                │
└────────────────────────────────────────────────────────────────────┘
```

### topLevelDomainRFC {#topleveldomainrfc}

URLからトップレベルドメインを抽出します。
[topLevelDomain](#topleveldomain)に似ていますが、RFC 3986に準拠しています。

```sql
topLevelDomainRFC(url)
```

**引数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

:::note
URLはプロトコルありまたはなしで指定できます。例：

```text
svn+ssh://some.svn-hosting.com:80/repo/trunk
some.svn-hosting.com:80/repo/trunk
https://clickhouse.com/time/
```
:::

**返される値**

- 入力文字列がURLとして解析可能であればドメイン名。それ以外の場合は空の文字列。 [String](../../sql-reference/data-types/string.md)。

**例**

クエリ：

```sql
SELECT topLevelDomain('http://foo:foo%41bar@foo.com'), topLevelDomainRFC('http://foo:foo%41bar@foo.com');
```

結果：

```text
┌─topLevelDomain('http://foo:foo%41bar@foo.com')─┬─topLevelDomainRFC('http://foo:foo%41bar@foo.com')─┐
│                                                │ com                                               │
└────────────────────────────────────────────────┴───────────────────────────────────────────────────┘
```

### firstSignificantSubdomain {#firstsignificantsubdomain}

「最初の重要なサブドメイン」を返します。
最初の重要なサブドメインは、`com`、`net`、`org`、または`co`のときはセカンドレベルドメインであり、それ以外の場合はサードレベルドメインです。
例えば、`firstSignificantSubdomain ('https://news.clickhouse.com/') = 'clickhouse'`、`firstSignificantSubdomain ('https://news.clickhouse.com.tr/') = 'clickhouse'`。
「重要でない」セカンドレベルドメインのリストやその他の実装の詳細は将来的に変更される可能性があります。

**構文**

```sql
firstSignificantSubdomain(url)
```

**引数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

**返される値**

- 最初の重要なサブドメイン。 [String](../data-types/string.md)。

**例**

クエリ：

```sql
SELECT firstSignificantSubdomain('http://www.example.com/a/b/c?a=b')
```

結果：

```reference
┌─firstSignificantSubdomain('http://www.example.com/a/b/c?a=b')─┐
│ example                                                       │
└───────────────────────────────────────────────────────────────┘
```

### firstSignificantSubdomainRFC {#firstsignificantsubdomainrfc}

「最初の重要なサブドメイン」を返します。
最初の重要なサブドメインは、`com`、`net`、`org`、または`co`のときはセカンドレベルドメインであり、それ以外の場合はサードレベルドメインです。
例えば、`firstSignificantSubdomain ('https://news.clickhouse.com/') = 'clickhouse'`、`firstSignificantSubdomain ('https://news.clickhouse.com.tr/') = 'clickhouse'`。
「重要でない」セカンドレベルドメインのリストやその他の実装の詳細は将来的に変更される可能性があります。
[firstSignificantsubdomain](#firstsignificantsubdomain)に似ていますが、RFC 1034に準拠しています。

**構文**

```sql
firstSignificantSubdomainRFC(url)
```

**引数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

**返される値**

- 最初の重要なサブドメイン。 [String](../data-types/string.md)。

**例**

クエリ：

```sql
SELECT
    firstSignificantSubdomain('http://user:password@example.com:8080/path?query=value#fragment'),
    firstSignificantSubdomainRFC('http://user:password@example.com:8080/path?query=value#fragment');
```

結果：

```reference
┌─firstSignificantSubdomain('http://user:password@example.com:8080/path?query=value#fragment')─┬─firstSignificantSubdomainRFC('http://user:password@example.com:8080/path?query=value#fragment')─┐
│                                                                                              │ example                                                                                         │
└──────────────────────────────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### cutToFirstSignificantSubdomain {#cuttofirstsignificantsubdomain}

「最初の重要なサブドメイン」までのトップレベルサブドメインを含むドメインの部分を返します。

**構文**

```sql
cutToFirstSignificantSubdomain(url)
```

**引数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

**返される値**

- 可能であれば、最初の重要なサブドメインまでのトップレベルサブドメインを含むドメインの部分。それ以外の場合は空の文字列。 [String](../data-types/string.md)。

**例**

クエリ：

```sql
SELECT
    cutToFirstSignificantSubdomain('https://news.clickhouse.com.tr/'),
    cutToFirstSignificantSubdomain('www.tr'),
    cutToFirstSignificantSubdomain('tr');
```

結果：

```response
┌─cutToFirstSignificantSubdomain('https://news.clickhouse.com.tr/')─┬─cutToFirstSignificantSubdomain('www.tr')─┬─cutToFirstSignificantSubdomain('tr')─┐
│ clickhouse.com.tr                                                 │ tr                                       │                                      │
└───────────────────────────────────────────────────────────────────┴──────────────────────────────────────────┴──────────────────────────────────────┘
```

### cutToFirstSignificantSubdomainRFC {#cuttofirstsignificantsubdomainrfc}

「最初の重要なサブドメイン」までのトップレベルサブドメインを含むドメインの部分を返します。
[cutToFirstSignificantSubdomain](#cuttofirstsignificantsubdomain)に似ていますが、RFC 3986に準拠しています。

**構文**

```sql
cutToFirstSignificantSubdomainRFC(url)
```

**引数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

**返される値**

- 可能であれば、最初の重要なサブドメインまでのトップレベルサブドメインを含むドメインの部分。それ以外の場合は空の文字列。 [String](../data-types/string.md)。

**例**

クエリ：

```sql
SELECT
    cutToFirstSignificantSubdomain('http://user:password@example.com:8080'),
    cutToFirstSignificantSubdomainRFC('http://user:password@example.com:8080');
```

結果：

```response
┌─cutToFirstSignificantSubdomain('http://user:password@example.com:8080')─┬─cutToFirstSignificantSubdomainRFC('http://user:password@example.com:8080')─┐
│                                                                         │ example.com                                                                │
└─────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────┘
```

### cutToFirstSignificantSubdomainWithWWW {#cuttofirstsignificantsubdomainwithwww}

「最初の重要なサブドメイン」までのトップレベルサブドメインを含むドメインの部分を返しますが、`www`は削除しません。

**構文**

```sql
cutToFirstSignificantSubdomainWithWWW(url)
```

**引数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

**返される値**

- 可能であれば、最初の重要なサブドメインまでのトップレベルサブドメインを含むドメインの部分（`www`あり）。それ以外の場合は空の文字列。 [String](../data-types/string.md)。

**例**

クエリ：

```sql
SELECT
    cutToFirstSignificantSubdomainWithWWW('https://news.clickhouse.com.tr/'),
    cutToFirstSignificantSubdomainWithWWW('www.tr'),
    cutToFirstSignificantSubdomainWithWWW('tr');
```

結果：

```response
┌─cutToFirstSignificantSubdomainWithWWW('https://news.clickhouse.com.tr/')─┬─cutToFirstSignificantSubdomainWithWWW('www.tr')─┬─cutToFirstSignificantSubdomainWithWWW('tr')─┐
│ clickhouse.com.tr                                                        │ www.tr                                          │                                             │
└──────────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────┴─────────────────────────────────────────────┘
```

### cutToFirstSignificantSubdomainWithWWWRFC {#cuttofirstsignificantsubdomainwithwwwrfc}

「最初の重要なサブドメイン」までのトップレベルサブドメインを含むドメインの部分を返しますが、`www`は削除しません。
[cutToFirstSignificantSubdomainWithWWW](#cuttofirstsignificantsubdomaincustomwithwww)に似ていますが、RFC 3986に準拠しています。

**構文**

```sql
cutToFirstSignificantSubdomainWithWWWRFC(url)
```

**引数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

**返される値**

- 可能であれば、最初の重要なサブドメインまでのトップレベルサブドメインを含むドメインの部分（`www`あり）。それ以外の場合は空の文字列。 [String](../data-types/string.md)。

**例**

クエリ：

```sql
SELECT
    cutToFirstSignificantSubdomainWithWWW('http:%2F%2Fwwwww.nova@mail.ru/economicheskiy'),
    cutToFirstSignificantSubdomainWithWWWRFC('http:%2F%2Fwwwww.nova@mail.ru/economicheskiy');
```

結果：

```response
┌─cutToFirstSignificantSubdomainWithWWW('http:%2F%2Fwwwww.nova@mail.ru/economicheskiy')─┬─cutToFirstSignificantSubdomainWithWWWRFC('http:%2F%2Fwwwww.nova@mail.ru/economicheskiy')─┐
│                                                                                       │ mail.ru                                                                                  │
└───────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────┘
```

### cutToFirstSignificantSubdomainCustom {#cuttofirstsignificantsubdomaincustom}

最初の重要なサブドメインまでのトップレベルサブドメインを含むドメインの部分を返します。
カスタム[TLDリスト](https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains)名を受け付けます。
この関数は新しいTLDリストが必要な場合やカスタムリストを持っている場合に便利です。

**構成例**

```xml
<!-- <top_level_domains_path>/var/lib/clickhouse/top_level_domains/</top_level_domains_path> -->
<top_level_domains_lists>
    <!-- https://publicsuffix.org/list/public_suffix_list.dat -->
    <public_suffix_list>public_suffix_list.dat</public_suffix_list>
    <!-- NOTE: path is under top_level_domains_path -->
</top_level_domains_lists>
```

**構文**

```sql
cutToFirstSignificantSubdomain(url, tld)
```

**引数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。
- `tld` — カスタムTLDリスト名。 [String](../../sql-reference/data-types/string.md)。

**返される値**

- 最初の重要なサブドメインまでのトップレベルサブドメインを含むドメインの部分。 [String](../../sql-reference/data-types/string.md)。

**例**

クエリ：

```sql
SELECT cutToFirstSignificantSubdomainCustom('bar.foo.there-is-no-such-domain', 'public_suffix_list');
```

結果：

```text
┌─cutToFirstSignificantSubdomainCustom('bar.foo.there-is-no-such-domain', 'public_suffix_list')─┐
│ foo.there-is-no-such-domain                                                                   │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

**参照**

- [firstSignificantSubdomain](#firstsignificantsubdomain)。

### cutToFirstSignificantSubdomainCustomRFC {#cuttofirstsignificantsubdomaincustomrfc}

最初の重要なサブドメインまでのトップレベルサブドメインを含むドメインの部分を返します。
カスタム[TLDリスト](https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains)名を受け付けます。
この関数は新しいTLDリストが必要な場合やカスタムリストを持っている場合に便利です。
[cutToFirstSignificantSubdomainCustom](#cuttofirstsignificantsubdomaincustom)に似ていますが、RFC 3986に準拠しています。

**構文**

```sql
cutToFirstSignificantSubdomainRFC(url, tld)
```

**引数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。
- `tld` — カスタムTLDリスト名。 [String](../../sql-reference/data-types/string.md)。

**返される値**

- 最初の重要なサブドメインまでのトップレベルサブドメインを含むドメインの部分。 [String](../../sql-reference/data-types/string.md)。

**参照**

- [firstSignificantSubdomain](#firstsignificantsubdomain)。

### cutToFirstSignificantSubdomainCustomWithWWW {#cuttofirstsignificantsubdomaincustomwithwww}

最初の重要なサブドメインまでのトップレベルサブドメインを含むドメインの部分を返しますが、`www`は削除しません。
カスタムTLDリスト名を受け付けます。
これは新しいTLDリストが必要な場合やカスタムリストを持っている場合に便利です。

**構成例**

```xml
<!-- <top_level_domains_path>/var/lib/clickhouse/top_level_domains/</top_level_domains_path> -->
<top_level_domains_lists>
    <!-- https://publicsuffix.org/list/public_suffix_list.dat -->
    <public_suffix_list>public_suffix_list.dat</public_suffix_list>
    <!-- NOTE: path is under top_level_domains_path -->
</top_level_domains_lists>
```

**構文**

```sql
cutToFirstSignificantSubdomainCustomWithWWW(url, tld)
```

**引数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。
- `tld` — カスタムTLDリスト名。 [String](../../sql-reference/data-types/string.md)。

**返される値**

- 最初の重要なサブドメインまでのトップレベルサブドメインを含むドメインの部分（`www`あり）。それ以外の場合は空の文字列。 [String](../data-types/string.md)。

**例**

クエリ：

```sql
SELECT cutToFirstSignificantSubdomainCustomWithWWW('www.foo', 'public_suffix_list');
```

結果：

```text
┌─cutToFirstSignificantSubdomainCustomWithWWW('www.foo', 'public_suffix_list')─┐
│ www.foo                                                                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

**参照**

- [firstSignificantSubdomain](#firstsignificantsubdomain)。
- [top_level_domains_list](../../operations/server-configuration-parameters/settings.md/#top_level_domains_list)

### cutToFirstSignificantSubdomainCustomWithWWWRFC {#cuttofirstsignificantsubdomaincustomwithwwwrfc}

最初の重要なサブドメインまでのトップレベルサブドメインを含むドメインの部分を返しますが、`www`は削除しません。
カスタムTLDリスト名を受け付けます。
新しいTLDリストが必要な場合やカスタムリストを持っている場合に便利です。
[cutToFirstSignificantSubdomainCustomWithWWW](#cuttofirstsignificantsubdomaincustomwithwww)に似ていますが、RFC 3986に準拠しています。

**構文**

```sql
cutToFirstSignificantSubdomainCustomWithWWWRFC(url, tld)
```

**引数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。
- `tld` — カスタムTLDリスト名。 [String](../../sql-reference/data-types/string.md)。

**返される値**

- 最初の重要なサブドメインまでのトップレベルサブドメインを含むドメインの部分（`www`あり）。それ以外の場合は空の文字列。 [String](../../sql-reference/data-types/string.md)。

**参照**

- [firstSignificantSubdomain](#firstsignificantsubdomain)。
- [top_level_domains_list](../../operations/server-configuration-parameters/settings.md/#top_level_domains_list)

### firstSignificantSubdomainCustom {#firstsignificantsubdomaincustom}

最初の重要なサブドメインを返します。
カスタムTLDリスト名を受け付けます。
新しいTLDリストが必要な場合やカスタムリストを持っている場合に便利です。

構成例：

```xml
<!-- <top_level_domains_path>/var/lib/clickhouse/top_level_domains/</top_level_domains_path> -->
<top_level_domains_lists>
    <!-- https://publicsuffix.org/list/public_suffix_list.dat -->
    <public_suffix_list>public_suffix_list.dat</public_suffix_list>
    <!-- NOTE: path is under top_level_domains_path -->
</top_level_domains_lists>
```

**構文**

```sql
firstSignificantSubdomainCustom(url, tld)
```

**引数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。
- `tld` — カスタムTLDリスト名。 [String](../../sql-reference/data-types/string.md)。

**返される値**

- 最初の重要なサブドメイン。 [String](../../sql-reference/data-types/string.md)。

**例**

クエリ：

```sql
SELECT firstSignificantSubdomainCustom('bar.foo.there-is-no-such-domain', 'public_suffix_list');
```

結果：

```text
┌─firstSignificantSubdomainCustom('bar.foo.there-is-no-such-domain', 'public_suffix_list')─┐
│ foo                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**参照**

- [firstSignificantSubdomain](#firstsignificantsubdomain)。
- [top_level_domains_list](../../operations/server-configuration-parameters/settings.md/#top_level_domains_list)

### firstSignificantSubdomainCustomRFC {#firstsignificantsubdomaincustomrfc}

最初の重要なサブドメインを返します。
カスタムTLDリスト名を受け付けます。
新しいTLDリストが必要な場合やカスタムリストを持っている場合に便利です。
[firstSignificantSubdomainCustom](#firstsignificantsubdomaincustom)に似ていますが、RFC 3986に準拠しています。

**構文**

```sql
firstSignificantSubdomainCustomRFC(url, tld)
```

**引数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。
- `tld` — カスタムTLDリスト名。 [String](../../sql-reference/data-types/string.md)。

**返される値**

- 最初の重要なサブドメイン。 [String](../../sql-reference/data-types/string.md)。

**参照**

- [firstSignificantSubdomain](#firstsignificantsubdomain)。
- [top_level_domains_list](../../operations/server-configuration-parameters/settings.md/#top_level_domains_list)

### port {#port}

ポートを返すか、URLにポートが含まれていない場合や解析できない場合は`default_port`を返します。

**構文**

```sql
port(url [, default_port = 0])
```

**引数**

- `url` — URL。 [String](../data-types/string.md)。
- `default_port` — 返されるデフォルトポート番号。 [UInt16](../data-types/int-uint.md)。

**返される値**

- ポートまたは、URLにポートがない場合、または検証エラーの場合はデフォルトポート。 [UInt16](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT port('http://paul@www.example.com:80/');
```

結果：

```response
┌─port('http://paul@www.example.com:80/')─┐
│                                      80 │
└─────────────────────────────────────────┘
```

### portRFC {#portrfc}

ポートを返すか、URLにポートが含まれていない場合や解析できない場合は`default_port`を返します。
[port](#port)に似ていますが、RFC 3986に準拠しています。

**構文**

```sql
portRFC(url [, default_port = 0])
```

**引数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。
- `default_port` — 返されるデフォルトポート番号。 [UInt16](../data-types/int-uint.md)。

**返される値**

- ポートまたは、URLにポートがない場合、または検証エラーの場合はデフォルトポート。 [UInt16](../data-types/int-uint.md)。

**例**

クエリ：

```sql
SELECT
    port('http://user:password@example.com:8080'),
    portRFC('http://user:password@example.com:8080');
```

結果：

```resposne
┌─port('http://user:password@example.com:8080')─┬─portRFC('http://user:password@example.com:8080')─┐
│                                             0 │                                             8080 │
└───────────────────────────────────────────────┴──────────────────────────────────────────────────┘
```

### path {#path}

クエリ文字列なしでパスを返します。

例：`/top/news.html`。

### pathFull {#pathfull}

上記と同じですが、クエリ文字列とフラグメントを含みます。

例：`/top/news.html?page=2#comments`。

### protocol {#protocol-1}

URLからプロトコルを抽出します。 

**構文**

```sql
protocol(url)
```

**引数**

- `url` — プロトコルを抽出するURL。 [String](../data-types/string.md)。

**返される値**

- プロトコル、または決定できない場合は空の文字列。 [String](../data-types/string.md)。

**例**

クエリ：

```sql
SELECT protocol('https://clickhouse.com/');
```

結果：

```response
┌─protocol('https://clickhouse.com/')─┐
│ https                               │
└─────────────────────────────────────┘
```

### queryString {#querystring}

初期の疑問符、`#`、および`#`以降のすべてを除いたクエリ文字列を返します。

例：`page=1&lr=213`。

### fragment {#fragment}

初期のハッシュシンボルを除いたフラグメント識別子を返します。

### queryStringAndFragment {#querystringandfragment}

クエリ文字列とフラグメント識別子を返します。

例：`page=1#29390`。

### extractURLParameter(url, name) {#extracturlparameterurl-name}

URLに`name`パラメータが存在する場合、その値を返し、存在しない場合は空の文字列を返します。
同じ名前のパラメータが複数ある場合、最初の出現が返されます。
関数は、`url`パラメータ内のパラメータが`name`引数と同じ方法でエンコードされていると仮定します。

### extractURLParameters(url) {#extracturlparametersurl}

URLパラメータに対応する`name=value`文字列の配列を返します。
値はデコードされません。

### extractURLParameterNames(url) {#extracturlparameternamesurl}

URLパラメータの名前に対応する名前文字列の配列を返します。
値はデコードされません。

### URLHierarchy(url) {#urlhierarchyurl}

URLを含む配列を返しますが、パスとクエリ文字列によって`/`、`?`の記号で切り詰められます。
連続するセパレーターは一つとしてカウントされます。
切り詰めは、すべての連続するセパレーターの後の位置で行われます。

### URLPathHierarchy(url) {#urlpathhierarchyurl}

上記と同じですが、結果にプロトコルとホストを含みません。 `/`要素（ルート）は含まれません。

```text
URLPathHierarchy('https://example.com/browse/CONV-6788') =
[
    '/browse/',
    '/browse/CONV-6788'
]
```

### encodeURLComponent(url) {#encodeurlcomponenturl}

エンコードされたURLを返します。

例：

```sql
SELECT encodeURLComponent('http://127.0.0.1:8123/?query=SELECT 1;') AS EncodedURL;
```

```text
┌─EncodedURL───────────────────────────────────────────────┐
│ http%3A%2F%2F127.0.0.1%3A8123%2F%3Fquery%3DSELECT%201%3B │
└──────────────────────────────────────────────────────────┘
```

### decodeURLComponent(url) {#decodeurlcomponenturl}

デコードされたURLを返します。

例：

```sql
SELECT decodeURLComponent('http://127.0.0.1:8123/?query=SELECT%201%3B') AS DecodedURL;
```

```text
┌─DecodedURL─────────────────────────────┐
│ http://127.0.0.1:8123/?query=SELECT 1; │
└────────────────────────────────────────┘
```

### encodeURLFormComponent(url) {#encodeurlformcomponenturl}

エンコードされたURLを返します。RFC-1866に従い、スペース（` `）はプラス（`+`）としてエンコードされます。

例：

```sql
SELECT encodeURLFormComponent('http://127.0.0.1:8123/?query=SELECT 1 2+3') AS EncodedURL;
```

```text
┌─EncodedURL────────────────────────────────────────────────┐
│ http%3A%2F%2F127.0.0.1%3A8123%2F%3Fquery%3DSELECT+1+2%2B3 │
└───────────────────────────────────────────────────────────┘
```

### decodeURLFormComponent(url) {#decodeurlformcomponenturl}

デコードされたURLを返します。RFC-1866に従い、通常のプラス（`+`）はスペース（` `）としてデコードされます。

例：

```sql
SELECT decodeURLFormComponent('http://127.0.0.1:8123/?query=SELECT%201+2%2B3') AS DecodedURL;
```

```text
┌─DecodedURL────────────────────────────────┐
│ http://127.0.0.1:8123/?query=SELECT 1 2+3 │
└───────────────────────────────────────────┘
```

### netloc {#netloc}

URLからネットワークローカリティ（`username:password@host:port`）を抽出します。

**構文**

```sql
netloc(url)
```

**引数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md)。

**返される値**

- `username:password@host:port`。 [String](../data-types/string.md)。

**例**

クエリ：

```sql
SELECT netloc('http://paul@www.example.com:80/');
```

結果：

```text
┌─netloc('http://paul@www.example.com:80/')─┐
│ paul@www.example.com:80                   │
└───────────────────────────────────────────┘
```

## URLの部分を削除する関数 {#functions-that-remove-part-of-a-url}

URLに似たものが存在しない場合、URLは変更されません。

### cutWWW {#cutwww}

URLのドメインから先頭の`www.`を削除します（存在する場合）。

### cutQueryString {#cutquerystring}

疑問符を含むクエリ文字列を削除します。

### cutFragment {#cutfragment}

フラグメント識別子を削除します。
### cutQueryStringAndFragment {#cutquerystringandfragment}

クエリ文字列とフラグメント識別子を、クエスチョンマークや番号記号を含めて削除します。
### cutURLParameter(url, name) {#cuturlparameterurl-name}

URLから`name`パラメータを削除します（存在する場合）。
この関数は、パラメータ名の文字をエンコードまたはデコードしません。たとえば、`Client ID`と`Client%20ID`は異なるパラメータ名として扱われます。

**構文**

```sql
cutURLParameter(url, name)
```

**引数**

- `url` — URL。 [String](../../sql-reference/data-types/string.md).
- `name` — URLパラメータの名前。 [String](../../sql-reference/data-types/string.md) または [Array](../../sql-reference/data-types/array.md) の Strings。

**戻り値**

- `name` URLパラメータが削除されたURL。 [String](../data-types/string.md)。

**例**

クエリ:

```sql
SELECT
    cutURLParameter('http://bigmir.net/?a=b&c=d&e=f#g', 'a') as url_without_a,
    cutURLParameter('http://bigmir.net/?a=b&c=d&e=f#g', ['c', 'e']) as url_without_c_and_e;
```

結果:

```text
┌─url_without_a────────────────┬─url_without_c_and_e──────┐
│ http://bigmir.net/?c=d&e=f#g │ http://bigmir.net/?a=b#g │
└──────────────────────────────┴──────────────────────────┘
```
