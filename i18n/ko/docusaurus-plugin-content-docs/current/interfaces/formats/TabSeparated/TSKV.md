---
alias: []
description: 'TSKV 포맷에 대한 문서'
input_format: true
keywords: ['TSKV']
output_format: true
slug: /interfaces/formats/TSKV
title: 'TSKV'
doc_type: 'reference'
---

| Input | Output | 별칭 |
|-------|--------|-------|
| ✔     | ✔      |       |



## 설명 \{#description\}

[`TabSeparated`](./TabSeparated.md) 포맷과 유사하지만, 값을 `name=value` 형식으로 출력합니다.
이름은 [`TabSeparated`](./TabSeparated.md) 포맷과 동일한 방식으로 이스케이프되며, `=` 기호 역시 이스케이프됩니다.

```text
SearchPhrase=   count()=8267016
SearchPhrase=bathroom interior design    count()=2166
SearchPhrase=clickhouse     count()=1655
SearchPhrase=2014 spring fashion    count()=1549
SearchPhrase=freeform photos       count()=1480
SearchPhrase=angelina jolie    count()=1245
SearchPhrase=omsk       count()=1112
SearchPhrase=photos of dog breeds    count()=1091
SearchPhrase=curtain designs        count()=1064
SearchPhrase=baku       count()=1000
```

```sql title="Query"
SELECT * FROM t_null FORMAT TSKV
```

```text title="Response"
x=1    y=\N
```

:::note
작은 컬럼이 매우 많은 경우 이 포맷은 비효율적이며, 일반적으로 사용할 이유가 없습니다.
그럼에도 불구하고 효율성 측면에서는 [`JSONEachRow`](../JSON/JSONEachRow.md) 포맷보다 나쁘지 않습니다.
:::

파싱 시 각 컬럼 값은 어떤 순서로 나타나도 처리됩니다.
일부 값은 생략되어도 되며, 생략된 값은 기본값과 동일한 것으로 처리됩니다.
이 경우 0과 빈 문자열이 기본값으로 사용됩니다.
테이블 정의에서 지정할 수 있는 복잡한 값은 기본값으로 사용할 수 없습니다.

파싱 시에는 추가 필드 `tskv`를 등호나 값 없이 추가할 수 있습니다. 이 필드는 무시됩니다.

가져오는 동안 이름을 알 수 없는 컬럼은,
[`input_format_skip_unknown_fields`](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) 설정이 `1`로 설정된 경우 건너뜁니다.

[NULL](/sql-reference/syntax.md) 값은 `\N`으로 포맷됩니다.


## 사용 예시 \{#example-usage\}

### 데이터 삽입 \{#inserting-data\}

다음과 같은 tskv 파일 `football.tskv`를 사용합니다:

```tsv
date=2022-04-30 season=2021     home_team=Sutton United away_team=Bradford City home_team_goals=1       away_team_goals=4
date=2022-04-30 season=2021     home_team=Swindon Town  away_team=Barrow        home_team_goals=2       away_team_goals=1
date=2022-04-30 season=2021     home_team=Tranmere Rovers       away_team=Oldham Athletic       home_team_goals=2       away_team_goals=0
date=2022-05-02 season=2021     home_team=Port Vale     away_team=Newport County        home_team_goals=1       away_team_goals=2
date=2022-05-02 season=2021     home_team=Salford City  away_team=Mansfield Town        home_team_goals=2       away_team_goals=2
date=2022-05-07 season=2021     home_team=Barrow        away_team=Northampton Town      home_team_goals=1       away_team_goals=3
date=2022-05-07 season=2021     home_team=Bradford City away_team=Carlisle United       home_team_goals=2       away_team_goals=0
date=2022-05-07 season=2021     home_team=Bristol Rovers        away_team=Scunthorpe United     home_team_goals=7       away_team_goals=0
date=2022-05-07 season=2021     home_team=Exeter City   away_team=Port Vale     home_team_goals=0       away_team_goals=1
date=2022-05-07 season=2021     home_team=Harrogate Town A.F.C. away_team=Sutton United home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Hartlepool United     away_team=Colchester United     home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Leyton Orient away_team=Tranmere Rovers       home_team_goals=0       away_team_goals=1
date=2022-05-07 season=2021     home_team=Mansfield Town        away_team=Forest Green Rovers   home_team_goals=2       away_team_goals=2
date=2022-05-07 season=2021     home_team=Newport County        away_team=Rochdale      home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Oldham Athletic       away_team=Crawley Town  home_team_goals=3       away_team_goals=3
date=2022-05-07 season=2021     home_team=Stevenage Borough     away_team=Salford City  home_team_goals=4       away_team_goals=2
date=2022-05-07 season=2021     home_team=Walsall       away_team=Swindon Town  home_team_goals=0       away_team_goals=3
```

데이터를 삽입하십시오:

```sql
INSERT INTO football FROM INFILE 'football.tskv' FORMAT TSKV;
```

### 데이터 읽기 \{#reading-data\}

`TSKV` 형식을 사용하여 데이터를 읽습니다:

```sql
SELECT *
FROM football
FORMAT TSKV
```

출력은 컬럼 이름과 타입을 나타내는 두 개의 헤더 행이 포함된 탭 구분 형식으로 제공됩니다.


```tsv
date=2022-04-30 season=2021     home_team=Sutton United away_team=Bradford City home_team_goals=1       away_team_goals=4
date=2022-04-30 season=2021     home_team=Swindon Town  away_team=Barrow        home_team_goals=2       away_team_goals=1
date=2022-04-30 season=2021     home_team=Tranmere Rovers       away_team=Oldham Athletic       home_team_goals=2       away_team_goals=0
date=2022-05-02 season=2021     home_team=Port Vale     away_team=Newport County        home_team_goals=1       away_team_goals=2
date=2022-05-02 season=2021     home_team=Salford City  away_team=Mansfield Town        home_team_goals=2       away_team_goals=2
date=2022-05-07 season=2021     home_team=Barrow        away_team=Northampton Town      home_team_goals=1       away_team_goals=3
date=2022-05-07 season=2021     home_team=Bradford City away_team=Carlisle United       home_team_goals=2       away_team_goals=0
date=2022-05-07 season=2021     home_team=Bristol Rovers        away_team=Scunthorpe United     home_team_goals=7       away_team_goals=0
date=2022-05-07 season=2021     home_team=Exeter City   away_team=Port Vale     home_team_goals=0       away_team_goals=1
date=2022-05-07 season=2021     home_team=Harrogate Town A.F.C. away_team=Sutton United home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Hartlepool United     away_team=Colchester United     home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Leyton Orient away_team=Tranmere Rovers       home_team_goals=0       away_team_goals=1
date=2022-05-07 season=2021     home_team=Mansfield Town        away_team=Forest Green Rovers   home_team_goals=2       away_team_goals=2
date=2022-05-07 season=2021     home_team=Newport County        away_team=Rochdale      home_team_goals=0       away_team_goals=2
date=2022-05-07 season=2021     home_team=Oldham Athletic       away_team=Crawley Town  home_team_goals=3       away_team_goals=3
date=2022-05-07 season=2021     home_team=Stevenage Borough     away_team=Salford City  home_team_goals=4       away_team_goals=2
date=2022-05-07 season=2021     home_team=Walsall       away_team=Swindon Town  home_team_goals=0       away_team_goals=3
```


## 형식 설정 \{#format-settings\}