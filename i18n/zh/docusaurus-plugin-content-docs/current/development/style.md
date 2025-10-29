---
'description': 'ClickHouse C++ 开发的编码风格准则'
'sidebar_label': 'C++ 风格指南'
'sidebar_position': 70
'slug': '/development/style'
'title': 'C++ 风格指南'
'doc_type': 'guide'
---


# C++ 风格指南

## 一般建议 {#general-recommendations}

以下是建议，而非要求。
如果您正在编辑代码，遵循现有代码的格式是有意义的。
代码风格是为了保持一致性。一致性使得阅读代码变得更容易，也使得代码搜索变得更简单。
许多规则并没有逻辑理由；它们是由既定惯例所决定的。

## 格式化 {#formatting}

**1.** 大部分格式化由 `clang-format` 自动执行。

**2.** 缩进为 4 个空格。配置您的开发环境，使制表符增加四个空格。

**3.** 开始和结束的花括号必须在单独的一行上。

```cpp
inline void readBoolText(bool & x, ReadBuffer & buf)
{
    char tmp = '0';
    readChar(tmp, buf);
    x = tmp != '0';
}
```

**4.** 如果整个函数体是单个 `statement`，则可以放在一行。花括号周围要加空格（除了行尾的空格）。

```cpp
inline size_t mask() const                { return buf_size() - 1; }
inline size_t place(HashValue x) const    { return x & mask(); }
```

**5.** 对于函数，括号周围不加空格。

```cpp
void reinsert(const Value & x)
```

```cpp
memcpy(&buf[place_value], &x, sizeof(x));
```

**6.** 在 `if`、`for`、`while` 和其他表达式中，在开括号前插入空格（与函数调用相反）。

```cpp
for (size_t i = 0; i < rows; i += storage.index_granularity)
```

**7.** 在二元运算符（`+`、`-`、`*`、`/`、`%`，...）和三元运算符 `?:` 周围加空格。

```cpp
UInt16 year = (s[0] - '0') * 1000 + (s[1] - '0') * 100 + (s[2] - '0') * 10 + (s[3] - '0');
UInt8 month = (s[5] - '0') * 10 + (s[6] - '0');
UInt8 day = (s[8] - '0') * 10 + (s[9] - '0');
```

**8.** 如果输入了换行，操作符放在新的一行，并在其前面增加缩进。

```cpp
if (elapsed_ns)
    message << " ("
        << rows_read_on_server * 1000000000 / elapsed_ns << " rows/s., "
        << bytes_read_on_server * 1000.0 / elapsed_ns << " MB/s.) ";
```

**9.** 如果需要，可以在一行内使用空格对齐。

```cpp
dst.ClickLogID         = click.LogID;
dst.ClickEventID       = click.EventID;
dst.ClickGoodEvent     = click.GoodEvent;
```

**10.** 不要在运算符 `.` 和 `->` 周围使用空格。

如有必要，运算符可以换到下一行。在这种情况下，前面的缩进要增加。

**11.** 不要用空格将一元运算符（`--`、`++`、`*`、`&`，...）与参数分开。

**12.** 在逗号后加空格，但在逗号前不加。对于 `for` 表达式中的分号也是同理。

**13.** 不要使用空格分隔 `[]` 运算符。

**14.** 在 `template <...>` 表达式中，在 `template` 和 `<` 之间使用空格；在 `<` 之后或 `>` 之前不加空格。

```cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
{}
```

**15.** 在类和结构中，`public`、`private` 和 `protected` 应与 `class/struct` 在同一水平，并缩进其余代码。

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

**16.** 如果整个文件使用同一个 `namespace`，并且没有其他重要内容，则在 `namespace` 内部不必缩进。

**17.** 如果 `if`、`for`、`while` 或其他表达式的块仅由一个 `statement` 构成，花括号是可选的。将 `statement` 放在单独的一行上。这条规则同样适用于嵌套的 `if`、`for`、`while`，...

但如果内部的 `statement` 包含花括号或 `else`，外部块应该用花括号书写。

```cpp
/// Finish write.
for (auto & stream : streams)
    stream.second->finalize();
```

**18.** 行尾不应有空格。

**19.** 源文件使用 UTF-8 编码。

**20.** 字符串字面量中可以使用非 ASCII 字符。

```cpp
<< ", " << (timer.elapsed() / chunks_stats.hits) << " μsec/hit.";
```

**21.** 不要在单行内写多个表达式。

**22.** 在函数内部对代码段进行分组，并用最多一行空行分隔它们。

**23.** 用一到两个空行分隔函数、类等。

