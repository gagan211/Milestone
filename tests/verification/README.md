# Verification Engine — Test Suite

This folder contains everything needed to test MilestoneBot locally using Ollama before integrating into the Rust backend.

## Structure

```
tests/verification/
├── README.md                          # You are here
├── milestone_spec_template.md         # Template for how clients MUST define milestones
├── milestonebot_runner.py             # Python test harness (calls Ollama / Groq / Gemini)
└── fixtures/
    ├── spec_profile_fetch.json        # Example: well-documented milestone spec
    ├── diff_valid.patch               # Diff that should be APPROVED
    ├── diff_mock_cheat.patch          # Diff that should be REJECTED (hardcoded mock)
    └── diff_partial.patch             # Diff that should be REJECTED (only GET, no PUT)
```

## How to Run

1. Start Ollama with a code model:
   ```bash
   ollama run qwen2.5-coder:32b
   ```

2. Run the test harness:
   ```bash
   python3 tests/verification/milestonebot_runner.py --provider ollama
   ```

3. Review the JSON verdicts printed for each test case.
