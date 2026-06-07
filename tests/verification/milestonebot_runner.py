#!/usr/bin/env python3
"""
MilestoneBot Verification Engine — Local Test Harness
=====================================================
Tests the MILESTONEBOT.md agent instructions against real LLMs using
structured milestone specs and mock git diffs.

Usage:
    python3 milestonebot_runner.py --provider ollama          # Local Ollama
    python3 milestonebot_runner.py --provider ollama --model qwen2.5-coder:7b
    python3 milestonebot_runner.py --provider groq            # Groq cloud (needs GROQ_API_KEY)
    python3 milestonebot_runner.py --provider gemini          # Gemini (needs GEMINI_API_KEY)
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
FIXTURES_DIR = os.path.join(SCRIPT_DIR, "fixtures")
AGENT_INSTRUCTIONS = os.path.join(PROJECT_ROOT, "docs", "MILESTONEBOT.md")


# ---------------------------------------------------------------------------
# 1. Load everything
# ---------------------------------------------------------------------------
def load_text(path: str) -> str:
    with open(path, "r") as f:
        return f.read()


def load_json(path: str) -> dict:
    with open(path, "r") as f:
        return json.load(f)


def load_agent_instructions() -> str:
    return load_text(AGENT_INSTRUCTIONS)


def load_spec() -> dict:
    return load_json(os.path.join(FIXTURES_DIR, "spec_profile_fetch.json"))


# ---------------------------------------------------------------------------
# 2. Build the prompt from spec + diff + agent instructions
# ---------------------------------------------------------------------------
def build_prompt(spec: dict, diff_text: str) -> tuple[str, str]:
    """Returns (system_prompt, user_prompt)."""
    system_prompt = load_agent_instructions()

    # Build a clean spec summary for the user prompt
    spec_block = json.dumps(spec, indent=2)

    user_prompt = f"""
=== MILESTONE SPECIFICATION ===
{spec_block}

=== GIT DIFF (Primary Evidence) ===
{diff_text}

Now audit this submission following your systematic procedure (Steps 1-6).
Return ONLY a raw JSON object — no markdown fences, no explanations outside the JSON.
"""
    return system_prompt, user_prompt


# ---------------------------------------------------------------------------
# 3. Provider Runners
# ---------------------------------------------------------------------------
def call_ollama(system_prompt: str, user_prompt: str, model: str = "qwen2.5-coder:7b") -> dict:
    """Call a local Ollama instance."""
    url = "http://localhost:11434/api/chat"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0.1,
            "num_predict": 2048,
        },
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            raw = body.get("message", {}).get("content", "")
            return json.loads(raw)
    except urllib.error.URLError as e:
        print(f"  ❌ Ollama connection failed: {e}")
        print("     Is Ollama running? Try: ollama serve")
        return None
    except json.JSONDecodeError as e:
        print(f"  ❌ Failed to parse JSON from model response: {e}")
        print(f"     Raw response: {raw[:500]}")
        return None


def call_groq(system_prompt: str, user_prompt: str, model: str = "llama3-8b-8192") -> dict:
    """Call Groq cloud API."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("  ❌ GROQ_API_KEY not set. Export it: export GROQ_API_KEY='gsk_...'")
        return None

    url = "https://api.groq.com/openai/v1/chat/completions"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.1,
        "response_format": {"type": "json_object"},
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            raw = body["choices"][0]["message"]["content"]
            return json.loads(raw)
    except urllib.error.HTTPError as e:
        print(f"  ❌ Groq API error: {e.read().decode('utf-8')}")
        return None


