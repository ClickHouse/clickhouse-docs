---
'slug': '/use-cases/AI/jupyter-notebook'
'sidebar_label': 'Jupyter 노트북과 chDB로 데이터 탐색하기'
'title': 'Jupyter 노트북에서 chDB로 데이터 탐색하기'
'description': '이 가이드는 Jupyter 노트북에서 ClickHouse Cloud 또는 로컬 파일의 데이터를 탐색하기 위해 chDB를
  설정하고 사용하는 방법을 설명합니다.'
'keywords':
- 'ML'
- 'Jupyer'
- 'chDB'
- 'pandas'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import image_1 from '@site/static/images/use-cases/AI_ML/jupyter/1.png';
import image_2 from '@site/static/images/use-cases/AI_ML/jupyter/2.png';
import image_3 from '@site/static/images/use-cases/AI_ML/jupyter/3.png';
import image_4 from '@site/static/images/use-cases/AI_ML/jupyter/4.png';
import image_5 from '@site/static/images/use-cases/AI_ML/jupyter/5.png';
import image_6 from '@site/static/images/use-cases/AI_ML/jupyter/6.png';
import image_7 from '@site/static/images/use-cases/AI_ML/jupyter/7.png';
import image_8 from '@site/static/images/use-cases/AI_ML/jupyter/8.png';
import image_9 from '@site/static/images/use-cases/AI_ML/jupyter/9.png';


# Jupyter 노트북과 chDB로 데이터 탐색하기

이 가이드에서는 [chDB](/chdb) 를 사용하여 Jupyter 노트북에서 ClickHouse Cloud 데이터 세트를 탐색하는 방법에 대해 배우게 됩니다. chDB는 ClickHouse로 구동되는 빠른 인프로세스 SQL OLAP 엔진입니다.

**전제 조건**:
- 가상 환경
- 작동하는 ClickHouse Cloud 서비스 및 [연결 세부정보](/cloud/guides/sql-console/gather-connection-details)

