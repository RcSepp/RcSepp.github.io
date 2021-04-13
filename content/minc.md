
### Details

Minc - the Minimal Compiler - is an ultra flexible programming language, that can load other languages by importing them from code.
The main advantages of Minc are:

* Mix any number of compiled or interpreted programming languages within a single file with zero glue code
* Use a single tool chain to manage entire multilingual projects
* Easily create new languages using the Minc API and embed them within existing languages




















Minc is a programming language that only understands two commands: "import" and "export". More commands (including entire programming languages) are imported using the import command.

Minc includes a powerful SDK for creating programming languages by defining statements, expressions and casts. It supports both compiled langauges (in combination with a compiler framework, like [LLVM](https://llvm.org/)) and interpreted languages (using minc's own runtime).

Minc includes an example programming language called "paws". Paws is an interpreted language that supports standard programming language constructs like functions and classes.

### Many languages, one compiler

#### cat hello-C.minc

```C++
import C;
#include <stdio.h>;
printf("Hello World!");
```

#### ./minc hello-C.minc

```
Hello World!
```


#### cat hello-Python.minc

```C++
import Python;
print("Hello World!");
```

#### ./minc hello-Python.minc

```
Hello World!
```

### Language integration without glue-code

```C++
import Python;
import argparse;
parser = argparse.ArgumentParser();
parser.add_argument("n", help="Fibonacci number");
n = parser.parse_args().n;

import C;
int fib(int n) {
	if (n <= 1) return n;
	return fib(n - 1) + fib(n - 2);
}
print(f"fib({n}):", fib(n));
```

### Powerful SDK for new languages

#### cat minc-packages/my_language.cpp

```C++
#include <string>
#include <cstring>
#include <iostream>
#include "minc_api.hpp"
#include "minc_pkgmgr.h"

MincObject STRING_TYPE, META_TYPE;

struct String : public std::string, public MincObject
{
	String(const std::string val) : std::string(val) {}
};

MincPackage MY_LANGUAGE("my_language", [](MincBlockExpr* pkgScope) {
	pkgScope->defineSymbol("string", &META_TYPE, &STRING_TYPE);

	pkgScope->defineExpr(MincBlockExpr::parseCTplt("$L")[0],
		[](MincRuntime& runtime, std::vector<MincExpr*>& params) -> bool {
			const std::string& value = ((MincLiteralExpr*)params[0])->value;

			if (value.back() == '"' || value.back() == '\'')
				runtime.result = new String(value.substr(1, value.size() - 2));
			else
				raiseCompileError("Non-string literals not implemented", params[0]);
			return false;
		},
		[](const MincBlockExpr* parentBlock, const std::vector<MincExpr*>& params) -> MincObject* {
			const std::string& value = ((MincLiteralExpr*)params[0])->value;
			if (value.back() == '"' || value.back() == '\'')
				return &STRING_TYPE;
			else
				return nullptr;
		}
	);

	pkgScope->defineStmt(MincBlockExpr::parseCTplt("print($E<string>)"),
		[](MincBuildtime& buildtime, std::vector<MincExpr*>& params) {
			params[0]->build(buildtime);
		},
		[](MincRuntime& runtime, std::vector<MincExpr*>& params) -> bool {
			if (params[0]->run(runtime))
				return true;
			String* const message = (String*)runtime.result;
			std::cout << *message << " from my language!\n";
			return false;
		}
	);
});
```

#### cat my_langage.minc
```C++
import my_language;
print("Hello World")
```

#### ./minc my_langage.minc
```
Hello World from my language!
```