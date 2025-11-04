---
'description': 'ClickHouse C++ 開発のコーディングスタイルガイドライン'
'sidebar_label': 'C++ スタイルガイド'
'sidebar_position': 70
'slug': '/development/style'
'title': 'C++ スタイルガイド'
'doc_type': 'guide'
---


# C++スタイルガイド

## 一般的な推奨事項 {#general-recommendations}

以下は推奨事項であり、要件ではありません。
コードを編集している場合、既存のコードのフォーマットに従うことが理にかなっています。
コードスタイルは一貫性を保つために必要です。一貫性はコードを読みやすくし、検索を容易にします。
多くのルールには論理的な理由がない場合があります。それらは確立された慣行によって決まっています。

## フォーマット {#formatting}

**1.** フォーマットは主に `clang-format` によって自動的に行われます。

**2.** インデントは4スペースです。タブが4スペースを追加するように開発環境を設定してください。

**3.** 開始波括弧と終了波括弧は別の行に置く必要があります。

```cpp
inline void readBoolText(bool & x, ReadBuffer & buf)
{
    char tmp = '0';
    readChar(tmp, buf);
    x = tmp != '0';
}
```

**4.** 関数の本体全体が単一の `statement` である場合、それを1行に置くことができます。波括弧の周りにスペースを置いてください（行の最後のスペースを除く）。

```cpp
inline size_t mask() const                { return buf_size() - 1; }
inline size_t place(HashValue x) const    { return x & mask(); }
```

**5.** 関数の場合。括弧の周りにスペースを置かないでください。

```cpp
void reinsert(const Value & x)
```

```cpp
memcpy(&buf[place_value], &x, sizeof(x));
```

**6.** `if`、`for`、`while` およびその他の式では、開始括弧の前にスペースが挿入されます（関数呼び出しとは異なります）。

```cpp
for (size_t i = 0; i < rows; i += storage.index_granularity)
```

**7.** 二項演算子 (`+`, `-`, `*`, `/`, `%`, ...) および三項演算子 `?:` の周りにスペースを追加してください。

```cpp
UInt16 year = (s[0] - '0') * 1000 + (s[1] - '0') * 100 + (s[2] - '0') * 10 + (s[3] - '0');
UInt8 month = (s[5] - '0') * 10 + (s[6] - '0');
UInt8 day = (s[8] - '0') * 10 + (s[9] - '0');
```

**8.** 行フィードが入力される場合、演算子を新しい行に置き、その前にインデントを増やします。

```cpp
if (elapsed_ns)
    message << " ("
        << rows_read_on_server * 1000000000 / elapsed_ns << " rows/s., "
        << bytes_read_on_server * 1000.0 / elapsed_ns << " MB/s.) ";
```

**9.** 必要に応じて、行内の整列のためにスペースを使用することができます。

```cpp
dst.ClickLogID         = click.LogID;
dst.ClickEventID       = click.EventID;
dst.ClickGoodEvent     = click.GoodEvent;
```

**10.** 演算子 `.`, `->` の周りにスペースを使用しないでください。

必要に応じて、演算子は次の行にラップすることができます。この場合、前のオフセットが増加します。

**11.** 単項演算子 (`--`, `++`, `*`, `&`, ...) と引数の間にスペースを使用しないでください。

**12.** コンマの後にスペースを置きますが、前には置かないでください。同じルールは `for` 式の中のセミコロンにも適用されます。

**13.** `[]` 演算子の間にスペースを使用しないでください。

**14.** `template <...>` 式では、`template` と `<` の間にスペースを使用し、`<` の後や `>` の前にはスペースを置かないでください。

```cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
{}
```

**15.** クラスと構造体では、`public`、`private`、および `protected` を `class/struct` と同じレベルに書き、残りのコードをインデントします。

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

**16.** ファイル全体で同じ `namespace` を使用する場合、重要な他の要素がない限り、`namespace` 内でオフセットは必要ありません。

**17.** `if`、`for`、`while` またはその他の式のブロックが単一の `statement` で構成される場合、波括弧はオプションです。代わりに `statement` を別の行に置いてください。このルールは、入れ子になった `if`、`for`、`while` にも有効です。

しかし、内部の `statement` が波括弧や `else` を含む場合、外部ブロックは波括弧で書くべきです。

```cpp
/// Finish write.
for (auto & stream : streams)
    stream.second->finalize();
```