:::tip
아직 ClickHouse Cloud 계정이 없으신 경우, [가입](https://console.clickhouse.cloud/signUp?loc=docs-juypter-chdb)하여 
시험판을 신청하고 $300의 무료 크레딧을 받을 수 있습니다.
:::

**배울 내용:**
- chDB를 사용하여 Jupyter 노트북에서 ClickHouse Cloud에 연결하기
- 원격 데이터 세트를 쿼리하고 결과를 Pandas DataFrame으로 변환하기
- 분석을 위해 클라우드 데이터와 로컬 CSV 파일 결합하기
- matplotlib을 사용하여 데이터 시각화하기

우리는 ClickHouse Cloud에서 사용 가능한 영국 부동산 가격 데이터 세트를 사용할 것입니다. 해당 데이터 세트에는 1995년부터 2024년까지 영국에서 주택이 판매된 가격에 대한 데이터가 포함되어 있습니다.

## 설정 {#setup}

이 데이터 세트를 기존 ClickHouse Cloud 서비스에 추가하려면, [console.clickhouse.cloud](https://console.clickhouse.cloud/)에 계정 세부정보로 로그인하십시오.

왼쪽 메뉴에서 `데이터 소스`를 클릭합니다. 그런 다음 `미리 정의된 샘플 데이터`를 클릭합니다:

<Image size="md" img={image_1} alt="예제 데이터 세트 추가"/>

영국 부동산 가격 지불 데이터(4GB) 카드에서 `시작하기`를 선택합니다: 

<Image size="md" img={image_2} alt="영국 가격 지불 데이터 세트 선택"/>

그런 다음 `데이터 세트 가져오기`를 클릭합니다:

<Image size="md" img={image_3} alt="영국 가격 지불 데이터 세트 가져오기"/>

ClickHouse는 `default` 데이터베이스에 `pp_complete` 테이블을 자동으로 생성하고 2892만 행의 가격 포인트 데이터로 테이블을 채웁니다.

자격 증명이 노출될 가능성을 줄이기 위해, 로컬 머신에서 환경 변수로 Cloud 사용자 이름과 비밀번호를 추가하는 것이 좋습니다. 터미널에서 다음 명령어를 실행하여 사용자 이름과 비밀번호를 환경 변수로 추가합니다:

```bash
export CLICKHOUSE_USER=default
export CLICKHOUSE_PASSWORD=your_actual_password
```

:::note
위 환경 변수는 터미널 세션이 지속되는 동안만 유지됩니다.
영구적으로 설정하려면 셸 구성 파일에 추가하십시오.
:::

이제 가상 환경을 활성화합니다.
가상 환경 내에서 Jupyter Notebook을 다음 명령어로 설치합니다:

```python
pip install notebook
```

다음 명령어로 Jupyter Notebook을 실행합니다:

```python
jupyter notebook
```

새 브라우저 창이 `localhost:8888`에서 Jupyter 인터페이스와 함께 열릴 것입니다.
`파일` > `새로 만들기` > `노트북`을 클릭하여 새로운 노트북을 생성합니다.

<Image size="md" img={image_4} alt="새 노트북 생성"/>

커널을 선택하라는 메시지가 표시됩니다.
사용 가능한 Python 커널 중 하나를 선택하십시오. 이 예에서는 `ipykernel`을 선택할 것입니다:

<Image size="md" img={image_5} alt="커널 선택"/>

빈 셀에서 다음 명령을 입력하여 원격 ClickHouse Cloud 인스턴스에 연결하는 데 사용할 chDB를 설치합니다:

```python
pip install chdb
```

이제 chDB를 가져오고 모든 것이 올바르게 설정되었는지 확인하기 위해 간단한 쿼리를 실행할 수 있습니다:

```python
import chdb

result = chdb.query("SELECT 'Hello, ClickHouse!' as message")
print(result)
```

## 데이터 탐색하기 {#exploring-the-data}

영국 가격 지불 데이터 세트가 설정되고 Jupyter 노트북에서 chDB가 실행되면 이제 데이터를 탐색하는 데 필요한 작업을 시작할 수 있습니다.

우리는 특정 지역, 예를 들어 수도인 런던의 시간이 지남에 따라 가격이 어떻게 변했는지를 확인하고 싶다고 가정해 보겠습니다.
ClickHouse의 [`remoteSecure`](/sql-reference/table-functions/remote) 함수는 ClickHouse Cloud에서 쉽게 데이터를 검색할 수 있게 해줍니다.
chDB를 사용하여 이 데이터를 Pandas 데이터 프레임으로 반환하도록 지시할 수 있습니다 - 이는 데이터를 다루는 편리하고 친숙한 방법입니다.

다음 쿼리를 작성하여 ClickHouse Cloud 서비스에서 영국 가격 지불 데이터를 가져와 `pandas.DataFrame`으로 변환합니다:

```python
import os
from dotenv import load_dotenv
import chdb
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates


# Load environment variables from .env file
load_dotenv()

username = os.environ.get('CLICKHOUSE_USER')
password = os.environ.get('CLICKHOUSE_PASSWORD')

query = f"""
SELECT 
    toYear(date) AS year,
    avg(price) AS avg_price
FROM remoteSecure(
'****.europe-west4.gcp.clickhouse.cloud',
default.pp_complete,
'{username}',
'{password}'
)
WHERE town = 'LONDON'
GROUP BY toYear(date)
ORDER BY year;
"""

df = chdb.query(query, "DataFrame")
df.head()
```

위의 코드 조각에서 `chdb.query(query, "DataFrame")`는 지정된 쿼리를 실행하고 결과를 Pandas DataFrame으로 터미널에 출력합니다.
쿼리에서 우리는 ClickHouse Cloud에 연결하기 위해 `remoteSecure` 함수를 사용하고 있습니다.
`remoteSecure` 함수는 다음 매개변수를 입력받습니다:
- 연결 문자열
- 사용할 데이터베이스 및 테이블 이름
- 사용자 이름
- 비밀번호

보안 모범 사례로, 직접 함수에 사용자 이름 및 비밀번호 매개변수를 지정하는 것보다 환경 변수를 사용하는 것이 좋습니다. 원하신다면 직접 지정할 수도 있습니다.

`remoteSecure` 함수는 원격 ClickHouse Cloud 서비스에 연결하고 쿼리를 실행하여 결과를 반환합니다.
데이터 크기에 따라 이 작업은 몇 초가 소요될 수 있습니다.
이번 경우 우리는 연도별 평균 가격 포인트를 반환하고 `town='LONDON'`으로 필터링합니다.
결과는 `df`라는 변수에 DataFrame으로 저장됩니다.

`df.head`는 반환된 데이터의 처음 몇 행만 표시합니다:

<Image size="md" img={image_6} alt="데이터 프레임 미리보기"/>

새 셀에서 다음 명령을 실행하여 컬럼 유형을 확인합니다:

```python
df.dtypes
```

```response
year          uint16
avg_price    float64
dtype: object
```

`date`가 ClickHouse에서는 `Date` 유형인 반면, 결과 데이터 프레임에서는 `uint16` 유형임을 주목하십시오.
chDB는 DataFrame을 반환할 때 가장 적절한 유형을 자동으로 추론합니다.

이제 친숙한 형태로 데이터가 제공되었으므로, 런던의 부동산 가격이 시간이 지남에 따라 어떻게 변했는지를 탐색해 봅시다.

새 셀에서 다음 명령을 실행하여 matplotlib를 사용하여 런던의 시간 대비 가격에 대한 간단한 차트를 작성합니다:

```python
plt.figure(figsize=(12, 6))
plt.plot(df['year'], df['avg_price'], marker='o')
plt.xlabel('Year')
plt.ylabel('Price (£)')
plt.title('Price of London property over time')


# Show every 2nd year to avoid crowding
years_to_show = df['year'][::2]  # Every 2nd year
plt.xticks(years_to_show, rotation=45)

plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

<Image size="md" img={image_7} alt="데이터 프레임 미리보기"/>

놀랍지 않게도, 런던의 부동산 가격은 시간이 지남에 따라 상당히 증가했습니다.

한 데이터 과학자가 추가 주택 관련 변수가 포함된 .csv 파일을 보내주었고, 런던에서 판매된 주택 수가 시간이 지남에 따라 어떻게 변했는지 알아보고 싶어합니다.
우리는 이러한 값을 주택 가격에 대비하여 플롯하고 상관 관계를 발견할 수 있을지 확인해 보겠습니다.

로컬 머신에서 파일을 직접 읽기 위해 `file` 테이블 엔진을 사용할 수 있습니다.
새 셀에서 다음 명령을 실행하여 로컬 .csv 파일로부터 새로운 DataFrame을 만듭니다.

```python
query = f"""
SELECT 
    toYear(date) AS year,
    sum(houses_sold)*1000
    FROM file('/Users/datasci/Desktop/housing_in_london_monthly_variables.csv')
WHERE area = 'city of london' AND houses_sold IS NOT NULL
GROUP BY toYear(date)
ORDER BY year;
"""

df_2 = chdb.query(query, "DataFrame")
df_2.head()
```

<details>
<summary>단일 단계에서 여러 소스에서 읽기</summary>
단일 단계에서 여러 소스에서 읽는 것도 가능합니다. 다음의 쿼리를 사용하여 `JOIN`을 통해 이를 수행할 수 있습니다:

```python
query = f"""
SELECT 
    toYear(date) AS year,
    avg(price) AS avg_price, housesSold
FROM remoteSecure(
'****.europe-west4.gcp.clickhouse.cloud',
default.pp_complete,
'{username}',
'{password}'
) AS remote
JOIN (
  SELECT 
    toYear(date) AS year,
    sum(houses_sold)*1000 AS housesSold
    FROM file('/Users/datasci/Desktop/housing_in_london_monthly_variables.csv')
  WHERE area = 'city of london' AND houses_sold IS NOT NULL
  GROUP BY toYear(date)
  ORDER BY year
) AS local ON local.year = remote.year
WHERE town = 'LONDON'
GROUP BY toYear(date)
ORDER BY year;
"""
```
</details>

<Image size="md" img={image_8} alt="데이터 프레임 미리보기"/>

2020년 이후의 데이터가 누락되었지만, 1995년부터 2019년까지 두 데이터 세트를 서로 비교하여 플롯할 수 있습니다.
새 셀에서 다음 명령을 실행합니다:

```python

# Create a figure with two y-axes
fig, ax1 = plt.subplots(figsize=(14, 8))


# Plot houses sold on the left y-axis
color = 'tab:blue'
ax1.set_xlabel('Year')
ax1.set_ylabel('Houses Sold', color=color)
ax1.plot(df_2['year'], df_2['houses_sold'], marker='o', color=color, label='Houses Sold', linewidth=2)
ax1.tick_params(axis='y', labelcolor=color)
ax1.grid(True, alpha=0.3)


# Create a second y-axis for price data
ax2 = ax1.twinx()
color = 'tab:red'
ax2.set_ylabel('Average Price (£)', color=color)


# Plot price data up until 2019
ax2.plot(df[df['year'] <= 2019]['year'], df[df['year'] <= 2019]['avg_price'], marker='s', color=color, label='Average Price', linewidth=2)
ax2.tick_params(axis='y', labelcolor=color)


# Format price axis with currency formatting
ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'£{x:,.0f}'))


