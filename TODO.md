- Fix sql injection problem.
- switch to another kanji -> kana library.
- Show only uninflected forms in the "Example words" list
- Improvements to splitter:
    - Maybe I could improve accuracy considering the kana versions of words that have kanji as "low priority" compared to purely kana ones
    - for example in 大きな蜘蛛が部屋にいるの！早く退治してちょうだい！, ni/iru/no should have priority compared to nii/ru/no because にい could have been 兄 (but what about stuff that has a kanji that's rarely used, like 只?)
Grammars to add:
っちゃう (informal て+しまう)
- For each conjugated word, keep the original string (be it with a kanji or not), needed to get the dictionary form of a word starting from its conjugated form
- Remove "kana" attribute to allSentences.csv
- Automate the generation of allSentences.csv from the tatoeba files

- Sentences that currently aren't properly split:
    - その男は頑としてその職にしがみつき、決して退職しようとはしなかった。
    - 証人が事実を隠せば刑法の罪に問われる。
    - 彼女の行動はしだいに攻撃的になってくるだろう。

- Conjugate vs-s verbs (面する->面した)
- Use re_restr to map each reading to the correct kanji form (test with この上なく)
- The code that calls edict.getReadings() from kanjiLearning.js is copy-pasted three times... Refactor that