**18.** 行の終わりにはスペースを置かないでください。

**19.** ソースファイルはUTF-8でエンコードされています。

**20.** 文字列リテラルに非ASCII文字を使用できます。

```cpp
<< ", " << (timer.elapsed() / chunks_stats.hits) << " μsec/hit.";
```

**21.** 単一の行に複数の式を書かないでください。

**22.** 関数内のコードのセクションをグループ化し、1行の空行で分けてください。

**23.** 関数やクラスなどは1行または2行の空行で分けてください。

**24.** 値に関連する `A const` は型名の前に書く必要があります。

```cpp
//correct
const char * pos
const std::string & s
//incorrect
char const * pos
```

**25.** ポインタまたは参照を宣言する際は、`*` および `&` の記号を両側にスペースを挟んで separating します。

```cpp
//correct
const char * pos
//incorrect
const char* pos
const char *pos
```

**26.** テンプレート型を使用する場合、それらを `using` キーワードでエイリアスします（最も単純なケースを除く）。

言い換えれば、テンプレートパラメータは `using` でのみ指定され、コード内で繰り返されることはありません。

`using` は関数内などでローカルに宣言できます。

```cpp
//correct
using FileStreams = std::map<std::string, std::shared_ptr<Stream>>;
FileStreams streams;
//incorrect
std::map<std::string, std::shared_ptr<Stream>> streams;
```

**27.** 異なる型の変数を1つの文で宣言しないでください。

```cpp
//incorrect
int x, *y;
```

**28.** Cスタイルのキャストを使用しないでください。

```cpp
//incorrect
std::cerr << (int)c <<; std::endl;
//correct
std::cerr << static_cast<int>(c) << std::endl;
```

**29.** クラスと構造体では、メンバーと関数を各可視性スコープ内で別々にグループ化します。

**30.** 小さなクラスや構造体では、メソッド宣言と実装を分ける必要はありません。

これは、任意のクラスや構造体の小さなメソッドにも当てはまります。

テンプレートクラスや構造体の場合、メソッド宣言と実装を分けないでください（そうしないと、同じ翻訳ユニットで定義される必要があります）。

**31.** 140文字で行をラップできますが、80文字ではありません。

**32.** 後置が必要でない限り、常に前置インクリメント/デクリメント演算子を使用してください。

```cpp
for (Names::const_iterator it = column_names.begin(); it != column_names.end(); ++it)
```

## コメント {#comments}

**1.** コードのすべての非自明な部分にコメントを追加することを確認してください。

これは非常に重要です。コメントを書くことで、そのコードが必要ないことや、設計が間違っていることを認識するのに役立つことがあります。

```cpp
/** Part of piece of memory, that can be used.
  * For example, if internal_buffer is 1MB, and there was only 10 bytes loaded to buffer from file for reading,
  * then working_buffer will have size of only 10 bytes
  * (working_buffer.end() will point to position right after those 10 bytes available for read).
  */
```

**2.** コメントは必要に応じて詳細に記述できます。

**3.** コメントは、それが説明するコードの前に置きます。稀に、コメントがコードの後、同じ行に来ることがあります。

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

**4.** コメントは英語のみで書くべきです。

**5.** ライブラリを書いている場合は、それを説明する詳細なコメントをメインヘッダーファイルに含めてください。

**6.** 追加情報を提供しないコメントを追加しないでください。特に、次のような空のコメントを残さないでください：

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

この例は、リソース http://home.tamk.fi/~jaalto/course/coding-style/doc/unmaintainable-code/ から借用しました。

**7.** 各ファイルの先頭に雑多なコメント（著者、作成日など）を書かないでください。

**8.** 単一行コメントは3つのスラッシュ `///` で始まり、複数行コメントは `/**` で始まります。これらのコメントは「ドキュメント」と見なされます。

注: これらのコメントからドキュメントを生成するためにDoxygenを使用できます。ただし、Doxygenは一般にはあまり使用されません。なぜなら、IDE内のコードをナビゲートするほうが便利だからです。

**9.** 複数行コメントの最初と最後に空行を挿入してはいけません（複数行コメントを閉じる行を除く）。

**10.** コードをコメントアウトする場合は、基本的なコメントを使用し、「ドキュメント」コメントは使用しないでください。

**11.** コミットする前に、コメントアウトされたコードの部分を削除してください。

