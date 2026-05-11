---
slug: /use-cases/AI/jupyter-notebook
sidebar_label: 'Jupyter 노트북과 chDB를 사용한 데이터 탐색'
title: 'Jupyter 노트북에서 chDB를 사용해 데이터 탐색'
description: '이 가이드는 Jupyer 노트북에서 ClickHouse Cloud 또는 로컬 파일에 있는 데이터를 탐색할 수 있도록 chDB를 설정하고 사용하는 방법을 설명합니다'
keywords: ['ML', 'Jupyer', 'chDB', 'pandas']
doc_type: 'guide'
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


# Jupyter 노트북과 chDB로 데이터 탐색하기 \{#exploring-data-with-jupyter-notebooks-and-chdb\}

이 가이드에서는 ClickHouse 기반의 빠른 인프로세스 SQL OLAP Engine인 [chDB](/chdb)를 사용하여 Jupyter 노트북에서 ClickHouse Cloud의 데이터셋을 탐색하는 방법을 설명합니다.

**사전 준비 사항**:

- 가상 환경
- 동작 중인 ClickHouse Cloud 서비스와 [연결 정보](/cloud/guides/sql-console/gather-connection-details)

:::tip
아직 ClickHouse Cloud 계정이 없다면, [회원 가입](https://console.clickhouse.cloud/signUp?loc=docs-juypter-chdb)을 통해
무료 체험을 시작하고 300달러 상당의 무료 크레딧을 받을 수 있습니다.
:::

**학습 내용:**

- Jupyter 노트북에서 chDB를 사용하여 ClickHouse Cloud에 연결하기
- 원격 데이터셋을 쿼리하고 결과를 Pandas DataFrame으로 변환하기
- 분석을 위해 Cloud의 데이터와 로컬 CSV 파일을 결합하기
- matplotlib을 사용해 데이터 시각화하기

이 가이드에서는 시작용 데이터셋 중 하나로 ClickHouse Cloud에서 제공되는 UK Property Price 데이터셋을 사용합니다.
이 데이터셋에는 1995년부터 2024년까지 영국 내 주택 판매 가격에 대한 데이터가 포함되어 있습니다.

## Setup \{#setup\}

기존 ClickHouse Cloud 서비스에 이 데이터셋을 추가하려면 계정 정보를 사용하여 [console.clickhouse.cloud](https://console.clickhouse.cloud/)에 로그인합니다.

왼쪽 메뉴에서 `Data sources`를 클릭한 다음 `Predefined sample data`를 클릭합니다:

<Image size="md" img={image_1} alt="예제 데이터 세트 추가" />

UK property price paid data (4GB) 카드에서 `Get started`를 선택합니다:

<Image size="md" img={image_2} alt="UK price paid 데이터셋 선택" />

그런 다음 `Import dataset`을 클릭합니다:

<Image size="md" img={image_3} alt="UK price paid 데이터셋 가져오기" />

ClickHouse는 `default` 데이터베이스에 `pp_complete` 테이블을 자동으로 생성하고, 이 테이블을 2,892만 행의 가격 포인트 데이터로 채웁니다.

자격 증명이 노출될 가능성을 줄이기 위해 Cloud 계정의 사용자 이름과 비밀번호를 로컬 머신의 환경 변수로 추가할 것을 권장합니다.
터미널에서 다음 명령을 실행하여 사용자 이름과 비밀번호를 환경 변수로 추가합니다:

```bash
export CLICKHOUSE_USER=default
export CLICKHOUSE_PASSWORD=your_actual_password
```

:::note
위의 환경 변수는 현재 터미널 세션이 유지되는 동안에만 적용됩니다.
영구적으로 설정하려면 셸 설정 파일에 추가하십시오.
:::

이제 가상 환경을 활성화하십시오.
가상 환경이 활성화된 상태에서 다음 명령으로 Jupyter Notebook을 설치합니다:

```python
pip install notebook
```

다음 명령어를 사용해 Jupyter Notebook을 실행하십시오:

```python
jupyter notebook
```

새 브라우저 창이 열리고 `localhost:8888`에서 Jupyter 인터페이스가 표시됩니다.
새 Notebook을 만들려면 `File` &gt; `New` &gt; `Notebook`을 클릭합니다.

<Image size="md" img={image_4} alt="새 노트북 생성" />

커널을 선택하라는 메시지가 표시됩니다.
사용 가능한 Python 커널 중 하나를 선택합니다. 이 예제에서는 `ipykernel`을 선택합니다:

<Image size="md" img={image_5} alt="커널 선택" />

빈 셀에서 원격 ClickHouse Cloud 인스턴스에 연결하는 데 사용할 chDB를 설치하려면 다음 명령을 입력합니다:

```python
pip install chdb
```

이제 chDB를 임포트하고 간단한 쿼리를 실행하여 모든 구성이 올바르게 완료되었는지 확인할 수 있습니다:

```python
import chdb

result = chdb.query("SELECT 'Hello, ClickHouse!' as message")
print(result)
```


## 데이터 탐색 \{#exploring-the-data\}

UK 집값 거래(UK price paid) 데이터가 준비되어 있고 chDB가 Jupyter Notebook에서 실행 중이라면, 이제 데이터를 탐색해 볼 수 있습니다.

영국의 특정 지역, 예를 들어 수도인 런던에 대해 가격이 시간에 따라 어떻게 변했는지 확인하고 싶다고 가정해 보겠습니다.
ClickHouse의 [`remoteSecure`](/sql-reference/table-functions/remote) 함수는 ClickHouse Cloud에서 데이터를 손쉽게 가져올 수 있도록 합니다.
chDB가 이 데이터를 Pandas 데이터프레임 형태로 반환하도록 설정할 수 있으며, 이는 데이터 작업에 편리하고 익숙한 방식입니다.

다음 쿼리를 작성하여 ClickHouse Cloud 서비스에서 UK 집값 거래 데이터를 가져와 `pandas.DataFrame`으로 변환하십시오:

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

위의 스니펫에서 `chdb.query(query, "DataFrame")`는 지정한 쿼리를 실행하고 결과를 Pandas DataFrame 형태로 터미널에 출력합니다.
이 쿼리에서는 ClickHouse Cloud에 연결하기 위해 `remoteSecure` 함수를 사용합니다.
`remoteSecure` 함수는 다음과 같은 매개변수를 받습니다:

* 연결 문자열
* 사용할 데이터베이스와 테이블 이름
* 사용자 이름
* 비밀번호

보안 모범 사례로, 함수 호출 시 사용자 이름과 비밀번호를 직접 인자로 전달하기보다는 환경 변수를 사용하는 것이 좋습니다. 원한다면 값을 직접 전달하는 것도 가능하지만, 환경 변수를 사용하는 방식을 권장합니다.

`remoteSecure` 함수는 원격 ClickHouse Cloud 서비스에 연결하여 쿼리를 실행하고 결과를 반환합니다.
데이터 크기에 따라 몇 초 정도 소요될 수 있습니다.
이 예제에서는 연도별 평균 가격을 반환하고, `town='LONDON'`으로 필터링합니다.
그 결과는 `df`라는 변수에 DataFrame으로 저장됩니다.

`df.head`는 반환된 데이터의 처음 몇 개의 행만 표시합니다:

<Image size="md" img={image_6} alt="dataframe 미리보기" />

새 셀에서 다음 명령을 실행하여 컬럼 타입을 확인하십시오:

```python
df.dtypes
```

```response
year          uint16
avg_price    float64
dtype: object
```

ClickHouse에서 `date`는 `Date` 타입이지만, 결과 데이터 프레임에서는 `uint16` 타입인 것에 주목하십시오.
chDB는 DataFrame을 반환할 때 가장 적절한 타입을 자동으로 추론합니다.

이제 데이터가 익숙한 형태로 준비되었으므로, 시간이 지나면서 런던 부동산 가격이 어떻게 변했는지 살펴보겠습니다.

새 셀에서 다음 명령을 실행하여 matplotlib을 사용해 런던의 시간에 따른 가격을 보여 주는 간단한 차트를 생성하십시오:

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

<Image size="md" img={image_7} alt="데이터프레임 미리보기" />

예상할 수 있듯이, 런던의 부동산 가격은 시간이 지남에 따라 크게 상승했습니다.

동료 데이터 과학자가 추가 주택 관련 변수가 포함된 .csv 파일을 보내왔고,
런던에서 판매된 주택 수가 시간이 지남에 따라 어떻게 변했는지 궁금해하고 있습니다.
이 변수들 중 일부를 주택 가격과 함께 그래프로 그려 상관관계를 발견할 수 있는지 살펴보겠습니다.

`file` 테이블 엔진을 사용하여 로컬 머신의 파일을 직접 읽을 수 있습니다.
새 셀에서 다음 명령을 실행하여 로컬 .csv 파일에서 새로운 DataFrame을 생성합니다.

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
  <summary>단일 단계에서 여러 소스를 읽기</summary>
  단일 단계에서 여러 소스의 데이터를 읽을 수도 있습니다. 이를 위해 아래와 같이 `JOIN`을 사용하는 쿼리를 작성할 수 있습니다:

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

<Image size="md" img={image_8} alt="데이터프레임 미리 보기" />

2020년 이후의 데이터는 없지만, 1995년부터 2019년까지의 연도에 대해서는 두 데이터셋을 서로 비교해 그래프로 시각화할 수 있습니다.
새 셀에서 다음 명령을 실행하십시오:

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

<Image size="md" img={image_9} alt="원격 데이터 세트와 로컬 데이터 세트의 그래프" />

그래프를 보면, 1995년에 판매량이 약 160,000에서 시작해 빠르게 급증하여 1999년에는 약 540,000에서 정점을 찍었습니다.
그 이후로 물량은 2000년대 중반까지 급격히 감소했고, 2007-2008년 금융 위기 동안 크게 떨어지면서 약 140,000 수준까지 내려갔습니다.
한편 가격은 1995년 약 £150,000에서 2005년 약 £300,000까지 꾸준하고 일관된 성장을 보였습니다.
2012년 이후 성장세가 크게 가속되어, 약 £400,000 수준에서 2019년에는 £1,000,000을 넘어설 정도로 가파르게 상승했습니다.
판매량과 달리 가격은 2008년 위기의 영향을 거의 받지 않았고 상승 추세를 유지했습니다. 정말 놀랍습니다!


## 요약 \{#summary\}

이 가이드는 chDB가 ClickHouse Cloud와 로컬 데이터 소스를 연결하여 Jupyter 노트북에서 원활한 데이터 탐색을 가능하게 하는 방법을 보여주었습니다.
UK Property Price 데이터셋을 사용하여 `remoteSecure()` 함수로 원격 ClickHouse Cloud 데이터를 쿼리하고, `file()` 테이블 엔진으로 로컬 CSV 파일을 읽은 뒤, 결과를 바로 Pandas DataFrame으로 변환해 분석과 시각화를 수행하는 방법을 설명했습니다.
chDB를 통해 데이터 과학자는 Pandas, matplotlib과 같은 익숙한 Python 도구와 함께 ClickHouse의 강력한 SQL 기능을 활용하여 여러 데이터 소스를 손쉽게 결합하고, 보다 종합적인 분석을 수행할 수 있습니다.

많은 런던 기반 데이터 과학자는 당분간 자신만의 집이나 아파트를 마련할 형편이 되지 않을 수 있지만, 적어도 자신들을 시장 밖으로 밀어낸 부동산 시장은 분석해 볼 수 있습니다!