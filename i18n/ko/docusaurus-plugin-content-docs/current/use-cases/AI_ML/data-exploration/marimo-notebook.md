---
slug: /use-cases/AI/marimo-notebook
sidebar_label: 'Marimo 노트북과 chDB로 데이터 탐색하기'
title: 'Marimo 노트북과 chDB로 데이터 탐색하기'
description: '이 가이드는 Marimo 노트북에서 ClickHouse Cloud 또는 로컬 파일의 데이터를 탐색하기 위해 chDB를 설정하고 활용하는 방법을 설명합니다.'
keywords: ['ML', 'Marimo', 'chDB', 'pandas']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import image_1 from '@site/static/images/use-cases/AI_ML/jupyter/1.png';
import image_2 from '@site/static/images/use-cases/AI_ML/jupyter/2.png';
import image_3 from '@site/static/images/use-cases/AI_ML/jupyter/3.png';
import image_4 from '@site/static/images/use-cases/AI_ML/Marimo/4.png';
import image_5 from '@site/static/images/use-cases/AI_ML/Marimo/5.png';
import image_6 from '@site/static/images/use-cases/AI_ML/Marimo/6.png';
import image_7 from '@site/static/images/use-cases/AI_ML/Marimo/7.gif';
import image_8 from '@site/static/images/use-cases/AI_ML/Marimo/8.gif';

이 가이드에서는 ClickHouse 기반의 빠른 인프로세스 SQL OLAP Engine인 [chDB](/docs/chdb)를 활용하여 Marimo 노트북에서 ClickHouse Cloud 데이터셋을 탐색하는 방법을 학습합니다.

**사전 준비 사항:**

* Python 3.8 이상
* 가상 환경
* 동작 중인 ClickHouse Cloud 서비스와 [연결 정보](/docs/cloud/guides/sql-console/gather-connection-details)

