---
sidebar_label: 'ローカルファイルの取り込み'
sidebar_position: 2
title: 'ローカルファイルの取り込み'
slug: /integrations/data-ingestion/insert-local-files
description: 'ローカルファイルの取り込みについて学ぶ'
show_related_blogs: true
doc_type: 'guide'
keywords: ['insert local files ClickHouse', 'ClickHouse local file import', 'clickhouse-client file upload']
---

# ローカルファイルの挿入

`clickhouse-client` を使用して、ローカルファイルを ClickHouse サービスにストリーミングできます。これにより、多数の強力で便利な ClickHouse 関数を使ってデータを前処理できます。例を見てみましょう。

1. `comments.tsv` という名前の TSV ファイルがあり、その中にいくつかの Hacker News のコメントが含まれており、先頭行にはカラム名が含まれているとします。データを挿入する際には、[input format](/interfaces/formats) を指定する必要があり、この場合は `TabSeparatedWithNames` です。

```text
id      type    author  timestamp       comment children
19464423        comment adrianmonk      2019-03-22 16:58:19     "そもそもこれはリンゴとオレンジを比較するようなものです。刑務所の収容者には、セキュリティに関連する費用が発生します。囚人の行動を管理し(喧嘩を防ぐなど)、脱走を防ぐためには、職員、施設、設備などが必要です。この2つは異なる目的を持っているため、当然コストも異なります。<p>これは、冷蔵庫が電子レンジより高価だと言っているようなものです。異なる機能を持つため、比較しても意味がありません。"   []
19464461        comment sneakernets     2019-03-22 17:01:10     "科学的根拠が非常に確固としているため、この時点では議論の余地がないからです。<p>しかし、反ワクチン派に対しては、手に持っている赤いリンゴが赤いと伝えても、彼らはそれが緑だと主張するようなものです。このような人々と「是非」について議論することはできません。" [19464582]
19465288        comment derefr  2019-03-22 18:15:21     "ここで話しているのは、バックエンドデプロイメントと運用の専門用語としての「website」と「webapp」であり、一般的な用法ではありません。言葉は分野によって<i>異なる</i>正確な専門的意味を持つことがあります。運用担当者が線引きをする場所はここです。web<i>site</i>とは、例えばS3バケットにデプロイでき、他に保守すべき依存関係なしに完全に機能するものです。<i>webapp</i>とは、セットアップして保守する必要がある依存関係を<i>持つ</i>もの、例えばデータベース層などです。<p>しかし、それを無視しても、私は「web」という接頭辞のためにこのように用語を定義しています。webappは「ウェブ上のアプリ」ではなく、「ウェブによって駆動されるアプリ」です。完全にオフラインのJavaScript SPAで、単にウェブ<i>経由で提供される</i>だけのものは、web-app<i>ではありません</i>。それは単にブラウザで実行されるプログラムであり、FlashやActiveXやJavaアプレットがブラウザで実行されるプログラムであるのと同じです。(Flashゲームは「ウェブゲーム」でしょうか?通常は<i>ブラウザゲーム</i>と見なされますが、それは同じことではありません。)<p>{Flash、ActiveX、Java}アプレットが何であるかを表す用語は既にあります。アプリです。オフラインのJavaScript SPAも単なるアプリです。「web」という接頭辞を追加する必要はありません。ここでは意味がありません。これらのいずれの場合でも、まったく同じプログラムを取り出して、ドメインフロントのS3バケットではなくElectronラッパーに入れた場合、それはどのような意味でも「ウェブアプリ」ではないことは明らかです。あなたのSPAは単に「ブラウザDOMをグラフィックツールキットとして使用するJavaScript<i>アプリ</i>」になります。まあ、Electronラッパーに入れる前も同じことが言えます。<p>したがって、「web app」には「app」を超えた特定の意味があります。何か追加のものが必要です。その追加のものとは、バックエンドであり、ブラウザがアプリのロジックによって駆動され、<i>ウェブ経由で</i>対話するものです。それがアプリを「ウェブアプリ」にするものです。(この定義は、サーバーレンダリングされた動的HTMLと、クライアントレンダリングされたJavaScript SPAアプリの両方を意図的に包含しています。フロントエンド<i>アプリ</i>は必要ありません。何かが対話する<i>ウェブバックエンド</i>があればよいのです。その何かは、リンクをクリックしたりフォームを送信したりすることで直接ブラウザである場合もあれば、AJAXを使用するJavaScriptフロントエンドである場合もあります。)<p>「web site」は、「web app」から「app」部分を除いたものです。上記の定義で「app」が何であり、「web app」が何であるかが明確であれば、一方から他方を引いて「web not-app」の定義を導き出すことができます。それがウェブサイトです。ウェブバックエンドによって駆動されるが、アプリのようなことは何もしないものです。「アプリのようなこと」が基本的に「状態の保存」であると決めれば、「site」は永続的な状態を持たない「app」です。<p>そして、ここでの「web」の定義はバックエンドに関するものなので、「web app」と「web site」(web not-app)の違いは、おそらくバックエンドの特性によって定義されます。つまり、ウェブバックエンドが状態を保存する能力についての違いです。したがって、「web site」は、バックエンドがアプリのようなことを何もしない、つまり状態を保存しない「web app」です。"       []
19465534        comment bduerst 2019-03-22 18:36:40     "Appleも含まれます: <a href=""https:&#x2F;&#x2F;www.theguardian.com&#x2F;commentisfree&#x2F;2018&#x2F;mar&#x2F;04&#x2F;apple-users-icloud-services-personal-data-china-cybersecurity-law-privacy"" rel=""nofollow"">https:&#x2F;&#x2F;www.theguardian.com&#x2F;commentisfree&#x2F;2018&#x2F;mar&#x2F;04&#x2F;apple-...</a>"        []
19466269        comment CalChris        2019-03-22 19:55:13     "&gt; 同じA12 CPUを搭載しており、<i>system-on-a-chip</i>上に3 GBのRAMがあります<p>実際には<i>package-on-package</i>です。LPDDR4X DRAMは、A12 Bionicの背面に接着(正確にはリフローはんだ付け)されています。<p><a href=""https:&#x2F;&#x2F;www.techinsights.com&#x2F;about-techinsights&#x2F;overview&#x2F;blog&#x2F;apple-iphone-xs-teardown&#x2F;"" rel=""nofollow"">https:&#x2F;&#x2F;www.techinsights.com&#x2F;about-techinsights&#x2F;overview&#x2F;blo...</a><p><a href=""https:&#x2F;&#x2F;en.wikipedia.org&#x2F;wiki&#x2F;Package_on_package"" rel=""nofollow"">https:&#x2F;&#x2F;en.wikipedia.org&#x2F;wiki&#x2F;Package_on_package</a>"       [19468341]
19466980        comment onetimemanytime 2019-03-22 21:07:25     "&gt;&gt;<i>ここでの不合理な点は、モーターホームが置かれている土地を使ってスタジオを建てることができないということです。</i><p>リンゴとオレンジの比較です。スタジオを建設する許可は、その建物をほぼ永久に合法化します。モーターホームは、新しい法律によって、または既存の法律を施行するだけで追い出すことができます。"      []
19467048        comment karambahh       2019-03-22 21:15:41     "ここでは全く異なるものを比較していると思います。<p>駐車スペースを別の用途(家族向けの住居や動物保護施設の建設など)に転用する場合、車から何かを奪っているわけではありません。車は高価で大きな金属の塊であり、感覚を持つものではないのです。<p>次に、車の所有者から好きな場所に車を駐車できる利便性を奪っていると言うかもしれません。人間が頭上に屋根を持てるようにするために、車の所有者からこの利便性を奪うことは全く問題ないと考えています。(直接の経験から言えば、市が現在住宅を建設しており近隣の駐車スペースが制限されているため、ほんの数分前に自宅から1km離れた場所に車を駐車しなければなりませんでした)<p>そして、人間が苦しんでいるのに動物を助けることを恥じるべきだと主張する人もいるかもしれません。それは「移民をこれ以上受け入れることはできない、まず『自国の』ホームレスの人々の面倒を見なければならない」という考え方と全く同じです。<p>これは誤った二分法です。西洋社会の不平等はますます拡大しています。私が自分の役割を果たそうとすることは取るに足りないものです。人間や動物の支援活動に寄付することは、私たちが暮らす不平等の山に対してわずかな凹みをつけるに過ぎません。しかし、私たち全員が集まれば、寄付し、投票し、そして私たちが生きる世界について常に目を開いていることで、違いを生み出すことができるのです...<p>最後に、完全に個人的な見解ですが、極めて貧しい人々が動物や人間に連帯を示すために尽力する姿を何度も目撃してきました。また、極めて裕福な個人が、貧しい人々がそこにいるだけで自分たちに不便をかけていると不満を言う姿も数多く目撃してきました。その富は、彼らの先祖がまさにその貧しい人々を搾取した直接的な結果だったのです。"      [19467512]
```

