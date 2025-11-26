---
sidebar_label: 'ローカルファイルのインポート'
sidebar_position: 2
title: 'ローカルファイルのインポート'
slug: /integrations/data-ingestion/insert-local-files
description: 'ローカルファイルのインポート方法を学ぶ'
show_related_blogs: true
doc_type: 'guide'
keywords: ['ローカルファイル インポート ClickHouse', 'ClickHouse ローカルファイル インポート', 'clickhouse-client ファイルアップロード']
---

# ローカルファイルの挿入

`clickhouse-client` を使用して、ローカルファイルを ClickHouse サービスにストリーミングできます。これにより、ClickHouse が備える数多くの強力かつ便利な関数を使ってデータを前処理できます。例を見てみましょう...

1. Hacker News のコメントが含まれている `comments.tsv` という名前の TSV ファイルがあり、ヘッダー行には列名が含まれているとします。データを挿入する際には、[input format](/interfaces/formats) を指定する必要があり、この場合は `TabSeparatedWithNames` を使用します。

```text
id      type    author  timestamp       comment children
19464423        comment adrianmonk      2019-03-22 16:58:19     "It&#x27;s an apples and oranges comparison in the first place. There are security expenses related to prison populations. You need staff, facilities, equipment, etc. to manage prisoners behavior (prevent fights, etc.) and keep them from escaping. The two things have a different mission, so of course they&#x27;re going to have different costs.<p>It&#x27;s like saying a refrigerator is more expensive than a microwave. It doesn&#x27;t mean anything because they do different things."   []
19464461        comment sneakernets     2019-03-22 17:01:10     "Because the science is so solid that it&#x27;s beating a dead horse at this point.<p>But with anti-vaxxers, It&#x27;s like telling someone the red apple you&#x27;re holding is red, yet they insist that it&#x27;s green. You can&#x27;t argue &quot;the merits&quot; with people like this." [19464582]
19465288        comment derefr  2019-03-22 18:15:21     "Because we&#x27;re talking about the backend-deployment+ops-jargon terms &quot;website&quot; and &quot;webapp&quot;, not their general usage. Words can have precise jargon meanings <i>which are different</i> in different disciplines. This is where ops people tend to draw the line: a web<i>site</i> is something you can deploy to e.g. an S3 bucket and it&#x27;ll be fully functional, with no other dependencies that you have to maintain for it. A <i>webapp</i> is something that <i>does</i> have such dependencies that you need to set up and maintain—e.g. a database layer.<p>But even ignoring that, I also define the terms this way because of the prefix &quot;web.&quot; A webapp isn&#x27;t &quot;an app on the web&quot;, but rather &quot;an app powered by the web.&quot; An entirely-offline JavaScript SPA that is just <i>served over</i> the web, <i>isn&#x27;t</i> a web-app. It&#x27;s just a program that runs in a browser, just like a Flash or ActiveX or Java applet is a program that runs in a browser. (Is a Flash game a &quot;web game&quot;? It&#x27;s usually considered a <i>browser game</i>, but that&#x27;s not the same thing.)<p>We already have a term for the thing that {Flash, ActiveX, Java} applets are: apps. Offline JavaScript SPAs are just apps too. We don&#x27;t need to add the prefix &quot;web&quot;; it&#x27;s meaningless here. In any of those cases, if you took the exact same program, and slammed it into an Electron wrapper instead of into a domain-fronted S3 bucket, it would clearly not be a &quot;web app&quot; in any sense. Your SPA would just be &quot;a JavaScript <i>app</i> that uses a browser DOM as its graphics toolkit.&quot; Well, that&#x27;s just as true before you put it in the Electron wrapper.<p>So &quot;web app&quot;, then, has a specific meaning, above and beyond &quot;app.&quot; You need something extra. That something extra is a backend, which your browser—driven by the app&#x27;s logic—interacts with <i>over the web</i>. That&#x27;s what makes an app &quot;a web app.&quot; (This definition intentionally encompasses both server-rendered dynamic HTML, and client-rendered JavaScript SPA apps. You don&#x27;t need a frontend <i>app</i>; you just need a <i>web backend</i> that something is interacting with. That something can be the browser directly, by clicking links and submitting forms; or it can be a JavaScript frontend, using AJAX.)<p>A &quot;web site&quot;, then, is a &quot;web app&quot; without the &quot;app&quot; part. If it&#x27;s clear in the above definition what an &quot;app&quot; is, and what a &quot;web app&quot; is, then you can subtract one from the other to derive a definition of a &quot;web not-app.&quot; That&#x27;s a website: something powered by a web backend, which does not do any app things. If we decide that &quot;app things&quot; are basically &quot;storing state&quot;, then a &quot;site&quot; is an &quot;app&quot; with no persistent state.<p>And since the definition of &quot;web&quot; here is about a backend, then the difference between a &quot;web app&quot; and a &quot;web site&quot; (a web not-app) is probably defined by the properties of the backend. So the difference about the ability of the web backend to store state. So a &quot;web site&quot; is a &quot;web app&quot; where the backend does no app things—i.e., stores no state."       []
19465534        comment bduerst 2019-03-22 18:36:40     "Apple included: <a href=""https:&#x2F;&#x2F;www.theguardian.com&#x2F;commentisfree&#x2F;2018&#x2F;mar&#x2F;04&#x2F;apple-users-icloud-services-personal-data-china-cybersecurity-law-privacy"" rel=""nofollow"">https:&#x2F;&#x2F;www.theguardian.com&#x2F;commentisfree&#x2F;2018&#x2F;mar&#x2F;04&#x2F;apple-...</a>"        []
19466269        comment CalChris        2019-03-22 19:55:13     "&gt; It has the same A12 CPU ... with 3 GB of RAM on the <i>system-on-a-chip</i><p>Actually that&#x27;s <i>package-on-package</i>. The LPDDR4X DRAM is glued (well, reflow soldered) to the back of the A12 Bionic.<p><a href=""https:&#x2F;&#x2F;www.techinsights.com&#x2F;about-techinsights&#x2F;overview&#x2F;blog&#x2F;apple-iphone-xs-teardown&#x2F;"" rel=""nofollow"">https:&#x2F;&#x2F;www.techinsights.com&#x2F;about-techinsights&#x2F;overview&#x2F;blo...</a><p><a href=""https:&#x2F;&#x2F;en.wikipedia.org&#x2F;wiki&#x2F;Package_on_package"" rel=""nofollow"">https:&#x2F;&#x2F;en.wikipedia.org&#x2F;wiki&#x2F;Package_on_package</a>"       [19468341]
19466980        comment onetimemanytime 2019-03-22 21:07:25     "&gt;&gt;<i>The insanity, here, is that you can&#x27;t take the land the motorhome is on and build a studio on it.</i><p>apple and oranges. The permit to built the studio makes that building legit, kinda forever. A motor home, they can chase out with a new law, or just by enforcing existing laws."      []
19467048        comment karambahh       2019-03-22 21:15:41     "ここでは、りんごとオレンジを比較しているようなものだと思います。<p>駐車スペースを別の用途（家族向けの住居や動物保護施設の建設など）に転用する場合、車から何かを奪っているわけではありません。車は高価で大きな金属の塊であり、感覚を持つものではないのです。<p>次に、車の所有者が好きな場所に車を駐車できる利便性を奪っていると言うかもしれません。人間が頭上に屋根を持てるようにするために、車の所有者からこの利便性を奪うことは、私にとって全く問題ありません。（直接の経験から言えば、市が現在住宅を建設しており、近くの駐車スペースが制限されているため、数分前に自宅から1km離れた場所に車を駐車しなければなりませんでした）<p>そして、人間が苦しんでいるのに動物を助けることを恥じるべきだと主張する人もいるかもしれません。それは「私たちは移民をこれ以上受け入れることはできない、まず『自国の』ホームレスの人々の面倒を見なければならない」という考え方とまったく同じです。<p>これは誤った二分法です。西洋社会の不平等はますます拡大しています。私が自分の役割を果たそうとすることは取るに足らないものです。人間や動物の支援活動に寄付することは、私たちが暮らしている不平等の山に対してわずかな凹みをつけるだけです。しかし、私たち全員が集まれば、寄付をし、投票をし、そして私たちが生きている世界について目を開いておくことで、違いを生み出すことができるのです。<p>最後に、完全に個人的な見解ですが、私は極めて貧しい人々が動物や人間に連帯を示すために尽力する姿を何度も目撃してきました。また、極めて裕福な個人が、貧しい人々がそこにいるだけで自分たちに不便をかけていると不満を言う姿も数多く目撃してきました。その富は、彼らの祖先がまさにその貧しい人々を搾取した直接的な結果だったのです。"      [19467512]
```