:::tip
아직 ClickHouse Cloud 계정이 없다면, [가입](https://console.clickhouse.cloud/signUp?loc=docs-marimo-chdb)을 통해
체험판을 시작하고 300달러 상당의 무료 크레딧을 받을 수 있습니다.
:::

**학습 목표:**

* Marimo 노트북에서 chDB를 사용해 ClickHouse Cloud에 연결하는 방법
* 원격 데이터셋에 쿼리를 실행하고 결과를 Pandas DataFrame으로 변환하는 방법
* Marimo에서 Plotly를 사용해 데이터를 시각화하는 방법
* Marimo의 반응형 실행 모델을 활용하여 대화형 데이터 탐색을 수행하는 방법

이 예제에서는 ClickHouse Cloud에서 시작용 데이터셋 중 하나로 제공되는 UK Property Price 데이터셋을 사용합니다.
이 데이터셋에는 1995년부터 2024년까지 영국에서 주택이 판매된 가격 정보가 포함되어 있습니다.


## 환경 설정 \{#setup\}

### 데이터 세트 로드하기 \{#loading-the-dataset\}

기존 ClickHouse Cloud 서비스에 이 데이터 세트를 추가하려면 계정 정보로 [console.clickhouse.cloud](https://console.clickhouse.cloud/)에 로그인합니다.

왼쪽 메뉴에서 `Data sources`를 클릭합니다. 그런 다음 `Predefined sample data`를 클릭합니다:

<Image size="md" img={image_1} alt="예시 데이터 세트 추가"/>

UK property price paid data (4GB) 카드에서 `Get started`를 선택합니다:

<Image size="md" img={image_2} alt="UK price paid 데이터 세트 선택"/>

그런 다음 `Import dataset`을 클릭합니다:

<Image size="md" img={image_3} alt="UK price paid 데이터 세트 가져오기"/>

ClickHouse는 `default` 데이터베이스에 `pp_complete` 테이블을 자동으로 생성하고, 이 테이블을 2,892만 행의 가격 데이터로 채웁니다.

자격 증명이 노출될 가능성을 줄이기 위해 Cloud 사용자 이름과 비밀번호를 로컬 머신의 환경 변수로 설정할 것을 권장합니다.
터미널에서 다음 명령을 실행하여 사용자 이름과 비밀번호를 환경 변수로 추가합니다:

### 인증 정보 설정 \{#setting-up-credentials\}

```bash
export CLICKHOUSE_CLOUD_HOSTNAME=<HOSTNAME>
export CLICKHOUSE_CLOUD_USER=default
export CLICKHOUSE_CLOUD_PASSWORD=your_actual_password
```

:::note
위에서 정의한 환경 변수는 현재 터미널 세션 동안에만 유지됩니다.
영구적으로 설정하려면 셸 설정 파일에 추가해야 합니다.
:::


### Marimo 설치 \{#installing-marimo\}

이제 가상 환경을 활성화하십시오.
가상 환경에서 이 가이드에서 사용할 다음 패키지를 설치하십시오:

```python
pip install chdb pandas plotly marimo
```

다음 명령으로 새 Marimo 노트북을 생성합니다:

```bash
marimo edit clickhouse_exploration.py
```

새 브라우저 창이 열리며 localhost:2718에서 Marimo 인터페이스가 표시됩니다:

<Image size="md" img={image_4} alt="Marimo interface" />

Marimo 노트북은 순수 Python 파일로 저장되므로 버전 관리 및 다른 사람과의 공유가 쉽습니다.


## 종속성 설치 \{#installing-dependencies\}

새 셀에서 필요한 패키지를 임포트합니다:

```python
import marimo as mo
import chdb
import pandas as pd
import os
import plotly.express as px
import plotly.graph_objects as go
```

셀 위에 마우스를 올리면 「+」 기호가 있는 두 개의 동그라미가 표시됩니다.
이를 클릭하여 새 셀을 추가할 수 있습니다.

새 셀을 추가한 뒤, 간단한 쿼리를 실행해 모든 구성이 올바르게 완료되었는지 확인하십시오:

```python
result = chdb.query("SELECT 'Hello ClickHouse from Marimo!'", "DataFrame")
result
```

방금 실행한 셀 아래에 다음과 같은 결과가 보여야 합니다:

<Image size="md" img={image_5} alt="Marimo hello world" />


## 데이터 탐색하기 \{#exploring-the-data\}

UK 주택 거래 가격 데이터 세트와 Marimo 노트북에서 실행 중인 chDB가 준비되었으므로 이제 데이터를 탐색해 볼 수 있습니다.
영국의 특정 지역, 예를 들어 수도인 런던(London)을 대상으로, 시간에 따라 가격이 어떻게 변했는지 확인하고자 한다고 가정해 보겠습니다.
ClickHouse의 [`remoteSecure`](/docs/sql-reference/table-functions/remote) 함수는 ClickHouse Cloud에서 데이터를 쉽게 조회할 수 있도록 해줍니다.
chDB가 이 데이터를 프로세스 내에서 Pandas 데이터프레임 형태로 반환하도록 설정할 수 있으며, 이는 데이터 작업에 익숙하고 편리한 방식입니다.

### ClickHouse Cloud 데이터 쿼리하기 \{#querying-clickhouse-cloud-data\}

다음 쿼리로 새 셀을 생성하여 ClickHouse Cloud 서비스에서 영국 Price Paid 데이터(UK price paid data)를 가져온 뒤 `pandas.DataFrame`으로 변환합니다:

```python
query = f"""
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 1000000, 80)
FROM remoteSecure(
    '{os.environ.get("CLICKHOUSE_CLOUD_HOSTNAME")}',
    'default.pp_complete',
    '{os.environ.get("CLICKHOUSE_CLOUD_USER")}',
    '{os.environ.get("CLICKHOUSE_CLOUD_PASSWORD")}'
)
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year
"""

df = chdb.query(query, "DataFrame")
df.head()
```

위의 스니펫에서 `chdb.query(query, "DataFrame")`는 지정한 쿼리를 실행하고 결과를 Pandas DataFrame으로 출력합니다.

이 쿼리에서는 ClickHouse Cloud에 연결하기 위해 [`remoteSecure`](/sql-reference/table-functions/remote) 함수를 사용합니다.

`remoteSecure` 함수는 다음과 같은 매개변수를 받습니다:

* 연결 문자열
* 사용할 데이터베이스와 테이블 이름
* 사용자 이름
* 비밀번호

보안 모범 사례 측면에서, 사용자 이름과 비밀번호 매개변수는 함수 안에 직접 지정할 수도 있지만, 가능하면 환경 변수를 사용하는 것이 좋습니다.

`remoteSecure` 함수는 원격 ClickHouse Cloud 서비스에 연결하여 쿼리를 실행하고 결과를 반환합니다.
데이터 크기에 따라 몇 초가 소요될 수 있습니다.

이 예제에서는 연도별 평균 가격을 반환하고, `town='LONDON'`으로 필터링합니다.
그 결과는 `df`라는 변수의 DataFrame으로 저장됩니다.


### 데이터 시각화 \{#visualizing-the-data\}

이제 데이터를 익숙한 형태로 준비했으니, 시간이 지나면서 런던의 부동산 가격이 어떻게 변해 왔는지 살펴보겠습니다.

Marimo는 Plotly와 같은 대화형 시각화 라이브러리와 특히 잘 연동됩니다.
새로운 셀에서 대화형 차트를 생성하십시오.

```python
fig = px.line(
    df, 
    x='year', 
    y='price',
    title='Average Property Prices in London Over Time',
    labels={'price': 'Average Price (£)', 'year': 'Year'}
)

fig.update_traces(mode='lines+markers')
fig.update_layout(hovermode='x unified')
fig
```

어느 정도 예상할 수 있듯이, 런던의 부동산 가격은 시간이 지남에 따라 크게 상승했습니다.

<Image size="md" img={image_6} alt="Marimo data visualization" />

Marimo의 강점 중 하나는 리액티브 실행 모델입니다. 다양한 도시를 동적으로 선택할 수 있는 대화형 위젯을 만들어 보겠습니다.


### 대화형 도시 선택 \{#interactive-town-selection\}

새 셀에서 여러 도시를 선택할 수 있는 드롭다운을 생성합니다:

```python
town_selector = mo.ui.dropdown(
    options=['LONDON', 'MANCHESTER', 'BIRMINGHAM', 'LEEDS', 'LIVERPOOL'],
    value='LONDON',
    label='Select a town:'
)
town_selector
```

다른 셀에서 마을 선택에 따라 동작하는 쿼리를 작성합니다. 드롭다운을 변경하면 이 셀이 자동으로 다시 실행됩니다:

```python
query_reactive = f"""
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price
FROM remoteSecure(
    '{os.environ.get("CLICKHOUSE_CLOUD_HOSTNAME")}',
    'default.pp_complete',
    '{os.environ.get("CLICKHOUSE_CLOUD_USER")}',
    '{os.environ.get("CLICKHOUSE_CLOUD_PASSWORD")}'
)
WHERE town = '{town_selector.value}'
GROUP BY year
ORDER BY year
"""

df_reactive = chdb.query(query_reactive, "DataFrame")
df_reactive
```

이제 마을을 변경할 때 자동으로 업데이트되는 차트를 만듭니다.
드롭다운이 있는 셀 바로 아래에 표시되도록 차트를 동적 데이터프레임보다 위쪽으로 이동할 수 있습니다.

```python
fig_reactive = px.line(
    df_reactive,
    x='year',
    y='price',
    title=f'Average Property Prices in {town_selector.value} Over Time',
    labels={'price': 'Average Price (£)', 'year': 'Year'}
)

fig_reactive.update_traces(mode='lines+markers')
fig_reactive.update_layout(hovermode='x unified')
fig_reactive
```

이제 드롭다운에서 마을을 선택하면 차트가 동적으로 업데이트됩니다:

<Image size="md" img={image_7} alt="Marimo dynamic chart" />


### 인터랙티브 박스 플롯으로 가격 분포 탐색하기 \{#exploring-price-distributions\}

이제 런던의 부동산 가격 분포를 연도별로 살펴보면서 데이터를 더 깊이 탐색해 보겠습니다.
상자 수염 그림(box and whisker plot)은 중앙값, 사분위수, 이상치 등을 보여 주어 단순 평균 가격보다 훨씬 더 잘 이해할 수 있게 해 줍니다.
먼저, 서로 다른 연도를 인터랙티브하게 탐색할 수 있는 연도 슬라이더를 만들어 보겠습니다.

새 셀에 다음 내용을 추가합니다:

```python
year_slider = mo.ui.slider(
    start=1995,
    stop=2024,
    value=2020,
    step=1,
    label='Select Year:',
    show_value=True
)
year_slider
```

이제 선택한 연도의 개별 부동산 가격을 쿼리합니다.
여기서는 집계를 수행하지 않습니다. 분포를 구성하기 위해 모든 개별 거래가 필요합니다:

```python
query_distribution = f"""
SELECT
    price,
    toYear(date) AS year
FROM remoteSecure(
    '{os.environ.get("CLICKHOUSE_CLOUD_HOSTNAME")}',
    'default.pp_complete',
    '{os.environ.get("CLICKHOUSE_CLOUD_USER")}',
    '{os.environ.get("CLICKHOUSE_CLOUD_PASSWORD")}'
)
WHERE town = 'LONDON'
  AND toYear(date) = {year_slider.value}
  AND price > 0
  AND price < 5000000
"""

df_distribution = chdb.query(query_distribution, "DataFrame")

# create an interactive box plot.
fig_box = go.Figure()

fig_box.add_trace(
    go.Box(
        y=df_distribution['price'],
        name=f'London {year_slider.value}',
        boxmean='sd',  # Show mean and standard deviation
        marker_color='lightblue',
        boxpoints='outliers'  # Show outlier points
    )
)

fig_box.update_layout(
    title=f'Distribution of Property Prices in London ({year_slider.value})',
    yaxis=dict(
        title='Price (£)',
        tickformat=',.0f'
    ),
    showlegend=False,
    height=600
)

fig_box
```

셀의 오른쪽 상단에 있는 옵션 버튼을 선택하면 코드를 숨길 수 있습니다.
슬라이더를 이동하면 Marimo의 리액티브 실행 덕분에 플롯이 자동으로 업데이트됩니다:

<Image size="md" img={image_8} alt="Marimo dynamic chart" />


## 요약 \{#summary\}

이 가이드에서는 chDB를 사용하여 Marimo 노트북에서 ClickHouse Cloud의 데이터를 탐색하는 방법을 살펴보았습니다.
UK Property Price 데이터셋을 사용하여 `remoteSecure()` 함수를 통해 원격 ClickHouse Cloud 데이터를 쿼리하고, 결과를 바로 Pandas DataFrame으로 변환해 분석과 시각화를 수행하는 방법을 보여주었습니다.
chDB와 Marimo의 반응형 실행 모델을 통해 데이터 과학자들은 ClickHouse의 강력한 SQL 기능을 Pandas, Plotly와 같은 익숙한 Python 도구와 함께 활용할 수 있으며, 탐색적 데이터 분석을 더욱 효율적이고 재현 가능하게 만드는 대화형 위젯과 자동 의존성 추적 기능의 이점도 누릴 수 있습니다.