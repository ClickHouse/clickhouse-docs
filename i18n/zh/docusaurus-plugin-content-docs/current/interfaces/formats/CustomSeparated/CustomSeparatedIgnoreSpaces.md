---
'description': 'CustomSeparatedIgnoreSpaces 格式的 Documentation'
'keywords':
- 'CustomSeparatedIgnoreSpaces'
'slug': '/interfaces/formats/CustomSeparatedIgnoreSpaces'
'title': 'CustomSeparatedIgnoreSpaces'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     |        |       |

## 描述 {#description}

## 示例用法 {#example-usage}

### 插入数据 {#inserting-data}

使用以下名为 `football.txt` 的文本文件：

```text
row('2022-04-30'; 2021; 'Sutton United'; 'Bradford City'; 1; 4), row( '2022-04-30'; 2021; 'Swindon Town'; 'Barrow'; 2; 1), row( '2022-04-30'; 2021; 'Tranmere Rovers'; 'Oldham Athletic'; 2; 0), row('2022-05-02'; 2021; 'Salford City'; 'Mansfield Town'; 2; 2), row('2022-05-02'; 2021; 'Port Vale'; 'Newport County'; 1; 2), row('2022-05-07'; 2021; 'Barrow'; 'Northampton Town'; 1; 3), row('2022-05-07'; 2021; 'Bradford City'; 'Carlisle United'; 2; 0), row('2022-05-07'; 2021; 'Bristol Rovers'; 'Scunthorpe United'; 7; 0), row('2022-05-07'; 2021; 'Exeter City'; 'Port Vale'; 0; 1), row('2022-05-07'; 2021; 'Harrogate Town A.F.C.'; 'Sutton United'; 0; 2), row('2022-05-07'; 2021; 'Hartlepool United'; 'Colchester United'; 0; 2), row('2022-05-07'; 2021; 'Leyton Orient'; 'Tranmere Rovers'; 0; 1), row('2022-05-07'; 2021; 'Mansfield Town'; 'Forest Green Rovers'; 2; 2), row('2022-05-07'; 2021; 'Newport County'; 'Rochdale'; 0; 2), row('2022-05-07'; 2021; 'Oldham Athletic'; 'Crawley Town'; 3; 3), row('2022-05-07'; 2021; 'Stevenage Borough'; 'Salford City'; 4; 2), row('2022-05-07'; 2021; 'Walsall'; 'Swindon Town'; 0; 3)
```

配置自定义分隔符设置：

```sql
SET format_custom_row_before_delimiter = 'row(';
SET format_custom_row_after_delimiter = ')';
SET format_custom_field_delimiter = ';';
SET format_custom_row_between_delimiter = ',';
SET format_custom_escaping_rule = 'Quoted';
```

插入数据：

```sql
INSERT INTO football FROM INFILE 'football.txt' FORMAT CustomSeparatedIgnoreSpaces;
```

## 格式设置 {#format-settings}
