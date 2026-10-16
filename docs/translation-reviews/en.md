# English translation review

Review of `content/en.json` (724 messages), translated from `content/pt.json` with Gemini by Dan on 2026-10-16.

## Summary

| | Messages |
| --- | --- |
| Checked | 724 |
| Fixed | 21 |
| Open | 0 (one style note below) |

- **Structure:** every message has the same id, order, fields, book, chapter, author, signature and link as the Portuguese, the same number of paragraphs, and a note only where the original has one. No problems.
- **Epigraphs:** 21 opening Bible quotes were fixed by hand: 10 left in Portuguese, 1 partly in Portuguese, 6 expanded into the full verse, 2 much wordier than the original, and 2 with the book name in Portuguese (Hebreus). On the file as Gemini wrote it, the automatic check in [scripts/check-translations.ts](../../scripts/check-translations.ts) finds 18 of them; reading found the other 3 (1150, which was Portuguese worded differently from the original, and the two book names).
- **Style note, not fixed:** Bible references are written in two ways, "(John, 16:32)" in 644 messages and "(Romans 14:6)" in 70. Both read fine; they can be made uniform later if wanted.

## Fixes

### [848 Spiritual Mastery](https://fonteviva.org/caminho-verdade-e-vida/dominio-espiritual/)

Problem: epigraph expanded into the full Bible verse (fixed in #41).

- Portuguese: “Não estou só, porque o Pai está comigo.” — JESUS (João, 16.32)
- Before: “Indeed the hour is coming, yes, has now come, that you will be scattered, each to his own, and will leave Me alone. And yet I am not alone, because the Father is with Me.” — JESUS (John, 16:32)
- After: “I am not alone, because the Father is with Me.” — JESUS (John, 16:32)

### [871 The World and Evil](https://fonteviva.org/caminho-verdade-e-vida/o-mundo-e-o-mal/)

Problem: epigraph much longer and wordier than the Portuguese, reworded closer to the original (found by the check).

- Portuguese: “Não peço que os tires do mundo, mas que os livres do mal.” — JESUS (João, 17.15)
- Before: “I do not pray that You should take them out of the world, but that You should keep them from the evil one.” — JESUS (John, 17:15)
- After: “I do not ask that You take them out of the world, but that You deliver them from evil.” — JESUS (John, 17:15)

### [1020 Within the Struggle](https://fonteviva.org/fonte-viva/dentro-da-luta/)

Problem: epigraph much longer and wordier than the Portuguese, reworded closer to the original (found by the check).

- Portuguese: “Não peço para que os tires do mundo, mas que os livres do mal.” — JESUS (João, 17.15)
- Before: “I do not pray that You should take them out of the world, but that You should keep them from the evil one.” — JESUS (John, 17:15)
- After: “I do not ask that You take them out of the world, but that You deliver them from evil.” — JESUS (John, 17:15)

### [1074 Serve and March](https://fonteviva.org/fonte-viva/servir-e-marchar/)

Problem: epigraph has its book name in Portuguese (found by reading).

- Portuguese: “Portanto, tornai a levantar as mãos cansadas e os joelhos desconjuntados.” — PAULO (Hebreus, 12.12)
- Before: “Therefore strengthen the hands which hang down, and the feeble knees.” — PAUL (Hebreus, 12:12)
- After: “Therefore strengthen the hands which hang down, and the feeble knees.” — PAUL (Hebrews, 12:12)

### [1106 In Instrumentality](https://fonteviva.org/fonte-viva/na-instrumentalidade/)

Problem: epigraph expanded into the full Bible verse (fixed in #41).

- Portuguese: “Como se conhecerá o que se toca com a flauta ou com a cítara?” — PAULO (1 Coríntios, 14.7)
- Before: “Even things without life, whether flute or harp, when they make a sound, unless they make a distinction in the sounds, how will it be known what is piped or played?” — PAUL (1 Corinthians, 14:7)
- After: “How will it be known what is played on the flute or on the harp?” — PAUL (1 Corinthians, 14:7)

### [1150 The door](https://fonteviva.org/pao-nosso/a-porta/)

Problem: epigraph partly in Portuguese (fixed in #41).

- Portuguese: “Tornou, pois, Jesus a dizer-lhes: Em verdade vos digo que eu sou a porta das ovelhas.” — (JOÃO, 10.7)
- Before: “Jesus, pois, lhes disse outra vez: Em verdade, em verdade vos digo que eu sou a porta das ovelhas.” — (JOHN, 10.7)
- After: “Then Jesus said to them again: Truly I say to you, I am the door of the sheep.” — (JOHN, 10:7)

### [1171 Spiritual Nourishment](https://fonteviva.org/pao-nosso/nutricao-espiritual/)

Problem: epigraph has its book name in Portuguese (found by reading).

- Portuguese: “Bom é que o coração se fortifique com graça e não com manjares, que de nada aproveitaram aos que a eles se entregaram.” — PAULO (Hebreus, 13.9)
- Before: “It is good that the heart be established by grace, not with foods which have not profited those who have been occupied with them.” — PAUL (Hebreus 13:9)
- After: “It is good that the heart be established by grace, not with foods which have not profited those who have been occupied with them.” — PAUL (Hebrews 13:9)

### [1249 When You Pray](https://fonteviva.org/pao-nosso/quando-orardes/)

Problem: epigraph expanded into the full Bible verse (fixed in #41).

- Portuguese: “E, quando estiverdes orando, perdoai.” — JESUS (Marcos, 11.25)
- Before: “And whenever you stand praying, if you have anything against anyone, forgive him.” — JESUS (Mark, 11:25)
- After: “And whenever you stand praying, forgive.” — JESUS (Mark, 11:25)

### [1286 In spirit](https://fonteviva.org/pao-nosso/em-espirito/)

Problem: epigraph expanded into the full Bible verse (fixed in #41).

- Portuguese: “Mas, se pelo espírito mortificardes as obras da carne, vivereis.” — PAULO (Romanos, 8.13)
- Before: “For if you live according to the flesh you will die; but if by the Spirit you put to death the deeds of the body, you will live.” — PAUL (Romans, 8:13)
- After: “But if by the Spirit you put to death the deeds of the flesh, you will live.” — PAUL (Romans, 8:13)

### [1289 And the adulterer?](https://fonteviva.org/pao-nosso/e-o-adultero/)

Problem: epigraph expanded into the full Bible verse (fixed in #41).

- Portuguese: “E, pondo-a no meio, disseram-lhe: Mestre, está mulher foi apanhada, no próprio ato, adulterando.” — (JOÃO, 8.4)
- Before: “Then the scribes and Pharisees brought to Him a woman caught in adultery. And when they had set her in the midst, they said to Him, ‘Teacher, this woman was caught in adultery, in the very act.’” — (JOHN, 8:3-4)
- After: “And having set her in the midst, they said to Him: Master, this woman was caught in adultery, in the very act.” — (JOHN, 8:4)

### [1440 Free Church](https://fonteviva.org/vinha-de-luz/igreja-livre/)

Problem: epigraph left in Portuguese (fixed in #41).

- Portuguese: “Mas a Jerusalém que é de Cima, é livre, a qual é mãe de todos nós.” — PAULO (Gálatas, 4.26)
- Before: “Mas a Jerusalém que é de Cima, é livre, a qual é mãe de todos nós.” — PAULO (Gálatas, 4.26)
- After: “But the Jerusalem which is above is free, which is the mother of us all.” — PAUL (Galatians, 4:26)

### [1441 The Greatest](https://fonteviva.org/vinha-de-luz/maiorais/)

Problem: epigraph left in Portuguese, all but one word (found by the check).

- Portuguese: “E ele, assentando-se, chamou os doze e disse-lhes: Se alguém quiser ser o primeiro, será o último de todos e servo de todos.” — (MARCOS, 9.35)
- Before: “E he, assentando-se, chamou os doze e disse-lhes: Se alguém quiser ser o primeiro, será o último de todos e servo de todos.” — (MARCOS, 9.35)
- After: “And He sat down, called the twelve and said to them: If anyone wants to be first, he shall be last of all and servant of all.” — (MARK, 9:35)

### [1442 Do Not Withdraw](https://fonteviva.org/vinha-de-luz/nao-te-afastes/)

Problem: epigraph left in Portuguese (fixed in #41).

- Portuguese: “Mas livra-nos do mal.” — JESUS (Mateus, 6.13)
- Before: “Mas livra-nos do mal.” — JESUS (Mateus, 6.13)
- After: “But deliver us from evil.” — JESUS (Matthew, 6:13)

### [1443 Crises](https://fonteviva.org/vinha-de-luz/crises/)

Problem: epigraph left in Portuguese (fixed in #41).

- Portuguese: “Pai, salva-me desta hora; mas para isto vim a esta hora” — JESUS (João, 12.27)
- Before: “Pai, salva-me desta hora; mas para isto vim a esta hora” — JESUS (João, 12.27)
- After: “Father, save me from this hour; but for this purpose I came to this hour.” — JESUS (John, 12:27)

### [1444 Divine Politics](https://fonteviva.org/vinha-de-luz/politica-divina/)

Problem: epigraph left in Portuguese (fixed in #41).

- Portuguese: “Eu, porém, entre vós, sou como aquele que serve.” — JESUS (Lucas, 22.27)
- Before: “Eu, porém, entre vós, sou como aquele que serve.” — JESUS (Lucas, 22.27)
- After: “Yet I am among you as one who serves.” — JESUS (Luke, 22:27)

### [1445 What Do You Do That is Special?](https://fonteviva.org/vinha-de-luz/que-fazeis-de-especial/)

Problem: epigraph left in Portuguese (fixed in #41).

- Portuguese: “Que fazeis de especial?” — JESUS (Mateus, 5.47)
- Before: “Que fazeis de especial?” — JESUS (Mateus, 5.47)
- After: “What do you do more than others?” — JESUS (Matthew, 5:47)

### [1446 You Too](https://fonteviva.org/vinha-de-luz/tambem-tu/)

Problem: epigraph left in Portuguese (fixed in #41).

- Portuguese: “E os principais dos sacerdotes tomaram a deliberação de matar também a Lázaro.” — (JOÃO, 12.10)
- Before: “E os principais dos sacerdotes tomaram a deliberação de matar também a Lázaro.” — (JOÃO, 12.10)
- After: “But the chief priests resolved to put Lazarus to death as well.” — (JOHN, 12:10)

### [1447 Resistance to Evil](https://fonteviva.org/vinha-de-luz/resistencia-ao-mal/)

Problem: epigraph left in Portuguese (fixed in #41).

- Portuguese: “Eu, porém, vos digo que não resistais ao mal.” — JESUS (Mateus, 5.39)
- Before: “Eu, porém, vos digo que não resistais ao mal.” — JESUS (Mateus, 5.39)
- After: “But I tell you not to resist evil.” — JESUS (Matthew, 5:39)

### [1448 Physical Clashes](https://fonteviva.org/vinha-de-luz/atritos-fisicos/)

Problem: epigraph left in Portuguese (fixed in #41).

- Portuguese: “Mas se alguém te bater na face direita, oferece-lhe também a outra.” — JESUS (Mateus, 5.39)
- Before: “Mas se alguém te bater na face direita, oferece-lhe também a outra.” — JESUS (Mateus, 5.39)
- After: “But whoever strikes you on your right cheek, turn the other to him also.” — JESUS (Matthew, 5:39)

### [1449 Old Leaven](https://fonteviva.org/vinha-de-luz/fermento-velho/)

Problem: epigraph left in Portuguese (fixed in #41).

- Portuguese: “Alimpai-vos, pois, do fermento velho, para que sejais uma nova massa.” — PAULO (1 Coríntios, 5.7)
- Before: “Alimpai-vos, pois, do fermento velho, para que sejais uma nova massa.” — PAULO (1 Coríntios, 5.7)
- After: “Therefore purge out the old leaven, that you may be a new lump.” — PAUL (1 Corinthians, 5:7)

### [1466 Let Us Be Certain](https://fonteviva.org/vinha-de-luz/estejamos-certos/)

Problem: epigraph expanded into the full Bible verse (fixed in #41).

- Portuguese: “Porei minhas leis em seus corações e as escreverei em seus entendimentos.” — PAULO (Hebreus, 10.16)
- Before: “This is the covenant I will make with them after that time, says the Lord. I will put my laws in their hearts, and I will write them on their minds.” — PAUL (Hebrews, 10.16)
- After: “I will put my laws into their hearts, and in their minds I will write them.” — PAUL (Hebrews, 10:16)
