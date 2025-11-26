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

`Form` フォーマットは、データが `key1=value1&key2=value2` のように整形された application/x-www-form-urlencoded 形式の単一レコードを読み取るために使用できます。



## 使用例

URL エンコードされたデータを含む `data.tmp` ファイルが `user_files` パスに配置されているとします。

```text title="data.tmp"
t_page=116&c.e=ls7xfkpm&c.tti.m=raf&rt.start=navigation&rt.bmr=390%2C11%2C10
```

```sql title="Query"
SELECT * FROM file(data.tmp, Form) FORMAT vertical;
```

```response title="Response"
Row 1:
──────
t_page:   116
c.e:      ls7xfkpm
c.tti.m:  raf
rt.start: navigation
rt.bmr:   390,11,10
```


## 書式設定 {#format-settings}
