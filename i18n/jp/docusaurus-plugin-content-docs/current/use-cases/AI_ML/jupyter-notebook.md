---
'slug': '/use-cases/AI/jupyter-notebook'
'sidebar_label': 'JupyterノートブックでchDBを使ってデータを探索する'
'title': 'JupyterノートブックでchDBを使ってデータを探索する'
'description': 'このガイドでは、JupyterノートブックでClickHouse Cloudまたはローカルファイルからデータを探索するためにchDBを設定し、使用する方法を説明します。'
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


# Jupyter ノートブックと chDB でデータを探る

このガイドでは、[chDB](/chdb) を使用して、Jupyter ノートブック内で ClickHouse Cloud データセットを探る方法を学びます。chDB は ClickHouse によって強化された高速インプロセス SQL OLAP エンジンです。

**前提条件**:
- 仮想環境
- 動作する ClickHouse Cloud サービスとあなたの [接続詳細](/cloud/guides/sql-console/gather-connection-details)

**学べること**:
- Jupyter ノートブックから chDB を使用して ClickHouse Cloud に接続する方法
- リモートデータセットをクエリし、結果を Pandas DataFrame に変換する方法
- 分析のためにクラウドデータとローカルの CSV ファイルを組み合わせる方法
- matplotlib を使ってデータを視覚化する方法

私たちは ClickHouse Cloud でスタートアップデータセットの一つとして提供されているUKの不動産価格データセットを使用します。これは、1995年から2024年まで英国で住宅が売られた価格に関するデータが含まれています。

## セットアップ {#setup}

