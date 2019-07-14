export class Sentence
{
    kanji: string;
    
    splitKanjiText: string[];
    kanaText: string;
    englishText: string;

    get kanjiText(): string
    {
        return this.splitKanjiText.join("")
    };
}