**12.** コメントやコード内に不適切な表現を使用しないでください。

**13.** 大文字を使用しないでください。過度な句読点を使用しないでください。

```cpp
/// WHAT THE FAIL???
```

**14.** デリミタを作るためにコメントを使用しないでください。

```cpp
///******************************************************
```

**15.** コメント内で議論を始める必要はありません。

```cpp
/// Why did you do this stuff?
```

**16.** ブロックの終わりでその内容についてのコメントを書く必要はありません。

```cpp
/// for
```

## 名前 {#names}

**1.** 変数とクラスメンバーの名前には、小文字の文字とアンダースコアを使用してください。

```cpp
size_t max_block_size;
```

**2.** 関数（メソッド）の名前には小文字で始まる camelCase を使用してください。

```cpp
std::string getName() const override { return "Memory"; }
```

**3.** クラス（構造体）の名前には大文字で始まる CamelCase を使用してください。インターフェースには I 以外のプレフィックスは使用しません。

```cpp
class StorageMemory : public IStorage
```

**4.** `using` はクラスと同じ方法で命名します。

**5.** テンプレート型引数の名前: 簡単なケースでは `T`; `T`, `U`; `T1`, `T2` を使用します。

より複雑なケースでは、クラス名のルールに従うか、プレフィックス `T` を追加します。

```cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
```

**6.** テンプレート定数引数の名前: 変数名のルールに従うか、簡単なケースでは `N` を使用します。

```cpp
template <bool without_www>
struct ExtractDomain
```

**7.** 抽象クラス（インターフェース）には `I` プレフィックスを追加できます。

```cpp
class IProcessor
```

**8.** 変数をローカルに使用する場合は、短い名前を使用できます。

他のすべてのケースでは、意味を説明する名前を使用してください。

```cpp
bool info_successfully_loaded = false;
```

**9.** `define` とグローバル定数の名前には、ALL_CAPSとアンダースコアを使用します。

```cpp
#define MAX_SRC_TABLE_NAMES_TO_STORE 1000
```

**10.** ファイル名はその内容と同じスタイルを使用すべきです。

ファイルが単一のクラスを含む場合、そのファイルはそのクラスと同じ名前（CamelCase）で命名します。

ファイルが単一の関数を含む場合、そのファイルはその関数と同じ名前（camelCase）で命名します。

**11.** 名前に略語が含まれている場合:

- 変数名の場合、略語は小文字で使用するべきです `mysql_connection`（`mySQL_connection`ではなく）。
- クラスおよび関数の名前の場合、略語の大文字を保持します `MySQLConnection`（`MySqlConnection`ではなく）。

**12.** クラスメンバーを初期化するためだけに使用されるコンストラクタ引数は、クラスメンバーと同じ名前にする必要がありますが、末尾にアンダースコアを付けます。

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

アンダースコアの接尾辞は、引数がコンストラクタ本体で使用されていない場合は省略できます。

**13.** ローカル変数とクラスメンバーの名前には違いはありません（プレフィックスは必要ありません）。

```cpp
timer (not m_timer)
```

**14.** `enum` の定数には、CamelCase の大文字を使用します。ALL_CAPSも許容されます。`enum` が非ローカルの場合、`enum class` を使用します。

```cpp
enum class CompressionMethod
{
    QuickLZ = 0,
    LZ4     = 1,
};
```

**15.** すべての名前は英語でなければなりません。ヘブライ語の単語を音訳することは許可されていません。

    not T_PAAMAYIM_NEKUDOTAYIM

**16.** よく知られている（Wikipediaや検索エンジンで簡単に意味を見つけられる）略語は許容されます。

    `AST`, `SQL`.

    Not `NVDH` (いくつかのランダムな文字)

一般的に使われる略語であれば不完全な単語も許容されます。

コメント内に完全な名前を含む場合も、略語を使用することができます。

**17.** C++ソースコードを含むファイルは `.cpp` 拡張子を持つ必要があります。ヘッダーファイルは `.h` 拡張子を持つ必要があります。

## コードの書き方 {#how-to-write-code}

**1.** メモリ管理。

手動でのメモリ解放（`delete`）はライブラリコードでのみ使用できます。

ライブラリコード内では、`delete` 演算子はデストラクタ内でのみ使用できます。

アプリケーションコードでは、メモリはそれを所有するオブジェクトによって解放されなければなりません。

