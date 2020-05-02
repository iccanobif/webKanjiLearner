import { Sentence } from './sentence';

export class Word {
    kanjiText: string
    frequency: number
    readings: string[]
}

export class KanjiDetail
{
    character: string;
    readings: string[];
    sentences: Sentence[];
    meanings: string[];
    jigen: Sentence;
    wordsFromExamples: Word[]
}