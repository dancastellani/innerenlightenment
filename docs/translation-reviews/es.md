# Spanish translation review

Review of `content/es.json` (724 messages), translated from `content/pt.json` with Gemini by Dan on 2026-10-16 (#33).

## Summary

| | Messages |
| --- | --- |
| Checked | 724 |
| Fixed | 21 |
| Open | 0 (one style note below) |

- **Structure:** every message has the same id, order, fields, book, chapter, author, signature and link as the Portuguese, the same number of paragraphs, and a note only where the original has one. No problems.
- **Found by the automatic check (11):** 8 epigraphs expanded into the full Bible verse, 2 epigraphs quoting a different passage or verse than the original (1092 and 1289), and 1 note left in Portuguese (1108).
- **Found by reading (10):** 9 references with the book name still in Portuguese (Mateus, Hebreus) and 1 Portuguese word in a verse (humildade).
- **Style note, not fixed:** verse numbers are written in two ways, "(Romanos, 14.6)" in 529 messages and "(Mateo, 28:19)" in 187. Both read fine; they can be made uniform later if wanted.

## Fixes

### [763 Examínate](https://fonteviva.org/caminho-verdade-e-vida/examina-te/)

Problem: epigraph has a Portuguese word, humildade (found by reading).

- Portuguese: “Nada faças por contenda ou por vanglória, mas por humildade.” — PAULO (Filipenses, 2.3)
- Before: “Nada hagáis por contienda o por vanagloria; antes bien con humildade.” — PABLO (Filipenses, 2.3)
- After: “Nada hagáis por contienda o por vanagloria; antes bien con humildad.” — PABLO (Filipenses, 2.3)

### [766 Esfuerzo y oración](https://fonteviva.org/caminho-verdade-e-vida/esforco-e-oracao/)

Problem: epigraph has its book name in Portuguese (found by reading).

- Portuguese: “E, despedida a multidão, subiu ao monte a fim de orar, à parte. E, chegada já a tarde, estava ali só.” — (MATEUS, 14:23)
- Before: “Despedida la multitud, subió al monte a orar a solas; y venido la noche, estaba allí solo.” — (MATEUS, 14.23)
- After: “Despedida la multitud, subió al monte a orar a solas; y venido la noche, estaba allí solo.” — (MATEO, 14.23)

### [839 Esperemos](https://fonteviva.org/caminho-verdade-e-vida/esperemos/)

Problem: epigraph has its book name in Portuguese (found by reading).

- Portuguese: “Não esmagará a cana quebrada e não apagará o morrão que fumega, até que faça triunfar o juízo.” — (MATEUS, 12.20)
- Before: “No quebrará la caña cascada, ni apagará el pábilo que humea, hasta que haga salir a victoria el juicio.” — (MATEUS, 12.20)
- After: “No quebrará la caña cascada, ni apagará el pábilo que humea, hasta que haga salir a victoria el juicio.” — (MATEO, 12.20)

### [929 Velar con Jesús](https://fonteviva.org/caminho-verdade-e-vida/velar-com-jesus/)

Problem: epigraph has its book name in Portuguese (found by reading).

- Portuguese: “E voltando para os seus discípulos, achou-os adormecidos e disse a Pedro: Então, nem uma hora pudeste velar comigo?” — (MATEUS, 26.40)
- Before: “Vino luego a sus discípulos, y los halló durmiendo, y dijo a Pedro: ¿Así no habéis podido velar conmigo una hora?” — (MATEUS, 26.40)
- After: “Vino luego a sus discípulos, y los halló durmiendo, y dijo a Pedro: ¿Así no habéis podido velar conmigo una hora?” — (MATEO, 26.40)

### [930 El fracaso de Pedro](https://fonteviva.org/caminho-verdade-e-vida/o-fracasso-de-pedro/)

Problem: epigraph has its book name in Portuguese (found by reading).

- Portuguese: “E Pedro o seguiu, de longe, até ao pátio do sumo-sacerdote e, entrando, assentou-se entre os criados para ver o fim.” — (MATEUS, 26.58)
- Before: “Y Pedro le siguió de lejos hasta el patio del sumo sacerdote; y entrando, se sentó con los criados, para ver el fin.” — (MATEUS, 26.58)
- After: “Y Pedro le siguió de lejos hasta el patio del sumo sacerdote; y entrando, se sentó con los criados, para ver el fin.” — (MATEO, 26.58)

### [969 Id y enseñad](https://fonteviva.org/fonte-viva/ir-e-ensinar/)

Problem: epigraph expanded into the full verse (found by the check).

- Portuguese: “Portanto, ide e ensinai” — JESUS (Mateus, 28.19)
- Before: “Por tanto, id, y haced discípulos a todas las naciones…” — JESÚS (Mateo, 28:19)
- After: “Por tanto, id y enseñad” — JESÚS (Mateo, 28:19)

### [987 Teniendo miedo…](https://fonteviva.org/fonte-viva/tendo-medo%c2%85/)

Problem: epigraph has its book name in Portuguese (found by reading).

- Portuguese: “E, tendo medo, escondi na terra o teu talento” — (Mateus, 25.25)
- Before: “Por lo cual tuve miedo, y escondí tu talento en la tierra…” — (Mateus, 25.25)
- After: “Por lo cual tuve miedo, y escondí tu talento en la tierra…” — (Mateo, 25.25)

### [1036 Riqueza para el Cielo](https://fonteviva.org/fonte-viva/riqueza-para-o-ceu/)

Problem: epigraph has its book name in Portuguese (found by reading).

- Portuguese: “Ajuntai tesouros no Céu” — JESUS (Mateus, 6.20)
- Before: “Haced os tesoros en el cielo…” — JESÚS (Mateus, 6.20)
- After: “Haced os tesoros en el cielo…” — JESÚS (Mateo, 6.20)

### [1044 La retribución](https://fonteviva.org/fonte-viva/a-retribuicao/)

Problem: epigraph expanded into the full verse, and its book name misspelled (found by the check).

- Portuguese: “Pedro disse-lhe: e nós que deixamos tudo e te seguimos, que receberemos?” — (MATEUS, 19.27)
- Before: “Entonces respondió Pedro, y le dijo: He aquí, nosotros hemos dejado todo, y te hemos seguido; ¿qué quedaremos recibiendo?” — (MATEOS, 19.27)
- After: “Pedro le dijo: Y nosotros, que lo hemos dejado todo y te hemos seguido, ¿qué recibiremos?” — (MATEO, 19.27)

### [1092 Soledad](https://fonteviva.org/fonte-viva/solidao/)

Problem: epigraph is a different, longer passage, and its book name is in Portuguese (found by the check).

- Portuguese: “O presidente, porém, disse: mas, que mal fez ele? E eles mais clamavam, dizendo: — seja crucificado.” — (Mateus, 27.23)
- Before: “Mas ellos volvieron a dar voces, diciendo: ¡Crucifícale! ¡Crucifícale! Pilato les dijo por tercera vez: ¿Pues qué mal ha hecho este? ... Mas ellos insitían a grandes voces, pidiendo que fuese crucificado.” — (Mateus, 27.23)
- After: “El gobernador, sin embargo, dijo: Pero, ¿qué mal ha hecho? Y ellos gritaban aún más, diciendo: ¡Sea crucificado!” — (Mateo, 27.23)

### [1106 En la instrumentalidad](https://fonteviva.org/fonte-viva/na-instrumentalidade/)

Problem: epigraph expanded into the full verse (found by the check).

- Portuguese: “Como se conhecerá o que se toca com a flauta ou com a cítara?” — PAULO (1 Coríntios, 14.7)
- Before: “Ciertamente las cosas sin vida que hacen sonidos, como la flauta o la citar, si no dieren distinción de voces, ¿cómo se sabrá lo que se toca con la flauta o con la cítara?” — PABLO (1 Corintios, 14:7)
- After: “¿Cómo se sabrá lo que se toca con la flauta o con la cítara?” — PABLO (1 Corintios, 14:7)

### [1108 ¿Estás enfermo?](https://fonteviva.org/fonte-viva/estas-doente/)

Problem: note left in Portuguese (found by the check).

- Portuguese: Essa mensagem foi publicada originalmente em 1950 pela  LAKE e é a 27.ª lição da 1.ªParte do livro “Nosso livro”
- Before: Esta mensagem foi publicada originalmente em 1950 pela LAKE e é a 27.ª lição da 1.ª Parte do livro “Nosso livro”
- After: Este mensaje fue publicado originalmente en 1950 por LAKE y es la 27.ª lección de la 1.ª Parte del libro “Nosso livro” (Nuestro libro).

### [1118 Más allá de los otros](https://fonteviva.org/fonte-viva/alem-dos-outros/)

Problem: epigraph has its book name in Portuguese (found by reading).

- Portuguese: “Não fazem os publicanos também o mesmo?” — JESUS (Mateus, 5.46)
- Before: “¿No hacen también así los publicanos?” — JESÚS (Mateus / Mateo, 5.46)
- After: “¿No hacen también así los publicanos?” — JESÚS (Mateo, 5.46)

### [1221 Pruebas de fuego](https://fonteviva.org/pao-nosso/provas-de-fogo/)

Problem: epigraph expanded into the full verse (found by the check).

- Portuguese: “E o fogo provará qual seja a obra de cada um.” — PAULO (1 Coríntios, 3.13)
- Before: “Y la obra de cada uno se hará manifiesta; porque el día la declarará, pues por el fuego será revelada; y la obra de cada uno cuál sea, el fuego la probará.” — PABLO (1 Corintios, 3.13)
- After: “Y el fuego probará cuál sea la obra de cada uno.” — PABLO (1 Corintios, 3.13)

### [1244 En preparación](https://fonteviva.org/pao-nosso/em-preparacao/)

Problem: epigraph expanded into the full verse (found by the check).

- Portuguese: “Diz o Senhor: Porei as minhas leis no seu entendimento e em seu coração as escreverei; e eu lhes serei por Deus e eles me serão por povo.” — PAULO (Hebreus, 8.10)
- Before: “Por lo cual, este es el pacto que haré con la casa de Israel después de aquellos días, dice el Señor: Pondré mis leyes en la mente de ellos, y sobre su corazón las escribiré; y seré a ellos por Dios, y ellos me serán por pueblo.” — PABLO (Hebreos, 8:10)
- After: “Dice el Señor: Pondré mis leyes en su entendimiento y en su corazón las escribiré; y yo seré su Dios y ellos serán mi pueblo.” — PABLO (Hebreos, 8:10)

### [1247 Buenas maneras](https://fonteviva.org/pao-nosso/boas-maneiras/)

Problem: epigraph expanded into the full verse (found by the check).

- Portuguese: “E assenta-te no último lugar.” — JESUS (Lucas, 14.10)
- Before: “Mas cuando fueres invitado, ve y siéntate en el último lugar.” — JESÚS (Lucas, 14:10)
- After: “Y siéntate en el último lugar.” — JESÚS (Lucas, 14:10)

### [1264 Lógica de la Providencia](https://fonteviva.org/pao-nosso/logica-da-providencia/)

Problem: epigraph expanded into the full verse (found by the check).

- Portuguese: “Depois que fostes iluminados, suportastes grande combate de aflições.” — PAULO (Hebreus, 10.32)
- Before: “Pero traed a la memoria los días pasados, en los cuales, después de haber sido iluminados, soportasteis gran combate de padecimientos”. — PABLO (Hebreos, 10.32)
- After: “Después de haber sido iluminados, soportasteis gran combate de aflicciones.” — PABLO (Hebreos, 10.32)

### [1289 ¿Y el adúltero?](https://fonteviva.org/pao-nosso/e-o-adultero/)

Problem: epigraph is a different verse (8:10-11 instead of 8:4) (found by the check).

- Portuguese: “E, pondo-a no meio, disseram-lhe: Mestre, está mulher foi apanhada, no próprio ato, adulterando.” — (JOÃO, 8.4)
- Before: “Enderezándola Jesús, y no viendo a nadie más que a la mujer, le dijo: Mujer, ¿dónde están los que te acusaban? ¿Ninguno te condenó? Ella dijo: Ninguno, Señor. Entonces Jesús le dijo: Ni yo te condeno; vete, y no peques más.” — (JUAN, 8:10-11)
- After: “Y, poniéndola en medio, le dijeron: Maestro, esta mujer ha sido sorprendida en el mismo acto de adulterio.” — (JUAN, 8:4)

### [1295 Eso es asunto tuyo](https://fonteviva.org/pao-nosso/isso-e-contigo/)

Problem: epigraph has its book name in Portuguese (found by reading).

- Portuguese: “E disse: Pequei, traindo o sangue inocente. Eles, porém, responderam: Que nos importa? Isso é contigo.” — (MATEUS, 27.4)
- Before: “Y dijo: Yo he pecado entregando sangre inocente. Mas ellos dijeron: ¿Qué nos importa a nosotros? ¡Allá tú!” — (MATEUS, 27.4)
- After: “Y dijo: Yo he pecado entregando sangre inocente. Mas ellos dijeron: ¿Qué nos importa a nosotros? ¡Allá tú!” — (MATEO, 27.4)

### [1340 Amargura](https://fonteviva.org/vinha-de-luz/amargura/)

Problem: epigraph has its book name in Portuguese (found by reading).

- Portuguese: “Tendo cuidado de que ninguém se prive da graça de Deus e de que nenhuma raiz de amargura, brotando, vos perturbe, e por ela muitos se contaminem.” — PAULO (Hebreus, 12.15)
- Before: “Mirad bien, no sea que alguno deje de alcanzar la gracia de Dios; que brotando alguna raíz de amargura, os turbe, y por ella muchos sean contaminados.” — PABLO (Hebreus [Hebreos], 12.15)
- After: “Mirad bien, no sea que alguno deje de alcanzar la gracia de Dios; que brotando alguna raíz de amargura, os turbe, y por ella muchos sean contaminados.” — PABLO (Hebreos, 12.15)

### [1389 Parecen, pero no son](https://fonteviva.org/vinha-de-luz/parecem-mas-nao-sao/)

Problem: epigraph expanded into the full verse (found by the check).

- Portuguese: “Mas quem não possui o espírito do Cristo, esse tal não é dele.” — PAULO (Romanos, 8.9)
- Before: “Mas vosotros no vivís según la carne, sino según el Espíritu, si es que el Espíritu de Dios mora en vosotros. Y si alguno no tiene el Espíritu de Cristo, el tal no es de él”. — PABLO (Romanos, 8:9)
- After: “Pero quien no tiene el espíritu de Cristo, ese no es de él.” — PABLO (Romanos, 8:9)
