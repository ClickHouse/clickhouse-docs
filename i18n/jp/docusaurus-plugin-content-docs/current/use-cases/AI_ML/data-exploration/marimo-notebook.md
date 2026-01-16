---
slug: /use-cases/AI/marimo-notebook
sidebar_label: 'Marimo ノートブックと chDB でデータを探索する'
title: 'Marimo ノートブックと chDB でデータを探索する'
description: 'このガイドでは、Marimo ノートブックで ClickHouse Cloud やローカルファイルのデータを探索するために chDB をセットアップして利用する方法を説明します'
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

このガイドでは、[chDB](/docs/chdb) — ClickHouse をベースにした高速なインプロセス SQL OLAP エンジン — を利用して、Marimo ノートブック上で ClickHouse Cloud 上のデータセットを探索する方法を説明します。

**前提条件:**

* Python 3.8 以上
* 仮想環境
* 稼働中の ClickHouse Cloud サービスと、その[接続情報](/docs/cloud/guides/sql-console/gather-connection-details)

:::tip
まだ ClickHouse Cloud アカウントをお持ちでない場合は、[サインアップ](https://console.clickhouse.cloud/signUp?loc=docs-marimo-chdb)して
トライアルを開始し、300ドル分の無料クレジットを入手できます。
:::

**このガイドで学べること:**

* Marimo ノートブックから chDB を使って ClickHouse Cloud に接続する方法
* リモートデータセットに対してクエリを実行し、結果を Pandas の DataFrame に変換する方法
* Marimo 上で Plotly を使ってデータを可視化する方法
* 対話的なデータ探索のために、Marimo のリアクティブな実行モデルを活用する方法

ここでは、スターターデータセットの 1 つとして ClickHouse Cloud 上で利用可能な UK Property Price データセットを使用します。
このデータセットには、1995 年から 2024 年までのイギリスにおける住宅の売却価格に関するデータが含まれています。

## セットアップ \{#setup\}

### データセットの読み込み \{#loading-the-dataset\}

既存の ClickHouse Cloud サービスにこのデータセットを追加するには、アカウントで [console.clickhouse.cloud](https://console.clickhouse.cloud/) にログインします。

左側のメニューから `Data sources` をクリックし、続いて `Predefined sample data` をクリックします:

<Image size="md" img={image_1} alt="サンプルデータセットを追加" />

UK property price paid data (4GB) のカードで `Get started` を選択します:

<Image size="md" img={image_2} alt="UK price paid データセットを選択" />

次に `Import dataset` をクリックします:

<Image size="md" img={image_3} alt="UK price paid データセットをインポート" />

ClickHouse は自動的に `pp_complete` テーブルを `default` データベース内に作成し、そのテーブルに 2,892 万行の価格データを投入します。

認証情報が漏洩する可能性を減らすため、ClickHouse Cloud のユーザー名とパスワードをローカルマシンの環境変数として登録することをお勧めします。ターミナルから次のコマンドを実行して、ユーザー名とパスワードを環境変数として追加します:

### 認証情報の設定 \{#setting-up-credentials\}

```bash
export CLICKHOUSE_CLOUD_HOSTNAME=<HOSTNAME>
export CLICKHOUSE_CLOUD_USER=default
export CLICKHOUSE_CLOUD_PASSWORD=your_actual_password
```

:::note
上記の環境変数は、ターミナルセッションの間だけ有効です。
永続的に設定するには、シェルの設定ファイルに追加してください。
:::

### Marimo のインストール \{#installing-marimo\}

まず仮想環境を有効にします。
仮想環境を有効にした状態で、このガイドで使用する次のパッケージをインストールします。

```python
pip install chdb pandas plotly marimo
```

次のコマンドで新しい Marimo ノートブックを作成します：

```bash
marimo edit clickhouse_exploration.py
```

新しいブラウザーウィンドウが開き、localhost:2718 で Marimo インターフェースが表示されます。

<Image size="md" img={image_4} alt="Marimo interface" />

Marimo ノートブックは純粋な Python ファイルとして保存されるため、バージョン管理や他者との共有が容易です。

## 依存関係のインストール \{#installing-dependencies\}

新しいセルで必要なパッケージをインポートします。

```python
import marimo as mo
import chdb
import pandas as pd
import os
import plotly.express as px
import plotly.graph_objects as go
```

セルにマウスカーソルを合わせると、「+」記号の付いた2つの円が表示されます。
これらをクリックすると新しいセルを追加できます。

新しいセルを追加し、すべてが正しく設定されていることを確認するために、簡単なクエリを実行してください。

```python
result = chdb.query("SELECT 'Hello ClickHouse from Marimo!'", "DataFrame")
result
```

直前に実行したセルの下に、次のような結果が表示されるはずです。

<Image size="md" img={image_5} alt="Marimo hello world" />

## データの探索 \{#exploring-the-data\}

UK price paid データセットをセットアップし、Marimo ノートブック上で chDB が稼働していれば、データの探索を始めることができます。
首都ロンドンのような、UK の特定エリアにおける価格が時間とともにどのように変化したかを確認したいとします。
ClickHouse の [`remoteSecure`](/docs/sql-reference/table-functions/remote) 関数を使うと、ClickHouse Cloud からデータを簡単に取得できます。
chDB に対して、このデータを同一プロセス内で Pandas のデータフレームとして返すよう指示できます。これはデータを扱ううえで便利でなじみのある形式です。

### ClickHouse Cloud データのクエリ実行 \{#querying-clickhouse-cloud-data\}

新しいセルを作成し、次のクエリを使用して ClickHouse Cloud サービスから UK price paid データを取得し、それを `pandas.DataFrame` に変換します。

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

上記のスニペットでは、`chdb.query(query, "DataFrame")` が指定したクエリを実行し、その結果を Pandas の DataFrame として出力します。

このクエリでは、[`remoteSecure`](/sql-reference/table-functions/remote) 関数を使用して ClickHouse Cloud に接続しています。

`remoteSecure` 関数は、以下のパラメータを受け取ります:

* 接続文字列
* 使用するデータベース名とテーブル名
* ユーザー名
* パスワード

セキュリティのベストプラクティスとして、関数内でこれらを直接指定することも可能ではありますが、ユーザー名とパスワードのパラメータには環境変数を使用することを推奨します。

`remoteSecure` 関数は、リモートの ClickHouse Cloud サービスに接続し、クエリを実行して結果を返します。
データのサイズによっては、これに数秒かかる場合があります。

この例では、年ごとの平均価格を返し、`town='LONDON'` でフィルタリングしています。
結果は `df` という変数の DataFrame に保存されます。

### データの可視化 \{#visualizing-the-data\}

データが扱い慣れた形式で利用可能になったので、ロンドンの不動産価格が時間とともにどのように変化したかを見ていきます。

Marimo は、Plotly のようなインタラクティブなプロットライブラリと特に相性良く動作します。
新しいセルで、インタラクティブなチャートを作成します:

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

おそらく予想どおり、ロンドンの不動産価格は時間の経過とともに大幅に上昇しています。

<Image size="md" img={image_6} alt="Marimo のデータ可視化" />

Marimo の大きな強みの 1 つは、そのリアクティブな実行モデルです。さまざまな町を動的に選択できるインタラクティブなウィジェットを作成しましょう。

### インタラクティブな町の選択 \{#interactive-town-selection\}

新しいセルで、さまざまな町を選択するためのドロップダウンを作成します。

```python
town_selector = mo.ui.dropdown(
    options=['LONDON', 'MANCHESTER', 'BIRMINGHAM', 'LEEDS', 'LIVERPOOL'],
    value='LONDON',
    label='Select a town:'
)
town_selector
```

別のセルで、町の選択に応じて反応するクエリを作成します。ドロップダウンを変更すると、このセルは自動的に再実行されます。

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

次に、町を変更すると自動的に更新されるチャートを作成します。
チャートを動的データフレームの上に移動し、ドロップダウンを含むセルの直下に表示されるようにします。

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

ドロップダウンから町を選択すると、グラフが動的に更新されるようになりました。

<Image size="md" img={image_7} alt="Marimo の動的チャート" />

### インタラクティブな箱ひげ図で価格分布を探索する \{#exploring-price-distributions\}

ロンドンの物件価格について、年ごとの分布を調べて、データをさらに深掘りしてみましょう。
箱ひげ図を使うと、中央値や四分位数、外れ値を確認でき、単なる平均価格よりもはるかに深い理解が得られます。
まず、異なる年をインタラクティブに切り替えて探索できるように、年を選択するスライダーを作成します。

新しいセルに、次のコードを追加します。

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

では、選択した年の各物件の価格をクエリしてみましょう。
ここでは集計は行わない点に注意してください。分布を作成するために、すべての個々のトランザクションが必要です。

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
セルの右上にあるオプションボタンをクリックすると、
コードを非表示にできます。
スライダーを動かすと、Marimo のリアクティブ実行機能によりプロットが自動的に更新されます。

<Image size="md" img={image_8} alt="Marimo の動的なチャート"/>
```

## まとめ {#summary}

このガイドでは、chDB を使用して Marimo ノートブックから ClickHouse Cloud 上のデータを探索する方法を説明しました。
UK Property Price データセットを用いて、`remoteSecure()` 関数でリモートの ClickHouse Cloud データに対してクエリを実行し、その結果を直接 Pandas の DataFrame に変換して分析および可視化する手順を示しました。
chDB と Marimo のリアクティブな実行モデルにより、データサイエンティストは、インタラクティブなウィジェットや依存関係の自動トラッキングといった利点を活用しながら、Pandas や Plotly などのなじみのある Python ツールと組み合わせて ClickHouse の強力な SQL 機能を利用でき、探索的分析をより効率的かつ再現性の高いものにできます。
