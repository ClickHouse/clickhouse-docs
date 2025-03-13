---
title: Form
slug: /interfaces/formats/Form
keywords: [Form]
input_format: true
output_format: false
alias: []
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |


## 説明 {#description}

`Form` フォーマットは、データが `key1=value1&key2=value2` 形式でフォーマットされた
application/x-www-form-urlencoded フォーマットの単一レコードを読み取るために使用できます。

## 使用例 {#example-usage}

URL エンコードされたデータがある `user_files` パスに配置されたファイル `data.tmp` があるとします:

```text title="data.tmp"
t_page=116&c.e=ls7xfkpm&c.tti.m=raf&rt.start=navigation&rt.bmr=390%2C11%2C10
```

```sql title="クエリ"
SELECT * FROM file(data.tmp, Form) FORMAT vertical;
```

```response title="レスポンス"
行 1:
──────
t_page:   116
c.e:      ls7xfkpm
c.tti.m:  raf
rt.start: navigation
rt.bmr:   390,11,10
```

## フォーマット設定 {#format-settings}
