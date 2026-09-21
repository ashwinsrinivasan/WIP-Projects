#!/usr/bin/env python3
"""CLI for asking Jev (TypeSafe AI) a structured question about some context.

Reads the API key from the TYPESAFE_API_KEY environment variable (used by
the typesafe-sdk client by default). Never pass the key on the command line.

Usage:
    python jev.py yesno   --question "..." --state "..." [--threshold 0.5]
    python jev.py choice  --question "..." --state "..." --option name=description [--option ...]
    python jev.py bucket  --question "..." --state "..." --range "label" [--range ...]

Context can come from --state, --state-file, or stdin.
"""

import argparse
import json
import sys

from typesafe_sdk import Choice, Noul, Score, TypeSafeClient


def read_state(args) -> str:
    if args.state:
        return args.state
    if args.state_file:
        with open(args.state_file) as f:
            return f.read()
    if not sys.stdin.isatty():
        return sys.stdin.read()
    raise SystemExit("Provide context via --state, --state-file, or stdin.")


def cmd_yesno(client: TypeSafeClient, args) -> None:
    state = read_state(args)
    response = client.system_one(
        state=state,
        questions={"answer": Noul(instructions=args.question)},
    )
    result = response.answers["answer"]
    verdict = "Yes" if result.noul >= args.threshold else "No"
    print(f"{verdict} (noul={result.noul})")


def cmd_choice(client: TypeSafeClient, args) -> None:
    state = read_state(args)
    criteria = dict(opt.split("=", 1) for opt in args.option)
    response = client.system_one(
        state=state,
        questions={"answer": Choice(instructions=args.question, criteria=criteria)},
    )
    result = response.answers["answer"]
    print(f"Choice: {result.choice} (confidence={result.confidence})")
    print(json.dumps(result.probabilities, indent=2))


def cmd_bucket(client: TypeSafeClient, args) -> None:
    state = read_state(args)
    response = client.system_one(
        state=state,
        questions={"answer": Score(instructions=args.question, criteria=args.range)},
    )
    result = response.answers["answer"]
    label = result.legend[int(result.score)]
    print(f"Bucket: {label} (score={result.score}, confidence={result.confidence})")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--state", help="Context text")
    common.add_argument("--state-file", help="Path to a file containing context text")
    common.add_argument("--question", required=True, help="The question/instructions to evaluate")

    p_yesno = sub.add_parser("yesno", parents=[common], help="Classify as Yes or No")
    p_yesno.add_argument("--threshold", type=float, default=0.5, help="Noul threshold for Yes (default 0.5)")
    p_yesno.set_defaults(func=cmd_yesno)

    p_choice = sub.add_parser("choice", parents=[common], help="Pick one option from a list")
    p_choice.add_argument(
        "--option", action="append", required=True, metavar="NAME=DESCRIPTION",
        help="An option as name=description. Repeat for each option.",
    )
    p_choice.set_defaults(func=cmd_choice)

    p_bucket = sub.add_parser("bucket", parents=[common], help="Bucket into one of an ordered range of labels")
    p_bucket.add_argument(
        "--range", action="append", required=True,
        help="A bucket label, ordered low to high. Repeat in order.",
    )
    p_bucket.set_defaults(func=cmd_bucket)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    client = TypeSafeClient()
    args.func(client, args)


if __name__ == "__main__":
    main()
