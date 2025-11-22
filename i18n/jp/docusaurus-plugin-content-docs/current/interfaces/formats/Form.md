---
alias: []
description: 'Form フォーマットに関するドキュメント'
input_format: true
keywords: ['Form']
output_format: false
slug: /interfaces/formats/Form
title: 'Form'
doc_type: 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |



## Description {#description}

`Form`フォーマットは、application/x-www-form-urlencoded形式の単一レコードを読み取るために使用できます。
データは`key1=value1&key2=value2`の形式でフォーマットされます。


## 使用例 {#example-usage}

`user_files`パスに配置された、URLエンコードされたデータを含むファイル`data.tmp`がある場合:

```text title="data.tmp"
t_page=116&c.e=ls7xfkpm&c.tti.m=raf&rt.start=navigation&rt.bmr=390%2C11%2C10
```

```sql title="クエリ"
SELECT * FROM file(data.tmp, Form) FORMAT vertical;
```

```response title="レスポンス"
Row 1:
──────
t_page:   116
c.e:      ls7xfkpm
c.tti.m:  raf
rt.start: navigation
rt.bmr:   390,11,10
```


## フォーマット設定 {#format-settings}