# Set title and show every 2nd year
plt.title('London Housing Market: Sales Volume vs Prices Over Time', fontsize=14, pad=20)


# Use years only up to 2019 for both datasets
all_years = sorted(list(set(df_2[df_2['year'] <= 2019]['year']).union(set(df[df['year'] <= 2019]['year']))))
years_to_show = all_years[::2]  # Every 2nd year
ax1.set_xticks(years_to_show)
ax1.set_xticklabels(years_to_show, rotation=45)


# Add legends
ax1.legend(loc='upper left')
ax2.legend(loc='upper right')

plt.tight_layout()
plt.show()
```

<Image size="md" img={image_9} alt="원격 데이터 세트와 로컬 데이터 세트의 플롯"/>

플롯된 데이터로부터 우리는 판매가 1995년에 약 160,000에서 시작하여 빠르게 증가하여 1999년에 약 540,000에 도달했음을 알 수 있습니다.
그 이후로 물량은 2000년대 중반까지 급격히 감소했으며, 2007-2008년 금융 위기 동안 심각하게 줄어들어 약 140,000으로 떨어졌습니다.
반면에 가격은 1995년에 약 £150,000에서 시작하여 2005년까지 약 £300,000까지 안정적이고 일관되게 성장했습니다.
2012년 이후 성장률이 상당히 가속화되었으며, 2019년까지 약 £400,000에서 £1,000,000 이상으로 가파르게 상승했습니다.
판매량과는 달리 가격은 2008년 위기의 영향을 최소한으로 받았으며, 상승세를 유지했습니다. 아아!

## 요약 {#summary}

이 가이드는 chDB가 ClickHouse Cloud와 로컬 데이터 소스를 연결하여 Jupyter 노트북에서 원활한 데이터 탐색을 가능하게 하는 방법을 보여주었습니다.
영국 부동산 가격 데이터 세트를 사용하여 `remoteSecure()` 함수를 통해 원격 ClickHouse Cloud 데이터를 쿼리하고, `file()` 테이블 엔진으로 로컬 CSV 파일을 읽고, 분석 및 시각화를 위해 결과를 직접 Pandas DataFrames로 변환하는 방법을 보여주었습니다.
chDB를 통해 데이터 과학자들은 ClickHouse의 강력한 SQL 기능과 Pandas 및 matplotlib과 같은 친숙한 Python 도구를 결합하여 포괄적인 분석을 위해 여러 데이터 소스를 쉽게 결합할 수 있습니다.

많은 런던 기반 데이터 과학자들이 당장 자신의 집이나 아파트를 살 수는 없지만, 최소한 그들이 가격에 밀린 시장을 분석할 수는 있습니다!
