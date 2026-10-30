"""For every sentence, search only the OTHER languages and check whether
its translation is ranked first (P@1) or in the top 3 (P@3)."""
import numpy as np
import config
from engine import Engine

e = Engine()
Q = e._encode([i["text"] for i in e.items], config.QUERY_PREFIX)
langs = np.array([i["lang"] for i in e.items])
gids = np.array([i["gid"] for i in e.items])

print(f"{'query -> target':<16}{'P@1':>8}{'P@3':>8}")
for ql in ("en", "hi", "te"):
    for tl in ("en", "hi", "te"):
        if ql == tl:
            continue
        qi, ti = np.where(langs == ql)[0], np.where(langs == tl)[0]
        order = np.argsort(-(Q[qi] @ e.emb[ti].T), axis=1)
        p1 = np.mean(gids[ti][order[:, 0]] == gids[qi])
        p3 = np.mean([gids[qi][k] in gids[ti][order[k, :3]] for k in range(len(qi))])
        print(f"{ql + ' -> ' + tl:<16}{p1*100:7.1f}%{p3*100:7.1f}%")