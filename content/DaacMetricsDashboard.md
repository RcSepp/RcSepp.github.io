## Motivation

Data centers, like the Oak Ridge National Laboratory (ORNL) Data Active Archive Center (DAAC), run a plethora of different Perl or Python scripts every day to curate, analyze and produce reports on processed data and metadata. Most of these scripts are executed via CRON jobs and monitoring their correct execution is challenging.

### The DAAC Metrics Processor

The DAAC Metrics Processor (DMP) is a Python framework that provides ...

* ... a common logging framework for easier monitoring.
* ... common configuration parameters for easier setup and scheduling.
* ... common utility functions to promote code reuse.
* ... common serialization functions to avoid file system clutter with temporary files.
* ... common pipeline functions to easily link multiple scripts together.

Using the DMP, scripts can be validated, configured, executed and scheduled via a simple command line interface. The DMP can display information about individual scripts and query the full logging history.

### The DAAC Metrics Dashboard

The DAAC Metrics Dashboard (DMD) is a frontend for DMP that exposes the full functionality of DMP in a simple web interface. It works by translating user events into DMP commands and invoking DMP on the server. All scripts are listed on the left side of the UI (see image). Individual tab pages at the top display visualizations of different DMP commands. The blue button at the top-right toggles between showing the visualization or displaying unprocessed textual DMP output.

A key feature of DMP is the visualization of executed scripts in a scatterplot (see image). The plot shows selected scripts on the y-axis over time on the x-axis. Colors represent the severity of log messages emitted from the executed script. Using this visualization a system admin can monitor the correct execution of all scripts simultaneously and retrace historical events to pin down system errors in a matter of seconds.