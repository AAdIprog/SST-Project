# Validation Guide

## Fast path

```bash
python scripts/run_release_checks.py
```

This runs tests, starts the API, executes the benchmark, and generates the demo report.

## Unit and API tests

```bash
pytest -q
```

## Local API smoke test

```bash
uvicorn main:app --host 0.0.0.0 --port 7860
curl http://localhost:7860/
curl http://localhost:7860/healthz
curl -X POST http://localhost:7860/reset
curl http://localhost:7860/state
curl http://localhost:7860/demo
curl http://localhost:7860/demo/samples
```

## Baseline runner

```bash
python inference.py
```

Optional benchmark export:

```bash
BENCHMARK_OUTPUT_JSON=benchmark.json python inference.py
```

## Demo report

```bash
python demo.py
```

## Live judge demo

Open `http://localhost:7860/demo` and verify:

- sample gallery loads
- pasted input sanitizes correctly
- compare mode returns multiple agent outputs
- score, risk, and failure panels update

## Docker

```bash
docker build -t release-desk-openenv .
docker run -p 7860:7860 release-desk-openenv
curl http://localhost:7860/healthz
```

## Hugging Face Space notes

- Use Docker Space mode
- expose port `7860`
- use `/healthz` as the health route
- add the `openenv` tag