def call_gemini(system_prompt: str, user_prompt: str, model: str = "gemini-1.5-flash") -> dict:
    """Call Gemini API."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("  ❌ GEMINI_API_KEY not set. Export it: export GEMINI_API_KEY='AIzaSy...'")
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"SYSTEM INSTRUCTION:\n{system_prompt}\n\nUSER PROMPT:\n{user_prompt}"}
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.1,
        },
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            raw = body["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(raw)
    except urllib.error.HTTPError as e:
        print(f"  ❌ Gemini API error: {e.read().decode('utf-8')}")
        return None


# ---------------------------------------------------------------------------
# 4. Test Runner
# ---------------------------------------------------------------------------
PROVIDER_MAP = {
    "ollama": call_ollama,
    "groq": call_groq,
    "gemini": call_gemini,
}

TEST_CASES = [
    {
        "name": "VALID implementation (expect APPROVED)",
        "diff_file": "diff_valid.patch",
        "expected_status": "approved",
    },
    {
        "name": "MOCK/CHEAT implementation (expect REJECTED)",
        "diff_file": "diff_mock_cheat.patch",
        "expected_status": "rejected",
    },
    {
        "name": "PARTIAL implementation — GET only, no PUT (expect REJECTED)",
        "diff_file": "diff_partial.patch",
        "expected_status": "rejected",
    },
]


def print_verdict(verdict: dict, expected: str):
    """Pretty-print the verdict with pass/fail indicator."""
    actual = verdict.get("status", "unknown")
    score = verdict.get("confidence_score", 0)
    summary = verdict.get("summary", "No summary provided")
    match = actual == expected

    indicator = "✅ PASS" if match else "❌ FAIL"
    print(f"  {indicator}  |  Status: {actual.upper()}  |  Confidence: {score}  |  Expected: {expected.upper()}")
    print(f"  Summary: {summary}")

    missing = verdict.get("missing_requirements", [])
    if missing:
        print(f"  Missing Requirements:")
        for m in missing:
            print(f"    - {m}")

    suggestions = verdict.get("code_suggestions", [])
    if suggestions:
        print(f"  Code Suggestions:")
        for s in suggestions:
            print(f"    - {s}")

    blockers = verdict.get("deployment_blockers", [])
    if blockers:
        print(f"  Deployment Blockers:")
        for b in blockers:
            print(f"    - {b}")

    risks = verdict.get("regression_risks", [])
    if risks:
        print(f"  Regression Risks:")
        for r in risks:
            print(f"    - {r}")

    return match


def main():
    parser = argparse.ArgumentParser(description="MilestoneBot Test Harness")
    parser.add_argument(
        "--provider",
        choices=["ollama", "groq", "gemini"],
        default="ollama",
        help="LLM provider to use (default: ollama)",
    )
    parser.add_argument(
        "--model",
        default=None,
        help="Override the model name (e.g. qwen2.5-coder:32b, llama3-70b-8192)",
    )
    args = parser.parse_args()

    call_fn = PROVIDER_MAP[args.provider]
    spec = load_spec()

    print("=" * 70)
    print(f"🤖 MILESTONEBOT VERIFICATION ENGINE — TEST SUITE")
    print(f"   Provider: {args.provider.upper()}")
    if args.model:
        print(f"   Model: {args.model}")
    print("=" * 70)

    passed = 0
    total = len(TEST_CASES)

    for i, tc in enumerate(TEST_CASES, 1):
        print(f"\n{'─' * 70}")
        print(f"  TEST {i}/{total}: {tc['name']}")
        print(f"{'─' * 70}")

        diff_text = load_text(os.path.join(FIXTURES_DIR, tc["diff_file"]))
        system_prompt, user_prompt = build_prompt(spec, diff_text)

        start = time.time()
        kwargs = {}
        if args.model:
            kwargs["model"] = args.model
        verdict = call_fn(system_prompt, user_prompt, **kwargs)
        elapsed = time.time() - start

        print(f"  ⏱️  Response time: {elapsed:.2f}s")

        if verdict:
            if print_verdict(verdict, tc["expected_status"]):
                passed += 1
            # Save raw output for inspection
            out_path = os.path.join(FIXTURES_DIR, f"result_{tc['diff_file'].replace('.patch', '.json')}")
            with open(out_path, "w") as f:
                json.dump(verdict, f, indent=2)
            print(f"  📄 Full verdict saved to: {out_path}")
        else:
            print("  ⚠️  No verdict returned. Check provider connection.")

    print(f"\n{'=' * 70}")
    print(f"  RESULTS: {passed}/{total} tests passed")
    if passed == total:
        print("  🎉 All tests passed! MilestoneBot is calibrated correctly.")
    else:
        print("  ⚠️  Some tests failed. Review the verdicts and tune the agent prompt.")
    print(f"{'=' * 70}")


if __name__ == "__main__":
    main()
