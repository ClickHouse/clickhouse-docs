---
alias: []
description: 'フォーム形式に関するドキュメント'
input_format: true
keywords: ['Form']
output_format: false
slug: /interfaces/formats/Form
title: 'フォーム'
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✔     | ✗      |       |


## 説明 {#description}

`Form` 形式は、アプリケーション/x-www-form-urlencoded 形式で単一のレコードを読み取るために使用できます。この形式では、データは `key1=value1&key2=value2` のようにフォーマットされています。

## 使用例 {#example-usage}

URLエンコードされたデータを含む `user_files` パスに配置されたファイル `data.tmp` があるとします：

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

## 形式設定 {#format-settings}
