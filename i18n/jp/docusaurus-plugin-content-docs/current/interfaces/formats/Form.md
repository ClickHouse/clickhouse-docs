---
'alias': []
'description': 'Form形式のドキュメント'
'input_format': true
'keywords':
- 'Form'
'output_format': false
'slug': '/interfaces/formats/Form'
'title': 'フォーム'
---



| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✗      |       |


## 説明 {#description}

`Form`フォーマットは、データが`key1=value1&key2=value2`の形式でフォーマットされたapplication/x-www-form-urlencoded形式で単一のレコードを読み取るために使用できます。

## 使用例 {#example-usage}

URLエンコードされたデータを含む`user_files`パスに配置されたファイル`data.tmp`があるとします：

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

## フォーマット設定 {#format-settings}
