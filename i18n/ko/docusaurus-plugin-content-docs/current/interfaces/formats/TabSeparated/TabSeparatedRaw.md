---
'alias':
- 'TSVRaw'
- 'Raw'
'description': 'TabSeparatedRaw 형식에 대한 Documentation'
'input_format': true
'keywords':
- 'TabSeparatedRaw'
'output_format': true
'slug': '/interfaces/formats/TabSeparatedRaw'
'title': 'TabSeparatedRaw'
'doc_type': 'reference'
---

| Input | Output | Alias           |
|-------|--------|-----------------|
| ✔     | ✔      | `TSVRaw`, `Raw` |

## 설명 {#description}

[`TabSeparated`](/interfaces/formats/TabSeparated) 형식과 다르게, 행은 이스케이프 없이 작성됩니다.

:::note
이 형식으로 구문 분석을 할 때, 각 필드에 탭이나 줄 바꿈은 허용되지 않습니다.
:::

`TabSeparatedRaw` 형식과 `RawBlob` 형식의 비교는 다음을 참조하십시오: [원시 형식 비교](../RawBLOB.md/#raw-formats-comparison)

## 사용 예시 {#example-usage}

### 데이터 삽입 {#inserting-data}

다음의 tsv 파일을 사용하여 `football.tsv`라는 이름으로 저장합니다:

```tsv
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```

데이터를 삽입합니다:

```sql
INSERT INTO football FROM INFILE 'football.tsv' FORMAT TabSeparatedRaw;
```

### 데이터 읽기 {#reading-data}

`TabSeparatedRaw` 형식을 사용하여 데이터를 읽습니다:

```sql
SELECT *
FROM football
FORMAT TabSeparatedRaw
```

출력은 탭으로 구분된 형식이 됩니다:

```tsv
2022-04-30      2021    Sutton United   Bradford City   1       4
2022-04-30      2021    Swindon Town    Barrow  2       1
2022-04-30      2021    Tranmere Rovers Oldham Athletic 2       0
2022-05-02      2021    Port Vale       Newport County  1       2
2022-05-02      2021    Salford City    Mansfield Town  2       2
2022-05-07      2021    Barrow  Northampton Town        1       3
2022-05-07      2021    Bradford City   Carlisle United 2       0
2022-05-07      2021    Bristol Rovers  Scunthorpe United       7       0
2022-05-07      2021    Exeter City     Port Vale       0       1
2022-05-07      2021    Harrogate Town A.F.C.   Sutton United   0       2
2022-05-07      2021    Hartlepool United       Colchester United       0       2
2022-05-07      2021    Leyton Orient   Tranmere Rovers 0       1
2022-05-07      2021    Mansfield Town  Forest Green Rovers     2       2
2022-05-07      2021    Newport County  Rochdale        0       2
2022-05-07      2021    Oldham Athletic Crawley Town    3       3
2022-05-07      2021    Stevenage Borough       Salford City    4       2
2022-05-07      2021    Walsall Swindon Town    0       3
```

## 형식 설정 {#format-settings}
