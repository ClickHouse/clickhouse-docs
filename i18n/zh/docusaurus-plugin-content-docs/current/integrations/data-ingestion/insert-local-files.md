---
sidebar_label: '插入本地文件'
sidebar_position: 2
title: '插入本地文件'
slug: /integrations/data-ingestion/insert-local-files
description: '了解如何插入本地文件'
show_related_blogs: true
doc_type: 'guide'
keywords: ['insert local files ClickHouse', 'ClickHouse local file import', 'clickhouse-client file upload']
---

# 插入本地文件

你可以使用 `clickhouse-client` 以流式方式将本地文件导入到你的 ClickHouse 服务中。这样你就可以利用众多强大且便捷的 ClickHouse 函数对数据进行预处理。下面来看一个示例……

1. 假设我们有一个名为 `comments.tsv` 的 TSV 文件，其中包含一些 Hacker News 评论，并且首行表头包含列名。插入数据时，你需要指定一种[输入格式](/interfaces/formats)，在本例中为 `TabSeparatedWithNames`：

```text
id      type    author  timestamp       comment children
19464423        comment adrianmonk      2019-03-22 16:58:19     “从一开始这就是在比较风马牛不相及的两样东西。监狱关押人员是有安全成本的。你需要员工、设施、设备等来管理囚犯的行为（防止打架等），并防止他们越狱。两者承担的使命不同，所以成本当然也会不同。<p>这就像说冰箱比微波炉贵。这句话本身没有意义，因为它们负责的事情完全不同。”   []
19464461        comment sneakernets     2019-03-22 17:01:10     “因为相关科学已经坚如磐石，再讨论下去纯属徒劳。<p>但对于反疫苗的人，这就像你告诉某人你手里这颗红苹果是红的，而他们却坚持说是绿的。对于这样的人，你没法就“优劣”展开论证。” [19464582]
19465288        comment derefr  2019-03-22 18:15:21     “因为我们在讨论的是后端部署与运维行话里的“website”和“webapp”，而不是它们在日常用法中的含义。词语在不同学科中可能有精确的行话意义，<i>而且彼此不同</i>。运维人员往往会在这里划清界限：一个 web<i>site</i> 是可以部署到例如 S3 bucket 且能完全工作的东西，你无需为它维护其他依赖。一个 <i>webapp</i> 则是<i>确实</i>存在这类依赖，需要你去搭建和维护的——例如数据库层。<p>但即便不考虑这些，我也因“web”这个前缀而这样定义。webapp 不是“在 web 上的应用”，而是“由 web 提供支撑的应用”。一个完全离线、只是通过 web <i>提供</i>的 JavaScript SPA，<i>并不是</i> web-app。它只是一个在浏览器里运行的程序，就像 Flash、ActiveX 或 Java applet 一样。（Flash 游戏是“web 游戏”吗？通常被称为<i>浏览器游戏</i>，但那并非同一概念。）<p>我们已有术语来描述 {Flash、ActiveX、Java} 这类 applet：apps。离线的 JavaScript SPA 同样只是 apps。我们不需要再加上“web”前缀；在这里它无实际意义。在任何上述情形中，如果你把完全相同的程序，从放在域名前端的 S3 bucket，换成装进 Electron 打包里，从任何意义上看它都不再是“web app”。你的 SPA 只是“一个使用浏览器 DOM 作为图形工具包的 JavaScript <i>app</i>”。在放入 Electron 之前，这句话同样成立。<p>因此，“web app”在“app”之上有特定含义。你需要额外的东西。这个额外的东西就是后端（backend），由应用逻辑驱动的浏览器通过 web 与之交互。这就是让一个应用成为“web app”的原因。（该定义有意同时涵盖服务器端渲染的动态 HTML 和客户端渲染的 JavaScript SPA。你不必有前端<i>app</i>；你只需要一个有东西与之交互的<i>web 后端</i>。这个“东西”可以是浏览器直接通过点击链接和提交表单，也可以是使用 AJAX 的 JavaScript 前端。）<p>那么，“web site”就是没有“app”部分的“web app”。如果上文中“app”与“web app”的定义清楚，那么你可以由此推导出“web not-app”的定义。那就是 website：由 web 后端驱动但不执行任何应用行为的东西。如果我们认为“应用行为”基本上是“存储状态”，那么“site”就是没有持久状态的“app”。<p>既然此处对“web”的定义是关于后端的，那么“web app”和“web site”（web not-app）之间的区别，很可能由后端的属性来决定，即后端是否具备存储状态的能力。因此，“web site”可以被视为一种后端不执行应用行为——即不存储状态的“web app”。”       []
19465534        comment bduerst 2019-03-22 18:36:40     “包括 Apple 在内：<a href="https://www.theguardian.com/commentisfree/2018/mar/04/apple-users-icloud-services-personal-data-china-cybersecurity-law-privacy" rel="nofollow">https://www.theguardian.com/commentisfree/2018/mar/04/apple-...</a>”        []
19466269        comment CalChris        2019-03-22 19:55:13     “&gt; 它使用相同的 A12 CPU……在<i>系统级芯片（system-on-a-chip）</i>上带有 3 GB RAM。<p>实际上那是<i>封装叠层（package-on-package）</i>。LPDDR4X DRAM 被粘（准确说是回流焊接）在 A12 Bionic 的背面。<p><a href="https://www.techinsights.com/about-techinsights/overview/blog/apple-iphone-xs-teardown/" rel="nofollow">https://www.techinsights.com/about-techinsights/overview/blo...</a><p><a href="https://en.wikipedia.org/wiki/Package_on_package" rel="nofollow">https://en.wikipedia.org/wiki/Package_on_package</a>”       [19468341]
19466980        comment onetimemanytime 2019-03-22 21:07:25     “&gt;&gt;<i>这里荒谬的是，你不能把房车所在的那块地拿来盖一个工作室。</i><p>完全是风马牛不相及。为工作室颁发的许可证会让那栋建筑在法律上获得合法地位，某种程度上可以长期存在。而房车，他们可以通过一部新法律把它赶走，或者只是开始严格执行现有法律。”      []
19467048        comment karambahh       2019-03-22 21:15:41     "我认为你在这里是在拿苹果和橙子做比较。<p>如果你将停车位改作他用(比如建造家庭住房或动物收容所),你并没有剥夺汽车的任何东西,它只是一块昂贵的大型金属,并不具有感知能力。<p>接下来,你可能会说你剥夺了车主随意停车的便利性。为了让一个人能有遮风挡雨的地方,我完全可以接受剥夺车主的这种便利。(这是我的亲身经历,就在几分钟前,我不得不把车停在离家1公里远的地方,因为市政府正在建造住房,限制了附近的停车位)<p>然后,有些人可能会说,在人类还在受苦的时候帮助动物是可耻的。这和«我们不能接纳更多移民,我们必须先照顾好'自己的'无家可归者»的思路如出一辙。<p>这是一个错误的二元对立。西方社会的不平等正在不断加剧。我个人的努力微不足道。我向人类或动物慈善事业的捐赠,只是我们所处的巨大不平等山脉上的一个小凹痕。但我们作为一个集体,通过捐赠、投票以及对我们所生活的世界保持关注,确实能产生影响……<p>最后,完全是个人观察:我多次目睹极度贫困的人们不遗余力地向动物或人类表达团结。我也目睹了大量极其富有的人抱怨穷人的存在给他们带来不便,而他们的财富正是他们祖先剥削这些穷人的直接结果。"      [19467512]
```

