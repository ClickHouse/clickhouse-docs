---
alias: []
description: 'Form フォーマットのドキュメント'
input_format: true
keywords: ['Form']
output_format: false
slug: /interfaces/formats/Form
title: 'Form'
doc_type: 'reference'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✗      |       |

## 説明 {#description}

`Form` 形式は、`application/x-www-form-urlencoded` 形式の単一レコードを読み取るために使用できます。
この形式では、データは `key1=value1&key2=value2` のようにフォーマットされます。

## 使用例 {#example-usage}

URL エンコードされたデータを含む `data.tmp` というファイルが `user_files` パスに配置されているとします。

```text title="data.tmp"
t_page=116&c.e=ls7xfkpm&c.tti.m=raf&rt.start=navigation&rt.bmr=390%2C11%2C10
```

```sql title="Query"
SELECT * FROM file(data.tmp, Form) FORMAT vertical;
```

```response title="Response"
行 1:
──────
t_page:   116
c.e:      ls7xfkpm
c.tti.m:  raf
rt.start: navigation
rt.bmr:   390,11,10
```


## 書式設定 {#format-settings}