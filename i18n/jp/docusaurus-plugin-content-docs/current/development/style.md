---
description: 'ClickHouse C++ 開発のためのコーディングスタイルガイド'
sidebar_label: 'C++ スタイルガイド'
sidebar_position: 70
slug: /development/style
title: 'C++ スタイルガイド'
doc_type: 'guide'
---

# C++ スタイルガイド {#c-style-guide}

## 一般的な推奨事項 {#general-recommendations}

以下は推奨事項であり、必須ではありません。
コードを編集する場合は、既存のコードの書式に従うのが理にかなっています。
コードスタイルは一貫性のために必要です。一貫性があるとコードが読みやすくなり、検索もしやすくなります。
多くの規則には論理的な理由があるわけではなく、確立された慣習に従って定められています。

## フォーマット {#formatting}

**1.** ほとんどのコード整形は `clang-format` によって自動的に行われます。

**2.** インデント幅はスペース 4 文字です。タブ入力でスペース 4 文字が挿入されるように開発環境を設定してください。

**3.** 開き波かっこと閉じ波かっこは、それぞれ別々の行に配置しなければなりません。

```cpp
inline void readBoolText(bool & x, ReadBuffer & buf)
{
    char tmp = '0';
    readChar(tmp, buf);
    x = tmp != '0';
}
```

**4.** 関数本体全体が1つの `statement` のみで構成されている場合は、1行で記述してもかまいません。行末の空白以外では、中括弧の前後にスペースを入れてください。

```cpp
inline size_t mask() const                { return buf_size() - 1; }
inline size_t place(HashValue x) const    { return x & mask(); }
```

**5.** 関数では、かっこの前後にスペースを入れないでください。

```cpp
void reinsert(const Value & x)
```

```cpp
memcpy(&buf[place_value], &x, sizeof(x));
```

**6.** `if`、`for`、`while` などの式では、関数呼び出しの場合とは異なり、開きかっこの前にスペースを挿入します。

```cpp
for (size_t i = 0; i < rows; i += storage.index_granularity)
```

**7.** 二項演算子（`+`、`-`、`*`、`/`、`%` など）および三項演算子 `?:` の前後にはスペースを空けます。

```cpp
UInt16 year = (s[0] - '0') * 1000 + (s[1] - '0') * 100 + (s[2] - '0') * 10 + (s[3] - '0');
UInt8 month = (s[5] - '0') * 10 + (s[6] - '0');
UInt8 day = (s[8] - '0') * 10 + (s[9] - '0');
```

**8.** 改行する場合は、演算子を新しい行に移動し、その直前のインデントを増やします。

```cpp
if (elapsed_ns)
    message << " ("
        << rows_read_on_server * 1000000000 / elapsed_ns << " rows/s., "
        << bytes_read_on_server * 1000.0 / elapsed_ns << " MB/s.) ";
```

**9.** 必要に応じて、同一行内の配置調整にスペースを使用してもかまいません。

```cpp
dst.ClickLogID         = click.LogID;
dst.ClickEventID       = click.EventID;
dst.ClickGoodEvent     = click.GoodEvent;
```

**10.** 演算子 `.`, `->` の前後にスペースを入れないでください。

必要であれば、演算子は次の行に折り返してかまいません。その場合は、その行のインデントを増やしてください。

**11.** 単項演算子（`--`, `++`, `*`, `&`, ...）とその引数の間にスペースを入れないでください。

**12.** カンマの後にはスペースを入れ、前には入れないでください。同じ規則は、`for` 式内のセミコロンにも適用されます。

**13.** `[]` 演算子の前後にスペースを入れないでください。

**14.** `template <...>` 式では、`template` と `<` の間にはスペースを入れ、`<` の後および `>` の前にはスペースを入れないでください。

```cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
{}
```

**15.** クラスや構造体内では、`class/struct` と同じインデントレベルに `public`、`private`、`protected` を記述し、それ以外のコードをインデントします。

