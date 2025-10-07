---
slug: '/sql-reference/functions/url-functions'
sidebar_label: URL
description: 'Документация для Функции для работы с URL'
title: 'Функции для работы с URL'
doc_type: reference
---
# Функции для работы с URL

:::note
Функции, упомянутые в этом разделе, оптимизированы для максимальной производительности и в основном не соответствуют стандарту RFC-3986. Функции, которые реализуют RFC-3986, имеют суффикс `RFC` в названии функции и, как правило, работают медленнее.
:::

Вы можете использовать варианты функций без `RFC` при работе с общедоступно зарегистрированными доменами, которые не содержат строк пользователей и символов `@`.
В таблице ниже указано, какие символы в URL могут (`✔`) или не могут (`✗`) быть обработаны соответствующими вариантами `RFC` и non-`RFC`:

| Символ | non-`RFC` | `RFC` |
|--------|-----------|-------|
| ' '    | ✗         | ✗     |
|  \t    | ✗         | ✗     |
|  &lt;  | ✗         | ✗     |
|  >     | ✗         | ✗     |
|  %     | ✗         | ✔*    |
|  \{    | ✗         | ✗     |
|  }     | ✗         | ✗     |
|  \|    | ✗         | ✗     |
|  \\    | ✗         | ✗     |
|  ^     | ✗         | ✗     |
|  ~     | ✗         | ✔*    |
|  [     | ✗         | ✗     |
|  ]     | ✗         | ✔     |
|  ;     | ✗         | ✔*    |
|  =     | ✗         | ✔*    |
|  &     | ✗         | ✔*    |

Символы, помеченные `*`, являются суб-делимитерами в RFC 3986 и разрешены для пользовательской информации после символа `@`.

## Функции, извлекающие части URL {#functions-that-extract-parts-of-a-url}

Если соответствующая часть отсутствует в URL, возвращается пустая строка.

### protocol {#protocol}

Извлекает протокол из URL.

Примеры типичных возвращаемых значений: http, https, ftp, mailto, tel, magnet.

### domain {#domain}

Извлекает имя хоста из URL.

**Синтаксис**

```sql
domain(url)
```

**Аргументы**

- `url` — URL. [String](../../sql-reference/data-types/string.md).

URL может быть указан с протоколом или без него. Примеры:

```text
svn+ssh://some.svn-hosting.com:80/repo/trunk
some.svn-hosting.com:80/repo/trunk
https://clickhouse.com/time/
```

Для этих примеров функция `domain` возвращает следующие результаты:

```text
some.svn-hosting.com
some.svn-hosting.com
clickhouse.com
```

**Возвращаемые значения**

- Имя хоста, если входная строка может быть проанализирована как URL, иначе пустая строка. [String](../data-types/string.md).

**Пример**

```sql
SELECT domain('svn+ssh://some.svn-hosting.com:80/repo/trunk');
```

```text
┌─domain('svn+ssh://some.svn-hosting.com:80/repo/trunk')─┐
│ some.svn-hosting.com                                   │
└────────────────────────────────────────────────────────┘
```

### domainRFC {#domainrfc}