例：

- 最も簡単な方法は、オブジェクトをスタックに置くか、別のクラスのメンバーにすることです。
- 多数の小さなオブジェクトには、コンテナを使用します。
- ヒープ内の少数のオブジェクトを自動的に解放するために、`shared_ptr/unique_ptr` を使用します。

**2.** リソース管理。

`RAII` を使用し、上記を参照してください。

**3.** エラーハンドリング。

例外を使用します。ほとんどの場合、例外をスローするだけで、キャッチする必要はありません（`RAII` のため）。

オフラインデータ処理アプリケーションでは、例外をキャッチしないことがしばしば許容されます。

ユーザー要求を処理するサーバーでは、接続ハンドラの最上位で例外をキャッチするだけで通常は十分です。

スレッド関数では、すべての例外をキャッチし、保持して、`join` の後にメインスレッドで再スローする必要があります。

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

例外を処理せずに隠さないでください。すべての例外を盲目的にログに記録しないでください。

```cpp
//Not correct
catch (...) {}
```

特定の例外を無視する必要がある場合は、特定のものに対してのみ行い、残りは再スローしてください。

```cpp
catch (const DB::Exception & e)
{
    if (e.code() == ErrorCodes::UNKNOWN_AGGREGATE_FUNCTION)
        return nullptr;
    else
        throw;
}
```

応答コードや `errno` を持つ関数を使用する場合は、常に結果をチェックし、エラーが発生した場合は例外をスローしてください。

```cpp
if (0 != close(fd))
    throw ErrnoException(ErrorCodes::CANNOT_CLOSE_FILE, "Cannot close file {}", file_name);
```

コード内の不変条件をチェックするために assert を使用することができます。

**4.** 例外の種類。

アプリケーションコードで複雑な例外階層を使用する必要はありません。例外メッセージはシステム管理者に理解できるものであるべきです。

**5.** デストラクタからの例外スロー。

これは推奨されませんが、許可されています。

次のオプションを使用します：

- すべての例外を引き起こす可能性がある作業を事前に行う関数を作成します（`done()`または`finalize()`）。その関数が呼び出された場合、その後のデストラクタ内には例外がないはずです。
- あまりに複雑なタスク（ネットワーク越しのメッセージ送信など）は、クラスユーザーが破棄前に呼び出さなければならない別のメソッドに入れます。
- デストラクタ内で例外が発生した場合、それを隠すよりはログに記録する方が良いでしょう（ロガーが使用可能な場合）。
- 簡単なアプリケーションでは、例外を処理するために `std::terminate` に依存することが許容されます（C++11 のデフォルトで `noexcept` の場合）。

**6.** 無名コードブロック。

特定の変数をローカルにするために、1つの関数内に別のコードブロックを作成できるので、ブロックを抜ける際にデストラクタが呼び出されるようにします。

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

オフラインデータ処理プログラムでは：

- 単一CPUコアで可能な限り最高のパフォーマンスを得るようにしてください。その後、必要に応じてコードを並行化できます。

サーバーアプリケーションでは：

- スレッドプールを使用して要求を処理します。この時点では、ユーザースペースのコンテキストスイッチが必要なタスクはありません。

フォークは並列化には使用されません。

**8.** スレッドの同期。

異なるスレッドが異なるメモリセル（できれば異なるキャッシュライン）を使用し、スレッドの同期を行わないことも可能です（`joinAll`を除く）。

同期が必要な場合、ほとんどの場合、`lock_guard` の下でミューテックスを使用するだけで十分です。

他のケースでは、システム同期プリミティブを使用してください。ビジーウェイトを使用しないでください。

原子的操作は最も単純なケースでのみ使用すべきです。

主な専門分野でない限り、ロックフリーのデータ構造を実装しようとしないでください。

**9.** ポインタと参照。

ほとんどの場合、参照を好みます。

**10.** `const`。

定数参照、定数ポインタ、`const_iterator`、および `const` メソッドを使用してください。

`const` をデフォルトと見なし、必要な場合にのみ非 `const` を使用してください。

値を引数として渡す場合、`const` を使用することは通常意味がありません。

**11.** unsigned。

必要であれば `unsigned` を使用する。

**12.** 数値型。

`UInt8`、`UInt16`、`UInt32`、`UInt64`、`Int8`、`Int16`、`Int32`、および `Int64`、さらに `size_t`、`ssize_t`、および `ptrdiff_t` の型を使用してください。