```cpp
template <typename T>
class MultiVersion
{
public:
    /// Version of object for usage. shared_ptr manage lifetime of version.
    using Version = std::shared_ptr<const T>;
    ...
}
```

**16.** ファイル全体で同じ `namespace` を使っていて、かつ他に特筆すべきものがなければ、`namespace` の内側でインデントを下げてオフセットを取る必要はありません。

**17.** `if`、`for`、`while` などの式のブロックが単一の `statement` だけから成る場合、中括弧は省略可能です。代わりに、その `statement` を別行に記述します。このルールは入れ子になった `if`、`for`、`while`、… に対しても有効です。

ただし、内側の `statement` が中括弧または `else` を含む場合、外側のブロックは中括弧で記述する必要があります。

```cpp
/// Finish write.
for (auto & stream : streams)
    stream.second->finalize();
```

**18.** 行末にスペースを入れてはいけません。

**19.** ソースファイルは UTF-8 でエンコードされている必要があります。

**20.** 非 ASCII 文字も文字列リテラルで使用できます。

```cpp
<< ", " << (timer.elapsed() / chunks_stats.hits) << " μsec/hit.";
```

**21.** 1 行に複数の式を書かないでください。

**22.** 関数内のコードはセクションごとにまとめ、セクション同士は空行 1 行以内で区切ってください。

**23.** 関数やクラスなどのあいだは、1 ～ 2 行の空行で区切ってください。

**24.** 値に対する `const` 修飾子は、型名の前に書かなければなりません。

```cpp
//correct
const char * pos
const std::string & s
//incorrect
char const * pos
```

**25.** ポインタや参照を宣言する際は、`*` および `&` 記号の両側にスペースを入れること。

```cpp
//correct
const char * pos
//incorrect
const char* pos
const char *pos
```

**26.** テンプレート型を使用する場合は（最も単純な場合を除き）、`using` キーワードでエイリアスを定義すること。

言い換えると、テンプレートパラメータは `using` の中だけで指定し、コード中で繰り返し書かないようにする。

`using` は関数内などのローカルスコープに宣言してもよい。

```cpp
//correct
using FileStreams = std::map<std::string, std::shared_ptr<Stream>>;
FileStreams streams;
//incorrect
std::map<std::string, std::shared_ptr<Stream>> streams;
```

**27.** 1 つのステートメントで異なる型の複数の変数を宣言しないこと。

```cpp
//incorrect
int x, *y;
```

**28.** C スタイルのキャストを使用しないでください。

```cpp
//incorrect
std::cerr << (int)c <<; std::endl;
//correct
std::cerr << static_cast<int>(c) << std::endl;
```

**29.** クラスや構造体では、各可視性スコープ内でメンバーと関数を別々にグループ化してください。

**30.** 小さなクラスや構造体では、メソッド宣言と実装を分離する必要はありません。

同じことは、任意のクラスや構造体の小さなメソッドにも当てはまります。

テンプレートクラスおよび構造体については、メソッド宣言と実装を分離しないでください（分離してしまうと、結局は同じ翻訳単位内で定義しなければならなくなるためです）。

**31.** 80文字ではなく、140文字で行を折り返してもかまいません。

**32.** 後置演算子が必要でない場合は、常に前置インクリメント／デクリメント演算子を使用してください。

```cpp
for (Names::const_iterator it = column_names.begin(); it != column_names.end(); ++it)
```

## コメント {#comments}

**1.** 自明ではない箇所には、必ずコメントを追加してください。

これは非常に重要です。コメントを書こうとすると、そのコードが不要であることや、設計が誤っていることに気づく場合があります。

```cpp
/** Part of piece of memory, that can be used.
  * For example, if internal_buffer is 1MB, and there was only 10 bytes loaded to buffer from file for reading,
  * then working_buffer will have size of only 10 bytes
  * (working_buffer.end() will point to position right after those 10 bytes available for read).
  */
```