**24.** `A const`（与值相关）必须在类型名称之前书写。

```cpp
//correct
const char * pos
const std::string & s
//incorrect
char const * pos
```

**25.** 声明指针或引用时，`*` 和 `&` 符号应在两边都加空格。

```cpp
//correct
const char * pos
//incorrect
const char* pos
const char *pos
```

**26.** 使用模板类型时，用 `using` 关键字进行别名（除了最简单的情况）。

换句话说，模板参数仅在 `using` 中指定，而不会在代码中重复。

`using` 可以在局部声明，例如在函数内部。

```cpp
//correct
using FileStreams = std::map<std::string, std::shared_ptr<Stream>>;
FileStreams streams;
//incorrect
std::map<std::string, std::shared_ptr<Stream>> streams;
```

**27.** 不要在一个语句中声明多个不同类型的变量。

```cpp
//incorrect
int x, *y;
```

**28.** 不要使用 C 风格的强制转换。

```cpp
//incorrect
std::cerr << (int)c <<; std::endl;
//correct
std::cerr << static_cast<int>(c) << std::endl;
```

**29.** 在类和结构中，按每个可见性范围分别分组成员和函数。

**30.** 对于小型类和结构，无需将方法声明与实现分开。

同样，任何类或结构中的小型方法也是如此。

对于模板类和结构，不要将方法声明与实现分开（因为否则它们必须在同一个翻译单元中定义）。

**31.** 可以将行换行至 140 个字符，而不是 80。

**32.** 如果不需要后缀，始终使用前缀自增/自减运算符。

```cpp
for (Names::const_iterator it = column_names.begin(); it != column_names.end(); ++it)
```

## 注释 {#comments}

**1.** 确保为所有非平凡代码部分添加注释。

这非常重要。写注释可能会帮助您意识到代码是不必要的，或是设计不正确的。

```cpp
/** Part of piece of memory, that can be used.
  * For example, if internal_buffer is 1MB, and there was only 10 bytes loaded to buffer from file for reading,
  * then working_buffer will have size of only 10 bytes
  * (working_buffer.end() will point to position right after those 10 bytes available for read).
  */
```

**2.** 注释可以详细到必要的程度。

**3.** 在描述它们的代码之前放置注释。在少数情况下，注释可以在代码后面，位于同一行。

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

**4.** 注释应仅用英语书写。

**5.** 如果您正在编写库，请在主头文件中包含详细注释进行说明。

**6.** 不要添加不提供附加信息的注释。特别是，不要留空注释，如下：

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

该示例摘自资源 http://home.tamk.fi/~jaalto/course/coding-style/doc/unmaintainable-code/.

**7.** 不要在每个文件的开头写垃圾注释（作者、创建日期……）。

**8.** 单行注释以三个斜杠开始： `///`，多行注释以 `/**` 开始。这些注释被视为“文档”。

注意：您可以使用 Doxygen 从这些注释生成文档。但 Doxygen 通常不被使用，因为在 IDE 中导航代码更为方便。

**9.** 多行注释开头和结尾不得有空行（闭合多行注释的那一行除外）。

**10.** 对于注释掉的代码，使用基本注释，而不是“文档”注释。

**11.** 在提交之前删除被注释掉的代码部分。

**12.** 注释或代码中不得有亵渎。

**13.** 不要使用大写字母。不要使用过多的标点符号。

```cpp
/// WHAT THE FAIL???
```

**14.** 不要使用注释来作为分隔符。

```cpp
///******************************************************
```

**15.** 不要在注释中开始讨论。

```cpp
/// Why did you do this stuff?
```

**16.** 没必要在块结束时写一个注释描述它的内容。

```cpp
/// for
```

## 命名 {#names}

**1.** 在变量和类成员的名称中使用小写字母和下划线。

```cpp
size_t max_block_size;
```

**2.** 在函数（方法）名称中使用 camelCase，开头为小写字母。

```cpp
std::string getName() const override { return "Memory"; }
```

**3.** 在类（结构）的名称中使用 CamelCase，开头为大写字母。对于接口，不使用 I 之外的前缀。

```cpp
class StorageMemory : public IStorage
```

**4.** `using` 的命名与类相同。

**5.** 模板类型参数的名称：在简单情况下，使用 `T`；`T`、`U`；`T1`、`T2`。

对于更复杂的情况，可以遵循类名称的规则，或添加前缀 `T`。

```cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
```

**6.** 模板常量参数的名称：遵循变量名称的规则，或在简单情况下使用 `N`。

```cpp
template <bool without_www>
struct ExtractDomain
```

**7.** 对于抽象类（接口），您可以添加 `I` 前缀。

