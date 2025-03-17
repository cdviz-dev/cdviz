# Usage of cdviz-collector

```bash
cdviz-collector help
```

```text
A service & cli to collect SDLC/CI/CD events and to dispatch as cdevents.

Usage: cdviz-collector [OPTIONS]
       cdviz-collector connect [OPTIONS]
       cdviz-collector transform [OPTIONS] --input <INPUT> --output <OUTPUT>
       cdviz-collector help [COMMAND]...

Options:
  -v, --verbose...  Increase logging verbosity
  -q, --quiet...    Decrease logging verbosity
  -h, --help        Print help
  -V, --version     Print version

cdviz-collector connect:
Launch as a server and connect sources to sinks
      --config <CONFIG>        The configuration file to use [env: CDVIZ_COLLECTOR_CONFIG=]
  -C, --directory <DIRECTORY>  The directory to use as the working directory
  -h, --help                   Print help

cdviz-collector transform:
Transform local files and potentially check them. The input & output files are expected to be json files. The filename of output files will be the same as the input file but with a '.out.json' extension (input file with this extension will be ignored). The output files include body, metdata and header fields
      --config <CONFIG>
          The configuration file to use [env: CDVIZ_COLLECTOR_CONFIG=]
  -C, --directory <DIRECTORY>
          The directory to use as the working directory
  -t, --transformer-refs <TRANSFORMER_REFS>
          Names of transformers to chain (comma separated) [default: passthrough]
  -i, --input <INPUT>
          The input directory with json files
  -o, --output <OUTPUT>
          The output directory with json files
  -m, --mode <MODE>
          How to handle new vs existing output files [default: review] [possible values: review, overwrite, check]
      --no-check-cdevent
          Do not check if output's body is a cdevent
  -h, --help
          Print help (see more with '--help')

cdviz-collector help:
Print this message or the help of the given subcommand(s)
  [COMMAND]...  Print help for the subcommand(s)
```
