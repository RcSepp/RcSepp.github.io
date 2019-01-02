## Motivation

asyncframes is a coroutine library for Python and a reference implementation of the Frame Hierarchy Programming Model (FHM). The goal of FHM is to help programmers design clean and scalable parallel programs. The main features of asyncframes are:

* Hierarchical code design
* Inherent and scalable parallelism
* Architecture independence
* Extensibility through frame classes (a class whose lifetime is bound to the execution of a frame)

### Hierarchical code design

FHM models consists of frames. The main frame represents the root node of the hierarchy. Every frame can create any number of child frames. Removing a frame also removes all child frames.

Many programming tasks can naturally be expressed with hierarchical frames:

* User interfaces
* Scene graphs
* Parsers
* Any implementation of the composite design pattern
* ...

### Inherent and scalable parallelism

Every frame in FHM executes in parallel. The programmer can choose between three levels of parallelism:

* Frames that inherit from `asyncframes.Frame` run on a single thread using cooperative multitasking. They are free of multi-threading pitfalls and can safely interact with single-threaded libraries.
* Frames that inherit from `asyncframes.PFrame` *(requires asyncframes v2 or higher)* are multi-threaded. The internal scheduler of asyncframes automatically distributes all active frames in a thread pool. No manual assignment of threads required.
* Frames that inherit from `asyncframes.DFrame` *(under development)* run on separate processes, either on the same machine or anywhere else. The internal scheduler of asyncframes heuristically distributes frames among available processes to maximize performance.

### Architecture independence

FHM programs can be executed in any environment (single-threaded or multi-threaded desktop environments, distributed clusters, etc.) without any changes in code.
Thread- and process-schedulers of asyncframes distribute the workload to optimize runtime on the available hardware.

### Extensibility through frame classes

Any Python class can be converted into a frame by sub-classing `asyncframes.Frame`.
