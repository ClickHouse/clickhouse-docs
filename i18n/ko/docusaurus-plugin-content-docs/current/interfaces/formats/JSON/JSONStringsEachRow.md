---
'alias': []
'description': 'JSONStringsEachRow 형식에 대한 Documentation'
'input_format': false
'keywords':
- 'JSONStringsEachRow'
'output_format': true
'slug': '/interfaces/formats/JSONStringsEachRow'
'title': 'JSONStringsEachRow'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✗     | ✔      |       |

## 설명 {#description}

[`JSONEachRow`](./JSONEachRow.md)와의 차이점은 데이터 필드가 타입이 지정된 JSON 값이 아닌 문자열로 출력된다는 것입니다.

## 사용 예제 {#example-usage}

### 데이터 삽입 {#inserting-data}

다음 데이터를 포함하는 JSON 파일을 `football.json`으로 명명하여 사용합니다:

```json
{"date":"2022-04-30","season":"2021","home_team":"Sutton United","away_team":"Bradford City","home_team_goals":"1","away_team_goals":"4"}
{"date":"2022-04-30","season":"2021","home_team":"Swindon Town","away_team":"Barrow","home_team_goals":"2","away_team_goals":"1"}
{"date":"2022-04-30","season":"2021","home_team":"Tranmere Rovers","away_team":"Oldham Athletic","home_team_goals":"2","away_team_goals":"0"}
{"date":"2022-05-02","season":"2021","home_team":"Port Vale","away_team":"Newport County","home_team_goals":"1","away_team_goals":"2"}
{"date":"2022-05-02","season":"2021","home_team":"Salford City","away_team":"Mansfield Town","home_team_goals":"2","away_team_goals":"2"}
{"date":"2022-05-07","season":"2021","home_team":"Barrow","away_team":"Northampton Town","home_team_goals":"1","away_team_goals":"3"}
{"date":"2022-05-07","season":"2021","home_team":"Bradford City","away_team":"Carlisle United","home_team_goals":"2","away_team_goals":"0"}
{"date":"2022-05-07","season":"2021","home_team":"Bristol Rovers","away_team":"Scunthorpe United","home_team_goals":"7","away_team_goals":"0"}
{"date":"2022-05-07","season":"2021","home_team":"Exeter City","away_team":"Port Vale","home_team_goals":"0","away_team_goals":"1"}
{"date":"2022-05-07","season":"2021","home_team":"Harrogate Town A.F.C.","away_team":"Sutton United","home_team_goals":"0","away_team_goals":"2"}
{"date":"2022-05-07","season":"2021","home_team":"Hartlepool United","away_team":"Colchester United","home_team_goals":"0","away_team_goals":"2"}
{"date":"2022-05-07","season":"2021","home_team":"Leyton Orient","away_team":"Tranmere Rovers","home_team_goals":"0","away_team_goals":"1"}
{"date":"2022-05-07","season":"2021","home_team":"Mansfield Town","away_team":"Forest Green Rovers","home_team_goals":"2","away_team_goals":"2"}
{"date":"2022-05-07","season":"2021","home_team":"Newport County","away_team":"Rochdale","home_team_goals":"0","away_team_goals":"2"}
{"date":"2022-05-07","season":"2021","home_team":"Oldham Athletic","away_team":"Crawley Town","home_team_goals":"3","away_team_goals":"3"}
{"date":"2022-05-07","season":"2021","home_team":"Stevenage Borough","away_team":"Salford City","home_team_goals":"4","away_team_goals":"2"}
{"date":"2022-05-07","season":"2021","home_team":"Walsall","away_team":"Swindon Town","home_team_goals":"0","away_team_goals":"3"}   
```

데이터를 삽입합니다:

```sql
INSERT INTO football FROM INFILE 'football.json' FORMAT JSONStringsEachRow;
```

### 데이터 읽기 {#reading-data}

`JSONStringsEachRow` 포맷을 사용하여 데이터를 읽습니다:

```sql
SELECT *
FROM football
FORMAT JSONStringsEachRow
```

출력은 JSON 포맷으로 제공됩니다:

```json
{"date":"2022-04-30","season":"2021","home_team":"Sutton United","away_team":"Bradford City","home_team_goals":"1","away_team_goals":"4"}
{"date":"2022-04-30","season":"2021","home_team":"Swindon Town","away_team":"Barrow","home_team_goals":"2","away_team_goals":"1"}
{"date":"2022-04-30","season":"2021","home_team":"Tranmere Rovers","away_team":"Oldham Athletic","home_team_goals":"2","away_team_goals":"0"}
{"date":"2022-05-02","season":"2021","home_team":"Port Vale","away_team":"Newport County","home_team_goals":"1","away_team_goals":"2"}
{"date":"2022-05-02","season":"2021","home_team":"Salford City","away_team":"Mansfield Town","home_team_goals":"2","away_team_goals":"2"}
{"date":"2022-05-07","season":"2021","home_team":"Barrow","away_team":"Northampton Town","home_team_goals":"1","away_team_goals":"3"}
{"date":"2022-05-07","season":"2021","home_team":"Bradford City","away_team":"Carlisle United","home_team_goals":"2","away_team_goals":"0"}
{"date":"2022-05-07","season":"2021","home_team":"Bristol Rovers","away_team":"Scunthorpe United","home_team_goals":"7","away_team_goals":"0"}
{"date":"2022-05-07","season":"2021","home_team":"Exeter City","away_team":"Port Vale","home_team_goals":"0","away_team_goals":"1"}
{"date":"2022-05-07","season":"2021","home_team":"Harrogate Town A.F.C.","away_team":"Sutton United","home_team_goals":"0","away_team_goals":"2"}
{"date":"2022-05-07","season":"2021","home_team":"Hartlepool United","away_team":"Colchester United","home_team_goals":"0","away_team_goals":"2"}
{"date":"2022-05-07","season":"2021","home_team":"Leyton Orient","away_team":"Tranmere Rovers","home_team_goals":"0","away_team_goals":"1"}
{"date":"2022-05-07","season":"2021","home_team":"Mansfield Town","away_team":"Forest Green Rovers","home_team_goals":"2","away_team_goals":"2"}
{"date":"2022-05-07","season":"2021","home_team":"Newport County","away_team":"Rochdale","home_team_goals":"0","away_team_goals":"2"}
{"date":"2022-05-07","season":"2021","home_team":"Oldham Athletic","away_team":"Crawley Town","home_team_goals":"3","away_team_goals":"3"}
{"date":"2022-05-07","season":"2021","home_team":"Stevenage Borough","away_team":"Salford City","home_team_goals":"4","away_team_goals":"2"}
{"date":"2022-05-07","season":"2021","home_team":"Walsall","away_team":"Swindon Town","home_team_goals":"0","away_team_goals":"3"}   
```

## 포맷 설정 {#format-settings}