Извлекает имя хоста из URL. Похоже на [domain](#domain), но соответствует RFC 3986.

**Синтаксис**

```sql
domainRFC(url)
```

**Аргументы**

- `url` — URL. [String](../data-types/string.md).

**Возвращаемые значения**

- Имя хоста, если входная строка может быть проанализирована как URL, иначе пустая строка. [String](../data-types/string.md).

**Пример**

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

Возвращает домен без ведущего `www.`, если он присутствует.

**Синтаксис**

```sql
domainWithoutWWW(url)
```

**Аргументы**

- `url` — URL. [String](../data-types/string.md).

**Возвращаемые значения**

- Имя домена, если входная строка может быть проанализирована как URL (без ведущего `www.`), иначе пустая строка. [String](../data-types/string.md).

**Пример**

```sql
SELECT domainWithoutWWW('http://paul@www.example.com:80/');
```

```text
┌─domainWithoutWWW('http://paul@www.example.com:80/')─┐
│ example.com                                         │
└─────────────────────────────────────────────────────┘
```

### domainWithoutWWWRFC {#domainwithoutwwwrfc}

Возвращает домен без ведущего `www.`, если он присутствует. Похоже на [domainWithoutWWW](#domainwithoutwww), но соответствует RFC 3986.

**Синтаксис**

```sql
domainWithoutWWWRFC(url)
```

**Аргументы**

- `url` — URL. [String](../data-types/string.md).

**Возвращаемые значения**

- Имя домена, если входная строка может быть проанализирована как URL (без ведущего `www.`), иначе пустая строка. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT
    domainWithoutWWW('http://user:password@www.example.com:8080/path?query=value#fragment'),
    domainWithoutWWWRFC('http://user:password@www.example.com:8080/path?query=value#fragment');
```

Результат:

```response
┌─domainWithoutWWW('http://user:password@www.example.com:8080/path?query=value#fragment')─┬─domainWithoutWWWRFC('http://user:password@www.example.com:8080/path?query=value#fragment')─┐
│                                                                                         │ example.com                                                                                │
└─────────────────────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────┘
```

### topLevelDomain {#topleveldomain}

Извлекает домен верхнего уровня из URL.

```sql
topLevelDomain(url)
```

**Аргументы**

- `url` — URL. [String](../../sql-reference/data-types/string.md).

:::note
URL может быть указан с протоколом или без него. Примеры:

```text
svn+ssh://some.svn-hosting.com:80/repo/trunk
some.svn-hosting.com:80/repo/trunk
https://clickhouse.com/time/
```
:::

**Возвращаемые значения**

- Имя домена, если входная строка может быть проанализирована как URL. В противном случае — пустая строка. [String](../../sql-reference/data-types/string.md).

**Пример**

Запрос:

```sql
SELECT topLevelDomain('svn+ssh://www.some.svn-hosting.com:80/repo/trunk');
```

Результат:

```text
┌─topLevelDomain('svn+ssh://www.some.svn-hosting.com:80/repo/trunk')─┐
│ com                                                                │
└────────────────────────────────────────────────────────────────────┘
```

### topLevelDomainRFC {#topleveldomainrfc}

Извлекает домен верхнего уровня из URL. Похоже на [topLevelDomain](#topleveldomain), но соответствует RFC 3986.

```sql
topLevelDomainRFC(url)
```

**Аргументы**

- `url` — URL. [String](../../sql-reference/data-types/string.md).

:::note
URL может быть указан с протоколом или без него. Примеры:

```text
svn+ssh://some.svn-hosting.com:80/repo/trunk
some.svn-hosting.com:80/repo/trunk
https://clickhouse.com/time/
```
:::

**Возвращаемые значения**

- Имя домена, если входная строка может быть проанализирована как URL. В противном случае — пустая строка. [String](../../sql-reference/data-types/string.md).

**Пример**

Запрос:

```sql
SELECT topLevelDomain('http://foo:foo%41bar@foo.com'), topLevelDomainRFC('http://foo:foo%41bar@foo.com');
```

Результат:

```text
┌─topLevelDomain('http://foo:foo%41bar@foo.com')─┬─topLevelDomainRFC('http://foo:foo%41bar@foo.com')─┐
│                                                │ com                                               │
└────────────────────────────────────────────────┴───────────────────────────────────────────────────┘
```

### firstSignificantSubdomain {#firstsignificantsubdomain}

Возвращает "первый значимый поддомен".
Первый значимый поддомен — это домен второго уровня для `com`, `net`, `org` или `co`, иначе это домен третьего уровня.
Например, `firstSignificantSubdomain ('https://news.clickhouse.com/') = 'clickhouse'`, `firstSignificantSubdomain ('https://news.clickhouse.com.tr/') = 'clickhouse'`.
Список "незначительных" доменов второго уровня и другие детали реализации могут измениться в будущем.

**Синтаксис**

```sql
firstSignificantSubdomain(url)
```

**Аргументы**

- `url` — URL. [String](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

- Первый значимый поддомен. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT firstSignificantSubdomain('http://www.example.com/a/b/c?a=b')
```

Результат:

```reference
┌─firstSignificantSubdomain('http://www.example.com/a/b/c?a=b')─┐
│ example                                                       │
└───────────────────────────────────────────────────────────────┘
```

### firstSignificantSubdomainRFC {#firstsignificantsubdomainrfc}

Возвращает "первый значимый поддомен".
Первый значимый поддомен — это домен второго уровня для `com`, `net`, `org` или `co`, иначе это домен третьего уровня.
Например, `firstSignificantSubdomain ('https://news.clickhouse.com/') = 'clickhouse'`, `firstSignificantSubdomain ('https://news.clickhouse.com.tr/') = 'clickhouse'`.
Список "незначительных" доменов второго уровня и другие детали реализации могут измениться в будущем. Похоже на [firstSignificantSubdomain](#firstsignificantsubdomain), но соответствует RFC 1034.

**Синтаксис**

```sql
firstSignificantSubdomainRFC(url)
```

**Аргументы**

- `url` — URL. [String](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

- Первый значимый поддомен. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT
    firstSignificantSubdomain('http://user:password@example.com:8080/path?query=value#fragment'),
    firstSignificantSubdomainRFC('http://user:password@example.com:8080/path?query=value#fragment');
```

Результат:

```reference
┌─firstSignificantSubdomain('http://user:password@example.com:8080/path?query=value#fragment')─┬─firstSignificantSubdomainRFC('http://user:password@example.com:8080/path?query=value#fragment')─┐
│                                                                                              │ example                                                                                         │
└──────────────────────────────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### cutToFirstSignificantSubdomain {#cuttofirstsignificantsubdomain}

Возвращает часть домена, которая включает домены верхнего уровня до ["первого значимого поддомена"](#firstsignificantsubdomain).

**Синтаксис**

```sql
cutToFirstSignificantSubdomain(url)
```

**Аргументы**

- `url` — URL. [String](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

- Часть домена, которая включает домены верхнего уровня до первого значимого поддомена, если это возможно, в противном случае возвращает пустую строку. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT
    cutToFirstSignificantSubdomain('https://news.clickhouse.com.tr/'),
    cutToFirstSignificantSubdomain('www.tr'),
    cutToFirstSignificantSubdomain('tr');
```

Результат:

```response
┌─cutToFirstSignificantSubdomain('https://news.clickhouse.com.tr/')─┬─cutToFirstSignificantSubdomain('www.tr')─┬─cutToFirstSignificantSubdomain('tr')─┐
│ clickhouse.com.tr                                                 │ tr                                       │                                      │
└───────────────────────────────────────────────────────────────────┴──────────────────────────────────────────┴──────────────────────────────────────┘
```

### cutToFirstSignificantSubdomainRFC {#cuttofirstsignificantsubdomainrfc}

Возвращает часть домена, которая включает домены верхнего уровня до ["первого значимого поддомена"](#firstsignificantsubdomain). Похоже на [cutToFirstSignificantSubdomain](#cuttofirstsignificantsubdomain), но соответствует RFC 3986.

**Синтаксис**

```sql
cutToFirstSignificantSubdomainRFC(url)
```

**Аргументы**

- `url` — URL. [String](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

- Часть домена, которая включает домены верхнего уровня до первого значимого поддомена, если это возможно, в противном случае возвращает пустую строку. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT
    cutToFirstSignificantSubdomain('http://user:password@example.com:8080'),
    cutToFirstSignificantSubdomainRFC('http://user:password@example.com:8080');
```

Результат:

```response
┌─cutToFirstSignificantSubdomain('http://user:password@example.com:8080')─┬─cutToFirstSignificantSubdomainRFC('http://user:password@example.com:8080')─┐
│                                                                         │ example.com                                                                │
└─────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────────┘
```

### cutToFirstSignificantSubdomainWithWWW {#cuttofirstsignificantsubdomainwithwww}

Возвращает часть домена, которая включает домены верхнего уровня до "первого значимого поддомена", не удаляя `www`.

**Синтаксис**

```sql
cutToFirstSignificantSubdomainWithWWW(url)
```

**Аргументы**

- `url` — URL. [String](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

- Часть домена, которая включает домены верхнего уровня до первого значимого поддомена (с `www`), если это возможно, в противном случае возвращает пустую строку. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT
    cutToFirstSignificantSubdomainWithWWW('https://news.clickhouse.com.tr/'),
    cutToFirstSignificantSubdomainWithWWW('www.tr'),
    cutToFirstSignificantSubdomainWithWWW('tr');
```

Результат:

```response
┌─cutToFirstSignificantSubdomainWithWWW('https://news.clickhouse.com.tr/')─┬─cutToFirstSignificantSubdomainWithWWW('www.tr')─┬─cutToFirstSignificantSubdomainWithWWW('tr')─┐
│ clickhouse.com.tr                                                        │ www.tr                                          │                                             │
└──────────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────┴─────────────────────────────────────────────┘
```

### cutToFirstSignificantSubdomainWithWWWRFC {#cuttofirstsignificantsubdomainwithwwwrfc}

Возвращает часть домена, которая включает домены верхнего уровня до "первого значимого поддомена", не удаляя `www`. Похоже на [cutToFirstSignificantSubdomainWithWWW](#cuttofirstsignificantsubdomainwithwww), но соответствует RFC 3986.

**Синтаксис**

```sql
cutToFirstSignificantSubdomainWithWWW(url)
```

**Аргументы**

- `url` — URL. [String](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

- Часть домена, которая включает домены верхнего уровня до первого значимого поддомена (с "www"), если это возможно, в противном случае возвращает пустую строку. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT
    cutToFirstSignificantSubdomainWithWWW('http:%2F%2Fwwwww.nova@mail.ru/economicheskiy'),
    cutToFirstSignificantSubdomainWithWWWRFC('http:%2F%2Fwwwww.nova@mail.ru/economicheskiy');
```

Результат:

```response
┌─cutToFirstSignificantSubdomainWithWWW('http:%2F%2Fwwwww.nova@mail.ru/economicheskiy')─┬─cutToFirstSignificantSubdomainWithWWWRFC('http:%2F%2Fwwwww.nova@mail.ru/economicheskiy')─┐
│                                                                                       │ mail.ru                                                                                  │
└───────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────┘
```

### cutToFirstSignificantSubdomainCustom {#cuttofirstsignificantsubdomaincustom}

Возвращает часть домена, которая включает домены верхнего уровня до первого значимого поддомена.
Принимает произвольное имя [списка TLD](https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains).
Эта функция может быть полезна, если вам нужен новый список TLD или если у вас есть пользовательский список.

**Пример конфигурации**

```xml
<!-- <top_level_domains_path>/var/lib/clickhouse/top_level_domains/</top_level_domains_path> -->
<top_level_domains_lists>
    <!-- https://publicsuffix.org/list/public_suffix_list.dat -->
    <public_suffix_list>public_suffix_list.dat</public_suffix_list>
    <!-- NOTE: path is under top_level_domains_path -->
</top_level_domains_lists>
```

**Синтаксис**

```sql
cutToFirstSignificantSubdomain(url, tld)
```

**Аргументы**

- `url` — URL. [String](../../sql-reference/data-types/string.md).
- `tld` — Имя произвольного списка TLD. [String](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

- Часть домена, которая включает домены верхнего уровня до первого значимого поддомена. [String](../../sql-reference/data-types/string.md).

**Пример**

Запрос:

```sql
SELECT cutToFirstSignificantSubdomainCustom('bar.foo.there-is-no-such-domain', 'public_suffix_list');
```

Результат:

```text
┌─cutToFirstSignificantSubdomainCustom('bar.foo.there-is-no-such-domain', 'public_suffix_list')─┐
│ foo.there-is-no-such-domain                                                                   │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Смотрите также**

- [firstSignificantSubdomain](#firstsignificantsubdomain).

### cutToFirstSignificantSubdomainCustomRFC {#cuttofirstsignificantsubdomaincustomrfc}

Возвращает часть домена, которая включает домены верхнего уровня до первого значимого поддомена.
Принимает произвольное имя [списка TLD](https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains).
Эта функция может быть полезна, если вам нужен новый список TLD или если у вас есть пользовательский список. Похоже на [cutToFirstSignificantSubdomainCustom](#cuttofirstsignificantsubdomaincustom), но соответствует RFC 3986.

**Синтаксис**

```sql
cutToFirstSignificantSubdomainRFC(url, tld)
```

**Аргументы**

- `url` — URL. [String](../../sql-reference/data-types/string.md).
- `tld` — Имя произвольного списка TLD. [String](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

- Часть домена, которая включает домены верхнего уровня до первого значимого поддомена. [String](../../sql-reference/data-types/string.md).

**Смотрите также**

- [firstSignificantSubdomain](#firstsignificantsubdomain).

### cutToFirstSignificantSubdomainCustomWithWWW {#cuttofirstsignificantsubdomaincustomwithwww}

Возвращает часть домена, которая включает домены верхнего уровня до первого значимого поддомена без удаления `www`.
Принимает произвольное имя списка TLD.
Это может быть полезно, если вам нужен новый список TLD или если у вас есть пользовательский список.

**Пример конфигурации**

```xml
<!-- <top_level_domains_path>/var/lib/clickhouse/top_level_domains/</top_level_domains_path> -->
<top_level_domains_lists>
    <!-- https://publicsuffix.org/list/public_suffix_list.dat -->
    <public_suffix_list>public_suffix_list.dat</public_suffix_list>
    <!-- NOTE: path is under top_level_domains_path -->
</top_level_domains_lists>
```

**Синтаксис**

```sql
cutToFirstSignificantSubdomainCustomWithWWW(url, tld)
```

**Аргументы**

- `url` — URL. [String](../../sql-reference/data-types/string.md).
- `tld` — Имя произвольного списка TLD. [String](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

- Часть домена, которая включает домены верхнего уровня до первого значимого поддомена без удаления `www`. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT cutToFirstSignificantSubdomainCustomWithWWW('www.foo', 'public_suffix_list');
```

Результат:

```text
┌─cutToFirstSignificantSubdomainCustomWithWWW('www.foo', 'public_suffix_list')─┐
│ www.foo                                                                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Смотрите также**

- [firstSignificantSubdomain](#firstsignificantsubdomain).
- [top_level_domains_list](../../operations/server-configuration-parameters/settings.md/#top_level_domains_list)

### cutToFirstSignificantSubdomainCustomWithWWWRFC {#cuttofirstsignificantsubdomaincustomwithwwwrfc}

Возвращает часть домена, которая включает домены верхнего уровня до первого значимого поддомена без удаления `www`.
Принимает произвольное имя списка TLD.
Это может быть полезно, если вам нужен новый список TLD или если у вас есть пользовательский список. Похоже на [cutToFirstSignificantSubdomainCustomWithWWW](#cuttofirstsignificantsubdomaincustomwithwww), но соответствует RFC 3986.

**Синтаксис**

```sql
cutToFirstSignificantSubdomainCustomWithWWWRFC(url, tld)
```

**Аргументы**

- `url` — URL. [String](../../sql-reference/data-types/string.md).
- `tld` — Имя произвольного списка TLD. [String](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

- Часть домена, которая включает домены верхнего уровня до первого значимого поддомена без удаления `www`. [String](../../sql-reference/data-types/string.md).

**Смотрите также**

- [firstSignificantSubdomain](#firstsignificantsubdomain).
- [top_level_domains_list](../../operations/server-configuration-parameters/settings.md/#top_level_domains_list)

### firstSignificantSubdomainCustom {#firstsignificantsubdomaincustom}

Возвращает первый значимый поддомен.
Принимает произвольное имя списка TLD.
Может быть полезно, если вам нужен новый список TLD или у вас есть пользовательский.

Пример конфигурации:

```xml
<!-- <top_level_domains_path>/var/lib/clickhouse/top_level_domains/</top_level_domains_path> -->
<top_level_domains_lists>
    <!-- https://publicsuffix.org/list/public_suffix_list.dat -->
    <public_suffix_list>public_suffix_list.dat</public_suffix_list>
    <!-- NOTE: path is under top_level_domains_path -->
</top_level_domains_lists>
```

**Синтаксис**

```sql
firstSignificantSubdomainCustom(url, tld)
```

**Аргументы**

- `url` — URL. [String](../../sql-reference/data-types/string.md).
- `tld` — Имя произвольного списка TLD. [String](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

- Первый значимый поддомен. [String](../../sql-reference/data-types/string.md).

**Пример**

Запрос:

```sql
SELECT firstSignificantSubdomainCustom('bar.foo.there-is-no-such-domain', 'public_suffix_list');
```

Результат:

```text
┌─firstSignificantSubdomainCustom('bar.foo.there-is-no-such-domain', 'public_suffix_list')─┐
│ foo                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

**Смотрите также**

- [firstSignificantSubdomain](#firstsignificantsubdomain).
- [top_level_domains_list](../../operations/server-configuration-parameters/settings.md/#top_level_domains_list)

### firstSignificantSubdomainCustomRFC {#firstsignificantsubdomaincustomrfc}

Возвращает первый значимый поддомен. Принимает произвольное имя списка TLD. Может быть полезно, если вам нужен новый список TLD или у вас есть пользовательский. Похоже на [firstSignificantSubdomainCustom](#firstsignificantsubdomaincustom), но соответствует RFC 3986.

**Синтаксис**

```sql
firstSignificantSubdomainCustomRFC(url, tld)
```

**Аргументы**

- `url` — URL. [String](../../sql-reference/data-types/string.md).
- `tld` — Имя произвольного списка TLD. [String](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

- Первый значимый поддомен. [String](../../sql-reference/data-types/string.md).

**Смотрите также**

- [firstSignificantSubdomain](#firstsignificantsubdomain).
- [top_level_domains_list](../../operations/server-configuration-parameters/settings.md/#top_level_domains_list)

### port {#port}

Возвращает порт или `default_port`, если URL не содержит порта или не может быть проанализирован.

**Синтаксис**

```sql
port(url [, default_port = 0])
```

**Аргументы**

- `url` — URL. [String](../data-types/string.md).
- `default_port` — Номер порта по умолчанию, который будет возвращен. [UInt16](../data-types/int-uint.md).

**Возвращаемое значение**

- Порт или порт по умолчанию, если в URL нет порта или в случае ошибки проверки. [UInt16](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT port('http://paul@www.example.com:80/');
```

Результат:

```response
┌─port('http://paul@www.example.com:80/')─┐
│                                      80 │
└─────────────────────────────────────────┘
```

### portRFC {#portrfc}

Возвращает порт или `default_port`, если URL не содержит порта или не может быть проанализирован. Похоже на [port](#port), но соответствует RFC 3986.

**Синтаксис**

```sql
portRFC(url [, default_port = 0])
```

**Аргументы**

- `url` — URL. [String](../../sql-reference/data-types/string.md).
- `default_port` — Номер порта по умолчанию, который будет возвращен. [UInt16](../data-types/int-uint.md).

**Возвращаемое значение**

- Порт или порт по умолчанию, если в URL нет порта или в случае ошибки проверки. [UInt16](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT
    port('http://user:password@example.com:8080'),
    portRFC('http://user:password@example.com:8080');
```

Результат:

```resposne
┌─port('http://user:password@example.com:8080')─┬─portRFC('http://user:password@example.com:8080')─┐
│                                             0 │                                             8080 │
└───────────────────────────────────────────────┴──────────────────────────────────────────────────┘
```

### path {#path}

Возвращает путь без строки запроса.

Пример: `/top/news.html`.

### pathFull {#pathfull}

То же самое, что и выше, но включает строку запроса и фрагмент.

Пример: `/top/news.html?page=2#comments`.

### protocol {#protocol-1}

Извлекает протокол из URL.

**Синтаксис**

```sql
protocol(url)
```

**Аргументы**

- `url` — URL, из которого извлекается протокол. [String](../data-types/string.md).

**Возвращаемое значение**

- Протокол или пустая строка, если его нельзя определить. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT protocol('https://clickhouse.com/');
```

Результат:

```response
┌─protocol('https://clickhouse.com/')─┐
│ https                               │
└─────────────────────────────────────┘
```

### queryString {#querystring}

Возвращает строку запроса без начального знака вопроса, `#` и всего, что после `#`.

Пример: `page=1&lr=213`.

### fragment {#fragment}

Возвращает идентификатор фрагмента без начального символа хеширования.

### queryStringAndFragment {#querystringandfragment}

Возвращает строку запроса и идентификатор фрагмента.

Пример: `page=1#29390`.

### extractURLParameter(url, name) {#extracturlparameterurl-name}

Возвращает значение параметра `name` в URL, если он присутствует, иначе возвращается пустая строка.
Если есть несколько параметров с этим именем, возвращается первое вхождение.
Функция предполагает, что параметр в параметре `url` закодирован так же, как и в аргументе `name`.

### extractURLParameters(url) {#extracturlparametersurl}

Возвращает массив строк `name=value`, соответствующих параметрам URL.
Значения не декодируются.

### extractURLParameterNames(url) {#extracturlparameternamesurl}

Возвращает массив строк имен, соответствующих именам параметров URL.
Значения не декодируются.

### URLHierarchy(url) {#urlhierarchyurl}

Возвращает массив, содержащий URL, обрезанный в конце символами /,? в пути и строке запроса.
Последовательные символы-разделители учитываются как один.
Нарезка производится сразу после всех последовательных символов-разделителей.

### URLPathHierarchy(url) {#urlpathhierarchyurl}

То же самое, что и выше, но без протокола и хоста в результате. Элемент / (корень) не включен.

```text
URLPathHierarchy('https://example.com/browse/CONV-6788') =
[
    '/browse/',
    '/browse/CONV-6788'
]
```

### encodeURLComponent(url) {#encodeurlcomponenturl}

Возвращает закодированный URL.

Пример:

```sql
SELECT encodeURLComponent('http://127.0.0.1:8123/?query=SELECT 1;') AS EncodedURL;
```

```text
┌─EncodedURL───────────────────────────────────────────────┐
│ http%3A%2F%2F127.0.0.1%3A8123%2F%3Fquery%3DSELECT%201%3B │
└──────────────────────────────────────────────────────────┘
```

### decodeURLComponent(url) {#decodeurlcomponenturl}

Возвращает декодированный URL.

Пример:

```sql
SELECT decodeURLComponent('http://127.0.0.1:8123/?query=SELECT%201%3B') AS DecodedURL;
```

```text
┌─DecodedURL─────────────────────────────┐
│ http://127.0.0.1:8123/?query=SELECT 1; │
└────────────────────────────────────────┘
```

### encodeURLFormComponent(url) {#encodeurlformcomponenturl}

Возвращает закодированный URL. Соответствует rfc-1866, пробел (` `) закодирован как плюс (`+`).

Пример:

```sql
SELECT encodeURLFormComponent('http://127.0.0.1:8123/?query=SELECT 1 2+3') AS EncodedURL;
```

```text
┌─EncodedURL────────────────────────────────────────────────┐
│ http%3A%2F%2F127.0.0.1%3A8123%2F%3Fquery%3DSELECT+1+2%2B3 │
└───────────────────────────────────────────────────────────┘
```

### decodeURLFormComponent(url) {#decodeurlformcomponenturl}

Возвращает декодированный URL. Соответствует rfc-1866, простой плюс (`+`) декодируется как пробел (` `).

Пример:

```sql
SELECT decodeURLFormComponent('http://127.0.0.1:8123/?query=SELECT%201+2%2B3') AS DecodedURL;
```

```text
┌─DecodedURL────────────────────────────────┐
│ http://127.0.0.1:8123/?query=SELECT 1 2+3 │
└───────────────────────────────────────────┘
```

### netloc {#netloc}

Извлекает сетевую локальность (`username:password@host:port`) из URL.

**Синтаксис**

```sql
netloc(url)
```

**Аргументы**

- `url` — URL. [String](../../sql-reference/data-types/string.md).

**Возвращаемое значение**

- `username:password@host:port`. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT netloc('http://paul@www.example.com:80/');
```

Результат:

```text
┌─netloc('http://paul@www.example.com:80/')─┐
│ paul@www.example.com:80                   │
└───────────────────────────────────────────┘
```

## Функции, которые удаляют часть URL {#functions-that-remove-part-of-a-url}

Если в URL нет ничего подобного, URL остается без изменений.

### cutWWW {#cutwww}

Удаляет ведущий `www.` (если присутствует) из домена URL.

### cutQueryString {#cutquerystring}

Удаляет строку запроса, включая знак вопроса.

### cutFragment {#cutfragment}

Удаляет идентификатор фрагмента, включая знак решетки.

### cutQueryStringAndFragment {#cutquerystringandfragment}

Удаляет строку запроса и идентификатор фрагмента, включая знак вопроса и знак решетки.

### cutURLParameter(url, name) {#cuturlparameterurl-name}

Удаляет параметр `name` из URL, если он присутствует.
Эта функция не кодирует и не декодирует символы в именах параметров, например, `Client ID` и `Client%20ID` рассматриваются как разные имена параметров.

**Синтаксис**

```sql
cutURLParameter(url, name)
```

**Аргументы**

- `url` — URL. [String](../../sql-reference/data-types/string.md).
- `name` — имя параметра URL. [String](../../sql-reference/data-types/string.md) или [Array](../../sql-reference/data-types/array.md) строк.

**Возвращаемое значение**

- url с удаленным параметром URL `name`. [String](../data-types/string.md).

**Пример**

Запрос:

```sql
SELECT
    cutURLParameter('http://bigmir.net/?a=b&c=d&e=f#g', 'a') AS url_without_a,
    cutURLParameter('http://bigmir.net/?a=b&c=d&e=f#g', ['c', 'e']) AS url_without_c_and_e;
```

Результат:

```text
┌─url_without_a────────────────┬─url_without_c_and_e──────┐
│ http://bigmir.net/?c=d&e=f#g │ http://bigmir.net/?a=b#g │
└──────────────────────────────┴──────────────────────────┘
```