これらの型を数字に使用しないでください：`signed/unsigned long`、`long long`、`short`、`signed/unsigned char`、`char`。

**13.** 引数の渡し方。

複雑な値は値で渡し、移動する予定がある場合は `std::move` を使用してください。ループ内で値を更新したい場合は参照で渡してください。

ヒープ内のオブジェクトの所有権を取得する関数がある場合、引数の型は `shared_ptr` または `unique_ptr` にしてください。

**14.** 戻り値。

ほとんどの場合、単に `return` を使用します。`return std::move(res)` と書かないでください。

関数がヒープ上にオブジェクトを割り当てて返す場合は、`shared_ptr` または `unique_ptr` を使用します。

稀なケース（ループでの値の更新）では、引数を介して値を返す必要があるかもしれません。この場合、引数は参照であるべきです。

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

**15.** `namespace`.

アプリケーションコードに独立した `namespace` を使用する必要はありません。

小さなライブラリでもこれは必要ありません。

中規模から大規模のライブラリでは、すべてを `namespace` に入れてください。

ライブラリの `.h` ファイル内では、アプリケーションコードに必要ない実装の詳細を隠すために `namespace detail` を使用できます。

`.cpp` ファイル内では、シンボルを隠すために `static` または無名の `namespace` を使用できます。

また、`enum` 用に `namespace` を使用して、対応する名前が外部の `namespace` に入るのを防ぐことができます（しかし、`enum class` を使用する方が良いです）。

**16.** 遅延初期化。

初期化に引数が必要な場合、通常はデフォルトコンストラクタを書くべきではありません。

後で初期化を遅らせる必要がある場合、無効なオブジェクトを作成するデフォルトコンストラクタを追加できます。または、少数のオブジェクトの場合、`shared_ptr/unique_ptr` を使用できます。

```cpp
Loader(DB::Connection * connection_, const std::string & query, size_t max_block_size_);

/// For deferred initialization
Loader() {}
```

**17.** 仮想関数。

クラスが多態的に使用されることを意図していない場合、関数を仮想にする必要はありません。これはデストラクタにも当てはまります。

**18.** エンコーディング。

どこでも UTF-8 を使用してください。`std::string` と `char *` を使用してください。`std::wstring` および `wchar_t` は使用しないでください。

**19.** ロギング。

コード内のすべての例を参照してください。

コミットする前に、意味のないデバッグログや、他のデバッグ出力を削除してください。

ループ内でのロギングは避けるべきです、トレースレベルでもです。

ログは、あらゆるロギングレベルで読みやすいものでなければなりません。

ロギングは主にアプリケーションコードのみで使用されるべきです。

ログメッセージは英語で書かれるべきです。

ログは、できればシステム管理者に理解できるものであるべきです。

ログに不適切な表現を使用しないでください。

ログ内ではUTF-8エンコーディングを使用してください。稀にログで非ASCII文字を使用することができます。

**20.** 入出力。

アプリケーションのパフォーマンスに重要な内部ループで `iostreams` を使用しないでください（`stringstream` は決して使用しないでください）。

代わりに `DB/IO` ライブラリを使用してください。

**21.** 日付と時刻。

`DateLUT` ライブラリを参照してください。

**22.** include。

インクルードガードの代わりに必ず `#pragma once` を使用してください。

**23.** using。

`using namespace` は使用しません。特定のものとともに `using` を使用できます。しかし、クラス内や関数内にローカルにしておいてください。

**24.** 必要でない限り、関数のために `trailing return type` を使用しないでください。

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

**26.** 仮想関数の場合、基底クラスに `virtual` を書きますが、派生クラスには `virtual` の代わりに `override` を書きます。

## C++の未使用機能 {#unused-features-of-c}

**1.** 仮想継承は使用されません。

**2.** 現代のC++で便利な構文糖がある構造（例：

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

**1.** 特定のプラットフォーム向けにコードを書いています。

ただし、他が等しい場合は、クロスプラットフォームまたはポータブルコードが好まれます。

