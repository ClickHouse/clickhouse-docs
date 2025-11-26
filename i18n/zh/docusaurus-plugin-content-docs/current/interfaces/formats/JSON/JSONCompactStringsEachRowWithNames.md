---
alias: []
description: 'JSONCompactStringsEachRowWithNames 格式文档'
input_format: true
keywords: ['JSONCompactStringsEachRowWithNames']
output_format: true
slug: /interfaces/formats/JSONCompactStringsEachRowWithNames
title: 'JSONCompactStringsEachRowWithNames'
doc_type: 'reference'
---

| 输入 | 输出 | 别名 |
|-------|--------|-------|
| ✔     | ✔      |       |



## 描述 {#description}

与 [`JSONCompactEachRow`](./JSONCompactEachRow.md) 格式不同之处在于，它还会输出包含列名的表头行，类似于 [TabSeparatedWithNames](../TabSeparated/TabSeparatedWithNames.md) 格式。



## 使用示例

### 插入数据

使用一个包含以下数据的 JSON 文件，并将其命名为 `football.json`：

```json
["日期", "赛季", "主队", "客队", "主队进球", "客队进球"]
["2022-04-30", "2021", "Sutton United", "Bradford City", "1", "4"]
["2022-04-30", "2021", "Swindon Town", "Barrow", "2", "1"]
["2022-04-30", "2021", "Tranmere Rovers", "Oldham Athletic", "2", "0"]
["2022-05-02", "2021", "Port Vale", "Newport County", "1", "2"]
["2022-05-02", "2021", "Salford City", "Mansfield Town", "2", "2"]
["2022-05-07", "2021", "Barrow", "Northampton Town", "1", "3"]
["2022-05-07", "2021", "Bradford City", "Carlisle United", "2", "0"]
["2022-05-07", "2021", "Bristol Rovers", "Scunthorpe United", "7", "0"]
["2022-05-07", "2021", "Exeter City", "Port Vale", "0", "1"]
["2022-05-07", "2021", "Harrogate Town A.F.C.", "Sutton United", "0", "2"]
["2022-05-07", "2021", "Hartlepool United", "Colchester United", "0", "2"]
["2022-05-07", "2021", "Leyton Orient", "Tranmere Rovers", "0", "1"]
["2022-05-07", "2021", "Mansfield Town", "Forest Green Rovers", "2", "2"]
["2022-05-07", "2021", "Newport County", "Rochdale", "0", "2"]
["2022-05-07", "2021", "Oldham Athletic", "Crawley Town", "3", "3"]
["2022-05-07", "2021", "Stevenage Borough", "Salford City", "4", "2"]
["2022-05-07", "2021", "Walsall", "Swindon Town", "0", "3"]
```

插入数据：

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONCompactStringsEachRowWithNames;
```

### 读取数据

使用 `JSONCompactStringsEachRowWithNames` 格式来读取数据：

```sql
SELECT *
FROM football
FORMAT JSONCompactStringsEachRowWithNames
```

输出将为 JSON 格式：


```json
["date", "season", "home_team", "away_team", "home_team_goals", "away_team_goals"]
["2022-04-30", "2021", "萨顿联", "布拉德福德城", "1", "4"]
["2022-04-30", "2021", "斯温顿镇", "巴罗", "2", "1"]
["2022-04-30", "2021", "特兰米尔流浪者", "奥尔德姆竞技", "2", "0"]
["2022-05-02", "2021", "波特谷", "纽波特郡", "1", "2"]
["2022-05-02", "2021", "索尔福德城", "曼斯菲尔德镇", "2", "2"]
["2022-05-07", "2021", "巴罗", "北安普敦镇", "1", "3"]
["2022-05-07", "2021", "布拉德福德城", "卡莱尔联", "2", "0"]
["2022-05-07", "2021", "布里斯托尔流浪者", "斯坎索普联", "7", "0"]
["2022-05-07", "2021", "埃克塞特城", "波特谷", "0", "1"]
["2022-05-07", "2021", "哈罗盖特镇（A.F.C.）", "萨顿联", "0", "2"]
["2022-05-07", "2021", "哈特尔浦联", "科尔切斯特联", "0", "2"]
["2022-05-07", "2021", "莱顿东方", "特兰米尔流浪者", "0", "1"]
["2022-05-07", "2021", "曼斯菲尔德镇", "森林绿流浪者", "2", "2"]
["2022-05-07", "2021", "纽波特郡", "罗奇代尔", "0", "2"]
["2022-05-07", "2021", "奥尔德姆竞技", "克劳利镇", "3", "3"]
["2022-05-07", "2021", "史蒂文尼奇伯勒", "索尔福德城", "4", "2"]
["2022-05-07", "2021", "沃尔索尔", "斯温顿镇", "0", "3"]
```


## 格式设置 {#format-settings}

:::note
如果将 [`input_format_with_names_use_header`](/operations/settings/settings-formats.md/#input_format_with_names_use_header) 设置为 `1`，
则会按照名称将输入数据中的列映射到表中的列；如果将 [`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 设置为 `1`，则名称未知的列会被跳过。
否则，第一行将会被跳过。
:::