**2.** コメントは必要に応じて詳細に記述してかまいません。

**3.** コメントは、それが説明するコードの前に記述してください。例外的に、コメントを同じ行でコードの後に記述してもかまいません。

```cpp
/** Parses and executes the query.
*/
void executeQuery(
    ReadBuffer & istr, /// Where to read the query from (and data for INSERT, if applicable)
    WriteBuffer & ostr, /// Where to write the result
    Context & context, /// DB, tables, data types, engines, functions, aggregate functions...
    BlockInputStreamPtr & query_plan, /// Here could be written the description on how query was executed
    QueryProcessingStage::Enum stage = QueryProcessingStage::Complete /// Up to which stage process the SELECT query
    )
```

**4.** コメントは英語のみで記述すること。

**5.** ライブラリを作成する場合は、そのライブラリを説明する詳細なコメントをメインのヘッダーファイルに含めること。

**6.** 追加の情報を提供しないコメントは書かないこと。特に、次のような空のコメントは残さないこと。

```cpp
/*
* Procedure Name:
* Original procedure name:
* Author:
* Date of creation:
* Dates of modification:
* Modification authors:
* Original file name:
* Purpose:
* Intent:
* Designation:
* Classes used:
* Constants:
* Local variables:
* Parameters:
* Date of creation:
* Purpose:
*/
```

