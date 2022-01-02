export class ChoiceContainer
{
    private currentChoiceIdx = 0;
    private englishChoices: string[];
    private frencChoices: string[];
    private isEnglish = false;
    constructor(engChoices: string[], frChoices: string[])
    {
        this.englishChoices = engChoices;
        this.frencChoices = frChoices;
    }

    public setLangage(isEng: boolean): void
    {
        this.isEnglish = isEng;
    }

    public getCurrenthoice(): string
    {
        if (this.isEnglish)
        {
            return this.englishChoices[this.currentChoiceIdx];
        }
        else
        {
            return this.frencChoices[this.currentChoiceIdx];
        }
    }

    public getChoiceIndex(): number
    {
        return this.currentChoiceIdx;
    }

    public nextChoice(): void
    {
        ++this.currentChoiceIdx;
        this.currentChoiceIdx %= this.englishChoices.length;
    }
    public previousChoice(): void
    {
        --this.currentChoiceIdx;
        if (this.currentChoiceIdx < 0)
        {
            this.currentChoiceIdx += this.englishChoices.length;
        }
    }
}