```cpp
class IProcessor
```

**8.** 如果您在本地使用变量，可以使用短名称。

在所有其他情况下，请使用描述其含义的名称。

```cpp
bool info_successfully_loaded = false;
```

**9.** `define` 和全局常量的名称使用全大写字母和下划线。

```cpp
#define MAX_SRC_TABLE_NAMES_TO_STORE 1000
```

**10.** 文件名应使用与其内容相同的风格。

如果一个文件包含单个类，则将文件命名为该类的同名（CamelCase）。

如果文件包含单个函数，则将文件命名为该函数的同名（camelCase）。

**11.** 如果名称中包含缩写，则：

- 对于变量名称，缩写应使用小写字母 `mysql_connection`（而不是 `mySQL_connection`）。
- 对于类和函数名称，保留缩写中的大写字母 `MySQLConnection`（而不是 `MySqlConnection`）。

**12.** 用于初始化类成员的构造函数参数应与类成员同名，但后面加下划线。

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

如果参数未在构造函数体中使用，可以省略下划线后缀。

**13.** 局部变量和类成员的名称没有区别（不要求前缀）。

```cpp
timer (not m_timer)
```

**14.** 对于 `enum` 中的常量，使用 CamelCase 首字母大写，也可以使用全大写字母。如果 `enum` 不是局部的，使用 `enum class`。

```cpp
enum class CompressionMethod
{
    QuickLZ = 0,
    LZ4     = 1,
};
```

**15.** 所有名称必须使用英语。不得转写希伯来语单词。

    not T_PAAMAYIM_NEKUDOTAYIM

**16.** 缩写是可以接受的，只要它们是众所周知的（例如，您可以轻松找到缩写的含义，查看维基百科或搜索引擎）。

    `AST`、`SQL`。

    不是 `NVDH`（随意字母）

不完整的单词是可以接受的，只要简写是常用的。

如果完整名称在注释中与其相邻，也可以使用缩写。

**17.** C++ 源代码的文件名必须具有 `.cpp` 扩展名。头文件必须具有 `.h` 扩展名。

## 如何编写代码 {#how-to-write-code}

**1.** 内存管理。

手动内存释放（`delete`）仅可在库代码中使用。

在库代码中，`delete` 操作符只能在析构函数中使用。

在应用程序代码中，必须由拥有对象的对象释放内存。

示例：

- 最简单的方法是将对象放在栈上，或使其成为另一个类的成员。
- 对于大量小对象，请使用容器。
- 对于位于堆中的少量对象的自动释放，使用 `shared_ptr/unique_ptr`。

**2.** 资源管理。

使用 `RAII`，详见上文。

**3.** 错误处理。

使用异常。在大多数情况下，您只需抛出异常，而无需捕获它（因为 `RAII`）。

在离线数据处理应用程序中，通常可以不捕获异常。

在处理用户请求的服务器中，通常只需在连接处理程序的顶部捕获异常。

在线程函数中，您应该捕获并保存所有异常，以便在 `join` 后在主线程中重新抛出它们。

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

切勿在没有处理的情况下隐藏异常。切勿盲目将所有异常记录。

```cpp
//Not correct
catch (...) {}
```

如果需要忽略某些异常，仅对特定异常进行处理，并重新抛出其余异常。

```cpp
catch (const DB::Exception & e)
{
    if (e.code() == ErrorCodes::UNKNOWN_AGGREGATE_FUNCTION)
        return nullptr;
    else
        throw;
}
```

使用带有响应代码或 `errno` 的函数时，始终检查结果，并在出错时抛出异常。

```cpp
if (0 != close(fd))
    throw ErrnoException(ErrorCodes::CANNOT_CLOSE_FILE, "Cannot close file {}", file_name);
```

您可以使用 assert 检查代码中不变量的有效性。

**4.** 异常类型。

在应用程序代码中没有必要使用复杂的异常层次结构。异常文本应为系统管理员可理解。

**5.** 从析构函数抛出异常。

这不推荐，但可以。

使用以下选项：

- 创建一个函数（`done()` 或 `finalize()`），提前处理可能导致异常的所有工作。如果该函数已被调用，则析构函数中不应有异常。
- 太复杂的任务（如通过网络发送消息）可以放在单独的方法中，类的用户必须在析构前调用此方法。
- 如果析构函数中发生异常，最好记录它，而不是隐藏（如果记录器可用）。
- 在简单应用中，可以依靠 `std::terminate` （在 C++11中默认为 `noexcept`）来处理异常。

**6.** 匿名代码块。

