---
slug: /use-cases/AI/jupyter-notebook
sidebar_label: 'Jupyter ノートブックと chDB を使ったデータ探索'
title: 'Jupyter ノートブックで chDB を使ったデータ探索'
description: 'このガイドでは、Jupyter ノートブックで ClickHouse Cloud またはローカルファイルのデータを探索するために、chDB をセットアップして利用する方法を説明します'
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


# Jupyter Notebook と chDB を使ってデータを探索する

このガイドでは、ClickHouse をベースとした高速なインプロセス SQL OLAP エンジンである [chDB](/chdb) を利用して、Jupyter Notebook 上で ClickHouse Cloud のデータセットを探索する方法を説明します。

**前提条件**:
- 仮想環境が用意されていること
- 稼働中の ClickHouse Cloud サービスと、その [接続情報](/cloud/guides/sql-console/gather-connection-details)

:::tip
まだ ClickHouse Cloud アカウントをお持ちでない場合は、[サインアップ](https://console.clickhouse.cloud/signUp?loc=docs-juypter-chdb) して
トライアルを開始し、$300 分の無料クレジットを取得できます。
:::

**このガイドで学べること:**
- chDB を使って Jupyter Notebook から ClickHouse Cloud に接続する方法
- リモートのデータセットに対してクエリを実行し、結果を Pandas DataFrame に変換する方法
- 分析のためにクラウド上のデータとローカルの CSV ファイルを組み合わせる方法
- matplotlib を使ってデータを可視化する方法

ここでは、ClickHouse Cloud 上でスターターデータセットの 1 つとして利用可能な UK Property Price データセットを使用します。
このデータセットには、1995 年から 2024 年までのイギリスにおける住宅の売却価格に関するデータが含まれています。



## セットアップ

既存の ClickHouse Cloud サービスにこのデータセットを追加するには、アカウント情報で [console.clickhouse.cloud](https://console.clickhouse.cloud/) にログインします。

左側のメニューから `Data sources` をクリックします。次に `Predefined sample data` をクリックします:

<Image size="md" img={image_1} alt="サンプルデータセットを追加" />

「UK property price paid data (4GB)」カードで `Get started` を選択します:

<Image size="md" img={image_2} alt="UK price paid データセットを選択" />

次に `Import dataset` をクリックします:

<Image size="md" img={image_3} alt="UK price paid データセットをインポート" />

ClickHouse は自動的に `default` データベース内に `pp_complete` テーブルを作成し、テーブルに 2,892 万行の価格情報データを投入します。

認証情報が漏洩するリスクを減らすために、Cloud のユーザー名とパスワードをローカルマシンの環境変数として追加することを推奨します。
ターミナルから次のコマンドを実行して、ユーザー名とパスワードを環境変数として追加します:

```bash
export CLICKHOUSE_USER=default
export CLICKHOUSE_PASSWORD=your_actual_password
```

:::note
上記の環境変数が有効なのは、ターミナルセッションの間だけです。
永続的に設定するには、シェルの設定ファイルに追加してください。
:::

次に、仮想環境を有効化します。
仮想環境内で、次のコマンドを使って Jupyter Notebook をインストールします。

```python
pip install notebook
```

次のコマンドを実行して Jupyter Notebook を起動します：

```python
Jupyter Notebook
```

新しいブラウザウィンドウが開き、`localhost:8888` 上で Jupyter インターフェイスが表示されているはずです。
新しい Notebook を作成するには、`File` &gt; `New` &gt; `Notebook` をクリックします。

<Image size="md" img={image_4} alt="新しいノートブックを作成" />

カーネルを選択するように求められます。
利用可能な任意の Python カーネルを選択します。この例では `ipykernel` を選択します:

<Image size="md" img={image_5} alt="カーネルを選択" />

空のセルに、次のコマンドを入力して chDB をインストールします。これはリモートの ClickHouse Cloud インスタンスへの接続に使用します:

```python
pip install chdb
```

これで chDB をインポートして簡単なクエリを実行し、すべてが正しく設定されていることを確認できます。

```python
import chdb

result = chdb.query("SELECT 'Hello, ClickHouse!' as message")
print(result)
```


## データの探索

UK price paid データセットを用意し、Jupyter Notebook 上で chDB が稼働している状態になったので、ここからデータの探索を始めていきます。

イギリスの特定エリア（たとえば首都ロンドン）について、時間の経過とともに価格がどのように変化してきたかを確認したいとします。
ClickHouse の [`remoteSecure`](/sql-reference/table-functions/remote) 関数を使うと、ClickHouse Cloud からデータを簡単に取得できます。
chDB に、このデータを処理内で Pandas のデータフレームとして返すよう指示できます。これは、データを扱ううえで便利で馴染みのある形式です。

次のクエリを記述して、ClickHouse Cloud サービスから UK price paid データを取得し、それを `pandas.DataFrame` に変換します。

```python
import os
from dotenv import load_dotenv
import chdb
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
```


# .env ファイルから環境変数を読み込む

load&#95;dotenv()

username = os.environ.get(&#39;CLICKHOUSE&#95;USER&#39;)
password = os.environ.get(&#39;CLICKHOUSE&#95;PASSWORD&#39;)

query = f&quot;&quot;&quot;
SELECT
toYear(date) AS year,
avg(price) AS avg&#95;price
FROM remoteSecure(
&#39;****.europe-west4.gcp.clickhouse.cloud&#39;,
default.pp&#95;complete,
&#39;{username}&#39;,
&#39;{password}&#39;
)
WHERE town = &#39;LONDON&#39;
GROUP BY toYear(date)
ORDER BY year;
&quot;&quot;&quot;

df = chdb.query(query, &quot;DataFrame&quot;)
df.head()

````

上記のスニペットでは、`chdb.query(query, "DataFrame")` が指定されたクエリを実行し、結果をPandas DataFrameとしてターミナルに出力します。
このクエリでは、`remoteSecure` 関数を使用してClickHouse Cloudに接続します。
`remoteSecure` 関数は以下のパラメータを受け取ります:
- 接続文字列
- 使用するデータベースとテーブルの名前
- ユーザー名
- パスワード

セキュリティのベストプラクティスとして、ユーザー名とパスワードのパラメータは関数内に直接指定するのではなく、環境変数を使用してください。直接指定することも可能ですが、環境変数の使用を推奨します。

`remoteSecure` 関数はリモートのClickHouse Cloudサービスに接続し、クエリを実行して結果を返します。
データのサイズによっては、数秒かかる場合があります。
この例では、年ごとの平均価格を返し、`town='LONDON'` でフィルタリングします。
結果は `df` という変数にDataFrameとして格納されます。

`df.head` は返されたデータの最初の数行のみを表示します:

<Image size="md" img={image_6} alt="dataframe preview"/>

新しいセルで以下のコマンドを実行して、列の型を確認してください:

```python
df.dtypes
````

```response
year          uint16
avg_price    float64
dtype: object
```

`date` は ClickHouse では型 `Date` ですが、生成されたデータフレームでは型 `uint16` になっていることに注意してください。
chDB は、DataFrame を返す際に、最も適切な型を自動的に推論します。

データがなじみのある形式で利用できるようになったので、ロンドンにおける不動産価格が時間の経過とともにどのように推移してきたかを確認してみましょう。

新しいセルで次のコマンドを実行し、matplotlib を使ってロンドンの価格の時間推移を示す簡単なチャートを作成します。

```python
plt.figure(figsize=(12, 6))
plt.plot(df['year'], df['avg_price'], marker='o')
plt.xlabel('年')
plt.ylabel('価格（£）')
plt.title('ロンドン不動産価格の推移')
```


# 混雑を避けるために隔年で表示する

years&#95;to&#95;show = df[&#39;year&#39;][::2]  # 2年おき
plt.xticks(years&#95;to&#95;show, rotation=45)

plt.grid(True, alpha=0.3)
plt.tight&#95;layout()
plt.show()

````

<Image size="md" img={image_7} alt="dataframe preview"/>

当然のことながら、ロンドンの不動産価格は時間の経過とともに大幅に上昇しています。

同僚のデータサイエンティストから、住宅関連の追加変数を含む.csvファイルが送られてきました。ロンドンで販売された住宅数が時間の経過とともにどのように変化したかを知りたいとのことです。
これらのいくつかを住宅価格に対してプロットし、何らかの相関関係を発見できるか見てみましょう。

`file`テーブルエンジンを使用して、ローカルマシン上のファイルを直接読み取ることができます。
新しいセルで、次のコマンドを実行してローカルの.csvファイルから新しいDataFrameを作成します。

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
````

<details>
  <summary>1回のクエリで複数のソースから読み取る</summary>
  1回のクエリで複数のソースから読み取ることも可能です。以下のように `JOIN` を使ったクエリを実行します:

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

<Image size="md" img={image_8} alt="データフレームのプレビュー" />

2020年以降のデータは欠けていますが、1995年から2019年までの年については、2つのデータセットを相互に比較してプロットできます。
新しいセルで次のコマンドを実行してください。


```python
# 2つのy軸を持つ図を作成
fig, ax1 = plt.subplots(figsize=(14, 8))
```


# 左側の y 軸に販売戸数をプロットする
color = 'tab:blue'
ax1.set_xlabel('Year')
ax1.set_ylabel('Houses Sold', color=color)
ax1.plot(df_2['year'], df_2['houses_sold'], marker='o', color=color, label='Houses Sold', linewidth=2)
ax1.tick_params(axis='y', labelcolor=color)
ax1.grid(True, alpha=0.3)



# 価格データ用の第2 y 軸を作成する
ax2 = ax1.twinx()
color = 'tab:red'
ax2.set_ylabel('平均価格 (£)', color=color)



# 2019年までの価格データをプロット

ax2.plot(df[df['year'] <= 2019]['year'], df[df['year'] <= 2019]['avg_price'], marker='s', color=color, label='平均価格', linewidth=2)
ax2.tick_params(axis='y', labelcolor=color)


# 価格軸を通貨形式でフォーマットする

ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'£{x:,.0f}'))


# タイトルを設定し、2年ごとに年を表示
plt.title('London Housing Market: Sales Volume vs Prices Over Time', fontsize=14, pad=20)



# 両データセットで2019年以前の年のみを使用

all_years = sorted(list(set(df_2[df_2['year'] <= 2019]['year']).union(set(df[df['year'] <= 2019]['year']))))
years_to_show = all_years[::2] # Every 2nd year
ax1.set_xticks(years_to_show)
ax1.set_xticklabels(years_to_show, rotation=45)


# 凡例を追加

ax1.legend(loc=&#39;upper left&#39;)
ax2.legend(loc=&#39;upper right&#39;)

plt.tight&#95;layout()
plt.show()

```

<Image size="md" img={image_9} alt="リモートデータセットとローカルデータセットのプロット"/>

プロットされたデータから、販売件数は1995年に約16万件から始まり、急速に増加して1999年には約54万件でピークに達したことがわかります。
その後、2000年代半ばにかけて販売件数は急激に減少し、2007年から2008年の金融危機の際には大幅に落ち込み、約14万件まで低下しました。
一方、価格は1995年の約15万ポンドから2005年の約30万ポンドまで、着実かつ一貫した成長を示しました。
2012年以降、成長は大幅に加速し、約40万ポンドから2019年には100万ポンドを超えるまで急激に上昇しました。
販売件数とは異なり、価格は2008年の危機による影響をほとんど受けず、上昇傾向を維持しました。驚きです!
```


## まとめ {#summary}

このガイドでは、chDB を利用して ClickHouse Cloud とローカルのデータソースを接続し、Jupyter Notebook 上でシームレスにデータ探索を行う方法を示しました。
UK Property Price データセットを用いて、`remoteSecure()` 関数でリモートの ClickHouse Cloud データをクエリする方法、`file()` テーブルエンジンでローカルの CSV ファイルを読み取る方法、そして結果を直接 Pandas の DataFrame に変換して分析および可視化する方法を説明しました。
chDB を通じて、データサイエンティストは ClickHouse の強力な SQL 機能を、Pandas や matplotlib といった馴染みのある Python ツールと併用でき、複数のデータソースを容易に統合して包括的に分析できます。

多くのロンドン在住のデータサイエンティストは、当面は自分の家やアパートを購入できないかもしれませんが、少なくとも自分たちを締め出したその住宅市場を分析することはできます。
