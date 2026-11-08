# -*- coding: utf-8 -*-
"""Fresh install state with an invented profile and an invented breakfast."""
import time, droid as D
p = time.sleep
D.adb("shell", "pm", "clear", "dev.oscarnavarro.kawsay")
D.adb("shell", "monkey", "-p", "dev.oscarnavarro.kawsay", "-c", "android.intent.category.LAUNCHER", "1"); p(4)
D.tap("Usar sin cuenta"); p(1)
D.tap("Empezar", exact=True); p(1)
D.tap("Mujer", exact=True); D.tap("Siguiente", exact=True); p(0.8)
D.tap("Siguiente", exact=True); p(0.8)
D.tap("Siguiente", exact=True); p(0.8)
D.tap("Hígado", exact=True); D.tap("Siguiente", exact=True); p(0.8)
D.tap("Empezar a registrar", exact=True); p(2.5)
for q, pick in (("pan con huevo", "Pan con huevo"), ("papaya", "Jugo de papaya")):
    D.tap("Registrar", exact=True); p(1); D.tap("Comida", exact=True); p(1.2)
    D.tap("Agregar a Desayuno"); p(1)
    D.tap("Buscar plato"); D.type_text(q); p(1.2)
    D.tap(pick, exact=True); p(1)
    D.tap([x for x in D.texts() if x.startswith("Agregar 1")][0], exact=True); p(1.2)
D.tap("Hoy", exact=True); p(1)
print(D.texts()[:8])