**2.** 言語：C++20（使用可能な[C++20機能のリスト](https://en.cppreference.com/w/cpp/compiler_support#C.2B.2B20_features)を参照）。

**3.** コンパイラ：`clang`。執筆時（2025年3月）には、コードはclangバージョン>=19でコンパイルされています。

標準ライブラリが使用されています（`libc++`）。

**4.** OS：Linux Ubuntu、Precise以降。

**5.** コードはx86_64 CPUアーキテクチャ向けに書かれています。

CPU命令セットは、当社のサーバーの中で最小限サポートされているセットです。現在はSSE 4.2です。

**6.** いくつかの例外を除いて、`-Wall -Wextra -Werror -Weverything` コンパイルフラグを使用してください。

**7.** 静的リンクをすべてのライブラリに使用しますが、静的に接続するのが難しいライブラリは除きます（`ldd` コマンドの出力を参照）。

**8.** コードはリリース設定で開発され、デバッグされます。

## ツール {#tools}

**1.** KDevelop は良いIDEです。

**2.** デバッグには `gdb`、`valgrind`（`memcheck`）、`strace`、`-fsanitize=...`、または `tcmalloc_minimal_debug` を使用します。

**3.** プロファイリングには `Linux Perf`、`valgrind`（`callgrind`）、または `strace -cf` を使用します。

**4.** ソースはGitにあります。

**5.** アセンブリは `CMake` を使用します。

**6.** プログラムは `deb` パッケージを使用してリリースされます。

**7.** master へのコミットはビルドを壊さないようにします。

ただし、選択されたリビジョンのみが作業可能と見なされます。

**8.** コードが部分的に準備ができている場合でも、できるだけ頻繁にコミットを行います。

この目的のためにブランチを使用してください。

master ブランチのコードがまだビルド可能でない場合、`push` 前にビルドから除外してください。数日内にそれを完了または削除する必要があります。

**9.** 難易度の高い変更にはブランチを使用し、サーバー上に公開します。

**10.** 使用されていないコードはリポジトリから削除されます。

## ライブラリ {#libraries}

**1.** C++20 標準ライブラリが使用されており（実験的拡張は許可されている）、`boost` および `Poco` フレームワークも使用されています。

**2.** OS パッケージからのライブラリの使用は禁止されています。また、プリインストールされたライブラリの使用も許可されていません。すべてのライブラリは `contrib` ディレクトリにソースコードの形で配置され、ClickHouseでビルドされるべきです。詳細は [新しいサードパーティライブラリの追加に関するガイドライン](/development/contrib#adding-and-maintaining-third-party-libraries)を参照してください。

**3.** 既に使用されているライブラリが常に優先されます。

## 一般的な推奨事項 {#general-recommendations-1}

**1.** できるだけ少ないコードを書くようにします。

**2.** 最も簡単な解決策を試してみてください。

**3.** コードがどのように機能するか、内側のループがどのように機能するかがわかるまでコードを書くべきではありません。

**4.** 最も簡単なケースでは、クラスや構造体の代わりに `using` を使用してください。

**5.** 可能であれば、コピーコンストラクタ、代入演算子、デストラクタ（少なくとも1つの仮想関数を含むクラスに対する仮想のもの以外）、移動コンストラクタや移動代入演算子は書かないでください。別の言い方をすると、コンパイラ生成の関数が正しく機能する必要があります。`default`を使用することができます。

**6.** コードの簡素化が促進されます。可能な場合は、コードのサイズを減らしてください。

## 追加の推奨事項 {#additional-recommendations}

**1.** `stddef.h` の型に対して `std::` を明示的に指定することは推奨されません。言い換えれば、`std::size_t` の代わりに `size_t` を記述することをお勧めします、なぜならそれが短いからです。

`std::`を追加することは許可されています。

**2.** 標準Cライブラリからの関数に対して `std::` を明示的に指定することは推奨されません。言い換えれば、`std::memcpy` の代わりに `memcpy` を記述することをお勧めします。

理由は、`memmem` のような類似の非標準の関数が存在するためです。これらの関数は時折使用されます。これらの関数は `namespace std` には存在しません。

どこでも `std::memcpy` を書くと、`memmem` なしの `std::` は奇妙に見えるでしょう。

ただし、`std::` を使用することが好ましい場合は、引き続き使用できます。

**3.** 標準C++ライブラリで利用可能なものがある場合は、Cの関数を使用することが許容されます。

たとえば、大きなメモリチャンクをコピーする場合は `std::copy` の代わりに `memcpy` を使用してください。

**4.** 複数行関数引数。

次のラッピングスタイルのいずれかが許可されています：

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
