---
slug: /use-cases/AI/marimo-notebook
sidebar_label: 'Marimo ノートブックと chDB を使ったデータ探索'
title: 'Marimo ノートブックと chDB を使ったデータ探索'
description: 'このガイドでは、Marimo ノートブック内で ClickHouse Cloud またはローカルファイル上のデータを探索するために chDB をセットアップして利用する方法を説明します'
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

このガイドでは、ClickHouse を基盤とする高速なインプロセス SQL OLAP エンジンである [chDB](/docs/chdb) を使って、Marimo notebook 上で ClickHouse Cloud 上のデータセットを探索する方法を学びます。

**前提条件:**

* Python 3.8 以上
* 仮想環境
* 稼働中の ClickHouse Cloud サービスと、その[接続情報](/docs/cloud/guides/sql-console/gather-connection-details)

:::tip
まだ ClickHouse Cloud アカウントをお持ちでない場合は、[サインアップ](https://console.clickhouse.cloud/signUp?loc=docs-marimo-chdb) して
トライアルに登録し、$300 分の無料クレジットを受け取って始めることができます。
:::

**このガイドで学べること:**

* Marimo notebooks から chDB を使って ClickHouse Cloud に接続する方法
* リモートデータセットに対してクエリを実行し、結果を Pandas DataFrame に変換する方法
* Marimo 上で Plotly を用いてデータを可視化する方法
* Marimo のリアクティブな実行モデルを活用して、対話的にデータ探索を行う方法

ここでは、スターターデータセットの 1 つとして ClickHouse Cloud で利用可能な UK Property Price データセットを使用します。
このデータセットには、1995 年から 2024 年までの、イギリスにおける住宅の売却価格に関するデータが含まれています。


## セットアップ {#setup}

### データセットの読み込み {#loading-the-dataset}

既存のClickHouse Cloudサービスにこのデータセットを追加するには、アカウント情報を使用して[console.clickhouse.cloud](https://console.clickhouse.cloud/)にログインします。

左側のメニューで`Data sources`をクリックします。次に`Predefined sample data`をクリックします:

<Image size='md' img={image_1} alt='サンプルデータセットの追加' />

UK property price paid data (4GB)カードで`Get started`を選択します:

<Image size='md' img={image_2} alt='UK不動産価格データセットの選択' />

次に`Import dataset`をクリックします:

<Image size='md' img={image_3} alt='UK不動産価格データセットのインポート' />

ClickHouseは自動的に`default`データベース内に`pp_complete`テーブルを作成し、2,892万行の価格データでテーブルを埋めます。

認証情報の漏洩リスクを減らすため、Cloudのユーザー名とパスワードをローカルマシンの環境変数として追加することを推奨します。
ターミナルから次のコマンドを実行して、ユーザー名とパスワードを環境変数として追加します:

### 認証情報の設定 {#setting-up-credentials}

```bash
export CLICKHOUSE_CLOUD_HOSTNAME=<HOSTNAME>
export CLICKHOUSE_CLOUD_USER=default
export CLICKHOUSE_CLOUD_PASSWORD=your_actual_password
```

:::note
上記の環境変数はターミナルセッションが続く間のみ保持されます。
永続的に設定するには、シェル設定ファイルに追加してください。
:::

### Marimoのインストール {#installing-marimo}

仮想環境をアクティベートします。
仮想環境内から、このガイドで使用する以下のパッケージをインストールします:

```python
pip install chdb pandas plotly marimo
```

次のコマンドで新しいMarimoノートブックを作成します:

```bash
marimo edit clickhouse_exploration.py
```

localhost:2718でMarimoインターフェースを表示する新しいブラウザウィンドウが開きます:

<Image size='md' img={image_4} alt='Marimoインターフェース' />

Marimoノートブックは純粋なPythonファイルとして保存されるため、バージョン管理や他者との共有が容易です。


## 依存関係のインストール {#installing-dependencies}

新しいセルで、必要なパッケージをインポートします:

```python
import marimo as mo
import chdb
import pandas as pd
import os
import plotly.express as px
import plotly.graph_objects as go
```

セルの上にマウスカーソルを合わせると、「+」記号の付いた2つの円が表示されます。
これらをクリックすることで新しいセルを追加できます。

新しいセルを追加し、すべてが正しく設定されているかを確認するために簡単なクエリを実行します:

```python
result = chdb.query("SELECT 'Hello ClickHouse from Marimo!'", "DataFrame")
result
```

実行したセルの下に結果が表示されます:

<Image size='md' img={image_5} alt='Marimo hello world' />


## データの探索 {#exploring-the-data}

英国の不動産価格データセットをセットアップし、MarimoノートブックでchDBを起動したので、データの探索を開始できます。
首都ロンドンなど、英国の特定地域における価格の経時変化を確認することに関心があると仮定しましょう。
ClickHouseの[`remoteSecure`](/docs/sql-reference/table-functions/remote)関数を使用すると、ClickHouse Cloudからデータを簡単に取得できます。
chDBに対して、このデータをプロセス内でPandasデータフレームとして返すよう指示できます。これはデータを扱う上で便利で馴染みのある方法です。

### ClickHouse Cloudデータのクエリ {#querying-clickhouse-cloud-data}

次のクエリを使用して新しいセルを作成し、ClickHouse Cloudサービスから英国の不動産価格データを取得して`pandas.DataFrame`に変換します:

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

上記のスニペットでは、`chdb.query(query, "DataFrame")`が指定されたクエリを実行し、結果をPandas DataFrameとして出力します。

クエリでは、[`remoteSecure`](/sql-reference/table-functions/remote)関数を使用してClickHouse Cloudに接続しています。

`remoteSecure`関数は次のパラメータを受け取ります:

- 接続文字列
- 使用するデータベースとテーブルの名前
- ユーザー名
- パスワード

セキュリティのベストプラクティスとして、ユーザー名とパスワードのパラメータには環境変数を使用することを推奨します。関数内に直接指定することも可能ですが、環境変数の使用が望ましいです。

`remoteSecure`関数はリモートのClickHouse Cloudサービスに接続し、クエリを実行して結果を返します。
データのサイズによっては、数秒かかる場合があります。

この例では、年ごとの平均価格を返し、`town='LONDON'`でフィルタリングしています。
結果は`df`という変数にDataFrameとして格納されます。

### データの可視化 {#visualizing-the-data}

データが馴染みのある形式で利用可能になったので、ロンドンの不動産価格が時間とともにどのように変化したかを探索しましょう。

MarimoはPlotlyのようなインタラクティブなプロットライブラリと特に相性が良いです。
新しいセルで、インタラクティブなチャートを作成します:

```python
fig = px.line(
    df,
    x='year',
    y='price',
    title='ロンドンの不動産平均価格の推移',
    labels={'price': '平均価格 (£)', 'year': '年'}
)

fig.update_traces(mode='lines+markers')
fig.update_layout(hovermode='x unified')
fig
```

おそらく驚くことではありませんが、ロンドンの不動産価格は時間とともに大幅に上昇しています。

<Image size='md' img={image_6} alt='Marimoデータ可視化' />

Marimoの強みの一つは、リアクティブな実行モデルです。異なる都市を動的に選択するインタラクティブなウィジェットを作成しましょう。

### インタラクティブな都市選択 {#interactive-town-selection}

新しいセルで、異なる都市を選択するドロップダウンを作成します:

```python
town_selector = mo.ui.dropdown(
    options=['LONDON', 'MANCHESTER', 'BIRMINGHAM', 'LEEDS', 'LIVERPOOL'],
    value='LONDON',
    label='都市を選択:'
)
town_selector
```

別のセルで、都市選択に反応するクエリを作成します。ドロップダウンを変更すると、このセルは自動的に再実行されます:

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

次に、都市を変更すると自動的に更新されるチャートを作成します。
チャートを動的データフレームの上に移動して、ドロップダウンのあるセルの下に表示されるようにできます。


```python
fig_reactive = px.line(
    df_reactive,
    x='year',
    y='price',
    title=f'{town_selector.value}の平均不動産価格の推移',
    labels={'price': '平均価格 (£)', 'year': '年'}
)

fig_reactive.update_traces(mode='lines+markers')
fig_reactive.update_layout(hovermode='x unified')
fig_reactive
```

ドロップダウンから町を選択すると、チャートが動的に更新されます:

<Image size='md' img={image_7} alt='Marimo dynamic chart' />

### インタラクティブな箱ひげ図による価格分布の探索 {#exploring-price-distributions}

ロンドンにおける年ごとの不動産価格の分布を調べることで、データをより深く掘り下げてみましょう。
箱ひげ図は中央値、四分位数、外れ値を表示し、平均価格だけでは得られない詳細な理解を提供します。
まず、年をインタラクティブに探索できるスライダーを作成しましょう:

新しいセルに以下を追加します:

```python
year_slider = mo.ui.slider(
    start=1995,
    stop=2024,
    value=2020,
    step=1,
    label='年を選択:',
    show_value=True
)
year_slider
```

次に、選択した年の個別の不動産価格をクエリします。
ここでは集計を行わないことに注意してください。分布を構築するために、すべての個別トランザクションが必要です:

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

```


# インタラクティブな箱ひげ図を作成します。

fig&#95;box = go.Figure()

fig&#95;box.add&#95;trace(
go.Box(
y=df&#95;distribution[&#39;price&#39;],
name=f&#39;London {year_slider.value}&#39;,
boxmean=&#39;sd&#39;,  # 平均値と標準偏差を表示
marker&#95;color=&#39;lightblue&#39;,
boxpoints=&#39;outliers&#39;  # 外れ値の点を表示
)
)

fig&#95;box.update&#95;layout(
title=f&#39;Distribution of Property Prices in London ({year_slider.value})&#39;,
yaxis=dict(
title=&#39;Price (£)&#39;,
tickformat=&#39;,.0f&#39;
),
showlegend=False,
height=600
)

fig&#95;box

```
セルの右上にあるオプションボタンを選択すると、コードを非表示にできます。
スライダーを動かすと、Marimoのリアクティブ実行によってプロットが自動的に更新されます:

<Image size="md" img={image_8} alt="Marimoの動的チャート"/>
```


## まとめ {#summary}

本ガイドでは、Marimoノートブックを使用してchDBでClickHouse Cloud上のデータを探索する方法を説明しました。
UK Property Priceデータセットを用いて、`remoteSecure()`関数によるリモートのClickHouse Cloudデータへのクエリ実行と、結果を直接Pandas DataFrameに変換して分析・可視化を行う方法を示しました。
chDBとMarimoのリアクティブ実行モデルを活用することで、データサイエンティストはClickHouseの強力なSQL機能とPandasやPlotlyなどの使い慣れたPythonツールを組み合わせて利用でき、インタラクティブなウィジェットと自動依存関係追跡により、探索的分析をより効率的かつ再現性の高いものにすることができます。