2. Hacker News のデータ用のテーブルを作成します。

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

3. `author` カラムを小文字に変換したいので、これは [`lower` 関数](/sql-reference/functions/string-functions#lower) で簡単に行えます。また、`comment` 文字列をトークンに分割し、その結果を `tokens` カラムに保存したいので、これは [`extractAll` 関数](/sql-reference/functions/string-search-functions#extractAll) を使って行えます。これらすべてを 1 回の `clickhouse-client` コマンドでまとめて実行できます。`comments.tsv` ファイルが `<` 演算子を使って `clickhouse-client` にリダイレクトされている点に注目してください：

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
`input` 関数は、データが `hackernews` テーブルに挿入されるタイミングで変換できるため、ここでは便利です。`input` への引数は、受信する生データのフォーマットであり、他の多くのテーブル関数でも同様に登場します（受信データのスキーマを指定する箇所です）。
:::

4. 以上です！データは ClickHouse に取り込まれました。

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
│ 4900 │ comment │ lupin_sansei │ 2007-03-19 00:26:30 │ "Ajaxの本質は、ページをリロードせずにJavaScriptとサーバーを通信させることです。XmlHttpRequestが最も便利ですが、XmlHttpRequest以前にも以下のような方法がありました<p>- 1ピクセルの画像を読み込み、その画像のCookieでデータを送信する<p>- XMLまたはJavaScriptデータを含む小さなフレームを通じてサーバーデータを読み込む<p>- JavaScriptの代わりにJavaアプレットを使用してデータを取得する" │ []       │ ['The','essence','of','Ajax','is','getting','Javascript','to','communicate','with','the','server','without','reloading','the','page','Although','XmlHttpRequest','is','most','convenient','there','were','other','methods','of','doing','this','before','XmlHttpRequest','such','as','p','loading','a','1','pixel','image','and','sending','data','in','the','image','s','cookie','p','loading','server','data','through','a','tiny','frame','which','contained','XML','or','javascipt','data','p','Using','a','java','applet','to','fetch','the','data','on','behalf','of','javascript'] │
│ 5102 │ comment │ staunch      │ 2007-03-20 02:42:47 │ "これはまさにあまり明白ではない類のことです。裕福になると、従わなければならない新しいルールセットがあるようですね。一部の心の狭い人々が嫉妬を抑えられないために、誰もがこれらのことを自分で学び直さなければならなかったのは残念です。<p>あなたのエッセイ執筆予定に入っていると聞いて嬉しいです。あなたが書く前に私が裕福にならないよう気をつけます。そうすれば何を期待すべきか少しは分かるでしょうから :-)" │ []       │ ['Well','this','is','exactly','the','kind','of','thing','that','isn','t','very','obvious','It','sounds','like','once','you','re','wealthy','there','s','a','new','set','of','rules','you','have','to','live','by','It','s','a','shame','everyone','has','had','to','re','learn','these','things','for','themselves','because','a','few','bad','apples','can','control','their','jealousy','p','Very','good','to','hear','it','s','somewhere','in','your','essay','queue','though','I','ll','try','not','to','get','rich','before','you','write','it','so','I','have','some','idea','of','what','to','expect'] │
```

5. 別の方法として、`cat` のようなツールを使ってファイルを `clickhouse-client` にストリームすることもできます。例えば、次のコマンドは `<` 演算子を使う場合と同じ結果になります。

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

ローカル環境のオペレーティングシステムに `clickhouse-client` をインストールする方法の詳細については、[`clickhouse-client` に関するドキュメントページ](/interfaces/cli) を参照してください。