このデータセットを既存の ClickHouse Cloud サービスに追加するには、アカウント情報を使って [console.clickhouse.cloud](https://console.clickhouse.cloud/) にログインします。

左側のメニューで `データソース` をクリックします。次に `事前定義されたサンプルデータ` をクリックします:

<Image size="md" img={image_1} alt="例データセットの追加"/>

UKの不動産価格データ（4GB）カードの `始める` を選択します: 

<Image size="md" img={image_2} alt="UKの支払額データセットを選択"/>

次に `データセットをインポート` をクリックします:

<Image size="md" img={image_3} alt="UKの支払額データセットをインポート"/>

ClickHouse は自動的に `default` データベース内に `pp_complete` テーブルを作成し、2892万行の価格ポイントデータでテーブルを埋めます。

資格情報の漏洩の可能性を減らすために、Cloud のユーザー名とパスワードをローカルマシンの環境変数として追加することをお勧めします。
ターミナルから次のコマンドを実行して、ユーザー名とパスワードを環境変数として追加します:

```bash
export CLICKHOUSE_USER=default
export CLICKHOUSE_PASSWORD=your_actual_password
```

:::note
上記の環境変数は、ターミナルセッションが続く限り持続します。
永続的に設定するには、シェルの設定ファイルに追加してください。
:::

仮想環境をアクティブにします。
仮想環境内から、次のコマンドを使用して Jupyter Notebook をインストールします:

```python
pip install notebook
```

次のコマンドを使って Jupyter Notebook を起動します:

```python
jupyter notebook
```

新しいブラウザウィンドウが `localhost:8888` で Jupyter インターフェースを開きます。
`ファイル` > `新規` > `ノートブック` をクリックして新しいノートブックを作成します。

<Image size="md" img={image_4} alt="新しいノートブックの作成"/>

カーネルを選択するように求められます。
利用可能な Python カーネルを選択し、この例では `ipykernel` を選択します:

<Image size="md" img={image_5} alt="カーネルの選択"/>

空のセルに次のコマンドを入力して、リモート ClickHouse Cloud インスタンスに接続するために使用する chDB をインストールします:

```python
pip install chdb
```

これで chDB をインポートし、すべてが正しく設定されているかを確認するために単純なクエリを実行します:

```python
import chdb

result = chdb.query("SELECT 'Hello, ClickHouse!' as message")
print(result)
```

## データの探索 {#exploring-the-data}

UKの支払額データが設定され、Jupyter ノートブック内で chDB が起動したので、データを探る準備が整いました。

ロンドンなどの特定の地域の価格が時間と共にどのように変化したかを確認したいとします。
ClickHouse の [`remoteSecure`](/sql-reference/table-functions/remote) 関数を使用すると、ClickHouse Cloud からデータを簡単に取得できます。
chDB に、Pandas データフレームとしてこのデータをプロセス内で返すよう指示できます - これはデータを扱うための便利で馴染み深い方法です。

次のクエリを記述して、ClickHouse Cloud サービスから UK の支払額データを取得し、`pandas.DataFrame` に変換します:

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

上記のスニペットで、`chdb.query(query, "DataFrame")` は指定されたクエリを実行し、結果を Pandas DataFrame としてターミナルに出力します。
クエリ内では、`remoteSecure` 関数を使用して ClickHouse Cloud に接続しています。
`remoteSecure` 関数は次のパラメーターを取ります：
- 接続文字列
- 使用するデータベースとテーブルの名前
- あなたのユーザー名
- あなたのパスワード

安全のためのベストプラクティスとして、ユーザー名とパスワードのパラメーターには、関数内で直接指定するのではなく、環境変数を使用することをお勧めします。希望すれば、直接指定することも可能ですが。

`remoteSecure` 関数は、リモート ClickHouse Cloud サービスに接続し、クエリを実行して結果を返します。
データのサイズに応じて、これには数秒かかる場合があります。
この場合、年間ごとの平均価格ポイントを返し、`town='LONDON'` でフィルタリングします。
結果は `df` という変数に DataFrame として保存されます。

`df.head` は返されたデータの最初の数行のみを表示します:

<Image size="md" img={image_6} alt="データフレームのプレビュー"/>

新しいセルで次のコマンドを実行して、カラムのタイプを確認します:

```python
df.dtypes
```

```response
year          uint16
avg_price    float64
dtype: object
```

ClickHouse では `date` が `Date` 型であるのに対し、結果のデータフレームでは `uint16` 型であることに注意してください。
chDB は DataFrame を返す際に最も適切な型を自動的に推測します。

データが馴染みのある形式で利用できるようになったので、ロンドンの不動産価格が時間と共にどのように変化したかを探ってみましょう。

新しいセルで次のコマンドを実行して、matplotlib を使用してロンドンの時間対価格の簡単なチャートを構築します:

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

<Image size="md" img={image_7} alt="データフレームのプレビュー"/>

驚くべきことに、ロンドンの不動産価格は時間と共に大幅に増加しました。

別のデータサイエンティストが住宅関連の追加変数を含む .csv ファイルを送ってきており、ロンドンでの住宅販売数が時間と共にどのように変化したかに興味を持っています。
これらの数値を住宅価格と比較し、相関関係を発見できるか見てみましょう。

`file` テーブルエンジンを使用して、ローカルマシン上のファイルを直接読み取ることができます。
新しいセルで次のコマンドを実行して、ローカルの .csv ファイルから新しい DataFrame を作成します。

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
<summary>単一のステップで複数のソースから読み取る</summary>
単一のステップで複数のソースから読み取ることも可能です。以下のクエリを使用して `JOIN` を使用することができます:

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

<Image size="md" img={image_8} alt="データフレームのプレビュー"/>

2020年以降のデータが欠けていますが、1995年から2019年の間の2つのデータセットを互いにプロットすることができます。
新しいセルで次のコマンドを実行します:

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

<Image size="md" img={image_9} alt="リモートデータセットとローカルデータセットのプロット"/>

プロットされたデータから、販売数は1995年に約160,000から始まり、急激に増加し、1999年には約540,000に達しました。
その後、ボリュームは2000年代中頃に急激に減少し、2007-2008年の金融危機の際には大幅に落ち込み、約140,000にまで減少しました。
一方、価格は1995年の約£150,000から2005年には約£300,000にかけて、安定した一貫した成長を示しました。
2012年以降は成長が大幅に加速し、2019年までに約£400,000から£1,000,000を超えるまで急激に上昇しました。
売上量とは異なり、価格は2008年の危機による影響が最小限であり、上昇傾向を維持しました。驚きです！

## まとめ {#summary}

このガイドでは、chDB がどのように Jupyter ノートブックで ClickHouse Cloud をローカルデータソースと接続することでシームレスなデータ探索を可能にするかを示しました。
UK の不動産価格データセットを使用して、`remoteSecure()` 関数でリモート ClickHouse Cloud データをクエリし、`file()` テーブルエンジンでローカル CSV ファイルを読み取り、結果を直接 Pandas DataFrames に変換して分析と視覚化を行う方法を示しました。
chDB を通じて、データサイエンティストは ClickHouse の強力な SQL 機能を、Pandas や matplotlib などの馴染みのある Python ツールと組み合わせて活用でき、多様なデータソースを統合した包括的な分析を簡単に行うことができます。

多くのロンドンのデータサイエンティストが自分自身の家やアパートを手に入れることができないかもしれませんが、少なくとも実際の市場を分析することができるのです！
