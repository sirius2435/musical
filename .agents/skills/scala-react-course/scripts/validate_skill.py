#!/usr/bin/env python3
"""Validate this skill package, not the compliance of an application.

Uses only the Python standard library. Metadata checks intentionally support the
simple YAML used by this package: flat name/description and a quoted interface
mapping. This is not a general YAML parser. A full skill validator may also be run.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit


RULES_SHA256 = "6a720d72b729f65e5cfbdda95d618d7c48ca3d356dc398efd3db2ff757c8713a"
REQUIRED = (
    "SKILL.md",
    "agents/openai.yaml",
    "references/rules.txt",
    "references/course-handbook.md",
    "references/backend-patterns.md",
    "references/frontend-patterns.md",
    "references/review-checklist.md",
    "references/scala-style.md",
    "references/sources-and-conflicts.md",
    "references/installation.md",
    "examples/AGENTS.md.example",
    "tests/prompts.md",
    "tests/source-evidence.json",
    "tests/review-report.md",
    "tests/test_validate_skill.py",
    "scripts/verify_examples.py",
    "tests/frontend-contracts.cjs",
    "tests/scala-example-check.scala",
    "CHANGELOG.md",
)


def quoted_mapping(lines: list[str]) -> dict[str, str]:
    """Read the generated flat mapping of double-quoted JSON/YAML strings."""
    result: dict[str, str] = {}
    for line in lines:
        if not line.strip():
            continue
        match = re.fullmatch(r"\s*([a-z_]+):\s*(\".*\")\s*", line)
        if match is None:
            raise ValueError(f"unsupported metadata line: {line!r}")
        key, value = match.groups()
        if key in result:
            raise ValueError(f"duplicate metadata key: {key}")
        result[key] = json.loads(value)
    return result


def heading_anchors(body: str) -> set[str]:
    anchors: set[str] = set()
    counts: dict[str, int] = {}
    for heading in re.findall(r"(?m)^#{1,6}\s+(.+?)\s*#*\s*$", body):
        base = re.sub(r"[^\w -]", "", heading.lower()).replace(" ", "-")
        count = counts.get(base, 0)
        counts[base] = count + 1
        anchors.add(base if count == 0 else f"{base}-{count}")
    return anchors


def validate(root: Path, rules_source: Path | None = None,
             samples_root: Path | None = None) -> list[str]:
    errors: list[str] = []

    def require(condition: bool, message: str) -> None:
        if not condition:
            errors.append(message)

    for relative in REQUIRED:
        require((root / relative).is_file(), f"missing file: {relative}")
    if errors:
        return errors

    skill_text = (root / "SKILL.md").read_text(encoding="utf-8")
    frontmatter = re.match(r"\A---\n(.*?)\n---(?:\n|$)", skill_text, re.S)
    require(frontmatter is not None, "SKILL.md: invalid frontmatter")
    name = ""
    if frontmatter is not None:
        fields = frontmatter.group(1).splitlines()
        name_line = next((line for line in fields if line.startswith("name: ")), "")
        name = name_line.removeprefix("name: ").strip()
        require(bool(re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name)), "invalid skill name")
        require(0 < len(name) <= 64, "skill name length must be 1–64")
        require(root.name == name, "skill directory must match frontmatter name")
        require(sum(line.startswith("name:") for line in fields) == 1, "name must occur once")
        rest = [line for line in fields if not line.startswith("name:")]
        try:
            metadata = quoted_mapping(rest)
            require(set(metadata) == {"description"}, "expected one quoted description field")
            description = metadata.get("description", "")
            require(0 < len(description) <= 1024, "invalid description length")
            require("<" not in description and ">" not in description, "description contains angle brackets")
        except (ValueError, json.JSONDecodeError) as error:
            errors.append(f"SKILL.md metadata: {error}")

    interface_lines = (root / "agents/openai.yaml").read_text(encoding="utf-8").splitlines()
    require(bool(interface_lines) and interface_lines[0] == "interface:", "missing interface mapping")
    try:
        require(all(not line.strip() or line.startswith("  ") for line in interface_lines[1:]),
                "interface fields must be indented")
        interface = quoted_mapping(interface_lines[1:])
        expected = {"display_name", "short_description", "default_prompt"}
        require(set(interface) == expected, "unexpected or missing interface fields")
        require(bool(interface.get("display_name")), "empty display_name")
        require(25 <= len(interface.get("short_description", "")) <= 64, "short_description must be 25–64 characters")
        require(bool(name) and f"${name}" in interface.get("default_prompt", ""), "default_prompt must reference this skill")
    except (ValueError, json.JSONDecodeError) as error:
        errors.append(f"agents/openai.yaml: {error}")

    rules_path = root / "references/rules.txt"
    rules_bytes = rules_path.read_bytes()
    require(hashlib.sha256(rules_bytes).hexdigest() == RULES_SHA256,
            "rules.txt differs from the approved snapshot; do not silently edit the rules")
    numbers = [int(number) for number in re.findall(r"(?m)^(\d+)\.", rules_bytes.decode("utf-8"))]
    require(numbers == list(range(1, 61)), "rules.txt must contain ordered rules 1–60 exactly once")
    if rules_source is not None:
        require(rules_source.is_file(), f"rules source does not exist: {rules_source}")
        if rules_source.is_file():
            require(rules_bytes == rules_source.read_bytes(), "rules.txt is not byte-identical to the supplied source")

    checklist = (root / "references/review-checklist.md").read_text(encoding="utf-8")
    coverage: set[int] = set()
    for start, end in re.findall(r"(?m)^\| (\d+)(?:[–-](\d+))? \|", checklist):
        first, last = int(start), int(end or start)
        require(1 <= first <= last <= 60, f"invalid checklist range: {first}–{last}")
        coverage.update(range(first, last + 1))
    require(coverage == set(range(1, 61)), "checklist coverage index must include rules 1–60")

    source_map = (root / "references/sources-and-conflicts.md").read_text(encoding="utf-8")
    mapped = re.findall(r"(?m)^\| ((?:SC|FE|BE|G)\d{2}) \|", source_map)
    require(len(mapped) == len(set(mapped)), "duplicate source-map requirement ID")
    expected_ids = ({f"SC{i:02d}" for i in range(1, 11)} |
                    {f"FE{i:02d}" for i in range(1, 9)} |
                    {f"BE{i:02d}" for i in range(1, 4)} |
                    {f"G{i:02d}" for i in range(1, 4)})
    require(set(mapped) == expected_ids, "source-map requirement coverage is incomplete")

    prompt_text = (root / "tests/prompts.md").read_text(encoding="utf-8")
    prompts = re.findall(r"(?ms)^## (P\d{2})：[^\n]+\n(.*?)(?=^## |\Z)", prompt_text)
    prompt_ids = [item[0] for item in prompts]
    require(len(prompt_ids) == len(set(prompt_ids)), "duplicate behavior prompt ID")
    require(set(f"P{i:02d}" for i in range(1, 8)).issubset(prompt_ids), "required prompts P01–P07 missing")
    review_ids = set(re.findall(r"\b(?:SL|FP|BA|DM|AP|RC|HS|PO|VR)\d{2}\b", checklist))
    for prompt_id, block in prompts:
        for label in ("Prompt", "预期规范", "禁止错误", "预期结构", "审查项目", "行为验收"):
            require(label in block, f"{prompt_id}: missing {label}")
        used = set(re.findall(r"\b(?:SL|FP|BA|DM|AP|RC|HS|PO|VR)\d{2}\b", block))
        require(used.issubset(review_ids), f"{prompt_id}: unknown review item")

    evidence = json.loads((root / "tests/source-evidence.json").read_text(encoding="utf-8"))
    entries = evidence.get("entries", [])
    require(isinstance(entries, list) and bool(entries), "sample evidence must contain entries")
    seen: set[str] = set()
    for entry in entries:
        evidence_id = entry.get("id", "")
        require(bool(evidence_id) and evidence_id not in seen, "empty or duplicate evidence ID")
        seen.add(evidence_id)
        relative = Path(entry.get("workspace_path", ""))
        safe = (not relative.is_absolute() and relative.parts[:1] == ("samples",)
                and ".." not in relative.parts)
        require(safe, f"{evidence_id}: invalid sample path")
        require(bool(re.fullmatch(r"[0-9a-f]{64}", entry.get("sha256", ""))),
                f"{evidence_id}: invalid sample SHA-256")
        excerpts = entry.get("excerpts", [])
        require(bool(excerpts), f"{evidence_id}: missing excerpts")
        for excerpt in excerpts:
            first, last = excerpt.get("start_line", 0), excerpt.get("end_line", 0)
            require(isinstance(first, int) and isinstance(last, int) and 1 <= first <= last,
                    f"{evidence_id}: invalid excerpt range")
            require(len(excerpt.get("text", "").split("\n")) == last - first + 1,
                    f"{evidence_id}: excerpt length mismatch")
        if samples_root is not None and safe:
            sample = (samples_root / Path(*relative.parts[1:])).resolve()
            require(sample.is_relative_to(samples_root.resolve()), f"{evidence_id}: sample escapes root")
            require(sample.is_file(), f"{evidence_id}: source sample missing")
            if sample.is_file() and sample.is_relative_to(samples_root.resolve()):
                raw = sample.read_bytes()
                require(hashlib.sha256(raw).hexdigest() == entry.get("sha256"),
                        f"{evidence_id}: source sample hash mismatch")
                lines = raw.decode("utf-8").splitlines()
                for excerpt in excerpts:
                    require("\n".join(lines[excerpt["start_line"]-1:excerpt["end_line"]]) == excerpt["text"],
                            f"{evidence_id}: source excerpt mismatch")

    documents = sorted(root.rglob("*.md")) + [root / "examples/AGENTS.md.example"]
    for path in documents:
        body = path.read_text(encoding="utf-8")
        relative = path.relative_to(root)
        if body.startswith("---\n") and path.name != "SKILL.md":
            header = re.match(r"\A---\n(.*?)\n---(?:\n|$)", body, re.S)
            require(header is not None, f"invalid frontmatter: {relative}")
            if header:
                try:
                    quoted_mapping(header.group(1).splitlines())
                except ValueError as error:
                    errors.append(f"{relative} metadata: {error}")
        open_fence: str | None = None
        prose: list[str] = []
        for line in body.splitlines():
            fence = re.match(r"^\s*(`{3,}|~{3,})(.*)$", line)
            if fence is None:
                if open_fence is None:
                    prose.append(line)
                continue
            marker, suffix = fence.groups()
            if open_fence is None:
                open_fence = marker
            elif marker[0] == open_fence[0] and len(marker) >= len(open_fence) and not suffix.strip():
                open_fence = None
        require(open_fence is None, f"unclosed code fence: {relative}")
        require(not re.search(r"(?m)^\s*\[TODO:.*\]\s*$", body), f"unfinished scaffold: {relative}")
        for target in re.findall(r"\[[^\]]*\]\(([^\s)]+)\)", "\n".join(prose)):
            url = urlsplit(target)
            if url.scheme or url.netloc or not url.path:
                continue
            destination = (path.parent / unquote(url.path)).resolve()
            require(destination.is_relative_to(root), f"reference escapes package: {relative}: {target}")
            require(destination.is_file(), f"broken reference: {relative}: {target}")
            if url.fragment and destination.is_file() and destination.suffix == ".md":
                require(unquote(url.fragment) in heading_anchors(destination.read_text(encoding="utf-8")),
                        f"broken heading anchor: {relative}: {target}")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--skill-dir", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--rules-source", type=Path, help="optional original rules.txt for byte comparison")
    parser.add_argument("--samples-root", type=Path, help="optional samples directory for evidence verification")
    args = parser.parse_args()
    try:
        errors = validate(args.skill_dir.resolve(), args.rules_source, args.samples_root)
    except (OSError, UnicodeError, ValueError, TypeError, KeyError, AttributeError) as error:
        errors = [str(error)]
    if errors:
        for error in errors:
            print(f"FAIL: {error}", file=sys.stderr)
        return 1
    print("PASS: metadata, Markdown references/anchors, rules snapshot, 1–60 index, V2 source map, prompts and evidence")
    print("Scope: package structure only; application behavior and course compliance are not proven.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