この例は、[http://home.tamk.fi/~jaalto/course/coding-style/doc/unmaintainable-code/](http://home.tamk.fi/~jaalto/course/coding-style/doc/unmaintainable-code/) から引用したものです。

**7.** 各ファイルの先頭に（作者名、作成日などの）不要なコメントを書かないこと。

**8.** 1 行コメントは `///` で始め、複数行コメントは `/**` で始めること。これらのコメントは「ドキュメンテーション」とみなされます。

注意: これらのコメントからドキュメンテーションを生成するために Doxygen を使用できます。ただし、IDE 内でコードをたどる方が便利なため、一般的には Doxygen はあまり使用されません。

**9.** 複数行コメントの先頭および末尾に空行を入れてはいけません（複数行コメントを閉じる行は例外）。

**10.** コードをコメントアウトする場合は、「ドキュメンテーション用」のコメントではなく、通常のコメントを使用すること。

**11.** コミットする前に、コメントアウトされたコードは削除すること。

**12.** コメントやコード内で卑俗な表現（汚い言葉）を使用しないこと。

**13.** 大文字を使用しないこと。過度な句読点や記号を使用しないこと。

```cpp
/// WHAT THE FAIL???
```

**14.** 区切り線としてコメントを使用しないでください。

```cpp
///******************************************************
```

**15.** コメント欄で議論を始めないこと。

```cpp
/// Why did you do this stuff?
```

**16.** ブロックの末尾に、その内容を説明するコメントを付ける必要はありません。

```cpp
/// for
```

## 名前 {#names}

**1.** 変数およびクラスメンバーの名前には、小文字とアンダースコアからなるスネークケースを使用します。

```cpp
size_t max_block_size;
```

**2.** 関数名（メソッド名）には、先頭を小文字にするキャメルケースを使用します。

```cpp
std::string getName() const override { return "Memory"; }
```

**3.** クラス（構造体）の名前には、先頭を大文字にした CamelCase を使用します。インターフェースには、I 以外のプレフィックスは使用しません。

```cpp
class StorageMemory : public IStorage
```

**4.** `using` の名前はクラスと同じ規則で命名します。

**5.** テンプレート型引数名は、単純な場合には `T`、`T` と `U`、`T1` と `T2` を使用します。

より複雑な場合は、クラス名に対する規則に従うか、接頭辞 `T` を付けてください。

```cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
```

**6.** テンプレートの定数引数名: 変数名の規則に従うか、単純な場合は `N` を使用します。

```cpp
template <bool without_www>
struct ExtractDomain
```

**7.** 抽象クラス（インターフェース）には、`I` プレフィックスを付けることができます。

```cpp
class IProcessor
```

**8.** 変数をローカルで使用する場合は、短い名前を使ってもかまいません。

それ以外の場合は、意味が分かる名前を使用してください。

```cpp
bool info_successfully_loaded = false;
```

**9.** `define` マクロおよびグローバル定数の名前には、単語をアンダースコアで区切った全て大文字（ALL&#95;CAPS）を使用します。

```cpp
#define MAX_SRC_TABLE_NAMES_TO_STORE 1000
```

**10.** ファイル名は、その内容と同じスタイルにすること。

ファイルに1つのクラスのみが含まれている場合、ファイル名はクラス名と同じ形式（CamelCase）とすること。

ファイルに1つの関数のみが含まれている場合、ファイル名は関数名と同じ形式（camelCase）とすること。

**11.** 名前に略語が含まれる場合は、次のようにすること。

* 変数名では、略語は小文字を使用する：`mysql_connection`（`mySQL_connection` ではない）。
* クラスおよび関数の名前では、略語内の大文字を維持する：`MySQLConnection`（`MySqlConnection` ではない）。

**12.** クラスメンバーの初期化のみに使用されるコンストラクタ引数は、クラスメンバーと同じ名前にし、末尾にアンダースコアを付けること。

```cpp
FileQueueProcessor(
    const std::string & path_,
    const std::string & prefix_,
    std::shared_ptr<FileHandler> handler_)
    : path(path_),
    prefix(prefix_),
    handler(handler_),
    log(&Logger::get("FileQueueProcessor"))
{
}
```

コンストラクタ本体で引数を使用しない場合、末尾のアンダースコアは省略できます。

**13.** ローカル変数とクラスメンバーで名前の付け方に違いは設けません（接頭辞は不要です）。

```cpp
timer (not m_timer)
```

**14.** `enum` 内の定数には、先頭を大文字にした CamelCase を使用します。ALL&#95;CAPS も許容されます。`enum` が非ローカルの場合は、`enum class` を使用します。

```cpp
enum class CompressionMethod
{
    QuickLZ = 0,
    LZ4     = 1,
};
```

**15.** すべての名前は英語でなければなりません。ヘブライ語の単語をラテン文字に転写した表記は使用できません。

T&#95;PAAMAYIM&#95;NEKUDOTAYIM のような名前は使用しないでください。

**16.** 略語は、よく知られているものであれば使用できます（略語の意味を Wikipedia や検索エンジンで容易に見つけられる場合）。

`AST`, `SQL` は可。

ランダムな文字列である `NVDH` などは不可です。

その省略形が一般的に使われているのであれば、単語を途中までに省略した形も使用できます。

コメント内に完全な名前が併記されている場合は、その略語を使用してもかまいません。

**17.** C++ ソースコードのファイル名には `.cpp` 拡張子を付けなければなりません。ヘッダーファイルには `.h` 拡張子を付けなければなりません。

## コードの書き方 {#how-to-write-code}

**1.** メモリ管理。

手動によるメモリ解放（`delete`）はライブラリコードでのみ使用してかまいません。

ライブラリコードでは、`delete` 演算子はデストラクタ内でのみ使用できます。

アプリケーションコードでは、メモリはそれを所有するオブジェクトによって解放されなければなりません。

例:

* 最も簡単な方法は、オブジェクトをスタック上に配置するか、別のクラスのメンバーにすることです。
* 小さなオブジェクトが大量にある場合は、コンテナを使用してください。
* ヒープ上に存在する少数のオブジェクトを自動的に解放するには、`shared_ptr/unique_ptr` を使用してください。

**2.** リソース管理。

`RAII` を使用し、上記の方針に従ってください。

**3.** エラー処理。

例外を使用してください。ほとんどの場合、例外をスローするだけでよく、キャッチする必要はありません（`RAII` により）。

オフラインのデータ処理アプリケーションでは、例外をキャッチしないことが許容される場合がよくあります。

ユーザーリクエストを処理するサーバーでは、接続ハンドラのトップレベルで例外をキャッチするだけで十分なことが多いです。

スレッド関数では、すべての例外をキャッチして保持しておき、`join` の後でメインスレッド内で再スローする必要があります。

```cpp
/// If there weren't any calculations yet, calculate the first block synchronously
if (!started)
{
    calculate();
    started = true;
}
else /// If calculations are already in progress, wait for the result
    pool.wait();

if (exception)
    exception->rethrow();
```

例外を処理せずに握りつぶしてはいけません。すべての例外を、ただ闇雲にログへ書き出すだけにしてもいけません。

```cpp
//Not correct
catch (...) {}
```

一部の例外を無視する必要がある場合は、無視する対象を特定の例外に限定し、それ以外は必ず再スローするようにしてください。

```cpp
catch (const DB::Exception & e)
{
    if (e.code() == ErrorCodes::UNKNOWN_AGGREGATE_FUNCTION)
        return nullptr;
    else
        throw;
}
```

レスポンスコードや `errno` を返す関数を使用する場合は、必ず結果を確認し、エラー時には例外をスローしてください。

```cpp
if (0 != close(fd))
    throw ErrnoException(ErrorCodes::CANNOT_CLOSE_FILE, "Cannot close file {}", file_name);
```

コード内の不変条件（インバリアント）をチェックするために assert を使用できます。

**4.** 例外の種類。

アプリケーションコードで複雑な例外階層を使う必要はありません。例外メッセージの文面は、システム管理者が理解できるものであるべきです。

**5.** デストラクタからの例外送出。

これは推奨されませんが、許容されます。

次の方法を使用してください:

* 例外を引き起こす可能性のある処理を事前にすべて実行する関数（`done()` や `finalize()` など）を作成します。その関数が呼び出されていれば、その後のデストラクタで例外が発生することはないはずです。
* （ネットワーク越しのメッセージ送信などの）複雑すぎる処理は、クラスの利用者が破棄前に呼び出さなければならない別のメソッドに切り出すことができます。
* デストラクタ内で例外が発生した場合、それを隠蔽するよりも（ロガーが利用可能であれば）ログに記録した方がよいです。
* シンプルなアプリケーションでは、例外処理を `std::terminate`（C++11 におけるデフォルトの `noexcept` のケース）に任せることは許容できます。

**6.** 無名コードブロック。

特定の変数をローカルにするために、1 つの関数の内部で別個のコードブロックを作成し、ブロックを抜けるときにデストラクタが呼び出されるようにします。

```cpp
Block block = data.in->read();

{
    std::lock_guard<std::mutex> lock(mutex);
    data.ready = true;
    data.block = block;
}

ready_any.set();
```

**7.** マルチスレッド。

オフラインデータ処理プログラムでは:

* まず単一 CPU コアで可能な限り最大の性能が出るようにする。そのうえで、必要に応じてコードを並列化する。

サーバーアプリケーションでは:

* リクエストの処理にはスレッドプールを使用する。現在のところ、ユーザー空間でのコンテキストスイッチが必要になるタスクは発生していない。

並列化のために fork は使用しない。

**8.** スレッドの同期。

多くの場合、異なるスレッドが異なるメモリセル（さらに望ましいのは異なるキャッシュライン）を使用するようにでき、その場合はスレッド同期（`joinAll` を除く）を一切使用しなくてよい。

同期が必要な場合、ほとんどのケースでは `lock_guard` で保護されたミューテックスを使用すれば十分である。

それ以外のケースではシステムの同期プリミティブを使用する。ビジーウェイトは使用しないこと。

アトミック操作は、最も単純なケースにのみ使用すること。

ロックフリーのデータ構造を実装しようとしないこと。それが主たる専門分野である場合を除く。

**9.** ポインタ vs 参照。

ほとんどの場合、参照を優先して使用する。

**10.** `const`。

`const` 参照、`const` へのポインタ、`const_iterator`、および `const` メソッドを使用する。

`const` をデフォルトと考え、必要な場合にのみ非 `const` を使用する。

値渡しで変数を渡す場合、`const` を使うことには通常あまり意味がありません。

**11.** unsigned。

必要な場合にのみ `unsigned` を使用します。

**12.** 数値型。

`UInt8`, `UInt16`, `UInt32`, `UInt64`, `Int8`, `Int16`, `Int32`, `Int64` 型および `size_t`, `ssize_t`, `ptrdiff_t` を使用します。

次の型は数値には使用しないでください: `signed/unsigned long`, `long long`, `short`, `signed/unsigned char`, `char`。

**13.** 引数の受け渡し。

複雑な値をムーブするのであれば値渡しにして `std::move` を使用します。ループ内で値を更新したい場合は参照渡しにします。

関数がヒープ上に作成されたオブジェクトの所有権を取得する場合は、引数の型を `shared_ptr` または `unique_ptr` にします。

**14.** 戻り値。

ほとんどの場合は単に `return` を使用します。`return std::move(res)` のようには書かないでください。

関数がヒープ上にオブジェクトを確保してそれを返す場合は、`shared_ptr` または `unique_ptr` を使用します。

まれなケース（ループ内で値を更新する場合）では、引数を通して値を返す必要があるかもしれません。この場合、その引数は参照渡しにする必要があります。

```cpp
using AggregateFunctionPtr = std::shared_ptr<IAggregateFunction>;

/** Allows creating an aggregate function by its name.
  */
class AggregateFunctionFactory
{
public:
    AggregateFunctionFactory();
    AggregateFunctionPtr get(const String & name, const DataTypes & argument_types) const;
```

**15.** `namespace`。

アプリケーションコード用に、別個の `namespace` を使う必要はありません。

小規模なライブラリでも、その必要はありません。

中〜大規模のライブラリでは、すべてを `namespace` の中に入れてください。

ライブラリの `.h` ファイルでは、アプリケーションコードに不要な実装の詳細を隠すために `namespace detail` を使うことができます。

`.cpp` ファイルでは、シンボルを隠すために `static` あるいは無名の `namespace` を使うことができます。

また、対応する名前が外側の `namespace` に入り込んでしまうのを防ぐために、`enum` 用に `namespace` を使うこともできます（ただし、`enum class` を使うほうがよいです）。

**16.** 遅延初期化。

初期化に引数が必要な場合、通常はデフォルトコンストラクタを書くべきではありません。

後になって初期化を遅らせる必要が出てきた場合には、無効なオブジェクトを生成するデフォルトコンストラクタを追加することができます。あるいは、オブジェクトの数が少ない場合は、`shared_ptr/unique_ptr` を使うこともできます。

```cpp
Loader(DB::Connection * connection_, const std::string & query, size_t max_block_size_);

/// For deferred initialization
Loader() {}
```

**17.** 仮想関数。

クラスをポリモーフィックに使用する意図がない場合は、関数を仮想にする必要はありません。これはデストラクタにも当てはまります。

**18.** エンコーディング。

あらゆる箇所で UTF-8 を使用してください。`std::string` と `char *` を使用し、`std::wstring` と `wchar_t` は使用しないでください。

**19.** ロギング。

コード全体にある例を参照してください。

コミットする前に、意味のないログやデバッグ用ログ、その他あらゆる種類のデバッグ出力はすべて削除してください。

ループ内でのロギングは、Trace レベルであっても避けてください。

ログは、どのログレベルでも読みやすいものでなければなりません。

ロギングは、基本的にアプリケーションコード内でのみ使用するようにしてください。

ログメッセージは英語で記述してください。

ログは、可能であればシステム管理者が理解できるものであるべきです。

ログに罵り言葉（スラング・卑語）を使用しないでください。

ログでは UTF-8 エンコーディングを使用してください。まれなケースでは、ログ内で非 ASCII 文字を使用してもかまいません。

**20.** 入出力。

アプリケーション性能にとって重要な内部ループで `iostreams` を使用しないでください（`stringstream` は決して使用しないでください）。

代わりに `DB/IO` ライブラリを使用してください。

**21.** 日付と時刻。

`DateLUT` ライブラリを参照してください。

**22.** include。

インクルードガードの代わりに、常に `#pragma once` を使用してください。

**23.** using。

`using namespace` は使用しません。特定のものに対して `using` を使うことはできますが、クラスまたは関数のローカルに限定してください。

**24.** 必要な場合を除き、関数に `trailing return type` を使用しないでください。

```cpp
auto f() -> void
```

**25.** 変数の宣言と初期化。

```cpp
//right way
std::string s = "Hello";
std::string s{"Hello"};

//wrong way
auto s = std::string{"Hello"};
```

**26.** 仮想関数を宣言する場合、基底クラスでは `virtual` を記述し、派生クラスでは `virtual` の代わりに `override` を記述します。

## C++で使用しない機能 {#unused-features-of-c}

**1.** 仮想継承は用いない。

**2.** 現代的なC++で便利なシンタックスシュガーが用意されているような構文は使用しない。例:

```cpp
// Traditional way without syntactic sugar
template <typename G, typename = std::enable_if_t<std::is_same<G, F>::value, void>> // SFINAE via std::enable_if, usage of ::value
std::pair<int, int> func(const E<G> & e) // explicitly specified return type
{
    if (elements.count(e)) // .count() membership test
    {
        // ...
    }

    elements.erase(
        std::remove_if(
            elements.begin(), elements.end(),
            [&](const auto x){
                return x == 1;
            }),
        elements.end()); // remove-erase idiom

    return std::make_pair(1, 2); // create pair via make_pair()
}

// With syntactic sugar (C++14/17/20)
template <typename G>
requires std::same_v<G, F> // SFINAE via C++20 concept, usage of C++14 template alias
auto func(const E<G> & e) // auto return type (C++14)
{
    if (elements.contains(e)) // C++20 .contains membership test
    {
        // ...
    }

    elements.erase_if(
        elements,
        [&](const auto x){
            return x == 1;
        }); // C++20 std::erase_if

    return {1, 2}; // or: return std::pair(1, 2); // create pair via initialization list or value initialization (C++17)
}
```

## プラットフォーム {#platform}

**1.** 特定のプラットフォームを対象としてコードを書きます。

ただし、その他の条件が同じであれば、クロスプラットフォームまたは移植性の高いコードであることが望まれます。

**2.** 言語: C++20（利用可能な [C++20 機能の一覧](https://en.cppreference.com/w/cpp/compiler_support#C.2B.2B20_features) を参照）。

**3.** コンパイラ: `clang`。執筆時点（2025 年 3 月）では、コードはバージョン 19 以上の clang でコンパイルされています。

標準ライブラリとして `libc++` を使用します。

**4.** OS: Linux Ubuntu（Precise 以降）。

**5.** コードは x86_64 CPU アーキテクチャ向けに記述します。

CPU の命令セットは、当社サーバー群で共通してサポートされている最小構成とします。現在は SSE 4.2 です。

**6.** 一部の例外を除いて、コンパイルフラグとして `-Wall -Wextra -Werror -Weverything` を使用します。

**7.** 静的リンクするのが困難なライブラリ（`ldd` コマンドの出力を参照）を除き、すべてのライブラリを静的リンクします。

**8.** コードはリリースビルド設定で開発およびデバッグします。

## ツール {#tools}

**1.** KDevelop は優れた IDE です。

**2.** デバッグには `gdb`、`valgrind`（`memcheck`）、`strace`、`-fsanitize=...`、または `tcmalloc_minimal_debug` を使用します。

**3.** プロファイリングには `Linux Perf`、`valgrind`（`callgrind`）、または `strace -cf` を使用します。

**4.** ソースコードは Git リポジトリで管理します。

**5.** ビルドには `CMake` を使用します。

**6.** プログラムは `deb` パッケージとしてリリースされます。

**7.** master ブランチへのコミットでビルドを壊してはいけません。

ただし、実用に耐えるとみなされるのは選別されたリビジョンのみです。

**8.** コードが一部しかできていなくても、できるだけ頻繁にコミットしてください。

そのためにブランチを使用します。

`master` ブランチ内のコードがまだビルド可能でない場合は、`push` の前にビルド対象から除外してください。数日以内に仕上げるか削除する必要があります。

**9.** 些細でない変更にはブランチを使用し、それらをサーバーに公開します。

**10.** 使われていないコードはリポジトリから削除します。

## ライブラリ {#libraries}

**1.** C++20 標準ライブラリ（実験的な拡張も許可）に加えて、`boost` および `Poco` フレームワークを使用します。

**2.** OS パッケージに含まれるライブラリの使用は許可されません。事前にインストールされたライブラリの使用も許可されません。すべてのライブラリは `contrib` ディレクトリ内にソースコードの形で配置し、ClickHouse と一緒にビルドする必要があります。詳細については、[新しいサードパーティライブラリの追加に関するガイドライン](/development/contrib#adding-and-maintaining-third-party-libraries) を参照してください。

**3.** 既に利用されているライブラリが常に優先されます。

## 一般的な推奨事項 {#general-recommendations-1}

**1.** 可能な限りコード量を減らすこと。

**2.** まずは最も単純な解決方法を試すこと。

**3.** そのコードがどのように動作し、インナーループがどのように機能するかを把握するまでは、コードを書かないこと。

**4.** 最も単純なケースでは、クラスや構造体の代わりに `using` を使用すること。

**5.** 可能であれば、コピーコンストラクタ、代入演算子、デストラクタ（クラスに少なくとも 1 つの仮想関数が含まれる場合の仮想デストラクタを除く）、ムーブコンストラクタ、ムーブ代入演算子は記述しないこと。言い換えると、コンパイラ生成の関数が正しく動作するようにしておくこと。`= default` を使用してよい。

**6.** コードの単純化を心がけること。可能な限りコードのサイズを削減すること。

## 追加の推奨事項 {#additional-recommendations}

**1.** `stddef.h` に含まれる型に対して `std::` を明示的に指定すること

は推奨しません。言い換えると、`std::size_t` ではなく `size_t` と書くことを推奨します。その方が短いからです。

もちろん、`std::` を付けても問題ありません。

**2.** 標準 C ライブラリの関数に対して `std::` を明示的に指定すること

は推奨しません。言い換えると、`std::memcpy` ではなく `memcpy` と書いてください。

その理由は、`memmem` のような非標準の類似関数が存在するためです。これらの関数を使用することもありますが、`namespace std` には存在しません。

もしあらゆる箇所で `memcpy` の代わりに `std::memcpy` と書いた場合、`std::` を付けない `memmem` が不自然に見えてしまいます。

とはいえ、好みによって `std::` を使っても構いません。

**3.** 同じものが標準 C++ ライブラリにもある場合に、C の関数を使用すること。

より効率的であれば許容されます。

例えば、大きなメモリ領域をコピーする場合には、`std::copy` の代わりに `memcpy` を使用してください。

**4.** 複数行にまたがる関数引数。

次のいずれの折り返しスタイルも許可されます。

```cpp
function(
  T1 x1,
  T2 x2)
```

```cpp
function(
  size_t left, size_t right,
  const & RangesInDataParts ranges,
  size_t limit)
```

```cpp
function(size_t left, size_t right,
  const & RangesInDataParts ranges,
  size_t limit)
```

```cpp
function(size_t left, size_t right,
      const & RangesInDataParts ranges,
      size_t limit)
```

```cpp
function(
      size_t left,
      size_t right,
      const & RangesInDataParts ranges,
      size_t limit)
```
