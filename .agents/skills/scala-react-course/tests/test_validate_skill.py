"""Regression checks for package validation; not model-behavior evaluations."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("course_validator", ROOT / "scripts/validate_skill.py")
assert SPEC is not None and SPEC.loader is not None
VALIDATOR = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VALIDATOR)


class PackageValidationTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="course-v2-validator-")
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name) / ROOT.name
        shutil.copytree(ROOT, self.root, ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))

    def change(self, relative, before, after):
        path = self.root / relative
        text = path.read_text(encoding="utf-8")
        self.assertIn(before, text)
        path.write_text(text.replace(before, after), encoding="utf-8")

    def fails_with(self, fragment):
        errors = VALIDATOR.validate(self.root)
        self.assertTrue(any(fragment in error for error in errors), errors)

    def test_portable_package_and_code_generics_not_markdown_links(self):
        self.assertEqual(VALIDATOR.validate(self.root), [])

    def test_rule_wording_change_is_rejected(self):
        self.change("references/rules.txt", "跨服务的公开 API", "禁止跨服务的公开 API")
        self.fails_with("approved snapshot")

    def test_missing_reference(self):
        self.change("SKILL.md", "(references/backend-patterns.md)", "(references/absent.md)")
        self.fails_with("broken reference")

    def test_external_file_reference(self):
        self.change("SKILL.md", "(references/backend-patterns.md)", "(/etc/hosts)")
        self.fails_with("escapes package")

    def test_invalid_heading_anchor(self):
        self.change("SKILL.md", "(references/scala-style.md)", "(references/scala-style.md#no-such-heading)")
        self.fails_with("heading anchor")

    def test_unclosed_fence(self):
        path = self.root / "references/scala-style.md"
        path.write_text(path.read_text() + "\n```scala\nval open = 1\n")
        self.fails_with("unclosed code fence")

    def test_incorrect_ui_invocation(self):
        self.change("agents/openai.yaml", "$scala-react-course", "$wrong-skill")
        self.fails_with("default_prompt")

    def test_rule_index_omission(self):
        self.change("references/review-checklist.md", "| 60 |", "| omitted |")
        self.fails_with("coverage index")

    def test_source_map_omission(self):
        self.change("references/sources-and-conflicts.md", "| SC01 |", "| missing |")
        self.fails_with("source-map")

    def test_prompt_missing_expected_structure(self):
        self.change("tests/prompts.md", "预期结构", "结构说明")
        self.fails_with("missing 预期结构")

    def test_duplicate_evidence_id(self):
        path = self.root / "tests/source-evidence.json"
        payload = json.loads(path.read_text())
        payload["entries"][1]["id"] = payload["entries"][0]["id"]
        path.write_text(json.dumps(payload))
        self.fails_with("duplicate evidence ID")

    def test_invalid_document_frontmatter(self):
        self.change("references/course-handbook.md", 'language: "zh-CN"', 'language: "unterminated')
        self.fails_with("metadata")


if __name__ == "__main__":
    unittest.main()
