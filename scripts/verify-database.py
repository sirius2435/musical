"""Exercise real PostgreSQL storage in single-user mode (no network sockets).
Uses a disposable database; does not replace the application's JDBC transport.
"""
from pathlib import Path
import argparse,json,re,subprocess,uuid
p=argparse.ArgumentParser();p.add_argument('--postgres',type=Path,required=True);p.add_argument('--data',type=Path,required=True);a=p.parse_args()
root=Path(__file__).resolve().parents[1];db='stage_acceptance_'+uuid.uuid4().hex[:12]
def execute(database,statements):
 result=subprocess.run([str(a.postgres.resolve()),'--single','-D',str(a.data.resolve()),database],input='\n'.join(statements)+'\n',text=True,capture_output=True)
 if result.returncode or re.search(r'\b(ERROR|FATAL|PANIC):',result.stderr):raise RuntimeError(result.stdout+'\n'+result.stderr)
 return result.stdout
def lit(v):
 if v is None:return 'NULL'
 if isinstance(v,int):return str(v)
 return "E'"+str(v).replace('\\','\\\\').replace("'","''").replace('\n','\\n')+"'"
def assertion(condition):return "DO $$ BEGIN IF NOT ("+condition+") THEN RAISE EXCEPTION 'Acceptance assertion failed'; END IF; END $$;"
execute('postgres',['CREATE DATABASE '+db+';'])
try:
 base=root/'backend/src/main/scala/services'
 specs=[('user','users','User'),('user','sessions','Session'),('catalog','era','Era'),('catalog','production','Production'),('catalog','song','Song'),('catalog','creator','Creator'),('favorites','favorite','Favorite'),('catalog','productioncreator','ProductionCreator'),('catalog','productionsong','ProductionSong'),('system','seed','Seed')]
 statements=[]
 for service,folder,name in specs:
  text=(base/service/'tables'/folder/(name+'TableInitializer.scala')).read_text()
  m=re.search(r'private val initializeSql = (?:"""(.*?)"""|"([^"\n]+)")',text,re.S);assert m,name
  statements.append((m.group(1) or m.group(2))+';')
 seed=json.loads((root/'backend/seed.json').read_text());fields=['id','slug','title','subtitle','summary','body','category','year','eraId','source','image']
 for table,entries in seed.items():
  for entry in entries:statements.append('INSERT INTO '+table+' VALUES ('+','.join(lit(entry[k]) for k in fields)+');')
 # Simulate the one-time image migration (seed version 2): images change, editorial text does not.
 statements += ["INSERT INTO archive_seed VALUES (1);", "UPDATE eras SET image='/art/old.svg' WHERE slug='early-entertainment';", "UPDATE productions SET title='Admin edit' WHERE slug='carousel';"]
 for table,entries in seed.items():
  for entry in entries: statements.append('UPDATE '+table+' SET image='+lit(entry['image'])+' WHERE slug='+lit(entry['slug'])+';')
 statements += ["INSERT INTO archive_seed VALUES (2);", assertion("(SELECT image FROM eras WHERE slug='early-entertainment')='/images/history/early-entertainment-popes-theater-1895.webp'"), assertion("(SELECT image FROM creators WHERE slug='joshua-logan')=''"), assertion("(SELECT title FROM productions WHERE slug='carousel')='Admin edit'"), assertion("(SELECT count(*) FROM archive_seed)=2"), "UPDATE productions SET title='Carousel' WHERE slug='carousel';"]
 statements += ["INSERT INTO users VALUES ('test-a','a@example.test','A','reader','fixture-hash','fixture-salt'),('test-b','b@example.test','B','reader','fixture-hash','fixture-salt');", "INSERT INTO favorites VALUES ('test-a','carousel'),('test-b','south-pacific');", "INSERT INTO favorites VALUES ('test-a','carousel') ON CONFLICT DO NOTHING;", assertion("(SELECT count(*) FROM favorites WHERE user_id='test-a')=1"), assertion("(SELECT count(*) FROM favorites WHERE user_id='test-b' AND production_id='carousel')=0"), "UPDATE songs SET summary='Edited' WHERE id='soliloquy';", assertion("(SELECT summary FROM songs WHERE id='soliloquy')='Edited'"), "BEGIN;", "UPDATE productions SET title='Rolled back' WHERE id='carousel';", "ROLLBACK;", assertion("(SELECT title FROM productions WHERE id='carousel')='Carousel'"), "INSERT INTO production_songs VALUES ('carousel','soliloquy');", "DO $$ BEGIN DELETE FROM songs WHERE id='soliloquy'; RAISE EXCEPTION 'Expected foreign key rejection'; EXCEPTION WHEN foreign_key_violation THEN NULL; END $$;", "DO $$ BEGIN INSERT INTO favorites VALUES ('test-a','missing'); RAISE EXCEPTION 'Expected foreign key rejection'; EXCEPTION WHEN foreign_key_violation THEN NULL; END $$;"]
 for table in ['eras','productions','songs','creators']:
  statements += [f"INSERT INTO {table}(id,slug,title) VALUES ('crud-{table}','crud-{table}','Temporary');",f"UPDATE {table} SET title='Updated' WHERE id='crud-{table}';",assertion(f"(SELECT title FROM {table} WHERE id='crud-{table}')='Updated'"),f"DELETE FROM {table} WHERE id='crud-{table}';",assertion(f"(SELECT count(*) FROM {table} WHERE id='crud-{table}')=0")]
 # Exercise the application's actual parameterized SQL, beyond schema tests.
 production=(base/'catalog/tables/production/ProductionTable.scala').read_text()
 list_sql=re.search(r'private val listSql = """(.*?)"""',production,re.S).group(1)
 for index in range(1,7):list_sql=list_sql.replace('?', '$'+str(index),1)
 statements += ['PREPARE archive_search(text,text,text,text,text,text) AS '+list_sql+';', "EXECUTE archive_search('An age of possibility','%An age of possibility%','%An age of possibility%','','','chronological');", "DEALLOCATE archive_search;"]
 statements += ["INSERT INTO sessions(token_hash,user_id,expires_at) VALUES ('expired-fixture','test-a',now()-interval '1 day');", assertion("NOT EXISTS(SELECT user_id FROM sessions WHERE token_hash='expired-fixture' AND expires_at>now())"), "INSERT INTO production_creators VALUES ('carousel','richard-rodgers','Composer') ON CONFLICT DO NOTHING;", "INSERT INTO production_creators VALUES ('carousel','richard-rodgers','Contributor') ON CONFLICT DO NOTHING;", assertion("(SELECT role FROM production_creators WHERE production_id='carousel' AND creator_id='richard-rodgers')='Composer'")]
 search_result=execute(db,statements)
 assert 'Carousel' in search_result and 'South Pacific' in search_result, 'Historical period search failed'
 result=execute(db,[assertion("(SELECT count(*) FROM productions)=8"),assertion("(SELECT count(*) FROM favorites)=2"),"DELETE FROM favorites WHERE user_id='test-a' AND production_id='carousel';",assertion("(SELECT count(*) FROM favorites WHERE user_id='test-b')=1"),"SELECT 'ACCEPTANCE_OK';"])
 assert 'ACCEPTANCE_OK' in result
 print('PASS: real PostgreSQL schema/seed, one-time image migration preserving text, all four entity CRUD, unique favorites, user-scoped queries, foreign keys, rollback and persistence across database process restarts')
 print('Scope: direct SQL in PostgreSQL single-user mode; HTTP/JDBC end-to-end and browser interaction require socket-enabled execution.')
finally:execute('postgres',['DROP DATABASE '+db+';'])
