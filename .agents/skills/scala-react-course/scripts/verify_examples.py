#!/usr/bin/env python3
"""Compile and exercise documented examples in temporary directories, offline.

Provide existing tool/dependency paths. No installation, download, or project edit
is performed. This checks examples, not independent Codex prompt execution.
"""

from __future__ import annotations

import argparse
from pathlib import Path
import re
import shutil
import subprocess
import tempfile


ROOT = Path(__file__).resolve().parents[1]


def run(command: list[str], cwd: Path) -> None:
    try:
        subprocess.run(command, cwd=cwd, check=True, timeout=120)
    except subprocess.CalledProcessError as error:
        raise SystemExit(f"Example command failed: {Path(command[0]).name}, exit {error.returncode}") from None


def write(root: Path, relative: str, content: str) -> None:
    path = root / relative
    if not path.resolve().is_relative_to(root.resolve()):
        raise ValueError(f"unsafe example path: {relative}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content + "\n", encoding="utf-8")


def frontend(work: Path, modules: Path) -> None:
    import json

    modules = modules.resolve()
    for dependency in ("typescript/bin/tsc", "react/package.json", "react-dom/package.json", "zustand/package.json"):
        if not (modules / dependency).is_file():
            raise ValueError(f"missing existing dependency: {dependency}")
    node = shutil.which("node")
    if node is None:
        raise ValueError("node is not available")
    text = (ROOT / "references/frontend-patterns.md").read_text()
    blocks = re.findall(r"`(src/[^`]+\.(?:ts|tsx))`：\n\n```(?:ts|tsx)\n(.*?)\n```", text, re.S)
    if not blocks:
        raise ValueError("no frontend examples found")
    for path, body in blocks:
        write(work, path, body)
    (work / "node_modules").symlink_to(modules, target_is_directory=True)
    config = {"compilerOptions": {
        "target": "ES2023", "module": "CommonJS", "moduleResolution": "Node10",
        "jsx": "react-jsx", "strict": True, "noUnusedLocals": True,
        "noUnusedParameters": True, "erasableSyntaxOnly": True,
        "noFallthroughCasesInSwitch": True, "noUncheckedSideEffectImports": True,
        "skipLibCheck": True, "lib": ["ES2023", "DOM", "DOM.Iterable"],
        "outDir": "build", "rootDir": "src", "types": [],
    }, "include": ["src"]}
    write(work, "tsconfig.json", json.dumps(config))
    run([node, str(modules / "typescript/bin/tsc"), "-p", "tsconfig.json"], work)
    shutil.copy2(ROOT / "tests/frontend-contracts.cjs", work / "frontend-contracts.cjs")
    run([node, "frontend-contracts.cjs"], work)
    # Use existing ESLint only if installed; no network fallback.
    eslint = modules / "eslint/bin/eslint.js"
    if eslint.is_file():
        write(work, "eslint.config.mjs", """import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
export default [
  { ignores: ['build/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['src/**/*.{ts,tsx}'], languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks }, rules: reactHooks.configs.recommended.rules },
]
""")
        run([node, str(eslint), "src", "--config", "eslint.config.mjs"], work)
    else:
        print("NOT RUN: ESLint (not installed in supplied dependencies)")
    print(f"PASS: {len(blocks)} frontend example files, strict TypeScript, request/state fixtures")


def scala(work: Path, java: Path, compiler_file: Path, dependencies_file: Path, sample: Path) -> None:
    source = work / "src"
    source.mkdir()
    sample = sample.resolve()
    # Real sample dependencies are copied, never modified in place.
    shutil.copytree(sample / "src/main/scala/system", source / "system")
    shutil.copytree(sample / "src/main/scala/services/user", source / "services/user")
    text = (ROOT / "references/backend-patterns.md").read_text()
    blocks = re.findall(r"`(services/[^`]+\.scala)`[^\n]*\n\n```scala\n(.*?)\n```", text, re.S)
    for path, body in blocks:
        write(source, path, body)
    # The three documented base traits, each in its own file.
    trait_blocks = [body for body in re.findall(r"```scala\n(.*?)\n```", text, re.S)
                    if body.startswith("package services.system.api\n")]
    for body in trait_blocks:
        match = re.search(r"trait (\w+)", body)
        if match is None:
            raise ValueError("API trait missing")
        write(source, f"services/system/api/{match.group(1)}.scala", body)
    # Adapt the real sample registrar namespace to the documented system ownership.
    registrar = (sample / "src/main/scala/system/api/APIMessage.scala").read_text()
    registrar = registrar.replace("package system.api", "package services.system.api", 1)
    prefix = registrar[:registrar.index("trait APIMessage[")]
    declarations = registrar[registrar.index("final case class RegisteredAPIMessage"):]
    start, end = declarations.index("object APIMessage:"), declarations.index("object RegisteredAPIMessage:")
    companion = declarations[start:end]
    base = source / "services/system/api/APIMessage.scala"
    base.write_text(base.read_text() + "\n" + companion)
    write(source, "services/system/api/RegisteredAPIMessage.scala", prefix + declarations[:start] + declarations[end:])
    style = (ROOT / "references/scala-style.md").read_text()
    style_blocks = re.findall(r"```scala\n(.*?)\n```", style, re.S)
    for index, body in enumerate(style_blocks, 1):
        write(source, f"examples/style/Example{index}.scala", "package examples.style\n\n" + body)
    shutil.copy2(ROOT / "tests/scala-example-check.scala", source / "ScalaExampleCheck.scala")
    classes = work / "classes"
    classes.mkdir()
    compiler_cp, dependencies = compiler_file.read_text().strip(), dependencies_file.read_text().strip()
    run([str(java.resolve()), "-Xmx1g", "-cp", compiler_cp, "dotty.tools.dotc.Main",
         "-classpath", dependencies, "-d", str(classes), *map(str, sorted(source.rglob("*.scala")))], work)
    run([str(java.resolve()), "-cp", str(classes) + ":" + dependencies, "examples.ScalaExampleCheck"], work)
    print(f"PASS: {len(blocks)} backend examples, {len(trait_blocks)} API traits, {len(style_blocks)} Scala style blocks")
    print("Scope: adapted real sample dependencies + JDBC proxy; no real HTTP authentication or database service test")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--node-modules", type=Path)
    parser.add_argument("--java", type=Path)
    parser.add_argument("--compiler-classpath", type=Path, help="file containing compiler JVM classpath")
    parser.add_argument("--scala-classpath", type=Path, help="file containing Scala application dependency classpath")
    parser.add_argument("--sample-backend", type=Path)
    args = parser.parse_args()
    scala_args = (args.java, args.compiler_classpath, args.scala_classpath, args.sample_backend)
    if any(scala_args) and not all(scala_args):
        parser.error("all four Scala options must be supplied together")
    if args.node_modules is None and not all(scala_args):
        parser.error("provide existing frontend dependencies and/or the four Scala options")
    with tempfile.TemporaryDirectory(prefix="course-v2-examples-") as temporary:
        base = Path(temporary)
        if args.node_modules:
            front = base / "frontend"
            front.mkdir()
            frontend(front, args.node_modules)
        if all(scala_args):
            back = base / "backend"
            back.mkdir()
            scala(back, *scala_args)


if __name__ == "__main__":
    main()
