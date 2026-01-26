---
sidebar_label: '插入本地文件'
sidebar_position: 2
title: '插入本地文件'
slug: /integrations/data-ingestion/insert-local-files
description: '了解如何插入本地文件'
show_related_blogs: true
doc_type: 'guide'
keywords: ['插入本地文件 ClickHouse', 'ClickHouse 本地文件导入', 'clickhouse-client 文件上传']
---

# 插入本地文件 \{#insert-local-files\}

你可以使用 `clickhouse-client` 将本地文件以流方式导入到你的 ClickHouse 服务中。这样你就可以在插入前利用众多强大且便捷的 ClickHouse 函数对数据进行预处理。下面来看一个示例……

1. 假设我们有一个名为 `comments.tsv` 的 TSV 文件，其中包含一些 Hacker News 评论，并且首行是包含列名的表头。在插入数据时，你需要指定一个[输入格式](/interfaces/formats)，在本例中为 `TabSeparatedWithNames`：

```text
id      type    author  timestamp       comment children
19464423        comment adrianmonk      2019-03-22 16:58:19     "这首先就是一个风马牛不相及的比较。监狱人口涉及安全开支。您需要工作人员、设施、设备等来管理囚犯行为(防止打斗等)并防止他们逃跑。这两件事有不同的使命,所以当然会有不同的成本。<p>这就像说冰箱比微波炉贵。这没有任何意义,因为它们做的是不同的事情。"   []
19464461        comment sneakernets     2019-03-22 17:01:10     "因为科学依据如此确凿,以至于在这一点上已经是老生常谈了。<p>但对于反疫苗者来说,这就像告诉某人你手里拿着的红苹果是红色的,但他们却坚持说它是绿色的。你无法与这样的人争论'是非曲直'。" [19464582]
19465288        comment derefr  2019-03-22 18:15:21     "因为我们讨论的是后端部署+运维术语中的'网站'和'网络应用',而不是它们的一般用法。词汇在不同学科中可以有精确的术语含义<i>且各不相同</i>。这是运维人员倾向于划分界限的地方:网<i>站</i>是可以部署到例如 S3 存储桶的东西,它将完全正常运行,无需您为其维护任何其他依赖项。<i>网络应用</i>是<i>确实</i>具有此类依赖项的东西,您需要设置和维护这些依赖项——例如数据库层。<p>但即使忽略这一点,我也因为前缀'web'而以这种方式定义这些术语。网络应用不是'网络上的应用',而是'由网络驱动的应用'。一个完全离线的 JavaScript SPA 仅仅是<i>通过</i>网络<i>提供服务</i>,它<i>不是</i>网络应用。它只是一个在浏览器中运行的程序,就像 Flash 或 ActiveX 或 Java 小程序是在浏览器中运行的程序一样。(Flash 游戏是'网络游戏'吗?它通常被认为是<i>浏览器游戏</i>,但这不是同一回事。)<p>我们已经有一个术语来描述 {Flash、ActiveX、Java} 小程序是什么:应用。离线 JavaScript SPA 也只是应用。我们不需要添加前缀'web';在这里它毫无意义。在任何这些情况下,如果您采用完全相同的程序,并将其放入 Electron 包装器而不是放入域前置的 S3 存储桶中,它显然在任何意义上都不是'网络应用'。您的 SPA 只是'一个使用浏览器 DOM 作为其图形工具包的 JavaScript<i>应用</i>'。好吧,在您将其放入 Electron 包装器之前,这同样是真实的。<p>因此,'网络应用'具有特定含义,超越了'应用'。您需要一些额外的东西。这个额外的东西是后端,您的浏览器——由应用的逻辑驱动——<i>通过网络</i>与之交互。这就是使应用成为'网络应用'的原因。(此定义有意涵盖服务器渲染的动态 HTML 和客户端渲染的 JavaScript SPA 应用。您不需要前端<i>应用</i>;您只需要一个<i>网络后端</i>,某些东西正在与之交互。这个东西可以直接是浏览器,通过点击链接和提交表单;或者可以是 JavaScript 前端,使用 AJAX。)<p>那么,'网站'就是没有'应用'部分的'网络应用'。如果在上述定义中清楚什么是'应用',什么是'网络应用',那么您可以将一个从另一个中减去,以得出'网络非应用'的定义。这就是网站:由网络后端驱动的东西,它不做任何应用的事情。如果我们认为'应用的事情'基本上是'存储状态',那么'站点'就是没有持久状态的'应用'。<p>由于这里'web'的定义是关于后端的,那么'网络应用'和'网站'(网络非应用)之间的区别可能由后端的属性定义。因此,区别在于网络后端存储状态的能力。因此,'网站'是后端不做任何应用事情的'网络应用'——即不存储状态。"       []
19465534        comment bduerst 2019-03-22 18:36:40     "包括 Apple:<a href=""https:&#x2F;&#x2F;www.theguardian.com&#x2F;commentisfree&#x2F;2018&#x2F;mar&#x2F;04&#x2F;apple-users-icloud-services-personal-data-china-cybersecurity-law-privacy"" rel=""nofollow"">https:&#x2F;&#x2F;www.theguardian.com&#x2F;commentisfree&#x2F;2018&#x2F;mar&#x2F;04&#x2F;apple-...</a>"        []
19466269        comment CalChris        2019-03-22 19:55:13     "&gt; 它具有相同的 A12 CPU……在<i>系统级芯片</i>上有 3 GB RAM<p>实际上那是<i>封装堆叠</i>。LPDDR4X DRAM 被粘合(准确地说,是回流焊接)到 A12 Bionic 的背面。<p><a href=""https:&#x2F;&#x2F;www.techinsights.com&#x2F;about-techinsights&#x2F;overview&#x2F;blog&#x2F;apple-iphone-xs-teardown&#x2F;"" rel=""nofollow"">https:&#x2F;&#x2F;www.techinsights.com&#x2F;about-techinsights&#x2F;overview&#x2F;blo...</a><p><a href=""https:&#x2F;&#x2F;en.wikipedia.org&#x2F;wiki&#x2F;Package_on_package"" rel=""nofollow"">https:&#x2F;&#x2F;en.wikipedia.org&#x2F;wiki&#x2F;Package_on_package</a>"       [19468341]
19466980        comment onetimemanytime 2019-03-22 21:07:25     "&gt;&gt;<i>这里的荒谬之处在于,您不能占用房车所在的土地并在其上建造工作室。</i><p>风马牛不相及。建造工作室的许可证使该建筑合法化,几乎是永久的。房车,他们可以通过新法律或仅仅通过执行现有法律将其驱逐。"      []
19467048        comment karambahh       2019-03-22 21:15:41     "我认为你在这里是在混为一谈。<p>如果你将停车位改作他用（比如建造家庭住房或动物收容所），你并没有剥夺汽车的任何东西，它只是一块昂贵的大型金属，并不具有感知能力。<p>接下来，你可能会说这剥夺了车主随意停车的便利性。为了让一个人能有遮风挡雨的地方，我完全可以接受剥夺车主的这种便利。（这是我的亲身经历，就在几分钟前，我不得不把车停在离家1公里外的地方，因为市政府正在建造住房，限制了附近的停车位）<p>然后，有些人可能会说，在人类还在受苦的时候帮助动物是可耻的。这和«我们不能接纳更多移民，我们必须先照顾好'自己的'无家可归者»的思路如出一辙。<p>这是一个错误的二元对立。西方社会的不平等正在不断加剧。我个人的努力微不足道。我向人类或动物慈善事业的捐赠，只是我们所处的巨大不平等山峰上的一个小凹痕。但我们作为一个集体，通过捐赠、投票以及对我们所生活的世界保持关注，确实能产生影响……<p>最后，完全是个人观察：我多次目睹极度贫困的人不遗余力地向动物或人类表达团结。我也目睹了大量极其富有的人抱怨穷人的存在给他们带来不便，而他们的财富正是他们祖先剥削这些穷人的直接后果。"      [19467512]
```

