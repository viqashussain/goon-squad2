export interface Prediction {
    username: string;
    scorePrediction: string;
    points: number;
    fixture: object
}

export interface RawUserPrediction {
    id: string;
    fixtureId: number;
    home: number;
    away: number;
    user: string;
}