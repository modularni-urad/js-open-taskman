
Vedouci pracovnik musi mit moznost delegovat.
Ten, na koho to deleguje, to muze take delegovat. 
Ma ale stale zodpovednost za ukol a dodrzeni terminu.
Jen resitel je nekdo jiny a on ho ridi.

Na tasku ma pravo nastavovat prio, state pouze owner a to pouze,
kdyz neni stanoven jeste zadny solver.

Nebo: nastavovat ma pravo owner/solver svuj stack item 
a zmena se notifikuje dolu ve stacku.

## responsibility chain

solvers je JSON field = zasobnik, ktery obsahuje:
- idResitele
- status: pending, working, done
- duedate: deadline
- prio: priorita pro daneho resitele

### aktualni resitel - vrchol stacku
- Muze nastavit status sveho stacku:
  - pending => working: beru na vedomi, zacinam pracovat
  - working => done: mam hotovo
- Pridat do stacku dalsiho resitele, ale prebira zodpovednost za management toho ukolu a jeho vysledky do DL (+novy musi zase potvrdit)

---

open-taskman: k ukolu: annonci v urcity den

```
eval $(minikube -p minikube docker-env)
docker build . -f dev/Dockerfile -t modularniurad/taskman
kubectl apply -f dev/pod.yaml
```