2. 现在让我们为 Hacker News 数据创建一张表：

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

3. 我们希望将 `author` 列转换为小写，可以通过 [`lower` 函数](/sql-reference/functions/string-functions#lower) 轻松完成。我们还希望将 `comment` 字符串拆分为若干标记（tokens），并将结果存储到 `tokens` 列中，这可以使用 [`extractAll` 函数](/sql-reference/functions/string-search-functions#extractAll) 来实现。你可以在一条 `clickhouse-client` 命令中完成以上所有操作——注意 `comments.tsv` 文件是通过 `<` 运算符重定向到 `clickhouse-client` 的：

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
`input` 函数在这里非常有用，因为它允许我们在将数据插入 `hackernews` 表的过程中对其进行转换。传给 `input` 的参数是输入原始数据的格式，你会在许多其他表函数中看到类似用法（在这些函数中，你需要为传入数据指定一个 schema（模式））。
:::

4. 就这样！数据已经导入到 ClickHouse 中了：

```sql
SELECT *
FROM hackernews
LIMIT 7
```

结果如下：

```response
│  488 │ comment │ mynameishere │ 2007-02-22 14:48:18 │ "It's too bad. Javascript-in-the-browser and Ajax are both nasty hacks that force programmers to do all sorts of shameful things. And the result is--wanky html tricks. Java, for its faults, is fairly clean when run in the applet environment. It has every superiority over JITBAJAX, except for install issues and a chunky load process. Yahoo games seems like just about the only applet success story. Of course, back in the day, non-trivial Applets tended to be too large for the dial-up accounts people had. At least that is changed." │ [454927] │ ['It','s','too','bad','Javascript','in','the','browser','and','Ajax','are','both','nasty','hacks','that','force','programmers','to','do','all','sorts','of','shameful','things','And','the','result','is','wanky','html','tricks','Java','for','its','faults','is','fairly','clean','when','run','in','the','applet','environment','It','has','every','superiority','over','JITBAJAX','except','for','install','issues','and','a','chunky','load','process','Yahoo','games','seems','like','just','about','the','only','applet','success','story','Of','course','back','in','the','day','non','trivial','Applets','tended','to','be','too','large','for','the','dial','up','accounts','people','had','At','least','that','is','changed'] │
│  575 │ comment │ leoc         │ 2007-02-23 00:09:49 │ "I can't find the reference now, but I *think* I've just read something suggesting that the install process for an Apollo applet will involve an &#34;install-this-application?&#34; confirmation dialog followed by a download of 30 seconds or so. If so then Apollo's less promising than I hoped. That kind of install may be low-friction by desktop-app standards but it doesn't compare to the ease of starting a browser-based AJAX or Flash application. (Consider how easy it is to use maps.google.com for the first time.)<p>Surely it will at least be that Apollo applications will run untrusted by default, and that an already-installed app will start automatically whenever you take your browser to the URL you downloaded it from?" │ [455071] │ ['I','can','t','find','the','reference','now','but','I','think','I','ve','just','read','something','suggesting','that','the','install','process','for','an','Apollo','applet','will','involve','an','34','install','this','application','34','confirmation','dialog','followed','by','a','download','of','30','seconds','or','so','If','so','then','Apollo','s','less','promising','than','I','hoped','That','kind','of','install','may','be','low','friction','by','desktop','app','standards','but','it','doesn','t','compare','to','the','ease','of','starting','a','browser','based','AJAX','or','Flash','application','Consider','how','easy','it','is','to','use','maps','google','com','for','the','first','time','p','Surely','it','will','at','least','be','that','Apollo','applications','will','run','untrusted','by','default','and','that','an','already','installed','app','will','start','automatically','whenever','you','take','your','browser','to','the','URL','you','downloaded','it','from'] │
│ 3110 │ comment │ davidw       │ 2007-03-09 09:19:58 │ "I'm very curious about this tsumobi thing, as it's basically exactly what Hecl is ( http://www.hecl.org ).  I'd sort of abbandoned it as an idea for making any money with directly, though, figuring the advantage was just to be able to develop applications a lot faster.  I was able to prototype ShopList ( http://shoplist.dedasys.com ) in a few minutes with it, for example.<p>Edit: BTW, I'd certainly be interested in chatting with the Tsumobi folks.  It's a good idea - perhaps there are elements in common that can be reused from/added to Hecl, which is open source under a very liberal license, meaning you can take it and include it even in 'commercial' apps.<p>I really think that the 'common' bits in a space like that have to be either free or open source (think about browsers, html, JavaScript, java applets, etc...), and that that's not where the money is." │ [3147]   │ ['I','m','very','curious','about','this','tsumobi','thing','as','it','s','basically','exactly','what','Hecl','is','http','www','hecl','org','I','d','sort','of','abbandoned','it','as','an','idea','for','making','any','money','with','directly','though','figuring','the','advantage','was','just','to','be','able','to','develop','applications','a','lot','faster','I','was','able','to','prototype','ShopList','http','shoplist','dedasys','com','in','a','few','minutes','with','it','for','example','p','Edit','BTW','I','d','certainly','be','interested','in','chatting','with','the','Tsumobi','folks','It','s','a','good','idea','perhaps','there','are','elements','in','common','that','can','be','reused','from','added','to','Hecl','which','is','open','source','under','a','very','liberal','license','meaning','you','can','take','it','and','include','it','even','in','commercial','apps','p','I','really','think','that','the','common','bits','in','a','space','like','that','have','to','be','either','free','or','open','source','think','about','browsers','html','javascript','java','applets','etc','and','that','that','s','not','where','the','money','is'] │
│ 4016 │ comment │ mynameishere │ 2007-03-13 22:56:53 │ "http://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=2853515&CatId=2511<p>Versus<p>http://store.apple.com/1-800-MY-APPLE/WebObjects/AppleStore?family=MacBookPro<p>These are comparable systems, but the Apple has, as I said, roughly an 800 dollar premium. Actually, the cheapest macbook pro costs the same as the high-end Toshiba. If you make good money, it's not a big deal. But when the girl in the coffeehouse asks me what kind of computer she should get to go along with her minimum wage, I'm basically scum to recommend an Apple." │ []       │ ['http','www','tigerdirect','com','applications','SearchTools','item','details','asp','EdpNo','2853515','CatId','2511','p','Versus','p','http','store','apple','com','1','800','MY','APPLE','WebObjects','AppleStore','family','MacBookPro','p','These','are','comparable','systems','but','the','Apple','has','as','I','said','roughly','an','800','dollar','premium','Actually','the','cheapest','macbook','pro','costs','the','same','as','the','high','end','Toshiba','If','you','make','good','money','it','s','not','a','big','deal','But','when','the','girl','in','the','coffeehouse','asks','me','what','kind','of','computer','she','should','get','to','go','along','with','her','minimum','wage','I','m','basically','scum','to','recommend','an','Apple'] │
│ 4568 │ comment │ jwecker      │ 2007-03-16 13:08:04 │ I know the feeling.  The same feeling I had back when people were still writing java applets.  Maybe a normal user doesn't feel it- maybe it's the programmer in us knowing that there's a big layer running between me and the browser...                 │ []       │ ['I','know','the','feeling','The','same','feeling','I','had','back','when','people','were','still','writing','java','applets','Maybe','a','normal','user','doesn','t','feel','it','maybe','it','s','the','programmer','in','us','knowing','that','there','s','a','big','layer','running','between','me','and','the','browser'] │
│ 4900 │ comment │ lupin_sansei │ 2007-03-19 00:26:30 │ "Ajax 的核心是让 JavaScript 在不重新加载页面的情况下与服务器通信。虽然 XmlHttpRequest 最为便捷,但在 XmlHttpRequest 出现之前还有其他实现方法,例如:<p>- 加载一个 1 像素图像并通过图像的 cookie 发送数据<p>- 通过包含 XML 或 JavaScript 数据的微型框架加载服务器数据<p>- 使用 Java 小程序代表 JavaScript 获取数据" │ []       │ ['The','essence','of','Ajax','is','getting','Javascript','to','communicate','with','the','server','without','reloading','the','page','Although','XmlHttpRequest','is','most','convenient','there','were','other','methods','of','doing','this','before','XmlHttpRequest','such','as','p','loading','a','1','pixel','image','and','sending','data','in','the','image','s','cookie','p','loading','server','data','through','a','tiny','frame','which','contained','XML','or','javascipt','data','p','Using','a','java','applet','to','fetch','the','data','on','behalf','of','javascript'] │
│ 5102 │ comment │ staunch      │ 2007-03-20 02:42:47 │ "这正是那种不太明显的事情。听起来一旦你变得富有,就需要遵守一套新的规则。遗憾的是每个人都不得不自己重新学习这些,因为少数心怀嫉妒的人无法控制自己的情绪。<p>不过很高兴听到这个话题在你的文章队列中。我会尽量在你写出来之前不要变富,这样我就能知道该期待什么了 :-)" │ []       │ ['Well','this','is','exactly','the','kind','of','thing','that','isn','t','very','obvious','It','sounds','like','once','you','re','wealthy','there','s','a','new','set','of','rules','you','have','to','live','by','It','s','a','shame','everyone','has','had','to','re','learn','these','things','for','themselves','because','a','few','bad','apples','can','control','their','jealousy','p','Very','good','to','hear','it','s','somewhere','in','your','essay','queue','though','I','ll','try','not','to','get','rich','before','you','write','it','so','I','have','some','idea','of','what','to','expect'] │
```

5. 另一种方式是使用 `cat` 等工具将文件内容流式传输到 `clickhouse-client`。例如，下面的命令与使用 `<` 操作符得到的结果相同：

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

访问 [`clickhouse-client` 文档页面](/interfaces/cli)，了解如何在本地操作系统上安装 `clickhouse-client` 的详细说明。
