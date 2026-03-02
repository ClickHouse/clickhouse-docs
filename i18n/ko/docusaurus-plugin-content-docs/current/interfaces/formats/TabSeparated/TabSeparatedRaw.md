---
alias: ['TSVRaw', 'Raw']
description: 'TabSeparatedRaw 형식에 대한 문서'
input_format: true
keywords: ['TabSeparatedRaw']
output_format: true
slug: /interfaces/formats/TabSeparatedRaw
title: 'TabSeparatedRaw'
doc_type: 'reference'
---

| 입력 | 출력 | 별칭            |
|------|------|-----------------|
| ✔    | ✔    | `TSVRaw`, `Raw` |



## 설명 \{#description\}

행을 이스케이프하지 않고 기록한다는 점에서 [`TabSeparated`](/interfaces/formats/TabSeparated) 포맷과 다릅니다.

:::note
이 포맷을 사용해 파싱할 때는 각 필드에 탭이나 줄 바꿈 문자를 사용할 수 없습니다.
:::

`TabSeparatedRaw` 포맷과 `RawBlob` 포맷의 비교는 다음을 참조하십시오: [Raw 포맷 비교](../RawBLOB.md/#raw-formats-comparison)



## 예시 사용법 \{#example-usage\}

### 데이터 삽입 \{#inserting-data\}

다음과 같은 내용을 가진 tsv 파일 `football.tsv`를 사용합니다:

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

### 데이터 읽기 \{#reading-data\}

`TabSeparatedRaw` 형식을 사용하여 데이터를 읽습니다:

```sql
SELECT *
FROM football
FORMAT TabSeparatedRaw
```

출력은 탭으로 구분된 형식입니다:

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


## 형식 설정 \{#format-settings\}
