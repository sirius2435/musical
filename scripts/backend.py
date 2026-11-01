"""Local cached toolchain runner. Standard `sbt run` also supported from backend/."""
from pathlib import Path
import subprocess,sys,os
root=Path(__file__).resolve().parents[1]
tools=root.parent/'homework2/.tools'
java=tools/'jdk-17.0.21+9/bin/java'
export=root.parent/'homework2/backend/target/streams/compile/dependencyClasspath/_global/streams/export'
if not java.exists() or not export.exists():
 raise SystemExit('Run sbt run from backend/ with JDK 17+ and sbt installed, or provide the existing coursework tool cache.')
deps=export.read_text().strip()
cache=tools/'coursier-cache'
names=['scala3-compiler_3-3.3.3.jar','scala3-interfaces-3.3.3.jar','tasty-core_3-3.3.3.jar','scala-asm-9.5.0-scala-1.jar','compiler-interface-1.9.3.jar','util-interface-1.9.2.jar']
compiler=':'.join(str(next(cache.rglob(n))) for n in names)+':'+deps
out=root/'backend/target/local-classes';out.mkdir(parents=True,exist_ok=True)
sources=list((root/'backend/src/main/scala').rglob('*.scala'))
if '--test' in sys.argv:sources+=list((root/'backend/src/test/scala').rglob('*.scala'))
subprocess.run([str(java),'-Xmx1g','-cp',compiler,'dotty.tools.dotc.Main','-classpath',deps,'-d',str(out),*map(str,sources)],check=True)
if '--test' in sys.argv:
 subprocess.run([str(java),'-cp',str(out)+':'+deps,'services.user.api.SecurityChecks'],cwd=root/'backend',check=True)
elif '--compile-only' not in sys.argv:
 subprocess.run([str(java),'-cp',str(out)+':'+deps,'services.system.api.Main'],cwd=root/'backend',check=True,env=os.environ)