2. 让我们为 Hacker News 数据创建一个表：

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

3. 我们希望将 `author` 列转换为小写，这可以通过 [`lower` 函数](/sql-reference/functions/string-functions#lower) 轻松完成。我们还希望将 `comment` 字符串拆分为词元，并将结果存储在 `tokens` 列中，这可以使用 [`extractAll` 函数](/sql-reference/functions/string-search-functions#extractAll) 来实现。你可以在一条 `clickhouse-client` 命令中完成以上所有操作——注意这里是如何使用 `<` 运算符将 `comments.tsv` 文件重定向输入到 `clickhouse-client` 的：

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
`input` 函数在这里非常有用，因为它允许我们在将数据插入 `hackernews` 表的过程中对其进行转换。传递给 `input` 的参数是传入原始数据的格式，你会在许多其他表函数中看到这一点（在这些函数中，你需要为传入的数据指定一个 schema）。
:::

4. 就这样！数据已经写入 ClickHouse：

```sql
SELECT *
FROM hackernews
LIMIT 7
```

结果为：


```response
│  488 │ comment │ mynameishere │ 2007-02-22 14:48:18 │ "It's too bad. Javascript-in-the-browser and Ajax are both nasty hacks that force programmers to do all sorts of shameful things. And the result is--wanky html tricks. Java, for its faults, is fairly clean when run in the applet environment. It has every superiority over JITBAJAX, except for install issues and a chunky load process. Yahoo games seems like just about the only applet success story. Of course, back in the day, non-trivial Applets tended to be too large for the dial-up accounts people had. At least that is changed." │ [454927] │ ['It','s','too','bad','Javascript','in','the','browser','and','Ajax','are','both','nasty','hacks','that','force','programmers','to','do','all','sorts','of','shameful','things','And','the','result','is','wanky','html','tricks','Java','for','its','faults','is','fairly','clean','when','run','in','the','applet','environment','It','has','every','superiority','over','JITBAJAX','except','for','install','issues','and','a','chunky','load','process','Yahoo','games','seems','like','just','about','the','only','applet','success','story','Of','course','back','in','the','day','non','trivial','Applets','tended','to','be','too','large','for','the','dial','up','accounts','people','had','At','least','that','is','changed'] │
│  575 │ comment │ leoc         │ 2007-02-23 00:09:49 │ "I can't find the reference now, but I *think* I've just read something suggesting that the install process for an Apollo applet will involve an &#34;install-this-application?&#34; confirmation dialog followed by a download of 30 seconds or so. If so then Apollo's less promising than I hoped. That kind of install may be low-friction by desktop-app standards but it doesn't compare to the ease of starting a browser-based AJAX or Flash application. (Consider how easy it is to use maps.google.com for the first time.)<p>Surely it will at least be that Apollo applications will run untrusted by default, and that an already-installed app will start automatically whenever you take your browser to the URL you downloaded it from?" │ [455071] │ ['I','can','t','find','the','reference','now','but','I','think','I','ve','just','read','something','suggesting','that','the','install','process','for','an','Apollo','applet','will','involve','an','34','install','this','application','34','confirmation','dialog','followed','by','a','download','of','30','seconds','or','so','If','so','then','Apollo','s','less','promising','than','I','hoped','That','kind','of','install','may','be','low','friction','by','desktop','app','standards','but','it','doesn','t','compare','to','the','ease','of','starting','a','browser','based','AJAX','or','Flash','application','Consider','how','easy','it','is','to','use','maps','google','com','for','the','first','time','p','Surely','it','will','at','least','be','that','Apollo','applications','will','run','untrusted','by','default','and','that','an','already','installed','app','will','start','automatically','whenever','you','take','your','browser','to','the','URL','you','downloaded','it','from'] │
│ 3110 │ comment │ davidw       │ 2007-03-09 09:19:58 │ "I'm very curious about this tsumobi thing, as it's basically exactly what Hecl is ( http://www.hecl.org ).  I'd sort of abbandoned it as an idea for making any money with directly, though, figuring the advantage was just to be able to develop applications a lot faster.  I was able to prototype ShopList ( http://shoplist.dedasys.com ) in a few minutes with it, for example.<p>Edit: BTW, I'd certainly be interested in chatting with the Tsumobi folks.  It's a good idea - perhaps there are elements in common that can be reused from/added to Hecl, which is open source under a very liberal license, meaning you can take it and include it even in 'commercial' apps.<p>I really think that the 'common' bits in a space like that have to be either free or open source (think about browsers, html, JavaScript, java applets, etc...), and that that's not where the money is." │ [3147]   │ ['I','m','very','curious','about','this','tsumobi','thing','as','it','s','basically','exactly','what','Hecl','is','http','www','hecl','org','I','d','sort','of','abbandoned','it','as','an','idea','for','making','any','money','with','directly','though','figuring','the','advantage','was','just','to','be','able','to','develop','applications','a','lot','faster','I','was','able','to','prototype','ShopList','http','shoplist','dedasys','com','in','a','few','minutes','with','it','for','example','p','Edit','BTW','I','d','certainly','be','interested','in','chatting','with','the','Tsumobi','folks','It','s','a','good','idea','perhaps','there','are','elements','in','common','that','can','be','reused','from','added','to','Hecl','which','is','open','source','under','a','very','liberal','license','meaning','you','can','take','it','and','include','it','even','in','commercial','apps','p','I','really','think','that','the','common','bits','in','a','space','like','that','have','to','be','either','free','or','open','source','think','about','browsers','html','javascript','java','applets','etc','and','that','that','s','not','where','the','money','is'] │
│ 4016 │ comment │ mynameishere │ 2007-03-13 22:56:53 │ "http://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=2853515&CatId=2511<p>Versus<p>http://store.apple.com/1-800-MY-APPLE/WebObjects/AppleStore?family=MacBookPro<p>These are comparable systems, but the Apple has, as I said, roughly an 800 dollar premium. Actually, the cheapest macbook pro costs the same as the high-end Toshiba. If you make good money, it's not a big deal. But when the girl in the coffeehouse asks me what kind of computer she should get to go along with her minimum wage, I'm basically scum to recommend an Apple." │ []       │ ['http','www','tigerdirect','com','applications','SearchTools','item','details','asp','EdpNo','2853515','CatId','2511','p','Versus','p','http','store','apple','com','1','800','MY','APPLE','WebObjects','AppleStore','family','MacBookPro','p','These','are','comparable','systems','but','the','Apple','has','as','I','said','roughly','an','800','dollar','premium','Actually','the','cheapest','macbook','pro','costs','the','same','as','the','high','end','Toshiba','If','you','make','good','money','it','s','not','a','big','deal','But','when','the','girl','in','the','coffeehouse','asks','me','what','kind','of','computer','she','should','get','to','go','along','with','her','minimum','wage','I','m','basically','scum','to','recommend','an','Apple'] │
│ 4568 │ comment │ jwecker      │ 2007-03-16 13:08:04 │ I know the feeling.  The same feeling I had back when people were still writing java applets.  Maybe a normal user doesn't feel it- maybe it's the programmer in us knowing that there's a big layer running between me and the browser...                 │ []       │ ['I','know','the','feeling','The','same','feeling','I','had','back','when','people','were','still','writing','java','applets','Maybe','a','normal','user','doesn','t','feel','it','maybe','it','s','the','programmer','in','us','knowing','that','there','s','a','big','layer','running','between','me','and','the','browser'] │
│ 4900 │ comment │ lupin_sansei │ 2007-03-19 00:26:30 │ "The essence of Ajax is getting Javascript to communicate with the server without reloading the page. Although XmlHttpRequest is most convenient, there were other methods of doing this before XmlHttpRequest such as <p>- loading a 1 pixel image and sending data in the image's cookie<p>- loading server data through a tiny frame which contained XML or javascipt data<p>- Using a java applet to fetch the data on behalf of javascript" │ []       │ ['The','essence','of','Ajax','is','getting','Javascript','to','communicate','with','the','server','without','reloading','the','page','Although','XmlHttpRequest','is','most','convenient','there','were','other','methods','of','doing','this','before','XmlHttpRequest','such','as','p','loading','a','1','pixel','image','and','sending','data','in','the','image','s','cookie','p','loading','server','data','through','a','tiny','frame','which','contained','XML','or','javascipt','data','p','Using','a','java','applet','to','fetch','the','data','on','behalf','of','javascript'] │
│ 5102 │ comment │ staunch      │ 2007-03-20 02:42:47 │ "Well this is exactly the kind of thing that isn't very obvious. It sounds like once you're wealthy there's a new set of rules you have to live by. It's a shame everyone has had to re-learn these things for themselves because a few bad apples can control their jealousy.<p>Very good to hear it's somewhere in your essay queue though. I'll try not to get rich before you write it, so I have some idea of what to expect :-)" │ []       │ ['Well','this','is','exactly','the','kind','of','thing','that','isn','t','very','obvious','It','sounds','like','once','you','re','wealthy','there','s','a','new','set','of','rules','you','have','to','live','by','It','s','a','shame','everyone','has','had','to','re','learn','these','things','for','themselves','because','a','few','bad','apples','can','control','their','jealousy','p','Very','good','to','hear','it','s','somewhere','in','your','essay','queue','though','I','ll','try','not','to','get','rich','before','you','write','it','so','I','have','some','idea','of','what','to','expect'] │
```

5. 另一种方式是使用 `cat` 这类工具将文件流式传输到 `clickhouse-client`。例如，下面的命令与使用 `<` 运算符的效果相同：

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

请访问 [`clickhouse-client` 文档页面](/interfaces/cli)，了解如何在本地操作系统上安装 `clickhouse-client` 的详细信息。