您可以在单个函数内部创建一个单独的代码块，以使某些变量局部，从而在退出块时调用析构函数。

```cpp
Block block = data.in->read();

{
    std::lock_guard<std::mutex> lock(mutex);
    data.ready = true;
    data.block = block;
}

ready_any.set();
```

**7.** 多线程。

在离线数据处理程序中：

- 尽量在单个 CPU 核心上获得最佳性能。如果需要，您可以随后对代码进行并行化。

在服务器应用程序中：

- 使用线程池处理请求。目前尚未有需要用户空间上下文切换的任务。

不使用 fork 进行并行化。

**8.** 同步线程。

通常，可以让不同的线程使用不同的内存单元（甚至更好：不同的缓存行），而不使用任何线程同步（除了 `joinAll`）。

如果需要同步，在大多数情况下，使用 `lock_guard` 下的互斥量就足够了。

在其他情况下，使用系统同步原语。不要使用忙等待。

原子操作应仅在最简单的情况下使用。

除非这是您的主要专长领域，否则不要尝试实现无锁数据结构。

**9.** 指针与引用。

在大多数情况下，优先使用引用。

**10.** `const`。

使用常量引用、指向常量的指针、`const_iterator` 和 `const` 方法。

将 `const` 视为默认，并仅在必要时使用非 `const`。

在按值传递变量时，使用 `const` 通常没有意义。

**11.** unsigned。

如果必要，使用 `unsigned`。

**12.** 数字类型。

使用 `UInt8`、`UInt16`、`UInt32`、`UInt64`、`Int8`、`Int16`、`Int32` 和 `Int64`，以及 `size_t`、`ssize_t` 和 `ptrdiff_t`。

不要为以下数字使用这些类型：`signed/unsigned long`、`long long`、`short`、`signed/unsigned char`、`char`。

**13.** 传递参数。

如果要移动复杂值，则按值传递，并使用 std::move；如果要在循环中更新值，则按引用传递。

如果一个函数捕获了堆内对象的所有权，令参数类型为 `shared_ptr` 或 `unique_ptr`。

**14.** 返回值。

在大多数情况下，仅使用 `return`。不要写 `return std::move(res)`。

如果函数在堆上分配对象并返回它，请使用 `shared_ptr` 或 `unique_ptr`。

在少数情况下（在循环中更新值），您可能需要通过参数返回值。在这种情况下，参数应该是引用。

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

应用程序代码中不需要使用单独的 `namespace`。

小型库也不需要这个。

对于中型到大型库，将所有内容放在一个 `namespace` 中。

在库的 `.h` 文件中，您可以使用 `namespace detail` 来隐藏应用程序代码中不需要的实现细节。

在 `.cpp` 文件中，您可以使用 `static` 或匿名 `namespace` 来隐藏符号。

此外，`namespace` 可用于 `enum`，以防止相应名称落入外部 `namespace`（但最好使用 `enum class`）。

**16.** 延迟初始化。

如果初始化需要参数，则通常不应编写默认构造函数。

如果稍后需要延迟初始化，可以添加一个默认构造函数来创建一个无效对象。或者，对于少量对象，可以使用 `shared_ptr/unique_ptr`。

```cpp
Loader(DB::Connection * connection_, const std::string & query, size_t max_block_size_);

/// For deferred initialization
Loader() {}
```

**17.** 虚函数。

如果类不打算用于多态使用，则不需要将函数设为虚。析构函数也适用此规则。

**18.** 编码。

到处使用 UTF-8。使用 `std::string` 和 `char *`。不要使用 `std::wstring` 和 `wchar_t`。

**19.** 日志记录。

请查看代码中的示例。

在提交之前，删除所有无意义的调试日志以及任何其他类型的调试输出。

尽量避免在循环中记录，即使是在 Trace 级别。

在任何日志级别下，日志内容必须可读。

日志应主要用于应用程序代码。

日志消息必须用英语书写。

日志应尽可能便于系统管理员理解。

日志中不得有亵渎。

在日志中使用 UTF-8 编码。在少数情况下，您可以在日志中使用非 ASCII 字符。

**20.** 输入输出。

在对应用性能至关重要的内部循环中，不要使用 `iostreams`（并且绝不要使用 `stringstream`）。

改用 `DB/IO` 库。

**21.** 日期和时间。

请参阅 `DateLUT` 库。

**22.** include。

始终使用 `#pragma once` 而不是包含保护。

**23.** using。

不使用 `using namespace`。您可以使用 `using` 和特定内容。但将其限定在类或函数内部。

**24.** 除非必要，否则不要对函数使用 `trailing return type`。