2. Hacker News データ用のテーブルを作成しましょう：

```sql
CREATE TABLE hackernews (
    id UInt32,
    type String,
    author String,
    timestamp DateTime,
    comment String,
    children Array(UInt32),
    tokens Array(String)
)
ENGINE = MergeTree
ORDER BY toYYYYMMDD(timestamp)
```

3. `author` カラムを小文字に変換します。これは [`lower` 関数](/sql-reference/functions/string-functions#lower) を使えば簡単に行えます。また、`comment` 文字列をトークンに分割し、その結果を `tokens` カラムに格納します。これは [`extractAll` 関数](/sql-reference/functions/string-search-functions#extractAll) を使って実現できます。これらすべてを 1 つの `clickhouse-client` コマンドで実行します。`comments.tsv` ファイルが `<` 演算子を使って `clickhouse-client` にパイプされていることに注目してください。

```bash
clickhouse-client \
    --host avw5r4qs3y.us-east-2.aws.clickhouse.cloud \
    --secure \
    --port 9440 \
    --password Myp@ssw0rd \
    --query "
    INSERT INTO hackernews
    SELECT
        id,
                type,
                lower(author),
                timestamp,
                comment,
                children,
                extractAll(comment, '\\w+') as tokens
    FROM input('id UInt32, type String, author String, timestamp DateTime, comment String, children Array(UInt32)')
    FORMAT TabSeparatedWithNames
" < comments.tsv
```

:::note
`input` 関数は、`hackernews` テーブルにデータを挿入する際に、その場でデータを変換できるため、ここで特に有用です。`input` の引数には、入力される生データのフォーマットを指定します。これは他の多くのテーブル関数でも同様で（入力データのスキーマを指定します）、よく目にするパターンです。
:::

4. 以上です。データは ClickHouse にロードされました。

```sql
SELECT *
FROM hackernews
LIMIT 7
```

結果は以下のとおりです。


```response
│  488 │ comment │ mynameishere │ 2007-02-22 14:48:18 │ "It's too bad. Javascript-in-the-browser and Ajax are both nasty hacks that force programmers to do all sorts of shameful things. And the result is--wanky html tricks. Java, for its faults, is fairly clean when run in the applet environment. It has every superiority over JITBAJAX, except for install issues and a chunky load process. Yahoo games seems like just about the only applet success story. Of course, back in the day, non-trivial Applets tended to be too large for the dial-up accounts people had. At least that is changed." │ [454927] │ ['It','s','too','bad','Javascript','in','the','browser','and','Ajax','are','both','nasty','hacks','that','force','programmers','to','do','all','sorts','of','shameful','things','And','the','result','is','wanky','html','tricks','Java','for','its','faults','is','fairly','clean','when','run','in','the','applet','environment','It','has','every','superiority','over','JITBAJAX','except','for','install','issues','and','a','chunky','load','process','Yahoo','games','seems','like','just','about','the','only','applet','success','story','Of','course','back','in','the','day','non','trivial','Applets','tended','to','be','too','large','for','the','dial','up','accounts','people','had','At','least','that','is','changed'] │
│  575 │ comment │ leoc         │ 2007-02-23 00:09:49 │ "I can't find the reference now, but I *think* I've just read something suggesting that the install process for an Apollo applet will involve an &#34;install-this-application?&#34; confirmation dialog followed by a download of 30 seconds or so. If so then Apollo's less promising than I hoped. That kind of install may be low-friction by desktop-app standards but it doesn't compare to the ease of starting a browser-based AJAX or Flash application. (Consider how easy it is to use maps.google.com for the first time.)<p>Surely it will at least be that Apollo applications will run untrusted by default, and that an already-installed app will start automatically whenever you take your browser to the URL you downloaded it from?" │ [455071] │ ['I','can','t','find','the','reference','now','but','I','think','I','ve','just','read','something','suggesting','that','the','install','process','for','an','Apollo','applet','will','involve','an','34','install','this','application','34','confirmation','dialog','followed','by','a','download','of','30','seconds','or','so','If','so','then','Apollo','s','less','promising','than','I','hoped','That','kind','of','install','may','be','low','friction','by','desktop','app','standards','but','it','doesn','t','compare','to','the','ease','of','starting','a','browser','based','AJAX','or','Flash','application','Consider','how','easy','it','is','to','use','maps','google','com','for','the','first','time','p','Surely','it','will','at','least','be','that','Apollo','applications','will','run','untrusted','by','default','and','that','an','already','installed','app','will','start','automatically','whenever','you','take','your','browser','to','the','URL','you','downloaded','it','from'] │
│ 3110 │ comment │ davidw       │ 2007-03-09 09:19:58 │ "I'm very curious about this tsumobi thing, as it's basically exactly what Hecl is ( http://www.hecl.org ).  I'd sort of abbandoned it as an idea for making any money with directly, though, figuring the advantage was just to be able to develop applications a lot faster.  I was able to prototype ShopList ( http://shoplist.dedasys.com ) in a few minutes with it, for example.<p>Edit: BTW, I'd certainly be interested in chatting with the Tsumobi folks.  It's a good idea - perhaps there are elements in common that can be reused from/added to Hecl, which is open source under a very liberal license, meaning you can take it and include it even in 'commercial' apps.<p>I really think that the 'common' bits in a space like that have to be either free or open source (think about browsers, html, JavaScript, java applets, etc...), and that that's not where the money is." │ [3147]   │ ['I','m','very','curious','about','this','tsumobi','thing','as','it','s','basically','exactly','what','Hecl','is','http','www','hecl','org','I','d','sort','of','abbandoned','it','as','an','idea','for','making','any','money','with','directly','though','figuring','the','advantage','was','just','to','be','able','to','develop','applications','a','lot','faster','I','was','able','to','prototype','ShopList','http','shoplist','dedasys','com','in','a','few','minutes','with','it','for','example','p','Edit','BTW','I','d','certainly','be','interested','in','chatting','with','the','Tsumobi','folks','It','s','a','good','idea','perhaps','there','are','elements','in','common','that','can','be','reused','from','added','to','Hecl','which','is','open','source','under','a','very','liberal','license','meaning','you','can','take','it','and','include','it','even','in','commercial','apps','p','I','really','think','that','the','common','bits','in','a','space','like','that','have','to','be','either','free','or','open','source','think','about','browsers','html','javascript','java','applets','etc','and','that','that','s','not','where','the','money','is'] │
│ 4016 │ comment │ mynameishere │ 2007-03-13 22:56:53 │ "http://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=2853515&CatId=2511<p>Versus<p>http://store.apple.com/1-800-MY-APPLE/WebObjects/AppleStore?family=MacBookPro<p>These are comparable systems, but the Apple has, as I said, roughly an 800 dollar premium. Actually, the cheapest macbook pro costs the same as the high-end Toshiba. If you make good money, it's not a big deal. But when the girl in the coffeehouse asks me what kind of computer she should get to go along with her minimum wage, I'm basically scum to recommend an Apple." │ []       │ ['http','www','tigerdirect','com','applications','SearchTools','item','details','asp','EdpNo','2853515','CatId','2511','p','Versus','p','http','store','apple','com','1','800','MY','APPLE','WebObjects','AppleStore','family','MacBookPro','p','These','are','comparable','systems','but','the','Apple','has','as','I','said','roughly','an','800','dollar','premium','Actually','the','cheapest','macbook','pro','costs','the','same','as','the','high','end','Toshiba','If','you','make','good','money','it','s','not','a','big','deal','But','when','the','girl','in','the','coffeehouse','asks','me','what','kind','of','computer','she','should','get','to','go','along','with','her','minimum','wage','I','m','basically','scum','to','recommend','an','Apple'] │
│ 4568 │ comment │ jwecker      │ 2007-03-16 13:08:04 │ I know the feeling.  The same feeling I had back when people were still writing java applets.  Maybe a normal user doesn't feel it- maybe it's the programmer in us knowing that there's a big layer running between me and the browser...                 │ []       │ ['I','know','the','feeling','The','same','feeling','I','had','back','when','people','were','still','writing','java','applets','Maybe','a','normal','user','doesn','t','feel','it','maybe','it','s','the','programmer','in','us','knowing','that','there','s','a','big','layer','running','between','me','and','the','browser'] │
│ 4900 │ comment │ lupin_sansei │ 2007-03-19 00:26:30 │ "The essence of Ajax is getting Javascript to communicate with the server without reloading the page. Although XmlHttpRequest is most convenient, there were other methods of doing this before XmlHttpRequest such as <p>- loading a 1 pixel image and sending data in the image's cookie<p>- loading server data through a tiny frame which contained XML or javascipt data<p>- Using a java applet to fetch the data on behalf of javascript" │ []       │ ['The','essence','of','Ajax','is','getting','Javascript','to','communicate','with','the','server','without','reloading','the','page','Although','XmlHttpRequest','is','most','convenient','there','were','other','methods','of','doing','this','before','XmlHttpRequest','such','as','p','loading','a','1','pixel','image','and','sending','data','in','the','image','s','cookie','p','loading','server','data','through','a','tiny','frame','which','contained','XML','or','javascipt','data','p','Using','a','java','applet','to','fetch','the','data','on','behalf','of','javascript'] │
│ 5102 │ comment │ staunch      │ 2007-03-20 02:42:47 │ "Well this is exactly the kind of thing that isn't very obvious. It sounds like once you're wealthy there's a new set of rules you have to live by. It's a shame everyone has had to re-learn these things for themselves because a few bad apples can control their jealousy.<p>Very good to hear it's somewhere in your essay queue though. I'll try not to get rich before you write it, so I have some idea of what to expect :-)" │ []       │ ['Well','this','is','exactly','the','kind','of','thing','that','isn','t','very','obvious','It','sounds','like','once','you','re','wealthy','there','s','a','new','set','of','rules','you','have','to','live','by','It','s','a','shame','everyone','has','had','to','re','learn','these','things','for','themselves','because','a','few','bad','apples','can','control','their','jealousy','p','Very','good','to','hear','it','s','somewhere','in','your','essay','queue','though','I','ll','try','not','to','get','rich','before','you','write','it','so','I','have','some','idea','of','what','to','expect'] │
```

5. 別の方法として、`cat` のようなツールを使ってファイルを `clickhouse-client` にストリーミングすることもできます。例えば、次のコマンドは `<` 演算子を使用する場合と同じ結果になります。

```bash
cat comments.tsv | clickhouse-client \
    --host avw5r4qs3y.us-east-2.aws.clickhouse.cloud \
    --secure \
    --port 9440 \
    --password Myp@ssw0rd \
    --query "
    INSERT INTO hackernews
    SELECT
        id,
                type,
                lower(author),
                timestamp,
                comment,
                children,
                extractAll(comment, '\\w+') as tokens
    FROM input('id UInt32, type String, author String, timestamp DateTime, comment String, children Array(UInt32)')
    FORMAT TabSeparatedWithNames
"
```

`clickhouse-client` をローカルのオペレーティングシステムにインストールする方法の詳細については、[`clickhouse-client` のドキュメントページ](/interfaces/cli) を参照してください。
