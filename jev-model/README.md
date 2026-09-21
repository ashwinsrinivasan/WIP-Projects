# Jev Model

A small CLI that sends context to TypeSafe AI's Jev model (`jev-latest`) and gets back one
of three structured answers: a Yes/No classification, a pick from a list of options, or a
bucket within an ordered range.

## Setup

```bash
pip install -r requirements.txt
export TYPESAFE_API_KEY=<your key>
```

## Usage

Classify Yes/No:

```bash
python jev.py yesno \
  --question "Does this message express urgency?" \
  --state "Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing."
```

Pick from multiple options:

```bash
python jev.py choice \
  --question "Which team should handle this" \
  --option billing="Payment or subscription issues" \
  --option technical="Bugs or integration problems" \
  --option sales="Pricing or account questions" \
  --state "..."
```

Bucket into a range (ordered low to high):

```bash
python jev.py bucket \
  --question "How frustrated the customer appears" \
  --range "Calm, just stating facts" \
  --range "Frustrated but civil" \
  --range "Very angry, strong language" \
  --state "..."
```

Context can also be passed via `--state-file <path>` or piped in on stdin.
