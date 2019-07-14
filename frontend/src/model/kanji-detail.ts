import { Sentence } from './sentence';

export class KanjiDetail
{
    character: string;
    readings: string[];
    sentences: Sentence[];
    meanings: string[];
    jigen: Sentence;
}