```cpp
auto f() -> void
```

**25.** 变量的声明和初始化。

```cpp
//right way
std::string s = "Hello";
std::string s{"Hello"};

//wrong way
auto s = std::string{"Hello"};
```

**26.** 对于虚函数，在基类中书写 `virtual`，而在派生类中书写 `override` 代替 `virtual`。

## C++ 的未使用特性 {#unused-features-of-c}

**1.** 不使用虚继承。

**2.** 在现代 C++ 中具有方便语法糖的构造，例如：

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

## 平台 {#platform}

**1.** 我们为特定平台编写代码。

但在其他条件相等的情况下，优先选择跨平台或便携式代码。

**2.** 语言：C++20（见可用的 [C++20 功能](https://en.cppreference.com/w/cpp/compiler_support#C.2B.2B20_features)）。

**3.** 编译器： `clang`。在撰写本文时（2025年3月），代码使用 clang 版本 >= 19 编译。

使用标准库（`libc++`）。

**4.** 操作系统：Linux Ubuntu，不低于 Precise。

**5.** 代码针对 x86_64 CPU 架构编写。

CPU 指令集是我们服务器之间的最低支持集。目前为 SSE 4.2。

**6.** 使用 `-Wall -Wextra -Werror -Weverything` 编译标志，少数例外。

**7.** 除了难以静态连接的库外，使用与所有库的静态链接（见 `ldd` 命令的输出）。

**8.** 代码在发布设置下开发和调试。

## 工具 {#tools}

**1.** KDevelop 是一个很好的 IDE。

**2.** 调试时，使用 `gdb`、`valgrind`（`memcheck`）、`strace`、`-fsanitize=...` 或 `tcmalloc_minimal_debug`。

**3.** 进行性能分析时，使用 `Linux Perf`、`valgrind`（`callgrind`）或 `strace -cf`。

**4.** 源代码在 Git 中。

**5.** 汇编使用 `CMake`。

**6.** 通过 `deb` 包发布程序。

**7.** 不得破坏主分支的构建。

尽管只有选定的修订被视为可工作。

**8.** 尽可能频繁地进行提交，即使代码只部分完成。

为此目的使用分支。

如果主分支中的代码尚不可构建，请在 `push` 前将其从构建中排除。您需要在几天内完成或删除它。

**9.** 对于非平凡的更改，使用分支并在服务器上发布它们。

**10.** 从代码库中删除未使用的代码。

## 库 {#libraries}

**1.** 使用 C++20 标准库（允许实验性扩展），以及 `boost` 和 `Poco` 框架。

**2.** 不允许使用操作系统包中的库。也不允许使用预安装库。所有库应以源代码形式放置在 `contrib` 目录中，并与 ClickHouse 一起构建。有关详细信息，请参见 [添加和维护第三方库的指导方针](/development/contrib#adding-and-maintaining-third-party-libraries)。

**3.** 总是优先考虑已经在使用中的库。

## 一般建议 {#general-recommendations-1}

**1.** 尽量编写最少的代码。

**2.** 尝试最简单的解决方案。

**3.** 在您清楚它的工作方式及内部循环将如何工作之前，不要编写代码。

**4.** 在最简单的情况下，使用 `using` 代替类或结构。

**5.** 如果可能，不要编写复制构造函数、赋值运算符、析构函数（除非是虚函数，如果类至少包含一个虚函数）、移动构造函数或移动赋值运算符。换句话说，编译器生成的函数必须正常工作。您可以使用 `default`。

**6.** 鼓励代码简化。尽可能减少代码的大小。

## 附加建议 {#additional-recommendations}

**1.** 明确指定 `std::` 的 `stddef.h` 中的类型

是不推荐的。换句话说，我们建议写 `size_t` 而不是 `std::size_t`，因为它更短。

添加 `std::` 是可以接受的。

**2.** 明确指定 `std::` 的标准 C 库中的函数

是不推荐的。换句话说，写 `memcpy` 而不是 `std::memcpy`。

原因在于有类似的非标准函数，例如 `memmem`。我们偶尔会使用这些函数。这些函数不存在于 `namespace std` 中。

如果您在任何地方写 `std::memcpy` 而不是 `memcpy`，那么没有 `std::` 的 `memmem` 会显得奇怪。

不过，如果您更喜欢，可以仍然使用 `std::`。

**3.** 在标准 C++ 库中的相同函数可用时使用 C 的函数。

如果更高效，可以接受。

例如，使用 `memcpy` 来替代 `std::copy` 来复制大量内存。

**4.** 多行函数参数。

以下任何一种包装样式都是允许的：

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
